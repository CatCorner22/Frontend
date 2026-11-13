// Token derivation: a few design parameters in, the complete set of design tokens out.
// A token is a named value (a color, a size, a shadow recipe) that the Mockup and the exported files both use.

import { contrast, ensureContrast, hexOver, readableOn, shiftH, shiftL, toCss, toCssAlpha, toHex, type Oklch } from './color.js';
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
  /** The same colors as opaque hex, for exports that cannot read `oklch()`. */
  hex: Record<string, string>;
  issues: TokenIssue[];
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const round = (v: number, d = 3): number => Number(v.toFixed(d));
const rem = (px: number): string => `${round(px / 16, 4)}rem`;
const WHITE: Oklch = { l: 1, c: 0, h: 0 };
const BLACK: Oklch = { l: 0, c: 0, h: 0 };

interface Palette {
  bg: Oklch;
  surface: Oklch;
  surface2: Oklch;
  /** Hairlines are the text color at low opacity, so that they sit naturally on any surface. */
  hairlineAlpha: number;
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
  /** The label of the main button and what it sits on; these depend on the button finish. */
  btnLabel: Oklch;
  btnBackdrop: Oklch;
  bandBg: Oklch;
  bandText: Oklch;
  heroBg: Oklch | null;
  heroText: Oklch;
  focus: Oklch;
}

const filledButton = (p: DesignParams): boolean => p.buttonFinish === 'flat' || p.buttonFinish === 'gloss' || p.buttonFinish === 'glow';

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
  let heroBg: Oklch | null = null;
  let heroText: Oklch = text;
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

  // Accent used as text (links, small labels) keeps the hue but must stay legible on the page: at least 3:1 in every profile.
  // The picked accent itself, as used for fills, never changes.
  const accentText = ensureContrast(accent, heroBg ?? bg, 3);
  // Outline and soft buttons carry their color in the label, not in a fill.
  const labelInk = quiet ? text : accentText;
  const btnLabel = filledButton(p) ? onAction : labelInk;
  const btnBackdrop = filledButton(p) ? action : p.buttonFinish === 'soft' ? accentSoft : (heroBg ?? bg);

  return {
    bg, surface, surface2, hairlineAlpha, borderStrong, text, textMuted,
    accent, onAccent: readableOn(accent), accentText: ensureContrast(accent, bg, 3), accentSoft, accent2, onAccent2: readableOn(accent2),
    action, onAction, btnLabel, btnBackdrop, bandBg, bandText, heroBg, heroText,
    focus: p.colorStrategy === 'duo' ? accent2 : accent,
  };
}

interface Check {
  id: string;
  pair: string;
  fg: keyof Palette;
  bg: keyof Palette;
  required: number;
  /** In Enforce, which side moves. Fills move so that labels stay white or black. */
  move: 'fg' | 'bg';
}

// Text needs 4.5:1; control boundaries and focus indicators need 3:1 (WCAG 2.2, criteria 1.4.3 and 1.4.11).
const CHECKS: Check[] = [
  { id: 'text-on-bg', pair: 'Body text on the page background', fg: 'text', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'text-on-surface', pair: 'Body text on cards', fg: 'text', bg: 'surface', required: 4.5, move: 'fg' },
  { id: 'muted-on-bg', pair: 'Secondary text on the page background', fg: 'textMuted', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'muted-on-surface', pair: 'Secondary text on cards', fg: 'textMuted', bg: 'surface', required: 4.5, move: 'fg' },
  { id: 'button-label', pair: 'Main button label on its background', fg: 'btnLabel', bg: 'btnBackdrop', required: 4.5, move: 'bg' },
  { id: 'accent-text-on-bg', pair: 'Links on the page background', fg: 'accentText', bg: 'bg', required: 4.5, move: 'fg' },
  { id: 'band-text', pair: 'Text on the colored band', fg: 'bandText', bg: 'bandBg', required: 4.5, move: 'bg' },
  { id: 'control-border', pair: 'Input borders against the page background', fg: 'borderStrong', bg: 'bg', required: 3, move: 'fg' },
  { id: 'focus-on-bg', pair: 'Focus ring against the page background', fg: 'focus', bg: 'bg', required: 3, move: 'fg' },
];

