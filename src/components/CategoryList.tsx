import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';

export function CategoryList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      {azkar.map((category) => (
        <Pressable key={category.id} style={styles.item} onPress={() => navigation.navigate('Category', { categoryId: category.id.toString() })}>
          <Text style={styles.itemText}>{category.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10 },
  item: { borderWidth: 1, borderColor: '#dbe4f0', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#fff' },
  itemText: { fontSize: 16, fontWeight: '600', color: '#0f172a', textAlign: 'right' },
});
