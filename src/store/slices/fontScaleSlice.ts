import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { config } from '../../config/config';

export type FontScaleState = {
  value: number;
};

/** Number of steps in the Settings font-size scale (step N = minScale + (N-1) * increment). */
export const FONT_SCALE_STEPS = 10;

function clampFontScale(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return Math.min(Math.max(rounded, config.font.minScale), config.font.maxScale);
}

/** Map a 1-based settings step (1..FONT_SCALE_STEPS) to its fontScale value. */
export function stepToFontScale(step: number): number {
  const safe = Math.min(Math.max(Math.round(step), 1), FONT_SCALE_STEPS);
  return clampFontScale(config.font.minScale + (safe - 1) * config.font.scaleIncrement);
}

/** Map a stored fontScale value to its nearest 1-based settings step (for migration/display). */
export function fontScaleToStep(value: number): number {
  const step = Math.round((value - config.font.minScale) / config.font.scaleIncrement) + 1;
  return Math.min(Math.max(step, 1), FONT_SCALE_STEPS);
}

const initialState: FontScaleState = {
  value: config.font.defaultScale,
};

const fontScaleSlice = createSlice({
  name: 'fontScale',
  initialState,
  reducers: {
    incrementFontScale: (state) => {
      state.value = clampFontScale(state.value + config.font.scaleIncrement);
    },
    decrementFontScale: (state) => {
      state.value = clampFontScale(state.value - config.font.scaleIncrement);
    },
    setFontScale: (state, action: PayloadAction<number>) => {
      state.value = clampFontScale(action.payload);
    },
  },
});

export const { incrementFontScale, decrementFontScale, setFontScale } = fontScaleSlice.actions;
export default fontScaleSlice.reducer;
