import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setTheme } from './slices/themeSlice';
import { incrementTotalCount, resetTotalCount, setTotalCount } from './slices/totalCountSlice';
import { toggleShuffle } from './slices/phasesSlice';
import { decrementFontScale, incrementFontScale, setFontScale } from './slices/fontScaleSlice';
import { toggleAppearance } from './slices/subTextSlice';
import { setFavouriteCategories, toggleFavouriteCategory } from './slices/favouriteCategoriesSlice';
import { toggleAutoPlayNext, toggleAudioEnabled } from './slices/audioSlice';
import { toggleVolumeNav } from './slices/volumeNavSlice';
import { setHaptics, toggleHaptics } from './slices/hapticsSlice';
import {
  setEveningEnabled,
  setEveningTime,
  setFridayEnabled,
  setFridayTime,
  setMorningEnabled,
  setMorningTime,
  setReminders,
  toggleEvening,
  toggleFriday,
  toggleMorning,
  REMINDER_DEFAULTS,
} from './slices/reminderSlice';
import {
  advanceStreak,
  completeCategory,
  recordMilestone,
  setMilestones,
  setMilestonesEnabled,
  toggleMilestonesEnabled,
  MILESTONES_DEFAULTS,
} from './slices/milestonesSlice';
import { getStoredValue, setStoredValue } from '../utils/storage';
import { config } from '../config/config';
import type { AzkarThemeName } from '../theme/azkarTheme';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setTheme,
  effect: async (action) => {
    await setStoredValue('theme', action.payload);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(incrementTotalCount, setTotalCount, resetTotalCount),
  effect: async (_, api) => {
    const { totalCount } = api.getState() as { totalCount: { value: number } };
    await setStoredValue('totalCount', totalCount.value);
  },
});

listenerMiddleware.startListening({
  actionCreator: toggleShuffle,
  effect: async (_, api) => {
    const { phases } = api.getState() as { phases: { shuffle: boolean } };
    await setStoredValue('shufflePhases', phases.shuffle);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(incrementFontScale, decrementFontScale, setFontScale),
  effect: async (_, api) => {
    const { fontScale } = api.getState() as { fontScale: { value: number } };
    await setStoredValue('fontScale', fontScale.value);
  },
});

listenerMiddleware.startListening({
  actionCreator: toggleAppearance,
  effect: async (_, api) => {
    const { subText } = api.getState() as { subText: { value: boolean } };
    await setStoredValue('subText', subText.value);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(toggleFavouriteCategory, setFavouriteCategories),
  effect: async (_, api) => {
    const { favouriteCategories } = api.getState() as { favouriteCategories: { ids: number[] } };
    await setStoredValue('favouriteCategories', favouriteCategories.ids);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(toggleAutoPlayNext, toggleAudioEnabled),
  effect: async (_, api) => {
    const { audio } = api.getState() as { audio: { autoPlayNext: boolean; audioEnabled: boolean } };
    await setStoredValue('autoPlayNext', audio.autoPlayNext);
    await setStoredValue('audioEnabled', audio.audioEnabled);
  },
});

listenerMiddleware.startListening({
  actionCreator: toggleVolumeNav,
  effect: async (_, api) => {
    const { volumeNav } = api.getState() as { volumeNav: { enabled: boolean } };
    await setStoredValue('volumeNavEnabled', volumeNav.enabled);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(toggleHaptics, setHaptics),
  effect: async (_, api) => {
    const { haptics } = api.getState() as { haptics: { enabled: boolean } };
    await setStoredValue('vibrateOnCount', haptics.enabled);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(
    toggleMorning,
    toggleEvening,
    toggleFriday,
    setMorningEnabled,
    setEveningEnabled,
    setFridayEnabled,
    setMorningTime,
    setEveningTime,
    setFridayTime,
    setReminders
  ),
  effect: async (_, api) => {
    const { reminders } = api.getState() as { reminders: typeof REMINDER_DEFAULTS };
    await setStoredValue('adhkarReminders', reminders);
  },
});

listenerMiddleware.startListening({
  matcher: isAnyOf(
    setMilestonesEnabled,
    toggleMilestonesEnabled,
    recordMilestone,
    completeCategory,
    advanceStreak,
    setMilestones
  ),
  effect: async (_, api) => {
    const { milestones } = api.getState() as { milestones: typeof MILESTONES_DEFAULTS };
    await setStoredValue('milestones', milestones);
  },
});

export async function loadPersistedState() {
  const [
    theme,
    totalCount,
    shuffle,
    fontScale,
    subText,
    favouriteCategories,
    autoPlayNext,
    audioEnabled,
    volumeNavEnabled,
    vibrateOnCount,
    adhkarReminders,
    milestones,
  ] = await Promise.all([
    getStoredValue<AzkarThemeName>('theme', 'solarized'),
    getStoredValue<number>('totalCount', 0),
    getStoredValue<boolean>('shufflePhases', false),
    getStoredValue<number>('fontScale', config.font.defaultScale),
    getStoredValue<boolean>('subText', true),
    getStoredValue<number[]>('favouriteCategories', []),
    getStoredValue<boolean>('autoPlayNext', true),
    getStoredValue<boolean>('audioEnabled', true),
    getStoredValue<boolean>('volumeNavEnabled', false),
    getStoredValue<boolean>('vibrateOnCount', false),
    getStoredValue<typeof REMINDER_DEFAULTS>('adhkarReminders', REMINDER_DEFAULTS),
    getStoredValue<typeof MILESTONES_DEFAULTS>('milestones', MILESTONES_DEFAULTS),
  ]);

  // Migrate stored reminders without friday field
  const mergedReminders: typeof REMINDER_DEFAULTS = {
    morning: adhkarReminders.morning ?? REMINDER_DEFAULTS.morning,
    evening: adhkarReminders.evening ?? REMINDER_DEFAULTS.evening,
    friday: (adhkarReminders as typeof REMINDER_DEFAULTS).friday ?? REMINDER_DEFAULTS.friday,
  };

  // Seed count milestones already crossed by the stored lifetime total so
  // existing users do not get backlogged celebrations on the next tap.
  const achieved = Array.isArray(milestones.achieved) ? [...milestones.achieved] : [];
  for (const threshold of [100, 1000, 10000]) {
    if (totalCount >= threshold && !achieved.includes(`count-${threshold}`)) {
      achieved.push(`count-${threshold}`);
    }
  }

  return {
    theme: { value: theme, list: ['light', 'solarized', 'dark'] as AzkarThemeName[] },
    totalCount: { value: totalCount },
    phases: { value: [], shuffle, wasShuffled: false },
    fontScale: { value: fontScale },
    subText: { value: subText },
    favouriteCategories: { ids: favouriteCategories },
    audio: { autoPlayNext, audioEnabled },
    playback: { currentPhraseId: null, status: 'idle' as const, currentTime: 0, duration: 0 },
    volumeNav: { enabled: volumeNavEnabled },
    haptics: { enabled: vibrateOnCount },
    reminders: mergedReminders,
    milestones: {
      enabled: milestones.enabled ?? MILESTONES_DEFAULTS.enabled,
      achieved,
      streakCount: milestones.streakCount ?? 0,
      lastOpenDate: milestones.lastOpenDate ?? null,
    },
  };
}
