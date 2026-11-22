afab9c2d0dfff6fdc

identifier: not visible to me

# Language audit of the plan (S5) — commit 219108a

## Scope received

```
# Role scope — Language auditor

You are an AUDITOR in a hinshitsu run (rule 13.1). You hold 1 role.

## Your job

Read the CRITERIA, the `VOC` entry, every word a RECIPIENT reads, and the delivery report where it exists. Apply the categories of ambiguity in Kenneth A. Adams, *A Manual of Style for Contract Drafting*: lexical ambiguity; syntactic ambiguity (modifiers, "and" and "or", plurals); vagueness; undue generality; inconsistency (1 thing with 2 names, 1 name for 2 things); conflict between 2 statements; a rule with no actor; a rule that a third party cannot test. Report every banned word: "should", "shall", "appropriate", "reasonable", "proper", "adequate", "ensure", "try to", "as needed", "if possible", "generally", "typically".

## Filled in by the ORCHESTRATOR

- DELIVERABLE and files to examine: the planning entries E-9 (`VOC`), E-10 (`GAP`), E-13 (`ASSUMPTION`) and E-14 (`CRITERIA`) of `hinshitsu/AUDIT-LOG.md`, and `hinshitsu/PLAN.md` (rule 13.3: the CRITERIA are `PROPOSED`)
- Commit under review: the commit of the working branch that holds this scope file (the LAUNCH entry names it)
- Files to read:
- `hinshitsu/AUDIT-LOG.md`: entry E-9 (`VOC`), E-10 (`GAP`), E-13 (`ASSUMPTION`), E-14 (`CRITERIA`, `PROPOSED`). No `DECISION` entry exists yet.
- `hinshitsu/PLAN.md` (the plan), `hinshitsu/FRAMEWORK.md`, `hinshitsu/CONNECTIONS.md`
- `hinshitsu/evidence/open-major-859c643.txt`, `hinshitsu/evidence/open-findings-859c643.txt`, `hinshitsu/evidence/a5-checks.txt`
- The DELIVERABLE at this commit: `plugin/` (the Fitter: `plugin/README.md`, `plugin/commands/`, `plugin/fit/src/`, `plugin/fit/e2e/`), `apps/studio/` (the Studio), `packages/core/` (the core), `redteam/FINDINGS.md`, `SPEC.md` (sections 2.28 to 2.30), `PROGRESS.md`, `CLAUDE.md`
- Glossary: `/root/.claude/plugins/synced/2ba04e91-bb35-46bd-9611-dd981ae6b7ec_3811a0d8-9163-4304-a28a-44f4a2b6e87c/hinshitsu-all/skills/hinshitsu/GLOSSARY.md`

## Report

Write 1 report, in Markdown, in this order:

1. First line: the identifier that your runtime gave this run (session ID, task ID or agent ID). If you cannot read it, write `identifier: not visible to me`.
2. `## Scope received` — this scope, word for word.
3. `## Examined` — each file with line ranges, each command you ran with its complete output, each page you opened with what you did.
4. `## Findings` — number them 1, 2, 3. For each: **Class** (BLOCKER, DEFECT, FRAGILITY or STYLE, as `GLOSSARY.md` defines them); **Where** (file and line, or artifact and heading); **Trigger** (the exact steps, input or command that reproduce it, and what appears); **Violates** (the CRITERION ID or the rule number); **Proposed fix**.
5. `## Not examined` — what you did not examine, and why.

## Limits

- You did not build this work. Do not change the DELIVERABLE or any file in the RUN FOLDER; propose each fix in your report.
- Read only the files this scope names, and files those files reference.
- Report what you observed. Do not report a check that you did not run. A check that you cannot run is UNVERIFIED, with the reason.
- If you find nothing, say so, and list under `Examined` what you checked. Do not invent a finding and do not withhold one.
- Where your scope holds the heading `Accepted by the USER — do not report`, do not report a fault listed under it (rule 15.7). A new fault at the same place is a finding.

## Note on this runtime

