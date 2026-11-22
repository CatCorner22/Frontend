a783912f9954b93eb

identifier: not visible to me (the only identifier I can read is the session link in my attribution lines, session_017va4ixVK28D3sUvFDtEBSE; no launch identifier was given to me)

## Planted defect (1, in the copy only)

- File and line: `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/audit/v2/plugin/fit/src/cli.ts`, line 115.
- Before: `const lastRoundVision = repairRound > 0 ? lastVision(join(resolve(outFolder), 'receipt.json')) : undefined;`
- After: `const lastRoundVision = repairRound > 1 ? lastVision(join(resolve(outFolder), 'receipt.json')) : undefined;`
- Nothing else changed: no test, no record, no comment, no name. The original at `/home/user/Frontend` is untouched. The `node_modules` link is untouched.

## What the defect does

In repair round 1 the command-line program no longer reads the receipt of the round before (the first check, round 0). The receipt of round 1 then holds `vision.changedSinceLastRound: null` and the sentence "The result folder held no receipt of the round before, so the program could not say whether a Vision file changed." This happens even when a receipt of round 0 stands in the result folder and a Vision file changed. Rounds 2 and 3 still compare. The comment above the line still says "this round says which of them changed", and `fit.ts` line 583 still uses `repairRound > 0`, so the two files now disagree.

## CRITERION that now fails

C8: "a receipt of a round after the first says in 1 sentence when a Vision file differs from the round before." Round 1 is a round after the first check, and its receipt says the opposite. The receipt also states something the program did not find (no receipt held, when one was held), which touches the last clause of C4 ("no sentence of the receipt says that the program did something it did not do") for a round-1 receipt; the 5 cases of C4's test are all first checks, so C4's test does not show it.

## Trigger that shows the failure

Run, in the copy (I ran it; it fails):

```
export PW_CHROMIUM=/opt/pw-browsers/chromium
npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "criterion C8"
```

Result: 1 failed. `plugin/fit/e2e/exit.e2e.ts:527`, `AssertionError: expected null to deeply equal [ 'VISION.md' ]` (`second.receipt.vision.changedSinceLastRound`). The full command of C2 and C5 (`npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e`) therefore no longer reports 0 failed in the copy.

By hand: run the Fit check with `--round 0`, delete section 7 of `VISION.md`, run it again with `--round 1` into the same result folder; `RECEIPT.md` holds the "held no receipt" sentence in place of "Since the receipt of the round before, 1 of the Vision files ... has changed: `VISION.md`".

By reading: `cli.ts` line 115 (`> 1`) against the comment on line 114 and against `fit.ts` line 583 (`repairRound > 0`).

## Roles of rule 13.1 that must find it

- Role 1, Correctness auditor (runs every test the CRITERIA name; C8's test fails; reads each branch).
- Role 4, Adversarial tester may find it too (a sequence of rounds with a changed Vision file), but it is not required: the required finder is role 1.

Checks not run: I ran only the 1 test of C8 in the copy; I did not run the rest of the suite, `npm run check`, or the build of the page.
