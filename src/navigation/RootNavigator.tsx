import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.buttonBgColor }}>
        <Stack.Navigator
          initialRouteName="Categories"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.buttonBgColor },
          }}
        >
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} options={{ title: '' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '' }} />
          <Stack.Screen name="FreeTasbih" component={FreeTasbihScreen} options={{ title: '' }} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}
