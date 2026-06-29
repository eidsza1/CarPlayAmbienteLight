/**
 * Custom UI dla CarPlay (osobny surface RN). UWAGA: renderowanie własnego
 * widoku w oknie CarPlay wymaga entitlementu carplay-communication/maps
 * (nie dostępne dla driving-task). Komponent zostaje na wypadek uzyskania
 * takiego entitlementu; przy driving-task używamy szablonów (kafli).
 */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarPlayPanel } from './CarPlayPanel';

export const CarPlayApp: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <CarPlayPanel />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
