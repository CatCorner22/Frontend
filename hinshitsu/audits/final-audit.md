aaecb7f1068513c85

# S10 report: the final AUDITOR (the audit of the audit), and the re-run of the repairs of commits 23 and 24

identifier: not visible to me (the LAUNCH entry E-419 names one; I cannot read my own).

Role: final AUDITOR. I built nothing and audited nothing earlier in this run. I changed no file of the repository; `git status --short` was empty at the start and at the end. Scratch folder (from `mktemp -d`): `/tmp/tmp.QvTRADCwOd`. Head when I started: `18272ef`. Head when I ended: `596ae70` (1 commit of another party, "log the launch of the final AUDITOR"; no file under `plugin/`, `apps/`, `packages/` changed). The last commit that changed `apps/` or `packages/` is `504b1d7`; the last that changed `plugin/` is `93526c5`.

## Verdict

- 1 (a): failed. 1 cited path does not exist yet (`hinshitsu/audits/final-audit.md`, this report); `local-test.html` exists only in a folder that git ignores; 4 `LAUNCH` entries name report paths that do not exist.
- 1 (b): failed. 1 statement of the `Status` is false, 2 statements of the `Summary` are not supported by their citation, and 6 statements elsewhere in the report disagree with the log or the ledger.
- 1 (c): passed. Every re-run equals the saved output; the 2 SHA-256 values equal `compare-builds.txt` and the `Summary`: different bytes.
- 1 (d): failed in part. `CONNECTIONS.md` names only things that exist. `MINDMAP.md` names 2 parts that the source no longer holds, and its hand-written top is an empty stub. 17 changed files stand in neither map by name.
- 1 (e): failed in part. 25 of 25 files match a `LAUNCH` entry and carry its identifier on line 1; no entry cites a later entry; the log's history shows 0 removed lines. 4 `LAUNCH` entries name a path without the suffix that the saved file carries; E-419 has no report yet.
- 1 (f): passed for `N/A` (all 104 read "covered at file row"). For `PASS`: 24 of 25 rest on a report newer than the last change; 1 is stale by the ledger's own rule.
- 1 (g): passed. X1, X2 and X3 each count.
- 1 (h): C9 is not met (191 FINDING entries, 124 closing entries, 67 open, 0 `OVERRULE`); my open list equals the list between the marks; the report's `Status` names the open BLOCKERS wrongly. C5: 24 of 24 code commits hold their evidence file with 4 lines "exit 0"; 1 code commit (commit 19) stands in no list of C5; GitHub: each of the 3 newest pushed commits has 1 `check` run `success` and 1 `cancelled`.
- 2.1: passed. 2 passed, 117 skipped; with either of 2 repairs of commit 24 taken out the test "attack before delivery ..." fails.
- 2.2: failed. `q02-br` and `q03-blockspan` STILL REPRODUCE (row RC-05 calls them repaired). 7 other triggers no longer reproduce. Of my 4 ordinary pages 4 read right; 2 of my 6 variants give a false alarm.
- 2.3: passed. The 4 findings of S8 and F-161: all `NO LONGER REPRODUCES`.
- 2.4: the 5 named places hold no sentence of the older rule without a condition. 4 such sentences stand elsewhere (2 in files that the scope names, outside the named sections).

## Missing paths

| Cited in | Path | State |
|---|---|---|
| `DELIVERY-REPORT.md` (5 places) | `hinshitsu/audits/final-audit.md` | missing; it is this report, not yet saved |
| `DELIVERY-REPORT.md`, "Check it yourself", step 1 | `local-test.html` "that came with this report" | not in the repository; it exists at `apps/studio/dist/artifact/local-test.html` after `npm run build:page`, in a folder that `.gitignore` leaves out. Whether the USER holds the file cannot be confirmed from the RUN FOLDER |
| `AUDIT-LOG.md`, E-290 | `audits/WU-1-reaudit-code.md` | missing; the saved file is `audits/WU-1-reaudit-code-E-290.md` |
| `AUDIT-LOG.md`, E-291 | `audits/WU-1-reaudit-records.md` | missing; saved as `…-E-291.md` |
| `AUDIT-LOG.md`, E-372 | `audits/S8-recipient-stability.md` | missing; saved as `…-E-372.md` |
| `AUDIT-LOG.md`, E-373 | `audits/redcell-delivery.md` | missing; saved as `…-E-373.md` |

Every path that `COVERAGE-LEDGER.md` cites exists (28 of 28). Every other path of the report exists.

## Claims and citations

