aadad3b5b3c953787

identifier: not visible to me as an agent ID. Visible to me: the session link `session_017va4ixVK28D3sUvFDtEBSE` (in the commit attribution text) and the scratchpad folder ID `17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9`.

## Scope received

The file `/home/user/Frontend/hinshitsu/prompts/S7-WU1-forensic-5s.md` at commit c9c81ee, read with `git show c9c81ee:hinshitsu/prompts/S7-WU1-forensic-5s.md`. Its text, word for word, is that file (heading "Role scope — Forensic (5S) auditor"; job: hunt for dead code, unused imports and variables, TODO and FIXME notes, placeholders, sample data, copy-paste drift, hardcoded values, leftover debug output, files that nothing references, names that do not match what the thing does; DELIVERABLE: WU-1, the 19 commits `99240db..52d1e73`; commit under review 52d1e73; CRITERIA C1 to C9 as quoted there; the report form; the limits; the additions for this runtime). I do not copy its roughly 5,000 words here a second time; the committed file is the exact text I received, and I changed nothing in it.

## Examined

Product files at the working tree, which equals 52d1e73 for every product path (`git diff 52d1e73 HEAD --stat -- plugin apps packages PROGRESS.md SPEC.md PLAN.md DECISIONS.md docs redteam` printed nothing; HEAD was c9c81ee at the start and d22c2a3 at the end, both later commits under `hinshitsu/` only).

Files read (as the full diff `99240db..52d1e73`, plus the final-state lines named):
- `plugin/fit/src/cli.ts` (whole diff; lines 1-12, 44, 66-84, 112, 142-149 in the final file)
- `plugin/fit/src/look-cli.ts` (whole diff; lines 1-11, 38-59)
- `plugin/fit/src/collect.ts` (whole diff; lines 400-461, 561-601)
- `plugin/fit/src/fit.ts` (whole diff; lines 348, 396-404, 509, 519, 540, 567-573, 607-662)
- `plugin/fit/src/floors.ts` (whole diff; lines 88-103), `plugin/fit/src/receipt.ts` (whole diff), `plugin/fit/src/look.ts` (whole diff; lines 1147, 1245-1253)
- `plugin/fit/e2e/exit.e2e.ts`, `plugin/fit/e2e/look.e2e.ts`, `apps/studio/e2e/deliverable.e2e.ts` (whole diff of each)
- `plugin/README.md`, `plugin/commands/fit-check.md`, `plugin/commands/fit-repair.md` (whole diff; line 12 of `fit-repair.md`), the argument hints of all 4 command files
- `plugin/fit/trials/001/RECORD.md`, `002/RECORD.md`, `003/RECORD.md`, `reference-floors/README.md` (whole diff)
- `SPEC.md` section 2.31, `DECISIONS.md` D80 to D82, `PLAN.md` section 13.10 row, `docs/reference/guarantees.md` (diff), `PROGRESS.md` (diff, each line cut at 330 characters)
- `hinshitsu/evidence/run-checks.sh`, `rewrite-trial-receipts.sh`, `.gitignore` (diff); the 19 files `commit-<n>-checks.txt` by search only
- `GLOSSARY.md` lines 53-59 (the 4 classes)

Commands run, with their output:
1. `git log --oneline 99240db..52d1e73` → 19 commits, 5f6d8c2 to 52d1e73. `git diff 99240db 52d1e73 --stat` → 60 files, 4771 insertions, 205 deletions.
2. Search of the 17 changed code and guide files for `TODO|FIXME|XXX|HACK|console.(log|debug|error|warn)|debugger|.only(|.skip(|it.todo|xit(|lorem|placeholder|TBD|@ts-ignore|@ts-expect-error|eslint-disable` → no marker; the only hits are the word "placeholder" as a CSS term or in trial records, and `process.exit`.
3. The same marker search over the added lines of `PROGRESS.md`, `redteam/FINDINGS.md`, `SPEC.md`, `guarantees.md`, `PLAN.md`, `DECISIONS.md` → no hit.
4. Use count of each new name → every new function is used; `nameShown` is used in `look.ts` only (2 lines) though exported.
5. `npx eslint --max-warnings 0` on the 7 source and 3 test files → `eslint exit 0`.
6. `npx tsc -p plugin/fit` → exit 0. `npx tsc -p tsconfig.e2e.json` → exit 0.
7. With `PW_CHROMIUM=/opt/pw-browsers/chromium`, `node plugin/fit/src/cli.ts plugin/fit/trials/<id>/index.html plugin/fit/trials/<id>/files <scratch>/<id>` for 001, 002, 003 (scratch `/tmp/tmp.He6PBoQRNw` from `mktemp -d`):
   - 001: `No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0.` status 0
   - 002: `25 deviations; 3 readings of 1 text below the usual contrast (information: this Vision does not require it). Status 1.` status 1
   - 003: `No deviation; none of the 48 Floor requirements of the Vision was checked (the Vision writes them in an edition that this program does not read); the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 1.` status 1
   - `diff -q` of each fresh `RECEIPT.md` and `receipt.json` with the stored copy → equal, all 6 files. The stored receipts hold no drift.
