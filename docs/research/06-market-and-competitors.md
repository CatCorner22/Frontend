# Competitors and market (recorded for context; the tool is for personal use)

> Research record, 2026-11-13. A research agent wrote this report; the main session reviewed it. Claims marked [S] were seen only as search snippets. Treat every figure as unverified until re-checked against a primary source.

Nearly every claim below comes from search-result snippets and third-party aggregators. My one page fetch failed: createwith.com doesn't resolve from this sandbox. I couldn't read primary pages, so treat star counts, prices and revenue figures as approximate. Claims I could only see in snippets are tagged [S].

## 1. Competitors (late 2026)

**Platform-native features. These are the biggest threat.**
- **Lovable Aesthetics** (launched May 11, 2026, all users): you state your typography, layout and color preferences, then preview several design concepts before any code is written. A later post (Aug 2026) says output now reflects those choices instead of a generic look. It is conversational, not one variable at a time, but it targets the same pain inside the tool your users already pay for. [S] https://x.com/Lovable/status/2053874566460752191 , https://www.createwith.com/tool/loveable/updates/lovable-launches-aesthetics-to-give-users-more-control-over-design-output
- **Lovable Themes and Design Systems.** Themes let you set colors, fonts, spacing and radius at no credit cost. Design Systems, now on every paid plan, can be pulled from brand guidelines, screenshots or Figma. [S] https://www.createwith.com/tool/lovable/updates/lovable-design-systems-bring-brand-consistency-to-every-paid-plan
- **v0.** Design Mode edits the UI visually. In March 2026 v0 started picking the design system automatically, and Design Systems 2.0 (June 30, 2026) imports tokens and themes. Vercel's docs point users to tweakcn for themes. [S] https://community.vercel.com/t/design-mode-changes-where-do-i-select-the-design-system/36398 , https://www.producthunt.com/p/v0/introducing-design-systems-in-v0
- **Bolt.** Design System Agents read your component libraries. Adding a custom system needs the Team plan; pre-loaded systems (shadcn, MUI and others) are free. [S] https://bolt.new/blog/introducing-design-system-agents , https://support.bolt.new/building/design-system/introduction
- **Google Stitch.** The March 18, 2026 "vibe design" update added an AI canvas, a design agent, extracting a design system from any URL, DESIGN.md import/export, and an MCP server/SDK. It is free, with daily credits. Google open-sourced the DESIGN.md spec around April 21, 2026. Its CLI checks files, checks WCAG contrast, and exports Tailwind and DTCG tokens. That makes your export format a free commodity. [S] https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/ , https://hermes-agent.nousresearch.com/docs/user-guide/skills/optional/creative/creative-design-md , https://www.banani.co/blog/google-stitch-pricing-and-credits
- **Claude Design** (Anthropic Labs, Apr 17, 2026, included with Pro/Max/Team/Enterprise): builds design systems and prototypes and exports HTML. [S] https://www.anthropic.com/news/claude-design-anthropic-labs
- **Figma Make** applies styles from your Figma library. It is aimed at Figma users, not non-technical builders. [S] https://help.figma.com/hc/en-us/articles/33024539096471

**Free open-source "anti-slop" tools. This is where your export competes.**
- **Anthropic's frontend-design skill** is official and free. https://claudelog.com/faqs/what-is-frontend-design-skill-in-claude-code/ [S]
- **Impeccable** (Paul Bakaus): roughly 37k–90k GitHub stars depending on the snapshot. [S] https://emelia.io/hub/impeccable-ai-design-skill
- **UI UX Pro Max**: about 127k stars (Sep 2026 snapshot). [S] https://ossinsight.io/analyze/nextlevelbuilder/ui-ux-pro-max-skill
- **awesome-design-md / getdesign.md** (VoltAgent): about 102k stars. It's a library of 73 DESIGN.md files based on brand sites, installed with one command. [S] https://blog.brightcoding.dev/2026/09/16/voltagentawesome-design-md-designmd-files-for-ai-ui-generation
- Others: unslop-ui and Refero's skill (about 5.4k installs). [S] https://skills.sh/referodesign

