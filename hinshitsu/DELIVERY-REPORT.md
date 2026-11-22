# DELIVERY REPORT — Frontend Focus: find and fix the current bugs

Run of 2026-11-21 to 2026-11-22. Working branch `claude/festive-mendel-lfnahh`, draft pull request 24 of `CatCorner22/Frontend`. The main line `claude/brave-mayer-sawqz9` is untouched: its head is `4dc8649` [`audits/final-audit.md`, part "C9 and C5"].

This is the second text of this report. The final reviewer read the first text and found errors in it [`audits/final-audit.md`, new findings 1, 2 and 8]; this text corrects them. No independent reviewer has read this second text.

## Check it yourself in 5 minutes

1. **The product itself.** Open the file `local-test.html` that was sent to you with this report (double click; it opens in your browser). Pick any starting look, press "4. Summary", press "Download all seven files as one file", and unpack the downloaded `.zip`. See: 7 files, among them `VISION.md`. Open `tokens.css` in a text editor and search for `--font-numeric`: the line names a typeface, not the word `inherit` [`audits/final-audit.md`, table "Claims and citations", row "Step 1"].
2. **The checker that found the most serious problems.** This runtime gives no link that opens a helper's run. Read the file `hinshitsu/audits/redcell-delivery-E-373.md` in place of it: its part 5 lists 12 pages that the Fit check read wrongly [E-373].
3. **The final reviewer.** No link exists for this run either. Read `hinshitsu/audits/final-audit.md`: its part "Verdict" says in 12 lines what passed and what failed [E-419].

The checker script tests the shape of the record; it does not prove that any check ran.

## Summary

**What you got.** 24 changes to the programs (a "commit" is one saved change), each checked before it was saved, and 1 change to records alone [`audits/final-audit.md`, part "C9 and C5"]. Most hold a repair with a test; 3 hold only a test or only records. The Vision now writes a real typeface for numerals, by your decision [E-288].

**What was proven.** Independent helpers re-ran 65 of the 88 findings of the first review, case by case: 81 of 88 cases no longer occur [`audits/WU-1-reaudit-code-E-290.md`; `audits/WU-1-reaudit-records-E-291.md`]. One helper did each of your tasks with the product as it stood 2 changes before the end; all worked, and repeated runs gave identical results [`audits/S8-recipient-stability-E-372.md`]. The final reviewer re-ran the saved checks; all gave the saved results [`audits/final-audit.md`, part "Commands re-run"].

**What was not proven.** Nobody ran the 4 commands inside Claude Code [`audits/S8-recipient-stability-E-372.md`, last part]. The page at your private web address is the old version; nobody read it. The page built from this work differs from a build of that old version [`evidence/compare-builds.txt`]: checksums `eaffab91…e17bb` (now) and `47adc2ff…a426f` (old), different bytes. The published page itself was not read.

**What you need to decide next.** Whether to merge pull request 24 (take this work into your main line); whether to publish the new page; the known open bugs below; the time limit of the check guard; pull request 14.

This run departed from its own stop rule on your instruction: it began building with findings open on the plan, and it ran 4 repair rounds after its one review round [E-112; E-377].

You may stop reading here.

## Status

`DELIVERED — NOT DONE`. Parts of "done" that are not met:

1. Not every pass rule is verified. C1, C5 and C9 fail; the others are unverified at the last change [`COVERAGE-LEDGER.md`].
2. Findings of the highest class are open: F-162 (the touch-phone limit; you accepted it in E-293), F-171 (row R-S08 is called repaired and holds an open rest), F-172 and F-200 (the repair rounds are more commits than rule C5 names; commit 19 stands in no list), F-173 (findings stay open) [`SESSION-STATE.md`, the list between the marks]. F-192 and F-193 are errors of this report's first text, corrected here and confirmed by nobody.
3. 70 findings are open in all: 7 of the highest class, 29 defects, 12 fragilities, 22 of style [`SESSION-STATE.md`, the list between the marks]. You said that the lower ones wait (E-288 answer 4; E-377 answer 1). No entry names each one with your words, so none is a "known limit" in the run's strict sense.
5. This report may still hold a claim that its citation does not carry; the first text did.
6. The audit of the audit failed in parts (a), (b), (d), (e) and (h) [`audits/final-audit.md`, "Verdict"].
7. You have opened no helper's run by a link, because this runtime gives none.

