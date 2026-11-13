import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, DIRECTIONS, NOT_CHECKED, PAIRS, SMALL_BUSINESS_CSS, STEPS, TOKEN_OF, deriveTokens, resolvePatch, tokensToCss, type DesignParams } from '../src/index.js';
import { contrastHex, everyDesign, remeasure } from './helpers.js';

const designs = everyDesign();
const direction = (id: string): DesignParams => DIRECTIONS.find((d) => d.id === id)!.params;

describe('tokens', () => {
  it('emits every token that the Mockup stylesheet reads', () => {
    const emitted = new Set(Object.keys(deriveTokens(DEFAULT_PARAMS, 'advise').css));
    const used = new Set([...SMALL_BUSINESS_CSS.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]!));
    expect(used.size).toBeGreaterThan(40);
    for (const name of used) expect(emitted.has(name), `the stylesheet reads ${name}`).toBe(true);
  });

  it('emits a hex value for every color that a contrast pair names', () => {
    const hex = deriveTokens(DEFAULT_PARAMS, 'off').hex;
    for (const spec of PAIRS) {
      expect(hex[TOKEN_OF[spec.fg]], spec.id).toMatch(/^#[0-9a-f]{6}$/);
      expect(hex[TOKEN_OF[spec.bg]], spec.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('keeps the touch target at 44 pixels and the focus ring at 3 pixels', () => {
    const css = deriveTokens(DEFAULT_PARAMS, 'off').css;
    expect(css['--target-min']).toBe('2.75rem');
    expect(css['--focus-w']).toBe('3px');
  });

  it('changes only the tokens of the variable that a Step owns', () => {
    const before = deriveTokens(DEFAULT_PARAMS, 'off').css;
    const radius = STEPS.find((s) => s.id === 'radius')!.options.find((o) => o.id === 'pill')!;
    const after = deriveTokens({ ...DEFAULT_PARAMS, ...resolvePatch(radius, DEFAULT_PARAMS) }, 'off').css;
    const changed = Object.keys(after).filter((k) => after[k] !== before[k]);
    expect(changed.sort()).toEqual(['--radius-control', '--radius-small', '--radius-surface']);
  });

  it('refuses a token name or value that could break out of the stylesheet', () => {
    expect(() => tokensToCss({ '--bg': 'red}</style><script>alert(1)</script>' })).toThrow();
    expect(() => tokensToCss({ '--bg': 'red; background: url(x)' })).toThrow();
    expect(() => tokensToCss({ '--bg} body{color:red': 'red' })).toThrow();
    expect(tokensToCss({ '--bg': 'oklch(98% 0.01 250)' })).toContain('--bg: oklch(98% 0.01 250);');
    for (const d of designs.slice(0, 40)) expect(() => tokensToCss(deriveTokens(d.params, 'enforce').css)).not.toThrow();
  });
});

describe('contrast profiles', () => {
  it('reports nothing when the profile is Off', () => {
    for (const d of designs) expect(deriveTokens(d.params, 'off').issues, d.label).toEqual([]);
  });

  it('Advise reports exactly the pairs that fall short, and changes no color', () => {
    for (const d of designs) {
      const off = deriveTokens(d.params, 'off');
      const advise = deriveTokens(d.params, 'advise');
      expect(advise.css, d.label).toEqual(off.css);
      expect(advise.issues.every((i) => i.outcome === 'warning' && i.after === undefined), d.label).toBe(true);
      expect(advise.issues.map((i) => i.id).sort(), d.label).toEqual(advise.pairs.filter((p) => !p.passes).map((p) => p.id).sort());
    }
  });

  it('Enforce brings every pair that the Mockup draws up to its requirement, measured again from the emitted colors', () => {
    let checked = 0;
    for (const d of designs) {
      const t = deriveTokens(d.params, 'enforce');
      for (const pair of t.pairs) {
        const measured = remeasure(pair, t.hex);
        expect(measured, `${d.label}: ${pair.id} (${pair.fgToken} on ${pair.bgToken})`).toBeGreaterThanOrEqual(pair.required);
        // The reported ratio is the measured ratio (within rounding of colors to 8 bits per channel).
        expect(Math.abs(measured - pair.ratio) / pair.ratio, `${d.label}: ${pair.id} reported ${pair.ratio}, measured ${measured}`).toBeLessThan(0.03);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(5000);
  });

  it('a pair marked as passing passes when measured again from the emitted colors, across thousands of random combinations (finding T2-01)', () => {
    // The designs above change one Option at a time. A shortfall of a fraction of a percent appeared only where three or more choices met,
    // so this sweep combines a random Option on every Step with random slider values. The seed is fixed: the same designs every run.
    let seed = 20261113;
    const rand = (): number => {
      seed = (seed + 0x6d2b79f5) | 0;
      let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
    let checked = 0;
    for (let i = 0; i < 3000; i++) {
      let params: DesignParams = i % 3 === 0 ? DEFAULT_PARAMS : DIRECTIONS[Math.floor(rand() * DIRECTIONS.length)]!.params;
      for (const step of STEPS) {
        const option = step.options[Math.floor(rand() * step.options.length)]!;
        params = { ...params, ...resolvePatch(option, params) };
        for (const tunable of step.tunables ?? []) {
          // Half of the sliders move: most to a random stop, and about a third of those to one of the two ends, where rounding costs the most (finding T3-02).
          const roll = rand();
          if (roll < 0.5) params = { ...params, [tunable.key]: roll < 0.08 ? tunable.min : roll < 0.16 ? tunable.max : tunable.min + Math.round((rand() * (tunable.max - tunable.min)) / tunable.step) * tunable.step };
        }
      }
      for (const profile of ['advise', 'enforce'] as const) {
        const t = deriveTokens(params, profile);
        for (const pair of t.pairs) {
          const measured = remeasure(pair, t.hex);
          const where = `design ${i} (${profile}): ${pair.id} (${pair.fgToken} on ${pair.bgToken}), reported ${pair.ratio}, measured ${measured.toFixed(3)}`;
          // The stylesheet carries exactly the colors that were measured, as six hexadecimal digits, which a browser draws as given (finding T3-01).
          for (const token of [pair.fgToken, pair.bgToken]) {
            expect(t.hex[token], `${where}: ${token}`).toMatch(/^#[0-9a-f]{6}$/);
            expect(t.css[token], `${where}: ${token} in the stylesheet`).toBe(t.hex[token]);
          }
          // A figure is rounded down, so a failing pair never shows its requirement as its figure (finding T3-02).
          if (!pair.passes) expect(pair.ratio, where).toBeLessThan(pair.required);
          if (pair.passes) expect(measured, where).toBeGreaterThanOrEqual(pair.required);
          // Under Enforce ("Fix for me") no pair stays below its requirement: measured on 2026-11-13, 0 of 56,405 pairs over these designs.
          if (profile === 'enforce') expect(pair.passes, where).toBe(true);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(100000);
  }, 60000);

  it('holds every pair to its pinned requirement and opacity, and the stylesheet draws those opacities (finding T2-05)', () => {
    // A change to a requirement or to an opacity must be made here too, on purpose. 4.5 is the requirement for text; 3 for large text, borders of controls, and focus rings.
    const pinned: Record<string, [number, string | null]> = {
    'text-on-page': [4.5, null],
    'text-on-card': [4.5, null],
    'text-on-tone': [4.5, null],
    'text-on-field': [4.5, null],
    'muted-on-page': [4.5, null],
    'muted-on-card': [4.5, null],
    'muted-on-tone': [4.5, null],
    'muted-on-field': [4.5, null],
    'link-on-page': [4.5, null],
    'link-on-card': [4.5, null],
    'text-on-hero': [4.5, null],
    'lede-on-hero': [4.5, 'heroLedeAlpha'],
    'fact-labels-in-hero': [4.5, 'softLabelAlpha'],
    'band-figures': [3, null],
    'band-labels': [4.5, 'softLabelAlpha'],
    'solid-band-figures': [3, null],
    'solid-band-labels': [4.5, 'softLabelAlpha'],
    'button-label': [4.5, null],
    'soft-button-label': [4.5, null],
    'outline-button-on-page': [4.5, null],
    'outline-button-on-card': [4.5, null],
    'outline-button-on-rail': [4.5, null],
    'field-border-on-card': [3, null],
    'field-border-on-field': [3, null],
    'focus-on-page': [3, null],
    'focus-on-card': [3, null],
    'focus-on-rail': [3, null],
    'focus-on-hero': [3, null],
    'tag-label': [4.5, null],
    };
    expect(Object.fromEntries(PAIRS.map((s) => [s.id, [s.required, s.alpha ?? null]]))).toEqual(pinned);
    // The two opacities that the pairs assume are the ones the stylesheet applies, and the tokens carry the same numbers.
    expect(SMALL_BUSINESS_CSS).toMatch(/\.lede \{[^}]*opacity: var\(--hero-lede-alpha\)/);
    expect(SMALL_BUSINESS_CSS).toMatch(/opacity: var\(--soft-label-alpha\)/);
    const painted = deriveTokens({ ...DEFAULT_PARAMS, colorStrategy: 'color-block' }, 'off');
    const lede = painted.pairs.find((pair) => pair.id === 'lede-on-hero')!;
    expect(lede.alpha).toBe(Number(painted.css['--hero-lede-alpha']));
    expect(lede.alpha).toBeLessThan(1);
  });

  it('Enforce keeps both ends of a headline fill (fade or two-color gradient) at 3 to 1 or better against the first screen (finding T2-03)', () => {
    let fills = 0;
    for (const d of designs) {
      for (const displayTreatment of ['ink-gradient', 'accent-gradient'] as const) {
        const t = deriveTokens({ ...d.params, displayTreatment }, 'enforce');
        const ground = t.hex['--hero-bg']!;
        // Each end of the fill is written as six hexadecimal digits, or as red, green, and blue steps with the share that shows.
        const stops = [...t.css['--display-fill']!.matchAll(/#([0-9a-f]{6})\b|rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/g)];
        expect(stops, `${d.label}: ${displayTreatment}`).toHaveLength(2);
        for (const stop of stops) {
          const hex = stop[1] !== undefined ? `#${stop[1]}` : `#${[stop[2], stop[3], stop[4]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
          const measured = contrastHex(hex, ground, stop[5] === undefined ? 1 : Number(stop[5]));
          expect(measured, `${d.label}: ${displayTreatment}, stop ${stop[0]} on ${ground}`).toBeGreaterThanOrEqual(3);
        }
        fills++;
      }
    }
    expect(fills).toBeGreaterThan(200);
  });

  it('Enforce says "repaired" only for a pair that now passes, and gives the ratio before and after', () => {
    let repairs = 0;
    for (const d of designs) {
      const before = new Map(deriveTokens(d.params, 'off').pairs.map((p) => [p.id, p]));
      const t = deriveTokens(d.params, 'enforce');
      const after = new Map(t.pairs.map((p) => [p.id, p]));
      for (const issue of t.issues) {
        expect(issue.outcome, `${d.label}: ${issue.id}`).toBe('repaired');
        expect(issue.after!, `${d.label}: ${issue.id}`).toBeGreaterThanOrEqual(issue.required);
        expect(issue.ratio, `${d.label}: ${issue.id}`).toBeLessThan(issue.required);
        // "Before" is what the Off profile measures for the same pair.
        const was = before.get(issue.id);
        if (was) expect(Math.abs(was.ratio - issue.ratio), `${d.label}: ${issue.id}`).toBeLessThan(0.02);
        expect(after.get(issue.id)!.passes, `${d.label}: ${issue.id}`).toBe(true);
        repairs++;
      }
      // Every pair that failed under Off is accounted for under Enforce.
      const failedOff = [...before.values()].filter((p) => !p.passes).map((p) => p.id);
      for (const id of failedOff) if (after.has(id)) expect(t.issues.some((i) => i.id === id), `${d.label}: ${id} failed and was not reported`).toBe(true);
    }
    expect(repairs).toBeGreaterThan(200);
  });

  it('never lowers the contrast of a pair that Enforce reports on', () => {
    for (const d of designs) {
      const off = new Map(deriveTokens(d.params, 'off').pairs.map((p) => [p.id, p.ratio]));
      for (const pair of deriveTokens(d.params, 'enforce').pairs) {
        const was = off.get(pair.id);
        if (was !== undefined && was < pair.required) expect(pair.ratio, `${d.label}: ${pair.id}`).toBeGreaterThan(was);
      }
    }
  });

  it('keeps the focus ring visible on a painted first screen in every profile (finding P-01)', () => {
    const painted = designs.filter((d) => d.params.colorStrategy === 'color-block');
    expect(painted.length).toBeGreaterThan(20);
    for (const d of painted) {
      for (const profile of ['off', 'advise', 'enforce'] as const) {
        const t = deriveTokens(d.params, profile);
        expect(contrastHex(t.hex['--focus-hero']!, t.hex['--hero-bg']!), `${d.label} (${profile})`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keeps links and the focus ring at 3:1 or better against the page in every profile (decision D24)', () => {
    for (const d of designs) {
      const t = deriveTokens(d.params, 'off');
      expect(contrastHex(t.hex['--accent-text']!, t.hex['--bg']!), `${d.label}: link`).toBeGreaterThanOrEqual(3);
      expect(contrastHex(t.hex['--focus']!, t.hex['--bg']!), `${d.label}: focus ring`).toBeGreaterThanOrEqual(3);
      expect(contrastHex(t.hex['--focus']!, t.hex['--card-surface']!), `${d.label}: focus ring on boxes`).toBeGreaterThanOrEqual(3);
    }
  });

  it('checks an outline button against the surfaces it sits on, and Enforce improves it (finding P-02)', () => {
    const dark: DesignParams = { ...direction('midnight-aurora'), colorStrategy: 'color-block', buttonFinish: 'outline', accentHue: 258, accentChroma: 0.15, accentLightness: 0.44 };
    const off = deriveTokens(dark, 'off');
    const enforce = deriveTokens(dark, 'enforce');
    const onPage = (t: typeof off): number => contrastHex(t.hex['--btn-label']!, t.hex['--bg']!);
    expect(onPage(enforce)).toBeGreaterThanOrEqual(4.5);
    expect(onPage(enforce)).toBeGreaterThanOrEqual(onPage(off));
    expect(enforce.pairs.some((p) => p.id === 'outline-button-on-page')).toBe(true);
    expect(enforce.pairs.some((p) => p.id === 'outline-button-on-card')).toBe(true);
  });

  it('never changes the accent itself when it repairs text that uses the accent', () => {
    for (const d of designs.filter((x) => x.params.colorStrategy !== 'color-block').slice(0, 80)) {
      const off = deriveTokens(d.params, 'off');
      const enforce = deriveTokens(d.params, 'enforce');
      expect(enforce.hex['--accent'], d.label).toBe(off.hex['--accent']);
    }
  });

  it('states what the checks do not cover', () => {
    expect(NOT_CHECKED.length).toBeGreaterThanOrEqual(3);
    expect(NOT_CHECKED.join(' ')).toMatch(/photograph/);
    expect(NOT_CHECKED.join(' ')).toMatch(/glow|glass/);
  });
});

describe('the background "Field of stars" and the band on a dark page (decision D42)', () => {
  /** Counts the layers of a background value: the commas that sit outside every pair of round brackets, plus one. */
  const layers = (value: string): number => {
    let depth = 0;
    let count = 1;
    for (const ch of value) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ',' && depth === 0) count++;
    }
    return count;
  };

  it('gives every star layer its own tile size, so that no layer falls back to a default size', () => {
    for (const theme of ['dark', 'light'] as const) {
      const css = deriveTokens({ ...DEFAULT_PARAMS, atmosphere: 'stars', theme }, 'advise').css;
      expect(layers(css['--atmo-image']!)).toBe(12);
      expect(layers(css['--atmo-size']!)).toBe(layers(css['--atmo-image']!));
    }
  });

  it('scatters the stars: tiles of three different sizes, and no two stars at the same place in a tile', () => {
    const css = deriveTokens({ ...DEFAULT_PARAMS, atmosphere: 'stars', theme: 'dark' }, 'advise').css;
    const places = [...css['--atmo-image']!.matchAll(/circle at ([\d.]+)% ([\d.]+)%/g)].map((m) => `${m[1]},${m[2]}`);
    expect(places).toHaveLength(11);
    expect(new Set(places).size).toBe(11);
    expect(new Set(css['--atmo-size']!.split(', ').slice(0, 11)).size).toBe(3);
  });

  it('paints the band in a deep shade of the second color on a dark page, and in the second color itself on a light page', () => {
    const base: DesignParams = { ...DEFAULT_PARAMS, colorStrategy: 'duo', accent2Hue: 18, accentChroma: 0.2 };
    const dark = deriveTokens({ ...base, theme: 'dark' }, 'advise').hex;
    const light = deriveTokens({ ...base, theme: 'light' }, 'advise').hex;
    expect(light['--band-bg']).toBe(light['--accent-2']);
    expect(dark['--band-bg']).not.toBe(dark['--accent-2']);
    // Deep: clearly darker than the second color, yet clearly apart from the page.
    expect(contrastHex(dark['--accent-2']!, dark['--band-bg']!)).toBeGreaterThan(2);
    expect(contrastHex(dark['--band-bg']!, dark['--bg']!)).toBeGreaterThan(1.5);
    expect(contrastHex(dark['--band-text']!, dark['--band-bg']!)).toBeGreaterThanOrEqual(4.5);
  });
});
