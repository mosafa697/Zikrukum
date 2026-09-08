type VolumeManagerType = {
  getVolume: () => Promise<{ volume: number }>;
  setVolume: (value: number, opts?: { playSound?: boolean; showUI?: boolean }) => Promise<void>;
  showNativeVolumeUI: (opts: { enabled: boolean }) => Promise<void>;
  addVolumeListener: (cb: (res: { volume: number }) => void) => { remove: () => void };
};

let cached: VolumeManagerType | null | undefined;

export function getVolumeManager(): VolumeManagerType | null {
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-volume-manager') as { VolumeManager: VolumeManagerType };
    cached = mod?.VolumeManager ?? null;
  } catch {
    cached = null;
  }
  return cached;
}
