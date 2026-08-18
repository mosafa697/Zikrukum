import { config } from '../config/config';
import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';

export type AudioSource =
  | { kind: 'remote'; url: string; filename: string }
  | { kind: 'missing' };

export function resolveAudioSource(
  phrase: AzkarPhrase,
  category: AzkarCategory
): AudioSource {
  const filename = phrase.filename ?? category.audioRef?.filename;
  const audio = phrase.audio ?? category.audioRef?.audio;

  if (!filename && !audio) {
    return { kind: 'missing' };
  }

  const resolvedFilename = filename ?? audio?.replace(/^\/audio\//, '').replace(/\.mp3$/, '') ?? '';

  if (!resolvedFilename) {
    return { kind: 'missing' };
  }

  const url = `${config.audio.baseUrl}${resolvedFilename}.mp3`;
  return { kind: 'remote', url, filename: resolvedFilename };
}
