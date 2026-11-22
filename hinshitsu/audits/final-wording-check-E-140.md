a65a772d1390e3477

# Last check of the wording before the build: third re-audit, and RED CELL probe of E-139

Scope read: `hinshitsu/prompts/S6-final-wording-check.md` at commit d0f60de. Log line numbers below are those of `hinshitsu/AUDIT-LOG.md` at d0f60de (E-139 is lines 1462 to 1479).

## Verdict

Re-audit: 13 NO LONGER REPRODUCES; 0 STILL REPRODUCES.
Probe: CHANGE SURVIVES WITH CHANGES (10 new findings: 1 BLOCKER, 6 DEFECT, 2 FRAGILITY, 1 STYLE).

## The 13 FINDINGS

| ID | Result | EVIDENCE |
|---|---|---|
| F-1 | NO LONGER REPRODUCES | `python3 hinshitsu/evidence/open-rows.py` prints "rows in the table: 858 / open or part-open, blocker or major: 50 (blocker 4, major 46) / … / says closed, yet matches a pattern: 3"; with `--full`, `cmp` against `evidence/open-rows-after-E-111.txt` is silent. The 10 lists of C1 (line 1472) hold 54 IDs, 54 unique, each 1 row of the table; they equal the script's 50, its 3 "says closed" rows and R-12. The 4 phrases of E-25 over the 287 blocker and major rows: 39 rows match, 0 outside the 54. **My rule**: I read the Status of each of the 233 blocker and major rows outside the 54 (39 hold only the stock sentence "Fixed in `6597599` …"). A row counts when its Status says in its own words that a way of the fault remains, or that the repair has no test. 4 rows count: A2-J3 (line 642 of `redteam/FINDINGS.md`: "A page that waits longer, or finds other signs of the check, is named in \"Still needs a person\""), G-S09 (line 687: "Not tested by a test (a pipe would hang a failing run)"), S6-01 (line 401, grade blocker: "Not tested: whether a given AI coding tool obeys a fence"), T2-05 (line 194: "The tool's N04 still survives"). **Does the sentence of C1 answer them?** Yes for each: "a row whose Status states an open part in other words is outside it, and an AUDITOR who finds one reports it under C9", and C9 ends each as fixed, withdrawn, or accepted by the USER by name. I report the 4 under C9 (new finding 4). The rest of T2-05 is also the rest of X-02, a row of C1. Two limits of that sentence are new findings 4 and 5: nobody is named to look after this check, and the sentence miscounts its own rule. Rows I did not count, listed for the ORCHESTRATOR: T3-01 (blocker, line 233, "Checked in Chromium only"); U2-03 (line 170, "for a person to judge"); R-S05 (line 826, "Limit:" in the singular, a false alarm on a harmless animation; the script's phrase is "limits:"); DT-01 (line 346); U2-06, U3-05, C4-F2, C4-F10, C4-F11 (each waits for a reviewer's retest). |
| F-13 | NO LONGER REPRODUCES | The row that failed last time, E-9 line 109 ("each fix is 1 commit with its test and its record | C5"), now meets C5, line 1475: "Each fix is 1 commit that holds its test and its record", with the 18 fixes listed and `git log` "read against the list of fixes above"; line 1479 confirms the Translation of O3. G6 (line 129) agrees. The card's decision 7 (b) (line 787) is held too: C5 and `PLAN.md` line 11 run the deliverable test before each commit. The other 5 rows were cured before (E-72 and E-111 reports) and their targets C9, C1 (b), C5, C7 and C2 still say so. For the row O1 see new finding 1: C1 says "a limit that the receipt states" by its list title, and tests it for G-S05 alone. |
| F-43 | NO LONGER REPRODUCES | C4, line 1474: such a Vision "ends with status 1 … `receipt.json` keeps the count that the status rests on, and the test of finding G-U01 in `exit.e2e.ts` keeps its assertions of `floors.notMeasured` 1 and `status` 1" (today lines 273 and 275). Trigger re-run in a scratch copy: `fit.ts` line 494 with `otherEdition ? 0`, then the Fit check on trial 003 prints "No deviation; … Status 0." So the cheat still works in code, and a sentence of C4 now forbids it. |
| F-44 | NO LONGER REPRODUCES | C5, line 1475, lists the fixes itself and no longer counts steps of `PLAN.md`; line 1479 confirms O3. `PLAN.md` lines 15 to 32: 18 commits. The 3 places of the trigger are split: old step 1 is commits 1 to 3, old step 6 is commits 8 and 9, old step 8 is commits 13 to 15. What stays joined, and C5 names each as 1 fix: commit 13 (row R-U03 and 2 wordings of the same receipt) and commit 18 (the 2 record rows R-T06 and G-U07). |
| F-45 | NO LONGER REPRODUCES | Line 1472: "X-02, CR-GX2 and C-07 (the USER's word: E-107, question 1 (b)); A1-09 and T6-01 (the USER's word: E-112, question 2, items 2 and 3)". E-112, line 1231, item 2: "Splitting GitHub's long check into two shorter jobs: next run"; the Status of A1-09 (line 633) ends "splitting it into two jobs would shorten the wait". |
| F-46 | NO LONGER REPRODUCES | C3, line 1473, now answers whether the built page differs: 2 SHA-256 values, "equal bytes" or "different bytes", and "The published page itself was not read." I made the 2 builds as C3 says (`git archive` of 523ae8e and of d0f60de into 2 scratch folders; `npm ci --ignore-scripts` and `npm run build:page` exit 0 in both): `refraction-studio.html` has SHA-256 `47adc2ffd08deba65d19a6f110daf4ea975c4cf2f5954a0d961f6adbe98a426f` in both; `local-test.html` has `4292363b…` in both. The test is repeatable by a third party. |
| F-47 | NO LONGER REPRODUCES | C4, line 1474, adds the fifth case: `plugin/fit/trials/reference-floors/`, every Floor in the edition that the program reads, with a freshness test. I wrote that Vision in scratch (`writeVision` on the plain start with `a11y: 'enforce'`): `grep -n "^## 7\|^Edition" VISION.md` gives "288:## 7. Floors" and "294:Edition 3 of the Floors."; 2 writes give equal files. The Fit check on it reads 33 of 56 requirements, and Contrast is "required by Floor A1". What the fifth case still leaves untested is new finding 2. |
| F-48 | NO LONGER REPRODUCES | Line 1472: "each receipt holds 1 sentence on other window widths and 1 on other window heights, and 1 test asserts both sentences"; `PLAN.md` line 18 puts both into commit 4 and into its test. `grep -c` on the 6 receipts that I wrote today: 1 and 1 in each (`receipt.ts` lines 58 and 61). No test file holds them yet: not built, commit 4. |
| F-49 | NO LONGER REPRODUCES | Line 1472: "and in the state of its list below; a row that ends in another state fails C1, unless a `CRITERIA-CHANGE` entry moves it"; the Test "compares its state with its list"; R-T06 and G-U07 each have a named reader and a question. The readers "report" and no sentence says which report passes: new finding 7. |
| F-50 | NO LONGER REPRODUCES | C6, line 1476, last sentence: "While that part is UNVERIFIED, C6 is not met, and the delivery report lists it as open." The command on a scratch copy of `guarantees.md`: "findings: none / check: passed; file not changed", exit 0. With a glob that finds no script: "can't find '__main__' module", exit 1. |
| F-51 | NO LONGER REPRODUCES | C7, line 1477, end of the Test: "the language auditor reads the guide and `plugin/commands/fit-check.md`, and reports for each whether it lists the measures that count as C4 lists them." `PLAN.md` line 32: R-T06 and G-U07 "with their 2 rows in this same commit"; line 11 writes each other row in the commit of its fix. |
| F-52 | NO LONGER REPRODUCES | Line 1472: R-S07 and G-S08 in list (a), R-S04 and T6-01 in lists (b). The script now lists all 4 (phrases "Not read:", "is not; stated", "Limits:", "Open, and"). The product faults stand, as planned for commits 11 and 12: trial 001's Mockup plus the `select` of the probe gives "No deviation … Status 0."; plus `<rect rx="37">` it gives "No deviation … Status 0." |
| F-53 | NO LONGER REPRODUCES | Line 1472: "(b), repaired in part before this run … R-S06 … and R-S04". `git log -S'counts the colors as not measured when a box recolors' -- plugin/fit/e2e/exit.e2e.ts` gives af90f7e (2026-11-21T17:27:24Z); `git merge-base --is-ancestor af90f7e 859c643` is true. The Status of R-S04 says "Repaired on 2026-11-18". |

