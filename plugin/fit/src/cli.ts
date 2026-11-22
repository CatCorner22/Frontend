// The command line of the Fit check:  node plugin/fit/src/cli.ts <build.html> <folder of the Vision's files> <result folder>
// Status 0: no deviation in the measures that count. Status 1: at least one deviation, or something that could not be measured in them.
// Status 2: the program refused, and it wrote no receipt.
import { closeSync, constants, lstatSync, mkdirSync, openSync, readFileSync, rmSync, statSync, writeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FitError, bounded, fit } from './fit.ts';
import { READ_FILES } from './vision.ts';

const USAGE = 'Usage: node plugin/fit/src/cli.ts [--run-scripts] [--round <0 to 3>] [--judged <file>] <build.html> <folder of the Vision files> <result folder>';
const RESULT_FILES = ['receipt.json', 'RECEIPT.md'] as const;

/** The program never writes through a symbolic link: a result folder from another place could point a link at a file that it must not replace. */
function refuseLinks(folder: string): void {
  let folderIsLink = false;
  try {
    folderIsLink = lstatSync(folder).isSymbolicLink();
  } catch {
    // The folder does not exist yet.
  }
  if (folderIsLink) throw new FitError('The result folder is a link. The program does not write through a link, and it wrote nothing.');
  for (const name of RESULT_FILES) {
    let link = false;
    try {
      link = lstatSync(join(folder, name)).isSymbolicLink();
    } catch {
      // The file does not exist yet.
    }
    if (link) throw new FitError(`The result folder holds a link named ${name}. The program does not write through a link, and it wrote nothing.`);
  }
}

/** Writes a file and refuses a link at its place: a link that appears after the check is refused by the system itself (O_NOFOLLOW). */
function writeNoFollow(path: string, text: string): void {
  const fd = openSync(path, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o644);
  try {
    writeSync(fd, text);
  } finally {
    closeSync(fd);
  }
}

/** The largest file that the program reads: a page or a Vision file is far smaller. */
const FILE_MAX = 20_000_000;

/**
 * The Vision files that the receipt of the round before names, or nothing when no such receipt stands in the result folder or it
 * holds no such list. The receipt is read as data: only names and hashes of the expected form are taken.
 */
function lastVision(path: string): { name: string; sha256: string }[] | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readText(path, 'the receipt of the round before'));
  } catch {
    return undefined;
  }
  const listed = (parsed as { vision?: { files?: unknown } } | null)?.vision?.files;
  if (!Array.isArray(listed)) return undefined;
  const files: { name: string; sha256: string }[] = [];
  for (const entry of listed as { name?: unknown; sha256?: unknown }[]) {
    if (typeof entry?.name === 'string' && (READ_FILES as readonly string[]).includes(entry.name) && typeof entry.sha256 === 'string' && /^[0-9a-f]{64}$/.test(entry.sha256)) files.push({ name: entry.name, sha256: entry.sha256 });
  }
  return files;
}

