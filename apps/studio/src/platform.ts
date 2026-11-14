// Where the Studio saves things. On the private claude.ai page it uses that page's database and file-save features.
// Anywhere else (a static host, a local preview) it uses the browser's own storage and ordinary downloads.
// Every path is optional and wrapped, because storage can be blocked and a feature can be absent.
//
// Rules that protect saved work (findings SEC-02, SEC-03, SEC-06, P-05, P-06):
// 1. Both saved copies are read. Neither wins by default; the caller opens the valid copy with the newer save time.
// 2. A copy that cannot be read is never overwritten: its raw text moves to a backup key first.
// 3. After a read of the page database timed out, nothing is written there until a read has succeeded.
// 4. A save never replaces a copy that another tab wrote after this tab last looked.

interface DocSnapshot {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DocRef {
  get(): Promise<DocSnapshot>;
  set(data: Record<string, unknown>): Promise<void>;
}
interface Db {
  doc(path: string): DocRef;
}
interface Downloads {
  save(request: { filename: string; data: string | Blob }): Promise<{ status: string }>;
}
interface ClaudeRuntime {
  use(name: 'db'): Promise<Db | null>;
  use(name: 'downloads'): Promise<Downloads | null>;
}

const runtime = (): ClaudeRuntime | null => (window as unknown as { claude?: ClaudeRuntime }).claude ?? null;

/** The browser copy: an envelope `{ savedAt, mark, project }` as JSON text. `mark` names the one save that wrote it; older copies have none. */
export const LOCAL_KEY = 'refraction.project.v2';
/** The key that version 1 of the Studio used; it held the bare project. Read once, never written. */
export const LEGACY_KEY = 'refraction.project.v1';
/**
 * Kept copies: copies that were replaced or could not be read. The owner can download or remove each one.
 * Each kept copy has a storage entry of its own, named `refraction.project.backup.<time>.<random>`. Earlier versions kept
 * all copies in one list under `refraction.project.backup`; that list is still read, and it is rewritten only when the owner
 * removes one of its members.
 */
export const BACKUP_KEY = 'refraction.project.backup';
const COPY_PREFIX = `${BACKUP_KEY}.`;
export const PREFS_KEY = 'refraction.prefs.v1';
const DOC_PATH = 'projects/current';
const READ_TIMEOUT_MS = 10_000;
/** A write to the page database that has not answered after this time counts as not done; later writes do not wait for it. */
const WRITE_TIMEOUT_MS = 10_000;

/** One saved copy, as raw text. The caller parses and checks it. */
export interface RawCopy {
  /** JSON text of the project. */
  text: string;
  /** When the copy was saved (ISO 8601), or `null` when the copy carries no time (a version-1 copy). */
  savedAt: string | null;
  /** The mark of the save that wrote the browser copy, when it has one. */
  mark?: string;
}

export interface LoadResult {
  /** `timeout`: the page database exists but did not answer in time. `absent`: this page has no database. */
  page: RawCopy | 'empty' | 'timeout' | 'absent';
  browser: RawCopy | 'empty' | 'blocked';
}

const TIMED_OUT = Symbol('timed out');
function withTimeout<T>(work: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
  return Promise.race([work, new Promise<typeof TIMED_OUT>((resolve) => setTimeout(() => resolve(TIMED_OUT), ms))]);
}

let dbPromise: Promise<Db | null> | null = null;
function database(): Promise<Db | null> {
  if (!dbPromise) {
    const rt = runtime();
    // The call sits inside a promise chain, so that a runtime whose `use` is missing, throws at once, or returns something
    // that is not a promise counts as "no page database", instead of stopping the Studio from opening the browser copy
    // (code review of 2026-11-13, finding "saving 1").
    dbPromise = rt
      ? withTimeout(Promise.resolve().then(() => rt.use('db')).catch(() => null), READ_TIMEOUT_MS).then((db) => (db === TIMED_OUT || !db || typeof db.doc !== 'function' ? null : db))
      : Promise.resolve(null);
  }
  return dbPromise;
}

/** True after a read of the page database has succeeded. Until then the Studio does not write there. */
let pageReadSucceeded = false;
/** The save time of the browser copy as this tab last saw or wrote it. */
/**
 * The identity of the browser copy as this tab last saw or wrote it. It tells "my own save" from "another tab's save".
 * The save time alone cannot do that: two tabs that save within the same millisecond write the same time, and each then took
 * the other's save for its own (campaign 4, finding F-12). So each save carries a mark that no other save has.
 */
let browserCopySeen: string | null = null;
const identityOf = (copy: RawCopy): string | null => copy.mark ?? copy.savedAt;
const tabMark = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
let savesFromThisTab = 0;
const nextMark = (): string => `${tabMark}.${(savesFromThisTab++).toString(36)}`;

function envelope(text: string, savedAt: string, mark: string): string {
  return `{"savedAt":${JSON.stringify(savedAt)},"mark":${JSON.stringify(mark)},"project":${text}}`;
}

/** Split a browser copy into its save time and its project text. Returns `null` when the text is not an envelope. */
function openEnvelope(raw: string): RawCopy | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record['savedAt'] !== 'string' || typeof record['project'] !== 'object' || record['project'] === null) return null;
    return { text: JSON.stringify(record['project']), savedAt: record['savedAt'], ...(typeof record['mark'] === 'string' ? { mark: record['mark'] } : {}) };
  } catch {
    return null;
  }
}

