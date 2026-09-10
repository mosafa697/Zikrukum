import type { TranslationKey } from '../i18n';
import { azkar } from '../mappers/azkarMapper';

export const COUNT_MILESTONES = [100, 1000, 10000] as const;

export const STREAK_MILESTONES = [3, 7, 30, 40] as const;

export const QUIET_HOURS_START = 23;
export const QUIET_HOURS_END = 5;

export function countMilestoneKey(threshold: number): string {
  return `count-${threshold}`;
}

export function streakMilestoneKey(days: number): string {
  return `streak-${days}`;
}

export function categoryMilestoneKey(categoryId: string): string {
  return `category-${categoryId}`;
}

export function isCategoryMilestoneKey(key: string): boolean {
  return key === 'category-first' || key.startsWith('category-');
}

/** All bundled category ids must have `category-<id>` achieved for the all-categories milestone. */
export function hasCompletedAllCategories(achieved: string[]): boolean {
  return azkar.every((category) => achieved.includes(categoryMilestoneKey(String(category.id))));
}

export function isMilestonePress(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  return typeof (data as Record<string, unknown>).milestone === 'string';
}

/** Local-time quiet hours (23:00–05:00): milestones are recorded but not displayed. */
export function isQuietHours(now: Date): boolean {
  const hour = now.getHours();
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

function toDayString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local calendar-day strings (no UTC): today + yesterday for streak advance. */
export function getLocalDayStrings(now: Date): { today: string; yesterday: string } {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return { today: toDayString(now), yesterday: toDayString(yesterday) };
}

export const COUNT_MILESTONE_COPY: Record<number, { title: TranslationKey; body: TranslationKey }> = {
  100: { title: 'milestoneCount100Title', body: 'milestoneCount100Body' },
  1000: { title: 'milestoneCount1000Title', body: 'milestoneCount1000Body' },
  10000: { title: 'milestoneCount10000Title', body: 'milestoneCount10000Body' },
};

export const STREAK_MILESTONE_COPY: Record<number, { title: TranslationKey; body: TranslationKey }> = {
  3: { title: 'milestoneStreak3Title', body: 'milestoneStreak3Body' },
  7: { title: 'milestoneStreak7Title', body: 'milestoneStreak7Body' },
  30: { title: 'milestoneStreak30Title', body: 'milestoneStreak30Body' },
  40: { title: 'milestoneStreak40Title', body: 'milestoneStreak40Body' },
};
