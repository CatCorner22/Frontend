# Third review: drift and truth auditor (2026-11-13, narrow)

Reviewer: drift and truth auditor, in its own worktree (branch `claude/brave-mayer-sawqz9`, head `af209b6`).
Method: I ran the code. I wrote my own sweeps in a temporary test file (now deleted), read every changed sentence in `git diff abb828d 8609427`, planted 17 defects one at a time (each reverted), and checked the records against the repository. Nothing was committed.

Baseline: `npm run check` passed (exit 0, 134 unit tests). `npm run e2e` passed (exit 0, 102 browser tests: 38 on the Studio, 64 visual), in 196 seconds.

Counts by severity: **1 blocker, 6 major, 7 minor, 2 notes.**

---

## Findings

### T3-01 — blocker — A pair is reported as passing while the colors the page draws fail (T2-01 and D37 are only partly true)

- **Claim:** FINDINGS T2-01 "every pass-or-fail decision uses the colors as written to the page"; DECISIONS D37; comment at `packages/core/src/tokens.ts:232-233`; `packages/core/src/color.ts:188-197`.
- **What the code does:** `contrastOverEmitted` rounds the *unrounded* OKLCH color to 256 steps per channel. But the page is not given that color. The stylesheet gets `toCss()` (`color.ts:80-84`), which first rounds lightness to two decimals of a percent, chroma to 4 decimals, hue to 2 decimals. The browser then converts that rounded OKLCH string itself. The hex export (`toHex`) uses the unrounded color. So the measured color, the hex export, and the drawn color can differ by one step per channel, and near a requirement one step decides pass or fail.
- **Evidence (reproduced):** my sweep, seed 777, 2,500 random designs (random Option on every Step, random slider values), both profiles, 93,944 pairs. I parsed each emitted CSS string back, converted it with my own copy of the OKLab matrices, and rounded to 8 bits:
  - design 1711, "Fix for me": `field-border-on-card` and `field-border-on-field` reported **3.05, passes**; the CSS colors `oklch(51.2% 0 120.05)` on `oklch(22.03% 0 120.05)` measure **2.9998**. The hex export says `#676767` on `#1b1b1b`.
  - Chromium (the pre-installed Playwright build, canvas `fillStyle` then `getImageData`): `oklch(51.2% 0 120.05)` draws as **102,102,102** (`#666666`), not 103 (`#676767`). `#666666` on `#1b1b1b` is 2.9998 to 1. The pair the Studio calls "passes, 3.05" is drawn below 3 to 1.
  - Chromium also draws `oklch(28.3% 0 0)` as 41,42,42: the browser's own conversion is not the code's conversion, so "as written to the page" is a model of the page, not a measurement of it.
- **Why the existing sweep misses it:** `test/helpers.ts:remeasure` measures the `hex` tokens, which come from the same unrounded color as the measure. It never reads the CSS that the Mockup uses.
- **Scale:** 2 of 93,944 pairs in my sweep; 0 in the slider-end and import-range sweeps. Rare, but it is the same class as the original T2-01 blocker (2.994 for 3), and the record says the class is closed.
- **Fix:** measure the color that is emitted: either emit the quantized sRGB (for example `rgb()` or hex from the same rounded channels) in the stylesheet, or parse `toCss()` output back and measure that. Make the test read `css`, not `hex`. Narrow D37's wording to what is measured.

### T3-02 — major — "Fix for me" leaves "Main button label on its tint" below 4.5 to 1, and shows it as "4.5" while failing

