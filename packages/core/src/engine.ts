// The engine: pure functions that turn the owner's actions into a project state. No React, no browser APIs.

import { z } from 'zod';
import { DIRECTIONS, findDirection, type Direction } from './catalog/directions.js';
import { CONFLICT_RULES, HARMONY_RULES } from './catalog/rules.js';
import { STEPS, findStep } from './catalog/steps.js';
import type { Option, Step } from './catalog/types.js';
import { A11Y_PROFILES, DEFAULT_PARAMS, PARAM_RANGES, PARAM_VALUES, assertKnownParams, type A11yProfile, type DesignParams } from './params.js';
import { SAMPLE_CONTENT, type SiteContent } from './templates/smallBusiness.js';
import { deriveTokens, type DerivedTokens } from './tokens.js';

/** The version of the saved-project shape. Raise it on every change of shape, and add a migration and a fixture file for the old shape. */
export const SCHEMA_VERSION = 2;

/**
 * How a Decision came about.
 * - `picked`: the owner picked one of the Catalog's Options.
 * - `kept`: the owner looked at the Step and kept the value the design already had.
 * - `tuned`: the owner set the values by hand (a slider, or a small variation).
 */
export type DecisionKind = 'picked' | 'kept' | 'tuned';

export interface Decision {
  stepId: string;
  /** The Catalog Option whose values the design holds for this Step, or `null` when no Option matches them. */
  optionId: string | null;
  kind: DecisionKind;
  /** The Options that were shown and not picked. */
  rejected: string[];
  /** The values of the parameters this Step owns, as the design holds them. */
  values: Partial<DesignParams>;
  /** The owner's reason, in the owner's words. Optional. */
  reason?: string;
  /** When the Decision was made (ISO 8601, UTC). */
  at: string;
}

export interface Project {
  schemaVersion: number;
  name: string;
  template: 'small-business';
  a11y: A11yProfile;
  /** Where the project started: a curated Direction's identifier, a generated Direction's identifier, or `null` for the plain start. */
  direction: string | null;
  /** The design as it stood when the project started. "Put this Step back" restores from it. */
  base: DesignParams;
  params: DesignParams;
  decisions: Record<string, Decision>;
  content: SiteContent;
}

const hueTurn = (h: number, by: number): number => (((h + by) % 360) + 360) % 360;
const same = (a: unknown, b: unknown): boolean => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) < 1e-9 : a === b);
const isoNow = (): string => new Date().toISOString();
const GENERATED_ID = /^generated-\d{1,10}-\d{1,3}$/;

export function createProject(name = 'Untitled project'): Project {
  return { schemaVersion: SCHEMA_VERSION, name, template: 'small-business', a11y: 'advise', direction: null, base: { ...DEFAULT_PARAMS }, params: { ...DEFAULT_PARAMS }, decisions: {}, content: structuredCopy(SAMPLE_CONTENT) };
}

function structuredCopy(content: SiteContent): SiteContent {
  return { ...content, nav: [...content.nav], services: content.services.map((s) => ({ ...s })), facts: content.facts.map((f) => ({ ...f })), fees: content.fees.map((f) => ({ ...f })) };
}

/** The parameter values an Option sets, given the current design. */
export function resolvePatch(option: Option, current: DesignParams): Partial<DesignParams> {
  const d = option.derive;
  return d ? { ...option.patch, [d.key]: hueTurn(current[d.from], d.turn) } : { ...option.patch };
}

/** The parameters to preview an Option with: the current design plus that Option, and nothing else. */
export function previewParams(project: Project, option: Option): DesignParams {
  return { ...project.params, ...resolvePatch(option, project.params) };
}

/** The current values of the parameters that a Step owns. */
export function ownedValues(step: Step, params: DesignParams): Partial<DesignParams> {
  const out: Partial<Record<keyof DesignParams, DesignParams[keyof DesignParams]>> = {};
  for (const key of step.owns) out[key] = params[key];
  return out as Partial<DesignParams>;
}

/** The Option whose values equal the design's current values for this Step, or `null` when no Option matches. */
export function matchingOptionId(params: DesignParams, step: Step): string | null {
  for (const option of step.options) {
    const patch = resolvePatch(option, params);
    if ((Object.keys(patch) as (keyof DesignParams)[]).every((key) => same(patch[key], params[key]))) return option.id;
  }
  return null;
}

