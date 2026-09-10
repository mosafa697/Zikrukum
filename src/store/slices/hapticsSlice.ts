import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type HapticsState = {
  enabled: boolean;
};

const initialState: HapticsState = {
  enabled: false,
};

const hapticsSlice = createSlice({
  name: 'haptics',
  initialState,
  reducers: {
    toggleHaptics(state) {
      state.enabled = !state.enabled;
    },
    setHaptics(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
  },
});

export const { toggleHaptics, setHaptics } = hapticsSlice.actions;
export default hapticsSlice.reducer;
