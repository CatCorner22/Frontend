// Design parameters: the small set of inputs from which every token derives.
// Each Step owns one group of these and nothing else ("one variable per Step").
// The lists below are the single source of truth for which values exist: the types, the import check, and the Mockup renderer all read them.

export const NAV_PATTERNS = ['top-inline', 'top-centered', 'split-cta', 'side-rail'] as const;
export const HERO_LAYOUTS = ['text-left', 'centered', 'split-media', 'statement'] as const;
export const SECTION_RHYTHMS = ['stacked', 'alternating', 'grid', 'ledger', 'bento'] as const;
export const CONTENT_WIDTHS = ['narrow', 'standard', 'wide'] as const;
export const EMPHASES = ['headline', 'action', 'proof'] as const;
export const HEADING_CASES = ['sentence', 'title', 'upper'] as const;
export const NUMERAL_STYLES = ['proportional', 'tabular', 'mono'] as const;
export const COLOR_STRATEGIES = ['quiet', 'single-accent', 'duo', 'tinted-surface', 'color-block'] as const;
export const THEMES = ['light', 'dark'] as const;
export const ELEVATIONS = ['flat', 'borders', 'ring', 'soft-shadow', 'float', 'hard-shadow', 'tonal', 'glass'] as const;
export const ATMOSPHERES = ['plain', 'horizon', 'dot-grid', 'line-grid', 'spotlight', 'aurora', 'stars', 'grain'] as const;
export const BUTTON_FINISHES = ['flat', 'gloss', 'glow', 'outline', 'soft'] as const;
export const DISPLAY_TREATMENTS = ['solid', 'ink-gradient', 'accent-gradient'] as const;
export const MOTION_LEVELS = ['none', 'subtle', 'expressive'] as const;
export const SIGNATURES = ['none', 'marker', 'big-numerals', 'color-band', 'outline-type', 'corner-tag'] as const;
export const A11Y_PROFILES = ['off', 'advise', 'enforce'] as const;
export const FONT_IDS = [
  'system-sans', 'system-serif', 'inter', 'public-sans', 'dm-sans', 'manrope', 'instrument-sans', 'outfit',
  'space-grotesk', 'bricolage-grotesque', 'fraunces', 'source-serif-4', 'newsreader', 'playfair-display', 'jetbrains-mono',
] as const;

export type NavPattern = (typeof NAV_PATTERNS)[number];
export type HeroLayout = (typeof HERO_LAYOUTS)[number];
export type SectionRhythm = (typeof SECTION_RHYTHMS)[number];
export type ContentWidth = (typeof CONTENT_WIDTHS)[number];
export type Emphasis = (typeof EMPHASES)[number];
export type HeadingCase = (typeof HEADING_CASES)[number];
export type Numerals = (typeof NUMERAL_STYLES)[number];
export type ColorStrategy = (typeof COLOR_STRATEGIES)[number];
export type Theme = (typeof THEMES)[number];
export type Elevation = (typeof ELEVATIONS)[number];
export type Atmosphere = (typeof ATMOSPHERES)[number];
export type ButtonFinish = (typeof BUTTON_FINISHES)[number];
export type DisplayTreatment = (typeof DISPLAY_TREATMENTS)[number];
export type MotionLevel = (typeof MOTION_LEVELS)[number];
export type Signature = (typeof SIGNATURES)[number];
export type A11yProfile = (typeof A11Y_PROFILES)[number];
export type FontId = (typeof FONT_IDS)[number];

export interface DesignParams {
  // Structure
  nav: NavPattern;
  hero: HeroLayout;
  sections: SectionRhythm;
  contentWidth: ContentWidth;
  emphasis: Emphasis;
  /** Spacing multiplier: 0.8 (compact) to 1.35 (spacious). */
  density: number;

  // Type
  fontHeading: FontId;
  fontBody: FontId;
  headingWeight: number;
  /** Letter spacing of headings, in em. Negative tightens. */
  headingTracking: number;
  headingCase: HeadingCase;
  /** Body text size in px. */
  baseSize: number;
  /** Ratio between adjacent type sizes. 1.125 is calm; 1.5 is dramatic. */
  scaleRatio: number;
  numerals: Numerals;

