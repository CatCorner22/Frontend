// Rules about how Decisions fit together. Each rule is a Catalog record (hard rule 5): plain text, a source, an evidence grade, a review date.
// The test that decides whether a rule applies lives in the engine, keyed by the rule's identifier; a unit test holds the two lists together.
//
// A conflict rule flags a clash between Decisions. It never changes a Decision.
// A harmony rule adjusts a generated Direction (never the owner's own Decisions), so that a random combination stays coherent.

import type { RuleRecord, SourceRef } from './types.js';

const REVIEWED = '2026-11-13';
const R01 = 'docs/research/01-your-files-master-guide-blueprint-guardrails.md';
const R04 = 'docs/research/04-best-human-built-frontends.md';
const R08 = 'docs/research/08-high-end-codebases.md';

const seen: SourceRef = { text: 'The builder saw this in rendered Mockups. No outside source was consulted.', basis: 'builder' };
const byDesign: SourceRef = { text: 'This follows from how the tool draws the element. No outside source was consulted.', basis: 'builder' };

export const CONFLICT_RULES: RuleRecord[] = [
  { id: 'outline-thin', kind: 'conflict', stepIds: ['signature', 'heading-treatment'], text: 'An outlined phrase needs a heavy heading weight to stay readable. Raise the weight to 600 or more, or pick another signature.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'marker-gray', kind: 'conflict', stepIds: ['signature', 'accent', 'color-strategy'], text: 'The marker highlight uses the accent color, and the accent is nearly gray, so the highlight will barely show.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'statement-emphasis', kind: 'conflict', stepIds: ['hero', 'emphasis'], text: 'The statement opening exists to make the headline dominant, but another element is set to be found first. The two Decisions pull against each other.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'narrow-split', kind: 'conflict', stepIds: ['content-width', 'hero'], text: 'A narrow page leaves too little room for text and a photo side by side. Pick a wider page, or an opening without the photo.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'caps-dramatic', kind: 'conflict', stepIds: ['heading-treatment', 'size-scale'], text: 'Capital letters at a dramatic size fill the screen. Pick a calmer size jump, or sentence case.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'outline-delicate', kind: 'conflict', stepIds: ['signature', 'typeface'], text: 'An outlined phrase breaks apart in a delicate serif. Pick a sturdy sans-serif heading, or the marker highlight.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'sticker-finish', kind: 'conflict', stepIds: ['button-finish', 'elevation'], text: 'The hard offset shadow gives buttons a sticker edge, which replaces the gloss or glow. Pick a flat button, or a different way of separating boxes.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'sheen-thin', kind: 'conflict', stepIds: ['display-treatment', 'heading-treatment'], text: 'The ink sheen barely shows on thin headings. Raise the heading weight, or keep the headline solid.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  {
    id: 'purple-aurora', kind: 'conflict', stepIds: ['atmosphere', 'accent', 'theme'],
    text: 'A purple aurora on a dark page combines two listed signs of AI-default design. Another accent hue, or the spotlight, will set the page apart.',
    source: { text: 'Adrian Krebs’s ai-design-checker names purple and decorative gradients; your Training Manual labels aurora gradients "the AI default look".', basis: 'read', record: R04 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'dark-shadow', kind: 'conflict', stepIds: ['theme', 'elevation'],
    text: 'Soft shadows show weakly on a dark page. The tool makes them several times stronger there, as some of the open design systems that were read do; others replace the shadow with a light ring. If the boxes do not stand apart in the preview, pick "Tonal with highlight" or "Lines".',
    source: { text: 'Open design systems disagree on shadows in dark mode: Radix, HeroUI, and Primer strengthen them; Jakub Krehel and Magic UI replace them with a light ring.', basis: 'read', record: R08 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'cream-serif', kind: 'conflict', stepIds: ['typeface', 'neutral', 'theme'],
    text: 'A warm serif on a cream page is on published lists of newer AI-default looks. A bolder accent, a cooler neutral, or the color-block strategy will set the page apart.',
    source: { text: 'The research record notes that anti-default lists name "cream page plus serif plus terracotta" as a new cliché; your own files list the same cluster.', basis: 'read', record: R04 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'black-acid', kind: 'conflict', stepIds: ['theme', 'contrast', 'accent'],
    text: 'Near-black with one acid-green accent is on published lists of newer AI-default looks.',
    source: { text: 'Your own files list "near-black + acid-green or vermilion accent" among five newer AI-default looks.', basis: 'owner-file', record: R01 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
];

const taste: SourceRef = { text: 'The builder’s judgment, formed on rendered Mockups. No outside source was consulted.', basis: 'builder' };
const h = (id: string, stepIds: string[], text: string): RuleRecord => ({ id, kind: 'harmony', stepIds, text, source: taste, evidence: 'expert-opinion', reviewed: REVIEWED });

export const HARMONY_RULES: RuleRecord[] = [
  h('painted-first-screen', ['color-strategy', 'atmosphere', 'display-treatment'], 'A painted first screen is already loud, so the generator keeps its background plain and its headline solid.'),
  h('glow-on-light', ['button-finish', 'theme'], 'A glowing button reads on a dark page. On a light page the generator uses the gloss finish for the same job.'),
  h('sticker-owns-buttons', ['elevation', 'button-finish', 'border-weight'], 'The hard offset shadow gives buttons their own edge and wants thick lines, so the generator sets a flat button and lines of 2 pixels or more.'),
  h('dark-soft-shadow', ['theme', 'elevation'], 'On a dark page the generator replaces soft and floating shadows with tonal surfaces, which separate boxes more dependably there.'),
  h('thin-outline', ['heading-treatment', 'signature'], 'A thin heading cannot carry an outlined phrase, so the generator uses the marker highlight.'),
  h('thin-sheen', ['heading-treatment', 'display-treatment'], 'The ink sheen does not show on a thin heading, so the generator keeps the headline solid.'),
  h('statement-headline', ['hero', 'emphasis'], 'The statement opening exists for the headline, so the generator makes the headline the emphasis.'),
  h('narrow-page', ['content-width', 'hero', 'nav', 'sections'], 'A narrow page has no room for text beside a photo, for a side rail, or for the bento and alternating layouts, so the generator simplifies them.'),
  h('capitals-restraint', ['heading-treatment', 'size-scale', 'hero'], 'Capital letters need restraint, so the generator caps the size jump and avoids the statement opening.'),
  h('delicate-outline', ['typeface', 'signature'], 'An outlined phrase breaks apart in a delicate serif, so the generator uses the marker highlight.'),
  h('dense-motion', ['density', 'motion'], 'A dense layout suits a working tool, which should not animate its entrance, so the generator uses subtle motion.'),
];

export const RULES: RuleRecord[] = [...CONFLICT_RULES, ...HARMONY_RULES];
