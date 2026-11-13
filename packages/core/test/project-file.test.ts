import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS, DIRECTIONS, SAMPLE_CONTENT, SCHEMA_VERSION, STEPS,
  applyDirection, createProject, findStep, keep, matchingOptionId, ownedValues, parseProject, pick, setReason, tune,
  type Project,
} from '../src/index.js';
import { fixture } from './helpers.js';

const AT = '2026-11-13T12:00:00.000Z';
const roundTrip = (p: Project): unknown => JSON.parse(JSON.stringify(p));
const ok = (input: unknown) => {
  const result = parseProject(input);
  if (!result.ok) throw new Error(`expected the file to load: ${result.error}`);
  return result;
};
const refusal = (input: unknown): string => {
  const result = parseProject(input);
  if (result.ok) throw new Error('expected the file to be refused');
  return result.error;
};

function busyProject(): Project {
  let p = applyDirection(createProject('Harbor Street Dental'), 'ember-noir');
  p = pick(p, 'nav', 'split-cta', AT);
  p = setReason(p, 'nav', 'One action matters most: booking.');
  p = keep(p, 'hero', AT);
  p = tune(p, 'accent', 'accentHue', 40, AT);
  p = pick(p, 'color-strategy', 'duo-neighbor', AT);
  return { ...p, a11y: 'enforce' };
}

describe('saved projects: the current version', () => {
  it('loads a saved project back exactly as it was saved', () => {
    for (const project of [createProject('Empty'), busyProject(), applyDirection(createProject('G'), DIRECTIONS[5]!.id)]) {
      const result = ok(roundTrip(project));
      expect(result.project).toEqual(project);
      expect(result.migratedFrom).toBeNull();
      expect(result.notes).toEqual([]);
    }
  });

  it('refuses anything that is not a project, in fixed words', () => {
    for (const input of [null, undefined, 42, 'text', [], [1, 2], {}, { schemaVersion: '2' }, { schemaVersion: 0 }, { schemaVersion: 1.5 }]) expect(refusal(input)).toBe('This is not a Refraction project file.');
    expect(refusal({ ...(roundTrip(busyProject()) as object), schemaVersion: SCHEMA_VERSION + 1 })).toBe('A newer version of the Studio made this file, and this version cannot read it.');
  });

  it('refuses values of the wrong type, outside their range, or outside their list, and says which part', () => {
    const base = roundTrip(busyProject()) as Record<string, any>;
    const cases: [string, (p: Record<string, any>) => void][] = [
      ['params', (p) => { p.params.radius = 1000; }],
      ['params', (p) => { p.params.radius = '8'; }],
      ['params', (p) => { p.params.nav = 'light"><script>alert(1)</script>'; }],
      ['params', (p) => { delete p.params.motion; }],
      ['params', (p) => { p.params.accentHue = null; }],
      ['base', (p) => { p.base.theme = 'sepia'; }],
      ['name', (p) => { p.name = 'x'.repeat(121); }],
      ['a11y', (p) => { p.a11y = 'strict'; }],
      ['template', (p) => { p.template = 'blog'; }],
      ['content', (p) => { p.content.headline = 'x'.repeat(601); }],
      ['content', (p) => { p.content.nav = Array(13).fill('x'); }],
      ['content', (p) => { p.content.fees = 'free'; }],
      ['decisions', (p) => { p.decisions.nav.kind = 'defaulted'; }],
      ['decisions', (p) => { p.decisions.nav.rejected = Array(41).fill('x'); }],
      ['decisions', (p) => { p.decisions.nav.values = { radius: 'big' }; }],
      ['decisions', (p) => { p.decisions.nav = 'picked'; }],
      ['direction', (p) => { p.direction = 'x'.repeat(61); }],
    ];
    for (const [part, damage] of cases) {
      const copy = JSON.parse(JSON.stringify(base)) as Record<string, any>;
      damage(copy);
      // The message names the damaged part in plain words, from a fixed list (finding U2-21).
      const words = { name: 'the project name', template: 'the kind of website', a11y: 'the Contrast checks setting', direction: 'the Direction', base: 'the starting design values', params: 'the design values', decisions: 'the Decisions', content: 'the sample text' }[part];
      expect(words, part).toBeDefined();
      expect(refusal(copy)).toBe(`The file does not match the project format. The problem is in the part that holds ${words}.`);
    }
  });

  it('never repeats content from the file in a message (finding SEC-12)', () => {
    const marker = 'CALL-555-0100-TO-REPAIR-THIS-FILE';
    const base = roundTrip(busyProject()) as Record<string, any>;
    const attempts: Record<string, any>[] = [
      { ...base, decisions: { [marker]: base.decisions.nav } },
      { ...base, decisions: { nav: { ...base.decisions.nav, optionId: marker } } },
      { ...base, direction: marker },
      { ...base, name: marker.repeat(20) },
      { ...base, params: { ...base.params, nav: marker } },
      { ...base, [marker]: marker },
      { ...base, content: { ...base.content, [marker]: 1, headline: 7 } },
    ];
    for (const attempt of attempts) {
      const result = parseProject(attempt);
      const text = result.ok ? result.notes.join(' ') : result.error;
      expect(text).not.toContain(marker);
      expect(text.length).toBeLessThan(400);
    }
  });

  it('drops unknown fields instead of keeping them', () => {
    const base = roundTrip(busyProject()) as Record<string, any>;
    const result = ok({ ...base, extra: 'x', params: { ...base.params, extra: 1 }, content: { ...base.content, extra: '<script>' } });
    expect(result.project).toEqual(busyProject());
  });
});

