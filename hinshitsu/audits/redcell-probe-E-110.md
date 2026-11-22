af39059359b7f289e

# RED CELL probe: the change of the CRITERIA in entry E-108

Scope read: `/home/user/Frontend/hinshitsu/prompts/S6-redcell-probe-criteria-change.md` at commit a86c9b0. No file of the repository was changed (`git status --short` prints 0 lines at the end). Scratch folder: `/tmp/tmp.eYo0jDk4AM` (from `mktemp -d`).

## Verdict

CHANGE SURVIVES WITH CHANGES

Most of E-108 asks for more than E-68 did. 5 places ask for less or go beyond the USER's recorded words, and 1 new clause opens a way to status 0 for a Vision of which the program checked nothing.

## Each attack

### Attack 1: does a changed CRITERION ask for less?

Method: word-level comparison of each CRITERION between line 845 to 851 (E-68) and line 1189 to 1194 (E-108) of `hinshitsu/AUDIT-LOG.md` at a86c9b0, then a run of each command that the new text names.

| CRITERION | Asks for more | Asks for less, or proves less |
|---|---|---|
| C1 | 49 rows in place of 44; each owner's act named; the fix-removal test kept for the repaired part of G-S05 | State (c) gains a third reason with no pass rule (finding 7). A1-09 leaves the list that C6 puts into "Known gaps" (finding 3) |
| C3 | Names in place of line numbers (verified: `BUSINESS`, `HEADLINE`, `BRIEF` stand at lines 18 to 20); the build step; a command for the Summary sentence | "whether the built page differs" became "may differ" (finding 4) |
| C4 | A command for the fourth receipt; the clause on row R-U03 | The fourth case is now a Vision with no Floor (finding 5). The R-U03 clause names no status (finding 1) |
| C5 | Checks before each commit, saved in each commit; the corrected sentence on GitHub's 2 checks (verified in `.github/workflows/ci.yml`: only the job `check` runs `npm run e2e`) | "Each fix is 1 commit" became "Each step … is 1 commit" (finding 2) |
| C6 | `SPEC.md` to the end of section 2 | A missing script now gives "UNVERIFIED" in place of a failed test (finding 8) |
| C7 | The list of measures, 1 name for the folder, "TypeScript"; nothing taken out | The clause on `fit-check.md` has no test and no reader (finding 9) |

EVIDENCE for C3. The command of C3, run today with a86c9b0 as the final commit, prints 3 paths: `apps/studio/e2e/deliverable.e2e.ts`, `package-lock.json`, `package.json`. So the Summary sentence is already fixed at "the published page may differ". Step 9 of `PLAN.md` edits the first path, a test file that the build does not read, so the other branch stays out of reach. I built both commits in scratch copies (`git archive`, `npm ci --ignore-scripts`, `npm run build:page`; Vite 8.3.7 at 523ae8e and 8.3.8 at a86c9b0, Node v22.23.4). `cmp` is silent: `refraction-studio.html` has SHA-256 `47adc2ffd08deba65d19a6f110daf4ea975c4cf2f5954a0d961f6adbe98a426f` in both, and `local-test.html` has `4292363b…` in both.

EVIDENCE for C4. `node plugin/fit/src/cli.ts plugin/fit/trials/001/files/mockup.html plugin/fit/trials/001/files <folder>` gives "No deviation; the contrast of 3 texts could not be read (this does not change the status). Status 0." The receipt says "Contrast: measured, not required", and under Floors "nothing was checked here". The Visions of trials 001 and 002 hold no section 7, and that of trial 003 holds an edition that the program does not read. So none of the 4 receipts of C4 comes from a Vision whose Floors the program reads. The words of E-68, "the reference build of the plain start", match the test title at `plugin/fit/e2e/exit.e2e.ts` line 50, which builds "with every Floor written and contrast required".

EVIDENCE for C6. On this machine the glob finds 1 script. Run on a scratch copy of `docs/reference/guarantees.md`, it prints "findings: none … check: passed; file not changed" and exits 0.

### Attack 2: does the USER's answer in E-107 cover what E-108 does with it?

