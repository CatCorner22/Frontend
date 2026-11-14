# Campaign 4: the attackers' report (round 1)

Written 2026-11-13 by the lead, from the judge's findings (`findings.md`), before the Studio's side replied. The lead wrote the Studio (see the charter), so this report quotes the judge and adds no defence. The Studio's reply stands at the end, under its own heading, and was written afterwards.

## 1. Exam question and target pin

**Question.** Can a person who uses the Studio in ordinary or careless ways, or who opens a hostile project file, make the Studio (a) lose or change saved work without saying so, (b) show a statement that is not true, (c) run code or reach the network, or (d) reach a state from which the person cannot continue?

**Pin.** Commit `47bc15b` (2026-11-13); built page `refraction-studio.html`, SHA-256 beginning `176e993afaec8839` (the judge checked it); Chromium as driven by Playwright 1.63.0.

**Short answer.** (c): no. No attempt ran code, injected markup, or sent a request. (a), (b), and (d): yes, in the nine ways listed below. None is graded S3 (the worst level). Two are graded S2.

## 2. Run summary

| Measure | Number |
|---|---|
| Lanes × rounds | 6 × 1 |
| Attempts logged | 58 |
| Attempts that became part of a finding | 17 |
| Attempts where the target held | 32 |
| Reproduced, but not a finding | 4 |
| Not reproduced | 2 |
| No test (the attempt tested nothing) | 3 |
| Findings | 9, all confirmed by the judge's own re-run |
| By severity | S3: 0 · S2: 2 · S1: 6 · S0: 1 |
| Coverage cells filled | 6 of 9 (67%) |
| Independence | Six separate attackers and one separate judge, each in its own copy of the repository, on a different AI model from the lead. The lead removed lane names and self-assessments before judging. Not degraded. |
| Cost, measured | About 882,000 tokens for the six lanes and about 161,000 for the judge: about 1.04 million. The charter estimated 1.0 to 1.4 million. |

## 3. Confirmed findings, worst first

Each entry is the judge's; the full text, with the exact commands, is in `findings.md`.

| ID | Level | What happens | How an owner reaches it |
|---|---|---|---|
| F-1 | S2 | While the Studio has stopped saving to wait for a decision, one press of Undo replaces the notice that holds the only buttons that resume saving. The status line then says "Not saving: see the notice", and no notice exists. Work done afterwards is lost on reload or close. Three starting situations lead there: a saved copy that changed on opening with storage full, an unreadable saved copy, and a second tab. | Ordinary use: ignore the notice, keep working, press Undo. |
| F-2 | S2 | In a tab that stopped saving because another tab changed the project, the button "Reload to see the other copy" discards this tab's newer work. It asks nothing and keeps no copy, although the notice says "neither copy replaces the other without your say". | One click on a button the Studio offers. |
| F-3 | S1 | A project file whose Decision does not match its design values opens without a word, and the Studio rewrites the Decision to match the values: the record then names a choice nobody made. | A hand-edited or foreign file. |
| F-4 | S1 | The Option "Field of stars" says that the stars "do not sit under reading text". 161 star pixels sit inside the headline's box, 12 inside the opening paragraph, 9 inside a link. | Reading the Option's text. |
| F-5 | S1 | In a phone-width preview, large headings make the Mockup wider than the phone: headings are cut off and the left margin disappears. The catalog's own Option "Very large headings" does it on "Marquee Deco" (420 px in a 375 px frame); sliders at their highest reach 797 px. | Picking one Option on a phone preview. |
| F-6 | S1 | With both sliders of the Step "Text size" at their lowest, the main headline (11 px) is smaller than the body text (13 px). | Dragging two sliders to the left end. |
| F-7 | S1 | After a save fails because storage is full, an Undo that returns to the last saved state leaves the status line at "Saving…" for good. No work is at risk; the warning about full storage disappears. | Storage full, then Undo. |
| F-8 | S1 | `PROGRESS.md` states 137 unit tests, 110 browser tests, and 14 Directions. The pin has 140, 118, and 18. | Reading the record. |
| F-9 | S0 | When a Direction's value falls between a slider's steps, the knob stands at the nearest step (1.10) while the text says the true value (1.12). | Opening "Adjust with sliders" on such a Step. |

