import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VolumeManager } from 'react-native-volume-manager';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenHeader } from '../components/ScreenHeader';
import { TasbihButton } from '../components/TasbihButton';
import { config } from '../config/config';
import { t } from '../i18n';
import { RootState } from '../store';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { formatNumber } from '../utils/numberFormatting';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const [count, setCount] = useState(0);

  const lastVolumeRef = useRef<number | null>(null);
  const volumeNavGuardRef = useRef(0);

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
  }, [dispatch]);

  const handleTap = useTimeGuardedCallback(tap, config.interaction.freeTasbihTapGuardMs);

  // Hardware volume buttons control the free tasbih counter: volume up decrements
  // (never below 0, without affecting the global total), volume down increments.
  // Only active while the user has enabled volume nav in Settings.
  useEffect(() => {
    if (!volumeNavEnabled) return;
    let listener: { remove: () => void } | null = null;

    const init = async () => {
      try {
        const { volume } = await VolumeManager.getVolume();
        lastVolumeRef.current = volume;
        await VolumeManager.showNativeVolumeUI({ enabled: false });
        listener = VolumeManager.addVolumeListener(({ volume }) => {
          const last = lastVolumeRef.current;
          if (last === null || last === undefined) {
            lastVolumeRef.current = volume;
            return;
          }
          const now = Date.now();
          if (now - volumeNavGuardRef.current < config.interaction.counterGuardMs) {
            return;
          }
          volumeNavGuardRef.current = now;
          if (volume < last) {
            setCount((c) => c + 1);
            dispatch(incrementTotalCount());
          } else if (volume > last) {
            setCount((c) => Math.max(0, c - 1));
          }
          lastVolumeRef.current = last;
          void VolumeManager.setVolume(last, { playSound: false, showUI: false });
        });
      } catch {
        // Volume manager unavailable (e.g. Expo Go); ignore silently.
      }
    };

    void init();

    return () => {
      listener?.remove();
      void VolumeManager.showNativeVolumeUI({ enabled: true });
      lastVolumeRef.current = null;
    };
  }, [dispatch, volumeNavEnabled]);

  return (
    <Pressable style={styles.gradient} onPress={handleTap}>
      <LinearGradient colors={theme.bgGradient} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.card} pointerEvents="box-none">
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

        <View style={styles.counterArea} pointerEvents="none">
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
          ]}
          pointerEvents="none"
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
