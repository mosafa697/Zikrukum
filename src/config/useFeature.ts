import { useMemo } from 'react';
import { FEATURES, isFeatureEnabled, type FeatureKey } from './features';

/**
 * React hook wrapper around `isFeatureEnabled`.
 * Re-renders only if the key changes; FEATURES is a static const so
 * the value is stable per build. Kept as a hook so future
 * persisted-override migrations can swap to a selector without churn.
 */
export function useFeature(key: FeatureKey): boolean {
  return useMemo(() => isFeatureEnabled(key), [key]);
}

export { FEATURES, isFeatureEnabled, type FeatureKey };
