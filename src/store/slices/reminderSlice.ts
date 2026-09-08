import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReminderTime = {
  hour: number;
  minute: number;
};

export type ReminderEntry = {
  enabled: boolean;
  time: ReminderTime;
};

export type RemindersState = {
  morning: ReminderEntry;
  evening: ReminderEntry;
};

function clampTime(time: ReminderTime): ReminderTime {
  return {
    hour: Math.min(23, Math.max(0, Math.floor(time.hour))),
    minute: Math.min(59, Math.max(0, Math.floor(time.minute))),
  };
}

export const REMINDER_DEFAULTS: RemindersState = {
  morning: { enabled: true, time: { hour: 6, minute: 0 } },
  evening: { enabled: true, time: { hour: 17, minute: 0 } },
};

const initialState: RemindersState = REMINDER_DEFAULTS;

const reminderSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    setMorningEnabled(state, action: PayloadAction<boolean>) {
      state.morning.enabled = action.payload;
    },
    toggleMorning(state) {
      state.morning.enabled = !state.morning.enabled;
    },
    setEveningEnabled(state, action: PayloadAction<boolean>) {
      state.evening.enabled = action.payload;
    },
    toggleEvening(state) {
      state.evening.enabled = !state.evening.enabled;
    },
    setMorningTime(state, action: PayloadAction<ReminderTime>) {
      state.morning.time = clampTime(action.payload);
    },
    setEveningTime(state, action: PayloadAction<ReminderTime>) {
      state.evening.time = clampTime(action.payload);
    },
    setReminders(state, action: PayloadAction<RemindersState>) {
      state.morning = {
        enabled: Boolean(action.payload.morning.enabled),
        time: clampTime(action.payload.morning.time),
      };
      state.evening = {
        enabled: Boolean(action.payload.evening.enabled),
        time: clampTime(action.payload.evening.time),
      };
    },
  },
});

export const {
  setMorningEnabled,
  toggleMorning,
  setEveningEnabled,
  toggleEvening,
  setMorningTime,
  setEveningTime,
  setReminders,
} = reminderSlice.actions;

export default reminderSlice.reducer;
