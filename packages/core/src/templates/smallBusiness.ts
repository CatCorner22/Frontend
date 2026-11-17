// Template 1: small-business website (home page with services, facts, about, and a contact form).
// The Mockup is plain semantic HTML and CSS. It contains no script. Every visual value comes from a token.

import { assertKnownParams, type DesignParams } from '../params.js';
import { tokensToCss } from '../tokens.js';

export interface ServiceItem {
  title: string;
  body: string;
}

export interface FactItem {
  value: string;
  label: string;
}

export interface FeeItem {
  item: string;
  price: string;
}

export interface SiteContent {
  business: string;
  /** Short label near the headline, for example a founding year or a locality. */
  tag: string;
  headline: string;
  /** A phrase inside the headline that a signature element may highlight. */
  headlineEmphasis: string;
  lede: string;
  primaryAction: string;
  secondaryAction: string;
  phone: string;
  nav: string[];
  servicesTitle: string;
  servicesIntro: string;
  services: ServiceItem[];
  facts: FactItem[];
  /** A short price list. It gives the Mockup a column of numbers, where number styles show. */
  feesTitle: string;
  fees: FeeItem[];
  aboutTitle: string;
  aboutBody: string;
  promise: string;
  contactTitle: string;
  contactBody: string;
  address: string;
  hours: string;
  footerNote: string;
}

/** Sample content. The Studio labels it as a sample; the owner replaces it on the screen "Your content" (the Brief). */
export const SAMPLE_CONTENT: SiteContent = {
  business: 'Harbor Street Dental',
  tag: 'Family dentistry on Harbor Street',
  headline: 'Dental care that explains itself before it begins.',
  headlineEmphasis: 'explains itself',
  lede: 'Checkups, cleanings, and repairs for adults and children. We show you what we see, tell you what it costs, and let you decide.',
  primaryAction: 'Book a visit',
  secondaryAction: 'See what a first visit includes',
  phone: '555-0117',
  nav: ['Services', 'First visit', 'Fees', 'About', 'Contact'],
  servicesTitle: 'What we do',
  servicesIntro: 'Three kinds of visit cover most of what people need.',
  services: [
    { title: 'Checkups and cleanings', body: 'A full look, a careful clean, and photographs of anything worth watching, explained in plain words.' },
    { title: 'Repairs', body: 'Fillings, crowns, and chipped teeth. You see the price and the options before any work starts.' },
    { title: 'Urgent visits', body: 'Pain, swelling, or a broken tooth. Call before ten and we will see you the same day when a chair is free.' },
  ],
  facts: [
    { value: '6 days', label: 'open each week' },
    { value: '45 min', label: 'for a first visit' },
    { value: '3', label: 'treatment rooms' },
  ],
  feesTitle: 'Typical fees',
  fees: [
    { item: 'Checkup and cleaning', price: '$118' },
    { item: 'Filling', price: '$181' },
    { item: 'Crown', price: '$1,110' },
    { item: 'Urgent visit', price: '$88' },
  ],
  aboutTitle: 'A small practice, on purpose',
  aboutBody: 'Two dentists and one hygienist. You see the same people each time, and they remember what you told them last time.',
  promise: 'No work starts until you have seen the price and said yes.',
  contactTitle: 'Ask for an appointment',
  contactBody: 'Tell us how to reach you and what you need. We reply on the next working day.',
  address: '41 Harbor Street, Suite 2',
  hours: 'Monday to Saturday, 8 to 5',
  footerNote: 'Sample content for design preview.',
};

/** The region of the page that a preview opens at. A sandboxed preview cannot be scrolled from outside, so the page itself starts there. */
export const MOCKUP_FOCUSES = ['top', 'facts', 'services', 'fees', 'about', 'contact', 'overlays', 'buttons', 'box'] as const;
/**
 * The Overlays that the Mockup can draw, by identifier. The list is fixed here, so that only these words can reach the page's
 * markup; a unit test holds it equal to the Catalog's Overlays.
 */
export const MOCKUP_OVERLAYS = ['tooltip', 'confirm', 'notice', 'field-error', 'loading', 'sticky-call'] as const;
/** The two close-ups: one part of the page and nothing else. They serve the small pictures on a card; the others are regions of the page. */
export const MOCKUP_CLOSE_UPS = ['buttons', 'box'] as const;
export type MockupFocus = (typeof MOCKUP_FOCUSES)[number];

export interface MockupInput {
  params: DesignParams;
  /** Derived CSS custom properties. */
  tokens: Record<string, string>;
  content: SiteContent;
  focus?: MockupFocus;
  /** A still preview skips entrance animation (used for small thumbnails). */
  still?: boolean;
  /** The Overlays that are switched on. The region "overlays" draws each one open; a Mockup has no script, so none opens or closes. */
  overlays?: readonly string[];
  /** Draw the switched-on Overlays, open, as a last part of the whole page too (for the reference page of the Vision). */
  overlaysShown?: boolean;
  /** The fingerprint of the design values, written into the page's head so that the page can be matched with the other files of a Vision. */
  fingerprint?: string;
  /** `@font-face` rules for the fonts in use. The Studio supplies these; exports reference font files instead. */
  fontFaceCss?: string;
  /**
   * `inert` (for previews): links look and take focus like links but lead nowhere. A preview is a picture of a page;
   * a real link inside it would load the Studio's own address into the preview and blank it.
   * `live` (for an exported page): links carry real addresses inside the page.
   */
  links?: 'live' | 'inert';
}

