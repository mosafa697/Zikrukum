import React, { useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={[styles.headerBtn, { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor }]}
          accessibilityLabel={t('settings')}
        >
          <Ionicons name="settings-outline" size={20} color={theme.textColor} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const filteredAzkar = azkar.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.card, { backgroundColor: theme.cardBgColor }]}>

          {/* Quran verse + Hadith */}
          <Text style={[styles.quoteText, { color: theme.textColor }]}>
            {t('quranIntro')}
            <Text style={styles.bold}>{t('quranVerse')}</Text>
            <Text style={{ fontSize: 13 }}>{t('quranRef')}</Text>
          </Text>
          <Text style={[styles.quoteText, { color: theme.textColor }]}>
            {t('hadithIntro')}
            <Text style={styles.bold}>{t('hadithText')}</Text>
            <Text style={{ fontSize: 13 }}>{t('hadithRef')}</Text>
          </Text>

          {/* Search */}
          <TextInput
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={theme.secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.search,
              { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor, color: theme.textColor },
            ]}
          />

          {/* Free tasbih always first */}
          <Pressable
            style={[styles.categoryBtn, { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor }]}
            onPress={() => navigation.navigate('FreeTasbih')}
          >
            <Text style={[styles.categoryText, { color: theme.textColor }]}>{t('freeTasbih')}</Text>
          </Pressable>

          {filteredAzkar.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryBtn, { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor }]}
              onPress={() => navigation.navigate('Category', { categoryId: category.id.toString() })}
            >
              <Text style={[styles.categoryText, { color: theme.textColor }]}>{category.title}</Text>
            </Pressable>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 20, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quoteText: { fontSize: 15, lineHeight: 28, textAlign: 'center', fontFamily: AZKAR_PRIMARY_FONT, writingDirection: 'rtl' },
  bold: { fontWeight: '700' },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  categoryBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  categoryText: { fontSize: 17, fontWeight: '700', fontFamily: AZKAR_PRIMARY_FONT, textAlign: 'center' },
  headerBtn: { width: 37, height: 37, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
});
