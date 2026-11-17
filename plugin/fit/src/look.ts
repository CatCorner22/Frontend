// The look (PLAN.md section 4.5: "Claude receives the measured failures and the screenshots"; section 13.5, step 13a: "Read what is
// drawn, not only what the styles say"; SPEC.md section 2.23 lists both as not built). The Fit check reads the styles that the
// browser computes. It never sees the page, and neither does the model that built the page. This file draws the build and the
// Vision's Mockup in a real browser at the Fit check's three window widths, saves the pictures so that a model or a person can look
// at them, and reads three things from what was drawn:
//   1. how much of the build's picture differs from the Mockup's picture, and where;
//   2. large areas of one color that is neither a color of the Vision nor a color that the Mockup draws;
//   3. whether each typeface of the Vision is drawn, or only named while a fallback draws the letters.
// The program judges nothing. No reading here is a deviation, and none changes the status of the Fit check: a picture can differ
// from the Mockup for a good reason (another page, other content). The readings say where to look.
//
// The page is untrusted, as in the Fit check: it is served at the stand-in address of the site, every other request is stopped, and
// the typefaces are read from a world of the program's own. The pixels are read in a blank page of the program's own, which the
// build never enters. Nothing that the page writes enters the report: the report holds numbers, color values, and the Vision's own
// typeface names.
import { createHash } from 'node:crypto';
import { chromium, type Browser, type BrowserContext, type LaunchOptions, type Page } from 'playwright';
import { LAUNCH_ARGS, WIDTHS } from './fit.ts';
import { FitError, readDesignValues } from './vision.ts';

export { FitError } from './vision.ts';

export interface LookInput {
  /** The Vision's files by name, as for the Fit check. `FONTS.md` is read too when `fonts` is given. */
  files: Readonly<Record<string, string | undefined>>;
  /** The built page. */
  html: string;
  /** A browser to reuse. When it is missing, the program starts one and closes it at the end. */
  browser?: Browser;
  launch?: LaunchOptions;
  /** How long a window may take to load and answer, in milliseconds. */
  loadTimeoutMs?: number;
  /** Run the page's own scripts, as a visitor's browser does. The default is true. */
  runScripts?: boolean;
  /**
   * The site's font files by file name (for example `fraunces-latin-wght-normal.woff2`). A built page is one file and ships no font,
   * so without these the pictures show fallback letters. With them, the program answers the page's request for a file of that name
   * at the site's own address, and gives the Mockup the files that `FONTS.md` names.
   */
  fonts?: Readonly<Record<string, Uint8Array>>;
}

export interface LookPicture {
  /** The file name, for example `compare-1280.png` or `build-375-2.png`. */
  name: string;
  width: number;
  kind: 'compare' | 'build';
  /** One sentence in plain words on what the picture shows. */
  what: string;
  png: Buffer;
}

export interface LookColor {
  /** The mean color of the area, as `#rrggbb`. */
  hex: string;
  /** The share of the build's picture that the area covers, in percent with one decimal. */
  percent: number;
  /** The nearest opaque color of the Vision. */
  nearest: string;
}

export interface LookTypeface {
  /** The typeface's CSS family name, as the Vision writes it. */
  family: string;
  /** How many texts of the page name it first. */
  texts: number;
  /** True when the browser draws letters of this typeface; false when a fallback draws them; null when the program could not tell. */
  drawn: boolean | null;
  /** True when the page loaded the typeface from a file. False with `drawn` true means a font installed on the machine. */
  fromFile: boolean;
}

export interface LookWidth {
  width: number;
  /** The height of the build's page in pixels, and of the Mockup's. */
  buildHeight: number;
  mockupHeight: number;
  /** True when the build is longer than the program pictures (`MAX_HEIGHT`); the rest is not pictured and not read. */
  cut: boolean;
  /** The share of the picture in which build and Mockup differ, in percent with one decimal. */
  differs: number;
  /** The same share for each part of `PART_HEIGHT` pixels, from the top. */
  parts: number[];
  colors: LookColor[];
  typefaces: LookTypeface[];
}

export interface Look {
  fingerprint: string;
  build: { bytes: number; sha256: string };
  scriptsRan: boolean;
  /** True when the caller gave font files; the report says which typefaces were drawn either way. */
  fontsGiven: boolean;
  widths: LookWidth[];
  /** Window widths at which the build could not be pictured, with a fixed sentence that says why. */
  failures: { width: number; reason: string }[];
  pictures: { name: string; width: number; kind: 'compare' | 'build'; what: string }[];
}

