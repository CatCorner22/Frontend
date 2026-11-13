# What the best human-built frontends do

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

I found plenty of concrete, numbered guidance, but it is lopsided. The rules with numbers come almost entirely from practitioner rule sets and design-system source files I read on GitHub. The product companies' own posts (Linear, Stripe, Figma, Family, Superhuman, Things, Arc, Notion) are mostly philosophy plus a few numbers, and I only saw search snippets of them. These hosts would not load in this sandbox: rauno.me, linear.app, stripe.com, vercel.com, design-system.service.gov.uk, radix-ui.com, karrisaarinen.com, github.blog and hn.jakechampion.name. To read those pages in full they need to be allowed in the session's network settings.

Key: **[F]** means I read the page itself. **[S]** means I only saw a search snippet or a secondary summary.

---

## 1. Exemplars

| Product / system | Type | Color | Density, shape, depth | Motion and feedback | Copy and voice | Signature move |
|---|---|---|---|---|---|---|
| **Linear** | Inter Display for headings, Inter for the rest [S] | Themes are generated in LCH from three inputs (base, accent, contrast) instead of 98 variables, and high-contrast themes come for free [S] | Aims for less visual noise, tight alignment and dense navigation [S] | Keyboard-first [S] | 2026 principle: "Don't compete for attention you haven't earned" [S] | A sidebar dimmed in 2026, shown in a three-variable theme [S] |
| **Stripe** | — | CIELAB palette. Any two colors five or more levels apart are guaranteed enough contrast for small text [S] | — | "If you disable animations, the flow should feel broken" (Checkout, 2014) [S]. Connect demos use the Web Animations API and honor prefers-reduced-motion [S] | — | A WebGL mesh gradient ("minigl", four color stops driven by sine and cosine waves) [S, reverse-engineered by a third party] |
| **Vercel (Web Interface Guidelines)** | tabular-nums, curly quotes, a real "…" character, no widows [F] | APCA contrast over WCAG 2. Borders and shadows are tinted toward the background hue [F] | At least two shadow layers. Child radius no larger than the parent's, and concentric [F] | transform and opacity only, never `transition: all`, every animation interruptible [F] | Active voice, numerals for counts, errors say how to fix the problem [F] | Deep-linking every piece of state (filters, tabs, pagination, panels) [F] |
| **Apple HIG** | Optical sizes and tracking adjust automatically per point size [S] | — | 44×44pt minimum hit area, 60pt in visionOS [S] | Critically damped springs with a 0.3–0.4s response; press feedback on pointer-down [F, via Emil's apple-design skill] | — | Release velocity carries into the spring [F, same skill] |
| **GOV.UK** | New Transport typeface. 19px body; every line height is a multiple of 5px; 640px breakpoint [F] | Yellow-and-black focus state [F] | 960px page width, 30px gutter, 2px form borders, 3px focus width [F] | — | Plain English is mandatory; "Apply", not "Apply now" [S] | A focus state you cannot miss: yellow fill plus a thick black bottom border [F] |
| **Shopify Polaris** | Line heights are multiples of 4px; scales tuned for dense software, not long reading [S] | Semantic tokens over primitive ones [S] | 4px base (space-100 = 4px) [S]; density is a stated principle | — | — | — |
| **GitHub Primer** | — | Three token tiers: base, functional, component. Functional tokens respect color modes [S] | — | — | — | Inclusive themes, including colorblind variants [S] |
| **IBM Carbon** | — | — | — | Two motion modes. Productive: `cubic-bezier(0.2,0,0.38,0.9)`, fast-01 = 70ms. Expressive: `(0.4,0.14,0.3,1)`, kept for rare moments [S] | — | Productive vs. expressive motion as a named switch |
| **Radix Colors** | — | 12-step scales, each step assigned a job; text steps guarantee APCA Lc 60 and Lc 90 [F] | — | — | — | Role-based color steps (detailed in section 2) |
| **Family (Benji Taylor)** | — | — | — | Simplicity, then fluidity, then delight, in that order of dependency [S] | Reveal options only as they become relevant [S] | — |
| **Superhuman** | — | — | — | 100ms is the ceiling, under 50ms the target [S] | — | J/K navigation and shortcuts as the core of the product [S] |
| **Raycast** | — | Near-black canvas [S, unofficial] | Radius steps from 4px (keycaps) to 16px (large mockups) [S, unofficial] | Toasts live inside the window and expand with a shortcut [S] | — | Command palette as the main surface |
| **Arc** | — | A color or gradient per Space as a context cue [S] | The tab bar, bookmarks bar and URL field collapse into one sidebar [S] | — | — | Theming of the browser frame |
| **Things 3** | Custom type [S, unsourced] | — | — | Magic Plus: a button you drag to choose where the new item goes [S] | — | Drag-to-place creation |
| **Notion** | Only three font choices: Default, Serif, Mono [S] | — | "Small text" and "Full width" toggles [S] | — | — | Constraining choice as a design decision |
| **Figma UI3** | — | — | Floating, rounded panels were partly reversed after user pushback [S] | — | — | Canvas first [S] |
| **Airbnb DLS** | Custom typeface Cereal (with Dalton Maag, 2018) [S] | — | — | — | — | One typeface across every platform [S] |
| **Sonner (Emil Kowalski's toast component)** | — | — | 356px wide, 14px gap, 24px offset (16px on mobile) [F] | 3 toasts visible, 4000ms lifetime, 45px swipe threshold, 200ms exit [F] | — | Stacked toasts as a single object |

Sources: [Vercel WIG](https://github.com/vercel-labs/web-interface-guidelines) · Linear: [part II redesign](https://linear.app/now/how-we-redesigned-the-linear-ui), [2026 refresh](https://linear.app/blog/behind-the-latest-design-refresh) · Stripe: [colors](https://stripe.com/blog/accessible-color-systems), [Checkout animations](https://medium.com/bridge-collection/3d1b0a9b810e), [Connect front end](https://stripe.com/en-ro/blog/connect-front-end-experience), [gradient](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect) · [Emil apple-design skill](https://raw.githubusercontent.com/emilkowalski/skill/main/skills/apple-design/SKILL.md) · [Apple forum, 44pt](https://developer.apple.com/forums/thread/739201) · GOV.UK: [type scale](https://raw.githubusercontent.com/alphagov/govuk-design-system/main/src/styles/type-scale/index.md), [focus states](https://raw.githubusercontent.com/alphagov/govuk-design-system/main/src/get-started/focus-states/index.md), [measurements](https://raw.githubusercontent.com/alphagov/govuk-frontend/main/packages/govuk-frontend/src/govuk/settings/_measurements.scss), [writing for UIs](https://gov.uk/service-manual/design/writing-for-user-interfaces) · [Polaris tokens](https://polaris.shopify.com/design/layout/layout-tokens) · [Primer color](https://primer.style/foundations/color/overview) · [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/) · [Radix scale](https://raw.githubusercontent.com/radix-ui/website/main/data/colors/docs/palette-composition/understanding-the-scale.mdx) · [Family values](https://benji.org/family-values) · [Superhuman](https://blog.superhuman.com/superhuman-is-built-for-speed/) · Raycast: [fresh look](https://raycast.com/blog/a-fresh-look-and-feel), [unofficial DESIGN.md](https://design.hagicode.com/designs/raycast/) · [Arc](https://www.wikipedia.org/wiki/Arc_(browser)) · [Things](https://9to5mac.com/2017/05/19/friday-5-things-3-video-top-features/) · [Notion fonts](https://zapier.com/blog/how-to-change-font-in-notion/) · [Figma UI3](https://www.figma.com/blog/our-approach-to-designing-ui3/) · [Airbnb Cereal](https://eyeondesign.aiga.org/airbnbs-new-typeface-is-a-case-study-in-unified-accessible-design/) · [Sonner source](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/index.tsx)

## 2. Craft practices as checkable rules

Sources for this section, all read in full unless marked:
- **V**: [Vercel WIG](https://github.com/vercel-labs/web-interface-guidelines)
- **K**: [Jakub Krehel's make-interfaces-feel-better SKILL.md](https://raw.githubusercontent.com/jakubkrehel/make-interfaces-feel-better/main/skills/make-interfaces-feel-better/SKILL.md)
- **E**: [Emil Kowalski's emil-design-eng SKILL.md](https://raw.githubusercontent.com/emilkowalski/skill/main/skills/emil-design-eng/SKILL.md)
- **EC**: [Emil's ui-cheatsheet](https://raw.githubusercontent.com/emilkowalski/skill/main/ui-cheatsheet.md)
- **EA**: [Emil's apple-design skill](https://raw.githubusercontent.com/emilkowalski/skill/main/skills/apple-design/SKILL.md)
- **R**: Radix (link above)
- **G**: GOV.UK (links above)

**Typography**
- Numbers that change or get compared use `font-variant-numeric: tabular-nums` (V, K).
- Headings use `text-wrap: balance`; body text uses `text-wrap: pretty` (K).
- Large headings get letter-spacing of about −0.02em and line-height of about 1.05; body text gets about 1.5 (EC, EA).
- Body line length is capped at 65ch (EC).
- Use the real "…" character, curly quotes, and a non-breaking space between a number and its unit (`10&nbsp;MB`) (V).
- Display text is sized with `clamp(2rem, 5vw, 4rem)` (EA).
- Type sizes come from a fixed scale, and line heights sit on the grid: multiples of 5px at GOV.UK, 4px at Polaris (G; Polaris [S]).
- Build hierarchy with weight and color before size (Refactoring UI, via a [summary](https://sglavoie-github-io.pages.dev/posts/2023/09/09/book-summary-refactoring-ui/) [S]).
- `-webkit-font-smoothing: antialiased` on the root (K).

**Color**
- Build palettes in a perceptual color space (LCH, OKLCH or Lab), not HSL. Linear and Stripe both do this [S].
- Give every color step a job, following Radix's 12 steps (R):
  - 1–2: app and subtle backgrounds
  - 3, 4, 5: component background at rest, hover, and pressed/selected
  - 6, 7, 8: borders for non-interactive elements, interactive elements, and strong borders or focus rings
  - 9, 10: solid fill and its hover
  - 11, 12: low-contrast text (APCA Lc 60) and high-contrast text (Lc 90)
- Steps far enough apart guarantee contrast: Stripe's rule is five levels apart for small text [S].
- Hover, active and focus states have more contrast than the rest state (V).
- On colored backgrounds, tint borders, shadows and text toward the background's hue (V). Never put grey text on color (Refactoring UI [S]).
- Status is never shown by color alone (V).
- Set `color-scheme: dark` and a matching `theme-color` meta tag (V).

**Layout and spacing**
- Use a single base unit: 4px (Polaris [S]).
- Nudge alignment optically by about ±1px where needed. Icon buttons and play triangles need manual adjustment (V, K).
- Design empty, sparse, dense, error, and very long content states (V).
- Skeletons match the final layout exactly (V).
- Respect safe areas with `env()` insets. Test on mobile, laptop and ultra-wide (V).
- Prefer intrinsic layout (flex, grid) over measuring in JavaScript (V; [Every Layout](https://every-layout.dev/) [S]).

**Depth and shape**
- Concentric radii: outer radius = inner radius + padding (K, V).
- Shadows have at least two layers, come from one consistent light source, and are tinted by hue (V; [Josh Comeau](https://www.joshwcomeau.com/css/designing-shadows) [S]).
- Use shadows for elevation and borders for dividers and selected/focus states (K).
- Images get a 1px outline at 10% opacity: `oklch(0 0 0/.1)` in light mode, `oklch(1 0 0/.1)` in dark (K).
- Translucent materials: `backdrop-filter: blur(20px) saturate(180%)`, about 0.6 opacity, and a top highlight at about 0.4 opacity. Never stack translucent layers (EA).

**Motion** (all from E unless marked)
- Set the amount of animation by how often the user sees it:
  - 100+ times a day, or keyboard-triggered: no animation
  - Tens of times a day: minimal
  - Occasional (modals, drawers, toasts): standard animation
  - Rare (onboarding, celebrations): delight is allowed
- Durations:
  - Press: 100–160ms
  - Tooltips: 125–200ms
  - Dropdowns: 150–250ms
  - Modals and drawers: 200–500ms
  - Interface motion in general: under 300ms
- Easing:
  - Things entering or leaving use ease-out: `cubic-bezier(0.23,1,0.32,1)`
  - Things moving on screen use ease-in-out: `(0.77,0,0.175,1)`
  - Drawers: `(0.32,0.72,0,1)`
  - Never ease-in
  - Carbon's productive curve is an alternative: `(0.2,0,0.38,0.9)` [S]
- Press scale is 0.96–0.97, never below 0.95. Krehel says exactly 0.96; Emil allows 0.95–0.98 (K, E).
- Entrances start at `scale(0.95)` with opacity 0, never from `scale(0)`.
- Popovers grow from their trigger; modals grow from the center.
- Exits are smaller and faster than entrances (K, E).
- Stagger list items by 30–80ms, or about 100ms for rare entrances (E, K).
- Springs: bounce 0 by default (K). Apple-style springs use response 0.3–0.4 and damping 1.0 (EA).
- Animate only transform and opacity, never `transition: all` (V, K, E).
- Use CSS transitions for anything interruptible (K).
- Skip enter animations on first page load: `initial={false}` in Motion (K).
- Under prefers-reduced-motion, keep fades and remove movement (E, EA, V).
- Gate hover effects behind `@media (hover:hover) and (pointer:fine)` (E).

**Interaction and feedback**
- Hit areas: at least 24px, 44px on touch (V). Krehel uses 40px on dense desktop. Expand with a pseudo-element, and hit areas must not overlap (K).
- Focus uses `:focus-visible`. Sticky UI never covers the focused element (V). The GOV.UK pattern: 3px, yellow plus black (G).
- Spinners wait 150–300ms before appearing and stay at least 300–500ms. Loading buttons keep their label (V).
- Optimistic updates, then reconcile with the server; on failure, roll back or offer Undo (V).
- Destructive actions get a confirm or an Undo (V).
- Tooltips: the first in a group is delayed; neighbors open instantly (V, E).
- Never block paste. Don't pre-disable submit. On submit, focus the first error. ⌘/Ctrl+Enter submits a textarea (V).
- Navigation uses real `<a>` links so Cmd-click works. Restore scroll position on Back (V).
- Prefer keyboard shortcuts and a command palette (Superhuman, Raycast, Linear [S]).
- Switch relative timestamps to absolute dates after 7 days (EC).
- Pluralize with `Intl.PluralRules` (EC).

**Content and copy**
- Every screen offers a next step or a way to recover (V).
- Error messages say how to fix the problem (V).
- Label buttons specifically: "Save API Key", not "Continue" (V).
- Placeholders end with "…" and show an example (V).
- Use plain English; drop "now" from buttons (G [S]).

**Performance as feel**
- Interactions finish within 100ms, ideally under 50ms (Superhuman [S]). POST, PATCH and DELETE complete in under 500ms (V).
- Set explicit image dimensions, preload critical fonts, virtualize long lists (V).
- `touch-action: manipulation` removes the tap delay (V, EA).

**Accessibility**
- No zoom lock. Mobile inputs use at least 16px text (V).
- Prefer native semantics over ARIA. Include a skip link and a heading hierarchy (V).
- Toasts and inline validation use polite `aria-live` (V).
- Every gesture has a click or keyboard alternative (V).

## 3. Decisions for the picker (3–4 options each)

**Typography**
1. Typeface personality:
   - Neutral grotesk (Inter or Geist)
   - Humanist or custom-feeling (Cereal-like)
   - Serif-led editorial
   - Mono-accented technical
   - Warning: Inter-everywhere is the most-cited AI tell; see [impeccable](https://github.com/pbakaus/impeccable)
2. Heading treatment:
   - Tight and large (−0.02em, line-height 1.05)
   - Moderate
   - Same family as body, bold weight only
   - A separate display cut (Linear's Inter Display)
3. Base size and scale:
   - Dense, 13–14px (Polaris, Linear)
   - Standard, 16px
   - Generous, 19px (GOV.UK)
4. Number style:
   - Proportional
   - Tabular everywhere
   - Monospace for data

**Color**
1. Neutral temperature:
   - Pure grey
   - Cool, blue-tinted
   - Warm
   - Tinted by the brand hue
2. Accent strategy:
   - One accent
   - Accent plus semantic colors only
   - Multi-hue identity (Arc Spaces)
   - Near-monochrome (Vercel-like)
3. Default theme:
   - Light
   - Dark
   - Follow the system
   - User-themed from base, accent and contrast (Linear)
4. Contrast level:
   - Standard (APCA Lc 60/90)
   - High
   - A user toggle

**Layout and spacing**
1. Density:
   - Compact (4px rhythm, 32px rows)
   - Comfortable
   - Spacious (start with too much white space)
2. Navigation:
   - Left sidebar
   - Top bar
   - Command-palette-first
   - Single-column flow (GOV.UK)
3. Content width:
   - 65ch reading width
   - 960px fixed (GOV.UK)
   - Full-bleed app
4. Page structure:
   - Cards
   - Flat sections separated by dividers
   - List or table first
   - Warning: identical rounded cards everywhere is a flagged AI tell; see [Anthropic's frontend-design skill](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)

**Depth and shape**
1. Radius:
   - Sharp, 0–2px
   - Subtle, 4–6px
   - Soft, 8–12px
   - Pill
   - Concentric rule applied automatically whichever is picked
2. Elevation language:
   - Borders only
   - Layered tinted shadows
   - Translucent material
   - Flat with color fills
3. Border weight:
   - Hairline at low opacity
   - 1px solid
   - Bold 2px (GOV.UK forms)

**Motion**
1. Motion budget:
   - None or instant
   - Productive (fast, functional)
   - Expressive (Carbon expressive, Family-style delight)
2. Curve character:
   - Strong ease-out
   - Critically damped spring
   - Spring with a light bounce (0.1–0.2)
3. Signature moment (choose one):
   - Morphing toasts
   - Shared-element transitions
   - Number roll-up
   - None

**Interaction and feedback**
1. Input priority:
   - Mouse-first
   - Keyboard-first with a ⌘K palette
   - Touch-first
2. Mutation style:
   - Confirm dialogs
   - Optimistic updates plus Undo
   - Inline edit-in-place
3. Loading style:
   - Skeletons
   - Delayed spinner
   - Progressive streaming
4. Focus style:
   - Accent ring
   - High-visibility yellow/black (GOV.UK)
   - Offset outline

**Copy**
1. Voice:
   - Plain and instructional (GOV.UK)
   - Crisp technical (Vercel)
   - Warm and playful
2. Capitalization:
   - Sentence case
   - Title Case for headings and buttons (Vercel's app rule)
3. Error tone:
   - Neutral and directive
   - Apologetic and helpful

## 4. "Invisible details" to inject into every prompt automatically

These should be written into the prompt rather than offered as choices:
- **Typography details:** tabular-nums on changing numbers; text-wrap balance on headings and pretty on body; the "…" character and curly quotes; `&nbsp;` before units.
- **Shape and depth:** concentric radii; the 10% image outline; never `transition: all`.
- **Motion rules:**
  - Animate only transform and opacity, and keep it interruptible.
  - Skip enter animations on first load and on keyboard-triggered actions.
  - Popovers grow from their trigger; never animate from `scale(0)`.
  - Press scale 0.96–0.97; ease-out by default, never ease-in.
  - Honor prefers-reduced-motion; put hover effects behind `(hover:hover)`.
- **Hit areas and focus:** 24px minimum hit area, 44px on touch, expanded with pseudo-elements; `:focus-visible` rings.
- **Loading and mutations:** spinner show-delay and minimum time; loading buttons keep their labels; optimistic updates with rollback.
- **Forms:**
  - Never block paste or pre-disable submit; focus the first error on submit.
  - Correct `autocomplete`, `type` and `inputmode`; spellcheck off for emails and codes; 16px or larger inputs on mobile.
  - Warn before navigating away from unsaved data.
- **State and navigation:** deep-linkable state in the URL; real links so Cmd-click works; scroll restoration on Back.
- **Platform details:** `touch-action: manipulation`; `color-scheme` and `theme-color`; explicit image sizes; `overscroll-behavior` in modals.
- **Content details:** relative dates switch to absolute after 7 days; `Intl.PluralRules`; one icon library with matched stroke weight (1.5px beside 400-weight text, 2px beside 600) (K).
- **Anti-tells:** avoid each of the [14 Krebs patterns](https://github.com/AdrianKrebs/ai-design-checker): purple, decorative gradients, glassmorphism, colored glow, emoji nav, centered hero plus Inter, permanent dark mode, numbered steps, stat banner, headline badge, FAQ accordion, templated display fonts, hero font mix, accent stripe. Also avoid the identical soft `rgba(0,0,0,.1)` card shadow and fade-and-slide-up on every section (Anthropic skill).

## 5. Caveats

- **Evidence vs. opinion.** Almost all of this is practitioner opinion, not tested evidence. The exceptions:
  - The WCAG and APCA contrast thresholds.
  - Hit-target minimums (WCAG 2.5.8 is 24px; Apple's 44pt).
  - The 100ms perceived-instant threshold. Superhuman itself notes newer research questions whether that is enough.
  - The Krebs Show HN analysis, which is the only quantitative look at AI-generated design. His blog reports 22% of 1,590 sites in the High tier (4+ patterns), but his checker's README says High means 5 or more. Secondary reports claim 67%. His false-positive rate is 5–10% [S] ([blog](https://adriankrebs.ch/blog/design-slop/)).
- **Where the exemplars disagree:**
  - Press scale: exactly 0.96 (Krehel) vs. 0.95–0.98 (Emil).
  - Desktop hit area: 24px (Vercel) vs. 40px (Krehel).
  - Capitalization: Vercel uses Title Case in the app and sentence case on marketing pages; GOV.UK uses sentence case.
  - Springs: Krehel says bounce must be 0; Emil allows 0.1–0.3 for playful moments.
  - Density: Polaris, Linear and Superhuman go dense; GOV.UK and Refactoring UI go generous.
  - Panels: Figma's floating rounded panels were partly reversed after user pushback.
  - Theming: Linear lets users build themes; Notion deliberately limits choice to three fonts.
  - Contrast: Vercel and Radix prefer APCA, while legal compliance still means WCAG 2.
- **Things your picker should not reproduce blindly.**
  - The anti-slop lists flag "tasteful" defaults too. Cream page plus serif plus terracotta, and near-black plus one acid accent, are named as new clichés. So any preset becomes a tell if everyone picks it, and the picker should push for variety.
  - Several popular "DESIGN.md" reconstructions of Linear, Raycast, Vercel and Airbnb are unofficial. Their hex values and radii should not be presented as the companies' own.
