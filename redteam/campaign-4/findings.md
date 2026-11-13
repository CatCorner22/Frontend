<!-- Written by the judge (a separate AI assistant that took no part in the attack), 2026-11-13. The judge could not write files, so the lead saved the judge's text here, unchanged. The lead does not edit this file; later judge notes are appended with a date. -->

# Campaign 4: the judge's findings

2026-11-13 · pin `47bc15b` (I checked that the SHA-256 of `refraction-studio.html` starts `176e993afaec8839`) · I received 58 attempts.

## Findings

```
F-1 | 2026-11-13 | S2 | status: confirmed
Attempts: T-056, T-004, T-032
Exam-question link: d and b. When the Studio stops saving to wait for the owner's answer, one ordinary Undo replaces the notice that holds the only buttons that resume saving. The status line then points to a notice that no longer exists, and saving never resumes.
Repro: node .../scripts/set-1/b1-held-notice-lost.cjs (the saved copy changes on opening, and storage is nearly full); node .../scripts/set-1/b4-held-variants.cjs (block (7): unreadable saved copy; block (8): two tabs); my own script /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/judge/j2.cjs (same path as b1, then "Download the project file" on the Summary).
Observed: At opening, the notice read "Opening changed some details of your saved project. This browser's storage is full or blocked, so the Studio could not keep that copy. It has stopped saving..." with the buttons "Download your saved copy as it was" and "Go on: let the Studio save over it". Status: "Not saving: see the notice". After two renames and Undo, the notice became "Undone: your earlier project is back, the one that started from Soft Daylight." with only "Dismiss". On the Summary: no notice, 0 "Go on" buttons, status still "Not saving: see the notice". After freeing the storage and renaming again: stored name "Last week's work", name on screen "Hours of new work, final", status unchanged. After reload, "Last week's work" opened, and the notice said only that details had changed and a copy was kept. Variant (7): the unreadable-copy notice and its two buttons vanished the same way, and storage still held the cut-off text. Variant (8): the two-tab notice and "Keep this tab's copy" vanished the same way. In j2.cjs, "Download the project file" on the Summary still worked, and the downloaded file held the session's name ("Session work").
Reproductions: 3/3.   Why it matters: The Studio pauses saving to protect an old copy, but one common click hides the only switch that turns saving back on. The owner keeps working, and everything done after that click disappears on reload or close, while the screen says "see the notice" and shows no notice.
Judge note: I did not grade this S3 because the status line says "Not saving" the whole time, and one way out remains: "Download the project file" on the Summary, which I checked. The source agrees with the attacker's cause: undo() and the other notice-setting actions in apps/studio/src/store.ts overwrite the sticky notice, and persist() and flush() return early while saved === 'held'. A person could argue S3 for an owner who never reads the status line.
```

```
F-2 | 2026-11-13 | S2 | status: confirmed
Attempts: T-039
Exam-question link: a and b. In a tab that stopped saving because another tab changed the project, the button "Reload to see the other copy" throws away this tab's newer work. It asks nothing and keeps no copy, although the notice promises "neither copy replaces the other without your say".
Repro: node .../scripts/set-6/a4-held-reload-close.js (the PART2 lines).
Observed: Tab B showed status "Not saving: see the notice" and the notice "This project was just changed in another tab or window. The Studio has stopped saving here, so that neither copy replaces the other without your say." More typing went into B. Clicking "Reload to see the other copy" reloaded the page in 68 ms. B then showed "A changed it", no notice, and an empty list of kept copies ([]). B's typed work was neither in storage nor in the kept copies.
Reproductions: 1/1.   Why it matters: The owner reads the button as "show me the other version", not "delete what I typed here". The work in this tab is gone, with no warning and no copy to get it back.
Judge note: The lost work had never been saved (the tab was not saving), which is why this is S2 and not S3. The other choice, "Keep this tab's copy", does keep a copy, so the two buttons are not equally safe, and nothing on screen says so. Closing a stopped tab (T-007, PART3 of the same script) also loses typed work. I did not count that, because the status line had said "Not saving" and no button promised otherwise.
```

