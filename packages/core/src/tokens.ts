// Token derivation: a few design parameters in, the complete set of design tokens out.
// A token is a named value (a color, a size, a shadow recipe) that the Mockup and the exported files both use.

import { contrastOnWashEmitted, contrastOverEmitted, ensureContrast, ensureContrastAll, hexOver, readableOn, shiftH, shiftL, toCss, toCssAlpha, toHex, type Oklch } from './color.js';
import { FONTS, type A11yProfile, type DesignParams } from './params.js';

export interface TokenIssue {
  id: string;
  /** Plain-language description of the pair that was checked. */
  pair: string;
  /** The contrast ratio measured before any repair. */
  ratio: number;
  required: number;
  /**
   * `warning`: the pair is below the requirement and was left as picked.
   * `repaired`: the Enforce profile changed a color, and the pair was measured again and now meets the requirement.
   */
  outcome: 'warning' | 'repaired';
  /** The ratio after the repair, measured again. Present only when the outcome is `repaired`. */
  after?: number;
}

/** One color pair that the Mockup draws, as measured from the final colors. */
export interface MeasuredPair {
  id: string;
  pair: string;
  /** The tokens that hold the two colors. */
  fgToken: string;
  bgToken: string;
  /** Opacity at which the foreground is drawn (1 for solid). For the highlighter stroke: the opacity of the stroke. */
  alpha: number;
  /** `text`: the foreground, at `alpha`, over the background. `wash`: solid text over a wash of `bgToken` at `alpha` on the first screen. */
  kind: 'text' | 'wash';
  ratio: number;
  required: number;
  passes: boolean;
}

