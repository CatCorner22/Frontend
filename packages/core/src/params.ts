// Design parameters: the small set of inputs from which every token derives.
// Each Step changes one group of these and nothing else ("one variable per Step").

export type NavPattern = 'top-inline' | 'top-centered' | 'split-cta' | 'side-rail';
export type HeroLayout = 'text-left' | 'centered' | 'split-media' | 'statement';
export type SectionRhythm = 'stacked' | 'alternating' | 'grid' | 'ledger';
export type ContentWidth = 'narrow' | 'standard' | 'wide';
export type Emphasis = 'headline' | 'action' | 'proof';
export type HeadingCase = 'sentence' | 'title' | 'upper';
export type Numerals = 'proportional' | 'tabular' | 'mono';
export type ColorStrategy = 'quiet' | 'single-accent' | 'duo' | 'tinted-surface' | 'color-block';
export type Theme = 'light' | 'dark';
export type Elevation = 'flat' | 'borders' | 'soft-shadow' | 'hard-shadow' | 'tonal';
export type Signature = 'none' | 'marker' | 'big-numerals' | 'color-band' | 'outline-type' | 'corner-tag';
export type A11yProfile = 'off' | 'advise' | 'enforce';

export type FontId =
  | 'system-sans'
  | 'system-serif'
  | 'inter'
  | 'public-sans'
  | 'dm-sans'
  | 'manrope'
  | 'instrument-sans'
  | 'outfit'
  | 'space-grotesk'
  | 'bricolage-grotesque'
  | 'fraunces'
  | 'source-serif-4'
  | 'newsreader'
  | 'playfair-display'
  | 'jetbrains-mono';

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
}

export const DEFAULT_PARAMS: DesignParams = {
  nav: 'top-inline',
  hero: 'text-left',
  sections: 'stacked',
  contentWidth: 'standard',
  emphasis: 'headline',
  density: 1,
  fontHeading: 'system-sans',
  fontBody: 'system-sans',
  headingWeight: 700,
  headingTracking: -0.01,
  headingCase: 'sentence',
  baseSize: 17,
  scaleRatio: 1.25,
  numerals: 'proportional',
  neutralHue: 250,
  neutralChroma: 0.006,
  accentHue: 250,
  accentChroma: 0.14,
  accentLightness: 0.5,
  accent2Hue: 60,
  colorStrategy: 'single-accent',
  theme: 'light',
  contrast: 0.7,
  radius: 8,
  elevation: 'borders',
  borderWeight: 1,
  signature: 'none',
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
  'system-sans': { id: 'system-sans', label: 'System sans', stack: SANS_FALLBACK, character: 'Whatever the device uses. Invisible and fast.', license: null },
  'system-serif': { id: 'system-serif', label: 'System serif', stack: SERIF_FALLBACK, character: 'Bookish and traditional, with nothing to download.', license: null },
  inter: { id: 'inter', label: 'Inter', stack: `"Inter Variable", ${SANS_FALLBACK}`, character: 'Neutral screen workhorse. Also the most common AI default.', license: 'OFL-1.1' },
  'public-sans': { id: 'public-sans', label: 'Public Sans', stack: `"Public Sans Variable", ${SANS_FALLBACK}`, character: 'Plain, civic, trustworthy.', license: 'OFL-1.1' },
  'dm-sans': { id: 'dm-sans', label: 'DM Sans', stack: `"DM Sans Variable", ${SANS_FALLBACK}`, character: 'Geometric and friendly, with round shapes.', license: 'OFL-1.1' },
  manrope: { id: 'manrope', label: 'Manrope', stack: `"Manrope Variable", ${SANS_FALLBACK}`, character: 'Modern and slightly technical, with open shapes.', license: 'OFL-1.1' },
  'instrument-sans': { id: 'instrument-sans', label: 'Instrument Sans', stack: `"Instrument Sans Variable", ${SANS_FALLBACK}`, character: 'Crisp and editorial, a little condensed.', license: 'OFL-1.1' },
  outfit: { id: 'outfit', label: 'Outfit', stack: `"Outfit Variable", ${SANS_FALLBACK}`, character: 'Round geometric display sans; cheerful at large sizes.', license: 'OFL-1.1' },
  'space-grotesk': { id: 'space-grotesk', label: 'Space Grotesk', stack: `"Space Grotesk Variable", ${SANS_FALLBACK}`, character: 'Quirky and technical, with distinctive letters.', license: 'OFL-1.1' },
  'bricolage-grotesque': { id: 'bricolage-grotesque', label: 'Bricolage Grotesque', stack: `"Bricolage Grotesque Variable", ${SANS_FALLBACK}`, character: 'Expressive, hand-cut feeling; strong personality in headings.', license: 'OFL-1.1' },
  fraunces: { id: 'fraunces', label: 'Fraunces', stack: `"Fraunces Variable", ${SERIF_FALLBACK}`, character: 'Soft, warm, old-style serif with character.', license: 'OFL-1.1' },
  'source-serif-4': { id: 'source-serif-4', label: 'Source Serif 4', stack: `"Source Serif 4 Variable", ${SERIF_FALLBACK}`, character: 'Clear, sturdy reading serif.', license: 'OFL-1.1' },
  newsreader: { id: 'newsreader', label: 'Newsreader', stack: `"Newsreader Variable", ${SERIF_FALLBACK}`, character: 'Newspaper serif; literate and calm.', license: 'OFL-1.1' },
  'playfair-display': { id: 'playfair-display', label: 'Playfair Display', stack: `"Playfair Display Variable", ${SERIF_FALLBACK}`, character: 'High-contrast display serif; elegant and formal.', license: 'OFL-1.1' },
  'jetbrains-mono': { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: `"JetBrains Mono Variable", ui-monospace, monospace`, character: 'Monospace; technical, tabular.', license: 'OFL-1.1' },
};