8. Search of `commit-*-checks.txt` for `^exit [1-9]|build exit [1-9]|FAIL|×|failed` → no hit; 19 files.
9. Existence check of each backticked path in the added record lines → missing only `hinshitsu/DELIVERY-REPORT.md` (named in `PROGRESS.md` line 40 as a file not yet reached), `look/LOOK.md` (an output path) and `reports/...` names that resolve under `redteam/reports/`.
10. A Chromium probe (`node --input-type=module -e ...`, Chromium 153.0.8010.12): an element with `overflow:overlay` has computed `overflowY: 'auto'`, `overflowX: 'auto'`; a `rect` with `rx=5` has computed `rx: '5px'`, `ry: 'auto'`.
11. `node plugin/fit/src/cli.ts` and `node plugin/fit/src/look-cli.ts` with no argument → each prints its usage line with `<folder of the Vision files>`, status 2.
12. Search for what reads `plugin/fit/trials` → `trial.e2e.ts` reads 001 to 003 by ID; nothing lists the folder, so `reference-floors` breaks no reader.

No page opened in a browser besides the probe of item 10.

## Findings

No BLOCKER and no DEFECT found. 1 FRAGILITY, 9 STYLE. None is tied to a CRITERION failing; where "Violates" names no CRITERION ID, the item is on the list under "Your job" in my scope.

1. **Class** FRAGILITY. **Where** `plugin/fit/e2e/exit.e2e.ts` lines 512, 513, 671, 732. **Trigger** The number 56 (the count of Floor requirements) is written as a literal 4 times in tests added by WU-1, while `FLOOR_RULES` is imported in the same file (line 11). The change that breaks it: the Catalog gains or loses 1 Floor rule. Then the test "keeps the stored Vision ..." fails; `plugin/fit/trials/reference-floors/README.md` says to run it with `UPDATE_REFERENCE=1`; that rewrites the folder and the test still fails at line 671 (`toHaveLength(56)`). The C8 test (lines 512-513) and the fifth case (line 732) fail too. Read from the code; not run, because it needs a change of the Catalog. **Violates** hardcoded value (scope, "Your job"); it touches the test that C4 names. **Proposed fix** replace the 4 literals with `FLOOR_RULES.length`, or state in the folder's README that the number in the test must change too.

2. **Class** STYLE. **Where** `plugin/fit/src/collect.ts` lines 400, 442, 561; `plugin/fit/src/look.ts` line 1245; `plugin/fit/src/fit.ts` lines 398-399. **Trigger** Read the lines. New code was put between a comment and the thing it describes, 5 times: the comment of `cutAway` now stands above `scrolls` (400-404); the comment of the covered check stands above `scrollBoxes` (442-444); the doc comment of `readBrief` stands above the doc comment of `mediaConditions`, and `readBrief` (601) has none; the doc comment of `typefaceNames` stands above that of `nameShown`, and `typefaceNames` (1253) has none; the comment "(finding G-S05)" stands above the closed-shadow-root lines of finding A2-V4, and the lines it describes follow 3 lines later. **Violates** names and comments that do not match what the thing does. **Proposed fix** move each comment back to its function; give the closed-root lines their own comment.

3. **Class** STYLE. **Where** `plugin/fit/src/cli.ts` lines 44 and 66-84; `plugin/fit/src/look-cli.ts` lines 38 and 40-59. **Trigger** Commit 3e74f55 copied `FILE_MAX` and the whole of `readText` into `look-cli.ts`. The 2 bodies are equal today, statement for statement (printed side by side). A later change to 1 copy leaves the other behind. **Violates** copy-paste (2 copies of 1 thing). **Proposed fix** export `readText` and `FILE_MAX` once (for example from `vision.ts`) and import them in both command lines.

4. **Class** STYLE. **Where** `plugin/fit/src/cli.ts` lines 1 and 10; `plugin/fit/src/look-cli.ts` lines 1 and 11; `plugin/commands/fit-build.md`, `fit-check.md`, `fit-look.md`, `fit-repair.md` line 3 (and `fit-repair.md` lines 9, 15; `fit-build.md` line 14; `fit-look.md` line 11); against `plugin/README.md`. **Trigger** `node plugin/fit/src/cli.ts` prints `... <build.html> <folder of the Vision files> <result folder>`; the guide rewritten in WU-1 shows the same line as `<Vision folder>`, and its command table shows `fit-check <build.html> <Vision folder> <result folder>` where the command's own argument hint says `<folder of the Vision>`. 3 names for 1 folder. C7 binds the guide alone, and the guide holds. **Violates** copy-paste drift; CLAUDE.md "one term per concept". **Proposed fix** write `<Vision folder>` in the 2 usage constants, the 2 header comments and the 4 command files.

