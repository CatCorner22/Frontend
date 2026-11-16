// The Fit check (SPEC.md sections 2.10, 2.13, and 2.15): open a build in a real browser at two window widths, measure it against the
// Prescription's design values, and write an Honest receipt. The program builds nothing and judges nothing.
// The page is untrusted. By default the window runs none of the page's scripts and has no network, and every text that comes
// from the page is checked and cleaned before it enters the receipt.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type LaunchOptions } from 'playwright';
import { contrastRatio, hexOf, over, parseRgba, type Rgba } from './color.ts';
import { collect, readBrief, type Collected, type TextRead } from './collect.ts';
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
  /** Run the page's own scripts. By default they do not run, because a page that runs a script can change what the program sees. */
  runScripts?: boolean;
}

export interface FitResult {
  receipt: Receipt;
  markdown: string;
  /** 0: no deviation in the six measured things. 1: at least one deviation, or a window that could not be measured. */
  status: 0 | 1;
}

export const WIDTHS = [375, 1280] as const;
const LISTED = 20;
const INFORMATION_LISTED = 50;
const LINE_MAX = 200;
const ERRORS_LISTED = 5;
const ELEMENTS_MAX = 20_000;
const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
/** A proxy at a port where nothing listens, for every address (`<-loopback>` includes this machine's own). A window that opens another window or moves itself still cannot reach any host. */
const DEAD_PROXY = { server: 'http://127.0.0.1:1', bypass: '<-loopback>' } as const;

/**
 * A text from the page, made safe to write into the receipt: line breaks become spaces; control characters and invisible format
 * characters (among them the tag characters and the direction signs) are removed; runs of white space become one space; the text
 * is cut at `max` characters (by code point).
 */
export function clean(text: unknown, max = LINE_MAX): string {
  const raw = typeof text === 'string' ? text.slice(0, max * 8) : String(text ?? '').slice(0, max * 8);
  const spaced = raw.replace(/[\r\n\u0085\u2028\u2029]+/g, ' ');
  const bare = spaced.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}\u{E0000}-\u{E007F}]/gu, '').replace(/\s+/g, ' ').trim();
  const points = [...bare];
  return points.length > max ? `${points.slice(0, max - 1).join('')}…` : bare;
}

const UNMEASURED_WHY: Record<string, string> = {
  fill: 'the text is filled by an image or a gradient',
  opacity: 'the text or a box around it is drawn partly transparent',
  image: 'an image or a gradient lies behind the text',
};

type Good = { width: number; collected: Collected; requests: string[]; errors: string[] };
type Pass = Good | { width: number; failure: string };

async function within<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(what)), ms); })]);
  } finally {
    clearTimeout(timer);
  }
}

/** A fixed sentence for a window that did not load. The browser's own message is never used: a page can shape it. */
function failureSentence(error: unknown, stage: 'load' | 'answer', ms: number): string {
  const message = error instanceof Error ? `${error.name} ${error.message}` : '';
  const late = /Timeout|did not finish loading|did not answer/.test(message);
  const what = !late ? 'the page could not be read' : stage === 'load' ? 'the page did not finish loading' : 'the page did not answer';
  return `${what} within ${String(ms)} milliseconds`;
}

