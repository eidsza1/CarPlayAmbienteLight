/**
 * Pigułka statusu połączenia — pulsująca kropka podczas skanu/łączenia,
 * stała gdy połączono, czerwona przy błędzie. Parytet z paskiem statusu z MAUI.
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, radius, type } from '../theme/theme';
import type { ConnStatus } from '../ble/manager';

type Props = {
  status: ConnStatus;
  deviceName?: string;
  error?: string;
  onPress: () => void;
};

const meta: Record<ConnStatus, { label: string; color: string; busy?: boolean }> = {
  idle: { label: 'Dotknij, aby połączyć', color: colors.textDim },
  scanning: { label: 'Szukam LEDCAR…', color: colors.accent, busy: true },
  connecting: { label: 'Łączenie…', color: colors.accent, busy: true },
  connected: { label: 'Połączono', color: colors.good },
  error: { label: 'Błąd — dotknij, by ponowić', color: colors.danger },
  bluetoothOff: { label: 'Włącz Bluetooth', color: colors.warn },
};

export const StatusPill: React.FC<Props> = ({ status, deviceName, error, onPress }) => {
  const m = meta[status];
  const blink = useSharedValue(1);

  useEffect(() => {
    if (m.busy) {
      blink.value = withRepeat(
        withTiming(0.2, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(blink);
      blink.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(blink);
  }, [m.busy, blink]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  const label =
    status === 'connected' && deviceName
      ? deviceName
      : status === 'error' && error
      ? error
      : m.label;

  return (
    <Pressable onPress={onPress} style={styles.pill}>
      <Animated.View style={[styles.dot, { backgroundColor: m.color }, dotStyle]} />
      <Text numberOfLines={1} style={[type.body, { color: m.color, flexShrink: 1 }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    maxWidth: '92%',
  },
  dot: { width: 9, height: 9, borderRadius: 9 },
});
