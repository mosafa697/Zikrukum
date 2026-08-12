import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import { toHindiDigits } from '../utils/numberFormatting';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAzkar = azkar.filter((cat) => cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <LinearGradient colors={['#FBF7ED', '#EFE7D5']} style={styles.gradient}>
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: theme.textColor, fontFamily: AZKAR_TITLE_FONT }]}>
          {t('adhkar')}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={[styles.headerBtn, { borderColor: theme.buttonBorderColor }]}
          accessibilityLabel={t('settings')}
        >
          <SimpleLineIcons name="settings" size={12} color={theme.textColor} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#2F5D50', '#1E3F36']} style={styles.quoteCard}>
          <Text style={styles.quoteArabic}>{t('quranVerse')}</Text>
          <Text style={styles.quoteRef}>{t('quranRef')}</Text>
        </LinearGradient>

        <TextInput
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={theme.secondaryTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.search,
            {
              backgroundColor: theme.buttonBgColor,
              borderColor: theme.buttonBorderColor,
              color: theme.textColor,
            },
          ]}
        />

        <Pressable
          style={[
            styles.categoryBtn,
            { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
          ]}
          onPress={() => navigation.navigate('FreeTasbih')}
        >
          <Text
            style={[
              styles.categoryCount,
              { color: theme.secondaryTextColor, borderColor: theme.buttonBorderColor },
            ]}
          >
            —
          </Text>
          <Text style={[styles.categoryText, { color: theme.textColor }]}>{t('freeTasbih')}</Text>
          <LinearGradient colors={['#E9DBB3', '#c4b188']} style={styles.categoryIcon}>
            <Ionicons name="leaf" size={18} color={theme.textColor} />
          </LinearGradient>
        </Pressable>

        {filteredAzkar.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryBtn,
              { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            ]}
            onPress={() => navigation.navigate('Category', { categoryId: category.id.toString() })}
          >
            <Text
              style={[
                styles.categoryCount,
                { color: theme.secondaryTextColor, borderColor: theme.buttonBorderColor },
              ]}
            >
              {toHindiDigits(category.phrases.length)}
            </Text>
            <Text style={[styles.categoryText, { color: theme.textColor }]}>{category.title}</Text>
            <LinearGradient colors={['#E9DBB3', '#c4b188']} style={styles.categoryIcon}>
              <FontAwesome5 name={category.icon} size={18} color={theme.textColor} />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingBottom: 8,
    marginBottom: 8,
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    marginTop: 0,
  },
  pageSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: AZKAR_PRIMARY_FONT,
    marginTop: 6,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    marginBottom: 14,
  },
  quoteCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  quoteArabic: {
    fontSize: 22,
    lineHeight: 44,
    color: '#F3ECD8',
    fontFamily: 'AmiriBold',
    textAlign: 'right',
    marginBottom: 10,
  },
  quoteRef: {
    fontSize: 11,
    color: '#E9DBB3',
    textAlign: 'right',
    fontFamily: AZKAR_PRIMARY_FONT,
  },
  search: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  categoryBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  categoryIconText: {
    fontSize: 18,
  },
  categoryText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 999,
  },
  headerBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF7ED',
    padding: 12,
  },
});
