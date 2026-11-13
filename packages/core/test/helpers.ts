// Shared helpers for the unit tests. The contrast math here is written a second time on purpose:
// the tests measure the emitted colors with their own arithmetic, so a fault in `src/color.ts` cannot hide itself.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PARAMS, DIRECTIONS, STEPS, resolvePatch, type DesignParams, type MeasuredPair } from '../src/index.js';

/** Absolute path of a file given relative to the repository root. */
export const repoPath = (relative: string): string => fileURLToPath(new URL(`../../../${relative}`, import.meta.url));
export const repoFileExists = (relative: string): boolean => existsSync(repoPath(relative));
export const fixture = (name: string): unknown => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8'));

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`not a hex color: ${hex}`);
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}

/** WCAG 2.x relative luminance of sRGB channels in 0..1. */
export function luminance([r, g, b]: Rgb): number {
  const lin = (v: number): number => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ratio = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb => [fg[0] * alpha + bg[0] * (1 - alpha), fg[1] * alpha + bg[1] * (1 - alpha), fg[2] * alpha + bg[2] * (1 - alpha)];

/** Contrast of `fg` drawn at `alpha` over `bg`, against `bg`. */
export function contrastHex(fg: string, bg: string, alpha = 1): number {
  const b = hexToRgb(bg);
  return ratio(luminance(over(hexToRgb(fg), alpha, b)), luminance(b));
}

/** Contrast of solid `fg` against a wash of `wash` at `alpha` over `bg`. */
export function contrastOnWashHex(fg: string, wash: string, alpha: number, bg: string): number {
  return ratio(luminance(hexToRgb(fg)), luminance(over(hexToRgb(wash), alpha, hexToRgb(bg))));
}

/** Measure one reported pair again, from the emitted hex colors alone. */
export function remeasure(pair: MeasuredPair, hex: Record<string, string>): number {
  const fg = hex[pair.fgToken];
  const bg = hex[pair.bgToken];
  if (!fg || !bg) throw new Error(`pair ${pair.id} names a token that was not emitted`);
  if (pair.kind === 'wash') {
    const ground = hex['--hero-bg'];
    if (!ground) throw new Error('no --hero-bg token');
    return contrastOnWashHex(fg, bg, pair.alpha, ground);
  }
  return contrastHex(fg, bg, pair.alpha);
}

export interface NamedDesign {
  label: string;
  params: DesignParams;
}

/** A broad set of designs: the plain start, every Direction, and every Option applied to the plain start and to four contrasting Directions. */
export function everyDesign(): NamedDesign[] {
  const out: NamedDesign[] = [{ label: 'plain start', params: DEFAULT_PARAMS }];
  for (const d of DIRECTIONS) out.push({ label: `Direction ${d.id}`, params: d.params });
  const bases: NamedDesign[] = [
    { label: 'plain', params: DEFAULT_PARAMS },
    ...['midnight-aurora', 'poster-block', 'cobalt-wash', 'control-room'].map((id) => ({ label: id, params: DIRECTIONS.find((d) => d.id === id)!.params })),
  ];
  for (const base of bases) {
    for (const step of STEPS) {
      for (const option of step.options) out.push({ label: `${base.label} + ${step.id}:${option.id}`, params: { ...base.params, ...resolvePatch(option, base.params) } });
    }
  }
  return out;
}

/** Every string inside a JSON-like value, depth first. */
export function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}