export interface DerivedTokens {
  /** CSS custom properties, ready to write into a `:root { }` block. */
  css: Record<string, string>;
  /** The colors of the measured pairs, as hexadecimal digits: the same digits that the stylesheet carries. */
  hex: Record<string, string>;
  issues: TokenIssue[];
  /** Every checked pair with its final measured ratio, in every contrast profile. */
  pairs: MeasuredPair[];
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const round = (v: number, d = 3): number => Number(v.toFixed(d));
/** A measured contrast figure for display: two decimals, always rounded down, so that 4.497 never reads as "4.5" (finding T3-02). */
const figure = (v: number): number => Math.floor(v * 100 + 1e-9) / 100;
const rem = (px: number): string => `${round(px / 16, 4)}rem`;
/** Repairs aim slightly above each requirement, so that the colors still meet it after they are rounded for output. */
const MARGIN = 1.012;
const WHITE: Oklch = { l: 1, c: 0, h: 0 };
const BLACK: Oklch = { l: 0, c: 0, h: 0 };

/** The colors of the palette. Each one is written out as the token named in `TOKEN_OF`. */
type ColorKey =
  | 'bg' | 'surface' | 'surface2' | 'cardBg' | 'borderStrong' | 'text' | 'textMuted'
  | 'accent' | 'onAccent' | 'accentText' | 'accentSoft' | 'accent2' | 'onAccent2'
  | 'action' | 'onAction' | 'btnLabel' | 'btnFill'
  | 'bandBg' | 'bandText' | 'bandSolidBg' | 'bandSolidText'
  | 'heroBg' | 'heroText' | 'focus' | 'focusHero' | 'marker';

type AlphaKey = 'softLabelAlpha' | 'heroLedeAlpha' | 'markerAlpha';

type Palette = Record<ColorKey, Oklch> &
  Record<AlphaKey, number> & {
    /** Hairlines are the text color at low opacity, so that they sit naturally on any surface. */
    hairlineAlpha: number;
    /** True when the first screen is painted in the accent ("Color block"). */
    heroPainted: boolean;
  };

export const TOKEN_OF: Record<ColorKey, string> = {
  bg: '--bg', surface: '--surface', surface2: '--surface-2', cardBg: '--card-surface', borderStrong: '--border-strong', text: '--text', textMuted: '--text-muted',
  accent: '--accent', onAccent: '--on-accent', accentText: '--accent-text', accentSoft: '--accent-soft', accent2: '--accent-2', onAccent2: '--on-accent-2',
  action: '--action', onAction: '--on-action', btnLabel: '--btn-label', btnFill: '--btn-fill',
  bandBg: '--band-bg', bandText: '--band-text', bandSolidBg: '--band-solid-bg', bandSolidText: '--band-solid-text',
  heroBg: '--hero-bg', heroText: '--hero-text', focus: '--focus', focusHero: '--focus-hero', marker: '--marker-ink',
};

const filledButton = (p: DesignParams): boolean => p.buttonFinish === 'flat' || p.buttonFinish === 'gloss' || p.buttonFinish === 'glow';
/** Cards take the second surface tone when no line or shadow separates them. */
const tonalCards = (p: DesignParams): boolean => p.elevation === 'flat' || p.elevation === 'tonal';

function basePalette(p: DesignParams): Palette {
  const dark = p.theme === 'dark';
  const k = p.contrast;
  const n = (l: number, chromaScale = 1): Oklch => ({ l, c: p.neutralChroma * chromaScale, h: p.neutralHue });
  const tinted = p.colorStrategy === 'tinted-surface';

  let bg: Oklch;
  let surface: Oklch;
  let surface2: Oklch;
  if (dark) {
    const base = lerp(0.215, 0.135, k);
    bg = tinted ? { l: base + 0.01, c: 0.03, h: p.accentHue } : n(base, 1.6);
    surface = tinted ? { l: base + 0.045, c: 0.035, h: p.accentHue } : n(base + 0.04, 1.6);
    surface2 = tinted ? { l: base + 0.085, c: 0.04, h: p.accentHue } : n(base + 0.08, 1.6);
  } else {
    bg = tinted ? { l: 0.962, c: 0.028, h: p.accentHue } : n(0.985);
    surface = tinted ? { l: 0.988, c: 0.014, h: p.accentHue } : { l: 1, c: 0, h: p.neutralHue };
    surface2 = tinted ? { l: 0.93, c: 0.04, h: p.accentHue } : n(0.955, 1.3);
  }
  const cardBg = tonalCards(p) ? surface2 : surface;

  const text = dark ? n(lerp(0.87, 0.97, k), 1.2) : n(lerp(0.33, 0.15, k), 2.2);
  const textMuted = dark ? n(lerp(0.67, 0.76, k), 1.5) : n(lerp(0.57, 0.44, k), 2.2);
  const hairlineAlpha = dark ? lerp(0.1, 0.18, k) : lerp(0.08, 0.16, k);
  const borderStrong = dark ? n(bg.l + lerp(0.2, 0.36, k), 1.8) : n(lerp(0.74, 0.5, k), 2);

  const accentL = dark ? Math.min(0.82, Math.max(p.accentLightness + 0.14, 0.62)) : p.accentLightness;
  const accent: Oklch = { l: accentL, c: p.accentChroma, h: p.accentHue };
  const accent2: Oklch = p.colorStrategy === 'duo' ? { l: accentL, c: p.accentChroma, h: p.accent2Hue } : accent;
  const quiet = p.colorStrategy === 'quiet';
  const accentSoft: Oklch = quiet
    ? surface2
    : dark
      ? { l: bg.l + 0.1, c: Math.min(p.accentChroma * 0.45, 0.07), h: p.accentHue }
      : { l: 0.945, c: Math.min(p.accentChroma * 0.32, 0.05), h: p.accentHue };

  const action = quiet ? text : accent;
  const onAction = quiet ? bg : readableOn(accent);

  let bandBg: Oklch = accentSoft;
  let bandText: Oklch = text;
  let heroBg: Oklch = bg;
  let heroText: Oklch = text;
  const heroPainted = p.colorStrategy === 'color-block';
  if (p.colorStrategy === 'duo') {
    // On a dark page a bright slab of color glares, so the band takes a deep shade of the second color (decision D42).
    bandBg = dark ? { l: 0.4, c: Math.min(p.accentChroma, 0.16), h: p.accent2Hue } : accent2;
    bandText = readableOn(bandBg);
  }
  if (heroPainted) {
    // The first screen is painted in the accent; the band beneath it inverts to ink so that the two never merge.
    bandBg = text;
    bandText = bg;
    heroBg = accent;
    heroText = readableOn(accent);
  }

  // Decision D24: the accent, used as text (links, small labels) or as the focus ring, keeps its hue but stands
  // at least 3:1 from every surface it is drawn on, in every contrast profile. The picked accent, as used for fills, never changes.
  const surfaces = [bg, cardBg, ...(p.nav === 'side-rail' ? [surface2] : [])];
  const accentText = ensureContrastAll(accent, [bg, cardBg], 3 * MARGIN);
  const focus = ensureContrastAll(p.colorStrategy === 'duo' ? accent2 : accent, surfaces, 3 * MARGIN);
  // On a painted first screen the accent cannot ring itself; the ring takes the ink of that screen.
  const focusHero = heroPainted ? heroText : focus;

  // Outline and soft buttons carry their color in the label, not in a fill.
  const labelInk = quiet ? text : accentText;
  const btnLabel = filledButton(p) ? onAction : labelInk;
  const btnFill = filledButton(p) ? action : p.buttonFinish === 'soft' ? accentSoft : bg;

  // The highlighter stroke: the accent (or the second color) at part strength, whatever the color strategy.
  const marker = heroPainted ? heroText : p.colorStrategy === 'duo' ? accent2 : accent;

  return {
    bg, surface, surface2, cardBg, hairlineAlpha, borderStrong, text, textMuted,
    accent, onAccent: readableOn(accent), accentText, accentSoft, accent2, onAccent2: readableOn(accent2),
    action, onAction, btnLabel, btnFill, bandBg, bandText, bandSolidBg: accent, bandSolidText: readableOn(accent),
    heroBg, heroText, heroPainted, focus, focusHero, marker,
    softLabelAlpha: 0.78, heroLedeAlpha: 0.88, markerAlpha: dark ? 0.5 : 0.3,
  };
}

interface PairSpec {
  id: string;
  pair: string;
  fg: ColorKey;
  bg: ColorKey;
  /** The palette field that holds the opacity of the foreground, when the Mockup draws it translucent. */
  alpha?: 'softLabelAlpha' | 'heroLedeAlpha';
  required: number;
  /** In Enforce, which side moves. Fills move so that their labels stay near-white or near-black. */
  move: 'fg' | 'bg';
  applies?: (p: DesignParams, pal: Palette) => boolean;
}

const sideRail = (p: DesignParams): boolean => p.nav === 'side-rail';
const outlineButton = (p: DesignParams): boolean => p.buttonFinish === 'outline';
const solidBand = (p: DesignParams, pal: Palette): boolean => p.signature === 'color-band' && !pal.heroPainted;
const factsInBand = (p: DesignParams): boolean => p.emphasis !== 'proof';

/**
 * The color pairs that the Mockup draws in solid or translucent color, derived from the template's stylesheet (`NOT_CHECKED` lists what is left out).
 * Text needs 4.5:1. Large text, control boundaries, and focus rings need 3:1 (WCAG 2.2, criteria 1.4.3 and 1.4.11).
 * A unit test measures each pair again from the emitted tokens.
 */
export const PAIRS: readonly PairSpec[] = [
  { id: 'text-on-page', pair: 'Reading text on the page background', fg: 'text', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'text-on-card', pair: 'Reading text on boxes', fg: 'text', bg: 'cardBg', required: 4.5, move: 'fg' },
  { id: 'text-on-tone', pair: 'Reading text on the tinted section', fg: 'text', bg: 'surface2', required: 4.5, move: 'fg' },
  { id: 'text-on-field', pair: 'Typed text in form fields', fg: 'text', bg: 'surface', required: 4.5, move: 'fg' },
  { id: 'muted-on-page', pair: 'Secondary text on the page background', fg: 'textMuted', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'muted-on-card', pair: 'Secondary text on boxes', fg: 'textMuted', bg: 'cardBg', required: 4.5, move: 'fg' },
  { id: 'muted-on-tone', pair: 'Secondary text on the tinted section', fg: 'textMuted', bg: 'surface2', required: 4.5, move: 'fg' },
  { id: 'muted-on-field', pair: 'Small labels on the lightest background', fg: 'textMuted', bg: 'surface', required: 4.5, move: 'fg' },
  { id: 'link-on-page', pair: 'Links on the page background', fg: 'accentText', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'link-on-card', pair: 'Links on boxes', fg: 'accentText', bg: 'cardBg', required: 4.5, move: 'fg' },
  { id: 'text-on-hero', pair: 'Text on the colored first screen', fg: 'heroText', bg: 'heroBg', required: 4.5, move: 'bg', applies: (_p, pal) => pal.heroPainted },
  { id: 'lede-on-hero', pair: 'The opening paragraph on the colored first screen', fg: 'heroText', bg: 'heroBg', alpha: 'heroLedeAlpha', required: 4.5, move: 'bg', applies: (_p, pal) => pal.heroPainted },
  { id: 'fact-labels-in-hero', pair: 'Small labels under the facts in the first screen', fg: 'heroText', bg: 'heroBg', alpha: 'softLabelAlpha', required: 4.5, move: 'fg', applies: (p) => !factsInBand(p) },
  { id: 'band-figures', pair: 'Large figures on the facts band', fg: 'bandText', bg: 'bandBg', required: 3, move: 'bg', applies: (p, pal) => factsInBand(p) && !solidBand(p, pal) },
  { id: 'band-labels', pair: 'Small labels on the facts band', fg: 'bandText', bg: 'bandBg', alpha: 'softLabelAlpha', required: 4.5, move: 'bg', applies: (p, pal) => factsInBand(p) && !solidBand(p, pal) },
  { id: 'solid-band-figures', pair: 'Large figures on the solid color band', fg: 'bandSolidText', bg: 'bandSolidBg', required: 3, move: 'bg', applies: (p, pal) => factsInBand(p) && solidBand(p, pal) },
  { id: 'solid-band-labels', pair: 'Small labels on the solid color band', fg: 'bandSolidText', bg: 'bandSolidBg', alpha: 'softLabelAlpha', required: 4.5, move: 'bg', applies: (p, pal) => factsInBand(p) && solidBand(p, pal) },
  { id: 'button-label', pair: 'Main button label on its fill', fg: 'btnLabel', bg: 'btnFill', required: 4.5, move: 'bg', applies: (p) => filledButton(p) },
  { id: 'soft-button-label', pair: 'Main button label on its tint', fg: 'btnLabel', bg: 'btnFill', required: 4.5, move: 'fg', applies: (p) => p.buttonFinish === 'soft' },
  { id: 'outline-button-on-page', pair: 'Outline button label on the page background', fg: 'btnLabel', bg: 'bg', required: 4.5, move: 'fg', applies: outlineButton },
  { id: 'outline-button-on-card', pair: 'Outline button label on boxes', fg: 'btnLabel', bg: 'cardBg', required: 4.5, move: 'fg', applies: outlineButton },
  { id: 'outline-button-on-rail', pair: 'Outline button label on the left column of links', fg: 'btnLabel', bg: 'surface2', required: 4.5, move: 'fg', applies: (p) => outlineButton(p) && sideRail(p) },
  { id: 'field-border-on-card', pair: 'Form field borders against the box around them', fg: 'borderStrong', bg: 'cardBg', required: 3, move: 'fg' },
  { id: 'field-border-on-field', pair: 'Form field borders against the field itself', fg: 'borderStrong', bg: 'surface', required: 3, move: 'fg' },
  { id: 'focus-on-page', pair: 'The outline around the control in use, against the page background', fg: 'focus', bg: 'bg', required: 3, move: 'fg' },
  { id: 'focus-on-card', pair: 'The outline around the control in use, against boxes', fg: 'focus', bg: 'cardBg', required: 3, move: 'fg' },
  { id: 'focus-on-rail', pair: 'The outline around the control in use, against the left column of links', fg: 'focus', bg: 'surface2', required: 3, move: 'fg', applies: sideRail },
  { id: 'focus-on-hero', pair: 'The outline around the control in use, against the first screen', fg: 'focusHero', bg: 'heroBg', required: 3, move: 'fg' },
  { id: 'tag-label', pair: 'The words of the tilted label on its color', fg: 'onAccent2', bg: 'accent2', required: 4.5, move: 'fg', applies: (p) => p.signature === 'corner-tag' },
];

/** What the contrast checks do not cover. The Studio shows this list beside the contrast notes. */
export const NOT_CHECKED: readonly string[] = [
  'Text over a background glow, soft clouds of color, a pattern of dots, lines, or stars, or a frosted-glass box, where the color behind the text varies from point to point.',
  'A headline filled with a fade or with a two-color gradient. “Fix for me” keeps both ends of the fill at 3 to 1 or better against the first screen; “Warn me” does not measure the fill.',
  'Text over your photographs.',
  'How a button or a link looks while the pointer is over it, or while it is pressed.',
  'Anything a person must judge: whether the page reads well in sunlight, with a screen reader, or to a person with low vision.',
];

// Every pair is measured on the colors as they are written to the page, so that "passes" means the emitted colors pass (finding T2-01).
const measure = (pal: Palette, spec: PairSpec): number => contrastOverEmitted(pal[spec.fg], spec.alpha ? pal[spec.alpha] : 1, pal[spec.bg]);
const markerApplies = (p: DesignParams): boolean => p.signature === 'marker';
const MARKER_PAIR = { id: 'marked-phrase', pair: 'The headline phrase over its highlighter stroke', required: 3 };
const measureMarker = (pal: Palette): number => contrastOnWashEmitted(pal.heroText, pal.marker, pal.markerAlpha, pal.heroBg);

/**
 * Apply the contrast profile.
 * Off: nothing is reported. Advise: each pair below its requirement is reported and left as picked.
 * Enforce: each such pair is repaired, measured again, and reported as repaired only if it now meets the requirement.
 */
function applyProfile(p: DesignParams, pal: Palette, profile: A11yProfile): TokenIssue[] {
  if (profile === 'off') return [];
  const specs = PAIRS.filter((s) => !s.applies || s.applies(p, pal));
  const before = new Map<string, number>();
  const failing = (): PairSpec[] => specs.filter((s) => measure(pal, s) < s.required);
  for (const s of failing()) before.set(s.id, measure(pal, s));
  const markerBefore = markerApplies(p) && measureMarker(pal) < MARKER_PAIR.required ? measureMarker(pal) : null;

  if (profile === 'enforce') {
    // A repair of one pair can move a color that another pair shares, so repeat until every pair holds (four rounds at most).
    for (let pass = 0; pass < 4; pass++) {
      const todo = failing();
      if (todo.length === 0) break;
      for (const s of todo) {
        if (!before.has(s.id)) before.set(s.id, measure(pal, s));
        if (measure(pal, s) >= s.required) continue;
        if (s.alpha && pal[s.alpha] < 1) {
          pal[s.alpha] = 1;
          if (measure(pal, s) >= s.required) continue;
        }
        if (s.move === 'fg') pal[s.fg] = ensureContrast(pal[s.fg], pal[s.bg], s.required * MARGIN);
        else pal[s.bg] = ensureContrast(pal[s.bg], pal[s.fg], s.required * MARGIN);
      }
      // A filled button draws with the action color, so the two stay one color.
      if (filledButton(p)) {
        pal.action = pal.btnFill;
        pal.onAction = pal.btnLabel;
      }
    }
    if (markerBefore !== null) {
      // Thin the highlighter stroke until the phrase over it reads at 3:1, down to a faint minimum.
      while (pal.markerAlpha > 0.1 && measureMarker(pal) < MARKER_PAIR.required) pal.markerAlpha = round(pal.markerAlpha - 0.02, 2);
    }
  }

  const issues: TokenIssue[] = [];
  for (const s of specs) {
    const was = before.get(s.id);
    if (was === undefined) continue;
    const now = measure(pal, s);
    const repaired = profile === 'enforce' && now >= s.required;
    issues.push({ id: s.id, pair: s.pair, ratio: figure(was), required: s.required, outcome: repaired ? 'repaired' : 'warning', ...(repaired ? { after: figure(now) } : {}) });
  }
  if (markerBefore !== null) {
    const now = measureMarker(pal);
    const repaired = profile === 'enforce' && now >= MARKER_PAIR.required;
    issues.push({ ...MARKER_PAIR, ratio: figure(markerBefore), outcome: repaired ? 'repaired' : 'warning', ...(repaired ? { after: figure(now) } : {}) });
  }
  return issues;
}

/** Measure every applicable pair from the final palette. */
function measurePairs(p: DesignParams, pal: Palette): MeasuredPair[] {
  const out: MeasuredPair[] = PAIRS.filter((s) => !s.applies || s.applies(p, pal)).map((s) => {
    const ratio = measure(pal, s);
    return { id: s.id, pair: s.pair, fgToken: TOKEN_OF[s.fg], bgToken: TOKEN_OF[s.bg], alpha: s.alpha ? pal[s.alpha] : 1, kind: 'text' as const, ratio: figure(ratio), required: s.required, passes: ratio >= s.required };
  });
  if (markerApplies(p)) {
    const ratio = measureMarker(pal);
    out.push({ ...MARKER_PAIR, fgToken: TOKEN_OF.heroText, bgToken: TOKEN_OF.marker, alpha: pal.markerAlpha, kind: 'wash', ratio: figure(ratio), passes: ratio >= MARKER_PAIR.required });
  }
  return out;
}

/** A shadow color: near-black, faintly tinted toward the neutral hue, like a real shadow. */
function shade(p: DesignParams, alpha: number): string {
  return p.theme === 'dark' ? `rgb(0 0 0 / ${alpha})` : toCssAlpha({ l: 0.22, c: 0.03, h: p.neutralHue }, alpha);
}

function elevationTokens(p: DesignParams, pal: Palette): Record<string, string> {
  const dark = p.theme === 'dark';
  const hairline = toCssAlpha(pal.text, pal.hairlineAlpha);
  const base = { '--card-backdrop': 'none', '--header-bg': toCss(pal.bg), '--header-backdrop': 'none', '--header-position': 'static', '--page-atmo': 'none' };
  switch (p.elevation) {
    case 'flat':
      return { ...base, '--card-bg': toCss(pal.surface2), '--card-border': 'transparent', '--card-border-w': '0px', '--card-shadow': 'none', '--control-shadow': 'none' };
    case 'borders':
      return { ...base, '--card-bg': toCss(pal.surface), '--card-border': hairline, '--card-border-w': `${Math.max(p.borderWeight, 1)}px`, '--card-shadow': 'none', '--control-shadow': 'none' };
    case 'ring':
      // A one-pixel ring plus a whisper of shadow: a crisp edge. Record 08 documents the ring as the first shadow layer in several open design systems.
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.05)' : 'oklch(100% 0 0 / 0.6)'}, 0 0 0 1px ${hairline}, 0 1px 2px ${shade(p, dark ? 0.4 : 0.05)}, 0 2px 6px -1px ${shade(p, dark ? 0.3 : 0.04)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.4 : 0.08)}`,
      };
    case 'soft-shadow':
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.06)' : 'oklch(100% 0 0 / 0.7)'}, 0 0 0 1px ${toCssAlpha(pal.text, dark ? 0.1 : 0.04)}, 0 1px 2px ${shade(p, dark ? 0.5 : 0.06)}, 0 4px 10px ${shade(p, dark ? 0.4 : 0.05)}, 0 14px 32px ${shade(p, dark ? 0.35 : 0.07)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.5 : 0.1)}`,
      };
    case 'float':
      // Wide, soft, layered: panels that hover well above the page.
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.07)' : 'oklch(100% 0 0 / 0.8)'}, 0 0 0 0.5px ${toCssAlpha(pal.text, dark ? 0.14 : 0.08)}, 0 2px 4px ${shade(p, dark ? 0.4 : 0.04)}, 0 12px 24px -6px ${shade(p, dark ? 0.5 : 0.08)}, 0 36px 72px -24px ${shade(p, dark ? 0.6 : 0.16)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.5 : 0.08)}, 0 4px 12px -4px ${shade(p, dark ? 0.5 : 0.1)}`,
      };
    case 'hard-shadow': {
      const ink = toCss(pal.text);
      const off = Math.max(3, p.borderWeight * 2);
      return { ...base, '--card-bg': toCss(pal.surface), '--card-border': ink, '--card-border-w': `${Math.max(p.borderWeight, 2)}px`, '--card-shadow': `${off}px ${off}px 0 0 ${ink}`, '--control-shadow': `${Math.max(2, off - 1)}px ${Math.max(2, off - 1)}px 0 0 ${ink}` };
    }
    case 'tonal':
      return { ...base, '--card-bg': toCss(pal.surface2), '--card-border': 'transparent', '--card-border-w': '0px', '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.06)' : 'oklch(100% 0 0 / 0.7)'}`, '--control-shadow': 'none' };
    case 'glass':
      // Translucent surface, blurred backdrop, bright top edge. Needs something behind it to read as glass.
      return {
        '--card-bg': toCssAlpha(pal.surface, dark ? 0.46 : 0.58), '--card-backdrop': 'blur(18px) saturate(170%)',
        '--card-border': dark ? 'oklch(100% 0 0 / 0.12)' : 'oklch(100% 0 0 / 0.7)', '--card-border-w': '1px',
        '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.1)' : 'oklch(100% 0 0 / 0.75)'}, 0 0 0 1px ${toCssAlpha(pal.text, dark ? 0.06 : 0.05)}, 0 10px 34px -10px ${shade(p, dark ? 0.55 : 0.16)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.4 : 0.08)}`,
        '--header-bg': toCssAlpha(pal.bg, dark ? 0.6 : 0.68), '--header-backdrop': 'blur(14px) saturate(170%)', '--header-position': 'sticky',
        // Glass needs light behind it: two faint, fixed glows in the accent hues.
        '--page-atmo': `radial-gradient(ellipse 50% 42% at 12% 22%, ${toCssAlpha(pal.accent, dark ? 0.3 : 0.2)}, transparent 70%), radial-gradient(ellipse 46% 40% at 88% 68%, ${toCssAlpha(p.colorStrategy === 'duo' ? pal.accent2 : shiftH(pal.accent, 48), dark ? 0.26 : 0.17)}, transparent 70%)`,
      };
    default:
      return { ...base, '--card-bg': toCss(pal.surface), '--card-border': hairline, '--card-border-w': `${p.borderWeight}px`, '--card-shadow': 'none', '--control-shadow': 'none' };
  }
}

