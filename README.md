# Refraction (placeholder name)

A personal tool that helps one person get LLM-built frontends much closer to careful human work.

**The eye exam.** The **Studio** asks "which is better, 1 or 2?" one design decision at a time, on your own content, and writes a **Prescription** (a Markdown prompt plus token files).

**The fitting.** The **Fitter** (a Claude Code plugin) makes Claude build from the Prescription, look at the rendered result, measure it against your picks, and repair it.

## Where to look

| File | Purpose |
|---|---|
| `PLAN.md` | The approved plan |
| `PROGRESS.md` | Where the project stands now |
| `DECISIONS.md` | Every decision and departure from the plan |
| `WAYPOINTS.md` | Saved states that the project can return to |
| `CLAUDE.md` | Standing rules and defined terms for every session |
| `docs/research/` | The research records behind the plan |
| `redteam/FINDINGS.md` | Adversarial review findings |
