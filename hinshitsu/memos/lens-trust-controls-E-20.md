a7bdca52b41a599bb

identifier: not visible to me

## What breaks

1. **For the owner: a status 0 that the repairing model can produce alone, with no change to the page.** The receipt names the Vision only by the 8-sign fingerprint, which covers the design values of `tokens.css` alone (`plugin/fit/src/vision.ts:106-110`; open row C7-07). The Floors (`VISION.md` section 7, `floors.ts:175-181`) and the 3 required texts (`mockup.html`) are outside it. `/fit-repair` pre-approves `Write` and `Edit` on any path (`plugin/commands/fit-repair.md:4`); only a sentence forbids a change to the Vision (line 12, step 3). Reproduced at 219108a: copy `plugin/fit/trials/003/files`, delete section 7 from `VISION.md`, run `node plugin/fit/src/cli.ts trials/003/index.html <copy> <out>`. Unchanged Vision: "1 thing could not be measured. Status 1". Changed Vision: "No deviation ... Status 0". Both receipts print the same fingerprint `7776d35d` and the same SHA-256 of the build. The owner cannot tell the 2 receipts' Visions apart. This is O1 of E-9 (a wrong page that reads as passed), and no CRITERION covers it.
2. **For the owner: G-S05 would be called closed while it stays open.** Step 1 adds 1 reading at 2 device pixels (`PLAN.md:11`; today `deviceScaleFactor: 1`, `fit.ts:168`). A page with `@media (min-resolution: 2.5dppx)` shows on a 3-times phone and on neither reading. Not run: the fix does not exist yet; this follows from the plan's text and PREMISE A-5.
3. **For a later session: C1's state (b) is met by the builder alone.** Any row "ends" correctly once the builder writes a reason (E-14, C1). G-S11's reason is "the Vision folder is trusted as the owner's own" (`evidence/open-major-859c643.txt`, row G-S11); point 1 shows that a model holds write access to that folder.
4. **For the owner: 1 planted defect guards 7 fixes in 4 programs** (`PLAN.md:23,27`), and PREMISE A-4 (a passing test proves the behavior) rests on that seeder alone (E-13).

## What to cut

- The word "closed" for G-S05 in C1's planned state (a), unless point 2 is answered (E-14, C1).
- "Closed" for A2-V4 beyond the declarative case: step 2 tests `<template shadowrootmode="closed">` only (`PLAN.md:12`). A closed root that a script makes under `--run-scripts` is not in the test. I did not run that case.
- FTU-22 from the "kept" list: its Status already reads "Closed on 2026-11-15" (`evidence/open-major-859c643.txt`, row FTU-22).

## What to add

- To step 1: the Fit check reads the page's style sheets (`collect.ts:150`); count as "not measured" every `@media` condition on resolution that neither reading matches. Then G-S05 can be closed truthfully.
- To C1: each row in state (b) whose reason is a judgment carries the USER's word from the S6 card, by entry number. R-S08 already needs it (E-10, G13); G-S11 and the rest of R-S06 do too.
- To the audit round: 1 planted defect for each program changed (`fit.ts`, `collect.ts`, `look.ts`, `look-cli.ts`), not 1 in all (`PLAN.md:27`).
- To step 6: the guide's sentence "The Fit check trusts the Vision folder" (`plugin/README.md:9`) also states that the repair command can write there.

## The 1 change this lens insists on

Add a step and a CRITERION: the receipt states a SHA-256 for each of the 4 Vision files that the program reads (`READ_FILES`, `vision.ts:8`), beside the build's (`receipt.ts:27`), and states how many Floor requirements it read. After round 0, the program refuses (status 2) when a Vision file differs from the last receipt's. Test: the reproduction of point 1 gives status 2, or 2 receipts with different hashes.

## Checked and found sound

- The receipt ties itself to the build by SHA-256 (`fit.ts:528`), and an old receipt is deleted before any refusal (`cli.ts:93`).
- A hand-changed design value is refused: the fingerprint is recomputed from `tokens.css` (`vision.ts:106-110`).
- No command pre-approves a program: `allowed-tools` holds `Read`, `Write`, `Edit` only (`plugin/commands/*.md`, line 4 of each).
- GitHub's check runs on every push and every pull request, runs `npm run e2e`, and has no step that may fail silently (`.github/workflows/ci.yml:4-6,42`); PREMISE A-2 holds as far as the file shows. I did not read a check run on GitHub.
- The run pushes to the working branch only, and the merge stays with the USER (E-9, O2; E-14, C5).

Checks run: 3 Fit check runs under the scratchpad (trial 001 baseline; trial 003 with the Vision unchanged and with section 7 removed). No file of the repository was changed.