function buttonTokens(p: DesignParams, pal: Palette): Record<string, string> {
  const dark = p.theme === 'dark';
  const a = pal.action;
  const hoverBy = a.l > 0.55 ? -0.05 : 0.06;
  let out: Record<string, string>;
  switch (p.buttonFinish) {
    case 'gloss':
      // Light from above: a lighter top, a bright inner edge, a dark ring, and a tinted drop shadow.
      out = {
        '--btn-bg': `linear-gradient(to bottom, ${toCss(shiftL(a, 0.07))}, ${toCss(shiftL(a, -0.02))})`,
        '--btn-bg-hover': `linear-gradient(to bottom, ${toCss(shiftL(a, 0.1))}, ${toCss(shiftL(a, 0.01))})`,
        '--btn-color': toCss(pal.btnLabel), '--btn-border': 'transparent',
        '--btn-shadow': `inset 0 1px 0 oklch(100% 0 0 / ${dark ? 0.2 : 0.3}), inset 0 -1px 0 oklch(0% 0 0 / 0.14), 0 0 0 1px ${toCss(shiftL(a, -0.1))}, 0 1px 2px oklch(0% 0 0 / 0.24), 0 4px 10px -2px ${toCssAlpha(a, 0.4)}`,
        '--btn-shadow-hover': `inset 0 1px 0 oklch(100% 0 0 / ${dark ? 0.24 : 0.36}), inset 0 -1px 0 oklch(0% 0 0 / 0.14), 0 0 0 1px ${toCss(shiftL(a, -0.1))}, 0 2px 4px oklch(0% 0 0 / 0.24), 0 8px 18px -4px ${toCssAlpha(a, 0.5)}`,
      };
      break;
    case 'glow':
      out = {
        '--btn-bg': toCss(a), '--btn-bg-hover': toCss(shiftL(a, hoverBy)), '--btn-color': toCss(pal.btnLabel), '--btn-border': 'transparent',
        '--btn-shadow': `0 0 0 1px ${toCssAlpha(a, 0.55)}, 0 1px 2px oklch(0% 0 0 / 0.2), 0 8px 26px -4px ${toCssAlpha(a, dark ? 0.7 : 0.5)}`,
        '--btn-shadow-hover': `0 0 0 1px ${toCssAlpha(a, 0.7)}, 0 1px 2px oklch(0% 0 0 / 0.2), 0 12px 36px -4px ${toCssAlpha(a, dark ? 0.85 : 0.65)}`,
      };
      break;
    case 'outline':
      out = { '--btn-bg': 'transparent', '--btn-bg-hover': toCssAlpha(pal.btnLabel, 0.09), '--btn-color': toCss(pal.btnLabel), '--btn-border': toCss(pal.btnLabel), '--btn-shadow': 'none', '--btn-shadow-hover': 'none' };
      break;
    case 'soft':
      out = { '--btn-bg': toCss(pal.btnFill), '--btn-bg-hover': toCss(shiftL(pal.btnFill, dark ? 0.04 : -0.035)), '--btn-color': toCss(pal.btnLabel), '--btn-border': 'transparent', '--btn-shadow': 'none', '--btn-shadow-hover': 'none' };
      break;
    default:
      // Flat: one solid color. A hairline of darker edge keeps the shape crisp on any background.
      out = { '--btn-bg': toCss(a), '--btn-bg-hover': toCss(shiftL(a, hoverBy)), '--btn-color': toCss(pal.btnLabel), '--btn-border': toCss(shiftL(a, a.l > 0.55 ? -0.08 : -0.05)), '--btn-shadow': 'var(--control-shadow)', '--btn-shadow-hover': 'var(--control-shadow)' };
  }
  if (p.elevation === 'hard-shadow') {
    // The sticker look owns the button edge, whatever the finish.
    out['--btn-border'] = toCss(pal.text);
    out['--btn-shadow'] = 'var(--control-shadow)';
    out['--btn-shadow-hover'] = 'var(--control-shadow)';
  }
  return out;
}

