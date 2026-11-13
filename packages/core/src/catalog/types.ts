import type { DesignParams } from '../params.js';
import type { MockupFocus } from '../templates/smallBusiness.js';

export type Stage = 'structure' | 'feel';

/** How strong the support for a record's guidance is. */
export type Evidence = 'measured' | 'convention' | 'expert-opinion';
export const EVIDENCE_GRADES: readonly Evidence[] = ['measured', 'convention', 'expert-opinion'];

/**
 * How the project knows a source. Hard rule 13 requires the Catalog to say so when a claim rests on a snippet.
 * - `read`: a person-readable source that the builder or a research helper read itself (a page, a file, source code).
 * - `abstract`: only the abstract or summary of a study was read, not the study.
 * - `snippet`: seen only as a search-result snippet or in a third party's summary.
 * - `owner-file`: taken from the owner's own files; not checked against an original source.
 * - `builder`: the builder's own judgment or general knowledge; no source was consulted.
 */
export type SourceBasis = 'read' | 'abstract' | 'snippet' | 'owner-file' | 'builder';
export const SOURCE_BASES: readonly SourceBasis[] = ['read', 'abstract', 'snippet', 'owner-file', 'builder'];

export interface SourceRef {
  /** What the source is and what it supports, in plain words. */
  text: string;
  basis: SourceBasis;
  /** The file in this repository that documents the reading. Required for every basis except `builder`. */
  record?: string;
}

/** A system or product that works the way an Option does. Allowed only when a record in this repository supports it. */
export interface Exemplar {
  text: string;
  record: string;
}

/** A warning for a choice that reads as a default look. A warning never forbids; it names a replacement. */
export interface OptionWarning {
  text: string;
  source: SourceRef;
}

/** A hue that follows another hue: `key` equals `from` turned by `turn` degrees on the color wheel. */
export interface DerivedHue {
  key: 'accent2Hue';
  from: 'accentHue';
  turn: number;
}

/**
 * One of the concrete choices that a Step offers.
 * An Option inherits its Step's sources, evidence grade, and review date; its exemplar and its warning carry their own.
 */
export interface Option {
  id: string;
  label: string;
  /** What this Option is, in plain words. */
  what: string;
  /** When to choose it. */
  chooseWhen: string;
  /** What can go wrong with it. */
  risk: string;
  exemplar?: Exemplar;
  warn?: OptionWarning;
  /** The parameter values this Option sets. */
  patch: Partial<DesignParams>;
  /** A value that follows an earlier Decision. The engine recomputes it whenever its input changes. */
  derive?: DerivedHue;
  /** The region of the Mockup where this Option's change shows, when it differs from the Step's region. */
  focus?: MockupFocus;
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
  /** Words for a move down and a move up, for example "cooler" and "warmer". Defaults to "less" and "more". */
  directions?: [string, string];
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
  /** The design parameters this Step owns. No other Step sets them. */
  owns: (keyof DesignParams)[];
  /** The region of the Mockup where the change shows; previews open there. */
  focus: MockupFocus;
  /**
   * How the small pictures on the cards are made, when the whole page shrunk to card size would hide the change.
   * `width`: the width at which the Mockup is drawn before it is shrunk (a narrow width enlarges details).
   * `note`: what to tell the owner when a still picture cannot show the difference at all.
   */
  thumb?: { width?: number; note?: string };
  options: Option[];
  /** The Option that a plain, undecorated start uses. */
  defaultOptionId: string;
  tunables?: Tunable[];
  sources: SourceRef[];
  evidence: Evidence;
  /** The date of the last review, as YYYY-MM-DD. */
  reviewed: string;
}

/**
 * A rule about how two or more Decisions fit together.
 * A conflict rule flags a clash and never changes a Decision.
 * A harmony rule adjusts a generated Direction (never the owner's own Decisions) so that a random combination stays coherent.
 */
export interface RuleRecord {
  id: string;
  kind: 'conflict' | 'harmony';
  /** The Steps involved. */
  stepIds: string[];
  /** For a conflict rule: the message shown to the owner. For a harmony rule: what the rule does and why. */
  text: string;
  source: SourceRef;
  evidence: Evidence;
  reviewed: string;
}
