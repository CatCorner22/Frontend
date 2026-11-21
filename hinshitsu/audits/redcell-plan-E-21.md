a7745bca376134faa

identifier: not visible to me

Commit under review: 219108a (the working tree stood at 18ed863, 1 unpushed hinshitsu-only commit later; `git diff` of the product between them was not needed and not run). I changed no file of the repository. My test pages and result folders are under `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/`.

## Verdict

PLAN SURVIVES WITH CHANGES

The plan's method (test first, 1 commit per fix, removal of the fix by an auditor) is sound. Its bug list is not: the list of 16 leaves out part-open rows of the same grade, and 2 of the 7 planned closures would close a row by a test that does not prove the row closed.

## Premises attacked

### P1. "The 16 rows are all open rows of grade blocker or major" (listed in part: A-1 covers rows called repaired; no entry covers the filter that made the list)

- If false: the run reports "all blockers and majors closed or kept with a reason", the owner reads that, and a blocker that is still part-open is in neither state.
- EVIDENCE (I ran it): a script over `redteam/FINDINGS.md` found 287 rows of grade blocker or major. Rows not in `evidence/open-major-859c643.txt` whose Status itself says a part is open include:
  - **G-S04 (blocker)**: "Repaired in feature F038 in part ... Not repaired, and stated in every receipt: a change made by a timer of a script, or later than about five seconds." This is a status-0-on-a-wrong-page row, the kind the USER put first (O1).
  - **M-01 (blocker)**: "Fixed in part ... Still open: the private page's host has not been checked."
  - **R-S03 (blocker)**: "Repaired in code ... Open: no test with a listener proves it."
  - Majors: A1-05 ("Open: a page script can still change the page itself"), G-S10, G-U07, R-U03 ("Not changed: the count"), M-06, T6-08 ("Open: the question itself"), FTU-18, FTU-26, FTU-31, U2-02, U5-03, U5-07, CR-EN2, CR-SC0, CR-GX2, X-02, C-07, A1-09, U8-05, H7-01, R23-01.
- None of these ids occurs in `evidence/open-findings-859c643.txt` either (grep count 0 for each of 29 ids), so the "165 open rows" of E-10 is also an undercount.
- The evidence file's own header says it lists rows "whose Status begins Open / Repaired in part / Stated / Not repaired", yet it lists FTU-21 ("Fixed in part on screen") and R-12 ("Corrected:") and omits M-01 ("Fixed in part:") and G-S04 ("Repaired in feature F038 in part"). The filter is not the one described and a third party cannot repeat it.
- FTU-22, a listed row, ends "Closed on 2026-11-15". The list holds a closed row and misses open ones.

### P2. A-5: "a second reading at 2 device pixels finds a design that a page shows only on a high-density screen" (listed; "not verified")

