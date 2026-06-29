/**
 * Własny splash w React — logo AR na ciemnym tle, pokazywany zaraz po starcie
 * i znikający płynnie. Daje markowy ekran startowy niezależnie od natywnego
 * LaunchScreen (i przykrywa „pusty" moment uruchamiania RN).
 */
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/theme';

const splash = require('../../assets/splash.png');

export const SplashOverlay: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.78;
  const [hidden, setHidden] = useState(false);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      1300,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }, finished => {
        if (finished) runOnJS(setHidden)(true);
      }),
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (hidden) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, style]} pointerEvents="none">
      <View style={styles.center}>
        <Image
          source={splash}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg0, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
