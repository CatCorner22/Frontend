# The third build trial (with the Floors): record

> **Read this first (2026-11-17).** Three things changed after this run: the names (the Prescription is now the "Vision"), a third window width (768 pixels), and the Fit check now reads the Floors in a numbered edition. The files in `files/` are the first draft of the Floors, which has no edition number, so today's program checks none of its Floor requirements and says so; the receipt's status is 1 for that reason. Today's figures are in `RECEIPT.md`. The text below is the record as it was written at each date; read its dated parts in order, and where an earlier part and a later part differ, the later part is today's state.

Date of the run: 2026-11-16. This is one run: one helper agent, one project, one page. It is a first measurement, not a rate. Nobody can say from it how often a tool obeys the Floors.

## Instruction

The helper received the text in `INSTRUCTION.md`, word for word, and a folder that held the seven files in `files/` and nothing else. The instruction is the one of trial 001. The project is the fixed project of `plugin/fit/e2e/trial-project.ts` with one change: Contrast checks is “Fix for me”, so that `PRESCRIPTION.md` carries every Floor, including the one for use by people with disabilities.

The `PRESCRIPTION.md` that the helper received is the first draft of the Floors: 48 requirements, written before the seventh review's repairs. Today's builder writes 56 requirements, and it words several of them differently (for example, requirement S5 then said “placed first among the `<meta>` tags”; today it says after `<meta charset>` and before every element that loads a resource). The folder `files/` holds the files as the helper received them [as of the run's date; the names in the stored files were changed later: see "The names changed on 2026-11-17" below]. The six other files are the same today, letter for letter; `PRESCRIPTION.md` differs from today's file only in section 7 [as of the run's date; one more line, in section 8, differs since the join of the lines of work: see "After the join of the three lines of work" below].

The helper was a general-purpose helper agent of this session. The builder did not read which model served its turn, and the record does not claim one.

## What the run shows

What the program measured on the helper's page (`RECEIPT.md` has the full receipt; the program's status was 0, no deviation) [as of the run's date; today's receipt has status 1, because today's program reads the Floors and checks none of this older edition: see "The program reads the Floors and a third width" and "After the repair run of 2026-11-21" below]:

- **Requests, colors, typefaces, corner radii, content, width: no deviation.** The page asks for nothing from another site; every color that a visible element draws is a color of the Prescription; every text uses a typeface that the Prescription names; every drawn box uses a radius of the Prescription; the business name, the headline, and the primary action are on the page; the page is not wider than its window at 375 and 1280 pixels.
- **Not shipped with the page (information, not deviations):** two font files and the form's address, `/appointment-request`, all at the page's own address.
- **Contrast: 18 text readings could not be taken** [as of the run's date; today 27 readings of 3 texts, since the program reads a third window width: see "The program reads the Floors and a third width" below] (three texts drawn partly transparent, each read at two widths and in three readings of each width), the same count as in trial 001. No reading below the usual least was found among the others.
- **No script**, written into the page or fetched.

What the builder read in the page, by searching its text. This is the builder's reading of a few points; it is not a program, and the Fit check measures no Floor [as of the run's date; since 2026-11-17 the Fit check reads the Floors of its own edition, and none of this Vision's older one: see below]:

- The `<html>` element has `lang="en"`; the page has one `<h1>`; it has one `<title>` of the business name and a few words that say what it is, and a `<meta name="description">`. Trial 001's page had the name alone as title and no description; the Mockup has neither a description nor such a title, so the helper wrote both itself; that agrees with the Floors for search, and the record does not claim that the Floors caused it.
- The page carries a Content-Security-Policy `<meta>` tag with `script-src 'none'`, `object-src 'none'`, `base-uri 'none'`, and `form-action 'self'`. The tag comes before `<meta charset>`; the then-wording of requirement S5 asked for “first among the `<meta>` tags”, and today's wording asks for the opposite order.
- The page has no `target="_blank"` link. Its one form uses `method="post"` and a same-site `action`. Its two `@font-face` rules use WOFF2 files at the page's own address and `font-display: swap`. It has no `tabindex`, no canonical link, and no script.

What the helper said about itself (its report, which is a claim and not a measurement; the builder did not check each point):

- It drew a placeholder `<div role="img">` with a text name in place of a photograph, because it had no image file.
- It did not ship the font files, because the instruction let it write one file.
- It made placeholder addresses for pages that the menu names and for the form (`/appointment-request`), and a `tel:` link with a number of the sample content.
- It used the sample content of the Mockup as the page's text.
- It did not render or measure the page, as the instruction told it.

## What the run does not show

- **That the page meets any Floor.** No program checks a Floor yet [as of the run's date; the program has since learned to check a part of the Floor requirements: see "The program reads the Floors and a third width" below]. The builder's reading above covers a dozen points of 48, and it can be wrong. Everything that a person must still check (the column “A person must still check” of each requirement) stands open.
- **Whether the Floors caused the differences from trial 001.** The two helpers are two runs; a second run of the same instruction could differ as much. The added title and description may be the helper's choice, not the Floors' effect.
- **How often a tool obeys.** One run; one helper; one project.
- **Whether the helper stayed in its rules.** The helper cannot be held to the rule “read no other file”: it ran in the same environment as this repository, and the harness does not limit what it can read. Its report lists the seven files only.
- **Today's Floors.** The helper read the first draft. A run with today's 56 requirements has not been made.
- **Whether the page looks right**, and whether the page works with the keyboard alone and with a screen reader. No person looked, and the program does not look.

## The names changed on 2026-11-17 (decision D75)

The owner renamed the app to "Frontend Focus" and the Prescription to the "Vision". The file `PRESCRIPTION.md` is now `VISION.md`. In the folder `files/` the same change of names was made in the stored files, and nothing else in them changed, so that the six other files still equal what the core writes today (`VISION.md` is the first draft of the Floors and differs from today's file, as the top of this record says). `INSTRUCTION.md`, the helper's page, and the text of this record above keep the old names, because they are what was written and built at the time. The receipt was measured again; no count changed.

## The program reads the Floors and a third width (2026-11-17, decision D76)

The program now reads the page at 768 pixels as well, and it checks a part of the Floor requirements that a Vision writes. The receipt was measured again. One thing changed: the new measure "Floors" shows one deviation, and the status is now 1. The line is "S5: the policy tag does not stand after the character set tag" [as of this part's date; the S5 line is gone since the gate review, and the status is 1 for another reason: see "After the gate review" below]. The helper followed the first draft of requirement S5, which asked for the policy tag "first among the `<meta>` tags"; today's S5 asks for it after the character set. So the deviation comes from the change of the requirement, not from a fault of the helper. Every other count is as before; the readings of a text whose contrast could not be read now count 27 (27 readings of 3 texts, as the receipt says today).

## After the gate review (2026-11-17, feature F038)

The receipt was measured again with the repaired program. The program now reads the Floors in a numbered edition. This trial's `VISION.md` is the first draft and states no edition, so the program checks none of its Floor requirements: the measure "Floors" shows 0 deviations and 1 thing not measured [as of this part's date; today the receipt says "Not checked: none of the 48 Floor requirements": see "After the repairs to the receipt's wording" below], and the status is 1 for that reason. The line about S5 of the note above no longer appears: the program does not hold a first-draft page to today's wording.

## After the join of the three lines of work (2026-11-17, decision D77)

The receipt was measured again with the joined program. It runs none of the page's scripts unless asked (this page has none). The Floors are now edition 3; this trial's `VISION.md` still states no edition, so the program still checks none of its Floor requirements, and the status stays 1. One more line of section 8 differs from today's file: the line on structured data (it said "The owner decides"; today it says that the data stays out, decision D70).

## After the repairs to the receipt's wording (2026-11-21, retest findings R-U02 to R-U04)

The receipt was measured again. This trial's Vision states no edition, so none of its Floors is checked; for that reason its contrast is now "measured, not required" (it said "required by Floor A1"), and "Still needs a person" says that the program checked none of the Floors.

## After the repair run of 2026-11-21 (record: `hinshitsu/AUDIT-LOG.md`)

The receipt was measured again by the program after each repair of the run. The status is 1 as before, for the same reason: the Vision writes its 48 Floor requirements in an edition that the program does not read, and the program checked none of them. The words for that changed: the receipt says "Not checked: none of the 48 Floor requirements that the Vision writes" where it said "0 deviations; 1 not measured", and the program's one line says "none of the 48 Floor requirements of the Vision was checked" where it said "1 thing could not be measured" (finding R-U03). `receipt.json` keeps the count 1 that the status rests on. The other wording changed as in trial 001.
