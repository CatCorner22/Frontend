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

/** The browser copy: an envelope `{ savedAt, project }` as JSON text. */
export const LOCAL_KEY = 'refraction.project.v2';
/** The key that version 1 of the Studio used; it held the bare project. Read once, never written. */
export const LEGACY_KEY = 'refraction.project.v1';
/** A copy that was replaced or could not be read. One slot; the owner can download it. */
export const BACKUP_KEY = 'refraction.project.backup';
export const PREFS_KEY = 'refraction.prefs.v1';
const DOC_PATH = 'projects/current';
const READ_TIMEOUT_MS = 10_000;

/** One saved copy, as raw text. The caller parses and checks it. */
export interface RawCopy {
  /** JSON text of the project. */
  text: string;
  /** When the copy was saved (ISO 8601), or `null` when the copy carries no time (a version-1 copy). */
  savedAt: string | null;
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
    dbPromise = rt
      ? withTimeout(rt.use('db').catch(() => null), READ_TIMEOUT_MS).then((db) => (db === TIMED_OUT ? null : db))
      : Promise.resolve(null);
  }
  return dbPromise;
}

/** True after a read of the page database has succeeded. Until then the Studio does not write there. */
let pageReadSucceeded = false;
/** The save time of the browser copy as this tab last saw or wrote it. */
let browserSavedAtSeen: string | null = null;

function envelope(text: string, savedAt: string): string {
  return `{"savedAt":${JSON.stringify(savedAt)},"project":${text}}`;
}

/** Split a browser copy into its save time and its project text. Returns `null` when the text is not an envelope. */
function openEnvelope(raw: string): RawCopy | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (typeof record['savedAt'] !== 'string' || typeof record['project'] !== 'object' || record['project'] === null) return null;
    return { text: JSON.stringify(record['project']), savedAt: record['savedAt'] };
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
      browserSavedAtSeen = opened.savedAt;
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

/** Keep a copy that is about to be replaced, or that could not be read. Returns false when the browser refuses. */
export function keepBackup(text: string, why: string): boolean {
  try {
    window.localStorage.setItem(BACKUP_KEY, JSON.stringify({ keptAt: new Date().toISOString(), why, text }));
    return true;
  } catch {
    return false;
  }
}

export function readBackup(): { keptAt: string; why: string; text: string } | null {
  try {
    const raw = window.localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed['text'] !== 'string') return null;
    return { keptAt: String(parsed['keptAt'] ?? ''), why: String(parsed['why'] ?? ''), text: parsed['text'] };
  } catch {
    return null;
  }
}

/** `page`: saved in the page database (and in the browser when it allows). `browser`: saved in this browser only. */
export type SaveOutcome = 'page' | 'browser' | 'failed' | 'conflict';

let writing: Promise<void> = Promise.resolve();

/** Write the browser copy now, without waiting. Returns false when the browser refuses or another tab saved in between. */
export function saveBrowserNow(projectText: string, savedAt: string): 'saved' | 'failed' | 'conflict' {
  try {
    const existing = window.localStorage.getItem(LOCAL_KEY);
    if (existing) {
      const stored = openEnvelope(existing);
      // Text that is not a saved copy at all is kept in the backup slot before anything replaces it.
      if (!stored && !keepBackup(existing, 'A saved copy that could not be read.')) return 'failed';
      // Another tab or window saved after this tab last looked: do not replace its work silently.
      if (stored && stored.savedAt !== browserSavedAtSeen && stored.text !== projectText) return 'conflict';
    }
    window.localStorage.setItem(LOCAL_KEY, envelope(projectText, savedAt));
    browserSavedAtSeen = savedAt;
    return 'saved';
  } catch {
    return 'failed';
  }
}

/** Tell the platform that the owner chose this tab's copy over another tab's copy. The next save replaces the stored copy. */
export function adoptStoredCopy(): void {
  try {
    const existing = window.localStorage.getItem(LOCAL_KEY);
    browserSavedAtSeen = existing ? (openEnvelope(existing)?.savedAt ?? null) : null;
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
    const next = writing.then(() => db.doc(DOC_PATH).set({ project: projectText, savedAt }));
    writing = next.catch(() => undefined);
    try {
      await next;
      outcome = 'page';
    } catch {
      // Keep the browser outcome.
    }
  }
  return outcome;
}

/** Call `onChange` when another tab or window saves the project. Returns a function that stops listening. */
export function watchOtherTabs(onChange: (copy: RawCopy) => void): () => void {
  const listener = (event: StorageEvent): void => {
    if (event.key !== LOCAL_KEY || event.newValue === null) return;
    const opened = openEnvelope(event.newValue);
    if (opened && opened.savedAt !== browserSavedAtSeen) onChange(opened);
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
    frame.srcdoc = '<!doctype html><title>probe</title><p>ok</p>';
    document.body.append(frame);
  });
}
