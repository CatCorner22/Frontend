# 01 · Perception and cognition

Part 1 of the knowledge base, generated 2026-11-13. The records behind this chapter are in `kb-perception-cognition.json` (70 entries); their ids appear here in `code style`.

This chapter explains how design choices change the mental effort of using a page. Each section gives the mechanism, the most useful design moves, the failure that follows when the mechanism is ignored, and the strength of the evidence. In the JSON file, the `effects` fields describe what happens when a product follows the principle. A number appears only where a source gives one; the Catalog sets every other threshold.

**Evidence grades.** A = a law or formal standard, here mostly WCAG 2.2 (the W3C's Web Content Accessibility Guidelines). A- = peer-reviewed research. B = large practitioner research (Nielsen Norman Group, Baymard, GOV.UK). C = a vendor or a single practitioner. D = folklore. The grade names the kind of evidence; the `verified` field records, per source, whether the source was re-read. Most A- evidence comes from laboratories or classrooms, so applying it to an interface is an inference each time.

## 1. Attention and visual search

**Mechanism.** Vision registers colour, size and motion across the whole view before attention arrives. One element that differs strongly on one such feature "pops out". Each additional emphasised element weakens the effect. Goals steer the eye more than loudness does: people look where they expect the answer, and they skip anything that looks like an advertisement (banner blindness).

**Moves.** Mark one primary action per view with a feature nothing else shares. Order content by the user's task first, then style it. Keep must-see content in the main column in ordinary styles. Give every clickable element a cue that static text never has.

**If ignored.** Several "primary" buttons compete and none wins. A critical notice in a promo-style strip goes unread.

**Evidence.** A- for `preattentive-popout`, `goals-beat-salience` and `banner-blindness`. B for `weak-signifiers` (one eye-tracking study, which records where people look).

## 2. Working memory and chunking

**Mechanism.** Working memory is the mental workspace for the next few seconds. It holds about four chunks; a chunk is a unit the person already knows as one thing. Recognising an item on screen is far easier than recalling it from memory.

**Moves.** Never make people carry a value from one screen to another. Keep the things they compare side by side. Show options, examples and recent items. Prefill anything already entered in the same process.

**If ignored.** People mistype codes, abandon multi-step flows, or re-enter data with errors.

**Evidence.** A- for `working-memory-four-chunks`. A for `dont-ask-twice` (WCAG 3.3.7). B for `recognition-over-recall`. The limit concerns what people must remember, not what a visible menu may show (`miller-seven-misreading`).

## 3. Cognitive load

**Mechanism.** Cognitive load theory splits mental effort into intrinsic load (what the task itself demands), extraneous load (what the presentation adds) and germane load (effort spent on understanding). Design can remove only the extraneous part.

**Moves.** Put each explanation next to the thing it explains: errors beside fields, labels on chart lines. Remove decoration and duplicated wording from task flows. Show structure with headings, numbered steps and a few highlighted terms.

**If ignored.** People hold one thing in mind while they hunt for its partner, and they make avoidable errors.

**Evidence.** A-, including meta-analyses (studies that pool many experiments). Integrated layouts beat separated ones by a medium margin across 58 comparisons (`split-attention`). Nearly all of this research concerns learning materials, and no script can measure load on a rendered page.

## 4. Grouping, spacing and alignment (Gestalt principles)

**Mechanism.** Before reading, the eye sorts a page into groups. Things that are close together (proximity), inside one boundary (common region), alike (similarity) or lined up (continuity) look as if they belong together. The eye also separates a figure in front from a ground behind, and it completes shapes that are cut off (closure).

**Moves.** Make the space inside a group smaller than the space between groups. Put each label nearer to its own field than to the next one. Add boxes only where spacing is ambiguous. Align to a few shared edges. Give the same function the same look. Dim the page behind a dialog.

**If ignored.** A label floats between two fields. Edges that almost align create groups that mean nothing.

**Evidence.** A- for the perception. The interface studies are old (text screens of the 1980s), and several moves are extrapolations.

## 5. Pointing and choosing

**Mechanism.** Fitts's law: pointing takes longer when the target is far or small. The steering law: moving along a path takes longer when the path is long and narrow. The Hick-Hyman law: choosing among well-learned options takes time that grows slowly, with the logarithm of their number.

**Moves.** Make frequent targets large and near. Make the whole row clickable. Avoid hover menus that demand a narrow pointer path. Sort and group long lists so that people can jump to an item, and keep positions stable. Recommend an option when choices are hard to compare.

**If ignored.** Mis-clicks, menus that snap shut, and long unsorted lists that must be read item by item.

**Evidence.** A-. Two limits matter. Hick-Hyman does not describe scanning an unfamiliar list and does not justify cutting options. A meta-analysis of 50 experiments found an average "choice overload" effect close to zero (`choice-overload`).

## 6. Response time and waiting

**Mechanism.** A response within about 0.1 second feels caused by the user's own action. About 1 second keeps the train of thought. Near 10 seconds, attention leaves. These are rounded expert estimates, not cliffs. A visible sign of progress makes a wait feel shorter.

**Moves.** Acknowledge every input within 100 ms. Show a busy state after 1 second, and show progress with a cancel control for long waits. Meet the Interaction to Next Paint target, Google's measure of delay between an input and the next screen update: 200 ms or less for three of every four visits. Never let a progress bar stall near the end.

**If ignored.** People click twice, doubt the system, or leave.

**Evidence.** B for `response-time-limits` and `inp-responsiveness` (a vendor metric). A- for `progress-indicators` and `latency-costs-gradual`.

## 7. Typography

**Mechanism.** Letters must exceed a critical size on the retina. The size that counts is the x-height (the height of a lowercase x), not the nominal font size. Letters and lines that sit too close interfere with one another (crowding). At each line end the eye must find the start of the next line.

**Moves.** Set body text at 16 CSS pixels or more (a CSS pixel is the web's unit of length, not a physical screen dot), in units that follow the reader's settings. Keep lines near 50 to 80 characters. Use a line height near 1.5 and layouts that survive a reader's spacing changes. Left-align text; do not justify it. Use sentence case beyond short labels. Make a light theme the reading default and a dark theme a choice. Use equal-width digits in tables.

**If ignored.** Small grey text, paragraphs as wide as the monitor, and clipped text when a reader enlarges spacing.

**Evidence.** A for spacing and resizing (WCAG 1.4.12, 1.4.4). A-, from small and partly conflicting studies, for `line-length`, `all-caps` and `light-vs-dark-polarity`. C for `tabular-numerals`. No typeface is best for everyone, and serifs make no meaningful difference (`no-single-best-font`).

## 8. Colour

**Mechanism.** Legibility comes from lightness difference. Hue names categories and states. About 8% of men of European descent cannot reliably separate red from green. A colour's appearance shifts with its background (simultaneous contrast).

**Moves.** Give text a contrast ratio of 4.5 to 1 (3 to 1 for large text), and control boundaries and focus rings 3 to 1. Never signal by colour alone. Build colour ramps on a perceptual lightness scale such as OKLCH, a notation whose lightness value tracks what the eye sees, then verify with the WCAG formula. Limit category colours to a handful. Give each colour one meaning.

**If ignored.** Low-contrast text, the most common detectable accessibility failure (found on 83.9% of the top million home pages in 2026). Red and green status dots that some users cannot tell apart.

**Evidence.** A for `text-contrast`, `non-text-contrast-and-focus` and `color-not-alone`. A- for the rest.

## 9. Density and white space

**Mechanism.** Search slows with clutter (too much variety of colour, size and line) and with crowding, not with quantity as such. Organisation predicts search time better than amount does.

**Moves.** Reduce variety before reducing content. Put key items in the least crowded region. Match density to the audience: sparse for first-time browsing, dense and stable for tools used all day. Keep text away from container edges.

**If ignored.** A wall of undifferentiated items, or a sparse tool that makes practised users scroll to compare.

**Evidence.** A-, from old studies; in one, nurses worked faster on dense, well-organised screens (`density-organised`). The claim that white space improves comprehension is C at best. White space as a sign of quality is a learned convention (`whitespace-quality-signal`).

## 10. Motion

**Mechanism.** Movement at the edge of vision captures attention involuntarily. A change that happens during a reload, or away from the point of gaze, often goes unseen (change blindness). Large moving areas make some people dizzy or sick.

**Moves.** Reserve motion for events that need attention. Show feedback where the user is looking. Use short transitions that start slowly, speed up and end slowly. Honour the operating system's reduce-motion setting, and never flash more than three times a second. Do not rotate carousels (panels that show one slide at a time) automatically.

**If ignored.** Readers are pulled away from text, miss silent updates, or feel ill.

**Evidence.** A for flashing, pause controls and `reduced-motion`. A- for `motion-captures-attention`, `change-blindness` and easing. C for exact durations. B for `auto-rotating-carousels`.

## 11. Forms and input

**Mechanism.** Every field costs reading, recall, typing and a chance of error.

**Moves.** Give every field a visible, persistent label; a placeholder (grey sample text inside an empty field) is not a label. Validate when the user leaves a field or submits, never during typing. State in text what is wrong and how to fix it, and keep the entered data. Ask only for what is needed. Declare each field's purpose so that browsers can fill it, and allow paste and password managers. Show a few options as radio buttons, not as a drop-down. Choose defaults in the user's interest.

**If ignored.** Abandoned forms, repeated errors and mistrust.

**Evidence.** A for labels, error handling, autofill and password rules (WCAG and the US standard NIST SP 800-63B). A- for `validation-timing`, `defaults` and `visible-options-over-dropdowns`. B for field count; C for one-column layout (`form-length-and-layout`).

## 12. Navigation and wayfinding

**Mechanism.** People follow information scent: a judgement, made from a label, of whether a link leads to their goal. Options that are hidden are not considered.

**Moves.** Label links with the users' own words. Prefer broad, shallow, grouped menus to deep ones. Keep the main navigation visible on wide screens. Put standard elements where other sites put them, and keep them consistent from page to page.

**If ignored.** Wrong turns, heavy reliance on search (which does not rescue weak menus), and sections that nobody finds.

**Evidence.** A- for `information-scent-and-labels`, `breadth-vs-depth` and `conventions-and-consistency`. B for `visible-navigation`.

## 13. Content design

**Mechanism.** People scan for words that match their goal and read selectively. Attention drops steeply down the page.

**Moves.** Put the main point in the first screen and in the first words of each heading. Write headings that state the point. Use short paragraphs, lists and plain words, and define each term once.

**If ignored.** Readers skim the starting edge of unstructured text (the F-pattern) and miss the content.

**Evidence.** B: practitioner eye tracking, with several figures recalled from memory. A, at the strictest level (AAA), for reading level.

## 14. Mobile ergonomics

**Mechanism.** A fingertip is large and hides its target. One-handed reach is limited. Small screens are often zoomed.

**Moves.** Make targets at least 24 by 24 CSS pixels, and about 44 for primary actions. Keep primary actions within thumb reach. Build layouts that reflow (rearrange into one column) at 320 pixels, and never block zoom. Give every hover, drag and gesture a single-tap alternative.

**If ignored.** Mis-taps, unreachable controls and sideways scrolling.

**Evidence.** A for `touch-target-size` and `reflow-zoom-input-alternatives`. C for `thumb-reach`.

## 15. Learning curve and expertise

**Mechanism.** Beginners search and read. Practised users act from memory of positions. Guidance that helps the first group slows the second (the expertise reversal effect).

**Moves.** Show common options first and reveal advanced ones on request. Let people start the real task and teach in context. Show shortcuts beside the commands they replace. Keep positions fixed; never reorder menus automatically.

**If ignored.** Forced tours, essentials buried under "Advanced", and experts slowed by a reshuffled layout.

**Evidence.** A- by type of evidence, but most sources in this topic are cited from memory (see the last section).

## Famous claims that are weaker than they sound

- **"Menus need 7 ± 2 items."** Miller's number concerned recall, and later work revised it to about four. A visible menu needs no recall.
- **"Users read only 20% of a page."** A rough upper-bound estimate from one small log study. People do scan; the number is not a law.
- **"Users read in an F-pattern."** Only when text lacks structure. It is a symptom to fix, not a layout to copy.
- **"The Doherty threshold is 400 ms."** The 1982 IBM report shows productivity rising as response time falls; the scanned report shows a curve, and readers of it report no cliff at 400 ms.
- **"Dyslexia fonts help."** Controlled studies found no gain. Wider letter spacing helps some readers.
- **"Dark mode reduces eye strain."** Reading is slightly better with dark text on a light background, and the eye-strain claim lacks evidence. A dark theme is a valid preference.
- **"Fewer choices always convert better."** The meta-analysis does not support it, and Hick's law does not say it.
- **"White space raises comprehension by 20%."** No verifiable source was found.
- **"Skeleton screens (grey placeholder layouts) feel faster."** One small, inconclusive study.
- **"Half of users leave after 3 seconds."** Unpublished vendor analytics. Delay costs users gradually.
- **"The golden ratio improves layouts."** This belongs to the aesthetics part of the knowledge base; no source was checked here.

## What this chapter could not verify

The session's web-search allowance ran out before content design, mobile ergonomics and expertise were re-checked. Research sources in those topics, and a few elsewhere, carry the label `from-memory-unverified` in the JSON file; three entries rest on such sources alone (`tabular-numerals`, `thumb-reach`, `progressive-disclosure-and-onboarding`). The sandbox could reach only GitHub, so standards and vendor documents (WCAG, NIST, MDN, GOV.UK, web.dev) were read from their publishers' source repositories, and no journal article was read in full: research findings rest on abstracts and search summaries. A passing automated check never proves that a page is usable; each entry states what a person must still judge.