export interface LookResult {
  look: Look;
  pictures: LookPicture[];
  markdown: string;
  /** 0: every window width was pictured. 1: at least one was not. */
  status: 0 | 1;
}

/** The height of one part of a page, in pixels: the pictures of the build are cut into parts of this height, so that a model reads them in full size. */
export const PART_HEIGHT = 1000;
/** The longest page that the program pictures. A longer build is cut here, and the report says so. */
export const MAX_HEIGHT = 12 * PART_HEIGHT;
/** Two pixels differ when one of their three channels differs by more than this (0 to 255). Smoothed edges of letters stay below it. */
export const PIXEL_TOLERANCE = 24;
/** A color that stands up to this many pixels from its place in the other picture counts as the same: letters drawn a pixel aside are the same letters. */
export const PIXEL_SHIFT = 2;
/** An area counts as large when it covers at least this share of the picture, in percent. */
export const AREA_PERCENT = 0.5;
/** A color is one of the Vision's, or one that the Mockup draws, when each of its channels is this near (0 to 255). */
export const COLOR_TOLERANCE = 10;
const COLORS_LISTED = 8;

/**
 * The launch settings of the look: those of the Fit check, and letters smoothed in gray only. On some machines a browser smooths
 * letters with colored edges in one page and gray edges in another (it depends on how the page is layered); those colored edges
 * would count as differences that no visitor's design holds. A caller that passes its own browser should launch it with these.
 */
export const LOOK_LAUNCH_ARGS: readonly string[] = [...LAUNCH_ARGS, '--disable-lcd-text'];

// The same stand-in address and the same closed network as the Fit check (fit.ts keeps these two to itself).
const OWN_SITE = 'https://own-site.invalid/page/';
const DEAD_PROXY = { server: 'http://127.0.0.1:1', bypass: '<-loopback>' } as const;
const WORLD = 'refraction-fit-look';

async function within<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(what)), ms); })]);
  } finally {
    clearTimeout(timer);
  }
}

/** Runs an expression in a world of the program's own inside the page; no script of the page can reach it or change what it reads. */
async function inOwnWorld<T>(page: Page, expression: string, ms: number): Promise<T> {
  const session = await page.context().newCDPSession(page);
  try {
    const { frameTree } = await session.send('Page.getFrameTree');
    const { executionContextId } = await session.send('Page.createIsolatedWorld', { frameId: frameTree.frame.id, worldName: WORLD });
    const { result, exceptionDetails } = await within(session.send('Runtime.evaluate', { expression, contextId: executionContextId, returnByValue: true, awaitPromise: true }), ms, 'the page did not answer');
    if (exceptionDetails) throw new Error('the program could not read the page');
    return result.value as T;
  } finally {
    await session.detach().catch(() => undefined);
  }
}

interface PageFacts {
  height: number;
  typefaces: LookTypeface[];
}

