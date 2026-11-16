# Seventh red-team round, 2026-11-16: test auditor (faults planted by hand)

The report of one helper agent, as it sent it (decision D68). The helper planted faults in its own copy of the repository and noted whether a test failed. It stopped early at the builder's request, because its test runs loaded the machine; its counts include 9 faults that it marks unverified. The text is the helper's, unedited; the builder's answers stand in `redteam/FINDINGS.md` (rows Q7-nn). It was extracted from the helper's session record.

---

## Q7 report: hand-run mutation test of the Fit check, the core and the Undo wording

Stopped early at your request. Every planted fault is undone. `git status --short` in my copy is clean (I removed the `node_modules` symlink and restored `apps/studio/src/store.ts`, which was mid-mutation when I stopped). All my mut.py, vitest and Chromium processes are stopped.

**Counts: 111 planted. 46 caught, 56 not caught, 9 unverified.**

| Area | Planted | Caught | Not caught | Unverified |
|---|---|---|---|---|
| Fit check (`plugin/fit/src`, browser tests in `fit.e2e.ts` only) | 56 | 14 | 42 | 0 |
| Core (`packages/core`) | 47 | 32 | 6 | 9 |
| Studio `undoWords` | 8 | 0 | 8 | 0 |

Care points:
- **Method.** I changed one thing per fault with a script (mut.py in the scratchpad) and restored the file after each run. The Fit runs used three copies in the scratchpad. Core and Studio ran in my worktree.
- **Load.** The machine was at load 20–30 from other agents, so the three tests named below timed out under load. That makes any "caught" result with only one of them failing suspect. I counted a result as caught only when a test that matches the fault failed.
- **Unverified core faults (9).** Q7-55, 56, 75, 76, 78, 79, 83, 85 and 88 failed only through `project-file.test.ts` "brings a design value that no slider and no Option can set into reach…" or two other timeout-prone tests. These are "chooses an Option with an overused-look warning rarely…" and "never offers a generated Direction…". They also failed on unrelated faults. My re-run in another copy broke for an environment reason (catalog tests failed there on any fault), so I discarded it. Treat these 9 as unknown.
- **Not run.** `trial.e2e.ts` was never run. Some "not caught" Fit faults may be caught by its byte-for-byte receipt test, most likely Q7-07, 19, 35, 36, B03, B04 and B08. I did not check.
- **Studio caveat.** All 8 Studio faults passed (the 6 tests that ran passed, 148 skipped). `npm run build:page` returned 0 each time, each run took 22–27 s, and I did not open the bundle to confirm that it carried each fault.

### Faults not caught: Fit check (`fit.e2e.ts` passed, 22 of 22)

