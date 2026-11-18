// The Brief: the owner's own account of one project (CLAUDE.md, defined terms; SPEC.md section 2.7).
//
// It has two parts. The first is the page's real texts, which a project has always held under `content` and which were the
// sample dental practice until the owner changes them. The second is three short answers about the project: what is
// offered, for whom, and the one thing a visitor should do. The answers are not drawn on the page; they go into the
// Vision, as quoted data.
//
// Every function here returns a new project and leaves its input alone. A change that cannot stand (a text that would leave
// the page without a name, one item more than a list may hold) returns the very project that came in, so that the caller
// can tell "nothing changed" by comparing the two.
//
// The owner's words are cleaned, never rewritten: invisible signs and signs that change the direction of writing go, line
// breaks and runs of spaces become one space, and a text is cut at its limit by whole characters. Quotation marks and
// apostrophes stay, because they are the owner's punctuation and the Mockup draws every text as text.

import { SAMPLE_CONTENT, type SiteContent } from './templates/smallBusiness.js';
import { visibleText } from './text.js';

export const BRIEF_KEYS = ['offer', 'audience', 'job'] as const;
export type BriefKey = (typeof BRIEF_KEYS)[number];
/** The three answers. An answer that the owner did not write is absent, and a project without any answer has no `brief`. */
export type Brief = Partial<Record<BriefKey, string>>;
export const BRIEF_MAX = 300;

/** The texts of the page that stand alone (not in a list). */
export type ContentTextKey = { [K in keyof SiteContent]: SiteContent[K] extends string ? K : never }[keyof SiteContent];
/** The most characters that each text holds. The Mockup's layout was looked at up to these lengths. */
export const TEXT_LIMITS: Record<ContentTextKey, number> = {
  business: 60, tag: 80, headline: 120, headlineEmphasis: 60, lede: 300, primaryAction: 30, secondaryAction: 50, phone: 30,
  servicesTitle: 60, servicesIntro: 200, feesTitle: 60, aboutTitle: 80, aboutBody: 600, promise: 200,
  contactTitle: 60, contactBody: 300, address: 120, hours: 80, footerNote: 120,
};
/** Texts that the page cannot do without: its name, its headline, and the words on its main button. */
export const REQUIRED_TEXTS: readonly ContentTextKey[] = ['business', 'headline', 'primaryAction'];

export const LIST_LIMITS = { services: { min: 1, max: 8 }, facts: { min: 0, max: 4 }, fees: { min: 0, max: 8 } } as const;
export type ContentList = keyof typeof LIST_LIMITS;
export const ITEM_LIMITS = { services: { title: 60, body: 300 }, facts: { value: 12, label: 40 }, fees: { item: 60, price: 16 } } as const;
export type ContentItemField<L extends ContentList> = keyof (typeof ITEM_LIMITS)[L];
/** The menu keeps its links: each leads to a fixed part of the page. Only the words change. */
export const NAV_WORD_MAX = 24;

/** The texts of the page in plain words, for the sentences that say which of them are still the sample's. */
const TEXT_NAMES: Record<ContentTextKey, string> = {
  business: 'the business name', tag: 'the tag line above the headline', headline: 'the headline', headlineEmphasis: 'the emphasized words of the headline',
  lede: 'the opening paragraph', primaryAction: 'the words of the main button', secondaryAction: 'the words of the second link', phone: 'the phone number',
  servicesTitle: 'the title of the services', servicesIntro: 'the line under the title of the services', feesTitle: 'the title of the fees',
  aboutTitle: 'the title of the About part', aboutBody: 'the About paragraph', promise: 'the promise', contactTitle: 'the title of the contact part',
  contactBody: 'the contact paragraph', address: 'the address', hours: 'the opening hours', footerNote: 'the note in the footer',
};
const LIST_NAMES = { services: 'the services', facts: 'the facts', fees: 'the fees' } as const;

/**
 * Which texts and lists of the page still equal the sample's, word for word, in plain words and in a fixed order, and how many
 * there are in all (finding U7-01). A page that holds some of the owner's texts and some of the sample's must say so.
 */
