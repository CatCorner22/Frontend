import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS, DIRECTIONS, REASON_MAX, STEPS,
  applyDirection, closerOptions, conflicts, createProject, describeDesign, designDistance, findStep, firstOpenStepId, generateDirections, keep,
  matchingOptionId, nextStepId, ownedValues, pick, pickValues, prevStepId, previewParams, revert, setReason, startPlain, tune, wireframeParams,
  type DesignParams, type Project,
} from '../src/index.js';

const AT = '2026-11-13T12:00:00.000Z';
const fresh = (): Project => createProject('Test');
const step = (id: string) => findStep(id)!;
const others = (p: Project, stepId: string): Partial<DesignParams> => {
  const owned = new Set<string>(step(stepId).owns);
  return Object.fromEntries(Object.entries(p.params).filter(([k]) => !owned.has(k))) as Partial<DesignParams>;
};

describe('engine: picking', () => {
  it('records a pick with its values, its rejected Options, and its time, and changes nothing else', () => {
    const before = fresh();
    const after = pick(before, 'nav', 'split-cta', AT);
    expect(after.params.nav).toBe('split-cta');
    expect(others(after, 'nav')).toEqual(others(before, 'nav'));
    expect(after.decisions['nav']).toEqual({ stepId: 'nav', optionId: 'split-cta', kind: 'picked', rejected: ['top-inline', 'top-centered', 'side-rail'], values: { nav: 'split-cta' }, at: AT });
    expect(before.params.nav).toBe('top-inline');
    expect(Object.keys(before.decisions)).toEqual([]);
  });

  it('refuses an unknown Step or Option, including names of built-in object members', () => {
    for (const name of ['nope', 'constructor', 'toString', '__proto__']) {
      expect(() => pick(fresh(), name, 'x')).toThrow('Unknown Step.');
      expect(() => pick(fresh(), 'nav', name)).toThrow('This Step has no such Option.');
      expect(() => applyDirection(fresh(), name)).toThrow('Unknown Direction.');
    }
  });

  it('previews an Option without changing the project', () => {
    const p = fresh();
    const option = step('radius').options.find((o) => o.id === 'pill')!;
    expect(previewParams(p, option).radius).toBe(999);
    expect(p.params.radius).toBe(8);
  });

  it('finds the Option that matches the design, or none', () => {
    expect(matchingOptionId(DEFAULT_PARAMS, step('radius'))).toBe('subtle');
    expect(matchingOptionId({ ...DEFAULT_PARAMS, radius: 10 }, step('radius'))).toBeNull();
    expect(matchingOptionId({ ...DEFAULT_PARAMS, colorStrategy: 'duo', accent2Hue: (DEFAULT_PARAMS.accentHue + 180) % 360 }, step('color-strategy'))).toBe('duo-complement');
    expect(matchingOptionId({ ...DEFAULT_PARAMS, colorStrategy: 'duo', accent2Hue: 5 }, step('color-strategy'))).toBeNull();
  });
});

