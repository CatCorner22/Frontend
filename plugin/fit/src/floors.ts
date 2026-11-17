// The Floors in the Fit check (SPEC.md section 2.22). The Vision's section 7 lists requirements that stand whatever the design is.
// For some of them a program can check a part on one built page: that a tag is there, that an attribute has a value, that a count
// is right. This file reads those facts from the page and turns them into lines. It never says that a page meets a requirement:
// it says which part it checked, and what it found. Everything else stays with a person, and the receipt says so.

/** What the page function reads. Plain values only; every list is cut at 200 entries. */
export interface FloorFacts {
  /** The lists that held more entries than the program reads (200 of each); a later entry of such a list was not read (retest finding R-T02). */
  cutLists: string[];
  lang: string;
  titles: string[];
  descriptions: string[];
  robots: string[];
  /** Every viewport tag and every referrer tag: a browser may follow a later one (gate review, finding G-S07). */
  viewports: string[];
  referrers: string[];
  csp: string | null;
  /** Where the policy tag stands: after the character set, and before the first element that loads something. */
  cspAfterCharset: boolean;
  cspBeforeLoaders: boolean;
  /** A policy tag outside the head is ignored by browsers. */
  cspInHead: boolean;
  imagesWithoutAlt: string[];
  fieldsWithoutLabel: string[];
  controlsWithoutName: string[];
  genericLinks: string[];
  mainCount: number;
  h1Count: number;
  headingLevels: number[];
  skipLink: boolean;
  positiveTabindex: string[];
  inlineHandlers: string[];
  javascriptLinks: string[];
  blankWithoutNoopener: string[];
  /** Each form that holds a field: its method, its address, and whether one of its buttons sends it another way. */
  forms: { label: string; method: string; action: string; otherMethod: boolean }[];
  fieldsWithoutMaxlength: string[];
  anchorsWithoutHref: string[];
  unsized: string[];
  highPriorityImages: number;
  fontFaces: { family: string; src: string; display: string }[];
  blockingHeadScripts: number;
}

