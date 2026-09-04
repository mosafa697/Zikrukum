# Zikrukum

React Native migration of the Azkar app using Expo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- For physical device: a custom dev build (`npx expo run:android` / `npx expo run:ios`) — plain Expo Go is not enough, since `react-native-volume-manager` (hardware volume keys) requires native code.

## Setup

```bash
npm install
```

## Running

| Command | Description |
|---|---|
| `npm start` | Start Metro bundler |
| `npm run android` | Run on Android emulator or connected device |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run web` | Run in browser |

## Checks

```bash
npm run lint       # ESLint check
npm run lint:fix   # ESLint --fix + Prettier write
npx tsc --noEmit   # TypeScript strict check
```

The app is fully offline-capable: azkar content, fonts, and audio clips are all bundled locally (see `AGENTS.md`).

## Building for release

### Android APK / AAB (via EAS Build)

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

Or for a local build (requires Android Studio):

```bash
npx expo run:android --variant release
```

The signed AAB will be under `android/app/build/outputs/bundle/release/`.

### iOS (macOS only)

```bash
eas build --platform ios
```
