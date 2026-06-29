/**
 * Ekran główny telefonu — kompozycja nowoczesnego, kosmicznego UI.
 * Odtwarza wszystkie funkcje z Views/MainPage.xaml (MAUI):
 * kolory (presety + koło), jasność, prędkość, power, gradienty, status, refresh.
 */
import React, { useCallback, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Background } from '../components/Background';
import { GlassCard } from '../components/GlassCard';
import { DevicePicker } from '../components/DevicePicker';
import { ColorSwatches } from '../components/ColorSwatches';
import { HueSlider } from '../components/HueSlider';
import { ColorWheel } from '../components/ColorWheel';
import { GlowSlider } from '../components/GlowSlider';
import { PowerButton } from '../components/PowerButton';
import { GradientCard } from '../components/GradientCard';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing, type } from '../theme/theme';
import { useAmbiente } from '../store/useAmbiente';

// Zdjęcie wnętrza Alfa Romeo Stelvio (ambient o zmierzchu).
// Kierownica jest po lewej → bez odbicia lustrzanego (mirror={false}).
const interior = require('../../assets/alfa_bg.png');

export const MainScreen: React.FC = () => {
  const s = useAmbiente();

  // Auto-połączenie przy starcie.
  useEffect(() => {
    s.connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshing = s.status === 'scanning' || s.status === 'connecting';
  const onRefresh = useCallback(() => {
    useAmbiente.getState().connect();
  }, []);

  return (
    <View style={styles.root}>
      <Background accent={s.displayColor} photo={interior} mirror={false} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Nagłówek */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Text style={type.label}>Alfa Romeo</Text>
            <Text style={type.title}>Ambient Light</Text>
          </Animated.View>

          <StatusPill
            status={s.status}
            deviceName={s.deviceName}
            error={s.error}
            onPress={onRefresh}
          />

          {/* Wybór urządzenia, gdy nie jesteśmy połączeni */}
          {s.status !== 'connected' && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <DevicePicker
                devices={s.devices}
                status={s.status}
                onPick={s.connectTo}
                onRescan={onRefresh}
              />
            </Animated.View>
          )}

          {/* Power */}
          <Animated.View entering={FadeInDown.delay(140).duration(500)} style={styles.powerRow}>
            <PowerButton on={s.power} accent={s.displayColor} onToggle={s.togglePower} />
          </Animated.View>

          {/* Presety + koło kolorów */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <GlassCard style={styles.card}>
              <Text style={[type.label, styles.cardLabel]}>Kolor</Text>
              <ColorSwatches selected={s.color} onSelect={s.setColor} />
            </GlassCard>
          </Animated.View>

          {/* Suwak barw — padding jak inne elementy */}
          <Animated.View entering={FadeInDown.delay(230).duration(500)}>
            <HueSlider value={s.displayColor} onComplete={s.setColor} />
          </Animated.View>

          {/* Suwaki */}
          <Animated.View entering={FadeInDown.delay(260).duration(500)}>
            <GlassCard style={styles.card}>
              <GlowSlider
                label="Jasność"
                value={s.brightness}
                accent={s.displayColor}
                onComplete={s.setBrightness}
              />
              <View style={{ height: spacing.xl }} />
              <GlowSlider
                label="Prędkość"
                value={s.speed}
                accent={s.displayColor}
                onComplete={s.setSpeed}
              />
            </GlassCard>
          </Animated.View>

          {/* Tryby animacji */}
          <Animated.View
            entering={FadeInDown.delay(320).duration(500)}
            style={styles.modesRow}
          >
            <GradientCard
              kind="seven"
              active={s.mode === 'seven'}
              onPress={s.setSevenGradient}
            />
            <View style={{ width: spacing.md }} />
            <GradientCard
              kind="breathe"
              active={s.mode === 'breathe'}
              onPress={s.setBreathe}
            />
          </Animated.View>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  header: { alignItems: 'center', gap: 4 },
  hero: { alignItems: 'center', marginVertical: spacing.sm },
  powerRow: { alignItems: 'center', marginVertical: spacing.xs },
  card: {},
  cardLabel: { marginBottom: spacing.md },
  modesRow: { flexDirection: 'row' },
});
