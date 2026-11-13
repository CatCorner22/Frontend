// M0 measurement harness, version 2 (2026-11-13).
//
// What it is. A script that opens one build in a real browser (headless Chromium, driven by the
// Playwright library), measures the home screen, and then walks the intake flow as a visitor would.
// Why it exists. Both builds get identical checks that know nothing about how a build is written,
// so the comparison is apples to apples.
// What can go wrong. A harness that acts on an old view of the page reports things that did not
// happen. Version 1 did that (phase0/RESULTS.md, "Harness defects"). Version 2 follows three rules:
//   1. Look and press on the same screen. Each press is tied to the screen the harness just examined.
//      A guard inside the page cancels the press if the screen changed in between.
//   2. Wait for the page's answer, not for a fixed time. After a press the harness waits until the
//      page shows a new screen, the confirmation, or the failure message.
//   3. Stop at the end. On the confirmation or the failure message the walker presses nothing more.
// The page also keeps its own record of every press it receives. At the end of a run the harness
// compares that record with its log and refuses the results if the two differ (the "self-check").
//
// Words used here. The walker is the part of the harness that presses through a flow; one pass is a
// walk. A press is one real pointer press on a control. A screen is one view of the flow.
//
// Run from the repository root:
//   node phase0/eval/measure.cjs <label> <path-to-index.html> <output-folder>
//   node phase0/eval/measure.cjs --table <a/metrics.json> <b/metrics.json>   (prints the results table)
// To test the harness itself against deliberately broken builds: node phase0/eval/selftest.cjs

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

// Playwright and axe-core come from the repository root, where package.json pins their versions.
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const rootRequire = createRequire(path.join(REPO_ROOT, 'package.json'));

const HARNESS_VERSION = 2;

// Copy that the shared product facts (phase0/prompts/shared-product-facts.md) require word for word.
const COPY = {
  confirmation: ['Your preparation summary is ready', 'CP-1042'], // both must be on the screen
  failure: 'Your request was not sent',
  phone: '555-0142',
  address: '200 Example Street',
};
// A control counts as "the next step" when its label holds one of the FORWARD words ...
const FORWARD = 'start|continue|next|review|check|send|request|submit|prepare|finish|confirm';
// ... and none of these (controls that go back, leave the flow, retry, or start a new flow).
const NOT_FORWARD = 'back|previous|change|edit|print|save|download|try|again|restart|start over|cancel|different|another|clear|reset';
const RETRY = 'try|again|retry|resend';

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const PHONE = { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 }; // the flows run at phone width

const MAX_PRESSES = 14; // a walk that needs more presses than this is stuck
const CLICK_TIMEOUT_MS = 3000; // longest the browser may take to deliver one press
const ANSWER_DEADLINE_MS = 10000; // longest the harness waits for the page to answer one press
const PROBE_DEADLINE_MS = 3000; // longest it waits for a reaction to "forward with nothing chosen"
const PRESS_AGAIN_AFTER_MS = 1000; // "slow, pressed twice": the second press comes this long into the wait
const WATCH_AFTER_CONFIRMATION_MS = 4000; // "slow, pressed twice": how long the confirmation is watched

// ---------------------------------------------------------------------------------------------
// Code that runs inside the page
// ---------------------------------------------------------------------------------------------

