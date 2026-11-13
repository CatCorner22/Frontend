# Review of the PDFs and Word documents

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

I read seven of the eight files in full. map.pdf would not read: it has no extractable text beyond its title, so I can't reproduce the option lists you expected from it. The full option space comes from the Option Space PDF and the Training Manual instead.

## Reading status

| # | File | Status |
|---|---|---|
| 1 | Intuitive Design and the Option Space (PDF) | Read in full, all 50.2 KB in one read of the saved file. |
| 2 | UI/UX Ecosystem Training Manual (PDF) | Read in full, all 56.3 KB in one read of the saved file. |
| 3 | **map.pdf** | **Not readable.** The text read returned only its title: "Wayfinding Cockpit — Evidence-Led MVP Story Map — User Story Map". The file is 675,760 bytes, so the content is almost certainly drawn as graphics or isn't extractable as text. The file details showed nothing more. I did not pull the raw base64 (about 900 KB). Other files say it is the export of `wayfinding-cockpit-story-map.html`, an "Epic → Feature → Story roadmap". To read it, someone needs to export the HTML source, OCR it, or open it visually. |
| 4 | Anti-Slop Checklist (PDF) | Read in full (one page). |
| 5–8 | INDEX, source-assessment, SOP, reference (DOCX) | Read in full. Nothing was cut off. |

Some PDF text has broken ligatures ("o en", "a er", "le", "dra"). I quote around those.

---

## A. Per-file summaries

### 5. INDEX.docx
**Purpose:** a catalogue of **seven** source documents reviewed on 2026-11-13. It describes the sources, not the four DOCX files built from them. It says the notes "do not independently validate every third-party claim."

The seven sources, with the role each is given:
1. **Frontend Master Guide** (Building Accessible, Usable, Distinctive Interfaces, With and Without LLMs): the main evidence-aware handbook, with audit templates.
2. **Intuitive Design and the Option Space**: the conceptual model and a decision guide for each phase.
3. **Anti-Slop Checklist**: a short checklist for running screens and releases.
4. **The Gap — Spot 1 vs Spot 2, with the Hard Guardrail System**: product requirements for quality controls that can be enforced.
5. **UI/UX Ecosystem Training Manual**: a teaching aid with vocabulary and an exemplar catalogue.
6. **Wayfinding Cockpit — Product Blueprint v2 (Optimized)**: ambitious product requirements and a staged roadmap.
7. **Muse design-skills setup**: rules for installing and verifying design skills, and routing them by phase.

**Not in your Drive set:** sources 1, 4, 6 and 7 (Master Guide, gap-and-guardrails.md, blueprint-v2.md, Muse setup) were not among the eight files. I know them only from what the DOCX files say about them.

### 6. source-assessment.docx
**Purpose:** judges how useful each source is and settles the conflicts between them.

**Outline:** Bottom line → Recommended use of each source (table) → What is genuinely worth carrying forward (six points) → Conflicts resolved (table) → Material not to rely on without further work → Recommended source hierarchy → Deliverables produced from the set.

Details are in section F below.

### 7. frontend-design-sop.docx
**Purpose:** "Process Document: Evidence-Led LLM Frontend Design". Owner: "the owner (assumed)". Reviewed quarterly.

**Outline:** Purpose → Scope → RACI Matrix → Process Flow → Detailed Steps 1–10 → Exceptions and Edge Cases → Metrics → Related Documents.

- **Out of scope:** legal certification, "a fixed technology-stack recommendation", unattended production deployment, statistical claims from small rounds, and "the full advanced Wayfinding Cockpit platform".
- **Metrics:**
  - critical tasks have no unresolved blocker;
  - 100% of planned states are exercised;
  - 100% of proof claims carry a source tag;
  - 100% token/component compliance, except documented exceptions;
  - accessibility: no known blocker, aiming for WCAG 2.2 AA, with skipped checks disclosed;
  - performance: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile (p75);
  - every critique finding has a location, evidence, severity and fix;
  - every engagement feature has a value metric and a kill rule;
  - every skipped check is disclosed.

Steps are in section E.

### 8. frontend-design-reference.docx
**Purpose:** "Frontend design with LLMs: living reference", v0.1, owner the owner. It is marked stale after 90 days. Its own source ranking calls it the governing rules.

**Outline:**
- 00 Header
- 01 Attack sheet (15 one-line rules)
- 02 Contents
- 03 How to read this file
- 10 People, tasks, truth (10.01–10.03)
- 20 Direction (20.01–20.03)
- 30 Journeys, states, recovery (30.01–30.03)
- 40 Accessibility, performance, motion (40.01–40.03)
- 50 Verification (50.01–50.03)
- 60 Governed controls (60.01–60.04)
- 70 Adopting sources (70.01–70.02)
- 80 Glossary
- 85 Changelog
- 90 Sources, with grades
- 91 Cite index
- 92 Index
- 99 Health ("38 sections, 7 sources, 21 index terms… No findings")

Every rule has the same parts: Rule, Elements, Exceptions, Test, Open, Last verified.

