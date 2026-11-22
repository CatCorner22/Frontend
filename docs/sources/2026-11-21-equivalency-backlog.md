# Frontend Focus — Equivalency Backlog

**Goal (North Star):** Get LLM-built frontends as close as possible to equivalency with talented human frontend developers.

**Repos in scope:** `catcorner22/frontend` (primary), `catcorner22/devin_frontend` (variant).

**How this file is organized:**
- Part I lists the five human-craft gaps the tool currently covers least, ranked.
- Part II lists the eight action items to close those gaps, in priority order.
- Each action item has acceptance criteria. An item is done only when every criterion passes.

---

## PART I — Craft Gaps Where LLM Frontends Fall Short of Talented Humans

Ranked by where the tool currently has the least coverage.

### I.A. Pixel-Level Optical Judgment

Talented developers nudge by 1–2 px: optical alignment (letterforms optically centered, not mathematically centered), baseline rhythm, heading/body contrast in weight and size, and consistent optical spacing between unlike elements (icon-to-label vs. label-to-button-edge). This is where craft visibly lives.

**Current coverage:** The Fit check measures the built page against explicit picks, but the pixel-measurement step (step 13a) is not built, so measurement stops at structure.

### I.B. Constant Looking During the Build — Not After

Humans work in tight build-look-fix loops, glancing at the rendered result dozens of times per component. The current pipeline front-loads elicitation (the Studio) and back-loads expensive adversarial review. Hundreds of cheap glances beat six expensive autopsies.

**Current coverage:** Seven red-team campaigns with rising token costs (a nine-reviewer code review alone cost ~1.84M tokens); open findings have not converged to zero (9 of 67 still open after round six).

### I.C. Interaction and State Coverage

Static appearance is only half the work. Talented humans obsess over hover, focus-visible, active, and disabled states; empty, loading, and error states; transitions and motion. A page that looks perfect in its happy-path screenshot is not finished.

**Current coverage:** The eye exam appears centered on static screens; no elicitation or Fit-check dimension for states or motion surfaced in the progress notes.

### I.D. Viewport and Content-Edge Behavior

Human developers test the ugly widths, not just the tidy ones: 700 px, ~1100 px, 150% browser zoom, long unbreakable strings, oversized names, mixed-direction or non-Latin text. The repo's own finding S6-04 (a letter of another alphabet can make a name look like another name) proves this bug class is already leaking through.

**Current coverage:** Evidence screenshots cover 1280 px and 375 px only.

### I.E. Deterministic Gates Over Opinion Reviews

Any defect that a machine can assert about should never survive to a reviewer. Examples already sitting open in the repo: 13 named token values in `tokens.css` that the sample site never references (T6-12), and a failed Dependabot run nobody handled (T6-16). Both should be CI failures, not review line-items.

**Current coverage:** Findings recur across red-team campaigns instead of being converted into permanent automated gates.

---

## PART II — Action Items, In Priority Order

### II.1. Dogfood the Full Loop End-to-End *(highest priority — do this first)*

Run the complete Studio → Vision/Prescription → Fitter → Fit check → repair cycle on one real page, inside a real Claude Code session, with no skipped steps, before starting any further red-team campaign.

*Why first:* `PROGRESS.md` records that nobody has run the plugin's commands in a Claude Code session. One honest pass by the intended user teaches more than review round eight.

**Acceptance criteria:**
- (a) All Fitter plugin commands executed in a live Claude Code session by the owner, scripted or typed.
- (b) A real page built from a Vision/Prescription produced by the Studio on the owner's own content.
- (c) The Fit check ran against that build and produced a verdict file.
- (d) At least one repair round executed and re-measured.
- (e) Findings from this run logged in `DECISIONS.md`, including every moment the loop felt broken.

### II.2. Build Step 13a — Pixel Measurement

Implement the missing pixel-measurement step so the Fit check can measure optical qualities, not just structural ones.

*Why:* Without an instrument, "equivalency with careful human work" is unmeasurable, and gap I.A has no remedy path.

**Minimum measurements to ship:**
- (a) Baseline grid adherence (vertical rhythm in px).
- (b) Element alignment deltas (computed vs. optical centering).
- (c) Font size / weight pairings across the type scale.
- (d) Spacing consistency: same declared spacing token producing same rendered distance everywhere it is used.

**Acceptance criteria:**
- (a) Step 13a runs inside the Fit check on every round without manual invocation.
- (b) Output includes numeric deltas with a pass/fail threshold configurable per Direction.
- (c) Unit tests cover each measurement type; e2e test proves detection of a deliberately planted 2 px offset.

