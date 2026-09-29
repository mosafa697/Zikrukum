import { useEffect, useRef } from 'react';
import { getVolumeManager } from './volumeManager';
import { config } from '../config/config';
import { isFeatureEnabled } from '../config/features';

// Volume nav pins the system volume mid-range so both keys always produce a
// detectable delta (at the min/max rails Android fires no event).
const VOLUME_NAV_BASELINE = 0.5;
const VOLUME_NAV_RAIL_EPS = 0.02;
// Two volume readings closer than this count as "no change" (rail / echo).
const VOLUME_NAV_DELTA_EPS = 1e-4;

interface UseVolumeNavOptions {
  /** Master switch from the Settings toggle. No listener while false. */
  enabled: boolean;
  /** While true (audio playing) keys belong to the OS: no intercept, no snap-back. */
  audioActive?: boolean;
  /** Volume-up press (single physical press = one call; holds collapse to one). */
  onVolumeUp: () => void;
  /** Volume-down press (single physical press = one call; holds collapse to one). */
  onVolumeDown: () => void;
}

/**
 * Shared hardware-volume-button navigation.
 *
 * Single physical press = exactly one `onVolumeUp`/`onVolumeDown` call; a
 * long-press auto-repeat flood collapses into that single call via a cooldown
 * (`config.interaction.longPressMs`). Every swallowed event (cooldown, restore
 * echo, rail) still snaps the system volume back to the stable baseline so the
 * baseline never drifts to a rail — the previous per-screen implementations
 * only re-baselined swallowed events, which walked the volume to a rail where
 * Android fires no event and stale-baseline direction detection then read both
 * keys as the same direction (dead keys until remount).
 */
export function useVolumeNav({
  enabled,
  audioActive = false,
  onVolumeUp,
  onVolumeDown,
}: UseVolumeNavOptions) {
  const lastVolumeRef = useRef<number | null>(null);
  const stableRef = useRef<number>(VOLUME_NAV_BASELINE);
  const volumeRestoringRef = useRef(false);
  const cooldownUntilRef = useRef(0);

  // Latest callbacks / flags for the mount-once native listener.
  const callbacksRef = useRef({ onVolumeUp, onVolumeDown });
  callbacksRef.current = { onVolumeUp, onVolumeDown };
  const audioActiveRef = useRef(audioActive);
  audioActiveRef.current = audioActive;

  // While audio is active the native volume UI stays visible and presses pass
  // through; otherwise nav mode re-engages and the baseline re-syncs.
  useEffect(() => {
    if (!isFeatureEnabled('volumeNav')) return;
    if (!enabled) return;
    const vm = getVolumeManager();
    if (!vm) return;
    void vm.showNativeVolumeUI({ enabled: audioActive });
    if (!audioActive) {
      void vm
        .getVolume()
        .then(({ volume }) => {
          stableRef.current = volume;
          lastVolumeRef.current = volume;
        })
        .catch(() => {
          // Keep the previous baseline; listener re-baselines on next event.
        });
    }
  }, [enabled, audioActive]);

  useEffect(() => {
    if (!isFeatureEnabled('volumeNav')) return;
    if (!enabled) return;
    let listener: { remove: () => void } | null = null;

    const snapBack = () => {
      if (volumeRestoringRef.current) return;
      const vm = getVolumeManager();
      if (!vm) return;
      const target = stableRef.current;
      volumeRestoringRef.current = true;
      void vm
        .setVolume(target, { playSound: false, showUI: false })
        .then(async () => {
          try {
            const vm2 = getVolumeManager();
            const { volume: actual } = (await vm2?.getVolume()) ?? { volume: target };
            stableRef.current = actual;
            lastVolumeRef.current = actual;
          } catch {
            stableRef.current = target;
            lastVolumeRef.current = target;
          }
        })
        .catch(() => {
          stableRef.current = target;
          lastVolumeRef.current = target;
        })
        .finally(() => {
          volumeRestoringRef.current = false;
        });
    };

    const init = async () => {
      const vm = getVolumeManager();
      if (!vm) {
        return;
      }
      try {
        const { volume } = await vm.getVolume();
        let baseline = volume;
        if (baseline <= VOLUME_NAV_RAIL_EPS || baseline >= 1 - VOLUME_NAV_RAIL_EPS) {
          // At a rail no event fires — re-center so both keys work.
          await vm.setVolume(VOLUME_NAV_BASELINE, { playSound: false, showUI: false });
          try {
            baseline = (await vm.getVolume()).volume;
          } catch {
            baseline = VOLUME_NAV_BASELINE;
          }
        }
        stableRef.current = baseline;
        lastVolumeRef.current = baseline;
        await vm.showNativeVolumeUI({ enabled: audioActiveRef.current });
        listener = vm.addVolumeListener(({ volume: current }) => {
          if (audioActiveRef.current) {
            // Audio active: keys belong to the OS; track volume for resume.
            lastVolumeRef.current = current;
            return;
          }
          if (volumeRestoringRef.current) {
            // Echo of our own snap-back (or a repeat racing it) — never act,
            // just track so the post-restore read stays consistent.
            lastVolumeRef.current = current;
            return;
          }

          const last = lastVolumeRef.current;
          if (last === null || last === undefined) {
            lastVolumeRef.current = current;
            return;
          }
          if (Math.abs(current - last) < VOLUME_NAV_DELTA_EPS) {
            // No delta means a system rail — re-center and snap back.
            stableRef.current = VOLUME_NAV_BASELINE;
            lastVolumeRef.current = current;
            snapBack();
            return;
          }
          const now = Date.now();
          if (now < cooldownUntilRef.current) {
            // Long-press auto-repeat (or bounce): swallow the action but STILL
            // snap back so the volume never drifts toward a rail.
            lastVolumeRef.current = current;
            snapBack();
            return;
          }
          if (current > last) {
            cooldownUntilRef.current = now + config.interaction.longPressMs;
            lastVolumeRef.current = stableRef.current;
            callbacksRef.current.onVolumeUp();
          } else {
            cooldownUntilRef.current = now + config.interaction.longPressMs;
            lastVolumeRef.current = stableRef.current;
            callbacksRef.current.onVolumeDown();
          }
          snapBack();
        });
      } catch {
        // Unavailable in Expo Go — test volume keys on a custom dev build.
      }
    };

    void init();

    return () => {
      listener?.remove();
      void getVolumeManager()?.showNativeVolumeUI({ enabled: true });
      lastVolumeRef.current = null;
      volumeRestoringRef.current = false;
      cooldownUntilRef.current = 0;
    };
  }, [enabled]);
}
