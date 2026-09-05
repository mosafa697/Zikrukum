# Play Store Deployment Checklist

Track everything needed to publish Zikrukum on Google Play as an Android app.

_Last updated: Aug 30, 2026._

## 1. App Assets

- [x] **App Icon** — `assets/icon.png` (1024×1024 PNG) added and referenced in `app.json` under `expo.icon`.
	- Note: the original file was a JPEG with a `.png` extension; converted to a real PNG (EAS rejects mismatched formats).
- [x] **Adaptive Icon** — `assets/android/adaptive-foreground.png` wired up with sand background (`#F4EEE0`) under `expo.android.adaptiveIcon`.
- [x] **Splash Screen** — Generated `assets/splash-icon.png` (1284×2778, icon centered on sand `#F4EEE0`) and configured under `expo.splash`.
- [x] **Play Store Icon** — `assets/playstore.png` (512×512 PNG) ready to upload in the Play Console listing.
	- Note: the extra unused copies that used to live under `assets/android/mipmap-*` were deleted; Expo regenerates launcher icons from `app.json` at build time, so they are not needed.
- [x] **Feature Graphic** — `assets/banner.jpeg` resized to exactly **1024×500** (ready for upload).

## 2. app.json Configuration

- [x] **Android versionCode** — `"versionCode": 1` set under `expo.android`.
- [x] **Bump Version** — `expo.version` raised from `0.1.0` to `1.0.0`.
- [x] **Verify Package Name** — Currently `"package": "com.azkar.zikrukum"`; confirm this is final (cannot be changed after first publish).
- [x] **Permissions Audit** — No dangerous permissions expected (offline app); verify after first EAS build via the build log / Play Console.

## 3. Build Setup (EAS)

