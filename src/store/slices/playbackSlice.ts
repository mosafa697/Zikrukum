import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'missing';

type PlaybackState = {
  currentPhraseId: number | null;
  status: PlaybackStatus;
  errorKey?: string;
};

const initialState: PlaybackState = {
  currentPhraseId: null,
  status: 'idle',
  errorKey: undefined,
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setCurrentPhrase(state, action: PayloadAction<number | null>) {
      state.currentPhraseId = action.payload;
      if (action.payload === null) {
        state.status = 'idle';
        state.errorKey = undefined;
      }
    },
    setPlaybackStatus(state, action: PayloadAction<PlaybackStatus>) {
      state.status = action.payload;
      if (action.payload !== 'error') {
        state.errorKey = undefined;
      }
    },
    setPlaybackError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errorKey = action.payload;
    },
    resetPlayback(state) {
      state.currentPhraseId = null;
      state.status = 'idle';
      state.errorKey = undefined;
    },
  },
});

export const { setCurrentPhrase, setPlaybackStatus, setPlaybackError, resetPlayback } =
  playbackSlice.actions;
export default playbackSlice.reducer;
