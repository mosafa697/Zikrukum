import { configureStore } from '@reduxjs/toolkit';
import phasesReducer from './slices/phasesSlice';
import indexCountReducer from './slices/indexCountSlice';
import totalCountReducer from './slices/totalCountSlice';
import themeReducer from './slices/themeSlice';
import fontScaleReducer from './slices/fontScaleSlice';
import subTextReducer from './slices/subTextSlice';

export const store = configureStore({
  reducer: {
    phases: phasesReducer,
    indexCount: indexCountReducer,
    totalCount: totalCountReducer,
    theme: themeReducer,
    fontScale: fontScaleReducer,
    subText: subTextReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
