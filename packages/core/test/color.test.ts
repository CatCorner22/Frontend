import { describe, expect, it } from 'vitest';
import { contrast, contrastOnWash, contrastOver, ensureContrast, ensureContrastAll, hexOver, isInGamut, luminance, readableOn, toGamut, toHex, toRgb, type Oklch } from '../src/index.js';
import { contrastHex } from './helpers.js';

const WHITE: Oklch = { l: 1, c: 0, h: 0 };
const BLACK: Oklch = { l: 0, c: 0, h: 0 };
const RED: Oklch = { l: 0.62796, c: 0.25768, h: 29.234 };
const GREEN: Oklch = { l: 0.86644, c: 0.29483, h: 142.495 };
const BLUE: Oklch = { l: 0.45201, c: 0.31321, h: 264.052 };
/** The OKLCH form of a gray whose 8-bit sRGB value is `v` on every channel. */
const gray = (v: number): Oklch => {
  const s = v / 255;
  const lin = s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  return { l: Math.cbrt(lin), c: 0, h: 0 };
};

describe('color conversion', () => {
  // Worked examples of the CSS Color Module Level 4 specification, as the builder recalls them (percent of each sRGB channel).
  // The conversion constants were also written from memory, so agreement to a tenth of a percent checks both.
  const examples: [Oklch, [number, number, number]][] = [
    [{ l: 0.40101, c: 0.12332, h: 21.555 }, [49.06, 13.87, 15.9]],
    [{ l: 0.59686, c: 0.15619, h: 49.7694 }, [77.61, 36.34, 2.45]],
    [{ l: 0.65125, c: 0.13138, h: 104.097 }, [61.65, 57.51, 9.28]],
    [{ l: 0.66016, c: 0.15546, h: 134.231 }, [40.73, 65.12, 22.35]],
    [{ l: 0.72322, c: 0.12403, h: 247.996 }, [38.29, 67.27, 93.85]],
  ];
  it.each(examples)('converts %o to its sRGB reference value', (color, want) => {
    const { r, g, b } = toRgb(color);
    expect(Math.abs(r * 100 - want[0])).toBeLessThan(0.12);
    expect(Math.abs(g * 100 - want[1])).toBeLessThan(0.12);
    expect(Math.abs(b * 100 - want[2])).toBeLessThan(0.12);
  });

  it('reproduces the three sRGB primaries, white, and black', () => {
    expect(toHex(RED)).toBe('#ff0000');
    expect(toHex(GREEN)).toBe('#00ff00');
    expect(toHex(BLUE)).toBe('#0000ff');
    expect(toHex(WHITE)).toBe('#ffffff');
    expect(toHex(BLACK)).toBe('#000000');
  });

  it('maps an out-of-gamut color into gamut by lowering chroma only', () => {
    const vivid: Oklch = { l: 0.7, c: 0.4, h: 150 };
    expect(isInGamut(vivid)).toBe(false);
    const mapped = toGamut(vivid);
    expect(mapped.l).toBe(vivid.l);
    expect(mapped.h).toBe(vivid.h);
    expect(mapped.c).toBeLessThan(vivid.c);
    expect(isInGamut(mapped)).toBe(true);
    // The mapped chroma is the largest that fits: a little more would leave the gamut.
    expect(isInGamut({ ...mapped, c: mapped.c + 0.004 })).toBe(false);
    // A color that already fits is returned unchanged.
    expect(toGamut({ l: 0.5, c: 0.05, h: 200 })).toEqual({ l: 0.5, c: 0.05, h: 200 });
  });
});

describe('WCAG contrast', () => {
  it('matches known contrast ratios', () => {
    expect(contrast(WHITE, BLACK)).toBeCloseTo(21, 1);
    expect(contrast(WHITE, WHITE)).toBeCloseTo(1, 5);
    // #777777 on white is the well-known near miss (4.48:1); #767676 is the lightest gray that passes 4.5:1.
    expect(contrast(gray(0x77), WHITE)).toBeCloseTo(4.48, 2);
    expect(contrast(gray(0x76), WHITE)).toBeCloseTo(4.54, 2);
    // The three primaries on white pin down the luminance weights of red, green, and blue.
    expect(contrast(RED, WHITE)).toBeCloseTo(4.0, 1);
    expect(contrast(GREEN, WHITE)).toBeCloseTo(1.37, 2);
    expect(contrast(BLUE, WHITE)).toBeCloseTo(8.59, 2);
    expect(luminance(gray(0x80))).toBeCloseTo(0.2159, 3);
  });

  it('measures translucent text as the eye receives it', () => {
    // White at half strength over black is a mid gray.
    expect(contrastOver(WHITE, 0.5, BLACK)).toBeCloseTo(contrastHex('#808080', '#000000'), 1);
    expect(contrastOver(WHITE, 1, BLACK)).toBeCloseTo(21, 1);
    // 127.5 of 255 rounds to 127 or 128, depending on the last bit of the arithmetic.
    expect(['#7f7f7f', '#808080']).toContain(hexOver(WHITE, 0.5, BLACK));
    // Black text over a half-strength white wash on black: the wash is the same mid gray.
    expect(contrastOnWash(BLACK, WHITE, 0.5, BLACK)).toBeCloseTo(contrastHex('#000000', '#808080'), 1);
  });
});

describe('contrast repair', () => {
  it('moves a color until it reaches the target, and keeps hue and chroma', () => {
    const paleYellow: Oklch = { l: 0.9, c: 0.12, h: 95 };
    const fixed = ensureContrast(paleYellow, WHITE, 4.5);
    // The target holds for the colors as they are written to the page, measured here by the tests' own contrast code (finding T3-02).
    expect(contrastHex(toHex(fixed), toHex(WHITE))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(fixed, WHITE)).toBeLessThan(4.6);
    expect(fixed.h).toBe(paleYellow.h);
    expect(fixed.c).toBe(paleYellow.c);
    // A color that already passes is returned unchanged.
    expect(ensureContrast(BLACK, WHITE, 4.5)).toEqual(BLACK);
  });

  it('returns the best reachable color when the target is out of reach', () => {
    const best = ensureContrast(gray(0x80), gray(0x80), 30);
    expect(contrast(best, gray(0x80))).toBeGreaterThan(3.9);
  });

  it('satisfies several backgrounds at once', () => {
    const fixed = ensureContrastAll({ l: 0.8, c: 0.16, h: 88 }, [{ l: 0.985, c: 0.005, h: 80 }, WHITE, { l: 0.955, c: 0.01, h: 80 }], 3);
    for (const bg of [{ l: 0.985, c: 0.005, h: 80 }, WHITE, { l: 0.955, c: 0.01, h: 80 }]) expect(contrastHex(toHex(fixed), toHex(bg))).toBeGreaterThanOrEqual(3);
  });

  it('picks a label color that reads on any fill', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.2, 0.35, 0.5, 0.58, 0.62, 0.66, 0.7, 0.8, 0.92]) {
        for (const c of [0, 0.08, 0.2]) {
          const fill: Oklch = { l, c, h };
          expect(contrast(readableOn(fill), fill), `fill ${l} ${c} ${h}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
