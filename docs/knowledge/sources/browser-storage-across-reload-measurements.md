# Measurements: browser storage across a reload, with and without a script that reads storage at the start of the load

- **Source**: the builder's own experiments of 2026-11-13 in this repository's test browser (Chromium, as driven by Playwright 1.63.0, on Linux). The scripts are reproduced in "Raw notes" below; their first versions lived in a temporary folder and are not kept.
- **Type**: data
- **Author/Origin**: the builder (the AI assistant that wrote the Studio), during the fourth red-team review
- **Published**: not published
- **Ingested**: 2026-11-13
- **Tags**: browser-storage, test-method, measurement

## Summary

Several browser tests failed once in a while, and one attacker in the fourth red-team review saw such a failure too. The experiments below found the cause in the tests' own setup, not in the Studio: a script that reads the browser's storage at the first instant of a page load can, on a reload, see an empty storage; when that script then writes, everything written before the reload is gone. This record matters because it explains past one-time failures, it fixes how tests in this repository must place starting data, and it bounds what was shown about the Studio's own saving.

## Key concepts

- **A plain write survives a reload.** A value written to `localStorage` and read back after a reload was never lost: 0 of 300 trials on an empty page (local file and local web address; small and 8,000-character values; reload at once and after a wait; one tab and two tabs) and 0 of 90 trials on the Studio's page.
- **A full storage survives a reload.** With the real storage filled to the brim (about 5.2 million characters) and no script at the start of the load, storage was unchanged after the reload in 20 of 20 trials.
- **A script at the start of the load breaks this.** With a Playwright "init script" that reads `localStorage` at the first instant of every load, a marker written before the reload was missing afterwards in 2 of 16 and in 4 of 16 trials. In the failing trials the script found storage empty (no keys at all) at the start of the reloaded page. The tests' setup script then wrote its starting data again.
- **What follows for tests.** A test must not place starting data, or keep a "placed already" marker, through a script that touches storage at the start of every load. This repository's tests now place starting data from an empty local page before they open the Studio, and they model "storage is full" as a fixed capacity that a patched `setItem` enforces lazily (it reads the capacity only when the page writes).
- **What is not shown.** The mechanism inside the browser is not established; the builder's guess (a new page process reads storage before the old process's writes arrive) is unverified. All trials used one browser, headless, on local files or a local address. Nothing here shows how Safari or Firefox behave.

## Notable quotes and data

| Condition | Trials | Storage lost or changed |
|---|---|---|
| Empty page, local file, small value, reload at once | 40 | 0 |
| Empty page, local file, small value, wait 500 ms | 40 | 0 |
| Empty page, local file, small value, wait 2,000 ms | 20 | 0 |
| Empty page, local file, 8,000 characters | 40 | 0 |
| Empty page, local file, two tabs | 40 | 0 |
| Empty page, local web address (three conditions) | 120 | 0 |
| Studio page, reload at once | 30 | 0 |
| Studio page, wait 1,000 ms | 30 | 0 |
| Studio page at the commit before the campaign's fixes | 30 | 0 |
| Studio page, real storage filled, no start-of-load script | 20 | 0 |
| Studio page, start-of-load script, with the page-database stand-in | 16 | 2 |
| Studio page, start-of-load script, without the stand-in | 16 | 4 |
| Studio page, start-of-load script, real storage filled | 20 | 5 |

- Sum without a start-of-load script: 410 trials, 0 losses. Sum with one: 52 trials, 11 losses.
- In a failing trial the log read `DOC START keys=` (empty) at the second load, where the first load had ended with `test.seeded, refraction.project.v2, marker`.

## Relationships

- Agrees with: none noted (first source on this subject).
- Contradicts: an earlier reading by the builder on the same day, recorded in a code comment and in `redteam/campaign-4/report.md`: "the browser dropped the filler on the reload" as a separate effect of filling storage. The last row but one of the table shows that a real fill survives a reload; the 5 losses in the last row came from the start-of-load script, which those trials also used. The comment and the report were corrected.
- Related records: `PROGRESS.md` ("Why some browser tests failed once in a while"); `redteam/campaign-4/findings.md`, attempt T-002 (a test that timed out once).

## Raw notes (optional)

The core of the failing experiment, for anyone who wants to measure again (run with `node`, Playwright installed; `URL` is the built Studio page as a local file):

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  let lost = 0;
  for (let i = 0; i < 16; i++) {
    const page = await (await browser.newContext()).newPage();
    await page.addInitScript(() => {              // the start-of-load script
      if (window.top !== window) return;
      if (localStorage.getItem('test.seeded')) return;
      localStorage.setItem('test.seeded', '1');
    });
    await page.goto(URL); await page.waitForSelector('.top');
    await page.evaluate(() => localStorage.setItem('marker', 'x'));
    await page.reload(); await page.waitForSelector('.top');
    if (!(await page.evaluate(() => localStorage.getItem('marker')))) lost++;
    await page.context().close();
  }
  console.log('marker lost in', lost, 'of 16');
  await browser.close();
})();
```

Remove the `addInitScript` call and the loss count goes to 0.
