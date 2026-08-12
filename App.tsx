import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { createAppStore, type AppStore } from './src/store';
import { loadPersistedState } from './src/store/persistence';
import { RootNavigator } from './src/navigation/RootNavigator';

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
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF7ED' }} edges={['top']}>
            <RootNavigator />
          </SafeAreaView>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
