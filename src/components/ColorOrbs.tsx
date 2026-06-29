/**
 * Rząd „kul" kolorów (presety). Kółko pokazuje kolor `display` (ładny na ekranie),
 * a do taśmy wysyłany jest skalibrowany `rgb`. Wybrana skaluje się i świeci
 * (spring), z haptyką impactMedium (jak przy power).
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { presetColors, glow, rgbToCss, RGB } from '../theme/theme';

type Props = {
  selected: RGB; // aktualnie wysłany kolor (do podświetlenia aktywnego)
  onSelect: (send: RGB, display: RGB) => void;
};

const isSame = (a: RGB, b: RGB) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

const Orb: React.FC<{ display: RGB; active: boolean; onPress: () => void }> = ({
  display,
  active,
  onPress,
}) => {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(active ? 1.18 : 1, { damping: 12 }) }],
  }));
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Animated.View
        style={[
          styles.orb,
          {
            backgroundColor: rgbToCss(display),
            shadowColor: rgbToCss(display),
            borderColor: active ? '#fff' : glow(display, 0.5),
          },
          style,
        ]}
      />
    </Pressable>
  );
};

export const ColorOrbs: React.FC<Props> = ({ selected, onSelect }) => (
  <View style={styles.row}>
    {presetColors.map(p => (
      <Orb
        key={p.id}
        display={p.display as RGB}
        active={isSame(selected, p.rgb as RGB)}
        onPress={() => {
          ReactNativeHapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });
          onSelect(p.rgb as RGB, p.display as RGB);
        }}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orb: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
