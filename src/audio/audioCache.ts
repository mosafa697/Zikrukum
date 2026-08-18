import { Directory, File, Paths } from 'expo-file-system';

const CACHE_SUBDIR = 'zikr-audio';

function getCacheDir(): Directory {
  return new Directory(Paths.cache, CACHE_SUBDIR);
}

export async function getCachedPath(filename: string): Promise<string | null> {
  const file = new File(getCacheDir(), `${filename}.mp3`);
  return file.exists ? file.uri : null;
}

export async function cacheRemoteFile(url: string, filename: string): Promise<string> {
  const dir = getCacheDir();
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  const destFile = new File(dir, `${filename}.mp3`);
  const downloaded = await File.downloadFileAsync(url, destFile, { idempotent: true });
  return downloaded.uri;
}

export async function ensureCached(url: string, filename: string): Promise<string> {
  const cached = await getCachedPath(filename);
  if (cached) return cached;
  return cacheRemoteFile(url, filename);
}

export async function clearAudioCache(): Promise<void> {
  const dir = getCacheDir();
  if (dir.exists) {
    dir.delete();
  }
}