## The probe

### Attack 1: does a CRITERION of E-139 ask for less than in E-108 or E-68?

Method: `git diff --no-index --word-diff` of each CRITERION, E-108 against E-139, and a reading against E-68.

| CRITERION | Result |
|---|---|
| C1 | More: 54 rows, each bound to its list. Less in 1 place: for R-T06 and G-U07 the Test said "confirms" (E-108) and now says "report" (finding 7). The 6 acts of the owner are no longer written out ("each with the act as E-108 names it", finding 10). |
| C3 | More: a byte comparison of 2 builds, checked by the final AUDITOR. Dropped: the list of changed paths of E-108. For "different bytes" the Summary now names no path. Not less than E-68. |
| C4 | More: 5 cases; status 1 for the unread edition. Not less by the letter. The sentence on status 0 still meets no case where Contrast counts (finding 2). |
| C5 | More: 3 commands before each commit; the list of 18 fixes; `git log` read against it. Nothing removed. |
| C6 | Only 1 sentence added. Nothing removed. |
| C7 | Only the end of the Test added. Nothing removed. |

### Attack 2: does each use of the USER's word match what the USER was asked?

Matches: the 2 approvals quoted at line 1465 (E-112, lines 1230 and 1231); G-S05 (E-107, question 2); R-S06 as a row (E-67, answer 6, item 4); X-02, CR-GX2, C-07 (E-107, question 1 (b)); A1-09 and T6-01 (E-112, question 2, items 2 and 3); R-S07 and G-S08 (E-112, question 1 (a); C1 adds the shape from another file, which is stricter); the byte comparison, the fifth case, the 2 sentences, UNVERIFIED, 1 commit for each fix (E-112, question 1 (b) to (f)); GitHub's run (E-67, answer 7).

