import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { ScreenHeader } from '../components/ScreenHeader';
import { RootState } from '../store';
import { azkar, type AzkarCategory } from '../mappers/azkarMapper';
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
  const totalCount = useSelector((state: RootState) => state.totalCount.value);
  const achieved = useSelector((state: RootState) => state.milestones.achieved);
  const streakCount = useSelector((state: RootState) => state.milestones.streakCount);
  const themeName = useSelector((state: RootState) => state.theme.value);
  const colors = getAzkarTheme(themeName);

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
      style={[
        styles.card,
        { backgroundColor: colors.cardBgColor, borderColor: colors.buttonBorderColor },
      ]}
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
        <Text style={[styles.description, { color: colors.secondaryTextColor }]}>
          {item.description}
        </Text>
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
      <ScreenHeader title={t('achievements')} showBack />
      <FlatList
        data={badges}
        keyExtractor={(item) => item.key}
        renderItem={renderBadge}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
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