// Playwright installs this function in every page of a flow, before the build's own script runs.
// It adds one object (window.__m0Harness) and five listeners. A visitor would see no difference.
function installPageHelpers(cfg) {
  const H = { presses: [], armed: null, lastPressed: null, watch: null };
  window.__m0Harness = H;
  const forward = new RegExp(cfg.FORWARD, 'i');
  const notForward = new RegExp(cfg.NOT_FORWARD, 'i');
  const retry = new RegExp(cfg.RETRY, 'i');
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  };
  const labelOf = (el) => (el ? (el.innerText || el.value || '').trim() : '');
  const switchedOff = (el) => el.disabled === true || el.getAttribute('aria-disabled') === 'true';
  const controlAt = (node) => (node && node.closest ? node.closest('button,a,input[type=submit]') : null);

  // One look at the page. It runs in one piece, so the page cannot change while it runs.
  function scan() {
    const text = document.body.innerText.replace(/\u00a0/g, ' '); // a non-breaking space reads as a space
    const confirmation = cfg.COPY.confirmation.every((t) => text.includes(t));
    const failure = text.includes(cfg.COPY.failure);
    const headings = [...document.querySelectorAll('h1,h2')].filter(visible);
    const h1 = headings.filter((h) => h.tagName === 'H1').map((h) => h.innerText.trim());
    const fields = [...document.querySelectorAll('input,select,textarea')]
      .filter((el) => el.id !== 'sim-outcome' && (visible(el) || (el.labels && [...el.labels].some(visible))))
      .map((el) => el.name || el.id || el.type);
    const buttons = [...document.querySelectorAll('button,a[role=button],input[type=submit],a.btn,a.button')]
      .filter((el) => visible(el) && !switchedOff(el) && !el.closest('nav') && !el.closest('header') && !el.closest('footer'));
    const forwardEl = buttons.find((el) => forward.test(labelOf(el)) && !notForward.test(labelOf(el))) || null;
    const retryEl = buttons.find((el) => retry.test(labelOf(el))) || null;
    const radios = [...document.querySelectorAll('input[type=radio]')]
      .filter((el) => (el.closest('label') || el).getBoundingClientRect().width > 0);
    return {
      info: {
        // The three states of a walk. "in-flow" means: neither the confirmation nor the failure message shows.
        state: confirmation ? 'confirmation' : failure ? 'failure' : 'in-flow',
        confirmation,
        failure,
        phone: text.includes(cfg.COPY.phone),
        address: text.includes(cfg.COPY.address),
        screen: h1.join(' / ').replace(/\s+/g, ' '), // the main heading (h1) names the screen
        heading: headings.length ? headings[0].innerText.trim().slice(0, 70) : '', // first visible h1 or h2, as version 1 logged it
        // The signature tells one screen from another: its main heading plus the form fields it shows.
        signature: h1.join(' / ') + ' | ' + [...new Set(fields)].join(','),
        radiosShownNoneChosen: radios.length > 0 && !radios.some((r) => r.checked),
        forward: forwardEl ? labelOf(forwardEl) : null,
        retry: retryEl ? labelOf(retryEl) : null,
      },
      el: { forward: forwardEl, retry: retryEl },
    };
  }
  H.look = () => scan().info;

  // Look and arm in one piece: the control that gets armed is the one this very look chose.
  // kind is 'forward' (the next step), 'retry' (after a failure), or 'again' (the control pressed last).
  H.lookAndArm = (kind) => {
    const s = scan();
    let el = kind === 'again' ? H.lastPressed : s.el[kind];
    if (kind === 'again' && (s.info.state !== 'in-flow' || !el || !el.isConnected || !visible(el))) el = null;
    if (!el) return { info: s.info, armed: false };
    const out = { info: s.info, armed: true, label: labelOf(el), disabled: el.disabled === true, ariaDisabled: el.getAttribute('aria-disabled') === 'true' };
    if (kind === 'again') {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      out.point = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    H.armed = { kind, el, label: out.label, state: s.info.state, signature: s.info.signature, verdict: null, why: null, clicked: false };
    return out;
  };
  H.disarm = () => {
    const a = H.armed;
    H.armed = null;
    return a ? { verdict: a.verdict, why: a.why, clicked: a.clicked } : null;
  };

  // The guard. It runs at the instant the press reaches the page, before the build's own code.
  // It looks again and cancels the press unless the page still shows the screen and the control
  // that the harness examined. This closes the gap between "look" and "press".
  function decide(a, ev) {
    const now = scan().info;
    const onControl = a.el.isConnected && a.el.contains(ev.target);
    const sameScreen = now.state === a.state && now.signature === a.signature;
    const sameControl = a.kind === 'again' || (labelOf(a.el) === a.label && !switchedOff(a.el));
    a.verdict = onControl && sameScreen && sameControl ? 'delivered' : 'cancelled';
    if (a.verdict === 'cancelled') a.why = 'the page showed "' + now.heading + '" (' + now.state + '); the pointer was on "' + labelOf(controlAt(ev.target)) + '"';
  }
  for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    window.addEventListener(type, (ev) => {
      if (!ev.isTrusted) return; // only real pointer presses; the form filler's own scripted clicks are not presses
      const a = H.armed;
      const target = controlAt(ev.target);
      if (!a) {
        // A press that the walker did not arm. The self-check at the end of the run reports any such press.
        if (type === 'click') H.presses.push({ kind: 'unarmed', label: labelOf(target), state: scan().info.state, verdict: 'delivered' });
        return;
      }
      if (a.verdict === null) decide(a, ev);
      if (a.verdict === 'cancelled') { ev.stopImmediatePropagation(); ev.preventDefault(); }
      if (type === 'click') {
        a.clicked = true;
        // The record states what is true at this instant: the control under the pointer and the screen
        // showing. It does not copy what the walker intended, so it can serve as an independent witness.
        H.presses.push({ kind: a.kind, label: labelOf(target), state: scan().info.state, verdict: a.verdict });
        if (a.verdict === 'delivered' && a.kind !== 'again') H.lastPressed = a.el;
      }
    }, true);
  }

  // The watch ("slow, pressed twice"). It counts every change to the page after the confirmation first shows.
  H.startWatch = () => {
    const w = { confirmationSeen: false, changesAfter: 0 };
    H.watch = w;
    new MutationObserver((records) => {
      if (!w.confirmationSeen) { w.confirmationSeen = scan().info.state === 'confirmation'; return; }
      w.changesAfter += records.length;
    }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
  };
}

// ---------------------------------------------------------------------------------------------
// Measurements of one screen
// ---------------------------------------------------------------------------------------------

// axe-core is a program that scans a page for a set of known accessibility errors. It finds some
// kinds of error and cannot find others; "0 violations" means "axe found none", nothing more.
async function runAxe(page, axeSource) {
  await page.evaluate(axeSource);
  return page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
    // "where" names up to three of the elements at fault, as CSS selectors, so that a reader can find them.
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, where: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
  });
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

// Structure and target sizes of the screen that is showing now.
// A "target" is anything a visitor can press or type into. Its size is the smaller side of its box in
// CSS pixels; for a radio button or checkbox, the box of its label counts. The count is a plain size
// count. It is not a pass or fail against WCAG 2.2, whose target-size rule has exceptions.
async function structure(page) {
  return page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; };
    const emoji = /\p{Extended_Pictographic}/u;
    const interactive = [...document.querySelectorAll('a[href],button,input,select,textarea,[role=button],[tabindex]:not([tabindex="-1"])')].filter(vis);
    const targets = interactive.map((el) => {
      const lab = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      const wrap = el.closest('label') || lab;
      const r = (el.matches('input[type=radio],input[type=checkbox]') && wrap ? wrap : el).getBoundingClientRect();
      return { label: (el.innerText || el.value || el.getAttribute('aria-label') || el.id || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50), width: Math.round(r.width * 10) / 10, height: Math.round(r.height * 10) / 10, size: Math.min(r.width, r.height) };
    });
    const firstHashLink = document.querySelector('a[href^="#"]');
    return {
      lang: document.documentElement.lang || null,
      h1Visible: [...document.querySelectorAll('h1')].filter(vis).length,
      mainCount: document.querySelectorAll('main').length,
      skipLink: !!firstHashLink && /skip/i.test(firstHashLink.textContent || ''),
      clickableDivs: [...document.querySelectorAll('div[onclick],span[onclick]')].length,
      inlineHandlers: document.querySelectorAll('[onclick],[onchange],[onsubmit],[oninput]').length,
      emojiInText: emoji.test(document.body.innerText),
      svgOrImg: [...document.querySelectorAll('svg,img')].filter(vis).length,
      interactiveCount: interactive.length,
      targetsUnder24: targets.filter((t) => t.size < 24).length,
      targetsUnder44: targets.filter((t) => t.size < 44).length,
      // Every target under 44 px, by name and size, so that a reader can see which controls the counts mean.
      smallTargets: targets.filter((t) => t.size < 44).map((t) => ({ label: t.label, width: t.width, height: t.height })),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      bodyFontSizePx: parseFloat(getComputedStyle(document.body).fontSize),
      inputsWithoutLabel: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(vis).filter((el) => !(el.labels && el.labels.length) && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length,
    };
  });
}

