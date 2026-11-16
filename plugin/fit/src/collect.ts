// The functions that run inside the browser page. Playwright sends the source text of each function to the page, so each one stands alone:
// it may use nothing from this file except its own parts. The page's own text is read as data and returned as plain values.

export interface Reference {
  kind: string;
  /** The address as the receipt shows it: runs of white space made one space. */
  value: string;
  /** The address as the browser reads it (a style sheet's escapes decoded), for the decision "another site or not" (audit finding A1-08). */
  address: string;
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
  // A browser reports a computed color in the form that the page wrote it: `rgb()` for the old forms, but `oklch()`, `lab()`, `color()`,
  // and others for the newer ones. The program can compare only `rgb()`, so a one-pixel canvas turns every other form into sRGB channels
  // (finding A1-03: before, such a color was skipped without a word). An `rgb()` value passes unchanged, so that it stays exact.
  const pen = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgbOf = (css: string): string => {
    const text = css.trim();
    if (/^rgba?\(/i.test(text) || pen === null) return text;
    // A canvas that cannot read a color keeps its previous fill without a word. Two different previous fills tell the cases apart: a color
    // that the canvas reads gives the same fill after both; a color that it refuses stays unconverted, and the receipt counts it as not measured.
    pen.fillStyle = '#010203';
    pen.fillStyle = text;
    const first = pen.fillStyle;
    pen.fillStyle = '#040506';
    pen.fillStyle = text;
    if (pen.fillStyle !== first) return text;
    pen.clearRect(0, 0, 1, 1);
    pen.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = pen.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${String(r)}, ${String(g)}, ${String(b)})` : `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(a / 255)})`;
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
    const t = value.trim().toLowerCase();
    return t !== '' && !t.startsWith('data:') && !t.startsWith('#') && !t.startsWith('about:blank');
  };
  // A style sheet may write a letter as an escape: `htt\70s:` is `https:` to the browser. Decoded before any decision.
  const unescapeCss = (text: string): string => text.replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?|\\([^\n\r\f])/g, (_, hex: string | undefined, letter: string | undefined) => {
    if (hex === undefined) return letter ?? '';
    const code = Number.parseInt(hex, 16);
    return code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
  });
  const holders: [string, string][] = [['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'], ['iframe', 'src'], ['video', 'src'], ['audio', 'src'], ['track', 'src'], ['embed', 'src'], ['object', 'data'], ['input', 'src'], ['form', 'action']];
  for (const [tag, attribute] of holders) {
    for (const el of document.querySelectorAll(tag)) {
      const value = el.getAttribute(attribute) ?? '';
      if (outside(value)) references.push({ kind: `${tag} ${attribute}`, value: collapse(value), address: value });
    }
  }
  for (const el of document.querySelectorAll('img[srcset], source[srcset]')) {
    for (const candidate of (el.getAttribute('srcset') ?? '').split(',')) {
      const value = candidate.trim().split(/\s+/)[0] ?? '';
      if (outside(value)) references.push({ kind: `${el.tagName.toLowerCase()} srcset`, value, address: value });
    }
  }
  const fromCss = (css: string, kind: string): void => {
    for (const m of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) { const raw = unescapeCss(m[2] ?? ''); if (outside(raw)) references.push({ kind, value: collapse(raw), address: raw }); }
    for (const m of css.matchAll(/@import\s+(?:url\(\s*)?(['"])(.*?)\1/g)) { const raw = unescapeCss(m[2] ?? ''); if (outside(raw)) references.push({ kind: 'css import', value: collapse(raw), address: raw }); }
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

    const fill = rgbOf(cs.backgroundColor);
    const fillShown = alphaOf(fill) > 0;
    if (fillShown) drawn.push({ kind: 'background', css: fill, where: label });
    let edgeShown = false;
    for (const [width, style, color] of sides) {
      if (Number.parseFloat(cs[width]) > 0 && cs[style] !== 'none' && cs[style] !== 'hidden' && alphaOf(rgbOf(cs[color])) > 0) {
        drawn.push({ kind: 'border', css: rgbOf(cs[color]), where: label });
        edgeShown = true;
      }
    }
    if (fillShown || edgeShown || el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') {
      const seen = new Set<string>();
      for (const corner of corners) for (const part of cs[corner].split(/\s+/)) if (part !== '0px' && part !== '0' && !seen.has(part)) { seen.add(part); radii.push({ value: part, where: label }); }
    }

    if (!hasText) continue;
    const textColor = rgbOf(cs.color);
    drawn.push({ kind: 'text', css: textColor, where: label });
    const family = (cs.fontFamily.match(/^\s*(?:"([^"]*)"|'([^']*)'|([^,]*))/) ?? []).slice(1).find((part) => part !== undefined) ?? '';
    families.push({ family: family.trim(), where: label });

    let unmeasured = '';
    const layers: string[] = [];
    if (alphaOf(textColor) === 0 || alphaOf(rgbOf(cs.webkitTextFillColor)) === 0 || cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') unmeasured = 'the text is filled by an image or a gradient';
    for (let up: Element | null = el; up && unmeasured === ''; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (Number.parseFloat(style.opacity) < 1) { unmeasured = 'the text or a box around it is drawn partly transparent'; break; }
      if (style.backgroundImage !== 'none') { unmeasured = 'an image or a gradient lies behind the text'; break; }
      const behind = rgbOf(style.backgroundColor);
      const a = alphaOf(behind);
      if (a > 0) layers.unshift(behind);
      if (a === 1) break;
    }
    texts.push({ where: label, foreground: textColor, layers: unmeasured === '' ? layers : null, unmeasured, sizePx: Number.parseFloat(cs.fontSize), weight: Number.parseInt(cs.fontWeight, 10) || 400 });
  }

  const root = document.documentElement;
  return { references, scripts, drawn, families, radii, texts, bodyText: collapse(document.body ? document.body.innerText : ''), scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
}

/** The three texts that the Brief requires, as the Mockup shows them: the business name, the headline, and the primary action. */
export function readBrief(): { business: string; headline: string; primaryAction: string } {
  const text = (selector: string): string => (document.querySelector<HTMLElement>(selector)?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return { business: text('.brand'), headline: text('h1'), primaryAction: text('.btn-primary') };
}
