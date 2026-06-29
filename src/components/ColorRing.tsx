/**
 * Centralny świecący pierścień — element hero. Pokazuje aktualny kolor taśmy
 * jako jarzący się okrąg (jak „zaćmienie"/księżyc w referencjach infotainment).
 * Pulsuje delikatnie (Reanimated), a w trybach gradientu animuje obrót.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, glow, rgbToCss, RGB } from '../theme/theme';

type Props = {
  color: RGB;
  size?: number;
  active: boolean; // power on?
  spinning?: boolean; // tryb gradientu
};

const AView = Animated.createAnimatedComponent(View);

export const ColorRing: React.FC<Props> = ({
  color,
  size = 230,
  active,
  spinning = false,
}) => {
  const pulse = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  useEffect(() => {
    if (spinning) {
      spin.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(spin);
      spin.value = withTiming(0, { duration: 300 });
    }
    return () => cancelAnimation(spin);
  }, [spinning, spin]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.35 + pulse.value * 0.4 : 0.08,
    transform: [{ scale: active ? 0.95 + pulse.value * 0.12 : 0.9 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
    opacity: active ? 1 : 0.25,
  }));

  const css = rgbToCss(color);
  const stroke = size * 0.045;
  const r = (size - stroke) / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Miękka poświata */}
      <AView
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size, backgroundColor: glow(color, 0.9) },
          glowStyle,
        ]}
      />
      {/* Pierścień */}
      <AView style={[StyleSheet.absoluteFill, styles.center, ringStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={css} stopOpacity={1} />
              <Stop offset="1" stopColor={css} stopOpacity={0.25} />
            </LinearGradient>
          </Defs>
          {/* tor bazowy */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.hairline}
            strokeWidth={stroke}
            fill="none"
          />
          {/* jarzący się łuk */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ring)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * 2 * r * 0.72} ${Math.PI * 2 * r}`}
            fill="none"
          />
        </Svg>
      </AView>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