/** Escape text for safe insertion into HTML. Content is always data, never markup. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function headlineHtml(content: SiteContent): string {
  const { headline, headlineEmphasis } = content;
  const at = headlineEmphasis ? headline.indexOf(headlineEmphasis) : -1;
  if (at < 0) return escapeHtml(headline);
  const before = headline.slice(0, at);
  const after = headline.slice(at + headlineEmphasis.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(headlineEmphasis)}</mark>${escapeHtml(after)}`;
}

const pad2 = (n: number): string => String(n).padStart(2, '0');

// A small tile of film grain, drawn by the browser from an SVG noise filter. No image file is needed.
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const SMALL_BUSINESS_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: var(--text-base); line-height: var(--leading-body);
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; font-kerning: normal; font-optical-sizing: auto;
  /* A word that is wider than its line breaks instead of pushing the page wider than the screen. */
  /* "anywhere", not "break-word": a long word then breaks where it must, and a grid or flex part may also become narrower
     than its longest word. With "break-word" a long name or headline of the owner's own made the whole page wider than
     the window (finding B17-01). */
  overflow-wrap: anywhere;
}
::selection { background: var(--selection); }
h1, h2, h3 {
  font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking);
  text-transform: var(--heading-transform); line-height: var(--leading-heading); margin: 0; text-wrap: balance;
}
p { margin: 0; text-wrap: pretty; }
:where(a[role="link"]) { text-decoration: underline; cursor: pointer; }
/* Underlines sit a little below the text and start soft; they firm up under the pointer. */
a { color: var(--accent-text); text-underline-offset: 0.22em; text-decoration-thickness: 0.07em; text-decoration-color: color-mix(in oklch, currentColor 45%, transparent); transition: text-decoration-color var(--dur-fast) var(--ease-out); }
@media (hover: hover) and (pointer: fine) { a:hover { text-decoration-color: currentColor; } }
.wrap { width: 100%; max-width: var(--page-max); margin-inline: auto; padding-inline: var(--space-6); }
.skip { position: absolute; left: var(--space-4); top: -100px; background: var(--surface); color: var(--text); padding: var(--space-2) var(--space-4); border-radius: var(--radius-small); z-index: 60; }
.skip:focus { top: var(--space-4); }
:focus-visible { outline: var(--focus-w) solid var(--focus); outline-offset: 2px; }
/* On the first screen the ring takes a color that stands out from that screen, which may be painted in the accent. */
.hero :focus-visible { outline-color: var(--focus-hero); }
mark { background: none; color: inherit; }

/* Page-wide layers: a faint glow behind glass surfaces, and optional film grain on top. */
body::before { content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none; background-image: var(--page-atmo); }
body[data-atmosphere="grain"]::after { content: ""; position: fixed; inset: 0; z-index: 50; pointer-events: none; opacity: var(--grain-opacity); background-image: ${GRAIN}; mix-blend-mode: multiply; }
body[data-atmosphere="grain"][data-theme="dark"]::after { mix-blend-mode: overlay; }

/* Motion: only the properties that change are animated, and everything can be interrupted. */
.btn, .nav li a, .field input, .field textarea, .service, .more {
  transition: background-color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), box-shadow var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--target-min); padding: 0 var(--space-5);
  border: var(--control-border-w) solid transparent; border-radius: var(--radius-control);
  font: inherit; font-weight: 600; letter-spacing: -0.006em; text-decoration: none; cursor: pointer; white-space: nowrap; user-select: none;
}
.btn-primary { background: var(--btn-bg); color: var(--btn-color); border-color: var(--btn-border); box-shadow: var(--btn-shadow); }
@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover { background: var(--btn-bg-hover); box-shadow: var(--btn-shadow-hover); }
}
.btn:active { transform: scale(var(--press-scale)); }
/* A button with a hard shadow moves into its shadow. Not in a design without movement: there a pressed button stays put. */
body[data-elevation="hard-shadow"]:not([data-motion="none"]) .btn:active { transform: translate(2px, 2px); box-shadow: none; }

/* Header and navigation */
.site-header { position: var(--header-position); top: 0; z-index: 30; border-bottom: var(--border-w) solid var(--border); background: var(--header-bg); -webkit-backdrop-filter: var(--header-backdrop); backdrop-filter: var(--header-backdrop); }
.nav { display: flex; align-items: center; gap: var(--space-3) var(--space-6); min-height: calc(var(--target-min) + var(--space-6)); flex-wrap: wrap; padding-block: var(--space-2); }
.brand { font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking); font-size: var(--brand-size); color: var(--text); text-decoration: none; margin-right: auto; }
.nav ul { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-5); list-style: none; margin: 0; padding: 0; }
.nav li a { display: inline-flex; align-items: center; min-height: var(--target-min); color: var(--text-muted); text-decoration: none; font-size: var(--text-sm); font-weight: 500; }
.nav li a[aria-current="page"] { color: var(--text); }
@media (hover: hover) and (pointer: fine) { .nav li a:hover { color: var(--text); } }
.nav-actions { display: none; align-items: center; gap: var(--space-4); }
.phone { color: var(--text); font-weight: 600; text-decoration: none; font-variant-numeric: tabular-nums; white-space: nowrap; }

body[data-nav="top-centered"] .nav { flex-direction: column; gap: var(--space-1); padding-block: var(--space-5) var(--space-2); }
body[data-nav="top-centered"] .brand { margin: 0; font-size: var(--h3-size); }
body[data-nav="top-centered"] .nav ul { justify-content: center; }
body[data-nav="split-cta"] .nav-actions { display: flex; }
body[data-nav="split-cta"] .brand { margin-right: 0; }
body[data-nav="split-cta"] .nav nav { margin-inline: auto; }
@media (max-width: 719px) {
  body[data-nav="split-cta"] .nav nav { order: 3; width: 100%; margin: 0; }
  body[data-nav="split-cta"] .brand { margin-right: auto; }
  /* Only the telephone number in the top bar goes. The rule once named every telephone number, so the number in the contact
     part vanished on a phone, where it is the most useful (code review of 2026-11-13, finding "tokens 1"). */
  body[data-nav="split-cta"] .nav-actions .phone { display: none; }
}
@media (min-width: 960px) {
  body[data-nav="side-rail"] { display: grid; grid-template-columns: 15rem minmax(0, 1fr); grid-template-rows: 1fr auto; min-height: 100vh; }
  body[data-nav="side-rail"] .site-header { position: static; grid-row: 1 / span 2; border-bottom: 0; border-right: var(--border-w) solid var(--border); background: var(--surface-2); }
  body[data-nav="side-rail"] .site-header .nav { flex-direction: column; align-items: flex-start; position: sticky; top: 0; padding: var(--space-8) var(--space-6); gap: var(--space-8); max-width: none; }
  body[data-nav="side-rail"] .nav ul { flex-direction: column; gap: 0; }
  body[data-nav="side-rail"] .brand { margin: 0; }
  body[data-nav="side-rail"] .nav-actions { display: flex; flex-direction: column; align-items: flex-start; }
}

