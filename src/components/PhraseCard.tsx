import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import { config } from '../config/config';
import { decrementIndex, incrementIndex, setIsLastPhrase } from '../store/slices/indexCountSlice';
import { incrementTotalCount } from '../store/slices/totalCountSlice';
import { RootState } from '../store';
import type { AzkarPhrase } from '../mappers/azkarMapper';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

export function PhraseCard({ phrase, categoryName }: { phrase: AzkarPhrase; categoryName: string }) {
  const dispatch = useDispatch();
  const [counter, setCounter] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexCount = useSelector((state: RootState) => state.indexCount.value);
  const phasesLength = useSelector((state: RootState) => state.indexCount.phasesLength);
  const isLastPhrase = useSelector((state: RootState) => state.indexCount.isLastPhrase);
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const theme = useSelector((state: RootState) => state.theme.value);

  useEffect(() => {
    dispatch(setIsLastPhrase(indexCount === phasesLength));
  }, [dispatch, indexCount, phasesLength]);

  const remainingCount = Math.max(phrase.count - counter, 0);

  const themeColors = getAzkarTheme(theme);

  const handleCounterPress = () => {
    if (counter >= phrase.count) return;
    setIsAnimating(true);
    const nextCounter = counter + 1;
    setCounter(nextCounter);
    dispatch(incrementTotalCount());
    if (nextCounter >= phrase.count) {
      setTimeout(() => dispatch(incrementIndex()), 300);
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  const startLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      Clipboard.setString(phrase.text);
    }, config.interaction.longPressMs);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContentPress = () => {
    if (longPressTriggered) {
      setLongPressTriggered(false);
      return;
    }
    handleCounterPress();
  };

  const goBack = () => {
    dispatch(decrementIndex());
  };

  const progressPercentage = phasesLength > 0 ? (indexCount / phasesLength) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bgColor }]}> 
      <View style={[styles.card, { backgroundColor: themeColors.cardBgColor, borderColor: themeColors.buttonBorderColor }]}> 
        <View style={styles.header}> 
          <Text style={[styles.category, { color: themeColors.secondaryTextColor }]}>{categoryName}</Text>
          <View style={styles.progressWrap}> 
            <View style={[styles.progressBar, { backgroundColor: themeColors.sliderBg }]}> 
              <View style={[styles.progressFill, { width: `${progressPercentage}%`, backgroundColor: themeColors.sliderBgActive }]} /> 
            </View>
          </View>
        </View>

        <Pressable
          onPress={handleContentPress}
          onLongPress={startLongPress}
          onPressOut={cancelLongPress}
          style={styles.phraseArea}
        >
          <Text style={[styles.phraseText, { color: themeColors.textColor, fontSize: fontScale * 16 }]}>{phrase.text}</Text>
          {showSubText && phrase.subtext ? <Text style={[styles.subtext, { color: themeColors.secondaryTextColor }]}>{phrase.subtext}</Text> : null}
        </Pressable>

        <View style={styles.footer}> 
          <Pressable
            onPress={goBack}
            disabled={indexCount === 0}
            style={[styles.navButton, { backgroundColor: themeColors.buttonBgColor, borderColor: themeColors.buttonBorderColor }]}
          >
            <Text style={[styles.navText, { color: indexCount === 0 ? themeColors.secondaryTextColor : themeColors.textColor }]}>السابق</Text>
          </Pressable>

          <Pressable
            onPress={handleCounterPress}
            style={[
              styles.counterButton,
              { backgroundColor: themeColors.buttonBgColor, borderColor: themeColors.buttonBorderColor },
              isAnimating && styles.counterButtonActive,
            ]}
          >
            <Text style={[styles.counterText, { color: themeColors.iconColor }]}>{remainingCount}</Text>
          </Pressable>

          <Pressable
            onPress={() => dispatch(incrementIndex())}
            disabled={isLastPhrase}
            style={[styles.navButton, { backgroundColor: themeColors.buttonBgColor, borderColor: themeColors.buttonBorderColor }]}
          >
            <Text style={[styles.navText, { color: isLastPhrase ? themeColors.secondaryTextColor : themeColors.textColor }]}>التالي</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  card: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, justifyContent: 'space-between' },
  header: { marginBottom: 12 },
  category: { fontSize: 13, textAlign: 'center', marginBottom: 8, fontFamily: AZKAR_PRIMARY_FONT },
  progressWrap: { marginTop: 6 },
  progressBar: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  phraseArea: { flex: 1, justifyContent: 'center', paddingVertical: 12 },
  phraseText: { textAlign: 'center', lineHeight: 32, writingDirection: 'rtl', fontFamily: AZKAR_PRIMARY_FONT, fontWeight: '700' },
  subtext: { textAlign: 'center', marginTop: 12, lineHeight: 22, fontFamily: AZKAR_PRIMARY_FONT },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  navButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  navText: { fontFamily: AZKAR_PRIMARY_FONT },
  counterButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
  counterButtonActive: { transform: [{ scale: 0.97 }] },
  counterText: { fontSize: 28, fontWeight: '800', fontFamily: AZKAR_PRIMARY_FONT },
});
