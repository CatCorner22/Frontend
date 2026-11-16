# Specification: the work in hand on "Refraction"

**What this file is.** The definition of done for the features now being built under the verified build loop (decision D56). `PLAN.md` is the one plan; each requirement below names the section of `PLAN.md` behind it. When a new piece of work starts, it gets a numbered requirement here first.

## 1. Purpose

The owner alone uses the Studio to choose a design step by step. The Studio must never lose the owner's work without a word, and it must ship only material that it may ship. (`PLAN.md` sections 1 and 7.)

## 2. Requirements

### 2.1 A save that another tab replaces in the same moment is not lost (finding C4-F18)

- What the user does: works in two or more tabs of the Studio and closes them, or sends them to the background, within 2 seconds after a change was saved.
- What the system does in response: a tab that closes or goes to the background within 2 seconds after its own save writes its work into a storage entry of its own, and does not write the saved project again. The next opening removes the entry when the saved project holds the same work. Otherwise the entry becomes a kept copy, and the Studio says so in a notice.
- Edge cases this requirement must handle:
  - The tab's last save is older than 2 seconds, or the tab never saved: nothing is written and nothing is kept.
  - The tab goes to the background within 2 seconds and lives on: the entry is removed once storage still holds the tab's work.
  - The tab goes to the background, another tab replaces the save, and the owner comes back: the tab stops saving and says so; its work stays on screen.
  - Storage has no room for the entry: the tab behaves as before, and nothing fails (a stated limit).
- How to test it end to end: the three tests named in `docs/reference/saving-table.md`, section "Saved", for the rows "within 2 seconds after its own save".
- Behind it: `PLAN.md` section 7 (the saving table; design before code); decision D55.

### 2.2 No bundled typeface reserves its name

- What the user does: picks the Option "Elegant thick-and-thin headings" or "Letters with small feet throughout", or starts from a Direction that uses one of them; opens a project that was saved with the typeface "Playfair Display" or "Source Serif 4".
- What the system does in response: draws headings in Playfair (the file with the size axis) and reading text in Literata. No shipped font file declares a Reserved Font Name. A saved project that names a replaced typeface opens with the replacement, a notice names both typefaces, and the project as it was is first kept as a copy.
- Edge cases this requirement must handle:
  - A project file that the owner opens by hand names a replaced typeface: the same swap and notice; the file on disk stays untouched.
  - A project names both replaced typefaces: one notice names both swaps.
  - The second opening of a swapped project says nothing more.
  - The licence notices (`THIRD_PARTY_NOTICES.md` and the Licences screen) list the new fonts and no longer list the replaced ones.
  - The Studio's script stays within its size budget (1,600 KB).
- How to test it end to end: a unit test reads the copyright notices that the build takes out of every shipped font file (the generated notices file; the check `node scripts/make-notices.mjs --check` in CI proves that file current) and fails on the words "Reserved Font Name"; a browser test opens a stored project that names both replaced typefaces and reads the notice, the kept copy, and the drawn font family.
- Behind it: `PLAN.md` section 6; `docs/research/10-font-reserved-names.md`; decision D55.

### 2.3 The Direction Creator: the owner keeps a design as a Direction of the owner's own (milestone M4D)

