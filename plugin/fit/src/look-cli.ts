// The command line of the look:  node plugin/fit/src/look-cli.ts [--run-scripts] [--fonts <folder>] <build.html> <folder of the Vision's files> <result folder>
// It writes the pictures, `LOOK.md`, and `look.json` into the folder `look` inside the result folder, beside the receipt of the Fit check.
// Status 0: every window width was pictured. Status 1: at least one was not. Status 2: the program refused, and it wrote nothing.
// The look judges nothing and counts no deviation; the Fit check (cli.ts) does that.
import { closeSync, constants, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FitError, fontFilesOf, look } from './look.ts';
import { bounded, noBrowserLine } from './fit.ts';
import { READ_FILES } from './vision.ts';

const USAGE = `Usage: node ${relative(process.cwd(), fileURLToPath(import.meta.url)) || 'look-cli.ts'} [--run-scripts] [--fonts <folder>] <build.html> <Vision folder> <result folder>`;
/** The folder inside the result folder that holds the look. The program empties it of its own files before it writes. */
const FOLDER = 'look';
const OWN_FILE = /^(?:LOOK\.md|look\.json|(?:compare|build)-\d+(?:-\d+)?\.png)$/;
const FONT_MAX_BYTES = 5_000_000;
const FONT_FOLDERS_MAX = 2000;

const isLink = (path: string): boolean => {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
};

/** Writes a file and refuses a link at its place (O_NOFOLLOW), as the Fit check does. */
function writeNoFollow(path: string, data: string | Uint8Array): void {
  const fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o644);
  try {
    if (typeof data === 'string') writeSync(fd, data);
    else writeSync(fd, data);
  } finally {
    closeSync(fd);
  }
}

/** The largest build or Vision file that the program reads, as in the Fit check. */
const FILE_MAX = 20_000_000;

function readText(path: string, what: string): string {
  // Only an ordinary file is read: a pipe or a device would make the program wait for ever, as in the Fit check (gate review,
  // finding G-S09; retest finding R-S11).
  let ordinary = false;
  let size = 0;
  try {
    const stat = statSync(path);
    ordinary = stat.isFile();
    size = stat.size;
  } catch {
    throw new FitError(`Cannot read ${what}: ${path}`);
  }
  if (!ordinary) throw new FitError(`Cannot read ${what}: it is not an ordinary file.`);
  if (size > FILE_MAX) throw new FitError(`Cannot read ${what}: it is larger than ${String(FILE_MAX / 1_000_000)} megabytes.`);
  try {
    return readFileSync(path, 'utf8');
  } catch {
    throw new FitError(`Cannot read ${what}: ${path}`);
  }
}

/**
 * The font files that `FONTS.md` names, found by file name in `folder` or in a folder below it (a package of fonts keeps them in
 * `<package>/files/`). Only the named files are read; a link is not followed, and a file of more than 5 megabytes is left out.
 */
function findFonts(folder: string, wanted: ReadonlySet<string>): Record<string, Uint8Array> {
  const found: Record<string, Uint8Array> = {};
  const queue: { path: string; depth: number }[] = [{ path: folder, depth: 0 }];
  let seen = 0;
  while (queue.length > 0 && seen < FONT_FOLDERS_MAX) {
    const { path, depth } = queue.shift() as { path: string; depth: number };
    seen++;
    let entries: string[];
    try {
      entries = readdirSync(path).sort();
    } catch {
      if (depth === 0) throw new FitError(`Cannot read the folder of font files: ${path}`);
      continue;
    }
    for (const name of entries) {
      const full = join(path, name);
      if (isLink(full)) continue;
      let stat;
      try {
        stat = statSync(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (depth < 4) queue.push({ path: full, depth: depth + 1 });
        // Only an ordinary file is read: a pipe under a font's name would make the program wait for ever (finding F-104).
      } else if (stat.isFile() && wanted.has(name) && !Object.hasOwn(found, name) && stat.size <= FONT_MAX_BYTES) found[name] = readFileSync(full);
    }
  }
  return found;
}

async function main(args: string[]): Promise<number> {
  const rest: string[] = [];
  let runScripts = false;
  let fontsFolder: string | undefined;
  for (let at = 0; at < args.length; at++) {
    const arg = args[at] ?? '';
    if (arg === '--run-scripts') runScripts = true;
    else if (arg === '--fonts') {
      fontsFolder = args[++at];
      if (!fontsFolder) throw new FitError(USAGE);
    } else rest.push(arg);
  }
  const [buildPath, folder, outFolder] = rest;
  if (rest.length !== 3 || !buildPath || !folder || !outFolder) throw new FitError(USAGE);
  const target = join(resolve(outFolder), FOLDER);
  if (isLink(resolve(outFolder)) || isLink(target)) throw new FitError('The result folder, or its folder "look", is a link. The program does not write through a link, and it wrote nothing.');
  // Pictures of an earlier build would look current after a refusal; the program's own files go first.
  let earlier: string[] = [];
  try {
    earlier = readdirSync(target);
  } catch {
    // The folder does not exist yet.
  }
  for (const name of earlier) if (OWN_FILE.test(name)) rmSync(join(target, name), { force: true });
  let archive = false;
  try {
    archive = statSync(resolve(folder)).isFile();
  } catch {
    // A folder that is not there is named by the reading of its files.
  }
  if (archive) throw new FitError(`The Vision folder that was given is a file, not a folder: ${resolve(folder)}. If it is the archive from the Studio, unpack it first and give the folder.`);
  const html = readText(resolve(buildPath), 'the build');
  const files: Record<string, string> = {};
  for (const name of [...READ_FILES, 'FONTS.md']) {
    try {
      files[name] = readText(join(resolve(folder), name), `the file "${name}" of the Vision`);
    } catch (error) {
      // A missing file is named by the check inside `look`; FONTS.md is needed only for the Mockup's letters. A file that is
      // there and is no ordinary file, or is too large, is refused here.
      let there = true;
      try {
        lstatSync(join(resolve(folder), name));
      } catch {
        there = false;
      }
      if (there) throw error;
    }
  }
  const fonts = fontsFolder === undefined ? {} : findFonts(resolve(fontsFolder), new Set(fontFilesOf(files['FONTS.md'] ?? '').map((font) => font.file)));
  const launch = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
  const result = await look({ files, html, launch, runScripts, fonts });
  mkdirSync(target, { recursive: true });
  if (isLink(target)) throw new FitError('The folder "look" in the result folder is a link. The program does not write through a link, and it wrote nothing.');
  for (const picture of result.pictures) writeNoFollow(join(target, picture.name), picture.png);
  writeNoFollow(join(target, 'look.json'), `${JSON.stringify(result.look, null, 2)}\n`);
  writeNoFollow(join(target, 'LOOK.md'), result.markdown);
  const missing = fontsFolder === undefined ? '' : ` Font files found: ${String(Object.keys(fonts).length)}.`;
  process.stdout.write(`${String(result.pictures.length)} pictures${result.look.failures.length > 0 ? `, ${String(result.look.failures.length)} window widths not pictured` : ''}.${missing} Read first: ${join(target, 'LOOK.md')}\n`);
  return result.status;
}

main(process.argv.slice(2)).then(
  (status) => process.exit(status),
  (error: unknown) => {
    // One line, made visible and cut, as the Fit check's (gate review, finding G-S02).
    const message = error instanceof FitError ? error.message : (noBrowserLine('The look', error) ?? `The look stopped: ${error instanceof Error ? error.message : String(error)}`);
    process.stderr.write(`${bounded(message.replace(/\s+/g, ' '), 400)}\n`);
    process.exit(2);
  },
);
