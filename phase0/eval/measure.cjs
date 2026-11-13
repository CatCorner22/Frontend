// M0 measurement harness. Applies identical, build-agnostic checks to each build.
// Usage: node phase0/eval/measure.cjs <label> <path-to-index.html> <output-dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [label, htmlPath, outDir] = process.argv.slice(2);
if (!label || !htmlPath || !outDir) {
  console.error('usage: measure.cjs <label> <index.html> <outDir>');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
const url = 'file://' + path.resolve(htmlPath);
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const FORWARD = /start|continue|next|review|check|send|request|submit|prepare|finish|confirm/i;
const BACKWARD = /back|previous|change|edit|print|save|download|try|again|restart|start over|cancel/i;

async function runAxe(page) {
  await page.evaluate(axeSource);
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
  });
  return r;
}

// Style census: how many distinct values the page actually renders.
async function styleCensus(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const sets = { color: new Set(), background: new Set(), fontSize: new Set(), fontFamily: new Set(), radius: new Set(), shadow: new Set(), borderColor: new Set() };
    let gradients = 0, animated = 0, transitionAll = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (!vis(el)) continue;
      const s = getComputedStyle(el);
      if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
        sets.color.add(s.color); sets.fontSize.add(s.fontSize); sets.fontFamily.add(s.fontFamily.split(',')[0].trim());
      }
      if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') sets.background.add(s.backgroundColor);
      if (s.backgroundImage.includes('gradient')) gradients++;
      if (s.borderTopLeftRadius !== '0px') sets.radius.add(s.borderTopLeftRadius);
      if (s.boxShadow !== 'none') sets.shadow.add(s.boxShadow);
      if (parseFloat(s.borderTopWidth) > 0) sets.borderColor.add(s.borderTopColor);
      if (s.animationName !== 'none') animated++;
      if (s.transitionProperty === 'all' && s.transitionDuration !== '0s') transitionAll++;
    }
    const out = {};
    for (const k of Object.keys(sets)) out[k] = [...sets[k]];
    return { distinct: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])), values: out, gradients, animated, transitionAll };
  });
}

