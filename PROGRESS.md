# Progress

A fresh session reads this file to learn where the project stands. Update it after every unit of work.

## Start here (written 2026-11-14, checked on 2026-11-15, for the next session)

**The one-minute picture.** The Studio lets the owner pick a starting look (38 Directions, most of them in several Skins), refine it over 23 Steps, switch on Overlays, and read the result back on a Summary with five research rules. It saves reliably. Since 2026-11-15 the Summary also lists twelve craft rules (fine details that the Studio adds by itself) and hands over a first slice of the Prescription: four files that an AI coding tool can build from. No AI coding tool has built from them yet; three files of the full Prescription are missing (milestone M6); the Studio has no Fitter (M7). Milestone M4 is open and waits for one thing that only the owner can do: the trial in `docs/trial-guide.md`.

**Where the work is.** The main line is `claude/brave-mayer-sawqz9`. The session of 2026-11-15 works on `claude/festive-mendel-lfnahh`, into the main line. The owner merged pull request CatCorner22/Frontend#9 on 2026-11-15 (it ended at feature F003, commit `cb25f08`). The later commits (features F004 to F011) are in the draft pull request CatCorner22/Frontend#10. The branch was not rebased after the merge, so that the commits named in `WAYPOINTS.md` stay reachable. The private page is https://claude.ai/artifact/PexMgowEAEAHZ9vpHw3uXc, Version 16 since 2026-11-15 (the build of commit `5b133bd`; it holds the craft rules and the first slice of the Prescription).

**First commands of a new session.**
1. `npm ci --ignore-scripts` (about 5 seconds).
2. `npm run check` (type check, lint, boundary rule, unit tests; under a minute).
3. Before any browser test on this kind of machine: `export PW_CHROMIUM=/opt/pw-browsers/chromium`. The installed browser is older than the pinned Playwright, and the tests find it through that variable. Never run `playwright install`.
4. `npm run e2e` (builds the page, then all browser tests; 15 to 25 minutes). Run it in the background and do not rebuild the page while it runs.

**Rules that changed how the work is done (all in `CLAUDE.md`).** After any change to code: `npm run check`. After any change to a screen, the Mockup, or saving: also `npm run e2e`. No commit of code until every check passes. Never weaken a test.

**Traps that cost time in this session.**
- `npm run visual:update` rewrites every stored picture. Afterwards restore the existing ones (`git ls-files -m apps/studio/e2e/baselines | grep png | xargs -r git checkout --`) and confirm that `styles.json` only gained entries.
- A new text on screen must pass the plain-words rule (`packages/core/src/catalog/words.ts`): no trade word outside round brackets, and none of the vague phrases (for example "research helper"). The unit tests now cover Skins, Overlays, and research rules; the browser walk covers every screen.
- The grade "measured" needs a source that was read in full. Nearly all research was seen as search summaries, so new records are "convention" or "expert opinion".
- A new screen changes the path: tests that walk from the last Step to the Summary pass through the Overlays.
- Four links in the top bar do not fit a 320-pixel window side by side; the row wraps.

**What does not travel to a new chat.**
- The earlier chat's memory and its scratch folder are gone. Everything needed is in this repository.
- The reviewers' own test scripts lived in that scratch folder and are gone. Their reports are in `redteam/reports/2026-11-14-*`, and every finding has a row in `redteam/FINDINGS.md`.
- No background job is running. One pull request is open: the draft CatCorner22/Frontend#10 (see "Where the work is").
- The private page keeps its address. A new chat republishes to it by passing that address; the address and the version number are in `WAYPOINTS.md`.
- The cloud environment is named "engine" (see "Environment notes" at the end of this file). Another environment may block hosts that this one allows.
- If a new chat is given a branch of its own, it starts from `claude/brave-mayer-sawqz9` and opens a draft pull request into it.
- The owner's standing preferences (active voice, one term per concept, every step and contingency explained) are in `CLAUDE.md`, section "Writing style".
- Three ready first messages for a new chat are in `docs/new-chat-first-message.md`.

**What the next session should do first.** CI runs 92 and 93 passed on 2026-11-14 (commits `a6c82ee` and `3908189`), so the main line is green. Read "Next" and "Waiting on the owner" below. If the owner has sent the ten trial answers, turn each named problem into a row in `redteam/FINDINGS.md` and repair the serious ones; M4 then closes on the owner's word and M5 starts with the Brief (the owner's own words in every preview).

## Current milestone: M4 (Step screen). Not complete.

**Why M4 is not complete.** Its exit test has three parts: the owner uses the Studio on the private page; a keyboard-only pass; the owner picks the Studio's own look. The keyboard pass runs as an automated test. The owner's trial has not happened; `docs/trial-guide.md` walks the owner through it in about 25 minutes and asks ten questions. The three major ease-of-use findings that stood in the way were repaired on 2026-11-14 (U2-06 and U3-05 fixed; U2-08 fixed in part, with the rest stated on screen in words). Overlays and research rules belong to M5 in the plan; the owner asked for them early (decision D52), and they were built before M4's exit test.

**Milestone status, stated plainly.**

| Milestone | Status |
|---|---|
| M0 | Exit test met after correction on 2026-11-13: the results file now matches the measured data; the scorecard is applied and marked as judged by a model. |
| M1 | Met late. CI was red when M2 work began (finding M-02). No session setup script (decision D32). |
| M2 | Met: 190 unit tests (2026-11-14); the core imports no React and no browser API. |
| M3 | Exit test met in CI since 2026-11-13 (pixel-difference tests, stored-picture gate). One part still open: nobody has confirmed that the private page shows the embedded pictures. |
| M4 | In progress: it waits for the owner's trial. |
| M4D | Built on 2026-11-15 (features F003 to F006); its exit test waits for the owner to make one Direction on the private page. |
| M5 | Started early by the owner's decisions D52 and D58: Overlays, research rules, and the first twelve craft rules are built. Not built: the Brief (requirement 2.7 is approved, decision D61), the floors, an inner page. |
| M6 | Started early by decision D58: a first slice of four files. Its exit test is not met (three files are missing; no validator has read `tokens.json`). |

