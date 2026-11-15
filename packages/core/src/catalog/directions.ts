// Directions: complete, coherent starting looks. A Direction sets every design parameter at once;
// the Steps then refine it one variable at a time. ("Explore genuinely different directions before code.")
//
// Every curated Direction is the builder's own composition, judged by eye on rendered Mockups.
// No Direction copies a brand, and none names one: no research record supports a resemblance claim.

import { DEFAULT_PARAMS, type DesignParams } from '../params.js';
import type { Evidence, SourceRef } from './types.js';

/**
 * The groups under which the first screen lists the curated Directions. 35 Directions in one list were too many to take in;
 * a group's heading says in plain words what its Directions have in common.
 */
export const DIRECTION_GROUPS = [
  { id: 'calm', label: 'Light and calm' },
  { id: 'dark', label: 'Dark and dramatic' },
  { id: 'nostalgic', label: 'Warm and nostalgic' },
  { id: 'bold', label: 'Bold and playful' },
] as const;
export type DirectionGroup = (typeof DIRECTION_GROUPS)[number]['id'];

export interface Direction {
  id: string;
  /** The group on the first screen; `null` for a generated Direction, which has a list of its own. */
  group: DirectionGroup | null;
  name: string;
  /** The mood in plain words. */
  mood: string;
  bestFor: string;
  risk: string;
  params: DesignParams;
  sources: SourceRef[];
  evidence: Evidence;
  /** The date of the last review, as YYYY-MM-DD; `null` for a generated Direction, which nobody has reviewed. */
  reviewed: string | null;
  /** The skins this Direction offers besides its own colors, by identifier (see `skins.ts`). A generated Direction offers none. */
  skins?: string[];
  /**
   * The research rules that this Direction departs from on purpose, each with the reason in plain words. The Summary shows
   * the reason beside "Does not hold", so that a start that was made this way does not look like a fault (finding U5-16,
   * decisions D53 and D55). A unit test refuses a departure without such a record, and a record without a departure.
   */
  departs?: { ruleId: string; why: string }[];
}

const REVIEWED = '2026-11-13';
const COMPOSED: SourceRef[] = [{ text: 'Composed by the assistant that wrote this Studio from the Catalog’s Options and judged by eye on rendered Mockups. No outside source was consulted, and no person has reviewed it.', basis: 'builder' }];
const record = { sources: COMPOSED, evidence: 'expert-opinion' as const, reviewed: REVIEWED };

/** A Direction that rests on a search summary: the summary is filed in `docs/knowledge/sources/`; nobody read the pages themselves. */
const researched = (text: string, file: string): { sources: SourceRef[]; evidence: 'expert-opinion'; reviewed: string } => ({
  sources: [{ text, basis: 'snippet', record: `docs/knowledge/sources/${file}` }, ...COMPOSED],
  evidence: 'expert-opinion',
  reviewed: REVIEWED,
});

/** A Direction composed later than the first set: the same kind of source, with its own review date. */
const composedOn = (date: string): { sources: SourceRef[]; evidence: 'expert-opinion'; reviewed: string } => ({ sources: COMPOSED, evidence: 'expert-opinion', reviewed: date });

const d = (overrides: Partial<DesignParams>): DesignParams => ({ ...DEFAULT_PARAMS, ...overrides });

/**
 * A Direction drawn from the study of Japanese design (decision D52). Each source line names one record of the research
 * file. The records describe a tradition, not an experiment, and AI assistants wrote them from search summaries: nobody read
 * the texts themselves. Every number in such a Direction is the Studio's own translation of an idea into a value.
 */
const JAPANESE_STUDY = 'docs/knowledge/kb-japanese-design.json';
const fromJapaneseStudy = (...titles: string[]): { sources: SourceRef[]; evidence: 'expert-opinion'; reviewed: string } => ({
  sources: [...titles.map((title): SourceRef => ({ text: `The record “${title}”: a tradition, not an experiment. The numbers in this Direction are the Studio’s own translation.`, basis: 'snippet', record: JAPANESE_STUDY })), ...COMPOSED],
  evidence: 'expert-opinion',
  reviewed: '2026-11-14',
});

