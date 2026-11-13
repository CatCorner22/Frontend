# Progress

A fresh session reads this file to learn where the project stands. Update it after every unit of work.

## Current milestone: M0 — proof experiment

**Goal.** Test the core claim before writing any app code: does a Prescription make Claude build a visibly better frontend than a vague prompt does?

**Method.** Product: the fictional ClearPath Legal Clinic intake flow from the owner's `example-legal-services-brief.md`. Two fresh agents, same model, same stack (one self-contained HTML file):
- Build A receives a vague prompt.
- Build B receives a hand-assembled Prescription (Decisions, craft layer, floors, tokens).

Then: screenshots at 375, 768, and 1280 px; axe; the scripted keyboard walk; scoring against the scorecard. The owner judges the screenshots blind.

**Exit test.** Screenshots, axe results, and scores reported; the owner confirms the gate.

## Done

- 2026-11-13: Reviewed all 15 of the owner's Drive files and both zip archives (`docs/research/01`–`03`).
- 2026-11-13: Researched exemplar frontends, borrowable code and licenses, and the market (`docs/research/04`–`06`).
- 2026-11-13: Read four of the owner's five links (`docs/research/07`).
- 2026-11-13: Plan approved (`PLAN.md`). Governance files created.

## Next

1. Run M0 in `phase0/`.
2. On the owner's confirmation: M1 (repository skeleton, CI, session setup script).

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
