# Progress

A fresh session reads this file to learn where the project stands. Update it after every unit of work.

## Current milestone: M4 — Step screen released to the owner (awaiting the owner's trial)

**State.** The Studio runs: 14 Directions plus a Direction generator; 22 Steps in Stages 2 (Structure) and 3 (Feel); a large sandboxed preview that opens at the region where each change shows; option tiles with color chips and type specimens; "Closer to this one"; hand fine-tuning; contrast profile Off / Advise / Enforce; project save, load, and file export; a Summary view.

**Exit test for M4.** The owner uses the Studio on the private page; keyboard-only pass; the owner picks the Studio's own look.

## Done

- 2026-11-13: Reviewed all 15 of the owner's Drive files and both zip archives (`docs/research/01`–`03`).
- 2026-11-13: Researched exemplar frontends, borrowable code and licenses, and the market (`docs/research/04`–`06`); read the owner's links (`07`); extracted verified token values from 37 open design systems (`08`, `data/exemplar-tokens.json`).
- 2026-11-13: M0 proof experiment (`phase0/RESULTS.md`). Gate confirmed by the owner (D12).
- 2026-11-13: M1 skeleton: workspace, strict TypeScript, lint rules that forbid HTML injection, boundary rule, CI with pinned actions.
- 2026-11-13: M2 core engine with 27 unit tests: color math, token derivation, accessibility profiles, engine, conflicts, validated import, Directions, generator.
- 2026-11-13: M3 Template 1 Mockup (small-business website) with the finish layer: 8 depth styles, 7 atmospheres, 5 button finishes, 3 headline fills, 3 motion levels.
- 2026-11-13: M4 Studio built and checked in a browser (no console errors; flows work; no horizontal scroll at phone width; light and dark viewer themes).

## Next

1. The owner tries the Studio and reports what works and what does not.
2. M5: import the knowledge base into the Catalog (teaching text, craft layer, floors); Stage 1 (Brief, real content) and Stage 4 (Behavior) Steps; use `data/exemplar-tokens.json` and `data/sleek-recipes.json` for more palettes, shadow recipes, and finishes.
3. M6: export bundle (Prescription, DESIGN.md, tokens, reference Mockup) as a zip.
4. M7: the Fitter plugin.

## Running in the background when this file was written

- Knowledge-base research, part 1 (perception and cognition) → `docs/knowledge/kb-perception-cognition.json`.
- Knowledge-base research, part 2 (aesthetics, satisfaction, intuitiveness) → `docs/knowledge/kb-aesthetics-satisfaction.json`.
- Sleek-finish CSS recipes from open codebases → `docs/research/data/sleek-recipes.json`.
Check whether these files exist before assuming that the research finished.

## Known gaps (stated plainly)

- The red-team reviewers have not yet run on the Studio. Run them before M4 is marked complete.
- No end-to-end test suite in CI yet (Playwright runs were manual scripts in the scratchpad). Add `npm run e2e` in M5.
- The dependency audit shows 9 moderate advisories, all from one glob-matching package inside the lint tool (development only; nothing ships to the browser). No fix exists without downgrading the lint tool.
- Three stack substitutions await the owner's acknowledgment: D16 (TypeScript 6.0), D17 (own color math, no culori), D22 (native controls, no React Aria yet).
- The private page's host could not be tested from this environment. The page reports plainly if the host blocks embedded previews.

## Unverified or open

- The DESIGN.md specification: read it from `google-labs-code/design.md` before M6 (decision D9).
- Whether the claude.ai private page allows a sandboxed iframe: verify at M3.
- Company design posts (Linear, Stripe, Apple) were seen as search snippets only; `linear.app`, `stripe.com`, `vercel.com`, and `rauno.me` are now allowed hosts. Read them before authoring the Feel and Behavior Catalog (M5).
- GitLab's security, accessibility, testing, and dependency sub-guides: unread.
- Google Drive backup snapshots: the owner's permission is pending.

## Environment notes

- Cloud environment name: "engine". Allowed hosts added on 2026-11-13: `www.netguru.com`, `dev.to`, `docs.gitlab.com`, `www.sitepoint.com`, `stitch.withgoogle.com`, `linear.app`, `stripe.com`, `vercel.com`, `rauno.me`.
- `WebFetch` cannot resolve these hosts; `curl` through the session proxy can.
- The owner's source files live in Google Drive, folder "Claude". The owner's PC does not offer its Downloads folder to cloud sessions.