| Claim of `DELIVERY-REPORT.md` | Citation | Shows it or not |
|---|---|---|
| Main line untouched, `4dc8649` | `audits/redcell-delivery-E-373.md`, "Commands run" | Shows it. My own `git ls-remote` at 17:32Z: `4dc86493…` |
| Step 1: `--font-numeric` names a typeface | E-288; `evidence/commit-24-checks.txt` | In part. Neither shows the line. I read it: `reference-floors/tokens.css` line 91 names "Public Sans Variable". The 2 button labels stand in `apps/studio/src/App.tsx` |
| Step 2: part 5 of the RED CELL report lists 12 pages read wrongly | E-373 | Shows it (verdict line: 5 wrong "status 0" and 7 false alarms) |
| **Summary:** "24 commits …, each with a test that failed before its repair" | `evidence/commit-1-checks.txt` to `commit-24-checks.txt` | **Not supported.** The 24 files show that the checks passed before each commit; none shows a test that failed first. Commit 18 (`52d1e73`) holds no test file; commits 16 and 17 hold a test and no repair; the RED CELL showed 2 fixes of commit 22 with no test (the tests came in commit 23) |
| **Summary:** "Independent helpers re-ran every earlier finding: 81 of 88 cases no longer occur" | E-290, E-291 reports | In part. 81 of 88 is 49 of 51 cases (E-290) plus 32 of 37 FINDINGS (E-291): confirmed. "every earlier finding" is not supported: the 2 reports re-ran 65 of the 88 FINDINGS of the audit round |
| **Summary:** each task worked "with the finished product"; repeated runs identical | S8 report | Shows it for commit 22 (`504b1d7`), not for commit 24. 3 tasks are UNVERIFIED in that report |
| **Summary:** the 2 SHA-256 values, "different bytes", "The published page itself was not read." | `evidence/compare-builds.txt` | Shows it; I confirmed both values by 2 builds. "the final commit 93526c5" is inexact: the head is `596ae70`; the bytes are the same at `504b1d7`, `93526c5` and the head |
| **Summary:** "the 5 known open bugs (rows RC-01 to RC-04 and RC-07)" | none (ASSERTED) | The 5 rows exist and say "Open". The log holds 67 open FINDINGS; `q02-br` and `q03-blockspan` are open too (duty 2) |
| **Summary:** "Nobody ran the 4 commands inside Claude Code"; "The full browser test run happens on GitHub" | none (ASSERTED) | Supported by S8 ("UNVERIFIED" 1) and by C5; no citation written |
| **Summary:** departed from its stop rule; 4 repair rounds | E-112; E-377 | Shows it (commits 20 and 21, 22, 23, 24) |
| **Status:** "findings of the highest class are open … (F-152, F-170 to F-173)" | `SESSION-STATE.md`, the list between the marks | **Does not show it.** The list holds F-162, F-170, F-171, F-172, F-173 and F-188 as BLOCKER. F-152 has the closing entry E-400 (`FIXED`) |
| **Status:** C1, C5 and C9 fail; 27 helper runs; FULL; SWARM | `COVERAGE-LEDGER.md`; `AUDIT-LOG.md` | Shows it (27 `LAUNCH` entries, mine among them). The list of unmet parts leaves out part 5 of DONE (no ASSERTED claim), which this table shows is unmet |
| VoC V1: 9, 1, 8, 36 of 54 rows; "187 further findings" | `PROGRESS.md`; `SESSION-STATE.md` | 9 + 1 + 8 + 36 = 54: shows it. 187 does not hold: the log holds 191 FINDING entries |
| VoC V2: by hand for 2 starting looks | S8 report | Shows it, at commit 22 |
| O1: 2 known ways stay open (RC-01, RC-02) | `redteam/FINDINGS.md` | In part. My run of `q12-under`: `No deviation … Status 0` (open as said). My run of `q11-gradhide` against `reference-floors`: `No deviation; the contrast of 45 readings of 5 texts could not be read (2 of these texts are readable in the Vision’s Mockup, so the page counts as not measured). Status 1.` Row RC-01 says "the status is 0"; since commit 24 that holds only where Contrast does not count |
| Lens: E-292, 10 points: 8, 1, 1 | E-292 | Shows it |
| Red cell: verdict; F-170 to F-187; finding 1 repaired in commit 23; cancelled run on `b28ffb0` | E-373 report | Shows it |
| Red cell item 3: the 12 pages are listed "each as repaired or open" | rows RC-01 to RC-07 | **Not supported for RC-05:** the row says "Repaired"; 2 of its pages still give the false deviation (duty 2) |
| Swarm table: 14, 10, 8, 17, 8, 15, 16 = 88 | `AUDIT-LOG.md` | Shows it (my count by `LAUNCH` reference) |
| "59 closed as fixed" of the 88 (E-311 to E-371) | `AUDIT-LOG.md` | Does not show it: 57 of F-64 to F-151 are `FIXED`. The 59 closing entries from E-311 to E-371 include F-54 (E-345) and F-55 (E-371), which are not of the 88 |
| "S8 (E-372) raised 4 (… not yet logged as entries)" | none | False: E-396 to E-399 log them as F-188 to F-191 |
| Ledger: 25 PASS, 30 FAIL, 104 N/A, 271 UNVERIFIED, 0 empty | `COVERAGE-LEDGER.md` | Shows it (my count of cells) |
| "Every row of the Files and CRITERIA tables holds at least 1 unverified cell" | `COVERAGE-LEDGER.md` | Does not show it: rows C1, C5 and C9 hold `FAIL` in all 10 cells |
| LESSONS 1: "about 8 hours and 2 side effects" | none (ASSERTED) | "2 side effects of commit 20" stands in `PROGRESS.md` (entry of commit 22); the 8 hours have no source |

