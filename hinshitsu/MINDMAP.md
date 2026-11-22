# MINDMAP — Frontend Focus: find and fix the current bugs

Form required by rule 9.2. Every CRITERION, WORK UNIT, decision and FINDING appears once, in both the list and the diagram.

## Hierarchy

- **Goal:** "Once possible, please run Hinshitsu and fix all current bugs, etc."
  - (no CRITERION yet; S4 writes them)

## Diagram

```mermaid
graph TD
  G["Goal: fix all current bugs"]
```

## Node check

| Kind | Count in `AUDIT-LOG.md` | Count in this map |
|---|---|---|
| CRITERIA | 0 | 0 |
| WORK UNITS | 0 | 0 |
| Decisions | 0 | 0 |
| FINDINGS | 0 | 0 |

<!-- from the log: start -->
Rebuilt by `scripts/hinshitsu_log.py state`. Do not edit between the marks.
- F-1 `hinshitsu/evidence/open-major-859c643.txt`, C1 (BLOCKER, FIXED by E-141)
- F-2 PLAN step 1, C1 state (a) for G-S05 (BLOCKER, FIXED by E-124)
- F-3 PLAN step 2, its test (BLOCKER, FIXED by E-73)
- F-4 C3, G11, A-9 (BLOCKER, FIXED by E-74)
- F-5 C1, PLAN step 7, A-9 (BLOCKER, FIXED by E-75)
- F-6 C4 and C7 (BLOCKER, FIXED by E-76)
- F-7 against C5 (BLOCKER, FIXED by E-77)
- F-8 C6 (BLOCKER, FIXED by E-78)
- F-9 C1 lists FTU-32 and G-T08 as inside the CRITERIA, and the closing sentence lists them as outside. (DEFECT, FIXED by E-79)
- F-10 C1 state (b) cannot hold for R-12 and FTU-22, and "exactly 1 of 2 states" cannot hold for R-S06. (DEFECT, FIXED by E-80)
- F-11 U7-02 is planned as closed in C1, optional in the plan, and excluded by PREMISE A-9. (DEFECT, FIXED by E-81)
- F-12 C1 requires a failing test for R-T06 and R-U05 in part; the plan names a reading, not a test, for R-T06. (DEFECT, FIXED by E-82)
- F-13 The translation table in the VOC points 6 rows at CRITERIA that do not say what the row says. (DEFECT, FIXED by E-142)
- F-14 C4 names 4 subjects and a test that covers 3, and the test checks the sum for 1. (DEFECT, FIXED by E-83)
- F-15 "A measure that counts" has no definition, in C4, in the guide, or in the command. (DEFECT, open)
- F-16 The summary line and the receipt count contrast in 2 units, and the receipt names the wrong unit. (DEFECT, open)
- F-17 The receipt says "0 not measured" for Floors where it checked nothing. (DEFECT, open)
- F-18 C5 counts "2 local commands" and names 3 things; "the Fit check's browser tests" has no command. (DEFECT, FIXED by E-84)
- F-19 C6's command holds a placeholder, and checks a file that C6 does not name. (DEFECT, FIXED by E-85)
- F-20 C7's test cannot compare statuses, and does not compare the 4 commands; "technical term" is not bounded. (DEFECT, FIXED by E-86)
- F-21 C3's test opens a different file from the one the CRITERIA call the built Studio page. (DEFECT, FIXED by E-87)
- F-22 C3 holds 5 phrases that a third party cannot test as written. (DEFECT, FIXED by E-88)
- F-23 C2 does not say what a test that "shows a finding false" looks like, and names no test. (DEFECT, FIXED by E-89)
- F-24 One thing has 3 names: "reference build", "clean build", "faithful build". (STYLE, FIXED by E-90)
- F-25 The plan's test column holds 3 vague terms. (STYLE, FIXED by E-91)
- F-26 `FRAMEWORK.md` says in section 1 that no CRITERIA entry exists, and at its end that  is the newest. (DEFECT, FIXED by E-92)
- F-27 The guide and the commands use "the program" for 2 programs, and "receipt" for the defined term "Honest receipt". (STYLE, open)
- F-28 Banned words: 2 occurrences. (STYLE, open)
- F-29 `hinshitsu/PLAN.md` line 12, Test cell of step 2 (DEFECT, FIXED by E-125)
- F-30 , C3 (line 847), the sentence on the published page (DEFECT, FIXED by E-126)
- F-31 , C4 (line 848) (DEFECT, FIXED by E-127)
- F-32 , C1, state (c), against `PLAN.md` line 21 (DEFECT, FIXED by E-128)
- F-33 , C1, the list "(b), a screen of the Studio, for the next run" (DEFECT, FIXED by E-129)
- F-34 , C1, FTU-21 in "(b), waits for an act of the owner" (DEFECT, FIXED by E-130)
- F-35 out-of-date sentences in the RUN FOLDER (DEFECT, FIXED by E-131)
- F-36 , C5 ("Each fix is 1 commit that holds its test and its record") against `PLAN.md` line 7 ("1 commit for each step") (DEFECT, FIXED by E-132)
- F-37 , C6 (line 850) (FRAGILITY, FIXED by E-133)
- F-38 , C3 and C5, the command `npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts` (FRAGILITY, FIXED by E-134)
- F-39 , C3: "(lines 18 to 20)" of `apps/studio/e2e/deliverable.e2e.ts` (FRAGILITY, FIXED by E-135)
- F-40 , C6: "`SPEC.md` sections 2.28 to 2.30" (FRAGILITY, FIXED by E-136)
- F-41 , C7, the list of 13 terms (STYLE, FIXED by E-137)
- F-42 3 loose statements (STYLE, FIXED by E-138)
- F-43 , C4, the clause "a Vision of an edition of the Floors that the program does not read gives no count \"not measured\" for its Floor requirements (row R-U03)". (BLOCKER, FIXED by E-143)
- F-44 , C5, first sentence; and the line "Translation, 1 line changed". (BLOCKER, FIXED by E-144)
- F-45 , C1, the list "(b), the project's own tests, Catalog data and GitHub's check, for the next run, on the same word: X-02, CR-GX2, C-07, A1-09". (BLOCKER, FIXED by E-145)
- F-46 , C3, the sentence on the Summary. (BLOCKER, FIXED by E-146)
- F-47 , C4, "1 reference build (the Vision's own page of trial 001 … this Vision writes no Floor …)". (BLOCKER, FIXED by E-147)
- F-48 , C1, "G-S05 (… kept for width and height conditions, on the USER's word in )". (BLOCKER, FIXED by E-148)
- F-49 , C1, state (c), third reason, and the Test sentence. (BLOCKER, FIXED by E-149)
- F-50 , C6, "(… on a machine without that skill this part of the test is reported UNVERIFIED)". (BLOCKER, FIXED by E-150)
- F-51 , C7, "and `plugin/commands/fit-check.md` does too"; and steps 10 and 11 of `PLAN.md`. (BLOCKER, FIXED by E-151)
- F-52 , C1, "Each of the 49 rows"; , question 1 (a) ("my search missed 5"). (BLOCKER, FIXED by E-152)
- F-53 , C1, "(b), repaired in part by this run: G-S05 … and R-S06". (BLOCKER, FIXED by E-153)
- F-54 , C1, the lists "(b), a limit that the receipt states" (G-S11, G-S10) and "(b), repaired in part before this run, the kept part a limit that the receipt states" (R-S04, and 1 rest of R-S06). (BLOCKER, open)
- F-55 , C4: "status 0 goes only with \"No deviation\" and with 0 \"not measured\" in a measure that counts", "Contrast only where the Vision writes Floor A1", and the fifth case "checked against its own `mockup.html`". (DEFECT, open)
- F-56 `plugin/fit/src/fit.ts` lines 519 to 524. (DEFECT, open)
- F-57 `redteam/FINDINGS.md` lines 642 (A2-J3), 687 (G-S09), 401 (S6-01, grade blocker), 194 (T2-05); C1, the sentence on rows outside the list. (DEFECT, open)
- F-58 , C1: "The list is the rows whose Status holds 1 of the 13 phrases of that script, and the 4 named". (DEFECT, open)
- F-59 , C1, the list "(b), a screen of the Studio, for the next run, on the USER's word in , answer 2". (DEFECT, open)
- F-60 , C1, Test: "the 2 readers named above report on R-T06 and G-U07". (FRAGILITY, open)
- F-61 , C5: "The fixes of this run, 1 commit each: …" and "the last lines of the 3 outputs are saved". (FRAGILITY, open)
- F-62 `hinshitsu/PLAN.md` line 40 and line 18. (DEFECT, open)
- F-63 , C1: "M-01, R23-01, T6-08, P9-05, FTU-21, G-T08, each with the act as  names it", under the heading "The full new text of each changed CRITERION". (STYLE, open)
<!-- from the log: end -->