- If false: G-S05 is marked closed (state a), the receipt drops or weakens its sentence on high-density screens, and a builder's page that shows another design on a real phone gets "No deviation. Status 0".
- EVIDENCE (I ran the Fit check, trial 001's Mockup as the build against `plugin/fit/trials/001/files`; baseline status 0). I added one style block that turns every element red, green, square and Comic Sans under a media condition:

| Condition | Result today |
|---|---|
| `(min-width: 1px)` (control) | 4 deviations, status 1 |
| `(min-resolution: 2.5dppx)` | No deviation, status 0 |
| `(pointer: coarse)` | No deviation, status 0 |
| `(prefers-color-scheme: dark)` | No deviation, status 0 |
| `(min-width: 1281px)` | No deviation, status 0 |
| `(min-width: 400px) and (max-width: 700px)` | No deviation, status 0 |
| `(min-height: 801px)` | No deviation, status 0 |
| `(prefers-contrast: more)` | No deviation, status 0 |

- A reading at exactly 2 dppx catches the plan's own test page (`min-resolution: 1.5dppx`) and nothing else in this table. Many phones report 3 dppx (2.5dppx row); every touch phone matches `pointer: coarse`. The hole is "any media condition the program does not sample", not "density 2".
- The Mockup itself uses `(hover: hover) and (pointer: fine)` 5 times and breakpoints at 600, 720, 860 and 960 pixels; the program reads 375, 768 and 1280, so the Vision's own bands 600 to 719 and 860 to 959 are never read.
- Test that settles it: after step 1, the 7 pages above; G-S05 is closed only if each gets status 1.

### P3. "A page with `<template shadowrootmode="closed">` that gets status 1 proves the A2-V4 fix" (not listed; near A-4)

- If false: the test passes for another reason, with or without the fix, and A2-V4 is closed on it.
- EVIDENCE (I ran it, today's code, no fix): two natural fixtures already get status 1.
  - A closed root in a host that covers the page: "No deviation; 27 things could not be measured ... Status 1" (the covered-text rule of R-S04 fires).
  - A closed root in a plain `<section>` with padding: "1 deviation ... Status 1"; the deviation is in the width measure (sideways scrolling). Colors, typefaces and radii each say "0 deviations; 0 not measured" although the root draws red on green in another typeface.
- So the fault is real today, and "status 1" alone cannot tell the fixed program from the unfixed one. The same weakness applies to step 4 ("status 2 within 5 seconds") only if the pipe is refused for another reason; I did not run step 4's case.

### P4. "What the RECIPIENT receives is the page built by `npm run build:page`" (not listed; C3 rests on it)

- G11 says the owner opens the private page, Version 26, built at 523ae8e. C3 tests `apps/studio/dist/artifact/refraction-studio.html`.
- EVIDENCE: `git diff --stat 523ae8e..HEAD -- packages/core apps/studio/src` printed nothing, so the two agree at 219108a. The premise holds today.
- It breaks the moment this run fixes anything in `packages/core` or `apps/studio/src`: C3 then passes on a page the owner does not have. A-9 and G11 speak only of "a change to a screen"; a fix to the Vision writer changes no screen and changes every downloaded Vision.

### P5. "U7-02 will be closed" (C1, state a) against "only if the USER wants it" (PLAN step 7) against A-9 "no fix changes a screen"

- Three records, three answers. If the USER says no, C1 as written fails for U7-02; if yes, A-9 is false, the page must be published, and `CLAUDE.md` verification rule 2 requires the whole `npm run e2e` before the commit, where the plan says "the browser tests of the part changed".
- EVIDENCE: the three texts, read at 219108a.

### P6. "The run pushes to the working branch only" (C5) against E-4

- E-4 says: "a push to the shared branch `claude/brave-mayer-sawqz9` ... may follow". The current branch is `claude/festive-mendel-lfnahh`; pull request 24 goes from it into `claude/brave-mayer-sawqz9` (GitHub REST, read by me: 24 open, head 219108a). E-4 names the base of the pull request as a push target. O2 says the USER keeps the merge.

### P7. "The named tests cover what the CRITERIA say" (not listed)

- C4 says "for each of the 3 stored trials and for the reference build". The named test's title is "says nothing in the receipt that disagrees with its own summary line, for the three stored trials". The reference build is not in it.
- C7 says 4 commands. The existing test is "has three commands ..." over `fit-build`, `fit-check`, `fit-repair`; `fit-look` is outside it. C7's new test compares options and statuses only; "what the owner does next" and the 4 command names rest on a reading.
- C6's command holds a placeholder, `<living-reference>/refresh_reference.py`; a third party cannot run it as written.

### P8. Older decision: "a limit stated in the receipt is an acceptable end for a status-0 hole" (E-9, row O1: "except those stated in the receipt"; D79 by analogy)

- Every run in P2 printed "No deviation ... Status 0" on the command line; the limit stands on line 80 of `RECEIPT.md`. The owner is not a programmer and the commands act on the status. By this clause G-S05 needed no fix at all, and R-S06's rest, G-S11 and R-S08 are kept without an attempt although each is a wrong page at status 0. The plan gives no reason why code cannot close them.

### Premises I checked that held

- C2's count: pull request 16 holds 3 review comments by the automatic reviewer, on `collect.ts`, `collect.ts`, `floors.ts`, with the 3 subjects C2 names (REST, first 12 lines read).
- C5's check names: `ci.yml` has a job with `name: Outside validators`; `npm run e2e` includes `plugin/fit/e2e` and `apps/studio/e2e`.
- `deliverable.e2e.ts`, the 3 trials and the 4 command files exist.

Not run: `npm run e2e`, `npm run check`, the R-S08, R-S09 and R-S11 triggers, GitHub's check runs for 219108a, and a reading of `feature_list.json` (the project's hook refused my read-only command twice, so whether the plan's fixes are features of the build loop is unverified).

## The cheating agent

Cheapest path: move every hard row to state (b). State (b) needs only a sentence and the words "the owner". 9 of 16 rows are already planned there before any attempt, and no rule requires proof that the owner was asked or that a code fix was tried. Second path: for state (a), write the fixture that the fix was built for (exactly 1.5dppx; any closed shadow root). The auditor's removal test of C1 catches a test that does not depend on the fix; it does not catch a test that depends on the fix and proves less than the row says. No rule catches that; only an AUDITOR who writes a second trigger would.

## Findings

1. BLOCKER · `hinshitsu/evidence/open-major-859c643.txt`, C1 · trigger: list the rows of `redteam/FINDINGS.md` with grade blocker or major whose Status holds "in part", "Still open", "Open:" or "Not repaired", and compare with the 16 · violates V1 ("all current bugs"), C1's own count, and the header of the evidence file. Missing at least G-S04, M-01, R-S03 (blockers) and about 20 majors.
2. BLOCKER · PLAN step 1, C1 state (a) for G-S05 · trigger: the 7 pages of P2 through `node plugin/fit/src/cli.ts`; each gives status 0 today, and 6 of them are untouched by a reading at 2 dppx · violates C1 (a row called closed whose trigger still passes), `CLAUDE.md` hard rule 13, O1.
3. BLOCKER · PLAN step 2, its test · trigger: the 2 pages of P3; both give status 1 before any fix · violates the plan's own rule "write the test, see it fail" and PREMISE A-4.
4. BLOCKER · C3, G11, A-9 · trigger: change any line of `packages/core` that `writeVision` uses, run C3's test (passes), open the private page (unchanged) · violates V2: the deliverable test passes on a page the RECIPIENT does not hold.
5. BLOCKER · C1, PLAN step 7, A-9 · trigger: read the 3 texts · violates rule of one CRITERION one outcome; and `CLAUDE.md` verification rule 2 if the fix is made with only "the browser tests of the part changed".
6. BLOCKER · C4 and C7 · trigger: `grep -n "three stored trials\|has three commands" plugin/fit/e2e/exit.e2e.ts` · the named tests do not cover "the reference build" (C4) or the fourth command (C7).
7. BLOCKER · E-4 against C5 · trigger: read E-4 and `gh api repos/<owner>/<repo>/pulls/24` · the log names `claude/brave-mayer-sawqz9` as a push target; C5 and O2 forbid it.
8. BLOCKER · C6 · trigger: run the command as written · `<living-reference>` is not a path.

## Changes demanded

1. Rebuild the bug list by a stated, repeatable rule over the Status text (not its first word), save the command and its output, and give each added row (G-S04, M-01, R-S03 and the majors) a planned state. Take FTU-22 out or say why a row that says "Closed" is listed. Correct "165".
2. G-S05: either read the build's style rules and count every media condition that the program did not sample as "not measured" (status 1), allowing the conditions the Mockup itself uses; or keep the 2 dppx reading and leave G-S05 part-open, state (b), with the receipt sentence kept. Its test set is the 7 pages of P2 plus the clean builds of all Directions. Add widths, or the same rule, for the Mockup's own unread bands (600 to 719, 860 to 959).
3. Every state-(a) test asserts the cause, not only the status: the measure that says "not measured" and the sentence that names the closed shadow root; and the page must give status 0 with the fix's detection removed.
4. C1 state (b) is valid only with the USER's recorded answer on the S6 card for that row, or with a recorded attempt that shows why code cannot close it. Put R-S06's rest, G-S11, R-S08 and G-S04 on the card by name as "wrong page, status 0".
5. Decide U7-02 on the S6 card before the CRITERIA are approved; write one outcome into C1, the plan and A-9. If it is fixed, the whole `npm run e2e` runs before that commit.
6. C3 and G11: a fix to anything the built page contains (not only a screen) either leads to a new published version on the USER's word, or the final report says in its first lines that the private page still hands over the old Vision.
7. C4: extend the named test to the reference build, or take those words out. C7: the test also checks the 4 command names against `plugin/commands/`. C6: write the real path.
8. Correct E-4 by a new entry: the run pushes to `claude/festive-mendel-lfnahh` only.

`## Premortem` is for the attack before delivery (S9); this is the attack on the plan, so none is written here.
