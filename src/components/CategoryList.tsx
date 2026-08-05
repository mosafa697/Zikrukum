import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function CategoryList() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);

  return (
    <View style={styles.container}>
      {azkar.map((category) => (
        <Pressable
          key={category.id}
          style={[
            styles.item,
            { borderColor: theme.buttonBorderColor, backgroundColor: theme.buttonBgColor },
          ]}
          onPress={() => navigation.navigate('Category', { categoryId: category.id.toString() })}
        >
          <Text style={[styles.itemText, { color: theme.textColor }]}>{category.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10 },
  item: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16 },
  itemText: { fontSize: 16, fontWeight: '600', textAlign: 'right', fontFamily: AZKAR_PRIMARY_FONT },
});
