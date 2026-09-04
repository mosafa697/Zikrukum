---
name: expo-verify
description: Verify Zikrukum changes with lint, typecheck, and manual device checks. Use before considering any task done or opening a PR.
---

## What I do
- Run the required static checks and confirm offline + cross-platform behavior.

## When to use me
Use after code changes, before marking a TODO complete, and before pushing.

## Commands (run in project root)
```bash
npm run lint        # ESLint check (src/**/*.ts,tsx + App.tsx + index.ts)
npm run lint:fix    # ESLint --fix + Prettier write — run before considering work done
npx tsc --noEmit    # TypeScript strict check
npm start           # Metro bundler
npm run android     # Run on Android
npm run ios         # Run on iOS (macOS only)
npm run web         # Run in browser
```

## Manual checklist
- [ ] `npm run lint:fix` clean, `npx tsc --noEmit` clean.
- [ ] Offline: airplane mode — categories, phrases, fonts, locally bundled audio all work; no network calls for core content.
- [ ] Pager: swipe right = next phrase on Android, iOS, and web; no flicker; reset / counter-complete / audio auto-advance / saved-index restore sync correctly.
- [ ] Audio (if touched): first play, pause/resume, replay, nav, auto-play-next, final phrase stops, `missing` hides player when disabled.
- [ ] Volume buttons (if touched): respect `volumeNav.enabled` toggle (default off); CategoryScreen volume-down decrements counter then advances, volume-up goes back; FreeTasbih down +1 / up −1 (floor 0); rapid-press guard, volume snap-back, listener cleanup.
- [ ] Keep-awake (CategoryScreen only): activates on mount, deactivates on unmount.
- [ ] Themes: light / solarized / dark all render with tokens, no hardcoded colors.
- [ ] RTL: pager mirrors correctly on web (`scaleX: -1` fallback); verse/hadith quote blocks still use static centered styles — conditional per-locale RTL is a pending `TODO.md` task, not a release gate.

## Housekeeping
- [ ] `TODO.md` updated (check off finished items, add discovered follow-ups).
- [ ] `AGENTS.md` updated if structure, conventions, or workflows changed.
- [ ] Never commit secrets; inspect `git status` / `git diff` before committing. Only commit, push, or open PRs when explicitly requested.