/* Hero */
.hero { position: relative; isolation: isolate; overflow: clip; background: var(--hero-bg); color: var(--hero-text); padding-block: calc(var(--section-gap) * 0.85); }
.hero::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background-image: var(--atmo-image); background-size: var(--atmo-size); -webkit-mask-image: var(--atmo-mask); mask-image: var(--atmo-mask); }
.hero-grid { display: grid; gap: var(--space-10); align-items: center; }
/* The headline: never wider than the screen allows, and never smaller than its floor (see --h1-floor in the tokens). */
.hero h1 { font-size: clamp(var(--h1-floor), calc(var(--text-display) * var(--display-scale)), calc(13vw * var(--display-scale))); max-width: 18ch; padding-block: 0.04em; }
.tag { font-size: var(--text-sm); font-weight: 600; color: var(--accent-text); margin-bottom: var(--space-4); }
body[data-strategy="color-block"] .tag { color: inherit; }
.lede { font-size: var(--lede-size); line-height: 1.5; max-width: 52ch; margin-top: var(--space-5); color: var(--text-muted); }
body[data-strategy="color-block"] .lede { color: inherit; opacity: var(--hero-lede-alpha); }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3) var(--space-5); margin-top: var(--space-8); }
.actions .link { color: inherit; font-weight: 600; }
/* A link that stands alone is at least 24 pixels tall, the floor for a pointer target. */
.actions .link, .service .more, address .phone, .nav-actions .phone { display: inline-flex; align-items: center; min-height: 1.5rem; }
.actions .phone-big { display: none; font-size: var(--lede-size); color: inherit; }
body[data-strategy="color-block"] .hero .btn-primary { background: var(--hero-text); color: var(--hero-bg); border-color: var(--hero-text); box-shadow: none; }
.hero-media { display: none; }
.fact-list.hero-facts { display: none; }

body[data-display="ink-gradient"] .hero h1, body[data-display="accent-gradient"] .hero h1 { background: var(--display-fill); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }

body[data-hero="centered"] .hero-copy { text-align: center; margin-inline: auto; }
body[data-hero="centered"] .hero h1, body[data-hero="centered"] .lede { margin-inline: auto; }
body[data-hero="centered"] .hero h1 { max-width: 22ch; }
body[data-hero="centered"] .actions { justify-content: center; }
@media (min-width: 860px) {
  body[data-hero="split-media"] .hero-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
  body[data-hero="split-media"] .hero-media { display: grid; aspect-ratio: 4 / 5; max-height: 34rem; width: 100%; }
}
body[data-hero="statement"] .hero h1 { font-size: clamp(var(--h1-floor), calc(var(--text-display) * var(--display-scale) * 1.22), calc(13vw * var(--display-scale))); max-width: none; line-height: 1; }
body[data-hero="statement"] .hero-sub { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: var(--space-6) var(--space-10); margin-top: var(--space-10); padding-top: var(--space-6); border-top: var(--control-border-w) solid currentColor; }
body[data-hero="statement"] .lede { margin-top: 0; flex: 1 1 22rem; }
body[data-hero="statement"] .actions { margin-top: 0; flex: 0 1 auto; }

/* Emphasis: what the eye finds first */
body[data-emphasis="action"] .hero h1 { font-size: clamp(var(--h1-floor), calc(var(--text-3xl) * var(--display-scale)), calc(13vw * var(--display-scale))); max-width: 24ch; }
body[data-emphasis="action"] .hero .btn-primary { min-height: 3.5rem; padding-inline: var(--space-8); font-size: var(--lede-size); }
body[data-emphasis="action"] .actions .phone-big { display: inline-flex; }
body[data-emphasis="action"] .actions .link { display: none; }
body[data-emphasis="proof"] .fact-list.hero-facts { display: grid; }
body[data-emphasis="proof"] .facts { display: none; }
body[data-emphasis="proof"] .hero h1 { font-size: clamp(var(--h1-floor), calc(var(--text-3xl) * var(--display-scale)), calc(13vw * var(--display-scale))); }

/* Facts */
.fact-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--space-6) var(--space-8); margin: 0; }
.fact-list div { display: grid; gap: var(--space-1); }
.fact-list dt { font-family: var(--font-heading); font-weight: var(--heading-weight); font-size: var(--h2-size); line-height: 1.05; letter-spacing: var(--heading-tracking); font-variant-numeric: var(--numeric); white-space: nowrap; }
/* A short figure ("45 min") stays on one line. A long one may break, and is drawn one size smaller so that it fits its column. */
.fact-list dt.long { white-space: normal; font-size: var(--h3-size); line-height: 1.15; }
.fact-list dd { margin: 0; font-size: var(--text-sm); opacity: var(--soft-label-alpha); }
body[data-numerals="mono"] .fact-list dt, body[data-numerals="mono"] .phone, body[data-numerals="mono"] .num { font-family: var(--font-numeric); letter-spacing: -0.02em; }
.facts { background: var(--band-bg); color: var(--band-text); padding-block: var(--space-10); }
@media (min-width: 720px) { .facts .fact-list div + div { border-left: 1px solid color-mix(in oklch, currentColor 16%, transparent); padding-left: var(--space-8); } }
.fact-list.hero-facts { margin-top: var(--space-10); padding-top: var(--space-6); border-top: var(--border-w) solid var(--border); }

