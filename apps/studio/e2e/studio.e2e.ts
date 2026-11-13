// End-to-end tests: they drive the built Studio page in a real browser, the way a person would.
// Run with `npm run e2e` (which builds the page first).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const pageUrl = new URL('../dist/artifact/local-test.html', import.meta.url).href;
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const STORAGE_KEY = 'refraction.project.v1';

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch();
});
afterAll(async () => {
  await browser.close();
});

interface Session {
  context: BrowserContext;
  page: Page;
  errors: string[];
}

async function open(hash = '', viewport = { width: 1440, height: 900 }): Promise<Session> {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(pageUrl + hash);
  await page.waitForSelector('.top');
  await page.waitForFunction(() => !document.querySelector('.loading'));
  return { context, page, errors };
}

const saved = (page: Page): Promise<{ name: string; direction: string | null; params: Record<string, unknown>; decisions: Record<string, { optionId: string; kind: string }> } | null> =>
  page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? 'null'), STORAGE_KEY);

interface Check {
  /** Path into the saved project, for example ['decisions', 'nav', 'kind']. */
  path: string[];
  equals?: unknown;
  notEquals?: unknown;
}

/** Wait until the autosave (which runs shortly after each change) has written a state that satisfies every check. */
async function waitForSaved(page: Page, checks: Check[]): Promise<void> {
  await page.waitForFunction(({ key, list }) => {
    const project: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    if (project === null) return false;
    return list.every((check) => {
      let value: unknown = project;
      for (const part of check.path) {
        if (value === null || typeof value !== 'object') return false;
        value = (value as Record<string, unknown>)[part];
      }
      if ('equals' in check) return JSON.stringify(value) === JSON.stringify(check.equals);
      if ('notEquals' in check) return value !== undefined && JSON.stringify(value) !== JSON.stringify(check.notEquals);
      return value !== undefined;
    });
  }, { key: STORAGE_KEY, list: checks });
}

interface Stop {
  text: string;
  tag: string;
  id: string;
  visibleFocus: boolean;
}

/** Describe the element that has keyboard focus, and whether a person could see that focus. */
const focusedStop = (page: Page): Promise<Stop | null> =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    // An Option's radio input is visually hidden; its tile shows the focus ring.
    // The large preview frame shows its ring on the surrounding pane.
    const shown = (el.closest('.option') as HTMLElement | null) ?? (el.closest('.large-preview') as HTMLElement | null) ?? el;
    const style = getComputedStyle(shown);
    const visibleFocus = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
    const label = el.getAttribute('aria-label') ?? el.closest('label')?.textContent ?? '';
    const text = (el.textContent?.trim() || (el as HTMLInputElement).value || label || '').replace(/\s+/g, ' ').slice(0, 80);
    return { text, tag: el.tagName.toLowerCase(), id: el.id, visibleFocus };
  });

/** Press Tab until the focused element matches. Returns every stop passed on the way. */
async function tabTo(page: Page, match: (stop: Stop) => boolean, limit = 220): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    const stop = await focusedStop(page);
    if (!stop) continue;
    stops.push(stop);
    if (match(stop)) return stops;
  }
  throw new Error(`Keyboard focus never reached the wanted control. Last stops: ${stops.slice(-5).map((s) => `${s.tag}:${s.text}`).join(' | ')}`);
}

/** Wait until the Step screen shows the named Step. A link changes the address first; the screen follows a moment later. */
async function waitForStep(page: Page, name: string): Promise<void> {
  await page.waitForFunction((wanted) => document.querySelector('.options legend')?.textContent?.startsWith(wanted) ?? false, name);
}

