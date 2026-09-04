---
name: redux-persisted-setting
description: Add or change a persisted Redux Toolkit setting in Zikrukum. Use when touching theme, fontScale, audio prefs, favourites, volumeNav, or any AsyncStorage-backed slice.
---

## What I do
- Enforce the 3-place wiring rule for persisted settings so prefs survive restarts.
- Distinguish middleware-persisted slices from per-category index keys.

## When to use me
Use when adding a new setting, changing a default, or debugging a pref that does not persist.

## The 3-place rule
A persisted setting must be wired in all three places:

1. **Slice** (`src/store/slices/*.ts`): state + action. Example `volumeNavSlice.ts`:
   ```ts
   const volumeNavSlice = createSlice({
     name: 'volumeNav',
     initialState: { enabled: false },
     reducers: {
       toggleVolumeNav(state) { state.enabled = !state.enabled; },
       setVolumeNav(state, action: PayloadAction<boolean>) { state.enabled = action.payload; },
     },
   });
   ```
   Keep defaults deliberate (e.g. `volumeNav.enabled` defaults to `false` for fresh installs).

2. **Listener** (`src/store/persistence.ts`): subscribe with `actionCreator` for single actions or `isAnyOf(...)` matcher for groups, then `setStoredValue(key, value)`:
   ```ts
   listenerMiddleware.startListening({
     actionCreator: toggleVolumeNav,
     effect: async (_, api) => {
       const { volumeNav } = api.getState() as { volumeNav: { enabled: boolean } };
       await setStoredValue('volumeNavEnabled', volumeNav.enabled);
     },
   });
   ```
   Storage helpers live in `src/utils/storage.ts` (JSON-serialized, typed fallback).

3. **Preload** (`loadPersistedState()` in same file): read with default via `getStoredValue` in the `Promise.all`, include in returned preloaded state:
   ```ts
   getStoredValue<boolean>('volumeNavEnabled', false),
   // ...
   volumeNav: { enabled: volumeNavEnabled },
   ```
   Note `phases` preloads only `shuffle` (`{ value: [], shuffle, wasShuffled: false }`); `playback` is never persisted.

## Exceptions
- Per-category phrase indices (`azkar-index-{categoryId}`) are written directly via `setStoredValue` from `CategoryScreen`, not through middleware. Do not add them to `persistence.ts`.
- Store shape lives in `src/store/index.ts` (`createAppStore`, `RootState`, `AppDispatch`). The store is created once at startup with preloaded state.

## Checklist
- [ ] Slice action + initial state added.
- [ ] Listener entry writes the right key on every relevant action.
- [ ] `loadPersistedState` reads with correct default and returns the slice shape.
- [ ] Existing users keep their stored value; only fresh-install defaults change.
