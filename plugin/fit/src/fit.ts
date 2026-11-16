// The Fit check, first slice (SPEC.md section 2.10): open a build in a real browser at two window widths, measure it against the
// Prescription's design values, and write an Honest receipt. The program builds nothing and judges nothing.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type LaunchOptions, type Page } from 'playwright';
import { contrastRatio, hexOf, over, parseRgba, type Rgba } from './color.ts';
import { collect, readBrief, type Collected } from './collect.ts';
import { FitError, readDesignValues, type DesignValues } from './prescription.ts';
import { STILL_NEEDS_A_PERSON, receiptMarkdown, type Measure, type Receipt } from './receipt.ts';

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
const LISTED = 20;
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

/** One window width. A width that could not be read still keeps the requests that its page made before it failed. */
type Pass = { width: number; requests: string[] } & ({ collected: Collected; errors: string[] } | { failure: string });

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

async function measureAt(browser: Browser, html: string, width: number, ms: number): Promise<Pass> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const requests: string[] = [];
  try {
    // Nothing leaves the machine: every request is written down and stopped. The block stands on the whole browser context, because a
    // block on the page alone misses a window that the page opens (finding A1-01). A WebSocket passes no ordinary route, so it has a
    // block of its own: the program writes it down and closes it without ever connecting to a server.
    await context.route('**/*', async (route) => {
      requests.push(route.request().url());
      await route.abort();
    });
    await context.routeWebSocket(() => true, async (socket) => {
      requests.push(socket.url());
      await socket.close();
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await within(page.setContent(html, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the page did not finish loading');
      const collected = await within(readInOwnWorld(page, collect), ms, 'the page did not answer');
      return { width, collected, requests, errors };
    } catch (error) {
      // The requests made before the failure stay in the receipt (finding A1-02).
      return { width, failure: `${error instanceof Error ? error.message : 'the page could not be read'} within ${String(ms)} milliseconds`, requests: [...requests] };
    }
  } finally {
    // A page that never ends can hold its tab; the program stops waiting for the tab after a short time.
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase();

const INFORMATION_LISTED = 50;

function measureOf(id: string, title: string, note: string, deviations: string[], notMeasured: number, information: string[] = []): Measure {
  const sorted = [...deviations].sort();
  const info = [...information].sort();
  return { id, title, deviations: sorted.length, notMeasured, items: sorted.slice(0, LISTED), more: Math.max(0, sorted.length - LISTED), note, information: info.slice(0, INFORMATION_LISTED), informationMore: Math.max(0, info.length - INFORMATION_LISTED) };
}

/** A stand-in for the address of the site that will serve the page. The name ends in `.invalid`, which no real site can have. */
const OWN_SITE = 'https://own-site.invalid/page/';

/**
 * An address that a browser would fetch from another site, or that is not a web address of the site at all (`mailto:`,
 * `javascript:`). The address parser of the URL standard decides, the same parser that browsers use, because a pattern of text
 * misreads what a browser reads (audit finding A1-08): a browser treats `\\cdn.example/x` and `/\cdn.example/x` as
 * `//cdn.example/x`, and deletes a tab or a line break anywhere in an address, so `h<tab>ttps://cdn.example` is `https://cdn.example`.
 * An address that the parser refuses counts as another site, so that doubt is never "no deviation".
 */
export function isOtherSite(address: string): boolean {
  try {
    return new URL(address, OWN_SITE).origin !== new URL(OWN_SITE).origin;
  } catch {
    return true;
  }
}

/** One line for each different value, with how many elements show it and the first one. The count is the largest over the window widths. */
function grouped(rows: { key: string; where: string; width: number }[], describe: (key: string, elements: number, first: string) => string): string[] {
  const byKey = new Map<string, { perWidth: Map<number, number>; first: string }>();
  for (const row of rows) {
    const entry = byKey.get(row.key) ?? { perWidth: new Map<number, number>(), first: row.where };
    entry.perWidth.set(row.width, (entry.perWidth.get(row.width) ?? 0) + 1);
    byKey.set(row.key, entry);
  }
  return [...byKey].map(([key, entry]) => describe(key, Math.max(...entry.perWidth.values()), entry.first));
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

function measures(design: DesignValues, passes: Pass[], mockupBrief: { business: string; headline: string; primaryAction: string }): { measured: Measure[]; pageErrors: string[]; scripts: Receipt['scripts']; loadFailures: Receipt['loadFailures'] } {
  const good = passes.filter((p): p is Extract<Pass, { collected: Collected }> => 'collected' in p);
  const loadFailures = passes.flatMap((p) => ('failure' in p ? [{ width: p.width, reason: p.failure }] : []));
  const failed = loadFailures.length;

  // Another site is a deviation. A reference at the page's own address is information: the page names it but, being one file, cannot ship it.
  const requests = new Set<string>();
  const ownAddress = new Set<string>();
  for (const p of passes) for (const url of p.requests) requests.add(`request to ${url}`);
  for (const p of good) {
    for (const ref of p.collected.references) {
      if (isOtherSite(ref.address)) requests.add(`reference (${ref.kind}) to ${ref.value}`);
      else ownAddress.add(`${ref.kind}: ${ref.value}`);
    }
  }

  const translucent = new Set<string>();
  // A color that the program cannot read is counted as not measured, never passed over in silence (finding A1-03).
  let unreadColors = 0;
  const colorRows: { key: string; where: string; width: number }[] = [];
  for (const p of good) {
    for (const item of p.collected.drawn) {
      const rgba = parseRgba(item.css);
      if (!rgba) { unreadColors++; continue; }
      if (rgba.a === 0) continue;
      if (rgba.a < 1) { translucent.add(item.css); continue; }
      const hex = hexOf(rgba);
      if (!design.colors.has(hex)) colorRows.push({ key: `${item.kind} color ${hex}`, where: item.where, width: p.width });
    }
  }

  const fontRows = good.flatMap((p) => p.collected.families.filter((f) => !design.typefaces.has(f.family.toLowerCase())).map((f) => ({ key: f.family, where: f.where, width: p.width })));
  const radiusRows = good.flatMap((p) => p.collected.radii.filter((r) => { const px = /^([\d.]+)px$/.exec(r.value); return !px || !design.radii.has(Number(px[1])); }).map((r) => ({ key: r.value, where: r.where, width: p.width })));

  const contrastLines: { ratio: number; line: string }[] = [];
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
      if (ratio < needed) contrastLines.push({ ratio, line: `${ratio.toFixed(2)} to 1, where ${String(needed)} to 1 is the usual least, on ${text.where} at ${String(p.width)} pixels` });
    }
  }
  contrastLines.sort((a, b) => a.ratio - b.ratio || (a.line < b.line ? -1 : 1));

  const seen = collapse(good.map((p) => p.collected.bodyText).join(' | '));
  const contentLines: string[] = [];
  if (good.length > 0) {
    const required: [string, string][] = [['business name', mockupBrief.business], ['headline', mockupBrief.headline], ['primary action', mockupBrief.primaryAction]];
    for (const [label, wanted] of required) if (wanted !== '' && !seen.includes(collapse(wanted))) contentLines.push(`the ${label} is not in the page's visible text: "${wanted}"`);
  }

  const widthLines = good.filter((p) => p.collected.scrollWidth > p.collected.clientWidth).map((p) => `the page is wider than its window at ${String(p.width)} pixels (${String(p.collected.scrollWidth)} against ${String(p.collected.clientWidth)})`);

  const colorNote = `A color is a deviation when it is not one of the Prescription's opaque colors.${translucent.size > 0 ? ` ${String(translucent.size)} partly transparent ${translucent.size === 1 ? 'color was' : 'colors were'} not compared.` : ''}${unreadColors > 0 ? ` ${String(unreadColors)} drawn ${unreadColors === 1 ? 'color' : 'colors'} could not be read and ${unreadColors === 1 ? 'was' : 'were'} not compared.` : ''}`;
  const whyUnread = [...reasons].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([why, n]) => `${String(n)} because ${why}`).join('; ');
  const contrastNote = `The ratio of each text to its background by the WCAG 2.x formula. The Prescription holds no Floors yet, so no ratio is a deviation from it; the lines show texts below the usual least.${unreadable > 0 ? ` ${String(unreadable)} text readings (one for each text and window width) could not be measured: ${whyUnread}.` : ''}`;
  const pageErrors = [...new Set(good.flatMap((p) => p.errors.map((e) => e.slice(0, 200))))].sort().slice(0, 5);
  const most = (pick: (c: Collected) => number): number => Math.max(0, ...good.map((p) => pick(p.collected)));
  return {
    loadFailures,
    pageErrors,
    scripts: { inline: most((c) => c.scripts.inline), external: most((c) => c.scripts.external) },
    measured: [
      measureOf('requests', 'Requests: the page asks for nothing from another site', 'Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page\u2019s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.', [...requests], failed, [...ownAddress]),
      measureOf('colors', 'Colors: every color that the page draws is a color of the Prescription', colorNote, grouped(colorRows, (key, n, first) => `${key}: ${count(n)}, first ${first}`), failed + unreadColors),
      measureOf('typefaces', 'Typefaces: every text uses a typeface that the Prescription names', 'The first family of each text is compared; a fallback after it is not.', grouped(fontRows, (key, n, first) => `typeface "${key}": ${count(n)}, first ${first}`), failed),
      measureOf('radii', 'Corner radii: every drawn box uses a radius of the Prescription', 'Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.', grouped(radiusRows, (key, n, first) => `radius ${key}: ${count(n)}, first ${first}`), failed),
      measureOf('contrast', 'Contrast: measured, not required', contrastNote, contrastLines.map((c) => c.line), unreadable + failed),
      measureOf('content', 'Content: the three required texts of the Brief are on the page', 'The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space.', contentLines, failed),
      measureOf('width', 'Width: the page is not wider than its window', 'Measured at each window width; sideways scrolling is a deviation.', widthLines, failed),
    ],
  };
}

const count = (n: number): string => `${String(n)} ${n === 1 ? 'element' : 'elements'}`;

export async function fit(input: FitInput): Promise<FitResult> {
  const design = readDesignValues(input.files);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const browser = input.browser ?? (await chromium.launch(input.launch ?? {}));
  try {
    const passes: Pass[] = [];
    for (const width of WIDTHS) passes.push(await measureAt(browser, input.html, width, ms));
    const brief = await readMockupBrief(browser, input.files['mockup.html'] ?? '', ms);
    const { measured, pageErrors, scripts, loadFailures } = measures(design, passes, brief);
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
    const six = measured.filter((m) => m.id !== 'contrast');
    const status = six.some((m) => m.deviations > 0) || loadFailures.length > 0 ? 1 : 0;
    return { receipt, markdown: receiptMarkdown(receipt), status };
  } finally {
    if (!input.browser) await browser.close();
  }
}

async function readMockupBrief(browser: Browser, mockup: string, ms: number): Promise<ReturnType<typeof readBrief>> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  try {
    const page = await context.newPage();
    await context.route('**/*', (route) => route.abort());
    await context.routeWebSocket(() => true, (socket) => socket.close());
    await within(page.setContent(mockup, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the Mockup did not load');
    return await within(page.evaluate(readBrief), ms, 'the Mockup did not answer');
  } catch {
    throw new FitError('The file "mockup.html" could not be opened to read the three required texts.');
  } finally {
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}
