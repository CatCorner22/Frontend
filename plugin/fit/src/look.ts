// The look (PLAN.md section 4.5: "Claude receives the measured failures and the screenshots"; section 13.5, step 13a: "Read what is
// drawn, not only what the styles say"; SPEC.md section 2.23 listed both as not built before this file; section 2.28 describes it). The Fit check reads the styles that the
// browser computes. It never sees the page, and neither does the model that built the page. This file draws the build and the
// Vision's Mockup in a real browser at the Fit check's three window widths, saves the pictures so that a model or a person can look
// at them, and reads four things from what was drawn:
//   1. how much of the build's picture differs from the Mockup's picture, and where;
//   2. large areas of one color that is neither a color of the Vision nor a color that the Mockup draws;
//   3. whether each typeface of the Vision is drawn, or only named while a fallback draws the letters;
//   4. whether each of the three texts that the Brief requires is drawn in the picture, and how strongly its letters stand against
//      what is behind them. The Fit check finds those texts in the page and reads their styles; styles can say that a text is
//      shown while a box covers it, or while its ground has the color of its letters. The program hides the letters of one text,
//      draws the page again, and compares the two pictures: letters that no visitor sees change nothing.
// The program judges nothing. No reading here is a deviation, and none changes the status of the Fit check: a picture can differ
// from the Mockup for a good reason (another page, other content). The readings say where to look.
//
// The page is untrusted, as in the Fit check: it is served at the stand-in address of the site, every other request is stopped, and
// the typefaces are read from a world of the program's own. The pixels are read in a blank page of the program's own, which the
// build never enters. Nothing that the page writes enters the report: the report holds numbers, color values, the Vision's own
// typeface names, and fixed sentences.
import { createHash, randomBytes } from 'node:crypto';
import { chromium, type Browser, type BrowserContext, type CDPSession, type LaunchOptions, type Page } from 'playwright';
import { readBrief } from './collect.ts';
import { contrastRatio } from './color.ts';
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
  /**
   * True when the name is a generic family of CSS (`system-ui`, `serif`, ...): each machine draws its own font for it, no font file
   * belongs to it, and `drawn` is true.
   */
  device: boolean;
  /** True when `FONTS.md` names a font file for the typeface. Without one, the letters come from the visitor's own machine. */
  file: boolean;
}

/** The three texts that the Brief requires (SPEC.md section 2.10, point 6), in the order of every report. */
export const REQUIRED_TEXTS = ['business name', 'headline', 'primary action'] as const;

export interface LookText {
  text: (typeof REQUIRED_TEXTS)[number];
  /**
   * `drawn`: hiding the letters of this text alone changed the picture, so the letters are in it. `not drawn`: the page holds the
   * text, and it has no place in the page or hiding its letters changed nothing. `not found`: the program found no such text in the
   * page, as the Fit check finds none; whether a visitor sees the words some other way, the program does not know. `not read`: the
   * program could not tell.
   */
  state: 'drawn' | 'not drawn' | 'not found' | 'not read';
  /** For every state but `drawn`: one fixed part of a sentence that says why. Empty for `drawn`. */
  why: string;
  /** In how many places the page holds the text. At most `PLACES_MAX` of them are read. */
  places: number;
  /** In how many of the places that were read the letters are drawn. */
  drawn: number;
  /**
   * For `drawn`: the ratio of the color of the letters to the color that stands in their place without them (WCAG 2.x formula), read
   * from the pixels, where it is highest. Otherwise null.
   */
  contrast: number | null;
  /**
   * For `drawn`: the same ratio where it is lowest, over every place that draws the text and along each of them. It is far below
   * `contrast` when one place is weaker than another, or when the letters or their ground change color along the text. Otherwise null.
   */
  least: number | null;
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
  /** Whether each of the three required texts is drawn, in the order of `REQUIRED_TEXTS`. */
  texts: LookText[];
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
/** How many places of one required text the program reads. A page holds a business name or a button's words in a few places, not in many. */
export const PLACES_MAX = 8;
/** A pixel counts as changed by the hidden letters when one of its channels changes by at least this much (0 to 255). */
export const INK_LEAST = 3;
/** A text counts as drawn when hiding it changes at least this many pixels for each of its letters. One letter at 6 pixels changes more. */
export const INK_PER_LETTER = 2;
/**
 * A text counts as drawn when hiding it changes at least this share of the room that its letters take up, line by line, in
 * percent. Letters of an ordinary weight change 16 to 55 percent of their room; a line of which only a sliver shows changes 2.
 */
export const INK_PERCENT = 4;
/** How far around a text's place the program reads, in pixels: slanted letters and letters with tails reach past their line. */
const INK_MARGIN = 3;
/** The side of the squares, in pixels, in which the program reads the ratio place by place along a text, to find where it is lowest. */
const INK_CELL = 24;
/** The report gives two ratios for a text when the lowest is below this share of the highest. */
const RANGE_FROM = 0.75;

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

/** A world of the program's own inside the page; no script of the page can reach it or change what it reads. What one call keeps there, the next call finds. */
async function openWorld(page: Page): Promise<{ session: CDPSession; run: <T>(expression: string, ms: number) => Promise<T> }> {
  const session = await page.context().newCDPSession(page);
  try {
    const { frameTree } = await session.send('Page.getFrameTree');
    const { executionContextId } = await session.send('Page.createIsolatedWorld', { frameId: frameTree.frame.id, worldName: WORLD });
    const run = async <T>(expression: string, ms: number): Promise<T> => {
      const { result, exceptionDetails } = await within(session.send('Runtime.evaluate', { expression, contextId: executionContextId, returnByValue: true, awaitPromise: true }), ms, 'the page did not answer');
      if (exceptionDetails) throw new Error('the program could not read the page');
      return result.value as T;
    };
    return { session, run };
  } catch (error) {
    await session.detach().catch(() => undefined);
    throw error;
  }
}

/** Runs one expression in a world of the program's own inside the page. */
async function inOwnWorld<T>(page: Page, expression: string, ms: number): Promise<T> {
  const { session, run } = await openWorld(page);
  try {
    return await run<T>(expression, ms);
  } finally {
    await session.detach().catch(() => undefined);
  }
}

interface PageFacts {
  height: number;
  typefaces: Omit<LookTypeface, 'file'>[];
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
  // A generic family is a keyword, not a name: in quotes it would be the name of a font that no machine has, and without quotes
  // every machine draws some font for it. Nothing is to be probed, and no font file belongs to it.
  const generic = /^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|emoji|math|fangsong)$/i;
  const typefaces = families.map((family) => {
    const texts = named.get(family.toLowerCase()) ?? 0;
    if (generic.test(family)) return { family, texts, drawn: true, fromFile: false, device: true };
    let fromFile = false;
    for (const face of document.fonts) if (first(face.family) === family.toLowerCase() && face.status === 'loaded') fromFile = true;
    // A name with a sign that could end the quoted name is not tried.
    if (!pen || !/^[\w .-]+$/.test(family)) return { family, texts, drawn: null, fromFile, device: false };
    // The typeface is drawn when it changes the width of a line against either fallback alone.
    const drawn = widthOf(`72px "${family}", monospace`) !== widthOf('72px monospace') || widthOf(`72px "${family}", serif`) !== widthOf('72px serif');
    return { family, texts, drawn, fromFile, device: false };
  });
  const root = document.documentElement;
  return { height: Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0), typefaces };
}