/* Sections */
section.block { padding-block: var(--section-gap); }
.section-head { display: grid; gap: var(--space-3); margin-bottom: var(--space-10); max-width: 46rem; }
.section-head h2, .about h2, .contact h2 { font-size: var(--h2-size); }
.section-head p { color: var(--text-muted); font-size: var(--lede-size); }
.service-list { list-style: none; margin: 0; padding: 0; display: grid; }
.service h3 { font-size: var(--h3-size); }
.service p { color: var(--text-muted); max-width: var(--measure); }
.service .more { font-weight: 600; font-size: var(--text-sm); }
.service .num { display: none; font-family: var(--font-heading); font-weight: var(--heading-weight); color: var(--accent-text); font-variant-numeric: tabular-nums; }
.service-media { display: none; }
/* The box and its one column may shrink below the width of their longest word, which then wraps: a long word in spaced capitals pushed the page 5 pixels wider than a 1024-pixel window (found 2026-11-14 on a new Direction). */
.service { min-width: 0; }
.service-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-3); align-content: start; min-width: 0; }
/* Light falls from above: a box that casts a shadow also catches a faint highlight along its top edge. */
.card, body[data-sections="grid"] .service, body[data-sections="bento"] .service { background-clip: padding-box; }
.card { background: var(--card-bg); border: var(--card-border-w) solid var(--card-border); border-radius: var(--radius-surface); box-shadow: var(--card-shadow); -webkit-backdrop-filter: var(--card-backdrop); backdrop-filter: var(--card-backdrop); }

body[data-sections="stacked"] .service { display: grid; gap: var(--space-4); padding-block: var(--space-8); border-top: var(--border-w) solid var(--border); }
body[data-sections="stacked"] .service:last-child { border-bottom: var(--border-w) solid var(--border); }
@media (min-width: 860px) {
  body[data-sections="stacked"] .service-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) minmax(0, 0.8fr); gap: var(--space-8); align-items: baseline; }
  body[data-sections="stacked"] .service .more { justify-self: end; text-align: right; }
}

body[data-sections="alternating"] .service-list { gap: var(--space-16); }
body[data-sections="alternating"] .service { display: grid; gap: var(--space-8); align-items: center; }
body[data-sections="alternating"] .service-media { display: grid; aspect-ratio: 16 / 10; }
@media (min-width: 860px) {
  body[data-sections="alternating"] .service { grid-template-columns: 1fr 1fr; gap: var(--space-16); }
  body[data-sections="alternating"] .service:nth-child(even) .service-media { order: 2; }
}

body[data-sections="grid"] .service-list { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-6); }
body[data-sections="grid"] .service, body[data-sections="bento"] .service { background: var(--card-bg); border: var(--card-border-w) solid var(--card-border); border-radius: var(--radius-surface); box-shadow: var(--card-shadow); -webkit-backdrop-filter: var(--card-backdrop); backdrop-filter: var(--card-backdrop); padding: var(--space-8); display: grid; gap: var(--space-4); align-content: start; }
@media (hover: hover) and (pointer: fine) { body[data-sections="grid"] .service:hover, body[data-sections="bento"] .service:hover { transform: translateY(var(--hover-lift)); } }

/* Bento: one large tile and smaller tiles beside it, so that size itself says which item matters most. */
body[data-sections="bento"] .service-list { gap: var(--space-5); }
body[data-sections="bento"] .service:first-child .service-media { display: grid; aspect-ratio: 16 / 9; }
body[data-sections="bento"] .service:first-child h3 { font-size: var(--h2-size); }
@media (min-width: 860px) {
  body[data-sections="bento"] .service-list { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
  body[data-sections="bento"] .service:first-child { grid-row: span 2; align-content: space-between; }
}

@media (min-width: 960px) {
  body[data-sections="ledger"] .services .wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: var(--space-16); align-items: start; }
  body[data-sections="ledger"] .section-head { position: sticky; top: var(--space-8); margin: 0; }
  body[data-sections="ledger"] .fees { grid-column: var(--fees-column); }
}
body[data-sections="ledger"] .service { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-6); padding-block: var(--space-6); border-top: var(--border-w) solid var(--border-strong); }
body[data-sections="ledger"] .service .num { display: block; font-size: var(--text-sm); padding-top: 0.35em; }

/* Fees: a short price list. A column of numbers is where number styles show. */
.fees { margin-top: var(--space-12); max-width: 34rem; }
.fees h3 { font-size: var(--lede-size); margin-bottom: var(--space-3); }
.fees table { width: 100%; border-collapse: collapse; }
.fees th, .fees td { padding-block: var(--space-3); border-top: var(--border-w) solid var(--border); font-weight: 400; text-align: left; }
.fees tr:last-child th, .fees tr:last-child td { border-bottom: var(--border-w) solid var(--border); }
.fees td { text-align: right; font-variant-numeric: var(--numeric); font-weight: 600; white-space: nowrap; }
body[data-numerals="mono"] .fees td { font-family: var(--font-numeric); letter-spacing: -0.02em; }

/* About */
.about { background: var(--surface-2); }
body[data-elevation="glass"] .about { background: transparent; }
.about-grid { display: grid; gap: var(--space-10); align-items: center; }
@media (min-width: 860px) { .about-grid { grid-template-columns: var(--about-columns); gap: var(--space-16); } }
.about p { color: var(--text-muted); font-size: var(--lede-size); margin-top: var(--space-4); max-width: var(--measure); }
.promise { margin: 0; padding: var(--space-8); }
.promise p { font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking); font-size: var(--h3-size); line-height: 1.25; color: var(--text); margin: 0; }
.promise span { display: block; margin-top: var(--space-4); font-size: var(--text-sm); color: var(--text-muted); }
body[data-elevation="flat"] .about .promise, body[data-elevation="tonal"] .about .promise { background: var(--surface); }