```
F-3 | 2026-11-13 | S1 | status: confirmed
Attempts: T-001
Exam-question link: a. The test file records the Decision "Field of stars" (kept) but sets the background design value to "plain". When the owner opens it, the Studio silently rewrites the Decision to "Plain", a choice nobody made, and says only "Opened the project".
Repro: node .../scripts/set-4/hostile-file.cjs (the lines "decision as stored" and "FILE1 ...").
Observed: Before: {"kind":"kept","stepId":"atmosphere","optionId":"stars","values":{"atmosphere":"stars"}}. After "Open the file": {"stepId":"atmosphere","optionId":"plain","kind":"kept","values":{"atmosphere":"plain"},"at":<the original time>}. Notices: "Saved in this browser, on this computer" and "Opened the project "My first project"." with Undo and Dismiss. No request left the page.
Reproductions: 1/1.   Why it matters: The record of what the owner chose, which feeds the taste ledger, can come to say something the owner never chose. Nothing says that the file was changed on the way in.
Judge note: Reaching this takes a hand-edited or foreign file; the Studio's own files are consistent. The file on disk does not change, and the design values stay as the file had them. The Studio announces other changes it makes when it opens a file (Decisions for unknown Steps left out, long reasons shortened) and changes to stored copies ("Opening changed some details"). So this silence breaks the Studio's own pattern; it is not a choice the Studio states anywhere.
```

```
F-4 | 2026-11-13 | S1 | status: confirmed
Attempts: T-006, T-013, T-020
Exam-question link: b. The Option "Field of stars" says "The stars fade out toward the bottom of the first screen, so that they do not sit under reading text". In fact the stars are drawn at full strength under the headline, and partly under the opening paragraph and the link.
Repro: node .../scripts/set-4/stars-under-text.cjs "Galactic Goth" (run twice; the second run only to read the counts).
Observed: Mask "linear-gradient(rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0) 100%)". The first screen holds 406 star pixels: 161 inside the headline box ("Dental care that explains itself before..."), 12 inside the opening paragraph, and 9 inside the link "See what a first visit includes". The Option text in packages/core/src/catalog/steps.ts:496 is as quoted.
Reproductions: 2/2 (same numbers).   Why it matters: The owner picks this Option partly because it promises to keep the stars out from under reading text. It does not keep that promise, and the contrast checks do not measure text over the stars.
Judge note: The stars do fade toward the bottom, so the first half of the sentence is true; the half "so that they do not sit under reading text" is not. T-013 and T-020 judged this by eye; I rely on the pixel count. T-020 also reports that the Studio's fixed "Sample website" label covers a corner of the preview. I saw that too, but the label belongs to the Studio, not the Mockup, so I did not count it.
```

```
F-5 | 2026-11-13 | S1 | status: confirmed
Attempts: T-038, T-052, T-008
Exam-question link: d (a broken layout with a way out). In a phone-width preview, large heading sizes make the Mockup page wider than the phone: headings are cut off and the left margin disappears.
Repro: node .../scripts/set-3/r04_overflow_step9.js "Marquee Deco" 9; node .../scripts/set-3/r07_sliders.js "Frontier Gazette" 9.
Observed: Marquee Deco, Step 9, card 5 "Very large headings": the phone page is 420 px wide inside a 375 px frame. The screenshot shows "ASK FOR AN APPOINTMENT" with its last letter clipped, body text running off the right edge, and no left margin. The card-5 thumbnail is 420 px wide whichever card is on show. Frontier Gazette with the sliders at their highest (22 px, 1.617): the page is 797 px wide inside a 375 px frame; the headline, paragraph, button and service cards run off the edge; the headline is 65.1 px. No error, no request.
Reproductions: 2/2.   Why it matters: The owner judges a look in the phone preview. Here the preview shows a page that does not fit a phone, and the Studio's conflict note says only that the headings "fill the screen".
Judge note: The frame's own measurements and the screenshot both show the overflow, so it is not a screenshot artifact. The Studio does show its conflict note for the capital-letter looks, and the owner can pick another Option, so the damage is contained. Whether a preview should show an overflowing page at extreme slider values is a design question. The clearer case is the catalog's own Option "Very large headings" on a catalog Direction.
```