// Keyboard walk: press Tab through the screen and record whether each stop shows a focus indicator.
// A stop counts as showing one when it has a visible outline, or a shadow that it lacks without focus.
async function keyboardWalk(page) {
  await page.evaluate(() => {
    window.__shadowAtRest = new Map();
    for (const el of document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')) window.__shadowAtRest.set(el, getComputedStyle(el).boxShadow);
    if (document.activeElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  const stops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && s.outlineColor !== 'rgba(0, 0, 0, 0)';
      const atRest = window.__shadowAtRest.has(el) ? window.__shadowAtRest.get(el) : 'none';
      const ring = s.boxShadow !== 'none' && s.boxShadow !== atRest;
      return { tag: el.tagName.toLowerCase(), text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 40), outlineWidth: s.outlineWidth, visibleFocus: outline || ring, key: el.outerHTML.slice(0, 80) };
    });
    if (!info) break;
    if (stops.length && stops[0].key === info.key) break;
    stops.push(info);
  }
  return { stops: stops.length, withoutVisibleFocus: stops.filter((s) => !s.visibleFocus).map((s) => `${s.tag}:${s.text}`), thinOutline: stops.filter((s) => s.visibleFocus && parseFloat(s.outlineWidth) < 2).length };
}

// ---------------------------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------------------------

const look = (page) => page.evaluate(() => window.__m0Harness.look());

// Wait for a static screen to finish drawing: fonts ready, then two animation frames.
const settle = (page) => page.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));

// Press one control with a real pointer press. Returns what the look saw and whether the press arrived.
async function press(page, kind) {
  const armed = await page.evaluate((k) => window.__m0Harness.lookAndArm(k), kind);
  if (!armed.armed) return { seen: armed.info, delivered: false, note: 'no such control on this screen' };
  let error = null;
  try {
    if (kind === 'again') {
      await page.mouse.click(armed.point.x, armed.point.y); // a visitor's second tap on the same spot
    } else {
      const handle = await page.evaluateHandle(() => window.__m0Harness.armed.el);
      await handle.asElement().click({ timeout: CLICK_TIMEOUT_MS });
    }
  } catch (e) {
    error = String((e && e.message) || e).split('\n')[0];
  }
  const verdict = (await page.evaluate(() => window.__m0Harness.disarm())) || {};
  const delivered = verdict.verdict === 'delivered' && verdict.clicked === true;
  const note = delivered ? null : verdict.verdict === 'cancelled' ? 'press cancelled: ' + verdict.why : error || 'the page did not receive the press';
  return { seen: armed.info, label: armed.label, disabled: armed.disabled, ariaDisabled: armed.ariaDisabled, delivered, note };
}

// Wait until the page answers a press. The answer is the confirmation, the failure message, or a new
// screen. The wait ends the moment one of them shows; the deadline only bounds a page that never answers.
// With until = 'confirmation', only the confirmation counts (used after "try again").
async function waitForAnswer(page, signature, deadlineMs, until) {
  try {
    const answer = await page.waitForFunction(({ signature, until }) => {
      const now = window.__m0Harness.look();
      if (until) return now.state === until ? now.state : false;
      if (now.state !== 'in-flow') return now.state;
      return now.signature !== signature ? 'new screen' : false;
    }, { signature, until: until || null }, { timeout: deadlineMs, polling: 'raf' });
    return await answer.jsonValue();
  } catch (e) {
    return null; // no answer before the deadline
  }
}

// Choose the simulated send outcome in the build's "Prototype controls".
async function setOutcome(page, outcome) {
  const select = await page.$('#sim-outcome');
  if (!select) return false;
  try { await select.selectOption(outcome); } catch (e) { return false; }
  return (await select.inputValue()) === outcome;
}

// The form filler: choose the first option of each radio group that has nothing chosen, and type
// sample text into empty boxes. It returns what it entered. (Radio buttons are set by script, not by
// pointer; split day, month, and year boxes stay empty, because both builds make the date optional.)
async function fillVisible(page) {
  return page.evaluate(() => {
    const shown = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const firstLine = (s) => (s || '').split('\n')[0].trim();
    const entered = [];
    const groups = {};
    for (const r of [...document.querySelectorAll('input[type=radio]')].filter((el) => shown(el) || (el.labels && [...el.labels].some(shown)))) (groups[r.name] ||= []).push(r);
    for (const g of Object.values(groups)) {
      if (g.some((r) => r.checked)) continue;
      g[0].click();
      entered.push({ kind: 'choice', field: g[0].name, value: firstLine(g[0].labels && g[0].labels[0] ? g[0].labels[0].innerText : g[0].value) });
    }
    const set = (el, v, kind) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      entered.push({ kind, field: el.id || el.name, value: v });
    };
    for (const el of [...document.querySelectorAll('input')].filter(shown)) {
      if (el.type === 'radio') continue;
      if (el.type === 'checkbox') {
        if (el.required && !el.checked) { el.click(); entered.push({ kind: 'checkbox', field: el.id || el.name, value: 'ticked' }); }
        continue;
      }
      if (el.value) continue;
      const hint = `${el.name} ${el.id} ${el.autocomplete} ${(el.labels && el.labels[0] && el.labels[0].innerText) || ''}`.toLowerCase();
      if (el.type === 'date') set(el, '2026-12-15', 'date');
      else if (/\b(day|month|year|date)\b/.test(hint)) continue;
      else if (el.type === 'tel' || /phone|mobile|\btext\b|\bsms\b/.test(hint)) set(el, '555-0199', 'phone');
      else if (el.type === 'email' || /email/.test(hint)) set(el, 'maya@example.com', 'email');
      else if (el.type === 'text') set(el, 'Maya', 'text');
    }
    return entered;
  });
}

