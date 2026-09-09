---
name: zikrukum-commit
description: Stage related files, generate a conventional commit message, commit and push. Use only after zikrukum-review passed and user explicitly approved.
---

## What I do
- Commit and push already-reviewed changes with a clean, related-files-only commit.

## When to use me
Use only after `zikrukum-review` has passed (issue is in `review`) and the user has explicitly requested a commit/push. Never before review, never on implicit approval.

## Preconditions (must all be true — otherwise stop and report)
1. The issue passed review: `gh issue view <id>` shows label `review` and a review-pass comment.
2. User explicitly said to commit/push in this turn (e.g. "commit", "push", "commit and push").
3. `npm run lint:fix` and `npx tsc --noEmit` are still clean (re-run if any file changed since review).

## Workflow
1. Verify preconditions above. If not met, stop — do not commit.
2. Inspect what will be committed:
   ```bash
   git status --short --branch
   git diff --stat
   git diff
   git log --oneline -10
   ```
3. Stage only the related changed files — inspect before staging:
   ```bash
   git add <related files...>   # never secrets; never `git add -A` blindly
   ```
   Re-run `git status --short` and `git diff --cached --stat` to confirm only intended files are staged.
4. Generate the commit message from the issue + diff (conventional, no secrets):
   ```
   <type>: <task> (#<id>)
   ```
   Optionally add a body with what changed and verification. Keep it factual and concise.
5. Commit and push:
   ```bash
   git commit -m "<type>: <task> (#<id>)"
   git push
   ```
   If the push is rejected (remote ahead), stop and report — never force-push.
6. Close the loop (only after a successful push):
   ```bash
   gh issue edit <id> --remove-label "review" --add-label "done"
   gh issue close <id> --comment "<what changed + verification + commit SHA>"
   ```

## Rules
- Never commit or push before `zikrukum-review` has passed and the user has explicitly approved — no implicit or auto-commit.
- Never stage secrets; inspect `git status` / `git diff` / `git diff --cached` before every commit.
- Never force-push. If rejected, report and wait for the user to resolve.
- Only open PRs when explicitly requested.
