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
  kind: 'text' | 'text fill' | 'background' | 'border' | 'outline' | 'text stroke' | 'underline' | 'column rule' | 'marker' | 'placeholder' | 'caret' | 'accent';
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
  /** The text that a person can read in the window, one entry for each block of text: drawn at 6 pixels or more, not (nearly) transparent, and inside the window's width (campaign A2, finding J-7). A required text must stand inside one block. */
  shownLines: string[];
  /** Text that a `clip-path` or a mask may hide, one entry for each block; whether a person sees it, the program cannot tell (retest finding A2-V7). */
  clippedLines: string[];
  /** Elements with text, or form controls and pictures, that reach past an edge of the window where nothing lets a person scroll to them (finding J-18). */
  cutOff: string[];
  /** Frames and embedded objects (iframe, frame, object, embed). The program does not read what they draw (gate review, finding G-S06). */
  frames: number;
  /** Animations with an end that had not ended when the program read the page: the page may still change (finding G-S04). */
  pendingAnimations: number;
  /** Animations that never end and are running: the page keeps changing after the program stops reading (retest finding R-S05). */
  endlessAnimations: number;
  /** Timers inside SVG pictures (`set`, `animate`, `animateTransform`, `animateMotion`): they change the picture by the clock, and the browser's list of animations does not hold them (R-S05). */
  svgTimers: number;
  /** Drawn colors that a CSS filter changes before they reach the screen; they are counted as not measured (finding J-6). */
  filtered: number;
  /** Every `@font-face` rule of the page: the family that it names and where its letters come from (finding J-19). */
  fontFaces: { family: string; src: string }[];
  scrollWidth: number;
  clientWidth: number;
  /** The address of the page's first `<base href>`, against which a browser reads every other address; empty without one (finding A1-10). */
  baseHref: string;
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
  /** A color in `rgb()` or `rgba()` with its alpha multiplied by `factor`; any other form passes unchanged. */
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
  const holders: [string, string][] = [['link', 'href'], ['script', 'src'], ['img', 'src'], ['source', 'src'], ['iframe', 'src'], ['video', 'src'], ['video', 'poster'], ['audio', 'src'], ['track', 'src'], ['embed', 'src'], ['object', 'data'], ['input', 'src'], ['form', 'action'], ['button', 'formaction'], ['input', 'formaction'], ['image', 'href'], ['image', 'xlink:href'], ['use', 'href'], ['use', 'xlink:href'], ['base', 'href']];
  for (const [tag, attribute] of holders) {
    for (const el of every(tag)) {
      const value = el.getAttribute(attribute) ?? '';
      if (outside(value)) references.push({ kind: `${tag} ${attribute}`, value: collapse(value), address: value });
    }
  }
  // A ping holds several addresses, separated by spaces.
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
    // A form field draws its value as text, though it holds no text node (retest finding R-S07).
    const fieldText = (el instanceof HTMLInputElement && !['hidden', 'checkbox', 'radio', 'range', 'color', 'file', 'image'].includes(el.type) && el.value !== '') || (el instanceof HTMLTextAreaElement && el.value !== '');
    const hasText = fieldText || [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '');
    const recolored = isFiltered(el);
    // A box that changes the colors of what lies under it: a backdrop filter other than a blur or more saturation, or a blend mode.
    // The program reads each element's own colors, so what a visitor sees there is not what it read (retest finding R-S06).
    const backdrop = (cs.backdropFilter || (cs as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter || 'none').toLowerCase();
    if ((backdrop !== 'none' && backdrop.replace(/\b(blur|saturate)\([^)]*\)/g, '').trim() !== '') || cs.mixBlendMode !== 'normal') filtered++;
    // A shape or a text of an inline SVG picture paints with `fill` and `stroke` (finding G-S08).
    // A shape that a picture draws by reference (`use`): the shape itself stands where nothing is drawn, so it is read here (R-S07).
    if (el instanceof SVGUseElement) {
      const id = (el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '').replace(/^#/, '');
      const scope = el.getRootNode();
      const target = id !== '' && (scope instanceof Document || scope instanceof ShadowRoot) ? scope.getElementById(id) : null;
      for (const shape of target ? [target, ...target.querySelectorAll('*')].slice(0, 200) : []) {
        if (!(shape instanceof SVGGeometryElement || shape instanceof SVGTextContentElement)) continue;
        const ss = getComputedStyle(shape);
        if (ss.fill !== 'none' && !ss.fill.startsWith('url(') && Number.parseFloat(ss.fillOpacity) > 0) add('background', withAlpha(rgbOf(ss.fill), Number.parseFloat(ss.fillOpacity)), label, recolored);
        if (ss.stroke !== 'none' && !ss.stroke.startsWith('url(') && Number.parseFloat(ss.strokeWidth) > 0 && Number.parseFloat(ss.strokeOpacity) > 0) add('border', withAlpha(rgbOf(ss.stroke), Number.parseFloat(ss.strokeOpacity)), label, recolored);
      }
      continue;
    }
    if (el instanceof SVGGeometryElement || el instanceof SVGTextContentElement) {
      // The paint's own opacity joins the color's alpha, so a half-transparent fill is listed as partly transparent (audit branch, finding CX-02).
      if (cs.fill !== 'none' && !cs.fill.startsWith('url(') && Number.parseFloat(cs.fillOpacity) > 0) add('background', withAlpha(rgbOf(cs.fill), Number.parseFloat(cs.fillOpacity)), label, recolored);
      if (cs.stroke !== 'none' && !cs.stroke.startsWith('url(') && Number.parseFloat(cs.strokeWidth) > 0 && Number.parseFloat(cs.strokeOpacity) > 0) add('border', withAlpha(rgbOf(cs.stroke), Number.parseFloat(cs.strokeOpacity)), label, recolored);
      // A text that the picture draws (`text`, `tspan`) is a text of the page: its typeface is compared, and its contrast is read
      // from its fill against the boxes around the picture (automatic reviewer of pull request 16, finding 2).
      if (el instanceof SVGTextContentElement && hasText && (cs.fill !== 'none' || cs.stroke !== 'none')) {
        const family = (cs.fontFamily.match(/^\s*(?:"([^"]*)"|'([^']*)'|([^,]*))/) ?? []).slice(1).find((part) => part !== undefined) ?? '';
        families.push({ family: family.trim(), where: label });
        const picture = el.ownerSVGElement;
        const paint = cs.fill === 'none' || cs.fill.startsWith('url(') ? '' : withAlpha(rgbOf(cs.fill), Number.parseFloat(cs.fillOpacity));
        let unmeasured = '';
        const layers: string[] = [];
        if (paint === '' || alphaOf(paint) < 1) unmeasured = cs.fill.startsWith('url(') ? 'the text is filled by an image or a gradient' : 'the text or a box around it is drawn partly transparent';
        if (unmeasured === '' && cs.stroke !== 'none' && Number.parseFloat(cs.strokeWidth) > 0) unmeasured = 'the letters are drawn as an outline';
        if (unmeasured === '' && recolored) unmeasured = 'a filter changes how the text is drawn';
        // The program does not work out which shape of the picture lies behind the letters.
        if (unmeasured === '' && picture !== null && picture.querySelector('rect, circle, ellipse, path, polygon, polyline, line, image, use, foreignObject') !== null) unmeasured = 'a shape of the same picture may lie behind the text';
        for (let up: Element | null = el; up && unmeasured === ''; up = up.parentElement) {
          const style = getComputedStyle(up);
          if (Number.parseFloat(style.opacity) < 1) { unmeasured = 'the text or a box around it is drawn partly transparent'; break; }
          if (up instanceof SVGElement && up !== picture) continue;
          if (style.backgroundImage !== 'none') { unmeasured = 'an image or a gradient lies behind the text'; break; }
          const behind = rgbOf(style.backgroundColor);
          const a = alphaOf(behind);
          if (a > 0) layers.unshift(behind);
          if (a === 1) break;
        }
        texts.push({ where: label, foreground: paint === '' ? rgbOf(cs.color) : paint, layers: unmeasured === '' ? layers : null, unmeasured, sizePx: Number.parseFloat(cs.fontSize), weight: Number.parseInt(cs.fontWeight, 10) || 400 });
      }
      continue;
    }
    box(cs, label, hasText, recolored, el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS');
    // Other paint that the page draws (audit branch, M6 gate review, finding S8-02).
    if (cs.textDecorationLine !== 'none' && (el.textContent ?? '').trim() !== '') add('underline', rgbOf(cs.textDecorationColor), label, recolored);
    if (cs.columnRuleStyle !== 'none' && cs.columnRuleStyle !== 'hidden' && Number.parseFloat(cs.columnRuleWidth) > 0 && (cs.columnCount !== 'auto' || cs.columnWidth !== 'auto')) add('column rule', rgbOf(cs.columnRuleColor), label, recolored);
    if (cs.display === 'list-item' && cs.listStyleType !== 'none') add('marker', rgbOf(getComputedStyle(el, '::marker').color), label, recolored);
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && (el.getAttribute('placeholder') ?? '') !== '') add('placeholder', rgbOf(getComputedStyle(el, '::placeholder').color), label, recolored);
    if (cs.caretColor !== 'auto' && (['INPUT', 'TEXTAREA'].includes(el.tagName) || (el as HTMLElement).isContentEditable)) add('caret', rgbOf(cs.caretColor), label, recolored);
    if (cs.accentColor !== 'auto' && ['INPUT', 'PROGRESS', 'METER'].includes(el.tagName)) add('accent', rgbOf(cs.accentColor), label, recolored);
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
    if (hasText || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'IMG'].includes(el.tagName)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > viewWidth + 1 || (r.left < -1 && r.right > 1)) && !clippedOnPurpose(el)) cutOff.push(label);
    }

    if (!hasText) continue;
    const textColor = rgbOf(cs.color);
    let unmeasured = '';
    const layers: string[] = [];
    // Letters drawn as an outline: the stroke paints them, and the fill may be the background's own color (finding G-T01).
    if (Number.parseFloat(cs.webkitTextStrokeWidth) > 0) unmeasured = 'the letters are drawn as an outline';
    if (unmeasured === '' && (alphaOf(textColor) === 0 || alphaOf(rgbOf(cs.webkitTextFillColor)) === 0 || cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text')) unmeasured = 'the text is filled by an image or a gradient';
    if (unmeasured === '' && recolored) unmeasured = 'a filter changes how the text is drawn';
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

  // The text that a person can read in this window (finding J-7). innerText counts text at size 0, at opacity 0, and outside the window.
  // The text nodes of one block (the nearest box that is not inline) make one line: a headline with a marked word inside it is one line, and
  // the end of a tag line and the start of the headline are two.
  const shown = new Map<Element, string[]>();
  const clipped = new Map<Element, string[]>();
  const blockOf = (el: Element): Element => {
    let up = el;
    while (up.parentElement && getComputedStyle(up).display.startsWith('inline') && !getComputedStyle(up).display.startsWith('inline-')) up = up.parentElement;
    return up;
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
  // True when a box around the text hides what overflows it and leaves nothing of the text inside.
  // A box that scrolls (`auto`, `scroll`) cuts nothing away in the direction in which a visitor can scroll it: the visitor reaches the
  // text by scrolling the box. Such a box with no room at all in that direction shows nothing and still cuts (automatic reviewer of
  // pull request 16, finding 1).
  const scrolls = (value: string): boolean => value === 'auto' || value === 'scroll' || value === 'overlay';
  const cutAway = (host: Element, r: DOMRect): boolean => {
    let left = r.left;
    let right = r.right;
    let top = r.top;
    let bottom = r.bottom;
    for (let up: Element | null = host; up && up !== document.documentElement; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      const box = up.getBoundingClientRect();
      // In a direction in which the box scrolls, the visitor can bring the text to any place inside the box: from here upward the
      // text stands where the box stands.
      if (scrolls(style.overflowX) && up.clientWidth >= 1) { left = box.left; right = box.right; }
      else if (style.overflowX !== 'visible') { left = Math.max(left, box.left); right = Math.min(right, box.right); }
      if (scrolls(style.overflowY) && up.clientHeight >= 1) { top = box.top; bottom = box.bottom; }
      else if (style.overflowY !== 'visible') { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
      if (right - left < 1 || bottom - top < 1) return true;
    }
    return false;
  };
  // Boxes that `elementFromPoint` cannot report: a positioned, filled box that takes no clicks, and a positioned, filled box that a
  // style rule draws before or after an element's content.
  const silentCovers: Element[] = [];
  const drawnCovers: { owner: Element; before: boolean; fixed: boolean; z: number; left: number; top: number; right: number; bottom: number; width: number; height: number }[] = [];
  for (const el of every('*')) {
    if (el.getClientRects().length === 0 && el !== document.body && el !== document.documentElement) continue;
    const style = getComputedStyle(el);
    if (style.position !== 'static' && style.pointerEvents === 'none' && style.visibility === 'visible' && alphaOf(rgbOf(style.backgroundColor)) >= 0.5 && seenOpacity(el) >= 0.5) silentCovers.push(el);
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.visibility !== 'visible') continue;
      if (ps.position !== 'fixed' && ps.position !== 'absolute') continue;
      const z = ps.zIndex === 'auto' ? 0 : Number.parseInt(ps.zIndex, 10);
      if (z < 0 || alphaOf(rgbOf(ps.backgroundColor)) < 0.5 || Number.parseFloat(ps.opacity) * seenOpacity(el) < 0.5) continue;
      // A value that the browser does not give in pixels ("auto") is NaN here; the area is worked out when it is needed.
      drawnCovers.push({ owner: el, before: pseudo === '::before', fixed: ps.position === 'fixed', z, left: Number.parseFloat(ps.left), top: Number.parseFloat(ps.top), right: Number.parseFloat(ps.right), bottom: Number.parseFloat(ps.bottom), width: Number.parseFloat(ps.width), height: Number.parseFloat(ps.height) });
    }
  }
  // True when, with the text scrolled into the window, the box on top at the text's middle is neither the text's own box nor one around or inside it.
  // The boxes around a text that a visitor can scroll, each with the place to which it is scrolled now.
  const scrollBoxes = (host: Element): { box: Element; left: number; top: number }[] => {
    const found: { box: Element; left: number; top: number }[] = [];
    for (let up = host.parentElement; up && up !== document.body && up !== document.documentElement; up = up.parentElement) {
      const style = getComputedStyle(up);
      if ((scrolls(style.overflowX) && up.scrollWidth > up.clientWidth) || (scrolls(style.overflowY) && up.scrollHeight > up.clientHeight)) found.push({ box: up, left: up.scrollLeft, top: up.scrollTop });
    }
    return found;
  };
  const covered = (host: Element, range: Range): boolean => {
    // A text inside a box that scrolls is judged where the visitor reads it: scrolled into its box. The boxes go back afterwards.
    const boxes = scrollBoxes(host);
    if (boxes.length === 0) return coveredInPlace(host, range);
    host.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    const result = coveredInPlace(host, range);
    for (const { box, left, top } of boxes) box.scrollTo({ left, top, behavior: 'instant' });
    return result;
  };
  const coveredInPlace = (host: Element, range: Range): boolean => {
    const before = range.getBoundingClientRect();
    window.scrollTo(0, Math.max(0, before.top + window.scrollY - 300));
    const r = range.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 0), document.documentElement.clientWidth - 1);
    const y = r.top + r.height / 2;
    if (y < 0 || y >= window.innerHeight) return false;
    const top = document.elementFromPoint(x, y);
    if (top !== null && top !== host && !host.contains(top) && !top.contains(host)) return true;
    // `elementFromPoint` does not see a box that takes no clicks (`pointer-events: none`), and it reports a box that a style rule
    // draws (`::before`, `::after`) as the element that owns it. Both can lie over the text (retest finding R-S04).
    const inside = (b: { left: number; top: number; right: number; bottom: number }): boolean => x >= b.left && x < b.right && y >= b.top && y < b.bottom;
    for (const cover of silentCovers) if (cover !== host && !cover.contains(host) && !host.contains(cover) && inside(cover.getBoundingClientRect())) return true;
    for (const cover of drawnCovers) {
      if (cover.owner !== host && !cover.owner.contains(host)) continue;
      // The text lies over the drawn box when a box between the text and the owner is positioned higher; at the same height, a box
      // drawn before the content lies under it, and a box drawn after it lies over it.
      let above = false;
      for (let up: Element | null = host; up && up !== cover.owner; up = up.parentElement) {
        const style = getComputedStyle(up);
        if (style.position === 'static') continue;
        const z = style.zIndex === 'auto' ? 0 : Number.parseInt(style.zIndex, 10);
        if (z > cover.z || (z === cover.z && cover.before)) { above = true; break; }
      }
      if (above) continue;
      // The box that the drawn box is placed in: the window for a fixed one, the owner's own box otherwise (an approximation).
      const own = cover.owner.getBoundingClientRect();
      const frame = cover.fixed ? { left: 0, top: 0, width: document.documentElement.clientWidth, height: window.innerHeight } : { left: own.left, top: own.top, width: own.width, height: own.height };
      // One side: from its start, its end, and its length, whichever the browser gave; a side without a start and an end starts at 0.
      const side = (start: number, end: number, length: number, whole: number): [number, number] => {
        const from = Number.isFinite(start) ? start : Number.isFinite(end) && Number.isFinite(length) ? whole - end - length : 0;
        const to = Number.isFinite(length) ? from + length : Number.isFinite(end) ? whole - end : whole;
        return [from, to];
      };
      const [x0, x1] = side(cover.left, cover.right, cover.width, frame.width);
      const [y0, y1] = side(cover.top, cover.bottom, cover.height, frame.height);
      if (x1 - x0 >= 1 && y1 - y0 >= 1 && inside({ left: frame.left + x0, top: frame.top + y0, right: frame.left + x1, bottom: frame.top + y1 })) return true;
    }
    return false;
  };
  // The text stands behind the box that holds it: a negative z-index puts it under the fill of a box around it, unless that box
  // starts a stacking order of its own (retest finding R-S04). The page's own background (body, html) is always behind.
  const behindOwnBox = (host: Element): boolean => {
    let sunk: Element | null = null;
    for (let up: Element | null = host; up && up !== document.body && up !== document.documentElement; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (sunk === null) {
        if (style.position !== 'static' && style.zIndex !== 'auto' && Number.parseInt(style.zIndex, 10) < 0) sunk = up;
        continue;
      }
      if (alphaOf(rgbOf(style.backgroundColor)) >= 0.5 || style.backgroundImage !== 'none') return true;
      if ((style.position !== 'static' && style.zIndex !== 'auto') || Number.parseFloat(style.opacity) < 1 || style.transform !== 'none' || style.isolation === 'isolate' || style.filter !== 'none') return false;
    }
    return false;
  };
  // The text's box shows its back, and the page hides the back of a box (retest finding R-S04).
  const turnedAway = (host: Element): boolean => {
    for (let up: Element | null = host; up && up !== document.documentElement; up = up.parentElement) {
      const style = getComputedStyle(up);
      if (style.backfaceVisibility !== 'hidden' || style.transform === 'none') continue;
      const m = new DOMMatrix(style.transform);
      if (m.m11 * m.m22 - m.m12 * m.m21 < 0) return true;
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
      const opacity = seenOpacity(host);
      if (hs.visibility !== 'visible' || Number.parseFloat(hs.fontSize) < 6 || opacity < 0.1) continue;
      if (alphaOf(rgbOf(hs.webkitTextFillColor)) === 0 && !fillsThroughText(host)) continue;
      // Dots, circles, or squares drawn in place of the letters: no person reads the text (retest finding R-S04).
      const security = (hs as unknown as { webkitTextSecurity?: string }).webkitTextSecurity;
      if (security !== undefined && security !== '' && security !== 'none') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || r.right <= 0 || r.left >= viewWidth) continue;
      // Above the top of the page, where no person can scroll, or cut away by a box that hides what overflows it (finding G-S03).
      if (r.bottom + window.scrollY <= 0 || cutAway(host, r)) continue;
      // A faint text, and a text that another box covers, may not be readable: not measured, never "found" (finding G-S03).
      const unsure = underClip(host) || opacity < 0.5 || behindOwnBox(host) || turnedAway(host) || (root === (document.body ?? document.documentElement) && covered(host, range));
      const into = unsure ? clipped : shown;
      const block = blockOf(host);
      into.set(block, [...(into.get(block) ?? []), value]);
    }
  }

  window.scrollTo(0, 0);
  const pendingAnimations = document.getAnimations().filter((a) => a.effect !== null && a.effect.getComputedTiming().endTime !== Infinity && a.playState !== 'finished' && a.playState !== 'idle').length;
  const endlessAnimations = document.getAnimations().filter((a) => a.effect !== null && a.effect.getComputedTiming().endTime === Infinity && a.playState !== 'finished' && a.playState !== 'idle').length;
  const svgTimers = every('set, animate, animateTransform, animateMotion').filter((el) => el.namespaceURI === 'http://www.w3.org/2000/svg').length;
  const root = document.documentElement;
  return { references, scripts, drawn, families, radii, texts, shownLines: [...shown.values()].map((parts) => collapse(parts.join(''))).filter((line) => line !== ''), clippedLines: [...clipped.values()].map((parts) => collapse(parts.join(''))).filter((line) => line !== ''), cutOff, frames: every('iframe, frame, object, embed').length, pendingAnimations, endlessAnimations, svgTimers, filtered, fontFaces, scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, baseHref: document.querySelector('base[href]')?.getAttribute('href') ?? '' };
}

