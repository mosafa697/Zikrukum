---
name: zikrukum-implement
description: Implement the next todo GitHub issue (or an explicit issue ID), moving it to in-progress. Use after zikrukum-plan.
---

## What I do
- Pick up a planned `todo` issue and implement exactly what it specifies.
- Own the `todo` -> `in-progress` label transition via `gh-cli`.

## When to use me
Use after planning, when starting code changes.

## Workflow
1. Resolve the target:
   - Explicit: `gh issue view <id>` and read Goal / Scope / Edge cases / Acceptance checklist.
   - Next-todo (default): `gh issue list --state open --label "todo" --json number,title,createdAt` and take the oldest; confirm with the user if ambiguous.
2. Claim it before coding:
   ```bash
   gh issue edit <id> --remove-label "todo" --add-label "in-progress"
   ```
   If already `in-progress`, stop and confirm takeover — never double-claim silently.
3. Check `git status --short --branch` is clean (or stashed); load `zikrukum-conventions` + the Related skills listed in the issue.
4. Implement per the issue plan only: functional components + hooks, `StyleSheet.create` + theme tokens, `t('key')` strings, `useTimeGuardedCallback` + `config.interaction` guards, persisted settings via the 3-place rule, local bundled audio only.
5. Do not close the issue here — hand off to `zikrukum-review`. Discovered follow-ups go as issue comments, not scope creep.

## Rules
- Exactly one active `in-progress` issue per worker.
- `TODO.md` is a changelog, not a task list — do not add new checkboxes here.
- Never commit secrets; only commit/push on explicit request.
