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


# Campaign 4, round 3: the third judge's findings

The text below is the judge's own, unchanged. The judge worked in a context of its own, received the 56 attempts under anonymous numbers (Q-001 to Q-056) without the attackers' identities or their own assessments, and reproduced each claimed result against the pin.

2026-11-14 · pin 6cbd764 (branch claude/harden-studio-review-fixes, built pages in scratchpad/target3) · 56 attempts received (Q-001 to Q-056)


## Retest of round 2

| Finding | Result | What the judge ran and saw |
|---|---|---|
| F-2 (narrow rest: a project with only a name) | retested-pass | I wrote my own script, node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/f2.cjs. It runs 3 trials with no Direction: tab A names the project 'Base', tab B opens, A renames, and B types 'B work that matters i', so B shows 'Not saving'. The stored project had direction null. I then clicked 'Reload to see the other copy' in B. In all 3 trials B reloaded to 'A changed it', and the kept copies held ['B work that matters i']. No requests left the page. The source now keeps a copy for any project whose name is not one of the Studio's own (worthKeeping, store.ts:180). |
| F-10 | retested-pass | I wrote my own script, node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/f10.cjs 20. Tab A saves 'A-edit-i'. Tabs B and C stop saving and type 'B-more-i' and 'C-more-i'. Then B and C close in the same instant (Promise.all of page.close with runBeforeUnload). Neither copy went missing in 20 of 20 trials, and each trial set the kept note. No attempt broke this exact path. A related loss through the tab's running copy is new finding F-16, and a race between two tabs that were still saving is F-18. Neither one is the shared-list race of F-10. |
| F-11 | retested-pass | Every replace dialog now takes its wording from one constant (store.ts:197): 'Undo brings it back as long as it is among your last 100 Undo steps…'. HISTORY_MAX is 100. I re-ran Q-030's script from my own folder (judge/s1/b1u.cjs). Undo turned disabled after exactly 100 presses, the replaced project was out of reach as the dialog says, and it was still kept as a copy. Q-028 shows that the full-storage dialog repeats the same limit. The promise now matches the behavior. |
| F-12 | retested-pass | I wrote my own script, node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/f12.cjs 20 (log f12.log). Two stopped tabs B and C type their own work, and 'Keep this tab’s copy' is clicked in both in the same instant. I read both status lines, then closed both tabs in the same instant. Over 20 trials: 0 false 'Saved' (both tabs said 'Not saving' and the hold stayed) and 0 lost pieces of work (A, B and C each turned up as the stored project or as a kept copy). Side effect: A's copy was often kept twice (['A-edit-0','A-edit-0','B-more-0']). That is harmless, and Q-026 saw it too. |
| F-13 | retested-pass | I adapted the round-2 h1h2 script to the new page: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/h1h2.cjs. It covers six Directions, each in the Phone, Tablet and Desktop previews. The headline was larger than every section heading in all 18 cases. Examples: Vector Horizon phone 36.66 against 31.88 and tablet 40.42 against 35.15; Frontier Gazette tablet 42.95 against 37.35; Marquee Deco tablet 41.69 against 36.25; Control Room 31.10 against 25.92. Q-002 and Q-011 agree, at the slider ends as well. |
| F-14 | retested-pass | I ran the round-2 g2 steps against the new page: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/f14.cjs. I picked Medium contrast, then moved the slider onto Low contrast (soft). The stored Decision was {kind:'tuned', rejected:['crisp'], optionId:'soft'}, so 'soft' was no longer in the rejected list. After a plain reload there was no 'Opening changed some details' notice and no kept copy. Q-029's engine fuzz (1,500 runs) found no Decision that rejects its own Option. |
| F-15 | retested-pass | I wrote my own script, node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/f15.cjs. From a separate blank page it places a saved project that holds a Decision for an unknown Step, fills storage to its limit, and then opens the Studio. The notice read: '…Opening changed some details of your saved project. This browser’s storage is full or blocked, so the Studio could not keep that copy. It has stopped saving…'. After 'Go on: let the Studio save over it' the status read 'Saved in this browser, on this computer'. The stored copy no longer held the unknown Step, so the statement was true: the smaller new form fitted. |

