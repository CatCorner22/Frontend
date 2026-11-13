# Progress

A fresh session reads this file to learn where the project stands. Update it after every unit of work.

## Current milestone: M4 (Step screen). Not complete.

**Why M4 is not complete.** Its exit test has three parts: the owner uses the Studio on the private page; a keyboard-only pass; the owner picks the Studio's own look. The keyboard pass now runs as an automated test. The owner's trial has not happened. The second red-team review ran on 2026-11-13 (decision D34): it found 3 blockers, all fixed and tested the same day, and 12 major findings, of which 1 is still open (U2-08 Options that look alike) and 3 are fixed in part (U2-04, U2-06, T2-03). The third review ran the same day (decision D41), on those fixes and on the plain-words rewrite: 2 blockers, both fixed and tested; 14 major findings, 12 fixed and 2 fixed in part (U3-02, U3-05). Nobody has reviewed the fixes of the third review; hard rule 12 asks for that at the M4 gate.

**Milestone status, stated plainly.**

| Milestone | Status |
|---|---|
| M0 | Exit test met after correction on 2026-11-13: the results file now matches the measured data; the scorecard is applied and marked as judged by a model. |
| M1 | Met late. CI was red when M2 work began (finding M-02). No session setup script (decision D32). |
| M2 | Met: 143 unit tests (2026-11-13); the core imports no React and no browser API. |
| M3 | Exit test met in CI since 2026-11-13 (pixel-difference tests, stored-picture gate). One part still open: nobody has confirmed that the private page shows the embedded pictures. |
| M4 | In progress. |

## What exists