Tier: FULL. Mode: SWARM. Helper runs: 27, from the `LAUNCH` entries [`audits/final-audit.md`, part "Launches and reports"]. No language reviewer read this report (2 runs of the planned 30 are left; you set the end of the run in E-377).

## Voice of the Customer

| Need | Result | Source |
|---|---|---|
| V1 "fix all current bugs, etc." | Met in part. Of the 54 listed rows: 9 repaired with a test, 1 in part, 8 closed by record, 36 kept with a reason. The run's helpers raised 204 findings in all; 134 are closed, 70 open | `PROGRESS.md` "Start here"; `SESSION-STATE.md` |
| V2 "the customer's final deliverable … must work correctly" | Met for the downloaded Vision as it stood at commit 22, by hand for 2 starting looks; the test of the download passes at the end | `audits/S8-recipient-stability-E-372.md`; `audits/final-audit.md`, "Commands re-run" |
| V3 "true, verified information" | Not met for the first text of this report (3 false statements); corrected here. What nobody verified is listed above | `audits/final-audit.md`, new findings 1, 2, 8 |
| V4 "understand every step" | Met in part: the guide explains its 14 required terms and each status; helpers listed more terms that still lack a meaning (F-160, F-150, open) | `audits/WU-1-reaudit-records-E-291.md`, new finding 9 |
| O1 a wrong page must not pass as "no deviation" | Met in part: the ways that the reviews showed are closed except those listed under "Known open bugs" | `redteam/FINDINGS.md`, rows RC-01 to RC-07 |
| O2 you keep the decision to merge | Met | `audits/final-audit.md`, "C9 and C5" |
| O3 work in steps that stand alone | Met: 25 commits | the same |
| O4 checks before each commit | Met with the stated exception: the whole browser suite runs on GitHub (your answer 7 in E-67). On GitHub each push starts the long check 2 times; on each of the 8 newest commits 1 of the 2 was stopped at its 45-minute limit and the other succeeded, except 1 records-only commit where both were stopped | `audits/final-audit.md`, "C9 and C5" |
| O5 a stated limit where no fix exists | Used on your word each time | E-67, E-107, E-112, E-293 |

## Gaps filled

