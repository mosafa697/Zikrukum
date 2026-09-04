---
name: zikrukum-audio-data
description: Manage Zikrukum azkar dataset, category icons, and bundled local audio. Use when adding categories, phrases, MP3 clips, or fixing missing-audio states.
---

## What I do
- Keep dataset -> mapper -> audio resolution consistent and offline-capable.
- Ensure Metro bundles every MP3 via static `require`.

## When to use me
Use when adding/editing categories or phrases, adding audio clips, or debugging `noAudio` / `audioError` states.

## Dataset + mapper
- Source: `src/dataset/azkar-sample.json`, raw shape `[{ id, category, array: [{ id, text, count, subtext, audio?, filename? }] }]`, plus optional category-level `audio` / `filename` fallback (`audioRef`).
- Mapper: `src/mappers/azkarMapper.ts` produces typed `AzkarCategory[]` (`id`, `title`, `icon`, `phrases`, `audioRef?`) and `AzkarPhrase` (`id`, `text`, `count`, `subtext`, `audio?`, `filename?`).
- Icons: `CATEGORY_ICON_MAP` keyed by category id (FontAwesome5 names). New categories need an entry; fallback is `albums-outline` (never hit today — all dataset ids `1`–`21` + `122` are mapped). Note the map holds an orphan entry for id `22` (no such category; Friday `سنن يوم الجمعة` is id `21`), while `122` = Arafat `kaaba`.
- Consumers: `CategoryScreen` does `azkar.find((item) => item.id.toString() === categoryId)` (route param is a string) then `dispatch(setPhases(...))`; `PhraseCard` renders one FlatList page per phrase.
- Current coverage: 29 clips under `assets/audio/` (`1`–`14`, `15-16`, `17`–`22`, `24`–`31`); dataset wires 46 of 132 phrases (categories `3` + `4` fully; all other categories have no audio yet).

## Audio (local only)
- Source of truth: per-phrase `audio` / `filename` fields, falling back to category `audioRef`.
- Convention: clips live under `assets/audio/` (see `config.audio.assetDir` in `src/config/config.ts`). No remote URL / CDN path.
- Resolution (`src/audio/audioSource.ts`):
  - `resolveAudioSource(phrase, category)` -> `{ kind: 'local', filename } | { kind: 'missing' }`. Empty metadata normalizes to `missing`.
  - `resolveLocalAudioUri(filename)` loads via `expo-asset` + verifies with `expo-file-system`, returns playable URI or `null`.
- Bundling rule: every MP3 must be registered in the static `AUDIO_ASSETS: Record<filename, require(...)>` map so Metro sees the `require()` at build time. Keys are stripped filenames (no `/audio/` prefix, no `.mp3`). Example: `'15-16': require('../../assets/audio/15-16.mp3')`.
- Player (`src/audio/useZikrAudio.ts` + `playback` slice, not persisted): play/pause, loading, replay-after-finish, cleanup on unmount, navigation/loading race guards, `currentTime`/`duration` polling for progress bar, auto-play-next stops at final phrase. Hide the player when audio is disabled in Settings or source is `missing`. Show distinct themed `noAudio` vs `audioError` feedback with retry.

## Adding new audio checklist
- [ ] Place MP3s under `assets/audio/`.
- [ ] Add static `require()` entries to `AUDIO_ASSETS`.
- [ ] Fill `audio` / `filename` fields in `azkar-sample.json` (phrase-level or category-level).
- [ ] Verify first play, pause/resume, replay, phrase nav, auto-play-next, final phrase, missing audio on Android, iOS, and web.
