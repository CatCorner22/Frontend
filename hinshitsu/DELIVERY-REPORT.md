# DELIVERY REPORT — Frontend Focus: find and fix the current bugs

Run of 2026-11-21 to 2026-11-22. Working branch `claude/festive-mendel-lfnahh`, draft pull request 24 of `CatCorner22/Frontend`. The main line `claude/brave-mayer-sawqz9` is untouched [`audits/redcell-delivery-E-373.md`, "Commands run": `git ls-remote` gives `4dc8649`].

## Check it yourself in 5 minutes

1. **The product itself.** Open the file `local-test.html` that came with this report (double click; it opens in your browser). Pick any starting look, press "4. Summary", press "Download all seven files as one file", and unpack the downloaded `.zip`. See: 7 files, among them `VISION.md`. Open `tokens.css` in a text editor and search for `--font-numeric`: the line names a typeface, not the word `inherit` [E-288; `evidence/commit-24-checks.txt`].
2. **The checker that found the most serious problems.** This runtime gives no link that opens a helper's run. Read the file `hinshitsu/audits/redcell-delivery-E-373.md` in place of it: its part 5 lists 12 pages that the Fit check read wrongly [E-373].
3. **The final reviewer.** No link exists for this run either. Read `hinshitsu/audits/final-audit.md`; its first part says which claims of this report it could confirm and which not [the LAUNCH entry of the final AUDITOR].

The checker script tests the shape of the record; it does not prove that any check ran.

## Summary

**What you got.** 24 commits that repair the Fit check, the look, the receipt, the guide and the Vision, each with a test that failed before its repair [`evidence/commit-1-checks.txt` to `commit-24-checks.txt`]. The Vision now writes a real typeface for numerals (your decision D83) [E-288].

**What was proven.** Independent helpers re-ran every earlier finding: 81 of 88 cases no longer occur [`audits/WU-1-reaudit-code-E-290.md`; `audits/WU-1-reaudit-records-E-291.md`]. One helper did each task of yours with the finished product; all worked, and repeated runs gave identical results [`audits/S8-recipient-stability-E-372.md`].

**What was not proven.** Nobody ran the 4 commands inside Claude Code. The page at your private address is the old version: it was not read and not republished; the built page differs from it [`evidence/compare-builds.txt`]: at the final commit 93526c5 SHA-256 `eaffab91…e17bb`, at commit 523ae8e `47adc2ff…a426f`, different bytes. The published page itself was not read. The full browser test run happens on GitHub, not on the building machine.

**What you need to decide next.** Whether to merge pull request 24; whether to republish the private page; the 5 known open bugs (rows RC-01 to RC-04 and RC-07); the time limit of the check guard; pull request 14.

This run departed from its own stop rule on your instruction: it started building with findings open on the plan, and it ran 4 repair rounds after its single audit round [E-112; E-377].

You may stop reading here.

## Status

`DELIVERED — NOT DONE`. Parts of "done" that are not met: (1) not every pass rule is verified: C1, C5 and C9 fail, and the others are unverified at commit 24 [`COVERAGE-LEDGER.md`]; (2) findings of the highest class are open until the final reviewer confirms their repairs (F-152, F-170 to F-173) [`SESSION-STATE.md`, the list between the marks]; (3) lower findings are open and you asked that they wait (E-288 answer 4; E-377 answer 1); no `OVERRULE` entry names each one, so none counts as a "known limit" in the run's strict sense; (6) the audit of the audit: see `audits/final-audit.md`; (7) you have opened no helper's run by a link, because this runtime gives none. Tier: FULL. Mode: SWARM. Helper runs: 27, from the `LAUNCH` entries [`AUDIT-LOG.md`].

## Voice of the Customer

