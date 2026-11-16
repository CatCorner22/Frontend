// The words beside the Undo button and in the notice after it (SPEC.md section 2.14, point 3; finding U6-23). Every branch of `undoWords`
// has a test, because the browser tests reach only a few of them (the seventh review's test auditor planted eight faults here; none was caught).
import { OVERLAYS, STEPS, applyDirection, createProject, pick, setBriefAnswer, setContentText, setOverlay, tune, type Project } from '@refraction/core';
import { describe, expect, it } from 'vitest';
import { undoWords } from '../src/undo';

const NOW = '2026-11-16T09:00:00.000Z';
const name = (id: string): string => STEPS.find((st) => st.id === id)?.name ?? id;
const base = (): Project => createProject('Words');
const words = (now: Project, previous: Project, start = 'the plain start') => undoWords(now, previous, start);

describe('undoWords: Steps', () => {
  it('names one Step: before the press and after it', () => {
    const before = base();
    const after = pick(before, 'nav', 'side-rail', NOW);
    const w = words(after, before);
    expect(w.preview).toBe(`Undo takes back: the Step “${name('nav')}” goes back to how it was.`);
    expect(w.done).toBe(`Undone: the Step “${name('nav')}” is back to how it was.`);
    expect(w.whole).toBe(false);
    expect(w.steps.map((st) => st.id)).toEqual(['nav']);
  });

  it('names two Steps and three Steps, in the order of the Steps, joined with "and"', () => {
    const before = base();
    const two = pick(pick(before, 'nav', 'side-rail', NOW), 'hero', 'statement', NOW);
    expect(words(two, before).preview).toBe(`Undo takes back: the Steps “${name('nav')}” and “${name('hero')}” go back to how they were.`);
    expect(words(two, before).done).toBe(`Undone: the Steps “${name('nav')}” and “${name('hero')}” are back to how they were.`);
    const three = pick(two, 'density', 'compact', NOW);
    expect(words(three, before).preview).toBe(`Undo takes back: the Steps “${name('nav')}” and “${name('hero')}” and “${name('density')}” go back to how they were.`);
    expect(words(three, before).whole).toBe(false);
  });

  it('calls a change of four Steps the whole project', () => {
    const before = base();
    const four = pick(pick(pick(pick(before, 'nav', 'side-rail', NOW), 'hero', 'statement', NOW), 'density', 'compact', NOW), 'typeface', 'friendly', NOW);
    const w = words(four, before, 'the plain start');
    expect(w.whole).toBe(true);
    expect(w.preview).toBe('Undo takes back: the whole project goes back to the earlier one, which started from the plain start.');
    expect(w.done).toBe('Undone: your earlier project is back, the one that started from the plain start.');
  });

  it('names the Step of a change that only a slider made', () => {
    const step = STEPS.find((st) => (st.tunables?.length ?? 0) > 0);
    const t = step?.tunables?.[0];
    if (!step || !t) throw new Error('no Step with a slider');
    const before = base();
    const after = tune(before, step.id, t.key, (before.params[t.key] as number) === t.max ? t.min : t.max, NOW);
    expect(after.params[t.key]).not.toBe(before.params[t.key]);
    expect(words(after, before).preview).toBe(`Undo takes back: the Step “${step.name}” goes back to how it was.`);
    expect(words(after, before).steps.map((st) => st.id)).toEqual([step.id]);
  });

  it('calls a change of the starting Direction the whole project, with at most three Steps touched, and names the earlier start', () => {
    const before = base();
    const after = applyDirection(before, 'paper-and-ink');
    const w = words(after, before, 'Soft Daylight');
    expect(w.whole).toBe(true);
    expect(w.preview).toBe('Undo takes back: the whole project goes back to the earlier one, which started from Soft Daylight.');
    expect(w.done).toBe('Undone: your earlier project is back, the one that started from Soft Daylight.');
  });
});

describe('undoWords: changes that touch no Step', () => {
  it('names the project’s name as it stood, cleaned of quotation marks', () => {
    const before = { ...base(), name: 'He said "hi" ‮ again' };
    const after = { ...before, name: 'Something else' };
    const w = words(after, before);
    expect(w.preview).toBe('Undo takes back: the project’s name goes back to “He said ’hi’ again”.');
    expect(w.done).toBe('Undone: the project’s name is “He said ’hi’ again” again.');
    expect(w.steps).toEqual([]);
  });

  it('names the Contrast checks setting', () => {
    const before = { ...base(), a11y: 'advise' as const };
    const after = { ...before, a11y: 'off' as const };
    const w = words(after, before);
    expect(w.preview).toBe('Undo takes back: the Contrast checks setting goes back to how it was.');
    expect(w.done).toBe('Undone: the Contrast checks setting is back to how it was.');
  });

  it('names the Overlays', () => {
    const before = base();
    const after = setOverlay(before, OVERLAYS[0]?.id ?? '', true);
    const w = words(after, before);
    expect(w.preview).toBe('Undo takes back: the Overlays go back to how they were.');
    expect(w.done).toBe('Undone: the Overlays are back to how they were.');
  });

  it('names the texts of the page, and the three answers', () => {
    const before = base();
    const texts = setContentText(before, 'business', 'Northside Legal Clinic');
    expect(words(texts, before).preview).toBe('Undo takes back: the texts of the page go back to how they were.');
    expect(words(texts, before).done).toBe('Undone: the texts of the page are back to how they were.');
    const answers = setBriefAnswer(before, 'offer', 'Wills and estates');
    expect(words(answers, before).preview).toBe('Undo takes back: your three answers about the project go back to how they were.');
    expect(words(answers, before).done).toBe('Undone: your three answers about the project are back to how they were.');
  });

  it('falls back to the whole project only when nothing that it knows differs', () => {
    const same = base();
    const w = words({ ...same }, same, 'Clinical Calm');
    expect(w.whole).toBe(true);
    expect(w.preview).toContain('which started from Clinical Calm.');
  });
});