## 4. Observed-once findings and items for human review

None. Two attempts were not reproduced: T-002 (one browser test timed out once while the attacker's own scripts loaded the machine; the judge did not re-run the browser tests) and T-033 (a blank preview in one screenshot; the judge's own screenshot drew fully, so it is most likely a timing artifact of the screenshot).

## 5. Collateral findings

None.

## 6. Coverage: what was tried, and what was not

| # | Cell | Round 1 | Result |
|---|---|---|---|
| 1 | Opening a project file × run code or reach the network | tried (lane A) | held |
| 2 | Opening a project file × lose or corrupt work, or crash | **not assigned**; touched in passing by lanes A and D | F-3 came from that passing touch |
| 3 | Saving in the browser × lose work silently × volume | tried (lane B) | F-1, F-7 |
| 4 | Saving across tabs and time × untrue "Saved" or lost change | tried (lane C) | F-2 |
| 5 | Steps and the engine × a Decision that does not match the design | **not tried** | unknown |
| 6 | The Mockup preview × break out | tried (lane E) | held |
| 7 | Statements by the Studio and the records × untrue | tried (lane D) | F-4, F-8, F-9 |
| 8 | The whole Studio, new Directions × stuck, broken, unreadable | tried (lane F) | F-5, F-6 |
| 9 | Summary and downloads × a wrong or misleading file | **not tried** | unknown |

Also not tried, stated plainly: any browser other than Chromium; a real phone; the private page with its database (attackers used local files); a page restored from the browser's back-forward cache (the test browser never restored one, so T-010 tested nothing); going back and forward through browser history at speed and a hostile file in the newcomer's lane (its budget ran out, T-011).

## 7. Adversaries modelled

The stranger's file (lanes A and E); the hurried owner with a cluttered browser (lane B) and with several tabs (lane C); the doubting auditor (lane D); the newcomer on a phone-sized window, with the keyboard, at 200% zoom (lane F, the wildcard).

## 8. What the Studio did well

From the judge's section "What held":

- Markup and script in every field of a project file, in the file's name, and in the project's name always appeared as plain text. No script ran, nothing was injected, and no request left the page.
- The Studio refused files and stored copies that fail its format check, in short fixed words that repeat nothing from the file.
- With storage full, the Studio never said "Saved", and it asked before it replaced work that it could not keep a copy of.
- With two and three tabs, one tab saved and the others stopped and said so; the status matched storage in every round.
- Typing done a few milliseconds before a close or reload was saved.
- The preview frames stayed locked; the tests caught both defects that an attacker planted on purpose.
- Decision D42's statements, the three research records, and the "close to" labels were accurate.
- Every kept copy survived a list of 1,246 copies.

## 9. Recommended fixes, each with an owner

