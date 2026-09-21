import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'finished' | 'error' | 'missing';

type PlaybackState = {
  currentPhraseId: number | null;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  // Session-only playback speed multiplier (1 = normal). Not persisted.
  rate: number;
  // Session-only repeat toggle (#52). Loops the audio without firing the
  // counter/auto-advance path; resets on phrase change and screen exit.
  repeat: boolean;
  errorKey?: string;
};

const initialState: PlaybackState = {
  currentPhraseId: null,
  status: 'idle',
  currentTime: 0,
  duration: 0,
  rate: 1,
  repeat: false,
  errorKey: undefined,
};

const playbackSlice = createSlice({
  name: 'playback',
  initialState,
  reducers: {
    setCurrentPhrase(state, action: PayloadAction<number | null>) {
      state.currentPhraseId = action.payload;
      state.repeat = false;
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
    setPlaybackRepeat(state, action: PayloadAction<boolean>) {
      state.repeat = action.payload;
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
      state.repeat = false;
      state.errorKey = undefined;
    },
  },
});

export const {
  setCurrentPhrase,
  setPlaybackStatus,
  setPlaybackTime,
  setPlaybackRate,
  setPlaybackRepeat,
  setPlaybackError,
  resetPlayback,
} = playbackSlice.actions;
export default playbackSlice.reducer;
