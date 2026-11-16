import { crc32 } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { PRESCRIPTION_FILES, applyDirection, createProject, writePrescription, zipFiles } from '../src/index.js';

/** Read an archive as any unpacking program does: from the list at its end. Returns each file's name and text. */
export function unzip(bytes: Uint8Array): Record<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  expect(view.getUint32(end, true)).toBe(0x06054b50);
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const out: Record<string, string> = {};
  const text = new TextDecoder('utf-8', { fatal: true });
  for (let n = 0; n < count; n++) {
    expect(view.getUint32(at, true)).toBe(0x02014b50);
    expect(view.getUint16(at + 10, true), 'stored, not compressed').toBe(0);
    const sum = view.getUint32(at + 16, true);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const local = view.getUint32(at + 42, true);
    const name = text.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    expect(view.getUint32(local, true)).toBe(0x04034b50);
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    expect(crc32(data), name).toBe(sum);
    out[name] = text.decode(data);
    at += 46 + nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
  }
  return out;
}

describe('One archive file for the whole Prescription (SPEC.md section 2.9)', () => {
  it('holds every file under its name, letter for letter, with a check sum that an unpacking program accepts', () => {
    const files = writePrescription(applyDirection(createProject('Harbor Street Dental'), 'paper-and-ink'));
    expect(Object.keys(files)).toEqual([...PRESCRIPTION_FILES]);
    expect(PRESCRIPTION_FILES).toEqual(['PRESCRIPTION.md', 'DESIGN.md', 'tokens.css', 'tokens.json', 'theme.css', 'mockup.html', 'FONTS.md']);
    const archive = zipFiles(files);
    expect(unzip(archive)).toEqual(files);
    // The same files give the same archive, byte for byte: it carries no date of its own.
    expect(Buffer.from(zipFiles(files)).equals(Buffer.from(archive))).toBe(true);
  });

  it('keeps letters beyond the plain alphabet, an empty file, and a name with a space', () => {
    const files = { 'a b.md': 'Größe “quoted” — 日本語 \u{1F600}', 'empty.txt': '', 'c.css': ':root {}\n' };
    expect(unzip(zipFiles(files))).toEqual(files);
    // The core's own encoding gives the bytes that the platform's encoder gives, for every kind of character.
    const all = 'aé€\u{1F600}\u0000\u07ff\u0800\uffff\u{10000}\u{10ffff}';
    expect(unzip(zipFiles({ x: all }))).toEqual({ x: all });
  });
});