interface Place {
  /** The box around the letters, in pixels of the page from its top left corner. */
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * True when a highlight cannot hide the letters: an image fills them (`background-clip: text`), a shadow alone draws them, or they
   * are part of an SVG picture. The program then hides them by a rule of its own for their element; when that cannot be done either,
   * this stays true and the text is "not read".
   */
  special: boolean;
  /** How many pixels the boxes of the letters take up, line by line: the room in which the letters are drawn when nothing hides them. */
  room: number;
}

/**
 * Runs inside the page, in the program's own world. It stands alone: it uses nothing from this file. It finds every place where the
 * page holds one of the wanted texts, as the Fit check's content measure does (the text of one block, without regard to letter case
 * or runs of white space), and keeps the exact letters of each place under `key` for `hideText`.
 */
function locateTexts(wanted: string[], key: string, max: number): { found: number[]; places: Place[][] } {
  // The folded text, and for each of its characters the place of the character that it came from.
  const fold = (text: string): { text: string; from: number[] } => {
    let out = '';
    const from: number[] = [];
    for (let at = 0; at < text.length; at++) {
      const ch = text.charAt(at);
      if (/\s/.test(ch)) {
        if (out !== '' && !out.endsWith(' ')) {
          out += ' ';
          from.push(at);
        }
        continue;
      }
      const low = ch.toLowerCase();
      for (let k = 0; k < low.length; k++) {
        out += low.charAt(k);
        from.push(at);
      }
    }
    return { text: out, from };
  };
  const roots: (Document | ShadowRoot)[] = [document];
  for (let at = 0; at < roots.length && at < 500; at++) for (const el of (roots[at] as Document | ShadowRoot).querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
  const blockOf = (el: Element): Element => {
    let up = el;
    while (up.parentElement && getComputedStyle(up).display.startsWith('inline') && !getComputedStyle(up).display.startsWith('inline-')) up = up.parentElement;
    return up;
  };
  // The text nodes of one block make one line, as in the Fit check. A node that takes up no room (in a box that is not shown, or in
  // a closed <details>) and a node that is set to be invisible draw nothing and are left out, so that a helper text between two
  // words does not break the line.
  const blocks = new Map<Element, Text[]>();
  let seen = 0;
  for (const root of [document.body ?? document.documentElement, ...roots.slice(1)]) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node && seen < 20000; node = walker.nextNode()) {
      seen++;
      const host = node.parentElement;
      if ((node.nodeValue ?? '').trim() === '' || host === null || host.closest('script, style, template, noscript, title') !== null) continue;
      if (getComputedStyle(host).visibility !== 'visible') continue;
      const all = document.createRange();
      all.selectNodeContents(node);
      if (all.getClientRects().length === 0) continue;
      const block = blockOf(host);
      const nodes = blocks.get(block) ?? [];
      nodes.push(node as Text);
      blocks.set(block, nodes);
    }
  }
  const noAlpha = (color: string): boolean => color === 'transparent' || /[,/]\s*0(?:\.0+)?%?\s*\)$/.test(color);
  // Letters that a highlight cannot hide: `fills` are the elements whose image fills the letters, and `own` says that the letters'
  // own element draws them in another way (an SVG picture, or a shadow alone).
  const hardOf = (host: Element): { fills: Element[]; own: boolean } => {
    const fills: Element[] = [];
    for (let up: Element | null = host; up; ) {
      const style = getComputedStyle(up);
      if (/\btext\b/.test(`${style.backgroundClip} ${style.webkitBackgroundClip}`)) fills.push(up);
      const root: Node = up.getRootNode();
      up = up.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }
    const own = getComputedStyle(host);
    return { fills, own: host instanceof SVGElement || (noAlpha(own.webkitTextFillColor) && own.textShadow !== 'none') };
  };
  const found = wanted.map(() => 0);
  const places: Place[][] = wanted.map(() => []);
  const ranges: Range[][] = wanted.map(() => []);
  const targets: { el: Element; fill: boolean }[][] = wanted.map(() => []);
  const stuck = wanted.map(() => false);
  const folded = wanted.map((text) => fold(text).text.trim());
  for (const nodes of blocks.values()) {
    const starts: number[] = [];
    let raw = '';
    for (const node of nodes) {
      starts.push(raw.length);
      raw += node.nodeValue ?? '';
    }
    const line = fold(raw);
    folded.forEach((text, index) => {
      if (text === '') return;
      for (let at = line.text.indexOf(text); at !== -1; at = line.text.indexOf(text, at + text.length)) {
        found[index] = (found[index] ?? 0) + 1;
        if ((places[index] ?? []).length >= max) continue;
        const from = line.from[at] ?? 0;
        const to = (line.from[at + text.length - 1] ?? 0) + 1;
        // A rule for an element hides every letter of the element, so the program uses one only where the text is the whole line.
        const whole = at === 0 && line.text.trimEnd().length === text.length;
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        let special = false;
        let room = 0;
        nodes.forEach((node, n) => {
          const start = starts[n] ?? 0;
          const a = Math.max(from, start);
          const b = Math.min(to, start + (node.nodeValue ?? '').length);
          if (b <= a) return;
          const range = document.createRange();
          range.setStart(node, a - start);
          range.setEnd(node, b - start);
          (ranges[index] as Range[]).push(range);
          const hard = node.parentElement ? hardOf(node.parentElement) : { fills: [], own: false };
          if (hard.fills.length > 0 || hard.own) {
            special = true;
            if (!whole) stuck[index] = true;
            for (const el of whole ? hard.fills : []) (targets[index] as { el: Element; fill: boolean }[]).push({ el, fill: true });
            if (whole && hard.own && node.parentElement) (targets[index] as { el: Element; fill: boolean }[]).push({ el: node.parentElement, fill: false });
          }
          for (const r of range.getClientRects()) {
            if (r.width <= 0 || r.height <= 0) continue;
            room += r.width * r.height;
            left = Math.min(left, r.left);
            top = Math.min(top, r.top);
            right = Math.max(right, r.right);
            bottom = Math.max(bottom, r.bottom);
          }
        });
        const none = left === Infinity;
        (places[index] as Place[]).push({ x: none ? 0 : left + window.scrollX, y: none ? 0 : top + window.scrollY, width: none ? 0 : right - left, height: none ? 0 : bottom - top, special, room });
      }
    });
  }
  (globalThis as unknown as Record<string, unknown>)[key] = { ranges, targets, stuck };
  return { found, places };
}