**The 15 attack-sheet rules:**
1. Start with audience, context, primary task and real content, not visual styling.
2. "Intuitive" means familiar to a specific audience.
3. Never invent insights, proof, metrics, testimonials or content.
4. Explore genuinely different directions before code.
5. The brief, tokens and admitted components are the design authority.
6. The brief overrides any visual ban list; replace defaults with decisions.
7. Model navigation and top tasks before screens.
8. Specify loading, empty, error, offline, permission, success and edge states.
9. Prevent errors, preserve the user's work, and make recovery explicit.
10. Target WCAG 2.2 AA and test beyond automated tools.
11. Treat LCP/INP/CLS budgets as design requirements.
12. Every critique cycle needs new evidence.
13. Small tests discover problems; they don't measure population rates.
14. Truth and security failures block release; they are not matters of taste.
15. Ship a narrow evaluated slice before the full Wayfinding Cockpit.

**Source grades (§90):**
- S1 Master Guide: **C**
- S2 Intuitive Design: **C**
- S3 Anti-Slop: **D** ("Uncited")
- S4 Gap/Guardrails: **D**
- S5 Blueprint v2: **D** ("Product proposal, not implementation or evaluation evidence")
- S6 Training Manual: **D**
- S7 Muse: **D**
- Every author is listed as "Unknown author".

Rule details are in section D.

### 1. Intuitive Design and the Option Space (PDF)
**Purpose:** a deep-research supplement to the Training Manual, dated Nov 12, 2026. It leans on NN/g, W3C, web.dev, Material and its ACM paper, GOV.UK and Baymard, and labels vendor research as such.