const list = <T>(value: unknown, keep: (item: unknown) => item is T): T[] => (Array.isArray(value) ? value.slice(0, ELEMENTS_MAX).filter(keep) : []);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** What the page returned, checked: a page that runs scripts can return anything, so every field is read for its type and size. */
function checked(raw: unknown): Collected {
  const r = isObject(raw) ? raw : {};
  const scripts = isObject(r['scripts']) ? r['scripts'] : {};
  return {
    references: list(r['references'], isObject).map((x) => ({ kind: str(x['kind']), value: str(x['value']) })),
    scripts: { inline: num(scripts['inline']), external: num(scripts['external']) },
    drawn: list(r['drawn'], isObject).flatMap((x) => (x['kind'] === 'text' || x['kind'] === 'background' || x['kind'] === 'border' ? [{ kind: x['kind'], css: str(x['css']), where: str(x['where']) }] : [])),
    families: list(r['families'], isObject).map((x) => ({ family: str(x['family']), where: str(x['where']) })),
    radii: list(r['radii'], isObject).map((x) => ({ value: str(x['value']), where: str(x['where']) })),
    texts: list(r['texts'], isObject).map((x): TextRead => ({
      where: str(x['where']), foreground: str(x['foreground']),
      layers: Array.isArray(x['layers']) ? x['layers'].slice(0, 200).map(str) : null,
      unmeasured: x['unmeasured'] === 'fill' || x['unmeasured'] === 'opacity' || x['unmeasured'] === 'image' ? x['unmeasured'] : '',
      sizePx: num(x['sizePx'], 16), weight: num(x['weight'], 400),
    })),
    lines: Array.isArray(r['lines']) ? r['lines'].slice(0, ELEMENTS_MAX).map((line) => str(line).slice(0, 5000)) : [],
    scrollWidth: num(r['scrollWidth']),
    clientWidth: num(r['clientWidth']),
  };
}

