import { z } from 'zod';
import { DIRECTIONS, type Direction } from './catalog/directions.js';
import { currentFonts, describeDesign, withinReach } from './engine.js';
import { assertKnownParams, type DesignParams } from './params.js';
import { plainName } from './text.js';

/**
 * A Direction of the owner's own: a design that the owner kept under a name, to start later projects from (PLAN.md section
 * 4.7; SPEC.md section 2.3). It is composed from values that the Steps and sliders can already set. It carries no source
 * and no evidence grade: nobody reviewed it, and the Studio says so wherever it shows one.
 */
export interface OwnDirection {
  id: string;
  name: string;
  /** The mood in plain words; the Studio proposes it from the design's values when the owner writes none. */
  mood: string;
  bestFor: string;
  /** What to watch for. */
  risk: string;
  params: DesignParams;
  /** When the owner kept it, as an ISO time. */
  madeAt: string;
}

export const OWN_NAME_MAX = 60;
export const OWN_TEXT_MAX = 200;
/** The most Directions that one file may hold; a larger file is not one of the Studio's. */
const OWN_FILE_MAX = 500;
const OWN_FILE_KIND = 'refraction-own-directions';
const OWN_FILE_VERSION = 1;
const OWN_ID = /^own-[0-9a-z]{4,24}$/;

export const isOwnDirectionId = (id: string): boolean => OWN_ID.test(id);

export type OwnDirectionResult = { ok: true; direction: OwnDirection } | { ok: false; error: string };

const sameName = (a: string, b: string): boolean => a.toLocaleLowerCase() === b.toLocaleLowerCase();

/**
 * Make the record from what the owner typed and from a design. Names and texts are cleaned like a project name (they enter
 * the Studio's own sentences) and cut at their limits. `takenNames` are the names of the owner's other Directions; the
 * built-in names are always taken.
 */
export function makeOwnDirection(draft: OwnDirection, takenNames: readonly string[]): OwnDirectionResult {
  if (!isOwnDirectionId(draft.id)) return { ok: false, error: 'The Direction has no identifier that the Studio can use.' };
  const name = plainName(draft.name, OWN_NAME_MAX);
  if (name === '') return { ok: false, error: 'Give the Direction a name.' };
  if ([...DIRECTIONS.map((d) => d.name), ...takenNames].some((taken) => sameName(taken, name))) return { ok: false, error: `Another Direction already has the name “${name}”. Choose another name.` };
  let params: DesignParams;
  try {
    assertKnownParams(draft.params);
    params = withinReach({ ...draft.params }).params;
  } catch {
    return { ok: false, error: 'The design holds a value that this version of the Studio does not know.' };
  }
  const text = (value: string): string => plainName(value, OWN_TEXT_MAX);
  return { ok: true, direction: { id: draft.id, name, mood: text(draft.mood) || describeDesign(params), bestFor: text(draft.bestFor), risk: text(draft.risk), params, madeAt: draft.madeAt } };
}

/** The record in the form that the engine starts a project from. No source, no review, and no group of the built-in ones. */
export function asDirection(own: OwnDirection): Direction {
  return { id: own.id, group: null, name: own.name, mood: own.mood, bestFor: own.bestFor, risk: own.risk, params: own.params, sources: [], evidence: 'expert-opinion', reviewed: null };
}

/** Every own Direction as one file: for the download, and for the entry in the browser's storage. */
export function ownDirectionsFile(directions: readonly OwnDirection[]): { kind: string; version: number; directions: OwnDirection[] } {
  return { kind: OWN_FILE_KIND, version: OWN_FILE_VERSION, directions: [...directions] };
}

const entrySchema = z.object({ id: z.string(), name: z.string(), mood: z.string(), bestFor: z.string(), risk: z.string(), params: z.record(z.string(), z.unknown()), madeAt: z.string().max(40) });

export type OwnDirectionsRead = { ok: true; added: OwnDirection[]; notes: string[] } | { ok: false; error: string };

const count = (n: number): string => (n === 1 ? '1 was' : `${n} were`);

/**
 * Read a file of own Directions (or the entry in storage). Returns the Directions that `held` lacks. An entry that cannot
 * stand is left out, and a note says how many and why; a message never repeats content from the file.
 */
export function readOwnDirections(input: unknown, held: readonly OwnDirection[]): OwnDirectionsRead {
  const NOT_A_FILE = { ok: false as const, error: 'This is not a file of your own Directions.' };
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return NOT_A_FILE;
  const file = input as Record<string, unknown>;
  if (file['kind'] !== OWN_FILE_KIND || typeof file['version'] !== 'number') return NOT_A_FILE;
  if (file['version'] > OWN_FILE_VERSION) return { ok: false, error: 'A newer version of the Studio made this file, and this version cannot read it.' };
  const entries = file['directions'];
  if (!Array.isArray(entries) || entries.length > OWN_FILE_MAX) return NOT_A_FILE;

  const added: OwnDirection[] = [];
  let alreadyHere = 0;
  let nameInUse = 0;
  let unreadable = 0;
  for (const entry of entries) {
    const parsed = entrySchema.safeParse(entry);
    if (!parsed.success) {
      unreadable++;
      continue;
    }
    const all = [...held, ...added];
    const params = currentFonts(parsed.data.params) as unknown as DesignParams;
    if (all.some((d) => d.id === parsed.data.id)) {
      alreadyHere++;
      continue;
    }
    const result = makeOwnDirection({ ...parsed.data, params }, all.map((d) => d.name));
    if (result.ok) added.push(result.direction);
    else if (result.error.startsWith('Another Direction')) nameInUse++;
    else unreadable++;
  }
  const notes: string[] = [];
  if (added.length > 0) notes.push(`Added ${added.length} ${added.length === 1 ? 'Direction' : 'Directions'} of your own.`);
  else if (alreadyHere > 0 && nameInUse + unreadable === 0) return { ok: true, added, notes: ['Added none: this browser already holds every Direction in the file.'] };
  else notes.push('Added none.');
  if (alreadyHere > 0) notes.push(`${count(alreadyHere)} left out: this browser already holds it.`);
  if (nameInUse > 0) notes.push(`${count(nameInUse)} left out: another Direction already has its name.`);
  if (unreadable > 0) notes.push(`${count(unreadable)} left out: the Studio could not read them.`);
  return { ok: true, added, notes };
}
