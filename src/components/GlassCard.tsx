/**
 * Szklana karta (glassmorphism) — półprzezroczyste tło + delikatny gradient
 * + cienka jasna obwódka 1px. Bez natywnego blura (mniej zależności natywnych),
 * efekt szkła osiągamy warstwami i przezroczystością.
 */
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radius, spacing } from '../theme/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
};

export const GlassCard: React.FC<Props> = ({ children, style, padding = spacing.lg }) => (
  <View style={[styles.wrap, style]}>
    <LinearGradient
      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
    />
    <View style={{ padding }}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.glass,
    overflow: 'hidden',
  },
});
