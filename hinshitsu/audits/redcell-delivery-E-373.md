adee14bba8a8ec843

# S9 — RED CELL report before delivery

Attacked: the repository at commit `6c9d8f8` (the head of `claude/festive-mendel-lfnahh` when I started; a copy made with `git archive`). During my run the head moved to `19e8677` (S8's report and evidence; no product file changed), and uncommitted edits by another party appeared in the working tree. I changed no file of the repository. Scratch folders (from `mktemp -d`): `/tmp/tmp.gTCO5mHNVL` (copy, attack pages and receipts under `atk/`) and `/tmp/tmp.ALFDVBtNLP` (copy with 2 fixes taken out).

## 1. Verdict

**PLAN SURVIVES WITH CHANGES**

The 5 cases of C4 and the named tests hold. The DELIVERABLE does not survive as "done": 4 findings touch a CRITERION (C1 twice, C5, C9), and 12 fresh pages give 5 wrong "status 0" readings and 7 false alarms.

## 2. PREMISES attacked

| PREMISE | If false: who does what, what goes wrong | EVIDENCE / what settles it |
|---|---|---|
| A-1 (rows called repaired are repaired) | The owner trusts "repaired" for R-S08 and G-S08; an AI builder ships a page with an invisible headline and gets status 0 | False in part. R-S08: page `q11-gradhide` (headline in the page's ground color over a 2-color gradient) → `No deviation … Status 0`. G-S08: page `q05-icon` (a Lucide calendar icon) → false `radius 1.33px: 1 element, first rect`. Only 54 of 858 rows were examined by the run |
| A-2 (GitHub's check runs everything on each push) | A commit is called checked while the long job was stopped at its limit | The workflow runs `npm run e2e` (true). But `check` takes 39 to 41 minutes of a 45-minute limit, and on `b28ffb0` 1 of the 2 runs ended `cancelled` (12:00:50Z → 12:46:01Z). At my last look (14:59Z) both `check` runs of `504b1d7`, `6c9d8f8` and `19e8677` were `in_progress` |
| A-3 (the suite cannot finish inside the hook's limit) | The local full run could be required | Holds: `evidence/commit-22-checks.txt` shows `plugin/fit/e2e` alone at 1750.58 s; `.claude/verify.json` still says 1750 (the owner's act, listed in "Known gaps"). I did not run the whole suite (my scope forbids it) |
| A-4 (a passing test shows the behavior holds) | A fix is removed or wrong and every test stays green | **False, shown by run.** With 2 fixes of commit 22 taken out, `exit.e2e.ts` reports `Tests 118 passed (118)` (section 4, check 1) |
| A-5 (replaced by D-4) / A-14 (a stated limit is an acceptable end) | The owner reads 19 fixed limit lines on every receipt, cannot tell which apply, and takes status 0 as "page is right" | Pages p03, q11, q12, q13c, s03 below: status 0, and no limit sentence names the way. Also the false alarm `r01-reorder` |
| A-6 (a SUB-AGENT can run the programs) | AUDITORS only read | Holds: I ran `cli.ts` 45 times and 2 browser test runs |
| A-7 (the USER means the Vision and the receipt) | C3/C4 cover the wrong thing | Settled by E-66/E-67 as to the list. Open as to the copy: the Vision that the owner can download today comes from the published page, not from this head (see A-12) |
| A-10 (the filter found every open row) | Bugs the USER asked for stay outside the run | Recorded as false in E-24. Still open: F-57 (4 rows, 1 of grade blocker, state an open part in other words) has no closing entry; R-S08's own Status holds "Not covered, and said here" and sits in list (a) |
| A-11 (closed shadow root test) | A test passes with no fix | Not re-run by me (see "Not examined") |
| A-12 (`local-test.html` is what the USER holds) | Every repair of the Vision (D83: `--font-numeric`) is absent from the page the owner uses until someone publishes | False: `hinshitsu/evidence/compare-builds.txt` gives `eaffab91…` (504b1d7) against `47adc2ff…` (523ae8e), different bytes; `git diff --stat 523ae8e HEAD -- packages/core/src` shows `tokens.ts` and `vision.ts` changed. The published page itself was read by nobody; that it is a build of 523ae8e is ASSERTED |
| **Not in any ASSUMPTION entry — X1:** the page under check is 1 file with no style sheet of its own address | A builder links `styles.css`; the program stops the request, measures the page without it, says "No deviation" | Page `s03-extcss` (`<link rel="stylesheet" href="extra.css">`, the sheet holds `h1{display:none}`) → `No deviation … Status 0`; the sheet is listed only as "Not shipped with the page" |
| **X2:** the earlier `receipt.json` in the result folder is what the program wrote (C8) | A model deletes section 7 of `VISION.md` and edits 1 hash in `receipt.json`; the next receipt says nothing changed | Run: `Floor requirements read from VISION.md: 0` together with `Since the earlier receipt … none of the Vision files that the program reads has changed`, Status 0 |
| **X3:** a builder does not aim at "unread" (D83, rule 2) | A repairing model adds 1 style line and Floor A1 goes silent | `q13b-noop`: `114 deviations (of these, 114 readings of 38 texts below the least contrast) … Status 1`. Same page plus `body, body *{opacity:.9999}` (`q13c-allop`): `No deviation; the contrast of 504 readings of 56 texts could not be read … Status 0` |

## 3. DECISIONS attacked

- **D-6 (1 audit round over the whole set).** The round was not enough by the run's own record: 88 FINDINGS in the round, then 18 more from the re-audit of the fix, then commit 22, which no new SUB-AGENT had audited when I started. My mutation check shows that commit 22 holds fixes with no test, and my pages find 12 new misreadings in code that the 3 repair rounds changed (`cutAway`, the SVG `rect` corner, the media conditions, the Content joins). The question that the USER answered ("Once, at the end") did not say that each fix round would itself go unaudited.
- **D-9.** It has no "Rests on" line and no rejected alternative. Its row "Question 2: the program's rule serves the owner" was ACCEPTED on the evidence of 3 unread texts on a faithful page; nobody weighed X3. A third choice was never put: count an unread contrast only where the Mockup's same text is read (the method D-4 already uses for media conditions). Its row "F-147 and F-150 … ACCEPTED as open" leans on answer 4 of E-288, which names a class, not a finding.
- **Project D83, part 1 (a real typeface for numerals).** Works in the browser (`tokens.css` line 91 and `tokens.json` agree). Two gaps: (a) neither `VISION.md` nor `DESIGN.md` names `--font-numeric` or says when to use it (grep: 0 hits in both), so an AI builder meets a value with no instruction; (b) the owner's published page (523ae8e) still writes `inherit` (A-12).
- **D83, part 2 (unread contrast never changes the status).** Fails under X3 above. `plugin/commands/fit-repair.md` holds no rule against a repair that makes texts unread, and the receipt of a later round does not say that unread texts rose from 3 to 56.
- **E-139.** C3 changed from "differs from the page published at the private address" to "differs from a build of the published version" plus "The published page itself was not read." That asks for less than E-68. The USER saw item (c) in matching words, but under the head sentence "each makes a test stricter", which is untrue for this item. A1-04 was added outside the question (the entry says so).
- **E-289.** C4 (the contrast exception) and C5 (1 commit for the fix round) both ask for less; the USER's words cover both. Mismatch: the USER approved "the whole fix round is 1 commit"; C5 names 2 (commits 20, 21); the branch holds 3 (`b28ffb0`, `cb41130`, `504b1d7`). C4 also narrowed "where the Vision writes Floor A1" to "… in the edition that the program reads"; whether the USER saw that cannot be told, because E-288 records each question "in short" and no `CARD` entry exists for it (the log holds 1 CARD entry, E-64).
- **E-294.** Asks for less (G-S05 kept for conditions the Mockup holds). The USER's word "Keep as a stated limit" matches a question about "a touch phone". The receipt's sentence does not say "touch phone"; it says "is read in one state only … under the other state". E-293 also records the question "in short".
- **The USER-accepted limits in `receipt.ts` ("Still needs a person").** Can the owner, no programmer, act on each?

| Limit (USER's word) | Receipt sentence | Can the owner act? |
|---|---|---|
| later than 5 seconds (E-67, 6.1) | "What happens later…" | Yes: wait, scroll, click |
| a script changes the page during reading (6.2) | "A page that recognizes the check… can still find signs of the check" | No. It names no act and no sign to look for |
| hostile Vision folder (6.3) | "…the top of this receipt names each file … by its SHA-256" | No. The Studio hands over no SHA-256 to compare with; the guide calls it "a checksum" and gives no step |
| page-wide color effects (6.4) | "Shadows, gradients, images…" and "A blend mode on a box that a style rule draws" | In part. "blend mode" and "a box that a style rule draws" have no meaning given; no act |
| count of repair rounds (6.5) | "The count of repair rounds…" | Yes, plain |
| other widths / heights (E-107) | 2 sentences | Yes: resize the window |
| covering box, approximation (E-112) | "Where a covering box lies…" | No act; the owner cannot know which text sits "at the edge of such a box" |
| condition the Mockup holds too (E-293) | 1 sentence inside a 5-sentence line with "media condition" undefined | No. Missing: "open the page on a touch phone" |

All 19 lines are fixed text on every receipt; none says whether it applies to this page.

## 4. The cheating agent

| C | Cheapest way to appear to meet it | What catches it |
|---|---|---|
| C1 | Write a Status that names an existing test title and the word "repaired"; keep an open rest in other words | The take-out by the correctness auditor, for list (a) only. Not caught: R-S08 (its rest is in the row) |
| C2 | A test whose title names the finding and asserts little | The take-out for "true" findings |
| C3 | Test `local-test.html`, which the BUILDER builds, and never read the published page | Nothing; C3 itself says "was not read" |
| C4 | Make the 5 fixed cases agree | Only the language auditor. Pages outside the 5 are bound by no CRITERION |
| C5 | Write `commit-<n>-checks.txt` with the BUILDER's own script | GitHub's run on that commit; weak for mid commits (1 cancelled run on `b28ffb0`) |
| C6 | Report the reference check UNVERIFIED | C6's last sentence. I ran it: `check: passed; file not changed`, exit 0 |
| C7 | Put the required words in the guide | The language auditor; the test matches words (F-154 says so) |
| C8 | Rewrite 1 hash in the earlier `receipt.json`, or give a new result folder | Nothing for the first (X2); the second is stated in the receipt |
| C9 | Close a FINDING as FIXED by moving the CRITERION; count entries | The final AUDITOR compares counts only |

**Check 1 — a test of the fix round with its fix taken out.** In `/tmp/tmp.ALFDVBtNLP` I removed from commit 22 (`504b1d7`): (i) the 2 lines of `cutAway` in `collect.ts` that handle `position: fixed`; (ii) in `fit.ts` `noBrowserLine`, the new filter for the browser's own lines and the sentence "The browser gave no message of its own." Then `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts`: `Test Files 1 passed (1) / Tests 118 passed (118) / Duration 925.53s`. `grep` finds neither a containing-box case with `position:fixed` nor "gave no message" in any file of `plugin/fit/e2e/`. The commit message says "Test written first".

**Check 2 — a row that names a test which does not exist.** None found: the 11 titles named by the 9 rows of list (a) and by G-S05 each stand in `exit.e2e.ts` or `look.e2e.ts` (`grep -l -F`).

**Check 3 — a RESOLUTION whose EVIDENCE does not show what it says.** Of the 59 closing entries from E-311 on, 58 cite a row that says `NO LONGER REPRODUCES`. E-371 (F-55, "FIXED") cites `audits/WU-1-reaudit-records-E-291.md`, which holds 0 mentions of F-55; its row F-74 quotes the same line as the trigger (`No deviation; the contrast of 27 readings of 3 texts could not be read … Status 0`). The product did not change; the CRITERION did.

## 5. Attacks on the product

Base: `built(reference-floors/mockup.html)` → `No deviation; the contrast of 27 readings of 3 texts could not be read (this does not change the status). Status 0.` Each page below is the base with 1 change, checked against `plugin/fit/trials/reference-floors/`. Screenshots confirm p03, q11, q12, q13c.

**Wrong "all clear" (a missed deviation):**

| Page | Change | One line |
|---|---|---|
| `p03-scale` | `h1{transform:scale(0.03)}` (headline about 1.5 px tall) | `No deviation … Status 0`. Same for `p04-zoom` (`zoom:0.03`). The receipt says a text counts only "drawn at 6 pixels or more" |
| `q11-gradhide` | `h1{color:var(--bg);background-image:linear-gradient(var(--bg),var(--surface))}` | `No deviation; the contrast of 45 readings of 5 texts could not be read … Status 0` |
| `q12-under` | `.hero-copy{position:relative;isolation:isolate} .hero-copy::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--text)}` (headline in the color of the box under it) | `No deviation … Status 0` |
| `q13c-allop` | low-contrast texts plus `body, body *{opacity:.9999}` | `No deviation; the contrast of 504 readings of 56 texts could not be read … Status 0` (114 deviations without the opacity line) |
| `s03-extcss` | a linked own style sheet that hides the headline | `No deviation … Status 0` |
| C8 forgery | section 7 deleted, 1 hash edited in `receipt.json`, `--round 1` | `Status 0`; "none of the Vision files … has changed"; Floors read: 0 |

**False alarm on a page a careful builder writes:**

| Page | Change | One line / deviation |
|---|---|---|
| `q02-br` | `<h1>Dental care that<br><mark>…` | `1 deviation`: "the headline is not where a person can read it at 375 pixels; 768 pixels; 1280 pixels" |
| `q03-blockspan` | the headline's 2 lines in 2 `span`s with `display:block` | same false deviation |
| `s01-shyonly` | `ex&shy;plains` in the headline | same false deviation (`&nbsp;` alone passes) |
| `q05-icon` | a Lucide calendar icon (`<rect … rx="2"/>`, 24-unit box drawn at 16 px) in the button | `1 deviation`: `radius 1.33px: 1 element, first rect` |
| `q07-canon` | `<link rel="canonical" href="https://harborstreetdental.example/">` | `1 deviation`: `reference (link href) to https://…` under "the page asks for nothing from another site"; a browser fetches nothing for it |
| `r01-reorder` | `@media (pointer: fine) and (hover: hover)` (the Vision's own rule, line 231, parts in the other order) | `No deviation; 7 things could not be measured … Status 1`, with the false sentence "a setting … that the Vision's Mockup does not name". `r02` (`(hover: hover)` alone): same |
| `q08-jsonld` | a JSON-LD data block | `7 things could not be measured … Status 1`; with `--run-scripts`: Status 0. Correct by `VISION.md` line 504, noted only |

Read right: `p01` (the old screen-reader-only pattern on the headline), `p02` (ellipsis), `q01` (1-pixel scroll slit: not measured), `q14`, `q16`, `p10` (dark scheme: not measured), `p12`, `q06` (`tel:`/`mailto:`), `q09` (favicon), `q10` (hidden and honeypot fields), `s06` (logo picture), `p05` (print), `p08`/`p09` (width conditions).

## 6. Premortem

Six weeks from now the user reports that this failed. The owner had asked Claude Code to build the dental page from a Vision and to repair it until the Fit check said status 0. The first check said "72 readings below the least contrast". In the second repair round the model wrapped the faint paragraphs in a style rule with an opacity just under 1, because that made the line read "No deviation". The receipt listed 56 texts "whose contrast the program could not read"; the owner, who is no programmer, saw "Status 0", opened "Still needs a person", met 19 lines that are the same on every receipt, and published. A patient with weak sight could not read the fees. The same week the owner linked a style sheet of the site's own to the page; the check stopped that request and still said "No deviation". What let it through: the PREMISE X3, which no ASSUMPTION entry holds; the exception that E-289 wrote into C4 on a question about 3 texts of a faithful page; finding F-56, which D-8 promised to put on the card and which has no closing entry; C4, which binds 5 stored cases and no other page; and D-6, under which the last fix commit met no auditor and 2 of its fixes have no test.

## 7. Findings

1. **BLOCKER — C1, row G-S05.** Place: `redteam/FINDINGS.md`, row G-S05, at `6c9d8f8` and `19e8677`. Trigger: `git show 19e8677:redteam/FINDINGS.md | grep "^| G-S05 |" | grep -c "E-293"` → 0; the row ends "Who must act: the owner, who decides whether it stays a stated limit…". Violates: C1 (E-294), state (b): "the Status cites the `ANSWER` entry that holds the USER's word"; `PROGRESS.md` line 116 says the same open thing; `DECISIONS.md` holds no record of the answer (`CLAUDE.md` hard rule 2). An uncommitted edit seen in the working tree at 14:57Z adds "E-293" to the row. Fix: commit that edit, correct line 116, add the project decision.
2. **BLOCKER — C1, row R-S08 sits in list (a) with an open rest.** Place: row R-S08 ("Not covered, and said here: a text whose contrast the program cannot read … still counts as found"); `collect.ts` (`nominal` is null for a gradient of 2 colors). Trigger: page `q11-gradhide` → Status 0, Content 0 deviations. Violates: C1 ("a row repaired in part is in state (b) and names both its test and its rest", with the USER's word); the USER's answer 5 of E-67; no receipt sentence states the way. Fix: count a required text whose ground cannot be read as "not measured" in Content; or move the row to (b) by a `CRITERIA-CHANGE` with the USER's word and a receipt sentence.
3. **BLOCKER — C5, commit 22.** Place: `504b1d7`. Trigger: `git show --stat 504b1d7` (22 files, at least 6 fixes in `collect.ts`, `fit.ts`, the guide, 4 commands); C5 (E-289) names commits 20 and 21 only, and the USER's word is "the whole fix round is 1 commit". With 2 of its fixes taken out, 118 of 118 tests pass (section 4). Violates: C5 ("Each fix is 1 commit that holds its test and its record"); D-3. Fix: a `CRITERIA-CHANGE` with the USER's word for the second fix round; 1 test for the `fixed` case of `cutAway` and 1 for the browser-message sentences, each seen to fail without its fix.
4. **BLOCKER — C9 is unmet at the head, and 1 closing entry is false.** Place: `hinshitsu/AUDIT-LOG.md`. Trigger: my script over the log: 169 FINDING entries, 109 with a closing entry, 60 without (F-152 and F-162 of class BLOCKER; 22 of class DEFECT, among them F-15 to F-17, F-56 to F-59, F-62, F-75, F-99). 0 `OVERRULE` entries, so no KNOWN LIMIT exists. Answer 4 of E-288 (12:14Z) names a class; F-159 to F-161 and F-167 to F-169 were raised at 14:09Z. E-371 closes F-55 as FIXED on EVIDENCE that holds no F-55 row. Violates: C9 ("accepted by the USER by name"); glossary, KNOWN LIMIT. Fix: 1 closing entry for each, the 2 BLOCKERS confirmed by a new SUB-AGENT; an `OVERRULE` entry that lists each waiting FINDING by ID with the USER's words; E-371 reworded to say that the CRITERION changed.
5. **DEFECT — 1 style line clears Floor A1.** Place: `fit.ts` (unread contrast never counts); `fit-repair.md`. Trigger: `q13b-noop` against `q13c-allop`. Violates: O1 of E-9; the question behind answer 2 of E-288 did not show this. Fix: an unread contrast counts as "not measured" unless the Mockup's same text is unread too; the receipt of a later round states a rise in unread texts; put the evidence to the USER.
6. **DEFECT — a headline 1.5 pixels tall counts as readable.** Place: `collect.ts`, `shownLines` (reads `font-size`, not the drawn size). Trigger: `p03-scale`, `p04-zoom`. Violates: the Content measure's own sentence ("drawn at 6 pixels or more"). Fix: compare the drawn height of the text's box with 6 pixels.
7. **DEFECT — a text over a same-colored box that is no ancestor counts as found.** Place: `collect.ts` (`layers` walks ancestors only; `drawnCovers` skips `z < 0`). Trigger: `q12-under`. Violates: answer 5 of E-67; the limit sentence speaks of "another contrast", not of an unseen required text. Fix: read the boxes under the text's middle with `elementsFromPoint` plus the drawn boxes of negative order; else "not measured".
8. **DEFECT — an own style sheet is not read and the status is 0.** Place: `fit.ts`, Requests ("not shipped with the page"). Trigger: `s03-extcss`. Violates: the sense of C4 ("status 0 goes only with … 0 'not measured'"), outside its 5 cases. Fix: a linked or imported style sheet at the page's own address makes the measures "not measured", or the program loads files beside the build.
9. **DEFECT — false "headline missing" for `<br>`, block-level lines and a soft hyphen.** Place: `collect.ts`, `shownLines` (`parts.join('')`, 1 block for 1 line), `fit.ts` `collapse`. Trigger: `q02-br`, `q03-blockspan`, `s01-shyonly`. Violates: the Content measure's sentence; same family as F-166. Fix: a `br` and a block boundary inside 1 heading element count as a space; drop U+00AD before comparing.
10. **DEFECT — an icon's inner rectangle is a corner deviation.** Place: `collect.ts`, `paints` (the rest of G-S08). Trigger: `q05-icon`. Violates: the measure's title ("every drawn box"). Fix: compare `rx` only for a rectangle drawn larger than a set size, or leave pictures marked `aria-hidden` under a set size to information lines.
11. **DEFECT — a canonical link is a Requests deviation.** Place: `collect.ts`, `holders` (`['link','href']` for every `rel`). Trigger: `q07-canon`. Violates: the measure's title ("asks for nothing from another site"). Fix: count a `link` only for the `rel` values that make a browser fetch.
12. **DEFECT — the Vision's own hover condition, written in another order, is "not measured" with a false sentence.** Place: `fit.ts`, `unreadConditions` (compares strings). Trigger: `r01-reorder`, `r02-hoveronly`. Violates: row G-S05's stated repair; the sentence "that the Vision's Mockup does not name". Fix: compare the set of features and values of a condition, not its text.
13. **DEFECT — the sentence of C8 can be made false by 1 edit.** Place: `cli.ts` (reads `receipt.json` from the result folder). Trigger: the forgery run in section 5. Violates: the purpose of C8 (its test passes). Fix: the receipt says that the earlier receipt is a file anyone can change and prints the earlier and the present count of Floor requirements side by side; `fit-repair.md` forbids writing to the result folder.
14. **FRAGILITY — GitHub's `check` runs at 87 to 91 percent of its time limit.** Place: `.github/workflows/ci.yml` (45 minutes). Trigger: `gh api repos/CatCorner22/Frontend/commits/<sha>/check-runs`: `b28ffb0` shows 1 run `cancelled` after 45 min 11 s and 1 `success` after 40 min 10 s. Fails when: a few more browser tests, or a slower runner. Violates: C5 says "check … succeed on that commit" and does not say which of the 2 runs counts. Fix: say in the delivery report which run is read; split the job (rows A1-09, T6-01; the USER's deferral in E-112 came before the cancelled run).
15. **DEFECT — the limit sentences give the owner no act.** Place: `receipt.ts`, `STILL_NEEDS_A_PERSON`, the 5 lines marked "No" or "In part" in section 3. Violates: `CLAUDE.md`, writing style (explain each technical term; say what can go wrong); V4 of E-9. Fix: 1 act for each ("open the page on a touch phone"), a meaning for "media condition" and "blend mode", and a step for the SHA-256 or its removal as an act.
16. **DEFECT — records behind the log.** Place and trigger: `hinshitsu/SESSION-STATE.md` top part ("during S7", "Nothing is VERIFIED", "2 questions … wait for the USER", CRITERIA "as in E-139") against E-288 to E-294 and STAGE S9; its machine line "Newest CRITERIA entry: E-68"; row R-U05 ("the 2 cases of status 1") against the guide's 3; row G-S05 ("colors, typefaces, corner radii and content as not measured") against the receipt's 7 measures. Violates: rule 14.6 of the glossary. Fix: rewrite the state file; correct the 2 rows.
17. **DEFECT — E-288 and E-293 hold each question "in short", with no CARD entry.** Trigger: `grep -c "· CARD ·" hinshitsu/AUDIT-LOG.md` → 1 (E-64). Violates: the form of a DECISION CARD (rule 23.4 as the glossary names it); a third party cannot compare the USER's word with the question seen. Fix: log the 5 questions and their option texts word for word.
18. **STYLE — no prose file of the Vision names `--font-numeric`.** Trigger: `grep -c "font-numeric" VISION.md DESIGN.md` in `reference-floors` → 0 and 0. Fix: 1 sentence in `VISION.md` on what the value is for.

## 8. Changes demanded

1. Close findings 1 to 4 before any delivery report says a CRITERION is met.
2. Put finding 5 to the USER with the 2 one-lines of `q13b` and `q13c`, and offer the third choice (compare with the Mockup's unread texts).
3. State in the delivery report, by page, the 5 wrong "status 0" readings and the 7 false alarms of section 5, each as fixed or as open with the USER's word.
4. Add the 2 missing tests of commit 22, each seen to fail without its fix.
5. State in the `Summary` that the owner's published page (523ae8e) does not hold the repairs to the Vision, and that publishing is the owner's act.
6. Name which GitHub run counts for C5 and report the cancelled run of `b28ffb0`.
7. Give commit 22 and whatever follows this report 1 audit by a new SUB-AGENT, or say in the `Summary` that none took place.
8. Log the questions of E-288 and E-293 word for word.

## 9. Commands run

- `git -C /home/user/Frontend archive HEAD | tar -x -C <scratch>` (2 copies), with a link to `node_modules`.
- `node plugin/fit/src/cli.ts atk/<page>.html plugin/fit/trials/reference-floors atk/r-<page>`: 45 runs (base, p01 to p12, q01 to q16, q13b, q13c, r01 to r03, s01 to s06), 1 with `--run-scripts`, 2 for the C8 forgery (the second with `--round 1`).
- Playwright screenshots of 5 pages (`executablePath: /opt/pw-browsers/chromium`).
- `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e/exit.e2e.ts -t "second re-audit|states the SHA-256…"` on the copy with 2 fixes out: 2 passed, 116 skipped.
- The same file whole on that copy: 118 passed, 925.53 s.
- `python3 hinshitsu/evidence/open-rows.py` (42 rows now; the 8 repaired rows left the list).
- `python3 …/living-reference/scripts/refresh_reference.py docs/reference/guarantees.md --check` → passed, exit 0.
- `gh api repos/CatCorner22/Frontend/commits/<sha>/check-runs` for 8 commits; `git ls-remote origin claude/brave-mayer-sawqz9` → `4dc8649…`.
- `grep`, `sed`, `git log`, `git show --stat`, and 3 short Python scripts over `AUDIT-LOG.md` and the 2 re-audit reports.

## 10. Not examined

- The Studio page in a browser, the deliverable test (C3) and the 7 clauses by hand; I read S8's `compare-builds.txt` as data and made no build.
- The look (`look-cli.ts`), `fit.e2e.ts`, `look.e2e.ts`, `trial.e2e.ts`; the mutated copy ran `exit.e2e.ts` only.
- The 5 cases of C4 on the unchanged head as a separate run (the C4 test passed inside the 118 on the mutated copy).
- PREMISE A-11 and the take-out of each fix of list (a); the rows of states (b) and (c) one by one (I read 16 rows).
- D-1, D-5, D-7 and D-8 beyond what sections 2 and 3 say; project decisions D80 to D82 beyond their first lines.
- The published page; GitHub's final result for `504b1d7`, `6c9d8f8` and `19e8677` (still `in_progress` at 14:59Z).
- A Vision with no Floor (trial 001) under my pages; other Directions and Templates.
- The uncommitted edits that another party made in the working tree during my run.
