import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AudioState = {
  autoPlayNext: boolean;
  audioEnabled: boolean;
};

const initialState: AudioState = {
  autoPlayNext: true,
  audioEnabled: true,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    toggleAutoPlayNext(state) {
      state.autoPlayNext = !state.autoPlayNext;
    },
    setAutoPlayNext(state, action: PayloadAction<boolean>) {
      state.autoPlayNext = action.payload;
    },
    toggleAudioEnabled(state) {
      state.audioEnabled = !state.audioEnabled;
    },
    setAudioEnabled(state, action: PayloadAction<boolean>) {
      state.audioEnabled = action.payload;
    },
  },
});

export const { toggleAutoPlayNext, setAutoPlayNext, toggleAudioEnabled, setAudioEnabled } =
  audioSlice.actions;
export default audioSlice.reducer;