```
F-6 | 2026-11-13 | S1 | status: confirmed
Attempts: T-005
Exam-question link: d (a broken layout). With both Step 9 sliders at their lowest (Text size 13 px, Heading size jump 1.067), the phone preview draws the main headline smaller than the body text.
Repro: node .../scripts/set-3/r07_sliders.js "Frontier Gazette" 9 (the "[min]" line and its screenshot).
Observed: "[min] values=13,1.067 ... h1size 11.0557px". The screenshot shows the headline "DENTAL CARE THAT EXPLAINS ITSELF BEFORE IT BEGINS." clearly smaller than the paragraph under it. No note appeared.
Reproductions: 1/1.   Why it matters: A headline smaller than the text under it reverses the page's order of importance, and the owner might export it without noticing.
Judge note: I did not re-run Vector Horizon or Marquee Deco. The attacker also claims that the Step's text ("A small number keeps all sizes close together...") is untrue. That claim is weak, because the sizes are close together. The defect is the reversed order, so I grade it as a layout fault, not an untrue statement.
```

```
F-7 | 2026-11-13 | S1 | status: confirmed
Attempts: T-024
Exam-question link: b. After a save fails because storage is full, an Undo that returns to the last saved state leaves the status line at "Saving…" for good, although no save is running.
Repro: node .../scripts/set-1/b2-full-midsession.cjs (line "(3)").
Observed: "(2) status after edit with storage full: Cannot save here: this browser's storage is full or blocked. ..."; "(3) status after Undo to the last saved state: Saving…", stored name "A"; "status 3 s later: Saving…".
Reproductions: 1/1.   Why it matters: The status line stops telling the truth. No work is at risk here, because the screen and storage match, but the earlier warning that storage is full disappears.
Judge note: The source agrees. saveNow() in apps/studio/src/store.ts returns early when the text matches the last saved text, and leaves in place the "saving" state that persist() had set. This is not a false "Saved".
```

```
F-8 | 2026-11-13 | S1 | status: confirmed
Attempts: T-022, T-025, T-053
Exam-question link: b. PROGRESS.md states counts that the pin no longer matches: 137 unit tests, 110 browser tests (64 of them visual), and 14 Directions.
Repro: npm ci; npx vitest run packages/core; npx vitest list --config vitest.e2e.config.ts, plus reading the test loops in apps/studio/e2e/visual.e2e.ts; reading packages/core/src/catalog/directions.ts and packages/core/test/catalog.test.ts:246.
Observed: Unit tests: 141 passed in my working copy. One test was added after the pin, so the pin has 140 (the record says 137, on lines 15 and 23). Browser tests: 45 Studio tests and 73 visual tests (23 Steps + 9 paint-only + 1 target-size + 19×2 stored pictures + 1 "would notice" + 1 contrast measurement), 118 in all. The record says 110, with 65 on the Mockup and 64 visual. Directions: directions.ts holds 18 and the test expects 18 (the record says 14, on line 21).
Reproductions: 1/1 for each count.   Why it matters: The progress record is the owner's view of what exists and what is tested. It understates both, so it no longer describes the Studio as built.
Judge note: These are stale counts in a record, and the owner would not base a decision on them, so S1. I counted the browser tests from the test list and the source; I did not run the browser suite.
```

```
F-9 | 2026-11-13 | S0 | status: confirmed
Attempts: T-031
Exam-question link: b, for information. When a Direction's value falls between the slider's steps, the slider's knob shows a slightly different value from the text beside it.
Repro: /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/judge/j1.cjs (Start from Galactic Goth, Step 6 "Spacing", "Adjust with sliders").
Observed: stored density 1.12; slider {value: "1.1", step: "0.05", min: "0.75", aria-valuetext: "1.12"}.
Reproductions: 1/1.   Why it matters: The knob sits slightly off the true value. The stored value, the text and the Mockup are all right.
Judge note: The browser snaps a slider to its nearest step. Nothing is lost, and no text states a wrong value.
```

## Collateral findings

None.

## All attempts

