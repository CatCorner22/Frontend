// The engine: pure functions that turn picks into a project state. No React, no browser APIs.

import { z } from 'zod';
import { DIRECTION_BY_ID, type Direction } from './catalog/directions.js';
import { STEPS, STEP_BY_ID } from './catalog/steps.js';
import type { Option, Step } from './catalog/types.js';
import { DEFAULT_PARAMS, FONTS, type A11yProfile, type DesignParams } from './params.js';
import { SAMPLE_CONTENT, type SiteContent } from './templates/smallBusiness.js';
import { deriveTokens, type DerivedTokens } from './tokens.js';

export const SCHEMA_VERSION = 1;

export type DecisionKind = 'picked' | 'defaulted' | 'tuned';

export interface Decision {
  stepId: string;
  /** The Option that was picked or defaulted; for a hand-tuned Decision, the Option it started from. */
  optionId: string;
  kind: DecisionKind;
  /** The Options that were shown and not picked. */
  rejected: string[];
  /** The exact values this Decision set. */
  values: Partial<DesignParams>;
  reason?: string;
  at: string;
}

export interface Project {
  schemaVersion: number;
  name: string;
  template: 'small-business';
  a11y: A11yProfile;
  /** The Direction this project started from, if any. A generated Direction is recorded by its name. */
  direction: string | null;
  params: DesignParams;
  decisions: Record<string, Decision>;
  content: SiteContent;
}

export function createProject(name = 'Untitled project'): Project {
  return { schemaVersion: SCHEMA_VERSION, name, template: 'small-business', a11y: 'advise', direction: null, params: { ...DEFAULT_PARAMS }, decisions: {}, content: { ...SAMPLE_CONTENT } };
}

/** The parameter values an Option sets, given the current state. */
export function resolvePatch(option: Option, current: DesignParams): Partial<DesignParams> {
  return { ...option.patch, ...(option.derive ? option.derive(current) : {}) };
}

