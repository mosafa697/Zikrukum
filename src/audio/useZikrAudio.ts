import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { useDispatch, useSelector } from 'react-redux';
import { resolveAudioSource, resolveLocalAudioUri, type AudioSource } from './audioSource';
import {
  setCurrentPhrase,
  setPlaybackStatus,
  setPlaybackTime,
  setPlaybackError,
  resetPlayback,
} from '../store/slices/playbackSlice';
import type { RootState } from '../store';
import type { AzkarPhrase, AzkarCategory } from '../mappers/azkarMapper';
import type { PlaybackStatus } from '../store/slices/playbackSlice';

type UseZikrAudioOptions = {
  phrase: AzkarPhrase | undefined;
  category: AzkarCategory | undefined;
  repeatCount?: number;
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

export function useZikrAudio({
  phrase,
  category,
  repeatCount: rawRepeatCount = 1,
  onEnded,
}: UseZikrAudioOptions): UseZikrAudioResult {
  const repeatCount = Math.max(1, rawRepeatCount);
  const dispatch = useDispatch();
  const playbackState = useSelector((s: RootState) => s.playback);
  const audioEnabled = useSelector((s: RootState) => s.audio.audioEnabled);

  const phraseId = phrase?.id ?? -1;

  const source = useMemo<AudioSource>(() => {
    if (!phrase || !category) return { kind: 'missing' };
    return resolveAudioSource(phrase, category);
  }, [phrase, category]);

  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const isLoadingRef = useRef(false);
  const currentPhraseIdRef = useRef<number>(phraseId);
  const loadRequestRef = useRef(0);
  const remainingRepeatsRef = useRef(repeatCount);

  useEffect(() => {
    currentPhraseIdRef.current = phraseId;
    remainingRepeatsRef.current = repeatCount;
  }, [phraseId, repeatCount]);

  useEffect(() => {
    return () => {
      loadRequestRef.current += 1;
      isLoadingRef.current = false;
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
    const requestId = ++loadRequestRef.current;
    dispatch(setPlaybackStatus('loading'));

    try {
      const localUri = source.kind === 'local' ? await resolveLocalAudioUri(source.filename) : null;
      if (!localUri) {
        dispatch(setPlaybackError('playbackError'));
        isLoadingRef.current = false;
        return null;
      }

      const player = loadPlayer(localUri);

      if (requestId !== loadRequestRef.current || currentPhraseIdRef.current !== phraseId) {
        isLoadingRef.current = false;
        void removePlayer(player);
        return null;
      }

      subscriptionRef.current = player.addListener('playbackStatusUpdate', (playbackStatus) => {
        if (!playbackStatus.isLoaded) {
          return;
        }
        // Ignore status events from a player that belongs to a previous phrase.
        if (currentPhraseIdRef.current !== phraseId) {
          return;
        }
        if (playbackStatus.didJustFinish && !playbackStatus.loop) {
          remainingRepeatsRef.current -= 1;
          if (remainingRepeatsRef.current > 0) {
            dispatch(setPlaybackTime({ currentTime: 0, duration: player.duration }));
            void player.seekTo(0).then(() => player.play());
            return;
          }
          dispatch(setPlaybackStatus('finished'));
          dispatch(setPlaybackTime({ currentTime: player.duration, duration: player.duration }));
          onEnded?.();
        } else if (playbackStatus.playing) {
          dispatch(setPlaybackStatus('playing'));
          dispatch(setPlaybackTime({ currentTime: player.currentTime, duration: player.duration }));
        } else if (playbackStatus.isBuffering) {
          dispatch(setPlaybackStatus('loading'));
        }
      });

      playerRef.current = player;
      isLoadingRef.current = false;
      dispatch(setPlaybackTime({ currentTime: player.currentTime, duration: player.duration }));
      return player;
    } catch {
      if (requestId === loadRequestRef.current && currentPhraseIdRef.current === phraseId) {
        dispatch(setPlaybackError('playbackError'));
      }
      isLoadingRef.current = false;
      return null;
    }
  }, [source, phraseId, dispatch, onEnded]);

  const toggle = useCallback(async () => {
    if (!audioEnabled || source.kind === 'missing') return;

    const player = playerRef.current;

    if (player) {
      if (player.playing) {
        player.pause();
        dispatch(setPlaybackStatus('paused'));
      } else {
        const isAtEnd = player.duration > 0 && player.currentTime >= player.duration - 0.05;
        if (isAtEnd) {
          remainingRepeatsRef.current = repeatCount;
          await player.seekTo(0);
        }
        player.play();
        dispatch(setPlaybackStatus('playing'));
      }
      return;
    }

    // Need to load first
    remainingRepeatsRef.current = repeatCount;
    const loaded = await ensurePlayer();
    if (loaded) {
      loaded.play();
      dispatch(setPlaybackStatus('playing'));
    }
  }, [audioEnabled, source, repeatCount, ensurePlayer, dispatch]);

  const stop = useCallback(async () => {
    loadRequestRef.current += 1;
    isLoadingRef.current = false;

    const player = playerRef.current;
    playerRef.current = null;
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;

    if (player) {
      try {
        player.pause();
        await player.seekTo(0);
      } catch {
        // ignore
      }
      try {
        player.remove();
      } catch {
        // ignore
      }
    }
    dispatch(setPlaybackStatus('idle'));
    dispatch(setPlaybackTime({ currentTime: 0, duration: 0 }));
  }, [dispatch]);

  // Poll the player while playing so the progress bar/time stay in sync.
  useEffect(() => {
    if (playbackState.status !== 'playing' || !playerRef.current) {
      return;
    }

    const player = playerRef.current;
    const update = () => {
      if (!player) return;
      dispatch(setPlaybackTime({ currentTime: player.currentTime, duration: player.duration }));
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [playbackState.status, dispatch]);

  useEffect(() => {
    dispatch(setCurrentPhrase(phraseId >= 0 ? phraseId : null));
    if (!audioEnabled) return;
    return () => {
      void stop();
    };
  }, [audioEnabled, dispatch, phraseId, stop]);

  // Determine what status to expose
  const status: PlaybackStatus = useMemo(() => {
    if (source.kind === 'missing') return 'missing';
    if (playbackState.currentPhraseId !== phraseId) return 'idle';
    return playbackState.status;
  }, [source.kind, playbackState.currentPhraseId, playbackState.status, phraseId]);

  const audioAvailable = source.kind === 'local' && status !== 'error';

  return { status, audioAvailable, toggle, stop };
}
