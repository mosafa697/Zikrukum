// Empty mock for web — prevents Metro from bundling native-only modules.
// Used by metro.config.js resolver for `react-native-track-player` and `shaka-player` on web.
// Provides minimal stubs so dynamic `import('react-native-track-player')` on web
// does not crash if accidentally invoked (TrackPlayerService guards already
// return early on web, so these are safety fallbacks).
const noop = () => Promise.resolve();
const TrackPlayerMock = {
  setupPlayer: noop,
  updateOptions: noop,
  add: noop,
  play: noop,
  pause: noop,
  stop: noop,
  reset: noop,
  skipToNext: noop,
  skipToPrevious: noop,
  getPlaybackState: () => Promise.resolve({ state: 'none' }),
  registerPlaybackService: () => {},
  addEventListener: () => ({ remove: () => {} }),
};

module.exports = TrackPlayerMock;
module.exports.default = TrackPlayerMock;
module.exports.Capability = {
  Play: 'play',
  Pause: 'pause',
  Stop: 'stop',
  SkipToNext: 'next',
  SkipToPrevious: 'previous',
};
module.exports.State = {
  None: 'none',
  Playing: 'playing',
  Paused: 'paused',
  Stopped: 'stopped',
  Buffering: 'buffering',
  Ready: 'ready',
};
module.exports.Event = {
  RemotePlay: 'remote-play',
  RemotePause: 'remote-pause',
  RemoteStop: 'remote-stop',
  RemoteNext: 'remote-next',
  RemotePrevious: 'remote-previous',
  PlaybackQueueEnded: 'playback-queue-ended',
};
module.exports.AppKilledPlaybackBehavior = {
  StopPlaybackAndRemoveNotification: 'stop',
};

// Shaka mock (same file handles shaka-player alias; provide `default` with polyfill)
module.exports.polyfill = { installAll: () => {} };
module.exports.Player = class {
  static isBrowserSupported() {
    return false;
  }
  attach() {}
  addEventListener() {}
  load() {
    return Promise.resolve();
  }
  unload() {
    return Promise.resolve();
  }
  retryStreaming() {}
};