/* Contact */
.contact-grid { display: grid; gap: var(--space-10); align-items: start; }
@media (min-width: 860px) { .contact-grid { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: var(--space-16); } }
.contact p { color: var(--text-muted); margin-top: var(--space-4); max-width: 44ch; }
.contact address { font-style: normal; margin-top: var(--space-6); display: grid; gap: var(--space-1); font-variant-numeric: var(--numeric); }
.form { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-5); padding: var(--space-8); min-width: 0; }
/* A field never asks for more room than its column has: the column may shrink below the field's own width. */
.field { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2); min-width: 0; }
.field label { font-weight: 600; font-size: var(--text-sm); }
.field input, .field textarea {
  font: inherit; color: var(--text); background: var(--surface); width: 100%;
  min-height: var(--target-min); padding: var(--space-2) var(--space-3);
  border: var(--control-border-w) solid var(--border-strong); border-radius: var(--radius-control);
  box-shadow: inset 0 1px 2px var(--recess);
}
@media (hover: hover) and (pointer: fine) { .field input:hover, .field textarea:hover { border-color: var(--text-muted); } }
/* A focused field: the ring, plus a soft halo of the same color. */
.field input:focus-visible, .field textarea:focus-visible { outline-offset: 0; box-shadow: 0 0 0 4px color-mix(in oklch, var(--focus) 22%, transparent); }
.field textarea { min-height: 6.5rem; resize: vertical; border-radius: min(var(--radius-control), var(--radius-surface)); }
.hint { font-size: var(--text-xs); color: var(--text-muted); }
/* On a very narrow screen the button's words may wrap; a button that insists on one line made the whole form wider than the screen. */
.form .btn { justify-self: start; max-width: 100%; white-space: normal; }

/* Footer */
.site-footer { border-top: var(--border-w) solid var(--border); padding-block: var(--space-8); color: var(--text-muted); font-size: var(--text-sm); }
.site-footer .wrap { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-8); justify-content: space-between; }

/* Placeholder for a photograph: a quiet composition in the design's own colors (light from the upper left, a faint grid, a soft floor), so that the page reads as finished before real photographs arrive. */
.media {
  position: relative; place-items: end start; padding: var(--space-4); border-radius: var(--radius-surface); overflow: hidden;
  background:
    radial-gradient(120% 90% at 18% 12%, color-mix(in oklch, var(--surface) 70%, transparent), transparent 62%),
    radial-gradient(70% 60% at 86% 88%, color-mix(in oklch, var(--accent) 26%, transparent), transparent 70%),
    linear-gradient(to bottom, transparent 62%, color-mix(in oklch, var(--text) 7%, transparent)),
    linear-gradient(140deg, var(--media-a), var(--media-b));
  border: var(--card-border-w) solid var(--card-border); box-shadow: var(--card-shadow);
}
.media::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.5; background-image: linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px); background-size: 2.5rem 2.5rem; -webkit-mask-image: radial-gradient(90% 80% at 70% 30%, #000, transparent 75%); mask-image: radial-gradient(90% 80% at 70% 30%, #000, transparent 75%); }
.media::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px var(--border), inset 0 1px 0 var(--inset-highlight); pointer-events: none; }
.media span { position: relative; background: var(--surface); color: var(--text-muted); font-size: var(--text-xs); font-weight: 600; padding: var(--space-1) var(--space-3); border-radius: var(--radius-small); box-shadow: 0 0 0 1px var(--border), 0 1px 2px var(--recess); }

