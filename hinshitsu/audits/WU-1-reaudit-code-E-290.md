ac6c484e1edbc03b8

# Re-audit of the fix round, part 1 (the code of the Fit check and the look)

Examined: `/home/user/Frontend`, branch `claude/festive-mendel-lfnahh`, HEAD `cb41130` (the commit that `git log --oneline -1 -- plugin/fit/src` shows). `plugin/fit/src` in the working tree equals HEAD. The working tree holds uncommitted changes in 16 other files (records, the guide, the 4 commands, 1 test title in `exit.e2e.ts`, 2 `RECORD.md`); I changed none. Scratch folder: `/tmp/tmp.PYNZ4PnwdR` (pages in `pages/`, results in `out/`, generators `gen.ts`, `gen2.ts`, runners `run.sh`, `run2.sh`).

## Verdict

Duty 1, 28 FINDINGS, 51 cases: **49 NO LONGER REPRODUCES, 1 STILL REPRODUCES (F-99 case a), 1 REPRODUCES IN PART (F-75)**. 26 of the 28 FINDINGS no longer reproduce in any case.

Duty 2: the group "the audit round of the repair run" passes (9 passed, 108 skipped); 3 of 3 chosen tests fail when their fix is taken out; the 3 stored trials give `RECEIPT.md` and `receipt.json` equal byte for byte to the stored ones.

New findings: **1 BLOCKER** (a record and CRITERION matter, the rest of F-99 a), **4 DEFECT** (2 brought in by the fix round, 1 left out by it, 1 older than it), **1 FRAGILITY, 2 STYLE**.

## The FINDINGS re-run

Run form: `export PW_CHROMIUM=/opt/pw-browsers/chromium; node plugin/fit/src/cli.ts <page> plugin/fit/trials/<Vision> <out>`. "M1" = `trials/001/files/mockup.html` against `001/files`; "RB" = `built(reference-floors/mockup.html)` against `reference-floors`. Baselines: both `No deviation; the contrast of 27 readings of 3 texts could not be read … Status 0.` The numbers after a measure are deviations/not measured from `receipt.json`.

