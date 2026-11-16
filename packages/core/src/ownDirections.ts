import { z } from 'zod';
import { DIRECTIONS, isOwnDirectionId, type Direction } from './catalog/directions.js';
import { currentFonts, describeDesign, withinReach } from './engine.js';
import { DEFAULT_PARAMS, assertKnownParams, type DesignParams } from './params.js';
import { plainName, sameName } from './text.js';

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
/**
 * The most own Directions that the Studio holds. Every card draws a live preview, and 500 of them took the Directions screen
 * about 10 seconds to open (finding S6-08). What the Studio writes it must be able to read again, so the same number binds
 * the form, a file, and the entry in storage (finding S6-03: at 501 the Studio refused its own list).
 */
export const OWN_MAX = 100;
/** The most entries that one file may hold; a larger file is not one of the Studio's. */
const OWN_FILE_MAX = 500;
/** A date as the Studio writes it. */
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const OWN_FILE_KIND = 'refraction-own-directions';
const OWN_FILE_VERSION = 1;

export type OwnDirectionResult = { ok: true; direction: OwnDirection } | { ok: false; error: string };

/**
 * Make the record from what the owner typed and from a design. Names and texts are cleaned like a project name (they enter
 * the Studio's own sentences) and cut at their limits. `takenNames` are the names of the owner's other Directions; the
 * built-in names are always taken.
 */
export function makeOwnDirection(draft: OwnDirection, takenNames: readonly string[]): OwnDirectionResult {
  if (!isOwnDirectionId(draft.id)) return { ok: false, error: 'The Direction has no identifier that the Studio can use.' };
  if (!ISO_TIME.test(draft.madeAt) || Number.isNaN(Date.parse(draft.madeAt))) return { ok: false, error: 'The Direction has no date that the Studio can read.' };
  // Trimmed after the cut: a name that ends on a space would pass as a second name beside the same name without it (finding S6-04).
  const name = plainName(draft.name, OWN_NAME_MAX).trim();
  if (name === '') return { ok: false, error: 'Give the Direction a name.' };
  if ([...DIRECTIONS.map((d) => d.name), ...takenNames].some((taken) => sameName(taken, name))) return { ok: false, error: `Another Direction already has the name “${name}”. Choose another name.` };
  let params: DesignParams;
  try {
    // The known values and nothing else: whatever else a file holds under "params" stays behind (finding S6-02).
    const given = draft.params as unknown as Record<string, unknown>;
    const known = Object.fromEntries(Object.keys(DEFAULT_PARAMS).map((key) => [key, Object.hasOwn(given, key) ? given[key] : undefined])) as unknown as DesignParams;
    assertKnownParams(known);
    params = withinReach(known).params;
  } catch {
    return { ok: false, error: 'The design holds a value that this version of the Studio does not know.' };
  }
  const text = (value: string): string => plainName(value, OWN_TEXT_MAX).trim();
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
  let overLimit = 0;
  let swapped = 0;
  for (const entry of entries) {
    const parsed = entrySchema.safeParse(entry);
    if (!parsed.success) {
      unreadable++;
      continue;
    }
    const all = [...held, ...added];
    const retired = new Set<string>();
    const params = currentFonts(parsed.data.params, retired) as unknown as DesignParams;
    if (all.some((d) => d.id === parsed.data.id)) {
      alreadyHere++;
      continue;
    }
    if (all.length >= OWN_MAX) {
      overLimit++;
      continue;
    }
    const result = makeOwnDirection({ ...parsed.data, params }, all.map((d) => d.name));
    if (result.ok) {
      added.push(result.direction);
      if (retired.size > 0) swapped++;
    } else if (result.error.startsWith('Another Direction')) nameInUse++;
    else unreadable++;
  }
  const notes: string[] = [];
  if (added.length > 0) notes.push(`Added ${added.length} ${added.length === 1 ? 'Direction' : 'Directions'} of your own.`);
  else if (alreadyHere > 0 && nameInUse + unreadable + overLimit === 0) return { ok: true, added, notes: ['Added none: this browser already holds every Direction in the file.'] };
  else notes.push('Added none.');
  if (alreadyHere > 0) notes.push(`${count(alreadyHere)} left out: this browser already holds it.`);
  if (nameInUse > 0) notes.push(`${count(nameInUse)} left out: another Direction already has its name.`);
  if (unreadable > 0) notes.push(`${count(unreadable)} left out: the Studio could not read them.`);
  if (overLimit > 0) notes.push(`${count(overLimit)} left out: the Studio holds at most ${OWN_MAX} Directions of your own.`);
  if (swapped > 0) notes.push(`${swapped} named a typeface that the Studio no longer carries; the Studio put the replacement in its place.`);
  return { ok: true, added, notes };
}
