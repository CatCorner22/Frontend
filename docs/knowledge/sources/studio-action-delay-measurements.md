# Measurements: how long each kind of action in the Studio takes until its result is drawn

- **Source**: the builder's own measurements of 2026-11-14 in this repository's test browser (Chromium, as driven by Playwright 1.63.0, on Linux, 4 processors, nothing else running). The two scripts are not in the repository; they sat in the session's scratch folder (`perf-latency.cjs`, `perf-probe.cjs`).
- **Type**: data
- **Author/Origin**: the builder (the AI assistant that wrote the Studio)
- **Published**: not published
- **Ingested**: 2026-11-14
- **Tags**: measurement, speed, test-method

## Summary

The builder timed every kind of action in the Studio at commit `6cbd764` and again at `8b263b7`, with two of the browser's own records: "event timing" (from the key press or click until the browser has drawn the result) and "long task" (a stretch of work longer than 50 milliseconds, during which the page answers nothing). One action was slow, a change of the preview width; one change to the Studio cut its delay to a third. It matters because it shows where the Studio is fast enough and where work remains.

## Key concepts

- **Method.** A window of 1440 by 900 pixels, a project started from "Midnight Aurora". Each action 3 to 12 times; the median is stated, and the worst in brackets. The figures come in steps of 8 milliseconds, because the browser rounds them.
- **The one slow action.** "Phone", "Tablet", or "Desktop" above the large preview: drawn after 152 ms (worst 176) before the change, with one long task of 82 to 120 ms each time. Cause: the large preview and up to 14 card pictures each laid their page out again in one go.
- **The change.** The pressed button and the large preview answer first; the card pictures follow at lower priority (React's deferred value). After: drawn after 48 ms (worst 64). The long task for the card pictures remains (80 to 113 ms); it now follows the answer.
- **Everything else, after the change.** Next Step with Enter: 48 ms (64). Click on a card: 32 (32). Digit key: 24 (32). One slider step: 32 (56). One typed letter in the project name: under 16 (32). Undo: 32 (32). Pick the card on show and go on: 72 (88). Open the Summary: 40 (56). Long tasks: one of 68 ms in 12 Step changes, one of 56 ms in 3 picks; none elsewhere.
- **First opening.** First content drawn after 144 to 288 ms; two or three long tasks of 50 to 122 ms; 18 preview frames holding 2,091 KB of preview documents.
- **Memory.** After 2 walks through all Steps and after 6 walks: 10.3 and 10.4 megabytes of script memory, 5,280 page nodes both times, 425 listeners both times. No growth.

## Notable quotes and data

- Main-thread work for one slider step, same method as the earlier record: 63, 54, 62 ms (earlier record after its changes: 57, 58, 52).
- Arriving at a Step costs about 110 ms of work in the median and 272 ms at most (the Step "Main color", 14 cards), spread over many short tasks.

## Relationships

- Agrees with: `slider-step-cost-measurements.md` (a slider step stays above 50 ms of work; here it is shown that the result is nevertheless drawn after about 32 ms and that no single stretch exceeds 50 ms).
- Contradicts: none noted.

## Raw notes (optional)

The builder knows a published guideline that calls a delay of up to 200 ms from action to drawn result "good"; the builder quotes it from memory and could not re-read it on 2026-11-14, because the session's network does not allow the site.