**The `Summary` read as the owner, who is no programmer.** Terms with no meaning in the same sentence: "commits", "the look", "decision D83", "cases" (88 cases: 51 cases plus 37 findings), "the 4 commands inside Claude Code", "private address", "republished", "final commit 93526c5", "commit 523ae8e", "SHA-256", "different bytes", "browser test run", "the building machine", "merge", "pull request 24", "rows RC-01 to RC-04 and RC-07", "the check guard", "pull request 14", "stop rule", "audit round", "repair rounds". Numbers that I could not confirm: "each" of the 24 commits "with a test that failed before its repair". Numbers confirmed: 24 code commits; 81 of 88 (as the sum above); both SHA-256 values; 5 rows; 4 commands; 4 repair rounds.

## Commands re-run

| Command | Saved result | My result |
|---|---|---|
| `npm run check` | `commit-24-checks.txt`: exit 0; Test Files 17 passed; Tests 374 passed | exit 0; 17 passed; 374 passed (12.98 s) |
| `npm run build:page` | build exit 0; `artifact: 1488 KB` | exit 0; `artifact: 1488 KB` |
| `npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts` | exit 0; Tests 4 passed (4) | exit 0; 1 file, 4 passed (22.02 s) |
| `bash hinshitsu/evidence/compare-builds.sh 504b1d7` (the last commit that changed `apps/` or `packages/`) | `compare-builds.txt` (made with `93526c5`): `eaffab910c2a2bf3c29fa54198ef4e7dc9481674317b368d2596e395d98e17bb`, 1524689 bytes; `523ae8e`: `47adc2ffd08deba65d19a6f110daf4ea975c4cf2f5954a0d961f6adbe98a426f`, 1524671 bytes | The same 2 values and sizes. I ran the script a second time with `93526c5`: the same. The build in the repository at the head: `eaffab91…e17bb`. **Different bytes.** The `Summary` states the same 2 values |
| `refresh_reference.py docs/reference/guarantees.md --check` | S8 and S9: passed, exit 0 | exit 0; "109 sections, 21 sources, 87 index terms; findings: none; check: passed; file not changed" |
| `python3 hinshitsu/evidence/open-rows.py` | `open-rows-after-E-111.txt`: 50 rows | exit 0; 46 rows (blocker 3, major 43). Gone from the 50: G-S08, R-S03, R-S07, R-S08, R-S09, R-S11, R-U03, R-U05 (the 8 of list (a) that the script listed). New: RC-01, RC-02, RC-03, RC-07 |
| Trial 001, `cli.ts`, then `cmp` with the stored `RECEIPT.md` | stored receipt | `No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0.` exit 0; `cmp`: equal |
| Trial 002 | stored receipt | `34 deviations; 3 readings of 1 text below the usual contrast (information: this Vision does not require it). Status 1.` exit 1; `cmp`: equal |
| Trial 003 | stored receipt | `No deviation; none of the 48 Floor requirements of the Vision was checked (…); the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 1.` exit 1; `cmp`: equal |

## Maps

- `CONNECTIONS.md`: every file, folder and name that it holds exists (33 marked names; 8 identifiers, all found in the source).
- `MINDMAP.md`: every path that it names exists. 2 names do not exist in any source file: `ordinal` and `textKey` (line 192, the line of F-165, whose repair took them out). The hand-written top of the file says "(no CRITERION yet; S4 writes them)", its diagram holds 1 node ("Goal"), and its "Node check" table gives 0 for CRITERIA, WORK UNITS, decisions and FINDINGS; the log holds 3 `CRITERIA` entries, 5 `CRITERIA-CHANGE` entries, WU-1, 9 `DECISION` entries and 191 FINDINGS. The file's first sentence ("Every CRITERION, WORK UNIT, decision and FINDING appears once, in both the list and the diagram") is false: only FINDINGS appear, in the list between the marks.
- Files of `git diff --stat 99240db HEAD -- plugin apps packages` (60 files) whose name stands in neither map (17): `packages/core/test/__snapshots__/a-worked-project.mockup.html`, `…/the-plain-start.mockup.html`, `…/vision.test.ts.snap`, `packages/core/test/vision.test.ts`, `plugin/fit/e2e/fit.e2e.ts`, and `DESIGN.md`, `FONTS.md`, `theme.css` of each of `plugin/fit/trials/001/files/`, `002/files/`, `003/files/` and `reference-floors/` (12 files). The 12 trial files are covered by a folder that `CONNECTIONS.md` names (`plugin/fit/trials/<id>/files/`, `plugin/fit/trials/reference-floors`); the first 5 are covered by no folder name of either map. By full path 41 of the 60 are absent; the other 24 of those 41 stand by file name.

## Launches and reports

- 27 `LAUNCH` entries, 27 distinct identifiers. 25 files under `audits/` and `memos/`: each one's first line equals the identifier of exactly 1 `LAUNCH` entry (25 of 25).
- `LAUNCH` entries with no report under `audits/` or `memos/`: E-1 (its report is `evidence/capability-probe.md`, which exists and carries the identifier) and E-419 (this report).
- 4 entries name a path that does not exist (table "Missing paths"): E-290, E-291, E-372, E-373. The saved files carry the suffix `-E-<n>`.
- No entry cites an entry with a higher number (my script over all 419 entries). Entry numbers run 1 to 419 with no gap; the times never go back.
- `git log -p --follow hinshitsu/AUDIT-LOG.md | grep -c "^-[^-]"` → 0, over 49 commits: only added lines.

## Ledger

