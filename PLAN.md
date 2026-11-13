# Plan: "Refraction" — your personal design studio and fitter for LLM-built frontends

"Refraction" is a placeholder name (the eye-exam procedure). You can rename it at any time.

## 1. Context

**Problem.** LLM coding tools produce generic UI for two reasons that your own files identify: nobody makes the design decisions ("a decision problem"), and the LLM never looks at what it rendered ("a feedback-loop problem").

**Your idea.** Divide frontend design into tiny steps, each with several concrete options to pick from, so that you and the LLM communicate apples to apples.

**What this plan builds.** Two halves that match the two causes:
- **The Studio** (a web app) fixes the decision problem. You pick; it writes the **Prescription**.
- **The Fitter** (a Claude Code plugin) fixes the feedback-loop problem. It makes Claude build from the Prescription, look at the rendered result, measure it, and repair it before reporting.

**Who it is for.** You alone. No licensing, accounts, payments, or marketing. You own what you build with it. The tool earns nothing by itself; it raises the quality of what you sell. Therefore the plan puts a real, sellable project through the tool as early as possible (milestone M8).

**An honest market note.** Lovable, Google Stitch, v0, and Claude now ship design features, and free "anti-slop" skills are popular. The research found no product that does one decision at a time, on your own content, with a measured fit check afterward. For a personal tool, competitors do not matter; their open formats help us (section 6).

## 2. The metaphor: the eye exam and the fitting

| Eye care | Refraction |
|---|---|
| "Which is clearer, 1 or 2?" | Each **Step** shows 3–4 **Options** |
| Each comparison changes one lens only | Each Step changes one design variable; all else stays fixed |
| You read the same letter chart every time | Every Option renders on the same **Mockup**, with your real content |
| You need no knowledge of optics | You need no design vocabulary; each Step teaches its concept in plain words |
| No lens that harms you is ever offered | No Option that fails an accessibility floor is ever offered |
| The written prescription | The **Prescription**: a Markdown prompt plus token files |
| The lab grinds the lenses | Claude Code builds the frontend |
| The optician fits the glasses, has you read the chart again, and adjusts | The **Fitter** renders the build, measures it against the Prescription, and repairs |

This complements your restaurant metaphor: the restaurant describes the product you design; the eye exam describes how the tool obtains and verifies each decision. In your forest terms: a Step is a tree, a design dimension is a species, section 4 maps the forest, and section 9 lists what can go wrong.

## 3. What the best human-built frontends do (research summary)

Full findings, with sources and the claims I saw only as search snippets, go into `docs/research/` at M1. The pattern across Linear, Stripe, Vercel, Apple, GOV.UK, Shopify Polaris, IBM Carbon, Radix, Superhuman, Raycast, and the published rule sets of Emil Kowalski, Jakub Krehel, and Vercel:

1. **A few inputs generate the whole system.** Linear derives every theme color from three inputs (base, accent, contrast) in a perceptual color space. Stripe's palette guarantees contrast by construction. → The Studio derives full token sets from a few picks, in OKLCH, with contrast guaranteed.
2. **Every value has a job.** Radix assigns each of 12 color steps a role (backgrounds, component states, borders, solid fills, text). → Tokens are semantic, never raw.
3. **Bespoke feel lives in details that nobody asks for.** Tabular numerals, balanced headings, concentric corner radii, layered tinted shadows, press feedback of 0.96–0.97 scale, ease-out curves under 300 ms, no animation on actions done hundreds of times a day, spinners that wait before they appear, focus rings that sticky headers never cover, state kept in the URL. → The **craft layer** (section 4.3) writes about 50 such rules into every Prescription automatically.
4. **Restraint and one signature move.** Each exemplar has one memorable element and little else decorative. → One signature-element Step; the anti-default warnings.
5. **The exemplars disagree** (dense versus generous; springs versus none; sentence case versus title case). → Those disagreements are exactly the Steps: each becomes a pick, not a rule.

Caveat: most craft rules are expert opinion, not tested evidence. The measured items are contrast thresholds, target sizes, and response-time limits. The catalog labels each rule's evidence grade, as your living reference does.

## 4. How the tool works (map of the forest)