## New findings

```
F-16 | 2026-11-14 | S2 | status: confirmed
Attempts: Q-010, Q-001, Q-052
Exam-question link: a and b. A tab that has stopped saving keeps a 'running copy' of its unsaved work. Later copies count that running copy as already kept, but the tab removes it at its next tab switch. The work then is in no storage entry, although a dialog and a later notice say a copy was kept.
Repro: Copied the attacker's scripts into my folder, with the screenshot path changed: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/a2-running-copy-evicts-kept-decisions.cjs ; node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/a1-running-copy-evicts-kept.cjs ; node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/set-2/a6-shared-running-copy.cjs (that one writes no files). Steps (Q-010): in tab 1, start from a Direction, name 'Weeks of work A', make 3 Decisions. Tab 2 renames, so tab 1 shows 'Not saving'. Tab 1 renames and then goes to the background. Then 'Start from' another Direction, confirm 'Start again', rename to 'New project B', and go to the background again.
Observed: The dialog said: 'This replaces your current design and clears your 3 Decisions… The Studio also keeps a copy of the replaced project where this browser allows it; the Summary lists every kept copy.' Before Start again, the kept copies held 'Weeks of work A plus edits made while not saving'. After Start again the list was unchanged: no new copy was written. After the second tab switch the list held only 'New project B'. RESULT: '…plus edits…' was in storage anywhere: false. After a reload the banner said 'A page of the Studio closed or reloaded while it was not saving. The Studio kept that page’s unsaved work as a copy…', and the Summary listed only 'New project B'. Q-001 (no Decisions, no dialog) gave the same RESULT: false. Q-052 (two stopped tabs with the same unsaved text; one closes) gave C_WORK_LOST true, and a later reload showed the same 'kept that page’s unsaved work' banner. No outside requests.
Reproductions: 3/3 (Q-010 1/1, Q-001 1/1, Q-052 1/1).   Why it matters: The Studio promised to keep a copy of the project it was about to replace, and later said it had kept the unsaved work. A few minutes later that copy is gone, and nothing says so.
Judge note: The source matches the attacker's cause. keepBackup and keepRunningCopy return early when any kept copy has the same text (platform.ts:242, 261). keepRunningCopy then removes this tab's earlier running copy (platform.ts:271), and replacing the project does not call endRunningCopy. The tab switch was simulated: document.visibilityState was overridden and visibilitychange dispatched, because headless Chromium does not hide tabs. A real tab switch fires the same event, but I did not run one. Every case first needs a second tab to change the project, after which the owner works on despite 'Not saving'. In Q-010 the 3 Decisions themselves were still in tab 2's stored project. What was lost for good is the work tab 1 did while it was not saving (here a rename, but in general any amount). I graded it S2 (a guard and its promise fail) rather than S3, because a 'Not saving' line was on screen the whole time. Arguing S3 would also be fair. Q-052 needs two tabs with byte-identical unsaved work, which is rare.
```

