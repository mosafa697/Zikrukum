import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IndexCountState = {
  value: number;
  phasesLength: number;
  isLastPhrase: boolean;
};

const initialState: IndexCountState = {
  value: 0,
  phasesLength: 0,
  isLastPhrase: false,
};

const indexCountSlice = createSlice({
  name: 'indexCount',
  initialState,
  reducers: {
    incrementIndex: (state) => {
      if (state.value < state.phasesLength) {
        state.value += 1;
      }
    },
    decrementIndex: (state) => {
      if (state.value > 0) {
        state.value -= 1;
      }
    },
    setIndexCount: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
    setPhasesLengthCount: (state, action: PayloadAction<number>) => {
      state.phasesLength = action.payload;
    },
    setIsLastPhrase: (state, action: PayloadAction<boolean>) => {
      state.isLastPhrase = action.payload;
    },
    resetIndexCount: (state) => {
      state.value = 0;
      state.phasesLength = 0;
      state.isLastPhrase = false;
    },
  },
});

export const { incrementIndex, decrementIndex, setIndexCount, setPhasesLengthCount, setIsLastPhrase, resetIndexCount } = indexCountSlice.actions;
export default indexCountSlice.reducer;