- **The kept part of G-S05: covered, with 1 gap.** The second question asks for "a limit that every receipt states". Today the receipt states it: `plugin/fit/src/receipt.ts` line 58 ("All other window widths …") and line 61 ("… and other window heights …"). No test file holds either sentence (`grep` finds them only in `receipt.ts`, in the 3 stored receipts and in 2 records). Step 2 rewrites the same lines (finding 6).
- **The 4 rows moved: not covered for 1 row, and the wrong entry is cited for the other 3.** Question 1 (b) says "3 rows that I filed under \"Studio screens\"". E-108 moves 4. X-02, CR-GX2 and C-07 come from the screens list. A1-09 comes from "waits for an act of the owner" (E-68). E-108 says "on the same word", which is E-67, answer 2. That answer was given on the card of E-64, decision 2 (c): "19 rows on the Studio's screens wait for a second run", and A1-09 was not among the 19. `grep A1-09 hinshitsu/audits/reaudit-plan-E-72.md` finds nothing, so no FINDING asked for the move. For the 3 rows, the word that holds the true reason is E-107, question 1 (b), not E-67, answer 2.
- **State (c), "repaired in this run by a change to a record alone": not in the question as E-107 records it.** The question lists (a) 5 rows more, (b) 3 rows renamed, (c) exact commands. For R-T06 and G-U07 the planned state is the same as in E-68, which the USER approved. The text of E-68 did not allow that state for them (F-32), so by the text a state became easier to reach for 2 rows.
- **Also outside the recorded question:** 1 commit for each step (finding 2), "UNVERIFIED" in C6 (finding 8), the Vision of the fourth receipt (finding 5), "may differ" (finding 4). The sentence "Nothing is removed and nothing is made easier" does not hold for these 4.

E-107 heads its column "Question as asked (start)". I could not read the dialog window itself.

### Attack 3: the cheating agent

See the next heading.

### Attack 4: the 49 rows, each in exactly 1 list

Holds.

- `python3 hinshitsu/evidence/open-rows.py` prints "rows in the table: 858", "open or part-open, blocker or major: 45 (blocker 4, major 41)" and "says closed, yet matches a pattern: 3" (FTU-22, T2-03, A2-V4).
- With `--full`, its output equals `hinshitsu/evidence/open-rows-after-E-72.txt` byte for byte.
- My script `cmp.py`: 45 rows plus A2-V4, FTU-22, T2-03, R-12 give 49 unique IDs. The 9 lists of C1 in E-108 hold 49 IDs, 49 unique: 0 in more than 1 list, 0 missing, 0 extra.
- Sizes: (a) 7; (b) repaired in part 2; (b) limit 4; (b) owner 6; (b) screens 19; (b) tests, Catalog data and GitHub's check 4; (c) earlier 4; (c) past fact 1; (c) record 2.
- Against E-68: 5 new rows (FTU-33, FTU-35, U2-02, R-U03, R25-01), 0 rows dropped.
- E-109 holds: 5 blocker rows among the first 44, and the 2 GitHub checks as `ci.yml` states them.

The premise under the list does not hold in full: at least 1 high-grade row with an open part stands outside the 49 (finding 10).

## The cheating agent

| CRITERION | Cheapest way to appear to meet it | Sentence of E-108 that stops it |
|---|---|---|
| C4, clause on R-U03 | Take the count out. In a scratch copy I changed 1 token at `plugin/fit/src/fit.ts` line 494 (`otherEdition ? 1` to `otherEdition ? 0`). Trial 003 then gives "No deviation; … Status 0", while its receipt says "The program checked none of them" about 48 requirements. Unchanged code gives "1 thing could not be measured … Status 1" | None. "status 0 goes only with … 0 \"not measured\" in a measure that counts" agrees with the cheat. The assertions for trial 003 (lines 383 to 388 of `exit.e2e.ts`) do not read the status |
| C1, state (a) | Name a test that passes with and without the fix | "fails when the fix is taken out", and the correctness auditor takes the fix out in a copy. Holds |
| C1, a row of list (a) | End it in state (b) as "repaired in part" with a small rest and a reason that is not risk or taste; or end R-U05 in state (c) by the third reason | None says that a row ends in the state of its list. "The lists:" reads stronger than "Planned for" in E-68, yet the Test sentence compares no end state with a list |
| C1, state (c), G-U07 | Add 1 sentence to `plugin/fit/trials/003/RECORD.md` and write "repaired in this run by a change to a record" | Only "confirms … by reading … the record that the Status names", which names no question to answer. R-T06 is held by C6; no CRITERION names the record of trial 003 |
| C3, Summary | Write "may differ" and look no further | None. The text asks for exactly that |
| C5, saved checks | Type the "last lines" by hand, or save lines of a run on another tree | For the final commit: the 3 commands and GitHub's check "check". For steps 1 to 10: none; the final AUDITOR "reads" the files |
| C5, commits | Join rows of the table in `PLAN.md`. No entry freezes that file, and C5 counts its steps | None |
| C6 | Run the check where the glob finds no script and report "UNVERIFIED" | None says that C6 is then not met |
| C7 | Call the folder "the Vision directory" or "the unpacked folder" | The language auditor's reading. The test searches 1 phrase only |

