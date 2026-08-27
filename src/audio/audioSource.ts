import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';

export type AudioSource = { kind: 'local'; filename: string } | { kind: 'missing' };

function stripAudioPath(value: string): string {
  return value.replace(/^\/audio\//, '').replace(/\.mp3$/i, '');
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
