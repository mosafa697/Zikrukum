import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';

export type AudioSource = { kind: 'local'; filename: string } | { kind: 'missing' };

/**
 * Static require map for every locally bundled MP3 clip.
 * Metro must see each `require()` at build time so the file is included in the bundle.
 * Keys are the stripped filenames from the dataset (no `/audio/` prefix, no `.mp3` extension).
 */
const AUDIO_ASSETS: Record<string, number> = {
  '1': require('../../assets/audio/1.mp3'),
  '2': require('../../assets/audio/2.mp3'),
  '3': require('../../assets/audio/3.mp3'),
  '4': require('../../assets/audio/4.mp3'),
  '5': require('../../assets/audio/5.mp3'),
  '6': require('../../assets/audio/6.mp3'),
  '7': require('../../assets/audio/7.mp3'),
  '8': require('../../assets/audio/8.mp3'),
  '9': require('../../assets/audio/9.mp3'),
  '10': require('../../assets/audio/10.mp3'),
  '11': require('../../assets/audio/11.mp3'),
  '12': require('../../assets/audio/12.mp3'),
  '13': require('../../assets/audio/13.mp3'),
  '14': require('../../assets/audio/14.mp3'),
  '15-16': require('../../assets/audio/15-16.mp3'),
  '17': require('../../assets/audio/17.mp3'),
  '18': require('../../assets/audio/18.mp3'),
  '19': require('../../assets/audio/19.mp3'),
  '20': require('../../assets/audio/20.mp3'),
  '21': require('../../assets/audio/21.mp3'),
  '22': require('../../assets/audio/22.mp3'),
  '24': require('../../assets/audio/24.mp3'),
  '25': require('../../assets/audio/25.mp3'),
  '26': require('../../assets/audio/26.mp3'),
  '27': require('../../assets/audio/27.mp3'),
  '28': require('../../assets/audio/28.mp3'),
  '29': require('../../assets/audio/29.mp3'),
  '30': require('../../assets/audio/30.mp3'),
  '31': require('../../assets/audio/31.mp3'),
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
