import React, { useCallback, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { toggleFavouriteCategory } from '../store/slices/favouriteCategoriesSlice';
import { ScreenHeader } from '../components/ScreenHeader';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const favouriteCategoryIds = useSelector((state: RootState) => state.favouriteCategories.ids);
  const theme = getAzkarTheme(themeName);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchAnim = useMemo(() => new Animated.Value(0), []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      Animated.timing(searchAnim, {
        toValue: next ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
      if (!next) {
        setSearchQuery('');
      }
      return next;
    });
  }, [searchAnim]);

  const filteredAzkar = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchingCategories = azkar.filter((cat) => cat.title.toLowerCase().includes(normalizedQuery));

    return [...matchingCategories].sort((a, b) => {
      const aFav = favouriteCategoryIds.includes(a.id) ? 1 : 0;
      const bFav = favouriteCategoryIds.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) {
        return bFav - aFav;
      }

      return a.id - b.id;
    });
  }, [favouriteCategoryIds, searchQuery]);

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.gradient}>
      <ScreenHeader
        title={t('adhkar')}
        leftAction={
          <Pressable
            onPress={toggleSearch}
            hitSlop={8}
            accessibilityLabel={isSearchOpen ? t('closeSearch') : t('search')}
            style={styles.headerActionBtn}
          >
            <Ionicons name={isSearchOpen ? 'close' : 'search'} size={20} color={theme.textColor} />
          </Pressable>
        }
        rightAction={
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            hitSlop={8}
            accessibilityLabel={t('settings')}
            style={styles.headerActionBtn}
          >
            <SimpleLineIcons name="settings" size={18} color={theme.textColor} />
          </Pressable>
        }
        bottom={
          <Animated.View
            style={[
              styles.searchWrap,
              {
                opacity: searchAnim,
                maxHeight: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 88] }),
              },
            ]}
            pointerEvents={isSearchOpen ? 'auto' : 'none'}
          >
            <View
              style={[
                styles.searchField,
                { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
              ]}
            >
              <TextInput
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={theme.secondaryTextColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={isSearchOpen}
                style={[styles.search, { color: theme.textColor }]}
              />
            </View>
          </Animated.View>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isSearchOpen && (
          <>
            <LinearGradient colors={theme.verseGradient} style={styles.quoteCard}>
              <Text style={[styles.quoteIntro, { color: theme.verseSubTextColor }]}>{t('quranIntro')}</Text>
              <Text style={[styles.quoteArabic, { color: theme.verseTextColor }]}>{t('quranVerse')}</Text>
              <Text style={[styles.quoteRef, { color: theme.verseSubTextColor }]}>{t('quranRef')}</Text>
            </LinearGradient>

            <LinearGradient colors={theme.verseGradient} style={styles.quoteCard}>
              <Text style={[styles.quoteIntro, { color: theme.verseSubTextColor }]}>{t('hadithIntro')}</Text>
              <Text style={[styles.quoteArabic, { color: theme.verseTextColor }]}>{t('hadithText')}</Text>
              <Text style={[styles.quoteRef, { color: theme.verseSubTextColor }]}>{t('hadithRef')}</Text>
            </LinearGradient>
          </>
        )}

        <Pressable
          style={[
            styles.categoryBtn,
            { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
          ]}
          onPress={() => navigation.navigate('FreeTasbih')}
        >
          <View style={styles.categoryMeta}>
            <Pressable hitSlop={10} style={styles.favoriteButton}>
              <Ionicons name={'pin'} size={18} color={theme.secondaryTextColor} />
            </Pressable>
          </View>
          <Text style={[styles.categoryText, { color: theme.textColor }]}>{t('freeTasbih')}</Text>
          <LinearGradient colors={theme.accentGradient} style={styles.categoryIcon}>
            <Ionicons name="leaf" size={18} color={theme.accentTextColor} />
          </LinearGradient>
        </Pressable>

        {filteredAzkar.map((category) => {
          const isFavourite = favouriteCategoryIds.includes(category.id);

          return (
            <Pressable
              key={category.id}
              style={[
                styles.categoryBtn,
                { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
              ]}
              onPress={() => navigation.navigate('Category', { categoryId: category.id.toString() })}
            >
              <View style={styles.categoryMeta}>
                <Pressable
                  accessibilityLabel={
                    isFavourite
                      ? `Remove ${category.title} from favourites`
                      : `Add ${category.title} to favourites`
                  }
                  hitSlop={10}
                  onPress={(event) => {
                    event.stopPropagation();
                    dispatch(toggleFavouriteCategory(category.id));
                  }}
                  style={styles.favoriteButton}
                >
                  <Ionicons
                    name={isFavourite ? 'star' : 'star-outline'}
                    size={18}
                    color={isFavourite ? '#BB9A4F' : theme.secondaryTextColor}
                  />
                </Pressable>
              </View>
              <Text style={[styles.categoryText, { color: theme.textColor }]}>{category.title}</Text>
              <LinearGradient colors={theme.accentGradient} style={styles.categoryIcon}>
                <FontAwesome5 name={category.icon} size={18} color={theme.accentTextColor} />
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  headerActionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
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
    alignItems: 'center',
  },
  quoteIntro: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: AZKAR_PRIMARY_FONT,
    marginBottom: 6,
  },
  quoteArabic: {
    fontSize: 18,
    lineHeight: 40,
    fontFamily: AZKAR_TITLE_FONT,
    textAlign: 'center',
    marginBottom: 10,
  },
  quoteRef: {
    fontSize: 9,
    textAlign: 'center',
    fontFamily: AZKAR_PRIMARY_FONT,
  },
  searchWrap: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchField: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  search: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
});