## Findings

1. **Place:** E-108, C4, the clause "a Vision of an edition of the Floors that the program does not read gives no count \"not measured\" for its Floor requirements (row R-U03)".
   **Trigger:** in a copy of a86c9b0, at `plugin/fit/src/fit.ts` line 494, change `failed + (otherEdition ? 1 :` to `failed + (otherEdition ? 0 :`, then run `PW_CHROMIUM=/opt/pw-browsers/chromium node plugin/fit/src/cli.ts plugin/fit/trials/003/index.html plugin/fit/trials/003/files <folder>`. Result: "Status 0". Line 524 of `fit.ts` shows that the status 1 of trial 003 rests on that count alone.
   **Violates:** O1 as E-68 translates it (no known way to status 0 on a wrong page except those the receipt states); "nothing is made easier" (E-107). On the reading "no count at all" it also asks the builder to change the assertions `floors.notMeasured` 1 and `status` 1 of the test at `exit.e2e.ts` lines 265 to 276, which hold the repair of the blocker G-U01 (`CLAUDE.md`, hard rule 3).

2. **Place:** E-108, C5, first sentence; and the line "Translation, 1 line changed".
   **Trigger:** read steps 1, 6 and 8 of `PLAN.md`: up to 3 fixes, 2 rows, and 4 subjects in 1 commit each. Read E-64, "Decided by me": "each fix is its own commit, so one fix can be taken back alone". Read E-68, Translation: "O3 (1 commit for each fix) → C5"; E-108 leaves that line standing. E-107 names no such change.
   **Violates:** the statement to the USER in E-64; G6 of E-10; "Nothing is removed and nothing is made easier" (E-107). C5 also takes its meaning from `PLAN.md`, which the ORCHESTRATOR can rewrite with no `CRITERIA-CHANGE` entry.

3. **Place:** E-108, C1, the list "(b), the project's own tests, Catalog data and GitHub's check, for the next run, on the same word: X-02, CR-GX2, C-07, A1-09".
   **Trigger:** compare with E-107, question 1 (b) ("3 rows") and with E-68 (A1-09 under "waits for an act of the owner"); read E-64, decision 2 (c).
   **Violates:** C1, state (b) ("the Status cites the `ANSWER` entry that holds the USER's word"): no entry holds the USER's word for moving A1-09 to the next run, and the entry cited for the other 3 holds the reason that F-33 showed false. C6's list in "Known gaps" loses A1-09 without a word to the USER.

4. **Place:** E-108, C3, the sentence on the Summary.
   **Trigger:** run `git diff --stat 523ae8e a86c9b0 -- packages/core apps/studio package.json package-lock.json` (3 paths, 1 of them a test file). Then build both commits in 2 folders and run `cmp` on the 2 files `refraction-studio.html` (silent).
   **Violates:** E-68 C3 asked "whether the built page differs", and the new text never answers it; V3 ("true, verified information"); "nothing is made easier". The owner would read "may differ" where a repeatable comparison shows equal bytes. Smaller: `tsconfig.base.json`, which `apps/studio/tsconfig.json` extends, is outside the 4 paths (unchanged between the 2 commits today).

5. **Place:** E-108, C4, "1 reference build (the Vision's own page of trial 001 … this Vision writes no Floor …)".
   **Trigger:** run the command of C4 (status 0, "Contrast: measured, not required", Floors "nothing was checked here"); `grep -n '^## 7' plugin/fit/trials/00{1,2,3}/files/VISION.md` finds section 7 in trial 003 only, in an edition that the program does not read.
   **Violates:** a test that proves less than E-68's, whose "reference build of the plain start" the test file builds with every Floor written. In all 4 receipts the measure Floors checks nothing and Contrast is never required, so the clauses of C4 on those 2 measures meet no case. E-107 does not name this.

6. **Place:** E-108, C1, "G-S05 (… kept for width and height conditions, on the USER's word in E-107)".
   **Trigger:** `grep -rn "All other window widths\|other window heights" plugin packages apps` finds no test file. Step 2 of `PLAN.md` changes the sentences on dark mode, touch screens and pixel density, which share line 61 and stand next to line 58.
   **Violates:** the USER's condition in E-107 ("a limit that every receipt states"): no CRITERION and no test holds it.