function readText(path: string, what: string): string {
  // Only an ordinary file is read: a pipe or a device would make the program wait for ever (gate review, finding G-S09).
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

async function main(args: string[]): Promise<number> {
  const rest: string[] = [];
  let runScripts = false;
  let repairRound = 0;
  let roundGiven = false;
  let judgedPath: string | undefined;
  for (let at = 0; at < args.length; at++) {
    const arg = args[at] ?? '';
    if (arg === '--run-scripts') runScripts = true;
    else if (arg === '--round') {
      if (roundGiven) throw new FitError(USAGE);
      roundGiven = true;
      const value = args[++at] ?? '';
      if (!/^\d{1,3}$/.test(value)) throw new FitError(USAGE);
      repairRound = Number(value);
    } else if (arg === '--judged') {
      judgedPath = args[++at];
      if (!judgedPath) throw new FitError(USAGE);
    } else rest.push(arg);
  }
  const [buildPath, folder, outFolder] = rest;
  if (rest.length !== 3 || !buildPath || !folder || !outFolder) throw new FitError(USAGE);
  // What the model judged: one judgment on each line of a text file. The file is data; the receipt shows its lines apart.
  const judged = judgedPath === undefined ? [] : readText(resolve(judgedPath), 'the file of judgments').split(/\r?\n/);
  refuseLinks(resolve(outFolder));
  // A fourth repair round is refused before anything is touched, so that the last receipt, which holds the round, stays (finding G-S10).
  if (repairRound > 3) throw new FitError('The repair budget of 3 rounds is spent. The program did not check again; a person decides now.');
  // An earlier receipt in the result folder would look current after a refusal; it goes first (retest finding A2-R2).
  // The receipt of the round before names the Vision files that it read; this round says which of them changed (criterion C8).
  const lastRoundVision = repairRound > 0 ? lastVision(join(resolve(outFolder), 'receipt.json')) : undefined;
  for (const name of RESULT_FILES) rmSync(join(resolve(outFolder), name), { force: true });
  const html = readText(resolve(buildPath), 'the build');
  const files: Record<string, string> = {};
  for (const name of READ_FILES) {
    try {
      files[name] = readText(join(resolve(folder), name), `the file "${name}" of the Vision`);
    } catch (error) {
      // A missing file is named by the check inside `fit`; a file that is there and cannot be read is refused here.
      let there = true;
      try {
        lstatSync(join(resolve(folder), name));
      } catch {
        there = false;
      }
      if (there) throw error;
    }
  }
  // A machine whose installed browser differs from the one that Playwright expects names its browser here.
  const launch = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
  const { receipt, markdown, status } = await fit({ files, html, launch, runScripts, repairRound, judged, ...(lastRoundVision ? { lastRoundVision } : {}) });
  mkdirSync(resolve(outFolder), { recursive: true });
  refuseLinks(resolve(outFolder));
  writeNoFollow(join(resolve(outFolder), 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  writeNoFollow(join(resolve(outFolder), 'RECEIPT.md'), markdown);
  // Contrast counts as a deviation only when the Vision writes Floor A1; the measure's title says which (SPEC.md section 2.22).
  // One plain line: how many deviations count, how many things could not be measured, and where the receipt is.
  const binding = receipt.measured.filter((m) => m.id !== 'contrast' || m.title.startsWith('Contrast: required'));
  const deviations = binding.reduce((sum, m) => sum + m.deviations, 0);
  const unmeasured = receipt.measured.filter((m) => m.id !== 'contrast').reduce((sum, m) => sum + m.notMeasured, 0);
  const unread = receipt.measured.find((m) => m.id === 'contrast')?.notMeasured ?? 0;
  const some = (n: number, one: string, many: string): string => `${String(n)} ${n === 1 ? one : many}`;
  const parts = [deviations === 0 ? 'No deviation' : some(deviations, 'deviation', 'deviations')];
  if (unmeasured > 0) parts.push(`${some(unmeasured, 'thing', 'things')} could not be measured`);
  // The count of texts, not of readings: each text is read up to nine times, and "27 readings" read as 27 texts (finding R-U04).
  const contrast = receipt.measured.find((m) => m.id === 'contrast');
  const unreadTexts = (contrast?.information.length ?? 0) + (contrast?.informationMore ?? 0);
  if (unread > 0) parts.push(`the contrast of ${some(unreadTexts, 'text', 'texts')} could not be read (this does not change the status)`);
  // Texts below the usual contrast where the Vision does not require it: said, and not counted (finding R-U02).
  if (contrast && !contrast.title.startsWith('Contrast: required') && contrast.deviations > 0) parts.push(`${some(contrast.deviations, 'text reading', 'text readings')} below the usual contrast (information: this Vision does not require it)`);
  process.stdout.write(`${parts.join('; ')}. Status ${String(status)}. Receipt: ${join(resolve(outFolder), 'RECEIPT.md')}\n`);
  return status;
}

main(process.argv.slice(2)).then(
  (status) => process.exit(status),
  (error: unknown) => {
    // One line, made visible and cut: a message can hold words from a file, and a model reads this line (gate review, finding G-S02).
    const message = error instanceof FitError ? error.message : `The Fit check stopped: ${error instanceof Error ? error.message : String(error)}`;
    process.stderr.write(`${bounded(message.replace(/\s+/g, ' '), 400)}\n`);
    process.exit(2);
  },
);
