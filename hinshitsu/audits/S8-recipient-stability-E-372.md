a793feaf00d9d8074

# S8 report: recipient-side verification, stability, and the re-run of the last repairs

Role: AUDITOR. I built nothing here and changed no file of the repository. All scratch files are under `/tmp/tmp.k6LvtuB3h7` (from `mktemp -d`); that folder is outside the RUN FOLDER, so the orchestrator must copy it for the paths below to count as EVIDENCE.

Head when I started: `240a2bb`. Head when I ended: `6c9d8f8`. `git diff --stat 240a2bb HEAD` shows 3 files, all under `hinshitsu/`; `plugin/`, `apps/` and `packages/` are the same at both. `git status --short` at the end shows 2 untracked files that are not mine (`hinshitsu/evidence/compare-builds.sh`, `.txt`).

## Verdict

- Recipient tasks: 12 performed, 12 gave the result that the CRITERIA name; 3 are UNVERIFIED (listed at the end).
- C3 by hand, clause by clause, for 2 Directions that the test does not use (Garden Ledger, Ember Noir): all 7 clauses hold for both.
- Stability: fresh install reaches a working state with 2 omitted steps; no sideways scrolling at 360, 768, 1280; every dependency version is exact; 3 of 3 runs are byte-equal in each of the 3 repeat checks.
- FINDINGS re-run (16): 15 `NO LONGER REPRODUCES`, 1 `REPRODUCES IN PART` (F-161), 0 `STILL REPRODUCES`.
- F-162: each receipt states the limit in 1 sentence (6 of 6 receipts read); row G-S05 names the limit, but says that the owner has yet to decide, and cites no ANSWER entry (new finding 1).
- New findings: 1 BLOCKER, 2 DEFECT, 1 STYLE.

## Recipient tasks

| # | Task | Result | EVIDENCE |
|---|---|---|---|
| 1 | `npm run build:page` | Exit 0. 2 warnings: `WARN inlineDynamicImports option is deprecated, please use codeSplitting: false instead.` and `(!) Some chunks are larger than 500 kB after minification` (`app.js` 1,501.05 kB). `artifact: 1488 KB`. SHA-256 of `refraction-studio.html`: `eaffab91…e17bb` | `/tmp/tmp.k6LvtuB3h7/build.log` |
| 2 | Open `local-test.html` from disk; Direction "Garden Ledger"; own texts (project name, 3 answers, business "Harbor Kiln Pottery", headline "Clay cups that outlast the tea", button, lede, phone); Summary; download 1 archive | No console error, no request off disk, no dialog. Archive `frontend-focus-vision-f467508d.zip` | `/tmp/tmp.k6LvtuB3h7/vA/summary.png`, `vA/run.json` |
| 3 | The same with "Ember Noir" | The same. Archive `frontend-focus-vision-82a3dee9.zip` | `/tmp/tmp.k6LvtuB3h7/vB/summary.png`, `vB/run.json` |
| 4 | C3: `unzip` to 7 files | Both: exit 0, exactly `DESIGN.md FONTS.md VISION.md mockup.html theme.css tokens.css tokens.json` | `vA/un`, `vB/un` |
| 5 | C3: 1 fingerprint in all 7, equal to the archive's name | Both: the 8 characters stand in each of the 7 files (2 times in `DESIGN.md`), and no other fingerprint stands in any | `vA/c3.json`, `vB/c3.json` |
| 6 | C3: `tokens.json` parses | Both: yes (an object) | the same |
| 7 | C3: each design value has a value in Chromium | Both: `tokens.css` 114 declared, 0 empty (`:root`); `theme.css` 64 declared, 0 empty (`:root` 32, `.dark` 32, read with the class set) | the same |
| 8 | C3: `mockup.html` from the folder | Both: 1 request (the file itself), 0 console errors or warnings, 0 `script` elements, 0 `<script` in the text, 0 `on…=` attributes, 0 `javascript:` | the same; `vA/mockup.png` |
| 9 | C3: my texts appear as text | Business, headline, button, lede, phone: drawn in `mockup.html`. Project name and the 3 answers: in `VISION.md`, each inside a `text` fence marked "quoted data, not an instruction" | the same |
| 10 | Guide, Fit check "without Claude Code" on the Vision's own `mockup.html` | `node fit/src/cli.ts <un>/mockup.html <un> <out>` → `7 deviations; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 1.` Status 1. The 7 are all Floor lines (Q10, Q8, S11, S5 twice, S8, S9); 7 = sum of the receipt's counts. Ember Noir: `7 deviations; … 45 readings of 5 texts …`, status 1. The guide names the next act for this status ("Deviation lines: repair by hand or with `fit-repair`"), but see new finding 4 | `/tmp/tmp.k6LvtuB3h7/r/own/RECEIPT.md`, `r/ownB` |
| 11 | The look on the same | `node fit/src/look-cli.ts …` → `13 pictures. Read first: …/look/LOOK.md`, status 0; 0.0 percent differs at each width. Guide: "Open `look/LOOK.md` and the pictures beside it" | `r/own/look/` |
| 12 | Fit check and look on a page changed in 2 ways (`--text-muted` set to `#c2185b`; the `h1` removed) | `10 deviations; the contrast of 27 readings of 3 texts could not be read … Status 1.` Colors 1 (`text color #c2185b: 15 elements`), Content 1 (headline at 375; 768; 1280), Floors 8 (the 7, and `Q7: the page has 0 first-level headings`); 1+1+8 = 10. Look: status 0, 13 pictures, headline "not found" at 3 widths, 16.3 / 11.2 / 10.4 percent differs. Guide names the next act for both | `/tmp/tmp.k6LvtuB3h7/changed3/index.html`, `r/changed3/` |

