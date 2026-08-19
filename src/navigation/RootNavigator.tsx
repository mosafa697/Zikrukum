import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FreeTasbihScreen } from '../screens/FreeTasbihScreen';
import { RootState } from '../store';
import { getAzkarTheme } from '../theme/azkarTheme';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgColor }} edges={['top']}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Categories"
          screenOptions={{
            headerShown: false,
            headerTransparent: true,
            contentStyle: { backgroundColor: theme.bgColor },
          }}
        >
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="FreeTasbih" component={FreeTasbihScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