function applyProfile(p: DesignParams, pal: Palette, profile: A11yProfile): TokenIssue[] {
  const issues: TokenIssue[] = [];
  if (profile === 'off') return issues;
  const repair = profile === 'enforce';
  const note = (id: string, pair: string, ratio: number, required: number): void => {
    issues.push({ id, pair, ratio: round(ratio, 2), required, outcome: repair ? 'repaired' : 'warning' });
  };
  for (const check of CHECKS) {
    const fg = pal[check.fg] as Oklch;
    const bg = pal[check.bg] as Oklch;
    const ratio = contrast(fg, bg);
    if (ratio >= check.required) continue;
    note(check.id, check.pair, ratio, check.required);
    if (!repair) continue;
    const moveBackdrop = check.move === 'bg' && !(check.id === 'button-label' && !filledButton(p));
    if (moveBackdrop) (pal[check.bg] as Oklch) = ensureContrast(bg, fg, check.required);
    else (pal[check.fg] as Oklch) = ensureContrast(fg, bg, check.required);
  }
  if (pal.heroBg) {
    const ratio = contrast(pal.heroText, pal.heroBg);
    if (ratio < 4.5) {
      note('hero-text', 'Headline on the colored first screen', ratio, 4.5);
      if (repair) pal.heroBg = ensureContrast(pal.heroBg, pal.heroText, 4.5);
    }
  }
  if (repair && filledButton(p)) {
    pal.action = pal.btnBackdrop;
    pal.onAction = pal.btnLabel;
  }
  return issues;
}

/** A shadow color: near-black, faintly tinted toward the neutral hue, like a real shadow. */
function shade(p: DesignParams, alpha: number): string {
  return p.theme === 'dark' ? `oklch(0% 0 0 / ${alpha})` : `oklch(22% 0.03 ${round(p.neutralHue, 1)} / ${alpha})`;
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
      // A one-pixel ring plus a whisper of shadow: the crisp edge used by Vercel and Linear.
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `0 0 0 1px ${hairline}, 0 1px 2px ${shade(p, dark ? 0.4 : 0.05)}, 0 2px 6px -1px ${shade(p, dark ? 0.3 : 0.04)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.4 : 0.08)}`,
      };
    case 'soft-shadow':
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `0 0 0 1px ${toCssAlpha(pal.text, dark ? 0.1 : 0.04)}, 0 1px 2px ${shade(p, dark ? 0.5 : 0.06)}, 0 4px 10px ${shade(p, dark ? 0.4 : 0.05)}, 0 14px 32px ${shade(p, dark ? 0.35 : 0.07)}`,
        '--control-shadow': `0 1px 2px ${shade(p, dark ? 0.5 : 0.1)}`,
      };
    case 'float':
      // Wide, soft, layered: panels that hover well above the page, as on Apple's sites.
      return {
        ...base, '--card-bg': toCss(pal.surface), '--card-border': 'transparent', '--card-border-w': '0px',
        '--card-shadow': `0 0 0 0.5px ${toCssAlpha(pal.text, dark ? 0.14 : 0.08)}, 0 2px 4px ${shade(p, dark ? 0.4 : 0.04)}, 0 12px 24px -6px ${shade(p, dark ? 0.5 : 0.08)}, 0 36px 72px -24px ${shade(p, dark ? 0.6 : 0.16)}`,
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
      out = { '--btn-bg': toCss(pal.btnBackdrop), '--btn-bg-hover': toCss(shiftL(pal.btnBackdrop, dark ? 0.04 : -0.035)), '--btn-color': toCss(pal.btnLabel), '--btn-border': 'transparent', '--btn-shadow': 'none', '--btn-shadow-hover': 'none' };
      break;
    default:
      out = { '--btn-bg': toCss(a), '--btn-bg-hover': toCss(shiftL(a, hoverBy)), '--btn-color': toCss(pal.btnLabel), '--btn-border': toCss(a), '--btn-shadow': 'var(--control-shadow)', '--btn-shadow-hover': 'var(--control-shadow)' };
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
  const glow = pal.heroBg ? pal.heroText : pal.accent;
  const glow2 = pal.heroBg ? pal.heroText : p.colorStrategy === 'duo' ? pal.accent2 : shiftH(pal.accent, 48);
  const glow3 = pal.heroBg ? pal.heroText : shiftH(pal.accent, -42);
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
    case 'grain':
      out['--grain-opacity'] = dark ? '0.16' : '0.11';
      break;
    default:
      break;
  }
  return out;
}