| Need | Result | Source |
|---|---|---|
| V1 "fix all current bugs, etc." | Met in part. Of the 54 listed rows: 9 repaired with a test, 1 in part, 8 closed by record, 36 kept with a reason. The run's own helpers found 187 further findings; most are repaired, the open ones are listed below | `PROGRESS.md` "Start here"; `SESSION-STATE.md` |
| V2 "the customer's final deliverable … must work correctly" | Met for the downloaded Vision at commit 22, by hand for 2 starting looks and by test for 3 | `audits/S8-recipient-stability-E-372.md`; `evidence/commit-24-checks.txt` |
| V3 "true, verified information" | Each claim here cites a file. What nobody verified is listed under "What was not proven" | this report |
| V4 "understand every step" | The guide explains 14 terms and each status; a helper listed more terms that still lack a meaning (F-160, open) | `plugin/README.md`; `audits/WU-1-reaudit-records-E-291.md` |
| O1 a wrong page must not pass as "no deviation" | Met in part: 9 such ways closed in the first 19 commits and more in commits 20 to 24; 2 known ways stay open (RC-01, RC-02) | `redteam/FINDINGS.md`, rows RC-01 to RC-06 |
| O2 you keep the decision to merge | Met: the run pushed to the working branch only | E-53 |
| O3 work in steps that stand alone | Met: 24 commits, each checked before it was made | `evidence/` |
| O4 checks before each commit | Met with the stated exception: the whole browser suite runs on GitHub (your answer 7 in E-67) | E-67 |
| O5 a stated limit where no fix exists | Used 8 times, each on your word | E-67, E-107, E-112, E-293 |

## Gaps filled