function atmosphereTokens(p: DesignParams, pal: Palette): Record<string, string> {
  const dark = p.theme === 'dark';
  const ink = pal.heroText;
  const glow = pal.heroPainted ? pal.heroText : pal.accent;
  const glow2 = pal.heroPainted ? pal.heroText : p.colorStrategy === 'duo' ? pal.accent2 : shiftH(pal.accent, 48);
  const glow3 = pal.heroPainted ? pal.heroText : shiftH(pal.accent, -42);
  const fade = 'radial-gradient(ellipse 85% 95% at 50% 0%, #000 22%, transparent 80%)';
  const out: Record<string, string> = { '--atmo-image': 'none', '--atmo-size': 'auto', '--atmo-mask': 'none', '--grain-opacity': '0' };
  switch (p.atmosphere) {
    case 'horizon':
      out['--atmo-image'] = `linear-gradient(to bottom, ${toCssAlpha(glow, dark ? 0.18 : 0.11)}, transparent 64%)`;
      break;
    case 'dot-grid':
      out['--atmo-image'] = `radial-gradient(circle at center, ${toCssAlpha(ink, dark ? 0.28 : 0.22)} 1px, transparent 1.6px)`;
      out['--atmo-size'] = '24px 24px';
      out['--atmo-mask'] = fade;
      break;
    case 'line-grid': {
      const line = toCssAlpha(ink, dark ? 0.1 : 0.075);
      out['--atmo-image'] = `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`;
      out['--atmo-size'] = '64px 64px';
      out['--atmo-mask'] = fade;
      break;
    }
    case 'spotlight':
      out['--atmo-image'] = `radial-gradient(ellipse 62% 72% at 50% -18%, ${toCssAlpha(glow, dark ? 0.46 : 0.26)}, transparent 68%)`;
      break;
    case 'aurora':
      out['--atmo-image'] = [
        `radial-gradient(ellipse 46% 58% at 16% -4%, ${toCssAlpha(glow, dark ? 0.42 : 0.27)}, transparent 70%)`,
        `radial-gradient(ellipse 42% 52% at 84% 2%, ${toCssAlpha(glow2, dark ? 0.36 : 0.23)}, transparent 70%)`,
        `radial-gradient(ellipse 52% 46% at 56% 40%, ${toCssAlpha(glow3, dark ? 0.2 : 0.12)}, transparent 72%)`,
      ].join(', ');
      break;
    case 'stars': {
      // Eleven stars of three sizes, each at its own place in one of three tiles of different sizes. Because the tiles
      // repeat at different distances, the eye finds no rows: the field looks scattered, not ruled (decision D42).
      const star = (x: number, y: number, radius: number, color: Oklch, alpha: number): string =>
        `radial-gradient(circle at ${x}% ${y}%, ${toCssAlpha(color, dark ? alpha : alpha * 0.6)} ${radius}px, transparent ${radius + 0.7}px)`;
      const small: [number, number][] = [[7, 13], [31, 71], [58, 29], [86, 88]];
      const medium: [number, number][] = [[14, 52], [43, 9], [69, 77], [92, 36]];
      const large: [number, number][] = [[22, 81], [51, 44], [83, 12]];
      out['--atmo-image'] = [
        ...large.map(([x, y], i) => star(x, y, 1.3, i === 1 ? glow2 : ink, 0.95)),
        ...medium.map(([x, y], i) => star(x, y, 0.9, i === 2 ? glow2 : ink, 0.7)),
        ...small.map(([x, y]) => star(x, y, 0.6, ink, 0.45)),
        `radial-gradient(ellipse 70% 80% at 50% -25%, ${toCssAlpha(glow, dark ? 0.3 : 0.16)}, transparent 70%)`,
      ].join(', ');
      out['--atmo-size'] = [...large.map(() => '523px 487px'), ...medium.map(() => '419px 397px'), ...small.map(() => '311px 283px'), '100% 100%'].join(', ');
      out['--atmo-mask'] = 'linear-gradient(to bottom, #000 55%, transparent 100%)';
      break;
    }
    case 'grain':
      out['--grain-opacity'] = dark ? '0.16' : '0.11';
      break;
    default:
      break;
  }
  return out;
}

