import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AzkarPhrase } from '../../mappers/azkarMapper';

export type PhasesState = {
  value: AzkarPhrase[];
  shuffle: boolean;
  wasShuffled: boolean;
};

const initialState: PhasesState = {
  value: [],
  shuffle: false,
  wasShuffled: false,
};

const phasesSlice = createSlice({
  name: 'phases',
  initialState,
  reducers: {
    setPhases: (state, action: PayloadAction<AzkarPhrase[]>) => {
      state.value = action.payload;
    },
    shufflePhases: (state) => {
      state.value = [...state.value].sort(() => Math.random() - 0.5);
      state.wasShuffled = true;
    },
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
      if (!state.shuffle) {
        state.wasShuffled = false;
      }
    },
    resetPhases: (state) => {
      state.value = [];
      state.wasShuffled = false;
    },
  },
});

export const { setPhases, shufflePhases, toggleShuffle, resetPhases } = phasesSlice.actions;
export default phasesSlice.reducer;