```
F-17 | 2026-11-14 | S2 | status: confirmed
Attempts: Q-009, Q-022
Exam-question link: a. Picking a different Option on a Step deletes the reason the owner typed for that Step. No message appears, and the field is empty on return.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/b1.cjs B2 (the attacker's script with its screenshot path moved to my folder). Steps: start from Sticker Pop. On Spacing, pick 'Tight' and continue. Come back, type 'our visitors compare prices' in the reason field, and wait 1.7 s. Click the 'Roomy' card and press 'Pick “Roomy” and continue'.
Observed: Stored reason after typing: "our visitors compare prices". After the pick, the stored Decision was {"kind":"picked","rejected":["compact","default","spacious"],"stepId":"density","optionId":"comfortable","values":{"density":1.15}}, with no reason field. The only visible lines were 'Saved in this browser, on this computer' and '2 contrast notes (advice; nothing was changed)'. In the source, pick() (engine.ts, ~line 204) builds the new Decision without previous.reason, while pickValues() and tune() copy the reason over.
Reproductions: 1/1 (and Q-022 reports the same on the nav Step through another path).   Why it matters: The owner wrote down why they made a choice, then changed their mind about the Option. The written reason disappears without a word, and the taste ledger loses it.
Judge note: I found no recorded design rule that a new pick clears the reason. The engine is inconsistent: a slider move keeps the reason, while a pick drops it. Top-bar Undo can bring the reason back, but only by also undoing the new pick, and only if the owner notices. By type this is S3 (saved work changed silently) on an ordinary path. I graded it S2 because the loss is one typed sentence and Undo can recover it within the session. I did not run r4.cjs for Q-022; its account and the source agree with my run.
```

```
F-18 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-045
Exam-question link: a. Three tabs on one project all rename in the same instant, and two are closed together while their delayed saves are due. One closed tab's work is then neither the saved project nor a kept copy, and no note is left.
Repro: My own variant at a fixed delay: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/q045.cjs 24 280 (it uses set-2/common.cjs read-only; the log is judge/s/q045-280.log). Each trial: seed 'Seed'; open tabs A, B and C; fill 'A-i', 'B-i' and 'C-i' at once; wait 280 ms; close A and B together with runBeforeUnload; read storage from C.
Observed: 8 of 24 trials lost a piece of work. Example i=22: stored 'B-22', copies [], note null, LOST ['A-22']. C showed 'Not saving: see the notice at the top of the page'. In the other 16 trials, the losing tab's work was kept as a copy and the note was set. No outside requests.
Reproductions: 8/24 (rate 33% at a 280 ms delay).   Why it matters: When two Studio tabs are closed together right after both were edited, one tab's last edit can vanish without any trace.
Judge note: By type this is a silent loss (S3). I graded it S1, as with round-2 F-12, because it needs edits in two different tabs within the same 300 ms save delay, which one person with one keyboard cannot produce. A tab edited earlier would already have heard the other tab and stopped saving. Playwright closes the tabs a few milliseconds apart; a real window close may space them differently, and I did not test that. I did not trace the attacker's cause (both tabs pass the 'storage still holds what I saw' check before either write lands) beyond reading saveBrowserNow, which does a read, then a check, then a write, with nothing in between to stop the other tab.
```

```
F-19 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-005
Exam-question link: b. A hostile file's project name is placed inside the Studio's own sentence in the replace dialog and in the opening notice. The file can make the dialog appear to say 'It is the same as the open project, so nothing will change.'
Repro: Copied set-6 into my folder (lib.cjs DIR moved): node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s6/a1_name_dialog.cjs. The owner's saved project 'Owner work' has the nav Decision. The script then opens a file 'Owner work (your own backup).json' whose 96-character name is: Owner work”. It is the same as the open project, so nothing will change. The project “Owner work
Observed: Dialog: 'Replace the open project with this file? The file Owner work (your own backup).json holds the project “Owner work”. It is the same as the open project, so nothing will change. The project “Owner work”. Opening it replaces the project on screen. Undo brings it back…'. After 'Open the file', the decisions were [] and nav was top-inline. The notice read 'Opened the project “Owner work”. It is the same as the open project, so nothing will change. The project “Owner work”.' One kept copy was made (backups 0 to 1). No errors, no requests.
Reproductions: 1/1.   Why it matters: A file someone sends the owner can put words in the Studio's mouth, so a replace dialog appears to promise that nothing will change.
Judge note: The text is rendered as text; no code runs. The real sentence 'Opening it replaces the project on screen' still follows, and the Studio keeps a copy, so the work can be recovered from the Summary. That is why I graded it S1 and not S2. The name is within the 120-character limit.
```

