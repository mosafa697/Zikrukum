import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAzkar = azkar.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.card, { backgroundColor: theme.cardBgColor }]}>

          {/* Quran verse + Hadith */}
          <Text style={[styles.quoteText, { color: theme.textColor }]}>
            {'قال الله تعالى: '}
            <Text style={styles.bold}>{'الَّذِينَ آمَنُواْ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ'}</Text>
            <Text style={{ fontSize: 13 }}>{' (الرعد:28).'}</Text>
          </Text>
          <Text style={[styles.quoteText, { color: theme.textColor }]}>
            {'وقال رسول الله ﷺ: '}
            <Text style={styles.bold}>{'يقولُ اللَّه تعالى: أنا عِنْدَ ظَنِّ عَبْدِي بي، وأنا معهُ إذا ذَكَرَنِي'}</Text>
            <Text style={{ fontSize: 13 }}>{'. صحيح البخاري 7405.'}</Text>
          </Text>

          {/* Search */}
          <TextInput
            placeholder="ابحث عن فئة..."
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
            <Text style={[styles.categoryText, { color: theme.textColor }]}>مسبحة حرة</Text>
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
});