/* Signature elements: one memorable move */
body[data-signature="marker"] .hero mark { background: linear-gradient(transparent 56%, var(--marker) 56% 92%, transparent 92%); padding-inline: 0.08em; -webkit-text-fill-color: var(--hero-text); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
body[data-signature="big-numerals"] .service .num { display: block; font-size: var(--numeral-size); line-height: 1; letter-spacing: -0.03em; }
body[data-signature="big-numerals"][data-sections="ledger"] .service .num { font-size: var(--h2-size); padding-top: 0; }
body[data-signature="color-band"] .facts { background: var(--band-solid-bg); color: var(--band-solid-text); padding-block: var(--space-16); }
body[data-signature="color-band"] .facts .fact-list dt { font-size: var(--numeral-size); }
body[data-signature="color-band"][data-strategy="color-block"] .facts { background: var(--band-bg); color: var(--band-text); }
body[data-signature="outline-type"] .hero mark { color: var(--hero-bg); -webkit-text-fill-color: var(--hero-bg); -webkit-text-stroke: 0.055em var(--hero-text); paint-order: stroke fill; }
body[data-signature="corner-tag"] .tag { display: inline-block; background: var(--accent-2); color: var(--on-accent-2); padding: var(--space-1) var(--space-3); border-radius: var(--radius-small); transform: rotate(-2deg); transform-origin: left center; }

/* Expressive motion: one orchestrated entrance. The page is complete at rest, and still previews skip it. */
@media (prefers-reduced-motion: no-preference) {
  body[data-motion="expressive"]:not([data-still]) .hero-copy > *, body[data-motion="expressive"]:not([data-still]) .hero-media { animation: rise var(--dur-slow) var(--ease-out) both; }
  body[data-motion="expressive"]:not([data-still]) .hero-copy > :nth-child(2) { animation-delay: 70ms; }
  body[data-motion="expressive"]:not([data-still]) .hero-copy > :nth-child(3) { animation-delay: 140ms; }
  body[data-motion="expressive"]:not([data-still]) .hero-copy > :nth-child(4), body[data-motion="expressive"]:not([data-still]) .hero-media { animation-delay: 210ms; }
}
@keyframes rise { from { opacity: 0; transform: translateY(14px); } }

/* Preview regions: start the page at the section where the current change shows. */
body[data-focus]:not([data-focus="top"]) { display: block; min-height: 0; }
body[data-focus]:not([data-focus="top"]) .site-header, body[data-focus]:not([data-focus="top"]):not([data-focus="buttons"]) .hero { display: none; }
body[data-focus="services"] .facts, body[data-focus="fees"] .facts, body[data-focus="about"] .facts, body[data-focus="contact"] .facts { display: none; }
body[data-focus="about"] .services, body[data-focus="contact"] .services, body[data-focus="contact"] .about { display: none; }

/* Overlays: small helpers over the page. The region "overlays" shows each one that is switched on, open, as a picture with a
   caption. Everywhere else they stay out of the page, except the main button that stays in view on a phone, which plain CSS
   can show as it will behave. */
.overlay-demo { display: none; }
body[data-focus="overlays"] main > :not(.overlay-demo), body[data-focus="overlays"] .site-footer { display: none; }
body[data-focus="overlays"] .overlay-demo, body[data-overlays-shown] .overlay-demo { display: block; padding-block: var(--space-8); }
.overlay-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr)); gap: var(--space-8) var(--space-6); align-items: start; }
.ov { display: grid; gap: var(--space-3); min-width: 0; }
.ov-name { font-size: var(--text-sm); font-weight: 600; color: var(--text-muted); margin: 0; }
.ov-none { color: var(--text-muted); }
.ov-stage { position: relative; display: grid; gap: var(--space-3); padding: var(--space-5); border-radius: var(--radius-surface); background: var(--surface-2); min-width: 0; }
.ov-term { text-decoration: underline dotted; text-underline-offset: 0.2em; }
.ov-tip { display: block; width: fit-content; max-width: 100%; padding: var(--space-2) var(--space-3); border-radius: var(--radius-small); background: var(--text); color: var(--surface); font-size: var(--text-sm); }
.ov-dialog { padding: var(--space-5); display: grid; gap: var(--space-3); }
.ov-dialog h3 { font-size: var(--h3-size); margin: 0; }
.ov-dialog p { margin: 0; color: var(--text-muted); }
.ov-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
.ov-quiet { background: transparent; color: var(--text); border-color: var(--border-strong); }
.ov-toast { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
.ov-error input { border-width: calc(var(--control-border-w) + 1px); border-color: var(--text); }
.ov-error .ov-message { display: flex; gap: var(--space-2); align-items: baseline; font-size: var(--text-sm); font-weight: 600; color: var(--text); margin: 0; }
.ov-error .ov-mark { display: inline-grid; place-items: center; width: 1.25em; height: 1.25em; border-radius: 50%; background: var(--text); color: var(--surface); font-size: 0.85em; flex: none; }
.ov-skeleton { display: grid; gap: var(--space-3); padding: var(--space-5); }
.ov-skeleton span { display: block; height: 0.9em; border-radius: var(--radius-small); background: var(--border); }
.ov-skeleton span:first-child { height: 5rem; }
.ov-skeleton span:nth-child(3) { width: 80%; }
.ov-skeleton span:last-child { width: 55%; }
.ov-phone { display: grid; gap: 0; border: var(--border-w) solid var(--border); border-radius: var(--radius-surface); overflow: hidden; background: var(--surface); }
.ov-phone p { margin: 0; padding: var(--space-4); color: var(--text-muted); font-size: var(--text-sm); }
.ov-bar, .sticky-call { display: grid; padding: var(--space-3) var(--space-4); background: var(--surface); border-top: var(--border-w) solid var(--border); }
.ov-bar .btn, .sticky-call .btn { width: 100%; justify-content: center; }
.sticky-call { display: none; }
@media (max-width: 599px) {
  body[data-overlays~="sticky-call"]:not([data-focus="overlays"]):not([data-focus="buttons"]):not([data-focus="box"]) .sticky-call { display: grid; position: sticky; bottom: 0; z-index: 3; }
}

/* Close-ups, for the small pictures on a card. A whole region shrunk to card size left the changed part out of the picture
   or made it too small to see: four cards for the button's look were the same picture, without a button in it (finding U2-08,
   measured 2026-11-14). A close-up shows one part and nothing else.
   "buttons": the line above the headline, the main button, and the link beside it, on the first screen's background. */
body[data-focus="buttons"] main > :not(.hero), body[data-focus="buttons"] .site-footer, body[data-focus="buttons"] .hero-media,
body[data-focus="buttons"] .hero h1, body[data-focus="buttons"] .hero .lede, body[data-focus="buttons"] .hero-facts { display: none; }
body[data-focus="buttons"] .hero { min-height: 100vh; padding-block: var(--space-5); display: grid; align-content: center; }
body[data-focus="buttons"] .hero-grid, body[data-focus="buttons"] .hero-copy, body[data-focus="buttons"] .hero-sub { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); border: 0; margin: 0; max-width: none; text-align: left; justify-items: start; }
body[data-focus="buttons"] .hero-copy, body[data-focus="buttons"] .hero-sub { padding: 0; }
body[data-focus="buttons"] .hero .actions { justify-content: flex-start; align-items: center; }
body[data-focus="buttons"] .hero .actions .btn { flex: 0 0 auto; width: auto; }
/* "box": the one box of the "about" part. */
body[data-focus="box"] main > :not(.about), body[data-focus="box"] .site-footer, body[data-focus="box"] .about-grid > :first-child { display: none; }
body[data-focus="box"] .about { padding-block: var(--space-5); margin: 0; }
body[data-focus="box"] .about-grid { display: block; }
body[data-focus="fees"] .services .section-head, body[data-focus="fees"] .services .service-list { display: none; }
body[data-focus="fees"] .fees { margin-top: 0; }