const WIREFRAME: Partial<DesignParams> = {
  fontHeading: 'system-sans',
  fontBody: 'system-sans',
  headingWeight: 700,
  headingTracking: -0.01,
  headingCase: 'sentence',
  baseSize: 17,
  scaleRatio: 1.25,
  numerals: 'proportional',
  neutralHue: 0,
  neutralChroma: 0,
  accentChroma: 0,
  accentLightness: 0.32,
  colorStrategy: 'quiet',
  theme: 'light',
  contrast: 0.75,
  radius: 4,
  elevation: 'borders',
  borderWeight: 1,
  signature: 'none',
  atmosphere: 'plain',
  buttonFinish: 'flat',
  displayTreatment: 'solid',
  motion: 'none',
};

/** Gray layout-only version of a design: structure stays, every Feel value resets. "Structure before decoration." */
export function wireframeParams(params: DesignParams): DesignParams {
  return { ...params, ...WIREFRAME };
}

/**
 * Start from a Direction: every parameter is set at once, and earlier Decisions are cleared,
 * because they described a different design. The Steps then refine the Direction one variable at a time.
 */
export function applyDirection(project: Project, direction: Direction | string): Project {
  const found = typeof direction === 'string' ? findDirection(direction) : direction;
  if (!found) throw new Error('Unknown Direction.');
  assertKnownParams(found.params);
  return { ...project, direction: found.id, base: { ...found.params }, params: { ...found.params }, decisions: {} };
}

/** Start plain: no Direction, the default Option of every Step, and no Decisions. */
export function startPlain(project: Project): Project {
  return { ...project, direction: null, base: { ...DEFAULT_PARAMS }, params: { ...DEFAULT_PARAMS }, decisions: {} };
}

// ───────── Decisions ─────────

function mustStep(stepId: string): Step {
  const step = findStep(stepId);
  if (!step) throw new Error('Unknown Step.');
  return step;
}

/**
 * Recompute every value that follows another value. A picked Option such as "Two colors, opposite" keeps its
 * second hue opposite the accent, however the accent changes later. Hand-tuned values are never recomputed.
 */
function rederive(project: Project): Project {
  let { params, decisions } = project;
  let changed = false;
  for (const step of STEPS) {
    const decision = decisions[step.id];
    if (!decision || decision.kind !== 'picked') continue;
    const derive = step.options.find((o) => o.id === decision.optionId)?.derive;
    if (!derive) continue;
    const value = hueTurn(params[derive.from], derive.turn);
    if (same(params[derive.key], value)) continue;
    params = { ...params, [derive.key]: value };
    decisions = { ...decisions, [step.id]: { ...decision, values: { ...decision.values, [derive.key]: value } } };
    changed = true;
  }
  return changed ? { ...project, params, decisions } : project;
}

function withDecision(project: Project, step: Step, params: DesignParams, decision: Omit<Decision, 'stepId' | 'values' | 'optionId'>): Project {
  const full: Decision = { ...decision, stepId: step.id, optionId: matchingOptionId(params, step), values: ownedValues(step, params) };
  return rederive({ ...project, params, decisions: { ...project.decisions, [step.id]: full } });
}

/** Pick one of the Catalog's Options for a Step. */
export function pick(project: Project, stepId: string, optionId: string, now = isoNow()): Project {
  const step = mustStep(stepId);
  const option = step.options.find((o) => o.id === optionId);
  if (!option) throw new Error('This Step has no such Option.');
  const params = { ...project.params, ...resolvePatch(option, project.params) };
  return withDecision(project, step, params, { kind: 'picked', rejected: step.options.filter((o) => o.id !== option.id).map((o) => o.id), at: now });
}

/** Keep the value the design already has for a Step. The design does not change; the Decision records that the owner looked and kept it. */
export function keep(project: Project, stepId: string, now = isoNow()): Project {
  const step = mustStep(stepId);
  const previous = project.decisions[stepId];
  if (previous) return project;
  return withDecision(project, step, project.params, { kind: 'kept', rejected: [], at: now });
}

