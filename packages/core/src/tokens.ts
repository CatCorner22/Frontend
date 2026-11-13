// Token derivation: a few design parameters in, the complete set of design tokens out.
// A token is a named value (a color, a size, a radius) that the Mockup and the exported files both use.

import { contrast, ensureContrast, readableOn, toCss, toHex, type Oklch } from './color.js';
import { FONTS, type A11yProfile, type DesignParams } from './params.js';

export interface TokenIssue {
  id: string;
  /** Plain-language description of the pair that was checked. */
  pair: string;
  ratio: number;
  required: number;
  /** `repaired` means the Enforce profile changed a color to meet the requirement. */
  outcome: 'warning' | 'repaired';
}

export interface DerivedTokens {
  /** CSS custom properties, ready to write into a `:root { }` block. */
  css: Record<string, string>;
  /** The same colors as hex, for exports that cannot read `oklch()`. */
  hex: Record<string, string>;
  issues: TokenIssue[];
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const round = (v: number, d = 3): number => Number(v.toFixed(d));
const rem = (px: number): string => `${round(px / 16, 4)}rem`;

interface Palette {
  bg: Oklch;
  surface: Oklch;
  surface2: Oklch;
  border: Oklch;
  borderStrong: Oklch;
  text: Oklch;
  textMuted: Oklch;
  accent: Oklch;
  onAccent: Oklch;
  accentText: Oklch;
  accentSoft: Oklch;
  accent2: Oklch;
  onAccent2: Oklch;
  action: Oklch;
  onAction: Oklch;
  bandBg: Oklch;
  bandText: Oklch;
  heroBg: Oklch | null;
  heroText: Oklch;
  focus: Oklch;
}

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

  const text = dark ? n(lerp(0.87, 0.97, k), 1.2) : n(lerp(0.33, 0.15, k), 2.2);
  const textMuted = dark ? n(lerp(0.67, 0.76, k), 1.5) : n(lerp(0.57, 0.44, k), 2.2);
  const border = dark ? n(bg.l + lerp(0.07, 0.12, k), 1.8) : n(lerp(0.92, 0.84, k), 1.6);
  const borderStrong = dark ? n(bg.l + lerp(0.2, 0.36, k), 1.8) : n(lerp(0.74, 0.5, k), 2);

  const accentL = dark ? Math.min(0.82, Math.max(p.accentLightness + 0.14, 0.62)) : p.accentLightness;
  const accent: Oklch = { l: accentL, c: p.accentChroma, h: p.accentHue };
  const accent2: Oklch = p.colorStrategy === 'duo' ? { l: accentL, c: p.accentChroma, h: p.accent2Hue } : accent;
  const accentSoft: Oklch = dark
    ? { l: bg.l + 0.1, c: Math.min(p.accentChroma * 0.45, 0.07), h: p.accentHue }
    : { l: 0.945, c: Math.min(p.accentChroma * 0.32, 0.05), h: p.accentHue };

  const quiet = p.colorStrategy === 'quiet';
  const action = quiet ? text : accent;
  const onAction = quiet ? bg : readableOn(accent);

  let bandBg: Oklch = accentSoft;
  let bandText: Oklch = text;
  let heroBg: Oklch | null = null;
  let heroText: Oklch = text;
  if (quiet) bandBg = surface2;
  if (p.colorStrategy === 'duo') {
    bandBg = accent2;
    bandText = readableOn(accent2);
  }
  if (p.colorStrategy === 'color-block') {
    // The first screen is painted in the accent; the band beneath it inverts to ink so that the two never merge.
    bandBg = text;
    bandText = bg;
    heroBg = accent;
    heroText = readableOn(accent);
  }

  return {
    bg,
    surface,
    surface2,
    border,
    borderStrong,
    text,
    textMuted,
    accent,
    onAccent: readableOn(accent),
    accentText: accent,
    accentSoft,
    accent2,
    onAccent2: readableOn(accent2),
    action,
    onAction,
    bandBg,
    bandText,
    heroBg,
    heroText,
    focus: p.colorStrategy === 'duo' ? accent2 : accent,
  };
}

interface Check {
  id: string;
  pair: string;
  fg: keyof Palette;
  bg: keyof Palette;
  required: number;
}

