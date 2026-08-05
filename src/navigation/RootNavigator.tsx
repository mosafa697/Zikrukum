import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FreeTasbihScreen } from '../screens/FreeTasbihScreen';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';

export type RootStackParamList = {
  Categories: undefined;
  Category: { categoryId: string };
  Settings: undefined;
  FreeTasbih: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Categories"
        screenOptions={{
          headerStyle: { backgroundColor: theme.cardBgColor },
          headerTintColor: theme.textColor,
          headerTitleStyle: { fontFamily: AZKAR_PRIMARY_FONT },
          contentStyle: { backgroundColor: theme.bgColor },
        }}
      >
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: t('adhkar') }} />
        <Stack.Screen name="Category" component={CategoryScreen} options={{ title: t('dhikrDetails') }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
        <Stack.Screen name="FreeTasbih" component={FreeTasbihScreen} options={{ title: t('freeTasbih') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