describe('Studio', () => {
  it('opens on the Directions with working, sandboxed previews and no errors', async () => {
    const { context, page, errors } = await open();
    await page.waitForSelector('.direction');
    expect(await page.locator('.direction').count()).toBeGreaterThanOrEqual(14);
    await page.waitForSelector('.direction iframe');
    const sandboxes = await page.locator('iframe').evaluateAll((frames) => frames.map((f) => f.getAttribute('sandbox')));
    expect(sandboxes.length).toBeGreaterThan(0);
    // An empty sandbox attribute applies every restriction: no scripts, no same-origin access, no forms, no popups.
    expect(sandboxes.every((value) => value === '')).toBe(true);
    expect(await page.locator('[role="alert"]').count()).toBe(0);
    expect(errors).toEqual([]);
    await context.close();
  });

  it('can be used from start to summary with the keyboard alone, with visible focus at every stop', async () => {
    const { context, page, errors } = await open();
    const passed: Stop[] = [];
    const go = async (match: (stop: Stop) => boolean): Promise<void> => {
      passed.push(...(await tabTo(page, match)));
    };

    // Pick a starting Direction.
    await go((s) => s.tag === 'button' && s.text === 'Start from Graphite Precision');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#nav');
    await waitForStep(page, 'Navigation');
    await waitForSaved(page, [{ path: ['direction'], equals: 'Graphite Precision' }]);

    // Number keys flip between Options; looking is not deciding.
    await page.keyboard.press('2');
    await expect.poll(() => page.locator('.showing strong').textContent()).toBe('Centered masthead');
    expect((await saved(page))?.decisions['nav']).toBeUndefined();

    // Pick it.
    await go((s) => s.tag === 'button' && s.text.startsWith('Pick'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#hero');
    await waitForStep(page, 'First screen');
    await waitForSaved(page, [{ path: ['decisions', 'nav', 'optionId'], equals: 'top-centered' }, { path: ['decisions', 'nav', 'kind'], equals: 'picked' }]);

    // Skip the next Step: the default is taken and recorded as such.
    await go((s) => s.tag === 'button' && s.text.startsWith('Skip'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#sections');
    await waitForStep(page, 'Repeated items');
    await waitForSaved(page, [{ path: ['decisions', 'hero', 'kind'], equals: 'defaulted' }]);

    // Back.
    await go((s) => s.tag === 'button' && s.text === 'Back');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#hero');
    await waitForStep(page, 'First screen');

    // Jump to a color Step through the rail, compare, and ask for closer Options.
    await go((s) => s.tag === 'a' && s.text.startsWith('Accent color'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#accent');
    await waitForStep(page, 'Accent color');
    await page.keyboard.press('3');
    await expect.poll(() => page.locator('.showing strong').textContent()).toBe('Deep teal');
    await go((s) => s.tag === 'button' && s.text === 'Closer to this one');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.locator('.options legend').textContent()).toContain('closer, round 1');
    await page.keyboard.press('2');
    await go((s) => s.tag === 'button' && s.text.startsWith('Pick'));
    await page.keyboard.press('Enter');
    await waitForSaved(page, [{ path: ['decisions', 'accent', 'kind'], equals: 'tuned' }]);

    // Fine-tune a value by hand with the arrow keys.
    await go((s) => s.tag === 'a' && s.text.startsWith('Corners'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#radius');
    await waitForStep(page, 'Corners');
    const before = (await saved(page))?.params['radius'];
    await go((s) => s.tag === 'summary' && s.text === 'Fine-tune by hand');
    await page.keyboard.press('Enter');
    await go((s) => s.id === 'tune-radius');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await waitForSaved(page, [{ path: ['decisions', 'radius', 'kind'], equals: 'tuned' }, { path: ['params', 'radius'], notEquals: before }]);

    // Reach the Summary and use the project-file actions.
    await go((s) => s.tag === 'a' && s.text === 'Summary');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.hash === '#summary');
    await go((s) => s.tag === 'button' && s.text === 'Copy the project as text');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.summary-side [role="status"]');

    const invisible = passed.filter((s) => !s.visibleFocus).map((s) => `${s.tag}: ${s.text}`);
    expect([...new Set(invisible)]).toEqual([]);
    expect(errors).toEqual([]);
    await context.close();
  });

  it('renders hostile saved content as inert text', async () => {
    const { context, page, errors } = await open();
    await page.getByRole('button', { name: 'Start from Paper and Ink' }).click();
    await waitForSaved(page, [{ path: ['direction'], equals: 'Paper and Ink' }]);
    const payload = '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script></style></title>"\'';
    await page.evaluate(({ key, text }) => {
      const project = JSON.parse(window.localStorage.getItem(key) ?? 'null');
      project.name = text;
      project.direction = text;
      for (const field of ['business', 'tag', 'headline', 'lede', 'primaryAction', 'phone', 'servicesTitle', 'promise', 'address', 'footerNote']) project.content[field] = text;
      project.content.headlineEmphasis = 'onerror';
      project.content.nav = [text, text];
      project.content.services = [{ title: text, body: text }];
      project.content.facts = [{ value: text, label: text }];
      window.localStorage.setItem(key, JSON.stringify(project));
    }, { key: STORAGE_KEY, text: payload });
    let dialogs = 0;
    page.on('dialog', (dialog) => {
      dialogs += 1;
      void dialog.dismiss();
    });
    await page.reload();
    await page.waitForSelector('.options .option');
    await page.goto(`${pageUrl}#summary`);
    await page.waitForSelector('.summary iframe');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
    expect(dialogs).toBe(0);
    expect(await page.locator('#project-name').inputValue()).toBe(payload);
    const frames = await page.locator('iframe').evaluateAll((list) => list.map((f) => ({ sandbox: f.getAttribute('sandbox'), srcdoc: f.getAttribute('srcdoc') ?? '' })));
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) {
      expect(frame.sandbox).toBe('');
      // No real tag from the payload may exist in the preview document; the text must be escaped.
      expect(frame.srcdoc).not.toMatch(/<script/i);
      expect(frame.srcdoc).not.toMatch(/<img/i);
      expect(frame.srcdoc).toContain('&lt;script&gt;');
      // The payload must not have closed the style block or the title early.
      expect(frame.srcdoc.match(/<\/style>/gi)?.length).toBe(1);
      expect(frame.srcdoc.match(/<\/title>/gi)?.length).toBe(1);
    }
    expect(errors).toEqual([]);
    await context.close();
  });

  it('refuses a file that is not a valid project and says so', async () => {
    const { context, page } = await open('#summary');
    await page.waitForSelector('#project-file', { state: 'attached' });
    const before = await saved(page);
    await page.setInputFiles('#project-file', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"schemaVersion":99,"params":{"radius":"<script>"}}') });
    await expect.poll(() => page.locator('.summary-side [role="status"]').textContent()).toContain('was not loaded');
    await page.setInputFiles('#project-file', { name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('not json at all') });
    await expect.poll(() => page.locator('.summary-side [role="status"]').textContent()).toContain('not a project file');
    expect(await saved(page)).toEqual(before);
    await context.close();
  });

  it('has no serious accessibility violations in its own interface', async () => {
    for (const hash of ['#directions', '#typeface', '#accent', '#summary']) {
      const { context, page } = await open(hash);
      await page.waitForSelector('iframe');
      await page.evaluate(axeSource);
      const violations = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (root: Document, options: unknown) => Promise<{ violations: { id: string; impact: string | null; nodes: { target: unknown[] }[] }[] }> } }).axe;
        const result = await axe.run(document, { iframes: false, runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
        return result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} (${v.nodes.length}): ${String(v.nodes[0]?.target)}`);
      });
      expect(violations, `view ${hash}`).toEqual([]);
      await context.close();
    }
  });

  it('holds its height still in narrow and zoomed windows, with the main button within reach', async () => {
    // A preview pane that took its height from the page inside it once made these screens grow without end (finding FTU-01).
    for (const viewport of [{ width: 720, height: 450 }, { width: 400, height: 860 }, { width: 1099, height: 700 }]) {
      for (const hash of ['#nav', '#accent', '#summary']) {
        const { context, page } = await open(hash, viewport);
        await page.waitForSelector('.large-preview iframe');
        const height = (): Promise<number> => page.evaluate(() => document.documentElement.scrollHeight);
        const samples: number[] = [];
        for (let i = 0; i < 5; i++) {
          samples.push(await height());
          await page.waitForTimeout(400);
        }
        const label = `${hash} at ${viewport.width}x${viewport.height}: ${samples.join(', ')}`;
        expect(Math.max(...samples) - Math.min(...samples), label).toBeLessThanOrEqual(2);
        expect(samples[0]!, label).toBeLessThan(viewport.height * 12);
        const pane = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
        expect(pane, `preview pane, ${label}`).toBeGreaterThanOrEqual(190);
        expect(pane, `preview pane, ${label}`).toBeLessThanOrEqual(viewport.height);
        await context.close();
      }
    }
  });

  it('gives the large preview the room that is left over in a wide window', async () => {
    // The preview once sat in the wrong layout row and lost a third of its height (finding FTU-17).
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const { context, page } = await open('#accent', viewport);
      await page.waitForSelector('.large-preview iframe');
      const pane = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
      expect(pane, `${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(viewport.height * 0.38);
      // Moving keyboard focus to the "skip the preview" control must not change the pane's size.
      await page.focus('.skip-preview');
      const paneFocused = await page.evaluate(() => document.querySelector('.large-preview')!.getBoundingClientRect().height);
      expect(Math.abs(paneFocused - pane)).toBeLessThanOrEqual(1);
      await context.close();
    }
  });

  it('never scrolls sideways at phone width', async () => {
    for (const hash of ['#directions', '#nav', '#accent', '#summary']) {
      const { context, page } = await open(hash, { width: 400, height: 860 });
      await page.waitForSelector('iframe');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `view ${hash}`).toBeLessThanOrEqual(1);
      await context.close();
    }
  });
});
