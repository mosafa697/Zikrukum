# TODO

## Pending Tasks

- [x] **Offline Support** — All data is bundled locally (JSON + fonts), no network calls exist; the app works fully in airplane mode.

- [x] **Internationalization (i18n)** — All Arabic UI strings extracted into `src/i18n/ar.ts`; a `t()` helper in `src/i18n/index.ts` serves lookups and is ready for additional language files.

- [x] **Settings Button on Home Screen** — Gear icon added to the `CategoriesScreen` navigation header via `useLayoutEffect`; tapping it navigates directly to Settings.

- [x] **Carousel Swipe Navigation** — Replaced the single-card swipe with a true carousel: prev/current/next phrases are rendered as three absolute-positioned cards sharing the same `translateX`, so adjacent phrases slide into view in real time as the user drags.

- [x] **Code Cleanup & Lint** — ESLint (`eslint-config-expo`) + Prettier configured; `npm run lint` / `npm run lint:fix` added; all errors resolved (including refactoring Animated values from `useRef` to `useMemo`); redundant JSX section comments removed across all screens.

- [x] **Relocate Settings Button & Add Reset Progress** — Move the Settings gear icon from the zikr (CategoryScreen) header to the home (CategoriesScreen) header as a fixed button. Remove it from the zikr header and replace it with a "Reset" button (e.g. `refresh-outline` / `restart` icon) that resets the current zikr's progress back to zero.

- [ ] **UI Redesign (all screens)** — Restyle all screens to match the reference design in [`adhkar-redesign.html`](adhkar-redesign.html): warm sand background (`#F4EEE0`), deep emerald primary (`#2F5D50`), gold accent (`#BB9A4F`), card surfaces (`#FBF7ED`), rounded category cards with icon chip + count pill, gradient verse banner on home, gold ring counter on the zikr screen, large circular tasbih button with breathing animation, and grouped settings cards. All 3 themes (light / solarized / dark) share the same visual structure with adapted colour palettes.

- [x] **Favourite Categories** — Add a favourite (star/heart) toggle button to each category card; persist favourited category IDs in the store, and sort the home screen list so favourited categories appear first in order, and replace it with count of zikr category number

- [x] **Seamless Navigation Header** — Remove the visible separator between the native header bar and the screen content: set `headerTransparent: true` (or match header background to `bgColor`), hide the bottom border/shadow, and blend the title/back-button tint into the page so the header feels like a natural part of each screen rather than a floating toolbar.

- [ ] **Complete Media Audio Playback** — Finish and verify audio playback using the dataset `audio` / `filename` fields as the source of truth.
	- [x] Add `expo-audio` playback with remote MP3 loading and local cache support.
	- [x] Add the Settings controls for enabling audio and auto-playing the next zikr; persist both preferences.
	- [x] Add play/pause, loading, replay-after-finish, and player cleanup behavior.
	- [x] Make auto-play-next stop at the final phrase and replace the current player before starting the next phrase.
	- [x] Handle navigation and loading races so stale downloads cannot attach to another phrase or block future playback.
	- [x] Normalize empty audio metadata and support phrase-level/category-level source fallback.
	- [x] Show separate themed feedback for missing audio (`noAudio`) and playback errors (`audioError`), with retry support.
	- [ ] Choose a production audio host. Use Cloudflare R2, Supabase Storage, Firebase Storage, S3/CloudFront, or a managed VPS. Do not use Google Drive public links for production playback.
	- [ ] Replace `config.audio.baseUrl` (`https://zikr-audio.example.com/`) with the real HTTPS audio URL.
	- [ ] Upload the MP3 files using paths compatible with the resolver, such as `audio/248.mp3`, and verify every referenced URL returns `200` with `Content-Type: audio/mpeg` and byte-range support.
	- [ ] Configure CORS for Expo Web and configure CDN caching for public audio files.
	- [ ] Decide whether playback must continue while the app is backgrounded or the screen is locked. If required, configure the Expo Audio session, background playback, Android media notifications, and iOS background audio mode.
	- [ ] Test Android, iOS, and Web: first play, pause/resume, replay, offline cached play, network failure, retry, phrase navigation during download, auto-play-next, final phrase, and missing audio.
	- [ ] Future data task: add or intentionally approve missing audio entries in the dataset, including categories `1`, `21`, and `122` and any phrases with empty audio fields.

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

- [ ] fix refrechment zikr when sliding right or left on mobile screens

- [ ] replace the back button icon to be look at the other side (left)

- [ ] center the word of "مسبحة حرة" at the categories page