### 4.1 Rules that hold at every Step
1. One variable per Step. Apples to apples.
2. Structure before decoration. The Mockup stays grayscale until Stage 3.
3. Every Option carries plain-language text: what it is, choose it when, its risk, and which exemplar uses it.
4. The convention for your audience is the marked default ("intuitive" means familiar to that audience). A departure is a "bold choice"; the tool recommends spending bold choices in one place.
5. Floor checks run before display: contrast (4.5:1 text; 3:1 large text and controls), target size (24 px floor; 44 px default), focus visibility. The tool repairs or withholds a failing Option.
6. Anti-default warnings warn; they never forbid. Your rule governs: "the brief always wins." Each warning names a replacement.
7. Each Option previews at phone and desktop width, and in light and dark when you picked both.
8. Four actions: **Pick**; **Closer to this one** (new Options near the picked one, by continuous variation of its parameters; repeatable); **Skip** (takes the default; recorded as defaulted); **Back** (reopens a Step; the tool re-checks later Decisions and flags each conflict).
9. The tool records each **Decision**: picked Option, rejected Options, reason.

### 4.2 Stages and Steps (about 30 Steps per template)

| Stage | Steps | Seed content |
|---|---|---|
| 1. Brief (words only) | product and audience · the one primary job · real content · brand tensions as either/or picks · anti-goals · references. The tool refuses "modern and clean" and asks a concrete either/or. | Your brief template §§2–5; 24-question intake |
| 2. Structure (grayscale) | page type · navigation · layout skeleton · content width · what the eye finds first · density | Your navigation and layout tables; the plugin's 5 structural forks |
| 3. Feel | typeface personality · heading treatment · base size and scale · number style · neutral temperature · accent strategy · light, dark, or both · radius · elevation language · border weight · icon set · one signature element | Exemplar research; your type, color, and style catalogs |
| 4. Behavior | motion budget · curve character · loading style · mutation style (confirm versus optimistic with undo) · form validation · focus style · empty and error states · voice, capitalization, error tone | Exemplar research; your state lists and error formula |
| 5. Checks | automatic accessibility and intuitiveness report; each check that a machine cannot perform becomes an acceptance criterion | Your 11-question protocol; WCAG 2.2 |
| 6. Read-back and export | the tool reads back every Decision (your standing rule), then exports | ClearPath selection record |

### 4.3 The Prescription (export bundle), in three layers
1. **Your Decisions:** each pick with its rejected Options and exact token values.
2. **The craft layer (automatic):** about 50 invisible-detail rules, each parameterized by your Decisions (for example, your motion budget sets the durations). Written in our own words, with sources cited.
3. **The floors (automatic, not overridable):**
   - *Accessibility:* WCAG 2.2 AA criteria as testable acceptance checks. The tool never claims "compliant"; it states what it checked and what a person must still check.
   - *Security:* no secrets in browser code; the server enforces every permission; database row-level rules on; all input untrusted and never inserted as raw HTML; a Content Security Policy; HTTPS; verify each dependency before installing.
   - *Search (public pages):* one `h1`; semantic HTML; unique title and meta description; descriptive links; image `alt` and dimensions; canonical URL; Open Graph tags; structured data; content present in delivered HTML.
   - *Performance:* LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; sized images; self-hosted fonts with metric-matched fallbacks.

Files: `PRESCRIPTION.md` (your master prompt §12, filled in; it starts at "implement one complete vertical slice" because you already chose the direction), `DESIGN.md` (Google Labs format, checked with its own lint tool), `tokens.json` (Design Tokens 2025.10), `tokens.css`, a shadcn theme file, `mockup.html` (the visual reference), and `FONTS.md` (which open-licensed fonts to self-host, and how).

### 4.4 The Fitter (Claude Code plugin)
- `/fit-build`: Claude reads the Prescription and builds one screen at a time, starting with a "kitchen sink" page that shows every component in every state.
- `/fit-check`: scripts render the build at 375, 768, and 1280 px, in each theme, and measure:
  - *Token fit:* every rendered color, font size, radius, and spacing value must exist in `tokens.json` (read from computed styles, not from keywords in source).
  - *Reference fit:* side-by-side and pixel-difference against `mockup.html`.
  - *Accessibility:* axe, a scripted keyboard walk, measured target sizes, 200% zoom, reduced-motion.
  - *Craft rules:* each machine-checkable rule (for example, no `transition: all`; focus ring visible; tabular numerals on tables).
  - *States:* every required state reachable and rendered.
- `/fit-repair`: Claude receives the measured failures plus the screenshots, critiques against your scorecard, repairs the smallest thing, and re-checks. Budget: 3 rounds, then it reports.
- *Honest receipt:* every report separates "measured," "judged by the model," and "still needs a person" (screen reader, real users). No claim exceeds its evidence.
- `/fit-suggest`: Claude proposes new Options as catalog records; the Studio imports them only if they pass the schema and the floor checks. (No API key ever sits in the browser.)

