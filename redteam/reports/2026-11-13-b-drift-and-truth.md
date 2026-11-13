# Drift and truth audit, second round (2026-11-13, report b)

**Reviewer:** drift and truth auditor (adversarial). **Audited commit:** `52870f8` on `claude/brave-mayer-sawqz9`, in a separate worktree. **Method:** I read the code, ran the checks, wrote throw-away test scripts against `packages/core`, planted defects by hand in a scratch copy of the core, and ran the repository's own defect-planting tool. I changed no file in the repository except this report. Every throw-away script was deleted after it ran.

**Checks run on this commit.** `npm ci`: passed. `npm run check` (types, lint, boundary rule, 122 unit tests): passed. `npm run e2e` (build, size budget, 96 browser tests: 32 on the Studio, 64 visual): passed, locally, in Chromium. `redteam/tools/plant-defects.py`: 38 of 39 planted defects caught. I did not look at any CI run on GitHub.

**Severity words** follow the brief: *blocker* = a wrong result the owner would rely on (a false contrast pass, data corruption, or a governance claim that hides a failure); *major*; *minor*; *note*.

## Counts

| Severity | Count |
|---|---|
| Blocker | 1 |
| Major | 4 |
| Minor | 7 |
| Note | 4 |

---

## Findings

### T2-01 · blocker · A contrast pair is reported as passing, and is left alone by "Fix for me" (Enforce), while the emitted colors fail

**Code at issue.** `packages/core/src/tokens.ts:231` measures each pair on unrounded OKLCH values; `tokens.ts:245` decides which pairs fail with that unrounded measure; `tokens.ts:296` sets `passes: ratio >= s.required` from the same unrounded measure. The safety margin `MARGIN = 1.012` (`tokens.ts:53`) applies only to pairs that are repaired, not to pairs that pass by a hair before any repair. The exported `hex` tokens are rounded to 8 bits per channel, and a pair that sits at 3.000 before rounding can sit below 3 after it.

**Evidence (reproduced).** A throw-away test swept 14 Directions × light and dark × 13 accent Options × 7 color-strategy Options × 5 button finishes = 12,740 designs, in Advise and Enforce, and re-measured every reported pair from the emitted hex colors with the test suite's own independent contrast code (`test/helpers.ts`, `remeasure`). Output:

```
[AUDIT] C {"designs":12740,"falseRepair":0,"silentFail":10,"passLie":20,"adviseMiss":10,"unrepairedWarn":0}
 passLie:    enforce cobalt-wash/dark/leaf/tinted-surface/flat field-border-on-card hex=2.994 req=3 reported=3
 silentFail: cobalt-wash/dark/leaf/tinted-surface/flat field-border-on-field hex=2.994 req 3
```

A second sweep of 6,000 random full designs (random Options on every Step, plus random slider values) found 3 more, including link text, which needs 4.5:1:

```
[AUDIT] C2 {"designs":6000,"falseRepair":0,"silentFail":3,"passLie":3,"unrepairedWarn":0}
silent link-on-page 4.486  (accentHue 119.9, accentLightness 0.55, contrast 0.65, warm neutral, light page)
```

In each case the pair carries `passes: true` and a reported ratio of 3.00 (or 4.5); Enforce reports nothing and repairs nothing; the hex colors measure 2.994:1 (or 4.486:1). The shortfall is small (0.2 to 0.3 percent) and rare (13 cases in about 18,700 designs). It is still the kind of result the owner relies on: a "pass" that a fresh measurement of the shipped colors contradicts. Repairs were all honest: `falseRepair` was 0 in both sweeps.

**Why the suite misses it.** The test "Enforce brings every pair … up to its requirement, measured again from the emitted colors" (`test/tokens.test.ts:61`) is sound, but it runs over `everyDesign()` (`test/helpers.ts:63`): one Option at a time on five base designs. The failing designs combine three or more choices.

**Suggested fix.** Decide pass or fail on the rounded colors (measure from the `toHex` output), or treat a pair as failing below `required × MARGIN`, so that every pair that ships has the same headroom as a repaired one. Add a seeded random-combination sweep (a few thousand designs) to the unit suite.

