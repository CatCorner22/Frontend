// End-to-end tests: they drive the built Studio page in a real browser, the way a person would.
// Run with `npm run e2e` (which builds the page first).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { CITED_NAMES, DIRECTIONS, FONTS, OVERLAYS, RESEARCH_RULES, STEPS, applyDirection, createProject, deriveTokens, findSkin, pick, researchReport, skinParams, skinsOf, tradeWordsOutsideBrackets, tune, vaguePhrasesIn, type Project } from '@refraction/core';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
/** An empty page beside the Studio's page. Every local file shares one storage in this browser, so a test can fill storage here first. */
const blankUrl = new URL('../dist/artifact/blank-for-tests.html', import.meta.url);
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const fixtureV1 = readFileSync(new URL('../../../packages/core/test/fixtures/project-v1-direction.json', import.meta.url), 'utf8');
const LOCAL_KEY = 'refraction.project.v2';
const LEGACY_KEY = 'refraction.project.v1';
const BACKUP_KEY = 'refraction.project.backup';

// A machine whose installed browser is older than this Playwright version names its browser here; CI sets nothing.
const LOCAL_BROWSER = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
let browser: Browser;
beforeAll(async () => {
  writeFileSync(fileURLToPath(blankUrl), '<!doctype html><title>Blank page for tests</title>');
  browser = await chromium.launch(LOCAL_BROWSER);
});
afterAll(async () => {
  await browser.close();
});

/**
 * Every session that a test opens. After each test, none of them may have met an error on the page (a fault that nothing
 * caught, or a message that the page wrote to the browser's error log). Before, only 12 of 56 sessions kept that list and
 * 6 assertions read it, so a test could pass while the page broke (code review of 2026-11-13, the last reviewer's notes).
 */
const sessions: Session[] = [];
afterEach(() => {
  const faults = sessions.flatMap((session) => session.errors);
  sessions.length = 0;
  expect(faults, 'the page met an error during this test').toEqual([]);
});

interface Session {
  context: BrowserContext;
  page: Page;
  errors: string[];
  requests: string[];
}

interface OpenOptions {
  hash?: string;
  viewport?: { width: number; height: number };
  /** Text to place in browser storage before the Studio starts, by key. */
  storage?: Record<string, string>;
  /** A stand-in for the private page's database: the stored document, and whether writes fail. */
  pageDb?: {
    doc: { project: string; savedAt?: string } | null;
    failWrites?: boolean;
    /** Each read answers only after this many milliseconds. */
    getDelay?: number;
    /** The first read fails; later reads answer. */
    firstGetRejects?: boolean;
    /** A write never answers. */
    setHangs?: boolean;
    /** The page has a runtime object, but it lacks the function that hands out the database. */
    noUse?: boolean;
  };
  /** Return as soon as the page's frame is there, without waiting until the saved project is open. */
  dontWaitUntilOpen?: boolean;
}

async function open(options: OpenOptions = {}): Promise<Session> {
  const context = await browser.newContext({ viewport: options.viewport ?? { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('request', (request) => {
    if (!/^(file|data|about|blob):/.test(request.url())) requests.push(request.url());
  });
  // A test can give this browser's storage a fixed capacity (see `fillStorage`). The capacity is itself stored, so it holds after
  // a reload, from before the Studio starts. A write beyond it is refused with the same error that a browser gives when its
  // storage is full.
  await page.addInitScript(() => {
    if (window.top !== window) return;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (this: Storage, key: string, value: string): void {
      const capacity = this === window.localStorage ? window.localStorage.getItem('test.capacity') : null;
      if (capacity !== null && key !== 'test.capacity') {
        let used = 0;
        for (let i = 0; i < this.length; i++) {
          const k = this.key(i)!;
          used += k.length + (this.getItem(k) ?? '').length;
        }
        const old = this.getItem(key);
        const next = used - (old === null ? 0 : key.length + old.length) + key.length + String(value).length;
        if (next > Number(capacity)) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      original.call(this, key, value);
    };
  });
  if (options.storage) {
    // Place the starting data from an empty page, then go to the Studio. An earlier version placed it from a script that ran at
    // the first instant of every load and looked for a "placed already" marker in storage. On a reload, the browser sometimes
    // showed that script an empty storage (4 of 16 trials, 2026-11-13); the script then placed the starting data again and so
    // replaced what the Studio had written. Several tests failed now and then for that reason, and blamed the Studio.
    await page.goto(blankUrl.href);
    await page.evaluate((entries) => {
      for (const [key, value] of Object.entries(entries)) window.localStorage.setItem(key, value);
    }, options.storage);
  }
  if (options.pageDb) {
    await page.addInitScript((db) => {
      if (window.top !== window) return;
      const state = { doc: db.doc as { project: string; savedAt?: string } | null, reads: 0 };
      (window as unknown as Record<string, unknown>)['__pageDb'] = state;
      const later = <T,>(value: () => T, ms: number): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value()), ms));
      (window as unknown as Record<string, unknown>)['claude'] = db.noUse
        ? {}
        : {
            use: (name: string) =>
              Promise.resolve(
                name !== 'db'
                  ? null
                  : {
                      doc: () => ({
                        get: () => {
                          state.reads += 1;
                          if (db.firstGetRejects && state.reads === 1) return Promise.reject(new Error('read refused'));
                          return later(() => ({ exists: state.doc !== null, data: () => state.doc ?? undefined }), db.getDelay ?? 0);
                        },
                        set: (data: { project: string; savedAt: string }) => {
                          if (db.setHangs) return new Promise<void>(() => undefined);
                          if (db.failWrites) return Promise.reject(new Error('write refused'));
                          state.doc = data;
                          return Promise.resolve();
                        },
                      }),
                    },
              ),
          };
    }, options.pageDb);
  }
  await page.goto(pageUrl + (options.hash ?? ''));
  await page.waitForSelector('.top');
  if (!options.dontWaitUntilOpen) await page.waitForFunction(() => !document.querySelector('.loading'));
  const session: Session = { context, page, errors, requests };
  sessions.push(session);
  return session;
}

const envelope = (project: unknown, savedAt = '2026-11-13T10:00:00.000Z'): string => JSON.stringify({ savedAt, project });
/** The project in the browser copy, or null. */
const stored = (page: Page): Promise<Project | null> =>
  page.evaluate((key) => (JSON.parse(window.localStorage.getItem(key) ?? 'null') as { project: Project } | null)?.project ?? null, LOCAL_KEY);
const rawStored = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => window.localStorage.getItem(k), key);
/** Every copy the Studio kept, newest first. */
const keptCopies = (page: Page): Promise<{ why: string; text: string; key?: string; state?: string }[]> =>
  page.evaluate((base) => {
    // Each kept copy has a storage entry of its own (a first line with time and reason, then the text). An earlier form held one list.
    const own: { why: string; text: string; key: string; state?: string }[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)!;
      if (!key.startsWith(`${base}.`)) continue;
      const raw = window.localStorage.getItem(key)!;
      const end = raw.indexOf('\n');
      const head = JSON.parse(raw.slice(0, end)) as { why: string; state?: string };
      own.push({ key, why: head.why, text: raw.slice(end + 1), ...(head.state ? { state: head.state } : {}) });
    }
    own.sort((a, b) => b.key.localeCompare(a.key));
    // The earlier list is read the way the Studio reads it: a member, or a whole content, that is not a kept copy counts as one copy.
    let listed: { why: string; text: string }[] = [];
    const rawList = window.localStorage.getItem(base);
    if (rawList) {
      try {
        const parsed = JSON.parse(rawList) as unknown;
        listed = (Array.isArray(parsed) ? parsed : [parsed]).map((member: unknown) => {
          const record = member as { why?: unknown; text?: unknown } | null;
          return record && typeof record === 'object' && typeof record.text === 'string' ? { why: String(record.why ?? ''), text: record.text } : { why: '', text: typeof member === 'string' ? member : JSON.stringify(member) };
        });
      } catch {
        listed = [{ why: '', text: rawList }];
      }
    }
    return [...own, ...listed];
  }, BACKUP_KEY);
/** Take every kept copy away, in both forms. */
const clearKeptCopies = (page: Page): Promise<void> =>
  page.evaluate((base) => {
    for (const key of Object.keys(window.localStorage)) if (key === base || key.startsWith(`${base}.`)) window.localStorage.removeItem(key);
  }, BACKUP_KEY);
/**
 * Make this browser's storage full, with `spare` characters free: from now on, and after a reload, a write beyond that is refused.
 * Returns true when a write that is larger than the spare room is indeed refused.
 *
 * Why the tests do not write five megabytes for this. They did, until 2026-11-13: fill the real storage, then reload. In 5 of 20
 * trials the browser dropped the filler on the reload, storage was not full, and the test failed for a reason of its own (it
 * waited for a button that, correctly, was not there). `fillRealStorage` still fills the real storage, for a test that does not reload.
 */
const fillStorage = (page: Page, spare: number): Promise<boolean> =>
  page.evaluate((room) => {
    const store = window.localStorage;
    let used = 'test.capacity'.length + 12;
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i)!;
      if (k !== 'test.capacity') used += k.length + (store.getItem(k) ?? '').length;
    }
    store.setItem('test.capacity', String(used + room).padStart(12, '0'));
    try {
      store.setItem('test.probe', 'x'.repeat(room + 1));
      store.removeItem('test.probe');
      return false;
    } catch {
      return true;
    }
  }, spare);
/** Fill the browser's real storage until only about `spare` characters are free. Not reliable across a reload (see `fillStorage`). */
const fillRealStorage = (page: Page, spare: number): Promise<number> =>
  page.evaluate((room) => {
    let low = 0;
    let high = 12_000_000;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      try {
        window.localStorage.setItem('filler', 'x'.repeat(middle));
        low = middle;
      } catch {
        high = middle - 1;
      }
    }
    window.localStorage.setItem('filler', 'x'.repeat(Math.max(0, low - room)));
    return low;
  }, spare);
const mainButton = (page: Page): Promise<string> => page.locator('.actions.sticky .primary').innerText();
const settle = (page: Page): Promise<void> => page.waitForTimeout(700);

async function waitForStep(page: Page, name: string): Promise<void> {
  await page.waitForFunction((wanted) => document.querySelector('.cards legend')?.textContent?.startsWith(wanted) ?? false, name);
}

/** Where keyboard focus is, and whether a person can see it. */
const focusState = (page: Page): Promise<{ id: string; tag: string; text: string; visible: boolean } | null> =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    // A card's radio input is visually hidden; the card shows the ring. The large preview shows its ring on the pane around it.
    const shown = (el.closest('.option') as HTMLElement | null) ?? (el.closest('.large-preview') as HTMLElement | null) ?? el;
    const style = getComputedStyle(shown);
    return { id: el.id, tag: el.tagName.toLowerCase(), text: (el.textContent ?? '').trim().slice(0, 60), visible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2 };
  });

const aurora = DIRECTIONS.find((d) => d.id === 'midnight-aurora')!;
const worked = (name: string): Project => pick(applyDirection(createProject(name), 'paper-and-ink'), 'nav', 'side-rail', '2026-11-13T09:00:00.000Z');

describe('Studio: first screen', () => {
  it('opens on the Directions with working, sandboxed pictures, no errors, and no outside request', async () => {
    const { context, page, errors, requests } = await open();
    await page.waitForSelector('.direction iframe');
    expect(await page.locator('.direction').count()).toBe(38);
    const sandboxes = await page.locator('iframe').evaluateAll((frames) => frames.map((f) => f.getAttribute('sandbox')));
    // An empty sandbox attribute applies every restriction: no scripts, no same-origin access, no forms, no popups.
    expect(sandboxes.length).toBeGreaterThan(0);
    expect(sandboxes.every((value) => value === '')).toBe(true);
    expect(await page.locator('[role="alert"]').count()).toBe(0);
    // The first screen says what the Studio is, what the person leaves with, and how many Steps follow.
    const intro = await page.locator('.intro').innerText();
    expect(intro).toContain('how a website looks and feels');
    expect(intro).toContain(`${STEPS.length} short Steps`);
    expect(intro).toContain('made-up dental practice');
    expect(await page.locator('.save-state').innerText()).toBe('Nothing to save yet');
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  });

  it('keeps generated Directions while the person moves around, and describes each one in a sentence', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Show me six more Directions' }).click();
    await expect.poll(() => page.locator('.direction').count()).toBe(DIRECTIONS.length + 6);
    const moods = await page.locator('.direction .mood').allInnerTexts();
    for (const mood of moods.slice(38)) expect(mood).toMatch(/^A (light|dark) page .+\.$/);
    await page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await page.waitForSelector('.summary');
    await page.locator('.top-nav a', { hasText: 'Directions' }).click();
    await page.waitForSelector('.direction');
    expect(await page.locator('.direction').count()).toBe(DIRECTIONS.length + 6);
    await context.close();
  });
});

describe('Studio: the Step flow keeps the design the person chose', () => {
  it('keeps every value of a dark Direction when the main button is pressed on all Steps (findings FTU-02, P-04)', async () => {
    const { context, page, errors, requests } = await open();
    await page.getByRole('button', { name: 'Start from Midnight Aurora' }).click();
    const labels: string[] = [];
    for (const step of STEPS) {
      await waitForStep(page, step.name);
      const label = await mainButton(page);
      labels.push(label);
      // The Step opens on the design as it stands, so the main button offers to keep it.
      expect(label, step.id).toMatch(/^Keep /);
      expect(await page.locator('.option[data-shown][data-in-use]').count(), step.id).toBe(1);
      expect(await page.locator('.option[data-in-use]').count(), step.id).toBe(1);
      await page.locator('.actions.sticky .primary').click();
    }
    // After the last Step come the Overlays; their main button leads to the Summary.
    await page.waitForSelector('.overlay-list');
    await page.locator('.actions.sticky .primary').click();
    await page.waitForSelector('.summary');
    await settle(page);
    const project = (await stored(page))!;
    expect(project.params).toEqual(aurora.params);
    expect(project.direction).toBe('midnight-aurora');
    expect(Object.keys(project.decisions)).toHaveLength(STEPS.length);
    expect(Object.values(project.decisions).every((d) => d.kind === 'kept')).toBe(true);
    expect(labels.filter((l) => l === 'Keep “Your design now” and continue').length).toBeGreaterThan(3);
    expect(await page.locator('.summary-main').innerText()).toContain(`You have decided ${STEPS.length} of ${STEPS.length} Steps`);
    expect(errors).toEqual([]);
    // The walk through every Step asked no outside address for anything.
    expect(requests).toEqual([]);
    await context.close();
  });

  it('"Decide later" changes nothing and records nothing (finding FTU-03)', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await waitForStep(page, 'Menu (navigation)');
    await page.getByRole('button', { name: 'Decide later' }).click();
    await waitForStep(page, 'First screen');
    await page.getByRole('button', { name: 'Decide later' }).click();
    await waitForStep(page, 'List of services');
    await settle(page);
    const project = (await stored(page))!;
    expect(project.decisions).toEqual({});
    expect(project.params).toEqual(DIRECTIONS.find((d) => d.id === 'soft-daylight')!.params);
    await context.close();
  });

  it('a slider changes only its own value, and the main button keeps the adjustment (findings FTU-05, FTU-06)', async () => {
    const { context, page } = await open({ hash: '#accent', storage: { [LOCAL_KEY]: envelope(applyDirection(createProject('Sliders'), 'soft-daylight')) } });
    await waitForStep(page, 'Main color');
    // Look at another card first; the slider must still start from the design as it stands.
    await page.locator('label.option', { hasText: 'Dark purple' }).click();
    await page.locator('details.tune summary').click();
    await page.locator('#tune-accentHue').focus();
    await page.keyboard.press('ArrowRight');
    await settle(page);
    let project = (await stored(page))!;
    expect(project.params).toMatchObject({ accentHue: 257, accentChroma: 0.19, accentLightness: 0.55 });
    expect(project.decisions['accent']).toMatchObject({ kind: 'tuned', optionId: null });
    expect(await page.locator('.option[data-in-use] .option-title').innerText()).toContain('Your design now');
    expect(await mainButton(page)).toBe('Continue to the next Step');
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'Amount of color');
    await settle(page);
    project = (await stored(page))!;
    expect(project.params.accentHue).toBe(257);
    await page.getByRole('button', { name: 'Undo' }).click();
    await settle(page);
    expect((await stored(page))!.params.accentHue).toBe(256);
    await context.close();
  });

  it('says so when the person leaves a Step with a card on show that was not picked (finding FTU-30)', async () => {
    const { context, page } = await open({ hash: '#nav' });
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('label.option', { hasText: 'Links in a left column' }).click();
    expect(await mainButton(page)).toBe('Pick “Links in a left column” and continue');
    await page.locator('.rail a[href="#hero"]').click();
    await waitForStep(page, 'First screen');
    expect(await page.locator('.banner').innerText()).toContain('On the Step “Menu (navigation)” you looked at “Links in a left column” but did not pick it. Your design did not change.');
    await settle(page);
    expect((await stored(page))?.decisions ?? {}).toEqual({});
    await context.close();
  });

  it('offers small variations that keep the original as the first card and return to where the person was (finding FTU-23)', async () => {
    const { context, page } = await open({ hash: '#accent' });
    await waitForStep(page, 'Main color');
    await page.locator('label.option', { hasText: 'Deep red' }).click();
    await page.getByRole('button', { name: 'Show small variations of “Deep red”' }).click();
    const titles = await page.locator('.option .option-title').allInnerTexts();
    expect(titles[0]).toContain('Starting point');
    expect(titles.join(' | ')).toMatch(/Color \(hue\): a little toward (orange|pink)/);
    expect(titles.join(' | ')).not.toMatch(/: (less|more)(\s|$)/);
    await page.getByRole('button', { name: 'Back to the standard Options' }).click();
    expect(await page.locator('.option[data-shown] .option-title').innerText()).toContain('Deep red');
    await context.close();
  });
});

