// The Fit check (SPEC.md sections 2.10, 2.13, 2.15, and 2.19): open a build in a real browser at two window widths, measure it against the
// Prescription's design values, and write an Honest receipt. The program builds nothing and judges nothing.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type LaunchOptions, type Page } from 'playwright';
import { contrastRatio, hexOf, over, parseRgba, type Rgba } from './color.ts';
import { collect, readBrief, type Collected, type TextRead } from './collect.ts';
import { FitError, readDesignValues, type DesignValues } from './prescription.ts';
import { STILL_NEEDS_A_PERSON, receiptMarkdown, shown, type Measure, type Receipt } from './receipt.ts';

export { FitError } from './prescription.ts';
export type { Receipt } from './receipt.ts';

export interface FitInput {
  /** The Prescription's files by name: at least PRESCRIPTION.md, tokens.css, tokens.json, and mockup.html. */
  files: Readonly<Record<string, string | undefined>>;
  /** The page to measure. */
  html: string;
  /** A browser to reuse. When it is missing, the program starts one and closes it at the end. */
  browser?: Browser;
  launch?: LaunchOptions;
  /** How long a window may take to load and answer, in milliseconds. */
  loadTimeoutMs?: number;
  /** Run the page's own scripts. By default they do not run, because a page that runs a script can change what the program sees (main line, finding X7). */
  runScripts?: boolean;
}

export interface FitResult {
  receipt: Receipt;
  markdown: string;
  /** 0: no deviation in the six measured things. 1: at least one deviation, or a window that could not be measured. */
  status: 0 | 1;
}

export const WIDTHS = [375, 1280] as const;
/** How long after the page has loaded the program reads a window with motion allowed a second time (campaign A2, finding J-3). */
export const LATER_MS = 2000;
/**
 * The ways in which the program reads each window width (campaign A2, finding J-3). A visitor's browser allows motion and is not
 * automated, so the program reads with motion allowed, and again two seconds later, as well as with reduced motion.
 */
const READINGS = WIDTHS.flatMap((width) => [{ width, motion: 'reduce' as const }, { width, motion: 'allowed' as const }]);
const LISTED = 20;
const INFORMATION_LISTED = 50;
const LINE_MAX = 200;
const ERRORS_LISTED = 5;
const ELEMENTS_MAX = 20_000;
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
/** A proxy at a port where nothing listens, for every address (`<-loopback>` includes this machine's own). A window that opens another window or moves itself still cannot reach any host (main line, finding X7). */
const DEAD_PROXY = { server: 'http://127.0.0.1:1', bypass: '<-loopback>' } as const;

/**
 * A text from the page, made safe to write into the receipt and cut at `max` characters by whole characters (the main line's rule):
 * line breaks become spaces, and every sign that draws nothing becomes a visible mark (`shown`, campaign A2, finding J-5).
 */
export function clean(text: unknown, max = LINE_MAX): string {
  const raw = typeof text === 'string' ? text.slice(0, max * 8) : String(text ?? '').slice(0, max * 8);
  const bare = shown(raw.replace(/[\r\n\u0085\u2028\u2029]+/g, ' ')).replace(/[ \t]+/g, ' ').trim();
  const points = [...bare];
  return points.length > max ? `${points.slice(0, max - 1).join('')}…` : bare;
}

const UNMEASURED_WHY: Record<string, string> = {
  fill: 'the text is filled by an image or a gradient',
  opacity: 'the text or a box around it is drawn partly transparent',
  image: 'an image or a gradient lies behind the text',
  filter: 'a filter changes how the text is drawn',
};

/** A fixed sentence for a window that did not load. The browser's own message is never used: a page can shape it (main line, finding X7). */
function failureSentence(error: unknown, ms: number): string {
  const message = error instanceof Error ? `${error.name} ${error.message}` : '';
  const what = /did not finish loading|Timeout.*goto|goto.*Timeout/i.test(message) ? 'the page did not finish loading' : /did not answer|Timeout/i.test(message) ? 'the page did not answer' : 'the page could not be read';
  return `${what} within ${String(ms)} milliseconds`;
}

