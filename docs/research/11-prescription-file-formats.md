# Research record 11: the formats of three Prescription files

Written on 2026-11-16 by the builder, for requirement 2.9 of `SPEC.md`. Decision D63 (point 3) asks that a source be read in full before the Studio builds on it; this record says what was read, where, and what was not checked.

## What was read in full

| Source | Where | Read on | What the Studio takes from it |
|---|---|---|---|
| The DESIGN.md format, specification (version "alpha") | repository `google-labs-code/design.md`, file `docs/spec.md` (16,574 bytes) | 2026-11-16 | The file's two parts (YAML values and Markdown prose); the keys `version`, `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`; the eight sections and their fixed order |
| The DESIGN.md tool, its README | the same repository, file `README.md` (13,313 bytes); the same text ships in the npm package `@google/design.md` 0.4.0 | 2026-11-16 | The lint program's eleven rules and their severities; the call `lint(text)` from `@google/design.md/linter` |
| shadcn, the page "Theming" | repository `shadcn-ui/ui`, file `apps/v4/content/docs/(root)/theming.mdx` (12,665 bytes) | 2026-11-16 | The 31 color names and `radius`; that a `-foreground` name is the text on its surface; that the dark look repeats the names under `.dark` |
| The Design Tokens format | repository `design-tokens/community-group` (types, design-token, groups, color-type) | 2026-11-15 | See the head of `packages/core/src/prescription.ts` |

## Facts that matter for the Studio

1. **DESIGN.md sections must stand in this order:** Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. A second heading of the same name is an error, and so is a top-level key that is defined twice.
2. **A color in DESIGN.md is any CSS color; a length has the unit px, em, or rem.** A value such as `clamp(...)` is no length there, so a size that grows with the window cannot stand as a typed value.
3. **The lint program reports an error only for a reference that leads nowhere** (`broken-ref`). Its other ten rules give warnings or notes: among them a pair of component colors below 4.5 to 1, a color that no component uses, and sections out of order.
4. **The format calls itself "alpha".** Its section on components says that it "is actively evolving". A file written today may need a change when the format changes.
5. **shadcn's names are pairs.** `--primary` is a surface and `--primary-foreground` the text on it. The Studio maps each pair to a pair that its own contrast checks measure, where it has one.

## What was not checked

- **Neither outside program was run.** The session's permission check refused to run the DESIGN.md lint program and no attempt was made to run the Design Tokens parser after that (decision D64). Every statement above about the lint program comes from its README, not from a run.
- **The licence of `@google/design.md`.** Its `package.json` has no licence field (seen on 2026-11-16). The package holds a `LICENSE` file; research record 05 reports the repository's licence as Apache-2.0. The builder has not read that file.
- **Whether the pages read on GitHub equal the published web pages.** The web addresses `ui.shadcn.com` and `designtokens.org` are not reachable from this environment; the repositories are.
- **Publication dates** come from the npm registry: `@google/design.md` 0.4.0 on 2026-07-27, `@terrazzo/parser` 2.10.0 on 2026-10-21. Both are older than 7 days (decision D27).