describe('Studio: keyboard', () => {
  it('can be used from the first screen to the Summary with the keyboard alone, with focus visible at every stop', async () => {
    const { context, page, errors, requests } = await open();
    const seen: string[] = [];
    const tabTo = async (match: (f: { id: string; text: string }) => boolean, limit = 60): Promise<number> => {
      for (let presses = 1; presses <= limit; presses++) {
        await page.keyboard.press('Tab');
        const f = await focusState(page);
        if (!f) throw new Error(`After Tab number ${presses}, focus was nowhere. Earlier stops: ${seen.slice(-4).join(' | ')}`);
        seen.push(`${f.tag}:${f.text}`);
        expect(f.visible, `no visible focus on ${f.tag} "${f.text}"`).toBe(true);
        if (match(f)) return presses;
      }
      throw new Error(`Focus never reached the wanted control. Last stops: ${seen.slice(-5).join(' | ')}`);
    };
    await tabTo((f) => f.text === 'Start from Graphite Precision');
    await page.keyboard.press('Enter');
    await waitForStep(page, 'Menu (navigation)');
    // Focus lands on the card on show; number keys compare, and focus follows the card.
    expect((await focusState(page))?.id).toBe('option-split-cta');
    await page.keyboard.press('4');
    expect((await focusState(page))?.id).toBe('option-side-rail');
    expect(await page.locator('.option[data-shown]').count()).toBe(1);
    // Enter picks the card on show and opens the next Step, with focus on its card.
    await page.keyboard.press('Enter');
    await waitForStep(page, 'First screen');
    expect((await focusState(page))?.id).toMatch(/^option-/);
    // The main button is one or two Tab presses from the cards.
    expect(await tabTo((f) => f.text.includes('and continue'))).toBeLessThanOrEqual(2);
    await page.keyboard.press('Enter');
    await waitForStep(page, 'List of services');
    // After the main button, focus moves to the new Step's card, so a second Enter on the old button cannot decide an unseen Step.
    expect((await focusState(page))?.id).toMatch(/^option-/);
    await page.keyboard.press('ArrowDown');
    expect(await mainButton(page)).toMatch(/^(Pick|Keep) /);
    await page.locator('.top-nav a', { hasText: 'Summary' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('.summary');
    expect(await tabTo((f) => f.text === 'Download the project file', 20)).toBeLessThanOrEqual(3);
    await settle(page);
    expect((await stored(page))!.decisions['nav']).toMatchObject({ kind: 'picked', optionId: 'side-rail' });
    expect(errors).toEqual([]);
    // The walk through every Step asked no outside address for anything.
    expect(requests).toEqual([]);
    await context.close();
  });

  it('treats the list of Steps as one stop for the Tab key, with arrow keys inside', async () => {
    const { context, page } = await open({ hash: '#typeface' });
    await waitForStep(page, 'Letter style (typeface)');
    expect(await page.locator('.rail a[tabindex="0"]').count()).toBe(1);
    await page.locator('.rail a[tabindex="0"]').focus();
    await page.keyboard.press('ArrowDown');
    expect((await focusState(page))?.text).toContain('Heading style');
    // From the top bar to the cards: one stop for the list of Steps, the controls above the preview, then the jump past the preview.
    let presses = 0;
    await page.locator('#a11y-profile').focus();
    for (; presses < 30; presses++) {
      await page.keyboard.press('Tab');
      if ((await focusState(page))?.text === 'Jump past the preview to the cards') break;
    }
    expect(presses).toBeLessThan(10);
    await page.keyboard.press('Enter');
    expect((await focusState(page))?.id).toMatch(/^option-/);
    await context.close();
  });

  it('keeps number keys working after the other controls were used, and ignores them while the person types', async () => {
    const { context, page } = await open({ hash: '#nav' });
    await waitForStep(page, 'Menu (navigation)');
    await page.selectOption('#preview-region', 'top');
    await page.keyboard.press('3');
    expect(await mainButton(page)).toContain('Links centered, button right');
    await page.locator('#wireframe-toggle').focus();
    await page.keyboard.press('2');
    expect(await mainButton(page)).toContain('Name centered, links below');
    await page.locator('#project-name').focus();
    await page.keyboard.press('4');
    expect(await mainButton(page)).toContain('Name centered, links below');
    await context.close();
  });
});

describe('Studio: saved work is never replaced without a word', () => {
  it('opens a saved project and returns to its first open Step', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Weeks of work')) } });
    await waitForStep(page, 'First screen');
    expect(await page.locator('#project-name').inputValue()).toBe('Weeks of work');
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('never overwrites a saved project that it cannot read, and offers it as a download (findings SEC-03, P-05)', async () => {
    const cases: Record<string, string> = {
      'a newer version': envelope({ ...worked('Weeks of work'), schemaVersion: 99 }),
      'one value out of range': envelope({ ...worked('Weeks of work'), params: { ...worked('x').params, radius: 1000 } }),
      'a record that is cut off': envelope(worked('Weeks of work')).slice(0, 400),
    };
    for (const [label, text] of Object.entries(cases)) {
      const { context, page } = await open({ storage: { [LOCAL_KEY]: text } });
      const banner = page.locator('.banner');
      await banner.waitFor();
      expect(await banner.innerText(), label).toContain('Your saved project could not be read');
      expect(await banner.getByRole('button', { name: 'Download the unreadable copy' }).count(), label).toBe(1);
      expect(await banner.getByRole('button', { name: 'Dismiss' }).count(), label).toBe(0);
      // The person works on; nothing is saved over the unreadable copy.
      await page.locator('#project-name').fill('Something new');
      await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
      await settle(page);
      expect(await rawStored(page, LOCAL_KEY), label).toBe(text);
      expect(await page.locator('.save-state').innerText(), label).toBe('Not saving: see the notice at the top of the page');
      // After the person decides, the unreadable copy sits in the backup slot and saving resumes.
      await page.locator('.banner').getByRole('button', { name: /^Start a new project/ }).click();
      await page.locator('#project-name').fill('Something newer');
      await settle(page);
      expect((await stored(page))?.name, label).toBe('Something newer');
      expect((await keptCopies(page))[0]!.text.length, label).toBeGreaterThan(100);
      await context.close();
    }
  });

  it('upgrades a project saved by version 1 of the Studio, with the design unchanged (finding M-07)', async () => {
    const { context, page } = await open({ storage: { [LEGACY_KEY]: fixtureV1 } });
    await page.waitForSelector('.cards');
    expect(await page.locator('#project-name').inputValue()).toBe('Harbor Street Dental');
    expect(await page.locator('.rail-direction strong').innerText()).toBe('Midnight Aurora');
    await page.locator('#project-name').fill('Harbor Street Dental 2');
    await settle(page);
    const project = (await stored(page))!;
    expect(project.schemaVersion).toBe(2);
    expect(project.params).toEqual((JSON.parse(fixtureV1) as Project).params);
    // The version-1 copy is left where it was.
    expect(await rawStored(page, LEGACY_KEY)).toBe(fixtureV1);
    await context.close();
  });

  it('opens the newer of the two saved copies, whichever store holds it (finding SEC-02)', async () => {
    const older = worked('Old copy from last week');
    const newer = worked('Weeks of work');
    for (const failWrites of [false, true]) {
      const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(newer, '2026-11-13T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(older), savedAt: '2026-11-06T10:00:00.000Z' }, failWrites } });
      await page.waitForSelector('.cards');
      expect(await page.locator('#project-name').inputValue()).toBe('Weeks of work');
      expect(await page.locator('.banner').innerText()).toContain('differed');
      await context.close();
    }
    const s2 = await open({ storage: { [LOCAL_KEY]: envelope(older, '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(newer), savedAt: '2026-11-13T10:00:00.000Z' } } });
    await s2.page.waitForSelector('.cards');
    expect(await s2.page.locator('#project-name').inputValue()).toBe('Weeks of work');
    expect((await keptCopies(s2.page))[0]!.text).toContain('Old copy from last week');
    await s2.context.close();
  });

  it('never replaces a copy it kept earlier: each new kept copy joins the others (finding S2-01)', async () => {
    const older = worked('Old copy from last week');
    const newer = worked('Weeks of work');
    // An earlier version of the Studio stored one kept copy, as a single record.
    const earlier = JSON.stringify({ keptAt: '2026-11-01T08:00:00.000Z', why: 'A saved copy that could not be read.', text: '{"schemaVersion":3,"name":"work from a newer Studio"}' });
    // Case 1: two readable copies differ. The older one is kept, next to the earlier kept copy.
    const one = await open({ hash: '#summary', storage: { [BACKUP_KEY]: earlier, [LOCAL_KEY]: envelope(older, '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(newer), savedAt: '2026-11-13T10:00:00.000Z' } } });
    await one.page.waitForSelector('.summary');
    const afterOne = (await keptCopies(one.page)).map((copy) => copy.text);
    expect(afterOne.some((text) => text.includes('work from a newer Studio'))).toBe(true);
    expect(afterOne.some((text) => text.includes('Old copy from last week'))).toBe(true);
    // The Summary lists both, each with its own download.
    expect(await one.page.locator('.kept-copies li').count()).toBe(2);
    expect(await one.page.getByRole('button', { name: 'Download this kept copy' }).count()).toBe(2);
    // Removing a kept copy takes two deliberate presses, and removes only that copy.
    await one.page.getByRole('button', { name: 'Remove this kept copy…' }).first().click();
    expect((await keptCopies(one.page)).length).toBe(2);
    await one.page.getByRole('button', { name: 'Yes, remove it for good' }).click();
    expect((await keptCopies(one.page)).map((copy) => copy.text).join(' ')).toContain('work from a newer Studio');
    expect((await keptCopies(one.page)).length).toBe(1);
    await one.context.close();
    // Case 2: the stored copy cannot be read. It is kept, next to the earlier kept copy.
    const two = await open({ storage: { [BACKUP_KEY]: earlier, [LOCAL_KEY]: '{"savedAt":"x","project":{"schemaVersion":2}}' } });
    await two.page.locator('.banner').waitFor();
    const afterTwo = (await keptCopies(two.page)).map((copy) => copy.text);
    expect(afterTwo.some((text) => text.includes('work from a newer Studio'))).toBe(true);
    expect(afterTwo.length).toBe(2);
    await two.context.close();
    // Case 3: content in the kept-copy store that this version cannot interpret is itself kept, not thrown away.
    const three = await open({ storage: { [BACKUP_KEY]: 'not a record at all', [LOCAL_KEY]: '{"savedAt":"x","project":{"schemaVersion":2}}' } });
    await three.page.locator('.banner').waitFor();
    expect((await keptCopies(three.page)).map((copy) => copy.text)).toContain('not a record at all');
    await three.context.close();
  });

  it('asks once more before it replaces a project whose copy it cannot keep, because storage is full (finding S3-01)', async () => {
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await page.waitForSelector('.summary');
    expect(await fillStorage(page, 200)).toBe(true);
    const dialog = page.locator('dialog[open]');
    // First the usual question, then a second one that says the copy could not be kept.
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    await dialog.getByRole('button', { name: 'Yes, clear this project' }).click();
    await expect.poll(() => dialog.innerText()).toContain('The Studio could not keep a copy of your project');
    expect(await dialog.innerText()).toContain('storage is full');
    await dialog.getByRole('button', { name: 'Keep my project' }).click();
    await settle(page);
    // Nothing was replaced, and nothing claims that a copy exists.
    expect((await stored(page))!.name).toBe('Weeks of work');
    expect(await keptCopies(page)).toEqual([]);
    // The same holds for a start from another Direction.
    await page.evaluate(() => { window.location.hash = '#directions'; });
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await dialog.getByRole('button', { name: 'Start again' }).click();
    await expect.poll(() => dialog.innerText()).toContain('The Studio could not keep a copy of your project');
    await dialog.getByRole('button', { name: 'Keep my project' }).click();
    await settle(page);
    expect((await stored(page))!.direction).toBe('paper-and-ink');
    // Going on is the person's explicit, second choice.
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.summary');
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    await dialog.getByRole('button', { name: 'Yes, clear this project' }).click();
    await dialog.getByRole('button', { name: 'Replace it without a kept copy' }).click();
    await settle(page);
    expect((await stored(page))!.name).toBe('My project');
    await context.close();
  });

  it('stops saving at opening when it cannot keep a copy that a save would replace, until the person decides (finding S3-01)', async () => {
    const older = worked('Old copy from last week');
    const newer = worked('Weeks of work');
    // Two readable copies differ, and storage has no room to keep the older one. The filler key takes the room before the Studio starts.
    const session = await open({ storage: { [LOCAL_KEY]: envelope(older, '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(newer), savedAt: '2026-11-13T10:00:00.000Z' } } });
    await session.page.waitForSelector('.cards');
    // The first opening had room and kept the older copy. Take that copy away, fill the storage, and open again.
    await clearKeptCopies(session.page);
    await session.page.evaluate(([key, text]) => window.localStorage.setItem(key!, text!), [LOCAL_KEY, envelope(older, '2026-11-06T10:00:00.000Z')]);
    await fillStorage(session.page, 200);
    await session.page.reload();
    const banner = session.page.locator('.banner.hold');
    await banner.waitFor();
    expect(await banner.innerText()).toContain('could not keep that copy');
    expect(await banner.innerText()).toContain('It has stopped saving');
    expect(await banner.getByRole('button', { name: 'Download the older copy' }).count()).toBe(1);
    expect(await session.page.locator('.save-state').innerText()).toBe('Not saving: see the notice at the top of the page');
    // Work goes on, and the older copy in this browser is not replaced.
    await session.page.locator('#project-name').fill('Weeks of work, renamed');
    await settle(session.page);
    expect((await stored(session.page))!.name).toBe('Old copy from last week');
    // An Undo and a look at the Summary do not remove the notice or its buttons (campaign 4, finding F-1).
    // A pause ends a run of typing, so the next typing is an Undo step of its own, and Undo takes back only that step.
    await session.page.waitForTimeout(1600);
    await session.page.locator('#project-name').fill('Weeks of work, renamed twice');
    await session.page.locator('.top').getByRole('button', { name: 'Undo', exact: true }).click();
    await session.page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await session.page.waitForSelector('.summary');
    expect(await session.page.locator('.banner.hold').getByRole('button', { name: 'Go on: let the Studio save over it' }).count()).toBe(1);
    // After the person says so, saving resumes, and the work done during the pause is saved at once.
    await banner.getByRole('button', { name: 'Go on: let the Studio save over it' }).click();
    await settle(session.page);
    expect((await stored(session.page))!.name).toBe('Weeks of work, renamed');
    await session.page.locator('#project-name').fill('Weeks of work, renamed again');
    await settle(session.page);
    expect((await stored(session.page))!.name).toBe('Weeks of work, renamed again');
    await session.context.close();
  });

  it('really replaces an unreadable copy once the person chooses to discard it, even when storage is full (finding S3-02)', async () => {
    const garbage = `not a project at all ${'y'.repeat(8000)}`;
    const { context, page } = await open({ storage: { [LOCAL_KEY]: garbage } });
    await page.locator('.banner').waitFor();
    // The first opening had room and kept the unreadable text. Take that copy away, fill the storage, and open again.
    await clearKeptCopies(page);
    await fillStorage(page, 100);
    await page.reload();
    const banner = page.locator('.banner');
    await banner.waitFor();
    await banner.getByRole('button', { name: 'Start a new project and discard the unreadable copy' }).click();
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await settle(page);
    // The person chose to discard: the next save replaces the unreadable text, and the Studio says that it saved.
    expect((await stored(page))?.direction).toBe('ember-noir');
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('hands over a kept copy character for character, and removes exactly one copy (findings S3-03, S3-04, S3-05)', async () => {
    const odd = '{"from":"another tool","project":{"only":"this part"},"notes":"keep me"}';
    const twin = { keptAt: '2026-11-01T08:00:00.000Z', why: 'A saved copy that could not be read.', text: 'the same text twice' };
    // The store holds a copy with extra fields, two identical copies, and one list member that is not a kept copy at all.
    const seeded = JSON.stringify([{ keptAt: '2026-11-02T08:00:00.000Z', why: 'A saved copy that could not be read.', text: odd }, twin, twin, { some: 'other shape' }]);
    const { context, page } = await open({ hash: '#summary', storage: { [BACKUP_KEY]: seeded, [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await page.waitForSelector('.summary');
    // Nothing is dropped: four members, four copies.
    expect(await page.locator('.kept-copies li').count()).toBe(4);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download this kept copy' }).first().click()]);
    expect(download.suggestedFilename()).toBe('refraction-kept-copy-1.json');
    expect(readFileSync((await download.path())!, 'utf8')).toBe(odd);
    // Removing one of the two identical copies leaves the other.
    await page.locator('.kept-copies li').nth(1).getByRole('button', { name: 'Remove this kept copy…' }).click();
    await page.getByRole('button', { name: 'Yes, remove it for good' }).click();
    const left = await keptCopies(page);
    expect(left.length).toBe(3);
    expect(left.filter((copy) => copy.text === 'the same text twice').length).toBe(1);
    expect(left.some((copy) => copy.text === '{"some":"other shape"}')).toBe(true);
    // A new kept copy joins a store that already holds three: all four are there afterward (finding T3-04).
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    await page.locator('dialog[open]').getByRole('button', { name: 'Yes, clear this project' }).click();
    await settle(page);
    const four = await keptCopies(page);
    expect(four.length).toBe(4);
    expect(four[0]!.text).toContain('Weeks of work');
    for (const copy of left) expect(four.some((kept) => kept.text === copy.text), copy.text.slice(0, 40)).toBe(true);
    expect(await page.locator('.kept-copies li').count()).toBe(0);
    await context.close();
  });

  it('keeps a notice in view on a phone, so that Undo is seen to work (finding U3-01)', async () => {
    const { context, page } = await open({ viewport: { width: 375, height: 800 }, hash: '#nav', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('label.option', { hasText: 'Name left, links right' }).click();
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'First screen');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    const banner = page.locator('.banner');
    await banner.waitFor();
    expect(await banner.innerText()).toContain('Undone: the Step “Menu (navigation)” is back to how it was.');
    // However far down the page the person is, the notice and its button stay on the screen.
    for (const down of [400, 1200, 2400]) {
      await page.evaluate((y) => window.scrollTo(0, y), down);
      expect(await page.evaluate(() => window.scrollY), `scrolled to ${down}`).toBeGreaterThan(200);
      const box = (await banner.boundingBox())!;
      expect(box.y, `top of the notice at ${down}`).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, `bottom of the notice at ${down}`).toBeLessThanOrEqual(800);
    }
    await banner.getByRole('button', { name: 'Go to “Menu (navigation)”' }).click();
    await waitForStep(page, 'Menu (navigation)');
    await context.close();
  });

  it('offers the “Second color” slider only while the page has a second color, and explains a color slider in one line (finding U3-06)', async () => {
    const start = worked('Weeks of work');
    expect(start.params.colorStrategy).not.toBe('duo');
    const { context, page } = await open({ hash: '#color-strategy', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(start))) } });
    await waitForStep(page, 'Amount of color');
    // This design has one color: no slider for a second one, and no small variations of a color that is not there.
    expect(await page.locator('details.tune').count()).toBe(0);
    expect(await page.getByRole('button', { name: /^Show small variations/ }).count()).toBe(0);
    await page.locator('label.option', { hasText: 'Two colors: opposites' }).click();
    await page.locator('.actions.sticky .primary').click();
    await page.evaluate(() => { window.location.hash = '#color-strategy'; });
    await waitForStep(page, 'Amount of color');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    expect(await page.getByRole('slider', { name: 'Second color' }).count()).toBe(1);
    const fold = await page.locator('details.tune').innerText();
    expect(fold).toContain('Goes around the color wheel');
    expect(fold).not.toContain('around the\n');
    await context.close();
  });

  it('always shows the measured figure for reading text on the Step about contrast (finding U3-17)', async () => {
    const { context, page } = await open({ hash: '#contrast', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await waitForStep(page, 'Text contrast');
    const figure = async (): Promise<number> => Number(/looking at: ([\d.]+) to 1\. The guideline asks for at least 4\.5 to 1\./.exec(await page.locator('.measure').innerText())?.[1]);
    const first = await figure();
    expect(first).toBeGreaterThan(1);
    // The figure follows the card on show.
    await page.locator('label.option', { hasText: 'Low contrast (soft)' }).click();
    const low = await figure();
    await page.locator('label.option', { hasText: 'High contrast (crisp)' }).click();
    const high = await figure();
    expect(high).toBeGreaterThan(low);
    await context.close();
  });

  it('reads a hand-set value back in words first, with the number in brackets (finding U2-04)', async () => {
    const tuned = tune(worked('Weeks of work'), 'density', 'density', 1.4, '2026-11-13T09:30:00.000Z');
    const { context, page } = await open({ hash: '#density', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(tuned))) } });
    await waitForStep(page, 'Spacing');
    const status = await page.locator('.rail a[aria-current]').innerText();
    expect(status).toMatch(/Set by hand, close to “(Roomy|Very roomy)”: spacing (a little|clearly) looser \(1\.4\)/);
    await context.close();
  });

  it('names each slider for a screen reader, and Undo says what it undid and where (findings U2-05, U2-07)', async () => {
    const { context, page } = await open({ hash: '#heading-treatment', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await waitForStep(page, 'Heading style');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    expect(await page.getByRole('slider', { name: 'Thickness of the letters' }).count()).toBe(1);
    expect(await page.getByRole('slider', { name: 'Letter spacing' }).count()).toBe(1);
    // Pick an Option, which moves on to the next Step; then undo from there.
    await page.locator('label.option', { hasText: 'Thin and elegant' }).click();
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'Text size');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    const banner = page.locator('.banner');
    await banner.waitFor();
    expect(await banner.innerText()).toContain('Undone: the Step “Heading style” is back to how it was.');
    await banner.getByRole('button', { name: 'Go to “Heading style”' }).click();
    await waitForStep(page, 'Heading style');
    await context.close();
  });

  it('keeps the project that "Start again" replaces, so that it survives a reload (finding U2-01)', async () => {
    const { context, page } = await open({ hash: '#directions', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    const dialog = page.locator('dialog[open]');
    await dialog.waitFor();
    // The dialog no longer promises more than Undo can do.
    expect(await dialog.innerText()).toContain('until you close or reload this page');
    await dialog.getByRole('button', { name: 'Start again' }).click();
    await settle(page);
    expect((await stored(page))!.direction).toBe('ember-noir');
    // The notice of the action is on the screen, with Undo (finding U3-08: the Studio's own change of address used to clear it).
    expect(await page.locator('.banner').innerText()).toContain('Started again from “Ember Noir”');
    expect(await page.locator('.banner').getByRole('button', { name: 'Undo' }).count()).toBe(1);
    await page.reload();
    await page.waitForSelector('.cards');
    // Undo is gone after the reload; the replaced project is not.
    const kept = await keptCopies(page);
    expect(kept.length).toBe(1);
    const replaced = JSON.parse(kept[0]!.text) as Project;
    expect(replaced.direction).toBe('paper-and-ink');
    expect(Object.keys(replaced.decisions)).toContain('nav');
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.summary');
    expect(await page.locator('.kept-copies li').count()).toBe(1);
    expect(await page.locator('.kept-copies li').innerText()).toContain('Weeks of work');
    // The kept copy says which event replaced the project (finding U3-09).
    expect(await page.locator('.kept-copies li').innerText()).toContain('before you started again from “Ember Noir”');
    await context.close();
  });

  it('keeps the saved copy as it was, when opening changes it (finding S2-02)', async () => {
    const base = worked('Weeks of work');
    const longReason = 'r'.repeat(500);
    const future = { stepId: 'future-step', optionId: null, kind: 'kept', rejected: [], values: {}, at: '2026-11-01T10:00:00.000Z', reason: 'my notes on a future step' };
    const original = envelope({ ...base, decisions: { ...base.decisions, nav: { ...base.decisions['nav']!, reason: longReason }, 'future-step': future } });
    const { context, page } = await open({ storage: { [LOCAL_KEY]: original } });
    const banner = page.locator('.banner');
    await banner.waitFor();
    expect(await banner.innerText()).toContain('The Studio kept the copy as it was');
    expect(await banner.innerText()).toContain('shortened');
    // One ordinary change saves the opened project over the stored copy.
    await page.locator('#project-name').fill('Weeks of work, renamed');
    await settle(page);
    expect(Object.keys((await stored(page))!.decisions)).not.toContain('future-step');
    // The original, with the Decision and the whole reason, is among the kept copies.
    const kept = (await keptCopies(page)).map((copy) => copy.text);
    expect(kept.some((text) => text.includes('my notes on a future step') && text.includes(longReason))).toBe(true);
    await context.close();
    // The control: a project that this version wrote itself opens unchanged, so nothing is kept and nothing is announced.
    const plain = await open({ storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(base))) } });
    await plain.page.waitForSelector('.cards');
    expect(await plain.page.locator('.banner').count()).toBe(0);
    expect(await keptCopies(plain.page)).toEqual([]);
    await plain.context.close();
  });

  it('keeps the browser copy when the page database holds something that is not a project (finding SEC-02, case a)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Weeks of work')) }, pageDb: { doc: { project: '{"schemaVersion":2,"name":"wiped"}', savedAt: '2026-11-14T10:00:00.000Z' } } });
    await page.waitForSelector('.cards');
    expect(await page.locator('#project-name').inputValue()).toBe('Weeks of work');
    await page.locator('#project-name').fill('Weeks of work!');
    await settle(page);
    expect((await stored(page))?.name).toBe('Weeks of work!');
    await context.close();
  });

  it('saves to both stores on the private page and says so', async () => {
    const { context, page } = await open({ pageDb: { doc: null } });
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await expect.poll(() => page.locator('.save-state').innerText(), { timeout: 5000 }).toBe('Saved on this page');
    const doc = await page.evaluate(() => (window as unknown as { __pageDb: { doc: { project: string } | null } }).__pageDb.doc);
    expect((JSON.parse(doc!.project) as Project).direction).toBe('ember-noir');
    expect((await stored(page))?.direction).toBe('ember-noir');
    await context.close();
  });

  it('saves at once when the page goes to the background (finding P-06)', async () => {
    const { context, page } = await open({ hash: '#nav' });
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('label.option', { hasText: 'Links in a left column' }).click();
    await page.locator('.actions.sticky .primary').click();
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    expect((await stored(page))?.decisions['nav']?.optionId).toBe('side-rail');
    await context.close();
  });

  it('stops saving, and says so, when another tab changed the project (finding SEC-06)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await other.waitForTimeout(700);
    await expect.poll(() => page.locator('.banner').innerText().catch(() => ''), { timeout: 5000 }).toContain('changed in another tab or window');
    await page.locator('#project-name').fill('Changed here too');
    await settle(page);
    expect((await stored(page))?.name).toBe('Changed in the other tab');
    await page.getByRole('button', { name: 'Keep this tab’s copy' }).click();
    await settle(page);
    expect((await stored(page))?.name).toBe('Changed here too');
    await context.close();
  });
});

describe('Studio: a stopped save stays answerable, and no tab loses its work to a reload (campaign 4)', () => {
  const HELD = 'Not saving: see the notice at the top of the page';
  const state = (page: Page): Promise<string> => page.locator('.save-state').innerText();
  const topUndo = (page: Page) => page.locator('.top').getByRole('button', { name: 'Undo', exact: true });
  /** What a hurried person does while the Studio waits for an answer: more work, Undo, and a look at another screen. */
  const carryOn = async (page: Page): Promise<void> => {
    await page.locator('#project-name').fill('Work done while not saving');
    await page.locator('#project-name').fill('More work done while not saving');
    await topUndo(page).click();
    await page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await page.waitForSelector('.summary');
  };

  it('keeps the notice of a stopped save, with its buttons, through Undo and a change of screen: unreadable saved copy (finding F-1)', async () => {
    const cutOff = '{"savedAt":"2026-11-13T10:00:00.000Z","project":{"schemaVer';
    const { context, page } = await open({ storage: { [LOCAL_KEY]: cutOff } });
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    expect(await hold.innerText()).toContain('could not be read');
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await page.waitForSelector('.cards');
    await carryOn(page);
    // The other notice ("Undone: …") has its own row; the notice that needs an answer is still there, and it cannot be dismissed.
    expect(await hold.count()).toBe(1);
    expect(await hold.getByRole('button', { name: 'Dismiss' }).count()).toBe(0);
    expect(await state(page)).toBe(HELD);
    expect(await rawStored(page, LOCAL_KEY)).toBe(cutOff);
    // The answer still works: saving resumes, and the work on screen is saved at once.
    await hold.getByRole('button', { name: /^Start a new project/ }).click();
    await settle(page);
    expect(await hold.count()).toBe(0);
    expect((await stored(page))?.name).toBe(await page.locator('#project-name').inputValue());
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('keeps the notice of a stopped save through Undo and a change of screen: a second tab (finding F-1)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await other.waitForTimeout(700);
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    await carryOn(page);
    expect(await hold.getByRole('button', { name: 'Keep this tab’s copy' }).count()).toBe(1);
    expect(await hold.getByRole('button', { name: 'Reload to see the other copy' }).count()).toBe(1);
    expect(await state(page)).toBe(HELD);
    expect((await stored(page))?.name).toBe('Changed in the other tab');
    await context.close();
  });

  it('keeps this tab’s copy before "Reload to see the other copy" reloads (finding F-2)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await other.waitForTimeout(700);
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    expect(await hold.innerText()).toContain('Whichever you choose, the Studio first keeps the other copy');
    await page.locator('#project-name').fill('Work in this tab that matters');
    await settle(page);
    await hold.getByRole('button', { name: 'Reload to see the other copy' }).click();
    await page.waitForSelector('.cards');
    await expect.poll(() => page.locator('#project-name').inputValue()).toBe('Changed in the other tab');
    const kept = await keptCopies(page);
    expect(kept.map((copy) => (JSON.parse(copy.text) as Project).name)).toContain('Work in this tab that matters');
    expect(kept.find((copy) => copy.text.includes('Work in this tab that matters'))!.why).toContain('before you reloaded to see the other copy');
    await context.close();
  });

  it('asks before "Reload to see the other copy" discards a tab’s copy that it cannot keep, because storage is full (finding F-2)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await other.waitForTimeout(700);
    await page.locator('.banner.hold').waitFor();
    await page.locator('#project-name').fill('Work in this tab that matters');
    await fillStorage(page, 0);
    await page.locator('.banner.hold').getByRole('button', { name: 'Reload to see the other copy' }).click();
    const dialog = page.locator('dialog.confirm');
    await dialog.waitFor();
    expect(await dialog.innerText()).toContain('The Studio could not keep this tab’s copy');
    await dialog.getByRole('button', { name: 'Stay here' }).click();
    // Nothing reloaded: the work is still on screen.
    expect(await page.locator('#project-name').inputValue()).toBe('Work in this tab that matters');
    await context.close();
  });

  it('keeps unsaved work as a copy when a tab that is not saving closes or reloads', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await other.waitForTimeout(700);
    await page.locator('.banner.hold').waitFor();
    await page.locator('#project-name').fill('Typed in the stopped tab');
    await page.reload();
    await page.waitForSelector('.cards');
    // The saved project is the other tab's, untouched; the stopped tab's work is among the kept copies.
    expect((await stored(page))?.name).toBe('Changed in the other tab');
    const kept = await keptCopies(page);
    expect(kept.some((copy) => copy.text.includes('Typed in the stopped tab') && copy.why.includes('as it was when you last left the tab, reloaded it, or closed it'))).toBe(true);
    // Nobody could read a notice while the page reloaded, so the next opening says what happened and where the copy is.
    const notice = page.locator('.banner:not(.hold)');
    expect(await notice.innerText()).toContain('kept that page’s unsaved work as a copy');
    await notice.getByRole('button', { name: 'Go to the Summary' }).click();
    await page.waitForSelector('.kept-copies');
    await context.close();
  });

  it('settles the status line when a save has nothing to write, and after a failed save says “Saved” again once an Undo brings back the saved state (findings F-7 and F-23)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('A')) } });
    await page.waitForSelector('.cards');
    // An edit and its Undo, faster than the save delay: nothing to write, and the line must not stay at "Saving…".
    await page.locator('#project-name').fill('A, changed');
    await topUndo(page).click();
    // Undo says what it did: only the name went back.
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('Undone: the project’s name is “A” again.');
    await settle(page);
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    // Storage full, in the browser's real storage: the save fails and says so. An Undo back to the saved state brings back
    // exactly what is stored, so the line says "Saved" again (the owner's decision D55), and the retry button goes.
    expect(await fillRealStorage(page, 0)).toBeGreaterThan(100_000);
    await page.locator('#project-name').fill('A, with a much longer name than before, so that it cannot fit');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    await topUndo(page).click();
    await settle(page);
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    expect(await page.getByRole('button', { name: 'Try to save again' }).count()).toBe(0);
    expect((await stored(page))?.name).toBe('A');
    // Storage is still full: the next change that cannot be saved brings the statement back.
    await page.locator('#project-name').fill('A, with another long name that cannot fit either');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    expect((await stored(page))?.name).toBe('A');
    await context.close();
  });

  it('gives each kept copy a storage entry of its own, written once, and never rewrites a shared list (finding F-10)', async () => {
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await page.waitForSelector('.summary');
    await page.evaluate(() => {
      const writes: string[] = [];
      (window as unknown as { writes: string[] }).writes = writes;
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (this: Storage, key: string, value: string): void {
        writes.push(key);
        original.call(this, key, value);
      };
    });
    // Two replace actions, so two kept copies.
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    await page.locator('dialog[open]').getByRole('button', { name: 'Yes, clear this project' }).click();
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await page.waitForSelector('.cards');
    await page.locator('.top-nav a', { hasText: 'Directions' }).click();
    // A project with a Direction and no Decision is replaced without a question, and is kept all the same.
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await page.waitForSelector('.cards');
    await settle(page);
    const writes = await page.evaluate(() => (window as unknown as { writes: string[] }).writes);
    const copyWrites = writes.filter((key) => key.startsWith(`${'refraction.project.backup'}.`));
    expect(copyWrites.length).toBe(2);
    expect(new Set(copyWrites).size).toBe(2);
    expect(writes).not.toContain(BACKUP_KEY);
    expect((await keptCopies(page)).length).toBe(2);
    await context.close();
  });

  it('keeps both copies when two tabs that are not saving close in the same moment (finding F-10)', async () => {
    for (let round = 0; round < 4; round++) {
      const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
      await page.waitForSelector('.cards');
      const second = await context.newPage();
      const third = await context.newPage();
      for (const tab of [second, third]) {
        await tab.goto(pageUrl);
        await tab.waitForSelector('.cards');
      }
      await page.locator('#project-name').fill(`First tab ${round}`);
      for (const tab of [second, third]) await tab.locator('.banner.hold').waitFor();
      await second.locator('#project-name').fill(`Second tab work ${round}`);
      await third.locator('#project-name').fill(`Third tab work ${round}`);
      await Promise.all([second.close({ runBeforeUnload: true }), third.close({ runBeforeUnload: true })]);
      const names = async (): Promise<string[]> => (await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name).sort();
      await expect.poll(names, { timeout: 5000, message: `round ${round}` }).toEqual([`Second tab work ${round}`, `Third tab work ${round}`]);
      expect((await stored(page))?.name).toBe(`First tab ${round}`);
      await context.close();
    }
  });

  it('takes a save with the same save time but another mark for another tab’s save, and stops saving (finding F-12)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('Saved by this tab');
    await settle(page);
    // What another tab would write in the same millisecond: the same save time, its own mark, and its own project.
    const foreign = await page.evaluate((key) => {
      const mine = JSON.parse(window.localStorage.getItem(key)!) as { savedAt: string; mark: string; project: { name: string } };
      const theirs = JSON.stringify({ savedAt: mine.savedAt, mark: 'another-tab.0', project: { ...mine.project, name: 'Saved by the other tab' } });
      const before = window.localStorage.getItem(key);
      window.localStorage.setItem(key, theirs);
      window.dispatchEvent(new StorageEvent('storage', { key, oldValue: before, newValue: theirs, storageArea: window.localStorage }));
      return { sameTime: mine.savedAt, hasMark: typeof mine.mark === 'string' && mine.mark.length > 0 };
    }, LOCAL_KEY);
    expect(foreign.hasMark).toBe(true);
    await page.locator('.banner.hold').waitFor();
    expect(await page.locator('.save-state').innerText()).toBe('Not saving: see the notice at the top of the page');
    // This tab does not write over the other tab's save.
    await page.locator('#project-name').fill('Typed after the other tab saved');
    await settle(page);
    expect((await stored(page))?.name).toBe('Saved by the other tab');
    await context.close();
  });

  it('notices another tab’s save when the owner comes back to the tab, even if no storage event arrived (finding F-12)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('Saved by this tab');
    await settle(page);
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    // Another save lands in storage, and this tab hears nothing of it (as a page restored from the browser's back-forward cache would not).
    await page.evaluate((key) => {
      const mine = JSON.parse(window.localStorage.getItem(key)!) as { savedAt: string; project: { name: string } };
      window.localStorage.setItem(key, JSON.stringify({ savedAt: mine.savedAt, mark: 'another-tab.1', project: { ...mine.project, name: 'Saved by the other tab' } }));
    }, LOCAL_KEY);
    expect(await page.locator('.banner.hold').count()).toBe(0);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.locator('.banner.hold').waitFor();
    expect(await page.locator('.save-state').innerText()).toBe('Not saving: see the notice at the top of the page');
    await context.close();
  });

  it('counts a run of typing or of slider presses as one Undo step, and states how far Undo reaches (finding F-11)', async () => {
    const { context, page } = await open({ hash: '#density', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    await waitForStep(page, 'Spacing');
    const name = page.locator('#project-name');
    // 45 typed letters are one step: one Undo brings the old name back.
    await name.click();
    await page.keyboard.press('End');
    await page.keyboard.type(', and then forty-five more letters typed fast');
    expect(await name.inputValue()).toBe('Weeks of work, and then forty-five more letters typed fast');
    await topUndo(page).click();
    expect(await name.inputValue()).toBe('Weeks of work');
    // A pause ends the run: the typing after it is a step of its own.
    await name.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' one');
    await page.waitForTimeout(1700);
    await page.keyboard.type(' two');
    await topUndo(page).click();
    expect(await name.inputValue()).toBe('Weeks of work one');
    await topUndo(page).click();
    expect(await name.inputValue()).toBe('Weeks of work');
    // Six presses on one slider are one step as well.
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const slider = page.locator('#tune-density');
    const before = await slider.inputValue();
    await slider.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    expect(await slider.inputValue()).not.toBe(before);
    await topUndo(page).click();
    await expect.poll(() => page.locator('#tune-density').inputValue()).toBe(before);
    // The dialog says how far Undo reaches, instead of promising it without a limit.
    await page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    expect(await page.locator('dialog[open]').innerText()).toContain('as long as it is among your last 100 Undo steps');
    await context.close();
  });

  it('saves at once after "Go on: let the Studio save over it", also when nothing changed on screen (finding F-15)', async () => {
    // A saved copy with a Decision for a Step that this Catalog does not have: opening changes it.
    const withUnknown = JSON.parse(JSON.stringify(worked('Weeks of work'))) as { decisions: Record<string, unknown> };
    withUnknown.decisions['a-step-from-another-version'] = { stepId: 'a-step-from-another-version', optionId: 'x', kind: 'picked', rejected: [], values: {}, at: '2026-11-13T09:00:00.000Z' };
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(withUnknown) } });
    await page.waitForSelector('.cards');
    // The first opening had room: it kept the copy and stored the project as opened (round 3). Put the saved copy back as
    // it was, take the kept copy away, leave no room, and open again.
    await settle(page);
    await page.evaluate(([key, value]) => window.localStorage.setItem(key!, value!), [LOCAL_KEY, envelope(withUnknown)]);
    await clearKeptCopies(page);
    expect(await fillStorage(page, 20)).toBe(true);
    await page.reload();
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    expect(await rawStored(page, LOCAL_KEY)).toContain('a-step-from-another-version');
    await hold.getByRole('button', { name: 'Go on: let the Studio save over it' }).click();
    await settle(page);
    expect(await rawStored(page, LOCAL_KEY)).not.toContain('a-step-from-another-version');
    expect((await stored(page))?.name).toBe('Weeks of work');
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('keeps a tab’s copy before a reload even when the project has only a name (retest of finding F-2)', async () => {
    const { context, page } = await open();
    await page.locator('#project-name').fill('Only a name so far');
    await settle(page);
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.top');
    await other.locator('#project-name').fill('Named in the other tab');
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    await page.locator('#project-name').fill('Typed here, and it matters');
    await hold.getByRole('button', { name: 'Reload to see the other copy' }).click();
    await expect.poll(() => page.locator('#project-name').inputValue()).toBe('Named in the other tab');
    expect((await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name)).toContain('Typed here, and it matters');
    await context.close();
  });

  it('offers to try the save again after it failed, and saves once storage has room', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('A')) } });
    await page.waitForSelector('.cards');
    expect(await fillStorage(page, 0)).toBe(true);
    await page.locator('#project-name').fill('A, with a longer name that does not fit');
    await settle(page);
    expect(await page.locator('.save-state').innerText()).toContain('Cannot save here');
    const again = page.getByRole('button', { name: 'Try to save again' });
    await again.click();
    await settle(page);
    // Still no room: the statement stays, and so does the button.
    expect(await page.locator('.save-state').innerText()).toContain('Cannot save here');
    // Room again (the test lifts its capacity): one press saves, and the button goes.
    await page.evaluate(() => window.localStorage.removeItem('test.capacity'));
    await again.click();
    await settle(page);
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    expect((await stored(page))?.name).toBe('A, with a longer name that does not fit');
    expect(await again.count()).toBe(0);
    await context.close();
  });

  it('draws a slider’s knob exactly on the value that the text states, and walks the grid with the keys (finding F-9)', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Galactic Goth' }).click();
    await page.waitForSelector('.cards');
    await page.locator('.rail a', { hasText: 'Spacing' }).first().click();
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const slider = page.locator('#tune-density');
    expect(await slider.inputValue()).toBe('1.12');
    expect(await slider.getAttribute('aria-valuetext')).toContain('1.12');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => slider.inputValue()).toBe('1.15');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => slider.inputValue()).toBe('1.05');
    await page.keyboard.press('End');
    await expect.poll(() => slider.inputValue()).toBe('1.45');
    await page.keyboard.press('Home');
    await expect.poll(() => slider.inputValue()).toBe('0.75');
    await context.close();
  });
});

