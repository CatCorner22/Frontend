adf2a4e9030c5c071

identifier: not visible to me

Commit read: 219108a. Checks run: the Fit check on trials 001, 002, 003; the guarantees `--check`. Nothing else was run; other points come from reading.

## What breaks

- **G-S05 cannot reach state (a) by step 1.** For the owner: status 0 stays possible. Reproduce after the fix: take the test page of `PLAN.md:11`, change `1.5dppx` to `2.5dppx`; a reading at 2 device pixels (E-13 A-5) never shows the red. Reasoned from `plugin/fit/src/fit.ts:168` (`deviceScaleFactor: 1`) and the plan; not run, the fix does not exist yet.
- **R-T06 cannot reach state (a).** For the correctness auditor: C1 (a) requires "a test in the repository that fails when the fix is taken out"; `PLAN.md:18` gives only "the framework-drift auditor's reading". Reproduce: read both lines.
- **U7-02 is planned two ways.** C1 lists it for state (a); `PLAN.md:17` says "only if the USER wants it"; A-9 (E-13) assumes no screen changes; `SPEC.md:284` records that each press of Enter counts on purpose (D68). For the owner: a screen changes, the 40-minute suite runs (`CLAUDE.md` verification rule 2), and the private page needs a new version (E-10 G11).
- **FTU-22 and R-12 fit neither state.** `evidence/open-major-859c643.txt:5` already ends "Closed on 2026-11-15 ... (decision D55)"; line 3 is a corrected past fact. Neither has a test (a) nor someone who must act (b).
- **C4's test is narrower than C4.** `plugin/fit/e2e/exit.e2e.ts:363-389` sums the deviations for trial 002 only (line 381) and never reads the reference build. Reproduce: read those lines.
- **Steps 8 and 9 are in the wrong order.** Step 9 edits `redteam/FINDINGS.md` after step 8 has aligned the counts in `PROGRESS.md` (`PLAN.md:18-19`); C6 then fails on a count.

## What to cut

- Step 1 as a second full reading: 6 readings become 12 (`fit.ts:52`), inside a 39-build test with a 900-second limit (`exit.e2e.ts:50-61`), on unverified A-5.
- Step 7 (U7-02): move to state (b), "for the owner; D68". Removes the only screen change.
- FTU-22 and R-12 from C1's list (16 becomes 14), or one sentence in C1 that admits "closed by a recorded decision".
- The per-fix writing of `PROGRESS.md` and `SPEC.md` in `PLAN.md:7`; write the records once, in the last step. The `FINDINGS.md` row stays per fix.
- The 4-way split of `PLAN.md:23` if the USER refuses 1 round: 2 units are enough (`plugin/`; the records).

## What to add

- 3 assertions to the test at `exit.e2e.ts:363`: the sum for 001 and 003, and the reference build. Or narrow C4 to trial 002's sum.
- For R-T06: 1 small test that compares 1 count in `PROGRESS.md` with `FINDINGS.md`, or move R-T06 to state (b) under C6.
- Order: step 5 first (3 failing tests show which fixes exist at all), then 2, 3, 4, 1, 6 (the guide after every option is final), 9, 8.

## The 1 change this lens insists on

Replace step 1's second reading by 1 rule: a build whose style or markup holds a condition on pixel density (`resolution`, `device-pixel-ratio`) makes the colors "not measured", status 1. This is the pattern already used for scripts (`exit.e2e.ts:321`). It covers every density, adds no reading and no time. `grep` finds no such condition in `apps/studio/src`, and in `packages/core/src` only inside `catalog/floors.ts` (text of a Floor, not read further), so the 39 clean builds should stay status 0; the existing test at `exit.e2e.ts:50` proves or refutes that.

## Checked and found sound

- C4 holds today for the 3 trials: summary lines 0, 22, 0 deviations equal the receipt sums 0, 22 (20+2), 0; trial 003 gives status 1 with "1 not measured" (my runs at 219108a).
- C3 needs no step: `apps/studio/e2e/deliverable.e2e.ts:31` holds 3 Directions, added in 859c643. Not run here.
- C6's reference check: exit 0, "findings: none" (my run).
- Step 6 is needed: `plugin/README.md:52-58` names no `--fonts` (`look-cli.ts:10`); `exit.e2e.ts:244-245` tests 3 commands of 4.
- Steps 2, 3, 4 are each 1 file or 2 and 1 test; right size (`PLAN.md:12-14`).
- No step for E-10 G9, G14, G15: correct, all outside E-14.
