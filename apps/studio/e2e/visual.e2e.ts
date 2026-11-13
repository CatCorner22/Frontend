// Visual tests of the Mockup (the M3 exit test and decision D8). They render the Mockup in a real browser and check three things:
// 1. Every Option of a Step looks different from its sibling Options (a card that changes nothing would make "1 or 2?" meaningless).
// 2. One variable: a Step that changes paint only (color, finish) moves no element by even one pixel.
// 3. No look changes by accident: each curated Direction is compared with a stored picture.
//    After a deliberate change of look, store new pictures with `npm run visual:update` and review them before committing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PARAMS, DIRECTIONS, FONTS, SAMPLE_CONTENT, STEPS, deriveTokens, renderSmallBusiness, resolvePatch, type DesignParams, type FontId, type MockupFocus } from '@refraction/core';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const baselineDir = fileURLToPath(new URL('./baselines/', import.meta.url));
const UPDATE = process.env['UPDATE_BASELINES'] === '1';

// The same font files that the Studio bundles, read from the installed packages.
const FONT_FILES: Partial<Record<FontId, string>> = {
  'bricolage-grotesque': 'bricolage-grotesque', 'dm-sans': 'dm-sans', fraunces: 'fraunces', 'instrument-sans': 'instrument-sans', inter: 'inter', 'jetbrains-mono': 'jetbrains-mono',
  manrope: 'manrope', newsreader: 'newsreader', outfit: 'outfit', 'playfair-display': 'playfair-display', 'public-sans': 'public-sans', 'source-serif-4': 'source-serif-4', 'space-grotesk': 'space-grotesk',
};
const fontCache = new Map<FontId, string>();
function fontFace(id: FontId): string {
  const hit = fontCache.get(id);
  if (hit !== undefined) return hit;
  const name = FONT_FILES[id];
  let css = '';
  if (name) {
    const file = require.resolve(`@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`);
    const family = FONTS[id].stack.split(',')[0]!.replace(/"/g, '').trim();
    css = `@font-face{font-family:"${family}";src:url("data:font/woff2;base64,${readFileSync(file).toString('base64')}") format("woff2");font-weight:100 900;font-style:normal}`;
  }
  fontCache.set(id, css);
  return css;
}

function mockup(params: DesignParams, focus: MockupFocus): string {
  const fonts: FontId[] = [params.fontHeading, params.fontBody, ...(params.numerals === 'mono' ? (['jetbrains-mono'] as FontId[]) : [])];
  return renderSmallBusiness({ params, tokens: deriveTokens(params, 'advise').css, content: SAMPLE_CONTENT, focus, still: true, links: 'inert', fontFaceCss: [...new Set(fonts)].map(fontFace).join('\n') });
}

let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page = await context.newPage();
});
afterAll(async () => {
  await browser.close();
});

async function show(html: string): Promise<void> {
  await page.setContent(html, { waitUntil: 'load' });
  // Load every declared typeface before any picture or measurement. Waiting for `document.fonts.ready` alone is not enough:
  // a browser starts to load a typeface only when it first lays the page out, so a slow machine could take the picture too early.
  await page.evaluate(async () => {
    await Promise.all([...document.fonts].map((face) => face.load()));
    await document.fonts.ready;
  });
}
const shot = async (html: string): Promise<Buffer> => {
  await show(html);
  return page.screenshot({ type: 'png' });
};
/** The position and size of every element, to a tenth of a pixel. */
const geometry = async (html: string): Promise<string[]> => {
  await show(html);
  return page.evaluate(() =>
    [...document.querySelectorAll('body *')].map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} ${r.x.toFixed(1)},${r.y.toFixed(1)} ${r.width.toFixed(1)}x${r.height.toFixed(1)}`;
    }),
  );
};

/** Two designs to try every Option on: the plain start, and a dark, decorated Direction. */
const BASES: { label: string; params: DesignParams }[] = [
  { label: 'plain start', params: DEFAULT_PARAMS },
  { label: 'Midnight Aurora', params: DIRECTIONS.find((d) => d.id === 'midnight-aurora')!.params },
];

/** Options that cannot differ in a still picture, with the reason. The Studio tells the owner the same thing on these cards. */
const STILL_TWINS: Record<string, string> = {
  motion: 'Motion shows only while the page moves; the three stills are identical by design.',
};
/** Steps that change paint only: nothing may move. */
const PAINT_ONLY = ['neutral', 'accent', 'color-strategy', 'theme', 'contrast', 'atmosphere', 'button-finish', 'display-treatment', 'radius'];

describe('Mockup: every Option shows (M3 exit test)', () => {
  for (const step of STEPS) {
    it(`"${step.name}": each Option looks different from the others`, async () => {
      if (STILL_TWINS[step.id]) {
        // The exception is real: the stills are in fact identical, so the note on the card is true.
        const first = await shot(mockup({ ...DEFAULT_PARAMS, ...resolvePatch(step.options[0]!, DEFAULT_PARAMS) }, step.focus));
        for (const option of step.options.slice(1)) expect((await shot(mockup({ ...DEFAULT_PARAMS, ...resolvePatch(option, DEFAULT_PARAMS) }, step.focus))).equals(first), `${option.id} differs in a still after all: remove the exception`).toBe(true);
        expect(step.thumb?.note, 'the card must say that a still cannot show the difference').toBeTruthy();
        return;
      }
      for (const base of BASES) {
        const seen = new Map<string, string>();
        for (const option of step.options) {
          const params = { ...base.params, ...resolvePatch(option, base.params) };
          // Each Option is judged where the Studio shows it: at its own region when it has one, and also at the Step's region.
          const picture = Buffer.concat([await shot(mockup(params, option.focus ?? step.focus)), await shot(mockup(params, step.focus))]).toString('base64');
          const twin = seen.get(picture);
          expect(twin, `on the ${base.label}, "${option.label}" looks exactly like "${twin}"`).toBeUndefined();
          seen.set(picture, option.label);
        }
      }
    });
  }
});

describe('Mockup: one variable per Step, measured in the browser', () => {
  for (const id of PAINT_ONLY) {
    it(`"${id}" changes paint only: no element moves or changes size`, async () => {
      const step = STEPS.find((s) => s.id === id)!;
      for (const base of BASES) {
        for (const focus of ['top', 'services', 'contact'] as const) {
          const reference = await geometry(mockup({ ...base.params, ...resolvePatch(step.options[0]!, base.params) }, focus));
          for (const option of step.options.slice(1)) {
            const now = await geometry(mockup({ ...base.params, ...resolvePatch(option, base.params) }, focus));
            const moved = now.filter((line, i) => line !== reference[i]);
            expect(moved.slice(0, 3), `on the ${base.label}, region ${focus}: "${option.label}" moved ${moved.length} of ${now.length} elements`).toEqual([]);
          }
        }
      }
    });
  }
});

describe('Mockup: targets and structure in the browser', () => {
  it('gives every link, button, and field a target of at least 24 by 24 pixels, at phone and desktop widths', async () => {
    for (const viewport of [{ width: 375, height: 800 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      for (const params of [DEFAULT_PARAMS, ...['midnight-aurora', 'control-room', 'sticker-pop', 'quiet-luxury'].map((id) => DIRECTIONS.find((d) => d.id === id)!.params)]) {
        await show(mockup(params, 'top'));
        const small = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('a, button, input, textarea')]
            .filter((el) => el.getClientRects().length > 0 && !el.classList.contains('skip'))
            .map((el) => ({ el: `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}"`, w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height }))
            .filter((t) => t.w < 24 || t.h < 24)
            .map((t) => `${t.el} ${t.w.toFixed(0)}x${t.h.toFixed(0)}`),
        );
        expect(small, `${viewport.width} px wide`).toEqual([]);
      }
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});