- `N/A` cells: 104, each reads "covered at file row". No other reason exists to check. Note: 9 of the 13 function rows lean on a file row whose own cells read `UNVERIFIED — stale`, so "covered" means "no fresher than the file row".
- `PASS` cells (25), each against `git log -1 --format=%h -- <file>`:

| Row | PASS cells | Last change | Report covers it? |
|---|---|---|---|
| `floors.ts` | COR, ADV (E-290), RED (E-373), RSV, STAB (E-372) | `b28ffb0` | Newer: yes. The RED cell rests on "no finding on this file"; the RED CELL report does not list `floors.ts` as attacked |
| `look.ts` | COR (E-290), RX, RSV, STAB (E-372) | `b28ffb0` | Yes. The look imports `collect.ts`, `fit.ts`, `receipt.ts`, which commit 24 changed |
| `look-cli.ts` | RX, RSV, STAB (E-372) | `504b1d7` | Yes (E-372 read `240a2bb`) |
| `deliverable.e2e.ts` | RX, RSV (E-372) | `504b1d7` | Yes by date. S8 says under "Not examined" that it did not run this test file; it did C3 by hand |
| `fit-repair.md`, `fit-look.md` | RX (E-372) | `504b1d7` | Yes |
| `tokens.ts`, `vision.ts` | RX, RSV, STAB (E-372), DRIFT (E-291) | `cb41130` | Yes |
| the stored trials | STAB (E-372) | `4d3376c` (`001/RECORD.md`, 1 line) | **No: the report is older than the last change to the row.** My own run at the head: the 3 receipts are byte-equal to the stored ones |
| `countClosedRoots`, `headOf`, `findFonts`, `labelled`/`labelWords` | COR (and ADV) (E-290) | functions unchanged since `1008f12` (I read the diffs: `receipt.ts` changed at line 21 only; `look-cli.ts` at line 1 only; `floors.ts` not at all) | Yes |

## RED CELL attacks on unflagged PREMISES

| Attack | Verdict | Reason |
|---|---|---|
| X1 (the page is 1 file with no style sheet of its own address) | counts | Concrete failure: a builder links `styles.css`, the program stops the request, measures without it, says "No deviation". EVIDENCE pasted: page `s03-extcss` → `No deviation … Status 0`. My run today: the same line, status 0 |
| X2 (the earlier `receipt.json` is what the program wrote) | counts | Concrete failure: a model deletes section 7 and edits 1 hash; the next receipt says nothing changed. EVIDENCE pasted: `Floor requirements read from VISION.md: 0` beside "none of the Vision files … has changed", status 0 |
| X3 (a builder does not aim at "unread") | counts | Concrete failure: 1 style line silences Floor A1. EVIDENCE pasted: the 2 one-lines of `q13b-noop` and `q13c-allop`. Commit 24 answers it (duty 2) |

## C9 and C5

**C9.** My script over `AUDIT-LOG.md`: 191 `FINDING` entries (F-1 to F-191); 124 `RESOLUTION` entries (122 `FIXED`, 2 `WITHDRAWN`), each for a distinct FINDING; 0 `OVERRULE` entries; 67 open:

- BLOCKER (6): F-162, F-170, F-171, F-172, F-173, F-188
- DEFECT (26): F-15, F-16, F-17, F-56, F-57, F-58, F-59, F-62, F-75, F-99, F-126, F-142, F-174 to F-182, F-184, F-185, F-186, F-189, F-190
- FRAGILITY (11): F-60, F-61, F-89, F-90, F-107, F-108, F-110, F-111, F-119, F-135, F-183
- STYLE (24): F-27, F-28, F-63, F-79, F-80, F-83, F-86, F-87, F-91, F-93, F-95, F-109, F-132, F-133, F-144, F-146 to F-150, F-160, F-161, F-187, F-191

The list between the marks in `SESSION-STATE.md` holds the same 67 IDs with the same classes. The delivery report states no count of open FINDINGS; its `Status` names F-152 (closed by E-400) and leaves out F-162 and F-188; its plain-word list names 16 by ID and points to the state file for the rest. No FINDING is accepted by the USER by name. C9 is not met; the report says so.

What my re-runs show for the open BLOCKERS: F-170 and F-188 no longer reproduce (row G-S05 cites E-293 and E-294; `SPEC.md` line 545, `PROGRESS.md` lines 132 and 850 and `DECISIONS.md` D84 agree). F-162: C1 was moved by E-294, and the row names the limit. F-171 still reproduces: row R-S08 holds "Not covered, and said here: …" and ends "repaired", in list (a). F-172 and F-173 stand (below, and above).

The top part of `SESSION-STATE.md` (written "during S7") still says "Nothing is VERIFIED" and "2 questions … wait for the USER"; that is the open F-185, not a new finding.

