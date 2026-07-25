import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { CategoryList } from '../components/CategoryList';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الأذكار</Text>
      <CategoryList />
      <Pressable style={styles.button} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.buttonText}>الإعدادات</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('FreeTasbih')}>
        <Text style={styles.buttonText}>تسابيح حرة</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 16, textAlign: 'right' },
  button: { width: '100%', backgroundColor: '#1d4ed8', paddingVertical: 14, borderRadius: 12, marginTop: 12 },
  buttonText: { textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '600' },
});