/** The three texts that the Brief requires, as the Mockup shows them: the business name, the headline, and the primary action. */
/**
 * The media conditions that the page's style rules and pictures name, each as the browser writes it: the conditions of `@media`
 * rules (also inside other rules), of `@import` rules, of `link`, `style`, and `source` elements, in the page and in every open
 * shadow root. A condition says under which window, screen, or setting a part of the design shows; the program reads the page
 * under a few of them only (finding G-S05). Runs in the page; it must stand alone.
 */
export function mediaConditions(): string[] {
  const found = new Set<string>();
  const note = (text: string | null | undefined): void => {
    const clean = (text ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (clean !== '' && clean !== 'all') found.add(clean.slice(0, 200));
  };
  let budget = 20000;
  const walk = (rules: CSSRuleList): void => {
    for (const rule of rules) {
      if (budget-- <= 0) return;
      if (rule instanceof CSSMediaRule) note(rule.media.mediaText);
      if (rule instanceof CSSImportRule) note(rule.media.mediaText);
      const inner = (rule as { cssRules?: CSSRuleList }).cssRules;
      if (inner) walk(inner);
    }
  };
  const sheets = (root: Document | ShadowRoot): void => {
    for (const sheet of [...root.styleSheets, ...root.adoptedStyleSheets]) {
      note(sheet.media.mediaText);
      try {
        walk(sheet.cssRules);
      } catch {
        // A style sheet of another site: the program stops such a request, so the sheet holds no rule.
      }
    }
    for (const el of root.querySelectorAll('source[media], link[media], style[media]')) note(el.getAttribute('media'));
  };
  const roots: (Document | ShadowRoot)[] = [document];
  for (let at = 0; at < roots.length && at < 2000; at++) for (const el of roots[at]!.querySelectorAll('*')) if (el.shadowRoot) roots.push(el.shadowRoot);
  for (const root of roots) sheets(root);
  return [...found].sort().slice(0, 400);
}

export function readBrief(): { business: string; headline: string; primaryAction: string } {
  const text = (selector: string): string => (document.querySelector<HTMLElement>(selector)?.innerText ?? '').replace(/\s+/g, ' ').trim();
  return { business: text('.brand'), headline: text('h1'), primaryAction: text('.btn-primary') };
}