7. **Place:** E-108, C1, state (c), third reason, and the Test sentence.
   **Trigger:** read the Test sentence for the question that the framework-drift auditor answers for G-U07, and for a sentence that binds a row to its list. Neither exists.
   **Violates:** C1 as a test that a third party can repeat. The third reason is not in the question that E-107 records.

8. **Place:** E-108, C6, "(… on a machine without that skill this part of the test is reported UNVERIFIED)".
   **Trigger:** run the command where `ls /root/.claude/skills/synced/*/living-reference/scripts/refresh_reference.py` finds nothing. Under E-68 the test fails; under E-108 the part is "reported UNVERIFIED", and no sentence says whether C6 is met.
   **Violates:** "nothing is made easier" (E-107).

9. **Place:** E-108, C7, "and `plugin/commands/fit-check.md` does too"; and steps 10 and 11 of `PLAN.md`.
   **Trigger:** the Test sentence of C7 reads the guide for the measures and names nobody who reads `fit-check.md` for them. `redteam/FINDINGS.md` stands in the Files cell of step 10 only, while the rows R-T06 and G-U07 are repaired in step 11; the Status written in step 10 would state a repair that does not exist at that commit.
   **Violates:** C7 (a clause with no test); C5 ("1 commit that holds its tests and its record").

10. **Place:** E-108, C1, "Each of the 49 rows"; E-107, question 1 (a) ("my search missed 5").
    **Trigger:** `grep -n "^| R-S07 |" redteam/FINDINGS.md`: grade major, Status "Repaired on 2026-11-21 … Not read: a `select`'s shown option, and a shape referenced from another file". The 9 patterns of `open-rows.py` do not match it. I appended `<select style="color:#ff00ff;background:transparent;border:0;outline:0;font:italic 40px Papyrus,fantasy"><option>Another design</option></select>` to `plugin/fit/trials/001/files/mockup.html` in scratch and ran the Fit check against the Vision of trial 001: "No deviation … Status 0". The receipt names neither the color, nor the typeface, nor such a limit. G-S08 ("The corner radius of an SVG shape is not; stated") and R-S04 ("Limits: … a blend mode on a cover is not judged") have a rest by the same reading.
    **Violates:** the translation of V1 in E-9 ("each open finding of grade blocker or major"); O1; the count told to the USER in E-107.

11. **Place:** E-108, C1, "(b), repaired in part by this run: G-S05 … and R-S06".
    **Trigger:** `git log -S'counts the colors as not measured when a box recolors' -- plugin/fit/e2e/exit.e2e.ts` gives af90f7e, an ancestor of 859c643, the base of the run (E-1). `PLAN.md` holds no step for R-S06.
    **Violates:** one statement, one fact. R-S06 was repaired in part before this run.

## Changes demanded