This replaces your `luminous-cognitive-ui` plugin, whose checks pass on keywords in source code. I reuse its sound parts: the color math, the five structural forks, and the "honest receipt" idea.

### 4.5 Protection against your own sameness
Because one person will build many products with one tool, the tool keeps a **taste ledger**: the Decisions of every past project. When a new project repeats a past combination, the Studio says so and offers the nearest unused alternatives.

## 5. Templates (Mockup families) and their order

You selected all four kinds. I build them in this order; you can change the order in `DECISIONS.md`.
1. **Small-business website** (home, inner page, contact or booking form) — the quickest product for you to sell.
2. **Guided intake flow** (one question per step, summary) — your ClearPath example supplies the content.
3. **Dense operational app** (table, filters, detail pane, form, schedule) — where LLM output is weakest.
4. **Consumer or SaaS app** (landing page, onboarding, main screen, settings).

## 6. Form, coding languages, and what we borrow

**Form.** A web app for the Studio, because the Mockup must be real HTML and CSS. A Claude Code plugin for the Fitter, because Claude Code is your builder. One repository holds both and a shared core.

**Stack** (versions checked against the npm registry on 2026-11-13): TypeScript 7.0; React 19.3 + Vite 8.3 (static single-page app); React Aria Components 1.22 for the Studio's own controls; Zustand 5; Zod 4; plain semantic HTML + CSS custom properties for Mockups in a sandboxed iframe; IndexedDB storage plus file export; Vitest 5; Playwright 1.65; axe-core 4.14.

**Borrowed, with licenses verified (all permit your use and your commercial outputs):**

| Need | Source | License |
|---|---|---|
| Color math, OKLCH | culori | MIT |
| Colors generated to hit a target contrast | Adobe Leonardo | Apache-2.0 |
| Role-based 12-step scales (model and presets) | Radix Colors | MIT |
| Fluid type and spacing scales | utopia-core | ISC |
| Text trim and metric-matched fallback fonts | Capsize | MIT |
| Self-hosted open fonts | Fontsource (fonts mostly OFL) | MIT + per-font |
| Token validation | Terrazzo parser | MIT |
| DESIGN.md format and lint | `@google/design.md` (alpha; pinned) | Apache-2.0 |
| Component markup conventions for Mockups and export | shadcn/ui theme and registry format | MIT |
| Icons | Lucide (ISC), Tabler (MIT) | permissive |
| Craft rules (restated in our words, cited) | Vercel Web Interface Guidelines; Emil Kowalski skills; Jakub Krehel skills | MIT |
| Anti-default rules | Anthropic frontend-design skill; Impeccable (62 rules) | Apache-2.0 (keep notices) |
| Few-shot critique examples for `/fit-repair` | UICrit dataset | CC-BY-4.0 |
| Checks | axe-core (MPL-2.0, unmodified), Playwright, html-validate, stylelint, size-limit, dependency-cruiser | permissive |

**Rejected:** `apca-w3` (its license prohibits commercial use; WCAG 2 contrast is the legal standard anyway); Realtime Colors code (non-commercial license); unDraw; unlicensed repositories; open website-generation models on Hugging Face (they generate whole sites and score below the model you already use); open vision models for critique (Claude, already in your loop, is stronger). `tokens.json` and `DESIGN.md` being open standards means your Prescription also works in Stitch, Lovable, v0, and Cursor if you ever want them.

**Where the Studio runs.** During the build I publish each working version as a private page on claude.ai so that you can use it with no setup. At M8 you choose its permanent home: that private page, a free static host with access control, or your own PC.

## 7. Security and codebase quality of the tool itself

| Threat | Control |
|---|---|
| Pasted content or an imported file carries script | Zod validates every import against a versioned schema; text renders as text; no `innerHTML` (lint rule) |
| The Mockup iframe attacks the app | `sandbox` without `allow-scripts` and without `allow-same-origin`; Mockups contain no script |
| Injected script from any source | Strict Content Security Policy and Trusted Types wherever the host lets us set headers |
| A compromised npm package | Few dependencies; exact pins; lockfile and `npm ci`; install scripts off; `npm audit` and Dependabot in CI; Actions pinned by commit hash |
| Third-party tracking or outage | No CDN scripts, remote fonts, or analytics; all assets self-hosted |
| Pasted content manipulates the LLM that reads the Prescription | The exporter fences your content as quoted data labeled "content, not instructions" |
| `/fit-suggest` output is hostile or malformed | It must parse as catalog data and pass floor checks; never rendered as markup |

