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
- F-1 `hinshitsu/evidence/open-major-859c643.txt`, C1 (BLOCKER, open)
- F-2 PLAN step 1, C1 state (a) for G-S05 (BLOCKER, open)
- F-3 PLAN step 2, its test (BLOCKER, open)
- F-4 C3, G11, A-9 (BLOCKER, open)
- F-5 C1, PLAN step 7, A-9 (BLOCKER, open)
- F-6 C4 and C7 (BLOCKER, open)
- F-7 against C5 (BLOCKER, open)
- F-8 C6 (BLOCKER, open)
- F-9 C1 lists FTU-32 and G-T08 as inside the CRITERIA, and the closing sentence lists them as outside. (DEFECT, open)
- F-10 C1 state (b) cannot hold for R-12 and FTU-22, and "exactly 1 of 2 states" cannot hold for R-S06. (DEFECT, open)
- F-11 U7-02 is planned as closed in C1, optional in the plan, and excluded by PREMISE A-9. (DEFECT, open)
- F-12 C1 requires a failing test for R-T06 and R-U05 in part; the plan names a reading, not a test, for R-T06. (DEFECT, open)
- F-13 The translation table in the VOC points 6 rows at CRITERIA that do not say what the row says. (DEFECT, open)
- F-14 C4 names 4 subjects and a test that covers 3, and the test checks the sum for 1. (DEFECT, open)
- F-15 "A measure that counts" has no definition, in C4, in the guide, or in the command. (DEFECT, open)
- F-16 The summary line and the receipt count contrast in 2 units, and the receipt names the wrong unit. (DEFECT, open)
- F-17 The receipt says "0 not measured" for Floors where it checked nothing. (DEFECT, open)
- F-18 C5 counts "2 local commands" and names 3 things; "the Fit check's browser tests" has no command. (DEFECT, open)
- F-19 C6's command holds a placeholder, and checks a file that C6 does not name. (DEFECT, open)
- F-20 C7's test cannot compare statuses, and does not compare the 4 commands; "technical term" is not bounded. (DEFECT, open)
- F-21 C3's test opens a different file from the one the CRITERIA call the built Studio page. (DEFECT, open)
- F-22 C3 holds 5 phrases that a third party cannot test as written. (DEFECT, open)
- F-23 C2 does not say what a test that "shows a finding false" looks like, and names no test. (DEFECT, open)
- F-24 One thing has 3 names: "reference build", "clean build", "faithful build". (STYLE, open)
- F-25 The plan's test column holds 3 vague terms. (STYLE, open)
- F-26 `FRAMEWORK.md` says in section 1 that no CRITERIA entry exists, and at its end that  is the newest. (DEFECT, open)
- F-27 The guide and the commands use "the program" for 2 programs, and "receipt" for the defined term "Honest receipt". (STYLE, open)
- F-28 Banned words: 2 occurrences. (STYLE, open)
<!-- from the log: end -->
