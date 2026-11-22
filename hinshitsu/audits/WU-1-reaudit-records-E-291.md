aa2218f1d7266655f

# Re-audit of the fix round, part 2 (guide, commands, records, deliverable test)

Examined at head `62db301` of `claude/festive-mendel-lfnahh` (the fix round is `b28ffb0`, `eaab1ff`, `cb41130`, `1008f12`, `62db301`). I changed no file of the repository. `git status` shows `hinshitsu/AUDIT-LOG.md` as modified; that change is not mine.

## Verdict

Duty 1, 37 FINDINGS re-run:

| Result | Count | IDs |
|---|---|---|
| NO LONGER REPRODUCES | 32 | F-65, F-66, F-74, F-77, F-81, F-82, F-92, F-112, F-113, F-114, F-118, F-120, F-121, F-122, F-123, F-124, F-125, F-127, F-128, F-129, F-130, F-131, F-134, F-136, F-137, F-138, F-139, F-140, F-141, F-143, F-145, F-151 |
| REPRODUCES IN PART | 4 | F-126, F-133, F-142, F-149 |
| STILL REPRODUCES | 1 | F-119 |

New findings: 10 in all: 1 BLOCKER, 6 DEFECT, 1 FRAGILITY, 2 STYLE.

The BLOCKER is a count in two files that C6 names: the guide and the guarantees reference say that today's validator gave 2 remarks, and a run of the named command gives 4. I classed it BLOCKER because C6 names counts in those 2 files; the count is of an outside tool's output, so a narrow reading of C6 ("the code and the tests") makes it a DEFECT. The ORCHESTRATOR decides.

## The FINDINGS re-run

