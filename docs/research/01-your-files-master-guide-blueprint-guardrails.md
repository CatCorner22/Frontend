# Review of FRONTEND-MASTER-GUIDE.md, blueprint-v2.md, gap-and-guardrails.md

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

I read all three files to the end. Nothing was left unread.

- **blueprint-v2.md** and **gap-and-guardrails.md** came back whole on the first read.
- **FRONTEND-MASTER-GUIDE.md** was too large for one read (173,355 characters, 1,829 lines). The tool saved it to `/root/.claude/projects/-home-user-Frontend/e12f4ccb-b459-55b6-b00a-a80cc4acdd67/tool-results/mcp-Google_Drive-read_file_content-1794568244674.txt` and I read it in seven chunks covering lines 1–1829.

Several files the documents cite are not among these three, so I have not seen them: `blueprint-v1.md`, `hugging-face-llm-review.md`, `research/spot1-human-best.md`, `research/spot2-vibe-best-and-slop.md`, `research/science-and-stack-kbs.md`, and the deep-dive folders `docs/frontend-design/01-04` and `docs/frontend-knowledge-base/01-17`.

---

## A. Per-file content

### 1. FRONTEND-MASTER-GUIDE.md (refreshed 2026-11-13)

**Purpose:** a merged guide to building accessible, usable, distinctive UI with and without LLMs, built from two earlier research sets. Every claim is graded A–D, inferences are marked "(judgment)", and it says it is not legal advice.

**Part A: Start here**
- **§1 Executive summary.**
  - AI output converges on the web's average ("distributional convergence"). Banning one default just produces the next one; Anthropic's `frontend-design` skill now lists cream background + serif + terracotta as a tell.
  - The fix is process: decide users, the one key task, tokens, 2–3 references and real content first; then build one screen, screenshot it at 3 widths, test with the keyboard, run automated checks, and fix.
  - Its estimate (judgment): directed vibe-coding reaches about 70–85% of top human craft on marketing pages and simple apps, about 50–65% on complex product UI.
  - Must-dos: build to WCAG 2.2 AA; 95.9% of the top million home pages fail automated checks; tools find only part of the problems; human limits (about 4 chunks of working memory; 0.1/1/10 s delays); LLM code needs guardrails.
- **§2 Top takeaways (26).** Grouped as: why AI UIs look alike (sameness is structural; constraints beat adjectives; pair every ban with a replacement; "Linear ships Inter"); law (US and EU dates, overlays, WCAG 3 is a draft); accessibility engineering (native HTML; WebAIM's six recurring failures; more ARIA goes with more errors; automation covers about 57% of issues by volume but only 16 of 50 criteria; screen-reader survey); human factors (Cowan's 4; scanning; first impressions in 50–120 ms; speed thresholds; Core Web Vitals; forms; touch targets); working with LLMs (what is proven versus not; generated-code accessibility is mixed; METR productivity results unsettled).
- **§3 Reading order** by persona. **§4 Evidence grades:** A = law or standard; A- = peer-reviewed; B = NN/g or large surveys; C = vendor or practitioner; D = aggregators. Rules: no folklore, independent agreement beats single sources, vendor claims are graded down.

**Part B: Topic chapters**
- **§5 Convergence**
  - 5.1: ten causes, including library-default echo, underspecified prompts, no memory between generations, and a judgment–action gap (AUV-Bench: best exact diagnosis 24.7%).
  - 5.2: the classic 2023–25 tells and the five 2026 clusters (listed in D).
  - 5.3: a quality ladder from Tier A (best human: Stripe, Linear, etc.) to Tier F (worst AI output).
  - 5.4: benchmarks and a WebDev Arena snapshot ("do not infer UX from Elo").
  - 5.5: an 11-dimension 1–5 rubric. Averages: default 2.3, AI + skill 3.0, best directed 3.9, top human 4.95. Gap-closers ranked: tokens first, then real references, real content, all states, a screenshot critique loop, an accessibility audit, a human making 3–5 "surprise" decisions, and last a top model.
- **§6 Fundamentals**
  - 6.1: the UX/UI/IA/interaction/brand/engineering/system map, and the order of work: people → flows → wireframe → visual system → components → states → polish → test.
  - 6.2: Nielsen's 10 heuristics, each rewritten as a prompt.
  - 6.3: Jakob, Hick, Fitts, cognitive load, progressive disclosure, signifiers, mistakes vs slips, peak-end.
  - 6.4: an 8-state table.
  - 6.5: frontend basics and review smells.
  - 6.6: LLM failure → countermove table.
