// The first build trial (SPEC.md section 2.11): the stored record of one run in which a helper agent built a page from the seven files.
// These tests do not run the helper. They check that the stored record is whole, that it belongs to today's files, and that the
// stored page still measures to the stored receipt.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PRESCRIPTION_FILES, writePrescription } from '@refraction/core';
import { fit } from '../src/fit.ts';
import { TRIAL_DECISIONS, trialProject } from './trial-project.ts';

const FOLDER = join(process.cwd(), 'plugin/fit/trials/001');
const LOCAL_BROWSER = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ ...LOCAL_BROWSER });
});
afterAll(async () => {
  await browser.close();
});
const read = (...parts: string[]): string => readFileSync(join(FOLDER, ...parts), 'utf8');

describe('First build trial: the stored record', () => {
  it('holds the instruction, the helper’s page, the receipt in two forms, the record, and the seven files that the helper received', () => {
    for (const name of ['INSTRUCTION.md', 'index.html', 'receipt.json', 'RECEIPT.md', 'RECORD.md']) expect(existsSync(join(FOLDER, name)), name).toBe(true);
    expect(readdirSync(join(FOLDER, 'files')).sort()).toEqual([...PRESCRIPTION_FILES].sort());
  });

  it('gives the helper the files that the builder writes today for the fixed project, letter for letter', () => {
    expect(TRIAL_DECISIONS).toHaveLength(6);
    const today = writePrescription(trialProject());
    for (const name of PRESCRIPTION_FILES) expect(read('files', name), name).toBe(today[name]);
  });

  it('names the fingerprint of those files in the receipt', () => {
    const fingerprint = (JSON.parse(read('files', 'tokens.json')) as { $extensions: Record<string, string> }).$extensions['refraction.fingerprint'];
    expect(fingerprint).toMatch(/^[0-9a-f]{8}$/);
    expect((JSON.parse(read('receipt.json')) as { fingerprint: string }).fingerprint).toBe(fingerprint);
    expect(read('RECEIPT.md')).toContain(`\`${String(fingerprint)}\``);
  });

  it('measures the stored page to the stored receipt, byte for byte', async () => {
    const files = Object.fromEntries(PRESCRIPTION_FILES.map((name) => [name, read('files', name)]));
    const { receipt, markdown } = await fit({ files, html: read('index.html'), browser });
    expect(`${JSON.stringify(receipt, null, 2)}\n`).toBe(read('receipt.json'));
    expect(markdown).toBe(read('RECEIPT.md'));
  });

  it('says in the record what the run shows and what it does not show', () => {
    const record = read('RECORD.md');
    for (const words of ['one run', 'not a rate', 'cannot be held', 'What the run shows', 'What the run does not show', 'Instruction']) expect(record, words).toContain(words);
    expect(record).not.toMatch(/\baccessib|\bcomplian/i);
    expect(read('INSTRUCTION.md').length).toBeGreaterThan(100);
  });
});