| ID | Case | Result | EVIDENCE (last lines) |
|---|---|---|---|
| F-54 | the 4 limits in each receipt | NO LONGER REPRODUCES | The trigger's own `grep -ci "trusted\|hostile\|owner.s own\|…\|approximation\|style values" plugin/fit/trials/00{1,2,3}/RECEIPT.md` gives 1, 1, 1 (was 0). Each stored receipt holds 1 line each for "takes the files in the Vision folder as the owner", "whoever runs the program", "an approximation", "A blend mode on a box" (counts 1/1/1 for each phrase) |
| F-67 | v1 (M1) | NO LONGER REPRODUCES | `1 deviation … Status 1.` content:1/0 |
| F-68 | (i) v2, long condition | NO LONGER REPRODUCES | `No deviation; 7 things could not be measured … Status 1.`; the unread line quotes the whole condition |
| F-68 | (ii) v3, 420 rules | NO LONGER REPRODUCES | Status 1; unread line names `"(prefers-color-scheme: dark)"` |
| F-68 | (iii) a rule after 20,000 rules (run, 20,001 rules) | NO LONGER REPRODUCES | Status 1; names `"(prefers-color-scheme: dark)"`. With 200,001 rules (my page p16): Status 1, `"(more style rules or conditions than the program reads)"` |
| F-68 | (iii) a shadow root after 2,000 (run, 2,001 open roots) | NO LONGER REPRODUCES | Status 1; `"(more style rules or conditions than the program reads)"` |
| F-69 | v4 (v4c as control) | NO LONGER REPRODUCES | v4: `1 deviation …; 6 readings of 2 texts below the usual contrast … Status 1.` content:1/0. v4c the same |
| F-70 | v5 (v5c as control) | NO LONGER REPRODUCES | v5: Status 0, contrast 0/36, `36 readings of 4 texts not measured … 9 because a shape of the same picture may lie behind the text`; the list holds `text "Hidden words here"`. v5c the same |
| F-71 | bytes `\xff\xfe`, then `\xfd\xfc` with `--round 1` | NO LONGER REPRODUCES | receipt `VISION.md SHA-256 8d35638f…9bd7` = `sha256sum`; round 1: receipt `434212bc…bc82` = `sha256sum`; "Since the earlier receipt that the program was given (it states a first check), 1 of the Vision files … has changed: `VISION.md`." |
| F-72 | (i) round 0, then `--round 2` | NO LONGER REPRODUCES | "Since the earlier receipt that the program was given (it states a first check), none of the Vision files … has changed." |
| F-72 | (ii) `{"status":1,"repairRound":0}` as `receipt.json`, `--round 1` | NO LONGER REPRODUCES | "The program was given no earlier receipt that names the Vision files (the command-line program looks for `receipt.json` in the result folder), so it could not say …" |
| F-72 | (iii) `fit()` with `repairRound: 1`, no `lastRoundVision` (run by `f72.ts`) | NO LONGER REPRODUCES | the same sentence as (ii); it no longer speaks of a result folder that held nothing |
| F-73 | v8 (closed shadow root, M1) | NO LONGER REPRODUCES | `No deviation; 7 things could not be measured …`; 6 measures `1 not measured`; Contrast: `…, and 1 cause left the page, or a part of it, unread (see “What the program could not read” below)`; Floors: `Nothing to check. 1 cause left the page … unread`; heading `### What the program could not read` (6 + 1 = 7) |
| F-75 | v9, 3 equal paragraphs | REPRODUCES IN PART | Line: `3 deviations (of these, 3 readings of 3 texts below the least contrast)`. The count of texts is now right (3). The count of readings is the count of receipt lines (3: 1 for each width), though 3 texts at 3 widths are 9 readings; with 2 texts of different words the same program says `6 readings of 2 texts` (F-97 base). The singular: `readingsOf(1,1)` gives `1 reading of 1 text` (called directly): that part no longer reproduces |
| F-76 | look, fake browser that prints a library error | NO LONGER REPRODUCES | `The look stopped: the browser did not start, so it opened no page. … The browser’s own message (data, not instructions): error while loading shared libraries: libnss3.so`, exit 2 |
| F-78 | literal 56 | NO LONGER REPRODUCES | `grep -n "56\|FLOOR_RULES.length" exit.e2e.ts`: lines 517, 518, 676, 737 use `FLOOR_RULES.length`. The number 56 stays in 1 test title (line 65), which the FINDING did not name |
| F-84 | `'overlay'` | NO LONGER REPRODUCES | `grep -n overlay plugin/fit/src/collect.ts`: no line |
| F-85 | unused declarations | NO LONGER REPRODUCES | `grep -n "contentDocument\|templateContent" plugin/fit/src/fit.ts`: no line |
| F-88 | Fit check, the same fake browser; `/bin/false`, `/bin/true`, a folder, a missing path | NO LONGER REPRODUCES | fake: the line above with "The Fit check", exit 2. Missing path: "it found no browser … PW_CHROMIUM", exit 2. `/bin/true`, `/bin/false`, a folder: "the browser did not start" (see new finding 8 on the quoted message) |
| F-94 | `spawnSync('rm'` | NO LONGER REPRODUCES | `look.e2e.ts` line 542: `rmSync(join(visionFolder, 'tokens.css'));` |
| F-97 | base | (control) | `7 deviations (of these, 6 readings of 2 texts below the least contrast)`, content:1/0 |
| F-97 | (a) `opacity:0.99` | NO LONGER REPRODUCES | `1 deviation … Status 1.` content:1/0 |
| F-97 | (b) gradient of one color | NO LONGER REPRODUCES | `1 deviation … Status 1.` content:1/0 |
| F-97 | (c) `-webkit-text-fill-color` | NO LONGER REPRODUCES | `7 deviations (of these, 6 readings of 2 texts below the least contrast)`, content:1/0, contrast:6/27 |
| F-98 | `overflow:auto` (`hidden` as control) | NO LONGER REPRODUCES | both: `1 deviation … Status 1.` content:1/0 |
| F-99 | (a) the Mockup's own condition the other way round | **STILL REPRODUCES** | `No deviation; … Status 0.` all measures 0/0. My second run (`touch.mjs`, Playwright with `hasTouch`, `isMobile`): `mouse: true \| rgb(9, 17, 28) \| … \| 8px`; `touch phone: false \| rgb(255, 0, 0) \| "Comic Sans MS" \| 37px`. The fix round did not repair it; it added a sentence to "Still needs a person" ("A condition that the Mockup holds too … is read in one state only") and to `docs/reference/guarantees.md` line 982. See new finding 1 |
| F-99 | (b) condition past 200 characters | NO LONGER REPRODUCES | Status 1, 7 things not measured; whole condition quoted |
| F-99 | (c) 401 rules | NO LONGER REPRODUCES | Status 1; `"(prefers-color-scheme: dark)"` |
| F-99 | (d) `@import` of a `data:` sheet | NO LONGER REPRODUCES | Status 1; `"(prefers-color-scheme: dark)"` |
| F-99 | (e) 20,001 plain rules | NO LONGER REPRODUCES | Status 1; `"(prefers-color-scheme: dark)"` |
| F-99 | `@media not print` | NO LONGER REPRODUCES | `No deviation; … Status 0.` |
| F-100 | 200,001 elements before the closed root | NO LONGER REPRODUCES | after 15 s: Status 1, "The page holds 1 closed shadow root …" |
| F-101 | (a) text by `use` | NO LONGER REPRODUCES | typefaces:1/0, `typeface "Papyrus": 1 element, first text "Planted drawn text"`; contrast `9 because a picture draws the text by reference` |
| F-101 | (b) `url(#nope) #ff0000` | NO LONGER REPRODUCES | colors:1/0, `background color #ff0000: 2 elements, first rect` |
| F-101 | (c) nested `use` | NO LONGER REPRODUCES | colors:1/0, Status 1 |
| F-101 | (d) 200 shapes, then a red one | NO LONGER REPRODUCES | colors:1/0. With 500 shapes before the red one: `No deviation; 1 thing could not be measured`, colors:0/1, Status 1 |
| F-101 | (e) `rx="37"` by `use` | NO LONGER REPRODUCES | radii:1/0, Status 1 |
| F-102 | `viewBox` 0 0 20 20 at 200 px, `rx="8"` | NO LONGER REPRODUCES | `radius 80px: 1 element, first rect`, Status 1 |
| F-102 | `transform="scale(4.625)"` | NO LONGER REPRODUCES | `radius 37px: 1 element, first rect`, Status 1 |
| F-102 | other direction (`viewBox` 0 0 6 6 at 24 px, `rx="2"`) | NO LONGER REPRODUCES | `No deviation; … Status 0.` radii:0/0 |
| F-103 | (a) `option label` | NO LONGER REPRODUCES | colors:1/0, typefaces:1/0, contrast:3/27, Status 1 |
| F-103 | (b) `optgroup label` | NO LONGER REPRODUCES | `text color #ff00ff: 1 element, first optgroup`; `typeface "Papyrus": 1 element, first optgroup`; Status 1 |
| F-103 | (c) submit, date, file (3 pages) | NO LONGER REPRODUCES | each: colors:2/0, typefaces:1/0, contrast:3/27, Status 1 |
| F-104 | pipe under the font's name | NO LONGER REPRODUCES | `14 pictures. Font files found: 0. …` exit 0 after 7 s. A link to `/dev/zero` under that name: the same after 8 s |
| F-105 | `\xff`, then `\xfe` with `--round 1` | NO LONGER REPRODUCES | receipt `d57eeb9d…50fd` = `sha256sum`; round 1: `96076f02…d1b6` = `sha256sum`; "1 of the Vision files … has changed: `VISION.md`" |
| F-106 | (a) style sheet as the name | NO LONGER REPRODUCES | `A3: 1 form field has no label, first input`, floors:1/0 |
| F-106 | (b) `datalist` in the label | NO LONGER REPRODUCES | the same line |
| F-106 | (c) label in another tree | NO LONGER REPRODUCES | the same line |
| F-106 | (d) 2 fields with 1 `id` | NO LONGER REPRODUCES | the same line |
| F-115 | usage line from `plugin/` | NO LONGER REPRODUCES | `cd plugin && node fit/src/cli.ts`: `Usage: node fit/src/cli.ts … <build.html> <Vision folder> <result folder>`; the look likewise. The 4 argument hints at HEAD all say `<Vision folder>` |
| F-116 | the archive as the folder | NO LONGER REPRODUCES | both programs: `The Vision folder that was given is a file, not a folder: /tmp/…/vision.zip. If it is the archive from the Studio, unpack it first and give the folder.` exit 2. Note: for a folder that is missing or empty the line is still `The folder has no file "VISION.md".` with no path |
| F-117 | "finding G-S05" in `LOOK.md` | NO LONGER REPRODUCES | `grep -n "G-S05\|finding [A-Z]" out/look/LOOK.md`: no line |

