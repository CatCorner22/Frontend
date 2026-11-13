# Open-source code, data, and models to borrow, with licenses

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

# Open-source research report: what to borrow for a step-by-step visual design picker (verified 2026-11-13)

Almost everything you want to borrow is under a permissive license (MIT, ISC, Apache-2.0, OFL, CC-BY). Four items are dangerous for a closed commercial product:
- **apca-w3**: commercial use is prohibited without a signed agreement.
- **Realtime Colors**: CC BY-NC-ND, so no commercial use and no derivatives.
- **Gemma models**: their own license with use restrictions.
- **WebUI dataset**: "license: other", with copyright caveats.

Two more need light compliance work: **axe-core** (MPL-2.0) and **pa11y** (LGPL-3.0). Most licenses below come from `npm view` (run today) or the repo's own GitHub page. `gh api` was blocked in this sandbox, so I have no star counts or commit dates from the API. Where I give stars, they come from the GitHub web page.

## A. Color

| Item | License | Maintenance | What to reuse | Risks |
|---|---|---|---|---|
| **culori** (npm `culori`, github.com/Evercoder/culori) | MIT | v4.0.2, modified 2026-04 | OKLCH/OKLab conversion, gamut mapping, `wcagContrast`, interpolation. Tree-shakeable `culori/fn` build. | None significant. A good choice for the core engine. |
| **colorjs.io** | MIT | v0.7.1, modified 2026-07 | Spec-grade conversions, `contrast()` with WCAG21/APCA/deltaPhi, CSS Color 4 parsing | Still pre-1.0, so the API can change. Its built-in APCA implements the formula but does not bundle apca-w3. Treat APCA as advisory only. |
| **Radix Colors** (`@radix-ui/colors`) | MIT | v3.0.0, last release around 2025-12 | Hand-tuned 12-step light/dark scales with documented semantic steps (1–2 backgrounds, 9–10 solid, 11–12 text). These are a good set of preset palettes. | Static data. Custom brand colors need a generator. |
| **Adobe Leonardo** (`@adobe/leonardo-contrast-colors`, github.com/adobe/leonardo, about 2.2k stars) | Apache-2.0 | v1.1.0, modified 2026-10 | `generateContrastColors()` / `Theme` generate colors for target contrast ratios. This maps directly onto "enforce AA automatically". | Keep the Apache NOTICE file. |
| **Material Color Utilities** (`@material/material-color-utilities`) | Apache-2.0 | v0.4.0, modified 2026-01 | HCT color space, tonal palettes, `SchemeTonalSpot` and similar, and the source-color-to-full-scheme pipeline | Opinionated toward Material. Use it as one "style family", not as the core. |
| **Open Props** | MIT | v1.7.23, modified 2026-01 | Ready CSS custom properties for easing, shadows, radii and gradients. Good for the shape, depth and motion steps. | Few releases. Copy values rather than depend on it at runtime. |
| **Tailwind palette** (`tailwindcss` v4.3.5) | MIT | Very active | The v4 OKLCH palette values and the `@theme` conventions | None. |
| **hextimator** (github.com/fgrgic/hextimator) | MIT | v0.14.4, modified 2026-09 | Runtime theme generation from one brand hex ("Runtime theming for multi-tenant apps") | Pre-1.0 and small, so check how it handles contrast before relying on it. Better studied than depended on. |
| **apca-w3** (github.com/Myndex/apca-w3) | **"Limited W3 License"** (not OSI) | v0.1.9, last published 2022 | Nothing | The LICENSE says "Commercial use is prohibited without a written and signed commercial license agreement" (except under the W3 cooperative agreement) and excludes non-web uses. **Avoid.** WCAG 2.2 AA does not require APCA anyway. |
| **OKLCH scale generators** | MIT | — | `apcach` (v0.6.4, stale since 2023), `tailwindcss-palette-generator` (v2.4.0). Krehel's "better-colors" skill (see F) has OKLCH guidance text. | apcach is APCA-based, so it carries the same advisory-only caveat. You will likely write your own OKLCH ramp on top of culori in about 100 lines. |

