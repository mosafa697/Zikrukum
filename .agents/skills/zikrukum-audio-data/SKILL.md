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
- Source: `src/dataset/azkar.json` (merged 135-cat union; `azkar-sample.json` retained as reference only), raw shape `[{ id, category, array: [{ id, text, count, subtext?, filename? }] }]` — no `audio` key anywhere, no category-level keys beyond `id`/`category`/`array`.
- Mapper: `src/mappers/azkarMapper.ts` produces typed `AzkarCategory[]` (`id`, `title`, `icon`, `phrases`, `audioRef?`) and `AzkarPhrase` (`id`, `text`, `count`, `subtext`, `audio?`, `filename?`).
- Icons: `CATEGORY_ICON_MAP` keyed by category id (FontAwesome5 names, validated against the free glyph set). New categories need an entry; fallback is `bookmark` (never hit today — all 135 merged-dataset ids are mapped). Every name must exist in FontAwesome5 — a non-FA name (like the old `albums-outline` fallback) warns on web (`"not a valid icon name"`).
- Consumers: `CategoryScreen` does `azkar.find((item) => item.id.toString() === categoryId)` (route param is a string) then `dispatch(setPhases(...))`; `PhraseCard` renders one FlatList page per phrase.
- Current coverage: 29 clips under `assets/audio/` named after their canonical phrase (e.g. `3-2.mp3`, `4-4.mp3`); 53 phrases resolve to them (29 canonical owners + 24 shared-text references like evening `4-2` → `3-2`). The clips were formerly shared across 65 phrases (morning/evening duplicates of the same zikr); the other ~250 phrases resolve to a playback error (retry affordance) until their files are added — an open data task.

## Audio (local only)
- Source of truth: the per-phrase `filename` field only (no `audio` key, no category fallback). Empty `filename` normalizes to `missing`.
- Convention: `filename` = `{categoryId}-{phraseId}` and the clip lives at `assets/audio/{categoryId}-{phraseId}.mp3` (no `/audio/` prefix, no remote URL / CDN path). A phrase whose zikr text matches an already-bundled clip may reference that clip's name instead of its own (e.g. `4-2` → `3-2`); `scripts/validate-azkar.mjs` errors on any deviation, including text-mismatched shared references.
- Resolution (`src/audio/audioSource.ts`):
  - `resolveAudioSource(phrase)` -> `{ kind: 'local', filename } | { kind: 'missing' }`. Empty metadata normalizes to `missing`.
  - `resolveLocalAudioUri(filename)` loads via `expo-asset` + verifies with `expo-file-system`, returns playable URI or `null`.
- Bundling rule: every MP3 must be registered in the static `AUDIO_ASSETS: Record<filename, require(...)>` map so Metro sees the `require()` at build time. Keys are the `{categoryId}-{phraseId}` filenames (no `.mp3`). Example: `'3-2': require('../../assets/audio/3-2.mp3')`.
- Player (`src/audio/useZikrAudio.ts` + `playback` slice, not persisted): play/pause, loading, replay-after-finish, cleanup on unmount, navigation/loading race guards, `currentTime`/`duration` polling for progress bar, auto-play-next stops at final phrase. Hide the player when audio is disabled in Settings or source is `missing`. Show distinct themed `noAudio` vs `audioError` feedback with retry.

## Adding new audio checklist
- [ ] Place the MP3 under `assets/audio/` named `{categoryId}-{phraseId}.mp3`.
- [ ] Add a static `require()` entry to `AUDIO_ASSETS` (key = `{categoryId}-{phraseId}`).
- [ ] Ensure the phrase `filename` in `azkar.json` is `{categoryId}-{phraseId}` (already set for all phrases).
- [ ] Verify first play, pause/resume, replay, phrase nav, auto-play-next, final phrase, missing audio on Android, iOS, and web.
