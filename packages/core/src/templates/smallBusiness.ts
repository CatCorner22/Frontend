// Template 1: small-business website (home page with services, facts, about, and a contact form).
// The Mockup is plain semantic HTML and CSS. It contains no script. Every visual value comes from a token.

import type { DesignParams } from '../params.js';
import { tokensToCss } from '../tokens.js';

export interface ServiceItem {
  title: string;
  body: string;
}

export interface FactItem {
  value: string;
  label: string;
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
  aboutTitle: string;
  aboutBody: string;
  promise: string;
  contactTitle: string;
  contactBody: string;
  address: string;
  hours: string;
  footerNote: string;
}

/** Sample content. The Studio labels it as a sample; the owner replaces it in the Brief Stage. */
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
  aboutTitle: 'A small practice, on purpose',
  aboutBody: 'Two dentists and one hygienist. You see the same people each time, and they remember what you told them last time.',
  promise: 'No work starts until you have seen the price and said yes.',
  contactTitle: 'Ask for an appointment',
  contactBody: 'Tell us how to reach you and what you need. We reply on the next working day.',
  address: '41 Harbor Street, Suite 2',
  hours: 'Monday to Saturday, 8 to 5',
  footerNote: 'Sample content for design preview.',
};

export type MockupStage = 'structure' | 'feel';

export interface MockupInput {
  params: DesignParams;
  /** Derived CSS custom properties. */
  tokens: Record<string, string>;
  content: SiteContent;
  stage: MockupStage;
  /** `@font-face` rules for the fonts in use. The Studio supplies these; exports reference font files instead. */
  fontFaceCss?: string;
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

export const SMALL_BUSINESS_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: var(--text-base); line-height: var(--leading-body);
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
h1, h2, h3 {
  font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking);
  text-transform: var(--heading-transform); line-height: var(--leading-heading); margin: 0; text-wrap: balance;
}
p { margin: 0; text-wrap: pretty; }
a { color: var(--accent-text); text-underline-offset: 0.18em; text-decoration-thickness: 0.08em; }
.wrap { width: 100%; max-width: var(--page-max); margin-inline: auto; padding-inline: var(--space-6); }
.skip { position: absolute; left: var(--space-4); top: -100px; background: var(--surface); color: var(--text); padding: var(--space-2) var(--space-4); border-radius: var(--radius-small); z-index: 10; }
.skip:focus { top: var(--space-4); }
:focus-visible { outline: var(--focus-w) solid var(--focus); outline-offset: 2px; }
mark { background: none; color: inherit; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--target-min); padding: 0 var(--space-5);
  border: var(--control-border-w) solid transparent; border-radius: var(--radius-control);
  font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; box-shadow: var(--control-shadow);
}
.btn-primary { background: var(--action); color: var(--on-action); border-color: var(--action); }
.btn-secondary { background: transparent; color: var(--text); border-color: var(--border-strong); box-shadow: none; }
@media (hover: hover) {
  .btn-primary:hover { background: var(--action-hover); border-color: var(--action-hover); }
  .btn-secondary:hover { border-color: var(--text); }
}
.btn:active { transform: scale(0.97); }
body[data-elevation="hard-shadow"] .btn { border-color: var(--text); }
body[data-elevation="hard-shadow"] .btn:active { transform: translate(2px, 2px); box-shadow: none; }

/* Header and navigation */
.site-header { border-bottom: var(--border-w) solid var(--border); background: var(--bg); }
.nav { display: flex; align-items: center; gap: var(--space-6); min-height: calc(var(--target-min) + var(--space-6)); flex-wrap: wrap; padding-block: var(--space-2); }
.brand { font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking); font-size: var(--text-lg); color: var(--text); text-decoration: none; margin-right: auto; }
.nav ul { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-5); list-style: none; margin: 0; padding: 0; }
.nav li a { display: inline-flex; align-items: center; min-height: var(--target-min); color: var(--text); text-decoration: none; font-size: var(--text-sm); font-weight: 500; }
@media (hover: hover) { .nav li a:hover { text-decoration: underline; } }
.nav-actions { display: none; align-items: center; gap: var(--space-4); }
.phone { color: var(--text); font-weight: 600; text-decoration: none; font-variant-numeric: tabular-nums; white-space: nowrap; }

