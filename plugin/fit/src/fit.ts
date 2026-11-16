// The Fit check, first slice (SPEC.md section 2.10): open a build in a real browser at two window widths, measure it against the
// Prescription's design values, and write an Honest receipt. The program builds nothing and judges nothing.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type LaunchOptions, type Page } from 'playwright';
import { contrastRatio, hexOf, over, parseRgba, type Rgba } from './color.ts';
import { collect, readBrief, type Collected } from './collect.ts';
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
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

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
async function readAt(browser: Browser, html: string, reading: (typeof READINGS)[number], ms: number): Promise<Pass[]> {
  const { width, motion } = reading;
  const base = motion === 'reduce' ? `${String(width)} pixels` : `${String(width)} pixels, motion allowed`;
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference' });
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
        return { label, width, collected: value.collected, errors: [...errors], requests: [...requests], own: [...own] };
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
      passes.push(fail(base, `${error instanceof Error ? error.message : 'the page could not be read'} within ${String(ms)} milliseconds`));
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

const INFORMATION_LISTED = 50;

function measureOf(id: string, title: string, note: string, deviations: string[], notMeasured: number, information: string[] = []): Measure {
  // Every line may quote the page: an invisible sign becomes a visible mark before it enters the receipt (campaign A2, finding J-5).
  const sorted = [...new Set(deviations.map(shown))].sort();
  const info = [...new Set(information.map(shown))].sort();
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
 * some readings only names them. So the same fault is counted once for each width, as before the readings multiplied (decision D69).
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
  const loadFailures = passes.flatMap((p) => ('failure' in p ? [{ width: p.width, reason: shown(`${p.label}: ${p.failure}`) }] : []));
  const failed = loadFailures.length;

  // Another site is a deviation. A reference at the page's own address is information: the page names it but, being one file, cannot ship it.
  const requests = new Set<string>();
  const ownAddress = new Set<string>();
  for (const p of passes) for (const url of p.requests) requests.add(url.startsWith('WebRTC ') ? url : `request to ${url}`);
  // A request to the site's own address is the page asking for a file that it names but, being one file, cannot ship.
  for (const p of passes) for (const path of p.own) ownAddress.add(`request: ${path}`);
  for (const p of good) {
    for (const ref of p.collected.references) {
      if (isOtherSite(ref.address, p.collected.baseHref)) requests.add(`reference (${ref.kind}) to ${ref.value}`);
      else ownAddress.add(`${ref.kind}: ${ref.value}`);
    }
  }

  const translucent = new Set<string>();
  // A color that the program cannot read is counted as not measured, never passed over in silence (finding A1-03).
  let unreadColors = 0;
  const colorRows: { key: string; where: string; width: string }[] = [];
  for (const p of good) {
    for (const item of p.collected.drawn) {
      const rgba = parseRgba(item.css);
      if (!rgba) { unreadColors++; continue; }
      if (rgba.a === 0) continue;
      if (rgba.a < 1) { translucent.add(item.css); continue; }
      const hex = hexOf(rgba);
      if (!design.colors.has(hex)) colorRows.push({ key: `${item.kind} color ${hex}`, where: item.where, width: p.label });
    }
  }

  // A color that passes through a CSS filter is changed before it reaches the screen: not measured (campaign A2, finding J-6).
  const filtered = good.reduce((sum, p) => sum + p.collected.filtered, 0);
  const fontRows = good.flatMap((p) => p.collected.families.filter((f) => !design.typefaces.has(f.family.toLowerCase())).map((f) => ({ key: f.family, where: f.where, width: p.label })));
  // FONTS.md ships every typeface as a file; a Prescription name given to a font installed on the machine draws other letters (J-19).
  const aliases = new Set(good.flatMap((p) => p.collected.fontFaces.filter((face) => design.typefaces.has(face.family.toLowerCase()) && /local\(/i.test(face.src)).map((face) => `typeface "${face.family}" is drawn from a font installed on the machine (${face.src.trim()}), not from a file`)));
  const radiusRows = good.flatMap((p) => p.collected.radii.filter((r) => { const px = /^([\d.]+)px$/.exec(r.value); return !px || !design.radii.has(Number(px[1])); }).map((r) => ({ key: r.value, where: r.where, width: p.label })));

  const contrastRows: { ratio: number; key: string; width: number; label: string }[] = [];
  // The readings of each width that could be read, to say "at 375 pixels" when a line holds in all of them.
  const readingsAt = new Map<number, Set<string>>();
  for (const p of good) readingsAt.set(p.width, (readingsAt.get(p.width) ?? new Set<string>()).add(p.label));
  let unreadable = 0;
  const reasons = new Map<string, number>();
  for (const p of good) {
    for (const text of p.collected.texts) {
      const ratio = contrastOf(text);
      if (ratio === null) {
        unreadable++;
        const why = text.unmeasured === '' ? 'a color could not be read' : text.unmeasured;
        reasons.set(why, (reasons.get(why) ?? 0) + 1);
        continue;
      }
      const large = text.sizePx >= 24 || (text.sizePx >= 18.66 && text.weight >= 700);
      const needed = large ? 3 : 4.5;
      if (ratio < needed) contrastRows.push({ ratio, key: `${ratio.toFixed(2)} to 1, where ${String(needed)} to 1 is the usual least, on ${text.where}`, width: p.width, label: p.label });
    }
  }
  const ratioOf = new Map(contrastRows.map((row) => [row.key, row.ratio]));
  const contrastLines = atWidths(contrastRows, readingsAt).map((line) => ({ ratio: ratioOf.get(line.key) ?? 0, line: line.text })).sort((a, b) => a.ratio - b.ratio || (a.line < b.line ? -1 : 1));

  // Each reading on its own, and only the text that a person can read in that window (campaign A2, finding J-7).
  const contentLines: string[] = [];
  const required: [string, string][] = [['business name', mockupBrief.business], ['headline', mockupBrief.headline], ['primary action', mockupBrief.primaryAction]];
  for (const [label, wanted] of required) {
    const missing = good.filter((p) => !collapse(p.collected.shownText).includes(collapse(wanted))).map((p) => p.label);
    if (missing.length > 0) contentLines.push(`the ${label} is not where a person can read it at ${missing.join('; ')}: "${wanted}"`);
  }

  // Sideways scrolling, and text cut off at the window's edge where nothing lets a person reach it (campaign A2, finding J-18).
  const widthLines = atWidths(good.flatMap((p) => [
    ...(p.collected.scrollWidth > p.collected.clientWidth ? [{ key: `the page is wider than its window (${String(p.collected.scrollWidth)} against ${String(p.collected.clientWidth)})`, width: p.width, label: p.label }] : []),
    ...(p.collected.cutOff.length > 0 ? [{ key: `${count(p.collected.cutOff.length)} reach past the window's edge and are cut off, first ${p.collected.cutOff[0] ?? ''}`, width: p.width, label: p.label }] : []),
  ]), readingsAt).map((line) => line.text);

  const colorNote = `A color is a deviation when it is not one of the Prescription's opaque colors. Pseudo-elements, outlines, and text strokes are compared too.${filtered > 0 ? ` ${String(filtered)} drawn ${filtered === 1 ? 'color passes' : 'colors pass'} through a CSS filter, which changes ${filtered === 1 ? 'it' : 'them'} before ${filtered === 1 ? 'it reaches' : 'they reach'} the screen, and ${filtered === 1 ? 'was' : 'were'} not compared.` : ''}${translucent.size > 0 ? ` ${String(translucent.size)} partly transparent ${translucent.size === 1 ? 'color was' : 'colors were'} not compared.` : ''}${unreadColors > 0 ? ` ${String(unreadColors)} drawn ${unreadColors === 1 ? 'color' : 'colors'} could not be read and ${unreadColors === 1 ? 'was' : 'were'} not compared.` : ''}`;
  const whyUnread = [...reasons].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([why, n]) => `${String(n)} because ${why}`).join('; ');
  const contrastNote = `The ratio of each text to its background by the WCAG 2.x formula. The Prescription holds no Floors yet, so no ratio is a deviation from it; the lines show texts below the usual least.${unreadable > 0 ? ` ${String(unreadable)} text readings (one for each text and window width) could not be measured: ${whyUnread}.` : ''}`;
  const pageErrors = [...new Set(good.flatMap((p) => p.errors.map((e) => [...shown(e)].slice(0, 200).join(''))))].sort().slice(0, 5);
  const most = (pick: (c: Collected) => number): number => Math.max(0, ...good.map((p) => pick(p.collected)));
  return {
    loadFailures,
    pageErrors,
    scripts: { inline: Math.max(source.inline, most((c) => c.scripts.inline)), external: Math.max(source.external, most((c) => c.scripts.external)) },
    measured: [
      measureOf('requests', 'Requests: the page asks for nothing from another site', 'Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page\u2019s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.', [...requests], failed, [...ownAddress]),
      measureOf('colors', 'Colors: every color that the page draws is a color of the Prescription', colorNote, grouped(colorRows, (key, n, first) => `${key}: ${count(n)}, first ${first}`), failed + unreadColors + filtered),
      measureOf('typefaces', 'Typefaces: every text names a typeface of the Prescription', 'The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Prescription typeface’s name to a font installed on the machine is a deviation.', [...grouped(fontRows, (key, n, first) => `typeface "${key}": ${count(n)}, first ${first}`), ...aliases], failed),
      measureOf('radii', 'Corner radii: every drawn box uses a radius of the Prescription', 'Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.', grouped(radiusRows, (key, n, first) => `radius ${key}: ${count(n)}, first ${first}`), failed),
      measureOf('contrast', 'Contrast: measured, not required', contrastNote, contrastLines.map((c) => c.line), unreadable + failed),
      measureOf('content', 'Content: the three required texts of the Brief are where a person can read them', 'The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, and inside the window.', contentLines, failed),
      measureOf('width', 'Width: the page is not wider than its window', 'Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.', widthLines, failed),
    ],
  };
}

const count = (n: number): string => `${String(n)} ${n === 1 ? 'element' : 'elements'}`;

export async function fit(input: FitInput): Promise<FitResult> {
  const design = readDesignValues(input.files);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const browser = input.browser ?? (await chromium.launch({ ...input.launch, args: [...(input.launch?.args ?? []), ...LAUNCH_ARGS] }));
  try {
    // The four windows are read side by side; their order in the receipt is fixed, so the same inputs give the same receipt.
    const passes: Pass[] = (await Promise.all(READINGS.map((reading) => readAt(browser, input.html, reading, ms)))).flat();
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
      loadFailures,
    };
    // "Not measured" is never "no deviation": anything not measured in the six measured things gives status 1 (decision D69, A1-07).
    const six = measured.filter((m) => m.id !== 'contrast');
    const status = six.some((m) => m.deviations > 0 || m.notMeasured > 0) || loadFailures.length > 0 ? 1 : 0;
    return { receipt, markdown: receiptMarkdown(receipt), status };
  } finally {
    if (!input.browser) await browser.close();
  }
}

async function readMockupBrief(browser: Browser, mockup: string, ms: number): Promise<ReturnType<typeof readBrief>> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  let brief: ReturnType<typeof readBrief>;
  try {
    const page = await context.newPage();
    await context.route('**/*', (route) => route.abort());
    await context.routeWebSocket(() => true, (socket) => socket.close());
    await within(page.setContent(mockup, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the Mockup did not load');
    // Read from a world of its own, as the build is: a script in a changed mockup.html cannot blank or forge the texts (finding A1-14).
    brief = await within(readInOwnWorld(page, readBrief), ms, 'the Mockup did not answer');
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