/** Runs inside the page, in the program's own world. It stands alone: it uses nothing from this file. */
export function collectFloorFacts(): FloorFacts {
  const MAX = 200;
  // A list that is read whole and holds more than MAX entries is named, so that the receipt counts it as not measured: an entry
  // after the cut could change the finding (200 harmless robots tags before one that hides the page; retest finding R-T02).
  const cutLists: string[] = [];
  const capped = <T>(name: string, list: T[]): T[] => { if (list.length > MAX) cutLists.push(name); return list.slice(0, MAX); };
  const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();
  const label = (el: Element): string => {
    const cls = typeof el.className === 'string' && el.className.trim() !== '' ? `.${el.className.trim().split(/\s+/)[0] ?? ''}` : '';
    const own = [...collapse(el.textContent ?? '')].slice(0, 30).join('');
    return `${el.tagName.toLowerCase()}${cls}${own === '' ? '' : ` "${own}"`}`;
  };
  // The document and every open shadow root: a shadow root draws as the page does (finding G-S07).
  const roots: (Document | ShadowRoot)[] = [document];
  for (let at = 0; at < roots.length; at++) for (const el of roots[at]!.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
  const all = (selector: string): Element[] => roots.flatMap((root) => [...root.querySelectorAll(selector)]);
  // Signs that draw nothing do not make a name.
  const visible = (text: string): string => collapse(text.replace(/[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}\u2800]/gu, ''));
  const scheme = (el: Element, name: string): string => {
    try {
      return new URL(attr(el, name), document.baseURI).protocol;
    } catch {
      return '';
    }
  };
  const attr = (el: Element, name: string): string => (el.getAttribute(name) ?? '').trim();
  const meta = (name: string): string[] => all('meta[name]').filter((m) => attr(m, 'name').toLowerCase() === name).map((m) => attr(m, 'content'));
  const named = (el: Element): boolean => {
    if (visible(el.textContent ?? '') !== '' || visible(attr(el, 'aria-label')) !== '') return true;
    const by = attr(el, 'aria-labelledby');
    if (by !== '' && by.split(/\s+/).some((id) => visible(document.getElementById(id)?.textContent ?? '') !== '')) return true;
    if (el instanceof HTMLInputElement && attr(el, 'value') !== '') return true;
    return [...el.querySelectorAll('img[alt], svg[aria-label]')].some((inner) => attr(inner, 'alt') !== '' || attr(inner, 'aria-label') !== '');
  };

  const policyTag = all('meta[http-equiv]').find((m) => attr(m, 'http-equiv').toLowerCase() === 'content-security-policy') ?? null;
  const charsetTag = document.querySelector('meta[charset]');
  const before = (a: Element, b: Element): boolean => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const loaders = all('link[href], script[src], img, iframe, video, audio, source, object, embed').filter((el) => el.tagName !== 'LINK' || /\b(stylesheet|preload|modulepreload|prefetch|icon|manifest)\b/i.test(attr(el, 'rel')));
  const firstLoader = loaders[0] ?? null;

  const fields = all('input, select, textarea').filter((f) => !['hidden', 'submit', 'button', 'reset', 'image'].includes(attr(f, 'type').toLowerCase()));
  const labelled = (f: Element): boolean => {
    if (visible(attr(f, 'aria-label')) !== '' || f.closest('label') !== null) return true;
    if (attr(f, 'aria-labelledby').split(/\s+/).some((id) => id !== '' && visible(document.getElementById(id)?.textContent ?? '') !== '')) return true;
    const id = attr(f, 'id');
    return id !== '' && all('label[for]').some((l) => attr(l, 'for') === id);
  };

  // Only an element that is drawn can take the focus: a skip link with `display: none` is no skip link.
  const focusable = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((f) => !f.hasAttribute('disabled') && (f as HTMLElement).tabIndex >= 0 && attr(f, 'type').toLowerCase() !== 'hidden' && f.getClientRects().length > 0 && getComputedStyle(f).visibility === 'visible');
  const first = focusable[0] ?? null;
  const firstHref = first ? attr(first, 'href') : '';
  const skipLink = first !== null && first.tagName === 'A' && firstHref.startsWith('#') && firstHref.length > 1 && document.getElementById(firstHref.slice(1)) !== null;

  const handlers: string[] = [];
  for (const el of all('*')) for (const a of el.getAttributeNames()) if (/^on[a-z]+$/i.test(a)) handlers.push(`${label(el)} ${a.toLowerCase()}`);

  const GENERIC = new Set(['click here', 'read more', 'learn more', 'here']);
  const words = (el: Element): string => visible(el.textContent ?? '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').trim();
  const sized = (el: Element): boolean => {
    if (attr(el, 'width') !== '' && attr(el, 'height') !== '') return true;
    const ratio = getComputedStyle(el).aspectRatio;
    return ratio !== '' && ratio !== 'auto';
  };

  const fontFaces: FloorFacts['fontFaces'] = [];
  const sheets: CSSStyleSheet[] = [...document.styleSheets];
  for (let at = 0; at < sheets.length && at < 200; at++) {
    let rules: CSSRuleList;
    try {
      rules = sheets[at]!.cssRules;
    } catch {
      continue;
    }
    const walk = (list: CSSRuleList): void => {
      for (const rule of list) {
        if (rule.type === 5) {
          const style = (rule as CSSFontFaceRule).style;
          fontFaces.push({ family: style.getPropertyValue('font-family').trim().replace(/^["']|["']$/g, ''), src: style.getPropertyValue('src'), display: style.getPropertyValue('font-display').trim() });
        } else if (rule.type === 3 && (rule as CSSImportRule).styleSheet) sheets.push((rule as CSSImportRule).styleSheet!);
        else if ('cssRules' in rule) {
          try {
            walk((rule as CSSGroupingRule).cssRules);
          } catch {
            // Rules that cannot be read hold nothing that the page can use either.
          }
        }
      }
    };
    walk(rules);
  }

  return {
    cutLists,
    lang: attr(document.documentElement, 'lang'),
    titles: capped('titles', all('head title').map((t) => collapse(t.textContent ?? ''))),
    descriptions: capped('descriptions', meta('description')),
    robots: capped('robots', all('meta[name]').filter((m) => /^robots$|bot$/i.test(attr(m, 'name'))).map((m) => attr(m, 'content'))),
    viewports: capped('viewports', meta('viewport')),
    referrers: capped('referrers', meta('referrer')),
    csp: policyTag ? attr(policyTag, 'content') : null,
    cspAfterCharset: policyTag !== null && charsetTag !== null && before(charsetTag, policyTag),
    cspBeforeLoaders: policyTag !== null && (firstLoader === null || before(policyTag, firstLoader)),
    cspInHead: policyTag !== null && policyTag.parentElement === document.head,
    imagesWithoutAlt: all('img, input[type="image" i]').filter((i) => !i.hasAttribute('alt')).map(label).slice(0, MAX),
    fieldsWithoutLabel: fields.filter((f) => !labelled(f)).map(label).slice(0, MAX),
    controlsWithoutName: all('a[href], button, input[type="submit" i], input[type="button" i], [role="button"]').filter((c) => !named(c)).map(label).slice(0, MAX),
    genericLinks: all('a[href]').filter((a) => GENERIC.has(words(a))).map(label).slice(0, MAX),
    mainCount: all('main, [role="main"]').length,
    h1Count: all('h1').length,
    headingLevels: capped('headingLevels', all('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName.slice(1)))),
    skipLink,
    positiveTabindex: all('[tabindex]').filter((t) => (t as HTMLElement).tabIndex > 0).map(label).slice(0, MAX),
    inlineHandlers: handlers.slice(0, MAX),
    // The browser's own reading of the address decides: it drops tabs and line breaks inside a scheme.
    javascriptLinks: all('a[href], area[href], form[action], iframe[src], button[formaction], input[formaction]').filter((l) => ['href', 'action', 'src', 'formaction'].some((name) => l.hasAttribute(name) && scheme(l, name) === 'javascript:')).map(label).slice(0, MAX),
    blankWithoutNoopener: all('a[target], area[target], form[target]').filter((l) => attr(l, 'target').toLowerCase() === '_blank' && !/\bnoopener\b/i.test(attr(l, 'rel'))).map(label).slice(0, MAX),
    forms: capped('forms', all('form').filter((f) => f.querySelector('input:not([type="hidden" i]), select, textarea') !== null).map((f) => ({ label: label(f).slice(0, 60), method: (f as HTMLFormElement).method.toLowerCase(), action: attr(f, 'action'), otherMethod: [...f.querySelectorAll('[formmethod]')].some((b) => attr(b, 'formmethod').toLowerCase() !== 'post') }))),
    fieldsWithoutMaxlength: all('textarea, input').filter((f) => (f.tagName === 'TEXTAREA' || ['', 'text', 'search', 'email', 'tel', 'url', 'password'].includes(attr(f, 'type').toLowerCase())) && !((f as HTMLInputElement).maxLength > 0)).map(label).slice(0, MAX),
    anchorsWithoutHref: all('a').filter((a) => !a.hasAttribute('href')).map(label).slice(0, MAX),
    unsized: all('img, video, iframe').filter((m) => !sized(m)).map(label).slice(0, MAX),
    highPriorityImages: all('img').filter((i) => attr(i, 'fetchpriority').toLowerCase() === 'high').length,
    fontFaces: capped('fontFaces', fontFaces),
    blockingHeadScripts: all('head script[src]').filter((s) => !s.hasAttribute('defer') && !s.hasAttribute('async') && attr(s, 'type').toLowerCase() !== 'module').length,
  };
}

/** The requirement ids that the Vision's section 7 writes for this project, in the file's order. A Vision without Floors gives none. */
export function writtenFloorIds(visionMd: string): string[] {
  const start = visionMd.indexOf('\n## 7. Floors');
  if (start < 0) return [];
  const end = visionMd.indexOf('\n## 8. ', start);
  const part = visionMd.slice(start, end < 0 ? undefined : end);
  return [...part.matchAll(/^- \*\*([ASHQP]\d{1,2})\.\*\*/gm)].map((m) => m[1] ?? '');
}

/** The edition of the Floors whose wording this program reads. The Studio's core writes the same number into `VISION.md` section 7. */
export const FLOORS_EDITION = 3;

/** The edition that a Vision states, or null (a Vision from before the editions were numbered, or one without Floors). */
export function statedEdition(visionMd: string): number | null {
  const found = /^Edition (\d{1,4}) of the Floors\./m.exec(visionMd);
  return found ? Number(found[1]) : null;
}

/** The requirements of which the program checks a part, and that part in plain words. A1 (contrast) and S2 (other sites) are checked by the measures of their own. */
export const CHECKED_PART: Readonly<Record<string, string>> = {
  A1: 'the contrast of each text against the boxes behind it (the contrast measure)',
  A2: 'every image has an alt attribute',
  A3: 'every form field is tied to a label that holds words, or carries a name',
  A4: 'every link and every button holds words or carries a name',
  A5: 'the html element has a lang value of a valid form',
  A10: 'the page has exactly one main landmark',
  A11: 'the first element that is drawn and can take the focus is a link to a place in the page, and a main landmark exists',
  A12: 'the page has a title that is not empty',
  A13: 'the page has one viewport tag, and it does not block zoom',
  A17: 'no element has a tabindex above 0',
  S1: 'no address in the page begins with http://',
  S2: 'no request or reference goes to another site (the requests measure)',
  S3: 'no inline event-handler attribute and no javascript: address',
  S5: 'the policy tag stands in the head, after the character set and before the first element that loads something; it sets object-src and base-uri to none, and its script-src holds only none or hashes',
  S6: 'the policy holds a form-action rule that does not allow every site',
  S7: 'every link that opens a new tab carries rel="noopener"',
  S8: 'a referrer tag with an allowed value is there',
  S9: 'every form that holds a field posts, and to no http:// address (the program cannot tell which fields are personal data)',
  S11: 'every text field and text area has a maxlength above 0',
  Q2: 'no robots tag (also one for a single search engine) hides the page or its snippet',
  Q3: 'exactly one title, not empty',
  Q7: 'exactly one first-level heading, and heading levels that go down without a skip',
  Q8: 'exactly one description tag, not empty',
  Q9: 'the page has one viewport tag; it sets width=device-width and does not block zoom',
  Q10: 'every a element has an href, and none uses a javascript: address (a link made of another element is not seen)',
  Q11: 'no link is empty or reads "click here", "read more", "learn more", or "here"',
  Q12: 'every image has an alt attribute',
  Q13: 'the html element has a lang value of a valid form',
  P4: 'every image, video, and iframe states its size',
  P7: 'at most two images carry fetchpriority="high"',
  P8: 'every @font-face sets font-display to a value other than auto or block',
  P9: 'every file that an @font-face rule names is a WOFF2 file',
  P12: 'no script file named in the head lacks defer, async, or type=module',
};

const LANG = /^[a-zA-Z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const REFERRER_OK = new Set(['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin']);
const some = (n: number, one: string, many: string): string => `${String(n)} ${n === 1 ? one : many}`;

/**
 * The lines for one reading of the page: each begins with the id of a requirement that the Vision writes. `httpAddresses` are the
 * addresses that the page names and that begin with `http://`.
 */
export function floorFindings(facts: FloorFacts, written: readonly string[], httpAddresses: readonly string[]): string[] {
  const out: string[] = [];
  const on = (id: string): boolean => written.includes(id);
  const say = (ids: string[], line: string): void => {
    for (const id of ids) if (on(id)) out.push(`${id}: ${line}`);
  };
  const listed = (ids: string[], items: readonly string[], one: string, many: string): void => {
    if (items.length > 0) say(ids, `${some(items.length, one, many)}, first ${items[0] ?? ''}`);
  };

  listed(['A2', 'Q12'], facts.imagesWithoutAlt, 'image has no alt attribute', 'images have no alt attribute');
  listed(['A3'], facts.fieldsWithoutLabel, 'form field has no label', 'form fields have no label');
  listed(['A4'], facts.controlsWithoutName, 'link or button has no name', 'links or buttons have no name');
  if (!LANG.test(facts.lang)) say(['A5', 'Q13'], facts.lang === '' ? 'the html element has no lang value' : 'the html element’s lang value has no valid form');
  if (facts.mainCount !== 1) say(['A10'], `the page has ${some(facts.mainCount, 'main landmark', 'main landmarks')}, not one`);
  if (facts.h1Count !== 1) say(['Q7'], `the page has ${some(facts.h1Count, 'first-level heading', 'first-level headings')}, not one`);
  if (!facts.skipLink) say(['A11'], 'the first focusable element is not a link to a place in the page');
  if (facts.mainCount === 0) say(['A11'], 'the page has no main landmark');
  const titles = facts.titles.filter((t) => t !== '');
  if (titles.length === 0) say(['A12', 'Q3'], 'the page has no title, or an empty one');
  if (facts.titles.length > 1) say(['Q3'], `the page has ${String(facts.titles.length)} titles`);
  const viewports = facts.viewports.map((v) => v.toLowerCase().replace(/\s+/g, ''));
  const blocks = (viewport: string): boolean => {
    const maxScale = /maximum-scale=([\d.]+)/.exec(viewport);
    return /user-scalable=(no|0)/.test(viewport) || (maxScale !== null && Number(maxScale[1]) < 2);
  };
  if (viewports.some(blocks)) say(['A13', 'Q9'], 'a viewport tag blocks zoom');
  if (viewports.length > 1) say(['A13', 'Q9'], `the page has ${String(viewports.length)} viewport tags`);
  if (viewports.length === 0) say(['Q9'], 'the page has no viewport tag');
  else if (!viewports.every((v) => v.includes('width=device-width'))) say(['Q9'], 'a viewport tag does not set width=device-width');
  listed(['A17'], facts.positiveTabindex, 'element has a tabindex above 0', 'elements have a tabindex above 0');
  listed(['S1'], httpAddresses, 'address begins with http://', 'addresses begin with http://');
  listed(['S3'], facts.inlineHandlers, 'inline event-handler attribute', 'inline event-handler attributes');
  listed(['S3', 'Q10'], facts.javascriptLinks, 'javascript: address', 'javascript: addresses');

  if (facts.csp === null) say(['S5', 'S6'], 'the page has no Content-Security-Policy tag');
  else {
    const policy = facts.csp.toLowerCase();
    const rule = (name: string): string | null => {
      const found = policy.split(';').map((r) => r.trim()).find((r) => r === name || r.startsWith(`${name} `));
      return found === undefined ? null : found.slice(name.length).trim();
    };
    if (!facts.cspInHead) say(['S5'], 'the policy tag does not stand in the head, where alone a browser reads it');
    if (!facts.cspAfterCharset) say(['S5'], 'the policy tag does not stand after the character set tag');
    if (!facts.cspBeforeLoaders) say(['S5'], 'the policy tag stands after an element that loads something');
    if (rule('object-src') !== "'none'") say(['S5'], "the policy does not set object-src 'none'");
    if (rule('base-uri') !== "'none'") say(['S5'], "the policy does not set base-uri 'none'");
    const scripts = rule('script-src');
    if (scripts === null) say(['S5'], 'the policy has no script-src rule');
    else if (!scripts.split(/\s+/).every((source) => source === "'none'" || /^'sha(256|384|512)-[a-z0-9+/=_-]+'$/.test(source))) say(['S5'], 'the policy’s script-src holds something other than \'none\' or the hashes of scripts');
    const formAction = rule('form-action');
    if (formAction === null) say(['S6'], 'the policy has no form-action rule');
    else if (formAction.split(/\s+/).some((source) => source === '*' || source === 'https:' || source === 'http:')) say(['S6'], 'the policy’s form-action rule allows any site');
  }
  listed(['S7'], facts.blankWithoutNoopener, 'link opens a new tab without rel="noopener"', 'links open a new tab without rel="noopener"');
  if (facts.referrers.length === 0) say(['S8'], 'the page has no referrer tag');
  else if (!facts.referrers.every((value) => REFERRER_OK.has(value.toLowerCase()))) say(['S8'], 'a referrer tag holds a value that is not on the allowed list');
  listed(['S9'], facts.forms.filter((f) => f.method !== 'post' || f.otherMethod).map((f) => f.label), 'form with a field does not post', 'forms with a field do not post');
  listed(['S9'], facts.forms.filter((f) => /^\s*http:/i.test(f.action)).map((f) => f.label), 'form sends to an http:// address', 'forms send to an http:// address');
  listed(['S11'], facts.fieldsWithoutMaxlength, 'text field has no maxlength', 'text fields have no maxlength');
  if (facts.robots.some((r) => /\b(noindex|none|nosnippet)\b|max-snippet\s*:\s*0\b/i.test(r))) say(['Q2'], 'a robots tag hides the page or its snippet');
  const skips = facts.headingLevels.some((level, at) => at > 0 && level > (facts.headingLevels[at - 1] ?? level) + 1);
  if (skips) say(['Q7'], 'a heading level is skipped on the way down');
  const descriptions = facts.descriptions.filter((d) => d !== '');
  if (descriptions.length !== 1 || facts.descriptions.length !== 1) say(['Q8'], facts.descriptions.length === 0 ? 'the page has no description tag' : descriptions.length === 0 ? 'the description tag is empty' : `the page has ${String(facts.descriptions.length)} description tags`);
  listed(['Q10'], facts.anchorsWithoutHref, 'a element has no href', 'a elements have no href');
  listed(['Q11'], facts.genericLinks, 'link has generic words', 'links have generic words');
  listed(['Q11'], facts.controlsWithoutName.filter((c) => c.startsWith('a')), 'link is empty', 'links are empty');
  listed(['P4'], facts.unsized, 'image, video, or iframe does not state its size', 'images, videos, or iframes do not state their size');
  if (facts.highPriorityImages > 2) say(['P7'], `${String(facts.highPriorityImages)} images carry fetchpriority="high"`);
  listed(['P8'], facts.fontFaces.filter((f) => f.display === '' || f.display === 'auto' || f.display === 'block').map((f) => `"${f.family}"`), '@font-face rule leaves font-display at auto or block', '@font-face rules leave font-display at auto or block');
  listed(['P9'], facts.fontFaces.filter((f) => [...f.src.matchAll(/url\(\s*["']?([^"')]+)/gi)].some((m) => !/^data:/i.test(m[1] ?? '') && !/\.woff2$/i.test((m[1] ?? '').split(/[?#]/)[0] ?? ''))).map((f) => `"${f.family}"`), '@font-face rule names a file that is not WOFF2', '@font-face rules name a file that is not WOFF2');
  if (facts.blockingHeadScripts > 0) say(['P12'], `${some(facts.blockingHeadScripts, 'script in the head blocks', 'scripts in the head block')} rendering`);
  return out;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown): string => (typeof v === 'string' ? v.slice(0, 2000) : '');
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.slice(0, 200).map(str) : []);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/** What the page returned, checked for type and size, so that nothing else can enter the receipt. */
export function checkedFacts(raw: unknown): FloorFacts {
  const r = isObject(raw) ? raw : {};
  return {
    cutLists: strs(r['cutLists']).slice(0, 20).filter((name) => /^[A-Za-z]{1,30}$/.test(name)),
    lang: str(r['lang']), titles: strs(r['titles']), descriptions: strs(r['descriptions']), robots: strs(r['robots']),
    viewports: strs(r['viewports']), referrers: strs(r['referrers']),
    csp: typeof r['csp'] === 'string' ? str(r['csp']) : null, cspAfterCharset: r['cspAfterCharset'] === true, cspBeforeLoaders: r['cspBeforeLoaders'] === true, cspInHead: r['cspInHead'] === true,
    imagesWithoutAlt: strs(r['imagesWithoutAlt']), fieldsWithoutLabel: strs(r['fieldsWithoutLabel']), controlsWithoutName: strs(r['controlsWithoutName']), genericLinks: strs(r['genericLinks']),
    mainCount: num(r['mainCount']), h1Count: num(r['h1Count']), headingLevels: Array.isArray(r['headingLevels']) ? r['headingLevels'].slice(0, 200).map(num) : [], skipLink: r['skipLink'] === true,
    positiveTabindex: strs(r['positiveTabindex']), inlineHandlers: strs(r['inlineHandlers']), javascriptLinks: strs(r['javascriptLinks']), blankWithoutNoopener: strs(r['blankWithoutNoopener']),
    forms: Array.isArray(r['forms']) ? r['forms'].slice(0, 200).filter(isObject).map((f) => ({ label: str(f['label']), method: str(f['method']), action: str(f['action']), otherMethod: f['otherMethod'] === true })) : [],
    fieldsWithoutMaxlength: strs(r['fieldsWithoutMaxlength']), anchorsWithoutHref: strs(r['anchorsWithoutHref']), unsized: strs(r['unsized']), highPriorityImages: num(r['highPriorityImages']),
    fontFaces: Array.isArray(r['fontFaces']) ? r['fontFaces'].slice(0, 200).filter(isObject).map((f) => ({ family: str(f['family']), src: str(f['src']), display: str(f['display']) })) : [],
    blockingHeadScripts: num(r['blockingHeadScripts']),
  };
}