function checkOwnedValues(step: Step, values: Partial<DesignParams>): void {
  for (const [key, value] of Object.entries(values) as [keyof DesignParams, unknown][]) {
    if (!step.owns.includes(key)) throw new Error('This Step does not own that value.');
    const range = (PARAM_RANGES as Partial<Record<keyof DesignParams, readonly [number, number]>>)[key];
    const list = (PARAM_VALUES as Partial<Record<keyof DesignParams, readonly string[]>>)[key];
    if (range) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < range[0] || value > range[1]) throw new Error('That value is outside its allowed range.');
    } else if (!list || typeof value !== 'string' || !list.includes(value)) throw new Error('That value is not in its list.');
  }
}

/** Set hand-chosen values for a Step (a "small variation"). The Decision is recorded as tuned. */
export function pickValues(project: Project, stepId: string, values: Partial<DesignParams>, now = isoNow()): Project {
  const step = mustStep(stepId);
  checkOwnedValues(step, values);
  const previous = project.decisions[stepId];
  return withDecision(project, step, { ...project.params, ...values }, { kind: 'tuned', rejected: previous?.rejected ?? [], at: now, ...(previous?.reason ? { reason: previous.reason } : {}) });
}

/** Fine-tune one value by hand. Only that value changes. The Step's Decision becomes "tuned". */
export function tune(project: Project, stepId: string, key: keyof DesignParams, value: number, now = isoNow()): Project {
  const step = mustStep(stepId);
  const tunable = step.tunables?.find((t) => t.key === key);
  if (!tunable) throw new Error('This Step has no such adjustable value.');
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('That value is not a number.');
  const clamped = Math.min(tunable.max, Math.max(tunable.min, value));
  const previous = project.decisions[stepId];
  return withDecision(project, step, { ...project.params, [key]: clamped }, { kind: 'tuned', rejected: previous?.rejected ?? [], at: now, ...(previous?.reason ? { reason: previous.reason } : {}) });
}

/** Put a Step back to the value the project started with, and remove its Decision. */
export function revert(project: Project, stepId: string): Project {
  const step = mustStep(stepId);
  const params = { ...project.params, ...ownedValues(step, project.base) };
  const decisions = Object.fromEntries(Object.entries(project.decisions).filter(([id]) => id !== stepId));
  return rederive({ ...project, params, decisions });
}

export const REASON_MAX = 280;

/** Record the owner's reason for a Decision. An empty reason removes it. */
export function setReason(project: Project, stepId: string, reason: string): Project {
  const decision = project.decisions[mustStep(stepId).id];
  if (!decision) throw new Error('This Step has no Decision yet.');
  const text = reason.trim().slice(0, REASON_MAX);
  const { reason: _old, ...rest } = decision;
  return { ...project, decisions: { ...project.decisions, [stepId]: text ? { ...rest, reason: text } : rest } };
}

// ───────── Small variations ("closer to this one") ─────────

export interface GeneratedOption {
  id: string;
  label: string;
  values: Partial<DesignParams>;
}

const HUE_NAMES: readonly (readonly [number, string])[] = [[25, 'red'], [55, 'orange'], [95, 'yellow'], [140, 'green'], [195, 'teal'], [258, 'blue'], [298, 'violet'], [345, 'pink']];

/** The named color that a hue moves toward when it turns one way or the other around the color wheel. */
function hueNeighbor(hue: number, direction: -1 | 1): string {
  let nearest = 0;
  let distance = Infinity;
  HUE_NAMES.forEach(([center], i) => {
    const d = Math.min(Math.abs(hue - center), 360 - Math.abs(hue - center));
    if (d < distance) {
      distance = d;
      nearest = i;
    }
  });
  return HUE_NAMES[(nearest + direction + HUE_NAMES.length) % HUE_NAMES.length]![1];
}

/**
 * Small variations of a Step's current values, made by nudging its adjustable values.
 * `round` shrinks the nudge, so repeated use narrows in. Each variation is named by what the eye will see.
 */