| ID | Severity | Fault | Test to add |
|---|---|---|---|
| Q7-01 | major | fit.ts: contrast `needed` 4.5 changed to 3 | A text at 3.5 to 1 must appear in the contrast lines, and one at 4.6 must not. |
| Q7-02 | minor | fit.ts: large-text weight 700 changed to 100 | A 19px text at weight 400 and one at 700, at about 3.5 to 1. |
| Q7-05 | minor | fit.ts: `isOtherSite` lost its `/i` flag | A page with `HTTPS://x.example/a.css` must be a deviation. |
| Q7-06 | major | fit.ts: content check made case-sensitive (no `.toLowerCase()`) | Change the case of the headline in the build and expect 0 deviations. |
| Q7-07 | minor | fit.ts: `WIDTHS` swapped to 1280, 375 | Assert `receipt.widths` equals `[375,1280]` and the "375 and 1280" line in the receipt. |
| Q7-12 | major | prescription.ts: `mockup.html` left out of the fingerprint check | A fingerprint mismatch in the mockup meta tag must refuse. |
| Q7-13 | major | prescription.ts: `PRESCRIPTION.md` left out of the fingerprint check | A fingerprint mismatch in PRESCRIPTION.md must refuse. |
| Q7-15 | major | receipt.ts: "Not shipped" information fence fixed at 3 backticks | A hostile page that names a reference containing a run of backticks. |
| Q7-16 | major | receipt.ts: page-errors fence fixed at 3 backticks | A page that throws an error whose message holds backticks. |
| Q7-19 | minor | fit.ts: `stillNeedsPerson` emptied | Assert at least the six lines, or assert the section is not empty. |
| Q7-20 | major | color.ts: green coefficient 0.7152 changed to 0.70 | A unit test of `contrastRatio` on known pairs (black on white is 21, `#777` on white is 4.48). |
| Q7-21 | minor | color.ts: sRGB constant 0.04045 changed to 0.03928 | Same unit test. |
| Q7-23 | minor | prescription.ts: rem times 16 changed to times 10 | A Prescription with a radius in rem. |
| Q7-25 | minor | collect.ts: `srcset` ignored | A page with a remote `srcset`. |
| Q7-27 | minor | collect.ts: `visibility` check removed | A hidden element with an off-palette color must not count. |
| Q7-28 | minor | collect.ts: opacity "not measurable" rule removed | A text under `opacity:.5` must count as "not measured". |
| Q7-29 | minor | collect.ts: gradient "not measurable" rule removed | A text on a gradient must count as "not measured". |
| Q7-30 | minor | collect.ts: `scrollWidth` reduced by 40 | A page wider by only 5px. |
| Q7-31 | major | collect.ts: `.btn-primary` selector broken, so the primary action is never required | Remove the primary button text from the build and expect a content deviation. Also remove the business name. |
| Q7-32 | major | collect.ts: `.brand` selector broken, so the business name is never required | Same test for the business name. |
| Q7-35 | minor | fit.ts: sha256 taken of an empty string | Assert `receipt.build.sha256` against `crypto` on the build. |
| Q7-36 | minor | fit.ts: `bytes` is character count, not byte count | Same, with a build that holds a non-ASCII character. |
| Q7-37 | major | fit.ts: only the headline is required (business name and primary action skipped) | Same tests as Q7-31 and Q7-32. |
| Q7-38 | minor | fit.ts: translucent colors no longer counted in the note | Assert the "partly transparent … not compared" note. |
| Q7-39 | minor | fit.ts: page errors no longer deduplicated | Two identical errors must give one line. |
| Q7-B01 | major | fit.ts: `requests.push` removed from the route handler | Mockup CSP likely hides requests from the route; a test with the CSP stripped and a remote `<img>`. |
| Q7-B03 | minor | fit.ts: grouped count uses min, not max, over widths | An element that exists only at 1280. |
| Q7-B04 | minor | fit.ts: deviations not sorted | Two deviations in reverse order must list sorted. |
| Q7-B05 | minor | fit.ts: whitespace-only build no longer refused as empty | `refuse(inputOf(files, '   '), /empty/)`. |
| Q7-B06 | minor | prescription.ts: invalid `tokens.json` throws `SyntaxError`, not `FitError` | `refuse` with invalid JSON in `tokens.json`. |
| Q7-B07 | minor | fit.ts: page-error list cut at 1, not 5 | Throw 6 distinct errors. |
| Q7-B08 | minor | fit.ts: `more` count forced to 0 | A page with 21 deviations expects "1 more deviation is not listed". |
| Q7-B09 | minor | receipt.ts: "Windows that did not load" lines dropped from the markdown | In the never-finishes test, assert the markdown. |
| Q7-B10 | minor | cli.ts: argument count check weakened | Run the CLI with 4 arguments and expect status 2. |
| Q7-B12 | minor | fit.ts: contrast lines sorted by ratio descending | Two bad texts, and assert the worst comes first. |
| Q7-B13 | major | fit.ts: content looks only at the first window's text | Text that is present only at 1280. |
| Q7-B14 | major | fit.ts: width measured only at 375 | A page that overflows only at 1280. |
| Q7-B15 | minor | collect.ts: `visibility` check disabled | Same as Q7-27. |
| Q7-B16 | minor | collect.ts: `style="…url(…)"` attributes not read | `style="background:url(https://x/y.png)"`. |
| Q7-B19 | minor | fit.ts: alpha 0 colors not skipped | Probably equivalent, because `collect` already filters alpha 0. |
| Q7-B20 | major | fit.ts: text with alpha not blended over its background | `rgba(0,0,0,.3)` text on white. |
| Q7-B21 | major | fit.ts: translucent background layers not blended | A semi-transparent band behind text. |

Caught Fit faults (14):
- Q7-04: `//` removed from `isOtherSite`.
- Q7-08: status always 0.
- Q7-09: status ignores `loadFailures`.
- Q7-10: `ownAddress` deduplication broken (random suffix).
- Q7-11: `distinct.size > 1` changed to `> 5`.
- Q7-17: fence length `longest+1` changed to `longest`.
- Q7-18: width measure dropped.
- Q7-24: radius 0px not exempt.
- Q7-26: `data:` not exempt.
- Q7-33: `LISTED` 20 changed to 1.
- Q7-34: `INFORMATION_LISTED` 50 changed to 1.
- Q7-B02: true array in place of the `ownAddress` set.
- Q7-B11: contrast comparison changed to `<= 0`.
- Q7-B17: `form action` not read.

### Core (`npx vitest run packages/core`)

Not caught (6):

| ID | Severity | Fault | Test to add |
|---|---|---|---|
| Q7-53 | minor | zip.ts: CRC in the local file header dropped (the central header CRC is checked) | Read the local-header CRC in `zip.test.ts`. |
| Q7-84 | minor | brief.ts: `removeContentItem` lost its `index < 0` check | `removeContentItem(project,'services',-1)` must return the same project. |
| Q7-89 | minor | text.ts: U+061C (Arabic letter mark) no longer stripped | Add a case for each invisible sign. |
| Q7-96 | major | text.ts: `visibleText` no longer replaces half characters | A lone surrogate through `visibleText` and `quoted`. |
| Q7-97 | minor | text.ts: tab and LF removed from the control range | A tab in a quoted reason. |
| Q7-98 | major | text.ts: `plainName` no longer replaces half characters | A lone surrogate in a name. |

