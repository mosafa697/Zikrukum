# Play Store Release Checklist

This checklist covers the Android release work needed after the native app reaches functional parity.

## Product Identity

- Final app name confirmed
- Android application ID confirmed
- Version name defined
- Version code strategy defined
- Publisher account access confirmed

## Google Play Account

- Google Play Developer account created
- Organization or individual ownership confirmed
- Billing profile completed if required
- Team access roles assigned correctly

## Legal And Policy Readiness

- Privacy policy prepared
- Data handling reviewed
- Clipboard usage reviewed for policy clarity
- App content reviewed for store compliance
- Target audience classification decided

## Android App Configuration

- App icon exported in required sizes
- Adaptive icon prepared if used
- Splash screen assets prepared
- Package name configured permanently
- Supported Android SDK levels reviewed
- Permissions reviewed and minimized

## Build And Signing

- Expo EAS project created
- Android build profile created
- Signing approach decided
- Keystore generated and stored securely
- Release App Bundle build tested
- Release install smoke-tested on Android

## Store Listing Assets

- Short description written
- Full description written
- High-resolution icon prepared
- Feature graphic prepared
- Phone screenshots prepared
- Tablet screenshots prepared only if needed
- Contact email confirmed
- Website or support URL confirmed if available

## Release Quality Checks

- Cold start tested
- Offline launch tested
- Theme switching tested
- Arabic font rendering tested
- Category counting tested
- Swipe navigation tested
- Long-press copy tested
- Free tasbih tested
- Settings persistence tested
- Crash-free smoke test completed

## Pre-Submission Review

- Version information updated
- Release notes written
- Content rating questionnaire prepared
- Data safety form prepared
- Ads declaration confirmed
- App access instructions prepared if required

## Submission Flow

1. Upload signed `.aab`
2. Complete release notes
3. Complete content rating
4. Complete data safety section
5. Complete store listing
6. Select testing track
7. Run internal or closed testing first
8. Resolve all Play Console warnings
9. Submit for review

## Post-Submission Readiness

- Support channel monitored
- Rollback plan documented
- Version bump process documented
- Hotfix release path verified

## Recommended Release Track Sequence

1. Internal testing
2. Closed testing
3. Production rollout

## Minimum Go/No-Go Criteria

Do not submit the app until:

- The native Android app covers the core behavior of the web app.
- Persistence and category resume are stable.
- Arabic typography is validated on real Android hardware.
- The release `.aab` installs and launches correctly.
- Store assets and required policy materials are complete.