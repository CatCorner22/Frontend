import { describe, expect, it } from 'vitest';
import {
  CONFLICT_RULES, CONFLICT_TESTS, DEFAULT_PARAMS, DIRECTIONS, EVIDENCE_GRADES, FONTS, HARMONY_FIXES, HARMONY_RULES, NOT_CHECKED, PAIRS, PARAM_KEYS, RULES, SOURCE_BASES, STEPS,
  assertKnownParams, closerOptions, conflicts, createProject, describeDesign, designDistance, findDirection, findStep, generateDirections, harmonize, resolvePatch,
  tradeWordsOutsideBrackets, vaguePhrasesIn,
  type DesignParams, type SourceRef,
} from '../src/index.js';
import { allStrings, repoFileExists } from './helpers.js';

const isDate = (s: unknown): boolean => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;

function checkSource(source: SourceRef, where: string): void {
  expect(source.text.trim().length, `${where}: source text`).toBeGreaterThanOrEqual(20);
  expect(SOURCE_BASES, `${where}: basis`).toContain(source.basis);
  if (source.basis === 'builder') expect(source.record, `${where}: a builder's judgment has no record`).toBeUndefined();
  else {
    expect(source.record, `${where}: a "${source.basis}" source must name the record of the reading`).toBeTruthy();
    expect(repoFileExists(source.record!), `${where}: record ${source.record} does not exist`).toBe(true);
  }
}

