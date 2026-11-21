# FRAMEWORK — Frontend Focus: find and fix the current bugs

Form required by section 7 (`skills/hinshitsu-record/SKILL.md`). A superseded line is marked `(superseded <date> → <ID>)` and stays. IDs are assigned once and never reused.

## 1. CRITERIA

No `CRITERIA` entry exists yet. It is written at S4 as `PROPOSED` and controls from then on, with each later `CRITERIA-CHANGE` entry. (superseded 2026-11-21 → E-56)

The CRITERIA are in `AUDIT-LOG.md` E-68 (`FROZEN`, the USER's approval quoted there); E-14 and E-56 are the earlier `PROPOSED` texts.

## 2. Architecture decisions

| ID | Decision | Log entry |
|---|---|---|
| (none yet) | | | (superseded 2026-11-21 → D-1)
| D-1 | The bug list of C1 is made by a stated rule over the Status text | E-57 |
| D-2 | GitHub's check stands for the whole browser suite | E-58 |
| D-3 | Each fix is proven by a test that asserts the cause | E-59 |
| D-5 | The AUDITORS run the tests that the CRITERIA name | E-60 |
| D-4, D-6, D-7 | wait for the USER's answer on the S6 card | — | (superseded 2026-11-21 → E-69, E-70, E-71)
| D-4 | G-S05: a media condition other than width and height that the Mockup lacks makes the measures "not measured" | E-69 |
| D-6 | WU-1 is steps 1 to 11 of `PLAN.md`; 1 audit round over the finished set | E-70 |
| D-7 | This run publishes no new version of the private page | E-71 |

Decisions of the project itself are in `DECISIONS.md` at the repository root (D1 to D79). This run cites them by that file and number and does not copy them.

## 3. Naming conventions

- Defined terms of the product: the table in `CLAUDE.md` (Step, Direction, Option, Decision, Mockup, Template, Catalog, Craft rule, Floor, Brief, Research rule, Vision, Fit check, Honest receipt, Skin, Overlay, Taste ledger, Waypoint). One term for one concept.
- App name "Frontend Focus"; export bundle "Vision" (`VISION.md`). Package names and storage keys keep "refraction" (project decision D75).
- Findings of the project's own log: `redteam/FINDINGS.md`, IDs such as R-S08. Findings of this run: `F-<n>` in `AUDIT-LOG.md`. The 2 ID sets are separate; a `FINDING` entry of this run that repeats a project row names that row.
- Times: UTC, from `date -u`. Commit IDs: copied from `git` output.
- Words that the run's artifacts do not use: the banned list of the conductor.

## 4. Contracts

| Provider | Consumer | What is promised |
|---|---|---|
| `packages/core` (`writeVision`) | `apps/studio` (Summary, downloads) | the 7 files of the Vision, as text, from 1 project |
| `apps/studio` (built page `apps/studio/dist/artifact/refraction-studio.html`) | the owner in a browser | Steps, saving, and the download of the Vision |
| the Vision's 7 files | `plugin/fit` (Fit check, look) | `tokens.json`, `tokens.css`, `mockup.html`, `VISION.md` with one fingerprint |
| `plugin/fit/src/cli.ts` | the owner, and the commands in `plugin/commands/` | status 0, 1 or 2; `RECEIPT.md` and `receipt.json` in the result folder |
| `plugin/fit/src/look-cli.ts` (the look) | the owner, and `plugin/commands/fit-look.md` | status 0 (every window width was pictured), 1 (at least 1 was not) or 2 (the program refused and wrote nothing); `LOOK.md` and pictures in the result folder; it draws and measures nothing |
| `npm run check`, `npm run e2e` | every change | the project's own tests; a change is committed only when they pass (`CLAUDE.md`, verification rules) |

## 5. File ownership

| Path | BUILDER | AUDITORS |
|---|---|---|
| `packages/core/**`, `apps/studio/**`, `plugin/**`, `scripts/**`, `.github/**`, `docs/**`, root records | the ORCHESTRATOR (it holds the BUILDER role, rule 1.4) | SUB-AGENTS in the roles of section 13, the final AUDITOR |
| `hinshitsu/**` (the RUN FOLDER) | the ORCHESTRATOR keeps it; reports under `audits/` and `memos/` are saved whole and not edited | the framework-drift auditor, the final AUDITOR |

## 6. WORK UNITS

| ID | Content | Status | LENS memo | Swarm reports |
|---|---|---|---|---|
| (none declared yet; declared at S6, before S7) | | | | | (superseded 2026-11-21 → WU-1)
| WU-1 | steps 1 to 11 of `PLAN.md` | declared (E-70); not started | — | — |

## 7. Existing implementations checked

| Looked for | Where | Result |
|---|---|---|
| a list of the current open bugs | `redteam/FINDINGS.md`, `SPEC.md` section 2.29, `PROGRESS.md` ("Known gaps"), review comments on pull requests 16 and 24 | found: the project keeps its own list; S3 reads it and does not write a second list of the same rows |

<!-- from the log: start -->
Rebuilt by `scripts/hinshitsu_log.py state`. Do not edit between the marks.
- Newest CRITERIA entry: E-68 (FROZEN)
<!-- from the log: end -->
