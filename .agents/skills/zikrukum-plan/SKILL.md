---
name: zikrukum-plan
description: Plan a Zikrukum task with edge-case analysis and user questions, then save it as a GitHub issue with todo. Use before any implementation.
---

## What I do
- Turn a feature/fix request into an optimal plan and persist it as a `todo` issue.
- Enforce edge-case analysis + user confirmation before code is written.

## When to use me
Use at the start of every task, before touching code.

## Workflow
1. Load `zikrukum-conventions` plus the relevant domain skill (`zikrukum-theming`, `zikrukum-audio-data`, `redux-persisted-setting`).
2. Inspect the task: read the relevant files, check `TODO.md` changelog and open issues (`gh issue list --label todo`) for duplicates.
3. Analyze edge cases explicitly: offline-first, RTL (native `forceRTL` vs web `scaleX: -1` mirror), pager sync via `expectedIndexRef`, audio `missing` vs `error`, volume-button guard + cleanup, keep-awake scope, theme tokens (no hardcoded colors), persisted-setting 3-place rule.
4. Ask the user questions when a decision affects scope, UX, or platform behavior. Do not assume.
5. Create the issue with default status `todo`:
   ```bash
   gh issue create --title "<type>: <task>" --label "todo,<type>" --body "..."
   ```
   Body must contain: Goal / Scope / Files likely touched / Edge cases / Acceptance checklist / Related skills.
6. Return the issue URL + number. Stop — do not implement in this phase.

## Rules
- Labels: `todo` is the default; add one type label (`enhancement`, `bug`, `documentation`).
- One task per issue. New findings during planning go into the body, not code.
- App must remain fully offline-capable for core content.
