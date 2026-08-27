import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
  const shouldAutoPlayRef = useRef(false);

  const currentPhrase = categoryPhrases[index];

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

  const [isAnimating, setIsAnimating] = useState(false);
  const [clicks, setClicks] = useState<number[]>([]);

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
