import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARAMS, DIRECTIONS, MOCKUP_FOCUSES, SAMPLE_CONTENT, SMALL_BUSINESS_CSS, STEPS,
  deriveTokens, escapeHtml, renderSmallBusiness, resolvePatch,
  type DesignParams, type MockupInput, type SiteContent,
} from '../src/index.js';

const render = (params: DesignParams = DEFAULT_PARAMS, extra: Partial<MockupInput> = {}): string =>
  renderSmallBusiness({ params, tokens: deriveTokens(params, 'advise').css, content: SAMPLE_CONTENT, ...extra });

/** A different hostile string for every text field, so that a missed field shows up by name. */
function hostileContent(): { content: SiteContent; payloads: string[] } {
  const payloads: string[] = [];
  const bad = (field: string): string => {
    const text = `${field}"><script>alert('${field}')</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)">x</a></title></style>&amp;`;
    payloads.push(text);
    return text;
  };
  const content: SiteContent = {
    business: bad('business'), tag: bad('tag'), headline: `Before ${bad('headline')} after`, headlineEmphasis: 'Before', lede: bad('lede'),
    primaryAction: bad('primaryAction'), secondaryAction: bad('secondaryAction'), phone: bad('phone'),
    nav: [bad('nav0'), bad('nav1')],
    servicesTitle: bad('servicesTitle'), servicesIntro: bad('servicesIntro'),
    services: [{ title: bad('service0title'), body: bad('service0body') }, { title: bad('service1title'), body: bad('service1body') }],
    facts: [{ value: bad('fact0value'), label: bad('fact0label') }],
    feesTitle: bad('feesTitle'),
    fees: [{ item: bad('fee0item'), price: bad('fee0price') }],
    aboutTitle: bad('aboutTitle'), aboutBody: bad('aboutBody'), promise: bad('promise'),
    contactTitle: bad('contactTitle'), contactBody: bad('contactBody'), address: bad('address'), hours: bad('hours'), footerNote: bad('footerNote'),
  };
  return { content, payloads };
}

/** Everything in the document except the style block, which holds the tool's own stylesheet. */
const withoutStyle = (html: string): string => html.replace(/<style>[\s\S]*?<\/style>/, '');