## What exists

- **Core** (`packages/core`): 23 Steps (6 Layout, 17 Look and feel), 38 Directions in four groups and a Direction generator, 12 Skins, 6 Overlays, 5 research rules, 12 craft rules, the writer of the Prescription's first four files, the record of a Direction of the owner's own, 12 conflict rules and 11 harmony rules as Catalog records, token derivation with 29 measured contrast pairs, the Mockup for Template 1 (one page), saved-project format version 2 with a migration from version 1.
- **Studio** (`apps/studio`): Directions, Steps, Overlays, Summary, and Licences screens; storage that reads both saved copies and never overwrites what it cannot read; Undo; confirmations before work is replaced.
- **Checks in CI:** type check, lint, boundary rule, the unit tests (226 on 2026-11-15, after feature F011), licence-notices check, the browser tests (294 on the same day; on the Studio and on the Mockup; among them one stored-picture comparison per Direction and page part), bundle-size budget, dependency audit. After each Studio browser test, a check fails the test if the page met an error.
- **Red team:** first review on 2026-11-13: 137 findings (6 blockers, 55 major, 56 minor, 20 notes). Every finding has a status in `redteam/FINDINGS.md`. `redteam/tools/plant-defects.py` plants 39 defects; the unit suite catches 38.
- **Private page:** https://claude.ai/artifact/PexMgowEAEAHZ9vpHw3uXc (the version number is in `WAYPOINTS.md`).
- **Literal names (2026-11-13).** Every Step, Option, and slider in the Catalog now carries a name that says what a person sees (for example "Ring and whisper" became "Thin outline with a faint shadow"; "Accent color" became "Main color"). The "Contrast checks" choices read "Off", "Warn me", "Fix for me". Identifiers did not change, so saved projects open as before. No red-team review covered this change (D33).
- **Second red-team review (2026-11-13, decision D34).** Reports: `redteam/reports/2026-11-13-b-*.md`. 52 rows in `redteam/FINDINGS.md`, each with a status. Fixed and tested: kept copies are never replaced silently (S2-01); the original is kept when opening changes a saved copy (S2-02); a contrast "pass" now means the emitted colors pass (T2-01); "Start again" keeps the replaced project (U2-01); a second color follows the main color in every case (T2-02); sliders have names (U2-05); Undo says what it undid (U2-07).
- **Names of the Contrast checks choices.** The Studio shows "Off", "Warn me", "Fix for me". The code and older documents call the same three `off` / "Advise" and `enforce` / "Enforce".
- **Visual tests draw text the same way on every machine (decision D35).** CI runs 11, 26, and 27 failed because GitHub's machine applied font hinting and this one did not. The tests now fix that setting.
- **Plain words (2026-11-13, decision D38).** Every text the Studio shows was rewritten so that a reader needs no design vocabulary: the question, the teaching text, and the "one thing that changes" line of all 23 Steps; the Option texts, the overused-look warnings, the named examples, the messages about Decisions that pull against each other, the engine's own sentences, and the names of the contrast pairs. A trade word now appears only in round brackets, as a word to learn. Three unit tests and one browser test enforce the rule; the builder planted four defects and each test failed as it should. While planning, the builder found and fixed three defects of its own: 7 of the 12 messages about Decisions called Options by retired names; the engine said "accent color" where the Step says "Main color"; and the teaching text of "Text contrast" promised a figure that the notes show only for a failing pair.
- **Third red-team review (2026-11-13, decision D41).** Reports: `redteam/reports/2026-11-13-c-*.md`. 46 rows in `redteam/FINDINGS.md` for 51 findings (47 from the reviewers, 4 that the builder found; five notes share one row), each with a status. Fixed and tested: the Studio never saves over a copy that it could not keep (S3-01, decision D40); colors reach the page as exact digits, and a browser test measures the drawn pixels (T3-01, decision D39); "Fix for me" cannot stall just below a requirement (T3-02); "Put back" keeps a second color following (T3-03); a notice stays in view on a phone (U3-01); a hand-set value reads as words (U3-03, U3-04); the "Second color" slider shows only when there is a second color (U3-06).
- **The builder's own sweeps (2026-11-13).** Every check and all browser tests passed 5 times in a row in a clean copy, while three reviewers loaded the machine (the one failure seen once earlier did not recur). The defect-planting tool: 38 of 39 planted defects caught; the survivor (N04, "reports repaired without measuring again") cannot be told apart from correct code, because "Fix for me" repairs every pair in every design that the sweeps reach. The engine sweep takes every action the Studio can take.
- **Four new Directions and one new background Option (2026-11-13, decision D42).** “Vector Horizon” (futuristic), “Frontier Gazette” (American West), “Galactic Goth” (purple and deep red), and “Marquee Deco” (black and gold; the builder’s own addition). The Step “Background at the top of the page” gained “Field of stars”. With “Two colors” on a dark page, the band is now a deep shade of the second color. Three of the looks rest on search summaries only; the records are in `docs/knowledge/sources/`, with an index at `docs/knowledge/INDEX.md`.
- **Guarantees reference (2026-11-13).** `docs/reference/guarantees.md` states each guarantee that the Studio makes and names the test or decision behind it. A script checks its structure; nobody but the builder has reviewed its content.
- **Fourth red-team review, "campaign 4" (2026-11-13, decision D43).** A stricter method than the first three reviews: six independent attackers, a separate judge who reproduced every claimed failure, and a written charter fixed before the attack. Files: `redteam/campaign-4/` (charter, raw logs, the judge's findings, the report). Round 1: 58 attempts; 9 confirmed findings (none at the worst level, 2 at the second, 6 minor, 1 for information); no attempt ran code, injected markup, or sent a request. All 9 are fixed or corrected, each with a test; the retest round's result is recorded in `redteam/campaign-4/report.md`.
- **Why some browser tests failed once in a while (found 2026-11-13).** The tests placed their starting data through a script that read the browser's storage at the first instant of every page load. On a reload, the browser sometimes showed that script an empty storage (4 of 16 trials); the script then placed the starting data again and replaced what the Studio had written. This explains the one-time failures recorded earlier (the "dresses the Studio" test; the "really replaces an unreadable copy" test). The tests now place starting data from an empty page before the Studio opens. Without that script, nothing was lost in 410 reload trials (390 with a small write, 20 with the real storage filled to the brim). One limit stays: all trials used Chromium. The measurements are filed in `docs/knowledge/sources/browser-storage-across-reload-measurements.md`.
- **Retest round of campaign 4 (2026-11-13).** Four attackers and a second judge against the fixed Studio: 29 attempts. Eight of the nine round-1 fixes passed; F-2 failed in a narrow case. Six new findings (2 major, 4 minor): two tabs closing together could lose a kept copy; the Undo promise was untrue after 40 changes; a same-instant race between two tabs; a headline smaller than the section headings on three Directions; a Decision that rejected the Option it held; a "Go on" button that saved nothing. All are fixed on the branch `claude/harden-studio-review-fixes`, each with a test. No judge has retested these fixes yet.
- **Code review by nine reviewers (2026-11-13, decision D48).** 42 findings: 32 confirmed by a second reviewer, 4 refuted, 1 uncertain, 5 from the last reviewer. One was graded high: while the page's database was still answering, a tab switch, a reload, or typing replaced the saved project with an empty placeholder. Fixed, with a test that fails when the guard is taken out. Of the 38 findings that stood, 33 are fixed and 5 are fixed in part (each row in `redteam/FINDINGS.md` says what stays open). The full result: `redteam/reports/2026-11-13-d-code-review.json`.
- **The hardening branch (decision D45).** The owner merged pull request 8 into the main line `claude/brave-mayer-sawqz9` on 2026-11-14. The main line holds every hardening fix.
- **Stored data changed its form in two places (decision D46).** Each kept copy has a storage entry of its own; the browser copy carries a mark that names the save that wrote it. Older data is still read.
- **Undo (decision D47).** A run of typing or of slider presses is one Undo step; Undo remembers 100 steps; the dialogs state that limit.
- **Four rules of the core changed (decision D49).** A fixed second color stays fixed; a card shows what its pick gives; every corner value above 28 means "fully round"; on a dark page the "Lightness" slider offers only the part that changes the color. A gloss button looks slightly different.
- **Round 3 of campaign 4 (2026-11-14, decision D50).** Seven attackers and a third judge against commit `6cbd764`: 56 attempts. All seven round-2 repairs passed their retest. Ten new findings (2 major, 7 minor, 1 note), F-16 to F-25: a promise of a kept copy that rested on a replaceable copy; a typed reason deleted without a word; two tabs closing in the same instant; a project name that forged a sentence in a dialog; untrue or missing words when a hand-edited file opens. All ten are repaired in `639fb7f` and `8b263b7`, with 5 new unit tests and 14 new browser tests. No judge has retested these repairs. The machine restarted mid-round; `redteam/campaign-4/report.md` states what that changed.
- **One red CI run on the way (2026-11-14).** CI runs 64 and 65 (commit `e332093`) failed in one of the new tests: on a 320-pixel window the last button of a new notice ended below the visible part of the notice strip. The cause was in the Studio: the strip scrolled the notice into view once and did not do so again after its own look changed. Repaired in `147ff08`; CI runs 66 and 67 passed. The test passed on the builder's machine before the repair, so one machine's pass did not show this.
- **Speed (2026-11-14).** The builder timed every kind of action with the browser's own counters (`docs/knowledge/sources/studio-action-delay-measurements.md`). One action was slow: a change of the preview width (152 ms until drawn). It now answers after 48 ms; the work for the card pictures (80 to 110 ms in one stretch) still follows. Every other action is drawn within 24 to 72 ms. Memory stayed level over six walks through all Steps.
- **Seventeen more Directions (2026-11-14, decision D51).** On the owner's request, in three sets: Motel Neon, Ocean Drive, Mall Sunset, Quiet Orbit, Steady Steps; Malibu Sunset, Miami Beach Deco, Vegas Modern, Smoky Mountain Autumn, Childhood Nostalgia; Long Conversation, Before Dawn, Mountain Rhinestone, Field Manual, Blue Hour Chapel, Woody Creek Winter, Desert Fever. Eight honor a person or a book (Motel Neon, Blue Hour Chapel, Long Conversation, Before Dawn, Mountain Rhinestone, Field Manual, Woody Creek Winter, Desert Fever); no Direction carries such a name. Each is the builder's own composition from existing Options; no source was consulted, and no person has reviewed one. With "Warn me", none of the 17 starts with a contrast warning or a conflict. One reviewer (not three; D51) looked at the first five only; the last twelve had no reviewer, only the automatic tests and one look by the builder. The layout test found one real defect through "Miami Beach Deco" (a service box 5 pixels too wide at 1024 pixels with every slider at its highest); repaired in `fac22be`.
- **This machine's browser is older than the merged Playwright.** The browser tests take the installed browser's path from the variable `PW_CHROMIUM` here; CI installs its own and sets nothing. The stored pictures of the 17 new Directions were made with the older browser; CI compares them with the newer one.
- **Ease-of-use repairs and the saving table (2026-11-14, commit `d217d5e`).** Close-up card pictures on four Steps and notes in words on six (a pixel comparison found 39 card pairs that looked alike; 12 remain, each stated in words); the bar over the cards holds only the main button; one name for each thing; the 35 Directions of that day in four groups. `docs/reference/saving-table.md` lists every situation of a tab against every event, each cell with its test; writing it showed one real fault (a tab that opened while another tab saved), now repaired.
- **Skins (2026-11-14, decisions D52 and D54).** A Skin is the same Direction in other colors, with or without a color fade in the headline. 12 Skins. A Direction offers a Skin only where the Skin's color shows on something large and the Skin's text is true of what is drawn: 33 Directions offer 1 to 5 Skins, and five offer none (they paint their main color on small marks only, or it is nearly gray). A Skin is chosen on the Direction's card when a project starts; the project records it, and the Studio names it wherever it names the start.
- **Overlays (2026-11-14, decisions D52 and D53).** Six small helpers over the page: tooltip, "Are you sure?" question, notice after an action, error message beside a field, loading placeholder, main button that stays in view on a phone. A screen of their own between the Steps and the Summary; the preview draws each switched-on Overlay open, as a still picture without script. A project stores them as an optional list; a project without Overlays is stored exactly as before.
- **Research (2026-11-14, decision D52).** Four AI assistants wrote 76 records in four files (`docs/knowledge/kb-language-reading.json`, `kb-mathematics.json`, `kb-eye-and-beauty.json`, `kb-japanese-design.json`; overview in `docs/knowledge/03-research-of-2026-11-14.md`). The network blocked most research sites: nearly every study was seen only as a search summary, and nobody has reviewed the records. About 1.2 million tokens, measured.
- **Research rules (2026-11-14, decision D53).** Five findings turned into numbers that the Studio measures on the open design, shown on the Summary as "Holds" or "Does not hold" with the number, the reason, what a person must still check, and the sources: reading text size, the step between text sizes (both follow the owner's choices), and line length, line height, and the height of buttons (all three fixed by the sample website; the Summary says so). None is graded "measured". Four hold on every Direction and Skin (a unit test checks it); "Control Room" departs from the text-size rule on purpose. A sixth rule, on the number of strong colors, was taken out again: its measure could give one answer only.
- **Code review of this unit (2026-11-14).** Three reviewers and one skeptic who tried to refute each finding: 19 findings, all confirmed, 17 distinct (2 major, 10 minor, 5 notes); 666,551 tokens, measured. The two major ones were truthfulness defects: a research rule said "Holds" for links that it did not measure, and a fade Skin on five Directions faded into another color than its text named. All 17 are repaired or answered; `redteam/FINDINGS.md` has one row each, and the reviewers' texts are in `redteam/reports/2026-11-14-e-code-review.json`.
- **Japanese design (2026-11-14, decisions D52 to D54).** Three Directions ("Ink and Seal", "Unbleached and Indigo", "Plain Ground") and one Skin ("Indigo dye"), each citing the research records it draws on. The records describe a tradition, not experiments; every number in these looks is the builder's translation.
- **Fifth red-team review and the judge (2026-11-14).** Three reviewers (security attacker, confused first-time user, drift and truth auditor) on the running Studio and the code at commit `5e546e7`, and one judge who retested the ten repairs of campaign 4, round 3; 1,365,177 tokens, measured. Reports: `redteam/reports/2026-11-14-f-*.md`. **44 findings:** 1 graded blocker by the review's rule (a hint said "Each change is saved" while the Studio was not saving; the status line told the truth at the same moment and no work was lost), 10 major, 24 minor, 9 notes. The blocker and all ten major findings are repaired (two of them with a remainder that their rows state); of the rest, each row in `redteam/FINDINGS.md` says "Fixed", "Fixed in part", or "Open" with the reason. **The judge:** 2 of the 10 round-3 repairs passed outright (F-16, F-17). For the other 8 the original attack is repaired in whole or in part, and a variant of the judge's own reproduced a related fault. One of them matters for saved work: when several tabs close in the same instant, one tab's last change can still be lost (2 losses in 120 trials; 8 in 24 before the first repair). It is open (decision D54). No reviewer has looked at the repairs made after this review.
- **Records brought up to date (2026-11-14).** The stack line in `CLAUDE.md` names Playwright 1.65; decision D28 is replaced by D53; decision D54 records what the reviews changed; `PLAN.md` is version 2 with the states of Skins, Overlays, and research rules set to "built"; the guarantees reference is version 1.5 with 49 guarantees.

## Session of 2026-11-15

- **Set-up.** The branch `claude/festive-mendel-lfnahh` started at the main line's newest commit (`9c5cbe4`); 330 files; `npm run check` passed (190 unit tests).
- **The owner's decisions (D55).** 24 questions in the chat; the owner chose the recommended answer in each. `CLAUDE.md` now defines "Direction" and "Research rule", says that an Option is one of several, that a reason is optional, that the accessibility Floor is a choice per project, and that the screen calls the Mockup "Sample website". Decision D26 (the Drive backup) is retired.
- **Repairs of 2026-11-15.** The status line after an Undo back to the stored project (F-23); a kept Decision stays "kept" and names no Option by coincidence (F-24; a new rule in the engine, `heldOptionId`); the Summary says that "Control Room" departs from the text-size rule on purpose (U5-16); Dependabot waits 7 days (S2-06). 196 unit tests and 273 browser tests on 2026-11-15 after F002 (191 and 266 after the first three repairs); the full browser run of 2026-11-15 passed with 265, and the 266th (for F-24) was added afterwards and passed alone.
- **The verified build loop (decision D56).** The owner's skill is in `.claude/skills/verified-build-loop/`. `SPEC.md` and `feature_list.json` hold the work in hand: F001 (the C4-F18 repair) and F002 (the typefaces Playfair and Literata). The skill's hand-over entries go below, under "Build log".
- **Plan, version 3.** The Direction Creator is milestone M4D, straight after M4 (`PLAN.md` section 4.7).
- **The craft layer and the first slice of the Prescription (decisions D58 and D60; features F009 to F011).** Twelve craft rules in the Catalog; four files (`PRESCRIPTION.md`, `tokens.css`, `tokens.json`, `mockup.html`) written by the core and handed over on the Summary. See the three newest entries of the build log.
- **A code review that the owner started with `/code-review` was stopped by the owner before it reported.** No review of the repairs of 2026-11-15 exists yet.

## Build log (verified build loop; newest entry first)

- Date: 2026-11-16
- Feature worked on (ID): F013 (repairs after the sixth red-team review, part 2: every sentence of the Prescription and of a craft rule is true of the design in hand)
- Result: passes
- Commits: the commit "F013: ..." that holds this entry
- Evidence: `npm run check`: 247 unit tests passed (9 new: 4 on the craft rules, 5 on the Prescription). `npm run e2e`: 297 browser tests passed (1 new, 1 widened; 1,257 seconds). Tests first: the 4 new craft tests and the 2 changed ones failed before the repair; the 2 browser tests failed on the build from before the repair. The 5 new tests of the Prescription were run only after the repair. What changed: a craft rule's instruction and sentence are worked out from the design, and a rule that the design sets aside says so; three faults of the style sheet are repaired (a button with a hard shadow moved in a design without movement; reactions to the pointer did not ask for a fine pointer; the entrance was longer than the rule allowed and the rule did not say so); every craft rule is graded "expert opinion"; the reference page of the four files draws each switched-on Overlay; "what no program checked" follows the design; `mockup.html` is stored for two projects.
- What went wrong on the way: two of the builder's new tests were wrong at first. One looped over "every Option" through a field that an Option does not have, so it tested the plain start 80 times; the type check caught it, and it now reads each Option's real values. One forbade the words "on a light page" anywhere in the file, where an Option's own text holds them; it now reads the sentence about the grain.
- Open problems for the next session: a check of a craft rule is a search for text; it can still pass on a style sheet with a fault that nobody thought of. Words for a value that matches no Option are still missing in the file (U6-07). Thirteen named values that the sample website does not use stay in `tokens.css` (T6-12). The requirement says that `tokens.json` is grouped by role; the file groups by type (T6-09, for the owner).
- Next feature to build (ID): F014

- Date: 2026-11-16
- Feature worked on (ID): F012 (repairs after the sixth red-team review, part 1: no text from a file acts as an instruction; no file can break the list of own Directions)
- Result: passes
- Commits: the commit "F012: ..." that holds this entry
- Evidence: `npm run check`: 238 unit tests passed (12 new). `npm run e2e`: 296 browser tests passed (2 new, 1 changed; 1,260 seconds). Tests first: the 8 new tests of own Directions failed before the repair, each for its own missing part; the 3 browser tests failed on the build from before the repair and pass on the new build. The 4 new tests of the Prescription were written before the code but were not run in the failing state: they call functions that did not exist yet. Findings repaired: S6-01 (the blocker), S6-02, S6-03, S6-05 to S6-07, S6-09, S6-11, T6-04, T6-15; in part S6-04 and S6-08.
- What went wrong on the way: the first full run failed in one older test ("lets no project name or file name end the quotation ..."). The builder's change to the name cleaner had removed a space at the end of a cut name, and that test pins the Studio's sentence letter for letter. The cleaner now gives the Studio's sentences what it gave before, and only a stored name of an own Direction is trimmed. The older test is unchanged. A second full run passed.
- Open problems for the next session: a letter of another alphabet that looks like a Latin letter still passes as a new name (stated in the code and in row S6-04). The limit of 100 own Directions and the grade change are the builder's choices (decision D61, points 5 and 6), open to the owner's veto. Whether an AI coding tool obeys a fence is not tested. Findings S6-10 and S6-12 stay open.
- Next feature to build (ID): F013

- Date: 2026-11-15
- Feature worked on (ID): F011 (the owner downloads each of the four Prescription files from the Summary, or copies its text)
- Result: passes
- Commits: the commit "F009 to F011: ..." that holds this entry
- Evidence: `npm run check`: 226 unit tests passed. `npm run e2e`: 294 browser tests passed (1,254 seconds). Two new browser tests: every downloaded file, `mockup.html` included, equals letter for letter what the core writes for the stored project; a new Decision reaches the files; a project that started from a Direction of the owner's own names it. The plain-words browser test caught two faults of the new section before the full run (findings P9-01 and P9-02).
- A departure from the build loop, named by the sixth review (finding T6-18): features F009, F010, and F011 were built in one stretch and entered the feature list in one commit, already marked as passing; the history does not show them as failing first, and only F010's tests were written before its code.
- Open problems for the next session: the "Copy" buttons have no automatic test. The two file names `tokens.css` and `tokens.json` are set aside from the plain-words rule as names (decision D60, point 6, open to the owner's veto). The private page shows all of this since Version 16 (waypoint W11). No second reader has seen this unit (finding P9-05).
- Next feature to build (ID): none in the list. `PLAN.md` section 13 names what follows: the rest of M5 (the Brief, the floors, an inner page), then the rest of M6.

- Date: 2026-11-15
- Feature worked on (ID): F010 (the core writes the first slice of the Prescription as four files that agree with each other)
- Result: passes
- Commits: the commit "F009 to F011: ..." that holds this entry
- Evidence: 10 unit tests in `packages/core/test/prescription.test.ts`, 6 stored files (snapshots). Tests first: the test file was written before the writer and failed because the writer was missing. A read-through of the written file for a sample project found five wrong or unclear sentences, all repaired (finding P9-07); the largest: the file claimed that a program had checked the bundle's `mockup.html` for every craft rule when the program had checked other pages, so the writer now runs each check on the very page and reports what it found, over every Direction and every Option in a test.
- Open problems for the next session: no validator program of the Design Tokens format has read `tokens.json`; the test rests on the builder's reading of the format on 2026-11-15 (decision D60, point 4), so M6's exit test stays open. No AI coding tool has built from the files (finding P9-06). The sentence for a craft rule whose check does not hold has no test.
- Next feature to build (ID): F011

- Date: 2026-11-15
- Feature worked on (ID): F009 (the craft layer: twelve craft rules, each a Catalog record with a check that a program runs on the Mockup)
- Result: passes
- Commits: the commit "F009 to F011: ..." that holds this entry
- Evidence: 4 unit tests and 1 browser test. Every rule's check holds on the Mockup of each of the 38 built-in Directions, fails on an empty page, and fails when the rule's own detail is taken out of the Mockup. The Summary lists the twelve with what the open design gives. Eight rules are graded "convention" (research record 04, read in full), four "expert opinion" (the builder's own); none "measured".
- Open problems for the next session: a check reads the Mockup's style sheet and does not look at drawn pixels. No person has reviewed a craft rule. Two of the builder's new tests were wrong at first and were corrected (finding P9-04).
- Next feature to build (ID): F010

- Date: 2026-11-15
- Feature worked on (ID): F008 (hardening, part 3: the builder's look at all 38 Directions at phone and desktop width)
- Result: passes
- Commits: the commit "F008: ..." that holds this entry
- Evidence: 76 whole-page pictures (38 Directions at 1280 and 375 pixels), looked at on 23 sheets. Findings L8-01 to L8-05 in `redteam/FINDINGS.md`: three repaired (a promise box and a price list too narrow on a narrow page; a figure that broke into two lines; faded headlines that ended below 3 to 1 on four Skins, which closes finding T2-03), one left for the owner's judgment, one "held". `npm run check`: 212 unit tests passed (1 new). `npm run e2e`: 291 browser tests passed (2 new; 1,318 seconds). Each new test failed before its repair. No stored picture failed, so none was renewed.
- Open problems for the next session: decision D59 (a faded headline's ends stand at 3 to 1 in every setting) is the builder's choice, open to the owner's veto. Two of the new tests were wrong at first and were corrected before they were trusted. The stored picture of Ink and Seal's services part was not renewed, although the price list below it is wider now; the comparison still passed. The private page (Version 15) does not hold the F008 repairs. The look is no second person's review.
- Next feature to build (ID): none in the list. Requirements 2.5 (the craft layer) and 2.6 (the first slice of the Prescription) are written in `SPEC.md` and wait for the owner's approval; their features join the list after it.

- Date: 2026-11-15
- Feature worked on (ID): F007 (hardening, part 2: contrast notes of the built-in Directions)
- Result: passes
- Commits: the commit "F007: ..." that holds this entry
- Evidence: `npm run check`: 211 unit tests passed (2 new; both failed before the repair). `npm run e2e`: 289 browser tests passed (2 new; 1,301 seconds). A survey found that 9 of 38 Directions started with contrast notes under "Warn me". Now exactly three do (Poster Block, Sticker Pop, Sunlit Studio: links, by the owner's choice), a unit test pins them, and their cards say so. Stored pictures: 12 renewed, all of the six changed Directions; the style record changed only in the border color of form fields on the five dark Directions and in Frontier Gazette's colors. The owner received a before-and-after picture.
- Open problems for the next session: the rule that a form field's edge stands at 3 to 1 binds every design, also under "Off" (decision D57, open to the owner's veto). The owner has not yet said whether the before-and-after picture is acceptable. No independent review.
- Next feature to build (ID): F008 (the builder's look at all 38 Directions at phone and desktop width)

- Date: 2026-11-15
- Feature worked on (ID): F006 (hardening, part 1: own Directions are never lost without a word)
- Result: passes
- Commits: the commit "F006: ..." that holds this entry
- Evidence: `npm run check`: 209 unit tests passed (1 new). `npm run e2e`: 287 browser tests passed (4 new; 1,299 seconds). Found by the builder's own reading of the new code, and repaired: (1) a stored own Direction that this version cannot show (a name now in use, an unknown value) vanished from the list, and the next change wrote the list without it and kept no copy; the stored list is now kept first, and the Summary says how many are not shown. (2) Removing a Direction that another tab had removed said "Removed"; it now says that the Direction is no longer here, and the stale tab shows the stored list. (3) A date that is no date was stored as it came. (4) The download could hand over a file without saying that stored Directions were missing from it.
- Open problems for the next session: the four new tests were written before the repairs but were first run after them; one of them needs `.own-note`, which did not exist before, so it could not have passed. No independent review: the builder attacked its own code.
- Next feature to build (ID): F007 (hardening, part 2: contrast notes of the built-in Directions)

- Date: 2026-11-15
- Feature worked on (ID): F005 (rename, remove, download, and open own Directions; milestone M4D)
- Result: passes
- Commits: the commit "F005: ..." that holds this entry
- Evidence: `npm run check`: 208 unit tests passed. `npm run e2e`: 283 browser tests passed (4 new; 1,324 seconds). Script size 1,344 KB (budget 1,600). The four storage rows stood in the saving table before the code. The builder looked at pictures of the file section and of renaming on a card.
- Open problems for the next session: milestone M4D's exit test needs the owner to make one Direction on the private page, and the private page has not been republished with today's build. Own Directions are not in the private page's database. One new test was wrong in the test itself and was corrected. No independent review. A survey found that 9 of 38 built-in Directions start with contrast notes; the owner decided what to repair (requirement 2.4, features F006 to F008).
- Next feature to build (ID): F006 (hardening, part 1: own Directions are never lost without a word)

- Date: 2026-11-15
- Feature worked on (ID): F004 (keep a design as a Direction of the owner's own, show it under "Your own", start from it; milestone M4D)
- Result: passes
- Commits: the commit "F004: ..." that holds this entry
- Evidence: `npm run check`: 208 unit tests passed. `npm run e2e`: 279 browser tests passed (6 new; 1,306 seconds). Script size 1,340 KB (budget 1,600). The storage design stood in `docs/reference/saving-table.md` ("The owner's own Directions") before the code. The builder looked at pictures of the form and of the group "Your own".
- Open problems for the next session: own Directions live in the browser's storage only, also on the private page; until F005 nothing lets the owner download, rename, or remove one. Two of the six new tests were wrong in details of the test (a button's label; a heading drawn in capitals) and were corrected; the Studio's code was right. No independent review. The owner has not tried the form on the private page.
- Next feature to build (ID): F005 (rename, remove, download, and open own Directions)

- Date: 2026-11-15
- Feature worked on (ID): F003 (the record of a Direction of the owner's own, in the core; milestone M4D)
- Result: passes
- Commits: the commit "F003: ..." that holds this entry
- Evidence: `npm run check`: 208 unit tests passed (12 new, in `packages/core/test/ownDirections.test.ts`). `npm run e2e`: 273 browser tests passed (1,262 seconds); they ran because the cleaner of names moved from the Studio's code into the core (`packages/core/src/text.ts`), unchanged.
- Open problems for the next session: nothing on screen uses the record yet (F004). A project file still turns the identifier of an own Direction into "a generated Direction" on opening; F004 must let it stand. No independent review.
- Next feature to build (ID): F004 (keep a design as an own Direction, show it under "Your own", start from it)

- Date: 2026-11-15
- Feature worked on (ID): F002 (the typefaces Playfair and Literata in place of the two that reserve their names)
- Result: passes
- Commits: the commit "F002: ..." that holds this entry
- Evidence: `npm run check`: 196 unit tests passed (5 new). `npm run e2e`: 273 browser tests passed (2 new; 1,199 seconds). `node scripts/make-notices.mjs --check`: current; 13 fonts, none declares a Reserved Font Name. Script size 1,333 KB (budget 1,600). Stored pictures: 27 renewed (the nine Directions that use the two typefaces), every other picture unchanged; the style record changed in font names only.
- Open problems for the next session: the F002 tests were written before the code and were not run against the old code. One new test was too broad and was narrowed to the copyright notices. The test "never makes the page wider than a phone" timed out once in a full run (240 seconds); its limit is now 480 seconds and its assertions are unchanged; the owner was told and may object. No independent review. The owner has not yet seen the nine Directions in the new typefaces on the private page.
- Next feature to build (ID): F003 (the record of a Direction of the owner's own, in the core)

- Date: 2026-11-15
- Feature worked on (ID): F001 (finding C4-F18: a save that another tab replaces in the same moment)
- Result: passes
- Commits: the commit "F001: ..." that holds this entry
- Evidence: `npm run check`: 191 unit tests passed. `npm run e2e`: 271 browser tests passed (2 files, 1,145 seconds). Tests first: of the five new tests, three failed before the repair. One older test failed on the first full run, because a changed notice was untrue of a second cause; each cause now has its own words, and the older test is unchanged. Race trial outside the automatic tests: 1 loss in 240 before, 0 in 240 after.
- Open problems for the next session: no independent review (the helper reviewer was refused by the session's permission check; the builder reviewed its own changes line by line). Whether the running session obeys the new hooks is unconfirmed.
- Next feature to build (ID): F002 (the typefaces Playfair and Literata)

## Next

1. **The owner tries the Studio** with `docs/trial-guide.md` and sends the ten answers. M4 closes on the owner's word (hard rule 1).
2. **Repair what the trial names as serious, and decide the open findings of 2026-11-14** (rows "Open" and "Fixed in part" among S5, DT, U5, and C4-F18 to C4-F25 in `redteam/FINDINGS.md`). The first to weigh: the rare loss when several tabs close in the same instant (C4-F18). Then have a reviewer look at the repairs of this unit, which no reviewer has seen (hard rule 12).
3. **M4D:** the Direction Creator (`PLAN.md` section 4.7) is built (features F003 to F006). Its exit test waits for the owner to make one Direction on the private page.
3a. **M5**, in this order: the Brief (the owner's product, audience, and real content, so that every preview shows the owner's words); the floors from the knowledge base (the craft layer's first twelve craft rules are built, feature F009); the rest of the behavior Steps; an inner page for Template 1. A Skin's name stored in the project, and a change of Skin inside a project, belong here too.
4. **M6**: the rest of the export bundle (the Prescription): `DESIGN.md`, the shadcn theme, `FONTS.md`, the floors, and a validator for `tokens.json`. Its first slice of four files is built (features F010 and F011). **M7**: the Fitter.

## Waiting on the owner

The owner settled the earlier list on 2026-11-15 (decision D55 holds every answer). What still waits:

1. **The trial** (`docs/trial-guide.md`), and with it: do the pictures appear on the private page? (M3's last open part; the owner has not opened the page yet.)
2. (Done on 2026-11-15: you approved the typefaces Playfair and Literata and the repair for finding C4-F18; both are built, features F002 and F001.)
3. **Research sites for the network.** The owner decided on 2026-11-15 to settle this "before M5's craft layer" (D55). The builder built the craft layer's first twelve craft rules on the same day from research record 04 alone and did not ask first (finding T6-08). The question is still open: the builder asks with an exact list of hosts before any further craft rule or floor is written.
4. **Helper agents:** before each use the builder states the purpose and an estimated cost and waits for the owner's yes (D55).

Earlier cost reports, for the record (no decision needed): third review about 595,000 tokens; nine-reviewer code review about 1.84 million; retest round about 0.74 million; round 3 about 0.75 million (0.33 million measured); the unit of 2026-11-14 about 3.2 million in helpers.

## Known gaps (every plan item that is absent or partial)

- **The Prescription.** A first slice only: `DESIGN.md`, the shadcn theme, `FONTS.md`, and the floors are missing. No validator has read `tokens.json`. No AI coding tool has built from the files, so their effect on a build is unmeasured. The "Copy" buttons have no automatic test. The Mockup in the bundle shows the sample dental practice, not the owner's content (the Brief is not built).
- **Craft rules.** Twelve, a first set. Each check reads the Mockup's style sheet, not drawn pixels. Four rules rest on the builder's opinion alone. No person has reviewed any.

- **Skins.** A Skin can be chosen only when a project starts. Whether a Skin's color is easy to see in a card's small picture was judged from the design's values, not measured in pixels. "Indigo dye" is offered by four Directions.
- **Open findings of 2026-11-14.** `redteam/FINDINGS.md` lists them: among S5, DT, and U5, 11 rows are "Open", and several rows marked "Fixed" name a remainder that is still open; among C4-F18 to C4-F25, seven are open and one (F-19) has a second repair that no judge has retested.
- **Overlays.** The preview shows what each Overlay looks like, open, as a still picture. How an Overlay opens, closes, and behaves with a keyboard or a screen reader is not shown and not specified yet; that belongs to the export (M6). The six are a first set.
- **Research rules.** Each rule measures a value of the design, not the built website. Nobody read the studies behind them. Three of the five measure values that the sample website fixes (line length, line height, the height of buttons), so they hold for every design today; the Summary says so, and they exist to catch a later Template or a changed value. Text links inside the sample website are 24 pixels tall, not 44; the rule about buttons says so.
- **Research records.** 76 new records, unreviewed; every figure in them comes from a search summary unless its source is marked "read in full". The records list what could not be verified.
- **Top bar on a 320-pixel window.** Its four links wrap onto two rows.

- A slider step on the Step "Main color" still costs about 56 milliseconds of main-thread work (it was about 73). The two previews that change must be redrawn, and each carries its fonts inside it.
- The contrast checks do not measure the fine grain texture, and the tests do not yet tie the drawn colors of boxes, the top bar, and the highlighter stroke to the measured ones.
- On a dark page, a card's text can say "clearly lighter" for a stored lightness beyond the part of the slider that changes the color.
- The stored pictures are compared in a shrunk form with limits; a small local change can pass them. The measured-style record catches such a change only for the twelve parts and fifteen values that it holds.
- No automatic test opens the real private page; every database test uses a stand-in.
- The Studio's label "Sample website" covers a corner of the phone preview until the preview is scrolled.

- No Content Security Policy and no Trusted Types. The private page's own policy is unknown.
- Prettier is installed and never run.
- Catalog: no "page type" Step, no "icon set" Step, no "light and dark both" Option; Template 1 has no inner page; 13 accent Options are not grouped; many Options have no exemplar, because no record supports one.
- "Every derived token is hand-adjustable" (D14) is not built: 14 input values are adjustable on 10 Steps.
- Contrast checks do not measure text over glows, glass, or photographs. The Studio says so on screen.
- The Studio's controls are 32 to 40 pixels tall on a mouse-driven screen (44 on touch screens).
- In the one-column layout (windows under 1,100 pixels wide) the cards and the large preview are not on screen together.
- The save path on the real private page (its database and its file hand-over) has no automated test; tests use a stand-in.
- axe runs on the Studio's own screens only, and reports serious and critical findings only. No axe run on the Mockup yet.
- Tests ran in Chromium only. No screen reader was used.
- The dependency audit shows 9 moderate advisories, all one advisory in a package inside the lint tools; nothing ships to the browser.
- Drive backups: retired by the owner on 2026-11-15 (decision D55); no backup outside GitHub and the private page exists.
- **One unexplained test failure.** The browser test "dresses the Studio in the project’s design when asked, and remembers the choice" failed once in 5 local runs on 2026-11-13 (the checkbox read as unchecked after a reload). The Studio writes the preference at once and reads it first at start; no cause was found. The test is unchanged. If it fails again, investigate before anything else.
- **Second review, U2-08, fixed in part:** 12 pairs of cards still differ only in the large preview; each such Step says so in words on the card.
- **Second review, still open (minor, selected):** no leave-page warning while saving is paused (S2-03); the local test file shares its browser storage with every other local HTML file, so use it for testing only (S2-05). (The gradient headline, T2-03, was closed on 2026-11-15: row L8-03.) The full list is in `redteam/FINDINGS.md`.
- **Third review, still open (selected):** the values that sliders announce to a screen reader are bare numbers (U3-11); two tabs that keep a copy at the same moment could lose one, which the reviewer inferred and did not reproduce (S3-06); the drawn-color measurement runs in Chromium only (T3-01).
- **After round 3 (2026-11-14).** The repairs for F-16 to F-25 have no retest by a judge. The entry of its own that a closing page writes needs room in storage; with none, two pages that close in the same instant can still lose one change. A downloaded kept copy is named by its place in the list (`refraction-kept-copy-1.json`), not by its project; a project name without Latin letters gives the file name `project.refraction.json`. The message after a download says that the file "was handed to your browser"; the Studio cannot know whether the browser saved it. The first opening of the Studio holds the page for 50 to 120 ms once or twice.
- **After the new Directions (2026-11-14).** "Steady Steps" shows a look for a program app on the sample website only; a true app Mockup is a later Template. Twelve of the 17 new Directions had no reviewer. Whether each look matches what the owner had in mind is for the owner to judge.

## Reading status (what the records support)

- The owner's Drive files: 11 loose files and 2 archives are covered by `docs/research/01`-`03`. `map.pdf` was not readable. Most of the archive's source notes were read as a digest.
- The owner's five links: two read in full, one read at index level, one in part, one not read (decision D10).
- `docs/research/08`, `09`, and the knowledge base were written by research helpers. Nobody has reviewed them. The knowledge base marks each source as read, abstract only, search snippet, or from memory.
- Company design pages (Linear, Stripe, Apple) were never read. The Catalog no longer cites them as exemplars.

## Environment notes

- Cloud environment "engine". Allowed hosts added on 2026-11-13: `www.netguru.com`, `dev.to`, `docs.gitlab.com`, `www.sitepoint.com`, `stitch.withgoogle.com`, `linear.app`, `stripe.com`, `vercel.com`, `rauno.me`. `WebFetch` cannot resolve these; `curl` through the session proxy can.
- A new session runs `npm ci --ignore-scripts` first. The pre-installed browser matches Playwright 1.63.0; the project pins 1.65.0 since 2026-11-14, so local browser tests need `export PW_CHROMIUM=/opt/pw-browsers/chromium` (see "Start here").
- The owner's source files live in Google Drive, folder "Claude".