describe('Catalog: Steps and Options (hard rule 5)', () => {
  it('has 23 Steps with unique identifiers, and each lookup finds only real Steps', () => {
    expect(STEPS).toHaveLength(23);
    expect(new Set(STEPS.map((s) => s.id)).size).toBe(STEPS.length);
    for (const s of STEPS) expect(findStep(s.id)).toBe(s);
    for (const name of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__', 'isPrototypeOf', '__defineGetter__', 'not-a-step', '']) expect(findStep(name), name).toBeUndefined();
  });

  it('gives every Step plain text, sources that say how they are known, an evidence grade, and a real review date', () => {
    for (const step of STEPS) {
      for (const text of [step.name, step.title, step.teach, step.variable]) expect(text.trim().length, step.id).toBeGreaterThan(3);
      expect(step.teach.length, `${step.id}: teaching text`).toBeGreaterThan(80);
      expect(step.sources.length, `${step.id}: sources`).toBeGreaterThanOrEqual(1);
      step.sources.forEach((source, i) => checkSource(source, `${step.id} source ${i + 1}`));
      expect(EVIDENCE_GRADES, step.id).toContain(step.evidence);
      expect(isDate(step.reviewed), `${step.id}: review date "${step.reviewed}"`).toBe(true);
    }
  });

  it('grades a Step "measured" only when a source was read in full', () => {
    for (const step of STEPS.filter((s) => s.evidence === 'measured')) expect(step.sources.some((s) => s.basis === 'read'), step.id).toBe(true);
  });

  it('gives every Option complete plain text, and a default Option that exists', () => {
    for (const step of STEPS) {
      expect(step.options.length, step.id).toBeGreaterThanOrEqual(2);
      expect(new Set(step.options.map((o) => o.id)).size, step.id).toBe(step.options.length);
      expect(step.options.some((o) => o.id === step.defaultOptionId), `${step.id}: default Option`).toBe(true);
      for (const option of step.options) {
        for (const text of [option.label, option.what, option.chooseWhen, option.risk]) expect(text.trim().length, `${step.id}/${option.id}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('supports every exemplar with a record, and every warning with a source and a replacement', () => {
    let exemplars = 0;
    let warnings = 0;
    for (const step of STEPS) {
      for (const option of step.options) {
        if (option.exemplar) {
          exemplars++;
          expect(option.exemplar.text.trim().length, `${step.id}/${option.id}`).toBeGreaterThan(3);
          expect(repoFileExists(option.exemplar.record), `${step.id}/${option.id}: record ${option.exemplar.record}`).toBe(true);
        }
        if (option.warn) {
          warnings++;
          checkSource(option.warn.source, `${step.id}/${option.id} warning`);
          // A warning never forbids; it names at least one other Option of the same Step as a replacement.
          const others = step.options.filter((o) => o.id !== option.id).map((o) => o.label);
          const named = others.some((label) => option.warn!.text.includes(`“${label}”`));
          expect(named, `${step.id}/${option.id}: the warning names no replacement`).toBe(true);
        }
      }
    }
    expect(exemplars).toBeGreaterThan(20);
    expect(warnings).toBe(6);
  });

  it('makes no ranking claim and names no company whose pages nobody read', () => {
    // Findings C-03 and C-04: the research records hold no count that ranks AI-default signs, and nobody read the pages of these companies.
    const unread = /\b(Linear|Stripe|Apple|Airbnb|Gumroad|Notion|Superhuman|Shopify)\b/;
    const ranking = /\b(the most common|the most recognizable|single most|the classic AI|the most refined)\b/i;
    const texts = [...allStrings(STEPS), ...allStrings(DIRECTIONS.map(({ params: _params, ...rest }) => rest)), ...allStrings(RULES)];
    for (const text of texts) {
      expect(ranking.test(text), `ranking claim in: ${text}`).toBe(false);
      // A source line may name such a company only to say that it was seen as a snippet.
      if (unread.test(text)) expect(/snippet|not the book|search/i.test(text), `unsupported name in: ${text}`).toBe(true);
    }
    for (const step of STEPS) for (const option of step.options) if (option.exemplar) expect(unread.test(option.exemplar.text), `${step.id}/${option.id}`).toBe(false);
  });
});

describe('Catalog: plain words, and one name for one thing (decision D38, finding U2-03)', () => {
  /** Names are not descriptions: the name of a font or of a Direction may hold a trade word ("Public Sans", "Cobalt Wash"). */
  const properNames = [...Object.values(FONTS).map((font) => font.label), ...DIRECTIONS.map((d) => d.name)];

  /** Every text that the Studio shows as explanation: Catalog text, and the sentences that the engine writes. Source lines are checked separately. */
  function shownTexts(): { where: string; text: string }[] {
    const out: { where: string; text: string }[] = [];
    const add = (where: string, ...texts: (string | undefined)[]): void => {
      for (const text of texts) if (text) out.push({ where, text });
    };
    for (const step of STEPS) {
      add(step.id, step.name, step.title, step.teach, step.variable, step.thumb?.note);
      for (const tunable of step.tunables ?? []) add(`${step.id}, slider`, tunable.label, ...(tunable.directions ?? []));
      for (const option of step.options) add(`${step.id}/${option.id}`, option.label, option.what, option.chooseWhen, option.risk, option.exemplar?.text, option.warn?.text);
      for (const variation of closerOptions(createProject(), step.id)) add(`${step.id}, small variation`, variation.label);
    }
    for (const d of DIRECTIONS) add(d.id, d.mood, d.bestFor, d.risk, describeDesign(d.params));
    for (const d of generateDirections(20261113, 6)) add('a generated Direction', d.name, d.mood);
    for (const rule of RULES) add(rule.id, rule.text);
    for (const font of Object.values(FONTS)) add(`font ${font.id}`, font.character);
    add('the plain start', describeDesign(DEFAULT_PARAMS));
    for (const pair of PAIRS) add(`contrast pair ${pair.id}`, pair.pair);
    for (const line of NOT_CHECKED) add('what the contrast checks do not cover', line);
    return out;
  }

  it('uses a trade word only inside round brackets, as a word to learn', () => {
    const texts = shownTexts();
    expect(texts.length).toBeGreaterThan(600);
    for (const { where, text } of texts) expect(tradeWordsOutsideBrackets(text, properNames), `${where}: ${text}`).toEqual([]);
  });

  it('never points at something the reader cannot see, and gives no thing a second name, source lines included', () => {
    const everything = [...allStrings(STEPS), ...allStrings(DIRECTIONS.map(({ params: _params, ...rest }) => rest)), ...allStrings(RULES), ...Object.values(FONTS).map((font) => font.character)];
    for (const text of everything) expect(vaguePhrasesIn(text), text).toEqual([]);
  });

  it('quotes only current names in warnings and in messages about Decisions, and uses no retired name', () => {
    const current = new Set<string>([...STEPS.map((s) => s.name), ...STEPS.flatMap((s) => s.options.map((o) => o.label)), ...STEPS.flatMap((s) => (s.tunables ?? []).map((t) => t.label))]);
    const quoted = (text: string): string[] => [...text.matchAll(/“([^”]+)”/g)].map((m) => m[1]!);
    const messages: { where: string; text: string }[] = [
      ...STEPS.flatMap((s) => s.options.filter((o) => o.warn).map((o) => ({ where: `${s.id}/${o.id}, warning`, text: o.warn!.text }))),
      ...RULES.map((rule) => ({ where: `rule ${rule.id}`, text: rule.text })),
    ];
    let names = 0;
    for (const { where, text } of messages) {
      // A name in straight quotation marks would escape the check below, so none may be used here.
      expect(text.includes('"'), `${where}: straight quotation marks in: ${text}`).toBe(false);
      for (const name of quoted(text)) {
        expect(current.has(name), `${where}: “${name}” is not the name of a Step, an Option, or a slider`).toBe(true);
        names++;
      }
    }
    expect(names).toBeGreaterThan(40);
    // Names that the literal-names pass retired. Only distinctive ones are listed: a retired name that is also an ordinary word
    // ("Soft", "Flat") cannot be banned outright, and the quotation-mark check above covers it.
    const retired = [
      'Ring and whisper', 'Ink sheen', 'Horizon wash', 'Side rail', 'Centered masthead', 'Cards in a grid', 'Rows with rules', 'Tonal with highlight', 'Neutral modern',
      'Warm editorial', 'Cool slate', 'Warm sand', 'Rose clay', 'Ink blue', 'Deep teal', 'Friendly geometric', 'Light and elegant', 'Medium and calm', 'Tight and heavy',
      'Small and even', 'Large and readable', 'Spaced capitals', 'Soft layered shadow', 'Hard offset shadow', 'Marker highlight', 'Tilted tag', 'Two colors, opposite',
      'Two colors, a third apart', 'One accent', 'All serif', 'statement opening', 'the spotlight', 'color-block strategy', 'tonal surfaces', 'gloss finish',
    ];
    const everything = [...allStrings(STEPS), ...allStrings(DIRECTIONS.map(({ params: _params, ...rest }) => rest)), ...allStrings(RULES), ...PAIRS.map((pair) => pair.pair), ...NOT_CHECKED];
    for (const text of everything) for (const old of [...retired, 'side rail']) expect(text.toLowerCase().includes(old.toLowerCase()), `the retired name "${old}" in: ${text}`).toBe(false);
  });
});

describe('Catalog: one variable per Step', () => {
  it('assigns every design parameter to exactly one Step', () => {
    const owner = new Map<string, string>();
    for (const step of STEPS) {
      expect(step.owns.length, step.id).toBeGreaterThan(0);
      for (const key of step.owns) {
        expect(owner.has(key), `${key} is owned by ${owner.get(key)} and ${step.id}`).toBe(false);
        owner.set(key, step.id);
      }
    }
    expect([...owner.keys()].sort()).toEqual([...PARAM_KEYS].sort());
    expect(Object.keys(DEFAULT_PARAMS).sort()).toEqual([...PARAM_KEYS].sort());
  });

  it('lets an Option set only the parameters its Step owns, and makes the Options of a Step set the same ones', () => {
    // One recorded exception: on "Use of color" only the three two-color Options set the second hue.
    const mayDiffer = new Set(['color-strategy']);
    for (const step of STEPS) {
      const sets = step.options.map((option) => Object.keys(resolvePatch(option, DEFAULT_PARAMS)).sort());
      for (const [i, keys] of sets.entries()) {
        expect(keys.length, `${step.id}/${step.options[i]!.id} sets nothing`).toBeGreaterThan(0);
        for (const key of keys) expect(step.owns as string[], `${step.id}/${step.options[i]!.id} sets ${key}`).toContain(key);
        if (!mayDiffer.has(step.id)) expect(keys, `${step.id}/${step.options[i]!.id}`).toEqual(sets[0]);
      }
      if (!mayDiffer.has(step.id)) expect(sets[0], `${step.id} sets every parameter it owns`).toEqual([...step.owns].sort());
    }
  });

  it('gives no two Options of a Step the same values', () => {
    for (const step of STEPS) {
      const seen = new Set<string>();
      for (const option of step.options) {
        const signature = JSON.stringify(Object.entries(resolvePatch(option, DEFAULT_PARAMS)).sort());
        expect(seen.has(signature), `${step.id}/${option.id} repeats another Option`).toBe(false);
        seen.add(signature);
      }
    }
  });

  it('makes the plain start equal to the default Option of every Step', () => {
    let composed: DesignParams = { ...DEFAULT_PARAMS };
    for (const step of STEPS) composed = { ...composed, ...resolvePatch(step.options.find((o) => o.id === step.defaultOptionId)!, composed) };
    expect(composed).toEqual(DEFAULT_PARAMS);
    expect(() => assertKnownParams(DEFAULT_PARAMS)).not.toThrow();
  });

  it('keeps every adjustable value inside the range of its parameter, and every Option inside the slider', () => {
    for (const step of STEPS) {
      for (const t of step.tunables ?? []) {
        expect(step.owns, `${step.id}: slider ${String(t.key)}`).toContain(t.key);
        expect(t.min).toBeLessThan(t.max);
        expect(t.nudge).toBeGreaterThan(0);
        if (t.directions) expect(t.directions).toHaveLength(2);
      }
    }
  });
});

describe('Catalog: Directions', () => {
  it('has 14 curated Directions, each a complete, valid, conflict-free design with record fields', () => {
    expect(DIRECTIONS).toHaveLength(14);
    expect(new Set(DIRECTIONS.map((d) => d.id)).size).toBe(14);
    expect(new Set(DIRECTIONS.map((d) => d.name)).size).toBe(14);
    for (const d of DIRECTIONS) {
      expect(() => assertKnownParams(d.params), d.id).not.toThrow();
      expect(Object.keys(d.params).sort(), d.id).toEqual([...PARAM_KEYS].sort());
      for (const text of [d.name, d.mood, d.bestFor, d.risk]) expect(text.trim().length, d.id).toBeGreaterThan(8);
      d.sources.forEach((source, i) => checkSource(source, `${d.id} source ${i + 1}`));
      expect(EVIDENCE_GRADES, d.id).toContain(d.evidence);
      expect(isDate(d.reviewed), `${d.id}: review date`).toBe(true);
      expect(conflicts({ ...createProject(), params: d.params }), `${d.id} has a conflict`).toEqual([]);
      expect(findDirection(d.id)).toBe(d);
      // A curated Direction already satisfies the harmony rules that generated Directions must satisfy.
      expect(harmonize(d.params), `${d.id} breaks a harmony rule`).toEqual(d.params);
    }
    for (const name of ['constructor', 'toString', '__proto__', 'Midnight Aurora', '']) expect(findDirection(name), name).toBeUndefined();
  });

  it('keeps the curated Directions clearly different from each other', () => {
    for (const [i, a] of DIRECTIONS.entries()) for (const b of DIRECTIONS.slice(i + 1)) expect(designDistance(a.params, b.params), `${a.id} vs ${b.id}`).toBeGreaterThanOrEqual(2);
  });
});

describe('Catalog: rules about how Decisions fit together', () => {
  it('gives every rule a record and every record a rule', () => {
    expect(CONFLICT_RULES.map((r) => r.id).sort()).toEqual([...CONFLICT_TESTS.keys()].sort());
    expect(HARMONY_RULES.map((r) => r.id).sort()).toEqual([...HARMONY_FIXES.keys()].sort());
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
    for (const rule of RULES) {
      expect(rule.text.trim().length, rule.id).toBeGreaterThan(30);
      checkSource(rule.source, `rule ${rule.id}`);
      expect(EVIDENCE_GRADES, rule.id).toContain(rule.evidence);
      expect(isDate(rule.reviewed), rule.id).toBe(true);
      expect(rule.stepIds.length, rule.id).toBeGreaterThanOrEqual(2);
      for (const id of rule.stepIds) expect(findStep(id), `${rule.id}: Step ${id}`).toBeDefined();
    }
  });

  // One design that triggers each conflict rule, and only that part of the design changes from the plain start.
  const triggers: Record<string, Partial<DesignParams>> = {
    'outline-thin': { signature: 'outline-type', headingWeight: 400 },
    'marker-gray': { signature: 'marker', colorStrategy: 'quiet', accentChroma: 0.015 },
    'statement-emphasis': { hero: 'statement', emphasis: 'action' },
    'narrow-split': { contentWidth: 'narrow', hero: 'split-media' },
    'caps-dramatic': { headingCase: 'upper', scaleRatio: 1.42 },
    'outline-delicate': { signature: 'outline-type', fontHeading: 'playfair-display' },
    'sticker-finish': { elevation: 'hard-shadow', buttonFinish: 'gloss' },
    'sheen-thin': { displayTreatment: 'ink-gradient', headingWeight: 400 },
    'purple-aurora': { atmosphere: 'aurora', theme: 'dark', accentHue: 292 },
    'dark-shadow': { theme: 'dark', elevation: 'float' },
    'cream-serif': { fontHeading: 'fraunces', neutralHue: 80, neutralChroma: 0.014, theme: 'light' },
    'black-acid': { theme: 'dark', contrast: 0.9, accentChroma: 0.19, accentHue: 135 },
  };

  it('flags nothing on the plain start', () => {
    expect(conflicts(createProject())).toEqual([]);
  });

  it.each(CONFLICT_RULES.map((r) => r.id))('conflict rule "%s" fires on its trigger and names its Steps', (id) => {
    const trigger = triggers[id];
    expect(trigger, `no trigger written for ${id}`).toBeDefined();
    const project = { ...createProject(), params: { ...DEFAULT_PARAMS, ...trigger } };
    const found = conflicts(project);
    expect(found.map((c) => c.id)).toContain(id);
    const hit = found.find((c) => c.id === id)!;
    expect(hit.message).toBe(CONFLICT_RULES.find((r) => r.id === id)!.text);
    // Every parameter of the trigger belongs to one of the Steps that the rule names.
    for (const key of Object.keys(trigger!)) expect(hit.stepIds.some((stepId) => (findStep(stepId)!.owns as string[]).includes(key)), `${id}: ${key}`).toBe(true);
    // A conflict is a flag: the design is untouched.
    expect(project.params).toEqual({ ...DEFAULT_PARAMS, ...trigger });
  });

  const disharmony: Record<string, { input: Partial<DesignParams>; fixed: (p: DesignParams) => boolean }> = {
    'painted-first-screen': { input: { colorStrategy: 'color-block', atmosphere: 'aurora', displayTreatment: 'accent-gradient' }, fixed: (p) => p.atmosphere === 'plain' && p.displayTreatment === 'solid' },
    'glow-on-light': { input: { theme: 'light', buttonFinish: 'glow' }, fixed: (p) => p.buttonFinish === 'gloss' },
    'sticker-owns-buttons': { input: { elevation: 'hard-shadow', buttonFinish: 'soft', borderWeight: 1 }, fixed: (p) => p.buttonFinish === 'flat' && p.borderWeight >= 2 },
    'dark-soft-shadow': { input: { theme: 'dark', elevation: 'soft-shadow' }, fixed: (p) => p.elevation === 'tonal' },
    'thin-outline': { input: { headingWeight: 400, signature: 'outline-type' }, fixed: (p) => p.signature === 'marker' },
    'thin-sheen': { input: { headingWeight: 400, displayTreatment: 'ink-gradient' }, fixed: (p) => p.displayTreatment === 'solid' },
    'statement-headline': { input: { hero: 'statement', emphasis: 'proof' }, fixed: (p) => p.emphasis === 'headline' },
    'narrow-page': { input: { contentWidth: 'narrow', hero: 'split-media', sections: 'bento' }, fixed: (p) => p.hero === 'text-left' && p.sections === 'stacked' },
    'capitals-restraint': { input: { headingCase: 'upper', scaleRatio: 1.42, hero: 'statement', headingWeight: 700 }, fixed: (p) => p.scaleRatio <= 1.3 && p.hero === 'text-left' },
    'delicate-outline': { input: { fontHeading: 'fraunces', headingWeight: 700, signature: 'outline-type' }, fixed: (p) => p.signature === 'marker' },
    'dense-motion': { input: { density: 0.85, motion: 'expressive' }, fixed: (p) => p.motion === 'subtle' },
  };

  it.each(HARMONY_RULES.map((r) => r.id))('harmony rule "%s" fixes its case and leaves a harmonious design alone', (id) => {
    const example = disharmony[id];
    expect(example, `no example written for ${id}`).toBeDefined();
    const input = { ...DEFAULT_PARAMS, ...example!.input };
    const alone = { ...input };
    HARMONY_FIXES.get(id)!(alone);
    expect(example!.fixed(alone), `${id} did not fix its case`).toBe(true);
    expect(example!.fixed(harmonize(input)), `${id}: the full pass undid the fix`).toBe(true);
    const plain = { ...DEFAULT_PARAMS };
    HARMONY_FIXES.get(id)!(plain);
    expect(plain).toEqual(DEFAULT_PARAMS);
  });

  it('leaves no conflict after the harmony rules have run, for the cases that both cover', () => {
    for (const id of ['outline-thin', 'statement-emphasis', 'narrow-split', 'caps-dramatic', 'outline-delicate', 'sticker-finish', 'sheen-thin', 'dark-shadow']) {
      const params = harmonize({ ...DEFAULT_PARAMS, ...triggers[id] });
      expect(conflicts({ ...createProject(), params }).map((c) => c.id), id).not.toContain(id);
    }
  });
});
