# Drift-and-truth audit — 2026-11-13

Reviewer: the drift and truth auditor (red team). I compared what the project says with what the repository contains.

## What I audited, and how

**Commits.** I audited commit `0a972bd` in depth (13:13 UTC). The builder committed twice while I worked (`7303ba0` at 13:34, `0400121` at 13:39), so I re-checked every finding against `0400121`. Each finding holds at `0400121` unless it says otherwise. When I finished, HEAD was `0400121`, and two uncommitted files sat in the working tree: `docs/research/09-sleek-finish-recipes.md` and `docs/research/data/sleek-recipes.json`, both created at 13:51.

**Method.** I read every governing file, all code in `packages/core` and `apps/studio`, the CI file, `phase0/`, and `docs/research/01`–`08`. I ran `npm run typecheck`, `npm run lint`, `npm run boundaries` and `npm test` at both commits. I read CI results from GitHub. In a scratch folder outside the repository I did five more things:

1. Built the Studio from each commit and drove it in headless Chromium.
2. Ran probe scripts against the engine (the "probe" results below).
3. Planted 28 defects, one at a time, in copies of `packages/core` and ran the unit tests against each.
4. Read the copyright and licence fields inside the 13 bundled font files.
5. Ran `npm audit` on a copy of the committed lockfile.

I changed no file in the repository except this report.

**Short references.** `research/04:19` means line 19 of the file in `docs/research/` whose name starts with `04`. `steps.ts`, `directions.ts` and `types.ts` are in `packages/core/src/catalog/`; `engine.ts`, `tokens.ts`, `color.ts` and `params.ts` are in `packages/core/src/`; `smallBusiness.ts` is in `packages/core/src/templates/`; `core.test.ts` is in `packages/core/test/`; `App.tsx`, `store.ts`, `platform.ts`, `preview.tsx` and `fonts.ts` are in `apps/studio/src/`; `studio.e2e.ts` is in `apps/studio/e2e/`.

**Severity.** Blocker: a claim that is false, or a hard rule broken in a way that matters. Major: fix within the milestone. Minor: fix when convenient. Note: for the owner's information.

## Counts

| Area | Blocker | Major | Minor | Note |
|---|---|---|---|---|
| M. Milestones and scope | 1 | 5 | 5 | 2 |
| P. Defects found while checking claims | 0 | 4 | 6 | 2 |
| T. Truth of claims | 0 | 2 | 4 | 2 |
| X. Tests | 0 | 2 | 6 | 0 |
| C. Catalog honesty | 1 | 4 | 2 | 2 |
| W. Defined terms | 0 | 0 | 8 | 1 |
| R. Hard rules | 1 | 1 | 2 | 0 |
| L. Licences and notices | 0 | 1 | 2 | 2 |
| O. Other | 0 | 0 | 0 | 5 |
| **Total (73)** | **3** | **19** | **35** | **16** |

## The five findings that matter most

1. **The Catalog cites sources that nobody read** (C-01, C-03, C-05, C-02). Three Steps point to a research record that did not exist when they were written. 54 Options tell the owner a design is "Seen in" a named company or system; 31 of those have no supporting passage, and 35 name Linear, Stripe or Apple, whose pages the project's own records say were never read. Both Steps labelled "Measured in studies" overstate.
2. **Milestone gates did not hold** (M-01, M-02). M3 counts as done, but its exit test (a pixel-difference test) does not exist. M2, M3 and M4 were built while M1's CI run was failing.
3. **No red-team review ran before this one** (R-12). The findings log has no rows at any commit, though its first line says reviewers run at every gate.
4. **"Enforce" is not tested and has real holes** (X-01, X-02, P-01, P-02). The three Enforce assertions cannot fail; 23 of 28 planted defects pass the unit suite. The focus ring is invisible (1.0:1) on a painted first screen. On dark colour-block designs, Enforce lowers an outline button's contrast to between 1.1:1 and 1.8:1 and reports it as "adjusted … to meet 4.5:1".
5. **Saved work can be lost** (P-05, P-04, M-07). A saved project that fails validation is overwritten at the next change. "Skip" after a Direction replaces the Direction's values. There are no migrations, and the saved shape has already changed once under version 1.

## Findings

### M. Milestones and scope

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| M-01 | blocker | M3 counts as done, but its exit test does not exist | `PLAN.md:164` sets the M3 exit test: "One token change alters exactly one variable (pixel-difference test)". No test compares pixels or screenshots at any commit. The stand-in, `core.test.ts:181-189`, compares token names for one Option of one Step. D8 (`DECISIONS.md:14`) makes screenshot comparison "a required CI gate"; `.github/workflows/ci.yml:24-39` has no such step. `PLAN.md:204` says the private-page host is "Verified at M3"; `PROGRESS.md:41` and `:46` say it is untested. Yet `PROGRESS.md:5` names M4 as the current milestone, `PROGRESS.md:18` lists M3 under "Done", and `WAYPOINTS.md:10` records an M3–M4 waypoint. No decision replaces the exit test. | Write the pixel-difference test and the D8 gate, or ask the owner to approve a different exit test and record it. Verify the host. Until then, show M3 as "built, exit test not met". |
| M-02 | major | M2, M3 and M4 were built while M1's exit test was failing (hard rule 1) | M1's exit test is "CI green" (`PLAN.md:162`). CI run 1, on `a539e59` ("M1-M2…", 12:45), failed at "Type check"; Lint, Boundaries, Unit tests and Dependency audit were skipped (GitHub Actions run 43427870625; `WAYPOINTS.md:9` says so too). That commit already holds M3's Mockup (`smallBusiness.ts`) and M4's Catalog (`steps.ts`, 18 Steps then). `PROGRESS.md` in that commit still said "Current milestone: M0". The M3–M4 commit `d0bdd9a` followed 26 minutes later as one unit. | Finish and gate one milestone at a time. Update `PROGRESS.md` before work on the next one starts. |
| M-03 | minor | M0's exit test is partly met: no scorecard | `PLAN.md:161` asks for "Screenshots, axe results, and scorecard reported". `phase0/RESULTS.md` reports screenshots and axe results. It scores nothing against the owner's 100-point scorecard (described at `research/03:116`). See also T-01. | Score both builds, or record that the scorecard was dropped and why. |
| M-04 | minor | M1's "session setup script" is missing | `PLAN.md:162`, `:205` and `:222` promise it. The repository has no such script, and the cloud environment "engine" reports none (environment lookup: `has_setup_script: false`). | Add it, or strike it from the plan with a decision. |
| M-05 | major | "Dependency re-checks" (M2 scope) are not built: a derived value goes stale | `PLAN.md:56`, `:163` and `:199` promise that reopening a Step re-checks later Decisions. `engine.ts:315-332` only evaluates 13 fixed pair rules. Probe: pick "Deep teal", then "Two colors, opposite" (`steps.ts:303` derives the second hue once), then go back and pick "Crimson". The accent hue becomes 18°; the "opposite" hue stays at 15°; the Decision still reads `duo-complement`; `conflicts()` returns nothing. Ink blue, then mustard, leaves the two "opposite" hues 10° apart. No test covers this. | Recompute or flag derived values when their input changes. Add a test. |
| M-06 | major | Floor checks cover text contrast on nine listed pairs only | `PLAN.md:53` lists contrast, target size and focus visibility, checked "before display". `tokens.ts:141-151` lists nine colour pairs (plus the painted first screen, `:171-177`). Nothing checks target size, or whether the focus ring shows where it is drawn. The Mockup also renders pairs that the list omits: text on the second surface tone, text over glows and glass, the "Solid band" signature, and the focus ring over painted areas. P-01, P-02 and P-03 are the results. | Derive the pairs from what the Mockup renders. Add focus-ring and target-size checks. Say on screen what was not checked. |
| M-07 | major | Saved projects: no migration, no past-version test, and the shape already changed under version 1 | `PLAN.md:151`. `engine.ts:415` accepts only `schemaVersion` 1; there is no migration code and no stored fixture. Between `a539e59` and `d0bdd9a` the saved shape gained required fields (`direction`, `atmosphere`, `buttonFinish`, `displayTreatment`, `motion`; `engine.ts:387-390`, `:419`) while `SCHEMA_VERSION` stayed 1 (`engine.ts:11`). Planted defects M08 and M09 (the schema drops fields) pass the suite. | Add a fixture file per version and a migration path before the owner saves real work. Raise the version on every shape change. |
| M-08 | minor | Planned parts of Stages 2–3 and Template 1 are missing and not listed as gaps | `PLAN.md:64-65` list "page type", "icon set" and "light, dark, or both". The Catalog has no page-type or icon Step, and the theme Step offers no "both" (`steps.ts:324-329`). `PLAN.md:102` gives Template 1 an inner page; the Mockup has one page (`smallBusiness.ts:401-473`). `PLAN.md:51` wants an exemplar on every Option; 51 of 115 have none. `PROGRESS.md:37-41` mentions none of this. | List them as gaps or record a decision. |
| M-09 | major | A Decision never records a reason | `CLAUDE.md:20` and `PLAN.md:57` define a Decision as picked Option, rejected Options, reason. `engine.ts:24` declares `reason` and `engine.ts:410` validates it, but no function sets it (`decide`, `:223-227`) and the Studio has no field for it. A fine-tuned Step with no earlier Decision also records an empty rejected list and the Step's default Option as its base (`engine.ts:260`; probe: "Poster Block" radius 0 tuned to 2 is recorded as "Subtle"). | Add the reason to the engine and the Step screen, or change the defined term with the owner's approval. |
| M-10 | minor | D14 is partly built | `DECISIONS.md:20`: "every derived token is hand-adjustable after a pick". The fine-tune panel adjusts 14 input parameters on 9 Steps. None of the 97 derived tokens is adjustable. | Build it or reword D14. |
| M-11 | minor | Several plan controls are absent and no file says so | No Content Security Policy or Trusted Types anywhere. No Dependabot file (`.github/` holds only `ci.yml`). Prettier is installed but never run: all 24 source files fail `prettier --check` (21 of 21 at `0a972bd`). No error boundary. No visual-regression gate (D8). The status tables below list each. | Add each or record a decision. List the rest in `PROGRESS.md`. |
| M-12 | note | Planned libraries were replaced by hand-written code without a decision | `PLAN.md:110` and `:119` name IndexedDB and utopia-core. The Studio uses `localStorage` (`platform.ts:57`, `:72`; D21 says only "browser storage"), and `tokens.ts:374-378` computes its own fluid type size. | Record each in `DECISIONS.md`. |
| M-13 | note | D23 puts fully decorated Directions before the Structure Steps | `PLAN.md:50` says the Mockup stays grayscale until Stage 3. `App.tsx:74` renders 14 full-colour Directions first. D23 (`DECISIONS.md:29`) does not mention the rule it overrides. | Add one line to D23. |