/**
 * Runs inside the page, in the program's own world, after `locateTexts`. It hides the letters of one wanted text and nothing else:
 * a highlight paints the letters in no color. No element is added, moved, or changed, so nothing in the page moves, and no rule
 * of the page can tell that the letters are hidden. The highlight's name is `key`, a name that the page cannot know. Letters that
 * a highlight cannot hide get a rule of the program's own, which names their element by its place in the page and takes away what
 * draws them. It answers 0 when there is nothing to hide, 1 when every letter is hidden, and 2 when some letters could not be
 * hidden (a declaration of the page is stronger than the program's rule, or the text is only a part of its line).
 */
function hideText(key: string, index: number): number {
  const kept = (globalThis as unknown as Record<string, { ranges?: Range[][]; targets?: { el: Element; fill: boolean }[][]; stuck?: boolean[]; undo?: () => void } | undefined>)[key];
  const ranges = kept?.ranges?.[index];
  if (!kept || !ranges || ranges.length === 0) return 0;
  const sheets = new Map<Document | ShadowRoot, string[]>([[document, []]]);
  const rulesOf = (scope: Document | ShadowRoot): string[] => {
    const rules = sheets.get(scope) ?? [];
    sheets.set(scope, rules);
    return rules;
  };
  for (const range of ranges) {
    const root = range.startContainer.getRootNode();
    if (root instanceof ShadowRoot) rulesOf(root);
  }
  const placeOf = (el: Element): number => Array.prototype.indexOf.call(el.parentNode?.children ?? [], el) + 1;
  // The rule must win over the page's own rules, also over those marked important: it comes last and counts as many identifiers.
  const strong = `:is(${`#${key}`.repeat(40)}, *)`;
  const noAlpha = (color: string): boolean => color === 'transparent' || /[,/]\s*0(?:\.0+)?%?\s*\)$/.test(color);
  const checks: (() => boolean)[] = [];
  let hard = kept.stuck?.[index] === true;
  const done = new Set<Element>();
  const filled = new Set<Element>();
  for (const { el, fill } of kept.targets?.[index] ?? []) {
    if ((fill ? filled : done).has(el)) continue;
    (fill ? filled : done).add(el);
    const steps: string[] = [];
    let at = el;
    while (at.parentElement) {
      steps.unshift(`:nth-child(${String(placeOf(at))})`);
      at = at.parentElement;
    }
    const root = at.getRootNode();
    if (root instanceof ShadowRoot) steps.unshift(`:host > :nth-child(${String(placeOf(at))})`);
    else if (at === document.documentElement) steps.unshift(':root');
    else {
      hard = true;
      continue;
    }
    const scope = root instanceof ShadowRoot ? root : document;
    if (fill) {
      rulesOf(scope).push(`${steps.join(' > ')}${strong} { background-image: none !important; background-color: transparent !important; transition: none !important; }`);
      checks.push(() => getComputedStyle(el).backgroundImage === 'none' && noAlpha(getComputedStyle(el).backgroundColor));
    } else {
      rulesOf(scope).push(`${steps.join(' > ')}${strong} { -webkit-text-fill-color: transparent !important; -webkit-text-stroke-color: transparent !important; text-decoration-color: transparent !important; text-shadow: none !important; fill: transparent !important; stroke: transparent !important; transition: none !important; }`);
      checks.push(() => {
        const style = getComputedStyle(el);
        return noAlpha(style.webkitTextFillColor) && style.textShadow === 'none' && (!(el instanceof SVGElement) || (noAlpha(style.fill) && noAlpha(style.stroke)));
      });
    }
  }
  const added: [Document | ShadowRoot, CSSStyleSheet][] = [];
  for (const [scope, rules] of sheets) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync([`::highlight(${key}) { color: transparent !important; -webkit-text-fill-color: transparent !important; -webkit-text-stroke-color: transparent !important; text-decoration-color: transparent !important; background-color: transparent !important; text-shadow: none !important; }`, ...rules].join('\n'));
    scope.adoptedStyleSheets = [...scope.adoptedStyleSheets, sheet];
    added.push([scope, sheet]);
  }
  CSS.highlights.set(key, new Highlight(...ranges));
  kept.undo = () => {
    CSS.highlights.delete(key);
    for (const [scope, sheet] of added) scope.adoptedStyleSheets = scope.adoptedStyleSheets.filter((other) => other !== sheet);
  };
  for (const check of checks) if (!check()) hard = true;
  return hard ? 2 : 1;
}

