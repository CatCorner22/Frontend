// Craft rules: the fine details that the Studio adds by itself.
//
// A skilled person's page differs from a generic one in details that nobody asks for: numbers in a price list stand digit
// under digit, a heading breaks into even lines, a pressed button gives a little, a keyboard user sees where the focus is.
// The owner does not choose these; the Mockup has them in every design, and the Prescription asks the builder for them.
//
// Each record holds two texts for two readers. `name` and `what` are for the owner, in plain words. `instruction` is for
// the builder (Claude Code) and uses the exact terms of the trade, because a builder needs them.
//
// Each record also holds a check that a program runs on a page. A unit test runs every check on the Mockup of every
// built-in Direction: the Mockup must practice what the Prescription asks for. A rule that the Mockup does not meet cannot
// be in this list. `detail` is the exact text in the Mockup's page that the check rests on; the same test takes it out and
// expects the check to fail, so that no check can pass by accident.
//
// How strong each rule is, said plainly. Most come from two published rule sets by practitioners and one by a company
// (Jakub Krehel, Emil Kowalski, Vercel), which the research record names and which were read in full. A published practice
// is a convention, not a measurement: no craft rule is graded "measured". Four rules have no outside source; the assistant
// that wrote this Studio added them, and they are graded as its opinion.

import type { DesignParams } from '../params.js';
import { findStep } from './steps.js';
import type { Evidence, SourceRef } from './types.js';

