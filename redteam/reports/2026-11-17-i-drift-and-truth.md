# Gate review of milestones M6 and M7, 2026-11-17: drift and truth

A helper agent that had not seen the builder's conclusions examined commit `0d1eb7b`. This is its report, word for word. The builder's answers are in `redteam/FINDINGS.md` (rows that begin with G-).

# Drift and truth audit: gates M6 and M7 (commit 0d1eb7b)

**Verdict: one blocker at M7's exit test.** With every Floor written (Contrast checks "Fix for me"), the reference build of two of the 38 Directions ends with status 1. The records say all 38 show no deviation; the tests never run that case.

What I ran:
- `npm run check`: green, 366 unit tests.
- The command line on trial 003: status 1, receipt byte-equal to the stored one.
- One scratch browser run of `fit()` on `built(mockup)` for the plain start and all 38 Directions, each with `a11y: 'enforce'` and `'off'`.
- `claude plugin validate plugin`.

Not run: the full e2e suite. I could not see GitHub's CI result for this commit. Nothing in the repository was edited; `git status` is clean.

Scratch files:
- `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/gate/auditor/strict.e2e.ts`
- `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/gate/auditor/strict.out`
- `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/gate/auditor/out/RECEIPT.md`

## Findings

| id | severity | gate | The claim (path:line) | What the code does (path:line) | Smallest correction |
|---|---|---|---|---|---|
| G-T01 | **blocker** | M7 (touches M6) | "the reference build of the plain start and of each of the 38 Directions shows no deviation in any measure" (`SPEC.md:370`). "The reference build of the plain start and of each of the 38 Directions, without a defect, shows no deviation and status 0" (`docs/reference/guarantees.md` §66.11, line 1034). Same in `PROGRESS.md:117`. | The 39-project test uses the default `a11y: 'advise'` (`packages/core/src/engine.ts:78`), so Floor A1 is not written, and it compares six measures without contrast (`plugin/fit/e2e/fit.e2e.ts:28,46-61`). Only `paper-and-ink` is tested with all Floors (`plugin/fit/e2e/exit.e2e.ts:25`). My run with `a11y: 'enforce'`: `poster-block` and `vector-horizon` give **status 1**, contrast 3 deviations: "1.00 to 1, where 3 to 1 is the usual least, on mark "explains itself"" at all three widths. Cause: the outlined headline word (`packages/core/src/templates/smallBusiness.ts:411`: fill is the hero background, the letters are a text stroke). The other 37 give status 0. | Run the 39-project test with `a11y: 'enforce'` and include contrast. Then decide whether outlined text is a false reading of the Fit check or a breach of A1 by the Mockup, and repair that side. Until then, word the claim as "one Direction with every Floor; 39 without Floor A1". |
| G-T02 | major | M7 | "for each checked part, a page with that one fault planted shows a line with that requirement's id" (`SPEC.md:370`); "one for each checked part of a Floor requirement" (`SPEC.md:384`, §66.11). | One defect per requirement, not per part, and the twins are named only in the test title. For "A2 and Q12", "A5 and Q13", "A12 and Q3", "A13 and Q9" the assertion matches only the A line (`exit.e2e.ts:80,83,86,87`); the count test reads ids from titles (`exit.e2e.ts:119-122`). No test fails if the Q3, Q9, or Q13 line disappears (Q12 is asserted once, at line 129). Branches of `plugin/fit/src/floors.ts` with no planted defect: Q9 without `width=device-width` (225), A10's heading half (215), A11 without a main landmark (217), `javascript:` for S3 and Q10 (229), S5 `base-uri`, missing `script-src`, `unsafe-inline`, after the character set (238-244), S8 with a wrong value (249), S9 to `http://` (251), two titles (220), a skipped heading level (255), an empty or doubled description (257), an empty link (260), `maximum-scale` (223). No unit test of `floorFindings` exists. | Assert both ids on the twin rows, and add one planted defect for each branch. Or reword both records to "one defect for each requirement that has a checked part". |
| G-T03 | major | M7 | §66.01: "Contrast is reported as a measurement and never changes the status, because the Vision holds no Floors yet" (`guarantees.md:875`). §66.03: "Judged by the model (empty in this slice)" (896). §66.04: trial 003 "The program measured no deviation … says that no program checks a Floor yet" (908). §66.02: "the six measured things" (888). | Contrast gives status 1 when A1 is written (`plugin/fit/src/fit.ts:482`). The receipt holds the model's lines (`fit.ts:471`). Trial 003 measures to status 1 with "S5: the policy tag does not stand after the character set tag" (my run; `plugin/fit/trials/003/RECORD.md:51` says so too). The Floors measure also counts toward status. | Rewrite those four sentences. §66.01 to §66.08 still say "Last verified: 2026-11-16". |
| G-T04 | major | M6 | "The section says that no program checks any Floor yet" (`SPEC.md:315`). §65.14: "The section says that no program checks any requirement yet" (`guarantees.md:838`). | Section 7 says "The Fit check of Frontend Focus checks a part of some of these requirements …" (`packages/core/src/vision.ts:285`), and tests assert the new sentence (`packages/core/test/floors.test.ts:130`, `apps/studio/e2e/studio.e2e.ts:3508`). | Update both sentences. |
| G-T05 | major | M6 and M7 | `PLAN.md:19`: "(… no program checks them yet) … Still missing: most of the Fitter (M7)". `PLAN.md:36`: "the rest not built (M7)". `PLAN.md:94`: "export (M6) partly built". | The same file's table says M7 "built on 2026-11-17" (`PLAN.md:188`) and M6 "all seven files are built" (187). | Bring lines 19, 36, and 94 in line with the table. |
| G-T06 | major | M6 and M7 | `PROGRESS.md:40`: "Current milestone: M4". Status table, M6 row (line 55): "Not built: the floors in the Prescription"; no M7 row. "Start here" (line 9): "48 requirements … no program checks them yet". "Next" item 4 (line 496): M6 "the rest of the export bundle" and "M7: the Fitter" as future work. | Only the build log (`PROGRESS.md:108-121`) is current. These sections are the ones a fresh session reads first (`PROGRESS.md:5`), and hard rule 1 hangs on "the current milestone named in `PROGRESS.md`". They also still say "Prescription" outside the build log. | Rewrite the "Start here" picture, the status table (add M7), and "Next". |
| G-T07 | major | M7 | `PLAN.md:105-106`: `/fit-check` measures "token fit, reference fit against `mockup.html`, accessibility, craft rules, and states"; `/fit-repair` "receives the measured failures and the screenshots". `README.md:7`: the Fitter makes Claude "look at the rendered result". The M7 row lists as open only the commands, the pixel comparison, and the gate review. | Craft rules and states are "Still needs a person" (`plugin/fit/src/receipt.ts:49-50`). No reference fit beyond the three texts. No screenshot reaches the model (`SPEC.md:377`). | Reword section 4.5 and the README to what exists, or list these in the M7 row as open. |
| G-T08 | major | M7 | Exit test: "`/fit-check` finds every planted defect" (`PLAN.md:188`). | The test calls `fit()` and the command line, never the command. Nobody has run the three commands in a Claude Code session; the records say so (`PLAN.md:188`, `PROGRESS.md:116`, §66.10). | The owner decides whether "built, commands never run" passes the exit test. |
| G-T09 | minor | M7 | §66.09 to §66.11 are guarantees of section 66. | They stand inside "[80] Glossary", after the entry "Step" (`guarantees.md:1012-1037`), and in the contents list under the glossary (151-153). The health block says "No findings" (1509). | Move them after §66.08 and regenerate. |
| G-T10 | minor | M7 | `CHECKED_PART` S9: "every form posts" (`floors.ts:174`). | Requirement S9 covers only "each form that collects personal data" (`packages/core/src/catalog/floors.ts`, record S9). A search form with GET gets "S9: 1 form does not post" and status 1 (`floors.ts:250`). | Narrow the check, or say in the line that every form was counted. |
| G-T11 | minor | M7 | A10: "one main landmark and one first-level heading" (`floors.ts:162`). Q11 words list four phrases (182). | A10's text asks for matching elements, not exactly one `h1`. Q11's set also holds "more" (`floors.ts:80`), which neither the requirement nor the plain words name. | Drop "more", or add it to the words. Report the `h1` count under Q7 only. |
| G-T12 | minor | M7 | S5: "… and holds the named rules" (`floors.ts:170`). S6: "the policy holds a form-action rule" (171). | `script-src *` or `'self'` passes; only absence, `unsafe-inline`, and `unsafe-eval` are caught (`floors.ts:242-244`). `form-action *` passes (245). The loader list holds every `link[href]` (a canonical link too) and `style` (62), so a canonical link before the policy gives an S5 line. | Word S5 as "sets object-src and base-uri to 'none' and a script-src without unsafe-inline or unsafe-eval". Limit `link` to those that load. |
| G-T13 | minor | M7 | A3: "tied to a label or carries a name" (159). A4: "every link and button has a name" (160). Q10: "every link is an a element with an href" (181). P12: "no script in the head blocks rendering" (189). P9: "every @font-face names a WOFF2 file" (188). | A3 accepts an `aria-labelledby` that points nowhere (`floors.ts:67`). A4 leaves out `input type=submit` and `role=button` (126) and counts a `title` (52). Q10 cannot see a `span` with a click handler. P12 counts only `script[src]` (142). P9 passes a rule that names both a `.ttf` and a `.woff2` (264). | Tighten the words. None promises a whole requirement. |
| G-T14 | note | M7 | Whether each `CHECKED_PART` entry has a branch, and the reverse. | 33 entries. 31 have a branch in `floorFindings`. A1 and S2 have none by design (comment at `floors.ts:155`; the contrast and requests measures hold them). No branch names an id that lacks an entry. A11 and Q9 do what their words say. | None. |
| G-T15 | minor | M7 | Comments: "at two window widths" (`fit.ts:1`); "the six measured things" (`fit.ts:37,477`, `cli.ts:2`); "The four windows" (`fit.ts:459`); "no program runs it yet" (`catalog/floors.ts:33`). Test titles: "finds no deviation in the Mockup of …" (`fit.e2e.ts:46`, it measures `built()`); "every window width but the two" (398); "the six lines of "Still needs a person"" (867); "never as a status" (126, true only without A1). | Three widths, six readings, eight measures of which seven count toward status, at least twelve lines. | Edit the comments and titles. |
| G-T16 | minor | M6 and M7 | `VISION.md` section 8: "The Fit check measures colors, typefaces, corner radii, contrast, the three required texts, and width" (`vision.ts:417`). | Requests are measured too. | Add "requests". |
| G-T17 | minor | rename | `PLAN.md:3`: "'Frontend Focus' is a placeholder name (the eye-exam procedure). You can rename it at any time." `README.md:1`: "Frontend Focus (placeholder name)". | The rename turned a sentence about "Refraction" into a false one: the owner chose this name (`CLAUDE.md:7`, D75), and it is no eye-exam procedure. | Delete both remarks. |
| G-T18 | minor | M7 | Node: `plugin/README.md:7` "Node 22.18 or newer"; `plugin/package.json` ">=22.18". | Root `package.json` says ">=22", and `CLAUDE.md:67` says "Node 22", but `npm run fit` runs the same TypeScript file with plain `node`. | Raise the root value to ">=22.18" and name it in `CLAUDE.md`. |
| G-T19 | minor | M7 | Command names: `/fit-build`, `/fit-check`, `/fit-repair` (`SPEC.md:374`, D76, `feature_list.json` F036, `fit-build.md` step 5, `fit-check.md` last rule). | `plugin/README.md:12` says they show as `/frontend-focus-fitter:fit-build` and so on. The command files send Claude and the owner to the short names. | Use one spelling, or say that both work once someone has checked it. |
| G-T20 | minor | M7 | `fit-repair.md` step 4: "Add to `judged.txt` …". | Its allowed tools are `Bash(node:*), Read, Edit`, with no Write. After a plain `/fit-check` no `judged.txt` exists, so the step cannot create one. | Add Write, or tell it to skip `--judged` when the file is absent. |
| G-T21 | minor | M7 | "a repair stops after three rounds" (F036); "at most three rounds" (README, manifest). | The program refuses only a `--round` above 3 (`fit.ts:452`). The round is the number the caller passes, and a refusal first deletes the earlier `receipt.json` (`cli.ts:66`), the only place the count is kept. §66.10 admits that no test shows Claude obeys. | Say in the README that the model counts the rounds and the program only refuses a stated fourth one. |
| G-T22 | minor | M7 | "The receipt shows at most 20 such lines" (`SPEC.md:376`). | Lines past 20 are dropped without a word (`fit.ts:471`). Every measure says "n more … not listed" (`receipt.ts:102`). | Add the count of lines not shown. |
| G-T23 | minor | M7 | The command line's result line. | It prints "1 deviations, 0 windows not measured" (my run). With status 1 from "not measured" alone it prints "0 deviations, 0 windows not measured" and gives no reason (`cli.ts:88`). | Singular form; name the count of things not measured when the status is 1. |
| G-T24 | minor | M7 | F034 step 1: "the top bar and the page title say "Frontend Focus Studio"" (`feature_list.json:396`). | No test asserts these words. The only name test checks that the old names are absent (`packages/core/test/catalog.test.ts:863`). The words are in `apps/studio/index.html:6` and `App.tsx:177`. | One browser assertion. |
| G-T25 | note | M7 | "`claude plugin validate plugin` passed" (`PROGRESS.md:116`, §66.10). | Here it gives "Validation passed with warnings": the README has no marketplace install line. | Say "with one warning". |
| G-T26 | note | M7 | Build log: "468 of 469 browser tests passed … The test now leaves that one line out … the trial tests then passed (18 of 18)" (`PROGRESS.md:118`). | A trial test was loosened after it failed (`plugin/fit/e2e/trial.e2e.ts:44-49`), and the record shows no full green e2e run after that (verification rule 3). The log discloses both, and that the Floors module came before its tests. | Record one full green run, or the CI run number. |
| G-T27 | note | M7 | The Floors measure reads only the ids from `VISION.md` (`floors.ts:147-153`). | It applies today's meaning to any Vision. Trial 003's page obeyed its own first-draft S5 and is reported as deviating from today's S5. | State this limit in the receipt note or in §66.09. |
| G-T28 | note | M6 | `SPEC.md:165`: "each checked by a validator". | Outside programs check `DESIGN.md` and `tokens.json`, on GitHub only (`validators/outside.test.mjs`, `.github/workflows/ci.yml`). `theme.css` is held against the builder's own list; `FONTS.md` has none. The body text of 2.9 says this. | Title: "two of them checked by outside validators". |
| G-T29 | note | M6 and M7 | Hard rule 11: a row in `WAYPOINTS.md` at each milestone. | The last row is W14 (2026-11-16); there is none for the Floors or M7. `PLAN.md:101` still calls the floors "not overridable: accessibility checks", against D13. | Add the row after the gate; fix the line. |
| G-T30 | note | rename | `plugin/` has no lock file, so Playwright's own dependencies are not pinned there (hard rule 7). `validators/package.json` and the root `package.json` keep "refraction" names; D75 exempts package names. | — | A lock file for the plugin. |