Caught (32):
- zip: Q7-51 (CRC constant), 52 (date), 54 (central CRC), 58, 59.
- tokens and prescription: Q7-60–74. These cover fingerprint, alpha, fences, FNV constants, unquoted name/reason/answers/startName, rem, rounding, keywords, spacing step, and `quoted` skipping `visibleText`.
- brief: Q7-77, 80, 81, 82.
- text: Q7-86, 87, 90, 91, 92, 93, 94, 95.

Unverified (9): Q7-55 (surrogate to U+FFFD dropped), 56 (local UTF-8 flag zero), 75 (headline limit 121), 76 (BRIEF_MAX 301), 78 (facts value limit 13), 79 (NAV_WORD_MAX 25), 83 (`setNavWord` bound `>` not `>=`), 85 (emphasis check case-insensitive), 88 (U+202F no longer stripped).

### Studio `undoWords` ('three repairs of taste', 6 tests): 0 of 8 caught

These are all major gaps, because the block checks one case of a multi-branch function. Add the test named in the last column.

| ID | Fault | Test to add |
|---|---|---|
| Q7-S01 | whole-project threshold: more than 3 Steps changed to more than 4 | A change that touches 4 Steps. |
| Q7-S02 | slider-only change (`ownedValues` comparison) dropped | Undo a slider change and expect the Step named. |
| Q7-S03 | `whole` ignores a Direction change | Exact text after a Direction change, with at most 3 Steps touched. |
| Q7-S04 | name-change preview shows the raw name | Rename, with a name containing quotation marks and invisible signs. |
| Q7-S05 | Contrast checks preview text changed | Toggle the setting, then check preview and notice. |
| Q7-S06 | Overlays notice replaced by "your earlier project is back" | Toggle an Overlay. |
| Q7-S07 | one-Step versus several-Steps branch (`=== 1` changed to `>= 1`) | A change that touches 2 or 3 Steps. |
| Q7-S08 | single-Step notice reworded ("restored") | After Undo, assert the text "Undone: the Step “…” is back to how it was." |

Not run: Q7-S09 (Go to link always offered), S10 ("the plain start" wording), S11 ("Nothing to undo."), S12 (Skin naming), S14 (list joiner "and"), S15 (Go to action removed), S16 (whole-project notice without the start name), S17 (preview wording).

### Not run (cut for time)

- **Fit batch 1.** Q7-41 to Q7-49: two-sided border/text color exemption, radius check skipped, reduced motion, route `continue()`, alpha in the Prescription colors, a css import exemption, and the non-HTML regex.
- **Fit batch 2.** Q7-B22 (the `parseRgba` finite check).
- **Studio.** The 8 `undoWords` faults listed under "Not run" above.
- **Trial tests.** `trial.e2e.ts` as a second net for the surviving Fit faults.

### Vacuous or weak tests

- `plugin/fit/e2e/fit.e2e.ts:33`: `replaceOnce` says each text must stand "exactly once" but asserts `>= 1`.
- `fit.e2e.ts:118`: three of the four regex alternatives (`1.00:1`, `1:1`, `ratio 1.0`) can never match the real format "1.00 to 1". The test passes on the first one only.
- `fit.e2e.ts:233`: `toBeLessThanOrEqual(3)` is looser than the title "lists the same reference once". Line 234 (uniqueness) is what actually caught Q7-10 and Q7-B02.
- `fit.e2e.ts:189` ("byte-for-byte the same receipt"): it only compares two runs. It never checks `build.bytes`, `build.sha256`, widths or the "375 and 1280" text, so Q7-07, 35 and 36 pass.
- `fit.e2e.ts:89–100` ("remote font link added" and "remote script added"): their requests are found only through the page's own references. Dropping the request recording (Q7-B01) still passes, because the Mockup's CSP probably stops the request before the route sees it. I inferred this and did not verify it. Nothing tests "Nothing leaves the machine."
- `fit.e2e.ts:142`: "an empty build" is tested with `''` only, so the `.trim()` is untested (Q7-B05).
- `fit.e2e.ts:102–106` ("the headline removed"): only the headline is damaged, so the business name and the primary action are never tested (Q7-31, 32, 37). The "primary action" check cannot fail even if its selector is wrong.
- `fit.e2e.ts:132–145` (refusals): no test for invalid JSON, and no test of a fingerprint mismatch in `PRESCRIPTION.md` or `mockup.html` (the title says "two files carry different fingerprints", but only `tokens.css` is tested).
- `plugin/fit/e2e/trial.e2e.ts:318–323`: "says in the record what the run shows" only checks that fixed phrases appear. `trial.e2e.ts:329–331` uses `split('---\n')[1] ?? ''`. The `?? ''` would make the check always true if the separator were missing. Today the file has one `---` at line 5, so it works.
- `apps/studio/e2e/studio.e2e.ts` 'three repairs of taste':
  - Line 3753: "…for a Step that has a Decision, and for no other" checks only one other Step (`hero`).
  - "names the whole project…" uses `if (await confirm.count()) await confirm.click()`, and `/started from .+\./` accepts any start name.
  - No test covers Steps changed by a slider, 2–4 Steps, the name branch, the Contrast checks branch, the Overlays branch, the "Go to" action, Skin naming or an own-Direction name.
  - The notice after Undo for a single Step is never asserted.
