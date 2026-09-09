import { NativeModules, Platform } from 'react-native';

type VolumeManagerType = {
  getVolume: () => Promise<{ volume: number }>;
  setVolume: (value: number, opts?: { playSound?: boolean; showUI?: boolean }) => Promise<void>;
  showNativeVolumeUI: (opts: { enabled: boolean }) => Promise<void>;
  addVolumeListener: (cb: (res: { volume: number }) => void) => { remove: () => void };
};

let cached: VolumeManagerType | null | undefined;

export function getVolumeManager(): VolumeManagerType | null {
  if (cached !== undefined) return cached;
  // Expo Go guard: native module not linked — avoid require that throws uncaught
  if (Platform.OS === 'web') {
    cached = null;
    return cached;
  }
  const hasNative = Boolean(
    (NativeModules as unknown as { VolumeManager?: unknown })?.VolumeManager ||
      (NativeModules as unknown as { VolumeManagerModule?: unknown })?.VolumeManagerModule ||
      (NativeModules as unknown as { RNVolumeManager?: unknown })?.RNVolumeManager
  );
  if (!hasNative) {
    cached = null;
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-volume-manager') as { VolumeManager: VolumeManagerType };
    cached = mod?.VolumeManager ?? null;
  } catch {
    cached = null;
  }
  return cached;
}