## Claims I verified as true

**Counts**
- `CHECKED_PART` has 33 entries (10 A, 9 S, 9 Q, 5 P); 23 are unchecked; the Catalog holds 56 (20, 11, 5, 10, 10). Tests assert 33, 23, and that every id is in the Catalog (`exit.e2e.ts:57-63`).
- `DEFECTS` has 35 rows: 7 design defects and 28 Floor defects (`exit.e2e.ts:73-107`).
- Widths are 375, 768, 1280 (`fit.ts:41`), asserted at `exit.e2e.ts:46`.
- At most 20 judged lines, each cut at 200 characters, three rounds (`receipt.ts:41-43`, `fit.ts:49-50,235,471`), tested at `exit.e2e.ts:152-166`.
- There are 38 Directions (my run ended with 39 projects), 88 guarantee headings, 8 tests of the book of Directions, and 3 + 3 tests behind §66.10.

**SPEC 2.22**
- Ids are read from section 7 (`floors.ts:147`; test `exit.e2e.ts:50`).
- Each Floor line begins with its id, and a Floors deviation gives status 1 (`fit.ts:482`; each planted test asserts status 1).
- With A1 written the title is "Contrast: required by Floor A1 of the Vision" and a pale text gives status 1 (`exit.e2e.ts:47,79`).
- Without A1, no A line appears and contrast is "measured, not required" (`exit.e2e.ts:124-134`).
- The note and "Still needs a person" name the unchecked ids (`exit.e2e.ts:64-66`).
- A Vision without section 7 gives "nothing was checked" (`fit.ts:423`), covered by the stored receipts of trials 001 and 002.