describe('Studio: a slow or faulty page database never costs a saved copy (code review of 2026-11-13)', () => {
  const pageDoc = (page: Page): Promise<{ project: string; savedAt?: string } | null> => page.evaluate(() => (window as unknown as { __pageDb: { doc: { project: string; savedAt?: string } | null } }).__pageDb.doc);

  it('saves nothing while the saved project is still opening: leaving, a tab switch, and typing change no copy (finding "saving 0")', async () => {
    const saved = envelope(worked('Weeks of work'));
    const { context, page } = await open({ storage: { [LOCAL_KEY]: saved }, pageDb: { doc: null, getDelay: 2500 }, dontWaitUntilOpen: true });
    // The page database has not answered yet, so the project is not open.
    expect(await page.locator('.loading').count()).toBe(1);
    expect(await page.locator('#project-name').isDisabled()).toBe(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('pagehide'));
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('beforeunload'));
    });
    expect(await rawStored(page, LOCAL_KEY)).toBe(saved);
    expect(await keptCopies(page)).toEqual([]);
    // Once the project is open, it is the saved one, and the field works.
    await page.waitForFunction(() => !document.querySelector('.loading'), undefined, { timeout: 10000 });
    expect(await page.locator('#project-name').inputValue()).toBe('Weeks of work');
    expect(await page.locator('#project-name').isDisabled()).toBe(false);
    expect((await stored(page))?.direction).toBe('paper-and-ink');
    await context.close();
  });

  it('opens the browser copy when the page has a runtime that cannot hand out a database (finding "saving 1")', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Weeks of work')) }, pageDb: { doc: null, noUse: true } });
    await page.waitForSelector('.cards');
    expect(await page.locator('#project-name').inputValue()).toBe('Weeks of work');
    await page.locator('#project-name').fill('Weeks of work, continued');
    await settle(page);
    expect((await stored(page))?.name).toBe('Weeks of work, continued');
    expect(await page.locator('.save-state').innerText()).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('keeps a copy that the page database hands over late, before any save can replace it (findings "saving 2" and "gaps 3")', async () => {
    const older = worked('Older, in this browser');
    const newer = worked('Newer, on the page');
    // The first read of the page database fails, so the Studio opens the browser copy. The second read answers with a newer copy.
    const session = await open({ storage: { [LOCAL_KEY]: envelope(older, '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(newer), savedAt: '2026-11-13T10:00:00.000Z' }, firstGetRejects: true } });
    const { page } = session;
    await page.waitForSelector('.cards');
    const hold = page.locator('.banner.hold');
    await hold.waitFor();
    expect(await hold.innerText()).toContain('A newer copy of this project was found saved on this page. The Studio kept it');
    expect((await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name)).toContain('Newer, on the page');
    // "Keep what I have", then an edit: the page copy is replaced now, and the kept copy still holds it.
    await hold.getByRole('button', { name: 'Keep what I have' }).click();
    await page.locator('#project-name').fill('Older, and edited');
    await settle(page);
    expect((JSON.parse((await pageDoc(page))!.project) as Project).name).toBe('Older, and edited');
    expect((await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name)).toContain('Newer, on the page');
    await session.context.close();

    // The same start; this time the owner opens the newer copy. The replaced project is kept, and the Step screen works.
    const second = await open({ hash: '#radius', storage: { [LOCAL_KEY]: envelope(tune(older, 'radius', 'radius', 9, '2026-11-13T09:30:00.000Z'), '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: JSON.stringify(newer), savedAt: '2026-11-13T10:00:00.000Z' }, firstGetRejects: true } });
    await second.page.locator('.banner.hold').getByRole('button', { name: 'Open the newer copy' }).click();
    await expect.poll(() => second.page.locator('#project-name').inputValue()).toBe('Newer, on the page');
    expect((await keptCopies(second.page)).some((copy) => copy.text.includes('Older, in this browser'))).toBe(true);
    // The main button acts on the opened project, without an error.
    await second.page.locator('.actions.sticky .primary').click();
    await settle(second.page);
    expect(second.errors).toEqual([]);
    expect((await stored(second.page))?.name).toBe('Newer, on the page');
    await second.context.close();

    // A late copy that cannot be read is kept as well, and the Studio says so.
    const third = await open({ storage: { [LOCAL_KEY]: envelope(older, '2026-11-06T10:00:00.000Z') }, pageDb: { doc: { project: '{"cut off', savedAt: '2026-11-13T10:00:00.000Z' }, firstGetRejects: true } });
    await third.page.waitForSelector('.cards');
    await expect.poll(async () => (await keptCopies(third.page)).map((copy) => copy.text)).toContain('{"cut off');
    expect(await third.page.locator('.banner').innerText()).toContain('could not be read. The Studio kept it');
    await third.context.close();
  });

  it('says "Saved in this browser" when a write to the page database never answers, and goes on saving (finding "saving 3")', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Weeks of work')) }, pageDb: { doc: null, setHangs: true } });
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('Weeks of work, first change');
    await settle(page);
    expect((await stored(page))?.name).toBe('Weeks of work, first change');
    expect(await page.locator('.save-state').innerText()).toBe('Saving…');
    // After the time limit for a page write, the status settles on what is true: the browser holds the work.
    await expect.poll(() => page.locator('.save-state').innerText(), { timeout: 15000, interval: 1000 }).toBe('Saved in this browser, on this computer');
    await context.close();
  }, 40000);

  it('keeps what another tab saved before "Start a new project" in a stopped tab replaces it (finding "saving 4")', async () => {
    const garbage = 'not a project at all';
    const { context, page } = await open({ storage: { [LOCAL_KEY]: garbage } });
    await page.locator('.banner.hold').waitFor();
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.locator('.banner.hold').getByRole('button', { name: /^Start a new project/ }).click();
    await other.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Work done in the other tab');
    await other.waitForTimeout(700);
    await other.close();
    // The first tab was asked about the unreadable copy. Its answer must not cost the other tab's work.
    await page.locator('.banner.hold').getByRole('button', { name: /^Start a new project/ }).click();
    await settle(page);
    expect((await keptCopies(page)).some((copy) => copy.text.includes('Work done in the other tab'))).toBe(true);
    await context.close();
  });

  it('keeps one running copy for a tab that is not saving, however often the tab goes to the background (finding "saving 7")', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await page.locator('.banner.hold').waitFor();
    const toBackground = (): Promise<void> =>
      page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    for (const name of ['Stopped tab, first', 'Stopped tab, second', 'Stopped tab, third']) {
      await page.locator('#project-name').fill(name);
      await toBackground();
    }
    const kept = (await keptCopies(page)).filter((copy) => copy.text.includes('Stopped tab'));
    expect(kept.length).toBe(1);
    expect(kept[0]!.text).toContain('Stopped tab, third');
    expect(kept[0]!.why).toContain('as it was when you last left the tab, reloaded it, or closed it');
    await context.close();
  });
});

describe('Studio: keys, focus, and the reason field (code review of 2026-11-13)', () => {
  const topUndo = (page: Page) => page.locator('.top').getByRole('button', { name: 'Undo', exact: true });

  it('lets a slider key that cannot move the value do nothing, and keeps "fully round" fully round (findings "screen 1", "engine 3")', async () => {
    const { context, page } = await open({ hash: '#radius' });
    await waitForStep(page, 'Corners');
    await page.locator('label.option', { hasText: 'Fully round' }).click();
    await page.locator('.actions.sticky .primary').click();
    await page.locator('.rail a', { hasText: 'Corners' }).first().click();
    await waitForStep(page, 'Corners');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const slider = page.locator('#tune-radius');
    await slider.focus();
    // The keys for "rounder" cannot make "fully round" rounder: nothing changes, and the Decision stays a pick.
    for (const key of ['ArrowRight', 'PageUp', 'End']) await page.keyboard.press(key);
    await settle(page);
    expect((await stored(page))?.params.radius).toBe(999);
    expect((await stored(page))?.decisions['radius']?.kind).toBe('picked');
    // With Alt held, the key is the browser's own and the slider leaves it alone.
    await page.keyboard.press('Alt+ArrowDown');
    await settle(page);
    expect((await stored(page))?.params.radius).toBe(999);
    // The key for "sharper" leaves "fully round" for the slider's top.
    await page.keyboard.press('ArrowLeft');
    await settle(page);
    expect((await stored(page))?.params.radius).toBe(28);
    // At the low end, the key for "sharper" does nothing and adds no Undo step: one Undo goes back past the whole run.
    await page.keyboard.press('Home');
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
    await settle(page);
    expect((await stored(page))?.params.radius).toBe(0);
    await topUndo(page).click();
    await settle(page);
    expect((await stored(page))?.params.radius).toBe(999);
    await context.close();
  });

  it('offers, on a dark page, only the part of the "Lightness" slider that changes the color (finding "engine 2")', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Ember Noir' }).click();
    await page.waitForSelector('.cards');
    await page.locator('.rail a', { hasText: 'Main color' }).first().click();
    await waitForStep(page, 'Main color');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const slider = page.locator('#tune-accentLightness');
    expect([await slider.getAttribute('min'), await slider.getAttribute('max')]).toEqual(['0.48', '0.68']);
    await context.close();
  });

  it('moves one Step, not many, when Enter is held down (finding "screen 2")', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('.cards input[type="radio"]:checked').focus();
    // A held key: the first press, then repeats without a release in between.
    await page.keyboard.down('Enter');
    for (let i = 0; i < 6; i++) await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    await settle(page);
    await waitForStep(page, 'First screen');
    expect(Object.keys((await stored(page))!.decisions)).toEqual(['nav']);
    await context.close();
  });

  it('stores a typed reason at once, on the Step it was typed for (findings "screen 4", "gaps 0")', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'First screen');
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'List of services');
    // A reason on Step 1, typed and followed by Enter and a reload: it is there afterwards.
    await page.locator('.rail a', { hasText: 'Menu (navigation)' }).first().click();
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('#decision-reason').fill('Most visitors come to book an appointment');
    await page.keyboard.press('Enter');
    await settle(page);
    await page.reload();
    await waitForStep(page, 'Menu (navigation)');
    expect(await page.locator('#decision-reason').inputValue()).toBe('Most visitors come to book an appointment');
    // A reason typed on Step 2, then the browser's Back button with the field still in use: each Step keeps its own reason.
    await page.locator('.rail a', { hasText: 'First screen' }).first().click();
    await waitForStep(page, 'First screen');
    await page.locator('#decision-reason').click();
    await page.keyboard.type('Typed on the second Step');
    await page.goBack();
    await waitForStep(page, 'Menu (navigation)');
    await settle(page);
    const decisions = (await stored(page))!.decisions;
    expect(decisions['nav']?.reason).toBe('Most visitors come to book an appointment');
    expect(decisions['hero']?.reason).toBe('Typed on the second Step');
    // One Undo takes back the whole reason, not one letter.
    await topUndo(page).click();
    await settle(page);
    expect((await stored(page))!.decisions['hero']?.reason).toBeUndefined();
    await context.close();
  });

  it('keeps keyboard focus where the person works: after a question, a dismissed notice, Undo, and the region list (findings "screen 3", "screen 5", "screen 6")', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) }, hash: '#directions' });
    await page.waitForSelector('.direction');
    const focused = (): Promise<string> => page.evaluate(() => `${document.activeElement?.tagName ?? ''}:${(document.activeElement?.textContent ?? '').trim().slice(0, 40)}:${document.activeElement?.id ?? ''}`);
    // A question answered with "keep": focus returns to the button that asked.
    const start = page.getByRole('button', { name: 'Start from Ember Noir' });
    await start.focus();
    await page.keyboard.press('Enter');
    await page.locator('dialog[open]').waitFor();
    // Ctrl+Z does nothing behind an open question.
    const before = JSON.stringify(await stored(page));
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Escape');
    await expect.poll(() => page.locator('dialog[open]').count()).toBe(0);
    expect(await focused()).toContain('Start from Ember Noir');
    expect(JSON.stringify(await stored(page))).toBe(before);
    // On a Step: two changes, then Undo twice with the keyboard on the Undo button.
    await page.goto(pageUrl + '#radius');
    await waitForStep(page, 'Corners');
    await page.locator('label.option', { hasText: 'Square corners' }).click();
    await page.locator('.actions.sticky .primary').click();
    await page.locator('.rail a', { hasText: 'Corners' }).first().click();
    await waitForStep(page, 'Corners');
    await page.locator('label.option', { hasText: 'Fully round' }).click();
    await page.locator('.actions.sticky .primary').click();
    await topUndo(page).focus();
    await page.keyboard.press('Enter');
    await settle(page);
    expect(await focused()).toContain('BUTTON:Undo');
    expect((await stored(page))?.params.radius).toBe(0);
    await page.keyboard.press('Enter');
    await settle(page);
    expect((await stored(page))?.params.radius).not.toBe(0);
    // A dismissed notice leaves focus on the main part of the page, not on nothing.
    await page.locator('.banner:not(.hold)').getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(focused).toContain(':main');
    // The region list keeps focus, so that a second arrow key changes the region again and not the card on show.
    await page.goto(pageUrl + '#radius');
    await waitForStep(page, 'Corners');
    const shownBefore = await page.locator('.cards input[type="radio"]:checked').getAttribute('id');
    const region = page.locator('select').filter({ hasText: 'Where this Step’s change shows' });
    await region.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    expect(await focused()).toContain('SELECT');
    expect(await page.locator('.cards input[type="radio"]:checked').getAttribute('id')).toBe(shownBefore);
    await context.close();
  });
});