The repository is at `/home/user/Frontend`. You cannot write a file in this runtime: return your whole report as the text of your final answer, and the ORCHESTRATOR saves it word for word. You may run read-only commands. To run the Fit check: `export PW_CHROMIUM=/opt/pw-browsers/chromium`, then `node plugin/fit/src/cli.ts <build.html> <Vision folder> <result folder>` with a result folder under `/tmp`. Do not run `npm run e2e` (it takes about 40 minutes), and never run `playwright install`.

## The CRITERIA, word for word (entry E-14)

### E-14 · 2026-11-21T18:28:12Z · CRITERIA · orchestrator

- Status: PROPOSED
- Approval: approval: pending

The DELIVERABLE is the repository at the final commit of the working branch `claude/festive-mendel-lfnahh`, in the 3 forms its RECIPIENTS receive: the built Studio page (`apps/studio/dist/artifact/refraction-studio.html`, written by `npm run build:page`), the Vision that this page hands over, and the Fitter's folder `plugin/`.

- C1. Each of the 16 rows of `redteam/FINDINGS.md` listed in `evidence/open-major-859c643.txt` ends the run in exactly 1 of 2 states: (a) closed, and its Status names a test in the repository that fails when the fix is taken out; or (b) kept, and its Status states the reason and names who must act (the owner, or a later milestone). Planned for state (a): U7-02, A2-V4, G-S05, R-S09, R-S11, R-T06, R-U05. Planned for state (b): R-12, FTU-21, FTU-22, FTU-32, P9-05, G-S11, G-T08, R-S06 (its rest), R-S08. Test: the correctness auditor reads each of the 16 rows at the final commit; for each row in state (a) it runs the named test, then takes the fix out in a copy and sees the test fail.
- C2. Each of the 3 findings of the automatic reviewer on pull request 16 (a text inside a box that scrolls is read as cut away; SVG text is left out of the typefaces and contrast measures; a field with an empty label counts as labelled) is shown true or false by a test in `plugin/fit/e2e/`; each true one is fixed, and its test passes. Test: `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e` reports 0 failed, and the correctness auditor finds the 3 tests by name.
- C3. The Vision that the built Studio page hands over works as its RECIPIENT gets it: the archive unpacks with `unzip` to exactly 7 files; each file carries the same fingerprint; `tokens.json` parses; a browser keeps every design value of `tokens.css` and `theme.css`; `mockup.html` opens from the unpacked folder with no network, no error and no script; texts typed with signs that code could misread stay text; the Fit check reads the folder. Test: `npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts` reports 3 passed; and the recipient-experience auditor does the same by hand for 1 Direction that the test does not use.
- C4. For each of the 3 stored trials (`plugin/fit/trials/001`, `002`, `003`) and for the reference build, the Fit check's summary line and its `RECEIPT.md` agree: the number that the line calls deviations equals the sum of the numbers that the receipt calls deviations; status 0 goes only with "No deviation" and with nothing "not measured" in a measure that counts; and no sentence of the receipt says that the program did something it did not do. Test: the test "says nothing in the receipt that disagrees with its own summary line" in `plugin/fit/e2e/exit.e2e.ts` passes, and the language auditor reads the 3 receipts.
- C5. At the final commit, `npm run check` exits 0 on the building machine, the Fit check's browser tests and the deliverable test report 0 failed on the building machine, and GitHub's checks "check" and "Outside validators" succeed on that commit. The run pushes to the working branch only. Test: the saved output of the 2 local commands under `evidence/`, and the check runs of pull request 24 as GitHub reports them, read by the final AUDITOR.
- C6. Each sentence that states a count, a command, an option, a status of a finding or a state of a milestone, in `PROGRESS.md` (the parts "Start here", "Milestone status" and "Known gaps"), in `SPEC.md` sections 2.28 to 2.30 and in `plugin/README.md`, agrees with the code and the tests at the final commit. Test: the framework-drift auditor reads those parts and checks each such sentence with a command, and `python3 <living-reference>/refresh_reference.py docs/reference/guarantees.md --check` exits 0.
- C7. `plugin/README.md` names each of the 4 commands, each option of `plugin/fit/src/cli.ts` and of `plugin/fit/src/look-cli.ts`, and each status (0, 1, 2) of both programs with what the owner does next; and it gives each technical term a meaning of 1 sentence at its first use. Test: a test in `plugin/fit/e2e/exit.e2e.ts` compares the options and statuses in the guide with each program's usage line and passes; the language auditor reads the guide.

