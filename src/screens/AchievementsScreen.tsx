import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenHeader } from '../components/ScreenHeader';
import { CategoryDialog } from '../components/CategoryDialog';
import { RootState } from '../store';
import { azkar, type AzkarCategory } from '../mappers/azkarMapper';
import { resetTotalCount } from '../store/slices/totalCountSlice';
import { MILESTONES_DEFAULTS, setMilestones } from '../store/slices/milestonesSlice';
import { removeStoredValue } from '../utils/storage';
import useTimeGuardedCallback from '../utils/useTimeGuardedCallback';
import { config } from '../config/config';
import {
  COUNT_MILESTONES,
  COUNT_MILESTONE_COPY,
  STREAK_MILESTONES,
  STREAK_MILESTONE_COPY,
  categoryMilestoneKey,
  hasCompletedAllCategories,
} from '../notifications/milestones';
import { AZKAR_PRIMARY_FONT, getAzkarTheme } from '../theme/azkarTheme';
import { t } from '../i18n';
import { formatNumber } from '../utils/numberFormatting';

const SCROLL_TOP_THRESHOLD = 350;

type Badge = {
  key: string;
  icon: AzkarCategory['icon'];
  title: string;
  description: string;
  status: string;
  completed: boolean;
  active: boolean;
};

export function AchievementsScreen() {
  const dispatch = useDispatch();
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const achieved = useSelector((state: RootState) => state.milestones.achieved);
  const streakCount = useSelector((state: RootState) => state.milestones.streakCount);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const colors = getAzkarTheme(themeName);

  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollTopAnim = useMemo(() => new Animated.Value(0), []);
  const listRef = useRef<FlatList<Badge>>(null);
  const scrollTopVisibleRef = useRef(false);

  useEffect(() => {
    Animated.timing(scrollTopAnim, {
      toValue: showScrollTop ? 1 : 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [showScrollTop, scrollTopAnim]);

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const shouldShow = event.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD;
    if (shouldShow !== scrollTopVisibleRef.current) {
      scrollTopVisibleRef.current = shouldShow;
      setShowScrollTop(shouldShow);
    }
  }, []);

  const doScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  const guardedScrollToTop = useTimeGuardedCallback(doScrollToTop, config.interaction.navButtonGuardMs);

  const handleClearProgress = useCallback(async () => {
    await Promise.all(azkar.map((category) => removeStoredValue(`azkar-index-${category.id}`)));
    dispatch(resetTotalCount());
    dispatch(setMilestones({ ...MILESTONES_DEFAULTS }));
    setClearConfirmVisible(false);
  }, [dispatch]);
  const guardedClearProgress = useTimeGuardedCallback(
    () => void handleClearProgress(),
    config.interaction.navButtonGuardMs
  );
  const guardedClearCancel = useTimeGuardedCallback(
    () => setClearConfirmVisible(false),
    config.interaction.navButtonGuardMs
  );

  // Read-only derivation from already-tracked data — no new storage or tracking.
  const badges = useMemo<Badge[]>(() => {
    const countBadges: Badge[] = COUNT_MILESTONES.map((threshold) => {
      const completed = totalCount >= threshold;
      const copy = COUNT_MILESTONE_COPY[threshold];
      return {
        key: `count-${threshold}`,
        icon: 'medal',
        title: t(copy.title),
        description: t(copy.body),
        status: completed
          ? t('achievementCompleted')
          : `${formatNumber(totalCount)} / ${formatNumber(threshold)}`,
        completed,
        active: completed || totalCount > 0,
      };
    });

    const streakBadges: Badge[] = STREAK_MILESTONES.map((days) => {
      const completed = streakCount >= days;
      const copy = STREAK_MILESTONE_COPY[days];
      return {
        key: `streak-${days}`,
        icon: 'fire',
        title: t(copy.title),
        description: t(copy.body),
        status: completed
          ? t('achievementCompleted')
          : `${formatNumber(streakCount)} / ${formatNumber(days)} ${t('achievementDays')}`,
        completed,
        active: completed || streakCount > 0,
      };
    });

    const categoryBadges: Badge[] = azkar.map((category) => {
      const completed = achieved.includes(categoryMilestoneKey(String(category.id)));
      return {
        key: `category-${category.id}`,
        icon: category.icon,
        title: category.title,
        description: `${formatNumber(category.phrases.length)} ${t('achievementOfAdhkar')}`,
        status: completed ? t('achievementCompleted') : t('achievementLocked'),
        completed,
        active: completed,
      };
    });

    const allCompleted = hasCompletedAllCategories(achieved);
    const allBadge: Badge = {
      key: 'all-categories',
      icon: 'trophy',
      title: t('milestoneAllCategoriesTitle'),
      description: t('milestoneAllCategoriesBody'),
      status: allCompleted ? t('achievementCompleted') : t('achievementLocked'),
      completed: allCompleted,
      active: allCompleted,
    };

    return [...countBadges, ...streakBadges, ...categoryBadges, allBadge];
  }, [totalCount, achieved, streakCount]);

  const renderBadge = ({ item }: ListRenderItemInfo<Badge>) => (
    <View
      style={[styles.card, { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor }]}
    >
      {item.active ? (
        <LinearGradient colors={colors.accentGradient} style={styles.iconChip}>
          <FontAwesome5 name={item.icon} size={18} color={colors.accentTextColor} />
        </LinearGradient>
      ) : (
        <View style={[styles.iconChip, { backgroundColor: colors.secondaryBgColor }]}>
          <FontAwesome5 name={item.icon} size={18} color={colors.secondaryTextColor} />
        </View>
      )}
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: colors.textColor }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.secondaryTextColor }]}>{item.description}</Text>
      </View>
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: item.completed ? colors.sliderBgActive : colors.secondaryBgColor,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: item.completed ? colors.iconColorActive : colors.secondaryTextColor },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      <ScreenHeader
        title={t('achievements')}
        showBack
        rightAction={
          <Pressable
            onPress={() => setClearConfirmVisible(true)}
            hitSlop={8}
            android_ripple={{ color: colors.buttonHoverBgColor, borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={t('clearProgress')}
            style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textColor} />
          </Pressable>
        }
      />
      <CategoryDialog
        visible={clearConfirmVisible}
        icon="trash-outline"
        title={t('clearProgressTitle')}
        body={t('clearProgressBody')}
        actions={[
          { label: t('cancel'), onPress: guardedClearCancel },
          { label: t('clearProgressConfirm'), onPress: guardedClearProgress, primary: true },
        ]}
        onRequestClose={guardedClearCancel}
        accessibilityLabel={t('clearProgress')}
      />
      <FlatList
        ref={listRef}
        data={badges}
        keyExtractor={(item) => item.key}
        renderItem={renderBadge}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
      />
      <Animated.View
        style={[
          styles.scrollTopWrap,
          {
            opacity: scrollTopAnim,
            transform: [
              {
                scale: scrollTopAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
              },
            ],
            pointerEvents: showScrollTop ? 'auto' : 'none',
          } as any,
        ]}
      >
        <Pressable
          onPress={guardedScrollToTop}
          hitSlop={8}
          accessibilityLabel={t('backToTop')}
          accessibilityRole="button"
        >
          <LinearGradient colors={colors.accentGradient} style={styles.scrollTopBtn}>
            <Ionicons name="arrow-up" size={22} color={colors.accentTextColor} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  scrollTopWrap: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    zIndex: 10,
  },
  scrollTopBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 14px rgba(0,0,0,0.2)' } as any,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, gap: 4 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  description: {
    fontSize: 12,
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 18,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: AZKAR_PRIMARY_FONT,
    textAlign: 'center',
  },
});