Does not match, or was not asked:

- **G-S11, G-S10 and R-S04.** The USER was asked for "limits that every receipt states" (E-67, answer 6) and "stays a limit that the receipt states" (E-112, question 2, item 1). No receipt states these 3 limits today, no commit adds a sentence, and C1 tests a receipt sentence for G-S05 alone. Finding 1.
- **FTU-33, FTU-35 and U2-02.** C1 cites E-67, answer 2, for all 19 screen rows. These 3 entered with E-108; the USER heard of them in E-107, question 1 (a) ("3 on Studio screens for the next run"). The 19 rows of the card of E-64 did not hold them. Finding 6.
- **H7-01.** Listed as "a screen of the Studio, for the next run". Its Status (line 387) says the rest is kept "as the owner chose" on 2026-11-15, with a unit test that pins the 3 Directions. Nothing waits for a next run. Finding 6.
- **Not asked, besides A1-04:** the sentence that defines the list by phrases and sends other rows to C9. The recorded question says "the bug list grows from 49 to 53 rows (my search missed 4 …)" and no word on rows that a phrase search leaves out by design. My search finds 4 such rows (finding 4).
- Carried over from E-108 and still in no recorded question: the third reason of state (c); the planned state (c) of R-T06 and G-U07 was approved in E-68.

E-112 heads its column "Question as asked (start)". I read the log's quotation only.

### Attack 3: the cheating agent

