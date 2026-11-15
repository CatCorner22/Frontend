# The owner's skill "verified-build-loop"

- **Source**: `verified-build-loop.zip` and `verified-build-loop_2.zip`, uploaded by the owner on 2026-11-15 (the two hold the same 17 files, byte for byte); installed unchanged at `.claude/skills/verified-build-loop/`
- **Type**: other (a Claude Code skill: instructions, four hook scripts, templates, tests)
- **Author/Origin**: the owner
- **Published**: not stated
- **Ingested**: 2026-11-15 (every file read in full; the skill's own 48 tests run here: all pass)
- **Tags**: method, checks, hooks

## Summary

The skill makes "done" something that a check proves. It installs a written definition of done, pass-or-fail checks, three hooks, and a read-only reviewer. It matters here because the owner asked that the builder check its work as it codes; the skill enforces part of the verification rules in `CLAUDE.md`.

## Key concepts

- Five layers: (1) `SPEC.md` and `feature_list.json`; (2) checks in `.claude/verify.json`; (3) hooks; (4) a read-only `reviewer` subagent; (5) one feature per session, with `progress.md` and `init.sh`. Claude Code enforces layer 3 only; the rest are instructions.
- Stop hook: runs the fast checks each time the builder tries to end a turn after a change, and the full checks when a feature changes to `"passes": true`. After three identical failures in a row it lets the turn end and shows the owner the failing output.
- PreToolUse hook: blocks writes to protected files, to the hook files, to `.claude/settings.json`, to the reviewer, and to the lock; allows only two changes to the feature list (setting `passes`; adding a feature that does not pass); allows only additions to `verify.json`.
- PostToolUse hook: lints the file that was just edited and shows the errors; it cannot undo the edit.
- Two commands are for the owner alone, in a terminal: `unlock <path>` and `relock`.
- Phases: 1 set-up (once), 2 feature loop (tests first, protect the tests, implement, reviewer, full checks, mark as passing, commit, evidence report), 3 repair.

## Notable quotes and data

> "Claude Code enforces only layer 3. Everything else is an instruction that Claude chooses to follow." — SKILL.md, Purpose

> "Never weaken a check to make it pass" — SKILL.md, What to do when a check cannot pass

- Hook time limits in the template: 30 seconds (PreToolUse), 180 seconds (PostToolUse), 1,800 seconds (Stop).
- "A suite that takes more than about two minutes belongs in full checks." This project's `npm run e2e` takes 15 to 25 minutes.

## Relationships

- Agrees with: `CLAUDE.md`, hard rule 3 and the verification rules of 2026-11-14 (no weakened test; nothing finished on a failing check).
- Contradicts or strains:
  - The skill wants `SPEC.md` as the definition of done; this project's approved plan is `PLAN.md`. The owner decided on 2026-11-15: a short `SPEC.md` that points to `PLAN.md`.
  - The skill wants one feature per session and a `/clear` between features; `PROGRESS.md` already serves as the hand-over.
  - The skill's reviewer is one subagent; hard rule 12 asks for three red-team reviewers, and decision D55 says that the builder asks before each helper.
  - `unlock` and `relock` need a terminal; a cloud session gives the owner none. The owner decided: the protected list starts empty.
  - The skill names its hand-over file `progress.md`; this project has `PROGRESS.md`. On a file system that ignores letter case the two are one file.

## Raw notes (optional)

The skill says it was tested on Linux. A hook whose Python is missing fails open: the action goes ahead unchecked.