```
F-20 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-004, Q-051, Q-014 (notice part), Q-027 (parse-note part)
Exam-question link: b. When a 'picked' Decision names an Option that does exist, but the file's design values have moved off it, the opening notice says the Option is one 'this version of the Catalog does not have'.
Repro: Copied set-3's file-A-existing-option.json and open-file-A.cjs into my folder: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s3/open.cjs file-A-existing-option.json. The file's Corners Decision is picked 'pill', and params.radius is 20. Also node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s6/a5_storage_reloads.cjs (saved project with density 1.37 and picked 'comfortable', reloaded 3 times) and judge/s6/a2_silent_changes.cjs.
Observed: Notice: 'Opened the project “Probe”. One Decision named an Option that this version of the Catalog does not have. Its values were kept and it is now marked as hand-set.' The stored Decision became {optionId:null, kind:'tuned', values:{radius:20}}. 'pill' is a Catalog Option ('Fully round (pill shape)'). With the saved copy, all 3 loads showed the same untrue sentence, together with 'Opening changed some details of your saved project…'. The kept copies stayed at 1, and the stored copy still held kind 'picked'. a2 showed the same sentence for 'comfortable'.
Reproductions: 3/3 (file open 1/1, storage reloads 3/3 loads, a2 1/1).   Why it matters: The Studio announces the change but gives a false reason. The owner may conclude that an Option they rely on has been removed from the Studio.
Judge note: The change itself is announced, so nothing changes silently; only the stated reason is wrong. That makes it S1. The attacker's point that 'pill' now appears in the rejected list is partly wrong: file-A itself already listed 'pill' as rejected. Q-043 shows that the 20.04 test does not cover this branch. The repeated notice on every reload happens because the stored copy is rewritten only after an edit. I did not run the attackers' vitest probe.
```

```
F-21 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-013, Q-014, Q-015
Exam-question link: a. When a hand-edited or hostile file is opened, the Studio rewrites parts of Decisions that the design values do not settle and does not say so: the rejected list, a Decision's Step and values, a 'kept' Decision's values, and its time. It also drops unknown parts of the file.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s3/open.cjs file-B-rejected.json ; node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s6/a2_silent_changes.cjs
Observed: file-B: the notice was only 'Opened the project “Probe”.' The rejected list went from ['square'] to ['square','crisp','subtle','pill'], while the reason 'tried square only' was kept. a2: the hero Decision with stepId 'radius' and values {radius:999} became stepId 'hero', values {hero:'text-left'}, rejected [centered, split-media, statement], at 1970-01-01T00:00:00.000Z (the file said 'yesterday'). The kept theme Decision's values {theme:'dark'} became {theme:'light'}. Downloaded keys were only the 9 standard ones (notesForOwner, content.extraSection and params.futureParam were dropped), and -0 became 0. The only notice was the untrue sentence of F-20, which concerns a different Decision.
Reproductions: 2/2.   Why it matters: Guarantee 20.04 says a silent change to the record of choices would be 'a second, hidden truth'. Here the record of which Options were rejected, and when, changes on opening with no word.
Judge note: Only a hand-edited or hostile file reaches this; the Studio's own saves never contain these shapes (Q-040 and Q-042 round trips came back unchanged). Nothing in the design changes, and nothing runs. Dropping unknown top-level parts may be a deliberate choice, but I found it stated nowhere on screen. I did not run the core-only probe for Q-015; a2 shows the same date rewrite on the page.
```

