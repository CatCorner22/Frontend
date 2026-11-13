# Charter: fourth red-team review of the Studio (campaign 4)

Written 2026-11-13 by the lead, before any attack. "Default" marks a value that the sponsor did not set and that the lead took from the method's defaults.

**How this campaign differs from the first three reviews.** The first three reviews used three reviewers who each wrote a report and graded their own findings. This campaign follows a stricter method: six independent attackers ("lanes"), each with one kind of attack; a separate judge, who never attacks, reproduces every claimed result before it counts; and the lead never judges. The purpose of the separation is the same as in a laboratory: the person who runs the experiment does not grade it.

**A conflict the sponsor must know.** The lead wrote the Studio. In this method's words, the lead is "Blue" (the side that owns the target). To keep the attack independent, each lane's instructions hold only its attacker's character, the one area to attack, and the rules below. The instructions carry no hint about where the lead thinks the Studio is strong or weak. Anything the lead says in the Studio's defence appears only under a heading "Blue's response", after the judge's findings are written.

## 1. Exam question

Can a person who uses the Studio in ordinary or careless ways, or who opens a hostile project file, make the Studio (a) lose or change saved work without saying so, (b) show a statement that is not true, (c) run code or reach the network, or (d) reach a state from which the person cannot continue?

## 2. Target pin

- Repository `catcorner22/frontend`, branch `claude/brave-mayer-sawqz9`, commit `47bc15b`, dated 2026-11-13.
- The built single-file page from that commit: `refraction-studio.html` (the page the owner uses) and `local-test.html` (the same Studio, built for the browser tests). First 16 characters of the SHA-256 of `refraction-studio.html`: `176e993afaec8839`.
- Browser: the pre-installed Chromium that Playwright 1.63.0 drives. Other browsers are not tested (a stated limit).

## 3. Target map

| Part | What it is | Where |
|---|---|---|
| Opening a project file | The owner picks a JSON file; the Studio checks it and loads it | `packages/core/src/project.ts`, `apps/studio/src/store.ts` |
| Saving in the browser | Every change is saved to the browser's storage; kept copies; two tabs | `apps/studio/src/platform.ts`, `apps/studio/src/store.ts` |
| Steps and the engine | Picking Options, sliders, Undo, "Back to this Direction's value", generated Directions, the address after `#` | `packages/core/src/engine.ts`, `apps/studio/src/App.tsx` |
| The Mockup preview | An HTML page with no script, drawn in a locked frame from the design's values | `packages/core/src/templates/`, `packages/core/src/tokens.ts` |
| Contrast checks | "Off", "Warn me", "Fix for me": the Studio measures color pairs and states results | `packages/core/src/tokens.ts`, `packages/core/src/color.ts` |
| Summary and downloads | The list of Decisions, the downloads, the kept copies | `apps/studio/src/App.tsx` |
| The records | `PROGRESS.md`, `DECISIONS.md`, `redteam/FINDINGS.md`: statements about what was tested and fixed | repository root |
| New on this pin | Four Directions and the background Option "Field of stars" (decision D42) | `packages/core/src/catalog/` |