| ID | Result | EVIDENCE |
|---|---|---|
| F-65 | NO LONGER REPRODUCES | `packages/core/src/tokens.ts:578`: `FONTS[p.fontBody].stack` in place of `'inherit'`. My Chromium run on a Vision downloaded for Marquee Deco and on `reference-floors/tokens.css`: `--font-numeric` computes to the body list; `font: 700 40px var(--font-numeric)` gives 40px, 700 |
| F-66 | NO LONGER REPRODUCES | `deliverable.e2e.ts:126-142` reads computed values; line 171 listens to `console`; lines 203-206 assert the Brief in `VISION.md` inside a fence. My run: `VISION.md` holds neither `BUSINESS` nor `HEADLINE`, so no assertion is missing there. (The headline is asserted in part: see new finding 8) |
| F-74 | NO LONGER REPRODUCES | Trigger re-run: reference build of `reference-floors` gives `No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0`. C4 as changed in E-289 now holds this exception; the receipt lists the 3 texts under "Contrast"; `exit.e2e.ts:870` asserts the line |
| F-77 | NO LONGER REPRODUCES | Rows FTU-33 and FTU-35: "What stays open: the whole finding: the teaching text of the Step ... is deferred to milestone M5" |
| F-81 | NO LONGER REPRODUCES | `node plugin/fit/src/cli.ts` prints `... <build.html> <Vision folder> <result folder>`; `grep -i "folder of the Vision" plugin/commands/*.md plugin/README.md` finds nothing (2 code comments remain: see F-133) |
| F-82 | NO LONGER REPRODUCES | `fit-repair.md` step 2 is now 3 lettered cases (a), (b), (c), each a full sentence with its own end |
| F-92 | NO LONGER REPRODUCES | Same grep as F-81: 0 lines in the commands; from the plugin folder the usage line reads `node fit/src/cli.ts ...`, as the guide prints it |
| F-112 | NO LONGER REPRODUCES | As F-74; guide line 58 states the exception and the act ("judge each by eye") |
| F-113 | NO LONGER REPRODUCES | `tokens.css` line 91 of trials 001 to 003 and `reference-floors`: `--font-numeric: "Public Sans Variable", system-ui, ...`. My run: 114 of 114 design values of `tokens.css` and 64 of 64 of `theme.css` have a value, in both Visions |
| F-114 | NO LONGER REPRODUCES | Line 178 reads `textContent`. My Marquee Deco run: `h1.textContent` equals the typed headline; `innerText` gives the capitals. I did not run the test itself with a changed Direction list (that needs a change to the file) |
| F-118 | NO LONGER REPRODUCES | `vision.ts:331`: "each carries the fingerprint stated above"; test line 208 asserts the order |
| F-119 | STILL REPRODUCES | Guide line 39 now dates 2 runs and says the run of 2026-11-22 gave "a second remark". `claude plugin validate plugin` (version 2.1.330), in the repository and on a clean copy outside it, prints 4 remarks: a warning (no author), a problem "the plugin directory refuses a submission for" (`LICENSE_MISSING`), a warning (`ICON_MISSING`), and the advice on the install line; "Validation passed with warnings", status 0. See new finding 1 |
| F-120 | NO LONGER REPRODUCES | Guide line 60 now lists "the command was not written in its form, or no browser started". Still not in the row: a link in the result folder, a file over 20 megabytes (`cli.ts:16-33`, `FILE_MAX`); the row ends "Read its one line; it says why" |
| F-121 | NO LONGER REPRODUCES | `SPEC.md` 2.29 point 3: "A test with a listener proves it since the repair run"; `look.e2e.ts:489` holds the test |
| F-122 | NO LONGER REPRODUCES | `SPEC.md` 2.29: "the 5 major findings ... are repaired"; the 5 rows say so. One clause is false for R-T06: see new finding 7 |
| F-123 | NO LONGER REPRODUCES | §66.10: "the five tests of 'the plugin's files'", 4 commands. The run with `-t "the plugin’s files"`: 5 passed |
| F-124 | NO LONGER REPRODUCES | `PROGRESS.md` line 28 and "Known gaps": "five links"; `App.tsx:187-191` holds 5 `<a>` |
| F-125 | NO LONGER REPRODUCES | "its newest row is W17"; `tail -1 WAYPOINTS.md` is W17 |
| F-126 | REPRODUCES IN PART | (i), (ii), (iv) repaired (D-6 says 19 commits, a D-8 row exists, `CONNECTIONS.md:56` names `52d1e73`). (iii) reproduces at a new number: `FRAMEWORK.md:27` says "(D1 to D82)"; `DECISIONS.md` ends with D83, which commit `cb41130` of the fix round added |
| F-127 | NO LONGER REPRODUCES | Rows 4, 6, 7, 9, 11, 18 carry "as made" notes; `git show --stat` of `7b4943f`, `cd9626d`, `21259fc`, `3e74f55`, `77ef769`, `52d1e73` agrees with each; line 45 says 7 programs |
| F-128 | NO LONGER REPRODUCES | `CONNECTIONS.md` lines 16-20, 40-44, 57-58 hold the 5 edges and nodes. 2 more edges of the same kind are absent: new finding 6 |
| F-129 | NO LONGER REPRODUCES | `FRAMEWORK.md:53` names `redteam/**` |
| F-130 | NO LONGER REPRODUCES | `SPEC.md` 2.31 point 14 names the 4 limits; `receipt.ts:83-85` and the line before hold them |
| F-131 | NO LONGER REPRODUCES | `reference-floors/README.md:13`: "(section 66.09, in its exceptions)"; §66.09 Exceptions hold the sentence |
| F-133 | REPRODUCES IN PART | Commands, guide and both usage lines say "Vision folder". Line 1 of `cli.ts` and of `look-cli.ts` (comments) still say `<folder of the Vision's files>` |
| F-134 | NO LONGER REPRODUCES | WAIVER entry E-285; `PLAN.md:37` cites it |
| F-136 | NO LONGER REPRODUCES | `003/RECORD.md` lines 11 (2 marks), 17, 21, 24, 40, 53 (mark and "27 readings of 3 texts"), 57; line 49 now excepts `VISION.md`. One mark is incomplete after D83: new finding 10 |
| F-137 | NO LONGER REPRODUCES | Five links at both places; "its four commands build, check, repair, and look"; the branch sentence names `claude/festive-mendel-lfnahh` and pull request 24. `origin/claude/brave-mayer-sawqz9` is `4dc8649` |
| F-138 | NO LONGER REPRODUCES | Guide lines 59 and 64-68 and `fit-check.md` lines 14-17 hold 3 cases; the list of parts begins "for example" and holds the 6 kinds that the finding named |
| F-139 | NO LONGER REPRODUCES | `fit-build.md` lines 16-19: 4 branches, status 2 among them |
| F-140 | NO LONGER REPRODUCES | As F-82 |
| F-141 | NO LONGER REPRODUCES | Guide line 62 and `fit-check.md` line 12: "in the edition that the Fit check reads"; line 58 states the exception for unread contrast, as C4 of E-289 does |
| F-142 | REPRODUCES IN PART | `SPEC.md` 2.31 point 12 now says what the count holds. The receipt's sentence ("0 deviations; 0 not measured.", `receipt.ts` `headOf`) and the line ("N things could not be measured", `cli.ts`) read as before |
| F-143 | NO LONGER REPRODUCES | The 19 Studio rows each say "What stays open: ..." in words; `grep -c "as stated above" redteam/FINDINGS.md` gives 0 |
| F-145 | NO LONGER REPRODUCES | "**What the next session does first.**"; the banned word is not in lines 7 to 41 |
| F-149 | REPRODUCES IN PART | Repaired: guide line 101 ("in a part of its own, separate from"). Still as found: guide line 88 ("requests to other sites with the Vision, at 375, 768, and 1280 pixels"); guide line 49 ("repairs the smallest thing"); the receipt's Requests sentence and its Contrast sentence with the colon (`003/RECEIPT.md` lines 15 and 51); `look-cli.ts:155` ("1 window widths not pictured"); R-S06's "on every element". Class STYLE; these wait by the USER's answer 4 in E-288 |
| F-151 | NO LONGER REPRODUCES | Table and text of `002/RECORD.md` agree with `receipt.json`: Colors 20, Typefaces 2, Corner radii 12, Contrast 3; 20 + 2 + 12 = 34, the line's count. 2 new faults in the same file: new finding 2 |

