# Waypoints

A waypoint is a pushed commit that the project can return to. To restore one: `git checkout <commit>`.

| # | Date | Milestone | Commit | State | CI | Drive snapshot |
|---|---|---|---|---|---|---|
| W0 | 2026-11-13 | Before M0 | `fffe79d` | Plan, standing rules, decisions, research records | no workflow yet | not yet (owner's permission pending) |
| W1 | 2026-11-13 | M0 | `84f44f6` | Proof experiment: two builds, harness, results | no workflow yet | not yet |
| W2 | 2026-11-13 | M1–M2 | `a539e59` | Workspace, CI, core engine, first Catalog, tests | **failed**: the type check covered the Studio folder before it had source files (a sequencing mistake; no code defect) | not yet |
| W3 | 2026-11-13 | M3–M4 | `d0bdd9a` | Finish layer, 14 Directions, generator, Studio app; private page published (version 1) | passed (type check, lint, boundaries, unit tests, audit) | not yet |
| W4 | 2026-11-13 | M4 in progress | `ab07a6a` | After the first red-team review: engine, contrast checks, Catalog sources, storage, and Step screen repaired; pixel-difference tests added. M3's exit test now runs in CI. M4 is not complete. | see the CI run for this commit | upload failed (connector errors) |
| W5 | 2026-11-13 | M4 in progress | `0aa239d` | Literal names for every Step, Option, and slider. Second red-team review: 3 blockers fixed and tested; 7 of 12 major findings fixed or corrected. Visual tests draw text the same way on every machine. M4 is not complete. | CI run 29 passed on `9ae7892`; see the CI run for this commit | not sent (no upload attempted; the W4 upload was refused for size) |
