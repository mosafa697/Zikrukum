# TODO

## Pending Tasks

- [x] **Offline Support** — All data is bundled locally (JSON + fonts), no network calls exist; the app works fully in airplane mode.

- [x] **Internationalization (i18n)** — All Arabic UI strings extracted into `src/i18n/ar.ts`; a `t()` helper in `src/i18n/index.ts` serves lookups and is ready for additional language files.

- [x] **Settings Button on Home Screen** — Gear icon added to the `CategoriesScreen` navigation header via `useLayoutEffect`; tapping it navigates directly to Settings.

- [x] **Carousel Swipe Navigation** — Replaced the single-card swipe with a true carousel: prev/current/next phrases are rendered as three absolute-positioned cards sharing the same `translateX`, so adjacent phrases slide into view in real time as the user drags.

- [x] **Code Cleanup & Lint** — ESLint (`eslint-config-expo`) + Prettier configured; `npm run lint` / `npm run lint:fix` added; all errors resolved (including refactoring Animated values from `useRef` to `useMemo`); redundant JSX section comments removed across all screens.

- [x] **Relocate Settings Button & Add Reset Progress** — Move the Settings gear icon from the zikr (CategoryScreen) header to the home (CategoriesScreen) header as a fixed button. Remove it from the zikr header and replace it with a "Reset" button (e.g. `refresh-outline` / `restart` icon) that resets the current zikr's progress back to zero.

- [x] **UI Redesign (all screens)** — Restyle all screens to match the reference design in [`adhkar-redesign.html`](adhkar-redesign.html): warm sand background (`#F4EEE0`), deep emerald primary (`#2F5D50`), gold accent (`#BB9A4F`), card surfaces (`#FBF7ED`), rounded category cards with icon chip + count pill, gradient verse banner on home, gold ring counter on the zikr screen, large circular tasbih button with breathing animation, and grouped settings cards. All 3 themes (light / solarized / dark) share the same visual structure with adapted colour palettes.

- [x] **Favourite Categories** — Add a favourite (star/heart) toggle button to each category card; persist favourited category IDs in the store, and sort the home screen list so favourited categories appear first in order, and replace it with count of zikr category number

- [x] **Seamless Navigation Header** — Remove the visible separator between the native header bar and the screen content: set `headerTransparent: true` (or match header background to `bgColor`), hide the bottom border/shadow, and blend the title/back-button tint into the page so the header feels like a natural part of each screen rather than a floating toolbar.

- [ ] **Audio Playback** — Add audio support for every zikr, using the existing `audio` / `filename` fields in the dataset as the source of truth.
	- Add a play button on the zikr screen near the main phrase controls so users can play the current zikr without leaving the page.
	- Add a new settings toggle for auto-playing the next zikr audio when the current one ends; default state should be `on` and it should be persisted in the store like the other preferences.
	- Decide the audio delivery strategy with app size as the priority: prefer remote audio URLs with local caching if it keeps the bundle smaller, and only bundle files offline when the UX or reliability requires it.
	- Define the missing-audio behavior clearly: disable or hide the play button when no audio exists, and show a lightweight fallback message or icon instead of failing silently.
	- Make the auto-play-next flow respect navigation and end-of-list boundaries, so it only advances when a next zikr exists and the user has not disabled the feature.

- [x] **New Category: سنن يوم الجمعة** — Add a new category named `سنن يوم الجمعة` and include its data in the dataset so it appears alongside the other zikr categories.

- [ ] **Notifications** — Add a notification feature that reminds the user twice every day, once in the morning and once in the evening, and also sends a weekly Friday reminder for the `اذكار يوم الجمعة` category. Add the notification customization options to the settings page so the user can enable, disable, and adjust the reminder behavior.

- [ ] **First-Launch Onboarding** — Show a one-time walkthrough or intro screen on first app open to guide new users through the app's features and how to use them.

- [x] **Back Button Consistency Across Screens** — Add a back button to all applicable screens and align the header layout so the screen title stays visually centered alongside the back button.

- [x] **Add Hadith on Home Screen** — Display a hadith section on the home screen directly below the ayah block, following the same visual style as the existing home content.

- [x] **Refactor Free Tasbih Layout** — Center the Free Tasbih screen title and keep the counter fixed in a stable on-screen position so it does not shift with other content, and remove the centered word "سبح" and put the number inside the circle, and follow the themes styles.

- [x] fix the theme in home page

- [x] switch the numbers format to be english not hindi

- [x] enhance the color palette of each theme to be look suitable and harmonic:
	- for light theme: use whity and shine color to highlight the text and contrast the borders, hint could use here white and relaxed shiny blue.
	- for solarized theme: use aye comfortable colors, hint could use color here the suitable degree of dark green and gold colors.
	- for dark theme: use dark, matte and aye comfortable colors, hint could be between black and blue

- [x] replace the back button icon to be look at the other side (left)

- [ ] fix refreshment zikr when sliding right or left on mobile screens, i thin it reload the previous zikr for milliseconds and then load the wanted zikr, we dont need to have this trembling  

- [ ] center the category of "مسبحة حرة" at the categories page as the text is little bit to right as it has not contained the favorite icon