import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { createAppStore, type AppStore } from './src/store';
import { loadPersistedState } from './src/store/persistence';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  ensureAdhkarChannel,
  getInitialNotificationData,
  isNotifeeSupported,
  scheduleReminders,
  subscribeForegroundNotificationPress,
} from './src/notifications/notifeeService';
import { consumePendingCategory, handleNotificationPress } from './src/notifications/notificationRouter';
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

  // Notification tap deep-link: foreground presses + killed-state cold start.
  // Navigation readiness is handled via the pending queue in navigationRef.
  useEffect(() => {
    if (!isFeatureEnabled('reminders')) return;
    if (!isNotifeeSupported()) return;
    const unsubscribe = subscribeForegroundNotificationPress((data) => handleNotificationPress(data));
    (async () => {
      try {
        const initialData = await getInitialNotificationData();
        // Always clear the headless backup so stale presses never fire later.
        const pending = await consumePendingCategory();
        const target = initialData ?? (pending ? { categoryId: pending } : null);
        if (target) handleNotificationPress(target);
      } catch {
        // no-op: deep-link must never crash startup
      }
    })();
    return unsubscribe;
  }, []);

  // Create notifee channel + schedule daily reminders + reschedule on time/toggle and on AppState active (timezone / reboot).
  useEffect(() => {
    if (!appStore) return;
    if (isFeatureEnabled('reminders')) void ensureAdhkarChannel();
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

    return () => {
      unsubscribe();
      appStateSub.remove();
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
