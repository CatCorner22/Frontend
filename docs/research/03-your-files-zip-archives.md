# Review of the two zip archives (knowledge base and luminous plugin)

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

I couldn't follow two parts of your instructions. Partway through, the session switched to plan mode, which allows no file writes. So I didn't create `zip1/` or `zip2/` in the scratchpad and didn't unzip to disk. Instead I read both archives in memory with `python3 -I` and `zipfile`, straight from where the Drive tool saved them. Nothing in them was executed.

I also couldn't compare against your loose files: they aren't in `/home/user/Frontend`, which is empty. The duplicate mapping in section C is therefore by name only.

## A. Locations and file trees

**Saved archives (read-only, nothing extracted):**
- Knowledge zip (245.3 KB): `/root/.claude/projects/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/tool-results/mcp-Google_Drive-blob-1794568246261-6sb84t.zip`
- Plugin zip (213.8 KB): `/root/.claude/projects/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/tool-results/mcp-Google_Drive-blob-1794568259937-b4ewto.zip`

Neither archive contains nested zips or path-traversal entries. Sizes are uncompressed bytes.

**frontend-design-knowledge/**
```
frontend-design-living-reference.md   115,413
llm-frontend-brief-template.md         21,770
frontend-design-sop.md                 12,327
example-legal-services-brief.md        25,931
knowledge/INDEX.md                      5,342
knowledge/sources/ (22 notes, 2.0–2.6 KB each): accessibility-prompts, awwwards-evaluation,
  cognitive-deficits-web-design, core-web-vitals, creative-homogeneity, design-tokens-spec,
  design2code, doj-title-ii-web-rule, eye-tracking-web-study, figmabench, govuk-accessibility,
  mdn-web-standards, no-code-systematic-review, pace-form-components, text-scanning-patterns,
  ui-bench, uswds-design-principles, visual-complexity-first-impressions, wcag-22,
  webgen-bench, webgen-model, websight-model
assets/ui-bench-2025.png 76,635 | .svg 16,263 | verification-loop.png 83,828 | .svg 89,658
```

**luminous-cognitive-ui-plugin (2).zip** (files sit at the zip root)
```
.claude-plugin/plugin.json 827      .codex-plugin/plugin.json 826
MUSE_AND_CROSS_HARNESS_SETUP.md 4,458   README.md 3,693   THIRD_PARTY_NOTICES.md 2,690
agents/cognitive-ux-critic.md 1,972     agents/studio-art-director.md 2,171
commands/linear-way-brief.md 1,487      commands/luminous-ui-audit.md 1,157
hooks/hooks.opt-in.json 399             scripts/hook_verify_ui.sh 202
skills/luminous-cognitive-ui/SKILL.md 7,794
  assets/design_md_skins/: flighty-cockpit 1,048; granola-quiet 464; linear-workbench 531;
                           spatial-showroom 561; swiss-editorial 504
  assets/exemplars/: exemplar_tokens.dtcg.json 3,139; luminous-exemplars-atelier.html 90,387;
                     luminous-multiskin-morphology-studio-source.html 110,312; meridian-flight-radar-source.html 95,355
  assets/tier3_primitives/: optical_wavefield_shader.js 1,362; spring_and_specular_kit.js 1,494
  references/: 01 (13,511) 02 (19,489) 03 (7,795) 04 (9,963) 05 (18,652) 06 (4,118) 07 (3,975)
               08 (5,404) 09 (8,058) 10 (15,992) 11 (8,555) 12 (9,044) 13 (7,461)
  scripts/ (Python): a11y_motion_and_recovery_auditor 8,683; coherence_and_morphology_grader 7,782;
    evogen_actor_and_repair_localizer 13,856; extract_design_md 6,120; gaze_saliency_and_crowding_simulator 12,320;
    headless_visual_qa_runner 6,667; linear_oklch_theme_synthesizer 8,259; oklch_token_synthesizer 11,712;
    run_full_ui_gate 9,627; spring_and_shader_synthesizer 7,444; structural_diversity_and_invariants_sampler 9,274;
    ui_cognitive_and_slop_auditor 23,546; ux_flow_honeycomb_scorer 16,901; viewport_crop_inspector 8,920
```

**What I read and how fully:**
- **Read in full:** every Markdown file, the JSON, the JS, and the larger scripts (sampler, gate runner, honeycomb scorer, slop auditor, a11y auditor, coherence grader, evogen localizer, gaze simulator, Linear OKLCH synthesizer, `extract_design_md`).
- **Docstring, imports and function list only:** `headless_visual_qa_runner`, `oklch_token_synthesizer`, `spring_and_shader_synthesizer`, `viewport_crop_inspector`.
- **Structure only (about 300 KB together):** the three HTML exemplars — titles, headings, external URLs and state hooks.
- **Images:** I didn't view the PNGs. I extracted text labels from the SVGs. `verification-loop.svg` has no text nodes; its labels are probably drawn as paths.
- **Knowledge source notes:** read via an extracted digest (summary and caveats per note), with one note read in full.

## B. The plugin: luminous-cognitive-ui v9.0.0

**What it is:** a Claude Code plugin with one bundled skill, 2 slash commands, 2 subagents, 1 optional hook and no MCP servers. A parallel `.codex-plugin` manifest targets Codex.

**Manifest (`.claude-plugin/plugin.json`), quoted exactly:**
> "name": "luminous-cognitive-ui", "version": "9.0.0", "description": "Cross-harness Human-Craft & Perceptual UI QA Plugin (v9.0.0): Linear /linear-way + 3-input OKLCH synthesizer, Fey/Flighty shape-cached skeletons + 0.00px Privacy Mode, Jakub Krehel optical micro-craft + text-box-trim, Kowalski GPU clip-path pills, unified Jidoka runner (14 offline Python CLI engines), slash commands (/linear-way-brief, /luminous-ui-audit), and opt-in hooks.", "author": {"name": "Luminous Cognitive UI Architecture"}, "license": "MIT AND Apache-2.0"

Keywords: ui, ux, design-engineering, linear, flighty, fey, optical-alignment, eye-tracking, psychophysics, evogenui, accessibility, oklch, apca, muse, claude-plugin. The manifest has no component paths, so it relies on the default directories.

**The skill, quoted exactly:**
> name: `luminous-cognitive-ui` — description: "Architect, audit, and build human-grade low-cognitive-load UI/UX using Linear OKLCH themes, optical micro-craft, eye-tracking gates, and offline browser QA."

**Commands:**
- `/linear-way-brief`: "Run Linear-style problem interrogation (/linear-way), adversarial UX Honeycomb critique, and 5-fork structural leaf sampling before writing UI code." It runs the sampler and the OKLCH synthesizer, then outputs a build brief of 15 lines or fewer.
- `/luminous-ui-audit`: "Execute the full Luminous Cognitive UI v9.0.0 Jidoka audit (Chromium actor trace, 0.00px privacy shift, fold visibility, 1s UEyes gaze, Wilkins glare FFT, coherence, and ranked a11y/motion receipt)."

**Agents:**
- `cognitive-ux-critic`: an adversarial reviewer that won't rubber-stamp. It enforces domain isolation, asks the three "/linear-way" questions, argues against the weakest UX Honeycomb facet, and demands a passing `run_full_ui_gate.py --strict`.
- `studio-art-director`: craft mandates — lock one of the 5 skins, a 3-input OKLCH palette, raised-button versus recessed-input lighting, Krehel typography polish, zero-shift privacy masking, clip-path tab pills.

**Hook:** `hooks.opt-in.json` is not active by default; you copy it to `hooks.json` to enable it. It adds a PostToolUse hook on `Write|Edit` that runs `scripts/hook_verify_ui.sh`. That script calls `ui_cognitive_and_slop_auditor.py --claude-hook`, which exits 2 on errors.

**Workflow (from SKILL.md):**
- **Phase 0:** ask three questions (what decision is this screen for, in 3 clicks or fewer; what are we assuming; which 30% of the chrome can go). The critic argues against the design. The sampler picks a 5-fork structural "leaf". Every workflow verb must map to a control and counts must be derived from data. Six self-explaining-UX pillars apply.
- **Phase 1:** for an existing codebase, extract a DESIGN.md and save a control contract. For a new app, pick a skin and synthesize tokens from base, accent and contrast.
- **Phase 2:** craft and psychophysics — lighting, optical typography, privacy masking, shape-cached skeletons, interruptible transitions, and seven "gates" (UEyes, Bouma, Wilkins, the 55–68ch measure, the fold rule).
- **Phase 3:** ranked accessibility repair order (names → native elements → modal trap with Escape restore and closed-overlay inertness → headings → `aria-describedby` → live regions → non-colour glyphs and forced-colors).
- **Phase 4:** `run_full_ui_gate.py` renders 1360×900 and 390×844 in headless Chrome, runs 6 auditors, and emits a JSON receipt plus a `| Gate | Score | Status |` table.

**The code (Python 3 and a little JS):**
- The auditors are regex and string heuristics over HTML/CSS. They check, for example, cream plus terracotta hex codes, `scale(0)`, `transition: all`, "Submit"/"OK" button text, placeholder-only inputs, `outline:none` without `:focus-visible`, more than 5 flat nav links or form fields, tables without `tabular-nums`, and missing reduced-motion queries.
- The actual maths is correct: WCAG luminance and ratio, an APCA approximation, Fitts and Hick calculations, and OKLab/OKLCH conversion with gamut reduction.
- Browser checks use Selenium with Chrome. They probe toggle reversibility, width shift under privacy mode, search-to-DOM propagation, overflow, overlap, fold position and ghost tab stops.
- The gaze tool uses numpy and Pillow: an edge-contrast map times a hand-tuned two-Gaussian "UEyes prior", plus an FFT stripe detector.

**How complete and working it looks:**
- It is structurally coherent and each script has a self-test.
- It is fragile:
  - The docs claim pure standard library, but the scripts need `selenium`, Chrome, `numpy` and `PIL`.
  - The browser probes rely on magic selectors such as `#btn-privacy`, `.metric-figure`, `#stage-root` and `[data-set-state="break"]`, so real apps mostly skip or false-pass those checks.
  - The keyword checks can be passed by writing the words "undo", "empty", "loading" and "error" into a comment.
  - The sampler's self-test message says "360-leaf 8.49-bit", but the code gives 540 leaves / 9.08 bits.
  - The "sampling" is just a SHA-256 of domain plus goal, so the same brief always gets the same leaf.
  - The scripts carry versions v7, v8 and v9 together.
  - The Meridian exemplar loads Google Fonts, despite the "zero external calls" claim.
- I didn't run any of it.

## C. The knowledge zip

- **`frontend-design-living-reference.md`** (v1.0, owner "the owner", dated 2026-11-13, refresh every 90 days)
  - About 60 rules, each with ID, Rule, Elements, Exceptions, Test, Examples, Policy, Open questions and Last-verified.
  - It uses a restaurant metaphor (UX = the restaurant, UI = the menu and dining room, frontend = the kitchen).
  - Topics: HTML/CSS/JS layering; tokens; responsive testing at 320/375/768/1024/1920 plus 200% zoom; reverse-engineering human design (needs first, user vocabulary, familiar structure with distinctive art direction, a full state inventory); why LLM output looks samey (priors, ecosystem, no context, one-shot generation, "cleaner" removing cues, accessibility debt, randomness).
  - Benchmarks: Design2Code 49%/64%; UI-Bench (Orchids μ 30.08, 67.5% wins, no human baseline); WebGen-Bench 27.8% and 38.2%; FigmaBench's fidelity-versus-responsiveness trade-off; accessibility prompting violation rates of 58% versus 19%; PACE with 26,100 outputs.
  - Also: WCAG 2.2 AA (24px target at AA, 44px is AAA); Title II deadlines 2027 and 2028; cognitive load; eye-tracking cautions; a 7-stage workflow; free tool stack; Hugging Face models; an 8-week learning path; a 100-point scorecard with release gates; prompt patterns.
  - 43 sources graded A–D, plus glossary and index.
- **`llm-frontend-brief-template.md`:** a fill-in brief covering guests, journeys, evidence, content and IA, a state table, house direction, reference decomposition, an anti-sameness check, tokens and components, technical limits, an accessibility matrix, responsive and performance requirements, test scenarios and a decision log. It ends with a master prompt that stages work as restate → 3 directions → wait → slice → test → repair, plus repair, audit and research prompts, 15 questions the model should ask first, and a weak-to-strong prompt table.
- **`frontend-design-sop.md`:** an 8-step process with a responsibility (RACI) matrix, process flow, an edge-case table and metrics.
- **`example-legal-services-brief.md`:** a fully worked fictional brief ("ClearPath" legal clinic): 3 personas, 4 journeys, real copy, a state table, three directions (A selected, B and C rejected with reasons), tokens with computed contrast ratios, acceptance scenarios and a custom master prompt. This is the best "apples to apples" model of selecting between options in either archive.
- **`knowledge/INDEX.md` and the 22 source notes:** one-paragraph summaries, verified quotes, limitations, and verification dates (2026-11-12).

**Likely duplicates of your loose files (by name only):**
- INDEX → `knowledge/INDEX.md`
- frontend-design-sop → `frontend-design-sop.md`
- frontend-design-reference → probably `frontend-design-living-reference.md` (the name differs, so it may be a different version)

FRONTEND-MASTER-GUIDE, blueprint-v2, gap-and-guardrails, source-assessment and map have no counterpart in either zip.

## D. Decision taxonomies (option spaces)

**1. Plugin structural forks** (5×4×3×3×3 = 540 combinations):
- **Pane topology:** focused-document-spine | asymmetric-master-inspector | editorial-two-column-ledger | split-workbench-stage | matrix-comparison-board
- **Organizing entity:** task-stream-first | artifact-canvas-first | cohort-or-role-first | exception-and-bottleneck-first
- **Pre-action surface:** shared-baseline-2to1-metrics | live-interactive-caliper-bar | narrative-status-brief
- **Detail reveal:** inline-progressive-expansion | contextual-dialog-sheet | synchronized-side-dossier
- **Commit and recovery:** optimistic-with-6s-undo | draft-preserving-inline-commit | live-parameter-scrub-with-reset

**2. Morphology axes (ref 08)** and their example options:
- **Containment:** zero cards | dimmed rail with plates | 0px hairline ledger | full-bleed HUD
- **Navigation posture:** inline header | recessed left rail | masthead strip | floating segmented bar
- **Collection grammar:** checkable lines | 36–38px dense rows | numbered ledger rows | specimen wells
- **Vertical rhythm:** information-pyramid
- **Corner family:** 0 | 6–8 | 20–24px, with concentric radii
- **Frequency-gated motion**
- **Shader budget:** at most 4 contexts, and only on tech or gaming surfaces

**3. Five skins:** linear-workbench, flighty-cockpit, granola-quiet, swiss-editorial, spatial-showroom. Each is YAML tokens plus a written rationale.

**4. Four exemplar archetypes:** Cairn clinical intake, Helios dashboard, Veridian treasury ledger, Sona acoustic configurator. Token values are in the DTCG JSON.

**5. Motion by frequency:**
- 100 or more uses a day: 0ms
- Button press: 100–160ms, `scale(.97)`
- Overlays: 150–220ms, `cubic-bezier(.23,1,.32,1)` from `scale(.96)`
- Drawers: 200–280ms

**6. Three theme inputs:** base, accent, and contrast (30–100).

**7. Knowledge zip "directions"** — options must differ in structure, typography, imagery, density, tone and interaction model, not just colour. Examples given: editorial library, guided question flow, expert workbench. Brief template enums:
- Deliverable type: marketing / content / form / dashboard / transaction / editor / game
- Stage: sketch / prototype / beta / production
- Tool route: prompt-to-app / Figma-to-code / coding agent / local model
- Rendering: static / SSR / CSR / hybrid
- Component primitives: native / Radix / React Aria / USWDS / GOV.UK

**8. Required states per element:** default, hover, focus, active, disabled, loading, empty, error, success, offline, permission. The plugin's list is Full / Empty / Loading / Sparse / Error plus a "Break-UI" stress test.

## E. Rules on intuitive design, accessibility and anti-slop

**Intuitive design and cognitive load:**
- Recognition over recall.
- 4±1 items per group (more than 5 ungrouped is flagged).
- Labels placed above inputs and kept visible; errors directly under the field.
- Label chart lines directly instead of using a separate legend.
- Literal headings, not clever ones.
- Put the key words in the first 2–3 words.
- Keep conventional structure and spend originality on craft.
- No reordering menus; pin up to 3 frequent items above a stable list.
- Show current location and step X of Y.
- Back must not lose input.
- Split forms longer than 5 fields into steps with save draft.
- Prefer undo over confirm dialogs, except for irreversible actions.
- Error copy pattern: "Connection lost → Your work is saved → Try again".
- Specific button verbs ("Save changes").
- No autoplay or manipulative urgency.
- Prose at 55–68ch with line-height 1.55–1.65.
- Primary rows above the fold.
- Minimise interaction cost, not just clicks.
- Progressive disclosure must keep context.

**Accessibility:**
- WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and UI elements; 24px targets at AA, 44px is AAA. The plugin enforces 44px.
- The plugin also adds APCA thresholds: Lc 75 / 60 / 45 / 30.
- Native HTML first, ARIA only for real gaps.
- Full keyboard path with focus trap and restore, no positive tabindex.
- Visible `:focus-visible` (2px ring, 2px offset).
- Closed overlays made inert or hidden.
- `aria-invalid` and `aria-describedby` on errors; live and busy regions for updates.
- Never rely on colour alone (shape plus text).
- Support forced-colors, `prefers-reduced-motion`, 200% zoom with rem units, text spacing and reflow.
- Paste allowed in auth fields (SC 3.3.8); single-pointer alternative to dragging (2.5.7).
- 16px or larger mobile inputs.
- Test in layers: automated, manual, AT (assistive technology such as screen readers), then disabled users.
- Never claim conformance from a scanner.
- The plugin's "honest receipt" separates lab checks, static checks, field data (CrUX) and pending human checks.

**Anti-slop:**
- **Plugin bans:**
  - cream (#F4F1EA/#FAF9F5) with serif and terracotta (#D97757)
  - near-black with acid neon or purple gradients
  - 0px broadsheet everywhere
  - identical rounded card kits
  - tracked ALL-CAPS eyebrows
  - "A · B · C" metadata strings
  - "WORD — fragment" labels
  - one italic or coloured word in a heading
  - decorative 01/02/03 numbering
  - "→" on buttons
  - monospace tags on consumer pages
  - Inter, Roboto and Space Grotesk as defaults
  - `scale(0)`, `ease-in`, `transition: all`, transitions of 400ms or more
  - decorative ambient motion
- **Plugin positive levers:** one "signature" element; a "remove one accessory" pass; ask "would a similar prompt produce this same layout?"; keep a log of past looks so you don't repeat them.
- **Knowledge zip stance:** prefer positive art direction over ban-lists. Swap in a competitor's name — if it still fits, it's generic. Palette swaps don't count as divergence. Reject near-identical directions.

## F. Assessment

**Quality:**
- The knowledge zip is careful and honest. It states its limits explicitly, grades its sources, and warns against universal percentages. It is a strong backbone.
- The plugin is ambitious and dense, but over-precise and over-branded: "0.00px", "540 leaves / 9.08 bits", "AUC ~0.85+", "~78–85% of studio craft". Its scores mostly come from keyword checks.

**Contradictions:**
- **Fonts:** the plugin bans Inter, yet three skins and Meridian use it.
- **Vermilion:** ref 08 lists #B63618 as AI-beige slop; the Sona exemplar uses #B63618 as its accent.
- **Broadsheet:** ref 01 calls 0px broadsheets a slop cluster; the swiss-editorial skin is exactly that.
- **Monospace:** Opus guidance bans monospace labels; the skins and the "FIG 0.1" index style use them.
- **Fold rule:** 0.88×vh in SKILL.md, 0.82×vh in ref 13, `vh−40` in code; 58% versus 62% chrome allowance.
- **Leaf space:** 540 versus 360 (code versus self-test message).
- **Offline claim:** "offline / standard library" versus Selenium, Pillow, numpy and Google Fonts.
- **Across archives:**
  - The plugin errors below 44px; the knowledge zip says AA is 24px.
  - The knowledge zip's examples use `<button>Submit</button>`; the plugin flags "Submit".
  - The knowledge zip's sample tokens are warm paper (#F7F4EE) with a Georgia serif, which is close to the plugin's banned "AI beige".
- **Novelty:** the knowledge zip says ban-lists don't create direction; the plugin leans heavily on them.

**Unsourced or shaky claims (plugin):**
- I couldn't verify the many 2026 arXiv IDs or the "Design Creativity Bench" figures.
- Model-behaviour tables for Claude Opus 5.5 / Fable 5.2 and their docs URLs are unverified.
- The amygdala "contour threat" rule for UI corners, pattern-glare pixel periods and the Bouma pixel gaps stretch lab psychophysics into UI rules.
- Valdez-Mehrabian coefficients are used for UI palettes.
- The "UEyes prior" is hand-tuned Gaussians, not the UEyes model.
- Ref 05 cites low-grade vendor blogs, though it does label them as heuristics.

**What you can reuse for your step-by-step option picker:**
1. **Seed decision dimensions.** Use the 5 structural forks and the 7 morphology axes as early layout steps, each option with a one-line description. The motion tiers, corner families, contrast dial and skins work as later "pick one" steps.
2. **The question bank.** The brief template's §§2–11 tables and its "15 questions to ask before designing" map one-to-one onto wizard steps. The ClearPath example shows the pattern your tool emits: 3 directions with rationale, trade-off, accessibility risk and an anti-example; a selection record; preserved decisions.
3. **The output prompt.** The master prompt (§12), the customised ClearPath prompt and the repair, regression and accessibility prompts (§§13–16) are close to your final Markdown file and already tool-neutral.
4. **Guardrails as hard constraints.** WCAG AA values (from the knowledge zip, which is more accurate), the state inventory, recovery rules and release gates. Treat the anti-slop list as "warn when picked", not "forbid".
5. **A possible companion validator.** The contrast and OKLCH maths in `ui_cognitive_and_slop_auditor.py` and `linear_oklch_theme_synthesizer.py`, plus `extract_design_md.py`. These are small and self-contained, and could check palette choices live. I wouldn't reuse the gate runner or the gaze simulator as authoritative scores.
6. **The scorecard.** The 100-point rubric with release gates (§20) works for a closing self-check.
