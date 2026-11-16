// Faults that no test caught (the seventh review's test auditor, rows Q7-53, Q7-84, Q7-89, Q7-96, Q7-97, Q7-98).
import { crc32 } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { createProject, plainName, removeContentItem, visibleText, zipFiles } from '../src/index.js';

describe('the archive writer: the check sum stands in the header before the file as well as in the list at the end', () => {
  it('writes the same, correct check sum in both places for each file', () => {
    const files = { 'a.txt': 'hello', 'b with space.txt': 'Größe ✓ 😀', 'empty.txt': '' };
    const bytes = zipFiles(files);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let at = 0;
    let seen = 0;
    for (const text of Object.values(files)) {
      expect(view.getUint32(at, true)).toBe(0x04034b50);
      const data = new TextEncoder().encode(text);
      expect(view.getUint32(at + 14, true)).toBe(crc32(data));
      expect(view.getUint32(at + 18, true)).toBe(data.length);
      at += 30 + view.getUint16(at + 26, true) + view.getUint16(at + 28, true) + data.length;
      seen++;
    }
    expect(seen).toBe(3);
    // The list at the end repeats each check sum.
    let list = at;
    for (const text of Object.values(files)) {
      expect(view.getUint32(list, true)).toBe(0x02014b50);
      expect(view.getUint32(list + 16, true)).toBe(crc32(new TextEncoder().encode(text)));
      list += 46 + view.getUint16(list + 28, true);
    }
  });
});

describe('the Brief: removing an item', () => {
  it('leaves the project as it is for an index below zero, an index past the end, and a list at its fewest', () => {
    const project = createProject('Lists');
    expect(removeContentItem(project, 'services', -1)).toBe(project);
    expect(removeContentItem(project, 'services', 99)).toBe(project);
    let fewest = project;
    while (fewest.content.facts.length > 0) fewest = removeContentItem(fewest, 'facts', 0);
    expect(removeContentItem(fewest, 'facts', 0)).toBe(fewest);
  });
});

describe('the cleaning of the owner’s texts: invisible signs, half characters, and line breaks', () => {
  const SIGNS: [string, number][] = [
    ['soft hyphen', 0x00ad], ['combining grapheme joiner', 0x034f], ['Arabic letter mark', 0x061c], ['Hangul filler', 0x115f], ['Hangul filler 2', 0x1160],
    ['Khmer vowel inherent', 0x17b4], ['Mongolian free variation selector', 0x180b], ['zero-width space', 0x200b], ['left-to-right mark', 0x200e],
    ['right-to-left override', 0x202e], ['word joiner', 0x2060], ['left-to-right isolate', 0x2066], ['braille blank', 0x2800], ['Hangul filler 3', 0x3164],
    ['variation selector 16', 0xfe0f], ['byte order mark', 0xfeff], ['half-width Hangul filler', 0xffa0], ['interlinear annotation anchor', 0xfff9], ['tag letter', 0xe0049],
  ];
  it.each(SIGNS)('turns %s (U+%s) into a space, in a name and in a text for an AI tool', (_label, code) => {
    const sign = String.fromCodePoint(code);
    expect(plainName(`a${sign}b`)).toBe('a b');
    expect(visibleText(`a${sign}b`)).toBe('a b');
  });

  it('turns half of a two-part character into a space, and keeps a whole one', () => {
    expect(visibleText('a\ud83db')).toBe('a b');
    expect(visibleText('a\ude00b')).toBe('a b');
    expect(plainName('a\ud83d')).toBe('a');
    expect(plainName('\ude00a')).toBe('a');
    expect(visibleText('a😀b')).toBe('a😀b');
    expect(plainName('a😀b')).toBe('a😀b');
  });

  it('keeps a line break in a text for an AI tool, makes every kind of break one kind, and turns a tab into a space', () => {
    expect(visibleText('a\nb')).toBe('a\nb');
    expect(visibleText('a\r\nb\rc')).toBe('a\nb\nc');
    expect(visibleText('a\tb')).toBe('a b');
    expect(plainName('a\nb')).toBe('a b');
  });
});
