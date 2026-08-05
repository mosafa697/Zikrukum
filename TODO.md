# TODO

## Pending Tasks

- [x] **Offline Support** — All data is bundled locally (JSON + fonts), no network calls exist; the app works fully in airplane mode.

- [x] **Internationalization (i18n)** — All Arabic UI strings extracted into `src/i18n/ar.ts`; a `t()` helper in `src/i18n/index.ts` serves lookups and is ready for additional language files.

- [x] **Settings Button on Home Screen** — Gear icon added to the `CategoriesScreen` navigation header via `useLayoutEffect`; tapping it navigates directly to Settings.

- [x] **Carousel Swipe Navigation** — Replaced the single-card swipe with a true carousel: prev/current/next phrases are rendered as three absolute-positioned cards sharing the same `translateX`, so adjacent phrases slide into view in real time as the user drags.

- [x] **Code Cleanup & Lint** — ESLint (`eslint-config-expo`) + Prettier configured; `npm run lint` / `npm run lint:fix` added; all errors resolved (including refactoring Animated values from `useRef` to `useMemo`); redundant JSX section comments removed across all screens.

- [ ] **First-Launch Onboarding** — Show a one-time walkthrough or intro screen on first app open to guide new users through the app's features and how to use them.
