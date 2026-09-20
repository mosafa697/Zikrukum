import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type OnboardingState = {
  completed: boolean;
};

const initialState: OnboardingState = {
  completed: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingCompleted(state, action: PayloadAction<boolean>) {
      state.completed = action.payload;
    },
  },
});

export const { setOnboardingCompleted } = onboardingSlice.actions;
export default onboardingSlice.reducer;
