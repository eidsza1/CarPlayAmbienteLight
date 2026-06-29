/**
 * Minimalny enkoder bajtów → base64.
 * react-native-ble-plx zapisuje wartości charakterystyk jako stringi base64,
 * a React Native nie ma natywnego Buffer/btoa dla danych binarnych.
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] & 0xff;
    const b1 = i + 1 < bytes.length ? bytes[i + 1] & 0xff : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] & 0xff : 0;

    out += CHARS[b0 >> 2];
    out += CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? CHARS[b2 & 0x3f] : '=';
  }
  return out;
}