**Visual pickers and exporters. These are the closest to your idea.**
- **tweakcn**: a free, open-source shadcn theme editor (about 3.6k stars). It placed #6 on Product Hunt in Sep 2025 with 238 upvotes. Its creator has 5 GitHub sponsors. Third-party sites list a Pro tier at either $8 or $15/month, and the two figures conflict. This is a sign that a well-loved theme picker barely makes money. [S] https://sponsors.ecosyste.ms/accounts/jnsahaj , https://www.hunted.space/product/tweakcn-3/launches/tweakcn
- **Realtime Colors**: live colors and fonts on a sample site. No revenue disclosed; its visible money comes from site ads. [S] https://www.realtimecolors.com/docs/about-realtime-colors
- **DESIGN.md generators**: design.dev (visual editor, live preview, WCAG checks, exports to Tailwind v4, CSS variables and DTCG), uicolors.app/tokens, Glammer, Logofai, Masumi, PikSpec, designmd.cc ("7,665 generated"). Most are free. [S] https://design.dev/ai/design-md-generator/ , https://uicolors.app/tokens , https://designmd.cc/
- **Style galleries with copy-paste prompts**: uistyleguide.com (67 styles with live demos and prompts), viberdy.dev ("Pick a style," pasted into Lovable, Bolt or v0), skillsui.app, GlowUp UI (variants built to paste into Lovable or Cursor), 5sdesign (paid kit). [S] https://www.uistyleguide.com/ , https://viberdy.dev/ , https://glowupui.io/
- **TypeUI**: design skills and design systems. Pro is $30/month or $120/year, and it has run an AppSumo lifetime deal. This is the closest paid comparison I found. [S] https://makerstack.co/reviews/typeui-review/ , https://appsumo.com/products/typeui-creative/
- **Canvas generators**: Magic Patterns ($1M ARR bootstrapped, then a $6M Series A in Nov 2025; plans about $20–100/month), MagicPath ($6.6M raised, about $29/month), Superdesign (open source; generates parallel variations), Aura.build, UX Pilot, Uizard. They generate whole screens rather than guide you through decisions. [S] https://www.magicpatterns.com/blog/series-a-and-magic-patterns-2-0 , https://www.caplight.com/company/magicpath , https://github.com/superdesigndev/superdesign

**Is anyone already doing a one-variable-at-a-time picker that exports a prompt?** I found no exact match. Searches for a step-by-step "design wizard" or "style quiz" for AI builders returned nothing. The closest pieces:
- design.dev, for a visual editor with accessibility checks that exports DESIGN.md
- uistyleguide.com and viberdy.dev, for picking a style and getting a prompt
- Lovable Aesthetics, for previewing concepts before building
- Realtime Colors and tweakcn, for live-rendered choices

Your distinct combination is guided sequencing, previews with the user's own content, and enforced accessibility minimums. Each of those is easy to copy.

## 2. Platform risk

The evidence points strongly toward the platforms absorbing this:
- Lovable shipped Aesthetics and expanded Design Systems in 2026.
- v0 now infers the design system automatically.
- Stitch is free and exports DESIGN.md.
- Claude Design comes bundled with Claude subscriptions.
- The models themselves are being tuned against generic output. SaaStr's headline: "Gemini 3 solves one of the biggest headaches with vibe coding." [S] https://www.saastr.com/gemini-3-solves-one-of-the-biggest-headaches-with-vibe-coding-now-your-site-doesnt-have-to-look-like-it-was-vibe-coded/

Evidence the other way:
- The built-in features are conversational, one per tool, and don't carry across tools.
- No platform has a strong reason to export a brief you can take to a competitor.
- Accessibility enforcement isn't promoted anywhere.

That gap is real but thin. Assume each platform's features get better every quarter.

## 3. Demand evidence

