import { describe, expect, it } from 'vitest';
import {
  CONFLICT_RULES, CONFLICT_TESTS, DEFAULT_PARAMS, DIRECTION_GROUPS, DIRECTIONS, EVIDENCE_GRADES, FONTS, HARMONY_FIXES, HARMONY_RULES, NOT_CHECKED, PAIRS, PARAM_KEYS, RULES, SOURCE_BASES, STEPS,
  MOCKUP_OVERLAYS, OVERLAYS, CRAFT_RULES, RESEARCH_RULES, SKINS, SMALL_BUSINESS_CSS, assertKnownParams, luminanceRgb, skinFits, findOverlay, researchReport, craftReport, craftSheet, renderSmallBusiness, SAMPLE_CONTENT, closerOptions, conflicts, createProject, deriveTokens, findSkin, skinParams, skinsOf, describeDesign, designDistance, findDirection, findStep, generateDirections, harmonize, resolvePatch,
  CITED_NAMES, tradeWordsOutsideBrackets, vaguePhrasesIn,
  type DesignParams, type SourceRef,
} from '../src/index.js';
import { readFileSync, readdirSync } from 'node:fs';
import { allStrings, repoFileExists, repoPath } from './helpers.js';

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
  const properNames = [...Object.values(FONTS).map((font) => font.label), ...DIRECTIONS.map((d) => d.name), ...CITED_NAMES];

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
    for (const d of DIRECTIONS) add(d.id, d.mood, d.bestFor, d.risk, describeDesign(d.params), ...(d.departs ?? []).map((x) => x.why));
    for (const d of generateDirections(20261113, 6)) add('a generated Direction', d.name, d.mood);
    for (const rule of RULES) add(rule.id, rule.text);
    for (const font of Object.values(FONTS)) add(`font ${font.id}`, font.character);
    add('the plain start', describeDesign(DEFAULT_PARAMS));
    for (const pair of PAIRS) add(`contrast pair ${pair.id}`, pair.pair);
    for (const line of NOT_CHECKED) add('what the contrast checks do not cover', line);
    for (const skin of SKINS) add(`skin ${skin.id}`, skin.name, skin.what);
    for (const overlay of OVERLAYS) add(`overlay ${overlay.id}`, overlay.name, overlay.what, overlay.chooseWhen, overlay.risk);
    for (const d of DIRECTIONS) for (const result of researchReport(d.params, deriveTokens(d.params, 'advise').css)) add(`research rule ${result.rule.id}`, result.rule.name, result.rule.why, result.rule.notChecked, result.found);
    for (const d of DIRECTIONS) for (const line of craftReport(d.params, deriveTokens(d.params, 'advise').css)) add(`craft rule ${line.rule.id}`, line.rule.name, line.rule.what, line.now ?? undefined);
    return out;
  }

  it('has a checker that fails the texts it must fail (finding T3-05)', () => {
    // Outside round brackets a trade word is found, whatever its capitals, wherever it stands.
    expect(tradeWordsOutsideBrackets('The accent is strong.')).toEqual(['accent']);
    expect(tradeWordsOutsideBrackets('ACCENT colors and Serif letters')).toEqual(['accent', 'serif']);
    expect(tradeWordsOutsideBrackets('a quiet hue')).toEqual(['hue']);
    expect(tradeWordsOutsideBrackets('taken from a design system')).toEqual(['design system']);
    expect(tradeWordsOutsideBrackets('letters without feet, or sans-serif')).toEqual(['serif', 'sans', 'sans-serif']);
    // Its plural counts, and so does a hyphenated compound (finding T3-07).
    expect(tradeWordsOutsideBrackets('Fights with red or pink accents.')).toContain('accent');
    expect(tradeWordsOutsideBrackets('accent-colored buttons')).toEqual(['accent']);
    expect(tradeWordsOutsideBrackets('soft washes of color')).toEqual(['wash']);
    // Inside round brackets it is allowed; between two bracketed parts it is found.
    expect(tradeWordsOutsideBrackets('The main color (designers call it the accent color).')).toEqual([]);
    expect(tradeWordsOutsideBrackets('(first) the accent sits here (second)')).toEqual(['accent']);
    // A longer word that merely contains a trade word is not a trade word; neither is a name that was handed over.
    expect(tradeWordsOutsideBrackets('HeroUI and accented letters')).toEqual([]);
    expect(tradeWordsOutsideBrackets('Public Sans text', ['Public Sans'])).toEqual([]);
    expect(tradeWordsOutsideBrackets('Public Sans text')).toEqual(['sans']);
    // The vague phrases are found, whatever their capitals.
    expect(vaguePhrasesIn('The Builder’s judgment')).toEqual(['the builder', 'builder’s']);
    expect(vaguePhrasesIn('A Research Helper read the files.')).toEqual(['research helper']);
    expect(vaguePhrasesIn('A plain sentence about the Studio.')).toEqual([]);
  });

  it('uses a trade word only inside round brackets, as a word to learn', () => {
    const texts = shownTexts();
    expect(texts.length).toBeGreaterThan(600);
    for (const { where, text } of texts) expect(tradeWordsOutsideBrackets(text, properNames), `${where}: ${text}`).toEqual([]);
  });

  it('never points at something the reader cannot see, and gives no thing a second name, source lines included', () => {
    const everything = [
      ...allStrings(STEPS), ...allStrings(DIRECTIONS.map(({ params: _params, ...rest }) => rest)), ...allStrings(RULES), ...Object.values(FONTS).map((font) => font.character),
      ...allStrings(SKINS), ...allStrings(OVERLAYS), ...allStrings(RESEARCH_RULES.map(({ measure: _measure, ...rest }) => rest)),
    ];
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
  it('has 38 curated Directions, each a complete, valid, conflict-free design with record fields', () => {
    expect(DIRECTIONS).toHaveLength(38);
    expect(new Set(DIRECTIONS.map((d) => d.id)).size).toBe(38);
    expect(new Set(DIRECTIONS.map((d) => d.name)).size).toBe(38);
    for (const d of DIRECTIONS) {
      expect(() => assertKnownParams(d.params), d.id).not.toThrow();
      expect(Object.keys(d.params).sort(), d.id).toEqual([...PARAM_KEYS].sort());
      for (const text of [d.name, d.mood, d.bestFor, d.risk]) expect(text.trim().length, d.id).toBeGreaterThan(8);
      d.sources.forEach((source, i) => checkSource(source, `${d.id} source ${i + 1}`));
      // A source line that points into a research file names a record that the file really holds.
      for (const source of d.sources) if (source.record?.endsWith('.json')) expectNamedRecord(source, d.id);
      expect(EVIDENCE_GRADES, d.id).toContain(d.evidence);
      expect(isDate(d.reviewed), `${d.id}: review date`).toBe(true);
      expect(conflicts({ ...createProject(), params: d.params }), `${d.id} has a conflict`).toEqual([]);
      expect(findDirection(d.id)).toBe(d);
      // Every curated Direction stands in one of the groups that the first screen shows.
      expect(DIRECTION_GROUPS.map((g) => g.id), `${d.id}: group`).toContain(d.group);
      // A curated Direction already satisfies the harmony rules that generated Directions must satisfy.
      expect(harmonize(d.params), `${d.id} breaks a harmony rule`).toEqual(d.params);
    }
    for (const name of ['constructor', 'toString', '__proto__', 'Midnight Aurora', '']) expect(findDirection(name), name).toBeUndefined();
  });

  it('starts every curated Direction, in every Skin, without a contrast note under "Warn me", except three whose link colors stay on purpose (SPEC.md section 2.4.2)', () => {
    // The pairs that may start below their requirement, per Direction. A new entry here is a decision, not an accident.
    const KNOWN: Record<string, string[]> = {
      'poster-block': ['link-on-page', 'link-on-card', 'lede-on-hero'],
      'sticker-pop': ['link-on-page', 'link-on-card'],
      'sunlit-studio': ['link-on-page', 'link-on-card'],
    };
    const starting: Record<string, string[]> = {};
    for (const d of DIRECTIONS) {
      for (const params of [d.params, ...skinsOf(d).map((skin) => skinParams(d, skin))]) {
        for (const issue of deriveTokens(params, 'advise').issues) starting[d.id] = [...new Set([...(starting[d.id] ?? []), issue.id])];
      }
    }
    expect(Object.keys(starting).sort()).toEqual(Object.keys(KNOWN).sort());
    for (const [id, pairs] of Object.entries(starting)) for (const pair of pairs) expect(KNOWN[id], `${id}: ${pair}`).toContain(pair);
  });

  it('keeps the edge of a form field at 3 to 1 or more against the field and the box around it, in every contrast setting and at both ends of the "Text contrast" slider', () => {
    for (const d of DIRECTIONS) {
      for (const contrast of [0, d.params.contrast, 1]) {
        for (const profile of ['off', 'advise', 'enforce'] as const) {
          const notes = deriveTokens({ ...d.params, contrast }, profile).issues.filter((issue) => issue.id.startsWith('field-border'));
          expect(notes, `${d.id}, contrast ${contrast}, ${profile}`).toEqual([]);
        }
      }
    }
  });

  it('draws a faded headline with both ends at 3 to 1 or more in every contrast setting, on every Direction and Skin (the builder’s look of 2026-11-15; closes finding T2-03)', () => {
    // The fill is written as exact colors: six hexadecimal digits, or red, green, and blue steps with the share that shows.
    // Each is measured here as a browser draws it, over the color of the first screen.
    const channels = (hex: string): [number, number, number] => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255) as [number, number, number];
    const ratio = (color: string, ground: string): number => {
      const bg = channels(ground);
      const see = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(color);
      const fg = see ? ([1, 2, 3].map((n, k) => (Number(see[n]) / 255) * Number(see[4]) + bg[k]! * (1 - Number(see[4]))) as [number, number, number]) : channels(color);
      const [a, b] = [fg, bg].map(([r, g, bl]) => luminanceRgb({ r, g, b: bl }));
      return (Math.max(a!, b!) + 0.05) / (Math.min(a!, b!) + 0.05);
    };
    const weak: string[] = [];
    let measured = 0;
    for (const d of DIRECTIONS) {
      for (const [label, params] of [['its own colors', d.params], ...skinsOf(d).map((skin) => [skin.id, skinParams(d, skin)] as const)] as const) {
        if (params.displayTreatment === 'solid') continue;
        for (const profile of ['off', 'advise', 'enforce'] as const) {
          const tokens = deriveTokens(params, profile);
          const ends = tokens.css['--display-fill']!.match(/#[0-9a-f]{6}|rgb\([^)]*\)/g)!;
          expect(ends.length, `${d.id}: two ends`).toBe(2);
          for (const end of ends) {
            measured++;
            const found = ratio(end, tokens.hex['--hero-bg']!);
            if (found < 3) weak.push(`${d.id}, ${label}, ${profile}: ${end} at ${found.toFixed(2)} to 1`);
          }
        }
      }
    }
    expect(measured).toBeGreaterThan(100);
    expect(weak).toEqual([]);
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
    'outline-delicate': { signature: 'outline-type', fontHeading: 'playfair' },
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

describe('text is rendered as text (hard rule 6)', () => {
  it('uses none of the ways to turn text into markup, in any source file of the core or of the Studio', () => {
    const sourceFiles = (dir: string): string[] =>
      readdirSync(repoPath(dir), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? sourceFiles(`${dir}/${entry.name}`) : /\.(ts|tsx)$/.test(entry.name) ? [`${dir}/${entry.name}`] : [],
      );
    // The data lines of one file are left out of this scan: `catalog/floors.ts` names these browser calls as things to forbid in the page
    // that an AI coding tool builds (requirement S4). Each data line is one JSON record that starts with `  {"id"`. The rest of the file,
    // the code and the comments, is scanned like every other file. The test checks that the file exists, so that the exemption cannot
    // hide a deletion or a move, and that a data line holds nothing but a record (a line of code cannot pass as data).
    const FLOORS_DATA = 'packages/core/src/catalog/floors.ts';
    const isDataLine = (line: string): boolean => {
      if (!line.startsWith('  {"id"')) return false;
      try {
        return typeof (JSON.parse(line.trim().replace(/,$/, '')) as { id?: unknown }).id === 'string';
      } catch {
        return false;
      }
    };
    const files = [...sourceFiles('packages/core/src'), ...sourceFiles('apps/studio/src')];
    expect(files).toContain(FLOORS_DATA);
    expect(files.length).toBeGreaterThanOrEqual(15);
    // The lint rule stops these names as property names. This test also sees a name that sits whole inside a text or a comment
    // (code review of 2026-11-13, finding "gaps 4": the rule stopped four spellings of twelve). One limit stays: a name that is
    // put together from pieces while the page runs escapes the rule and this test alike.
    const forbidden = /innerHTML|outerHTML|insertAdjacentHTML|setHTMLUnsafe|parseHTMLUnsafe|createContextualFragment|DOMParser|dangerouslySetInnerHTML|document\s*\.\s*write(ln)?\b/;
    const frameText: string[] = [];
    for (const file of files) {
      const raw = readFileSync(repoPath(file), 'utf8');
      const text = file === FLOORS_DATA ? raw.split('\n').filter((line) => !isDataLine(line)).join('\n') : raw;
      expect(text.match(forbidden)?.[0], file).toBeUndefined();
      for (const hit of text.match(/\bsrcdoc\s*=|\bsrcDoc=/g) ?? []) frameText.push(`${file}: ${hit}`);
    }
    // A frame's document text is set in exactly three places: the two locked preview frames, and one fixed test frame.
    expect(frameText.sort()).toEqual(['apps/studio/src/platform.ts: srcdoc =', 'apps/studio/src/preview.tsx: srcDoc=', 'apps/studio/src/preview.tsx: srcDoc=']);
    // The checker fails the texts it must fail.
    for (const bad of ['el.innerHTML = x', "el['outerHTML']", 'document.writeln(x)', 'document . write(x)', 'new DOMParser()', 'range.createContextualFragment(x)', 'el.setHTMLUnsafe(x)']) expect(forbidden.test(bad), bad).toBe(true);
  });
});

describe('claims about output (hard rule 8)', () => {
  it('writes "WCAG compliant", "ADA compliant", or "accessible" in no source file of the core or of the Studio', () => {
    const sourceFiles = (dir: string): string[] =>
      readdirSync(repoPath(dir), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? sourceFiles(`${dir}/${entry.name}`) : /\.(ts|tsx|css|html)$/.test(entry.name) ? [`${dir}/${entry.name}`] : [],
      );
    const files = [...sourceFiles('packages/core/src'), ...sourceFiles('apps/studio/src')];
    expect(files.length, 'the list of source files must not be empty or nearly so').toBeGreaterThanOrEqual(15);
    const forbidden = /WCAG[- ]compliant|ADA[- ]compliant|\baccessible\b/i;
    for (const file of files) expect(readFileSync(repoPath(file), 'utf8').match(forbidden)?.[0], file).toBeUndefined();
    // The checker fails the texts it must fail.
    for (const bad of ['This page is WCAG compliant.', 'ADA-compliant output', 'an accessible design']) expect(forbidden.test(bad), bad).toBe(true);
  });
});

describe('Skins: pre-built colors for a Direction', () => {
  it('has skins with unique identifiers and names, and plain text', () => {
    expect(new Set(SKINS.map((s) => s.id)).size).toBe(SKINS.length);
    expect(new Set(SKINS.map((s) => s.name)).size).toBe(SKINS.length);
    for (const skin of SKINS) {
      expect(skin.what.trim().length, skin.id).toBeGreaterThan(12);
      expect(tradeWordsOutsideBrackets(`${skin.name}. ${skin.what}`), skin.id).toEqual([]);
      expect(findSkin(skin.id)).toBe(skin);
    }
  });

  it('changes colors only: layout, letters, shapes, and how light the main color is stay as the Direction made them', () => {
    const COLOR_KEYS = new Set(['accentHue', 'accent2Hue', 'accentChroma', 'neutralHue', 'colorStrategy', 'displayTreatment']);
    for (const d of DIRECTIONS) {
      for (const skin of skinsOf(d)) {
        const p = skinParams(d, skin);
        for (const key of Object.keys(d.params) as (keyof DesignParams)[]) {
          if (!COLOR_KEYS.has(key)) expect(p[key], `${d.id}/${skin.id}: ${key}`).toEqual(d.params[key]);
        }
        expect(p.accentHue).toBe(skin.accentHue);
      }
    }
  });

  it('offers a Skin only where its color shows and its text is true, without a clash, in harmony, and with no color pair failing that the Direction’s own colors pass', () => {
    let offering = 0;
    for (const d of DIRECTIONS) {
      const skins = skinsOf(d);
      expect(skins.length, `${d.id}: every listed skin exists`).toBe(d.skins?.length ?? 0);
      if (skins.length > 0) offering += 1;
      const own = new Set(deriveTokens(d.params, 'advise').pairs.filter((pair) => !pair.passes).map((pair) => pair.id));
      for (const skin of skins) {
        // The offer rule: the color must show on something large, and the Skin's words must fit what is drawn (finding DT-01).
        expect(skinFits(d, skin), `${d.id}/${skin.id}: the Direction cannot show this Skin as its text describes it`).toBe(true);
        const p = skinParams(d, skin);
        // A Skin that names a color really moves the main color to another place on the color wheel.
        const turn = Math.abs(p.accentHue - d.params.accentHue);
        if (skin.accentChroma === undefined) expect(Math.min(turn, 360 - turn), `${d.id}/${skin.id}: the color barely changes`).toBeGreaterThanOrEqual(35);
        else expect(p.accentHue !== d.params.accentHue || p.accentChroma !== d.params.accentChroma, `${d.id}/${skin.id}: changes nothing`).toBe(true);
        expect(() => assertKnownParams(p), `${d.id}/${skin.id}`).not.toThrow();
        expect(conflicts({ ...createProject(), params: p }), `${d.id}/${skin.id}: clash`).toEqual([]);
        expect(harmonize(p), `${d.id}/${skin.id}: harmony`).toEqual(p);
        const failing = deriveTokens(p, 'advise').pairs.filter((pair) => !pair.passes && !own.has(pair.id)).map((pair) => pair.id);
        expect(failing, `${d.id}/${skin.id}: color pairs`).toEqual([]);
      }
    }
    // Most Directions offer Skins; the ones that paint their main color on small marks only, or whose main color is nearly gray, offer none.
    expect(offering).toBeGreaterThanOrEqual(30);
    for (const id of ['graphite-precision', 'paper-and-ink', 'quiet-luxury', 'ink-and-seal', 'plain-label']) expect(skinsOf(DIRECTIONS.find((d) => d.id === id)!), id).toEqual([]);
    // Every Skin of the Catalog is offered somewhere: a Skin that no Direction can show is not kept.
    for (const skin of SKINS) expect(DIRECTIONS.some((d) => skinsOf(d).includes(skin)), skin.id).toBe(true);
  });

  it('says in a Skin’s text which color it gives and nothing about how light or how vivid, because the Direction keeps those', () => {
    for (const skin of SKINS) {
      expect(skin.what, skin.id).not.toMatch(/\b(deep|dark|light|clear|bright|near-black|pale|vivid)\b/i);
      for (const source of skin.sources) checkSource(source, `skin ${skin.id}`);
      for (const source of skin.sources) if (source.record?.endsWith('.json')) expectNamedRecord(source, `skin ${skin.id}`);
      expect(EVIDENCE_GRADES, skin.id).toContain(skin.evidence);
      expect(isDate(skin.reviewed), skin.id).toBe(true);
    }
  });

  it('offers a color fade only where the headline can really end in the Skin’s second color (code review of 2026-11-14)', () => {
    // A Direction that paints with one color in another way (quiet, tinted, or a block of color) cannot carry a second color:
    // its headline fade would end 52 degrees on from the main color, not in the color that the Skin's text names.
    let fades = 0;
    for (const d of DIRECTIONS) {
      for (const skin of skinsOf(d).filter((s) => s.accent2Hue !== null)) {
        const p = skinParams(d, skin);
        expect(p.colorStrategy, `${d.id}/${skin.id}: a fade needs a page with two colors`).toBe('duo');
        expect(p.accent2Hue, `${d.id}/${skin.id}: the fade ends in the Skin's second color`).toBe(skin.accent2Hue);
        expect(p.displayTreatment, `${d.id}/${skin.id}`).toBe('accent-gradient');
        fades += 1;
      }
    }
    expect(fades).toBeGreaterThan(20);
    // A one-color Skin on a one-color page stays one-colored.
    const daylight = DIRECTIONS.find((d) => d.id === 'soft-daylight')!;
    expect(skinParams(daylight, findSkin('ember')!).colorStrategy).toBe('single-accent');
  });

  it('keeps a two-color Direction two-colored, and gives a one-color page a second color only where the page has room for one', () => {
    const goth = DIRECTIONS.find((d) => d.id === 'galactic-goth')!;
    const gothOcean = skinParams(goth, findSkin('ocean')!);
    // "Galactic Goth" keeps the distance between its two colors (302 and 18: 76 degrees on).
    expect(gothOcean.colorStrategy).toBe('duo');
    expect(gothOcean.accent2Hue).toBe((245 + (18 - 302) + 360) % 360);
    const cobalt = DIRECTIONS.find((d) => d.id === 'cobalt-wash')!;
    expect(skinParams(cobalt, findSkin('sunset')!).colorStrategy).toBe(cobalt.params.colorStrategy);
  });
});

/** The title of every record in one file of the knowledge base. The Studio prints a curved apostrophe; a record may hold a straight one. */
const plainQuotes = (text: string): string => text.replace(/’/g, "'");
const recordTitles = new Map<string, Set<string>>();
function titlesIn(file: string): Set<string> {
  let titles = recordTitles.get(file);
  if (!titles) {
    const parsed = JSON.parse(readFileSync(repoPath(file), 'utf8')) as { entries: { principle: string }[] };
    titles = new Set(parsed.entries.map((entry) => plainQuotes(entry.principle)));
    recordTitles.set(file, titles);
  }
  return titles;
}
/** A source line that names a record must name one that its file really holds, word for word. */
function expectNamedRecord(source: SourceRef, where: string): void {
  const named = /The record “([^”]+)”/.exec(source.text)?.[1];
  expect(named, `${where}: the source line names no record`).toBeTruthy();
  expect(titlesIn(source.record!).has(plainQuotes(named!)), `${where}: ${source.record} holds no record “${named}”`).toBe(true);
}

describe('Overlays: small helpers over the page (decision D52, hard rule 5)', () => {
  it('has six Overlays, each a complete record with a source, an evidence grade, and a review date', () => {
    expect(OVERLAYS).toHaveLength(6);
    expect(new Set(OVERLAYS.map((o) => o.id)).size).toBe(OVERLAYS.length);
    expect(new Set(OVERLAYS.map((o) => o.name)).size).toBe(OVERLAYS.length);
    for (const overlay of OVERLAYS) {
      expect(overlay.id, overlay.id).toMatch(/^[a-z][a-z-]*$/);
      for (const text of [overlay.what, overlay.chooseWhen, overlay.risk]) expect(text.trim().length, overlay.id).toBeGreaterThan(40);
      expect(EVIDENCE_GRADES, overlay.id).toContain(overlay.evidence);
      expect(isDate(overlay.reviewed), `${overlay.id}: review date`).toBe(true);
      expect(overlay.sources.length, overlay.id).toBeGreaterThan(0);
      for (const source of overlay.sources) checkSource(source, `overlay ${overlay.id}`);
      // The same rule as for a Step: the grade "measured" needs a source that was read in full.
      if (overlay.evidence === 'measured') expect(overlay.sources.some((s) => s.basis === 'read'), overlay.id).toBe(true);
      expect(findOverlay(overlay.id)).toBe(overlay);
    }
    expect(findOverlay('no-such-overlay')).toBeUndefined();
  });

  it('names, in each source line, a record that the knowledge base really holds', () => {
    for (const overlay of OVERLAYS) for (const source of overlay.sources) expectNamedRecord(source, `overlay ${overlay.id}`);
  });

  it('draws exactly the Overlays of the Catalog in the Mockup, in the same order', () => {
    expect([...MOCKUP_OVERLAYS]).toEqual(OVERLAYS.map((o) => o.id));
  });
});

describe('Research rules: findings turned into numbers that a design can be measured against (decision D52, hard rule 5)', () => {
  const report = (params: DesignParams) => researchReport(params, deriveTokens(params, 'advise').css);

  it('has five research rules, each a complete record with sources, an evidence grade, and a review date', () => {
    expect(RESEARCH_RULES).toHaveLength(5);
    expect(new Set(RESEARCH_RULES.map((r) => r.id)).size).toBe(RESEARCH_RULES.length);
    for (const rule of RESEARCH_RULES) {
      for (const text of [rule.name, rule.why, rule.notChecked]) expect(text.trim().length, rule.id).toBeGreaterThan(30);
      expect(EVIDENCE_GRADES, rule.id).toContain(rule.evidence);
      expect(isDate(rule.reviewed), `${rule.id}: review date`).toBe(true);
      expect(rule.sources.length, rule.id).toBeGreaterThan(0);
      for (const source of rule.sources) {
        checkSource(source, `research rule ${rule.id}`);
        expectNamedRecord(source, `research rule ${rule.id}`);
      }
      // Nobody read the studies behind these records, so no rule may carry the grade "measured" without a source read in full.
      if (rule.evidence === 'measured') expect(rule.sources.some((s) => s.basis === 'read'), rule.id).toBe(true);
    }
  });

  it('measures a real number for every rule on every Direction: no rule answers from a value that is missing', () => {
    for (const d of DIRECTIONS) {
      for (const result of report(d.params)) {
        expect(result.found, `${d.id}/${result.rule.id}`).not.toMatch(/NaN|undefined|Infinity/);
        expect(result.found, `${d.id}/${result.rule.id}`).toMatch(/\b\d+(\.\d+)? (pixels|characters|text heights)\b/);
      }
    }
  });

  it('holds every binding rule on every Direction and on every Skin of every Direction', () => {
    for (const d of DIRECTIONS) {
      for (const params of [d.params, ...skinsOf(d).map((skin) => skinParams(d, skin))]) {
        for (const result of report(params).filter((r) => r.rule.binding)) expect(result.holds, `${d.id}: ${result.rule.name}. ${result.found}`).toBe(true);
      }
    }
  });

  it('names the Directions that depart from a rule that does not bind, so that a new departure is a decision and not an accident', () => {
    const departures = DIRECTIONS.flatMap((d) => report(d.params).filter((r) => !r.holds).map((r) => `${d.id}: ${r.rule.id}`));
    // "Control Room" is a dense working screen; its text-size Option says of itself "Small for older eyes on a public site".
    expect(departures).toEqual(['control-room: reading-size']);
    // Each departure carries its reason as a record, and no record stands without a departure (finding U5-16).
    expect(DIRECTIONS.flatMap((d) => (d.departs ?? []).map((x) => `${d.id}: ${x.ruleId}`))).toEqual(departures);
  });

  it('says "does not hold", with the number, when a design breaks a rule', () => {
    const by = (params: DesignParams, id: string) => report(params).find((r) => r.rule.id === id)!;
    expect(by({ ...DEFAULT_PARAMS, baseSize: 15 }, 'reading-size')).toMatchObject({ holds: false, found: 'Reading text is 15 pixels tall.' });
    expect(by({ ...DEFAULT_PARAMS, baseSize: 16 }, 'reading-size').holds).toBe(true);
    // The step between sizes is measured on the sizes that the design really works out, not on the ratio it asks for. With
    // small reading text the two smallest sizes meet their lower limits and end up closer than a tenth (finding "core 4").
    expect(by({ ...DEFAULT_PARAMS, baseSize: 14, scaleRatio: 1.25 }, 'size-step')).toMatchObject({ holds: false, found: 'The two closest text sizes are 13 and 14 pixels: the larger is 7.69 percent larger.' });
    expect(by({ ...DEFAULT_PARAMS, baseSize: 13, scaleRatio: 1.25 }, 'size-step')).toMatchObject({ holds: false, found: 'Two of the design’s text sizes are the same: 13 pixels.' });
    expect(by({ ...DEFAULT_PARAMS, baseSize: 17, scaleRatio: 1.05 }, 'size-step').holds).toBe(false);
    expect(by({ ...DEFAULT_PARAMS, baseSize: 17, scaleRatio: 1.25 }, 'size-step').holds).toBe(true);
    // The measures read the design's worked-out values, so a Template that changed them would be caught.
    const css = deriveTokens(DEFAULT_PARAMS, 'advise').css;
    const withCss = (change: Record<string, string>, id: string) => researchReport(DEFAULT_PARAMS, { ...css, ...change }).find((r) => r.rule.id === id)!;
    expect(withCss({ '--measure': '95ch' }, 'line-length').holds).toBe(false);
    expect(withCss({ '--measure': '95ch' }, 'line-length').found).toContain('at most 95 characters wide');
    expect(withCss({ '--leading-body': '1.3' }, 'line-height').holds).toBe(false);
    expect(withCss({ '--leading-body': '2' }, 'line-height').holds).toBe(false);
    expect(withCss({ '--target-min': '24px' }, 'target-size')).toMatchObject({ holds: false, found: 'They are 24 pixels tall.' });
    expect(withCss({ '--target-min': '2.75rem' }, 'target-size')).toMatchObject({ holds: true, found: 'They are 44 pixels tall.' });
    // A value that is missing never passes.
    expect(withCss({ '--target-min': '' }, 'target-size').holds).toBe(false);
    expect(withCss({ '--measure': '' }, 'line-length').holds).toBe(false);
    expect(withCss({ '--text-sm': '' }, 'size-step').holds).toBe(false);
  });

  it('says which rules a design can change and which the Template fixes, and names in words what a fixed rule leaves out', () => {
    expect(RESEARCH_RULES.filter((r) => r.setBy === 'design').map((r) => r.id)).toEqual(['reading-size', 'size-step']);
    // A rule that a design can change really changes its answer with the design: it is a measure, not a constant.
    for (const id of ['reading-size', 'size-step']) {
      const answers = new Set([13, 14, 17, 20].map((baseSize) => report({ ...DEFAULT_PARAMS, baseSize }).find((r) => r.rule.id === id)!.holds));
      expect(answers.size, id).toBe(2);
    }
    // The Mockup's text links are smaller than its buttons; the rule about buttons says so (finding "core 1").
    expect(SMALL_BUSINESS_CSS).toMatch(/\.actions \.link, \.service \.more, address \.phone, \.nav-actions \.phone \{[^}]*min-height: 1\.5rem/);
    expect(RESEARCH_RULES.find((r) => r.id === 'target-size')!.notChecked).toContain('Text links inside the page (for example “About repairs”) are 24 pixels tall');
  });
});

describe('Craft rules: the fine details that the Studio adds by itself (SPEC.md section 2.5, hard rule 5)', () => {
  const page = (params: DesignParams): string => renderSmallBusiness({ params, tokens: deriveTokens(params, 'advise').css, content: SAMPLE_CONTENT, focus: 'top', still: true, links: 'inert', fontFaceCss: '' });
  const tokens = (params: DesignParams) => deriveTokens(params, 'advise').css;

  it('has craft rules, each a complete record in plain words with an exact instruction, a source, an evidence grade, and a date', () => {
    // The twelve, by name: a rule cannot leave or join the list without a change of this line (finding T6-13).
    expect(CRAFT_RULES.map((r) => r.id)).toEqual(['steady-numerals', 'even-lines', 'press-gives', 'focus-ring', 'less-motion', 'short-moves', 'hover-with-a-pointer', 'nested-corners', 'clear-underlines', 'matching-controls', 'own-selection', 'long-words']);
    expect(new Set(CRAFT_RULES.map((r) => r.id)).size).toBe(CRAFT_RULES.length);
    expect(new Set(CRAFT_RULES.map((r) => r.name)).size).toBe(CRAFT_RULES.length);
    for (const rule of CRAFT_RULES) {
      expect(rule.id, rule.id).toMatch(/^[a-z][a-z-]*$/);
      const instruction = rule.instruction(DEFAULT_PARAMS, tokens(DEFAULT_PARAMS));
      for (const text of [rule.name, rule.what, instruction]) expect(text.trim().length, rule.id).toBeGreaterThan(20);
      expect(EVIDENCE_GRADES, rule.id).toContain(rule.evidence);
      expect(isDate(rule.reviewed), `${rule.id}: date`).toBe(true);
      expect(rule.sources.length, rule.id).toBeGreaterThan(0);
      for (const source of rule.sources) checkSource(source, `craft rule ${rule.id}`);
      // A published practice is no measurement: no craft rule may carry the grade "measured".
      expect(rule.evidence, rule.id).not.toBe('measured');
      // The research record calls its own sources practitioner opinion, so no rule is graded above that (finding T6-05).
      expect(rule.evidence, rule.id).toBe('expert-opinion');
      // The Studio states what was checked; it never calls a result accessible or compliant (hard rule 8).
      expect(`${rule.name} ${rule.what} ${instruction}`, rule.id).not.toMatch(/\baccessib|\bcomplian|\bADA\b/);
      expect('This page is accessible and ADA compliant.').toMatch(/\baccessib|\bcomplian|\bADA\b/);
    }
  });

  it('holds every craft rule on the Mockup of every built-in Direction: the Mockup practices what the Vision will ask for', () => {
    for (const d of DIRECTIONS) {
      const html = page(d.params);
      for (const rule of CRAFT_RULES) expect(rule.holds(html, tokens(d.params)), `${d.id}: ${rule.name}`).toBe(true);
    }
  });

  it('has checks that can fail: no rule holds on an empty page, and each fails when its own detail is taken out of the Mockup', () => {
    const html = page(DEFAULT_PARAMS);
    for (const rule of CRAFT_RULES) {
      expect(rule.holds('', {}), `${rule.id}: empty page`).toBe(false);
      expect(rule.holds(html.split(rule.detail).join(''), tokens(DEFAULT_PARAMS)), `${rule.id}: without “${rule.detail}”`).toBe(false);
      expect(html, `${rule.id}: the Mockup holds “${rule.detail}”`).toContain(rule.detail);
    }
  });

  it('says what the open design gives where a Decision sets a rule’s value, and that nothing moves when motion is off', () => {
    const still = craftReport({ ...DEFAULT_PARAMS, motion: 'none' }, tokens({ ...DEFAULT_PARAMS, motion: 'none' }));
    const moving = craftReport({ ...DEFAULT_PARAMS, motion: 'subtle' }, tokens({ ...DEFAULT_PARAMS, motion: 'subtle' }));
    const now = (lines: typeof still, id: string): string | null => lines.find((line) => line.rule.id === id)!.now;
    expect(now(still, 'press-gives')).toBe('This design has no movement (Step “Motion”), so a pressed button keeps its size and its place.');
    expect(now(moving, 'press-gives')).toBe('A pressed button shrinks to 97 percent of its size.');
    expect(now(still, 'short-moves')).toBe('This design has no movement (Step “Motion”): every change shows at once.');
    expect(now(moving, 'short-moves')).toBe('A change of color takes 120 milliseconds; a larger change takes 200.');
    expect(now(craftReport({ ...DEFAULT_PARAMS, numerals: 'proportional' }, tokens(DEFAULT_PARAMS)), 'steady-numerals')).toContain('“Number style”');
    expect(now(craftReport({ ...DEFAULT_PARAMS, numerals: 'tabular' }, tokens(DEFAULT_PARAMS)), 'steady-numerals')).toBe('Prices stand digit under digit.');
    expect(now(craftReport({ ...DEFAULT_PARAMS, theme: 'dark' }, tokens({ ...DEFAULT_PARAMS, theme: 'dark' })), 'matching-controls')).toBe('The page tells the browser that it is dark.');
    expect(now(craftReport({ ...DEFAULT_PARAMS, theme: 'light' }, tokens({ ...DEFAULT_PARAMS, theme: 'light' })), 'matching-controls')).toBe('The page tells the browser that it is light.');
    // Every line of the report is a sentence or nothing.
    for (const d of DIRECTIONS) for (const line of craftReport(d.params, tokens(d.params))) if (line.now !== null) expect(line.now, `${d.id}/${line.rule.id}`).toMatch(/^[A-Z].*\.$/);
  });

  it('says of no design what the design does not do: every instruction and every sentence follows the design, for every Direction and every Option (findings T6-01, T6-03, U6-08, U6-09)', () => {
    const designs: DesignParams[] = DIRECTIONS.map((d) => d.params);
    for (const step of STEPS) for (const option of step.options) designs.push({ ...DEFAULT_PARAMS, ...option.patch });
    designs.push({ ...DEFAULT_PARAMS, motion: 'none', elevation: 'hard-shadow', numerals: 'proportional' });
    const seen = { natural: 0, still: 0, hard: 0, entrance: 0 };
    for (const params of designs) {
      const report = craftReport(params, tokens(params));
      const of = (id: string) => report.find((line) => line.rule.id === id)!;
      const label = JSON.stringify([params.numerals, params.motion, params.elevation]);
      for (const line of report) expect(`${line.instruction} ${line.now ?? ''}`, label).not.toMatch(/[Yy]our Decision|the owner picked|undefined|NaN/);
      // Digits of natural width: the rule says that prices do not line up, and asks for nothing else.
      const numerals = of('steady-numerals');
      expect(numerals.aside, label).toBe(params.numerals === 'proportional');
      if (params.numerals === 'proportional') {
        seen.natural++;
        expect(numerals.instruction, label).toContain('`font-variant-numeric: normal` on prices');
        expect(numerals.instruction, label).not.toContain('prices in tables');
        expect(numerals.now, label).toContain('prices do not stand digit under digit');
        expect(tokens(params)['--numeric'], label).toBe('normal');
      } else expect(numerals.now, label).toBe('Prices stand digit under digit.');
      // No motion: nothing shrinks, nothing eases, and no figure of a movement is named.
      const press = of('press-gives');
      const moves = of('short-moves');
      expect([press.aside, moves.aside], label).toEqual([params.motion === 'none', params.motion === 'none']);
      if (params.motion === 'none') {
        seen.still++;
        for (const line of [press, moves]) expect(`${line.instruction} ${line.now ?? ''}`, label).not.toMatch(/0\.9\d|cubic-bezier|\d+ ms|shrinks|moves 2 pixels/);
        expect(press.instruction, label).toContain('do not scale or move a pressed button');
        expect(moves.instruction, label).toContain('write no transition and no animation');
      } else if (params.elevation === 'hard-shadow') {
        seen.hard++;
        expect(press.now, label).toBe('A pressed button moves 2 pixels into its shadow.');
        expect(press.instruction, label).toContain('translate(2px, 2px)');
        expect(press.instruction, label).not.toContain('scale a button to');
      } else {
        expect(press.now, label).toBe('A pressed button shrinks to 97 percent of its size.');
        expect(press.instruction, label).toContain('(0.97 here)');
      }
      // The one entrance of an expressive design is longer than any other change, and the rule says so.
      if (params.motion === 'expressive') {
        seen.entrance++;
        expect(moves.instruction, label).toContain('`--dur-slow` (480 ms)');
      } else expect(moves.instruction, label).not.toContain('--dur-slow');
      expect(of('matching-controls').instruction, label).toContain(`content="${params.theme}"`);
    }
    // Each case really occurred.
    for (const [name, count] of Object.entries(seen)) expect(count, name).toBeGreaterThan(0);
  });

  it('has a style sheet that does what the rules say in the cases that the review found', () => {
    // A button with a hard shadow moves into its shadow, but never in a design without movement.
    expect(SMALL_BUSINESS_CSS).toContain('body[data-elevation="hard-shadow"]:not([data-motion="none"]) .btn:active { transform: translate(2px, 2px);');
    expect(SMALL_BUSINESS_CSS).not.toContain('body[data-elevation="hard-shadow"] .btn:active');
    // Every reaction to the pointer waits for a fine pointer that can rest over a thing, as the source asks.
    expect(SMALL_BUSINESS_CSS.match(/@media \(hover: hover\)(?! and \(pointer: fine\))/g)).toBeNull();
    expect(SMALL_BUSINESS_CSS.match(/@media \(hover: hover\) and \(pointer: fine\)/g)!.length).toBeGreaterThanOrEqual(5);
    // No change of every property, and no slow start.
    expect(SMALL_BUSINESS_CSS).not.toMatch(/transition(-property)?:\s*all\b/);
    expect(SMALL_BUSINESS_CSS).not.toMatch(/\bease-in\b(?!-out)/);
  });

  it('has checks that fail on each fault that the review planted (finding T6-13)', () => {
    const html = page(DEFAULT_PARAMS);
    const values = tokens(DEFAULT_PARAMS);
    const rule = (id: string) => CRAFT_RULES.find((r) => r.id === id)!;
    const withRule = (css: string): string => craftSheet(html.replace('</style>', `${css}\n</style>`));
    expect(html).toContain('</style>');
    const planted: [string, string][] = [
      ['hover-with-a-pointer', 'a:hover { color: red; }'],
      ['hover-with-a-pointer', '@media (hover: hover) { a:hover { color: red; } }'],
      ['short-moves', '.x { transition: all 1s; }'],
      ['short-moves', '.x { transition-property: all; }'],
      ['short-moves', '.x { transition: color 2s ease-in; }'],
      ['focus-ring', 'a:focus-visible { outline: none; }'],
      ['focus-ring', 'a:focus-visible { outline: 0; }'],
    ];
    for (const [id, css] of planted) {
      expect(rule(id).holds(craftSheet(html), values), `${id}: the Mockup as it is`).toBe(true);
      expect(rule(id).holds(withRule(css), values), `${id}: with “${css}”`).toBe(false);
    }
    // Even lines: the value must stand in the rules for headings and paragraphs, not in a rule that nothing uses.
    const moved = craftSheet(html).replace('margin: 0; text-wrap: balance;', 'margin: 0;').replace('p { margin: 0; text-wrap: pretty; }', 'p { margin: 0; }');
    expect(moved).not.toBe(craftSheet(html));
    expect(rule('even-lines').holds(`${moved}\n.unused { text-wrap: balance; text-wrap: pretty; }`, values)).toBe(false);
    // A slow value fails the rule about short changes.
    expect(rule('short-moves').holds(craftSheet(html), { ...values, '--dur': '400ms' })).toBe(false);
    expect(rule('short-moves').holds(craftSheet(html), { ...values, '--dur-slow': '900ms' })).toBe(false);
  });

  it('says where a rule departs from its source, and names an outside source where the research record holds one (finding T6-05)', () => {
    const rule = (id: string) => CRAFT_RULES.find((r) => r.id === id)!;
    expect(rule('short-moves').sources[0]!.text).toMatch(/departs from those sources/);
    expect(rule('focus-ring').sources[0]!.text).toMatch(/this Studio’s own/);
    expect(rule('nested-corners').sources[0]!.text).toMatch(/this Studio’s own/);
    expect(rule('matching-controls').sources[0]!.basis).toBe('read');
    // Three rules rest on the Studio's own judgment alone, and the report says which.
    const own = craftReport(DEFAULT_PARAMS, tokens(DEFAULT_PARAMS)).filter((line) => line.ownJudgment).map((line) => line.rule.id);
    expect(own).toEqual(['clear-underlines', 'own-selection', 'long-words']);
  });
});

describe('the names of the app and of the Vision (SPEC.md section 2.21; decision D75)', () => {
  it('shows the old names nowhere in the source of the core, the Studio, or the Fit check', () => {
    const sourceFiles = (dir: string): string[] =>
      readdirSync(repoPath(dir), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? sourceFiles(`${dir}/${entry.name}`) : /\.(ts|tsx|css|html|mjs)$/.test(entry.name) ? [`${dir}/${entry.name}`] : [],
      );
    const files = [...sourceFiles('packages/core/src'), ...sourceFiles('apps/studio/src'), ...sourceFiles('plugin/fit/src'), 'apps/studio/index.html', 'apps/studio/scripts/make-artifact.mjs'];
    expect(files.length).toBeGreaterThanOrEqual(20);
    // The capital letter marks a name that a reader sees. Lower-case `refraction` stays in the names under which the browser stores
    // the owner's work and in the packages' names: changing those would lose saved work (decision D75).
    for (const file of files) expect(readFileSync(repoPath(file), 'utf8').match(/Refraction|[Pp]rescription|PRESCRIPTION/)?.[0], file).toBeUndefined();
  });
});
