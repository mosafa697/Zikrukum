import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getVolumeManager } from '../utils/volumeManager';
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

// Volume nav pins the system volume mid-range so both keys always produce a
// detectable delta (at the min/max rails Android fires no event).
const VOLUME_NAV_BASELINE = 0.5;
const VOLUME_NAV_RAIL_EPS = 0.02;

export function FreeTasbihScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const hapticsEnabled = useSelector((state: RootState) => state.haptics.enabled);
  const [count, setCount] = useState(0);

  const lastVolumeRef = useRef<number | null>(null);
  const volumeNavGuardRef = useRef(0);
  const volumeRestoringRef = useRef(false);
  // Latest haptics flag for the volume listener, which cannot read fresh
  // Redux state without re-registering.
  const hapticsRef = useRef(hapticsEnabled);
  hapticsRef.current = hapticsEnabled;

  const tap = useCallback(() => {
    setCount((c) => c + 1);
    dispatch(incrementTotalCount());
    if (hapticsEnabled) triggerCountHaptic();
  }, [dispatch, hapticsEnabled]);

  const handleTap = useTimeGuardedCallback(tap, config.interaction.freeTasbihTapGuardMs);

  // Hardware volume buttons control the free tasbih counter: both keys
  // increment (+1 plus the global total), matching screen taps.
  // Only active while the user has enabled volume nav in Settings.
  useEffect(() => {
    if (!volumeNavEnabled) return;
    let listener: { remove: () => void } | null = null;

    const init = async () => {
      const vm = getVolumeManager();
      if (!vm) {
        return;
      }
      try {
        const { volume } = await vm.getVolume();
        let baseline = volume;
        if (baseline <= VOLUME_NAV_RAIL_EPS || baseline >= 1 - VOLUME_NAV_RAIL_EPS) {
          // At a rail no event fires — re-center so both keys work.
          await vm.setVolume(VOLUME_NAV_BASELINE, { playSound: false, showUI: false });
          try {
            baseline = (await vm.getVolume()).volume;
          } catch {
            baseline = VOLUME_NAV_BASELINE;
          }
        }
        lastVolumeRef.current = baseline;
        await vm.showNativeVolumeUI({ enabled: false });
        listener = vm.addVolumeListener(({ volume }) => {
          if (volumeRestoringRef.current) {
            // The swallowed press still moved the real volume — re-baseline.
            lastVolumeRef.current = volume;
            return;
          }

          const last = lastVolumeRef.current;
          if (last === null || last === undefined) {
            lastVolumeRef.current = volume;
            return;
          }
          if (volume === last) {
            // No delta means a system rail — re-center.
            lastVolumeRef.current = volume;
            volumeRestoringRef.current = true;
            void getVolumeManager()
              ?.setVolume(VOLUME_NAV_BASELINE, { playSound: false, showUI: false })
              .then(async () => {
                try {
                  const vm2 = getVolumeManager();
                  const { volume: actual } = (await vm2?.getVolume()) ?? { volume: VOLUME_NAV_BASELINE };
                  lastVolumeRef.current = actual;
                } catch {
                  lastVolumeRef.current = VOLUME_NAV_BASELINE;
                }
              })
              .catch(() => {
                lastVolumeRef.current = VOLUME_NAV_BASELINE;
              })
              .finally(() => {
                volumeRestoringRef.current = false;
              });
            return;
          }
          const now = Date.now();
          if (now - volumeNavGuardRef.current < config.interaction.counterGuardMs) {
            // Debounced, but the press still moved the volume — re-baseline.
            lastVolumeRef.current = volume;
            return;
          }
          volumeNavGuardRef.current = now;
          if (volume < last) {
            setCount((c) => c + 1);
            dispatch(incrementTotalCount());
            if (hapticsRef.current) triggerCountHaptic();
          } else if (volume > last) {
            setCount((c) => c + 1);
            dispatch(incrementTotalCount());
            if (hapticsRef.current) triggerCountHaptic();
          }
          lastVolumeRef.current = last;
          volumeRestoringRef.current = true;
          void getVolumeManager()
            ?.setVolume(last, { playSound: false, showUI: false })
            .then(async () => {
              try {
                const vm2 = getVolumeManager();
                const { volume: actual } = (await vm2?.getVolume()) ?? { volume: last };
                lastVolumeRef.current = actual;
              } catch {
                lastVolumeRef.current = last;
              }
            })
            .catch(() => {
              lastVolumeRef.current = last;
            })
            .finally(() => {
              volumeRestoringRef.current = false;
            });
        });
      } catch {
        // Unavailable in Expo Go — test volume keys on a custom dev build.
      }
    };

    void init();

    return () => {
      listener?.remove();
      void getVolumeManager()?.showNativeVolumeUI({ enabled: true });
      lastVolumeRef.current = null;
      volumeRestoringRef.current = false;
    };
  }, [dispatch, volumeNavEnabled]);

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
