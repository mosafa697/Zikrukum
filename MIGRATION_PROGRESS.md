# Zikrukum Migration Progress

Porting azkar React web app components to Zikrukum React Native app.

## Legend
- [x] Done  — [ ] Pending

---

## Phase 1 — Architecture Refactor *(required before all other phases)*

- [x] Port `useTimeGuardedCallback` to `src/utils/useTimeGuardedCallback.ts`
- [x] Add `GestureHandlerRootView` wrapper in `App.tsx` (required for Phase 2 swipe)
- [x] Refactor `CategoryScreen` as phrase orchestrator (mirrors `CategoryAzkar.js`):
  - [x] Manage `clicks: number[]` — per-phrase tap counter array
  - [x] Restore / persist per-category phrase index via AsyncStorage (`azkar-index-${categoryId}`)
  - [x] Trigger `shufflePhases` when `shuffle` is on and `wasShuffled` is false
  - [x] Keep `isLastPhrase` in sync on index / length change
  - [x] Home button clears saved index and navigates to Categories
  - [x] Cleanup on unmount resets store (covers native back gesture path)
- [x] Refactor `PhraseCard` as presentational component (mirrors `ZekrCard.js`):
  - [x] Accept `counter`, `onPhraseClick`, `isAnimating`, `onBack`, `categoryName` as props
  - [x] Remove internal counter state — pure display driven by props
  - [x] Font scale `+` / `−` buttons in header (Ionicons)
  - [x] Settings icon → navigate to Settings screen
  - [x] Home icon → call `onBack`
  - [x] Chevron nav buttons (Ionicons) for previous / next phrase
  - [x] Circular counter button with remaining count
  - [x] Long-press copies phrase text to clipboard
  - [x] SubText conditional display with divider
  - [x] `useTimeGuardedCallback` on counter press (mirrors ZekrCounter guard)

---

## Phase 2 — Swipe Navigation

- [x] Wrap phrase content with `PanGestureHandler` + `Animated.Value` in `PhraseCard`
  - [x] Constants: `SWIPE_THRESHOLD=50`, `SWIPE_DAMPENING=0.5`, `SWIPE_ANIMATION_DURATION=200ms`
  - [x] Swipe right → `incrementIndex` (RTL: next phrase)
  - [x] Swipe left  → `decrementIndex` (RTL: previous phrase)
  - [x] Animate card off-screen then reset `translateX`
  - [x] `activeOffsetX={[-5, 5]}` + `failOffsetY={[-20, 20]}` prevents accidental activation

---

## Phase 3 — Icons & Visual Parity

- [x] `PhraseCard`: Ionicons for nav, font, settings, home *(done in Phase 1)*
- [x] `SettingsScreen`: colored circle theme picker (replace text labels with visual circles)
- [x] `SettingsScreen`: `shuffle` / `list-outline` icons on shuffle toggle row
- [x] `SettingsScreen`: `eye-outline` / `eye-off-outline` icons on subtext toggle row
- [x] `SettingsScreen`: `trash-outline` icon on total count reset button

---

## Phase 4 — Screen Completion

### CategoriesScreen
- [x] Add Quran verse block (RTL Arabic, bold highlight)
- [x] Add Hadith text block
- [x] `TextInput` search field — filters categories by title live
- [x] Move Free Tasbih entry as first item in category list

### SettingsScreen
- [x] Colored circle View + border-highlight for selected theme (replaces text options)
- [x] `Alert.alert` confirm/cancel dialog for total count reset
- [x] Shuffle icon and subtext eye icon on toggle rows
- [x] Add `ContactMe` section at bottom

### FreeTasbihScreen
- [x] Wire `useTimeGuardedCallback` for tap guard (`freeTasbihTapGuardMs`)
- [x] Add local reset button (trash icon) accessible from the UI

---

## Phase 5 — AsyncStorage Persistence

- [x] `src/store/persistence.ts` — new file; `loadPersistedState()` reads all keys; `listenerMiddleware` writes on relevant actions
- [x] Load all persisted values as `preloadedState` in `App.tsx` before rendering `Provider`
- [x] `themeSlice`: save on `setTheme`, load on init
- [x] `totalCountSlice`: save on `incrementTotalCount` / `setTotalCount` / `resetTotalCount`, load on init
- [x] `phasesSlice`: save shuffle on `toggleShuffle`, load on init
- [x] `fontScaleSlice`: save on `incrementFontScale` / `decrementFontScale` / `setFontScale`, load on init
- [x] `subTextSlice`: save on `toggleAppearance`, load on init

---

## Verification Checklist

- [ ] All 4 routes navigate without crash
- [ ] Counter increments per phrase; auto-advances at full count (300 ms delay)
- [ ] Back (home button) clears stored index and navigates to Categories
- [ ] Native back gesture resets store but preserves stored index (resume on re-entry)
- [ ] Swipe left / right navigates phrases with animation *(Phase 2)*
- [ ] Kill + reopen: theme, font scale, shuffle, subText persist *(Phase 5)*
- [ ] Search filters category list live
- [ ] Long-press on phrase copies text to clipboard
- [ ] Font `+` / `−` buttons change text size visually

---

## Reference Map  (Web → RN)

| Web | RN |
|---|---|
| `src/components/CategoryAzkar.js` | `Zikrukum/src/screens/CategoryScreen.tsx` |
| `src/components/ZekrCard.js` | `Zikrukum/src/components/PhraseCard.tsx` |
| `src/components/ZekrCounter.js` | Counter button inside `PhraseCard.tsx` |
| `src/components/SubPhase.js` | Inline in `PhraseCard.tsx` |
| `src/components/Categories.js` | `Zikrukum/src/screens/CategoriesScreen.tsx` |
| `src/components/SettingsPage.js` | `Zikrukum/src/screens/SettingsScreen.tsx` |
| `src/components/FreeTasbih.js` | `Zikrukum/src/screens/FreeTasbihScreen.tsx` |
| `src/utils/useTimeGuardedCallback.js` | `Zikrukum/src/utils/useTimeGuardedCallback.ts` |
