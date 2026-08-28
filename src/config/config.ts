export const config = {
  audio: {
    /** Local bundled asset directory (relative to project root). Clips are resolved via `expo-asset`. */
    assetDir: 'assets/audio',
  },
  font: {
    minScale: 0.6,
    maxScale: 2.0,
    defaultScale: 1.2,
    scaleIncrement: 0.1,
  },
  interaction: {
    counterGuardMs: 250,
    navButtonGuardMs: 250,
    freeTasbihTapGuardMs: 120,
    freeTasbihAnimationMs: 160,
    longPressMs: 600,
  },
};
