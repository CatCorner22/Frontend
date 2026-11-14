# Measurements: what one slider step costs on the Step "Main color", before and after three changes

- **Source**: the builder's own measurements of 2026-11-13 in this repository's test browser (Chromium, as driven by Playwright 1.63.0, on Linux), and the measurements of one reviewer in the code review of the same day (`redteam/reports/2026-11-13-d-code-review.json`, area "screen", finding 0). The measuring script is reproduced in "Raw notes".
- **Type**: data
- **Author/Origin**: the builder (the AI assistant that wrote the Studio) and one AI reviewer
- **Published**: not published
- **Ingested**: 2026-11-13
- **Tags**: measurement, speed, test-method

## Summary

A reviewer measured that one step of a slider on the Step "Main color" (14 cards) cost 61 to 92 milliseconds of work on the browser's main thread, more than the 33 milliseconds between the repeats of a held key, so the preview ran behind the hand. This record holds the builder's own before-and-after figures for the three changes made in answer, and says plainly that the result is still above 50 milliseconds. It matters because it tells a later session where the remaining cost sits, and that the cheap gains are taken.

## Key concepts

- **What was changed.** (1) The Studio remembers Mockup documents that it built already, so the 13 cards that a slider step does not change are not built again. (2) The color chips of the cards reuse the colors that the Mockup worked out. (3) The preview pictures update at lower priority (React's `useDeferredValue`), so the knob and its number move first.
- **What was measured.** The browser's own counter "TaskDuration" (all work on the main thread), read before and after ten presses of the Right key on the "Hue" slider, with a quarter of a second between presses, after three warm-up presses. Three runs for each build.
- **Result.** Before: 71, 73, and 65 milliseconds per step in one session of measuring; 77, 70, and 71 in another. After the first change alone: 64, 64, 58. After all three: 57, 58, 52. So the cost fell by roughly a quarter, and it is still above 50 milliseconds.
- **Where the rest sits (the builder's reading, not measured part by part).** Each step must re-create two preview documents: the large preview and the card "Your design now". Each document carries its two fonts inside it (68,000 to 100,000 characters), because a locked frame may load nothing from outside. That work is necessary as long as previews are locked frames that hold their own fonts.
- **What a second reviewer refuted.** Two related claims did not hold up as defects on their own: that every card's document makes a slider step slow (only the cards that change are re-created), and that the repeated color math is felt (about 10 to 15 milliseconds).

## Notable quotes and data

| Build | Milliseconds of main-thread work per slider step (three runs) |
|---|---|
| Commit `dbddf15` (before) | 71, 73, 65 and, in a second session, 77, 70, 71 |
| With the memory of built documents only | 64, 64, 58 |
| With all three changes | 57, 58, 52 |

- The reviewer's figure for the same interaction, measured with another script: "61 to 92 ms".

## Relationships

- Agrees with: the reviewer's finding in direction and size.
- Contradicts: none noted.
- Related: `docs/knowledge/sources/browser-storage-across-reload-measurements.md` (the same test browser; the same caution that all figures come from one browser on one machine).

## Raw notes (optional)

```js
// For each build: open the page at "#accent", start from "Midnight Aurora", open "Adjust with sliders", focus "#tune-accentHue".
const cdp = await context.newCDPSession(page);
await cdp.send('Performance.enable');
const metric = async (name) => (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === name).value;
for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
const before = await metric('TaskDuration');
for (let i = 0; i < 10; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
console.log(((await metric('TaskDuration')) - before) * 100, 'ms per step');
```

Limits: one browser, one machine, a machine that ran other work at the same time; no measurement on a phone; no split of the remaining cost into its parts.
