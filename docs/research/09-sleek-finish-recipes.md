# Sleek finish recipes: what the source code shows

> Research record, 2026-11-13. A research agent wrote this report. Each claim comes from a source file read on that date unless the text says otherwise. Data file: `docs/research/data/sleek-recipes.json`.

## What this record contains

The data file holds 100 recipes. A recipe is one visual detail written as plain CSS that needs no framework. Each recipe carries its markup, its source, where it reads as premium, where it reads as a cliché, and its pitfalls.

| Category | Count | Category | Count |
|---|---|---|---|
| Borders | 10 | Display type | 9 |
| Shadows | 7 | Layout | 11 |
| Buttons | 11 | Motion | 13 |
| Surfaces | 9 | Micro-details | 10 |
| Atmosphere (backgrounds) | 9 | Components | 11 |

**Method.** The agent read 32 sources: component code and stylesheets as raw GitHub files and as npm packages. It rewrote Tailwind class strings and design-token references as CSS with exact values. Each recipe declares its colours as custom properties (named values that a theme can override) and uses the CSS `light-dark()` function, so one block covers light and dark mode.

**Checks.** Two CSS parsers read every recipe. Chrome 153 tested every declaration and selector with `CSS.supports()`, rendered every recipe in light and dark, and ran interaction tests on tabs, the segmented control, tooltip, dialog, sheet, popover, FAQ, toasts, scroll effects and focus rings. No recipe ran in Firefox or Safari. Browser version numbers come from MDN's browser-compat-data.

**Labels.** 88 recipes are "adapted": values or structure come from a source. 12 are "written-from-technique": new CSS for an idea seen in a source. None is a verbatim copy, because each was rewritten around `light-dark()`.

## The 15 details with the most effect

The ranking weighs how many sources apply the detail and how visible the result is.

1. **Edges are translucent, not grey.** coss ui (the Cal.com design system) draws borders with black at 8% in light mode and white at 6% in dark mode. Radix Themes also draws edges in translucent grey, and Vercel's Web Interface Guidelines recommend it. One edge colour then works on every background.
2. **Shadows are stacks with a ring.** Radix Themes uses three to five layers per level: a 1px ring, a tight contact shadow and a wide ambient shadow, all offset straight down. Supabase stacks six weak layers plus a ring. One large soft shadow appears only under floating panels such as the cmdk command menu, never under resting cards.
3. **Dark mode has its own rules.** Surfaces get lighter as they rise: coss mixes 2% and 4% white into the page colour. Shadows get about five times stronger (Supabase multiplies by 5) or give way to light rings, inner highlights and, on hover, a faint glow (Radix).
4. **Light comes from above, everywhere.** Solid buttons carry a 1px highlight inside the top edge (white at 16%). Light cards get a slightly darker bottom edge; dark cards get a lighter top edge. coss applies the same edge to buttons, cards, inputs, dialogs and tooltips.
5. **Letter-spacing and line-height change with size.** Resend's React Email site sets 68px headlines at -0.05em with a 64px line-height, 35px text at -0.025em and 28px text at about -0.015em. Radix adds +0.0025em at 12px.
6. **Every control has a complete, fast set of states.** Hover sits inside `@media (hover: hover)`. Press scales to 0.96 or 0.97. Focus shows only for keyboard use. Disabled turns neutral grey. Loading keeps the label. Changes take 100 to 200ms.
7. **One focus ring system.** A 2px ring in three placements: offset for buttons and links, inset for rows and tabs, border colour plus a 3px halo for text fields.
8. **Corner radii are concentric.** Outer radius equals inner radius plus the gap. Inside a 1px border, the inner layer uses the radius minus 1px.
9. **Motion is short, small and asymmetric.** Popovers, menus and dialogs enter in 140 to 300ms on `cubic-bezier(0.16, 1, 0.3, 1)`; Radix, ray.so, Supabase and Precedent all use that curve. Radix exits in 100ms. Elements move 4 to 12px and start at 97% scale, never at zero.
10. **Text is finished at the root.** Headings wrap into even lines, paragraphs avoid a lone last word, changing numbers use equal-width digits, and font features are chosen once.
11. **Targets are larger than they look.** Invisible pseudo-elements grow hit areas on touch screens: to 44px in coss, Vaul and Once UI, and by 8px per side in shadcn/ui.
12. **Glass is rare and has a fallback.** Blur, saturation, a translucent tint and a bright top edge appear only on floating chrome such as toolbars. A solid version covers browsers and people that do not want blur.
13. **Backgrounds stay quiet.** Grids and dots sit at low strength (black at 5% on tailwindcss.com, 10% on Dub, 20% opacity on the cmdk site) and fade out under a mask. Glows are neutral or stay in one hue family at 10% to 20% (cmdk, ray.so). Grain stays faint: Magic UI's noise works out to about 5% to 7%.
14. **Spacing has clearly different magnitudes.** Taxonomy uses 16px inside a heading block, 24px from heading block to content, and 96px of padding above and below each section at desktop width (128px for the hero).
15. **Small finishing rules add up.** A 10% outline on images, a tinted text selection, scrollbars and native controls that follow the colour scheme, link underlines with a tuned offset, and icons nudged 1 to 2px for optical balance.

