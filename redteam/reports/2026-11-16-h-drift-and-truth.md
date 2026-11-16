# Seventh red-team round, 2026-11-16: drift and truth auditor

The report of one helper agent, as it sent it (decision D68). The text is the helper's, unedited; the builder's answers stand in `redteam/FINDINGS.md` (rows T7-nn). It was extracted from the helper's session record.

---

# Drift and truth audit, review 7 (HEAD eb88528 audited; branch tip is now 461af98, which adds D68)

I changed no repository file. My scratch files are in `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/review7/truth/`. I sent nothing over a network. I found no blocker. The worst drift is stale status text in PLAN.md and PROGRESS.md, plus one guarantee whose Rule is wider than what the code does.

Commands I ran:
- `npm test`: 266 passed.
- `npx tsc -p plugin/fit`: exit 0.
- `npm run typecheck && npm run lint && npm run boundaries`: all pass.
- `node plugin/fit/src/cli.ts` on both trial pages: both stored receipts reproduced byte for byte.
- Throwaway vitest probes against the core.

## Findings

| ID | Sev | Claim (file:line) | Reality and evidence | Verified |
|---|---|---|---|---|
| T7-01 | major | PLAN.md:19: "four files… three files of the full Prescription are still missing… the Fitter does not exist (M7)". PLAN.md:36 "not built (M7)"; :188 M7 "not started"; :270 "Then the rest of M6: the remaining files… and a validator for `tokens.json`". Version stays "3.3". | `writePrescription` returns 7 files, and `PRESCRIPTION_FILES` lists 7 (F019 to F023). `npm run fit` runs and measures a build (F024 to F027). Two trial builds are stored. The Fit check's first slice and the missing files are built, so PLAN marks them "not built/not started". | yes |
| T7-02 | major | PROGRESS.md:386, "Known gaps": "A first slice only: `DESIGN.md`, the shadcn theme, `FONTS.md`, and the floors are missing. No validator has read `tokens.json`. No AI coding tool has built from the files… The Mockup in the bundle shows the sample dental practice… (the Brief is not built)". | Three of those files exist. Validators run on GitHub (D64, `validators/`). Trial 001 is a helper that built from the seven files. The Brief is built (F015 to F018), and the probe shows `mockup.html` carrying the owner's texts. Only the floors are still missing. | yes |
| T7-03 | minor | PROGRESS.md:7: "No AI coding tool has built from the files yet; the Studio has no Fitter (M7)". :57: "writer of the Prescription's first four files". :366 (Next 4): the rest of the bundle is still to build. | SPEC 2.11 and F025 call the trial "one AI coding tool builds from the seven files". The writer produces 7 files. "Next" item 4 lists files already built. | yes |
| T7-04 | minor | PROGRESS.md:377 (Waiting on the owner 6) and :384 (Known gaps): U6-11, U6-22, U6-23, U6-24 "need the owner's judgment"; "13 of its 67 findings are open". PROGRESS.md:7 also says "13 open". | D63 gave all four to the builder. F028 repaired U6-11 and U6-22 and half of U6-23. Counted from the S6/U6/T6 rows: 41 fixed, 10 fixed in part, 10 open, 2 repaired, 1 repaired in part, 2 recorded, 1 closed. That is 10 open now, not 13. FINDINGS U6-24 still says "Open, for the owner's judgment", although D63 point 4 chose the fingerprint and F019 built it. D63's row says "Point 4 built in feature F028", but the fingerprint half was F019. | yes |
| T7-05 | minor | PROGRESS.md:363 (Next 2): "The first to weigh: the rare loss when several tabs close in the same instant (C4-F18)". | The C4-F18 row says "Repaired on 2026-11-15 (feature F001)". The Waiting list (line 373) says so too. | yes |
| T7-06 | major | guarantees.md §55.01 Rule: "Each text of the page and each of the three answers is stored on one line, without invisible signs and without signs that change the direction of writing, and cut at its own limit". SPEC.md:119 says "cleaned as a project name is cleaned". | This holds only for typed text, through `oneLine` in `brief.ts`. `parseProject` keeps `content` and `brief` as the file has them. My probe: a file with U+202E and U+200B in `business` and `headline`, a 590-character headline (limit 120), a newline in an answer, and tag signs U+E0049 in `lede` all load unchanged. The tag signs and RLO/ZWSP then reach `mockup.html` raw; `PRESCRIPTION.md` was clean. The §55.01 Exceptions mention only the longer list. `oneLine` uses `visibleText` (it keeps quotation marks and does no NFC), so SPEC's "as a project name" is also wrong. Hard rule 10's concern is hidden text, and the S6 blocker was the same kind of path. | yes |
| T7-07 | minor | SPEC.md:119: "the screen shows how many characters remain when few remain". | `ContentField` (App.tsx:986) shows only "This field is full" at the limit. No remaining-count exists, and no test or guarantee mentions one. | yes |
| T7-08 | minor | SPEC.md:128 and feature F017: "no overflow, no overlap, the headline stays the largest text". | The test `holds the owner's content at the ends…` (visual.e2e.ts:246 to 280) measures page width only. It compares the `h1` with `h2, h3, p` only, so fact figures are excluded. B17-03 and §55.03 admit that overlap is not measured. SPEC and F017 do not. | yes (test read; not run) |
| T7-09 | minor | guarantees.md §55.02 and SPEC.md:118: "A list at 0 leaves no empty box, heading, or gap behind". | Probe with every optional text emptied and facts, fees, and services at their minimum. `mockup.html` keeps `<section class="block services" id="services"><div class="wrap"> </div></section>`, and `.block{padding-block:var(--section-gap)}` makes a blank band. The test searches only text-element kinds (the §55.02 Exceptions say so). | yes |
| T7-10 | minor | SPEC.md:179: "unit tests with stored copies of the three new files for two projects". | `prescription.test.ts` stores `FONTS.md`, `theme.css`, and `DESIGN.md` for one project ("a worked project") only: snapshot entries at snap lines 2585, 2749, 2806. Four files are stored for two projects. | yes |
| T7-11 | minor | guarantees.md:3 "Version 1.11." and its Scope sentence "does not cover… the Fitter". | The changelog's newest entry is v1.16, and §66.01 to §66.05 cover the Fit check. | yes |
| T7-12 | minor | guarantees.md §65.02, §65.04, §65.06 (lines 694, 715, 738): "the four files", "Each of the four download buttons". | Seven files and seven buttons exist, plus the archive button. The §65.06 test `hands over each of the four files…` (studio.e2e.ts:3265) checks 4 of the 7. The rule is true for those four, but §65.06's wording is stale. | yes |
| T7-13 | minor | guarantees.md §65.07 Rule (line 747): "No file carries a date". SPEC.md §2.9 says the same. | `mockup.html` from `writePrescription` holds "2026-11-13" and "2026-11-14" inside CSS comments (probe). The Exceptions line admits "some with a day". The Rule contradicts itself. | yes |
| T7-14 | note | The same fingerprint claim: "tell two sets of files apart" (SPEC §2.9, F019). | With all six Overlays switched on, the fingerprint stays `f30f6959`, the same as the plain start. Exceptions mention "not the owner's texts" but not Overlays or reasons. | yes |
| T7-15 | minor | guarantees.md §66.04 (line 815): "The five tests of 'First build trial: the stored record'". | No describe has that name. The real name is `Build trial ${id}: the stored record`, run for 001 and 002. That gives 10 tests, and the guarantee speaks of 001 only. The other §66 names exist as written. | yes |
| T7-16 | minor | App.tsx:1384 (Summary): "What does not exist yet: … the part of Refraction that measures a built page against it." | A measuring program exists (`npm run fit`, F024 to F027). It is not in the Studio and not packaged as a plugin. The sentence has not changed since F014. | yes |
| T7-17 | minor | CLAUDE.md term table: the Mockup is "Sample website" on screen. App.tsx:1144 and PRESCRIPTION.md say "reference page" for the same thing. | One concept, three names (the screen's "Sample website", the screen's and the file's "reference page", the code's "Mockup"), and "reference page" is not in the table. U6-25 is marked "Fixed" for choosing it. | yes |
| T7-18 | note | `PRESCRIPTION.md` opening: "It is the first part of the Prescription"; section 7 title: "What this first part leaves out". | Seven files exist now. The sentence is left over from the four-file slice. | yes |
| T7-19 | note | trials/002/RECORD.md table: "Contrast 0 / 2" under "Deviations that the program counted". receipt.json gives contrast `"deviations": 2`. | The same receipt says "no ratio is a deviation". SPEC 2.10 says contrast never changes status. The CLI's "14 deviations" excludes those 2. The counts match the receipt files; the label is inconsistent. | yes |
| T7-20 | note | FINDINGS.md rows R25-01 and R26-01. | Each has 6 cells instead of 7 (the evidence cell is missing). The status text sits in the evidence slot. | yes |
| T7-21 | note | PROGRESS F027 log: "Trial 002 measured again: unchanged". | 002's `receipt.json`, `RECEIPT.md`, and `RECORD.md` changed in that commit. The deviation counts are unchanged. I read "unchanged" as meaning the counts. | yes |
| T7-22 | note | PROGRESS.md:394: "Top bar… four links wrap"; PROGRESS F016 says five links. | Internal disagreement about how many links the top bar holds. Not verified in the browser. | partly |