## B. Typography

- **Fontsource** (github.com/fontsource/fontsource, about 6.3k stars). Code is MIT. Fonts carry their own licenses, mostly OFL-1.1, some Apache-2.0, and Ubuntu under UFL-1.0. `@fontsource/inter` 5.3.0 and the `@fontsource-variable/*` packages are actively published (2026-07). You can self-host the fonts and bundle the woff2 subsets. OFL allows commercial bundling. You may not sell the fonts on their own, and the license text must travel with them. Read the license field per family.
- **Google Fonts metadata** (github.com/google/fonts). Each family folder has a METADATA.pb file and its own license (OFL, Apache or UFL). You can build a curated family list with category, axes and weights offline from the repo. The Google Fonts Developer API needs a key and has its own terms. I did not verify those terms.
- **Utopia** (`utopia-core`). ISC, v1.6.0, last published 2024-09. Pure functions for fluid type and space scales (clamp). Small and stable, so adopt it.
- **Capsize** (`@capsizecss/core` 4.1.3 and `@capsizecss/metrics` 4.4.0, MIT, metrics updated 2026-10). Leading trim plus font metrics, including fallback-font metric overrides that reduce layout shift (CLS). Adopt it. The related `fontaine` (MIT) generates fallback fonts.
- **Type-scale tools.** type-scale.com is a closed website. Ratio scales are trivial to compute with Utopia.
- **Font-pairing data.** The best permissive source is UI UX Pro Max's 74 curated pairings (MIT, see F). Fontpair.co is not openly licensed. Curate your own pairings and record the reasoning.

## C. Tokens and export

- **Style Dictionary** (`style-dictionary` 5.8.0, Apache-2.0, published 2026-11). Supports DTCG `$value`/`$type`. Can generate CSS variables, JS and more. It runs in the browser with an in-memory filesystem, though I have not tested that in a Vite SPA.
- **Tokens Studio.** `@tokens-studio/sd-transforms` (MIT, 2.0.3, 2026-10) and `@tokens-studio/types` (MIT). The Figma plugin repo is reported as MIT, but I saw that only on aggregators, not the LICENSE file. It also has a paid "Starter Plus" tier. Reuse the sd-transforms only if you need Tokens Studio interop.
- **DTCG validation.** **Terrazzo** (`@terrazzo/parser` and `@terrazzo/cli`, MIT, 2.10.0, 2026-10) parses and validates DTCG and can act as your validator. No package named "dtcg-validator" exists on npm. The spec repo is design-tokens/community-group.
- **Google Labs DESIGN.md** (github.com/google-labs-code/design.md, about 28.9k stars).
  - Repo LICENSE is **Apache-2.0**.
  - **`@google/design.md` exists on npm** (v0.4.0, 2026-07-27, published by google-wombot, binaries `design.md` and `designmd`). Its package.json has **no license field**, so for compliance rely on the repo LICENSE.
  - The format is YAML tokens (`colors`, `typography`, `rounded`, `spacing`, `components`) in front matter or fenced blocks, plus Markdown prose.
  - Sections, all optional, must appear in this order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
  - The CLI has `lint` (11 rules, including `contrast-ratio` 4.5:1, `broken-ref` and `section-order`), `diff`, `export --format dtcg|css-tailwind|json-tailwind`, and `spec`.
  - It is marked **alpha**, so pin the version.
  - It can serve as both your DESIGN.md emitter target and your CI check, and its exporter can cross-check your own DTCG and Tailwind output. Its dependencies (unified, remark, yaml, zod) are browser-friendly, so it may run client-side. I have not tested that.