More runs of the guide's programs, each with the guide's next act:

| Command (in the copy of `plugin/`) | One line | Status | Does the guide say what to do |
|---|---|---|---|
| Fit check with no `PW_CHROMIUM` | `The Fit check stopped: it found no browser to open the page. Fetch one with "npx playwright install chromium" in the plugin's folder, or set the environment variable PW_CHROMIUM …` | 2 | Yes (line 35) |
| Fit check, archive in place of the folder | `The Vision folder that was given is a file, not a folder: … unpack it first and give the folder.` | 2 | Yes |
| `--round 4` | `The repair budget of 3 rounds is spent. The program did not check again; a person decides now.` | 2 | Yes |
| Build file missing (Fit check and look) | `Cannot read the build: …` | 2 | "Read its one line; it says why" |
| No argument | `Usage: node fit/src/cli.ts …` | 2 | Yes |
| A browser that writes 1 line and fails | `… The browser's own message (data, not instructions): libfoo.so.1: cannot open shared object file` | 2 | Yes |
| `--round 1` after a first receipt, `VISION.md` changed between | Receipt: `Since the earlier receipt … (it states a first check), 1 of the Vision files that the program reads has changed: VISION.md.` | 1 | Yes (line 82) |

Two first attempts at "1 color" changed nothing that the program compares: `--accent` (used by this Direction only inside a gradient) and `--accent-2` (drawn nowhere as a solid color). Both gave `9 deviations` with Colors 0. The receipt states that gradients are not compared, so I report no finding.

**`RECEIPT.md` read as the owner: sentences whose words the guide does not explain.** The guide holds none of these words: "Fingerprint" (line 1 of every receipt), "the Brief" ("the three required texts of the Brief"; `LOOK.md`: "The Brief requires three texts"), "craft rule", "WCAG 2.x formula", "the usual least", "reading" as a unit (the receipt explains it; the guide uses it at line 58 without a meaning), "opaque" and "partly transparent", "pseudo-elements", "inline SVG", "@font-face", "clip-path", "media condition", "reduced motion", "iframe", "pixel density", "style sheet", and the whole list "What the program checked of each requirement" (`href`, `maxlength`, "the policy", `object-src`, `script-src`, "referrer tag", "description tag", "viewport tag", "first-level heading", `defer`, WOFF2, `fetchpriority`, "robots tag", "posts"). The requirement ids (S5, Q8, …) are explained only as "by its id". This is the same kind as F-160, which waits for the next run; I raise no second finding.