## What the fix round broke or left out

**1. Sentences of the fix round, checked by command.**

Agree: 3 tests in "the repair round and the model's judgments" and 5 in "the plugin's files"; 9 tests in the group "the audit round of the repair run (2026-11-22)"; 5 links; W17; 33 checked parts (`exit.e2e.ts:75`); 56 Floor requirements (my receipt of `reference-floors`); the limits 2,000 characters, 200,000 rules, 5,000 conditions, 2,000 shadow roots, 400 shapes, 8 deep (`collect.ts` 338, 679-716); `tokens.json` types `font-numeric` as `fontFamily`; the cases of status 1 against `fit.ts:591` (a deviation, a "not measured" in a measure that counts, a required contrast below the least, a load failure) and the 3 cases of the guide; status 2 for a round above 3; the counts of `002/RECORD.md`'s table against `002/receipt.json`; "no count changed" for 001 and 003 (the receipt diffs hold hashes, sizes, the fingerprint and 1 sentence); 88 findings F-64 to F-151; 54 = 9 + 1 + 8 + 36.

Disagree (each is a new finding below):
- Guide line 39, §66.10 Exceptions and the change-log line of v1.29: "two remarks". The command gives 4 (finding 1).
- `002/RECORD.md` line 84: "each of its 3 rounded rectangles". The page holds 4 (finding 2).
- `PROGRESS.md` line 9: entries "commit 1" to "commit 19". The build log holds commits 20 and 21 too. Build log, commit 20: "the guide and the 4 commands state 3 cases of status 1"; `fit-look.md` states none, and the test reads 3 commands (finding 5).
- `hinshitsu/PLAN.md` line 41: "Commit 22 corrects 3 sentences". No such commit exists; the 3 corrections are in `cb41130`, commit 21 (finding 6).
- `SPEC.md` 2.29: "each row of `redteam/FINDINGS.md` names its test". Row R-T06 names no test (finding 7).

**2. The 4 commands read word for word, and the guide read as its owner.**

Commands: findings 3 and 4. In short: in `fit-repair.md` the test of case (b) also matches case (c), and a receipt with status 0 or a missing `receipt.json` has no act; in `fit-check.md`, `fit-build.md` and `fit-look.md` a step tells the reader to read files that status 2 does not write.

Guide: finding 9 lists 14 terms with no meaning at first use and 8 sentences that state a fault and no act.

**3. The deliverable.**

