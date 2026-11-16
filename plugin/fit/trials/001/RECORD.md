# The first build trial: record

Date of the run: 2026-11-16. This is one run: one helper agent, one project, one page. It is a first measurement, not a rate. Nobody can say from it how often a tool obeys the Prescription.

## Instruction

The helper received the text in `INSTRUCTION.md`, word for word, and a folder that held the seven files in `files/` and nothing else. The files are the output of the Studio's core for the fixed project of `plugin/fit/e2e/trial-project.ts`: the plain start, six Decisions (menu, first screen, density, typeface, accent color, corner radius; each differs from the start), one reason in the owner's words, and the sample content. Their fingerprint is `7776d35d`.

The helper was a general-purpose helper agent of this session. It ran on the session's model at that time; the builder did not read which model served the turn, and the record does not claim one. The helper ran for about 71 seconds and used 9 tool calls.

## Update of 2026-11-16 (decision D67): the receipt was measured again

When the run was first measured, the "requests" measure counted every reference to a place other than the page's own file, and it listed three deviations on this page: two font files at `/fonts/…`, which `FONTS.md` tells the builder to ship, and a form that posts to `/appointment-request`. That was a fault of the measure (finding R25-01). The owner deferred the choice to the builder, and the builder repaired the measure: a deviation is now a request or a reference to another site; a file at the site's own address is listed as "Not shipped with the page", as information. The stored page is the same, and the stored receipt is measured again with the repaired program: **no deviation in any of the six measured things.** The three references stand in the receipt as information. The paragraphs below are the record as first written; where they say "three deviations", read "three references at the site's own address, now information".

## What the run shows

What the program measured on the helper's page (`RECEIPT.md` has the full receipt):

- **Colors, typefaces, corner radii, content, width: no deviation.** Every color that a visible element draws is a color of the Prescription; every text uses a typeface that the Prescription names; every drawn box uses a radius of the Prescription; the business name, the headline, and the primary action are on the page; the page is not wider than its window at 375 or 1280 pixels.
- **Requests: three deviations.** Two are the font files at `/fonts/…`, and one is a form that posts to `/appointment-request`. See the first problem below: the first two are not the helper's fault.
- **Contrast: 6 text readings could not be taken** (a text drawn partly transparent), the same count as on the Mockup. No reading below the usual least was found among the others.
- **No script**, written into the page or fetched.

What the helper said about itself (its report, which is a claim and not a measurement), and what the builder checked:

- It did not ship font files, because the instruction let it write one file. *Checked: the page points at `/fonts/…` and holds no font data. True.*
- It dropped the `refraction-fingerprint` meta tag of the Mockup. *Checked: the page has no such tag; the fingerprint stands in one comment. True.*
- It loosened the Mockup's security policy to allow its own address for pictures, fonts, and the form. *Checked: the policy has `'self'` in `img-src`, `font-src`, and `form-action`. True.*
- It invented the address `/appointment-request` for the form. *Checked: the program lists it. True.*
- It did not render the page, as the instruction told it. It also named rules that it followed only in part (photograph, links, footer line); the program does not measure those, and a person must.

## What the run does not show

- **Whether the page looks right.** No person looked at it, and the program does not look.
- **How often a tool obeys.** One run; one helper; one project. The Prescription may have been easy or hard for this project in ways that the run cannot tell.
- **Whether the helper stayed in its rules.** The helper cannot be held to the rule "read no other file": it ran in the same environment as this repository, and the harness does not limit what it can read. Its report lists the seven files only; the builder did not read its tool calls. The record names the folder that it received and nothing more.
- **Whether the Prescription caused the result.** When this record was first written, no run without the Prescription had been made, so it could not say that the files made the page better than a plain instruction would have. Trial 002 is that run; see its record for what the two together do and do not show.
- **The craft rules.** The program does not check them on another page's style sheet.

## Two problems that the run found in the Fit check itself

1. **The "requests" measure flags what `FONTS.md` asks for.** `FONTS.md` tells the builder to ship each font file from the site's own address, at an address such as `/fonts/…`. The measure, as `SPEC.md` section 2.10 states it, counts every reference to a place other than the page's own file. The helper did what `FONTS.md` says, and the program lists two deviations. Either the measure must tell a file at the site's own address from a request to another site, or the Prescription must say something else. As first written, the builder had changed neither (the repair came later, under decision D67): a measure that changes after one sees a result needs the owner's word. Finding R25-01.
2. **The helper loosened the page's security policy**, and the program does not look at it. A policy that allows only the site's own address is the right policy for a page that ships its own fonts; the program neither approves nor refuses it.

## A later change to the program (2026-11-16, audit finding A1-03)

The first program skipped, without a word, every color that the browser reports in a newer form (`oklch()`, `lab()`, `color-mix()`, and others). The audit repaired it, and the stored receipt was measured again with the repaired program. One thing changed: the page draws one more partly transparent color, written with `color-mix()`, which the first program skipped and the repaired program reads. The note of the colors measure now says "2 partly transparent colors were not compared" where it said 1. No deviation count changed, so the table in `../002/RECORD.md` still holds.

## A later change to the program (2026-11-16, campaign A2, decision D71)

The program now serves the build at a stand-in address of the site and reads each width three times (with reduced motion; with motion allowed, after the animations have ended and two seconds later). The stored receipt was measured again with that program. No deviation count changed. Two things in the receipt changed: the page's two font files at `/fonts/…`, which it names, are now also listed as requests to the site's own address (stopped, information, not deviations), and the contrast measure's "not measured" count is 18 where it was 6, because each text is now read three times at each width.

Later the same day (the retest's variant findings A2-V1 to A2-V14): the receipt was measured again. No count and no line of the measures changed; "Still needs a person" gained two lines (dark mode, touch screens, and other window heights; closed shadow roots).

## Second update of 2026-11-16 (decision D68, section 2.15)

The receipt was measured again after the seventh review's repairs of the program (it now runs none of the page's scripts by default, and its window has no network). The page holds no script, so the counts did not change; the receipt now also says that the program did not run the page's scripts.

## The branches joined (2026-11-16, decision D72)

The two branches of this repository were joined (decision D72), and the stored receipt was measured again with the joined program. **No count changed from the main line's receipt**, in any measure. Against the audit branch's receipt, one count changed back: the contrast measure's "not measured" count is 6 again where the audit branch said 18, because the joined program counts a text that it cannot measure once for each window width, however many readings of that width found it (the note of the measure says "one for each text and window width", and the count now agrees with it). The wording changed in these places: the first lines name the readings at each width; the page's two font files at `/fonts/…` are listed once each, with all the ways the page names them ("css url, request"); the two partly transparent colors are listed as information, as `rgba()` values; two measure titles and four measure notes say what the joined program measures; the scripts line says that the program did not run the page's scripts; and "Still needs a person" holds six more lines (other widths, a page that recognizes the check, typefaces compared by name, dark mode and other window heights, closed shadow roots, and contrast against what lies under a text).