Outside these CRITERIA, and said so: the 149 open rows of grade minor and note; the Studio's layout on a phone-wide window (FTU-32); a build by an AI coding tool inside Claude Code (G-T08); the owner's trial of the Studio (milestone M4).
```

## Examined

Files read (at commit 219108a; `git log --oneline -3` gave `219108a`, `79d7310`, `cbfbc60`; `git status --short` printed nothing):

- `hinshitsu/prompts/S5-language-plan.md`, lines 1-60 (whole).
- `GLOSSARY.md` at the path the scope names, lines 1-99 (whole).
- `hinshitsu/AUDIT-LOG.md`, lines 1-30 and 75-200 (E-1, E-2, E-9 to E-16). Lines 31-74 (E-3 to E-8) not read.
- `hinshitsu/PLAN.md`, lines 1-31 (whole).
- `hinshitsu/FRAMEWORK.md`, lines 1-57 (whole). `hinshitsu/CONNECTIONS.md`, lines 1-46 (whole).
- `hinshitsu/evidence/open-major-859c643.txt`, lines 1-18 (whole). `hinshitsu/evidence/a5-checks.txt`, lines 1-20 (whole). `hinshitsu/evidence/open-findings-859c643.txt`: lines 1-12, cut at 400 characters, and a count of all rows by grade.
- `plugin/README.md`, lines 1-60 (whole).
- `plugin/commands/fit-build.md` (1-21), `fit-check.md` (1-19), `fit-look.md` (1-26), `fit-repair.md` (1-24), each whole.
- `plugin/fit/trials/001/RECEIPT.md`, lines 1-92 (whole, each line cut at 900 characters). `plugin/fit/trials/002/RECEIPT.md`: lines 61-72 and the count lines. `plugin/fit/trials/003/RECEIPT.md`: lines 65-67, the count lines, and its last 7 lines (88-94).
- `plugin/fit/src/cli.ts` and `look-cli.ts`: only the lines that match `Usage`, `--<option>`, `process.exit` (cli.ts 9, 73, 74, 80, 137, 142; look-cli.ts 1, 10, 85, 86, 126, 129).
- `plugin/fit/e2e/exit.e2e.ts`: the `describe` and `it` title lines, and lines 363-390. `apps/studio/e2e/deliverable.e2e.ts`, lines 1-60.
- `.github/workflows/ci.yml`: lines 8-26, 50-54, and the `name:` lines. `package.json`: lines 20, 21, 24, 25.
- `SPEC.md`, lines 462-500 (sections 2.28, 2.29, start of 2.30, each line cut at 700 characters). `PROGRESS.md`: heading lines, and lines 44, 48-50, 631. `redteam/FINDINGS.md`: line numbers of rows R-S08 (829) and FTU-22 (125) only; the 16 rows were read in the evidence copy.
- `CLAUDE.md`: as shown to me by the runtime.

Commands run (all read-only apart from 3 result folders in my scratchpad):

1. Banned-word search: `grep -niE '\b(should|shall|appropriate|reasonable|proper|adequate|ensure|try to|as needed|if possible|generally|typically)\b'` over `hinshitsu/AUDIT-LOG.md`, `PLAN.md`, `FRAMEWORK.md`, `CONNECTIONS.md`, the 2 evidence files `open-major` and `a5-checks`, `plugin/README.md`, `plugin/commands/*.md`, `plugin/fit/trials/*/RECEIPT.md`, `CLAUDE.md`. Output: 1 line, `hinshitsu/evidence/open-major-859c643.txt:14` (row R-S08; the output was cut at 330 characters, and the word stands in the Status cell: "should a required text of no contrast count as missing?"). The same search over `plugin/fit/src`, comment-only lines left out: 1 line, `plugin/fit/src/look.ts:187` ("A caller that passes its own browser should launch it with these.", inside a block comment).
2. Count of open rows: `grep -c .` on `open-findings-859c643.txt` gave 166 (1 command line and 165 rows); by grade: blocker 2, major 14, minor 90, note 59.
3. The Fit check on the 3 stored trials, with `PW_CHROMIUM=/opt/pw-browsers/chromium`, result folders under my scratchpad. Complete output of the summary lines:
   - 001: `No deviation; the contrast of 3 texts could not be read (this does not change the status). Status 0. Receipt: …/r001/RECEIPT.md`, exit 0; `diff -q` against the stored `RECEIPT.md`: same.
   - 002: `22 deviations; 3 text readings below the usual contrast (information: this Vision does not require it). Status 1. Receipt: …/r002/RECEIPT.md`, exit 1; same as stored.
   - 003: `No deviation; 1 thing could not be measured; the contrast of 3 texts could not be read (this does not change the status). Status 1. Receipt: …/r003/RECEIPT.md`, exit 1; same as stored.
   - Count lines of each receipt (cut at 110 characters): 001: 0/0 for Requests, Colors, Typefaces, Radii, Content, Width, Floors; Contrast "0 below the usual least (information: not counted as deviations); 27 not measured". 002: Colors 20 deviations, Typefaces 2, the others 0; Contrast "3 below the usual least …; 0 not measured". 003: all 0 deviations; Contrast "27 not measured"; Floors "0 deviations; 1 not measured".
4. Searches: `grep -n "Milestone status"` in `PROGRESS.md` (line 44, a bold paragraph, not a heading); `grep -rn refresh_reference` (found only in the 5 scope files under `hinshitsu/prompts/`); `grep -n "three commands\|four commands"` (`plugin/README.md:15` "four commands", `SPEC.md:375` "three commands", `SPEC.md:483` "four commands"); `grep -n "Honest receipt"` in the guide and commands (only `plugin/commands/fit-check.md:2`); `ls apps/studio/dist/artifact` (`local-test.html`, `refraction-studio.html`).

No page was opened in a browser by me; the Fit check opened the 3 trial pages itself.

## Findings

A note on class: the CRITERIA are `PROPOSED` and nothing is built, so no finding below is "the DELIVERABLE fails a CRITERION". Findings 1 to 6 each make a CRITERION impossible to meet or to test as written; I class them DEFECT, and each becomes a BLOCKER by glossary part (a) if the text is frozen unchanged.

**1. C1 lists FTU-32 and G-T08 as inside the CRITERIA, and the closing sentence lists them as outside.**
- Class: DEFECT. Category: conflict between 2 statements.
- Where: `AUDIT-LOG.md` E-14, C1 (line 178) and "Outside these CRITERIA" (line 186); the same in `PLAN.md` lines 19 and 31.
- Trigger: read C1 "Planned for state (b): … FTU-32 … G-T08", then line 186 "Outside these CRITERIA … (FTU-32) … (G-T08)".
- Violates: rule 13.1 language category "conflict"; GLOSSARY "CRITERION" (a named test).
- Proposed fix: line 186 to read "Not repaired in this run (each is a row in state (b) of C1): the phone-wide layout (FTU-32); a run of the commands inside Claude Code (G-T08)". Keep "outside" only for the 149 rows and M4.

**2. C1 state (b) cannot hold for R-12 and FTU-22, and "exactly 1 of 2 states" cannot hold for R-S06.**
- Class: DEFECT. Category: conflict; a rule a third party cannot test.
- Where: E-14 C1; `evidence/open-major-859c643.txt` lines 3, 5, 13.
- Trigger: R-12's Status says "the breach cannot be undone": no one "must act", yet (b) requires the Status to name who must act. FTU-22's Status ends "Closed on 2026-11-15: the owner approved …", yet the row is planned as "kept". R-S06 is "(its rest)": 1 part is repaired with a test and 1 part stays, so the row is in both states.
- Violates: C1 against itself.
- Proposed fix: define 3 states: (a) closed with a named test; (b) kept, with the reason and who must act; (c) closed with no code change, and the Status says why (R-12, FTU-22). State that a row repaired in part counts as (b) and names both its test and its rest.

**3. U7-02 is planned as closed in C1, optional in the plan, and excluded by PREMISE A-9.**
- Class: DEFECT. Category: conflict among 3 statements.
- Where: E-14 C1 ("Planned for state (a): U7-02"); `PLAN.md` line 17 ("only if the USER wants it changed"); E-13 A-9 ("No fix of this run changes a screen of the Studio").
- Trigger: read the 3 lines together.
- Violates: C1; rule 13.1 "conflict".
- Proposed fix: C1 to say "U7-02: state (a) if the USER approves the change on the S6 card, otherwise state (b)". A-9 to say "No fix other than U7-02 …".

**4. C1 requires a failing test for R-T06 and R-U05 in part; the plan names a reading, not a test, for R-T06.**
- Class: DEFECT. Category: conflict; untestable rule.
- Where: E-14 C1 state (a) and its Test; `PLAN.md` line 18 (Test column: "the framework-drift auditor's reading").
- Trigger: C1's test says the auditor "runs the named test, then takes the fix out in a copy and sees the test fail". A corrected sentence in `PROGRESS.md` has no test in the repository.
- Violates: C1.
- Proposed fix: either move R-T06 to a state that a reading proves (see state (c) in finding 2, with C6 as its test), or name the test that reads `PROGRESS.md`.

**5. The translation table in the VOC points 6 rows at CRITERIA that do not say what the row says.**
- Class: DEFECT. Category: conflict; inconsistency.
- Where: E-9 lines 101, 107, 108, 109, 110; E-10 lines 132 (G9) and 139 (G16).
- Trigger, row by row:
  - Line 101: "the bugs that this run's independent auditors find in the product are fixed or accepted by the USER by name → C2". C2 covers only the 3 findings of the reviewer on pull request 16. No CRITERION covers the auditors' findings (VA2 at line 115 repeats the promise).
  - Line 107 (O1): "no known way remains by which a page with a hidden or missing required text gets status 0, except those stated in the receipt → C1, C4". Neither says this, and R-S08 (such a way) is planned as kept.
  - Line 109 (O3): "each fix is 1 commit with its test and its record → C5". C5 does not mention commits.
  - Line 110 (O4): "`npm run check` and the browser tests pass before each commit of code → C5". C5 speaks of the final commit only.
  - Line 108 (O2): C5 holds the sentence "The run pushes to the working branch only" but its Test does not check it.
  - G16: "inside C1"; the CRITERION is C2. G9: "fix them inside C7" (R-U08, R-U09, G-U19 to G-U21, the programs' messages); C7 covers the guide only, and line 186 puts all minor rows outside.
- Violates: rule 13.1 "conflict"; GLOSSARY "CRITERION".
- Proposed fix: add a CRITERION for the auditors' findings or strike line 101 and VA2's clause; change G16 to C2; decide G9 (add the 5 rows to C7 by ID, or mark G9 "not in this run"); add to C5's test "`git log` of the working branch shows 1 commit for each fix, and the main line's head is unchanged", or strike rows 108 to 110.

**6. C4 names 4 subjects and a test that covers 3, and the test checks the sum for 1.**
- Class: DEFECT. Category: conflict; untestable rule; ambiguity of "the reference build".
- Where: E-14 C4; `plugin/fit/e2e/exit.e2e.ts` lines 363-390.
- Trigger: the named test's title ends "for the three stored trials"; it does not run a reference build. It sums the receipt's deviation counts for trial 002 only (line 380-381). "The language auditor reads the 3 receipts" also leaves the reference build out. "The reference build" is singular, while `exit.e2e.ts` line 50 holds 39 (the plain start and 38 Directions).
- Violates: C4 against its own test.
- Proposed fix: name which reference build (for example "the reference build of the plain start"), extend the test to sum all 4, and write "the language auditor reads the 4 receipts", or strike "and for the reference build".

**7. "A measure that counts" has no definition, in C4, in the guide, or in the command.**
- Class: DEFECT. Category: lexical ambiguity; untestable rule.
- Where: E-14 C4; `plugin/README.md` line 34; `plugin/commands/fit-check.md` line 12.
- Trigger: run the Fit check on trial 001. The line says "Status 0"; the receipt's Contrast measure says "27 not measured". Whether this breaks "status 0 goes … with nothing 'not measured' in a measure that counts" depends on whether Contrast counts, and no text says which measures count.
- Violates: C4; C7 (a term with no meaning at first use).
- Proposed fix: in C4 and in the guide: "The measures that count are Requests, Colors, Typefaces, Corner radii, Content, Width and Floors, and Contrast only where the Vision writes Floor A1."

**8. The summary line and the receipt count contrast in 2 units, and the receipt names the wrong unit.**
- Class: DEFECT. Category: inconsistency (1 name for 2 things).
- Where: `plugin/fit/trials/002/RECEIPT.md` line 61; the summary lines of trials 001 and 002.
- Trigger: run trial 002. The line says "3 text readings below the usual contrast". The receipt says "3 below the usual least" with no unit, then "the lines show texts below the usual least"; the 3 lines are 1 text (`p.promise`) at 3 widths. In trial 001 the line counts texts ("the contrast of 3 texts could not be read") for 27 readings. One summary line family counts readings in one clause and texts in the other.
- Violates: C4 ("agree").
- Proposed fix: receipt: "3 readings of 1 text below the usual least", as the "27 readings of 3 texts" sentence does; summary line: the same pair of numbers in both clauses.

**9. The receipt says "0 not measured" for Floors where it checked nothing.**
- Class: DEFECT. Category: conflict between 2 statements.
- Where: `plugin/fit/trials/001/RECEIPT.md` line 66 (and 002 line 81).
- Trigger: read "0 deviations; 0 not measured. The Vision's section 7 writes no requirement that this program reads, so nothing was checked here." A reader takes "0 deviations; 0 not measured" as "checked and clean".
- Violates: C4 ("no sentence of the receipt says that the program did something it did not do").
- Proposed fix: "Nothing to check: the Vision's section 7 writes no requirement that this program reads." with no count before it.

**10. C5 counts "2 local commands" and names 3 things; "the Fit check's browser tests" has no command.**
- Class: DEFECT. Category: syntactic ambiguity ("and"); untestable.
- Where: E-14 C5.
- Trigger: C5 lists `npm run check`, "the Fit check's browser tests" and "the deliverable test". C2 and C3 give 2 different `vitest` commands for the last 2, which makes 3 commands. C5 also does not require `npm run e2e`, which `CLAUDE.md` verification rule 2 requires after a change to a screen (U7-02), and `PLAN.md` line 7 says "the browser tests of the part changed".
- Violates: C5; `CLAUDE.md` verification rule 2 (conflict with the plan).
- Proposed fix: write the 3 commands in full and "3 saved outputs"; state that the whole browser suite runs on GitHub only (PREMISE A-3) and that the owner is asked to accept this in place of the local `npm run e2e`.

**11. C6's command holds a placeholder, and checks a file that C6 does not name.**
- Class: DEFECT. Category: untestable by a third party.
- Where: E-14 C6: "`python3 <living-reference>/refresh_reference.py docs/reference/guarantees.md --check`".
- Trigger: `grep -rn refresh_reference` finds the script nowhere in the repository; `<living-reference>` is not a path. `docs/reference/guarantees.md` is not among the 3 documents that C6's first sentence lists.
- Violates: GLOSSARY "CRITERION" (a named test); "EVIDENCE" (a third party can open).
- Proposed fix: write the full path of the script, and add "and `docs/reference/guarantees.md`" to the first sentence, or move the command to its own CRITERION.

**12. C7's test cannot compare statuses, and does not compare the 4 commands; "technical term" is not bounded.**
- Class: DEFECT. Category: untestable; vagueness.
- Where: E-14 C7; `plugin/fit/src/cli.ts` line 9; `look-cli.ts` line 10; `exit.e2e.ts` line 244.
- Trigger: the 2 usage lines hold options only, no status, so "compares the … statuses in the guide with each program's usage line" has nothing to compare. The existing test's title says "has three commands". "Each technical term" names no list; in the present guide these have no meaning at first use: plugin, Node, TypeScript, Chromium, environment variable, Floor, edition (defined), Mockup, deviation, markup, status, marketplace, "the three required texts".
- Violates: C7.
- Proposed fix: "the test compares the guide's options with each usage line, the guide's command names with the files in `plugin/commands/`, and the guide's statuses with the statuses that each program can return". Add to C7 the list of terms that the guide must define.

**13. C3's test opens a different file from the one the CRITERIA call the built Studio page.**
- Class: DEFECT. Category: conflict between 2 statements.
- Where: E-14 line 176 (`apps/studio/dist/artifact/refraction-studio.html`); `apps/studio/e2e/deliverable.e2e.ts` line 14 (`../dist/artifact/local-test.html`).
- Trigger: read both lines; `ls apps/studio/dist/artifact` shows 2 files.
- Violates: C3; GLOSSARY "VERIFIED" part (a). I did not compare the 2 files; whether they differ in what C3 tests is UNVERIFIED.
- Proposed fix: state in C3 which file the test opens and why it stands for the built page, or have the auditor's hand run use `refraction-studio.html`.

**14. C3 holds 5 phrases that a third party cannot test as written.**
- Class: DEFECT. Category: syntactic and lexical ambiguity; vagueness.
- Where: E-14 C3.
- Trigger: (a) "each file carries the same fingerprint": the same as what; (b) "a browser keeps every design value": "keeps" has no stated meaning; (c) "texts typed with signs that code could misread stay text": which signs, in which files; (d) "the Fit check reads the folder": no status named; (e) "its RECIPIENT": the VOC names 2 for the Vision (the owner and an AI coding tool). Also "reports 3 passed" fails when a 4th test is added, and "does the same by hand" does not say which clauses.
- Violates: C3.
- Proposed fix: (a) "all 7 files carry 1 fingerprint, and it equals the one in the archive's name"; (b) "each custom property declared in the file has a non-empty computed value in Chromium"; (c) name the 3 test strings of `deliverable.e2e.ts` lines 18-20; (d) "the Fit check ends with status 0 or 1, not 2"; (e) "its RECIPIENTS"; "reports 0 failed and at least 3 passed"; "checks each of the 7 clauses by hand".

**15. C2 does not say what a test that "shows a finding false" looks like, and names no test.**
- Class: DEFECT. Category: vagueness; untestable.
- Where: E-14 C2.
- Trigger: "is shown true or false by a test … the correctness auditor finds the 3 tests by name": no name is given, and a passing test can mean "bug fixed" or "bug never existed".
- Violates: C2.
- Proposed fix: "each finding has 1 test whose title names the finding; the Status in `redteam/FINDINGS.md` or the commit message says 'true, fixed' or 'false', and for 'true' the test fails when the fix is taken out".

**16. One thing has 3 names: "reference build", "clean build", "faithful build".**
- Class: STYLE. Category: inconsistency.
- Where: E-14 C4 ("the reference build"); `PLAN.md` line 11 ("clean builds"); E-13 A-5 ("a faithful build", "clean builds").
- Violates: `FRAMEWORK.md` section 3 (one term for one concept).
- Proposed fix: use "reference build" in all 3 places. Same kind, smaller: "helper runs" and "helpers" (E-10 G7, E-13 A-6) for SUB-AGENT runs; "closed" and "kept" in C1 against the words the Status column uses ("Repaired", "Open", "Stated, not repaired").

**17. The plan's test column holds 3 vague terms.**
- Class: STYLE. Category: vagueness.
- Where: `PLAN.md` lines 13-14: "a cleaned name"; "ends within its time limit" (no limit stated); "a busy page".
- Violates: rule 13.1 "vagueness".
- Proposed fix: state the rule for a cleaned name (which characters stay), the limit in seconds, and the page (for example "a page whose script never returns").

**18. `FRAMEWORK.md` says in section 1 that no CRITERIA entry exists, and at its end that E-14 is the newest.**
- Class: DEFECT (GLOSSARY: an out-of-date statement in a file of the RUN FOLDER).
- Where: `hinshitsu/FRAMEWORK.md` line 7 against line 56. Section 6 (line 46) and section 2 (line 13) are also still empty, while `PLAN.md` cites D-1 to D-7 only through E-13.
- Violates: rule 14.6.
- Proposed fix: line 7 to read "The CRITERIA are in `AUDIT-LOG.md` E-14 (`PROPOSED`)."

**19. The guide and the commands use "the program" for 2 programs, and "receipt" for the defined term "Honest receipt".**
- Class: STYLE. Category: inconsistency (1 name for 2 things; 1 thing with 2 names).
- Where: `plugin/README.md` line 26 ("A second program (the look)") against the heading at line 30 ("What the program's status means") and line 50; "receipt" throughout the guide against "Honest receipt" in `CLAUDE.md` and `plugin/commands/fit-check.md` line 2; "Vision folder" (line 9) against "folder of the Vision" (lines 23-26).
- Violates: `CLAUDE.md` writing style (one term per concept); C7 once frozen.
- Proposed fix: "the Fit check" and "the look" in every heading and table; define "receipt (the Honest receipt)" once at line 3.

**20. Banned words: 2 occurrences.**
- Class: STYLE.
- Where: `redteam/FINDINGS.md` row R-S08, Status cell (copied at `evidence/open-major-859c643.txt` line 14): "should a required text of no contrast count as missing?"; `plugin/fit/src/look.ts` line 187 (code comment): "A caller that passes its own browser should launch it with these."
- Trigger: the grep of Examined item 1. No banned word stands in E-9, E-10, E-13, E-14, `PLAN.md`, `FRAMEWORK.md`, `CONNECTIONS.md`, the guide, the 4 commands or the 3 receipts.
- Violates: the banned list of the scope.
- Proposed fix: "does a required text of no contrast count as missing?"; "A caller that passes its own browser launches it with these."

## Not examined

- `AUDIT-LOG.md` entries E-3 to E-8 (lines 31-74): the scope names E-9, E-10, E-13, E-14.
- `hinshitsu/evidence/open-findings-859c643.txt` beyond its first 12 rows and the count by grade.
- `plugin/fit/trials/002/RECEIPT.md` and `003/RECEIPT.md` outside the lines listed under Examined; only 001 was read whole. The 3 new receipts are byte-equal to the stored ones (`diff -q`).
- `plugin/fit/src/` and `plugin/fit/e2e/` beyond the lines listed; `apps/studio/` beyond `deliverable.e2e.ts` lines 1-60; `packages/core/`: not read. The Studio's screen texts (words the owner reads in the browser) were not read and no page was opened; time, and the plan-stage scope centers on the planning entries.
- `SPEC.md` section 2.30 after line 500; `PROGRESS.md` "Start here" and "Known gaps" as prose; `redteam/FINDINGS.md` itself (the 16 rows were read in the evidence copy, not compared with the file).
- The reference build's receipt (C4): none is stored, and I did not build one.
- The delivery report: none exists yet.
- Whether `local-test.html` and `refraction-studio.html` differ (finding 13): UNVERIFIED, not compared.
- GitHub's check names as GitHub reports them and pull request 24: not opened; the job names "check" and "Outside validators" were read in `.github/workflows/ci.yml` only.
- `npm run check`, `npm run e2e` and the `vitest` commands of C2 and C3: not run (the scope forbids `npm run e2e`; the others are for the correctness auditor).
- The banned-word search did not cover `apps/studio/`, `packages/core/`, `SPEC.md`, `PROGRESS.md` or `redteam/FINDINGS.md` as files.
