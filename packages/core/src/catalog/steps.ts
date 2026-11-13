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
    name: 'Menu (navigation)',
    stage: 'structure',
    title: 'How do visitors move around the site?',
    teach:
      'The menu is the set of links that appears on every page (designers call it the navigation). Visitors look for it where other sites put it, so the familiar place is the easy place. Every Option here keeps the links in view: one usability study found that people used a hidden menu about half as often as visible links.',
    variable: 'Where the menu sits and how its links are arranged',
    owns: ['nav'],
    focus: 'top',
    defaultOptionId: 'top-inline',
    sources: [
      snippet('Nielsen Norman Group (Pernice and Budiu, 2016), a usability study of hidden and visible navigation. The knowledge base records it from a search snippet; nobody read the study itself.', KB1),
      ownerFile('Your report "Intuitive Design and the Option Space" gives the same figures (27% against 48% use). Your own source assessment grades that report C.', R02),
      builder('Which arrangement counts as familiar is the judgment of the assistant that wrote this Studio; no count of sites was consulted.'),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
    options: [
      { id: 'top-inline', label: 'Name left, links right', what: 'One row: the business name on the left, the links on the right.', chooseWhen: 'Almost always. It is the familiar arrangement for a small site.', risk: 'More than six links will wrap.', patch: { nav: 'top-inline' } },
      { id: 'top-centered', label: 'Name centered, links below', what: 'The name sits centered on its own line, like the title at the top of a newspaper, with the links centered beneath it.', chooseWhen: 'The name itself is the brand, as on a restaurant, studio, or publication.', risk: 'Uses more height before the content starts.', patch: { nav: 'top-centered' } },
      { id: 'split-cta', label: 'Links centered, button right', what: 'Name left, links in the middle, phone number and a solid action button on the right.', chooseWhen: 'One action (book, call, buy) matters more than everything else.', risk: 'The button competes with the page’s own main button.', patch: { nav: 'split-cta' } },
      { id: 'side-rail', label: 'Links in a left column', what: 'A fixed column on the left holds the name and the links; content scrolls beside it.', chooseWhen: 'The site behaves like a tool or a portfolio, or has many sections.', risk: 'Takes width from the content; unusual for a brochure site.', patch: { nav: 'side-rail' } },
    ],
  },
  {
    id: 'hero',
    name: 'First screen',
    stage: 'structure',
    title: 'How is the first screen arranged?',
    teach:
      'The first screen is what a visitor sees before scrolling (designers call it the hero). It answers three questions in a few seconds: what is this, is it for me, and what do I do next. The arrangement decides which answer the eye meets first.',
    variable: 'Arrangement of the first screen',
    owns: ['hero'],
    focus: 'top',
    defaultOptionId: 'text-left',
    sources: [
      ownerFile('Your Training Manual, layout archetypes. Your own source assessment grades it D ("onboarding only").', R02),
      read(`${KREBS} names "centered hero plus Inter"; ${OWNER_ANTI_SLOP} names "centered hero + three identical icon cards".`, R04),
      builder('The “three questions” framing is a summary by the assistant that wrote this Studio; no source was consulted for it.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'text-left', label: 'Headline left', what: 'Headline, short paragraph, and buttons, aligned to the left edge.', chooseWhen: 'The page has more than a few words, and you want them read in order.', risk: 'Plain, unless the letter style carries it.', patch: { hero: 'text-left' } },
      {
        id: 'centered', label: 'Everything centered', what: 'Everything centered on the page.', chooseWhen: 'The message is very short.', risk: 'A centered opening above a row of boxes is on published lists of looks that many AI-made pages share.',
        warn: { text: 'A centered opening is on published lists of looks that many AI-made pages share, so your page may look generic. If you pick it, add a distinctive letter style or one special touch. “Headline left” and “Very large headline” avoid the look.', source: read(`${KREBS}, pattern "centered hero plus Inter"; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { hero: 'centered' },
      },
      { id: 'split-media', label: 'Text and photo side by side', what: 'Text on the left, a large photograph on the right.', chooseWhen: 'You have a real, good photograph of the place, the people, or the work.', risk: 'Needs a real photograph. A stock photograph is easy to spot.', patch: { hero: 'split-media' } },
      { id: 'statement', label: 'Very large headline', what: 'A very large headline across the full width, with the paragraph and buttons in a row beneath a rule.', chooseWhen: 'The headline is strong and short, and you want a confident feel, like the front page of a magazine.', risk: 'A weak or long headline has nowhere to hide.', patch: { hero: 'statement' } },
    ],
  },
  {
    id: 'sections',
    name: 'List of services',
    stage: 'structure',
    title: 'How is the list of services laid out?',
    teach:
      'A page often repeats one kind of item: services, features, products. The layout of those items tells visitors whether to compare them, read them in order, or scan for one.',
    variable: 'Layout of the list of services',
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
      { id: 'stacked', label: 'Rows separated by lines', what: 'Each service is a full-width row, separated by thin lines.', chooseWhen: 'Each item needs a sentence or two, and scanning down is natural.', risk: 'Long lists feel like a table.', patch: { sections: 'stacked' } },
      { id: 'alternating', label: 'Alternating photo and text', what: 'Each service gets a photo and text side by side; sides alternate down the page.', chooseWhen: 'You have a photograph for every item.', risk: 'Needs real images; makes the page long.', patch: { sections: 'alternating' } },
      {
        id: 'grid', label: 'Boxes side by side', what: 'Each service sits in its own box, three across.', chooseWhen: 'The items are parallel and visitors compare them.', risk: 'Three identical boxes in a row are on published lists of looks that many AI-made pages share.',
        warn: { text: 'Three equal boxes in a row are on published lists of looks that many AI-made pages share, so your page may look generic. “Rows separated by lines” or “Numbered list beside a fixed title” says the same thing with more character.', source: read(`Anthropic’s frontend-design skill; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { sections: 'grid' },
      },
      { id: 'bento', label: 'One large box, smaller boxes beside it', what: 'One large box with a photo, and smaller boxes beside it, like the compartments of a lunch box.', chooseWhen: 'One item matters most, and the size of its box should say so.', risk: 'Needs one item that deserves the big box; equal items look arbitrary.', patch: { sections: 'bento' } },
      { id: 'ledger', label: 'Numbered list beside a fixed title', what: 'The section title stays fixed on the left while a numbered list scrolls on the right.', chooseWhen: 'You want an organized feel, like the contents page of a magazine, and the items have an order.', risk: 'On phones it collapses to a plain list.', patch: { sections: 'ledger' } },
    ],
  },
  {
    id: 'content-width',
    name: 'Page width',
    stage: 'structure',
    title: 'How wide is the page?',
    teach:
      'This Step sets the widest the page may grow. A narrow page feels like a letter; a wide page feels like an application. At every width, the Studio holds a paragraph to about 65 characters per line, so this choice changes the room around the text, not the length of its lines.',
    variable: 'The greatest width of the page',
    owns: ['contentWidth'],
    focus: 'top',
    thumb: { width: 1700 },
    defaultOptionId: 'standard',
    sources: [
      read('Emil Kowalski’s design skill caps body lines at 65 characters.', R04),
      snippet('Line-length studies (Dyson and Haselgrove, 2001; Shaikh, 2005), which favor moderate lines of roughly 50 to 80 characters. The knowledge base records them from search snippets; the studies are small and partly conflict.', KB1),
      ownerFile('Your Master Guide §12 gives 45 to 75 characters as a comfortable line. The record names no study.', R01),
      ownerFile('Your Training Manual gives 45 to 80 characters. The record names no study.', R02),
      builder('The assistant that wrote this Studio chose the three page widths.'),
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
    name: 'What stands out first',
    stage: 'structure',
    title: 'What should the eye find first?',
    teach:
      'Every screen has one thing that the eye finds first (designers call the order of attention the hierarchy). If everything is equally loud, nothing is found first. Squint at each card: the thing you still see is the winner.',
    variable: 'Which part of the first screen stands out most',
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
      { id: 'headline', label: 'The headline', what: 'A large headline dominates; the button is present but modest.', chooseWhen: 'Visitors first need to understand what you do.', risk: 'Visitors who came to act must look for the button.', patch: { emphasis: 'headline' } },
      { id: 'action', label: 'The button', what: 'A large button and the phone number dominate; the headline is smaller.', chooseWhen: 'Visitors already know what you do and came to book or call, as at a clinic or a local service.', risk: 'Feels pushy if visitors still need convincing.', patch: { emphasis: 'action' } },
      { id: 'proof', label: 'The facts', what: 'Key facts (hours, wait time, numbers) sit inside the first screen.', chooseWhen: 'A few true facts answer the visitor’s main worry.', risk: 'Only works with real facts. Never invent them.', patch: { emphasis: 'proof' } },
    ],
  },
  {
    id: 'density',
    name: 'Spacing',
    stage: 'structure',
    title: 'How much room does everything get?',
    teach:
      'This Step sets how tightly things are packed (designers call it density). A tight page shows more at once and suits a tool that people use all day. A roomy page feels calm and suits a page that people read once.',
    variable: 'The space between things and inside them',
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
      { id: 'compact', label: 'Tight', what: 'Tight spacing; more on each screen.', chooseWhen: 'A working tool, or visitors who compare a lot of information.', risk: 'Feels crowded on a marketing page.', patch: { density: 0.85 } },
      { id: 'default', label: 'Medium', what: 'Middle of the range.', chooseWhen: 'You are not sure.', risk: 'None in particular.', patch: { density: 1 } },
      { id: 'comfortable', label: 'Roomy', what: 'Noticeably more air around each block.', chooseWhen: 'A calm, reassuring service such as a clinic, a firm, or a practice.', risk: 'Pages get longer.', exemplar: { text: 'GOV.UK’s published design rules (generous spacing)', record: R04 }, patch: { density: 1.15 } },
      { id: 'spacious', label: 'Very roomy', what: 'Large gaps; each block stands alone.', chooseWhen: 'A premium, magazine-like feel, with few items.', risk: 'Wasteful if visitors need to scan quickly.', patch: { density: 1.32 } },
    ],
  },

  // ───────────── Stage 3: Feel ─────────────
  {
    id: 'typeface',
    name: 'Letter style (typeface)',
    stage: 'feel',
    title: 'Which letter style does the page use?',
    teach:
      'A letter style is the design of the letters (designers call it a typeface). It sets the tone before anyone reads a word. Letters with small feet tend to feel established (serif). Round, even letters without feet tend to feel friendly, and plain ones tend to feel neutral (sans-serif). Many pages pair one letter style for headings with a quieter one for reading text.',
    variable: 'The letter style of headings and of reading text',
    owns: ['fontHeading', 'fontBody'],
    focus: 'top',
    defaultOptionId: 'civic',
    sources: [
      snippet('Studies of typeface personality (Shaikh, Chaparro and Fox, 2006; Brumberger, 2003): people assign consistent personalities to typefaces. The knowledge base records them from search snippets.', KB1),
      ownerFile('Your Training Manual, typography (graded D by your own source assessment).', R02),
      read('The Impeccable rule set names "Inter everywhere" as a sign of AI-default design, as recorded in the research.', R04),
      ownerFile('Your Training Manual lists Space Grotesk and Inter among typefaces to "avoid by default".', R02),
      builder('The assistant that wrote this Studio selected the ten pairings and wrote their descriptions. Every bundled font carries the SIL Open Font License 1.1 (see THIRD_PARTY_NOTICES.md).'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'system', label: 'The device’s own font', what: 'The device’s own font. Nothing to download.', chooseWhen: 'Speed and plainness matter most, or for a private tool.', risk: 'No personality; looks different on each device.', patch: { fontHeading: 'system-sans', fontBody: 'system-sans' } },
      { id: 'civic', label: 'Plain and sturdy', what: 'Public Sans throughout: plain and sturdy.', chooseWhen: 'A service people must trust, such as health, legal, or public services.', risk: 'Unremarkable by design.', patch: { fontHeading: 'public-sans', fontBody: 'public-sans' } },
      { id: 'warm-editorial', label: 'Soft headings with small feet', what: 'Fraunces headings (soft letters with small feet and plenty of character) over Public Sans text.', chooseWhen: 'A human, crafted, welcoming feel.', risk: 'Warm letters with small feet on a cream page are on published lists of newer looks that many AI-made pages share; choose your colors to avoid that.', patch: { fontHeading: 'fraunces', fontBody: 'public-sans' } },
      { id: 'literate', label: 'Newspaper-style headings', what: 'Newsreader headings (newspaper-style letters with small feet) over Instrument Sans text.', chooseWhen: 'Advice, writing, law, education: places where words matter.', risk: 'Feels bookish for a playful brand.', patch: { fontHeading: 'newsreader', fontBody: 'instrument-sans' } },
      { id: 'formal', label: 'Elegant thick-and-thin headings', what: 'Playfair Display headings (elegant letters with thick and thin strokes) over DM Sans text.', chooseWhen: 'Elegance and occasion, such as hospitality, weddings, or jewelry.', risk: 'Thin strokes get hard to read at small sizes; keep it for headings.', patch: { fontHeading: 'playfair-display', fontBody: 'dm-sans' } },
      { id: 'friendly', label: 'Round, friendly headings', what: 'Outfit headings (round and open) over DM Sans text.', chooseWhen: 'Approachable brands: children, pets, food, wellness.', risk: 'Can read as lightweight for serious subjects.', patch: { fontHeading: 'outfit', fontBody: 'dm-sans' } },
      { id: 'technical', label: 'Engineered-looking headings', what: 'Space Grotesk headings (quirky, engineered) over Manrope text.', chooseWhen: 'Software, engineering, anything precise.', risk: 'Space Grotesk is on lists of fonts that AI tools pick by default; it is distinctive but no longer rare.', patch: { fontHeading: 'space-grotesk', fontBody: 'manrope' } },
      { id: 'characterful', label: 'Lively, hand-cut headings', what: 'Bricolage Grotesque headings (lively, hand-cut) over Instrument Sans text.', chooseWhen: 'You want the headings themselves to be the personality.', risk: 'Strong flavor; it will define the brand.', patch: { fontHeading: 'bricolage-grotesque', fontBody: 'instrument-sans' } },
      { id: 'reading-serif', label: 'Letters with small feet throughout', what: 'Source Serif 4 for headings and for reading text.', chooseWhen: 'Long reading, or a deliberately traditional voice.', risk: 'Reading text in letters with small feet feels unusual in an application.', patch: { fontHeading: 'source-serif-4', fontBody: 'source-serif-4' } },
      {
        id: 'neutral-modern', label: 'Neutral and unnoticed (Inter)', what: 'Inter throughout.', chooseWhen: 'You want the letters to go unnoticed, as in a tightly packed tool.', risk: 'Inter is on published lists of looks that many AI-made pages share.',
        warn: { text: 'Inter is on published lists of looks that many AI-made pages share, so your page may look generic. “Plain and sturdy” (Public Sans) gives the same neutral feel without that sameness.', source: read(`The Impeccable rule set, as recorded in the research ("Inter everywhere"); also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { fontHeading: 'inter', fontBody: 'inter' },
      },
    ],
  },
  {
    id: 'heading-treatment',
    name: 'Heading style',
    stage: 'feel',
    title: 'How heavy and how tight are the headings?',
    teach:
      'The same letter style can whisper or shout. Two things decide which: the thickness of the letters (weight) and the space between them. In the published design rules that were read for this Studio, large headings sit slightly tighter than reading text.',
    variable: 'Thickness, letter spacing, and capital letters of the headings',
    owns: ['headingWeight', 'headingTracking', 'headingCase'],
    focus: 'top',
    thumb: { width: 760 },
    defaultOptionId: 'calm',
    tunables: [
      { key: 'headingWeight', label: 'Thickness of the letters', min: 300, max: 900, step: 50, nudge: 100, directions: ['lighter', 'heavier'] },
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
      { id: 'tight-heavy', label: 'Bold and tight', what: 'Thick strokes, letters pulled close.', chooseWhen: 'Confidence and impact.', risk: 'Tiring if every heading shouts.', patch: { headingWeight: 800, headingTracking: -0.035, headingCase: 'sentence' } },
      { id: 'calm', label: 'Medium weight', what: 'Moderate weight, slight tightening.', chooseWhen: 'A steady, professional voice.', risk: 'None in particular.', patch: { headingWeight: 600, headingTracking: -0.015, headingCase: 'sentence' } },
      { id: 'light-large', label: 'Thin and elegant', what: 'Thin strokes that rely on size for presence.', chooseWhen: 'Elegance; pairs well with letters that have small feet.', risk: 'Thin text loses contrast on some screens.', exemplar: { text: 'GitHub’s rules for its marketing pages, named Primer Brand, and IBM’s published design rules, named Carbon (large headings in thin letters)', record: R08 }, patch: { headingWeight: 400, headingTracking: -0.02, headingCase: 'sentence' } },
      { id: 'caps', label: 'ALL CAPITALS, spaced out', what: 'All capitals with widened letter spacing.', chooseWhen: 'Short labels and names; a formal or architectural feel.', risk: 'Keep headings short: longer text in capitals reads more slowly.', patch: { headingWeight: 700, headingTracking: 0.05, headingCase: 'upper' } },
    ],
  },
  {
    id: 'size-scale',
    name: 'Text size',
    stage: 'feel',
    title: 'How big is the text, and how big is the jump to headings?',
    teach:
      'Text sizes step up by a fixed multiple: each size is the one below it times the same number. A small number keeps all sizes close together, which reads as calm and compact. A large number makes headings tower over the text, which reads as dramatic.',
    variable: 'The size of reading text, and the jump from each size to the next',
    owns: ['baseSize', 'scaleRatio'],
    focus: 'top',
    defaultOptionId: 'standard',
    tunables: [
      { key: 'baseSize', label: 'Text size', min: 13, max: 22, step: 0.5, unit: 'px', nudge: 1, directions: ['smaller', 'larger'] },
      { key: 'scaleRatio', label: 'Heading size jump', min: 1.067, max: 1.62, step: 0.005, nudge: 0.04, directions: ['calmer', 'more dramatic'] },
    ],
    sources: [
      read('GOV.UK Design System: 19-pixel body text.', R08),
      read('GitHub Primer: default text size of 14 pixels and only six text sizes.', R08),
      ownerFile('Your Training Manual lists the common scale ratios (1.067 to 1.618).', R02),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
    options: [
      { id: 'dense', label: 'Small text, small headings', what: '15 px text; headings only a little larger.', chooseWhen: 'A working tool with lots of information.', risk: 'Small for older eyes on a public site.', patch: { baseSize: 15, scaleRatio: 1.2 } },
      { id: 'standard', label: 'Medium text, medium headings', what: '17 px text; clear but moderate headings.', chooseWhen: 'Most sites.', risk: 'None in particular.', patch: { baseSize: 17, scaleRatio: 1.25 } },
      { id: 'generous', label: 'Large text', what: '19 px text; moderate headings.', chooseWhen: 'A broad public, older readers, or reading on phones.', risk: 'Fewer words fit on a screen.', exemplar: { text: 'GOV.UK’s published design rules (19-pixel reading text)', record: R08 }, patch: { baseSize: 19, scaleRatio: 1.25 } },
      { id: 'dramatic', label: 'Very large headings', what: '17 px text; very large headings.', chooseWhen: 'Short pages where the headline is the design.', risk: 'Long headings wrap onto many lines.', patch: { baseSize: 17, scaleRatio: 1.42 } },
    ],
  },
  {
    id: 'numerals',
    name: 'Number style',
    stage: 'feel',
    title: 'How do numbers look?',
    teach:
      'In most fonts, a “1” is narrower than an “8”, so the digits in a column of prices do not line up. Even-width digits give every digit the same width (designers call them tabular numerals), which keeps prices, times, and phone numbers steady. Look at the price list in the preview: the digits line up, or they do not.',
    variable: 'The width and style of digits',
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
      { id: 'proportional', label: 'Natural widths', what: 'Digits keep their natural widths.', chooseWhen: 'Numbers appear only inside sentences.', risk: 'Columns and changing numbers jitter.', patch: { numerals: 'proportional' } },
      { id: 'tabular', label: 'Even-width digits', what: 'Every digit takes the same width.', chooseWhen: 'Prices, hours, phone numbers, tables. A safe default.', risk: 'None in particular.', exemplar: { text: 'Vercel’s Web Interface Guidelines, a published list of rules', record: R04 }, patch: { numerals: 'tabular' } },
      { id: 'mono', label: 'Typewriter-style digits', what: 'Numbers set in typewriter-style letters, in which every character has the same width (designers call such a font monospace).', chooseWhen: 'A technical, data-forward feel.', risk: 'Typewriter-style labels on a site for the general public are on published lists of looks that many AI-made pages share; use this style for numbers only.', patch: { numerals: 'mono' } },
    ],
  },
  {
    id: 'neutral',
    name: 'Tint of the grays',
    stage: 'feel',
    title: 'Are the grays pure, or tinted toward a color?',
    teach:
      'Most of any page is gray: the backgrounds, the lines, and the text (designers call these colors the neutrals). In the published design rules that were read for this Studio, a gray is rarely pure. A trace of blue feels cool and technical; a trace of yellow or red feels warm and human. This choice colors the whole page more than the main color does.',
    variable: 'The color and the strength of the tint in backgrounds, lines, and text',
    owns: ['neutralHue', 'neutralChroma'],
    focus: 'top',
    defaultOptionId: 'cool',
    tunables: [
      { key: 'neutralHue', label: 'Tint color', min: 0, max: 360, step: 1, unit: '°', nudge: 18 },
      { key: 'neutralChroma', label: 'Tint strength', min: 0, max: 0.04, step: 0.001, nudge: 0.004, directions: ['weaker', 'stronger'] },
    ],
    sources: [
      read('Radix Colors, Tailwind, and shadcn/ui source code: gray families that each carry a trace of one hue. Radix names its families gray, mauve, slate, sage, olive, and sand.', R08),
      builder('The assistant that wrote this Studio chose the six tints and their color values. The Radix names describe the same idea; the values were not copied or compared.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'pure', label: 'Pure gray (no tint)', what: 'No tint at all.', chooseWhen: 'The most neutral choice; it lets photographs and the main color do the work.', risk: 'Can feel sterile.', exemplar: { text: 'IBM’s published design rules, named Carbon (grays with no tint)', record: R08 }, patch: { neutralHue: 0, neutralChroma: 0 } },
      { id: 'cool', label: 'Cool gray (a trace of blue)', what: 'A trace of blue.', chooseWhen: 'Technical, clinical, or corporate subjects.', risk: 'A safe choice; it will not set you apart.', exemplar: { text: 'Radix Colors, a published set of color scales (its “slate” grays)', record: R08 }, patch: { neutralHue: 255, neutralChroma: 0.012 } },
      { id: 'warm', label: 'Warm gray (a trace of yellow-brown)', what: 'A trace of yellow-brown.', chooseWhen: 'Human, hospitable, crafted subjects.', risk: 'A cream background with letters that have small feet is on published lists of newer looks that many AI-made pages share; pair it with a bold main color or with letters without feet.', exemplar: { text: 'Radix Colors, a published set of color scales (its “sand” grays)', record: R08 }, patch: { neutralHue: 80, neutralChroma: 0.014 } },
      { id: 'sage', label: 'Green-gray', what: 'A trace of green.', chooseWhen: 'Health, outdoors, calm.', risk: 'Fights with a red or pink main color.', exemplar: { text: 'Radix Colors, a published set of color scales (its “sage” grays)', record: R08 }, patch: { neutralHue: 155, neutralChroma: 0.012 } },
      { id: 'mauve', label: 'Violet-gray', what: 'A trace of violet.', chooseWhen: 'Creative, cosmetic, or evening feel.', risk: 'Reads as cold next to warm photographs.', exemplar: { text: 'Radix Colors, a published set of color scales (its “mauve” grays)', record: R08 }, patch: { neutralHue: 310, neutralChroma: 0.012 } },
      { id: 'rose', label: 'Red-gray', what: 'A trace of red.', chooseWhen: 'Warmth with more energy than sand.', risk: 'Can look pink on some screens.', patch: { neutralHue: 25, neutralChroma: 0.013 } },
    ],
  },
  {
    id: 'accent',
    name: 'Main color',
    stage: 'feel',
    title: 'What is the one color people remember?',
    teach:
      'The main color is the one strong color on the page: it paints the buttons, the links, and the highlights (designers call it the accent color). Three values shape it: which color it is (hue), how vivid it is (chroma), and how light or dark it is. One strong color is easier to remember than several weak ones.',
    variable: 'Which color the main color is, how vivid it is, and how light it is',
    owns: ['accentHue', 'accentChroma', 'accentLightness'],
    focus: 'top',
    defaultOptionId: 'ink-blue',
    tunables: [
      { key: 'accentHue', label: 'Color (hue)', min: 0, max: 360, step: 1, unit: '°', nudge: 14 },
      { key: 'accentChroma', label: 'Vividness', min: 0, max: 0.3, step: 0.005, nudge: 0.03, directions: ['duller', 'more vivid'] },
      { key: 'accentLightness', label: 'Lightness', min: 0.25, max: 0.9, step: 0.01, nudge: 0.05, directions: ['darker', 'lighter'] },
    ],
    sources: [
      builder('The assistant that wrote this Studio selected the 13 main colors and defined them in the OKLCH color model (hue, vividness, lightness). No source supplied these values, and the notes on where each color suits are that assistant’s opinion.'),
      read(`${KREBS} names purple; ${OWNER_ANTI_SLOP} names purple-to-blue gradients.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'ink-blue', label: 'Deep blue', what: 'A deep, serious blue.', chooseWhen: 'Trust: finance, law, health.', risk: 'A safe choice; it will not set you apart.', patch: { accentHue: 258, accentChroma: 0.15, accentLightness: 0.44 } },
      { id: 'cobalt', label: 'Bright blue', what: 'A bright, electric blue.', chooseWhen: 'Energy with trust.', risk: 'Very vivid over large areas.', patch: { accentHue: 264, accentChroma: 0.22, accentLightness: 0.52 } },
      { id: 'teal', label: 'Blue-green (teal)', what: 'Blue-green, calm and clinical.', chooseWhen: 'Health, wellness, water.', risk: 'Familiar in health care, so it may not set you apart.', patch: { accentHue: 195, accentChroma: 0.09, accentLightness: 0.45 } },
      { id: 'forest', label: 'Dark green', what: 'A dark, natural green.', chooseWhen: 'Outdoors, sustainability, money.', risk: 'Dark greens can look black in small text.', patch: { accentHue: 152, accentChroma: 0.11, accentLightness: 0.4 } },
      { id: 'leaf', label: 'Bright green', what: 'A bright, fresh green that takes dark text.', chooseWhen: 'Fresh, youthful, food.', risk: 'Bright greens need dark labels on buttons.', patch: { accentHue: 135, accentChroma: 0.19, accentLightness: 0.72 } },
      { id: 'mustard', label: 'Golden yellow', what: 'A warm golden yellow that takes dark text.', chooseWhen: 'Optimistic, crafted, retro.', risk: 'Yellow links are hard to read on a light page. The Studio darkens them, though not all the way to the guideline for reading text; “Fix for me” under “Contrast checks” takes them there.', patch: { accentHue: 88, accentChroma: 0.16, accentLightness: 0.8 } },
      { id: 'tangerine', label: 'Orange', what: 'A lively orange.', chooseWhen: 'Friendly and energetic.', risk: 'Can read as "sale" or "warning".', patch: { accentHue: 52, accentChroma: 0.19, accentLightness: 0.7 } },
      { id: 'vermilion', label: 'Red-orange', what: 'A hot red-orange.', chooseWhen: 'Bold, confident, culinary.', risk: 'Reads as error color in forms; keep error states distinct.', patch: { accentHue: 32, accentChroma: 0.2, accentLightness: 0.6 } },
      { id: 'crimson', label: 'Deep red', what: 'A deep red.', chooseWhen: 'Heritage, seriousness with warmth.', risk: 'Close to error red.', patch: { accentHue: 18, accentChroma: 0.19, accentLightness: 0.47 } },
      { id: 'magenta', label: 'Pink-red (magenta)', what: 'A vivid pink-red.', chooseWhen: 'Fashion, beauty, play.', risk: 'Strong flavor; polarizing.', patch: { accentHue: 352, accentChroma: 0.22, accentLightness: 0.56 } },
      { id: 'plum', label: 'Dark purple', what: 'A dark, muted purple.', chooseWhen: 'Luxury, evening, wine.', risk: 'Can look brown in dim light.', patch: { accentHue: 325, accentChroma: 0.12, accentLightness: 0.4 } },
      {
        id: 'violet', label: 'Blue-purple (violet)', what: 'A bright blue-purple.', chooseWhen: 'Creative or technical brands that want to feel current.', risk: 'Purple and indigo are on published lists of looks that many AI-made pages share.',
        warn: { text: 'Violet and indigo are on published lists of looks that many AI-made pages share, so your page may look generic. “Dark purple” or “Bright blue” sits nearby without that sameness.', source: read(`${KREBS}, pattern "purple"; also ${OWNER_ANTI_SLOP}`, R04) },
        patch: { accentHue: 292, accentChroma: 0.2, accentLightness: 0.52 },
      },
      { id: 'graphite', label: 'Near-black (no color)', what: 'Nearly black; no color of its own.', chooseWhen: 'Let the letter style and the photographs carry the color.', risk: 'Links are harder to spot without underlines.', patch: { accentHue: 255, accentChroma: 0.015, accentLightness: 0.27 } },
    ],
  },
  {
    id: 'color-strategy',
    name: 'Amount of color',
    stage: 'feel',
    title: 'How much color, and where?',
    teach:
      'The main color can appear as a few small touches or as whole painted areas. One rule of thumb gives about 60 percent of the page to the grays, 30 percent to a second, quieter color, and 10 percent to the main color. A bold page breaks that rule on purpose.',
    variable: 'Where the main color appears, and which second color joins it',
    owns: ['colorStrategy', 'accent2Hue'],
    focus: 'top',
    defaultOptionId: 'single-accent',
    tunables: [{ key: 'accent2Hue', label: 'Second color', min: 0, max: 360, step: 1, unit: '°', nudge: 20, onlyWhen: { key: 'colorStrategy', is: 'duo' } }],
    sources: [
      ownerFile('Your Training Manual: color schemes and the 60-30-10 rule of thumb. Nobody traced the rule to an original source; your own source assessment grades the Manual D.', R02),
      builder('The assistant that wrote this Studio chose which Options to offer and wrote the notes on each.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'quiet', label: 'Color in small details only', what: 'Buttons take the color of the text; the main color appears only in links and small details.', chooseWhen: 'An understated, magazine-like, or luxury feel.', risk: 'The main button stands out less.', patch: { colorStrategy: 'quiet' } },
      { id: 'single-accent', label: 'One color on buttons and highlights', what: 'Buttons and highlights use the main color; one band of the page carries a soft tint.', chooseWhen: 'Most sites. Clear and dependable.', risk: 'The conventional choice.', patch: { colorStrategy: 'single-accent' } },
      { id: 'duo-complement', label: 'Two colors: opposites', what: 'A second color from the opposite side of the color wheel fills one band.', chooseWhen: 'Energy and contrast; playful or sporty brands.', risk: 'Opposite colors can look harsh where they touch; keep them apart.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 180 } },
      { id: 'duo-triad', label: 'Two colors: a third of the wheel apart', what: 'A second color a third of the way around the wheel fills one band.', chooseWhen: 'Colorful without clashing.', risk: 'Needs restraint elsewhere.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 120 } },
      { id: 'duo-neighbor', label: 'Two colors: neighbors', what: 'A second color, close to the main color on the color wheel, fills one band of the page.', chooseWhen: 'Rich and harmonious.', risk: 'The two can blur into one.', patch: { colorStrategy: 'duo' }, derive: { key: 'accent2Hue', from: 'accentHue', turn: 38 } },
      { id: 'tinted-surface', label: 'Whole page lightly tinted', what: 'The whole page takes a soft tint of the main color.', chooseWhen: 'A distinctive atmosphere with little effort.', risk: 'Photographs take on the tint’s mood.', patch: { colorStrategy: 'tinted-surface' } },
      { id: 'color-block', label: 'First screen painted in solid color', what: 'The first screen and one band of the page are painted solid in the main color, like a printed poster.', chooseWhen: 'Maximum boldness and recognition.', risk: 'Tiring if the main color is very vivid; hard to pair with photographs.', patch: { colorStrategy: 'color-block' } },
    ],
  },
  {
    id: 'theme',
    name: 'Light or dark',
    stage: 'feel',
    title: 'Is the page light or dark?',
    teach:
      'This Step sets whether the page is light with dark text, or dark with light text (designers call this the theme). A light page suits daytime reading and most photographs. A dark page suits evening use, entertainment, and tools that stay open for hours.',
    variable: 'Light page or dark page',
    owns: ['theme'],
    focus: 'top',
    defaultOptionId: 'light',
    sources: [
      ownerFile('Your Master Guide §13 on dark mode: "offer both; do not claim that it reduces eye strain."', R01),
      builder('This Step offers light or dark, not both; a Step for "both" is a known gap. The notes on where each suits are the opinion of the assistant that wrote this Studio.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'light', label: 'Light', what: 'A light page with dark text.', chooseWhen: 'Most sites; daytime reading; pages with many photographs.', risk: 'None in particular.', patch: { theme: 'light' } },
      { id: 'dark', label: 'Dark', what: 'A dark page with light text.', chooseWhen: 'Evening, entertainment, tools used for hours; a dramatic or technical feel.', risk: 'Photographs and logos made for light pages may clash. Near-black with one acid-bright color is on published lists of newer looks that many AI-made pages share.', patch: { theme: 'dark' } },
    ],
  },
  {
    id: 'contrast',
    name: 'Text contrast',
    stage: 'feel',
    title: 'How strongly does the text stand out from the background?',
    teach:
      'Contrast is how strongly the text and the lines stand out from the background. Low contrast feels gentle. High contrast feels sharp and stays well above the guideline for readable text. The line under the large preview gives the measured figure for reading text on the card you are looking at.',
    variable: 'How strongly text and lines stand out from the background',
    owns: ['contrast'],
    focus: 'top',
    defaultOptionId: 'crisp',
    tunables: [{ key: 'contrast', label: 'Text contrast', min: 0, max: 1, step: 0.05, nudge: 0.12, directions: ['softer', 'crisper'] }],
    sources: [
      read('WCAG 2.2, criterion 1.4.3: body text at a contrast ratio of at least 4.5 to 1, large text at least 3 to 1. The knowledge base records the criterion as read from the W3C source repository.', KB1),
      snippet('Linear’s theme model (base color, accent, contrast as three inputs). Seen as a search snippet only.', R04),
      builder('The assistant that wrote this Studio chose the three contrast levels.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'soft', label: 'Low contrast (soft)', what: 'Text and lines in gentler tones.', chooseWhen: 'Gentle, calm, low-stress pages with large text.', risk: 'Small or secondary text may fall below the 4.5 to 1 guideline; read the contrast notes.', patch: { contrast: 0.4 } },
      { id: 'balanced', label: 'Medium contrast', what: 'Between soft and crisp.', chooseWhen: 'You want calm without making the text much harder to read.', risk: 'None in particular.', patch: { contrast: 0.65 } },
      { id: 'crisp', label: 'High contrast (crisp)', what: 'Near-black text on a light page, or bright text on a dark page, with clear lines.', chooseWhen: 'Most sites; text that is easy to read in most conditions.', risk: 'None in particular.', patch: { contrast: 0.85 } },
    ],
  },
  {
    id: 'atmosphere',
    name: 'Background at the top of the page',
    stage: 'feel',
    title: 'What sits behind the first screen?',
    teach:
      'This Step sets what sits behind the words on the first screen: nothing, a faint grid, a soft glow, or a fine grain like film. The background sets a mood before anyone reads. In the open-source code that was studied for this Studio, these backgrounds stay faint: a grid shows at 5 to 20 percent strength and fades out at the edges. Turned up loud, the same background is on published lists of looks that many AI-made pages share.',
    variable: 'The background of the first screen',
    owns: ['atmosphere'],
    focus: 'top',
    thumb: { width: 900 },
    defaultOptionId: 'plain',
    sources: [
      read('Background recipes in open-source code: Once UI and Magic UI (dot and line grids under a fading mask), ray.so (a spotlight glow), the cmdk website (an aurora), Open Props (grain). An AI research assistant read the source files for this Studio; no person has reviewed its record yet.', R09),
      builder('The assistant that wrote this Studio made “Field of stars” at the owner’s request on 2026-11-13 (decision D42). No source was read for it.'),
      builder('The assistant that wrote this Studio made the Studio’s own backgrounds before that record existed. They use the same techniques, not the recorded values.'),
      read(`${KREBS} names decorative gradients.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'plain', label: 'Plain background', what: 'A clean, flat background.', chooseWhen: 'The letter style and the content are strong enough alone.', risk: 'None in particular.', exemplar: { text: 'GOV.UK’s published design rules', record: R08 }, patch: { atmosphere: 'plain' } },
      { id: 'horizon', label: 'Faint fade of color', what: 'A faint tint of the main color that fades down the first screen.', chooseWhen: 'A gentle lift without any pattern.', risk: 'Too strong a tint looks like a stock blend of colors.', patch: { atmosphere: 'horizon' } },
      { id: 'dot-grid', label: 'Dot grid', what: 'A field of tiny dots that fades toward the edges.', chooseWhen: 'A technical, drafting-table feel.', risk: 'Dots under reading text make it harder to read; the fade keeps them behind the headline only.', exemplar: { text: 'Once UI and Magic UI, two open-source projects whose code was read', record: R09 }, patch: { atmosphere: 'dot-grid' } },
      { id: 'line-grid', label: 'Line grid', what: 'Faint grid lines, like graph paper, fading toward the edges.', chooseWhen: 'Engineering, architecture, planning.', risk: 'Lines compete with thin letters.', exemplar: { text: 'Magic UI, an open-source project whose code was read (its “retro grid”)', record: R09 }, patch: { atmosphere: 'line-grid' } },
      { id: 'spotlight', label: 'Soft glow from the top', what: 'A soft glow of the main color from the top center, like stage light.', chooseWhen: 'Focus and drama, especially on dark pages.', risk: 'On light pages it must stay faint.', exemplar: { text: 'ray.so, an open-source website whose code was read', record: R09 }, patch: { atmosphere: 'spotlight' } },
      {
        id: 'aurora', label: 'Soft clouds of color', what: 'Two or three soft clouds of related color behind the headline.', chooseWhen: 'A rich, atmospheric first impression.', risk: 'Purple-and-blue clouds of color are on published lists of looks that many AI-made pages share; the effect works when the colors come from your own main color.',
        warn: { text: 'Soft clouds of several colors are on published lists of looks that many AI-made pages share, so your page may look generic. They read as intended only when the colors are your own and stay soft. “Soft glow from the top” or “Faint fade of color” gives depth with one color.', source: ownerFile(`Your Training Manual labels aurora and mesh gradients "the AI default look"; ${KREBS} names decorative gradients.`, R02) },
        exemplar: { text: 'The cmdk website (open-source code)', record: R09 },
        patch: { atmosphere: 'aurora' },
      },
      { id: 'stars', label: 'Field of stars', what: 'Small dots of three sizes, scattered like stars, over a faint glow of the main color.', chooseWhen: 'Night, space, and wonder; made for a dark page.', risk: 'On a light page the stars turn into dark specks, which can look like dust. The stars are small and few, but some sit behind the headline and behind the first lines of text; they fade out toward the bottom of the first screen. The contrast checks do not measure text over a star.', patch: { atmosphere: 'stars' } },
      { id: 'grain', label: 'Fine grain texture', what: 'A fine speckle over the whole page, like paper or film.', chooseWhen: 'Warmth, print, craft; softens flat color.', risk: 'Too much grain looks dirty; costs a little rendering speed.', exemplar: { text: 'Open Props, an open-source project whose code was read (its noise textures)', record: R09 }, patch: { atmosphere: 'grain' } },
    ],
  },
  {
    id: 'radius',
    name: 'Corners',
    stage: 'feel',
    title: 'How rounded are the corners?',
    teach:
      'This Step sets how rounded the corners of buttons and boxes are (designers call the amount the corner radius). Square corners feel precise and serious; round corners feel friendly. The Studio keeps your choice the same everywhere, and it rounds a box a little more than the buttons inside it, so that the two curves look parallel.',
    variable: 'How rounded the corners of buttons and boxes are',
    owns: ['radius'],
    focus: 'contact',
    thumb: { width: 440 },
    defaultOptionId: 'subtle',
    tunables: [{ key: 'radius', label: 'Corner rounding', min: 0, max: 28, step: 1, unit: 'px', nudge: 3, directions: ['sharper', 'rounder'] }],
    sources: [
      read('The concentric radius rule: Vercel Web Interface Guidelines and Jakub Krehel’s rules.', R04),
      builder('The Studio rounds a box one and a half times as much as the buttons inside it. The exact rule adds the gap between box and button to the rounding of the button; the Studio comes close to that rule and does not follow it exactly. Small parts get half the rounding of a button. With “Fully round (pill shape)”, buttons and small parts are fully round and boxes get corners of 28 pixels.'),
      read('Shape values in open design systems: controls at 4 to 8 pixels and cards at 8 to 14 pixels; square corners in IBM Carbon and GOV.UK; pill buttons in Material 3 and Radix Themes.', R08),
      ownerFile('Your files list "broadsheet hairlines with zero radius" among five newer AI-default looks.', R01),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'square', label: 'Square corners', what: 'No rounding.', chooseWhen: 'A magazine-like, architectural, or serious feel.', risk: 'Square corners with very thin lines everywhere are on a published list of newer looks that many AI-made pages share.', exemplar: { text: 'IBM’s published design rules, named Carbon, and GOV.UK’s (square corners)', record: R08 }, patch: { radius: 0 } },
      { id: 'crisp', label: 'Barely rounded (3 px)', what: '3 pixels: barely softened.', chooseWhen: 'Precise and professional.', risk: 'None in particular.', exemplar: { text: 'GitHub’s published design rules, named Primer (3 pixels is its “small” rounding)', record: TOKENS }, patch: { radius: 3 } },
      { id: 'subtle', label: 'Slightly rounded (8 px)', what: '8 pixels.', chooseWhen: 'A neutral, current look.', risk: 'A common choice; it will not set you apart.', exemplar: { text: 'Material 3, a published set of design rules (8 pixels is one of its corner steps)', record: R08 }, patch: { radius: 8 } },
      { id: 'soft', label: 'Clearly rounded (14 px)', what: '14 pixels: clearly rounded.', chooseWhen: 'Friendly and approachable.', risk: 'Very round corners on small things look bubbly.', patch: { radius: 14 } },
      { id: 'pill', label: 'Fully round (pill shape)', what: 'Fully rounded buttons; generously rounded boxes.', chooseWhen: 'A playful feel; products for the general public; pages used mostly on phones.', risk: 'Pills waste horizontal space and suit short labels only.', exemplar: { text: 'Material 3, a published set of design rules, and Radix Themes, an open-source set of interface parts (pill-shaped buttons)', record: R08 }, patch: { radius: 999 } },
    ],
  },
  {
    id: 'elevation',
    name: 'Box edges and shadows',
    stage: 'feel',
    title: 'How do boxes stand apart from the page?',
    teach:
      'A box stands apart from the page by a line around it, a shadow under it, or a different shade of its own (designers call this elevation). In the published design rules that were studied for this Studio, a good shadow is made of several very faint shadows, plus a thin outline that you barely notice. One identical gray blur under every box is on published lists of looks that many AI-made pages share.',
    variable: 'What sets a box apart: a line, a shadow, or a shade',
    owns: ['elevation'],
    focus: 'about',
    thumb: { width: 440 },
    defaultOptionId: 'borders',
    sources: [
      read('Vercel Web Interface Guidelines: at least two shadow layers.', R04),
      read('Radix Themes, GitHub Primer, HeroUI, and Magic UI source code, and Jakub Krehel’s rules: a one-pixel translucent ring as the first shadow layer.', R08),
      snippet('Josh Comeau on layered shadows. Seen as a search snippet only; his site did not load.', R04),
      builder('“Solid offset shadow (sticker)” follows the neo-brutalist fashion as the assistant that wrote this Studio knows it; no source was read for it.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'flat', label: 'Tinted boxes, no lines', what: 'Boxes are a slightly different tone; no lines, no shadows.', chooseWhen: 'Calm and modern.', risk: 'Boxes can disappear on poor screens.', patch: { elevation: 'flat' } },
      { id: 'borders', label: 'Thin outlines', what: 'Thin outlines; no shadows.', chooseWhen: 'Crisp, technical, dependable.', risk: 'Many outlines get busy.', patch: { elevation: 'borders' } },
      { id: 'ring', label: 'Thin outline with a faint shadow', what: 'A one-pixel ring with a barely visible shadow: a crisp edge that looks machined.', chooseWhen: 'Precise, modern, technical.', risk: 'Very quiet; needs good spacing to carry the layout.', exemplar: { text: 'Radix Themes, an open-source set of interface parts, and GitHub’s published design rules, named Primer (a one-pixel ring under every shadow)', record: R08 }, patch: { elevation: 'ring' } },
      { id: 'soft-shadow', label: 'Soft shadow', what: 'Boxes float on a gentle, tinted, three-layer shadow.', chooseWhen: 'A friendly sense of depth, as in products for the general public.', risk: 'Looks generic if every element floats; keep it for a few.', exemplar: { text: 'Radix Themes, an open-source set of interface parts (three to five faint layers in each shadow)', record: R09 }, patch: { elevation: 'soft-shadow' } },
      { id: 'float', label: 'Large soft shadow (floating)', what: 'Wide, soft, layered shadows: boxes hover well above the page.', chooseWhen: 'A calm, premium, product-showcase feel, for a few showcase panels.', risk: 'In the open-source code that was studied for this Studio, wide soft shadows sit under floating menus, not under boxes at rest. Crowded floating boxes look heavy.', patch: { elevation: 'float' } },
      { id: 'hard-shadow', label: 'Solid offset shadow (sticker)', what: 'A solid block of shadow with thick outlines, like a sticker.', chooseWhen: 'Bold, playful, poster-like (the style called neo-brutalism).', risk: 'A strong fashion; dates quickly.', patch: { elevation: 'hard-shadow' } },
      { id: 'glass', label: 'Frosted glass', what: 'See-through boxes that blur what is behind them, with a bright top edge. The menu stays in view and frosts over the page.', chooseWhen: 'Depth and atmosphere; pairs with “Soft glow from the top” or “Soft clouds of color” behind the first screen.', risk: 'Needs color behind it to read as glass, and slows drawing a little on old devices. In the open-source code that was studied for this Studio, glass appears only on floating bars such as toolbars.', patch: { elevation: 'glass' } },
      { id: 'tonal', label: 'Darker boxes with a light top edge', what: 'Boxes are a deeper tone with a faint top highlight, like a pressed panel.', chooseWhen: 'Dark pages and instrument-panel styles.', risk: 'Subtle on light pages.', exemplar: { text: 'coss ui, the design rules of Cal.com, on dark pages (boxes get lighter as they rise)', record: R09 }, patch: { elevation: 'tonal' } },
    ],
  },
  {
    id: 'border-weight',
    name: 'Line thickness',
    stage: 'feel',
    title: 'How thick are the lines?',
    teach:
      'Lines divide the page and outline its boxes and form fields. A very thin line nearly disappears and feels refined. A thick line is bold and makes form fields very easy to see.',
    variable: 'The thickness of dividing lines and outlines',
    owns: ['borderWeight'],
    // The price list has dividing lines in every layout, so the change always shows there.
    focus: 'fees',
    thumb: { width: 440 },
    defaultOptionId: 'hairline',
    tunables: [{ key: 'borderWeight', label: 'Line thickness', min: 0, max: 4, step: 0.5, unit: 'px', nudge: 0.5, directions: ['thinner', 'thicker'] }],
    sources: [
      read('GOV.UK Design System: 2-pixel form borders.', R04),
      read('coss ui and Radix Themes source code: thin translucent edges (black at 8 percent on light pages in coss ui). An AI research assistant read the source files for this Studio; no person has reviewed its record yet.', R09),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'No dividing lines', what: 'Page dividers vanish; inputs keep a thin outline.', chooseWhen: 'Spacing alone should organize the page.', risk: 'Sections can run together.', patch: { borderWeight: 0 } },
      { id: 'hairline', label: 'Thin lines (1 px)', what: '1 pixel.', chooseWhen: 'A refined, quiet page.', risk: 'None in particular.', exemplar: { text: 'coss ui, the design rules of Cal.com, and Radix Themes, an open-source set of interface parts (thin see-through edges)', record: R09 }, patch: { borderWeight: 1 } },
      { id: 'medium', label: 'Medium lines (2 px)', what: '2 pixels.', chooseWhen: 'Clear, sturdy form fields that are easy to see.', risk: 'Heavier look.', exemplar: { text: 'GOV.UK’s published design rules (2-pixel borders on form fields)', record: R04 }, patch: { borderWeight: 2 } },
      { id: 'bold', label: 'Thick lines (3 px)', what: '3 pixels.', chooseWhen: 'Graphic, poster-like styles.', risk: 'Overpowers delicate letter styles.', patch: { borderWeight: 3 } },
    ],
  },
  {
    id: 'button-finish',
    name: 'Button style',
    stage: 'feel',
    title: 'How does the main button look?',
    teach:
      'The main button is the one you most want visitors to press, so its look matters. A solid-color button is plain and quiet. A glossy button imitates light falling from above (a lighter top edge, a darker ring, a soft shadow), which makes it look pressable. The button should match how the boxes on the page are made.',
    variable: 'The look of the main button',
    owns: ['buttonFinish'],
    focus: 'top',
    thumb: { width: 440 },
    defaultOptionId: 'flat',
    sources: [
      read('Button recipes in open-source code: Radix Themes (solid and "classic" beveled buttons), coss ui (a lit top edge; an outline button), HeroUI (a colored shadow), ray.so (a tinted button). An AI research assistant read the source files for this Studio; no person has reviewed its record yet.', R09),
      builder('The assistant that wrote this Studio made the Studio’s own button styles before that record existed. They use the same techniques, not the recorded values.'),
      read(`${KREBS} names colored glow.`, R04),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'flat', label: 'Solid color', what: 'One solid color.', chooseWhen: 'A clean, plain, magazine-like feel.', risk: 'None in particular.', exemplar: { text: 'Radix Themes, an open-source set of interface parts (its “solid” button)', record: R09 }, patch: { buttonFinish: 'flat' } },
      { id: 'gloss', label: 'Glossy (lit from above)', what: 'A lighter top, a bright inner edge, a fine dark ring, and a tinted shadow beneath.', chooseWhen: 'A tactile, well-made, premium feel.', risk: 'Overdone gloss looks dated; this finish keeps it subtle.', exemplar: { text: 'Radix Themes, an open-source set of interface parts (its “classic” button), and coss ui, the design rules of Cal.com (its default button)', record: R09 }, patch: { buttonFinish: 'gloss' } },
      { id: 'glow', label: 'Glowing', what: 'A solid button that casts a soft halo of its own color.', chooseWhen: 'Dark pages; one action that must draw the eye.', risk: 'A colored glow on everything is on published lists of looks that many AI-made pages share; keep it to this one button.', exemplar: { text: 'HeroUI, an open-source project whose code was read (its “shadow” button)', record: R09 }, patch: { buttonFinish: 'glow' } },
      { id: 'outline', label: 'Outline only', what: 'No fill: a colored outline and colored label.', chooseWhen: 'Understated pages where the button should not dominate.', risk: 'The main action stands out less.', exemplar: { text: 'coss ui, the design rules of Cal.com (its “outline” button)', record: R09 }, patch: { buttonFinish: 'outline' } },
      { id: 'soft', label: 'Pale tint', what: 'A pale tint of the main color with a colored label.', chooseWhen: 'Gentle, friendly, low-pressure.', risk: 'Can look disabled if the tint is too pale.', exemplar: { text: 'ray.so, an open-source website whose code was read (its tinted button)', record: R09 }, patch: { buttonFinish: 'soft' } },
    ],
  },
  {
    id: 'display-treatment',
    name: 'Headline color',
    stage: 'feel',
    title: 'Is the big headline one color, or a blend of colors?',
    teach:
      'Large letters can carry more than one flat color. A subtle fade (full strength at the top, slightly weaker toward the bottom) gives a headline a sheen. A blend from one color into another is called a gradient. A loud two-color gradient is on published lists of looks that many AI-made pages share.',
    variable: 'The coloring of the largest headline',
    owns: ['displayTreatment'],
    focus: 'top',
    thumb: { width: 760 },
    defaultOptionId: 'solid',
    sources: [
      read('Headline recipes in open-source code: Supabase (".heading-gradient") and the React Email site (".text-gradient"). An AI research assistant read the source files for this Studio; no person has reviewed its record yet.', R09),
      ownerFile('Your Anti-Slop Checklist lists gradient text among the signs of AI-default design.', R02),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'solid', label: 'One color', what: 'One color.', chooseWhen: 'Always safe; lets the letter style speak.', risk: 'None in particular.', patch: { displayTreatment: 'solid' } },
      { id: 'ink-gradient', label: 'Subtle fade, top to bottom', what: 'Full ink at the top fading slightly toward the bottom.', chooseWhen: 'Large, heavy headlines; modern product pages.', risk: 'Invisible on small or thin letters.', exemplar: { text: 'The Supabase website and the React Email website (open-source code)', record: R09 }, patch: { displayTreatment: 'ink-gradient' } },
      {
        id: 'accent-gradient', label: 'Two-color gradient', what: 'The headline blends from the main color into a neighboring color.', chooseWhen: 'A deliberately vivid, energetic brand.', risk: 'A headline that blends two colors is on published lists of looks that many AI-made pages share.',
        warn: { text: 'A headline that blends two colors is on published lists of looks that many AI-made pages share, so your page may look generic. “Subtle fade, top to bottom” gives depth without it.', source: ownerFile('Your Anti-Slop Checklist ("gradient text"). The finish-recipes record describes when gradient text reads as a cliché.', R02) },
        patch: { displayTreatment: 'accent-gradient' },
      },
    ],
  },
  {
    id: 'signature',
    name: 'One special touch',
    stage: 'feel',
    title: 'Which one decoration makes the page memorable?',
    teach:
      'The special touch is the one thing that a visitor would describe to a friend. Choose one, and spend your bold choices in that one place only. Boldness in a single spot reads as confidence; boldness everywhere reads as noise.',
    variable: 'The one decoration that sets the page apart',
    owns: ['signature'],
    focus: 'top',
    defaultOptionId: 'none',
    sources: [
      ownerFile('Your Anti-Slop Checklist: "Bold choices spent in one place only"; it also lists "01/02/03 on non-sequences" as a sign of AI-default design.', R02),
      ownerFile('The phrase "one orchestrated moment beats scattered effects" reaches this project through your Training Manual, which quotes Anthropic’s frontend-design skill second-hand.', R02),
      builder('The assistant that wrote this Studio selected the six special touches.'),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'No special touch', what: 'No decoration; the letter style and the color carry the page.', chooseWhen: 'The earlier Decisions are already bold.', risk: 'May be forgettable if the earlier Decisions were all safe.', patch: { signature: 'none' } },
      { id: 'marker', label: 'Highlighter stroke on a phrase', what: 'A highlighter stroke behind the key phrase of the headline.', chooseWhen: 'One phrase carries the promise.', risk: 'Only works with a phrase worth marking.', patch: { signature: 'marker' } },
      { id: 'big-numerals', label: 'Large numbers beside the services', what: 'Oversized numbers beside each service.', chooseWhen: 'The items form a real sequence or a short, countable set.', risk: 'Numbers on things that have no order are on published lists of looks that many AI-made pages share.', focus: 'services', patch: { signature: 'big-numerals' } },
      { id: 'color-band', label: 'Solid color band of facts', what: 'The strip of facts becomes a full-width band of solid main color with large figures.', chooseWhen: 'You have true, strong facts.', risk: 'Draws all attention to the numbers; they must be real.', focus: 'facts', patch: { signature: 'color-band' } },
      { id: 'outline-type', label: 'Outlined phrase in the headline', what: 'The key phrase of the headline appears as an outline only.', chooseWhen: 'Very large headlines in thick letters.', risk: 'Hard to read at small sizes and in thin letters.', patch: { signature: 'outline-type' } },
      { id: 'corner-tag', label: 'Tilted label', what: 'The small label above the headline becomes a tilted colored tag.', chooseWhen: 'A touch of informality or craft.', risk: 'Too casual for formal subjects.', patch: { signature: 'corner-tag' } },
    ],
  },
  {
    id: 'motion',
    name: 'Motion',
    stage: 'feel',
    title: 'How much does the page move?',
    teach:
      'Motion explains change: where something came from, and that a press registered. In the published rule lists that were read for this Studio, motion on a page lasts less than about a third of a second, starts quickly and settles gently, and gets shorter the more often a person sees it. “Entrance animation” runs longer on purpose (about half a second, once, at the top of the page). Every Option stops moving for a visitor whose device asks for less motion. To watch an Option, press “Play the entrance again” above the large preview; with a mouse, also move the pointer over a button to see it react.',
    variable: 'How much the page moves, and in what manner',
    owns: ['motion'],
    focus: 'top',
    thumb: { note: 'A still picture cannot show motion. Use the large preview: press “Play the entrance again”, or move the pointer over a button.' },
    defaultOptionId: 'subtle',
    sources: [
      read('Emil Kowalski’s and Jakub Krehel’s motion rules: the amount of animation follows how often a person sees it; interface motion in general stays under 300 milliseconds.', R04),
      read('IBM Carbon motion tokens: a "productive" and an "expressive" mood, with six durations from 70 to 700 milliseconds.', R08),
      read('WCAG 2.2, criterion 2.3.3 (animation from interactions) and the "prefers-reduced-motion" setting. The knowledge base records both as read from the W3C and MDN source repositories.', KB1),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
    options: [
      { id: 'none', label: 'No motion', what: 'Everything changes instantly.', chooseWhen: 'Tools used hundreds of times a day; maximum speed.', risk: 'Abrupt on a marketing page.', patch: { motion: 'none' } },
      { id: 'subtle', label: 'Small, quick motion', what: 'Quick, quiet responses: buttons press in, colors ease on hover.', chooseWhen: 'Most sites. Responsive without drawing attention.', risk: 'None in particular.', patch: { motion: 'subtle' } },
      { id: 'expressive', label: 'Entrance animation', what: 'The first screen rises into place in sequence; boxes lift on hover.', chooseWhen: 'Pages seen rarely, where a moment of delight is welcome.', risk: 'Sections that fade in and rise, one after another down the page, are on published lists of looks that many AI-made pages share; here the effect happens once, at the top.', patch: { motion: 'expressive' } },
    ],
  },
];

const STEP_TABLE = new Map<string, Step>(STEPS.map((s) => [s.id, s]));

/** Find a Step by its identifier. Returns `undefined` for anything that is not a Step, including names of built-in object members. */
export function findStep(id: string): Step | undefined {
  return STEP_TABLE.get(id);
}