## Eight "repaired" findings re-checked in code

- **S6-01 (blocker):** A hostile start name with a fence, a heading, and tag signs stays inside a longer ````text` fence. The tag signs are gone, and the name reaches neither `tokens.css` nor `tokens.json`. Probe plus code.
- **S6-03:** `OWN_MAX = 100`, enforced in `readOwnDirections`. The unit test exists and passes.
- **S6-09 and S6-11:** Both unit tests exist, assert what the row says, and pass.
- **T6-10 and T6-11:** `--font-mono` is typed `fontFamily` with a list value. Test line 309 compares each color's components with its hex.
- **U6-12:** App.tsx:1187 shows the sentence when there is no Direction and no Decision.
- **U6-11, U6-22, U6-23:** The reason field uses unique ids, `.btn.quiet` has a 1px `--border-strong` edge, and `aria-describedby="undo-says"` is present. The Undo wording equals SPEC 2.14 word for word.
- **B17-01 and B17-02:** `overflow-wrap:anywhere` is in the style sheet, and a fact figure over 8 characters gets class `long`.
- **R25-01:** Both trial receipts reproduce byte for byte. The repaired program gives 0 deviations on 001 and 14 on 002.

## Claims I checked and found true (counts)

- **Unit-test counts:** 266 now. I extracted commits and counted: 247 (0f29dbc), 247 (144ab83), 257 (361003d), 259 (8bec9e5), 262 (eafca43), 263 (3c23d38), 266 (6935c53). All match PROGRESS and WAYPOINTS. The extracted copies had 1 to 3 timeouts under load; I diagnosed one (a 5,000 ms timeout), so I treat them as load, not defects.
- **Static e2e counts:** Browser tests added per feature agree arithmetically (329+5=334, 334+8=342, 342+3=345, 345+6=351).
- **Guarantees (§55, §60.05 to §60.07, §65, §66):** 74 `###` guarantee sections, matching "74 guarantees". The changelog counts add up (62, 66, 69, 70, 71, 71, 74). The cite index lists every cited section for S1 to S19. Every named test exists. The only name differences are quote characters in §60.07 and the §66.04 describe name above. The tests I read assert the claim. §55.04 verified: owner texts appear only in `mockup.html`. §65.03 verified: the name and reason are fenced.
- **Trial records 001 and 002:**
  - Fingerprint `7776d35d` is in all 7 files.
  - The six trial Decisions each change a value from the start, and the reason is present.
  - The stored files equal today's core output letter for letter, for both folders.
  - Trial 001's page has no fingerprint meta tag, and its CSP has `'self'` in `img-src`, `font-src`, and `form-action`. It has no script, and the helper's invented `/appointment-request` form action is there.
  - Contrast is 6 unmeasurable readings, equal to the Mockup's own count.
  - Trial 002: 12 color and 2 typeface deviations, a 1.24 contrast reading on `p.promise`, and `.about p` is more specific than `.promise`.
  - The fit program refuses an empty build, a non-HTML build, and a missing file with status 2, and writes no receipt. A page that never ends gives status 1 with both windows "not measured".