// Are the given answers on the screen now, as text or inside a visible form field?
async function answersOnScreen(page, answers) {
  return page.evaluate((answers) => {
    const shown = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const text = document.body.innerText.replace(/ /g, ' ');
    const values = [...document.querySelectorAll('input,select,textarea')].filter(shown).map((el) => el.value);
    const out = {};
    for (const [name, value] of Object.entries(answers)) out[name] = value === null ? null : text.includes(value) || values.includes(value);
    return out;
  }, answers);
}

// Error probe: on the first screen that shows radio buttons with none chosen, press forward anyway.
// A careful build stays on the screen and says what to do. The probe records what the page added.
async function probeEmpty(page, shotPrefix) {
  const textBefore = await page.evaluate(() => document.body.innerText);
  const p = await press(page, 'forward');
  if (!p.delivered) return { clicked: null, note: p.note };
  let reaction = null;
  try {
    const handle = await page.waitForFunction(({ signature, textBefore }) => {
      const now = window.__m0Harness.look();
      if (now.state !== 'in-flow') return now.state;
      if (now.signature !== signature) return 'moved on';
      return document.body.innerText !== textBefore ? 'stayed and changed' : false;
    }, { signature: p.seen.signature, textBefore }, { timeout: PROBE_DEADLINE_MS, polling: 'raf' });
    reaction = await handle.jsonValue();
  } catch (e) {
    reaction = 'no visible reaction';
  }
  const found = await page.evaluate((textBefore) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const before = new Set(textBefore.split('\n').map((s) => s.trim()));
    const addedText = document.body.innerText.split('\n').map((s) => s.trim()).filter((s) => s && !before.has(s));
    return {
      alert: [...document.querySelectorAll('[role=alert]')].filter(vis).length > 0,
      ariaInvalid: document.querySelectorAll('[aria-invalid=true]').length,
      addedText: addedText.slice(0, 8),
      // True when the page ADDED a line that reads like an error. (Version 1 searched the whole page, so
      // any screen whose ordinary text says "choose" or "select" counted as showing an error.)
      errorText: addedText.some((s) => /problem|error|choose|select|required|pick|enter/i.test(s)),
      focusTag: document.activeElement ? document.activeElement.tagName.toLowerCase() : null,
    };
  }, textBefore);
  if (shotPrefix) await page.screenshot({ path: `${shotPrefix}-error-empty-topic.png`, fullPage: true });
  return { ...found, stayedOnScreen: reaction === 'stayed and changed' || reaction === 'no visible reaction', reaction, clicked: p.seen.forward };
}

// Walk one flow from the home screen to its end state.
// options: shots (path prefix for screenshots), eachScreen (called on every screen before the press),
// pressTwice (press the same control again when the page has not answered after PRESS_AGAIN_AFTER_MS).
async function walkFlow(page, url, outcome, options = {}) {
  await page.goto(url);
  await settle(page);
  const outcomeChosen = await setOutcome(page, outcome);
  const log = [];
  const entered = [];
  const pressesMade = []; // every press the walker believes it made, in order; the self-check compares it with the page's own record
  let probedEmpty = null, secondPress = null, sendMs = null, stoppedBecause = null, failedPresses = 0;
  for (let step = 0; step < MAX_PRESSES; step++) {
    let seen = await look(page);
    if (seen.state !== 'in-flow') { stoppedBecause = 'reached the ' + seen.state + ' screen'; break; }
    if (probedEmpty === null && seen.radiosShownNoneChosen) {
      probedEmpty = await probeEmpty(page, options.shots);
      if (probedEmpty.clicked) pressesMade.push('forward: ' + probedEmpty.clicked);
      seen = await look(page);
      if (seen.state !== 'in-flow') { stoppedBecause = 'reached the ' + seen.state + ' screen'; break; }
    }
    entered.push(...(await fillVisible(page)));
    if (options.shots) await page.screenshot({ path: `${options.shots}-step${String(step).padStart(2, '0')}.png`, fullPage: true });
    if (options.eachScreen) await options.eachScreen(step, seen.screen);
    const p = await press(page, 'forward');
    if (p.note === 'no such control on this screen') {
      stoppedBecause = p.seen.state !== 'in-flow' ? 'reached the ' + p.seen.state + ' screen' : 'no forward control on "' + p.seen.screen + '"';
      break;
    }
    if (!p.delivered) {
      log.push({ step, heading: p.seen.heading, clicked: null, note: p.note });
      if (++failedPresses >= 3) { stoppedBecause = 'three presses did not arrive'; break; }
      continue; // look again
    }
    pressesMade.push('forward: ' + p.seen.forward);
    const pressedAt = Date.now();
    let answer = await waitForAnswer(page, p.seen.signature, options.pressTwice ? PRESS_AGAIN_AFTER_MS : ANSWER_DEADLINE_MS);
    if (answer === null && options.pressTwice && secondPress === null) {
      // The page is still working on the press. Press the same control once more, as an impatient visitor would.
      await page.evaluate(() => window.__m0Harness.startWatch());
      const again = await press(page, 'again');
      if (again.delivered) pressesMade.push('again');
      const cancelled = (again.note || '').startsWith('press cancelled');
      secondPress = {
        control: p.seen.forward,
        afterMs: Date.now() - pressedAt,
        labelAtSecondPress: again.label || null,
        disabled: again.disabled === true,
        ariaDisabled: again.ariaDisabled === true,
        reachedThePage: again.delivered,
        // "void" means the second press tested nothing, because the page had already answered the first one.
        result: again.delivered ? 'reached the page' : cancelled ? 'void: the page had already answered' : again.note === 'no such control on this screen' ? 'not possible: the control was gone' : again.disabled ? 'not possible: the control was disabled' : 'did not arrive: ' + again.note,
      };
      answer = await waitForAnswer(page, p.seen.signature, ANSWER_DEADLINE_MS);
    }
    const ms = Date.now() - pressedAt;
    log.push({ step, heading: p.seen.heading, clicked: p.seen.forward, answer: answer || 'none', ms });
    if (answer === null) { stoppedBecause = 'no answer within ' + ANSWER_DEADLINE_MS / 1000 + ' s after "' + p.seen.forward + '"'; break; }
    if (answer !== 'new screen') sendMs = ms; // the press that ended the flow is the send
  }
  const fin = await look(page);
  if (stoppedBecause === null) stoppedBecause = fin.state !== 'in-flow' ? 'reached the ' + fin.state + ' screen' : 'press limit (' + MAX_PRESSES + ') reached';
  const end = {
    reachedSuccess: fin.state === 'confirmation',
    failureCopy: fin.failure,
    alternativesVisible: fin.phone,
    addressVisible: fin.address,
    steps: log.filter((l) => l.clicked).length,
    endScreen: fin.screen,
    stoppedBecause,
  };
  if (options.shots) await page.screenshot({ path: `${options.shots}-end.png`, fullPage: true });
  const firstOf = (...kinds) => { const e = entered.find((x) => kinds.includes(x.kind)); return e ? e.value : null; };
  return { end, outcomeChosen, sendMs, log, probedEmpty, secondPress, answers: { topic: firstOf('choice'), name: firstOf('text'), contact: firstOf('phone', 'email') }, pressesMade };
}

