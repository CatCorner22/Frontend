// Where the Studio saves things. On the private claude.ai page it uses that page's database and file-save features.
// Anywhere else (a static host, a local preview) it uses the browser's own storage and ordinary downloads.
// Every path is optional and wrapped, because storage can be blocked and a feature can be absent.

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

const LOCAL_KEY = 'refraction.project.v1';
const DOC_PATH = 'projects/current';

async function withTimeout<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([work, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

let dbPromise: Promise<Db | null> | null = null;
function database(): Promise<Db | null> {
  if (!dbPromise) {
    const rt = runtime();
    dbPromise = rt ? withTimeout(rt.use('db').catch(() => null), 10_000, null) : Promise.resolve(null);
  }
  return dbPromise;
}

export type SaveOutcome = 'cloud' | 'browser' | 'none';

/** Read the saved project, preferring the page database, then browser storage. Returns raw data; the caller validates it. */
export async function loadSaved(): Promise<{ data: unknown; from: SaveOutcome }> {
  try {
    const db = await database();
    if (db) {
      const snap = await withTimeout(db.doc(DOC_PATH).get(), 10_000, null);
      const data = snap?.exists ? snap.data() : undefined;
      if (data && typeof data['project'] === 'string') return { data: JSON.parse(data['project']) as unknown, from: 'cloud' };
    }
  } catch {
    // Fall through to browser storage.
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (raw) return { data: JSON.parse(raw) as unknown, from: 'browser' };
  } catch {
    // Storage blocked or empty.
  }
  return { data: null, from: 'none' };
}

let writing: Promise<void> = Promise.resolve();

/** Save the project. Writes are queued one at a time, as the page database requires. */
export async function saveProject(project: unknown): Promise<SaveOutcome> {
  const text = JSON.stringify(project);
  let outcome: SaveOutcome = 'none';
  try {
    window.localStorage.setItem(LOCAL_KEY, text);
    outcome = 'browser';
  } catch {
    // Storage blocked.
  }
  const db = await database();
  if (db) {
    const next = writing.then(() => db.doc(DOC_PATH).set({ project: text, savedAt: new Date().toISOString() }));
    writing = next.catch(() => undefined);
    try {
      await next;
      outcome = 'cloud';
    } catch {
      // Keep the browser outcome.
    }
  }
  return outcome;
}

export type FileOutcome = 'saved' | 'declined' | 'unavailable';

/** Offer a file to the person. On the private page a confirmation appears; elsewhere the browser downloads it. */
export async function saveFile(filename: string, text: string): Promise<FileOutcome> {
  const rt = runtime();
  if (rt) {
    try {
      const downloads = await withTimeout(rt.use('downloads').catch(() => null), 10_000, null);
      if (downloads) {
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

/** Copy text to the clipboard. Must run inside a click handler. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Can this host show an embedded preview at all? A one-time check with a constant, harmless document. */
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
