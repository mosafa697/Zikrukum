import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TasbihButton } from '../components/TasbihButton';
import { config } from '../config/config';
import { t } from '../i18n';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { toHindiDigits } from '../utils/numberFormatting';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';

export function FreeTasbihScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const [count, setCount] = useState(0);

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
  }, [dispatch]);

  const handleTap = useTimeGuardedCallback(tap, config.interaction.freeTasbihTapGuardMs);

  return (
    <LinearGradient colors={['#FBF7ED', '#EFE7D5']} style={styles.gradient}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>{t('freeTasbih')}</Text>
          <Pressable
            onPress={() => navigation.navigate('Categories')}
            style={[
              styles.iconBtn,
              styles.iconLeft,
              { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            ]}
            accessibilityLabel={t('home')}
          >
            <Ionicons name="home-outline" size={20} color={theme.textColor} />
          </Pressable>
          <Pressable
            onPress={() => setCount(0)}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            ]}
            accessibilityLabel={t('reset')}
          >
            <FontAwesome5 name="trash" size={20} color={theme.textColor} />
          </Pressable>
        </View>

        {/* Count display */}
        <View style={styles.countWrapper}>
          <Text style={[styles.value, { color: theme.sliderBgActive }]}>{toHindiDigits(count)}</Text>
        </View>

        {/* Tasbih button — receives count so it can grow */}
        <TasbihButton onPress={handleTap} label={t('tasbih')} count={count} />

        {/* Total counter chip */}
        <View
          style={[
            styles.totalChip,
            { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
          ]}
        >
          <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>
            {t('totalCounter')}
            {toHindiDigits(totalCount)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    gap: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: AZKAR_TITLE_FONT,
    textAlign: 'center',
  },
  iconBtn: {
    position: 'absolute',
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    left: 0,
    right: undefined,
  },
  countWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
  },
  value: {
    fontSize: 72,
    fontWeight: '800',
    fontFamily: AZKAR_TITLE_FONT,
  },
  totalChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  meta: {
    fontSize: 14,
    fontFamily: AZKAR_TITLE_FONT,
    lineHeight: 20,
    textAlign: 'center',
  },
});