/** The parameters to preview an Option with: the current state plus that Option, and nothing else. */
export function previewParams(project: Project, option: Option): DesignParams {
  return { ...project.params, ...resolvePatch(option, project.params) };
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

/** Grayscale wireframe version of a design: structure stays, every Feel value resets. "Structure before decoration." */
export function wireframeParams(params: DesignParams): DesignParams {
  return { ...params, ...WIREFRAME };
}

/**
 * Start from a Direction: every parameter is set at once, and earlier Decisions are cleared,
 * because they described a different design. The Steps then refine the Direction one variable at a time.
 */
export function applyDirection(project: Project, direction: Direction | string): Project {
  const found = typeof direction === 'string' ? DIRECTION_BY_ID[direction] : direction;
  if (!found) throw new Error(`Unknown Direction "${String(direction)}"`);
  return { ...project, direction: found.name, params: { ...found.params }, decisions: {} };
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

/** Harmony rules: adjustments that keep a random combination coherent. */
function harmonize(p: DesignParams): DesignParams {
  const out = { ...p };
  // A painted first screen is already loud: keep its background and headline plain.
  if (out.colorStrategy === 'color-block') {
    if (out.atmosphere === 'aurora' || out.atmosphere === 'spotlight' || out.atmosphere === 'horizon') out.atmosphere = 'plain';
    out.displayTreatment = 'solid';
  }
  // Glow reads on dark pages; on light pages gloss does the same job.
  if (out.buttonFinish === 'glow' && out.theme === 'light') out.buttonFinish = 'gloss';
  // The sticker look owns its buttons and wants thick lines.
  if (out.elevation === 'hard-shadow') {
    out.buttonFinish = 'flat';
    out.borderWeight = Math.max(out.borderWeight, 2);
  }
  // Shadows vanish on dark pages.
  if (out.theme === 'dark' && (out.elevation === 'soft-shadow' || out.elevation === 'float')) out.elevation = 'tonal';
  // Thin headings cannot carry an outline or a sheen.
  if (out.headingWeight < 600 && out.signature === 'outline-type') out.signature = 'marker';
  if (out.headingWeight < 500 && out.displayTreatment === 'ink-gradient') out.displayTreatment = 'solid';
  // The statement opening exists for the headline.
  if (out.hero === 'statement') out.emphasis = 'headline';
  // A narrow page has no room for side-by-side text and photo, or for a side rail.
  if (out.contentWidth === 'narrow') {
    if (out.hero === 'split-media') out.hero = 'text-left';
    if (out.nav === 'side-rail') out.contentWidth = 'standard';
    if (out.sections === 'bento' || out.sections === 'alternating') out.sections = 'stacked';
  }
  // Capitals need restraint: no dramatic scale, no statement opening.
  if (out.headingCase === 'upper') {
    out.scaleRatio = Math.min(out.scaleRatio, 1.3);
    if (out.hero === 'statement') out.hero = 'text-left';
  }
  // An outlined phrase needs sturdy letterforms; delicate serifs break apart.
  if (out.signature === 'outline-type' && DELICATE_FACES.has(out.fontHeading)) out.signature = 'marker';
  // Dense tools do not animate entrances.
  if (out.density < 0.9 && out.motion === 'expressive') out.motion = 'subtle';
  return out;
}

const DELICATE_FACES = new Set<string>(['playfair-display', 'newsreader', 'fraunces', 'source-serif-4', 'system-serif']);

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

/**
 * Compose new Directions from the Catalog: one random Option per Step, adjusted by the harmony rules,
 * kept only if conflict-free, then chosen to be as different as possible from each other and from `avoid`.
 */
export function generateDirections(seed: number, count: number, avoid: DesignParams[] = []): Direction[] {
  const rand = seeded(seed);
  const candidates: { params: DesignParams; labels: Record<string, string> }[] = [];
  for (let attempt = 0; attempt < count * 14 && candidates.length < count * 7; attempt++) {
    let project = createProject('generated');
    const labels: Record<string, string> = {};
    for (const step of STEPS) {
      // Options that carry an AI-default warning are chosen rarely.
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
      project = pick(project, step.id, chosen.id, '');
      labels[step.id] = chosen.label;
    }
    const params = harmonize(project.params);
    if (conflicts({ ...project, params }).length > 0) continue;
    candidates.push({ params, labels });
  }
  const chosen: { params: DesignParams; labels: Record<string, string> }[] = [];
  const reference = [...avoid];
  while (chosen.length < count && candidates.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;
    candidates.forEach((c, i) => {
      const score = reference.length === 0 ? 1 : Math.min(...reference.map((r) => designDistance(c.params, r)));
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });
    const [winner] = candidates.splice(bestIndex, 1);
    if (!winner) break;
    chosen.push(winner);
    reference.push(winner.params);
  }
  return chosen.map((c, i) => ({
    id: `generated-${seed}-${i}`,
    name: `${c.labels['accent'] ?? 'Custom'} · ${c.labels['typeface'] ?? ''} · ${c.labels['elevation'] ?? ''}`.replace(/\s+·\s+$/, ''),
    mood: `${c.params.theme === 'dark' ? 'Dark' : 'Light'} page, ${(c.labels['color-strategy'] ?? '').toLowerCase()} color, ${(c.labels['atmosphere'] ?? '').toLowerCase()} background.`,
    bestFor: 'Composed from the Catalog under the harmony rules. Judge it by eye.',
    risk: 'A generated combination has not been reviewed by a person.',
    params: c.params,
  }));
}

function decide(project: Project, step: Step, option: Option, kind: DecisionKind, now: string): Project {
  const values = resolvePatch(option, project.params);
  const decision: Decision = { stepId: step.id, optionId: option.id, kind, rejected: step.options.filter((o) => o.id !== option.id).map((o) => o.id), values, at: now };
  return { ...project, params: { ...project.params, ...values }, decisions: { ...project.decisions, [step.id]: decision } };
}

/** Pick an Option for a Step. */
export function pick(project: Project, stepId: string, optionId: string, now = new Date().toISOString()): Project {
  const step = mustStep(stepId);
  const option = step.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Step "${stepId}" has no Option "${optionId}"`);
  return decide(project, step, option, 'picked', now);
}

/** Pick a generated Option (from "Closer to this one"). It is recorded as a hand-tuned Decision based on `baseOptionId`. */
export function pickValues(project: Project, stepId: string, baseOptionId: string, values: Partial<DesignParams>, now = new Date().toISOString()): Project {
  const step = mustStep(stepId);
  const decision: Decision = { stepId, optionId: baseOptionId, kind: 'tuned', rejected: step.options.filter((o) => o.id !== baseOptionId).map((o) => o.id), values, at: now };
  return { ...project, params: { ...project.params, ...values }, decisions: { ...project.decisions, [stepId]: decision } };
}

/** Skip a Step: take its default Option and record the Decision as defaulted. */
export function skip(project: Project, stepId: string, now = new Date().toISOString()): Project {
  const step = mustStep(stepId);
  const option = step.options.find((o) => o.id === step.defaultOptionId);
  if (!option) throw new Error(`Step "${stepId}" has no default Option`);
  return decide(project, step, option, 'defaulted', now);
}

/** Fine-tune one parameter by hand. The Step's Decision becomes "tuned". */
export function tune(project: Project, stepId: string, key: keyof DesignParams, value: number, now = new Date().toISOString()): Project {
  const step = mustStep(stepId);
  const tunable = step.tunables?.find((t) => t.key === key);
  if (!tunable) throw new Error(`Step "${stepId}" has no adjustable value "${String(key)}"`);
  const clamped = Math.min(tunable.max, Math.max(tunable.min, value));
  const previous = project.decisions[stepId];
  const values = { ...(previous?.values ?? {}), [key]: clamped } as Partial<DesignParams>;
  const decision: Decision = { stepId, optionId: previous?.optionId ?? step.defaultOptionId, kind: 'tuned', rejected: previous?.rejected ?? [], values, at: now };
  return { ...project, params: { ...project.params, [key]: clamped }, decisions: { ...project.decisions, [stepId]: decision } };
}

function mustStep(stepId: string): Step {
  const step = STEP_BY_ID[stepId];
  if (!step) throw new Error(`Unknown Step "${stepId}"`);
  return step;
}

export interface GeneratedOption {
  id: string;
  label: string;
  values: Partial<DesignParams>;
}

/**
 * "Closer to this one": new Options near the current values of a Step, made by nudging its adjustable values.
 * `round` shrinks the nudge, so repeated use narrows in.
 */
export function closerOptions(project: Project, stepId: string, round = 0): GeneratedOption[] {
  const step = mustStep(stepId);
  const tunables = step.tunables ?? [];
  if (tunables.length === 0) return [];
  const shrink = 1 / (1 + round * 0.6);
  const out: GeneratedOption[] = [];
  const wrapHue = (key: string, v: number, min: number, max: number): number => (key.toLowerCase().includes('hue') ? ((v % 360) + 360) % 360 : Math.min(max, Math.max(min, v)));
  const describe = (delta: number): string => (delta > 0 ? 'more' : 'less');
  for (const t of tunables) {
    const current = project.params[t.key] as number;
    for (const dir of [-1, 1]) {
      const raw = current + dir * t.nudge * shrink;
      const value = Number(wrapHue(String(t.key), raw, t.min, t.max).toFixed(4));
      if (value === current) continue;
      out.push({ id: `${String(t.key)}${dir > 0 ? '+' : '-'}`, label: `${t.label}: ${describe(dir)}`, values: { [t.key]: value } as Partial<DesignParams> });
    }
  }
  if (tunables.length >= 2) {
    const [a, b] = tunables as [typeof tunables[0], typeof tunables[0]];
    for (const dir of [-1, 1]) {
      const va = Number(wrapHue(String(a.key), (project.params[a.key] as number) + dir * a.nudge * shrink, a.min, a.max).toFixed(4));
      const vb = Number(wrapHue(String(b.key), (project.params[b.key] as number) - dir * b.nudge * shrink, b.min, b.max).toFixed(4));
      out.push({ id: `mix${dir > 0 ? '+' : '-'}`, label: `${a.label} ${describe(dir)}, ${b.label.toLowerCase()} ${describe(-dir)}`, values: { [a.key]: va, [b.key]: vb } as Partial<DesignParams> });
    }
  }
  return out.slice(0, 6);
}

export interface Conflict {
  id: string;
  stepIds: string[];
  message: string;
}

/** Re-check the whole design after any change. Conflicts are flagged; the engine never changes a Decision silently. */
export function conflicts(project: Project): Conflict[] {
  const p = project.params;
  const out: Conflict[] = [];
  if (p.signature === 'outline-type' && p.headingWeight < 600) out.push({ id: 'outline-thin', stepIds: ['signature', 'heading-treatment'], message: 'An outlined phrase needs a heavy heading weight to stay readable. Raise the weight to 600 or more, or choose another signature.' });
  if (p.signature === 'marker' && p.colorStrategy === 'quiet' && p.accentChroma < 0.05) out.push({ id: 'marker-gray', stepIds: ['signature', 'accent'], message: 'The marker highlight uses the accent color, and the accent is nearly gray, so the highlight will barely show.' });
  if (p.hero === 'statement' && p.emphasis !== 'headline') out.push({ id: 'statement-emphasis', stepIds: ['hero', 'emphasis'], message: 'The statement opening exists to make the headline dominant, but another element is set to be found first. The two picks pull against each other.' });
  if (p.numerals === 'mono' && p.fontHeading === 'jetbrains-mono') out.push({ id: 'mono-mono', stepIds: ['numerals', 'typeface'], message: 'Monospace numbers have no effect when the headings are already monospace.' });
  if (p.contentWidth === 'narrow' && p.hero === 'split-media') out.push({ id: 'narrow-split', stepIds: ['content-width', 'hero'], message: 'A narrow page leaves too little room for text and a photo side by side. Choose a wider page, or an opening without the photo.' });
  if (p.headingCase === 'upper' && p.scaleRatio > 1.34) out.push({ id: 'caps-dramatic', stepIds: ['heading-treatment', 'size-scale'], message: 'Capital letters at a dramatic size fill the screen and are slow to read. Choose a calmer size jump, or sentence case.' });
  if (p.signature === 'outline-type' && DELICATE_FACES.has(p.fontHeading)) out.push({ id: 'outline-delicate', stepIds: ['signature', 'typeface'], message: 'An outlined phrase breaks apart in a delicate serif. Choose a sturdy sans-serif heading, or the marker highlight.' });
  if ((p.buttonFinish === 'gloss' || p.buttonFinish === 'glow') && p.elevation === 'hard-shadow') out.push({ id: 'sticker-finish', stepIds: ['button-finish', 'elevation'], message: 'The hard offset shadow gives buttons a sticker edge, which replaces the gloss or glow. Choose a flat button, or a different way of separating boxes.' });
  if (p.displayTreatment === 'ink-gradient' && p.headingWeight < 500) out.push({ id: 'sheen-thin', stepIds: ['display-treatment', 'heading-treatment'], message: 'The ink sheen barely shows on thin headings. Raise the heading weight, or keep the headline solid.' });
  if (p.atmosphere === 'aurora' && p.theme === 'dark' && p.accentHue >= 265 && p.accentHue <= 315) out.push({ id: 'purple-aurora', stepIds: ['atmosphere', 'accent'], message: 'A purple aurora on a dark page is the most recognizable AI-default background. Another accent hue, or the spotlight, will set it apart.' });
  if (p.theme === 'dark' && (p.elevation === 'soft-shadow' || p.elevation === 'float')) out.push({ id: 'dark-shadow', stepIds: ['theme', 'elevation'], message: 'Shadows are nearly invisible on dark pages. Tonal surfaces or lines separate boxes better in a dark theme.' });
  if (p.fontHeading === 'fraunces' && p.neutralHue > 50 && p.neutralHue < 110 && p.neutralChroma > 0.008 && p.theme === 'light') out.push({ id: 'cream-serif', stepIds: ['typeface', 'neutral'], message: 'A warm serif on a cream page is a recognizable AI-default look. A bolder accent, a cooler neutral, or a color-block strategy will set it apart.' });
  if (p.theme === 'dark' && p.contrast > 0.8 && p.accentChroma > 0.17 && p.accentHue > 100 && p.accentHue < 160) out.push({ id: 'black-acid', stepIds: ['theme', 'accent'], message: 'Near-black with one acid-green accent is a recognizable AI-default look.' });
  return out;
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

// ───────── Saved projects: validated on the way in ─────────

const fontIds = Object.keys(FONTS) as [keyof typeof FONTS, ...(keyof typeof FONTS)[]];
const num = (min: number, max: number) => z.number().finite().min(min).max(max);
const shortText = z.string().max(600);

const paramsSchema = z.object({
  nav: z.enum(['top-inline', 'top-centered', 'split-cta', 'side-rail']),
  hero: z.enum(['text-left', 'centered', 'split-media', 'statement']),
  sections: z.enum(['stacked', 'alternating', 'grid', 'ledger', 'bento']),
  contentWidth: z.enum(['narrow', 'standard', 'wide']),
  emphasis: z.enum(['headline', 'action', 'proof']),
  density: num(0.5, 2),
  fontHeading: z.enum(fontIds),
  fontBody: z.enum(fontIds),
  headingWeight: num(100, 900),
  headingTracking: num(-0.2, 0.4),
  headingCase: z.enum(['sentence', 'title', 'upper']),
  baseSize: num(10, 30),
  scaleRatio: num(1, 2),
  numerals: z.enum(['proportional', 'tabular', 'mono']),
  neutralHue: num(0, 360),
  neutralChroma: num(0, 0.1),
  accentHue: num(0, 360),
  accentChroma: num(0, 0.4),
  accentLightness: num(0, 1),
  accent2Hue: num(0, 360),
  colorStrategy: z.enum(['quiet', 'single-accent', 'duo', 'tinted-surface', 'color-block']),
  theme: z.enum(['light', 'dark']),
  contrast: num(0, 1),
  radius: num(0, 999),
  elevation: z.enum(['flat', 'borders', 'ring', 'soft-shadow', 'float', 'hard-shadow', 'tonal', 'glass']),
  borderWeight: num(0, 8),
  signature: z.enum(['none', 'marker', 'big-numerals', 'color-band', 'outline-type', 'corner-tag']),
  atmosphere: z.enum(['plain', 'horizon', 'dot-grid', 'line-grid', 'spotlight', 'aurora', 'grain']),
  buttonFinish: z.enum(['flat', 'gloss', 'glow', 'outline', 'soft']),
  displayTreatment: z.enum(['solid', 'ink-gradient', 'accent-gradient']),
  motion: z.enum(['none', 'subtle', 'expressive']),
});

const contentSchema = z.object({
  business: shortText, tag: shortText, headline: shortText, headlineEmphasis: shortText, lede: shortText,
  primaryAction: shortText, secondaryAction: shortText, phone: shortText,
  nav: z.array(shortText).max(12),
  servicesTitle: shortText, servicesIntro: shortText,
  services: z.array(z.object({ title: shortText, body: shortText })).max(12),
  facts: z.array(z.object({ value: shortText, label: shortText })).max(8),
  aboutTitle: shortText, aboutBody: shortText, promise: shortText,
  contactTitle: shortText, contactBody: shortText, address: shortText, hours: shortText, footerNote: shortText,
});

const decisionSchema = z.object({
  stepId: z.string().max(60),
  optionId: z.string().max(60),
  kind: z.enum(['picked', 'defaulted', 'tuned']),
  rejected: z.array(z.string().max(60)).max(40),
  values: paramsSchema.partial(),
  reason: z.string().max(600).optional(),
  at: z.string().max(40),
});

const projectSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  name: z.string().max(120),
  template: z.literal('small-business'),
  a11y: z.enum(['off', 'advise', 'enforce']),
  direction: z.string().max(120).nullable(),
  params: paramsSchema,
  decisions: z.record(z.string().max(60), decisionSchema),
  content: contentSchema,
});

export type ParseResult = { ok: true; project: Project } | { ok: false; error: string };

/** Validate a saved or imported project. Anything that does not match the schema is rejected. */
export function parseProject(input: unknown): ParseResult {
  const result = projectSchema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    return { ok: false, error: first ? `${first.path.join('.') || 'file'}: ${first.message}` : 'The file does not match the project format.' };
  }
  const unknownSteps = Object.keys(result.data.decisions).filter((id) => !STEP_BY_ID[id]);
  if (unknownSteps.length > 0) return { ok: false, error: `Unknown Step in file: ${unknownSteps[0]}` };
  return { ok: true, project: result.data as Project };
}