### T2-02 · major · The second color stops following the main color when its Decision is "kept", and the saved Decision then names the wrong Option (finding M-05 is only partly fixed)

**Code at issue.** `packages/core/src/engine.ts:151-166` (`rederive`) recomputes a derived hue only when the Decision's kind is `picked` (`engine.ts:156`). `keep` (`engine.ts:183-188`) records `optionId` once, and nothing recomputes the `optionId` or `values` of another Step's Decision later. The comment at `engine.ts:148` and the Option text "A second color from the opposite side of the color wheel" promise that the second color follows.

**Evidence (reproduced).** A throw-away test ran 400 random sequences of 25 actions (pick, keep, tune, revert, pickValues) and checked after each action that every Decision's `optionId` equals `matchingOptionId(params)` and that its `values` equal the design's values:

```
[AUDIT] D counts {"optionId-stale(kept)":8,"derived-stale(kept)":8}
… keep color-strategy > pick theme:dark > … > pick accent:graphite ::
    color-strategy says duo-triad, params match null; accent2 255 want 15
```

Save and reload then change the Decision (second throw-away test, keys compared in canonical order):

```
[AUDIT] D2 roundtrip changed 1 /400
color-strategy: {"kind":"kept","optionId":"duo-triad",…} -> {"kind":"kept","optionId":null,…}
```

So: the owner keeps "Two colors: a third of the wheel apart", changes the main color, and the second color stays where it was; the Decision in memory still says "duo-triad", and the reloaded file says no Option. The Studio's screens do not read `optionId` (no match in `apps/studio/src`), so today the visible harm is the stale second color; the wrong `optionId` will reach the Prescription when M6 exports Decisions. A duo design that comes from a Direction, with no Decision on that Step, has the same stale second color.

