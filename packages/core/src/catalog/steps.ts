// The Catalog for Template 1, Stages 2 (Structure) and 3 (Feel).
// Each Step changes one variable. Each Option says what it is, when to choose it, and its risk.
//
// Honesty rules for this file (hard rules 5 and 13):
// - Every source says how the project knows it: read, abstract, snippet, owner-file, or builder (see types.ts).
// - An Option names an exemplar only when a record in this repository supports the statement.
// - No ranking ("the most common …") appears unless a record gives a count.

import type { SourceRef, Step } from './types.js';

const REVIEWED = '2026-11-13';

// Records that document a reading. Each path exists in this repository; a unit test checks that.
const R01 = 'docs/research/01-your-files-master-guide-blueprint-guardrails.md';
const R02 = 'docs/research/02-your-files-pdfs-and-documents.md';
const R03 = 'docs/research/03-your-files-zip-archives.md';
const R04 = 'docs/research/04-best-human-built-frontends.md';
const R08 = 'docs/research/08-high-end-codebases.md';
const R09 = 'docs/research/09-sleek-finish-recipes.md';
const TOKENS = 'docs/research/data/exemplar-tokens.json';
const KB1 = 'docs/knowledge/kb-perception-cognition.json';

const read = (text: string, record: string): SourceRef => ({ text, basis: 'read', record });
const abstract = (text: string, record: string): SourceRef => ({ text, basis: 'abstract', record });
const snippet = (text: string, record: string): SourceRef => ({ text, basis: 'snippet', record });
const ownerFile = (text: string, record: string): SourceRef => ({ text, basis: 'owner-file', record });
const builder = (text: string): SourceRef => ({ text, basis: 'builder' });

/** Published lists of signs of AI-default design. Record 04 documents what each list names. */
const KREBS = 'Adrian Krebs’s ai-design-checker (a published list of 14 patterns)';
const OWNER_ANTI_SLOP = 'your Anti-Slop Checklist (your own source assessment grades it D as evidence)';

