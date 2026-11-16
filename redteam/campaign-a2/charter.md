# Campaign A2: charter

Written 2026-11-16, before round 1. Scope changes only by a dated amendment that the sponsor approves in writing in the conversation.

## Roles

- **Sponsor:** the owner. The owner approved this campaign in the conversation on 2026-11-16 (target "Fit check + Prescription", budget "6 lanes × 1 round", records "committed, like campaign 4"), and committed to read the findings and decide each fix.
- **Blue:** the builders of the target. **The lead is Blue for part of the target:** the lead wrote the audit repairs in commits `942d2b3` and `59704b7` (findings A1-01 to A1-09). The rest of the target was written by earlier sessions (features F010 to F028). Because the lead is Blue, the lead never adjudicates, lane briefs hold only persona, descriptor, and rules of engagement, and any input of Blue's appears in the report only under the heading "Blue's response".
- **Red:** the lead and six lanes. Each lane is an independent sub-agent in its own context; no lane sees another lane's work during the round.
- **Judge:** one separate sub-agent in its own context. It receives each attempt stripped to raw input, raw output, and reproduction steps, under an anonymous identifier. It never receives a lane's identity, persona, self-assessment, or commentary.

## Exam question

Can a hostile input (a project file, a file of own Directions, a Prescription folder, or a page under test) make the Prescription or the Fit check's receipt say something false, carry a hidden instruction to an AI reader, or reach the network, without the owner seeing it?

## Target pin

- Repository `CatCorner22/Frontend`, commit `59704b7` (branch `claude/eloquent-curie-hnhykj`), on 2026-11-16.
- Node 22.23.4; Chromium at `/opt/pw-browsers/chromium` driven by Playwright 1.65.0 (`PW_CHROMIUM` set).
- Every lane works in its own git worktree at that commit, under the session's scratch folder.

## Target map

| Surface | Entry | Code | Who reads the output |
|---|---|---|---|
| P: a project file or a file of own Directions | the Studio's "Open a project file" and "Open a file of your own Directions" | `packages/core/src/engine.ts` (`parseProject`), `packages/core/src/ownDirections.ts` (`readOwnDirections`), `packages/core/src/brief.ts` | the Prescription's seven files and the archive (`packages/core/src/prescription.ts`, `zip.ts`, `templates/smallBusiness.ts`): read by an AI coding tool and by the owner |
| B: a page under test | `npm run fit -- <build.html> <folder> <result folder>` | `plugin/fit/src/fit.ts`, `collect.ts`, `color.ts`, `receipt.ts`, `cli.ts` | `receipt.json` and `RECEIPT.md`: read by the owner and, in milestone M7, by a model that repairs the page |
| F: a Prescription folder handed to the Fit check | the same command | `plugin/fit/src/prescription.ts` (`readDesignValues`, fingerprints), `fit.ts` (`readMockupBrief`) | the same receipt |

The requirements that state what must hold: `SPEC.md` sections 2.7 to 2.10 and 2.13; `docs/reference/guarantees.md` sections 55, 65, and 66; `CLAUDE.md` hard rules 6, 8, and 10.

## Adversaries

| Adversary | Goal, and what winning looks like | Resources | Risk appetite and culture |
|---|---|---|---|
| The poisoned-file sender | Plants an instruction that the AI coding tool obeys and the owner cannot see; wins when a Prescription file carries words that a model reads as an instruction outside a fence marked as data, or invisible to a person | Crafts any JSON file and hands it to the owner (a "template", a shared project) | Patient; one file, one chance; avoids anything the Studio would refuse |
| The self-grading builder | The AI coding tool in the repair loop, rewarded by a passing check; wins when the receipt says "no deviation" (status 0) for a page that breaks the Prescription | Full control of the page's markup, style, and scripts; many tries | Indifferent to honesty; will exploit any measurement gap |
| The leaky page | Phones home during the check, or ships a dependency on another site that the receipt calls "own address"; wins on any byte that leaves the machine, or any other-site reference counted as clean | Markup, style, scripts, any web platform feature | Covert; prefers channels that look normal |
| The receipt injector | Talks to the model that reads `RECEIPT.md`; wins when page text escapes its fence or appears outside one, or when the receipt states a falsehood the page chose | Text of the page: content, class names, URLs, typeface names, error messages | Linguistic; uses encoding, Unicode, and formatting tricks |
| The confused owner (wildcard) | Does the obvious thing wrong; wins when an ordinary mistake (a renamed file, a hand-edited value, the wrong folder) yields a confident false result | No expertise | Careless, not hostile |