body[data-nav="top-centered"] .nav { flex-direction: column; gap: var(--space-1); padding-block: var(--space-5) var(--space-2); }
body[data-nav="top-centered"] .brand { margin: 0; font-size: var(--text-xl); }
body[data-nav="top-centered"] .nav ul { justify-content: center; }
body[data-nav="split-cta"] .nav-actions { display: flex; }
body[data-nav="split-cta"] .brand { margin-right: 0; }
body[data-nav="split-cta"] .nav nav { margin-inline: auto; }
@media (max-width: 719px) {
  body[data-nav="split-cta"] .nav nav { order: 3; width: 100%; margin: 0; }
  body[data-nav="split-cta"] .brand { margin-right: auto; }
  body[data-nav="split-cta"] .phone { display: none; }
}
@media (min-width: 960px) {
  body[data-nav="side-rail"] { display: grid; grid-template-columns: 15rem minmax(0, 1fr); grid-template-rows: 1fr auto; min-height: 100vh; }
  body[data-nav="side-rail"] .site-header { grid-row: 1 / span 2; border-bottom: 0; border-right: var(--border-w) solid var(--border); background: var(--surface-2); }
  body[data-nav="side-rail"] .site-header .nav { flex-direction: column; align-items: flex-start; position: sticky; top: 0; padding: var(--space-8) var(--space-6); gap: var(--space-8); max-width: none; }
  body[data-nav="side-rail"] .nav ul { flex-direction: column; gap: 0; }
  body[data-nav="side-rail"] .brand { margin: 0; }
  body[data-nav="side-rail"] .nav-actions { display: flex; flex-direction: column; align-items: flex-start; }
}

/* Hero */
.hero { background: var(--hero-bg); color: var(--hero-text); padding-block: calc(var(--section-gap) * 0.85); }
.hero-grid { display: grid; gap: var(--space-10); align-items: center; }
.hero h1 { font-size: var(--text-display); max-width: 18ch; }
.tag { font-size: var(--text-sm); font-weight: 600; color: var(--accent-text); margin-bottom: var(--space-4); }
body[data-strategy="color-block"] .tag { color: inherit; }
.lede { font-size: var(--text-lg); line-height: 1.5; max-width: 52ch; margin-top: var(--space-5); color: var(--text-muted); }
body[data-strategy="color-block"] .lede { color: inherit; opacity: 0.88; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3) var(--space-5); margin-top: var(--space-8); }
.actions .link { color: inherit; font-weight: 600; }
.actions .phone-big { display: none; font-size: var(--text-lg); }
body[data-strategy="color-block"] .hero .btn-primary { background: var(--hero-text); color: var(--hero-bg); border-color: var(--hero-text); }
.hero-media { display: none; }
.fact-list.hero-facts { display: none; }

body[data-hero="centered"] .hero-copy { text-align: center; margin-inline: auto; }
body[data-hero="centered"] .hero h1, body[data-hero="centered"] .lede { margin-inline: auto; }
body[data-hero="centered"] .hero h1 { max-width: 22ch; }
body[data-hero="centered"] .actions { justify-content: center; }
@media (min-width: 860px) {
  body[data-hero="split-media"] .hero-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
  body[data-hero="split-media"] .hero-media { display: grid; aspect-ratio: 4 / 5; max-height: 34rem; width: 100%; }
}
body[data-hero="statement"] .hero h1 { font-size: calc(var(--text-display) * 1.22); max-width: none; line-height: 1; }
body[data-hero="statement"] .hero-sub { display: grid; gap: var(--space-6); margin-top: var(--space-10); padding-top: var(--space-6); border-top: var(--control-border-w) solid currentColor; }
body[data-hero="statement"] .lede, body[data-hero="statement"] .actions { margin-top: 0; }
@media (min-width: 860px) { body[data-hero="statement"] .hero-sub { grid-template-columns: 1fr auto; align-items: end; } }

