import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, NativeModules, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { createAppStore, type AppStore } from './src/store';
import { loadPersistedState } from './src/store/persistence';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ensureAdhkarChannel, scheduleReminders } from './src/notifications/notifeeService';
import { setupPlayer } from './src/audio/trackPlayerService';
import { isFeatureEnabled } from './src/config/features';
import type { RemindersState } from './src/store/slices/reminderSlice';

export default function App() {
  const [fontsLoaded] = useFonts({
    ScheherazadeNew: require('./assets/fonts/ScheherazadeNew.ttf'),
    TajawalBold: require('./assets/fonts/Tajawal-ExtraBold.ttf'),
    TajawalRegular: require('./assets/fonts/Tajawal-Regular.ttf'),
    Amiri: require('./assets/fonts/Amiri-Regular.ttf'),
    AmiriBold: require('./assets/fonts/Amiri-Bold.ttf'),
  });
  const [appStore, setAppStore] = useState<AppStore | null>(null);

  // Load persisted settings before first render
  useEffect(() => {
    loadPersistedState().then((state) => setAppStore(createAppStore(state)));
  }, []);

  // Create notifee channel + schedule daily reminders + setup TrackPlayer + foreground event once store is ready; reschedule on time/toggle and on AppState active (timezone / reboot).
  useEffect(() => {
    if (!appStore) return;
    if (isFeatureEnabled('reminders')) void ensureAdhkarChannel();
    if (isFeatureEnabled('backgroundAudio')) void setupPlayer();
    const state = appStore.getState() as { reminders?: RemindersState };
    if (isFeatureEnabled('reminders') && state.reminders) void scheduleReminders(state.reminders);

    let prevRemindersJson = JSON.stringify((appStore.getState() as { reminders?: unknown }).reminders);
    const unsubscribe = appStore.subscribe(() => {
      if (!isFeatureEnabled('reminders')) return;
      const next = appStore.getState() as { reminders?: RemindersState };
      if (!next.reminders) return;
      const nextJson = JSON.stringify(next.reminders);
      if (nextJson === prevRemindersJson) return;
      prevRemindersJson = nextJson;
      void scheduleReminders(next.reminders);
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (!isFeatureEnabled('reminders')) return;
      if (nextState === 'active') {
        const cur = appStore.getState() as { reminders?: RemindersState };
        if (cur.reminders) void scheduleReminders(cur.reminders);
      }
    });

    // Foreground notification action handler (Play تشغيل) -> TrackPlayer (gated by backgroundAudio)
    let removeForegroundListener: (() => void) | null = null;
    if (isFeatureEnabled('backgroundAudio')) {
      const hasNotifee = Boolean((NativeModules as unknown as { NotifeeApiModule?: unknown }).NotifeeApiModule);
      if (hasNotifee) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const notifee = require('@notifee/react-native').default;
          removeForegroundListener = notifee.onForegroundEvent(
            async ({ type, detail }: { type: number; detail: unknown }) => {
              const { handleNotifeeEvent } = await import('./src/notifications/eventHandler');
              await handleNotifeeEvent(type, detail);
            }
          );
        } catch {
          // no-op on web / Expo Go
        }
      }
    }

    return () => {
      unsubscribe();
      appStateSub.remove();
      removeForegroundListener?.();
    };
  }, [appStore]);

  if (!fontsLoaded || !appStore) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={appStore}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