- **Tailwind v4 `@theme`.** You can generate the `@theme { --color-*: oklch(...) }` block yourself, and DESIGN.md's `css-tailwind` export is a reference implementation.
- **shadcn/ui theme format and registry** (`shadcn` CLI 4.23.0, MIT, 2026-10). It uses CSS variables (`--background`, `--primary`, `--radius`, …) in OKLCH, plus registry-item JSON (`registry:style` / `registry:theme`). Exporting a registry-item JSON lets users run `npx shadcn add <url>`, which is a strong path to v0, Lovable and Bolt, since those tools build on shadcn.

## D. Components, primitives and mockup material

**Primitives**

| Library | License | Version (date) |
|---|---|---|
| Radix Primitives | MIT | `@radix-ui/react-dialog` 1.3.1 (2026-10) |
| React Aria Components | Apache-2.0 | 1.22.1 (2026-10) |
| Base UI | MIT | **`@base-ui/react` 1.9.0** (2026-10) |
| Ark UI | MIT | 5.40.0 (2026-10) |

- Base UI's current package is `@base-ui/react`. The old `@base-ui-components/react` name stopped at rc.0.
- For the picker app's own UI, React Aria is the strongest for accessibility. Radix/shadcn is closest to what the LLM tools will generate, so mockups built on shadcn markup will match the exported code.

**Icons**
- Lucide: ISC, `lucide-react` 1.72.0, 2026-11.
- Tabler: MIT, 3.51.0, 2026-11.
- Phosphor: MIT, `@phosphor-icons/react` 2.1.10, last published 2025-05, so slower.
- All three are fine. Offering a choice between them is itself a "style" decision you can put in the picker.

**Illustrations**
- **Open Peeps** is CC0, which is safe.
- **Humaaans**: sources conflict on whether it is CC0. Verify on the site before using it.
- **unDraw** allows commercial use, but its license forbids redistributing it as a pack, AI training, and building integrations. **Avoid bundling unDraw** in a tool.

**Layout patterns (open alternatives to Every Layout)**
- Pylon (almonk/pylon): MIT, about 482 stars, Flexbox stack primitives.
- SmolCSS (5t3ph/smolcss): about 838 stars, **no license file visible**. Treat it as all-rights-reserved and learn from it only.
- The Every Layout primitives (Stack, Cluster, Sidebar, Switcher, Cover, Grid) are well-known ideas and can be reimplemented. Do not copy their text or code.

**Wireframe and template sets**
- WebSight HTML (CC-BY-4.0, see H) is a source of synthetic page structures.
- shadcn "blocks" are MIT.
- The safest source is your own hand-built mockup on shadcn/Tailwind.

## E. Existing theme editors

| Tool | License | What it does | How it differs from a step-by-step picker |
|---|---|---|---|
| **tweakcn** (github.com/jnsahaj/tweakcn, about 10.5k stars, 765 commits) | **Apache-2.0** per GitHub. The npm package named `tweakcn` (MIT) is probably unrelated. | Free-form visual editor for shadcn/Tailwind v4 CSS variables, with presets and live preview | It is a full control panel, not guided A/B/C/D choices. You can study and fork it. Keep the NOTICE file. |
| **ui.jln.dev** (now jln13x/ui.jln.dev) | MIT according to an aggregator (unverified) | Over 10,000 generated shadcn themes, shareable through URL parameters | Browse-and-copy, with no guidance and no contrast enforcement |
| **Realtime Colors** (juxtopposed/realtimecolors, 933 stars) | **CC BY-NC-ND 4.0** | Live palette preview on a sample landing page | Very close in spirit to your idea. **Do not copy code or layout.** Ideas only. |
| **Material Theme Builder** (material-foundation/material-theme-builder) | Apache-2.0 | Dynamic-color scheme builder | **Archived 2026-07-23.** The repo seems to hold only README and issue templates. Use material-color-utilities instead. |
| **Leonardo web app** | Apache-2.0 | Contrast-target scale builder | Expert tool for color only |

