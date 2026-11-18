// The command line of the look:  node plugin/fit/src/look-cli.ts [--run-scripts] [--fonts <folder>] <build.html> <folder of the Vision's files> <result folder>
// It writes the pictures, `LOOK.md`, and `look.json` into the folder `look` inside the result folder, beside the receipt of the Fit check.
// Status 0: every window width was pictured. Status 1: at least one was not. Status 2: the program refused, and it wrote nothing.
// The look judges nothing and counts no deviation; the Fit check (cli.ts) does that.
import { closeSync, constants, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FitError, fontFilesOf, look } from './look.ts';
import { READ_FILES } from './vision.ts';

const USAGE = 'Usage: node plugin/fit/src/look-cli.ts [--run-scripts] [--fonts <folder>] <build.html> <folder of the Vision files> <result folder>';
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

function readText(path: string, what: string): string {
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
      } else if (wanted.has(name) && !Object.hasOwn(found, name) && stat.size <= FONT_MAX_BYTES) found[name] = readFileSync(full);
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
  const html = readText(resolve(buildPath), 'the build');
  const files: Record<string, string> = {};
  for (const name of [...READ_FILES, 'FONTS.md']) {
    try {
      files[name] = readFileSync(join(resolve(folder), name), 'utf8');
    } catch {
      // A missing file is named by the check inside `look`; FONTS.md is needed only for the Mockup's letters.
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
    process.stderr.write(`${error instanceof FitError ? error.message : `The look stopped: ${error instanceof Error ? error.message : String(error)}`}\n`);
    process.exit(2);
  },
);