describe('engine: Directions and keeping', () => {
  it('starts from a Direction: every value set, earlier Decisions cleared, the starting design remembered', () => {
    let p = pick(fresh(), 'nav', 'side-rail', AT);
    p = applyDirection(p, 'midnight-aurora');
    const aurora = DIRECTIONS.find((d) => d.id === 'midnight-aurora')!;
    expect(p.params).toEqual(aurora.params);
    expect(p.base).toEqual(aurora.params);
    expect(p.direction).toBe('midnight-aurora');
    expect(p.decisions).toEqual({});
    expect(p.params).not.toBe(aurora.params);
  });

  it('keeps every value of every Direction when the owner keeps every Step (findings P-04, FTU-02, FTU-03)', () => {
    for (const d of DIRECTIONS) {
      let p = applyDirection(fresh(), d.id);
      for (const s of STEPS) p = keep(p, s.id, AT);
      expect(p.params, d.id).toEqual(d.params);
      expect(Object.keys(p.decisions), d.id).toHaveLength(STEPS.length);
      for (const s of STEPS) {
        const decision = p.decisions[s.id]!;
        expect(decision.kind).toBe('kept');
        expect(decision.rejected).toEqual([]);
        expect(decision.values).toEqual(ownedValues(s, d.params));
        expect(decision.optionId).toBe(matchingOptionId(d.params, s));
      }
    }
  });

  it('does not let "keep" overwrite a Decision that exists', () => {
    const picked = pick(fresh(), 'radius', 'pill', AT);
    expect(keep(picked, 'radius', '2026-11-14T00:00:00.000Z')).toBe(picked);
  });

  it('puts a Step back to the value the project started with', () => {
    let p = applyDirection(fresh(), 'poster-block');
    p = pick(p, 'radius', 'pill', AT);
    p = tune(p, 'radius', 'radius', 12, AT);
    p = revert(p, 'radius');
    expect(p.params.radius).toBe(0);
    expect(p.decisions['radius']).toBeUndefined();
    expect(others(p, 'radius')).toEqual(others(applyDirection(fresh(), 'poster-block'), 'radius'));
  });

  it('starts plain: no Direction, default values, no Decisions', () => {
    const p = startPlain(pick(applyDirection(fresh(), 'ember-noir'), 'nav', 'side-rail', AT));
    expect(p.direction).toBeNull();
    expect(p.params).toEqual(DEFAULT_PARAMS);
    expect(p.base).toEqual(DEFAULT_PARAMS);
    expect(p.decisions).toEqual({});
  });
});

describe('engine: fine-tuning by hand', () => {
  it('changes only the value that moved, starting from the design as it stands (finding FTU-06)', () => {
    const start = applyDirection(fresh(), 'soft-daylight');
    const p = tune(start, 'accent', 'accentHue', 257, AT);
    expect(p.params.accentHue).toBe(257);
    expect(p.params.accentChroma).toBe(start.params.accentChroma);
    expect(p.params.accentLightness).toBe(start.params.accentLightness);
    expect(others(p, 'accent')).toEqual(others(start, 'accent'));
    expect(p.decisions['accent']).toMatchObject({ kind: 'tuned', optionId: null, rejected: [], values: { accentHue: 257, accentChroma: 0.19, accentLightness: 0.55 } });
  });

  it('clamps to the slider range and refuses values that are not numbers or not adjustable', () => {
    expect(tune(fresh(), 'radius', 'radius', 500, AT).params.radius).toBe(28);
    expect(tune(fresh(), 'radius', 'radius', -5, AT).params.radius).toBe(0);
    expect(() => tune(fresh(), 'radius', 'radius', Number.NaN)).toThrow();
    expect(() => tune(fresh(), 'radius', 'radius', Infinity)).toThrow();
    expect(() => tune(fresh(), 'radius', 'accentHue', 10)).toThrow();
    expect(() => tune(fresh(), 'nav', 'radius', 10)).toThrow();
  });

  it('names a tuned Step after an Option only when its values equal that Option', () => {
    expect(tune(fresh(), 'radius', 'radius', 14, AT).decisions['radius']!.optionId).toBe('soft');
    expect(tune(fresh(), 'radius', 'radius', 15, AT).decisions['radius']!.optionId).toBeNull();
  });

  it('keeps the Options that were rejected earlier when a pick is then tuned', () => {
    const p = tune(pick(fresh(), 'radius', 'soft', AT), 'radius', 'radius', 16, AT);
    expect(p.decisions['radius']!.rejected).toEqual(['square', 'crisp', 'subtle', 'pill']);
  });

  it('accepts hand-set values only for values that the Step owns, each inside its range or its list', () => {
    const p = pickValues(fresh(), 'accent', { accentHue: 100, accentChroma: 0.1 }, AT);
    expect(p.params.accentHue).toBe(100);
    expect(p.params.accentChroma).toBe(0.1);
    expect(p.decisions['accent']!.kind).toBe('tuned');
    expect(pickValues(fresh(), 'heading-treatment', { headingWeight: 750, headingCase: 'upper' }, AT).params).toMatchObject({ headingWeight: 750, headingCase: 'upper' });
    expect(() => pickValues(fresh(), 'accent', { radius: 3 })).toThrow();
    expect(() => pickValues(fresh(), 'accent', { accentHue: 999 })).toThrow();
    expect(() => pickValues(fresh(), 'accent', { accentHue: Number.NaN })).toThrow();
    expect(() => pickValues(fresh(), 'nav', { nav: 'sideways' as never })).toThrow();
    expect(() => pickValues(fresh(), 'heading-treatment', { headingCase: '"><script>' as never })).toThrow();
  });
});

