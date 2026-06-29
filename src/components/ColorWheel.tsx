/**
 * Koło kolorów (pierścień barw HSL) — pełna paleta ponad presety.
 * Dotyk/przeciągnięcie po obwodzie wybiera odcień; commit do BLE po puszczeniu.
 */
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { rgbToCss, RGB } from '../theme/theme';

type Props = {
  size?: number;
  value: RGB;
  onChange?: (rgb: RGB) => void;
  onComplete: (rgb: RGB) => void;
};

const SEGMENTS = 72;

// HSL (S=100%, L=50%) → RGB
function hueToRgb(h: number): RGB {
  const s = 1,
    l = 0.5;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function rgbToHue([r, g, b]: RGB): number {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

export const ColorWheel: React.FC<Props> = ({
  size = 220,
  value,
  onChange,
  onComplete,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 4;
  const inner = outer - 26;

  const [hue, setHue] = useState(() => rgbToHue(value));

  // odśwież po zmianie wartości z zewnątrz (np. preset)
  React.useEffect(() => setHue(rgbToHue(value)), [value]);

  const segments = useMemo(
    () =>
      Array.from({ length: SEGMENTS }, (_, i) => {
        const a = (i / SEGMENTS) * 2 * Math.PI - Math.PI / 2;
        const h = (i / SEGMENTS) * 360;
        return {
          x1: cx + inner * Math.cos(a),
          y1: cy + inner * Math.sin(a),
          x2: cx + outer * Math.cos(a),
          y2: cy + outer * Math.sin(a),
          color: rgbToCss(hueToRgb(h)),
        };
      }),
    [cx, cy, inner, outer],
  );

  const handle = (x: number, y: number, commit: boolean) => {
    const ang = Math.atan2(y - cy, x - cx) + Math.PI / 2;
    let h = (ang * 180) / Math.PI;
    if (h < 0) h += 360;
    h = h % 360;
    setHue(h);
    const rgb = hueToRgb(h);
    if (commit) onComplete(rgb);
    else onChange?.(rgb);
  };

  const pan = Gesture.Pan()
    .onBegin(e => runOnJS(handle)(e.x, e.y, false))
    .onUpdate(e => runOnJS(handle)(e.x, e.y, false))
    .onEnd(e => runOnJS(handle)(e.x, e.y, true));

  const selA = (hue / 360) * 2 * Math.PI - Math.PI / 2;
  const selR = (inner + outer) / 2;
  const selX = cx + selR * Math.cos(selA);
  const selY = cy + selR * Math.sin(selA);

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {segments.map((s, i) => (
            <Line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeWidth={(2 * Math.PI * outer) / SEGMENTS + 1.5}
              strokeLinecap="butt"
            />
          ))}
          {/* selektor */}
          <Circle cx={selX} cy={selY} r={15} fill={rgbToCss(hueToRgb(hue))} stroke="#fff" strokeWidth={3} />
          {/* podgląd w środku */}
          <Circle cx={cx} cy={cy} r={inner - 14} fill={rgbToCss(hueToRgb(hue))} opacity={0.18} />
        </Svg>
      </View>
    </GestureDetector>
  );
};
