import { Directory, Paths } from 'expo-file-system';

const LEGACY_CACHE_SUBDIR = 'zikr-audio';

function getLegacyCacheDir(): Directory {
  return new Directory(Paths.cache, LEGACY_CACHE_SUBDIR);
}

/**
 * Clears any audio files left over from the old remote-download implementation.
 * The app now uses bundled local assets, so the legacy cache directory is no longer needed.
 */
export async function clearLegacyAudioCache(): Promise<void> {
  const dir = getLegacyCacheDir();
  if (dir.exists) {
    await dir.delete();
  }
}
