// Self-test of the M0 measurement harness (phase0/eval/measure.cjs).
//
// What it is. A script that breaks each build on purpose, in ten ways, runs the harness on every
// broken copy, and confirms that the harness reports the break. It also runs the two unchanged
// builds and confirms that they pass.
// Why it exists. A check that cannot fail proves nothing. Version 1 of the harness reported a wrong
// result and nothing noticed. This test shows that each check of version 2 can fail, and that the
// guard cancels a press when the page changes under the pointer.
// What can go wrong. Each break is a small text edit of a build. If a build changes, an edit may no
// longer apply; the self-test then stops and names the edit. The broken copies are written to a
// temporary folder. The builds in phase0/builds/ are read and never changed.
//
// Run from the repository root (about 8 minutes):
//   node phase0/eval/selftest.cjs            (every case)
//   node phase0/eval/selftest.cjs second     (only the cases whose name contains "second")

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const PHASE0 = path.resolve(__dirname, '..');
const BUILDS = {
  a: fs.readFileSync(path.join(PHASE0, 'builds', 'a', 'index.html'), 'utf8'),
  b: fs.readFileSync(path.join(PHASE0, 'builds', 'b', 'index.html'), 'utf8'),
};

// Shorthand for the expectations below.
const both = (o, value) => o['server-error'] === value && o.offline === value;
const delivered = (flow) => flow.pressesReceived.filter((p) => p.verdict === 'delivered');
const unbroken = (m) => [
  ['the success flow reaches the confirmation', m.flows.success.end.reachedSuccess === true],
  ['answers are kept after both failures', both(m.checks.answersKeptAfterFailure, true)],
  ['a retry reaches the confirmation with the same answers', both(m.checks.retryAfterFailure, true)],
  ['a slow send, pressed twice, completes once', m.checks.slowCompletesOnce.pass === true],
  ['the guard cancelled no press', Object.values(m.flows).every((f) => f.pressesCancelledByTheGuard === 0)],
  ['the harness self-check passes', m.checks.harnessSelfCheck.ok === true],
];