The owner of every fix is the builder (the lead, acting as the Studio's side), except where marked.

| Finding | Recommended fix |
|---|---|
| F-1 | Give the "stopped saving" notice its own place on the screen, which no other notice can replace, and which stays until the person decides. Add a test that presses Undo and visits the Summary in each of the three situations. |
| F-2 | Before "Reload to see the other copy" reloads, keep this tab's project as a kept copy; if that fails, ask. Also keep a copy when a stopped tab closes (the judge did not count that case, T-007, but the same work is lost). |
| F-3 | Say in the opening notice how many Decisions the Studio corrected to match the design values. |
| F-4 | Make the Option's text true (the stars are sparse; some sit behind the headline), and name patterns of dots, lines, and stars in the list of what the contrast checks do not cover. |
| F-5 | In the Mockup, let long words in headings break, and cap heading sizes by the width of a narrow screen. Add a browser test: no Option and no slider end makes a phone-width Mockup wider than its frame. |
| F-6 | In the Mockup, never let the main headline fall below the size of the body text. |
| F-7 | Set a final status when a save has nothing to write, and keep the "cannot save" statement while storage is still full. |
| F-8 | Correct the counts in `PROGRESS.md`. |
| F-9 | Put the new Directions' values on the sliders' steps, or accept. The builder decides; the owner may overrule. |

## 10. Retest plan

After the fixes: the same instructions go again to the lanes that produced F-1 and F-7 (lane B), F-2 (lane C), and F-5 and F-6 (lane F), against the new commit; one new lane attacks cell 5 (a Decision that does not match the design, by order and timing), which round 1 left untried; a new judge reproduces every claimed result. The campaign closes when every retest passes or the owner accepts the remaining risk in writing.

---

## Blue's response (the Studio's side), 2026-11-13, after round 1

The lead wrote this section after the judge's findings and the report above were committed (commit `8f1b5ed`). It is the Studio's side speaking; weigh it as such.

**The Studio's side accepts all nine findings.** It contests none, and it asks for no change of severity.

| Finding | What was done | Commit | Test that now guards it |
|---|---|---|---|
| F-1 | A notice that needs an answer has its own row, which no other notice replaces and which has no "Dismiss" (decision D44). | `dbddf15` | Two new browser tests (unreadable copy; second tab) and new lines in the storage-full opening test: each presses Undo and visits the Summary, then uses the notice's button. |
| F-2 | "Reload to see the other copy" keeps this tab's copy first, and asks when it cannot. Beyond the finding: a tab that is not saving keeps its unsaved work as a copy when it reloads or closes (the judge did not count attempt T-007, but the same work was lost there). | `dbddf15` | Three new browser tests. |
| F-3 | The opening notice counts the Decisions that the Studio changed to match the file's design values. The design values still win. | `86c16c9` | One new unit test. |
| F-4 | The Option's text now says that some stars sit behind the headline and the first lines of text, and that the contrast checks do not measure text over a star. The list of what the checks do not cover names patterns of dots, lines, and stars. | `56e5ca1` | None beyond the plain-words tests: the truth of a sentence about a picture is not machine-checked. |
| F-5 | Each large size has a cap tied to the screen's width; a long word breaks. | `56e5ca1` | New browser test at 375 px across 19 starting designs, the Options of 7 Steps, and both slider ends. Before the fix it listed 26 overflowing designs: 7 in the four new Directions, 18 in Directions older than this campaign, and 1 in the plain start. |
| F-6 | The headline has a floor above the opening paragraph. | `56e5ca1` | New browser test at 375 px and 1280 px. Before the fix it listed 16 undersized headlines. |
| F-7 | A save with nothing to write settles the status line; it repeats the result of the last attempt, so "Cannot save here" stays while it is true. The defect was wider than reported: an edit and an Undo within a third of a second left "Saving…" even with free storage. | `dbddf15` | One new browser test, which fills the real storage. |
| F-8 | The counts are corrected: 143 unit tests, 128 browser tests, 18 Directions. | `4acc523` | None: no test reads the record. The risk of new drift stays. |
| F-9 | The slider is drawn without a grid, so the knob stands on the stated value; the keys walk the grid. | `86c16c9`, `dbddf15` | One unit test (every slider walks from end to end) and one browser test. |

**One more defect, found by the Studio's side while it fixed the above.** Several browser tests failed once in a while (the judge's "not reproduced" attempt T-002 is one such failure). The cause was in the tests: they placed starting data through a script that read storage at the first instant of every load, and on a reload the browser sometimes showed that script an empty storage (4 of 16 trials); the script then replaced what the Studio had written. The tests now place starting data from an empty page. Without that script, nothing was lost in 410 reload trials (Chromium only). Correction of the same day: when this sentence was first written, the count stood at 390; a further 20 trials with the real storage filled to the brim brought it to 410, again with no loss. Those 20 trials also showed that an earlier reading ("the browser drops a large filler on a reload") was wrong: that loss, too, came from the start-of-load script. The measurements are filed in `docs/knowledge/sources/browser-storage-across-reload-measurements.md`.

**What the Studio's side did not do.** It did not add a Content Security Policy to the Studio's own page (two attackers noted its absence as an observation; it is a known gap in `PROGRESS.md`). It did not test any browser other than Chromium.

---

# Round 2 (the retest round): the attackers' report

Written 2026-11-13 by the lead, from the second judge's findings (appended to `findings.md`), before the Studio's side replied to them.