export function closerOptions(project: Project, stepId: string, round = 0): GeneratedOption[] {
  const step = mustStep(stepId);
  const tunables = step.tunables ?? [];
  const shrink = 1 / (1 + round * 0.6);
  const isHue = (key: keyof DesignParams): boolean => key.toLowerCase().includes('hue');
  const here = (key: keyof DesignParams, min: number, max: number): number => Math.min(max, Math.max(min, project.params[key] as number));
  const moved = (key: keyof DesignParams, from: number, by: number, min: number, max: number): number =>
    Number((isHue(key) ? hueTurn(from, by) : Math.min(max, Math.max(min, from + by))).toFixed(4));
  const word = (t: (typeof tunables)[number], direction: -1 | 1, from: number): string =>
    isHue(t.key) ? `toward ${hueNeighbor(from, direction)}` : (t.directions ?? ['less', 'more'])[direction < 0 ? 0 : 1]!;

  const out: GeneratedOption[] = [];
  const seenValues = new Set<string>();
  const add = (option: GeneratedOption): void => {
    const signature = JSON.stringify(option.values);
    if (seenValues.has(signature)) return;
    seenValues.add(signature);
    out.push(option);
  };
  for (const t of tunables) {
    const from = here(t.key, t.min, t.max);
    for (const direction of [-1, 1] as const) {
      const value = moved(t.key, from, direction * t.nudge * shrink, t.min, t.max);
      if (same(value, from)) continue;
      add({ id: `${String(t.key)}${direction > 0 ? '+' : '-'}`, label: `${t.label}: a little ${word(t, direction, from)}`, values: { [t.key]: value } as Partial<DesignParams> });
    }
  }
  if (tunables.length >= 2) {
    const a = tunables[0]!;
    const b = tunables[1]!;
    const fromA = here(a.key, a.min, a.max);
    const fromB = here(b.key, b.min, b.max);
    for (const direction of [-1, 1] as const) {
      const other = (direction * -1) as -1 | 1;
      const va = moved(a.key, fromA, direction * a.nudge * shrink, a.min, a.max);
      const vb = moved(b.key, fromB, other * b.nudge * shrink, b.min, b.max);
      if (same(va, fromA) || same(vb, fromB)) continue;
      add({ id: `mix${direction > 0 ? '+' : '-'}`, label: `${a.label} ${word(a, direction, fromA)}, ${b.label.toLowerCase()} ${word(b, other, fromB)}`, values: { [a.key]: va, [b.key]: vb } as Partial<DesignParams> });
    }
  }
  return out.slice(0, 6);
}

// ───────── Conflicts ─────────

export interface Conflict {
  id: string;
  stepIds: string[];
  message: string;
}

const DELICATE_FACES = new Set<string>(['playfair-display', 'newsreader', 'fraunces', 'source-serif-4', 'system-serif']);

/** When each conflict rule applies. The rule's text, source, and review date are Catalog records in `catalog/rules.ts`. */
export const CONFLICT_TESTS = new Map<string, (p: DesignParams) => boolean>([
  ['outline-thin', (p) => p.signature === 'outline-type' && p.headingWeight < 600],
  ['marker-gray', (p) => p.signature === 'marker' && p.colorStrategy === 'quiet' && p.accentChroma < 0.05],
  ['statement-emphasis', (p) => p.hero === 'statement' && p.emphasis !== 'headline'],
  ['narrow-split', (p) => p.contentWidth === 'narrow' && p.hero === 'split-media'],
  ['caps-dramatic', (p) => p.headingCase === 'upper' && p.scaleRatio > 1.34],
  ['outline-delicate', (p) => p.signature === 'outline-type' && DELICATE_FACES.has(p.fontHeading)],
  ['sticker-finish', (p) => (p.buttonFinish === 'gloss' || p.buttonFinish === 'glow') && p.elevation === 'hard-shadow'],
  ['sheen-thin', (p) => p.displayTreatment === 'ink-gradient' && p.headingWeight < 500],
  ['purple-aurora', (p) => p.atmosphere === 'aurora' && p.theme === 'dark' && p.accentHue >= 265 && p.accentHue <= 315],
  ['dark-shadow', (p) => p.theme === 'dark' && (p.elevation === 'soft-shadow' || p.elevation === 'float')],
  ['cream-serif', (p) => p.fontHeading === 'fraunces' && p.neutralHue > 50 && p.neutralHue < 110 && p.neutralChroma > 0.008 && p.theme === 'light'],
  ['black-acid', (p) => p.theme === 'dark' && p.contrast > 0.8 && p.accentChroma > 0.17 && p.accentHue > 100 && p.accentHue < 160],
]);

/** Re-check the whole design after any change. Conflicts are flagged; the engine never changes a Decision because of one. */
export function conflicts(project: Project): Conflict[] {
  return CONFLICT_RULES.filter((rule) => CONFLICT_TESTS.get(rule.id)?.(project.params) === true).map((rule) => ({ id: rule.id, stepIds: rule.stepIds, message: rule.text }));
}

