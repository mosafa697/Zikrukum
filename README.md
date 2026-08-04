# Zikrukum

React Native migration of the Azkar app using Expo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- Android Studio (for Android emulator) or Xcode (for iOS simulator)
- For physical device: [Expo Go](https://expo.dev/client) app

## Setup

```bash
npm install
```

## Running

| Command | Description |
|---|---|
| `npm start` | Start Metro bundler (scan QR with Expo Go) |
| `npm run android` | Run on Android emulator or connected device |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run web` | Run in browser |

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