/** Runs inside the page, in the program's own world. It stands alone: it uses nothing from this file. */
function readPage(families: string[]): PageFacts {
  const first = (value: string): string => (value.split(',')[0] ?? '').trim().replace(/^["']|["']$/g, '').toLowerCase();
  const named = new Map<string, number>();
  const all = document.querySelectorAll('body, body *');
  for (let at = 0; at < all.length && at < 20000; at++) {
    const element = all[at] as Element;
    // The text of a script or a style sheet is not drawn.
    if (/^(script|style|noscript|template)$/i.test(element.localName)) continue;
    let ownText = false;
    for (const node of element.childNodes) if (node.nodeType === 3 && (node.nodeValue ?? '').trim() !== '') ownText = true;
    if (!ownText) continue;
    const family = first(getComputedStyle(element).fontFamily);
    named.set(family, (named.get(family) ?? 0) + 1);
  }
  const canvas = document.createElement('canvas');
  const pen = canvas.getContext('2d');
  // Letters of very different widths: two typefaces rarely give this line the same width.
  const sample = 'mmmmmmmmmmlli10OQ@ The quick brown fox';
  const widthOf = (font: string): number => {
    if (!pen) return -1;
    pen.font = font;
    return pen.measureText(sample).width;
  };
  const typefaces = families.map((family) => {
    const texts = named.get(family.toLowerCase()) ?? 0;
    let fromFile = false;
    for (const face of document.fonts) if (first(face.family) === family.toLowerCase() && face.status === 'loaded') fromFile = true;
    // A name with a sign that could end the quoted name is not tried.
    if (!pen || !/^[\w .-]+$/.test(family)) return { family, texts, drawn: null, fromFile };
    // The typeface is drawn when it changes the width of a line against either fallback alone.
    const drawn = widthOf(`72px "${family}", monospace`) !== widthOf('72px monospace') || widthOf(`72px "${family}", serif`) !== widthOf('72px serif');
    return { family, texts, drawn, fromFile };
  });
  const root = document.documentElement;
  return { height: Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0), typefaces };
}

type Drawn = { png: Buffer; height: number; cut: boolean; typefaces: LookTypeface[] };

/** A fixed sentence for a window that could not be pictured. The browser's own message is never used: a page can shape it. */
function failureSentence(error: unknown, ms: number): string {
  const message = error instanceof Error ? `${error.name} ${error.message}` : '';
  return /Timeout|did not finish loading|did not answer/.test(message) ? `the page did not finish loading or did not answer within ${String(ms)} milliseconds` : 'the page could not be pictured';
}

const fileNameOf = (url: string): string => decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');

/** Opens one page in a window of its own, with no network, and draws it. `fonts` are served at the site's own address by file name. */
async function draw(browser: Browser, html: string, width: number, ms: number, runScripts: boolean, families: readonly string[], fonts: Readonly<Record<string, Uint8Array>>): Promise<Drawn> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce', javaScriptEnabled: runScripts, serviceWorkers: 'block', proxy: DEAD_PROXY });
  try {
    const site = new URL(OWN_SITE).origin;
    let served = false;
    await context.route('**/*', async (route) => {
      const url = route.request().url();
      if (url === OWN_SITE && !served) {
        served = true;
        await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
        return;
      }
      let font: Uint8Array | undefined;
      try {
        if (new URL(url).origin === site && Object.hasOwn(fonts, fileNameOf(url))) font = fonts[fileNameOf(url)];
      } catch {
        // An address that cannot be read is stopped like every other.
      }
      if (font) await route.fulfill({ status: 200, contentType: 'font/woff2', body: Buffer.from(font) });
      else await route.abort();
    });
    await context.routeWebSocket(() => true, (socket) => socket.close());
    const page = await context.newPage();
    await within(page.goto(OWN_SITE, { waitUntil: 'load', timeout: ms }), ms + 1000, 'the page did not finish loading');
    // The letters are drawn in their typefaces only after the font files have arrived; a file that never arrives ends the wait.
    await inOwnWorld<boolean>(page, 'Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 3000))]).then(() => true)', ms).catch(() => false);
    const facts = await inOwnWorld<PageFacts>(page, `(${readPage.toString()})(${JSON.stringify(families)})`, ms);
    const height = Math.max(1, Math.round(Number(facts.height) || 0));
    const cut = height > MAX_HEIGHT;
    const png = await within(page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide', clip: { x: 0, y: 0, width, height: Math.min(height, MAX_HEIGHT) }, timeout: ms }), ms + 1000, 'the page did not answer');
    const typefaces = (Array.isArray(facts.typefaces) ? facts.typefaces : []).map((t, at) => ({ family: families[at] ?? '', texts: Math.max(0, Math.round(Number(t.texts) || 0)), drawn: typeof t.drawn === 'boolean' ? t.drawn : null, fromFile: t.fromFile === true }));
    return { png, height, cut, typefaces };
  } finally {
    await within(context.close(), 5000, 'close').catch(() => undefined);
  }
}

interface PixelInput {
  build: string;
  mockup: string;
  width: number;
  partHeight: number;
  pixelTolerance: number;
  /** How many pixels a color may stand away from its place and still count as the same. */
  shift: number;
  areaPercent: number;
  colorTolerance: number;
  /** The Vision's opaque colors, as [r, g, b]. */
  palette: [number, number, number][];
  /** How many parts stand side by side in one picture of the build. */
  columns: number;
}

interface PixelOutput {
  differs: number;
  parts: number[];
  colors: { rgb: [number, number, number]; share: number; nearest: [number, number, number] | null }[];
  compare: string;
  strips: { from: number; to: number; png: string }[];
}

/**
 * Runs in a blank page of the program's own. It reads the two pictures pixel by pixel and draws the pictures that the program saves.
 * It stands alone: it uses nothing from this file. Every text that it draws is a fixed label.
 */
async function readPixels(input: PixelInput): Promise<PixelOutput> {
  const load = async (base64: string) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const pen = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    pen.drawImage(image, 0, 0);
    return { canvas, width: canvas.width, height: canvas.height, data: pen.getImageData(0, 0, canvas.width, canvas.height).data };
  };
  const build = await load(input.build);
  const mockup = await load(input.mockup);
  const width = input.width;
  const height = Math.max(build.height, mockup.height);

  type Picture = { width: number; height: number; data: Uint8ClampedArray };
  const same = (one: Uint8ClampedArray, at: number, other: Uint8ClampedArray, there: number): boolean =>
    Math.abs((one[at] ?? 0) - (other[there] ?? 0)) <= input.pixelTolerance
    && Math.abs((one[at + 1] ?? 0) - (other[there + 1] ?? 0)) <= input.pixelTolerance
    && Math.abs((one[at + 2] ?? 0) - (other[there + 2] ?? 0)) <= input.pixelTolerance;
  /** True when the color at `at` of `one` stands in `other` at most `shift` pixels from (x, y). */
  const nearby = (one: Picture, at: number, other: Picture, x: number, y: number): boolean => {
    for (let dy = -input.shift; dy <= input.shift; dy++) {
      const row = y + dy;
      if (row < 0 || row >= other.height) continue;
      for (let dx = -input.shift; dx <= input.shift; dx++) {
        const column = x + dx;
        if (column < 0 || column >= other.width) continue;
        if (same(one.data, at, other.data, (row * other.width + column) * 4)) return true;
      }
    }
    return false;
  };

  // 1. Where the two pictures differ. Where one page has ended and the other goes on, every pixel differs.
  const partCount = Math.ceil(height / input.partHeight);
  const partDiffers = new Array<number>(partCount).fill(0);
  const partPixels = new Array<number>(partCount).fill(0);
  const marks = document.createElement('canvas');
  marks.width = width;
  marks.height = height;
  const marksPen = marks.getContext('2d') as CanvasRenderingContext2D;
  const out = marksPen.createImageData(width, height);
  let differing = 0;
  for (let y = 0; y < height; y++) {
    const part = Math.floor(y / input.partHeight);
    for (let x = 0; x < width; x++) {
      const inBuild = y < build.height && x < build.width;
      const inMockup = y < mockup.height && x < mockup.width;
      const b = (y * build.width + x) * 4;
      const m = (y * mockup.width + x) * 4;
      let differs = inBuild !== inMockup;
      // The same place first; where it differs, a place up to `shift` pixels away may still hold the color (letters that stand a
      // pixel further left are the same letters). Both pictures must find their color in the other.
      if (inBuild && inMockup && !same(build.data, b, mockup.data, m)) differs = !nearby(build, b, mockup, x, y) || !nearby(mockup, m, build, x, y);
      partPixels[part] = (partPixels[part] ?? 0) + 1;
      const o = (y * width + x) * 4;
      if (differs) {
        differing++;
        partDiffers[part] = (partDiffers[part] ?? 0) + 1;
        // A mark in a color that few designs use.
        out.data[o] = 230; out.data[o + 1] = 0; out.data[o + 2] = 126; out.data[o + 3] = 255;
      } else {
        // The build, made pale and gray, so that the marks stand out and their place can be read.
        const gray = inBuild ? 0.299 * (build.data[b] ?? 0) + 0.587 * (build.data[b + 1] ?? 0) + 0.114 * (build.data[b + 2] ?? 0) : 255;
        const pale = Math.round(200 + (gray / 255) * 55);
        out.data[o] = pale; out.data[o + 1] = pale; out.data[o + 2] = pale; out.data[o + 3] = 255;
      }
    }
  }
  marksPen.putImageData(out, 0, 0);

  // 2. Large areas of one color. Each color falls into one of 32 x 32 x 32 boxes; a box keeps its count and the sum of its colors.
  const histogram = (picture: { width: number; height: number; data: Uint8ClampedArray }) => {
    const counts = new Uint32Array(32768);
    const sums = new Float64Array(32768 * 3);
    for (let at = 0; at < picture.data.length; at += 4) {
      const r = picture.data[at] ?? 0;
      const g = picture.data[at + 1] ?? 0;
      const bl = picture.data[at + 2] ?? 0;
      const box = ((r >> 3) << 10) | ((g >> 3) << 5) | (bl >> 3);
      counts[box] = (counts[box] ?? 0) + 1;
      sums[box * 3] = (sums[box * 3] ?? 0) + r;
      sums[box * 3 + 1] = (sums[box * 3 + 1] ?? 0) + g;
      sums[box * 3 + 2] = (sums[box * 3 + 2] ?? 0) + bl;
    }
    const total = picture.width * picture.height;
    const areas: { rgb: [number, number, number]; share: number }[] = [];
    for (let box = 0; box < 32768; box++) {
      const n = counts[box] ?? 0;
      if (n === 0) continue;
      areas.push({ rgb: [Math.round((sums[box * 3] ?? 0) / n), Math.round((sums[box * 3 + 1] ?? 0) / n), Math.round((sums[box * 3 + 2] ?? 0) / n)], share: (n / total) * 100 });
    }
    return areas;
  };
  const near = (a: [number, number, number], b: [number, number, number]): boolean => Math.abs(a[0] - b[0]) <= input.colorTolerance && Math.abs(a[1] - b[1]) <= input.colorTolerance && Math.abs(a[2] - b[2]) <= input.colorTolerance;
  // A color that the Mockup draws on half of the least large area is known: the Mockup mixes the Vision's colors (a tint, a fade).
  const known: [number, number, number][] = [...input.palette, ...histogram(mockup).filter((area) => area.share >= input.areaPercent / 2).map((area) => area.rgb)];
  const colors = histogram(build)
    .filter((area) => area.share >= input.areaPercent && !known.some((color) => near(area.rgb, color)))
    .sort((a, b) => b.share - a.share || a.rgb.join(',').localeCompare(b.rgb.join(',')))
    .map((area) => {
      let nearest: [number, number, number] | null = null;
      let least = Infinity;
      for (const color of input.palette) {
        const distance = (color[0] - area.rgb[0]) ** 2 + (color[1] - area.rgb[1]) ** 2 + (color[2] - area.rgb[2]) ** 2;
        if (distance < least) { least = distance; nearest = color; }
      }
      return { ...area, nearest };
    });

  // 3. The pictures. Every text drawn here is a fixed label of the program.
  const pngOf = (canvas: HTMLCanvasElement): string => canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  const LABEL = 28;
  const GAP = 16;
  const GROUND = '#6b7280';
  // The comparison: the Mockup, the build, and the marks, whole pages, made small enough to see at once.
  const scale = Math.min(1, 500 / width, 1500 / height);
  const panelWidth = Math.max(1, Math.round(width * scale));
  const panelHeight = Math.max(1, Math.round(height * scale));
  const compare = document.createElement('canvas');
  compare.width = panelWidth * 3 + GAP * 4;
  compare.height = panelHeight + LABEL + GAP;
  const comparePen = compare.getContext('2d') as CanvasRenderingContext2D;
  comparePen.fillStyle = GROUND;
  comparePen.fillRect(0, 0, compare.width, compare.height);
  comparePen.imageSmoothingQuality = 'high';
  const panels: [string, HTMLCanvasElement][] = [['Mockup', mockup.canvas], ['Build', build.canvas], ['Where they differ', marks]];
  panels.forEach(([label, source], at) => {
    const x = GAP + at * (panelWidth + GAP);
    comparePen.fillStyle = '#ffffff';
    comparePen.font = '600 15px sans-serif';
    comparePen.textBaseline = 'middle';
    comparePen.fillText(label, x, LABEL / 2 + 1);
    comparePen.fillRect(x, LABEL, panelWidth, panelHeight);
    comparePen.drawImage(source, 0, 0, source.width, source.height, x, LABEL, Math.max(1, Math.round(source.width * scale)), Math.max(1, Math.round(source.height * scale)));
  });

  // The build in full size, cut into parts; `columns` parts stand side by side, each with the place where it starts.
  const strips: { from: number; to: number; png: string }[] = [];
  const buildParts = Math.ceil(build.height / input.partHeight);
  for (let start = 0; start < buildParts; start += input.columns) {
    const count = Math.min(input.columns, buildParts - start);
    const strip = document.createElement('canvas');
    strip.width = input.columns === 1 ? width : width * count + GAP * (count + 1);
    const tallest = Math.min(input.partHeight, build.height - start * input.partHeight);
    strip.height = input.columns === 1 ? tallest : tallest + LABEL + GAP;
    const pen = strip.getContext('2d') as CanvasRenderingContext2D;
    pen.fillStyle = GROUND;
    pen.fillRect(0, 0, strip.width, strip.height);
    for (let column = 0; column < count; column++) {
      const top = (start + column) * input.partHeight;
      const tall = Math.min(input.partHeight, build.height - top);
      if (input.columns === 1) pen.drawImage(build.canvas, 0, top, width, tall, 0, 0, width, tall);
      else {
        const x = GAP + column * (width + GAP);
        pen.fillStyle = '#ffffff';
        pen.font = '600 15px sans-serif';
        pen.textBaseline = 'middle';
        pen.fillText(`From ${String(top)} pixels down`, x, LABEL / 2 + 1);
        pen.drawImage(build.canvas, 0, top, width, tall, x, LABEL, width, tall);
      }
    }
    strips.push({ from: start * input.partHeight, to: Math.min(build.height, (start + count) * input.partHeight), png: pngOf(strip) });
  }

  return {
    differs: (differing / (width * height)) * 100,
    parts: partDiffers.map((n, at) => (n / Math.max(1, partPixels[at] ?? 1)) * 100),
    colors,
    compare: pngOf(compare),
    strips,
  };
}

