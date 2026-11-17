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
  kind: 'text' | 'text fill' | 'background' | 'border' | 'outline' | 'text stroke' | 'svg fill' | 'svg stroke' | 'underline' | 'column rule' | 'marker' | 'placeholder' | 'caret' | 'accent';
  css: string;
  where: string;
}
export interface TextRead {
  where: string;
  foreground: string;
  /** Background layers, from the outermost to the one under the text, as computed CSS colors; null when the background cannot be read. */
  layers: string[] | null;
  /** Why the contrast of this text cannot be measured, as a fixed code; empty when it can. The program turns a code into a sentence; page text never stands here (main line, finding X7). */
  unmeasured: '' | 'fill' | 'opacity' | 'image' | 'filter';
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
  /**
   * The text that a person can read in the window, one entry for each block of text: drawn at 6 pixels or more, not (nearly)
   * transparent, in a color that is not transparent, and inside the window's width (campaign A2, findings J-7 and A2-V6). A required
   * text must stand inside one block, so that it cannot be pieced together from the end of one block and the start of the next
   * (the main line's rule, finding X7). Joined on 2026-11-16 (decision D72).
   */
  shownLines: string[];
  /** Text that a `clip-path` or a mask may hide, by block; whether a person sees it, the program cannot tell (retest finding A2-V7). */
  clippedLines: string[];
  /** Elements with text, or form controls and pictures, that reach past an edge of the window where nothing lets a person scroll to them (finding J-18). */
  cutOff: string[];
  /** Drawn colors that a CSS filter changes before they reach the screen; they are counted as not measured (finding J-6). */
  filtered: number;
  /** Every `@font-face` rule of the page: the family that it names and where its letters come from (finding J-19). */
  fontFaces: { family: string; src: string }[];
  scrollWidth: number;
  clientWidth: number;
  /** The address of the page's first `<base href>`, against which a browser reads every other address; empty without one (finding A1-10). */
  baseHref: string;
  /**
   * How many entries of each kind the program dropped because the page held more than it reads (20,000 of each kind). The program
   * fills this in when it checks a reading; the page cannot set it (code review of pull request 14, Codex).
   */
  /** Each breach of a Floor that a program can check on one page, with the first element that breaks it (SPEC.md section 2.22). */
  floorBreaches: { id: string; where: string }[];
  beyond?: Partial<Record<'references' | 'drawn' | 'families' | 'radii' | 'texts' | 'lines' | 'cutOff' | 'fontFaces', number>>;
}

