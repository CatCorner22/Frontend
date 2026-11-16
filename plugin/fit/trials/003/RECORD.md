# The third build trial (with the Floors): record

Date of the run: 2026-11-16. This is one run: one helper agent, one project, one page. It is a first measurement, not a rate. Nobody can say from it how often a tool obeys the Floors.

## Instruction

The helper received the text in `INSTRUCTION.md`, word for word, and a folder that held the seven files in `files/` and nothing else. The instruction is the one of trial 001. The project is the fixed project of `plugin/fit/e2e/trial-project.ts` with one change: Contrast checks is “Fix for me”, so that `PRESCRIPTION.md` carries every Floor, including the one for use by people with disabilities.

The `PRESCRIPTION.md` that the helper received is the first draft of the Floors: 48 requirements, written before the seventh review's repairs. Today's builder writes 56 requirements, and it words several of them differently (for example, requirement S5 then said “placed first among the `<meta>` tags”; today it says after `<meta charset>` and before every element that loads a resource). The folder `files/` holds the files as the helper received them. The six other files are the same today, letter for letter; `PRESCRIPTION.md` differs from today's file only in section 7.

The helper was a general-purpose helper agent of this session. The builder did not read which model served its turn, and the record does not claim one.

## What the run shows

What the program measured on the helper's page (`RECEIPT.md` has the full receipt; the program's status was 0, no deviation):

- **Requests, colors, typefaces, corner radii, content, width: no deviation.** The page asks for nothing from another site; every color that a visible element draws is a color of the Prescription; every text uses a typeface that the Prescription names; every drawn box uses a radius of the Prescription; the business name, the headline, and the primary action are on the page; the page is not wider than its window at 375 and 1280 pixels.
- **Not shipped with the page (information, not deviations):** two font files and the form's address, `/appointment-request`, all at the page's own address.
- **Contrast: 6 text readings could not be taken** (a text drawn partly transparent), the same count as in trial 001. No reading below the usual least was found among the others.
- **No script**, written into the page or fetched.

What the builder read in the page, by searching its text. This is the builder's reading of a few points; it is not a program, and the Fit check measures no Floor:

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

- **That the page meets any Floor.** No program checks a Floor yet. The builder's reading above covers a dozen points of 48, and it can be wrong. Everything that a person must still check (the column “A person must still check” of each requirement) stands open.
- **Whether the Floors caused the differences from trial 001.** The two helpers are two runs; a second run of the same instruction could differ as much. The added title and description may be the helper's choice, not the Floors' effect.
- **How often a tool obeys.** One run; one helper; one project.
- **Whether the helper stayed in its rules.** The helper cannot be held to the rule “read no other file”: it ran in the same environment as this repository, and the harness does not limit what it can read. Its report lists the seven files only.
- **Today's Floors.** The helper read the first draft. A run with today's 56 requirements has not been made.
- **Whether the page looks right**, and whether the page works with the keyboard alone and with a screen reader. No person looked, and the program does not look.
