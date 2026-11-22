# The comparison run (trial 002): record

Date of the run: 2026-11-16. This is one run: one helper agent, the same project as trial 001, one page. With trial 001 it makes two measurements, not a rate.

## Instruction

The helper received the text in `INSTRUCTION.md` (the project in plain words, without the Prescription), word for word. It received no file. The folder `files/` holds the seven files of trial 001; the helper never saw them, and the program measured its page against their values so that the two pages meet the same measure. The helper ran for about 39 seconds and used 2 tool calls. It ran on the session's model at that time; the builder did not read which model served the turn.

## What the run shows

Deviations that the program counted on each page. Trial 001's helper had the seven files; trial 002's helper had the project in plain words.

| Measure | Trial 001 (with the files) | Trial 002 (plain words) |
|---|---|---|
| Requests | 0 | 0 |
| Colors | 0 | 20 |
| Typefaces | 0 | 2 |
| Corner radii | 0 | 12 |
| Contrast | 0 | 3 |
| Content | 0 | 0 |
| Width | 0 | 0 |
| Floors | 0 | 0 |

- **Colors: 20 deviations on the plain-words page (12 when this line was first written; the program has since learned to read more paints, and the table above holds today's count).** The helper chose its own dark green (`#1f4d3a`), its own tints and grays, and its own page color; none is a value of the Prescription. The Prescription's green is another green.
- **Typefaces: 2 deviations, which are a difference of name.** The helper wrote "Fraunces" and "Public Sans", as the owner's words name them. The Prescription's names are "Fraunces Variable" and "Public Sans Variable". The program compares names; it does not compare what the browser draws. Neither font was loaded on the page, so a viewer sees fallback fonts unless the fonts are installed.
- **Contrast: 3 readings of 1 text below the usual least (2 when this line was first written), and the cause is real.** The promise sentence ("No work starts until you have seen the price and said yes.") is dark gray on dark green, a ratio of 1.24 to 1. The builder read the page's style sheet to rule out a fault of the program: the rule `.about p { color: var(--muted) }` is more specific than the rule `.promise { color: #fff }`, so the gray wins. The helper did not render the page (the instruction forbade it), so it could not see this. The page of trial 001 shows no reading below the usual least.
- **Requests: 0 deviations on both pages.** The plain-words page loaded nothing from outside. When this table was first written, trial 001 showed 3 deviations in requests: the font files and a form address at the site's own address, which the measure then counted wrongly (finding R25-01). Under decision D67 the measure lists such references as information, so both receipts were measured again, and the table shows the repaired counts. The plain-words page names no place at its own address either.
- **Content and width: no deviation on either page. Corner radii: none on trial 001's page; on trial 002's page the 12 of the table, all from the rectangles of its drawn picture (see the notes at the end of this record); its boxes show no deviation.** Both helpers put the required texts on the page. Trial 002's helper took its 14-pixel corners from the plain words ("Clearly rounded (14 px)"); trial 001's helper took them from the files.

What the helper said about itself (a claim, not a measurement): it read no file; it did not load the two typefaces; it drew a placeholder in place of a photograph; it ran no check on the page. The builder verified that the page loads no font and holds no script.

## What the run does not show

- **Which page looks better.** The table does not say which page looks better. No person looked at either page, and the program does not look.
- **How often either approach lands where it did.** One run each; one project. The same helper might give another page tomorrow.
- **That the files cause the difference.** Trial 001's helper received `mockup.html` and `tokens.css`, which hold the exact values and the style sheet. A zero in trial 001 is partly the result of copying values that were handed over, and the run cannot separate that from judgment. A comparison with the Mockup removed from the folder was not made.
- **Whether the helpers stayed in their rules.** The helpers cannot be held to the rule "read no other file" (or "read no file"): they ran in the same environment as this repository. Trial 002's helper reported that it read none, yet its report names "CLAUDE.md hard rule 7" and "CLAUDE.md's other required files". The repository's `CLAUDE.md` seems to reach a helper without a file read, as part of the context that the harness gives it. The builder did not verify this. If it is so, both helpers knew the repository's rules, and the plain-words helper had more than its instruction.
- **A fair price.** The measure uses the Prescription's colors. A plain-words page cannot hit them, by construction; the colors row shows how far a plain request lands from them, not that the plain page is wrong for its owner.

## A later change to the program (2026-11-16, campaign A2, decision D71)

The program now serves the build at a stand-in address of the site and reads each width three times. The stored receipt was measured again with that program; no count of the table above changed, and the two contrast lines read as before, because a line that holds in every reading of a width still says "at 375 pixels".

Later the same day (the retest's variant findings A2-V1 to A2-V14): the receipt was measured again. No count and no line of the measures changed; "Still needs a person" gained two lines (dark mode, touch screens, and other window heights; closed shadow roots).

## Update of 2026-11-16 (decision D68, section 2.15)

The receipt was measured again after the seventh review's repairs of the program. The page holds no script, so the counts did not change. One label needs a word: the table counts "deviations" per measure, and for contrast the 2 are readings below the usual least, which the receipt does not count as deviations from the Prescription (it holds no Floors yet) and which never change the program's status. (Update of 2026-11-16, feature F032: the Prescription now holds the Floors, but no program checks them, so the readings still count as no deviation. The receipt's sentence now says "No program checks a Floor of the Prescription yet", and the stored receipts of the three trials changed in that one sentence only.)

## After the join of the two branches (2026-11-16, decision D73)

The stored receipt was measured again with the joined program. No count of the table above changed. The receipt now says that the page's scripts were run (the page holds none), and the contrast note says that no program checks a Floor yet.

## The names changed on 2026-11-17 (decision D75)

The owner renamed the app to "Frontend Focus" and the Prescription to the "Vision". The file `PRESCRIPTION.md` is now `VISION.md`. In the folder `files/` the same change of names was made in the stored files, and nothing else in them changed, so that they still equal what the core writes today. `INSTRUCTION.md`, the helper's page, and the text of this record above keep the old names, because they are what was written and built at the time. The receipt was measured again; no count changed.

## The program reads the Floors and a third width (2026-11-17, decision D76)

The program now reads the page at 768 pixels as well, and it checks a part of the Floor requirements that a Vision writes. The receipt was measured again. The contrast row shows 3 where it showed 2: the same pale text is now also read at 768 pixels. The row "Floors" is new and shows 0 for both pages, because the Vision of trials 001 and 002 was written before the Floors and writes none; the program checked nothing there. The count of contrast lines in the text above ("2 readings") is the count of that day.

## After the gate review (2026-11-17, feature F038)

The receipt was measured again. The colors row shows 18 where it showed 12: the plain-words page draws a placeholder picture as an inline SVG, and the program now compares the fill of SVG shapes too; six of its fills are not colors of the Vision. The text above ("12 deviations") is the count of that day. Nothing else in the table changed.

## After the join of the three lines of work (2026-11-17, decision D77)

The receipt was measured again with the joined program, which runs none of the page's scripts unless asked (this page has none). The colors row shows 20 where it showed 18: the program now also compares the color of an underline and of a caret (the mark that shows where typing lands), and this page draws one of each in a color that is not the Vision's.

## After the repairs to the receipt's wording (2026-11-21, retest findings R-U02 to R-U04)

The receipt was measured again. No count changed. Its wording changed: this Vision does not require contrast, so the three readings below the usual least are now called information ("3 below the usual least (information: not counted as deviations)"), not deviations. The table above keeps the number 3 in its Contrast row, as the receipt's data states it.

## The corners of drawn rectangles are compared (2026-11-21, the rest of finding G-S08)

The receipt was measured again. The Corner radii row of the table shows 3 where it showed 0: the program now compares the corners of rectangles that an inline picture draws, and this page draws 3 with corners of 8, 18 and 30 pixels, none of them a corner radius of its Vision. The receipt's line shows 25 deviations where it showed 22.

## After the repair run of 2026-11-21 (record: `hinshitsu/AUDIT-LOG.md`)

The receipt was measured again by the program after each repair of the run. One count changed: the Corner radii row shows 3 where it showed 0, and the receipt's line shows 25 deviations where it showed 22. The program now compares the corners of rectangles that an inline picture draws, and this page draws 3 with corners of 8, 18 and 30 pixels, none of them a corner radius of its Vision. The table above shows the new number in its Corner radii row. The wording changed as in trial 001; the contrast line now reads "3 readings of 1 text below the usual least (information: not counted as deviations)".

## Measured again on 2026-11-22 (the audit round of the repair run)

The receipt was measured again by the program. One count changed: the Corner radii row shows 12 where it showed 3, and the receipt's line shows 34 deviations where it showed 25. The cause is a repair of the program, not a change of the page: the program now compares the corner of a drawn rectangle as the screen shows it. The page's picture grows and shrinks with the window, so each of its 3 rounded rectangles has another corner at each of the 3 window widths, and some of the 12 values are no whole numbers (for example 11.45 pixels). Before the repair the program compared the corner in the picture's own units (8, 18 and 30), which no screen shows. The three sentences above that named older counts of colors, contrast and corner radii now name today's counts (finding F-151 of the run's log).

## The typeface for numerals and one sentence changed (2026-11-22, decision D83)

The stored files in `files/` were written again, because a test keeps them equal to what the core writes today. Two things changed in them, and nothing else: (1) the design value `--font-numeric` is the body typeface, a real list of typefaces, where it was the keyword `inherit` (the owner's decision D83); with it the fingerprint of the design values changed from `7776d35d` to `0fabf790` in all seven files; (2) `VISION.md` says "each carries the fingerprint stated above" where it said "below". The helper's page (`index.html`) is as the helper built it. The receipt was measured again: its fingerprint and the SHA-256 of the Vision files are new, and no count changed.