export function collect(): Collected {
  const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();
  const where = (el: Element): string => {
    const cls = typeof el.className === 'string' && el.className.trim() !== '' ? `.${el.className.trim().split(/\s+/)[0] ?? ''}` : '';
    const own = collapse([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent ?? '').join(' '));
    // The cut counts whole characters, so it never leaves half of one (campaign A2, finding J-5).
    const chars = [...own];
    return `${el.tagName.toLowerCase()}${cls}${own === '' ? '' : ` "${chars.length > 40 ? `${chars.slice(0, 40).join('')}…` : own}"`}`;
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
  /** A color in `rgb()` or `rgba()` with its alpha multiplied by `factor`; any other form (a gradient's `url(...)`) passes unchanged. */
  const withAlpha = (css: string, factor: number): string => {
    if (!(factor < 1)) return css;
    const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/.exec(css.trim());
    if (!m) return css;
    const alpha = m[4] === undefined ? 1 : m[5] === '%' ? Number(m[4]) / 100 : Number(m[4]);
    return `rgba(${m[1] ?? '0'}, ${m[2] ?? '0'}, ${m[3] ?? '0'}, ${String(Math.round(alpha * factor * 1000) / 1000)})`;
  };
  const alphaOf = (css: string): number => {
    const m = /^rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(css.trim());
    if (!m) return 1;
    if (m[1] === undefined) return 1;
    return m[1].endsWith('%') ? Number.parseFloat(m[1]) / 100 : Number.parseFloat(m[1]);
  };

  // What the page refers to outside itself: anything that is not a data address or a place in the page.
  const references: Reference[] = [];
  const fontFaces: Collected['fontFaces'] = [];
  // The document and every open shadow root: a shadow root draws as the page does, and querySelectorAll does not enter it (A2-V4).
  const roots: (Document | ShadowRoot)[] = [document];
  for (let at = 0; at < roots.length; at++) for (const el of roots[at]!.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
  const every = (selector: string): Element[] => roots.flatMap((root) => [...root.querySelectorAll(selector)]);
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
  const holders: [string, string][] = [['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'], ['iframe', 'src'], ['video', 'src'], ['audio', 'src'], ['track', 'src'], ['embed', 'src'], ['object', 'data'], ['input', 'src'], ['video', 'poster'], ['form', 'action'], ['button', 'formaction'], ['input', 'formaction'], ['base', 'href'], ['image', 'href'], ['image', 'xlink:href'], ['use', 'href'], ['use', 'xlink:href']];
  for (const [tag, attribute] of holders) {
    for (const el of every(tag)) {
      const value = el.getAttribute(attribute) ?? '';
      if (outside(value)) references.push({ kind: `${tag} ${attribute}`, value: collapse(value), address: value });
    }
  }
  // A ping holds several addresses, separated by spaces; a meta refresh names the address that the page moves to (main line, finding X7).
  for (const el of every('a[ping], area[ping]')) for (const value of (el.getAttribute('ping') ?? '').split(/\s+/)) if (outside(value)) references.push({ kind: `${el.tagName.toLowerCase()} ping`, value: collapse(value), address: value });
  for (const el of every('meta[http-equiv]')) {
    if ((el.getAttribute('http-equiv') ?? '').toLowerCase() !== 'refresh') continue;
    const target = /url\s*=\s*['"]?([^'";]+)/i.exec(el.getAttribute('content') ?? '')?.[1] ?? '';
    if (outside(target)) references.push({ kind: 'meta refresh', value: collapse(target), address: target });
  }
  for (const el of every('img[srcset], source[srcset]')) {
    for (const candidate of (el.getAttribute('srcset') ?? '').split(',')) {
      const value = candidate.trim().split(/\s+/)[0] ?? '';
      if (outside(value)) references.push({ kind: `${el.tagName.toLowerCase()} srcset`, value, address: value });
    }
  }
  // The escapes are decoded first, so that neither an address nor the word `url` itself can hide behind one, and function names
  // are read in any letter case, as a browser reads them (finding A1-11).
  const fromCss = (css: string, kind: string): void => {
    const add = (raw: string, as: string): void => { if (outside(raw)) references.push({ kind: as, value: collapse(raw), address: raw }); };
    const text = unescapeCss(css);
    for (const m of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) add(m[2] ?? '', kind);
    for (const m of text.matchAll(/@import\s+(?:url\(\s*)?(['"])(.*?)\1/gi)) add(m[2] ?? '', 'css import');
    for (const m of text.matchAll(/image-set\(([^)]*)\)/gi)) for (const quoted of (m[1] ?? '').matchAll(/(['"])(.*?)\1/g)) add(quoted[2] ?? '', kind);
  };
  for (const style of every('style')) fromCss(style.textContent ?? '', 'css url');
  for (const el of every('[style]')) fromCss(el.getAttribute('style') ?? '', 'css url');
  // A rule that a script adds (`insertRule`, `adoptedStyleSheets`) stands in no style text; the browser's own sheets hold it (finding A1-11).
  // Every style sheet: the document's, each shadow root's, and every sheet that an @import rule brings in (retest finding A2-V2).
  const sheets: CSSStyleSheet[] = roots.flatMap((root) => [...root.styleSheets, ...root.adoptedStyleSheets]);
  for (let at = 0; at < sheets.length && at < 500; at++) {
    let rules: CSSRuleList;
    try {
      rules = sheets[at]!.cssRules;
    } catch {
      continue;
    }
    const walk = (list: CSSRuleList): void => {
      for (const rule of list) {
        fromCss(rule.cssText, 'css url');
        if (rule.type === 3 && (rule as CSSImportRule).styleSheet) sheets.push((rule as CSSImportRule).styleSheet!);
        else if (rule.type === 5) {
          const style = (rule as CSSFontFaceRule).style;
          fontFaces.push({ family: style.getPropertyValue('font-family').trim().replace(/^["']|["']$/g, ''), src: style.getPropertyValue('src') });
        } else if ('cssRules' in rule) {
          try {
            walk((rule as CSSGroupingRule).cssRules);
          } catch {
            // A rule whose inner rules cannot be read holds nothing that the page can use either.
          }
        }
      }
    };
    walk(rules);
  }

  const scripts = { inline: 0, external: 0 };
  for (const script of every('script')) {
    if (script.hasAttribute('src')) scripts.external++;
    else scripts.inline++;
  }

  const drawn: Drawn[] = [];
  let filtered = 0;
  const families: Collected['families'] = [];
  const radii: Collected['radii'] = [];
  const texts: TextRead[] = [];
  const skip = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'HEAD', 'TITLE', 'META', 'LINK', 'BASE']);
  const SHAPES = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'tspan', 'textPath']);
  const corners = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const;
  const sides = [['borderTopWidth', 'borderTopStyle', 'borderTopColor'], ['borderRightWidth', 'borderRightStyle', 'borderRightColor'], ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'], ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor']] as const;

  // A filter on an element, or on any box around it, changes every color that it draws (finding J-6). Memo by element.
  const filterMemo = new Map<Element, boolean>();
  const isFiltered = (el: Element | null): boolean => {
    if (el === null) return false;
    const known = filterMemo.get(el);
    if (known !== undefined) return known;
    const value = getComputedStyle(el).filter !== 'none' || isFiltered(el.parentElement);
    filterMemo.set(el, value);
    return value;
  };
  // How opaque an element is drawn, all the boxes around it together (finding J-7).
  const opacityMemo = new Map<Element, number>();
  const seenOpacity = (el: Element | null): number => {
    if (el === null) return 1;
    const known = opacityMemo.get(el);
    if (known !== undefined) return known;
    const value = Number.parseFloat(getComputedStyle(el).opacity) * seenOpacity(el.parentElement);
    opacityMemo.set(el, value);
    return value;
  };
  const viewWidth = document.documentElement.clientWidth;
  // A box between the element and the page that scrolls sideways: a person can scroll to the element. A box that hides or clips
  // what overflows lets no person reach it, so that is a cut, not an exception (retest finding A2-V1).
  const clippedOnPurpose = (el: Element): boolean => {
    for (let up = el.parentElement; up && up !== document.body && up !== document.documentElement; up = up.parentElement) if (['auto', 'scroll'].includes(getComputedStyle(up).overflowX)) return true;
    return false;
  };
  const cutOff: string[] = [];
  const add = (kind: Drawn['kind'], css: string, where: string, recolored: boolean): void => {
    if (alphaOf(css) === 0) return;
    if (recolored) filtered++;
    else drawn.push({ kind, css, where });
  };
  // The colors, edges, and corners of one box: an element, or one of its pseudo-elements.
  const box = (cs: CSSStyleDeclaration, label: string, withText: boolean, recolored: boolean, picture: boolean): void => {
    const fill = rgbOf(cs.backgroundColor);
    const fillShown = alphaOf(fill) > 0;
    add('background', fill, label, recolored);
    let edgeShown = false;
    for (const [width, style, color] of sides) {
      if (Number.parseFloat(cs[width]) > 0 && cs[style] !== 'none' && cs[style] !== 'hidden' && alphaOf(rgbOf(cs[color])) > 0) {
        add('border', rgbOf(cs[color]), label, recolored);
        edgeShown = true;
      }
    }
    if (cs.outlineStyle !== 'none' && Number.parseFloat(cs.outlineWidth) > 0) add('outline', rgbOf(cs.outlineColor), label, recolored);
    if (fillShown || edgeShown || picture) {
      const seen = new Set<string>();
      for (const corner of corners) for (const part of cs[corner].split(/\s+/)) if (part !== '0px' && part !== '0' && !seen.has(part)) { seen.add(part); radii.push({ value: part, where: label }); }
    }
    if (!withText) return;
    add('text', rgbOf(cs.color), label, recolored);
    // The fill paints the letters when it is set apart from the color (retest finding A2-V3).
    const letters = rgbOf(cs.webkitTextFillColor);
    if (letters !== rgbOf(cs.color)) add('text fill', letters, label, recolored);
    if (Number.parseFloat(cs.webkitTextStrokeWidth) > 0) add('text stroke', rgbOf(cs.webkitTextStrokeColor), label, recolored);
    const family = (cs.fontFamily.match(/^\s*(?:"([^"]*)"|'([^']*)'|([^,]*))/) ?? []).slice(1).find((part) => part !== undefined) ?? '';
    families.push({ family: family.trim(), where: label });
  };

  for (const el of [...(document.body ? [document.body] : []), ...every('body *'), ...roots.slice(1).flatMap((root) => [...root.querySelectorAll('*')])]) {
    if (skip.has(el.tagName) || el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility !== 'visible') continue;
    const label = where(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');
    const recolored = isFiltered(el);
    box(cs, label, hasText, recolored, el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS');
    // Pseudo-elements draw too: a decoration, or words that stand in for the page's own (finding J-6).
    for (const pseudo of ['::before', '::after'] as const) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.visibility !== 'visible') continue;
      box(ps, `${label}${pseudo}`, !/^(""|''|url\(.*\))$/.test(ps.content), recolored, false);
    }
    // The first letter and the first line take their own colors and typefaces (retest finding A2-V5).
    // Each is read only where it differs from its element, so that the element is not counted three times.
    if (hasText) {
      for (const pseudo of ['::first-letter', '::first-line'] as const) {
        const ps = getComputedStyle(el, pseudo);
        if (ps.color !== cs.color || ps.webkitTextFillColor !== cs.webkitTextFillColor || ps.fontFamily !== cs.fontFamily || ps.backgroundColor !== 'rgba(0, 0, 0, 0)' || ps.borderTopStyle !== 'none') box(ps, `${label}${pseudo}`, true, recolored, false);
      }
    }
    // Other paint that the page draws (M6 gate review, findings S8-01 and S8-02). An SVG shape paints with fill and stroke, not with
    // color; a fill of "url(...)" (a gradient or a pattern) is passed on unconverted, so the receipt counts it as not measured.
    if (el.namespaceURI === 'http://www.w3.org/2000/svg' && SHAPES.has(el.localName)) {
      // The paint's own opacity joins the color's alpha, so a half-transparent fill is listed as partly transparent (code review, Codex).
      if (el.localName !== 'line' && cs.fill !== 'none' && Number.parseFloat(cs.fillOpacity) > 0) add('svg fill', withAlpha(rgbOf(cs.fill), Number.parseFloat(cs.fillOpacity)), label, recolored);
      if (cs.stroke !== 'none' && Number.parseFloat(cs.strokeWidth) > 0 && Number.parseFloat(cs.strokeOpacity) > 0) add('svg stroke', withAlpha(rgbOf(cs.stroke), Number.parseFloat(cs.strokeOpacity)), label, recolored);
    }
    if (cs.textDecorationLine !== 'none' && (el.textContent ?? '').trim() !== '') add('underline', rgbOf(cs.textDecorationColor), label, recolored);
    if (cs.columnRuleStyle !== 'none' && cs.columnRuleStyle !== 'hidden' && Number.parseFloat(cs.columnRuleWidth) > 0 && (cs.columnCount !== 'auto' || cs.columnWidth !== 'auto')) add('column rule', rgbOf(cs.columnRuleColor), label, recolored);
    if (cs.display === 'list-item' && cs.listStyleType !== 'none') add('marker', rgbOf(getComputedStyle(el, '::marker').color), label, recolored);
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && (el.getAttribute('placeholder') ?? '') !== '') add('placeholder', rgbOf(getComputedStyle(el, '::placeholder').color), label, recolored);
    if (cs.caretColor !== 'auto' && (['INPUT', 'TEXTAREA'].includes(el.tagName) || (el as HTMLElement).isContentEditable)) add('caret', rgbOf(cs.caretColor), label, recolored);
    if (cs.accentColor !== 'auto' && ['INPUT', 'PROGRESS', 'METER'].includes(el.tagName)) add('accent', rgbOf(cs.accentColor), label, recolored);
    if (hasText || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG'].includes(el.tagName)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > viewWidth + 1 || (r.left < -1 && r.right > 1)) && !clippedOnPurpose(el)) cutOff.push(label);
    }

    if (!hasText) continue;
    const textColor = rgbOf(cs.color);
    let unmeasured: TextRead['unmeasured'] = '';
    const layers: string[] = [];
    if (alphaOf(textColor) === 0 || alphaOf(rgbOf(cs.webkitTextFillColor)) === 0 || cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') unmeasured = 'fill';
    if (unmeasured === '' && recolored) unmeasured = 'filter';
    for (let up: Element | null = el; up && unmeasured === ''; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (Number.parseFloat(style.opacity) < 1) { unmeasured = 'opacity'; break; }
      if (style.backgroundImage !== 'none') { unmeasured = 'image'; break; }
      const behind = rgbOf(style.backgroundColor);
      const a = alphaOf(behind);
      if (a > 0) layers.unshift(behind);
      if (a === 1) break;
    }
    texts.push({ where: label, foreground: textColor, layers: unmeasured === '' ? layers : null, unmeasured, sizePx: Number.parseFloat(cs.fontSize), weight: Number.parseInt(cs.fontWeight, 10) || 400 });
  }

  // The text that a person can read in this window (finding J-7). innerText counts text at size 0, at opacity 0, and outside the window.
  // Text is gathered by block: the nearest box around it that is not drawn inline, as a browser breaks the visible text into lines.
  const shown = new Map<Element, string[]>();
  const clipped = new Map<Element, string[]>();
  const blockOf = (el: Element): Element => {
    let at = el;
    while (at.parentElement && /^(inline|contents)$/.test(getComputedStyle(at).display)) at = at.parentElement;
    return at;
  };
  // Letters drawn in a transparent color are not read, unless a gradient fills them through the text (retest finding A2-V6).
  const fillsThroughText = (el: Element | null): boolean => {
    for (let up = el; up; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (style.backgroundClip === 'text' || style.webkitBackgroundClip === 'text') return true;
    }
    return false;
  };
  // A clip-path or a mask on a box around a text may hide it; the program cannot tell how much (retest finding A2-V7).
  const underClip = (el: Element | null): boolean => {
    for (let up = el; up; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (style.clipPath !== 'none' || (style.maskImage !== '' && style.maskImage !== 'none') || (style.webkitMaskImage !== '' && style.webkitMaskImage !== 'none')) return true;
    }
    return false;
  };
  for (const root of [document.body ?? document.documentElement, ...roots.slice(1)]) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const value = node.textContent ?? '';
      const host = node.parentElement;
      if (value.trim() === '' || host === null || host.closest('script, style, template, noscript, title') !== null) continue;
      const hs = getComputedStyle(host);
      if (hs.visibility !== 'visible' || Number.parseFloat(hs.fontSize) < 6 || seenOpacity(host) < 0.1) continue;
      if (alphaOf(rgbOf(hs.webkitTextFillColor)) === 0 && !fillsThroughText(host)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || r.right <= 0 || r.left >= viewWidth) continue;
      const into = underClip(host) ? clipped : shown;
      const block = blockOf(host);
      into.set(block, [...(into.get(block) ?? []), value]);
    }
  }

  const root = document.documentElement;

  // The Floors that a program can check on one page (SPEC.md section 2.22): each breach names its requirement and the first element.
  // The program keeps only the requirements that the Prescription holds; here every check runs, on the page as it stands.
  const floorBreaches: { id: string; where: string }[] = [];
  const breach = (ids: string[], whereText: string): void => { for (const id of ids) floorBreaches.push({ id, where: whereText }); };
  const firstOf = (list: Element[], ids: string[]): void => { if (list[0]) breach(ids, where(list[0])); };
  const attr = (el: Element, name: string): string => el.getAttribute(name) ?? '';
  const nameOf = (el: Element): string => collapse([el.textContent ?? '', attr(el, 'aria-label'), attr(el, 'aria-labelledby') === '' ? '' : 'labelled', attr(el, 'title'), ...[...el.querySelectorAll('img[alt]')].map((img) => attr(img, 'alt'))].join(' '));
  firstOf(every('img').filter((el) => !el.hasAttribute('alt')), ['A2']);
  const fields = every('input, select, textarea').filter((el) => !(el.tagName === 'INPUT' && ['hidden', 'button', 'image', 'reset', 'submit'].includes(attr(el, 'type').toLowerCase())));
  firstOf(fields.filter((el) => !attr(el, 'aria-label').trim() && !attr(el, 'aria-labelledby').trim() && !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) && !el.closest('label')), ['A3']);
  firstOf(every('a[href], button').filter((el) => nameOf(el) === ''), ['A4']);
  if (!/^[a-z]{2,3}(-[a-z0-9]{1,8})*$/i.test(attr(document.documentElement, 'lang'))) breach(['A5', 'Q13'], 'html');
  const titles = [...document.querySelectorAll('head > title')];
  if (titles.length !== 1 || collapse(titles[0]?.textContent ?? '') === '') breach(['A12', 'Q3'], `head (${String(titles.length)} titles)`);
  const viewport = attr(document.querySelector('meta[name="viewport" i]') ?? document.createElement('meta'), 'content').toLowerCase();
  const maxScale = /maximum-scale\s*=\s*([\d.]+)/.exec(viewport);
  if (!/width\s*=\s*device-width/.test(viewport) || /user-scalable\s*=\s*(no|0)\b/.test(viewport) || (maxScale !== null && Number(maxScale[1]) < 2)) breach(['A13', 'Q9'], 'meta viewport');
  firstOf(every('[tabindex]').filter((el) => Number(attr(el, 'tabindex')) > 0), ['A17']);
  const addressed = every('[src], [href], [action], [formaction], [poster], [srcset]');
  const styleText = [...every('style').map((el) => el.textContent ?? ''), ...every('[style]').map((el) => attr(el, 'style'))].join('\n');
  firstOf(addressed.filter((el) => ['src', 'href', 'action', 'formaction', 'poster', 'srcset'].some((name) => /^\s*http:\/\//i.test(attr(el, name)))), ['S1']);
  if (!floorBreaches.some((b) => b.id === 'S1') && /url\(\s*['"]?\s*http:\/\//i.test(styleText)) breach(['S1'], 'a style sheet');
  const handlers = every('*').filter((el) => [...el.attributes].some((a) => /^on/i.test(a.name)));
  const scripted = addressed.filter((el) => ['src', 'href', 'action', 'formaction'].some((name) => /^\s*javascript:/i.test(attr(el, name))));
  firstOf([...handlers, ...scripted], ['S3']);
  const policyTag = document.querySelector('head > meta[http-equiv="Content-Security-Policy" i]');
  if (!policyTag) breach(['S5'], 'head');
  const formAction = /(?:^|;)\s*form-action\s+([^;]*)/i.exec(attr(policyTag ?? document.createElement('meta'), 'content'));
  if (!formAction || /\*/.test(formAction[1] ?? '')) breach(['S6'], policyTag ? 'meta Content-Security-Policy' : 'head');
  firstOf(every('[target="_blank" i]').filter((el) => !/\b(noopener|noreferrer)\b/i.test(attr(el, 'rel'))), ['S7']);
  const referrer = attr(document.querySelector('meta[name="referrer" i]') ?? document.createElement('meta'), 'content').trim().toLowerCase();
  if (!['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'].includes(referrer)) breach(['S8'], 'head');
  firstOf(every('form').filter((el) => attr(el, 'method').toLowerCase() !== 'post' || /^\s*(http:|javascript:)/i.test(attr(el, 'action'))), ['S9']);
  firstOf(every('input, textarea').filter((el) => (el.tagName === 'TEXTAREA' || ['', 'text', 'email', 'tel', 'search', 'url'].includes(attr(el, 'type').toLowerCase())) && !el.hasAttribute('maxlength')), ['S11']);
  if ([...document.querySelectorAll('meta[name="robots" i], meta[name="googlebot" i]')].some((el) => /\b(noindex|none|nosnippet)\b/i.test(attr(el, 'content')))) breach(['Q2'], 'meta robots');
  const headings = every('h1');
  if (headings.length !== 1 || headings[0]?.getClientRects().length === 0 || collapse(headings[0]?.textContent ?? '') === '') breach(['Q7'], `the page (${String(headings.length)} h1)`);
  const descriptions = [...document.querySelectorAll('meta[name="description" i]')];
  const description = collapse(attr(descriptions[0] ?? document.createElement('meta'), 'content'));
  if (descriptions.length !== 1 || description === '' || description === collapse(titles[0]?.textContent ?? '')) breach(['Q8'], `head (${String(descriptions.length)} descriptions)`);
  firstOf(every('a').filter((el) => attr(el, 'href').trim() === '' || /^\s*javascript:/i.test(attr(el, 'href'))), ['Q10']);
  firstOf(every('img, video, iframe').filter((el) => !(el.hasAttribute('width') && el.hasAttribute('height')) && getComputedStyle(el).aspectRatio === 'auto'), ['P4']);
  if (every('img[fetchpriority="high" i]').length > 2) breach(['P7'], `the page (${String(every('img[fetchpriority="high" i]').length)} images)`);
  firstOf([...document.querySelectorAll('head script[src]')].filter((el) => !el.hasAttribute('async') && !el.hasAttribute('defer') && attr(el, 'type').toLowerCase() !== 'module'), ['P12']);

  return { floorBreaches, references, scripts, drawn, families, radii, texts, shownLines: [...shown.values()].map((parts) => collapse(parts.join(''))), clippedLines: [...clipped.values()].map((parts) => collapse(parts.join(''))), cutOff, filtered, fontFaces, scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, baseHref: document.querySelector('base[href]')?.getAttribute('href') ?? '' };
}

/** The three texts that the Brief requires, as the Mockup shows them: the business name, the headline, and the primary action. */
export function readBrief(): { business: string; headline: string; primaryAction: string } {
  const text = (selector: string): string => (document.querySelector<HTMLElement>(selector)?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return { business: text('.brand'), headline: text('h1'), primaryAction: text('.btn-primary') };
}
