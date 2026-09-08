# Adhkar Reminders E2E Verification Matrix (#19)

> Covers #13-#20 (notifee channel, time config, DAILY/WEEKLY scheduling, TrackPlayer background service, Play تشغيل handoff, stop/cleanup, Friday). Requires **dev build / prebuild** — notifee + TrackPlayer are native, Expo Go shows no crash but notifications/media controls are no-ops. Web best-effort no-op (guarded `Platform.OS !== 'web'`).

## Pre-reqs

- `npx expo prebuild --clean` + `npm run android` (or iOS) from `main` post-#20 (`c4b8cde`).
- Permissions in `app.json`: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `iOS UIBackgroundModes: ["audio"]`.
- Static gates: `npm run lint:fix` clean (0 errors), `npx tsc --noEmit` clean — verified in each of #13-#20 reviews.

## 1. Scheduled fire (wall-clock DAILY)

- **Setup:** Settings → `تذكير الأذكار` → set Morning 1 min ahead, Evening 2 min ahead, Friday 3 min ahead if Friday else leave at 09:00 (verify next Friday computation).
- **Expect:** Notifications fire at `getNextTriggerDate` / `getNextFridayTriggerDate` (wall-clock, `scheduler.ts:1`), ids `morning-adhkar` `evening-adhkar` `friday-adhkar` (single channel `adhkar-reminders`). DAILY repeats next day at same wall-clock, WEEKLY repeats next Friday.
- **Verify:** `adb logcat | grep -i notifee` shows `createTriggerNotification` with `RepeatFrequency.DAILY=1` / `WEEKLY=2` + `alarmManager SET_EXACT_AND_ALLOW_WHILE_IDLE`; no duplicate ids after rapid toggle (cancel-before-schedule idempotent, `prevRemindersJson` guard in `App.tsx:29`).
- **Platforms:** Android (High importance channel), iOS (category `adhkar-reminder`), Web = no-op.

## 2. Play تشغيل from notification (3 app states)

Notification payload includes `android.actions: [{title:'تشغيل', pressAction:{id:'play'}}]` + `data:{categoryId, type}` (`3` morning, `4` evening, `21` Friday).

| State | Steps | Expect |
|-------|-------|--------|
| Foregrounded | App open → wait for notification → tap `تشغيل` | `App.tsx:29` `onForegroundEvent` → `eventHandler.ts:1` `handlePlay` debounced 500ms → `trackPlayerService.ts:1` `playCategory(categoryId, startAtCurrentPhrase:true)` builds queue from `azkar-index-{id}` + `autoPlayNext` → `TrackPlayer` notification morphs to media controls (Play/Pause/Stop ± Skip), audio plays via `file://` local asset |
| Backgrounded | Home button → notification shade → tap `تشغيل` | Same foreground handler (foreground service still alive) |
| Killed | Swipe away app → wait for next trigger → tap `تشغيل` | `index.ts:19` `onBackgroundEvent` headless (top-level, outside React, reads `AsyncStorage` + `setupPlayer` + `playCategory`) → TrackPlayer persistent notification appears even though app UI not rendered |

- **Queue:** `autoPlayNext` on → queue from current phrase to end (`buildTracksForCategory` slice), caps include Skip; off → single track from current phrase.
- **Missing audio guard:** If `resolveAudioSource === missing` or `resolveLocalAudioUri === null`, `playCategory` returns `false` silently, no crash (category 21 currently has no bundled clips).

## 3. Media controls sync (locked screen)

- **Controls:** Play/Pause toggles `State.Playing` ↔ paused, Stop → `trackPlayerService:151` `stopPlayback` `stop+reset` clears foreground service + notification (idempotent, `reason` param), Skip Next/Prev when `autoPlayNext`+`tracks>1` (caps include `SkipToNext/Previous`).
- **Headless service:** `playbackService.ts:1` handles `RemotePlay/ RemotePause/ RemoteStop/ RemoteNext/ RemotePrevious/ PlaybackQueueEnded → stop+reset`.
- **Locked test:** Lock device while playing → notification shade + lock screen show media controls, play/pause/stop work, `AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification` clears on `stop`.

## 4. Permission denied

- **Deny `POST_NOTIFICATIONS` (Android 13+) / iOS deny:** `permissions.ts:1` `useNotificationPermissions` returns `denied` → Settings card shows `PermissionBlockedBanner` (themed RTL, `t('notifPermissionTitle/Body')`), toggles `disabled opacity 0.5`, `scheduleReminders` permission gate `if (status==='denied') return` → no schedule, no crash. `onOpenSettings` → `notifee.openNotificationSettings(channelId)`, `onRequest` → `requestPermission`.
- **Exact alarm denied (Android 12+/14+):** Trigger still schedules via WorkManager (may drift ~15 min in Doze, `exactAlarmRationale` footer documents). `openAlarmPermissionSettings` available.

## 5. Reboot

- **Steps:** Schedule → reboot device/emulator cold boot → (no auto-restore without app launch on most OEMs) → launch app → `App.tsx` `ensureAdhkarChannel` + `scheduleReminders` on `appStore` ready + `AppState active` restores triggers. Verify no duplicates (stable ids, cancel-before-schedule).
- **OEM note:** Some skins kill AlarmManager; minimum is restore on first launch; `RECEIVE_BOOT_COMPLETED` declared but notifee does not auto-restore headless without app launch — documented.

## 6. Timezone change

- **Steps:** Schedule 06:00 → change device timezone +2h (Settings → Date & time) → bring app to foreground (`AppState active` → `scheduleReminders` recomputes wall-clock via `getNextTriggerDate` fresh `new Date()`), next fire follows new wall-clock not UTC. Verify DAILY still 06:00 local.

## 7. Missing audio guard

- **Steps:** Temporary remove `21` from `AUDIO_ASSETS` or use category with no audio → trigger → tap `تشغيل` → no crash, no TrackPlayer queue, error silently swallowed (web/Expo Go also no-op).

## 8. Expo verify

- [x] `npm run lint:fix` clean (0 errors, ~12 pre-existing warnings)
- [x] `npx tsc --noEmit` clean (each #13-#20)
- [ ] Manual Android dev build (required), iOS best-effort (simulator limited, audio background needs device), Web warns not supported (guarded requires)

## Edge cases documented

- OEM battery optimization killing AlarmManager → `getPowerManagerInfoSafe` + `openPowerManagerSettings` available, but mitigation is reschedule-on-active + user guidance.
- iOS exact alarm not needed (iOS notifee triggers are not AlarmManager).
- Expo Go cannot test notifee/TrackPlayer → guard `require` inside `Platform.OS !== 'web'` try/catch, `isNotifeeSupported`/`isTrackPlayerSupported` return false → all scheduling/playback no-ops.

## Results log

Fill on device pass:

- [ ] Android dev build: fires, Play 3 states, media controls, reboot, timezone, denied banner, no duplicates — date: ___, device: ___
- [ ] iOS best-effort: ___ (or "simulator-limited, documented")
- [ ] Web no-op confirmed
- [ ] Stale prune (`pruneStaleDisplayedNotifications`) no orphan channel