```
F-22 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-018, Q-025, Q-034, Q-016, Q-027
Exam-question link: b. When a stored value lies beyond a slider's range, the slider, its readout and the Summary's words state the slider's end value as the design's value. One of these cases is reached through a Catalog Option.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/b1.cjs B3 (Galactic Goth, pick 'Golden yellow', reopen the sliders) ; node .../judge/s/b1.cjs B5 ; node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s6/a6_slider_truth.cjs ; node .../judge/s6/a7_keep_clamped.cjs
Observed: B3: the stored accentLightness was 0.8, but the slider output said '0.68' and its value was 0.68. The Catalog sets this slider's dark-page range to 0.48..0.68 (steps.ts:361), while the Option 'Golden yellow' sets 0.8. One 'darker' key press changed the stored value to 0.68 and the Decision to tuned/null, and the preview's --accent stayed '#efbd24' before and after. a6 (file with baseSize 30, scaleRatio 2, radius 999, density 2): the sliders showed 22 [13..22], 1.62, 28 'fully round' and 1.45. One ArrowLeft press left baseSize at 30. a7: after 'Keep my design', the stored Decision held baseSize 30, scaleRatio 2, but the Summary read 'Kept: close to “Very large headings”: text size clearly larger (22px); heading size jump clearly more dramatic (1.62)', and Spacing read '(1.45)' while 2 was stored. B5: stored radius 40, Step list 'close to “Clearly rounded (14 px)”: corner rounding clearly rounder (28px)'.
Reproductions: 4/4.   Why it matters: The Studio shows a number the design does not hold. The owner may judge or record a choice on the wrong figure, and one key press can change the record while the preview stays the same.
Judge note: No work is lost, and the preview draws the real values; only labels and readouts are wrong. That makes it S1. Only the Golden-yellow path (Q-018) is ordinary use. The other cases need a hand-made file or hand-edited storage (B5 writes storage with page.evaluate and then reloads, but the stored 40 survived, so that browser artifact did not apply). I did not confirm Q-025's claim that the 'Your design now' card says 'These values come from the plain start', because my a7 run did not find the card text.
```

```
F-23 | 2026-11-14 | S1 | status: confirmed
Attempts: Q-019
Exam-question link: b and d. After a failed save, Undo back to the stored state keeps 'Cannot save here…' on screen, and 'Try to save again' cannot clear it even after storage has room.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s1/c2.cjs (the attacker's script with its screenshot path moved). Save 'Work X', fill storage, rename, retry, Undo, free storage, retry twice, reload.
Observed: Step 4, after Undo (screen 'Work X' = stored 'Work X'): 'Cannot save here: this browser’s storage is full or blocked. Download the project file before you close this page.' with a retry button. Steps 6 and 7, after freeing storage and pressing 'Try to save again' twice: the same text and button. Step 8, after a reload: 'Saved in this browser, on this computer', stored 'Work X'.
Reproductions: 1/1.   Why it matters: The page tells the owner the work cannot be saved and that they must download a file, when the work is in fact saved, and the offered button does nothing.
Judge note: The untrue statement errs on the side of caution, and nothing is lost. The next real edit or a reload clears it. It needs full storage first. So S1.
```

```
F-24 | 2026-11-14 | S1 | status: needs human review
Attempts: Q-007
Exam-question link: a and b (possibly). On Galactic Goth, a Decision recorded as 'kept Two colors: a third of the wheel apart' quietly loses its Option name after the main color changes, and the Summary then calls the value a move 'toward red'.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s/b1.cjs B1
Observed: After the keep: {kind:'kept', optionId:'duo-triad', values:{colorStrategy:'duo', accent2Hue:18}}. After picking 'Bright blue' (264): accent2Hue 18 and the Decision optionId null, with no notice. Summary: 'Kept: close to “Two colors: a third of the wheel apart”: second color moved toward red (18° on the color wheel)'.
Reproductions: 1/1.   Why it matters: The record of what the owner chose changes its label without a word when a different Step is edited.
Judge note: The stored values did not change. 'Kept' records the value the design held, and 18 is still held, so this may be the intended meaning of 'kept' on a Direction whose second color is fixed. The attacker's control case (Sticker Pop, where a kept triad follows) suggests an inconsistency, but I did not run it. Whether 'moved toward red' reads as the owner's action or as a description is a judgment of wording. I left the decision to a person.
```

