import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { RootState } from '../store';
import { AZKAR_PRIMARY_FONT, AZKAR_TITLE_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import { config } from '../config/config';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { setOnboardingCompleted } from '../store/slices/onboardingSlice';

type OnboardingFeature = {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: Parameters<typeof t>[0];
  bodyKey: Parameters<typeof t>[0];
};

const FEATURE_ICONS: OnboardingFeature[] = [
  { icon: 'shuffle', titleKey: 'onboardingFeatureShuffleTitle', bodyKey: 'onboardingFeatureShuffleBody' },
  {
    icon: 'radio-button-on',
    titleKey: 'onboardingFeatureCounterTitle',
    bodyKey: 'onboardingFeatureCounterBody',
  },
  { icon: 'headset', titleKey: 'onboardingFeatureAudioTitle', bodyKey: 'onboardingFeatureAudioBody' },
  { icon: 'color-palette', titleKey: 'onboardingFeatureThemesTitle', bodyKey: 'onboardingFeatureThemesBody' },
  { icon: 'star', titleKey: 'onboardingFeatureFavouritesTitle', bodyKey: 'onboardingFeatureFavouritesBody' },
];

const SLIDE_COUNT = 3;

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const themeName = useSelector((state: RootState) => state.theme.value);
  const fontScale = useSelector((state: RootState) => state.fontScale.value);
  const theme = getAzkarTheme(themeName);
  const [slide, setSlide] = useState(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    dispatch(setOnboardingCompleted(true));
    navigation.replace('Categories');
  }, [dispatch, navigation, finishedRef]);
  const guardedFinish = useTimeGuardedCallback(finish, config.interaction.navButtonGuardMs);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      guardedFinish();
      return true;
    });
    return () => sub.remove();
  }, [guardedFinish]);

  const nextSlide = useCallback(() => {
    if (slide >= SLIDE_COUNT - 1) {
      guardedFinish();
      return;
    }
    setSlide((s) => Math.min(s + 1, SLIDE_COUNT - 1));
  }, [guardedFinish, slide]);

  const isLast = slide === SLIDE_COUNT - 1;

  const dots = useMemo(
    () =>
      Array.from({ length: SLIDE_COUNT }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i === slide ? theme.progressFill : theme.sliderBg }]}
        />
      )),
    [slide, theme.progressFill, theme.sliderBg]
  );

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.gradient}>
      <View style={styles.skipRow}>
        <View style={styles.skipSpacer} />
        <Pressable
          onPress={guardedFinish}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('onboardingSkip')}
          style={({ pressed }) => [
            styles.skipBtn,
            { backgroundColor: pressed ? theme.buttonHoverBgColor : 'transparent' },
          ]}
        >
          <Text style={[styles.skipText, { color: theme.secondaryTextColor }]}>{t('onboardingSkip')}</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {slide === 0 && (
          <View style={styles.hero}>
            <View style={[styles.iconCircle, { backgroundColor: theme.secondaryBgColor }]}>
              <Ionicons name="book" size={44} color={theme.iconColor} />
            </View>
            <Text
              style={[
                styles.title,
                { color: theme.textColor, fontSize: 34 * fontScale, lineHeight: 52 * fontScale },
              ]}
              maxFontSizeMultiplier={1.4}
            >
              {t('onboardingWelcomeTitle')}
            </Text>
            <Text
              style={[styles.body, { color: theme.secondaryTextColor, fontSize: 18 * fontScale }]}
              maxFontSizeMultiplier={1.6}
            >
              {t('onboardingWelcomeBody')}
            </Text>
          </View>
        )}

        {slide === 1 && (
          <ScrollView
            style={styles.featureScroll}
            contentContainerStyle={styles.featureScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[styles.featuresTitle, { color: theme.textColor, fontSize: 24 * fontScale }]}
              maxFontSizeMultiplier={1.4}
            >
              {t('onboardingFeaturesTitle')}
            </Text>
            <View style={styles.featureList}>
              {FEATURE_ICONS.map((f) => (
                <View
                  key={f.icon}
                  style={[
                    styles.featureRow,
                    {
                      backgroundColor: theme.buttonBgColor,
                      borderColor: theme.buttonBorderColor,
                    },
                  ]}
                >
                  <View style={[styles.featureIconWrap, { backgroundColor: theme.secondaryBgColor }]}>
                    <Ionicons name={f.icon} size={18} color={theme.iconColor} />
                  </View>
                  <View style={styles.featureTexts}>
                    <Text
                      style={[styles.featureTitle, { color: theme.textColor, fontSize: 15 * fontScale }]}
                      maxFontSizeMultiplier={1.5}
                    >
                      {t(f.titleKey)}
                    </Text>
                    <Text
                      style={[
                        styles.featureBody,
                        { color: theme.secondaryTextColor, fontSize: 13 * fontScale },
                      ]}
                      maxFontSizeMultiplier={1.6}
                    >
                      {t(f.bodyKey)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {slide === 2 && (
          <View style={styles.hero}>
            <View style={[styles.iconCircle, { backgroundColor: theme.secondaryBgColor }]}>
              <Ionicons name="heart" size={44} color={theme.iconColor} />
            </View>
            <Text
              style={[
                styles.title,
                { color: theme.textColor, fontSize: 34 * fontScale, lineHeight: 52 * fontScale },
              ]}
              maxFontSizeMultiplier={1.4}
            >
              {t('onboardingReadyTitle')}
            </Text>
            <Text
              style={[styles.body, { color: theme.secondaryTextColor, fontSize: 18 * fontScale }]}
              maxFontSizeMultiplier={1.6}
            >
              {t('onboardingReadyBody')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dotsRow}>{dots}</View>

      <View style={styles.footer}>
        <LinearGradient
          colors={theme.accentGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.ctaGradient}
        >
          <Pressable
            onPress={nextSlide}
            accessibilityRole="button"
            accessibilityLabel={isLast ? t('onboardingStart') : t('onboardingNext')}
            style={({ pressed }) => [styles.ctaBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text
              style={[styles.ctaText, { color: theme.accentTextColor, fontSize: 18 * fontScale }]}
              maxFontSizeMultiplier={1.4}
            >
              {isLast ? t('onboardingStart') : t('onboardingNext')}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  skipSpacer: { width: 64 },
  skipBtn: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  skipText: { fontSize: 15 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  hero: { alignItems: 'center' },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: AZKAR_TITLE_FONT,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
    lineHeight: 34,
  },
  featuresTitle: {
    fontFamily: AZKAR_TITLE_FONT,
    textAlign: 'center',
    marginBottom: 14,
  },
  featureScroll: { alignSelf: 'stretch', flex: 1 },
  featureScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  featureList: { alignSelf: 'stretch', gap: 8 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 10,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTexts: { flex: 1 },
  featureTitle: {
    fontFamily: AZKAR_TITLE_FONT,
    marginBottom: 2,
  },
  featureBody: {
    fontFamily: AZKAR_PRIMARY_FONT,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  ctaGradient: { borderRadius: 16 },
  ctaBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: AZKAR_TITLE_FONT,
  },
});
