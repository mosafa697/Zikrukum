# Play Store Deployment Checklist

Track everything needed to publish Zikrukum on Google Play as an Android app.

_Last updated: Sep 20, 2026._

## Current Status (Sep 20, 2026)

Code is ready. Developer account fully active; next: create the app in Play Console + service account key.

| Step | Status |
|---|---|
| Code quality (lint + tsc) | Done |
| App assets (icon, adaptive, splash, store icon, banner) | Done |
| EAS CLI + login + `eas.json` | Done |
| Google Play developer account | Done — fee paid Sep 18, phone verified Sep 19, ID verification + developer name complete (Sep 20) |
| Service account key (`pc-api-key.json`) | In progress |
| Android keystore | Not done — auto-created by EAS on first build |
| First production AAB build | Not done |
| Device test | Not done |
| Store listing (descriptions, screenshots, forms) | Not done |
| Closed testing (12 testers × 14 days) | Not done |
| Production release | Not done |

## Next Steps In Order

1. ~~**Finish account activation**~~ — Done (Sep 20): ID verification + developer name complete.
2. **Create the app in Play Console** — name `Zikrukum`, default language Arabic, then fill listing basics (category, contact email, privacy policy URL).
3. **Create the service account** so `eas submit` can upload automatically:
   1. Google Cloud Console → new project → enable `Google Play Android Developer API`.
   2. Create a Service Account → download the JSON key → save it as `pc-api-key.json` in the repo root (path already wired in `eas.json`).
   3. Play Console → Users and permissions → add the service account email as **Admin**.
4. **Build the AAB** — `eas build -p android --profile production`. EAS generates and stores the signing keystore automatically on the first build.
5. **Closed testing (12-testers policy)** — new personal accounts must run a closed test with at least 12 opted-in testers for 14 continuous days, then apply for production access. The `internal` track does not count; use **Closed testing**.
6. **Complete the store listing** — phone screenshots (≥2), Data Safety form, IARC content-rating questionnaire, descriptions.
7. **Submit & release** — `eas submit -p android`, create the production release, monitor ANRs/crashes.

---

## 1. App Assets — DONE

- [x] **App icon** — `assets/icon.png` (1024×1024, real PNG; the original was a JPEG renamed to `.png` — EAS rejects mismatched formats).
- [x] **Adaptive icon** — `assets/android/adaptive-foreground.png` + sand background `#F4EEE0` in `app.json`.
- [x] **Splash** — `assets/splash-icon.png` (1284×2778) configured under `expo.splash`.
- [x] **Play Store icon** — `assets/playstore.png` (512×512).
- [x] **Feature graphic** — `assets/banner.jpeg` (1024×500).

## 2. app.json Configuration

- [x] **Android versioning** — `android.versionCode: 1`, `expo.version: 1.0.0`.
- [x] **Package name** — `com.azkar.zikrukum` (final — cannot change after first publish).
- [x] **Permissions** — audio, notifications, exact alarm, boot completed. Audit the first EAS build log to confirm no unexpected permissions.
- [ ] **Version sync** — `package.json` is `0.1.0` while `app.json` is `1.0.0`; align them before the first build.

## 3. Build Setup (EAS)

- [x] **eas-cli installed** — v24.3.0, logged in as `mosafa697`.
- [x] **`eas.json`** — `production` profile = AAB (Play requirement), `preview` profile = internal APK; submit config targets the `internal` track via `./pc-api-key.json`.
- [ ] **Service account key** — create `./pc-api-key.json` (or upload AABs manually through the Console UI instead).
- [ ] **Signing keystore** — let `eas build` auto-create it on the first run, then back it up securely (losing it = cannot update the app).
- [ ] **First production build** — `eas build -p android --profile production`.

## 4. Pre-Release Verification

- [x] **Lint clean** — `npm run lint` passes with no warnings (verified Sep 19; the old 10 warnings are resolved).
- [x] **TypeScript clean** — `npx tsc --noEmit` passes (verified Sep 19).
- [x] **Audio bundled** — 29 MP3s under `assets/audio/`, mapped in `src/audio/audioSource.ts` (`AUDIO_ASSETS`), wired for categories 3 + 4. Note: some dataset `filename` fields still point at unbundled external paths and resolve to a playback error — acceptable for v1.0.0, cleanup later.
- [ ] **Device test** — install the AAB/APK on a real Android device; check navigation, themes, counters, persistence, fonts, audio, RTL.

## 5. Play Console Setup (account level)

- [x] **Developer account** — $25 one-time fee paid Sep 18, 2026. The planned-app-count question does not affect the price or limits.
- [x] **Phone verification** — done Sep 19. International format: `+20` then the number WITHOUT the local leading 0 (e.g. `+201002049983`, not `+2001002049983`).
- [x] **ID verification + developer name** — done Sep 20; account fully active.
- [ ] **Service account linked** — Users and permissions → add service account email as Admin.
- [ ] **Privacy policy URL** — live at https://zikrukum-pp.pages.dev/ (Cloudflare Pages, separate `zikrukum-pp` repo). Paste it into the listing.
- [ ] **12-testers policy** — closed test with ≥12 opted-in testers for 14 continuous days, then apply for production access (required for personal accounts created after Nov 2023).

## 6. Store Listing & Compliance (per app)

- [ ] **Create the app** — name `Zikrukum`, default language Arabic, category, contact email.
- [ ] **Descriptions + screenshots** — short + full descriptions, phone screenshots (≥2).
- [ ] **Data Safety form** — offline app, data only on-device (AsyncStorage) → declare **"no data collected nor shared"**.
- [ ] **IARC content rating** — questionnaire (religious/reference content → low/universal in most cases).
- [ ] **Ads declaration** — "no ads".
- [ ] **App access** — fully open, no login, no demo credentials needed.
- [ ] **Target audience** — decide general vs Families (child-safety policy applies if targeting minors).
- [ ] **Content licenses** — fonts are SIL OFL (open); azkar texts and MP3 recitations need confirmed licenses.
- [ ] **Target API level** — must meet Google's 2026 requirement (~API 35+); Expo SDK 57 satisfies this, verify in the Console.

## 7. Submit

```bash
eas build -p android --profile production   # produces .aab, keystore auto-created
eas submit -p android                       # uploads to Play Console (needs pc-api-key.json)
```

- [ ] **Closed testing rollout** — upload to the Closed testing track, keep ≥12 testers opted in for 14 days, then apply for production access.
- [ ] **Production release** — create the production release, roll out, monitor ANRs/crashes in Play Console.

## Follow-ups (non-blocking)

- Sync `package.json` version (`0.1.0`) with `app.json` (`1.0.0`).
- `TODO.md` features (notifications, onboarding) — not blockers for v1.0.0.
