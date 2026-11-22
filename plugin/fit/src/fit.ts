// The Fit check (SPEC.md sections 2.10, 2.13, 2.14, and 2.15): open a build in a real browser at three window widths, measure it against the
// Vision's design values, and write an Honest receipt. The program builds nothing and judges nothing.
// The page is untrusted. The program reads it from a world of its own, which no script of the page can reach; the window has no
// network; and every text that comes from the page is made visible and bounded before it enters the receipt.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type LaunchOptions, type Page } from 'playwright';
import { contrastRatio, hexOf, over, parseRgba, type Rgba } from './color.ts';
import { collect, mediaConditions, readBrief, type Collected } from './collect.ts';
import { CHECKED_PART, FLOORS_EDITION, checkedFacts, collectFloorFacts, floorFindings, statedEdition, writtenFloorIds, type FloorFacts } from './floors.ts';
import { FitError, READ_FILES, readDesignValues, type DesignValues } from './vision.ts';
import { JUDGED_MAX, MAX_REPAIR_ROUNDS, STILL_NEEDS_A_PERSON, receiptMarkdown, shown, type Measure, type Receipt, readingsOf } from './receipt.ts';

export { FitError } from './vision.ts';
export type { Receipt } from './receipt.ts';

export interface FitInput {
  /** The Vision's files by name: at least VISION.md, tokens.css, tokens.json, and mockup.html. */
  files: Readonly<Record<string, string | undefined>>;
  /** The page to measure. */
  html: string;
  /** A browser to reuse. When it is missing, the program starts one and closes it at the end. */
  browser?: Browser;
  launch?: LaunchOptions;
  /** How long a window may take to load and answer, in milliseconds. */
  loadTimeoutMs?: number;
  /** Run the page's own scripts, as a visitor's browser does. The default is true. With false, the program reads the markup as it stands, before any script. */
  runScripts?: boolean;
  /** The round of repair after which this check runs: 0 (the default) for a first check, 1 to 3 after a repair. Above 3 the program refuses. */
  repairRound?: number;
  /** Lines that a model wrote about its own work, one judgment each. They enter the receipt apart, as quoted data. */
  judged?: readonly string[];
  /** The Vision files of the receipt of the round before, by name and SHA-256, when the caller holds that receipt. */
  lastRoundVision?: readonly { name: string; sha256: string }[];
  /** The repair round that the receipt of `lastRoundVision` states, when the caller read it. */
  lastRound?: number;
  /**
   * The size and the SHA-256 of the build and of each Vision file as they stand on the disk, byte for byte. A caller that read
   * the files from a disk gives them: a file that is no valid UTF-8 text changes when it is read as text, so a hash of the text
   * is not the hash of the file (audit round of 2026-11-22, findings F-71 and F-105). Without them the texts are hashed.
   */
  onDisk?: { build?: { bytes: number; sha256: string }; files?: Readonly<Record<string, { bytes: number; sha256: string } | undefined>> };
}

export interface FitResult {
  receipt: Receipt;
  markdown: string;
  /** 0: no deviation in the measures that count. 1: at least one deviation, or something that could not be measured in them. */
  status: 0 | 1;
}

export const WIDTHS = [375, 768, 1280] as const;
/** How long after the page has loaded the program reads a window with motion allowed a second time (campaign A2, finding J-3). */
export const LATER_MS = 2000;
/** In "Still needs a person", when the program ran no script of the page (retest finding R-U01). */
const UNRUN_LINE = 'A page that behaves differently for a visitor. The program ran no script of the page, so it did not read anything that a script draws or changes; a visitor’s browser runs scripts. If the page holds a script, check again with the option --run-scripts.';
/** How long the program waits for the page's own animations to end before it reads. */
const ANIMATIONS_MS = 3000;
/**
 * The ways in which the program reads each window width (campaign A2, finding J-3). A visitor's browser allows motion and is not
 * automated, so the program reads with motion allowed, and again two seconds later, as well as with reduced motion.
 */
const READINGS = WIDTHS.flatMap((width) => [{ width, motion: 'reduce' as const }, { width, motion: 'allowed' as const }]);
const LISTED = 20;
const LINE_MAX = 200;
/** A proxy at a port where nothing listens, for every address (`<-loopback>` includes this machine's own). A window that opens another window or moves itself still cannot reach any host. */
const DEAD_PROXY = { server: 'http://127.0.0.1:1', bypass: '<-loopback>' } as const;
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/** One reading of the page. A reading that failed still keeps the requests that its page made before it failed. */
type Pass = { label: string; width: number; requests: string[]; own: string[] } & ({ collected: Collected; floors: FloorFacts; errors: string[]; media: string[]; closedRoots: number } | { failure: string });

