/**
 * Niskopoziomowy menedżer BLE — odpowiednik
 * Services/BluetoothScanerService.cs + Communication/BLEConnection.cs z MAUI.
 *
 * Odpowiada za: skan urządzenia "LEDCAR-", połączenie, wykrycie charakterystyki
 * zapisu (FFE1), zapis ramek komend oraz wykrycie utraty połączenia.
 * Nie zna UI — komunikuje się przez callbacki (status/błąd), które podpina store.
 */
import { Platform, PermissionsAndroid } from 'react-native';
import {
  BleManager,
  Characteristic,
  Device,
  State,
  Subscription,
} from 'react-native-ble-plx';
import {
  DEVICE_NAME_PREFIX,
  KNOWN_DEVICE_ID,
  UART_SERVICE_UUID,
  UART_WRITE_CHAR_UUID,
} from './constants';
import { bytesToBase64 } from './base64';
import { persisted } from '../store/persist';

export type ConnStatus =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'bluetoothOff';

export type ScannedDevice = { id: string; name: string; rssi: number };

type StatusListener = (status: ConnStatus, deviceName?: string) => void;
type ErrorListener = (message: string) => void;
type DevicesListener = (devices: ScannedDevice[]) => void;

const SCAN_TIMEOUT_MS = 10000;

class AmbienteBle {
  private manager = new BleManager();
  private device: Device | null = null;
  private writeChar: Characteristic | null = null;
  private writeCharFound = false;
  private disconnectSub: Subscription | null = null;
  private statusListeners = new Set<StatusListener>();
  private errorListeners = new Set<ErrorListener>();
  private devicesListeners = new Set<DevicesListener>();
  private discovered = new Map<string, ScannedDevice>();
  private scanTimer: ReturnType<typeof setTimeout> | null = null;

  onStatus(fn: StatusListener) {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }
  onError(fn: ErrorListener) {
    this.errorListeners.add(fn);
    return () => this.errorListeners.delete(fn);
  }
  onDevices(fn: DevicesListener) {
    this.devicesListeners.add(fn);
    return () => this.devicesListeners.delete(fn);
  }
  private emitDevices() {
    const list = [...this.discovered.values()].sort((a, b) => b.rssi - a.rssi);
    this.devicesListeners.forEach(fn => fn(list));
  }
  private emit(status: ConnStatus, name?: string) {
    this.statusListeners.forEach(fn => fn(status, name));
  }
  private fail(msg: string) {
    this.errorListeners.forEach(fn => fn(msg));
  }

  get isConnected() {
    return !!this.device && this.writeCharFound;
  }

  /** Uprawnienia BLE na Androidzie 12+ (SCAN/CONNECT) i lokalizacja na starszych. */
  private async ensureAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    const api = Platform.Version as number;
    try {
      if (api >= 31) {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return Object.values(res).every(v => v === 'granted');
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === 'granted';
    } catch {
      return false;
    }
  }

  /** Pełny przebieg: uprawnienia → stan BT → skan → połączenie → init. */
  async connect(): Promise<void> {
    const ok = await this.ensureAndroidPermissions();
    if (!ok) {
      this.emit('error');
      this.fail('Brak uprawnień Bluetooth.');
      return;
    }

    const state = await this.manager.state();
    if (state !== State.PoweredOn) {
      this.emit('bluetoothOff');
      this.fail('Bluetooth wyłączony.');
      return;
    }

    // 1) Szybka ścieżka: bezpośrednie łączenie po znanym/nauczonym UUID.
    const learned = persisted.loadDeviceId();
    const candidates = [learned, KNOWN_DEVICE_ID].filter(
      (id, i, arr): id is string => !!id && arr.indexOf(id) === i,
    );
    for (const id of candidates) {
      try {
        this.emit('connecting');
        const dev = await this.manager.connectToDevice(id, { timeout: 6000 });
        if (await this.setupDevice(dev)) return;
        await this.manager.cancelDeviceConnection(dev.id).catch(() => {});
      } catch {
        // poza zasięgiem / inny telefon → spróbujemy skanu po nazwie
      }
    }

    // 2) Skan po nazwie "LEDCAR-" — zbiera wszystkie taśmy i łączy z pierwszą.
    this.startScan(true);
  }

  /**
   * Skan po nazwie "LEDCAR-". Zbiera urządzenia do listy wyboru (picker).
   * @param autoConnectFirst gdy true — łączy automatycznie z pierwszą taśmą.
   */
  startScan(autoConnectFirst = false): void {
    this.stopScan();
    this.discovered.clear();
    this.emitDevices();
    this.emit('scanning');
    const learned = persisted.loadDeviceId();
    let connecting = false;

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        this.emit('error');
        this.fail('Błąd skanowania.');
        return;
      }
      if (!device?.name || !device.name.startsWith(DEVICE_NAME_PREFIX)) return;

