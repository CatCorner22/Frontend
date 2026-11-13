// End-to-end tests: they drive the built Studio page in a real browser, the way a person would.
// Run with `npm run e2e` (which builds the page first).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { CITED_NAMES, DIRECTIONS, FONTS, STEPS, applyDirection, createProject, pick, tradeWordsOutsideBrackets, tune, vaguePhrasesIn, type Project } from '@refraction/core';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
/** An empty page beside the Studio's page. Every local file shares one storage in this browser, so a test can fill storage here first. */
const blankUrl = new URL('../dist/artifact/blank-for-tests.html', import.meta.url);
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const fixtureV1 = readFileSync(new URL('../../../packages/core/test/fixtures/project-v1-direction.json', import.meta.url), 'utf8');
const LOCAL_KEY = 'refraction.project.v2';
const LEGACY_KEY = 'refraction.project.v1';
const BACKUP_KEY = 'refraction.project.backup';

let browser: Browser;
beforeAll(async () => {
  writeFileSync(fileURLToPath(blankUrl), '<!doctype html><title>Blank page for tests</title>');
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser.close();
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
  pageDb?: { doc: { project: string; savedAt?: string } | null; failWrites?: boolean };
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
      const state = { doc: db.doc as { project: string; savedAt?: string } | null };
      (window as unknown as Record<string, unknown>)['__pageDb'] = state;
      (window as unknown as Record<string, unknown>)['claude'] = {
        use: (name: string) =>
          Promise.resolve(
            name !== 'db'
              ? null
              : {
                  doc: () => ({
                    get: () => Promise.resolve({ exists: state.doc !== null, data: () => state.doc ?? undefined }),
                    set: (data: { project: string; savedAt: string }) => {
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
  await page.waitForFunction(() => !document.querySelector('.loading'));
  return { context, page, errors, requests };
}

const envelope = (project: unknown, savedAt = '2026-11-13T10:00:00.000Z'): string => JSON.stringify({ savedAt, project });
/** The project in the browser copy, or null. */
const stored = (page: Page): Promise<Project | null> =>
  page.evaluate((key) => (JSON.parse(window.localStorage.getItem(key) ?? 'null') as { project: Project } | null)?.project ?? null, LOCAL_KEY);
const rawStored = (page: Page, key: string): Promise<string | null> => page.evaluate((k) => window.localStorage.getItem(k), key);
/** Every copy the Studio kept, newest first. */
const keptCopies = async (page: Page): Promise<{ why: string; text: string }[]> => JSON.parse((await rawStored(page, BACKUP_KEY)) ?? '[]') as { why: string; text: string }[];
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
    expect(await page.locator('.direction').count()).toBe(18);
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
    await expect.poll(() => page.locator('.direction').count()).toBe(24);
    const moods = await page.locator('.direction .mood').allInnerTexts();
    for (const mood of moods.slice(18)) expect(mood).toMatch(/^A (light|dark) page .+\.$/);
    await page.locator('.top-nav a', { hasText: 'Summary' }).click();
    await page.waitForSelector('.summary');
    await page.locator('.top-nav a', { hasText: 'Directions' }).click();
    await page.waitForSelector('.direction');
    expect(await page.locator('.direction').count()).toBe(24);
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
    await page.waitForSelector('.summary');
    await settle(page);
    const project = (await stored(page))!;
    expect(project.params).toEqual(aurora.params);
    expect(project.direction).toBe('midnight-aurora');
    expect(Object.keys(project.decisions)).toHaveLength(STEPS.length);
    expect(Object.values(project.decisions).every((d) => d.kind === 'kept')).toBe(true);
    expect(labels.filter((l) => l === 'Keep my design and continue').length).toBeGreaterThan(3);
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
    await page.locator('.rail a', { hasText: 'First screen' }).click();
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
    expect(titles[0]).toContain('As it was');
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
    expect(await rawStored(page, BACKUP_KEY)).toBeNull();
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
    await session.page.evaluate((key) => window.localStorage.removeItem(key), BACKUP_KEY);
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
    await page.evaluate((key) => window.localStorage.removeItem(key), BACKUP_KEY);
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
    expect(await rawStored(plain.page, BACKUP_KEY)).toBeNull();
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
    expect(kept.some((copy) => copy.text.includes('Typed in the stopped tab') && copy.why.includes('was not yet saved when you left or reloaded the page'))).toBe(true);
    await context.close();
  });

  it('settles the status line when a save has nothing to write, and keeps saying that storage is full while it is (finding F-7)', async () => {
    const { context, page } = await open({ storage: { [LOCAL_KEY]: envelope(worked('A')) } });
    await page.waitForSelector('.cards');
    // An edit and its Undo, faster than the save delay: nothing to write, and the line must not stay at "Saving…".
    await page.locator('#project-name').fill('A, changed');
    await topUndo(page).click();
    // Undo says what it did: only the name went back.
    expect(await page.locator('.banner:not(.hold)').innerText()).toContain('Undone: the project’s name is “A” again.');
    await settle(page);
    expect(await state(page)).toBe('Saved in this browser, on this computer');
    // Storage full, in the browser's real storage: the save fails and says so; an Undo back to the saved state keeps that statement.
    expect(await fillRealStorage(page, 0)).toBeGreaterThan(100_000);
    await page.locator('#project-name').fill('A, with a much longer name than before, so that it cannot fit');
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    await topUndo(page).click();
    await settle(page);
    expect(await state(page)).toContain('Cannot save here');
    expect((await stored(page))?.name).toBe('A');
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
      for (const hash of ['#directions', '#nav', '#typeface', '#accent', '#motion', '#summary', '#licences']) {
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
    await page.locator('.rail a', { hasText: 'First screen' }).click();
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
    expect(text).toContain('Playfair Display');
    expect(await page.locator('.notice-list > li').count()).toBe(18);
    await context.close();
  });
});

describe('Studio: layout', () => {
  it('holds its height still in narrow and zoomed windows (finding FTU-01)', async () => {
    for (const viewport of [{ width: 720, height: 450 }, { width: 400, height: 860 }, { width: 1099, height: 700 }]) {
      for (const hash of ['#nav', '#accent', '#summary']) {
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
      for (const hash of ['#directions', '#nav', '#accent', '#summary', '#licences']) {
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
});

describe('Studio: plain words on every screen (decision D38, finding U2-03)', () => {
  it('shows no trade word outside round brackets and no vague phrase on the Directions, on every Step, and on the Summary, with no error and no outside request', async () => {
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
    await page.evaluate(() => { window.location.hash = '#summary'; });
    await page.waitForSelector('.summary');
    await check('the Summary');
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
    await context.close();
  }, 120000);
});