## R2.1 Target pin

Commit `dbddf15` (2026-11-13), the version that holds the fixes for round 1; built page `refraction-studio.html`, SHA-256 beginning `daae011765329d1f`.

## R2.2 Run summary

| Measure | Number |
|---|---|
| Lanes × rounds | 4 × 1 (the three lanes whose findings were fixed, with the same instructions and a note of what round 1 found; one new lane on cell 5, which round 1 left untried) |
| Attempts logged | 29 |
| Attempts that became part of a finding | 8 |
| Attempts where the target held | 11 |
| Reproduced, but not a finding | 9 |
| No test | 1 |
| Retest of the nine round-1 findings | 8 passed; 1 failed in a narrow case (F-2) |
| New findings | 6, all confirmed by the judge's own re-run: S3: 0 · S2: 2 · S1: 4 |
| Coverage cells filled, both rounds | 7 of 9 (cells 2 and 9 stay untried) |
| Independence | Four separate attackers and a second, separate judge, on a different AI model from the lead. Not degraded. |
| Cost, measured | About 574,000 tokens for the four lanes and about 167,000 for the judge: about 741,000. The lead's estimate was 0.5 million; the lanes ran over it. |
| Campaign so far | 10 lane-runs, 87 attempts, 15 findings, about 1.78 million tokens |

## R2.3 Retest results

