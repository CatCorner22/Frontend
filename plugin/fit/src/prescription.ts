// What the Fit check reads from the Prescription's files: the design values to measure against, and the proof that the files belong together.

export class FitError extends Error {
  override name = 'FitError';
}

/** The four files that this slice reads. The other three (DESIGN.md, theme.css, FONTS.md) say the same design in other forms. */
export const READ_FILES = ['PRESCRIPTION.md', 'tokens.css', 'tokens.json', 'mockup.html'] as const;

export interface DesignValues {
  fingerprint: string;
  /** Opaque colors of the design, as `#rrggbb` in lower case. Colors with transparency are left out on purpose. */
  colors: ReadonlySet<string>;
  /** The first family of each typeface token, in lower case. */
  typefaces: ReadonlySet<string>;
  /** Corner radii in pixels. */
  radii: ReadonlySet<number>;
}

interface JsonToken {
  $value?: { hex?: string; alpha?: number; value?: number; unit?: string } | string[];
}
interface TokensJson {
  color?: Record<string, JsonToken>;
  dimension?: Record<string, JsonToken>;
  typeface?: Record<string, JsonToken>;
  $extensions?: Record<string, unknown>;
}

const FINGERPRINT = /^[0-9a-f]{8}$/;

/** Where each file states the fingerprint. A file that does not state it, or states it differently, does not belong to the set. */
function fingerprintsOf(files: Readonly<Record<string, string | undefined>>, tokens: TokensJson): Record<string, string | undefined> {
  const grab = (text: string | undefined, pattern: RegExp): string | undefined => (text === undefined ? undefined : pattern.exec(text)?.[1]);
  const fromJson = tokens.$extensions?.['refraction.fingerprint'];
  return {
    'tokens.json': typeof fromJson === 'string' ? fromJson : undefined,
    'tokens.css': grab(files['tokens.css'], /Fingerprint: ([0-9a-f]{8})\./),
    'PRESCRIPTION.md': grab(files['PRESCRIPTION.md'], /Fingerprint of the design values: `([0-9a-f]{8})`/),
    'mockup.html': grab(files['mockup.html'], /<meta name="refraction-fingerprint" content="([0-9a-f]{8})">/),
  };
}

/** The named values of `tokens.css`, in their order, as the Studio writes them: one `  --name: value;` line each. */
function cssValues(text: string): [string, string][] {
  return [...text.matchAll(/^ {2}(--[\w-]+): (.*);$/gm)].map((m) => [m[1] ?? '', m[2] ?? '']);
}

/** The fingerprint of the design values, worked out as the Studio works it out (FNV-1a over "name:value;" of every value, in order). */
function fingerprintOf(values: readonly [string, string][]): string {
  let sum = 0x811c9dc5;
  for (const [name, value] of values) {
    for (const unit of `${name}:${value};`) {
      sum ^= unit.codePointAt(0)!;
      sum = Math.imul(sum, 0x01000193) >>> 0;
    }
  }
  return sum.toString(16).padStart(8, '0');
}