/** Launch settings that hide the mark of automation and keep WebRTC from sending without a proxy (campaign A2, findings J-1 and J-3). */
export const LAUNCH_ARGS: readonly string[] = ['--disable-blink-features=AutomationControlled', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'];

/** The name of the program's own world in the page; the page's scripts cannot reach it. */
const WORLD = 'refraction-fit-check';

/**
 * Runs in the page's own world before any of its scripts, in every frame: it removes the mark of automation, so that a page sees the
 * check as a visitor's browser, and it replaces WebRTC with a stub that refuses and reports, because WebRTC sends over UDP, which no
 * route of the browser sees (campaign A2, findings J-1 and J-3).
 */
const BEFORE_THE_PAGE = `(() => {
  try { Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true }); } catch (e) {}
  const blocked = function () {
    try { const report = globalThis.__refractionFitRtc; if (typeof report === 'function') report(JSON.stringify((arguments[0] && arguments[0].iceServers) || [])); } catch (e) {}
    throw new DOMException('WebRTC is not available during the Fit check.', 'NotSupportedError');
  };
  for (const name of ['RTCPeerConnection', 'webkitRTCPeerConnection']) { try { Object.defineProperty(globalThis, name, { value: blocked, writable: false, configurable: false }); } catch (e) {} }
})();`;

/** Runs in the program's own world when each document starts: it notices when a script removes the document's root (document.open). */
const WATCH = `(() => {
  const state = { replaced: false };
  globalThis.__refractionWatch = state;
  new MutationObserver((records) => { for (const record of records) for (const node of record.removedNodes) if (node.nodeType === 1) state.replaced = true; }).observe(document, { childList: true });
})();`;

/**
 * With the page's scripts off, the program reads a page as a browser without scripts shows it. A page can show a visitor, whose browser
 * runs scripts, something else in three ways: a script, a `<noscript>` part (shown only without scripts), and a style rule under
 * `@media (scripting…)`. The program names each that the build's text holds, so that the check counts as not measured and the owner
 * runs it again with scripts on (retest findings R-S01 and R-S02). Empty when the build holds none of them.
 */
function unrunParts(html: string): string {
  const scripts = scriptsInSource(html);
  const parts: string[] = [];
  const n = scripts.inline + scripts.external;
  if (n > 0) parts.push(n === 1 ? '1 script' : `${String(n)} scripts`);
  if (/<noscript[\s>/]/i.test(html)) parts.push('a part for browsers without scripts (noscript)');
  if (/\(\s*scripting\b/i.test(html)) parts.push('a style rule that depends on scripts (@media scripting)');
  if (parts.length === 0) return '';
  return `The page holds ${parts.join(', ')}, and the program ran no script of the page. A visitor’s browser runs scripts, so a visitor may see another page than the one measured. Check again with the option --run-scripts.`;
}

/** Scripts as the build's own text holds them; a page that replaces itself cannot hide them (campaign A2, finding J-4). */
function scriptsInSource(html: string): { inline: number; external: number } {
  let inline = 0;
  let external = 0;
  // Read tag by tag, in one pass: a pattern that looks for the closing sign after every "<script" takes hours on a hostile build that
  // repeats the word without closing it (retest finding R-S10).
  const lower = html.toLowerCase();
  for (let at = lower.indexOf('<script'); at !== -1; at = lower.indexOf('<script', at + 7)) {
    if (/[a-z0-9_]/.test(lower[at + 7] ?? '')) continue;
    const end = lower.indexOf('>', at + 7);
    if (end === -1) break;
    if (/\bsrc\s*=/i.test(html.slice(at + 7, end))) external++;
    else inline++;
  }
  return { inline, external };
}

/** A fixed sentence for a window that did not load. The browser's own message is never used: a page can shape it. */
function failureSentence(error: unknown, stage: 'load' | 'answer', ms: number): string {
  const message = error instanceof Error ? `${error.name} ${error.message}` : '';
  const late = /Timeout|did not finish loading|did not answer/.test(message);
  const what = !late ? 'the page could not be read' : stage === 'load' ? 'the page did not finish loading' : 'the page did not answer';
  return `${what} within ${String(ms)} milliseconds`;
}

async function within<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(what)), ms); })]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs `read` in a world of its own inside the page (an "isolated world" of Chromium). That world shares the page's elements and
 * styles but none of the page's scripts, so a page that replaces `getComputedStyle` or any other function of the browser cannot
 * change what the program reads (finding A1-05: a page hid its own wrong typeface that way). `read` must stand alone, as for
 * `page.evaluate`. Chromium only; the Fit check starts Chromium.
 */
async function readInOwnWorld<T>(page: Page, read: () => T): Promise<T> {
  const session = await page.context().newCDPSession(page);
  try {
    const { frameTree } = await session.send('Page.getFrameTree');
    const { executionContextId } = await session.send('Page.createIsolatedWorld', { frameId: frameTree.frame.id, worldName: 'refraction-fit-check' });
    const { result, exceptionDetails } = await session.send('Runtime.evaluate', { expression: `(${read.toString()})()`, contextId: executionContextId, returnByValue: true });
    if (exceptionDetails) throw new Error('the program could not read the page');
    return result.value as T;
  } finally {
    await session.detach().catch(() => undefined);
  }
}

/**
 * Opens the build in one window, as the site would serve it, and reads it: once with reduced motion, or, with motion allowed, after
 * the page's own animations have ended and again two seconds later. The build is served at the stand-in address of the site, so that
 * relative addresses resolve as on the site, and so that the program's own world exists before the page's first script and can see
 * the page replace itself (campaign A2, finding J-4). Nothing leaves the machine: every request is written down and stopped.
 */
