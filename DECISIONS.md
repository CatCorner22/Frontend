# Decisions

Each entry records a decision that shapes the project, or a departure from `PLAN.md`, with the reason and who approved it.

| # | Date | Decision | Reason | Approved by |
|---|---|---|---|---|
| D1 | 2026-11-13 | The tool is for the owner's personal use only. No licensing to others, accounts, payments, or marketing. | The owner chose this after the market research. | Owner |
| D2 | 2026-11-13 | The tool has two halves: the Studio (web app) and the Fitter (Claude Code plugin). | The owner's files name two causes of generic LLM UI: missing decisions and a missing feedback loop. | Owner (plan approval) |
| D3 | 2026-11-13 | Claude Code is the target builder. | The owner chose it. | Owner |
| D4 | 2026-11-13 | Template order: small-business website, guided intake flow, dense operational app, consumer or SaaS app. | The owner selected all four kinds; the first is the quickest to sell. The owner may reorder. | Owner (plan approval) |
| D5 | 2026-11-13 | Option source is hybrid: a curated Catalog drives every Step; Claude proposes extra Options through the Fitter (`/fit-suggest`), never through an API key in the browser. | Predictable quality; no key handling in the browser. | Owner (plan approval) |
| D6 | 2026-11-13 | Reject `apca-w3`, Realtime Colors code, unDraw, and unlicensed repositories. | License terms (see `docs/research/05-…`). | Owner (plan approval) |
| D7 | 2026-11-13 | Canonical values: states = default, hover, focus, active, disabled, loading, empty, error, success, offline, permission, overflow; viewports = 375, 768, 1280 (plus 320 px reflow and 200% zoom checks); spacing base = 4 px; target size = 24 px floor, 44 px default; performance thresholds use "≤". | The owner's files conflict on each of these. | Owner (plan approval) |
| D8 | 2026-11-13 | Add visual-regression checks (Playwright screenshot comparison) as a required CI gate. | Netguru's process article (one of the owner's links) makes this a per-change gate; it also serves the M3 exit test. Within the plan's scope. | Recorded; no scope change |
| D9 | 2026-11-13 | Read the DESIGN.md specification from the `google-labs-code/design.md` GitHub repository. | `stitch.withgoogle.com` does not resolve from this environment even after the host was allowed. | Recorded; no scope change |
| D10 | 2026-11-13 | Leave `sitepoint.com/20-docs-guides-front-end-developers` unread. | The site refused automated access (HTTP 403). Circumventing a bot check is not appropriate. The owner can paste the list if it matters. | Recorded |
| D11 | 2026-11-13 | The Prescription's search floor uses INP, not FID. | The dev.to SEO article (one of the owner's links) lists First Input Delay; Google replaced FID with Interaction to Next Paint. | Recorded; no scope change |
