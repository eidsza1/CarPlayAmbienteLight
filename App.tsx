/**
 * Alfa Romeo Ambiente Light — sterowanie taśmami LED przez Bluetooth LE.
 * @format
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainScreen } from './src/screens/MainScreen';
import { SplashOverlay } from './src/components/SplashOverlay';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <MainScreen />
        <SplashOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