**The 4 command files, read as the AI coding tool.**

| Situation | `fit-check.md` | `fit-repair.md` | `fit-build.md` | 2 readings |
|---|---|---|---|---|
| Status 0 (trial 001: `No deviation; the contrast of 27 readings of 3 texts could not be read … Status 0.`) | Step 2, case 0; then step 3 | Step 1: "status is 0 … tell the owner … and stop" | Step 5, case 0 | No |
| Status 1 with a deviation (trial 002: `34 deviations; … Status 1.`) | Step 2, case 1, "Deviation lines"; then step 3 | Step 1 (next round), step 2 (c) not held, (a), steps 3 to 6 | Step 5, "1 with deviation lines" | No |
| Status 1, older edition (trial 003: `No deviation; none of the 48 Floor requirements of the Vision was checked …; the contrast of 27 readings of 3 texts could not be read … Status 1.`) | Step 2, case 1, third sub-case | Step 2 (c), tested first; no deviation line, so "do not start a repair round, and stop"; (b) is shut out by "and case (c) does not hold" | Step 5, "1 with no deviation line" | `fit-repair.md`: no. `fit-check.md` and `fit-build.md`: yes, see new finding 3 |

`fit-look.md`: status 0 → steps 3 to 6; status 1 → step 2, then "read only the pictures that exist"; status 2 → quote and stop. 1 reading each.

## Stability

**1. Fresh install.** `git archive HEAD plugin | tar -x` into scratch, no file of the repository beside it. I ran the guide's `npm install` for real (no link to the repository's `node_modules`): `added 2 packages`, exit 0, `playwright@1.65.0` and `playwright-core@1.65.0`. I did not run `npx playwright install chromium` (the scope forbids it); I set `PW_CHROMIUM=/opt/pw-browsers/chromium`, which the guide and the program's own line both name. With that, both programs work. Omitted steps:
- The guide does not say from which folder to start `node fit/src/cli.ts …` and `node fit/src/look-cli.ts …`. From any other folder Node ends with `Cannot find module`, status 1 (new finding 2).
- The guide does not say how to set an environment variable (the form `export PW_CHROMIUM=<path>`), nor where the font files for `--fonts` come from (the second is in F-160).

