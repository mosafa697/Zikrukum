import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useDispatch, useSelector } from 'react-redux';
import { resolveAudioSource, type AudioSource } from './audioSource';
import { ensureCached } from './audioCache';
import { setPlaybackStatus, setPlaybackError, resetPlayback } from '../store/slices/playbackSlice';
import type { RootState } from '../store';
import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';
import type { PlaybackStatus } from '../store/slices/playbackSlice';

type UseZikrAudioOptions = {
  phrase: AzkarPhrase | undefined;
  category: AzkarCategory | undefined;
  onEnded?: () => void;
};

type UseZikrAudioResult = {
  status: PlaybackStatus;
  audioAvailable: boolean;
  toggle: () => void;
  stop: () => void;
};

function loadPlayer(uri: string): AudioPlayer {
  return createAudioPlayer(uri);
}

async function removePlayer(player: AudioPlayer): Promise<void> {
  try {
    player.remove();
  } catch {
    // ignore
  }
}

export function useZikrAudio({ phrase, category, onEnded }: UseZikrAudioOptions): UseZikrAudioResult {
  const dispatch = useDispatch();
  const playbackState = useSelector((s: RootState) => s.playback);

  const phraseId = phrase?.id ?? -1;

  const source = useMemo<AudioSource>(() => {
    if (!phrase || !category) return { kind: 'missing' };
    return resolveAudioSource(phrase, category);
  }, [phrase, category]);

  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const isLoadingRef = useRef(false);
  const currentPhraseIdRef = useRef<number>(phraseId);

  useEffect(() => {
    currentPhraseIdRef.current = phraseId;
    return () => {
      // Cleanup when phrase changes
    };
  }, [phraseId]);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (playerRef.current) {
        removePlayer(playerRef.current);
        playerRef.current = null;
      }
      dispatch(resetPlayback());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensurePlayer = useCallback(async (): Promise<AudioPlayer | null> => {
    if (source.kind === 'missing') return null;
    if (playerRef.current) return playerRef.current;
    if (isLoadingRef.current) return null;

    isLoadingRef.current = true;
    dispatch(setPlaybackStatus('loading'));

    try {
      const localUri = await ensureCached(source.url, source.filename);
      const player = loadPlayer(localUri);

      if (currentPhraseIdRef.current !== phraseId) {
        removePlayer(player);
        return null;
      }

      subscriptionRef.current = player.addListener('playbackStatusUpdate', (status) => {
        if (!status.isLoaded) {
          return;
        }
        if (status.didJustFinish && !status.loop) {
          dispatch(setPlaybackStatus('idle'));
          onEnded?.();
        } else if (status.playing) {
          dispatch(setPlaybackStatus('playing'));
        } else if (status.isBuffering) {
          dispatch(setPlaybackStatus('loading'));
        }
      });

      playerRef.current = player;
      isLoadingRef.current = false;
      return player;
    } catch {
      if (currentPhraseIdRef.current === phraseId) {
        dispatch(setPlaybackError('playbackError'));
      }
      isLoadingRef.current = false;
      return null;
    }
  }, [source, phraseId, dispatch, onEnded]);

  const toggle = useCallback(async () => {
    if (source.kind === 'missing') return;

    const player = playerRef.current;

    if (player) {
      if (player.playing) {
        player.pause();
        dispatch(setPlaybackStatus('paused'));
      } else {
        player.play();
        dispatch(setPlaybackStatus('playing'));
      }
      return;
    }

    // Need to load first
    const loaded = await ensurePlayer();
    if (loaded) {
      loaded.play();
      dispatch(setPlaybackStatus('playing'));
    }
  }, [source, ensurePlayer, dispatch]);

  const stop = useCallback(async () => {
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        await playerRef.current.seekTo(0);
      } catch {
        // ignore
      }
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      try {
        playerRef.current.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    dispatch(setPlaybackStatus('idle'));
  }, [dispatch]);

  // Determine what status to expose
  const status: PlaybackStatus = useMemo(() => {
    if (source.kind === 'missing') return 'missing';
    if (playbackState.currentPhraseId !== phraseId) return 'idle';
    return playbackState.status;
  }, [source.kind, playbackState.currentPhraseId, playbackState.status, phraseId]);

  const audioAvailable = source.kind === 'remote';

  return { status, audioAvailable, toggle, stop };
}
