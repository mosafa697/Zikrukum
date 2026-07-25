# React Native Migration Overview

## Goal

Rewrite the current Create React App PWA into a React Native application that can be published to Google Play, while keeping the current web app in this repository.

## Primary Decision

Use Expo for the native app.

Reasoning:

- Faster Android setup and delivery than bare React Native CLI.
- Easier asset, splash, icon, and build configuration.
- Better path to Android App Bundle generation with EAS.
- Lower migration friction for a small-to-medium app without native custom modules.

## Repository Strategy

Keep the existing web application at the repository root. Add the native app in a subdirectory.

Recommended layout:

```text
azkar/
├── docs/
├── native/
│   ├── app.json
│   ├── package.json
│   ├── assets/
│   └── src/
├── public/
├── src/
└── package.json
```

Why this layout:

- It is simpler than a multi-package workspace.
- It avoids Windows symlink problems.
- It keeps native delivery isolated from the web build.
- It allows future extraction of shared logic if native parity succeeds.

## Phase One Scope

Included:

- Android app with Expo
- Categories screen
- Category detail screen
- Settings screen
- Free tasbih screen
- Redux state management
- AsyncStorage persistence
- Arabic font setup
- Swipe navigation
- Long-press copy
- Theme switching
- Font scaling
- Offline-ready bundled dataset
- Play Store release preparation

Excluded:

- iOS release
- Cloud sync
- Login/accounts
- Push notifications
- Analytics
- Replacing the current web app build system

## Current Feature Inventory To Preserve

The native rewrite should preserve the existing behavior implemented in the current web app.

### Core reading flow

- Category selection
- Category resume by saved phrase index
- Phrase repetition counting
- Auto-advance after the phrase count is reached
- Previous and next phrase navigation
- Remaining count display
- Progress indication inside the selected category

### Interaction behavior

- Tap throttling for counters and navigation
- Swipe between phrases
- Long-press copy of phrase text
- Smooth transition feedback during navigation

### User settings

- Theme selection
- Shuffle mode
- Show or hide subtext
- Font scaling
- Total count persistence and reset

### Utility behavior

- Offline availability of bundled azkar data
- Safe persistence behavior
- Arabic-friendly typography

## Migration Mapping

### App shell

- Web router: `react-router-dom`
- Native replacement: `@react-navigation/native`

### Persistence

- Web storage: `localStorage` and `sessionStorage`
- Native replacement: `@react-native-async-storage/async-storage`

### Gesture handling

- Web swipe: `react-swipeable`
- Native replacement: `react-native-gesture-handler`

### Clipboard

- Web clipboard: `navigator.clipboard`
- Native replacement: `@react-native-clipboard/clipboard`

### Styling

- Web styling: CSS, Tailwind-style classes, CSS variables
- Native replacement: React Native `StyleSheet` plus a theme token map

### Offline support

- Web offline: service worker
- Native equivalent: bundled assets and persisted user state

## Feature Parity Priorities

### Priority 1

- Category list
- Category phrase flow
- Counter logic
- Persistence
- Settings

### Priority 2

- Swipe animation polish
- Visual parity for theme treatment
- Font calibration on Android devices

### Priority 3

- Architecture cleanup after parity
- Selective sharing of pure JS logic between web and native

## Recommended Native Dependencies

```json
{
  "expo": "latest compatible",
  "react-native": "expo-managed",
  "@react-navigation/native": "latest compatible",
  "@react-navigation/native-stack": "latest compatible",
  "@react-native-async-storage/async-storage": "latest compatible",
  "react-native-gesture-handler": "latest compatible",
  "react-native-safe-area-context": "latest compatible",
  "react-native-screens": "latest compatible",
  "@react-native-clipboard/clipboard": "latest compatible",
  "react-redux": "latest compatible",
  "@reduxjs/toolkit": "latest compatible"
}
```

## Risks To Watch Early

### Arabic font rendering

The current UI depends on Arabic readability and large type. Native text metrics will differ from CSS `dvh`-based sizing, so font scale values need recalibration.

### Gesture feel

The swipe behavior from the current web app should be prototyped early to tune thresholds and animation timing on Android.

### Persistence hydration

The web app mixes global settings and per-category progress. Native hydration should be explicit and predictable to avoid incorrect resume behavior.

## Delivery Milestones

1. [x] Native project bootstrapped and runnable on Android (scaffolded in the migration folder with Expo-compatible structure and dependencies).
2. [x] Navigation and Redux wired (initial stack navigator and Redux store scaffold added).
3. [ ] Category reading flow working with persisted progress.
4. [ ] Settings and free tasbih migrated.
5. [ ] Typography, themes, and gestures polished.
6. [ ] Play Store release candidate built as `.aab`.

## Definition Of Done For Phase One

The migration is ready for Android release when:

- The native app covers the same main user flows as the web app.
- Settings and progress persist across app restarts.
- Arabic text renders correctly on Android.
- Offline launch works without network dependency.
- A signed Android App Bundle can be generated.
- Play Store listing assets and release metadata are prepared.