**Why the suite misses it.** The derived-hue test (the tool's mutant N02) covers `picked` only.

**Suggested fix.** In `rederive`, follow the derive rule for any Decision whose recorded Option has one, and recompute `optionId` and `values` for every Decision after every action. Add the invariant ("every Decision's `optionId` and `values` match the design") as a property test over random action sequences, and save-reload equality as a second.

### T2-03 · major · Headline gradients are drawn but never measured; "Warn me" stays silent at 1.7:1, "Fix for me" never repairs the fading headline, and the "not checked" list mentions neither

**Code at issue.** `tokens.ts:447-464` (`displayTokens`): the two-color headline is repaired to 3:1 only under Enforce; nothing measures it under Advise, and it is absent from `PAIRS` (`tokens.ts:191-221`). The "Subtle fade" headline fades the ink to 56 percent opacity (`tokens.ts:451`) and is neither measured nor repaired in any profile. `NOT_CHECKED` (`tokens.ts:224-229`) lists glows, photographs, hover states, and human judgment, not headline gradients. The comment on `PAIRS` says "Every color pair that the Mockup draws".

**Evidence (reproduced).** A throw-away test parsed the gradient stops out of `--display-fill`, converted them to hex, composited them over `--hero-bg`, and measured:

```
accent-gradient, Advise:  worst 1.70:1 (poster-block / light / Golden yellow / third-of-the-wheel); 290 of 2,548 designs below 3:1; no note
accent-gradient, Enforce: worst 3.02:1 (the repair works)
ink-gradient (faded stop), Advise and Enforce: worst 2.42:1 (graphite-precision / light / magenta / color block)
```

The ink-fade figure measures the stop at 56 percent; the visible bottom of the glyphs sits a little above that, so 2.42 slightly overstates the problem there.

**Suggested fix.** Add the two headline stops as measured pairs (large text, 3:1) in every profile, have Enforce move the fade's end stop, and until then add "Headlines filled with a gradient or a fade" to `NOT_CHECKED`.

### T2-04 · major · About 70 rows of the findings log claim "unit and browser tests cover it" in identical words, and name no commit

**Claim at issue.** `redteam/FINDINGS.md`, for example lines 31, 35, 40-48, 60-75, 77-79, 82-83, 90-91, and most of 101-149: "Fixed in `6597599` and the commit after it; unit and browser tests cover it." The log's own rule (`FINDINGS.md:9`) says "Fixed: changed and covered by a test or a re-measurement; the cell names the commit." "The commit after it" names no commit, and the same sentence stands on wording findings (W-02, W-03, W-06, W-07, C-04, C-06, FTU-04, FTU-20), for which no test is named.

**Evidence.** M-05 carries that sentence and is only partly fixed (T2-02). W-06 ("One setting has four names") carries it, and the setting has two names per choice again (T2-08). Planted defects P2, P4, P7, P9, and P10 below sit in code that these rows describe as covered, and no test catches them.

**Suggested fix.** For each "Fixed" row, name the commit and the test (file and title) that would fail if the fix were undone; for wording findings, use "Corrected" and say where. Re-open M-05 and W-06 as "Fixed in part".

### T2-05 · major · Five of ten defects I planted survive the whole unit suite

See "Planted defects" below. The survivors: `revert` stops recomputing derived hues (P2); the outline button on the side rail is held to 3:1 instead of 4.5:1 (P4); Enforce stops repairing the two-color headline (P7); the Direction generator stops discarding designs with conflicts, which decision D23 promises (P9); the lede on a painted first screen is measured as opaque, although the stylesheet draws it at 88 percent (P10). No test ties the contrast pair list (`PAIRS`) to the stylesheet: a pair's `required` value or `alpha` can change and every test still passes, because the tests re-measure each pair against its own declared requirement and opacity. The repository's own tool has one survivor too (N04, "Enforce reports repaired without measuring again"), because in the tested designs every repair succeeds.

**Suggested fix.** One test per survivor: revert with a duo design; a table test that pins each pair's `required` and `alpha` and checks the alpha against the matching `opacity: var(--…)` rule in `SMALL_BUSINESS_CSS`; a gradient-pair test (T2-03); a test that every generated Direction has no conflict; a design for which a repair cannot reach its target (to catch N04).

### T2-06 · minor · Import re-attributes a "picked" Decision to whichever Option the values happen to match

**Code at issue.** `engine.ts:650-657`. When a file's Decision says `picked` and the design's values match some Option, the import keeps `picked` and records that Option, whatever Option the file named.

**Evidence (reproduced).** A file whose `decisions.nav` reads `{stepId:"radius", optionId:"pill", kind:"picked", values:{radius:3}}` loads as `{stepId:"nav", optionId:"top-inline", kind:"picked", rejected:[3 Options]}`, with no note. The record now says the owner picked "Name left, links right" and rejected the other three, which the owner never did.

**Suggested fix.** When the file's `optionId` differs from the recomputed one, record the Decision as `tuned` (or `kept`) and add a note, as the code already does when no Option matches.

### T2-07 · minor · `CLAUDE.md`'s stack line was changed before the owner approved the change

**Claim at issue.** `CLAUDE.md:55` now reads "Playwright 1.63 (D28, pending the owner)" and adds the 7-day waiting rule (D27). Commit `ab07a6a` made both edits. Hard rule 2 requires the owner's approval, recorded in `DECISIONS.md`, before the stack changes; `DECISIONS.md:40` marks D28 "Pending the owner", and `DECISIONS.md:39` marks D27 "Recorded". D28's own text ("not the 1.65 that the stack line names") no longer matches the stack line.

**Suggested fix.** Restore the last approved stack line and list the pending departures beside it, or obtain and record the owner's approval for D27 and D28.

### T2-08 · minor · One setting, two names (finding W-06 is marked "Fixed")

**Claim at issue.** The Studio shows "Off / Warn me / Fix for me" (`apps/studio/src/App.tsx:47-49`, `:121-122`). The owner's documents name the same choices "Advise" and "Enforce": `PROGRESS.md` ("Waiting on the owner", item 5), `DECISIONS.md` D13 and D24, `FINDINGS.md` FTU-26. The Step "Main color" (`steps.ts:349`) teaches the same thing as "the accent" (`steps.ts:353`), and its Options say "accent" throughout.

**Suggested fix.** One name per choice, the same on screen and in the documents; or state the mapping once in `PROGRESS.md` and in the defined-terms table (with the owner's approval).

### T2-09 · minor · Colors at the edge of the screen's range are written out slightly out of range

**Code at issue.** `color.ts:80-84` (`toCss`) rounds chroma to 4 decimals after gamut mapping, and `toGamut` stops exactly at the boundary, so rounding up can push the written color back out of sRGB.

**Evidence (reproduced).** Of 30,000 random OKLCH colors, `toGamut` left none out of range (good), but 10,659 of the `oklch()` strings, parsed back, fall outside sRGB by more than the code's own tolerance (0.0005). The browser then maps the color itself, so what it paints can differ very slightly from the hex value that the contrast checks measure. I did not measure the size of the difference in a browser.

**Suggested fix.** Round chroma down, not to nearest, in `toCss` and `toCssAlpha`.

### T2-10 · minor · One backup slot, overwritten without a word (inferred from the code, not reproduced)

**Code at issue.** `apps/studio/src/platform.ts:139-146` keeps one backup under one key. `store.ts:277` and `store.ts:285` write to it whenever a start finds two differing copies or an unreadable copy, which replaces any earlier backup, including one that held the only copy of earlier work. When `keepBackup` fails and one copy was readable (`store.ts:286-287`), the note says nothing about the missing backup, saving goes on, and an unreadable page copy is replaced at the next save.

**Suggested fix.** Keep a short list of backups (for example the last three, each with its time), and say on screen when a copy will be replaced without one.

### T2-11 · minor · Counts and waypoints that do not match the repository

- `PROGRESS.md` ("What exists"): "29 measured contrast pairs". `PAIRS` has 29 entries (`tokens.ts:191-221`), and the highlighter pair adds a 30th (`tokens.ts:233`, `:298-301`).
- `PROGRESS.md` milestone table: "M2 … Met: 122 unit tests". 122 is today's count; M2 was met with fewer.
- `WAYPOINTS.md` W4: "Commit: (this commit)". Two commits (`460aa14`, `52870f8`) followed the commit that added the row, so the row no longer identifies a commit.
- `PROGRESS.md`: "plants 39 defects; the unit suite catches 38" is true (my run: 38 of 39), but it does not name the survivor (N04), which is a defect of exactly the kind finding X-01 was about.

**Suggested fix.** Correct the counts, write the hash into W4, and name N04 in `PROGRESS.md`.

### T2-12 · minor · Conflict-rule tests check only that each rule fires on one example

**Code at issue.** `test/catalog.test.ts:194-223`. Each rule gets one positive trigger; the only negative case is the plain start, which none of the rules touch. My planted defect P1 (loosen "outline-thin" from weight below 600 to below 900) was caught only by chance, by the Directions test, because one curated Direction sits in the loosened band.

**Suggested fix.** For each threshold rule, add one case just inside and one just outside the threshold.

### T2-13 · note · Options carry no source, grade, or review date of their own

`catalog/types.ts:49-51` declares that an Option inherits its Step's sources, evidence grade, and review date. Hard rule 5 names Options among the records that carry these fields. Finding C-07 is marked Fixed on the strength of that inheritance. The owner should decide whether inheritance satisfies the rule.

### T2-14 · note · The defined-terms table still says an Option is "one of the 3–4 concrete choices"

The Catalog offers 2 (Light or dark) to 13 (Main color). `PROGRESS.md` lists this as waiting on the owner; it is recorded here so that the next review does not lose it.

### T2-15 · note · The line-thickness slider allows values that the parameter description rules out

`params.ts:85` says "Border thickness in px: 0, 1, 1.5, 2, or 3." The slider (`steps.ts:570`) allows 0 to 4 in steps of 0.5, and the import check (`params.ts:110`) allows 0 to 8.

### T2-16 · note · The dot grid is louder than the range the Step text cites

The Atmosphere Step says grids in the read code stay "at 5 to 20 percent strength" (`steps.ts:470`). The tool's own dot grid draws at 22 percent on light pages and 28 percent on dark ones (`tokens.ts:417`). The Step says the tool's values were not copied, so the text is not false, but the tool's own grid sits outside the range the text presents as the norm.

---

## Status check of the first review's findings

**Every blocker.**

| ID | Logged status | My verdict | Evidence |
|---|---|---|---|
| SEC-01 | Fixed | **True** | `DECISIONS.md:51-82` has 30 rows, one per direct dependency (4 runtime + 13 font + 13 development); every manifest pins an exact version; every recorded publication date is 7 days or more before 2026-11-13 (zustand exactly 7). I did not re-query the registry. |
| M-01 | Fixed in part | **True as stated** | The 64 visual tests exist and pass locally (`npm run e2e`: 96 passed). The private-page check is still open, as the row says. CI not checked. |
| C-01 | Fixed | **True** | Every `record` path exists. Sampled claims match their records: Pernice and Budiu 2016 (27 against 48 percent), Dyson and Haselgrove 2001, Shaikh 2005, Shaikh, Chaparro and Fox 2006, Brumberger 2003, Arditi and Cho 2007, Larson 2004, WCAG 1.4.3 and 2.3.3 in `kb-perception-cognition.json`, each with a verification level that matches the Catalog's basis word; Krebs's 14 patterns, GOV.UK 2-pixel form borders, and "at least two shadow layers" in record 04; Radix −0.025 em at 60 px, Carbon 70–700 ms in two moods, GOV.UK 19 px body and 5 px steps, Primer 14 px and six sizes, Material 3 shape steps in record 08; Primer "small 3px" in `exemplar-tokens.json`. |
| R-12 | Corrected; Acknowledged | **True** | `FINDINGS.md:5` states the breach plainly. |
| FTU-01 | Fixed | **True as far as the tests reach** | The two named browser tests pass locally. I did not watch the page at 200 percent zoom myself. |
| FTU-02 | Fixed | **True** | The Step's applied card comes from the design's values (`store.ts:119-121`); the tool's mutants M22 and N01 are caught. |

**A sample of 17 "Fixed" majors.**

| ID | My verdict | Evidence |
|---|---|---|
| M-05 | **Partly fixed; status wrong** | T2-02. |
| X-01 | True, with a coverage gap | The Enforce tests re-measure from hex with independent code; T2-01 shows designs they do not reach; tool mutant N04 survives. |
| X-02 | **Partly fixed** | The tool: 38 of 39 caught. Mine: 5 of 10 survive (T2-05). |
| P-01 | True | Test at `tokens.test.ts:108`; my sweeps found no focus-ring failure. |
| P-02 | True | Test at `tokens.test.ts:130`; the outline pairs exist. |
| P-04 / FTU-03 | True | `keep` leaves the design unchanged (`engine.ts:183-188`); mutant N01 caught. |
| P-05 / SEC-03 | True | `store.ts:288-299` holds saving when no copy can be read. |
| SEC-02 | True, with a gap | Neither copy wins by default (`store.ts:255-281`); see T2-10. |
| SEC-04 | True | Steps and Directions are looked up in `Map`s (`steps.ts:693-698`, `directions.ts:229-234`); my files with `__proto__` and `constructor` keys loaded without effect. |
| M-07 | True | `migrateV1` (`engine.ts:602-628`) with a version-1 fixture used by unit and browser tests. |
| M-09 | True | `setReason` and the schema's `reason` field; mutant M09 caught. |
| C-02 | True | No Step is graded `measured`. |
| C-03 | True for the sample | Every exemplar I checked has a record that supports it. |
| C-05 | True for the sample | Basis words match the knowledge base's verification levels. |
| C-07 | **Partly** | T2-13. |
| FTU-08 | True | One Undo button over a history of the last changes (`store.ts:539-543`). |
| FTU-23 | True | Variation labels read "Color (hue): a little toward …" (`engine.ts:291`). |

W-06 (minor, "Fixed") is **not fixed**: see T2-08.

---

## Planted defects

Each defect was planted alone in a scratch copy of `packages/core` (outside the repository), and the full unit suite (122 tests) ran against it.

| # | Defect | Where | Caught? | By which test |
|---|---|---|---|---|
| P1 | Conflict rule "outline-thin" fires below weight 900 instead of 600 | `engine.ts:322` | Caught, by chance | "has 14 curated Directions … conflict-free" (not the rule's own test) |
| P2 | `revert` no longer recomputes derived hues | `engine.ts:225` | **Survived** | none |
| P3 | Repair margin removed (`MARGIN = 1`) | `tokens.ts:53` | Caught | "Enforce brings every pair … measured again"; "keeps links and the focus ring at 3:1" |
| P4 | Outline button on the side rail held to 3:1, not 4.5:1 | `tokens.ts:213` | **Survived** | none |
| P5 | Import keeps "picked" when no Option matches | `engine.ts:652` | Caught | "marks a pick as hand-set when its Option is no longer in the Catalog" |
| P6 | `keep` overwrites an existing pick | `engine.ts:186` | Caught | "does not let 'keep' overwrite a Decision that exists" |
| P7 | Enforce stops repairing the two-color headline | `tokens.ts:458-459` | **Survived** | none |
| P8 | `pickValues` accepts values the Step does not own | `engine.ts:204` | Caught | "accepts hand-set values only for values that the Step owns" |
| P9 | The generator no longer discards designs with conflicts | `engine.ts:478` | **Survived** | none |
| P10 | The lede on a painted first screen is measured as opaque | `tokens.ts:203` | **Survived** | none |

**Repository tool** (`redteam/tools/plant-defects.py`, run unchanged): 38 of 39 caught; N09 skipped by design; **N04 "Enforce reports repaired without measuring again" survived**.

---

## What I verified as true

- `npm run check` passes: 122 unit tests, type check, lint, boundary rule.
- `npm run e2e` passes locally: 96 browser tests (32 Studio, 64 visual); bundle 1,142 KB against a 1,600 KB budget.
- The contrast formula is the WCAG 2.x formula: #777777 on #ffffff measures 4.4781; #767676 on #ffffff 4.5422; black on white 21.
- `toGamut` leaves no color outside the sRGB range (0 of 30,000 random colors).
- Enforce never reports a pair as repaired when the emitted colors fail it (0 cases in 12,740 + 6,000 designs).
- No `innerHTML`, `dangerouslySetInnerHTML`, `outerHTML`, `insertAdjacentHTML`, or `document.write` in `apps`, `packages`, or `scripts`. (`platform.ts:328` writes a fixed string into a probe frame's `srcdoc`.)
- `packages/core` imports no React and no browser API (the boundary rule passes, and my reading of `src/` agrees).
- Every dependency in every `package.json` is pinned to an exact version; `apca-w3` appears nowhere.
- No code, Studio text, or project document claims "WCAG compliant", "ADA compliant", or "accessible" about the tool's output. The word appears only in research records, quotations, and `CLAUDE.md`'s own rule.
- The Mockup contains no script, and the reduced-motion rule stops all animation and transition (`smallBusiness.ts:410`).
- Catalog label numbers match their patches: corners 3, 8, 14 px; lines 1, 2, 3 px; text 15, 17, 19 px; page widths 46, 68, 84 rem (736, 1,088, 1,344 px, labelled "about 740 / 1,090 / 1,340").
- `PROGRESS.md` counts of Steps (6 + 17), Directions (14), conflict rules (12), harmony rules (11), and unit tests (122) match the code.
- The stack line in `CLAUDE.md` matches the pinned versions (TypeScript 6.0.3, React 19.3.1, Vite 8.3.6, Zustand 5.1.0, Zod 4.6.7, Vitest 5.1.0, Playwright 1.63.0, axe-core 4.14.0).
- `parseProject` accepted every one of 400 random projects on the way back in, and the edge files I fed it (empty lists, extreme in-range numbers, `__proto__` keys, a Decision filed under the wrong Step) all loaded and rendered without a crash.

## What I did not get to

- CI runs on GitHub (not queried); `PLAN.md`, `docs/owner-instructions.md`, and `phase0/` were not re-read.
- The remaining 38 "Fixed" majors, the minors, and the notes of the first review.
- The Studio by hand in a browser (keyboard pass, zoom, phone widths); the save path on the private page.
- The lockfile's indirect packages against the 7-day waiting period (D27); registry signatures.
- Whether the contrast checks agree with what Chromium actually paints from the `oklch()` strings (T2-09).
- The research records beyond the sampled claims; `docs/research/09` (finish recipes) was not opened.