### II.3. Invert the Review Economics

Cap adversarial review at one round per milestone. Move the freed budget into cheap, frequent verification: automated whole-page visual diffs on every commit (the 76 stored screenshots prove capture already works) and per-feature build-look cycles modeled on human practice.

**Acceptance criteria:**
- (a) Documented rule in `CLAUDE.md`: max one red-team round per milestone; exceptions require a `DECISIONS.md` entry.
- (b) Visual diff job runs on every push and flags pixel regressions against stored baselines.
- (c) Token spend per milestone on review, recorded and compared against the prior milestone's spend.

### II.4. Extend the Eye Exam Beyond Static Screens

Add comparison pairs covering interaction states (hover, focus-visible, active, disabled, error, loading, empty) and viewport/content edge cases (700 px, ~1100 px, 150% zoom, long unbreakable strings, oversized names, non-Latin characters), so the Vision/Prescription covers them and the Fit check can enforce them.

*Why:* Directly closes gaps I.C and I.D; finding S6-04 shows the risk is real.

**Acceptance criteria:**
- (a) The Studio presents at least one pairwise decision per interaction state.
- (b) Vision/Prescription includes a states section and a viewport-edge section.
- (c) Fit check verifies each state the Vision names (e.g., renders the hover state and measures it).
- (d) New e2e tests render 700 px, ~1100 px, and 150% zoom, plus one long-string fixture.

### II.5. Convert Recurring Red-Team Findings Into Permanent Automated Gates

Audit the six campaigns for repeated finding classes. Every repeat becomes a CI assertion so future rounds never find it again. Starting list, already open in the repo:

- Unused token values in `tokens.css` (T6-12) → lint rule failing CI on any token never referenced.
- Ignored Dependabot failure (T6-16) → dependency/audit checks made blocking in `npm run check`.
- Unmeasured caches and redundant guards (from repairs like `59704b7`) → static rule where feasible.

**Acceptance criteria:**
- (a) Repeat-pattern audit of all campaigns completed, listed in `DECISIONS.md`.
- (b) At minimum: dead-token lint, blocking dependency check, and `npm audit` gate merged.
- (c) `npm run check` runs all new gates; CI red on violation.

### II.6. Add Accessibility and Performance as Fit-Check Dimensions

Wire axe-core and Lighthouse into the Fit check so they run on every Fitter round, treating violations and score floors as build defects, not review topics.

**Acceptance criteria:**
- (a) axe-core runs each round; zero violations passes, any violation fails the round.
- (b) Lighthouse CI runs each round with threshold floors declared in the Vision (suggest ≥ 95 across categories).
- (c) Both report into the same Fit verdict file the repair loop already consumes.

### II.7. Merge the Repos or Formally Diverge Them

`frontend` and `devin_frontend` are near-duplicates with drifted terminology (Vision vs. Prescription; one carries `plugin/`, `validators/`, `SPEC.md`, `feature_list.json`, the other does not). Duplication means fixes land in one and red teams audit stale code in the other.

**Decision required:** If `devin_frontend` is an experiment, archive it with a note in its README. If it is the successor, say so in both READMEs and merge or delete the other.

**Acceptance criteria:**
- (a) A `DECISIONS.md` entry states which repo is canonical and what the other becomes.
- (b) The non-canonical repo's README points readers to the canonical one.
- (c) No shared file exists with meaningful differences between the two without a documented reason.

### II.8. Define Equivalency Numerically

Pick measurable proxies for the North Star, publish them in the README, and have the Fit check print a composite score so convergence is observable:

- Zero axe-core violations.
- Lighthouse ≥ threshold (declared per project).
- Visual diff pixel-error below a declared percentage across five viewports (not two).
- Zero unreferenced named tokens.
- Every interaction state named in the Vision and verified by the Fit check.

**Acceptance criteria:**
- (a) README states the metric list and thresholds.
- (b) Fit check emits the composite score on every round.
- (c) Score history retained per milestone so trend is visible.

---

## Sequencing Note

II.1 before everything: running the loop is the precondition for knowing what II.2 through II.8 should really measure. II.2 is the instrument for gap I.A and feeds II.8's numeric definition. II.3 frees the review budget that pays for II.4–II.6. II.7 and II.8 are governance that prevents drift.

---

*Source basis: repository structure and READMEs of both repos; `PROGRESS.md` on branch `claude/brave-mayer-sawqz9` (findings T6-12, T6-16, S6-04, M7 retest, token-cost reports, and the untested-plugin note). Review this file against current branch state before execution.*
