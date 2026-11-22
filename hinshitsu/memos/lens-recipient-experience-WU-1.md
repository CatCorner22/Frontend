a26a6f7a6c9c4756b

identifier: not visible to me

Read at head `eaab1ff`. The working tree holds commit 21, not yet committed (`git status`: 10 files). Fit check runs used `git archive HEAD plugin` in a `mktemp -d` folder. I ran no browser test suite.

## Does this WORK UNIT or its FINDINGS change the plan

yes

1. Commit 21 changes what every RECIPIENT gets, not the test alone. In the working tree it changes `packages/core/src/vision.ts` (the fingerprint sentence, F-118) and `plugin/fit/trials/reference-floors/VISION.md`. `hinshitsu/PLAN.md` line 41 says only "Commit 21 hardens the deliverable test". The hand check of C3's 7 clauses (`audits/WU-1-recipient-experience-E-193.md`) read a Vision from before that change. S8 (PLAN line 45) repeats it on a Vision downloaded after commit 21 and after the answer to question 1.

2. Question 1 (F-65, F-113): the value fails the AI coding tool in 2 of 3 ways of writing it. I loaded `plugin/fit/trials/reference-floors/tokens.css` in Chromium under `body{font:400 20px Georgia}`:
   - `font-family: var(--font-numeric)` gives Georgia, the intended look.
   - `font-family: var(--font-numeric, monospace)` gives monospace, the reverse of the intent.
   - `font: 700 40px var(--font-numeric)` gives Georgia, 20px, 400: the browser drops the whole declaration, size and weight included.

   `plugin/commands/fit-build.md` step 2 tells the tool "Use the design values by their names in `tokens.css`". `VISION.md`, `DESIGN.md` and `FONTS.md` of that folder hold 0 lines on `--font-numeric` (grep). The working-tree test (`apps/studio/e2e/deliverable.e2e.ts` lines 142 to 162) pins the first form only. Under my concern, either answer adds 1 commit in `packages/core` that the plan lacks: a real value at `tokens.ts:575`, or a sentence in the Vision that says what the value does. Then `reference-floors` is written again.

3. Question 2 (F-55, F-74, F-112): the program tells the owner, and the guide's next step loses it. I ran the reference build of `reference-floors` (made with `plugin/fit/e2e/built.ts`): "No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0." `RECEIPT.md` lines 38 to 48 name the 3 texts under "Measured", with "A person must judge these by eye". `plugin/README.md` line 58 gives the act for status 0 as: Read "Still needs a person". That part (receipt lines 108 to 129) holds no line on those 3 texts. An owner who follows the guide misses them. The repair is 1 sentence in the guide's row, or 1 line in that part of the receipt.

## Does it change a CRITERION

yes

- C4 (E-139): "status 0 goes only with … 0 "not measured" in a measure that counts" is false for the run above. Under my concern the program's rule serves the owner better than status 1 would. Status 1 here lands in the guide's second case (README line 67), which no repair clears, on every faithful build with a partly transparent text. C4's sentence takes the exception that README line 62 already states, with 2 conditions: the one line gives the count, and the receipt names each text.
- C3 (E-139), clause 4: it changes only if the USER keeps `inherit`. It then names the 1 exception and requires that the Vision states it in words. If the value is repaired, C3 stands as written.

## Does it change a later WORK UNIT

no

No later WORK UNIT of code exists (PLAN line 37; scope line 18). 2 later stages take content from WU-1:

- S8: point 1 above.
- S11: 2 STYLE findings still stand in what the owner reads at head. F-147: receipt line 3 still says "the second one twice". F-150: receipt lines 5, 40 and 52 use "SHA-256", "WCAG 2.x formula", "clip-path" and "mask" with no meaning given.

Repaired at head, by my own runs or reading:

- F-115: the usage line prints `node fit/src/cli.ts … <Vision folder>`.
- F-116: an archive given as the folder gets "is a file, not a folder … unpack it first".
- F-117: `look.ts` holds no "G-S05" line.
- F-120: README line 60.
- F-138, F-139, F-140: the 3 cases of status 1 stand in the guide, `fit-check.md`, `fit-build.md` and `fit-repair.md`.

I did not re-check the other FINDINGS tagged with my LENS.
