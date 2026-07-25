import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FreeTasbihScreen } from '../screens/FreeTasbihScreen';

export type RootStackParamList = {
  Categories: undefined;
  Category: { categoryId: string };
  Settings: undefined;
  FreeTasbih: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Categories">
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="FreeTasbih" component={FreeTasbihScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
