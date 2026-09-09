import 'react-native-gesture-handler';
import { I18nManager, NativeModules, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

I18nManager.forceRTL(true);

// Feature flags — static import to avoid async at top-level; used to gate native services.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isFeatureEnabled: _isFeatureEnabled } = require('./src/config/features');

// Register TrackPlayer playback service for background/locked controls (guarded for web/Expo Go + feature flag)
if (_isFeatureEnabled('backgroundAudio') && Platform.OS !== 'web') {
  const hasTP = Boolean((NativeModules as any)?.TrackPlayerModule || (NativeModules as any)?.MusicModule);
  if (hasTP) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const TrackPlayer = require('react-native-track-player').default;
      TrackPlayer.registerPlaybackService(() => require('./src/audio/playbackService').default);
    } catch {
      // no-op: TrackPlayer not available (web / missing native link)
    }
  }
}

// Register notifee background event (killed state) -> TrackPlayer handoff; must be top-level outside React.
// When backgroundAudio is off, the handler still registers if reminders are on but will no-op on Play action.
if (Platform.OS !== 'web') {
  if ((NativeModules as any)?.NotifeeApiModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const notifee = require('@notifee/react-native').default;
      notifee.onBackgroundEvent(async ({ type, detail }: { type: number; detail: unknown }) => {
        const { handleNotifeeEvent } = require('./src/notifications/eventHandler');
        await handleNotifeeEvent(type, detail);
      });
    } catch {
      // no-op: notifee not available
    }
  }
}

registerRootComponent(App);