| CRITERION | Cheapest way to appear to meet it | Sentence of E-139 that stops it |
|---|---|---|
| C1, state (a) | Name a test that passes with and without the fix | "fails when the fix is taken out"; the correctness auditor takes the fix out in a copy. Holds |
| C1, lists "a limit that the receipt states" | Write "kept; the receipt states it; E-67, answer 6" into the Status and add no sentence to the receipt | None, except for G-S05 ("1 test asserts both sentences"). Finding 1 |
| C1, state (c), G-U07 | Add 1 mark to `RECORD.md`; the reader reports 2 reversed statements; the row still "ends in the state of its list" | None in C1. C9 stops it only if each reported statement is filed as a FINDING. Finding 7 |
| C1, edge of the list | Leave a row with an open part in other words outside | "an AUDITOR who finds one reports it under C9" works only if an AUDITOR looks. This check looked; no reader is named for the final audit |
| C3, Summary | Build the final commit 2 times and print 1 value 2 times | "the final AUDITOR makes the 2 builds and compares the 2 SHA-256 values". Holds |
| C4, status 0 | Keep the rule away from any case where Contrast counts | None. The fifth case ends with status 1. Finding 2 |
| C4, fifth case | Store the folder once and let it go stale | "1 test shows that the folder equals what the Catalog writes today". Holds |
| C5, saved checks | Type the "last lines", or save lines of a run on another tree | Final commit: the 3 commands and GitHub's checks. Commits 1 to 17: none. Finding 8 |
| C5, commits | Join 2 fixes in 1 commit | "`git log` … read against the list of fixes above". Holds |
| C6 | Run the check where the script is missing | "While that part is UNVERIFIED, C6 is not met". Holds |
| C7 | List the measures in the guide alone; call the folder "the folder with the Vision" | The language auditor reads both files and each name. Holds by a reader; the test searches 1 phrase |

### Attack 4: the 18 commits of `PLAN.md` against the list of fixes in C5

1 to 1, in the same order: commits 1 to 3 = the 3 findings of C2; 4 = G-S05; 5 = A2-V4; 6 = R-S08; 7 = C8; 8 = R-S09; 9 = R-S11; 10 = R-S03; 11 = R-S07; 12 = G-S08; 13 = the receipt's wording; 14 = the guide and the 2 commands; 15 = the message for a missing browser; 16 = the deliverable test; 17 = the fifth case of C4; 18 = the rows and records. 18 commits, 18 fixes, none left over on either side. `PLAN.md` line 11 holds the 3 commands and the file name `commit-<n>-checks.txt` as C5 does.

Differences inside a pair:
- Commit 4 also makes the look state its pixel density in `LOOK.md` (`look.ts` in the Files cell). C5's words for this fix do not name it, and the Test cell holds no test for that sentence.
- Commit 18 also changes a comment in `plugin/fit/src/look.ts` (F-28). C5 calls this fix "the rows and records".
- Commit 10 is a test alone: the Status of R-S03 (line 824) says the code was repaired before and "no test with a listener proves it". This fits state (a).
- The seeder of line 40 names 4 programs; the commits change 8 (finding 9).

## New findings

1. **BLOCKER.** Place: E-139, C1, the lists "(b), a limit that the receipt states" (G-S11, G-S10) and "(b), repaired in part before this run, the kept part a limit that the receipt states" (R-S04, and 1 rest of R-S06).
   Trigger: `grep -ci "trusted\|hostile\|owner.s own\|model counts\|counts the rounds\|approximation\|style values" plugin/fit/trials/00{1,2,3}/RECEIPT.md` gives 0 in each; `grep -n "blend" plugin/fit/src/receipt.ts` finds line 66 alone, a sentence on contrast. The Status of G-S11 (line 689) names "README and guarantee 66.12"; that of G-S10 (line 688) names "the README and the command"; the receipt says "This is a first check: no repair round came before it" as a fact. No receipt holds a sentence on a hostile `mockup.html` in the Vision folder, on who counts the repair rounds, on the place of a covering box worked out from style values, or on a blend mode on a box that a style rule draws. No commit of `PLAN.md` adds one, and C5's list holds no such fix.
   Violates: the USER's condition in E-67, answer 6 ("limits that every receipt states") and in E-112, question 2, item 1; O1 as E-68 translates it ("no known way to status 0 on a wrong page except those the receipt states"); C1's own list titles. The run would end these rows as "kept, a limit that the receipt states, on the USER's word" while the receipt is silent. It is the fault of F-48 for other rows.

