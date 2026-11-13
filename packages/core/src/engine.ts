// The engine: pure functions that turn picks into a project state. No React, no browser APIs.

import { z } from 'zod';
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
  params: DesignParams;
  decisions: Record<string, Decision>;
  content: SiteContent;
}

export function createProject(name = 'Untitled project'): Project {
  return { schemaVersion: SCHEMA_VERSION, name, template: 'small-business', a11y: 'advise', params: { ...DEFAULT_PARAMS }, decisions: {}, content: { ...SAMPLE_CONTENT } };
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
};

/** Grayscale wireframe version of a design: structure stays, every Feel value resets. "Structure before decoration." */
export function wireframeParams(params: DesignParams): DesignParams {
  return { ...params, ...WIREFRAME };
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
  if (p.elevation === 'hard-shadow' && p.radius >= 999) out.push({ id: 'hard-pill', stepIds: ['elevation', 'radius'], message: 'A hard offset shadow under pill-shaped buttons looks detached. Consider a radius of 14 px or less, or a soft shadow.' });
  if (p.signature === 'outline-type' && p.headingWeight < 600) out.push({ id: 'outline-thin', stepIds: ['signature', 'heading-treatment'], message: 'An outlined phrase needs a heavy heading weight to stay readable. Raise the weight to 600 or more, or choose another signature.' });
  if (p.signature === 'marker' && p.colorStrategy === 'quiet' && p.accentChroma < 0.05) out.push({ id: 'marker-gray', stepIds: ['signature', 'accent'], message: 'The marker highlight uses the accent color, and the accent is nearly gray, so the highlight will barely show.' });
  if (p.hero === 'statement' && p.emphasis !== 'headline') out.push({ id: 'statement-emphasis', stepIds: ['hero', 'emphasis'], message: 'The statement opening exists to make the headline dominant, but another element is set to be found first. The two picks pull against each other.' });
  if (p.numerals === 'mono' && p.fontHeading === 'jetbrains-mono') out.push({ id: 'mono-mono', stepIds: ['numerals', 'typeface'], message: 'Monospace numbers have no effect when the headings are already monospace.' });
  if (p.theme === 'dark' && p.elevation === 'soft-shadow') out.push({ id: 'dark-shadow', stepIds: ['theme', 'elevation'], message: 'Shadows are nearly invisible on dark pages. Tonal surfaces or lines separate boxes better in a dark theme.' });
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
  sections: z.enum(['stacked', 'alternating', 'grid', 'ledger']),
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
  elevation: z.enum(['flat', 'borders', 'soft-shadow', 'hard-shadow', 'tonal']),
  borderWeight: num(0, 8),
  signature: z.enum(['none', 'marker', 'big-numerals', 'color-band', 'outline-type', 'corner-tag']),
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
