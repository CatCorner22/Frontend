// The build trials (SPEC.md sections 2.11 and 2.12): the stored records of the runs in which a helper agent built a page.
// Trial 001: the helper received the seven files. Trial 002: the helper received the same project in plain words and no file.
// Trial 003: the helper received seven files for the same project with Contrast checks "Fix for me", so that PRESCRIPTION.md carried the Floors (first draft).
// These tests do not run a helper. They check that each stored record is whole, that it belongs to today's files, and that the
// stored page still measures to the stored receipt.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PRESCRIPTION_FILES, writePrescription } from '@refraction/core';
import { fit, type Receipt } from '../src/fit.ts';
import { TRIAL_DECISIONS, trialProject } from './trial-project.ts';

const LOCAL_BROWSER = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ ...LOCAL_BROWSER });
});
afterAll(async () => {
  await browser.close();
});

const readIn = (id: string, ...parts: string[]): string => readFileSync(join(process.cwd(), 'plugin/fit/trials', id, ...parts), 'utf8');
const receiptOf = (id: string): Receipt => JSON.parse(readIn(id, 'receipt.json')) as Receipt;

for (const id of ['001', '002', '003']) {
  const read = (...parts: string[]): string => readIn(id, ...parts);
  describe(`Build trial ${id}: the stored record`, () => {
    it('holds the instruction, the helper’s page, the receipt in two forms, the record, and the seven files', () => {
      for (const name of ['INSTRUCTION.md', 'index.html', 'receipt.json', 'RECEIPT.md', 'RECORD.md']) expect(existsSync(join(process.cwd(), 'plugin/fit/trials', id, name)), name).toBe(true);
      expect(readdirSync(join(process.cwd(), 'plugin/fit/trials', id, 'files')).sort()).toEqual([...PRESCRIPTION_FILES].sort());
    });

    it('keeps the files that the builder writes today for the fixed project, letter for letter', () => {
      expect(TRIAL_DECISIONS).toHaveLength(6);
      const today = writePrescription(trialProject(id === '003' ? 'enforce' : undefined));
      // The trials ran before the Floors existed (SPEC.md section 2.18). The six files of design values are the same today, letter for letter.
      for (const name of PRESCRIPTION_FILES) if (name !== 'PRESCRIPTION.md') expect(read('files', name), name).toBe(today[name]);
      // `PRESCRIPTION.md` is the file that the helper received. Trial 003 ran with the first draft of the Floors: the stored file and today's
      // file are the same outside section 7 (the Floors), and the stored one holds 48 requirements.
      const stored = read('files', 'PRESCRIPTION.md');
      const current = today['PRESCRIPTION.md'] ?? '';
      if (id === '003') {
        const outside = (text: string): string => text.slice(0, text.indexOf('## 7. Floors')) + text.slice(text.indexOf('## 8. '));
        expect(outside(stored)).toBe(outside(current));
        expect(stored.match(/^- \*\*[ASHQP]\d+\.\*\*/gm)).toHaveLength(48);
        return;
      }
      // Trials 001 and 002: before the Floors, the file ended with section 7, "What this first part leaves out". Today's file holds the same
      // text before its section 7 ("Floors"), except the introduction's last words (a line that the Floors changed). Both heads are equal,
      // line for line; nothing else in sections 1 to 6 may differ.
      const introduction = (line: string): boolean => line.startsWith('This file is an instruction for an AI coding tool.');
      const head = (text: string, marker: string): string[] => text.slice(0, text.indexOf(marker)).split('\n').filter((line) => !introduction(line));
      expect(head(stored, '## 7. What this first part leaves out')).toEqual(head(current, '## 7. Floors'));
      expect(stored.match(/^## 7\. What this first part leaves out$/gm)).toHaveLength(1);
      expect(stored).not.toContain('## 7. Floors');
    });

    it('names the fingerprint of those files in the receipt', () => {
      const fingerprint = (JSON.parse(read('files', 'tokens.json')) as { $extensions: Record<string, string> }).$extensions['refraction.fingerprint'];
      expect(fingerprint).toMatch(/^[0-9a-f]{8}$/);
      expect(receiptOf(id).fingerprint).toBe(fingerprint);
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
}

describe('Build trial 002: the comparison', () => {
  it('gives the second helper no file: its instruction names none of the seven files as something to read', () => {
    const instruction = readIn('002', 'INSTRUCTION.md');
    expect(instruction).toContain('without the Prescription');
    const parts = instruction.split('---\n');
    expect(parts.length, 'the instruction has a header and a body').toBeGreaterThan(1);
    for (const name of PRESCRIPTION_FILES) expect(parts.slice(1).join('---\n'), name).not.toContain(name);
  });

  it('carries every text of the sample content and all six chosen Options in the instruction, so that the project is the same', () => {
    const body = readIn('002', 'INSTRUCTION.md');
    const today = writePrescription(trialProject())['mockup.html'];
    for (const text of ['Harbor Street Dental', 'Dental care that explains itself before it begins.', 'Book a visit', 'Name centered, links below', 'Text and photo side by side', 'Roomy', 'Soft headings with small feet', 'Dark green', 'Clearly rounded (14 px)', 'A calm green, so that the practice does not feel clinical.']) expect(body, text).toContain(text);
    expect(today).toContain('Harbor Street Dental');
  });

  it('has a table in its record that gives, for each measure, the deviation counts of both receipts exactly as the receipts state them', () => {
    const record = readIn('002', 'RECORD.md');
    const first = receiptOf('001');
    const second = receiptOf('002');
    for (const m of first.measured) {
      const other = second.measured.find((x) => x.id === m.id);
      expect(other, m.id).toBeDefined();
      expect(record, m.id).toContain(`| ${m.title.split(':')[0] ?? ''} | ${String(m.deviations)} | ${String(other?.deviations)} |`);
    }
    expect(record).toContain('does not say which page looks better');
    expect(record).toContain('two measurements');
  });
});