## Recurring patterns in the code

- **One translucent ink.** `color-mix()` or an alpha colour replaces many fixed greys.
- **Pseudo-elements as extra layers.** `::before` and `::after` draw edge shading, hit areas and sliding indicators.
- **Equal layer counts.** Shadow lists keep the same number of layers in every state so transitions interpolate; a Radix source comment states this rule.
- **`background-clip: padding-box`** under translucent borders, so the edge mixes with the page and not with the fill.
- **Feature gates.** `@supports` guards scroll timelines, anchor positioning and text-box trimming. Media queries guard hover, coarse pointers, reduced motion, reduced transparency and forced colours.
- **Motion tokens.** Three to five easing curves and five to seven durations, reused everywhere.
- **Native elements do the work.** The dialog, popover, FAQ and segmented control recipes run without script in Chrome 153.

## Premium versus cliché

| Technique | Reads premium | Reads cliché |
|---|---|---|
| Gradient border | Near-neutral, top-lit, on one card | Rainbow or purple-to-pink on every card |
| Glow | One primary button, narrower than the button, on a neutral page | Every button and card, pulsing, on a purple page |
| Glass | Floating toolbar over content that scrolls | Body text on glass over a gradient |
| Dot or line grid | One hero, low contrast, faded by a mask | Edge to edge behind every section, with a glow on top |
| Aurora gradient | Three neighbouring hues, equal lightness, 20% strength, static | Far-apart hues, full strength, animated |
| Gradient text | Text colour fading to 70% of itself, on one large heading | Purple-to-orange on every heading, sliding |
| Feature icons | Neutral 36px tiles, one stroke weight, concrete titles | Pastel gradient circles above "Fast", "Secure", "Scalable" |
| Bento grid | Rows that fill exactly, real product crops | Random spans with a blob in each tile |
| Hover lift | 2px, links only, mouse only | 8px with scale 1.05 on static cards |
| Entrance animation | Once, on a hero, three chunks 80ms apart | Every section on every scroll |
| Marquee | Slow, real logos, pauses on hover and focus | Fast rows of invented logos |
| Border beam and text shimmer | Marks one task in progress and stops with it | Loops forever to look "AI" |

## What could not be read or verified

- **joshwcomeau.com** did not resolve in the sandbox. No snippet from that site was read.
- **Not read:** una/css demos, web.dev articles, saas-ui, ibelick/ui, and Vercel templates other than Commerce.
- **Font features:** only Inter's feature list was confirmed, from its documentation page. The Geist README lists no stylistic sets. No Manrope README was found at the paths tried; the only Manrope fact is a Supabase source comment about its default ligatures.
- **Optical-size axes** were checked in Google Fonts metadata for 15 families. A self-hosted build can differ.
- **Supabase:** only the root licence file was checked, not sub-folder licence files.
- **Licence pages:** two licence statements rest on a summarising fetch of a GitHub page (GUI Challenges, also confirmed by its LICENSE text; background-snippets, also confirmed by missing licence files).
- **Browsers:** Chrome 153 only. Firefox and Safari behaviour comes from compat data, not from a test run. The data lists Firefox 159 as the first version with scroll-driven animations; whether that version has reached users was not checked.
- **Source behaviour:** the agent ran no source component. Each recipe is a CSS rewrite. Where a source drives motion from script, the recipe uses a CSS equivalent and says so in "pitfalls".
- **Contrast:** no recipe was measured for colour contrast. Each "pitfalls" field names the places a person must check.
- **Script:** the mouse-following spotlight, tab selection, icon swap, toasts and command palette need script for their state changes. The CSS covers the look and the transitions.
- **Pricing grid:** no source shipped a three-card pricing grid. That recipe is new; only its type and list values come from Taxonomy.

## Licence notes

- **Copy with notice (27 sources).** MIT: Radix Themes, shadcn/ui, coss ui (origin-space/originui), Magic UI, Cult UI, Motion Primitives, cmdk, Sonner, Vaul, the Emil Kowalski and Jakub Krehel skills, Vercel Web Interface Guidelines, Open Props, ray.so, React Email, HeroUI, Once UI, Mantine, Precedent, Taxonomy, Vercel Commerce, Tailwind CSS. Apache-2.0: Supabase, Tremor, GUI Challenges. CC0: MDN code samples and browser-compat-data. MIT asks that the copyright and permission notice stay with copied portions. Apache-2.0 also asks for a copy of the licence and a note on changed files. This is a reading of the licence texts, not legal advice.
- **Learn from only (5 sources).** Dub is AGPL-3.0. tailwindcss.com states it is not open source. bg.ibelick background-snippets has no licence file. For these three the data file takes the idea and no code. Inter's documentation and Google Fonts metadata supplied facts only.
- **Skipped.** cosscom/coss is AGPL-3.0. The MIT repository origin-space/originui supplied the coss ui files instead.
- **Extra key.** The data file adds a top-level `conventions` object to the requested shape. It explains theming, token names and how each value was checked.