/* Emphasis: what the eye finds first */
body[data-emphasis="action"] .hero h1 { font-size: var(--text-3xl); max-width: 24ch; }
body[data-emphasis="action"] .hero .btn-primary { min-height: 3.5rem; padding-inline: var(--space-8); font-size: var(--text-lg); }
body[data-emphasis="action"] .actions .phone-big { display: inline-flex; }
body[data-emphasis="action"] .actions .link { display: none; }
body[data-emphasis="proof"] .fact-list.hero-facts { display: grid; }
body[data-emphasis="proof"] .facts { display: none; }
body[data-emphasis="proof"] .hero h1 { font-size: var(--text-3xl); }

/* Facts */
.fact-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: var(--space-6); margin: 0; }
.fact-list div { display: grid; gap: var(--space-1); }
.fact-list dt { font-family: var(--font-heading); font-weight: var(--heading-weight); font-size: var(--text-2xl); line-height: 1.05; letter-spacing: var(--heading-tracking); font-variant-numeric: var(--numeric); }
.fact-list dd { margin: 0; font-size: var(--text-sm); opacity: 0.8; }
body[data-numerals="mono"] .fact-list dt, body[data-numerals="mono"] .phone, body[data-numerals="mono"] .num { font-family: var(--font-numeric); letter-spacing: -0.02em; }
.facts { background: var(--band-bg); color: var(--band-text); padding-block: var(--space-10); }
.hero-facts { margin-top: var(--space-10); padding-top: var(--space-6); border-top: var(--control-border-w) solid var(--border-strong); }

/* Sections */
section.block { padding-block: var(--section-gap); }
.section-head { display: grid; gap: var(--space-3); margin-bottom: var(--space-10); max-width: 46rem; }
.section-head h2, .about h2, .contact h2 { font-size: var(--text-2xl); }
.section-head p { color: var(--text-muted); font-size: var(--text-lg); }
.service-list { list-style: none; margin: 0; padding: 0; display: grid; }
.service h3 { font-size: var(--text-xl); }
.service p { color: var(--text-muted); max-width: var(--measure); }
.service .more { font-weight: 600; font-size: var(--text-sm); }
.service .num { display: none; font-family: var(--font-heading); font-weight: var(--heading-weight); color: var(--accent-text); font-variant-numeric: tabular-nums; }
.service-media { display: none; }
.service-body { display: grid; gap: var(--space-3); align-content: start; }

body[data-sections="stacked"] .service { display: grid; gap: var(--space-4); padding-block: var(--space-8); border-top: var(--control-border-w) solid var(--border); }
body[data-sections="stacked"] .service:last-child { border-bottom: var(--control-border-w) solid var(--border); }
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
body[data-sections="grid"] .service { background: var(--card-bg); border: var(--card-border-w) solid var(--card-border); border-radius: var(--radius-surface); box-shadow: var(--card-shadow); padding: var(--space-8); display: grid; gap: var(--space-4); align-content: start; }

@media (min-width: 960px) {
  body[data-sections="ledger"] .services .wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: var(--space-16); align-items: start; }
  body[data-sections="ledger"] .section-head { position: sticky; top: var(--space-8); margin: 0; }
}
body[data-sections="ledger"] .service { display: grid; grid-template-columns: auto 1fr; gap: var(--space-2) var(--space-6); padding-block: var(--space-6); border-top: var(--control-border-w) solid var(--border-strong); }
body[data-sections="ledger"] .service .num { display: block; font-size: var(--text-sm); padding-top: 0.35em; }

/* About */
.about { background: var(--surface-2); }
.about-grid { display: grid; gap: var(--space-10); align-items: center; }
@media (min-width: 860px) { .about-grid { grid-template-columns: 1.1fr 0.9fr; gap: var(--space-16); } }
.about p { color: var(--text-muted); font-size: var(--text-lg); margin-top: var(--space-4); max-width: var(--measure); }
.promise { margin: 0; padding: var(--space-8); background: var(--card-bg); border: var(--card-border-w) solid var(--card-border); border-radius: var(--radius-surface); box-shadow: var(--card-shadow); }
.promise p { font-family: var(--font-heading); font-weight: var(--heading-weight); letter-spacing: var(--heading-tracking); font-size: var(--text-xl); line-height: 1.25; color: var(--text); margin: 0; }
.promise span { display: block; margin-top: var(--space-4); font-size: var(--text-sm); color: var(--text-muted); }
body[data-elevation="flat"] .about .promise, body[data-elevation="tonal"] .about .promise { background: var(--surface); }

