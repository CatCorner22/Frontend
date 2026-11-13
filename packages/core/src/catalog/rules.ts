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

const seen: SourceRef = { text: 'The assistant that wrote this Studio saw this in rendered Mockups. No outside source was consulted.', basis: 'builder' };
const byDesign: SourceRef = { text: 'This follows from how the Studio draws the element. No outside source was consulted.', basis: 'builder' };

export const CONFLICT_RULES: RuleRecord[] = [
  { id: 'outline-thin', kind: 'conflict', stepIds: ['signature', 'heading-treatment'], text: '“Outlined phrase in the headline” needs thick heading letters to stay readable. On the Step “Heading style”, raise “Thickness of the letters” to 600 or more, or pick another Option on the Step “One special touch”.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'marker-gray', kind: 'conflict', stepIds: ['signature', 'accent', 'color-strategy'], text: '“Highlighter stroke on a phrase” uses the main color, and the main color is nearly gray, so the stroke will barely show.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'statement-emphasis', kind: 'conflict', stepIds: ['hero', 'emphasis'], text: '“Very large headline” exists to make the headline stand out first, but the Step “What stands out first” is set to something else. The two Decisions pull against each other.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'narrow-split', kind: 'conflict', stepIds: ['content-width', 'hero'], text: 'A “Narrow” page leaves too little room for “Text and photo side by side”. Pick a wider page, or a first screen without the photo.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'caps-dramatic', kind: 'conflict', stepIds: ['heading-treatment', 'size-scale'], text: 'Headings in capital letters at a very large size fill the screen. Pick a smaller “Heading size jump”, or headings without all capitals.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'outline-delicate', kind: 'conflict', stepIds: ['signature', 'typeface'], text: '“Outlined phrase in the headline” breaks apart in delicate letters with small feet. Pick a sturdy letter style without feet for the headings, or “Highlighter stroke on a phrase”.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'sticker-finish', kind: 'conflict', stepIds: ['button-finish', 'elevation'], text: '“Solid offset shadow (sticker)” gives buttons a sticker edge, which replaces the gloss or the glow. Pick “Solid color” on the Step “Button style”, or another Option on the Step “Box edges and shadows”.', source: byDesign, evidence: 'expert-opinion', reviewed: REVIEWED },
  { id: 'sheen-thin', kind: 'conflict', stepIds: ['display-treatment', 'heading-treatment'], text: '“Subtle fade, top to bottom” barely shows on thin headings. Raise “Thickness of the letters” on the Step “Heading style”, or pick “One color” for the headline.', source: seen, evidence: 'expert-opinion', reviewed: REVIEWED },
  {
    id: 'purple-aurora', kind: 'conflict', stepIds: ['atmosphere', 'accent', 'theme'],
    text: 'Purple “Soft clouds of color” on a dark page combine two looks that are on published lists of looks that many AI-made pages share. Another main color, or “Soft glow from the top”, will set the page apart.',
    source: { text: 'Adrian Krebs’s ai-design-checker names purple and decorative gradients; your Training Manual labels aurora gradients "the AI default look".', basis: 'read', record: R04 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'dark-shadow', kind: 'conflict', stepIds: ['theme', 'elevation'],
    text: 'Soft shadows show weakly on a dark page. The Studio makes them several times stronger there, as some of the published design rules that were read for this Studio do; others replace the shadow with a light ring. If the boxes do not stand apart in the preview, pick “Darker boxes with a light top edge” or “Thin outlines”.',
    source: { text: 'Open design systems disagree on shadows in dark mode: Radix, HeroUI, and Primer strengthen them; Jakub Krehel and Magic UI replace them with a light ring.', basis: 'read', record: R08 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'cream-serif', kind: 'conflict', stepIds: ['typeface', 'neutral', 'theme'],
    text: 'Warm letters with small feet on a cream page are on published lists of newer looks that many AI-made pages share. A bolder main color, a cooler tint of the grays, or “First screen painted in solid color” will set the page apart.',
    source: { text: 'The research record notes that anti-default lists name "cream page plus serif plus terracotta" as a new cliché; your own files list the same cluster.', basis: 'read', record: R04 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
  {
    id: 'black-acid', kind: 'conflict', stepIds: ['theme', 'contrast', 'accent'],
    text: 'A near-black page with one acid-green main color is on published lists of newer looks that many AI-made pages share.',
    source: { text: 'Your own files list "near-black + acid-green or vermilion accent" among five newer AI-default looks.', basis: 'owner-file', record: R01 },
    evidence: 'expert-opinion', reviewed: REVIEWED,
  },
];

const taste: SourceRef = { text: 'The judgment of the assistant that wrote this Studio, formed on rendered Mockups. No outside source was consulted.', basis: 'builder' };
const h = (id: string, stepIds: string[], text: string): RuleRecord => ({ id, kind: 'harmony', stepIds, text, source: taste, evidence: 'expert-opinion', reviewed: REVIEWED });

export const HARMONY_RULES: RuleRecord[] = [
  h('painted-first-screen', ['color-strategy', 'atmosphere', 'display-treatment'], 'A painted first screen is already loud, so the generator keeps its background plain and its headline in one color.'),
  h('glow-on-light', ['button-finish', 'theme'], 'A glowing button shows well on a dark page. On a light page the generator uses “Glossy (lit from above)” for the same job.'),
  h('sticker-owns-buttons', ['elevation', 'button-finish', 'border-weight'], '“Solid offset shadow (sticker)” gives buttons their own edge and wants thick lines, so the generator sets a “Solid color” button and lines of 2 pixels or more.'),
  h('dark-soft-shadow', ['theme', 'elevation'], 'On a dark page the generator replaces soft and floating shadows with “Darker boxes with a light top edge”, which sets boxes apart more dependably there.'),
  h('thin-outline', ['heading-treatment', 'signature'], 'Thin heading letters cannot carry “Outlined phrase in the headline”, so the generator uses “Highlighter stroke on a phrase”.'),
  h('thin-sheen', ['heading-treatment', 'display-treatment'], '“Subtle fade, top to bottom” does not show on thin headings, so the generator keeps the headline in one color.'),
  h('statement-headline', ['hero', 'emphasis'], '“Very large headline” exists for the headline, so the generator makes the headline the thing that stands out first.'),
  h('narrow-page', ['content-width', 'hero', 'nav', 'sections'], 'A narrow page has no room for text beside a photo, for “Links in a left column”, or for “One large box, smaller boxes beside it” and “Alternating photo and text”, so the generator simplifies them.'),
  h('capitals-restraint', ['heading-treatment', 'size-scale', 'hero'], 'Headings in capital letters need restraint, so the generator limits the heading size jump and avoids “Very large headline”.'),
  h('delicate-outline', ['typeface', 'signature'], '“Outlined phrase in the headline” breaks apart in delicate letters with small feet, so the generator uses “Highlighter stroke on a phrase”.'),
  h('dense-motion', ['density', 'motion'], 'A tightly packed layout suits a working tool, which should not animate its entrance, so the generator uses “Small, quick motion”.'),
];

export const RULES: RuleRecord[] = [...CONFLICT_RULES, ...HARMONY_RULES];