| id | disposition | one-line reason |
|---|---|---|
| T-001 | finding F-3 | Opening a file rewrote a Decision from "stars" to "plain" without a statement |
| T-002 | not reproduced | One timeout while the attacker's own scripts loaded the machine; inconclusive by the attacker's account; I did not re-run the browser suite |
| T-003 | held | I recomputed the "close to" labels; they are correct |
| T-004 | finding F-1 | Unreadable-copy notice lost after Undo; saving cannot resume |
| T-005 | finding F-6 | Headline 11.06 px above 13 px body text at the lowest slider values |
| T-006 | finding F-4 | Star pixels counted under the headline, paragraph and link, against the Option text |
| T-007 | not a finding | Closing a stopped tab loses typed work, but the status line had said "Not saving" |
| T-008 | finding F-5 | 640×360 is usable; the 375 px overflow is the F-5 defect |
| T-009 | held | Source review found no route from input into CSS or markup; the Studio page has no Content-Security-Policy of its own, which is an observation, not a break |
| T-010 | no test | Chromium never restored the page from the back-forward cache |
| T-011 | no test | Not attempted (budget) |
| T-012 | held | Full storage gives "Cannot save here", not "Saved" |
| T-013 | finding F-4 | Stars beside the headline on Galactic Goth (judged by eye) |
| T-014 | held | Fast Back and reload, and Undo then reload, kept the right state |
| T-015 | held | Extra and prototype keys dropped; no pollution, script or request. I did not judge the side note about how many left-out Decisions the notice counts |
| T-016 | held | With storage full, "Start again" asks before it replaces work |
| T-017 | not a finding | Every kept copy survived; a copy in an unknown form was rewrapped with its text intact |
| T-018 | held | Hostile copy from the page database refused with a clear notice |
| T-019 | held | 18 Directions, nothing off the edge, no requests |
| T-020 | finding F-4 | Stars inside the text area on the Vector Horizon phone preview |
| T-021 | held | The research records exist and say they rest on search summaries |
| T-022 | finding F-8 | 140 unit tests at the pin, 137 in PROGRESS.md |
| T-023 | held | `__proto__` Decision dropped; no pollution; the change announced, with a kept copy |
| T-024 | finding F-7 | "Saving…" stays after Undo to the last saved state |
| T-025 | finding F-8 | 118 browser tests, 110 in PROGRESS.md |
| T-026 | not a finding | An idle tab replaced a damaged copy on leaving, but kept a copy first |
| T-027 | held | Full storage stated plainly in mid-session |
| T-028 | held | Hostile file survived reload and 26 views with nothing injected |
| T-029 | held | SEC-12 fix holds: the refusal repeats no text from the file |
| T-030 | held | Edge-of-range numbers loaded with no NaN, crash or hang |
| T-031 | finding F-9 | Slider knob at 1.10, value 1.12 |
| T-032 | finding F-1 | Two-tab notice lost after Undo; saving cannot resume |
| T-033 | not reproduced | My screenshot of the same preview drew fully; most likely a screenshot timing artifact |
| T-034 | held | Typing and then closing at once was saved by the save that runs when the page closes |
| T-035 | held | With three tabs, the status always matched storage |
| T-036 | held | A real tap and the keys work; the forced check failed in the script itself |
| T-037 | held | The tests caught the planted CSS-guard defect |
| T-038 | finding F-5 | "Very large headings" cuts off the phone preview |
| T-039 | finding F-2 | "Reload to see the other copy" discards this tab's work and keeps no copy |
| T-040 | not a finding | The not-checked list's item on text over a background glow, "where the color behind the text varies", reasonably covers stars over a glow |
| T-041 | held | The name box stops typing at 120 characters (maxlength 120), so nothing is cut silently; no script ran |
| T-042 | held | The tests caught the planted escaping defect |
| T-043 | held | Hostile text after "#" in the address was replaced with "#directions" |
| T-044 | held | Markup in every content field showed as text; no request |
| T-045 | held | The band is the deep red that D42 states |
| T-046 | held | Card and Step 1 readable at phone width |
| T-047 | held | Hostile file name shown as text in the confirmation and the kept copies |
| T-048 | held | Simultaneous typing in two tabs always gave one "Saved" and one stopped tab |
| T-049 | held | A hand-edited browser copy rendered as escaped text in sandboxed frames |
| T-050 | held | Source review: every route is escaped or limited to fixed choices; no route writes raw HTML |
| T-051 | held | No request left the page in any run |
| T-052 | finding F-5 | Sliders at their highest make the phone page 562–797 px wide |
| T-053 | finding F-8 | 18 Directions, 14 in PROGRESS.md |
| T-054 | held | The version-1 upgrade path refused bad Decisions and dropped extra keys |
| T-055 | held | Same hostile-file result on local-test.html |
| T-056 | finding F-1 | Changed-on-opening notice lost after Undo; session work lost on reload |
| T-057 | held | D42's statement that no catalog Direction used "Two colors" on a dark page before is true |
| T-058 | no test | The attacker's file was invalid JSON, so only the refusal was tested |

## What held