describe('engine: values that follow other values (finding M-05)', () => {
  it('keeps "Two colors, opposite" opposite when the accent changes later', () => {
    let p = pick(fresh(), 'accent', 'teal', AT);
    p = pick(p, 'color-strategy', 'duo-complement', AT);
    expect(p.params.accent2Hue).toBe(15);
    p = pick(p, 'accent', 'crimson', AT);
    expect(p.params.accentHue).toBe(18);
    expect(p.params.accent2Hue).toBe(198);
    expect(p.decisions['color-strategy']).toMatchObject({ optionId: 'duo-complement', kind: 'picked', values: { colorStrategy: 'duo', accent2Hue: 198 } });
    p = tune(p, 'accent', 'accentHue', 90, AT);
    expect(p.params.accent2Hue).toBe(270);
  });

  it('leaves a hand-set second hue alone', () => {
    let p = pick(fresh(), 'color-strategy', 'duo-triad', AT);
    p = tune(p, 'color-strategy', 'accent2Hue', 40, AT);
    p = pick(p, 'accent', 'forest', AT);
    expect(p.params.accent2Hue).toBe(40);
    expect(p.decisions['color-strategy']!.kind).toBe('tuned');
  });
});

describe('engine: reasons (finding M-09)', () => {
  it('records the owner’s reason on a Decision, trimmed and limited, and removes an empty one', () => {
    let p = pick(fresh(), 'nav', 'side-rail', AT);
    p = setReason(p, 'nav', '  The site works like a tool.  ');
    expect(p.decisions['nav']!.reason).toBe('The site works like a tool.');
    p = setReason(p, 'nav', 'x'.repeat(REASON_MAX + 50));
    expect(p.decisions['nav']!.reason).toHaveLength(REASON_MAX);
    p = setReason(p, 'nav', '   ');
    expect('reason' in p.decisions['nav']!).toBe(false);
    expect(() => setReason(fresh(), 'nav', 'no Decision yet')).toThrow();
  });

  it('keeps the reason when the Decision is tuned, and drops it when another Option is picked', () => {
    let p = setReason(pick(fresh(), 'radius', 'soft', AT), 'radius', 'Friendly.');
    p = tune(p, 'radius', 'radius', 16, AT);
    expect(p.decisions['radius']!.reason).toBe('Friendly.');
    p = pick(p, 'radius', 'square', AT);
    expect(p.decisions['radius']!.reason).toBeUndefined();
  });
});

describe('engine: small variations', () => {
  it('offers named variations near the current values, without duplicates', () => {
    const options = closerOptions(fresh(), 'accent', 0);
    expect(options.length).toBeGreaterThanOrEqual(4);
    expect(new Set(options.map((o) => JSON.stringify(o.values))).size).toBe(options.length);
    expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
    const labels = options.map((o) => o.label).join(' | ');
    expect(labels).toMatch(/Hue: a little toward (violet|teal)/);
    expect(labels).toMatch(/Vividness: a little (duller|more vivid)/);
    expect(labels).not.toMatch(/: (less|more)$/);
    for (const o of options) for (const key of Object.keys(o.values)) expect(step('accent').owns as string[]).toContain(key);
  });

  it('narrows in with each round', () => {
    const first = closerOptions(fresh(), 'density', 0).map((o) => Math.abs((o.values.density as number) - 1));
    const third = closerOptions(fresh(), 'density', 2).map((o) => Math.abs((o.values.density as number) - 1));
    expect(Math.max(...third)).toBeLessThan(Math.min(...first));
  });

  it('offers only a sharper corner after "Pill", and nothing for a Step without sliders', () => {
    const pill = pick(fresh(), 'radius', 'pill', AT);
    const options = closerOptions(pill, 'radius', 0);
    expect(options).toHaveLength(1);
    expect(options[0]!.label).toBe('Radius: a little sharper');
    expect(options[0]!.values.radius).toBe(25);
    expect(closerOptions(fresh(), 'nav')).toEqual([]);
  });

  it('changes the design when a variation is applied', () => {
    const p = fresh();
    const variation = closerOptions(p, 'radius', 0)[0]!;
    const after = pickValues(p, 'radius', variation.values, AT);
    expect(after.params.radius).toBe(variation.values.radius);
    expect(after.params.radius).not.toBe(p.params.radius);
  });
});

