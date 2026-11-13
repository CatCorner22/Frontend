# Red-team report: confused first-time user (round b)

- Date: 2026-11-13
- Reviewer role: confused first-time user, no design vocabulary, keyboard only for half the session.
- What I tested: the built page `apps/studio/dist/artifact/local-test.html` (from `npm run build:page` on branch `claude/brave-mayer-sawqz9`), opened with a file:// URL in Playwright Chromium. Viewports: 1440x900, 720x450 (stands in for 200% zoom), 375x800 (phone). I drove it with my own scripts and looked at the screenshots.
- What I did not trust: the repository's documents. Every finding below comes from what the running page showed or did.

Counts: 1 blocker, 7 major, 13 minor, 3 notes.

---

## Blocker

### U2-01: "You can undo it afterwards" is false after a reload, and the earlier project is gone
- Severity: blocker (work is lost)
- Where: Directions view, the "Start again" dialog; 720x450 and 1440x900
- Steps:
  1. Start from Graphite Precision. Pick Options on 3 Steps ("3 of 23 Steps decided").
  2. Click "1. Directions", then "Start from Poster Block".
  3. The dialog says: "Start again from “Poster Block”? This replaces your current design and clears your 3 Decisions. You can undo it afterwards." Click "Start again".
  4. Reload the page (or close the tab and come back later).
- Observed: "0 of 23 Steps decided", "Started from Poster Block", and Undo is grayed out. Nothing on screen offers to restore the earlier project. Browser storage holds only one key (`refraction.project.v2`), so I found no backup either.
- Expected: either the promise holds across a reload, or the dialog says when it stops holding.
- Fix: keep the replaced project as a recoverable backup and offer "Bring back the project you replaced" after a reload. At minimum, use the wording the "Start a new project…" dialog already uses: "You can undo it until you close or reload this page. To be safe, download the project file first," and put a "Download the project file" button inside this dialog.

## Major

### U2-02: Sunlit Studio promises readable links, and then the Summary says the links fail
- Severity: major (a likely wrong choice, based on a false promise)
- Where: Directions card "Sunlit Studio"; Summary "Notes on this design"; 1440x900
- Steps: Start from Sunlit Studio, then open "3. Summary".
- Observed: the Direction card says "It also darkens yellow links until they stand out from the page." The Summary says "Links on the page background: 3.04 to 1, below the guideline of 4.5 to 1. Links on boxes: 3.17 to 1, below the guideline of 4.5 to 1." On the Steps, these notes sit in a closed fold under the large preview ("2 contrast notes (advice; nothing was changed)") and are usually below the bottom edge of the screen.
- Expected: the Direction does what its card says, or the card does not say it.
- Fix: correct the Sunlit Studio link color so that it reaches 4.5 to 1, or remove the sentence. Also show a short, visible line near the Pick button when the Option on show has a contrast note, for example: "2 color pairs are hard to read. See the notes under the preview."

### U2-03: Help text uses design jargon and refers to documents I do not have
- Severity: major (a real person stalls on the explanation that is meant to help)
- Where: Step intros and Option details; 1440x900
- Observed, quoted exactly:
  - Step 11: "Most of any interface is "neutral" … In the open design systems that were read … more than the accent does." "Seen in: Radix Colors, the "slate" family".
  - Step 12: "The accent is the single strong color … Hue is the kind of color (its place on the color wheel). Chroma is how vivid it is."
  - Step 13: "A rule of thumb in your own reference files is 60-30-10: about sixty percent neutral, thirty percent a supporting tone, ten percent accent." (Which reference files? I have none.)
  - Step 16: "In the sites whose code a research helper read, these backgrounds stay faint … Turned up loud, the same effect is a listed sign of AI-default design."
  - Step 17: "The exact rule, called concentric radius, is: outer radius equals inner radius plus the gap between them."
  - Step 18: "Elevation is how a card or panel stands apart … a shadow is a stack of faint layers that starts with a one-pixel ring."
  - Step 22: "Your own checklist puts it this way" (which checklist?). "Watch for: Numbering things that are not a sequence is a listed sign of AI-default design."
  - "Seen in:" lines name tools I have never heard of: "Magic UI", "Radix Themes and GitHub Primer", "coss ui", "Supabase and the React Email site", "Material 3".
  - Step 2 notice: "Overused look. The centered opening is a listed sign of AI-default design."