async function readAt(browser: Browser, html: string, reading: (typeof READINGS)[number], ms: number, runScripts: boolean): Promise<Pass[]> {
  const { width, motion } = reading;
  const base = motion === 'reduce' ? `${String(width)} pixels` : `${String(width)} pixels, motion allowed`;
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference', javaScriptEnabled: runScripts, serviceWorkers: 'block', proxy: DEAD_PROXY });
  const requests: string[] = [];
  const own: string[] = [];
  const passes: Pass[] = [];
  const fail = (label: string, reason: string): Pass => ({ label, width, failure: reason, requests: [...requests], own: [...own] });
  try {
    const site = new URL(OWN_SITE).origin;
    let served = false;
    // The block stands on the whole browser context, because a block on the page alone misses a window that the page opens (finding A1-01).
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      if (url === OWN_SITE && !served) {
        served = true;
        await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
        return;
      }
      if (new URL(url).origin === site) own.push(new URL(url).pathname + new URL(url).search);
      else requests.push(url);
      await route.abort();
    });
    // A WebSocket passes no ordinary route; it has a block of its own that lists it and closes it without connecting.
    await context.routeWebSocket(() => true, async (socket) => {
      requests.push(socket.url());
      await socket.close();
    });
    await context.exposeBinding('__refractionFitRtc', (_source, servers: unknown) => {
      requests.push(`WebRTC connection (stopped) to ${typeof servers === 'string' ? servers : 'servers that the page did not name'}`);
    });
    await context.addInitScript(BEFORE_THE_PAGE);
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    const worlds = new Map<string, number>();
    let loaded = false;
    let worldsAfterLoad = 0;
    session.on('Runtime.executionContextCreated', ({ context: created }) => {
      const aux = created.auxData as { frameId?: string } | undefined;
      if (created.name !== WORLD || aux?.frameId === undefined) return;
      worlds.set(aux.frameId, created.id);
      if (loaded) worldsAfterLoad++;
    });
    await session.send('Runtime.enable');
    await session.send('Page.enable');
    await session.send('Page.addScriptToEvaluateOnNewDocument', { source: WATCH, worldName: WORLD });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Every place that the main frame went. The page may leave during its own loading, before the program could listen for it, so
    // each reading also compares the frame's present address with the address that the program served (campaign A2, finding J-4).
    const went: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) went.push(frame.url());
    });
    const away = (): string => went.find((url) => url !== OWN_SITE) ?? (page.mainFrame().url() === OWN_SITE ? '' : page.mainFrame().url());
    try {
      await within(page.goto(OWN_SITE, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the page did not finish loading');
      loaded = true;
      const { frameTree } = await session.send('Page.getFrameTree');
      const read = async (label: string): Promise<Pass> => {
        const left = away();
        if (left !== '') return fail(label, `the page replaced itself: it went to ${left}`);
        const contextId = worlds.get(frameTree.frame.id);
        if (contextId === undefined || worldsAfterLoad > 0) return fail(label, 'the page replaced itself: its document was opened again');
        const { result, exceptionDetails } = await within(session.send('Runtime.evaluate', { expression: `({ collected: (${collect.toString()})(), floors: (${collectFloorFacts.toString()})(), media: (${mediaConditions.toString()})(), replaced: globalThis.__refractionWatch ? globalThis.__refractionWatch.replaced : true })`, contextId, returnByValue: true }), ms, 'the page did not answer');
        if (exceptionDetails) return fail(label, 'the program could not read the page');
        const value = result.value as { collected: Collected; floors: unknown; media: unknown; replaced: boolean };
        if (value.replaced) return fail(label, 'the page replaced itself: a script wrote a new document over it');
        // A closed shadow root is out of reach of every reading inside the page; the browser's own list of the page's parts
        // names it (finding A2-V4).
        const { root } = await within(session.send('DOM.getDocument', { depth: -1, pierce: true }), ms, 'the page did not answer');
        const closedRoots = countClosedRoots(root);
        return { label, width, collected: value.collected, floors: checkedFacts(value.floors), media: Array.isArray(value.media) ? value.media.filter((m): m is string => typeof m === 'string') : [], closedRoots, errors: [...errors], requests: [...requests], own: [...own] };
      };
      if (motion === 'reduce') passes.push(await read(base));
      else {
        // The page's own animations end first, so that a text in the middle of its entrance is not taken as hidden.
        const contextId = worlds.get(frameTree.frame.id);
        // The program itself stops waiting after three seconds: with the page's scripts off, no timer runs inside the page, so a wait
        // that the page counted would never end (found at the join of 2026-11-17, decision D77).
        if (contextId !== undefined) await within(session.send('Runtime.evaluate', { expression: 'Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => undefined))).then(() => true)', contextId, awaitPromise: true, returnByValue: true }), Math.min(ms, ANIMATIONS_MS), 'the page did not answer').catch(() => undefined);
        passes.push(await read(base));
        await new Promise((done) => setTimeout(done, LATER_MS));
        passes.push(await read(`${base}, two seconds later`));
      }
    } catch (error) {
      // The requests made before the failure stay in the receipt (finding A1-02).
      passes.push(fail(base, failureSentence(error, loaded ? 'answer' : 'load', ms)));
    }
    // A page that never ends can hold its debugging connection too; the program stops waiting for it after a short time.
    await within(session.detach(), 2000, 'detach').catch(() => undefined);
    return passes;
  } finally {
    // A page that never ends can hold its tab; the program stops waiting for the tab after a short time.
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}

// A soft hyphen (U+00AD) only says where a word may break: it is no letter of the text.
const collapse = (text: string): string => text.replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

const INFORMATION_LISTED = 50;

/** Every line that quotes the page: made visible (an invisible sign becomes a mark), and cut at `max` characters by whole characters. */
export function bounded(text: string, max = LINE_MAX): string {
  const head = [...text.slice(0, max * 8)].slice(0, max * 4).join('');
  const seen = shown(head);
  const points = [...seen];
  return points.length > max || text.length > head.length ? `${points.slice(0, max - 1).join('')}…` : seen;
}

function measureOf(id: string, title: string, note: string, deviations: string[], notMeasured: number, information: string[] = [], informationHead = ''): Measure {
  // Every line may quote the page: an invisible sign becomes a visible mark before it enters the receipt (campaign A2, finding J-5).
  const sorted = [...new Set(deviations.map((d) => bounded(d)))].sort();
  const info = [...new Set(information.map((d) => bounded(d)))].sort();
  return { id, title, deviations: sorted.length, notMeasured, items: sorted.slice(0, LISTED), more: Math.max(0, sorted.length - LISTED), note, informationHead, information: info.slice(0, INFORMATION_LISTED), informationMore: Math.max(0, info.length - INFORMATION_LISTED) };
}

/** A stand-in for the address of the site that will serve the page. The name ends in `.invalid`, which no real site can have. */
const OWN_SITE = 'https://own-site.invalid/page/';

/**
 * An address that a browser would fetch from another site, or that is not a web address of the site at all (`mailto:`,
 * `javascript:`). Two rules decide, and either one is enough:
 * - The address names a scheme (`https:`, `http:`, `mailto:`, and any other), as `SPEC.md` 2.13 says, with or without two slashes:
 *   on a page served over `http:`, `https:cdn.example/x` leads to cdn.example (review finding A1-12).
 * - The address parser of the URL standard, the parser that browsers use, resolves it, against the page's own `<base href>` when
 *   it has one, to a host other than the site's own (findings A1-08 and A1-10). A pattern of text misreads what a browser reads: a
 *   browser treats `\\cdn.example/x` and `/\cdn.example/x` as `//cdn.example/x`, and a base on another site moves every relative
 *   address there.
 * The browser's own clean-up comes first: a tab or a line break anywhere in an address is deleted, and spaces and control signs at
 * either end are cut, so `h<tab>ttps://cdn.example` is `https://cdn.example`. An address that the parser refuses counts as another
 * site, so that doubt is never "no deviation".
 */
export function isOtherSite(address: string, base = ''): boolean {
  const text = address.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return true;
  try {
    const own = new URL(OWN_SITE);
    return new URL(text, base === '' ? own : new URL(base, own)).origin !== own.origin;
  } catch {
    return true;
  }
}

/** One line for each different value, with how many elements show it and the first one. The count is the largest over the window widths. */
function grouped(rows: { key: string; where: string; width: string }[], describe: (key: string, elements: number, first: string) => string): string[] {
  const byKey = new Map<string, { perWidth: Map<string, number>; first: string }>();
  for (const row of rows) {
    const entry = byKey.get(row.key) ?? { perWidth: new Map<string, number>(), first: row.where };
    entry.perWidth.set(row.width, (entry.perWidth.get(row.width) ?? 0) + 1);
    byKey.set(row.key, entry);
  }
  return [...byKey].map(([key, entry]) => describe(key, Math.max(...entry.perWidth.values()), entry.first));
}

/**
 * One line for each finding and width. A finding that holds in every reading of a width says "at 375 pixels"; one that holds in
 * some readings only names them. So the same fault is counted once for each width, as before the readings multiplied (decision D71).
 */
function atWidths(rows: { key: string; width: number; label: string }[], readingsAt: ReadonlyMap<number, ReadonlySet<string>>): { key: string; text: string }[] {
  const byKey = new Map<string, string[]>();
  for (const row of rows) {
    const id = `${row.key}\u0000${String(row.width)}`;
    byKey.set(id, [...(byKey.get(id) ?? []), row.label]);
  }
  return [...byKey].map(([id, labels]) => {
    const [key = '', width = ''] = id.split('\u0000');
    const all = readingsAt.get(Number(width));
    const every = all !== undefined && [...all].every((label) => labels.includes(label));
    return { key, text: `${key} at ${every ? `${width} pixels` : labels.join('; ')}` };
  });
}

/** Below this ratio a text and its ground are one color to the eye (1 to 1 is the same color). */
const SAME_COLOR_RATIO = 1.1;

/**
 * True when a part of the wanted text is drawn only in the color of its ground (retest finding R-S08). An element counts as
 * drawing the text when its own words stand inside the wanted text in their order, or hold it. The text is readable only when the
 * readable elements together draw every word of it: a readable part elsewhere on the page does not stand in for a headline that
 * nobody can see (audit round of 2026-11-22, findings F-69 and F-97).
 */
function sameAsGround(texts: Collected['texts'], wanted: string): boolean {
  const line = wanted.split(' ');
  const readable = new Set<number>();
  let unseen = 0;
  for (const text of texts) {
    // The element's own words, without the words of an element inside it (a marked word of a headline). An older reading holds
    // them only in its label, cut after 40 characters: a word that the cut may have broken is left out.
    const quoted = /"(.*)"$/.exec(text.where)?.[1] ?? '';
    const words = collapse(text.own ?? quoted.replace(/…$/, '')).split(' ').filter((word) => word !== '');
    if (text.own === undefined && quoted.endsWith('…')) words.pop();
    const own = words.join(' ');
    if (own.length < 2) continue;
    const places = own.includes(wanted) ? line.map((_, at) => at) : placesInOrder(words, line);
    if (places === null) continue;
    // Opacity and a gradient of one color do not set a text apart from its ground: the colors alone decide there.
    const ratio = contrastOf(text) ?? (text.nominal ? contrastOf({ ...text, layers: text.nominal }) : null);
    if (ratio !== null && ratio < SAME_COLOR_RATIO) unseen++;
    else for (const at of places) readable.add(at);
  }
  return unseen > 0 && readable.size < line.length;
}

/** Where the words stand in the line, in this order, with or without other words between them; null when they do not. */
function placesInOrder(words: readonly string[], line: readonly string[]): number[] | null {
  const places: number[] = [];
  for (let at = 0; at < line.length && places.length < words.length; at++) if (line[at] === words[places.length]) places.push(at);
  return places.length === words.length ? places : null;
}

function contrastOf(text: Pick<Collected['texts'][number], 'foreground' | 'layers'>): number | null {
  const fg = parseRgba(text.foreground);
  if (!fg || text.layers === null) return null;
  let behind = WHITE;
  for (const layer of text.layers) {
    const parsed = parseRgba(layer);
    if (!parsed) return null;
    behind = over(parsed, behind);
  }
  return contrastRatio(fg.a < 1 ? over(fg, behind) : fg, behind);
}

function measures(design: DesignValues, passes: Pass[], mockupBrief: { business: string; headline: string; primaryAction: string }, source: { inline: number; external: number }, written: readonly string[], edition: number | null, unrun = '', mockupMedia: readonly string[] = [], mockupUnread: ReadonlySet<string> = new Set()): { measured: Measure[]; pageErrors: string[]; scripts: Receipt['scripts']; loadFailures: Receipt['loadFailures']; floorsNotChecked: string[] } {
  const good = passes.filter((p): p is Extract<Pass, { collected: Collected }> => 'collected' in p);
  const loadFailures = passes.flatMap((p) => ('failure' in p ? [{ width: p.width, reason: bounded(`${p.label}: ${p.failure}`) }] : []));
  // An animation with an end that has not ended at the last reading: the page may still change after the program stops (finding G-S04).
  for (const p of passes) if ('collected' in p && p.label.endsWith('two seconds later') && p.collected.pendingAnimations > 0) loadFailures.push({ width: p.width, reason: bounded(`${p.label}: ${String(p.collected.pendingAnimations)} of the page’s animations had not ended when the program stopped reading, so the page may still change`) });
  // An animation that never ends, and a timer inside an SVG picture: the page keeps changing by the clock after the program stops, so
  // what was read is one moment of it (retest finding R-S05). Once for each window width, at the last reading.
  for (const p of passes) {
    if (!('collected' in p) || !p.label.endsWith('two seconds later')) continue;
    if (p.collected.endlessAnimations > 0) loadFailures.push({ width: p.width, reason: bounded(`${p.label}: ${String(p.collected.endlessAnimations)} of the page’s animations never end, so the page keeps changing after the program stops reading; what was measured is one moment of it`) });
    if (p.collected.svgTimers > 0) loadFailures.push({ width: p.width, reason: bounded(`${p.label}: ${String(p.collected.svgTimers)} of the page’s pictures hold a timer of its own (an SVG animation), so the page may change after the program stops reading`) });
  }
  // What the page holds for a browser with scripts, when the program ran none: not measured, never "no deviation" (R-S01, R-S02).
  if (unrun !== '') loadFailures.push({ width: 0, reason: unrun });
  // A part of the design that shows only under a setting that the program did not read under: not measured, never "no deviation"
  // (finding G-S05).
  const closedRoots = Math.max(0, ...passes.map((p) => ('closedRoots' in p ? p.closedRoots : 0)));
  if (closedRoots > 0) loadFailures.push({ width: 0, reason: `The page holds ${String(closedRoots)} closed shadow root${closedRoots === 1 ? '' : 's'}: a part of the page that the program cannot read. What it draws was not measured` });
  const PAST_LIMIT = '(more style rules or conditions than the program reads)';
  const everyUnread = unreadConditions(passes.flatMap((p) => ('media' in p ? p.media : [])), mockupMedia);
  const unread = everyUnread.filter((condition) => condition !== PAST_LIMIT);
  // The page holds more style rules, conditions or shadow roots than the program reads: the program did not find a setting, it
  // stopped at a limit, and says that (second re-audit of the repair run, 2026-11-22).
  if (everyUnread.length > unread.length) loadFailures.push({ width: 0, reason: 'The page holds more style rules, media conditions or shadow roots than the program reads (200,000 rules, 5,000 conditions, 2,000 shadow roots, 2,000 characters in one condition), so a setting of the screen that it names may have gone unread. What the page shows under such a setting was not measured' });
  if (unread.length > 0) loadFailures.push({ width: 0, reason: bounded(`The page's style rules name ${unread.length === 1 ? 'a setting' : `${String(unread.length)} settings`} of the screen or of the visitor that the Vision's Mockup does not name, and the program did not read the page under ${unread.length === 1 ? 'it' : 'them'}: ${unread.slice(0, 8).map((c) => `"${c}"`).join('; ')}${unread.length > 8 ? `; and ${String(unread.length - 8)} more` : ''}. What the page shows there was not measured`, 900) });
  const failed = loadFailures.length;

  // Another site is a deviation. A reference at the page's own address is information: the page names it but, being one file, cannot ship it.
  const requests = new Set<string>();
  // One line for each place at the site's own address, with every kind of mention on that line.
  const ownKinds = new Map<string, Set<string>>();
  const mention = (value: string, kind: string): void => {
    const key = bounded(value, 150);
    ownKinds.set(key, (ownKinds.get(key) ?? new Set<string>()).add(bounded(kind, 40)));
  };
  for (const p of passes) for (const url of p.requests) requests.add(url.startsWith('WebRTC ') ? url : `request to ${url}`);
  // A request to the site's own address is the page asking for a file that it names but, being one file, cannot ship.
  for (const p of passes) for (const path of p.own) mention(path, 'request');
  for (const p of good) {
    for (const ref of p.collected.references) {
      if (isOtherSite(ref.address, p.collected.baseHref)) requests.add(`reference (${ref.kind}) to ${ref.value}`);
      else mention(ref.value, ref.kind);
    }
  }
  const ownAddress = [...ownKinds].map(([value, kinds]) => `${value} (${[...kinds].sort().join(', ')})`);

  const translucent = new Set<string>();
  // A color that the program cannot read is counted as not measured, never passed over in silence (finding A1-03).
  let unreadColors = 0;
  const colorRows: { key: string; where: string; width: string }[] = [];
  for (const p of good) {
    for (const item of p.collected.drawn) {
      const rgba = parseRgba(item.css);
      if (!rgba) { unreadColors++; continue; }
      if (rgba.a === 0) continue;
      if (rgba.a < 1) { translucent.add(`partly transparent color ${bounded(item.css, 60)}`); continue; }
      const hex = hexOf(rgba);
      if (!design.colors.has(hex)) colorRows.push({ key: `${item.kind} color ${hex}`, where: item.where, width: p.label });
    }
  }

  // A color that passes through a CSS filter is changed before it reaches the screen: not measured (campaign A2, finding J-6).
  const filtered = good.reduce((sum, p) => sum + p.collected.filtered, 0);
  const foreignShapes = Math.max(0, ...good.map((p) => p.collected.foreignShapes));
  const fontRows = good.flatMap((p) => p.collected.families.filter((f) => !design.typefaces.has(f.family.toLowerCase())).map((f) => ({ key: f.family, where: f.where, width: p.label })));
  // FONTS.md ships every typeface as a file; a Vision name given to a font installed on the machine draws other letters (J-19).
  const aliases = new Set(good.flatMap((p) => p.collected.fontFaces.filter((face) => design.typefaces.has(face.family.toLowerCase()) && /local\(/i.test(face.src)).map((face) => `typeface "${face.family}" is drawn from a font installed on the machine (${face.src.trim()}), not from a file`)));
  const radiusRows = good.flatMap((p) => p.collected.radii.filter((r) => { const px = /^([\d.]+)px$/.exec(r.value); return !px || !design.radii.has(Number(px[1])); }).map((r) => ({ key: r.value, where: r.where, width: p.label })));

  const contrastRows: { ratio: number; key: string; width: number; label: string }[] = [];
  // The readings of each width that could be read, to say "at 375 pixels" when a line holds in all of them.
  const readingsAt = new Map<number, Set<string>>();
  for (const p of good) readingsAt.set(p.width, (readingsAt.get(p.width) ?? new Set<string>()).add(p.label));
  let unreadable = 0;
  const reasons = new Map<string, number>();
  // A text is one element: two elements with the same words are two texts (audit round of 2026-11-22, finding F-75). The texts
  // of one label are counted in each reading on its own, and the largest count of any reading stands: an element that a script
  // adds between two readings cannot make one text count twice (second re-audit).
  const unreadLabels = new Map<string, number>();
  // Where the Vision requires contrast, an unread text is excused only where the Mockup leaves a text with the same words unread
  // too (the owner's answer of 2026-11-22): every other unread text makes the page "not measured".
  const unexcusedLabels = new Map<string, number>();
  const wordsOf = (where: string): string => collapse(/"(.*)"$/.exec(where)?.[1] ?? where);
  const belowLabels = new Map<string, number>();
  const mostOf = (into: Map<string, number>, here: Map<string, number>): void => { for (const [label, n] of here) into.set(label, Math.max(into.get(label) ?? 0, n)); };
  for (const p of good) {
    const unreadHere = new Map<string, number>();
    const unexcusedHere = new Map<string, number>();
    const belowHere = new Map<string, number>();
    for (const text of p.collected.texts) {
      const ratio = contrastOf(text);
      if (ratio === null) {
        unreadable++;
        unreadHere.set(text.where, (unreadHere.get(text.where) ?? 0) + 1);
        if (!mockupUnread.has(wordsOf(text.where))) unexcusedHere.set(text.where, (unexcusedHere.get(text.where) ?? 0) + 1);
        const why = text.unmeasured === '' ? 'a color could not be read' : text.unmeasured;
        reasons.set(why, (reasons.get(why) ?? 0) + 1);
        continue;
      }
      const large = text.sizePx >= 24 || (text.sizePx >= 18.66 && text.weight >= 700);
      const needed = large ? 3 : 4.5;
      if (ratio < needed) belowHere.set(text.where, (belowHere.get(text.where) ?? 0) + 1);
      if (ratio < needed) contrastRows.push({ ratio, key: `${ratio.toFixed(2)} to 1, where ${String(needed)} to 1 is the usual least, on ${text.where}`, width: p.width, label: p.label });
    }
    mostOf(unreadLabels, unreadHere);
    mostOf(unexcusedLabels, unexcusedHere);
    mostOf(belowLabels, belowHere);
  }
  const sum = (counts: Map<string, number>): number => [...counts.values()].reduce((total, n) => total + n, 0);
  const unreadTexts = { size: sum(unreadLabels) };
  const belowTexts = { size: sum(belowLabels) };
  const ratioOf = new Map(contrastRows.map((row) => [row.key, row.ratio]));
  const contrastLines = atWidths(contrastRows, readingsAt).map((line) => ({ ratio: ratioOf.get(line.key) ?? 0, line: line.text })).sort((a, b) => a.ratio - b.ratio || (a.line < b.line ? -1 : 1));

  // Each reading on its own, and only the text that a person can read in that window (campaign A2, finding J-7).
  const contentLines: string[] = [];
  let contentUnsure = 0;
  const required: [string, string][] = [['business name', mockupBrief.business], ['headline', mockupBrief.headline], ['primary action', mockupBrief.primaryAction]];
  for (const [label, wanted] of required) {
    // A text in the color of its own ground is there for no reader: it counts as missing, whether or not the Vision requires
    // contrast (retest finding R-S08; the owner's answer of 2026-11-21).
    const missing = good.filter((p) => !p.collected.shownLines.some((line) => collapse(line).includes(collapse(wanted))) || sameAsGround(p.collected.texts, collapse(wanted)));
    // A text that stands only under a clip-path or a mask may be hidden: not measured, never "found" (retest finding A2-V7).
    const unsure = missing.filter((p) => p.collected.clippedLines.some((line) => collapse(line).includes(collapse(wanted))));
    contentUnsure += unsure.length;
    const absent = missing.filter((p) => !unsure.includes(p));
    // A width at which the text is missing in every reading is named once ("768 pixels"); otherwise each reading is named.
    const places = WIDTHS.flatMap((width) => {
      const here = absent.filter((p) => p.width === width).map((p) => p.label);
      const all = readingsAt.get(width);
      return here.length > 0 && all !== undefined && here.length === all.size ? [`${String(width)} pixels`] : here;
    });
    if (places.length > 0) contentLines.push(`the ${label} is not where a person can read it at ${places.join('; ')}: "${wanted}"`);
  }

  // Sideways scrolling, and text cut off at the window's edge where nothing lets a person reach it (campaign A2, finding J-18).
  const widthLines = atWidths(good.flatMap((p) => [
    ...(p.collected.scrollWidth > p.collected.clientWidth ? [{ key: `the page is wider than its window (${String(p.collected.scrollWidth)} against ${String(p.collected.clientWidth)})`, width: p.width, label: p.label }] : []),
    ...(p.collected.cutOff.length > 0 ? [{ key: `${count(p.collected.cutOff.length)} reach past the window's edge and are cut off, first ${p.collected.cutOff[0] ?? ''}`, width: p.width, label: p.label }] : []),
  ]), readingsAt).map((line) => line.text);

  // A frame draws a page of its own that the program does not read (finding G-S06).
  const frames = Math.max(0, ...good.map((p) => p.collected.frames));
  const colorNote = `A color is a deviation when it is not one of the Vision's opaque colors. Pseudo-elements, outlines, text strokes, underlines, column rules, list markers, placeholder text, carets, accent colors, and the fill and stroke of inline SVG shapes are compared too.${frames > 0 ? ` The page holds ${String(frames)} ${frames === 1 ? 'frame or embedded object' : 'frames or embedded objects'}; the program does not read what ${frames === 1 ? 'it draws' : 'they draw'}, and counts ${frames === 1 ? 'it' : 'each'} as not measured.` : ''}${filtered > 0 ? ` ${String(filtered)} drawn ${filtered === 1 ? 'color passes' : 'colors pass'} through a CSS filter, which changes ${filtered === 1 ? 'it' : 'them'} before ${filtered === 1 ? 'it reaches' : 'they reach'} the screen, and ${filtered === 1 ? 'was' : 'were'} not compared.` : ''}${foreignShapes > 0 ? ` The page holds ${String(foreignShapes)} ${foreignShapes === 1 ? 'shape that a picture takes' : 'shapes that pictures take'} from another file; the program does not load that file, and counts ${foreignShapes === 1 ? 'the shape' : 'each'} as not measured.` : ''}${translucent.size > 0 ? ' Partly transparent colors are listed as information and not compared.' : ''}${unreadColors > 0 ? ` ${String(unreadColors)} drawn ${unreadColors === 1 ? 'color' : 'colors'} could not be read and ${unreadColors === 1 ? 'was' : 'were'} not compared.` : ''}`;
  const whyUnread = [...reasons].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([why, n]) => `${String(n)} because ${why}`).join('; ');
  // The Floors (SPEC.md section 2.22): the part of each written requirement that a program can check on this page.
  // Contrast binds only where the program reads the Floors: a Vision of another edition has none of its Floors checked, so its A1
  // does not bind either (retest finding R-U03: the receipt said "required by Floor A1" beside "checked none").
  const binding = written.includes('A1') && edition === FLOORS_EDITION;
  const floorLines = new Set<string>();
  for (const p of good) {
    const http = p.collected.references.map((ref) => ref.address.replace(/[\t\n\r]/g, '').trim()).filter((address) => /^http:/i.test(address));
    for (const line of floorFindings(p.floors, written, http)) floorLines.add(line);
  }
  // A reading in which a list held more entries than the program reads: the Floors count as not measured once (retest finding R-T02).
  const floorsCut = good.some((p) => p.floors.cutLists.length > 0) ? 1 : 0;
  // The program reads the Floors as one edition words them. A Vision of another edition may word a requirement another way (the first
  // draft of S5 asked for the opposite order of two tags), so the program checks none of its requirements and says so (findings G-U01, G-T27).
  const otherEdition = written.length > 0 && edition !== FLOORS_EDITION;
  if (otherEdition) floorLines.clear();
  const partly = otherEdition ? [] : written.filter((id) => CHECKED_PART[id] !== undefined);
  const floorsNotChecked = otherEdition ? [...written] : written.filter((id) => CHECKED_PART[id] === undefined);
  const floorsNote = written.length === 0
    ? 'The Vision’s section 7 writes no requirement that this program reads.'
    : otherEdition
    ? `The Vision’s section 7 writes ${String(written.length)} requirements in ${edition === null ? 'an edition without a number (an older Vision)' : `edition ${String(edition)}`} of the Floors; this program reads edition ${String(FLOORS_EDITION)}, and the two may word a requirement differently. The program checked none of them. Write the Vision again from the Studio, then check again.`
    : `The Vision’s section 7 writes ${String(written.length)} requirements. The program checked a part of ${String(partly.length)} of them (${partly.join(', ')}); each deviation line names its requirement, and the list below says which part of each the program checked. Passing that part does not show that the page meets the requirement: the rest of each, and all of ${floorsNotChecked.join(', ')}, stay with a person.`;
  const contrastNote = `The ratio of each text to its background by the WCAG 2.x formula. ${binding ? 'The Vision writes Floor A1, so a ratio below its least is a deviation.' : written.includes('A1') ? 'The Vision writes Floor A1 in an edition of the Floors that this program does not read, so no ratio counts as a deviation here; the lines show texts below the usual least.' : 'The Vision does not write Floor A1 for this project, so no ratio is a deviation from it; the lines show texts below the usual least.'}${unreadable > 0 ? ` ${readingsOf(unreadable, unreadTexts.size)} could not be measured (the program reads each text at 3 window widths, and up to 3 times at each width). The reasons, by reading: ${whyUnread}.${binding ? (sum(unexcusedLabels) > 0 ? ` ${String(sum(unexcusedLabels))} of these texts ${sum(unexcusedLabels) === 1 ? 'is' : 'are'} not unread in the Vision’s Mockup, so the page counts as not measured (status 1): the Vision requires contrast, and a text that the Mockup shows readably must be readable to the program too.` : ' Each of these texts is unread in the Vision’s Mockup too, so they do not change the status.') : ''}` : ''}`;
  const pageErrors = [...new Set(good.flatMap((p) => p.errors.map((e) => [...shown(e)].slice(0, 200).join(''))))].sort().slice(0, 5);
  const most = (pick: (c: Collected) => number): number => Math.max(0, ...good.map((p) => pick(p.collected)));
  return {
    loadFailures,
    pageErrors,
    scripts: { inline: Math.max(source.inline, most((c) => c.scripts.inline)), external: Math.max(source.external, most((c) => c.scripts.external)) },
    measured: [
      measureOf('requests', 'Requests: the page asks for nothing from another site', 'Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page\u2019s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.', [...requests], failed, ownAddress, 'Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations.'),
      measureOf('colors', 'Colors: every color that the page draws is a color of the Vision', colorNote, grouped(colorRows, (key, n, first) => `${key}: ${count(n)}, first ${first}`), failed + unreadColors + filtered + frames + foreignShapes, [...translucent], 'Listed for information and not compared: partly transparent colors. A person must judge them on the page.'),
      measureOf('typefaces', 'Typefaces: every text names a typeface of the Vision', 'The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Vision typeface’s name to a font installed on the machine is a deviation.', [...grouped(fontRows, (key, n, first) => `typeface "${key}": ${count(n)}, first ${first}`), ...aliases], failed),
      measureOf('radii', 'Corner radii: every drawn box uses a radius of the Vision', 'Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.', grouped(radiusRows, (key, n, first) => `radius ${key}: ${count(n)}, first ${first}`), failed),
      { ...measureOf('contrast', binding ? 'Contrast: required by Floor A1 of the Vision' : 'Contrast: measured, not required', contrastNote, contrastLines.map((c) => c.line), unreadable + failed, [...unreadLabels].map(([label, n]) => (n > 1 ? `${label} (${String(n)} texts with these words)` : label)), 'Texts whose contrast the program could not read. A person must judge these by eye:'), texts: { below: belowTexts.size, unread: unreadTexts.size, unreadReadings: unreadable, ...(binding ? { unexcused: sum(unexcusedLabels) } : {}) } },
      measureOf('content', 'Content: the three required texts of the Brief are where a person can read them', 'The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask is not measured.', contentLines, failed + contentUnsure),
      measureOf('width', 'Width: the page is not wider than its window', 'Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.', widthLines, failed),
      { ...measureOf('floors', 'Floors: the part of each requirement that a program can check', `${floorsNote}${!otherEdition && written.length > 0 && floorsCut > 0 ? ' The page held more entries than the program reads in at least one list (200 of each: titles, descriptions, robots tags, viewport tags, referrer tags, headings, forms, font rules); an entry after the first 200 was not read, so the Floors count as not measured once.' : ''}`, [...floorLines], failed + (otherEdition ? 1 : written.length > 0 ? floorsCut : 0), partly.map((id) => `${id}: ${CHECKED_PART[id] ?? ''}`), 'What the program checked of each requirement, and no more than this:'), ...(written.length === 0 ? { nothingToCheck: true } : {}), ...(otherEdition ? { noneCheckedOf: written.length } : {}) },
    ],
    floorsNotChecked,
  };
}

const count = (n: number): string => `${String(n)} ${n === 1 ? 'element' : 'elements'}`;

export async function fit(input: FitInput): Promise<FitResult> {
  const design = readDesignValues(input.files);
  const repairRound = input.repairRound ?? 0;
  if (!Number.isInteger(repairRound) || repairRound < 0) throw new FitError('The repair round must be a whole number from 0 to 3.');
  if (repairRound > MAX_REPAIR_ROUNDS) throw new FitError(`The repair budget of ${String(MAX_REPAIR_ROUNDS)} rounds is spent. The program did not check again; a person decides now.`);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const runScripts = input.runScripts === true;
  const browser = input.browser ?? (await chromium.launch({ ...input.launch, args: [...(input.launch?.args ?? []), ...LAUNCH_ARGS] }));
  try {
    // The six windows (three widths, each with reduced motion and with motion allowed) are read side by side; their order in the receipt is fixed, so the same inputs give the same receipt.
    const passes: Pass[] = (await Promise.all(READINGS.map((reading) => readAt(browser, input.html, reading, ms, runScripts)))).flat();
    const brief = await readMockupBrief(browser, input.files['mockup.html'] ?? '', ms);
    const visionMd = input.files['VISION.md'] ?? '';
    const written = writtenFloorIds(visionMd);
    const { measured, pageErrors, scripts, loadFailures, floorsNotChecked } = measures(design, passes, brief, scriptsInSource(input.html), written, statedEdition(visionMd), runScripts ? '' : unrunParts(input.html), brief.media, new Set(brief.texts.filter((text) => contrastOf(text) === null).map((text) => collapse(/"(.*)"$/.exec(text.where)?.[1] ?? text.where))));
    // "Not measured" is never "no deviation": anything not measured in a measure that counts gives status 1 (decision D71, A1-07).
    // Contrast counts when the Vision writes Floor A1: a ratio below its least is then a deviation. A text whose contrast could not
    // be read does not change the status (the Mockup itself holds such texts); the receipt and the command line name the count.
    const counted = measured.filter((m) => m.id !== 'contrast');
    const contrast = measured.find((m) => m.id === 'contrast');
    const status = counted.some((m) => m.deviations > 0 || m.notMeasured > 0) || ((contrast?.title ?? '').startsWith('Contrast: required') && ((contrast?.deviations ?? 0) > 0 || (contrast?.texts?.unexcused ?? 0) > 0)) || loadFailures.length > 0 ? 1 : 0;
    const judged = (input.judged ?? []).map((line) => bounded(line.replace(/\s+/g, ' ').trim())).filter((line) => line !== '');
    const visionFiles = READ_FILES.map((name) => ({ name, ...(input.onDisk?.files?.[name] ?? { bytes: Buffer.byteLength(input.files[name] ?? '', 'utf8'), sha256: createHash('sha256').update(input.files[name] ?? '', 'utf8').digest('hex') }) }));
    const receipt: Receipt = {
      fingerprint: design.fingerprint,
      build: input.onDisk?.build ?? { bytes: Buffer.byteLength(input.html, 'utf8'), sha256: createHash('sha256').update(input.html, 'utf8').digest('hex') },
      vision: {
        files: visionFiles,
        // The requirements count as read only in the edition that the program knows.
        floorsRead: statedEdition(visionMd) === FLOORS_EDITION ? written.length : 0,
        changedSinceLastRound: repairRound > 0 && input.lastRoundVision ? visionFiles.filter((f) => input.lastRoundVision?.find((last) => last.name === f.name)?.sha256 !== f.sha256).map((f) => f.name) : null,
        ...(repairRound > 0 && input.lastRoundVision && input.lastRound !== undefined ? { comparedWithRound: input.lastRound } : {}),
      },
      widths: [...WIDTHS],
      scriptsRan: runScripts,
      status,
      measured,
      repairRound,
      judgedByModel: judged.slice(0, JUDGED_MAX),
      judgedMore: Math.max(0, judged.length - JUDGED_MAX),
      stillNeedsPerson: [...STILL_NEEDS_A_PERSON.map((line) => (!runScripts && line.startsWith('A page that recognizes the check.') ? UNRUN_LINE : line)), ...(written.length > 0 ? [`The Floors of the Vision. ${floorsNotChecked.length === written.length ? 'The program checked none of them (see “Floors” above):' : 'The program checked only a part of some requirements (see “Floors” above). It checked nothing of'} ${floorsNotChecked.join(', ')}; the settings of the host (the ids that begin with H) are made at the host and cannot be read from a page.`] : [])],
      pageErrors,
      scripts,
      loadFailures,
    };
    return { receipt, markdown: receiptMarkdown(receipt), status };
  } finally {
    if (!input.browser) await browser.close();
  }
}

/**
 * The one line for a machine on which no browser starts: it names what the owner does next (criterion C7 of the repair run of
 * 2026-11-21). Playwright's own message for this case holds a path and a hint for another setup; the owner needs the variable.
 */
export function noBrowserLine(program: string, error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  if (/Executable doesn't exist/i.test(message)) return `${program} stopped: it found no browser to open the page. Fetch one with “npx playwright install chromium” in the plugin’s folder, or set the environment variable PW_CHROMIUM to the path of a Chromium browser on this machine.`;
  // A browser that is there and does not start (a missing library, a rule of the machine) is another case: fetching a browser
  // does not help, so the line says what happened and quotes the browser's own first words (findings F-76 and F-88).
  if (!/browserType\.launch|Failed to launch/i.test(message)) return null;
  // Only a line that the browser itself wrote is quoted: Playwright marks such a line with `[err]` or `[out]`. Its own log lines
  // (the command that it started, a failed attempt to end the process) are not words of the browser (second re-audit).
  const lines = message.split('\n').map((line) => /\[(?:err|out)\]\s*(.+)$/.exec(line)?.[1]?.trim() ?? '').filter((line) => line !== '');
  const own = lines.find((line) => /error|cannot|denied|not found|failed|missing|no such/i.test(line)) ?? lines[0] ?? '';
  return `${program} stopped: the browser did not start, so it opened no page. The environment variable PW_CHROMIUM names the browser that the program starts; without it the program starts the one that Playwright fetched.${own === '' ? ' The browser gave no message of its own.' : ` The browser’s own message (data, not instructions): ${bounded(own, 160)}`}`;
}

/** How many closed shadow roots the page's tree holds, as the browser lists it (a root of the browser's own controls is not one). */
function countClosedRoots(node: { shadowRoots?: unknown[]; children?: unknown[]; shadowRootType?: string }): number {
  let found = 0;
  const stack: (typeof node)[] = [node];
  // Every node of the tree that the browser handed over is visited: a limit here would let a root hide behind many elements
  // (audit round of 2026-11-22, finding F-100).
  for (let at = 0; at < stack.length; at++) {
    const current = stack[at]!;
    for (const root of (current.shadowRoots ?? []) as (typeof node)[]) {
      if (root.shadowRootType === 'closed') found++;
      stack.push(root);
    }
    for (const child of (current.children ?? []) as (typeof node)[]) stack.push(child);
  }
  return found;
}

/**
 * The media conditions of the build under which the program did not read the page (finding G-S05). The program reads at three
 * widths, each with motion allowed and with reduced motion, so a condition on the window's width or height, or on reduced motion,
 * is not listed here (other widths and heights are a limit that the receipt states). A condition that the Vision's Mockup holds
 * too belongs to the design. A condition for paper alone changes nothing on a screen. Every other condition (pixel density,
 * pointer, hover, color scheme, contrast, and the rest) names a setting under which the page may show another design.
 */
export function unreadConditions(build: readonly string[], mockup: readonly string[]): string[] {
  // A condition is its parts, in whatever order they are written: "(pointer: fine) and (hover: hover)" is the Mockup's own
  // "(hover: hover) and (pointer: fine)" (attack before delivery, 2026-11-22).
  const parts = (condition: string): string => condition.split(',').map((part) => part.trim().split(/\s+and\s+/).sort().join(' and ')).sort().join(', ');
  const known = new Set(mockup.map(parts));
  const sizeOrMotion = /\((?:[^()]*\b(?:width|height|aspect-ratio|orientation)\b[^()]*|\s*prefers-reduced-motion[^()]*)\)/g;
  const unread = new Set<string>();
  for (const condition of build) {
    if (known.has(parts(condition))) continue;
    // Each part between commas is a condition of its own.
    for (const part of condition.split(',')) {
      const text = part.trim();
      // "print" holds on no screen, and "not print" (with whatever follows) on every screen: neither names an unread setting.
      if (/^(?:only\s+)?print\b/.test(text) || /^not\s+print\b/.test(text)) continue;
      if (text.replace(sizeOrMotion, '').replace(/\b(?:all|screen|and|not|only|or)\b/g, '').replace(/[()\s]/g, '') !== '') unread.add(condition);
    }
  }
  return [...unread].sort();
}

async function readMockupBrief(browser: Browser, mockup: string, ms: number): Promise<ReturnType<typeof readBrief> & { media: string[]; texts: Collected['texts'] }> {
  // The Mockup comes from the Vision folder, which may come from anywhere: its window has no script, no network, and the same dead
  // proxy as the build's window, so that not even a prefetch or a preconnect link reaches a host (gate review, finding G-S01).
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, offline: true, javaScriptEnabled: false, serviceWorkers: 'block', proxy: DEAD_PROXY });
  let brief: ReturnType<typeof readBrief> & { media: string[]; texts: Collected['texts'] };
  try {
    const page = await context.newPage();
    await context.route('**/*', (route) => route.abort());
    await context.routeWebSocket(() => true, (socket) => socket.close());
    await within(page.setContent(mockup, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the Mockup did not load');
    // Read from a world of its own, as the build is: a script in a changed mockup.html cannot blank or forge the texts (finding A1-14).
    brief = { ...(await within(readInOwnWorld(page, readBrief), ms, 'the Mockup did not answer')), media: await within(readInOwnWorld(page, mediaConditions), ms, 'the Mockup did not answer'), texts: (await within(readInOwnWorld(page, collect), ms, 'the Mockup did not answer')).texts };
  } catch {
    throw new FitError('The file "mockup.html" could not be opened to read the three required texts.');
  } finally {
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
  // The Studio never writes a Mockup without these texts (guarantee 55.01). Without one, the content measure would compare nothing
  // and report "no deviation", so the program refuses instead (finding A1-14).
  const missing = ([['business name', brief.business], ['headline', brief.headline], ['primary action', brief.primaryAction]] as const).filter(([, text]) => text === '').map(([label]) => label);
  if (missing.length > 0) throw new FitError(`The file "mockup.html" holds no ${missing.join(', no ')}, so the program cannot check that the page shows it.`);
  return brief;
}