// Text needs 4.5:1; control boundaries and focus indicators need 3:1 (WCAG 2.2, criteria 1.4.3 and 1.4.11).
const CHECKS: Check[] = [
  { id: 'text-on-bg', pair: 'Body text on the page background', fg: 'text', bg: 'bg', required: 4.5 },
  { id: 'text-on-surface', pair: 'Body text on cards', fg: 'text', bg: 'surface', required: 4.5 },
  { id: 'muted-on-bg', pair: 'Secondary text on the page background', fg: 'textMuted', bg: 'bg', required: 4.5 },
  { id: 'muted-on-surface', pair: 'Secondary text on cards', fg: 'textMuted', bg: 'surface', required: 4.5 },
  { id: 'on-action', pair: 'Button label on the button color', fg: 'onAction', bg: 'action', required: 4.5 },
  { id: 'accent-text-on-bg', pair: 'Links on the page background', fg: 'accentText', bg: 'bg', required: 4.5 },
  { id: 'band-text', pair: 'Text on the colored band', fg: 'bandText', bg: 'bandBg', required: 4.5 },
  { id: 'control-border', pair: 'Input borders against the page background', fg: 'borderStrong', bg: 'bg', required: 3 },
  { id: 'focus-on-bg', pair: 'Focus ring against the page background', fg: 'focus', bg: 'bg', required: 3 },
];

function applyProfile(pal: Palette, profile: A11yProfile): TokenIssue[] {
  const issues: TokenIssue[] = [];
  if (profile === 'off') return issues;
  for (const check of CHECKS) {
    const fg = pal[check.fg] as Oklch;
    const bg = pal[check.bg] as Oklch;
    const ratio = contrast(fg, bg);
    if (ratio >= check.required) continue;
    if (profile === 'enforce') {
      // For a button, move the fill and keep the label; elsewhere move the foreground.
      if (check.id === 'on-action') {
        pal.action = ensureContrast(pal.action, pal.onAction, check.required);
      } else if (check.id === 'band-text') {
        pal.bandBg = ensureContrast(pal.bandBg, pal.bandText, check.required);
      } else {
        (pal[check.fg] as Oklch) = ensureContrast(fg, bg, check.required);
      }
      issues.push({ id: check.id, pair: check.pair, ratio: round(ratio, 2), required: check.required, outcome: 'repaired' });
    } else {
      issues.push({ id: check.id, pair: check.pair, ratio: round(ratio, 2), required: check.required, outcome: 'warning' });
    }
  }
  if (pal.heroBg) {
    const ratio = contrast(pal.heroText, pal.heroBg);
    if (ratio < 4.5) {
      if (profile === 'enforce') pal.heroBg = ensureContrast(pal.heroBg, pal.heroText, 4.5);
      issues.push({ id: 'hero-text', pair: 'Headline on the colored hero', ratio: round(ratio, 2), required: 4.5, outcome: profile === 'enforce' ? 'repaired' : 'warning' });
    }
  }
  return issues;
}

