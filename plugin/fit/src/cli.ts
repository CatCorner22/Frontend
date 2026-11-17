// The command line of the Fit check:  node plugin/fit/src/cli.ts <build.html> <folder of the Vision's files> <result folder>
// Status 0: no deviation in the six measured things. Status 1: at least one deviation, or a window that could not be measured.
// Status 2: the program refused, and it wrote no receipt.
import { closeSync, constants, lstatSync, mkdirSync, openSync, readFileSync, rmSync, writeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FitError, fit } from './fit.ts';
import { READ_FILES } from './vision.ts';

const USAGE = 'Usage: node plugin/fit/src/cli.ts [--no-scripts] [--round <0 to 3>] [--judged <file>] <build.html> <folder of the Vision files> <result folder>';
const RESULT_FILES = ['receipt.json', 'RECEIPT.md'] as const;

/** The program never writes through a symbolic link: a result folder from another place could point a link at a file that it must not replace. */
function refuseLinks(folder: string): void {
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

function readText(path: string, what: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    throw new FitError(`Cannot read ${what}: ${path}`);
  }
}

async function main(args: string[]): Promise<number> {
  const rest: string[] = [];
  let runScripts = true;
  let repairRound = 0;
  let judgedPath: string | undefined;
  for (let at = 0; at < args.length; at++) {
    const arg = args[at] ?? '';
    if (arg === '--no-scripts') runScripts = false;
    else if (arg === '--round') {
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
  // An earlier receipt in the result folder would look current after a refusal; it goes first (retest finding A2-R2).
  for (const name of RESULT_FILES) rmSync(join(resolve(outFolder), name), { force: true });
  const html = readText(resolve(buildPath), 'the build');
  const files: Record<string, string> = {};
  for (const name of READ_FILES) {
    try {
      files[name] = readFileSync(join(resolve(folder), name), 'utf8');
    } catch {
      // A missing file is named by the check inside `fit`.
    }
  }
  // A machine whose installed browser differs from the one that Playwright expects names its browser here.
  const launch = process.env['PW_CHROMIUM'] ? { executablePath: process.env['PW_CHROMIUM'] } : {};
  const { receipt, markdown, status } = await fit({ files, html, launch, runScripts, repairRound, judged });
  mkdirSync(resolve(outFolder), { recursive: true });
  refuseLinks(resolve(outFolder));
  writeNoFollow(join(resolve(outFolder), 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  writeNoFollow(join(resolve(outFolder), 'RECEIPT.md'), markdown);
  // Contrast counts as a deviation only when the Vision writes Floor A1; the measure's title says which (SPEC.md section 2.22).
  const six = receipt.measured.filter((m) => m.id !== 'contrast' || m.title.startsWith('Contrast: required'));
  const deviations = six.reduce((sum, m) => sum + m.deviations, 0);
  // "Not measured" is never "no deviation": the line names it whenever the receipt holds it.
  const unmeasured = six.reduce((sum, m) => sum + m.notMeasured, 0);
  process.stdout.write(`${status === 0 ? `No deviation${unmeasured > 0 ? `, but ${String(unmeasured)} things not measured` : ''}` : `${String(deviations)} deviations, ${String(receipt.loadFailures.length)} windows not measured`}. Receipt: ${join(resolve(outFolder), 'RECEIPT.md')}\n`);
  return status;
}

main(process.argv.slice(2)).then(
  (status) => process.exit(status),
  (error: unknown) => {
    process.stderr.write(`${error instanceof FitError ? error.message : `The Fit check stopped: ${error instanceof Error ? error.message : String(error)}`}\n`);
    process.exit(2);
  },
);