**C5.** `git log --oneline 859c643..HEAD`: 24 commits change a file under `plugin/`, `apps/` or `packages/`. Each of the 24 adds its own `evidence/commit-<n>-checks.txt`, each file holds 4 lines "exit 0" and no other exit line, and each "Parent commit" line equals the real parent: `5f6d8c2` (1), `7b25baa` (2), `3947494` (3), `7b4943f` (4), `e0bb89a` (5), `cd9626d` (6), `21259fc` (7), `b2dc6cb` (8), `3e74f55` (9), `19fc296` (10), `77ef769` (11), `a853d71` (12), `8eda988` (13), `c85d195` (14), `dfc8c05` (15), `bafb507` (16), `8c03b63` (17), `52d1e73` (18), `581e963` (19), `b28ffb0` (20), `cb41130` (21), `504b1d7` (22), `4d3376c` (23), `93526c5` (24). No other commit of the range changes code. Read against C5 (E-418): the list names 18 fixes and commits 20 to 24, which is 23; commit 19 (`581e963`, the 4 limit sentences, FINDING F-54) stands in no list of C5. E-418 itself says that the USER was not asked whether commits 22 and 23 may each be 1 commit. C5 is not met; the report says so.

Head of `origin/claude/brave-mayer-sawqz9`: `4dc86493d06bce269272011149990a27b79e1915` (unchanged). Head of the working branch on the remote: `596ae70`. Pull request 24: open, draft, not merged, head `596ae70`.

GitHub check runs, read at 2026-11-22T17:32Z:

| Commit | `check` (2 runs) | `Outside validators` (2 runs) |
|---|---|---|
| `596ae70` | `success` (16:46:32Z to 17:28:15Z); `cancelled` (16:46:28Z to 17:31:44Z) | `success`; `success` |
| `18272ef` | `success` (to 17:27:05Z); `cancelled` (to 17:31:32Z) | `success`; `success` |
| `93526c5` (commit 24) | `success` (16:45:43Z to 17:27:07Z); `cancelled` (16:45:48Z to 17:30:52Z) | `success`; `success` |

Each cancelled run ended at the 45-minute limit of `ci.yml`; each successful run took 41 to 42 minutes. Older commits, for the same reading: `4d3376c`, `ff47693`, `19e8677`, `504b1d7`: 1 `success` and 1 `cancelled` each; `6c9d8f8` (records only): both `check` runs `cancelled`. C5 does not say which of the 2 runs counts (the open F-183).

## The repairs of commits 23 and 24 re-run

Part 1: `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "attack before delivery|second re-audit"` → 1 file passed; 2 passed, 117 skipped (119); 60.88 s. In copies of the head (`git archive HEAD | tar -x`, link to `node_modules`):

| Copy | Repair taken out | Test run | Result |
|---|---|---|---|
| m1 | `collect.ts` line 685: `r.height < 6` back to `r.height <= 0` (commit 24) | `-t "attack before delivery"` | fails at `exit.e2e.ts:1134` (`expected false to be true`): 1 failed, 118 skipped |
| m2 | `fit.ts` line 611: the clause `(contrast?.texts?.unexcused ?? 0) > 0` out of the status (commit 24) | the same | fails at `exit.e2e.ts:1141` (`expected +0 to be 1`): 1 failed, 118 skipped |
| m3 | `collect.ts` line 533: `if (style.position === 'fixed') skipping = 'fixed';` (commit 22; its test came in commit 23) | `-t "second re-audit"` | fails at `exit.e2e.ts:1097` (`expected true to be false`) |

Part 2: each page is `built(reference-floors/mockup.html)` with 1 change, checked against `plugin/fit/trials/reference-floors/`. Base: `No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0.` ("Base line" below means this line.) The status is read from the line and from `receipt.json`.

