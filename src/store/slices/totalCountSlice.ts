import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TotalCountState = {
  value: number;
};

const initialState: TotalCountState = {
  value: 0,
};

const totalCountSlice = createSlice({
  name: 'totalCount',
  initialState,
  reducers: {
    incrementTotalCount: (state) => {
      state.value += 1;
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
    resetTotalCount: (state) => {
      state.value = 0;
    },
  },
});

export const { incrementTotalCount, setTotalCount, resetTotalCount } = totalCountSlice.actions;
export default totalCountSlice.reducer;