async function readPage(): Promise<LoadResult['page']> {
  const db = await database();
  if (!db) return 'absent';
  try {
    const snap = await withTimeout(db.doc(DOC_PATH).get(), READ_TIMEOUT_MS);
    if (snap === TIMED_OUT) return 'timeout';
    pageReadSucceeded = true;
    const data = snap.exists ? snap.data() : undefined;
    if (!data || typeof data['project'] !== 'string' || data['project'] === '') return 'empty';
    return { text: data['project'], savedAt: typeof data['savedAt'] === 'string' ? data['savedAt'] : null };
  } catch {
    return 'timeout';
  }
}

function readBrowser(): LoadResult['browser'] {
  try {
    const current = window.localStorage.getItem(LOCAL_KEY);
    if (current !== null && current !== '') {
      // Text that is not an envelope is handed over as it is, so that the caller can keep it as an unreadable copy.
      const opened = openEnvelope(current) ?? { text: current, savedAt: null };
      browserCopySeen = identityOf(opened);
      return opened;
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy !== null && legacy !== '') return { text: legacy, savedAt: null };
    return 'empty';
  } catch {
    return 'blocked';
  }
}

/** Read both saved copies. Nothing is parsed, compared, or overwritten here. */
export async function loadSaved(): Promise<LoadResult> {
  const browser = readBrowser();
  const page = await readPage();
  return { page, browser };
}

/** Try the page database again after a timeout. Returns its copy once a read succeeds. */
export async function retryPageRead(): Promise<LoadResult['page']> {
  return readPage();
}

export interface KeptCopy {
  keptAt: string;
  why: string;
  text: string;
  /** The storage entry that holds this copy. Absent for a member of the earlier one-list form. */
  key?: string;
}
const UNKNOWN_FORM = 'An earlier kept copy, in a form this version of the Studio does not know.';

