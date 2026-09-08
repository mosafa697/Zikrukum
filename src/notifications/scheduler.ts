import type { ReminderTime } from '../store/slices/reminderSlice';

/**
 * Pure helper: compute next wall-clock occurrence for hour:minute.
 * If time today has already passed, returns tomorrow at same time.
 * Uses local Date, no UTC conversion — DAILY repeat follows wall-clock after timezone changes.
 */
export function getNextTriggerDate(time: ReminderTime, now: Date = new Date()): Date {
  const next = new Date(now);
  next.setHours(time.hour, time.minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function getNextTriggerTimestamp(time: ReminderTime, now: Date = new Date()): number {
  return getNextTriggerDate(time, now).getTime();
}
