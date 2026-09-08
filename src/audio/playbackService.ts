/**
 * Headless Playback Service for react-native-track-player.
 * Registered via TrackPlayer.registerPlaybackService(() => require('./playbackService').default)
 * Runs in background / killed state.
 */

export default async function playbackService() {
  let TrackPlayer: typeof import('react-native-track-player').default | null = null;
  try {
    TrackPlayer = (await import('react-native-track-player')).default;
  } catch {
    return;
  }
  if (!TrackPlayer) return;

  const { Event } = await import('react-native-track-player');

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void TrackPlayer!.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void TrackPlayer!.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    try {
      await TrackPlayer!.stop();
      await TrackPlayer!.reset();
    } catch {
      // no-op
    }
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try {
      await TrackPlayer!.skipToNext();
      await TrackPlayer!.play();
    } catch {
      // no-op
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try {
      await TrackPlayer!.skipToPrevious();
      await TrackPlayer!.play();
    } catch {
      // no-op
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    try {
      await TrackPlayer!.stop();
      await TrackPlayer!.reset();
    } catch {
      // no-op
    }
  });
}