**Outline:**
- **Part I** (what makes design intuitive):
  1. What intuitive means (1.1 Raskin, 1.2 Spool's knowledge gap, 1.3 mental models, 1.4 invisibility)
  2. Building blocks with evidence (2.1 Laws of UX)
  3. Intuitiveness vs. innovation (3.1 Material 3 Expressive, M3E; 3.2 Liquid Glass; 3.3 big redesigns; 3.4 synthesis)
  4. AI-built interfaces (4.1–4.4)
- **Part II:** Phases 0–12 (options for each phase)
- **Part III:**
  - 5. Decision protocol (11 questions)
  - 6. Phase-by-phase vibe-coding protocol (who decides, what the agent does, the gate)
  - 7. Gaps and limitations

**Key content:**
- **Definition:** Raskin, "Intuitive = uses readily transferred, existing skills."
- **Spool's knowledge gap:** design for the gap between current and target knowledge. There are two levers, lowering the target knowledge or raising current knowledge, plus "avoid widening the gap".
- **Building-block rules:**
  - Signifiers: weak cues meant 22% more looking time.
  - Recognition over recall.
  - Feedback timing: 0.1 s, 1 s, 10 s.
  - Interaction response: INP ≤200 ms; Doherty threshold <400 ms.
  - Cognitive load: remove meaningless variation.
  - Progressive disclosure: no more than 2 levels.
  - Error prevention: constraints before warnings.
  - Error recovery.
  - Consistency: "consistent, not uniform".
  - Visible navigation: 27% vs 48% use; show it on mobile if there are ≤4 items.
  - Ergonomics: 49% of use is one-handed.
  - Aesthetics are "a multiplier, not a substitute".
  - Honesty.
- **Laws of UX in six groups:** lower the gap; lower the cost of choosing; lower the cost of acting; shape perception; motivation and memory; respect reality.
- **AI failure modes (NN/g):** generic visual style; wrong design pattern; "close but missing the nuance"; the "Frankenstein layout".
- **Five prompting strategies:** precise visual keywords; lightweight references; have AI describe a reference; realistic mock data; code snippets.
- **Prompt-fidelity tiers:** 1 = broad text; 2 = detailed spec; 3 = text plus artifacts. Use tier 1 for 4 divergent concepts, then tier 3.
- The option tables are in section C.

### 2. UI/UX Ecosystem Training Manual (PDF)
**Purpose:** v1.0 teaching manual. Thesis: "AI slop is not primarily a capability problem. It is a decision problem and a feedback-loop problem."

**Outline:**
- Introduction
- Ch1 Diagnosis: distributional convergence; lineage of the defaults; second-order slop; the "no loop" problem; a 12-row table of causes; boring vs. sloppy
- Ch2 Three Gaps:
  - A: best human vs. average AI, a 12-dimension table
  - B: average AI vs. best vibe-coded, 7 inputs
  - C: what still remains
- Ch3 Ecosystem map: 20 disciplines, platforms, frameworks and laws
- Ch4 Languages, frameworks, tools: a large catalogue
- Ch5–17: Phases 1–13, each with Goal / Activities / Artifacts / Vibe-coding adaptation / Human errors / LLM errors
- Ch18 Exemplars (21 products)
- Ch19 Pipeline (19.1 a 13-step pipeline, 19.2 agent setup, **19.3 "design director" app idea**)
- Ch20 Error catalogue (15 human, 17 LLM errors)
- Appendices: A Master Anti-Slop Checklist; B DESIGN.md template; C three prompt templates; D Glossary; E Further reading

**Gap B's 7 inputs:**
1. decisions up front;
2. real content;
3. vision feedback;
4. constraints (a locked design system);
5. closed loops;
6. model and effort selection ("propose 4 distinct visual directions");
7. human taste as the final filter.

**Ch19.1 pipeline (13 steps):**
1. Brief
2. Research digest
3. Content first
4. 3–4 directions
5. Anti-default review
6. Tokens + DESIGN.md
7. Grayscale wireframe
8. Vertical slices
9. Render loop at 375/768/1280/1920, light/dark
10. Automated gates
11. Human taste pass, "remove one accessory"
12. 3–5 users
13. Memory

### 4. Anti-Slop Checklist (PDF)
**Purpose:** a one-page gate list with 8 stages, reproduced in section D. It has no citations.

### 3. map.pdf
**Not read** (see the reading-status table).

---

## B. Product and tool designs already proposed

**1. "Design director" harness** (Training Manual §19.3). Quoted exactly: "To help vibe coders systematically, build a tool with these modules":
1. "**Brief interviewer** — asks the 8 brief questions, refuses to proceed on 'modern and clean.'"
2. "**Reference extractor** — given URLs, extracts computed tokens (fonts, sizes, colors, spacing) and patterns into a reference sheet."
3. "**Direction generator** — produces 4 divergent token sets + ASCII layouts; scores each against a 'convergence' detector (embedding distance from known default clusters)."
4. "**Token compiler** — writes DESIGN.md, CSS variables, Tailwind theme, and lint rules."
5. "**State fixture generator** — creates realistic and adversarial content fixtures."
6. "**Render harness** — Playwright matrix of breakpoints × themes × states, producing a contact sheet."
7. "**Critic** — vision model scores against Nielsen heuristics, WCAG checks (axe output), anti-slop tells, and brief fidelity; returns ranked fixes."
8. "**Fix loop** — applies top fixes, re-renders, diffs, stops at threshold or budget."
9. "**Taste ledger** — stores accepted/rejected choices per project and per user."
10. "**Human gate** — side-by-side before/after for approval; nothing ships without a human pick."

**2. Wayfinding Cockpit** (Blueprint v2, plus map.pdf). I only know it second-hand. From the DOCX files:
- It has a "product thesis, navigation graph, coaching loop, value metrics, evaluation and build sequence."
- Its narrow MVP sequence (reference §70.01): "Start with a narrow category, the knowledge-entry contract, pre-generation artifacts, deterministic floor checks, navigation graph, and coaching loop before advanced generation, simulation, or governed machine learning."
- It includes an "optional accessibility profile", a "goal → task → screen → action → result graph", simulated users, and a "fixed count of ten states" contract.
- Undecided: "Launch category, hosting, accessibility profile, cost, and product naming remain owner decisions."

**3. Hard Guardrail System** (gap-and-guardrails.md, second-hand):
- "contracts, gates, evaluations, and override law";
- "separate release-blocking … checks from per-dimension coaching";
- "Missing artifacts stop generation";
- "override receipt": rule, reason, date, owner.

**Agent setup** (Manual §19.2):
- persistent DESIGN.md / AGENTS.md / CLAUDE.md / .cursor/rules;
- skills loaded on demand;
- give the agent eyes through screenshots;
- strongest model for direction and critique, cheaper models for implementation;
- short, scoped sessions that re-inject DESIGN.md.

**No tech stack is chosen.** The SOP explicitly excludes one. The only output format specified is **DESIGN.md**, from Manual Appendix B. Its sections:
- **Brief:** subject, audience, primary job, attributes as tensions, anti-goals, references.
- **Tokens:** OKLCH semantic colors (bg, surface-1..3, border, text-1..3, action, accent, success); type; 4px space scale; radius with nesting rules; elevation; motion; breakpoints and density.
- **Components:** "Do not create new variants without updating this file".
- **Patterns.**
- **Voice:** glossary, banned phrases.
- **Banned defaults.**
- **Quality bar:** WCAG 2.2 AA; LCP <2.5s; INP <200ms; CLS <0.1; all states designed.

**Prompt templates** (Manual Appendix C):
- **Direction prompt:** "Propose four visual directions that differ on at least three axes (type structure, color strategy, layout concept, density, depth). For each: 4–6 named OKLCH colors with roles, typefaces with roles, a one-sentence layout concept, an ASCII wireframe… one signature element. Then critique each against the banned-defaults list… Do not write code."
- **Build prompt:** only tokens and components from DESIGN.md; use the fixtures, including adversarial ones; implement all states; render at 375/768/1280/1920 light and dark and list defects.
- **Critique prompt:** score brief fidelity, heuristics, WCAG contrast/focus/target size, anti-slop tells, squint test and spacing; "Return the five highest-impact fixes ranked, with exact token or code changes. Remove one decorative element."

**Brief questions** (Manual Ch6; these are the "8 brief questions"):
1. Subject and industry, with vernacular and materials
2. Audience and context (device, environment, expertise, frequency)
3. Primary job (one sentence) and top 3 secondary jobs
4. Success metrics
5. Brand attributes as tensions
6. Anti-goals
7. References: 3–5, with what to borrow
8. Constraints: platform, stack, accessibility level, performance budget, i18n

---

## C. The option space: decision dimensions and options

### From the Option Space PDF

**Phase 0, process model:**
- Double Diamond
- Design Thinking (for ill-defined problems)
- Lean UX (value uncertain)
- Phased Alpha → Beta → Live (public or regulated services)
- Incremental continuous redesign (mature products)
- Recommended default: a "compressed Double Diamond".

**Phase 1, research:**
- Stages: Strategize (generative), Design (formative), Launch/assess (summative).
- Sample sizes: qualitative test 5 per round (3×5 beats 1×15); distinct groups 3–4 each; quantitative 20; card sort qualitative ≥15, quantitative 30–50; focus groups 3–12.
- Framing user needs: JTBD, research-based personas, or both.

**Phase 2, prioritization and metrics:**
- Kano categories: Must-have, Performance, Delighter, Indifferent, Reverse.
- Metrics: HEART; SUS (average 68 is the 50th percentile, not 68%); SEQ; SUPR-Q; Core Web Vitals.

**Phase 3, information architecture and navigation:**
- Card sort: open, closed, hybrid; moderated or unmoderated; in-person or remote; 30–50 cards.
- Tree-test task types.
- **Navigation:**
  - visible top/left inverted-L (≤4 tiers);
  - visible mobile tab bar (≤4 items);
  - combo of visible plus hidden (86% vs 57% use);
  - hamburger, top-left, labelled "Menu" (only when space forces it);
  - mega menu, tabs, accordions, facets, breadcrumbs, fat footer;
  - command palette (expert tools).
- **Long lists:** infinite scroll; pagination; load more (with a count like "24 of 312"); view all.

**Phase 4, interaction:**
- **Containers:** inline/on-page; nonmodal panel or drawer; modal (critical or irreversible only; not for newsletters or upsells); separate page; wizard.
- **Disclosure:** progressive or staged. A 2-screen booking flow beat 1-screen and 5-screen versions.
- **Mistake protection:** constraints and defaults; undo; confirmation (specific labels); typed confirmation; non-blocking warning.
- **Loading:** <1 s show nothing; 2–10 s spinner or skeleton; >10 s percent bar plus cancel; skeleton for full-page loads.
- **Empty and error states.**
- **Forms:** single column; fewer fields; labels above; no placeholder-as-label; no premature errors; Redundant Entry.
- **State matrix:** ideal, empty, loading, partial, error, offline, permission, overflow.

**Phase 5, fidelity:**
- paper prototype; steal-the-mouse; Wizard of Oz; clickable low-fi/grayscale; high-fi clickable; coded prototype;
- plus prompt tiers 1–3.

**Phase 6, visual strategy:**
- **Strategies:** conventional restraint; expressive hierarchy; decorative spectacle (marketing moments only); ultraflat.
- **Signifiers:** blue links; button shapes; icons with labels; arrows are the weakest cue.
- **Color:** OKLCH; contrast 4.5:1 and 3:1.
- **Dark mode:** follow the OS; light only; or full dual themes.

**Phase 7, design system:**
- Atomic design; DTCG tokens v2025.10.
- Governance: solitary, centralized, federated ("favoring federated was and is wrong").

**Phase 8, motion:**
- Simple feedback ~100 ms ease-out; panel 200–300 ms; large movements ≤400 ms; 500 ms feels cumbersome.
- Material 3 tokens: 500/400/200 and 300/250/200.
- Tokens: `--dur-fast:100ms`, `--dur-enter:250ms`, `--dur-exit:200ms`.
- Platform APIs: View Transitions, scroll-driven animations, anchor positioning.

**Phase 9, rendering:** SSG, SSR, streaming SSR, CSR, SSR + full rehydration, partial/progressive rehydration.

**Phase 10, accessibility:** the 9 new WCAG 2.2 criteria; "overlays are not a fix".

**Phase 11, evaluation methods:** heuristic evaluation; critique; 5-user test; tree test; quantitative benchmark; SUS/SEQ; A/B test; automated checks.

**Phase 12, deceptive patterns to avoid (15):** sneaking, forced action, hard-to-cancel, preselection, obstruction, hidden subscriptions, hidden costs, trick wording, visual interference, fake social proof, fake urgency, nagging, fake scarcity, disguised ads, confirmshaming.

### From the Training Manual

**Navigation models:** hub-and-spoke, hierarchical, flat, sequential/wizard, faceted.

**Navigation patterns:** top bar; collapsible sidebar; tab bar; bottom sheet; mega menu; breadcrumbs; ⌘K; hamburger; contextual; stepper; pagination / infinite / load more.

**Expanded state matrix:**
- ideal
- empty (first use, no results, cleared)
- loading (initial, incremental, background)
- partial
- error (validation, network, server, permission, not found, rate-limited)
- offline
- success
- disabled
- read-only
- overflow
- many items

**Feedback surfaces:** toasts, inline messages, banners or modals, chosen by severity and persistence.

**Layout archetypes (24):** single column; split screen; sidebar + content; three-pane; dashboard grid; bento; masonry; magazine/editorial; broadsheet; Z-pattern and F-pattern; card feed; table-first; canvas/infinite board; full-bleed media; scrollytelling; wizard; kanban; timeline; map-first; chat-first; spatial/3D.

**Hierarchy levers:** size, weight, color, contrast, position, whitespace, alignment, grouping, depth, motion.

**Typography:**
- **Classes:** old-style; transitional; didone; slab; humanist; grotesque; neo-grotesque; geometric; monospace; display; script; blackletter; variable.
- **Scale ratios:** 1.067, 1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618.
- **Line length:** 45–80 characters.
- **Line height:** body 1.4–1.6; display 1.05–1.2.
- **Avoid by default:** Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Space Grotesk, Geist.

**Color:**
- **Schemes:** monochromatic, analogous, complementary, split-complementary, triadic, tetradic, neutral + single accent, dominant + sharp accent.
- **Roles:** bg; surface 0–3; border; text 1–4 including disabled; brand; accent; semantic; interactive states; data-viz palettes.
- **Rules:** 60-30-10; tint neutrals toward the brand hue; dark mode as its own palette.

**Spacing, shape and depth:**
- 4- or 8-point scale; 12-column grid (4–8 on mobile).
- Radius scale; nested radius = outer − padding.
- Elevation: layered shadows, borders only, or tonal.
- **Density:** compact, default, comfortable.

**Imagery:** documentary or staged photography; flat, isometric, hand-drawn, 3D clay or line illustration; icon consistency; textures.

**Motion:**
- **Purposes:** feedback, orientation, continuity, attention, personality, perceived performance.
- **Durations:** 100–200 ms micro; 200–350 ms component; 300–500 ms page; stagger 20–60 ms.
- **Easing:** ease-out entering, ease-in exiting, spring for direct manipulation.

**Look-and-feel catalogue (33 styles, each with characteristics, fit and risks):**
- Swiss
- Minimalism
- Brutalism
- Neo-brutalism
- Flat
- Material 3
- Apple HIG / Liquid Glass
- Fluent
- Skeuomorphism
- Neumorphism
- Glassmorphism
- Claymorphism
- Aurora/mesh gradients ("The AI default look")
- Bento
- Editorial/magazine
- Broadsheet
- Data-dense/terminal
- Dark-mode-first dev tool
- Retro/Y2K
- Vaporwave
- Memphis
- Bauhaus
- Art Deco
- Organic
- Maximalism
- Kinetic typography
- Scrollytelling
- 3D/WebGL
- Pixel art
- Hand-drawn
- Corporate Memphis
- Utilitarian/GOV.UK
- Japanese-inspired info-dense
- Spatial/visionOS

**Innovation safety** (Option Space PDF §3.4):
- **Usually safe:** visual hierarchy; brand expression (if contrast holds); new interaction conventions "only when clearly superior and taught"; IA changes validated by tree tests; small releases.
- **Usually risky:** burying secondary tasks; translucent chrome; moving familiar controls; untested regrouping; big-bang redesigns.

**Anthropic skill specifics** cited in the Manual:
- 4–6 named hex values;
- dramatic contrast (weights 200 vs 800, size jumps of 3× or more);
- "one orchestrated moment beats scattered effects".

---

## D. Rules and checklists

### Anti-Slop Checklist (in full)

**Header:** "One page. Run top to bottom for every new screen or app. Don't move to the next stage until the current box is checked."

**1. Before prompting (5 min)**
- [ ] Brief written: subject/industry, audience and where they use it, one-sentence primary job
- [ ] 2–3 brand tensions (e.g. "clinical but warm"), not "modern, clean, intuitive"
- [ ] Anti-goals named ("must not look like a crypto dashboard")
- [ ] 3 references, each with the specific thing to borrow (not "make it like Linear")
- [ ] Real copy and real data samples ready, plus edge cases (long names, empty list, 10k rows, error)

**2. Direction (before any code)**
- [ ] Asked for 3–4 directions that differ on type, color, layout, and density
- [ ] Each direction has 4–6 named colors with roles, typefaces with roles, an ASCII wireframe, and one signature element
- [ ] Convergence test: "Would ten similar prompts land here?" If yes, revise
- [ ] Bold choices spent in one place only

**3. Lock the system**
- [ ] DESIGN.md + tokens (color, type scale, spacing, radius, shadow, motion) committed
- [ ] Component library fully re-themed (no untouched shadcn/Tailwind defaults)
- [ ] Lint blocks raw hex and arbitrary values (p-[13px])
- [ ] DESIGN.md is re-attached at the start of every session

**4. Banned unless the brief asks for it**
- [ ] Inter/Roboto/Poppins by default; purple-to-blue gradients; gradient text on numbers
- [ ] Centered hero + three identical icon cards; one radius and one shadow everywhere
- [ ] Glass, glow, or fade-up on every section; bounce on every hover
- [ ] ALL-CAPS eyebrows, A · B · C meta strings, "→" on every link, 01/02/03 on non-sequences
- [ ] Second-order defaults: cream + terracotta serif, near-black + acid green, broadsheet hairlines
- [ ] Filler copy ("Unlock," "Seamlessly"), fake stats, fake testimonials, lorem ipsum

**5. Build (one full screen at a time)**
- [ ] All states: empty, loading, partial, error, offline, permission, overflow, success
- [ ] Buttons name the outcome ("Save changes"); same name carries through ("Publish" → "Published")
- [ ] Errors say what happened and how to fix it
- [ ] Undo instead of confirm for reversible actions
- [ ] Semantic HTML: real button/a/label; no div onClick

**6. Look at it (render, critique, fix)**
- [ ] Screenshots at 375 / 768 / 1280 / 1920, light and dark, every state
- [ ] Squint test: primary action and headline still obvious when blurred
- [ ] Model critiques against brief + heuristics + this list and returns its top 5 fixes; apply them, re-render (max 3 rounds)
- [ ] Remove one decorative element that doesn't serve the brief

**7. Gates before shipping**
- [ ] axe passes with 0 serious issues; full keyboard pass; visible focus; targets ≥ 24px (44 on touch)
- [ ] Contrast 4.5:1 body, 3:1 large text and UI elements
- [ ] prefers-reduced-motion honored
- [ ] LCP < 2.5s · INP < 200ms · CLS < 0.1
- [ ] No duplicate components or dead files left by the agent
- [ ] 3–5 real users completed the primary job

**8. After**
- [ ] Logged what was tried and rejected in DESIGN.md so later sessions don't regress
- [ ] Any new pattern added to the system, not invented inline next time

"**Rule of precedence: the brief always wins.** Any item above is allowed when the brief explicitly chooses it. What's banned is reaching for it by default."

### Manual Appendix A (Master Anti-Slop Checklist)
A near-duplicate of the above, grouped as Direction, Craft, States and behavior, Copy, Quality gates. Items it adds:
- palette and type trace back to the subject's world;
- type scale has real contrast; line length ≤80ch;
- spacing encodes grouping;
- radius and shadow scales vary with purpose;
- structure (borders, numbers, labels) encodes information;
- keyboard shortcuts where useful;
- WCAG via axe + manual keyboard + screen reader.

### Intuitiveness decision protocol (Option Space PDF, Part III §5)
1. Who and what job?
2. What do they already know? Default to those conventions.
3. What is the target knowledge? Can you lower it?
4. Where's the gap? For each item: simplify, teach in context, or accept and support.
5. What must the eye find first? Set hierarchy before style.
6. Are interactive things obviously interactive?
7. Does the system always say what's happening?
8. Can users recover? Prefer undo; reserve confirmations.
9. Is it inclusive? WCAG 2.2 AA, both themes, reduced motion, one-handed reach.
10. Is it honest? No deceptive patterns, no fake proof.
11. Did five real people succeed?

### Accessibility
**WCAG 2.2 additions:**

| Criterion | Level |
|---|---|
| 2.4.11 Focus Not Obscured (Minimum) | AA |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA |
| 2.4.13 Focus Appearance (≥2px, 3:1) | AAA |
| 2.5.7 Dragging Movements | AA |
| 2.5.8 Target Size (Minimum) (24×24) | AA |
| 3.2.6 Consistent Help | A |
| 3.3.7 Redundant Entry | A |
| 3.3.8 Accessible Authentication (Minimum) | AA |
| 3.3.9 Accessible Authentication (Enhanced) | AAA |

4.1.1 Parsing was removed.

**Manual Ch14 checklist:**
- semantic HTML; text alternatives; contrast;
- 200% text resize; reflow at 320px;
- keyboard with visible focus and logical order; no traps; skip links;
- "no ARIA is better than bad ARIA"; live regions;
- errors associated with their fields; captions;
- reduced motion; forced colors; plain language.

**Testing tools:** axe, Lighthouse, WAVE, VoiceOver, NVDA, JAWS, TalkBack, zoom at 200/400%, color-blindness simulation.

**Common LLM accessibility errors:** div onClick; unlabeled icon buttons; bad aria-label; placeholder used as a label; gray-on-gray text.

### Reference rules
Rules §10.01–§70.02 are in section A. The substantive ones:
- **§30.02** state list: default, hover, focus, active, disabled, loading, empty, partial, error, offline, permission, success, overflow, large-data.
- **§30.03** errors sit beside their cause and are linked in code; specific action labels; confirm only serious actions.
- **§40.03** motion durations are tokens; no decorative loops; pause controls.
- **§60.04** evaluate prompts and models with blind human rubrics, repeated runs, held-out defects, and precision/recall.

---

## E. SOP steps in order (full)

Process flow: Research + real content → Brief + task/value metrics → Distinct directions → human selection → Tokens + admitted components → Navigation model + state matrix + acceptance checks → One complete vertical slice → Screenshots + critique + repair (new evidence each round) → Accessibility + performance + security + content-truth gates → Representative-user task validation → Human release decision + evidence receipt + decision ledger.

1. **Discovery and research** (Builder; before layout or code)
   - Identify audience, context, current knowledge, primary and secondary tasks, conventions, constraints and access needs.
   - Use interviews, observation, support evidence, analytics and competitor task walks.
   - The agent drafts and clusters notes; it never invents findings.
   - **Output:** source-tagged research digest, real quotes, open questions.
2. **Brief and success metrics**
   - Subject, audience, context, primary and secondary jobs, brand tensions, anti-goals, references and what each contributes, real content, technical constraints, accessibility target, performance budget, task/value metrics.
   - **Output:** DESIGN-BRIEF.md with a definition of done and the unknowns.
3. **Direction exploration** (agent proposes, builder selects)
   - 3–4 meaningfully different directions covering structure, typography, color, density, motion, signature element, risks and rationale.
   - Apply the "ten similar prompts" check.
   - "Do not let the agent choose the final direction by default."
   - **Output:** the selected direction, plus the rejected ones with reasons, in the decision ledger.
4. **Tokens and component contract**
   - Semantic tokens for type, color, spacing, radius, elevation and motion.
   - Admit the component library, states, keyboard behaviour, content rules and versioning.
   - Restyle defaults; lint raw values and off-system components.
   - **Output:** token files, component inventory, styleguide, enforced rules.
5. **Navigation and state contracts** (before each screen)
   - Place the screen in the goal → task → screen → action → result graph.
   - User-worded labels; back/exit behaviour; top tasks.
   - State matrix covering loading, empty, error, offline, permission, success, overflow and large data; acceptance checks.
   - "Missing artifacts stop generation."
6. **Vertical-slice implementation**
   - One complete screen or journey slice, using real content and admitted components only.
   - Semantic HTML and accessible primitives; no new component where an admitted one works.
   - All planned states and edge fixtures implemented.
7. **Rendered critique and repair**
   - Screenshots at phone, tablet and desktop widths, in each theme and state.
   - Critique against the brief, hierarchy, heuristics and content truth. Each finding gives location, harm, evidence, severity and fix.
   - Repair and rerender. About 3–4 rounds is a stopping budget, not proof of quality.
   - **Output:** before/after screenshots and a defect log.
8. **Deterministic quality gates**
   - Typecheck, lint, tests, token/off-library checks, state crawls, route/orphan/dead-end checks, axe, manual keyboard/focus, zoom/reflow, screen reader, reduced motion, performance, secret/dependency/security scans, data-layer review.
   - Trace every proof claim; record skipped checks.
   - "Truth and security blockers cannot be overridden as design preferences."
9. **User validation**
   - Realistic, non-leading tasks; observe success, time, errors, wrong doors, backtracks, recovery and help use.
   - Small rounds, so no population rates. Simulated users are for triage only; investigate where they diverge from humans.
10. **Release decision and memory**
    - Review task/value outcomes alongside engagement.
    - Record the accessibility profile, checks run and skipped, security and truth status, overrides, dependencies, model and prompt versions, screenshots, measurements, known issues and rollback.
    - Update tokens, components, brief, rejected-choice ledger and evaluations.
    - "No production claim exceeds the evidence collected."

**Exceptions (11):**
- **No users yet:** use competitor walks and heuristics; label validation as pending.
- **Existing design system:** audit and scope; don't rebuild for novelty.
- **Simple static page:** lighter state matrix.
- **Brief wants a banned pattern:** allow it with a documented reason.
- **Automated tools and humans disagree:** the human result wins.
- **Simulation and humans diverge:** use the human result.
- **New dependency:** verify that it exists, plus version, license, maintenance and need.
- **Accessibility or security blocker:** no sign-off.
- **Questionable detector block:** verify it and fix it through versioned evaluation.
- **Legal scope:** qualified review.
- **Long-session drift:** start a fresh session, reattach the brief and tokens.

---

## F. What source-assessment.docx says about reliability

**Bottom line:** "Two documents deserve core-reference status, one is a strong daily checklist, two are product-planning inputs, one is an installation runbook, and one is mainly a teaching aid whose content is better covered elsewhere."

| Source | Usefulness | Main caution | Decision |
|---|---|---|---|
| Master Guide | Highest; the primary reference | Long; deep dives missing; snapshots age; prompt templates untested | Main handbook |
| Intuitive Design PDF | High; supporting reference | Old studies, vendor research, narrow AI studies | Keep for decisions and rationale |
| Anti-Slop Checklist | High for execution, low as evidence | No citations; visual tells age | Preflight and release checklist |
| gap-and-guardrails | High for product controls | Research files missing; "guarantee" unproven | Architecture and acceptance criteria |
| blueprint-v2 | Useful selectively | Very broad; no proof | Use the narrow sequence, defer the rest |
| Muse setup | High, but only for setup | Installs nothing | Tool onboarding only |
| Training Manual | Moderate; mostly redundant | Mixed source detail; catalogues not evaluated | Onboarding only, "do not use as governing reference" |

**Do not rely on without further work:**
- percentage estimates of how close AI gets to top human craft;
- a "guaranteed" quality floor before detector precision and recall are measured;
- legal deadlines, standards status, dependency versions, model names, prices, licenses, stars or leaderboards without a current primary-source check;
- prompt personas or templates as proven quality multipliers;
- model-judge scores, simulated users or polish scores in place of usability testing;
- popularity or open-source licensing in place of a security review;
- any assumption that Muse skills are installed.

**Conflicts it resolves:**
- 3–5 users vs quantitative proof;
- axe "0 serious" vs real accessibility confidence: require manual checks too;
- optional accessibility profile vs WCAG AA: default to AA;
- a fixed ten states vs risk-based states;
- bans vs "brief wins": the brief wins;
- simulated users vs humans;
- 3 vs 4 critique rounds: treat as a stopping budget;
- engagement vs value;
- full blueprint vs narrow slice;
- dated claims: kept out of the durable rules.

**Hierarchy:**
1. Governing rules: the reference.
2. Execution: the SOP plus the Anti-Slop Checklist.
3. Rationale: the Master Guide plus the Intuitive Design report.
4. Product controls: guardrails plus the narrow Blueprint sequence.
5. Installation: Muse.
6. Background: the Manual.

---

## G. My assessment

### Contradictions
- **Critique round cap:** the checklist says "max 3 rounds"; the SOP and reference say "three to four". The Manual says "fix top 3" while the checklist and critique prompt say "top 5 fixes".
- **Performance thresholds:** the checklist and Manual use strict "<" (LCP < 2.5s), while the SOP, reference and Option Space PDF use "≤", which matches web.dev. Minor, but the tool should use ≤.
- **Number of directions:** 3–4 (checklist, SOP) versus exactly 4 (§19.3, Direction prompt, Option Space PDF).
- **Testing users:** the checklist's "3–5 real users" counts as done; the source assessment says small rounds are discovery only.
- **Accessibility tooling:** the checklist's "axe passes with 0 serious" is treated in source-assessment as insufficient on its own.
- **Motion durations:** NN/g, Material and the Manual's bands differ (component 200–350 vs panel 200–300; page up to 500 vs "500 ms feels cumbersome"). The PDF itself says "pick one system".
- **Line length:** the Manual gives both 45–80 characters and "≤80ch". Consistent, but stated twice.
- **Hamburger menu:** the Manual says "use sparingly on desktop"; NN/g in the PDF says "If you don't need to hide navigation, don't". Compatible, but the strength differs.

### Duplication
The brief fields, 3–4 directions, convergence test, banned defaults, state matrix, undo-over-confirm, button naming, screenshot widths, CWV thresholds, 3–5 users and the rejected-choice log each appear in four to six files. The Manual's §19.1 pipeline and the SOP are essentially the same sequence. The four DOCX files are derived from the PDFs and the missing markdown sources, so the DOCX set adds governance (rule IDs, grades, RACI) rather than new design content.

### Claims that look wrong, unsourced or volatile
- Several items are dated to 2026 and can't be verified from here:
  - an ACM CHI 2026 M3E paper (33%/20%/59% figures);
  - "Firefox 159… October 2026";
  - anchor positioning "Baseline since September 2026";
  - a TechXplore 2026-01 Liquid Glass update;
  - DTCG "2025.10".
  The source assessment itself flags these as snapshots.
- **Weak sourcing:** the Manual relies heavily on secondary summaries (a "skill summary via Skills Directory", "claude-kb issue", dev.to, vendor blogs) for what Anthropic's skill says. These are second-hand.
- **Nielsen/Landauer arithmetic:** with the 31% discovery rate, 5 users find about 85% of problems. That figure is correct. "finding all of them would take at least 15" overstates it: 15 users reach about 99.6%, not all problems.
- **Speculative modules:** the "convergence detector (embedding distance from known default clusters)" in §19.3 has no specification or evidence behind it.
- **Grades:** the reference grades all seven sources C or D, yet still builds "permanent" rules on them. That is honest, but the rule set is not externally validated.

### Missing material
- map.pdf (unreadable).
- The Master Guide, gap-and-guardrails, blueprint-v2 and Muse setup (not in the set). The reference's highest-graded source (S1) is not in your files.

### Genuinely reusable seed content for the tool
1. **Step skeleton:** the Option Space PDF's Part III §6 table already pairs "Human decides" with "Agent does" and a "Gate" for each phase. Combined with SOP steps 1–10, it maps directly onto a small-steps, human-picks flow.
2. **Option menus for each step:**
   - the navigation, list, container, disclosure, mistake-protection, loading-state, dark-mode, visual-strategy, governance and rendering tables (Option Space PDF);
   - the 24 layout archetypes, 33-style catalogue, type classes and scale ratios, 8 color schemes, density modes, elevation styles and motion purposes (Manual).
   Each table already includes "when to choose" and "risk", which is ready-made help text for each option.
3. **Brief interview:** the 8 brief questions, plus "refuses to proceed on 'modern and clean'".
4. **Sanity checks to run on each choice:** the 11-question intuitiveness protocol, the Spool levers, signifier rules, the WCAG 2.2 table and the full anti-slop banned list with "brief wins" precedence. These suit validators, with an override that requires a reason.
5. **Output format:** DESIGN.md (Appendix B) plus the Direction, Build and Critique prompt templates (Appendix C). These are a natural basis for the Markdown prompt file the tool emits.
6. **Product-architecture ideas:** the §19.3 modules (especially Brief interviewer, Direction generator, Token compiler, Taste ledger, Human gate), the guardrail split between blocking floors and coaching ceilings, and the verification-receipt idea.

**Not to reuse as-is:**
- the Manual's tool and library catalogues (they age fast);
- dated statistics;
- the full Wayfinding Cockpit scope. The user's own documents say to start narrow.
