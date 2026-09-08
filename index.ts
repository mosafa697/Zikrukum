import 'react-native-gesture-handler';
import { I18nManager, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

I18nManager.forceRTL(true);

// Register TrackPlayer playback service for background/locked controls (guarded for web/Expo Go)
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const TrackPlayer = require('react-native-track-player').default;
    TrackPlayer.registerPlaybackService(() => require('./src/audio/playbackService').default);
  } catch {
    // no-op: TrackPlayer not available (web / missing native link)
  }
}

// Register notifee background event (killed state) -> TrackPlayer handoff; must be top-level outside React.
if (Platform.OS !== 'web') {
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

registerRootComponent(App);