const hexOf = (rgb: readonly number[]): string => `#${rgb.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`;
const oneDecimal = (n: number): number => Math.round(n * 10) / 10;

/** The typefaces that `FONTS.md` names, each with the file name of its font file. */
export function fontFilesOf(fontsMd: string): { family: string; file: string }[] {
  const out: { family: string; file: string }[] = [];
  for (const block of fontsMd.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const family = /font-family:\s*"([^"]+)"/.exec(block[1] ?? '')?.[1];
    const file = /url\("[^"]*?([^"/]+)"\)/.exec(block[1] ?? '')?.[1];
    if (family && file && /^[\w .-]+$/.test(family) && /^[\w.-]+\.woff2$/.test(file)) out.push({ family, file });
  }
  return out;
}

/**
 * The Mockup is a still page that carries no font file and lets none in from an address; the Studio's own screen gives it the
 * letters. For the picture, the program gives it the same files, inside the page itself, which the Mockup's own policy allows.
 */
function mockupWithFonts(mockup: string, fontsMd: string, fonts: Readonly<Record<string, Uint8Array>>): string {
  const faces = fontFilesOf(fontsMd)
    .filter(({ file }) => Object.hasOwn(fonts, file))
    .map(({ family, file }) => `@font-face { font-family: "${family}"; src: url("data:font/woff2;base64,${Buffer.from(fonts[file] as Uint8Array).toString('base64')}") format("woff2"); font-weight: 100 900; font-style: normal; font-display: block; }`);
  if (faces.length === 0) return mockup;
  const style = `<style>${faces.join('\n')}</style>`;
  return /<\/head>/i.test(mockup) ? mockup.replace(/<\/head>/i, () => `${style}</head>`) : `${style}${mockup}`;
}