```
F-25 | 2026-11-14 | S0 | status: confirmed
Attempts: Q-003
Exam-question link: b (minor). In the older one-list form of kept copies, removing one of two copies with the same text and time removes the first such copy, not the one clicked.
Repro: node /tmp/claude-0/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/scratchpad/campaign4/round3/judge/s7/a5_kept.cjs (the attacker's script with its paths moved to my folder)
Observed: After 'Remove this kept copy…' on 'legacy dup B', the list held 'legacy dup B' and 'legacy dup A' was gone. Raw list: [{"keptAt":"2025-05-01T00:00:00.000Z","why":"legacy dup B","text":"SAME"},{"keptAt":"","why":"An earlier kept copy, in a form this version of the Studio does not know.","text":"a bare string member"},{…"legacy other"…}].
Reproductions: 1/1.   Why it matters: The owner removed one copy and a different one went. Both held the same project text, so no project content was lost.
Judge note: This needs hand-made storage in the older form with two members sharing text and time. removeBackup (platform.ts:328) ignores 'why'. The bare string member was rewritten into object form, but its text stayed the same. For information only.
```

## All attempts

| Attempt | Disposition | Reason |
|---|---|---|
| Q-001 | finding F-16 | Reproduced: the running copy that a later tab switch removes was the only copy of the stopped tab's work. |
| Q-002 | held | The observation describes no overflow and the correct heading order at all sizes. |
| Q-003 | finding F-25 | Reproduced: the wrong member of the older list is removed; the text is identical; S0. |
| Q-004 | finding F-20 | Reproduced: the notice claims that the Catalog lacks 'pill', which it has. |
| Q-005 | finding F-19 | Reproduced: the file's name forges a sentence inside the replace dialog; a copy is kept. |
| Q-006 | held | No work was lost; in the 2 of 15 double-write trials both tabs stopped saving and offered both choices. |
| Q-007 | finding F-24 | Reproduced, but whether this breaks the exam question is a judgment of meaning; needs human review. |
| Q-008 | held | No loss in 42 trials; the losing tab's work was kept. |
| Q-009 | finding F-17 | Reproduced: a re-pick deletes the typed reason with no message. |
| Q-010 | finding F-16 | Reproduced: the dialog promised a kept copy; after the next tab switch the replaced work was in no storage entry. |
| Q-011 | held | No overflow; the headline stayed largest at the slider ends. |
| Q-012 | not a finding | Download names follow list position, but each file holds and reopens the right project; nothing untrue is stated. |
| Q-013 | finding F-21 | Reproduced: the rejected list is rewritten silently on opening. |
| Q-014 | finding F-21 | Reproduced: silent rewrites of Step, values, time and extra parts; its notice is also the false sentence of F-20. |
| Q-015 | finding F-21 | Same silent time rewrite, seen on the page in Q-014's run; the core probe was not re-run. |
| Q-016 | finding F-22 | Extreme file values are accepted and shown clamped by the sliders; same defect as F-22. |
| Q-017 | held | No loss in 40 trials; the observation describes no violation. |
| Q-018 | finding F-22 | Reproduced: the slider says 0.68 while 0.8 is stored, reached through a Catalog Option. |
| Q-019 | finding F-23 | Reproduced: 'Cannot save' stays after Undo and after storage frees, and the retry does nothing. |
| Q-020 | held | Typing behaved normally and was stored. |
| Q-021 | not a finding | Generic or odd file names are not untrue statements; the name inside the file always matched, and no path escapes. |
| Q-022 | finding F-17 | Same defect as Q-009 on the nav Step; the source confirms it. |
| Q-023 | not a finding | The drop is Chromium's limit on repeated downloads; the message says only that the file was handed to the browser. |
| Q-024 | held | The attacker states the Studio held; 'Kept' with a non-start value is a state the Studio reaches itself. |
| Q-025 | finding F-22 | Reproduced: the sliders and Summary show the clamped 22/1.62/1.45 while 30/2/2 are stored. |
| Q-026 | held | No false 'Saved' and no loss in 10 trials; my 20-trial retest of F-12 agrees; the duplicate kept copy is harmless. |
| Q-027 | finding F-22 | Reproduced: the Step list says 28px while 40 is stored; its parse-note part is the F-20 defect. |
| Q-028 | held | The replace on full storage was saved truly, and Undo restored the old project. |
| Q-029 | held | Engine fuzz found 0 failures. |
| Q-030 | held | The 100-step Undo limit holds as the dialog states; I re-ran it for the F-11 retest. |
| Q-031 | not a finding | Reproduced the capped notice strip, but it is a scrolling region on purpose and its buttons stay reachable; not a dead end and not untrue. |
| Q-032 | not a finding | Needs hand-made storage with a lone surrogate; the Studio's own writes never produce one. |
| Q-033 | held | The test counts in PROGRESS.md match. |
| Q-034 | finding F-22 | Reproduced: the Summary describes the kept Decision with clamped values it does not hold. |
| Q-035 | held | No violation in 10 trials. |
| Q-036 | not a finding | Guarantee 20.03/20.04 states that a version-1 file has every Decision worked out again from its design values, and the notice says it was brought up to date. |
| Q-037 | held | No violation; the statements were true. |
| Q-038 | held | 0 mismatches between cards and picks. |
| Q-039 | held | Held Enter moved exactly one Step; I saw the same in my r5 run. |
| Q-040 | held | Clean round trip. |
| Q-041 | held | Every quoted test name exists. |
| Q-042 | held | Downloads, Undo, Copy and reopen all matched. |
| Q-043 | not a finding | A planted-defect check of test coverage; it supports F-20's note that the 20.04 test misses that branch. |
| Q-044 | held | Every damaged file was refused or opened safely, and the owner's project was untouched. |
| Q-045 | finding F-18 | Reproduced 8/24 at the 280 ms delay: one of two tabs closed together loses its work. |
| Q-046 | held | The Undo burst rule held. |
| Q-047 | not a finding | The attacker's own seeding artifact, as stated. |
| Q-048 | held | The hostile file was refused in fixed words; nothing ran or overflowed. |
| Q-049 | held | The downloads and status lines were true while storage was full. |
| Q-050 | held | The 40.03 test checks the repair independently. |
| Q-051 | finding F-20 | Reproduced: the false Catalog sentence appears on each of 3 reloads; no build-up of kept copies. |
| Q-052 | finding F-16 | Reproduced: C's work relied on A's running copy, which A then removed; a later notice claims the work was kept. |
| Q-053 | held | No notice and no outside requests after the reload. |
| Q-054 | held | Nothing broken; no requests. |
| Q-055 | held | Path (b) is correct; path (a) is the stated seeding artifact under a running page. |
| Q-056 | no test | Not reached; the path needs the private-page runtime. |