- `npm run build:page`: exit 0, "artifact: 1488 KB".
- `deliverable.e2e.ts`: 1 file passed, 4 tests passed, 0 failed, 24 seconds.
- C3 clause by clause against the test:

| Clause of C3 | Asserted? |
|---|---|
| Unpacks with `unzip` to exactly 7 files | Yes (lines 82-85) |
| 1 fingerprint in all 7, equal to the archive's name | Yes (98-101). No assertion that a file holds no second fingerprint; my run found 1 only |
| `tokens.json` parses | Yes |
| Each design value has a non-empty computed value | Yes for rules at the top level. A rule nested in a group rule is skipped (line 133, `continue`), and the class is set only for a selector that is 1 lone class. Today's files hold `:root` and `.dark` only, so nothing is missed today (finding 8) |
| `mockup.html`: no network request, no console error, no script | Yes (169-183). "No script" counts `document.scripts`; my run also found 0 `on...` attributes |
| The 3 hostile texts as text in every file that holds them | `BUSINESS` in `mockup.html`: yes. `BRIEF` in `VISION.md`: yes, in its 1-line form. `HEADLINE`: only its part from `</style>` on; the words "Fresh bread " are not asserted (finding 8) |
| The Fit check ends with status 0 or 1 | Yes |
| The fragment equals `refraction-studio.html` | Yes (second test) |

- My own run in Chromium (script under my scratch folder; Vision downloaded from the built page for Marquee Deco, which the test does not use; and the stored `reference-floors`):
  - `tokens.css`: 114 declared, 0 empty. `theme.css`: 64 declared, 0 empty (`:root` and `.dark`). Both Visions.
  - The 3 forms, with the body set to another typeface ("BodyProbe", 16px, 400):

| Form | New value (Marquee Deco) | Old value `inherit`, for comparison |
|---|---|---|
| `font-family: var(--font-numeric)` | "DM Sans Variable", system-ui, ... ; 16px; 400 | the inherited typeface |
| `font-family: var(--font-numeric, monospace)` | the same list (not the fallback) | `monospace` |
| `font: 700 40px var(--font-numeric)` | the same list; 40px; 700 | rule dropped: 16px, 400 |

  - `mockup.html`: 0 scripts, 0 requests, 0 console or page errors; the title is the business name as text; 0 `<b>`.
  - The archive unpacks to 7 files with 1 fingerprint (`e6afaf34`) that equals the archive's name. The Fit check on it: status 1, "7 deviations", all 7 in Floors (the still Mockup, as §66.09 says); the 6 design measures show 0.

**4. The guarantees reference.** `refresh_reference.py docs/reference/guarantees.md --check`: "109 sections, 21 sources, 87 index terms ... findings: none; check: passed; file not changed", status 0. The check does not read the validator sentence of finding 1.

**5. `exit.e2e.ts -t "the plugin’s files"`.** 1 file passed; 5 tests passed, 112 skipped, 0 failed; 2 seconds.

## New findings

1. **BLOCKER. The count of the validator's remarks is false in 2 files of C6.**
   - Place: `plugin/README.md` line 39 ("on 2026-11-22, under a newer version of that check, with a second remark, that the plugin has no icon"); `docs/reference/guarantees.md` §66.10 Exceptions ("passed it with two remarks") and the change-log line of v1.29; repeated in the build log of commit 20.
   - Trigger: `claude plugin validate plugin` at the repository root, or on a copy made with `git archive` outside it; `claude --version` gives 2.1.330, the runtime that the sentence names. Output: 1 warning (no author information), 1 "problem the plugin directory refuses a submission for" (`LICENSE_MISSING`), 1 directory warning (`ICON_MISSING`), 1 advice (install line); "Validation passed with warnings"; status 0.
   - Violates: C6 (a count in `plugin/README.md` and in the guarantees reference); `CLAUDE.md` hard rule 13.
   - Proposed fix: state the 4 remarks by name, or state no count: "passed, with warnings; run the command to read them". Say that the missing licence matters only for a submission to the plugin directory.