describe('Studio: what the third round of campaign 4 found', () => {
  const state = (page: Page): Promise<string> => page.locator('.save-state').innerText();
  const names = async (page: Page): Promise<string[]> => (await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name).sort();
  const toBackground = (page: Page): Promise<void> =>
    page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  /** A tab on the saved project, and a second tab that saves a change, so that the first tab stops saving. */
  const stoppedTab = async (): Promise<{ context: BrowserContext; page: Page; other: Page }> => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed in the other tab');
    await page.locator('.banner.hold').waitFor();
    return { context, page, other };
  };

  it('keeps the replaced project for good when a stopped tab starts again, although the tab’s running copy held the same text', async () => {
    const { context, page } = await stoppedTab();
    await page.locator('#project-name').fill('Edits made while not saving');
    await toBackground(page);
    expect((await keptCopies(page)).filter((copy) => copy.state === 'running').length).toBe(1);
    await page.goto(`${pageUrl}#directions`);
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('New project B');
    await toBackground(page);
    // The replaced project is a lasting copy under the reason of the replacement; the new work has a running copy of its own.
    const kept = await keptCopies(page);
    const replaced = kept.filter((copy) => copy.text.includes('Edits made while not saving'));
    expect(replaced.length).toBe(1);
    expect(replaced[0]!.state).toBeUndefined();
    expect(replaced[0]!.why).toContain('as it was before you started again from “Soft Daylight”');
    expect(kept.some((copy) => copy.text.includes('New project B') && copy.state === 'running')).toBe(true);
    await context.close();
  });

  it('does not count on another tab’s running copy: each of two stopped tabs with the same work keeps it', async () => {
    const { context, page, other } = await stoppedTab();
    const third = await context.newPage();
    await third.goto(pageUrl);
    await third.waitForSelector('.cards');
    await other.locator('#project-name').fill('Changed again in the other tab');
    await third.locator('.banner.hold').waitFor();
    await page.locator('#project-name').fill('Same work');
    await toBackground(page);
    await third.locator('#project-name').fill('Same work');
    await third.close({ runBeforeUnload: true });
    await page.locator('#project-name').fill('The first tab moved on');
    await toBackground(page);
    await expect.poll(() => names(other)).toEqual(expect.arrayContaining(['Same work', 'The first tab moved on']));
    await context.close();
  });

  it('puts unsaved work into an entry of the page’s own before a closing page writes the saved project, and settles it at the next opening', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Quick')) } });
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('Typed and closed at once');
    await page.close({ runBeforeUnload: true });
    const look = await context.newPage();
    await look.goto(blankUrl.href);
    const left = await keptCopies(look);
    expect(left.map((copy) => [copy.state, (JSON.parse(copy.text) as Project).name])).toEqual([['leaving', 'Typed and closed at once']]);
    expect((await stored(look))?.name).toBe('Typed and closed at once');
    // The next opening finds the same work in the saved project: the entry goes, and there is nothing to report.
    await look.goto(pageUrl);
    await look.waitForSelector('.cards');
    expect(await keptCopies(look)).toEqual([]);
    expect(await look.locator('.banner').count()).toBe(0);
    await context.close();
  });

  it('keeps for good, and reports, the work of a closing page that another page’s save replaced in the same moment', async () => {
    const lost = JSON.stringify(worked('Lost in the race'));
    const same = JSON.stringify(worked('Saved by the other page'));
    const entry = (text: string): string => `${JSON.stringify({ keptAt: '2026-11-14T09:00:00.000Z', why: 'The project as one page of the Studio last showed it.', state: 'leaving' })}\n${text}`;
    const { context, page } = await open({
      storage: {
        [LOCAL_KEY]: envelope(worked('Saved by the other page')),
        [`${BACKUP_KEY}.2026-11-14T09:00:00.000Z.0aaaaaa`]: entry(lost),
        [`${BACKUP_KEY}.2026-11-14T09:00:00.000Z.1bbbbbb`]: entry(same),
      },
    });
    await page.waitForSelector('.cards');
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('its last work is not in the saved project');
    const kept = await keptCopies(page);
    expect(kept.map((copy) => [copy.state, copy.text])).toEqual([[undefined, lost]]);
    expect((await stored(page))?.name).toBe('Saved by the other page');
    // The Summary lists it, and a second opening says nothing more.
    await page.locator('.banner:not(.hold)').getByRole('button', { name: 'Go to the Summary' }).click();
    await page.waitForSelector('.kept-copies');
    await page.reload();
    await page.waitForSelector('main');
    expect(await page.locator('.banner').count()).toBe(0);
    await context.close();
  });

  it('removes the entry of its own when the page lives on and has saved', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Quick')) } });
    await page.waitForSelector('.cards');
    await page.locator('#project-name').fill('Changed, then to the background');
    await toBackground(page);
    await settle(page);
    expect(await keptCopies(page)).toEqual([]);
    expect((await stored(page))?.name).toBe('Changed, then to the background');
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    await context.close();
  });

  it('says “Saved” without a press of "Try to save again" after an Undo back to the saved state, and really tries when a later save fails', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('A')) } });
    await page.waitForSelector('.cards');
    expect(await fillStorage(page, 0)).toBe(true);
    await page.locator('#project-name').fill('A, with a longer name that does not fit');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    const again = page.getByRole('button', { name: 'Try to save again' });
    expect(await again.count()).toBe(1);
    // The Undo brings back exactly what is stored: the line says so by itself, and the button goes (finding F-23, decision D55).
    await page.locator('.top').getByRole('button', { name: 'Undo', exact: true }).click();
    await settle(page);
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    expect(await again.count()).toBe(0);
    expect((await stored(page))?.name).toBe('A');
    // A new change still does not fit: the statement and the button come back. With room again, one press makes a real attempt.
    await page.locator('#project-name').fill('A, with a second long name that does not fit');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    await page.evaluate(() => window.localStorage.removeItem('test.capacity'));
    await again.click();
    await settle(page);
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    expect(await again.count()).toBe(0);
    expect((await stored(page))?.name).toBe('A, with a second long name that does not fit');
    await context.close();
  });

  it('says so when a new pick removes the reason written for the earlier choice, and puts it back on request', async () => {
    const { context, page } = await open({ hash: '#nav', storage: { [LOCAL_KEY]: envelope(worked('Reasons')) } });
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('#decision-reason').fill('Our site works like a tool');
    await settle(page);
    expect((await stored(page))?.decisions['nav']?.reason).toBe('Our site works like a tool');
    await page.locator('label.option', { hasText: 'Name left, links right' }).click();
    await page.locator('.actions.sticky .primary').click();
    const notice = page.locator('.banner:not(.hold)');
    await expect.poll(() => notice.innerText().catch(() => '')).toContain('The reason you wrote there was for the earlier choice, so the Studio removed it: “Our site works like a tool”');
    await settle(page);
    expect((await stored(page))?.decisions['nav']).toMatchObject({ optionId: 'top-inline', kind: 'picked' });
    expect((await stored(page))?.decisions['nav']?.reason).toBeUndefined();
    await notice.getByRole('button', { name: 'Keep that reason for the new choice' }).click();
    await settle(page);
    expect((await stored(page))?.decisions['nav']).toMatchObject({ optionId: 'top-inline', kind: 'picked', reason: 'Our site works like a tool' });
    expect(await notice.innerText()).toContain('Your reason is on the Step “Menu (navigation)” again.');
    // Putting the Step back removes the Decision and its reason, and the notice says both.
    await page.goto(`${pageUrl}#nav`);
    await waitForStep(page, 'Menu (navigation)');
    await page.getByRole('button', { name: 'Put this Step back to how the project started' }).click();
    expect(await notice.innerText()).toContain('The reason you wrote for this Step is removed with its Decision; Undo brings both back.');
    await notice.getByRole('button', { name: 'Undo' }).click();
    await settle(page);
    expect((await stored(page))?.decisions['nav']?.reason).toBe('Our site works like a tool');
    await context.close();
  });

  it('records a pick, which follows the main color, when the owner keeps a following Option that the starting design did not have', async () => {
    // "Galactic Goth" starts with a fixed red second color (18 degrees). With the main color at 258, the red stands a third of
    // the wheel away, and the card "Two colors: a third of the wheel apart" is the one in use.
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Galactic Goth' }).click();
    await page.waitForSelector('.cards');
    await page.goto(`${pageUrl}#accent`);
    await waitForStep(page, 'Main color');
    await page.locator('label.option', { hasText: 'Deep blue' }).click();
    await page.locator('.actions.sticky .primary').click();
    await waitForStep(page, 'Amount of color');
    expect(await mainButton(page)).toContain('Two colors: a third of the wheel apart');
    await page.locator('.actions.sticky .primary').click();
    await settle(page);
    expect((await stored(page))?.decisions['color-strategy']).toMatchObject({ kind: 'picked', optionId: 'duo-triad' });
    await page.goto(`${pageUrl}#accent`);
    await waitForStep(page, 'Main color');
    await page.locator('label.option', { hasText: 'Bright blue' }).click();
    await page.locator('.actions.sticky .primary').click();
    await settle(page);
    const after = (await stored(page))!;
    expect(after.params.accent2Hue).toBe((after.params.accentHue + 120) % 360);
    expect(after.decisions['color-strategy']).toMatchObject({ kind: 'picked', optionId: 'duo-triad' });
    await context.close();
  });

  it('keeps a kept Step as kept, in the record and in words, when its fixed second color matches a following Option for a moment (finding F-24)', async () => {
    // "Galactic Goth" starts with a fixed red second color (18 degrees). The owner keeps "Amount of color" as it is, on a first pass.
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Galactic Goth' }).click();
    await page.waitForSelector('.cards');
    await page.goto(`${pageUrl}#color-strategy`);
    await waitForStep(page, 'Amount of color');
    await page.locator('.actions.sticky .primary').click();
    await settle(page);
    expect((await stored(page))?.decisions['color-strategy']).toMatchObject({ kind: 'kept', optionId: null });
    // With the main color at 258 degrees the red stands a third of the wheel away: the design matches the Option and does not hold it.
    await page.goto(`${pageUrl}#accent`);
    await waitForStep(page, 'Main color');
    await page.locator('label.option', { hasText: 'Deep blue' }).click();
    await page.locator('.actions.sticky .primary').click();
    await settle(page);
    const after = (await stored(page))!;
    expect(after.params.accent2Hue).toBe(18);
    expect(after.decisions['color-strategy']).toMatchObject({ kind: 'kept', optionId: null });
    const status = await page.locator('.rail a[href="#color-strategy"] small').innerText();
    expect(status).toBe('Kept: close to “Two colors: a third of the wheel apart”: second color stays red (18° on the color wheel) and does not follow the main color');
    await context.close();
  });

  it('states the value that the design holds on a narrowed slider, and the first inward key changes what is drawn', async () => {
    const { context, page } = await open();
    await page.getByRole('button', { name: 'Start from Galactic Goth' }).click();
    await page.waitForSelector('.cards');
    await page.goto(`${pageUrl}#accent`);
    await waitForStep(page, 'Main color');
    await page.locator('label.option', { hasText: 'Golden yellow' }).click();
    await page.locator('.actions.sticky .primary').click();
    await page.goto(`${pageUrl}#accent`);
    await waitForStep(page, 'Main color');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const slider = page.locator('#tune-accentLightness');
    // The Studio saves 300 milliseconds after a change, so the stored value is asked until it is there. A single read at
    // once found nothing stored on a slower machine (CI run on pull request 3, 2026-11-14).
    await expect.poll(async () => (await stored(page))?.params.accentLightness).toBe(0.8);
    expect(await slider.getAttribute('aria-valuetext')).toBe('0.8 (drawn like 0.68 on this page)');
    const accent = (): Promise<string> => page.frameLocator('.large-preview iframe').locator('body').evaluate((body) => getComputedStyle(body).getPropertyValue('--accent').trim());
    const before = await accent();
    await slider.focus();
    await page.keyboard.press('ArrowLeft');
    await settle(page);
    expect((await stored(page))!.params.accentLightness).toBeLessThan(0.68);
    expect(await accent()).not.toBe(before);
    await context.close();
  });

  it('lets no project name or file name end the quotation in one of the Studio’s own sentences', async () => {
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(worked('Owner work')) } });
    await page.waitForSelector('.summary');
    const forged = { ...JSON.parse(JSON.stringify(createProject('x'))), name: 'Owner work”. It is the same as the open project, so nothing will change. The project “Owner work' };
    await page.locator('#project-file').setInputFiles({ name: 'backup”. Nothing changes. “x.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(forged)) });
    const body = await page.locator('#confirm-body').innerText();
    // (A name is shown up to 60 characters.)
    expect(body.startsWith('The file “backup’. Nothing changes. ’x.json” holds a project named “Owner work’. It is the same as the open project, so nothing ”. Opening it replaces the project on screen.'), body).toBe(true);
    // Inside the Studio's sentence, the only quotation marks are the Studio's own: two pairs, around the two names.
    expect(body.slice(0, body.indexOf(' Opening it replaces')).match(/[“”"]/g)?.length).toBe(4);
    await page.getByRole('button', { name: 'Keep my project' }).click();
    // The same class of name, in three further forms (review of 2026-11-14, findings S5-02 and S5-03; judge's retest of F-19).
    const RLO = String.fromCharCode(0x202e);
    const cases: { file: string; project: string }[] = [
      // Doubled marks: each became a single mark, and two single marks side by side draw like a double one.
      { file: 'notes.json', project: 'Owner work””. Nothing will change. ““Owner work' },
      // A sign that looks like a closing quotation mark (the double prime).
      { file: 'holiday″. This file changes nothing; your project stays. ″x.json', project: 'Plain' },
      // An invisible sign that turns the rest of the line into mirror writing, in the file name and in the project name.
      { file: `notes${RLO}.json`, project: `Safe${RLO}` },
    ];
    for (const one of cases) {
      const file = { ...JSON.parse(JSON.stringify(createProject('x'))), name: one.project };
      await page.locator('#project-file').setInputFiles({ name: one.file, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(file)) });
      const text = await page.locator('#confirm-body').innerText();
      const sentence = text.slice(0, text.indexOf(' Opening it replaces'));
      expect(text.includes(' Opening it replaces the project on screen.'), text).toBe(true);
      // The Studio's two pairs of marks, and no other double mark, no look-alike, and no run of single marks.
      expect(sentence.match(/[“”"″＂❝❞]/g)?.length, sentence).toBe(4);
      expect(sentence, sentence).not.toMatch(/’’|''/);
      // No sign that changes the direction of writing, and none that hides between letters.
      expect([...text].filter((c) => /[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/.test(c)), one.file).toEqual([]);
      await page.getByRole('button', { name: 'Keep my project' }).click();
    }
    await context.close();
  });

  it('opens a file with values that no slider can set as values that the Studio can set, says so, and its sliders move them', async () => {
    const { context, page } = await open({ hash: '#summary' });
    await page.waitForSelector('.summary');
    const far = JSON.parse(JSON.stringify(createProject('Far out'))) as Project;
    Object.assign(far.params, { baseSize: 30, scaleRatio: 2, density: 2, radius: 40 });
    Object.assign(far.base, { baseSize: 30, scaleRatio: 2, density: 2, radius: 40 });
    await page.locator('#project-file').setInputFiles({ name: 'far.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(far)) });
    await expect.poll(() => page.locator('.banner').innerText().catch(() => '')).toContain('4 design values in the file lay outside what the Studio can set.');
    await settle(page);
    const opened = (await stored(page))!;
    expect([opened.params.baseSize, opened.params.scaleRatio, opened.params.density, opened.params.radius]).toEqual([22, 1.62, 1.45, 999]);
    await page.goto(`${pageUrl}#size-scale`);
    await waitForStep(page, 'Text size');
    await page.locator('summary', { hasText: 'Adjust with sliders' }).click();
    const size = page.locator('#tune-baseSize');
    expect(await size.getAttribute('aria-valuetext')).toBe('22px');
    await size.focus();
    await page.keyboard.press('ArrowLeft');
    await settle(page);
    expect((await stored(page))!.params.baseSize).toBeLessThan(22);
    await context.close();
  });

  it('says in general words that it left out or corrected details of a file, when no other note says what changed', async () => {
    const { context, page } = await open({ hash: '#summary' });
    await page.waitForSelector('.summary');
    const odd = JSON.parse(JSON.stringify(pick(createProject('Odd'), 'nav', 'side-rail', '2026-11-13T09:00:00.000Z'))) as Project & { notesForOwner?: string };
    odd.notesForOwner = 'an extra part';
    odd.decisions['nav']!.at = 'yesterday';
    await page.locator('#project-file').setInputFiles({ name: 'odd.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(odd)) });
    await expect.poll(() => page.locator('.banner').innerText().catch(() => '')).toContain('The Studio left out or corrected details of the file that it does not use');
    // A file that the Studio wrote itself opens without that sentence.
    const own = JSON.stringify(pick(createProject('Own'), 'nav', 'side-rail', '2026-11-13T09:00:00.000Z'));
    await page.locator('#project-file').setInputFiles({ name: 'own.json', mimeType: 'application/json', buffer: Buffer.from(own) });
    await page.getByRole('button', { name: 'Open the file' }).click();
    await expect.poll(() => page.locator('.banner').innerText().catch(() => '')).toContain('Opened the project “Own”.');
    expect(await page.locator('.banner').innerText()).not.toContain('left out or corrected');
    await context.close();
  });

  it('stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing', async () => {
    const changed = JSON.parse(JSON.stringify(pick(createProject('Hand-edited'), 'density', 'comfortable', '2026-11-13T09:00:00.000Z'))) as Project & { extra?: string };
    changed.params.density = 1.37;
    changed.extra = 'a part the Studio does not use';
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(changed) } });
    await page.waitForSelector('main');
    expect(await page.locator('.banner').innerText()).toContain('Opening changed some details of your saved project. The Studio kept the copy as it was');
    expect(await page.locator('.banner').innerText()).toContain('its design values match no Option of this version of the Catalog');
    await settle(page);
    expect((await stored(page))?.decisions['density']).toMatchObject({ kind: 'tuned', optionId: null });
    expect((await keptCopies(page)).length).toBe(1);
    for (let i = 0; i < 2; i++) {
      await page.reload();
      await page.waitForSelector('main');
      await settle(page);
      expect(await page.locator('.banner').count()).toBe(0);
    }
    expect((await keptCopies(page)).length).toBe(1);
    await context.close();
  });

  it('brings a new notice into view below a long standing one on a very small window, and marks the strip as one that scrolls', async () => {
    for (const viewport of [{ width: 320, height: 480 }, { width: 640, height: 360 }]) {
      const { context, page } = await open({ viewport, storage: { [LOCAL_KEY]: '{"savedAt":"x","mark":"y","project":"{not json' } });
      await page.locator('.banner.hold').waitFor();
      // (A Direction of the first group: on a narrow window only that group is open.)
      await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
      await page.waitForSelector('.cards');
      await page.locator('.actions.sticky .primary').click();
      await page.locator('.top').getByRole('button', { name: 'Undo', exact: true }).click();
      const strip = page.locator('.banners');
      await expect.poll(() => strip.getAttribute('data-scrolls')).toBe('true');
      expect(await strip.getAttribute('tabindex')).toBe('0');
      // The ordinary notice, from its text to its last button, lies inside the visible part of the strip. The strip settles
      // within a few frames (its look changes once it scrolls), so the position is asked until it holds.
      const inside = (): Promise<boolean> =>
        page.evaluate(() => {
          const box = document.querySelector('.banners')!.getBoundingClientRect();
          const buttons = document.querySelectorAll('.banner:not(.hold) button');
          const last = buttons[buttons.length - 1]!.getBoundingClientRect();
          return last.bottom <= box.bottom + 1 && last.top >= box.top - 1;
        });
      await expect.poll(inside, { timeout: 3000, message: `${viewport.width}x${viewport.height}` }).toBe(true);
      await context.close();
    }
  });
});

describe('Studio: a person can choose by eye (findings U2-08, U2-06, U3-05; measured 2026-11-14)', () => {
  it('gives the cards of "Button style", "Corners", "Main color", and "Box edges and shadows" a close-up that shows the part the Step changes', async () => {
    const { context, page } = await open({ hash: '#button-finish', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(applyDirection(createProject('Close-ups'), 'soft-daylight')))) } });
    for (const [hash, part] of [['#button-finish', 'buttons'], ['#radius', 'buttons'], ['#accent', 'buttons'], ['#elevation', 'box']] as const) {
      await page.goto(`${pageUrl}${hash}`);
      await page.waitForSelector('.tiles iframe');
      // Every card's picture is the close-up; the large preview is not.
      // (The part is read from the page's own opening tag; the stylesheet names every part.)
      const parts = await page.evaluate(() => [...document.querySelectorAll('.tiles iframe')].map((frame) => /<body [^>]*data-focus="([a-z]+)"/.exec(frame.getAttribute('srcdoc') ?? '')?.[1] ?? ''));
      expect([...new Set(parts)], hash).toEqual([part]);
      expect(/<body [^>]*data-focus="([a-z]+)"/.exec(await page.locator('.large-preview iframe').getAttribute('srcdoc') ?? '')?.[1], hash).not.toBe(part);
    }
    // On "Button style" the four pictures used to be the same picture, with no button in it. Each picture now holds the
    // main button, and no two pictures are alike.
    await page.goto(`${pageUrl}#button-finish`);
    await page.waitForSelector('.tiles iframe');
    const frames = page.locator('.tiles label.option .thumb');
    const count = await frames.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) expect(await page.frameLocator('.tiles iframe').nth(i).locator('.hero .actions .btn-primary').isVisible(), `card ${i + 1}`).toBe(true);
    await page.waitForTimeout(600);
    const shots: string[] = [];
    for (let i = 0; i < count; i++) shots.push((await frames.nth(i).screenshot()).toString('base64'));
    expect(new Set(shots).size).toBe(count);
    await context.close();
  });

  it('keeps only the main button in view over the cards, and brings a chosen card to rest above it', async () => {
    const { context, page } = await open({ hash: '#accent', viewport: { width: 1100, height: 620 }, storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(applyDirection(createProject('Bar'), 'soft-daylight')))) } });
    await page.waitForSelector('.tiles iframe');
    const bar = page.locator('.actions.sticky');
    expect(await bar.locator('button').count()).toBe(1);
    expect((await bar.boundingBox())!.height).toBeLessThan(80);
    // The ninth card, chosen with its number key, is brought into view; its whole name lies above the bar.
    await page.locator('#main').focus();
    await page.keyboard.press('9');
    await page.waitForTimeout(400);
    const clear = await page.evaluate(() => {
      const title = document.querySelector('.option[data-shown] .option-title')!.getBoundingClientRect();
      const top = document.querySelector('.actions.sticky')!.getBoundingClientRect().top;
      return title.bottom <= top + 1;
    });
    expect(clear).toBe(true);
    await context.close();
  });

  it('lists the Directions in four groups; a narrow window opens the first group only, and a link opens another', async () => {
    const wide = await open({ hash: '#directions' });
    await wide.page.waitForSelector('.direction');
    expect(await wide.page.locator('.direction-group > summary h2').allTextContents()).toEqual(['Light and calm', 'Dark and dramatic', 'Warm and nostalgic', 'Bold and playful']);
    expect(await wide.page.evaluate(() => [...document.querySelectorAll<HTMLDetailsElement>('.direction-group')].map((g) => g.open))).toEqual([true, true, true, true]);
    await wide.context.close();
    const narrow = await open({ hash: '#directions', viewport: { width: 375, height: 760 } });
    await narrow.page.waitForSelector('.direction');
    const openGroups = (): Promise<boolean[]> => narrow.page.evaluate(() => [...document.querySelectorAll<HTMLDetailsElement>('.direction-group')].map((g) => g.open));
    expect(await openGroups()).toEqual([true, false, false, false]);
    await narrow.page.locator('.group-links a', { hasText: 'Dark and dramatic' }).click();
    expect(await openGroups()).toEqual([true, true, false, false]);
    await narrow.page.getByRole('button', { name: 'Start from Midnight Aurora', exact: true }).click();
    await narrow.page.waitForSelector('.cards');
    await narrow.context.close();
  });

  it('uses one name for the card of the current values, and one for the card that small variations start from', async () => {
    const { context, page } = await open({ hash: '#accent', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(applyDirection(createProject('Names'), 'soft-daylight')))) } });
    await page.waitForSelector('.tiles iframe');
    expect(await page.locator('.option-title').first().innerText()).toContain('Your design now');
    expect(await mainButton(page)).toBe('Keep “Your design now” and continue');
    await page.getByRole('button', { name: /^Show small variations/ }).click();
    expect(await page.locator('.option-title').first().innerText()).toContain('Starting point');
    expect(await mainButton(page)).toBe('Keep the starting point and continue');
    expect(await page.locator('main, aside').allInnerTexts().then((texts) => texts.join(' '))).not.toMatch(/my design|As it was/);
    await context.close();
  });
});

