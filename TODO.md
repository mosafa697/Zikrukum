# TODO

## Pending Tasks

- [x] **Offline Support** — All data is bundled locally (JSON + fonts), no network calls exist; the app works fully in airplane mode.

- [x] **Internationalization (i18n)** — All Arabic UI strings extracted into `src/i18n/ar.ts`; a `t()` helper in `src/i18n/index.ts` serves lookups and is ready for additional language files.

- [x] **Settings Button on Home Screen** — Gear icon added to the `CategoriesScreen` navigation header via `useLayoutEffect`; tapping it navigates directly to Settings.

- [x] **Phrase Pager Swipe Navigation (Refactored)** — Replaced the buggy 3-card `PanGestureHandler`/`Animated` carousel (which flickered: it animated cards then swapped content underneath, and `useNativeDriver` was off) with a virtualized horizontal `FlatList` pager — one page per phrase, `pagingEnabled`, pages sized to the phrase area, vertical scroll per page for long text. RTL swipe direction (swipe right = next) is guaranteed on iOS/Android (native `forceRTL`) and web (`scaleX: -1` mirror); bidirectional Redux ↔ pager index sync via `expectedIndexRef` covers reset, counter-complete, audio auto-advance and saved-index restore without loops or flicker.

- [x] **Code Cleanup & Lint** — ESLint (`eslint-config-expo`) + Prettier configured; `npm run lint` / `npm run lint:fix` added; all errors resolved (including refactoring Animated values from `useRef` to `useMemo`); redundant JSX section comments removed across all screens.

- [x] **Relocate Settings Button & Add Reset Progress** — Move the Settings gear icon from the zikr (CategoryScreen) header to the home (CategoriesScreen) header as a fixed button. Remove it from the zikr header and replace it with a "Reset" button (e.g. `refresh-outline` / `restart` icon) that resets the current zikr's progress back to zero.

- [x] **UI Redesign (all screens)** — Restyle all screens to match the reference design in [`adhkar-redesign.html`](adhkar-redesign.html): warm sand background (`#F4EEE0`), deep emerald primary (`#2F5D50`), gold accent (`#BB9A4F`), card surfaces (`#FBF7ED`), rounded category cards with icon chip + count pill, gradient verse banner on home, gold ring counter on the zikr screen, large circular tasbih button with breathing animation, and grouped settings cards. All 3 themes (light / solarized / dark) share the same visual structure with adapted colour palettes.

- [x] **Favourite Categories** — Add a favourite (star/heart) toggle button to each category card; persist favourited category IDs in the store, and sort the home screen list so favourited categories appear first in order, and replace it with count of zikr category number

- [x] **Seamless Navigation Header** — Remove the visible separator between the native header bar and the screen content: set `headerTransparent: true` (or match header background to `bgColor`), hide the bottom border/shadow, and blend the title/back-button tint into the page so the header feels like a natural part of each screen rather than a floating toolbar.

- [ ] **Complete Media Audio Playback** — Finish and verify audio playback using the dataset `audio` / `filename` fields as the source of truth, with all audio clips bundled locally inside the app (no remote CDN).
	- [x] Add `expo-audio` playback, originally with remote MP3 loading and local cache support.
	- [x] Add the Settings controls for enabling audio and auto-playing the next zikr; persist both preferences.
	- [x] Add play/pause, loading, replay-after-finish, and player cleanup behavior.
	- [x] Make auto-play-next stop at the final phrase and replace the current player before starting the next phrase.
	- [x] Handle navigation and loading races so stale operations cannot attach to another phrase or block future playback.
	- [x] Normalize empty audio metadata and support phrase-level/category-level source fallback.
	- [x] Show separate themed feedback for missing audio (`noAudio`) and playback errors (`audioError`), with retry support.
	- [x] Refactor `src/audio/audioSource.ts` to resolve audio to `{ kind: 'local'; filename: string } | { kind: 'missing' }` instead of remote URLs.
	- [x] ~~Refactor `src/audio/audioCache.ts` into a legacy-cache cleanup helper; remove remote download / `expo-file-system` cache logic.~~ Removed: legacy cache cleanup no longer needed.
	- [x] Create `src/audio/audioAssets.ts` with a static `Record<filename, require(...)>` resolver for bundled MP3 URIs via `expo-asset`.
	- [x] Update `src/audio/useZikrAudio.ts` to load the local asset URI directly into `createAudioPlayer`, dropping network fetch paths.
	- [x] Update `src/config/config.ts` to remove the placeholder CDN `baseUrl` / `cacheDir` and document the local asset path convention.
	- [x] Redesign the zikr reader audio player to match the reference image: play/pause/finished/loading/missing states, progress bar with current/total time, and placement between the zikr text and source info.
	- [x] Track playback `currentTime` / `duration` in the `playback` slice and poll while playing for a live progress bar.
	- [x] Hide the audio player entirely when audio is disabled in Settings or the current phrase has no audio file (`missing`).
	- [x] ~~Add a one-time cache/migration helper to clear any legacy remote-download audio cache from `expo-file-system` so old cached MP3s do not conflict with local assets.~~ Removed along with `src/audio/audioCache.ts`.
	- [x] Clear old audio/filename data from `src/dataset/azkar-sample.json` so the app reports missing audio until new clips are available.
	- [ ] When new audio data is available: collect the MP3 clips, place them under `assets/audio/`, populate `src/audio/audioAssets.ts`, and fill the `audio` / `filename` fields in `src/dataset/azkar-sample.json`.
	- [ ] Decide whether playback must continue while the app is backgrounded or the screen is locked. If required, configure the Expo Audio session, background playback, Android media notifications, and iOS background audio mode.
	- [ ] Test Android, iOS, and Web: first play, pause/resume, replay, phrase navigation, auto-play-next, final phrase, and missing audio.
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

- [x] replace the back button icon to be look at the other side (left)

- [x] fix refreshment zikr when sliding right or left on mobile — the flicker (previous zikr reloading for a few milliseconds) came from the old carousel swapping phrases underneath the animated transform; the `FlatList` pager transitions natively with no content swap, so it is flicker-free.  

- [ ] center the category of "مسبحة حرة" at the categories page
 as the text is little bit to right as it has not contained the favorite icon