export function sampleTextsLeft(content: SiteContent): { names: string[]; total: number } {
  const keys = Object.keys(TEXT_LIMITS) as ContentTextKey[];
  const names = keys.filter((key) => content[key] === SAMPLE_CONTENT[key]).map((key) => TEXT_NAMES[key]);
  // A list is counted item by item: with one of three services changed, the other two are still the sample's (campaign A2,
  // finding A2-V12; joined into this function on 2026-11-16, decision D72).
  // An item is the sample's when it equals a sample item that no other item has matched, wherever it stands: a removed or moved item
  // leaves the others the sample's (found at the join, 2026-11-16). A list whose items are all the sample's keeps its plain name.
  const items = (mine: readonly unknown[], sample: readonly unknown[], whole: string, noun: string): void => {
    const left = sample.map((item) => JSON.stringify(item));
    let kept = 0;
    for (const item of mine) {
      const at = left.indexOf(JSON.stringify(item));
      if (at < 0) continue;
      left.splice(at, 1);
      kept++;
    }
    if (kept === 0) return;
    names.push(kept === mine.length ? whole : `${String(kept)} of the ${String(mine.length)} ${noun}`);
  };
  for (const list of ['services', 'facts', 'fees'] as const) items(content[list], SAMPLE_CONTENT[list], LIST_NAMES[list], LIST_NAMES[list].replace(/^the /, ''));
  items(content.nav, SAMPLE_CONTENT.nav, 'the menu words', 'menu words');
  return { names, total: keys.length + 4 };
}

/**
 * The texts of a loaded file, cleaned as typed text is cleaned (finding X7-05): hidden signs and signs that change the direction of
 * writing go, line breaks and runs of spaces become one space, and each text is cut at its limit by whole characters. A required
 * text that cleaning would leave empty is replaced by the sample's. `changed` counts the texts that cleaning changed.
 */
export function cleanLoaded(content: SiteContent, brief: Brief | undefined): { content: SiteContent; brief: Brief | undefined; changed: number; replaced: number } {
  let changed = 0;
  let replaced = 0;
  const tidy = (value: string, max: number, fallback = ''): string => {
    const text = oneLine(value, max);
    const result = text === '' ? fallback : text;
    if (result !== value) changed++;
    if (text === '' && fallback !== '' && value !== fallback) replaced++;
    return result;
  };
  const next: SiteContent = { ...content, nav: [...content.nav], services: content.services.map((s) => ({ ...s })), facts: content.facts.map((f) => ({ ...f })), fees: content.fees.map((f) => ({ ...f })) };
  for (const key of Object.keys(TEXT_LIMITS) as ContentTextKey[]) next[key] = tidy(content[key], TEXT_LIMITS[key], REQUIRED_TEXTS.includes(key) ? SAMPLE_CONTENT[key] : '');
  // A link without words is a link that nobody can see (`setNavWord` refuses to make one): an extra link whose words cleaning empties goes.
  next.nav = content.nav.map((word, i) => tidy(word, NAV_WORD_MAX, SAMPLE_CONTENT.nav[i] ?? '')).filter((word) => word !== '');
  next.services = content.services.map((item) => ({ title: tidy(item.title, ITEM_LIMITS.services.title), body: tidy(item.body, ITEM_LIMITS.services.body) }));
  next.facts = content.facts.map((item) => ({ value: tidy(item.value, ITEM_LIMITS.facts.value), label: tidy(item.label, ITEM_LIMITS.facts.label) }));
  next.fees = content.fees.map((item) => ({ item: tidy(item.item, ITEM_LIMITS.fees.item), price: tidy(item.price, ITEM_LIMITS.fees.price) }));
  let answers: Brief | undefined;
  if (brief) {
    const out: Brief = {};
    for (const key of BRIEF_KEYS) {
      const value = brief[key];
      if (value === undefined) continue;
      const text = tidy(value, BRIEF_MAX);
      if (text !== '') out[key] = text;
    }
    answers = Object.keys(out).length > 0 ? out : undefined;
  }
  return { content: next, brief: answers, changed, replaced };
}