Codebase rules:
- **Strictness:** TypeScript `strict` and `noUncheckedIndexedAccess`; ESLint with zero warnings; Prettier.
- **Boundaries:** `core` (catalog data → pure engine → exporters; no React, no browser APIs) is shared by `studio` and `fitter`. dependency-cruiser rejects any import that points the wrong way.
- **Catalog as data:** a new Step, Option, or craft rule is a data record. A schema test rejects a record without plain-language text, source, evidence grade, review date, or a passing floor check.
- **Saved projects:** every file carries a schema version; migrations upgrade old files; a test loads a file from each past version.
- **Resilience:** error boundaries; autosave after every Decision; "export my project" always available.
- **The tool obeys what it teaches:** the Studio's own UI uses its own tokens, the craft layer, and the floors. At M4 we choose the Studio's look with the Studio itself.

## 8. Build governance: milestones, backstops, waypoints, red team

**Milestones.** I do not start a milestone until the previous one meets its exit test.

| # | Milestone | Exit test |
|---|---|---|
| M0 | Proof experiment: ClearPath built from a vague prompt versus a hand-made Prescription, same model, fresh sessions | Screenshots, axe results, and scorecard reported; you judge blind; you confirm the gate |
| M1 | Repository skeleton, CI, governance files, research files, session setup script | CI green; boundary rule and hostile-import test in place |
| M2 | Core engine: Steps, Decisions, dependency re-checks, floor checks, token derivation | Unit tests pass; `core` imports no React |
| M3 | Preview and Template 1 Mockup | One token change alters exactly one variable (pixel-difference test) |
| M4 | Step screen with Stages 2 and 3 | You use it on the private page; keyboard-only pass; you pick the Studio's own look |
| M5 | Full catalog for Template 1; craft layer; floors | End-to-end test walks every Step; axe finds no serious violation in any Option |
| M6 | Export bundle | Snapshot tests; `tokens.json` and `DESIGN.md` pass their validators |
| M7 | Fitter: build, check, repair | On a deliberately flawed build, `/fit-check` finds every planted defect and no false blocker |
| M8 | **Your first real project, end to end** (a small-business site you can sell); hardening | You judge the result; red-team blockers at zero; M0 comparison repeated with a tool-made Prescription |
| M9–M11 | Templates 2, 3, 4 | Same tests as M5–M7 per template |
| M12 | Taste ledger; `/fit-suggest` | Repeat-combination warning works across two projects |

**Backstops against drift.**
- `PLAN.md` (this plan) and `CLAUDE.md` (defined terms, stack, boundaries, "no work outside the current milestone") live in the repository; every session reads both first.
- `DECISIONS.md` records each departure from the plan, with the reason and your approval. I obtain your approval before I change scope, stack, or a defined term.
- `PROGRESS.md` states the current milestone, what is done, what is next, and what is unverified, so that a fresh session resumes without guessing.
- CI is the mechanical backstop: type check, lint, boundary rule, unit and end-to-end tests, axe, bundle budget, dependency audit. I do not mark a milestone complete on a red run, and I do not skip or disable a test to get green.

**Waypoints (saved and backed up).**
- After every completed unit of work: commit and push to `claude/brave-mayer-sawqz9` (GitHub is the primary backup; my container is temporary).
- At every milestone: update `PROGRESS.md`, record the commit hash in `WAYPOINTS.md`, and upload a zip snapshot to a `Claude/backups` folder in your Google Drive. I ask you once before the first upload.
- Rollback: any waypoint restores with one `git checkout` of its recorded hash.

**Red-team swarm (three adversarial reviewers).** They run in the background at the end of every unit of work and at every milestone gate. They receive the code and the running app, not my conclusions. This is frequent checkpoint review, not second-by-second monitoring.
1. *Security attacker:* script injection through pasted content and imports; sandbox and policy probes; dependency audit.
2. *Confused first-time user:* drives the Studio with Playwright, keyboard only and at 200% zoom, with no design vocabulary; reports every confusion, jargon term, and dead end.
3. *Drift and truth auditor:* compares the repository with `PLAN.md`; hunts scope creep, untested claims, unsourced catalog rules, and inconsistent defined terms.

Findings go to `redteam/FINDINGS.md` with severity (blocker, major, minor), evidence, and status. A blocker stops the milestone. I report the open-findings count at each milestone.