### P. Defects found while checking claims

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| P-01 | major | The focus ring is invisible on a painted first screen, in every contrast profile | With "Color block" the first screen is painted in the accent (`tokens.ts:110`) and the focus ring is the accent too (`tokens.ts:126`; drawn by `smallBusiness.ts:131`). Probe: ring against first-screen background is 1.00:1 for the default accent, and 1.02:1 for the curated Direction "Poster Block" under Enforce. 28 of 240 generated Directions use "Color block". `PLAN.md:53` names focus visibility as a floor check. | Choose the ring colour per background. Add the pair to the checks. Add a test. |
| P-02 | major | Enforce makes an outline button harder to read on a dark colour-block design and reports it as fixed | `tokens.ts:116-120` measures the label of an outline or soft button against the painted first screen, but the navigation and form buttons sit on the page or on a card. Probe (dark-deep, ink blue, colour block, outline): the label on the page is 1.80:1 with checks off and 1.20:1 under Enforce. Five accents on two dark themes give 1.13:1 to 1.79:1 under Enforce. The owner reads "Main button label on its background: adjusted from 3:1 to meet 4.5:1" (`App.tsx:37`). `conflicts()` flags nothing. `tokens.ts:157-159` labels an issue "repaired" before any repair runs. | Check each button against the surface it sits on. Set "repaired" only after measuring again. |
| P-03 | minor | Other rendered pairs fall short under Enforce | Probe over 129 cases (every Option alone, every Direction): the nine listed pairs all reach their target. Unlisted pairs do not: accent text on the second surface tone is 4.11:1 to 4.32:1 (8 cases); "Solid band" text on a vermilion accent is 4.43:1; the band label at 78% opacity (`smallBusiness.ts:235`) is 4.33:1 for "Two colors, opposite". | Add the pairs. Account for opacity. |
| P-04 | major | "Skip: take the default" replaces the Direction's values, and the default is not marked | `PLAN.md:56` defined Skip before Directions existed. `engine.ts:245-250` applies the Step's default Option. Probe: after "Midnight Aurora", skipping every Step changes 22 values and leaves the plain starting design, while the project still names the Direction. In the browser, Skip on "Light or dark" turned the saved theme from dark to light. No tile marks the default (`App.tsx:333-334`). In 83 of 308 Direction-and-Step pairs no Option matches the Direction's value, so no tile is marked "Current" and the large preview opens on the Step's default, not on the owner's design (`store.ts:111`). For "Light or dark" and "Heading style" that is all 14 Directions. `App.tsx:425` says "Undecided Steps keep the value from your direction", which holds only if the owner never presses Skip. | Make Skip keep the current value when a Direction is in use, or name the default on screen. Show the current design first. |
| P-05 | major | A saved project that fails validation is overwritten at the next change | `store.ts:139-143` starts a new project and shows a notice. The next change saves over the old data (`store.ts:116-119`, `platform.ts:72`). Browser run at both commits: I planted an old-format project; the banner appeared; one pick later the old data was gone. The Studio offers no way to export the unreadable data. With no migrations (M-07), any change to the saved shape will trigger this. | Keep the unreadable copy under another key and offer it as a download. |
| P-06 | minor | Autosave can lose the last Decision, and a failed save reads "Not saved yet" | `store.ts:100-106` waits 700 ms and does not save when the page closes. Browser run at both commits: 50 ms after a pick nothing is stored, and reloading at once loses the Decision. `App.tsx:24` shows "Not saved yet" both before any save and after a failed one. `platform.ts:45-63` prefers the page database even when the browser copy is newer. | Save when the page is hidden. Say "could not save". Compare `savedAt`. |
| P-07 | minor | No error boundary; a crafted address stops navigation | `store.ts:67` accepts `#constructor`, `#toString` and `#__proto__` as Step names, because `STEP_BY_ID` is a plain object. Browser run at both commits: "TypeError: t.options is not iterable", and afterwards links between views do nothing (the listener at `store.ts:149` is never attached). `apps/studio/src` has no error boundary. | Use `Object.hasOwn`. Add an error boundary. Test both. |
| P-08 | minor | Generated Directions carry names and moods that do not match the design | `engine.ts:189-190` records labels before `harmonize` changes values (`:192`), and `:213-216` builds the name and mood from those labels. Probe: 15 of 120 generated Directions describe themselves wrongly (for example "Soft layered shadow" in the name, `tonal` in the design). 55 of 240 share a name with another. `engine.ts:33` records a generated Direction by name only. | Build names from the final values. Store the seed. |
| P-09 | minor | Import accepts Step names that are not Steps | `engine.ts:434` tests `!STEP_BY_ID[id]`. Probe: Decisions keyed `constructor`, `toString` or `__proto__` pass. So does a Decision whose `optionId` does not exist, and a file whose Decision values disagree with its parameters. Content still renders as text, so this is a data-quality gap, not a script risk. | Validate keys with `Object.hasOwn`. Check `optionId` and values. |
| P-10 | minor | The owner's choice of the Studio's look is not saved, and the Studio is below its own target-size default | M4's exit test includes "you pick the Studio's own look" (`PLAN.md:165`). `store.ts:250-252` keeps the choice in memory. Browser run at both commits: the box is unticked after a reload. At `0a972bd`, 43 of 57 controls on the Step screen were under 44 px and two were under 24 px (D7, `DECISIONS.md:13`: 24 px floor, 44 px default). | Save the choice. Raise control sizes, or record why the Studio differs. |
| P-11 | note | "Closer to this one" offers twin Options after "Pill" | `engine.ts:286-293`: at radius 999 both neighbours clamp to 28, labelled "Radius: less" and "Radius: more". Hue neighbours are labelled "Hue: less" and "Hue: more". | Drop duplicates. Name hue moves by direction. |
| P-12 | note | The claude.ai save and download path has no test, and the host probe uses an unsandboxed frame | `platform.ts:24`, `:33-40` and `:94-108` depend on `window.claude`. The end-to-end suite runs a local copy where it is absent (`studio.e2e.ts:8`). `platform.ts:137-157` probes with a frame that has no `sandbox` attribute, so it does not test what the previews use. `PROGRESS.md:41` admits the host is untested. | Test on the real page. Probe with a sandboxed frame. |