      if (!this.discovered.has(device.id)) {
        this.discovered.set(device.id, {
          id: device.id,
          name: device.name,
          rssi: device.rssi ?? -100,
        });
        this.emitDevices();
      }

      // auto-połączenie: nauczone urządzenie lub pierwsza znaleziona taśma
      if (!connecting && (device.id === learned || autoConnectFirst)) {
        connecting = true;
        this.connectId(device.id);
      }
    });

    this.scanTimer = setTimeout(() => {
      this.manager.stopDeviceScan();
      if (!this.isConnected && !connecting) {
        if (this.discovered.size === 0) {
          this.emit('error');
          this.fail('Nie znaleziono taśmy LEDCAR w pobliżu.');
        } else {
          this.emit('idle'); // są urządzenia — pokaż listę do wyboru
        }
      }
    }, SCAN_TIMEOUT_MS);
  }

  stopScan(): void {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    this.manager.stopDeviceScan();
  }

  /** Połączenie z konkretnym urządzeniem (z listy lub po znanym ID). */
  async connectId(id: string): Promise<void> {
    this.stopScan();
    try {
      this.emit('connecting');
      const dev = await this.manager.connectToDevice(id, { timeout: 8000 });
      await this.setupDevice(dev);
    } catch (e: any) {
      this.emit('error');
      this.fail(`Błąd połączenia: ${e?.message ?? e}`);
    }
  }

  /** Po nawiązaniu połączenia: wykrycie usług, charakterystyki zapisu, podpięcie. */
  private async setupDevice(dev: Device): Promise<boolean> {
    await dev.discoverAllServicesAndCharacteristics();

    const services = await dev.services();
    const uart = services.find(
      s => s.uuid.toLowerCase() === UART_SERVICE_UUID.toLowerCase(),
    );
    const chars = uart ? await uart.characteristics() : [];
    const writeChar = chars.find(
      c => c.uuid.toLowerCase() === UART_WRITE_CHAR_UUID.toLowerCase(),
    );
    if (!writeChar) {
      this.emit('error');
      this.fail('Urządzenie nie udostępnia charakterystyki sterującej.');
      return false;
    }

    // Diagnostyka: jakie metody zapisu wspiera charakterystyka.
    // eslint-disable-next-line no-console
    console.log(
      '[BLE] FFE1 writeWithResponse=',
      writeChar.isWritableWithResponse,
      'writeWithoutResponse=',
      writeChar.isWritableWithoutResponse,
    );

    this.device = dev;
    this.writeChar = writeChar;
    this.writeCharFound = true;
    this.subscribeDisconnect(dev);
    // Zapamiętaj ID potwierdzonego LEDCAR na tym telefonie (szybsze kolejne łączenie).
    persisted.saveDeviceId(dev.id);
    this.emit('connected', dev.name ?? undefined);
    return true;
  }

  private subscribeDisconnect(dev: Device) {
    this.disconnectSub?.remove();
    this.disconnectSub = this.manager.onDeviceDisconnected(dev.id, () => {
      this.device = null;
      this.writeChar = null;
      this.writeCharFound = false;
      this.emit('error');
      this.fail('Utracono połączenie z urządzeniem.');
    });
  }

  /** Zapis ramki komendy (tablica bajtów → base64 → write). */
  async write(bytes: number[]): Promise<void> {
    const ch = this.writeChar;
    if (!ch) return;
    const payload = bytesToBase64(bytes);
    try {
      // Preferuj zapis bez potwierdzenia (typowy dla sterowników HM-10);
      // gdy niedostępny — z potwierdzeniem.
      if (ch.isWritableWithoutResponse) {
        await ch.writeWithoutResponse(payload);
      } else {
        await ch.writeWithResponse(payload);
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log('[BLE] write error', e?.message ?? e);
      this.fail(`Błąd zapisu: ${e?.message ?? e}`);
    }
  }

  async disconnect(): Promise<void> {
    this.disconnectSub?.remove();
    this.disconnectSub = null;
    if (this.device) {
      try {
        await this.manager.cancelDeviceConnection(this.device.id);
      } catch {
        /* ignorujemy */
      }
    }
    this.device = null;
    this.writeCharFound = false;
    this.emit('idle');
  }
}

// Singleton — współdzielony przez ekran telefonu i scenę CarPlay (jeden proces JS).
export const ble = new AmbienteBle();
