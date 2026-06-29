/**
 * Trwałe ustawienia (odpowiednik SecureStorage z MAUI: ambiente_brightness/speed/color).
 */
import { createMMKV } from 'react-native-mmkv';
import type { RGB } from '../ble/constants';

const storage = createMMKV({ id: 'ambiente' });

const K_BRIGHTNESS = 'ambiente_brightness';
const K_SPEED = 'ambiente_speed';
const K_COLOR = 'ambiente_color';
const K_DEVICE_ID = 'ambiente_device_id';

export const persisted = {
  loadBrightness: (fallback: number) =>
    storage.getNumber(K_BRIGHTNESS) ?? fallback,
  saveBrightness: (v: number) => storage.set(K_BRIGHTNESS, v),

  loadSpeed: (fallback: number) => storage.getNumber(K_SPEED) ?? fallback,
  saveSpeed: (v: number) => storage.set(K_SPEED, v),

  loadColor: (fallback: RGB): RGB => {
    const raw = storage.getString(K_COLOR);
    if (!raw) return fallback;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length === 3) return arr as RGB;
    } catch {
      /* ignorujemy */
    }
    return fallback;
  },
  saveColor: (rgb: RGB) => storage.set(K_COLOR, JSON.stringify(rgb)),

  // Samouczące się ID urządzenia — zapisane po pierwszym udanym połączeniu
  // (CoreBluetooth UUID jest per-telefon, więc uczymy go z tego iPhone'a).
  loadDeviceId: (): string | null => storage.getString(K_DEVICE_ID) ?? null,
  saveDeviceId: (id: string) => storage.set(K_DEVICE_ID, id),
};
