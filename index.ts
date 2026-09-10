import 'react-native-gesture-handler';
import { I18nManager, NativeModules, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';
import { extractCategoryId, persistPendingCategory } from './src/notifications/notificationRouter';

I18nManager.forceRTL(true);

// Register notifee background event (killed state). Must be top-level outside React.
// Headless JS cannot navigate, so a press only persists the payload categoryId;
// App.tsx consumes and clears it on startup.
if (Platform.OS !== 'web') {
  if ((NativeModules as any)?.NotifeeApiModule) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const notifee = require('@notifee/react-native').default;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const eventType = require('@notifee/react-native').EventType as { PRESS?: number } | undefined;
      const press = eventType?.PRESS ?? 1;
      notifee.onBackgroundEvent(
        async ({ type, detail }: { type: number; detail?: { notification?: { data?: unknown } } }) => {
          try {
            if (type !== press) return;
            const categoryId = extractCategoryId(detail?.notification?.data);
            if (categoryId) await persistPendingCategory(categoryId);
          } catch {
            // no-op: never crash headless JS
          }
        }
      );
    } catch {
      // no-op: notifee not available
    }
  }
}

registerRootComponent(App);
