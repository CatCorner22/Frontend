// One archive file (a "zip" file) that holds several text files (SPEC.md section 2.9).
//
// The files are stored as they are, without compression: the Vision is small, and a stored file needs no
// compression code. Every unpacking program reads such an archive. The archive carries one fixed date (1 January 1980,
// the earliest that the format can hold), so that the same files always give the same archive, byte for byte.

const table = new Uint32Array(256).map((_, index) => {
  let sum = index;
  for (let bit = 0; bit < 8; bit++) sum = sum & 1 ? 0xedb88320 ^ (sum >>> 1) : sum >>> 1;
  return sum >>> 0;
});

/** The check sum that the format asks for (CRC-32), by which an unpacking program sees a damaged file. */
function checkSum(bytes: Uint8Array): number {
  let sum = 0xffffffff;
  for (const byte of bytes) sum = table[(sum ^ byte) & 0xff]! ^ (sum >>> 8);
  return (sum ^ 0xffffffff) >>> 0;
}

/**
 * A text as UTF-8 bytes. Written out here because the core uses no service of a browser or of Node, not even the text
 * encoder that both have. Half of a two-part character with its other half missing becomes the replacement sign, as that
 * encoder would make it.
 */
function utf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const character of text) {
    let code = character.codePointAt(0)!;
    if (code >= 0xd800 && code <= 0xdfff) code = 0xfffd;
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  return Uint8Array.from(bytes);
}

const NAME_IS_UTF8 = 0x0800;
const FIXED_DATE = 0x0021; // 1 January 1980

/** The files as one archive. Names and contents are written as UTF-8. */
export function zipFiles(files: Readonly<Record<string, string>>): Uint8Array {
  const entries = Object.entries(files).map(([name, text]) => ({ name: utf8(name), data: utf8(text) }));
  const listSize = entries.reduce((total, entry) => total + 46 + entry.name.length, 0);
  const bodySize = entries.reduce((total, entry) => total + 30 + entry.name.length + entry.data.length, 0);
  const out = new Uint8Array(bodySize + listSize + 22);
  const view = new DataView(out.buffer);
  let at = 0;
  let listAt = bodySize;
  for (const entry of entries) {
    const sum = checkSum(entry.data);
    // The list at the end of the archive names each file and says where it starts.
    view.setUint32(listAt, 0x02014b50, true);
    view.setUint16(listAt + 4, 20, true);
    view.setUint16(listAt + 6, 20, true);
    view.setUint16(listAt + 8, NAME_IS_UTF8, true);
    view.setUint16(listAt + 14, FIXED_DATE, true);
    view.setUint32(listAt + 16, sum, true);
    view.setUint32(listAt + 20, entry.data.length, true);
    view.setUint32(listAt + 24, entry.data.length, true);
    view.setUint16(listAt + 28, entry.name.length, true);
    view.setUint32(listAt + 42, at, true);
    out.set(entry.name, listAt + 46);
    listAt += 46 + entry.name.length;
    // The file itself, with the same facts in front of it.
    view.setUint32(at, 0x04034b50, true);
    view.setUint16(at + 4, 20, true);
    view.setUint16(at + 6, NAME_IS_UTF8, true);
    view.setUint16(at + 12, FIXED_DATE, true);
    view.setUint32(at + 14, sum, true);
    view.setUint32(at + 18, entry.data.length, true);
    view.setUint32(at + 22, entry.data.length, true);
    view.setUint16(at + 26, entry.name.length, true);
    out.set(entry.name, at + 30);
    out.set(entry.data, at + 30 + entry.name.length);
    at += 30 + entry.name.length + entry.data.length;
  }
  view.setUint32(listAt, 0x06054b50, true);
  view.setUint16(listAt + 8, entries.length, true);
  view.setUint16(listAt + 10, entries.length, true);
  view.setUint32(listAt + 12, listSize, true);
  view.setUint32(listAt + 16, bodySize, true);
  return out;
}