- **Code:** `packages/core/src/tokens.ts:52-53` (`MARGIN = 1.012`), `:263` (repair by `ensureContrast`), `packages/core/src/color.ts:103-104` (`ensureContrast` returns early when the *unrounded* ratio already meets the target).
- **Evidence (reproduced):** sweep with every slider at one of its two ends (seed 4242): 5 of 2,500 designs; sweep with values at the ends of the import ranges (seed 99): 5 of 2,500. Example, design 79: dark page, text contrast 0.4, main color lightness 0.25 and vividness 0 (gray), "Two colors", "Pale tint" button. Under "Fix for me" the pair `soft-button-label` reports `ratio: 4.5, required: 4.5, passes: false`, issue outcome `warning` (before 3.94). Label `oklch(65.49% 0 360)` on fill `oklch(28.3% 0 360)`.
- **Cause:** the repair aims at 4.554 on unrounded colors. For dark colors, rounding to 8 bits costs more than 1.2 %, so the emitted ratio lands at about 4.497. On the next round `ensureContrast` sees the unrounded ratio already above target and returns the color unchanged, so the four rounds never move it again.
- **What is true:** the pair is reported as a warning, not hidden. But the comment in `test/tokens.test.ts:104` ("0 of 56,405 pairs") holds only for its one seed and slider grid. The shown figure "4.5" next to "needs 4.5" and a failing mark will confuse the owner.
- **Fix:** let the repair loop test the emitted measure and step past it (for example, repair to `required * MARGIN` measured on emitted colors, raising the target each round); show ratios that fail with a floor rounding (4.49), not to-nearest.

### T3-03 — major — The second color stops following the main color after "Put back" on its own Step (T2-02 only partly true)