async function structure(page) {
  return page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; };
    const emoji = /\p{Extended_Pictographic}/u;
    const interactive = [...document.querySelectorAll('a[href],button,input,select,textarea,[role=button],[tabindex]:not([tabindex="-1"])')].filter(vis);
    const sizes = interactive.map((el) => { const r = el.getBoundingClientRect(); const lab = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`); const wrap = el.closest('label') || lab; const rr = (el.matches('input[type=radio],input[type=checkbox]') && wrap) ? wrap.getBoundingClientRect() : r; return Math.min(rr.width, rr.height); });
    return {
      lang: document.documentElement.lang || null,
      h1Visible: [...document.querySelectorAll('h1')].filter(vis).length,
      mainCount: document.querySelectorAll('main').length,
      skipLink: !!document.querySelector('a[href^="#"]') && /skip/i.test(document.querySelector('a[href^="#"]').textContent || ''),
      clickableDivs: [...document.querySelectorAll('div[onclick],span[onclick]')].length,
      inlineHandlers: document.querySelectorAll('[onclick],[onchange],[onsubmit],[oninput]').length,
      emojiInText: emoji.test(document.body.innerText),
      svgOrImg: [...document.querySelectorAll('svg,img')].filter(vis).length,
      interactiveCount: interactive.length,
      targetsUnder24: sizes.filter((s) => s < 24).length,
      targetsUnder44: sizes.filter((s) => s < 44).length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bodyFontSizePx: parseFloat(getComputedStyle(document.body).fontSize),
      inputsWithoutLabel: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(vis).filter((el) => !(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length,
    };
  });
}

// Keyboard walk: Tab through the page; record whether each stop shows a visible focus indicator.
async function keyboardWalk(page) {
  const stops = [];
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      const ring = s.boxShadow !== 'none';
      return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40), outlineWidth: s.outlineWidth, visibleFocus: outline || ring, key: el.outerHTML.slice(0, 80) };
    });
    if (!info) break;
    if (stops.length && stops[0].key === info.key) break;
    stops.push(info);
  }
  return { stops: stops.length, withoutVisibleFocus: stops.filter((s) => !s.visibleFocus).map((s) => `${s.tag}:${s.text}`), thinOutline: stops.filter((s) => s.visibleFocus && parseFloat(s.outlineWidth) < 2).length };
}

async function visibleButtons(page) {
  return page.evaluate(() => [...document.querySelectorAll('button,a[role=button],input[type=submit],a.btn,a.button')].filter((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.disabled && !el.closest('nav') && !el.closest('header') && !el.closest('footer'); }).map((el, i) => ({ i, text: (el.innerText || el.value || '').trim() })));
}

async function clickForward(page) {
  const handle = await page.evaluateHandle(({ f, b }) => {
    const F = new RegExp(f, 'i'), B = new RegExp(b, 'i');
    const els = [...document.querySelectorAll('button,a[role=button],input[type=submit],a.btn,a.button')].filter((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.disabled && !el.closest('nav') && !el.closest('header') && !el.closest('footer'); });
    const cand = els.filter((el) => { const t = (el.innerText || el.value || '').trim(); return F.test(t) && !B.test(t); });
    return cand[0] || null;
  }, { f: FORWARD.source, b: BACKWARD.source });
  const el = handle.asElement();
  if (!el) return null;
  const text = await el.evaluate((e) => (e.innerText || e.value || '').trim());
  await el.click({ timeout: 2500 }).catch(() => {}); // a button disabled while sending is valid behaviour; wait instead of failing
  await page.waitForTimeout(350);
  return text;
}

async function fillVisible(page) {
  await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const groups = {};
    for (const r of [...document.querySelectorAll('input[type=radio]')].filter((el) => vis(el) || (el.labels && [...el.labels].some(vis)))) (groups[r.name] ||= []).push(r);
    for (const g of Object.values(groups)) if (!g.some((r) => r.checked)) g[0].click();
    const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); d.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    for (const el of [...document.querySelectorAll('input')].filter(vis)) {
      if (el.value) continue;
      const hint = `${el.name} ${el.id} ${el.autocomplete} ${(el.labels && el.labels[0] && el.labels[0].innerText) || ''}`.toLowerCase();
      if (el.type === 'date') set(el, '2026-12-15');
      else if (/\b(day|month|year|date)\b/.test(hint)) continue; // optional split-date fields stay blank
      else if (el.type === 'tel' || /phone|mobile|\btext\b|\bsms\b/.test(hint)) set(el, '555-0199');
      else if (el.type === 'email' || /email/.test(hint)) set(el, 'maya@example.com');
      else if (el.type === 'text') set(el, 'Maya');
      else if (el.type === 'checkbox' && el.required && !el.checked) el.click();
    }
  });
}

async function walkFlow(page, outcome, shotPrefix) {
  const log = [];
  await page.goto(url);
  await page.evaluate(() => { try { sessionStorage.clear(); localStorage.clear(); } catch (e) {} });
  await page.goto(url);
  const has = async (t) => page.evaluate((t) => document.body.innerText.includes(t), t);
  // Error path probe: on the first screen that has a radio group, press forward with nothing chosen.
  let probedEmpty = null;
  for (let step = 0; step < 14; step++) {
    if (await has('CP-1042')) break;
    if (await has('Your request was not sent')) break;
    const radiosEmpty = await page.evaluate(() => { const rs = [...document.querySelectorAll('input[type=radio]')].filter((el) => { const r = (el.closest('label') || el).getBoundingClientRect(); return r.width > 0; }); return rs.length > 0 && !rs.some((r) => r.checked); });
    if (radiosEmpty && probedEmpty === null) {
      const t = await clickForward(page);
      probedEmpty = await page.evaluate(() => ({ alert: !!document.querySelector('[role=alert]'), ariaInvalid: document.querySelectorAll('[aria-invalid=true]').length, errorText: /choose|select|required|pick/i.test(document.body.innerText), focusTag: document.activeElement ? document.activeElement.tagName.toLowerCase() : null }));
      probedEmpty.clicked = t;
      if (shotPrefix) await page.screenshot({ path: `${shotPrefix}-error-empty-topic.png`, fullPage: true });
    }
    await fillVisible(page);
    const sim = await page.$('#sim-outcome');
    if (sim) await sim.selectOption(outcome).catch(() => {});
    if (shotPrefix) await page.screenshot({ path: `${shotPrefix}-step${String(step).padStart(2, '0')}.png`, fullPage: true });
    const h = await page.evaluate(() => { const h = [...document.querySelectorAll('h1,h2')].find((e) => e.getBoundingClientRect().height > 0); return h ? h.innerText.trim().slice(0, 70) : ''; });
    const clicked = await clickForward(page);
    log.push({ step, heading: h, clicked });
    if (!clicked) break;
    if (outcome === 'slow') await page.waitForTimeout(400);
  }
  if (outcome === 'slow') await page.waitForTimeout(3500);
  await page.waitForTimeout(600);
  const end = { reachedSuccess: await has('CP-1042'), failureCopy: await has('Your request was not sent'), alternativesVisible: await has('555-0142'), steps: log.length };
  if (shotPrefix) await page.screenshot({ path: `${shotPrefix}-end.png`, fullPage: true });
  return { end, log, probedEmpty };
}

(async () => {
  const browser = await chromium.launch();
  const result = { label, bytes: fs.statSync(htmlPath).size, externalRequests: [], viewports: {}, flows: {} };
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('request', (r) => { if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) result.externalRequests.push(r.url()); });
    await page.goto(url);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `home-${vp.name}.png`), fullPage: true });
    const v = { structure: await structure(page), census: await styleCensus(page), axe: await runAxe(page) };
    if (vp.name === '1280') v.keyboard = await keyboardWalk(page);
    result.viewports[vp.name] = v;
    await ctx.close();
  }
  // 320 px reflow check
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const page = await ctx.newPage(); await page.goto(url); await page.waitForTimeout(300);
    result.reflow320 = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, scrollWidth: document.documentElement.scrollWidth }));
    await page.screenshot({ path: path.join(outDir, 'home-320.png'), fullPage: true });
    await ctx.close();
  }
  // Flows at phone width (the primary user's device), with screenshots for the happy path and the failure path.
  for (const outcome of ['success', 'server-error', 'offline', 'slow']) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const shots = outcome === 'success' || outcome === 'server-error' ? path.join(outDir, `flow-${outcome}`) : null;
    try { result.flows[outcome] = await walkFlow(page, outcome, shots); }
    catch (e) { result.flows[outcome] = { error: String(e).slice(0, 300) }; }
    if (outcome === 'success') {
      // axe on every step of the happy path end state plus mid-flow state
      result.axeEnd = await runAxe(page).catch((e) => [{ id: 'axe-failed', impact: 'n/a', nodes: 0, help: String(e).slice(0, 100) }]);
    }
    await ctx.close();
  }
  // Refresh persistence: go two steps in, reload, check that a radio is still chosen.
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage(); await page.goto(url);
    await clickForward(page); await fillVisible(page);
    const before = await page.evaluate(() => { const r = [...document.querySelectorAll('input[type=radio]')].find((x) => x.checked); return r ? r.value : null; });
    await page.reload(); await page.waitForTimeout(400);
    const after = await page.evaluate(() => { const r = [...document.querySelectorAll('input[type=radio]')].find((x) => x.checked); return r ? r.value : null; });
    result.refresh = { before, after, kept: !!before && before === after };
    await ctx.close();
  }
  // Print styles present?
  result.hasPrintStyles = /@media\s+print/.test(fs.readFileSync(htmlPath, 'utf8'));
  result.usesInnerHTML = (fs.readFileSync(htmlPath, 'utf8').match(/\.innerHTML\s*=/g) || []).length;
  result.reducedMotionQuery = /prefers-reduced-motion/.test(fs.readFileSync(htmlPath, 'utf8'));
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(result, null, 2));
  const s = result.viewports['1280'];
  console.log(JSON.stringify({ label, bytes: result.bytes, external: result.externalRequests.length, distinct: s.census.distinct, gradients: s.census.gradients, animated: s.census.animated, axe1280: s.axe.map((v) => `${v.id}(${v.impact},${v.nodes})`), axeEnd: (result.axeEnd || []).map((v) => `${v.id}(${v.impact},${v.nodes})`), structure375: result.viewports['375'].structure, keyboard: s.keyboard, reflow320: result.reflow320, flows: Object.fromEntries(Object.entries(result.flows).map(([k, v]) => [k, v.end || v.error])), probe: result.flows.success && result.flows.success.probedEmpty, refresh: result.refresh, print: result.hasPrintStyles, innerHTML: result.usesInnerHTML }, null, 1));
})();