function displayTokens(p: DesignParams, pal: Palette, profile: A11yProfile): Record<string, string> {
  const ground = pal.heroBg;
  if (p.displayTreatment === 'ink-gradient') {
    // A quiet sheen: full ink at the top, fading slightly toward the bottom.
    let fade = 0.56;
    // Large text needs 3:1. Under "Fix for me" the faded end is strengthened until it holds that against the first screen (finding T2-03).
    if (profile === 'enforce') while (fade < 1 && contrastOverEmitted(pal.heroText, fade, ground) < 3 * MARGIN) fade = round(fade + 0.04, 2);
    return { '--display-fill': `linear-gradient(to bottom, ${toCss(pal.heroText)} 28%, ${toCssAlpha(pal.heroText, Math.min(1, fade))} 112%)` };
  }
  if (p.displayTreatment === 'accent-gradient') {
    let from = pal.heroPainted ? pal.heroText : pal.accentText;
    let to = pal.heroPainted ? shiftL(pal.heroText, pal.heroText.l > 0.5 ? -0.16 : 0.2) : p.colorStrategy === 'duo' ? pal.accent2 : shiftH(pal.accentText, 52);
    if (profile === 'enforce') {
      // Large text needs 3:1.
      from = ensureContrast(from, ground, 3 * MARGIN);
      to = ensureContrast(to, ground, 3 * MARGIN);
    }
    // The ends are written as exact digits. The blend between them runs in the OKLab color space, where the middle keeps a
    // lightness between its two ends; a blend in plain red-green-blue can dip darker in the middle (finding T3-15).
    return { '--display-fill': `linear-gradient(96deg in oklab, ${toCss(from)} 4%, ${toCss(to)} 96%)` };
  }
  return { '--display-fill': 'none' };
}