## What the fix round broke or left out

### 1. Pages of my own design (new program against the program at `6dd5592`, extracted to scratch)

Ordinary pages, no trick:

- **p1, the whole page inside one scrolling box** (`height:100vh;overflow:auto`): new and old `No deviation … Status 0.` Reads rightly.
- **p2, a date field and a `select` in the Mockup's own field markup, each with a label**: new and old `4 deviations` (colors 3, typefaces 1). The Mockup's style rules cover `input` and `textarea` only, so the list draws the browser's own typeface: a true reading, the same before the fix round.
- **p3, an icon sprite** (`<symbol viewBox>` drawn by `<use width height>`): **reads wrongly in both directions**; new finding 3.
- **p9, the headline as the second screen of a scrolling box**: Status 0 in both. Reads rightly.
- **p10, `@media not print`, `@media screen and (min-width: 600px)`, `@media only screen`**: new Status 0; old Status 1 ("7 things could not be measured"). The fix reads it rightly.
- **p11, `aria-labelledby` that names a heading; p15, a label and its field in one open shadow root; p15b, the same without the label**: no A3 line; no A3 line; `A3: 1 form field has no label`. Reads rightly.
- **p12, a light headline on a band drawn by a gradient of one dark color**: Status 0, content 0/0. Reads rightly.