async function measureAt(browser: Browser, html: string, width: number, ms: number, runScripts: boolean): Promise<Pass> {
  // No network at all: no request, WebSocket, popup, prefetch, or preconnect can leave the machine, whatever the page does.
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce', offline: true, javaScriptEnabled: runScripts, serviceWorkers: 'block', proxy: DEAD_PROXY });
  try {
    const requests: string[] = [];
    const errors: string[] = [];
    // Each request that the page tries is written down and stopped. The rule stands on the whole window group, so that a window
    // that the page opens, and a move of the page to another address, are stopped as well.
    await context.route('**/*', async (route) => {
      requests.push(route.request().url());
      await route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    let stage: 'load' | 'answer' = 'load';
    try {
      await within(page.setContent(html, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the page did not finish loading');
      stage = 'answer';
      const collected = checked(await within(page.evaluate(collect), ms, 'the page did not answer'));
      return { width, collected, requests, errors };
    } catch (error) {
      return { width, failure: failureSentence(error, stage, ms) };
    }
  } finally {
    // A page that never ends can hold its tab; the program stops waiting for the tab after a short time.
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase();
const count = (n: number): string => `${String(n)} ${n === 1 ? 'element' : 'elements'}`;

function measureOf(id: string, title: string, note: string, deviations: string[], notMeasured: number, information: string[] = []): Measure {
  const sorted = [...new Set(deviations.map((d) => clean(d)))].sort();
  const info = [...new Set(information.map((d) => clean(d)))].sort();
  return { id, title, deviations: sorted.length, notMeasured, items: sorted.slice(0, LISTED), more: Math.max(0, sorted.length - LISTED), note, information: info.slice(0, INFORMATION_LISTED), informationMore: Math.max(0, info.length - INFORMATION_LISTED) };
}

/** An address that points to another site: it has a scheme (`https:`, `mailto:`, and so on), or it begins with two slashes. */
export function isOtherSite(address: string): boolean {
  const t = address.replace(/[\t\n\r]/g, '').trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(t) || t.startsWith('//');
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

function contrastOf(text: TextRead): number | null {
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

type Brief = { business: string; headline: string; primaryAction: string };

function measures(design: DesignValues, passes: Pass[], brief: Brief): { measured: Measure[]; pageErrors: string[]; scripts: Receipt['scripts']; loadFailures: Receipt['loadFailures'] } {
  const good = passes.filter((p): p is Good => 'collected' in p);
  const loadFailures = passes.flatMap((p) => ('failure' in p ? [{ width: p.width, reason: p.failure }] : []));
  const failed = loadFailures.length;

  // Another site is a deviation. A reference at the page's own address is information: the page names it but, being one file, cannot ship it.
  const requests = new Set<string>();
  const ownKinds = new Map<string, Set<string>>();
  for (const p of good) {
    for (const url of p.requests) requests.add(`request to ${clean(url)}`);
    for (const ref of p.collected.references) {
      if (isOtherSite(ref.value)) requests.add(`reference (${clean(ref.kind, 40)}) to ${clean(ref.value)}`);
      else ownKinds.set(clean(ref.value, 150), (ownKinds.get(clean(ref.value, 150)) ?? new Set<string>()).add(clean(ref.kind, 40)));
    }
  }
  const ownAddress = [...ownKinds].map(([value, kinds]) => `${value} (${[...kinds].sort().join(', ')})`);

  const translucent = new Set<string>();
  let unreadable = 0;
  const colorRows: { key: string; where: string; width: number }[] = [];
  for (const p of good) {
    for (const item of p.collected.drawn) {
      const rgba = parseRgba(item.css);
      if (!rgba) { unreadable++; continue; }
      if (rgba.a === 0) continue;
      if (rgba.a < 1) { translucent.add(`partly transparent color ${clean(item.css, 60)}`); continue; }
      const hex = hexOf(rgba);
      if (!design.colors.has(hex)) colorRows.push({ key: `${item.kind} color ${hex}`, where: clean(item.where), width: p.width });
    }
  }

  const fontRows = good.flatMap((p) => p.collected.families.filter((f) => !design.typefaces.has(clean(f.family).toLowerCase())).map((f) => ({ key: clean(f.family, 80), where: clean(f.where), width: p.width })));
  const radiusRows = good.flatMap((p) => p.collected.radii.filter((r) => { const px = /^([\d.]+)px$/.exec(r.value); return !px || !design.radii.has(Number(px[1])); }).map((r) => ({ key: clean(r.value, 40), where: clean(r.where), width: p.width })));

  const contrastLines: { ratio: number; line: string }[] = [];
  let unmeasuredReadings = 0;
  const reasons = new Map<string, number>();
  for (const p of good) {
    for (const text of p.collected.texts) {
      const ratio = contrastOf(text);
      if (ratio === null) {
        unmeasuredReadings++;
        const why = UNMEASURED_WHY[text.unmeasured] ?? 'a color could not be read';
        reasons.set(why, (reasons.get(why) ?? 0) + 1);
        continue;
      }
      const large = text.sizePx >= 24 || (text.sizePx >= 18.66 && text.weight >= 700);
      const needed = large ? 3 : 4.5;
      if (ratio < needed) contrastLines.push({ ratio, line: `${ratio.toFixed(2)} to 1, where ${String(needed)} to 1 is the usual least, on ${clean(text.where)} at ${String(p.width)} pixels` });
    }
  }
  contrastLines.sort((a, b) => a.ratio - b.ratio || (a.line < b.line ? -1 : 1));

  const contentLines: string[] = [];
  let emptyRequired = 0;
  const required: [string, string][] = [['business name', brief.business], ['headline', brief.headline], ['primary action', brief.primaryAction]];
  for (const [, wanted] of required) if (wanted === '') emptyRequired++;
  for (const p of good) {
    // A required text must stand inside one block of text: across the end of one block and the start of the next it does not count.
    const seen = p.collected.lines.map(collapse);
    for (const [label, wanted] of required) if (wanted !== '' && !seen.some((line) => line.includes(collapse(wanted)))) contentLines.push(`the ${label} is not in the page's visible text at ${String(p.width)} pixels: "${clean(wanted, 80)}"`);
  }

  const widthLines = good.filter((p) => p.collected.scrollWidth > p.collected.clientWidth).map((p) => `the page is wider than its window at ${String(p.width)} pixels (${String(p.collected.scrollWidth)} against ${String(p.collected.clientWidth)})`);

  const colorNote = `A color is a deviation when it is not one of the Prescription's opaque colors.${unreadable > 0 ? ` ${String(unreadable)} colors could not be read (a notation such as oklch() or color-mix()) and are counted as not measured.` : ''} Partly transparent colors are listed as information and not compared.`;
  const whyUnread = [...reasons].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([why, n]) => `${String(n)} because ${why}`).join('; ');
  const contrastNote = `The ratio of each text to its background by the WCAG 2.x formula. No program checks a Floor of the Prescription yet, so no ratio is a deviation from it; the lines show texts below the usual least.${unmeasuredReadings > 0 ? ` ${String(unmeasuredReadings)} text readings (one for each text and window width) could not be measured: ${whyUnread}.` : ''}`;
  const pageErrors = [...new Set(good.flatMap((p) => p.errors.map((e) => clean(e))))].sort().slice(0, ERRORS_LISTED);
  const most = (pick: (c: Collected) => number): number => Math.max(0, ...good.map((p) => pick(p.collected)));
  return {
    loadFailures,
    pageErrors,
    scripts: { inline: most((c) => c.scripts.inline), external: most((c) => c.scripts.external) },
    measured: [
      measureOf('requests', 'Requests: the page asks for nothing from another site', 'Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.', [...requests], failed, ownAddress),
      measureOf('colors', 'Colors: every color that the page draws is a color of the Prescription', colorNote, grouped(colorRows, (key, n, first) => `${key}: ${count(n)}, first ${first}`), failed + unreadable, [...translucent]),
      measureOf('typefaces', 'Typefaces: every text uses a typeface that the Prescription names', 'The first family of each text is compared; a fallback after it is not.', grouped(fontRows, (key, n, first) => `typeface "${key}": ${count(n)}, first ${first}`), failed),
      measureOf('radii', 'Corner radii: every drawn box uses a radius of the Prescription', 'Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.', grouped(radiusRows, (key, n, first) => `radius ${key}: ${count(n)}, first ${first}`), failed),
      measureOf('contrast', 'Contrast: measured, not required', contrastNote, contrastLines.map((c) => c.line), unmeasuredReadings + failed),
      measureOf('content', 'Content: the three required texts of the Brief are on the page', 'The business name, the headline, and the primary action, as the Mockup shows them, compared at each window width without regard to letter case or runs of white space. A text that is empty in the Mockup is counted as not measured.', contentLines, failed + emptyRequired),
      measureOf('width', 'Width: the page is not wider than its window', 'Measured at each window width; sideways scrolling is a deviation.', widthLines, failed),
    ],
  };
}

export async function fit(input: FitInput): Promise<FitResult> {
  const design = readDesignValues(input.files);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const runScripts = input.runScripts === true;
  const browser = input.browser ?? (await chromium.launch(input.launch ?? {}));
  try {
    const passes: Pass[] = [];
    for (const width of WIDTHS) passes.push(await measureAt(browser, input.html, width, ms, runScripts));
    const brief = await readMockupBrief(browser, input.files['mockup.html'] ?? '', ms);
    const { measured, pageErrors, scripts, loadFailures } = measures(design, passes, brief);
    const receipt: Receipt = {
      fingerprint: design.fingerprint,
      build: { bytes: Buffer.byteLength(input.html, 'utf8'), sha256: createHash('sha256').update(input.html, 'utf8').digest('hex') },
      widths: [...WIDTHS],
      scriptsRan: runScripts,
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

async function readMockupBrief(browser: Browser, mockup: string, ms: number): Promise<Brief> {
  // The Mockup is the Studio's own file, and it holds no script; the window has no script and no network all the same.
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, offline: true, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.route('**/*', (route) => route.abort());
    await within(page.setContent(mockup, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the Mockup did not load');
    const read = await within(page.evaluate(readBrief), ms, 'the Mockup did not answer');
    return { business: str(read.business), headline: str(read.headline), primaryAction: str(read.primaryAction) };
  } catch {
    throw new FitError('The file "mockup.html" could not be opened to read the three required texts.');
  } finally {
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}
