import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS, DIRECTIONS, OWN_NAME_MAX, OWN_TEXT_MAX,
  applyDirection, asDirection, createProject, describeDesign, isOwnDirectionId, makeOwnDirection, ownDirectionsFile, readOwnDirections,
  type DesignParams, type OwnDirection,
} from '../src/index.js';

const AT = '2026-11-15T12:00:00.000Z';
const design: DesignParams = applyDirection(createProject('Test'), 'paper-and-ink').params;
const draft = (over: Partial<Parameters<typeof makeOwnDirection>[0]> = {}): Parameters<typeof makeOwnDirection>[0] => ({
  id: 'own-abc123', name: 'Harbor evening', mood: 'Calm and dark.', bestFor: 'Small practices.', risk: 'Dark pages tire some readers.', params: design, madeAt: AT, ...over,
});
const made = (over: Partial<Parameters<typeof makeOwnDirection>[0]> = {}, taken: string[] = []): OwnDirection => {
  const result = makeOwnDirection(draft(over), taken);
  if (!result.ok) throw new Error(result.error);
  return result.direction;
};

describe('a Direction of the owner’s own: the record (SPEC.md section 2.3)', () => {
  it('holds the design’s values, a name, three texts, and a date', () => {
    expect(made()).toEqual({ id: 'own-abc123', name: 'Harbor evening', mood: 'Calm and dark.', bestFor: 'Small practices.', risk: 'Dark pages tire some readers.', params: design, madeAt: AT });
    // The record holds a copy: a later change of the project's design does not reach it.
    expect(made().params).not.toBe(design);
  });

  it('proposes the mood from the design’s values when the owner writes none', () => {
    expect(made({ mood: '   ' }).mood).toBe(describeDesign(design));
  });

  it('refuses an empty name, and a name that a built-in or own Direction already has', () => {
    expect(makeOwnDirection(draft({ name: '  ​ ' }), [])).toEqual({ ok: false, error: 'Give the Direction a name.' });
    const builtIn = DIRECTIONS[0]!.name;
    expect(makeOwnDirection(draft({ name: ` ${builtIn.toUpperCase()} ` }), [])).toEqual({ ok: false, error: `Another Direction already has the name “${builtIn.toUpperCase()}”. Choose another name.` });
    expect(makeOwnDirection(draft({ name: 'harbor EVENING' }), ['Harbor evening'])).toEqual({ ok: false, error: 'Another Direction already has the name “harbor EVENING”. Choose another name.' });
  });

  it('cleans the name and the texts like a project name, and cuts them at their limits', () => {
    const own = made({
      name: `<b>Bold</b> “quoted” ‮flipped ${'n'.repeat(80)}`,
      mood: `line one\nline two <script>alert(1)</script> ${'m'.repeat(300)}`,
    });
    expect(own.name.length).toBe(OWN_NAME_MAX);
    expect(own.name.startsWith('<b>Bold</b> ’quoted’ flipped n')).toBe(true);
    expect(own.mood.length).toBe(OWN_TEXT_MAX);
    expect(own.mood.startsWith('line one line two <script>alert(1)</script> m')).toBe(true);
    expect(JSON.stringify(own)).not.toMatch(/[‮\n“”]/);
  });

  it('refuses a design value that the Studio does not know, and brings a value out of reach to the nearest one it can set', () => {
    expect(makeOwnDirection(draft({ params: { ...design, theme: 'sepia' } as unknown as DesignParams }), [])).toEqual({ ok: false, error: 'The design holds a value that this version of the Studio does not know.' });
    expect(makeOwnDirection(draft({ params: { ...design, baseSize: Number.NaN } }), []).ok).toBe(false);
    expect(made({ params: { ...design, baseSize: 30 } }).params.baseSize).toBe(22);
  });

  it('refuses a date that is no date', () => {
    for (const madeAt of ['', 'yesterday', '<img src=x onerror=alert(1)>', `2026-11-15T12:00:00.000Z${'0'.repeat(40)}`]) expect(makeOwnDirection(draft({ madeAt }), []).ok, madeAt).toBe(false);
  });

  it('refuses an identifier that is not one of an own Direction', () => {
    expect(isOwnDirectionId('own-abc123')).toBe(true);
    for (const id of ['paper-and-ink', 'generated-1-1', 'own-', 'own-ABC', 'own-abc123<', '__proto__']) expect(isOwnDirectionId(id), id).toBe(false);
    expect(makeOwnDirection(draft({ id: 'paper-and-ink' }), []).ok).toBe(false);
  });

  it('starts a project exactly like a built-in Direction, and names no source and no review', () => {
    const own = made();
    const direction = asDirection(own);
    expect(direction).toMatchObject({ id: own.id, group: null, name: own.name, mood: own.mood, bestFor: own.bestFor, risk: own.risk, sources: [], reviewed: null });
    const project = applyDirection(createProject('From my own'), direction);
    expect(project.params).toEqual(design);
    expect(project.base).toEqual(design);
    expect(project.direction).toBe(own.id);
    expect(project.decisions).toEqual({});
  });
});