const percent = (n: number): string => `${n.toFixed(1)} percent`;

/** The report beside the pictures. It holds no date and no time, so that the same inputs give the same report. */
export function lookMarkdown(look: Look): string {
  const out: string[] = [];
  out.push('# The look of the build', '');
  out.push('A program drew the built page and the Vision’s Mockup in a real browser and saved the pictures beside this file. This file says what each picture shows and what the program read from the pixels. It does not say that the page looks good, and nothing here is a deviation: a picture can differ from the Mockup for a good reason. The lines say where to look.', '');
  out.push(`Fingerprint of the design values: \`${look.fingerprint}\`. Build: ${String(look.build.bytes)} bytes, SHA-256 \`${look.build.sha256}\`. The page’s own scripts ${look.scriptsRan ? 'ran' : 'did not run'}.`, '');
  if (look.failures.length > 0) {
    out.push('## Not pictured', '');
    for (const failure of look.failures) out.push(`- ${String(failure.width)} pixels: ${failure.reason}.`);
    out.push('');
  }
  out.push('## The pictures', '');
  if (look.pictures.length === 0) out.push('None.', '');
  else {
    out.push('| Window width | File | What it shows |', '|---|---|---|');
    for (const picture of look.pictures) out.push(`| ${String(picture.width)} pixels | \`${picture.name}\` | ${picture.what} |`);
    out.push('');
  }
  out.push('## Read from the pixels', '');
  out.push('### How much of the build’s picture differs from the Mockup’s', '');
  if (look.widths.length === 0) out.push('Not read.', '');
  for (const at of look.widths) {
    const worst = at.parts.reduce((best, share, index) => (share > (at.parts[best] ?? 0) ? index : best), 0);
    const where = at.differs === 0 ? '' : ` Most in the part from ${String(worst * PART_HEIGHT)} to ${String(Math.min((worst + 1) * PART_HEIGHT, Math.max(at.buildHeight, at.mockupHeight)))} pixels down (${percent(at.parts[worst] ?? 0)} of that part).`;
    const heights = at.buildHeight === at.mockupHeight ? `Both pages are ${String(at.buildHeight)} pixels high.` : `The build is ${String(at.buildHeight)} pixels high and the Mockup ${String(at.mockupHeight)}.`;
    out.push(`- ${String(at.width)} pixels: ${percent(at.differs)} of the picture differs.${where} ${heights}${at.cut ? ` The build is longer than ${String(MAX_HEIGHT)} pixels; the rest is not pictured and was not read.` : ''}`);
  }
  if (look.widths.length > 0) out.push('', `A place differs when one channel of its color differs by more than ${String(PIXEL_TOLERANCE)} of 255 and the color does not stand within ${String(PIXEL_SHIFT)} pixels of the place in the other picture either, so letters drawn a pixel aside do not count. One block that is taller than in the Mockup moves everything below it, and all of that then differs; a build of another page than the Mockup’s differs almost everywhere.`, '');
  out.push('### Large areas of a color that is not the Vision’s', '');
  const anyColor = look.widths.some((at) => at.colors.length > 0);
  if (look.widths.length === 0) out.push('Not read.', '');
  else if (!anyColor) out.push('None.', '');
  else {
    for (const at of look.widths) {
      const listed = at.colors.slice(0, COLORS_LISTED);
      for (const color of listed) out.push(`- ${String(at.width)} pixels: \`${color.hex}\` covers ${percent(color.percent)} of the picture; the nearest color of the Vision is \`${color.nearest}\`.`);
      if (at.colors.length > listed.length) out.push(`- ${String(at.width)} pixels: and ${String(at.colors.length - listed.length)} more.`);
    }
    out.push('');
  }
  if (look.widths.length > 0) out.push(`An area is listed when one color covers ${String(AREA_PERCENT)} percent of the picture or more and is neither a color of the Vision nor a color that the Mockup itself draws (each channel within ${String(COLOR_TOLERANCE)} of 255). The program reads the picture, so it sees a color whatever way the page draws it: a fill, a fade of one color, an image. A photograph or a fade of many colors gives no large area and is not listed.`, '');
  out.push('### Typefaces: named and drawn', '');
  const first = look.widths[0];
  if (!first || first.typefaces.length === 0) out.push('Not read.', '');
  else {
    for (const face of first.typefaces) {
      if (face.texts === 0) {
        out.push(`- “${face.family}”: no text of the page names it first.`);
        continue;
      }
      const texts = `${String(face.texts)} ${face.texts === 1 ? 'text names' : 'texts name'} it first`;
      const how = face.drawn === null ? 'the program could not tell whether it is drawn' : face.drawn ? (face.fromFile ? 'drawn, from a font file' : 'drawn, from a font installed on this machine and not from a file') : 'not drawn: the browser has no such font here, so a fallback draws these letters in the pictures';
      out.push(`- “${face.family}”: ${texts}; ${how}.`);
    }
    out.push('');
    out.push(look.fontsGiven ? 'The program was given font files and answered the page’s requests for them at the site’s own address.' : 'The program was given no font files. A built page is one file and ships no font, so a typeface that the page loads from the site’s own address is not drawn here; give the files (`--fonts`) to see the letters that visitors will see.', '');
  }
  out.push('## What the pictures do not show', '');
  out.push('- A page in use: nothing is pointed at, pressed, focused, typed, or sent, and no motion is shown. The pictures are still, with reduced motion.');
  out.push('- Any window width other than the three, and any other browser.');
  out.push('- Whether the page looks good. That is a judgment: a model’s judgment of these pictures belongs under “Judged by the model” in the receipt, and the owner’s own look decides.');
  out.push('');
  return out.join('\n');
}

