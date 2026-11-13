// Third-party notices for the Studio: who made the fonts and the code that the page carries, and on what terms.
//
// Why this script exists. The Studio's page carries other people's work: font files and code packages. Their
// licences (the SIL Open Font License 1.1 and the MIT License) allow that on one condition: the copyright notice and
// the licence text travel with every copy. Nobody can rely on comments surviving in the built script, so this script
// gathers the notices and writes them to two files:
//
//   THIRD_PARTY_NOTICES.md                 the record in the repository, for people
//   apps/studio/src/notices.generated.ts   the same facts as data, for the Studio to show as text
//
// Where each fact comes from. The script reads files in this repository and in `node_modules`. It reads nothing
// from the network.
//
//   Which fonts ship          the import lines of apps/studio/src/fonts.ts
//   Which code packages ship  the list CODE_PACKAGES below, checked against the Studio's dependencies
//   Copyright of a font       the font file itself (its `name` table), then the package's licence file
//   Copyright of code         the package's licence file
//   Version, licence name     each package's package.json
//
// What can go wrong. The script stops with an error, and writes nothing, when it meets something it cannot report
// faithfully: a font file it cannot read, a licence it does not know, licence texts that differ where it expects
// identical copies, a Reserved Font Name it cannot extract, or a dependency of the Studio that no list covers.
//
// Usage:
//   node scripts/make-notices.mjs           writes both files
//   node scripts/make-notices.mjs --check   writes nothing; exits with code 1 if either file is out of date
// Either form exits with code 2 when the script cannot do its work (see "What can go wrong").
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliDecompressSync } from 'node:zlib';

// ---------------------------------------------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------------------------------------------

const ROOT = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const STUDIO_DIR = join(ROOT, 'apps', 'studio');
const FONTS_MODULE = join(STUDIO_DIR, 'src', 'fonts.ts');
const NOTICES_MD = join(ROOT, 'THIRD_PARTY_NOTICES.md');
const NOTICES_TS = join(STUDIO_DIR, 'src', 'notices.generated.ts');
const SCRIPT = 'scripts/make-notices.mjs';
const RESERVED_NAMES_RECORD = 'docs/research/10-font-reserved-names.md';

/** The code packages whose code the build puts into the Studio's script. `codePackageDirs` keeps this list honest. */
const CODE_PACKAGES = ['react', 'react-dom', 'scheduler', 'zustand', 'zod'];

/** The licences this script knows, by their SPDX identifier (the standard short name of a licence). */
const LICENSE_TITLES = { 'OFL-1.1': 'SIL Open Font License 1.1', MIT: 'MIT License' };
const FONT_LICENSE = 'OFL-1.1';
const CODE_LICENSE = 'MIT';

/** Stands in the stored MIT text where each package's own copyright notice goes. */
const MIT_COPYRIGHT_PLACEHOLDER = '[The copyright notice of each package stands here. The entry of each package gives its notice.]';

// ---------------------------------------------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------------------------------------------

/** An error that this script raises on purpose, with a message written for the reader. */
class NoticesError extends Error {}

function fail(message) {
  throw new NoticesError(message);
}

/** A path as the outputs show it: relative to the repository, with forward slashes. Never an absolute path. */
const rel = (path) => relative(ROOT, path).split(sep).join('/');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const unique = (items) => [...new Set(items)];
/** For comparing two notices: runs of spaces and line breaks count as one space. */
const squash = (text) => text.replace(/\s+/g, ' ').trim();
const isControl = (char) => char.charCodeAt(0) < 0x20 || char.charCodeAt(0) === 0x7f;

/** The number of the first line at which two texts differ. */
function firstDifference(a, b) {
  const other = b.split('\n');
  const lines = a.split('\n');
  const at = lines.findIndex((line, i) => line !== other[i]);
  return (at < 0 ? lines.length : at) + 1;
}

/** Unix line ends, no spaces at line ends, no blank lines at the start or the end. Changes no visible character. */
function normalizeText(text) {
  return text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trimEnd()).join('\n').replace(/^\n+|\n+$/g, '');
}

/** The non-empty lines of a text read from a font file or a licence file. */
function textLines(text, where) {
  // \u2028 and \u2029 are Unicode's "line separator" and "paragraph separator".
  const lines = text.split(/\r\n|[\n\r\v\f\u2028\u2029]/).map((line) => line.trim()).filter((line) => line !== '');
  if (lines.some((line) => [...line].some(isControl))) fail(`${where} holds a control character (an invisible character that does not belong in a notice). Inspect it by hand.`);
  return lines;
}

// ---------------------------------------------------------------------------------------------------------------
// Finding packages
// ---------------------------------------------------------------------------------------------------------------

/** Finds an installed package as Node does: in `node_modules` beside the asking package, then one folder up, and so on. */
function findPackage(fromDir, name) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name);
    if (basename(dir) !== 'node_modules' && existsSync(join(candidate, 'package.json'))) return realpathSync(candidate);
    if (dir === ROOT || dir === dirname(dir)) break;
  }
  return fail(`Cannot find the package "${name}", which ${rel(fromDir) || 'the repository'} needs. Run "npm ci --ignore-scripts" first.`);
}

/** Every package that the Studio needs at run time: its `dependencies`, their `dependencies`, and so on. */
function runtimePackages() {
  const found = new Map(); // folder -> package name
  const queue = [STUDIO_DIR];
  while (queue.length > 0) {
    const dir = queue.shift();
    for (const name of Object.keys(readJson(join(dir, 'package.json')).dependencies ?? {})) {
      const depDir = findPackage(dir, name);
      if (!found.has(depDir)) {
        found.set(depDir, name);
        queue.push(depDir);
      }
    }
  }
  return found;
}