### T. Truth of claims

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| T-01 | major | `phase0/RESULTS.md` reports a measured "yes" that its own data records as "false" | `phase0/RESULTS.md:14`: "Happy path reaches confirmation: yes / yes", under "Measured (machine checks…)". `phase0/results/b/metrics.json:207` records `"reachedSuccess": false` for Build B's success flow. The log shows the harness clicking "Prepare for a different issue" (`:256`) and walking the flow a second time. `phase0/results/b/flow-success-end.png` is byte-identical to `flow-success-step05.png` (the summary step), so no committed screenshot shows Build B's confirmation. Build B probably does reach it: the log heading at step 8 reads "Your preparation summary is ready.", and the slow flow records `true` (`:408`). But the committed machine check says otherwise. `RESULTS.md:7` says two harness defects were "fixed before the final run"; this is a third. | Fix the harness race, run again, and correct the row. Say which rows rest on logs and not on the pass/fail check. |
| T-02 | minor | `RESULTS.md` lists unmeasured items as measured, omits one result, and cannot be re-run from the repository | `RESULTS.md:15` "answers kept" and `:16` "completes once": `phase0/eval/measure.cjs:179` checks only confirmation text, failure text and a phone number. Both builds have one target under 24 px (`metrics.json:17` in each); the table reports only targets under 44 px (`RESULTS.md:29`). `measure.cjs:3` needs Playwright, which `phase0/package.json` does not declare (the machine has 1.63.0 installed globally). | Move unmeasured items to the "observed" section. Report the 24 px result. Declare Playwright. |
| T-03 | major | "Known gaps (stated plainly)" leaves out most known gaps | `PROGRESS.md:37-41` lists three. Not listed: no migrations or past-version test (M-07); no error boundary; no Content Security Policy; no Dependabot; no pixel-difference test or D8 gate (M-01); no setup script (M-04); Prettier unused; missing Steps (M-08); no reason on Decisions (M-09); stale derived values (M-05). `PLAN.md:176` says this file lets a fresh session resume "without guessing". | List every plan item that is absent or partial. |
| T-04 | minor | Reading claims say more than the records support | `PROGRESS.md:13` and `PLAN.md:226` say all 15 Drive files and every text file in both archives were read in full, with `map.pdf` "read visually". The records cover 11 loose files and 2 archives. `research/02:13` says `map.pdf` was "Not readable", and no record holds its content. `research/03:57-60` says 21 of 22 source notes were read as a digest, and four scripts as function lists. `PROGRESS.md:14` says "read the owner's links"; `research/07:22` and `:38` say one was read at index level and one not at all (the earlier wording, "four of the owner's five links", was accurate). `PROGRESS.md:14` also says "verified token values from 37 open design systems"; `research/08:3` says "Nobody has reviewed it yet", and the 37 sources include skills, fonts and blog templates. | Reword to match the records. |
| T-05 | note | "M2 core engine with 27 unit tests" | `PROGRESS.md:17`. The suite has 27 tests today. The M1–M2 commit had 22; five arrived with M3–M4. | Reword. |
| T-06 | minor | Standing documents are stale | `CLAUDE.md:54` and `PLAN.md:110` still list TypeScript 7.0, React Aria Components, culori, Playwright 1.65 and IndexedDB (see D16, D17, D22, M-12, L-05). `CLAUDE.md:59-66` omits `docs/knowledge/`, `scripts/` and the end-to-end folder. `PLAN.md:27` says no Option that fails an accessibility floor is ever offered; D13 ended that, and "Advise" is the default (`engine.ts:41`). `research/07:13` says CI enforces visual-regression review and a performance budget; it does not. `PROGRESS.md:30-35` still describes two finished research jobs as running, and `:46` still says "verify at M3". | Update each file, or add a dated "superseded by D…" line. |
| T-07 | note | Statements the repository cannot confirm | Owner approvals (D12–D14, D18, D19, D23, and "yes to all" for D16, D17, D22, D26) exist only as the builder's entries. `WAYPOINTS.md:10` says "private page published (version 1)"; the repository holds no address or record of it. `RESULTS.md:36` says Build B "listed every deviation itself"; the build's report is not in `phase0/`. | Keep the evidence (a link, the pasted report) beside each claim. |
| T-08 | minor | D24 calls itself "consistent with D13" but changes what "Off" means | D13 (`DECISIONS.md:19`): "Off (no checks)". D24 (`:30`) adjusts link colour in every profile, and `tokens.ts:116` and `:124` do so. The Studio's tooltip still says "Off: no checks" (`App.tsx:57`). D24's approval column says "Recorded", not "Owner". | Ask the owner. Fix the tooltip. |

### X. Tests

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| X-01 | major | The three "Enforce" assertions cannot fail | `core.test.ts:52`, `:97` and `:202` assert that every issue's outcome is "repaired". `tokens.ts:157-159` sets that outcome from the profile alone, before any repair. `core.test.ts:54` checks only that one token differs, and the comment at `:53` concedes that the repaired values are not measured again. Planted defect M01 (Enforce repairs nothing except link text) passes all 27 tests. | Measure every pair again from the emitted tokens and assert the target. |
| X-02 | major | The unit suite misses most planted defects | 23 of 28 survive (list below). Among them: body text set to the background colour (M20); an inline script in the Mockup when motion is "Expressive" (M16); a focus-ring token equal to the background (M17); a 10 px target-size token (M18); every conflict rule but one deleted (M10). By my reading, the end-to-end suite added at `7303ba0` would catch four of the 23 (M04–M07). I did not run it against the planted defects. | Add the missing assertions. Start with the top-ten list below. |
| X-03 | minor | "One variable per Step" does not test its first claim | The title at `core.test.ts:75` says "all Options of a Step set the same parameters". Line `:78` computes the sets; `:81` only asserts that a Step has Options. Planted defect M11 passes. "Use of color" Options do set different parameters (`steps.ts:301-307`), and "Light or dark" changes two variables at once, theme and contrast (`steps.ts:325-328`). | Assert equal sets, or rename the test and record the exceptions. |
| X-04 | minor | Colour-math tests are too weak for what they name | "maps out-of-gamut colors into gamut without changing hue" (`core.test.ts:23-26`) only checks that the result looks like a hex colour; M03 passes. "computes the WCAG contrast ratio" (`:19-22`) checks white on black and white on white; M02 (wrong luminance weights) passes. | Add mid-tone reference values and a hue check. |
| X-05 | minor | Hostile-content tests do not cover every text field | `PLAN.md:239` says "script in every text field". The unit test covers 5 of 21 content fields (`core.test.ts:171`); its `javascript:` assertion (`:177`) cannot fail, because the input holds no such text. The end-to-end test covers 13 (`studio.e2e.ts:213-217`). Neither covers `secondaryAction`, `servicesIntro`, `aboutTitle`, `aboutBody`, `contactTitle`, `contactBody` or `hours`. "Mockups contain no script" is asserted for one parameter set. | Loop over every field and every Direction. |
| X-06 | minor | "round-trips a valid project" checks only that parsing succeeds | `core.test.ts:151-155`. M08 and M09 (the schema drops `footerNote`; drops the rejected list and the reason) pass. A dropped content field would then break rendering. | Compare the parsed project with the original. |
| X-07 | minor | Twelve of thirteen conflict rules and every harmony rule have no test; one rule was removed to make a Direction pass | Only `outline-thin` has a positive test (`core.test.ts:134-141`). M10 and M12 pass. The test once covered `hard-pill`; `d0bdd9a` deleted that rule and rewrote the test when the new Direction "Sticker Pop" violated it (D25, `DECISIONS.md:31`: "the rendered result looks sound"). `mono-mono` (`engine.ts:321`) cannot fire through the Catalog. | One positive test per rule. Record who judged D25, and how. |
| X-08 | minor | The end-to-end tests (added at `7303ba0`) prove less than `PROGRESS.md:20` suggests | The keyboard test allows up to 220 Tab presses per target (`studio.e2e.ts:91`) and skips stops where nothing has focus (`:96`). My run at `0400121`: 56 to 57 presses from page load to the first Option, 17 of them inside the preview; about 33 with the new "Skip the preview" button. "Phone width" is 400 px (`:278`), not the project's 375 and 320 (D7). My own run found no overflow at either width. The axe test reports only serious and critical findings, on four views, in one theme (`:268-269`). | Assert a press budget. Use 375 and 320. Say "serious or critical" in `PROGRESS.md`. |