- [ ] **Install eas-cli** — `npm i -g eas-cli`, then `eas login`.
- [x] **Create `eas.json`** — Present: `production` profile (`buildType: "app-bundle"` for Play's AAB requirement) and `preview` profile (internal-distribution APK); submit config targets the `internal` track via `./pc-api-key.json` service account key.
- [ ] **Service Account Key** — Place a Play Console API key at `./pc-api-key.json` to enable `eas submit` (or upload the AAB manually through the Console UI instead).
- [ ] **Signing Key** — Generate/upload an Android keystore via `eas credentials` (or let `eas build` auto-create one on first run).
- [ ] **First Production Build** — Run `eas build -p android --profile production` and confirm it completes.

## 4. Pre-Release Verification

- [x] **Lint Clean** — `npm run lint` passes (0 errors; 10 warnings remain, non-blocking: 4× `no-explicit-any` + 6× unused contact-form vars in `SettingsScreen`).
- [x] **TypeScript Clean** — `npx tsc --noEmit` passes.
	- Fixed invalid `"ignoreDeprecations": "6.0"` in `tsconfig.json`.
	- Installed missing direct dependency `@expo/vector-icons` (was only resolving transitively).
- [ ] **Test on Device** — Install the built AAB/APK on a real Android device; verify navigation, themes, counters, persistence, fonts.
- [x] **Audio Feature Migration** — `expo-audio` is now installed (`~1.1.1`) and the playback UI/state machine is fully wired into the zikr reader (see `src/audio/`). The stale note about `expo-audio` not being installed is resolved.

- [x] **Audio Clips — RESOLVED** — 29 MP3s bundled under `assets/audio/` (`1`–`14`, `15-16`, `17`–`22`, `24`–`31`); `AUDIO_ASSETS` in `src/audio/audioSource.ts` maps the same 29 keys; `azkar-sample.json` references those 29 distinct filenames (46 of 132 phrases, i.e. categories `3` + `4` fully — all present). Notes: there are no `15.mp3`/`16.mp3`/`23.mp3` (removed; only the combined `15-16.mp3` exists), and `22.mp3` is bundled but currently unreferenced (no category `22` in the dataset — Friday is id `21`). Audio feature is fully wired and ready.

## 5. Play Policies & Compliance (Google requirement)

Must be satisfied before the app can be approved/reviewed in the Play Console. Source: [Google Play Developer Policy Center](https://support.google.com/googleplay/android-developer/answer/9859455).

### Content & Store-listing policies (per app)
- [ ] **Data Safety form** — Complete in Play Console. Zikrukum is an offline app storing data only on-device (AsyncStorage) with locally bundled audio: expected declaration is **"no data collected nor shared"**.
- [ ] **IARC content rating** — Complete the content-rating questionnaire (religious/reference content → low/universal rating in most cases).
- [ ] **Target audience & content** — State whether the app is designed for children. Religious/kids content may trigger **Families/child-safety** policy requirements (see below).
- [ ] **Ads declaration** — Declare "no ads" (Zikrukum currently has none).
- [ ] **App access** — App is fully open (no login) → state so. No demo credentials needed.
- [ ] **Store listing accuracy** — App name, descriptions, and screenshots must accurately represent the app (no misleading/deceptive metadata — "Deceptive Behavior" policy).

### Technical / build policies
- [ ] **App signing** — Ship AAB signed with an app-signing key; back up the keystore securely (losing it = cannot update the app).
- [ ] **Permissions justification** — Every requested permission must be justified. Audit the EAS build log to confirm no unnecessary/unexpected Android permissions are pulled in (rejection risk).
- [ ] **Target API level** — Must meet Google's current requirement (2026 target is roughly **API 35+**). Expo SDK 54 typically meets this; verify in the Play Console before release.
- [ ] **Play Integrity / API keys** — Ensure no exposed API keys or secrets in the bundle (none expected; app is offline).

### Platform-wide policies (account-level risk)
- [ ] **Intellectual property / copyright** — Confirm licenses for all bundled content: hadith/azkar **text**, **fonts** (ScheherazadeNew, Tajawal, Amiri), and **audio clips** (if shipped). Bundled *fonts* are open-licensed (SIL OFL) — good. Any third-party MP3 recitations need permission/license.
- [ ] **Child safety** — If minors may use the app, comply with the Family/child-safety policies (age gates, content suitability). Decide whether to tag the app as "designed for families" or general audience.
- [ ] **User data / privacy** — If any data is collected (even analytics/crash logs), the **Privacy Policy URL** (§6) and data-safety disclosure are mandatory; Zikrukum expects to collect none.

## 6. Play Console Requirements (outside repo)

- [ ] **Developer Account** — Google Play developer account created ($25 one-time fee).
- [x] **Privacy Policy URL** — Live at **https://zikrukum-pp.pages.dev/** (Cloudflare Pages). Source is the separate `zikrukum-pp` repo (repo root has `index.html`, Arabic/RTL static page, no build step). Paste this URL into the Play Console listing. Contact email filled in (`mosafa697@gmail.com`) — no placeholder remains.
- [ ] **Data Safety Form** — Declare what data is collected/shared (expected: none collected off-device).
- [ ] **Content Rating Questionnaire** — Complete IARC rating form.
- [ ] **Store Listing** — App title, short + full descriptions, screenshots (phone, minimum 2), 512×512 icon (done), feature graphic (done).
- [ ] **App Category & Contact** — Choose category, add contact email.

## 7. Submit

- [ ] **Build & Upload**

```bash
eas build --profile preview --platform android #for test android
```

```bash
eas build -p android --profile production   # produces .aab
eas submit -p android                        # uploads to Play Console
```

- [ ] **Internal Testing Track First** — Roll out to internal/closed testing before production release.
- [ ] **Production Release** — Create production release, roll out, monitor ANRs/crashes in Play Console.

## 8. Overall Readiness Status (Aug 30, 2026)

**Not production-ready — code ~85%, process ~60%.** Everything below is verified as of the last update.

### Done & verified
- `npx tsc --noEmit` passes (0 errors).
- `npm run lint` passes (0 errors; 10 warnings, non-blocking).
- App icon / adaptive icon / splash / Play Store icon all present and wired in `app.json`.
- `eas.json` present (production = AAB, preview = APK); no `pc-api-key.json` yet.
- Codebase fully offline-capable (bundled JSON + fonts + local audio, no network).
- **Privacy Policy URL live** at https://zikrukum-pp.pages.dev/ (verified HTTP 200; contact filled).
- **Feature graphic** ready at 1024×500.
- **Audio clips** bundled: 29 MP3s + `AUDIO_ASSETS` (same 29 keys) + dataset wired for categories `3` + `4` (46/132 phrases) — audio BLOCKER resolved.

### Blocking before first Play release
1. **Device test** — Build the AAB/APK and run it on a real Android device.
2. **Play Console setup** — Developer account, signing keystore, service-account key (`pc-api-key.json`).
3. **Store listing + policies** — Phone screenshots, Data Safety form, IARC content rating, descriptions, contact email. See §5 and §6. (Privacy policy URL, feature graphic, and audio are all DONE.)

### Non-blocking follow-ups
- Sync `package.json` version (`0.1.0`) with `app.json` (`1.0.0`).
- Clean the 10 lint warnings (4× `no-explicit-any`, 6× unused contact-form vars in `SettingsScreen`).
- Decide on `TODO.md` features (Notifications, First-Launch Onboarding) — not blockers for a v1.0.0 release.