- **Hostile project files** (T-015, T-028, T-044, T-047, T-049, T-054, T-055): markup and script in every field, in the file name and in the project name always appeared as plain text. No script ran, no element was injected, no request left the page, and no shared JavaScript object was altered.
- **Refusals** (T-018, T-029, T-058): the Studio refused files and stored copies that fail its format check. The message was short, repeated no text from the file, and the open project stayed unchanged.
- **Full storage** (T-012, T-016, T-027): the Studio never said "Saved" when it could not save, and it asked before it replaced work that it could not keep a copy of.
- **Two and three tabs** (T-035, T-048): one tab saves and the others stop and say so. The status matched storage in every round.
- **Leaving fast** (T-014, T-034): the save that runs when the page closes kept typing done a few milliseconds before a close or reload.
- **Hostile text after "#" in the address** (T-043): the Studio fell back to the Directions view and injected nothing.
- **The preview frames**: they stayed locked and contained no script. The tests caught both planted defects, in the CSS guard and in the HTML escaping (T-037, T-042).
- **Records against the code**: D42's statements and the research records held (T-021, T-045, T-057), and the "close to" labels are correct (T-003).
- **Kept copies**: they survived a very long list and a copy in an unknown form (T-017). A damaged saved copy was kept before the Studio replaced it (T-026).

---

