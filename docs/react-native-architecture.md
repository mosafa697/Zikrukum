# React Native Architecture

## Architecture Goal

Create a native app that preserves current behavior without forcing early cross-platform abstraction. Use a screen-first React Native structure and only reuse pure logic where it is clearly safe.

## Proposed Folder Structure

```text
native/
├── app.json
├── babel.config.js
├── package.json
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── data/
│   ├── navigation/
│   ├── screens/
│   ├── store/
│   ├── theme/
│   └── utils/
└── App.tsx
```

## Screen Mapping

Current web routes and components should map into native screens.

| Current behavior | Current source | Native target |
|---|---|---|
| Category list | `src/components/Categories.js` | `src/screens/CategoriesScreen.tsx` |
| Category reading view | `src/components/CategoryAzkar.js` | `src/screens/CategoryScreen.tsx` |
| Settings | `src/components/SettingsPage.js` | `src/screens/SettingsScreen.tsx` |
| Free tasbih | `src/components/FreeTasbih.js` | `src/screens/FreeTasbihScreen.tsx` |

## Component Mapping

| Current web component | Native target | Notes |
|---|---|---|
| `ZekrCard.js` | `PhraseCard.tsx` | Rebuild with native layout and gesture support |
| `ZekrCounter.js` | `PhraseCounter.tsx` | Preserve throttled interactions |
| `SubPhase.js` | `SubPhrase.tsx` | Conditional auxiliary text |
| `ContactMe.js` | `ContactSection.tsx` | Optional in phase one |

## State Management Strategy

Keep Redux Toolkit in native. The state model already fits the app well.

Native store shape should preserve these concerns:

- `phases`
- `indexCount`
- `totalCount`
- `theme`
- `fontScale`
- `subText`

### Source references

- `src/store/store.js`
- `src/store/phasesSlice.js`
- `src/store/indexCountSlice.js`
- `src/store/totalCountSlice.js`
- `src/store/themeSlice.js`
- `src/store/fontScaleSlice.js`
- `src/store/subTextSlice.js`

## Persistence Strategy

Replace browser storage with an AsyncStorage service.

### Current web storage model

- Global settings stored in `localStorage`
- Per-category current phrase stored in `sessionStorage`

### Native storage model

- Store all persisted data in AsyncStorage
- Keep the current key semantics where useful
- Hydrate state on app startup before the main UI depends on it

### Recommended keys

- `theme`
- `fontScale`
- `showSubText`
- `shufflePhases`
- `azkarTotalCount`
- `azkar-index-{categoryId}`

### Hydration rule

Use a single startup flow:

1. Load persisted settings.
2. Initialize Redux with restored values.
3. Load dataset.
4. Render the app shell.

Do not mix lazy reads from storage across many components unless necessary.

## Data Strategy

Use the existing static dataset for phase one.

### Source references

- `src/dataset/azkar-sample.json`
- `src/mappers/azkarMapper.js`

### Native approach

- Copy the dataset into the native app under `src/data/` or `assets/`
- Port or reuse the mapper if it stays pure
- Treat the bundled JSON as the source of truth for the first release

## Navigation Strategy

Use a native stack navigator.

Recommended stack:

- `Categories`
- `Category`
- `Settings`
- `FreeTasbih`

### Navigation notes

- The current special route for free tasbih should remain a first-class screen.
- Back navigation should reset category screen state consistently.
- Params should include `categoryId` for category reading screens.

## Gesture And Interaction Strategy

### Swipe navigation

Replace `react-swipeable` with `react-native-gesture-handler`.

Native behavior to preserve:

- Swipe left or right between phrases
- Visual feedback during swipe
- Threshold before navigation action fires

### Long press copy

Replace browser clipboard handling with native clipboard support.

Native behavior to preserve:

- Hold on phrase text
- Copy phrase text
- Prevent accidental tap action immediately after long press

### Tap guards

Preserve the guarded tap behavior from `src/utils/useTimeGuardedCallback.js`.

## Theme Strategy

Do not replicate CSS class switching. Use theme objects.

### Recommended theme design

`src/theme/themes.ts`

- `light`
- `dark`
- `solarized`

Each theme should define:

- background colors
- card colors
- text colors
- icon colors
- border colors
- accent colors
- progress colors

Use the Redux `theme` slice as the active theme source.

## Typography Strategy

The current web app uses Arabic-oriented font styling and large display text. Native should preserve the same intent, not the same raw values.

### Rules

- Register the Arabic font inside native assets.
- Calibrate line height and font size on Android.
- Keep the existing conceptual scale range, but retune actual values.
- Validate readability on smaller Android devices.

## Offline Strategy

The native app does not need a service worker.

Phase one offline rules:

- Bundle the dataset with the app.
- Persist settings and progress in AsyncStorage.
- Ensure cold start works without internet.

## Testing Strategy

### Required manual checks

- Category selection
- Category resume
- Phrase count advancement
- Previous and next phrase navigation
- Swipe navigation
- Long-press copy
- Theme switching
- Shuffle behavior
- Subtext toggle
- Free tasbih interaction
- App restart persistence
- Offline launch

### Recommended automated coverage later

- Slice unit tests
- Storage utility tests
- Basic screen interaction tests

## Architecture Constraints

- Do not refactor the web app during the native migration.
- Do not introduce a shared package in phase one unless duplication becomes harmful.
- Keep native-specific code inside the `native/` subtree.
- Reuse only pure data and logic modules that do not depend on DOM APIs.