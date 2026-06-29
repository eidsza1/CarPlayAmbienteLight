/**
 * Poziomy suwak barw (hue) — tęczowy pasek z uchwytem. Przeciągnij, by wybrać
 * dowolny kolor. Styl Porsche: cienki pasek, czysty uchwyt. Commit do BLE po
 * puszczeniu (onComplete), podgląd na żywo (onChange).
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { colors, rgbToCss, RGB, type } from '../theme/theme';
import { hueToRgb, rgbToHue } from '../theme/color';

type Props = {
  value: RGB;
  onChange?: (rgb: RGB) => void;
  onComplete: (rgb: RGB) => void;
  edgePadding?: number; // wcięcie etykiety, gdy track jest pełnej szerokości
};

const TRACK_H = 16;
const HANDLE = 28;
const RAINBOW = [
  '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000',
];

export const HueSlider: React.FC<Props> = ({
  value,
  onChange,
  onComplete,
  edgePadding = 0,
}) => {
  const [width, setWidth] = useState(0);
  const [hue, setHue] = useState(() => rgbToHue(value));
  const pos = useSharedValue(0); // 0..1

  React.useEffect(() => {
    const h = rgbToHue(value);
    setHue(h);
    pos.value = h / 360;
  }, [value, pos]);

  const handle = (x: number, commit: boolean) => {
    if (width <= 0) return;
    const p = Math.max(0, Math.min(1, x / width));
    pos.value = p;
    const h = p * 360;
    setHue(h);
    const rgb = hueToRgb(h);
    if (commit) onComplete(rgb);
    else onChange?.(rgb);
  };

  const pan = Gesture.Pan()
    .onBegin(e => runOnJS(handle)(e.x, false))
    .onUpdate(e => runOnJS(handle)(e.x, false))
    .onEnd(e => runOnJS(handle)(e.x, true));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * Math.max(0, width - HANDLE) }],
  }));

  return (
    <View>
      <View style={[styles.header, { paddingHorizontal: edgePadding }]}>
        <Text style={type.label}>Kolor własny</Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.hit} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          <LinearGradient
            colors={RAINBOW}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.track}
          />
          <Animated.View
            style={[
              styles.handle,
              { backgroundColor: rgbToCss(hueToRgb(hue)) },
              handleStyle,
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  hit: { height: HANDLE, justifyContent: 'center' },
  track: {
    height: TRACK_H,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  handle: {
    position: 'absolute',
    left: 0,
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 5,
  },
});
