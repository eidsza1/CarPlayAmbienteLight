# Alfa Romeo Ambiente Light (CarPlay)

Aplikacja **React Native** sterująca taśmami LED **LEDCAR** w Alfa Romeo przez **Bluetooth LE**, z integracją **Apple CarPlay**. Protokół sterownika odtworzony przez analizę pakietów BLE; własny, lekki interfejs na telefon i ekran auta.

## Funkcje

### Telefon (iOS)
- Ciemny, „kosmiczny" UI: glow, glassmorphism, zdjęcie wnętrza Alfy w tle
- **BLE**: skan po nazwie `LEDCAR-`, lista wyboru urządzeń, auto-połączenie, zapamiętywanie urządzenia
- **Kolory**: presety (checkboxy) + suwak barw; **jasność** i **prędkość** (suwaki); **power**; tryby **7 kolorów** i **Oddech**
- Kalibracja kolorów pod realny render taśmy; zapis komend bez potwierdzenia
- Persystencja ustawień (MMKV): kolor, jasność, prędkość
- Własna ikona AR + splash

### CarPlay (entitlement `carplay-driving-task`)
- Zakładki **Lista** / **Siatka** / **Sterowanie**
- Lista: kolory z checkboxami (glow) i opisami; tryby z opisem działania
- Siatka: duże checkboxy na tle wnętrza
- Sterowanie: **Power** (w kolorze wybranego presetu / szary gdy wył.), **Jasność +/−**, **Prędkość** Wolno/Średnio/Szybko (ikony w stylu obrotomierza)
- Wspólny stan (store) z aplikacją telefonu

> CarPlay przy `driving-task` korzysta wyłącznie z szablonów (Grid/List/TabBar) — własny, dowolny UI wymaga entitlementu `carplay-maps`/`communication`.

## Stos
React Native 0.86 (New Architecture) · TypeScript · `react-native-ble-plx` · `react-native-carplay` · Zustand · MMKV · Reanimated · Gesture Handler · SVG

## Uruchomienie (dev)
```sh
npm install            # patche react-native-carplay nakładane automatycznie (patch-package)
cd ios && pod install && cd ..
npm start              # Metro
npm run ios            # telefon/symulator
```
CarPlay na symulatorze: **Simulator → I/O → External Displays → CarPlay**. BLE działa tylko na fizycznym urządzeniu.

## Patche
`patches/react-native-carplay+2.4.1-beta.0.patch` naprawia `resolveAssetSource` (RN 0.86) oraz honorowanie `accessoryImage` w `parseListItems`. Nakładane przez `postinstall: patch-package`.
