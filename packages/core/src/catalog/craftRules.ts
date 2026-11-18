// Craft rules: the fine details that the Studio adds by itself.
//
// A skilled person's page differs from a generic one in details that nobody asks for: numbers in a price list stand digit
// under digit, a heading breaks into even lines, a pressed button gives a little, a keyboard user sees where the focus is.
// The owner does not choose these; the Mockup has them, and the Vision asks the AI coding tool for them.
//
// Each record holds texts for two readers. `name`, `what`, and `now` are for the owner, in plain words. `instruction` is
// for the AI coding tool that builds the page and uses the exact terms of the trade, because such a tool needs them.
//
// A rule follows the design. A Decision can set a rule aside, in whole or in part: with digits of natural width, prices do
// not stand digit under digit; with no motion, nothing shrinks or eases. `instruction` and `now` then say what stands
// instead, so that no text asks for what a Decision excludes (review of 2026-11-15, findings T6-01, T6-03, and U6-09).
//
// Each record also holds a check that a program runs on a page's style sheet. The check is a search for the mark of the
// detail: an exact piece of the style sheet (`detail`), and where it matters the absence of what the rule forbids. A unit
// test runs every check on the Mockup of every built-in Direction, takes `detail` out and expects the check to fail, and
// plants the faults that the review named. A search for text is not a proof: a check cannot see the drawn page, and a
// style sheet can hold a fault that no check looks for.
//
// How strong each rule is, said plainly. Nine rest on three published rule sets (Jakub Krehel, Emil Kowalski, Vercel),
// which the research record names and which were read in full. The record itself calls them practitioner opinion, so each
// is graded "expert opinion", and a source line says where a rule departs from its source. Three rules have no outside
// source; the assistant that wrote this Studio added them. No craft rule is graded "measured" or "convention".

import type { DesignParams } from '../params.js';
import { findStep } from './steps.js';
import type { Evidence, SourceRef } from './types.js';

type Values = Readonly<Record<string, string>>;

export interface CraftRule {
  id: string;
  /** The detail, as a sentence. It is true of the page unless the design sets the rule aside (`aside`). */
  name: string;
  /** What it is and why a person notices its absence, in plain words. */
  what: string;
  /** What the AI coding tool must do in this design, in exact terms. Written into the Vision. */
  instruction(params: DesignParams, tokens: Values): string;
  /** The exact text in the Mockup's style sheet that the check rests on. */
  detail: string;
  /** True when a style sheet (see `craftSheet`) and the design values carry the mark of the detail. */
  holds(sheet: string, tokens: Values): boolean;
  /** What the open design gives, as a sentence in plain words, where the design sets a value; otherwise null. */
  now(params: DesignParams, tokens: Values): string | null;
  /** True when the open design sets the rule aside, in whole or in part; `now` then says how. */
  aside(params: DesignParams): boolean;
  evidence: Evidence;
  sources: SourceRef[];
  /** The date the record was written, as YYYY-MM-DD. No person has reviewed it. */
  reviewed: string;
}

const R04 = 'docs/research/04-best-human-built-frontends.md';
const WRITTEN = '2026-11-15';
/** A rule set that the research record read in full (its section 2, "Craft practices as checkable rules"). */
const ruleSets = (text: string): SourceRef => ({ text, basis: 'read', record: R04 });
const builder = (text: string): SourceRef => ({ text, basis: 'builder' });
const OWN = builder('The assistant that wrote this Studio added this detail. No outside source was read for it.');

/** A time value in milliseconds: "120ms" is 120. Anything else is not a number here. */
const milliseconds = (value: string | undefined): number => (/^\d+(\.\d+)?ms$/.test(value ?? '') ? parseFloat(value!) : Number.NaN);
const stepName = (id: string): string => findStep(id)?.name ?? id;
const never = (): boolean => false;
const noMotion = (params: DesignParams): boolean => params.motion === 'none';
const NO_MOTION = `This design has no movement (Step “${stepName('motion')}”)`;

const HOVER_GATE = '@media (hover: hover) and (pointer: fine)';

