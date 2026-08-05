import { ar } from './ar';

type Translations = typeof ar;
export type TranslationKey = keyof Translations;

const langs: Record<string, Translations> = { ar };
let currentLang = 'ar';

export function t(key: TranslationKey): string {
  return langs[currentLang]?.[key] ?? key;
}