function motionTokens(p: DesignParams): Record<string, string> {
  const off = p.motion === 'none';
  return {
    '--dur-fast': off ? '0ms' : '120ms',
    '--dur': off ? '0ms' : '200ms',
    '--dur-slow': off ? '0ms' : '480ms',
    // Things that enter or respond use a strong ease-out: quick to start, gentle to settle.
    '--ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
    '--ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
    '--press-scale': off ? '1' : '0.97',
    '--hover-lift': p.motion === 'expressive' ? '-3px' : '0px',
  };
}

function typeTokens(p: DesignParams): Record<string, string> {
  const r = p.scaleRatio;
  const b = p.baseSize;
  const sizes: Record<string, number> = {
    '--text-xs': Math.max(12, b * 0.78),
    '--text-sm': Math.max(13, b * 0.89),
    '--text-base': b,
    '--text-lg': b * r,
    '--text-xl': b * r ** 2,
    '--text-2xl': b * r ** 3,
    '--text-3xl': b * r ** 4,
    '--text-4xl': b * r ** 5,
  };
  const out: Record<string, string> = {};
  for (const [key, px] of Object.entries(sizes)) out[key] = rem(px);
  // The display size shrinks on narrow screens: clamp(minimum, fluid, maximum).
  const max = Math.min(sizes['--text-4xl'] ?? b, 112);
  const min = Math.min(sizes['--text-2xl'] ?? b, max);
  const slope = (max - min) / (1280 - 375);
  out['--text-display'] = `clamp(${rem(min)}, ${round((min - slope * 375) / 16, 4)}rem + ${round(slope * 100, 3)}vw, ${rem(max)})`;
  // Sizes on a narrow screen. Each large size has a cap tied to the width of the screen (the "vw" unit is one hundredth of that
  // width), so that a heading at its largest setting still fits a phone (campaign 4, finding F-5). On a wide screen the caps
  // stand far above every size that the sliders can reach, so they change nothing there.
  out['--lede-size'] = 'min(var(--text-lg), 5.6vw)';
  out['--h2-size'] = 'min(var(--text-2xl), 8.5vw)';
  out['--h3-size'] = 'min(var(--text-xl), 7vw)';
  out['--numeral-size'] = 'min(var(--text-3xl), 11vw)';
  out['--brand-size'] = 'min(var(--text-lg), 6vw)';
  // The main headline is the largest text on the page: it stays above the opening paragraph and above every section heading.
  // Without this floor, a headline in capitals (which is set smaller, see --display-scale) fell below the section headings on
  // phones and tablets (campaign 4, findings F-6 and F-13).
  out['--h1-floor'] = 'max(calc(var(--lede-size) * 1.25), calc(var(--h2-size) * 1.15))';
  out['--font-heading'] = FONTS[p.fontHeading].stack;
  out['--font-body'] = FONTS[p.fontBody].stack;
  out['--font-mono'] = FONTS['jetbrains-mono'].stack;
  out['--heading-weight'] = String(p.headingWeight);
  out['--heading-tracking'] = `${p.headingTracking}em`;
  out['--heading-transform'] = p.headingCase === 'upper' ? 'uppercase' : p.headingCase === 'title' ? 'capitalize' : 'none';
  out['--leading-heading'] = r >= 1.333 ? '1.04' : r >= 1.2 ? '1.12' : '1.22';
  out['--leading-body'] = b >= 18 ? '1.6' : '1.55';
  out['--numeric'] = p.numerals === 'proportional' ? 'normal' : 'tabular-nums';
  out['--font-numeric'] = p.numerals === 'mono' ? FONTS['jetbrains-mono'].stack : 'inherit';
  return out;
}

