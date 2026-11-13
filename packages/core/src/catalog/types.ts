import type { DesignParams } from '../params.js';
import type { MockupFocus } from '../templates/smallBusiness.js';

export type Stage = 'structure' | 'feel';

/** How strong the support for a Step's guidance is. */
export type Evidence = 'measured' | 'convention' | 'expert-opinion';

export interface Option {
  id: string;
  label: string;
  /** What this Option is, in plain words. */
  what: string;
  /** When to choose it. */
  chooseWhen: string;
  /** What can go wrong with it. */
  risk: string;
  /** A well-known product or system that works this way, if any. */
  exemplar?: string;
  /** A warning with a replacement, for choices that read as a default look. Warnings never forbid. */
  warn?: string;
  /** The parameter values this Option sets. */
  patch: Partial<DesignParams>;
  /** Values that depend on earlier Decisions (for example, a second hue relative to the accent hue). */
  derive?: (current: DesignParams) => Partial<DesignParams>;
}

/** A parameter that the owner can adjust by hand after picking ("fine-tune"). */
export interface Tunable {
  key: keyof DesignParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  /** Size of the nudge used by "Closer to this one". */
  nudge: number;
}

export interface Step {
  id: string;
  stage: Stage;
  /** A short name for lists. */
  name: string;
  /** The question the Step asks. */
  title: string;
  /** The design concept, explained for a person with no design vocabulary. */
  teach: string;
  /** The one thing that changes between the Options. */
  variable: string;
  /** The region of the Mockup where the change shows; previews open there. */
  focus: MockupFocus;
  options: Option[];
  defaultOptionId: string;
  tunables?: Tunable[];
  source: string;
  evidence: Evidence;
  reviewed: string;
}