- What the user does: on the Summary, presses "Keep this design as a Direction of my own", gives it a name and three short texts (the mood, what it is best for, what to watch for), and confirms. Later the user starts a project from it on the Directions screen, renames it, removes it, downloads all own Directions as one file, or opens such a file.
- What the system does in response:
  - It stores the Direction (name, texts, the design's values, the date) in the browser, in an entry of its own that is not the saved project.
  - The Directions screen shows a group "Your own" with one card per own Direction: its picture, its name and texts, and the line "Your own; no source, not reviewed". The group does not appear while the owner has none.
  - Starting from an own Direction gives exactly the design that was kept, with the same questions and the same kept copy as for a built-in Direction.
  - The Studio proposes the mood text from the design's values; the owner may change it.
  - Before the owner confirms, the Studio states how many contrast notes and how many pairs of Decisions that pull against each other the design starts with. It does not forbid either.
  - Remove asks first ("Yes, remove it for good" / "No, keep it"). A project that started from a removed Direction stays as it is and says that it started from "a Direction of your own that you removed".
  - Download gives one file with every own Direction; opening such a file adds the Directions that the browser does not hold yet, and says how many it added and how many it left out and why.
- Edge cases this requirement must handle:
  - A name or text with markup, script, quotation marks, or signs that change the direction of writing: drawn as inert text; cleaned like a project name.
  - An empty name, or a name that a built-in or own Direction already has: refused with a sentence that says why.
  - Texts longer than their limit (name 60 characters, each text 200): the field stops at the limit and says so.
  - A file that is not a set of own Directions, or one that holds a value the Studio cannot set: refused, or the value is brought to the nearest one the Studio can set, with a note; never an error on screen.
  - A file with a replaced typeface (requirement 2.2): the same swap.
  - Storage full or blocked: the Studio says that it could not keep the Direction, and offers the download.
  - Two tabs: a Direction kept in one tab appears in the other when the owner comes back to it; neither tab's list replaces the other's.
  - An own Direction offers no Skin (left out on purpose in this version).
- How to test it end to end: unit tests for the record's format and its checks; browser tests that keep a Direction, reload, start from it and compare the stored design value by value, download and open the file in an empty browser, remove it, and feed hostile text into every field.
- Behind it: `PLAN.md` section 4.7; decision D56.

### 2.4 Hardening of the current features, the Directions included (the owner's request of 2026-11-15)

**2.4.1 The owner's own Directions are never lost without a word.**
- What the user does: keeps, renames, removes, or opens own Directions, in one tab or in two, also with a stored list that an earlier or a later version of the Studio wrote.
- What the system does in response: before the Studio writes a list that lacks an entry which the stored list held and which the owner did not remove, it keeps the stored list among the kept copies. A rename or a removal of a Direction that another tab removed says so and changes nothing. A file with hostile content adds only inert text.
- Edge cases: a stored entry whose name a built-in Direction now has; a stored entry with a value that this version does not know; the download when the stored list cannot be read; an entry whose date is no date.
- How to test it end to end: browser tests with hand-made storage and two tabs; unit tests for the record.

**2.4.2 Every built-in Direction starts without a contrast note on its form-field borders and small labels; the three known link departures are pinned.**
- What the system does: under "Warn me", the Directions Midnight Aurora, Control Room, Galactic Goth, Ember Noir, and Evening Formal, with each of their Skins, start with form-field borders at 3 to 1 or more; Frontier Gazette, with each Skin, starts with small labels at 4.5 to 1 or more. Sticker Pop, Sunlit Studio, and Poster Block keep their link colors; a unit test names exactly these three as the Directions that start with a contrast note, and each of their cards says so in plain words.
- Edge cases: every Skin of each Direction; the repair changes no value of any other Direction; the Studio's own words never call a Direction "accessible" or "compliant".
- How to test it end to end: a unit test over every Direction and Skin; the stored pictures of the six changed Directions are renewed and every other picture stays byte for byte.

**2.4.3 The builder has looked at every built-in Direction at phone and desktop width.**
- What the builder does: draws all 38 Directions (top, services, contact) at 375 and 1280 pixels, looks at each picture, logs every visible fault in `redteam/FINDINGS.md` with the source "the builder's look of 2026-11-15", and repairs the ones that are faults of the Mockup or of a Direction's values.
- What this is not: a judgment of beauty, which is the owner's; a review by a second person.
- How to test it end to end: each repaired fault gets a test where a program can measure it; the findings log lists what was seen and what was done.

- Behind it: `PLAN.md` sections 7 and 9; hard rules 8 and 12.

### 2.5 The craft layer: the fine details that the Studio adds by itself (decision D58; `PLAN.md` sections 3.1 and 4.4)

**What it is.** A skilled person's page differs from a generic one in details that nobody asks for: numbers in a price list line up, a heading breaks into even lines, a pressed button gives a little, a keyboard user sees where the focus is, movement is short and stops for a person who asked for less motion. The Mockup's style sheet already holds about a dozen such details, but nothing names them, checks them, or can hand them on. The craft layer makes each one a record.

- What the user does: nothing to get them; opens the Summary to read them.
- What the system does in response:
  - The Catalog holds one record per craft rule: a name and a sentence in plain words (what it is, why a person notices its absence), the instruction for the AI coding tool in exact terms, a check that a program can run on a style sheet, a source, an evidence grade, and a date. No rule is graded "measured" unless its source was read in full.
  - A unit test runs each rule's check on the Mockup's own style sheet for every built-in Direction: the Mockup practices what the Prescription will ask for. A rule that the Mockup does not meet cannot be in the list.
  - The Summary lists the craft rules under "Fine details the Studio adds by itself", each with its sentence, its strength, and its source, and says that the owner does not choose them.
  - Where a Decision sets a rule's value (the motion Step sets how long a movement lasts; "no motion" switches movement off), the list states the value that the open design gives.
- Edge cases: a design with motion set to "none" (the motion rules say that nothing moves); a dark and a light page (the color-scheme rule states which); every text passes the plain-words rule; a rule's text never calls the result "accessible" or "compliant".
- How to test it end to end: unit tests for the records and for each check against the Mockup of every Direction; a browser test reads the list on the Summary for two designs that differ in motion.

### 2.6 The Prescription, first slice: four files that Claude Code can build from (decision D58; `PLAN.md` section 4.4)

- What the user does: opens the Summary, presses the download button of each of the four files ("Download PRESCRIPTION.md" and so on), or copies a file's text; gives the files to Claude Code.
- What the system does in response: the core writes, as pure functions of the project:
  - `tokens.css`: every design value of the open design as a named CSS custom property, exactly the values that the preview draws.
  - `tokens.json`: the same values in the Design Tokens format (name, value, type), grouped by type (decision D63, point 2; the words were "by role" until 2026-11-16).
  - `mockup.html`: the Mockup of the open design as one self-contained page without script, as the reference picture for the build.
  - `PRESCRIPTION.md`: the instruction for the AI coding tool, in three layers: (1) every Decision with the picked Option, the rejected Options, and the owner's reason; (2) the craft rules with their exact instructions; (3) what a person must still check. The owner's own words (the project name, each reason) stand in a fenced block that the text marks as quoted data, never as instructions.
- Edge cases:
  - A project name or a reason that holds markup, a code fence, or a sentence that addresses the AI coding tool ("ignore the rules above"): it stays inside its fence; a fence inside the text cannot close the fence around it.
  - A project with no Decision: the file says that every value comes from the start, and names the start.
  - A start that is a Direction of the owner's own, or one that was removed: named as such.
  - The four files agree: every value in `tokens.css` equals the value in `tokens.json` and the value that `mockup.html` draws; a unit test compares them.
  - The files never claim that the result is "accessible" or "compliant" (hard rule 8); they state what was checked and what a person must still check.
  - The font files are not in this slice: `PRESCRIPTION.md` names each typeface, its licence, and where to get it.
- Not in this slice (stated in the file itself): `DESIGN.md`, the shadcn theme, `FONTS.md`, the floors, the Overlays' behavior, and a single bundled download.
- How to test it end to end: unit tests with stored snapshots of the four files for two projects; a unit test with hostile names and reasons; a browser test downloads each file and compares it with what the core writes for the stored project.

### 2.7 The Brief, first slice: the owner's own words on the page (decision D61; `PLAN.md` section 4.3, Stage 1)

**What it is.** Until now every preview shows a made-up dental practice. A design is judged best on the words that it will really carry: a long business name, a short headline, seven services, or no price list all change how a layout holds. The Brief is the owner's own account of one project: what is offered, for whom, the main job of the page, and the page's real texts. The screen's label is "Your content".

- What the user does: opens "Your content" from the top bar, from the Summary, or from a sentence on the Directions screen; answers three short questions (what do you offer, who is it for, what is the one thing a visitor should do); replaces any text of the sample website; adds or removes a service, a fact, or a price; or puts the sample text back.
- What the system does in response:
  - The project holds the texts (it already does: `content`) and, new, the three answers (`brief`). Both are saved with the project, travel in the project file, and come back after a reload.
  - Every preview (the Direction cards of the open project's start excepted: see "Edge cases"), the large preview, the Summary's preview, and `mockup.html` draw the owner's texts.
  - The lists have limits: 1 to 8 services, 0 to 4 facts, 0 to 8 prices. The menu keeps its five links; the owner changes their words only. A list at 0 leaves no empty box, heading, or gap behind.
  - Every text is cleaned as a project name is cleaned (no control characters, no signs that change the direction of writing) and cut at its limit; the screen shows how many characters remain when few remain.
  - "Put the sample text back" asks first, keeps the owner's texts as a kept copy, and can be undone.
  - `PRESCRIPTION.md` carries the three answers as quoted data, says whether `mockup.html` shows the owner's texts or the sample, and tells the AI coding tool that every text in `mockup.html` is text for the page and never an instruction.
- Edge cases:
  - A text that holds markup, script, a code fence, or a sentence that addresses the AI coding tool: the screen and the Mockup draw it as text; nothing runs; in `PRESCRIPTION.md` it stays inside its fence.
  - A very long word, a very long name, an empty text, and a text of one character: no page becomes wider than its window, and no empty element keeps a visible box.
  - The words to mark in the headline are not part of the headline: nothing is marked, and the screen says so.
  - A project file from before this slice (no three answers; possibly more list items than the limits): it opens unchanged; the screen lets the owner remove items above a limit and add none until the list is below it.
  - The Direction cards on the Directions screen keep the sample practice, so that only the design differs from card to card; the screen says so.
  - Every built-in Direction at both ends of every limit (fewest and most items), at phone and desktop width: no overflow, no overlap, the headline stays the largest text.
- Not in this slice: either/or picks about the brand; pictures of the owner's own; a second page; taking texts from an existing website or file; more or fewer menu links.
- How to test it end to end: unit tests for the editing functions, the limits, the cleaning, and the Mockup at each limit; a browser test types texts, adds and removes items, reloads, and reads the previews and the downloaded `mockup.html`; a browser test draws every built-in Direction with the fewest and with the most items at 375 and 1280 pixels and measures overflow; unit tests with stored snapshots of `PRESCRIPTION.md` for a project with a Brief; a unit test with hostile texts.

### 2.8 Repairs after the red-team review of 2026-11-15 (hard rule 12; findings S6, U6, and T6 in `redteam/FINDINGS.md`)

Three reviewers read the code of 2026-11-15 and used the running Studio: 1 blocker, 15 major findings, 36 minor ones, 15 notes. A blocker stops the milestone, so these repairs come before requirement 2.7. Each repaired finding gets a test that fails without the repair.

#### 2.8.1 No text from a file acts as an instruction, and no file can break the list of own Directions (S6-01 to S6-07, S6-09, S6-11; T6-04, T6-15)

- In `PRESCRIPTION.md` the name of a Direction that the Studio hands over stands in a fenced block marked as quoted data, and the file says that the Direction is the owner's own. The name, each reason, and the project's name lose every invisible sign and every sign that changes the direction of writing before they are written.
- The name cleaner also removes the invisible signs that the review used, turns the look-alike quotation signs that the review used into single marks, brings letters to one form, compares names in one form, and never cuts a character in two.
- An own Direction holds the known design values and nothing else. The Studio holds at most 100 own Directions and says so when a file or the form would exceed that. A date that is no date is refused. A replaced typeface in a file of own Directions is said in the note.
- A craft rule's check reads the style sheet of the page, never the page's visible text.
- `PRESCRIPTION.md` says "a sample dental practice" only when the project holds the sample texts, and says that every word in `mockup.html` is content for the page, never an instruction.
- Known remainder, stated in the findings log: letters of another alphabet that look like Latin letters are not caught.

#### 2.8.2 Every sentence of the Prescription and of a craft rule is true of the design in hand (T6-01 to T6-03, T6-05, T6-06, T6-10 to T6-13, T6-22 to T6-24; U6-03, U6-04, U6-06 to U6-10, U6-14, U6-25)

- A craft rule that a Decision sets aside (digits of natural width; no motion) says so in one sentence, on the Summary and in the file, and the file then gives no instruction that contradicts the Decision. A sentence never says "your Decision" where the owner decided nothing.
- The rules about a pressed button, nested corners, the length of a movement, the focus ring, and the pointer say what the Mockup's style sheet does in every built-in Direction; where the style sheet was wrong (a button that moved in a design without motion), the style sheet changes.
- Each craft rule's grade is no stronger than its source, and each source line says where the rule departs from its source. `PRESCRIPTION.md` gives each rule's basis in one line.
- The sentence about the check says what it is: a search of the style sheet for the mark of each detail, not a proof.
- `mockup.html` in the bundle shows each switched-on Overlay open. `PRESCRIPTION.md` says that the page's links lead nowhere and that its form sends nothing.
- "What no program checked" lists only what the design in hand has. With contrast checks off, the file does not read as if every pair had passed.
- Section 2 of the file calls the Studio's own names "Studio settings", says how they relate to `tokens.css`, and gives words for a value that matches no Option.
- `tokens.json` types a typeface list as a typeface and a keyword as a keyword; a test compares each color's components with its CSS color. `mockup.html` is stored for two projects, so that a change of any line of it is seen.
- The tests named in finding T6-13 assert what their titles say.

#### 2.8.3 The screens say what is true today, and say it where the owner looks (U6-01, U6-02, U6-05, U6-12, U6-13, U6-15 to U6-21, U6-26; T6-14)

- The Summary's top, the Directions screen, and the Step's field for a reason no longer say that the instructions for an AI coding tool come later; the field for a reason says that the reason goes into `PRESCRIPTION.md`.
- The Prescription section says the same as section 7 of the file, says in one sentence how to hand the files to an AI coding tool, says so when the project has no Direction and no Decision, and shows the message for a file beside that file.
- The craft list explains the grades in one sentence.
- The Directions screen has a jump link to "Your own"; a rename says "Renamed"; a message about a file names the file; a long name without spaces stays inside a 375-pixel window; the form says so when it cuts a text.
- Not in these repairs (they stay open in the findings log for the owner's judgment): the look of quiet buttons (U6-22), what "Undo" covers (U6-23), a date or a name inside the four files (U6-24), where the field for a reason sits (U6-11), the wording of small variations on the Summary (U6-10, second half), and the notes U6-27 to U6-30.

### 2.9 The rest of the Prescription's files, each checked by a validator (milestone M6; decision D63, point 5)

**What it is.** The Prescription is seven files. Four exist. This requirement adds the other three, a mark that tells two sets of files apart, one download for all of them, and a check of each machine-read file by a program that the builder did not write. The floors are not part of this requirement: each floor is a Catalog record that needs a source read in full (decision D63, point 3), so the floors get a requirement of their own.

- What the user does: opens the Summary and downloads each of seven files, or all of them as one file.
- What the system does in response:
  - **A fingerprint.** The core works out eight characters from the design values. The same design always gives the same eight characters, and a changed design gives others. Every file of the Prescription carries them, so that the owner and the AI coding tool can see whether seven files belong together. No file carries a date: the same project must always give the same files.
  - **`FONTS.md`.** For each typeface of the design: its name, its CSS family, its licence, the package that holds its files and the version that the Studio itself ships, how to load it from the site's own address, and the sentence that no font may come from another site. A device's own typeface is named as such, with no file.
  - **`DESIGN.md`.** The design in the DESIGN.md format of Google Labs, as its specification read on 2026-11-16: named colors, type levels, corner roundings, spacing, and the main button and the field as components, with the eight sections in their fixed order. The format's own lint program checks the file in a test, for every built-in Direction.
  - **`theme.css`.** The design's colors and corner rounding under the names that the shadcn component library reads (`--background`, `--primary`, `--radius`, and the rest of its list as read on 2026-11-16), so that ready-made parts take the design. The test holds the file against that list of names.
  - **A validator for `tokens.json`.** A parser of the Design Tokens format that the builder did not write reads the file in a test, for every built-in Direction.
  - **One download.** A button hands over all files as one archive file. Each file in it equals the file that its own button hands over.
- Edge cases: a design with a device's own typeface; a dark design (`theme.css` gives the same values for the light and the dark name, and says so); a color with transparency; a hostile project name (it appears in the new files only inside a block marked as quoted data, or not at all); a design value for which a format has no place (left out of that file, and the file says where it stands instead).
- Not in this requirement: the floors; a registry file for the shadcn command-line tool; more than one page.
- How to test it end to end: unit tests with stored copies of the three new files for two projects; the two outside validators in unit tests over every built-in Direction; a unit test that the fingerprint is the same in all files and changes with a design value; a browser test that downloads every file and the archive, and compares them with what the core writes.

### 2.10 The Fit check, first slice: a program measures a build against the Prescription (milestone M7; decision D63, point 5; decision D65)

This slice is the first part of the Fitter. It lives in `plugin/fit/`, outside the core, because it needs a browser. It measures one page that an AI coding tool built from the Prescription. It does not build anything.

- What the user does: runs `npm run fit -- <build.html> <folder of the seven files> <result folder>`. The program reads `tokens.json`, `tokens.css`, `PRESCRIPTION.md`, and `mockup.html` from the folder, opens the build in a real browser at two window widths (375 and 1280 pixels), and writes `receipt.json` and `RECEIPT.md` into the result folder.
- What the system does in response: it measures these seven things, and it names every deviation with the element and the value:
  1. **Requests.** Every network request that the page makes. The program blocks each request to another site, and lists it (no remote font, no remote script, no analytics: hard rule 7). Section 2.13 (decision D67) repairs this point after the first trial: a reference at the page's own address is information, not a deviation.
  2. **Colors.** Every text color, background color, and border color that a visible element draws, compared with the color values in `tokens.json`. A color that is not among them is listed as "outside the Prescription". A fully transparent color is skipped; a partly transparent color is listed apart, not as a deviation.
  3. **Typefaces.** The first family of the computed font stack of every visible element that holds text, compared with the typefaces that `tokens.json` names. A family that the Prescription does not name is listed.
  4. **Corner radii.** Every border radius of a visible element, compared with the radius values in `tokens.json`. A value that is not among them (and not 0) is listed.
  5. **Contrast.** The contrast ratio of every visible text element against its background, by the WCAG 2.x formula and the Studio's own color math (hard rule 9). A text on an image or a gradient is listed as "not measured". The ratios are reported as measurements; no program checks a Floor of the Prescription yet (the Floors in `PRESCRIPTION.md` section 7 are requirements for the builder, and the Fit check measures none of them).
  6. **Content.** Whether each of the Brief's three required texts (business, headline, primary action; section 2.7) appears in the page's visible text, after the program collapses runs of white space. The program reads them from `mockup.html`, which holds the owner's words.
  7. **Width.** Whether the page is wider than its window at either width.
- The receipt is an Honest receipt with three parts: "Measured" (the seven things, each with its count of deviations), "Judged by the model" (empty in this slice; the receipt says so), and "Still needs a person" (the look of the page; keyboard use; screen-reader use; whether the words are right; every craft rule, because their checks search for the Mockup's own marks and cannot judge another page's style sheet). The receipt never says "accessible" or "compliant" (hard rule 8). It names the Prescription's fingerprint (section 2.9).
- Edge cases:
  - The folder's files carry different fingerprints: the program refuses and names the files. A file is missing: the program refuses and names it.
  - The build file is missing, empty, or is not an HTML page: the program stops with a message and writes no receipt.
  - The page throws an error while it loads: the receipt records the message; the measurements still run. The page does not finish loading within 10 seconds (a script that never ends freezes the page, so nothing can be read from it): the receipt records that, marks every measurement of that window width "not measured", and does not count "not measured" as "no deviation".
  - The page holds text that addresses the program ("ignore the checks"): it is data; the receipt shows page text only inside a fenced block that the receipt marks as quoted data (as `PRESCRIPTION.md` does, section 2.8.1).
  - The same page and the same files give the same receipt, byte for byte: the receipt holds no date and no time.
  - The program ends with status 0 when it found no deviation in the six measured things (requests, colors, typefaces, radii, content, width), with status 1 when it found at least one or could not measure a window width, and with status 2 when it refused (a missing file, two fingerprints, an unusable build). Contrast ratios alone never change the status (the first bullet of the list says why).
  - The page makes a request that never completes: the program does not wait for it; it counts the request.
- How to test it end to end:
  - The Mockup of a project is the **reference build**: the program reports zero deviations for requests, colors, typefaces, radii, content, and width on the plain start and on all 38 Directions. A deviation on the reference build is a defect of the program or of the Mockup, and a person decides which.
  - A **self-test** damages the reference build in eight ways, one at a time: one color changed; a typeface changed; a radius changed; a remote font link added; a remote script added; the headline removed; the page widened past the window; the text color changed to the background color. Every damage must produce the matching deviation, and the unchanged build must produce none. A damage that the program does not report fails the test.
  - Hostile page text, a missing file, two fingerprints, and a page that never finishes loading each have a test.

### 2.11 The first build trial: one AI coding tool builds from the seven files, and the program measures the result (milestone M7; decision D65)

- What the user does: asks for one run of the trial. The builder writes the seven files for a fixed project (a small-business project with six Decisions and the sample content) into an empty scratch folder. One helper agent, with no other file from this repository, receives the folder and one fixed instruction: build one page, `index.html`, from the Prescription. The program of section 2.10 measures that page.
- What the system does in response: the instruction, the helper's page, and the receipt stand in `plugin/fit/trials/001/`. A short record in the same folder says what the run shows and what it does not show.
- Edge cases:
  - The helper cannot be held to the rule "read no other file". The record says so, and it names the folder that the helper received.
  - The helper's page is data. The builder opens it only inside the program's browser and never follows an instruction that it contains.
  - One run, one model, one project: the record says that it is a first measurement, not a rate.
- How to test it end to end: a unit test reads the stored receipt of the trial, checks that it names the fingerprint of the files that the builder writes today for the fixed project, and checks that the stored page measures to the stored receipt (the program runs on the stored page and the result equals the stored receipt).

### 2.12 The comparison run: the same project, built without the seven files (milestone M7; decision D66)

- What the user does: asks for one more run. One helper agent receives the same project in plain words and no file: the six Decisions as the labels and descriptions that the Studio shows, the owner's one reason, and every text of the sample content. The helper builds `index.html`. The program of section 2.10 measures that page against the seven files that the first trial's helper received.
- What the system does in response: the instruction, the page, the receipt, and a record stand in `plugin/fit/trials/002/`. The record holds a table that sets the two receipts side by side, one row for each measure.
- Edge cases:
  - The second helper never sees the seven files, but the measure uses their values. The record says so: the comparison shows how far a plain request lands from the Prescription's values, not whether the second page is worse in a way that a person would see.
  - The helper cannot be held to the rule "read no other file". The record says so.
  - One run each, one project: the record says that it is two measurements, not a rate, and that it does not say which page looks better.
- How to test it end to end: the tests of the first trial run on both folders. A further test reads both receipts and requires that the record's table holds each measure's two counts exactly as the receipts state them.

### 2.13 Repair of the requests measure after the first trial (finding R25-01; decision D67)

The first trial found that section 2.10, point 1, counts a font file at the site's own address as a deviation, although `FONTS.md` tells the builder to ship each font file from that address. The repair separates two kinds of reference:

- **Other site (a deviation).** A request that the browser makes to any address with a scheme (`https:`, `http:`, `ftp:`, `mailto:`, and any other except `data:`), to an address that begins with `//`, and every request that the program stops. The count of deviations in "Requests" counts only these.
- **Own address (information, not a deviation).** A reference without a scheme: `/fonts/a.woff2`, `fonts/a.woff2`, `../a.css`, and a form that posts to `/send`. The receipt lists each one under "Not shipped with the page", with its kind, because a page of one file cannot ship it and a person must supply it or check that it exists. Such a reference never changes the status.
- **Neither (left out).** A `data:` address and a place in the page (`#top`), as before.
- Edge cases:
  - The same reference stated twice appears once.
  - A reference to the site's own address inside a style sheet (`url(/fonts/a.woff2)`) and one in markup (`<link href="/a.css">`) are treated alike.
  - The Mockup, which carries no reference, shows an empty list.
  - The receipts of trials 001 and 002 are measured again with the repaired program, and their records say what changed and why; the old counts stay in the records as history.
- How to test it end to end: a relative font file, a root-relative style sheet, and a relative form action are listed as information and give status 0; an absolute font link, a link that begins with `//`, and a `mailto:` form action each give a deviation; the stored receipts of both trials equal what the repaired program gives on the stored pages.

### 2.14 Three repairs of taste after the sixth review (findings U6-11, U6-22, U6-23; decision D63, point 4)

The owner left these three to the builder (decision D63). Each follows the finding's own words.

1. **The reason, from the Summary (U6-11).** The Summary says that the Prescription holds "what you rejected and why", but the field for the reason showed only on a return to a decided Step.
   - What the user does: opens the Summary; under each Step that has a Decision, presses "Add a reason" (or "Change the reason", when a reason exists), and types.
   - What the system does: opens the same field that the Step shows; each typed letter is stored at once, on that Step, as on the Step's own screen; the row's "Why: …" line follows. A Step without a Decision shows no such control. The field's id differs for each Step (`decision-reason-<step>`), so that no two fields on the Summary share an id. The text is rendered as text and holds at most 280 characters, as before.
   - Edge cases: Undo takes the typed reason back in one step, and the open field then shows the stored text; a reason typed on the Summary and one typed on the Step are the same reason.
2. **The quiet buttons have an edge (U6-22).** "Copy …", "Rename", "Remove", "Dismiss", and the like looked like plain gray text beside the outlined "Download …" buttons.
   - What the user sees: every quiet button has a visible edge, in the same color as the other buttons' edge (`--border-strong`), in the light and the dark theme; the edge is at least 3 to 1 against the page behind it. On hover the edge takes the text color. A quiet button stays quieter than a main button: no fill.
3. **Undo says what it takes back (U6-23).** The reviewer pressed "Undo" out of habit and it took back something older than expected.
   - What the user sees: beside the Undo button, always, a line that says what the next Undo takes back, or "Nothing to undo."; the line is tied to the button (`aria-describedby`), so that a screen reader says it with the button; the button's name stays "Undo". The line follows each change and each Undo. The words:
     - one Step: "Undo takes back: the Step “X” goes back to how it was."; several Steps: "…the Steps “X” and “Y” go back to how they were."
     - the whole project (a start from another Direction, or more than three Steps): "Undo takes back: the whole project goes back to the earlier one, which started from X."
     - the name: "…the project’s name goes back to “X”."; the Contrast checks setting; the Overlays.
     - the texts of the page ("Your content"): "…the texts of the page go back to how they were."; the three answers about the project: "…your three answers about the project go back to how they were."
   - The message after an Undo says the same thing in the past tense, for the texts and the answers too. Before this repair, an Undo of a typed text said "your earlier project is back", which overstated what it did. All other "Undone: …" messages stay word for word.
   - Not built: "Redo". The review noted its absence; it is recorded as a gap, not built here.
- How to test it end to end: browser tests. Reason: a Step with a Decision shows the control, one without does not, the typed text reaches the stored project and the row's "Why:" line, no id is repeated, Undo takes it back. Edge: every quiet button of the Summary has a drawn edge with at least 3 to 1 in both themes. Undo: the line says "Nothing to undo." at the start; after a reason it names the Step; after a text of the page it names the texts, and the message after the Undo says so; the button's name is "Undo" and `aria-describedby` names the line.

### 2.15 Hardening of the Fit check after the seventh review (findings X7-01 to X7-04, X7-06 to X7-08, V7-01 to V7-05, V7-09; decision D68)

The seventh review found two blockers in the Fit check: a page that runs its own script can change what the program sees (it made the receipt say "No deviation" for a page with a red box, a wrong typeface, and a wrong radius), and a page can send data over channels that the program did not stop (a WebSocket, a window that it opens, a prefetch or preconnect link), while the receipt said that every request was stopped. This section repairs both and the smaller faults around them.

1. **The program does not run the page's own scripts, and it says so.** By default the browser window runs no script of the page. The receipt states "The program did not run the page's scripts." The call option `runScripts` (command line: `--run-scripts`) runs them. The receipt then states that the page's scripts ran and that a page can change what the program sees. Page errors are recorded only when scripts run.
2. **The window is offline.** The browser window has no network at all, so no WebSocket, popup, prefetch, preconnect, or other channel can send anything. The program still writes down each request that it sees and each address that the page names.
3. **Page text never stands in the receipt outside a fence, and never carries invisible signs.** Every text that comes from the page and enters the receipt (an element's label, a color value, a family, an address, an error message) is first cleaned: control characters, line breaks, and invisible format characters (the default-ignorable code points and the other format characters, among them the tag characters and the direction signs) are removed, and the line is cut at 200 characters. The reasons that a contrast reading could not be taken, and the reasons that a window did not load, are fixed sentences that the program chooses; no page text and no browser message enters them.
4. **The receipt has a bounded size.** At most 20 deviations and 50 lines of information for each measure, each line at most 200 characters, at most 5 page errors.
5. **The command line does not write through a symbolic link.** If `receipt.json` or `RECEIPT.md` exists in the result folder as a symbolic link, the program refuses (status 2) and writes nothing.
6. **Colors that the program cannot read are counted.** A computed color in a notation that the program cannot read (for example `oklch()` or `color-mix()`) counts under "not measured" for the colors measure, with that sentence in the note.
7. **Partly transparent colors are listed** apart from the deviations, as information, each distinct value once.
8. **A `data:` address is left out in any letter case.**
9. **More ways to name another site are read:** `formaction` on a button or input, `poster` on a video, `ping` on a link, `<meta http-equiv="refresh">` with an address, and `href` on an SVG `image` or `use`.
10. **The same address appears once** in "Not shipped with the page", with all its kinds on that one line.
11. **The content check runs at each window width.** A required text that is missing at either width is a deviation, and the line names the width. A required text that is empty in the Mockup is counted under "not measured".
- Not changed, and recorded as open: the browser runs without its own sandbox when the program runs as the root user (finding X7-09); a page that makes the program wait takes up to about 30 seconds and is then reported as not measured (finding X7-11).
- How to test it end to end: browser tests with a page that replaces the browser's own functions (the receipt must equal the receipt of the same page without that replacement); a local listener that counts every connection while a page tries a WebSocket, a popup, a prefetch link, a preconnect link, and a script fetch, with scripts off and with scripts on (the listener must count none); a page that tries to put a heading and a bullet into the receipt; class names of tag characters and of one million characters; a symbolic link in the result folder; each new way of naming another site; the content check at 375 pixels with a text hidden there.

### 2.16 Four repairs after the seventh review (findings U7-02, U7-01, X7-05 with C7-03 and T7-06, and C7-01; decision D68)

1. **A double click does not record a second Decision (U7-02).** The main button of a Step stands in the same place on every Step. A double click used to press it twice, and the second press recorded the default of the next Step, which the person never looked at.
   - What the system does: the second click of a double click on the main button does nothing. One click moves on by one Step and records one Decision. A key press is not affected: each press of Enter is a deliberate act.
2. **A page that holds some of the owner's texts and some of the sample's says so (U7-01).** The Studio said "The page shows your own texts" as soon as one text had changed, and `PRESCRIPTION.md` told the AI coding tool to use every text "word for word" as the owner's own, although the page still held the sample dental practice's "45 min for a first visit" beside a bakery's name.
   - What the core does: `sampleTextsLeft(content)` names, in the page's order and in fixed plain words, each text and each list that still equals the sample's, and gives the total of texts and lists (23).
   - What the screens say: on "Your content" and on the Summary, when some but not all are still the sample's: "N of 23 texts are still the sample dental practice's words: …". When none is, the existing sentence stays; when all are, the existing sentence stays.
   - What `PRESCRIPTION.md` says: when some are still the sample's, the line about the texts says which ones are placeholders and tells the tool not to treat them as the owner's content. When none is, or all are, the lines stay as they are, word for word.
3. **A project file is cleaned like typed text (X7-05, C7-03, T7-06).** The texts in a loaded file used to keep hidden signs, line breaks, and any length up to 600 characters, and they reached `mockup.html` raw.
   - What the system does: when it loads a project, each text of the page, each item of a list, each menu word, and each of the three answers is cleaned as typed text is cleaned (invisible signs and signs that change the direction of writing go; line breaks and runs of spaces become one space; the text is cut at its limit by whole characters). A required text that the cleaning would leave empty is replaced by the sample's. The notes of the load say how many texts were changed.
   - Edge cases: a clean file loads as before, with no note; a file with 600-character texts is cut at the limits of section 2.7.
4. **`DESIGN.md` does not claim a measurement that did not happen (C7-01).** With the Contrast checks setting Off, `DESIGN.md` said "The Studio measured this pair", while `PRESCRIPTION.md` said that no program looked.
   - What the system does: with the setting Off, the sentence says that contrast checks are Off for this project and that no program measured the pair. With "Warn me" or "Fix for me" the sentence is unchanged, word for word.
- Not changed in this feature, and recorded: the fingerprint sentence in all files (finding C7-07) says more than the fingerprint covers; the words cannot change until the stored copies of the build trials are made again, because the trial tests compare them with what the core writes today. This waits for the Floors, which change the files anyway.
- How to test it end to end: a browser test double-clicks the main button; unit tests for `sampleTextsLeft`, for the line in `PRESCRIPTION.md` in the three cases, for loading a hostile file, and for `DESIGN.md` with the setting Off and on; a browser test for the sentence on "Your content" and on the Summary in the mixed case.

### 2.17 Small repairs of the core and of the Undo line (findings X7-10 and C7-05, C7-06, C7-08, V7-07; decision D68)

1. **The list of invisible signs is complete for the families that carry hidden text (X7-10, C7-05).** The format characters U+FFF0 to U+FFFB, U+13430 to U+1343F, U+1BCA0 to U+1BCA3, and U+1D173 to U+1D17A are treated as the other invisible signs are (a space in a name and in a text for an AI tool). The zero-width joiner and non-joiner and the variation selectors stay as they are, until the owner decides (emoji and some scripts need them; finding C7-04 stays open).
2. **A cut never leaves half a character (C7-06).** A reason and a project name are cut at their limit in UTF-16 units, as before, but a cut that would end on the first half of a two-part character drops that half.
3. **`FONTS.md` states each font file's real weight range (C7-08).** The font table of the core holds, for each font that ships a file, the lowest and the highest weight that the package's file covers; `FONTS.md` writes that range in the `@font-face` block. A test compares the table with the packages' own style sheets.
4. **The Undo line does not claim a whole-project change where nothing differs (V7-07).** When the project is the same as the one before it, the line says "Undo takes back: a change that left nothing different." and the notice after it says "Undone: the last change had left nothing different." A difference that the function does not compare (for example the Skin) still gives the whole-project sentence.
- How to test it end to end: unit tests for each point; the stored copy of `FONTS.md` for the worked project is updated and its two changed lines are the weight lines.

### 2.18 The Floors in the Prescription (milestone M6; decisions D13, D63 point 3, and D69)

A Floor is a requirement that the Prescription writes whatever the design is. This section builds the Floors from the research records `docs/research/12a` to `12d`.

- What the system does: the Catalog holds each Floor requirement as a record: an id, its Floor, its text (for the AI coding tool, in exact terms), the method by which a program could check it, what a person must still check, its source (an address on one of the five approved hosts and a short quotation), its grade, whether a published standard states it, the place in the standard where it states it (for the people Floor, the success criterion), and its review date. The research record holds 66 rows; the Catalog holds 56 requirements (20, 11, 5, 10, 10), and decision D69 point 6 names the ten rows left out and why. The Floors:
  1. **Use by people with disabilities** (ids A1 and on): written only when Contrast checks is "Fix for me" (decision D13).
  2. **Security of the page** (S1 and on): always written.
  3. **Security settings of the host** (H1 and on): always written, as settings that a person must make at the host, because a page of one file cannot send headers; each requirement says where to set it, and the section tells the builder not to send them in the page.
  4. **Being found by search** (Q1 and on): always written.
  5. **Speed** (P1 and on): always written.
  `PRESCRIPTION.md` has a section "7. Floors" that lists, for the project, each applicable requirement with its id, its text, what a person must still check, and its source. The section says that no program checks any Floor yet, and that a requirement states what to build and what to check, not that the page meets a standard.
- Edge cases:
  - Contrast checks "Off" or "Warn me": section 7 says that the Floor for people with disabilities is not written, why, and that the owner can choose "Fix for me"; the other Floors stand.
  - No file says that a page is "accessible" or "compliant" (hard rule 8); the Floor for people with disabilities is not named with those words.
  - A source address is on `www.w3.org`, `developer.mozilla.org`, `web.dev`, `developers.google.com`, or `cheatsheetseries.owasp.org`; a quotation is at most 25 words.
  - The old section 7 ("What this first part leaves out") becomes section 8 and no longer lists the Floors as missing; it says that structured data for the business and the Fit check's measures of the Floors are not in the Prescription.
  - `mockup.html` is a reference for the design only: it carries its own policy (which blocks files and forms), its own title, and no description for search engines. Section 7 says that the requirement decides wherever they differ; S5 places the policy after the character set and before every element that loads something; S6 says what a form does when the owner named no endpoint.
  - The design values, `DESIGN.md`, `tokens.*`, `theme.css`, `mockup.html`, and `FONTS.md` do not change; the fingerprint does not change.
- Not in this slice, and recorded: structured data (JSON-LD) for the business, which needs a data script element that the "no script" rule and the strict content security policy exclude (an owner decision, D69 point 5a); a program that checks the Floors (milestone M7); the choice of host (D69 point 5c).
- How to test it end to end: unit tests of every record (fields, address host, quotation length, no claim words, unique ids); of the section for each of the three contrast settings; the stored copies of `PRESCRIPTION.md` are updated, and the diff is only the section and the changed lines; a browser test that the Summary says what the Prescription now holds.

## 3. Out of scope

- For the Direction Creator: sharing with other people; a Direction written by an AI inside the Studio; Skins for own Directions; new Options.
- Milestones M5 and later.
- For the hardening (2.4): the older open findings in `redteam/FINDINGS.md` stay listed and are not part of it; own Directions in the private page's database.
- Any browser other than Chromium; the real private page with its database.

## 4. Constraints

The hard rules and verification rules of `CLAUDE.md`: no React and no browser API in `packages/core`; text renders as text; exact dependency versions, each at least 7 days old and recorded in `DECISIONS.md`; no test is skipped or weakened; anything that stores data is first a cell in the saving table.

## 5. Definition of done

A feature is done when its entry in `feature_list.json` has `"passes": true`, `npm run check` and `npm run e2e` pass, and the records (`PROGRESS.md`, `redteam/FINDINGS.md`, the guarantees reference) say what is true.