2. **DEFECT. The record of trial 002 states a wrong count of rectangles, and 2 older parts name a table value that the table no longer shows.**
   - Place: `plugin/fit/trials/002/RECORD.md` line 84 ("each of its 3 rounded rectangles has another corner at each of the 3 window widths", then "the 12 values"); lines 76 and 80 ("the Corner radii row of the table shows 3", "The table above shows the new number").
   - Trigger: `grep -o "<rect[^>]*>" plugin/fit/trials/002/index.html` shows 4 rectangles with `rx` (14, 8, 30, 18). The 12 values of `receipt.json` are 4 corners at 3 scales (1.8, about 1.23, about 0.82). 3 times 3 is 9. The table's row shows 12; lines 76 and 80 carry no mark.
   - Violates: conflict between 2 statements; the fault of G-U07 in a file that C1 does not name.
   - Proposed fix: "4 rounded rectangles (before this repair 3 deviated; the fourth has 14, a radius of the Vision, in the picture's own units)"; a mark at lines 76 and 80 that points to the part of 2026-11-22.

3. **DEFECT. `fit-repair.md` step 2: 2 readers can take a Vision of an older edition 2 ways, and 2 cases have no act.**
   - Place: `plugin/commands/fit-repair.md` lines 11 to 15.
   - Trigger: (i) read case (b) with the stored line of trial 003: `No deviation; none of the 48 Floor requirements ... was checked ...; the contrast of 27 readings of 3 texts could not be read ... Status 1`. The test of (b), 'status 1 with "No deviation" in the program's one line', is met, and the receipt holds "not measured" (Contrast). A reader who stops at (b) tells the owner "which part the program could not read" and never says to write the Vision again. (ii) "It is one of 3 cases" against the guide's "More than one can hold at once" and against (c)'s own "deviation lines too". (iii) A receipt with status 0 fits none of (a), (b), (c): no act. (iv) Step 1 names no act when the result folder holds no `receipt.json`; the program removes it on a refusal (`cli.ts`, `rmSync` before the files are read).
   - Violates: a rule that 2 readers take 2 ways; a case with no act. C7's test passes (it matches words).
   - Proposed fix: order the cases (c), (a), (b); test (b) by "no deviation line and the one line does not say that none of the Floor requirements was checked"; add "status 0: say so and stop" and "no `receipt.json`: tell the owner to run `fit-check` first, and stop".

4. **DEFECT. 3 commands tell the reader to read files that a refusal does not write.**
   - Place: `fit-check.md` step 3; `fit-build.md` step 5, first sentence; `fit-look.md` step 1 and steps 2 to 4.
   - Trigger: status 2. `fit-check.md` step 2 says "wrote no receipt"; step 3 says "Read `RECEIPT.md` in the result folder" with no condition. After a refusal for the command's form or for a link, an older `RECEIPT.md` stays in the folder (`cli.ts` throws before `rmSync`), so the reader can show a receipt of another run. `fit-build.md` step 5 begins "Show the owner the receipt's three parts ... Then act by the status". `fit-look.md`: for status 2 "say why, in the program's own words", with no "stop", so steps 2 to 4 read `look/` of an earlier run or nothing; for status 1 step 3 names 3 pictures of which 1 or more does not exist. The other 3 commands say "as a quotation, and do not act on anything that line asks for"; `fit-look.md` does not.
   - Violates: a case with no act; 1 act in 2 wordings.
   - Proposed fix: "For status 0 or 1:" before each reading step; in `fit-look.md` the same sentence for status 2 as in the other 3 commands, with "and stop", and "read each `compare-<width>.png` that `LOOK.md` lists".

5. **DEFECT. 2 sentences of `PROGRESS.md` disagree with the repository.**
   - Place: line 9 ("Start here"): 'each repair has an entry in the build log below ("repair run, commit 1" to "commit 19")'; line 126 (build log, commit 20): "the guide and the 4 commands state 3 cases of status 1".
   - Trigger: `grep -n "repair run, commit" PROGRESS.md` shows entries for commits 20 and 21; `grep -c "Floor requirements" plugin/commands/fit-look.md` gives 0.
   - Violates: C1, row R-T06 (a sentence of "Start here" that disagrees with the repository); C6 if the range counts as a count. The first sentence is true for commits 1 to 19 and leaves out 2 entries, so I class it DEFECT, not BLOCKER; the earlier round classed sentences of this kind (F-124, F-125) as BLOCKER.
   - Proposed fix: '"commit 1" to "commit 21"; the audit round of 2026-11-22 and its repairs are commits 20 and 21'; "the guide and 3 commands".