2. **DEFECT.** Place: E-139, C4: "status 0 goes only with \"No deviation\" and with 0 \"not measured\" in a measure that counts", "Contrast only where the Vision writes Floor A1", and the fifth case "checked against its own `mockup.html`".
   Trigger: (a) write the Vision of the plain start with `a11y: 'enforce'` and run `node plugin/fit/src/cli.ts <folder>/mockup.html <folder> <out>`: "8 deviations; the contrast of 3 texts could not be read (this does not change the status). Status 1." The 8 are Floor deviations (A11, Q10, Q8, S11, S5 two times, S8, S9); `docs/reference/guarantees.md` line 955 says why: "The Mockup itself is a still page and shows Floor deviations". (b) Run the same Vision against the page that `plugin/fit/e2e/built.ts` makes from that Mockup: "No deviation; the contrast of 3 texts could not be read (this does not change the status). Status 0.", and the receipt says "### Contrast: required by Floor A1 of the Vision" with "0 deviations; 27 not measured".
   Violates: C4 against the program. The program gives status 0 beside 27 "not measured" in a measure that C4 says counts; this is a rule of the program (`fit.ts` lines 519 to 524; `SPEC.md` line 366: "A text whose contrast cannot be read never changes the status"; the guide, line 34). None of the 5 cases ends with status 0 where Contrast counts, so the test of C4 passes while its sentence is false for a faithful build of any project with "Fix for me". C4 also does not say which status the fifth case ends with, and gives its command only as "the same command form". Class DEFECT because C4 binds its rules to its 5 cases and they can be met; if the sentence is read as a rule for every receipt, the program cannot meet it.

