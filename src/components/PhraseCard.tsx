import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { decrementIndex, incrementIndex } from '../store/slices/indexCountSlice';
import { decrementFontScale, incrementFontScale } from '../store/slices/fontScaleSlice';
import { RootState } from '../store';
import type { AzkarPhrase } from '../mappers/azkarMapper';
import { config } from '../config/config';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { AZKAR_PRIMARY_FONT, AZKAR_COUNTER_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';
import type { PlaybackStatus } from '../store/slices/playbackSlice';

const SWIPE_THRESHOLD = 50;
const SWIPE_ANIMATION_DURATION = 200;

type PhraseCardProps = {
  phrase: AzkarPhrase;
  counter: number;
  onPhraseClick: () => void;
  isAnimating: boolean;
  onBack: () => void;
  onReset: () => void;
  categoryName: string;
  audioEnabled: boolean;
  audioAvailable: boolean;
  audioStatus: PlaybackStatus;
  onToggleAudio: () => void;
};

export function PhraseCard({
  phrase,
  counter,
  onPhraseClick,
  isAnimating,
  onBack,
  onReset,
  categoryName,
  audioEnabled,
  audioAvailable,
  audioStatus,
  onToggleAudio,
}: PhraseCardProps) {
  const dispatch = useDispatch();

  const { width: screenWidth } = useWindowDimensions();

  const indexCount = useSelector((state: RootState) => state.indexCount.value);
  const phasesLength = useSelector((state: RootState) => state.indexCount.phasesLength);
  const isLastPhrase = useSelector((state: RootState) => state.indexCount.isLastPhrase);
  const allPhrases = useSelector((state: RootState) => state.phases.value);
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const colors = getAzkarTheme(themeName);

  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressPercentage = phasesLength > 0 ? (indexCount / phasesLength) * 100 : 0;
  const remainingCount = Math.max(phrase.count - counter, 0);
  const canGoBack = indexCount > 0;
  const canGoForward = !isLastPhrase;

  // Adjacent phrases for the carousel
  const prevPhrase = allPhrases[indexCount - 1] ?? null;
  const nextPhrase = allPhrases[indexCount + 1] ?? null;

  // useMemo keeps Animated values stable across renders without touching refs during render
  const translateX = useMemo(() => new Animated.Value(0), []);
  // Prev sits to the right (+screenWidth), next sits to the left (-screenWidth)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prevOffset = useMemo(() => new Animated.Value(screenWidth), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextOffset = useMemo(() => new Animated.Value(-screenWidth), []);
  const prevTranslateX = useMemo(() => Animated.add(translateX, prevOffset), [translateX, prevOffset]);
  const nextTranslateX = useMemo(() => Animated.add(translateX, nextOffset), [translateX, nextOffset]);

  // Fabric requires onGestureEvent to be a plain function, not an AnimatedEvent object
  const onGestureEvent = useCallback(
    (event: any) => {
      translateX.setValue(event.nativeEvent.translationX);
    },
    [translateX]
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) return;
    const dx = event.nativeEvent.translationX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0 && !canGoBack) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        return;
      }
      if (dx > 0 && !canGoForward) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        return;
      }
      Animated.timing(translateX, {
        toValue: dx > 0 ? screenWidth : -screenWidth,
        duration: SWIPE_ANIMATION_DURATION,
        useNativeDriver: false,
      }).start(() => {
        translateX.setValue(0);
        dispatch(dx > 0 ? incrementIndex() : decrementIndex());
      });
    } else {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
    }
  };

  const guardedCounterPress = useTimeGuardedCallback(onPhraseClick, config.interaction.counterGuardMs);

  const startLongPress = () => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      Clipboard.setStringAsync(phrase.text);
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
    guardedCounterPress();
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bgColor }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBgColor }]}>
        <View style={styles.header}>
          <View style={[styles.headerSide, styles.headerRight]}>
            <Pressable style={styles.headerIconBtn} onPress={onBack} accessibilityLabel={t('back')}>
              <Ionicons name="chevron-forward" size={22} color={colors.textColor} />
            </Pressable>
            <Pressable style={styles.headerIconBtn} onPress={onReset} accessibilityLabel={t('reset')}>
              <Ionicons name="refresh-outline" size={20} color={colors.textColor} />
            </Pressable>
          </View>

          <View style={styles.headerCenter}>
            <View style={[styles.progressTrack, { backgroundColor: colors.sliderBg }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` as any, backgroundColor: colors.sliderBgActive },
                ]}
              />
              <Text style={[styles.categoryLabel, { color: colors.textColor }]}>{categoryName}</Text>
            </View>
          </View>

          <View style={styles.headerSide}>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => dispatch(decrementFontScale())}
              accessibilityLabel={t('decreaseFontSize')}
            >
              <Ionicons name="remove" size={20} color={colors.textColor} />
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => dispatch(incrementFontScale())}
              accessibilityLabel={t('increaseFontSize')}
            >
              <Ionicons name="add" size={20} color={colors.textColor} />
            </Pressable>
          </View>
        </View>

        {/* Carousel: prev/current/next phrases slide together during the gesture */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={[-5, 5]}
          failOffsetY={[-20, 20]}
        >
          <View style={styles.phraseArea}>
            {/* Previous phrase — sits to the right in RTL, slides in on left-swipe */}
            <Animated.View style={[styles.absoluteCard, { transform: [{ translateX: prevTranslateX }] }]}>
              {prevPhrase && (
                <ScrollView
                  contentContainerStyle={styles.phraseScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={[
                      styles.phraseText,
                      { color: colors.textColor, fontSize: fontScale * 16, lineHeight: fontScale * 16 * 1.8 },
                    ]}
                  >
                    {prevPhrase.text}
                  </Text>
                  {showSubText && prevPhrase.subtext ? (
                    <>
                      <View style={[styles.divider, { borderColor: colors.buttonBorderColor }]} />
                      <Text
                        style={[
                          styles.subtext,
                          { color: colors.secondaryTextColor, fontSize: (fontScale - 0.4) * 16 },
                        ]}
                      >
                        {prevPhrase.subtext}
                      </Text>
                    </>
                  ) : null}
                </ScrollView>
              )}
            </Animated.View>

            {/* Current phrase — center */}
            <Animated.View style={[styles.absoluteCard, { transform: [{ translateX }] }]}>
              <Pressable
                onPress={handleContentPress}
                onLongPress={startLongPress}
                onPressOut={cancelLongPress}
                style={styles.phraseAreaInner}
              >
                <ScrollView
                  contentContainerStyle={styles.phraseScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={[
                      styles.phraseText,
                      { color: colors.textColor, fontSize: fontScale * 16, lineHeight: fontScale * 16 * 1.8 },
                    ]}
                  >
                    {phrase.text}
                  </Text>
                  {showSubText && phrase.subtext ? (
                    <>
                      <View style={[styles.divider, { borderColor: colors.buttonBorderColor }]} />
                      <Text
                        style={[
                          styles.subtext,
                          { color: colors.secondaryTextColor, fontSize: (fontScale - 0.4) * 16 },
                        ]}
                      >
                        {phrase.subtext}
                      </Text>
                    </>
                  ) : null}
                </ScrollView>
              </Pressable>
            </Animated.View>

            {/* Next phrase — sits to the left in RTL, slides in on right-swipe */}
            <Animated.View style={[styles.absoluteCard, { transform: [{ translateX: nextTranslateX }] }]}>
              {nextPhrase && (
                <ScrollView
                  contentContainerStyle={styles.phraseScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text
                    style={[
                      styles.phraseText,
                      { color: colors.textColor, fontSize: fontScale * 16, lineHeight: fontScale * 16 * 1.8 },
                    ]}
                  >
                    {nextPhrase.text}
                  </Text>
                  {showSubText && nextPhrase.subtext ? (
                    <>
                      <View style={[styles.divider, { borderColor: colors.buttonBorderColor }]} />
                      <Text
                        style={[
                          styles.subtext,
                          { color: colors.secondaryTextColor, fontSize: (fontScale - 0.4) * 16 },
                        ]}
                      >
                        {nextPhrase.subtext}
                      </Text>
                    </>
                  ) : null}
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </PanGestureHandler>
      </View>
      <View style={styles.footer}>
        {/* 
          <Pressable
            style={[
              styles.iconBtn,
              { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              !canGoForward && styles.invisible,
            ]}
            onPress={() => dispatch(incrementIndex())}
            disabled={!canGoForward}
            accessibilityLabel={t('nextDhikr')}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textColor} />
          </Pressable>
        */}

        <View style={styles.counterGroup}>
          <Pressable
            style={[
              styles.counterBtn,
              { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              isAnimating && styles.counterBtnActive,
            ]}
            onPress={guardedCounterPress}
            accessibilityLabel={`${t('remainingCount')}${formatNumber(remainingCount)}`}
          >
            <Text style={[styles.counterText, { color: colors.iconColor }]}>
              {formatNumber(remainingCount)}
            </Text>
          </Pressable>
          {audioEnabled && audioAvailable ? (
            <Pressable
              style={[
                styles.audioBtn,
                styles.audioControl,
                { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              ]}
              onPress={onToggleAudio}
              disabled={audioStatus === 'loading' || audioStatus === 'error'}
              accessibilityLabel={audioStatus === 'playing' ? t('pauseAudio') : t('playAudio')}
            >
              {audioStatus === 'loading' ? (
                <ActivityIndicator size="small" color={colors.textColor} />
              ) : (
                <Ionicons
                  name={audioStatus === 'playing' ? 'pause' : 'play'}
                  size={20}
                  color={colors.textColor}
                />
              )}
            </Pressable>
          ) : (
            <View style={[styles.audioBtnPlaceholder, styles.audioControl]} />
          )}
        </View>

        {/* 
          <Pressable
            style={[
              styles.iconBtn,
              { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
              !canGoBack && styles.invisible,
            ]}
            onPress={() => dispatch(decrementIndex())}
            disabled={!canGoBack}
            accessibilityLabel={t('previousDhikr')}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.textColor} />
          </Pressable>
        */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, padding: 16 },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerSide: { flexDirection: 'row', gap: 8 },
  headerRight: { justifyContent: 'flex-end' },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 8, gap: 4 },
  progressTrack: {
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: { position: 'absolute', right: 0, top: 0, bottom: 0, borderRadius: 999 },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 12,
    paddingVertical: 5,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 0 },
  },
  iconBtn: {
    width: 37,
    height: 37,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtn: {
    width: 37,
    height: 37,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseArea: { flex: 1, overflow: 'hidden' },
  absoluteCard: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  phraseAreaInner: { flex: 1 },
  phraseScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  phraseText: {
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: AZKAR_PRIMARY_FONT,
    fontWeight: '700',
  },
  divider: { borderTopWidth: 1, width: '100%', marginVertical: 12 },
  subtext: { textAlign: 'center', lineHeight: 26, fontFamily: AZKAR_PRIMARY_FONT, writingDirection: 'rtl' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  counterGroup: { position: 'relative' },
  invisible: { opacity: 0 },
  counterBtn: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtn: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtnPlaceholder: { width: 54, height: 54 },
  audioControl: { position: 'absolute', right: -64, top: 17 },
  counterBtnActive: { transform: [{ scale: 0.94 }] },
  counterText: { fontSize: 32, fontWeight: '800', fontFamily: AZKAR_COUNTER_FONT },
});