Others include themecn and shadcn-studio. I did not check their licenses. None of these tools walks through navigation, layout, type, motion and states as decisions, and none produces an LLM-targeted export bundle. That is your gap in the market.

## F. Agent skills and prompt assets

- **Anthropic `frontend-design`** (anthropics/skills, about 194k stars). `skills/frontend-design/LICENSE.txt` is **Apache-2.0**, which I confirmed. Other skills in that repo may differ; for example, document skills are noted separately. You may quote or adapt the text with attribution and a statement of changes.
- **Anthropic cookbook "Prompting for frontend aesthetics"** (platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics, reportedly at `coding/prompting_for_frontend_aesthetics.ipynb`). The cookbook repo is **MIT**. The prompt block (avoid Inter/Arial, commit to a direction, and so on) can be reused with the copyright notice.
- **Vercel web-interface-guidelines** (vercel-labs/web-interface-guidelines, about 1.2k stars). **MIT**. Includes AGENTS.md and a review command. Good source for the states, forms, motion and performance rules. Its Vercel-specific copywriting rules are not universal.
- **Impeccable** (pbakaus/impeccable, about 109k stars). **Apache-2.0**, with a NOTICE.md you must carry. It is derived from Anthropic's skill. It has 24 steer/review commands and a **62-rule "AI slop" detector**. The detector rules could become your "anti-pattern" warnings.
- **UI UX Pro Max** (nextlevelbuilder/ui-ux-pro-max-skill, about 149k stars). **MIT**. Its CSV datasets hold 80 styles, 192 palettes, 74 font pairings, 120 UX guidelines and 34 landing patterns. This is the most directly reusable *data*, but check where the palette and style data came from.
- **Emil Kowalski skills** (emilkowalski/skills, about 56.5k stars). **MIT** (LICENSE file present). 18 skills, mostly motion: animation rules, a vocabulary for describing animation, and "learn-taste", which writes rules into DESIGN.md. Good for the motion step.
- **better-colors** (jakubkrehel/skills, about 12.1k stars). **MIT**. 14 "better-*" skills covering colors, typography, layout and accessibility. Several unrelated skills share the "better-colors" name, so check the publisher.
- **openaec frontend-design-claude-skill-package** (openaec-foundation). **MIT**, but 1 star and 3 installs per sub-skill. Low signal.
- **Guidance.** All of these are permissive, so the text can be reused if you keep copyright and license notices. For Apache-licensed sources, also keep NOTICE files and mark your changes. A cleaner approach is to write your own rules and cite the sources. Your exported prompt can then *recommend* that users install these skills rather than embedding them.

## G. Checks

- **axe-core** (4.14.0, MPL-2.0, published yesterday) and `@axe-core/playwright`. MPL is file-level copyleft. Using or bundling it unmodified, even client-side for live checks, puts no obligation on your own code. If you modify axe files, you must publish those files. Keep its notice. Safe in practice.
- **Playwright** (1.65.0, Apache-2.0). Fine.
- **pa11y** (10.0.0, **LGPL-3.0-only**). Fine as a CI dev tool. Do not bundle it into the shipped product. Use axe directly instead.
- **Lighthouse CI** (`@lhci/cli` 0.16.1), Apache-2.0.
- **MIT dev tools, all published within the last month:** html-validate 11.21.1, stylelint 18.0.0, size-limit 14.3.0, dependency-cruiser 18.7.2.
- **Trusted Types and sanitizing**
  - DOMPurify 3.4.17 is dual-licensed MPL-2.0 OR Apache-2.0. Choose Apache. It has built-in Trusted Types support.
  - `@types/trusted-types` is MIT.
  - The W3C `trusted-types` polyfill is under the W3C license and stale (2022).
  - `eslint-plugin-no-unsanitized` is MPL-2.0 and is dev-only.
  - No `eslint-plugin-trusted-types` exists on npm.
  - Set CSP `require-trusted-types-for 'script'` on the static host.

