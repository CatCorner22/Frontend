# Knowledge Base Index

Each source below links to its file in `docs/knowledge/sources/`. Entry format:
`- **[<Title>](sources/<slug>.md)** — <one-line summary>. Tags: <tags>. Ingested: <date>.`

How to read an entry: a source filed as a "search summary" means that only the search engine's summary of the listed pages was seen. Nobody read the pages themselves. The Catalog marks such a source as "seen only as a search snippet".

## Looks and styles

- **[Search summary: the American West look in graphic design](sources/american-west-graphic-style.md)** — Wood-type and slab-serif poster lettering, dense centered layouts, and a sun-faded palette of rust, tan, cream, black, and faded blue. Tags: look, american-west, lettering, palette. Ingested: 2026-11-13.
- **[Search summary: the futuristic screen look (film and game interfaces)](sources/futuristic-screen-look.md)** — Dark screens with one neon color, grids and technical read-outs, typewriter-style lettering, and glow; one source warns that the look must stay usable. Tags: look, futuristic, dark-page, palette. Ingested: 2026-11-13.
- **[Search summary: the gothic look on the web](sources/gothic-web-look.md)** — Near-black pages with deep red and purple, ornate or blackletter headings, and a warning that dark pages fail when the text blurs into the background. Tags: look, gothic, dark-page, palette. Ingested: 2026-11-13.

## Working method

- **[The owner's skill "verified-build-loop"](sources/verified-build-loop-skill.md)** — A build loop in five layers; only the hooks are enforced by Claude Code, and they block a turn that ends on a failing check or a changed protected file. Tags: method, checks, hooks. Ingested: 2026-11-15.

## Browser behavior and test methods

- **[Measurements: browser storage across a reload, with and without a script that reads storage at the start of the load](sources/browser-storage-across-reload-measurements.md)** — A plain write and a full storage both survive a reload (0 losses in 410 trials); a test script that reads storage at the first instant of a load sometimes sees an empty storage and then destroys earlier writes (11 losses in 52 trials). Tags: browser-storage, test-method, measurement. Ingested: 2026-11-13.

- **[Measurements: what one slider step costs on the Step "Main color", before and after three changes](sources/slider-step-cost-measurements.md)** — One slider step cost about 70 milliseconds of main-thread work; a memory of built documents, shared colors, and lower-priority pictures brought it to about 56; the rest is the two previews that must be redrawn. Tags: measurement, speed, test-method. Ingested: 2026-11-13.

- **[Measurements: how long each kind of action in the Studio takes until its result is drawn](sources/studio-action-delay-measurements.md)** — Every action is drawn within 24 to 72 milliseconds; a change of the preview width took 152 and now takes 48; memory stays level over a long session. Tags: measurement, speed, test-method. Ingested: 2026-11-14.

## Earlier chapters (written before this index; not in the source format)

Two chapters, each with a data file, came first. Research helpers (AI assistants given one research task each) wrote them on 2026-11-13; nobody has reviewed them. They summarize many sources at once, so they have no entry in the format above.

- **[01 · Perception and cognition](01-perception-and-cognition.md)**, with its records in `kb-perception-cognition.json`.
- **[02 · Aesthetics, satisfaction, and intuitiveness](02-aesthetics-satisfaction-intuitiveness.md)**, with its records in `kb-aesthetics-satisfaction.json`.

## Research of 2026-11-14 (four data files; not in the source format)

Four AI assistants wrote 76 records on 2026-11-14, one research task each (decision D52); nobody has reviewed them. Nearly every study was seen only as a search summary: the network blocked most research sites. The overview, with one table per file and the count of how each file's sources were seen, is **[03 · Research of 2026-11-14](03-research-of-2026-11-14.md)**.

- `kb-language-reading.json`: 20 records on reading (sentences, familiar words, headings, line length, letter size, error messages, reading speed). Tags: reading, language.
- `kb-mathematics.json`: 20 records on the arithmetic of design (size scales, spacing, balance, color arithmetic, the contrast formula, pointing and choice). Tags: mathematics, measurement.
- `kb-eye-and-beauty.json`: 20 records on where people look and what they prefer, and on what brain studies do not show. Tags: eye-tracking, preference.
- `kb-japanese-design.json`: 16 records on Japanese design (the ideas behind the minimal look, where the popular lists come from, the counter-evidence of dense Japanese web pages). Tags: look, japanese-design.

Ingested: 2026-11-14.
