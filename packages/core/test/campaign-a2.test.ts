// Red-team campaign A2 (2026-11-16): the core's repairs. Each test follows the judge's reproduction of one finding
// (redteam/campaign-a2/findings.md); decision D71 records the owner's deferral and the builder's rulings.
import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS, SAMPLE_CONTENT, STEPS, applyDirection, createProject, parseProject, plainName, readOwnDirections, setContentText, skinParams,
  skinsOf, tune, visibleText, writeVision, type Project,
} from '../src/index.js';

const fileOf = (project: Project): unknown => JSON.parse(JSON.stringify(project));
const opened = (file: unknown): { project: Project; notes: string[] } => {
  const read = parseProject(file);
  if (!read.ok) throw new Error(read.error);
  return read;
};
const aurora = DIRECTIONS.find((d) => d.id === 'midnight-aurora')!;

describe('Campaign A2: the Vision tells the truth about where the design came from (J-9 to J-11, J-21)', () => {
  it('says when the start that a file records differs from the Direction it names, and never that every value comes from the start (J-9, cases C1 and C2)', () => {
    // C2: the file names Midnight Aurora but records the plain start's values as its start. A project saved under an older Catalog
    // may hold another start for good reason, so the file's own start stays, and VISION.md says that the two differ.
    const plain = createProject('x');
    const c2 = opened(fileOf({ ...applyDirection(createProject('C2'), aurora), base: { ...plain.base }, params: { ...plain.params } }));
    expect(c2.project.base).toEqual(plain.base);
    expect(writeVision(c2.project)['VISION.md']).toMatch(/Start: the Direction “Midnight Aurora”[^\n]*\n- The start values that the project records differ from that Direction/);
    // C1: the file changes values but records no Decision. No sentence may say that every value comes from the start.
    const started = applyDirection(createProject('C1'), aurora);
    const c1 = opened(fileOf({ ...started, params: { ...started.params, hero: 'statement', sections: 'bento', nav: 'side-rail' } }));
    const text = writeVision(c1.project)['VISION.md'];
    expect(text).not.toContain('every value below comes from the start');
    expect(text).not.toMatch(/Decision: none\. The value of the start stands: “Very large headline”/);
    expect(text).toMatch(/Decision: none recorded, yet the value is not the start’s: “Very large headline”/);
  });

  it('never calls a kept value “as the start gave it” when the start gave another (J-9, case C3)', () => {
    const started = applyDirection(createProject('C3'), aurora);
    const file = fileOf({ ...started, params: { ...started.params, hero: 'statement' }, decisions: { hero: { stepId: 'hero', optionId: 'statement', kind: 'kept', rejected: [], values: { hero: 'statement' }, at: '2026-11-16T10:00:00.000Z' } } });
    const text = writeVision(opened(file).project)['VISION.md'];
    expect(text).not.toMatch(/kept as the start gave it: “Very large headline”/);
    expect(text).toMatch(/Decision: kept, with a value that is not the start’s: “Very large headline”/);
  });

  it('says when a Skin’s colors are not the colors that the project records as its start (J-9, case C5)', () => {
    const direction = DIRECTIONS.find((d) => skinsOf(d).length > 0)!;
    const skin = skinsOf(direction)[0]!;
    // The file names the Skin but records the Direction's own colors as its start.
    const read = opened(fileOf({ ...applyDirection(createProject('C5'), direction), skin: skin.id }));
    expect(writeVision(read.project)['VISION.md']).toMatch(/in the Skin[^\n]*\n- The start values that the project records differ from that Direction/);
  });

  it('opens a project that the Studio wrote, with a Direction or a Skin, without a note and without a word about its start', () => {
    for (const direction of DIRECTIONS) {
      const skin = skinsOf(direction)[0];
      const project = skin ? applyDirection(createProject('Fine'), { ...direction, params: skinParams(direction, skin) }, skin.id) : applyDirection(createProject('Fine'), direction);
      const read = opened(fileOf(project));
      expect(read.notes, direction.id).toEqual([]);
      expect(writeVision(read.project)['VISION.md'], direction.id).not.toContain('The start values that the project records differ');
    }
    expect(opened(fileOf(createProject('Plain'))).notes).toEqual([]);
  });

  it('says that a Direction it does not know may come from a file, not only from chance (J-9, case C4)', () => {
    const read = opened(fileOf({ ...createProject('C4'), direction: 'my-friends-direction' }));
    expect(writeVision(read.project)['VISION.md']).toMatch(/or one that this version of the Studio does not have/);
  });

  it('calls a slider set exactly on an Option by that Option’s name (J-10)', () => {
    const step = STEPS.find((s) => s.id === 'radius')!;
    const tuned = tune(createProject('C6'), step.id, 'radius', 0);
    const text = writeVision(tuned)['VISION.md'];
    expect(text).not.toMatch(/2\.\d+ [^\n]*\n\n- The question:[^\n]*\n- Decision: set to a value between the Options[^\n]*\n- Studio settings: `radius: 0`/);
    expect(text).toMatch(/set with the sliders to exactly the value of “Square corners”/);
  });

  it('names the sample texts that are still in the page when only some texts are the owner’s (J-11)', () => {
    const text = writeVision(setContentText(createProject('C7'), 'phone', '555 0100'))['VISION.md'];
    expect(text).not.toContain('They are the owner’s own: use them word for word.');
    expect(text).toMatch(/still the sample dental practice’s[^\n]*the business name/);
    expect(SAMPLE_CONTENT.business).toBe(createProject('x').content.business);
  });

  it('says nothing was measured about the button pair when contrast checks are off (J-21)', () => {
    const off = { ...createProject('Off'), a11y: 'off' as const };
    expect(writeVision(off)['DESIGN.md']).not.toContain('The Studio measured this pair.');
    expect(writeVision(createProject('Warn'))['DESIGN.md']).toContain('The Studio measured this pair.');
  });
});