- Expected: one or two plain sentences on what I will see change and when to pick it.
- Fix: rewrite each intro as "What this changes" plus "Pick it when". Drop "a research helper read", "your own reference files", "your own checklist", and "listed sign of AI-default design" from the Studio's own screens (keep the sources in the fold "where this guidance comes from"). Replace "AI-default design" with "a look that many machine-made sites share". Move "Seen in:" into the fold.

### U2-04: The Step list and the Summary read back raw numbers instead of words
- Severity: major (the read-back is not understandable to a non-designer)
- Where: Step list (left column) and Summary "Every Step and its value"; all viewports
- Observed, quoted exactly: "Now: spacing 1.18", "Now: thickness of the letters 600, letter spacing -0.025em", "Now: text size 17px, heading size jump 1.32", "Now: tint color 85° (yellow), tint strength 0.01", "Now: color (hue) 88° (yellow), vividness 0.16, lightness 0.82", "Now: text contrast 0.86", "Now: corner rounding 20px". On Step 15 the "Your design now" card says "text contrast 0.9. These values come from Graphite Precision. They match none of the standard Options, so they have a card of their own."
- Expected: the nearest plain name, for example "Now: about Medium spacing", "Now: golden yellow, pale", "Now: between Medium and High contrast".
- Fix: describe each in-between value by the nearest named Option ("close to Medium"), and keep the numbers in a fold or in the project file.

### U2-05: The sliders have no accessible name
- Severity: major (functional bug for anyone using a screen reader or voice control)
- Where: any Step with "Adjust with sliders" (seen on Step 8 "Heading style": `#tune-headingWeight`, `#tune-headingTracking`); 1440x900
- Steps: open Step 8, open "Adjust with sliders", inspect the sliders with the accessibility tree.
- Observed: each slider is announced as `slider "600"` or `slider "-0.025"`. The visible words "Thickness of the letters" and "Letter spacing" are not tied to the slider: no `<label for>`, no `aria-label`, no `aria-labelledby`. The visible value "-0.038em" is jargon ("em").
- Expected: "Thickness of the letters, slider, 600, lighter to heavier".
- Fix: tie the visible heading to the input (`<label for="tune-headingWeight">`). Add `aria-valuetext` in words ("a little heavier than now"). Show "Letter spacing: slightly tight" instead of "-0.038em".

### U2-06: The sticky Pick button hides the last cards and their names
- Severity: major (a person does not know that more Options exist)
- Where: right column at 1440x900; Step 6 "Spacing", Step 13 "Amount of color", Step 22 "One special touch"
- Observed: the blue "Pick … and continue" bar sits over the card grid. On Step 6 the fifth card ("Very roomy") shows only as a sliver of its top edge. On Step 13 the names of cards 3 and 4 are cut ("Two colors: opposites" shows as "Two colors: opp…", "a third of the wheel apart" is half-hidden). On Step 22, cards 5 and 6 sit under the bar. When the Option name is long, the bar grows to two lines ("Pick “One color on buttons and highlights” and continue") and hides more.
- Expected: every card is visible, or the screen plainly shows that the list scrolls.
- Fix: put the action bar below the grid (not over it), or reserve its height at the bottom of the grid with padding and add a fade plus a "More Options below" hint. Shorten the button to "Pick this and continue" and show the Option name above it.

### U2-07: Undo changes an earlier Step but leaves me on the current one, with only "Undone."
- Severity: major (I cannot tell what changed)
- Where: header Undo; Steps view; 1440x900
- Steps: on Step 1 press "2" then Enter (this picks "Name centered, links below" and moves to Step 2). Press Undo.
- Observed: the page stays on Step 2 "How does the first screen open?". The message says only "Undone." Nothing points at Step 1. Also: after a reload, Undo is grayed out with no explanation (see U2-13).
- Expected: Undo shows me what it undid.
- Fix: say what was undone and where: "Undone: Step 1, Menu, back to “Links centered, button right”. Go to Step 1". Or take me to the Step it changed.

