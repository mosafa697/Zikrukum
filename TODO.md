# TODO

## Pending Tasks

- [x] **Offline Support** — All data is bundled locally (JSON + fonts), no network calls exist; the app works fully in airplane mode.

- [x] **Internationalization (i18n)** — All Arabic UI strings extracted into `src/i18n/ar.ts`; a `t()` helper in `src/i18n/index.ts` serves lookups and is ready for additional language files.

- [x] **Settings Button on Home Screen** — Gear icon added to the `CategoriesScreen` navigation header via `useLayoutEffect`; tapping it navigates directly to Settings.

- [x] **Carousel Swipe Navigation** — Replaced the single-card swipe with a true carousel: prev/current/next phrases are rendered as three absolute-positioned cards sharing the same `translateX`, so adjacent phrases slide into view in real time as the user drags.

- [x] **Code Cleanup & Lint** — ESLint (`eslint-config-expo`) + Prettier configured; `npm run lint` / `npm run lint:fix` added; all errors resolved (including refactoring Animated values from `useRef` to `useMemo`); redundant JSX section comments removed across all screens.

- [x] **Relocate Settings Button & Add Reset Progress** — Move the Settings gear icon from the zikr (CategoryScreen) header to the home (CategoriesScreen) header as a fixed button. Remove it from the zikr header and replace it with a "Reset" button (e.g. `refresh-outline` / `restart` icon) that resets the current zikr's progress back to zero.

- [ ] **UI Redesign (all screens)** — Restyle all screens to match the reference design in [`adhkar-redesign.html`](adhkar-redesign.html): warm sand background (`#F4EEE0`), deep emerald primary (`#2F5D50`), gold accent (`#BB9A4F`), card surfaces (`#FBF7ED`), Amiri font for dhikr text, Tajawal for UI elements, rounded category cards with icon chip + count pill, gradient verse banner on home, gold conic-gradient counter ring with breathing glow animation on the zikr screen, large circular tasbih button with radial gradient, and grouped settings cards.

- [ ] **Favourite Categories** — Add a favourite (star/heart) toggle button to each category card; persist favourited category IDs in the store, and sort the home screen list so favourited categories appear first in order.

- [ ] **First-Launch Onboarding** — Show a one-time walkthrough or intro screen on first app open to guide new users through the app's features and how to use them.