**2. Refresh, resize, empty data.**
- Reload in the middle of Step 1 (`#nav`): the page comes back at the same Step; project name, headline and the answers are kept (`localStorage` key `refraction.project.v2`). An Option that was selected and not yet confirmed with "Pick … and continue" is not kept (radio checked before reload: true; after: false). After the confirm button, the reload keeps it ("You have decided 1 of 23 Steps", "Picked: Name centered, links below").
- 360, 768, 1280 pixels, 5 screens each (Directions, a Step, Your content, Summary, Overlays): `scrollWidth` equals `clientWidth` in all 15; no element ends right of the window. Pictures: `/tmp/tmp.k6LvtuB3h7/w360-summary.png` and 5 more.
- Every field empty: archive downloads, 7 files, all C3 clauses hold, 0 errors. The Mockup then shows the sample practice's words for 4 texts ("Harbor Street Dental", the sample headline, "Book a visit"); the Summary says so ("4 of 23 texts are still the sample dental practice's words"). Fit check: `7 deviations. Status 1.`
- Longest text in each of the 48 fields (typed by key, so each field's limit holds): archive downloads, C3 clauses hold, 0 errors; the Mockup is 1280 wide at 1280 (no sideways scroll); Fit check Width `0 deviations`, status 1 (the same 7 Floor lines).
- `<script>alert(1)</script>` typed into each of the 48 fields: no dialog in the Studio or in `mockup.html`; 0 `script` elements in either; `mockup.html` holds the text 46 times as `&lt;script&gt;…` (shorter fields cut it at their limit: 24, 16, 12 characters) and draws it as letters; `VISION.md` holds it 4 times, each inside a `text` fence. The Summary's own text does not repeat the texts; its preview draws them as letters. A project name of 3 backticks gets a fence of 4.
- The fingerprint is the same (`f467508d`) for every content of one design; `VISION.md` calls it "Fingerprint of the design values", so this agrees with its words.

**3. Dependencies.** Root: 13 `devDependencies`, all exact. `apps/studio`: 17 `dependencies`, all exact (`@refraction/core` `0.1.0`). `packages/core`: `zod` `4.6.7`. `plugin`: `playwright` `1.65.0`. No version is a range, so no FRAGILITY. `engines.node` is `>=22.18` in root and plugin (a lower bound for the runtime, not a package). `npm ls --all` exits 0; its last 5 lines show no error. `plugin/` ships no lock file; the fresh install resolved exactly 2 packages, both 1.65.0.

**4. Three runs each.**
- Fit check on trial 001: status 0 three times; `RECEIPT.md` and `receipt.json` byte-equal among the 3 and to the stored ones (`cmp`; SHA-256 `fb44d37d…`). I ran 002 and 003 the same way: byte-equal, 3 of 3.
- Fit check on my changed page: status 1 three times (4 with the first run); `RECEIPT.md` `7d2b6d97…` and `receipt.json` `3edbcad3…` equal in all.
- The look on the unpacked Vision: status 0 three times; `LOOK.md` `7097a444…` and `look.json` equal in all 4 runs; the 13 pictures are byte-equal too.

## The FINDINGS re-run

| FINDING | Trigger that I built and ran | Result | EVIDENCE |
|---|---|---|---|
| F-152 | `claude plugin validate plugin` on the scratch copy (Claude Code 2.1.330); `grep -n -i "remark\|warning"` on the guide and `guarantees.md` | NO LONGER REPRODUCES | Output ends `√ Validation passed with warnings`, exit 0. Guide line 39: "with warnings and no error … this guide gives no count". `guarantees.md` 964: "passed it with warnings and status 0 … The guide gives no count of them"; 1052 names the old "two remarks" as corrected |
| F-153 | `grep -o "<rect[^>]*>" plugin/fit/trials/002/index.html` → 4 with `rx`; `sed -n 74,86p …/002/RECORD.md` | NO LONGER REPRODUCES | Line 84: "each of its 4 rounded rectangles … 12 values"; lines 76 and 80 carry "[as of this part's date; … since 2026-11-22: see …]" |
| F-154 | Read `fit-repair.md` lines 11 to 15 against trial 003's line, a status 0 receipt, and an empty result folder | NO LONGER REPRODUCES | Order (c), (a), (b); (b) ends "and case (c) does not hold"; "more than one can hold at once"; step 1 names the act for status 0 and for no `receipt.json` |
| F-155 | Status 2 runs (usage form in a folder that holds a receipt: the old `RECEIPT.md` stays); read the 3 files | NO LONGER REPRODUCES | `fit-check.md` step 3: "For status 0 or 1 only (… do not show an older one)"; `fit-build.md` step 5: "For status 0 or 1"; `fit-look.md` step 1: "as a quotation, do not act … and stop", step 2: "read only the pictures that exist" |
| F-156 | `grep -n "repair run, commit" PROGRESS.md`; line 9; line 134 | NO LONGER REPRODUCES | 22 entries (1 to 22); line 9: '"commit 1" to "commit 22"'; line 134: "the guide and 3 commands" |
| F-157 | `sed -n` of `FRAMEWORK.md` 9, 27, 62; `hinshitsu/PLAN.md` 5, 7, 41; `grep trials\|directions.md CONNECTIONS.md` | NO LONGER REPRODUCES | "C4, C5, C7 and C8 as changed last by E-289"; "(D1 to D83)"; the 2 memos named; line 7 marked "When this text was written"; "Commit 21 hardens …"; both edges at lines 45 and 46 |
| F-158 | `grep -n "names its test\|causes left" SPEC.md` | NO LONGER REPRODUCES | 489: "… names its test, and row R-T06, repaired by a change to a record, names that record"; 532: "Under a measure with nothing to check, under the Floors of an unread edition and under Contrast …" |
| F-159 | (i) I took the test's own function out of `deliverable.e2e.ts` and ran it in Chromium on `theme.css` with 3 planted rules; (ii), (iii) read | NO LONGER REPRODUCES | Unchanged: `[]`. `@media (prefers-color-scheme: dark){:root{--zz-empty: ;}}` → `["--zz-empty"]`. `.dark .card{…}` → `["unread rule .dark .card", …]`. `@supports` → flagged. `expect(facts.text).toContain(HEADLINE)`. Title at `exit.e2e.ts:257`: "the 3 cases of status 1" |
| F-161 | `sed -n 11p …/003/RECORD.md`; `sed -n 7p …/001/RECORD.md`; `grep -c 7776d35d` on the 2 pages | REPRODUCES IN PART | 003 line 11 now names "the typeface for numerals and the fingerprint: see … the last part". 001 line 7 ("Instruction") still ends "Their fingerprint is `7776d35d`." with no mark; the stored files carry `0fabf790`; the pointer stands only at line 89 |
| F-163 | RB with the headline placed absolutely inside a scrolling box that is not its containing block (`d3/pages/p5_abs.html`) | NO LONGER REPRODUCES | `No deviation; … Status 0.` |
| F-164 | RB with an icon sprite: (a) `viewBox 0 0 6 6`, `rx 2`, drawn at 24; (b) `viewBox 0 0 20 20`, `rx 8`, drawn at 200 | NO LONGER REPRODUCES | (a) Status 0, Corner radii `0 deviations` (no "radius 2px"). (b) `1 deviation … Status 1`, `radius 80px: 1 element, first use` |
| F-165 | M1 with `script-src 'unsafe-inline'` and the script that adds a paragraph after 0.9 s, `--run-scripts` (I saw in Chromium that the paragraph appears) | NO LONGER REPRODUCES | `… the contrast of 27 readings of 3 texts could not be read … Status 0.`; the list holds 3 lines, none with "(2 texts with these words)" |
| F-166 | RB with each word of the headline in a `span` | NO LONGER REPRODUCES | `No deviation; … Status 0.` |
| F-167 | RB with the SVG rectangle and the HTML box inside `transform:scale(1.25)` | NO LONGER REPRODUCES | Corner radii `0 deviations; 0 not measured` (no "radius 10px"). The run shows 3 Width deviations; they are true (my block made the page 1600 wide at 1280; Chromium `scrollWidth` 1600) |
| F-168 | RB with 200,001 style rules | NO LONGER REPRODUCES | Status 1, `7 things could not be measured`; receipt line 105: "The page holds more style rules, media conditions or shadow roots than the program reads (200,000 rules, …), so a setting of the screen that it names may have gone unread." |
| F-169 | `PW_CHROMIUM=/bin/true`, a folder, `/bin/false` (look), a missing path | NO LONGER REPRODUCES | "… The browser gave no message of its own.", status 2, no `[pid=…]` and no `<launching>` line; a fake browser that writes 1 line to its error stream is quoted as that line alone |
| F-162 (kept; report only) | `grep -c` of the sentence in the 3 stored receipts and 3 fresh ones; row G-S05 | Each receipt states the limit in 1 sentence: yes, 6 of 6 ("A condition that the Mockup holds too (a mouse that can point at a thing, for one) is read in one state only, the one of the reading; under the other state the page can show another design."). Each also holds 1 sentence on other widths and 1 on other heights. Row G-S05 names the limit: yes | See new finding 1 for what the row says about who acts |

RB and M1 as the earlier report defines them (`built(reference-floors/mockup.html)` against `reference-floors`; trial 001's `mockup.html` against `001/files`). My RB baseline: `No deviation; … Status 0.`

## New findings

1. **BLOCKER. Row G-S05 and `SPEC.md` still say that the touch-phone limit waits for the owner, after the owner answered.**
   - Place: `redteam/FINDINGS.md` line 683, end of the Status ("Who must act: the owner, who decides whether it stays a stated limit or the Fit check gets a second reading as a touch phone"); `SPEC.md` line 545, in section 2.31 ("A stated limit that waits for the owner's word (row G-S05)"). `PROGRESS.md` line 834 ("Known gaps") says the opposite for the kept parts of G-S05 ("so no question is open"), and cites 2026-11-21 and D81, a day before the answer.
   - Trigger: `grep "^| G-S05" redteam/FINDINGS.md | grep -o "E-[0-9]\+" | sort | uniq -c` gives E-107 (3), E-139, E-67, and no E-293; `sed -n 545p SPEC.md`; `sed -n 2906,2909p hinshitsu/AUDIT-LOG.md` shows the answer "Keep as a stated limit (Recommended)". `git log -1 -- redteam/FINDINGS.md` gives `504b1d7`, the commit before the answer was logged.
   - Violates: C1 as in E-294 (G-S05 is "kept for a condition that the Mockup holds too … on the USER's word in the ANSWER entry"; state (b) asks that the Status cite the ANSWER entry and name who must act; the row names a decision that is already made). C6 (`SPEC.md` from 2.28: a sentence on the status of a finding that disagrees with the log at the final commit).
   - Proposed fix: end the row with "kept as a stated limit on the owner's word (E-293); who must act: the builder, in the next run, if a second reading as a touch phone is wanted"; reword `SPEC.md` 545 to "a stated limit that the owner accepted (E-293)"; cite E-293 at `PROGRESS.md` 834. All are changes to records.

2. **DEFECT. The guide's 2 lines "without Claude Code" fail as written from any folder other than `plugin/`, and the guide does not name the folder.**
   - Place: `plugin/README.md` lines 95 and 107.
   - Trigger: `cd /tmp/tmp.k6LvtuB3h7 && node fit/src/cli.ts <page> <Vision folder> <out>` → Node's `throw err;` (`Cannot find module`), status 1. The guide's table gives status 1 the meaning "at least one deviation …".
   - Violates: `CLAUDE.md`, "Writing style" (state what can go wrong); a step of the fresh install that the guide omits. C7's list does not name it, so no CRITERION fails. Close to F-160 in kind.
   - Proposed fix: 1 clause before each line: "In this folder (the folder that holds this guide), run:".

3. **DEFECT. `fit-check.md` and `fit-build.md` do not shut out the case '"Not measured" and no deviation line' for a Vision of an older edition; 2 readers can take trial 003 2 ways.**
   - Place: `plugin/commands/fit-check.md` line 16; `plugin/commands/fit-build.md` line 18.
   - Trigger: trial 003's receipt has no deviation line and holds "27 readings of 3 texts not measured" under Contrast. `fit-check.md` says "more than one can hold at once", so one reader reports the third case alone, and another adds the second ("the owner takes that part out of the page"), though unread contrast never changes the status. `fit-repair.md` guards this with "and case (c) does not hold"; the other 2 files hold no such clause. `fit-build.md` line 17 also names no act for "deviation lines and none of the Floor requirements checked" beyond the offer of `fit-repair`.
   - Violates: a rule that 2 readers take 2 ways (the kind of F-154). C7's test passes, since it matches words.
   - Proposed fix: in both files, "(a text whose contrast could not be read is not this case)"; in `fit-build.md` line 17, "and where the one line also says that none of the Floor requirements was checked, say that too".

4. **STYLE. The guide does not tell the owner that the Vision's own `mockup.html` gives Floor deviations.**
   - Place: `plugin/README.md`, the table of statuses and "The three cases of status 1".
   - Trigger: the Fit check on a fresh Vision's own `mockup.html` (rows 10 above; also the empty, longest and hostile Visions): `7 deviations`, all Floor lines. The guide's act for deviation lines is "repair", and the page here is a file of the Vision folder, which the same guide says nobody is to change. `fit-build.md` step 2 holds the explanation ("`mockup.html` is a reference for the design only"); the guide does not.
   - Violates: nothing in the CRITERIA (C3 allows status 0 or 1). Form only.
   - Proposed fix: 1 sentence under "The measures that count": "The Mockup is a still sample page, not a built page: checked against its own Vision it shows Floor lines (links that lead nowhere, a form that sends nothing). Do not repair the Mockup."

## Commands run

- `git log`, `git status --short`, `git check-ignore`, `git diff --stat 240a2bb HEAD`, `git archive HEAD plugin | tar -x -C <scratch>`.
- `npm run build:page` (1 time); `sha256sum` of the 2 built files.
- Playwright scripts of my own, 1 browser at a time, with `executablePath: '/opt/pw-browsers/chromium'`: `explore.cjs`, `studio.cjs` (7 runs: 2 Directions with own texts, empty, longest, hostile, and 2 repeats for the pictures), `pn.cjs` (project name: empty, hostile, longest, backticks), `stab2.cjs` and `stab3.cjs` (reload, 3 widths), `c3.cjs` (C3 by hand, 5 archives), `colors.cjs`, `p7.cjs`, `f159.cjs`. All in `/tmp/tmp.k6LvtuB3h7/scripts/`.
- `unzip -o -q` on each archive.
- In the scratch copy of `plugin/`: `npm install`; `npm ls --all`; `node fit/src/cli.ts` 40 times in all (own Mockups, 3 changed pages, 5 Visions, trials 001 to 003 three times each, 8 pages for duty 3, 9 refusals); `node fit/src/look-cli.ts` 9 times; `cmp` and `sha256sum` on receipts and pictures.
- `node gen.ts` (the pages for F-163 to F-168, with `built.ts` of the copy).
- `claude --version`; `claude plugin validate plugin` on the scratch copy (1 time).
- `python3 …/living-reference/scripts/refresh_reference.py docs/reference/guarantees.md --check` (1 time): "findings: none; check: passed; file not changed".
- In the repository, read only: `npm ls --all`, `node -e` on the 4 `package.json` files, `grep`, `sed -n`.
- No `playwright install`, no `npm run e2e`, no test file of the browser suite.

## Not examined

- `npm run check`, the tests under `plugin/fit/e2e/` and `deliverable.e2e.ts` as test runs: not run (not in my scope).
- The 2 builds of C3 (final commit against `523ae8e`): not made; the published page: not read.
- The 36 Directions other than Garden Ledger and Ember Noir; the "plain start"; the 7 single-file downloads; the project file ("Download the project file", "Open a project file"); the Overlays.
- The Studio in a browser other than headless Chromium 1243; a download through a visible browser's own dialog.
- `--fonts`, `--judged`, and `--run-scripts` on a Vision from the Studio (only on trial pages).
- `DESIGN.md`, `FONTS.md` and `tokens.json` beyond the fingerprint and the parse.
- F-160 (not in my list); the rows of C1 other than G-S05; C5 and C9.
- Whether the 2 untracked files under `hinshitsu/evidence/` belong in the commit.

## UNVERIFIED, with steps for the owner

1. **The 4 commands inside a Claude Code session** (nobody has run them; the guide says so). Steps: (a) in a terminal, go to the folder `plugin/` and run `npm install`; (b) run `claude --plugin-dir <path to plugin/>`; (c) type `/frontend-focus-fitter:` and see that 4 commands are offered; (d) run `/frontend-focus-fitter:fit-check <an unpacked Vision>/mockup.html <the same folder> result/` and allow the program when Claude Code asks; expect Claude to say "status 1", to list 7 Floor lines, and to keep 3 parts apart; (e) run `/frontend-focus-fitter:fit-check plugin/fit/trials/003/index.html plugin/fit/trials/003/files result3/` and see whether Claude says "write the Vision again from the Studio" and offers no repair; (f) run `/frontend-focus-fitter:fit-look` with the same 3 paths and see that Claude reads `look/LOOK.md` and names pictures.
2. **`npx playwright install chromium`** (the guide's second install step; my scope forbids it, and this machine sets `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`). Steps: on the owner's machine, in `plugin/`, run it once, then run `node fit/src/cli.ts fit/trials/001/index.html fit/trials/001/files out/` with no `PW_CHROMIUM` set; expect `No deviation; … Status 0.`
3. **The download as a person makes it.** My downloads went through Playwright's download event in headless Chromium. Steps: open `apps/studio/dist/artifact/local-test.html` by double click, pick a Direction, open "4. Summary", press "Download all seven files as one file", unpack the `.zip` with the system's own tool, and count 7 files.