describe('a Direction of the owner’s own: the file (SPEC.md section 2.3)', () => {
  const first = made();
  const second = made({ id: 'own-def456', name: 'Morning ledger', params: DEFAULT_PARAMS });

  it('writes a set as one file and reads it back unchanged', () => {
    const file = JSON.parse(JSON.stringify(ownDirectionsFile([first, second]))) as unknown;
    expect(readOwnDirections(file, [])).toEqual({ ok: true, added: [first, second], notes: ['Added 2 Directions of your own.'] });
  });

  it('adds none twice, and says so', () => {
    const file = JSON.parse(JSON.stringify(ownDirectionsFile([first, second]))) as unknown;
    expect(readOwnDirections(file, [first])).toEqual({ ok: true, added: [second], notes: ['Added 1 Direction of your own.', '1 was left out: this browser already holds it.'] });
    expect(readOwnDirections(file, [first, second])).toEqual({ ok: true, added: [], notes: ['Added none: this browser already holds every Direction in the file.'] });
  });

  it('leaves out, with the reason, an entry that cannot stand or whose name is in use; the rest is added', () => {
    const clash = { ...second, id: 'own-zzz999', name: first.name };
    const file = { ...ownDirectionsFile([first]), directions: [first, clash, { ...second, params: { ...second.params, theme: 'sepia' } }, 'nonsense', { ...second, id: 'own-ghi789', name: 'Third', extra: '<script>' }] };
    const result = readOwnDirections(JSON.parse(JSON.stringify(file)), []);
    if (!result.ok) throw new Error(result.error);
    expect(result.added.map((d) => d.name)).toEqual([first.name, 'Third']);
    expect(result.added[1]).not.toHaveProperty('extra');
    expect(result.notes).toEqual(['Added 2 Directions of your own.', '1 was left out: another Direction already has its name.', '2 were left out: the Studio could not read them.']);
  });

  it('swaps a replaced typeface, as a project file does', () => {
    const old = { ...ownDirectionsFile([first]), directions: [{ ...first, params: { ...first.params, fontHeading: 'playfair-display', fontBody: 'source-serif-4' } }] };
    const result = readOwnDirections(JSON.parse(JSON.stringify(old)), []);
    expect(result.ok && result.added[0]!.params).toMatchObject({ fontHeading: 'playfair', fontBody: 'literata' });
  });

  it('refuses a file that is not a set of own Directions, with a plain sentence and no content from the file', () => {
    const NOT = { ok: false, error: 'This is not a file of your own Directions.' };
    for (const input of [null, 'text', [], {}, { kind: '<img onerror=alert(1)>', version: 1, directions: [] }, { kind: 'refraction-own-directions', version: 1, directions: 'none' }, { schemaVersion: 2, name: 'A project' }]) {
      expect(readOwnDirections(input, []), JSON.stringify(input)).toEqual(NOT);
    }
    expect(readOwnDirections({ kind: 'refraction-own-directions', version: 2, directions: [] }, [])).toEqual({ ok: false, error: 'A newer version of the Studio made this file, and this version cannot read it.' });
    expect(readOwnDirections({ kind: 'refraction-own-directions', version: 1, directions: Array.from({ length: 501 }, () => first) }, [])).toEqual(NOT);
  });
});