  // Color
  neutralHue: number;
  /** 0 = pure gray; 0.03 = clearly tinted. */
  neutralChroma: number;
  accentHue: number;
  accentChroma: number;
  accentLightness: number;
  /** Second accent hue, used by the "duo" strategy. */
  accent2Hue: number;
  colorStrategy: ColorStrategy;
  theme: Theme;
  /** 0 (soft) to 1 (stark): how far text and borders sit from the background. */
  contrast: number;

  // Shape and depth
  /** Corner radius of controls, in px. 999 means pill. */
  radius: number;
  elevation: Elevation;
  /** Border thickness in px: 0, 1, 1.5, 2, or 3. */
  borderWeight: number;
  signature: Signature;

  // Finish: the details that make a design read as refined
  /** What sits behind the first screen: nothing, a grid, a glow, grain. */
  atmosphere: Atmosphere;
  buttonFinish: ButtonFinish;
  /** How the largest headline is filled. */
  displayTreatment: DisplayTreatment;
  motion: MotionLevel;
}

/** The allowed values of every parameter that takes one of a fixed list of names. */
export const PARAM_VALUES = {
  nav: NAV_PATTERNS, hero: HERO_LAYOUTS, sections: SECTION_RHYTHMS, contentWidth: CONTENT_WIDTHS, emphasis: EMPHASES,
  fontHeading: FONT_IDS, fontBody: FONT_IDS, headingCase: HEADING_CASES, numerals: NUMERAL_STYLES,
  colorStrategy: COLOR_STRATEGIES, theme: THEMES, elevation: ELEVATIONS, signature: SIGNATURES,
  atmosphere: ATMOSPHERES, buttonFinish: BUTTON_FINISHES, displayTreatment: DISPLAY_TREATMENTS, motion: MOTION_LEVELS,
} as const satisfies { [K in keyof DesignParams]?: readonly DesignParams[K][] };

/** The allowed range (lowest, highest) of every numeric parameter. */
export const PARAM_RANGES = {
  density: [0.5, 2], headingWeight: [100, 900], headingTracking: [-0.2, 0.4], baseSize: [10, 30], scaleRatio: [1, 2],
  neutralHue: [0, 360], neutralChroma: [0, 0.1], accentHue: [0, 360], accentChroma: [0, 0.4], accentLightness: [0, 1], accent2Hue: [0, 360],
  contrast: [0, 1], radius: [0, 999], borderWeight: [0, 8],
} as const satisfies { [K in keyof DesignParams]?: readonly [number, number] };

/** Every parameter name, in a fixed order. */
export const PARAM_KEYS = [...Object.keys(PARAM_VALUES), ...Object.keys(PARAM_RANGES)] as (keyof DesignParams)[];

/**
 * Throw unless every parameter holds an allowed value. The Mockup renderer calls this before it writes
 * any parameter into markup, so that a caller who skipped the import check cannot inject markup through a parameter.
 */
export function assertKnownParams(p: DesignParams): void {
  for (const [key, allowed] of Object.entries(PARAM_VALUES) as [keyof DesignParams, readonly string[]][]) {
    if (typeof p[key] !== 'string' || !allowed.includes(p[key] as string)) throw new Error(`The design parameter "${key}" holds a value that is not in its list.`);
  }
  for (const [key, [min, max]] of Object.entries(PARAM_RANGES) as [keyof DesignParams, readonly [number, number]][]) {
    const v = p[key];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new Error(`The design parameter "${key}" is not a number in its allowed range.`);
  }
}

/**
 * The plain start: the design a project has before any Direction or Decision.
 * It equals the default Option of every Step; a unit test holds the two together.
 */
export const DEFAULT_PARAMS: DesignParams = {
  nav: 'top-inline',
  hero: 'text-left',
  sections: 'stacked',
  contentWidth: 'standard',
  emphasis: 'headline',
  density: 1,
  fontHeading: 'public-sans',
  fontBody: 'public-sans',
  headingWeight: 600,
  headingTracking: -0.015,
  headingCase: 'sentence',
  baseSize: 17,
  scaleRatio: 1.25,
  numerals: 'tabular',
  neutralHue: 255,
  neutralChroma: 0.012,
  accentHue: 258,
  accentChroma: 0.15,
  accentLightness: 0.44,
  accent2Hue: 60,
  colorStrategy: 'single-accent',
  theme: 'light',
  contrast: 0.85,
  radius: 8,
  elevation: 'borders',
  borderWeight: 1,
  signature: 'none',
  atmosphere: 'plain',
  buttonFinish: 'flat',
  displayTreatment: 'solid',
  motion: 'subtle',
};

