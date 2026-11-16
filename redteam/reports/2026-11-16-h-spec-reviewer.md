# Seventh red-team round, 2026-11-16: Reviewer helper: code against SPEC.md (features F024 to F028)

The report of one helper agent, as it sent it (decision D68). The helper had the code and the running app (HEAD `eb88528`), not the builder's conclusions. The text is the helper's, unedited; its claims are the helper's, and the builder's answers stand in `redteam/FINDINGS.md` (rows V7-nn). The report was extracted from the helper's session record, because a helper cannot save a file here.

---

Review of F024 to F028 against SPEC 2.10 to 2.14. I read the code and tests only and ran nothing, so every "met" below is read only. I found no blocker. I found one major gap and eight minor or note-level gaps.

## Gaps

| ID | Severity | Requirement | Gap | Evidence |
|---|---|---|---|---|
| V7-01 | major | 2.10 point 2 (every text, background and border color is compared). Edge case: "not measured" is never "no deviation". | A computed color that `parseRgba` cannot read is dropped without a trace. Chrome keeps `oklch()`, `lab()`, `color()` and `color-mix(in oklab, …)` values in computed style as written, and `parseRgba` accepts only `rgb()` and `rgba()`. A page that draws `background: oklch(0.5 0.2 30)` gets no deviation and no "not measured" count in the colors measure. The contrast measure does count such a color ("a color could not be read"). The colors measure has no equivalent. No test uses such a color. | `plugin/fit/src/fit.ts:131-132` (`if (!rgba \|\| rgba.a === 0) continue;`), `plugin/fit/src/color.ts:12-14`, `plugin/fit/src/collect.ts:42-47` (`alphaOf` returns 1 for an unreadable color, so it is pushed to `drawn` and then skipped) |
| V7-02 | minor | 2.10 point 2: "a partly transparent color is listed apart". | The program collects the transparent values in `translucent` but uses only `translucent.size` in the note ("1 partly transparent color was not compared"). It never names them, so they are counted but not listed. | `plugin/fit/src/fit.ts:127,133,170`; `plugin/fit/trials/001/RECEIPT.md:23` |
| V7-03 | minor | 2.13 "Neither (left out): a `data:` address". | The `data:` check is case-sensitive. `src="DATA:image/png;base64,…"` passes `outside()`, then `isOtherSite` matches it by its scheme and reports it as a deviation in requests. The browser makes no request for it. | `plugin/fit/src/collect.ts:53`; `plugin/fit/src/fit.ts:83-86` |
| V7-04 | minor | 2.10 point 1 / 2.13: every address the page names. Edge case: "a request that never completes". | `holders` omits `formaction` on `<button>` and `<input>`, `poster`, `<a ping>`, `<meta http-equiv=refresh>` and SVG `<image href>` / `<use href>`. A `formaction="https://other.example/x"` or `formaction="/x"` makes no request (a form is not submitted), so the page's reference to another site goes unreported. SPEC 2.10 and 2.13 name only `form action`. Separately, no test covers the SPEC edge case of a request that never completes. | `plugin/fit/src/collect.ts:55`; `plugin/fit/e2e/fit.e2e.ts` (no such test) |
| V7-05 | minor | 2.13 edge case: "The same reference stated twice appears once". | The information set is keyed `kind: value`, so one `/same.css` stated as `link href`, `css url` and `css import` is listed up to three times. The test accepts up to three lines (`<= 3`), so it catches a broken dedup within one kind only. | `plugin/fit/src/fit.ts:123`; `plugin/fit/e2e/fit.e2e.ts:233` |
| V7-06 | minor | 2.13 edge case (the records "say what changed and why; the old counts stay as history"). Also 2.11 and 2.12: the records state what the runs do not show. | Two statements in `plugin/fit/trials/001/RECORD.md` contradict the present repo and are not corrected. (1) Line 42 says "The builder has changed neither", but the Update paragraph says the builder repaired the measure. (2) Line 37 says "No run without the Prescription was made", but trial 002 is that run. The Update note covers only the "three deviations" wording. No test checks that a record carries the update (F027 step 3), so a missing update would still pass. | `plugin/fit/trials/001/RECORD.md:11-13,37,42`; `plugin/fit/e2e/trial.e2e.ts:53-58` (checks only fixed phrases) |
| V7-07 | minor | 2.14 point 3: "or the whole project goes back…", the fallback case. | `undoWords` falls through to the "whole project … started from X" message whenever it detects no difference, not only when the Direction changed or more than three Steps are touched. Example: type a reason, then delete it within the burst window. The history top equals the current project, and the line claims the whole project goes back. Likewise for a change in a field the function does not compare, such as the Skin when no Step value differs. | `apps/studio/src/store.ts:163-172` |
| V7-08 | minor | 2.14 "How to test it end to end", edge. | Test gaps in 'three repairs of taste'. (a) The edge test reads only `.btn.quiet` elements on the Summary. The F028 step names "Rename" and "Remove", which live in the own-Directions list and are not on the Summary in the tested project, so their edges are never measured. (b) The hover rule (edge takes the text color) is not tested. (c) The plural line ("the Steps “X” and “Y” go back to how they were"), the name, Contrast-checks and Overlays lines, and their past-tense messages have no test. (d) The Undo-of-a-typed-reason test uses `fill` (a single change), so the "one Undo step for a run of typing" claim is not exercised with real key presses. (e) The 280-character limit on the Summary field is untested, though the source has `maxLength={280}`. | `apps/studio/e2e/studio.e2e.ts:3796-3818` (quiet-button edge test), `3756-3781` (typed-reason Undo test), `3820-3852` (Undo line tests) |
| V7-09 | note | 2.10 point 6 (Content). | `wanted !== ''` means an empty Brief text in the Mockup (no `.brand`, `h1` or `.btn-primary`) passes silently. Text is also searched across both widths joined, so a text visible at only one width passes. Neither case is stated in the receipt note. | `plugin/fit/src/fit.ts:161-165` |
| V7-10 | note | 2.10 edge case ("the program refuses… writes no receipt"). | The command-line test covers a missing build file only. The empty-build, not-HTML, missing-file and two-fingerprint refusals are tested through `fit()` and not through the command line, so the "status 2, no receipt written" path for those inputs is read only. In the code, `fit()` throws before `cli.ts` writes anything, so it should hold. | `plugin/fit/e2e/fit.e2e.ts:132-145,256-264`; `plugin/fit/src/cli.ts:33-36` |