- **Claim:** T2-02 "a second color follows the main color whether picked, kept, or given by a Direction".
- **Code:** `packages/core/src/engine.ts:237-241` (`revert` restores the base's *numbers*, then `rederive` with the acted Step being the color Step, `engine.ts:163`).
- **Evidence (reproduced):** `applyDirection(createProject(), 'sticker-pop')` matches "Two colors: a third of the wheel apart" (main 135, second 255). Pick main color "Deep red": main 18, second 138, still matches. Then `revert(…, 'color-strategy')`: main 18, second **255**, matching Option **none**. A later pick of another main color (258): second stays 255, matching Option none. The same happens after a hand-set second color is put back. The existing test "follows when a Step is put back" only puts back the *main color* Step.
- **Fix:** when a Step is put back and the starting design matched a following Option, restore the Option (recompute the second hue from the current main color), not the stored number. Add the case to the sweep (the sweep's random "put back" rarely lands here after a Direction with a following Option; only "Sticker Pop" has one).

### T3-04 — major — The S2-01 browser test passes when the Studio drops every kept copy but the newest two

- **Planted (E1):** in `apps/studio/src/platform.ts:176`, keep only `[new, ...kept.slice(0, 1)]`. The browser tests that touch kept copies (4 tests, filter "cop") all **passed**. The test "never replaces a copy it kept earlier: each new kept copy joins the others" (`apps/studio/e2e/studio.e2e.ts:407`) never makes a third copy.
- **Why it matters:** S2-01 was a blocker about silently destroyed copies; D36 promises "no upper limit". A regression that silently drops the third and older copies would ship green.
- **Fix:** make three or more copies in the test and check that every earlier one is still listed and downloadable.

### T3-05 — major — The plain-words checker can be broken without any test failing

- **Code:** `packages/core/src/catalog/words.ts:846-852`; tests `packages/core/test/catalog.test.ts:120-124`, `apps/studio/e2e/studio.e2e.ts:816-…`.
- **Planted, each survived (unit and, for U6/E4, browser):**
  - U6/E4: brackets stripped greedily (`/\(.*\)/g`): everything from the first "(" to the last ")" is ignored. 134 unit tests passed; the browser test "plain words on every screen" passed.
  - U7: the check made case-sensitive. All tests passed.
  - U13: the check ignores any trade word that follows a space (almost every use). All tests passed.
- **Cause:** no test feeds the checker a text that must fail. The tests only show that today's text yields an empty list, which a no-op checker also yields.
- **Fix:** add known-bad and known-good examples (bare word, word at sentence start, capitalized word, plural, hyphenated compound, word inside and outside brackets in one sentence).

### T3-06 — major — The rewritten link-color text states a wrong contrast floor

- **Text:** `packages/core/src/catalog/steps.ts:375` (Option "Golden yellow"): "The Studio darkens link text to 3 to 1 against the page, the least at which a link stands out; “Fix for me” … takes it to 4.5 to 1."
- **What is wrong:** the first half is true of the code (`tokens.ts:146`, `ensureContrastAll(accent, [bg, cardBg], 3 * MARGIN)`). But "the least at which a link stands out" is supported by no source line or research record I found, and it contradicts the Studio's own pair `link-on-page`, which requires 4.5 (`tokens.ts:200`), the WCAG 2.x figure for text. The 3 to 1 figure in WCAG concerns large text and non-text parts, and (in a technique, not a criterion) a link against the *surrounding text*, not against the page. The old text made no such claim ("darkens link text until it stands out from the page").
- **Fix:** say what is done and what is required: "The Studio darkens link text to at least 3 to 1 against the page. Text needs 4.5 to 1; “Warn me” reports the gap and “Fix for me” closes it."

### T3-07 — minor — The trade-word list misses words the shown text uses bare

- Shown text (checked by `shownTexts()` and on screen) that contains trade words outside brackets, which the list does not catch:
  - "accents" (`steps.ts:342`, Green-gray risk: "Fights with red or pink accents"): the list has "accent", and the pattern refuses a following letter, so every plural slips.
  - "radii" (`steps.ts:522`, "Large radii on small elements look bubbly").
  - "navigation" (`steps.ts:553`, glass: "The navigation bar stays in view"), although the menu Step's own text marks "navigation" as the designers' word, in brackets.
  - "themes" (`steps.ts:488`, `:554`, "especially on dark themes", "Dark themes"), although the theme Step marks "theme" as the trade word.
  - "typography" (`steps.ts:386` and the "No special touch" Option), "legibility" (`steps.ts:580`).
- Also: any hyphenated compound slips ("accent-colored"), and anything inside brackets passes whether or not it is explained.
- **Fix:** add the words and plural forms; match plurals by stem; add negative tests (T3-05).

### T3-08 — minor — The contrast Step's new text says a note appears when a pair falls short; under "Off" none does

- `steps.ts:445`: "When a pair of colors falls below that guideline, a contrast note under the large preview gives the measured figure." Under the "Off" profile `applyProfile` returns no issues (`tokens.ts:244`), and the App shows notes only when `large.issues.length > 0` (`apps/studio/src/App.tsx:479-492`). Inferred from code, not run in the browser.
- **Fix:** add "unless Contrast checks is Off".

### T3-09 — minor — Facts and caveats that the rewrite dropped or changed

From the sentence-by-sentence comparison of `abb828d` and `8609427`:
1. Atmosphere, button, headline, and line-thickness sources: "A research helper read the source files" became "A helper program read the source files for this Studio" (`steps.ts`, R09 source lines). The record was written by a research agent, not a program; the change appears made to satisfy the ban on the phrase "research helper", and it changes who did the reading.
2. Atmosphere teach (`steps.ts:470`): the old text reported an observation ("these backgrounds stay faint (grids at 5 to 20 percent…)"); the new text turns it into advice ("Keep it faint") and says "on the websites whose code was studied", but the sources are component sets (Once UI, Magic UI, Open Props), not websites.
3. Corners teach: "rounds a box one and a half times as much as the buttons inside it" drops the exception that the code makes for "Fully round" (boxes get 28 px, `tokens.ts:532`), and the small radius at one half.
4. Special touch teach (`steps.ts:645`): the old text said the rule comes from the owner's own checklist ("Your own checklist puts it this way"); the new text states it as the Studio's own advice. The attribution survives only in the source list.
5. Frosted glass "pairs with a glow or aurora background" became two named Options only; "Faint fade of color" (also a glow) is no longer named.
6. Motion teach: "Hover over the large preview to feel each Option" became "press “Play the entrance again” above the large preview". The button exists (`App.tsx:470`); I did not check that it sits above the preview.
No number was changed in the rewrite that I could find (65 characters, 5 to 20 percent, 60-30-10, 19 px, 2 px, 3/8/14 px, a third of a second, half a second all survive).

### T3-10 — minor — Exemplar descriptions that no research record supports

Checked against `docs/research/04`, `08`, `09`:
- "ray.so, Raycast’s open-source website" (`steps.ts:488`, and the "Pale tint" button): record 09 names ray.so only as an MIT source; no record says Raycast made it. (True to my knowledge, but unsupported by the records.)
- "Open Props, an open-source set of design values" (`steps.ts:495`) and "Once UI and Magic UI, two open-source sets of interface parts": the records list them as MIT sources but do not describe them.
- "coss ui, the design rules of Cal.com" (`steps.ts:579` and two button Options): supported by record 09 line 27 ("coss ui (the Cal.com design system)"); but record 09 line 88 says the files read came from `origin-space/originui`, because Cal.com's own repository is AGPL. Worth a note in the source line.
- Supported: "GitHub’s rules for its marketing pages, named Primer Brand" (record 08: "Marketing headings at light weights"); "GOV.UK … 19-pixel reading text" (record 08); "Radix Themes … three to five faint layers" (record 09).

### T3-11 — minor — Kept copies that this version cannot read are dropped, contrary to the comment

- `apps/studio/src/platform.ts:142` says content this version cannot interpret "is carried over". But when the stored value is an array, `readBackups` (`:159`) silently filters out every entry without a string `text`, and the next `keepBackup` (`:176`) rewrites the list without them. An array of entries in a later or different format would be destroyed by the next kept copy. Inferred from code, not reproduced.
- **Fix:** carry unreadable entries through unchanged, and show them as "a kept copy this version cannot read".

### T3-12 — minor — Two tested-looking guards are not tested

- Planted U8: removed `if (decisions[step.id]?.kind === 'tuned') continue;` (`engine.ts:160`). All 134 unit tests passed, including "never moves a second color that the owner set by hand" and the 300-sequence sweep: the test's hand-set value (200) never coincides with a following Option, so the guard is never exercised. A hand-set second color that lands exactly on "opposite" would start following without the guard.
- Planted U11: repair rounds cut from 4 to 1 (`tokens.ts:253`). All tests passed. Either the extra rounds are never needed in the tested designs, or no test reaches a design that needs them.

### T3-13 — minor — Records that drift from the repository

- `redteam/FINDINGS.md:168`: U2-03 still reads "Open. Planned with the M5 Catalog review", but commit `8609427` is titled "(finding U2-03, decision D38)" and rewrote the Catalog text. One of the two is wrong.
- `WAYPOINTS.md` W5 names commit `0aa239d` but cites "CI run 29 passed on `9ae7892`", a commit before both fix commits; "see the CI run for this commit" is not evidence. I could not check CI from here.

### T3-14 — note — D36: with no upper limit, a full browser store blocks ordinary saving too

D36 says "If storage fills, keeping fails openly and the Studio says so." Every kept copy is a whole project; the list never shrinks unless the owner removes copies. Once the store is full, the main save (a different key in the same store) fails as well, not only the keeping. Inferred, not reproduced.

### T3-15 — note — The middle of a two-color headline is not measured

T2-03 says "both ends". I measured the midpoint of the gradient in sRGB for 7,500 designs: 3 dark designs fall to 2.70 to 2.83. Browsers interpolate `oklch()` stops in Oklab by default, where the midpoint keeps the ends' lightness, so these are probably not real failures. Not reproduced in a browser.

---

## Planted defects

Each was planted alone, the named tests run, then the file restored (byte-identical; `git status` clean at the end).

| ID | File and change | Tests run | Caught? |
|---|---|---|---|
| U1 | `engine.ts:163` `rederive`: use the after-change match for every Step | unit | Yes (3 tests) |
| U2 | `color.ts:180` `quantize`: no rounding to 256 steps | unit | Yes (T2-01 sweep) |
| U3 | `tokens.ts:53` `MARGIN = 1.0` | unit | Yes (5 tests) |
| U4 | `tokens.ts:450` headline fill measured against the page, not the first screen | unit | Yes (T2-03 test) |
| U5 | `tokens.ts:455` fade repaired only to 2.5 | unit | Yes (T2-03 test) |
| **U6** | `words.ts:850` brackets stripped greedily | unit | **No** |
| **U7** | `words.ts:851` check made case-sensitive | unit | **No** |
| **U8** | `engine.ts:160` tuned guard removed | unit | **No** |
| U9 | `tokens.ts:464` second end of the gradient not repaired | unit | Yes (T2-03 test) |
| **U11** | `tokens.ts:253` one repair round instead of four | unit | **No** |
| U12 | `tokens.ts:233` `measure` ignores opacity | unit | Yes (2 tests) |
| **U13** | `words.ts:851` lookbehind also refuses a preceding space | unit | **No** |
| **E1** | `platform.ts:176` `keepBackup` keeps only the newest two copies | browser, 4 tests on kept copies | **No** |
| E2 | `store.ts:143` `changedOnOpening` always false | browser | Yes (S2-02 test) |
| E3 | `platform.ts:161` `readBackups` drops a legacy single copy | browser | Yes (S2-01 test) |
| **E4** | `words.ts:850` brackets stripped greedily | browser, "plain words" | **No** |

Two further plants (U10 and an earlier U7 spelling) did not apply to the file and are not counted.

## Verified as true

- `npm run check`: exit 0; 134 unit tests. `npm run e2e`: exit 0; 102 browser tests (38 Studio, 64 visual). PROGRESS.md's counts match.
- T2-03: under "Fix for me", both stops of every headline fill measured from the CSS hold 3 to 1 against the first screen in 7,500 random, slider-end, and import-range designs (0 failures).
- T2-02: following holds when picked, kept, or given by a Direction, through a main-color pick and a main-color slider; a kept Decision is updated to the new value; a hand-set second color (200) does not move when the main color changes or is put back.
- T2-01 sweep catches removed rounding (U2), removed margin (U3), and ignored opacity (U12).
- S2-02 test catches a disabled "changed on opening" check (E2); S2-01 test catches a lost legacy copy (E3).
- The dark-page shadow claim is true: dark shadows use opacities several times the light ones (`tokens.ts:331`).
- Every Option stops moving under "reduce motion" (`templates/smallBusiness.ts:410`); the "Play the entrance again" button exists (`App.tsx:470`).
- `fe190dd` changes `platform.ts`, `store.ts`, `color.ts`, `tokens.ts` (S2-01, S2-02, U2-01, T2-01); `0aa239d` changes `engine.ts`, `tokens.ts`, `store.ts`, `App.tsx` and adds engine and token tests (T2-02, T2-03, U2-05, U2-07).
- W5's "7 of 12 major findings fixed or corrected" matches the rows.
- Record 08 supports "Primer Brand" as GitHub's marketing rules and GOV.UK's 19 px reading text; record 09 supports "coss ui (the Cal.com design system)".

## Not done

- S2-04 ("Keep this tab's copy"): not attacked; the record already says it has no test.
- U2-01, U2-04, U2-05, U2-07: checked only by the passing browser tests, not attacked with my own sequences.
- Firefox and Safari conversion of `oklch()` (T3-01 was checked in Chromium only, by canvas, not by a screenshot of the Mockup).
- DECISIONS D34 and D35 were read but not checked against CI.