/* In a narrow preview of one region, the part that carries the change comes first. */
@media (max-width: 859px) {
  body[data-focus="contact"] .contact-grid > :first-child, body[data-focus="about"] .about-grid > :first-child { order: 2; }
}
@media (max-width: 599px) {
  .wrap { padding-inline: var(--space-5); }
  .actions .btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
`;

/**
 * The picture of each Overlay, open. Every word in a picture is fixed text of the Mockup, except the main button's label,
 * which arrives escaped. A picture is plain HTML: nothing in it opens, closes, or moves.
 */
/**
 * The name above each picture. The Catalog holds the same names (`catalog/overlays.ts`); the Catalog cannot be read from
 * here without a circular import, so the names stand here a second time, and a unit test holds the two lists equal.
 */
const OVERLAY_NAMES: Record<(typeof MOCKUP_OVERLAYS)[number], string> = {
  tooltip: 'Tooltip',
  confirm: '“Are you sure?” question',
  notice: 'Notice after an action',
  'field-error': 'Error message beside a field',
  loading: 'Loading placeholder',
  'sticky-call': 'Main button that stays in view on a phone',
};

const OVERLAY_PICTURES: Record<(typeof MOCKUP_OVERLAYS)[number], (action: string) => string> = {
  tooltip: () => '<p>We accept most <span class="ov-term" aria-describedby="ov-tip">dental plans</span>.</p><span class="ov-tip" id="ov-tip" role="tooltip">A plan pays part of the cost of a visit. Bring your card; we check it for you.</span>',
  confirm: () => '<div class="card ov-dialog" role="group" aria-label="A question before an action that cannot be taken back"><h3>Cancel your visit on Tuesday?</h3><p>We give the time to another patient. You cannot take this back.</p><div class="ov-actions"><span class="btn btn-primary">Cancel the visit</span><span class="btn ov-quiet">Keep the visit</span></div></div>',
  notice: () => '<div class="card ov-toast" role="status"><span>Your request was sent. We call you back today.</span><span class="btn ov-quiet">Close</span></div>',
  'field-error': () => '<div class="field ov-error"><label for="ov-phone">Phone number</label><input id="ov-phone" type="text" value="555-01" readonly aria-invalid="true" aria-describedby="ov-phone-error"><p class="ov-message" id="ov-phone-error"><span class="ov-mark" aria-hidden="true">!</span><span>This number is too short. Enter all ten digits, for example 555 010 0199.</span></p></div>',
  loading: () => '<div class="card ov-skeleton" role="img" aria-label="Gray shapes stand in for a picture and three lines of text while they load"><span></span><span></span><span></span><span></span></div>',
  'sticky-call': (action) => `<div class="ov-phone" role="img" aria-label="A phone screen: the page scrolls, and the main button stays at the lower edge"><p>The page scrolls here.</p><p>The button below stays where it is.</p><div class="ov-bar"><span class="btn btn-primary">${action}</span></div></div>`,
};

/** Render the Mockup as one complete HTML document. Throws if a parameter, a token, or the font CSS could break out of its place in the document. */
export function renderSmallBusiness(input: MockupInput): string {
  const { params: p, tokens, content: c, fontFaceCss = '' } = input;
  // Every parameter is checked against its list before any of them is written into markup.
  assertKnownParams(p);
  if (input.focus !== undefined && !MOCKUP_FOCUSES.includes(input.focus)) throw new Error('The preview region is not in its list.');
  if (fontFaceCss.includes('<')) throw new Error('The font rules contain a character that is not allowed in a stylesheet.');
  // Only an identifier from the fixed list reaches the markup, in the list's order, each once.
  const asked = input.overlays ?? [];
  if (asked.some((id) => !(MOCKUP_OVERLAYS as readonly string[]).includes(id))) throw new Error('An Overlay is not in its list.');
  const overlays = MOCKUP_OVERLAYS.filter((id) => asked.includes(id));
  const e = escapeHtml;
  const inert = input.links === 'inert';
  /** The attributes of a link. An inert link keeps the look and the keyboard focus of a link and leads nowhere. */
  const link = (target: string): string => (inert ? 'role="link" tabindex="0"' : `href="${e(target)}"`);
  // The facts band moves into the first screen when facts are the emphasis, so that region opens at the top instead.
  const focus: MockupFocus = input.focus === 'facts' && p.emphasis === 'proof' ? 'top' : (input.focus ?? 'top');
  const attrs = [
    `data-nav="${e(p.nav)}"`,
    `data-hero="${e(p.hero)}"`,
    `data-sections="${e(p.sections)}"`,
    `data-emphasis="${e(p.emphasis)}"`,
    `data-elevation="${e(p.elevation)}"`,
    `data-signature="${e(p.signature)}"`,
    `data-strategy="${e(p.colorStrategy)}"`,
    `data-numerals="${e(p.numerals)}"`,
    `data-theme="${e(p.theme)}"`,
    `data-atmosphere="${e(p.atmosphere)}"`,
    `data-button="${e(p.buttonFinish)}"`,
    `data-display="${e(p.displayTreatment)}"`,
    `data-motion="${e(p.motion)}"`,
    `data-focus="${e(focus)}"`,
    ...(overlays.length > 0 ? [`data-overlays="${overlays.join(' ')}"`] : []),
    ...(input.still ? ['data-still'] : []),
    ...(input.overlaysShown && overlays.length > 0 ? ['data-overlays-shown'] : []),
  ].join(' ');

  const overlayDemo = overlays.length === 0
    ? '<p class="ov-none">No Overlay is switched on.</p>'
    : overlays.map((id) => `<div class="ov"><p class="ov-name">${OVERLAY_NAMES[id]}</p><div class="ov-stage">${OVERLAY_PICTURES[id](e(c.primaryAction))}</div></div>`).join('');
  // The owner's texts (the Brief) may leave a text or a whole list empty. An empty text leaves no element behind, and an
  // item of a list is drawn only once it holds words, so that no empty box, heading, or gap stays on the page.
  const part = (text: string, html: (escaped: string) => string): string => (text === '' ? '' : html(e(text)));
  const facts = c.facts.filter((f) => f.value !== '' || f.label !== '').map((f) => `<div>${part(f.value, (t) => `<dt${f.value.length > 8 ? ' class="long"' : ''}>${t}</dt>`)}${part(f.label, (t) => `<dd>${t}</dd>`)}</div>`).join('');
  const services = c.services
    .filter((s) => s.title !== '' || s.body !== '')
    .map(
      (s, i) => `<li class="service">
        <div class="service-media media" role="img" aria-label="Photo placeholder"><span>Your photo</span></div>
        <span class="num" aria-hidden="true">${pad2(i + 1)}</span>
        <div class="service-body">${part(s.title, (t) => `<h3>${t}</h3>`)}${part(s.body, (t) => `<p>${t}</p>`)}${s.title === '' ? '' : `<a class="more" ${link('#contact')}>About ${e(s.title.toLowerCase())}</a>`}</div>
      </li>`,
    )
    .join('');
  const fees = c.fees.filter((f) => f.item !== '' || f.price !== '').map((f) => `<tr><th scope="row">${e(f.item)}</th><td>${e(f.price)}</td></tr>`).join('');
  const phone = (cls: string, words = ''): string => part(c.phone, (t) => `<a class="${cls}" ${link('#contact')}>${words}${t}</a>`);
  const nav = c.nav.map((n, i) => `<li><a ${link('#main')}${i === 0 ? ' aria-current="page"' : ''}>${e(n)}</a></li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1">
${input.fingerprint && /^[0-9a-f]{8}$/.test(input.fingerprint) ? `<meta name="refraction-fingerprint" content="${input.fingerprint}">\n` : ''}<meta name="color-scheme" content="${e(p.theme)}">
<title>${e(c.business)}</title>
<style>
${fontFaceCss}
${tokensToCss(tokens)}
${SMALL_BUSINESS_CSS}
</style>
</head>
<body ${attrs}>
<a class="skip" ${link('#main')}>Skip to content</a>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" ${link('#main')}>${e(c.business)}</a>
    <nav aria-label="Main"><ul>${nav}</ul></nav>
    <div class="nav-actions">${phone('phone')}<a class="btn btn-primary" ${link('#contact')}>${e(c.primaryAction)}</a></div>
  </div>
</header>
<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        ${part(c.tag, (t) => `<p class="tag">${t}</p>`)}
        <h1>${headlineHtml(c)}</h1>
        <div class="hero-sub">
          ${part(c.lede, (t) => `<p class="lede">${t}</p>`)}
          <div class="actions">
            <a class="btn btn-primary" ${link('#contact')}>${e(c.primaryAction)}</a>
            ${phone('phone phone-big', 'Call ')}
            ${part(c.secondaryAction, (t) => `<a class="link" ${link('#services')}>${t}</a>`)}
          </div>
        </div>
        ${facts === '' ? '' : `<dl class="fact-list hero-facts">${facts}</dl>`}
      </div>
      <div class="hero-media media" role="img" aria-label="Photo placeholder"><span>Your photo</span></div>
    </div>
  </section>
  ${facts === '' ? '' : `<section class="facts" aria-label="At a glance"><div class="wrap"><dl class="fact-list">${facts}</dl></div></section>`}
  <section class="block services" id="services">
    <div class="wrap">
      ${c.servicesTitle === '' && c.servicesIntro === '' ? '' : `<div class="section-head">${part(c.servicesTitle, (t) => `<h2>${t}</h2>`)}${part(c.servicesIntro, (t) => `<p>${t}</p>`)}</div>`}
      ${services === '' ? '' : `<ol class="service-list">${services}</ol>`}
      ${fees === '' ? '' : `<div class="fees">${part(c.feesTitle, (t) => `<h3>${t}</h3>`)}<table><tbody>${fees}</tbody></table></div>`}
    </div>
  </section>
  ${c.aboutTitle === '' && c.aboutBody === '' && c.promise === '' ? '' : `<section class="block about">
    <div class="wrap about-grid">
      ${c.aboutTitle === '' && c.aboutBody === '' ? '' : `<div>${part(c.aboutTitle, (t) => `<h2>${t}</h2>`)}${part(c.aboutBody, (t) => `<p>${t}</p>`)}</div>`}
      ${part(c.promise, (t) => `<figure class="promise card"><p>${t}</p><span>${e(c.business)}</span></figure>`)}
    </div>
  </section>`}
  <section class="block contact" id="contact">
    <div class="wrap contact-grid">
      <div>
        ${part(c.contactTitle, (t) => `<h2>${t}</h2>`)}
        ${part(c.contactBody, (t) => `<p>${t}</p>`)}
        <address><strong>${e(c.business)}</strong>${part(c.address, (t) => `<span>${t}</span>`)}${part(c.hours, (t) => `<span>${t}</span>`)}${phone('phone')}</address>
      </div>
      <form class="form card"${inert ? '' : ' action="#contact" method="post"'}>
        <div class="field"><label for="m-name">Your name</label><input id="m-name" name="name" type="text" autocomplete="name"></div>
        <div class="field"><label for="m-phone">Phone number</label><input id="m-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="m-phone-hint"><span class="hint" id="m-phone-hint">We call on working days between 8 and 5.</span></div>
        <div class="field"><label for="m-note">What do you need?</label><textarea id="m-note" name="note"></textarea></div>
        <button class="btn btn-primary" type="${inert ? 'button' : 'submit'}">Send my request</button>
      </form>
    </div>
  </section>
  <section class="block overlay-demo" aria-label="Overlays, each shown open"><div class="wrap overlay-grid">${overlayDemo}</div></section>
</main>
<div class="sticky-call"><a class="btn btn-primary" ${link('#contact')}>${e(c.primaryAction)}</a></div>
<footer class="site-footer"><div class="wrap"><span>${e(c.business)}${part(c.address, (t) => ` · ${t}`)}</span>${part(c.footerNote, (t) => `<span>${t}</span>`)}</div></footer>
</body>
</html>`;
}