// ───────── Generated Directions: taste-constrained composition ─────────

/** A small seeded random generator (mulberry32), so that a seed always yields the same Directions. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** What each harmony rule changes in a generated design. The rule's text and source are Catalog records in `catalog/rules.ts`. */
export const HARMONY_FIXES = new Map<string, (out: DesignParams) => void>([
  ['painted-first-screen', (out) => {
    if (out.colorStrategy !== 'color-block') return;
    if (out.atmosphere === 'aurora' || out.atmosphere === 'spotlight' || out.atmosphere === 'horizon') out.atmosphere = 'plain';
    out.displayTreatment = 'solid';
  }],
  ['glow-on-light', (out) => {
    if (out.buttonFinish === 'glow' && out.theme === 'light') out.buttonFinish = 'gloss';
  }],
  ['sticker-owns-buttons', (out) => {
    if (out.elevation !== 'hard-shadow') return;
    out.buttonFinish = 'flat';
    out.borderWeight = Math.max(out.borderWeight, 2);
  }],
  ['dark-soft-shadow', (out) => {
    if (out.theme === 'dark' && (out.elevation === 'soft-shadow' || out.elevation === 'float')) out.elevation = 'tonal';
  }],
  ['thin-outline', (out) => {
    if (out.headingWeight < 600 && out.signature === 'outline-type') out.signature = 'marker';
  }],
  ['thin-sheen', (out) => {
    if (out.headingWeight < 500 && out.displayTreatment === 'ink-gradient') out.displayTreatment = 'solid';
  }],
  ['statement-headline', (out) => {
    if (out.hero === 'statement') out.emphasis = 'headline';
  }],
  ['narrow-page', (out) => {
    if (out.contentWidth !== 'narrow') return;
    if (out.hero === 'split-media') out.hero = 'text-left';
    if (out.nav === 'side-rail') out.contentWidth = 'standard';
    if (out.sections === 'bento' || out.sections === 'alternating') out.sections = 'stacked';
  }],
  ['capitals-restraint', (out) => {
    if (out.headingCase !== 'upper') return;
    out.scaleRatio = Math.min(out.scaleRatio, 1.3);
    if (out.hero === 'statement') out.hero = 'text-left';
  }],
  ['delicate-outline', (out) => {
    if (out.signature === 'outline-type' && DELICATE_FACES.has(out.fontHeading)) out.signature = 'marker';
  }],
  ['dense-motion', (out) => {
    if (out.density < 0.9 && out.motion === 'expressive') out.motion = 'subtle';
  }],
]);

/** Apply the harmony rules, in the order of their records, to a copy of a design. */
export function harmonize(p: DesignParams): DesignParams {
  const out = { ...p };
  for (const rule of HARMONY_RULES) HARMONY_FIXES.get(rule.id)?.(out);
  return out;
}

const CATEGORICAL: (keyof DesignParams)[] = ['nav', 'hero', 'sections', 'fontHeading', 'fontBody', 'colorStrategy', 'theme', 'elevation', 'signature', 'atmosphere', 'buttonFinish', 'displayTreatment'];

/** How different two designs are: categorical differences plus scaled numeric differences. */
export function designDistance(a: DesignParams, b: DesignParams): number {
  let dist = 0;
  for (const key of CATEGORICAL) if (a[key] !== b[key]) dist += 1;
  const hue = Math.abs(a.accentHue - b.accentHue);
  dist += Math.min(hue, 360 - hue) / 60;
  const radius = (v: number): number => Math.min(v, 28) / 28;
  dist += Math.abs(radius(a.radius) - radius(b.radius)) > 0.3 ? 0.5 : 0;
  dist += Math.abs(a.density - b.density) * 2;
  dist += Math.abs(a.headingWeight - b.headingWeight) / 400;
  return dist;
}

const labelFor = (stepId: string, params: DesignParams, fallback: string): string => {
  const step = findStep(stepId);
  const id = step ? matchingOptionId(params, step) : null;
  return step?.options.find((o) => o.id === id)?.label ?? fallback;
};