/** Runs inside the page, in the program's own world: shows again what `hideText` hid. */
function showText(key: string): boolean {
  const kept = (globalThis as unknown as Record<string, { undo?: () => void } | undefined>)[key];
  if (!kept?.undo) return false;
  kept.undo();
  delete kept.undo;
  return true;
}

/** The pictures from which the program reads whether the required texts are drawn. */
interface TextShots {
  found: number[];
  places: Place[][];
  /** The page with the letters of one required text hidden; null when the text has no place with a size. */
  hidden: (Buffer | null)[];
  /** The page once more, with nothing hidden: it must be the first picture again. Null when nothing was hidden. */
  after: Buffer | null;
}

type Drawn = { png: Buffer; height: number; cut: boolean; typefaces: Omit<LookTypeface, 'file'>[]; brief?: string[]; shots?: TextShots | null };

const finite = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/**
 * Takes the picture of the page, then one picture for each required text with the letters of that text hidden, then the page once
 * more. The page's scripts stand still meanwhile (`pause`): a script could otherwise notice that letters are hidden and redraw the
 * page. When the reading fails after the first picture, the picture stands and the texts are "not read".
 */
async function shootTexts(page: Page, wanted: readonly string[], shoot: () => Promise<Buffer>, ms: number, pause: boolean): Promise<{ png: Buffer; shots: TextShots | null }> {
  const { session, run } = await openWorld(page);
  const key = `look${randomBytes(8).toString('hex')}`;
  try {
    if (pause) await session.send('Emulation.setScriptExecutionDisabled', { value: true });
    const png = await shoot();
    try {
      const located = await run<{ found?: unknown; places?: unknown }>(`(${locateTexts.toString()})(${JSON.stringify(wanted)}, ${JSON.stringify(key)}, ${String(PLACES_MAX)})`, ms);
      const found = wanted.map((_, at) => Math.max(0, Math.round(finite(Array.isArray(located.found) ? (located.found as unknown[])[at] : 0))));
      const places = wanted.map((_, at): Place[] => {
        const list = Array.isArray(located.places) ? (located.places as unknown[])[at] : undefined;
        return (Array.isArray(list) ? list : []).slice(0, PLACES_MAX).map((raw) => {
          const place = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
          return { x: finite(place['x']), y: finite(place['y']), width: Math.max(0, finite(place['width'])), height: Math.max(0, finite(place['height'])), special: place['special'] === true, room: Math.max(0, finite(place['room'])) };
        });
      });
      const hidden: (Buffer | null)[] = [];
      for (let at = 0; at < wanted.length; at++) {
        const how = (places[at] ?? []).some((place) => place.width > 0 && place.height > 0) ? await run<number>(`(${hideText.toString()})(${JSON.stringify(key)}, ${String(at)})`, ms) : 0;
        if (how !== 1 && how !== 2) {
          hidden.push(null);
          continue;
        }
        // Every letter is hidden: a place of letters that a highlight cannot hide reads like any other.
        if (how === 1) for (const place of places[at] ?? []) place.special = false;
        try {
          hidden.push(await shoot());
        } finally {
          await run<boolean>(`(${showText.toString()})(${JSON.stringify(key)})`, ms);
        }
      }
      const after = hidden.some((picture) => picture !== null) ? await shoot() : null;
      return { png, shots: { found, places, hidden, after } };
    } catch {
      return { png, shots: null };
    }
  } finally {
    if (pause) await session.send('Emulation.setScriptExecutionDisabled', { value: false }).catch(() => undefined);
    await session.detach().catch(() => undefined);
  }
}

