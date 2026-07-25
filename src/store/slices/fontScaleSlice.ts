import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { config } from '../../config/config';

export type FontScaleState = {
  value: number;
};

const initialState: FontScaleState = {
  value: config.font.defaultScale,
};

const fontScaleSlice = createSlice({
  name: 'fontScale',
  initialState,
  reducers: {
    incrementFontScale: (state) => {
      state.value = Math.min(state.value + config.font.scaleIncrement, config.font.maxScale);
    },
    decrementFontScale: (state) => {
      state.value = Math.max(state.value - config.font.scaleIncrement, config.font.minScale);
    },
    setFontScale: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

export const { incrementFontScale, decrementFontScale, setFontScale } = fontScaleSlice.actions;
export default fontScaleSlice.reducer;