function spaceTokens(p: DesignParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const n of [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]) out[`--space-${n}`] = rem(4 * n * p.density);
  out['--section-gap'] = rem(4 * (p.density >= 1.15 ? 36 : p.density <= 0.9 ? 18 : 26) * p.density);
  out['--page-max'] = p.contentWidth === 'narrow' ? '46rem' : p.contentWidth === 'wide' ? '84rem' : '68rem';
  out['--measure'] = '65ch';
  return out;
}

function shapeTokens(p: DesignParams): Record<string, string> {
  const pill = p.radius >= 999;
  return {
    '--radius-control': pill ? '999px' : `${p.radius}px`,
    // Outer boxes round a little more than the controls inside them, so nested corners look parallel.
    '--radius-surface': pill ? '28px' : `${Math.round(p.radius * 1.5)}px`,
    '--radius-small': pill ? '999px' : `${Math.round(p.radius * 0.5)}px`,
    '--border-w': `${p.borderWeight}px`,
    '--control-border-w': `${Math.max(p.borderWeight, 1)}px`,
    '--focus-w': '3px',
    '--target-min': '2.75rem',
  };
}

/** Derive every token from the design parameters, under the chosen contrast profile. */
export function deriveTokens(p: DesignParams, profile: A11yProfile): DerivedTokens {
  const pal = basePalette(p);
  const issues = applyProfile(p, pal, profile);
  const css: Record<string, string> = {};
  const hex: Record<string, string> = {};
  for (const key of Object.keys(TOKEN_OF) as ColorKey[]) {
    css[TOKEN_OF[key]] = toCss(pal[key]);
    hex[TOKEN_OF[key]] = toHex(pal[key]);
  }
  css['--border'] = toCssAlpha(pal.text, pal.hairlineAlpha);
  hex['--border'] = hexOver(pal.text, pal.hairlineAlpha, pal.bg);
  css['--selection'] = toCssAlpha(pal.accent, p.theme === 'dark' ? 0.4 : 0.22);
  css['--marker'] = toCssAlpha(pal.marker, pal.markerAlpha);
  css['--soft-label-alpha'] = String(pal.softLabelAlpha);
  css['--hero-lede-alpha'] = String(pal.heroLedeAlpha);
  // Capitals are wider than lowercase, so an all-capitals headline is set smaller.
  css['--display-scale'] = p.headingCase === 'upper' ? '0.7' : '1';
  css['--media-a'] = toCss(pal.accentSoft);
  css['--media-b'] = toCss(pal.surface2);
  css['--inset-highlight'] = p.theme === 'dark' ? toCssAlpha(WHITE, 0.07) : toCssAlpha(WHITE, 0.8);
  css['--recess'] = p.theme === 'dark' ? toCssAlpha(BLACK, 0.35) : toCssAlpha(BLACK, 0.045);
  Object.assign(css, elevationTokens(p, pal), buttonTokens(p, pal), atmosphereTokens(p, pal), displayTokens(p, pal, profile), motionTokens(p), typeTokens(p), spaceTokens(p), shapeTokens(p));
  return { css, hex, issues, pairs: measurePairs(p, pal) };
}

/** A token value is written into a stylesheet, so it must not be able to close the rule or the style block. */
const UNSAFE_IN_CSS = /[<>{};]/;

/** Serialize tokens as a CSS `:root` block. Throws on a name or a value that could break out of the block. */
export function tokensToCss(tokens: Record<string, string>, selector = ':root'): string {
  const lines = Object.entries(tokens).map(([k, v]) => {
    if (!/^--[a-z0-9-]+$/.test(k)) throw new Error('A token name contains a character that is not allowed.');
    if (UNSAFE_IN_CSS.test(v)) throw new Error(`The value of token ${k} contains a character that is not allowed in a stylesheet.`);
    return `  ${k}: ${v};`;
  });
  return `${selector} {\n${lines.join('\n')}\n}`;
}