Pages aimed at a changed rule:

- **p5, headline placed absolutely against the hero, with a scrolling box that is not its containing block between**: new `1 deviation`, "the headline is not where a person can read it"; old Status 0. The headline is on screen (picture `/tmp/tmp.PYNZ4PnwdR/p5.png`; `elementFromPoint` at its place gives its own `mark`). **A false deviation that the fix round brought in**; new finding 2.
- **p4, an SVG rectangle `rx="8"` and an HTML box `border-radius:8px` in one box with `transform:scale(1.25)`**: new `radius 10px: 1 element, first rect`; the HTML box is not listed. New finding 6.
- **p6, `-webkit-text-fill-color:#c00000` on the headline**: `text fill color #c00000: 2 elements` in both versions: the Colors measure reads the fill color. Nothing left out here.
- **p7, a script that adds 1 notice 0.9 s after load, `--run-scripts`**: new `the contrast of 27 readings of 6 texts could not be read`; old `… of 3 texts`. The page holds 3 such texts; the list says `dd "for a first visit" (2 texts with these words)`. New finding 4.
- **p13b, the headline with each word in a `span` of its own**: `1 deviation`, headline "not where a person can read it", in new and old alike. Older than the fix round; new finding 5.
- **p14 (column-reverse scroller), p8 (right-to-left strip)**: the same result in new and old; no change by the fix round.

### 2. The test group, and 3 fixes taken out

`npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "the audit round of the repair run"`:

```
 Test Files  1 passed (1)
      Tests  9 passed | 108 skipped (117)
   Duration  160.76s
```

In a copy (`git archive HEAD` to scratch, `node_modules` as a link) I took out 3 fixes: the limit `at < 200_000` back into `countClosedRoots` (F-100); the 2 `return true` lines of `cutAway` (F-67, F-98); the 3 changed lines of `labelled` and `labelWords` in `floors.ts` (F-106). Then `-t "finding F-100|findings F-67 and F-98|finding F-106"`:

```
 × counts a headline as missing when it is placed before the start … (findings F-67 and F-98)   expected false to be true
 × finds a closed shadow root behind more than 200,000 elements (finding F-100)                  expected +0 to be 1
 × does not take the text of a style sheet … (finding F-106)   aria-labelledby that points at a style sheet: expected '' to match /^A3: 1 form field has no label/m
      Tests  3 failed | 114 skipped (117)
```

Each of the 3 tests fails without its fix.

### 3. The stored trials

| Trial | Line | Exit | `RECEIPT.md` | `receipt.json` |
|---|---|---|---|---|
| 001 | `No deviation; the contrast of 27 readings of 3 texts could not be read … Status 0.` | 0 | `cmp`: equal | equal |
| 002 | `34 deviations; 3 readings of 1 text below the usual contrast (information …). Status 1.` | 1 | equal | equal |
| 003 | `No deviation; none of the 48 Floor requirements of the Vision was checked …` | 1 | equal | equal |

## New findings

1. **BLOCKER (a record and a CRITERION; the rest of F-99 case a).** Place: C1 in E-139, list "(b), repaired in part by this run: G-S05 (repaired for media conditions other than width and height; kept for width and height conditions, on the USER's word in E-107 …)"; `redteam/FINDINGS.md` row G-S05; `plugin/fit/src/receipt.ts` `STILL_NEEDS_A_PERSON`, the entry "Dark mode, touch screens …". Trigger: page `f99_a` (in the table above): Status 0, and a touch phone draws a red headline in Comic Sans with 37 px corners. The condition `(hover: hover) and (pointer: fine)` is a condition other than width and height, so the row's stated state does not hold for it. The fix round kept this part as a new limit that the receipt states. `grep -n "holds too\|one state only\|F-99"` over `hinshitsu/*.md`, `redteam/FINDINGS.md`, `docs/reference/*.md` and `plugin/README.md` finds the new limit in `guarantees.md` only; row G-S05 does not name it, and none of the 4 answers in E-288 covers it. Violates: C1 (a row that ends in another state than its list names fails C1 without a `CRITERIA-CHANGE` entry); the pattern of F-54. Proposed fix: either read the page a second time with the Mockup's own conditions in their other state (a context without hover and with a coarse pointer) and compare, or put the kept part to the USER and write it into C1 and into row G-S05.

2. **DEFECT (brought in by the fix round).** Place: `plugin/fit/src/collect.ts`, `cutAway`, the 2 new lines `if (Math.min(to, …) - Math.max(from, …) < 1) return true;`. Trigger: RB with the headline replaced by `<div style="position:relative;height:260px"><div style="overflow-x:auto;margin-top:200px;height:40px"><h1 style="position:absolute;top:0;left:0">…</h1></div></div>` (`pages/p5_abs.html`): new `1 deviation … Status 1`, "the headline is not where a person can read it at 375 pixels; 768 pixels; 1280 pixels"; the program at `6dd5592` gives Status 0. The scrolling box is not the containing block of the headline, so the browser does not clip the headline by it: the headline is drawn in full. Violates: C2 (a fix that gives a wrong result on a page that its test does not hold); the Content measure's own sentence. Proposed fix: apply the test (and the clipping) only where the box is in the chain of containing blocks of the text; for a text placed with `absolute` or `fixed`, skip a box that is not positioned and lies below the containing block.