3. **DEFECT (product; for C9).** Place: `plugin/fit/src/fit.ts` lines 519 to 524.
   Trigger: in the reference build of finding 2 (b), change `<p class="lede">` to `<p class="lede" style="color:#f7faff">` (the color of the page's background): "3 deviations; … Status 1." Add `opacity:0.98` to the same style: "No deviation; the contrast of 4 texts could not be read (this does not change the status). Status 0."
   Violates: O1. Against a Vision that requires contrast, a paragraph that nobody can see gets status 0. The line and the receipt state the count of unread texts, so the way is stated; no row of `redteam/FINDINGS.md` and no `ANSWER` entry holds it.

4. **DEFECT (for C9, as C1 directs).** Place: `redteam/FINDINGS.md` lines 642 (A2-J3), 687 (G-S09), 401 (S6-01, grade blocker), 194 (T2-05); C1, the sentence on rows outside the list.
   Trigger: `grep -n "^| A2-J3 |\|^| G-S09 |\|^| S6-01 |\|^| T2-05 |" redteam/FINDINGS.md`; each Status states an open part in words that none of the script's phrases matches (quoted in the row F-1 above). `grep -c` of each ID in C1: 0.
   Violates: V1 as E-9 translates it. For A2-J3 also O1: "finds other signs of the check" is a way to status 0 that the receipt states and that is not among the 5 limits of E-67, answer 6. C1 names no AUDITOR who searches for such rows after this check.

5. **DEFECT.** Place: E-139, C1: "The list is the rows whose Status holds 1 of the 13 phrases of that script, and the 4 named".
   Trigger: `open-rows.py` line 13 holds 13 phrases; line 25 adds a 14th rule, `status.lower().startswith("open")`. A count with the 13 phrases alone leaves out 4 of the 50: P9-05, G-T08, R-S09, R-S11 (each Status begins "Open." or "Open,").
   Violates: C1 against itself: its definition shuts out 4 rows that its lists (a) and (b) hold. Beside it: A1-04 is in the list by chance (its Status says "on open, and a fixed note …", the verb), and "limits:" does not match the "Limit:" of R-S05.

6. **DEFECT.** Place: E-139, C1, the list "(b), a screen of the Studio, for the next run, on the USER's word in E-67, answer 2".
   Trigger: compare the 19 IDs with the 19 of E-68 (line 845): FTU-33, FTU-35 and U2-02 are new, and E-107, question 1 (a), is the place where the USER heard of them. Read the Status of H7-01 (line 387): "Fixed in part on 2026-11-15, as the owner chose … keep their link colors … a unit test pins exactly these three".
   Violates: C1, state (b) ("the Status cites the `ANSWER` entry that holds the USER's word"): for 3 rows the cited entry is the wrong one; for H7-01 the list's reason ("for the next run") disagrees with the row.

7. **FRAGILITY.** Place: E-139, C1, Test: "the 2 readers named above report on R-T06 and G-U07".
   Trigger: read the Test for the report that passes. None is named; E-108 said "confirms".
   Violates: C1 as a test that a third party can repeat. C9 holds the gap only if each reported sentence becomes a FINDING.

8. **FRAGILITY.** Place: E-139, C5: "The fixes of this run, 1 commit each: …" and "the last lines of the 3 outputs are saved".
   Trigger: (a) a fix of a FINDING after the audit round (C9), or of a wording fault beside the build (E-112, answer 3), is a 19th commit that the closed list does not hold, so `git log` "read against the list" then disagrees. (b) No sentence ties a saved file of commits 1 to 17 to the tree of that commit; the E-110 report named this cheat and E-139 left it.
   Violates: C5 as a test that a third party can repeat.

9. **DEFECT.** Place: `hinshitsu/PLAN.md` line 40 and line 18.
   Trigger: line 40 plants 1 defect in `collect.ts`, `fit.ts`, `receipt.ts`, `look.ts`. The Files cells of commits 3, 7, 9, 13 and 15 also change `floors.ts`, `vision.ts`, `cli.ts` and `look-cli.ts`. Commit 4 changes `look.ts` for a sentence in `LOOK.md` and names no test for it.
   Violates: E-55, row "TC add: 1 planted defect for each program changed", ACCEPTED; G8 of E-10 ("each fix carries a test that failed before it").

10. **STYLE.** Place: E-139, C1: "M-01, R23-01, T6-08, P9-05, FTU-21, G-T08, each with the act as E-108 names it", under the heading "The full new text of each changed CRITERION".
    Trigger: read C1 for the 6 acts; they stand in E-108 alone, an entry that E-139 calls "Old text".
    Violates: the entry's own heading; a reader of C1 needs a second entry.

## Changes demanded

1. **C1 (finding 1).** For G-S11, G-S10, R-S04 and the blend-mode rest of R-S06: either each receipt holds 1 sentence that states the limit and 1 test asserts the sentences (1 more fix in C5's list, 1 more commit in `PLAN.md`), or the USER is asked again with the true place of each statement (the guide, guarantee 66.12, the row).
2. **C4 (finding 2).** Put the choice to the USER and write the chosen rule into C4: (a) Contrast counts by its deviations alone, and a text whose contrast cannot be read never changes the status (what `SPEC.md` line 366 says); or (b) status 0 needs 0 "not measured" in Contrast where the Vision writes A1. Choice (a) leaves the way of finding 3 open; choice (b) gives status 1 to each faithful build today. Name the status of the fifth case (today 1, with 8 Floor deviations) and write its command in full. Add the page that `built.ts` makes as a case if a status-0 case with required Contrast is wanted.
3. **C9 (findings 3 and 4).** Write a `FINDING` entry against the product for the page of finding 3 and for each of A2-J3, G-S09, S6-01 and T2-05 (T2-05 may point to X-02).
4. **C1 (finding 5).** Write "the rule of that script (13 phrases, or a Status that begins with \"open\")". Name the AUDITOR who searches for rows outside the list at the final audit, or say that nobody does after this check.
5. **C1 (finding 6).** Cite E-107, question 1 (a), for FTU-33, FTU-35 and U2-02. For H7-01 write the reason that its Status gives, or move it by a `CRITERIA-CHANGE` entry.
6. **C1 (finding 7).** Add: "R-T06 and G-U07 are in state (c) only when the reader reports none; each reported sentence is a FINDING under C9."
7. **C5 (finding 8).** Add: "a fix of a FINDING of this run after commit 18 is 1 more commit with its test and its record, named in the delivery report"; and "the final AUDITOR checks out 2 of the commits 1 to 17, chosen by itself, in a copy and runs the 3 commands; the results equal the saved ones".
8. **`PLAN.md` (finding 9).** The seeder plants 1 defect in each of the 8 programs changed, or the plan says why 4. Commit 4 names a test for the sentence in `LOOK.md`.
9. **C1 (finding 10).** Write the 6 acts out.

## Commands run

All from `/home/user/Frontend`; scratch files only under `/tmp/tmp.Vf1EOhIhzl` (from `mktemp -d`). I changed no file of the repository: `git status --short` prints 0 lines at the end. While I worked, the branch head moved from d0f60de to 337474a; `git diff --stat d0f60de HEAD` shows 9 added lines in `hinshitsu/AUDIT-LOG.md` (the LAUNCH entry E-140) and nothing else. A run of `npm run e2e` that I did not start was under way in the repository from 20:37Z (process list); it wrote the files under `apps/studio/dist` at 20:37:53Z. `git diff --stat 859c643 d0f60de -- plugin apps packages redteam SPEC.md` is empty: nothing of the plan is built.

1. `git show d0f60de:hinshitsu/prompts/S6-final-wording-check.md`; `git rev-parse HEAD`; `git log --oneline`.
2. Read `hinshitsu/AUDIT-LOG.md` lines 1 to 300, 418 to 429, 594 to 893, 1169 to 1479; `hinshitsu/PLAN.md`; both reports of E-110 and E-111 whole; rows F-1 and F-13 of `audits/reaudit-plan-E-72.md`.
3. `python3 hinshitsu/evidence/open-rows.py`, and with `--full`; `cmp` against `evidence/open-rows-after-E-111.txt` (silent).
4. My scripts `rows.py` and `outside.py`: 858 rows, 7 cells each; 28 blocker, 259 major; the 54 IDs of C1 against the table; the 4 phrases of E-25; the rows listed by "begins with open" alone; the Status of all 233 blocker and major rows outside the 54 printed and read; about 40 rows of C1 printed in full.
5. `git diff --no-index --word-diff=plain` of C1, C3, C4, C5, C6, C7, E-108 against E-139.
6. With `export PW_CHROMIUM=/opt/pw-browsers/chromium`, `node plugin/fit/src/cli.ts` 12 times: the 3 stored trials (exit 0, 1, 1; each `RECEIPT.md` equal to the stored one by `diff -q`); the command of C4 (exit 0); the fifth case on a Vision written in scratch (exit 1, 8 deviations) and on its reference build (exit 0, 27 not measured under required Contrast); the 2 pages of finding 3 (exit 1, exit 0); the `select` page and the `rect` page (exit 0 each); trial 003 in a scratch copy of `plugin/` with line 494 of `fit.ts` changed (exit 0).
7. `rolldown` on 2 scratch scripts (to call `writeVision` and `built`); the Vision written 2 times and compared with `diff -rq` (equal).
8. `git archive 523ae8e` and `git archive d0f60de` into scratch; in each `npm ci --ignore-scripts` and `npm run build:page` (exit 0, 4 times); `sha256sum` on the built pages.
9. The command of C6 on a scratch copy of `docs/reference/guarantees.md` (exit 0), and with a glob that finds nothing (exit 1).
10. `git log -S'counts the colors as not measured when a box recolors' -- plugin/fit/e2e/exit.e2e.ts`; `git merge-base --is-ancestor af90f7e 859c643`.
11. `grep` and `sed` in `plugin/fit/src/receipt.ts`, `fit.ts`, `cli.ts`, `plugin/fit/e2e/exit.e2e.ts`, `built.ts`, `trial.e2e.ts`, the 3 stored receipts, `plugin/README.md`, `docs/reference/guarantees.md`, `SPEC.md`, `DECISIONS.md`, `apps/studio/e2e/deliverable.e2e.ts`, `package.json`.

`playwright install` was not run.

## Not examined

- The dialog windows of E-67, E-107 and E-112: I read the log's quotations; E-107 and E-112 give the "start" of each question.
- `npm run check`, `npm run e2e`, the suite `plugin/fit/e2e` and the deliverable test: not run by me. The result of the run of `npm run e2e` that was under way: not read.
- GitHub's check runs, pull request 24, and the page at the private address.
- The 571 rows of grade minor and note. Whether a row called "Fixed" is fixed. The 39 rows with the stock sentence were not judged.
- The rests of A2-J3, G-S09, S6-01, T2-05, G-S11 and G-S10: read from the Status, not shown by a run.
- The 7 pages of P2 for G-S05: not run again; the E-111 report holds that run.
- C2, C8 and C9: read, not attacked (unchanged). F-15, F-16, F-17, F-27 and F-28: not re-run, as the scope says.
- `FRAMEWORK.md`, `SESSION-STATE.md`, `MINDMAP.md`, `CONNECTIONS.md`, `COVERAGE-LEDGER.md`, `GAUGE.svg`, the memos, and the text of the skill's rules: not read. The classes above follow the definition in the scope.
- Whether the 18 commits fit the project's own build loop (`feature_list.json`, the hooks of `CLAUDE.md`): not examined.
- About 14 of the 54 rows of C1 were checked by ID and grade alone, not read in full.
