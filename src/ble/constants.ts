/**
 * Stałe GATT i protokół komend — przeniesione 1:1 z .NET MAUI:
 *   Constants/GattIdentifiers.cs + Communication/BLEConnection.cs
 *
 * Urządzenie: sterownik taśm LED "LEDCAR-" w Alfa Romeo.
 * Protokół: 9-bajtowe ramki zapisywane do charakterystyki UART (FFE1).
 */

import { Platform } from 'react-native';

export const DEVICE_NAME_PREFIX = 'LEDCAR-';

// Znany identyfikator urządzenia (z MAUI: GattIdentifiers.DeviceId).
// Na iOS to UUID peryferium CoreBluetooth (stabilny dla danego iPhone'a),
// więc można łączyć się bezpośrednio bez skanu. Na Androidzie brak — skanujemy.
// UUID potwierdzony skanerem BLE na tym iPhonie (wielkość liter ma znaczenie!).
export const KNOWN_DEVICE_ID: string | null =
  Platform.OS === 'ios' ? '82BF6ECB-F971-074D-D7B8-6F4D68BF0815' : null;

// Usługa UART i charakterystyka zapisu (te same UUID co w MAUI).
export const UART_SERVICE_UUID = '0000FFE0-0000-1000-8000-00805f9b34fb';
export const UART_WRITE_CHAR_UUID = '0000FFE1-0000-1000-8000-00805f9b34fb';

// Bajty stałe ramki
const START = 126; // 0x7E
const END = 239; // 0xEF
const FF = 255;

export type RGB = [number, number, number];

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.round(v)));

/** On/off: [126,255,4,(1|0),255,255,255,255,239] */
export const cmdPower = (on: boolean): number[] => [
  START, FF, 4, on ? 1 : 0, FF, FF, FF, FF, END,
];

/** Inicjalizacja urządzenia = power on (jak Initialize() w MAUI). */
export const cmdInit = (): number[] => cmdPower(true);

/** Jasność 0-100: [126,255,1,v,0,255,255,255,239] */
export const cmdBrightness = (value: number): number[] => [
  START, FF, 1, clamp(value, 0, 100), 0, FF, FF, FF, END,
];

/** Prędkość animacji 0-100: [126,255,2,v,0,255,255,255,239] */
export const cmdSpeed = (value: number): number[] => [
  START, FF, 2, clamp(value, 0, 100), 0, FF, FF, FF, END,
];

/** Kolor RGB: [126,255,5,3,R,G,B,255,239] (9 bajtów — dokładnie jak w MAUI). */
export const cmdColor = ([r, g, b]: RGB): number[] => [
  START, FF, 5, 3, clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), FF, END,
];

/** Gradient 7-kolorowy (tęcza): [126,255,3,138,3,255,255,255,239] */
export const cmdSevenColorGradient = (): number[] => [
  START, FF, 3, 138, 3, FF, FF, FF, END,
];

/** Tryb „Oddech" — 3-kolorowe oddychanie: [126,255,3,137,3,255,255,255,239] */
export const cmdThreeColorBreathe = (): number[] => [
  START, FF, 3, 137, 3, FF, FF, FF, END,
];