/**
 * The folder of each package in CODE_PACKAGES. An earlier version of this script left out `scheduler`, which arrives
 * through `react-dom`. This check prevents a repeat: every run-time package must be this repository's own code, a
 * font package that fonts.ts imports, or an entry of CODE_PACKAGES. It follows `dependencies` only.
 */
function codePackageDirs(fontPackageNames) {
  const dirs = new Map();
  for (const [dir, name] of runtimePackages()) {
    const ownCode = !dir.split(sep).includes('node_modules'); // a workspace package such as packages/core
    if (ownCode || fontPackageNames.has(name)) continue;
    if (!CODE_PACKAGES.includes(name)) {
      fail(`The Studio depends on the package "${name}" at run time, but no list covers it. If its code ships, add it to CODE_PACKAGES in ${SCRIPT}. If it is a font package, import its font file in ${rel(FONTS_MODULE)}. Otherwise remove the dependency.`);
    }
    if (dirs.has(name)) fail(`Two copies of the package "${name}" are installed for the Studio (${rel(dirs.get(name))} and ${rel(dir)}). This script expects one.`);
    dirs.set(name, dir);
  }
  for (const name of CODE_PACKAGES) {
    if (!dirs.has(name)) fail(`CODE_PACKAGES in ${SCRIPT} lists "${name}", but the Studio's dependencies do not lead to it. Remove it from the list.`);
  }
  return dirs;
}

/** The one licence file of a package, such as LICENSE or LICENSE.md. */
function licenseFileOf(dir) {
  const files = readdirSync(dir).filter((file) => /^licen[cs]e(\.(md|txt))?$/i.test(file)).sort(byText);
  if (files.length !== 1) fail(`Expected one licence file in ${rel(dir)}, found ${files.length === 0 ? 'none' : files.join(', ')}.`);
  return files[0];
}

