// The color math of the Fit check. It stands alone: the Fitter runs inside other people's projects, where the Studio's core does not exist.
// The contrast formula is the WCAG 2.x formula (hard rule 9: no apca-w3).

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Reads the colors that a browser reports for computed styles: `rgb(1, 2, 3)` and `rgba(1, 2, 3, 0.5)`, and the space-separated form. */
export function parseRgba(text: string): Rgba | null {
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
