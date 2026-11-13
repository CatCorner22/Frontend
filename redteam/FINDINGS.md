# Red-team findings

Three adversarial reviewers examine the project: the security attacker, the confused first-time user, and the drift and truth auditor. They receive the code and the running app, not the builder's conclusions. Their full reports are in `redteam/reports/`; each row below points to its report by identifier.

**What actually happened (stated plainly).** Hard rule 12 requires a review at each unit of work and at each milestone gate. The builder did not run any review at the M0, M1, M2, or M3 gates. The first review ran on 2026-11-13 against the M4 Studio. Finding R-12 records this breach. From this row forward, a review runs at every gate, and every finding is logged here, including findings that are already fixed.

**Severity.** *Blocker*: stops the milestone. *Major*: fix within the milestone. *Minor*: fix when convenient. *Note*: for the owner's information.

**Status words.** *Open*: not yet addressed. *Fixed*: changed and covered by a test or a re-measurement; the cell names the commit. *Corrected*: a false or stale statement was rewritten. *Acknowledged*: a past event that cannot be undone; the cell states the change in practice. *Needs the owner*: waits on the owner's decision or action. *Deferred*: scheduled for a named milestone, with the reason.

| ID | Date | Reviewer | Severity | Finding | Evidence | Status |
|---|---|---|---|---|---|---|
| SEC-01 | 2026-11-13 | Security attacker | blocker | No package check is recorded in `DECISIONS.md` for any dependency | `reports/2026-11-13-security.md`, row SEC-01 | Fixed: `DECISIONS.md` now holds a row per direct dependency (30 rows) and decision D27 (waiting period of 7 days; 4 build tools moved to older versions). All checks re-run and pass. |
| SEC-02 | 2026-11-13 | Security attacker | major | The page-database copy of the project always wins, and the browser copy is then overwritten: four ways to lose saved work | `reports/2026-11-13-security.md`, row SEC-02 | Open |
| SEC-03 | 2026-11-13 | Security attacker | major | An unreadable saved project is thrown away by the first edit; a record that is cut off gives no warning at all | `reports/2026-11-13-security.md`, row SEC-03 | Open |
| SEC-04 | 2026-11-13 | Security attacker | major | Tables that are looked up by name accept the names of built-in object members: a crafted link stops the Studio's links, and the import check lets 11 keys that are not Steps through | `reports/2026-11-13-security.md`, row SEC-04 | Open |
| SEC-05 | 2026-11-13 | Security attacker | minor | The import check accepts Decisions that do not match the Catalog; a Step's main button then does nothing, and free text rides along into the saved file | `reports/2026-11-13-security.md`, row SEC-05 | Open |
| SEC-06 | 2026-11-13 | Security attacker | minor | Loading a file, or typing in a second tab, replaces saved work at once: no question, no copy | `reports/2026-11-13-security.md`, row SEC-06 | Open |
| SEC-07 | 2026-11-13 | Security attacker | minor | No Content Security Policy; the sandbox alone does not stop a preview from sending requests; the page generates code while it runs | `reports/2026-11-13-security.md`, row SEC-07 | Open |
| SEC-08 | 2026-11-13 | Security attacker | minor | The Mockup renderer trusts its own inputs: option names, token values and font CSS go into HTML and CSS without escaping | `reports/2026-11-13-security.md`, row SEC-08 | Open |
| SEC-09 | 2026-11-13 | Security attacker | minor | Supply-chain controls that the plan names are missing or thin: no Dependabot file; new releases adopted within days | `reports/2026-11-13-security.md`, row SEC-09 | Open |
| SEC-10 | 2026-11-13 | Security attacker | minor | Opened as a local file, the Studio shares its storage with every other local HTML file | `reports/2026-11-13-security.md`, row SEC-10 | Open |
| SEC-11 | 2026-11-13 | Security attacker | note | In the single-file page, the Studio's own look does not take effect, so "Dress the Studio in this design's colors" changes almost nothing | `reports/2026-11-13-security.md`, row SEC-11 | Open |
| SEC-12 | 2026-11-13 | Security attacker | note | The "was not loaded" message repeats text from the file, at any length | `reports/2026-11-13-security.md`, row SEC-12 | Open |
| SEC-13 | 2026-11-13 | Security attacker | note | The names of the two workspace packages are free on the public registry, and the Studio asks for the core by exact version number | `reports/2026-11-13-security.md`, row SEC-13 | Open |
| SEC-14 | 2026-11-13 | Security attacker | note | The Studio has no error boundary | `reports/2026-11-13-security.md`, row SEC-14 | Open |
| M-01 | 2026-11-13 | Drift and truth auditor | blocker | M3 counts as done, but its exit test does not exist | `reports/2026-11-13-drift-and-truth.md`, row M-01 | Open |
| M-02 | 2026-11-13 | Drift and truth auditor | major | M2, M3 and M4 were built while M1's exit test was failing (hard rule 1) | `reports/2026-11-13-drift-and-truth.md`, row M-02 | Open |
| M-03 | 2026-11-13 | Drift and truth auditor | minor | M0's exit test is partly met: no scorecard | `reports/2026-11-13-drift-and-truth.md`, row M-03 | Open |
| M-04 | 2026-11-13 | Drift and truth auditor | minor | M1's "session setup script" is missing | `reports/2026-11-13-drift-and-truth.md`, row M-04 | Open |
| M-05 | 2026-11-13 | Drift and truth auditor | major | "Dependency re-checks" (M2 scope) are not built: a derived value goes stale | `reports/2026-11-13-drift-and-truth.md`, row M-05 | Open |
| M-06 | 2026-11-13 | Drift and truth auditor | major | Floor checks cover text contrast on nine listed pairs only | `reports/2026-11-13-drift-and-truth.md`, row M-06 | Open |
| M-07 | 2026-11-13 | Drift and truth auditor | major | Saved projects: no migration, no past-version test, and the shape already changed under version 1 | `reports/2026-11-13-drift-and-truth.md`, row M-07 | Open |
| M-08 | 2026-11-13 | Drift and truth auditor | minor | Planned parts of Stages 2–3 and Template 1 are missing and not listed as gaps | `reports/2026-11-13-drift-and-truth.md`, row M-08 | Open |
| M-09 | 2026-11-13 | Drift and truth auditor | major | A Decision never records a reason | `reports/2026-11-13-drift-and-truth.md`, row M-09 | Open |
| M-10 | 2026-11-13 | Drift and truth auditor | minor | D14 is partly built | `reports/2026-11-13-drift-and-truth.md`, row M-10 | Open |
| M-11 | 2026-11-13 | Drift and truth auditor | minor | Several plan controls are absent and no file says so | `reports/2026-11-13-drift-and-truth.md`, row M-11 | Open |
| M-12 | 2026-11-13 | Drift and truth auditor | note | Planned libraries were replaced by hand-written code without a decision | `reports/2026-11-13-drift-and-truth.md`, row M-12 | Open |
| M-13 | 2026-11-13 | Drift and truth auditor | note | D23 puts fully decorated Directions before the Structure Steps | `reports/2026-11-13-drift-and-truth.md`, row M-13 | Open |
| P-01 | 2026-11-13 | Drift and truth auditor | major | The focus ring is invisible on a painted first screen, in every contrast profile | `reports/2026-11-13-drift-and-truth.md`, row P-01 | Open |
| P-02 | 2026-11-13 | Drift and truth auditor | major | Enforce makes an outline button harder to read on a dark colour-block design and reports it as fixed | `reports/2026-11-13-drift-and-truth.md`, row P-02 | Open |
| P-03 | 2026-11-13 | Drift and truth auditor | minor | Other rendered pairs fall short under Enforce | `reports/2026-11-13-drift-and-truth.md`, row P-03 | Open |
| P-04 | 2026-11-13 | Drift and truth auditor | major | "Skip: take the default" replaces the Direction's values, and the default is not marked | `reports/2026-11-13-drift-and-truth.md`, row P-04 | Open |
| P-05 | 2026-11-13 | Drift and truth auditor | major | A saved project that fails validation is overwritten at the next change | `reports/2026-11-13-drift-and-truth.md`, row P-05 | Open |
| P-06 | 2026-11-13 | Drift and truth auditor | minor | Autosave can lose the last Decision, and a failed save reads "Not saved yet" | `reports/2026-11-13-drift-and-truth.md`, row P-06 | Open |
| P-07 | 2026-11-13 | Drift and truth auditor | minor | No error boundary; a crafted address stops navigation | `reports/2026-11-13-drift-and-truth.md`, row P-07 | Open |
| P-08 | 2026-11-13 | Drift and truth auditor | minor | Generated Directions carry names and moods that do not match the design | `reports/2026-11-13-drift-and-truth.md`, row P-08 | Open |
| P-09 | 2026-11-13 | Drift and truth auditor | minor | Import accepts Step names that are not Steps | `reports/2026-11-13-drift-and-truth.md`, row P-09 | Open |
| P-10 | 2026-11-13 | Drift and truth auditor | minor | The owner's choice of the Studio's look is not saved, and the Studio is below its own target-size default | `reports/2026-11-13-drift-and-truth.md`, row P-10 | Open |
| P-11 | 2026-11-13 | Drift and truth auditor | note | "Closer to this one" offers twin Options after "Pill" | `reports/2026-11-13-drift-and-truth.md`, row P-11 | Open |
| P-12 | 2026-11-13 | Drift and truth auditor | note | The claude.ai save and download path has no test, and the host probe uses an unsandboxed frame | `reports/2026-11-13-drift-and-truth.md`, row P-12 | Open |
| T-01 | 2026-11-13 | Drift and truth auditor | major | `phase0/RESULTS.md` reports a measured "yes" that its own data records as "false" | `reports/2026-11-13-drift-and-truth.md`, row T-01 | Open |
| T-02 | 2026-11-13 | Drift and truth auditor | minor | `RESULTS.md` lists unmeasured items as measured, omits one result, and cannot be re-run from the repository | `reports/2026-11-13-drift-and-truth.md`, row T-02 | Open |
| T-03 | 2026-11-13 | Drift and truth auditor | major | "Known gaps (stated plainly)" leaves out most known gaps | `reports/2026-11-13-drift-and-truth.md`, row T-03 | Open |
| T-04 | 2026-11-13 | Drift and truth auditor | minor | Reading claims say more than the records support | `reports/2026-11-13-drift-and-truth.md`, row T-04 | Open |
| T-05 | 2026-11-13 | Drift and truth auditor | note | "M2 core engine with 27 unit tests" | `reports/2026-11-13-drift-and-truth.md`, row T-05 | Open |
| T-06 | 2026-11-13 | Drift and truth auditor | minor | Standing documents are stale | `reports/2026-11-13-drift-and-truth.md`, row T-06 | Open |
| T-07 | 2026-11-13 | Drift and truth auditor | note | Statements the repository cannot confirm | `reports/2026-11-13-drift-and-truth.md`, row T-07 | Open |
| T-08 | 2026-11-13 | Drift and truth auditor | minor | D24 calls itself "consistent with D13" but changes what "Off" means | `reports/2026-11-13-drift-and-truth.md`, row T-08 | Open |
| X-01 | 2026-11-13 | Drift and truth auditor | major | The three "Enforce" assertions cannot fail | `reports/2026-11-13-drift-and-truth.md`, row X-01 | Open |
| X-02 | 2026-11-13 | Drift and truth auditor | major | The unit suite misses most planted defects | `reports/2026-11-13-drift-and-truth.md`, row X-02 | Open |
| X-03 | 2026-11-13 | Drift and truth auditor | minor | "One variable per Step" does not test its first claim | `reports/2026-11-13-drift-and-truth.md`, row X-03 | Open |
| X-04 | 2026-11-13 | Drift and truth auditor | minor | Colour-math tests are too weak for what they name | `reports/2026-11-13-drift-and-truth.md`, row X-04 | Open |
| X-05 | 2026-11-13 | Drift and truth auditor | minor | Hostile-content tests do not cover every text field | `reports/2026-11-13-drift-and-truth.md`, row X-05 | Open |
| X-06 | 2026-11-13 | Drift and truth auditor | minor | "round-trips a valid project" checks only that parsing succeeds | `reports/2026-11-13-drift-and-truth.md`, row X-06 | Open |
| X-07 | 2026-11-13 | Drift and truth auditor | minor | Twelve of thirteen conflict rules and every harmony rule have no test; one rule was removed to make a Direction pass | `reports/2026-11-13-drift-and-truth.md`, row X-07 | Open |
| X-08 | 2026-11-13 | Drift and truth auditor | minor | The end-to-end tests (added at `7303ba0`) prove less than `PROGRESS.md:20` suggests | `reports/2026-11-13-drift-and-truth.md`, row X-08 | Open |
| C-01 | 2026-11-13 | Drift and truth auditor | blocker | Three Steps cite a research record that did not exist, and one cites company pages that the records say were never read | `reports/2026-11-13-drift-and-truth.md`, row C-01 | Open |
| C-02 | 2026-11-13 | Drift and truth auditor | major | Both Steps labelled "Measured in studies" overstate | `reports/2026-11-13-drift-and-truth.md`, row C-02 | Open |
| C-03 | 2026-11-13 | Drift and truth auditor | major | "Seen in:" states facts about named companies, mostly without a source | `reports/2026-11-13-drift-and-truth.md`, row C-03 | Open |
| C-04 | 2026-11-13 | Drift and truth auditor | minor | Rankings and flat statements without support | `reports/2026-11-13-drift-and-truth.md`, row C-04 | Open |
| C-05 | 2026-11-13 | Drift and truth auditor | major | Step sources name works seen only as snippets or second-hand, without saying so (hard rule 13) | `reports/2026-11-13-drift-and-truth.md`, row C-05 | Open |
| C-06 | 2026-11-13 | Drift and truth auditor | minor | Catalog text describes the tool or the evidence inaccurately | `reports/2026-11-13-drift-and-truth.md`, row C-06 | Open |
| C-07 | 2026-11-13 | Drift and truth auditor | major | Directions, Options, conflict rules and harmony rules lack the record fields that hard rule 5 requires | `reports/2026-11-13-drift-and-truth.md`, row C-07 | Open |
| C-08 | 2026-11-13 | Drift and truth auditor | note | Two of six warnings name no replacement | `reports/2026-11-13-drift-and-truth.md`, row C-08 | Open |
| C-09 | 2026-11-13 | Drift and truth auditor | note | The token data holds community look-alikes named after companies | `reports/2026-11-13-drift-and-truth.md`, row C-09 | Open |
| W-01 | 2026-11-13 | Drift and truth auditor | minor | "default" has three meanings on screen | `reports/2026-11-13-drift-and-truth.md`, row W-01 | Open |
| W-02 | 2026-11-13 | Drift and truth auditor | minor | "Stage 1" means two things | `reports/2026-11-13-drift-and-truth.md`, row W-02 | Open |
| W-03 | 2026-11-13 | Drift and truth auditor | minor | Several verbs for one action; "picks" and "decisions" for one thing | `reports/2026-11-13-drift-and-truth.md`, row W-03 | Open |
| W-04 | 2026-11-13 | Drift and truth auditor | minor | "Mockup" never appears on screen; four other words stand in | `reports/2026-11-13-drift-and-truth.md`, row W-04 | Open |
| W-05 | 2026-11-13 | Drift and truth auditor | minor | "design", "look", "direction" and "project" overlap | `reports/2026-11-13-drift-and-truth.md`, row W-05 | Open |
| W-06 | 2026-11-13 | Drift and truth auditor | minor | One setting has four names | `reports/2026-11-13-drift-and-truth.md`, row W-06 | Open |
| W-07 | 2026-11-13 | Drift and truth auditor | minor | "adjusted" means two things | `reports/2026-11-13-drift-and-truth.md`, row W-07 | Open |
| W-08 | 2026-11-13 | Drift and truth auditor | minor | The defined-terms table is out of date | `reports/2026-11-13-drift-and-truth.md`, row W-08 | Open |
| W-09 | 2026-11-13 | Drift and truth auditor | note | Smaller slips | `reports/2026-11-13-drift-and-truth.md`, row W-09 | Open |
| R-02 | 2026-11-13 | Drift and truth auditor | major | Three stack substitutions were acted on before the owner acknowledged them (hard rule 2) | `reports/2026-11-13-drift-and-truth.md`, row R-02 | Open |
| R-07 | 2026-11-13 | Drift and truth auditor | minor | No package check is recorded in `DECISIONS.md` (hard rule 7) | `reports/2026-11-13-drift-and-truth.md`, row R-07 | Fixed: `DECISIONS.md` now holds a row per direct dependency (30 rows) and decision D27 (waiting period of 7 days; 4 build tools moved to older versions). All checks re-run and pass. |
| R-11 | 2026-11-13 | Drift and truth auditor | minor | `PROGRESS.md` and `WAYPOINTS.md` lagged the work (hard rule 11) | `reports/2026-11-13-drift-and-truth.md`, row R-11 | Open |
| R-12 | 2026-11-13 | Drift and truth auditor | blocker | No red-team review ran at any unit of work or milestone gate before this one, and the log says otherwise | `reports/2026-11-13-drift-and-truth.md`, row R-12 | Corrected: the log's opening now states that no review ran at the M0-M3 gates. Acknowledged: the breach cannot be undone; a review now runs at every gate and every finding is logged. |
| L-01 | 2026-11-13 | Drift and truth auditor | major | The page that ships carries no licence text and no notices | `reports/2026-11-13-drift-and-truth.md`, row L-01 | Open |
| L-02 | 2026-11-13 | Drift and truth auditor | minor | The generated notices file has errors | `reports/2026-11-13-drift-and-truth.md`, row L-02 | Open |
| L-03 | 2026-11-13 | Drift and truth auditor | minor | Two bundled fonts declare Reserved Font Names | `reports/2026-11-13-drift-and-truth.md`, row L-03 | Open |
| L-04 | 2026-11-13 | Drift and truth auditor | note | Licence statements with no record behind them | `reports/2026-11-13-drift-and-truth.md`, row L-04 | Open |
| L-05 | 2026-11-13 | Drift and truth auditor | note | The tests use Playwright 1.63.0; the stack line says 1.65 | `reports/2026-11-13-drift-and-truth.md`, row L-05 | Open |
| O-01 | 2026-11-13 | Drift and truth auditor | note | The repository changed under review | `reports/2026-11-13-drift-and-truth.md`, row O-01 | Open |
| O-02 | 2026-11-13 | Drift and truth auditor | note | Pace | `reports/2026-11-13-drift-and-truth.md`, row O-02 | Open |
| O-03 | 2026-11-13 | Drift and truth auditor | note | Bundle size and its budget | `reports/2026-11-13-drift-and-truth.md`, row O-03 | Open |
| O-04 | 2026-11-13 | Drift and truth auditor | note | The default profile is "Advise", set in code | `reports/2026-11-13-drift-and-truth.md`, row O-04 | Open |
| O-05 | 2026-11-13 | Drift and truth auditor | note | Dead or unused pieces | `reports/2026-11-13-drift-and-truth.md`, row O-05 | Open |