describe('engine: the gray layout view', () => {
  it('keeps every Structure value and resets every Feel value', () => {
    const colorful = DIRECTIONS.find((d) => d.id === 'sticker-pop')!.params;
    const gray = wireframeParams(colorful);
    for (const s of STEPS) {
      for (const key of s.owns) {
        if (s.stage === 'structure') expect(gray[key], `${String(key)} is structure`).toEqual(colorful[key]);
      }
    }
    expect(gray).toMatchObject({ accentChroma: 0, neutralChroma: 0, colorStrategy: 'quiet', theme: 'light', elevation: 'borders', signature: 'none', atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'none', fontHeading: 'system-sans' });
  });
});

describe('engine: generated Directions', () => {
  const seed = 20261113;
  it('is repeatable, conflict-free, valid, and distinct', () => {
    const a = generateDirections(seed, 6);
    const b = generateDirections(seed, 6);
    expect(a).toEqual(b);
    expect(a).toHaveLength(6);
    expect(new Set(a.map((d) => d.id)).size).toBe(6);
    expect(new Set(a.map((d) => d.name)).size).toBe(6);
    for (const d of a) {
      expect(d.id).toMatch(/^generated-\d+-\d$/);
      expect(conflicts({ ...fresh(), params: d.params })).toEqual([]);
      expect(d.reviewed).toBeNull();
    }
    for (const [i, x] of a.entries()) for (const y of a.slice(i + 1)) expect(designDistance(x.params, y.params)).toBeGreaterThan(1);
  });

  it('describes each generated Direction by its final values (finding P-08)', () => {
    for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) {
      for (const d of generateDirections(s, 6)) {
        expect(d.mood).toBe(describeDesign(d.params));
        expect(d.mood).toContain(d.params.theme === 'dark' ? 'A dark page' : 'A light page');
        const depth = step('elevation').options.find((o) => o.id === matchingOptionId(d.params, step('elevation')))!.label;
        expect(d.name, `${d.name} should name its depth "${depth}"`).toContain(depth);
        const face = step('typeface').options.find((o) => o.id === matchingOptionId(d.params, step('typeface')))!.label;
        expect(d.name).toContain(face);
      }
    }
  });

  it('steers away from the designs it is told to avoid', () => {
    const first = generateDirections(seed, 6);
    const second = generateDirections(seed, 6, first.map((d) => d.params));
    for (const d of second) {
      const nearest = Math.min(...first.map((f) => designDistance(d.params, f.params)));
      expect(nearest).toBeGreaterThan(1);
    }
    expect(second.map((d) => JSON.stringify(d.params))).not.toEqual(first.map((d) => JSON.stringify(d.params)));
  });
});

describe('engine: moving between Steps', () => {
  it('walks the Steps in order and finds the first open one', () => {
    expect(prevStepId(STEPS[0]!.id)).toBeNull();
    expect(nextStepId(STEPS[STEPS.length - 1]!.id)).toBeNull();
    expect(nextStepId('nav')).toBe('hero');
    expect(prevStepId('hero')).toBe('nav');
    expect(nextStepId('theme')).toBe('contrast');
    expect(firstOpenStepId(fresh())).toBe('nav');
    expect(firstOpenStepId(keep(pick(fresh(), 'nav', 'side-rail', AT), 'hero', AT))).toBe('sections');
  });
});