**The complaint is real and widespread.**
- Adrian Krebs's April 2026 analysis found Show HN submissions had tripled and mostly shared the same "vibe-coded" look. The parody site vibe-coded.lol reached the HN front page. [S] https://www.gigazine.net/gsc_news/en/20260423-design-slop , https://news.ycombinator.com/item?id=49290499
- Many articles list the same tells: purple gradients, Inter, glow effects. [S] https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui
- A 2025 r/lovable post said users' Lovable and Bolt projects looked alike. [S] https://redlib.hackliberty.org/r/lovable/comments/1kp1kqg/biutiful_styles_made_a_small_website_to_help
- One writer warns the fixes just create a new default look: cream, serif, sage. [S] https://capitalandcompute.net/blog/fix-ai-slop-design/

**Willingness to pay is weak for tools like yours.** The most popular fixes are free and get 100k-plus stars. tweakcn has 5 sponsors. Tailwind Labs reportedly lost about 80% of revenue and laid off 75% of its engineers in January 2026, even though Tailwind itself is more popular than ever, because AI cut the docs traffic that turned free users into $299 buyers. [S] https://www.devclass.com/ai-ml/2026/01/08/tailwind-labs-lays-off-75-percent-of-its-engineers-thanks-to-brutal-impact-of-ai/4079571

CodedThemes, a template business, says its revenue is about $12k/month but some months fell as much as 50% because of AI. [S] https://www.indiehackers.com/post/tech/turning-an-agency-into-a-12k-mo-product-portfolio-13QkMY561jAQxsiA0LSg

**Positive comparison cases:**
- Sleek.design, AI mobile app design for founders, reportedly hit $10k MRR in 6–8 weeks with no ad spend. Founders posted daily on X and Reddit and kept a narrow target customer. Note that it generates designs; it isn't a picker. [S] https://www.indiehackers.com/post/tech/hitting-10k-mrr-in-six-weeks-with-an-ai-design-tool-pEvmU5qkWS6ny0AR9SUv
- Magic Patterns reached $1M ARR before raising. [S] link above

**Price points.** Subscriptions around $8–30/month (TypeUI, tweakcn Pro), lifetime deals (TypeUI on AppSumo, Tailwind Plus at $299), prompt packs around $13 on Gumroad with no sales shown. [S] https://uncai.gumroad.com/l/200-prompts-for-no-code-app-builders

The median active indie hacker makes under $1k/month. [S] https://www.idlen.io/blog/indie-hacker-ai-profitable-projects-no-funding/

**Market size** (company claims):
- Lovable: about $400–500M ARR in mid-2026, roughly 8M users (late-2025 figure), $13.3B valuation. https://startupfortune.com/lovables-500-million-run-rate-makes-vibe-coding-harder-to-dismiss/ [S]
- Replit: about $525M annualized by April 2026, 50M+ users. https://sacra.com/research/replit-passes-500m-year/ [S]
- Bolt: about $40M ARR, an early-2025 estimate. [S]

The audience is huge. The share of it that would pay for a separate design step is unknown and probably small.

## 4. Distribution that has worked

- **X and Reddit, daily and building in public:** this is how Sleek did it. [S]
- **Product Hunt:** tweakcn placed #6 with 238 upvotes. Most similar launches get under 60 upvotes, and DESIGN.md Inspector got 3. One launch alone won't do it. [S] https://hunted.space/product/design-md-inspector
- **GitHub, skill directories and MCP:** this is by far the biggest channel. skills.sh, claudemarketplaces.com and the Claude plugin marketplaces brought 100k-star results, but for free tools. Use it to collect emails, not as a revenue source.
- **Lovable template marketplaces** (third-party, up to 90% revenue share) and Lovable reportedly commissioning templates. Not verified. [S] https://the-marketplace.lovable.app/blog/marketing-your-lovable-app
- **Getting tweakcn-style links** in v0 or Lovable docs. v0's legacy docs link tweakcn. [S]
- **YouTube creators covering Lovable or Cursor:** I found no data on this.

## 5. Fastest paths to first revenue (my estimates)

