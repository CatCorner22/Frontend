af117017be9c29372

identifier: not visible to me

Commit read: 219108a. Checks run: file reads and `grep` only. I ran no test and no Fit check.

## What breaks

1. **Steps 1 and 2 turn `trial.e2e.ts` red, and the plan names none of the files involved.** For the BUILDER and C5. `plugin/fit/e2e/trial.e2e.ts:74-78` compares `receipt.json` and `RECEIPT.md` of trials 001 to 003 byte for byte with today's output. Each stored receipt holds the 2 sentences that these steps make false (`plugin/fit/src/receipt.ts:62`, `:65`; `grep -c "high-density\|Closed shadow roots" plugin/fit/trials/00*/RECEIPT.md` gives 2 for each). PLAN steps 1 and 2 list only `fit.ts` and `collect.ts`. The same sentences stand in `docs/reference/guarantees.md:982` and `SPEC.md:404`, which C6 tests. This is the edge "a stored trial receipt differs" in `CONNECTIONS.md`.
2. **C3's test does not open the file that E-14 names as the DELIVERABLE.** For the owner. `apps/studio/e2e/deliverable.e2e.ts:14` opens `local-test.html`. `apps/studio/scripts/make-artifact.mjs:27,30` writes `refraction-studio.html` as a bare fragment and `local-test.html` as that fragment inside its own wrapper. C3's command also skips `npm run build:page` (`package.json:24`), so it can pass on a stale `dist`.
3. **C4 claims more than its named test checks.** For the language auditor. `plugin/fit/e2e/exit.e2e.ts:363-388` runs the 3 trials only, not the reference build, and it asserts the sum of deviations for trial 002 only (`:381-382`).
4. **The look has no contract, so steps 3, 4 and 6 have nothing to hold to.** For the owner at `/fit-look`. `FRAMEWORK.md` section 4 has no row for `look-cli.ts` (its statuses, `LOOK.md`). `exit.e2e.ts:244-245` still tests "three commands" and leaves out `fit-look`. `plugin/README.md:52-58` lists the options of `cli.ts` only; `--fonts` appears only in `plugin/commands/fit-look.md:11`.
5. **The CRITERIA IDs do not match across entries.** For any AUDITOR who traces a need. E-9's translation makes C2 "the bugs that this run's auditors find"; E-14 makes C2 the 3 findings of pull request 16; E-10 G16 puts those 3 "inside C1". E-10 G9 puts R-U08, R-U09 and G-U19 to G-U21 "inside C7", but C7 and the PLAN hold no such fix.
6. **U7-02 has 3 states at once.** E-14 C1 plans it closed, PLAN step 7 says "only if the USER wants it", and E-13 A-9 assumes no screen changes. If it is fixed, `CLAUDE.md` verification rule 2 asks for the full `npm run e2e`; PLAN line 7 says "the browser tests of the part changed".

## What to cut

- FTU-22 from the 16 rows: its own Status ends "Closed on 2026-11-15" (`evidence/open-major-859c643.txt`, row FTU-22).
- `FRAMEWORK.md` section 1, "No `CRITERIA` entry exists yet": its own footer names E-14.

## What to add

- To steps 1 and 2: `receipt.ts`, `plugin/fit/trials/00{1,2,3}/receipt.json` and `RECEIPT.md`, `docs/reference/guarantees.md`, `SPEC.md:404`.
- Rows for the look in `FRAMEWORK.md` section 4, and `fit-look` in the test at `exit.e2e.ts:244`.
- `DECISION` entries D-1 to D-7: E-13 cites them, and none exists (scope file line 14; `FRAMEWORK.md` section 2).
- PLAN steps, or a "Not in the plan" line, for G9, G14 and G15.
- The real path for C6's `<living-reference>`: `/root/.claude/skills/synced/…/living-reference/scripts/refresh_reference.py` exists.
- A decision on whether G-S05 also covers the look: `plugin/fit/src/look.ts:592` and `:1149` fix `deviceScaleFactor: 1`.

## The 1 change this lens insists on

Give each PLAN step a full "Files" cell that includes every stored artifact and record that repeats the changed sentence (point 1). Otherwise the first fix either fails the byte-for-byte test or leaves the receipt saying the program does not do what it now does, which C4 forbids.

## Checked and found sound

- `FLOORS_EDITION` is 3 in both `packages/core/src/catalog/floors.ts:16` and `plugin/fit/src/floors.ts:184`, and `exit.e2e.ts:266` tests that they are equal.
- C1 adds up: 7 planned closed plus 9 planned kept is 16, matching the evidence file.
- `vitest.e2e.config.ts` includes `plugin/fit/e2e`, so C2's command finds its tests.
- The 7 file names at `deliverable.e2e.ts:16` match the Vision row in `CLAUDE.md`.
- `plugin/commands/` holds 4 commands, and the usage lines at `cli.ts:9` and `look-cli.ts:10` exist for C7's test.
- Step 5's files are right: the cut-text rule is at `collect.ts:214-217`, the label rule at `floors.ts:53-74`.
- Every `run:` command in `evidence/a5-checks.txt` is defined in `package.json`.