## H. Models and datasets

| Item | License | Notes |
|---|---|---|
| Qwen3-VL-8B / 30B-A3B-Instruct | Apache-2.0 | 80M and 18.6M downloads. Strongest open VLMs for UI screenshots. Needs a GPU; not viable in-browser. |
| UI-TARS-1.5-7B (ByteDance) | Apache-2.0 | Tuned for GUI grounding and agent control, not aesthetic critique |
| Gemma 3 27B | **Gemma license**, gated | Has use-policy restrictions. Avoid embedding it in a commercial product without legal review. |
| Tesslate UIGEN-X-32B, WEBGEN-4B-Preview / OSS-20B / Devstral-24B | Apache-2.0 | Generate Tailwind HTML. "Preview" quality with modest downloads. Several WEBGEN-2 checkpoints have no license tag. |
| WebGen-LM-7B/14B/32B (luzimu) | MIT | Research models, under 300 downloads |
| UIClip (biglab/uiclip_jitteredwebsites-2-224-paraphrased) | MIT, CLIP-B/32 | Usable aesthetic scorer at about 151M parameters, so it could run with ONNX or transformers.js. Useful only for coarse ranking of options. |
| WebSight | CC-BY-4.0 | 2M+ synthetic HTML/screenshot pairs. Requires attribution. |
| Design2Code dataset | ODC-By | 484 real pages, intended for evaluation |
| UICrit (google-research-datasets/uicrit) | CC-BY-4.0 | 11,344 critiques of 1,000 RICO screens. A good source of few-shot examples for a critique prompt. Mobile only. |
| RICO | CC-BY-4.0 according to derived dataset cards | I could not verify on interactionmining.org. Mobile apps from around 2017. |
| biglab/webui-all | "other" | Scraped website copyrights apply. Avoid for commercial use. |

**Plain verdict.** For "suggest more options" and "critique my screenshot", a hosted frontier model called with the user's own API key will be far better than these. It fits a static SPA with no backend and no GPU costs. Open models make sense only as an optional self-hosted endpoint. Within your rules, use UICrit as few-shot critique examples and, optionally, UIClip for in-browser ranking.

## (1) Adopt now / evaluate later / avoid

- **Adopt now:**
  - Color: culori, Leonardo contrast-colors, Radix Colors (as presets)
  - Type: Utopia-core, Capsize plus metrics, Fontsource (OFL fonts)
  - Tokens: Style Dictionary or Terrazzo, `@google/design.md` (pinned, as a lint/export cross-check)
  - Components: shadcn theme and registry format, React Aria or Radix, Lucide or Tabler
  - Checks: axe-core, Playwright, html-validate, stylelint, size-limit, dependency-cruiser, DOMPurify (under Apache)
  - Rules text: Vercel guidelines, Anthropic frontend-design, Impeccable rules, Emil and Krehel skills (with attribution)
- **Evaluate later:** colorjs.io (pre-1.0), Material Color Utilities, Open Props values, hextimator, UI UX Pro Max datasets (check provenance), tweakcn (study or fork), UIClip, Qwen3-VL self-hosting, Pylon, Open Peeps.
- **Avoid:** apca-w3, Realtime Colors code, unDraw bundling, SmolCSS (unlicensed), Gemma (unless reviewed), webui-all, pa11y in the shipped bundle.

## (2) Licenses that endanger a closed-source commercial product

- apca-w3: commercial use prohibited.
- Realtime Colors: CC BY-NC-ND.
- Gemma license: use restrictions.
- webui-all: "other", scraped copyrights.
- unDraw: bans redistribution and integrations.
- Anything with no license, such as SmolCSS: all rights reserved.