1. **C4:** add "such a Vision ends with status 1; the summary line and the receipt both say that none of its N Floor requirements was checked", and say whether the count leaves `RECEIPT.md` alone or `receipt.json` too. The C4 test asserts status 1 for trial 003. The test at `exit.e2e.ts` lines 265 to 276 keeps `status` 1.
2. **C5:** either go back to 1 commit for each fix, or ask the USER by name ("steps 1, 6 and 8 hold several fixes in 1 commit; 1 fix cannot be taken back alone") and change the Translation line of O3. Name `PLAN.md` at a commit, or list the 11 steps in C5.
3. **C1:** put the move of A1-09 to the USER, or put the row back under an act of the owner if 1 exists. Cite E-107, question 1 (b), for X-02, CR-GX2 and C-07.
4. **C3:** the Summary states the result of a byte comparison of 2 builds (523ae8e and the final commit, with the 2 SHA-256 values), or the path list leaves out `apps/studio/e2e` and takes in `tsconfig.base.json`. The sentence says that the published page itself was not read.
5. **C4:** add 1 case from a Vision that writes every Floor in the edition that the program reads (for example the test's own plain start with `a11y: 'enforce'`), with a command or a stored folder, so that Floors and required Contrast each meet the clauses.
6. **C1 or C4:** each receipt holds the sentence on other window widths and the sentence on other window heights; 1 test asserts both.
7. **C1:** add "a row that ends in a state other than that of its list fails C1, unless a `CRITERIA-CHANGE` entry moves it". Name the reader and the question for G-U07 (for example: the language auditor reads `RECORD.md` of trial 003 from the top and reports each statement that a later part reverses with no mark at the first place).
8. **C6:** add "while that part is UNVERIFIED, C6 is not met, and the delivery report lists it as open".
9. **C7:** name the test or the reader for the list of measures in `fit-check.md`. **`PLAN.md`:** step 11 also holds the rows R-T06 and G-U07 of `redteam/FINDINGS.md`.
10. **C1:** take R-S07 in as row 50 (state (a), or state (b) with a sentence in the receipt and the USER's word). Decide G-S08 and R-S04 by reading. Or tell the USER that the list holds the rows whose Status uses 1 of 9 phrases.
11. **C1:** word R-S06 as "repaired in part before this run".
12. **E-107 or a new card:** tell the USER which of the items above were not in the 2 questions (demands 2, 3, 4, 5, 8).

## Commands run

All from `/home/user/Frontend`, with `S=/tmp/tmp.eYo0jDk4AM`.

- `git show a86c9b0:hinshitsu/prompts/S6-redcell-probe-criteria-change.md`; `git status --short`; `git log --oneline`; `git diff --stat a86c9b0 HEAD` (1 file, `AUDIT-LOG.md`, 18 lines added after the commit under review).
- Read `hinshitsu/AUDIT-LOG.md` (E-9, E-10, E-64 to E-72, E-93 to E-109) and `hinshitsu/PLAN.md`.
- `python3 hinshitsu/evidence/open-rows.py`, and again with `--full`; `diff -q` against `evidence/open-rows-after-E-72.txt`.
- `python3 $S/cmp.py $S/out.txt` (the lists of C1 in E-68 and E-108 against the script's rows).
- `python3 $S/miss.py` (the 239 blocker and major rows that the script does not list; 52 of them hold a word of openness and were read).
- `grep -n "^| <ID> |" redteam/FINDINGS.md` for 35 rows.
- `git diff --no-index --word-diff=plain` on each CRITERION, E-68 against E-108.
- `git log -S'counts the colors as not measured when a box recolors' -- plugin/fit/e2e/exit.e2e.ts`; `git merge-base --is-ancestor af90f7e 859c643`.
- `git diff --stat 523ae8e a86c9b0 -- packages/core apps/studio package.json package-lock.json`; the same for `tsconfig.base.json`; `git diff 523ae8e a86c9b0 -- package.json`.
- `git archive 523ae8e | tar -x -C $S/pub`; `git archive a86c9b0 | tar -x -C $S/cur`; in each: `npm ci --ignore-scripts`, `npm run build:page` (all 4 exit 0); `cmp` and `sha256sum` on the built pages.
- With `PW_CHROMIUM=/opt/pw-browsers/chromium`: `node plugin/fit/src/cli.ts` on trial 003 (status 1), on the reference command of C4 (status 0), on 2 pages with a `select` (status 1 with a visible box; status 0 with text color and typeface alone), and in the scratch copy with line 494 changed (status 0).
- `python3 "$(ls /root/.claude/skills/synced/*/living-reference/scripts/refresh_reference.py | head -1)" docs/reference/guarantees.md --check` on a scratch copy (exit 0).
- `grep` in `plugin/fit/src/receipt.ts`, `fit.ts`, `plugin/fit/e2e/exit.e2e.ts`, `.github/workflows/ci.yml`, `package.json`, `apps/studio/vite.config.ts`, `apps/studio/tsconfig.json`, `apps/studio/e2e/deliverable.e2e.ts`.

`playwright install` was not run.

## Not examined

- The dialog windows themselves: E-107 gives the "start" of each question, and I read only what the log records.
- The page at the private address: my comparison is between 2 builds on this machine, not with the published bytes.
- GitHub's check runs and pull request 24.
- `npm run check`, `npm run e2e`, the suite `plugin/fit/e2e` and the deliverable test: not run. I ran the Fit check program alone, 6 times.
- C2, C8 and C9 (unchanged), and the receipt sentences for the 4 rows of "(b), a limit that the receipt states".
- The 187 unlisted blocker and major rows whose Status holds none of my words of openness; the rows of grade minor and note.
- Whether G-S08 and R-S04 give status 0 on a wrong page: read, not run.
- Whether R25-01, M-05, FTU-22 and T2-03 are repaired in full: read from the Status only, except 1 receipt line seen for R25-01.
- `hinshitsu/audits/reaudit-plan-E-72.md` was searched, not read whole. `SESSION-STATE.md`, `FRAMEWORK.md` and the other state files were not read.
- Line 29 of `PLAN.md`: its seeder names 4 programs, while the steps also change `floors.ts`, `vision.ts`, `cli.ts` and `look-cli.ts`. Seen, not attacked; it is outside E-108.