/* Contact */
.contact-grid { display: grid; gap: var(--space-10); align-items: start; }
@media (min-width: 860px) { .contact-grid { grid-template-columns: 0.9fr 1.1fr; gap: var(--space-16); } }
.contact p { color: var(--text-muted); margin-top: var(--space-4); max-width: 44ch; }
.contact address { font-style: normal; margin-top: var(--space-6); display: grid; gap: var(--space-1); font-variant-numeric: var(--numeric); }
.form { display: grid; gap: var(--space-5); padding: var(--space-8); background: var(--card-bg); border: var(--card-border-w) solid var(--card-border); border-radius: var(--radius-surface); box-shadow: var(--card-shadow); }
.field { display: grid; gap: var(--space-2); }
.field label { font-weight: 600; font-size: var(--text-sm); }
.field input, .field textarea {
  font: inherit; color: var(--text); background: var(--surface); width: 100%;
  min-height: var(--target-min); padding: var(--space-2) var(--space-3);
  border: var(--control-border-w) solid var(--border-strong); border-radius: var(--radius-control);
}
.field textarea { min-height: 6.5rem; resize: vertical; border-radius: min(var(--radius-control), var(--radius-surface)); }
.hint { font-size: var(--text-xs); color: var(--text-muted); }
.form .btn { justify-self: start; }

/* Footer */
.site-footer { border-top: var(--border-w) solid var(--border); padding-block: var(--space-8); color: var(--text-muted); font-size: var(--text-sm); }
.site-footer .wrap { display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-8); justify-content: space-between; }

/* Placeholder for a photograph */
.media {
  place-items: center; border-radius: var(--radius-surface); color: var(--text-muted); font-size: var(--text-sm);
  background: repeating-linear-gradient(135deg, transparent 0 14px, var(--border) 14px 15px), var(--accent-soft);
  border: var(--card-border-w) solid var(--card-border); box-shadow: var(--card-shadow);
}
.media span { background: var(--surface); color: var(--text-muted); padding: var(--space-1) var(--space-3); border-radius: var(--radius-small); }

/* Signature elements: one memorable move */
body[data-signature="marker"] .hero mark { background: linear-gradient(transparent 58%, var(--accent-soft) 58% 92%, transparent 92%); padding-inline: 0.08em; }
body[data-signature="marker"][data-strategy="duo"] .hero mark, body[data-signature="marker"][data-strategy="color-block"] .hero mark { background: linear-gradient(transparent 58%, var(--accent-2) 58% 92%, transparent 92%); }
body[data-signature="big-numerals"] .service .num { display: block; font-size: var(--text-3xl); line-height: 1; letter-spacing: -0.03em; }
body[data-signature="big-numerals"][data-sections="ledger"] .service .num { font-size: var(--text-2xl); padding-top: 0; }
body[data-signature="color-band"] .facts { background: var(--accent); color: var(--on-accent); padding-block: var(--space-16); }
body[data-signature="color-band"] .facts .fact-list dt { font-size: var(--text-3xl); }
body[data-signature="color-band"][data-strategy="color-block"] .facts { background: var(--band-bg); color: var(--band-text); }
body[data-signature="outline-type"] .hero mark { color: var(--hero-bg); -webkit-text-stroke: 0.055em var(--hero-text); paint-order: stroke fill; }
body[data-signature="corner-tag"] .tag { display: inline-block; background: var(--accent-2); color: var(--on-accent-2); padding: var(--space-1) var(--space-3); border-radius: var(--radius-small); transform: rotate(-2deg); transform-origin: left center; }