/** The colors, sizes, and typefaces on which tokens.json says another thing than tokens.css. */
function disagreements(tokens: TokensJson, css: readonly [string, string][]): string[] {
  const byName = new Map(css);
  const out: string[] = [];
  for (const [group, entries] of Object.entries({ color: tokens.color, dimension: tokens.dimension, typeface: tokens.typeface })) {
    for (const [name, token] of Object.entries(entries ?? {})) {
      if (typeof token !== 'object' || token === null || !('$value' in token)) continue;
      const there = byName.get(`--${name}`);
      const value = token.$value;
      let same = true;
      if (there === undefined) same = false;
      else if (group === 'color' && value && !Array.isArray(value) && typeof value.hex === 'string') {
        // tokens.css writes an opaque color as six-digit hex and a partly transparent one as rgb(r g b / a); any other form is a
        // disagreement, so that doubt is never "the same" (retest finding A2-V8).
        const alpha = value.alpha ?? 1;
        const rgb = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(there);
        if (/^#[0-9a-f]{6}$/i.test(there)) same = alpha === 1 && there.toLowerCase() === value.hex.toLowerCase();
        else if (rgb) same = `#${[rgb[1], rgb[2], rgb[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}` === value.hex.toLowerCase() && Math.abs(Number(rgb[4]) - alpha) < 0.0005;
        else same = false;
      }
      else if (group === 'dimension' && value && !Array.isArray(value) && typeof value.value === 'number') {
        // A size may stand in rem in one file and in pixels in the other: 16 pixels to the rem, as the program reads radii (joined, D72).
        const px = (n: number, unit: string): number => (unit === 'rem' ? n * 16 : n);
        const css = /^(-?[\d.]+)(px|rem)$/.exec(there);
        same = there === `${String(value.value)}${value.unit ?? ''}` || (css !== null && (value.unit === 'px' || value.unit === 'rem') && Math.abs(px(Number(css[1]), css[2] ?? '') - px(value.value, value.unit)) < 0.001);
      }
      else if (group === 'typeface' && Array.isArray(value)) same = there.split(',')[0]?.trim().replace(/^"|"$/g, '') === value[0];
      if (!same) out.push(`--${name}`);
    }
  }
  return out;
}

export function readDesignValues(files: Readonly<Record<string, string | undefined>>): DesignValues {
  for (const name of READ_FILES) if (files[name] === undefined) throw new FitError(`The folder has no file "${name}".`);
  let tokens: TokensJson;
  try {
    tokens = JSON.parse(files['tokens.json'] ?? '') as TokensJson;
  } catch {
    throw new FitError('The file "tokens.json" is not valid JSON.');
  }
  const found = fingerprintsOf(files, tokens);
  const missing = Object.entries(found).filter(([, value]) => value === undefined || !FINGERPRINT.test(value)).map(([name]) => name);
  if (missing.length > 0) throw new FitError(`The fingerprint is missing or malformed in: ${missing.join(', ')}.`);
  const distinct = new Set(Object.values(found));
  if (distinct.size > 1) {
    const list = Object.entries(found).map(([name, value]) => `${name} ${String(value)}`).join('; ');
    throw new FitError(`The files carry different fingerprints, so they do not belong together: ${list}.`);
  }
  // The stated fingerprint is checked against the values themselves (campaign A2, finding J-20): a value changed by hand, or a
  // fingerprint retyped to quiet the refusal above, would otherwise give a receipt that names a design that it did not measure.
  const css = cssValues(files['tokens.css'] ?? '');
  const worked = fingerprintOf(css);
  if (worked !== [...distinct][0]) throw new FitError(`The values in tokens.css give the fingerprint ${worked}, but the files state ${String([...distinct][0])}: a value was changed by hand, or the files come from two designs. Write the files again from the Studio.`);
  const disagree = disagreements(tokens, css);
  if (disagree.length > 0) throw new FitError(`tokens.json and tokens.css disagree about ${disagree.slice(0, 5).join(', ')}${disagree.length > 5 ? ` and ${String(disagree.length - 5)} more` : ''}: a value was changed by hand, or the files come from two designs. Write the files again from the Studio.`);
  const colors = new Set<string>();
  for (const token of Object.values(tokens.color ?? {})) {
    const value = token.$value;
    if (value && !Array.isArray(value) && typeof value.hex === 'string' && (value.alpha === undefined || value.alpha === 1)) colors.add(value.hex.toLowerCase());
  }
  const radii = new Set<number>();
  for (const [name, token] of Object.entries(tokens.dimension ?? {})) {
    const value = token.$value;
    if (!name.startsWith('radius-') || !value || Array.isArray(value) || typeof value.value !== 'number') continue;
    radii.add(value.unit === 'rem' ? value.value * 16 : value.value);
  }
  const typefaces = new Set<string>();
  for (const token of Object.values(tokens.typeface ?? {})) {
    const first = Array.isArray(token.$value) ? token.$value[0] : undefined;
    if (typeof first === 'string') typefaces.add(first.toLowerCase());
  }
  return { fingerprint: [...distinct][0] as string, colors, typefaces, radii };
}
