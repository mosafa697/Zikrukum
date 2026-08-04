import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setTheme } from './slices/themeSlice';
import { incrementTotalCount, resetTotalCount, setTotalCount } from './slices/totalCountSlice';
import { toggleShuffle } from './slices/phasesSlice';
import { decrementFontScale, incrementFontScale, setFontScale } from './slices/fontScaleSlice';
import { toggleAppearance } from './slices/subTextSlice';
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

export async function loadPersistedState() {
  const [theme, totalCount, shuffle, fontScale, subText] = await Promise.all([
    getStoredValue<AzkarThemeName>('theme', 'solarized'),
    getStoredValue<number>('totalCount', 0),
    getStoredValue<boolean>('shufflePhases', false),
    getStoredValue<number>('fontScale', config.font.defaultScale),
    getStoredValue<boolean>('subText', true),
  ]);

  return {
    theme: { value: theme, list: ['light', 'solarized', 'dark'] as AzkarThemeName[] },
    totalCount: { value: totalCount },
    phases: { value: [], shuffle, wasShuffled: false },
    fontScale: { value: fontScale },
    subText: { value: subText },
  };
}
