// Color math. OKLCH is a perceptual color space: equal steps in its numbers look like equal steps to the eye.
// Conversion constants: the OKLab matrices published by Björn Ottosson ("A perceptual color space for image processing").
// The builder wrote them from memory of that reference and did not re-read it for this project; the unit tests check them against known sRGB values.
// Contrast: WCAG 2.x relative luminance and contrast ratio.

export interface Oklch {
  /** Lightness, 0 (black) to 1 (white). */
  l: number;
  /** Chroma (colorfulness), 0 (gray) to about 0.37. */
  c: number;
  /** Hue angle in degrees, 0 to 360. */
  h: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;
  return {
    r: 4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    g: -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    b: -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  };
}

const inGamut = (c: Rgb): boolean => [c.r, c.g, c.b].every((v) => v >= -0.0005 && v <= 1.0005);

/** True when ordinary (sRGB) screens can show the color without clipping. */
export function isInGamut(color: Oklch): boolean {
  return inGamut(oklchToLinearRgb(color));
}

const encode = (v: number): number => {
  const x = clamp01(v);
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
};

/** Reduce chroma until the color fits the sRGB gamut (what ordinary screens can show). Lightness and hue stay fixed. */
export function toGamut(color: Oklch): Oklch {
  if (inGamut(oklchToLinearRgb(color))) return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) lo = mid;
    else hi = mid;
  }
  return { ...color, c: lo };
}

/** Convert to sRGB channels in 0..1 after gamut mapping. */
export function toRgb(color: Oklch): Rgb {
  const lin = oklchToLinearRgb(toGamut(color));
  return { r: encode(lin.r), g: encode(lin.g), b: encode(lin.b) };
}

export function toHex(color: Oklch): string {
  const { r, g, b } = toRgb(color);
  const h = (v: number): string =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/**
 * The color as it is written to the page: six hexadecimal digits, which a browser draws exactly as given.
 * An `oklch()` value would be converted and rounded by each browser in its own way, so the drawn color could differ by
 * one step from the color that the contrast checks measured (finding T3-01). Hexadecimal digits leave nothing to convert.
 */
export function toCss(color: Oklch): string {
  return toHex(color);
}

/** WCAG 2.x relative luminance of a color. */
export function luminance(color: Oklch): number {
  const lin = oklchToLinearRgb(toGamut(color));
  return 0.2126 * clamp01(lin.r) + 0.7152 * clamp01(lin.g) + 0.0722 * clamp01(lin.b);
}

/** WCAG 2.x contrast ratio between two colors: 1 (identical) to 21 (black on white). */
export function contrast(a: Oklch, b: Oklch): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Move the lightness of `fg` away from `bg` until the pair reaches `target` contrast.
 * The search measures the colors as they are written to the page (each channel rounded to one of 256 steps), so the result
 * holds for what a browser draws; a search on unrounded colors could stop a hair short after rounding (finding T3-02).
 * Returns the adjusted color, or the best reachable color if the target is unreachable.
 */
export function ensureContrast(fg: Oklch, bg: Oklch, target: number): Oklch {
  if (writtenContrast(fg, bg) >= target) return fg;
  const darker = fg.l <= bg.l;
  const tryDirection = (toward: number): Oklch => {
    let lo = fg.l;
    let hi = toward;
    let best: Oklch = { ...fg, l: toward };
    if (writtenContrast(best, bg) < target) return best;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const candidate = { ...fg, l: mid };
      if (writtenContrast(candidate, bg) >= target) {
        best = candidate;
        hi = mid;
      } else lo = mid;
    }
    return best;
  };
  const first = tryDirection(darker ? 0 : 1);
  if (writtenContrast(first, bg) >= target) return first;
  const second = tryDirection(darker ? 1 : 0);
  return writtenContrast(second, bg) > writtenContrast(first, bg) ? second : first;
}

/**
 * Pick near-white or near-black text for a filled background, whichever contrasts more.
 * The better of pure white and pure black always reaches at least 4.58:1, so the result is pushed to 4.5:1 when the near tones fall short.
 */
export function readableOn(bg: Oklch, hue = bg.h): Oklch {
  const light: Oklch = { l: 0.99, c: 0.005, h: hue };
  const dark: Oklch = { l: 0.17, c: 0.02, h: hue };
  const best = contrast(light, bg) >= contrast(dark, bg) ? light : dark;
  return ensureContrast(best, bg, 4.56);
}

/** Move `fg` until it reaches `target` contrast against every background in the list. */
export function ensureContrastAll(fg: Oklch, backgrounds: Oklch[], target: number): Oklch {
  let out = fg;
  for (let pass = 0; pass < 2; pass++) for (const bg of backgrounds) out = ensureContrast(out, bg, target);
  return out;
}

/**
 * A see-through color as it is written to the page: exact red, green, and blue steps, and the share of the color that shows.
 * Used for thin lines, glows, and glass, which must sit naturally on any background.
 */