const list = <T>(value: unknown, keep: (item: unknown) => item is T): T[] => (Array.isArray(value) ? value.slice(0, ELEMENTS_MAX).filter(keep) : []);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const strings = (v: unknown, max = ELEMENTS_MAX): string[] => (Array.isArray(v) ? v.slice(0, max).map((x) => str(x).slice(0, 5000)) : []);
/**
 * The Floor requirements that the program checks on one page, each with the words of its deviation line (SPEC.md section 2.22).
 * Every other requirement of section 7 is named in the Floors measure's note as one that a person must check.
 */
const FLOOR_CHECKS: Readonly<Record<string, string>> = {
  A2: 'an image has no alt attribute', A3: 'a form field has no label', A4: 'a link or a button has no name',
  A5: 'the html element has no valid lang value', A12: 'the head does not hold exactly one title with text',
  A13: 'the viewport tag is missing or blocks zoom', A17: 'an element has a tabindex greater than 0',
  S1: 'an address starts with http://', S3: 'an inline event handler or a javascript: address',
  S5: 'the head holds no Content-Security-Policy meta tag', S6: 'the policy has no form-action directive, or one with *',
  S7: 'a link that opens a new tab has no rel="noopener"', S8: 'no referrer meta tag with a strict policy',
  S9: 'a form does not post, or posts to http: or javascript:', S11: 'a text field has no maxlength',
  Q2: 'a robots meta tag holds noindex, none, or nosnippet', Q3: 'the head does not hold exactly one title with text',
  Q7: 'the page does not have exactly one drawn h1 with text', Q8: 'the page does not have exactly one description that differs from the title',
  Q9: 'the viewport tag is missing or blocks zoom', Q10: 'a link has no href, an empty one, or a javascript: one',
  Q13: 'the html element has no valid lang value', P4: 'an image, a video, or an iframe states no size',
  P7: 'more than two images carry fetchpriority="high"', P12: 'a script in the head blocks rendering',
};
const FLOOR_CHECKED: ReadonlySet<string> = new Set(Object.keys(FLOOR_CHECKS));
/** Floor ids in the order of the Prescription: people, page, host, search, speed; within a Floor, by number. */
const byFloorOrder = (a: string, b: string): number => 'ASHQP'.indexOf(a[0] ?? '') - 'ASHQP'.indexOf(b[0] ?? '') || Number(a.slice(1)) - Number(b.slice(1));

const DRAWN_KINDS = new Set(['text', 'text fill', 'background', 'border', 'outline', 'text stroke', 'svg fill', 'svg stroke', 'underline', 'column rule', 'marker', 'placeholder', 'caret', 'accent']);

/** What the page returned, checked for type and size: the reading runs in a world of its own, and this is a second guard (main line, finding X7). */
function checked(raw: unknown): Collected {
  const r = isObject(raw) ? raw : {};
  const scripts = isObject(r['scripts']) ? r['scripts'] : {};
  // What the program does not read is counted, never dropped in silence (code review of pull request 14, Codex).
  const past = (v: unknown): number => (Array.isArray(v) ? Math.max(0, v.length - ELEMENTS_MAX) : 0);
  const beyond = {
    references: past(r['references']), drawn: past(r['drawn']), families: past(r['families']), radii: past(r['radii']), texts: past(r['texts']),
    lines: past(r['shownLines']) + past(r['clippedLines']), cutOff: past(r['cutOff']), fontFaces: past(r['fontFaces']),
  };
  return {
    beyond,
    floorBreaches: list(r['floorBreaches'], isObject).flatMap((x) => (FLOOR_CHECKED.has(str(x['id'])) ? [{ id: str(x['id']), where: str(x['where']) }] : [])),
    references: list(r['references'], isObject).map((x) => ({ kind: str(x['kind']), value: str(x['value']), address: str(x['address']) })),
    scripts: { inline: num(scripts['inline']), external: num(scripts['external']) },
    drawn: list(r['drawn'], isObject).flatMap((x) => (DRAWN_KINDS.has(str(x['kind'])) ? [{ kind: str(x['kind']) as Collected['drawn'][number]['kind'], css: str(x['css']), where: str(x['where']) }] : [])),
    families: list(r['families'], isObject).map((x) => ({ family: str(x['family']), where: str(x['where']) })),
    radii: list(r['radii'], isObject).map((x) => ({ value: str(x['value']), where: str(x['where']) })),
    texts: list(r['texts'], isObject).map((x): TextRead => ({
      where: str(x['where']), foreground: str(x['foreground']),
      layers: Array.isArray(x['layers']) ? x['layers'].slice(0, 200).map(str) : null,
      unmeasured: x['unmeasured'] === 'fill' || x['unmeasured'] === 'opacity' || x['unmeasured'] === 'image' || x['unmeasured'] === 'filter' ? x['unmeasured'] : '',
      sizePx: num(x['sizePx'], 16), weight: num(x['weight'], 400),
    })),
    shownLines: strings(r['shownLines']),
    clippedLines: strings(r['clippedLines']),
    cutOff: strings(r['cutOff']),
    filtered: num(r['filtered']),
    fontFaces: list(r['fontFaces'], isObject).map((x) => ({ family: str(x['family']), src: str(x['src']) })),
    scrollWidth: num(r['scrollWidth']),
    clientWidth: num(r['clientWidth']),
    baseHref: str(r['baseHref']),
  };
}