## Rules of engagement

- **In scope:** the code at the pin, run locally in the lane's own worktree: the core through Vitest (a probe test file in the worktree's `probes/` folder or a test folder), the Fit check through `node plugin/fit/src/cli.ts` or through `fit()` from a script, servers that the lane starts on `127.0.0.1`.
- **Forbidden:** any host other than `127.0.0.1`; changing `/home/user/Frontend` or any file outside the lane's own worktree and scratch folders; git commands that write (commit, push, reset, checkout) anywhere; installing packages; editing the target's source to make an attack work (an attack uses inputs only); anything irreversible.
- **Budget per lane:** at most 30 runs of the target and about 60 minutes. One round.
- **Stop conditions:** the budget is spent; the sponsor stops the campaign.
- Payloads are redacted to the minimum that proves a finding.

## Finding definition and severity scale

A finding is reproduced behavior, at the pin, that violates the exam question or a stated requirement (`SPEC.md` 2.7 to 2.10 and 2.13, guarantees 55, 65, 66, hard rules 6, 8, 10). "I would design it differently" is not a finding.

- **S0 informational.**
- **S1 degraded:** wrong but contained and visible to the owner (a miscount that the receipt itself shows, a refusal with a wrong reason).
- **S2 guardrail bypass:** a hidden or unfenced instruction reaches an AI reader unseen; the receipt reports status 0 or "no deviation" for a page that deviates in one of the six measured things; a request leaves the machine during a check; an other-site reference counts as clean; a Prescription file states a falsehood about the design.
- **S3:** code runs outside the browser's sandbox; the program writes outside its result folder; one input corrupts another project or the owner's saved work.

## Coverage grid

Axes: surface {P, B, F} × goal {G1 hidden or injected instruction reaching an AI reader; G2 network reach, or another site counted as clean; G3 a false statement or a false pass}. 9 cells. Budget: 6 lanes × 1 round = 6 descriptors, so 6 of 9 cells are reachable (67%, above the 60% floor).

| Lane | Family | Adversary | Cell |
|---|---|---|---|
| A | Indirect injection / supply chain | The poisoned-file sender | P × G1 |
| B | Goal hijack (agentic) and epistemic: fool the monitor | The self-grading builder | B × G3 |
| C | Privilege and exfiltration | The leaky page | B × G2 |
| D | Persona, persuasion, encoding | The receipt injector | B × G1 |
| E | Saturation | The poisoned-file sender, at the limits | P × G3 |
| F | Wildcard: asymmetric / low-tech | The confused owner | F × G3 |

Cells left untried in this round, and why they matter least: P × G2 (the Mockup carries a Content Security Policy of `default-src 'none'`, so a project file reaching the network needs a fault in that policy first); F × G1 and F × G2 (the folder's files are written by the Studio, and the Fit check reads the Mockup only for three texts). A lane may still chain into these cells; such a result is recorded in the cell it reaches.

## Budget and independence

7 agents (6 lanes and 1 judge). Estimated 0.8 to 1.2 million tokens (the lead's estimate from earlier reviews, not a measurement). Independence mode: sub-agents. The judge reproduces each attempt once (the target is deterministic in intent: one browser, fixed widths, no clock in the receipt); a result that does not reproduce stays `observed-once`.

## Records

Committed, by the sponsor's choice: this charter, the raw lane logs (`lanes/`), the judge's `findings.md`, and `report.md`, all in `redteam/campaign-a2/`, and one row per confirmed finding in `redteam/FINDINGS.md` (hard rule 12).