export function toCssAlpha(color: Oklch, alpha: number): string {
  const { r, g, b } = toRgb(color);
  const step = (v: number): number => Math.round(clamp01(v) * 255);
  return `rgb(${step(r)} ${step(g)} ${step(b)} / ${Number(alpha.toFixed(3))})`;
}

/** The sRGB color that results when `fg` at `alpha` is painted over `bg` (composited in sRGB, as browsers do). */
export function rgbOver(fg: Oklch, alpha: number, bg: Oklch): Rgb {
  const f = toRgb(fg);
  const b = toRgb(bg);
  const mix = (x: number, y: number): number => clamp01(x * alpha + y * (1 - alpha));
  return { r: mix(f.r, b.r), g: mix(f.g, b.g), b: mix(f.b, b.b) };
}

const decode = (v: number): number => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** WCAG 2.x relative luminance of sRGB channels in 0..1. */
export function luminanceRgb(c: Rgb): number {
  return 0.2126 * decode(clamp01(c.r)) + 0.7152 * decode(clamp01(c.g)) + 0.0722 * decode(clamp01(c.b));
}

const ratio = (la: number, lb: number): number => (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);

/** Contrast of `fg`, drawn at `alpha` over `bg`, against that same `bg`. This is what the eye gets from translucent text. */
export function contrastOver(fg: Oklch, alpha: number, bg: Oklch): number {
  if (alpha >= 1) return contrast(fg, bg);
  return ratio(luminanceRgb(rgbOver(fg, alpha, bg)), luminance(bg));
}

/** Contrast of opaque `fg` against a backdrop made of `wash` at `alpha` over `bg` (for example text over a highlighter stroke). */
export function contrastOnWash(fg: Oklch, wash: Oklch, alpha: number, bg: Oklch): number {
  return ratio(luminance(fg), luminanceRgb(rgbOver(wash, alpha, bg)));
}

const quantize = (v: number): number => Math.round(clamp01(v) * 255) / 255;
/** The sRGB channels of a color as it is written to the page: each channel is one of 256 steps. */
function emittedRgb(color: Oklch): Rgb {
  const c = toRgb(color);
  return { r: quantize(c.r), g: quantize(c.g), b: quantize(c.b) };
}
const mixRgb = (f: Rgb, alpha: number, b: Rgb): Rgb => ({ r: f.r * alpha + b.r * (1 - alpha), g: f.g * alpha + b.g * (1 - alpha), b: f.b * alpha + b.b * (1 - alpha) });

/** Contrast of two solid colors as they are written to the page. A browser draws these exactly. */
export function writtenContrast(a: Oklch, b: Oklch): number {
  return ratio(luminanceRgb(emittedRgb(a)), luminanceRgb(emittedRgb(b)));
}

/**
 * A blend of two written colors as a browser may draw it at worst. Browsers round a blend in slightly different ways, so the
 * blend is taken one step, on every channel, toward the color it is measured against. A pass then holds for what any browser draws.
 */
function worstBlend(blend: Rgb, againstLuminance: number): Rgb {
  const step = luminanceRgb(blend) > againstLuminance ? -1 / 255 : 1 / 255;
  return { r: clamp01(blend.r + step), g: clamp01(blend.g + step), b: clamp01(blend.b + step) };
}

/**
 * As `contrastOver`, but measured on the colors as they are written to the page (finding T2-01, corrected by T3-01).
 * Two solid colors: the exact figure, because the page receives exactly these colors.
 * A see-through color over a background: the figure for the worst blend that a browser may draw (see `worstBlend`).
 * Every pass-or-fail decision uses this measure.
 */
export function contrastOverEmitted(fg: Oklch, alpha: number, bg: Oklch): number {
  if (alpha >= 1) return writtenContrast(fg, bg);
  const back = luminanceRgb(emittedRgb(bg));
  return ratio(luminanceRgb(worstBlend(mixRgb(emittedRgb(fg), alpha, emittedRgb(bg)), back)), back);
}

/** As `contrastOnWash`, measured on the colors as they are written to the page, with the worst blend for the see-through layer. */
export function contrastOnWashEmitted(fg: Oklch, wash: Oklch, alpha: number, bg: Oklch): number {
  const front = luminanceRgb(emittedRgb(fg));
  return ratio(front, luminanceRgb(worstBlend(mixRgb(emittedRgb(wash), alpha, emittedRgb(bg)), front)));
}

/** The opaque hex that results when `fg` at `alpha` is painted over `bg`. */
export function hexOver(fg: Oklch, alpha: number, bg: Oklch): string {
  const c = rgbOver(fg, alpha, bg);
  const h = (v: number): string =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** Shift lightness, keeping the result in range. */
export function shiftL(color: Oklch, by: number): Oklch {
  return { ...color, l: Math.min(0.995, Math.max(0.02, color.l + by)) };
}

/** Rotate hue. */
export function shiftH(color: Oklch, by: number): Oklch {
  return { ...color, h: (((color.h + by) % 360) + 360) % 360 };
}
