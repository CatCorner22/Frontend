# [00] Studio guarantees: living reference

Version 1.2. Owner: the owner of this repository. Scope: this file states each guarantee that the Studio makes about saved work, project files, the preview, colors, Decisions, and its own words, and names the test or decision that backs each one; it does not cover design advice, the Fitter, or the plan.

Stale-after: 90

The living-reference skill generates the text between each `start` marker and its `end` marker. Regenerate after every edit. Do not edit generated text by hand.

**Four choices behind this file.** Assumed: the reader is the owner, who has no software background and looks things up by plain words such as "saved" or "file". Assumed: the unit is one guarantee (one rule that the Studio keeps). Assumed: the scope is the sentence above. Assumed: a section counts as stale 90 days after someone last checked it.

**What "guarantee" means here.** A guarantee is a behavior that an automatic test checks on every change, or that a recorded decision fixes. It is a statement about what was checked. It is not a promise that no defect exists: a test checks the cases that someone thought of. Each section's "Open" line says what nobody has checked.

## [01] Attack sheet

The lines used most often. Each line ends with the ID of the section that supports it.

- The Studio never saves over a copy that it could not keep, until you decide. §10.02
- The Studio never replaces a kept copy; each new kept copy joins the list. §10.03
- The Studio never overwrites a saved project that it cannot read; it offers that project as a download. §10.04
- The Studio asks before a file, a new Direction, or a new project replaces your work, and Undo brings the work back. §10.05
- When another tab changed the project, the Studio stops saving and says so. §10.06
- A notice that needs your answer stays on screen until you answer. §10.07
- A tab that is not saving keeps its unsaved work as a copy when it reloads or closes. §10.08
- A tab never takes another tab's save for its own. §10.09
- Nothing is saved before the saved project is open. §10.10
- A copy that the page's database hands over late is kept before any save can replace it. §10.11
- A saved project loads back exactly as it was saved. §20.01
- The Studio refuses a file that is not a project, in fixed words that repeat nothing from the file. §20.02
- The Mockup contains no script, no event handler, and no outside address. §30.01
- The Studio sends no request to any outside address. §30.04
- The Mockup fits a phone at every setting. §30.05
- A color pair that the Studio calls passing passes when a browser draws it. §40.02
- "Fix for me" says "repaired" only for a pair that now passes. §40.03
- The Studio never calls its output "WCAG compliant", "ADA compliant", or "accessible". §40.04
- Every Decision stays true to the design. §50.01
- A card shows exactly the design that picking it gives. §50.04
- A trade word appears only inside round brackets. §60.01
- No look changes by accident. §70.02
- Every browser test fails when the page meets an error. §70.04

## [02] Contents