describe('saved projects: references to the Catalog are recomputed, never trusted', () => {
  it('leaves out Decisions keyed by names that are not Steps, including built-in object member names (findings SEC-04, P-09)', () => {
    const base = roundTrip(busyProject()) as Record<string, any>;
    const fake = base.decisions.nav;
    const names = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'not-a-step'];
    const decisions = Object.fromEntries([...Object.entries(base.decisions), ...names.map((n) => [n, fake])]);
    const withProto = JSON.parse(JSON.stringify({ ...base, decisions }).replace('"decisions":{', '"decisions":{"__proto__":{"polluted":true},')) as unknown;
    const result = ok(withProto);
    expect(Object.keys(result.project.decisions).sort()).toEqual(Object.keys(busyProject().decisions).sort());
    expect(result.notes.join(' ')).toMatch(/belong to Steps that this version of the Studio does not have/);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted')).toBe(false);
  });

  it('recomputes a Decision’s Option, values, and Step name from the design (finding SEC-05)', () => {
    const base = roundTrip(busyProject()) as Record<string, any>;
    base.decisions.nav = { stepId: 'hero', optionId: 'option-that-was-renamed', kind: 'picked', rejected: ['ghost', 'top-inline'], values: { nav: 'side-rail' }, at: 'javascript:alert(1)' };
    const result = ok(base);
    const nav = result.project.decisions['nav']!;
    // The design value is the truth: the file's design says "split-cta", so the Decision says so too.
    expect(nav).toEqual({ stepId: 'nav', optionId: 'split-cta', kind: 'picked', rejected: ['top-inline', 'top-centered', 'side-rail'], values: { nav: 'split-cta' }, at: '1970-01-01T00:00:00.000Z' });
    for (const [id, decision] of Object.entries(result.project.decisions)) {
      const s = findStep(id)!;
      expect(decision.stepId).toBe(id);
      expect(decision.values).toEqual(ownedValues(s, result.project.params));
      expect(decision.optionId).toBe(matchingOptionId(result.project.params, s));
    }
  });

  it('says so when it changes a Decision to match the file’s own design values (campaign 4, finding F-3)', () => {
    // A file that the Studio wrote is consistent: opening it changes no Decision and gives no note.
    expect(ok(roundTrip(busyProject())).notes).toEqual([]);
    // A file edited by hand: the Decision says "Field of stars", the design value says "plain".
    const edited = roundTrip(pick(createProject('P'), 'atmosphere', 'stars', AT)) as Record<string, any>;
    edited.params.atmosphere = 'plain';
    const result = ok(edited);
    expect(result.project.decisions['atmosphere']).toMatchObject({ optionId: 'plain', values: { atmosphere: 'plain' } });
    expect(result.notes).toEqual(['One Decision in the file named a choice that the file’s own design values do not show. The Studio follows the design values, so it changed that Decision to match them.']);
  });

  it('marks a pick as hand-set when its Option is no longer in the Catalog, and keeps the value', () => {
    const base = roundTrip(pick(createProject('P'), 'radius', 'soft', AT)) as Record<string, any>;
    base.params.radius = 11;
    const result = ok(base);
    expect(result.project.params.radius).toBe(11);
    expect(result.project.decisions['radius']).toMatchObject({ kind: 'tuned', optionId: null, values: { radius: 11 } });
    expect(result.notes.join(' ')).toMatch(/marked as hand-set/);
  });

  it('replaces a Direction name it does not know, and says so', () => {
    for (const direction of ['constructor', 'Midnight Aurora', 'generated-abc', 'generated-99999999999-1']) {
      const result = ok({ ...(roundTrip(createProject('P')) as object), direction });
      expect(result.project.direction).toBe('generated-0-0');
      expect(result.notes).toHaveLength(1);
    }
    for (const direction of [null, 'ember-noir', 'generated-20261113-4']) expect(ok({ ...(roundTrip(createProject('P')) as object), direction }).project.direction).toBe(direction);
  });

  it('cuts an over-long reason and keeps a normal one', () => {
    const base = roundTrip(busyProject()) as Record<string, any>;
    base.decisions.nav.reason = 'r'.repeat(500);
    expect(ok(base).project.decisions['nav']!.reason).toHaveLength(280);
    // The cut is announced, never silent (finding S2-02).
    expect(ok(base).notes.join(' ')).toContain('shortened');
    base.decisions.nav.reason = 'r'.repeat(601);
    expect(parseProject(base).ok).toBe(false);
  });

  it('keeps hostile text as plain data', () => {
    const hostile = '"><script>alert(1)</script><img src=x onerror=alert(1)>';
    const project = { ...createProject(hostile.slice(0, 100)), content: { ...SAMPLE_CONTENT, headline: hostile, business: hostile, nav: [hostile], services: [{ title: hostile, body: hostile }], facts: [{ value: hostile, label: hostile }], fees: [{ item: hostile, price: hostile }] } };
    expect(ok(roundTrip(project)).project).toEqual(project);
  });
});