1. **Free picker, paid "pro export"** at $9–19 one-time or $8–15/month. tweakcn suggests low conversion. Realistic in 3–6 months: $0–1.5k/month unless something goes viral.
2. **Curated "direction packs"** of 20–50 distinct, accessibility-checked directions, each with DESIGN.md, tokens and a mockup, priced $29–79. The free awesome-design-md has 73 brand files, so you'd need clearly better taste or specific niches. Estimate: a few hundred to $2k a month at launch, falling after.
3. **Done-for-you design briefs** for small businesses and vibe coders at $49–300 each, with your tool as the delivery engine. This is the fastest real cash, because it sells your time and taste rather than software. Possibly $1–5k/month if you can generate leads on Reddit, X or local small-business channels. It doesn't scale.
4. **Agency/freelancer tier** with client-facing links where clients choose options ($29–49/month). It fits the one-step-at-a-time format best, since clients approve each decision. Selling to agencies is slower.
5. **AppSumo-style lifetime deal:** quick cash ($5–20k is plausible) but it attracts low-value users and leaves you supporting them indefinitely.

**Main ways these tools fail:**
- The format is a free open standard.
- The platforms build the feature in.
- Free open-source skills are good enough.
- People use it once and leave: you need a design once per project.
- AI answers cut search traffic (the Tailwind pattern).
- Trying to serve every audience at once (Sleek's founder said this sank his earlier products).

## 6. Blunt assessment

**Strongest differentiators:**
- Comparing side by side with your own content, one decision at a time. This is a learning and confidence experience; generators that spit out whole pages don't offer it.
- Contrast and accessibility minimums enforced automatically.
- Output that works in every tool rather than one platform.
- A client-approval flow for freelancers.
- Taste: well-curated directions that avoid even the new cream-and-serif default.

**Weakest points:**
- The export format is free and standardized.
- Lovable Aesthetics already does "preview concepts first" where your users already pay.
- Stitch and Claude Design are free or bundled.
- Usage is once per project.
- Non-technical users may not know they need a "design step" until a platform shows them one.
- Copying your interface is cheap.

**What would have to be true for meaningful income in 3–6 months:**
- A narrow, reachable target customer (for example, freelancers building small-business sites with Lovable, or one industry).
- An audience you build daily on X or Reddit from week one.
- A paid offer that includes taste or service (packs or done-for-you briefs), not just the picker.
- Visible before/after proof that your export beats Aesthetics or Impeccable.

Even then, a realistic range is $500–3k/month by month six. The most likely outcome for the picker alone is under $500/month. If you have no other income, start the service track (#3) immediately, treat the free picker as marketing, and set a hard checkpoint: for example, 20 paying customers by day 60, or change direction.

**Legal basics** (not legal advice):
- **Product name:** search USPTO trademarks and common-law use before committing to a name. Avoid names built on Lovable, Claude, v0 or Stitch, and say "works with X" rather than implying partnership. My searches didn't cover this.
- **No-account static app:** you still need Terms covering the disclaimer, limitation of liability, and governing law. You need a Privacy Policy if you collect any analytics, cookies, email addresses or payment data. A payment processor such as Stripe, or a merchant-of-record service like Paddle or Lemon Squeezy, handles sales tax. Process user content in the browser where possible, and say so.
- **Fonts:** Google Fonts are OFL or Apache. You may use and bundle them but not sell them on their own, and modified fonts must be renamed. Export font names and links rather than selling font files, and include license notes. [S] https://fonts.google.com/knowledge/glossary/licensing , https://fossa.com/blog/open-source-licenses-101-sil-open-font-license-ofl
- **Icons:** Lucide is ISC and Heroicons is MIT, which require keeping the license notice; Font Awesome Pro needs a paid license. Check each set before bundling it. These license details are from my general knowledge, not from searches.
- **Brand-derived styles:** avoid selling packs that copy real brands' identities, such as "Stripe style."
- **Accessibility claims:** don't claim "WCAG compliant" or "ADA compliant." The FTC fined accessiBe $1M and barred unsupported claims that an automated tool makes sites WCAG-compliant. Say "checks color contrast against WCAG 2.2 AA thresholds" and note that a full audit is still needed. https://www.dataprivacyandsecurityinsider.com/2025/04/ftc-settles-with-accessibe-for-misleading-statements-about-wcag-compliance/ [S]