/** Name, version, licence and source repository, as the package's own package.json states them. */
function manifestFacts(dir, expectedLicense) {
  const manifest = readJson(join(dir, 'package.json'));
  const { name, version, license, repository } = manifest;
  if (typeof name !== 'string' || typeof version !== 'string') fail(`${rel(dir)}/package.json lacks a name or a version.`);
  if (license !== expectedLicense) {
    fail(`The package "${name}" states the licence ${JSON.stringify(license)}; this script expects ${expectedLicense} here. It knows the ${LICENSE_TITLES[FONT_LICENSE]} for fonts and the ${LICENSE_TITLES[CODE_LICENSE]} for code. Read the new licence, then add it and its full text to ${SCRIPT} before the package ships.`);
  }
  const url = typeof repository === 'string' ? repository : repository?.url;
  return {
    name,
    version,
    license,
    repository: typeof url === 'string' ? url.replace(/^git\+/, '').replace(/\.git$/, '') : '',
    repositoryDirectory: typeof repository?.directory === 'string' ? repository.directory : '',
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Reading the notice inside a font file
//
// A WOFF2 file is a font packed for the web. It has three parts: a fixed header, a directory that lists the font's
// tables (a table is one named block of font data), and all the tables squeezed together with the Brotli method.
// The table called `name` holds the font's labelled texts ("name records"): record 0 is the copyright notice,
// record 13 describes the licence, record 14 gives the licence's web address.
//
// Sources, both read on 2026-11-13. WOFF2: the W3C specification "WOFF File Format 2.0", clauses 3 to 5
// (github.com/w3c/woff, woff2/index.html). The `name` table: its layout as the fontTools library reads it
// (github.com/fonttools/fonttools, Lib/fontTools/ttLib/tables/_n_a_m_e.py).
// Check on the same day: FreeType, an independent font reader, returned the same name records as this code for
// all 13 shipped font files.
// ---------------------------------------------------------------------------------------------------------------

const WOFF2_SIGNATURE = 0x774f4632; // the four letters "wOF2"
const COLLECTION_FLAVOR = 0x74746366; // "ttcf": several fonts in one file
const KNOWN_TAGS = { 5: 'name', 10: 'glyf', 11: 'loca' }; // WOFF2 writes common table names as numbers; these three matter here
const ARBITRARY_TAG = 63; // "the four-letter table name follows"
const MAX_FONT_BYTES = 64 * 1024 * 1024; // refuse to unpack more; the shipped files unpack to about 0.1 MB each

/** Reads a UIntBase128 number: 1 to 5 bytes, 7 bits each; a set top bit means "another byte follows". */
function readBase128(file, start) {
  let value = 0;
  for (let i = 0; i < 5; i += 1) {
    const byte = file.readUInt8(start + i);
    if (i === 0 && byte === 0x80) fail('a length in its table directory starts with a zero byte');
    if (value >= 0x2000000) fail('a length in its table directory is larger than 32 bits');
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return { value, next: start + i + 1 };
  }
  return fail('a length in its table directory is longer than 5 bytes');
}

/** Unpacks a WOFF2 file and returns its `name` table. */
function nameTableOf(file) {
  if (file.length < 48 || file.readUInt32BE(0) !== WOFF2_SIGNATURE) fail('it is not a WOFF2 file');
  if (file.readUInt32BE(4) === COLLECTION_FLAVOR) fail('it is a font collection, which this script does not read');
  const tableCount = file.readUInt16BE(12);
  const packedSize = file.readUInt32BE(20);

  // The directory gives each table's size, in the order in which the tables lie in the unpacked data.
  let at = 48;
  let offset = 0;
  let nameTable;
  for (let i = 0; i < tableCount; i += 1) {
    const flags = file.readUInt8(at);
    at += 1;
    let tag = KNOWN_TAGS[flags & 0x3f];
    if ((flags & 0x3f) === ARBITRARY_TAG) {
      tag = file.toString('latin1', at, at + 4);
      at += 4;
    }
    const original = readBase128(file, at);
    at = original.next;
    let size = original.value;
    // WOFF2 may store a table in a rearranged ("transformed") form that packs better. A transformed table, and only
    // a transformed table, has a second length; that length is the room the table takes in the unpacked data.
    // Bits 6 and 7 of `flags` tell: 3 means "not transformed" for `glyf` and `loca`; 0 means it for every other table.
    const version = flags >> 6;
    const transformed = tag === 'glyf' || tag === 'loca' ? version !== 3 : version !== 0;
    if (transformed) {
      const stored = readBase128(file, at);
      at = stored.next;
      size = stored.value;
    }
    if (tag === 'name') {
      if (transformed) fail('its name table is stored in a transformed form, which this script does not read');
      nameTable = { offset, size };
    }
    offset += size;
  }
  if (at + packedSize > file.length) fail('its packed data runs past the end of the file');
  const data = brotliDecompressSync(file.subarray(at, at + packedSize), { maxOutputLength: MAX_FONT_BYTES });
  // If one table size were read wrongly, every later table would sit at the wrong place. This comparison catches that.
  if (data.length !== offset) fail(`its table directory accounts for ${offset} bytes, but its data unpacks to ${data.length} bytes`);
  if (nameTable === undefined) fail('it has no name table');
  return data.subarray(nameTable.offset, nameTable.offset + nameTable.size);
}

/** The records of a `name` table: which platform, encoding and language each is for, its number, and its bytes. */
function nameRecordsOf(table) {
  if (table.length < 6) fail('its name table is too short');
  const count = table.readUInt16BE(2);
  const storage = table.readUInt16BE(4);
  if (6 + count * 12 > table.length) fail('its name table ends inside its list of records');
  const records = [];
  for (let i = 0; i < count; i += 1) {
    const at = 6 + i * 12;
    const start = storage + table.readUInt16BE(at + 10);
    const end = start + table.readUInt16BE(at + 8);
    if (end > table.length) fail('one of its name records points past the end of the name table');
    records.push({
      platformID: table.readUInt16BE(at),
      encodingID: table.readUInt16BE(at + 2),
      languageID: table.readUInt16BE(at + 4),
      nameID: table.readUInt16BE(at + 6),
      bytes: table.subarray(start, end),
    });
  }
  return records;
}

/** A font may hold one text several times, for several systems and languages. Lower rank is preferred. */
function nameRank(record) {
  const windowsUnicode = record.platformID === 3 && [0, 1, 10].includes(record.encodingID); // all three are UTF-16
  if (windowsUnicode && record.languageID === 0x0409) return 0; // Windows, Unicode, English (United States)
  if (windowsUnicode && record.languageID < 0x8000 && (record.languageID & 0x3ff) === 0x09) return 1; // Windows, Unicode, another English
  if (record.platformID === 0) return 2; // the Unicode platform, which has no language
  if (record.platformID === 1 && record.encodingID === 0 && record.languageID === 0) return 3; // Macintosh, Roman, English
  if (windowsUnicode) return 4; // Windows, Unicode, another language
  return undefined; // an encoding that this script does not decode
}

function decodeNameRecord(record) {
  if (record.platformID === 1) {
    // Mac OS Roman equals ASCII below 0x80. Above that, Node needs its full language data (ICU) to decode it.
    if (record.bytes.every((byte) => byte < 0x80)) return record.bytes.toString('latin1');
    return new TextDecoder('macintosh', { fatal: true }).decode(record.bytes);
  }
  // Windows and Unicode records are UTF-16 with the high byte first. Node decodes the low-byte-first kind, so swap.
  if (record.bytes.length % 2 !== 0) fail(`its name record ${record.nameID} has an odd number of bytes`);
  return Buffer.from(record.bytes).swap16().toString('utf16le');
}

/** The text of one name record, or undefined if the font has none (or only an empty one). */
function nameText(records, nameID) {
  let best;
  for (const record of records) {
    const rank = record.nameID === nameID ? nameRank(record) : undefined;
    if (rank !== undefined && (best === undefined || rank < best.rank)) best = { rank, record };
  }
  const text = best === undefined ? '' : decodeNameRecord(best.record);
  return text.trim() === '' ? undefined : text;
}

/** What one shipped font file says about itself. */
function readFontFile(path) {
  try {
    const records = nameRecordsOf(nameTableOf(readFileSync(path)));
    return {
      copyright: nameText(records, 0),
      family: nameText(records, 1),
      version: nameText(records, 5),
      licenseDescription: nameText(records, 13),
      licenseUrl: nameText(records, 14),
    };
  } catch (error) {
    if (error instanceof NoticesError) return fail(`Cannot read the font file ${rel(path)}: ${error.message}.`);
    // Node raises a RangeError for a read past the end of the data, and an error with a `code` when unpacking fails.
    // Anything else is a fault in this script, and Node should report it as one.
    if (error instanceof RangeError) return fail(`Cannot read the font file ${rel(path)}: it is cut short or damaged (a read ran past the end of its data).`);
    if (typeof error?.code === 'string') return fail(`Cannot read the font file ${rel(path)}: it is cut short or damaged (${error.message}).`);
    throw error;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Reading licence files
// ---------------------------------------------------------------------------------------------------------------

const OFL_OPENING = 'This Font Software is licensed under the SIL Open Font License, Version 1.1.';
const OFL_HEADING = 'SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007';
const MIT_HEADING = 'MIT License';
const MIT_GRANT = 'Permission is hereby granted, free of charge, to any person obtaining a copy';
const isCopyrightLine = (line) => /^(copyright\b|\u00a9|\(c\))/i.test(line); // \u00a9 is the copyright sign

/** A font package's LICENSE file: the copyright notice at its top, then the licence text. */
function splitFontLicense(text, where) {
  const lines = normalizeText(text).split('\n');
  const start = lines.indexOf(OFL_OPENING);
  if (start < 0 || !lines.includes(OFL_HEADING)) fail(`${where} does not have the layout of an SIL Open Font License 1.1 file. Read it by hand.`);
  return { header: textLines(lines.slice(0, start).join('\n'), `The top of ${where}`), body: lines.slice(start).join('\n') };
}

/**
 * Some LICENSE files hold several notices on one line: the first plain, each later one after a file label, as in
 *   "<notice> SomeFont-Italic[wght].ttf: <notice>"
 * This returns the notices and the labels separately.
 */
function splitStatements(headerLines) {
  const statements = [];
  const labels = [];
  for (const line of headerLines) {
    line.split(/\s+(\S+\.(?:ttf|otf)):\s+/i).forEach((part, i) => (i % 2 === 0 ? statements : labels).push(part.trim()));
  }
  return { statements: statements.filter((statement) => statement !== ''), labels };
}

/** A code package's MIT licence file: the lines of its copyright notice, and its text with one placeholder in their place. */
function splitMitLicense(text, where) {
  const lines = normalizeText(text).split('\n');
  const grant = lines.findIndex((line) => line.startsWith(MIT_GRANT));
  if (lines[0] !== MIT_HEADING || grant < 0) fail(`${where} does not have the layout of an MIT License file. Read it by hand.`);
  const first = lines.findIndex(isCopyrightLine);
  if (first < 0 || first > grant) fail(`${where} has no copyright notice above its permission text.`);
  const copyright = lines.slice(0, grant).filter(isCopyrightLine);
  const rest = lines.slice(first + 1).filter((line, i) => first + 1 + i >= grant || !isCopyrightLine(line));
  return { copyright, template: [...lines.slice(0, first), MIT_COPYRIGHT_PLACEHOLDER, ...rest].join('\n') };
}

/** Stops unless every package carries the same licence text. Returns that text. */
function sharedText(texts, licenseTitle) {
  const [first, ...others] = texts;
  for (const other of others) {
    if (other.text === first.text) continue;
    fail(`The ${licenseTitle} texts of "${first.name}" and "${other.name}" differ (first difference at line ${firstDifference(first.text, other.text)}). This script stores one text per licence. Read both files, then decide how to store two texts.`);
  }
  return first.text;
}

/**
 * The names that a copyright notice reserves, as in: ... with Reserved Font Name "Playfair Display".
 * The names stand in quotation marks after those words. If the words appear but no quoted name follows,
 * the script stops, so that a person reads the notice.
 */
function reservedFontNames(notice, where) {
  const phrase = /\bReserved\s+Font\s+Names?\b/i.exec(notice);
  if (phrase === null) return [];
  let rest = notice.slice(phrase.index + phrase[0].length);
  const names = [];
  for (;;) {
    rest = rest.replace(/^(?:[\s,;:&]|\band\b|\bor\b)+/i, '');
    // Four kinds of quotation marks: straight double, curly double (\u201c \u201d), curly single (\u2018 \u2019), straight single.
    const quoted = /^(?:"([^"]+)"|\u201c([^\u201d]+)\u201d|\u2018([^\u2019]+)\u2019|'([^']+)')/.exec(rest);
    if (quoted === null) break;
    names.push(quoted[1] ?? quoted[2] ?? quoted[3] ?? quoted[4]);
    rest = rest.slice(quoted[0].length);
  }
  if (names.length === 0) fail(`${where} declares a Reserved Font Name, but this script cannot find the name in quotation marks: ${notice}`);
  return names;
}

// ---------------------------------------------------------------------------------------------------------------
// Gathering the facts
// ---------------------------------------------------------------------------------------------------------------

/** The font files that fonts.ts imports, grouped by npm package. */
function fontImports() {
  // Drop comments first, so that a commented-out import does not count.
  const source = readFileSync(FONTS_MODULE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  // An import names its file between quotation marks, for example:
  //   import inter from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline';
  const isFontPath = (text) => /\.(woff2?|ttf|otf|eot)([?#].*)?$/i.test(text);
  const imported = [...source.matchAll(/^[ \t]*import\b[^'";]*['"]([^'"\n]+)['"]/gm)].map((match) => match[1]).filter(isFontPath);
  const mentioned = [...source.matchAll(/['"`]([^'"`\n]+)['"`]/g)].map((match) => match[1]).filter(isFontPath);
  const stray = mentioned.find((text) => !imported.includes(text));
  if (stray !== undefined) fail(`${rel(FONTS_MODULE)} names the font file ${stray} outside a plain import line. This script reads plain import lines only.`);
  if (imported.length === 0) fail(`Found no font import in ${rel(FONTS_MODULE)}. If the Studio no longer ships fonts, change ${SCRIPT} to say so.`);

  const byPackage = new Map();
  for (const specifier of unique(imported)) {
    const path = specifier.replace(/[?#].*$/, ''); // "?inline" only tells the build tool how to load the file
    if (!/\.woff2$/i.test(path)) fail(`${rel(FONTS_MODULE)} imports ${specifier}. This script reads WOFF2 font files only.`);
    const parts = /^((?:@[^/]+\/)?[^/@.][^/]*)\/(.+)$/.exec(path);
    if (parts === null) fail(`${rel(FONTS_MODULE)} imports the font file ${specifier}, which does not come from an npm package. This script cannot find its notice.`);
    byPackage.set(parts[1], [...(byPackage.get(parts[1]) ?? []), parts[2]]);
  }
  return byPackage;
}

function collectFont(packageName, fileNames) {
  const dir = findPackage(STUDIO_DIR, packageName);
  const facts = manifestFacts(dir, FONT_LICENSE);
  const metadata = existsSync(join(dir, 'metadata.json')) ? readJson(join(dir, 'metadata.json')) : {};
  if (typeof metadata.family !== 'string' || metadata.family.trim() === '') fail(`${rel(dir)}/metadata.json does not give the font's family name.`);

  const files = [...fileNames].sort(byText).map((file) => {
    const path = join(dir, ...file.split('/'));
    if (!existsSync(path)) fail(`${rel(FONTS_MODULE)} imports ${packageName}/${file}, but that file is not installed.`);
    return { file, ...readFontFile(path) };
  });
  const licenseFile = licenseFileOf(dir);
  const where = `${rel(dir)}/${licenseFile}`;
  const { header, body } = splitFontLicense(readFileSync(join(dir, licenseFile), 'utf8'), where);
  const { statements, labels } = splitStatements(header);

  // Compare what the font files say with what the LICENSE file says. Where they differ, keep both and say so.
  const fontNotices = unique(files.flatMap((file) => (file.copyright === undefined ? [] : [squash(file.copyright)])));
  const licenseNotices = unique(statements.map(squash));
  const onlyInFont = fontNotices.filter((notice) => !licenseNotices.includes(notice));
  const onlyInLicense = licenseNotices.filter((notice) => !fontNotices.includes(notice));
  if (fontNotices.length === 0 && licenseNotices.length === 0) fail(`Found no copyright notice for ${packageName}, either in its font file or in ${where}.`);

  const fromFont = unique(files.flatMap((file) => (file.copyright === undefined ? [] : textLines(file.copyright, `The copyright notice inside ${packageName}/${file.file}`))));
  const fromLicense = fromFont.length === 0 ? onlyInLicense : onlyInLicense.map((notice) => `${notice} (from the licence file of the npm package; the font file itself gives a different notice)`);
  const reservedInFont = unique(fontNotices.flatMap((notice) => reservedFontNames(notice, `The font file of ${packageName}`)));
  const reservedInLicense = unique(licenseNotices.flatMap((notice) => reservedFontNames(notice, where)));

  return {
    kind: 'font',
    ...facts,
    family: metadata.family.trim(),
    metadataSource: typeof metadata.source === 'string' ? metadata.source : '',
    files,
    licenseFile,
    licenseHeader: header,
    licenseLabels: labels,
    licenseBody: body,
    fontNotices,
    onlyInFont,
    onlyInLicense,
    copyright: [...fromFont, ...fromLicense],
    reservedInFont,
    reservedInLicense,
    reservedFontNames: unique([...reservedInFont, ...reservedInLicense]),
  };
}

function collectCode(packageName, dir) {
  const facts = manifestFacts(dir, CODE_LICENSE);
  const licenseFile = licenseFileOf(dir);
  const { copyright, template } = splitMitLicense(readFileSync(join(dir, licenseFile), 'utf8'), `${rel(dir)}/${licenseFile}`);
  return { kind: 'code', ...facts, licenseFile, licenseBody: template, copyright, reservedFontNames: [] };
}

function collect() {
  const imports = fontImports();
  const fonts = [...imports.keys()].sort(byText).map((name) => collectFont(name, imports.get(name)));
  const dirs = codePackageDirs(new Set(imports.keys()));
  const packages = [...CODE_PACKAGES].sort(byText).map((name) => collectCode(name, dirs.get(name)));
  const texts = {
    [FONT_LICENSE]: sharedText(fonts.map((font) => ({ name: font.name, text: font.licenseBody })), LICENSE_TITLES[FONT_LICENSE]),
    [CODE_LICENSE]: sharedText(packages.map((item) => ({ name: item.name, text: item.licenseBody })), LICENSE_TITLES[CODE_LICENSE]),
  };
  // The notices file quotes the licence's rule on Reserved Font Names (condition 3) and the definition that the rule
  // rests on. Both quotations come from the licence text just read, so they cannot drift from it.
  const paragraphs = texts[FONT_LICENSE].split(/\n\s*\n/).map(squash);
  const condition3 = paragraphs.find((paragraph) => paragraph.startsWith('3) '));
  const modifiedVersion = paragraphs.find((paragraph) => paragraph.startsWith('"Modified Version" refers to'));
  if (condition3 === undefined || modifiedVersion === undefined) fail(`Cannot find condition 3, or the definition of "Modified Version", in the ${LICENSE_TITLES[FONT_LICENSE]} text.`);
  return { fonts, packages, texts, condition3, modifiedVersion };
}

// ---------------------------------------------------------------------------------------------------------------
// Writing THIRD_PARTY_NOTICES.md
// ---------------------------------------------------------------------------------------------------------------

/** A Markdown code span: it shows a line exactly as it is, whatever characters the line holds. */
function code(text) {
  const fence = '`'.repeat(Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length)) + 1);
  const pad = text.startsWith('`') || text.endsWith('`') || (text.startsWith(' ') && text.endsWith(' ')) ? ' ' : '';
  return `${fence}${pad}${text}${pad}${fence}`;
}

/** A Markdown code block: it shows a text exactly, line breaks included. */
function codeBlock(text) {
  const fence = '`'.repeat(Math.max(2, ...(text.match(/`+/g) ?? []).map((run) => run.length)) + 1);
  return `${fence}text\n${text}\n${fence}`;
}

const plain = (text) => text.replace(/[\\`*_[\]<>&]/g, '\\$&');
const link = (url) => (/^https?:\/\/[^\s<>]+$/.test(url) ? `<${url}>` : code(url));
const list = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
const count = (number, noun, plural = `${noun}s`) => `${number} ${number === 1 ? noun : plural}`;
const orNone = (text) => (text === undefined ? 'the file has none' : code(squash(text)));

function repositoryLine(item) {
  if (item.repository === '') return "- **Source repository:** the package's `package.json` names none";
  const directory = item.repositoryDirectory === '' ? '' : `, directory ${code(item.repositoryDirectory)}`;
  const source = item.kind === 'font' && item.metadataSource !== '' ? ` The package's \`metadata.json\` names ${link(item.metadataSource)} as the source of the font.` : '';
  return `- **Source repository:** ${link(item.repository)}${directory} (from the package's \`package.json\`).${source}`;
}

function fontSection(font) {
  const lines = [
    `### ${plain(font.family)}`,
    '',
    `- **Package:** ${code(font.name)}, version ${code(font.version)}`,
    `- **Licence:** ${LICENSE_TITLES[font.license]} (${code(font.license)}), as the package's \`package.json\` and ${code(font.licenseFile)} file state`,
  ];
  for (const file of font.files) {
    lines.push(
      `- **Font file that ships:** ${code(file.file)}`,
      ...(file.copyright === undefined ? ['  - Copyright notice (name record 0): the file has none'] : textLines(file.copyright, file.file).map((line) => `  - Copyright notice (name record 0): ${code(line)}`)),
      `  - Licence description (name record 13): ${orNone(file.licenseDescription)}`,
      `  - Licence address (name record 14): ${orNone(file.licenseUrl)}`,
      `  - Family name (name record 1): ${orNone(file.family)}`,
      `  - Version (name record 5): ${orNone(file.version)}`,
    );
  }
  lines.push(`- **Copyright notice in the package's ${code(font.licenseFile)} file:** ${font.licenseHeader.length === 0 ? 'the file has none above the licence text' : font.licenseHeader.map(code).join(' / ')}`);

  const question = '- **Do the two notices agree?**';
  if (font.fontNotices.length === 0) lines.push(`${question} The font file has no copyright notice, so the notice comes from the ${code(font.licenseFile)} file alone.`);
  else if (font.licenseHeader.length === 0) lines.push(`${question} The ${code(font.licenseFile)} file has no notice to compare, so the notice comes from the font file alone.`);
  else if (font.onlyInFont.length === 0 && font.onlyInLicense.length === 0) {
    lines.push(`${question} Yes.${font.licenseLabels.length === 0 ? '' : ` The ${code(font.licenseFile)} file repeats the notice after the label ${list(font.licenseLabels.map((label) => code(`${label}:`)))}.`}`);
  } else {
    lines.push(
      `${question} No. This file records both.`,
      ...font.onlyInFont.map((notice) => `  - Only the font file gives: ${code(notice)}`),
      ...font.onlyInLicense.map((notice) => `  - Only the ${code(font.licenseFile)} file gives: ${code(notice)}`),
    );
  }

  const reserved = font.reservedFontNames.map((name) => {
    const inFont = font.reservedInFont.includes(name);
    const inLicense = font.reservedInLicense.includes(name);
    const where = inFont && inLicense ? `the font file and the ${code(font.licenseFile)} file both declare it` : inFont ? `the font file declares it; the ${code(font.licenseFile)} file does not` : `the ${code(font.licenseFile)} file declares it; the font file does not`;
    return `${code(name)} (${where})`;
  });
  lines.push(`- **Reserved Font Name:** ${reserved.length === 0 ? `none declared in the font file or in the ${code(font.licenseFile)} file` : reserved.join('; ')}`);
  lines.push(repositoryLine(font));
  return lines.join('\n');
}

function codeSection(item) {
  return [
    `### ${plain(item.name)}`,
    '',
    `- **Package:** ${code(item.name)}, version ${code(item.version)}`,
    `- **Licence:** ${LICENSE_TITLES[item.license]} (${code(item.license)}), as the package's \`package.json\` and ${code(item.licenseFile)} file state`,
    ...item.copyright.map((line) => `- **Copyright notice** (from the package's ${code(item.licenseFile)} file): ${code(line)}`),
    repositoryLine(item),
  ].join('\n');
}

function renderMarkdown({ fonts, packages, texts, condition3, modifiedVersion }) {
  const fontFiles = fonts.reduce((sum, font) => sum + font.files.length, 0);
  const reserving = fonts.filter((font) => font.reservedFontNames.length > 0);
  const declaring = (font) => unique([...font.fontNotices, ...font.onlyInLicense]).filter((notice) => reservedFontNames(notice, font.name).length > 0);
  const reservedSummary = reserving.length === 0
    ? [`None of the ${count(fonts.length, 'font')} below declares a Reserved Font Name.`]
    : [
        `Of the ${count(fonts.length, 'font')} below, ${reserving.length} ${reserving.length === 1 ? 'declares' : 'declare'} a Reserved Font Name. The declaring notices, word for word:`,
        '',
        ...reserving.flatMap((font) => declaring(font).map((notice) => `- ${plain(font.family)}: ${code(notice)}`)),
      ];
  // A font file's own family record does not always match the family name of its package. Say so once, with an
  // example, so that nobody takes the difference for an error in this file.
  const otherName = fonts.flatMap((font) => font.files.map((file) => ({ font, file }))).find(({ font, file }) => file.family !== undefined && squash(file.family) !== font.family);
  const mitGroups = unique(packages.map((item) => item.copyright.join('\n'))).map((lines) => ({
    lines: lines.split('\n'),
    names: packages.filter((item) => item.copyright.join('\n') === lines).map((item) => code(item.name)),
  }));

  return `${[
    '# Third-party notices',
    '',
    `**What this file is.** The Studio's page carries work that other people made: ${count(fontFiles, 'font file')} and ${count(packages.length, 'code package')}. This file names each one, gives its copyright notice (the line that says who holds the rights to the work) in full, and ends with the complete text of each licence (the terms on which the copyright holder lets others use the work).`,
    '',
    `**Why it exists.** The two licences, the ${LICENSE_TITLES[FONT_LICENSE]} and the ${LICENSE_TITLES[CODE_LICENSE]}, allow the Studio to carry this work and pass it on. Both set one condition: the copyright notice and the licence text travel with every copy. The build shrinks the Studio's code into one script, and nobody can rely on comments surviving that step. So the notices live in two generated files: this one, for the repository, and \`${rel(NOTICES_TS)}\`, which holds the same notices and licence texts as data for the Studio to show on its page.`,
    '',
    `**How it is made.** \`node ${SCRIPT}\` writes both files; do not edit either by hand. \`node ${SCRIPT} --check\` writes nothing: it reports whether each file still matches what the script would write, and exits with an error code if one does not. An automated check can run it to catch a stale file.`,
    '',
    '**Where each fact comes from.** The script reads files in this repository and in `node_modules` (the folder of installed packages; an npm package is a published bundle of files with a name and a version). It reads nothing from the network.',
    '',
    `- *Which fonts ship:* the import lines of \`${rel(FONTS_MODULE)}\`. Each line names one font file.`,
    `- *Which code packages ship:* a list in the script (${list(packages.map((item) => code(item.name)))}). The script also follows the Studio's dependencies (the packages that the Studio needs in order to run, and the packages that those need). It stops with an error if it finds a package that neither list covers.`,
    "- *The copyright notice of a font:* the font file itself. A font file holds labelled texts called name records: record 0 is the copyright notice, record 13 describes the licence, and record 14 gives the licence's web address. The script also reads the copyright notice at the top of the package's licence file (the file named `LICENSE`, or similar, inside the package), and this file says whether the two agree.",
    "- *The copyright notice of a code package:* the package's licence file.",
    "- *Version, licence name and source repository:* each package's `package.json`, the file in which a package describes itself. The script also checks that each licence file carries the heading of the named licence, and that all packages under one licence carry the same licence text (the copyright notice aside).",
    '',
    '**What the script does not check.** It does not inspect the built page. It copies each notice as written; it cannot judge whether a notice is correct, or whether the Studio meets every condition of a licence. It covers the font files and code packages listed here and nothing else. Anything else that the repository takes from other people (text, recipes or formulas copied by hand, for example) needs its own record, because this script cannot see it.',
    '',
    '## Fonts',
    '',
    `The Studio ships ${count(fontFiles, 'font file')} in the WOFF2 format (a compressed font format for the web). Each comes from the npm package named in its section. Every one is under the ${LICENSE_TITLES[FONT_LICENSE]}; the full text stands at the end of this file.`,
    '',
    `Each section quotes what the font file says about itself. The heading of a section is the family name that the package's \`metadata.json\` gives.${otherName === undefined ? '' : ` Name record 1 inside a font file does not always match that name (${code(squash(otherName.file.family))} under ${plain(otherName.font.family)}, for example); the section quotes the record as it stands.`}`,
    '',
    `**Reserved Font Names.** A copyright holder may reserve a font's name. Condition 3 of the licence then limits who may use that name. It reads: ${code(condition3)} The licence defines the term that the condition rests on: ${code(modifiedVersion)}`,
    '',
    ...reservedSummary,
    '',
    `This file records each declaration. It does not judge whether the Studio's use of a font meets condition 3. \`${RESERVED_NAMES_RECORD}\` records what the project has established about that question, and what it has not.`,
    '',
    fonts.map(fontSection).join('\n\n'),
    '',
    '## Code packages',
    '',
    `The Studio needs ${count(packages.length, 'code package')} in order to run: its own dependencies, and theirs. A build tool copies such code into the page's script, so this file treats ${packages.length === 1 ? 'it' : `all ${packages.length}`} as shipped. Every one is under the ${LICENSE_TITLES[CODE_LICENSE]}; the full text stands at the end of this file.`,
    '',
    packages.map(codeSection).join('\n\n'),
    '',
    '## Full licence texts',
    '',
    `### ${LICENSE_TITLES[FONT_LICENSE]} (${code(FONT_LICENSE)})`,
    '',
    `This licence covers ${list(fonts.map((font) => plain(font.family)))}.`,
    '',
    `Each font package carries the text below in its licence file, after its own copyright notice. The script compared the ${count(fonts.length, 'copy', 'copies')} and found them identical. The copyright notice of each font stands in its section above.`,
    '',
    codeBlock(texts[FONT_LICENSE]),
    '',
    `### ${LICENSE_TITLES[CODE_LICENSE]} (${code(CODE_LICENSE)})`,
    '',
    `This licence covers ${list(packages.map((item) => code(item.name)))}.`,
    '',
    `Each code package carries the text below in its licence file. The script compared the ${count(packages.length, 'copy', 'copies')}: they are identical except for the copyright notice. In the text below, the line in square brackets stands where that notice goes. The copyright notice of each package:`,
    '',
    ...mitGroups.flatMap((group) => group.lines.map((line) => `- ${list(group.names)}: ${code(line)}`)),
    '',
    codeBlock(texts[CODE_LICENSE]),
  ].join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------------------------
// Writing apps/studio/src/notices.generated.ts
// ---------------------------------------------------------------------------------------------------------------

const unicodeEscape = (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;

/** A TypeScript string in single quotation marks that holds exactly `text`. */
function tsString(text) {
  return `'${[...text].map((char) => (char === '\\' || char === "'" ? `\\${char}` : isControl(char) || char === '\u2028' || char === '\u2029' ? unicodeEscape(char) : char)).join('')}'`;
}

/** A TypeScript template literal (text between backticks, line breaks allowed) that holds exactly `text`. */
function tsTemplate(text) {
  const escaped = [...text].map((char, i, chars) => {
    if (char === '\\' || char === '`' || (char === '$' && chars[i + 1] === '{')) return `\\${char}`;
    return isControl(char) && char !== '\n' ? unicodeEscape(char) : char;
  });
  return `\`${escaped.join('')}\``;
}

/** A TypeScript array of strings: on one line when it has at most one entry, else one entry per line. */
const tsList = (items) => (items.length < 2 ? `[${items.map(tsString).join('')}]` : `[\n${items.map((item) => `      ${tsString(item)},\n`).join('')}    ]`);

function renderModule({ fonts, packages, texts }) {
  const fontFiles = fonts.reduce((sum, font) => sum + font.files.length, 0);
  const notice = (item) => [
    '  {',
    `    name: ${tsString(item.kind === 'font' ? `${item.family} (${item.name})` : item.name)},`,
    `    version: ${tsString(item.version)},`,
    `    kind: ${tsString(item.kind)},`,
    `    license: ${tsString(item.license)},`,
    `    copyright: ${tsList(item.copyright)},`,
    `    reservedFontNames: ${tsList(item.reservedFontNames)},`,
    `    repository: ${tsString(item.repository)},`,
    '  },',
  ].join('\n');

  return `${[
    `// Generated by ${SCRIPT}. Do not edit by hand.`,
    '//',
    `// The Studio's page carries work that other people made: ${count(fontFiles, 'font file')} and ${count(packages.length, 'code package')}. Their licences ask that the`,
    '// copyright notice and the licence text travel with every copy. This module holds both as plain data, so that the',
    `// Studio can show them as text. ${rel(NOTICES_MD)} gives the same facts with the source of each one.`,
    '//',
    `// Why the MIT text is stored once. The script compared the licence files of the ${count(packages.length, 'code package')}. Apart from`,
    '// the copyright notice, the texts are identical. So LICENSE_TEXTS.MIT holds the text once, with the line',
    '// MIT_COPYRIGHT_PLACEHOLDER where the copyright notice goes. The `copyright` field of each package\'s entry in NOTICES',
    '// gives that package\'s own notice.',
    `// The ${LICENSE_TITLES[FONT_LICENSE]} text is stored once as well: the ${count(fonts.length, 'font package')} carry identical copies.`,
    '',
    'export interface Notice {',
    '  /** A font: the family name, then the npm package in parentheses. Code: the npm package. */',
    '  name: string;',
    '  /** The version of that npm package. */',
    '  version: string;',
    "  kind: 'font' | 'code';",
    '  /** The short identifier of the licence. It is also the key of the full text in LICENSE_TEXTS. */',
    '  license: string;',
    '  /**',
    '   * The copyright notice in full, one line per entry. For a font, the lines come from the font file that ships. A',
    "   * line that only the package's licence file gives follows them, and says so in parentheses.",
    '   */',
    '  copyright: string[];',
    "  /** The names that the font's copyright notice reserves. Empty when the notice reserves none, and for code. */",
    '  reservedFontNames: string[];',
    "  /** The source repository that the package's package.json names. */",
    '  repository: string;',
    '}',
    '',
    'export const NOTICES: readonly Notice[] = [',
    ...[...fonts, ...packages].map(notice),
    '];',
    '',
    '/** The line in LICENSE_TEXTS.MIT that stands where the copyright notice of a package goes. */',
    `export const MIT_COPYRIGHT_PLACEHOLDER = ${tsString(MIT_COPYRIGHT_PLACEHOLDER)};`,
    '',
    '/** The full text of each licence, by the identifier that `Notice.license` uses. */',
    'export const LICENSE_TEXTS: Readonly<Record<string, string>> = {',
    ...Object.keys(texts).map((id) => `  ${tsString(id)}: ${tsTemplate(texts[id])},`),
    '};',
  ].join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------------------------

function main() {
  const unknown = process.argv.slice(2).filter((argument) => argument !== '--check');
  if (unknown.length > 0) fail(`Unknown argument: ${unknown.join(' ')}. Usage: node ${SCRIPT} [--check]`);
  const check = process.argv.includes('--check');

  const facts = collect();
  const outputs = [
    [NOTICES_MD, renderMarkdown(facts)],
    [NOTICES_TS, renderModule(facts)],
  ];

  if (!check) {
    for (const [path, text] of outputs) writeFileSync(path, text);
    console.log(`notices: ${count(facts.fonts.length, 'font')}, ${count(facts.packages.length, 'code package')}; wrote ${list(outputs.map(([path, text]) => `${rel(path)} (${Buffer.byteLength(text)} bytes)`))}`);
    return;
  }

  let stale = 0;
  for (const [path, text] of outputs) {
    const onDisk = existsSync(path) ? readFileSync(path, 'utf8') : undefined;
    if (onDisk === text) {
      console.log(`notices: ${rel(path)} is current`);
      continue;
    }
    stale += 1;
    console.error(onDisk === undefined ? `notices: ${rel(path)} is missing` : `notices: ${rel(path)} differs from what the script writes (first difference at line ${firstDifference(onDisk, text)})`);
  }
  if (stale > 0) {
    console.error(`notices: run "node ${SCRIPT}" and commit the result`);
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  // Code 2 means "the script could not do its work"; code 1 is kept for "a file is out of date".
  console.error(error instanceof NoticesError ? `notices: ${error.message}` : error);
  process.exitCode = 2;
}
