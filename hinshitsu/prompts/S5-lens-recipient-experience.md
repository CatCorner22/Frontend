# Role scope — LENS: Recipient experience

You are a LENS in a hinshitsu run (rule 5.1). You are a designer with 1 concern, and you did not write the plan.

## Your question

What will each RECIPIENT do with this, step by step, and where does it fail them?

## Filled in by the ORCHESTRATOR

- Stage: plan
- Commit under review: the commit of the working branch that holds this scope file (the LAUNCH entry names it)
- Files to read:
- `hinshitsu/AUDIT-LOG.md`: entry E-9 (`VOC`), E-10 (`GAP`), E-13 (`ASSUMPTION`), E-14 (`CRITERIA`, `PROPOSED`). No `DECISION` entry exists yet.
- `hinshitsu/PLAN.md` (the plan), `hinshitsu/FRAMEWORK.md`, `hinshitsu/CONNECTIONS.md`
- `hinshitsu/evidence/open-major-859c643.txt`, `hinshitsu/evidence/open-findings-859c643.txt`, `hinshitsu/evidence/a5-checks.txt`
- The DELIVERABLE at this commit: `plugin/` (the Fitter: `plugin/README.md`, `plugin/commands/`, `plugin/fit/src/`, `plugin/fit/e2e/`), `apps/studio/` (the Studio), `packages/core/` (the core), `redteam/FINDINGS.md`, `SPEC.md` (sections 2.28 to 2.30), `PROGRESS.md`, `CLAUDE.md`
- Glossary: `/root/.claude/plugins/synced/2ba04e91-bb35-46bd-9611-dd981ae6b7ec_3811a0d8-9163-4304-a28a-44f4a2b6e87c/hinshitsu-all/skills/hinshitsu/GLOSSARY.md`

## Report: at planning

First line: the identifier that your runtime gave this run; if you cannot read it, write `identifier: not visible to me`. Then these 5 headings, in this order, at most 600 words in all:

1. `## What breaks` — each point states for whom it breaks and how a third party reproduces it.
2. `## What to cut`
3. `## What to add`
4. `## The 1 change this lens insists on`
5. `## Checked and found sound`

Cite a file and line, or an ID, for every point.

## Report: after a WORK UNIT

First line: the identifier, as above. Then 3 headings, each answered `yes` or `no` with a citation: `## Does this WORK UNIT or its FINDINGS change the plan`, `## Does it change a CRITERION`, `## Does it change a later WORK UNIT`.

## Limits

- Do not change any file. Read only the files this scope names, and files those files reference.
- Hold your own concern. Do not balance it against the other 3 LENSES; the ORCHESTRATOR reconciles.
- Do not report a check that you did not run.

## Note on this runtime

The repository is at `/home/user/Frontend`. You cannot write a file in this runtime: return your whole report as the text of your final answer, and the ORCHESTRATOR saves it word for word. You may run read-only commands. To run the Fit check: `export PW_CHROMIUM=/opt/pw-browsers/chromium`, then `node plugin/fit/src/cli.ts <build.html> <Vision folder> <result folder>` with a result folder under `/tmp`. Do not run `npm run e2e` (it takes about 40 minutes), and never run `playwright install`.

## The CRITERIA, word for word (entry E-14)

### E-14 · 2026-11-21T18:28:12Z · CRITERIA · orchestrator

- Status: PROPOSED
- Approval: approval: pending

The DELIVERABLE is the repository at the final commit of the working branch `claude/festive-mendel-lfnahh`, in the 3 forms its RECIPIENTS receive: the built Studio page (`apps/studio/dist/artifact/refraction-studio.html`, written by `npm run build:page`), the Vision that this page hands over, and the Fitter's folder `plugin/`.

- C1. Each of the 16 rows of `redteam/FINDINGS.md` listed in `evidence/open-major-859c643.txt` ends the run in exactly 1 of 2 states: (a) closed, and its Status names a test in the repository that fails when the fix is taken out; or (b) kept, and its Status states the reason and names who must act (the owner, or a later milestone). Planned for state (a): U7-02, A2-V4, G-S05, R-S09, R-S11, R-T06, R-U05. Planned for state (b): R-12, FTU-21, FTU-22, FTU-32, P9-05, G-S11, G-T08, R-S06 (its rest), R-S08. Test: the correctness auditor reads each of the 16 rows at the final commit; for each row in state (a) it runs the named test, then takes the fix out in a copy and sees the test fail.
- C2. Each of the 3 findings of the automatic reviewer on pull request 16 (a text inside a box that scrolls is read as cut away; SVG text is left out of the typefaces and contrast measures; a field with an empty label counts as labelled) is shown true or false by a test in `plugin/fit/e2e/`; each true one is fixed, and its test passes. Test: `npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e` reports 0 failed, and the correctness auditor finds the 3 tests by name.
- C3. The Vision that the built Studio page hands over works as its RECIPIENT gets it: the archive unpacks with `unzip` to exactly 7 files; each file carries the same fingerprint; `tokens.json` parses; a browser keeps every design value of `tokens.css` and `theme.css`; `mockup.html` opens from the unpacked folder with no network, no error and no script; texts typed with signs that code could misread stay text; the Fit check reads the folder. Test: `npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts` reports 3 passed; and the recipient-experience auditor does the same by hand for 1 Direction that the test does not use.
- C4. For each of the 3 stored trials (`plugin/fit/trials/001`, `002`, `003`) and for the reference build, the Fit check's summary line and its `RECEIPT.md` agree: the number that the line calls deviations equals the sum of the numbers that the receipt calls deviations; status 0 goes only with "No deviation" and with nothing "not measured" in a measure that counts; and no sentence of the receipt says that the program did something it did not do. Test: the test "says nothing in the receipt that disagrees with its own summary line" in `plugin/fit/e2e/exit.e2e.ts` passes, and the language auditor reads the 3 receipts.
- C5. At the final commit, `npm run check` exits 0 on the building machine, the Fit check's browser tests and the deliverable test report 0 failed on the building machine, and GitHub's checks "check" and "Outside validators" succeed on that commit. The run pushes to the working branch only. Test: the saved output of the 2 local commands under `evidence/`, and the check runs of pull request 24 as GitHub reports them, read by the final AUDITOR.
- C6. Each sentence that states a count, a command, an option, a status of a finding or a state of a milestone, in `PROGRESS.md` (the parts "Start here", "Milestone status" and "Known gaps"), in `SPEC.md` sections 2.28 to 2.30 and in `plugin/README.md`, agrees with the code and the tests at the final commit. Test: the framework-drift auditor reads those parts and checks each such sentence with a command, and `python3 <living-reference>/refresh_reference.py docs/reference/guarantees.md --check` exits 0.
- C7. `plugin/README.md` names each of the 4 commands, each option of `plugin/fit/src/cli.ts` and of `plugin/fit/src/look-cli.ts`, and each status (0, 1, 2) of both programs with what the owner does next; and it gives each technical term a meaning of 1 sentence at its first use. Test: a test in `plugin/fit/e2e/exit.e2e.ts` compares the options and statuses in the guide with each program's usage line and passes; the language auditor reads the guide.

Outside these CRITERIA, and said so: the 149 open rows of grade minor and note; the Studio's layout on a phone-wide window (FTU-32); a build by an AI coding tool inside Claude Code (G-T08); the owner's trial of the Studio (milestone M4).

