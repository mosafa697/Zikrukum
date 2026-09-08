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
import { ensureAdhkarChannel, scheduleReminders } from './src/notifications/notifeeService';
import { setupPlayer } from './src/audio/trackPlayerService';

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

  // Create notifee channel + schedule daily reminders + setup TrackPlayer once store is ready; reschedule on time/toggle and on AppState active (timezone / reboot).
  useEffect(() => {
    if (!appStore) return;
    void ensureAdhkarChannel();
    void setupPlayer();
    const state = appStore.getState() as {
      reminders?: {
        morning: { enabled: boolean; time: { hour: number; minute: number } };
        evening: { enabled: boolean; time: { hour: number; minute: number } };
      };
    };
    if (state.reminders) void scheduleReminders(state.reminders);

    let prevRemindersJson = JSON.stringify((appStore.getState() as { reminders?: unknown }).reminders);
    const unsubscribe = appStore.subscribe(() => {
      const next = appStore.getState() as {
        reminders?: {
          morning: { enabled: boolean; time: { hour: number; minute: number } };
          evening: { enabled: boolean; time: { hour: number; minute: number } };
        };
      };
      if (!next.reminders) return;
      const nextJson = JSON.stringify(next.reminders);
      if (nextJson === prevRemindersJson) return;
      prevRemindersJson = nextJson;
      void scheduleReminders(next.reminders);
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const cur = appStore.getState() as {
          reminders?: {
            morning: { enabled: boolean; time: { hour: number; minute: number } };
            evening: { enabled: boolean; time: { hour: number; minute: number } };
          };
        };
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
