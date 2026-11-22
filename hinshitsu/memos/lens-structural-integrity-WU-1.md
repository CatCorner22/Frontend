a6517fb885dd7c820

identifier: not visible to me

Checks I ran: read `PLAN.md`, `FRAMEWORK.md`, `CONNECTIONS.md`, the FINDING entries tagged "structural integrity", E-282 and E-285; `git status` and `git diff` at head `eaab1ff`; greps of the cited lines; 1 Fit check run (`reference-floors/mockup.html` against `reference-floors`). I ran no test suite.

## Does this WORK UNIT or its FINDINGS change the plan

yes

- Commit 21 is not at the head. `git status` at `eaab1ff` shows 9 changed product files uncommitted, and `PROGRESS.md` (working tree, line 111) already describes "commit 21". `PLAN.md` line 41 and the scope both describe the fix round as done.
- `PLAN.md` line 41 says commit 21 "hardens the deliverable test". The working tree also changes `packages/core/src/vision.ts` line 331 (a sentence of every `VISION.md`), `plugin/fit/src/collect.ts` line 495 and `plugin/fit/src/fit.ts` line 638. The plan has no row for these.
- The change in `vision.ts` repairs row G-U15 (`redteam/FINDINGS.md` line 737, Status "Open: not yet repaired"). `redteam/FINDINGS.md` is unchanged in the working tree, so the fix lacks its record (C5). G-U15 is a minor row, which `PLAN.md` line 49 places outside the plan.
- A change in `packages/core` moves 2 edges of `CONNECTIONS.md`. The edge to `reference-floors` is followed (its `VISION.md` is updated in the tree). The edge to `apps/studio` changes the bytes of the built page, which C3's `Summary` compares with commit 523ae8e.
- F-123 is repaired in part. `docs/reference/guarantees.md` line 962 still says "a Claude Code plugin with the commands `fit-build`, `fit-check`, and `fit-repair`", and the same line says "The four commands".
- F-121, F-122, F-124 and F-125 read as repaired at the head (`SPEC.md` lines 481 and 489; `PROGRESS.md` lines 28, 34 and 830). The log holds no closing entry for them: its only RESOLUTION entries are E-283 and E-284 (C9).

## Does it change a CRITERION

yes, for C3 and C4, whichever way the USER answers; the alternative in each case is a change of code.

**Question 1 (C3; F-65, F-113).**
- The working-tree test `apps/studio/e2e/deliverable.e2e.ts` (the new block after line 124) expects `--font-numeric` to be empty at the root. C3 asks for a non-empty value for each property. The named test and the CRITERION now state opposite things.
- To keep the value, C3 needs a CRITERIA-CHANGE that names this 1 property and its contract: a rule that uses it as `font-family` gets the typeface around the number.
- That contract holds for the Mockup, which uses only `font-family: var(--font-numeric)`, 2 times (`reference-floors/mockup.html`). `tokens.json` line 859 carries the string "inherit" where no CSS rule applies. I did not check the `font:` shorthand.
- To change the value (`packages/core/src/tokens.ts` line 575) alters every fingerprint (row DV-01, `redteam/FINDINGS.md` line 875). That moves the 4 stored Vision folders, their receipts' SHA-256 (C8), the freshness test of `reference-floors`, and the bytes of the built page.
- Under my concern the parts fit with fewer moved edges if the value stays and C3 states the exception.

**Question 2 (C4; F-55, F-74, F-112).**
- 3 parts hold 2 rules. `plugin/fit/src/fit.ts` lines 586 to 591 and `plugin/README.md` lines 58 and 62 say that an unread contrast never changes the status.
- C4's text, and its test at `plugin/fit/e2e/exit.e2e.ts` lines 699 and 707 to 711, count Contrast where Floor A1 is written.
- The test passes only because the fifth case ends with status 1 for another reason. My run gave: "8 deviations; the contrast of 27 readings of 3 texts could not be read … Status 1"; the Contrast head says "0 deviations; 27 readings of 3 texts not measured".
- `exit.e2e.ts` lines 44 to 49 assert status 0 for a Vision whose Contrast is "required by Floor A1". `fit.ts` line 588 says the Mockup itself holds unread texts.
- If C4 stays as worded, `fit.ts` line 591, that M7 test, the guide and `fit-check.md` all change, and a Vision with Floor A1 may never reach status 0 on its own Mockup (inferred, not run).
- If the program's rule stays, C4 needs a CRITERIA-CHANGE, and line 699 of the test follows it.

## Does it change a later WORK UNIT

no

- The plan holds no later WORK UNIT (`PLAN.md` line 37; the scope's line on what the plan holds after WU-1).
- S8 to S10 need a head that holds commit 21: the recipient-side check and the final AUDITOR's 2 builds read a built page that `vision.ts` line 331 changes.
- The equivalency backlog (D81) is untouched by these findings.
