import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FreeTasbihScreen } from '../screens/FreeTasbihScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RootState } from '../store';
import { getAzkarTheme } from '../theme/azkarTheme';
import { isFeatureEnabled } from '../config/features';
import { flushPendingNavigation, isReadyRef, navigationRef } from './navigationRef';

export type RootStackParamList = {
  Onboarding: undefined;
  Categories: undefined;
  Category: { categoryId: string };
  Settings: undefined;
  FreeTasbih: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const themeName = useSelector((state: RootState) => state.theme.value);
  const onboardingCompleted = useSelector((state: RootState) => state.onboarding.completed);
  const theme = getAzkarTheme(themeName);
  const showOnboarding = isFeatureEnabled('onboarding') && !onboardingCompleted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgColor }} edges={['top']}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          isReadyRef.current = true;
          flushPendingNavigation();
        }}
      >
        <Stack.Navigator
          initialRouteName={showOnboarding ? 'Onboarding' : 'Categories'}
          screenOptions={{
            headerShown: false,
            headerTransparent: true,
            contentStyle: { backgroundColor: theme.bgColor },
          }}
        >
          {showOnboarding && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="FreeTasbih" component={FreeTasbihScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