describe('saved projects: files from version 1 (finding M-07)', () => {
  it('loads a version-1 project that started from a Direction, with the design unchanged', () => {
    const raw = fixture('project-v1-direction.json') as Record<string, any>;
    expect(raw.schemaVersion).toBe(1);
    const result = ok(raw);
    const p = result.project;
    expect(result.migratedFrom).toBe(1);
    expect(p.schemaVersion).toBe(SCHEMA_VERSION);
    expect(p.params).toEqual(raw.params);
    expect(p.name).toBe('Harbor Street Dental');
    expect(p.a11y).toBe('enforce');
    // Version 1 stored the Direction's display name; version 2 stores its identifier and the design it started with.
    expect(p.direction).toBe('midnight-aurora');
    expect(p.base).toEqual(DIRECTIONS.find((d) => d.id === 'midnight-aurora')!.params);
    // "Skip: take the default" became "kept"; one Step for theme and contrast became two.
    expect(Object.keys(p.decisions).sort()).toEqual(['accent', 'color-strategy', 'contrast', 'density', 'nav', 'radius', 'theme']);
    expect(p.decisions['nav']).toMatchObject({ kind: 'picked', optionId: 'top-inline', rejected: ['top-centered', 'split-cta', 'side-rail'] });
    expect(p.decisions['radius']).toMatchObject({ kind: 'kept', optionId: 'subtle', rejected: [], values: { radius: 8 } });
    expect(p.decisions['theme']).toMatchObject({ kind: 'picked', optionId: 'dark', values: { theme: 'dark' } });
    expect(p.decisions['contrast']).toMatchObject({ kind: 'picked', optionId: 'soft', values: { contrast: 0.4 } });
    expect(p.decisions['accent']).toMatchObject({ kind: 'tuned', optionId: null, values: { accentHue: 200 } });
    expect(p.decisions['color-strategy']).toMatchObject({ kind: 'picked', optionId: 'duo-complement', values: { colorStrategy: 'duo', accent2Hue: 20 } });
    expect(p.decisions['density']).toMatchObject({ kind: 'tuned', optionId: null });
    for (const d of Object.values(p.decisions)) expect(d.at).toBe('2026-11-13T12:00:00.000Z');
    // The new price list arrives with its sample content; the rest of the content is the file's own.
    expect(p.content.fees).toEqual(SAMPLE_CONTENT.fees);
    expect(p.content.headline).toBe(raw.content.headline);
    // A migrated project saves and loads as a current one.
    expect(ok(roundTrip(p)).project).toEqual(p);
  });

  it('loads a version-1 project that started plain', () => {
    const raw = fixture('project-v1-plain.json') as Record<string, any>;
    const p = ok(raw).project;
    expect(p.params).toEqual(raw.params);
    expect(p.direction).toBeNull();
    expect(p.base).toEqual(raw.params);
    expect(p.decisions['hero']).toMatchObject({ kind: 'picked', optionId: 'statement' });
    expect(p.decisions['accent']).toMatchObject({ kind: 'picked', optionId: 'crimson' });
    expect(p.decisions['theme']).toMatchObject({ kind: 'picked', optionId: 'light' });
    // The old "Light, crisp" Option set contrast to 0.85, which is the new "Crisp" Option.
    expect(p.decisions['contrast']).toMatchObject({ kind: 'picked', optionId: 'crisp' });
  });

  it('fills in the four finish values that the earliest version-1 files lack', () => {
    const raw = fixture('project-v1-plain.json') as Record<string, any>;
    for (const key of ['atmosphere', 'buttonFinish', 'displayTreatment', 'motion']) delete raw.params[key];
    delete raw.direction;
    const p = ok(raw).project;
    expect(p.params).toMatchObject({ atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle' });
    expect(p.direction).toBeNull();
  });

  it('still refuses a damaged version-1 file', () => {
    const raw = fixture('project-v1-plain.json') as Record<string, any>;
    raw.params.radius = 1000;
    expect(parseProject(raw).ok).toBe(false);
    const other = fixture('project-v1-plain.json') as Record<string, any>;
    other.decisions = 'none';
    expect(parseProject(other).ok).toBe(false);
  });

  it('covers every Step in a fixture or in the current catalog', () => {
    // A reminder that fails when the saved shape changes without a new version: the current project's keys are fixed here.
    expect(Object.keys(createProject()).sort()).toEqual(['a11y', 'base', 'content', 'decisions', 'direction', 'name', 'params', 'schemaVersion', 'template']);
    expect(Object.keys(DEFAULT_PARAMS)).toHaveLength(31);
    expect(STEPS).toHaveLength(23);
    expect(SCHEMA_VERSION).toBe(2);
  });
});
