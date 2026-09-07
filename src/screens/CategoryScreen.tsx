import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';
import { VolumeManager } from 'react-native-volume-manager';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { azkar } from '../mappers/azkarMapper';
import { setPhases, shufflePhases, resetPhases } from '../store/slices/phasesSlice';
import {
  setPhasesLengthCount,
  setIndexCount,
  resetIndexCount,
  setIsLastPhrase,
  incrementIndex,
} from '../store/slices/indexCountSlice';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { RootState } from '../store';
import { PhraseCard } from '../components/PhraseCard';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { getStoredValue, setStoredValue, removeStoredValue } from '../utils/storage';
import { t } from '../i18n';
import { useZikrAudio } from '../audio/useZikrAudio';
import { config } from '../config/config';

// Volume nav pins the system volume mid-range so both keys always produce a
// detectable delta (at the min/max rails Android fires no event).
const VOLUME_NAV_BASELINE = 0.5;
const VOLUME_NAV_RAIL_EPS = 0.02;

function logVolumeNav(...args: unknown[]) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[VolumeNav:Category]', ...args);
  }
}

export function CategoryScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Category'>>();
  const categoryId = route.params?.categoryId ?? '1';
  const categoryData = azkar.find((item) => item.id.toString() === categoryId);

  const index = useSelector((state: RootState) => state.indexCount.value);
  const categoryPhrases = useSelector((state: RootState) => state.phases.value);
  const shuffle = useSelector((state: RootState) => state.phases.shuffle);
  const wasShuffled = useSelector((state: RootState) => state.phases.wasShuffled);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const theme = getAzkarTheme(themeName);
  const autoPlayNext = useSelector((state: RootState) => state.audio.autoPlayNext);
  const audioEnabled = useSelector((state: RootState) => state.audio.audioEnabled);
  const isLastPhrase = useSelector((state: RootState) => state.indexCount.isLastPhrase);
  const volumeNavEnabled = useSelector((state: RootState) => state.volumeNav.enabled);
  const shouldAutoPlayRef = useRef(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [clicks, setClicks] = useState<number[]>([]);

  const currentPhrase = categoryPhrases[index];

  // Refs so the volume-button listener (registered once with empty deps) always
  // reads the latest index and phrase count without stale-closure issues.
  const indexRef = useRef(index);
  const maxIndexRef = useRef(categoryPhrases.length - 1);
  indexRef.current = index;
  maxIndexRef.current = categoryPhrases.length - 1;
  const phraseClicksRef = useRef(clicks[index] ?? 0);
  const phraseCountRef = useRef(currentPhrase?.count ?? 1);
  phraseClicksRef.current = clicks[index] ?? 0;
  phraseCountRef.current = currentPhrase?.count ?? 1;
  const lastVolumeRef = useRef<number | null>(null);
  const volumeNavGuardRef = useRef(0);
  const volumeRestoringRef = useRef(false);
  // Passes presses through to the OS while audio plays (#10).
  const isAudioPlayingRef = useRef(false);

  const handleAudioEnded = useCallback(() => {
    if (!audioEnabled || !autoPlayNext) return;
    if (isLastPhrase) return;
    shouldAutoPlayRef.current = true;
    dispatch(incrementIndex());
  }, [audioEnabled, autoPlayNext, isLastPhrase, dispatch]);

  const {
    status: audioStatus,
    audioAvailable,
    toggle: toggleAudio,
  } = useZikrAudio({
    phrase: currentPhrase,
    category: categoryData,
    repeatCount: currentPhrase?.count ?? 1,
    onEnded: handleAudioEnded,
  });

  useEffect(() => {
    if (!shouldAutoPlayRef.current || !audioEnabled || !currentPhrase) return;
    shouldAutoPlayRef.current = false;
    void toggleAudio();
  }, [audioEnabled, currentPhrase, toggleAudio]);

  const isAudioPlaying = audioStatus === 'playing';
  isAudioPlayingRef.current = isAudioPlaying;

  // While audio plays the native volume UI stays visible and presses pass
  // through; on stop, nav mode re-engages and the baseline re-syncs.
  useEffect(() => {
    if (!volumeNavEnabled) return;
    void VolumeManager.showNativeVolumeUI({ enabled: isAudioPlaying });
    if (!isAudioPlaying) {
      void VolumeManager.getVolume()
        .then(({ volume }) => {
          lastVolumeRef.current = volume;
        })
        .catch(() => {
          // Keep the previous baseline; listener re-baselines on next event.
        });
    }
  }, [volumeNavEnabled, isAudioPlaying]);

  // Keep the screen awake while the user is reading zikr on this screen.
  useEffect(() => {
    let active = true;
    void KeepAwake.activateKeepAwakeAsync().then(() => {
      if (!active) {
        void KeepAwake.deactivateKeepAwake();
      }
    });
    return () => {
      active = false;
      void KeepAwake.deactivateKeepAwake();
    };
  }, []);

  // Load phrases and reset per-phrase click counters when category changes
  useEffect(() => {
    if (categoryData?.phrases?.length) {
      dispatch(setPhases(categoryData.phrases));
      dispatch(setPhasesLengthCount(categoryData.phrases.length - 1));
      setClicks(new Array(categoryData.phrases.length).fill(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Restore the saved phrase index from storage (async)
  useEffect(() => {
    (async () => {
      const saved = await getStoredValue<number>(`azkar-index-${categoryId}`, 0);
      dispatch(setIndexCount(saved));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  // Persist current phrase index
  useEffect(() => {
    if (categoryPhrases.length > 0) {
      setStoredValue(`azkar-index-${categoryId}`, index);
    }
  }, [index, categoryId, categoryPhrases.length]);

  // Shuffle on first load if enabled
  useEffect(() => {
    if (shuffle && !wasShuffled && categoryPhrases.length > 0) {
      dispatch(shufflePhases());
    }
  }, [shuffle, wasShuffled, categoryPhrases.length, dispatch]);

  // Keep isLastPhrase in sync
  useEffect(() => {
    dispatch(setIsLastPhrase(categoryPhrases.length > 0 && index === categoryPhrases.length - 1));
  }, [index, categoryPhrases.length, dispatch]);

  // Resize clicks array if phrase count changes (e.g. after shuffle)
  useEffect(() => {
    if (categoryPhrases.length > 0) {
      setClicks((prev) =>
        prev.length === categoryPhrases.length ? prev : new Array(categoryPhrases.length).fill(0)
      );
    }
  }, [categoryPhrases.length]);

  // Hardware volume buttons navigate between zikr phrases. The native volume UI
  // is hidden and the volume is snapped back to its previous value so the
  // buttons act as next/previous controls without actually changing the volume.
  // Only active while the user has enabled the feature in Settings.
  // Exception (#10): while audio plays, presses control the system volume.
  useEffect(() => {
    if (!volumeNavEnabled) return;
    let listener: { remove: () => void } | null = null;

    const init = async () => {
      try {
        const { volume } = await VolumeManager.getVolume();
        let baseline = volume;
        if (baseline <= VOLUME_NAV_RAIL_EPS || baseline >= 1 - VOLUME_NAV_RAIL_EPS) {
          // At a rail no event fires — re-center so both keys work.
          logVolumeNav('volume at rail, re-centering', { volume });
          await VolumeManager.setVolume(VOLUME_NAV_BASELINE, { playSound: false, showUI: false });
          try {
            baseline = (await VolumeManager.getVolume()).volume;
          } catch {
            baseline = VOLUME_NAV_BASELINE;
          }
        }
        lastVolumeRef.current = baseline;
        logVolumeNav('listener attached', { baseline });
        await VolumeManager.showNativeVolumeUI({ enabled: false });
        listener = VolumeManager.addVolumeListener(({ volume }) => {
          if (isAudioPlayingRef.current) {
            // Audio playing: keys belong to the OS; track volume for resume.
            lastVolumeRef.current = volume;
            logVolumeNav('audio playing — passing through', { volume });
            return;
          }
          if (volumeRestoringRef.current) {
            // The swallowed press still moved the real volume — re-baseline.
            lastVolumeRef.current = volume;
            logVolumeNav('dropped during restore', { volume });
            return;
          }

          const last = lastVolumeRef.current;
          if (last === null || last === undefined) {
            lastVolumeRef.current = volume;
            return;
          }
          if (volume === last) {
            // No delta means a system rail — re-center.
            logVolumeNav('no delta (rail?), re-centering', { volume });
            lastVolumeRef.current = volume;
            volumeRestoringRef.current = true;
            void VolumeManager.setVolume(VOLUME_NAV_BASELINE, { playSound: false, showUI: false })
              .then(async () => {
                try {
                  const { volume: actual } = await VolumeManager.getVolume();
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
            logVolumeNav('dropped by guard', { volume, last });
            return;
          }
          const maxIndex = maxIndexRef.current;
          if (volume > last && indexRef.current > 0) {
            // Volume up -> go back to the previous zikr without touching the counter.
            volumeNavGuardRef.current = now;
            dispatch(setIndexCount(indexRef.current - 1));
          } else if (volume < last) {
            // Volume down -> decrement the current zikr's counter first; once it
            // reaches the phrase's required count, switch to the next zikr.
            volumeNavGuardRef.current = now;
            const idx = indexRef.current;
            const phraseCount = phraseCountRef.current;
            const currentCount = phraseClicksRef.current;
            if (currentCount < phraseCount) {
              const newCount = currentCount + 1;
              setClicks((prev) => {
                const next = [...prev];
                next[idx] = newCount;
                return next;
              });
              dispatch(incrementTotalCount());
              setIsAnimating(true);
              if (newCount >= phraseCount) {
                setTimeout(() => dispatch(incrementIndex()), 300);
              }
              setTimeout(() => setIsAnimating(false), 300);
            } else if (idx < maxIndex) {
              dispatch(incrementIndex());
            }
          }
          lastVolumeRef.current = last;
          volumeRestoringRef.current = true;
          void VolumeManager.setVolume(last, { playSound: false, showUI: false })
            .then(async () => {
              try {
                const { volume: actual } = await VolumeManager.getVolume();
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
        logVolumeNav('VolumeManager unavailable (Expo Go?)');
      }
    };

    void init();

    return () => {
      listener?.remove();
      logVolumeNav('listener detached');
      void VolumeManager.showNativeVolumeUI({ enabled: true });
      lastVolumeRef.current = null;
      volumeRestoringRef.current = false;
    };
  }, [dispatch, volumeNavEnabled, setClicks, setIsAnimating]);

  // Reset store on unmount to cover the native back gesture path
  useEffect(() => {
    return () => {
      dispatch(resetPhases());
      dispatch(resetIndexCount());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhraseClick = useCallback(() => {
    const phraseCount = categoryPhrases[index]?.count ?? 0;
    const currentCount = clicks[index] ?? 0;
    if (currentCount >= phraseCount) return;

    const newCount = currentCount + 1;
    setClicks((prev) => {
      const next = [...prev];
      next[index] = newCount;
      return next;
    });
    dispatch(incrementTotalCount());
    setIsAnimating(true);

    if (newCount >= phraseCount) {
      setTimeout(() => dispatch(incrementIndex()), 300);
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, [clicks, index, categoryPhrases, dispatch]);

  const handleReset = useCallback(async () => {
    await removeStoredValue(`azkar-index-${categoryId}`);
    dispatch(setIndexCount(0));
    setClicks(new Array(categoryData?.phrases?.length ?? 0).fill(0));
  }, [categoryId, categoryData?.phrases?.length, dispatch]);

  // Home button: clear saved index and return to Categories
  const handleBack = useCallback(async () => {
    await removeStoredValue(`azkar-index-${categoryId}`);
    dispatch(resetIndexCount());
    dispatch(resetPhases());
    navigation.navigate('Categories');
  }, [categoryId, dispatch, navigation]);

  if (!categoryData || !currentPhrase) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
        <Text style={[styles.loadingText, { color: theme.textColor }]}>{t('loadingDhikr')}</Text>
      </View>
    );
  }

  return (
    <PhraseCard
      phrase={currentPhrase}
      counter={clicks[index] ?? 0}
      onPhraseClick={handlePhraseClick}
      isAnimating={isAnimating}
      onBack={handleBack}
      onReset={handleReset}
      categoryName={categoryData.title}
      audioEnabled={audioEnabled}
      audioAvailable={audioAvailable}
      audioStatus={audioStatus}
      onToggleAudio={toggleAudio}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 20, textAlign: 'center', fontFamily: AZKAR_PRIMARY_FONT },
});