export const DIRECTIONS: Direction[] = [
  {
    id: 'graphite-precision',
    group: 'calm',
    name: 'Graphite Precision',
    mood: 'Exact, quiet, engineered. Black, white, and a faint grid of lines.',
    bestFor: 'Software, professional services, anything that should feel rigorous.',
    risk: 'Severe. It needs strong headlines, because nothing decorative will carry weak ones.',
    ...record,
    params: d({
      nav: 'split-cta', hero: 'centered', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.1,
      fontHeading: 'instrument-sans', fontBody: 'instrument-sans', headingWeight: 700, headingTracking: -0.038, headingCase: 'sentence', baseSize: 16, scaleRatio: 1.36, numerals: 'tabular',
      neutralHue: 0, neutralChroma: 0, accentHue: 255, accentChroma: 0.015, accentLightness: 0.27, colorStrategy: 'quiet', theme: 'light', contrast: 0.9,
      radius: 8, elevation: 'ring', borderWeight: 1, signature: 'none', atmosphere: 'line-grid', buttonFinish: 'gloss', displayTreatment: 'ink-gradient', motion: 'subtle',
    }),
  },
  {
    id: 'midnight-aurora',
    skins: ['lagoon', 'sunset', 'berry', 'orchid', 'gold'],
    group: 'dark',
    name: 'Midnight Aurora',
    mood: 'A deep night sky with soft colored light behind frosted, see-through boxes. Luminous and calm.',
    bestFor: 'Products and studios that want atmosphere and a sense of technology.',
    risk: 'Dark frosted boxes with a glow are a current fashion; they will look dated sooner than a plainer look.',
    ...record,
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.1,
      fontHeading: 'manrope', fontBody: 'manrope', headingWeight: 700, headingTracking: -0.034, headingCase: 'sentence', baseSize: 16, scaleRatio: 1.36, numerals: 'tabular',
      neutralHue: 265, neutralChroma: 0.014, accentHue: 262, accentChroma: 0.19, accentLightness: 0.56, accent2Hue: 200, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.88,
      radius: 12, elevation: 'glass', borderWeight: 1, signature: 'none', atmosphere: 'aurora', buttonFinish: 'glow', displayTreatment: 'ink-gradient', motion: 'expressive',
    }),
  },
  {
    id: 'ember-noir',
    skins: ['ocean', 'lagoon', 'forest', 'berry', 'orchid'],
    group: 'dark',
    name: 'Ember Noir',
    mood: 'Charcoal and firelight. Warm, confident, a little theatrical.',
    bestFor: 'Restaurants, bars, studios, craftspeople, evening businesses.',
    risk: 'Dark pages make daytime photographs look out of place.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'statement', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1.05,
      fontHeading: 'bricolage-grotesque', fontBody: 'instrument-sans', headingWeight: 700, headingTracking: -0.03, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.36, numerals: 'tabular',
      neutralHue: 60, neutralChroma: 0.008, accentHue: 62, accentChroma: 0.165, accentLightness: 0.74, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.6,
      radius: 10, elevation: 'tonal', borderWeight: 1, signature: 'marker', atmosphere: 'spotlight', buttonFinish: 'gloss', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'paper-and-ink',
    group: 'nostalgic',
    name: 'Paper and Ink',
    mood: 'A well-edited magazine: paper grain, ink, and one red pencil.',
    bestFor: 'Writers, advisers, law, education: places where words matter.',
    risk: 'Paper texture, letters with small feet, and thin lines together are a familiar magazine look; the one red color and the numbered list keep this one specific.',
    ...record,
    params: d({
      nav: 'top-centered', hero: 'statement', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1.15,
      fontHeading: 'newsreader', fontBody: 'instrument-sans', headingWeight: 500, headingTracking: -0.022, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.34, numerals: 'tabular',
      neutralHue: 85, neutralChroma: 0.012, accentHue: 30, accentChroma: 0.19, accentLightness: 0.55, colorStrategy: 'quiet', theme: 'light', contrast: 0.82,
      radius: 2, elevation: 'borders', borderWeight: 1, signature: 'marker', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'soft-daylight',
    skins: ['ember', 'berry', 'gold', 'graphite', 'indigo'],
    group: 'calm',
    name: 'Soft Daylight',
    mood: 'Bright, airy, unhurried. Boxes float on soft shadows in clear light.',
    bestFor: 'Consumer products, health, hospitality: anything that should feel effortless.',
    risk: 'Needs generous space and good photographs; cramped content breaks the calm.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'centered', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.3,
      fontHeading: 'manrope', fontBody: 'manrope', headingWeight: 600, headingTracking: -0.03, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.36, numerals: 'tabular',
      neutralHue: 250, neutralChroma: 0.004, accentHue: 256, accentChroma: 0.19, accentLightness: 0.55, colorStrategy: 'single-accent', theme: 'light', contrast: 0.72,
      radius: 999, elevation: 'float', borderWeight: 0, signature: 'none', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'expressive',
    }),
  },
  {
    id: 'poster-block',
    skins: ['ocean', 'forest', 'berry', 'violet', 'gold'],
    group: 'bold',
    name: 'Poster Block',
    mood: 'A printed poster: one loud color, heavy letters, square corners.',
    bestFor: 'Bold local brands, events, food, anything that should be remembered at a glance.',
    risk: 'Tiring over many pages; hard to pair with photographs.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'statement', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1,
      fontHeading: 'bricolage-grotesque', fontBody: 'instrument-sans', headingWeight: 800, headingTracking: -0.04, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'tabular',
      neutralHue: 80, neutralChroma: 0.014, accentHue: 32, accentChroma: 0.2, accentLightness: 0.6, colorStrategy: 'color-block', theme: 'light', contrast: 0.9,
      radius: 0, elevation: 'borders', borderWeight: 2, signature: 'outline-type', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'sticker-pop',
    skins: ['ocean', 'lagoon', 'ember', 'orchid', 'gold'],
    group: 'bold',
    name: 'Sticker Pop',
    mood: 'Cheerful and tactile: thick outlines, solid sticker-like shadows, two bright colors.',
    bestFor: 'Children, pets, creative shops, friendly neighborhood businesses.',
    risk: 'A strong current fashion (designers call it neo-brutalism); too casual for serious subjects.',
    ...record,
    params: d({
      nav: 'split-cta', hero: 'split-media', sections: 'grid', contentWidth: 'standard', emphasis: 'headline', density: 1.12,
      fontHeading: 'outfit', fontBody: 'dm-sans', headingWeight: 700, headingTracking: -0.02, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 155, neutralChroma: 0.012, accentHue: 135, accentChroma: 0.19, accentLightness: 0.72, accent2Hue: 255, colorStrategy: 'duo', theme: 'light', contrast: 0.9,
      radius: 999, elevation: 'hard-shadow', borderWeight: 2, signature: 'corner-tag', atmosphere: 'dot-grid', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'expressive',
    }),
  },
  {
    id: 'clinical-calm',
    skins: ['graphite', 'indigo'],
    group: 'calm',
    name: 'Clinical Calm',
    mood: 'Clean, reassuring, plainly spoken. Nothing to worry about here.',
    bestFor: 'Clinics, dental and medical practices, care services.',
    risk: 'Teal is a familiar color in health care; the fine edges around the boxes and the sturdy letters keep this one from looking like a template.',
    ...record,
    params: d({
      nav: 'split-cta', hero: 'split-media', sections: 'stacked', contentWidth: 'standard', emphasis: 'action', density: 1.15,
      fontHeading: 'public-sans', fontBody: 'public-sans', headingWeight: 600, headingTracking: -0.02, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.28, numerals: 'tabular',
      neutralHue: 190, neutralChroma: 0.008, accentHue: 195, accentChroma: 0.09, accentLightness: 0.44, colorStrategy: 'single-accent', theme: 'light', contrast: 0.82,
      radius: 10, elevation: 'ring', borderWeight: 1, signature: 'none', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'evening-formal',
    skins: ['lagoon', 'forest', 'berry', 'orchid', 'graphite'],
    group: 'dark',
    name: 'Evening Formal',
    mood: 'Candlelight and engraved invitations. Dark, slow, elegant.',
    bestFor: 'Fine dining, events, jewelry, hotels.',
    risk: 'Thin, elegant letters need to be large to stay readable, so small text stays in the plainer letter style.',
    ...record,
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.3,
      fontHeading: 'playfair', fontBody: 'dm-sans', headingWeight: 500, headingTracking: -0.012, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 320, neutralChroma: 0.012, accentHue: 85, accentChroma: 0.11, accentLightness: 0.78, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.5,
      radius: 4, elevation: 'tonal', borderWeight: 1, signature: 'none', atmosphere: 'spotlight', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'control-room',
    skins: ['meadow', 'ember', 'orchid', 'gold', 'graphite'],
    group: 'dark',
    name: 'Control Room',
    mood: 'An instrument panel: dense, exact, numbers first.',
    bestFor: 'Dashboards, operations tools, technical services.',
    risk: 'Too tightly packed for a public information site; made for people who work in it all day.',
    departs: [{ ruleId: 'reading-size', why: 'It is a working screen for people who use it all day: its reading text is 15 pixels tall, so that more rows are in view at once. For a public website the rule’s advice stands.' }],
    ...record,
    params: d({
      nav: 'side-rail', hero: 'text-left', sections: 'stacked', contentWidth: 'wide', emphasis: 'proof', density: 0.86,
      fontHeading: 'space-grotesk', fontBody: 'manrope', headingWeight: 600, headingTracking: -0.02, headingCase: 'sentence', baseSize: 15, scaleRatio: 1.2, numerals: 'mono',
      neutralHue: 240, neutralChroma: 0.01, accentHue: 205, accentChroma: 0.13, accentLightness: 0.7, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.85,
      radius: 3, elevation: 'borders', borderWeight: 1, signature: 'none', atmosphere: 'dot-grid', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none',
    }),
  },
  {
    id: 'quiet-luxury',
    group: 'calm',
    name: 'Quiet Luxury',
    mood: 'Nearly nothing, perfectly placed. Thin letters with small feet, wide margins, no lines.',
    bestFor: 'High-end services, galleries, architects, private practices.',
    risk: 'Restraint this strict exposes every weak photograph and every loose sentence.',
    ...record,
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.34,
      fontHeading: 'fraunces', fontBody: 'instrument-sans', headingWeight: 400, headingTracking: -0.024, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 70, neutralChroma: 0.005, accentHue: 325, accentChroma: 0.1, accentLightness: 0.36, colorStrategy: 'quiet', theme: 'light', contrast: 0.66,
      radius: 0, elevation: 'flat', borderWeight: 0, signature: 'none', atmosphere: 'plain', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'cobalt-wash',
    skins: ['berry', 'gold', 'forest', 'ember', 'graphite'],
    group: 'calm',
    name: 'Cobalt Wash',
    mood: 'The whole page breathes one color. Fresh, modern, unmistakable.',
    bestFor: 'Young brands and products that want to be recognized by color alone.',
    risk: 'Photographs take on the tint of the page; look at your own photographs on this page before you commit.',
    ...record,
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.1,
      fontHeading: 'manrope', fontBody: 'manrope', headingWeight: 800, headingTracking: -0.036, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.34, numerals: 'tabular',
      neutralHue: 262, neutralChroma: 0.012, accentHue: 262, accentChroma: 0.21, accentLightness: 0.5, colorStrategy: 'tinted-surface', theme: 'light', contrast: 0.88,
      radius: 14, elevation: 'soft-shadow', borderWeight: 1, signature: 'marker', atmosphere: 'plain', buttonFinish: 'gloss', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'sunlit-studio',
    skins: ['lagoon', 'forest', 'berry', 'orchid', 'graphite'],
    group: 'calm',
    name: 'Sunlit Studio',
    mood: 'Morning light in a workshop: golden, open, optimistic.',
    bestFor: 'Makers, cafes, wellness, family businesses.',
    risk: 'Yellow buttons need dark labels, and the Studio sets them. It also darkens yellow links, though not all the way to the guideline for reading text; “Fix for me” under “Contrast checks” takes them there.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'split-media', sections: 'grid', contentWidth: 'standard', emphasis: 'headline', density: 1.18,
      fontHeading: 'outfit', fontBody: 'dm-sans', headingWeight: 600, headingTracking: -0.025, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.32, numerals: 'tabular',
      neutralHue: 85, neutralChroma: 0.01, accentHue: 88, accentChroma: 0.16, accentLightness: 0.82, colorStrategy: 'single-accent', theme: 'light', contrast: 0.86,
      radius: 20, elevation: 'float', borderWeight: 1, signature: 'color-band', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'expressive',
    }),
  },
  {
    id: 'garden-ledger',
    skins: ['ocean', 'orchid', 'violet', 'gold', 'lagoon'],
    group: 'nostalgic',
    name: 'Garden Ledger',
    mood: 'A seed catalog: deep green, sturdy letters with small feet, orderly lists.',
    bestFor: 'Garden, food, sustainability, outdoor and craft businesses.',
    risk: 'Dark green can look black in small text, so the text sizes here stay large.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1.12,
      fontHeading: 'literata', fontBody: 'instrument-sans', headingWeight: 600, headingTracking: -0.02, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 150, neutralChroma: 0.012, accentHue: 152, accentChroma: 0.11, accentLightness: 0.4, colorStrategy: 'single-accent', theme: 'light', contrast: 0.86,
      radius: 6, elevation: 'borders', borderWeight: 1, signature: 'big-numerals', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'vector-horizon',
    skins: ['ocean', 'forest'],
    group: 'dark',
    name: 'Vector Horizon',
    mood: 'A flight deck at night: thin lines, a faint grid, capital letters, and one electric color. Precise and forward-looking.',
    bestFor: 'Technology products, engineering firms, anything that sells the future.',
    risk: 'Capital letters and outlined letters tire the eye in long passages, so keep the text short. The look borrows from film screens; on a plain local business it can feel like a costume.',
    ...researched('A search summary on screens made to look futuristic: dark screens, one neon color, grids, read-outs, and glow.', 'futuristic-screen-look.md'),
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'ledger', contentWidth: 'wide', emphasis: 'headline', density: 0.98,
      fontHeading: 'space-grotesk', fontBody: 'instrument-sans', headingWeight: 600, headingTracking: 0.05, headingCase: 'upper', baseSize: 16, scaleRatio: 1.3, numerals: 'mono',
      neutralHue: 245, neutralChroma: 0.02, accentHue: 205, accentChroma: 0.14, accentLightness: 0.8, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.92,
      radius: 2, elevation: 'borders', borderWeight: 1, signature: 'outline-type', atmosphere: 'line-grid', buttonFinish: 'glow', displayTreatment: 'solid', motion: 'expressive',
    }),
  },
  {
    id: 'frontier-gazette',
    skins: ['lagoon', 'forest', 'orchid', 'violet', 'graphite'],
    group: 'nostalgic',
    name: 'Frontier Gazette',
    mood: 'A small-town newspaper and a wanted poster: sun-faded paper, heavy capital letters, rust red, and denim blue.',
    bestFor: 'Ranches, outfitters, diners and saloons, craft makers, country inns.',
    risk: 'Cream paper with letters that have small feet is on published lists of newer looks that many AI-made pages share; the heavy capitals, the rust red, and the paper grain keep this one specific. It is a costume: it suits a business with a story to tell, and it will look odd on a clinic or a software product.',
    ...researched('A search summary on the American West look in print: wood-type poster lettering, dense centered layouts, and a palette of rust, tan, cream, black, and faded blue.', 'american-west-graphic-style.md'),
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'stacked', contentWidth: 'standard', emphasis: 'headline', density: 1.05,
      fontHeading: 'playfair', fontBody: 'literata', headingWeight: 800, headingTracking: 0.07, headingCase: 'upper', baseSize: 17, scaleRatio: 1.3, numerals: 'proportional',
      neutralHue: 78, neutralChroma: 0.03, accentHue: 38, accentChroma: 0.15, accentLightness: 0.5, accent2Hue: 245, colorStrategy: 'duo', theme: 'light', contrast: 0.85,
      radius: 0, elevation: 'borders', borderWeight: 2, signature: 'corner-tag', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'galactic-goth',
    skins: ['ocean', 'lagoon', 'sunset', 'berry', 'gold'],
    group: 'dark',
    name: 'Galactic Goth',
    mood: 'Deep space in velvet: a violet-black sky full of stars, frosted boxes, royal purple, and one deep red. Dramatic and elegant.',
    bestFor: 'Studios, musicians, tattoo and piercing shops, game and book makers, evening venues.',
    risk: 'Purple on a dark page is on published lists of looks that many AI-made pages share; the stars, the deep red, and the elegant headings keep this one specific. The elegant heading letters need to be large to stay readable, so reading text stays in plain letters.',
    ...researched('A search summary on the gothic look on the web: near-black pages, deep red and dark purple, ornate headings, and the warning that text must not blur into a dark background.', 'gothic-web-look.md'),
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.12,
      fontHeading: 'playfair', fontBody: 'manrope', headingWeight: 700, headingTracking: -0.012, headingCase: 'sentence', baseSize: 16.5, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 305, neutralChroma: 0.022, accentHue: 302, accentChroma: 0.2, accentLightness: 0.58, accent2Hue: 18, colorStrategy: 'duo', theme: 'dark', contrast: 0.9,
      radius: 14, elevation: 'glass', borderWeight: 1, signature: 'none', atmosphere: 'stars', buttonFinish: 'glow', displayTreatment: 'ink-gradient', motion: 'expressive',
    }),
  },
  {
    id: 'marquee-deco',
    skins: ['lagoon', 'forest', 'berry', 'orchid', 'graphite'],
    group: 'dark',
    name: 'Marquee Deco',
    mood: 'A theater front from the 1920s: black and gold, even capital letters, square corners, and a light from above.',
    bestFor: 'Theaters, cocktail bars, hotels, jewelers, events with a sense of occasion.',
    risk: 'Gold on black reads as luxury only when everything else is restrained; one more decoration tips it into a casino. Thin capital letters need generous size.',
    ...record,
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.15,
      fontHeading: 'outfit', fontBody: 'dm-sans', headingWeight: 500, headingTracking: 0.1, headingCase: 'upper', baseSize: 16.5, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 80, neutralChroma: 0.008, accentHue: 88, accentChroma: 0.13, accentLightness: 0.8, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.9,
      radius: 0, elevation: 'borders', borderWeight: 1, signature: 'color-band', atmosphere: 'spotlight', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'motel-neon',
    skins: ['lagoon', 'forest', 'violet', 'gold', 'graphite'],
    group: 'nostalgic',
    name: 'Motel Neon',
    mood: 'Night on an old California highway: a near-black blue page, a warm rose pink like a lit sign, tall elegant letters, and a faint film grain. Wistful and cinematic.',
    bestFor: 'Musicians, photographers, vintage shops, bars and diners, writers, anything that trades on nostalgia.',
    risk: 'Melancholy is a narrow mood; it suits a story and can feel heavy on a page that only sells a service. The elegant heading letters need to be large to stay readable.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-centered', hero: 'text-left', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.2,
      fontHeading: 'playfair', fontBody: 'newsreader', headingWeight: 500, headingTracking: -0.01, headingCase: 'sentence', baseSize: 17.5, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 275, neutralChroma: 0.024, accentHue: 12, accentChroma: 0.15, accentLightness: 0.66, accent2Hue: 215, colorStrategy: 'duo', theme: 'dark', contrast: 1,
      radius: 3, elevation: 'ring', borderWeight: 1, signature: 'none', atmosphere: 'grain', buttonFinish: 'glow', displayTreatment: 'ink-gradient', motion: 'subtle',
    }),
  },
  {
    id: 'ocean-drive',
    skins: ['ocean', 'sunset', 'orchid', 'violet', 'gold'],
    group: 'bold',
    name: 'Ocean Drive',
    mood: 'A 1980s beach city: pale pastel walls, a deep flamingo pink, a touch of turquoise, and thin clean letters. Breezy and stylish.',
    bestFor: 'Hotels, salons, boutiques, cocktail bars, travel, events.',
    risk: 'Pink with turquoise is a loud pair; it reads as fashion, and a firm or a clinic may find it too playful.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'split-cta', hero: 'split-media', sections: 'grid', contentWidth: 'wide', emphasis: 'headline', density: 1.1,
      fontHeading: 'outfit', fontBody: 'dm-sans', headingWeight: 300, headingTracking: -0.02, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 350, neutralChroma: 0.012, accentHue: 355, accentChroma: 0.2, accentLightness: 0.47, accent2Hue: 195, colorStrategy: 'duo', theme: 'light', contrast: 0.75,
      radius: 18, elevation: 'soft-shadow', borderWeight: 0, signature: 'color-band', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'accent-gradient', motion: 'subtle',
    }),
  },
  {
    id: 'mall-sunset',
    skins: ['lagoon', 'sunset', 'violet', 'gold', 'graphite'],
    group: 'bold',
    name: 'Mall Sunset',
    mood: 'A 1980s dream of the future: a violet night, hot magenta and cyan, a grid of lines, and wide capital letters. Playful and unreal.',
    bestFor: 'Music, games, streetwear, retro events, creative studios.',
    risk: 'This look is a quotation of an internet style; it is fun for a subculture and wrong for anything that must be taken at face value.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'centered', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.05,
      fontHeading: 'space-grotesk', fontBody: 'space-grotesk', headingWeight: 700, headingTracking: 0.12, headingCase: 'upper', baseSize: 16, scaleRatio: 1.3, numerals: 'mono',
      neutralHue: 300, neutralChroma: 0.03, accentHue: 335, accentChroma: 0.24, accentLightness: 0.66, accent2Hue: 200, colorStrategy: 'duo', theme: 'dark', contrast: 1,
      radius: 0, elevation: 'hard-shadow', borderWeight: 2, signature: 'corner-tag', atmosphere: 'line-grid', buttonFinish: 'flat', displayTreatment: 'accent-gradient', motion: 'expressive',
    }),
  },
  {
    id: 'quiet-orbit',
    skins: ['lagoon', 'forest', 'sunset', 'berry', 'gold'],
    group: 'calm',
    name: 'Quiet Orbit',
    mood: 'A bright, still morning in space: a near-white page with a cool tint, one calm indigo, a few faint stars, and soft round shapes. Smooth and modern.',
    bestFor: 'Software, science and education, consultancies, anything that should feel clear and forward-looking.',
    risk: 'Its restraint is the point: one color, no glow. Add more decoration and it turns into a costume.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'bento', contentWidth: 'standard', emphasis: 'headline', density: 1.22,
      fontHeading: 'manrope', fontBody: 'inter', headingWeight: 600, headingTracking: -0.03, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.36, numerals: 'proportional',
      neutralHue: 265, neutralChroma: 0.008, accentHue: 272, accentChroma: 0.15, accentLightness: 0.47, colorStrategy: 'single-accent', theme: 'light', contrast: 0.8,
      radius: 20, elevation: 'ring', borderWeight: 1, signature: 'none', atmosphere: 'stars', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'steady-steps',
    skins: ['berry', 'gold', 'graphite', 'ocean', 'violet'],
    group: 'calm',
    name: 'Steady Steps',
    mood: 'A soft mint page with a calm green-teal, friendly round letters, clear buttons, and plenty of room. Encouraging and easy to return to every day.',
    bestFor: 'Programs that people follow over weeks: coaching, therapy and recovery support, habit and health programs, courses.',
    risk: 'It shows the look on the sample website only. A daily check-in screen or a progress screen is a different kind of page, which the Studio does not draw yet.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'grid', contentWidth: 'standard', emphasis: 'action', density: 1.2,
      fontHeading: 'bricolage-grotesque', fontBody: 'dm-sans', headingWeight: 600, headingTracking: -0.02, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 85, neutralChroma: 0.012, accentHue: 175, accentChroma: 0.11, accentLightness: 0.45, colorStrategy: 'tinted-surface', theme: 'light', contrast: 0.85,
      radius: 16, elevation: 'soft-shadow', borderWeight: 1, signature: 'big-numerals', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'malibu-sunset',
    skins: ['ocean', 'berry', 'orchid', 'violet', 'gold'],
    group: 'nostalgic',
    name: 'Malibu Sunset',
    mood: 'The Pacific coast at the end of the day: pale sand, a coral sun, a touch of ocean teal, and easy round letters. Sunlit and unhurried.',
    bestFor: 'Surf and swim shops, beach rentals, wellness studios, cafes, coastal real estate, travel.',
    risk: 'Sunset colors turn sweet quickly; the look needs real photographs of a real place to stay grown-up.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'split-media', sections: 'alternating', contentWidth: 'wide', emphasis: 'headline', density: 1.18,
      fontHeading: 'bricolage-grotesque', fontBody: 'dm-sans', headingWeight: 600, headingTracking: -0.025, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 70, neutralChroma: 0.018, accentHue: 35, accentChroma: 0.17, accentLightness: 0.47, accent2Hue: 200, colorStrategy: 'duo', theme: 'light', contrast: 0.8,
      radius: 14, elevation: 'soft-shadow', borderWeight: 0, signature: 'color-band', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'miami-beach-deco',
    skins: ['lagoon', 'forest', 'orchid', 'violet', 'gold'],
    group: 'nostalgic',
    name: 'Miami Beach Deco',
    mood: 'A sun-warmed hotel front from the 1930s: cream walls, soft coral, a line of sea green, capital letters with air between them, and clean thin lines. Warm and relaxed, with a quiet nod to Art Deco.',
    bestFor: 'Hotels and guest houses, restaurants, spas, galleries, event venues.',
    risk: 'The nod to the past is slight on purpose. Push the capitals and the lines further and it becomes a fancy-dress party.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'grid', contentWidth: 'standard', emphasis: 'headline', density: 1.2,
      fontHeading: 'outfit', fontBody: 'dm-sans', headingWeight: 400, headingTracking: 0.08, headingCase: 'upper', baseSize: 17, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 75, neutralChroma: 0.016, accentHue: 28, accentChroma: 0.13, accentLightness: 0.44, accent2Hue: 175, colorStrategy: 'duo', theme: 'light', contrast: 0.8,
      radius: 22, elevation: 'borders', borderWeight: 1, signature: 'none', atmosphere: 'plain', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'vegas-modern',
    skins: ['lagoon', 'forest', 'berry', 'orchid', 'graphite'],
    group: 'dark',
    name: 'Vegas Modern',
    mood: 'A new resort at night: a black page, warm gold, glass boxes, a single light from above, and large confident letters. Sleek and impressive.',
    bestFor: 'Venues, shows, restaurants, luxury services, product launches, anything that should feel like an arrival.',
    risk: 'Black with gold promises quality. Weak photographs or thin content will look worse here than on a plain page.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'split-cta', hero: 'statement', sections: 'bento', contentWidth: 'wide', emphasis: 'headline', density: 1.12,
      fontHeading: 'manrope', fontBody: 'inter', headingWeight: 700, headingTracking: -0.035, headingCase: 'sentence', baseSize: 16.5, scaleRatio: 1.42, numerals: 'tabular',
      neutralHue: 60, neutralChroma: 0.006, accentHue: 82, accentChroma: 0.13, accentLightness: 0.78, colorStrategy: 'single-accent', theme: 'dark', contrast: 1,
      radius: 10, elevation: 'glass', borderWeight: 1, signature: 'none', atmosphere: 'spotlight', buttonFinish: 'gloss', displayTreatment: 'ink-gradient', motion: 'expressive',
    }),
  },
  {
    id: 'smoky-mountain-autumn',
    skins: ['ocean', 'lagoon', 'meadow', 'berry', 'orchid'],
    group: 'nostalgic',
    name: 'Smoky Mountain Autumn',
    mood: 'The ridges in October: a warm parchment page, burnt orange leaves, deep evergreen, bookish letters, and a soft morning haze. Calm and rooted.',
    bestFor: 'Cabins and lodges, outfitters, farms and orchards, craftspeople, local guides, churches and community groups.',
    risk: 'Orange with green can read as a seasonal sale. The haze and the bookish letters keep it calm; bright photographs help.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.18,
      fontHeading: 'newsreader', fontBody: 'literata', headingWeight: 600, headingTracking: -0.015, headingCase: 'sentence', baseSize: 17.5, scaleRatio: 1.36, numerals: 'proportional',
      neutralHue: 70, neutralChroma: 0.02, accentHue: 45, accentChroma: 0.15, accentLightness: 0.44, accent2Hue: 155, colorStrategy: 'duo', theme: 'light', contrast: 0.85,
      radius: 6, elevation: 'tonal', borderWeight: 1, signature: 'marker', atmosphere: 'horizon', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'childhood-nostalgia',
    skins: ['ocean', 'lagoon', 'forest', 'berry', 'orchid'],
    group: 'nostalgic',
    name: 'Childhood Nostalgia',
    mood: 'A small-town living room in the 1980s, remembered kindly: wood-brown, harvest gold, a soft lamp-lit page, friendly letters, and a little grain like an old photograph. Warm and safe.',
    bestFor: 'Family businesses, diners, thrift and antique shops, memoirs and family histories, anything that says “you are welcome here”.',
    risk: 'Nostalgia slides into costume when it piles on old patterns. This look uses the colors and the warmth of the time, and none of its ornaments.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'stacked', contentWidth: 'standard', emphasis: 'headline', density: 1.15,
      fontHeading: 'bricolage-grotesque', fontBody: 'newsreader', headingWeight: 700, headingTracking: -0.02, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.3, numerals: 'proportional',
      neutralHue: 65, neutralChroma: 0.026, accentHue: 55, accentChroma: 0.11, accentLightness: 0.42, accent2Hue: 90, colorStrategy: 'duo', theme: 'light', contrast: 0.85,
      radius: 8, elevation: 'tonal', borderWeight: 1.5, signature: 'none', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'long-conversation',
    skins: ['ocean', 'lagoon', 'forest', 'berry', 'orchid'],
    group: 'dark',
    name: 'Long Conversation',
    mood: 'A dark studio late at night: warm amber light, a deep red, sturdy plain letters, and plenty of room to read. Curious and unhurried.',
    bestFor: 'Podcasts and interviews, writers, gyms and martial-arts schools, comedy, long reads.',
    risk: 'Dark and warm is easy on the eyes for an evening and heavy for a quick errand; the reading text must stay large.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'split-cta', hero: 'text-left', sections: 'stacked', contentWidth: 'standard', emphasis: 'headline', density: 1.2,
      fontHeading: 'manrope', fontBody: 'inter', headingWeight: 800, headingTracking: -0.03, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.36, numerals: 'tabular',
      neutralHue: 50, neutralChroma: 0.012, accentHue: 70, accentChroma: 0.14, accentLightness: 0.76, accent2Hue: 25, colorStrategy: 'duo', theme: 'dark', contrast: 1,
      radius: 6, elevation: 'ring', borderWeight: 1, signature: 'none', atmosphere: 'spotlight', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'before-dawn',
    skins: ['ocean', 'lagoon', 'berry', 'orchid', 'violet'],
    group: 'dark',
    name: 'Before Dawn',
    mood: 'The road at five in the morning: a near-black page, one hard orange like a safety vest, heavy capital letters, and square edges. Stripped down and relentless.',
    bestFor: 'Coaches and trainers, endurance events, gyms, anyone whose message is discipline.',
    risk: 'There is nothing soft here. A visitor who needs reassurance will not find it in this look.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'ledger', contentWidth: 'wide', emphasis: 'headline', density: 1,
      fontHeading: 'space-grotesk', fontBody: 'inter', headingWeight: 700, headingTracking: -0.01, headingCase: 'upper', baseSize: 16.5, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 250, neutralChroma: 0.004, accentHue: 50, accentChroma: 0.19, accentLightness: 0.72, colorStrategy: 'single-accent', theme: 'dark', contrast: 1,
      radius: 0, elevation: 'borders', borderWeight: 2, signature: 'big-numerals', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none',
    }),
  },
  {
    id: 'mountain-rhinestone',
    skins: ['lagoon', 'forest', 'sunset', 'violet', 'graphite'],
    group: 'nostalgic',
    name: 'Mountain Rhinestone',
    mood: 'A big-hearted stage in the hills: warm cream, a bright rose pink, a butterfly yellow, round generous shapes, and elegant letters. Joyful and kind.',
    bestFor: 'Charities and reading programs, music and theater, bakeries, salons, family attractions.',
    risk: 'Pink with yellow is cheerful by nature; it is the wrong voice for bad news or for a formal office.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'grid', contentWidth: 'standard', emphasis: 'headline', density: 1.18,
      fontHeading: 'playfair', fontBody: 'dm-sans', headingWeight: 700, headingTracking: -0.01, headingCase: 'sentence', baseSize: 17.5, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 45, neutralChroma: 0.016, accentHue: 355, accentChroma: 0.19, accentLightness: 0.47, accent2Hue: 95, colorStrategy: 'duo', theme: 'light', contrast: 0.8,
      radius: 999, elevation: 'soft-shadow', borderWeight: 0, signature: 'marker', atmosphere: 'spotlight', buttonFinish: 'gloss', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'field-manual',
    skins: ['graphite', 'indigo'],
    group: 'calm',
    name: 'Field Manual',
    mood: 'A printed manual: a paper-white page, black ink, one olive green, typewriter-style capital headings, thin lines, and numbered parts. Orderly and plain-spoken.',
    bestFor: 'Leadership and training programs, consultancies, veterans’ groups, outdoor and safety courses, checklists and guides.',
    risk: 'It borrows the order of a military document and none of its emblems. It can feel stern where warmth is expected.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1.05,
      fontHeading: 'jetbrains-mono', fontBody: 'public-sans', headingWeight: 700, headingTracking: 0.02, headingCase: 'upper', baseSize: 16.5, scaleRatio: 1.24, numerals: 'mono',
      neutralHue: 110, neutralChroma: 0.006, accentHue: 125, accentChroma: 0.07, accentLightness: 0.4, colorStrategy: 'single-accent', theme: 'light', contrast: 1,
      radius: 0, elevation: 'borders', borderWeight: 1.5, signature: 'big-numerals', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none',
    }),
  },
  {
    id: 'blue-hour-chapel',
    skins: ['indigo'],
    group: 'nostalgic',
    name: 'Blue Hour Chapel',
    mood: 'An old photograph of a summer that is over: sun-faded cream, dusty blue, a faded red, tall elegant letters, and soft grain. Glamorous and sad at once.',
    bestFor: 'Musicians, wedding and portrait photographers, florists, vintage clothing, poetry and memoir.',
    risk: 'The faded colors are quiet on purpose; a page that must shout an offer will fight this look.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'stacked', contentWidth: 'narrow', emphasis: 'headline', density: 1.25,
      fontHeading: 'playfair', fontBody: 'newsreader', headingWeight: 400, headingTracking: -0.005, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 80, neutralChroma: 0.014, accentHue: 245, accentChroma: 0.07, accentLightness: 0.42, accent2Hue: 20, colorStrategy: 'duo', theme: 'light', contrast: 0.75,
      radius: 2, elevation: 'flat', borderWeight: 1, signature: 'none', atmosphere: 'grain', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'woody-creek-winter',
    skins: ['lagoon', 'forest', 'violet', 'gold', 'graphite'],
    group: 'nostalgic',
    name: 'Woody Creek Winter',
    mood: 'A writer’s kitchen table in the Rockies: a snow-white page, weathered wood brown, a red like a typewriter ribbon, and typewriter-style headings. Personal and a little unruly.',
    bestFor: 'Writers and journalists, small presses, newsletters, bars, ranch and mountain businesses.',
    risk: 'Typewriter-style headings read as a manuscript; they tire the eye in long menus and dense pages.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'stacked', contentWidth: 'narrow', emphasis: 'headline', density: 1.1,
      fontHeading: 'jetbrains-mono', fontBody: 'literata', headingWeight: 700, headingTracking: -0.02, headingCase: 'sentence', baseSize: 17.5, scaleRatio: 1.3, numerals: 'mono',
      neutralHue: 60, neutralChroma: 0.01, accentHue: 25, accentChroma: 0.18, accentLightness: 0.45, accent2Hue: 60, colorStrategy: 'duo', theme: 'light', contrast: 0.95,
      radius: 2, elevation: 'borders', borderWeight: 1.5, signature: 'marker', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'desert-fever',
    skins: ['ocean', 'lagoon', 'meadow', 'berry', 'orchid'],
    group: 'bold',
    name: 'Desert Fever',
    mood: 'A road trip through the desert that went wrong in an interesting way: bleached sand, acid orange, a sour green, very large heavy headings, and boxes like stickers. Loud and a little unhinged.',
    bestFor: 'Zines, bands, bars, street food, festivals, art projects.',
    risk: 'This look is a joke that the visitor must be in on. It is wrong for anything that asks for trust, money, or health information.',
    ...composedOn('2026-11-14'),
    params: d({
      nav: 'top-inline', hero: 'statement', sections: 'bento', contentWidth: 'wide', emphasis: 'headline', density: 1,
      fontHeading: 'bricolage-grotesque', fontBody: 'space-grotesk', headingWeight: 800, headingTracking: -0.04, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.5, numerals: 'proportional',
      neutralHue: 85, neutralChroma: 0.03, accentHue: 45, accentChroma: 0.2, accentLightness: 0.45, accent2Hue: 135, colorStrategy: 'duo', theme: 'light', contrast: 1,
      radius: 4, elevation: 'hard-shadow', borderWeight: 2, signature: 'corner-tag', atmosphere: 'dot-grid', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'expressive',
    }),
  },
  {
    id: 'ink-and-seal',
    group: 'calm',
    name: 'Ink and Seal',
    mood: 'Warm paper, soft black ink, and a few small orange-red marks, like the seal on a letter. Wide empty margins, thin lines, square corners. Nothing shines and nothing moves.',
    bestFor: 'Craft, tea, ceramics, architecture, writing: work that should speak quietly and be looked at twice.',
    risk: 'Quiet can read as empty. A business that nobody knows yet must show its craft in the photographs, and must keep the facts a customer needs (what, where, hours, price) near the top.',
    ...fromJapaneseStudy(
      'Ma (間): the interval is a designed element, not leftover area',
      'Kanso (簡素): plain and uncluttered, with few kinds of thing',
      'Seijaku (静寂): stillness, with nothing moving unasked',
      'Traditional Japanese colour names have no single screen value',
    ),
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'ledger', contentWidth: 'narrow', emphasis: 'headline', density: 1.35,
      fontHeading: 'instrument-sans', fontBody: 'instrument-sans', headingWeight: 500, headingTracking: -0.01, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.2, numerals: 'tabular',
      neutralHue: 85, neutralChroma: 0.012, accentHue: 35, accentChroma: 0.16, accentLightness: 0.5, colorStrategy: 'quiet', theme: 'light', contrast: 0.8,
      radius: 0, elevation: 'borders', borderWeight: 1, signature: 'none', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none',
    }),
  },
  {
    id: 'unbleached-indigo',
    skins: ['graphite'],
    group: 'calm',
    name: 'Unbleached and Indigo',
    mood: 'Unbleached cloth and deep blue dye. Words and picture stand side by side on the first screen, areas are set apart by a change of tone in place of lines, and the blue marks what a visitor can press.',
    bestFor: 'Makers, small hotels, clinics, studios: places that want calm without coldness.',
    risk: 'The blue is deep and quiet, so the button depends on its place and its size to be found. Check that a first-time visitor finds it within a few seconds.',
    ...fromJapaneseStudy(
      'Fukinsei (不均斉): balance without mirror symmetry',
      'Shizen (自然): nothing forced, nothing faked',
      'Shibui (渋い): quiet at first sight, detailed at second sight',
      'Traditional Japanese colour names have no single screen value',
    ),
    params: d({
      nav: 'top-inline', hero: 'split-media', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.25,
      fontHeading: 'dm-sans', fontBody: 'dm-sans', headingWeight: 500, headingTracking: -0.015, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.24, numerals: 'proportional',
      neutralHue: 90, neutralChroma: 0.02, accentHue: 250, accentChroma: 0.09, accentLightness: 0.4, colorStrategy: 'single-accent', theme: 'light', contrast: 0.85,
      radius: 2, elevation: 'tonal', borderWeight: 0, signature: 'none', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'plain-label',
    group: 'calm',
    name: 'Plain Ground',
    mood: 'A near-white ground, plain letters, a black button, and one dark green for small marks and links. No emblem, no badge, no decoration: the goods do the talking.',
    bestFor: 'Makers and small shops whose goods should speak for themselves: a bakery, a bookshop, a pottery, a hardware store.',
    risk: 'Without strong photographs of the goods the page has nothing to show. Plain goods on a plain ground is also the look of some well-known shops: keep your own name and your own colors in plain sight, and copy no other shop’s label, colors, or lettering.',
    ...fromJapaneseStudy(
      'Emptiness as a container, and the plain-goods approach in retail',
      'Kanso (簡素): plain and uncluttered, with few kinds of thing',
      'Empty space and plainness raise perceived quality only under conditions',
    ),
    params: d({
      nav: 'top-centered', hero: 'text-left', sections: 'grid', contentWidth: 'wide', emphasis: 'action', density: 1.2,
      fontHeading: 'public-sans', fontBody: 'public-sans', headingWeight: 600, headingTracking: 0, headingCase: 'sentence', baseSize: 16, scaleRatio: 1.24, numerals: 'tabular',
      neutralHue: 60, neutralChroma: 0.004, accentHue: 160, accentChroma: 0.09, accentLightness: 0.38, colorStrategy: 'quiet', theme: 'light', contrast: 0.9,
      radius: 0, elevation: 'flat', borderWeight: 1, signature: 'none', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none',
    }),
  },
];

const DIRECTION_TABLE = new Map<string, Direction>(DIRECTIONS.map((x) => [x.id, x]));

/** Find a curated Direction by its identifier. Returns `undefined` for anything else, including names of built-in object members. */
export function findDirection(id: string): Direction | undefined {
  return DIRECTION_TABLE.get(id);
}
