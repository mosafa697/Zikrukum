import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'finished' | 'error' | 'missing';

type PlaybackState = {
  currentPhraseId: number | null;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  // Session-only playback speed multiplier (1 = normal). Not persisted.
  rate: number;
  errorKey?: string;
};

const initialState: PlaybackState = {
  currentPhraseId: null,
  status: 'idle',
  currentTime: 0,
  duration: 0,
  rate: 1,
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
    setPlaybackTime(state, action: PayloadAction<{ currentTime: number; duration: number }>) {
      state.currentTime = action.payload.currentTime;
      state.duration = action.payload.duration;
    },
    setPlaybackRate(state, action: PayloadAction<number>) {
      state.rate = action.payload;
    },
    setPlaybackError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.errorKey = action.payload;
    },
    resetPlayback(state) {
      state.currentPhraseId = null;
      state.status = 'idle';
      state.currentTime = 0;
      state.duration = 0;
      state.errorKey = undefined;
    },
  },
});

export const {
  setCurrentPhrase,
  setPlaybackStatus,
  setPlaybackTime,
  setPlaybackRate,
  setPlaybackError,
  resetPlayback,
} = playbackSlice.actions;
export default playbackSlice.reducer;