/** True when every `:hover` rule of a style sheet stands inside a block that applies only where a pointer can rest over a thing. */
function hoverOnlyWhereItExists(sheet: string): boolean {
  let rest = sheet;
  let outside = '';
  for (let at = rest.indexOf(HOVER_GATE); at !== -1; at = rest.indexOf(HOVER_GATE)) {
    outside += rest.slice(0, at);
    // Skip the gated block: from its opening brace to the brace that closes it.
    let depth = 0;
    let end = rest.indexOf('{', at);
    if (end === -1) return false;
    do {
      if (rest[end] === '{') depth++;
      else if (rest[end] === '}') depth--;
      end++;
    } while (depth > 0 && end < rest.length);
    rest = rest.slice(end);
  }
  outside += rest;
  return sheet.includes(HOVER_GATE) && sheet.includes(':hover') && !outside.includes(':hover');
}

export const CRAFT_RULES: readonly CraftRule[] = [
  {
    id: 'steady-numerals',
    name: 'Numbers that people compare keep one width.',
    what: 'In a price list every digit takes the same width, so that prices stand digit under digit and the eye can run down the column. A telephone number does not shift as it is read. With digits of their own widths, a column of prices looks ragged.',
    instruction: (params) => (params.numerals === 'proportional'
      ? `The Step “${stepName('numerals')}” gives this design digits of their natural widths: set \`font-variant-numeric: normal\` on prices. Set \`font-variant-numeric: tabular-nums\` all the same on telephone numbers, counters, and list numbers. Right-align a column of prices.`
      : 'Set `font-variant-numeric: tabular-nums` on every number that is compared or that changes: prices in tables, telephone numbers, counters, list numbers. Right-align a column of prices. Keep proportional numerals for numbers inside running text.'),
    detail: 'font-variant-numeric: var(--numeric); font-weight: 600;',
    holds: (sheet) => /\.fees td \{[^}]*font-variant-numeric: var\(--numeric\)/.test(sheet) && /\.phone \{[^}]*font-variant-numeric: tabular-nums/.test(sheet),
    now: (params) => (params.numerals === 'proportional'
      ? `This design uses digits of their natural widths (Step “${stepName('numerals')}”), so prices do not stand digit under digit. Telephone numbers and list numbers keep one width all the same.`
      : 'Prices stand digit under digit.'),
    aside: (params) => params.numerals === 'proportional',
    evidence: 'expert-opinion',
    sources: [ruleSets('The Vercel Web Interface Guidelines and Jakub Krehel’s rule set ask for numbers of one width wherever numbers change or are compared, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'even-lines',
    name: 'A heading breaks into lines of even length, and a paragraph does not end on one stranded word.',
    what: 'A heading that breaks as “Dental care that explains itself before it” and then “begins.” looks careless. The browser can balance the lines by itself, and it can keep a single word from standing alone on a paragraph’s last line.',
    instruction: () => 'Set `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. Do not insert manual line breaks to shape a heading.',
    detail: 'text-wrap: balance',
    // The two values must stand in the rules for headings and for paragraphs, not just anywhere in the sheet.
    holds: (sheet) => /(^|[},])\s*h1\b[^{]*\{[^}]*text-wrap: balance/m.test(sheet) && /(^|\})\s*p \{[^}]*text-wrap: pretty/m.test(sheet),
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('Jakub Krehel’s rule set asks for balanced headings and for paragraphs without a stranded last word, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'press-gives',
    name: 'A pressed button gives a little.',
    what: 'While a finger or the mouse holds a button down, the button shrinks by a few percent; a button with a hard shadow moves into its shadow instead. The page answers the press at once, before anything else happens, and feels solid. In a design without movement the button stays as it is.',
    instruction(params, tokens) {
      if (noMotion(params)) return `${NO_MOTION}: do not scale or move a pressed button.`;
      if (params.elevation === 'hard-shadow') return 'On `:active`, move a button 2 px down and 2 px to the right, into its hard shadow, and take the shadow away (`transform: translate(2px, 2px); box-shadow: none`), with a transition of 100 to 160 ms. Do not also scale it.';
      return `On \`:active\`, scale a button to between 0.95 and 0.98 of its size (${tokens['--press-scale'] ?? ''} here) with a transition of 100 to 160 ms on \`transform\`. Never scale below 0.95.`;
    },
    detail: '.btn:active { transform: scale(var(--press-scale)); }',
    holds(sheet, tokens) {
      const scale = Number(tokens['--press-scale']);
      // A button with a hard shadow moves into its shadow, but not in a design without movement.
      return sheet.includes(this.detail) && sheet.includes('body[data-elevation="hard-shadow"]:not([data-motion="none"]) .btn:active { transform: translate(2px, 2px);') && (scale === 1 || (scale >= 0.95 && scale <= 0.98));
    },
    now(params, tokens) {
      if (noMotion(params)) return `${NO_MOTION}, so a pressed button keeps its size and its place.`;
      if (params.elevation === 'hard-shadow') return 'A pressed button moves 2 pixels into its shadow.';
      return `A pressed button shrinks to ${Math.round(Number(tokens['--press-scale']) * 100)} percent of its size.`;
    },
    aside: noMotion,
    evidence: 'expert-opinion',
    sources: [ruleSets('Jakub Krehel’s rule set names a press scale of 0.96 and Emil Kowalski’s one of 0.95 to 0.98, never below 0.95, as recorded in the research. The move into a hard shadow is this Studio’s own addition; no source was read for it.')],
    reviewed: WRITTEN,
  },
  {
    id: 'focus-ring',
    name: 'A person who uses the keyboard always sees where the focus is.',
    what: 'The Tab key moves from link to button to field. A clear ring marks the one that the next key press will act on. The ring shows for the keyboard only, so a mouse click leaves no ring behind. Without it, a keyboard user works blind.',
    instruction: (_params, tokens) => `Style \`:focus-visible\`, never plain \`:focus\`, with a solid outline of at least 2 px (${String(parseFloat(tokens['--focus-w'] ?? ''))} px here) and an offset of 2 px, in a color that stands at least 3 to 1 from every surface it is drawn on. On a text field the offset is 0: the ring sits on the field’s edge, with a soft halo of the same color around it. Never remove an outline without a replacement. Check that sticky parts of the page do not cover the focused element.`,
    detail: ':focus-visible { outline: var(--focus-w) solid var(--focus); outline-offset: 2px; }',
    holds(sheet, tokens) {
      return sheet.includes(this.detail) && !/outline(-width|-style)?:\s*(none|0)\b/.test(sheet) && parseFloat(tokens['--focus-w'] ?? '') >= 2;
    },
    now: (_params, tokens) => `The ring is ${String(parseFloat(tokens['--focus-w'] ?? ''))} pixels thick.`,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('The Vercel Web Interface Guidelines ask for a focus ring that shows for the keyboard only and that sticky parts never cover; the GOV.UK pattern uses a ring 3 pixels thick, as recorded in the research. The least width of 2 pixels, the offset, and the figure of 3 to 1 are this Studio’s own; the research record does not hold them.')],
    reviewed: WRITTEN,
  },
  {
    id: 'less-motion',
    name: 'Nothing moves for a person who has asked the device for less motion.',
    what: 'Phones and computers have a setting for people whom movement on screen makes unwell or distracts. The page reads that setting and then shows every change at once, with no sliding and no fading.',
    instruction: () => 'Inside `@media (prefers-reduced-motion: reduce)`, switch off transitions and animations that move or scale things. A plain fade may stay; `mockup.html` switches off every transition and animation.',
    detail: '@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }',
    holds(sheet) {
      return sheet.includes(this.detail);
    },
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('Emil Kowalski’s rule sets and the Vercel Web Interface Guidelines ask that movement stops under this setting and allow a fade to stay, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'short-moves',
    name: 'A change is short, starts fast, and settles gently.',
    what: 'When a button changes color or a box lifts, the change takes a fraction of a second and slows toward its end, as a real thing does when it comes to rest. A long or even-paced change makes a page feel slow; a change that starts slowly feels sluggish.',
    instruction(params, tokens) {
      if (noMotion(params)) return `${NO_MOTION}: write no transition and no animation.`;
      const entrance = params.motion === 'expressive'
        ? ` This design has one entrance (Step “${stepName('motion')}”): the parts of the first screen rise into place once, each over \`--dur-slow\` (${String(milliseconds(tokens['--dur-slow']))} ms), 70 ms apart. Nothing else may take that long.`
        : '';
      return `Name the properties that change (\`background-color\`, \`border-color\`, \`color\`, \`box-shadow\`, \`transform\`); never write \`transition: all\`. Use 100 to 160 ms for a press or a color change (\`--dur-fast\`, ${String(milliseconds(tokens['--dur-fast']))} ms here) and under 300 ms for a larger change (\`--dur\`, ${String(milliseconds(tokens['--dur']))} ms here). Use a strong ease-out curve, here \`${tokens['--ease-out'] ?? ''}\`, and never ease-in.${entrance}`;
    },
    detail: 'var(--dur-fast) var(--ease-out)',
    holds(sheet, tokens) {
      const fast = milliseconds(tokens['--dur-fast']);
      const usual = milliseconds(tokens['--dur']);
      const slow = milliseconds(tokens['--dur-slow']);
      const forbidden = /transition(-property)?:\s*all\b/.test(sheet) || /\bease-in\b(?!-out)/.test(sheet);
      return sheet.includes(this.detail) && !forbidden && fast <= 160 && usual <= 300 && slow <= 500;
    },
    now(params, tokens) {
      if (noMotion(params)) return `${NO_MOTION}: every change shows at once.`;
      return `A change of color takes ${String(milliseconds(tokens['--dur-fast']))} milliseconds; a larger change takes ${String(milliseconds(tokens['--dur']))}.${params.motion === 'expressive' ? ' The first screen rises into place once, when the page opens.' : ''}`;
    },
    aside: noMotion,
    evidence: 'expert-opinion',
    sources: [ruleSets('Emil Kowalski’s rule set gives the lengths and the curve, and with Jakub Krehel’s and the Vercel guidelines it forbids changing every property at once, as recorded in the research. This rule departs from those sources in two points: they ask that only position and transparency change, while this rule also lets colors and shadows change, as the sample website does; and one of them asks for no entrance when a page first opens, while a design with expressive motion has one.')],
    reviewed: WRITTEN,
  },
  {
    id: 'hover-with-a-pointer',
    name: 'A part changes under the mouse only on a device that has a mouse.',
    what: 'On a computer a link or a box reacts when the pointer is over it. A touch screen has no pointer; there the same reaction sticks after a tap and looks like a fault. So the reaction is told to apply only where a fine pointer can rest over a thing.',
    instruction: () => `Put every \`:hover\` rule inside \`${HOVER_GATE}\`. Do not hide information or actions behind hover.`,
    detail: HOVER_GATE,
    holds: (sheet) => hoverOnlyWhereItExists(sheet),
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('Emil Kowalski’s rule set asks that hover effects apply only where a fine pointer can hover, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'nested-corners',
    name: 'A large field inside a rounded box is never rounder than the box, and a frame inside a picture follows the picture’s corner.',
    what: 'When a field of several lines with very round corners sits in a card with slightly round corners, the two curves fight. The field takes the smaller of the two roundings, and a frame drawn inside a picture follows the picture’s own corner. A button or a one-line field may keep a fully round shape inside a card: a pill is a shape of its own.',
    instruction: () => 'Cap the radius of a multi-line field inside a card at the card’s radius: `border-radius: min(control, surface)`. Let a frame drawn inside a picture inherit the picture’s radius (`border-radius: inherit`). A pill-shaped button or one-line field may stay a pill inside a card. Where you add a box that sits flush inside another box, keep the corners concentric: inner radius = outer radius − the padding between them.',
    detail: 'border-radius: min(var(--radius-control), var(--radius-surface));',
    holds(sheet) {
      return sheet.includes(this.detail) && sheet.includes('border-radius: inherit');
    },
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('Jakub Krehel’s rule set and the Vercel Web Interface Guidelines ask for corner roundings that nest (outer radius = inner radius + padding), as recorded in the research. The sample website has no box that sits flush inside another, so it practices the rule only for the large field and the picture frame; the leave for pills is this Studio’s own.')],
    reviewed: WRITTEN,
  },
  {
    id: 'clear-underlines',
    name: 'The line under a link stands clear of the letters.',
    what: 'A browser draws the line under a link close to the letters, where it cuts through the tails of g, p, and y. Moved a little lower and drawn a little thinner, the line marks the link and leaves the word easy to read.',
    instruction: () => 'On links set `text-underline-offset` to about 0.2em and `text-decoration-thickness` to about 0.07em. Keep the underline on links in running text; color alone does not mark a link.',
    detail: 'text-underline-offset: 0.22em; text-decoration-thickness: 0.07em;',
    holds(sheet) {
      return sheet.includes(this.detail);
    },
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
  {
    id: 'matching-controls',
    name: 'The browser’s own parts match a light or a dark page.',
    what: 'Scroll bars, the arrows of a number field, and the text that a browser fills in by itself are drawn by the browser, not by the page. Told whether the page is light or dark, the browser draws them to match. Untold, it draws light parts on a dark page.',
    instruction: (params) => `Declare the page’s scheme: \`<meta name="color-scheme" content="${params.theme}">\`, and the same \`color-scheme\` property on the root when the page can switch.`,
    detail: '<meta name="color-scheme" content="',
    holds: (sheet) => /<meta name="color-scheme" content="(light|dark)">/.test(sheet),
    now: (params) => `The page tells the browser that it is ${params.theme}.`,
    aside: never,
    evidence: 'expert-opinion',
    sources: [ruleSets('The Vercel Web Interface Guidelines ask a page to declare its color scheme, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'own-selection',
    name: 'Marked text takes the design’s own color.',
    what: 'When a person drags over text to copy it, the browser paints the marked part in its standard blue. In the design’s own color, at part strength, the page stays in one piece and the marked text stays readable.',
    instruction: () => 'Style `::selection` with a translucent tint of the accent as background. Check that marked text keeps enough contrast against the tint.',
    detail: '::selection { background: var(--selection); }',
    holds(sheet) {
      return sheet.includes(this.detail);
    },
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
  {
    id: 'long-words',
    name: 'A long word or address cannot push the page wider than the screen.',
    what: 'An e-mail address, a web address, or a long name has no place to break. On a phone it would stick out past the edge and make the whole page slide sideways. The page lets such a word break where it must.',
    instruction: () => 'Set `overflow-wrap: anywhere` on the body: a long word then breaks where it must, and a grid or flex child may become narrower than its longest word (`break-word` does not allow that). Keep `white-space: nowrap` only on short labels such as a button. Test every screen at 320 px, with a 40-letter word in the name and the headline, for horizontal scrolling.',
    detail: 'overflow-wrap: anywhere;',
    holds(sheet) {
      return sheet.includes(this.detail);
    },
    now: () => null,
    aside: never,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
];

export interface CraftLine {
  rule: CraftRule;
  /** What the AI coding tool must do in this design. */
  instruction: string;
  now: string | null;
  /** True when the design sets the rule aside, in whole or in part; `now` says how. */
  aside: boolean;
  /** True when every source of the rule is the Studio's own judgment. */
  ownJudgment: boolean;
}

/**
 * The part of a page that a craft rule's check may read: its style sheets, and the tag that tells the browser whether the
 * page is light or dark. The page's visible text stays out: words such as ":hover" in a business name once made a check
 * report a missing detail (finding S6-06). Text from a project cannot stand in this part: the Mockup writes "<" in a text
 * as "&lt;", so a text cannot open a style sheet.
 */
export function craftSheet(page: string): string {
  const scheme = /<meta name="color-scheme"[^>]*>/.exec(page)?.[0] ?? '';
  return [scheme, ...[...page.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((sheet) => sheet[1]!)].join('\n');
}

/** Every craft rule with what the open design gives. `tokens` is the design's worked-out values (the `css` part of `deriveTokens`). */
export function craftReport(params: DesignParams, tokens: Values): CraftLine[] {
  return CRAFT_RULES.map((rule) => ({
    rule,
    instruction: rule.instruction(params, tokens),
    now: rule.now(params, tokens),
    aside: rule.aside(params),
    ownJudgment: rule.sources.every((source) => source.basis === 'builder'),
  }));
}