export const STEPS: Step[] = [
  // ───────────── Stage 2: Structure ─────────────
  {
    id: 'nav',
    name: 'Navigation',
    stage: 'structure',
    title: 'How do visitors move around the site?',
    teach:
      'Navigation is the set of links that appears on every page. Visitors look for it where other sites put it, so the familiar place is the easy place. Every Option here keeps the links in view: one usability study found that people used a hidden menu about half as often as visible links.',
    variable: 'Navigation pattern',
    owns: ['nav'],
    focus: 'top',
    defaultOptionId: 'top-inline',
    sources: [
      snippet('Nielsen Norman Group (Pernice and Budiu, 2016), a usability study of hidden and visible navigation. The knowledge base records it from a search snippet; nobody read the study itself.', KB1),
      ownerFile('Your report "Intuitive Design and the Option Space" gives the same figures (27% against 48% use). Your own source assessment grades that report C.', R02),
      builder('Which arrangement counts as familiar is the builder’s judgment; no count of sites was consulted.'),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
    options: [
      { id: 'top-inline', label: 'Name left, links right', what: 'One row: the business name on the left, the links on the right.', chooseWhen: 'Almost always. It is the familiar arrangement for a small site.', risk: 'More than six links will wrap.', patch: { nav: 'top-inline' } },
      { id: 'top-centered', label: 'Centered masthead', what: 'The name sits centered on its own line, like the masthead of a newspaper, with the links centered beneath it.', chooseWhen: 'The name itself is the brand, as on a restaurant, studio, or publication.', risk: 'Uses more height before the content starts.', patch: { nav: 'top-centered' } },
      { id: 'split-cta', label: 'Links centered, button right', what: 'Name left, links in the middle, phone number and a solid action button on the right.', chooseWhen: 'One action (book, call, buy) matters more than everything else.', risk: 'The button competes with the page’s own main button.', patch: { nav: 'split-cta' } },
      { id: 'side-rail', label: 'Side rail', what: 'A fixed column on the left holds the name and the links; content scrolls beside it.', chooseWhen: 'The site behaves like a tool or a portfolio, or has many sections.', risk: 'Takes width from the content; unusual for a brochure site.', patch: { nav: 'side-rail' } },
    ],
  },
  {
    id: 'hero',
    name: 'First screen',
    stage: 'structure',
    title: 'How does the first screen open?',
    teach:
      'The "hero" is the first screenful. It answers three questions in a few seconds: what is this, is it for me, and what do I do next. The arrangement decides which of those the eye meets first.',
    variable: 'Arrangement of the first screen',
    owns: ['hero'],
    focus: 'top',
    defaultOptionId: 'text-left',
    sources: [
      ownerFile('Your Training Manual, layout archetypes. Your own source assessment grades it D ("onboarding only").', R02),
      read(`${KREBS} names "centered hero plus Inter"; ${OWNER_ANTI_SLOP} names "centered hero + three identical icon cards".`, R04),
      builder('The "three questions" framing is the builder’s summary; no source was consulted for it.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'text-left', label: 'Headline left', what: 'Headline, short paragraph, and buttons, aligned to the left edge.', chooseWhen: 'The page has more than a few words, and you want them read in order.', risk: 'Plain, unless the type carries it.', patch: { hero: 'text-left' } },
      {
        id: 'centered', label: 'Centered', what: 'Everything centered on the page.', chooseWhen: 'The message is very short.', risk: 'A centered opening above feature cards is a listed sign of AI-default design.',
        warn: { text: 'The centered opening is a listed sign of AI-default design. If you choose it, pair it with a distinctive typeface or a signature element. "Headline left" and "Statement" avoid the pattern.', source: read(`${KREBS}, pattern "centered hero plus Inter"; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { hero: 'centered' },
      },
      { id: 'split-media', label: 'Text and photo side by side', what: 'Text on the left, a large photograph on the right.', chooseWhen: 'You have a real, good photograph of the place, the people, or the work.', risk: 'Needs a real photograph. A stock photograph is easy to spot.', patch: { hero: 'split-media' } },
      { id: 'statement', label: 'Statement', what: 'A very large headline across the full width, with the paragraph and buttons in a row beneath a rule.', chooseWhen: 'The headline is strong and short, and you want an editorial, confident feel.', risk: 'A weak or long headline has nowhere to hide.', patch: { hero: 'statement' } },
    ],
  },
  {
    id: 'sections',
    name: 'Repeated items',
    stage: 'structure',
    title: 'How does the list of services read?',
    teach:
      'Repeated items (services, features, products) need a pattern. The pattern tells visitors whether to compare the items, read them in order, or scan for one.',
    variable: 'Layout of repeated items',
    owns: ['sections'],
    focus: 'services',
    defaultOptionId: 'stacked',
    sources: [
      ownerFile('Your Training Manual, layout archetypes (graded D by your own source assessment).', R02),
      read('Anthropic’s frontend-design skill flags identical cards everywhere as a sign of AI-default design.', R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'stacked', label: 'Rows with rules', what: 'Each service is a full-width row, separated by thin lines.', chooseWhen: 'Each item needs a sentence or two, and scanning down is natural.', risk: 'Long lists feel like a table.', patch: { sections: 'stacked' } },
      { id: 'alternating', label: 'Alternating photo and text', what: 'Each service gets a photo and text side by side; sides alternate down the page.', chooseWhen: 'You have a photograph for every item.', risk: 'Needs real images; makes the page long.', patch: { sections: 'alternating' } },
      {
        id: 'grid', label: 'Cards in a grid', what: 'Each service sits in its own box, three across.', chooseWhen: 'The items are parallel and visitors compare them.', risk: 'Three identical cards in a row is a listed sign of AI-default design.',
        warn: { text: 'Three equal cards is a listed sign of AI-default design. "Rows with rules" or "Ledger" says the same thing with more character.', source: read(`Anthropic’s frontend-design skill; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { sections: 'grid' },
      },
      { id: 'bento', label: 'Bento', what: 'One large tile with a photo, and smaller tiles beside it, like the compartments of a lunch box.', chooseWhen: 'One item matters most, and the size of its tile should say so.', risk: 'Needs one item that deserves the big tile; equal items look arbitrary.', patch: { sections: 'bento' } },
      { id: 'ledger', label: 'Ledger', what: 'The section title stays fixed on the left while a numbered list scrolls on the right.', chooseWhen: 'You want an editorial, organized feel and the items have an order.', risk: 'On phones it collapses to a plain list.', patch: { sections: 'ledger' } },
    ],
  },
  {
    id: 'content-width',
    name: 'Page width',
    stage: 'structure',
    title: 'How wide is the page?',
    teach:
      'The page has a maximum width. Narrow pages feel like a letter; wide pages feel like an application. Inside every width, the tool holds a paragraph to about 65 characters per line, so this choice changes the room around the text, not the length of its lines.',
    variable: 'Maximum page width',
    owns: ['contentWidth'],
    focus: 'top',
    thumb: { width: 1700 },
    defaultOptionId: 'standard',
    sources: [
      read('Emil Kowalski’s design skill caps body lines at 65 characters.', R04),
      snippet('Line-length studies (Dyson and Haselgrove, 2001; Shaikh, 2005), which favor moderate lines of roughly 50 to 80 characters. The knowledge base records them from search snippets; the studies are small and partly conflict.', KB1),
      ownerFile('Your Master Guide §12 gives 45 to 75 characters as a comfortable line. The record names no study.', R01),
      ownerFile('Your Training Manual gives 45 to 80 characters. The record names no study.', R02),
      builder('The three page widths are the builder’s choice.'),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
    options: [
      { id: 'narrow', label: 'Narrow', what: 'About 740 pixels: one reading column.', chooseWhen: 'The site is mostly words, such as a guide, a letter, or a simple service.', risk: 'Photos and grids get little room.', patch: { contentWidth: 'narrow' } },
      { id: 'standard', label: 'Standard', what: 'About 1,090 pixels.', chooseWhen: 'A typical business site with a mix of text and images.', risk: 'None in particular.', patch: { contentWidth: 'standard' } },
      { id: 'wide', label: 'Wide', what: 'About 1,340 pixels.', chooseWhen: 'Large photographs, many columns, or a dashboard feel.', risk: 'On big screens, text and its related button can drift far apart.', patch: { contentWidth: 'wide' } },
    ],
  },
  {
    id: 'emphasis',
    name: 'Emphasis',
    stage: 'structure',
    title: 'What should the eye find first?',
    teach:
      'Every screen has one thing that wins. Designers call this hierarchy. If everything is equally loud, nothing is found first. Squint at each option: the thing you still see is the winner.',
    variable: 'The dominant element of the first screen',
    owns: ['emphasis'],
    focus: 'top',
    defaultOptionId: 'headline',
    sources: [
      ownerFile('Your intuitiveness protocol (in "Intuitive Design and the Option Space"), question 5: "What must the eye find first?"; and the squint test in your Anti-Slop Checklist.', R02),
      snippet('Refactoring UI, on building hierarchy with weight and color before size. Seen through a book summary, not the book.', R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'headline', label: 'The message', what: 'A large headline dominates; the button is present but modest.', chooseWhen: 'Visitors first need to understand what you do.', risk: 'Visitors who came to act must look for the button.', patch: { emphasis: 'headline' } },
      { id: 'action', label: 'The action', what: 'A large button and the phone number dominate; the headline is smaller.', chooseWhen: 'Visitors already know what you do and came to book or call, as at a clinic or a local service.', risk: 'Feels pushy if visitors still need convincing.', patch: { emphasis: 'action' } },
      { id: 'proof', label: 'The facts', what: 'Key facts (hours, wait time, numbers) sit inside the first screen.', chooseWhen: 'A few true facts answer the visitor’s main worry.', risk: 'Only works with real facts. Never invent them.', patch: { emphasis: 'proof' } },
    ],
  },
  {
    id: 'density',
    name: 'Spacing',
    stage: 'structure',
    title: 'How much room does everything get?',
    teach:
      'Density is how tightly things are packed. Tight layouts show more at once and suit tools used all day. Loose layouts feel calm and suit pages that are read once.',
    variable: 'Spacing between and inside elements',
    owns: ['density'],
    focus: 'top',
    thumb: { width: 760 },
    defaultOptionId: 'default',
    tunables: [{ key: 'density', label: 'Spacing', min: 0.75, max: 1.45, step: 0.05, nudge: 0.07, directions: ['tighter', 'looser'] }],
    sources: [
      read('GOV.UK Design System: generous spacing in 5-pixel steps with 19-pixel body text.', R08),
      snippet('Shopify Polaris and Linear describe dense layouts for working tools. Seen as search snippets only.', R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'compact', label: 'Compact', what: 'Tight spacing; more on each screen.', chooseWhen: 'A working tool, or visitors who compare a lot of information.', risk: 'Feels crowded on a marketing page.', patch: { density: 0.85 } },
      { id: 'default', label: 'Balanced', what: 'Middle of the range.', chooseWhen: 'You are not sure.', risk: 'None in particular.', patch: { density: 1 } },
      { id: 'comfortable', label: 'Comfortable', what: 'Noticeably more air around each block.', chooseWhen: 'A calm, reassuring service such as a clinic, a firm, or a practice.', risk: 'Pages get longer.', exemplar: { text: 'GOV.UK (generous spacing)', record: R04 }, patch: { density: 1.15 } },
      { id: 'spacious', label: 'Spacious', what: 'Large gaps; each block stands alone.', chooseWhen: 'A premium or editorial feel, with few items.', risk: 'Wasteful if visitors need to scan quickly.', patch: { density: 1.32 } },
    ],
  },

  // ───────────── Stage 3: Feel ─────────────
  {
    id: 'typeface',
    name: 'Typeface',
    stage: 'feel',
    title: 'What voice do the letters have?',
    teach:
      'A typeface is the design of the letters. It sets the tone before anyone reads a word: a serif (letters with small feet) tends to feel established; a geometric sans (round, even letters) tends to feel friendly; a grotesque (plain, even strokes) tends to feel neutral. Pairing one face for headings with a quieter one for reading text is the classic move.',
    variable: 'Typeface for headings and for body text',
    owns: ['fontHeading', 'fontBody'],
    focus: 'top',
    defaultOptionId: 'civic',
    sources: [
      snippet('Studies of typeface personality (Shaikh, Chaparro and Fox, 2006; Brumberger, 2003): people assign consistent personalities to typefaces. The knowledge base records them from search snippets.', KB1),
      ownerFile('Your Training Manual, typography (graded D by your own source assessment).', R02),
      read('The Impeccable rule set names "Inter everywhere" as a sign of AI-default design, as recorded in the research.', R04),
      ownerFile('Your Training Manual lists Space Grotesk and Inter among typefaces to "avoid by default".', R02),
      builder('The ten pairings and their descriptions are the builder’s selection. Every bundled typeface carries the SIL Open Font License 1.1 (see THIRD_PARTY_NOTICES.md).'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'system', label: 'System', what: 'The device’s own font. Nothing to download.', chooseWhen: 'Speed and plainness matter most, or for a private tool.', risk: 'No personality; looks different on each device.', patch: { fontHeading: 'system-sans', fontBody: 'system-sans' } },
      { id: 'civic', label: 'Civic', what: 'Public Sans throughout: plain and sturdy.', chooseWhen: 'A service people must trust, such as health, legal, or public services.', risk: 'Unremarkable by design.', patch: { fontHeading: 'public-sans', fontBody: 'public-sans' } },
      { id: 'warm-editorial', label: 'Warm editorial', what: 'Fraunces headings (a soft, characterful serif) over Public Sans text.', chooseWhen: 'A human, crafted, welcoming feel.', risk: 'A warm serif on a cream page is on published lists of newer AI-default looks; choose your colors to avoid that.', patch: { fontHeading: 'fraunces', fontBody: 'public-sans' } },
      { id: 'literate', label: 'Literate', what: 'Newsreader headings (a newspaper-style serif) over Instrument Sans text.', chooseWhen: 'Advice, writing, law, education: places where words matter.', risk: 'Feels bookish for a playful brand.', patch: { fontHeading: 'newsreader', fontBody: 'instrument-sans' } },
      { id: 'formal', label: 'Formal', what: 'Playfair Display headings (high-contrast, elegant) over DM Sans text.', chooseWhen: 'Elegance and occasion, such as hospitality, weddings, or jewelry.', risk: 'Thin strokes get hard to read at small sizes; keep it for headings.', patch: { fontHeading: 'playfair-display', fontBody: 'dm-sans' } },
      { id: 'friendly', label: 'Friendly geometric', what: 'Outfit headings (round and open) over DM Sans text.', chooseWhen: 'Approachable brands: children, pets, food, wellness.', risk: 'Can read as lightweight for serious subjects.', patch: { fontHeading: 'outfit', fontBody: 'dm-sans' } },
      { id: 'technical', label: 'Technical', what: 'Space Grotesk headings (quirky, engineered) over Manrope text.', chooseWhen: 'Software, engineering, anything precise.', risk: 'Space Grotesk is on lists of typefaces that AI tools pick by default; it is distinctive but no longer rare.', patch: { fontHeading: 'space-grotesk', fontBody: 'manrope' } },
      { id: 'characterful', label: 'Characterful', what: 'Bricolage Grotesque headings (lively, hand-cut) over Instrument Sans text.', chooseWhen: 'You want the headings themselves to be the personality.', risk: 'Strong flavor; it will define the brand.', patch: { fontHeading: 'bricolage-grotesque', fontBody: 'instrument-sans' } },
      { id: 'reading-serif', label: 'All serif', what: 'Source Serif 4 for headings and text.', chooseWhen: 'Long reading, or a deliberately traditional voice.', risk: 'Serif body text feels unusual in an application.', patch: { fontHeading: 'source-serif-4', fontBody: 'source-serif-4' } },
      {
        id: 'neutral-modern', label: 'Neutral modern', what: 'Inter throughout.', chooseWhen: 'You want the type to disappear, as in a dense tool.', risk: 'Inter is a listed sign of AI-default design.',
        warn: { text: 'Inter is a listed sign of AI-default design. "Civic" (Public Sans) gives the same neutrality with less sameness.', source: read(`The Impeccable rule set, as recorded in the research ("Inter everywhere"); also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { fontHeading: 'inter', fontBody: 'inter' },
      },
    ],
  },
  {
    id: 'heading-treatment',
    name: 'Heading style',
    stage: 'feel',
    title: 'How do the headings speak?',
    teach:
      'The same typeface can whisper or shout. Weight is the thickness of the strokes. Tracking is the space between letters: in the design systems that were read, large headings are set slightly tighter than body text.',
    variable: 'Weight, letter spacing, and case of headings',
    owns: ['headingWeight', 'headingTracking', 'headingCase'],
    focus: 'top',
    thumb: { width: 760 },
    defaultOptionId: 'calm',
    tunables: [
      { key: 'headingWeight', label: 'Weight', min: 300, max: 900, step: 50, nudge: 100, directions: ['lighter', 'heavier'] },
      { key: 'headingTracking', label: 'Letter spacing', min: -0.06, max: 0.12, step: 0.005, unit: 'em', nudge: 0.012, directions: ['tighter', 'wider'] },
    ],
    sources: [
      read('Emil Kowalski’s design skill: large headings at about −0.02 em letter spacing and a line height near 1.05.', R04),
      read('Radix Themes and GitHub Primer Brand source code: letter spacing goes negative as headings grow (for example −0.025 em at 60 pixels in Radix Themes).', R08),
      abstract('Research on capitals (Arditi and Cho, 2007; Larson, 2004): running text in capitals reads somewhat more slowly; short labels in capitals are not a problem. The knowledge base records one abstract and one search snippet.', KB1),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'tight-heavy', label: 'Tight and heavy', what: 'Thick strokes, letters pulled close.', chooseWhen: 'Confidence and impact.', risk: 'Tiring if every heading shouts.', patch: { headingWeight: 800, headingTracking: -0.035, headingCase: 'sentence' } },
      { id: 'calm', label: 'Medium and calm', what: 'Moderate weight, slight tightening.', chooseWhen: 'A steady, professional voice.', risk: 'None in particular.', patch: { headingWeight: 600, headingTracking: -0.015, headingCase: 'sentence' } },
      { id: 'light-large', label: 'Light and elegant', what: 'Thin strokes that rely on size for presence.', chooseWhen: 'Elegance; pairs well with serif faces.', risk: 'Thin text loses contrast on some screens.', exemplar: { text: 'GitHub Primer Brand and IBM Carbon (large headings at light weights)', record: R08 }, patch: { headingWeight: 400, headingTracking: -0.02, headingCase: 'sentence' } },
      { id: 'caps', label: 'Spaced capitals', what: 'All capitals with widened letter spacing.', chooseWhen: 'Short labels and names; a formal or architectural feel.', risk: 'Keep headings short: longer text in capitals reads more slowly.', patch: { headingWeight: 700, headingTracking: 0.05, headingCase: 'upper' } },
    ],
  },
  {
    id: 'size-scale',
    name: 'Text size',
    stage: 'feel',
    title: 'How big is the text, and how big is the jump to headings?',
    teach:
      'Sizes come from a scale: each size is the previous one multiplied by a fixed ratio. A small ratio keeps everything close in size (calm, dense). A large ratio makes headings tower over the text (dramatic).',
    variable: 'Body text size and the ratio between sizes',
    owns: ['baseSize', 'scaleRatio'],
    focus: 'top',
    defaultOptionId: 'standard',
    tunables: [
      { key: 'baseSize', label: 'Body size', min: 13, max: 22, step: 0.5, unit: 'px', nudge: 1, directions: ['smaller', 'larger'] },
      { key: 'scaleRatio', label: 'Jump between sizes', min: 1.067, max: 1.62, step: 0.005, nudge: 0.04, directions: ['calmer', 'more dramatic'] },
    ],
    sources: [
      read('GOV.UK Design System: 19-pixel body text.', R08),
      read('GitHub Primer: default text size of 14 pixels and only six text sizes.', R08),
      ownerFile('Your Training Manual lists the common scale ratios (1.067 to 1.618).', R02),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
    options: [
      { id: 'dense', label: 'Small and even', what: '15 px text; headings only a little larger.', chooseWhen: 'A working tool with lots of information.', risk: 'Small for older eyes on a public site.', patch: { baseSize: 15, scaleRatio: 1.2 } },
      { id: 'standard', label: 'Standard', what: '17 px text; clear but moderate headings.', chooseWhen: 'Most sites.', risk: 'None in particular.', patch: { baseSize: 17, scaleRatio: 1.25 } },
      { id: 'generous', label: 'Large and readable', what: '19 px text; moderate headings.', chooseWhen: 'A broad public, older readers, or reading on phones.', risk: 'Fewer words fit on a screen.', exemplar: { text: 'GOV.UK (19-pixel body text)', record: R08 }, patch: { baseSize: 19, scaleRatio: 1.25 } },
      { id: 'dramatic', label: 'Dramatic', what: '17 px text; very large headings.', chooseWhen: 'Short pages where the headline is the design.', risk: 'Long headings wrap onto many lines.', patch: { baseSize: 17, scaleRatio: 1.42 } },
    ],
  },
  {
    id: 'numerals',
    name: 'Numbers',
    stage: 'feel',
    title: 'How do numbers look?',
    teach:
      'In most fonts, a "1" is narrower than an "8", so the digits in a column of prices do not line up. Even-width digits (designers call them tabular numerals) give every digit the same width, which keeps prices, times, and phone numbers steady. Look at the price list in the preview: the digits line up, or they do not.',
    variable: 'Style of digits',
    owns: ['numerals'],
    focus: 'fees',
    thumb: { width: 380, note: 'The difference is small. Compare the column of prices in the large preview.' },
    defaultOptionId: 'tabular',
    sources: [
      read('Vercel Web Interface Guidelines and Jakub Krehel’s rules: use even-width digits for numbers that change or are compared.', R04),
      ownerFile('Your plugin notes list monospace tags on consumer pages as a sign of AI-default design.', R03),
      builder('No controlled study of even-width digits was found; this is long-standing typographic practice.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'proportional', label: 'Natural', what: 'Digits keep their natural widths.', chooseWhen: 'Numbers appear only inside sentences.', risk: 'Columns and changing numbers jitter.', patch: { numerals: 'proportional' } },
      { id: 'tabular', label: 'Even-width', what: 'Every digit takes the same width.', chooseWhen: 'Prices, hours, phone numbers, tables. A safe default.', risk: 'None in particular.', exemplar: { text: 'Vercel Web Interface Guidelines', record: R04 }, patch: { numerals: 'tabular' } },
      { id: 'mono', label: 'Monospace', what: 'Numbers set in a monospace font, in which every character has the same width.', chooseWhen: 'A technical, data-forward feel.', risk: 'Monospace labels on a consumer site are a listed sign of AI-default design; use this for numbers only.', patch: { numerals: 'mono' } },
    ],
  },
  {
    id: 'neutral',
    name: 'Neutral tint',
    stage: 'feel',
    title: 'What temperature are the grays?',
    teach:
      'Most of any interface is "neutral": backgrounds, borders, and text. In the open design systems that were read, a neutral is rarely pure gray. A trace of blue feels cool and technical; a trace of yellow or red feels warm and human. This choice colors the whole page more than the accent does.',
    variable: 'Hue and strength of the tint in backgrounds, borders, and text',
    owns: ['neutralHue', 'neutralChroma'],
    focus: 'top',
    defaultOptionId: 'cool',
    tunables: [
      { key: 'neutralHue', label: 'Tint hue', min: 0, max: 360, step: 1, unit: '°', nudge: 18 },
      { key: 'neutralChroma', label: 'Tint strength', min: 0, max: 0.04, step: 0.001, nudge: 0.004, directions: ['weaker', 'stronger'] },
    ],
    sources: [
      read('Radix Colors, Tailwind, and shadcn/ui source code: gray families that each carry a trace of one hue. Radix names its families gray, mauve, slate, sage, olive, and sand.', R08),
      builder('The six tints and their hue values are the builder’s choice. The Radix names describe the same idea; the values were not copied or compared.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'pure', label: 'Pure gray', what: 'No tint at all.', chooseWhen: 'Maximum neutrality; lets photographs and the accent do the work.', risk: 'Can feel sterile.', exemplar: { text: 'IBM Carbon (untinted grays)', record: R08 }, patch: { neutralHue: 0, neutralChroma: 0 } },
      { id: 'cool', label: 'Cool slate', what: 'A trace of blue.', chooseWhen: 'Technical, clinical, or corporate subjects.', risk: 'A safe choice; it will not set you apart.', exemplar: { text: 'Radix Colors, the "slate" family', record: R08 }, patch: { neutralHue: 255, neutralChroma: 0.012 } },
      { id: 'warm', label: 'Warm sand', what: 'A trace of yellow-brown.', chooseWhen: 'Human, hospitable, crafted subjects.', risk: 'A cream background with a serif is on published lists of newer AI-default looks; pair it with a bold accent or a sans-serif.', exemplar: { text: 'Radix Colors, the "sand" family', record: R08 }, patch: { neutralHue: 80, neutralChroma: 0.014 } },
      { id: 'sage', label: 'Sage', what: 'A trace of green.', chooseWhen: 'Health, outdoors, calm.', risk: 'Fights with red or pink accents.', exemplar: { text: 'Radix Colors, the "sage" family', record: R08 }, patch: { neutralHue: 155, neutralChroma: 0.012 } },
      { id: 'mauve', label: 'Mauve', what: 'A trace of violet.', chooseWhen: 'Creative, cosmetic, or evening feel.', risk: 'Reads as cold next to warm photographs.', exemplar: { text: 'Radix Colors, the "mauve" family', record: R08 }, patch: { neutralHue: 310, neutralChroma: 0.012 } },
      { id: 'rose', label: 'Rose clay', what: 'A trace of red.', chooseWhen: 'Warmth with more energy than sand.', risk: 'Can look pink on some screens.', patch: { neutralHue: 25, neutralChroma: 0.013 } },
    ],
  },
  {
    id: 'accent',
    name: 'Accent color',
    stage: 'feel',
    title: 'What is the one color people remember?',
    teach:
      'The accent is the single strong color: buttons, links, and highlights. Hue is the kind of color (its place on the color wheel). Chroma is how vivid it is. Lightness is how light or dark. One committed accent is easier to remember than several timid ones.',
    variable: 'Hue, vividness, and lightness of the accent color',
    owns: ['accentHue', 'accentChroma', 'accentLightness'],
    focus: 'top',
    defaultOptionId: 'ink-blue',
    tunables: [
      { key: 'accentHue', label: 'Hue', min: 0, max: 360, step: 1, unit: '°', nudge: 14 },
      { key: 'accentChroma', label: 'Vividness', min: 0, max: 0.3, step: 0.005, nudge: 0.03, directions: ['duller', 'more vivid'] },
      { key: 'accentLightness', label: 'Lightness', min: 0.25, max: 0.9, step: 0.01, nudge: 0.05, directions: ['darker', 'lighter'] },
    ],
    sources: [
      builder('The 13 accents are the builder’s selection, defined in the OKLCH color model (hue, vividness, lightness). No source supplied these values, and the notes on where each color suits are the builder’s opinion.'),
      read(`${KREBS} names purple; ${OWNER_ANTI_SLOP} names purple-to-blue gradients.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'ink-blue', label: 'Ink blue', what: 'A deep, serious blue.', chooseWhen: 'Trust: finance, law, health.', risk: 'A safe choice; it will not set you apart.', patch: { accentHue: 258, accentChroma: 0.15, accentLightness: 0.44 } },
      { id: 'cobalt', label: 'Cobalt', what: 'A bright, electric blue.', chooseWhen: 'Energy with trust.', risk: 'Very vivid over large areas.', patch: { accentHue: 264, accentChroma: 0.22, accentLightness: 0.52 } },
      { id: 'teal', label: 'Deep teal', what: 'Blue-green, calm and clinical.', chooseWhen: 'Health, wellness, water.', risk: 'Familiar in health care, so it may not set you apart.', patch: { accentHue: 195, accentChroma: 0.09, accentLightness: 0.45 } },
      { id: 'forest', label: 'Forest', what: 'A dark, natural green.', chooseWhen: 'Outdoors, sustainability, money.', risk: 'Dark greens can look black in small text.', patch: { accentHue: 152, accentChroma: 0.11, accentLightness: 0.4 } },
      { id: 'leaf', label: 'Leaf', what: 'A bright, fresh green that takes dark text.', chooseWhen: 'Fresh, youthful, food.', risk: 'Bright greens need dark labels on buttons.', patch: { accentHue: 135, accentChroma: 0.19, accentLightness: 0.72 } },
      { id: 'mustard', label: 'Mustard', what: 'A warm golden yellow that takes dark text.', chooseWhen: 'Optimistic, crafted, retro.', risk: 'Yellow links are hard to read on a light page. The tool darkens link text until it stands out from the page (see the contrast notes).', patch: { accentHue: 88, accentChroma: 0.16, accentLightness: 0.8 } },
      { id: 'tangerine', label: 'Tangerine', what: 'A lively orange.', chooseWhen: 'Friendly and energetic.', risk: 'Can read as "sale" or "warning".', patch: { accentHue: 52, accentChroma: 0.19, accentLightness: 0.7 } },
      { id: 'vermilion', label: 'Vermilion', what: 'A hot red-orange.', chooseWhen: 'Bold, confident, culinary.', risk: 'Reads as error color in forms; keep error states distinct.', patch: { accentHue: 32, accentChroma: 0.2, accentLightness: 0.6 } },
      { id: 'crimson', label: 'Crimson', what: 'A deep red.', chooseWhen: 'Heritage, seriousness with warmth.', risk: 'Close to error red.', patch: { accentHue: 18, accentChroma: 0.19, accentLightness: 0.47 } },
      { id: 'magenta', label: 'Magenta', what: 'A vivid pink-red.', chooseWhen: 'Fashion, beauty, play.', risk: 'Strong flavor; polarizing.', patch: { accentHue: 352, accentChroma: 0.22, accentLightness: 0.56 } },
      { id: 'plum', label: 'Plum', what: 'A dark, muted purple.', chooseWhen: 'Luxury, evening, wine.', risk: 'Can look brown in dim light.', patch: { accentHue: 325, accentChroma: 0.12, accentLightness: 0.4 } },
      {
        id: 'violet', label: 'Violet', what: 'A bright blue-purple.', chooseWhen: 'Creative or technical brands that want to feel current.', risk: 'Purple and indigo are listed signs of AI-default design.',
        warn: { text: 'Violet and indigo are listed signs of AI-default design. "Plum" or "Cobalt" sits nearby with less sameness.', source: read(`${KREBS}, pattern "purple"; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { accentHue: 292, accentChroma: 0.2, accentLightness: 0.52 },
      },
      { id: 'graphite', label: 'Graphite', what: 'Nearly black; no hue.', chooseWhen: 'Let typography and photographs carry the color.', risk: 'Links are harder to spot without underlines.', patch: { accentHue: 255, accentChroma: 0.015, accentLightness: 0.27 } },
    ],
  },
  {
    id: 'color-strategy',
    name: 'Use of color',
    stage: 'feel',
    title: 'How much color, and where?',
    teach:
      'The same accent can appear as a few small touches or as whole painted areas. A rule of thumb in your own reference files is 60-30-10: about sixty percent neutral, thirty percent a supporting tone, ten percent accent. Breaking that guide on purpose is how bold sites get bold.',
    variable: 'Where the accent color is applied, and which second color joins it',
    owns: ['colorStrategy', 'accent2Hue'],
    focus: 'top',
    defaultOptionId: 'single-accent',
    tunables: [{ key: 'accent2Hue', label: 'Second color hue', min: 0, max: 360, step: 1, unit: '°', nudge: 20 }],
    sources: [
      ownerFile('Your Training Manual: color schemes and the 60-30-10 rule of thumb. Nobody traced the rule to an original source; your own source assessment grades the Manual D.', R02),
      builder('Which strategies to offer, and the notes on each, are the builder’s choice.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'quiet', label: 'Quiet', what: 'Buttons are ink-colored; the accent appears only in links and small details.', chooseWhen: 'Understated, editorial, or luxury.', risk: 'The main button stands out less.', patch: { colorStrategy: 'quiet' } },
      { id: 'single-accent', label: 'One accent', what: 'Buttons and highlights use the accent; one soft tinted band.', chooseWhen: 'Most sites. Clear and dependable.', risk: 'The conventional choice.', patch: { colorStrategy: 'single-accent' } },
      { id: 'duo-complement', label: 'Two colors, opposite', what: 'A second color from the opposite side of the color wheel fills one band.', chooseWhen: 'Energy and contrast; playful or sporty brands.', risk: 'Opposite colors can look harsh where they touch; keep them apart.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 180 } },
      { id: 'duo-triad', label: 'Two colors, a third apart', what: 'A second color a third of the way around the wheel fills one band.', chooseWhen: 'Colorful without clashing.', risk: 'Needs restraint elsewhere.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 120 } },
      { id: 'duo-neighbor', label: 'Two colors, neighbors', what: 'A second color close to the accent on the wheel fills one band.', chooseWhen: 'Rich and harmonious.', risk: 'The two can blur into one.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 38 } },
      { id: 'tinted-surface', label: 'Tinted page', what: 'The whole page takes a soft wash of the accent color.', chooseWhen: 'A distinctive atmosphere with little effort.', risk: 'Photographs take on the tint’s mood.', patch: { colorStrategy: 'tinted-surface' } },
      { id: 'color-block', label: 'Color block', what: 'The first screen and one band are painted solid in the accent, like a printed poster.', chooseWhen: 'Maximum boldness and recognition.', risk: 'Tiring if the accent is very vivid; hard to pair with photographs.', patch: { colorStrategy: 'color-block' } },
    ],
  },
  {
    id: 'theme',
    name: 'Light or dark',
    stage: 'feel',
    title: 'Is the page light or dark?',
    teach:
      'Theme is whether the page is light with dark text or dark with light text. A light page suits daytime reading and most photographs. A dark page suits evening use, entertainment, and tools that stay open for hours.',
    variable: 'Light page or dark page',
    owns: ['theme'],
    focus: 'top',
    defaultOptionId: 'light',
    sources: [
      ownerFile('Your Master Guide §13 on dark mode: "offer both; do not claim that it reduces eye strain."', R01),
      builder('This Step offers light or dark, not both; a Step for "both" is a known gap. The notes on where each suits are the builder’s opinion.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'light', label: 'Light', what: 'A light page with dark text.', chooseWhen: 'Most sites; daytime reading; pages with many photographs.', risk: 'None in particular.', patch: { theme: 'light' } },
      { id: 'dark', label: 'Dark', what: 'A dark page with light text.', chooseWhen: 'Evening, entertainment, tools used for hours; a dramatic or technical feel.', risk: 'Photographs and logos made for light pages may clash. Near-black with one acid accent is on published lists of newer AI-default looks.', patch: { theme: 'dark' } },
    ],
  },
  {
    id: 'contrast',
    name: 'Contrast',
    stage: 'feel',
    title: 'Soft or crisp?',
    teach:
      'Contrast is how far the text and the lines sit from the background. Soft contrast feels gentle. Crisp contrast feels sharp and stays well above the contrast guideline. The contrast notes beside the preview show the measured ratio for body text.',
    variable: 'Strength of contrast between text, lines, and background',
    owns: ['contrast'],
    focus: 'top',
    defaultOptionId: 'crisp',
    tunables: [{ key: 'contrast', label: 'Contrast', min: 0, max: 1, step: 0.05, nudge: 0.12, directions: ['softer', 'crisper'] }],
    sources: [
      read('WCAG 2.2, criterion 1.4.3: body text at a contrast ratio of at least 4.5 to 1, large text at least 3 to 1. The knowledge base records the criterion as read from the W3C source repository.', KB1),
      snippet('Linear’s theme model (base color, accent, contrast as three inputs). Seen as a search snippet only.', R04),
      builder('The three contrast levels are the builder’s choice.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'soft', label: 'Soft', what: 'Text and lines in gentler tones.', chooseWhen: 'Gentle, calm, low-stress pages with large text.', risk: 'Small or secondary text may fall below the 4.5 to 1 guideline; read the contrast notes.', patch: { contrast: 0.4 } },
      { id: 'balanced', label: 'Balanced', what: 'Between soft and crisp.', chooseWhen: 'You want calm without giving up much legibility.', risk: 'None in particular.', patch: { contrast: 0.65 } },
      { id: 'crisp', label: 'Crisp', what: 'Near-black text on a light page, or bright text on a dark page, with clear lines.', chooseWhen: 'Most sites; the best all-round legibility.', risk: 'None in particular.', patch: { contrast: 0.85 } },
    ],
  },
  {
    id: 'atmosphere',
    name: 'Atmosphere',
    stage: 'feel',
    title: 'What is in the air behind the first screen?',
    teach:
      'Atmosphere is what sits behind the content of the first screen: nothing, a faint grid, a soft glow, or film grain. It sets a mood before anyone reads. In the sites whose code a research helper read, these backgrounds stay faint (grids at 5 to 20 percent strength, faded at the edges). Turned up loud, the same effect is a listed sign of AI-default design.',
    variable: 'Background treatment of the first screen',
    owns: ['atmosphere'],
    focus: 'top',
    thumb: { width: 900 },
    defaultOptionId: 'plain',
    sources: [
      read('Background recipes in open-source code: Once UI and Magic UI (dot and line grids under a fading mask), ray.so (a spotlight glow), the cmdk website (an aurora), Open Props (grain). A research helper read the source files; nobody has reviewed that record yet.', R09),
      builder('The builder wrote the tool’s own backgrounds before that record existed. They use the same techniques, not the recorded values.'),
      read(`${KREBS} names decorative gradients.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'plain', label: 'Nothing', what: 'A clean, flat background.', chooseWhen: 'The type and the content are strong enough alone.', risk: 'None in particular.', exemplar: { text: 'GOV.UK Design System', record: R08 }, patch: { atmosphere: 'plain' } },
      { id: 'horizon', label: 'Horizon wash', what: 'A faint wash of the accent color that fades down the first screen.', chooseWhen: 'A gentle lift without any pattern.', risk: 'Too strong a wash looks like a default gradient.', patch: { atmosphere: 'horizon' } },
      { id: 'dot-grid', label: 'Dot grid', what: 'A field of tiny dots that fades toward the edges.', chooseWhen: 'A technical, drafting-table feel.', risk: 'Dots under body text reduce legibility; the fade keeps them behind the headline only.', exemplar: { text: 'Once UI and Magic UI (open-source components)', record: R09 }, patch: { atmosphere: 'dot-grid' } },
      { id: 'line-grid', label: 'Line grid', what: 'Faint grid lines, like graph paper, fading toward the edges.', chooseWhen: 'Engineering, architecture, planning.', risk: 'Lines compete with thin typefaces.', exemplar: { text: 'Magic UI, "retro grid" (an open-source component)', record: R09 }, patch: { atmosphere: 'line-grid' } },
      { id: 'spotlight', label: 'Spotlight', what: 'A soft glow of accent color from the top center, like stage light.', chooseWhen: 'Focus and drama, especially on dark themes.', risk: 'On light themes it must stay faint.', exemplar: { text: 'ray.so (Raycast’s open-source site)', record: R09 }, patch: { atmosphere: 'spotlight' } },
      {
        id: 'aurora', label: 'Aurora', what: 'Two or three soft clouds of related color behind the headline.', chooseWhen: 'A rich, atmospheric first impression.', risk: 'A purple-and-blue aurora is a listed sign of AI-default design; it works when the colors come from your own accent.',
        warn: { text: 'Aurora gradients are a listed sign of AI-default design. They read as intentional only when the hues belong to your palette and stay soft. "Spotlight" or "Horizon wash" gives depth with one hue.', source: ownerFile(`Your Training Manual labels aurora and mesh gradients "the AI default look"; ${KREBS} names decorative gradients.`, R02) },
        exemplar: { text: 'The cmdk website (open source)', record: R09 },
        patch: { atmosphere: 'aurora' },
      },
      { id: 'grain', label: 'Film grain', what: 'A fine speckle over the whole page, like paper or film.', chooseWhen: 'Warmth, print, craft; softens flat color.', risk: 'Too much grain looks dirty; costs a little rendering speed.', exemplar: { text: 'Open Props (noise textures)', record: R09 }, patch: { atmosphere: 'grain' } },
    ],
  },
  {
    id: 'radius',
    name: 'Corners',
    stage: 'feel',
    title: 'How sharp are the corners?',
    teach:
      'Corner radius is how rounded the corners of buttons and boxes are. Square corners feel precise and serious; round corners feel friendly. Whatever you pick, the tool keeps it consistent, and it rounds outer boxes more than the controls inside them (one and a half times the control’s radius), so that nested corners look close to parallel. The exact rule, called concentric radius, is: outer radius equals inner radius plus the gap between them. The tool approximates it.',
    variable: 'Corner radius of controls and boxes',
    owns: ['radius'],
    focus: 'contact',
    thumb: { width: 440 },
    defaultOptionId: 'subtle',
    tunables: [{ key: 'radius', label: 'Radius', min: 0, max: 28, step: 1, unit: 'px', nudge: 3, directions: ['sharper', 'rounder'] }],
    sources: [
      read('The concentric radius rule: Vercel Web Interface Guidelines and Jakub Krehel’s rules.', R04),
      read('Shape values in open design systems: controls at 4 to 8 pixels and cards at 8 to 14 pixels; square corners in IBM Carbon and GOV.UK; pill buttons in Material 3 and Radix Themes.', R08),
      ownerFile('Your files list "broadsheet hairlines with zero radius" among five newer AI-default looks.', R01),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'square', label: 'Square', what: 'No rounding.', chooseWhen: 'Editorial, architectural, serious.', risk: 'Square corners with hairlines everywhere is on a list of newer AI-default looks.', exemplar: { text: 'IBM Carbon and GOV.UK (square corners)', record: R08 }, patch: { radius: 0 } },
      { id: 'crisp', label: 'Crisp', what: '3 pixels: barely softened.', chooseWhen: 'Precise and professional.', risk: 'None in particular.', exemplar: { text: 'GitHub Primer (3 pixels is its "small" radius)', record: TOKENS }, patch: { radius: 3 } },
      { id: 'subtle', label: 'Subtle', what: '8 pixels.', chooseWhen: 'A neutral, current look.', risk: 'A common choice; it will not set you apart.', exemplar: { text: 'Material 3 (8 pixels is one of its shape steps)', record: R08 }, patch: { radius: 8 } },
      { id: 'soft', label: 'Soft', what: '14 pixels: clearly rounded.', chooseWhen: 'Friendly and approachable.', risk: 'Large radii on small elements look bubbly.', patch: { radius: 14 } },
      { id: 'pill', label: 'Pill', what: 'Fully rounded buttons; generously rounded boxes.', chooseWhen: 'Playful, consumer, mobile-first.', risk: 'Pills waste horizontal space and suit short labels only.', exemplar: { text: 'Material 3 and Radix Themes (pill-shaped buttons)', record: R08 }, patch: { radius: 999 } },
    ],
  },
  {
    id: 'elevation',
    name: 'Depth',
    stage: 'feel',
    title: 'How do boxes separate from the page?',
    teach:
      'Elevation is how a card or panel stands apart from the background. Lines, shadows, and changes of tone all do this job. In the design systems that a research helper read, a shadow is a stack of faint layers that starts with a one-pixel ring. One identical gray blur under every card is a listed sign of AI-default design.',
    variable: 'How surfaces separate: lines, shadows, or tone',
    owns: ['elevation'],
    focus: 'about',
    thumb: { width: 440 },
    defaultOptionId: 'borders',
    sources: [
      read('Vercel Web Interface Guidelines: at least two shadow layers.', R04),
      read('Radix Themes, GitHub Primer, HeroUI, and Magic UI source code, and Jakub Krehel’s rules: a one-pixel translucent ring as the first shadow layer.', R08),
      snippet('Josh Comeau on layered shadows. Seen as a search snippet only; his site did not load.', R04),
      builder('The hard offset shadow ("sticker") follows the neo-brutalist fashion as the builder knows it; no source was read for it.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'flat', label: 'Flat fills', what: 'Boxes are a slightly different tone; no lines, no shadows.', chooseWhen: 'Calm and modern.', risk: 'Boxes can disappear on poor screens.', patch: { elevation: 'flat' } },
      { id: 'borders', label: 'Lines', what: 'Thin outlines; no shadows.', chooseWhen: 'Crisp, technical, dependable.', risk: 'Many outlines get busy.', patch: { elevation: 'borders' } },
      { id: 'ring', label: 'Ring and whisper', what: 'A one-pixel ring with a barely visible shadow: a crisp edge that looks machined.', chooseWhen: 'Precise, modern, technical.', risk: 'Very quiet; needs good spacing to carry the layout.', exemplar: { text: 'Radix Themes and GitHub Primer (a one-pixel ring under every shadow)', record: R08 }, patch: { elevation: 'ring' } },
      { id: 'soft-shadow', label: 'Soft layered shadow', what: 'Boxes float on a gentle, tinted, three-layer shadow.', chooseWhen: 'Approachable depth, as in consumer products.', risk: 'Looks generic if every element floats; keep it for a few.', exemplar: { text: 'Radix Themes (three to five faint layers per shadow level)', record: R09 }, patch: { elevation: 'soft-shadow' } },
      { id: 'float', label: 'Floating panels', what: 'Wide, soft, layered shadows: boxes hover well above the page.', chooseWhen: 'A calm, premium, product-showcase feel, for a few showcase panels.', risk: 'In the open-source systems that a research helper read, wide soft shadows sit under floating menus, not under resting cards. Crowded floating boxes look heavy.', patch: { elevation: 'float' } },
      { id: 'hard-shadow', label: 'Hard offset shadow', what: 'A solid block of shadow with thick outlines, like a sticker.', chooseWhen: 'Bold, playful, poster-like (the style called neo-brutalism).', risk: 'A strong fashion; dates quickly.', patch: { elevation: 'hard-shadow' } },
      { id: 'glass', label: 'Glass', what: 'Translucent boxes that blur what is behind them, with a bright top edge. The navigation bar stays in view and frosts over the page.', chooseWhen: 'Depth and atmosphere; pairs with a glow or aurora background.', risk: 'Needs color behind it to read as glass, and costs some rendering speed on old devices. In the code that a research helper read, glass appears only on floating bars such as toolbars.', patch: { elevation: 'glass' } },
      { id: 'tonal', label: 'Tonal with highlight', what: 'Boxes are a deeper tone with a faint top highlight, like a pressed panel.', chooseWhen: 'Dark themes and instrument-panel styles.', risk: 'Subtle on light themes.', exemplar: { text: 'coss ui in dark mode (surfaces get lighter as they rise)', record: R09 }, patch: { elevation: 'tonal' } },
    ],
  },
  {
    id: 'border-weight',
    name: 'Line weight',
    stage: 'feel',
    title: 'How heavy are the lines?',
    teach:
      'Lines divide and outline. A hairline nearly disappears and feels refined. A heavy line is a statement and makes forms very easy to see.',
    variable: 'Thickness of rules and outlines',
    owns: ['borderWeight'],
    focus: 'services',
    thumb: { width: 440 },
    defaultOptionId: 'hairline',
    tunables: [{ key: 'borderWeight', label: 'Thickness', min: 0, max: 4, step: 0.5, unit: 'px', nudge: 0.5, directions: ['thinner', 'thicker'] }],
    sources: [
      read('GOV.UK Design System: 2-pixel form borders.', R04),
      read('coss ui and Radix Themes source code: thin translucent edges (black at 8 percent on light pages in coss ui). A research helper read the source files; nobody has reviewed that record yet.', R09),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'Almost none', what: 'Page dividers vanish; inputs keep a thin outline.', chooseWhen: 'Spacing alone should organize the page.', risk: 'Sections can run together.', patch: { borderWeight: 0 } },
      { id: 'hairline', label: 'Hairline', what: '1 pixel.', chooseWhen: 'A refined, quiet page.', risk: 'None in particular.', exemplar: { text: 'coss ui and Radix Themes (thin translucent edges)', record: R09 }, patch: { borderWeight: 1 } },
      { id: 'medium', label: 'Medium', what: '2 pixels.', chooseWhen: 'Clear, sturdy forms; high legibility.', risk: 'Heavier look.', exemplar: { text: 'GOV.UK (2-pixel form borders)', record: R04 }, patch: { borderWeight: 2 } },
      { id: 'bold', label: 'Bold', what: '3 pixels.', chooseWhen: 'Graphic, poster-like styles.', risk: 'Dominates delicate typefaces.', patch: { borderWeight: 3 } },
    ],
  },
  {
    id: 'button-finish',
    name: 'Button finish',
    stage: 'feel',
    title: 'How is the main button made?',
    teach:
      'The main button is the control you most want pressed, so its finish matters. A flat button is plain and quiet. A glossy button imitates light falling from above (a lighter top edge, a darker ring, a soft shadow), which makes it look pressable. The finish should match how the boxes on the page are made.',
    variable: 'Finish of the main button',
    owns: ['buttonFinish'],
    focus: 'top',
    thumb: { width: 440 },
    defaultOptionId: 'flat',
    sources: [
      read('Button recipes in open-source code: Radix Themes (solid and "classic" beveled buttons), coss ui (a lit top edge; an outline button), HeroUI (a colored shadow), ray.so (a tinted button). A research helper read the source files; nobody has reviewed that record yet.', R09),
      builder('The builder wrote the tool’s own button finishes before that record existed. They use the same techniques, not the recorded values.'),
      read(`${KREBS} names colored glow.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'flat', label: 'Flat', what: 'One solid color.', chooseWhen: 'Clean, plain, editorial.', risk: 'None in particular.', exemplar: { text: 'Radix Themes, "solid" button', record: R09 }, patch: { buttonFinish: 'flat' } },
      { id: 'gloss', label: 'Gloss', what: 'A lighter top, a bright inner edge, a fine dark ring, and a tinted shadow beneath.', chooseWhen: 'A tactile, well-made, premium feel.', risk: 'Overdone gloss looks dated; this finish keeps it subtle.', exemplar: { text: 'Radix Themes, "classic" button; coss ui, default button', record: R09 }, patch: { buttonFinish: 'gloss' } },
      { id: 'glow', label: 'Glow', what: 'A solid button that casts a soft halo of its own color.', chooseWhen: 'Dark themes; one action that must draw the eye.', risk: 'Colored glow on every element is a listed sign of AI-default design; keep it to this one button.', exemplar: { text: 'HeroUI, "shadow" button', record: R09 }, patch: { buttonFinish: 'glow' } },
      { id: 'outline', label: 'Outline', what: 'No fill: a colored outline and colored label.', chooseWhen: 'Understated pages where the button should not dominate.', risk: 'The main action stands out less.', exemplar: { text: 'coss ui, "outline" button', record: R09 }, patch: { buttonFinish: 'outline' } },
      { id: 'soft', label: 'Soft tint', what: 'A pale tint of the accent with a colored label.', chooseWhen: 'Gentle, friendly, low-pressure.', risk: 'Can look disabled if the tint is too pale.', exemplar: { text: 'ray.so, tinted button', record: R09 }, patch: { buttonFinish: 'soft' } },
    ],
  },
  {
    id: 'display-treatment',
    name: 'Headline fill',
    stage: 'feel',
    title: 'How is the big headline filled?',
    teach:
      'Large type can carry more than one flat color. A quiet "ink gradient" (full strength at the top, fading slightly toward the bottom) gives a headline a sheen. A loud two-color gradient is a listed sign of AI-default design.',
    variable: 'Fill of the largest headline',
    owns: ['displayTreatment'],
    focus: 'top',
    thumb: { width: 760 },
    defaultOptionId: 'solid',
    sources: [
      read('Headline recipes in open-source code: Supabase (".heading-gradient") and the React Email site (".text-gradient"). A research helper read the source files; nobody has reviewed that record yet.', R09),
      ownerFile('Your Anti-Slop Checklist lists gradient text among the signs of AI-default design.', R02),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'solid', label: 'Solid', what: 'One color.', chooseWhen: 'Always safe; lets the typeface speak.', risk: 'None in particular.', patch: { displayTreatment: 'solid' } },
      { id: 'ink-gradient', label: 'Ink sheen', what: 'Full ink at the top fading slightly toward the bottom.', chooseWhen: 'Large, heavy headlines; modern product pages.', risk: 'Invisible on small or thin type.', exemplar: { text: 'Supabase and the React Email site (open source)', record: R09 }, patch: { displayTreatment: 'ink-gradient' } },
      {
        id: 'accent-gradient', label: 'Color gradient', what: 'The headline runs from the accent color into a neighboring hue.', chooseWhen: 'A deliberately vivid, energetic brand.', risk: 'Gradient headline text is a listed sign of AI-default design.',
        warn: { text: 'Gradient text is a listed sign of AI-default design. "Ink sheen" gives depth without it.', source: ownerFile('Your Anti-Slop Checklist ("gradient text"). The finish-recipes record describes when gradient text reads as a cliché.', R02) },
        patch: { displayTreatment: 'accent-gradient' },
      },
    ],
  },
  {
    id: 'signature',
    name: 'Signature',
    stage: 'feel',
    title: 'What is the one memorable move?',
    teach:
      'A signature is the one element that a visitor would describe to a friend. Choose one. Your own checklist puts it this way: spend bold choices in one place only. Boldness in a single spot reads as confidence; boldness everywhere reads as noise.',
    variable: 'One distinctive decorative element',
    owns: ['signature'],
    focus: 'top',
    defaultOptionId: 'none',
    sources: [
      ownerFile('Your Anti-Slop Checklist: "Bold choices spent in one place only"; it also lists "01/02/03 on non-sequences" as a sign of AI-default design.', R02),
      ownerFile('The phrase "one orchestrated moment beats scattered effects" reaches this project through your Training Manual, which quotes Anthropic’s frontend-design skill second-hand.', R02),
      builder('The six signature elements are the builder’s selection.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'None', what: 'No decoration; typography and color carry the page.', chooseWhen: 'The earlier Decisions are already bold.', risk: 'May be forgettable if the earlier Decisions were all safe.', patch: { signature: 'none' } },
      { id: 'marker', label: 'Marker highlight', what: 'A highlighter stroke behind the key phrase of the headline.', chooseWhen: 'One phrase carries the promise.', risk: 'Only works with a phrase worth marking.', patch: { signature: 'marker' } },
      { id: 'big-numerals', label: 'Large numerals', what: 'Oversized numbers beside each service.', chooseWhen: 'The items form a real sequence or a short, countable set.', risk: 'Numbering things that are not a sequence is a listed sign of AI-default design.', focus: 'services', patch: { signature: 'big-numerals' } },
      { id: 'color-band', label: 'Solid band', what: 'The facts strip becomes a full-width band of solid accent color with large figures.', chooseWhen: 'You have true, strong facts.', risk: 'Draws all attention to the numbers; they must be real.', focus: 'facts', patch: { signature: 'color-band' } },
      { id: 'outline-type', label: 'Outlined phrase', what: 'The key phrase of the headline appears as an outline only.', chooseWhen: 'Display-sized headlines with a heavy typeface.', risk: 'Hard to read at small sizes and with thin typefaces.', patch: { signature: 'outline-type' } },
      { id: 'corner-tag', label: 'Tilted tag', what: 'The small label above the headline becomes a tilted colored tag.', chooseWhen: 'A touch of informality or craft.', risk: 'Too casual for formal subjects.', patch: { signature: 'corner-tag' } },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    stage: 'feel',
    title: 'How much does the page move?',
    teach:
      'Motion explains change: where something came from, and that a press registered. In the rule sets that were read, interface motion stays under about a third of a second, starts quickly and settles gently, and gets shorter the more often a person sees it. The "Expressive" Option deliberately runs longer (about half a second, once, at the top of the page). Every Option stops moving for a visitor whose device asks for reduced motion. Hover over the large preview to feel each Option.',
    variable: 'Amount and character of animation',
    owns: ['motion'],
    focus: 'top',
    thumb: { note: 'A still picture cannot show motion. Use the large preview: press "Play the entrance again", or move the pointer over a button.' },
    defaultOptionId: 'subtle',
    sources: [
      read('Emil Kowalski’s and Jakub Krehel’s motion rules: the amount of animation follows how often a person sees it; interface motion in general stays under 300 milliseconds.', R04),
      read('IBM Carbon motion tokens: a "productive" and an "expressive" mood, with six durations from 70 to 700 milliseconds.', R08),
      read('WCAG 2.2, criterion 2.3.3 (animation from interactions) and the "prefers-reduced-motion" setting. The knowledge base records both as read from the W3C and MDN source repositories.', KB1),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'None', what: 'Everything changes instantly.', chooseWhen: 'Tools used hundreds of times a day; maximum speed.', risk: 'Abrupt on a marketing page.', patch: { motion: 'none' } },
      { id: 'subtle', label: 'Subtle', what: 'Quick, quiet responses: buttons press in, colors ease on hover.', chooseWhen: 'Most sites. Responsive without drawing attention.', risk: 'None in particular.', patch: { motion: 'subtle' } },
      { id: 'expressive', label: 'Expressive', what: 'The first screen rises into place in sequence; boxes lift on hover.', chooseWhen: 'Pages seen rarely, where a moment of delight is welcome.', risk: 'Fade-and-rise on every section is a listed sign of AI-default design; here it happens once, at the top.', patch: { motion: 'expressive' } },
    ],
  },
];

const STEP_TABLE = new Map<string, Step>(STEPS.map((s) => [s.id, s]));

/** Find a Step by its identifier. Returns `undefined` for anything that is not a Step, including names of built-in object members. */
export function findStep(id: string): Step | undefined {
  return STEP_TABLE.get(id);
}