const BLANK = '<!doctype html><html><head><meta charset="utf-8"><title>The look</title></head><body></body></html>';

/** A blank page of the program's own, with no network, in which the pictures are read and drawn. */
async function ownPage(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1, serviceWorkers: 'block', proxy: DEAD_PROXY });
  await context.route('**/*', (route) => route.abort());
  const page = await context.newPage();
  await page.setContent(BLANK);
  return { context, page };
}

export async function look(input: LookInput): Promise<LookResult> {
  const design = readDesignValues(input.files);
  if (input.html.trim() === '') throw new FitError('The build is empty.');
  if (!/<(?:!doctype|html|body)\b/i.test(input.html)) throw new FitError('The build is not an HTML page.');
  const ms = input.loadTimeoutMs ?? 10_000;
  const runScripts = input.runScripts !== false;
  const fonts = input.fonts ?? {};
  const fontsGiven = Object.keys(fonts).length > 0;
  // The names as tokens.json writes them (the design values keep them in lower case; the report shows them as written).
  const families = typefaceNames(input.files['tokens.json'] ?? '');
  const palette = [...design.colors].sort().map((hex): [number, number, number] => [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)]);
  const mockup = fontsGiven ? mockupWithFonts(input.files['mockup.html'] ?? '', input.files['FONTS.md'] ?? '', fonts) : input.files['mockup.html'] ?? '';
  const browser = input.browser ?? (await chromium.launch({ ...input.launch, args: [...(input.launch?.args ?? []), ...LOOK_LAUNCH_ARGS] }));
  try {
    const widths: LookWidth[] = [];
    const failures: Look['failures'] = [];
    const pictures: LookPicture[] = [];
    const { context, page } = await ownPage(browser);
    try {
      // One width after another: the pictures are large, and the order of the report is fixed.
      for (const width of WIDTHS) {
        let reference: Drawn;
        try {
          // The Mockup holds no script; it is drawn with scripts off whatever the build does.
          reference = await draw(browser, mockup, width, ms, false, [], {});
        } catch {
          throw new FitError('The file "mockup.html" could not be drawn.');
        }
        let built: Drawn;
        try {
          built = await draw(browser, input.html, width, ms, runScripts, families, fonts);
        } catch (error) {
          failures.push({ width, reason: failureSentence(error, ms) });
          continue;
        }
        const columns = width <= 400 ? 3 : 1;
        const read = await page.evaluate(readPixels, { build: built.png.toString('base64'), mockup: reference.png.toString('base64'), width, partHeight: PART_HEIGHT, pixelTolerance: PIXEL_TOLERANCE, shift: PIXEL_SHIFT, areaPercent: AREA_PERCENT, colorTolerance: COLOR_TOLERANCE, palette, columns });
        widths.push({
          width,
          buildHeight: built.height,
          mockupHeight: reference.height,
          cut: built.cut,
          differs: oneDecimal(read.differs),
          parts: read.parts.map(oneDecimal),
          colors: read.colors.map((color) => ({ hex: hexOf(color.rgb), percent: oneDecimal(color.share), nearest: color.nearest ? hexOf(color.nearest) : '' })),
          typefaces: built.typefaces,
        });
        pictures.push({ name: `compare-${String(width)}.png`, width, kind: 'compare', what: 'The whole Mockup, the whole build, and the places where their pictures differ (marked in pink on a pale build), side by side and made small', png: Buffer.from(read.compare, 'base64') });
        read.strips.forEach((strip, at) => {
          pictures.push({ name: `build-${String(width)}-${String(at + 1)}.png`, width, kind: 'build', what: `The build in full size, from ${String(strip.from)} to ${String(strip.to)} pixels down${columns > 1 ? ' (parts of 1000 pixels side by side)' : ''}`, png: Buffer.from(strip.png, 'base64') });
        });
      }
    } finally {
      await within(context.close(), 5000, 'close').catch(() => undefined);
    }
    const result: Look = {
      fingerprint: design.fingerprint,
      build: { bytes: Buffer.byteLength(input.html, 'utf8'), sha256: createHash('sha256').update(input.html, 'utf8').digest('hex') },
      scriptsRan: runScripts,
      fontsGiven,
      widths,
      failures,
      pictures: pictures.map(({ name, width, kind, what }) => ({ name, width, kind, what })),
    };
    return { look: result, pictures, markdown: lookMarkdown(result), status: failures.length > 0 ? 1 : 0 };
  } finally {
    if (!input.browser) await browser.close();
  }
}

/** The first family of each typeface of `tokens.json`, as written, without doubles. `readDesignValues` has checked the file before. */
function typefaceNames(tokensJson: string): string[] {
  const tokens = JSON.parse(tokensJson) as { typeface?: Record<string, { $value?: unknown }> };
  const names: string[] = [];
  for (const token of Object.values(tokens.typeface ?? {})) {
    const first = Array.isArray(token.$value) ? (token.$value as unknown[])[0] : undefined;
    if (typeof first === 'string' && !names.includes(first)) names.push(first);
  }
  return names;
}