5. **Class** STYLE. **Where** `plugin/commands/fit-repair.md` line 12 (step 2). **Trigger** Read the step. The second case is a sentence without a verb, closed by a period ("... in the program's one line)."), then "Do not start a repair round" follows with no mark of which case it belongs to, then "and stop." is followed in the same step by "For each deviation line of the receipt, make the smallest change". The shape matches the test's pattern (`... no deviation line[^.]*\. Do not start a repair round`). A model that follows the step can read "Do not start a repair round" as holding for both cases. I did not test a model on it. **Violates** form; near C7 (the 2 cases are present, so C7's test holds). **Proposed fix** split step 2 into 2 bullets, 1 per case, each a full sentence, and adapt the test's pattern.

6. **Class** STYLE. **Where** `plugin/fit/trials/002/RECORD.md` lines 74-80. **Trigger** WU-1 added 2 sections that state the same facts in nearly the same words (3 rectangles with corners of 8, 18 and 30 pixels; 3 where it showed 0; 25 deviations where it showed 22): "The corners of drawn rectangles are compared" and "After the repair run of 2026-11-21". **Violates** 2 copies of 1 thing. **Proposed fix** keep the first; let the second say "the count changed as the section above says" and add only the wording change.

7. **Class** STYLE. **Where** `plugin/fit/src/collect.ts` line 404. **Trigger** `scrolls` tests `value === 'overlay'`. In the installed Chromium 153 an element with `overflow: overlay` has the computed value `auto` (probe, item 10 above), and the Fit check runs in Chromium only, so this branch never matches. **Violates** dead code. **Proposed fix** drop `|| value === 'overlay'`, or say in the comment that it stands for an older browser.

8. **Class** STYLE. **Where** `plugin/fit/src/fit.ts` line 614. **Trigger** The parameter type of `countClosedRoots` declares `contentDocument?: unknown` and `templateContent?: unknown`; the function reads neither (it walks `shadowRoots` and `children` only). **Violates** unused declarations. **Proposed fix** remove the 2 fields, or walk them if a closed root inside a frame's document was meant to count (a frame already counts as not measured).

9. **Class** STYLE. **Where** `plugin/fit/src/floors.ts` lines 88-90; `plugin/fit/src/fit.ts` lines 567 and 651-662; `plugin/fit/src/look.ts` line 1247; folder `plugin/fit/trials/reference-floors/`. **Trigger** Read the lines. (a) `labelWords` returns a boolean, not words, and its comment speaks of "the field `f`", which is no parameter of it. (b) `readMockupBrief` now also returns the Mockup's media conditions, read as `brief.media`; media conditions are no part of the Brief. (c) `nameShown` is exported and used in `look.ts` alone. (d) `reference-floors` lies in `trials/` and is no trial: it has no `INSTRUCTION.md`, `RECORD.md` or `index.html`, and its own README says "The 3 trials do not give one". **Violates** names that do not match what the thing does; CLAUDE.md "one term per concept". **Proposed fix** (a) `labelHasWords`, and fix the comment; (b) `readMockup` returning `{ brief, media }`; (c) drop `export`; (d) move the folder to `plugin/fit/reference-floors/` or say in `trials/` what else the folder holds.

10. **Class** STYLE. **Where** `plugin/fit/src/cli.ts` lines 142 and 149; `plugin/fit/src/receipt.ts` line 78; `plugin/fit/src/look.ts` line 1147. **Trigger** Read the lines. (a) Line 149, added in WU-1, repeats the test of line 142 (`title.startsWith('Contrast: required')`); the title's text serves as a flag in 4 places (`fit.ts` 573, `cli.ts` 142 and 149, `receipt.ts` 154). (b) 2 new sentences say "a window 800 pixels tall"; the height is the literal `800` in 3 `newContext` calls (`fit.ts` 170 and 654, `look.ts` 593) with no shared constant, where the widths have `WIDTHS`. **Violates** hardcoded values. **Proposed fix** (a) a boolean field on the Contrast measure, or 1 helper `contrastRequired(measure)`; (b) a constant `WINDOW_HEIGHT` used by the 3 calls and the 2 sentences.

## Not examined

- The browser test suites (`plugin/fit/e2e`, `deliverable.e2e.ts`) and `npm run check` as a whole: not run. My role is the form of the code; I ran the linter and the type checker on the changed files and 3 runs of the Fit check. Whether the tests pass is UNVERIFIED by me.
- `redteam/FINDINGS.md` (the 54 rows): only a marker search over its added lines. The states of C1 belong to the correctness and framework-drift AUDITORS.
- `hinshitsu/PLAN.md`, `hinshitsu/AUDIT-LOG.md`: not read; RUN FOLDER records, outside the hunt list.
- The 8 generated files of `plugin/fit/trials/reference-floors/` (2,300 lines): not read line by line; a test holds them equal to what the Catalog writes, and I did not run that test.
- The 3 stored `RECEIPT.md` texts: compared byte for byte with fresh output, not read for wording (the language AUDITOR's part).
- `PROGRESS.md` lines beyond 330 characters, and the parts of the 7 source files that WU-1 did not change.
- Finding 5's effect on a model, and finding 1's failure after a Catalog change: reasoned from the text, not run.

No file of the repository or of the RUN FOLDER was changed; the scratch files lie under `/tmp/tmp.He6PBoQRNw`.
