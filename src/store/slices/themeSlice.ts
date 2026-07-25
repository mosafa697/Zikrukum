import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AzkarThemeName } from '../../theme/azkarTheme';

export type ThemeState = {
  value: AzkarThemeName;
  list: AzkarThemeName[];
};

const initialState: ThemeState = {
  value: 'solarized',
  list: ['light', 'solarized', 'dark'],
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<AzkarThemeName>) => {
      state.value = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
