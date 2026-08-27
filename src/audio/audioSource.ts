import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';

export type AudioSource = { kind: 'local'; filename: string } | { kind: 'missing' };

/**
 * Static require map for every locally bundled MP3 clip.
 * Metro must see each `require()` at build time so the file is included in the bundle.
 * Keys are the stripped filenames from the dataset (no `/audio/` prefix, no `.mp3` extension).
 */
const AUDIO_ASSETS: Record<string, number> = {
  // for example:
  // '1-1': require('../../assets/audio/1-1.mp3'),
};

function stripAudioPath(value: string): string {
  return value.replace(/^\/?audio\//, '').replace(/\.mp3$/i, '');
}

export function resolveAudioSource(phrase: AzkarPhrase, category: AzkarCategory): AudioSource {
  const filename = phrase.filename?.trim() || category.audioRef?.filename?.trim();
  const audio = phrase.audio?.trim() || category.audioRef?.audio?.trim();

  if (!filename && !audio) {
    return { kind: 'missing' };
  }

  const resolvedFilename = stripAudioPath(filename ?? audio ?? '');

  if (!resolvedFilename) {
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
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists) {
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