/** A fixed sentence for a window that could not be pictured. The browser's own message is never used: a page can shape it. */
function failureSentence(error: unknown, ms: number): string {
  const message = error instanceof Error ? `${error.name} ${error.message}` : '';
  return /Timeout|did not finish loading|did not answer/.test(message) ? `the page did not finish loading or did not answer within ${String(ms)} milliseconds` : 'the page could not be pictured';
}

const fileNameOf = (url: string): string => decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');

/**
 * Opens one page in a window of its own, with no network, and draws it. `fonts` are served at the site's own address by file name.
 * With `texts.brief`, it also reads the three required texts (from the Mockup); with `texts.wanted`, it also takes the pictures that
 * show whether those texts are drawn (in the build).
 */
/** Runs before any script of the page, in every frame: WebRTC is replaced by a stub that refuses. */
const NO_WEBRTC = `(() => {
  const blocked = function () { throw new DOMException('WebRTC is not available during the look.', 'NotSupportedError'); };
  for (const name of ['RTCPeerConnection', 'webkitRTCPeerConnection']) { try { Object.defineProperty(globalThis, name, { value: blocked, writable: false, configurable: false }); } catch (e) {} }
})();`;

async function draw(browser: Browser, html: string, width: number, ms: number, runScripts: boolean, families: readonly string[], fonts: Readonly<Record<string, Uint8Array>>, texts: { brief?: boolean; wanted?: readonly string[] } = {}): Promise<Drawn> {
  const context = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce', javaScriptEnabled: runScripts, serviceWorkers: 'block', proxy: DEAD_PROXY });
  try {
    // WebRTC sends over UDP, which no route and no proxy of the browser sees; the Fit check replaces it, and so does the look
    // (retest finding R-S03: with --run-scripts a page sent a packet).
    await context.addInitScript(NO_WEBRTC);
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
    const shoot = (): Promise<Buffer> => within(page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide', clip: { x: 0, y: 0, width, height: Math.min(height, MAX_HEIGHT) }, timeout: ms }), ms + 1000, 'the page did not answer');
    let brief: string[] | undefined;
    if (texts.brief) {
      const read = await inOwnWorld<Record<string, unknown>>(page, `(${readBrief.toString()})()`, ms);
      brief = [read['business'], read['headline'], read['primaryAction']].map((text) => (typeof text === 'string' ? text.slice(0, 2000) : ''));
    }
    // Where scripts do not run at all, there is nothing to hold still (and the browser's setting must not be changed back).
    const { png, shots } = texts.wanted ? await shootTexts(page, texts.wanted, shoot, ms, runScripts) : { png: await shoot(), shots: undefined };
    const typefaces = (Array.isArray(facts.typefaces) ? facts.typefaces : []).map((t, at) => ({ family: families[at] ?? '', texts: Math.max(0, Math.round(Number(t.texts) || 0)), drawn: typeof t.drawn === 'boolean' ? t.drawn : null, fromFile: t.fromFile === true, device: t.device === true }));
    return { png, height, cut, typefaces, ...(brief ? { brief } : {}), ...(shots !== undefined ? { shots } : {}) };
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

interface DrawnInput {
  before: string;
  hidden: (string | null)[];
  after: string | null;
  places: { x: number; y: number; width: number; height: number }[][];
  margin: number;
  least: number;
  cell: number;
}

interface DrawnPlace {
  /** How many pixels of the place lie in the picture; 0 when the place has no size or lies outside the picture. */
  area: number;
  /** How many of them changed when the letters were hidden. */
  changed: number;
  /** How many of them differ between the first picture and the last, in which nothing is hidden: the page changed by itself. */
  noise: number;
  /** The color of the letters, and the color that stands in their place without them, where the change is strongest. */
  ink: [number, number, number] | null;
  ground: [number, number, number] | null;
  /** The same two colors (letters, then ground) for each square of the place that holds enough of the letters. */
  cells: [number, number, number, number, number, number][];
}

/**
 * Runs in a blank page of the program's own. For each place of each required text, it compares the picture of the page with the
 * picture in which the letters of that text are hidden. It stands alone: it uses nothing from this file.
 */
async function readDrawn(input: DrawnInput): Promise<DrawnPlace[][]> {
  const load = async (base64: string) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const pen = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    pen.drawImage(image, 0, 0);
    return { pen, width: canvas.width, height: canvas.height };
  };
  const before = await load(input.before);
  const after = input.after === null ? null : await load(input.after);
  const out: DrawnPlace[][] = [];
  for (let index = 0; index < input.places.length; index++) {
    const shot = input.hidden[index] ?? null;
    const hidden = shot === null ? null : await load(shot);
    out.push((input.places[index] ?? []).map((place): DrawnPlace => {
      const x0 = Math.max(0, Math.floor(place.x - input.margin));
      const y0 = Math.max(0, Math.floor(place.y - input.margin));
      const x1 = Math.min(before.width, Math.ceil(place.x + place.width + input.margin));
      const y1 = Math.min(before.height, Math.ceil(place.y + place.height + input.margin), y0 + 4000);
      if (place.width <= 0 || place.height <= 0 || x1 <= x0 || y1 <= y0 || hidden === null || after === null) return { area: 0, changed: 0, noise: 0, ink: null, ground: null, cells: [] };
      const width = x1 - x0;
      const height = y1 - y0;
      // Three pictures of one page have one size; if they do not, the page changed.
      if (hidden.width !== before.width || hidden.height !== before.height || after.width !== before.width || after.height !== before.height) return { area: width * height, changed: 0, noise: width * height, ink: null, ground: null, cells: [] };
      const a = before.pen.getImageData(x0, y0, width, height).data;
      const b = hidden.pen.getImageData(x0, y0, width, height).data;
      const c = after.pen.getImageData(x0, y0, width, height).data;
      const deltas = new Uint8Array(width * height);
      let changed = 0;
      let noise = 0;
      let most = 0;
      for (let at = 0, pixel = 0; at < a.length; at += 4, pixel++) {
        const delta = Math.max(Math.abs((a[at] ?? 0) - (b[at] ?? 0)), Math.abs((a[at + 1] ?? 0) - (b[at + 1] ?? 0)), Math.abs((a[at + 2] ?? 0) - (b[at + 2] ?? 0)));
        deltas[pixel] = delta;
        if (delta >= input.least) changed++;
        if (delta > most) most = delta;
        if (Math.max(Math.abs((a[at] ?? 0) - (c[at] ?? 0)), Math.abs((a[at + 1] ?? 0) - (c[at + 1] ?? 0)), Math.abs((a[at + 2] ?? 0) - (c[at + 2] ?? 0))) >= input.least) noise++;
      }
      if (changed === 0) return { area: width * height, changed, noise, ink: null, ground: null, cells: [] };
      // The middle of a stroke changes most; its smoothed edge mixes letter and ground and is left out. `colorsOf` reads the two
      // colors in one part of the place, from the pixels that changed at least 0.8 times as much as the most changed one there.
      const colorsOf = (left: number, top: number, right: number, bottom: number, most: number): [number, number, number, number, number, number] => {
        const sums: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
        let strong = 0;
        for (let y = top; y < bottom; y++) {
          for (let x = left; x < right; x++) {
            if ((deltas[y * width + x] ?? 0) < most * 0.8) continue;
            strong++;
            const at = (y * width + x) * 4;
            for (let k = 0; k < 3; k++) {
              sums[k] = (sums[k] ?? 0) + (a[at + k] ?? 0);
              sums[k + 3] = (sums[k + 3] ?? 0) + (b[at + k] ?? 0);
            }
          }
        }
        return sums.map((sum) => Math.round(sum / Math.max(1, strong))) as [number, number, number, number, number, number];
      };
      const all = colorsOf(0, 0, width, height, most);
      // The same in squares, to find where the ratio is lowest. The place is cut into equal parts of about `cell` pixels, so that
      // no part is a thin rest at an edge. A part that holds only the tip of a letter is left out: it holds no middle of a stroke.
      const cells: [number, number, number, number, number, number][] = [];
      const rows = Math.max(1, Math.floor(height / input.cell));
      const columns = Math.max(1, Math.floor(width / input.cell));
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const top = Math.floor((row * height) / rows);
          const bottom = Math.floor(((row + 1) * height) / rows);
          const left = Math.floor((column * width) / columns);
          const right = Math.floor(((column + 1) * width) / columns);
          let count = 0;
          let mostHere = 0;
          for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
              const delta = deltas[y * width + x] ?? 0;
              if (delta >= input.least) count++;
              if (delta > mostHere) mostHere = delta;
            }
          }
          if (count * 10 >= (right - left) * (bottom - top)) cells.push(colorsOf(left, top, right, bottom, mostHere));
        }
      }
      return { area: width * height, changed, noise, ink: [all[0], all[1], all[2]], ground: [all[3], all[4], all[5]], cells };
    }));
  }
  return out;
}

