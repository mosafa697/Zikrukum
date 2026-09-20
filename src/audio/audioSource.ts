import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import type { AzkarPhrase } from '../mappers/azkarMapper';

export type AudioSource = { kind: 'local'; filename: string } | { kind: 'missing' };

/**
 * Static require map for every locally bundled MP3 clip.
 * Metro must see each `require()` at build time so the file is included in the bundle.
 * Keys are the phrase filenames from the dataset (`{categoryId}-{phraseId}`, no `.mp3` extension).
 */
const AUDIO_ASSETS: Record<string, number> = {
  '3-2': require('../../assets/audio/3-2.mp3'),
  '3-3': require('../../assets/audio/3-3.mp3'),
  '3-4': require('../../assets/audio/3-4.mp3'),
  '3-5': require('../../assets/audio/3-5.mp3'),
  '3-6': require('../../assets/audio/3-6.mp3'),
  '3-7': require('../../assets/audio/3-7.mp3'),
  '3-8': require('../../assets/audio/3-8.mp3'),
  '3-9': require('../../assets/audio/3-9.mp3'),
  '3-10': require('../../assets/audio/3-10.mp3'),
  '3-11': require('../../assets/audio/3-11.mp3'),
  '3-12': require('../../assets/audio/3-12.mp3'),
  '3-13': require('../../assets/audio/3-13.mp3'),
  '3-14': require('../../assets/audio/3-14.mp3'),
  '3-15': require('../../assets/audio/3-15.mp3'),
  '3-16': require('../../assets/audio/3-16.mp3'),
  '3-17': require('../../assets/audio/3-17.mp3'),
  '3-18': require('../../assets/audio/3-18.mp3'),
  '3-19': require('../../assets/audio/3-19.mp3'),
  '3-20': require('../../assets/audio/3-20.mp3'),
  '3-21': require('../../assets/audio/3-21.mp3'),
  '3-22': require('../../assets/audio/3-22.mp3'),
  '3-24': require('../../assets/audio/3-24.mp3'),
  '4-4': require('../../assets/audio/4-4.mp3'),
  '4-5': require('../../assets/audio/4-5.mp3'),
  '4-7': require('../../assets/audio/4-7.mp3'),
  '4-8': require('../../assets/audio/4-8.mp3'),
  '4-16': require('../../assets/audio/4-16.mp3'),
  '4-17': require('../../assets/audio/4-17.mp3'),
  '4-19': require('../../assets/audio/4-19.mp3'),
};

function stripAudioPath(value: string): string {
  return value.replace(/^\/?audio\//, '').replace(/\.mp3$/i, '');
}

/**
 * Resolves a phrase to its bundled clip in `assets/audio/` (via `AUDIO_ASSETS`).
 * Metro requires static `require()` calls, so a dynamic directory path cannot be
 * used at runtime — the phrase `filename` is looked up in the static map instead.
 * Empty metadata normalizes to `missing`.
 */
export function resolveAudioSource(phrase: AzkarPhrase): AudioSource {
  const filename = phrase.filename?.trim();

  if (!filename) {
    return { kind: 'missing' };
  }

  const resolvedFilename = stripAudioPath(filename);

  if (!resolvedFilename || AUDIO_ASSETS[resolvedFilename] === undefined) {
    return { kind: 'missing' };
  }

  return { kind: 'local', filename: resolvedFilename };
}

export async function resolveLocalAudioUri(filename: string): Promise<string | null> {
  const moduleId = AUDIO_ASSETS[filename];
  if (moduleId === undefined) {
    return null;
  }

  try {
    const asset = Asset.fromModule(moduleId);
    if (!asset.localUri) {
      await asset.downloadAsync();
    }

    const localUri = asset.localUri ?? asset.uri;
    if (!localUri) {
      return null;
    }

    try {
      const file = new File(localUri);
      if (!file.exists) {
        // Some platforms (e.g. web) may report the file as missing even when
        // the resolved URI is playable. Return the URI and let the player decide.
        return localUri;
      }
    } catch {
      // FileSystem checks may not be supported on some platforms. Fall through
      // and return the resolved URI so the player can attempt playback.
    }

    return localUri;
  } catch {
    return null;
  }
}
