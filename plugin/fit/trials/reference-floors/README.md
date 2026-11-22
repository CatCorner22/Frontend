# The stored Vision with every Floor

This folder holds the 7 files of a Vision: the plain start of the Studio (no Direction picked, no Step changed), with "Contrast checks" set to "Fix for me", so that section 7 of `VISION.md` writes every Floor requirement in the edition that the Fit check reads.

**Why it exists.** The receipt's agreement test (`plugin/fit/e2e/exit.e2e.ts`, "says nothing in the receipt that disagrees with its own summary line") needs one case in which the Fit check reads the Floors and contrast is required. The 3 trials do not give one: the Visions of trials 001 and 002 write no Floor, and that of trial 003 writes them in an older edition.

**How to use it.** From the repository's root:

```
node plugin/fit/src/cli.ts plugin/fit/trials/reference-floors/mockup.html plugin/fit/trials/reference-floors <result folder>
```

The page checked is the Vision's own Mockup. It is a still page with sample addresses, so the receipt shows Floor deviations and status 1; that is expected, and the guarantees reference says why (section 66.11).

**What can go wrong.** The files are a copy of what the Catalog writes. When the Catalog changes, the test "keeps the stored Vision of the plain start with every Floor ... equal to what the Catalog writes today" fails. Write the folder again:

```
UPDATE_REFERENCE=1 npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "keeps the stored Vision"
```

Do not edit the 7 files by hand: the Fit check refuses a Vision whose files disagree.
