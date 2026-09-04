---
name: zikrukum-theming
description: Apply Zikrukum themes, fonts, RTL layout, and Arabic strings. Use when styling screens, adding text, or fixing layout on iOS, Android, or web.
---

## What I do
- Keep light / solarized / dark themes consistent via tokens.
- Enforce font, RTL, and i18n rules for Arabic content.

## When to use me
Use when adding UI, changing colors, adding text, or debugging RTL/mirroring issues.

## Themes (`src/theme/azkarTheme.ts`)
- Themes in `AZKAR_THEME_MAP`: `light`, `solarized`, `dark` (default `solarized`). Access pattern:
  ```tsx
  const themeName = useSelector((s: RootState) => s.theme.value);
  const theme = getAzkarTheme(themeName);
  ```
- Palette direction: light = white/sand + emerald + shiny blue accents; solarized = warm sand + deep emerald `#2F5D50` + gold `#BB9A4F`; dark = matte black-blue + blue accents.
- Always use tokens (`bgColor`, `bgGradient`, `verseGradient`, `accentGradient`, `tasbihGradient`, `cardBgColor`, `textColor`, etc.). Never hardcode hex values in screens.
- Visual reference: the built screens + `AZKAR_THEME_MAP` palettes are the source of truth (the old `adhkar-redesign.html` file was removed from the repo).

## Fonts
- `AZKAR_PRIMARY_FONT` / `AZKAR_TITLE_FONT` = `ScheherazadeNew` (Regular-only face — `fontWeight` bold will not resolve).
- `AZKAR_COUNTER_FONT` = `TajawalBold` (`Tajawal-ExtraBold.ttf`) for numeric counters.
- Font scale: `src/store/slices/fontScaleSlice` (0.8–1.6, default 1.2, step 0.1 via `config.font`), applied as multiplier.

## RTL
- Native builds force RTL app-wide (`I18nManager.forceRTL` in `index.ts`).
- Web: `forceRTL` is a no-op, so `PhraseCard` mirrors the pager with `scaleX: -1` (pages counter-mirrored) via `RTL_MIRROR_SCALE`. Result: swipe right = next phrase on every platform.
- Arabic quote blocks (verse/hadith on `CategoriesScreen`) currently use static centered styles with no `writingDirection`. Conditional RTL per device locale is a pending `TODO.md` task: when implemented, apply `writingDirection: 'rtl'` + `textAlign: 'right'` when `expo-localization` `getLocales()[0].languageCode` is `ar`/`en` (note: `expo-localization` is installed but not yet imported anywhere in `src/`).
- `PhraseCard` pager: horizontal `FlatList` with `pagingEnabled` + `getItemLayout`, one page per phrase, page width from measured `onLayout`. Index sync is bidirectional and loop-free via `expectedIndexRef`; user swipes commit on `onMomentumScrollEnd` (+ ~120 ms settle fallback in `onScroll` for web); external changes `scrollToOffset` from `useEffect` on `[index, pageWidth]`.

## i18n (`src/i18n/`)
- All UI strings live in `src/i18n/ar.ts` (source of truth); look up with `t('key')` from `src/i18n/index.ts`.
- `TranslationKey` derives from the `ar` object type — adding a key to `ar.ts` makes it available everywhere. Add new languages as new files wired in `index.ts`.
