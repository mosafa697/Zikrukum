---
name: zikrukum-review
description: Review and verify an in-progress implementation against Zikrukum policies, flow, and architecture — without committing. Use after zikrukum-implement and before any commit.
---

## What I do
- Verify the change against all relevant skills and prepare it for user review.
- Never commits or pushes — that is the job of `zikrukum-commit` after explicit user approval.

## When to use me
Use after code changes, before considering a task done, and strictly before `zikrukum-commit`.

## Workflow
1. Identify the `in-progress` issue (`gh issue view <id>`) and load `expo-verify` plus the issue's Related skills.
2. Run the static gates in project root:
   ```bash
   npm run lint:fix
   npx tsc --noEmit
   ```
   Both must be clean — do not mark review with failures.
3. Review the diff (`git status`, `git diff`, `git diff --stat`): conventions (tokens, fonts, RTL, i18n), 3-place persisted wiring, audio bundling rule (`AUDIO_ASSETS` static `require`), pager loop-free sync, volume/keep-awake cleanup, offline-first. Inspect but do not stage or commit.
4. Manual checklist (as applicable): airplane-mode content, swipe right = next on Android/iOS/web, audio matrix (first play, pause/resume, replay, nav, auto-play-next, final stop, missing hides player), volume toggle default off, keep-awake only on CategoryScreen, 3 themes render.
5. Housekeeping: append the finished item to `TODO.md` changelog; update `AGENTS.md` if structure/conventions/workflows changed. Leave changes unstaged for the user to inspect — do not commit here.
6. Report the result and relabel — no commit, no push, no close as done:
   ```bash
   # pass — ready for user review:
   gh issue edit <id> --remove-label "in-progress" --add-label "review"
   gh issue comment <id> --body "Review pass: <what changed + verification (lint/typecheck/diff/manual)>. Awaiting your approval — run \`zikrukum-commit\` to commit and push after you review."

   # fail — needs rework:
   gh issue edit <id> --remove-label "in-progress" --add-label "todo"
   gh issue comment <id> --body "Review fail: <reason + what needs rework>"
   ```
   After this, stop and wait for the user to review the diff/files. Do not proceed to commit.

## Rules
- Never mark review with failing lint/typecheck.
- Never commit, push, or close as `done` — that belongs to `zikrukum-commit` and requires explicit user approval.
- Never commit secrets; inspect `git status` / `git diff` before any future commit (done in `zikrukum-commit`).
- Only open PRs when explicitly requested (handled in `zikrukum-commit`).
