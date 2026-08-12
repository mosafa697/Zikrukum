import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setTheme } from './slices/themeSlice';
import { incrementTotalCount, resetTotalCount, setTotalCount } from './slices/totalCountSlice';
import { toggleShuffle } from './slices/phasesSlice';
import { decrementFontScale, incrementFontScale, setFontScale } from './slices/fontScaleSlice';
import { toggleAppearance } from './slices/subTextSlice';
import { setFavouriteCategories, toggleFavouriteCategory } from './slices/favouriteCategoriesSlice';
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

export async function loadPersistedState() {
  const [theme, totalCount, shuffle, fontScale, subText, favouriteCategories] = await Promise.all([
    getStoredValue<AzkarThemeName>('theme', 'solarized'),
    getStoredValue<number>('totalCount', 0),
    getStoredValue<boolean>('shufflePhases', false),
    getStoredValue<number>('fontScale', config.font.defaultScale),
    getStoredValue<boolean>('subText', true),
    getStoredValue<number[]>('favouriteCategories', []),
  ]);

  return {
    theme: { value: theme, list: ['light', 'solarized', 'dark'] as AzkarThemeName[] },
    totalCount: { value: totalCount },
    phases: { value: [], shuffle, wasShuffled: false },
    fontScale: { value: fontScale },
    subText: { value: subText },
    favouriteCategories: { ids: favouriteCategories },
  };
}