@media (max-width: 599px) {
  .wrap { padding-inline: var(--space-5); }
  .actions .btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

/** Render the Mockup as one complete HTML document. */
export function renderSmallBusiness(input: MockupInput): string {
  const { params: p, tokens, content: c, stage, fontFaceCss = '' } = input;
  const e = escapeHtml;
  const attrs = [
    `data-nav="${p.nav}"`,
    `data-hero="${p.hero}"`,
    `data-sections="${p.sections}"`,
    `data-emphasis="${p.emphasis}"`,
    `data-elevation="${p.elevation}"`,
    `data-signature="${p.signature}"`,
    `data-strategy="${p.colorStrategy}"`,
    `data-numerals="${p.numerals}"`,
    `data-theme="${p.theme}"`,
    `data-stage="${stage}"`,
  ].join(' ');

  const facts = c.facts.map((f) => `<div><dt>${e(f.value)}</dt><dd>${e(f.label)}</dd></div>`).join('');
  const services = c.services
    .map(
      (s, i) => `<li class="service">
        <div class="service-media media" role="img" aria-label="Photo placeholder"><span>Photo</span></div>
        <span class="num" aria-hidden="true">${pad2(i + 1)}</span>
        <div class="service-body"><h3>${e(s.title)}</h3><p>${e(s.body)}</p><a class="more" href="#">About ${e(s.title.toLowerCase())}</a></div>
      </li>`,
    )
    .join('');
  const nav = c.nav.map((n, i) => `<li><a href="#"${i === 0 ? ' aria-current="page"' : ''}>${e(n)}</a></li>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="${p.theme}">
<title>${e(c.business)}</title>
<style>
${fontFaceCss}
${tokensToCss(tokens)}
${SMALL_BUSINESS_CSS}
</style>
</head>
<body ${attrs}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="#">${e(c.business)}</a>
    <nav aria-label="Main"><ul>${nav}</ul></nav>
    <div class="nav-actions"><a class="phone" href="#">${e(c.phone)}</a><a class="btn btn-primary" href="#contact">${e(c.primaryAction)}</a></div>
  </div>
</header>
<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="tag">${e(c.tag)}</p>
        <h1>${headlineHtml(c)}</h1>
        <div class="hero-sub">
          <p class="lede">${e(c.lede)}</p>
          <div class="actions">
            <a class="btn btn-primary" href="#contact">${e(c.primaryAction)}</a>
            <a class="phone phone-big" href="#">Call ${e(c.phone)}</a>
            <a class="link" href="#">${e(c.secondaryAction)}</a>
          </div>
        </div>
        <dl class="fact-list hero-facts">${facts}</dl>
      </div>
      <div class="hero-media media" role="img" aria-label="Photo placeholder"><span>Photo</span></div>
    </div>
  </section>
  <section class="facts" aria-label="At a glance"><div class="wrap"><dl class="fact-list">${facts}</dl></div></section>
  <section class="block services">
    <div class="wrap">
      <div class="section-head"><h2>${e(c.servicesTitle)}</h2><p>${e(c.servicesIntro)}</p></div>
      <ol class="service-list">${services}</ol>
    </div>
  </section>
  <section class="block about">
    <div class="wrap about-grid">
      <div><h2>${e(c.aboutTitle)}</h2><p>${e(c.aboutBody)}</p></div>
      <figure class="promise"><p>${e(c.promise)}</p><span>${e(c.business)}</span></figure>
    </div>
  </section>
  <section class="block contact" id="contact">
    <div class="wrap contact-grid">
      <div>
        <h2>${e(c.contactTitle)}</h2>
        <p>${e(c.contactBody)}</p>
        <address><strong>${e(c.business)}</strong><span>${e(c.address)}</span><span>${e(c.hours)}</span><a class="phone" href="#">${e(c.phone)}</a></address>
      </div>
      <form class="form" action="#" method="post">
        <div class="field"><label for="m-name">Your name</label><input id="m-name" name="name" type="text" autocomplete="name"></div>
        <div class="field"><label for="m-phone">Phone number</label><input id="m-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" aria-describedby="m-phone-hint"><span class="hint" id="m-phone-hint">We call on working days between 8 and 5.</span></div>
        <div class="field"><label for="m-note">What do you need?</label><textarea id="m-note" name="note"></textarea></div>
        <button class="btn btn-primary" type="submit">Send my request</button>
      </form>
    </div>
  </section>
</main>
<footer class="site-footer"><div class="wrap"><span>${e(c.business)} · ${e(c.address)}</span><span>${e(c.footerNote)}</span></div></footer>
</body>
</html>`;
}
