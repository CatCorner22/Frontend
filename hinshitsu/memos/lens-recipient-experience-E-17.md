ac9dfa30ca4e1c027

identifier: not visible to me

(Stage: plan. Commit read: 219108a. I ran `node plugin/fit/src/cli.ts` and `look-cli.ts` on `plugin/fit/trials/001`, results under the scratchpad. I did not run `npm run check`, any vitest suite, or the built Studio page.)

## What breaks

1. **The owner, at status 1 with no deviation.** Plan steps 1 and 2 (`PLAN.md:11-12`) add 2 more ways to reach status 1 by "not measured". The guide's only advice at status 1 is "Read the deviation lines; repair by hand or with `fit-repair`" (`plugin/README.md:35`). `fit-repair.md:12` repairs "each deviation line"; `:16` says "If it is 1 and the round was 1 or 2, go to step 1". With 0 deviation lines the loop has nothing to repair and spends the 3 rounds, or it removes the unmeasured part, which `:13` forbids. Reproduce: add `<iframe srcdoc="x"></iframe>` to `trials/001/index.html` and run the Fit check; I got "No deviation; 1 thing could not be measured … Status 1."
2. **The owner, with the archive.** I passed the zip as the Vision folder: both programs answer `The folder has no file "VISION.md".` (status 2). The guide never says to unpack (`plugin/README.md:9,24`); only the Studio's screen does (`apps/studio/src/App.tsx:1192`). A download that the browser renamed (`tokens (1).css`) gives `The folder has no file "tokens.css".` with no hint.
3. **The owner and the later session, after step 1.** Step 1 lists only `fit.ts` (`PLAN.md:11`). The receipt would still say "The program reads the page on a screen of ordinary pixel density" (`plugin/fit/src/receipt.ts:62`), and its header (`receipt.ts:100`) and "27 readings of 3 texts" would miscount. This breaks C4 in the reverse sense. The guide's line `plugin/README.md:46` goes stale too.
4. **Any session, after steps 1, 2 or 5.** `plugin/fit/e2e/trial.e2e.ts:77-78` compares the 3 stored receipts byte for byte. Any change of receipt wording turns it red; the plan names no step for the stored `RECEIPT.md` and `receipt.json` of `trials/001` to `003`, which C4's language auditor reads.
5. **The owner, with no browser.** Reproduce with `PW_CHROMIUM=/nonexistent`: the line is `The Fit check stopped: browserType.launch: Failed to launch chromium because executable doesn't exist at …`. It names no next act; G9 (E-10) is only "Asked", and no plan step holds it.

## What to cut

- Step 7's Studio change from this run unless the owner asks (`PLAN.md:17`; A-9, E-13): it forces a new private page (G11) for a finding where each press may be deliberate.

## What to add

- Step 6: the guide says "unpack the archive first; the folder must hold the 7 files under their own names", and gives the look its own run line, options and statuses (C7).
- Step 1's files: `receipt.ts`, `plugin/README.md:46`, and the stored trial receipts, written again by the program in the same commit.
- Step 9: 1 list for the owner, in `PROGRESS.md` "Known gaps", of every kept row that waits for the owner (R-S08, U7-02, G-T08, FTU-32), each with the question to answer. RECIPIENT 3 then finds them without reading 16 rows.

## The 1 change this lens insists on

Split status 1 for the owner. In `plugin/README.md:35`, `fit-check.md:12` and `fit-repair.md:16`, state 2 cases: (a) deviations: repair; (b) "not measured" only: no repair round runs; the receipt names the part (frame, closed shadow root, blend), and the owner removes it or judges it by eye. C7's test should check both cases. Without this, steps 1 and 2 turn a stated limit into a dead end.

## Checked and found sound

- Status 0 line and receipt agree on `trials/001`: "No deviation; the contrast of 3 texts could not be read … Status 0", receipt 0 deviations in each counting measure (run by me).
- Wrong use gives status 2 with a plain line: no arguments, 2 arguments, swapped arguments ("Cannot read the build: it is not an ordinary file."), `--round 4` (run by me).
- The look on `trials/001`: 14 pictures, status 0, `LOOK.md` says the fonts are a fallback's and why (run by me).
- `deliverable.e2e.ts:31` uses Graphite Precision, Galactic Goth, Sticker Pop, so C3's hand check has other Directions left (read, not run).
- The Studio tells the owner to open the archive (`App.tsx:1192`, read only).
