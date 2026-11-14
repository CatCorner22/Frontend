import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS, DIRECTIONS, REASON_MAX, STEPS,
  activeTunables, applyDirection, closerOptions, conflicts, createProject, deriveTokens, describeDesign, designDistance, findStep, firstOpenStepId, generateDirections, keep,
  matchingOptionId, nearestSliderValue, nextSliderValue, nextStepId, ownedValues, parseProject, pick, pickValues, prevStepId, previewParams, resolvePatch, revert, setReason, startPlain, tune, wireframeParams,
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
    expect(previewParams(p, 'radius', 'pill').radius).toBe(999);
    expect(p.params.radius).toBe(8);
    expect(p.decisions['radius']).toBeUndefined();
  });

  it('previews exactly the design that the pick gives, for every Direction, Step, and Option (code review, finding "gaps 1")', () => {
    for (const direction of DIRECTIONS) {
      const start = applyDirection(fresh(), direction.id);
      for (const s of STEPS) for (const o of s.options) expect(previewParams(start, s.id, o.id), `${direction.id}, ${s.id}, ${o.id}`).toEqual(pick(start, s.id, o.id, AT).params);
    }
    // The case that went wrong: "Sticker Pop" has a second color that follows the main color. The card for a new main color
    // must show the second color that the pick will give, not the old one.
    const sticker = applyDirection(fresh(), 'sticker-pop');
    const shown = previewParams(sticker, 'accent', 'ink-blue');
    expect(shown.accent2Hue).not.toBe(sticker.params.accent2Hue);
    expect(shown.accent2Hue).toBe(pick(sticker, 'accent', 'ink-blue', AT).params.accent2Hue);
  });

  it('never lets a fixed second color start to follow the main color by coincidence (code review, finding "engine 1")', () => {
    // "Galactic Goth": main hue 302, second hue fixed at 18. The main color "ink-blue" (258) puts the two exactly a third of
    // the wheel apart for a moment; the second color must stay 18 all the same.
    const goth = applyDirection(fresh(), 'galactic-goth');
    expect(goth.params.accent2Hue).toBe(18);
    const viaBlue = pick(pick(goth, 'accent', 'ink-blue', AT), 'accent', 'teal', AT);
    expect(viaBlue.params.accent2Hue).toBe(18);
    expect(viaBlue.params.accent2Hue).toBe(pick(goth, 'accent', 'teal', AT).params.accent2Hue);
    // A kept Decision on the color Step is not rewritten either.
    const kept = keep(goth, 'color-strategy', AT);
    expect(pick(pick(kept, 'accent', 'ink-blue', AT), 'accent', 'teal', AT).decisions['color-strategy']).toEqual(kept.decisions['color-strategy']);
    // "Frontier Gazette": main hue 38, second hue fixed at 245. A walk of the hue slider, one degree at a time, passes the hue
    // at which the two are opposite; the second color stays 245 whether the owner walks or jumps.
    const frontier = applyDirection(fresh(), 'frontier-gazette');
    let walked = frontier;
    for (let hue = 39; hue <= 70; hue++) walked = tune(walked, 'accent', 'accentHue', hue, AT);
    expect(walked.params.accent2Hue).toBe(245);
    expect(tune(frontier, 'accent', 'accentHue', 70, AT).params.accent2Hue).toBe(245);
    // And a second color that does follow (from a Direction, with no Decision) still follows.
    const sticker = applyDirection(fresh(), 'sticker-pop');
    const strategyBefore = matchingOptionId(sticker.params, step('color-strategy'));
    const moved = pick(sticker, 'accent', 'crimson', AT);
    expect(moved.params.accent2Hue).not.toBe(sticker.params.accent2Hue);
    expect(matchingOptionId(moved.params, step('color-strategy'))).toBe(strategyBefore);
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

  it('walks a slider along its grid from any value, and never leaves its range (campaign 4, finding F-9)', () => {
    const spacing = step('density').tunables!.find((t) => t.key === 'density')!;
    expect([spacing.min, spacing.max, spacing.step]).toEqual([0.75, 1.45, 0.05]);
    // From a value between two grid points, one key press goes to the next grid point in that direction.
    expect(nextSliderValue(spacing, 1.12, 1)).toBe(1.15);
    expect(nextSliderValue(spacing, 1.12, -1)).toBe(1.1);
    // From a grid point, one key press moves one whole step.
    expect(nextSliderValue(spacing, 1.1, 1)).toBe(1.15);
    expect(nextSliderValue(spacing, 1.1, -1)).toBe(1.05);
    expect(nextSliderValue(spacing, 1.12, 10)).toBe(1.45);
    expect(nextSliderValue(spacing, 1.12, -10)).toBe(0.75);
    expect(nextSliderValue(spacing, 1.45, 1)).toBe(1.45);
    expect(nextSliderValue(spacing, 0.75, -1)).toBe(0.75);
    expect(nextSliderValue(spacing, 1.12, 0)).toBe(1.12);
    // A key that points past the end changes nothing, also for a value beyond the slider: "Fully round" is 999, the slider
    // for "Corner rounding" ends at 28, and the key for "rounder" must not make it 28 (code review, finding "engine 3").
    const corners = step('radius').tunables!.find((t) => t.key === 'radius')!;
    expect(nextSliderValue(corners, 999, 1)).toBe(999);
    expect(nextSliderValue(corners, 999, 10)).toBe(999);
    // The key for "sharper" leaves "fully round" and lands on the slider's top, the largest rounding with a number.
    expect(nextSliderValue(corners, 999, -1)).toBe(28);
    expect(nextSliderValue(corners, 0, -1)).toBe(0);
    // A drag lands on the grid.
    expect(nearestSliderValue(spacing, 1.1234567)).toBe(1.1);
    expect(nearestSliderValue(spacing, 9)).toBe(1.45);
    // Every slider of the Catalog: a walk from one end reaches the other, in steps, inside the range.
    for (const s of STEPS) {
      for (const t of s.tunables ?? []) {
        let v = t.min;
        let presses = 0;
        while (v < t.max && presses < 5000) {
          const next = nextSliderValue(t, v, 1);
          expect(next, `${s.id} ${String(t.key)}`).toBeGreaterThan(v);
          expect(next).toBeLessThanOrEqual(t.max);
          v = next;
          presses++;
        }
        expect(v, `${s.id} ${String(t.key)}`).toBe(t.max);
      }
    }
  });

  it('never lists as rejected the Option that a Decision holds, when a slider lands on a rejected Option (campaign 4, finding F-14)', () => {
    // Pick "crisp": the other Options of the Step are now rejected. Then move the slider onto the exact value of "soft".
    const picked = pick(fresh(), 'contrast', 'crisp', AT);
    expect(picked.decisions['contrast']!.rejected).toContain('soft');
    const soft = step('contrast').options.find((o) => o.id === 'soft')!.patch.contrast as number;
    const moved = tune(picked, 'contrast', 'contrast', soft, AT);
    const decision = moved.decisions['contrast']!;
    expect(decision).toMatchObject({ kind: 'tuned', optionId: 'soft' });
    expect(decision.rejected).not.toContain('soft');
    expect(decision.rejected).toEqual(['balanced']);
    // Saving and opening the project changes nothing, so the Studio has no reason to say that opening changed details.
    const reopened = parseProject(JSON.parse(JSON.stringify(moved)));
    expect(reopened.ok && reopened.project.decisions['contrast']).toEqual(decision);
    expect(reopened.ok && reopened.notes).toEqual([]);
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

describe('engine: a slider whose range is narrowed (campaign 4, round 3)', () => {
  it('steps inward from the end when the value lies beyond a narrowed range, and still goes to the end from "fully round"', () => {
    // "Golden yellow" on a dark page: lightness 0.8, and the slider offers 0.48 to 0.68, because every value above 0.68 is drawn alike.
    const dark = pick(pick(fresh(), 'theme', 'dark', AT), 'accent', 'mustard', AT);
    const lightness = activeTunables(findStep('accent')!, dark.params).find((t) => t.key === 'accentLightness')!;
    expect([lightness.min, lightness.max]).toEqual([0.48, 0.68]);
    expect(dark.params.accentLightness).toBeGreaterThan(lightness.max);
    const darker = nextSliderValue(lightness, dark.params.accentLightness, -1);
    expect(darker).toBeLessThan(lightness.max);
    expect(darker).toBe(nextSliderValue(lightness, lightness.max, -1));
    expect(nextSliderValue(lightness, dark.params.accentLightness, 1)).toBe(dark.params.accentLightness);
    // "Fully round" is a look of its own beyond the slider's top: one press toward "less round" goes to the top.
    const corners = findStep('radius')!.tunables!.find((t) => t.key === 'radius')!;
    expect(nextSliderValue(corners, 999, -1)).toBe(corners.max);
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

  it('keeps the reason when the owner picks the same Option again (campaign 4, round 3)', () => {
    let p = setReason(pick(fresh(), 'radius', 'soft', AT), 'radius', 'Friendly.');
    p = pick(p, 'radius', 'soft', '2026-11-14T08:00:00.000Z');
    expect(p.decisions['radius']).toMatchObject({ optionId: 'soft', kind: 'picked', reason: 'Friendly.', at: '2026-11-14T08:00:00.000Z' });
  });
});

describe('engine: small variations', () => {
  it('offers named variations near the current values, without duplicates', () => {
    const options = closerOptions(fresh(), 'accent', 0);
    expect(options.length).toBeGreaterThanOrEqual(4);
    expect(new Set(options.map((o) => JSON.stringify(o.values))).size).toBe(options.length);
    expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
    const labels = options.map((o) => o.label).join(' | ');
    expect(labels).toMatch(/Color \(hue\): a little toward (violet|teal)/);
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
    expect(options[0]!.label).toBe('Corner rounding: a little sharper');
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

describe('engine: a second color follows the main color (finding T2-02)', () => {
  const strategy = step('color-strategy');
  /** A design that matches "a third of the wheel apart" with no Decision on that Step, as a Direction gives it. */
  const fromDirection = (): Project => {
    const picked = pick(fresh(), 'color-strategy', 'duo-triad', AT);
    return { ...picked, decisions: {}, base: picked.params };
  };
  const consistent = (p: Project): void => {
    for (const [id, d] of Object.entries(p.decisions)) {
      expect(d.optionId, `${id}: the Decision names the Option that the design matches`).toBe(matchingOptionId(p.params, step(id)));
      expect(d.values, `${id}: the Decision holds the design's values`).toEqual(ownedValues(step(id), p.params));
      if (d.optionId !== null) expect(d.rejected, `${id}: the Decision does not reject the Option it holds`).not.toContain(d.optionId);
    }
  };

  it('follows when the Option came from a Direction, with no Decision on that Step', () => {
    const start = fromDirection();
    const changed = pick(start, 'accent', 'crimson', AT);
    expect(changed.params.accentHue).not.toBe(start.params.accentHue);
    expect(matchingOptionId(changed.params, strategy)).toBe('duo-triad');
  });

  it('follows when the owner kept the Option, and the kept Decision stays true', () => {
    const kept = keep(fromDirection(), 'color-strategy', AT);
    const changed = pick(kept, 'accent', 'crimson', AT);
    expect(matchingOptionId(changed.params, strategy)).toBe('duo-triad');
    expect(changed.decisions['color-strategy']!.kind).toBe('kept');
    consistent(changed);
  });

  it('follows when a Step is put back to how the project started', () => {
    const p = pick(pick(fresh(), 'color-strategy', 'duo-complement', AT), 'accent', 'crimson', AT);
    const back = revert(p, 'accent');
    expect(back.params.accentHue).toBe(fresh().params.accentHue);
    expect(matchingOptionId(back.params, strategy)).toBe('duo-complement');
    consistent(back);
  });

  it('goes back to the Option, not to the starting number, when the color Step itself is put back (finding T3-03)', () => {
    // "Sticker Pop" starts with "Two colors: a third of the wheel apart".
    const start = applyDirection(fresh(), 'sticker-pop');
    expect(matchingOptionId(start.params, strategy)).toBe('duo-triad');
    const red = pick(start, 'accent', 'crimson', AT);
    expect(matchingOptionId(red.params, strategy)).toBe('duo-triad');
    // Put the color Step back: the second color is a third of the wheel from the main color as it is now.
    const back = revert(red, 'color-strategy');
    expect(matchingOptionId(back.params, strategy)).toBe('duo-triad');
    expect(back.params.accent2Hue).toBe(red.params.accent2Hue);
    // It keeps following afterward.
    const blue = pick(back, 'accent', 'cobalt', AT);
    expect(matchingOptionId(blue.params, strategy)).toBe('duo-triad');
    consistent(blue);
    // The same holds after a hand-set second color is put back.
    const tuned = tune(red, 'color-strategy', 'accent2Hue', 200, AT);
    const untuned = revert(tuned, 'color-strategy');
    expect(matchingOptionId(untuned.params, strategy)).toBe('duo-triad');
    expect(matchingOptionId(pick(untuned, 'accent', 'cobalt', AT).params, strategy)).toBe('duo-triad');
  });

  it('never moves a hand-set second color, even one that lands exactly on a following Option (finding T3-12)', () => {
    const base = pick(fresh(), 'color-strategy', 'duo-triad', AT);
    const opposite = (base.params.accentHue + 180) % 360;
    const tuned = tune(base, 'color-strategy', 'accent2Hue', opposite, AT);
    expect(tuned.decisions['color-strategy']!.kind).toBe('tuned');
    // The hand-set value happens to equal "Two colors: opposites". It is still the owner's own value, so it does not follow.
    expect(matchingOptionId(tuned.params, strategy)).toBe('duo-complement');
    const changed = pick(tuned, 'accent', 'crimson', AT);
    expect(changed.params.accentHue).not.toBe(base.params.accentHue);
    expect(changed.params.accent2Hue).toBe(opposite);
  });

  it('never moves a second color that the owner set by hand', () => {
    const tuned = tune(pick(fresh(), 'color-strategy', 'duo-triad', AT), 'color-strategy', 'accent2Hue', 200, AT);
    const changed = pick(tuned, 'accent', 'crimson', AT);
    expect(changed.params.accent2Hue).toBe(200);
    consistent(changed);
  });

  it('keeps every Decision true to the design through 400 random sequences of actions, and through save and reload', () => {
    let seed = 7;
    const rand = (): number => {
      seed = (seed + 0x6d2b79f5) | 0;
      let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
    const any = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;
    const canonical = (value: unknown): unknown =>
      Array.isArray(value) ? value.map(canonical) : typeof value === 'object' && value !== null ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical((value as Record<string, unknown>)[k])])) : value;
    const actions: Record<string, number> = {};
    for (let run = 0; run < 400; run++) {
      let p = rand() < 0.5 ? fresh() : applyDirection(fresh(), any(DIRECTIONS).id);
      for (let action = 0; action < 20; action++) {
        const s = any(STEPS);
        // Every action the Studio can take on a project: pick, keep, slider, small variation, reason, put back, a new Direction, the plain start.
        const kind = Math.floor(rand() * 8);
        let ran = 'put back';
        if (kind === 0 || kind === 6) {
          p = pick(p, s.id, any(s.options).id, AT);
          ran = 'pick';
        } else if (kind === 1) {
          p = keep(p, s.id, AT);
          ran = 'keep';
        } else if (kind === 2 && s.tunables?.length) {
          const tunable = any(s.tunables);
          // Half of the slider moves land exactly on the value of one of the Step's Options, as a key press on the slider's
          // grid does; the other half land anywhere. An exact landing on a rejected Option once left a Decision that
          // contradicted itself (campaign 4, finding F-14), and a sweep with only "anywhere" values never met that case.
          const onOption = rand() < 0.5 ? resolvePatch(any(s.options), p.params)[tunable.key] : undefined;
          p = tune(p, s.id, tunable.key, typeof onOption === 'number' ? onOption : tunable.min + rand() * (tunable.max - tunable.min), AT);
          ran = 'slider';
        } else if (kind === 3 && s.tunables?.length && closerOptions(p, s.id).length > 0) {
          p = pickValues(p, s.id, any(closerOptions(p, s.id, Math.floor(rand() * 3))).values, AT);
          ran = 'small variation';
        } else if (kind === 4 && p.decisions[s.id]) {
          p = setReason(p, s.id, rand() < 0.3 ? '' : `reason ${run}-${action}`);
          ran = 'reason';
        } else if (kind === 5 && rand() < 0.25) {
          p = rand() < 0.5 ? applyDirection(p, any(DIRECTIONS).id) : startPlain(p);
          ran = 'new start';
        } else p = revert(p, s.id);
        consistent(p);
        actions[ran] = (actions[ran] ?? 0) + 1;
      }
      const reloaded = parseProject(JSON.parse(JSON.stringify(p)));
      expect(reloaded.ok).toBe(true);
      if (!reloaded.ok) continue;
      const plain = JSON.parse(JSON.stringify(p)) as Project;
      for (const id of Object.keys(plain.decisions)) expect(canonical(JSON.parse(JSON.stringify(reloaded.project.decisions[id] ?? null))), `run ${run}: the Decision on ${id}`).toEqual(canonical(plain.decisions[id]));
      expect(canonical(JSON.parse(JSON.stringify(reloaded.project))), `run ${run}`).toEqual(canonical(plain));
      // The state at the end of each run still yields colors and messages without a fault.
      expect(() => deriveTokens(p.params, 'enforce')).not.toThrow();
      expect(() => conflicts(p)).not.toThrow();
    }
    // Every kind of action really ran, many times.
    for (const name of ['pick', 'keep', 'slider', 'small variation', 'reason', 'new start', 'put back']) expect(actions[name] ?? 0, `the action "${name}" ran ${actions[name] ?? 0} times`).toBeGreaterThan(100);
  }, 60000);
});

describe('engine: behaviors that no test protected (code review of 2026-11-13, finding "engine 5")', () => {
  it('chooses an Option with an overused-look warning rarely when it composes Directions', () => {
    const warned = new Map<string, Set<string>>();
    for (const s of STEPS) for (const o of s.options) if (o.warn) warned.set(s.id, (warned.get(s.id) ?? new Set()).add(o.id));
    expect(warned.size).toBeGreaterThan(0);
    let warnedPicks = 0;
    let picks = 0;
    let warnedShare = 0;
    for (let seed = 1; seed <= 40; seed++) {
      for (const direction of generateDirections(seed, 6)) {
        for (const [stepId, ids] of warned) {
          const s = step(stepId);
          picks++;
          if (ids.has(matchingOptionId(direction.params, s) ?? '')) warnedPicks++;
          warnedShare += ids.size / s.options.length;
        }
      }
    }
    // By even chance the warned Options would be picked `warnedShare` times; they are picked well under half as often.
    expect(picks).toBeGreaterThan(200);
    expect(warnedPicks).toBeLessThan(warnedShare * 0.5);
  });

  it('gives generated Directions of different batches different names in the record', () => {
    const ids = new Set<string>();
    for (const seed of [1, 2, 3, 20261113, 20261114]) for (const direction of generateDirections(seed, 6)) ids.add(direction.id);
    expect(ids.size).toBe(5 * 6);
  });

  it('measures the distance between two colors around the wheel, not along a line', () => {
    const at = (accentHue: number): DesignParams => ({ ...DEFAULT_PARAMS, accentHue });
    expect(designDistance(at(350), at(10))).toBeCloseTo(designDistance(at(100), at(120)), 10);
    expect(designDistance(at(350), at(10))).toBeLessThan(designDistance(at(350), at(60)));
  });

  it('offers the slider for a second color, and variations of it, only while the page has a second color (finding U3-06)', () => {
    const strategy = step('color-strategy');
    const oneColor: DesignParams = { ...DEFAULT_PARAMS, colorStrategy: 'single-accent' };
    const twoColors: DesignParams = { ...DEFAULT_PARAMS, colorStrategy: 'duo' };
    expect(activeTunables(strategy, oneColor).map((t) => t.key)).not.toContain('accent2Hue');
    expect(activeTunables(strategy, twoColors).map((t) => t.key)).toContain('accent2Hue');
    expect(closerOptions({ ...fresh(), params: oneColor }, 'color-strategy').filter((o) => 'accent2Hue' in o.values)).toEqual([]);
    expect(closerOptions({ ...fresh(), params: twoColors }, 'color-strategy').some((o) => 'accent2Hue' in o.values)).toBe(true);
  });

  it('never offers more than six small variations', () => {
    for (const direction of DIRECTIONS) {
      const start = applyDirection(fresh(), direction.id);
      for (const s of STEPS) for (const round of [0, 1, 2]) expect(closerOptions(start, s.id, round).length, `${direction.id}, ${s.id}`).toBeLessThanOrEqual(6);
    }
    // The Step with the most sliders reaches the limit, so the limit is a real cut and not an accident of small numbers.
    expect(Math.max(...STEPS.map((s) => closerOptions(fresh(), s.id).length))).toBe(6);
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

  it('never offers a generated Direction whose own choices pull against each other, over 60 seeds (decision D23)', () => {
    for (let s = 1; s <= 60; s++) for (const d of generateDirections(s, 6)) expect(conflicts({ ...fresh(), params: d.params }), `seed ${s}: ${d.name}`).toEqual([]);
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