## What held

- No run made a request outside the page or showed a page error; hostile names and files ran no code and injected nothing.
- 'Reload to see the other copy' now keeps a project that has only a name (F-2 narrow rest: 3 of 3).
- Two stopped tabs closed together kept both copies in 20 of 20 trials (F-10). Pressing 'Keep this tab’s copy' in two tabs at once gave no false 'Saved' and lost nothing in 20 of 20 trials (F-12).
- The Undo promise now names its 100-step limit, and Undo stops at exactly 100 (F-11). 'Go on: let the Studio save over it' now saves and says so truly (F-15).
- The preview headline is larger than every section heading for six Directions on Phone, Tablet and Desktop (F-13). Moving a slider onto a rejected Option no longer leaves a self-contradicting Decision or a reload notice (F-14).
- Two tabs typing at the same instant, typing then closing, back-forward navigation, and keep-with-close or keep-with-reload races lost nothing (Q-006, Q-008, Q-017, Q-035, Q-037).
- Full round trips (23 Decisions, reasons, odd names, Copy as text, reopen in a fresh browser) came back unchanged apart from key order.
- Damaged, oversized, deeply nested and wrong-version files were refused in fixed words or opened safely, and the owner's project stayed in place.
- The engine fuzz (1,500 runs) and the card-against-pick comparison found no mismatch.
