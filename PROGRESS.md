# Progress

A fresh session reads this file to learn where the project stands. Update it after every unit of work.

## Current milestone: M4 (Step screen). Not complete.

**Why M4 is not complete.** Its exit test has three parts: the owner uses the Studio on the private page; a keyboard-only pass; the owner picks the Studio's own look. The keyboard pass now runs as an automated test. The owner's trial has not happened. The second red-team review ran on 2026-11-13 (decision D34): it found 3 blockers, all fixed and tested the same day, and 12 major findings, of which 3 are still open (U2-03 jargon in the help text, U2-04 raw numbers in the read-back, U2-08 Options that look alike) and 2 are fixed in part (U2-06, T2-03). Nobody has reviewed the fixes themselves; hard rule 12 asks for that at the M4 gate.

**Milestone status, stated plainly.**

| Milestone | Status |
|---|---|
| M0 | Exit test met after correction on 2026-11-13: the results file now matches the measured data; the scorecard is applied and marked as judged by a model. |
| M1 | Met late. CI was red when M2 work began (finding M-02). No session setup script (decision D32). |
| M2 | Met: 131 unit tests (2026-11-13); the core imports no React and no browser API. |
| M3 | Exit test met in CI since 2026-11-13 (pixel-difference tests, stored-picture gate). One part still open: nobody has confirmed that the private page shows the embedded pictures. |
| M4 | In progress. |

## What exists

- **Core** (`packages/core`): 23 Steps (6 Layout, 17 Look and feel), 14 Directions and a Direction generator, 12 conflict rules and 11 harmony rules as Catalog records, token derivation with 29 measured contrast pairs, the Mockup for Template 1 (one page), saved-project format version 2 with a migration from version 1.
- **Studio** (`apps/studio`): Directions, Steps, Summary, and Licences screens; storage that reads both saved copies and never overwrites what it cannot read; Undo; confirmations before work is replaced.
- **Checks in CI:** type check, lint, boundary rule, 131 unit tests, licence-notices check, 100 browser tests (36 on the Studio, 64 visual tests of the Mockup), bundle-size budget, dependency audit.
- **Red team:** first review on 2026-11-13: 137 findings (6 blockers, 55 major, 56 minor, 20 notes). Every finding has a status in `redteam/FINDINGS.md`. `redteam/tools/plant-defects.py` plants 39 defects; the unit suite catches 38.
- **Private page:** https://claude.ai/artifact/PexMgowEAEAHZ9vpHw3uXc (the version number is in `WAYPOINTS.md`).
- **Literal names (2026-11-13).** Every Step, Option, and slider in the Catalog now carries a name that says what a person sees (for example "Ring and whisper" became "Thin outline with a faint shadow"; "Accent color" became "Main color"). The "Contrast checks" choices read "Off", "Warn me", "Fix for me". Identifiers did not change, so saved projects open as before. No red-team review covered this change (D33).
- **Second red-team review (2026-11-13, decision D34).** Reports: `redteam/reports/2026-11-13-b-*.md`. 52 rows in `redteam/FINDINGS.md`, each with a status. Fixed and tested: kept copies are never replaced silently (S2-01); the original is kept when opening changes a saved copy (S2-02); a contrast "pass" now means the emitted colors pass (T2-01); "Start again" keeps the replaced project (U2-01); a second color follows the main color in every case (T2-02); sliders have names (U2-05); Undo says what it undid (U2-07).
- **Names of the Contrast checks choices.** The Studio shows "Off", "Warn me", "Fix for me". The code and older documents call the same three `off` / "Advise" and `enforce` / "Enforce".
- **Visual tests draw text the same way on every machine (decision D35).** CI runs 11, 26, and 27 failed because GitHub's machine applied font hinting and this one did not. The tests now fix that setting.

## Next