function shadowTokens(p: DesignParams, pal: Palette): Record<string, string> {
  const dark = p.theme === 'dark';
  const tint = (alpha: number): string => `oklch(${dark ? 0 : 22}% ${dark ? 0 : 0.03} ${round(p.neutralHue, 1)} / ${alpha})`;
  const borderColor = toCss(pal.border);
  const bw = `${p.borderWeight}px`;
  switch (p.elevation) {
    case 'flat':
      return { '--card-bg': toCss(pal.surface2), '--card-border': 'transparent', '--card-shadow': 'none', '--control-shadow': 'none', '--card-border-w': '0px' };
    case 'borders':
      return { '--card-bg': toCss(pal.surface), '--card-border': borderColor, '--card-shadow': 'none', '--control-shadow': 'none', '--card-border-w': `${Math.max(p.borderWeight, 1)}px` };
    case 'soft-shadow':
      return {
        '--card-bg': toCss(pal.surface),
        '--card-border': dark ? borderColor : 'transparent',
        '--card-shadow': `0 1px 2px ${tint(dark ? 0.5 : 0.06)}, 0 4px 10px ${tint(dark ? 0.4 : 0.05)}, 0 14px 32px ${tint(dark ? 0.35 : 0.07)}`,
        '--control-shadow': `0 1px 2px ${tint(dark ? 0.5 : 0.1)}`,
        '--card-border-w': dark ? '1px' : '0px',
      };
    case 'hard-shadow': {
      const ink = toCss(pal.text);
      const off = Math.max(3, p.borderWeight * 2);
      return { '--card-bg': toCss(pal.surface), '--card-border': ink, '--card-shadow': `${off}px ${off}px 0 0 ${ink}`, '--control-shadow': `${Math.max(2, off - 1)}px ${Math.max(2, off - 1)}px 0 0 ${ink}`, '--card-border-w': `${Math.max(p.borderWeight, 2)}px` };
    }
    case 'tonal':
      return { '--card-bg': toCss(pal.surface2), '--card-border': 'transparent', '--card-shadow': `inset 0 1px 0 ${dark ? 'oklch(100% 0 0 / 0.06)' : 'oklch(100% 0 0 / 0.7)'}`, '--control-shadow': 'none', '--card-border-w': '0px' };
    default:
      return { '--card-bg': toCss(pal.surface), '--card-border': borderColor, '--card-shadow': 'none', '--control-shadow': 'none', '--card-border-w': bw };
  }
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
  out['--text-display'] = `clamp(${rem(min)}, ${round(min / 16, 3)}rem + ${round(((max - min) / (1280 - 375)) * 100, 3)}vw, ${rem(max)})`;
  out['--font-heading'] = FONTS[p.fontHeading].stack;
  out['--font-body'] = FONTS[p.fontBody].stack;
  out['--font-mono'] = FONTS['jetbrains-mono'].stack;
  out['--heading-weight'] = String(p.headingWeight);
  out['--heading-tracking'] = `${p.headingTracking}em`;
  out['--heading-transform'] = p.headingCase === 'upper' ? 'uppercase' : p.headingCase === 'title' ? 'capitalize' : 'none';
  out['--leading-heading'] = r >= 1.333 ? '1.06' : r >= 1.2 ? '1.15' : '1.25';
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
    '--radius-surface': pill ? '28px' : `${Math.round(p.radius * 1.5)}px`,
    '--radius-small': pill ? '999px' : `${Math.round(p.radius * 0.5)}px`,
    '--border-w': `${p.borderWeight}px`,
    '--control-border-w': `${Math.max(p.borderWeight, 1)}px`,
    '--focus-w': '3px',
    '--target-min': '2.75rem',
  };
}

/** Derive every token from the design parameters, under the chosen accessibility profile. */
export function deriveTokens(p: DesignParams, profile: A11yProfile): DerivedTokens {
  const pal = basePalette(p);
  const issues = applyProfile(pal, profile);
  const colors: Record<string, Oklch> = {
    '--bg': pal.bg,
    '--surface': pal.surface,
    '--surface-2': pal.surface2,
    '--border': pal.border,
    '--border-strong': pal.borderStrong,
    '--text': pal.text,
    '--text-muted': pal.textMuted,
    '--accent': pal.accent,
    '--on-accent': pal.onAccent,
    '--accent-text': pal.accentText,
    '--accent-soft': pal.accentSoft,
    '--accent-2': pal.accent2,
    '--on-accent-2': pal.onAccent2,
    '--action': pal.action,
    '--on-action': pal.onAction,
    '--band-bg': pal.bandBg,
    '--band-text': pal.bandText,
    '--hero-text': pal.heroText,
    '--focus': pal.focus,
  };
  const css: Record<string, string> = {};
  const hex: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    css[key] = toCss(value);
    hex[key] = toHex(value);
  }
  // Always a real color (the page background when the first screen is not painted), so that effects can paint with it.
  css['--hero-bg'] = toCss(pal.heroBg ?? pal.bg);
  hex['--hero-bg'] = toHex(pal.heroBg ?? pal.bg);
  // Hover is derived, not picked: a small lightness shift toward the text color.
  const hover: Oklch = { ...pal.action, l: pal.action.l + (pal.action.l > 0.55 ? -0.06 : 0.07) };
  css['--action-hover'] = toCss(hover);
  hex['--action-hover'] = toHex(hover);
  Object.assign(css, shadowTokens(p, pal), typeTokens(p), spaceTokens(p), shapeTokens(p));
  return { css, hex, issues };
}

/** Serialize tokens as a CSS `:root` block. */
export function tokensToCss(tokens: Record<string, string>, selector = ':root'): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}
