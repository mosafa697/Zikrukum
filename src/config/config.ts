export const config = {
  audio: {
    /** Local bundled asset directory (relative to project root). Clips are resolved via `expo-asset`. */
    assetDir: 'assets/audio',
  },
  reminders: {
    morningDefault: { hour: 6, minute: 0 },
    eveningDefault: { hour: 17, minute: 0 },
    fridayDefault: { hour: 9, minute: 0 },
  },
  font: {
    minScale: 0.8,
    maxScale: 1.7,
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
