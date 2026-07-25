import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { CategoryList } from '../components/CategoryList';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}> 
      <Text style={[styles.title, { color: theme.textColor }]}>الأذكار</Text>
      <CategoryList />
      <Pressable
        style={[styles.button, { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>الإعدادات</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor }]}
        onPress={() => navigation.navigate('FreeTasbih')}
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>تسابيح حرة</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16, textAlign: 'right', fontFamily: AZKAR_PRIMARY_FONT },
  button: { width: '100%', paddingVertical: 14, borderRadius: 12, marginTop: 12, borderWidth: 1 },
  buttonText: { textAlign: 'center', fontSize: 18, fontWeight: '600', fontFamily: AZKAR_PRIMARY_FONT },
});
