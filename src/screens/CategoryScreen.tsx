import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler, StyleSheet, View, Text } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';
import { getVolumeManager } from '../utils/volumeManager';
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
import { completeCategory } from '../store/slices/milestonesSlice';
import { RootState } from '../store';
import { PhraseCard } from '../components/PhraseCard';
import { CategoryDialog } from '../components/CategoryDialog';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { getStoredValue, setStoredValue, removeStoredValue } from '../utils/storage';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { useZikrAudio } from '../audio/useZikrAudio';
import { triggerCountHaptic } from '../utils/haptics';
import { config } from '../config/config';
import { isFeatureEnabled } from '../config/features';

// Volume nav pins the system volume mid-range so both keys always produce a
// detectable delta (at the min/max rails Android fires no event).
const VOLUME_NAV_BASELINE = 0.5;
const VOLUME_NAV_RAIL_EPS = 0.02;

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
  const hapticsEnabled = useSelector((state: RootState) => state.haptics.enabled);
  const shouldAutoPlayRef = useRef(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [clicks, setClicks] = useState<number[]>([]);
  // #37 completion notice + #38 exit confirmation dialog state.
  const [completionVisible, setCompletionVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  // Exactly-once guard for the completion notice, per category visit.
  const completionShownRef = useRef(false);
  // Lets an approved Leave pass through beforeRemove without re-intercepting.
  const allowLeaveRef = useRef(false);
  // Which back path is awaiting confirmation: header button or system back.
  const pendingSourceRef = useRef<'header' | 'back' | null>(null);

  // Progress derivation from clicks (not index): swipes and audio auto-advance
  // move the index without counting, so only counted taps measure progress.
  const completedItems = categoryPhrases.filter((phrase, i) => (clicks[i] ?? 0) >= phrase.count).length;
  const totalTaps = clicks.reduce((sum, n) => sum + (n ?? 0), 0);
  const allComplete =
    categoryPhrases.length > 0 &&
    clicks.length === categoryPhrases.length &&
    completedItems === categoryPhrases.length;
  const allCompleteRef = useRef(allComplete);
  allCompleteRef.current = allComplete;
  // Mirrored for the mount-once BackHandler/beforeRemove listeners.
  const totalTapsRef = useRef(totalTaps);
  totalTapsRef.current = totalTaps;

  const currentPhrase = categoryPhrases[index];
  const remainingCount = Math.max(0, (currentPhrase?.count ?? 1) - (clicks[index] ?? 0));

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
  // Latest haptics flag for the volume listener and audio-loop callback,
  // which cannot read fresh Redux state without re-registering.
  const hapticsRef = useRef(hapticsEnabled);
  hapticsRef.current = hapticsEnabled;
  const lastVolumeRef = useRef<number | null>(null);
  const volumeNavGuardRef = useRef(0);
  const volumeRestoringRef = useRef(false);
  // Passes presses through to the OS while audio plays (#10).
  const isAudioPlayingRef = useRef(false);
  // Playback intent survives Redux-status gaps (status events not delivered
  // on a device): set on play press, cleared on pause/finish/error.
  const playIntentRef = useRef(false);

  const handleAudioLoop = useCallback(() => {
    const idx = indexRef.current;
    const phraseCount = phraseCountRef.current;
    const currentCount = phraseClicksRef.current;
    if (currentCount >= phraseCount) return;
    const newCount = currentCount + 1;
    setClicks((prev) => {
      const next = [...prev];
      next[idx] = newCount;
      return next;
    });
    dispatch(incrementTotalCount());
    if (hapticsRef.current) triggerCountHaptic();
    setIsAnimating(true);
    if (newCount >= phraseCount) {
      setTimeout(() => dispatch(incrementIndex()), 300);
    }
    // Natural count-through of the final phrase completes the category.
    // Resets navigate without counting, so they never reach this branch.
    if (newCount >= phraseCount && idx === maxIndexRef.current) {
      dispatch(completeCategory(categoryId));
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, [dispatch, categoryId]);

  const handleAudioEnded = useCallback(() => {
    if (!audioEnabled || !autoPlayNext) return;
    if (isLastPhrase) return;
    shouldAutoPlayRef.current = true;
  }, [audioEnabled, autoPlayNext, isLastPhrase]);

  const {
    status: audioStatus,
    audioAvailable,
    toggle: toggleAudio,
    rate: audioRate,
    setRate: setAudioRate,
    seekTo: seekAudioTo,
  } = useZikrAudio({
    phrase: currentPhrase,
    category: categoryData,
    repeatCount: remainingCount > 0 ? remainingCount : 1,
    onLoop: handleAudioLoop,
    onEnded: handleAudioEnded,
  });

  useEffect(() => {
    if (!shouldAutoPlayRef.current || !audioEnabled || !currentPhrase) return;
    shouldAutoPlayRef.current = false;
    playIntentRef.current = true;
    void toggleAudio();
  }, [audioEnabled, currentPhrase, toggleAudio]);

  const isAudioPlaying = audioStatus === 'playing';
  isAudioPlayingRef.current = isAudioPlaying;
  const audioStatusRef = useRef(audioStatus);
  audioStatusRef.current = audioStatus;
  // Intent covers the windows Redux status misses (loading before the first
  // event, or events lost on device): after a play press, keys mean volume
  // until pause, finish, error, or missing audio.
  const audioActive = isAudioPlaying || playIntentRef.current;

  const handleToggleAudio = useCallback(() => {
    playIntentRef.current = audioStatus !== 'playing';
    void toggleAudio();
  }, [audioStatus, toggleAudio]);

  // Speed cycles are guarded against double taps; seeks are gesture-committed
  // (one commit per release) so they pass straight through.
  const handleRateChange = useTimeGuardedCallback(
    (rate: number) => setAudioRate(rate),
    config.interaction.navButtonGuardMs
  );

  const handleSeekAudio = useCallback(
    (seconds: number) => {
      void seekAudioTo(seconds);
    },
    [seekAudioTo]
  );

  useEffect(() => {
    if (
      audioStatus === 'paused' ||
      audioStatus === 'finished' ||
      audioStatus === 'error' ||
      audioStatus === 'missing'
    ) {
      playIntentRef.current = false;
    }
  }, [audioStatus]);

  // While audio is active the native volume UI stays visible and presses pass
  // through; otherwise nav mode re-engages and the baseline re-syncs.
  useEffect(() => {
    if (!isFeatureEnabled('volumeNav')) return;
    if (!volumeNavEnabled) return;
    const vm = getVolumeManager();
    if (!vm) return;
    void vm.showNativeVolumeUI({ enabled: audioActive });
    if (!audioActive) {
      void vm
        .getVolume()
        .then(({ volume }) => {
          lastVolumeRef.current = volume;
        })
        .catch(() => {
          // Keep the previous baseline; listener re-baselines on next event.
        });
    }
  }, [volumeNavEnabled, audioActive, audioStatus]);

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

  // Fresh dialog state per category visit.
  useEffect(() => {
    completionShownRef.current = false;
    allowLeaveRef.current = false;
    pendingSourceRef.current = null;
    setCompletionVisible(false);
    setExitVisible(false);
  }, [categoryId]);

  // #37: show the completion notice exactly once, when every phrase has been
  // counted through. clicks[] starts at zero and only grows via natural
  // count-through (tap / audio loop / volume-down), so restores, swipes and
  // resets can never satisfy this — only real completion fires it.
  useEffect(() => {
    if (allComplete && !completionShownRef.current) {
      completionShownRef.current = true;
      setCompletionVisible(true);
    }
  }, [allComplete]);

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
  // Only active while the user has enabled the feature in Settings and
  // the global volumeNav feature flag is on.
  // Exception (#10): while audio is active, presses control system volume.
  useEffect(() => {
    if (!isFeatureEnabled('volumeNav')) return;
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
          if (isAudioPlayingRef.current || playIntentRef.current) {
            // Audio active: keys belong to the OS; track volume for resume.
            lastVolumeRef.current = volume;
            return;
          }
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
              if (hapticsRef.current) triggerCountHaptic();
              setIsAnimating(true);
              if (newCount >= phraseCount) {
                setTimeout(() => dispatch(incrementIndex()), 300);
              }
              // Natural count-through of the final phrase completes the category.
              if (newCount >= phraseCount && idx === maxIndex) {
                dispatch(completeCategory(categoryId));
              }
              setTimeout(() => setIsAnimating(false), 300);
            } else if (idx < maxIndex) {
              dispatch(incrementIndex());
            }
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
  }, [dispatch, volumeNavEnabled, categoryId, setClicks, setIsAnimating]);

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
    if (hapticsEnabled) triggerCountHaptic();
    setIsAnimating(true);

    if (newCount >= phraseCount) {
      setTimeout(() => dispatch(incrementIndex()), 300);
    }
    // Natural count-through of the final phrase completes the category.
    if (newCount >= phraseCount && index === categoryPhrases.length - 1) {
      dispatch(completeCategory(categoryId));
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, [clicks, index, categoryPhrases, categoryId, dispatch, hapticsEnabled]);

  // Header-back leave: clear saved index and return to Categories.
  const doLeaveHeader = useCallback(async () => {
    allowLeaveRef.current = true;
    await removeStoredValue(`azkar-index-${categoryId}`);
    dispatch(resetIndexCount());
    dispatch(resetPhases());
    navigation.navigate('Categories');
  }, [categoryId, dispatch, navigation]);

  // #38: header back confirms when progress exists but the category is
  // incomplete (zero taps = nothing to confirm, leave silently).
  const requestHeaderBack = useCallback(() => {
    if (allCompleteRef.current || totalTapsRef.current === 0) {
      void doLeaveHeader();
      return;
    }
    pendingSourceRef.current = 'header';
    setExitVisible(true);
  }, [doLeaveHeader]);

  // PhraseCard calls onBack raw, so guard here against double taps.
  const handleBack = useTimeGuardedCallback(requestHeaderBack, config.interaction.navButtonGuardMs);

  // #38: system back (Android hardware key, iOS gesture, web) confirms the
  // same way; Leave keeps the existing native-back behavior (goBack preserves
  // the saved index, unlike the header path which clears it).
  const handleExitContinue = useCallback(() => {
    pendingSourceRef.current = null;
    setExitVisible(false);
  }, []);

  const handleExitLeave = useCallback(() => {
    const source = pendingSourceRef.current;
    pendingSourceRef.current = null;
    allowLeaveRef.current = true;
    setExitVisible(false);
    if (source === 'header') {
      void doLeaveHeader();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Categories');
    }
  }, [doLeaveHeader, navigation]);

  const handleCompletionDismiss = useCallback(() => {
    // Dismiss only — clicks/index progress is left intact.
    setCompletionVisible(false);
  }, []);

  // Android hardware back key. Consumed while incomplete so the dialog shows
  // instead; complete (or zero taps) falls through to the default behavior.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (allowLeaveRef.current || allCompleteRef.current || totalTapsRef.current === 0) {
        return false;
      }
      pendingSourceRef.current = 'back';
      setExitVisible(true);
      return true;
    });
    return () => subscription.remove();
  }, []);

  // iOS swipe-back gesture + web navigation. Non-GO_BACK removals (e.g. the
  // Settings gear navigating away) are never blocked.
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type !== 'GO_BACK' && e.data.action.type !== 'POP') return;
      if (allowLeaveRef.current || allCompleteRef.current || totalTapsRef.current === 0) return;
      e.preventDefault();
      pendingSourceRef.current = 'back';
      setExitVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  if (!categoryData || !currentPhrase) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
        <Text style={[styles.loadingText, { color: theme.textColor }]}>{t('loadingDhikr')}</Text>
      </View>
    );
  }

  return (
    <>
      <PhraseCard
        phrase={currentPhrase}
        counter={clicks[index] ?? 0}
        onPhraseClick={handlePhraseClick}
        isAnimating={isAnimating}
        onBack={handleBack}
        categoryName={categoryData.title}
        audioEnabled={audioEnabled}
        audioAvailable={audioAvailable}
        audioStatus={audioStatus}
        onToggleAudio={handleToggleAudio}
        audioRate={audioRate}
        onRateChange={handleRateChange}
        onSeekAudio={handleSeekAudio}
      />
      <CategoryDialog
        visible={completionVisible}
        icon="checkmark-circle-outline"
        title={t('categoryCompleteTitle')}
        body={t('categoryCompleteBody').replace('{count}', formatNumber(categoryPhrases.length))}
        actions={[{ label: t('close'), onPress: handleCompletionDismiss, primary: true }]}
        onRequestClose={handleCompletionDismiss}
        accessibilityLabel={t('categoryCompleteTitle')}
      />
      <CategoryDialog
        visible={exitVisible}
        icon="exit-outline"
        title={t('exitIncompleteTitle')}
        body={t('exitIncompleteBody').replace('{count}', formatNumber(completedItems))}
        actions={[
          { label: t('continueReading'), onPress: handleExitContinue, primary: true },
          { label: t('leaveCategory'), onPress: handleExitLeave },
        ]}
        onRequestClose={handleExitContinue}
        accessibilityLabel={t('exitIncompleteTitle')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 20, textAlign: 'center', fontFamily: AZKAR_PRIMARY_FONT },
});