/** The copies in the earlier form: one list (or one single copy) under one storage entry. Nothing is dropped (findings S2-01, S3-04). */
function readListedCopies(): KeptCopy[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(BACKUP_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  const one = (value: unknown): KeptCopy | null => {
    if (typeof value !== 'object' || value === null) return null;
    const record = value as Record<string, unknown>;
    return typeof record['text'] === 'string' ? { keptAt: String(record['keptAt'] ?? ''), why: String(record['why'] ?? ''), text: record['text'] } : null;
  };
  try {
    const parsed: unknown = JSON.parse(raw);
    // A list member that this version cannot interpret is kept as it is, as a copy of its own.
    if (Array.isArray(parsed)) return parsed.map((member) => one(member) ?? { keptAt: '', why: UNKNOWN_FORM, text: typeof member === 'string' ? member : JSON.stringify(member) });
    const single = one(parsed);
    if (single) return [single];
  } catch {
    // Fall through: the content is kept as it is, as one copy.
  }
  return [{ keptAt: '', why: UNKNOWN_FORM, text: raw }];
}

/**
 * One kept copy as stored in its own entry: a first line with the time and the reason (JSON), then the copy's text, untouched.
 * The text is not wrapped in JSON, so listing many copies never has to parse megabytes, and the copy comes back character for character.
 */
function openCopy(key: string, raw: string): KeptCopy {
  const end = raw.indexOf('\n');
  if (end > 0) {
    try {
      const head = JSON.parse(raw.slice(0, end)) as { keptAt?: unknown; why?: unknown } | null;
      if (head && typeof head === 'object') return { key, keptAt: String(head.keptAt ?? ''), why: String(head.why ?? ''), text: raw.slice(end + 1) };
    } catch {
      // Fall through: not in the form this version writes.
    }
  }
  return { key, keptAt: '', why: UNKNOWN_FORM, text: raw };
}

/** Every kept copy, newest first. The Studio keeps a copy whenever it is about to replace saved work, or cannot read it. */
export function readBackups(): KeptCopy[] {
  const own: KeptCopy[] = [];
  try {
    const store = window.localStorage;
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key === null || !key.startsWith(COPY_PREFIX)) continue;
      const raw = store.getItem(key);
      if (raw !== null) own.push(openCopy(key, raw));
    }
  } catch {
    return [];
  }
  // Newest first. The entry's name starts with its time, which settles the order of two copies kept in the same millisecond.
  own.sort((a, b) => (b.key ?? '').localeCompare(a.key ?? ''));
  return [...own, ...readListedCopies()];
}

let keptInThisTab = 0;
/**
 * Keep a copy that is about to be replaced, or that could not be read. It joins the copies already kept; it never replaces one.
 * Returns false when the browser refuses (for example, storage is full); the copies already kept stay as they were.
 *
 * The copy goes into a new storage entry of its own, in one write. An earlier version rewrote one shared list; two tabs that
 * kept a copy in the same moment could then each rewrite the list from the same starting point, and one copy replaced the
 * other (campaign 4, finding F-10).
 */
