// Four repairs after the seventh review (SPEC.md section 2.16): which texts are still the sample's, a project file cleaned like typed
// text, and a DESIGN.md that claims no measurement that did not happen.
import { describe, expect, it } from 'vitest';
import {
  ITEM_LIMITS, SAMPLE_CONTENT, TEXT_LIMITS, applyDirection, createProject, designMd, parseProject, prescriptionMd, sampleTextsLeft, setBriefAnswer,
  setContentItem, setContentText, setNavWord, type ContentTextKey, type Project,
} from '../src/index.js';

const own = (project: Project): Project => {
  let p = project;
  for (const key of Object.keys(TEXT_LIMITS) as ContentTextKey[]) p = setContentText(p, key, `Own ${key}`);
  for (const list of ['services', 'facts', 'fees'] as const) p.content[list].forEach((_, i) => { for (const field of Object.keys(ITEM_LIMITS[list])) p = setContentItem(p, list, i, field as never, `Own ${list} ${field} ${String(i)}`); });
  p.content.nav.forEach((_, i) => { p = setNavWord(p, i, `Own link ${String(i)}`); });
  return p;
};

describe('sampleTextsLeft', () => {
  it('names every text and list while the project holds the sample, and totals 23', () => {
    const { names, total } = sampleTextsLeft(createProject('x').content);
    expect(total).toBe(23);
    expect(names).toHaveLength(23);
    expect(new Set(names).size).toBe(23);
    expect(names[0]).toBe('the business name');
  });

  it('leaves out a text that the owner changed, and a list that the owner changed, in the page’s order', () => {
    let p = createProject('x');
    p = setContentText(p, 'business', 'Northside Bakery');
    p = setContentItem(p, 'facts', 0, 'value', '7 days');
    p = setNavWord(p, 0, 'Bread');
    const { names } = sampleTextsLeft(p.content);
    expect(names).toHaveLength(20);
    expect(names).not.toContain('the business name');
    expect(names).not.toContain('the facts');
    expect(names).not.toContain('the menu words');
    expect(names).toContain('the services');
  });

  it('names nothing when every text is the owner’s', () => {
    expect(sampleTextsLeft(own(createProject('x')).content).names).toEqual([]);
  });
});

describe('PRESCRIPTION.md: the line about the texts', () => {
  it('says that the sample is the sample, as before, when no text is the owner’s', () => {
    expect(prescriptionMd(createProject('x'))).toContain('`mockup.html` shows a sample dental practice, not the owner’s content.');
  });

  it('names the placeholders, and does not call every text the owner’s own, when some are the sample’s', () => {
    const md = prescriptionMd(setContentText(createProject('x'), 'business', 'Northside Bakery'));
    // The Prescription names the texts that are still the sample's, one by one (campaign A2, finding J-11), and never the text that the owner changed.
    expect(md).toContain('shows the texts that the project holds. Some are still the sample dental practice’s: ');
    expect(md).toContain('the headline');
    expect(md).not.toMatch(/still the sample dental practice’s: [^\n]*the business name/);
    expect(md).toContain('Replace those with the owner’s real content; use the others word for word.');
    expect(md).not.toContain('They are the owner’s own: use them word for word.');
  });

  it('keeps the line word for word when every text is the owner’s', () => {
    const md = prescriptionMd(own(createProject('x')));
    expect(md).toContain('They are the owner’s own: use them word for word.');
    expect(md).not.toContain('still the sample dental practice’s words');
  });
});

describe('loading a project file cleans the texts as typing does', () => {
  const tag = [...'hidden'].map((c) => String.fromCodePoint(0xe0000 + c.charCodeAt(0))).join('');
  const file = (edit: (content: Record<string, unknown>) => void, brief?: Record<string, string>): unknown => {
    const p = JSON.parse(JSON.stringify(createProject('File'))) as Record<string, unknown> & { content: Record<string, unknown> };
    edit(p.content);
    if (brief) p['brief'] = brief;
    return p;
  };

  it('removes hidden signs and direction signs, makes line breaks one space, and cuts at the limits', () => {
    const result = parseProject(file((c) => {
      c['business'] = `Acme${tag}‮ evil\n\nSecond line`;
      c['headline'] = 'h'.repeat(590);
      (c['facts'] as { value: string }[])[0]!.value = '1,234,567,890,123 km';
      (c['nav'] as string[])[0] = 'x'.repeat(100);
    }, { offer: `Wills${tag}\nand estates`, audience: `${'a'.repeat(299)}\u202e` }));
    if (!result.ok) throw new Error(result.error);
    const c = result.project.content;
    expect(c.business).toBe('Acme evil Second line');
    expect(c.headline).toHaveLength(TEXT_LIMITS.headline);
    expect(c.facts[0]?.value).toHaveLength(ITEM_LIMITS.facts.value);
    expect(c.nav[0]).toHaveLength(24);
    expect(result.project.brief?.offer).toBe('Wills and estates');
    expect(result.project.brief?.audience).toBe('a'.repeat(299));
    expect(JSON.stringify(result.project)).not.toMatch(/[\u{E0000}-\u{E007F}‪-‮]/u);
    expect(result.notes.join(' ')).toMatch(/cleaned/);
  });

  it('loads a clean file with no note about texts, and keeps its texts as they are', () => {
    const result = parseProject(JSON.parse(JSON.stringify(own(createProject('Clean')))));
    if (!result.ok) throw new Error(result.error);
    expect(result.notes.join(' ')).not.toMatch(/cleaned/);
    expect(result.project.content.business).toBe('Own business');
  });

  it('puts the sample’s text back where cleaning would leave a required text empty', () => {
    const result = parseProject(file((c) => { c['business'] = `${tag}‮`; c['headline'] = '   '; }));
    if (!result.ok) throw new Error(result.error);
    expect(result.project.content.business).toBe(SAMPLE_CONTENT.business);
    expect(result.project.content.headline).toBe(SAMPLE_CONTENT.headline);
    // The note says that the sample's words stand in the place of the owner's, not only that the Studio cleaned a text.
    expect(result.notes.join(' ')).toContain('2 texts in the file held nothing that a person can see. The sample’s words stand in their place.');
  });

  it('drops an extra menu link whose words cleaning empties, so that no link has no words', () => {
    const result = parseProject(file((c) => { (c['nav'] as string[]).push(`${tag}‮`); }));
    if (!result.ok) throw new Error(result.error);
    expect(result.project.content.nav).toEqual(SAMPLE_CONTENT.nav);
    expect(result.project.content.nav.every((word) => word !== '')).toBe(true);
  });
});

describe('DESIGN.md: the sentence about the button pair', () => {
  const withSetting = (a11y: 'off' | 'advise' | 'enforce'): Project => ({ ...applyDirection(createProject('x'), 'paper-and-ink'), a11y });
  it('says that no program measured the pair when contrast checks are Off', () => {
    const md = designMd(withSetting('off'));
    expect(md).not.toContain('The Studio measured this pair.');
    expect(md).toContain('Contrast checks are Off for this project, so no program measured this pair.');
  });
  it('keeps the sentence word for word with "Warn me" and with "Fix for me"', () => {
    for (const a11y of ['advise', 'enforce'] as const) {
      expect(designMd(withSetting(a11y))).toContain('The Studio measured this pair.');
      expect(designMd(withSetting(a11y))).not.toContain('Contrast checks are Off');
    }
  });
});

describe('the Brief’s answers keep their own cleaning', () => {
  it('still cleans a typed answer', () => {
    expect(setBriefAnswer(createProject('x'), 'offer', 'a‮b').brief?.offer).toBe('a b');
  });
});