<!-- Round 2 (the retest round). Written by a second judge (a separate AI assistant that took no part in the attack and did not see the Studio's reply), 2026-11-13. The judge could not write files, so the lead saved the judge's text here, unchanged. Nothing above this line was edited. -->

# Campaign 4, round 2: the retest judge's findings

2026-11-13 · pin `dbddf15` (built pages in `.../scratchpad/target2/`; my working copy has no Studio or core code change since the pin: `git diff --stat dbddf15 HEAD -- apps packages scripts` is empty) · I received 29 attempts (R-001 to R-029).

## Retest of round 1

| finding | result | what you ran and saw |
|---|---|---|
| F-1 | retested-pass | I re-ran round-1 `b1-held-notice-lost.cjs` and `b4-held-variants.cjs`, pointed at target2 (copies in `/tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/judge2/rerun/set-1/`). After Undo and on the Summary, the stopped-saving notice stayed with its "Go on: let the Studio save over it" button (count 1), and the status line still read "Not saving". On reload, the session work ("Hours of new work, final") was in the kept copies. Variants (7) unreadable copy and (8) two tabs: the notice and its buttons stayed after Undo. R-013 shows the same result. |
| F-2 | retest-failed (narrow) | Own script `.../judge2/j-f2.js`. **With a Direction:** "Reload to see the other copy" kept B's work ("This tab's copy of the project “B work that matters”, as it was before you reloaded…"). R-025's reload mode agrees (4/4). **Without a Direction** (the exact round-1 reproduction, `rerun/set-6/a4-held-reload-close.js` PART2, and my no-Direction run): B's typed name was discarded and the kept copies were `[]`. The cause is `hasWork()` (store.ts:163), which counts a project with no Direction and no Decision as "no work". Yet the notice says "Whichever you choose, the Studio first keeps the other copy". The remaining loss is only a project name, so S1. |
| F-3 | retested-pass | Re-ran round-1 `hostile-file.cjs` on target2. The Decision still changes from "stars" to "plain", but the notice now says: "One Decision in the file named a choice that the file's own design values do not show. The Studio follows the design values, so it changed that Decision to match them." No request left the page. |
| F-4 | retested-pass | I read `packages/core/src/catalog/steps.ts:496`. The Option text now says "some sit behind the headline and behind the first lines of text… The contrast checks do not measure text over a star." That matches what round 1 measured. I did not re-count pixels. |
| F-5 | retested-pass | Re-ran `r07_sliders.js "Frontier Gazette" 9`: at the highest settings, frame W=375 and S=375, nothing went past the edge. Re-ran `r04_overflow_step9.js "Marquee Deco" 9` (changed `.check` to `.click` because the old call timed out): no frame was wider than the phone for any of the 5 Options, including "Very large headings". R-007 and R-015 (144 sessions) agree. |
| F-6 | retested-pass | In the same r07 run, the `[min]` line (13 px, 1.067) gave a headline of 17.338 px, above the 13 px body text. R-007 agrees. |
| F-7 | retested-pass | Re-ran `b2-full-midsession.cjs`. After Undo to the last saved state, and again 3 s later, the status line read "Cannot save here: this browser's storage is full or blocked…", not "Saving…". R-014 agrees. |
| F-8 | retested-pass | `npx vitest run packages/core`: 143 passed. PROGRESS.md says 143. Browser tests: 52 in studio.e2e.ts (vitest list) and 76 visual. I counted the visual tests from the source loops: 23 + 9 + 1 + 3 + 19×2 + 1 + 1 = 76, which matches PROGRESS's 128 (52 + 76). 18 Directions is also correct. I did not run the browser suite. |
| F-9 | retested-pass | Own script `.../judge2/j-f9.js` (Galactic Goth, Step 6, sliders): stored density 1.12, slider value "1.12", step "any", aria-valuetext "1.12". |

## New findings

```
F-10 | 2026-11-13 | S2 | status: confirmed
Attempts: R-016 (part 2), R-025 (close mode)
Exam-question link: a. Two Studio tabs that have stopped saving and are closed at the same moment (closing the browser window) each try to keep their unsaved work as a copy, and one copy can replace the other, with no statement anywhere.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/judge2/scripts/set-1/a6-keep-both-then-close.js (the "close-two-held" lines). Set-up: tab A saves "A-edit-n"; tabs B and C stop saving and type "B-more-n" and "C-more-n"; B and C close together.
Observed: In 2 of 10 trials (#5, #6), kept = ["B-more-n"] only. "C-more-n" was not stored, not kept, and tab A showed no notice. In the other 8 trials, both copies were kept.
Reproductions: 2/10 (attacker: 1/10 in R-016 part 2, 1/4 in R-025).   Why it matters: The Studio promises that a tab which stopped saving keeps its work as a copy when it closes. Closing the window with two such tabs open can quietly lose one tab's work.
Judge note: I graded it S2 rather than S3. Both tabs had said "Not saving: see the notice", it takes two or more stopped tabs, and the loss happened in about 1 of 5 closes. The attacker's cause (two tabs read and rewrite the shared kept-copies list at the same time) fits what I saw, but I did not trace it in the source. Playwright closes the tabs a few milliseconds apart. A real window close may space them differently. I did not test that.
```

```
F-11 | 2026-11-13 | S2 | status: confirmed
Attempts: R-028
Exam-question link: a and b. The dialog shown when storage is full says "Undo brings it back only until you close or reload this page", but Undo remembers only the last 40 changes. After 40 ordinary changes (typing a 45-letter name is 45 changes), the replaced project cannot come back, and nothing says so.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/judge2/scripts/set-3/a1-history.js
Observed: The saved project was Midnight Aurora with Decisions nav, hero and sections. Storage was made nearly full (capacity shim, 50 characters spare). The second dialog read "…If you go on, your current project is replaced; Undo brings it back only until you close or reload this page. To be safe, choose “Keep my project”…". After "Replace it without a kept copy": stored project direction null, 0 Decisions, backup key null. Then "Start from Soft Daylight" and typing a 45-character name. "undos possible: 40"; final stored direction soft-daylight; "OLD PROJECT RECOVERED BY UNDO? false". The last notice was "Undone: the project's name is “Baker” again." There was no message that the Undo history had run out.
Reproductions: 1/1.   Why it matters: The owner trusts "Undo brings it back until you reload" and keeps working. A minute of typing later the old project is gone for good, in the same session, without a word.
Judge note: Reaching it needs full storage and a click on the button marked as dangerous, after the dialog advised "Keep my project". That is why it is S2, not S3. The same Undo promise appears in the ordinary start-again, open-file and start-new dialogs (store.ts:640, 653, 699, 708). Those also keep a copy, so there the promise is untrue but nothing is lost. HISTORY_MAX = 40 is at store.ts:178.
```

```
F-12 | 2026-11-13 | S1 | status: confirmed
Attempts: R-016 (part 1), R-026, R-025 (keep mode)
Exam-question link: a and b. When "Keep this tab's copy" is pressed in two stopped tabs at the same instant, both tabs can say "Saved in this browser" while storage holds only one. Or both stay stopped, and on closing one tab's work is neither stored nor kept.
Repro: node .../judge2/scripts/set-1/a6-keep-both-then-close.js (the "keep+close" lines); node .../judge2/scripts/set-1/a7-keep-with-human-gap.js
Observed: a6, 6 trials: 4 lost a piece of work. In trial #2, B and C both showed "Saved in this browser, on this computer" with no notice, stored = "B-more-2", and after closing "C-more-2" was nowhere. In trials #3, #4 and #6, both tabs showed "Not saving", and after closing one tab's work was missing. No leave-page question was asked. a7: with the presses 0 ms apart, 2 of 3 trials lost a piece. With gaps of 50, 150, 400 and 1000 ms, 0 of 12 lost anything, and every status line was true.
Reproductions: 4/6 and 2/3 at 0 ms; 0/12 at 50 ms or more.   Why it matters: Two tabs can both claim "Saved" when only one is, and work can then disappear. It needs two clicks within a few milliseconds in two tabs.
Judge note: By type this would be S2 (a false "Saved") or S3 (silent loss). I graded it S1 because one person with one mouse cannot press two buttons in two tabs within 50 ms. I did not check the attacker's cause (a stale storage read in the conflict check and in leaveSafely) in the source.
```

```
F-13 | 2026-11-13 | S1 | status: confirmed
Attempts: R-002
Exam-question link: d (a broken layout). On three catalog Directions, with nothing touched, the Phone and Tablet previews draw the main headline smaller than every section heading.
Repro: node .../judge2/scripts/set-4/h1h2.cjs
Observed: Phone: Vector Horizon h1 26 px vs h2 31.875 px; Frontier Gazette 26.25 vs 31.875; Marquee Deco 26.25 vs 31.875. Tablet: 31.98 vs 35.15; 33.98 vs 37.35; 32.98 vs 36.25. Heading weights were equal. The control, Galactic Goth: h1 47.2 vs 31.9 (phone), 68.1 vs 47.2 (tablet).
Reproductions: 1/1 (8 measurements).   Why it matters: The headline is meant to be the biggest thing on the page. On these looks, "What we do" outranks it, and the owner judges the look from this preview.
Judge note: The source shows why. `.hero h1` is capped at `13vw * var(--display-scale)` (templates/smallBusiness.ts:220), while h2 is capped at 8.5vw (tokens.ts:532). For these Directions the h1 cap falls below the h2 cap. The caps were added for round-1 F-5. The browser test "keeps the headline the largest text" compares the headline only with the reading text, not with section headings, so it passes. I did not check the desktop width.
```

```
F-14 | 2026-11-13 | S1 | status: confirmed
Attempts: R-029, R-005
Exam-question link: b (and a, mildly). If a slider is moved onto the exact value of an Option the owner had rejected, the saved Decision holds that Option and also lists it as rejected. On the next reload the Studio says "Opening changed some details of your saved project" and writes a kept copy, although the owner only moved a slider.
Repro: a copy of the attacker's g-contrast-reload.cjs with a second reload added: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/judge2/g2.cjs
Observed: The stored Decision was {"kind":"tuned","rejected":["soft","crisp"],"optionId":"soft","values":{"contrast":0.4}}, and the screen said "Large preview shows: Low contrast (soft) (in use)". After a plain reload the notice read "Opening changed some details of your saved project. The Studio kept the copy as it was; you can download it from the Summary." and a new key, refraction.project.backup, appeared. The stored Decision still held the contradiction. After a later pick on another Step and a second reload, there was no notice.
Reproductions: 1/1 (the attacker's engine fuzz hit it in 2/400 runs).   Why it matters: The record of choices, which feeds the taste ledger, says the owner rejected the very Option now in use. The owner also gets an alarming "changed details" notice for an ordinary action.
Judge note: Nothing is lost: the notice is true and a copy is kept. I did not run the attacker's fuzz test. My page run reproduces the defect directly.
```

```
F-15 | 2026-11-13 | S1 | status: confirmed
Attempts: R-017
Exam-question link: b (a wrong label). After the Studio stops saving because opening changed the saved copy and storage is full, "Go on: let the Studio save over it" leaves the status at "Nothing to save yet", and the old form is still stored.
Repro: node .../judge2/scripts/set-3/a2-resume-status.js
Observed: On opening, the status read "Not saving: see the notice…" and the notice listed the left-out Decision with the buttons "Download your saved copy as it was" and "Go on: let the Studio save over it". After Go on: "status after Go on: Nothing to save yet", no notice, "stored copy unchanged (still the old form)? true". After a rename, the status read "Saved in this browser…" (stored name "Renamed after go on"). After Undo, "Saved…" (stored "My first project").
Reproductions: 1/1.   Why it matters: The button promised a save that did not happen, and the status line describes a project that exists as having nothing to save.
Judge note: Nothing is lost. The old form reopens the same way and asks again, and the next edit saves. resumeSaving() (store.ts:388) sets 'idle' and skips the save because the opened text equals lastSavedText. Reaching it needs full storage plus an older or foreign saved copy, so it is rare.
```

## Collateral findings

None.

## All attempts

| id | disposition | one-line reason |
|---|---|---|
| R-001 | held | Unreadable copy and full storage: clear notice, copy untouched |
| R-002 | finding F-13 | Headline smaller than section headings on three Directions, phone and tablet |
| R-003 | not a finding | No "Next" button by design; the blank cards appeared only in a full-page screenshot (capture artifact) |
| R-004 | held | A pick followed at once by a reload survived |
| R-005 | finding F-14 | Engine fuzz: a tuned Decision names an Option it also lists as rejected |
| R-006 | not a finding | Code reading only. Version 1's one "theme" Step covered contrast too; the split is documented in engine.ts:680 |
| R-007 | held | Retest of F-5 and F-6: slider ends fit the phone; headline above body text |
| R-008 | held | Keyboard path works at 640×360; Tab passes through the preview without a trap |
| R-009 | held | 0 of 12 losses when a tab closes the moment it says "Saved" |
| R-010 | no test | Chromium did not restore the page from the back-forward cache |
| R-011 | not a finding | The Studio's "Sample website" label covers a headline word until scroll. Round 1 did not count this label either; cosmetic |
| R-012 | not a finding | Near-flat sizes at the slider ends, but the headline is still largest; a matter of taste |
| R-013 | not a finding | Stopped tab reloaded with full storage loses work, but the status had said "Not saving" and the browser asked before leaving (same as round-1 T-007) |
| R-014 | held | Retest of F-7: "Cannot save here" stays after Undo |
| R-015 | held | 144 slider-end sessions: no overflow, no clipping, no errors |
| R-016 | finding F-10, F-12 | Part 2: closing two stopped tabs loses a kept copy (F-10). Part 1: double "Keep this tab's copy" gives a false "Saved" and loss (F-12) |
| R-017 | finding F-15 | "Go on" leaves "Nothing to save yet" and does not save |
| R-018 | not a finding | Hand-tuned Decision not recomputed: a documented choice, and the Summary says "Set by hand, close to…" |
| R-019 | held | Code reading found no stale shownId path |
| R-020 | not a finding | Conflict path never reached; in the one odd trial both tabs said "Not saving" and nothing was lost |
| R-021 | not a finding | "Cannot save" stays after space is freed: over-cautious, no work at risk, the next edit or closing saves |
| R-022 | held | Start screen fits 375 px; 18 Directions |
| R-023 | held | 204-character name causes no overflow |
| R-024 | held | Sliders inside a closed disclosure cannot be focused, as expected |
| R-025 | finding F-10, F-12 | Close mode lost a kept copy (F-10); keep mode left storage and screens disagreeing (F-12); reload mode held |
| R-026 | finding F-12 | Gives the rate: loss only at a 0 ms gap, none at 50 ms or more |
| R-027 | not a finding | After F5 in a stopped tab, the typed work is a kept copy listed on the Summary; nothing lost, only no fresh notice |
| R-028 | finding F-11 | "Undo brings it back" is untrue after 40 changes; the old project is lost |
| R-029 | finding F-14 | Same defect as R-005, on the page: the Decision contradicts itself, and a reload shows "changed details" and writes a kept copy |

## What held

- The round-1 fixes for the stopped-saving notice (F-1), the "Saving…" line (F-7), phone overflow (F-5), the reversed headline (F-6), slider knob values (F-9), the silent Decision rewrite (F-3, now announced), the "Field of stars" text (F-4) and the record counts (F-8) all held when I re-ran them.
- "Reload to see the other copy" now keeps this tab's work whenever the project has a Direction or a Decision. The gap left is a project with only a name.
- A single tab, a reload inside the save delay, and closing the moment a tab says "Saved" lost nothing (R-004, R-009, R-027c).
- With human-paced clicks (50 ms or more apart), two tabs never gave an untrue status and never lost work (R-026).
- Full storage gave honest "Cannot save" and "Not saving" lines. Dangerous replacements asked first (R-001, R-014, F-7 re-run).
- Slider ends across 6 Directions, 6 Steps and two device widths produced no overflow or clipping (R-015). The Studio itself fits 375 and 640 px (R-022, R-023, R-008).
- No run made a network request or showed a page error. The hostile-file re-run injected nothing.