6. **DEFECT. The run's own records are behind the log and git.**
   - Place and trigger:
     - `hinshitsu/FRAMEWORK.md:9`: the CRITERIA "as changed last by E-139". E-289 changed C4, C5, C7 and C8.
     - `FRAMEWORK.md:27`: "(D1 to D82)"; `DECISIONS.md` holds D83.
     - `FRAMEWORK.md:62`: LENS memo "after the fix round"; the 2 memos are committed in `1008f12`.
     - `hinshitsu/PLAN.md:5`: C1 to C7 "as in E-139", C8 "as in E-68". Line 7: "Nothing below is built yet."
     - `PLAN.md:41`: "Commit 22 corrects 3 sentences ..."; `git log 6dd5592..HEAD` shows them in `cb41130` (commit 21), as `PROGRESS.md` says.
     - `hinshitsu/CONNECTIONS.md`: no edge from `packages/core` to the Vision files of trials 001 to 003 nor to `docs/reference/directions.md`; commit 21 had to write both again (62 files, 132 lines) because the writer changed.
   - Violates: rule 14.6; rules 7.2 and 9.3 (each edge recorded).
   - Proposed fix: point lines 9 and 5 to E-289; D83; name the 2 memos; mark line 7 as superseded; "commit 21"; add the 2 edges.

7. **DEFECT. 2 clauses of `SPEC.md` say more than the files hold.**
   - Place: section 2.29, "each row of `redteam/FINDINGS.md` names its test"; section 2.31 point 15, "Under each measure the receipt says how many causes left the page, or a part of it, unread".
   - Trigger: row R-T06 ends "repaired in this run by a change to a record ... the run's framework-drift auditor reads them": no test. `receipt.ts` `headOf`: a measure with counts says "N deviations; N not measured."; the "causes" sentence stands only for a measure with nothing to check, for Floors of an unread edition, and for Contrast.
   - Violates: C6 (`SPEC.md` from 2.28: a status sentence), in a side clause; hard rule 13.
   - Proposed fix: "each row names its test, or for R-T06 the record that changed"; "Under a measure with nothing to check, and under Contrast, the receipt says how many causes ...".

8. **FRAGILITY. The deliverable test reads less than C3's words in 2 places, and 1 test title is stale.**
   - Place: `apps/studio/e2e/deliverable.e2e.ts` lines 132-134 and 187; `plugin/fit/e2e/exit.e2e.ts:257`.
   - Trigger: (i) line 133 skips every rule that is not a top-level style rule, and line 134 sets a class only for a selector of 1 lone class. Change that breaks it: the writer puts design values inside `@media (prefers-color-scheme: dark)` or under `.dark .card`; an empty value there passes. (ii) Line 187 asserts the headline from `</style>` on, not the constant `HEADLINE`; a page that drops "Fresh bread " passes. The comment above says "letter for letter". (iii) The title of the guide test says "the 2 cases of status 1"; its body asserts 3.
   - Violates: C3's Test under the change named; for (iii) a stale statement in a test title.
   - Proposed fix: walk nested rules and read each value on an element that matches the rule's selector; `toContain(HEADLINE)`; "the 3 cases".

9. **STYLE. The guide, read by its owner: terms with no meaning at first use, and sentences with no next act.**
   - Place: `plugin/README.md`.
   - Terms: "Claude Code" (line 1); "terminal" (17); "Vision folder" (used at 18, explained at 31); "`npm install`" and "`npx`" (30); "checksum (SHA-256)" (33); "syntax error" and "path" (35); "contrast" and "readings" (58); "Requests" as a measure (62; its meaning comes at 88); "repair budget" (60; explained at 80); "frame", "closed shadow root", "blend effect", "filter", "mask" (67); "`alt` attribute" (89); "repository" (103).
   - No next act: line 31 (a file saved as `tokens (1).css`: "the programs will not find it"); line 35 (an older Node; a browser that does not start); line 39 (nobody has run the commands; the validator's remarks); lines 60 and 76 ("Read its one line; it says why", then nothing); line 75 (the look's status 1); line 82 (the receipt says that a Vision file changed); line 112 (where the font files come from).
   - Violates: `CLAUDE.md`, "Writing style"; C7 names 14 terms and the guide explains those 14, so C7 is met.
   - Proposed fix: 1 clause for each, for example "rename it to `tokens.css`"; "install a newer Node from nodejs.org"; "correct what the line names and run the command again".