- **Core** (`packages/core`): 23 Steps (6 Layout, 17 Look and feel), 18 Directions and a Direction generator, 12 conflict rules and 11 harmony rules as Catalog records, token derivation with 29 measured contrast pairs, the Mockup for Template 1 (one page), saved-project format version 2 with a migration from version 1.
- **Studio** (`apps/studio`): Directions, Steps, Summary, and Licences screens; storage that reads both saved copies and never overwrites what it cannot read; Undo; confirmations before work is replaced.
- **Checks in CI:** type check, lint, boundary rule, 143 unit tests, licence-notices check, 128 browser tests (52 on the Studio; 76 on the Mockup: 23 on the Options of each Step, 9 on paint-only Steps, 1 on target sizes, 3 on phone width and headline size, 38 stored-picture comparisons, 1 check that a changed look is noticed, and 1 measurement of drawn colors), bundle-size budget, dependency audit.
- **Red team:** first review on 2026-11-13: 137 findings (6 blockers, 55 major, 56 minor, 20 notes). Every finding has a status in `redteam/FINDINGS.md`. `redteam/tools/plant-defects.py` plants 39 defects; the unit suite catches 38.
- **Private page:** https://claude.ai/artifact/PexMgowEAEAHZ9vpHw3uXc (the version number is in `WAYPOINTS.md`).
- **Literal names (2026-11-13).** Every Step, Option, and slider in the Catalog now carries a name that says what a person sees (for example "Ring and whisper" became "Thin outline with a faint shadow"; "Accent color" became "Main color"). The "Contrast checks" choices read "Off", "Warn me", "Fix for me". Identifiers did not change, so saved projects open as before. No red-team review covered this change (D33).
- **Second red-team review (2026-11-13, decision D34).** Reports: `redteam/reports/2026-11-13-b-*.md`. 52 rows in `redteam/FINDINGS.md`, each with a status. Fixed and tested: kept copies are never replaced silently (S2-01); the original is kept when opening changes a saved copy (S2-02); a contrast "pass" now means the emitted colors pass (T2-01); "Start again" keeps the replaced project (U2-01); a second color follows the main color in every case (T2-02); sliders have names (U2-05); Undo says what it undid (U2-07).
- **Names of the Contrast checks choices.** The Studio shows "Off", "Warn me", "Fix for me". The code and older documents call the same three `off` / "Advise" and `enforce` / "Enforce".
- **Visual tests draw text the same way on every machine (decision D35).** CI runs 11, 26, and 27 failed because GitHub's machine applied font hinting and this one did not. The tests now fix that setting.
- **Plain words (2026-11-13, decision D38).** Every text the Studio shows was rewritten so that a reader needs no design vocabulary: the question, the teaching text, and the "one thing that changes" line of all 23 Steps; the Option texts, the overused-look warnings, the named examples, the messages about Decisions that pull against each other, the engine's own sentences, and the names of the contrast pairs. A trade word now appears only in round brackets, as a word to learn. Three unit tests and one browser test enforce the rule; the builder planted four defects and each test failed as it should. While planning, the builder found and fixed three defects of its own: 7 of the 12 messages about Decisions called Options by retired names; the engine said "accent color" where the Step says "Main color"; and the teaching text of "Text contrast" promised a figure that the notes show only for a failing pair.
- **Third red-team review (2026-11-13, decision D41).** Reports: `redteam/reports/2026-11-13-c-*.md`. 46 rows in `redteam/FINDINGS.md` for 51 findings (47 from the reviewers, 4 that the builder found; five notes share one row), each with a status. Fixed and tested: the Studio never saves over a copy that it could not keep (S3-01, decision D40); colors reach the page as exact digits, and a browser test measures the drawn pixels (T3-01, decision D39); "Fix for me" cannot stall just below a requirement (T3-02); "Put back" keeps a second color following (T3-03); a notice stays in view on a phone (U3-01); a hand-set value reads as words (U3-03, U3-04); the "Second color" slider shows only when there is a second color (U3-06).
- **The builder's own sweeps (2026-11-13).** Every check and all browser tests passed 5 times in a row in a clean copy, while three reviewers loaded the machine (the one failure seen once earlier did not recur). The defect-planting tool: 38 of 39 planted defects caught; the survivor (N04, "reports repaired without measuring again") cannot be told apart from correct code, because "Fix for me" repairs every pair in every design that the sweeps reach. The engine sweep takes every action the Studio can take.
- **Four new Directions and one new background Option (2026-11-13, decision D42).** “Vector Horizon” (futuristic), “Frontier Gazette” (American West), “Galactic Goth” (purple and deep red), and “Marquee Deco” (black and gold; the builder’s own addition). The Step “Background at the top of the page” gained “Field of stars”. With “Two colors” on a dark page, the band is now a deep shade of the second color. Three of the looks rest on search summaries only; the records are in `docs/knowledge/sources/`, with an index at `docs/knowledge/INDEX.md`.
- **Guarantees reference (2026-11-13).** `docs/reference/guarantees.md` states each guarantee that the Studio makes and names the test or decision behind it. A script checks its structure; nobody but the builder has reviewed its content.
- **Fourth red-team review, "campaign 4" (2026-11-13, decision D43).** A stricter method than the first three reviews: six independent attackers, a separate judge who reproduced every claimed failure, and a written charter fixed before the attack. Files: `redteam/campaign-4/` (charter, raw logs, the judge's findings, the report). Round 1: 58 attempts; 9 confirmed findings (none at the worst level, 2 at the second, 6 minor, 1 for information); no attempt ran code, injected markup, or sent a request. All 9 are fixed or corrected, each with a test; the retest round's result is recorded in `redteam/campaign-4/report.md`.
- **Why some browser tests failed once in a while (found 2026-11-13).** The tests placed their starting data through a script that read the browser's storage at the first instant of every page load. On a reload, the browser sometimes showed that script an empty storage (4 of 16 trials); the script then placed the starting data again and replaced what the Studio had written. This explains the one-time failures recorded earlier (the "dresses the Studio" test; the "really replaces an unreadable copy" test). The tests now place starting data from an empty page before the Studio opens. Without that script, nothing was lost in 410 reload trials (390 with a small write, 20 with the real storage filled to the brim). One limit stays: all trials used Chromium. The measurements are filed in `docs/knowledge/sources/browser-storage-across-reload-measurements.md`.

## Next

1. The owner tries the Studio and answers the open questions below.
2. Fix the open major finding of the second review (U2-08; finish U2-06 and T2-03) and the two major findings of the third review that are fixed in part (U3-02, U3-05); then have the reviewers check the fixes (hard rule 12). M4 cannot close before that.
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
9. The third review's reviewers used about 595,000 tokens; the plan's estimate was 300,000 to 450,000.
10. Decision D42 holds three choices of the builder that are open to your veto: the fourth Direction “Marquee Deco”; the new Option “Field of stars”; and the deep band for “Two colors” on a dark page.
11. The guarantees reference (`docs/reference/guarantees.md`) and the knowledge index (`docs/knowledge/INDEX.md`) are new files that `CLAUDE.md`'s layout table does not list. Add them to the table?

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
- **Second review, still open (major):** some Option cards look alike at card size, for example the three "Text contrast" cards (U2-08).
- **Second review, still open (minor, selected):** no leave-page warning while saving is paused (S2-03); the local test file shares its browser storage with every other local HTML file, so use it for testing only (S2-05); "Warn me" does not measure a headline filled with a gradient (T2-03). The full list is in `redteam/FINDINGS.md`.
- **Third review, still open (selected):** two things still have two names on screen (the Step "Background at the top of the page" asks about "the first screen"; the card for the current values has three names) (U3-05); the values that sliders announce to a screen reader are bare numbers (U3-11); two tabs that keep a copy at the same moment could lose one, which the reviewer inferred and did not reproduce (S3-06); the drawn-color measurement runs in Chromium only (T3-01).

## Reading status (what the records support)

- The owner's Drive files: 11 loose files and 2 archives are covered by `docs/research/01`-`03`. `map.pdf` was not readable. Most of the archive's source notes were read as a digest.
- The owner's five links: two read in full, one read at index level, one in part, one not read (decision D10).
- `docs/research/08`, `09`, and the knowledge base were written by research helpers. Nobody has reviewed them. The knowledge base marks each source as read, abstract only, search snippet, or from memory.
- Company design pages (Linear, Stripe, Apple) were never read. The Catalog no longer cites them as exemplars.

## Environment notes

- Cloud environment "engine". Allowed hosts added on 2026-11-13: `www.netguru.com`, `dev.to`, `docs.gitlab.com`, `www.sitepoint.com`, `stitch.withgoogle.com`, `linear.app`, `stripe.com`, `vercel.com`, `rauno.me`. `WebFetch` cannot resolve these; `curl` through the session proxy can.
- A new session runs `npm ci --ignore-scripts` first. The browser for tests is pre-installed and matches Playwright 1.63.0.
- The owner's source files live in Google Drive, folder "Claude".