describe('Studio: skins, the same look in other colors (decision D52)', () => {
  const aurora = DIRECTIONS.find((d) => d.id === 'midnight-aurora')!;
  const cardOf = (page: Page, name: string) => page.locator('.direction', { has: page.getByRole('heading', { name, exact: true }) });

  it('offers a Direction’s skins on its card; a skin changes the picture and the colors a project starts with, and nothing else', async () => {
    const { context, page } = await open({ hash: '#directions' });
    await page.waitForSelector('.direction');
    const card = cardOf(page, 'Midnight Aurora');
    await card.scrollIntoViewIfNeeded();
    // The Direction's own colors first, then each skin of its record, by name.
    expect(await card.locator('.skin').allInnerTexts()).toEqual(['As designed', ...skinsOf(aurora).map((skin) => skin.name)]);
    expect(await card.locator('.skin input').first().isChecked()).toBe(true);
    const picture = (): Promise<string | null> => card.locator('iframe').getAttribute('srcdoc');
    const own = await picture();
    const skin = findSkin('sunset')!;
    expect(skinsOf(aurora)).toContain(skin);
    await card.locator('.skin', { hasText: skin.name }).click();
    await expect.poll(picture).not.toBe(own);
    expect(await card.locator('.skins .hint').first().innerText()).toBe(skin.what);
    // A second line says what a Skin does and does not change, and when it can be chosen.
    expect(await card.locator('.skins .hint').nth(1).innerText()).toContain('A Skin sets which color. How light and how vivid the color is stays as this Direction has it');
    await card.getByRole('button', { name: 'Start from Midnight Aurora', exact: true }).click();
    await page.waitForSelector('.cards');
    expect(await page.locator('.banner').innerText()).toContain('Started from “Midnight Aurora”, in the Skin “Sunset fade”.');
    await settle(page);
    const project = (await stored(page))!;
    const expected = skinParams(aurora, skin);
    expect(project.direction).toBe('midnight-aurora');
    // The project remembers the Skin, and the Studio names it wherever it names the start, also after a reload (finding U5-04).
    expect(project.skin).toBe('sunset');
    expect(await page.locator('.rail-direction strong').innerText()).toBe('Midnight Aurora in the Skin “Sunset fade”');
    await page.reload();
    await page.waitForSelector('.cards');
    expect(await page.locator('.rail-direction strong').innerText()).toBe('Midnight Aurora in the Skin “Sunset fade”');
    expect(project.params).toEqual(expected);
    expect(project.base).toEqual(expected);
    expect(project.decisions).toEqual({});
    // Colors changed; a value of layout, of letters, and of shape did not.
    expect(project.params.accentHue).not.toBe(aurora.params.accentHue);
    expect([project.params.hero, project.params.fontHeading, project.params.radius, project.params.accentLightness]).toEqual([aurora.params.hero, aurora.params.fontHeading, aurora.params.radius, aurora.params.accentLightness]);
    await context.close();
  });

  it('lets the keyboard choose a skin, and names the skin when a project is replaced', async () => {
    const { context, page } = await open({ hash: '#directions', storage: { [LOCAL_KEY]: envelope(worked('Has work')) } });
    await page.waitForSelector('.direction');
    const card = cardOf(page, 'Soft Daylight');
    await card.scrollIntoViewIfNeeded();
    const radios = card.locator('.skin input');
    await radios.first().focus();
    await page.keyboard.press('ArrowRight');
    expect(await radios.nth(1).isChecked()).toBe(true);
    const chosen = (await card.locator('.skin[data-picked]').innerText()).trim();
    expect(chosen).toBe(skinsOf(DIRECTIONS.find((d) => d.id === 'soft-daylight')!)[0]!.name);
    await card.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    await page.waitForSelector('.cards');
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain(`Started again from “Soft Daylight”, in the Skin “${chosen}”.`);
    // Undo brings the replaced project back.
    await page.locator('.banner:not(.hold)').getByRole('button', { name: 'Undo' }).click();
    await settle(page);
    expect((await stored(page))?.name).toBe('Has work');
    await context.close();
  });
});

