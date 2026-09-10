import { Platform, Vibration } from 'react-native';

// Short, non-intrusive pulse for a successful dhikr counter increment.
// iOS ignores the duration (fixed short buzz); web is a no-op.
// Fire-and-forget: callers never await, and a failure must never break counting.
const COUNT_HAPTIC_MS = 15;

export function triggerCountHaptic(): void {
  if (Platform.OS === 'web') return;
  try {
    Vibration.vibrate(COUNT_HAPTIC_MS);
  } catch {
    // Best-effort only.
  }
}
