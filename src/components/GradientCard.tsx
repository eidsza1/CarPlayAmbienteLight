/**
 * Karty trybów animowanych: „7 kolorów" (przewijająca się tęcza) oraz
 * „Oddech" (pulsujące oddychanie). Parytet z trybami gradientu z MAUI.
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { colors, radius, type } from '../theme/theme';

type Props = {
  kind: 'seven' | 'breathe';
  active: boolean;
  onPress: () => void;
};

const RAINBOW = ['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#32ADE6', '#5E5CE6', '#FF2D92'];

export const GradientCard: React.FC<Props> = ({ kind, active, onPress }) => {
  const t = useSharedValue(0);

  useEffect(() => {
    if (active) {
      t.value = withRepeat(
        withTiming(1, {
          duration: kind === 'breathe' ? 2200 : 4000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        kind === 'breathe',
      );
    } else {
      cancelAnimation(t);
      t.value = withTiming(0, { duration: 300 });
    }
    return () => cancelAnimation(t);
  }, [active, kind, t]);

  const animStyle = useAnimatedStyle(() => {
    if (kind === 'breathe') {
      return { opacity: 0.35 + t.value * 0.6 };
    }
    return { transform: [{ translateX: -t.value * 120 }] };
  });

  const title = kind === 'seven' ? '7 kolorów' : 'Oddech';
  const subtitle = kind === 'seven' ? 'Tęczowy gradient' : 'Płynne oddychanie';

  return (
    <Pressable
      style={[styles.card, active && styles.active]}
      onPress={() => {
        ReactNativeHapticFeedback.trigger('impactLight', {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
        onPress();
      }}
    >
      <View style={styles.gradientClip}>
        <Animated.View style={[styles.gradientInner, animStyle]}>
          <LinearGradient
            colors={kind === 'seven' ? [...RAINBOW, ...RAINBOW] : ['#5E5CE6', '#32ADE6', '#5E5CE6']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={type.label}>{subtitle}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 96,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    backgroundColor: colors.glass,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'flex-end',
  },
  active: { borderColor: 'rgba(255,255,255,0.45)' },
  gradientClip: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.55 },
  gradientInner: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '200%' },
  title: { ...type.title, fontSize: 18 },
});