const STRATEGY_WORDS: Record<DesignParams['colorStrategy'], string> = {
  quiet: 'with color kept to small details',
  'single-accent': 'with one accent color',
  duo: 'with two colors',
  'tinted-surface': 'washed in its accent color',
  'color-block': 'with a first screen painted in its accent color',
};
const ATMOSPHERE_WORDS: Record<DesignParams['atmosphere'], string> = {
  plain: 'a plain background',
  horizon: 'a faint wash of color behind the first screen',
  'dot-grid': 'a faint grid of dots behind the first screen',
  'line-grid': 'a faint grid of lines behind the first screen',
  spotlight: 'a soft glow behind the first screen',
  aurora: 'soft clouds of color behind the first screen',
  grain: 'a fine film-grain texture',
};

/** A plain sentence that describes a design. Built from the design's final values, so it cannot disagree with them. */
export function describeDesign(params: DesignParams): string {
  return `A ${params.theme} page ${STRATEGY_WORDS[params.colorStrategy]} and ${ATMOSPHERE_WORDS[params.atmosphere]}.`;
}

const GENERATED_SOURCE = [{ text: 'Composed by the Studio at random from the Catalog’s Options, then adjusted by the harmony rules. Nobody has reviewed this combination.', basis: 'builder' as const }];

/**
 * Compose new Directions from the Catalog: one random Option per Step, adjusted by the harmony rules,
 * kept only if conflict-free, then chosen to be as different as possible from each other and from `avoid`.
 */
export function generateDirections(seed: number, count: number, avoid: DesignParams[] = []): Direction[] {
  const rand = seeded(seed);
  const candidates: DesignParams[] = [];
  for (let attempt = 0; attempt < count * 14 && candidates.length < count * 7; attempt++) {
    let project = createProject('generated');
    for (const step of STEPS) {
      // Options that carry an overused-look warning are chosen rarely.
      const weights = step.options.map((o) => (o.warn ? 0.12 : 1));
      const total = weights.reduce((x, y) => x + y, 0);
      let roll = rand() * total;
      let chosen = step.options[0]!;
      for (let i = 0; i < step.options.length; i++) {
        roll -= weights[i]!;
        if (roll <= 0) {
          chosen = step.options[i]!;
          break;
        }
      }
      project = pick(project, step.id, chosen.id, '1970-01-01T00:00:00.000Z');
    }
    const params = harmonize(project.params);
    if (conflicts({ ...project, params }).length > 0) continue;
    candidates.push(params);
  }
  const chosen: DesignParams[] = [];
  const reference = [...avoid];
  while (chosen.length < count && candidates.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;
    candidates.forEach((c, i) => {
      const score = reference.length === 0 ? 1 : Math.min(...reference.map((r) => designDistance(c, r)));
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });
    const [winner] = candidates.splice(bestIndex, 1);
    if (!winner) break;
    chosen.push(winner);
    reference.push(winner);
  }
  // Names come from the final values (after the harmony rules), and each name in a batch is distinct.
  const names = new Set<string>();
  return chosen.map((params, i) => {
    const parts = [labelFor('accent', params, 'Custom accent'), labelFor('typeface', params, 'custom typeface'), labelFor('elevation', params, 'custom depth')];
    let name = parts.join(' · ');
    for (const extra of [labelFor('hero', params, ''), labelFor('sections', params, '')]) {
      if (!names.has(name)) break;
      if (extra) name = `${name} · ${extra}`;
    }
    for (let n = 2; names.has(name); n++) name = `${parts.join(' · ')} (${n})`;
    names.add(name);
    return {
      id: `generated-${seed >>> 0}-${i}`,
      name,
      mood: describeDesign(params),
      bestFor: 'Nobody has reviewed this combination. Judge it by eye.',
      risk: 'A random combination can clash in ways that the rules did not foresee.',
      params,
      sources: GENERATED_SOURCE,
      evidence: 'expert-opinion',
      reviewed: null,
    };
  });
}

/** Tokens for the project's current state. */
export function projectTokens(project: Project): DerivedTokens {
  return deriveTokens(project.params, project.a11y);
}

export function nextStepId(stepId: string): string | null {
  const i = STEPS.findIndex((s) => s.id === stepId);
  return i >= 0 && i < STEPS.length - 1 ? (STEPS[i + 1]?.id ?? null) : null;
}

export function prevStepId(stepId: string): string | null {
  const i = STEPS.findIndex((s) => s.id === stepId);
  return i > 0 ? (STEPS[i - 1]?.id ?? null) : null;
}