describe('Campaign A2: invisible signs, long names, and own Directions (J-12, J-15, J-16)', () => {
  it('removes every format sign and every sign that draws nothing, by Unicode property (J-12)', () => {
    const kept = [0x0600, 0x06dd, 0x070f, 0x0890, 0x08e2, 0xfff0, 0x110bd, 0x13430, 0x1bca0, 0x1d173].map((code) => String.fromCodePoint(code));
    for (const sign of kept) expect(visibleText(`a${sign}b`), `U+${sign.codePointAt(0)!.toString(16)}`).toBe('a b');
    // Letters, digits, punctuation, accents, and emoji stay.
    expect(visibleText('Café “Ünïcödé” 123 — ok 🦷')).toBe('Café “Ünïcödé” 123 — ok 🦷');
    const read = opened(fileOf({ ...createProject(`Name${String.fromCodePoint(0x1d173)}x`), content: { ...SAMPLE_CONTENT, headline: `Smile${String.fromCodePoint(0x13430)}s` } }));
    expect(read.project.content.headline).toBe('Smile s');
  });

  it('says when a plain start records other values than the plain start (A2-V11), and counts the items of a list one by one (A2-V12)', () => {
    const v11 = opened(fileOf({ ...createProject('V11'), base: { ...aurora.params }, params: { ...aurora.params } }));
    expect(writeVision(v11.project)['VISION.md']).toMatch(/Start: the plain start \(no Direction\)\.\n- The start values that the project records differ from the plain start/);
    expect(writeVision(createProject('Plain'))['VISION.md']).not.toContain('differ from the plain start');
    const base = createProject('V12');
    const one = { ...base, content: { ...base.content, services: base.content.services.map((item, i) => (i === 0 ? { ...item, title: 'Wills' } : item)) } };
    expect(writeVision(one)['VISION.md']).toMatch(new RegExp(`still the sample dental practice’s: [^\\n]*${String(base.content.services.length - 1)} of the ${String(base.content.services.length)} services`));
  });

  it('writes a long run of spaces in the owner’s words as one space (A2-V14)', () => {
    const project = { ...createProject('V14'), name: `Harbor${'\u3000'.repeat(150)}Street` };
    expect(writeVision(project)['VISION.md']).not.toMatch(/[\u3000]{2}/);
  });

  it('takes the invisible signs out of the project’s name when a file opens, and says so (retest finding A2-R3)', () => {
    const read = opened(fileOf(createProject(`Harbor\u200b Street${String.fromCodePoint(0xe0041)}`)));
    expect(read.project.name).toBe('Harbor  Street');
    expect(read.notes.join(' ')).toMatch(/signs that do not show/);
  });

  it('cleans a very long name in a short time, because it cuts before it cleans (J-16)', () => {
    const name = `a${'̖́'.repeat(200_000)}`;
    const started = Date.now();
    expect([...plainName(name)].length).toBeLessThanOrEqual(60);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('names a duplicate inside a file of own Directions as such, not as one that the browser holds (J-15)', () => {
    const own = { id: 'own-aaaa1111', name: 'Twice', mood: '', bestFor: '', risk: '', params: { ...createProject('x').params }, madeAt: '2026-11-16T10:00:00.000Z' };
    const read = readOwnDirections({ kind: 'refraction-own-directions', version: 1, directions: [own, { ...own, name: 'Twice again' }] }, []);
    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(read.added).toHaveLength(1);
    expect(read.notes.join(' ')).not.toMatch(/this browser already holds/);
    expect(read.notes.join(' ')).toMatch(/twice/);
  });
});
