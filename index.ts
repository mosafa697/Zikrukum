import 'react-native-gesture-handler';
import { I18nManager, NativeModules, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

I18nManager.forceRTL(true);

// Register notifee background event (killed state). Must be top-level outside React.
if (Platform.OS !== 'web') {
  if ((NativeModules as any)?.NotifeeApiModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const notifee = require('@notifee/react-native').default;
      notifee.onBackgroundEvent(async () => {
        // No-op: background handler removed with TrackPlayer. Kept to avoid missing handler warnings.
      });
    } catch {
      // no-op: notifee not available
    }
  }
}

registerRootComponent(App);
