/**
 * System designu — ciemny, kosmiczny motyw automotive.
 * Inspiracja: ekrany infotainment (głęboki granat→czerń, świecące pierścienie,
 * szklane karty/glassmorphism, cienkie czcionki z szerokim trackingiem).
 */

export const colors = {
  // Tło — głęboka przestrzeń
  bg0: '#04060B', // najgłębsza czerń-granat
  bg1: '#0A0F1A', // tło bazowe
  bg2: '#0E1524', // delikatnie jaśniejszy granat (gradient)
  nebula: '#16233D', // poświata mgławicy

  // Szkło / karty
  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(255,255,255,0.08)',
  hairline: 'rgba(255,255,255,0.10)',
  hairlineSoft: 'rgba(255,255,255,0.06)',

  // Tekst
  text: '#F4F7FF',
  textDim: 'rgba(244,247,255,0.65)',
  textFaint: 'rgba(244,247,255,0.38)',

  // Akcenty
  accent: '#3FA9FF', // chłodny niebieski (domyślny)
  rosso: '#C21A2B', // czerwień Alfa Romeo (akcent marki)
  good: '#5BE39A', // sukces / połączono
  warn: '#FFB454',
  danger: '#FF5A6A',
} as const;

// Presety kolorów taśmy.
//  display — kolor pokazywany na ekranie (ładny, intuicyjny),
//  rgb     — wartość wysyłana do taśmy (skalibrowana; zieleń jest „gorąca",
//            więc ciepłe barwy mają mocno obniżoną zieleń, by nie żółciły).
export const presetColors = [
  { id: 'red', label: 'Czerwony', display: [255, 0, 0] as RGB, rgb: [255, 0, 0] as RGB },
  { id: 'orange', label: 'Pomarańcz', display: [255, 110, 0] as RGB, rgb: [255, 10, 0] as RGB },
  { id: 'yellow', label: 'Żółty', display: [255, 210, 0] as RGB, rgb: [255, 45, 0] as RGB },
  { id: 'green', label: 'Zielony', display: [0, 220, 60] as RGB, rgb: [0, 255, 0] as RGB },
  { id: 'blue', label: 'Niebieski', display: [40, 90, 255] as RGB, rgb: [0, 0, 255] as RGB },
  { id: 'pink', label: 'Różowy', display: [255, 0, 150] as RGB, rgb: [255, 0, 130] as RGB },
] as const;

export type RGB = [number, number, number];

export const radius = {
  sm: 14,
  md: 22,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
} as const;

// Typografia — czysty bezszeryfowy; lekkie wagi, wersaliki z szerokim trackingiem na etykietach.
export const font = {
  // System: iOS = San Francisco, Android = Roboto — oba dają czyste, nowoczesne wagi.
  thin: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
};

export const type = {
  hero: { fontSize: 64, fontWeight: font.thin, letterSpacing: 2, color: colors.text },
  title: { fontSize: 24, fontWeight: font.light, letterSpacing: 0.5, color: colors.text },
  value: { fontSize: 34, fontWeight: font.thin, letterSpacing: 1, color: colors.text },
  body: { fontSize: 15, fontWeight: font.regular, color: colors.text },
  label: {
    fontSize: 11,
    fontWeight: font.semibold,
    letterSpacing: 2.5,
    textTransform: 'uppercase' as const,
    color: colors.textFaint,
  },
} as const;

export const rgbToCss = ([r, g, b]: RGB) => `rgb(${r},${g},${b})`;
export const rgbToHex = ([r, g, b]: RGB) =>
  '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

// Bezpieczne dla kierowcy minimum kontrastu poświaty
export const glow = (rgb: RGB, opacity = 0.55) =>
  `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
