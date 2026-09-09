/**
 * Central feature kill-switches — edit before each build to control
 * what ships. No code deletion; flags only gate bootstrap / UI / actions.
 *
 * Dev / local: keep all `true` normally. To test the flag system,
 * flip one key to `false` locally and reload — that is the prod path.
 *
 * Rule: every new top-level feature gets a key here; gates should use
 * `isFeatureEnabled('key')` (or `useFeature('key')` inside React) and
 * AND it with platform guards (`Platform.OS !== 'web'` etc.).
 */

export type FeatureKey = 'backgroundAudio' | 'foregroundAudio' | 'reminders' | 'volumeNav';

export const FEATURES: Record<FeatureKey, boolean> = {
  // Background/killed-state playback via react-native-track-player + media notification
  // + reminder `تشغيل` Play action. Disabled: patch/licensing instability.
  backgroundAudio: false,
  // Foreground per-phrase playback via expo-audio (useZikrAudio)
  foregroundAudio: true,
  // Adhkar reminders via @notifee (channel + scheduling)
  reminders: true,
  // Hardware volume-button navigation on CategoryScreen
  volumeNav: true,
} as const;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key] === true;
}

// Optional: force-enable all in dev while keeping FEATURES as prod source of truth.
// Default off so that flipping a key locally actually exercises the gate.
// Uncomment to bypass flags during unrelated dev work:
// export function isFeatureEnabled(key: FeatureKey): boolean {
//   if (__DEV__) return true;
//   return FEATURES[key] === true;
// }