**SPEC 2.23 and §66.10**
- The manifest is named `frontend-focus-fitter`; three command files run `node "${CLAUDE_PLUGIN_ROOT}/fit/src/cli.ts"`, state the data rule and the three-round budget (`exit.e2e.ts:189-216`).
- `--round 4` gives status 2 and no receipt; a missing judgments file gives status 2 (`exit.e2e.ts:168-186`).
- Judged lines stand in a fence with "No program checked them" (`receipt.ts:128`).

**§66.09**
- All four named tests exist; the receipt never says "accessible" or "compliant" (`exit.e2e.ts:67`).

**§65.13 to §65.15**
- The Floor record tests exist (`packages/core/test/floors.test.ts`), and the Floor for people with disabilities is written only with "Fix for me" (`vision.ts:289`).
- The stored `directions.md` test passes in `npm run check`.

**Agreement between the documents**
- Scripts run by default and `--no-scripts` stops them: `cli.ts:9,50`, `receipt.ts:27,117`, `plugin/README.md:26`, §66.06, and D76 point 4 agree.
- The Studio's Summary (`App.tsx:1213`), `VISION.md` section 7 (`vision.ts:285`), and the plugin README agree that the Fit check checks a part of some requirements and no program checks the rest.

**The rename**
- No "Refraction", "Prescription", or "PRESCRIPTION" in `packages/core/src`, `apps/studio/src`, `plugin/fit/src`, `plugin/commands`, `plugin/README.md`, `SPEC.md`, `docs/trial-guide.md`, `.github/`, or `scripts/`.
- `CLAUDE.md`, `PLAN.md:246`, and the guarantees' changelog name the old words only to explain the change.
- Lower-case `refraction` remains only in the storage keys, the fingerprint mark, the file-kind mark, package names, and the artifact file name `refraction-studio.html` (`apps/studio/scripts/make-artifact.mjs:24`).
- `docs/research/11-prescription-file-formats.md` exists under its old name, and nothing refers to it by a renamed path.

**Hard rule 8**
- No claim of "WCAG compliant", "ADA compliant", or "accessible" about output in the core, the Studio, the Fit check, the commands, the manifest, or the receipts. "Accessibility guideline" appears only as the name of a source.

**Stored trial**
- Trial 003's stored receipt equals a fresh run, byte for byte.