## 9. What can go wrong, and the response

| Risk | Response |
|---|---|
| The Prescription does not improve Claude's output | M0 tests this before any app code; if it fails, we revise the format first |
| The build drifts from the Prescription over a long session | The Fitter measures computed styles against tokens on every check; fresh sessions re-read the Prescription |
| Too many Steps | Skip takes the default; autosave; a "quick fit" path of about 8 Steps |
| All your products start to look alike | Taste ledger; "closer to this one"; `/fit-suggest`; versioned catalog |
| An upstream change breaks later Decisions | The engine re-checks dependents and flags each conflict; it never changes a Decision silently |
| Automated checks miss accessibility problems | Manual checks become explicit acceptance criteria; the honest receipt names what no machine checked |
| A craft rule is opinion presented as fact | Each rule carries an evidence grade and a source; you can switch off any opinion-grade rule per project |
| Unverified claims in source files (2026 arXiv numbers, psychophysics rules) | The catalog admits sourced, durable rules only |
| `@google/design.md` is alpha and changes | Version pinned; `tokens.json` remains the source of truth |
| The private-page host restricts the iframe or policy headers | Verified at M3; fallback is a static host where we control headers |
| I lose context between sessions | `PROGRESS.md`, `CLAUDE.md`, waypoints, and a saved session setup script |

## 10. Re-evaluation: what the earlier drafts missed (now fixed)

1. They deferred the feedback loop to "Phase 2." It is half of the problem; the Fitter is now core (4.4).
2. They had no craft layer; picks alone do not produce a bespoke feel (3, 4.3).
3. They did not ground Options in named exemplars (3, 4.1).
4. They borrowed code without a license review (6).
5. They planned two templates; you build four kinds of product (5).
6. They ignored the Studio's own design quality (7).
7. They ignored sameness across your own projects (4.5).
8. They left hosting unspecified (6).
9. They omitted font licensing and loading in your outputs (`FONTS.md`).
10. They omitted phone-width and dark previews of each Option (4.1).
11. They named APCA contrast without checking its license (6).
12. They placed a real project after the tool was "finished"; it is now M8.
13. They carried commercial machinery (accounts, payments) that you do not need; removed.
14. They did not say how a new session resumes fast; added a setup script and `PROGRESS.md` (8).

## 11. File and research status

- **Read in full:** all 15 Drive files and every text file in both zip archives (`map.pdf` read visually).
- **Read in part:** four small plugin scripts (function lists) and three large HTML exemplars (structure).
- **Your five links:** I read `champi-dev/front-end-best-practices` (its single-source-of-truth and separation-by-responsibility rules are in section 7). This session's network blocks `netguru.com`, `dev.to`, `docs.gitlab.com`, and `sitepoint.com`; I saw search summaries only.
- **Exemplar research:** the published rule sets (Vercel, Emil Kowalski, Jakub Krehel, GOV.UK, Radix) were read in full on GitHub. The company posts (Linear, Stripe, Apple, and others) were seen as search snippets, because the network blocks those hosts.
- **Absent from your folder:** `blueprint-v1.md`, `hugging-face-llm-review.md`, the `research/` files, and the deep-dive folders that your files cite.
- **Could not reach:** your PC's Downloads folder; the hosts named above.

## 12. Verification

1. `npm run test`: contrast math, token derivation, dependency re-checks, migrations, export snapshots.
2. `npm run e2e`: Playwright walks every Step on each template and exports; validators pass on `tokens.json` and `DESIGN.md`.
3. axe scan of the Studio and of every Option of every Step.
4. Keyboard-only walkthrough of the Studio.
5. Security: a hostile import (script in every text field) renders as inert text; the Mockup iframe cannot reach the parent; `npm audit` reports no high or critical issue.
6. Fitter: on a build with planted defects (off-token color, missing focus ring, missing empty state, small target), `/fit-check` reports each one.
7. M0 and M8 comparisons, judged blind by you.
8. `redteam/FINDINGS.md` shows zero open blockers at each milestone.

## 13. First actions after approval

1. Request network access to the blocked hosts (your four links; the exemplar sites; `stitch.withgoogle.com`), read each in full, and record any resulting change in `DECISIONS.md`.
2. Commit the governance and research files as the first waypoint; open a draft pull request.
3. Run M0 and report to you.
4. On your confirmation, proceed M1 through M4 with the red team running, and put a working Step screen in front of you.
