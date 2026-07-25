import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeState = {
  value: string;
  list: string[];
};

const initialState: ThemeState = {
  value: 'solarized',
  list: ['light', 'solarized', 'dark'],
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
