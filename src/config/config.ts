export const config = {
  audio: {
    /** Local bundled asset directory (relative to project root). Clips are resolved via `expo-asset`. */
    assetDir: 'assets/audio',
  },
  about: {
    /** Product name shown in the Settings About card. */
    appName: 'Zikrukum',
    /** Generic developer credit brand (no personal contact). */
    developerName: 'The Athr Group',
    /** MIT license copyright notice line. */
    licenseCopyright: '© 2026 The Athr Group',
    /** Android Play package id — used for the Rate action. */
    playPackageId: 'com.azkar.zikrukum',
    /** HTTPS store listing used as the market:// fallback. */
    playStoreWebUrl: 'https://play.google.com/store/apps/details?id=com.azkar.zikrukum',
    /** Support inbox for the Contact action. Placeholder — replace before release. */
    contactEmail: 'support@example.com',
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
