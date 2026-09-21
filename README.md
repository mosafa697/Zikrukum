# Zikrukum

Zikrukum is a free, simple mobile app for reading the daily Azkar — the traditional Islamic remembrances (dhikr) recited in the morning, evening, before sleep, and throughout the day. It is designed to feel calm and comfortable to read: clear Arabic text with full vowel marks (tashkeel), adjustable font size, and optional audio recitation.

Everything the app needs — the text, the fonts, and the audio — is stored inside the app itself. That means it works with **no internet connection**, there are **no accounts**, and **nothing you do is sent anywhere**. Your reading progress and settings stay on your own phone.

---

## What you can do with the app

- **Browse collections of azkar** — the home screen lists all collections (morning, evening, and many more). You can search by name and mark your favourites so they always appear first.
- **Read comfortably** — each remembrance is shown in clear Arabic with full vowel marks. If the text is too small or too big, change the font size in Settings — the app remembers your choice.
- **Tap to count** — every remembrance has its own counter. Tap the card (or the counter) the required number of times, and the app automatically moves you to the next one when you finish. Made a mistake? Use the reset button to start the collection over.
- **Listen to the recitation** — many remembrances include a recorded recitation. Press play and listen, with playback speed control, or let the app play one remembrance after another. All recordings work offline.
- **Never miss your azkar** — set daily reminders for the morning and evening azkar, and a special reminder for the Friday azkar. The app sends a gentle notification at your chosen times.
- **Keep track of your progress** — the app celebrates milestones: total remembrances counted, collections completed, and daily streaks of opening the app. Badges appear on the Achievements screen, reachable from Settings.
- **Free tasbih counter** — a simple, standalone counter you can use for any dhikr you like, with no fixed text attached.
- **Make it yours** — three colour themes (light, warm "solarized", and dark), an optional extra explanation line under each remembrance, and optional vibration feedback with every count.
- **Volume buttons as page turns (Android)** — if enabled in Settings, the phone's hardware volume keys can move between remembrances, so you can read without touching the screen.

---

## A quick tour of the app

1. **Home screen** — a list of all azkar collections, with a search bar and a verse banner at the top.
2. **Tap a collection** — you land on the reader. Swipe sideways to move between remembrances.
3. **Tap to count** — each tap advances the counter. When you reach the required count, the app moves on to the next remembrance and tells you when the whole collection is complete.
4. **Settings (gear icon)** — change the theme, font size, reminders, audio behaviour, and more.
5. **Achievements** — see the badges you have earned from Settings.

---

## Trying the app on your computer

You don't need to be a programmer to run a preview in your web browser. Here is the whole process:

### Step 1 — Install Node.js (one time)

1. Go to [https://nodejs.org/](https://nodejs.org/).
2. Download the version marked **LTS** (it means "long-term support" — the stable one).
3. Install it like any normal program, clicking "Next" until it's done.

### Step 2 — Get the project files

Download or copy this project folder onto your computer (for example `C:\Projects\Zikrukum`).

### Step 3 — Install the app's building blocks (one time)

Open a terminal (on Windows: press the Start button, type `PowerShell`, and open it), then type:

```bash
cd C:\Projects\Zikrukum
npm install
```

The first command moves you into the project folder. The second downloads all the building blocks the app is made of — this takes a few minutes and only needs to be done once.

### Step 4 — Start the app in your browser

```bash
npm run web
```

A browser window will open with the app running in it. To stop it, press `Ctrl + C` in the terminal.

> **Note:** the browser preview is for trying things out. Some phone-only features (like reminders and vibration) only work on a real device.

---

## Running the app on a real phone

- **Easiest way to see it in a browser on any device:** run `npm run web` on your computer as above, then open the web address it shows from your phone's browser (both devices must be on the same Wi-Fi network).
- **Important for Android:** some features — notably using the volume buttons to turn pages, and the reminder notifications — require a "developer build" of the app (a version compiled specially with those parts included). The quick preview tools (like the free Expo Go app) are **not** enough for those features. A developer build is created with:

```bash
npm run android
```

with a phone connected by USB (or an Android emulator running), after completing Step 3 above.

- **iPhone:** requires a Mac computer, because of Apple's tools: `npm run ios`.

---

## For contributors and developers

This section is for people working on the code. Non-technical readers can safely skip it.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- Android Studio (for an Android emulator) or Xcode (for an iOS simulator, macOS only)
- A custom dev build for device testing — plain Expo Go is not enough, since `react-native-volume-manager` (hardware volume keys) and notification scheduling require native code.

### Setup

```bash
npm install
```

### Running

| Command | Description |
|---|---|
| `npm start` | Start the Metro bundler |
| `npm run android` | Run on an Android emulator or connected device |
| `npm run ios` | Run on an iOS simulator (macOS only) |
| `npm run web` | Run in the browser |

### Checks

Run these before considering any change finished:

```bash
npm run lint             # ESLint check
npm run lint:fix         # ESLint --fix + Prettier write
npx tsc --noEmit         # TypeScript strict check
npm run validate:azkar   # Dataset consistency check (run after editing azkar.json)
```

### Building installable app files

#### Android APK / AAB (via EAS Build)

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

#### iOS (macOS only)

```bash
eas build --platform ios
```

For the Google Play release steps, see [`DEPLOY.md`](DEPLOY.md).

---

## Project documentation

| File | What it contains |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Architecture reference and coding conventions for contributors |
| [`DEPLOY.md`](DEPLOY.md) | Google Play release checklist |
| [`TODO.md`](TODO.md) | Changelog of completed work |

---

## Privacy

Zikrukum is fully offline: all azkar text, fonts, and audio recordings are bundled inside the app. There are no accounts, no tracking, and no data leaves your device. Your progress, favourites, and settings are stored only on your phone.
