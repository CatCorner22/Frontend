// The command line of the Fit check:  node plugin/fit/src/cli.ts <build.html> <folder of the Prescription's files> <result folder>
// Status 0: no deviation and nothing not measured in the measures that count (the six design measures, the Floors, and contrast where
// the Prescription holds Floor A1). Status 1: at least one, or a window that could not be measured.
// Status 2: the program refused, and it wrote no receipt.
import { closeSync, constants, lstatSync, mkdirSync, openSync, readFileSync, rmSync, writeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FitError, countedMeasures, fit } from './fit.ts';
import { READ_FILES } from './prescription.ts';

const USAGE = 'Usage: node plugin/fit/src/cli.ts [--run-scripts] <build.html> <folder of the Prescription files> <result folder>';
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
  const runScripts = args.includes('--run-scripts');
  const [buildPath, folder, outFolder] = args.filter((a) => a !== '--run-scripts');
  if (args.filter((a) => a !== '--run-scripts').length !== 3 || !buildPath || !folder || !outFolder) throw new FitError(USAGE);
  refuseLinks(resolve(outFolder));
  // An earlier receipt in the result folder would look current after a refusal; it goes first (retest finding A2-R2). A link was
  // refused just above, so this removes only the program's own earlier files.
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
  const { receipt, markdown, status } = await fit({ files, html, launch, runScripts });
  mkdirSync(resolve(outFolder), { recursive: true });
  refuseLinks(resolve(outFolder));
  writeNoFollow(join(resolve(outFolder), 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  writeNoFollow(join(resolve(outFolder), 'RECEIPT.md'), markdown);
  // The same measures that decide the status (reviewer finding RV-01): status 1 never reads as "0 deviations" and nothing else.
  const counted = countedMeasures(receipt);
  const deviations = counted.reduce((sum, m) => sum + m.deviations, 0);
  // "Not measured" is never "no deviation": the line names it whenever the receipt holds it.
  const unmeasured = counted.reduce((sum, m) => sum + m.notMeasured, 0);
  const notMeasured = unmeasured > 0 ? `, ${String(unmeasured)} things not measured` : '';
  process.stdout.write(`${status === 0 ? 'No deviation' : `${String(deviations)} deviations${notMeasured}, ${String(receipt.loadFailures.length)} windows not measured`}. Receipt: ${join(resolve(outFolder), 'RECEIPT.md')}\n`);
  return status;
}

main(process.argv.slice(2)).then(
  (status) => process.exit(status),
  (error: unknown) => {
    process.stderr.write(`${error instanceof FitError ? error.message : `The Fit check stopped: ${error instanceof Error ? error.message : String(error)}`}\n`);
    process.exit(2);
  },
);
