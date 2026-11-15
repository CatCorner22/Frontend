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
- How to test it end to end: a unit test reads the copyright notice inside every shipped font file and fails on the words "Reserved Font Name"; a browser test opens a stored project that names both replaced typefaces and reads the notice, the kept copy, and the drawn font family.
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

## 3. Out of scope

- For the Direction Creator: sharing with other people; a Direction written by an AI inside the Studio; Skins for own Directions; new Options.
- Milestones M5 and later.
- For the hardening (2.4): the older open findings in `redteam/FINDINGS.md` stay listed and are not part of it; own Directions in the private page's database.
- Any browser other than Chromium; the real private page with its database.

## 4. Constraints

The hard rules and verification rules of `CLAUDE.md`: no React and no browser API in `packages/core`; text renders as text; exact dependency versions, each at least 7 days old and recorded in `DECISIONS.md`; no test is skipped or weakened; anything that stores data is first a cell in the saving table.

## 5. Definition of done

A feature is done when its entry in `feature_list.json` has `"passes": true`, `npm run check` and `npm run e2e` pass, and the records (`PROGRESS.md`, `redteam/FINDINGS.md`, the guarantees reference) say what is true.