describe('Studio: Overlays, small helpers over the page (decision D52)', () => {
  const box = (page: Page, id: string) => page.locator(`#overlay-${id}`);
  const preview = (page: Page) => page.frameLocator('.large-preview iframe');
  /** The names of the Overlays that a person can see in the preview. Text that is in the page and hidden does not count (code review of 2026-11-14, finding "tests 1"). */
  const drawn = (page: Page): Promise<string[]> => preview(page).locator('.ov-name:visible').allTextContents();

  it('comes after the last Step and before the Summary, and lists every Overlay of the Catalog with its three texts and its sources', async () => {
    const { context, page, errors, requests } = await open({ hash: `#${STEPS.at(-1)!.id}`, storage: { [LOCAL_KEY]: envelope(worked('Has work')) } });
    await waitForStep(page, STEPS.at(-1)!.name);
    await page.locator('.actions.sticky .btn.primary').click();
    await page.waitForSelector('.overlay-list');
    expect(new URL(page.url()).hash).toBe('#overlays');
    expect(await page.locator('.top-nav a[aria-current="page"]').innerText()).toBe('3. Overlays');
    // Keyboard focus moved to the new screen's heading, as on every other screen.
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('overlays-title');
    expect(await page.locator('.overlay .check span').allTextContents()).toEqual(OVERLAYS.map((o) => o.name));
    for (const overlay of OVERLAYS) {
      const card = page.locator('.overlay', { has: box(page, overlay.id) });
      const text = await card.innerText();
      for (const part of [overlay.what, overlay.chooseWhen, overlay.risk]) expect(text, overlay.id).toContain(part);
      expect(await card.locator('details.source li').count(), overlay.id).toBe(overlay.sources.length);
      expect(await box(page, overlay.id).isChecked(), overlay.id).toBe(false);
    }
    expect(await preview(page).locator('.ov-none').isVisible()).toBe(true);
    expect(await preview(page).locator('.ov-none').innerText()).toBe('No Overlay is switched on.');
    await page.getByRole('link', { name: 'Continue to the Summary' }).click();
    await page.waitForSelector('.summary');
    expect(await page.locator('section[aria-labelledby="overlays-heading"]').innerText()).toContain('No Overlay is switched on.');
    // The browser's Back button leads back to the Overlays.
    await page.goBack();
    await page.waitForSelector('.overlay-list');
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  });

  it('draws a switched-on Overlay in the preview, saves it, lists it on the Summary, keeps it through a reload, and lets Undo take it back', async () => {
    const { context, page } = await open({ hash: '#overlays', storage: { [LOCAL_KEY]: envelope(worked('Has work')) } });
    await page.waitForSelector('.overlay-list');
    const before = (await stored(page))!;
    expect('overlays' in before).toBe(false);
    // The keyboard switches an Overlay: the space bar on its checkbox.
    await box(page, 'confirm').focus();
    await page.keyboard.press('Space');
    await box(page, 'tooltip').check();
    await expect.poll(() => drawn(page)).toEqual(['Tooltip', '“Are you sure?” question']);
    expect(await page.locator('.showing').innerText()).toBe('2 Overlays are switched on. The preview shows each one open.');
    await settle(page);
    const saved = (await stored(page))!;
    expect(saved.overlays).toEqual(['tooltip', 'confirm']);
    // Nothing else in the project changed: an Overlay is a behavior, not a look.
    expect({ ...saved, overlays: undefined }).toEqual({ ...before, overlays: undefined });
    // The preview holds no script and nothing that a click could follow or send.
    const doc = (await page.locator('.large-preview iframe').getAttribute('srcdoc'))!;
    expect(doc).not.toMatch(/<script/i);
    expect(await page.locator('.large-preview iframe').getAttribute('sandbox')).toBe('');
    await page.reload();
    await page.waitForSelector('.overlay-list');
    expect(await box(page, 'tooltip').isChecked()).toBe(true);
    expect(await box(page, 'confirm').isChecked()).toBe(true);
    expect(await box(page, 'notice').isChecked()).toBe(false);
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.summary');
    expect(await page.locator('.overlay-summary li').allTextContents()).toEqual(['Tooltip', '“Are you sure?” question']);
    await page.locator('section[aria-labelledby="overlays-heading"] a').click();
    await page.waitForSelector('.overlay-list');
    // One more change, then Undo: the change goes, the earlier Overlays stay.
    await box(page, 'loading').check();
    await expect.poll(() => drawn(page)).toHaveLength(3);
    await page.getByRole('button', { name: /^Undo/ }).click();
    await expect.poll(() => drawn(page)).toEqual(['Tooltip', '“Are you sure?” question']);
    // Undo says what it took back, and no more than that.
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('Undone: the Overlays are back to how they were.');
    // The picture of each Overlay is really on screen, inside the preview's frame.
    expect(await preview(page).locator('.ov-stage:visible').count()).toBe(2);
    expect(await box(page, 'loading').isChecked()).toBe(false);
    await box(page, 'tooltip').uncheck();
    await box(page, 'confirm').uncheck();
    await settle(page);
    // With the last Overlay switched off, the project is as it was before: no empty list stays behind.
    expect((await stored(page))!).toEqual(before);
    await context.close();
  });

  it('shows the main button that stays in view in the Summary’s phone preview only, and never on the cards of a Step', async () => {
    const project = { ...worked('Has work'), overlays: ['sticky-call'] };
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(project) } });
    await page.waitForSelector('.summary');
    const bar = () => preview(page).locator('.sticky-call');
    await page.getByRole('button', { name: 'Phone', exact: true }).click();
    await expect.poll(() => bar().isVisible()).toBe(true);
    // The bar holds the main button at the lower edge of the preview, and the page beneath it still scrolls to its end.
    const frame = (await page.locator('.large-preview').boundingBox())!;
    const at = (await bar().boundingBox())!;
    expect(Math.abs(at.y + at.height - (frame.y + frame.height))).toBeLessThan(6);
    await page.getByRole('button', { name: 'Desktop', exact: true }).click();
    await expect.poll(() => bar().isVisible()).toBe(false);
    await page.evaluate(() => { window.location.hash = '#accent'; });
    await waitForStep(page, 'Main color');
    const pictures = await page.locator('iframe').evaluateAll((frames) => frames.map((f) => f.getAttribute('srcdoc') ?? ''));
    expect(pictures.length).toBeGreaterThan(3);
    for (const picture of pictures) expect(picture).not.toMatch(/<body [^>]*data-overlays=/);
    await context.close();
  });

  it('treats switched-on Overlays as work: a project that holds nothing else is kept as a copy, with Undo offered, when a Direction replaces it', async () => {
    const { context, page } = await open({ hash: '#overlays' });
    await page.waitForSelector('.overlay-list');
    await box(page, 'notice').check();
    await settle(page);
    await page.evaluate(() => { window.location.hash = '#directions'; });
    await page.waitForSelector('.direction');
    await page.getByRole('button', { name: 'Start from Soft Daylight', exact: true }).click();
    await page.waitForSelector('.cards');
    // As for any project without a Decision, the Studio does not ask; it says what it did, offers Undo, and keeps a copy.
    // Before the repair it replaced such a project without a word and without a kept copy.
    const notice = page.locator('.banner:not(.hold)');
    expect(await notice.innerText()).toContain('Started again from “Soft Daylight”.');
    expect(await notice.getByRole('button', { name: 'Undo' }).count()).toBe(1);
    await settle(page);
    const kept = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('refraction.project.backup.')).map((key) => localStorage.getItem(key) ?? ''));
    expect(kept.some((text) => text.includes('"overlays":["notice"]'))).toBe(true);
    await context.close();
  });

  it('makes no claim about saving beside the switches, and names the switched-on Overlays in the question before a new project (findings S5-01, S5-04)', async () => {
    const project = { ...worked('Has work'), overlays: ['tooltip', 'confirm', 'notice'] };
    // A saved copy that cannot be read: the Studio stops saving. No sentence on the screen may then say that a change is saved.
    const { context, page } = await open({ hash: '#overlays', storage: { [LOCAL_KEY]: '{"cut off' } });
    await page.waitForSelector('.overlay-list');
    expect(await page.locator('.save-state').innerText()).toContain('Not saving');
    expect(await page.locator('#main, .options').allInnerTexts().then((texts) => texts.join(' '))).not.toMatch(/\b(is|are) saved\b|saves your work/);
    await context.close();
    const second = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(project) } });
    await second.page.waitForSelector('.summary');
    await second.page.getByRole('button', { name: 'Start a new project…' }).click();
    expect(await second.page.locator('#confirm-body').innerText()).toContain('This clears the Direction, 1 Decision, 3 switched-on Overlays, the project name, and the Contrast checks setting.');
    await second.page.getByRole('button', { name: 'Keep it' }).click();
    await second.context.close();
  });

  it('says in words, at phone width, that some cards of the first two Steps draw the same picture (finding U5-07)', async () => {
    const { context, page } = await open({ hash: '#nav', viewport: { width: 390, height: 800 }, storage: { [LOCAL_KEY]: envelope(worked('Has work')) } });
    await waitForStep(page, 'Menu (navigation)');
    const note = 'At phone width some of these cards draw the same picture';
    expect(await page.locator('.cards').innerText()).toContain(note);
    await page.getByRole('button', { name: 'Desktop', exact: true }).click();
    await expect.poll(() => page.locator('.cards').innerText()).not.toContain(note);
    await context.close();
  });

  it('gives the Tab key one stop in the list of Steps on the Overlays screen: the link of the Overlays', async () => {
    const { context, page } = await open({ hash: '#overlays', storage: { [LOCAL_KEY]: envelope(worked('Has work')) } });
    await page.waitForSelector('.overlay-list');
    const stops = await page.locator('.rail a').evaluateAll((links) => links.filter((link) => (link as HTMLElement).tabIndex === 0).map((link) => link.textContent));
    expect(stops).toEqual(['Overlays: small helpers over the page']);
    await context.close();
  });

  it('leaves out an Overlay that this version does not know when it opens a saved project, keeps the original, and says so', async () => {
    const project = { ...worked('From a later version'), overlays: ['confirm', 'spotlight-tour'] };
    const { context, page } = await open({ hash: '#overlays', storage: { [LOCAL_KEY]: envelope(project) } });
    await page.waitForSelector('.overlay-list');
    expect(await page.locator('.banner').first().innerText()).toContain('One Overlay in the file is unknown to this version of the Studio. It was left out.');
    expect(await box(page, 'confirm').isChecked()).toBe(true);
    await settle(page);
    expect((await stored(page))!.overlays).toEqual(['confirm']);
    // The file as it was is kept as a copy, with the unknown Overlay still in it.
    const kept = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('refraction.project.backup.')).map((key) => localStorage.getItem(key) ?? ''));
    expect(kept.some((text) => text.includes('spotlight-tour'))).toBe(true);
    await context.close();
  });
});

describe('Studio: research rules on the Summary (decision D52)', () => {
  const rows = (page: Page) => page.locator('.research-list > li');
  const lines = (page: Page): Promise<string[]> => rows(page).locator('summary').allTextContents();

  it('measures every research rule on the open design and says "Holds" or "Does not hold" with the number, as the core computes it', async () => {
    const project = worked('Has work');
    const { context, page, errors } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(project) } });
    await page.waitForSelector('.research-list');
    const expected = researchReport(project.params, deriveTokens(project.params, project.a11y).css);
    expect(expected).toHaveLength(RESEARCH_RULES.length);
    expect(await lines(page)).toEqual(expected.map((r) => `${r.holds ? 'Holds' : 'Does not hold'}: ${r.rule.name}. ${r.found}`));
    // Each rule opens to its reason, to what a person must still check, to its strength, and to its sources.
    for (const [i, result] of expected.entries()) {
      const row = rows(page).nth(i);
      await row.locator('summary').click();
      const text = await row.innerText();
      for (const part of [result.rule.why, result.rule.notChecked, `Written on ${result.rule.reviewed}; no person has reviewed it yet.`]) expect(text, result.rule.id).toContain(part);
      expect(await row.locator('details ul li').count(), result.rule.id).toBe(result.rule.sources.length);
      // A rule whose value the sample website fixes says so, in place of passing for a measurement of the owner's choices.
      expect(text.includes('no Step changes this value'), result.rule.id).toBe(result.rule.setBy === 'template');
    }
    expect(errors).toEqual([]);
    await context.close();
  });

  it('says so when a design does not hold a rule, leads to the Step that changes it, and follows the change', async () => {
    const dense = applyDirection(createProject('Dense screen'), 'control-room');
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(dense) } });
    await page.waitForSelector('.research-list');
    const row = rows(page).filter({ hasText: 'Reading text is at least 16 pixels tall' });
    expect(await row.getAttribute('data-holds')).toBe('false');
    expect(await row.locator('summary').textContent()).toBe('Does not hold: Reading text is at least 16 pixels tall. Reading text is 15 pixels tall.');
    // The start was made this way, and the row says so without being opened (finding U5-16).
    expect(await row.locator('.on-purpose').innerText()).toBe('This project’s start, Control Room, is made this way on purpose. It is a working screen for people who use it all day: its reading text is 15 pixels tall, so that more rows are in view at once. For a public website the rule’s advice stands.');
    // The mark of a rule that does not hold is not color alone: the words say it, and the row has a wider edge.
    expect(await row.evaluate((el) => getComputedStyle(el).borderLeftWidth)).toBe('4px');
    await row.locator('summary').click();
    const sizes = STEPS.find((step) => step.owns.includes('baseSize'))!;
    await row.getByRole('link', { name: `“${sizes.name}”` }).click();
    await waitForStep(page, sizes.name);
    await page.locator('.option', { hasText: 'Medium text, medium headings' }).click();
    await page.locator('.actions.sticky .btn.primary').click();
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.research-list');
    expect(await row.locator('summary').textContent()).toBe('Holds: Reading text is at least 16 pixels tall. Reading text is 17 pixels tall.');
    expect(await page.locator('.on-purpose').count()).toBe(0);
    expect(await rows(page).evaluateAll((items) => items.filter((item) => item.getAttribute('data-holds') === 'false').length)).toBe(0);
    await context.close();
  });
});

describe('Studio: the saving table, cells that had no test (docs/reference/saving-table.md)', () => {
  const state = (page: Page): Promise<string> => page.locator('.save-state').innerText();
  const toBackground = (page: Page): Promise<void> =>
    page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  /** Ask the page whether it wants the browser's "leave this page?" question, as a closing page is asked. */
  const asksBeforeLeaving = (page: Page): Promise<boolean> =>
    page.evaluate(() => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    });

  it('opening, and another tab saves meanwhile: the tab does not say "Saved" over a project that storage no longer holds', async () => {
    // This tab's page database answers after 1.5 seconds, so the tab is still opening while the second tab saves.
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) }, pageDb: { doc: null, getDelay: 1500 }, dontWaitUntilOpen: true });
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Saved by the other tab while the first one opened');
    await settle(other);
    await page.waitForSelector('main:not(.loading)');
    await settle(page);
    expect((await stored(page))?.name).toBe('Saved by the other tab while the first one opened');
    // Either the tab shows the project that storage holds, or it says that it is not saving. It must not show the older
    // project under "Saved".
    const shown = await page.locator('#project-name').inputValue();
    const status = await state(page);
    expect(shown === 'Saved by the other tab while the first one opened' || status.startsWith('Not saving'), `shown “${shown}”, status “${status}”`).toBe(true);
    await context.close();
  });

  it('saved, and the tab goes to the background: nothing is written and nothing is kept', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Quiet')) } });
    await page.waitForSelector('.cards');
    await settle(page);
    const before = await rawStored(page, LOCAL_KEY);
    await toBackground(page);
    await settle(page);
    expect(await rawStored(page, LOCAL_KEY)).toBe(before);
    expect(await keptCopies(page)).toEqual([]);
    await context.close();
  });

  it('a save failed, and the tab goes to the background or is asked to close: the work stays on screen, the status stays true, and the browser is asked to ask', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('A')) } });
    await page.waitForSelector('.cards');
    expect(await fillStorage(page, 0)).toBe(true);
    await page.locator('#project-name').fill('A, with a longer name that does not fit');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    await toBackground(page);
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    expect(await page.locator('#project-name').inputValue()).toBe('A, with a longer name that does not fit');
    expect((await stored(page))?.name).toBe('A');
    // Neither saved nor kept: the Studio asks the browser to put its "leave this page?" question.
    expect(await asksBeforeLeaving(page)).toBe(true);
    expect(await state(page)).toContain('Cannot save here');
    // With room again, the same request to close saves the work, and no question is needed.
    await page.evaluate(() => window.localStorage.removeItem('test.capacity'));
    expect(await asksBeforeLeaving(page)).toBe(false);
    expect((await stored(page))?.name).toBe('A, with a longer name that does not fit');
    await context.close();
  });

  it('not saving, and the other tab saves a second time: "Keep this tab’s copy" keeps the other tab’s newest copy, not its first', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('Shared project')) } });
    await page.waitForSelector('.cards');
    const other = await context.newPage();
    await other.goto(pageUrl);
    await other.waitForSelector('.cards');
    await other.locator('#project-name').fill('Other tab, first save');
    await page.locator('.banner.hold').waitFor();
    await page.locator('#project-name').fill('This tab’s work');
    await other.locator('#project-name').fill('Other tab, second save');
    await settle(other);
    await page.locator('.banner.hold').getByRole('button', { name: 'Keep this tab’s copy' }).click();
    await settle(page);
    expect((await stored(page))?.name).toBe('This tab’s work');
    const kept = (await keptCopies(page)).map((copy) => (JSON.parse(copy.text) as Project).name);
    expect(kept).toContain('Other tab, second save');
    await context.close();
  });
});

