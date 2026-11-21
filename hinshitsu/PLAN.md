# PLAN — Frontend Focus: find and fix the current bugs

Rewritten at S5 after the 4 LENS memos, the RED CELL's attack and the language audit (`AUDIT-LOG.md` E-55, the `RECONCILIATION` entry). The first plan is in git at commit 219108a. The CRITERIA are in E-56 (`PROPOSED`); the PREMISES in E-13 and E-24; the gaps in E-10; the RECIPIENTS and the USER's words in E-9. Nothing below is built yet, and nothing is built before the USER answers the S6 card.

## Order of work (S7)

1 commit for each step, on the branch `claude/festive-mendel-lfnahh`. For each step: write the test, see it fail for the cause that the row names, change the code, see it pass, write the 3 stored trial receipts again with the program where the receipt's wording changes, run `npm run check`, run `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e`, write the record (the row of `redteam/FINDINGS.md`, `SPEC.md` where behavior changes, `PROGRESS.md`), commit, push. No step changes a screen of the Studio.

| Step | Fix | Row | Files | Test |
|---|---|---|---|---|
| 1 | The 3 findings of the automatic reviewer: 1 test each; fix each true one | C2 | `plugin/fit/src/collect.ts`, `floors.ts`; `plugin/fit/e2e/fit.e2e.ts` | 3 tests whose titles name the findings |
| 2 | A media condition in the build, other than width and height, that the Vision's `mockup.html` does not hold (pixel density, pointer, hover, color scheme, and the rest) makes colors, typefaces, corner radii and content "not measured", and the receipt lists each such condition. The look states in `LOOK.md` the pixel density at which it drew | G-S05 | `plugin/fit/src/collect.ts`, `fit.ts`, `receipt.ts`, `look.ts`; the 3 stored receipts; `plugin/README.md`; `docs/reference/guarantees.md`; `SPEC.md` | the 7 pages of the RED CELL's P2 (the 5 with such a condition get status 1 and the receipt names the condition; the 2 width and height pages are recorded as the kept part); the reference builds of all Directions stay status 0; with the detection taken out the 5 pages give status 0 |
| 3 | A closed shadow root makes the measures "not measured" and the receipt names it | A2-V4 | `plugin/fit/src/collect.ts`, `fit.ts`, `receipt.ts`; the stored receipts; `SPEC.md` | 2 pages: a declarative closed root whose content differs from the Vision, and a closed root that a script makes under `--run-scripts`; each asserts the measure and the sentence; each gives the old result with the detection taken out |
| 4 | Where the Vision does not write Floor A1, a required text whose color equals its background counts as a missing text (if the USER answers so on the card) | R-S08 | `plugin/fit/src/fit.ts`, `receipt.ts`; `SPEC.md` | the page of the retest gets a Content deviation |
| 5 | The receipt states a SHA-256 of each Vision file read and the number of Floor requirements read; a later round says when a Vision file differs | C8 | `plugin/fit/src/vision.ts`, `receipt.ts`, `cli.ts`; the stored receipts; `plugin/README.md` | the test of C8 |
| 6 | The look writes a typeface name from the Vision folder into `LOOK.md` only inside a fence, or with every character outside letters, digits, space and hyphen removed. The look refuses a file that is not an ordinary file, and stops a page whose script never returns after 30 seconds | R-S09, R-S11 | `plugin/fit/src/look.ts`, `look-cli.ts`; `plugin/fit/e2e/look.e2e.ts` | the hostile `tokens.css` of the retest puts no sentence outside a fence; a named pipe gives status 2 within 5 seconds; a page with `while(true){}` under `--run-scripts` ends with status 2 within 40 seconds |
| 7 | A test with a UDP listener proves that the look under `--run-scripts` sends no WebRTC packet | R-S03 | `plugin/fit/e2e/look.e2e.ts` | the listener receives nothing; with the replacement of WebRTC taken out it receives a packet |
| 8 | The guide as C7 states it; the 2 cases of status 1 in the guide and in 2 commands; the message for a missing browser; the receipt's wording of findings F-16 and F-17 (units of contrast; "nothing to check") | R-U05, C4, C7 | `plugin/README.md`, `plugin/commands/fit-check.md`, `fit-repair.md`, `plugin/fit/src/receipt.ts`, `cli.ts`, `look-cli.ts`; the stored receipts; `plugin/fit/e2e/exit.e2e.ts` | the tests of C4 and C7 |
| 9 | The deliverable test: the fragment inside `local-test.html` equals `refraction-studio.html` | C3 | `apps/studio/e2e/deliverable.e2e.ts` | the new test |
| 10 | Each of the 44 rows gets its state, its reason and who must act; 2 banned words leave the row R-S08 and a comment in `look.ts` | C1 | `redteam/FINDINGS.md`, `plugin/fit/src/look.ts` | the correctness auditor's and the framework-drift auditor's reading |
| 11 | The records: counts, "Start here", "Known gaps" with the list of rows that wait for the owner; the guarantees reference | R-T06, G-U07, C6 | `PROGRESS.md`, `SPEC.md`, `docs/reference/guarantees.md`, `plugin/fit/trials/003/RECORD.md` | the framework-drift auditor's reading; the command of C6 |

## WORK UNITS proposed

The USER is asked on the S6 card for 1 audit round over the finished set. If the USER agrees: WU-1 is steps 1 to 11. If not: WU-1 `plugin/` (steps 1 to 8) and WU-2 the deliverable test and the records (steps 9 to 11), each with its own audit round.

## What the audit round checks

Roles 1 to 7 of the audit skill on the final commit; a seeder plants 1 defect in a copy of each program changed (`collect.ts`, `fit.ts`, `receipt.ts`, `look.ts`); then the Vision as its RECIPIENT gets it, and 3 repeated runs for stability; the RED CELL before delivery; the final AUDITOR. A new SUB-AGENT re-runs the trigger of each open FINDING F-1 to F-28 on the plan before the build starts.

## Not in the plan

The open rows of grade minor and note. The 19 rows on screens of the Studio (next run, if the USER answers so). The Mockup's unread width bands (600 to 719 and 860 to 959 pixels) and a build's own width conditions: kept part of G-S05. G14 and G15 of E-10: no step; they concern the run's own cost and are answered on the card. A run of the commands inside Claude Code (G-T08). The owner's trial (M4). A new version of the private page and a merge into the main line: the USER's own acts.