**Planted defects (unit suite at `0400121`).**

- Survived, 23: M01 Enforce repairs nothing except link text · M02 wrong luminance weights · M03 gamut mapping removed · M04–M07 escaping removed from the lede, the promise, the facts, the contact block · M08 schema drops `footerNote` · M09 schema drops rejected list and reason · M10 all conflict rules but one deleted · M11 one Option sets fewer parameters than its siblings · M12 harmony rules removed · M13 wireframe keeps colour strategy, theme and elevation · M14 "Closer" never narrows · M15 a "closer" pick records the Decision but does not change the design · M16 inline script in the Mockup when motion is expressive · M17 focus-ring token equals the background · M18 target-size token cut to 10 px · M20 text colour equals the background · M23 reduced-motion rule removed · M24 skip link removed · M25 form label detached · M28 generator ignores the designs it should differ from.
- Caught, 5: M19 Enforce repairs never reach the tokens · M21 fine-tune does not clamp · M22 Skip recorded as picked · M26 no rejected Options recorded · M27 any schema version accepted.

**Top ten untested risks.**

1. Whether Enforce reaches its targets on what the Mockup renders (X-01, P-01, P-02).
2. Loading a project saved by an earlier version (M-07).
3. Autosave, load and the unreadable-project path in the Studio, including the claude.ai `db` and `downloads` path, which no test reaches (P-05, P-06, P-12).
4. What each Option looks like: no screenshot or pixel test exists, so a style regression in any of 115 Options goes unseen (M-01).
5. Stale derived values after going back (M-05).
6. Hostile text in the seven uncovered content fields, and scripts in the Mockup for designs other than the default (X-05).
7. Twelve conflict rules and all harmony rules (X-07).
8. Generated Directions: names, duplicates, contrast and focus visibility (P-08, P-01).
9. Routing and crash handling: crafted addresses, no error boundary (P-07).
10. Colour math at mid-tones, on which every contrast figure rests (X-04).

### C. Catalog honesty

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| C-01 | blocker | Three Steps cite a research record that did not exist, and one cites company pages that the records say were never read | `steps.ts:341`, `:431` and `:452` say their recipes were "read from" sources in `docs/research/09`. No such file exists at any commit through `0400121`. The Catalog text was committed at 13:11 (`d0bdd9a`). An uncommitted `docs/research/09-sleek-finish-recipes.md` first appeared at 13:51, during this audit. `steps.ts:341` adds "Linear, Vercel, Stripe, Supabase marketing pages". `research/04:5` says those hosts "would not load"; `research/08:66` says "anything from Linear or Stripe (nothing open exists)"; `PROGRESS.md:47` says the company posts were "seen as search snippets only"; the new file names no Linear or Stripe page. The Studio shows these lines to the owner as "Sources" (`App.tsx:251`). | Cite only what was read. Rewrite the three source lines from a committed record. Remove the company pages unless someone reads them. |
| C-02 | major | Both Steps labelled "Measured in studies" overstate | The label text is at `App.tsx:9`. **Navigation** (`steps.ts:22`): the one measured fact, "Hidden menus get used far less than visible ones" (`:17`), reaches the repository through the owner's own report (`research/02:144`, "27% vs 48% use"; `:290`), not through Nielsen Norman Group, which nobody read. All four Options are visible navigation, so the fact does not separate them. **Page width** (`steps.ts:83`): the records give a range with no study, in two versions (45–75 at `research/01:58`, 45–80 at `research/02:361`). The Options change page width (`tokens.ts:396`), while line length stays fixed at 65 characters (`tokens.ts:397`). Each record opens with "Treat every figure as unverified". | Label both "Long-standing convention" or "Expert opinion", unless someone reads a primary source that bears on the Options. |
| C-03 | major | "Seen in:" states facts about named companies, mostly without a source | The Studio prints each `exemplar` under "Seen in:" (`App.tsx:310`). 64 Options have one; 54 name a company, product or design system. Of those 54: 12 have at least one name backed by a record read in full; 8 rest on search snippets or third-party write-ups; 3 are at odds with the project's own records; 31 have no supporting passage. The three at odds: `steps.ts:86` gives GOV.UK for a 740 px page (records: 960 px, `research/04:19`); `:201` gives Linear and Shopify admin for 15 px text (records: 13–14 px, `research/04:163`); `:392` gives Vercel and Linear for the ring edge (records credit Radix, Primer and others, `research/08:32`). 35 Options name Linear, Stripe or Apple, whose pages the records say were not read (`research/04:5`, `research/08:60`, `:66`). Two code comments repeat the pattern (`tokens.ts:200`, `:213`). `PROGRESS.md:47` says to read those pages "before authoring the Feel … Catalog"; the Feel Catalog is already written. `research/04:314` warns against presenting such values "as the companies' own". The 14 Directions use the safer "In the spirit of" (`App.tsx:84`, `directions.ts:13`). I found no claim of affiliation or of copying a brand anywhere. | Remove each unsupported name, or read the source and cite it. Prefer "in the spirit of". Fix the three mismatches. |
| C-04 | minor | Rankings and flat statements without support | "the most common AI-default opening" (`steps.ts:46`); "the single most common AI-default typeface" (`:156`, `params.ts:143`); "the most recognizable AI-default hues" (`:282`); "the classic AI-default background" (`:350`); "the most recognizable AI-default background" (`engine.ts:327`). The records list these as known signs (`research/01:195-201`, `research/02:456-460`, `research/04:294`) and call Inter "the most-cited" (`research/04:156`). None ranks them, and `research/04:302` says the one count study disagrees with itself. Also unsupported: "Left-aligned text is the easiest to read" (`:45`); "Capitals are slower to read" (`:180`); "Blue is the most common business color" (`:271`); "Overused in health care" (`:273`); "The most common radius today" (`:371`). | Say "a common sign", or cite a count. |
| C-05 | major | Step sources name works seen only as snippets or second-hand, without saying so (hard rule 13) | "Nielsen Norman Group" (`steps.ts:21`): through the owner's report only. "Josh Comeau on layered shadows" (`:386`): `research/04:82` marks it as a snippet. "Refactoring UI" (`:101`, `:240`): through a summary, `research/04:55`. "Apple guidance" (`:173`): a third party's write-up, `research/08:60`. "Linear theme model" (`:321`), "Linear (hairlines)" (`:411`), "Polaris and Linear (dense)" (`:121`): snippets, `research/04:15`, `:20`. "exemplar accents (Stripe, Linear, …)" (`:267`): none in the records. The quotation from the Anthropic skill (`:471`) comes through the owner's manual (`research/02:426`, `:683`). "WCAG 2.3.3" (`:493`) appears in no record. Five Steps cite the owner's Training Manual, which the owner's own reference grades D and marks "do not use as governing reference" (`research/02:110`, `:627`). | Mark each source "read in full", "search snippet" or "owner's file", or drop it. |
| C-06 | minor | Catalog text describes the tool or the evidence inaccurately | "the tool darkens link text when accessibility is on" (`steps.ts:276`, `directions.ts:187`): the tool darkens links to 3:1 in every profile, including Off, and to 4.5:1 only under Enforce (`tokens.ts:116`, `:124`, D24). "Good motion is fast (under a third of a second)" (`steps.ts:489`): the "Expressive" Option runs 480 ms plus up to 210 ms of delay (`tokens.ts:350`, `smallBusiness.ts:345-347`). "Shadows are nearly invisible on dark pages" (`engine.ts:328`; `:125` changes them silently in generated Directions): `research/08:46` records that sources disagree on this. The radius teaching text (`steps.ts:360`) describes the concentric rule; the code multiplies by 1.5 (`tokens.ts:406`). | Reword each. |
| C-07 | major | Directions, Options, conflict rules and harmony rules lack the record fields that hard rule 5 requires | Rule 5 (`CLAUDE.md:38`) and `PLAN.md:150`. All 22 Steps carry a source, an evidence grade and a review date. The 14 Directions carry none (`directions.ts:6-16`). The 115 Options carry text only; their 64 exemplar claims and 6 warnings have no source of their own (`types.ts:9-26`). The 13 conflict rules and the harmony rules are code with opinions in them (`engine.ts:110-147`, `:315-332`); D25 calls one of them "an untested assumption". Three Options hold functions (`steps.ts:303-305`), so the Catalog is not plain data. The record test checks text length only (`core.test.ts:64`, `:70`): any four characters pass as a source or a review date. | Move rules into records with source, grade and date. Validate the grade and the date. |
| C-08 | note | Two of six warnings name no replacement | `PLAN.md:54`. `steps.ts:46` (centered opening) and `:350` (aurora) give advice but no alternative Option. | Name one. |
| C-09 | note | The token data holds community look-alikes named after companies | `research/08:59`: the "Vercel", "Claude" and "Supabase" palettes are "community approximations, not official tokens". `PROGRESS.md:26` plans to use this data for more palettes. | Never show such a palette under the company's name alone. |