/** A project, as far as the Brief is concerned. */
interface Holder {
  content: SiteContent;
  brief?: Brief;
}

/** One line of the owner's words: cleaned, on one line, and cut at its limit by whole characters. */
function oneLine(text: string, max: number): string {
  return [...visibleText(text).replace(/\s+/g, ' ').trim()].slice(0, max).join('').trim();
}

/** Set one text of the page. A text that the page cannot do without is never set to nothing. */
export function setContentText<P extends Holder>(project: P, key: ContentTextKey, text: string): P {
  const value = oneLine(text, TEXT_LIMITS[key]);
  if (value === project.content[key] || (value === '' && REQUIRED_TEXTS.includes(key))) return project;
  return { ...project, content: { ...project.content, [key]: value } };
}

/** Set the words of one menu link. A link without words would be a link that nobody can see, so an empty word changes nothing. */
export function setNavWord<P extends Holder>(project: P, index: number, text: string): P {
  const value = oneLine(text, NAV_WORD_MAX);
  if (index < 0 || index >= project.content.nav.length || value === '' || value === project.content.nav[index]) return project;
  return { ...project, content: { ...project.content, nav: project.content.nav.map((word, at) => (at === index ? value : word)) } };
}

export function canAddContentItem(project: Holder, list: ContentList): boolean {
  return project.content[list].length < LIST_LIMITS[list].max;
}

export function canRemoveContentItem(project: Holder, list: ContentList): boolean {
  return project.content[list].length > LIST_LIMITS[list].min;
}

const EMPTY_ITEM = { services: { title: '', body: '' }, facts: { value: '', label: '' }, fees: { item: '', price: '' } } as const;

/** Add an empty item at the end of a list. The Mockup draws an item only once it holds words. */
export function addContentItem<P extends Holder>(project: P, list: ContentList): P {
  if (!canAddContentItem(project, list)) return project;
  return { ...project, content: { ...project.content, [list]: [...project.content[list], { ...EMPTY_ITEM[list] }] } };
}

export function removeContentItem<P extends Holder>(project: P, list: ContentList, index: number): P {
  if (!canRemoveContentItem(project, list) || index < 0 || index >= project.content[list].length) return project;
  return { ...project, content: { ...project.content, [list]: project.content[list].filter((_, at) => at !== index) } };
}

/** Set one text of one item of a list. */
export function setContentItem<P extends Holder, L extends ContentList>(project: P, list: L, index: number, field: ContentItemField<L>, text: string): P {
  const items = project.content[list] as unknown as readonly Record<string, string>[];
  const item = items[index];
  const max = (ITEM_LIMITS[list] as Record<string, number>)[field as string];
  if (!item || max === undefined) return project;
  const value = oneLine(text, max);
  if (value === item[field as string]) return project;
  return { ...project, content: { ...project.content, [list]: items.map((each, at) => (at === index ? { ...each, [field]: value } : each)) } };
}

/** Put the sample texts back. The three answers stay: they are the owner's account of the project, not sample text. */
export function restoreSampleContent<P extends Holder>(project: P): P {
  return { ...project, content: JSON.parse(JSON.stringify(SAMPLE_CONTENT)) as SiteContent };
}

/** Set one of the three answers. An empty answer is taken out, and a project with no answer has no `brief` at all. */
export function setBriefAnswer<P extends Holder>(project: P, key: BriefKey, text: string): P {
  const value = oneLine(text, BRIEF_MAX);
  if (value === (project.brief?.[key] ?? '')) return project;
  const answers: Brief = {};
  for (const each of BRIEF_KEYS) {
    const answer = each === key ? value : project.brief?.[each];
    if (answer) answers[each] = answer;
  }
  const { brief: _old, ...rest } = project;
  return (Object.keys(answers).length > 0 ? { ...rest, brief: answers } : rest) as P;
}

/** True when the words to mark in the headline are part of the headline, or when there are none to mark. */
export function emphasisIsInHeadline(content: SiteContent): boolean {
  return content.headlineEmphasis === '' || content.headline.includes(content.headlineEmphasis);
}
