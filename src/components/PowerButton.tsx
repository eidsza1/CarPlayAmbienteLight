/**
 * Duży okrągły przycisk power z pulsującym pierścieniem poświaty gdy ON,
 * przygaszony gdy OFF. Sprężysta animacja wciśnięcia + haptyka.
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { colors, glow, rgbToCss, RGB, type } from '../theme/theme';

type Props = { on: boolean; accent: RGB; onToggle: () => void };

const SIZE = 76;

export const PowerButton: React.FC<Props> = ({ on, accent, onToggle }) => {
  const press = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (on) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 250 });
    }
    return () => cancelAnimation(pulse);
  }, [on, pulse]);

  const css = on ? rgbToCss(accent) : colors.textFaint;

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: on ? 0.3 + pulse.value * 0.5 : 0,
    transform: [{ scale: on ? 1 + pulse.value * 0.25 : 1 }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: on ? glow(accent, 0.9) : 'transparent' },
          glowStyle,
        ]}
      />
      <Pressable
        onPressIn={() => (press.value = withSpring(0.92))}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={() => {
          ReactNativeHapticFeedback.trigger('impactMedium', {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });
          onToggle();
        }}
      >
        <Animated.View
          style={[
            styles.btn,
            { borderColor: css, shadowColor: on ? rgbToCss(accent) : 'transparent' },
            btnStyle,
          ]}
        >
          <Svg width={30} height={30} viewBox="0 0 24 24">
            <Path
              d="M12 3 V12"
              stroke={css}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <Path
              d="M6.5 6.8 A7.5 7.5 0 1 0 17.5 6.8"
              stroke={css}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </Pressable>
      <Text style={[type.label, { marginTop: 10 }]}>{on ? 'Wł.' : 'Wył.'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', top: 0, width: SIZE, height: SIZE, borderRadius: SIZE },
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
