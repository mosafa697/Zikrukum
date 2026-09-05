---
name: zikrukum-review
description: Review and verify a in-progress implementation against Zikrukum skills, then close it as done. Use after zikrukum-implement.
---

## What I do
- Verify the change against all relevant skills and close the loop on the GitHub issue.

## When to use me
Use after code changes, before considering a task done.

## Workflow
1. Identify the `in-progress` issue (`gh issue view <id>`) and load `expo-verify` plus the issue's Related skills.
2. Run the static gates in project root:
   ```bash
   npm run lint:fix
   npx tsc --noEmit
   ```
   Both must be clean.
3. Review the diff (`git status`, `git diff`): conventions (tokens, fonts, RTL, i18n), 3-place persisted wiring, audio bundling rule (`AUDIO_ASSETS` static `require`), pager loop-free sync, volume/keep-awake cleanup, offline-first.
4. Manual checklist (as applicable): airplane-mode content, swipe right = next on Android/iOS/web, audio matrix (first play, pause/resume, replay, nav, auto-play-next, final stop, missing hides player), volume toggle default off, keep-awake only on CategoryScreen, 3 themes render.
5. Housekeeping: append the finished item to `TODO.md` changelog; update `AGENTS.md` if structure/conventions/workflows changed.
6. Commit and push: stage only the related changed files, commit, and push:
   ```bash
   git status --short --branch
   git diff --stat
   git add <related files...>   # never secrets; never `git add -A` blindly
   git commit -m "<type>: <task> (#<id>)"
   git push
   ```
   If the push is rejected (remote ahead), stop and report — never force-push.
7. Close the loop:
   ```bash
   # pass:
   gh issue edit <id> --remove-label "in-progress" --add-label "done"
   gh issue close <id> --comment "<what changed + verification>"
   # fail (needs rework):
   gh issue edit <id> --remove-label "in-progress" --add-label "todo" --comment "<reason>"
   ```

## Rules
- Never mark done with failing lint/typecheck.
- Never commit secrets; inspect `git status` / `git diff` before committing. Only open PRs when explicitly requested.