## Requirements I found met

I confirmed these by reading only.

2.10:
- The command takes three arguments, and `cli.ts` writes `receipt.json` and `RECEIPT.md`.
- The page opens at 375 and 1280 pixels (`fit.ts:32,47-48`).
- Requests: every browser request is stopped and counted (`fit.ts:54-57,120`). Test: `fit.e2e.ts:89-100`.
- Typefaces: the first family is compared.
- Radii: 0 is allowed, and a value outside the set is listed.
- Contrast uses the WCAG 2.x formula with the program's own color math. A text on an image, a gradient or partly transparent is counted as "not measured", and it never changes the status (`fit.ts:216`; test `fit.e2e.ts:114-120`).
- Content, width, the three-part Honest receipt with an empty "Judged by the model", and the fingerprint.
- Page text appears only inside a fence longer than any backtick run in it (`receipt.ts:45-48,62-71`). Test: `fit.e2e.ts:165-187`.
- Page errors are recorded and the measurements still run (test `fit.e2e.ts:155-163`).
- A page that never loads marks both widths "not measured" and ends with status 1 (test `fit.e2e.ts:147-153`).
- A missing file, two fingerprints, an empty build and a build that is not HTML are refused with a message that names the file or cause (`prescription.ts:44-58`; `fit.ts:195-196`).
- The receipt has no date, and two runs match byte for byte (test `fit.e2e.ts:189-199`).
- The status rules, with 0 or 1 from `fit()` and 2 from the command line, as stated in `fit.ts:215-216` and `cli.ts:42-48`.
- The reference build gives zero deviations on the plain start plus all 38 Directions (39 projects), and the test also requires that no information is listed (`fit.e2e.ts:38-51`).
- All eight damages are tested.

2.11:
- Both trial folders hold the instruction, page, receipt in two forms and record.
- The stored files equal what the builder writes today, letter for letter.
- The receipt names the fingerprint.
- The stored page measures to the stored receipt, byte for byte (`trial.e2e.ts:33-51`).
- The record says one run, not a rate, and that the helper cannot be held to the rule.

2.12:
- Trial 002's instruction carries all six Options, the reason and the sample content.
- Its instruction names none of the seven files.
- The record table matches both receipts for all seven measures. I checked the counts by hand: 0/0, 0/12, 0/2, 0/0, 0/2, 0/0, 0/0. The test checks the table against the receipts (`trial.e2e.ts:76-87`).
- The record says the comparison does not show which page looks better.

2.13:
- A reference without a scheme is information, listed with its kind under "Not shipped with the page", and it never changes the status (`fit.ts:121-125`; `receipt.ts:67-72`).
- An absolute address, `//host` and `mailto:` are deviations.
- The tests cover a relative font file, a root-relative style sheet, a form action, and the three deviation kinds (`fit.e2e.ts:207-237`).
- A reference inside a style sheet and one in markup are treated alike.
- The Mockup shows an empty list.
- Both stored receipts are re-measured with the repaired program and checked byte for byte.
- The old counts stay as history in both records.

2.14 point 1:
- `ReasonField` is rendered only for a Step with a Decision (`App.tsx:1441`).
- The summary line reads "Add a reason" or "Change the reason".
- The field id is `decision-reason-<step>` and `maxLength` is 280.
- A typed letter is stored at once through `setReason`, and a run of typing in one field is one Undo step through the `reason:<step>` burst key (`store.ts:1004,570`).
- The `useEffect` resets the field to the stored text after an Undo or an opened file (`App.tsx:578-580`).
- The "Why:" line follows (`App.tsx:1437`).
- A reason typed on the Summary is the same reason as on the Step (test `studio.e2e.ts:3783-3794`).
- No id is repeated (test `studio.e2e.ts:3769-3771`).

2.14 point 2:
- `.btn.quiet` keeps the `.btn` edge (`--border-strong`) and only the fill is removed (`app.css:58-66`).
- The hover edge takes the text color (`app.css:71,73`).
- By my own contrast arithmetic on the CSS values, the edge is at least 3 to 1 in both themes: about 3.2 to 1 in light and about 4 to 1 in dark. The test measures this on the Summary's quiet buttons in both themes.

2.14 point 3:
- Beside Undo, the line is always shown ("Nothing to undo." when empty).
- `aria-describedby="undo-says"` ties the line to the button, and the button's name stays "Undo" (`App.tsx:200-204`).
- The wording for one Step, several Steps, the whole project, the name, Contrast checks, Overlays, the texts of the page and the three answers matches the SPEC (`store.ts:158-172`).
- The past-tense "Undone:" messages exist for the texts and the answers, and "your earlier project is back" is kept only for the whole project (`store.ts:164-172`).
- The line re-renders on each change and Undo because the component reads the whole store.
- Tests: `studio.e2e.ts:3820-3866`.

## What I could not confirm

- The e2e and unit runs.
- That `worked()` gives a project with Decisions for the Steps the test names.
- That the other "Undone: …" messages are word for word as before.
- The text of the findings log.