export function firstOpenStepId(project: Project): string {
  return STEPS.find((s) => !project.decisions[s.id])?.id ?? STEPS[STEPS.length - 1]!.id;
}

// ───────── Saved projects: checked on the way in ─────────

// Zod can generate code at run time to parse faster. A strict Content Security Policy forbids that, and this project never needs it.
z.config({ jitless: true });

const shortText = z.string().max(600);
const paramShape: Record<string, z.ZodType> = {};
for (const [key, list] of Object.entries(PARAM_VALUES)) paramShape[key] = z.enum(list as unknown as [string, ...string[]]);
for (const [key, [min, max]] of Object.entries(PARAM_RANGES)) paramShape[key] = z.number().min(min).max(max);
const paramsSchema = z.object(paramShape);

const contentSchema = z.object({
  business: shortText, tag: shortText, headline: shortText, headlineEmphasis: shortText, lede: shortText,
  primaryAction: shortText, secondaryAction: shortText, phone: shortText,
  nav: z.array(shortText).max(12),
  servicesTitle: shortText, servicesIntro: shortText,
  services: z.array(z.object({ title: shortText, body: shortText })).max(12),
  facts: z.array(z.object({ value: shortText, label: shortText })).max(8),
  feesTitle: shortText,
  fees: z.array(z.object({ item: shortText, price: shortText })).max(12),
  aboutTitle: shortText, aboutBody: shortText, promise: shortText,
  contactTitle: shortText, contactBody: shortText, address: shortText, hours: shortText, footerNote: shortText,
});

const decisionSchema = z.object({
  stepId: z.string().max(60),
  optionId: z.string().max(60).nullable(),
  kind: z.enum(['picked', 'kept', 'tuned']),
  rejected: z.array(z.string().max(60)).max(40),
  values: paramsSchema.partial(),
  reason: z.string().max(600).optional(),
  at: z.string().max(40),
});

const projectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z.string().max(120),
  template: z.literal('small-business'),
  a11y: z.enum(A11Y_PROFILES),
  direction: z.string().max(60).nullable(),
  base: paramsSchema,
  params: paramsSchema,
  decisions: z.record(z.string().max(60), decisionSchema),
  content: contentSchema,
});

export type ParseResult =
  | { ok: true; project: Project; /** The older version the file was upgraded from, or `null`. */ migratedFrom: number | null; /** What the Studio adjusted so that the file matches this version's Catalog. */ notes: string[] }
  | { ok: false; error: string };

