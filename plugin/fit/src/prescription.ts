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