Weakest links first (the lead's map, not a hint to lanes): the Studio has one user and no server, so the realistic ways to fail are the owner's own browser (full storage, two tabs, an old saved project), a file from somewhere else, and statements that drift from the code.

## 4. Adversaries

| Adversary | Goal | Means | What winning looks like |
|---|---|---|---|
| The stranger's file | Harm the owner through a project file that the owner opens | Any bytes in a `.json` file | Script runs, a request leaves the page, the Studio breaks, or saved work is replaced without a question |
| The hurried owner | Get work done fast; never reads notices | Fast clicks, two tabs, Back button, refresh, full storage | Work is lost or changed and the Studio still says "Saved", or says nothing |
| The doubting auditor | Catch the Studio or its records in an untrue statement | The page as drawn, the code, the records | One statement that the page or the code contradicts |
| The newcomer (wildcard) | Use the Studio with no design or software knowledge | A phone-sized window, 200% zoom, the keyboard, random clicking | Stuck, lost, or looking at something broken or unreadable |

## 5. Rules of engagement

- In scope: the two built pages named in the pin, opened as local files; the source code of the pin, read and run locally.
- Forbidden: any system that is not the owner's (no third-party site, no network attack); the owner's private page and its stored data; the main working copy of the repository (a lane works only in its own copy); any change pushed to GitHub; any live secret in a report.
- A lane may write and run its own scripts. A lane may not change the Studio's code to make an attack work, except to plant a defect on purpose in order to test whether the tests notice it (and it must say so).
- Budget for each lane in a round: at most 30 runs against the page, about 40 tool calls (default: 30 target calls).
- Stop conditions: the budget is spent; or the sponsor stops the campaign.

## 6. What counts as a finding, and how severe

A finding is behavior that the judge reproduced and that breaks a requirement in the exam question. "I do not like this" is not a finding (default definition).

| Level | Meaning for this Studio | Project word (hard rule 12) |
|---|---|---|
| S3 | Saved work is lost or changed without a statement; code runs; a request leaves the page | Blocker |
| S2 | The Studio states something untrue that the owner would rely on (a false "Saved", a false pass); a guard is bypassed | Major |
| S1 | Wrong but contained: a wrong label, a broken layout, a dead end with a way out | Minor |
| S0 | For information | Note |

## 7. Coverage grid

Nine cells. Budget: 6 lanes in round 1, so 6 of 9 cells (67%) are reachable in round 1; the method asks for 60% or more.

| # | Part × goal × style | Round 1 |
|---|---|---|
| 1 | Opening a project file × run code or reach the network × hostile data | lane A |
| 2 | Opening a project file × lose or corrupt work, or crash × hostile data | not assigned |
| 3 | Saving in the browser × lose work silently × volume (full storage, many copies) | lane B |
| 4 | Saving across tabs and time × an untrue "Saved" or a lost change × order and timing | lane C |
| 5 | Steps and the engine × a Decision that does not match the design × order and timing | not assigned |
| 6 | The Mockup preview × break out of the stylesheet or the locked frame × abuse of trusted inputs | lane E |
| 7 | Statements by the Studio and the records × make one untrue × checking claims against reality | lane D |
| 8 | The whole Studio, with the new Directions × stuck, broken, or unreadable × low-tech use | lane F (wildcard) |
| 9 | Summary and downloads × a wrong or misleading file × low-tech use | not assigned |

Cells 2, 5, and 9 go untried in round 1. The retest round's extra lane takes one of them.

Attack families covered (five of the method's nine; one lane each, the wildcard counts as low-tech): hostile data from outside (A), volume (B), order and timing (C), checking claims (D), abuse of trusted inputs (E), low-tech (F). Left out, with reasons: persuasion and role-play, hijacking an agent's goal (the Studio contains no AI model at run time); non-technical document attack (the target is software).

## 8. Budget

- Rounds: at most 2 (default allows 3): round 1, then one retest round after fixes.
- Agents in round 1: 6 lanes and 1 judge = 7. Retest round: the lanes whose findings were fixed, 1 new lane, 1 judge.
- Expected cost: about 1.0 to 1.4 million tokens for round 1 and about 0.4 to 0.6 million for the retest. Basis: the third review's three reviewers used about 595,000 tokens. This is an estimate, not a measurement.
- Lanes and judge run on a different AI model from the lead, as in decision D34, so that the attackers do not share the lead's blind spots.

## 9. Judge

A separate AI assistant, in its own copy of the repository, with no part in the attack. The lead removes from every attempt the lane's name, its character, and its own opinion of success, and gives each attempt an anonymous number. The judge reproduces each attempt against the pin (the Studio is deterministic, so one identical re-run confirms). The judge prefers to miss a finding over confirming a false one. No lane sees the judge's output during the round.

## 10. Two departures from the method, and why

1. The method says to keep red-team files out of the repository. Hard rule 12 of this project says to log findings in `redteam/FINDINGS.md`, and the repository is private. The project's rule governs: this campaign's files are committed under `redteam/campaign-4/`, and each finding also gets a row in `redteam/FINDINGS.md`.
2. The method names its log `redteam/findings.md`. This project already has `redteam/FINDINGS.md`; on a Windows or Mac disk the two names are the same file. This campaign's log is therefore `redteam/campaign-4/findings.md`.

## 11. Sponsor

The owner of the repository commissions this campaign ("Please test it to break it then catalog and fix all bugs, issues, etc.", 2026-11-13), reads the report, and decides on any risk that stays open. The lead fixes what the owner's standing rules allow and brings every other decision to the owner.
