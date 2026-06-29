/**
 * Globalny stan sterowania ambientem (Zustand) — współdzielony przez ekran
 * telefonu i scenę CarPlay. Każda akcja: aktualizuje stan, zapisuje ramkę BLE
 * i (gdy trzeba) utrwala ustawienie. Odpowiednik ViewModels/MainPageVM.cs.
 */
import { create } from 'zustand';
import { ble, ConnStatus, ScannedDevice } from '../ble/manager';
import {
  cmdBrightness,
  cmdColor,
  cmdInit,
  cmdPower,
  cmdSevenColorGradient,
  cmdSpeed,
  cmdThreeColorBreathe,
  RGB,
} from '../ble/constants';
import { persisted } from './persist';

export type AmbienteMode = 'color' | 'seven' | 'breathe';

interface State {
  status: ConnStatus;
  deviceName?: string;
  error?: string;
  devices: ScannedDevice[];

  power: boolean;
  color: RGB; // wartość wysyłana do taśmy (skalibrowana)
  displayColor: RGB; // kolor do UI (ładny na ekranie)
  brightness: number; // 10-100
  speed: number; // 10-100
  mode: AmbienteMode;

  // akcje
  connect: () => Promise<void>;
  connectTo: (id: string) => Promise<void>;
  disconnect: () => Promise<void>;
  setColor: (send: RGB, display?: RGB) => Promise<void>;
  setBrightness: (v: number) => Promise<void>;
  setSpeed: (v: number) => Promise<void>;
  togglePower: () => Promise<void>;
  setSevenGradient: () => Promise<void>;
  setBreathe: () => Promise<void>;
}

const DEFAULT_COLOR: RGB = [63, 169, 255]; // chłodny niebieski

export const useAmbiente = create<State>((set, get) => ({
  status: 'idle',
  devices: [],
  power: true,
  color: persisted.loadColor(DEFAULT_COLOR),
  displayColor: persisted.loadColor(DEFAULT_COLOR),
  brightness: persisted.loadBrightness(80),
  speed: persisted.loadSpeed(60),
  mode: 'color',

  connect: async () => {
    set({ error: undefined });
    // Skan/łączenie jest asynchroniczne — inicjalizacja po zdarzeniu 'connected'.
    ble.connect();
  },

  connectTo: async (id: string) => {
    set({ error: undefined });
    ble.connectId(id);
  },

  disconnect: async () => {
    await ble.disconnect();
  },

  setColor: async (send: RGB, display?: RGB) => {
    set({ color: send, displayColor: display ?? send, mode: 'color' });
    persisted.saveColor(send);
    await ble.write(cmdColor(send));
  },

  setBrightness: async (v: number) => {
    const value = Math.round(v);
    set({ brightness: value });
    persisted.saveBrightness(value);
    await ble.write(cmdBrightness(value));
  },

  setSpeed: async (v: number) => {
    const value = Math.round(v);
    set({ speed: value });
    persisted.saveSpeed(value);
    await ble.write(cmdSpeed(value));
  },

  togglePower: async () => {
    const next = !get().power;
    set({ power: next });
    await ble.write(cmdPower(next));
  },

  setSevenGradient: async () => {
    set({ mode: 'seven' });
    await ble.write(cmdSevenColorGradient());
  },

  setBreathe: async () => {
    set({ mode: 'breathe' });
    await ble.write(cmdThreeColorBreathe());
  },
}));

// Podpięcie zdarzeń menedżera BLE do stanu (status + błędy + lista urządzeń).
ble.onStatus((status: ConnStatus, deviceName?: string) => {
  useAmbiente.setState({ status, deviceName });

  // Po nawiązaniu połączenia: sekwencja inicjalizacji + zapamiętane ustawienia.
  if (status === 'connected') {
    const { color, brightness, speed } = useAmbiente.getState();
    (async () => {
      await ble.write(cmdInit());
      await ble.write(cmdBrightness(brightness));
      await ble.write(cmdSpeed(speed));
      await ble.write(cmdColor(color));
    })();
  }
});
ble.onError((message: string) => {
  useAmbiente.setState({ error: message });
});
ble.onDevices((devices: ScannedDevice[]) => {
  useAmbiente.setState({ devices });
});
