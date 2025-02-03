import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import MgaNavigationContainer from './src/Controller';
import './src/i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AppState,
  AppStateStatus,
  Linking,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import Shortcuts from 'react-native-actions-shortcuts';
import { mgaHandleDeepLink } from './src/components/utils/linking';
import {
  MgaShortcutItem,
  mgaHandleShortcut,
} from './src/components/utils/shortcuts';
import { useNotifications } from './src/features/notices/push';
import { trackDeepLink, trackError } from './src/components/useTracking';
import { forgetWatchInfo, navigateForWatch } from './src/features/watch/watch';
import { biometricsState } from './src/features/biometrics/biometrics.slice';

/** Entry point for application */
export const App = (): React.JSX.Element => {
  useNotifications();
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <MgaNavigationContainer />
      </SafeAreaProvider>
    </Provider>
  );
};
let appState: AppStateStatus = AppState.currentState;
const { MgaEventEmitter } = NativeModules;

/** Put code / services to run at app startup here. */
const appStartup = async () => {
  // Handle app being opened by a mysubaru:// URLs
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl) {
    trackDeepLink(initialUrl);
    mgaHandleDeepLink(initialUrl);
  }

  // Listen for mysubaru:// URLs after app launch
  Linking.addEventListener('url', ({ url }) => {
    trackDeepLink(url);
    mgaHandleDeepLink(url);
  });

  // Handle app being opened by a shortcut
  const initialShortcut = await Shortcuts.getInitialShortcut();
  mgaHandleShortcut(initialShortcut as MgaShortcutItem);

  // Listen for app shortcuts
  const ShortcutsEmitter = new NativeEventEmitter(Shortcuts);
  ShortcutsEmitter.addListener('onShortcutItemPressed', mgaHandleShortcut);

  // Listen for watch messages
  const eventEmitter = new NativeEventEmitter(MgaEventEmitter);
  eventEmitter.addListener('onPairRequest', () => {
    // CVCON25-3620: If the watch is asking for a pair, forget any paired device you have
    forgetWatchInfo()
      .then(() => {
        navigateForWatch('AppleWatch');
      })
      .catch(trackError('onPairRequest/forgetWatchInfo'));
  });
  eventEmitter.addListener('onPinRequest', () => {
    navigateForWatch('AppleWatchForgotPIN');
  });

  AppState.addEventListener('change', newState => {
    if (appState === 'background' && newState === 'active') {
      biometricsState();
    }
    appState = newState;
  });
};
appStartup().then().catch(trackError('App.tsx'));
