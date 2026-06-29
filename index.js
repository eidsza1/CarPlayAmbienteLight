/**
 * @format
 */

// MUSI być zaimportowane jako pierwsze (wymóg react-native-gesture-handler).
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import './src/carplay/setupCarPlayTiles';

AppRegistry.registerComponent(appName, () => App);
