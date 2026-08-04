import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { decrementIndex, incrementIndex } from '../store/slices/indexCountSlice';
import { decrementFontScale, incrementFontScale } from '../store/slices/fontScaleSlice';
import { RootState } from '../store';
import type { AzkarPhrase } from '../mappers/azkarMapper';
import { config } from '../config/config';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';

const SWIPE_THRESHOLD = 50;
const SWIPE_ANIMATION_DURATION = 200;

type PhraseCardProps = {
  phrase: AzkarPhrase;
  counter: number;
  onPhraseClick: () => void;
  isAnimating: boolean;
  onBack: () => void;
  categoryName: string;
};

export function PhraseCard({ phrase, counter, onPhraseClick, isAnimating, onBack, categoryName }: PhraseCardProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const indexCount = useSelector((state: RootState) => state.indexCount.value);
  const phasesLength = useSelector((state: RootState) => state.indexCount.phasesLength);
  const isLastPhrase = useSelector((state: RootState) => state.indexCount.isLastPhrase);
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

  const translateX = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  // Swipe right = next phrase, swipe left = previous phrase (mirrors web react-swipeable behavior)
  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState !== State.ACTIVE) return;
    const dx = event.nativeEvent.translationX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0 && !canGoBack) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
      if (dx > 0 && !canGoForward) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        return;
      }
      Animated.timing(translateX, {
        toValue: dx > 0 ? 500 : -500,
        duration: SWIPE_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        translateX.setValue(0);
        dispatch(dx > 0 ? incrementIndex() : decrementIndex());
      });
    } else {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    }
  };

  // Mirrors ZekrCounter's useTimeGuardedCallback guard
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
            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}
              onPress={onBack}
              accessibilityLabel="الرئيسية"
            >
              <Ionicons name="home-outline" size={20} color={colors.textColor} />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="الإعدادات"
            >
              <Ionicons name="settings-outline" size={20} color={colors.textColor} />
            </Pressable>
          </View>

          <View style={styles.headerCenter}>
            <View style={[styles.progressTrack, { backgroundColor: colors.sliderBg }]}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` as any, backgroundColor: colors.sliderBgActive }]} />
              <Text style={[styles.categoryLabel, { color: colors.textColor }]}>
                {categoryName}
              </Text>
            </View>
          </View>

          <View style={styles.headerSide}>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}
              onPress={() => dispatch(decrementFontScale())}
              accessibilityLabel="تصغير الخط"
            >
              <Ionicons name="remove" size={20} color={colors.textColor} />
            </Pressable>
            <Pressable
              style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }]}
              onPress={() => dispatch(incrementFontScale())}
              accessibilityLabel="تكبير الخط"
            >
              <Ionicons name="add" size={20} color={colors.textColor} />
            </Pressable>
          </View>
        </View>

        {/* Phrase content area — swipe left = previous, swipe right = next */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetX={[-5, 5]}
          failOffsetY={[-20, 20]}
        >
          <Animated.View style={[styles.phraseArea, { transform: [{ translateX }] }]}>
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
                    <Text style={[styles.subtext, { color: colors.secondaryTextColor, fontSize: (fontScale - 0.4) * 16 }]}>
                      {phrase.subtext}
                    </Text>
                  </>
                ) : null}
              </ScrollView>
            </Pressable>
          </Animated.View>
        </PanGestureHandler>

        {/* Footer: previous | counter | next */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }, !canGoForward && styles.invisible]}
            onPress={() => dispatch(incrementIndex())}
            disabled={!canGoForward}
            accessibilityLabel="الذكر التالي"
          >
            <Ionicons name="chevron-back" size={22} color={colors.textColor} />
          </Pressable>

          <Pressable
            style={[styles.counterBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }, isAnimating && styles.counterBtnActive]}
            onPress={guardedCounterPress}
            accessibilityLabel={`العدد المتبقي ${remainingCount}`}
          >
            <Text style={[styles.counterText, { color: colors.iconColor }]}>{remainingCount}</Text>
          </Pressable>

          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.buttonBgColor, borderColor: colors.buttonBorderColor }, !canGoBack && styles.invisible]}
            onPress={() => dispatch(decrementIndex())}
            disabled={!canGoBack}
            accessibilityLabel="الذكر السابق"
          >
            <Ionicons name="chevron-forward" size={22} color={colors.textColor} />
          </Pressable>
        </View>

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
  progressTrack: { borderRadius: 999, overflow: 'hidden', width: '100%', justifyContent: 'center', alignItems: 'center' },
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
  iconBtn: { width: 37, height: 37, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  phraseArea: { flex: 1, overflow: 'hidden' },
  phraseAreaInner: { flex: 1 },
  phraseScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  phraseText: { textAlign: 'center', writingDirection: 'rtl', fontFamily: AZKAR_PRIMARY_FONT, fontWeight: '700' },
  divider: { borderTopWidth: 1, width: '100%', marginVertical: 12 },
  subtext: { textAlign: 'center', lineHeight: 26, fontFamily: AZKAR_PRIMARY_FONT, writingDirection: 'rtl' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  invisible: { opacity: 0 },
  counterBtn: { width: 88, height: 88, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  counterBtnActive: { transform: [{ scale: 0.94 }] },
  counterText: { fontSize: 32, fontWeight: '800', fontFamily: AZKAR_PRIMARY_FONT },
});
