import { Asset } from 'expo-asset';

/**
 * Static require map for every locally bundled MP3 clip.
 * Metro must see each `require()` at build time so the file is included in the bundle.
 * Keys are the stripped filenames from the dataset (no `/audio/` prefix, no `.mp3` extension).
 *
 * Currently empty because the dataset has no audio references yet. Add entries here
 * when real recitation clips are placed under `assets/audio/` and their filenames are
 * added to the dataset.
 */
const AUDIO_ASSETS: Record<string, number> = {
  // Example:
  // '248': require('../../assets/audio/248.mp3'),
};

export async function resolveLocalAudioUri(filename: string): Promise<string | null> {
  const moduleId = AUDIO_ASSETS[filename];
  if (moduleId === undefined) {
    return null;
  }

  const asset = Asset.fromModule(moduleId);
  if (!asset.localUri) {
    await asset.downloadAsync();
  }

  return asset.localUri ?? asset.uri ?? null;
}