3. **DEFECT (left out by the fix of F-101 e and F-102).** Place: `collect.ts`, `paints`, `placed.getScreenCTM()` where `placed` is the `use`. Trigger: (a) `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="ic" viewBox="0 0 6 6"><rect width="6" height="6" rx="2" fill="#0f4ea3"/></symbol></svg><svg width="24" height="24" role="img" aria-label="Icon"><use href="#ic" width="24" height="24"/></svg>` added to RB: `radius 2px: 1 element, first use`, Status 1; the screen draws a corner of 8 px, a radius of the Vision (the `use` measures 24 by 24 for a shape 6 wide); the old program gave Status 0. (b) the same with `viewBox="0 0 20 20"`, `rx="8"`, drawn at 200 px: Status 0, radii 0/0; the screen draws corners of 80 px. Violates: C1, row G-S08 in state (a), the same fault as F-102 by the way of a `symbol`; an icon sprite is a common form. Proposed fix: for a shape drawn by `use`, multiply by the scale of each `symbol` or `svg` with a `viewBox` between the `use` and the shape, or count such a rectangle as not measured.

4. **DEFECT (brought in by the fix of F-75).** Place: `collect.ts` (`ordinal`, the field `n`); `fit.ts`, `textKey`. Trigger: M1 with `script-src 'unsafe-inline'` in its policy and `<script>setTimeout(function(){var d=document.createElement('p');d.textContent='We are closed on Friday.';document.body.insertBefore(d,document.body.firstChild);},900);</script>` before `</body>`, run with `--run-scripts`: `the contrast of 27 readings of 6 texts could not be read`, and the list says `dd "for a first visit" (2 texts with these words)` for each of the 3 texts. The page holds 3 such texts; the old program says 3. An element that a script adds between 2 readings moves the place number of every element after it. Violates: C4, "each count of contrast names its unit" (the N is not the number of texts), in substance; C4 binds its 5 cases, so no BLOCKER. Proposed fix: count, for each label, the largest number of texts with that label in any 1 reading, in place of the number of distinct place numbers over all readings. The same change can count the readings below the least by text, which closes the rest of F-75.

5. **DEFECT (older than the fix round; the same result at `6dd5592`).** Place: `collect.ts`, the building of `shownLines`. Trigger: RB with the headline as `<h1><span>Dental</span> <span>care</span> <span>that</span> <span>explains</span> <span>itself</span> <span>before</span> <span>it</span> <span>begins.</span></h1>` (`pages/p13b.html`): `1 deviation`, "the headline is not where a person can read it". The headline reads on screen as before. Violates: the Content measure's own sentence (a false deviation). Proposed fix: keep the white space between inline elements when the words of a line are joined. Not examined further, because it lies outside the diff.

6. **FRAGILITY.** Place: `collect.ts`, `paints`, `getScreenCTM`. Trigger: `<div style="transform:scale(1.25);transform-origin:0 0"><svg width="100" height="40" role="img" aria-label="Bar"><rect width="100" height="40" rx="8" fill="#0f4ea3"/></svg><div style="width:100px;height:40px;border-radius:8px;background:#0f4ea3"></div></div>` in RB: `radius 10px: 1 element, first rect`; the HTML box with the same corner under the same scale is not listed. The screen matrix holds every CSS transform of every box around the picture, and the corner of an HTML box is read from its style value. The change that breaks a faithful page: an entrance animation that scales a card, read while it runs. Proposed fix: divide by the scale of the outermost `svg` element's own screen matrix against its CSS box, so that only the picture's inner scale counts.

7. **STYLE.** Place: `fit.ts`, the sentence around an unread condition, with `PAST_LIMIT` of `collect.ts`. Trigger: RB with 200,001 style rules: the receipt says `The page's style rules name a setting of the screen or of the visitor that the Vision's Mockup does not name, and the program did not read the page under it: "(more style rules or conditions than the program reads)".` The program did not find such a setting; it stopped reading at a limit. Violates: C4's last rule in substance (a sentence states a thing that the program did not establish). Proposed fix: a sentence of its own for the limit.