1. The owner tries the Studio and answers the open questions below.
2. Fix the open major findings of the second review (U2-03, U2-04, U2-08; finish U2-06 and T2-03), then have the reviewers check the fixes (hard rule 12). M4 cannot close before that.
3. M5: import the knowledge base into the Catalog (teaching text, craft layer, floors); Stage 1 (Brief, the owner's real content) and Stage 4 (Behavior) Steps; an inner page for Template 1; group the 13 accents; use `data/exemplar-tokens.json` and `data/sleek-recipes.json` for values that a record supports.
4. M6: export bundle. M7: the Fitter.

## Waiting on the owner

1. Do the pictures appear on the private page? (M3's last open part.)
2. Approve or reject: D24 (links and focus ring stay at 3:1 even when Contrast checks are Off), D28 (Playwright 1.63.0), D29 (browser storage, not IndexedDB), D30 (own type-size formula), D31 ("keep" replaces "skip: take the default"), D32 (no setup script).
3. Approve changes to the defined-terms table in `CLAUDE.md`: an Option is "one of several choices" (not "3-4"); the accessibility Floor is optional per project (D13); add "Direction"; a Decision's reason is optional.
4. Two bundled typefaces reserve their names (Playfair Display, Source Serif 4): keep, replace, or ask the copyright holders. See `docs/research/10-font-reserved-names.md`.
5. The default for Contrast checks is "Advise" (shown as "Warn me"). The owner's own source assessment says "default to AA". Keep "Advise"?
6. Dependabot opened 7 pull requests against the working branch (numbers 1 to 7). The builder recommends leaving them unmerged: D27 requires a 7-day wait and a recorded check for each version.
7. Dependabot's "cooldown" setting would enforce the 7-day wait by itself (finding S2-06). The builder could not verify its spelling (the network blocks docs.github.com) and did not add it.
8. The Drive backup of waypoint W4 was not sent: the file is larger than the connector accepts in one call. Split it, skip it, or rely on GitHub?

## Known gaps (every plan item that is absent or partial)

- No Content Security Policy and no Trusted Types. The private page's own policy is unknown.
- Prettier is installed and never run.
- Catalog: no "page type" Step, no "icon set" Step, no "light and dark both" Option; Template 1 has no inner page; 13 accent Options are not grouped; many Options have no exemplar, because no record supports one.
- "Every derived token is hand-adjustable" (D14) is not built: 14 input values are adjustable on 10 Steps.
- Contrast checks do not measure text over glows, glass, or photographs. The Studio says so on screen.
- The Studio's controls are 32 to 40 pixels tall on a mouse-driven screen (44 on touch screens).
- In the one-column layout (windows under 1,100 pixels wide) the cards and the large preview are not on screen together.
- The save path on the real private page (its database and its file hand-over) has no automated test; tests use a stand-in.
- axe runs on the Studio's own screens only, and reports serious and critical findings only. No axe run on the Mockup yet.
- Tests ran in Chromium only. No screen reader was used.
- The dependency audit shows 9 moderate advisories, all one advisory in a package inside the lint tools; nothing ships to the browser.
- Drive backups (D26): the upload has failed on every attempt so far (connector errors).
- **One unexplained test failure.** The browser test "dresses the Studio in the project’s design when asked, and remembers the choice" failed once in 5 local runs on 2026-11-13 (the checkbox read as unchecked after a reload). The Studio writes the preference at once and reads it first at start; no cause was found. The test is unchanged. If it fails again, investigate before anything else.
- **Second review, still open (major):** the help text uses design words such as "accent", "hue", "chroma", "elevation" and cites documents a first-time user does not have (U2-03); the Step list and the Summary read values back as raw numbers such as "spacing 1.18" (U2-04); some Option cards look alike at card size, for example the three "Text contrast" cards (U2-08).
- **Second review, still open (minor, selected):** no leave-page warning while saving is paused (S2-03); the local test file shares its browser storage with every other local HTML file, so use it for testing only (S2-05); "Warn me" does not measure a headline filled with a gradient (T2-03). The full list is in `redteam/FINDINGS.md`.

## Reading status (what the records support)

- The owner's Drive files: 11 loose files and 2 archives are covered by `docs/research/01`-`03`. `map.pdf` was not readable. Most of the archive's source notes were read as a digest.
- The owner's five links: two read in full, one read at index level, one in part, one not read (decision D10).
- `docs/research/08`, `09`, and the knowledge base were written by research helpers. Nobody has reviewed them. The knowledge base marks each source as read, abstract only, search snippet, or from memory.
- Company design pages (Linear, Stripe, Apple) were never read. The Catalog no longer cites them as exemplars.

## Environment notes

- Cloud environment "engine". Allowed hosts added on 2026-11-13: `www.netguru.com`, `dev.to`, `docs.gitlab.com`, `www.sitepoint.com`, `stitch.withgoogle.com`, `linear.app`, `stripe.com`, `vercel.com`, `rauno.me`. `WebFetch` cannot resolve these; `curl` through the session proxy can.
- A new session runs `npm ci --ignore-scripts` first. The browser for tests is pre-installed and matches Playwright 1.63.0.
- The owner's source files live in Google Drive, folder "Claude".