const WHY = {
  noMockup: 'the Mockup holds no such text',
  unread: 'the program could not read the page for it',
  absent: 'the page holds no such text that takes up room; words in a picture, in a closed part of the page, or written by a style rule are not text that the program finds',
  nowhere: 'the text stands outside the page, where no person can scroll, or its letters have no size',
  nothing: 'hiding its letters changed nothing in the picture, so no visitor sees them',
  few: 'hiding its letters changed only a small part of the room that they take up, too little for letters that a person can read',
  changed: 'the page changed by itself between two pictures',
  special: 'an image fills its letters, a shadow alone draws them, or they are part of an SVG picture, and the program could not hide them',
  pictures: 'the text holds no letters, only picture signs, and the program cannot hide those',
  below: `the text stands below the ${String(MAX_HEIGHT)} pixels that the program pictures`,
} as const;

/** Whether each required text is drawn, from what the pictures showed for each of its places. `pictured` is the height of the picture. */
function textsOf(wanted: readonly string[], shots: TextShots | null | undefined, read: DrawnPlace[][] | null, pictured: number): LookText[] {
  const ratioOf = (c: readonly number[]): number => contrastRatio({ r: c[0] ?? 0, g: c[1] ?? 0, b: c[2] ?? 0, a: 1 }, { r: c[3] ?? 0, g: c[4] ?? 0, b: c[5] ?? 0, a: 1 });
  const twoDecimals = (n: number): number => Math.round(n * 100) / 100;
  return REQUIRED_TEXTS.map((text, index): LookText => {
    const not = (state: 'not drawn' | 'not found' | 'not read', why: string, places = 0): LookText => ({ text, state, why, places, drawn: 0, contrast: null, least: null });
    const signs = (wanted[index] ?? '').replace(/\s+/g, '');
    // A picture sign (an emoji) keeps its colors when its text is painted in no color, so it is no letter that the program can hide.
    const letters = signs.replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u200d\ufe0f]/gu, '').length;
    if (signs.length === 0) return not('not read', WHY.noMockup);
    if (!shots || !read) return not('not read', WHY.unread);
    const found = shots.found[index] ?? 0;
    const places = shots.places[index] ?? [];
    if (found === 0 || places.length === 0) return not('not found', WHY.absent);
    if (letters === 0) return not('not read', WHY.pictures, found);
    let best: number | null = null;
    let least: number | null = null;
    let drawn = 0;
    const unsure: string[] = [];
    const hidden: string[] = [];
    places.forEach((place, at) => {
      const seen = read[index]?.[at];
      const needed = Math.max(letters * INK_PER_LETTER, (place.room * INK_PERCENT) / 100);
      if (!seen) unsure.push(WHY.unread);
      else if (seen.area === 0) {
        if (place.width > 0 && place.height > 0 && place.y >= pictured) unsure.push(WHY.below);
        else hidden.push(WHY.nowhere);
      } else if (seen.changed >= needed && seen.ink && seen.ground) {
        // What the page changed by itself must be far less than what the hidden letters changed.
        if (seen.noise * 10 > seen.changed) {
          unsure.push(WHY.changed);
          return;
        }
        drawn++;
        const ratio = ratioOf([...seen.ink, ...seen.ground]);
        const weakest = Math.min(ratio, ...seen.cells.map(ratioOf));
        if (best === null || ratio > best) best = ratio;
        if (least === null || weakest < least) least = weakest;
      } else if (seen.noise >= needed) unsure.push(WHY.changed);
      else if (place.special) unsure.push(WHY.special);
      else hidden.push(seen.changed > 0 ? WHY.few : WHY.nothing);
    });
    if (best !== null && least !== null) return { text, state: 'drawn', why: '', places: found, drawn, contrast: twoDecimals(best), least: twoDecimals(least) };
    if (unsure.length > 0) return not('not read', unsure[0] ?? WHY.unread, found);
    // Where one place is in the page and hidden, that says more than a place outside the page.
    return not('not drawn', hidden.find((why) => why !== WHY.nowhere) ?? WHY.nowhere, found);
  });
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
      const how = face.device ? 'the device’s own font: no font file belongs to it, and each machine draws its own letters, so the pictures show this machine’s' : face.drawn === null ? 'the program could not tell whether it is drawn' : face.drawn ? (face.fromFile ? 'drawn, from a font file' : 'drawn, from a font installed on this machine and not from a file') : face.file ? 'not drawn: the browser has no such font here, so a fallback draws these letters in the pictures' : 'not drawn: this machine has no font of that name, and the Vision names no font file for it, so a fallback draws these letters in the pictures; a visitor’s machine may have the font';
      out.push(`- “${face.family}”: ${texts}; ${how}.`);
    }
    out.push('');
    // A Vision of device fonts alone names no font file, so the advice to give some would mislead.
    const needsFiles = first.typefaces.some((face) => face.file);
    if (look.fontsGiven) out.push('The program was given font files and answered the page’s requests for them at the site’s own address.', '');
    else if (needsFiles) out.push('The program was given no font files. A built page is one file and ships no font, so a typeface that the page loads from the site’s own address is not drawn here; give the files (`--fonts`) to see the letters that visitors will see.', '');
  }
  out.push('### The three required texts: drawn or not', '');
  if (look.widths.length === 0) out.push('Not read.', '');
  else {
    out.push('| Text | Window width | Reading | Letters against what stands behind them |', '|---|---|---|---|');
    REQUIRED_TEXTS.forEach((text, index) => {
      for (const at of look.widths) {
        const read = at.texts[index];
        let reading = 'not read';
        let ratio = 'none';
        if (read && read.state !== 'drawn') reading = `${read.state}: ${read.why}`;
        else if (read) {
          const of = Math.min(read.places, PLACES_MAX);
          reading = of > 1 ? `drawn in ${String(read.drawn)} of ${String(of)} places` : 'drawn';
          const best = read.contrast ?? 0;
          const least = read.least ?? best;
          // Smoothed edges alone make the lowest ratio read a little under the highest; two numbers are for a real difference.
          ratio = least < best * RANGE_FROM ? `between ${least.toFixed(2)} and ${best.toFixed(2)} to 1` : `${best.toFixed(2)} to 1`;
        }
        out.push(`| The ${text} | ${String(at.width)} pixels | ${reading} | ${ratio} |`);
      }
    });
    out.push('', `The Brief requires three texts: the business name, the headline, and the primary action, as the Mockup shows them. The program finds each in the page as the Fit check does. It takes a picture, hides the letters of that text alone, and takes a second picture; nothing else in the page changes, and the page’s scripts stand still meanwhile. Where the two pictures are the same, no visitor saw the letters, whatever way the page hides them: under a box, cut away, moved off the page, shrunk, or in the color of the ground. A place draws the text when hiding it changes at least ${String(INK_PER_LETTER)} pixels for each letter and at least ${String(INK_PERCENT)} percent of the room that the letters take up; letters of which only a sliver shows change less.`, '');
    out.push(`The ratio compares the color of the letters with the color that stands in their place without them, by the WCAG 2.x formula; the usual least is 4.5 to 1, and 3 to 1 for large text. One number is the ratio where the letters stand out most. Two numbers say that the ratio is much lower somewhere: in another place of the same text, or along the text where the letters or their ground change color. Smoothed edges make thin letters read a little lower than their style values say. The program reads at most ${String(PLACES_MAX)} places of a text. It does not read how large the letters are: very small letters count as drawn.`, '');
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
  const runScripts = input.runScripts === true;
  const fonts = input.fonts ?? {};
  const fontsGiven = Object.keys(fonts).length > 0;
  // The names as tokens.json writes them (the design values keep them in lower case; the report shows them as written).
  const families = typefaceNames(input.files['tokens.json'] ?? '');
  const withFile = new Set(fontFilesOf(input.files['FONTS.md'] ?? '').map((font) => font.family.toLowerCase()));
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
      // The Mockup first, at every width: the build is read for the three texts that the Mockup shows (the Fit check reads them at
      // the widest window too).
      const references = new Map<number, Drawn>();
      const widest = Math.max(...WIDTHS);
      for (const width of WIDTHS) {
        try {
          // The Mockup holds no script; it is drawn with scripts off whatever the build does.
          references.set(width, await draw(browser, mockup, width, ms, false, [], {}, { brief: width === widest }));
        } catch {
          throw new FitError('The file "mockup.html" could not be drawn.');
        }
      }
      const wanted = references.get(widest)?.brief ?? REQUIRED_TEXTS.map(() => '');
      for (const width of WIDTHS) {
        const reference = references.get(width) as Drawn;
        let built: Drawn;
        try {
          built = await draw(browser, input.html, width, ms, runScripts, families, fonts, { wanted });
        } catch (error) {
          failures.push({ width, reason: failureSentence(error, ms) });
          continue;
        }
        const columns = width <= 400 ? 3 : 1;
        const read = await page.evaluate(readPixels, { build: built.png.toString('base64'), mockup: reference.png.toString('base64'), width, partHeight: PART_HEIGHT, pixelTolerance: PIXEL_TOLERANCE, shift: PIXEL_SHIFT, areaPercent: AREA_PERCENT, colorTolerance: COLOR_TOLERANCE, palette, columns });
        const shots = built.shots;
        const drawn = shots ? await page.evaluate(readDrawn, { before: built.png.toString('base64'), hidden: shots.hidden.map((picture) => picture?.toString('base64') ?? null), after: shots.after?.toString('base64') ?? null, places: shots.places.map((list) => list.map(({ x, y, width: w, height: h }) => ({ x, y, width: w, height: h }))), margin: INK_MARGIN, least: INK_LEAST, cell: INK_CELL }) : null;
        widths.push({
          width,
          buildHeight: built.height,
          mockupHeight: reference.height,
          cut: built.cut,
          differs: oneDecimal(read.differs),
          parts: read.parts.map(oneDecimal),
          colors: read.colors.map((color) => ({ hex: hexOf(color.rgb), percent: oneDecimal(color.share), nearest: color.nearest ? hexOf(color.nearest) : '' })),
          typefaces: built.typefaces.map((face) => ({ ...face, file: withFile.has(face.family.toLowerCase()) })),
          texts: textsOf(wanted, built.shots, drawn, Math.min(built.height, MAX_HEIGHT)),
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