describe('Mockup: no look changes by accident (decision D8)', () => {
  /** Shrink a screenshot to a small picture inside the browser, and return it as a PNG. Small pictures forgive one-pixel differences in text rendering. */
  const shrink = async (png: Buffer): Promise<Buffer> => {
    const dataUrl = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 200;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, 320, 200);
      return canvas.toDataURL('image/png');
    }, `data:image/png;base64,${png.toString('base64')}`);
    return Buffer.from(dataUrl.split(',')[1]!, 'base64');
  };
  /** How far apart two small pictures are: the mean difference per color channel (0 to 255), and the share of pixels that differ clearly. */
  const difference = (a: Buffer, b: Buffer): Promise<{ mean: number; share: number }> =>
    page.evaluate(async ([one, two]) => {
      const load = async (source: string): Promise<Uint8ClampedArray> => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 200;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, 320, 200).data;
      };
      const [x, y] = [await load(one!), await load(two!)];
      let total = 0;
      let clear = 0;
      for (let i = 0; i < x.length; i += 4) {
        const d = (Math.abs(x[i]! - y[i]!) + Math.abs(x[i + 1]! - y[i + 1]!) + Math.abs(x[i + 2]! - y[i + 2]!)) / 3;
        total += d;
        if (d > 24) clear++;
      }
      return { mean: total / (x.length / 4), share: clear / (x.length / 4) };
    }, [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`]);

  for (const direction of [{ id: 'plain-start', params: DEFAULT_PARAMS }, ...DIRECTIONS]) {
    for (const focus of ['top', 'contact'] as const) {
      it(`${direction.id}, region "${focus}" matches its stored picture`, async () => {
        const current = await shrink(await shot(mockup(direction.params, focus)));
        const file = `${baselineDir}${direction.id}-${focus}.png`;
        if (UPDATE || !existsSync(file)) {
          expect(UPDATE, `no stored picture for ${direction.id}-${focus}; run "npm run visual:update" and review the new picture`).toBe(true);
          mkdirSync(baselineDir, { recursive: true });
          writeFileSync(file, current);
          return;
        }
        const { mean, share } = await difference(readFileSync(file), current);
        expect(mean, `mean difference per channel ${mean.toFixed(2)}; share of clearly different pixels ${(share * 100).toFixed(2)}%`).toBeLessThan(1.5);
        expect(share).toBeLessThan(0.012);
      });
    }
  }

  it('would notice a changed look: one Direction against another fails the comparison', async () => {
    const a = await shrink(await shot(mockup(DIRECTIONS[0]!.params, 'top')));
    // A change of one Step is enough to fail: the same Direction with a different opening layout.
    const b = await shrink(await shot(mockup({ ...DIRECTIONS[0]!.params, hero: 'text-left' }, 'top')));
    const { mean, share } = await difference(a, b);
    expect(mean > 1.5 || share > 0.012).toBe(true);
  });
});
