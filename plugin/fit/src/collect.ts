// The functions that run inside the browser page. Playwright sends the source text of each function to the page, so each one stands alone:
// it may use nothing from this file except its own parts. The page's own text is read as data and returned as plain values.

export interface Reference {
  kind: string;
  value: string;
}
export interface Drawn {
  kind: 'text' | 'background' | 'border';
  css: string;
  where: string;
}
export interface TextRead {
  where: string;
  foreground: string;
  /** Background layers, from the outermost to the one under the text, as computed CSS colors; null when the background cannot be read. */
  layers: string[] | null;
  /** Why the contrast of this text cannot be measured; empty when it can. */
  unmeasured: string;
  sizePx: number;
  weight: number;
}
export interface Collected {
  references: Reference[];
  scripts: { inline: number; external: number };
  drawn: Drawn[];
  families: { family: string; where: string }[];
  radii: { value: string; where: string }[];
  texts: TextRead[];
  bodyText: string;
  scrollWidth: number;
  clientWidth: number;
}

export function collect(): Collected {
  const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();
  const where = (el: Element): string => {
    const cls = typeof el.className === 'string' && el.className.trim() !== '' ? `.${el.className.trim().split(/\s+/)[0] ?? ''}` : '';
    const own = collapse([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? '').join(' '));
    return `${el.tagName.toLowerCase()}${cls}${own === '' ? '' : ` "${own.length > 40 ? `${own.slice(0, 40)}…` : own}"`}`;
  };
  const alphaOf = (css: string): number => {
    const m = /^rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(css.trim());
    if (!m) return 1;
    if (m[1] === undefined) return 1;
    return m[1].endsWith('%') ? Number.parseFloat(m[1]) / 100 : Number.parseFloat(m[1]);
  };

  // What the page refers to outside itself: anything that is not a data address or a place in the page.
  const references: Reference[] = [];
  const outside = (value: string): boolean => {
    const t = value.trim();
    return t !== '' && !t.startsWith('data:') && !t.startsWith('#') && !t.startsWith('about:blank');
  };
  const holders: [string, string][] = [['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'], ['iframe', 'src'], ['video', 'src'], ['audio', 'src'], ['track', 'src'], ['embed', 'src'], ['object', 'data'], ['input', 'src'], ['form', 'action']];
  for (const [tag, attribute] of holders) {
    for (const el of document.querySelectorAll(tag)) {
      const value = el.getAttribute(attribute) ?? '';
      if (outside(value)) references.push({ kind: `${tag} ${attribute}`, value: collapse(value) });
    }
  }
  for (const el of document.querySelectorAll('img[srcset], source[srcset]')) {
    for (const candidate of (el.getAttribute('srcset') ?? '').split(',')) {
      const value = candidate.trim().split(/\s+/)[0] ?? '';
      if (outside(value)) references.push({ kind: `${el.tagName.toLowerCase()} srcset`, value });
    }
  }
  const fromCss = (css: string, kind: string): void => {
    for (const m of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) if (outside(m[2] ?? '')) references.push({ kind, value: collapse(m[2] ?? '') });
    for (const m of css.matchAll(/@import\s+(?:url\(\s*)?(['"])(.*?)\1/g)) if (outside(m[2] ?? '')) references.push({ kind: 'css import', value: collapse(m[2] ?? '') });
  };
  for (const style of document.querySelectorAll('style')) fromCss(style.textContent ?? '', 'css url');
  for (const el of document.querySelectorAll('[style]')) fromCss(el.getAttribute('style') ?? '', 'css url');

  const scripts = { inline: 0, external: 0 };
  for (const script of document.scripts) {
    if (script.hasAttribute('src')) scripts.external++;
    else scripts.inline++;
  }

  const drawn: Drawn[] = [];
  const families: Collected['families'] = [];
  const radii: Collected['radii'] = [];
  const texts: TextRead[] = [];
  const skip = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'HEAD', 'TITLE', 'META', 'LINK', 'BASE']);
  const corners = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const;
  const sides = [['borderTopWidth', 'borderTopStyle', 'borderTopColor'], ['borderRightWidth', 'borderRightStyle', 'borderRightColor'], ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'], ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']] as const;

  for (const el of document.querySelectorAll('body, body *')) {
    if (skip.has(el.tagName) || el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible') continue;
    const label = where(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');

    const fill = cs.backgroundColor;
    const fillShown = alphaOf(fill) > 0;
    if (fillShown) drawn.push({ kind: 'background', css: fill, where: label });
    let edgeShown = false;
    for (const [width, style, color] of sides) {
      if (Number.parseFloat(cs[width]) > 0 && cs[style] !== 'none' && cs[style] !== 'hidden' && alphaOf(cs[color]) > 0) {
        drawn.push({ kind: 'border', css: cs[color], where: label });
        edgeShown = true;
      }
    }
    if (fillShown || edgeShown || el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') {
      const seen = new Set<string>();
      for (const corner of corners) for (const part of cs[corner].split(/\s+/)) if (part !== '0px' && part !== '0' && !seen.has(part)) { seen.add(part); radii.push({ value: part, where: label }); }
    }

    if (!hasText) continue;
    drawn.push({ kind: 'text', css: cs.color, where: label });
    const family = (cs.fontFamily.match(/^\s*(?:"([^"]*)"|'([^']*)'|([^,]*))/) ?? []).slice(1).find((part) => part !== undefined) ?? '';
    families.push({ family: family.trim(), where: label });

    let unmeasured = '';
    const layers: string[] = [];
    if (alphaOf(cs.color) === 0 || alphaOf(cs.webkitTextFillColor) === 0 || cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') unmeasured = 'the text is filled by an image or a gradient';
    for (let up: Element | null = el; up && unmeasured === ''; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (Number.parseFloat(style.opacity) < 1) { unmeasured = 'the text or a box around it is drawn partly transparent'; break; }
      if (style.backgroundImage !== 'none') { unmeasured = 'an image or a gradient lies behind the text'; break; }
      const a = alphaOf(style.backgroundColor);
      if (a > 0) layers.unshift(style.backgroundColor);
      if (a === 1) break;
    }
    texts.push({ where: label, foreground: cs.color, layers: unmeasured === '' ? layers : null, unmeasured, sizePx: Number.parseFloat(cs.fontSize), weight: Number.parseInt(cs.fontWeight, 10) || 400 });
  }

  const root = document.documentElement;
  return { references, scripts, drawn, families, radii, texts, bodyText: collapse(document.body ? document.body.innerText : ''), scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
}

/** The three texts that the Brief requires, as the Mockup shows them: the business name, the headline, and the primary action. */
export function readBrief(): { business: string; headline: string; primaryAction: string } {
  const text = (selector: string): string => (document.querySelector<HTMLElement>(selector)?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return { business: text('.brand'), headline: text('h1'), primaryAction: text('.btn-primary') };
}