- **§7 Law**
  - US: ADA Title II requires WCAG 2.1 AA by 26 Apr 2027 or 26 Apr 2028, after an interim rule moved both dates by one year. HHS 504: 11 May 2027 or 10 May 2028. Section 508 still uses WCAG 2.0 AA. Title III has no rule, but 5,114 suits were counted in 2025.
  - FTC: $1M order against accessiBe. The click-to-cancel rule was vacated.
  - EU: the EAA has applied since 28 Jun 2025. EN 301 549 v4.1.1 (based on WCAG 2.2) is published but v3.2.1 is still the legal reference. WCAG 3 is a Working Draft.
  - 7.3: build to 2.2 AA; the 9 new criteria are listed. 7.4: compliance notes. 7.5: dark-pattern rules.
- **§8 Accessibility engineering**
  - 8.1: CDC disability data (1 in 4 US adults; cognition 13.9%).
  - 8.2: WebAIM Million 2026 (six failures make up 96% of errors).
  - 8.3: screen-reader survey #11 (n = 1,780).
  - 8.4: WCAG 2.2 checks grouped by POUR (86 criteria: 31 A, 24 AA, 31 AAA).
  - 8.5: studies on AI-generated code. Basics are fine, ARIA and widgets are weak; grounding in the standard pattern took AXIS-Bench from 6/12 to 12/12; feeding test results back helps.
  - 8.6: 13 implementation rules. 8.7: layered testing. 8.8: component definition of done.
