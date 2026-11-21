# PLAN — Frontend Focus: find and fix the current bugs

Written at S4, before the LENS memos and the RED CELL attack (S5). The CRITERIA are in `AUDIT-LOG.md` entry E-14 (`PROPOSED`); the PREMISES in E-13; the gaps in E-10; the RECIPIENTS and the USER's words in E-9. Nothing below is built yet.

## Order of work (S7)

1 commit for each fix, on the branch `claude/festive-mendel-lfnahh`. For each fix: write the test, see it fail, change the code, see it pass, run `npm run check`, run the browser tests of the part changed, write the record (`redteam/FINDINGS.md` row, `SPEC.md`, `PROGRESS.md`), commit, push.

| Step | Fix | Row | Files | Test |
|---|---|---|---|---|
| 1 | The Fit check reads the page a second time at 2 device pixels for 1 CSS pixel; a design that shows only there counts | G-S05 | `plugin/fit/src/fit.ts` | a page with `@media (min-resolution: 1.5dppx)` that paints red gets a colors deviation; all Directions' clean builds stay status 0 |
| 2 | A declarative shadow root that is closed counts as not measured, where today it is only stated | A2-V4 | `plugin/fit/src/collect.ts`, `fit.ts` | a page with `<template shadowrootmode="closed">` gets status 1 |
| 3 | The look writes a typeface name from the Vision folder into `LOOK.md` only inside a fence or as a cleaned name | R-S09 | `plugin/fit/src/look.ts` | the hostile `tokens.css` of the retest puts no sentence outside a fence |
| 4 | The look refuses a file that is not an ordinary file, and ends within its time limit on a busy page | R-S11 | `plugin/fit/src/look-cli.ts`, `look.ts` | a named pipe gives status 2 within 5 seconds; a busy page ends within the limit |
| 5 | The 3 findings of the automatic reviewer: verify each with a test, fix the true ones | C2 | `plugin/fit/src/collect.ts`, `floors.ts` | 3 tests |
| 6 | The guide names 4 commands, each option and each status of both programs; a test compares it with the usage lines | R-U05, C7 | `plugin/README.md`, `plugin/fit/e2e/exit.e2e.ts` | the new test |
| 7 | Several presses of Enter on "Pick … and continue" | U7-02 | `apps/studio/src/App.tsx` | only if the USER wants it changed (it changes a screen) |
| 8 | The records' stale sentences | R-T06, C6 | `PROGRESS.md`, `SPEC.md` | the framework-drift auditor's reading |
| 9 | The rows that stay: each gets its reason and who must act | R-12, FTU-21, FTU-22, FTU-32, P9-05, G-S11, G-T08, R-S06, R-S08 | `redteam/FINDINGS.md` | the correctness auditor's reading |

## WORK UNITS proposed

The USER is asked on the S6 card for 1 audit round over the finished set (rule 13.4). If the USER agrees: WU-1 is the whole set of fixes above. If not: WU-1 `plugin/fit/src` (steps 1, 2, 5), WU-2 the look (steps 3, 4), WU-3 the guide and the records (steps 6, 8, 9), WU-4 the Studio (step 7), each with its own audit round.

## What the audit round checks

Roles 1 to 7 of section 13 on the final commit, with 1 planted defect by a seeder in a copy; S8 (the Vision as its RECIPIENT gets it, and 3 repeated runs for stability); S9 (the RED CELL before delivery); S10 (the final AUDITOR).

## Not in the plan

The 149 open rows of grade minor and note; the phone-wide layout (FTU-32); a run of the commands inside Claude Code (G-T08); the owner's trial (M4); a merge into the main line (the USER's own act).
