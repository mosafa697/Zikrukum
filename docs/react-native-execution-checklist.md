# React Native Execution Checklist

This checklist is intended to be followed in order during implementation.

## Phase 1: Repository Preparation

- [x] Choose the native app path: `native/` (implemented as the `RNZekrecom/` folder inside the repo for this first step)
- [x] Create the native app as a separate Expo project inside this repository
- [x] Keep the current root web project unchanged
- [ ] Add a short native setup section to the root README after the native app exists
- [x] Confirm the repo works on Windows without symlink dependencies

### Acceptance criteria

- Native folder exists and runs independently
- Web app still installs and runs without modification

## Phase 2: Bootstrap Expo App

- [x] Initialize Expo with TypeScript
- [x] Install navigation dependencies
- [x] Install Redux Toolkit and React Redux
- [x] Install AsyncStorage
- [x] Install gesture handler dependencies
- [x] Install safe area and screens dependencies
- [x] Install clipboard support
- [x] Add Android package metadata placeholders

### Acceptance criteria

- Expo app launches on Android emulator or device
- Base dependencies compile cleanly

## Phase 3: Native Project Structure

- [x] Create `src/screens`
- [x] Create `src/components`
- [x] Create `src/navigation`
- [x] Create `src/store`
- [x] Create `src/theme`
- [x] Create `src/utils`
- [x] Create `src/data`
- [ ] Create `assets/fonts`

### Acceptance criteria

- Project structure supports screen-first implementation
- No web-specific files are copied blindly into native

## Phase 4: Data And Configuration Port

- Copy the azkar dataset into native
- Port or reuse the azkar mapper
- Create a native config file for interaction timing and default scale values
- Copy only pure utility logic that has no DOM dependency

### Acceptance criteria

- Native app can load category data locally
- Interaction constants are centralized

## Phase 5: Redux And Persistence

- Recreate the Redux store in native
- Port the current slice logic
- Replace browser storage calls with AsyncStorage utility methods
- Add startup hydration for persisted state
- Define category progress keys using the current naming approach

### Acceptance criteria

- Theme, shuffle, subtext, font scale, and total count persist across restarts
- Category progress resumes correctly

## Phase 6: Navigation Shell

- [x] Add native stack navigation
- [x] Create Categories screen route
- [x] Create Category screen route
- [x] Create Settings screen route
- [x] Create FreeTasbih screen route
- [x] Wire navigation params for `categoryId`

### Acceptance criteria

- User can move through the app using native navigation only
- Back behavior is stable across screens

## Phase 7: Categories Screen

- Rebuild the categories list UI
- Port category selection behavior
- Preserve access to settings
- Preserve access to the free tasbih experience
- Keep search only if it exists in current production behavior and is still needed

### Acceptance criteria

- User can open a category or free tasbih from the native home screen

## Phase 8: Category Reading Flow

- Rebuild the phrase card UI
- Port counter increment behavior
- Port delayed auto-advance behavior
- Port previous and next navigation buttons
- Port progress display
- Port subtext display rules
- Port back/reset behavior
- Add guarded tap handling

### Acceptance criteria

- Phrase counting matches web behavior
- Last-phrase logic works
- Leaving the screen resets transient screen state correctly

## Phase 9: Native Gestures And Copy

- Add swipe navigation between phrases
- Add swipe visual feedback
- Add long-press copy
- Prevent duplicate triggering after long press
- Tune gesture thresholds on Android

### Acceptance criteria

- Swipe navigation feels reliable on Android
- Long press copies phrase text without breaking tap flow

## Phase 10: Settings Screen

- Rebuild theme selection
- Rebuild shuffle toggle
- Rebuild subtext visibility toggle
- Rebuild total count reset
- Rebuild any static support/contact content if still required

### Acceptance criteria

- All settings persist correctly
- Theme changes apply immediately across the app

## Phase 11: Free Tasbih Screen

- Rebuild the independent counter flow
- Reapply tap throttling behavior
- Recreate any interaction feedback needed for usability

### Acceptance criteria

- Free tasbih is usable without category data

## Phase 12: Typography And Theming Polish

- Register the Arabic font
- Tune font sizes and line heights for Android
- Apply theme token values consistently
- Verify RTL-friendly layout and spacing

### Acceptance criteria

- Arabic text is readable and visually stable
- Themes feel complete rather than partially applied

## Phase 13: Offline And App Stability

- Verify bundled data is available with no network
- Verify cold launch works offline
- Verify AsyncStorage failures are handled safely

### Acceptance criteria

- App remains usable offline for its full core feature set

## Phase 14: Android Release Preparation

- Set package name
- Set app name and versioning
- Add icon and splash assets
- Configure EAS build for Android App Bundle output
- Prepare signing workflow
- Prepare screenshots and store text
- Prepare privacy policy link if needed

### Acceptance criteria

- Release candidate `.aab` can be produced
- Store listing inputs are ready

## Phase 15: Final Validation

- Test on at least one Android emulator
- Test on at least one physical Android device
- Verify app restart persistence
- Verify category progress resume
- Verify theme, shuffle, font scale, and subtext settings
- Verify free tasbih behavior
- Verify offline launch
- Verify Arabic layout and copy behavior

### Acceptance criteria

- No blocking parity gap remains for the Android MVP

## Recommended Order Of Work Inside The Team

1. Bootstrap and store foundation
2. Navigation shell
3. Category reading flow
4. Settings and free tasbih
5. Gestures and polish
6. Android release work