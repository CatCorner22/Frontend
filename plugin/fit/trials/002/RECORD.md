# The comparison run (trial 002): record

Date of the run: 2026-11-16. This is one run: one helper agent, the same project as trial 001, one page. With trial 001 it makes two measurements, not a rate.

## Instruction

The helper received the text in `INSTRUCTION.md` (the project in plain words, without the Prescription), word for word. It received no file. The folder `files/` holds the seven files of trial 001; the helper never saw them, and the program measured its page against their values so that the two pages meet the same measure. The helper ran for about 39 seconds and used 2 tool calls. It ran on the session's model at that time; the builder did not read which model served the turn.

## What the run shows

Deviations that the program counted on each page. Trial 001's helper had the seven files; trial 002's helper had the project in plain words.

| Measure | Trial 001 (with the files) | Trial 002 (plain words) |
|---|---|---|
| Requests | 0 | 0 |
| Colors | 0 | 12 |
| Typefaces | 0 | 2 |
| Corner radii | 0 | 0 |
| Contrast | 0 | 3 |
| Content | 0 | 0 |
| Width | 0 | 0 |
| Floors | 0 | 0 |

- **Colors: 12 deviations on the plain-words page.** The helper chose its own dark green (`#1f4d3a`), its own tints and grays, and its own page color; none is a value of the Prescription. The Prescription's green is another green.
- **Typefaces: 2 deviations, which are a difference of name.** The helper wrote "Fraunces" and "Public Sans", as the owner's words name them. The Prescription's names are "Fraunces Variable" and "Public Sans Variable". The program compares names; it does not compare what the browser draws. Neither font was loaded on the page, so a viewer sees fallback fonts unless the fonts are installed.
- **Contrast: 2 readings below the usual least, and the cause is real.** The promise sentence ("No work starts until you have seen the price and said yes.") is dark gray on dark green, a ratio of 1.24 to 1. The builder read the page's style sheet to rule out a fault of the program: the rule `.about p { color: var(--muted) }` is more specific than the rule `.promise { color: #fff }`, so the gray wins. The helper did not render the page (the instruction forbade it), so it could not see this. The page of trial 001 shows no reading below the usual least.
- **Requests: 0 deviations on both pages.** The plain-words page loaded nothing from outside. When this table was first written, trial 001 showed 3 deviations in requests: the font files and a form address at the site's own address, which the measure then counted wrongly (finding R25-01). Under decision D67 the measure lists such references as information, so both receipts were measured again, and the table shows the repaired counts. The plain-words page names no place at its own address either.
- **Content, corner radii, width: no deviation on either page.** Both helpers put the required texts on the page. Trial 002's helper took its 14-pixel corners from the plain words ("Clearly rounded (14 px)"); trial 001's helper took them from the files.

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