// After a failure: are the answers still on the screen, and does one "try again" reach the confirmation?
async function recoveryCheck(page, answers) {
  const onFailureScreen = await answersOnScreen(page, answers);
  const outcomeChosen = await setOutcome(page, 'success');
  const p = await press(page, 'retry');
  let retry;
  if (!p.delivered) {
    retry = { pressed: null, reachedSuccess: false, note: p.note };
  } else {
    await waitForAnswer(page, p.seen.signature, ANSWER_DEADLINE_MS, 'confirmation');
    const fin = await look(page);
    retry = { pressed: p.seen.retry, reachedSuccess: fin.state === 'confirmation', answersOnConfirmation: fin.state === 'confirmation' ? await answersOnScreen(page, answers) : null };
  }
  const all = (o) => o !== null && Object.values(o).length > 0 && Object.values(o).every((v) => v === true);
  return {
    entered: answers,
    onFailureScreen,
    answersKept: all(onFailureScreen),
    retry: { outcomeChosen, ...retry },
    retryReachedSuccessWithSameAnswers: retry.reachedSuccess === true && all(retry.answersOnConfirmation || null),
  };
}

// ---------------------------------------------------------------------------------------------
// One run
// ---------------------------------------------------------------------------------------------

async function measure(label, htmlPath, outDir) {
  const { chromium } = rootRequire('playwright');
  const axeSource = fs.readFileSync(rootRequire.resolve('axe-core/axe.min.js'), 'utf8');
  fs.mkdirSync(outDir, { recursive: true });
  const url = 'file://' + path.resolve(htmlPath);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const browser = await chromium.launch();
  const result = {
    label,
    harness: {
      version: HARNESS_VERSION,
      ranAt: new Date().toISOString(),
      node: process.version,
      playwright: rootRequire('playwright/package.json').version,
      axeCore: rootRequire('axe-core/package.json').version,
      chromium: browser.version(),
    },
    bytes: fs.statSync(htmlPath).size,
    externalRequests: [],
    viewports: {},
    flows: {},
  };
  const problems = []; // the harness's own self-check; an empty list means the walker did what it logged
  const open = async (contextOptions, withHelpers) => {
    const ctx = await browser.newContext(contextOptions);
    if (withHelpers) await ctx.addInitScript(installPageHelpers, { COPY, FORWARD, NOT_FORWARD, RETRY });
    const page = await ctx.newPage();
    page.on('request', (r) => { if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) result.externalRequests.push(r.url()); });
    return { ctx, page };
  };

  // Home screen at three widths.
  for (const vp of VIEWPORTS) {
    const { ctx, page } = await open({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 }, false);
    await page.goto(url);
    await settle(page);
    await page.screenshot({ path: path.join(outDir, `home-${vp.name}.png`), fullPage: true });
    const v = { structure: await structure(page), census: await styleCensus(page), axe: await runAxe(page, axeSource) };
    if (vp.name === '1280') v.keyboard = await keyboardWalk(page);
    result.viewports[vp.name] = v;
    await ctx.close();
  }

  // Reflow at 320 px: the page must not scroll sideways.
  {
    const { ctx, page } = await open({ viewport: { width: 320, height: 640 } }, false);
    await page.goto(url);
    await settle(page);
    result.reflow320 = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, scrollWidth: document.documentElement.scrollWidth }));
    await page.screenshot({ path: path.join(outDir, 'home-320.png'), fullPage: true });
    await ctx.close();
  }

  // The flows, at phone width. Each flow starts in a fresh browser context, so nothing is stored from before.
  const FLOWS = [
    { id: 'success', outcome: 'success', shots: true },
    { id: 'server-error', outcome: 'server-error', shots: true },
    { id: 'offline', outcome: 'offline' },
    { id: 'slow', outcome: 'slow' },
    { id: 'slow-pressed-twice', outcome: 'slow', pressTwice: true },
  ];
  // What the harness records about one screen of a flow: target sizes, labels, and what axe finds.
  const screenReport = async (page, step, screen) => {
    const s = await structure(page);
    const axe = await runAxe(page, axeSource).catch((e) => [{ id: 'axe-failed', impact: 'n/a', nodes: 0, help: String(e).slice(0, 100) }]);
    return { step, screen, h1Visible: s.h1Visible, inputsWithoutLabel: s.inputsWithoutLabel, targetsUnder24: s.targetsUnder24, targetsUnder44: s.targetsUnder44, smallTargets: s.smallTargets, axe };
  };
  for (const flow of FLOWS) {
    const { ctx, page } = await open(PHONE, true);
    const screens = [];
    try {
      const r = await walkFlow(page, url, flow.outcome, {
        shots: flow.shots ? path.join(outDir, `flow-${flow.id}`) : null,
        pressTwice: flow.pressTwice === true,
        eachScreen: flow.id === 'success' ? async (step, screen) => { screens.push(await screenReport(page, step, screen)); } : null,
      });
      result.flows[flow.id] = r;
      if (!r.outcomeChosen) problems.push(`${flow.id}: could not choose the outcome "${flow.outcome}" in #sim-outcome`);
      if (flow.id === 'success') {
        // Every screen of the success flow, the end screen included.
        screens.push(await screenReport(page, 'end', r.end.endScreen));
        r.screens = screens;
        result.axeEndScreen = r.end.endScreen;
        result.axeEnd = screens[screens.length - 1].axe; // kept under its version 1 name
      }
      if (flow.id === 'server-error') {
        r.endScreenReport = await screenReport(page, 'end', r.end.endScreen);
        result.axeFailureScreen = r.end.endScreen;
        result.axeFailure = r.endScreenReport.axe;
      }
      if (flow.pressTwice) {
        // Keep watching the confirmation: a second request, if one was started, would finish in this time.
        if (r.end.reachedSuccess) await page.waitForTimeout(WATCH_AFTER_CONFIRMATION_MS);
        const watch = await page.evaluate(() => window.__m0Harness.watch);
        const after = await look(page);
        r.afterConfirmation = { watchedMs: r.end.reachedSuccess ? WATCH_AFTER_CONFIRMATION_MS : 0, watchStarted: watch !== null, changesToThePage: watch ? watch.changesAfter : null, stillTheConfirmation: after.state === 'confirmation' };
      }
      if (r.end.failureCopy && !r.end.reachedSuccess) {
        r.recovery = await recoveryCheck(page, r.answers);
        if (r.recovery.retry.pressed) r.pressesMade.push('retry: ' + r.recovery.retry.pressed);
      }
      // Self-check: the page keeps its own record of every real press it received. That record must
      // match, press for press and label for label, what the walker believes it pressed.
      r.pressesReceived = await page.evaluate(() => window.__m0Harness.presses);
      r.pressesCancelledByTheGuard = r.pressesReceived.filter((x) => x.verdict === 'cancelled').length;
      const delivered = r.pressesReceived.filter((x) => x.verdict === 'delivered');
      const received = delivered.map((x) => (x.kind === 'again' ? 'again' : x.kind + ': ' + x.label));
      if (received.join(' > ') !== r.pressesMade.join(' > ')) problems.push(`${flow.id}: the walker believes it pressed "${r.pressesMade.join(' > ')}" but the page received "${received.join(' > ')}"`);
      for (const x of delivered) {
        if (x.kind === 'unarmed') problems.push(`${flow.id}: a press on "${x.label}" was not armed by the walker`);
        if (x.state === 'confirmation') problems.push(`${flow.id}: a press on "${x.label}" arrived on the confirmation screen`);
        if (x.state === 'failure' && x.kind !== 'retry') problems.push(`${flow.id}: a press on "${x.label}" arrived on the failure screen`);
      }
    } catch (e) {
      result.flows[flow.id] = { error: String(e).slice(0, 300) };
      problems.push(`${flow.id}: ${String(e).slice(0, 200)}`);
    }
    await ctx.close();
  }

  // Refresh: go to the first question, choose an answer, reload, and see whether the answer is still chosen.
  {
    const { ctx, page } = await open({ viewport: { width: 375, height: 812 } }, true);
    await page.goto(url);
    await settle(page);
    const p = await press(page, 'forward');
    if (p.delivered) await waitForAnswer(page, p.seen.signature, ANSWER_DEADLINE_MS);
    await fillVisible(page);
    const chosen = () => page.evaluate(() => { const r = [...document.querySelectorAll('input[type=radio]')].find((x) => x.checked); return r ? r.value : null; });
    const before = await chosen();
    const screenBefore = (await look(page)).screen;
    await page.reload();
    await settle(page);
    const after = await chosen();
    result.refresh = { before, after, kept: !!before && before === after, screenBefore, screenAfter: (await look(page)).screen };
    await ctx.close();
  }

  // Facts read from the source file.
  result.hasPrintStyles = /@media\s+print/.test(html);
  result.usesInnerHTML = (html.match(/\.innerHTML\s*=/g) || []).length;
  result.reducedMotionQuery = /prefers-reduced-motion/.test(html);

  await browser.close();

  // Checks that combine several recorded values. The results table reads these, so it cannot say more than the data.
  const f = result.flows;
  const one = f.slow && f.slow.end ? f.slow : null;
  const two = f['slow-pressed-twice'] && f['slow-pressed-twice'].end ? f['slow-pressed-twice'] : null;
  // The "pressed twice" check counts only when both slow flows reached the confirmation, the second press
  // was really tried while the page was still waiting, and the watch was running.
  const twoUsable = !!(one && two && one.end.reachedSuccess && two.end.reachedSuccess && two.secondPress && !two.secondPress.result.startsWith('void') && two.afterConfirmation && two.afterConfirmation.watchStarted);
  // A second press that starts the wait again makes the confirmation later by about PRESS_AGAIN_AFTER_MS.
  const secondPressRestartedTheWait = twoUsable ? two.sendMs - one.sendMs > PRESS_AGAIN_AFTER_MS / 2 : null;
  // A second request that finishes later changes the page again after the confirmation has shown.
  const pageChangedAfterConfirmation = twoUsable ? two.afterConfirmation.changesToThePage > 0 || !two.afterConfirmation.stillTheConfirmation : null;
  const screens = (f.success && f.success.screens) || [];
  // The largest count on any one screen, and the screens that have it.
  const most = (key) => {
    if (screens.length === 0) return null;
    const count = Math.max(...screens.map((s) => s[key]));
    return { count, onScreens: screens.filter((s) => s[key] === count).map((s) => s.screen) };
  };
  result.checks = {
    // In every entry, null means "could not be checked".
    answersKeptAfterFailure: Object.fromEntries(['server-error', 'offline'].map((id) => [id, f[id] && f[id].recovery ? f[id].recovery.answersKept : null])),
    retryAfterFailure: Object.fromEntries(['server-error', 'offline'].map((id) => [id, f[id] && f[id].recovery ? f[id].recovery.retryReachedSuccessWithSameAnswers : null])),
    slowCompletesOnce: {
      msWithOnePress: one ? one.sendMs : null,
      msWithTwoPresses: two ? two.sendMs : null,
      secondPress: two && two.secondPress ? two.secondPress.result : null,
      secondPressRestartedTheWait,
      pageChangedAfterConfirmation,
      pass: twoUsable ? !secondPressRestartedTheWait && !pageChangedAfterConfirmation : null,
    },
    successFlowScreens: {
      measured: screens.length,
      withAxeViolations: screens.filter((s) => s.axe.length > 0).map((s) => ({ screen: s.screen, violations: s.axe.map((v) => v.id) })),
      mostTargetsUnder24: most('targetsUnder24'),
      mostTargetsUnder44: most('targetsUnder44'),
    },
    harnessSelfCheck: { ok: problems.length === 0, problems },
  };

  fs.writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}

