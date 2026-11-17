// The exit test of milestone M7 (SPEC.md section 2.23, feature F035): a clean build passes; each planted defect alone is found; all of
// them at once are found, and no line of the receipt is a false blocker. The folder `plugin/fit/exit/` holds the stored files.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PRESCRIPTION_FILES, writePrescription } from '@refraction/core';
import { WIDTHS, fit, type Receipt } from '../src/fit.ts';
import { trialProject } from './trial-project.ts';

const LOCAL_BROWSER = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ ...LOCAL_BROWSER });
});
afterAll(async () => {
  await browser.close();
});

const folder = join(process.cwd(), 'plugin/fit/exit');
const read = (...parts: string[]): string => readFileSync(join(folder, ...parts), 'utf8');

/** One planted defect: a change to the clean build, and the receipt lines that it must cause (measure and words). */
interface Defect {
  name: string;
  find: string;
  replace: string;
  /** Every line that this defect explains: the measure's id and words that the line holds. */
  lines: { measure: string; words: string }[];
  /** Set when the defect shows only at some widths: the widths that its line must name. */
  widths?: number[];
}

const defects = (): Defect[] => JSON.parse(read('defects.json')) as Defect[];
const files = (): Record<string, string> => Object.fromEntries(PRESCRIPTION_FILES.map((name) => [name, read('files', name)]));
const plant = (html: string, d: Defect): string => {
  expect(html.split(d.find).length - 1, `${d.name}: "${d.find}" must stand in the clean build exactly once`).toBe(1);
  return html.replace(d.find, d.replace);
};
/** Every deviation line of the receipt, with its measure, in the measures that decide the status. */
const deviationLines = (receipt: Receipt): { measure: string; line: string }[] =>
  receipt.measured.filter((m) => m.id !== 'contrast' || m.title === 'Contrast: required by Floor A1').flatMap((m) => m.items.map((line) => ({ measure: m.id, line })));
const explains = (d: Defect, row: { measure: string; line: string }): boolean => d.lines.some((l) => l.measure === row.measure && row.line.includes(l.words));

describe('Fit check: the exit test of milestone M7 (SPEC.md section 2.23)', () => {
  it('stores the Prescription that today’s Studio writes for the fixed project, made with “Fix for me”', () => {
    const today = writePrescription(trialProject('enforce'));
    for (const name of PRESCRIPTION_FILES) expect(read('files', name), name).toBe(today[name]);
    expect(existsSync(join(folder, 'clean.html'))).toBe(true);
    expect(defects().length).toBeGreaterThanOrEqual(12);
  });

  it('reads every page at three window widths, a tablet among them', async () => {
    expect([...WIDTHS]).toEqual([375, 768, 1280]);
    const { receipt, markdown } = await fit({ files: files(), html: read('clean.html'), browser });
    expect(receipt.widths).toEqual([375, 768, 1280]);
    expect(markdown).toContain('375, 768, and 1280 pixels');
  });

  it('finds no deviation and nothing not measured in the clean build', async () => {
    const { receipt, status } = await fit({ files: files(), html: read('clean.html'), browser });
    expect(deviationLines(receipt)).toEqual([]);
    expect(receipt.measured.filter((m) => m.notMeasured > 0).map((m) => `${m.id}: ${m.note}`)).toEqual([]);
    expect(status).toBe(0);
  });

  it('covers every measure with a planted defect, and one defect that only the third width finds', () => {
    const measures = new Set(defects().flatMap((d) => d.lines.map((l) => l.measure)));
    for (const id of ['requests', 'colors', 'typefaces', 'radii', 'contrast', 'content', 'width', 'floors']) expect(measures, id).toContain(id);
    expect(defects().some((d) => JSON.stringify(d.widths) === JSON.stringify([768]))).toBe(true);
  });

  it('finds each planted defect alone, in the measure that the list names', async () => {
    const clean = read('clean.html');
    const missed: string[] = [];
    for (const d of defects()) {
      const { receipt, status } = await fit({ files: files(), html: plant(clean, d), browser });
      const rows = deviationLines(receipt);
      for (const want of d.lines) {
        const row = rows.find((r) => r.measure === want.measure && r.line.includes(want.words));
        if (!row) missed.push(`${d.name}: no ${want.measure} line with "${want.words}"; got ${JSON.stringify(rows.map((r) => `${r.measure}: ${r.line}`))}`);
        else if (d.widths) {
          for (const w of WIDTHS) if (row.line.includes(`${String(w)} pixels`) !== d.widths.includes(w)) missed.push(`${d.name}: the line should name ${JSON.stringify(d.widths)} pixels: ${row.line}`);
        }
      }
      const unexplained = rows.filter((r) => !explains(d, r));
      if (unexplained.length > 0) missed.push(`${d.name}: lines it does not explain: ${JSON.stringify(unexplained)}`);
      if (status !== 1) missed.push(`${d.name}: status ${String(status)}`);
    }
    expect(missed).toEqual([]);
  }, 600_000);

  it('finds every planted defect in one flawed build, and reports no line that no defect explains', async () => {
    const all = defects();
    const flawed = all.reduce((html, d) => plant(html, d), read('clean.html'));
    const { receipt, status } = await fit({ files: files(), html: flawed, browser });
    const rows = deviationLines(receipt);
    const missed = all.flatMap((d) => d.lines.filter((want) => !rows.some((r) => r.measure === want.measure && r.line.includes(want.words))).map((want) => `${d.name}: ${want.measure} "${want.words}"`));
    expect(missed).toEqual([]);
    const falseBlockers = rows.filter((r) => !all.some((d) => explains(d, r)));
    expect(falseBlockers).toEqual([]);
    expect(status).toBe(1);
  }, 120_000);
});