G1 to G16 of entry E-10. Decided by you: G3, G12, G13 (E-67); G14 (open: pull request 14 waits for your word); G15 (you allowed 3,000 seconds; the guard refuses the builder's edit, so the change is yours to make); G16 (the 3 findings of the automatic reviewer: repaired in commits 1 to 3). Decided by the builder as the entry recommends: G1, G2, G4 to G11 [E-10; E-67].

## Lens reconciliation

The table of the plan stage: entry E-55. After the work unit: `memos/lens-recipient-experience-WU-1.md` and `memos/lens-structural-integrity-WU-1.md`, reconciled in entry E-292 (10 points: 8 accepted, 1 rejected with the reason, 1 accepted as open) [`audits/final-audit.md`, "Claims and citations"].

## Red-cell verdict

- At the plan: `audits/redcell-plan-E-21.md`; its probes and re-audits: `audits/redcell-probe-E-110.md`, `audits/reaudit-plan-2-E-111.md`, `audits/final-wording-check-E-140.md`.
- Before delivery: "PLAN SURVIVES WITH CHANGES" [`audits/redcell-delivery-E-373.md`, part 1]. Its 18 findings are F-170 to F-187. Its 3 attacks on premises that the run had not written down each count [`audits/final-audit.md`, part "RED CELL attacks on unflagged PREMISES"].
- The premortem's causes: one style line that makes faint texts "unread" (repaired in commit 24 by your tighter rule; confirmed by the final reviewer); a linked style sheet of the site's own (open, row RC-07); rule C4 binds 5 stored cases only (open); the last repair commit met no reviewer (the final reviewer re-ran commits 23 and 24) [`audits/final-audit.md`, part "The repairs of commits 23 and 24 re-run"].

## Swarm verdict

Review round on commits 1 to 19: 7 roles and a seeder, 88 findings (14, 10, 8, 17, 8, 15, 16) [`audits/final-audit.md`, "Claims and citations"]. The planted defect was found by the role that the seeder named (E-282). Later: 2 re-audits (18 findings), the recipient-side check (4), the attack before delivery (18), the final reviewer (13). Before the round, at the plan: 63.

**Known open bugs, in plain words** (each is a row or a finding; nothing here is repaired):

- RC-01, RC-02: 2 ways to hide a headline. Where your Vision does not require contrast they still get "No deviation".
- RC-05, in part: a line break directly before a highlighted word of the headline, and a rounded square of an icon drawn larger than 24 pixels, give a false alarm [`audits/final-audit.md`, new findings 3 and 4].
- RC-07: a page whose look rests on a linked style sheet of its own address is measured without that sheet. Your earlier rule makes such a file "no fault", so this needs your decision.
- RC-03: a model that edits the earlier receipt can make the sentence "no Vision file changed" false.
- F-196: where a page holds an unread text that your sample website does not hold at all, the receipt says the text "is readable in the Vision's Mockup". The status (1) is right; the sentence is wrong.
- RC-04, F-150, F-160: words in the receipt and the guide with no meaning given; limit sentences that name no act.
- F-183: GitHub's long check runs at about 41 of its 45 minutes. F-89, F-90, F-135: tests that can time out on a busy machine.
- F-107, F-108, F-110, F-111: hardening ideas.
- The run's own records: its mind map is a stub (F-202); rule C5 does not name commit 19 (F-200).

## Coverage ledger

`COVERAGE-LEDGER.md`: 25 PASS, 30 FAIL, 104 N/A, 271 UNVERIFIED, 0 empty [`audits/final-audit.md`, "Claims and citations"]. 1 of the 25 PASS cells is stale by the ledger's own rule (the stored trials; the final reviewer's own run found them equal) [`audits/final-audit.md`, new finding 12]. The rows were written after the review round, against the run's rule.

## Maps

`MINDMAP.md` (a stub above a list of findings; F-202), `CONNECTIONS.md`, `GAUGE.svg`, all in `hinshitsu/`.

## Audit log

`hinshitsu/AUDIT-LOG.md`. The count of entries is what `grep -c "^### E-" hinshitsu/AUDIT-LOG.md` prints.

## LESSONS

1. **What happened:** 1 review round over 19 commits (E-70), then 4 repair rounds; each later check found new faults in the round before it (E-290, E-373, E-419). **Proposed change:** review each group of at most 5 commits, and re-check each repair round before the next begins.
2. **The builder's own error:** it wrote "two remarks" into the guide from a helper's report without running the command; a run showed four (F-152). **Proposed change:** a count enters a record only from a command that the builder ran in the same step.
3. **The builder's own error:** the first text of this report said "each with a test that failed before its repair" of all 24 commits, and named a closed finding as open (F-192, F-193). **Proposed change:** each sentence of the Summary is written from a command's output that stands beside it, and the report is drafted only after the last log entry.
4. **The builder's own error:** it called a repair done on a test that used an easier page than the reviewer's own (RC-05). **Proposed change:** a repair's test uses the reporter's exact page.
5. **What happened:** the coverage ledger was written after the review round (rule 10.1). **Proposed change:** the start entry of the build stage lists the ledger's rows.
6. **What happened:** each attack found new ways to fool the Fit check. A program that reads pages cannot list every trick. **Proposed change (your decision):** each receipt says in one plain sentence that "No deviation" means "none of this program's checks found one"; and build backlog item E5 (repeated findings become permanent checks).
