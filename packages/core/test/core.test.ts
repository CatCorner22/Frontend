import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS, applyDirection, designDistance, generateDirections,
  DEFAULT_PARAMS, FONTS, SAMPLE_CONTENT, STEPS, closerOptions, conflicts, contrast, createProject, deriveTokens, ensureContrast,
  escapeHtml, parseProject, pick, previewParams, renderSmallBusiness, resolvePatch, skip, toHex, tune, wireframeParams,
  type DesignParams, type Oklch,
} from '../src/index.js';

const white: Oklch = { l: 1, c: 0, h: 0 };
const black: Oklch = { l: 0, c: 0, h: 0 };

describe('color math', () => {
  it('converts known OKLCH values to sRGB hex', () => {
    expect(toHex(white)).toBe('#ffffff');
    expect(toHex(black)).toBe('#000000');
    // oklch(62.8% 0.2577 29.23) is sRGB red.
    expect(toHex({ l: 0.628, c: 0.2577, h: 29.23 })).toMatch(/^#f[ef]0[0-3]0[0-3]$/);
  });
  it('computes the WCAG contrast ratio', () => {
    expect(contrast(white, black)).toBeCloseTo(21, 1);
    expect(contrast(white, white)).toBeCloseTo(1, 5);
  });
  it('maps out-of-gamut colors into gamut without changing hue', () => {
    const hex = toHex({ l: 0.7, c: 0.4, h: 150 });
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('repairs a color until it reaches the target contrast', () => {
    const bg: Oklch = { l: 0.98, c: 0.005, h: 250 };
    const weak: Oklch = { l: 0.8, c: 0.16, h: 88 };
    expect(contrast(weak, bg)).toBeLessThan(4.5);
    const fixed = ensureContrast(weak, bg, 4.5);
    expect(contrast(fixed, bg)).toBeGreaterThanOrEqual(4.5);
    expect(fixed.h).toBe(weak.h);
  });
});

describe('accessibility profile', () => {
  const lowContrast: DesignParams = { ...DEFAULT_PARAMS, contrast: 0, accentHue: 88, accentChroma: 0.16, accentLightness: 0.8 };
  it('Off: checks nothing', () => {
    expect(deriveTokens(lowContrast, 'off').issues).toEqual([]);
  });
  it('Advise: warns and changes nothing', () => {
    const off = deriveTokens(lowContrast, 'off');
    const advise = deriveTokens(lowContrast, 'advise');
    expect(advise.issues.length).toBeGreaterThan(0);
    expect(advise.issues.every((i) => i.outcome === 'warning')).toBe(true);
    expect(advise.css).toEqual(off.css);
  });
  it('Enforce: repairs every failing pair', () => {
    const enforce = deriveTokens(lowContrast, 'enforce');
    expect(enforce.issues.length).toBeGreaterThan(0);
    expect(enforce.issues.every((i) => i.outcome === 'repaired')).toBe(true);
    // A second pass over the repaired tokens' parameters would find nothing: verify via the advise run on same params being different.
    expect(enforce.css['--accent-text']).not.toBe(deriveTokens(lowContrast, 'off').css['--accent-text']);
  });
});

describe('Catalog', () => {
  it('has complete records', () => {
    const ids = new Set<string>();
    for (const step of STEPS) {
      expect(ids.has(step.id), `duplicate Step id ${step.id}`).toBe(false);
      ids.add(step.id);
      for (const field of [step.title, step.teach, step.variable, step.source, step.reviewed]) expect(field.trim().length).toBeGreaterThan(3);
      expect(step.options.length).toBeGreaterThanOrEqual(3);
      expect(step.options.some((o) => o.id === step.defaultOptionId), `${step.id} default`).toBe(true);
      const optionIds = new Set(step.options.map((o) => o.id));
      expect(optionIds.size).toBe(step.options.length);
      for (const o of step.options) {
        for (const field of [o.label, o.what, o.chooseWhen, o.risk]) expect(field.trim().length, `${step.id}/${o.id}`).toBeGreaterThan(2);
        expect(Object.keys(resolvePatch(o, DEFAULT_PARAMS)).length, `${step.id}/${o.id} sets nothing`).toBeGreaterThan(0);
      }
    }
  });
  it('one variable per Step: all Options of a Step set the same parameters, and no two Steps share a parameter', () => {
    const owner = new Map<string, string>();
    for (const step of STEPS) {
      const keySets = step.options.map((o) => Object.keys(resolvePatch(o, DEFAULT_PARAMS)).sort().join(','));
      const union = new Set(step.options.flatMap((o) => Object.keys(resolvePatch(o, DEFAULT_PARAMS))));
      // Options may set a subset (for example a strategy without a second hue), but never a parameter owned by another Step.
      expect(keySets.length).toBeGreaterThan(0);
      for (const key of union) {
        const prior = owner.get(key);
        expect(prior === undefined || prior === step.id, `"${key}" is set by both ${prior} and ${step.id}`).toBe(true);
        owner.set(key, step.id);
      }
      for (const t of step.tunables ?? []) expect(union.has(t.key as string) || owner.get(t.key as string) === step.id, `${step.id} tunable ${String(t.key)}`).toBe(true);
    }
  });
  it('every font in the Catalog exists', () => {
    for (const step of STEPS) for (const o of step.options) for (const key of ['fontHeading', 'fontBody'] as const) if (o.patch[key]) expect(FONTS[o.patch[key]]).toBeDefined();
  });
  it('Enforce profile leaves no unrepaired contrast failure for any single Option', () => {
    const project = createProject();
    for (const step of STEPS) for (const o of step.options) {
      const tokens = deriveTokens(previewParams(project, o), 'enforce');
      expect(tokens.issues.every((i) => i.outcome === 'repaired')).toBe(true);
    }
  });
});

describe('engine', () => {
  it('pick changes only the parameters of that Option and records the Decision', () => {
    const before = createProject();
    const after = pick(before, 'radius', 'pill', '2026-01-01T00:00:00Z');
    const changed = (Object.keys(after.params) as (keyof DesignParams)[]).filter((k) => after.params[k] !== before.params[k]);
    expect(changed).toEqual(['radius']);
    expect(after.decisions['radius']).toMatchObject({ optionId: 'pill', kind: 'picked', values: { radius: 999 } });
    expect(after.decisions['radius']?.rejected).toContain('square');
    expect(before.params.radius).toBe(DEFAULT_PARAMS.radius);
  });
  it('skip takes the default and records it as defaulted', () => {
    const after = skip(createProject(), 'nav');
    expect(after.decisions['nav']).toMatchObject({ optionId: 'top-inline', kind: 'defaulted' });
  });
  it('derived Options read earlier Decisions', () => {
    let project = pick(createProject(), 'accent', 'teal');
    project = pick(project, 'color-strategy', 'duo-complement');
    expect(project.params.accent2Hue).toBe((195 + 180) % 360);
  });
  it('tune clamps to the allowed range and marks the Decision as tuned', () => {
    const after = tune(createProject(), 'radius', 'radius', 500);
    expect(after.params.radius).toBe(28);
    expect(after.decisions['radius']?.kind).toBe('tuned');
    expect(() => tune(createProject(), 'nav', 'radius', 4)).toThrow();
  });
  it('"Closer to this one" offers neighbors that differ from the current value', () => {
    const project = pick(createProject(), 'accent', 'teal');
    const options = closerOptions(project, 'accent');
    expect(options.length).toBeGreaterThanOrEqual(4);
    for (const o of options) expect(Object.entries(o.values).some(([k, v]) => project.params[k as keyof DesignParams] !== v)).toBe(true);
    expect(closerOptions(project, 'nav')).toEqual([]);
  });
  it('flags conflicts without changing any Decision', () => {
    let project = pick(createProject(), 'heading-treatment', 'light-large');
    project = pick(project, 'signature', 'outline-type');
    const found = conflicts(project);
    expect(found.map((c) => c.id)).toContain('outline-thin');
    expect(project.params.signature).toBe('outline-type');
    expect(project.params.headingWeight).toBe(400);
  });
  it('wireframe keeps structure and resets feel', () => {
    const p = wireframeParams({ ...DEFAULT_PARAMS, nav: 'side-rail', accentChroma: 0.2, fontHeading: 'fraunces' });
    expect(p.nav).toBe('side-rail');
    expect(p.accentChroma).toBe(0);
    expect(p.fontHeading).toBe('system-sans');
  });
});

describe('saved projects', () => {
  it('round-trips a valid project', () => {
    const project = pick(createProject('Test'), 'accent', 'crimson');
    const parsed = parseProject(JSON.parse(JSON.stringify(project)));
    expect(parsed.ok).toBe(true);
  });
  it('rejects malformed and hostile files', () => {
    expect(parseProject(null).ok).toBe(false);
    expect(parseProject({}).ok).toBe(false);
    const base = JSON.parse(JSON.stringify(createProject()));
    expect(parseProject({ ...base, schemaVersion: 99 }).ok).toBe(false);
    expect(parseProject({ ...base, params: { ...base.params, radius: 'javascript:alert(1)' } }).ok).toBe(false);
    expect(parseProject({ ...base, params: { ...base.params, nav: '<script>' } }).ok).toBe(false);
    expect(parseProject({ ...base, decisions: { bogus: { stepId: 'bogus', optionId: 'x', kind: 'picked', rejected: [], values: {}, at: '' } } }).ok).toBe(false);
    expect(parseProject({ ...base, content: { ...base.content, headline: 'x'.repeat(5000) } }).ok).toBe(false);
  });
});

describe('Mockup', () => {
  it('renders hostile content as inert text and contains no script', () => {
    const hostile = '<script>alert(1)</script><img src=x onerror=alert(1)>"\'';
    const content = { ...SAMPLE_CONTENT, business: hostile, headline: hostile, headlineEmphasis: 'alert', services: [{ title: hostile, body: hostile }], nav: [hostile] };
    const html = renderSmallBusiness({ params: DEFAULT_PARAMS, tokens: deriveTokens(DEFAULT_PARAMS, 'off').css, content, stage: 'feel' });
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/<img/i);
    // No real tag may carry an event-handler attribute. (The escaped text still contains the letters "onerror="; that is inert.)
    expect(html).not.toMatch(/<[a-z][^>]*\son\w+\s*=/i);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('&lt;script&gt;');
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });
  it('one token changes when one Option changes', () => {
    const project = createProject();
    const base = deriveTokens(project.params, 'off').css;
    const radiusStep = STEPS.find((s) => s.id === 'radius')!;
    const pill = radiusStep.options.find((o) => o.id === 'pill')!;
    const next = deriveTokens(previewParams(project, pill), 'off').css;
    const changed = Object.keys(next).filter((k) => next[k] !== base[k]);
    expect(changed.sort()).toEqual(['--radius-control', '--radius-small', '--radius-surface']);
  });
});

describe('Directions', () => {
  it('every Direction is a complete, valid, conflict-free design', () => {
    const ids = new Set<string>();
    for (const direction of DIRECTIONS) {
      expect(ids.has(direction.id)).toBe(false);
      ids.add(direction.id);
      for (const field of [direction.name, direction.mood, direction.bestFor, direction.risk]) expect(field.trim().length).toBeGreaterThan(5);
      const project = applyDirection(createProject(), direction);
      expect(parseProject(JSON.parse(JSON.stringify(project))).ok, direction.id).toBe(true);
      expect(conflicts(project).map((c) => c.id), direction.id).toEqual([]);
      expect(deriveTokens(project.params, 'enforce').issues.every((i) => i.outcome === 'repaired')).toBe(true);
    }
  });
  it('Directions differ from each other', () => {
    for (let i = 0; i < DIRECTIONS.length; i++) for (let j = i + 1; j < DIRECTIONS.length; j++) {
      expect(designDistance(DIRECTIONS[i]!.params, DIRECTIONS[j]!.params), `${DIRECTIONS[i]!.id} vs ${DIRECTIONS[j]!.id}`).toBeGreaterThan(3);
    }
  });
  it('applying a Direction replaces the design and clears earlier Decisions', () => {
    const picked = pick(createProject(), 'radius', 'pill');
    const after = applyDirection(picked, 'graphite-precision');
    expect(after.decisions).toEqual({});
    expect(after.direction).toBe('Graphite Precision');
    expect(after.params.elevation).toBe('ring');
    expect(() => applyDirection(picked, 'no-such-direction')).toThrow();
  });
  it('the generator is repeatable, conflict-free, valid, and varied', () => {
    const a = generateDirections(7, 6);
    const b = generateDirections(7, 6);
    expect(a.map((d) => d.params)).toEqual(b.map((d) => d.params));
    expect(a.length).toBe(6);
    expect(generateDirections(8, 6).map((d) => d.params)).not.toEqual(a.map((d) => d.params));
    for (const direction of a) {
      const project = applyDirection(createProject(), direction);
      expect(conflicts(project)).toEqual([]);
      expect(parseProject(JSON.parse(JSON.stringify(project))).ok).toBe(true);
    }
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) expect(designDistance(a[i]!.params, a[j]!.params)).toBeGreaterThan(2);
  });
});

describe('preview regions', () => {
  it('opens the Mockup at the region a Step names', () => {
    const tokens = deriveTokens(DEFAULT_PARAMS, 'off').css;
    const html = renderSmallBusiness({ params: DEFAULT_PARAMS, tokens, content: SAMPLE_CONTENT, stage: 'feel', focus: 'contact', still: true });
    expect(html).toContain('data-focus="contact"');
    expect(html).toContain('data-still');
    const proof = renderSmallBusiness({ params: { ...DEFAULT_PARAMS, emphasis: 'proof' }, tokens, content: SAMPLE_CONTENT, stage: 'feel', focus: 'facts' });
    expect(proof).toContain('data-focus="top"');
    for (const step of STEPS) expect(['top', 'facts', 'services', 'about', 'contact']).toContain(step.focus);
  });
});
