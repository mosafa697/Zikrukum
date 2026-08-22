# AGENTS.md

Context and architecture reference for the Zikrukum project. Keep this file up to date when structure, conventions, or workflows change.

## Project Overview

**Zikrukum** is a React Native (Expo) mobile app for reading daily Azkar (Islamic remembrances/supplications). It is a migration of an existing Azkar app. All data is bundled locally (JSON + fonts) — the app works fully offline.

- **Name**: Zikrukum
- **Platforms**: iOS, Android, Web (Expo SDK ~54)
- **Language**: TypeScript (strict mode)
- **Primary UI language**: Arabic (RTL content, strings in `src/i18n/ar.ts`)

## Tech Stack

| Area | Choice |
|---|---|
| Framework | React Native 0.81 + Expo ~54 |
| Language | TypeScript ~5.9 (strict) |
| State | Redux Toolkit 2.x (`@reduxjs/toolkit` + `react-redux`) |
| Navigation | `@react-navigation/native` + `native-stack` |
| Persistence | `@react-native-async-storage/async-storage` |
| Audio | `expo-audio`, `expo-file-system` (remote fetch + local cache) |
| Fonts | `expo-font` (ScheherazadeNew, Tajawal Bold/Regular, Amiri Regular/Bold) |
| Lint/Format | ESLint (flat config, `eslint-config-expo`) + Prettier |

## Commands

```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS (macOS only)
npm run web        # Run in browser
npm run lint       # ESLint check
npm run lint:fix   # ESLint --fix + Prettier write
```

TypeScript check: `npx tsc --noEmit`

## Project Structure

```
Zikrukum/
├── App.tsx                     # Entry: loads fonts + persisted store, renders providers
├── index.ts                    # Expo entry point
├── app.json                    # Expo config (name, scheme, plugins)
├── adhkar-redesign.html        # UI redesign reference (design source of truth)
├── assets/                     # Fonts, icons
└── src/
    ├── audio/                  # Audio source resolution + file caching
    │   ├── audioSource.ts      # Resolves phrase/category audio fields -> remote URL or 'missing'
    │   └── audioCache.ts       # Downloads remote audio into expo-file-system cache dir
    ├── components/             # Shared UI components
    │   ├── PhraseCard.tsx      # Azkar phrase card (carousel item)
    │   ├── ScreenHeader.tsx    # Shared chromeless header: back chevron, centered title, optional right action
    │   └── TasbihButton.tsx    # Circular tasbih counter button
    ├── config/
    │   └── config.ts           # App constants: audio baseUrl, font scale limits, interaction guards (ms)
    ├── dataset/
    │   └── azkar-sample.json   # Bundled azkar data (categories + phrases, Arabic text)
    ├── i18n/
    │   ├── ar.ts               # Arabic strings (source of truth for keys)
    │   └── index.ts            # t(key) lookup helper; add new languages here
    ├── mappers/
    │   └── azkarMapper.ts      # Maps raw JSON -> AzkarCategory/AzkarPhrase types, assigns category icons
    ├── navigation/
    │   └── RootNavigator.tsx   # Native stack navigator + RootStackParamList type
    ├── screens/
    │   ├── CategoriesScreen.tsx  # Home: category list, search, favourites sort, verse banner
    │   ├── CategoryScreen.tsx    # Zikr reader: phrase carousel, counters, shuffle, reset
    │   ├── FreeTasbihScreen.tsx  # Free-form tasbih counter
    │   └── SettingsScreen.tsx    # Theme, font scale, subtext, audio toggles
    ├── store/
    │   ├── index.ts            # createAppStore(), RootState, AppDispatch types
    │   ├── persistence.ts      # Listener middleware -> AsyncStorage; loadPersistedState()
    │   └── slices/             # One file per Redux slice (see State Management)
    ├── theme/
    │   └── azkarTheme.ts       # AzkarTheme type, 3 themes (light/solarized/dark), font constants
    ├── types/                  # .d.ts module declarations
    └── utils/
        ├── numberFormatting.ts # Arabic-Indic digit formatting
        ├── storage.ts          # AsyncStorage get/set/remove wrappers (JSON, typed fallback)
        └── useTimeGuardedCallback.ts # Debounce/guard hook for taps
```

## Architecture

### App Bootstrap (App.tsx)

1. Load fonts via `useFonts`.
2. `loadPersistedState()` reads AsyncStorage → `createAppStore(preloadedState)`.
3. Renders `GestureHandlerRootView > Redux Provider > SafeAreaProvider > RootNavigator`.

The store is created **once** at startup with preloaded persisted state; do not create additional stores.

### Navigation

Single native stack (`RootStackParamList`), headers hidden (`headerShown: false` — screens render custom headers):

- `Categories` (home) → `Category { categoryId: string }`, `Settings`, `FreeTasbih`

Non-home screens use the shared `ScreenHeader` component (chromeless: optional `leftAction` slot or back chevron, centered title, optional `rightAction` slot, and an optional `bottom` row that renders directly under the header); `PhraseCard` keeps its own custom header with the progress pill. The top safe-area strip is themed via `SafeAreaView` inside `RootNavigator` (matches `theme.bgColor`), not in `App.tsx`.

### State Management (Redux Toolkit)

Store shape (`src/store/index.ts`) — one slice per concern, all in `src/store/slices/`:

| Slice | Shape | Persisted | Purpose |
|---|---|---|---|
| `phases` | `{ value: AzkarPhrase[], shuffle, wasShuffled }` | only `shuffle` | Current category's phrases + shuffle mode |
| `indexCount` | `{ value, phasesLength, isLastPhrase }` | per-category (`azkar-index-{id}`) | Current phrase index within a category |
| `totalCount` | `{ value: number }` | yes | Lifetime tasbih tap count |
| `theme` | `{ value: AzkarThemeName, list }` | yes | light / solarized / dark |
| `fontScale` | `{ value: number }` | yes | Font size multiplier (0.6–2.0, step 0.1) |
| `subText` | `{ value: boolean }` | yes | Show/hide phrase subtext |
| `favouriteCategories` | `{ ids: number[] }` | yes | Favourited category IDs (sorted first on home) |
| `audio` | `{ autoPlayNext, audioEnabled }` | yes | Audio preferences |
| `playback` | `{ currentPhraseId, status, errorKey }` | no | Current audio playback state |

### Persistence Pattern

Persistence is **listener-middleware based** (`src/store/persistence.ts`):

- `listenerMiddleware.startListening` subscribes to specific action creators / matchers and writes the relevant slice value to AsyncStorage.
- `loadPersistedState()` reads all keys in parallel at startup and builds the preloaded `RootState`.
- Storage helpers in `src/utils/storage.ts` JSON-serialize values and take a typed fallback.

**Rule: when adding a persisted setting, you must wire it in three places:**
1. The slice (action + state).
2. A `listenerMiddleware.startListening` entry in `persistence.ts`.
3. `loadPersistedState()` (read with default + include in returned preloaded state).

Per-category phrase indices are stored directly via `setStoredValue('azkar-index-{categoryId}', n)` from `CategoryScreen`, not through the middleware.

### Theming

- Themes live in `AZKAR_THEME_MAP` (`src/theme/azkarTheme.ts`): `light`, `solarized`, `dark` (default: solarized).
- Access pattern in screens: `const themeName = useSelector((s: RootState) => s.theme.value); const theme = getAzkarTheme(themeName);`
- Palette direction per theme:
  - `light`: clean white/sand surfaces, emerald primary, relaxed shiny blue active accents.
  - `solarized`: warm sand backgrounds, deep emerald primary (`#2F5D50`), gold accent (`#BB9A4F`).
  - `dark`: matte black-blue surfaces, blue primary accents, comfortable low-saturation text.
- Theme tokens include gradient pairs for page background (`bgGradient`), verse/hadith banners (`verseGradient`), icon chips (`accentGradient`), and the Free Tasbih button (`tasbihGradient`), plus matching text/glow/shadow colors. Screens should use these tokens instead of hardcoded redesign colors so all three themes adapt consistently.
- Fonts: `AZKAR_PRIMARY_FONT`/`AZKAR_TITLE_FONT` use `ScheherazadeNew` (Regular-only face). Use `AZKAR_COUNTER_FONT` (`TajawalBold` = `Tajawal-ExtraBold.ttf`) for numeric counters, since `fontWeight` has no bold face to resolve against on the regular-only Scheherazade font.
- The redesign reference (`adhkar-redesign.html`) is the visual source of truth for ongoing UI work.

### Data Flow (Azkar Content)

```
src/dataset/azkar-sample.json
        │  (raw: [{ id, category, array: [{ id, text, count, subtext, audio?, filename? }] }])
        ▼
src/mappers/azkarMapper.ts   →  typed AzkarCategory[] (adds FontAwesome5 icon per category id)
        │
        ▼  azkar.find(cat.id === categoryId)
CategoryScreen: dispatch(setPhases(...)) → phases slice → carousel renders PhraseCard per phrase
```

Category icons are hardcoded in `CATEGORY_ICON_MAP` keyed by category id. New categories need a mapping entry (fallback: `albums-outline`).

### Audio

- Source of truth: `audio` / `filename` fields in the dataset (per-phrase or per-category `audioRef`).
- `audioSource.ts` resolves a phrase to `{ kind: 'remote', url, filename }` or `{ kind: 'missing' }`.
- `audioCache.ts` downloads remote MP3s to the Expo cache dir (`FileSystem.cacheDirectory + config.audio.cacheDir`) and reuses cached files.
- Base URL is configured in `config.audio.baseUrl`.

### Internationalization

- All UI strings in `src/i18n/ar.ts`; looked up with `t('key')` from `src/i18n/index.ts`.
- `TranslationKey` is derived from the `ar` object type — adding a key to `ar.ts` makes it available everywhere.

## Coding Conventions

- **TypeScript strict mode**; avoid `any` (warned in lint).
- **Functional components + hooks only.** Named exports for screens/components (`export function CategoriesScreen`).
- **Styles**: `StyleSheet.create` at the bottom of the file; theme colors applied inline via the `theme` object.
- **Formatting**: Prettier — single quotes, semicolons, `trailingComma: 'es5'`, `printWidth: 110`, 2-space tabs.
- **Lint**: ESLint flat config (`eslint.config.js`); `no-console` and `no-explicit-any` are warnings; `import/no-unresolved` disabled (Metro resolution).
- Run `npm run lint:fix` before considering work done.
- **Animated values**: keep them in `useMemo`, not `useRef` (lint-enforced past issue).
- Interaction debounce timings are centralized in `config.interaction` (counter/nav/long-press guards) — use `useTimeGuardedCallback` rather than ad-hoc timers.

## Workflow Notes

- `TODO.md` tracks pending/completed feature work — check it before starting a feature and update it when finishing one.
- The app must remain fully offline-capable: no new network dependencies for core content (remote audio is the only allowed exception, with local caching).
- When modifying structure, conventions, or workflows described here, update this AGENTS.md.