function displayTokens(p: DesignParams, pal: Palette, profile: A11yProfile): Record<string, string> {
  const ground = pal.heroBg ?? pal.bg;
  if (p.displayTreatment === 'ink-gradient') {
    // A quiet sheen: full ink at the top, fading slightly toward the bottom.
    return { '--display-fill': `linear-gradient(to bottom, ${toCss(pal.heroText)} 28%, ${toCssAlpha(pal.heroText, 0.56)} 112%)` };
  }
  if (p.displayTreatment === 'accent-gradient') {
    let from = pal.heroBg ? pal.heroText : pal.accentText;
    let to = pal.heroBg ? shiftL(pal.heroText, pal.heroText.l > 0.5 ? -0.16 : 0.2) : p.colorStrategy === 'duo' ? pal.accent2 : shiftH(pal.accentText, 52);
    if (profile === 'enforce') {
      // Large text needs 3:1.
      from = ensureContrast(from, ground, 3);
      to = ensureContrast(to, ground, 3);
    }
    return { '--display-fill': `linear-gradient(96deg, ${toCss(from)} 4%, ${toCss(to)} 96%)` };
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

/** Derive every token from the design parameters, under the chosen accessibility profile. */
export function deriveTokens(p: DesignParams, profile: A11yProfile): DerivedTokens {
  const pal = basePalette(p);
  const issues = applyProfile(p, pal, profile);
  const colors: Record<string, Oklch> = {
    '--bg': pal.bg,
    '--surface': pal.surface,
    '--surface-2': pal.surface2,
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
    // Always a real color (the page background when the first screen is not painted), so that effects can paint with it.
    '--hero-bg': pal.heroBg ?? pal.bg,
  };
  const css: Record<string, string> = {};
  const hex: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    css[key] = toCss(value);
    hex[key] = toHex(value);
  }
  css['--border'] = toCssAlpha(pal.text, pal.hairlineAlpha);
  hex['--border'] = hexOver(pal.text, pal.hairlineAlpha, pal.bg);
  css['--selection'] = toCssAlpha(pal.accent, p.theme === 'dark' ? 0.4 : 0.22);
  // The highlighter stroke: the accent (or the second color) at part strength, whatever the color strategy.
  css['--marker'] = toCssAlpha(pal.heroBg ? pal.heroText : p.colorStrategy === 'duo' ? pal.accent2 : pal.accent, p.theme === 'dark' ? 0.5 : 0.3);
  // Capitals are wider than lowercase, so an all-capitals headline is set smaller.
  css['--display-scale'] = p.headingCase === 'upper' ? '0.7' : '1';
  css['--media-a'] = toCss(pal.accentSoft);
  css['--media-b'] = toCss(pal.surface2);
  css['--inset-highlight'] = p.theme === 'dark' ? toCssAlpha(WHITE, 0.07) : toCssAlpha(WHITE, 0.8);
  css['--recess'] = p.theme === 'dark' ? toCssAlpha(BLACK, 0.35) : toCssAlpha(BLACK, 0.045);
  Object.assign(css, elevationTokens(p, pal), buttonTokens(p, pal), atmosphereTokens(p, pal), displayTokens(p, pal, profile), motionTokens(p), typeTokens(p), spaceTokens(p), shapeTokens(p));
  return { css, hex, issues };
}

/** Serialize tokens as a CSS `:root` block. */
export function tokensToCss(tokens: Record<string, string>, selector = ':root'): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}