/** One reading of the page. A reading that failed still keeps the requests that its page made before it failed. */
type Pass = { label: string; width: number; requests: string[]; own: string[] } & ({ collected: Collected; errors: string[] } | { failure: string });

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

/** Scripts as the build's own text holds them; a page that replaces itself cannot hide them (campaign A2, finding J-4). */
function scriptsInSource(html: string): { inline: number; external: number } {
  let inline = 0;
  let external = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
    if (/\bsrc\s*=/i.test(match[1] ?? '')) external++;
    else inline++;
  }
  return { inline, external };
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
  // No network at all, and by default no script of the page (main line, finding X7); the readings of campaign A2 run all the same.
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference', offline: true, javaScriptEnabled: runScripts, serviceWorkers: 'block', proxy: DEAD_PROXY });
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
        const { result, exceptionDetails } = await within(session.send('Runtime.evaluate', { expression: `({ collected: (${collect.toString()})(), replaced: globalThis.__refractionWatch ? globalThis.__refractionWatch.replaced : true })`, contextId, returnByValue: true }), ms, 'the page did not answer');
        if (exceptionDetails) return fail(label, 'the program could not read the page');
        const value = result.value as { collected: Collected; replaced: boolean };
        if (value.replaced) return fail(label, 'the page replaced itself: a script wrote a new document over it');
        return { label, width, collected: checked(value.collected), errors: [...errors], requests: [...requests], own: [...own] };
      };
      if (motion === 'reduce') passes.push(await read(base));
      else {
        // The page's own animations end first, so that a text in the middle of its entrance is not taken as hidden.
        const contextId = worlds.get(frameTree.frame.id);
        if (contextId !== undefined) await within(session.send('Runtime.evaluate', { expression: 'Promise.race([Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().endTime !== Infinity).map((a) => a.finished.catch(() => undefined))), new Promise((done) => setTimeout(done, 3000))]).then(() => true)', contextId, awaitPromise: true, returnByValue: true }), ms, 'the page did not answer').catch(() => undefined);
        passes.push(await read(base));
        await new Promise((done) => setTimeout(done, LATER_MS));
        passes.push(await read(`${base}, two seconds later`));
      }
    } catch (error) {
      // The requests made before the failure stay in the receipt (finding A1-02).
      passes.push(fail(base, failureSentence(error, ms)));
    }
    // A page that never ends can hold its debugging connection too; the program stops waiting for it after a short time.
    await within(session.detach(), 2000, 'detach').catch(() => undefined);
    return passes;
  } finally {
    // A page that never ends can hold its tab; the program stops waiting for the tab after a short time.
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase();


function measureOf(id: string, title: string, note: string, deviations: string[], notMeasured: number, information: string[] = []): Measure {
  // Every line may quote the page: an invisible sign becomes a visible mark before it enters the receipt (campaign A2, finding J-5).
  const sorted = [...new Set(deviations.map((d) => clean(d)))].sort();
  const info = [...new Set(information.map((d) => clean(d)))].sort();
  return { id, title, deviations: sorted.length, notMeasured, items: sorted.slice(0, LISTED), more: Math.max(0, sorted.length - LISTED), note, information: info.slice(0, INFORMATION_LISTED), informationMore: Math.max(0, info.length - INFORMATION_LISTED) };
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

function contrastOf(text: Collected['texts'][number]): number | null {
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

function measures(design: DesignValues, passes: Pass[], mockupBrief: { business: string; headline: string; primaryAction: string }, source: { inline: number; external: number }): { measured: Measure[]; pageErrors: string[]; scripts: Receipt['scripts']; loadFailures: Receipt['loadFailures'] } {
  const good = passes.filter((p): p is Extract<Pass, { collected: Collected }> => 'collected' in p);
  const loadFailures = passes.flatMap((p) => ('failure' in p ? [{ width: p.width, reason: clean(`${p.label}: ${p.failure}`, 400) }] : []));
  const failed = loadFailures.length;

  // Another site is a deviation. A reference at the page's own address is information: the page names it but, being one file, cannot ship it.
  const requests = new Set<string>();
  // The same address once, with every kind in which the page names it (main line, finding X7).
  const ownKinds = new Map<string, Set<string>>();
  const own = (value: string, kind: string): void => {
    const key = clean(value, 150);
    ownKinds.set(key, (ownKinds.get(key) ?? new Set<string>()).add(clean(kind, 40)));
  };
  for (const p of passes) for (const url of p.requests) requests.add(url.startsWith('WebRTC ') ? clean(url) : `request to ${clean(url)}`);
  // A request to the site's own address is the page asking for a file that it names but, being one file, cannot ship.
  for (const p of passes) for (const path of p.own) own(path, 'request');
  for (const p of good) {
    for (const ref of p.collected.references) {
      if (isOtherSite(ref.address, p.collected.baseHref)) requests.add(`reference (${clean(ref.kind, 40)}) to ${clean(ref.value)}`);
      else own(ref.value, ref.kind);
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
      if (rgba.a < 1) { translucent.add(`partly transparent color ${clean(item.css, 60)}`); continue; }
      const hex = hexOf(rgba);
      if (!design.colors.has(hex)) colorRows.push({ key: `${item.kind} color ${hex}`, where: clean(item.where), width: p.label });
    }
  }

  // A color that passes through a CSS filter is changed before it reaches the screen: not measured (campaign A2, finding J-6).
  const filtered = good.reduce((sum, p) => sum + p.collected.filtered, 0);
  const fontRows = good.flatMap((p) => p.collected.families.filter((f) => !design.typefaces.has(clean(f.family).toLowerCase())).map((f) => ({ key: clean(f.family, 80), where: clean(f.where), width: p.label })));
  // FONTS.md ships every typeface as a file; a Prescription name given to a font installed on the machine draws other letters (J-19).
  const aliases = new Set(good.flatMap((p) => p.collected.fontFaces.filter((face) => design.typefaces.has(face.family.toLowerCase()) && /local\(/i.test(face.src)).map((face) => `typeface "${clean(face.family, 80)}" is drawn from a font installed on the machine (${clean(face.src, 120)}), not from a file`)));
  const radiusRows = good.flatMap((p) => p.collected.radii.filter((r) => { const px = /^([\d.]+)px$/.exec(r.value); return !px || !design.radii.has(Number(px[1])); }).map((r) => ({ key: clean(r.value, 40), where: clean(r.where), width: p.label })));

  const contrastRows: { ratio: number; key: string; width: number; label: string }[] = [];
  // The readings of each width that could be read, to say "at 375 pixels" when a line holds in all of them.
  const readingsAt = new Map<number, Set<string>>();
  for (const p of good) readingsAt.set(p.width, (readingsAt.get(p.width) ?? new Set<string>()).add(p.label));
  // A text that cannot be measured counts once for each window width, however many readings of that width found it (joined, D72:
  // the main line counts one for each text and width, and the note says so).
  const unreadAt = new Set<string>();
  const reasons = new Map<string, number>();
  for (const p of good) {
    for (const text of p.collected.texts) {
      const ratio = contrastOf(text);
      if (ratio === null) {
        const why = UNMEASURED_WHY[text.unmeasured] ?? 'a color could not be read';
        const id = `${String(p.width)}\u0000${text.where}\u0000${why}`;
        if (!unreadAt.has(id)) {
          unreadAt.add(id);
          reasons.set(why, (reasons.get(why) ?? 0) + 1);
        }
        continue;
      }
      const large = text.sizePx >= 24 || (text.sizePx >= 18.66 && text.weight >= 700);
      const needed = large ? 3 : 4.5;
      if (ratio < needed) contrastRows.push({ ratio, key: `${ratio.toFixed(2)} to 1, where ${String(needed)} to 1 is the usual least, on ${clean(text.where)}`, width: p.width, label: p.label });
    }
  }
  const ratioOf = new Map(contrastRows.map((row) => [row.key, row.ratio]));
  const contrastLines = atWidths(contrastRows, readingsAt).map((line) => ({ ratio: ratioOf.get(line.key) ?? 0, line: line.text })).sort((a, b) => a.ratio - b.ratio || (a.line < b.line ? -1 : 1));

  // Each reading on its own, and only the text that a person can read in that window (campaign A2, finding J-7).
  const contentLines: string[] = [];
  let contentUnsure = 0;
  const required: [string, string][] = [['business name', mockupBrief.business], ['headline', mockupBrief.headline], ['primary action', mockupBrief.primaryAction]];
  // A required text that is empty in the Mockup cannot be compared: not measured, never "found" (main line, SPEC.md 2.15 point 11).
  const emptyRequired = required.filter(([, wanted]) => wanted === '').length;
  // A required text must stand inside one block of text (main line), where a person can read it (campaign A2, J-7).
  const inLine = (lines: readonly string[], wanted: string): boolean => lines.some((line) => collapse(line).includes(collapse(wanted)));
  for (const [label, wanted] of required) {
    if (wanted === '') continue;
    const missing = good.filter((p) => !inLine(p.collected.shownLines, wanted));
    // A text that stands only under a clip-path or a mask may be hidden: not measured, never "found" (retest finding A2-V7).
    const unsure = missing.filter((p) => inLine(p.collected.clippedLines, wanted));
    contentUnsure += new Set(unsure.map((p) => p.width)).size;
    // One line for each width at which the text is missing, as the main line counts it (SPEC.md 2.15 point 11).
    const absent = missing.filter((p) => !unsure.includes(p)).map((p) => ({ key: `the ${label} is not where a person can read it`, width: p.width, label: p.label }));
    for (const line of atWidths(absent, readingsAt)) contentLines.push(`${line.text}: "${clean(wanted, 80)}"`);
  }

  // Sideways scrolling, and text cut off at the window's edge where nothing lets a person reach it (campaign A2, finding J-18).
  const widthLines = atWidths(good.flatMap((p) => [
    ...(p.collected.scrollWidth > p.collected.clientWidth ? [{ key: `the page is wider than its window (${String(p.collected.scrollWidth)} against ${String(p.collected.clientWidth)})`, width: p.width, label: p.label }] : []),
    ...(p.collected.cutOff.length > 0 ? [{ key: `${count(p.collected.cutOff.length)} reach past the window's edge and are cut off, first ${clean(p.collected.cutOff[0] ?? '')}`, width: p.width, label: p.label }] : []),
  ]), readingsAt).map((line) => line.text);

  const colorNote = `A color is a deviation when it is not one of the Prescription's opaque colors. Pseudo-elements, outlines, text strokes, SVG fills and strokes, underlines, column rules, list markers, placeholders, and caret and accent colors are compared too.${filtered > 0 ? ` ${String(filtered)} drawn ${filtered === 1 ? 'color passes' : 'colors pass'} through a CSS filter, which changes ${filtered === 1 ? 'it' : 'them'} before ${filtered === 1 ? 'it reaches' : 'they reach'} the screen, and ${filtered === 1 ? 'was' : 'were'} not compared.` : ''}${unreadColors > 0 ? ` ${String(unreadColors)} drawn ${unreadColors === 1 ? 'color' : 'colors'} could not be read and ${unreadColors === 1 ? 'is' : 'are'} counted as not measured.` : ''} Partly transparent colors are listed as information and not compared.`;
  const whyUnread = [...reasons].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([why, n]) => `${String(n)} because ${why}`).join('; ');
  const contrastNote = `The ratio of each text to its background by the WCAG 2.x formula. The Prescription does not hold Floor A1 (contrast checks were not “Fix for me”), so no ratio is a deviation; the lines show texts below the usual least.${unreadAt.size > 0 ? ` ${String(unreadAt.size)} text readings (one for each text and window width) could not be measured: ${whyUnread}.` : ''}`;
  const pageErrors = [...new Set(good.flatMap((p) => p.errors.map((e) => clean(e))))].sort().slice(0, ERRORS_LISTED);
  const most = (pick: (c: Collected) => number): number => Math.max(0, ...good.map((p) => pick(p.collected)));
  // A reading that held more entries of a kind than the program reads makes each measure of that kind "not measured", once per reading.
  const BEYOND: Record<string, readonly (keyof NonNullable<Collected['beyond']>)[]> = { requests: ['references'], colors: ['drawn'], typefaces: ['families', 'fontFaces'], radii: ['radii'], contrast: ['texts'], content: ['lines'], width: ['cutOff'] };
  const cutShort = (id: string): number => good.filter((p) => (BEYOND[id] ?? []).some((kind) => (p.collected.beyond?.[kind] ?? 0) > 0)).length;
  const counted = (m: Measure): Measure => {
    const n = cutShort(m.id);
    return n === 0 ? m : { ...m, notMeasured: m.notMeasured + n, note: `${m.note} In ${n === 1 ? '1 reading' : `${String(n)} readings`} the page held more entries than the program reads (${ELEMENTS_MAX.toLocaleString('en-US')} of each kind); the rest were not compared, and each such reading counts as not measured.` };
  };
  // The Floors (SPEC.md section 2.22): the requirements that the Prescription holds and that the program checks, one line each.
  const heldChecked = [...design.floorIds].filter((id) => FLOOR_CHECKED.has(id)).sort(byFloorOrder);
  // A1 (contrast) is measured by the contrast measure, which it makes binding; it is named there, not as unchecked.
  const heldUnchecked = [...design.floorIds].filter((id) => !FLOOR_CHECKED.has(id) && id !== 'A1').sort(byFloorOrder);
  // One line for each requirement that the page breaks: the markup is the same at every width, so a line names readings only when the
  // breach is not in all of them.
  const floorSeen = new Map<string, { where: string; labels: string[] }>();
  for (const p of good) {
    for (const b of p.collected.floorBreaches) {
      if (!design.floorIds.has(b.id)) continue;
      const seen = floorSeen.get(b.id) ?? { where: clean(b.where), labels: [] };
      if (!seen.labels.includes(p.label)) seen.labels.push(p.label);
      floorSeen.set(b.id, seen);
    }
  }
  const floorLines = [...floorSeen].sort((a, b) => byFloorOrder(a[0], b[0])).map(([id, seen]) => `${id}: ${FLOOR_CHECKS[id] ?? ''}, first ${seen.where}${seen.labels.length === good.length ? '' : ` (in ${seen.labels.join('; ')})`}`);
  const floorNote = !design.hasFloors
    ? 'The Prescription holds no Floors (it was made before them), so there was nothing to check.'
    : `Each line is a requirement of section 7 of the Prescription that the page does not meet, in a reading of the page's markup. Checked: ${heldChecked.length === 0 ? 'none' : heldChecked.join(', ')}${design.floorIds.has('A1') ? '; A1 (contrast) is measured by the contrast measure, which it makes binding' : ''}. Held by the Prescription and not checked by this program: ${heldUnchecked.length === 0 ? 'none' : heldUnchecked.join(', ')}; a person must check each of them, and they count neither as deviations nor as not measured.`;
  // Contrast is a requirement where the Prescription holds Floor A1 (the Floor for people with disabilities, written only under "Fix for me").
  const bound = design.floorIds.has('A1');
  return {
    loadFailures,
    pageErrors,
    scripts: { inline: Math.max(source.inline, most((c) => c.scripts.inline)), external: Math.max(source.external, most((c) => c.scripts.external)) },
    measured: [
      measureOf('requests', 'Requests: the page asks for nothing from another site', 'Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page\u2019s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.', [...requests], failed, ownAddress),
      measureOf('colors', 'Colors: every color that the page draws is a color of the Prescription', colorNote, grouped(colorRows, (key, n, first) => `${key}: ${count(n)}, first ${first}`), failed + unreadColors + filtered, [...translucent]),
      measureOf('typefaces', 'Typefaces: every text names a typeface of the Prescription', 'The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Prescription typeface’s name to a font installed on the machine is a deviation.', [...grouped(fontRows, (key, n, first) => `typeface "${key}": ${count(n)}, first ${first}`), ...aliases], failed),
      measureOf('radii', 'Corner radii: every drawn box uses a radius of the Prescription', 'Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.', grouped(radiusRows, (key, n, first) => `radius ${key}: ${count(n)}, first ${first}`), failed),
      measureOf('contrast', bound ? BOUND_CONTRAST_TITLE : 'Contrast: measured, not required', bound ? contrastNote.replace('The Prescription does not hold Floor A1 (contrast checks were not “Fix for me”), so no ratio is a deviation; the lines show texts below the usual least.', 'The Prescription holds Floor A1, so each text below the usual least is a deviation, and a text that could not be measured counts toward the status.') : contrastNote, contrastLines.map((c) => c.line), unreadAt.size + failed),
      measureOf('content', 'Content: the three required texts of the Brief are where a person can read them', 'The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own, inside one block of text. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask, and a text that is empty in the Mockup, are counted as not measured.', contentLines, failed + contentUnsure + emptyRequired),
      measureOf('width', 'Width: the page is not wider than its window', 'Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.', widthLines, failed),
      measureOf('floors', 'Floors: the page meets the requirements of section 7 that a program can check on one page', floorNote, floorLines, design.hasFloors && heldChecked.length > 0 ? failed : 0),
    ].map(counted),
  };
}

const count = (n: number): string => `${String(n)} ${n === 1 ? 'element' : 'elements'}`;

export async function fit(input: FitInput): Promise<FitResult> {
  const design = readDesignValues(input.files);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const runScripts = input.runScripts === true;
  const browser = input.browser ?? (await chromium.launch({ ...input.launch, args: [...(input.launch?.args ?? []), ...LAUNCH_ARGS] }));
  try {
    // The four windows are read side by side; their order in the receipt is fixed, so the same inputs give the same receipt.
    const passes: Pass[] = (await Promise.all(READINGS.map((reading) => readAt(browser, input.html, reading, ms, runScripts)))).flat();
    const brief = await readMockupBrief(browser, input.files['mockup.html'] ?? '', ms);
    const { measured, pageErrors, scripts, loadFailures } = measures(design, passes, brief, scriptsInSource(input.html));
    const receipt: Receipt = {
      fingerprint: design.fingerprint,
      build: { bytes: Buffer.byteLength(input.html, 'utf8'), sha256: createHash('sha256').update(input.html, 'utf8').digest('hex') },
      widths: [...WIDTHS],
      measured,
      judgedByModel: [],
      stillNeedsPerson: [...STILL_NEEDS_A_PERSON],
      pageErrors,
      scripts,
      scriptsRan: runScripts,
      loadFailures,
    };
    // "Not measured" is never "no deviation": anything not measured in a measure that counts gives status 1 (decision D71, A1-07).
    const status = countedMeasures(receipt).some((m) => m.deviations > 0 || m.notMeasured > 0) || loadFailures.length > 0 ? 1 : 0;
    return { receipt, markdown: receiptMarkdown(receipt), status };
  } finally {
    if (!input.browser) await browser.close();
  }
}

/** The title of the contrast measure where the Prescription holds Floor A1; then, and only then, contrast counts (SPEC.md section 2.22). */
export const BOUND_CONTRAST_TITLE = 'Contrast: required by Floor A1';

/**
 * The measures of a receipt that decide its status: every measure but contrast, and contrast too where it is required by Floor A1.
 * The status and the command line's summary both use this one rule (reviewer finding RV-01).
 */
export function countedMeasures(receipt: Receipt): Measure[] {
  return receipt.measured.filter((m) => m.id !== 'contrast' || m.title === BOUND_CONTRAST_TITLE);
}

async function readMockupBrief(browser: Browser, mockup: string, ms: number): Promise<ReturnType<typeof readBrief>> {
  // The Mockup is the Studio's own file, and it holds no script; the window has no script and no network all the same (main line),
  // and the program reads it from a world of its own, as it reads the build (finding A1-14).
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, offline: true, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await context.route('**/*', (route) => route.abort());
    await within(page.setContent(mockup, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the Mockup did not load');
    const read = await within(readInOwnWorld(page, readBrief), ms, 'the Mockup did not answer');
    return { business: str(read.business), headline: str(read.headline), primaryAction: str(read.primaryAction) };
  } catch {
    throw new FitError('The file "mockup.html" could not be opened to read the three required texts.');
  } finally {
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}
