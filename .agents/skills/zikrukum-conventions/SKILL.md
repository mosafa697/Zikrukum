---
name: zikrukum-conventions
description: Zikrukum Expo app overview, architecture, and coding conventions. Use for any feature, fix, or refactor to follow stack, navigation, and style rules.
---

## What I do
- Summarize Zikrukum conventions so changes match the existing codebase.
- Point to the source-of-truth files for bootstrap, navigation, state, theming, and data flow.

## When to use me
Use when starting any Zikrukum task, reviewing a diff, or when unsure where code belongs.

## Project facts
- Stack: React Native 0.81 + Expo ~54, TypeScript strict, Redux Toolkit 2.x, React Navigation native-stack, AsyncStorage, expo-audio + expo-file-system + expo-asset, expo-keep-awake, react-native-volume-manager, expo-font, expo-localization.
- Offline-first: all content bundled locally (`src/dataset/azkar-sample.json` + fonts + `assets/audio/` clips). No new network dependencies for core content.
- Entry: `App.tsx` loads fonts via `useFonts`, calls `loadPersistedState()`, creates store once via `createAppStore(preloadedState)`, renders `GestureHandlerRootView > Provider > SafeAreaProvider > RootNavigator`. Do not create additional stores.
- Navigation: single native stack in `src/navigation/RootNavigator.tsx` (`Categories`, `Category { categoryId }`, `Settings`, `FreeTasbih`), `headerShown: false`. Non-home screens use shared `ScreenHeader`; `PhraseCard` keeps its own header with progress pill. Top safe-area strip is themed in `RootNavigator`, not `App.tsx`.
- Data flow: `azkar-sample.json` -> `src/mappers/azkarMapper.ts` -> typed `AzkarCategory[]` -> `CategoryScreen` dispatches `setPhases` -> `PhraseCard` FlatList pager.
- `TODO.md` tracks feature work — check it before starting, update it when finishing. The built screens + `AZKAR_THEME_MAP` palettes are the visual source of truth (the old `adhkar-redesign.html` reference was removed from the repo).

## Coding conventions
- Functional components + hooks only. Named exports for screens/components (`export function CategoriesScreen`).
- TypeScript strict; avoid `any` (lint warns).
- Styles: `StyleSheet.create` at bottom of file; theme colors applied inline via `theme` object, never hardcoded redesign colors.
- Prettier: single quotes, semicolons, `trailingComma: es5`, `printWidth: 110`, 2-space tabs.
- ESLint flat config (`eslint-config-expo`); `no-console` and `no-explicit-any` are warnings; `import/no-unresolved` disabled.
- Animated values: keep in `useMemo`, not `useRef`.
- Interaction debounce: use `useTimeGuardedCallback` + timings in `src/config/config.ts` (`config.interaction`), not ad-hoc timers.
- UI strings: add keys to `src/i18n/ar.ts`, look up with `t('key')` from `src/i18n/index.ts`.
- When modifying structure, conventions, or workflows, update `AGENTS.md`.
