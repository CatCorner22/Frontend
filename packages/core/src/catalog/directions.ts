// Directions: complete, coherent starting looks. A Direction sets every design parameter at once;
// the Steps then refine it one variable at a time. ("Explore genuinely different directions before code.")
//
// Every curated Direction is the builder's own composition, judged by eye on rendered Mockups.
// No Direction copies a brand, and none names one: no research record supports a resemblance claim.

import { DEFAULT_PARAMS, type DesignParams } from '../params.js';
import type { Evidence, SourceRef } from './types.js';

export interface Direction {
  id: string;
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
}

const REVIEWED = '2026-11-13';
const COMPOSED: SourceRef[] = [{ text: 'Composed by the assistant that wrote this Studio from the Catalog’s Options and judged by eye on rendered Mockups. No outside source was consulted, and no person has reviewed it.', basis: 'builder' }];
const record = { sources: COMPOSED, evidence: 'expert-opinion' as const, reviewed: REVIEWED };

const d = (overrides: Partial<DesignParams>): DesignParams => ({ ...DEFAULT_PARAMS, ...overrides });

export const DIRECTIONS: Direction[] = [
  {
    id: 'graphite-precision',
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
    name: 'Evening Formal',
    mood: 'Candlelight and engraved invitations. Dark, slow, elegant.',
    bestFor: 'Fine dining, events, jewelry, hotels.',
    risk: 'Thin, elegant letters need to be large to stay readable, so small text stays in the plainer letter style.',
    ...record,
    params: d({
      nav: 'top-centered', hero: 'centered', sections: 'alternating', contentWidth: 'standard', emphasis: 'headline', density: 1.3,
      fontHeading: 'playfair-display', fontBody: 'dm-sans', headingWeight: 500, headingTracking: -0.012, headingCase: 'sentence', baseSize: 17, scaleRatio: 1.42, numerals: 'proportional',
      neutralHue: 320, neutralChroma: 0.012, accentHue: 85, accentChroma: 0.11, accentLightness: 0.78, colorStrategy: 'single-accent', theme: 'dark', contrast: 0.5,
      radius: 4, elevation: 'tonal', borderWeight: 1, signature: 'none', atmosphere: 'spotlight', buttonFinish: 'outline', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
  {
    id: 'control-room',
    name: 'Control Room',
    mood: 'An instrument panel: dense, exact, numbers first.',
    bestFor: 'Dashboards, operations tools, technical services.',
    risk: 'Too tightly packed for a public information site; made for people who work in it all day.',
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
    name: 'Garden Ledger',
    mood: 'A seed catalog: deep green, sturdy letters with small feet, orderly lists.',
    bestFor: 'Garden, food, sustainability, outdoor and craft businesses.',
    risk: 'Dark green can look black in small text, so the text sizes here stay large.',
    ...record,
    params: d({
      nav: 'top-inline', hero: 'text-left', sections: 'ledger', contentWidth: 'standard', emphasis: 'headline', density: 1.12,
      fontHeading: 'source-serif-4', fontBody: 'instrument-sans', headingWeight: 600, headingTracking: -0.02, headingCase: 'sentence', baseSize: 18, scaleRatio: 1.3, numerals: 'tabular',
      neutralHue: 150, neutralChroma: 0.012, accentHue: 152, accentChroma: 0.11, accentLightness: 0.4, colorStrategy: 'single-accent', theme: 'light', contrast: 0.86,
      radius: 6, elevation: 'borders', borderWeight: 1, signature: 'big-numerals', atmosphere: 'grain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle',
    }),
  },
];

const DIRECTION_TABLE = new Map<string, Direction>(DIRECTIONS.map((x) => [x.id, x]));

/** Find a curated Direction by its identifier. Returns `undefined` for anything else, including names of built-in object members. */
export function findDirection(id: string): Direction | undefined {
  return DIRECTION_TABLE.get(id);
}
