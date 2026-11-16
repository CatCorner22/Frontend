// The color math of the Fit check. It stands alone: the Fitter runs inside other people's projects, where the Studio's core does not exist.
// The contrast formula is the WCAG 2.x formula (hard rule 9: no apca-w3).

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const gamma = (x: number): number => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.abs(x) ** (1 / 2.4) - 0.055);
const byte = (x: number): number => Math.max(0, Math.min(255, gamma(x) * 255));

/** The CSS notation `oklch(L C h / alpha)` as sRGB: the standard Oklab matrices, then the sRGB transfer curve, clamped to the gamut. */
function parseOklch(text: string): Rgba | null {
  const m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+|none)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/i.exec(text.trim());
  if (!m) return null;
  const L = m[1]!.endsWith('%') ? Number.parseFloat(m[1]!) / 100 : Number(m[1]);
  const C = m[2]!.endsWith('%') ? (Number.parseFloat(m[2]!) / 100) * 0.4 : Number(m[2]);
  const h = (m[3] === 'none' ? 0 : Number(m[3])) * (Math.PI / 180);
  const alpha = m[4] === undefined ? 1 : m[4].endsWith('%') ? Number.parseFloat(m[4]) / 100 : Number(m[4]);
  if (![L, C, h, alpha].every(Number.isFinite)) return null;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: byte(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s),
    g: byte(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s),
    b: byte(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s),
    a: alpha,
  };
}

/** Reads the colors that a browser reports for computed styles: `rgb(1, 2, 3)`, `rgba(1, 2, 3, 0.5)`, the space-separated form, and `oklch()`. */
export function parseRgba(text: string): Rgba | null {
  if (/^oklch\(/i.test(text.trim())) return parseOklch(text);
  const match = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(text.trim());
  if (!match) return null;
  const alpha = match[4] === undefined ? 1 : match[4].endsWith('%') ? Number.parseFloat(match[4]) / 100 : Number.parseFloat(match[4]);
  const rgba = { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: alpha };
  return Object.values(rgba).every((n) => Number.isFinite(n)) ? rgba : null;
}

const channelHex = (n: number): string => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

export function hexOf({ r, g, b }: Rgba): string {
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
}

/** The color of `top` laid over an opaque `under`. */
export function over(top: Rgba, under: Rgba): Rgba {
  const a = top.a;
  return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 };
}

const linear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** The WCAG 2.x contrast ratio of two opaque colors: 1 to 21. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