| Round-1 finding | Result |
|---|---|
| F-1 (the stopped-saving notice vanished after Undo) | retested-pass |
| F-2 (the reload button discarded a tab's work) | **retest-failed, narrow**: the fix keeps the tab's copy whenever the project has a Direction or a Decision; a project that has only a name is still discarded, although the notice says "the Studio first keeps the other copy" |
| F-3, F-4, F-5, F-6, F-7, F-8, F-9 | retested-pass |

## R2.4 New findings, worst first

| ID | Level | What happens | How an owner reaches it |
|---|---|---|---|
| F-10 | S2 | Two tabs that are not saving each keep their unsaved work as a copy when they close. When they close in the same moment, one copy can replace the other (2 of 10 trials for the judge). Introduced by the round-1 fix for F-2, which made closing tabs write the shared list of kept copies. | Closing a browser window that holds two stopped tabs. |
| F-11 | S2 | The dialogs say "Undo brings it back only until you close or reload this page". Undo remembers 40 changes, and every typed letter of a project name is one change. After 40 changes, a project that was replaced without a kept copy (storage full) cannot come back, and nothing says so. | Storage full, the button marked as dangerous, then a minute of typing. |
| F-12 | S1 | "Keep this tab's copy" pressed in two stopped tabs within a few milliseconds: both tabs can say "Saved" while storage holds one, and work can then disappear. With 50 ms or more between the presses, nothing went wrong in 12 trials. | Not reachable by one person with one mouse; graded down for that reason. |
| F-13 | S1 | On "Vector Horizon", "Frontier Gazette", and "Marquee Deco", the phone and tablet previews draw the main headline smaller than the section headings (26 px against 32 px on a phone). | Starting from one of these Directions. |
| F-14 | S1 | Moving a slider onto the exact value of an Option that the owner had rejected leaves a Decision that names that Option and also lists it as rejected. The next reload then says "Opening changed some details" and writes a kept copy. | Picking an Option, then moving the slider onto another Option's value. |
| F-15 | S1 | After "Go on: let the Studio save over it" with nothing changed, the status says "Nothing to save yet" and the old form stays stored. | Storage full plus an older or foreign saved copy. |

## R2.5 What held in round 2

Eight of the nine round-1 fixes; a single tab in every timing the attackers tried; two tabs at human pace (50 ms or more between actions); full storage (honest status lines, a question before every dangerous replacement); the slider ends across six Directions, six Steps, and two device widths (144 sessions with no overflow); no request to the network and no page error in any run.

## R2.6 Not tried in either round

Cells 2 (a hostile file that corrupts work or crashes the Studio) and 9 (a wrong or misleading download); any browser other than Chromium; a real phone; the private page with its database; a page restored from the back-forward cache (the test browser never restored one).

## R2.7 Recommended next steps

Fix F-10 to F-15 and the narrow rest of F-2, each with a test; then run one more retest round. The charter planned two rounds (the method's default is three); a third round therefore needs a dated amendment to the charter.

---

## Blue's response to round 2 (the Studio's side), 2026-11-13

The lead wrote this section after the second judge's findings and the round-2 report above were committed (commit `4fb98f1`). It is the Studio's side speaking; weigh it as such.

**The Studio's side accepts all six new findings and the narrow failure of F-2.** It contests none. On two points it adds a fact that the judge did not have.

| Finding | What was done | Commit | Test that now guards it |
|---|---|---|---|
| F-2, narrow rest | A project that has only a name of the owner's own is kept before a reload, before a replace action, and when a stopped tab closes. | `560ca7d` | "keeps a tab’s copy before a reload even when the project has only a name" |
| F-10 | Every kept copy has a storage entry of its own, written in one step (decision D46). No shared list is rewritten, so two tabs cannot overwrite each other's copy. | `560ca7d` | A test that records every write (two copies: two new entries, no rewrite of a list), and a test that closes two stopped tabs together, four times. The attacker's script: 0 losses in 40 trials (before: 2 in 10). |
| F-11 | A run of typing, or of presses on one slider, is one Undo step; Undo remembers 100 steps; the dialogs state that limit (decision D47). | `560ca7d` | "counts a run of typing or of slider presses as one Undo step, and states how far Undo reaches" |
| F-12 | Every save carries a mark of its own (decision D46). A tab also looks at storage when the owner returns to it and before it closes. | `560ca7d` | Two tests: a save with the same save time and another mark stops the tab; a save that arrives without a storage event is noticed on return. The attacker's scripts: 0 losses in 64 same-instant trials (before: about 1 in 3). |
| F-13 | The headline's floor now stands above the section headings as well. | `c77d00c` | The headline test compares with every section heading at 375, 768, and 1280 pixels. |
| F-14 | The engine drops the held Option from a Decision's rejected list wherever it brings Decisions up to date. | `c77d00c` | A unit test, and the random sweep, which now lands half of its slider moves exactly on an Option's value. |
| F-15 | "Go on: let the Studio save over it" saves at once. | `560ca7d` | "saves at once after "Go on: let the Studio save over it", also when nothing changed on screen" |

**Two facts for the record.**

1. *F-12, the cause.* The judge did not trace the cause, and the attacker's guess (each tab reads an out-of-date copy of storage) was wrong. So was the lead's first guess, and a first fix built on it (a second message channel between tabs) did not stop the loss; the lead removed it again. The cause is that the Studio told "my save" from "another tab's save" by the save time alone, and two saves within one millisecond carry the same time. Because a person cannot press two buttons in two tabs within a millisecond, the judge's grade (S1) stands; the same cause could also strike any two saves that happen to fall into one millisecond.
2. *F-13, the reach.* The judge named three Directions. The extended test, run against the old rule, also fails for the plain start and for other Directions on a phone: there the headline was only 4 percent larger than the section headings. The weakness is older than this campaign; the round-1 fix for F-5 did not cause it.

**Not done.** The Studio's label "Sample website" still covers a corner of the phone preview until the preview is scrolled (two attackers noted it; both judges ruled it not a finding). After a reload in a stopped tab, the next opening now says that a copy was kept (the judge ruled the earlier silence not a finding; the Studio's side changed it all the same).

## Charter amendment 1, 2026-11-13

The charter planned at most two rounds. The method's default is three. Round 2 produced six new findings, so one more retest round is needed before the campaign can close. **Round 3**: the lanes whose round-2 findings were fixed attack again with the same instructions and a note of what round 2 found (the full-storage lane, the several-tabs lane, the newcomer lane, and the changes-of-mind lane); the statement-checking lane of round 1 attacks the new records and the guarantees reference; two new lanes take the two cells that no round has tried (cell 2, a hostile file that corrupts work or crashes the Studio; cell 9, a wrong or misleading download); and a third judge reproduces every claimed result. That is seven lanes and one judge. The target is the head of the branch `claude/harden-studio-review-fixes`, which also holds the fixes of the code review; round 3 therefore serves as the review that hard rule 12 asks for after that unit of work (security attacker: the hostile-file lane; confused first-time user: the newcomer lane; drift and truth auditor: the statement-checking lane). Basis for going beyond the charter's two rounds: the owner's message of 2026-11-13 ("Please try to find any code errors and performance bugs and fix, harden, and try to ensure that the application is as error-free as possible"), sent in a mode that sets no cost limit. Expected cost: about 1.2 million tokens (seven lanes at about 145,000 each, as measured in rounds 1 and 2, and one judge at about 165,000).


# Round 3: the attackers' report

Written by the lead on 2026-11-14, after the judge's text was filed and before any reply from the Studio's side. The lead also built the Studio (stated in the charter); the lanes and the judge ran as separate agents.

## R3.1 Target pin

Commit `6cbd764` of the branch `claude/harden-studio-review-fixes`; built pages with SHA-256 beginning `bc91e0d61eb1b4ba`.

## R3.2 Run summary

- Seven lanes, one judge. 56 attempts: lane B (full storage) 5, C (several tabs) 8, D (statement checker) 8, F (newcomer) 9, G (changes of mind) 8, H (hostile file) 8, I (wrong or misleading download) 10. The attackers claimed 24 of them.
- The judge: 27 held, 8 not a finding, 1 no test, 20 attempts in 10 findings.
- No code ran, no markup was injected, and no request left the page in any attempt.
- Measured cost of the lanes' and judge's final run: 334,110 tokens for the last lane and the judge; the first six lanes ran before a restart of the machine and their cost was not recorded by the harness (estimate: about 0.4 million).
- **Departures from the method, stated plainly.** (1) The machine restarted while lane I ran. The six finished lanes' results were read from the harness's record; lane I ran again from the start. (2) The harness handed each lane's log to the judge directly. The logs of lanes B, C, D, F, G, and H were committed before the judge started; lane I's log was committed together with the judge's text. (3) While the round ran, the lead read the first lanes' logs and began repairs in a separate working copy. The pin did not change, and the judge saw none of it.

## R3.3 Retest of round 2

All seven passed: F-2 (narrow rest), F-10, F-11, F-12, F-13, F-14, F-15. The judge wrote scripts of its own; the two races ran 20 same-instant trials each without a loss.

## R3.4 New findings, worst first

| Finding | Severity | Status | In short |
|---|---|---|---|
| F-16 | S2 | confirmed | A stopped tab’s promise of a kept copy rested on its replaceable running copy; the copy vanished at the next tab switch |
| F-17 | S2 | confirmed | A pick of another Option deleted the reason typed for the Step, without a word |
| F-18 | S1 | confirmed | Two tabs that close in the same instant, each with a change under 0.3 s old, lost one tab’s change (8 of 24 trials) |
| F-19 | S1 | confirmed | A project name with quotation marks made a dialog appear to say "nothing will change" |
| F-20 | S1 | confirmed | A note said the Catalog lacks an Option that it has; it came back at every opening |
| F-21 | S1 | confirmed | Opening a hand-edited file rewrote parts of Decisions and dropped unknown parts without saying so |
| F-22 | S1 | confirmed | A value beyond a slider’s range was stated as the slider’s end value |
| F-23 | S1 | confirmed | "Try to save again" could not clear a stale "Cannot save here" after an Undo |
| F-24 | S1 | needs human review | A kept "third of the wheel" second color stopped following the main color (for human review) |
| F-25 | S0 | confirmed | In the older list form, removing one of two identical copies removed the other |

## R3.5 What held in round 3

- No run made a request outside the page or showed a page error; hostile names and files ran no code and injected nothing.
- 'Reload to see the other copy' now keeps a project that has only a name (F-2 narrow rest: 3 of 3).
- Two stopped tabs closed together kept both copies in 20 of 20 trials (F-10). Pressing 'Keep this tab’s copy' in two tabs at once gave no false 'Saved' and lost nothing in 20 of 20 trials (F-12).
- The Undo promise now names its 100-step limit, and Undo stops at exactly 100 (F-11). 'Go on: let the Studio save over it' now saves and says so truly (F-15).
- The preview headline is larger than every section heading for six Directions on Phone, Tablet and Desktop (F-13). Moving a slider onto a rejected Option no longer leaves a self-contradicting Decision or a reload notice (F-14).
- Two tabs typing at the same instant, typing then closing, back-forward navigation, and keep-with-close or keep-with-reload races lost nothing (Q-006, Q-008, Q-017, Q-035, Q-037).
- Full round trips (23 Decisions, reasons, odd names, Copy as text, reopen in a fresh browser) came back unchanged apart from key order.
- Damaged, oversized, deeply nested and wrong-version files were refused in fixed words or opened safely, and the owner's project stayed in place.
- The engine fuzz (1,500 runs) and the card-against-pick comparison found no mismatch.

## R3.6 Not tried

Only Chromium ran. No lane used the real private page (its database and its file hand-over). A real person closing a real window was simulated by closing tabs through the test tool. Lane I's claims about file names of downloads and about a download that the browser itself drops were ruled "not a finding" or "held"; nobody tested another browser's download limits.

## Blue's response to round 3 (the Studio's side), 2026-11-14

Repairs are in commits `639fb7f` (core) and `8b263b7` (Studio); 163 unit tests and 185 browser tests pass locally. No judge has retested these repairs.

| Finding | Reply |
|---|---|
| F-16 | Fixed in `8b263b7`: a kept copy carries a state; only a lasting copy counts as kept; a tab’s own running copy becomes lasting. Two browser tests; the attacker’s scripts no longer lose the copy. |
| F-17 | Fixed in `8b263b7` and `639fb7f`: the rule stays (a reason belongs to its choice); a notice now says that the reason was removed, quotes it, and puts it back with one button. Browser test and unit test. |
| F-18 | Fixed in `8b263b7`: a closing page writes its work to an entry of its own before the saved project; the next opening settles it. Three browser tests; the attacker’s race script: 0 losses in 48 trials (before: 8 of 24). Open: no protection when storage has no room for the extra entry. |
| F-19 | Fixed in `8b263b7`: every double quotation mark in a name becomes a single one inside the Studio’s sentences. Browser test. |
| F-20 | Fixed in `639fb7f`: the note states only what is known. Unit test with the exact words. The repeat at every opening is fixed in `8b263b7` (browser test). |
| F-21 | Fixed in `639fb7f` and `8b263b7` (decision D50): the list of rejected Options is never added to; a file whose details were left out or corrected with no specific note gets a general note. Unit test and browser test. Open: the general note does not list each detail. |
| F-22 | Fixed in `639fb7f` and `8b263b7`: a value that the Studio cannot set is brought into reach on opening, with a note; a slider states the value the design holds; the first inward key changes what is drawn. Unit tests and two browser tests. |
| F-23 | Fixed in `8b263b7`: the retry makes a real attempt. Browser test. Unchanged by choice: after an Undo, "Cannot save here" stays until the owner retries or changes something. |
| F-24 | The judge left this for a person. The builder changed it in `8b263b7`: keeping a card that follows the main color, where the starting design held a fixed value, is recorded as a pick and follows. Browser test. Open to the owner’s veto (D50). |
| F-25 | Fixed in `8b263b7`: the reason is compared too, so the chosen copy goes. No test (the case needs hand-made storage in the older form). |

**Where the Studio's side differs from an attacker's account.** One of the two scripts behind F-16 (`a2-running-copy-evicts-kept-decisions.cjs`) presses the first button of the "Start again?" question, which is "Keep my project"; it therefore never starts again, and what it shows is the designed replacement of a running copy by newer work of the same project. The finding stands on the other script, which meets no question.

**A choice the owner may reverse (decision D50).** F-17: the reason is still removed on a pick of another Option; the alternative is to keep it. F-21: the list of rejected Options is no longer filled in. F-24: a named keep becomes a pick.

**Not changed.** The names of downloaded kept copies (`refraction-kept-copy-1.json`) carry no project name; a project name without Latin letters gives the file name `project.refraction.json`. The judge ruled these no findings; they are listed in `PROGRESS.md` as known gaps.
