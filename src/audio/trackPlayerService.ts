import { NativeModules, Platform } from 'react-native';
import { azkar } from '../mappers/azkarMapper';
import { resolveAudioSource, resolveLocalAudioUri } from './audioSource';
import { getStoredValue } from '../utils/storage';
import { isFeatureEnabled } from '../config/features';

// Guarded TrackPlayer import
let TrackPlayer: typeof import('react-native-track-player').default | null = null;
let cachedTrackPlayer: typeof import('react-native-track-player').default | null = null;

function getTrackPlayer(): typeof import('react-native-track-player').default | null {
  if (cachedTrackPlayer) return cachedTrackPlayer;
  if (Platform.OS === 'web') return null;
  // Expo Go guard: avoid require that throws uncaught native-module-not-found
  // Check native module presence before requiring (even try/catch is reported as uncaught by Metro).
  const hasNativeModule = Boolean(
    (NativeModules as any)?.TrackPlayerModule || (NativeModules as any)?.MusicModule
  );
  if (!hasNativeModule) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    TrackPlayer = require('react-native-track-player').default;
    cachedTrackPlayer = TrackPlayer;
    return TrackPlayer;
  } catch {
    return null;
  }
}

export function isTrackPlayerSupported(): boolean {
  if (!isFeatureEnabled('backgroundAudio')) return false;
  return Platform.OS !== 'web' && getTrackPlayer() !== null;
}

let isSetup = false;

export async function setupPlayer(): Promise<boolean> {
  if (!isFeatureEnabled('backgroundAudio')) return false;
  const TP = getTrackPlayer();
  if (!TP) return false;
  if (isSetup) return true;
  try {
    await TP.setupPlayer();
    const { Capability, AppKilledPlaybackBehavior } = await import('react-native-track-player');
    await TP.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
      notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    });
    isSetup = true;
    return true;
  } catch {
    return false;
  }
}

async function buildTracksForCategory(
  categoryId: string,
  opts: { startAtCurrentPhrase: boolean; autoPlayNext: boolean }
): Promise<{ id: string; url: string; title: string; artist: string }[]> {
  const cat = azkar.find((c) => String(c.id) === String(categoryId));
  if (!cat) return [];

  let phrases = cat.phrases;
  if (opts.startAtCurrentPhrase && opts.autoPlayNext) {
    // Start from current phrase index stored per-category
    const idx = await getStoredValue<number>(`azkar-index-${categoryId}`, 0);
    const safeIdx = Math.max(0, Math.min(idx, phrases.length - 1));
    phrases = phrases.slice(safeIdx);
  } else if (opts.startAtCurrentPhrase && !opts.autoPlayNext) {
    const idx = await getStoredValue<number>(`azkar-index-${categoryId}`, 0);
    const safeIdx = Math.max(0, Math.min(idx, phrases.length - 1));
    phrases = [phrases[safeIdx]];
  }

  const tracks: { id: string; url: string; title: string; artist: string }[] = [];
  for (const phrase of phrases) {
    const source = resolveAudioSource(phrase, cat);
    if (source.kind === 'missing') continue;
    const uri = await resolveLocalAudioUri(source.filename);
    if (!uri) continue;
    tracks.push({
      id: String(phrase.id),
      url: uri,
      title: phrase.text.slice(0, 80) || `ذكر ${phrase.id}`,
      artist: cat.title || 'Zikrukum',
    });
  }
  return tracks;
}

export async function playCategory(
  categoryId: string,
  opts: { startAtCurrentPhrase?: boolean } = {}
): Promise<boolean> {
  if (!isFeatureEnabled('backgroundAudio')) return false;
  const TP = getTrackPlayer();
  if (!TP) return false;
  const ok = await setupPlayer();
  if (!ok) return false;

  // Ensure only TrackPlayer is active — caller should stop expo-audio if needed.
  try {
    await TP.stop();
    await TP.reset();
  } catch {
    // no-op
  }

  // Read autoPlayNext from storage (cannot use Redux hooks here; headless may have no store)
  const autoPlayNext = await getStoredValue<boolean>('autoPlayNext', true);
  const startAtCurrentPhrase = opts.startAtCurrentPhrase ?? true;

  const tracks = await buildTracksForCategory(categoryId, {
    startAtCurrentPhrase,
    autoPlayNext,
  });
  if (tracks.length === 0) return false;

  try {
    // Update capabilities based on queue length
    const { Capability } = await import('react-native-track-player');
    const hasQueue = tracks.length > 1 && autoPlayNext;
    const caps = hasQueue
      ? [Capability.Play, Capability.Pause, Capability.Stop, Capability.SkipToNext, Capability.SkipToPrevious]
      : [Capability.Play, Capability.Pause, Capability.Stop];
    await TP.updateOptions({
      capabilities: caps,
      notificationCapabilities: caps,
      compactCapabilities: caps,
    });

    await TP.add(tracks);
    await TP.play();
    return true;
  } catch {
    return false;
  }
}

export async function togglePlayPause(): Promise<void> {
  const TP = getTrackPlayer();
  if (!TP) return;
  try {
    const state = await TP.getPlaybackState();
    // state.state is State.Playing etc; import State enum dynamically to avoid top-level require
    const { State } = await import('react-native-track-player');
    if (state.state === State.Playing) {
      await TP.pause();
    } else {
      await TP.play();
    }
  } catch {
    // no-op
  }
}

export async function stopPlayback(_reason: 'user' | 'ended' | 'error' = 'user'): Promise<void> {
  const TP = getTrackPlayer();
  if (!TP) return;
  try {
    await TP.stop();
    await TP.reset();
  } catch {
    // idempotent — safe when nothing playing
  }
  // TrackPlayer stop+reset clears the foreground service + media notification.
  // No extra notifee cancel needed (media notification is owned by TrackPlayer).
}

export async function skipNext(): Promise<void> {
  const TP = getTrackPlayer();
  if (!TP) return;
  try {
    await TP.skipToNext();
    await TP.play();
  } catch {
    // no-op
  }
}

export async function skipPrev(): Promise<void> {
  const TP = getTrackPlayer();
  if (!TP) return;
  try {
    await TP.skipToPrevious();
    await TP.play();
  } catch {
    // no-op
  }
}