describe('Studio: opening a file', () => {
  const choose = async (page: Page, name: string, content: string): Promise<void> => {
    await page.locator('#project-file').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(content) });
  };
  const status = (page: Page): Promise<string> => page.locator('.summary-main p.note[role="status"]').innerText().catch(() => '');

  it('refuses a file that is not a project, in fixed words that repeat nothing from the file (finding SEC-12)', async () => {
    const { context, page } = await open({ hash: '#summary' });
    await page.waitForSelector('.summary');
    await choose(page, 'notes.json', '{"hello":"world"}');
    await expect.poll(() => status(page)).toBe('That file was not opened. This is not a Refraction project file. Your open project is unchanged.');
    const marker = 'CALL-555-0100-TO-REPAIR-THIS-FILE';
    const bad = { ...createProject('x'), decisions: { [marker]: { stepId: marker, optionId: marker, kind: marker, rejected: [], values: {}, at: marker } } };
    await choose(page, 'bad.json', JSON.stringify(bad));
    await expect.poll(() => status(page)).toContain('The problem is in the part that holds the Decisions. Your open project is unchanged.');
    expect(await page.locator('body').innerText()).not.toContain(marker);
    await choose(page, 'broken.json', '{"schemaVersion": 2, "name": ');
    await expect.poll(() => status(page)).toBe('That file was not opened. It is not a Refraction project file. Your open project is unchanged.');
    await context.close();
  });

  it('asks before a file replaces work, and Undo brings the work back (findings FTU-25, SEC-06)', async () => {
    const mine = pick(createProject('My work'), 'nav', 'side-rail');
    const file = JSON.stringify(applyDirection(createProject('A file I only wanted to look at'), 'poster-block'));
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(mine) } });
    await page.waitForSelector('.summary');
    await choose(page, 'other.json', file);
    const dialog = page.locator('dialog.confirm');
    await dialog.waitFor();
    expect(await dialog.innerText()).toContain('Replace the open project with this file?');
    // Focus starts on the safe answer, and Escape gives the same answer.
    expect(await page.evaluate(() => document.activeElement?.textContent)).toBe('Keep my project');
    await page.keyboard.press('Escape');
    await expect.poll(() => dialog.count()).toBe(0);
    expect(await page.locator('#project-name').inputValue()).toBe('My work');
    await choose(page, 'other.json', file);
    await dialog.getByRole('button', { name: 'Open the file' }).click();
    await expect.poll(() => page.locator('#project-name').inputValue()).toBe('A file I only wanted to look at');
    await page.locator('.banner').getByRole('button', { name: 'Undo' }).click();
    await expect.poll(() => page.locator('#project-name').inputValue()).toBe('My work');
    await context.close();
  });

  it('asks before a new Direction or a new project clears Decisions, and says everything that is cleared (findings FTU-24, FTU-41)', async () => {
    const mine = { ...pick(applyDirection(createProject('Bakery site'), 'soft-daylight'), 'nav', 'side-rail'), a11y: 'enforce' as const };
    const { context, page } = await open({ hash: '#directions', storage: { [LOCAL_KEY]: envelope(mine) } });
    await page.getByRole('button', { name: 'Start from Paper and Ink' }).click();
    const dialog = page.locator('dialog.confirm');
    expect(await dialog.innerText()).toContain('clears your 1 Decision');
    await dialog.getByRole('button', { name: 'Keep my project' }).click();
    await page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await page.getByRole('button', { name: 'Start a new project…' }).click();
    const text = await dialog.innerText();
    for (const word of ['Direction', '1 Decision', 'project name', 'Contrast checks']) expect(text).toContain(word);
    await context.close();
  });

  it('renders hostile text from a saved project as inert text', async () => {
    const hostile = '"><img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';
    const project = createProject(hostile.slice(0, 110));
    project.content = { ...project.content, business: hostile, headline: hostile, tag: hostile, nav: [hostile], services: [{ title: hostile, body: hostile }], facts: [{ value: hostile, label: hostile }], fees: [{ item: hostile, price: hostile }], promise: hostile, footerNote: hostile, hours: hostile, aboutBody: hostile, contactBody: hostile };
    const { context, page, errors, requests } = await open({ hash: '#nav', storage: { [LOCAL_KEY]: envelope(project) } });
    await waitForStep(page, 'Menu (navigation)');
    await page.waitForSelector('.large-preview iframe');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(await page.locator('#project-name').inputValue()).toBe(hostile.slice(0, 110));
    const documents = await page.locator('iframe').evaluateAll((frames) => frames.map((f) => f.getAttribute('srcdoc') ?? ''));
    expect(documents.length).toBeGreaterThan(3);
    for (const doc of documents) {
      const body = doc.replace(/<style>[\s\S]*?<\/style>/, '');
      expect(body).not.toMatch(/<script|<img/i);
      expect(body).toContain('&lt;script&gt;');
    }
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  });
});

describe('Studio: addresses and the browser’s Back button', () => {
  it('treats an address that names no screen as no address, and its links keep working (finding SEC-04)', async () => {
    for (const hash of ['#constructor', '#__proto__', '#toString', '#hasOwnProperty', '#not-a-step', '#<script>alert(1)</script>']) {
      const { context, page, errors } = await open({ hash });
      await page.waitForSelector('.direction');
      await page.locator('.top-nav a', { hasText: 'Summary' }).click();
      await page.waitForSelector('.summary');
      await page.locator('.top-nav a', { hasText: 'Steps' }).click();
      await page.waitForSelector('.cards');
      expect(errors, hash).toEqual([]);
      await context.close();
    }
  });

  it('adds one history entry per Step and none per comparison, so Back returns to the previous Step (finding FTU-16)', async () => {
    const { context, page } = await open({ hash: '#nav' });
    await waitForStep(page, 'Menu (navigation)');
    const before = await page.evaluate(() => window.history.length);
    for (const key of ['2', '3', '4', '1', '2']) await page.keyboard.press(key);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.history.length)).toBe(before);
    await page.keyboard.press('Enter');
    await waitForStep(page, 'First screen');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');
    await waitForStep(page, 'List of services');
    expect(await page.evaluate(() => window.history.length)).toBe(before + 2);
    await page.goBack();
    await waitForStep(page, 'First screen');
    await page.goBack();
    await waitForStep(page, 'Menu (navigation)');
    await context.close();
  });
});