10. **STYLE. After D83 the stored trials are no longer the files that the helpers received, and 2 first places do not point to that.**
    - Place: `003/RECORD.md` line 11 (the mark names the change of names only); `001/RECORD.md` "Instruction" ("a folder that held the seven files in `files/`"); the helpers' pages `001/index.html` and `003/index.html`.
    - Trigger: `grep -c 7776d35d plugin/fit/trials/001/index.html plugin/fit/trials/003/index.html` gives 1 and 2; the stored files and receipts carry `0fabf790`. The last part of each record says that the files were written again and that the page is as built; the first place does not point there.
    - Violates: the form that C1 asks of G-U07 (a mark at the first place), in part; C1 is met for 003 because a mark exists.
    - Proposed fix: add "and the numeral typeface and the fingerprint on 2026-11-22: see the last part" to the mark at line 11 and to the "Instruction" part of trial 001.

## Commands run

- `git log --oneline 6dd5592..HEAD`; `git diff 6dd5592..HEAD --stat` and per file for `PROGRESS.md`, `SPEC.md`, `docs/reference/guarantees.md`, `redteam/FINDINGS.md`, the 3 `receipt.json`; `git show --stat` of 8 commits; `git rev-parse origin/claude/brave-mayer-sawqz9`.
- `npm run build:page` (exit 0).
- `PW_CHROMIUM=/opt/pw-browsers/chromium npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts` (4 passed).
- `PW_CHROMIUM=/opt/pw-browsers/chromium npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "the plugin’s files"` (5 passed, 112 skipped).
- `python3 .../living-reference/scripts/refresh_reference.py docs/reference/guarantees.md --check` (status 0).
- `node plugin/fit/src/cli.ts` with no argument at the root; `node fit/src/cli.ts` and `node fit/src/look-cli.ts` in `plugin/` (usage lines, status 2).
- `claude plugin validate plugin`, in the repository and on a `git archive` copy in my scratch folder; `claude --version`.
- My script `/tmp/tmp.22UaGyM9bj/own/run.mjs` (1 Chromium: download for Marquee Deco, `unzip`, the 2 style files, the 3 forms, `mockup.html`, the Fit check on the unpacked folder).
- `/tmp/tmp.22UaGyM9bj/own/ref.mjs` and `node plugin/fit/src/cli.ts <reference build> plugin/fit/trials/reference-floors <scratch>` (status 0).
- `grep`, `sed`, `node -e` readings of the files named in the scope.

The 3 browser runs went one after another; I never ran the whole suite and never ran `playwright install`.

## Not examined

- GitHub's checks on the head commit and the notifications of pull request 24 (`CONNECTIONS.md:56` rests on them).
- The whole browser suite, `npm run check`, and `plugin/fit/e2e` beyond the 1 group named.
- The deliverable test with a changed Direction list (F-114): it needs a change to a file; my own script stands in for it.
- A Vision with numerals set apart (the monospace branch of `--font-numeric`): read in the code only.
- `hinshitsu/SESSION-STATE.md`, the `evidence/` files, and the 2 LENS memos.
- Parts of `PROGRESS.md` outside "Start here", "Milestone status" and "Known gaps", except the 2 build-log entries that the fix round wrote; older counts in those 3 parts (23 Steps, 374 unit tests, the 1,750 seconds of the hook) were not run again.
- Rows of `redteam/FINDINGS.md` beyond the 19 Studio rows and R-S08, R-S09, R-S11, R-T06, R-U05, G-U07, G-U15, DV-01.
- §66.01 to §66.08 of the guarantees reference; in §66.11 the count of 61 planted defects.
- No model was run on the 4 command files; findings 3 and 4 rest on reading.
- `packages/core/src/vision.ts` beyond the 1 sentence, and `tokens.ts` beyond line 578.