function printSummary(result) {
  const s = result.viewports['1280'];
  const line = (k, v) => console.log(`  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  console.log(`Build ${result.label}: ${result.bytes} bytes; Playwright ${result.harness.playwright}, axe-core ${result.harness.axeCore}, Chromium ${result.harness.chromium}`);
  for (const [id, flow] of Object.entries(result.flows)) line(`flow ${id}`, flow.end ? `${flow.end.stoppedBecause}; ${flow.end.steps} presses: ${flow.log.filter((l) => l.clicked).map((l) => l.clicked).join(' > ')}` : flow.error);
  line('empty-topic probe', result.flows.success && result.flows.success.probedEmpty);
  line('checks', result.checks);
  line('axe, home 1280', s.axe.map((v) => `${v.id}(${v.impact},${v.nodes})`));
  line('axe, failure screen', (result.axeFailure || []).map((v) => `${v.id}(${v.impact},${v.nodes})`));
  line('distinct values, home 1280', s.census.distinct);
  line('keyboard, home 1280', s.keyboard);
  line('targets, home 375', { under24: result.viewports['375'].structure.targetsUnder24, under44: result.viewports['375'].structure.targetsUnder44, which: result.viewports['375'].structure.smallTargets });
  line('reflow at 320', result.reflow320);
  line('refresh', result.refresh);
  line('external requests', result.externalRequests.length);
}

// ---------------------------------------------------------------------------------------------
// The results table
// ---------------------------------------------------------------------------------------------

// Print the "Measured" tables of phase0/RESULTS.md from two metrics.json files. Every cell comes
// from a recorded value, so the table cannot say more than the data. Paste the output; do not edit it.
function printTable(a, b) {
  for (const m of [a, b]) {
    if (!m.harness || m.harness.version !== HARNESS_VERSION) throw new Error(`metrics for "${m.label}" were not written by harness version ${HARNESS_VERSION}`);
  }
  const yes = (v) => (v === true ? 'yes' : v === false ? 'no' : 'not checked');
  const seconds = (ms) => (ms === null || ms === undefined ? 'no time recorded' : (ms / 1000).toFixed(1) + ' s');
  const axe = (list) => (list.length === 0 ? '0' : list.length + ': ' + list.map((v) => `\`${v.id}\` (${v.impact}, ${v.nodes} ${v.nodes === 1 ? 'element' : 'elements'})`).join('; '));
  const px = (t) => `"${t.label}" (${t.width} × ${t.height} px)`;
  const when = (iso) => iso.slice(0, 10) + ' ' + iso.slice(11, 16) + ' UTC';
  const mostOn = (m, key) => { const t = m.checks.successFlowScreens[key]; const n = m.checks.successFlowScreens.measured; return t.onScreens.length === n ? `${t.count} (on each of the ${n} screens)` : `${t.count} (on ${t.onScreens.map((s) => `"${s}"`).join(' and ')})`; };
  const both = (o) => { const v = Object.values(o); return v.every((x) => x === v[0]) ? yes(v[0]) : Object.entries(o).map(([k, x]) => `${k}: ${yes(x)}`).join('; '); };
  const failure = (flow) => (flow.end.failureCopy && flow.end.alternativesVisible && flow.end.addressVisible && !flow.end.reachedSuccess ? 'yes' : `failure message: ${yes(flow.end.failureCopy)}; phone number: ${yes(flow.end.alternativesVisible)}; address: ${yes(flow.end.addressVisible)}`);
  const census = (m, key) => { const at = (w) => m.viewports[w].census.distinct[key]; return at('768') === at('1280') && at('375') === at('1280') ? String(at('1280')) : `${at('1280')} (768 px: ${at('768')}; 375 px: ${at('375')})`; };
  const out = [];
  const head = () => out.push('| Check | A (vague) | B (Prescription) |', '|---|---|---|');
  const row = (label, cell) => out.push(`| ${label} | ${cell(a)} | ${cell(b)} |`);

  out.push(`The harness printed these tables from the two \`metrics.json\` files (Build A measured ${when(a.harness.ranAt)}; Build B measured ${when(b.harness.ranAt)}).`, '', '**The flow** (walked at 375 px wide)', '');
  head();
  row('Success flow: the walk ends on the confirmation screen', (m) => `${yes(m.flows.success.end.reachedSuccess)} (${m.flows.success.end.steps} presses)`);
  row('Server-error flow: the failure message shows, with the clinic\'s phone number and address on the same screen', (m) => failure(m.flows['server-error']));
  row('Offline flow: the same', (m) => failure(m.flows.offline));
  row('After each failure, the help topic, first name, and phone number that the harness entered are still on the screen', (m) => both(m.checks.answersKeptAfterFailure));
  row('After each failure, one press of the build\'s own retry control reaches the confirmation, which shows the same three answers', (m) => both(m.checks.retryAfterFailure));
  row('Slow flow: the walk ends on the confirmation screen', (m) => `${yes(m.flows.slow.end.reachedSuccess)} (${seconds(m.flows.slow.sendMs)} after the send press)`);
  row('Slow flow, send control pressed a second time 1 s into the wait: one confirmation, no restart of the wait, no later change', (m) => { const c = m.checks.slowCompletesOnce; return c.pass === null ? 'not checked' : `${yes(c.pass)} (confirmation after ${seconds(c.msWithTwoPresses)}; second press ${c.secondPress}; page ${c.pageChangedAfterConfirmation ? 'changed' : 'unchanged'} in the next ${m.flows['slow-pressed-twice'].afterConfirmation.watchedMs / 1000} s)`; });
  row('Reload on the topic screen keeps the chosen topic', (m) => yes(m.refresh.kept));
  row('Forward pressed with no topic chosen', (m) => { const p = m.flows.success.probedEmpty; return `${p.stayedOnScreen ? 'stays on the screen' : 'leaves the screen'}; ${p.errorText ? 'adds error text' : 'adds no error text'}; \`role="alert"\`: ${yes(p.alert)}; \`aria-invalid\`: ${p.ariaInvalid}`; });

  out.push('', '**Checks that relate to accessibility**', '');
  head();
  row('axe violations, home screen at 1280 px', (m) => axe(m.viewports['1280'].axe));
  row('axe violations, home screen at 768 px', (m) => axe(m.viewports['768'].axe));
  row('axe violations, home screen at 375 px', (m) => axe(m.viewports['375'].axe));
  row('axe violations on the screens of the success flow (375 px)', (m) => { const s = m.checks.successFlowScreens; const bad = m.flows.success.screens.filter((x) => x.axe.length > 0); return bad.length === 0 ? `0 on ${s.measured} screens` : bad.map((x) => `"${x.screen}": ${axe(x.axe)}`).join('; ') + `; 0 on the other ${s.measured - bad.length} screens`; });
  row('axe violations on the failure screen (server-error flow, 375 px)', (m) => (m.axeFailure.length === 0 ? '0' : `"${m.axeFailureScreen}": ${axe(m.axeFailure)}`));
  row('Tab stops on the home screen with no visible focus indicator (1280 px)', (m) => `${m.viewports['1280'].keyboard.withoutVisibleFocus.length} of ${m.viewports['1280'].keyboard.stops}`);
  row('Sideways scrolling at 320 px (home screen)', (m) => (m.reflow320.overflow ? `yes (the page is ${m.reflow320.scrollWidth} px wide)` : 'none'));
  row('Targets under 24 px, home screen (375 px)', (m) => { const t = m.viewports['375'].structure; const small = t.smallTargets.filter((x) => Math.min(x.width, x.height) < 24); return `${t.targetsUnder24}${small.length ? ': ' + small.map(px).join(', ') : ''}`; });
  row('Targets under 44 px, home screen (375 px)', (m) => { const t = m.viewports['375'].structure; return `${t.targetsUnder44}${t.smallTargets.length ? ': ' + t.smallTargets.map(px).join(', ') : ''}`; });
  row('Most targets under 24 px on one screen of the success flow (375 px)', (m) => mostOn(m, 'mostTargetsUnder24'));
  row('Most targets under 44 px on one screen of the success flow (375 px)', (m) => mostOn(m, 'mostTargetsUnder44'));

  out.push('', '**Style census** (home screen at 1280 px; a note shows where another width differs)', '');
  head();
  row('Distinct text sizes', (m) => census(m, 'fontSize'));
  row('Distinct background colors', (m) => census(m, 'background'));
  row('Distinct corner radii', (m) => census(m, 'radius'));
  row('Distinct shadows', (m) => census(m, 'shadow'));
  row('Font families', (m) => `${census(m, 'fontFamily')} (${m.viewports['1280'].census.values.fontFamily.join(', ')})`);
  row('Icons or images (`svg` and `img` elements)', (m) => String(m.viewports['1280'].structure.svgOrImg));

  out.push('', '**The file**', '');
  head();
  row('File size', (m) => `${m.bytes.toLocaleString('en-US')} bytes`);
  row('Requests to other hosts during the whole run', (m) => String(m.externalRequests.length));
  row('`innerHTML` writes in the source', (m) => String(m.usesInnerHTML));
  row('Inline event handlers (home screen)', (m) => String(m.viewports['1280'].structure.inlineHandlers));
  console.log(out.join('\n'));
}

// ---------------------------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------------------------

(async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--table') {
    if (args.length !== 3) { console.error('usage: node phase0/eval/measure.cjs --table <a/metrics.json> <b/metrics.json>'); process.exit(2); }
    try {
      printTable(JSON.parse(fs.readFileSync(args[1], 'utf8')), JSON.parse(fs.readFileSync(args[2], 'utf8')));
    } catch (e) {
      console.error('Could not print the table: ' + e.message);
      process.exit(1);
    }
    return;
  }
  const [label, htmlPath, outDir] = args;
  if (!label || !htmlPath || !outDir) {
    console.error('usage: node phase0/eval/measure.cjs <label> <index.html> <output-folder>');
    process.exit(2);
  }
  const result = await measure(label, htmlPath, outDir);
  printSummary(result);
  if (!result.checks.harnessSelfCheck.ok) {
    console.error('HARNESS SELF-CHECK FAILED. Do not use these results.\n  ' + result.checks.harnessSelfCheck.problems.join('\n  '));
    process.exit(1);
  }
})();