- **Other claims confirmed:**
  - Outside-validator lockfile: 105 packages.
  - F020 warnings: exactly the three Directions below 4.5 on links (Poster Block, Sticker Pop, Sunlit Studio).
  - 38 Directions, 23 Steps (6 structure, 17 feel), 12 Skins; 33 Directions offer 1 to 5 Skins, 5 offer none, and "Indigo" is offered by 4.
  - 6 Overlays, 5 research rules, 12 craft rules, 12 conflict rules, 11 harmony rules.
  - D62 limits equal `TEXT_LIMITS`.
  - The W-table commits exist and their dates match.
  - PR 9 ended at cb25f08, and PR 10 merged as abfa23f.
  - `feature_list.json` fields other than `passes` never changed after a352db3, and no hook or verify file changed.
  - No "accessible" or "compliant" claim about output appears in the Studio, core output, fit receipts, or trial files.

## What I did not check

- Browser-test counts (294 to 351) and every `npm run e2e` pass/fail claim: not checked. Static listing cannot expand loops.
- GitHub CI results (outside validators, "check" runs, "passed on every commit up to 637bc2d"): not checked (no network).
- Private-page versions 16 to 21 and behavior on the real private page.
- Helper agent run times, tool-call counts, and reports (71 s, 9 calls; 39 s, 2 calls), and the R26-01 claim that `CLAUDE.md` reached the helper.
- `plant-defects.py` (39 planted, 38 caught) and the "29 measured contrast pairs" (I found 18 for the plain start, 20 at most per Direction, 28 distinct across them; not reconciled).
- Whether a quiet button on `--surface-2` meets 3 to 1 (`#8a8f9b` on `#f1f2f4` is 2.89, `#8a8f9b` on `#fbfbfc` is 3.13); the test measures the real background and I did not run it.
- Package release dates and licences in DECISIONS (needs network).
- The living-reference script's structure check (it lives outside the repository).
- Research-record and knowledge-base content, red-team reports, and any finding I did not open.
- Remaining PLAN prose beyond the status statements I quoted.