export interface CraftRule {
  id: string;
  /** The detail, as a sentence that is true of the page. */
  name: string;
  /** What it is and why a person notices its absence, in plain words. */
  what: string;
  /** What the builder must do, in exact terms. Written into the Prescription. */
  instruction: string;
  /** The exact text in the Mockup's page that the check rests on. */
  detail: string;
  /** True when a page (its whole text, style sheet included) and its design values have the detail. */
  holds(page: string, tokens: Readonly<Record<string, string>>): boolean;
  /** What the open design gives, as a sentence, where a Decision sets the value; otherwise null. */
  now(params: DesignParams, tokens: Readonly<Record<string, string>>): string | null;
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

/** A time token in milliseconds: "120ms" is 120. Anything else is not a number here. */
const milliseconds = (value: string | undefined): number => (/^\d+(\.\d+)?ms$/.test(value ?? '') ? parseFloat(value!) : Number.NaN);
const stepName = (id: string): string => findStep(id)?.name ?? id;

/** True when every `:hover` rule of a style sheet stands inside a block that applies only where a pointer can hover. */
function hoverOnlyWhereItExists(page: string): boolean {
  const GATE = '@media (hover: hover)';
  let rest = page;
  let outside = '';
  for (let at = rest.indexOf(GATE); at !== -1; at = rest.indexOf(GATE)) {
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
  return page.includes(GATE) && page.includes(':hover') && !outside.includes(':hover');
}

export const CRAFT_RULES: readonly CraftRule[] = [
  {
    id: 'steady-numerals',
    name: 'Numbers that people compare keep one width.',
    what: 'In a price list every digit takes the same width, so that prices stand digit under digit and the eye can run down the column. A telephone number does not shift as it is read. With digits of their own widths, a column of prices looks ragged.',
    instruction: 'Set `font-variant-numeric: tabular-nums` on every number that is compared or that changes: prices in tables, telephone numbers, counters, list numbers. Right-align a column of prices. Keep proportional numerals for numbers inside running text.',
    detail: 'font-variant-numeric: var(--numeric); font-weight: 600;',
    holds: (page) => /\.fees td \{[^}]*font-variant-numeric: var\(--numeric\)/.test(page) && /\.phone \{[^}]*font-variant-numeric: tabular-nums/.test(page),
    now: (params) => (params.numerals === 'proportional'
      ? `Your Decision on the Step “${stepName('numerals')}” gives each digit its own width, so prices do not stand digit under digit. Telephone numbers and list numbers keep one width all the same.`
      : 'Prices stand digit under digit.'),
    evidence: 'convention',
    sources: [ruleSets('The Vercel Web Interface Guidelines and Jakub Krehel’s rule set ask for numbers of one width wherever numbers change or are compared, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'even-lines',
    name: 'A heading breaks into lines of even length, and a paragraph does not end on one stranded word.',
    what: 'A heading that breaks as “Dental care that explains itself before it” and then “begins.” looks careless. The browser can balance the lines by itself, and it can keep a single word from standing alone on a paragraph’s last line.',
    instruction: 'Set `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs. Do not insert manual line breaks to shape a heading.',
    detail: 'text-wrap: balance',
    holds: (page) => page.includes('text-wrap: balance') && page.includes('text-wrap: pretty'),
    now: () => null,
    evidence: 'convention',
    sources: [ruleSets('Jakub Krehel’s rule set asks for balanced headings and for paragraphs without a stranded last word, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'press-gives',
    name: 'A pressed button gives a little.',
    what: 'While a finger or the mouse holds a button down, the button shrinks by a few percent. The page answers the press at once, before anything else happens, and feels solid. A button that does not react to a press feels dead.',
    instruction: 'On `:active`, scale a button to between 0.95 and 0.98 of its size (0.97 here) with a transition of 100 to 160 ms on `transform`. Never scale below 0.95. When motion is off, do not scale.',
    detail: '.btn:active { transform: scale(var(--press-scale)); }',
    holds(page, tokens) {
      const scale = Number(tokens['--press-scale']);
      return page.includes(this.detail) && (scale === 1 || (scale >= 0.95 && scale <= 0.98));
    },
    now: (_params, tokens) => (tokens['--press-scale'] === '1'
      ? 'Your design has no movement, so a pressed button keeps its size.'
      : `A pressed button shrinks to ${Math.round(Number(tokens['--press-scale']) * 100)} percent of its size.`),
    evidence: 'convention',
    sources: [ruleSets('Jakub Krehel’s rule set names a press scale of 0.96 and Emil Kowalski’s one of 0.95 to 0.98, never below 0.95, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'focus-ring',
    name: 'A person who uses the keyboard always sees where the focus is.',
    what: 'The Tab key moves from link to button to field. A clear ring marks the one that the next key press will act on. The ring shows for the keyboard only, so a mouse click leaves no ring behind. Without it, a keyboard user works blind.',
    instruction: 'Style `:focus-visible`, never plain `:focus`, with a solid outline of at least 2 px (3 px here) and an offset of 2 px, in a color that stands at least 3 to 1 from every surface it is drawn on. Never remove an outline without a replacement. Check that sticky parts of the page do not cover the focused element.',
    detail: ':focus-visible { outline: var(--focus-w) solid var(--focus); outline-offset: 2px; }',
    holds(page, tokens) {
      return page.includes(this.detail) && parseFloat(tokens['--focus-w'] ?? '') >= 2;
    },
    now: (_params, tokens) => `The ring is ${parseFloat(tokens['--focus-w'] ?? '')} pixels thick.`,
    evidence: 'convention',
    sources: [ruleSets('The Vercel Web Interface Guidelines ask for a focus ring that shows for the keyboard only; the GOV.UK pattern uses a ring 3 pixels thick, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'less-motion',
    name: 'Nothing moves for a person who has asked the device for less motion.',
    what: 'Phones and computers have a setting for people whom movement on screen makes unwell or distracts. The page reads that setting and then shows every change at once, with no sliding and no fading.',
    instruction: 'Inside `@media (prefers-reduced-motion: reduce)`, switch off transitions and animations that move or scale things. A plain fade may stay; this Mockup switches off every transition and animation.',
    detail: '@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }',
    holds(page) {
      return page.includes(this.detail);
    },
    now: () => null,
    evidence: 'convention',
    sources: [ruleSets('Emil Kowalski’s rule sets and the Vercel Web Interface Guidelines ask that movement stops under this setting, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'short-moves',
    name: 'A change is short, starts fast, and settles gently.',
    what: 'When a button changes color or a box lifts, the change takes a fraction of a second and slows toward its end, as a real thing does when it comes to rest. A long or even-paced change makes a page feel slow; a change that starts slowly feels sluggish.',
    instruction: 'Name the properties that change (`background-color`, `border-color`, `color`, `box-shadow`, `transform`); never write `transition: all`. Use 100 to 160 ms for a press or a color change and under 300 ms for a larger change. Use a strong ease-out curve, here `cubic-bezier(0.23, 1, 0.32, 1)`, and never ease-in.',
    detail: 'var(--dur-fast) var(--ease-out)',
    holds(page, tokens) {
      const fast = milliseconds(tokens['--dur-fast']);
      const usual = milliseconds(tokens['--dur']);
      return page.includes(this.detail) && !/transition:\s*all\b/.test(page) && fast <= 160 && usual <= 300;
    },
    now: (_params, tokens) => (milliseconds(tokens['--dur']) === 0
      ? 'Your design has no movement: every change shows at once.'
      : `A change of color takes ${milliseconds(tokens['--dur-fast'])} milliseconds; a larger change takes ${milliseconds(tokens['--dur'])}.`),
    evidence: 'convention',
    sources: [ruleSets('Emil Kowalski’s rule set gives the lengths and the curve, and with Jakub Krehel’s and the Vercel guidelines it forbids changing every property at once, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'hover-with-a-pointer',
    name: 'A part changes under the mouse only on a device that has a mouse.',
    what: 'On a computer a link or a box reacts when the pointer is over it. A touch screen has no pointer; there the same reaction sticks after a tap and looks like a fault. So the reaction is told to apply only where a pointer can rest over a thing.',
    instruction: 'Put every `:hover` rule inside `@media (hover: hover)`. Do not hide information or actions behind hover.',
    detail: '@media (hover: hover)',
    holds: (page) => hoverOnlyWhereItExists(page),
    now: () => null,
    evidence: 'convention',
    sources: [ruleSets('Emil Kowalski’s rule set asks that hover effects apply only where a pointer can hover, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'nested-corners',
    name: 'A part inside a rounded box is never rounder than the box.',
    what: 'When a text field with very round corners sits in a card with slightly round corners, the two curves fight. The inner corner takes the smaller of the two roundings, and a frame inside a picture follows the picture’s own corner.',
    instruction: 'Keep corner radii concentric: outer radius = inner radius + the padding between them. Where a control sits in a card, cap the control’s radius at the card’s radius (`min(control, surface)`); let an inner frame inherit its parent’s radius.',
    detail: 'border-radius: min(var(--radius-control), var(--radius-surface));',
    holds(page) {
      return page.includes(this.detail) && page.includes('border-radius: inherit');
    },
    now: () => null,
    evidence: 'convention',
    sources: [ruleSets('Jakub Krehel’s rule set and the Vercel Web Interface Guidelines ask for corner roundings that nest, as recorded in the research.')],
    reviewed: WRITTEN,
  },
  {
    id: 'clear-underlines',
    name: 'The line under a link stands clear of the letters.',
    what: 'A browser draws the line under a link close to the letters, where it cuts through the tails of g, p, and y. Moved a little lower and drawn a little thinner, the line marks the link and leaves the word easy to read.',
    instruction: 'On links set `text-underline-offset` to about 0.2em and `text-decoration-thickness` to about 0.07em. Keep the underline on links in running text; color alone does not mark a link.',
    detail: 'text-underline-offset: 0.22em; text-decoration-thickness: 0.07em;',
    holds(page) {
      return page.includes(this.detail);
    },
    now: () => null,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
  {
    id: 'matching-controls',
    name: 'The browser’s own parts match a light or a dark page.',
    what: 'Scroll bars, the arrows of a number field, and the text that a browser fills in by itself are drawn by the browser, not by the page. Told whether the page is light or dark, the browser draws them to match. Untold, it draws light parts on a dark page.',
    instruction: 'Declare the page’s scheme: `<meta name="color-scheme" content="light">` or `"dark"`, and the same `color-scheme` property on the root when the page can switch.',
    detail: '<meta name="color-scheme" content="',
    holds: (page) => /<meta name="color-scheme" content="(light|dark)">/.test(page),
    now: (params) => `The page tells the browser that it is ${params.theme}.`,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
  {
    id: 'own-selection',
    name: 'Marked text takes the design’s own color.',
    what: 'When a person drags over text to copy it, the browser paints the marked part in its standard blue. In the design’s own color, at part strength, the page stays in one piece and the marked text stays readable.',
    instruction: 'Style `::selection` with a translucent tint of the accent as background. Check that marked text keeps enough contrast against the tint.',
    detail: '::selection { background: var(--selection); }',
    holds(page) {
      return page.includes(this.detail);
    },
    now: () => null,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
  {
    id: 'long-words',
    name: 'A long word or address cannot push the page wider than the screen.',
    what: 'An e-mail address, a web address, or a long name has no place to break. On a phone it would stick out past the edge and make the whole page slide sideways. The page lets such a word break where it must.',
    instruction: 'Set `overflow-wrap: break-word` on the body, and `min-width: 0` on grid and flex children that hold text. Test every screen at 320 px for horizontal scrolling.',
    detail: 'overflow-wrap: break-word;',
    holds(page) {
      return page.includes(this.detail);
    },
    now: () => null,
    evidence: 'expert-opinion',
    sources: [OWN],
    reviewed: WRITTEN,
  },
];

export interface CraftLine {
  rule: CraftRule;
  now: string | null;
}

/** Every craft rule with what the open design gives. `tokens` is the design's worked-out values (the `css` part of `deriveTokens`). */
export function craftReport(params: DesignParams, tokens: Readonly<Record<string, string>>): CraftLine[] {
  return CRAFT_RULES.map((rule) => ({ rule, now: rule.now(params, tokens) }));
}
