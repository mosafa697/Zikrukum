import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setIndexCount } from '../store/slices/indexCountSlice';
import { decrementFontScale, incrementFontScale } from '../store/slices/fontScaleSlice';
import { RootState } from '../store';
import type { AzkarPhrase } from '../mappers/azkarMapper';
import { config } from '../config/config';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { AZKAR_PRIMARY_FONT, AZKAR_COUNTER_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';
import type { PlaybackStatus } from '../store/slices/playbackSlice';
import { AudioPlayerBar } from './AudioPlayerBar';

// Fallback commit runs a short time after the last scroll event so web (no
// momentum events) and slow drag releases still sync the Redux index to the page.
const SWIPE_SETTLE_MS = 120;

// Native builds force RTL app-wide (I18nManager.forceRTL in index.ts), so the
// horizontal list already pages right-to-left there. On web forceRTL is a no-op,
// so the list pages left-to-right; we mirror it (scaleX: -1) to present RTL.
const RTL_MIRROR_SCALE = I18nManager.isRTL ? 1 : -1;

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

  const index = useSelector((state: RootState) => state.indexCount.value);
  const phasesLength = useSelector((state: RootState) => state.indexCount.phasesLength);
  const allPhrases = useSelector((state: RootState) => state.phases.value);
  const showSubText = useSelector((state: RootState) => state.subText.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const colors = getAzkarTheme(themeName);

  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phraseOverflow, setPhraseOverflow] = useState(false);
  const phraseOverflowRef = useRef(false);

  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const pagerRef = useRef<FlatList<AzkarPhrase>>(null);
  const expectedIndexRef = useRef(index);
  const latestOffsetRef = useRef(0);
  const isFirstSync = useRef(true);
  const isDraggingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressPercentage = phasesLength > 0 ? (index / phasesLength) * 100 : 0;
  const remainingCount = Math.max(phrase.count - counter, 0);

  // User swipes -> Redux: commit the page the pager settled on (idempotent).
  const toFlowX = useCallback(
    (rawX: number) => {
      if (pageSize.width <= 0 || allPhrases.length === 0) return rawX;
      // RN's horizontal RTL virtualized list passes the raw native offset
      // through to onScroll/onMomentumScrollEnd, but getItemLayout/scrollToOffset
      // use flow-relative (LTR) offsets. Convert raw -> flow to match RN's own
      // _offsetFromScrollEvent so the page parsed here always matches the pager.
      return I18nManager.isRTL ? pageSize.width * allPhrases.length - pageSize.width - rawX : rawX;
    },
    [pageSize.width, allPhrases.length]
  );

  const commitScrollEnd = useCallback(
    (x: number) => {
      if (pageSize.width <= 0 || allPhrases.length === 0) return;
      const page = Math.min(Math.max(Math.round(toFlowX(x) / pageSize.width), 0), allPhrases.length - 1);
      if (page !== expectedIndexRef.current) {
        expectedIndexRef.current = page;
        dispatch(setIndexCount(page));
      }
    },
    [pageSize.width, allPhrases.length, toFlowX, dispatch]
  );

  // Redux index -> pager: animate the pager to the requested phrase. Covers
  // reset, counter-complete advance, audio auto-advance and saved-index restore.
  // Also re-aligns the pager when the phrase-area width changes (rotation/resize).
  useEffect(() => {
    if (pageSize.width <= 0) return;
    const desiredOffset = index * pageSize.width;
    expectedIndexRef.current = index;
    if (Math.abs(latestOffsetRef.current - desiredOffset) < 1) {
      return; // pager already shows the requested phrase
    }
    const animated = !isFirstSync.current;
    isFirstSync.current = false;
    pagerRef.current?.scrollToOffset({ offset: desiredOffset, animated });
  }, [index, pageSize.width]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      latestOffsetRef.current = toFlowX(x);
      if (isDraggingRef.current) return;
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => commitScrollEnd(x), SWIPE_SETTLE_MS);
    },
    [commitScrollEnd, toFlowX]
  );

  const handleScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      latestOffsetRef.current = toFlowX(event.nativeEvent.contentOffset.x);
      commitScrollEnd(event.nativeEvent.contentOffset.x);
    },
    [commitScrollEnd, toFlowX]
  );

  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  // Reset the per-phrase overflow indicator whenever the active phrase changes.
  useEffect(() => {
    phraseOverflowRef.current = false;
    setPhraseOverflow(false);
  }, [index]);

  const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPageSize({ width, height });
  }, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<AzkarPhrase> | null | undefined, itemIndex: number) => ({
      length: pageSize.width,
      offset: pageSize.width * itemIndex,
      index: itemIndex,
    }),
    [pageSize.width]
  );

  const guardedCounterPress = useTimeGuardedCallback(onPhraseClick, config.interaction.counterGuardMs);

  const startLongPress = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      Clipboard.setStringAsync(phrase.text);
    }, config.interaction.longPressMs);
  }, [phrase.text]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleContentPress = useCallback(() => {
    if (longPressTriggered) {
      setLongPressTriggered(false);
      return;
    }
    guardedCounterPress();
  }, [longPressTriggered, guardedCounterPress]);

  const renderPhrasePage = useCallback(
    (info: ListRenderItemInfo<AzkarPhrase>) => {
      const { item, index: itemIndex } = info;
      const isActive = itemIndex === index;
      const content = (
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={[styles.phraseScrollContent, phraseOverflow && styles.phraseScrollNoCenter]}
          showsVerticalScrollIndicator
          persistentScrollbar
          nestedScrollEnabled
          onContentSizeChange={(contentW, contentH) => {
            if (
              itemIndex === index &&
              contentH >= 1 &&
              phraseOverflowRef.current !== contentH > pageSize.height
            ) {
              phraseOverflowRef.current = contentH > pageSize.height;
              setPhraseOverflow(phraseOverflowRef.current);
            }
          }}
        >
          <Text
            style={[
              styles.phraseText,
              { color: colors.textColor, fontSize: fontScale * 16, lineHeight: fontScale * 16 * 1.8 },
            ]}
          >
            {item.text}
          </Text>
        </ScrollView>
      );
      return (
        <View
          style={{
            width: pageSize.width,
            height: pageSize.height,
            transform: [{ scaleX: RTL_MIRROR_SCALE }],
          }}
        >
          {isActive ? (
            <Pressable
              onPress={handleContentPress}
              onLongPress={startLongPress}
              onPressOut={cancelLongPress}
              style={styles.phraseAreaInner}
            >
              {content}
              {phraseOverflow ? (
                <LinearGradient
                  colors={['transparent', colors.cardBgColor]}
                  pointerEvents="none"
                  style={styles.overflowFade}
                />
              ) : null}
            </Pressable>
          ) : (
            content
          )}
        </View>
      );
    },
    [
      pageSize.width,
      pageSize.height,
      index,
      colors.textColor,
      colors.cardBgColor,
      fontScale,
      phraseOverflow,
      handleContentPress,
      startLongPress,
      cancelLongPress,
    ]
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bgColor }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBgColor }]}>
        <View style={styles.header}>
          <View style={[styles.headerSide, styles.headerRight]}>
            <Pressable style={styles.headerIconBtn} onPress={onBack} accessibilityLabel={t('back')}>
              <Ionicons name="chevron-back" size={22} color={colors.textColor} />
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

        {/* Pager: one page per phrase, snaps to page width; pages scroll vertically when text overflows */}
        <FlatList
          ref={pagerRef}
          style={[styles.phraseArea, { transform: [{ scaleX: RTL_MIRROR_SCALE }] }]}
          horizontal
          pagingEnabled
          data={allPhrases}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPhrasePage}
          getItemLayout={getItemLayout}
          initialScrollIndex={0}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={handlePagerLayout}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
        />

        <AudioPlayerBar
          status={audioStatus}
          audioEnabled={audioEnabled}
          audioAvailable={audioAvailable}
          onToggle={onToggleAudio}
          colors={colors}
        />

        {showSubText && phrase.subtext ? (
          <>
            <View style={[styles.divider, { borderColor: colors.buttonBorderColor }]} />
            <View style={styles.subtextContainer}>
              <ScrollView
                style={styles.subtextScroll}
                contentContainerStyle={styles.subtextScrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <Text
                  style={[
                    styles.subtext,
                    { color: colors.secondaryTextColor, fontSize: (fontScale - 0.4) * 16 },
                  ]}
                >
                  {phrase.subtext}
                </Text>
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.counterBtn,
            { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor },
            isAnimating && styles.counterBtnActive,
          ]}
          onPress={guardedCounterPress}
          hitSlop={14}
          accessibilityLabel={`${t('remainingCount')}${formatNumber(remainingCount)}`}
        >
          <Text style={[styles.counterText, { color: colors.iconColor }]}>
            {formatNumber(remainingCount)}
          </Text>
        </Pressable>
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
  headerIconBtn: {
    width: 37,
    height: 37,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseArea: { flex: 1, overflow: 'hidden' },
  pageScroll: { flex: 1 },
  phraseAreaInner: { flex: 1 },
  overflowFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 34,
  },
  phraseScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  phraseScrollNoCenter: { justifyContent: 'flex-start' },
  phraseText: {
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: AZKAR_PRIMARY_FONT,
    fontWeight: '700',
  },
  divider: { borderTopWidth: 1, width: '100%', marginVertical: 12 },
  subtextContainer: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  subtextScroll: { maxHeight: 72, flexGrow: 0 },
  subtextScrollContent: { paddingVertical: 2 },
  subtext: { textAlign: 'center', lineHeight: 24, fontFamily: AZKAR_PRIMARY_FONT, writingDirection: 'rtl' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  counterBtn: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnActive: { transform: [{ scale: 0.94 }] },
  counterText: { fontSize: 32, fontWeight: '800', fontFamily: AZKAR_COUNTER_FONT },
});