**Catalog claims, one by one.** Verdicts: *read* = backed by a record marked as read in full, or by token data copied from source; *snippet* = the record marks it as a search snippet or an unofficial write-up; *owner's file* = it rests on the owner's own documents as summarised (the owner's reference grades them C or D); *none* = no passage in `docs/research`; *at odds* = the records say otherwise.

| Where | Claim | Support in `docs/research` | Verdict |
|---|---|---|---|
| `steps.ts:17` | "Hidden menus get used far less than visible ones." | `02:144` "Visible navigation: 27% vs 48% use"; `02:290` "(86% vs 57% use)" | owner's file; primary source not read |
| `:25` | "This is the convention for small sites." | — | none |
| `:25`, `:28` | Seen in: GOV.UK, Stripe; Linear, documentation sites | `04:15` Linear sidebar, snippet, about the app | none; snippet |
| `:37` | The first screen "answers three questions in a few seconds" | — | none (opinion, labelled as such) |
| `:45` | "Left-aligned text is the easiest to read." | — | none |
| `:46` | Centered opening is "the most recognizable" and "most common" AI default | `01:195`, `02:457`, `04:294` list it as a sign | sign: owner's file and read; ranking: none |
| `:47` | "A stock photo here weakens trust." | — | none |
| `:45`, `:47` | Seen in: GOV.UK, Linear; Airbnb, Shopify | — | none |
| `:67` | "Three identical cards is a well-known AI-default pattern." | `01:195`, `02:457`, `04:210` | owner's file and read |
| `:65`, `:66`, `:68` | Seen in: Stripe documentation, Linear; Apple product pages; Apple, Linear feature pages | `08:60` "no Apple code"; `08:66` | none |
| `:78` | Lines stay comfortable at "about 45 to 75 characters" | `01:58` (45–75); `02:361` (45–80) | owner's file; two ranges; no study |
| `:86`–`:88` | "About 740 / 1,090 / 1,340 pixels" | `tokens.ts:396` (46, 68, 84 rem) | true of the tool |
| `:86`, `:88` | Seen in: GOV.UK, Medium; Apple, portfolio sites | `04:19` "960px page width" | at odds (GOV.UK); none |
| `:97`, `:101` | Squint test; sources "Refactoring UI" and the owner's protocol, question 5 | `02:472`, `02:505`; `04:55` snippet | owner's file; snippet |
| `:116`, `:121` | Dense suits tools, loose suits pages read once; "Polaris and Linear (dense) versus GOV.UK and Refactoring UI (generous)" | `04:308`; `04:15`, `:20` snippets | read for GOV.UK; snippet for the rest |
| `:125`, `:127`, `:128` | Seen in: Linear, Shopify admin; GOV.UK; Apple | `04:308`, `08:21` | snippet; read; none |
| `:139` | Serif "feels established", geometric sans "feels friendly" | — | none (opinion, labelled as such) |
| `:143` | "all fonts open-licensed" | 13 packages, licence field OFL-1.1 | true (checked in `node_modules`) |
| `:149` | Warm serif on cream "is becoming a recognizable AI look" | `01:197`, `04:313` | owner's file and read |
| `:153` | Space Grotesk "is a frequent 'alternative' AI pick" | `02:363`, `03:221` | owner's file |
| `:156` | Inter "is the single most common AI-default typeface" | `04:156` "the most-cited AI tell" | cited, not counted |
| `:147`, `:148`, `:156` | Seen in: GitHub; U.S. Web Design System; Linear | `04:15` snippet. The font's own copyright line names `uswds/public-sans`. | none; none in research; snippet |
| `:165` | Large headings look better tightened; capitals need space | `04:50`, `08:37` | read; capitals: none |
| `:173` | Source: "Emil Kowalski and Apple guidance" | `08:60` "a third-party … not Apple" | read (Kowalski); overstated (Apple) |
| `:180` | "Capitals are slower to read" | — | none |
| `:177`, `:179` | Seen in: Vercel, Linear; Apple | — | none |
| `:197` | "GOV.UK (19 px body)" | `04:19`, `08:21`; token data, base 19 | read |
| `:197` | "Polaris (dense)" | `04:20` | snippet |
| `:201`, `:203` | Seen in: Linear, Shopify admin (15 px); GOV.UK (19 px) | `04:163` "Dense, 13–14px (Polaris, Linear)" | at odds; read |
| `:213`, `:217` | Even-width digits keep columns steady; sources Vercel guidelines, Jakub Krehel | `04:48` | read |
| `:223` | Monospace labels on a consumer site "are a known AI tell" | `01:201`, `03:220` | owner's file |
| `:222` | Seen in: Stripe, Vercel | `04:17` (the guideline) | read for Vercel; none for Stripe |
| `:232` | "A neutral is rarely pure gray." | `08:31` | read |
| `:245` | Cool slate is "The most common choice" | — | none |
| `:244`–`:248` | Seen in: Vercel; Radix "slate", Linear; Radix "sand", "sage", "mauve" | `08:13`, `08:31`; `08:59` (Vercel palette is a community approximation) | read for the Radix names (values not compared); none for Vercel and Linear |
| `:258` | "One committed accent beats several timid ones." | — | none (opinion) |
| `:267` | Source: "exemplar accents (Stripe, Linear, GOV.UK, Radix)" | `08:66` | none for Stripe and Linear |
| `:271`, `:273` | "Blue is the most common business color."; teal is "Overused in health care." | — | none |
| `:276` | "the tool darkens link text when accessibility is on" | `tokens.ts:116`, `:124` | inaccurate (C-06) |
| `:282` | Violet and indigo are "the most recognizable AI-default hues" | `01:195`, `02:456`, `04:294` | sign: supported; ranking: none |
| `:283` | Seen in: Vercel (graphite) | `08:59` | none |
| `:292` | "A common guide is 60-30-10" | `02:368` | owner's file (graded D) |
| `:303` | "Opposites vibrate when they touch" | — | none |
| `:301`, `:302` | Seen in: Vercel, Apple; Stripe, Linear | — | none |
| `:316` | Crisp contrast "is easier to read in bright light" | — | none |
| `:321` | Sources: "Linear theme model"; "Master Guide §13 on dark mode" | `04:15` snippet; `01:59` "offer both" | snippet; owner's file (the Step offers no "both") |
| `:328` | "Near-black with one acid accent is a recognizable AI look." | `01:198`, `04:313` | owner's file and read |
| `:327`, `:328` | Seen in: Linear; Vercel | — | none |
| `:337` | "The well-made versions are barely there." | none at any commit | none (opinion) |
| `:341` | Source: `docs/research/09`; "Linear, Vercel, Stripe, Supabase marketing pages" | file absent; pages unread | false (C-01) |
| `:350` | Purple-and-blue aurora "is the classic AI-default background" | `02:396` "The AI default look" | owner's file |
| `:345`–`:350` | Seen in: GOV.UK, Apple; Vercel, Supabase; Linear, Stripe; Linear, Raycast; Stripe | `04:26` Raycast, snippet, unofficial; `04:16` Stripe, snippet, a third party's reconstruction | none, except two snippets |
| `:360`, `:365` | Nested corners look parallel; source "Concentric radius rule (Vercel, Jakub Krehel)" | `04:81` | read (the code approximates it, C-06) |
| `:369` | Zero radius with hairlines "is a known AI cluster" | `01:199` | owner's file |
| `:371` | 8 px is "The most common radius today." | `08:35` "controls 4–8px" | partly |
| `:370`–`:372` | Seen in: GitHub (3 px); Linear, Stripe (8 px); Apple (14 px) | token data, `exemplar-tokens.json:1889-1895`: Primer small 3 px, default 6 px. `04:314` warns against such attributions. | partly (GitHub); none |
| `:382` | Good shadows are layered and tinted; "a single gray blur" looks machine-made | `04:82`, `04:294` | read (as a practitioner's rule) |
| `:386` | Source: "Josh Comeau on layered shadows" | `04:82` marks it a snippet | snippet |
| `:392` | Ring and whisper is "The most refined all-round choice." | — | none (opinion stated as fact) |
| `:391`–`:397` | Seen in: Linear, GitHub; Vercel, Linear; Stripe, Apple; Apple; Gumroad; Apple, Raycast; Material 3 | `08:32` credits the ring to Radix, Primer and others; `02:390`, `04:85`; `08:20`, `02:373` | at odds (ring); snippet (glass); partly (Material 3); none for the rest. Gumroad appears in no design record. |
| `:411` | Sources: "GOV.UK (2 px form borders); Linear (hairlines)" | `04:19` | read (GOV.UK); none (Linear) |
| `:416`, `:417` | Seen in: Linear; GOV.UK | `04:19` | none; read |
| `:427` | The main button is "the most-pressed object on the page" | — | none |
| `:431` | Source: `docs/research/09` | file absent | false (C-01) |
| `:437` | "Colored glow on every element is a known AI tell" | `04:294` | read |
| `:435`–`:439` | Seen in: GOV.UK, Stripe; Linear, Raycast; Notion, Radix Themes | `08:42` (GOV.UK's button moves down 2 px); `08:13` | partly (GOV.UK, Radix Themes); none for the rest |
| `:448` | A quiet sheen "reads as refined"; a loud gradient "reads as a template" | — | none (opinion) |
| `:452` | Source: `docs/research/09` | file absent | false (C-01) |
| `:458` | Gradient headline text "is one of the most recognizable AI defaults" | `02:456` | owner's file |
| `:457` | Seen in: Linear, Vercel | — | none |
| `:467` | "The best-made sites are restrained everywhere except one place." | `04:13-32`, "Signature move" column, mostly snippets | snippet |
| `:471` | Quotation "one orchestrated moment"; "bold choices spent in one place" | `02:426` (through the owner's manual; `02:683` calls that second-hand); `02:447` | owner's file |
| `:477` | Decorative numbering "is a known AI tell" | `02:459`, `03:218` | owner's file |
| `:489` | Good motion is under a third of a second, and shorter when seen often | `04:88-98` | read (the tool's own "Expressive" runs longer, C-06) |
| `:493` | Sources: Kowalski, Krehel, Carbon; "WCAG 2.3.3" | `04:87-115`, `08:19` | read; "2.3.3" in no record |
| `:499` | Fade-and-rise on every section "is a known AI tell" | `04:294` | read |
| `:497`–`:499` | Seen in: Superhuman; Linear, Stripe; Apple, Family | `04:25`, `04:24` snippets. `04:16` quotes Stripe arguing for animation. | snippet; none; snippet |
| `directions.ts:27`, `:41`, `:81`, `:108`, `:148` | "In the spirit of" Vercel, Linear; Raycast, Linear; Apple; Gumroad; Linear, trading terminals | — | framed as resemblance; no record exists |
| `directions.ts:121` | "Teal in health care is common" | — | none |
| `engine.ts:329`, `:330` | Warm serif on cream, and near-black with acid green, are recognizable AI looks | `01:197-198` | owner's file |

### W. Defined terms

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| W-01 | minor | "default" has three meanings on screen | (a) The Step's default Option: "Skip: take the default" (`App.tsx:352`), "Default taken" (`:333`). (b) An overused look: "Common default" (`:280`, `:334`), and "AI default" across the Catalog. (c) The starting values with no Direction: "Neutral defaults" (`:146`, `:437`). On "First screen" the badge "Common default" sits on "Centered" while Skip takes "Headline left". Meanings (a) and (c) also differ in 11 values (probe). | Keep "default" for (a). Call (b) "overused look" and (c) "plain start". |
| W-02 | minor | "Stage 1" means two things | `PLAN.md:63` and `PROGRESS.md:26`: Stage 1 is the Brief. `App.tsx:105`: "Stage 1 · Direction". | Renumber or rename. |
| W-03 | minor | Several verbs for one action; "picks" and "decisions" for one thing | "Pick" (`App.tsx:106`, `:343`); "Choose it when" (`:308`) and "choose" in five conflict messages (`engine.ts:318`, `:322-325`); "Start from" for picking a Direction (`:86`); "take" (`:352`). "These picks pull against each other" (`:281`) and "earlier picks" (`steps.ts:475`), against "Your decisions so far" (`:423`). The plan mixes them too (`PLAN.md:51`, `:56`). | One verb (Pick) and one noun (Decision). |
| W-04 | minor | "Mockup" never appears on screen; four other words stand in | "preview" (`App.tsx:77`, `:255`, `:277`, `:432`); "pictures" (`:525`); "reference page" (`:425`); "the page" in Catalog text (for example `steps.ts:78`). | Use "Mockup" for the Mockup. Keep "preview" for a view of it. |
| W-05 | minor | "design", "look", "direction" and "project" overlap | "replaces your current design" (`App.tsx:110`); "clears every decision in this project" (`:482`); "The Studio's own look" (`:472`); "a recognizable AI look" (`steps.ts:149`); "Pick a starting direction" (`:106`). None of the four is in the defined-terms table. | Define each, or reduce to two. |
| W-06 | minor | One setting has four names | "Accessibility … profile" (D13, `DECISIONS.md:19`; the tests; `a11y` in code); "contrast profile" (`PROGRESS.md:7`, D24); "Contrast checks" (`App.tsx:58`); "when accessibility is on" (`steps.ts:276`). The setting checks contrast only (M-06), so "Contrast checks" is the accurate name. | Use "Contrast checks" everywhere. |
| W-07 | minor | "adjusted" means two things | The owner's fine-tuning ("Picked, adjusted", `App.tsx:333`; "mark this decision as adjusted", `:360`) and the tool's automatic repair ("adjusted from … to meet …", `:37`; "(adjusted)", `:284`). | "Fine-tuned" for the first, "repaired" for the second. |
| W-08 | minor | The defined-terms table is out of date | `CLAUDE.md:19`: an Option is "one of the 3–4 concrete choices"; 10 of 22 Steps offer 5 to 13 (D14 allows wide sets, but the definition did not change; number keys reach only nine, `App.tsx:302`). `CLAUDE.md:25`: a Floor is "non-overridable (accessibility, …)"; D13 made the accessibility part optional. "Direction" (D23) and "Stage" are not in the table. `CLAUDE.md:20`: a Decision has a reason (M-09). | Update the table with the owner's approval (hard rule 2). |
| W-09 | note | Smaller slips | "Skip" has four uses (`App.tsx:118`, `:275`, `:352`, `:517`). Lowercase "step", "template", "catalog" and "decision" serve second concepts ("each step is the previous one multiplied…", `steps.ts:189`; "reads as a template", `:448`; "Fontsource catalog", `:143`; `DECISIONS.md` itself). Defined terms are capitalised unevenly on screen ("Steps", but "decisions", "option", "direction"). "Catalog", "harmony rules" and "milestone" reach the owner unexplained (`App.tsx:117`, `:425`). | Tidy in one pass. |

### R. Hard rules

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| R-02 | major | Three stack substitutions were acted on before the owner acknowledged them (hard rule 2) | D16 and D17 were recorded "Pending owner acknowledgment" in `a539e59` (12:45). That commit already pinned TypeScript 6.0.3 and shipped `color.ts` in place of culori. D22 was recorded pending in `d0bdd9a` (13:11), the commit that built the Studio on native controls. The approval ("yes to all") was recorded in `7303ba0` (13:34). `node_modules` still holds empty `@internationalized` and `@react-types` folders dated 13:02, which fits React Aria being installed and then removed. Also "Recorded" without approval: D15 (no pull request, against `PLAN.md:247`), D24 (T-08), D25 (X-07), and the items in M-12 and L-05. | Ask first. Where work already happened, say so in the entry. |
| R-07 | minor | No package check is recorded in `DECISIONS.md` (hard rule 7) | Rule 7 asks for existence, licence and maintenance checks, recorded there. `DECISIONS.md` has none. `research/05` covers some packages (Fontsource, axe-core, Playwright 1.65, dependency-cruiser) but not React, Zustand, Zod, Vite, Vitest, typescript-eslint, Prettier or `@types/node`. `7303ba0` added axe-core, Playwright 1.63.0 and `@types/node` with no entry. I checked the licence fields myself; all are permissive (see "Claims verified as true"). | Add one entry per batch of dependencies. |
| R-11 | minor | `PROGRESS.md` and `WAYPOINTS.md` lagged the work (hard rule 11) | `PROGRESS.md` was unchanged in `84f44f6` and `a539e59`, and went from "M0" to "M4" in one edit. `WAYPOINTS.md` gained its M0 and M1–M2 rows only in `0a972bd`, after M3–M4. Rows W2 and W3 each cover two milestones. No Drive snapshot exists for any waypoint (`WAYPOINTS.md:7-10`; D26 was approved at 13:34). The commits are pushed (local and remote heads match), and the rows are accurate. | One row per milestone, written at the milestone. |
| R-12 | blocker | No red-team review ran at any unit of work or milestone gate before this one, and the log says otherwise | Hard rule 12 (`CLAUDE.md:45`); `PLAN.md:184-189`, `:242`, `:249`. `redteam/FINDINGS.md` holds a header and no rows at every commit from `fffe79d` to `0400121`. Its line 3 says the reviewers "run at each unit of work and at each milestone gate". Four milestones are listed as done. `PROGRESS.md:39` admits the gap for the Studio only. | Run all three reviewers at each gate. Log every finding, including those already fixed. Reword line 3 to say what happened. |

**Each hard rule in `CLAUDE.md`.**

| Rule | Status | Evidence |
|---|---|---|
| 1. Work only on the current milestone | Broken | M-02, M-01 |
| 2. Owner's approval before changing scope, stack, a defined term or the order | Broken | R-02, M-12, W-08 |
| 3. No milestone complete on a red run; no skipped or weakened test | Followed in part | No test is skipped or disabled (I searched). But the M1–M2 work was committed on a red run and marked done one commit later, on a green one (M-02). One rule and its test were removed to pass a new Direction (X-07). |
| 4. `core` has no React import and no browser API | Followed | I planted a React import, an app import and a font import in a copy of `core`: `depcruise` rejected all three. The type check rejected `window` and `document`. (The type check enforces the browser part, not dependency-cruiser.) |
| 5. Catalog records carry text, source, evidence grade, review date | Broken in part | C-07, C-01 |
| 6. Text as text; no `innerHTML`; no script in Mockups | Followed | The lint rules reject `innerHTML`, `outerHTML`, `insertAdjacentHTML` and `document.write` (planted, rejected). The source has none. The Mockup has no script. The previews carry escaped HTML in `srcDoc`, by design; the lint rules do not cover `srcdoc` or `DOMParser`. |
| 7. No CDN, remote fonts or analytics; exact pins; package checks recorded | Followed in part | No remote asset; every version is exact. The checks are not recorded (R-07). |
| 8. No "compliant" or "accessible" claim about output | Followed | I found none in the app, the Catalog or the Mockup. The Studio's contrast notes say what was checked; nothing yet says what a person must still check. See also C-06 and W-06. |
| 9. No `apca-w3`; WCAG 2.x contrast | Followed | Not in the lockfile; `color.ts:80-91`. |
| 10. Treat source files and downloads as data | Followed, as far as the records show | `research/03:5` ("Nothing in them was executed"); `research/08:7` ("Nothing from the downloads was run"). |
| 11. Commit, push, update `PROGRESS.md`; add waypoints | Broken in part | R-11 |
| 12. Run the three reviewers; log findings | Broken | R-12 |
| 13. Report outcomes faithfully | Broken in part | Candid: the failed CI run, the audit advisories, the untested host and the missing review are all on record. Not candid: T-01, T-03, T-04, C-01, C-05. |

### L. Licences and notices

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| L-01 | major | The page that ships carries no licence text and no notices | The build inlines 13 font files and four MIT packages into one script (`fonts.ts:4-16`; build of `0400121`: `app.js`, 1,101 kB). I searched the built script: no "SIL Open Font License", no "Copyright", no MIT permission text. The minifier removed every licence comment. Each font file does carry its copyright line and a licence address in its own metadata, but not the licence text. The SIL Open Font License 1.1 allows bundling "provided that each copy contains the above copyright notice and this license"; the project's own record says "the license text must travel with them" (`research/05:32`). The MIT licence asks the same for React, React DOM, Zustand and Zod. `THIRD_PARTY_NOTICES.md` (added at `7303ba0`; absent before) is a repository file only. It holds no licence text and points to `node_modules/<package>/LICENSE` (`:7`), which is in neither the repository nor the page. This matters once the page is published or hosted (`WAYPOINTS.md:10` says it is), and for any future export that includes fonts (`FONTS.md`, `mockup.html`). I am not a lawyer; this is a reading of the licence texts. | Ship the full licence texts with the page (a notices view, or a kept comment block) and with every export that contains font files. |
| L-02 | minor | The generated notices file has errors | `THIRD_PARTY_NOTICES.md:22` gives no copyright for Source Serif 4, because that package's `LICENSE` begins "Google Inc."; the font file itself says "© 2014 - 2021 Adobe Systems Incorporated …, with Reserved Font Name 'Source'". `scripts/make-notices.mjs:15` cuts copyright lines at 160 characters (rows `:12-16`, `:18`, `:20-21` end in "..."). The bundled `scheduler` package (MIT) is not listed. CI does not check that the file is current. | Read the copyright from the font files. Do not truncate. List every shipped package. Verify in CI. |
| L-03 | minor | Two bundled fonts declare Reserved Font Names | Playfair Display ("with Reserved Font Name 'Playfair Display'") and Source Serif 4 ("Reserved Font Name 'Source'"); I read both from the font files. The licence bars a modified version from using a reserved name without the copyright holder's written permission, and it counts format changes and removed parts as modification. The Studio ships Fontsource's Latin-subset files under those names (`params.ts:152`, `:154`). The repository records no check of whether those subsets have such permission. | Check the upstream permission statements, or swap the two typefaces, before any export ships font files. |
| L-04 | note | Licence statements with no record behind them | `color.ts:2`, D17 (`DECISIONS.md:23`) and `THIRD_PARTY_NOTICES.md:36` call the colour constants "public domain"; no research record names their source. `THIRD_PARTY_NOTICES.md:36` says "No source text is copied"; I could not test that. The uncommitted `docs/research/09…` lists 27 sources as "copy with notice", so that sentence will need review when those recipes enter the Catalog. `PLAN.md:112` says licences were "verified"; `research/05:174-186` lists several it could not verify. | Record the source page for each statement. |
| L-05 | note | The tests use Playwright 1.63.0; the stack line says 1.65 | `package.json:34`; `CLAUDE.md:54`. Both versions exist on npm. No decision records the choice. | Record the reason. |

### O. Other things the owner should know

| ID | Severity | Title | Evidence | What should change |
|---|---|---|---|---|
| O-01 | note | The repository changed under review | `7303ba0` (13:34) and `0400121` (13:39) landed during this audit, and files changed in the working tree throughout. `7303ba0` mixes five topics in one commit. `0a972bd` ("Record waypoints…") also carries 639 lines of knowledge-base data. The fixes in `7303ba0` have no entry in `redteam/FINDINGS.md`. | Freeze a commit for each review. One topic per commit. |
| O-02 | note | Pace | The work from first commit to M3–M4 took 64 minutes (12:07 to 13:11). Owner approvals D12–D14, D18, D19 and D23 fall inside that hour. | The owner may want to confirm those entries. |
| O-03 | note | Bundle size and its budget | `app.js` is 1,101 kB; about 650 kB of that is font data. `scripts/check-size.mjs:4` sets the budget at 1,600 KB, so growth of almost half would pass. The Directions view holds 14 full documents (1.5 MB of markup) in the page. | Tighten the budget. Consider sharing fonts between previews. |
| O-04 | note | The default profile is "Advise", set in code | `engine.ts:41`. No decision records the default. The owner's own source assessment says "default to AA" (`research/02:641`). | Ask the owner. |
| O-05 | note | Dead or unused pieces | `data-stage` is written (`smallBusiness.ts:384`) and no rule reads it. `.btn-secondary` (`:152`) has no markup. `mono-mono` (`engine.ts:321`) cannot fire. `tslib` is installed but nothing requires it. | Remove. |

## Status of the plan's exit tests and controls (at `0400121`)

**Milestone exit tests (`PLAN.md:161-165`).**

| Milestone | Status | Why |
|---|---|---|
| M0 | Partial | Screenshots and axe results reported; no scorecard (M-03); one measured row misreported (T-01). The owner's confirmation is D12. |
| M1 | Met late; one deliverable missing | CI was red at the M1–M2 commit and green from `d0bdd9a` on. The boundary rule and hostile-content tests exist. No setup script (M-04). |
| M2 | Exit test met; scope partial | 27 unit tests pass; `core` imports no React. Dependency re-checks (M-05) and floor checks (M-06) are partial. |
| M3 | Not met | No pixel-difference test; no D8 gate; host unverified (M-01). Template 1 lacks its inner page (M-08). |
| M4 | In progress (not claimed complete) | The owner's trial is pending. An automated keyboard walkthrough exists since `7303ba0` (X-08). The Studio-look choice is not saved (P-10). Two planned Steps are missing (M-08). |

**Security table (`PLAN.md:139-145`).**

| Control | Status | Evidence |
|---|---|---|
| Zod validates every import against a versioned schema | Done, with gaps | `engine.ts:414-437`, used for file import and for the saved project (`store.ts:140`, `:255`). Gaps: P-09; no size limit before parsing. |
| Text renders as text | Done | `smallBusiness.ts:95-97` escapes every content field; the Studio uses React text. Test coverage: X-05. |
| No `innerHTML` (lint rule) | Done | `eslint.config.js:10-18`; planted and rejected. |
| Mockup frame sandboxed, no `allow-scripts`, no `allow-same-origin` | Done | `preview.tsx:65`, `:105`; every frame in the browser had an empty `sandbox`. Exception: the probe frame (P-12). |
| Mockups contain no script | Done | None in `smallBusiness.ts`. Tested for one parameter set (X-05). |
| Content Security Policy and Trusted Types | Absent | No policy in `apps/studio/index.html`, in the packaged page, or in any host file. |
| Few dependencies, exact pins, lockfile and `npm ci`, install scripts off | Done | `package.json`, `.npmrc:1-2`, `ci.yml:25`. |
| `npm audit` in CI | Done | `ci.yml:38-39` (high and above). |
| Dependabot in CI | Absent | `.github/` holds only `ci.yml`. |
| Actions pinned by commit hash | Done | `ci.yml:17`, `:20`; both hashes match the tags named in the comments. |
| No CDN scripts, remote fonts or analytics | Done | The built script holds no remote address that is fetched; the browser made no outside request. |
| Exporter fences content as data | Not yet applicable | Export is M6. |
| `/fit-suggest` output checked | Not yet applicable | M12. |

**Codebase rules (`PLAN.md:148-153`) and the CI list (`PLAN.md:177`).**

| Rule | Status | Evidence |
|---|---|---|
| TypeScript `strict` and `noUncheckedIndexedAccess` | Done | `tsconfig.base.json:7-8`. |
| ESLint with zero warnings | Done | `package.json` script `lint`; it passes. |
| Prettier | Absent in effect | Installed; no script, no CI step; 24 of 24 source files fail `prettier --check`. |
| Boundaries enforced | Done | `.dependency-cruiser.cjs:4`; planted and rejected. `zustand` would not be rejected. |
| Catalog as data, with a schema test | Partial | C-07. |
| Saved projects: schema version | Done | `engine.ts:11`, `:415`. |
| Saved projects: migrations; a test per past version | Absent | M-07. |
| Error boundaries | Absent | P-07. |
| Autosave after every Decision | Partial | P-06. |
| "Export my project" always available | Partial | Summary view only; nothing for an unreadable project (P-05). |
| The Studio obeys what it teaches | Partial | Its tokens come from the same engine (`theme.ts`). Control sizes and the look choice: P-10. |
| CI: type check, lint, boundary rule, unit tests, dependency audit | Done | `ci.yml:26-33`, `:38-39`. |
| CI: end-to-end tests | Done since `7303ba0` | `ci.yml:34-37`; runs 4 and 5 passed. |
| CI: axe | Partial since `7303ba0` | The Studio's own screens only; serious and critical only (X-08). |
| CI: bundle budget | Done since `7303ba0` | Loose (O-03). |
| CI: visual regression (D8) | Absent | M-01. |

## Claims verified as true

- `npm run typecheck`, `npm run lint`, `npm run boundaries` and `npm test` pass at `0a972bd` and at `0400121`. The unit suite has 27 tests.
- `WAYPOINTS.md` reports CI correctly: run 1 failed (`a539e59`), run 2 passed (`d0bdd9a`). Runs 3, 4 and 5 also passed. The four commit hashes in `WAYPOINTS.md` are right, and the local head equals the remote head.
- Six end-to-end tests exist and pass in CI.
- Counts in `PROGRESS.md`: 22 Steps (6 Structure, 16 Feel), 14 Directions, 8 depth styles, 7 atmospheres, 5 button finishes, 3 headline fills, 3 motion levels.
- "No console errors", "no horizontal scroll at phone width", "light and dark viewer themes": my runs at 1280, 768, 375 and 320 px, in both colour schemes, found no console error and no sideways scroll, at both commits. The repository itself held no record of that check before `7303ba0`.
- Every preview frame has an empty `sandbox` attribute. The Mockup holds no script. The page makes no outside request and loads no remote font, CDN script or analytics.
- The boundary rule, the type check and the lint rules reject what they claim to reject (I planted violations in a copy).
- No `apca-w3`, culori or React Aria in the lockfile. Contrast uses the WCAG 2.x formula.
- Every dependency version is exact. CI installs with `npm ci --ignore-scripts`.
- Both GitHub Actions are pinned to the commits that their comments name (checkout v5.1.0, setup-node v5.0.0).
- "9 moderate advisories, all from one glob-matching package inside the lint tool": confirmed (`minimatch`, through ESLint and typescript-eslint; the offered fix is a breaking downgrade). `npm audit --audit-level=high` passes.
- The stack versions exist on npm as stated: TypeScript 7.0.2, React 19.3.1, Vite 8.3.8, React Aria Components 1.22.1, Zustand 5.1.0, Zod 4.6.7, culori 4.0.2, Vitest 5.1.0, Playwright 1.65.0, axe-core 4.14.0. D16's reason holds: typescript-eslint 8.72.2, the latest, accepts TypeScript below 6.1 only.
- Licences of the direct dependencies, read from the installed packages: MIT (React, React DOM, Zustand, Zod, Vite, Vitest, ESLint, typescript-eslint, Prettier, dependency-cruiser, the React plugin, the type packages); Apache-2.0 (TypeScript); OFL-1.1 (the 13 fonts, each with its `LICENSE` file); MPL-2.0 (axe-core, unmodified, development only).
- D15: the remote has one branch.
- The allowed hosts listed in `PROGRESS.md:52` match the cloud environment.
- No "WCAG compliant", "ADA compliant" or "accessible" claim appears in the app, the Catalog or the Mockup. The M0 Prescription says "these are checks, not a conformance claim", and `RESULTS.md` lists what it did not check.
- No test is skipped or disabled; the source has no lint suppression and no `@ts-ignore`.
- In `phase0/RESULTS.md`, these rows match `metrics.json`: axe counts, error semantics, keyboard focus, overflow at 320 px, distinct sizes, colours and radii, shadows, icons, font families, targets under 44 px, file sizes, external requests.
- In the Catalog, records marked as read in full back these: GOV.UK's 19 px body text and 2 px form borders; even-width digits (Vercel guidelines, Jakub Krehel); the concentric radius rule; the motion rules of Emil Kowalski and Jakub Krehel; the Radix gray family names. "All fonts open-licensed" (`steps.ts:143`) is true. The page widths in the Catalog text match the tokens.
- axe found no violation on the default Mockup, and none on four of five Studio views in my run at `0a972bd` (one moderate heading-order finding on the Directions view).

## Not audited

- The knowledge base in `docs/knowledge/` (about 6,600 lines of JSON and two Markdown chapters) and its sources.
- The values in `docs/research/data/exemplar-tokens.json` against their sources (the "685 strings, 0 misses" claim), and whether Catalog numbers match that data.
- The uncommitted `docs/research/09-sleek-finish-recipes.md` and `sleek-recipes.json`, beyond a first read.
- The owner's source files. They are not in the repository, so I could not check the research records against them, nor whether any Catalog text copies a source.
- The published private page, and how the claude.ai host behaves.
- The owner's approvals and the blind judging.
- Screen-reader behaviour, first-time-user confusion, and security probing beyond what truth-checking needed. Those belong to the other two reviewers.
- The end-to-end suite on my machine (I relied on its CI result) and against the planted defects.
- How the 115 Options and 14 Directions look.
- The two M0 builds, beyond spot checks.
- Legal questions. My licence notes are a reading of the texts, not advice.
- Firefox and Safari.