// Every message is fixed text. A message never repeats content from the file.
const NOT_A_PROJECT = 'This is not a Refraction project file.';
const NEWER_VERSION = 'A newer version of the Studio made this file, and this version cannot read it.';
const SECTIONS = ['name', 'template', 'a11y', 'direction', 'base', 'params', 'decisions', 'content'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const UNKNOWN_TIME = '1970-01-01T00:00:00.000Z';

/** Upgrade a version-1 file to the version-2 shape. The result still passes through the full check. */
function migrateV1(raw: Record<string, unknown>): unknown {
  // The earliest version-1 files lack the four finish values.
  const params = isRecord(raw['params']) ? { atmosphere: 'plain', buttonFinish: 'flat', displayTreatment: 'solid', motion: 'subtle', ...raw['params'] } : raw['params'];
  // Version 1 stored a Direction by its display name.
  const named = typeof raw['direction'] === 'string' ? raw['direction'] : null;
  const curated = named === null ? undefined : DIRECTIONS.find((d) => d.name === named);
  const direction = named === null ? null : (curated?.id ?? 'generated-0-0');
  const decisions: [string, unknown][] = [];
  if (isRecord(raw['decisions'])) {
    for (const [key, value] of Object.entries(raw['decisions'])) {
      if (!isRecord(value)) {
        decisions.push([key, value]);
        continue;
      }
      // "Skip: take the default" became "keep"; the reason field was never written in version 1.
      const { reason: _reason, ...rest } = value;
      const skipped = value['kind'] === 'defaulted';
      const upgraded = { ...rest, kind: skipped ? 'kept' : value['kind'], optionId: null, values: {}, ...(skipped ? { rejected: [] } : {}) };
      if (key === 'theme') {
        // Version 1 had one Step for "light or dark" and contrast together; version 2 has two.
        decisions.push(['theme', { ...upgraded, stepId: 'theme' }], ['contrast', { ...upgraded, stepId: 'contrast' }]);
      } else decisions.push([key, upgraded]);
    }
  }
  const content = isRecord(raw['content']) ? { feesTitle: SAMPLE_CONTENT.feesTitle, fees: SAMPLE_CONTENT.fees, ...raw['content'] } : raw['content'];
  return { ...raw, schemaVersion: SCHEMA_VERSION, direction, base: curated ? curated.params : params, params, decisions: isRecord(raw['decisions']) ? Object.fromEntries(decisions) : raw['decisions'], content };
}

/**
 * Bring a shape-checked project into line with this version's Catalog.
 * References are recomputed from the design values, which are the source of truth; nothing from the file is trusted as a reference.
 */
function normalize(data: z.infer<typeof projectSchema>): { project: Project; notes: string[] } {
  const params = data.params as unknown as DesignParams;
  const base = data.base as unknown as DesignParams;
  assertKnownParams(params);
  assertKnownParams(base);
  const notes: string[] = [];
  let dropped = 0;
  let relabelled = 0;
  const decisions: [string, Decision][] = [];
  for (const [key, d] of Object.entries(data.decisions)) {
    const step = findStep(key);
    if (!step) {
      dropped++;
      continue;
    }
    const optionIds = step.options.map((o) => o.id);
    const optionId = matchingOptionId(params, step);
    let kind: DecisionKind = d.kind;
    if (kind === 'picked' && optionId === null) {
      // The picked Option no longer exists in the Catalog, or its values changed. The values stay; the label changes.
      kind = 'tuned';
      relabelled++;
    }
    const rejected = kind === 'picked' ? optionIds.filter((id) => id !== optionId) : d.rejected.filter((id) => optionIds.includes(id) && id !== optionId);
    const reason = d.reason?.trim().slice(0, REASON_MAX);
    decisions.push([key, { stepId: key, optionId, kind, rejected, values: ownedValues(step, params), at: ISO_TIME.test(d.at) && !Number.isNaN(Date.parse(d.at)) ? d.at : UNKNOWN_TIME, ...(reason ? { reason } : {}) }]);
  }
  let direction = data.direction;
  if (direction !== null && !findDirection(direction) && !GENERATED_ID.test(direction)) {
    direction = 'generated-0-0';
    notes.push('The file named a Direction that this version of the Studio does not have. The design itself is unchanged.');
  }
  if (dropped > 0) notes.push(dropped === 1 ? 'One Decision in the file belongs to a Step that this version of the Studio does not have. It was left out.' : `${dropped} Decisions in the file belong to Steps that this version of the Studio does not have. They were left out.`);
  if (relabelled > 0) notes.push(relabelled === 1 ? 'One Decision named an Option that this version of the Catalog does not have. Its values were kept and it is now marked as hand-set.' : `${relabelled} Decisions named Options that this version of the Catalog does not have. Their values were kept and they are now marked as hand-set.`);
  const project: Project = { schemaVersion: SCHEMA_VERSION, name: data.name, template: data.template, a11y: data.a11y, direction, base, params, decisions: Object.fromEntries(decisions), content: data.content };
  return { project, notes };
}

/** Check a saved or imported project. Anything that does not match the format is refused; references to the Catalog are recomputed. */
export function parseProject(input: unknown): ParseResult {
  if (!isRecord(input)) return { ok: false, error: NOT_A_PROJECT };
  const version = input['schemaVersion'];
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return { ok: false, error: NOT_A_PROJECT };
  if (version > SCHEMA_VERSION) return { ok: false, error: NEWER_VERSION };
  const candidate = version === 1 ? migrateV1(input) : input;
  const result = projectSchema.safeParse(candidate);
  if (!result.success) {
    const head = result.error.issues[0]?.path[0];
    const section = SECTIONS.find((s) => s === head);
    return { ok: false, error: section ? `The file does not match the project format. The problem is in its "${section}" part.` : NOT_A_PROJECT };
  }
  try {
    const { project, notes } = normalize(result.data);
    return { ok: true, project, migratedFrom: version === SCHEMA_VERSION ? null : version, notes };
  } catch {
    return { ok: false, error: 'The file does not match the project format. The problem is in its design values.' };
  }
}