export interface FontInfo {
  id: FontId;
  label: string;
  /** CSS font-family stack. */
  stack: string;
  /** Plain-language character of the typeface. */
  character: string;
  /** SPDX license identifier of the font files; `null` for system fonts (nothing to ship). */
  license: string | null;
}

const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF_FALLBACK = 'Georgia, "Times New Roman", serif';

export const FONTS: Record<FontId, FontInfo> = {
  'system-sans': { id: 'system-sans', label: 'Device font', stack: SANS_FALLBACK, character: 'Whatever the device uses. Invisible and fast.', license: null },
  'system-serif': { id: 'system-serif', label: 'Device font with small feet', stack: SERIF_FALLBACK, character: 'Bookish and traditional, with nothing to download.', license: null },
  inter: { id: 'inter', label: 'Inter', stack: `"Inter Variable", ${SANS_FALLBACK}`, character: 'A neutral workhorse for screens. It is also on published lists of looks that many AI-made pages share.', license: 'OFL-1.1' },
  'public-sans': { id: 'public-sans', label: 'Public Sans', stack: `"Public Sans Variable", ${SANS_FALLBACK}`, character: 'Plain, civic, trustworthy.', license: 'OFL-1.1' },
  'dm-sans': { id: 'dm-sans', label: 'DM Sans', stack: `"DM Sans Variable", ${SANS_FALLBACK}`, character: 'Geometric and friendly, with round shapes.', license: 'OFL-1.1' },
  manrope: { id: 'manrope', label: 'Manrope', stack: `"Manrope Variable", ${SANS_FALLBACK}`, character: 'Modern and slightly technical, with open shapes.', license: 'OFL-1.1' },
  'instrument-sans': { id: 'instrument-sans', label: 'Instrument Sans', stack: `"Instrument Sans Variable", ${SANS_FALLBACK}`, character: 'Crisp and magazine-like, a little narrow.', license: 'OFL-1.1' },
  outfit: { id: 'outfit', label: 'Outfit', stack: `"Outfit Variable", ${SANS_FALLBACK}`, character: 'Round, geometric letters without feet, made for headings; cheerful at large sizes.', license: 'OFL-1.1' },
  'space-grotesk': { id: 'space-grotesk', label: 'Space Grotesk', stack: `"Space Grotesk Variable", ${SANS_FALLBACK}`, character: 'Quirky and technical, with distinctive letters.', license: 'OFL-1.1' },
  'bricolage-grotesque': { id: 'bricolage-grotesque', label: 'Bricolage Grotesque', stack: `"Bricolage Grotesque Variable", ${SANS_FALLBACK}`, character: 'Expressive, hand-cut feeling; strong personality in headings.', license: 'OFL-1.1' },
  fraunces: { id: 'fraunces', label: 'Fraunces', stack: `"Fraunces Variable", ${SERIF_FALLBACK}`, character: 'Soft, warm, old-style letters with small feet and plenty of character.', license: 'OFL-1.1' },
  'source-serif-4': { id: 'source-serif-4', label: 'Source Serif 4', stack: `"Source Serif 4 Variable", ${SERIF_FALLBACK}`, character: 'Clear, sturdy letters with small feet, made for reading.', license: 'OFL-1.1' },
  newsreader: { id: 'newsreader', label: 'Newsreader', stack: `"Newsreader Variable", ${SERIF_FALLBACK}`, character: 'Newspaper-style letters with small feet; literate and calm.', license: 'OFL-1.1' },
  'playfair-display': { id: 'playfair-display', label: 'Playfair Display', stack: `"Playfair Display Variable", ${SERIF_FALLBACK}`, character: 'Letters with small feet and with thick and thin strokes, made for headings; elegant and formal.', license: 'OFL-1.1' },
  'jetbrains-mono': { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: `"JetBrains Mono Variable", ui-monospace, monospace`, character: 'Typewriter-style letters, every one the same width; technical, good for columns of numbers.', license: 'OFL-1.1' },
};