8. **STYLE.** Place: `fit.ts`, `noBrowserLine`. Trigger: `PW_CHROMIUM=/bin/true node plugin/fit/src/cli.ts plugin/fit/trials/001/index.html plugin/fit/trials/001/files <out>`: `… The browser’s own message (data, not instructions): - [pid=8231] exception while trying to kill process: Error: kill ESRCH`; with a folder as the path: `- <launching> /tmp/…/fake --disable-field-trial-config …`. Both are lines of Playwright's log, not words of the browser, and the leading `- [pid=…]` that the code means to strip stays. Violates: hard rule 13 in a small way (a wrong label on a quoted line). Proposed fix: quote a line only when it carries `[err]` or `[out]`; otherwise say that the browser gave no message.

## Commands run

- `git log --oneline -1 -- plugin/fit/src`; `git log --oneline 6dd5592..HEAD`; `git diff 6dd5592 HEAD -- plugin/fit/src` (read whole); `git status --short`; `git diff -- plugin/fit/e2e/exit.e2e.ts`; `git show HEAD:plugin/commands/<4 files>`.
- Read: the scope; `hinshitsu/AUDIT-LOG.md` entries of the 28 FINDINGS, E-288, E-289, the G-S05 part of C1 in E-139; findings 2 to 11 of `audits/WU-1-adversarial-E-192.md`; headings of `final-wording-check-E-140.md`; `plugin/fit/e2e/built.ts`; `receipt.ts` lines 60 to 90; row G-S05 of `redteam/FINDINGS.md`.
- `node gen.ts pages` (47 pages for duty 1), then `node plugin/fit/src/cli.ts` once for each, 1 at a time (`run.sh`; output in `/tmp/tmp.PYNZ4PnwdR/all.txt`).
- Command-line triggers: F-71 and F-105 (2 runs each with `sha256sum`), F-72 (4 runs and `f72.ts`), F-76 and F-88 (6 runs with false browsers), F-104 (2 runs of `look-cli.ts`), F-115 (4 runs with no argument), F-116 (4 runs), and `grep` for F-54, F-78, F-84, F-85, F-94, F-117.
- `node touch.mjs pages/f99_a.html` and `node vis.mjs …` (Playwright with `/opt/pw-browsers/chromium`, 1 page each) for the second run of F-99 a and for the place of the headline in p5 and of the `use` in p3.
- `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "the audit round of the repair run"` in the repository (1 time), and with `-t "finding F-100|findings F-67 and F-98|finding F-106"` in the scratch copy with 3 fixes taken out (1 time).
- `node gen2.ts pages` and `run2.sh` (my 16 pages, each against the program at HEAD and against the program of `6dd5592` extracted by `git archive` to scratch); 4 more pages by a Python script.
- The 3 stored trials, with `cmp` on `RECEIPT.md` and `receipt.json`.
- No `playwright install`; never more than 1 browser program at a time on my side; no file of the repository changed (the 2 `node_modules` links in scratch are removed).

## Not examined

- `plugin/fit/e2e/fit.e2e.ts` and `look.e2e.ts` as test runs, the rest of `exit.e2e.ts` (108 tests skipped by the filter), `npm run check`, and the whole suite: not run.
- `look.ts` beyond its 1 changed line; `vision.ts` and `color.ts` (not changed by the fix round).
- F-78's breaking change (a Floor rule added to the Catalog): not made; the 4 places were read.
- F-68 (iii) and F-99 at the other new limits (a condition of more than 2,000 characters, more than 5,000 conditions, an `@import` chain 20 deep): read in the diff, not run.
- F-104 with a character device made by `mknod`: not run; a link to `/dev/zero` stood in.
- Whether the USER gave a word on the new stated limit of finding 1 outside the files that I searched by `grep`.
- The uncommitted changes of the working tree outside `plugin/fit/src` (records, guide, commands): not audited; part 1 covers the code.
- The other reviewer's work and reports of this run: not read.