<!-- toc:start -->
- [01 Attack sheet](#01-attack-sheet)
- [03 How to read this file](#03-how-to-read-this-file)
- [10 Saved work](#10-saved-work)
  - [10.01 The Studio saves every change in the browser, and saves at once when the page goes to the background](#1001-the-studio-saves-every-change-in-the-browser-and-saves-at-once-when-the-page-goes-to-the-background)
  - [10.02 The Studio never saves over a copy that it could not keep, until the owner decides](#1002-the-studio-never-saves-over-a-copy-that-it-could-not-keep-until-the-owner-decides)
  - [10.03 The Studio never replaces a kept copy; each new kept copy joins the list](#1003-the-studio-never-replaces-a-kept-copy-each-new-kept-copy-joins-the-list)
  - [10.04 The Studio never overwrites a saved project that it cannot read](#1004-the-studio-never-overwrites-a-saved-project-that-it-cannot-read)
  - [10.05 The Studio asks before a replace action, and Undo brings the work back within its stated reach](#1005-the-studio-asks-before-a-replace-action-and-undo-brings-the-work-back-within-its-stated-reach)
  - [10.06 When another tab changed the project, the Studio stops saving and says so](#1006-when-another-tab-changed-the-project-the-studio-stops-saving-and-says-so)
  - [10.07 A notice that needs the owner's answer stays on screen until the owner answers](#1007-a-notice-that-needs-the-owners-answer-stays-on-screen-until-the-owner-answers)
  - [10.08 A tab that is not saving keeps its unsaved work as a copy when it reloads or closes](#1008-a-tab-that-is-not-saving-keeps-its-unsaved-work-as-a-copy-when-it-reloads-or-closes)
  - [10.09 A tab never takes another tab's save for its own](#1009-a-tab-never-takes-another-tabs-save-for-its-own)
  - [10.10 Nothing is saved before the saved project is open](#1010-nothing-is-saved-before-the-saved-project-is-open)
  - [10.11 A copy that the page's database hands over late is kept before any save can replace it](#1011-a-copy-that-the-pages-database-hands-over-late-is-kept-before-any-save-can-replace-it)
- [20 Project files](#20-project-files)
  - [20.01 A saved project loads back exactly as it was saved](#2001-a-saved-project-loads-back-exactly-as-it-was-saved)
  - [20.02 The Studio refuses a file that is not a project, in fixed words](#2002-the-studio-refuses-a-file-that-is-not-a-project-in-fixed-words)
  - [20.03 A project that an earlier version saved loads with the design unchanged](#2003-a-project-that-an-earlier-version-saved-loads-with-the-design-unchanged)
  - [20.04 The Studio says so when it changes a Decision of an opened file](#2004-the-studio-says-so-when-it-changes-a-decision-of-an-opened-file)
- [30 The preview (Mockup)](#30-the-preview-mockup)
  - [30.01 The Mockup contains no script, no event handler, and no outside address](#3001-the-mockup-contains-no-script-no-event-handler-and-no-outside-address)
  - [30.02 Text from a project is drawn as text, never as markup](#3002-text-from-a-project-is-drawn-as-text-never-as-markup)
  - [30.03 Each preview sits in a locked frame](#3003-each-preview-sits-in-a-locked-frame)
  - [30.04 The Studio sends no request to any outside address](#3004-the-studio-sends-no-request-to-any-outside-address)
  - [30.05 The Mockup fits the window at every setting, and the headline stays the largest text](#3005-the-mockup-fits-the-window-at-every-setting-and-the-headline-stays-the-largest-text)
- [40 Colors and contrast](#40-colors-and-contrast)
  - [40.01 The Studio writes every color as exact digits](#4001-the-studio-writes-every-color-as-exact-digits)
  - [40.02 A color pair that the Studio calls passing passes when a browser draws it](#4002-a-color-pair-that-the-studio-calls-passing-passes-when-a-browser-draws-it)
  - [40.03 "Fix for me" says "repaired" only for a pair that now passes](#4003-fix-for-me-says-repaired-only-for-a-pair-that-now-passes)
  - [40.05 A button is drawn with the colors that the contrast check measures](#4005-a-button-is-drawn-with-the-colors-that-the-contrast-check-measures)
  - [40.04 The Studio never calls its output compliant or accessible](#4004-the-studio-never-calls-its-output-compliant-or-accessible)
- [50 Decisions and Directions](#50-decisions-and-directions)
  - [50.01 Every Decision stays true to the design](#5001-every-decision-stays-true-to-the-design)
  - [50.02 A Step changes only the values that it owns](#5002-a-step-changes-only-the-values-that-it-owns)
  - [50.03 No Direction starts with choices that pull against each other](#5003-no-direction-starts-with-choices-that-pull-against-each-other)
  - [50.04 A card shows exactly the design that picking it gives](#5004-a-card-shows-exactly-the-design-that-picking-it-gives)
  - [50.05 A value follows another value only when the starting design or the owner's pick says so](#5005-a-value-follows-another-value-only-when-the-starting-design-or-the-owners-pick-says-so)
- [60 The Studio's words](#60-the-studios-words)
  - [60.01 A trade word appears only inside round brackets](#6001-a-trade-word-appears-only-inside-round-brackets)
  - [60.02 Every Step says where its guidance comes from and how well it is known](#6002-every-step-says-where-its-guidance-comes-from-and-how-well-it-is-known)
- [70 How the Studio is built](#70-how-the-studio-is-built)
  - [70.01 The shared core holds no React import and no browser API](#7001-the-shared-core-holds-no-react-import-and-no-browser-api)
  - [70.02 No look changes by accident](#7002-no-look-changes-by-accident)
  - [70.03 Every dependency is pinned to an exact version that is at least 7 days old](#7003-every-dependency-is-pinned-to-an-exact-version-that-is-at-least-7-days-old)
  - [70.04 Every browser test fails when the page meets an error](#7004-every-browser-test-fails-when-the-page-meets-an-error)
  - [70.05 No source file uses a way to turn text into markup](#7005-no-source-file-uses-a-way-to-turn-text-into-markup)
- [80 Glossary](#80-glossary)
- [85 Changelog](#85-changelog)
- [90 Sources](#90-sources)
- [91 Cite index](#91-cite-index)
- [92 Index](#92-index)
- [99 Health](#99-health)
<!-- toc:end -->

## [03] How to read this file

- Each heading carries a permanent ID in brackets. Refer to a section as `§10.01`, not by position.
- A cite is a short key such as `[S1]` or `[S1 at D40]`. The full citation is in §90.
- Each rule section uses the labels Rule, Elements, Exceptions, Test, Examples, Policy and Open, in that order. A section leaves out a label that has no content.
- "Test" names the automatic test by its exact title, so that you can find it in the cited file. To run every test: `npm run check` (unit tests) and `npm run e2e` (browser tests).
- Each rule section ends with `Last verified:` and the date on which someone ran the cited test or read the cited decision.

## [10] Saved work

### [10.01] The Studio saves every change in the browser, and saves at once when the page goes to the background

<!-- index: saving | autosave; saved; storage -->

- **Rule.** After each change the Studio writes the project to the browser's storage, and it writes at once when the page goes to the background. [S3]
- **Elements.** The browser allows storage, and storage has room.
- **Exceptions.** When storage is full or blocked, the status line says that saving failed and why. On the private page, the Studio also saves to the page's own database.
- **Test.** "saves at once when the page goes to the background (finding P-06)"; "saves to both stores on the private page and says so".
- **Policy.** The owner must never need a "Save" button to keep work.
- **Open.** Only the Chromium browser is tested. Nobody has tested Safari, Firefox, or a phone's browser.
- Last verified: 2026-11-13

### [10.02] The Studio never saves over a copy that it could not keep, until the owner decides

<!-- index: kept copy | backup; copy; storage full; see also: saving -->

- **Rule.** When the Studio cannot keep a copy of the project that a save would replace, it stops saving and offers that project as a download, until the owner decides. [S1 at D40]
- **Elements.** A replace action (a new project, a new Direction, an opened file) or the opening of a stored project; storage that cannot take one more copy.
- **Test.** "asks once more before it replaces a project whose copy it cannot keep, because storage is full (finding S3-01)"; "stops saving at opening when it cannot keep a copy that a save would replace, until the person decides (finding S3-01)". [S3]
- **Examples.** Storage is full; the owner presses "Start a new project". The Studio asks a second question, "The Studio could not keep a copy of your project", before it replaces anything.
- **Policy.** A full disk must never turn a replace action into a silent loss.
- Last verified: 2026-11-13

### [10.03] The Studio never replaces a kept copy; each new kept copy joins the list

<!-- index: kept copy -->

- **Rule.** A kept copy stays until the owner removes it; each kept copy has a storage entry of its own, written in one step, and the list of kept copies has no upper limit. [S1 at D46]
- **Exceptions.** A tab that is not saving keeps one running copy of its growing work: each new copy of that kind takes the place of the tab's own earlier one (§10.08).
- **Test.** "never replaces a copy it kept earlier: each new kept copy joins the others (finding S2-01)"; "hands over a kept copy character for character, and removes exactly one copy (findings S3-03, S3-04, S3-05)"; "gives each kept copy a storage entry of its own, written once, and never rewrites a shared list (finding F-10)"; "keeps both copies when two tabs that are not saving close in the same moment (finding F-10)". [S3]
- **Examples.** Before 2026-11-13 all kept copies sat in one list. Two tabs that kept a copy in the same moment each rewrote that list, and one copy replaced the other in 2 of 10 trials (campaign 4, finding F-10).
- **Policy.** A safety copy that the next safety copy overwrites protects one mistake only.
- **Open.** Because the list has no limit, kept copies can fill storage; §10.02 then applies. The owner frees room on the Summary.
- Last verified: 2026-11-13

### [10.04] The Studio never overwrites a saved project that it cannot read

<!-- index: unreadable project | damaged project; corrupt; see also: kept copy -->

- **Rule.** When the stored project cannot be read, the Studio leaves it in place and offers it as a download. [S3]
- **Exceptions.** The owner may choose to discard the unreadable project; the Studio then really replaces it.
- **Test.** "never overwrites a saved project that it cannot read, and offers it as a download (findings SEC-03, P-05)"; "really replaces an unreadable copy once the person chooses to discard it, even when storage is full (finding S3-02)".
- Last verified: 2026-11-13

### [10.05] The Studio asks before a replace action, and Undo brings the work back within its stated reach

<!-- index: replace action | start again; new project; undo -->

- **Rule.** Before an opened file, a new Direction, or a new project replaces work, the Studio asks, says everything that is cleared, and keeps a copy; Undo brings the work back as long as it is among the last 100 Undo steps, and only until the page closes or reloads. [S1 at D47]
- **Elements.** A run of small changes of one kind (typing a name, typing a reason, moving one slider) within 1.5 seconds is one Undo step.
- **Test.** "asks before a file replaces work, and Undo brings the work back (findings FTU-25, SEC-06)"; "asks before a new Direction or a new project clears Decisions, and says everything that is cleared (findings FTU-24, FTU-41)"; "keeps the project that "Start again" replaces, so that it survives a reload (finding U2-01)"; "counts a run of typing or of slider presses as one Undo step, and states how far Undo reaches (finding F-11)". [S3]
- **Examples.** Before 2026-11-13 the dialogs promised Undo "until you close or reload this page", Undo remembered 40 steps, and each typed letter was a step: 45 typed letters put a replaced project out of Undo's reach (campaign 4, finding F-11).
- **Open.** When the 101st step pushes the oldest one out, the Studio does not say so at that moment; the dialogs state the limit beforehand.
- Last verified: 2026-11-13

### [10.06] When another tab changed the project, the Studio stops saving and says so

<!-- index: two tabs | second tab; another window; see also: saving -->

- **Rule.** A tab that finds that another tab changed the stored project stops saving and says so ("changed in another tab or window"), until the owner chooses "Keep this tab’s copy" or "Reload to see the other copy"; whichever the owner chooses, the Studio first keeps the other copy. [S3]
- **Exceptions.** When storage is full and the other copy cannot be kept, the Studio asks once more before it goes on.
- **Test.** "stops saving, and says so, when another tab changed the project (finding SEC-06)"; "keeps this tab’s copy before "Reload to see the other copy" reloads (finding F-2)"; "asks before "Reload to see the other copy" discards a tab’s copy that it cannot keep, because storage is full (finding F-2)".
- **Examples.** Campaign 4 found that the reload button discarded the tab's work without a word (finding F-2); the fix and its two tests date from 2026-11-13.
- Last verified: 2026-11-13

### [10.07] A notice that needs the owner's answer stays on screen until the owner answers

<!-- index: standing notice | stopped saving; not saving; hold; see also: saving -->

- **Rule.** A notice that needs the owner's answer (for example after the Studio has stopped saving) has its own row at the top of the page, cannot be dismissed, and is not replaced by any other notice. [S1 at D44]
- **Test.** "keeps the notice of a stopped save, with its buttons, through Undo and a change of screen: unreadable saved copy (finding F-1)"; "keeps the notice of a stopped save through Undo and a change of screen: a second tab (finding F-1)"; and the lines after "An Undo and a look at the Summary do not remove the notice" in "stops saving at opening when it cannot keep a copy that a save would replace, until the person decides (finding S3-01)". [S3]
- **Examples.** Before 2026-11-13, one press of Undo replaced the notice, and with it the only buttons that resume saving (campaign 4, finding F-1).
- **Policy.** The status line says "Not saving: see the notice at the top of the page"; that sentence must always be true.
- Last verified: 2026-11-13

### [10.08] A tab that is not saving keeps its unsaved work as a copy when it reloads or closes

<!-- index: unsaved work | closing a tab; leaving the page; running copy; see also: kept copy -->

- **Rule.** When a tab that is not saving reloads, closes, or goes to the background, the Studio keeps the tab's unsaved work as one running copy; when it can neither save nor keep the work, the browser asks its own "leave this page?" question, and the next opening says that a copy was kept. [S1 at D44]
- **Test.** "keeps unsaved work as a copy when a tab that is not saving closes or reloads"; "keeps one running copy for a tab that is not saving, however often the tab goes to the background (finding "saving 7")"; "keeps a tab’s copy before a reload even when the project has only a name (retest of finding F-2)". [S3]
- **Open.** No automatic test covers the browser's own "leave this page?" question; the test browser answers it by itself. A browser may also close a tab without running the page's last code (for example when it crashes); the copy is then not kept.
- Last verified: 2026-11-13

### [10.09] A tab never takes another tab's save for its own

<!-- index: save mark | same millisecond; see also: two tabs -->

- **Rule.** Every save carries a mark that no other save has; a tab that finds another mark in storage stops saving, also when the save time is the same, and it looks at storage whenever the owner comes back to it and before it closes. [S1 at D46]
- **Test.** "takes a save with the same save time but another mark for another tab’s save, and stops saving (finding F-12)"; "notices another tab’s save when the owner comes back to the tab, even if no storage event arrived (finding F-12)". [S3]
- **Examples.** Before 2026-11-13 tabs told saves apart by the save time alone. Two tabs that saved within one millisecond wrote the same time; both said "Saved", and one tab's work was lost in about 1 of 3 same-instant trials (campaign 4, finding F-12). After the fix, the attacker's own scripts showed no loss in 64 same-instant trials.
- **Open.** The 64 trials ran in one browser on one machine. A page restored from the browser's back-forward cache is covered by the look at storage, and no test restores such a page (the test browser never did).
- Last verified: 2026-11-13

### [10.10] Nothing is saved before the saved project is open

<!-- index: opening | placeholder project; slow page database; see also: saving -->

- **Rule.** Until the saved project is open, the Studio commits no change, saves nothing, and keeps no copy; the name field and the "Contrast checks" list are switched off until then. [S3]
- **Test.** "saves nothing while the saved project is still opening: leaving, a tab switch, and typing change no copy (finding "saving 0")"; the test fails when the guard is taken out (checked on 2026-11-13).
- **Examples.** Before 2026-11-13, while the page's database had not answered yet, a tab switch, a reload, or typing wrote an empty placeholder project over the saved one (code review of 2026-11-13, area "saving", finding 0, graded high).
- Last verified: 2026-11-13

### [10.11] A copy that the page's database hands over late is kept before any save can replace it

<!-- index: late copy | page database; newer copy; see also: kept copy -->

- **Rule.** When the first read of the page's database fails and a later read finds a copy that differs from the open project or cannot be read, the Studio keeps that copy first; if it cannot keep it, it stops saving until the owner decides. [S3]
- **Test.** "keeps a copy that the page database hands over late, before any save can replace it (findings "saving 2" and "gaps 3")"; "says "Saved in this browser" when a write to the page database never answers, and goes on saving (finding "saving 3")"; "opens the browser copy when the page has a runtime that cannot hand out a database (finding "saving 1")".
- **Open.** Every test uses a stand-in for the page's database. No automatic test opens the real private page.
- Last verified: 2026-11-13

## [20] Project files

### [20.01] A saved project loads back exactly as it was saved

<!-- index: project file | json file; download; open a file -->

- **Rule.** A project file that the Studio wrote loads back with every value and every Decision unchanged. [S2]
- **Test.** "loads a saved project back exactly as it was saved"; "keeps every Decision true to the design through 400 random sequences of actions, and through save and reload". [S2; S9]
- Last verified: 2026-11-13

### [20.02] The Studio refuses a file that is not a project, in fixed words

<!-- index: refused file | wrong file; error message; see also: project file -->

- **Rule.** The Studio refuses a file that is not a project, says which part is wrong, and never repeats content from the file in the message. [S2]
- **Test.** "refuses anything that is not a project, in fixed words"; "refuses values of the wrong type, outside their range, or outside their list, and says which part"; "never repeats content from the file in a message (finding SEC-12)". In the browser: "refuses a file that is not a project, in fixed words that repeat nothing from the file (finding SEC-12)". [S2; S3]
- **Policy.** A message that repeats a file's content lets the file write on the Studio's screen.
- Last verified: 2026-11-13

### [20.03] A project that an earlier version saved loads with the design unchanged

<!-- index: old project | version 1; upgrade; see also: project file -->

- **Rule.** A version-1 project loads with the same design, and the Studio fills in the values that version 1 did not have. [S2]
- **Test.** "loads a version-1 project that started from a Direction, with the design unchanged"; "fills in the four finish values that the earliest version-1 files lack"; in the browser, "upgrades a project saved by version 1 of the Studio, with the design unchanged (finding M-07)". [S2; S3]
- Last verified: 2026-11-13

### [20.04] The Studio says so when it changes a Decision of an opened file

<!-- index: changed Decision | corrected file; hand-edited file; see also: project file -->

- **Rule.** When a file's Decision names one choice and the file's own design values show another, the Studio follows the design values, changes the Decision to match, and says in the opening notice how many Decisions it changed. [S2]
- **Exceptions.** A file from version 1 of the Studio: bringing it up to date works every Decision out again, and the notice says that the file was brought up to date.
- **Test.** "says so when it changes a Decision to match the file’s own design values (campaign 4, finding F-3)".
- **Policy.** The Mockup is drawn from the design values, so they are the truth; a silent change to the record of choices would be a second, hidden truth.
- Last verified: 2026-11-13

## [30] The preview (Mockup)

### [30.01] The Mockup contains no script, no event handler, and no outside address

<!-- index: Mockup | preview; script; see also: locked frame -->

- **Rule.** For every Direction and every Option, the Mockup's HTML holds no script, no event handler, and no outside address. [S7]
- **Test.** "contains no script, no event handler, and no outside address, for every Direction and every Option"; "refuses a token, a preview region, or font rules that could break out of their place".
- **Policy.** Hard rule 6: Mockups contain no script. [S10 at hard rule 6]
- Last verified: 2026-11-13

### [30.02] Text from a project is drawn as text, never as markup

<!-- index: hostile text | injection; markup; see also: Mockup -->

- **Rule.** The Studio and the Mockup draw every text value as inert text. [S7]
- **Test.** "renders hostile content in every field as inert text, in previews and in exported pages"; in the browser, "renders hostile text from a saved project as inert text". [S7; S3]
- Last verified: 2026-11-13

### [30.03] Each preview sits in a locked frame

<!-- index: locked frame | sandbox; iframe; content policy -->

- **Rule.** Each preview is a frame with an empty sandbox (no script, no forms, no access to the Studio), and the Mockup carries a content policy that allows only its own styles and embedded data. [S3; S7]
- **Test.** "opens on the Directions with working, sandboxed pictures, no errors, and no outside request". The unit tests in `mockup.test.ts` pin the content policy's text.
- **Examples.** Campaign 4 (2026-11-13) attacked this area with hostile values in every field, in storage, and in the address: nothing left the frame, and the tests caught two defects that an attacker planted on purpose.
- Last verified: 2026-11-13

### [30.04] The Studio sends no request to any outside address

<!-- index: outside request | network; tracking; remote font -->

- **Rule.** On the Directions, on every Step, and on the Summary, the Studio requests nothing from any outside address. [S3]
- **Test.** "shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, and on the Summary, with no error and no outside request".
- **Policy.** Hard rule 7: no CDN scripts, no remote fonts, no analytics. [S10 at hard rule 7]
- **Exceptions.** On the private page, the page's own database receives the project (§10.01); that request goes to the page's host, not to a third party.
- Last verified: 2026-11-13

### [30.05] The Mockup fits the window at every setting, and the headline stays the largest text

<!-- index: phone width | overflow; narrow screen; heading size; see also: Mockup -->

- **Rule.** At widths of 320, 375, 860, 1024, and 1280 pixels, no Direction, no Option of the Steps that change sizes, and no slider end makes the Mockup wider than the window; and the main headline is larger than the opening paragraph and than every section heading at 375, 768, and 1280 pixels. [S4]
- **Test.** "never makes the page wider than a phone, whatever the Direction, the type Options, or the slider ends"; "fits the window at other widths as well: a small phone, the width at which two columns begin, and wider (code review of 2026-11-13, finding "tokens 4")"; "keeps the main headline the largest text: above the reading text and above every section heading, at phone, tablet, and desktop widths"; "shows the telephone number in the contact part on a phone, whatever the menu (code review of 2026-11-13, finding "tokens 1")".
- **Exceptions.** The tests change one Step at a time from each Direction, plus all sliders at their lowest and all at their highest. They do not try every combination of Options.
- **Open.** Measured in Chromium only, at the named widths only.
- Last verified: 2026-11-13

## [40] Colors and contrast

### [40.01] The Studio writes every color as exact digits

<!-- index: written color | hex; exact digits -->

- **Rule.** Every color reaches the page as six hexadecimal digits, or as exact red, green, and blue steps with a share of see-through, so that a browser draws what the Studio measured. [S1 at D39]
- **Test.** "emits a hex value for every color that a contrast pair names". [S5]
- Last verified: 2026-11-13

### [40.02] A color pair that the Studio calls passing passes when a browser draws it

<!-- index: contrast check | contrast; passing pair; see also: written color -->

- **Rule.** Every pair that the Studio marks as passing meets its required ratio when measured again from the written colors, and when measured from pixels that the browser drew. [S4; S5]
- **Test.** "a pair marked as passing passes when measured again from the emitted colors, across thousands of random combinations (finding T2-01)"; in the browser, "draws every color pair that the Studio calls passing at or above its requirement, measured from pixels in the browser".
- **Exceptions.** The checks do not cover photographs, text over a glow or glass, or the states of a control; the Studio lists these limits on screen (test: "states what the checks do not cover").
- **Open.** Measured in Chromium only.
- Last verified: 2026-11-13

### [40.03] "Fix for me" says "repaired" only for a pair that now passes

<!-- index: Fix for me | enforce; repaired; see also: contrast check -->

- **Rule.** Under "Fix for me", the Studio reports a pair as repaired only when the pair now meets its requirement, and it gives the ratio before and after. [S5]
- **Test.** "Enforce says "repaired" only for a pair that now passes, and gives the ratio before and after"; "never lowers the contrast of a pair that Enforce reports on".
- Last verified: 2026-11-13

### [40.05] A button is drawn with the colors that the contrast check measures

<!-- index: drawn color | gloss button; gradient; see also: contrast check -->

- **Rule.** The button's label, its flat fill, and an outline button's line are drawn with exactly the measured colors, and a gloss button's fill is drawn so that no point of it has less contrast with the label than the measured figure. [S5]
- **Test.** "draws a gloss button so that no point of its fill has less contrast with the label than the measured figure (finding "tokens 0")"; "draws with the same colors that the contrast pairs measure (finding "tokens 6")".
- **Exceptions.** The colors of a button while the pointer is over it or while it is pressed are not checked; the Studio lists that limit on screen. The fine grain texture darkens the whole page a little, and the checks do not measure that; the Studio lists that limit too.
- **Open.** The same tie is not yet tested for boxes, the top bar, and the highlighter stroke (code review of 2026-11-13, area "tokens", finding 6, fixed in part).
- Last verified: 2026-11-13

### [40.04] The Studio never calls its output compliant or accessible

<!-- index: compliance claim | WCAG; ADA; accessible -->

- **Rule.** The Studio states what it checked and what a person must still check; it never writes "WCAG compliant", "ADA compliant", or "accessible" as a claim about output. [S10 at hard rule 8]
- **Test.** "writes "WCAG compliant", "ADA compliant", or "accessible" in no source file of the core or of the Studio"; "states what the checks do not cover". [S8; S5]
- **Open.** The test reads the source files of the core and of the Studio. It does not read the Prescription's exporters that do not exist yet (milestone M5).
- Last verified: 2026-11-13

## [50] Decisions and Directions

### [50.01] Every Decision stays true to the design

<!-- index: Decision | record; pick; see also: project file -->

- **Rule.** After any sequence of picks, slider moves, Undo, new Directions, and reloads, each recorded Decision names the Option and the values that the design really has. [S9]
- **Test.** "keeps every Decision true to the design through 400 random sequences of actions, and through save and reload".
- **Policy.** The Prescription is written from the Decisions; a Decision that drifts from the design would prescribe the wrong thing.
- Last verified: 2026-11-13

### [50.02] A Step changes only the values that it owns

<!-- index: Step | one variable; Option -->

- **Rule.** Each design value belongs to exactly one Step, and an Option sets only the values that its Step owns. [S8]
- **Test.** "assigns every design parameter to exactly one Step"; "lets an Option set only the parameters its Step owns, and makes the Options of a Step set the same ones".
- **Exceptions.** A value that an Option defines by another value follows that value: the second color of “Two colors, opposite” moves when the main color moves (test: "keeps "Two colors, opposite" opposite when the accent changes later" in the engine's tests). [S9]
- Last verified: 2026-11-13

### [50.03] No Direction starts with choices that pull against each other

<!-- index: Direction | starting look; generated Direction -->

- **Rule.** Each of the 18 curated Directions, and each generated Direction, is complete, valid, and free of the conflicts that the Catalog knows. [S8; S9]
- **Test.** "has 18 curated Directions, each a complete, valid, conflict-free design with record fields"; "keeps the curated Directions clearly different from each other"; "never offers a generated Direction whose own choices pull against each other, over 60 seeds (decision D23)".
- Last verified: 2026-11-13

### [50.04] A card shows exactly the design that picking it gives

<!-- index: card | preview of an Option; small variation; see also: Decision -->

- **Rule.** The picture of a card is drawn from the same design that the pick produces, including a second color that follows the main color. [S9]
- **Test.** "previews exactly the design that the pick gives, for every Direction, Step, and Option (code review, finding "gaps 1")".
- **Examples.** Before 2026-11-13 a card for a new main color showed the old second color; after the pick, the band had another color than the card had shown (on "Sticker Pop", for 12 of 12 cards).
- Last verified: 2026-11-13

### [50.05] A value follows another value only when the starting design or the owner's pick says so

<!-- index: following value | second color; opposite colors; see also: Decision -->

- **Rule.** A second color follows the main color when the Direction's starting design matches a following Option, or when the owner picked such an Option; a fixed second color stays fixed, also when it matches a following Option for one moment, and a second color that the owner set by hand never moves. [S1 at D49]
- **Test.** "never lets a fixed second color start to follow the main color by coincidence (code review, finding "engine 1")"; "keeps "Two colors, opposite" opposite when the accent changes later"; "never moves a hand-set second color, even one that lands exactly on a following Option (finding T3-12)". [S9]
- **Examples.** "Galactic Goth" has a fixed red second color. Before 2026-11-13, picking the main color "Deep blue" and then another color turned the red into a pink.
- Last verified: 2026-11-13

## [60] The Studio's words

### [60.01] A trade word appears only inside round brackets

<!-- index: plain words | jargon; trade word -->

- **Rule.** Every text that the Studio shows uses plain words; a listed trade word appears only inside round brackets, as a word to learn. [S1 at D38]
- **Test.** "uses a trade word only inside round brackets, as a word to learn"; in the browser, "shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, and on the Summary, with no error and no outside request". [S8; S3]
- **Exceptions.** The test knows only the words on its list (`packages/core/src/catalog/words.ts`); a trade word that is not on the list passes.
- Last verified: 2026-11-13

### [60.02] Every Step says where its guidance comes from and how well it is known

<!-- index: source | evidence; where guidance comes from -->

- **Rule.** Every Step carries plain text, its sources with how each is known, an evidence grade, and a review date. [S8]
- **Test.** "gives every Step plain text, sources that say how they are known, an evidence grade, and a real review date"; "grades a Step "measured" only when a source was read in full".
- **Policy.** Hard rule 5 and hard rule 13. [S10 at hard rule 5]
- Last verified: 2026-11-13

## [70] How the Studio is built

### [70.01] The shared core holds no React import and no browser API

<!-- index: core | packages/core; boundary -->

- **Rule.** `packages/core` imports nothing from React, from the apps, or from the plugin. [S11]
- **Test.** `npm run boundaries` (the rule "core-stays-pure").
- **Policy.** The Studio and the Fitter share the core; the Fitter does not run in a browser. [S10 at hard rule 4]
- Last verified: 2026-11-13

### [70.02] No look changes by accident

<!-- index: stored picture | baseline; visual test; screenshot; measured style -->

- **Rule.** Each curated Direction, and the plain start, has three stored pictures (the top, the services, the contact part) and a stored record of the measured style of its main parts; a change that alters a drawn look fails the comparison until someone stores the new state on purpose. [S1 at D8]
- **Test.** The group "Mockup: no look changes by accident (decision D8)" in `visual.e2e.ts`: 57 picture comparisons; "keeps the measured style of the main parts of every Direction: corners, lines, shadows, colors, sizes, letters"; "would notice a changed look: one Direction against another fails the comparison"; "would notice square corners in place of round ones, which the pictures alone would let pass". [S4]
- **Exceptions.** A picture is compared in a shrunk form with limits, so that different machines agree; a small local change can stay under the limits (a review found that 46 of 192 one-Option changes did). The measured-style record is compared exactly and catches such changes for the twelve parts and fifteen values that it holds.
- **Open.** The measured-style record covers the top of the page of each Direction as it starts; it does not cover every Option.
- Last verified: 2026-11-13

### [70.03] Every dependency is pinned to an exact version that is at least 7 days old

<!-- index: dependency | package; pinned version -->

- **Rule.** The project pins exact dependency versions, records a check of each direct dependency, and adopts a version only 7 days or more after its release. [S1 at D27]
- **Policy.** Hard rule 7. [S10 at hard rule 7]
- **Open.** Registry signatures are unverified in this environment (stated in `DECISIONS.md`). No automatic test enforces the 7-day wait.
- Last verified: 2026-11-13

### [70.04] Every browser test fails when the page meets an error

<!-- index: page error | uncaught error; console error; see also: stored picture -->

- **Rule.** After each browser test of the Studio, no session that the test opened may have met an error on the page. [S3]
- **Test.** The `afterEach` check at the top of `studio.e2e.ts`.
- **Examples.** Before 2026-11-13 only 12 of 56 sessions kept the list of page errors and 6 assertions read it.
- **Open.** The Mockup's own browser tests draw pages without script, so they have no such check.
- Last verified: 2026-11-13

### [70.05] No source file uses a way to turn text into markup

<!-- index: text as text | innerHTML; lint rule; see also: hostile text -->

- **Rule.** No source file of the core or of the Studio holds one of the names by which text becomes markup, and a frame's document text is set in exactly three known places. [S8]
- **Test.** "uses none of the ways to turn text into markup, in any source file of the core or of the Studio"; the lint rule in `eslint.config.js`.
- **Policy.** Hard rule 6. [S10 at hard rule 6]
- **Open.** A name that is put together from pieces while the page runs escapes the lint rule and the test alike.
- Last verified: 2026-11-13

## [80] Glossary

- **Decision** (UF: record, pick): the recorded result of a Step: the picked Option, the rejected Options, and the reason. §50.01
- **Direction** (UF: starting look): a complete starting design. §50.03
- **Kept copy** (UF: backup): a copy of a project that the Studio keeps before a replace action. §10.02
- **Mockup** (UF: preview): the HTML and CSS page on which every Option renders. §30.01
- **Option**: one of the concrete choices that a Step offers. §50.02
- **Replace action**: an opened file, a new Direction, or a new project that takes the place of the current work. §10.05
- **Standing notice** (UF: hold): a notice that needs the owner's answer; it has its own row and stays until the owner answers. The word avoids "decision", because a Decision is the recorded result of a Step. §10.07
- **Step**: one screen of the Studio that asks for one design decision. §50.02

## [85] Changelog

- 2026-11-13 v1.0: created with 25 guarantees.
- 2026-11-13 v1.2: after the retest round and the code review: added §10.09, §10.10, §10.11, §40.05, §50.04, §50.05, §70.04, §70.05; §10.03, §10.05, §10.08, §30.05, and §70.02 now state the changed behavior and tests. 37 guarantees.
- 2026-11-13 v1.1: after campaign 4, added §10.07, §10.08, §20.04, and §30.05; §10.06 now covers both buttons; §30.03 states the campaign's result. 29 guarantees.

## [90] Sources

- [S1] The builder and the owner, *DECISIONS.md*, repository `catcorner22/frontend`, file `DECISIONS.md` (2026-11-13). Accessed 2026-11-13. Grade: A. The decision record; a pinpoint names a decision, for example D40.
- [S2] The builder, *Unit tests of the project file*, file `packages/core/test/project-file.test.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S3] The builder, *Browser tests of the Studio*, file `apps/studio/e2e/studio.e2e.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S4] The builder, *Browser tests of the Mockup and of drawn colors*, file `apps/studio/e2e/visual.e2e.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S5] The builder, *Unit tests of the color values and contrast checks*, file `packages/core/test/tokens.test.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S7] The builder, *Unit tests of the Mockup*, file `packages/core/test/mockup.test.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S8] The builder, *Unit tests of the Catalog*, file `packages/core/test/catalog.test.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S9] The builder, *Unit tests of the engine*, file `packages/core/test/engine.test.ts` (2026-11-13). Accessed 2026-11-13. Grade: A.
- [S10] The owner and the builder, *Standing rules for every session in this repository*, file `CLAUDE.md` (2026-11-13). Accessed 2026-11-13. Grade: A. A pinpoint names a hard rule.
- [S11] The builder, *Boundary rules*, file `.dependency-cruiser.cjs` (2026-11-13). Accessed 2026-11-13. Grade: A.

## [91] Cite index

<!-- authorities:start -->
- [S1] The builder and the owner, *DECISIONS.md*, repository `catcorner22/frontend`, file `DECISIONS.md` (2026-11-13) — §10.02, §10.03, §10.05, §10.07, §10.08, §10.09, §40.01, §50.05, §60.01, §70.02, §70.03
- [S2] The builder, *Unit tests of the project file*, file `packages/core/test/project-file.test.ts` (2026-11-13) — §20.01, §20.02, §20.03, §20.04
- [S3] The builder, *Browser tests of the Studio*, file `apps/studio/e2e/studio.e2e.ts` (2026-11-13) — §10.01, §10.02, §10.03, §10.04, §10.05, §10.06, §10.07, §10.08, §10.09, §10.10, §10.11, §20.02, §20.03, §30.02, §30.03, §30.04, §60.01, §70.04
- [S4] The builder, *Browser tests of the Mockup and of drawn colors*, file `apps/studio/e2e/visual.e2e.ts`… — §30.05, §40.02, §70.02
- [S5] The builder, *Unit tests of the color values and contrast checks*, file `packages/core/test/tokens.test.ts`… — §40.01, §40.02, §40.03, §40.05, §40.04
- [S7] The builder, *Unit tests of the Mockup*, file `packages/core/test/mockup.test.ts` (2026-11-13) — §30.01, §30.02, §30.03
- [S8] The builder, *Unit tests of the Catalog*, file `packages/core/test/catalog.test.ts` (2026-11-13) — §40.04, §50.02, §50.03, §60.01, §60.02, §70.05
- [S9] The builder, *Unit tests of the engine*, file `packages/core/test/engine.test.ts` (2026-11-13) — §20.01, §50.01, §50.02, §50.03, §50.04, §50.05
- [S10] The owner and the builder, *Standing rules for every session in this repository*, file `CLAUDE.md`… — §30.01, §30.04, §40.04, §60.02, §70.01, §70.03, §70.05
- [S11] The builder, *Boundary rules*, file `.dependency-cruiser.cjs` (2026-11-13) — §70.01
<!-- authorities:end -->

## [92] Index

<!-- index:start -->
**A**

- accessible — *see* compliance claim
- ADA — *see* compliance claim
- another window — *see* two tabs
- autosave — *see* saving

**B**

- backup — *see* kept copy
- baseline — *see* stored picture
- boundary — *see* core

**C**

- **card** — §50.04; *see also* Decision
- **changed Decision** — §20.04; *see also* project file
- closing a tab — *see* unsaved work
- **compliance claim** — §40.04
- console error — *see* page error
- content policy — *see* locked frame
- contrast — *see* contrast check
- **contrast check** — §40.02; *see also* written color
- copy — *see* kept copy
- **core** — §70.01
- corrected file — *see* changed Decision
- corrupt — *see* unreadable project

**D**

- damaged project — *see* unreadable project
- **Decision** — §50.01; *see also* project file
- **dependency** — §70.03
- **Direction** — §50.03
- download — *see* project file
- **drawn color** — §40.05; *see also* contrast check

**E**

- enforce — *see* Fix for me
- error message — *see* refused file
- evidence — *see* source
- exact digits — *see* written color

**F**

- **Fix for me** — §40.03; *see also* contrast check
- **following value** — §50.05; *see also* Decision

**G**

- generated Direction — *see* Direction
- gloss button — *see* drawn color
- gradient — *see* drawn color

**H**

- hand-edited file — *see* changed Decision
- heading size — *see* phone width
- hex — *see* written color
- hold — *see* standing notice
- **hostile text** — §30.02; *see also* Mockup

**I**

- iframe — *see* locked frame
- injection — *see* hostile text
- innerHTML — *see* text as text

**J**

- jargon — *see* plain words
- json file — *see* project file

**K**

- **kept copy** — §10.02, §10.03; *see also* saving

**L**

- **late copy** — §10.11; *see also* kept copy
- leaving the page — *see* unsaved work
- lint rule — *see* text as text
- **locked frame** — §30.03

**M**

- markup — *see* hostile text
- measured style — *see* stored picture
- **Mockup** — §30.01; *see also* locked frame

**N**

- narrow screen — *see* phone width
- network — *see* outside request
- new project — *see* replace action
- newer copy — *see* late copy
- not saving — *see* standing notice

**O**

- **old project** — §20.03; *see also* project file
- one variable — *see* Step
- open a file — *see* project file
- **opening** — §10.10; *see also* saving
- opposite colors — *see* following value
- Option — *see* Step
- **outside request** — §30.04
- overflow — *see* phone width

**P**

- package — *see* dependency
- packages/core — *see* core
- page database — *see* late copy
- **page error** — §70.04; *see also* stored picture
- passing pair — *see* contrast check
- **phone width** — §30.05; *see also* Mockup
- pick — *see* Decision
- pinned version — *see* dependency
- placeholder project — *see* opening
- **plain words** — §60.01
- preview — *see* Mockup
- preview of an Option — *see* card
- **project file** — §20.01

**R**

- record — *see* Decision
- **refused file** — §20.02; *see also* project file
- remote font — *see* outside request
- repaired — *see* Fix for me
- **replace action** — §10.05
- running copy — *see* unsaved work

**S**

- same millisecond — *see* save mark
- sandbox — *see* locked frame
- **save mark** — §10.09; *see also* two tabs
- saved — *see* saving
- **saving** — §10.01
- screenshot — *see* stored picture
- script — *see* Mockup
- second color — *see* following value
- second tab — *see* two tabs
- slow page database — *see* opening
- small variation — *see* card
- **source** — §60.02
- **standing notice** — §10.07; *see also* saving
- start again — *see* replace action
- starting look — *see* Direction
- **Step** — §50.02
- stopped saving — *see* standing notice
- storage — *see* saving
- storage full — *see* kept copy
- **stored picture** — §70.02

**T**

- **text as text** — §70.05; *see also* hostile text
- tracking — *see* outside request
- trade word — *see* plain words
- **two tabs** — §10.06; *see also* saving

**U**

- uncaught error — *see* page error
- undo — *see* replace action
- **unreadable project** — §10.04; *see also* kept copy
- **unsaved work** — §10.08; *see also* kept copy
- upgrade — *see* old project

**V**

- version 1 — *see* old project
- visual test — *see* stored picture

**W**

- WCAG — *see* compliance claim
- where guidance comes from — *see* source
- **written color** — §40.01
- wrong file — *see* refused file
<!-- index:end -->

## [99] Health

<!-- health:start -->
_54 sections, 10 sources, 36 index terms. Cadence: 90 days. Generated content last changed 2026-11-13._

- No findings.
<!-- health:end -->