### U2-08: Some Options look the same, so I cannot choose by eye
- Severity: major (likely wrong or random choice)
- Where: Step 15 "Soft or crisp?" (Graphite Precision); Step 13 cards 1 and 2; Step 6 "Your design now" and "Tight"; 1440x900
- Observed: on Step 15 the four thumbnails ("Your design now", "Low contrast (soft)", "Medium contrast", "High contrast (crisp)") look the same at card size; only the colored dots differ slightly. On Step 13, "Color in small details only" and "One color on buttons and highlights" both show a blue button in the thumbnail. On Step 6, the large preview of "Tight" looks as roomy as the current design.
- Expected: neighbouring cards look clearly different, or the card says where to look.
- Fix: for small-difference Steps, crop the thumbnail to the area that changes (a paragraph of body text for contrast, a card stack for spacing), or show the difference as a strip ("text on background") instead of a whole-page miniature.

## Minor

### U2-09: The Studio calls the Direction's own default an "Overused look"
- Where: Step 2 "How does the first screen open?" (Graphite Precision and Sunlit Studio); Step 16; Step 21
- Observed: "Everything centered In use ✓ Overused look", followed by "The centered opening is a listed sign of AI-default design." So the Studio picked something for me and then warned me against it.
- Fix: do not start a Direction on an Option that is flagged, or explain: "This Direction starts here; many sites use it, so pair it with …".

### U2-10: The first screen asks about "Contrast checks" before I know what anything is
- Where: header, Directions view (first minute), 1440x900
- Observed: the header shows "Contrast checks / Warn me" and "Warn me: the Studio notes colors that are hard to tell apart, and changes nothing." next to "Nothing to save yet". This is the most prominent control besides the project name, and I do not yet know what I am designing.
- Fix: move the setting to the Summary or to a "Settings" fold, and reword it as "When colors are hard to read: Tell me / Fix them for me / Say nothing".

### U2-11: Each Step has about 19 extra Tab stops inside the large preview
- Where: large preview, every Step, keyboard
- Steps: Tab past "Jump past the preview to the cards".
- Observed: 19 Tab presses go through the sample website's own links before reaching the cards (and 19 more going backwards with Shift+Tab). The outer frame shows no focus ring (`outline: none` on the iframe); a ring shows only inside. Enter on a sample link does nothing.
- Fix: take the preview out of the Tab order (`tabindex="-1"` on the frame, or `inert` on its content). Keep the preview picture-only.

### U2-12: Escape on the "Start a new project?" dialog drops focus to the top of the page
- Where: Summary, "Start a new project…", keyboard
- Observed: after Escape, focus is on the page body, not on the "Start a new project…" button. The next Tab starts again at "Go to the main content".
- Fix: return focus to the button that opened the dialog, as the Directions dialog does.

### U2-13: Undo history disappears on reload without a word
- Where: header Undo
- Observed: after a reload the Undo button is grayed out. Nothing says that the history was lost.
- Fix: a tooltip or note: "Undo covers changes since this page opened."

### U2-14: Step names in the list do not match the Step headings
- Where: Step list and Step headings
- Observed: "16. Background at the top of the page" opens "What is in the air behind the first screen?"; "21. Headline color" opens "How is the big headline filled?"; "22. One special touch" opens "What is the one memorable move?"; "15. Text contrast" opens "Soft or crisp?"; "8. Heading style" opens "How do the headings speak?". The headings are poetic; I had to read the intro to learn what the Step is about.
- Fix: make each heading literal: "How much color or pattern sits behind the first screen?", "Is the big headline one color or a fade?", "Which one decoration makes the page memorable?", "How dark is the text against the background?", "How heavy and how tight are the headings?".

