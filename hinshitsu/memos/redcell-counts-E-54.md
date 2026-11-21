a643889a504d8a80f

## Verdict

AT LEAST 1 COUNTS

## Each unlisted PREMISE

The report (`hinshitsu/audits/redcell-plan-E-21.md`, read whole at 7e5015d) marks 3 PREMISES "not listed": P3, P4, P7. All 3 count.

| PREMISE | Counts or does not count | Reason | Lines |
|---|---|---|---|
| P3. A page with `<template shadowrootmode="closed">` that gets status 1 proves the A2-V4 fix | counts | Absent from E-13: A-4 speaks of tests in general, not of this fixture. Concrete failure stated: the test passes with or without the fix, and A2-V4 is closed on it. EVIDENCE pasted: 2 receipt lines from 2 pages run on unfixed code, both status 1. I confirmed the content of both lines in the RED CELL's saved receipts (see Commands run); I could not re-run the Fit check myself. Finding 3 also names the settling test (the 2 pages before any fix). | 47-53, 96 |
| P4. What the RECIPIENT receives is the page built by `npm run build:page` | counts | Absent from E-13: A-9 covers "a change to a screen" only. Concrete failure stated: the run fixes something in `packages/core` or `apps/studio/src`, C3 passes, and the owner holds the old page. EVIDENCE pasted: `git diff --stat 523ae8e..HEAD -- packages/core apps/studio/src` printed nothing; I repeated it against 219108a and it printed nothing. That EVIDENCE shows the PREMISE holds today, not the failure itself; the failure is settled by the test that finding 4 names (change a line that `writeVision` uses, run C3, open the private page). The rule accepts a named test. | 55-59, 97 |
| P7. The named tests cover what the CRITERIA say (C4, C7, C6) | counts | Absent from E-13. EVIDENCE pasted and confirmed: the 2 test titles stand at lines 244 and 363 of `plugin/fit/e2e/exit.e2e.ts`; `plugin/commands/` holds 4 files, `fit-look.md` among them; C6 holds the placeholder `<living-reference>`. Weakness: P7 has no "If false" line. The failure is stated only as "the reference build is not in it", "`fit-look` is outside it" and "a third party cannot run it as written"; the consequence (a CRITERION called met by a narrower test) is left to the reader. Of the 3 parts, the C6 part states who does what and what goes wrong most plainly. | 70-74, 99, 101 |

Two notes for the ORCHESTRATOR, outside the table because the report does not mark these "not listed":

- E-24 also takes P1 (as A-10) and P8 (as A-14) to be unlisted. The report marks P1 "listed in part" (line 15) and gives P8 no mark (line 76). P1 states a failure and pastes EVIDENCE (lines 17-25), and would count if the filter is held to be absent from A-1. P8 states a failure (line 78) and rests on the runs of P2; it names no test of its own. The verdict does not depend on either.
- E-24 row A-12 names the page of C3 as `local-test.html`. The report (line 57) and E-14 C3 name `apps/studio/dist/artifact/refraction-studio.html`. I did not check which is right.

## Commands run

No file of the repository was changed (`git status --short` printed nothing before and after).

1. `git show 7e5015d:hinshitsu/prompts/S5-counts-judge.md`: printed the scope file. `git rev-parse HEAD` printed `7e5015d072df184cafb3413541813948fd30d5aa`.
2. `git diff --stat 523ae8e..219108a -- packages/core apps/studio/src | tail -3`: no output, exit 0. Confirms the EVIDENCE of P4.
3. `grep -n "three stored trials\|has three commands" plugin/fit/e2e/exit.e2e.ts`:
   - `244:  it('has three commands that run the program by a path inside the plugin, ...`
   - `363:  it('says nothing in the receipt that disagrees with its own summary line, for the three stored trials (retest findings R-U02, R-U03, R-U04)', ...`
4. `ls plugin/commands`: `fit-build.md fit-check.md fit-look.md fit-repair.md`.
5. `grep -rn "living-reference" hinshitsu/AUDIT-LOG.md`: line 183 (C6) holds `python3 <living-reference>/refresh_reference.py docs/reference/guarantees.md --check`.
6. `node plugin/fit/src/cli.ts <scratchpad>/closed.html plugin/fit/trials/001/files <scratchpad>/judge_closed` and the same for `closed2.html`: both stopped with `The Fit check stopped: browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1254/...`. No reading was made. I removed the 2 empty result folders from the scratchpad.
7. `grep -n -i "status\|deviation" <scratchpad>/r_closed/RECEIPT.md` and `.../r_closed2/RECEIPT.md` (the RED CELL's saved results, dated 18:31):
   - `r_closed`: colors, typefaces, radii each `0 deviations; 0 not measured`; line 50 `0 deviations; 27 not measured` (the covered-text measure). Agrees with report line 51.
   - `r_closed2`: line 54 `1 deviation; 0 not measured` (the width measure); colors, typefaces, radii each `0 deviations; 0 not measured`. Agrees with report line 52.

## Not examined

- A fresh run of the Fit check on the 2 pages of P3: the browser was not found by a direct run, so the status 1 results rest on the RED CELL's saved receipts, not on my own run. I did not read the status line or `receipt.json` in those folders; the measure lines I read imply status 1.
- Whether `closed.html` and `closed2.html` are the "natural fixtures" the report describes (I counted 1 `shadowrootmode` in each and read no more).
- The private page, Version 26, and its build commit 523ae8e (P4, G11): not opened.
- The lines 363 to 390 of `exit.e2e.ts` beyond the 2 titles; whether the reference build is covered by another test.
- P1, P2, P5, P6, P8 as attacks: P2 and (by the report's own marking) P1 are listed; P5, P6 and P8 carry no "not listed" mark. None of their EVIDENCE was re-run.
- E-14 beyond C1 to C3 and C6; `PLAN.md` beyond line 12; the FINDING and RECONCILIATION entries after E-24.
