import * as Localization from 'expo-localization';

export function getDeviceLanguageCode(): string {
  const locales = Localization.getLocales?.();
  return locales?.[0]?.languageCode ?? '';
}

export function shouldForceArabicRtl(): boolean {
  const code = getDeviceLanguageCode().toLowerCase();
  return code === 'ar' || code === 'en';
}
