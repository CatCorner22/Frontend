# [00] Studio guarantees: living reference

Version 1.11. Owner: the owner of this repository. Scope: this file states each guarantee that the Studio makes about saved work, project files, the preview, colors, Decisions, its own words, the owner's content (the Brief), the craft rules, and the Prescription, and names the test or decision that backs each one; it does not cover design advice, the Fitter, or the plan.

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
- A promise to keep a copy never rests on a copy that can go away. §10.12
- A page that closes with an unsaved change first writes it to an entry of its own. §10.13
- Your own words stand in the Prescription as quoted data, inside a fence that they cannot close. §65.03
- Opening a file never adds to a Decision, and brings no value the Studio cannot set. §20.05
- A written reason leaves a Decision only with a notice that offers it back. §50.06
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
- A Skin changes colors only. §50.07
- An Overlay changes no value of the design, and its picture holds no script. §50.08, §30.06
- A trade word appears only inside round brackets. §60.01
- No Overlay and no research rule is graded "measured" without a source that was read in full. §60.03
- A research rule says "Holds" only when the measured number meets it. §60.04
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
  - [10.12 A promise to keep a copy never rests on a copy that can go away](#1012-a-promise-to-keep-a-copy-never-rests-on-a-copy-that-can-go-away)
  - [10.13 A page that closes with an unsaved change first writes it to an entry of its own](#1013-a-page-that-closes-with-an-unsaved-change-first-writes-it-to-an-entry-of-its-own)
  - [10.14 A tab that finishes opening while another tab saved does not say "Saved" over a project that storage no longer holds](#1014-a-tab-that-finishes-opening-while-another-tab-saved-does-not-say-saved-over-a-project-that-storage-no-longer-holds)
- [20 Project files](#20-project-files)
  - [20.01 A saved project loads back exactly as it was saved](#2001-a-saved-project-loads-back-exactly-as-it-was-saved)
  - [20.02 The Studio refuses a file that is not a project, in fixed words](#2002-the-studio-refuses-a-file-that-is-not-a-project-in-fixed-words)
  - [20.03 A project that an earlier version saved loads with the design unchanged](#2003-a-project-that-an-earlier-version-saved-loads-with-the-design-unchanged)
  - [20.04 The Studio says so when it changes a Decision of an opened file](#2004-the-studio-says-so-when-it-changes-a-decision-of-an-opened-file)
  - [20.05 Opening a file never adds to a Decision, and brings no value the Studio cannot set](#2005-opening-a-file-never-adds-to-a-decision-and-brings-no-value-the-studio-cannot-set)
  - [20.06 A name from a file cannot end the quotation in one of the Studio's sentences](#2006-a-name-from-a-file-cannot-end-the-quotation-in-one-of-the-studios-sentences)
  - [20.07 An Overlay that this version does not know is left out with a notice, and the original file is kept](#2007-an-overlay-that-this-version-does-not-know-is-left-out-with-a-notice-and-the-original-file-is-kept)
- [30 The preview (Mockup)](#30-the-preview-mockup)
  - [30.01 The Mockup contains no script, no event handler, and no outside address](#3001-the-mockup-contains-no-script-no-event-handler-and-no-outside-address)
  - [30.02 Text from a project is drawn as text, never as markup](#3002-text-from-a-project-is-drawn-as-text-never-as-markup)
  - [30.03 Each preview sits in a locked frame](#3003-each-preview-sits-in-a-locked-frame)
  - [30.04 The Studio sends no request to any outside address](#3004-the-studio-sends-no-request-to-any-outside-address)
  - [30.05 The Mockup fits the window at every setting, and the headline stays the largest text](#3005-the-mockup-fits-the-window-at-every-setting-and-the-headline-stays-the-largest-text)
  - [30.06 The picture of an Overlay holds no script, no link, and nothing that a visitor could send](#3006-the-picture-of-an-overlay-holds-no-script-no-link-and-nothing-that-a-visitor-could-send)
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
  - [50.06 A written reason leaves a Decision only with a notice that offers it back](#5006-a-written-reason-leaves-a-decision-only-with-a-notice-that-offers-it-back)
  - [50.07 A Skin changes colors only](#5007-a-skin-changes-colors-only)
  - [50.08 An Overlay changes no value of the design, and a project without Overlays is stored as before](#5008-an-overlay-changes-no-value-of-the-design-and-a-project-without-overlays-is-stored-as-before)
  - [50.09 The Studio never writes a list of own Directions that it cannot read again](#5009-the-studio-never-writes-a-list-of-own-directions-that-it-cannot-read-again)
  - [50.10 A Direction of the owner's own holds the known design values and nothing else](#5010-a-direction-of-the-owners-own-holds-the-known-design-values-and-nothing-else)
- [55 Your content (the Brief)](#55-your-content-the-brief)
  - [55.01 A text of the owner's is kept as typed, cleaned and cut at its limit, and the page never loses its name, its headline, or its main button](#5501-a-text-of-the-owners-is-kept-as-typed-cleaned-and-cut-at-its-limit-and-the-page-never-loses-its-name-its-headline-or-its-main-button)
  - [55.02 An empty text or an empty list leaves no empty box on the page, and a text with markup is drawn as text](#5502-an-empty-text-or-an-empty-list-leaves-no-empty-box-on-the-page-and-a-text-with-markup-is-drawn-as-text)
  - [55.03 Every built-in Direction holds the owner's content at the ends of what the Brief allows without becoming wider than its window](#5503-every-built-in-direction-holds-the-owners-content-at-the-ends-of-what-the-brief-allows-without-becoming-wider-than-its-window)
  - [55.04 The three answers go into the Prescription as quoted data, and the owner's texts go into the reference page and nowhere else](#5504-the-three-answers-go-into-the-prescription-as-quoted-data-and-the-owners-texts-go-into-the-reference-page-and-nowhere-else)
  - [55.05 The Studio asks before the sample replaces the owner's texts, keeps a copy, and treats a project that holds only the owner's words as work](#5505-the-studio-asks-before-the-sample-replaces-the-owners-texts-keeps-a-copy-and-treats-a-project-that-holds-only-the-owners-words-as-work)
- [60 The Studio's words](#60-the-studios-words)
  - [60.01 A trade word appears only inside round brackets](#6001-a-trade-word-appears-only-inside-round-brackets)
  - [60.02 Every Step says where its guidance comes from and how well it is known](#6002-every-step-says-where-its-guidance-comes-from-and-how-well-it-is-known)
  - [60.03 No Overlay and no research rule is graded "measured" without a source that was read in full](#6003-no-overlay-and-no-research-rule-is-graded-measured-without-a-source-that-was-read-in-full)
  - [60.04 A research rule says "Holds" only when the measured number meets it](#6004-a-research-rule-says-holds-only-when-the-measured-number-meets-it)
- [65 The craft rules and the Prescription](#65-the-craft-rules-and-the-prescription)
  - [65.01 Every craft rule carries its mark on the sample website of every built-in Direction, and says so when a design sets it aside](#6501-every-craft-rule-carries-its-mark-on-the-sample-website-of-every-built-in-direction-and-says-so-when-a-design-sets-it-aside)
  - [65.02 The four files of the Prescription hold the same design values, value by value](#6502-the-four-files-of-the-prescription-hold-the-same-design-values-value-by-value)
  - [65.03 Words that the owner typed, or that came from a file, stand in the Prescription as quoted data, inside a fence that they cannot close](#6503-words-that-the-owner-typed-or-that-came-from-a-file-stand-in-the-prescription-as-quoted-data-inside-a-fence-that-they-cannot-close)
  - [65.04 The same project always gives the same four files, and a change of any line is seen](#6504-the-same-project-always-gives-the-same-four-files-and-a-change-of-any-line-is-seen)
  - [65.05 The Prescription names the start, every Decision, every craft rule, and what a person must still check, and claims no standard](#6505-the-prescription-names-the-start-every-decision-every-craft-rule-and-what-a-person-must-still-check-and-claims-no-standard)
  - [65.06 A file that the Summary hands over equals what the core writes for the stored project](#6506-a-file-that-the-summary-hands-over-equals-what-the-core-writes-for-the-stored-project)
  - [65.07 Every file of the Prescription carries one fingerprint of the design values, and no date](#6507-every-file-of-the-prescription-carries-one-fingerprint-of-the-design-values-and-no-date)
  - [65.08 FONTS.md, DESIGN.md, and theme.css say the design in three more forms, each from the design's own values](#6508-fontsmd-designmd-and-themecss-say-the-design-in-three-more-forms-each-from-the-designs-own-values)
  - [65.09 Two programs that the builder did not write read DESIGN.md and tokens.json, on GitHub only](#6509-two-programs-that-the-builder-did-not-write-read-designmd-and-tokensjson-on-github-only)
  - [65.10 One archive file holds the seven files, each letter for letter](#6510-one-archive-file-holds-the-seven-files-each-letter-for-letter)
- [66 The Fit check (measuring a build against the Prescription)](#66-the-fit-check-measuring-a-build-against-the-prescription)
  - [66.01 The program measures six things and one more, and the Mockup passes its own measure](#6601-the-program-measures-six-things-and-one-more-and-the-mockup-passes-its-own-measure)
  - [66.02 Each deviation that the program claims to find, it finds; each fault of its own inputs, it names](#6602-each-deviation-that-the-program-claims-to-find-it-finds-each-fault-of-its-own-inputs-it-names)
  - [66.03 The receipt keeps measuring, judging, and asking apart, and holds nothing that changes between two runs](#6603-the-receipt-keeps-measuring-judging-and-asking-apart-and-holds-nothing-that-changes-between-two-runs)
  - [66.04 The first build trial is stored whole, belongs to today's files, and measures to its own receipt](#6604-the-first-build-trial-is-stored-whole-belongs-to-todays-files-and-measures-to-its-own-receipt)
  - [66.05 The comparison run sets two pages side by side with numbers that come from the receipts](#6605-the-comparison-run-sets-two-pages-side-by-side-with-numbers-that-come-from-the-receipts)
- [70 How the Studio is built](#70-how-the-studio-is-built)
  - [70.01 The shared core holds no React import and no browser API](#7001-the-shared-core-holds-no-react-import-and-no-browser-api)
  - [70.02 No look changes by accident](#7002-no-look-changes-by-accident)
  - [70.03 Every dependency is pinned to an exact version; a version that the builder adopts is at least 7 days old](#7003-every-dependency-is-pinned-to-an-exact-version-a-version-that-the-builder-adopts-is-at-least-7-days-old)
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
- **Exceptions.** When storage is full or blocked, the status line says that saving failed and why. When an Undo then brings back exactly what is stored, the status line says "Saved" again, because the work on screen is the stored work (finding F-23; the owner's decision D55); the next change that cannot be saved brings the statement back. On the private page, the Studio also saves to the page's own database.
- **Test.** "saves at once when the page goes to the background (finding P-06)"; "saves to both stores on the private page and says so".
- **Policy.** The owner must never need a "Save" button to keep work.
- **Open.** Only the Chromium browser is tested. Nobody has tested Safari, Firefox, or a phone's browser.
- Last verified: 2026-11-15

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
- Last verified: 2026-11-14

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

### [10.12] A promise to keep a copy never rests on a copy that can go away

<!-- index: lasting copy | same text; promise of a kept copy; see also: kept copy -->

- **Rule.** A kept copy is lasting, running (a tab that is not saving replaces it with newer work), or leaving (see §10.13); only a lasting copy, or the tab's own running copy, counts as "kept already", and a tab's own running copy becomes lasting when the Studio promises to keep that text. [S1 at D50]
- **Test.** "keeps the replaced project for good when a stopped tab starts again, although the tab’s running copy held the same text"; "does not count on another tab’s running copy: each of two stopped tabs with the same work keeps it". [S3]
- **Examples.** Before 2026-11-14 "Start again" in a stopped tab wrote no copy when the tab's running copy held the same text; the next tab switch replaced the running copy, and the replaced project was in no storage entry (campaign 4, finding F-16).
- **Open.** Two copies with the same text can now both be listed. No judge has retested this repair.
- Last verified: 2026-11-14

### [10.13] A page that closes with an unsaved change first writes it to an entry of its own

<!-- index: closing in the same instant | leaving copy; race; two windows; see also: two tabs -->

- **Rule.** A page that closes or goes to the background with a change it has not saved writes that work to a storage entry of its own, then to the saved project. A page that closes or goes to the background within 2 seconds after its own save writes the entry too, and does not write the saved project again (finding F-18; `docs/reference/saving-table.md`, "Why 2 seconds"). In both cases the next opening removes the entry when the saved project holds the same work, and otherwise keeps it for good and says so. [S1 at D50]
- **Test.** "puts unsaved work into an entry of the page’s own before a closing page writes the saved project, and settles it at the next opening"; "keeps for good, and reports, the work of a closing page that another page’s save replaced in the same moment"; "removes the entry of its own when the page lives on and has saved"; "saved a moment ago, and the tab goes to the background: the work goes into an entry of the page’s own, and the entry goes when the page lives on"; "saved more than 2 seconds ago, and the tab goes to the background or closes: nothing is written and nothing is kept"; "saved a moment ago, and the tab closes: the next opening removes the entry of its own when the saved project holds the same work"; "keeps for good, and reports, the saved work of a closing page that another page’s closing write replaced in the same moment (finding F-18)"; "saved a moment ago, with no room in storage for the entry of its own: the tab closes as before, and nothing fails". [S3]
- **Examples.** Two pages that close in the same instant cannot see each other's write. Before the repair, 8 of 24 such trials lost one page's change (campaign 4, finding F-18); after it, the attacker's script lost none in 48 trials. A judge then measured 2 losses in 120 trials: a tab whose save had just landed wrote no entry. After the repair of 2026-11-15 the builder's own trial (two tabs rename in the same instant and close 270 to 310 milliseconds later) lost none in 240 trials; the same trial on the build before the repair lost 1 in 240.
- **Open.** When storage has no room for the extra entry, the page writes the saved project as before, without this protection. Every trial ran in one browser on one machine; 1 loss in 240 against none in 240 is too few to prove the repair by counting, so the staged tests above carry the proof.
- Last verified: 2026-11-15

### [10.14] A tab that finishes opening while another tab saved does not say "Saved" over a project that storage no longer holds

<!-- index: opening while another tab saves | saving table; slow opening; see also: two tabs -->

- **Rule.** When a tab finishes opening the saved project and storage meanwhile holds another tab's save, the tab stops saving and says so; it never shows the older project under "Saved". [S12]
- **Test.** "opening, and another tab saves meanwhile: the tab does not say "Saved" over a project that storage no longer holds". [S3]
- **Examples.** The saving table (`docs/reference/saving-table.md`) lists every situation of a tab against every event. Writing it on 2026-11-14 showed this case, which no earlier review had found; the test failed before the repair.
- **Open.** The table names what no test covers: the browser's own "leave this page?" question, a browser that ends a tab without running the page's last code, and any browser other than Chromium.
- Last verified: 2026-11-14

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

### [20.05] Opening a file never adds to a Decision, and brings no value the Studio cannot set

<!-- index: rejected Options | out of range; slider end; value beyond a slider; see also: Decision -->

- **Rule.** On opening, a Decision's list of rejected Options is the file's own list without what cannot stand, and nothing is added; a design value that no slider and no Option can set is brought to the nearest value the Studio can set, and a note says so; a pick whose design values match no Option becomes hand-set under a note that states only that. [S1 at D50]
- **Test.** "never adds to a Decision’s list of rejected Options, and drops from it only what cannot stand (campaign 4, round 3)"; "brings a design value that no slider and no Option can set into reach, and says so (campaign 4, round 3)"; "marks a pick as hand-set when its design values match no Option, keeps the value, and says only what it knows". [S2]
- **Test.** "opens a file with values that no slider can set as values that the Studio can set, says so, and its sliders move them"; "says in general words that it left out or corrected details of a file, when no other note says what changed"; "stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing". [S3]
- **Open.** The general note does not list each detail that was left out or corrected. A file from an earlier version gets its own sentence in place of the general note.
- Last verified: 2026-11-14

### [20.06] A name from a file cannot end the quotation in one of the Studio's sentences

<!-- index: quotation marks | forged sentence; project name; file name -->

- **Rule.** A project name or a file name enters one of the Studio's sentences only after cleaning: every quotation mark and every sign that looks like one becomes a single mark, a run of such marks becomes one mark, and the invisible signs that change the direction of writing or hide between letters are taken out. A name therefore cannot end the quotation, and cannot turn the Studio's sentence into mirror writing. [S1 at D50]
- **Test.** "lets no project name or file name end the quotation in one of the Studio’s own sentences". [S3]
- **Test.** For the signs that the sixth review used: "turns the look-alike quotation signs of finding S6-05 into single marks, so that a name cannot end a quotation"; "takes a name with an invisible sign for the name without it, so that it cannot pass as a second “Graphite Precision” (finding S6-04)". [S14]
- **Exceptions.** No list of look-alike signs is complete. A letter of another alphabet that looks like a Latin letter is not caught.
- **Examples.** A file whose project name held a closing quotation mark and a sentence made the dialog read: "holds the project “Owner work”. It is the same as the open project, so nothing will change." (campaign 4, finding F-19).
- **Open.** A name can still hold a misleading sentence inside its quotation marks.
- Last verified: 2026-11-14

### [20.07] An Overlay that this version does not know is left out with a notice, and the original file is kept

<!-- index: unknown Overlay | later version; left out; see also: Overlay -->

- **Rule.** A project stores its switched-on Overlays as a list of identifiers; on opening, the Studio keeps the ones its Catalog holds, each once, in the Catalog's order, leaves out any other, and says so. When the project was the copy saved in the browser, the Studio first keeps that copy as it was; when it was a file that the owner opened, the file on the owner's disk stays as it is and the Studio keeps no copy of it. [S1 at D53]
- **Test.** "leaves out an Overlay that this version does not know, repeats included, and says so"; "refuses a file whose Overlay list is not a short list of short words". [S2]
- **Test.** "leaves out an Overlay that this version does not know when it opens a saved project, keeps the original, and says so". [S3]
- Last verified: 2026-11-14

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
- **Test.** "shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, on the Overlays, and on the Summary, with no error and no outside request".
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

### [30.06] The picture of an Overlay holds no script, no link, and nothing that a visitor could send

<!-- index: Overlay picture | still picture; question; notice; see also: Mockup -->

- **Rule.** The Mockup draws each switched-on Overlay open, as a still picture built from fixed text; only an identifier from a fixed list reaches the markup, and the one text of the owner in a picture (the label of the main button) arrives escaped. [S1 at D53; S10 at hard rule 6]
- **Test.** "keeps the pictures free of script, of live links, and of anything a visitor could send"; "refuses an Overlay that is not in its list, before anything reaches the markup"; "draws each switched-on Overlay once, under its Catalog name, in the Catalog order". [S7]
- **Exceptions.** A picture shows what an Overlay looks like in the design. It does not show how the Overlay opens, closes, or behaves with a keyboard or a screen reader; the built website does that, and a person must check it there.
- Last verified: 2026-11-14

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

- **Rule.** After any sequence of picks, slider moves, Undo, new Directions, and reloads, each recorded Decision names the Option that the design holds and the values that the design really has. [S9]
- **Elements.** A design holds an Option when its values match the Option. One kind of Option is a relation: its second color follows the main color ("Two colors: a third of the wheel apart"). A design holds such an Option only when its second color really follows: the owner picked the Option, or the starting design matches it and no hand-set Decision stands. A fixed second color that matches the relation for one main color does not hold the Option; a kept Decision then stays "kept" and names no Option (finding F-24; the owner's decision D55).
- **Test.** "keeps every Decision true to the design through 400 random sequences of actions, and through save and reload"; "keeps a kept Decision as kept when its fixed second color matches a following Option for a moment (finding F-24, decision D55)".
- **Policy.** The Prescription is written from the Decisions; a Decision that drifts from the design would prescribe the wrong thing.
- Last verified: 2026-11-15

### [50.02] A Step changes only the values that it owns

<!-- index: Step | one variable; Option -->

- **Rule.** Each design value belongs to exactly one Step, and an Option sets only the values that its Step owns. [S8]
- **Test.** "assigns every design parameter to exactly one Step"; "lets an Option set only the parameters its Step owns, and makes the Options of a Step set the same ones".
- **Exceptions.** A value that an Option defines by another value follows that value: the second color of “Two colors, opposite” moves when the main color moves (test: "keeps "Two colors, opposite" opposite when the accent changes later" in the engine's tests). [S9]
- Last verified: 2026-11-13

### [50.03] No Direction starts with choices that pull against each other

<!-- index: Direction | starting look; generated Direction -->

- **Rule.** Each of the 18 curated Directions, and each generated Direction, is complete, valid, and free of the conflicts that the Catalog knows. [S8; S9]
- **Test.** "has 38 curated Directions, each a complete, valid, conflict-free design with record fields"; "keeps the curated Directions clearly different from each other"; "never offers a generated Direction whose own choices pull against each other, over 60 seeds (decision D23)".
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

### [50.06] A written reason leaves a Decision only with a notice that offers it back

<!-- index: reason | why this choice; new pick; put back; see also: Decision -->

- **Rule.** A reason belongs to the choice it was written for: a slider move or a pick of the same Option keeps it; a pick of another Option, or putting the Step back, removes it, and the Studio then says so, quotes the reason, and offers one button that puts it back. [S1 at D50]
- **Test.** "says so when a new pick removes the reason written for the earlier choice, and puts it back on request". [S3]
- **Test.** "keeps the reason when the Decision is tuned, and drops it when another Option is picked"; "keeps the reason when the owner picks the same Option again (campaign 4, round 3)". [S9]
- **Open.** The owner may prefer that a reason always stays (decision D50 is open to veto). The notice goes when the owner moves to another screen.
- Last verified: 2026-11-14

### [50.07] A Skin changes colors only

<!-- index: Skin | other colors; color fade; chip; see also: Direction -->

- **Rule.** A Skin gives a Direction other colors, with or without a color fade in the headline; layout, letter styles, shapes, and the lightness of the main color stay as the Direction made them. A Direction offers a Skin only where the Skin's color shows on something large and the Skin's text is true of what is drawn, and only when it causes no clash and no failing color pair that the Direction's own colors pass. A project records the Skin it started in, and the Studio names it wherever it names the start. [S1 at D52; S1 at D54]
- **Test.** "offers a color fade only where the headline can really end in the Skin’s second color (code review of 2026-11-14)"; "changes colors only: layout, letters, shapes, and how light the main color is stay as the Direction made them"; "offers a Skin only where its color shows and its text is true, without a clash, in harmony, and with no color pair failing that the Direction’s own colors pass"; "says in a Skin’s text which color it gives and nothing about how light or how vivid, because the Direction keeps those". [S8]
- **Test.** "offers a Direction’s skins on its card; a skin changes the picture and the colors a project starts with, and nothing else". [S3]
- **Exceptions.** Five Directions offer no Skin: they paint their main color on small marks only, or their main color is nearly gray.
- **Open.** A Skin can be chosen only when a project starts; a later change of colors goes through the color Steps. Whether a Skin's color is easy to see in a card's small picture was judged from the design's values, not measured in pixels.
- Last verified: 2026-11-14

### [50.08] An Overlay changes no value of the design, and a project without Overlays is stored as before

<!-- index: Overlay | small helper; tooltip; are you sure; switch -->

- **Rule.** Switching an Overlay on or off changes the project's list of Overlays and nothing else; with the last Overlay switched off, the project equals the project before, so a project saved before Overlays existed opens and saves unchanged. Undo takes a switch back. [S1 at D53]
- **Test.** "keeps a project without Overlays exactly as it was: no new field, so older files and older tests read the same"; "stores the switched-on Overlays in the order of the Catalog, and reads them back". [S2]
- **Test.** "draws a switched-on Overlay in the preview, saves it, lists it on the Summary, keeps it through a reload, and lets Undo take it back"; "shows the main button that stays in view in the Summary’s phone preview only, and never on the cards of a Step"; "treats switched-on Overlays as work: a project that holds nothing else is kept as a copy, with Undo offered, when a Direction replaces it". [S3]
- Last verified: 2026-11-14

### [50.09] The Studio never writes a list of own Directions that it cannot read again

<!-- index: limit of own Directions | 100 Directions of your own; list too long -->

- **Rule.** The Studio holds at most 100 Directions of the owner's own. The form and a file both stop at that number and say how many were left out, so the stored list never grows past what the Studio reads at the next opening. [S1 at D61]
- **Test.** "holds at most 100, adds up to that number from a file, and says how many it left out (finding S6-03)". [S14]
- **Test.** In the browser: "adds 100 from a file of 101, says that 1 was left out, shows them after a reload, and keeps no 101st by the form". [S3]
- **Examples.** Until 2026-11-16 a file of 500 followed by one kept Direction made 501; at the next opening the Studio refused its own list and showed none (sixth review, finding S6-03).
- Last verified: 2026-11-16

### [50.10] A Direction of the owner's own holds the known design values and nothing else

<!-- index: unknown values in a file of own Directions | foreign data; bloated project -->

- **Rule.** Whatever a file of own Directions holds beside the known design values stays behind: it reaches neither the stored list nor a project started from the Direction. A name is stored in one form of its letters and never ends on a space or on half a character; a date must be written as the Studio writes dates; a replaced typeface is said in the note. [S14]
- **Test.** "holds the known design values and nothing else, whatever a file adds (finding S6-02)"; "compares names in one form of their letters, and stores a name in one form"; "never ends a cut name on a space or on half a character"; "refuses a date that is not written as the Studio writes dates (finding S6-09)"; "says so when a file names a typeface that the Studio replaced (finding S6-11)". [S14]
- Last verified: 2026-11-16

## [55] Your content (the Brief)

### [55.01] A text of the owner's is kept as typed, cleaned and cut at its limit, and the page never loses its name, its headline, or its main button

<!-- index: your content | Brief; own words; texts of the page; limit of a text -->

- **Rule.** Each text of the page and each of the three answers is stored on one line, without invisible signs and without signs that change the direction of writing, and cut at its own limit by whole characters. Quotation marks and apostrophes stay. The page's name, its headline, and the words on its main button cannot be emptied: an empty one changes nothing, and the screen says so. A service, a fact, and a price are added and removed within 1 to 8, 0 to 4, and 0 to 8; the menu keeps its five links. [S15; S1 at D61; S1 at D62]
- **Test.** "sets a text of the page, cleaned like any text that the Studio keeps, and cut at that text’s limit"; "never leaves the page without a name or a headline: an empty one changes nothing"; "adds and removes a service, a fact, and a price within the limits, and changes nothing beyond them"; "keeps the menu at its five links and changes their words only"; "lets a project from before this slice keep a list that is longer than the limit, and add nothing to it"; "holds the three answers with the project, cleaned and cut, and holds nothing where the owner wrote nothing"; "writes the texts and the answers into the project file and reads them back unchanged". [S15]
- **Test.** In the browser: "opens from the top bar, takes the owner’s words into the project and the previews, keeps them over a reload, and hands them over in mockup.html"; "stops each list at its limit and says why"; "draws markup in a text as text, never leaves the page without a name, and says when the words to mark are not in the headline". [S3]
- **Exceptions.** The limits are the builder's choice (decision D62). The words of the contact form are fixed. A project file from before may hold a longer list; the Studio then adds nothing to it.
- Last verified: 2026-11-16

### [55.02] An empty text or an empty list leaves no empty box on the page, and a text with markup is drawn as text

<!-- index: empty text | empty list; no empty box; markup in your content -->

- **Rule.** The Mockup draws a text only when it holds words, an item of a list only once it holds words, and a part of the page only when something stands in it. A text that holds markup or script is drawn as that text, and nothing runs. [S15; S10 at hard rule 6]
- **Test.** "draws the owner’s texts as text, and leaves no empty box where a text or a list is empty"; "draws every list at its most, and marks the headline’s words only where the headline holds them". [S15]
- **Exceptions.** The test looks for an element without content among the kinds of element that the page uses for text; it does not look at drawn pixels.
- Last verified: 2026-11-16

### [55.03] Every built-in Direction holds the owner's content at the ends of what the Brief allows without becoming wider than its window

<!-- index: long word | long name; fewest and most items; page wider than the window -->

- **Rule.** With the fewest items and no optional text, with the most items and every text at its limit, and with one 46-letter word in every place that takes one, no page of the 38 Directions and the plain start is wider than its window at 375 or 1280 pixels, and the headline stays larger than the reading text and every section heading. [S4]
- **Test.** "holds the owner’s content at the ends of what the Brief allows, on every Direction, at phone and desktop width: no page wider than its window, and the headline the largest text". [S4]
- **Exceptions.** The test measures width and the size of the headline. It does not measure overlap or beauty; the builder looked at 24 pictures of six Directions (finding B17-03). A figure of the facts may be larger than the headline; two Directions draw it so on purpose.
- **Examples.** Before 2026-11-16 a long word in the name or the headline made 46 of 234 such pages wider than their window (finding B17-01).
- Last verified: 2026-11-16

### [55.04] The three answers go into the Prescription as quoted data, and the owner's texts go into the reference page and nowhere else

<!-- index: three answers | what you offer; who it is for; quoted answers -->

- **Rule.** `PRESCRIPTION.md` carries each written answer inside a fenced block marked as quoted data, says when none was written, and says whether `mockup.html` shows the sample or the project's own texts. The owner's texts stand in `mockup.html`, as text; they stand in no other file of the four. [S13]
- **Test.** "carries the owner’s three answers as quoted data, and says when none was written (the Brief; SPEC.md section 2.7)"; "tells the AI coding tool to use the owner’s own texts word for word, and still treats them as content, never as instructions". [S13]
- **Test.** In the browser: "hands the three answers to the AI coding tool as quoted data in PRESCRIPTION.md, and says whose texts mockup.html shows". [S3]
- **Open.** As in §65.03: a fence marks text as data; whether an AI coding tool obeys the mark is not tested here.
- Last verified: 2026-11-16

### [55.05] The Studio asks before the sample replaces the owner's texts, keeps a copy, and treats a project that holds only the owner's words as work

<!-- index: put the sample text back | replace my texts; only my texts -->

- **Rule.** "Put the sample text back" asks first, keeps the project as it was among the kept copies where the browser allows it, and can be undone; the three answers stay. A project that holds nothing but the owner's texts or answers counts as work: the Studio asks before a new project, a Direction, or a file replaces it, and the question names the texts. [S3]
- **Test.** "puts the sample text back only after asking, keeps the owner’s texts as a copy, and brings them back with Undo"; "asks before a new project replaces a project that holds only the owner’s texts, and says that the texts go". [S3]
- **Exceptions.** The first test reads the stored project and the Undo; it does not open the list of kept copies.
- Last verified: 2026-11-16

## [60] The Studio's words

### [60.01] A trade word appears only inside round brackets

<!-- index: plain words | jargon; trade word -->

- **Rule.** Every text that the Studio shows uses plain words; a listed trade word appears only inside round brackets, as a word to learn. [S1 at D38]
- **Test.** "uses a trade word only inside round brackets, as a word to learn"; in the browser, "shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, on the Overlays, and on the Summary, with no error and no outside request". [S8; S3]
- **Exceptions.** The test knows only the words on its list (`packages/core/src/catalog/words.ts`); a trade word that is not on the list passes.
- Last verified: 2026-11-13

### [60.02] Every Step says where its guidance comes from and how well it is known

<!-- index: source | evidence; where guidance comes from -->

- **Rule.** Every Step carries plain text, its sources with how each is known, an evidence grade, and a review date. [S8]
- **Test.** "gives every Step plain text, sources that say how they are known, an evidence grade, and a real review date"; "grades a Step "measured" only when a source was read in full".
- **Policy.** Hard rule 5 and hard rule 13. [S10 at hard rule 5]
- Last verified: 2026-11-13

### [60.03] No Overlay and no research rule is graded "measured" without a source that was read in full

<!-- index: evidence grade | measured; search summary; research file; see also: source -->

- **Rule.** Each Overlay and each research rule is a Catalog record with sources, an evidence grade, and a review date; the grade "measured" needs a source that was read in full, and every source line names a record that its research file really holds, word for word. [S10 at hard rule 5; S1 at D53]
- **Test.** "has six Overlays, each a complete record with a source, an evidence grade, and a review date"; "names, in each source line, a record that the knowledge base really holds"; "has five research rules, each a complete record with sources, an evidence grade, and a review date". [S8]
- **Exceptions.** The tests check that a named record exists. They cannot check that the record is right: AI assistants wrote the records, mostly from search summaries, and nobody has reviewed them.
- Last verified: 2026-11-14

### [60.04] A research rule says "Holds" only when the measured number meets it

<!-- index: research rule | holds; does not hold; reading size; line length; target size -->

- **Rule.** The Summary measures each research rule on the open design and shows "Holds" or "Does not hold" with the number; four of the five rules hold on every Direction and on every Skin, a missing value never passes, and a rule whose value the sample website fixes says so. [S1 at D53]
- **Test.** "holds every binding rule on every Direction and on every Skin of every Direction"; "says "does not hold", with the number, when a design breaks a rule"; "says which rules a design can change and which the Template fixes, and names in words what a fixed rule leaves out"; "names the Directions that depart from a rule that does not bind, so that a new departure is a decision and not an accident". [S8]
- **Test.** "measures every research rule on the open design and says "Holds" or "Does not hold" with the number, as the core computes it"; "says so when a design does not hold a rule, leads to the Step that changes it, and follows the change". [S3]
- **Exceptions.** The rule "Reading text is at least 16 pixels tall" does not bind: the Direction "Control Room" uses 15 pixels on purpose. The Direction's record states that reason, a unit test refuses a departure without such a record, and the Summary shows the reason beside "Does not hold" while the start's text size stands (finding U5-16; test "names the Directions that depart from a rule that does not bind, so that a new departure is a decision and not an accident"). A rule measures values of the design, not the built website, and each rule states what a person must still check.
- Last verified: 2026-11-15

## [65] The craft rules and the Prescription

### [65.01] Every craft rule carries its mark on the sample website of every built-in Direction, and says so when a design sets it aside

<!-- index: craft rule | fine detail; invisible detail; set aside; see also: Prescription -->

- **Rule.** Each craft rule is a Catalog record with plain words for the owner, an exact instruction for the AI coding tool, a check that a program runs, a source, an evidence grade, and a date. The check finds the rule's mark in the style sheet of the Mockup of every built-in Direction. The instruction and the plain sentence follow the design: where a Step sets a rule aside (digits of natural width; no motion), both say so, and neither asks for what the design excludes. Every craft rule is graded "expert opinion". [S1 at D60; S1 at D61; S10 at hard rule 5]
- **Test.** "has craft rules, each a complete record in plain words with an exact instruction, a source, an evidence grade, and a date"; "holds every craft rule on the Mockup of every built-in Direction: the Mockup practices what the Prescription will ask for"; "has checks that can fail: no rule holds on an empty page, and each fails when its own detail is taken out of the Mockup"; "says what the open design gives where a Decision sets a rule’s value, and that nothing moves when motion is off"; "says of no design what the design does not do: every instruction and every sentence follows the design, for every Direction and every Option (findings T6-01, T6-03, U6-08, U6-09)"; "has a style sheet that does what the rules say in the cases that the review found"; "has checks that fail on each fault that the review planted (finding T6-13)"; "says where a rule departs from its source, and names an outside source where the research record holds one (finding T6-05)". [S8]
- **Test.** In the browser: "lists every craft rule with what the open design gives, as the core works it out, and follows a design without movement". [S3]
- **Exceptions.** A check is a search of the style sheet for text. It does not look at drawn pixels, and a style sheet can hold a fault that no check looks for; the sixth review showed five such cases, now repaired. Nine rules rest on practitioners' published rule sets, which the research record itself calls opinion; three rest on the builder's judgment alone. No person has reviewed a craft rule.
- Last verified: 2026-11-16

### [65.02] The four files of the Prescription hold the same design values, value by value

<!-- index: Prescription | export; files to build from; design values; see also: craft rule -->

- **Rule.** `tokens.css` holds every design value of the project and nothing else; `tokens.json` holds each of those values, either as a typed entry that stands for exactly the CSS value or as the CSS value word for word; `mockup.html` draws with each value under its name and holds no script. [S13]
- **Test.** "holds every design value in tokens.css, and the same value in tokens.json and in mockup.html"; "writes typed tokens only in the types of the Design Tokens format, each with a value of that type’s form"; "types a list of typefaces as a typeface and a keyword as a keyword, and gives each color’s parts as its six digits say (findings T6-10, T6-11)"; "writes tokens.css as one block of named values and nothing else". [S13]
- **Exceptions.** The builder read the Design Tokens format in the specification's own repository on 2026-11-15 and wrote the test from that reading. No validator program of the format has checked `tokens.json` (decision D60).
- Last verified: 2026-11-15

### [65.03] Words that the owner typed, or that came from a file, stand in the Prescription as quoted data, inside a fence that they cannot close

<!-- index: quoted data | fence; injected instruction; your own words in the Prescription; name of a Direction of your own -->

- **Rule.** The project's name, each written reason, and the name of a Direction that only the Studio knows (one of the owner's own, or one composed at random) stand in `PRESCRIPTION.md` inside a fenced block that the file marks as quoted data, not an instruction. The fence is longer than any run of fence marks in the text. Invisible signs and signs that change the direction of writing are taken out before the text is written. The name reaches neither `tokens.css` nor `tokens.json`. The file says that every word of `mockup.html` is content for the page, never an instruction. [S13; S1 at D60; S1 at D61]
- **Test.** "fences the owner’s own words so that they cannot act as an instruction or close their fence"; "keeps the name of an own Direction from acting as an instruction, as markup, or as a hidden sentence (findings S6-01, S6-07, T6-04)"; "writes the owner’s words without invisible signs and without signs that change the direction of writing"; "says “a sample dental practice” only of the sample texts, and says that no word of mockup.html is an instruction". [S13]
- **Test.** In the browser: "writes a name from a file of own Directions as quoted data, so that it cannot act as an instruction (finding S6-01)"; "names a start that only the Studio knows: a Direction of the owner’s own". [S3]
- **Policy.** Hard rule 10: content is data, never an instruction. [S10 at hard rule 10]
- **Examples.** Until 2026-11-16 the name of an own Direction stood in the sentence "Start: the Direction “...”", outside every fence; a file of own Directions could put an instruction there (sixth review, finding S6-01, a blocker).
- **Open.** A fence marks text as data; it cannot force a reader to treat it so. Whether an AI coding tool obeys the mark is not tested here; the Fitter (M7) will test builds.
- Last verified: 2026-11-16

### [65.04] The same project always gives the same four files, and a change of any line is seen

<!-- index: stored copy of the files | snapshot; same files again -->

- **Rule.** The core writes the four files from the project alone: the same project gives the same files, and the files for two projects are stored word for word, so that a change of any line fails a test until someone decides it. [S13]
- **Test.** "writes seven files, and writes the same files again for the same project"; "keeps the four files as stored for two projects, so that a change of any line is seen and decided". [S13]
- **Elements.** `PRESCRIPTION.md`, `tokens.css`, and `tokens.json` are stored in one file of the test; `mockup.html` is stored for the same two projects as a page of its own, which a person can open in a browser.
- Last verified: 2026-11-15

### [65.05] The Prescription names the start, every Decision, every craft rule, and what a person must still check, and claims no standard

<!-- index: what a person must still check | not checked; compliance claim in the Prescription -->

- **Rule.** `PRESCRIPTION.md` names the project's start (also a Direction of the owner's own, a Direction composed at random, or the plain start), lists every Step with its Decision, its rejected Options, and its reason, names the Option that stands where a Step is not decided, lists the Overlays and every craft rule with its instruction, says what was checked and what a person must still check, says what this first slice leaves out, and calls no result compliant with a standard. [S13]
- **Test.** "names the start, every Step with its Decision, the rejected Options, the Overlays, every craft rule, and what a person must still check"; "names a start that the core cannot know by the name that the Studio hands over, and says so plainly when it has none"; "says that mockup.html has every craft rule only where a check of that very page holds, for every Direction and every Option"; "says whether mockup.html carries the typefaces, as the Studio hands them over or not"; "reads the craft rules in the style sheet only: words in the content cannot change what the file says (finding S6-06)"; "shows each switched-on Overlay open in mockup.html, and says where (findings T6-02, U6-03)"; "lists under “no program checked” only what the design has (finding U6-04)"; "reports contrast in words that are true of the setting: off is not “none failed”, and nothing is called the owner’s pick (findings U6-06, U6-08)"; "writes a kept Decision, and writes a craft rule that the design sets aside without asking for what the Decision excludes (findings T6-03, U6-09)". [S13]
- **Exceptions.** The sentence that the file writes when a craft rule's check does not hold on the page has no test: no design that the tests can make fails a check.
- **Policy.** Hard rule 8. [S10 at hard rule 8]
- Last verified: 2026-11-15

### [65.06] A file that the Summary hands over equals what the core writes for the stored project

<!-- index: download a Prescription file | copy a Prescription file -->

- **Rule.** Each of the four download buttons on the Summary hands over exactly the file that the core writes for the stored project and for the font rules that the Studio adds (`mockup.html` included, letter for letter); a downloaded `mockup.html` draws each switched-on Overlay open; after a new Decision the files show the change; a project that started from a Direction of the owner's own names that Direction. [S3]
- **Test.** "hands over each of the four files as the core writes it for the stored project, and follows a new Decision"; "names a start that only the Studio knows: a Direction of the owner’s own"; "hands over a mockup.html that draws each switched-on Overlay open (findings T6-02, U6-03)". [S3]
- **Open.** The "Copy" buttons are not covered by an automatic test.
- Last verified: 2026-11-15

### [65.07] Every file of the Prescription carries one fingerprint of the design values, and no date

<!-- index: fingerprint | which files belong together; eight characters; no date in the files -->

- **Rule.** The core works out eight characters from the design values. The same design gives the same eight, a changed value gives others, and each of the 38 Directions has its own. All seven files carry them. No file carries a date, so the same project always gives the same files. [S13; S1 at D63]
- **Test.** "marks every file with one fingerprint of the design values: the same for the same design, another for a changed one, and never a date (SPEC.md section 2.9)". [S13]
- **Exceptions.** The fingerprint is a mark to compare, not a seal: it proves nothing about who wrote a file. It covers the design values, not the owner's texts. The comments of the sample website's style sheet name earlier reviews, some with a day; they are fixed text.
- Last verified: 2026-11-16

### [65.08] FONTS.md, DESIGN.md, and theme.css say the design in three more forms, each from the design's own values

<!-- index: FONTS.md | DESIGN.md; theme.css; ready-made parts; how to ship the letter styles -->

- **Rule.** `FONTS.md` names each typeface with its CSS family, licence, package, and the version that the Studio itself ships. `DESIGN.md` holds the values first and then eight sections in the order that its format fixes; every color in it is a color of the design. `theme.css` gives each of the 32 names that the shadcn library reads a value of the design, the same for the light and the dark name. The owner's words reach none of the three. [S13]
- **Test.** "writes FONTS.md: each typeface with its family, licence, package, and version, and a device’s own typeface without a file (SPEC.md section 2.9)"; "writes DESIGN.md in the DESIGN.md format as its specification was read: values first, then the eight sections in their fixed order (SPEC.md section 2.9)"; "writes theme.css: every name that the shadcn component library reads, each with a value of the design, the same for the light and the dark name (SPEC.md section 2.9)". [S13]
- **Exceptions.** The lists of names and sections are as the two formats' own pages had them on 2026-11-16 (research record 11). No program of the shadcn library has read `theme.css`.
- Last verified: 2026-11-16

### [65.09] Two programs that the builder did not write read DESIGN.md and tokens.json, on GitHub only

<!-- index: outside validators | lint program; parser; checked on GitHub only -->

- **Rule.** On every push, GitHub runs the lint program of the DESIGN.md format on `DESIGN.md` and an outside parser of the Design Tokens format on `tokens.json`, for the plain start and each of the 38 Directions. Neither may report an error. Each must report one for a planted fault, so that its silence means something. [S17; S1 at D64]
- **Test.** "has no error for the plain start and for every built-in Direction"; "does report an error for a planted fault, so that its silence means something"; "is read without an error for the plain start and for every built-in Direction"; "is refused with a planted fault, so that a clean reading means something". [S17]
- **Exceptions.** By the owner's choice these four tests never run on the machine where the Studio is built; `npm run check` and `npm run e2e` do not include them. The lint program's warnings do not fail the check; the run's log prints them.
- Last verified: 2026-11-16

### [65.10] One archive file holds the seven files, each letter for letter

<!-- index: archive | one download for all files; zip file -->

- **Rule.** The button for all files hands over one archive file whose name carries the fingerprint. It holds the seven files under their names, each equal to the file that its own button hands over, and the same files always give the same archive. A file that the private page refuses for its kind is saved with ".txt" at the end of its name, and the Studio says so. [S16; S3]
- **Test.** "holds every file under its name, letter for letter, with a check sum that an unpacking program accepts"; "keeps letters beyond the plain alphabet, an empty file, and a name with a space". [S16]
- **Test.** In the browser: "hands over all seven files, each as the core writes it, and all of them as one archive file that holds the same seven (SPEC.md section 2.9)"; "saves a file that the private page may not hand over under its own name with “.txt” at its end, and says so". [S3]
- **Open.** The second browser test uses a stand-in for the private page; no test opens the real one (finding R23-01).
- Last verified: 2026-11-16

## [66] The Fit check (measuring a build against the Prescription)

### [66.01] The program measures six things and one more, and the Mockup passes its own measure

<!-- index: fit check | measures a build; receipt; reference build -->

- **Rule.** `npm run fit -- <build.html> <folder> <result folder>` opens the build in a real browser at 375 and 1280 pixels, and measures: every request and every outside reference; every color that a visible element draws; the typeface of every text; the radius of every drawn box; the contrast of every text; the three required texts of the Brief; and the page's width. It reports each deviation with its element. The Mockup of a project is the reference build, and it must show no deviation in requests, colors, typefaces, radii, content, and width. Contrast is reported as a measurement and never changes the status, because the Prescription holds no Floors yet. [S18; S1 at D65]
- **Test.** "finds no deviation in the Mockup of the plain start or of any of the 38 Directions". [S18]
- **Elements.** Playwright and a Chromium browser are on the machine. The four files of the Prescription (`PRESCRIPTION.md`, `tokens.css`, `tokens.json`, `mockup.html`) are in one folder.
- **Exceptions.** Hover, focus, shadows, gradients, images, and every page other than the one given are not measured. A text on an image or a gradient, and a text drawn partly transparent, have no contrast reading; the receipt counts them and names the reason.
- Last verified: 2026-11-16

### [66.02] Each deviation that the program claims to find, it finds; each fault of its own inputs, it names

<!-- index: self-test | planted damage; refusals; status -->

- **Rule.** The program reports each of eight damages of the reference build: one color changed, one typeface changed, one radius changed, a remote font link, a remote script, the headline removed, the page widened, and the text color made equal to the background. It refuses, with status 2 and no receipt, a missing file, files with different fingerprints, an empty build, and a build that is not an HTML page. A page that never finishes loading is recorded, every measure of that window width is marked "not measured", and the status is 1. A page's error while it loads is recorded, and the measurements still run. [S18]
- **Test.** The eight tests of "eight damages, each reported", and the tests of "refusals and faults of the build". [S18]
- **Exceptions.** A damage that the program has no measure for is not found: the self-test names eight, not every possible fault.
- Last verified: 2026-11-16

### [66.03] The receipt keeps measuring, judging, and asking apart, and holds nothing that changes between two runs

<!-- index: honest receipt | three parts; fenced quotes; same receipt -->

- **Rule.** The receipt has three parts: "Measured", "Judged by the model" (empty in this slice), and "Still needs a person". Text that comes from the page stands only inside a fence of backticks longer than any run in the text, and the receipt marks it as quoted data. The receipt holds no date and no time, so the same page and the same files give the same receipt, byte for byte. It never calls a page accessible or compliant (hard rule 8). [S18; S10 at hard rule 8]
- **Test.** "shows page text only inside a fence that no backtick of the page can close, and treats it as data"; "gives byte-for-byte the same receipt for the same inputs, and never claims that a page is accessible or compliant". [S18]
- **Exceptions.** The program reads the page's text only through the browser's own engine; a page that attacks the browser itself is outside what this slice defends against (the program blocks every network request, but the page runs its own scripts).
- Last verified: 2026-11-16

### [66.04] The first build trial is stored whole, belongs to today's files, and measures to its own receipt

<!-- index: build trial | stored run; helper agent; one run -->

- **Rule.** `plugin/fit/trials/001/` holds the instruction, the seven files that the helper received, the helper's page, the receipt in two forms, and a record that says what the run shows and what it does not show. The seven files equal what the core writes today for the fixed project of `plugin/fit/e2e/trial-project.ts`, and the receipt names their fingerprint. Run again on the stored page, the program gives the stored receipt byte for byte. The record states that it is one run and not a rate, and that the helper cannot be held to the rule of reading no other file. [S19; S1 at D65]
- **Test.** The five tests of "First build trial: the stored record". [S19]
- **Open.** The run found that the "requests" measure lists the font files that `FONTS.md` tells the builder to ship (finding R25-01). No run without the Prescription exists, so the record cannot say that the files improved the page.
- Last verified: 2026-11-16

### [66.05] The comparison run sets two pages side by side with numbers that come from the receipts

<!-- index: comparison run | side by side; without the files; table -->

- **Rule.** `plugin/fit/trials/002/` holds a second run: the same project in plain words, no file, and the page that a helper built. The program measured it against the same values as trial 001. The record's table gives each measure's two deviation counts exactly as the receipts state them, and the record says that it does not say which page looks better and that it holds two measurements, not a rate. [S19; S1 at D66]
- **Test.** "gives the second helper no file"; "carries every text of the sample content and all six chosen Options in the instruction"; "has a table in its record that gives, for each measure, the deviation counts of both receipts exactly as the receipts state them". [S19]
- **Open.** Trial 001's helper received `mockup.html` and `tokens.css`, so a zero there partly reflects copied values. The helpers may have had the repository's `CLAUDE.md` in their context (finding R26-01).
- Last verified: 2026-11-16

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

### [70.03] Every dependency is pinned to an exact version; a version that the builder adopts is at least 7 days old

<!-- index: dependency | package; pinned version -->

- **Rule.** The project pins exact dependency versions, records a check of each direct dependency, and adopts a version only 7 days or more after its release. [S1 at D27]
- **Policy.** Hard rule 7. [S10 at hard rule 7]
- **Exceptions.** The owner merged six of Dependabot's updates on 2026-11-14 (among them Playwright 1.65.0 and Vite 8.3.7). Nobody checked those six versions against the 7-day wait, and their rows in the package-check table still show the versions of 2026-11-13 (review of 2026-11-14, finding DT-03).
- **Open.** Registry signatures are unverified in this environment (stated in `DECISIONS.md`). No automatic test enforces the 7-day wait. Since 2026-11-15 Dependabot's "cooldown" setting (7 days, in `.github/dependabot.yml`) keeps it from proposing a version update earlier; the setting's form was read in GitHub's options reference, and nobody has yet seen Dependabot act on it in this repository. A security update is proposed at once, which is the exception that D27 names.
- Last verified: 2026-11-15

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
- **Overlay** (UF: small helper): a helper that appears over the page and that the owner switches on or off for any Direction: a tooltip, an "Are you sure?" question, a notice. §50.08
- **Research rule**: a finding from research, turned into a number that the Studio measures on a design; advice, with its strength stated. §60.04
- **Replace action**: an opened file, a new Direction, or a new project that takes the place of the current work. §10.05
- **Skin**: pre-built colors and color fades for a Direction; a Skin changes colors only. §50.07
- **Standing notice** (UF: hold): a notice that needs the owner's answer; it has its own row and stays until the owner answers. The word avoids "decision", because a Decision is the recorded result of a Step. §10.07
- **Step**: one screen of the Studio that asks for one design decision. §50.02

## [85] Changelog

- 2026-11-16 v1.14: after the comparison run (feature F026, decision D66): added §66.05. 71 guarantees.
- 2026-11-16 v1.13: after the first build trial (feature F025, decision D65): added §66.04. 70 guarantees.
- 2026-11-16 v1.12: after the first slice of the Fit check (feature F024, decision D65): added §66.01 to §66.03. 69 guarantees.
- 2026-11-16 v1.11: after the rest of the Prescription's files (features F019 to F023, decisions D63 and D64): added §65.07 to §65.10; §65.04 names its test by its new title. 66 guarantees.
- 2026-11-16 v1.10: after the first slice of the Brief (features F015 to F018, decisions D61 and D62): added §55.01 to §55.05. 62 guarantees.
- 2026-11-16 v1.9: after the sixth red-team review (features F012 and F013, decision D61): §65.01, §65.03, §65.04, §65.05, and §65.06 state the repaired behavior and name the new tests; §20.06 names the tests of the look-alike signs and its limit; added §50.09 and §50.10. 57 guarantees.
- 2026-11-15 v1.8: after the craft layer and the first slice of the Prescription (features F009 to F011, decisions D58 and D60): added §65.01 to §65.06. 55 guarantees.
- 2026-11-15 v1.7: after the repair of finding F-18 (feature F001): §10.13 covers a page that closes within 2 seconds after its own save, and names five new tests and the trial's counts. 49 guarantees.
- 2026-11-15 v1.6: after the owner's decisions of 2026-11-15 (decision D55): §10.01 states the status line after an Undo back to the stored project; §50.01 states when a design holds an Option whose second color follows, and names the new test; §60.04 states how a departure on purpose is recorded and shown; §70.03 names Dependabot's cooldown. 49 guarantees.
- 2026-11-14 v1.5: after the reviews of 2026-11-14 (decision D54): §20.06 covers look-alike marks and invisible direction signs; §20.07 says which original is kept; §50.07 states the rule for offering a Skin; §70.03 states its exception. 49 guarantees.
- 2026-11-14 v1.4: after the saving table, Skins, Overlays, and research rules (decisions D52, D53): added §10.14, §20.07, §30.06, §50.07, §50.08, §60.03, §60.04; §60.01 names the test under its new name. 49 guarantees.
- 2026-11-14 v1.3: after round 3 of campaign 4: added §10.12, §10.13, §20.05, §20.06, §50.06. 42 guarantees.
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
- [S12] The builder, *The saving table: what the Studio does with your work, in every situation*, file `docs/reference/saving-table.md` (2026-11-14). Accessed 2026-11-14. Grade: A.
- [S13] The builder, *Unit tests of the Prescription*, file `packages/core/test/prescription.test.ts` (2026-11-15). Accessed 2026-11-15. Grade: A.
- [S14] The builder, *Unit tests of a Direction of the owner's own*, file `packages/core/test/ownDirections.test.ts` (2026-11-15). Accessed 2026-11-16. Grade: A.
- [S15] The builder, *Unit tests of the Brief*, file `packages/core/test/brief.test.ts` (2026-11-16). Accessed 2026-11-16. Grade: A.
- [S16] The builder, *Unit tests of the archive file*, file `packages/core/test/zip.test.ts` (2026-11-16). Accessed 2026-11-16. Grade: A.
- [S17] The builder, *The outside validators' tests, run on GitHub only*, file `validators/outside.test.mjs` (2026-11-16). Accessed 2026-11-16. Grade: A.
- [S18] The builder, *Browser tests of the Fit check*, file `plugin/fit/e2e/fit.e2e.ts` (2026-11-16). Accessed 2026-11-16. Grade: A.
- [S19] The builder, *Tests of the stored build trial*, file `plugin/fit/e2e/trial.e2e.ts` (2026-11-16). Accessed 2026-11-16. Grade: A.

## [91] Cite index

<!-- authorities:start -->
- [S1] The builder and the owner, *DECISIONS.md*, repository `catcorner22/frontend`, file `DECISIONS.md` (2026-11-13) — §10.02, §10.03, §10.05, §10.07, §10.08, §10.09, §10.12, §10.13, §20.05, §20.06, §20.07, §30.06, §40.01, §50.05, §50.06, §50.07, §50.08, §50.09, §55.01, §60.01, §60.03, §60.04, §65.01, §65.03, §65.07, §65.09, §66.01, §66.04, §66.05, §70.02, §70.03
- [S2] The builder, *Unit tests of the project file*, file `packages/core/test/project-file.test.ts` (2026-11-13) — §20.01, §20.02, §20.03, §20.04, §20.05, §20.07, §50.08
- [S3] The builder, *Browser tests of the Studio*, file `apps/studio/e2e/studio.e2e.ts` (2026-11-13) — §10.01, §10.02, §10.03, §10.04, §10.05, §10.06, §10.07, §10.08, §10.09, §10.10, §10.11, §10.12, §10.13, §10.14, §20.02, §20.03, §20.05, §20.06, §20.07, §30.02, §30.03, §30.04, §50.06, §50.07, §50.08, §50.09, §55.01, §55.04, §55.05, §60.01, §60.04, §65.01, §65.03, §65.06, §65.10, §70.04
- [S4] The builder, *Browser tests of the Mockup and of drawn colors*, file `apps/studio/e2e/visual.e2e.ts`… — §30.05, §40.02, §55.03, §70.02
- [S5] The builder, *Unit tests of the color values and contrast checks*, file `packages/core/test/tokens.test.ts`… — §40.01, §40.02, §40.03, §40.05, §40.04
- [S7] The builder, *Unit tests of the Mockup*, file `packages/core/test/mockup.test.ts` (2026-11-13) — §30.01, §30.02, §30.03, §30.06
- [S8] The builder, *Unit tests of the Catalog*, file `packages/core/test/catalog.test.ts` (2026-11-13) — §40.04, §50.02, §50.03, §50.07, §60.01, §60.02, §60.03, §60.04, §65.01, §70.05
- [S9] The builder, *Unit tests of the engine*, file `packages/core/test/engine.test.ts` (2026-11-13) — §20.01, §50.01, §50.02, §50.03, §50.04, §50.05, §50.06
- [S10] The owner and the builder, *Standing rules for every session in this repository*, file `CLAUDE.md`… — §30.01, §30.04, §30.06, §40.04, §55.02, §60.02, §60.03, §65.01, §65.03, §65.05, §66.03, §70.01, §70.03, §70.05
- [S11] The builder, *Boundary rules*, file `.dependency-cruiser.cjs` (2026-11-13) — §70.01
- [S12] The builder, *The saving table: what the Studio does with your work, in every situation*, file… — §10.14
- [S13] The builder, *Unit tests of the Prescription*, file `packages/core/test/prescription.test.ts` (2026-11-15) — §55.04, §65.02, §65.03, §65.04, §65.05, §65.07, §65.08
- [S14] The builder, *Unit tests of a Direction of the owner's own*, file `packages/core/test/ownDirections.test.ts`… — §20.06, §50.09, §50.10
- [S15] The builder, *Unit tests of the Brief*, file `packages/core/test/brief.test.ts` (2026-11-16) — §55.01, §55.02
- [S16] The builder, *Unit tests of the archive file*, file `packages/core/test/zip.test.ts` (2026-11-16) — §65.10
- [S17] The builder, *The outside validators' tests, run on GitHub only*, file `validators/outside.test.mjs`… — §65.09
- [S18] The builder, *Browser tests of the Fit check*, file `plugin/fit/e2e/fit.e2e.ts` (2026-11-16) — §66.01, §66.02, §66.03
- [S19] The builder, *Tests of the stored build trial*, file `plugin/fit/e2e/trial.e2e.ts` (2026-11-16) — §66.04, §66.05
<!-- authorities:end -->

## [92] Index

<!-- index:start -->
**Symbols**

- 100 Directions of your own — *see* limit of own Directions

**A**

- accessible — *see* compliance claim
- ADA — *see* compliance claim
- another window — *see* two tabs
- **archive** — §65.10
- are you sure — *see* Overlay
- autosave — *see* saving

**B**

- backup — *see* kept copy
- baseline — *see* stored picture
- bloated project — *see* unknown values in a file of own Directions
- boundary — *see* core
- Brief — *see* your content
- **build trial** — §66.04

**C**

- **card** — §50.04; *see also* Decision
- **changed Decision** — §20.04; *see also* project file
- checked on GitHub only — *see* outside validators
- chip — *see* Skin
- closing a tab — *see* unsaved work
- **closing in the same instant** — §10.13; *see also* two tabs
- color fade — *see* Skin
- **comparison run** — §66.05
- **compliance claim** — §40.04
- compliance claim in the Prescription — *see* what a person must still check
- console error — *see* page error
- content policy — *see* locked frame
- contrast — *see* contrast check
- **contrast check** — §40.02; *see also* written color
- copy — *see* kept copy
- copy a Prescription file — *see* download a Prescription file
- **core** — §70.01
- corrected file — *see* changed Decision
- corrupt — *see* unreadable project
- **craft rule** — §65.01; *see also* Prescription

**D**

- damaged project — *see* unreadable project
- **Decision** — §50.01; *see also* project file
- **dependency** — §70.03
- design values — *see* Prescription
- DESIGN.md — *see* FONTS.md
- **Direction** — §50.03
- does not hold — *see* research rule
- download — *see* project file
- **download a Prescription file** — §65.06
- **drawn color** — §40.05; *see also* contrast check

**E**

- eight characters — *see* fingerprint
- empty list — *see* empty text
- **empty text** — §55.02
- enforce — *see* Fix for me
- error message — *see* refused file
- evidence — *see* source
- **evidence grade** — §60.03; *see also* source
- exact digits — *see* written color
- export — *see* Prescription

**F**

- fence — *see* quoted data
- fenced quotes — *see* honest receipt
- fewest and most items — *see* long word
- file name — *see* quotation marks
- files to build from — *see* Prescription
- fine detail — *see* craft rule
- **fingerprint** — §65.07
- **fit check** — §66.01
- **Fix for me** — §40.03; *see also* contrast check
- **following value** — §50.05; *see also* Decision
- **FONTS.md** — §65.08
- foreign data — *see* unknown values in a file of own Directions
- forged sentence — *see* quotation marks

**G**

- generated Direction — *see* Direction
- gloss button — *see* drawn color
- gradient — *see* drawn color

**H**

- hand-edited file — *see* changed Decision
- heading size — *see* phone width
- helper agent — *see* build trial
- hex — *see* written color
- hold — *see* standing notice
- holds — *see* research rule
- **honest receipt** — §66.03
- **hostile text** — §30.02; *see also* Mockup
- how to ship the letter styles — *see* FONTS.md

**I**

- iframe — *see* locked frame
- injected instruction — *see* quoted data
- injection — *see* hostile text
- innerHTML — *see* text as text
- invisible detail — *see* craft rule

**J**

- jargon — *see* plain words
- json file — *see* project file

**K**

- **kept copy** — §10.02, §10.03; *see also* saving

**L**

- **lasting copy** — §10.12; *see also* kept copy
- **late copy** — §10.11; *see also* kept copy
- later version — *see* unknown Overlay
- leaving copy — *see* closing in the same instant
- leaving the page — *see* unsaved work
- left out — *see* unknown Overlay
- limit of a text — *see* your content
- **limit of own Directions** — §50.09
- line length — *see* research rule
- lint program — *see* outside validators
- lint rule — *see* text as text
- list too long — *see* limit of own Directions
- **locked frame** — §30.03
- long name — *see* long word
- **long word** — §55.03

**M**

- markup — *see* hostile text
- markup in your content — *see* empty text
- measured — *see* evidence grade
- measured style — *see* stored picture
- measures a build — *see* fit check
- **Mockup** — §30.01; *see also* locked frame

**N**

- name of a Direction of your own — *see* quoted data
- narrow screen — *see* phone width
- network — *see* outside request
- new pick — *see* reason
- new project — *see* replace action
- newer copy — *see* late copy
- no date in the files — *see* fingerprint
- no empty box — *see* empty text
- not checked — *see* what a person must still check
- not saving — *see* standing notice
- notice — *see* Overlay picture

**O**

- **old project** — §20.03; *see also* project file
- one download for all files — *see* archive
- one run — *see* build trial
- one variable — *see* Step
- only my texts — *see* put the sample text back
- open a file — *see* project file
- **opening** — §10.10; *see also* saving
- **opening while another tab saves** — §10.14; *see also* two tabs
- opposite colors — *see* following value
- Option — *see* Step
- other colors — *see* Skin
- out of range — *see* rejected Options
- **outside request** — §30.04
- **outside validators** — §65.09
- overflow — *see* phone width
- **Overlay** — §50.08
- **Overlay picture** — §30.06; *see also* Mockup
- own words — *see* your content

**P**

- package — *see* dependency
- packages/core — *see* core
- page database — *see* late copy
- **page error** — §70.04; *see also* stored picture
- page wider than the window — *see* long word
- parser — *see* outside validators
- passing pair — *see* contrast check
- **phone width** — §30.05; *see also* Mockup
- pick — *see* Decision
- pinned version — *see* dependency
- placeholder project — *see* opening
- **plain words** — §60.01
- planted damage — *see* self-test
- **Prescription** — §65.02; *see also* craft rule
- preview — *see* Mockup
- preview of an Option — *see* card
- **project file** — §20.01
- project name — *see* quotation marks
- promise of a kept copy — *see* lasting copy
- put back — *see* reason
- **put the sample text back** — §55.05

**Q**

- question — *see* Overlay picture
- **quotation marks** — §20.06
- quoted answers — *see* three answers
- **quoted data** — §65.03

**R**

- race — *see* closing in the same instant
- reading size — *see* research rule
- ready-made parts — *see* FONTS.md
- **reason** — §50.06; *see also* Decision
- receipt — *see* fit check
- record — *see* Decision
- reference build — *see* fit check
- refusals — *see* self-test
- **refused file** — §20.02; *see also* project file
- **rejected Options** — §20.05; *see also* Decision
- remote font — *see* outside request
- repaired — *see* Fix for me
- **replace action** — §10.05
- replace my texts — *see* put the sample text back
- research file — *see* evidence grade
- **research rule** — §60.04
- running copy — *see* unsaved work

**S**

- same files again — *see* stored copy of the files
- same millisecond — *see* save mark
- same receipt — *see* honest receipt
- same text — *see* lasting copy
- sandbox — *see* locked frame
- **save mark** — §10.09; *see also* two tabs
- saved — *see* saving
- **saving** — §10.01
- saving table — *see* opening while another tab saves
- screenshot — *see* stored picture
- script — *see* Mockup
- search summary — *see* evidence grade
- second color — *see* following value
- second tab — *see* two tabs
- **self-test** — §66.02
- set aside — *see* craft rule
- side by side — *see* comparison run
- **Skin** — §50.07; *see also* Direction
- slider end — *see* rejected Options
- slow opening — *see* opening while another tab saves
- slow page database — *see* opening
- small helper — *see* Overlay
- small variation — *see* card
- snapshot — *see* stored copy of the files
- **source** — §60.02
- **standing notice** — §10.07; *see also* saving
- start again — *see* replace action
- starting look — *see* Direction
- status — *see* self-test
- **Step** — §50.02
- still picture — *see* Overlay picture
- stopped saving — *see* standing notice
- storage — *see* saving
- storage full — *see* kept copy
- **stored copy of the files** — §65.04
- **stored picture** — §70.02
- stored run — *see* build trial
- switch — *see* Overlay

**T**

- table — *see* comparison run
- target size — *see* research rule
- **text as text** — §70.05; *see also* hostile text
- texts of the page — *see* your content
- theme.css — *see* FONTS.md
- **three answers** — §55.04
- three parts — *see* honest receipt
- tooltip — *see* Overlay
- tracking — *see* outside request
- trade word — *see* plain words
- **two tabs** — §10.06; *see also* saving
- two windows — *see* closing in the same instant

**U**

- uncaught error — *see* page error
- undo — *see* replace action
- **unknown Overlay** — §20.07; *see also* Overlay
- **unknown values in a file of own Directions** — §50.10
- **unreadable project** — §10.04; *see also* kept copy
- **unsaved work** — §10.08; *see also* kept copy
- upgrade — *see* old project

**V**

- value beyond a slider — *see* rejected Options
- version 1 — *see* old project
- visual test — *see* stored picture

**W**

- WCAG — *see* compliance claim
- **what a person must still check** — §65.05
- what you offer — *see* three answers
- where guidance comes from — *see* source
- which files belong together — *see* fingerprint
- who it is for — *see* three answers
- why this choice — *see* reason
- without the files — *see* comparison run
- **written color** — §40.01
- wrong file — *see* refused file

**Y**

- **your content** — §55.01
- your own words in the Prescription — *see* quoted data

**Z**

- zip file — *see* archive
<!-- index:end -->

## [99] Health

<!-- health:start -->
_91 sections, 18 sources, 70 index terms. Cadence: 90 days. Generated content last changed 2026-11-16._

- No findings.
<!-- health:end -->
