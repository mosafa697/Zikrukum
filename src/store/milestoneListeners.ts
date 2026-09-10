import type { UnknownAction } from '@reduxjs/toolkit';
import { t, type TranslationKey } from '../i18n';
import { isFeatureEnabled } from '../config/features';
import { listenerMiddleware } from './persistence';
import { incrementTotalCount } from './slices/totalCountSlice';
import {
  advanceStreak,
  completeCategory,
  recordMilestone,
  type MilestonesState,
} from './slices/milestonesSlice';
import {
  displayMilestoneNotification,
  getNotificationPermissionStatus,
} from '../notifications/notifeeService';
import {
  COUNT_MILESTONES,
  COUNT_MILESTONE_COPY,
  STREAK_MILESTONES,
  STREAK_MILESTONE_COPY,
  categoryMilestoneKey,
  hasCompletedAllCategories,
  isCategoryMilestoneKey,
  isQuietHours,
} from '../notifications/milestones';

type FireApi = {
  dispatch: (action: UnknownAction) => unknown;
  getState: () => unknown;
};

type MilestonesRoot = { milestones: MilestonesState };

function readMilestones(api: Pick<FireApi, 'getState'>): MilestonesState | null {
  const state = api.getState() as Partial<MilestonesRoot>;
  return state.milestones ?? null;
}

/**
 * Fire-once core: the milestone is ALWAYS recorded as reached (so resets and
 * replays never refire it); it is only displayed when the toggle is on, the
 * infra flag is on, the OS granted permission, and we are outside quiet hours.
 */
async function maybeFire(
  api: FireApi,
  key: string,
  titleKey: TranslationKey,
  bodyKey: TranslationKey
): Promise<void> {
  api.dispatch(recordMilestone(key));
  const milestones = readMilestones(api);
  if (!milestones?.enabled) return;
  if (!isFeatureEnabled('reminders')) return;
  const status = await getNotificationPermissionStatus();
  if (status !== 'authorized' && status !== 'provisional') return;
  if (isQuietHours(new Date())) return;
  await displayMilestoneNotification({
    id: `milestone-${key}`,
    title: t(titleKey),
    body: t(bodyKey),
    data: { milestone: key },
  });
}

listenerMiddleware.startListening({
  actionCreator: incrementTotalCount,
  effect: async (_, api) => {
    const state = api.getState() as {
      totalCount: { value: number };
      milestones?: MilestonesState;
    };
    if (!state.milestones) return;
    for (const threshold of COUNT_MILESTONES) {
      const key = `count-${threshold}`;
      if (state.totalCount.value >= threshold && !state.milestones.achieved.includes(key)) {
        const copy = COUNT_MILESTONE_COPY[threshold];
        await maybeFire(api, key, copy.title, copy.body);
      }
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: completeCategory,
  effect: async (action, api) => {
    const original = api.getOriginalState() as MilestonesRoot;
    const key = categoryMilestoneKey(action.payload);
    // Re-completing an already-completed category never refires.
    if (original.milestones.achieved.includes(key)) return;
    const firstEver = !original.milestones.achieved.some(isCategoryMilestoneKey);
    if (firstEver) {
      await maybeFire(api, 'category-first', 'milestoneCategoryFirstTitle', 'milestoneCategoryFirstBody');
    } else {
      await maybeFire(api, key, 'milestoneCategoryTitle', 'milestoneCategoryBody');
    }
    const current = readMilestones(api);
    if (
      current &&
      !current.achieved.includes('all-categories') &&
      hasCompletedAllCategories(current.achieved)
    ) {
      await maybeFire(api, 'all-categories', 'milestoneAllCategoriesTitle', 'milestoneAllCategoriesBody');
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: advanceStreak,
  effect: async (_, api) => {
    const milestones = readMilestones(api);
    if (!milestones) return;
    for (const days of STREAK_MILESTONES) {
      const key = `streak-${days}`;
      if (milestones.streakCount >= days && !milestones.achieved.includes(key)) {
        const copy = STREAK_MILESTONE_COPY[days];
        await maybeFire(api, key, copy.title, copy.body);
      }
    }
    if (new Date().getDay() === 5 && !milestones.achieved.includes('friday-nudge')) {
      await maybeFire(api, 'friday-nudge', 'milestoneFridayTitle', 'milestoneFridayBody');
    }
  },
});
