# M0 proof experiment: results (2026-11-13)

## Method
- Product: the fictional ClearPath Legal Clinic intake flow.
- Two fresh builder agents, same model, same product facts (`prompts/shared-product-facts.md`), one self-contained `index.html` each. Neither could see the other's instructions.
- Build A received the vague prompt (`prompts/build-a-vague.md`). Build B received the hand-assembled Prescription (`prescription/PRESCRIPTION.md`). Build B had no visual reference Mockup, so this test understates what the finished tool supplies.
- One harness (`eval/measure.cjs`) measured both. Two harness defects surfaced and were fixed before the final run (a form-filler that typed into optional date boxes; a walker that waited on a button disabled during sending). Neither defect was a fault of a build.
- Blind labels on the contact sheet: **X = Build B (Prescription)**, **Y = Build A (vague)**.

## Measured (machine checks; identical rules for both)

| Check | A (vague) | B (Prescription) |
|---|---|---|
| Happy path reaches confirmation | yes | yes |
| Server-error and offline: failure copy shown, answers kept, other contact methods visible | yes | yes |
| Slow response completes once | yes | yes |
| Refresh keeps the topic | yes | yes |
| axe violations, home, 1280 px | 1 serious (`label-content-name-mismatch`) | 0 |
| axe violations, home 375 px and end of flow | 0 | 0 |
| Empty-topic error: `role="alert"` summary and `aria-invalid` | neither (message text only) | both |
| Keyboard stops without visible focus | 0 | 0 |
| Horizontal overflow at 320 px | none | none |
| Distinct text sizes rendered (home) | 7 | 4 |
| Distinct background colors | 4 | 2 |
| Distinct corner radii | 3 | 1 |
| Shadows | 1 (inset accent) | 0 |
| Icons or images | 4 | 0 |
| Font families | 1 (system sans) | 2 (serif titles, sans body, as prescribed) |
| Interactive targets under 44 px (phone) | 3 | 2 |
| File size | 60 KB | 40 KB |
| External requests, `innerHTML` writes, inline handlers | 0 | 0 |

## Observed in the screenshots (the main session's judgment, not a measurement)
- **Build A is competent.** A vague prompt no longer yields broken work from this model. It also shows the familiar defaults: an invented logo, an ALL-CAPS eyebrow label, a two-color headline, a numbered "what you will do" card, card containers, and icons.
- **Build A invented content and features** that nobody asked for: a "What this site does / does not do" section, hints under topics, a third "I'm not sure" answer, dark mode, and a "clear my answers" control. For a legal-services product, invented content is a risk.
- **Build B followed all 23 Decisions.** Serif titles, teal action, no cards, no icons, no shadows, "Step 2 of 6," "Your answers so far" with Change links, outcome-named buttons. It added only connecting copy, and it listed every deviation itself.
- **Build B is plainer.** It looks deliberate and calm, close to a government service. Whether that is "better" depends on the Decisions, which is the point: the look came from the Prescription, not from the model's defaults.

## What M0 does and does not show
- **Shown:** a Prescription gives control. The model obeyed nearly every Decision, craft rule, and floor, and the result is measurably more disciplined (fewer distinct values, zero axe violations, proper error semantics, no invented content).
- **Not shown:** that a Prescription makes a build more attractive by itself. Attractiveness comes from the quality of the Options that the Studio offers. A dull set of picks yields a faithful, dull build.
- **Consequence for the plan:** the Catalog's taste (the Options and the craft layer) carries the value; the Fitter guards fidelity. One build per arm is a single sample, not a statistic.

## Not checked
Screen reader behavior, real users, print output, 200% zoom, and forced-colors mode.