These carry obligations but are not dangerous:
- MPL-2.0 (axe-core, DOMPurify if you choose MPL): publish any MPL files you modify.
- LGPL-3.0 (pa11y): keep it out of the shipped bundle.
- CC-BY datasets: attribution required.
- Apache NOTICE files (Leonardo, Impeccable, tweakcn, Anthropic skill): ship the notices.

## (3) What I could not verify

- Star counts and commit dates from the GitHub API, which was blocked here. Stars above come from GitHub web pages.
- `@google/design.md`'s missing package.json license field; whether it runs in the browser.
- The exact LICENSE text for tweakcn, Krehel, Emil and openaec. I relied on the license shown on the GitHub page.
- Tokens Studio plugin license (aggregators only).
- ui.jln.dev license.
- RICO's original license page.
- Humaaans license.
- Google Fonts API terms.
- Whether Material Theme Builder source was ever published.
- Where the UI UX Pro Max palette and style data came from.
- That the cookbook notebook lives at the reported path.

Sources:
- [design.md](https://github.com/google-labs-code/design.md)
- [anthropics/skills frontend-design LICENSE](https://github.com/anthropics/skills/blob/main/skills/frontend-design/LICENSE.txt)
- [apca-w3 LICENSE](https://raw.githubusercontent.com/Myndex/apca-w3/master/LICENSE.md)
- [Impeccable](https://github.com/pbakaus/impeccable)
- [Vercel web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [tweakcn](https://github.com/jnsahaj/tweakcn)
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [Emil Kowalski skills](https://github.com/emilkowalski/skills)
- [jakubkrehel/skills](https://github.com/jakubkrehel/skills)
- [openaec package](https://github.com/openaec-foundation/frontend-design-claude-skill-package)
- [claude-cookbooks](https://github.com/anthropics/claude-cookbooks)
- [Frontend aesthetics cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)
- [ui.jln.dev listing](https://awesome.ecosyste.ms/projects/github.com%2Fjln13x%2Fui.jln.dev)
- [Realtime Colors repo](https://github.com/juxtopposed/realtimecolors)
- [Material Theme Builder](https://github.com/material-foundation/material-theme-builder)
- [Leonardo](https://github.com/adobe/leonardo)
- [Fontsource](https://github.com/fontsource/fontsource)
- [Pylon](https://github.com/almonk/pylon)
- [SmolCSS](https://github.com/5t3ph/smolcss)
- [Tokens Studio listing](https://awesome.ecosyste.ms/projects/github.com%2Ftokens-studio%2Ffigma-plugin)
- [unDraw license](https://undraw.co/license)
- [Open Peeps](https://openpeeps.com)
- [UICrit paper](https://arxiv.org/abs/2407.08850)
- [UIClip paper](https://arxiv.org/abs/2404.12500)
- [UIClip model](https://huggingface.co/biglab/uiclip_jitteredwebsites-2-224-paraphrased)
- [WebSight](https://hf.co/datasets/HuggingFaceM4/WebSight)
- [Design2Code](https://hf.co/datasets/SALT-NLP/Design2Code)
- [UIGEN-X-32B](https://hf.co/Tesslate/UIGEN-X-32B-0727)
- [WEBGEN-4B](https://hf.co/Tesslate/WEBGEN-4B-Preview)
- [WebGen-LM-7B](https://hf.co/luzimu/WebGen-LM-7B)
- [Qwen3-VL-8B](https://hf.co/Qwen/Qwen3-VL-8B-Instruct)
- [UI-TARS-1.5](https://hf.co/ByteDance-Seed/UI-TARS-1.5-7B)
- [Gemma 3 27B](https://hf.co/google/gemma-3-27b-it)
- [webui-all](https://hf.co/datasets/biglab/webui-all)
- [RICO Screen2Words card](https://huggingface.co/datasets/rootsautomation/RICO-Screen2Words/blob/main/README.md?code=true)
- [better-colors](https://www.ui-skills.com/skills/jakubkrehel/better-colors/)
