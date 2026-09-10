import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MilestonesState = {
  enabled: boolean;
  /** Fire-once keys (e.g. 'count-100', 'category-3', 'streak-7'). Never cleared on reset. */
  achieved: string[];
  streakCount: number;
  /** Local calendar day 'YYYY-MM-DD' of the last counted open, or null. */
  lastOpenDate: string | null;
};

export const MILESTONES_DEFAULTS: MilestonesState = {
  enabled: true,
  achieved: [],
  streakCount: 0,
  lastOpenDate: null,
};

const initialState: MilestonesState = MILESTONES_DEFAULTS;

function pushOnce(list: string[], key: string): void {
  if (!list.includes(key)) list.push(key);
}

const milestonesSlice = createSlice({
  name: 'milestones',
  initialState,
  reducers: {
    setMilestonesEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    toggleMilestonesEnabled(state) {
      state.enabled = !state.enabled;
    },
    /** Record a fire-once milestone as reached (idempotent). */
    recordMilestone(state, action: PayloadAction<string>) {
      pushOnce(state.achieved, action.payload);
    },
    /** Record a category completion as `category-<id>` (idempotent). */
    completeCategory(state, action: PayloadAction<string>) {
      pushOnce(state.achieved, `category-${action.payload}`);
    },
    advanceStreak(state, action: PayloadAction<{ today: string; yesterday: string }>) {
      const { today, yesterday } = action.payload;
      if (state.lastOpenDate === today) return;
      state.streakCount = state.lastOpenDate === yesterday ? state.streakCount + 1 : 1;
      state.lastOpenDate = today;
    },
    setMilestones(state, action: PayloadAction<MilestonesState>) {
      state.enabled = Boolean(action.payload.enabled);
      state.achieved = Array.isArray(action.payload.achieved)
        ? action.payload.achieved.filter((k): k is string => typeof k === 'string')
        : [];
      state.streakCount = Math.max(0, Math.floor(action.payload.streakCount ?? 0));
      state.lastOpenDate =
        typeof action.payload.lastOpenDate === 'string' ? action.payload.lastOpenDate : null;
    },
  },
});

export const {
  setMilestonesEnabled,
  toggleMilestonesEnabled,
  recordMilestone,
  completeCategory,
  advanceStreak,
  setMilestones,
} = milestonesSlice.actions;

export default milestonesSlice.reducer;
