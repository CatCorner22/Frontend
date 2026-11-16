// The command line of the Fit check:  node plugin/fit/src/cli.ts <build.html> <folder of the Prescription's files> <result folder>
// Status 0: no deviation in the six measured things. Status 1: at least one deviation, or a window that could not be measured.
// Status 2: the program refused, and it wrote no receipt.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FitError, fit } from './fit.ts';
import { READ_FILES } from './prescription.ts';

const USAGE = 'Usage: node plugin/fit/src/cli.ts <build.html> <folder of the Prescription files> <result folder>';

function readText(path: string, what: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    throw new FitError(`Cannot read ${what}: ${path}`);
  }
}

async function main(args: string[]): Promise<number> {
  const [buildPath, folder, outFolder] = args;
  if (args.length !== 3 || !buildPath || !folder || !outFolder) throw new FitError(USAGE);
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
  const { receipt, markdown, status } = await fit({ files, html, launch });
  mkdirSync(resolve(outFolder), { recursive: true });
  writeFileSync(join(resolve(outFolder), 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  writeFileSync(join(resolve(outFolder), 'RECEIPT.md'), markdown);
  const deviations = receipt.measured.filter((m) => m.id !== 'contrast').reduce((sum, m) => sum + m.deviations, 0);
  process.stdout.write(`${status === 0 ? 'No deviation' : `${String(deviations)} deviations, ${String(receipt.loadFailures.length)} windows not measured`}. Receipt: ${join(resolve(outFolder), 'RECEIPT.md')}\n`);
  return status;
}

main(process.argv.slice(2)).then(
  (status) => process.exit(status),
  (error: unknown) => {
    process.stderr.write(`${error instanceof FitError ? error.message : `The Fit check stopped: ${error instanceof Error ? error.message : String(error)}`}\n`);
    process.exit(2);
  },
);
