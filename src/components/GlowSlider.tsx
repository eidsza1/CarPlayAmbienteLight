/**
 * Własny, animowany suwak ze świecącym wypełnieniem i dymkiem wartości.
 * Gest Pan (gesture-handler) + Reanimated. Podczas przeciągania aktualizuje
 * podgląd, a po puszczeniu commit'uje wartość do BLE (onComplete) — żeby nie
 * zasypywać urządzenia zapisami. Parytet z suwakami jasności/prędkości z MAUI.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { colors, glow, rgbToCss, RGB, radius, type } from '../theme/theme';

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  accent: RGB;
  onChange?: (v: number) => void; // podgląd na żywo
  onComplete: (v: number) => void; // commit do BLE
};

const TRACK_H = 14;
const THUMB = 26;

export const GlowSlider: React.FC<Props> = ({
  label,
  value,
  min = 10,
  max = 100,
  accent,
  onChange,
  onComplete,
}) => {
  const [width, setWidth] = useState(0);
  const [display, setDisplay] = useState(value);
  const pos = useSharedValue(0); // 0..1
  const lastTick = useSharedValue(-1);

  // Synchronizacja pozycji ze stanem, gdy nie przeciągamy.
  React.useEffect(() => {
    pos.value = (value - min) / (max - min);
    setDisplay(value);
  }, [value, min, max, pos]);

  const tick = () => {
    ReactNativeHapticFeedback.trigger('selection', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };
  const preview = (v: number) => {
    setDisplay(v);
    onChange?.(v);
  };
  const commit = (v: number) => onComplete(v);

  // Uwaga: callbacki gestu to worklety (UI thread) — nie wolno w nich wywoływać
  // zwykłych funkcji JS bezpośrednio. Matematykę liczymy inline, a do JS
  // przekazujemy gotowe prymitywy przez runOnJS.
  const pan = Gesture.Pan()
    .onBegin(e => {
      'worklet';
      if (width <= 0) return;
      const p = Math.max(0, Math.min(1, e.x / width));
      pos.value = p;
      const v = Math.round(min + p * (max - min));
      runOnJS(preview)(v);
    })
    .onUpdate(e => {
      'worklet';
      if (width <= 0) return;
      const p = Math.max(0, Math.min(1, e.x / width));
      pos.value = p;
      const v = Math.round(min + p * (max - min));
      if (v !== lastTick.value) {
        lastTick.value = v;
        if (v % 5 === 0) runOnJS(tick)();
      }
      runOnJS(preview)(v);
    })
    .onEnd(() => {
      'worklet';
      const v = Math.round(min + pos.value * (max - min));
      runOnJS(commit)(v);
    });

  const fillStyle = useAnimatedStyle(() => ({ width: `${pos.value * 100}%` }));
  const thumbLeft = useDerivedValue(() => pos.value * Math.max(0, width - THUMB));
  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: thumbLeft.value }] }));

  const css = rgbToCss(accent);

  return (
    <View>
      <View style={styles.header}>
        <Text style={type.label}>{label}</Text>
        <Text style={styles.value}>{display}%</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          style={styles.track}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: css, shadowColor: css },
              fillStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.thumb,
              { borderColor: css, shadowColor: css, backgroundColor: glow(accent, 0.95) },
              thumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  value: { ...type.value, fontSize: 22 },
  track: {
    height: TRACK_H,
    borderRadius: radius.pill,
    backgroundColor: colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: TRACK_H,
    borderRadius: radius.pill,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