### U2-15: Options 10 and above have no number key
- Where: Step 7 "Letter style" (11 Options), Step 12 "Main color" (13 Options)
- Observed: cards 10 onwards have no number badge ("Letters with small feet throughout", "Neutral and unnoticed (Inter)", "Pink-red (magenta)" …). The instruction text varies: "Keys 1 to 9 do the same; the arrow keys reach every card" on Step 12, but most Steps only say "Keys 1 to N".
- Fix: say once, on every Step: "Arrow keys move between cards; keys 1 to 9 jump to a card; Enter picks it."

### U2-16: Step 23 tells me to hover
- Where: Step 23 "How much does the page move?"
- Observed: "Hover over the large preview to feel each Option." I use the keyboard (and a phone has no hover). A "Play the entrance again" button exists, but the text points at hovering first.
- Fix: "Press “Play the entrance again” to watch it. With a mouse, move the pointer over a button to see it react."

### U2-17: "Decide later" leaves no trace
- Where: Step list and Summary
- Observed: after "Decide later" on 10 Steps, the Summary shows them exactly like Steps I never opened: "Not decided yet. Now: …". I cannot find the ones I put aside.
- Fix: mark them "Put aside for later" and add "Go to the next Step I put aside" on the Summary.

### U2-18: "Why this choice?" promises instructions that the Summary says do not exist
- Where: Steps after a slider change ("Why this choice? (optional)"); Summary
- Observed: "Your reason goes into the instructions for the builder, so that the builder knows what matters to you." The Summary says: "What does not exist yet: the instructions for an AI coding tool". "Builder" is not explained anywhere.
- Fix: "Your reason is saved in the project file. A later version will pass it to the AI coding tool that builds the site."

### U2-19: At 200% zoom and on a phone, the Step list is at the very bottom
- Where: 720x450 and 375x800, Steps view
- Observed: no horizontal scrolling (good). But the list of 23 Steps comes after the preview, the cards, and a large empty gap, so jumping to another Step means scrolling the whole page. The sticky Pick bar also covers the title of the Option panel ("Menu (navigation)") while it scrolls past.
- Fix: put a compact "Step 1 of 23 ▾" menu at the top on narrow screens.

### U2-20: "Show me six more Directions" gives near-duplicates with list-like names
- Where: Directions view
- Observed: names such as "Pink-red (magenta) · Plain and sturdy · Darker boxes with a light top edge" and "Pink-red (magenta) · Engineered-looking headings · Darker boxes with a light top edge"; three of the six share "Darker boxes with a light top edge". After the click, focus stays on the button, which is now off screen.
- Fix: avoid repeating a main color or box style within one batch, and move focus to the first new card.

### U2-21: The import error uses a code word
- Where: Summary, "Open a project file" with a broken file
- Observed: "That file was not opened. The file does not match the project format. The problem is in its "template" part."
- Fix: "That file was not opened. It is not a Refraction project file, or it was changed by another program. Your open project is unchanged."

## Notes

- U2-22: Step 7 "Letter style": every card repeats "Heading and reading text", which adds noise and hides the Option names. Show it once above the grid.
- U2-23: On Step 1, "Previous Step" takes me to the Directions. Label it "Back to Directions" on Step 1.
- U2-24: The Directions thumbnails for "Ember Noir" and "Paper and Ink" show a colored bar across words of the headline. At card size it reads as crossed-out text, not as a highlighter. The large preview of the highlighter on Step 22 reads correctly.

---

## What worked well
- No horizontal scrolling at 720 px or 375 px. All Studio controls show a clear 3 px focus ring. Enter picks the card and moves on, and focus lands on the next Step's current card.
- Destructive actions ask first ("Keep my project" / "Start again", "Keep it" / "Yes, clear this project"), and cancelling an import keeps the project. The large preview scrolls to the part that changes (Step 22, "Large numbers beside the services").
- The Summary is honest about what exists today and lists what the Studio does not check.

## What I did not get to
- A screen reader, real touch input, tablet width, the "Fix for me" contrast mode, "Dress the Studio itself in this design's colors", and every thumbnail on every Step.
- Two tabs at once: I confirmed that a second tab opens the saved project, but I did not finish a test of conflicting edits in two tabs, so I make no claim about it.
- Browser Back and Forward move between Steps without losing Decisions (checked); I did not test Back across a Direction change.