| Finding, page | One line | Reads the page rightly? | Result |
|---|---|---|---|
| 5, `q13c-allop` (faint texts in `--surface-2`, plus `body, body *{opacity:.9999}`) | `No deviation; the contrast of 504 readings of 56 texts could not be read (53 of these texts are readable in the Vision’s Mockup, so the page counts as not measured). Status 1.` Without the opacity line (`q13b`): `36 deviations (of these, 36 readings of 12 texts below the least contrast) … Status 1.` | Yes: the trick no longer gets status 0 | NO LONGER REPRODUCES |
| 6, `p03-scale` (`h1{transform:scale(0.03)}`); `p04-zoom` | `1 deviation; … Status 1.` Content: "the headline is not where a person can read it at 375 pixels; 768 pixels; 1280 pixels" (both pages) | Yes | NO LONGER REPRODUCES |
| 8, `s03-extcss` | Base line, status 0 | Kept open on purpose: row RC-07 says "Open, for the owner's decision", and the delivery report lists RC-07 as open in the `Summary`, the Red-cell verdict and the open list | row and report say so |
| 9, `q02-br` (`<h1>Dental care that<br><mark>explains itself</mark> before it begins.</h1>`, the RED CELL's own markup) | `1 deviation; … Status 1.` Content: "the headline is not where a person can read it at 375 pixels; 768 pixels; 1280 pixels" | **No: false alarm** | **STILL REPRODUCES** |
| 9, `q03-blockspan` (2 `span`s with `display:block`; the second begins with the `mark`) | the same false deviation | **No: false alarm**. With the other split (`mark` at the end of the first `span`): base line, status 0 | **STILL REPRODUCES** (in 1 of 2 splits) |
| 9, `s01-shyonly` (`ex&shy;plains`) | Base line, status 0 | Yes | NO LONGER REPRODUCES |
| 10, `q05-icon` (Lucide calendar, 16 pixels, in the button) | Base line, status 0 | Yes | NO LONGER REPRODUCES |
| 11, `q07-canon` | Base line, status 0 | Yes | NO LONGER REPRODUCES |
| 12, `r01-reorder` (`@media (pointer: fine) and (hover: hover)`) | Base line, status 0 | Yes | NO LONGER REPRODUCES |

Beside the list: `r02-hoveronly` (`@media (hover: hover)` alone, the second trigger of finding 12) → `No deviation; 7 things could not be measured; … Status 1.`, with the sentence "…a setting … that the Vision's Mockup does not name … "(hover: hover)"". The sentence is true as worded; the page is one that a careful builder writes.

The test of commit 24 passes because its line-break page puts plain words after the `br` and its block page puts plain words in both `span`s; the Mockup's own headline holds a `mark`, and the repair marks a break only on the text node's own parent (`collect.ts` line 693).

My own ordinary pages:

| Page | One line | Right? |
|---|---|---|
| o1: the headline written over 5 source lines with `<br>` on a line of its own, and the lede paragraph in 2 lines by a `<br>` | Base line, status 0 | Yes |
| o2: a faithful page with 1 extra paragraph on a card of `color-mix(in srgb, var(--surface) 80%, transparent)` (also with `rgb(255 255 255 / 0.8)`) | Base line, status 0 | Yes |
| o3: an icon of 24 pixels with a rounded square (`rect` 18 by 18, `rx="2"`) in the button | Base line, status 0 | Yes |
| o4: `<link rel="icon" href="/favicon.ico">` (also with `apple-touch-icon` and an `alternate` language link) | Base line, status 0 | Yes |
| o1b: the business name in the `h1`, the headline of 2 lines in a `p` beside it | Base line, status 0 | Yes |
| o5: each word of the headline in a `span` with `display:inline-block` | Base line, status 0 | Yes |
| o7: the `<br>` inside the `mark` | Base line, status 0 | Yes |
| o3b: the same icon as o3, drawn at 32 pixels | `1 deviation; … Status 1.` Corner radii: `radius 2.67px: 1 element, first rect` | **No: false alarm** (the repair's limit is 24 pixels of the drawn rectangle) |
| o6: `<h1 style="display:flex;flex-direction:column">` with the 2 lines in 2 `span`s, the second beginning with the `mark` | `1 deviation; … Status 1.`, headline "not where a person can read it" | **No: false alarm** (the cause of `q03-blockspan`) |
| n1: 1 extra paragraph with `opacity:.7` ("We speak English and Spanish.", a text that the Mockup does not hold) | `No deviation; the contrast of 36 readings of 4 texts could not be read (1 of these texts is readable in the Vision’s Mockup, so the page counts as not measured). Status 1.` | Status 1 follows the USER's rule in E-377. The sentence is false: the Mockup holds no such text (`grep -c` → 0) |

Part 3:

| FINDING | Trigger re-run | Result |
|---|---|---|
| S8 new finding 1 (F-188) | `grep "^| G-S05" redteam/FINDINGS.md | grep -o "E-[0-9]\+" | sort | uniq -c` → E-293 (1), E-294 (1); the row ends "The owner decided on 2026-11-22 that it stays a stated limit … Who must act: the builder, in a later run …"; `SPEC.md` 545 "A stated limit that the owner accepted on 2026-11-22 (… entry E-293)"; `PROGRESS.md` 850 cites E-293 | NO LONGER REPRODUCES |
| S8 new finding 2 (F-189) | `plugin/README.md` lines 97 and 113: "In this folder (the folder that holds this guide), run:" / "In this folder, run:" | NO LONGER REPRODUCES |
| S8 new finding 3 (F-190) | `fit-check.md` line 16 and `fit-build.md` line 18 each say when an unread contrast is the case "not measured"; `fit-build.md` line 17 names the act where none of the Floor requirements was checked | NO LONGER REPRODUCES |
| S8 new finding 4 (F-191) | `plugin/README.md` line 64: "The Mockup is not a built page. … Do not repair the Mockup; build your page and check that." | NO LONGER REPRODUCES |
| F-161 | `sed -n 7p plugin/fit/trials/001/RECORD.md`: "Their fingerprint is `7776d35d` [as of the run's date; the stored files carry `0fabf790` since 2026-11-22: see the last part of this record]"; `grep -c 7776d35d` on the 7 stored files → 0 each | NO LONGER REPRODUCES |

Part 4: sentences that still state the older rule with no condition.

- In the 5 named places (`plugin/README.md` lines 58 and 62; `fit-check.md` lines 13 and 16; `fit-build.md` line 18; `SPEC.md` 2.31 point 20; `guarantees.md` §66.12): none. Each "never changes the status" carries its condition.
- `docs/reference/guarantees.md` line 955 (§66.09, "Exceptions"; "Last verified: 2026-11-17"): "A text whose contrast cannot be read does not change the status."
- `SPEC.md` line 366 (section 2.22): "A text whose contrast cannot be read never changes the status (the Mockup itself holds such texts); the receipt counts it."
- `SPEC.md` line 536 (section 2.31, point 18): "…the status stays 0 (the owner's decision D83)." Point 20 replaces it; point 18 carries no mark at its own place.
- `plugin/fit/src/fit.ts` lines 607 to 608 (a comment above the status line): "A text whose contrast could not be read does not change the status (the Mockup itself holds such texts)".

## New findings

1. **BLOCKER. The `Status` names the open BLOCKERS wrongly.** Place: `hinshitsu/DELIVERY-REPORT.md`, `Status`, part (2). Trigger: my script over the log and the list between the marks: open BLOCKERS are F-162, F-170, F-171, F-172, F-173, F-188; F-152 is closed by E-400. Violates: glossary, BLOCKER (d) (a false statement in the `Status`); the report's own citation. Proposed fix: name the 6; add part (5) (ASSERTED claims) to the unmet parts or cite each claim of the table above.
2. **BLOCKER. The `Summary` says of all 24 commits "each with a test that failed before its repair", and its citation does not show it.** Place: `DELIVERY-REPORT.md`, `Summary`, "What you got"; also "re-ran every earlier finding". Trigger: `git show --name-only 52d1e73` holds no test file; commits `bafb507` and `8c03b63` hold a test and no repair; the 24 evidence files hold pass lines only; E-290 and E-291 re-ran 28 and 37 FINDINGS. Violates: glossary, BLOCKER (d) and ASSERTED; `CLAUDE.md` hard rule 13. Proposed fix: "24 commits, each checked before it was made; N of them hold a repair with a test"; "re-ran 65 of the 88 findings: 81 of 88 cases…".
3. **DEFECT. A line break or a line box before the headline's `mark` still gives "headline missing"; row RC-05 says "Repaired".** Place: `plugin/fit/src/collect.ts` lines 492 and 693 to 694; `plugin/fit/e2e/exit.e2e.ts` lines 1122 to 1123; `redteam/FINDINGS.md` row RC-05; `PROGRESS.md` line 113. Trigger: pages `q02-br`, `q03-blockspan`, `o6` above. Violates: the Content measure's own sentence; `CLAUDE.md` hard rule 13 (the row and the build log state a repair that 2 of the 3 named pages do not show); the open F-178. Proposed fix: count a break when a `br`, or the start of a block-level box, lies between this text node and the text before it inside the same block, wherever in the tree it lies; add the RED CELL's own 2 markups and a flex column to the test; reword RC-05 until then.
4. **DEFECT. A rounded square in an icon drawn at 32 pixels is a corner deviation.** Place: `collect.ts` line 232 (the limit of 24 pixels is taken from the drawn rectangle). Trigger: page `o3b`. Violates: row RC-05 ("a small icon gave a corner deviation … Repaired") for icons above 24 pixels; the rest of F-179. Proposed fix: put to the owner whether an outline `rect` (`fill: none`) of a picture marked `aria-hidden` counts at any size; until then say the limit in `SPEC.md` 2.31 point 20 as "an icon whose rectangle is drawn under 24 pixels".
5. **DEFECT. The one line and the receipt say that a text "is readable in the Vision's Mockup" where the Mockup does not hold the text.** Place: `plugin/fit/src/cli.ts` line 180; `fit.ts` line 566 ("a text that the Mockup shows readably"); the same narrower wording in `plugin/README.md` line 58, `fit-check.md` lines 13 and 16, `fit-build.md` line 18, `guarantees.md` §66.12, and in C4 (E-418), which names no case for a text that the Mockup does not hold. Trigger: page `n1`. Violates: C4's clause "no sentence of the receipt says that the program did something it did not do", outside its 5 cases; C6 for the guide and the reference. Proposed fix: "N of these texts are not among the texts that the Mockup leaves unread"; the same words in the 5 files; 1 assertion on the test's own "Planted faint words" page.
6. **DEFECT. `PROGRESS.md`, "Start here", stops at commit 23.** Place: line 9: '("repair run, commit 1" to "commit 23"; commits 20 to 23 are the repairs after the run's audit round…)'. Trigger: `grep -n "repair run, commit 24" PROGRESS.md` → line 111. Violates: C1, row R-T06, and C6 if the range counts as a count (the kind and the class of F-156). Proposed fix: "to commit 24"; "commits 20 to 24".
7. **DEFECT. 4 sentences still state the older rule for an unread contrast.** Place and trigger: part 4 above. Violates: C6 for `guarantees.md` line 955; the form that C1 asks of G-U07 for `SPEC.md` point 18 (a mark at the first place). Proposed fix: reword lines 955 and 366 with the condition; mark point 18 "[replaced by point 20]"; correct the comment.
8. **DEFECT. 6 statements of the delivery report outside `Summary` and `Status` disagree with the log or the ledger.** Place and trigger: the table "Claims and citations": "59 closed as fixed" (57); "not yet logged as entries" (E-396 to E-399); "187 further findings" (191); "Every row … at least 1 unverified cell" (C1, C5, C9); "the final commit 93526c5"; RC-01 "still get No deviation" (status 1 where contrast is required). Violates: glossary, DEFECT (a false statement in the report outside `Summary` and `Status`). Proposed fix: correct each from the commands above.
9. **BLOCKER (a second cause of the open F-172). Commit 19 stands in no list of C5.** Place: C5 as in E-418; `581e963`. Trigger: C5 names 18 fixes "1 commit each" and commits 20 to 24; `git log` holds 24 code commits. Violates: C5 ("`git log` of the working branch from 859c643, read against the list of fixes above"). Proposed fix: a `CRITERIA-CHANGE` entry with the USER's word that names commit 19 (and commits 22 and 23, which E-418 says the USER was not asked about).
10. **DEFECT. 4 `LAUNCH` entries name a report path that does not exist.** Place: E-290, E-291, E-372, E-373. Trigger: the table "Missing paths". Violates: glossary, EVIDENCE ("a file … that a third party can open"). Proposed fix: 1 `CORRECTION` entry that gives the 4 saved paths; name `audits/final-audit.md` as the file is saved.
11. **DEFECT. `MINDMAP.md` is a stub above a list of FINDINGS.** Place: lines 1 to 24 and line 192. Trigger: part "Maps". Violates: glossary, DEFECT (an out-of-date statement in a file of the RUN FOLDER); the file's own first sentence. Proposed fix: write the hierarchy, the diagram and the node counts from the log, or say in the file and in the report that only the FINDINGS list is kept.
12. **DEFECT. 1 `PASS` cell of the ledger is stale by the ledger's own rule.** Place: `COVERAGE-LEDGER.md`, row "the stored trials", STAB. Trigger: `git log -1 --format=%h -- plugin/fit/trials` → `4d3376c`, after E-372. Violates: the ledger's rule 10.5 as its head states it. Proposed fix: `UNVERIFIED — stale`, or cite this report (3 receipts byte-equal at the head). The totals then change by 1.
13. **FRAGILITY (adds a fact to the open F-183).** Place: `.github/workflows/ci.yml`, 45 minutes. Trigger: on each of the 8 newest pushed commits at least 1 of the 2 `check` runs ended `cancelled` at the limit; on `6c9d8f8` both did. Fails when: the runner is a little slower on the run that counts. Proposed fix: say in C5 and in the report which run counts; split the job (rows A1-09, T6-01).

## Commands run

- `git log`, `git status --short`, `git show --stat`, `git show --name-only`, `git diff --stat 99240db HEAD -- plugin apps packages`, `git diff 1008f12 HEAD -- <file>`, `git fetch origin`, `git ls-remote origin`, `git worktree list`, `git archive HEAD | tar -x -C <scratch>` (3 copies, each with a link to `node_modules`).
- The commands of duty 1 (c), as its table lists them; `compare-builds.sh` 2 times (`504b1d7`, `93526c5`), output into scratch files.
- `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "attack before delivery|second re-audit"` on the head (1 time); `-t "attack before delivery"` on copies m1 and m2; `-t "second re-audit"` on copy m3.
- `node gen.ts`, `gen2.ts`, `gen3.ts` (my page builders, with `built` of `plugin/fit/e2e/built.ts`); `node plugin/fit/src/cli.ts <page> plugin/fit/trials/reference-floors <scratch>`: 30 runs (base, 13 pages of the RED CELL's triggers, 16 of mine); 3 runs on the stored trials.
- `gh api repos/CatCorner22/Frontend/commits/<sha>/check-runs` for 8 commits (read only), polled once a minute for the 3 newest until every run was complete (17:32Z); `gh api …/pulls/24` and `…/pulls/14` (read only).
- 6 Python scripts of my own over `AUDIT-LOG.md`, `COVERAGE-LEDGER.md`, `SESSION-STATE.md`, `MINDMAP.md`, `CONNECTIONS.md` and the 2 `open-rows` lists; `grep`, `sed -n`, `cmp`, `sha256sum`.
- No `playwright install`; no `npm run e2e`; no run of `plugin/fit/e2e` as a whole.

## Not examined

- The whole of `plugin/fit/e2e` (253 tests) and `npm run e2e` at the head: not run (the scope forbids it). GitHub's successful `check` run on `93526c5`, `18272ef` and `596ae70` is the only full run.
- C1 row by row (the 54 rows, the take-out of each fix of list (a)); C2's 3 tests by title; C7 and C8; the 7 clauses of C3 by hand. I ran the C3 test and read rows G-S05, R-S08, G-S08 and RC-01 to RC-07 only.
- The C4 test "says nothing in the receipt that disagrees with its own summary line" as a separate run, and the receipt of trial 001's own Mockup.
- The look (`look-cli.ts`) and `look.e2e.ts`, `fit.e2e.ts`, `trial.e2e.ts`.
- A take-out of the other repairs of commit 24 (the `link` kinds, the 24-pixel limit, the soft hyphen, the order of a condition's parts, the `closest` step); I took out 2 and showed by pages that the line-break repair is incomplete.
- The pages of the RED CELL as it built them: its report gives each change in words, and I rebuilt each from those words. `q13b` and `q13c` use my own choice of faint color (`--surface-2`), so my counts differ from its 114.
- Every citation of the delivery report to an `ANSWER` entry beyond E-288, E-293, E-377, E-112 (start) and E-53; G1 to G16 of E-10 beyond its first rows; E-55; the 2 lens memos; the reports of the plan stage.
- The published page; a Vision that writes no Floor under my pages; other Directions and Templates; the Studio in a browser.
- `GAUGE.svg`, `FRAMEWORK.md`, `hinshitsu/PLAN.md` and the scope files under `prompts/` other than my own.
- `scripts/hinshitsu_check.py` (part 7 of DONE): not run; it is not in the repository and my scope does not name it.
- The 2 git worktrees under the session's scratchpad (`wt` at `93526c5`, `wt2` at `7b25baa`): not mine, not read.