export function keepBackup(text: string, why: string): boolean {
  try {
    if (readBackups().some((copy) => copy.text === text)) return true;
    const keptAt = new Date().toISOString();
    const unique = `${(keptInThisTab++).toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(`${COPY_PREFIX}${keptAt}.${unique}`, `${JSON.stringify({ keptAt, why })}\n${text}`);
    return true;
  } catch {
    return false;
  }
}

let runningCopy: string | null = null;
/**
 * Keep a copy of work that grows while it cannot be saved (a tab that is not saving, each time it goes to the background or
 * closes). The new copy takes the place of the one this tab kept the time before, so that one stopped session leaves one
 * copy, not one per tab switch (code review, finding "saving 7"). The new copy is written before the earlier one is removed.
 */
export function keepRunningCopy(text: string, why: string): boolean {
  const store = window.localStorage;
  try {
    if (readBackups().some((copy) => copy.text === text)) return true;
  } catch {
    return false;
  }
  const keptAt = new Date().toISOString();
  const key = `${COPY_PREFIX}${keptAt}.${(keptInThisTab++).toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const value = `${JSON.stringify({ keptAt, why })}\n${text}`;
  const earlier = runningCopy;
  try {
    store.setItem(key, value);
    if (earlier !== null) store.removeItem(earlier);
    runningCopy = key;
    return true;
  } catch {
    // No room for both. Put the new copy in the earlier one's place; if even that fails, put the earlier one back.
    if (earlier === null) return false;
    let before: string | null = null;
    try {
      before = store.getItem(earlier);
      store.removeItem(earlier);
      store.setItem(key, value);
      runningCopy = key;
      return true;
    } catch {
      try {
        if (before !== null) store.setItem(earlier, before);
      } catch {
        // Storage refuses everything; the earlier copy is gone from this attempt, and the caller reports the failure.
      }
      return false;
    }
  }
}
/** The owner settled the stopped save: the next stopped session keeps a copy of its own. */
export function endRunningCopy(): void {
  runningCopy = null;
}

const KEPT_NOTE_KEY = 'refraction.kept.note';
/** Leave word for the next opening: a page kept unsaved work as a copy while it closed or reloaded, when it could tell nobody. */
export function leaveKeptNote(): void {
  try {
    window.localStorage.setItem(KEPT_NOTE_KEY, '1');
  } catch {
    // The copy is kept all the same; only the word about it is missing.
  }
}
/** True, once, when a page left such word. */
export function takeKeptNote(): boolean {
  try {
    if (window.localStorage.getItem(KEPT_NOTE_KEY) === null) return false;
    window.localStorage.removeItem(KEPT_NOTE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Remove one kept copy, on the owner's explicit request. Returns false when the browser refuses. */
export function removeBackup(copy: KeptCopy): boolean {
  try {
    if (copy.key !== undefined) {
      window.localStorage.removeItem(copy.key);
      return true;
    }
    const rest = readListedCopies();
    // Exactly one copy goes, even when two copies hold the same text and time (finding S3-05).
    const index = rest.findIndex((other) => other.text === copy.text && other.keptAt === copy.keptAt);
    if (index === -1) return true;
    rest.splice(index, 1);
    if (rest.length === 0) window.localStorage.removeItem(BACKUP_KEY);
    else window.localStorage.setItem(BACKUP_KEY, JSON.stringify(rest));
    return true;
  } catch {
    return false;
  }
}

/**
 * The project now stored in this browser, as text, or null. Used to keep that copy before the owner's choice replaces it.
 * A stored copy carries its save time around the project; the project itself is returned, so that the kept copy opens
 * as a project file. Text that is not a stored copy at all is returned exactly as it is.
 */
export function storedProjectText(): string | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw === null ? null : (openEnvelope(raw)?.text ?? raw);
  } catch {
    return null;
  }
}

/** `page`: saved in the page database (and in the browser when it allows). `browser`: saved in this browser only. */
export type SaveOutcome = 'page' | 'browser' | 'failed' | 'conflict';

let writing: Promise<void> = Promise.resolve();
/** Stored text that the owner has said may be replaced without a kept copy. */
let replaceableText: string | null = null;

/** Write the browser copy now, without waiting. Returns false when the browser refuses or another tab saved in between. */
export function saveBrowserNow(projectText: string, savedAt: string): 'saved' | 'failed' | 'conflict' {
  try {
    const existing = window.localStorage.getItem(LOCAL_KEY);
    if (existing) {
      const stored = openEnvelope(existing);
      // Text that is not a saved copy at all is kept in the backup slot before anything replaces it.
      if (!stored && existing !== replaceableText && !keepBackup(existing, 'A saved copy that could not be read.')) return 'failed';
      // Another tab or window saved after this tab last looked: do not replace its work silently.
      if (stored && identityOf(stored) !== browserCopySeen && stored.text !== projectText) return 'conflict';
    }
    const mark = nextMark();
    window.localStorage.setItem(LOCAL_KEY, envelope(projectText, savedAt, mark));
    browserCopySeen = mark;
    return 'saved';
  } catch {
    return 'failed';
  }
}

/**
 * True when the browser copy is not the one this tab last saw or wrote: another tab or window saved since. A tab normally
 * hears of that through a storage event. A page that the browser restores from its back-forward cache hears nothing, so the
 * Studio also looks when the owner comes back to a tab, and before a tab closes.
 */
export function storedCopyChangedElsewhere(): boolean {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return false;
    const stored = openEnvelope(raw);
    return stored !== null && identityOf(stored) !== browserCopySeen;
  } catch {
    return false;
  }
}

/** Tell the platform that the owner chose this tab's copy over another tab's copy. The next save replaces the stored copy. */
export function adoptStoredCopy(): void {
  try {
    const existing = window.localStorage.getItem(LOCAL_KEY);
    const stored = existing ? openEnvelope(existing) : null;
    browserCopySeen = stored ? identityOf(stored) : null;
    // The owner decided that this exact text may be replaced, whether or not a copy of it could be kept (finding S3-02).
    replaceableText = existing;
  } catch {
    // Storage blocked: nothing to adopt.
  }
}

/** Save the project to both places. Writes to the page database are queued one at a time, as that database requires. */
export async function saveProject(projectText: string): Promise<SaveOutcome> {
  const savedAt = new Date().toISOString();
  const browser = saveBrowserNow(projectText, savedAt);
  if (browser === 'conflict') return 'conflict';
  let outcome: SaveOutcome = browser === 'saved' ? 'browser' : 'failed';
  const db = await database();
  if (db && pageReadSucceeded) {
    // A write has a time limit, as a read has. Without one, a single write that never answered left the status line at
    // "Saving…" for the rest of the session, and every later write waited behind it (code review, finding "saving 3").
    const next = writing.then(() => withTimeout(db.doc(DOC_PATH).set({ project: projectText, savedAt }), WRITE_TIMEOUT_MS));
    writing = next.then(() => undefined, () => undefined);
    try {
      if ((await next) !== TIMED_OUT) outcome = 'page';
    } catch {
      // Keep the browser outcome.
    }
  }
  return outcome;
}

/** Call `onChange` when another tab or window saves the project. Returns a function that stops listening. */
export function watchOtherTabs(onChange: () => void): () => void {
  const listener = (event: StorageEvent): void => {
    if (event.key !== LOCAL_KEY || event.newValue === null) return;
    const opened = openEnvelope(event.newValue);
    if (opened && identityOf(opened) !== browserCopySeen) onChange();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

export interface Prefs {
  device?: string;
  wireframe?: boolean;
  studioLook?: string;
}

export function loadPrefs(): Prefs {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as Prefs) : {};
  } catch {
    return {};
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // A preference that cannot be stored is not worth a warning.
  }
}

export type FileOutcome = 'saved' | 'declined' | 'unavailable';

/** Offer a file to the person. On the private page a confirmation appears; elsewhere the browser downloads it. */
export async function saveFile(filename: string, text: string): Promise<FileOutcome> {
  const rt = runtime();
  if (rt) {
    try {
      const downloads = await withTimeout(rt.use('downloads').catch(() => null), READ_TIMEOUT_MS);
      if (downloads !== TIMED_OUT && downloads) {
        await downloads.save({ filename, data: text });
        return 'saved';
      }
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'declined') return 'declined';
    }
    return 'unavailable';
  }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return 'saved';
  } catch {
    return 'unavailable';
  }
}

/** A safe file name from a project name: lowercase letters, digits, and hyphens only. */
export function fileNameFor(projectName: string, suffix = 'refraction.json'): string {
  const base = projectName
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'project'}.${suffix}`;
}

/** Copy text to the clipboard. Must run inside a click handler. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Can this host show an embedded preview at all? A one-time check with a constant, harmless document.
 * The probe frame is not sandboxed, because a sandboxed frame cannot be inspected from outside. A host policy
 * that blocks embedded frames blocks both kinds, so the probe stands in for the sandboxed previews.
 */
export function probePreviews(): Promise<boolean> {
  return new Promise((resolve) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0';
    const finish = (ok: boolean): void => {
      frame.remove();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), 3000);
    frame.addEventListener('load', () => {
      clearTimeout(timer);
      let ok = false;
      try {
        ok = frame.contentDocument?.body?.textContent?.trim() === 'ok';
      } catch {
        ok = false;
      }
      finish(ok);
    });
    // A fixed text of the Studio's own; no data flows into it.
    // eslint-disable-next-line no-restricted-properties
    frame.srcdoc = '<!doctype html><title>probe</title><p>ok</p>';
    document.body.append(frame);
  });
}
