import { combineReducers, configureStore } from '@reduxjs/toolkit';
import phasesReducer from './slices/phasesSlice';
import indexCountReducer from './slices/indexCountSlice';
import totalCountReducer from './slices/totalCountSlice';
import themeReducer from './slices/themeSlice';
import fontScaleReducer from './slices/fontScaleSlice';
import subTextReducer from './slices/subTextSlice';
import favouriteCategoriesReducer from './slices/favouriteCategoriesSlice';
import audioReducer from './slices/audioSlice';
import playbackReducer from './slices/playbackSlice';
import volumeNavReducer from './slices/volumeNavSlice';
import hapticsReducer from './slices/hapticsSlice';
import reminderReducer from './slices/reminderSlice';
import milestonesReducer from './slices/milestonesSlice';
import { listenerMiddleware } from './persistence';
import './milestoneListeners';

const rootReducer = combineReducers({
  phases: phasesReducer,
  indexCount: indexCountReducer,
  totalCount: totalCountReducer,
  theme: themeReducer,
  fontScale: fontScaleReducer,
  subText: subTextReducer,
  favouriteCategories: favouriteCategoriesReducer,
  audio: audioReducer,
  playback: playbackReducer,
  volumeNav: volumeNavReducer,
  haptics: hapticsReducer,
  reminders: reminderReducer,
  milestones: milestonesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),

    preloadedState: preloadedState as any,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
