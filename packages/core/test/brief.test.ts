import { describe, expect, it } from 'vitest';
import {
  BRIEF_MAX, DIRECTIONS, ITEM_LIMITS, LIST_LIMITS, SAMPLE_CONTENT, TEXT_LIMITS,
  addContentItem, applyDirection, canAddContentItem, canRemoveContentItem, createProject, deriveTokens, emphasisIsInHeadline, isSampleContent, parseProject,
  removeContentItem, renderSmallBusiness, restoreSampleContent, setBriefAnswer, setContentItem, setContentText, setNavWord,
  type Project,
} from '../src/index.js';

const start = (): Project => applyDirection(createProject('Harbor Street Dental'), 'paper-and-ink');
const page = (project: Project): string => renderSmallBusiness({ params: project.params, tokens: deriveTokens(project.params, project.a11y).css, content: project.content, focus: 'top', still: true, links: 'inert', fontFaceCss: '' });
/** An element of the page's body that holds nothing: the sign of a text that was taken out while its box stayed. */
const EMPTY_ELEMENT = /<(p|span|a|dt|dd|dl|h1|h2|h3|ol|ul|li|figure|table|tbody|strong|address)\b[^>]*>\s*<\/\1>/;

describe('The Brief, first slice: the owner’s own words (SPEC.md section 2.7)', () => {
  it('sets a text of the page, cleaned like any text that the Studio keeps, and cut at that text’s limit', () => {
    const named = setContentText(start(), 'business', '  Northside   Legal\nClinic  ');
    expect(named.content.business).toBe('Northside Legal Clinic');
    // The project is a new one; the old one is unchanged.
    expect(start().content.business).toBe(SAMPLE_CONTENT.business);
    // Quotation marks and apostrophes are the owner's own punctuation and stay; invisible signs go.
    expect(setContentText(start(), 'lede', 'Dr. O’Neil\'s “plain talk” practice‮.​').content.lede).toBe('Dr. O’Neil\'s “plain talk” practice .');
    for (const key of Object.keys(TEXT_LIMITS) as (keyof typeof TEXT_LIMITS)[]) {
      const long = setContentText(start(), key, 'x'.repeat(2000)).content[key];
      expect(long, key).toHaveLength(TEXT_LIMITS[key]);
      expect(TEXT_LIMITS[key], key).toBeLessThanOrEqual(600);
    }
    // A cut never leaves half a character.
    expect(setContentText(start(), 'phone', `${'1'.repeat(TEXT_LIMITS.phone - 1)}\u{1F600}\u{1F600}`).content.phone).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);
  });

  it('never leaves the page without a name or a headline: an empty one changes nothing', () => {
    const project = start();
    expect(setContentText(project, 'business', '   ')).toBe(project);
    expect(setContentText(project, 'headline', '')).toBe(project);
    // The main button needs words too: the page draws it in three places.
    expect(setContentText(project, 'primaryAction', ' ')).toBe(project);
    // Every other text may be empty.
    expect(setContentText(project, 'tag', '').content.tag).toBe('');
  });

  it('adds and removes a service, a fact, and a price within the limits, and changes nothing beyond them', () => {
    expect(LIST_LIMITS).toEqual({ services: { min: 1, max: 8 }, facts: { min: 0, max: 4 }, fees: { min: 0, max: 8 } });
    for (const list of ['services', 'facts', 'fees'] as const) {
      let project = start();
      while (canAddContentItem(project, list)) project = addContentItem(project, list);
      expect(project.content[list], list).toHaveLength(LIST_LIMITS[list].max);
      expect(addContentItem(project, list), list).toBe(project);
      while (canRemoveContentItem(project, list)) project = removeContentItem(project, list, 0);
      expect(project.content[list], list).toHaveLength(LIST_LIMITS[list].min);
      expect(removeContentItem(project, list, 0), list).toBe(project);
      // An index that the list does not have changes nothing.
      expect(removeContentItem(start(), list, 99), list).toEqual(start());
    }
    // A new item is empty until the owner types into it, and its words are cleaned and cut like any text.
    const added = addContentItem(start(), 'services');
    expect(added.content.services.at(-1)).toEqual({ title: '', body: '' });
    const typed = setContentItem(added, 'services', added.content.services.length - 1, 'title', '  Wills\nand   estates ');
    expect(typed.content.services.at(-1)!.title).toBe('Wills and estates');
    expect(setContentItem(start(), 'fees', 0, 'price', '9'.repeat(100)).content.fees[0]!.price).toHaveLength(ITEM_LIMITS.fees.price);
    expect(setContentItem(start(), 'facts', 99, 'value', 'x')).toEqual(start());
  });

  it('keeps the menu at its five links and changes their words only', () => {
    const project = setNavWord(start(), 1, '  How it\nworks ');
    expect(project.content.nav).toEqual(['Services', 'How it works', 'Fees', 'About', 'Contact']);
    expect(setNavWord(start(), 7, 'More')).toEqual(start());
    // A link without a word would be a link that nobody can see: an empty word changes nothing.
    expect(setNavWord(start(), 0, '  ')).toEqual(start());
  });

  it('lets a project from before this slice keep a list that is longer than the limit, and add nothing to it', () => {
    const many: Project = { ...start(), content: { ...start().content, services: Array.from({ length: 12 }, (_, n) => ({ title: `Service ${n}`, body: 'Text.' })) } };
    expect(parseProject(JSON.parse(JSON.stringify(many))).ok).toBe(true);
    expect(canAddContentItem(many, 'services')).toBe(false);
    expect(addContentItem(many, 'services')).toBe(many);
    expect(removeContentItem(many, 'services', 0).content.services).toHaveLength(11);
  });

  it('puts the sample texts back, and knows the sample from the owner’s own', () => {
    const own = setBriefAnswer(setContentText(start(), 'headline', 'Wills without the fog.'), 'offer', 'Wills and estates');
    expect(isSampleContent(own.content)).toBe(false);
    const back = restoreSampleContent(own);
    expect(isSampleContent(back.content)).toBe(true);
    // The three answers are the owner's account of the project, not sample text: they stay.
    expect(back.brief).toEqual({ offer: 'Wills and estates' });
  });

  it('holds the three answers with the project, cleaned and cut, and holds nothing where the owner wrote nothing', () => {
    let project = start();
    expect(project.brief).toBeUndefined();
    project = setBriefAnswer(project, 'offer', '  Family dentistry\nfor a small town ');
    project = setBriefAnswer(project, 'audience', 'a'.repeat(1000));
    expect(project.brief).toEqual({ offer: 'Family dentistry for a small town', audience: 'a'.repeat(BRIEF_MAX) });
    project = setBriefAnswer(setBriefAnswer(project, 'offer', ''), 'audience', '   ');
    // With every answer empty the project is what it was before the first answer: it holds no such part.
    expect('brief' in project).toBe(false);
    expect(project).toEqual(start());
  });

  it('writes the texts and the answers into the project file and reads them back unchanged', () => {
    let project = setBriefAnswer(setBriefAnswer(start(), 'offer', 'Wills and estates'), 'job', 'Book a first talk');
    project = setContentText(addContentItem(project, 'facts'), 'headline', 'Wills without the fog.');
    const read = parseProject(JSON.parse(JSON.stringify(project)));
    if (!read.ok) throw new Error(read.error);
    expect(read.project).toEqual(project);
    expect(read.notes).toEqual([]);
    // A file from before this slice has no answers and opens without any.
    const before = parseProject(JSON.parse(JSON.stringify(start())));
    expect(before.ok && 'brief' in before.project).toBe(false);
    // An answer that no version of the Studio could have written is refused, in fixed words.
    const forged = { ...JSON.parse(JSON.stringify(project)), brief: { offer: 'x'.repeat(BRIEF_MAX + 1) } };
    const refused = parseProject(forged);
    expect(refused.ok).toBe(false);
    expect(!refused.ok && refused.error).toContain('the three answers about the project');
    expect(parseProject({ ...JSON.parse(JSON.stringify(project)), brief: { other: 'x' } }).ok).toBe(false);
  });

  it('draws the owner’s texts as text, and leaves no empty box where a text or a list is empty', () => {
    const attack = '<script>alert(1)</script><img src=x onerror=alert(2)>';
    let project = setContentText(setContentText(start(), 'business', attack), 'headline', `${attack} & “more”`);
    const hostile = page(project);
    expect(hostile).not.toMatch(/<script|<img/i);
    expect(hostile).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    // Every optional text empty, every list at its fewest, and an added item that is still empty.
    for (const key of Object.keys(TEXT_LIMITS) as (keyof typeof TEXT_LIMITS)[]) project = setContentText(project, key, '');
    for (const list of ['services', 'facts', 'fees'] as const) while (canRemoveContentItem(project, list)) project = removeContentItem(project, list, 0);
    project = addContentItem(project, 'services');
    const bare = page(project).split('<body')[1]!;
    expect(bare).not.toMatch(EMPTY_ELEMENT);
    expect(bare).not.toContain('class="fees"');
    expect(bare).not.toContain('class="facts"');
    expect(bare).not.toContain('fact-list');
    expect(bare).not.toContain('class="tag"');
    expect(bare).not.toContain('class="lede"');
    // The item that is still empty is not drawn; the one with words is.
    expect(bare.match(/<li class="service">/g)).toHaveLength(1);
    // The sample page itself has no empty box either, on every built-in Direction.
    for (const d of DIRECTIONS) expect(page(applyDirection(createProject('x'), d.id)).split('<body')[1]!, d.id).not.toMatch(EMPTY_ELEMENT);
  });

  it('draws every list at its most, and marks the headline’s words only where the headline holds them', () => {
    let project = start();
    for (const list of ['services', 'facts', 'fees'] as const) {
      while (canAddContentItem(project, list)) project = addContentItem(project, list);
      project.content[list].forEach((_, index) => {
        project = list === 'services' ? setContentItem(setContentItem(project, list, index, 'title', `Service ${index}`), list, index, 'body', 'Words about it.')
          : list === 'facts' ? setContentItem(setContentItem(project, list, index, 'value', `${index}`), list, index, 'label', 'things')
            : setContentItem(setContentItem(project, list, index, 'item', `Item ${index}`), list, index, 'price', `$${index}0`);
      });
    }
    const full = page(project);
    expect(full.match(/<li class="service">/g)).toHaveLength(8);
    expect(full.match(/<tr><th scope="row">/g)).toHaveLength(8);
    // The facts are drawn twice: in the first screen and in their own band.
    expect(full.match(/<div><dt>/g)).toHaveLength(8);
    expect(emphasisIsInHeadline(start().content)).toBe(true);
    const moved = setContentText(start(), 'headlineEmphasis', 'not in it');
    expect(emphasisIsInHeadline(moved.content)).toBe(false);
    expect(page(moved)).not.toContain('<mark>');
    expect(emphasisIsInHeadline(setContentText(start(), 'headlineEmphasis', '').content)).toBe(true);
  });
});