describe('Studio: its own interface', () => {
  it('has no serious or critical axe finding on any screen, in light and dark', async () => {
    for (const colorScheme of ['light', 'dark'] as const) {
      for (const hash of ['#directions', '#nav', '#typeface', '#accent', '#motion', '#overlays', '#summary', '#licences']) {
        const { context, page } = await open({ hash });
        await page.emulateMedia({ colorScheme });
        await page.waitForSelector('main');
        await page.waitForTimeout(300);
        await page.evaluate(axeSource);
        const violations = await page.evaluate(async () => {
          const axe = (window as unknown as { axe: { run: (root: Document, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: { target: unknown[] }[] }[] }> } }).axe;
          const result = await axe.run(document, { iframes: false, runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
          return result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} (${v.nodes.length}): ${String(v.nodes[0]?.target)}`);
        });
        expect(violations, `${hash} in ${colorScheme}`).toEqual([]);
        await context.close();
      }
    }
  });

  it('shows every notice in a row of its own, where a mouse can dismiss it (finding FTU-27)', async () => {
    const { context, page } = await open({ hash: '#nav' });
    await waitForStep(page, 'Menu (navigation)');
    await page.locator('label.option', { hasText: 'Links in a left column' }).click();
    await page.locator('.rail a[href="#hero"]').click();
    const banner = page.locator('.banner');
    await banner.waitFor();
    const box = (await banner.boundingBox())!;
    const main = (await page.locator('.work').boundingBox())!;
    const top = (await page.locator('.top').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(top.y + top.height - 1);
    expect(main.y).toBeGreaterThanOrEqual(box.y + box.height - 1);
    await banner.getByRole('button', { name: 'Dismiss' }).click();
    await expect.poll(() => banner.count()).toBe(0);
    await context.close();
  });

  it('dresses the Studio in the project’s design when asked, and remembers the choice (findings SEC-11, FTU-28, P-10)', async () => {
    const { context, page } = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(applyDirection(createProject('Dark one'), 'midnight-aurora')) } });
    await page.waitForSelector('.summary');
    // Paint the page background onto a canvas and read one pixel: a measure that does not depend on how the browser writes the color.
    const lightness = (): Promise<number> =>
      page.evaluate(() => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return (r! + g! + b!) / 3;
      });
    expect(await lightness()).toBeGreaterThan(200);
    await page.locator('#studio-look').check();
    await expect.poll(lightness).toBeLessThan(60);
    await page.reload();
    await page.waitForSelector('.summary');
    expect(await page.locator('#studio-look').isChecked()).toBe(true);
    await expect.poll(lightness).toBeLessThan(60);
    await context.close();
  });

  it('carries the licence texts of the fonts and the code it ships (finding L-01)', async () => {
    const { context, page } = await open({ hash: '#licences' });
    const text = await page.locator('main.licences').innerText();
    expect(text).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(text).toContain('Permission is hereby granted, free of charge');
    expect(text).toContain('Copyright (c) Meta Platforms, Inc. and affiliates.');
    // Playfair and Literata are listed; the two typefaces that reserve their names are not, and no font reserves a name.
    expect(text).toContain('Playfair (@fontsource-variable/playfair)');
    expect(text).toContain('Literata (@fontsource-variable/literata)');
    expect(text).not.toMatch(/Playfair Display|Source Serif|reserves the name/);
    expect(await page.locator('.notice-list > li').count()).toBe(18);
    await context.close();
  });
});

describe('Studio: layout', () => {
  it('holds its height still in narrow and zoomed windows (finding FTU-01)', async () => {
    for (const viewport of [{ width: 720, height: 450 }, { width: 400, height: 860 }, { width: 1099, height: 700 }]) {
      for (const hash of ['#nav', '#accent', '#overlays', '#summary']) {
        const { context, page } = await open({ hash, viewport });
        await page.waitForSelector('.large-preview iframe');
        const samples: number[] = [];
        for (let i = 0; i < 5; i++) {
          samples.push(await page.evaluate(() => document.documentElement.scrollHeight));
          await page.waitForTimeout(350);
        }
        const label = `${hash} at ${viewport.width}x${viewport.height}: ${samples.join(', ')}`;
        expect(Math.max(...samples) - Math.min(...samples), label).toBeLessThanOrEqual(2);
        expect(samples[0]!, label).toBeLessThan(viewport.height * 14);
        const pane = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
        expect(pane, `preview pane, ${label}`).toBeGreaterThanOrEqual(190);
        expect(pane, `preview pane, ${label}`).toBeLessThanOrEqual(viewport.height);
        await context.close();
      }
    }
  });

  it('gives the large preview the room that is left over in a wide window (finding FTU-17)', async () => {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const { context, page } = await open({ hash: '#accent', viewport });
      await page.waitForSelector('.large-preview iframe');
      const pane = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
      expect(pane, `${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(viewport.height * 0.3);
      await page.focus('.skip-preview');
      const paneFocused = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
      expect(Math.abs(paneFocused - pane)).toBeLessThanOrEqual(1);
      await context.close();
    }
  });

  it('never scrolls sideways at 320, 375, and 400 pixels wide', async () => {
    for (const width of [320, 375, 400]) {
      for (const hash of ['#directions', '#nav', '#accent', '#overlays', '#summary', '#licences']) {
        const { context, page } = await open({ hash, viewport: { width, height: 800 } });
        await page.waitForSelector('main');
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${hash} at ${width}`).toBeLessThanOrEqual(1);
        await context.close();
      }
    }
  });

  it('opens a phone-wide window at phone width, and starts each Step at its top', async () => {
    const { context, page } = await open({ viewport: { width: 400, height: 860 } });
    await page.getByRole('button', { name: 'Start from Soft Daylight' }).click();
    await waitForStep(page, 'Menu (navigation)');
    expect(await page.locator('.stage .segmented button[aria-pressed="true"]').innerText()).toBe('Phone');
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(40);
    await context.close();
  });

  it('carries a change of the preview width to the large preview and to every card’s picture, and leaves a fixed-width Step’s cards alone', async () => {
    // The cards' pictures follow the large preview at lower priority (measured 2026-11-14: together they held the page for
    // 70 to 110 milliseconds). They must still arrive, all of them, and the grid of cards with them.
    const { context, page } = await open({ hash: '#typeface', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Width')))) } });
    await page.waitForSelector('.tiles iframe');
    const widths = (): Promise<{ large: string; cards: string[]; grid: string | null }> =>
      page.evaluate(() => ({
        large: (document.querySelector('.large-preview iframe') as HTMLElement).style.width,
        cards: [...new Set([...document.querySelectorAll<HTMLElement>('.tiles iframe')].map((frame) => frame.style.width))],
        grid: document.querySelector('.tiles')!.getAttribute('data-device'),
      }));
    const stage = page.locator('.stage .segmented');
    for (const [name, px, device] of [['Phone', '375px', 'phone'], ['Tablet', '768px', 'tablet'], ['Desktop', '1280px', 'desktop'], ['Phone', '375px', 'phone']] as const) {
      await stage.getByRole('button', { name, exact: true }).click();
      expect(await stage.locator('button[aria-pressed="true"]').innerText(), 'the pressed button answers at once').toBe(name);
      await expect.poll(widths, { timeout: 4000 }).toEqual({ large: px, cards: [px], grid: device });
    }
    // A Step that draws its cards at a width of its own ("Corners": a close-up of the button, 280 pixels) keeps that width; only the large preview changes.
    await page.goto(`${pageUrl}#radius`);
    await waitForStep(page, 'Corners');
    await page.waitForSelector('.tiles iframe');
    await stage.getByRole('button', { name: 'Tablet', exact: true }).click();
    await expect.poll(widths, { timeout: 4000 }).toEqual({ large: '768px', cards: ['280px'], grid: 'detail' });
    await context.close();
  });
});

describe('Studio: plain words on every screen (decision D38, finding U2-03)', () => {
  it('shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, on the Overlays, and on the Summary, with no error and no outside request', async () => {
    const { context, page, errors, requests } = await open({ hash: '#directions', storage: { [LOCAL_KEY]: envelope(JSON.parse(JSON.stringify(worked('Weeks of work')))) } });
    // Names are not descriptions: the name of a font or of a Direction may hold a trade word ("Public Sans", "Cobalt Wash").
    const properNames = [...Object.values(FONTS).map((font) => font.label), ...DIRECTIONS.map((d) => d.name), ...CITED_NAMES];
    /**
     * The words on the screen with every fold opened. The sample website is not included (it sits in frames).
     * The list of sources is returned apart: it names documents by their titles, so only the vague-phrase rule applies to it.
     */
    const words = (): Promise<{ shown: string; sources: string }> =>
      page.evaluate(() => {
        document.querySelectorAll('details').forEach((fold) => { fold.open = true; });
        const lists = [...document.querySelectorAll<HTMLElement>('details.source ul')];
        const sources = lists.map((list) => list.innerText).join('\n');
        lists.forEach((list) => { list.hidden = true; });
        const shown = document.body.innerText;
        lists.forEach((list) => { list.hidden = false; });
        return { shown, sources };
      });
    const check = async (where: string): Promise<void> => {
      const { shown, sources } = await words();
      expect(shown.length, where).toBeGreaterThan(300);
      expect(tradeWordsOutsideBrackets(shown, properNames), where).toEqual([]);
      expect(vaguePhrasesIn(shown), where).toEqual([]);
      expect(vaguePhrasesIn(sources), `${where}, list of sources`).toEqual([]);
    };
    await page.waitForSelector('.direction');
    await check('the Directions');
    let sourceLists = 0;
    for (const step of STEPS) {
      await page.evaluate((id) => { window.location.hash = `#${id}`; }, step.id);
      await waitForStep(page, step.name);
      await check(`the Step “${step.name}”`);
      sourceLists += await page.locator('details.source ul li').count();
    }
    // The check on source lines looked at real lines: every Step lists at least one source.
    expect(sourceLists).toBeGreaterThanOrEqual(STEPS.length);
    await page.evaluate(() => { window.location.hash = '#overlays'; });
    await page.waitForSelector('.overlay-list');
    await check('the Overlays');
    expect(await page.locator('details.source ul li').count()).toBeGreaterThanOrEqual(OVERLAYS.length);
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.summary');
    await check('the Summary');
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  }, 120000);
});

describe('Studio: a save that another tab replaces in the same moment (finding F-18, SPEC.md section 2.1)', () => {
  const state = (page: Page): Promise<string> => page.locator('.save-state').innerText();
  const SAVED = 'Saved in this browser, on this computer';
  const see = (page: Page, visibility: 'hidden' | 'visible'): Promise<void> =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'visibilityState', { value, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, visibility);
  const leftEntries = async (page: Page): Promise<(string | undefined)[][]> =>
    (await keptCopies(page)).map((copy) => [copy.state, (JSON.parse(copy.text) as Project).name]);
  /** A tab that has just saved a change: the status line says so, and the save is younger than 2 seconds. */
  const justSaved = async (name: string): Promise<{ context: BrowserContext; page: Page }> => {
    const opened = await open({ storage: { [LOCAL_KEY]: envelope(worked('Before')) } });
    await opened.page.waitForSelector('.cards');
    await opened.page.locator('#project-name').fill(name);
    await expect.poll(() => state(opened.page), { interval: 50 }).toBe(SAVED);
    return opened;
  };

  it('saved a moment ago, and the tab goes to the background: the work goes into an entry of the page’s own, and the entry goes when the page lives on', async () => {
    const { context, page } = await justSaved('Saved, then hidden');
    const before = await rawStored(page, LOCAL_KEY);
    await see(page, 'hidden');
    expect(await leftEntries(page)).toEqual([['leaving', 'Saved, then hidden']]);
    // The saved project is not written a second time.
    expect(await rawStored(page, LOCAL_KEY)).toBe(before);
    await see(page, 'visible');
    expect(await keptCopies(page)).toEqual([]);
    expect(await state(page)).toBe(SAVED);
    await context.close();
  });

  it('saved more than 2 seconds ago, and the tab goes to the background or closes: nothing is written and nothing is kept', async () => {
    const { context, page } = await justSaved('Saved long ago');
    await page.waitForTimeout(2100);
    const before = await rawStored(page, LOCAL_KEY);
    await see(page, 'hidden');
    expect(await keptCopies(page)).toEqual([]);
    await page.close({ runBeforeUnload: true });
    const look = await context.newPage();
    await look.goto(blankUrl.href);
    expect(await keptCopies(look)).toEqual([]);
    expect(await rawStored(look, LOCAL_KEY)).toBe(before);
    await context.close();
  });

  it('saved a moment ago, and the tab closes: the next opening removes the entry of its own when the saved project holds the same work', async () => {
    const { context, page } = await justSaved('Saved, then closed');
    await page.close({ runBeforeUnload: true });
    const look = await context.newPage();
    await look.goto(blankUrl.href);
    expect(await leftEntries(look)).toEqual([['leaving', 'Saved, then closed']]);
    expect((await stored(look))?.name).toBe('Saved, then closed');
    await look.goto(pageUrl);
    await look.waitForSelector('.cards');
    expect(await keptCopies(look)).toEqual([]);
    expect(await look.locator('.banner').count()).toBe(0);
    await context.close();
  });

  it('keeps for good, and reports, the saved work of a closing page that another page’s closing write replaced in the same moment (finding F-18)', async () => {
    const { context, page } = await justSaved('Saved by tab B');
    await page.close({ runBeforeUnload: true });
    // Tab A's closing write lands a few milliseconds after tab B's save, and tab B could not see it. The test stages that write.
    const look = await context.newPage();
    await look.goto(blankUrl.href);
    await look.evaluate(([key, value]) => window.localStorage.setItem(key!, value!), [LOCAL_KEY, envelope(worked('Written by tab A'), '2026-11-15T10:00:00.000Z')]);
    await look.goto(pageUrl);
    await look.waitForSelector('.cards');
    expect(await look.locator('.banner:not(.hold)').innerText()).toContain('its last work is not in the saved project');
    expect(await leftEntries(look)).toEqual([[undefined, 'Saved by tab B']]);
    expect((await stored(look))?.name).toBe('Written by tab A');
    // The Summary lists the copy with a reason that is true of it, and a second opening says nothing more.
    await look.locator('.banner:not(.hold)').getByRole('button', { name: 'Go to the Summary' }).click();
    await look.waitForSelector('.kept-copies');
    expect(await look.locator('.kept-copies').innerText()).toContain('saved it a moment before that page closed');
    await look.reload();
    await look.waitForSelector('main');
    expect(await look.locator('.banner').count()).toBe(0);
    await context.close();
  });

  it('saved a moment ago, with no room in storage for the entry of its own: the tab closes as before, and nothing fails', async () => {
    const { context, page } = await justSaved('No room');
    expect(await fillStorage(page, 0)).toBe(true);
    await see(page, 'hidden');
    expect(await keptCopies(page)).toEqual([]);
    expect(await state(page)).toBe(SAVED);
    expect((await stored(page))?.name).toBe('No room');
    await context.close();
  });
});

describe('Studio: the typefaces Playfair and Literata (SPEC.md section 2.2)', () => {
  /** The font family that the preview draws an element in, and whether the browser has that font ready. */
  const drawn = (page: Page, selector: string): Promise<{ family: string; ready: boolean }> =>
    page.frameLocator('.stage iframe').locator(selector).first().evaluate((el) => {
      const family = getComputedStyle(el).fontFamily.split(',')[0]!.replace(/"/g, '').trim();
      return { family, ready: el.ownerDocument.fonts.check(`16px "${family}"`) };
    });

  it('draws headings in Playfair and reading text in Literata where an Option names them', async () => {
    const { context, page } = await open({ hash: '#typeface', storage: { [LOCAL_KEY]: envelope(worked('Letters')) } });
    await waitForStep(page, 'Letter style (typeface)');
    await page.locator('label.option', { hasText: 'Elegant thick-and-thin headings' }).click();
    await expect.poll(() => drawn(page, 'h1')).toEqual({ family: 'Playfair Variable', ready: true });
    await page.locator('label.option', { hasText: 'Letters with small feet throughout' }).click();
    await expect.poll(() => drawn(page, 'h1')).toEqual({ family: 'Literata Variable', ready: true });
    await expect.poll(() => drawn(page, 'p')).toEqual({ family: 'Literata Variable', ready: true });
    await context.close();
  });

  it('opens a stored project that names the two replaced typefaces with the replacements, a notice, and a kept copy; a reload says nothing more', async () => {
    const old = JSON.parse(JSON.stringify(worked('Saved earlier'))) as Project;
    const fonts = { fontHeading: 'playfair-display', fontBody: 'source-serif-4' };
    const before = { ...old, params: { ...old.params, ...fonts }, base: { ...old.base, ...fonts } };
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(before) } });
    await page.waitForSelector('.cards');
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('This project used the typefaces “Playfair Display” and “Source Serif 4”, which the Studio no longer carries. It now shows “Playfair” and “Literata” in their place; nothing else changed.');
    await settle(page);
    expect((await stored(page))?.params).toMatchObject({ fontHeading: 'playfair', fontBody: 'literata' });
    // The project as it was is among the kept copies, word for word.
    expect((await keptCopies(page)).map((copy) => copy.text)).toEqual([JSON.stringify(before)]);
    await page.reload();
    await page.waitForSelector('.cards');
    expect(await page.locator('.banner').count()).toBe(0);
    expect((await keptCopies(page)).length).toBe(1);
    await context.close();
  });
});

describe('Studio: a Direction of the owner’s own (SPEC.md section 2.3; docs/reference/saving-table.md)', () => {
  const OWN_KEY = 'refraction.directions.own';
  const KEEP = 'Keep this design as a Direction of my own';
  type Own = { id: string; name: string; mood: string; bestFor: string; risk: string; params: Project['params'] };
  const ownStored = async (page: Page): Promise<Own[]> => (JSON.parse((await rawStored(page, OWN_KEY)) ?? '{"directions":[]}') as { directions: Own[] }).directions;
  /** Fill the form on the Summary and press the button. */
  const keepAs = async (page: Page, name: string, texts: { mood?: string; bestFor?: string; risk?: string } = {}): Promise<void> => {
    await page.locator('#own-name').fill(name);
    await page.locator('#own-mood').fill(texts.mood ?? '');
    await page.locator('#own-best').fill(texts.bestFor ?? '');
    await page.locator('#own-risk').fill(texts.risk ?? '');
    await page.getByRole('button', { name: KEEP }).click();
  };
  const summary = async (name: string): Promise<Session> => {
    const session = await open({ hash: '#summary', storage: { [LOCAL_KEY]: envelope(worked(name)) } });
    await session.page.waitForSelector('#own-direction');
    return session;
  };

  it('keeps the design on screen as a Direction of the owner’s own, shows it under “Your own” after a reload, and starts a project that holds exactly the kept design', async () => {
    const { context, page, errors } = await summary('Harbor project');
    const design = (await stored(page))!.params;
    // The Studio says what the design starts with, and proposes the mood.
    expect(await page.locator('#own-direction .starts-with').innerText()).toMatch(/^This design starts with (no contrast note|\d+ contrast notes?) and (no pair|\d+ pairs?) of Decisions that pull against each other\. You may keep it all the same\.$|^This design starts with no contrast note and no Decisions that pull against each other\.$/);
    await keepAs(page, 'Harbor evening', { bestFor: 'Small practices.', risk: 'Check it on a phone.' });
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('Kept “Harbor evening” as a Direction of your own. You find it on the Directions screen, under “Your own”.');
    const [own] = await ownStored(page);
    expect(own).toMatchObject({ name: 'Harbor evening', bestFor: 'Small practices.', risk: 'Check it on a phone.', params: design });
    expect(own!.mood).toMatch(/^A (light|dark) page /);
    // The form is empty again, so that a second press cannot keep the same Direction twice.
    expect(await page.locator('#own-name').inputValue()).toBe('');
    await page.reload();
    await page.goto(`${pageUrl}#directions`);
    const card = page.locator('#group-own .direction');
    await card.waitFor();
    expect(await page.locator('#group-own summary h2').textContent()).toBe('Your own');
    const text = await card.innerText();
    for (const part of ['Harbor evening', 'Small practices.', 'Check it on a phone.', 'Your own; no source, not reviewed']) expect(text).toContain(part);
    expect(await card.locator('.skins').count()).toBe(0);
    // Change the open project, then start again from the own Direction: the design is the kept one, value by value.
    await page.goto(`${pageUrl}#theme`);
    await waitForStep(page, 'Light or dark');
    await page.locator('label.option').nth(1).click();
    await page.locator('.actions.sticky .primary').click();
    await page.goto(`${pageUrl}#directions`);
    await card.getByRole('button', { name: 'Start from Harbor evening' }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    await settle(page);
    const started = (await stored(page))!;
    expect(started.params).toEqual(design);
    expect(started.base).toEqual(design);
    expect(started.direction).toBe(own!.id);
    expect(started.decisions).toEqual({});
    // The project still names its start after a reload.
    await page.reload();
    await page.goto(`${pageUrl}#summary`);
    await page.waitForSelector('#own-direction');
    expect(await page.locator('main').innerText()).toContain('This project started from Harbor evening');
    expect((await stored(page))!.direction).toBe(own!.id);
    expect(errors).toEqual([]);
    await context.close();
  });

  it('refuses an empty name and a name in use, in words beside the button, and keeps what the owner typed', async () => {
    const { context, page } = await summary('Names');
    await keepAs(page, '   ', { risk: 'Typed before the refusal.' });
    expect(await page.locator('#own-direction [role="alert"]').innerText()).toBe('Give the Direction a name.');
    expect(await page.locator('#own-risk').inputValue()).toBe('Typed before the refusal.');
    await keepAs(page, 'paper and ink');
    expect(await page.locator('#own-direction [role="alert"]').innerText()).toBe('Another Direction already has the name “paper and ink”. Choose another name.');
    await keepAs(page, 'Mine');
    await page.locator('.banner:not(.hold)').waitFor();
    await keepAs(page, 'MINE');
    expect(await page.locator('#own-direction [role="alert"]').innerText()).toBe('Another Direction already has the name “MINE”. Choose another name.');
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['Mine']);
    // The fields stop at their limits.
    expect(await page.locator('#own-name').getAttribute('maxlength')).toBe('60');
    expect(await page.locator('#own-mood').getAttribute('maxlength')).toBe('200');
    await context.close();
  });

  it('draws markup and script in every field of an own Direction as text, and runs nothing', async () => {
    const { context, page, errors, requests } = await summary('Hostile');
    let dialogs = 0;
    page.on('dialog', (dialog) => { dialogs++; void dialog.dismiss(); });
    const attack = '<img src=x onerror=alert(1)><script>alert(2)</script>\u202e';
    await keepAs(page, `N ${attack}`, { mood: `M ${attack}`, bestFor: `B ${attack}`, risk: `R ${attack}` });
    await page.locator('.banner:not(.hold)').waitFor();
    await page.goto(`${pageUrl}#directions`);
    const card = page.locator('#group-own .direction');
    await card.waitFor();
    expect(await card.locator('img, script').count()).toBe(0);
    expect(await card.locator('h3').innerText()).toBe('N <img src=x onerror=alert(1)><script>alert(2)</script>');
    expect(await card.innerText()).toContain('M <img src=x onerror=alert(1)><script>alert(2)</script>');
    await card.getByRole('button', { name: /^Start from N/ }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    await settle(page);
    expect(await page.locator('.banner img, .banner script, main img, main script').count()).toBe(0);
    expect(dialogs).toBe(0);
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  });

  it('says so when storage has no room for an own Direction, and keeps none', async () => {
    const { context, page } = await summary('Full');
    await keepAs(page, 'First');
    await page.locator('.banner:not(.hold)').waitFor();
    expect(await fillStorage(page, 0)).toBe(true);
    await keepAs(page, 'Second, with no room');
    expect(await page.locator('#own-direction [role="alert"]').innerText()).toBe('The Studio could not keep the Direction: this browser’s storage is full or blocked. Nothing was changed.');
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['First']);
    expect(await page.locator('#own-name').inputValue()).toBe('Second, with no room');
    await context.close();
  });

  it('adds to the list that another tab stored, and shows the other tab’s Direction when the owner comes back', async () => {
    const { context, page } = await summary('Two tabs');
    const other = await context.newPage();
    await other.goto(`${pageUrl}#summary`);
    await other.waitForSelector('#own-direction');
    await keepAs(other, 'Kept in the other tab');
    await other.locator('.banner:not(.hold)').waitFor();
    // This tab opened before the other tab kept its Direction. Its own keep must add to that list, not replace it.
    await keepAs(page, 'Kept in this tab');
    await page.locator('.banner:not(.hold)').waitFor();
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['Kept in the other tab', 'Kept in this tab']);
    // The other tab learns of it when the owner comes back to it.
    await other.goto(`${pageUrl}#directions`);
    await other.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect.poll(() => other.locator('#group-own .direction h3').allInnerTexts()).toEqual(['Kept in the other tab', 'Kept in this tab']);
    await context.close();
  });

  it('keeps a stored list of own Directions that it cannot read, before a new Direction replaces it', async () => {
    const damaged = '{"kind":"refraction-own-directions","version":1,"directions":[{"id":"own-old1"';
    const { context, page } = await open({ hash: '#directions', storage: { [LOCAL_KEY]: envelope(worked('Damaged list')), [OWN_KEY]: damaged } });
    await page.waitForSelector('.direction-group');
    expect(await page.locator('#group-own').count()).toBe(0);
    await page.goto(`${pageUrl}#summary`);
    await page.waitForSelector('#own-direction');
    await keepAs(page, 'After the damage');
    await page.locator('.banner:not(.hold)').waitFor();
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['After the damage']);
    expect((await keptCopies(page)).filter((copy) => copy.text === damaged).map((copy) => copy.why)).toEqual(['The stored list of your own Directions, which the Studio could not read.']);
    await context.close();
  });

  // ───── Feature F005: rename, remove, download, open ─────
  const ownCard = (page: Page, name: string) => page.locator('#group-own .direction', { has: page.locator('h3', { hasText: name }) });
  const twoKept = async (project: string): Promise<Session> => {
    const session = await summary(project);
    for (const name of ['First of mine', 'Second of mine']) {
      await keepAs(session.page, name);
      await expect.poll(async () => (await ownStored(session.page)).map((d) => d.name)).toContain(name);
    }
    return session;
  };
  const startFrom = async (page: Page, name: string): Promise<void> => {
    await page.goto(`${pageUrl}#directions`);
    await ownCard(page, name).getByRole('button', { name: `Start from ${name}` }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();
    await settle(page);
  };

  it('renames an own Direction on its card; the card and a project that started from it show the new name, and a name in use is refused', async () => {
    const { context, page } = await twoKept('Renaming');
    await startFrom(page, 'First of mine');
    await page.goto(`${pageUrl}#directions`);
    const card = ownCard(page, 'First of mine');
    await card.getByRole('button', { name: 'Rename' }).click();
    const field = page.getByLabel('New name for “First of mine”');
    expect(await field.inputValue()).toBe('First of mine');
    expect(await field.getAttribute('maxlength')).toBe('60');
    await field.fill('second OF mine');
    await page.getByRole('button', { name: 'Save the name' }).click();
    expect(await page.locator('#group-own [role="alert"]').innerText()).toBe('Another Direction already has the name “second OF mine”. Choose another name.');
    await field.fill('Renamed <b>once</b>');
    await page.getByRole('button', { name: 'Save the name' }).click();
    await expect.poll(() => page.locator('#group-own .direction h3').allInnerTexts()).toEqual(['Renamed <b>once</b>', 'Second of mine']);
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['Renamed <b>once</b>', 'Second of mine']);
    expect(await page.locator('#group-own b').count()).toBe(0);
    // The project holds the Direction's identifier, so it shows the new name, also after a reload.
    await page.reload();
    await page.goto(`${pageUrl}#summary`);
    await page.waitForSelector('#own-direction');
    expect(await page.locator('main').innerText()).toContain('This project started from Renamed <b>once</b>');
    await context.close();
  });

  it('asks before it removes an own Direction; afterwards the card is gone, and a project that started from it says so and keeps its design', async () => {
    const { context, page } = await twoKept('Removing');
    await startFrom(page, 'First of mine');
    const before = (await stored(page))!;
    await page.goto(`${pageUrl}#directions`);
    await ownCard(page, 'First of mine').getByRole('button', { name: 'Remove' }).click();
    const dialog = page.getByRole('dialog');
    expect(await dialog.innerText()).toContain('Undo does not bring it back');
    await dialog.getByRole('button', { name: 'No, keep it' }).click();
    expect((await ownStored(page)).length).toBe(2);
    await ownCard(page, 'First of mine').getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Yes, remove it for good' }).click();
    await expect.poll(() => page.locator('#group-own .direction h3').allInnerTexts()).toEqual(['Second of mine']);
    expect((await ownStored(page)).map((d) => d.name)).toEqual(['Second of mine']);
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('Removed “First of mine” from your own Directions.');
    await page.goto(`${pageUrl}#summary`);
    await page.waitForSelector('#own-direction');
    expect(await page.locator('main').innerText()).toContain('This project started from a Direction of your own that you removed');
    await settle(page);
    const after = (await stored(page))!;
    expect(after.params).toEqual(before.params);
    expect(after.direction).toBe(before.direction);
    await context.close();
  });

  it('downloads every own Direction as one file, and opens that file in a browser that holds none; a second opening adds none twice', async () => {
    const { context, page, errors } = await twoKept('Files');
    const kept = await ownStored(page);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download my own Directions (2)' }).click()]);
    expect(download.suggestedFilename()).toBe('refraction-own-directions.json');
    const fileText = readFileSync(await download.path(), 'utf8');
    expect((JSON.parse(fileText) as { kind: string; directions: Own[] })).toMatchObject({ kind: 'refraction-own-directions', version: 1, directions: kept });
    expect(await page.locator('#own-direction [role="status"]').innerText()).toContain('was handed to your browser to save');
    // A browser that holds none: the entry is gone, and the page starts afresh.
    await page.evaluate((key) => window.localStorage.removeItem(key), OWN_KEY);
    await page.reload();
    await page.waitForSelector('#own-direction');
    expect(await page.getByRole('button', { name: /^Download my own Directions/ }).count()).toBe(0);
    const openFile = async (): Promise<string> => {
      await page.locator('#own-file').setInputFiles({ name: 'mine.json', mimeType: 'application/json', buffer: Buffer.from(fileText) });
      const status = page.locator('#own-direction [role="status"]');
      await status.waitFor();
      return status.innerText();
    };
    expect(await openFile()).toBe('Added 2 Directions of your own.');
    expect(await ownStored(page)).toEqual(kept);
    expect(await openFile()).toBe('Added none: this browser already holds every Direction in the file.');
    expect(await ownStored(page)).toEqual(kept);
    await page.goto(`${pageUrl}#directions`);
    await expect.poll(() => page.locator('#group-own .direction h3').allInnerTexts()).toEqual(['First of mine', 'Second of mine']);
    expect(errors).toEqual([]);
    await context.close();
  });

  it('refuses a file that is not a set of own Directions, in plain words, and changes nothing', async () => {
    const { context, page, errors } = await twoKept('Wrong files');
    const kept = await rawStored(page, OWN_KEY);
    const status = page.locator('#own-direction [role="status"]');
    const NOT_A_FILE = 'That file was not opened. This is not a file of your own Directions. Your own Directions are unchanged.';
    const NEWER = 'That file was not opened. A newer version of the Studio made this file, and this version cannot read it. Your own Directions are unchanged.';
    // Each file gives another message than the one before it, so that the test sees each answer arrive.
    const wrong: [string, string][] = [
      ['not json at all <script>alert(1)</script>', NOT_A_FILE],
      [JSON.stringify({ kind: 'refraction-own-directions', version: 9, directions: [] }), NEWER],
      [JSON.stringify(worked('A project, not Directions')), NOT_A_FILE],
    ];
    for (const [content, message] of wrong) {
      await page.locator('#own-file').setInputFiles({ name: 'wrong<img src=x onerror=alert(1)>.json', mimeType: 'application/json', buffer: Buffer.from(content) });
      await expect.poll(() => status.innerText()).toBe(message);
    }
    expect(await rawStored(page, OWN_KEY)).toBe(kept);
    expect(await page.locator('#own-direction img, #own-direction script').count()).toBe(0);
    expect(errors).toEqual([]);
    await context.close();
  });
});