// Each case: the build it starts from, the text edits that break it, and what the harness must then report.
const CASES = [
  { name: 'a-unchanged', build: 'a', what: 'Build A as it is.', edits: [], expect: unbroken },
  { name: 'b-unchanged', build: 'b', what: 'Build B as it is.', edits: [], expect: unbroken },
  {
    name: 'a-accepts-second-press', build: 'a',
    what: 'A accepts a second press while sending. Two requests run; the second finishes about 1 s after the first.',
    edits: [["    if (sending) return;\n    if (firstIncomplete() !== 'review') return route();", "    if (firstIncomplete() !== 'review' && !sending) return route();"]],
    expect: (m) => [
      ['the page changes again after the confirmation', m.checks.slowCompletesOnce.pageChangedAfterConfirmation === true],
      ['"completes once" fails', m.checks.slowCompletesOnce.pass === false],
    ],
  },
  {
    name: 'b-accepts-second-press', build: 'b',
    what: 'B accepts a second press while sending. The second press replaces the first request and starts the wait again.',
    edits: [["      if (state.sending) { return; }   /* ignore repeat presses; the button stays enabled and keeps its label */\n", '']],
    expect: (m) => [
      ['the second press restarts the wait', m.checks.slowCompletesOnce.secondPressRestartedTheWait === true],
      ['"completes once" fails', m.checks.slowCompletesOnce.pass === false],
    ],
  },
  {
    name: 'a-send-button-really-disabled', build: 'a',
    what: 'A switches its send button off with the real "disabled" property, so a visitor cannot press it twice.',
    edits: [
      ["    sendBtn.setAttribute('aria-disabled', 'true'); sendBtn.textContent = 'Sending…';", "    sendBtn.disabled = true; sendBtn.textContent = 'Sending…';"],
      ["    sending = false;\n    sendBtn.removeAttribute('aria-disabled'); sendBtn.textContent = 'Try again';", "    sending = false;\n    sendBtn.disabled = false; sendBtn.textContent = 'Try again';"],
      ["    sendBtn.removeAttribute('aria-disabled'); setStatus('');\n    go('/prepare/done');", "    sendBtn.disabled = false; setStatus('');\n    go('/prepare/done');"],
    ],
    expect: (m) => [
      ['the second press is reported as not possible', m.checks.slowCompletesOnce.secondPress === 'not possible: the control was disabled'],
      ['"completes once" passes', m.checks.slowCompletesOnce.pass === true],
    ],
  },
  {
    name: 'b-confirmation-does-not-last', build: 'b',
    what: 'B shows the confirmation, then throws it away 2 s later and returns to the start.',
    edits: [["          state.sent = true; state.failed = false; store('sent', 'yes');\n          go('done');\n          return;", "          state.sent = true; state.failed = false; store('sent', 'yes');\n          go('done');\n          window.setTimeout(function () { resetAll(); go('home'); }, 2000);\n          return;"]],
    expect: (m) => [
      ['the watch sees that the confirmation did not last', m.flows['slow-pressed-twice'].afterConfirmation.stillTheConfirmation === false],
      ['"completes once" fails', m.checks.slowCompletesOnce.pass === false],
    ],
  },
  {
    name: 'b-success-never-arrives', build: 'b',
    what: 'B never finishes a successful send.',
    edits: [["          state.sent = true; state.failed = false; store('sent', 'yes');\n          go('done');\n          return;", "          state.sending = true;\n          return;"]],
    expect: (m) => [
      ['the success flow does not reach the confirmation', m.flows.success.end.reachedSuccess === false],
      ['the walker stops because the page gave no answer', m.flows.success.end.stoppedBecause.startsWith('no answer within')],
      ['"completes once" is reported as not checked', m.checks.slowCompletesOnce.pass === null],
    ],
  },
  {
    name: 'b-failure-clears-answers', build: 'b',
    what: 'B forgets the answers when a send fails and redraws the screen without them.',
    edits: [["        box = failureBox();\n        stepEl.insertBefore(box, stepEl.firstChild);\n        box.focus();\n      }, wait);", "        state.name = ''; state.phone = ''; state.topic = ''; store('topic', '');\n        render('request', false);\n      }, wait);"]],
    expect: (m) => [
      ['"answers kept" fails in both failure flows', both(m.checks.answersKeptAfterFailure, false)],
      ['the retry check fails in both failure flows', both(m.checks.retryAfterFailure, false)],
    ],
  },
  {
    name: 'b-failure-forgets-answers-silently', build: 'b',
    what: 'B forgets the answers when a send fails, but the screen still shows the old text because nothing redraws.',
    edits: [["        state.failed = true;\n        status.textContent = '';", "        state.failed = true; state.name = ''; state.phone = ''; state.topic = ''; store('topic', '');\n        status.textContent = '';"]],
    expect: (m) => [
      ['the answers still show on the failure screen', both(m.checks.answersKeptAfterFailure, true)],
      ['the retry check catches the loss', both(m.checks.retryAfterFailure, false)],
    ],
  },
  {
    name: 'a-failure-clears-answers', build: 'a',
    what: 'A forgets the answers when a send fails and redraws the summary without them.',
    edits: [['    failBox.hidden = false; failBox.focus();', "    state = blank(); save(); fillForms(); renderSummary($('#summary-review'), true);\n    failBox.hidden = false; failBox.focus();"]],
    expect: (m) => [
      ['"answers kept" fails in both failure flows', both(m.checks.answersKeptAfterFailure, false)],
      ['the retry check fails in both failure flows', both(m.checks.retryAfterFailure, false)],
    ],
  },
  {
    name: 'b-control-changes-under-the-pointer', build: 'b',
    what: "Guard test. The moment the pointer arrives, B's send control turns into a control that starts a new flow.",
    edits: [["    return {\n      title: 'Request an intake',", "    sendButton.addEventListener('pointermove', function () {\n      sendButton.textContent = 'Start over';\n      sendButton.addEventListener('click', function (ev) { ev.stopImmediatePropagation(); resetAll(); go('home'); }, true);\n    }, { once: true });\n    return {\n      title: 'Request an intake',"]],
    expect: (m) => [
      ['the guard cancels one press in the success flow', m.flows.success.pressesCancelledByTheGuard === 1],
      ['no press reaches "Start over"', delivered(m.flows.success).every((p) => p.label !== 'Start over')],
      ['the walker does not start a second pass', m.flows.success.end.steps === 6],
      ['the harness self-check passes', m.checks.harnessSelfCheck.ok === true],
    ],
  },
  {
    name: 'b-screen-changes-under-the-pointer', build: 'b',
    what: 'Guard test. The moment the pointer arrives, B jumps to the confirmation by itself.',
    edits: [["    return {\n      title: 'Request an intake',", "    sendButton.addEventListener('pointermove', function () { state.sent = true; store('sent', 'yes'); render('done', true); }, { once: true });\n    return {\n      title: 'Request an intake',"]],
    expect: (m) => [
      ['the guard cancels one press in the success flow', m.flows.success.pressesCancelledByTheGuard === 1],
      ['no press arrives on the confirmation screen', delivered(m.flows.success).every((p) => p.state !== 'confirmation')],
      ['the harness self-check passes', m.checks.harnessSelfCheck.ok === true],
    ],
  },
];

const filter = process.argv[2] || '';
const cases = CASES.filter((c) => c.name.includes(filter));
if (cases.length === 0) {
  console.error('No case has "' + filter + '" in its name. Cases: ' + CASES.map((c) => c.name).join(', '));
  process.exit(2);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'm0-selftest-'));
console.log(`Self-test of the harness: ${cases.length} cases. Broken copies and results go to ${tmp}`);
let failures = 0;
for (const c of cases) {
  let html = BUILDS[c.build];
  for (const [from, to] of c.edits) {
    if (html.split(from).length !== 2) {
      console.error(`STOPPED at "${c.name}": this text must occur exactly once in build ${c.build}, and it does not:\n${from}`);
      process.exit(2);
    }
    html = html.replace(from, () => to);
  }
  const dir = path.join(tmp, c.name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`\n${c.name}: ${c.what}`);
  const run = spawnSync(process.execPath, [path.join(__dirname, 'measure.cjs'), c.name, path.join(dir, 'index.html'), path.join(dir, 'out')], { encoding: 'utf8' });
  const metricsPath = path.join(dir, 'out', 'metrics.json');
  if (!fs.existsSync(metricsPath)) {
    console.log('  FAIL  the harness wrote no metrics.json\n' + (run.stderr || '').slice(0, 600));
    failures++;
    continue;
  }
  const m = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  for (const [claim, ok] of c.expect(m)) {
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${claim}`);
    if (!ok) failures++;
  }
}
console.log(failures === 0 ? '\nSelf-test passed: the unchanged builds pass, and the harness reports every break.' : `\nSelf-test FAILED: ${failures} expectation(s) not met.`);
process.exit(failures === 0 ? 0 : 1);
