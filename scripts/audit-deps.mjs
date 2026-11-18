// The dependency audit of the check (decision D79). It asks npm's public database whether an installed package has a known
// security fault ("advisory") of severity high or critical, as `npm audit --audit-level=high` did, with one difference:
// an advisory in the list below does not fail the check while no repaired version of its package exists.
//
// Why the list exists. On 2026-11-17 an advisory was published against every version of `picomatch` (a helper that matches file
// names; it comes in only through the build tools vite, vitest, and dependency-cruiser, and never ships in the Studio). The newest
// version, 4.0.7, is affected too, so no upgrade removes the finding, and the check stayed red on every commit.
//
// What keeps the exception honest:
// - It names one advisory of one package at one newest version. Any other high or critical advisory fails the check as before.
// - It ends by itself. When the registry holds a newer version of the package than the one named here, the check fails and says
//   to upgrade and to remove the entry.
// - The check prints the exception on every run, so it is never silent.
//
//   node scripts/audit-deps.mjs              the audit
//   node scripts/audit-deps.mjs --self-test  tests the rule on fixed inputs, without the network
import { spawnSync } from 'node:child_process';

/** Advisories that no upgrade can remove today. `newest` is the newest version of the package when the entry was written. */
export const EXCEPTIONS = [
  { id: 'GHSA-fc5q-39xc-vjpf', package: 'picomatch', newest: '4.0.7', added: '2026-11-18', why: 'every version up to the newest is affected; build tools only, nothing that ships' },
];

const SERIOUS = new Set(['high', 'critical']);
const idOf = (url) => /GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}/.exec(String(url ?? ''))?.[0] ?? String(url ?? '');

/**
 * The rule, apart from the network. `report` is the JSON of `npm audit --json`; `latest` maps a package name to the newest
 * version in the registry. Returns the lines to print and whether the check passes.
 */
export function decide(report, latest, exceptions = EXCEPTIONS) {
  const serious = new Map();
  for (const [name, entry] of Object.entries(report?.vulnerabilities ?? {})) {
    for (const via of entry?.via ?? []) {
      // A string names another package that passes its fault on; only an object is an advisory of this package.
      if (typeof via !== 'object' || via === null || !SERIOUS.has(via.severity)) continue;
      serious.set(`${name} ${idOf(via.url)}`, { package: name, id: idOf(via.url), severity: via.severity, title: String(via.title ?? ''), range: String(via.range ?? '') });
    }
  }
  const lines = [];
  let pass = true;
  for (const found of serious.values()) {
    const exception = exceptions.find((e) => e.id === found.id && e.package === found.package);
    if (!exception) {
      pass = false;
      lines.push(`FAIL  ${found.package}: ${found.severity}: ${found.title} (${found.id}; versions ${found.range})`);
      continue;
    }
    const newest = latest[found.package];
    if (newest === undefined) {
      pass = false;
      lines.push(`FAIL  ${found.package}: the registry did not say which version is the newest, so the exception for ${found.id} cannot be confirmed.`);
    } else if (newest !== exception.newest) {
      pass = false;
      lines.push(`FAIL  ${found.package}: version ${newest} now exists (the exception for ${found.id} was written for ${exception.newest}). Upgrade, run the audit again, and remove the entry from scripts/audit-deps.mjs.`);
    } else {
      lines.push(`EXCEPTION  ${found.package} ${found.id} (${found.severity}): ${exception.why}. No newer version than ${exception.newest} exists. Entry of ${exception.added}, decision D79.`);
    }
  }
  for (const exception of exceptions) {
    if (![...serious.values()].some((f) => f.id === exception.id && f.package === exception.package)) lines.push(`NOTE  the exception for ${exception.package} ${exception.id} matched nothing: remove its entry from scripts/audit-deps.mjs.`);
  }
  if (pass) lines.push(`Dependency audit: no high or critical advisory outside the ${String(exceptions.length)} listed exception(s).`);
  return { pass, lines };
}

function selfTest() {
  const advisory = (id, severity = 'high') => ({ severity, title: 'a fault', range: '<=1.0.0', url: `https://github.com/advisories/${id}` });
  const report = (entries) => ({ vulnerabilities: entries });
  const pico = { picomatch: { via: [advisory('GHSA-fc5q-39xc-vjpf')] }, vite: { via: ['picomatch'] } };
  const cases = [
    ['the listed advisory at the listed newest version passes', decide(report(pico), { picomatch: '4.0.7' }).pass, true],
    ['a newer version of the package ends the exception', decide(report(pico), { picomatch: '4.0.8' }).pass, false],
    ['an unknown newest version fails', decide(report(pico), {}).pass, false],
    ['another high advisory fails', decide(report({ ...pico, other: { via: [advisory('GHSA-aaaa-bbbb-cccc')] } }), { picomatch: '4.0.7' }).pass, false],
    ['another advisory of the same package fails', decide(report({ picomatch: { via: [advisory('GHSA-fc5q-39xc-vjpf'), advisory('GHSA-aaaa-bbbb-cccc', 'critical')] } }), { picomatch: '4.0.7' }).pass, false],
    ['a moderate advisory does not fail, as before', decide(report({ other: { via: [advisory('GHSA-aaaa-bbbb-cccc', 'moderate')] } }), {}).pass, true],
    ['no advisory passes', decide(report({}), {}).pass, true],
  ];
  let ok = true;
  for (const [name, got, want] of cases) {
    if (got !== want) ok = false;
    console.log(`${got === want ? 'ok  ' : 'FAIL'}  ${name}`);
  }
  return ok;
}

function npm(args) {
  const run = spawnSync('npm', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (run.error) throw run.error;
  return run.stdout;
}

if (process.argv.includes('--self-test')) {
  process.exit(selfTest() ? 0 : 1);
} else {
  let report;
  try {
    // npm ends with a status other than 0 when it finds anything; the JSON on its output is what counts here.
    report = JSON.parse(npm(['audit', '--json']));
  } catch {
    console.error('Dependency audit: npm gave no report that can be read, so nothing was checked. This fails the check.');
    process.exit(1);
  }
  if (report.error || typeof report.vulnerabilities !== 'object' || report.vulnerabilities === null) {
    console.error('Dependency audit: npm reported an error in place of a report, so nothing was checked. This fails the check.');
    process.exit(1);
  }
  const latest = {};
  for (const exception of EXCEPTIONS) {
    try {
      const version = npm(['view', exception.package, 'dist-tags.latest']).trim();
      if (/^\d+\.\d+\.\d+/.test(version)) latest[exception.package] = version;
    } catch {
      // Left out: the rule fails an exception whose newest version is unknown.
    }
  }
  const { pass, lines } = decide(report, latest);
  for (const line of lines) console.log(line);
  process.exit(pass ? 0 : 1);
}
