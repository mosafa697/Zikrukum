import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenHeader } from '../components/ScreenHeader';
import { TasbihButton } from '../components/TasbihButton';
import { config } from '../config/config';
import { t } from '../i18n';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { triggerCountHaptic } from '../utils/haptics';
import { AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { formatNumber } from '../utils/numberFormatting';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { useVolumeNav } from '../utils/useVolumeNav';

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const hapticsEnabled = useSelector((state: RootState) => state.haptics.enabled);
  const [count, setCount] = useState(0);

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
    if (hapticsEnabled) triggerCountHaptic();
  }, [dispatch, hapticsEnabled]);

  const handleTap = useTimeGuardedCallback(tap, config.interaction.freeTasbihTapGuardMs);

  // Hardware volume buttons control the free tasbih counter: both keys
  // increment (+1 plus the global total), matching screen taps. Single
  // physical press = one increment; holds collapse to one via the shared hook.
  // Only active while the user has enabled volume nav in Settings.
  const handleVolumeCount = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
    if (hapticsEnabled) triggerCountHaptic();
  }, [dispatch, hapticsEnabled]);

  useVolumeNav({
    enabled: volumeNavEnabled,
    onVolumeUp: handleVolumeCount,
    onVolumeDown: handleVolumeCount,
  });

  return (
    <Pressable style={styles.gradient} onPress={handleTap}>
      <LinearGradient
        colors={theme.bgGradient}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' } as any]}
      />
      <View style={[styles.card, { pointerEvents: 'box-none' } as any]}>
        <ScreenHeader
          title={t('freeTasbih')}
          showBack
          style={styles.header}
          rightAction={
            <Pressable
              onPress={() => setCount(0)}
              hitSlop={8}
              accessibilityLabel={t('reset')}
              style={styles.headerActionBtn}
            >
              <FontAwesome5 name="trash" size={18} color={theme.textColor} />
            </Pressable>
          }
        />

        <View style={[styles.counterArea, { pointerEvents: 'none' } as any]}>
          <TasbihButton
            onPress={handleTap}
            count={count}
            accessibilityLabel={`${t('tasbih')}، ${formatNumber(count)}`}
          />
        </View>

        <View
          style={[
            styles.totalChip,
            { backgroundColor: theme.buttonBgColor, borderColor: theme.buttonBorderColor },
            { pointerEvents: 'none' } as any,
          ]}
        >
          <Text style={[styles.meta, { color: theme.secondaryTextColor }]}>
            {t('totalCounter')}
            {formatNumber(totalCount)}
          </Text>
        </View>
      </View>
    </Pressable>
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
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { paddingHorizontal: 0, paddingTop: 0, width: '100%' },
  counterArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  totalChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 24,
  },
  meta: {
    fontSize: 14,
    fontFamily: AZKAR_TITLE_FONT,
    lineHeight: 20,
    textAlign: 'center',
  },
});