describe('Mockup: text is rendered as text (hard rule 6)', () => {
  it('covers every content field with its own hostile string', () => {
    const { content } = hostileContent();
    expect(Object.keys(content).sort()).toEqual(Object.keys(SAMPLE_CONTENT).sort());
  });

  it('renders hostile content in every field as inert text, in previews and in exported pages', () => {
    const { content, payloads } = hostileContent();
    for (const links of ['inert', 'live'] as const) {
      const html = renderSmallBusiness({ params: DEFAULT_PARAMS, tokens: deriveTokens(DEFAULT_PARAMS, 'advise').css, content, links });
      const body = withoutStyle(html);
      expect(body).not.toMatch(/<script/i);
      expect(body).not.toMatch(/<img/i);
      // No tag carries an event-handler attribute, and no address uses the javascript: scheme.
      expect(body).not.toMatch(/<[a-z][^>]*\son[a-z]+\s*=/i);
      expect(body).not.toMatch(/(href|src|action)\s*=\s*["']?\s*javascript:/i);
      // Exactly one title element and one style block survive: nothing broke out of either.
      expect(html.match(/<\/title>/g)).toHaveLength(1);
      expect(html.match(/<\/style>/g)).toHaveLength(1);
      // Every hostile string appears, escaped. (The service title also appears in lower case inside a link.)
      for (const payload of payloads) {
        const shown = payload.startsWith('headline') ? escapeHtml(payload) : escapeHtml(payload);
        expect(html.includes(shown), `the field with "${payload.slice(0, 16)}" is missing or unescaped`).toBe(true);
      }
    }
  });

  it('escapes the five characters that matter in HTML', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });

  it('contains no script, no event handler, and no outside address, for every Direction and every Option', () => {
    const designs: DesignParams[] = [DEFAULT_PARAMS, ...DIRECTIONS.map((d) => d.params)];
    for (const step of STEPS) for (const option of step.options) designs.push({ ...DEFAULT_PARAMS, ...resolvePatch(option, DEFAULT_PARAMS) });
    for (const params of designs) {
      for (const still of [true, false]) {
        const html = render(params, { still });
        expect(html).not.toMatch(/<script/i);
        expect(html).not.toMatch(/<[a-z][^>]*\son[a-z]+\s*=/i);
        expect(html).not.toMatch(/javascript:/i);
        expect(html).not.toMatch(/(https?:)?\/\/(?!www\.w3\.org\/2000\/svg)/i);
        expect(html).not.toMatch(/@import|<link|<iframe|<object|<embed|<base/i);
        // Exactly one `http-equiv` line is allowed: the content policy that forbids every outside load (finding S2-09). Any other one (a refresh, for example) fails.
        expect(html.match(/<meta http-equiv[^>]*>/gi)).toEqual([`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`]);
      }
    }
  });
});

describe('Mockup: the renderer guards its own inputs (finding SEC-08)', () => {
  const tokens = deriveTokens(DEFAULT_PARAMS, 'advise').css;
  const attack = '"><script>alert(1)</script>';

  it('refuses a design parameter that is not in its list', () => {
    for (const key of ['nav', 'hero', 'sections', 'emphasis', 'elevation', 'signature', 'colorStrategy', 'numerals', 'theme', 'atmosphere', 'buttonFinish', 'displayTreatment', 'motion', 'fontHeading'] as const) {
      const params = { ...DEFAULT_PARAMS, [key]: attack } as unknown as DesignParams;
      expect(() => renderSmallBusiness({ params, tokens, content: SAMPLE_CONTENT }), key).toThrow();
    }
    expect(() => renderSmallBusiness({ params: { ...DEFAULT_PARAMS, radius: Number.NaN }, tokens, content: SAMPLE_CONTENT })).toThrow();
  });

  it('refuses a token, a preview region, or font rules that could break out of their place', () => {
    expect(() => renderSmallBusiness({ params: DEFAULT_PARAMS, tokens: { ...tokens, '--bg': 'red}</style><script>alert(1)</script>' }, content: SAMPLE_CONTENT })).toThrow();
    expect(() => renderSmallBusiness({ params: DEFAULT_PARAMS, tokens, content: SAMPLE_CONTENT, focus: attack as never })).toThrow();
    expect(() => renderSmallBusiness({ params: DEFAULT_PARAMS, tokens, content: SAMPLE_CONTENT, fontFaceCss: '</style><script>alert(1)</script>' })).toThrow();
    expect(() => renderSmallBusiness({ params: DEFAULT_PARAMS, tokens, content: SAMPLE_CONTENT, fontFaceCss: '@font-face{font-family:"X";src:url(data:font/woff2;base64,AAAA)}' })).not.toThrow();
  });
});

describe('Mockup: structure that the checks rely on', () => {
  it('opens with a skip link, and ties every form field to a label', () => {
    const html = render();
    expect(html).toMatch(/<body[^>]*>\s*<a class="skip"/);
    const ids = [...html.matchAll(/<(?:input|textarea)[^>]*\sid="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids).toHaveLength(3);
    for (const id of ids) expect(html.includes(`<label for="${id}">`), `no label for ${id}`).toBe(true);
    expect(html).toMatch(/<html lang="en">/);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<main id="main">/);
  });

  it('stops all motion for a visitor who asks for reduced motion, and animates only when motion is allowed', () => {
    expect(SMALL_BUSINESS_CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{ \*, \*::before, \*::after \{ transition: none !important; animation: none !important; \} \}/);
    const animated = SMALL_BUSINESS_CSS.split('\n').filter((line) => /animation:\s*rise/.test(line));
    expect(animated.length).toBeGreaterThan(0);
    const guardStart = SMALL_BUSINESS_CSS.indexOf('@media (prefers-reduced-motion: no-preference)');
    for (const line of animated) expect(SMALL_BUSINESS_CSS.indexOf(line)).toBeGreaterThan(guardStart);
    expect(SMALL_BUSINESS_CSS).not.toMatch(/transition:\s*all/);
  });

  it('gives the focus ring its own color on the first screen', () => {
    expect(SMALL_BUSINESS_CSS).toMatch(/:focus-visible \{ outline: var\(--focus-w\) solid var\(--focus\)/);
    expect(SMALL_BUSINESS_CSS).toMatch(/\.hero :focus-visible \{ outline-color: var\(--focus-hero\); \}/);
  });

  it('makes preview links inert and exported links real', () => {
    const preview = render(DEFAULT_PARAMS, { links: 'inert' });
    expect(preview).not.toMatch(/\shref=/);
    expect(preview).not.toMatch(/<form[^>]*\saction=/);
    expect(preview).not.toMatch(/type="submit"/);
    expect(preview.match(/role="link" tabindex="0"/g)!.length).toBeGreaterThan(10);
    const exported = render(DEFAULT_PARAMS, { links: 'live' });
    const hrefs = [...exported.matchAll(/\shref="([^"]*)"/g)].map((m) => m[1]!);
    expect(hrefs.length).toBeGreaterThan(10);
    // Every address points inside the page, at an element that exists.
    for (const href of hrefs) {
      expect(href).toMatch(/^#[a-z]+$/);
      expect(exported.includes(`id="${href.slice(1)}"`), `no element with id ${href}`).toBe(true);
    }
    expect(render()).toBe(exported);
  });

  it('opens each preview region, and shows the price list where number styles are compared', () => {
    for (const focus of MOCKUP_FOCUSES) expect(render(DEFAULT_PARAMS, { focus })).toContain(`data-focus="${focus}"`);
    // When the facts sit inside the first screen, the "facts" region opens at the top.
    expect(render({ ...DEFAULT_PARAMS, emphasis: 'proof' }, { focus: 'facts' })).toContain('data-focus="top"');
    const html = render(DEFAULT_PARAMS, { focus: 'fees' });
    expect(html).toContain('<div class="fees">');
    expect(html.match(/<tr>/g)).toHaveLength(SAMPLE_CONTENT.fees.length);
    expect(STEPS.find((s) => s.id === 'numerals')!.focus).toBe('fees');
    expect(render(DEFAULT_PARAMS, { still: true })).toMatch(/<body[^>]*data-still/);
    expect(render(DEFAULT_PARAMS, { still: false })).not.toMatch(/<body[^>]*data-still/);
  });

  it('labels the sample content as a sample', () => {
    expect(SAMPLE_CONTENT.footerNote).toMatch(/sample/i);
    expect(render()).toContain(escapeHtml(SAMPLE_CONTENT.footerNote));
  });
});