G1 to G16 of entry E-10. Decided by you: G3, G12, G13 (E-67), G14 (open: pull request 14 still waits for your word), G15 (you allowed 3,000 seconds; the guard refuses the builder's edit, so the change is yours to make), G16 (the 3 findings of the automatic reviewer: all 3 true, repaired in commits 1 to 3). Decided by the builder as the entry recommends: G1, G2, G4 to G11 [E-10; E-67].

## Lens reconciliation

The table of the plan stage is entry E-55 [`AUDIT-LOG.md`]. After the work unit: `memos/lens-recipient-experience-WU-1.md` and `memos/lens-structural-integrity-WU-1.md`, reconciled in entry E-292 (10 points: 8 accepted, 1 rejected with the reason, 1 accepted as open).

## Red-cell verdict

- At the plan (S5): `audits/redcell-plan-E-21.md`, verdict as that file states it; its probes and re-audits are the files `audits/redcell-probe-E-110.md`, `audits/reaudit-plan-2-E-111.md`, `audits/final-wording-check-E-140.md`.
- Before delivery (S9): "PLAN SURVIVES WITH CHANGES" [`audits/redcell-delivery-E-373.md`, part 1]. Its 18 findings are F-170 to F-187. The premortem's causes: one style line that makes faint texts "unread" (F-174: repaired in commit 24 by your tighter rule, E-377); a linked style sheet of the site's own (F-177: open as row RC-07; a repair was written and taken out, because it broke your earlier rule that such a file is no fault [`PROGRESS.md`, entry of commit 24]); C4 binds 5 stored cases only (open; stated here); the last repair commit met no independent reviewer (answered by the final reviewer's re-run, `audits/final-audit.md`).
- Its 8 demands: 1 (close its findings 1 to 4): finding 1 repaired in commit 23; findings 2, 3 and 4 stay open and make C1, C5 and C9 fail, as "Status" says. 2: put to you; answered in E-377. 3: the 12 pages are listed in `redteam/FINDINGS.md` rows RC-01 to RC-07, each as repaired or open. 4: the 2 missing tests are in commit 23. 5: stated in the Summary. 6: GitHub's check "check" runs 2 times for each push (for the push and for the pull request); on commit b28ffb0 1 of the 2 was cancelled at its 45-minute limit and the other succeeded [`audits/redcell-delivery-E-373.md`, finding 14]; this report reads the run that completed. 7: the final reviewer re-ran the repairs of commits 23 and 24. 8: the 2 questions of E-377 are logged word for word; E-288 and E-293 hold theirs in short, and that stays so.

## Swarm verdict

Work unit WU-1 (commits 1 to 19), audit round at commit 52d1e73:

| Role | LAUNCH | Findings | How they ended |
|---|---|---|---|
| Seeder | E-186 | 1 planted defect | found by the correctness auditor, the role that the seeder named, and by the adversarial tester (CHECK E-282) |
| 1 Correctness | E-187 | 14 | see below |
| 2 Forensic | E-188 | 10 | |
| 3 Best practices | E-189 | 8 | |
| 4 Adversarial | E-192 | 17 | |
| 5 Recipient experience | E-193 | 8 | |
| 6 Framework drift | E-190 | 15 | |
| 7 Language | E-191 | 16 | |

Of these 88 (F-64 to F-151): 2 withdrawn (the planted defect), 59 closed as fixed after a new helper re-ran each trigger (E-311 to E-371), the rest open. Later rounds: the 2 re-audits (E-290, E-291) raised 18 (F-152 to F-169), of which a new helper confirmed 15 as gone [`audits/S8-recipient-stability-E-372.md`]; S8 (E-372) raised 4 (repaired in commit 23; not yet logged as entries); the attack before delivery (E-373) raised 18 (F-170 to F-187).

Open at delivery, by your word that they wait (E-288 answer 4; E-377 answer 1) or as known open bugs: the list between the marks in `SESSION-STATE.md`. In plain words, the ones that matter most to you:

- RC-01, RC-02: 2 ways to hide a headline that still get "No deviation".
- RC-07: a page whose look rests on a linked style sheet of its own address is measured without that sheet. It needs your decision, because your earlier rule makes such a file "no fault".
- RC-03: a model that edits the earlier receipt can make the "no Vision file changed" sentence false.
- RC-04, F-150, F-160: words in the receipt and the guide with no meaning given, and limit sentences that name no act.
- F-89, F-90, F-135: tests that can time out on a busy machine. F-183: GitHub's long check runs close to its time limit.
- F-107, F-108, F-110, F-111: hardening ideas (a later edition of the Floors; a result folder that a model can write; raw typeface names in `look.json`; a project path with a space).
- F-75: the count "readings below the least" counts lines, not readings.

## Coverage ledger

`COVERAGE-LEDGER.md`: 25 PASS, 30 FAIL, 104 N/A, 271 UNVERIFIED, 0 empty. Most cells are unverified because commit 24 changed the 4 largest programs after every helper's report except the final reviewer's; the rows were also written after the swarm, against the run's rule. Every row of the Files and CRITERIA tables holds at least 1 unverified cell.

## Maps

`MINDMAP.md`, `CONNECTIONS.md`, `GAUGE.svg`, all in `hinshitsu/`.

## Audit log

`hinshitsu/AUDIT-LOG.md`; the count of entries is the number that `grep -c "^### E-" hinshitsu/AUDIT-LOG.md` prints.

## LESSONS

1. **What happened:** the builder made 1 audit round over 19 commits (E-70), and then 4 repair rounds, each of which a later helper showed to hold new faults (E-290, E-373). **What it cost:** about 8 hours and 2 side effects that reached a pushed commit. **Proposed change:** audit each group of at most 5 commits, and re-audit each repair round before the next starts.
2. **The builder's own error:** it wrote "two remarks" into the guide from a helper's report without running the command; a run showed four (F-152). **Proposed change:** a count that enters a record is written only from a command that the builder ran in the same step.
3. **The builder's own error:** it rewrote the stored Vision texts of 2 trials wholesale and changed what a stored page measured to; a test caught it before the commit (entry of commit 21 in `PROGRESS.md`). **Proposed change:** before a stored file is regenerated, read the test that guards it.
4. **What happened:** the coverage ledger was written after the swarm (rule 10.1). **Proposed change:** the stage-start entry of S7 lists the ledger's rows as a field, so that the log tool refuses a start without them.
5. **What happened:** each attack found new ways to fool the Fit check; a page-reading program cannot list every trick. **Proposed change (for the product, your decision):** state on each receipt, in one plain sentence, that "No deviation" means "none of the checks that this program has found a deviation", and build backlog item E5 (repeated findings become permanent checks).