- **§9 Cognitive load:** evidence table, COGA objectives, 14 load reducers, 12 frustration triggers with fixes, message formulas.
- **§10 Eye tracking:** F-pattern, spotted, layer-cake and commitment patterns; 57% of viewing time above the fold and 74% in the first two screens; banner blindness; inline validation (+22% success); design rules; how to run a study.
- **§11 Performance:** 16 ms / 0.1 / 1 / 10 s thresholds; Core Web Vitals (good LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; poor > 4 s, > 500 ms, > 0.25); new soft-navigation metrics; ranking effect is unquantified; loading-feedback studies (never show a blank screen); engineering patterns; how to measure.
- **§12 Input and forms:** three touch-target numbers reconciled (24 px floor, 44 px default, 9–10 / 14 / 18 mm); reading comfort (45–75 ch, 16–18 px, 1.5–1.6 line height); 15 form rules; navigation and findability.
- **§13 Visual design:** why looks matter (50 ms judgments; looks can mask usability problems); Gestalt and the squint test; type system; color structure (6–10 neutrals, 1 accent, semantics; APCA only as a second opinion); dark mode (offer both, do not claim it reduces eye strain); depth, radius and icons (always label icons); motion durations; a six-question visual audit.
- **§14 Design systems:** DTCG 2025.10 is a Community Group report, not a W3C standard; three token tiers (primitive, semantic, component); Radix, React Aria, shadcn, Tailwind; component API checklist; Storybook and Playwright testing; governance.
- **§15 Responsive and i18n:** container queries, `clamp()` + `rem`, logical properties; touch and grip; PWA; text-expansion figures; content and plain language (6th–8th grade; seniors 43% slower); cross-device test matrix.
- **§16 Engineering:** rendering strategies (SSG, SSR, CSR); state; XSS, CSP and Trusted Types; SEO; consent research (Utz, Mathur 11.1%, EDPB, CNIL, GPC); budgets.
- **§17 Research methods:** method chooser; five users finds 55–100% of problems; A/B testing pitfalls (sample-ratio mismatch, Twyman's law); SUS, NASA-TLX, UEQ-S; card sorting, tree testing, JTBD; minimal research plan.
- **§18 Inclusive design and AI-feature UX:** audiences beyond WCAG; Amershi's 18 guidelines, PAIR, NN/g (do not autoscroll streaming text; mix GUI controls with free text to get past the "articulation barrier"); AI-feature checklist.
- **§19 Prompting:** "reduce the entropy of the request" plus an 8-step pipeline (in B); an evidence ledger (persona lines not supported; few-shot supported; self-critique only helps with new information; broad negative instructions doubtful); vendor comparison (Anthropic, OpenAI, Google); 6-layer context stack; agent loop (cap at 4 iterations); a small personal eval; failure-mode table.
- **§20 Tools:** frontend-design skill, Impeccable (24 commands, 62 deterministic slop rules), UI UX Pro Max, Vercel guidelines, shadcn skill; models with prices; open-weight models; free resources; one-hour setup.
- **§21** Audit method and severity vocabulary (blocker / major / minor).

**Part C: Skeptical review**
- **§22:** 10 skeptical notes.
- **§23:** a 15-row risk map of cases where the automated signal and the human reality disagree.
- **§24:** 12 evidence gaps and the open problems.

**Part D: Appendices**
- **A.1–A.17 prompts:** intake questions, brief template, direction exploration, tokens, one screen, state matrix, consistency, eight critique and anti-slop prompts, audit, widgets, dependency honesty, security, rubric, vague-word translation, system block, per-task skeleton, five-minute checklist.
- **B.1–B.3 checklists:** master audit (A–F), pre-ship legal, LLM code review.
- **C:** source log of 40 rows. **D:** glossary and 15 misconceptions. **E:** learning path. **F:** refresh and corrections log. **G:** deep-dive file map.

### 2. blueprint-v2.md ("Wayfinding Cockpit — Product Blueprint v2", 2026-11-12)
Sections I–XIV are summarised in B. **Purpose:** a full product design for an LLM-backed design coach and builder whose core is the "spot system".

### 3. gap-and-guardrails.md
**Purpose:** compares Spot 1 (best human work) with Spot 2 (best vibe-coded work) dimension by dimension and specifies the hard-guardrail machinery.
- **I. Definitions:** Spot 1, Spot 2, slop floor, and the product promise.
- **II.A–K. The gap, eleven dimensions** (each with Spot 1, Spot 2 and a "gap mechanism"): user contact, state completeness ("the deepest structural gap"), navigation and IA, content truth, design-system governance, performance, accessibility, motion, editing and restraint, engagement ethics, and the engineering floor.
- **III.A–K. Guardrails:** Layers 0–6, scoring, override law, maintenance (in B and E).

---

## B. Product and tool design already proposed

**Name:** "Wayfinding Cockpit". It is "a working name, not a cleared mark". Metaphor: "a flight school inside a living city… the builder is a pilot in training".

**Thesis:** "LLMs generate interface surface fast and judge interface quality poorly, so the product sells judgment, delivered as coaching and enforced as guardrails."

**Form factor:** a full studio and builder app with canvas, token studio, code export and team roles. It is not a skill or plugin. Nothing in it emits a Markdown prompt file for another LLM tool; the closest things are "Design handoff export: tokens (DTCG), component specs, journey maps, and the release record" and code export.

**Feature catalog (§II, A–H):**
- **A. Studio:** live preview at phone, tablet, desktop and wide sizes. The "Visual selection studio: live tappable variants for structure, theme, typography, header, controls, shape, status marks, density, and motion, with saved picks read back before any build (the owner's standing rule)" is the closest match to your idea. Also a "Morphology sampler" (structure families compared side by side before decoration), direct manipulation that "writ[es] tokens and component props, never free pixels", and a journey canvas.
- **B. Design system:** DTCG token studio (OKLCH colour), component manager with a "10-state matrix", theme builder, brand kit.
- **C. Screens and interaction:** pattern library, state designer, motion designer (purpose tags, reduced-motion variants), feedback-timing tools, form designer, data display designer.
- **D. Content:** microcopy linguistics lint, label and taxonomy manager ("1 concept, 1 label"), proof and claims manager, localization workbench.
- **E. Navigation:** the Cartographer, search design, deep-link and return design.
- **F. Personalization:** density, type and motion as end-user settings; adaptive home; builder-side coaching depth.
- **G. Governance:** version diffs, review mode, roles.
- **H. Export:** per-stack code, handoff, a publish pipeline with the Floor Gate.

**Coaching loop (§IV):** "intent → map → options → build → simulate → critique → repair and rerun". Critiques must state what is wrong, where, why, and the fix. There is a teaching layer, and "override receipts" (rule, reason, date).

**Cartographer (§VI):** a "user goal → task → screen → action → result" intent graph, tested against four questions per screen: "Where am I? Where can I go? What happens if I activate this? How do I get back, undo, or exit?" Accuracy comes from four layers: graph rules, vision model, simulated users, and human tree tests. Metrics: task success, steps to intent, backtrack rate, loop rate, search-fallback rate, wrong-door rate.

**Knowledge bases (§VII), 9 in total:** UI, UX, wayfinding, psychology, linguistics, neuroscience (hype-controlled), engagement and derived value, accessibility, coding. Each entry follows one contract: rule; mechanism; example and counterexample; per-stack code; verification check; provenance (source, evidence tier, version, review date, scope). Stale packs are suspended.

**Accessibility profiles (§VIII):** "Profile 0 Off, Profile 1 Baseline, Profile 2 AA, Profile 3 AAA and regulated". The default is assumed to be Profile 1. An export receipt states the legal exposure from skipped checks.

**Engagement (§IX):** a dual scoreboard (engagement beside derived value); every mechanic needs a derived-value counterpart and a kill rule.

**Stack (§X, "verified 2026-11-12"):**
- React 19.3 / Next.js 16.4; Vue 3.5 / Nuxt 4 (3.6 is a release candidate); Svelte 5.57.1 / SvelteKit 3; Angular 22; Astro 7.0 / 7.4; Vite 8.0 / 8.1
- Tailwind v4; Radix; the shadcn own-the-source pattern (shipping its default fingerprint `--radius 0.625rem` unchanged is a slop tell); DTCG 2025.10; Style Dictionary v4
- Playwright + axe-core; Vitest 4; Core Web Vitals as design budgets
- An AST code graph over the builder's project

**LLM stack (§XI):** Qwen3-Coder-30B-A3B / 480B-A35B, Devstral-Small-2505, Qwen3-VL-30B / 235B, GLM-4.6V-Flash, Qwen3-235B-Thinking-2507, gpt-oss-120b / 20b, Qwen3-Embedding-8B + Reranker-4B, BGE-M3, Qwen3-4B, Qwen3Guard-Gen-8B. Excluded: Jina v3 and Llama 4. Kimi K2 is "challenger only". A router picks the cheapest model that clears each role's eval threshold.

**ML and self-improvement (§XII):** "observe → hypothesize → offline eval → shadow run → canary → promote or roll back". The loop may never change eval gates, guard configuration, licensing, accessibility exposure logic, the truth and security refusals, or the value rules.

**Evaluation (§XIII):** 12 golden UI build tasks, 30 seeded-defect screenshots, 200 retrieval queries, 100 guard prompts. Added in v2: slop-detector precision and recall, Floor Gate false-block audits, simulation-versus-human divergence, Ceiling Score movement.

**Build sequence (§XIV.A):**
1. Knowledge-base skeleton for a narrow product category
2. Guardrail machinery and the Floor Gate
3. Cartographer and the coaching loop on text and static renders
4. Visual selection studio, morphology sampler, live preview
5. Code generation with evals as the release gate, then vision critique, simulation, and the improvement loop

**Decisions still owed by the owner:** launch stack (React 19.3 + TypeScript + Next 16.4 assumed); accessibility default (Profile 1 assumed); self-hosted versus hosted inference; name clearance; launch category (data-dense SaaS, e-commerce or consumer mobile). "No spend is authorized."

**The guide's own pipeline (§19.1), which is the closest match to your step-by-step idea:**
"0. Intake answers → A.1 / 1. Design brief → A.2 (DESIGN-BRIEF.md, the source of truth) / 2. Direction options → A.3 (3 options, no code) / 3. Tokens + styleguide → A.4 / 4. ONE screen, then screenshots → A.5 / 5. State matrix + accessibility pass → A.6 / 6. Remaining screens, reuse the system → A.7 / 7. Critique, anti-slop, audit loops → A.8, section 21". A.1 adds: "Where you answer 'don't know,' tell the model to propose 3 options with tradeoffs."

---

## C. Option space / decision dimensions

No file gives a complete list of every decision dimension with every option. These are the pieces that exist:

- **Blueprint selection-studio variants:** structure, theme, typography, header, controls, shape, status marks, density, motion. No options are given for any of them.
- **Guide A.1 intake (24 questions)**, with options where it offers them:
  - Page type: marketing page / web app or tool / dashboard / content or editorial / e-commerce / mix
  - Density: airy / balanced / dense
  - Tone: playful / calm / serious / luxurious / technical
  - Theme: light / dark / both
  - Signature moment: hero interaction / data visualization / unique transition / distinctive illustration style
  - Open questions: 3 liked references with what is liked (type? density? motion? color? tone?); 2 anti-references; 5 brand adjectives and 5 "must NOT be"; required or forbidden colors; voice in 3 sample sentences; which states matter (empty, loading, error, permissions, offline); hero screen; accessibility target (default WCAG 2.2 AA); RTL; performance budget; stack.
- **A.2 brief fields:** style sentence and references; anti-references; density; theme; signature moment. Tokens: display / text / mono fonts, scale, weights; neutrals, accent, semantic colours; spacing base and scale; "radius personality, border and shadow rules"; motion durations, easing, and what must not animate. Components: library; button hierarchy; validation timing; table behaviour; toasts vs inline. Voice rules and words to use or avoid; banned list; definition of done.
- **A.3 directions must differ in** "typography, color strategy, layout structure, and motion personality, not just hue". Each direction gives a type pairing, 5–7 named colours with contrast ratios, a hero layout, one signature interaction, risks, and the defaults it avoids.
- **A.4 token set:**
  - fonts ×3; `--text-xs…--text-4xl`
  - `--color-bg`, `surface`, `surface-raised`, `border`, `text`, `text-muted`, `accent`, `accent-contrast`, `success` / `warning` / `danger` / `info` (each with a subtle variant)
  - `--space-1…12` on a 4 px base; `--radius-control`, `--radius-surface`; `--shadow-1/2/3`
  - `--duration-fast/base/slow`; `--ease-out`, `--ease-in-out`; a focus-ring token; a dark theme
- **A.8.5 single-change levers:** "type scale contrast, color ratio, spacing rhythm, or layout structure."
- **A.14 vague word → concrete instruction (11 rows):** modern/clean, pop, premium, fun, cluttered, flat/boring, looks like AI, responsive, accessible, match our brand, feels off. Example: "premium" → "display 56–96px vs 16px body, double padding, restrained color, slow 300ms ease-out".
- **States** (four lists that disagree):
  - 6.4: populated, empty, loading, error, partial/degraded, success, disabled, edge
  - A.6 matrix columns: default, hover, focus-visible, active, disabled, loading, empty, error, success, long-content
  - Blueprint: default, hover, focus, active, disabled, loading, empty, error, offline, success
  - Gap-file crawl conditions: empty, error, offline, permission, loading, not-found
- **Scoring dimensions:**
  - Guide 5.5 rubric (11): typography system, color and contrast, spacing and rhythm, hierarchy, originality, motion polish, states, accessibility, UX flow and IA, consistency, content and microcopy
  - Ceiling Score (11): research contact, states, navigation, content, system governance, performance, accessibility craft, motion, restraint, engagement recovery, engineering floor
  - A.8.1 critique (9): hierarchy, typography, color/contrast, spacing/rhythm, consistency, originality, state coverage, accessibility, microcopy
- **Quality ladder tiers A–F** (§5.3) could serve as examples of reference levels.

---

## D. Rules and checklists

**Accessibility**
- Build to WCAG 2.2 AA. The 9 new criteria: 2.4.11 / 12 / 13, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 3.3.9.
- §8.4 POUR checks: contrast 4.5:1 text, 3:1 large text and UI; reflow at 320 px; 200% text resize; visible focus ≥ 3:1 and not obscured; targets 24×24 px; drag alternatives; ≤ 3 flashes per second; pause control after 5 s of motion; `lang`; consistent help; redundant entry; accessible authentication; name / role / value; status messages.
- §8.6 13 implementation rules, including native HTML first, one `h1`, focus management, "never disable zoom", and following APG patterns.
- §8.7 layered testing; §8.8 component definition of done; B.1-A compliance checklist; A.10 widget prompt.

**Intuitive design**
- Nielsen's 10 heuristics as prompts; §9.2 load reducers (one primary action per view; chunks of 3–5; recognition over recall; no auto-advancing carousels); §9.3 frustration fixes.
- §9.4 error formula: what happened, why, what to do. Example: "Card number must be 16 digits. You entered 15…"
- §12.3 15 form rules; §12.4 navigation; §13.8 visual audit; A.17 five-minute checklist ("≤ 2 fonts, ≤ 6 sizes, neutrals + 1 accent, ≤ 3 radii"; "What one decision makes it ours?").
- B.1 sections B–F.
- Blueprint: the Cartographer's four questions; "1 concept, 1 label"; decision-unit quantities.
- Gap file: a "removal audit" on every screen; Baymard checkout fields 23.48 versus an ideal of 12–14.

**Anti-slop**
- Classic tells: Inter/Roboto, indigo-to-purple gradient, centered hero + logo strip, 3 equal cards with tinted-square icons, blobs, uniform radius and shadow, nested cards, ALL-CAPS eyebrows, uniform spacing, missing states, emoji icons, generic copy.
- The 2026 five clusters:
  1. cream + serif + terracotta
  2. near-black + acid-green or vermilion accent
  3. broadsheet hairlines with zero radius
  4. the SaaS card kit
  5. template chrome (eyebrows, middle-dot meta strings, "WORD - fragment" labels, mono labels, arrows appended to links)
- Gap file: page rhythm "hero → 3 cards → testimonials → 3-tier pricing → dark footer"; shadcn fingerprint; motion tells (65.1% infinite animation, 96.8% with no reduced-motion guard).
- Scoring rule: "no lone tell convicts; 3 or more co-occurring markers mark slop, 4 or more mark heavy slop, and structural tells outweigh surface tells."
- Prompts A.8.3 (sweep with replacements), A.15 system block. The principle: "Pair every ban with a replacement."

---

## E. Gaps, guardrails, risks, unverified items

**Guardrail layers (gap file, §III):**
- **Layer 0:** only admitted tokens and components can be produced; raw values are "unrepresentable". Morphology is chosen before generation. Proof slots accept only builder-supplied, sourced content.
- **Layer 1:** 4 required artifacts before any screen generates (intent graph placement, task inventory, 10-state plan, navigation entry). A missing one is a hard stop.
- **Layer 2:** structured output; copy lint; decision-unit checks.
- **Layer 3 (Floor Gate):** slop detector, state crawl, accessibility audit, Core Web Vitals, security and RLS checks, navigation graph checks.
- **Layer 4:** critique models gated by the seeded-defect eval.
- **Layer 5:** simulated users.
- **Layer 6:** three human confirmations (labels match users' words, proof claims are true, value metrics are honest).
- **Override law:** design items can be overridden with a receipt; truth and security items are refused, citing CVE-2025-48757 ("170 of 1,645 scanned Lovable apps with open databases").
- **Maintenance:** detector precision is re-measured at each pack release ("an overridden floor is no floor").

**The guide's open items (§24):**
- No controlled study of detailed briefs versus vague prompts; the prompt kit is "untested by me".
- LLM-as-judge validity for taste is unproven.
- No mobile eye-tracking data.
- PACE and AXIS-Bench were read at abstract level only.
- Gemini docs were read only through search excerpts.
- The DOJ reopening and the 508 refresh are known only from secondary sources.
- Not researched: ISR/RSC, Baseline browser support, passkeys, accessible data visualization, native-app accessibility, `aria-live` streaming patterns, ICU plurals, A/B peeking.
- Skill quality is judged from stars only; how fast the "AI look" drifts is not measured.
- Open problems: "How to specify taste in machine-checkable form", keeping brand identity without a human gatekeeper, automated screen-reader testing, measuring cognitive load without people, and when WCAG 3 arrives.

**Other risks and unverified items:**
- §23 risk map, for example "Rule-based slop detector passes → Still bland".
- F.3 list: Taste Skill, Emil Kowalski skills, unslop, Awwwards MCP, Stitch and Figma skills, Tesslate model currency.
- Unsettled dates: EN 301 549 citation (late Nov vs 16 Dec 2026).
- The 70–85% closeness figure is opinion.
- Blueprint: a "not-verified register" for Vue patch numbers; Style Dictionary v5 still in progress.

---

## F. Assessment

**Contradictions and inconsistencies**
1. **Product shape doesn't match what you described.** The blueprint is a large studio with 9 knowledge bases, self-hosted models, simulation, ML and teams. Your tool is a pick-between-options flow that outputs a Markdown prompt file. Only the selection studio, morphology sampler, "saved picks read back" and handoff export overlap. The blueprint has no Markdown-prompt output at all.
2. **State lists disagree** across four places: 8, 10 (two different sets of 10) and 6 conditions. The tool needs one canonical list.
3. **Viewport sets disagree:** 360/768/1440 (A.5, A.9); 360/768/1024/1440 (A.2, A.14, A.15); 375/768/1280 (§19.5, B.3). The spacing base is 4 px in A.4 but an "8px grid" in A.14.
4. **Broken internal references in the guide:** Appendix C and F.1 point to §7.6, §8.6 (for survey data), "Dates in 7.2 / 7.3" and so on, which don't match the current numbering. EU material is in 7.2 (there is no 7.6), the survey is in 8.3, and the US dates are in 7.1.
5. **The model lists are out of step.** The blueprint's LLM stack (Qwen3 / gpt-oss / Kimi K2 era, checked 2026-11-12) doesn't match the guide's 2026-11-11 snapshot (Kimi K3.1, DeepSeek-V4.1, Qwen3.8-27B; Claude 5.5 / GPT-6 / Gemini 4). This is duplicated work that has diverged.
6. **Two different scoring frames.** The guide's 5.5 rubric and the Ceiling Score are both 11 dimensions but different ones. The blueprint forbids averaging ("never averaged into a vanity number"); the guide averages its rubric.
7. **Name in the source.** The blueprint names the user ("the owner's standing rule"). Treat that as private.

**Duplicated material:** Core Web Vitals, the 0.1/1/10 s thresholds, text-expansion figures, shadcn and DTCG notes, slop tells, and state lists all repeat across the files, broadly consistently.

**Claims I could not check or that look thin:**
- Many figures are dated in 2026 (AUV-Bench arXiv 2609.34854, "Usable but Conventional" 2605.15124, the TOSEM/AXIS/PACE 2026 results, WebAIM 2026, Arena Elo, model names and prices, framework versions). I did not check any of them against outside sources.
- I checked the internal arithmetic: the rubric averages (2.3 / 3.0 / 3.9 / 4.95), the percentages (47 / 61 / 78%, 59% of the gap closed) and the WCAG 2.2 counts (86 = 31 A + 24 AA + 31 AAA) are correct.
- The blueprint's psychology items (Cowan's 4, Bouma's ≈ 0.5 × eccentricity, habit formation median 66 days with range 18–254, the choice-overload meta-analysis near 0, the 1999 reward-undermining meta-analysis) match well-known literature.
- The gap file's 65.1% / 96.8% motion scan of 196 apps, the "308 errors across 6 sites" result, the Baymard 59% / 2% / 0 figures, and the CodeRabbit 1.7× / 2.74× figures cite research files I didn't receive, so they are unsourced here.
- The guide is honest that all of Appendix A is "untested".

**What you can reuse as seed content**
- **Step sequence:** §19.1 plus the "order of work" (§6.1). These map almost directly onto tiny steps: intake → direction (3 options) → tokens → one screen → states → accessibility → consistency → critique.
- **Option generators:** A.1's enumerated choices; A.3's rule that "options must differ in typography, color strategy, layout, motion"; A.14's vague-word → concrete-spec table (the core of "apples to apples"); the A.4 token schema; A.8.5's one-lever-at-a-time pattern; the blueprint's nine variant axes; the gap file's "morphology before decoration" rule.
- **Output template:** A.2 (DESIGN-BRIEF.md), A.15 (system block) and A.16 (per-task skeleton) together are close to the Markdown prompt file you want. A.5–A.7 and A.9 can be appended as verification instructions.
- **Accessibility and intuitive-design defaults:** §8.4, §8.6, §8.8, §9.2–9.4, §12.3, §13.8, A.17, B.1, B.3. These could also become profiles, borrowing the blueprint's Profile 0–3 idea with an exposure receipt.
- **Anti-slop:** the five 2026 clusters, the classic tells, the 3-marker rule, and the "ban plus replacement" principle. The guide notes the fingerprint moves, so the tool needs a versioned list.
- **Coaching:** the blueprint's critique standard (what / where / why / fix), the Cartographer's four questions, override receipts with reasons, and the gap file's "pre-generation contracts" (states, navigation and real content required before any build). These are good gates for a step-by-step flow.

**What's missing for your tool:** a complete taxonomy listing every decision dimension with 3–5 concrete, visually renderable options each; a single canonical state list; and any design for the option-picking interaction itself (how options are shown, compared and recorded).
