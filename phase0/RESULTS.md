# M0 proof experiment: results

First run: 2026-11-13, about 12:21 UTC. Corrected with a re-run: 2026-11-13, 15:17 UTC.

**Why this file changed.** The drift and truth auditor (one of the three red-team reviewers) compared the first version of this file with its own data and found three faults: a measured "yes" that the data recorded as "no" (finding T-01), rows listed as measured that no machine had checked (T-02), and a missing scorecard (M-03). The cause of the first fault was a defect in the measuring script. That script is now repaired, both builds were measured again, and the tables below are printed from the new data by the script itself. "What the re-run changed" lists every difference from the first version.

## Method

- Product: the fictional ClearPath Legal Clinic intake flow.
- Two fresh builder agents, same model, same product facts (`prompts/shared-product-facts.md`), one self-contained `index.html` each. Neither could see the other's instructions.
- Build A received the vague prompt (`prompts/build-a-vague.md`). Build B received the hand-assembled Prescription (`prescription/PRESCRIPTION.md`). Build B had no visual reference Mockup, so this test understates what the finished tool supplies.
- One **harness** measured both. The harness is the measuring script, `eval/measure.cjs`. It opens a build in a real browser (Chromium, with no window), measures the home screen, and then walks the intake flow as a visitor would: on each screen it fills in the answers and presses the control that leads on. The part that presses is the **walker**. One real pointer press on a control is a **press**.
- The builds send nothing over a network. Each has a "Prototype controls" menu, which the product facts require, where the harness chooses what a send does: success, server error, offline, or slow. A **flow** is one walk from the home screen to the end with one of these outcomes.
- Blind labels on the contact sheet: **X = Build B (Prescription)**, **Y = Build A (vague)**.

### Harness defects

The first run had three harness defects. None was a fault of a build.

1. **The form filler typed sample text into optional date boxes.** The first session found this and fixed it before its final pass.
2. **The walker failed when a build switched its send button off while sending.** The first session found this too. Its remedy was to wait up to 2.5 seconds for the button and then press it.
3. **The walker acted on an old view of the page.** It checked for the end of the flow at one moment and chose and pressed a control about a fifth of a second later, without looking again. Nobody noticed this defect until the audit. It did two things:
   - *Build B.* The simulated send finished inside that gap, so the walker chose its next control on the confirmation screen. It pressed "Prepare for a different issue", which clears the answers and starts a new flow, and it walked the flow a second time. The final check then ran on the wrong screen and recorded "confirmation not reached". The first version of this file said "yes" all the same.
   - *Build A.* In the two failure flows, the remedy for defect 2 turned against the walker. While it waited for the "Sending…" button, the button became "Try again", and the walker pressed that. It did so eight times in each failure flow. Its log recorded those presses as "Sending…".

Version 2 of the harness removes the cause, and it does not rely on longer waits:

- **Look and press on the same screen.** Each press is tied to the screen that the walker has just examined. A guard inside the page looks again at the instant the press arrives and cancels the press if the screen or the control has changed.
- **Wait for the page's answer.** After a press, the walker waits until the page shows a new screen, the confirmation, or the failure message. It no longer waits for a fixed time.
- **Stop at the end.** On the confirmation or on the failure message, the walker presses nothing more.
- **Self-check.** The page keeps its own record of every press it receives. The harness compares that record with its log and refuses the results if they differ.

A second script, `eval/selftest.cjs`, tests the harness itself. It breaks each build on purpose in ten ways (for example: the build forgets the answers after a failure, or accepts a second press while sending), runs the harness on every broken copy, and confirms that the harness reports each break. It also confirms that the two unchanged builds pass. The self-test passed on 2026-11-13 with the harness that produced the numbers below.

### Where each file in `results/` comes from

| Files | Run |
|---|---|
| `a/metrics.json`, `b/metrics.json`, `a/flow-success-end.png`, `b/flow-success-end.png` | The re-run: 2026-11-13, 15:17 and 15:18 UTC, harness version 2 |
| Every other image: the home screens, the step screenshots (`flow-…-stepNN.png`), the error and failure screenshots, and `contact-sheet-blind.png` | The first run: 2026-11-13, about 12:21 UTC, harness version 1 |

Two cautions about the first run's images:

- Because of defect 3, some step screenshots show states that a visitor would not reach in one walk. In `b/`, `flow-success-step07.png` and `step08.png` show the request screen while sending, and `step09.png` to `step13.png` show the unintended second walk. In `a/`, `flow-server-error-step06.png` to `step13.png` show the review screen while the unintended retries were sending. The numbers in those file names are the first run's loop counter; they do not match the press counts below.
- `b/flow-success-end.png` showed the review screen in the first run. It now shows Build B's confirmation. The re-run's image of Build A's confirmation is identical, byte for byte, to the first run's, so that file did not change.

## How to repeat

Run these commands from the repository root. The first installs the pinned packages; the harness takes Playwright 1.63.0 and axe-core 4.14.0 from the root `package.json`, not from `phase0/package.json`. The Chromium browser that matches Playwright 1.63.0 must already be on the machine (decision D28).

```
npm ci --ignore-scripts
node phase0/eval/measure.cjs a phase0/builds/a/index.html /tmp/m0-rerun/a
node phase0/eval/measure.cjs b phase0/builds/b/index.html /tmp/m0-rerun/b
node phase0/eval/measure.cjs --table /tmp/m0-rerun/a/metrics.json /tmp/m0-rerun/b/metrics.json
node phase0/eval/selftest.cjs
```

- Lines 2 and 3 measure one build each (under a minute each) and write `metrics.json` and about 20 screenshots into the folder named last. Name a folder outside the repository, as here, so that the committed screenshots stay as they are. For this file, the builder ran the same two commands with a scratch folder, then copied only `metrics.json` and `flow-success-end.png` for each build into `results/`.
- Line 4 prints the tables of the next section. Paste them; do not edit them by hand.
- Line 5 runs the self-test (about 8 minutes). It writes only to a temporary folder.
- A run that fails its self-check ends with the words "HARNESS SELF-CHECK FAILED". Do not use its results.

## Measured (machine checks; identical rules for both)

The harness printed these tables from the two `metrics.json` files (Build A measured 2026-11-13 15:17 UTC; Build B measured 2026-11-13 15:18 UTC).

**The flow** (walked at 375 px wide)

| Check | A (vague) | B (Prescription) |
|---|---|---|
| Success flow: the walk ends on the confirmation screen | yes (6 presses) | yes (7 presses) |
| Server-error flow: the failure message shows, with the clinic's phone number and address on the same screen | yes | yes |
| Offline flow: the same | yes | yes |
| After each failure, the help topic, first name, and phone number that the harness entered are still on the screen | yes | yes |
| After each failure, one press of the build's own retry control reaches the confirmation, which shows the same three answers | yes | yes |
| Slow flow: the walk ends on the confirmation screen | yes (3.0 s after the send press) | yes (3.0 s after the send press) |
| Slow flow, send control pressed a second time 1 s into the wait: one confirmation, no restart of the wait, no later change | yes (confirmation after 3.0 s; second press reached the page; page unchanged in the next 4 s) | yes (confirmation after 3.0 s; second press reached the page; page unchanged in the next 4 s) |
| Reload on the topic screen keeps the chosen topic | yes | yes |
| Forward pressed with no topic chosen | stays on the screen; adds error text; `role="alert"`: no; `aria-invalid`: 0 | stays on the screen; adds error text; `role="alert"`: yes; `aria-invalid`: 1 |

**Checks that relate to accessibility**

| Check | A (vague) | B (Prescription) |
|---|---|---|
| axe violations, home screen at 1280 px | 1: `label-content-name-mismatch` (serious, 1 element) | 0 |
| axe violations, home screen at 768 px | 0 | 0 |
| axe violations, home screen at 375 px | 0 | 0 |
| axe violations on the screens of the success flow (375 px) | "Check your preparation summary": 1: `definition-list` (serious, 1 element); 0 on the other 6 screens | 0 on 8 screens |
| axe violations on the failure screen (server-error flow, 375 px) | "Check your preparation summary": 1: `definition-list` (serious, 1 element) | 0 |
| Tab stops on the home screen with no visible focus indicator (1280 px) | 0 of 12 | 0 of 9 |
| Sideways scrolling at 320 px (home screen) | none | none |
| Targets under 24 px, home screen (375 px) | 1: "Privacy" (52.6 × 19 px) | 1: "555-0142" (93.4 × 21 px) |
| Targets under 44 px, home screen (375 px) | 3: "Other ways to contact the clinic" (274.7 × 43.9 px), "555-0142" (92 × 24 px), "Privacy" (52.6 × 19 px) | 2: "Skip to main content" (32 × 44 px), "555-0142" (93.4 × 21 px) |
| Most targets under 24 px on one screen of the success flow (375 px) | 2 (on "Does your paperwork show a hearing, response, or other date?" and "Your preparation summary is ready.") | 1 (on each of the 8 screens) |
| Most targets under 44 px on one screen of the success flow (375 px) | 6 (on "Check your preparation summary") | 2 (on each of the 8 screens) |

**Style census** (home screen at 1280 px; a note shows where another width differs)

| Check | A (vague) | B (Prescription) |
|---|---|---|
| Distinct text sizes | 7 | 4 |
| Distinct background colors | 4 | 2 |
| Distinct corner radii | 3 | 1 |
| Distinct shadows | 1 (768 px: 0; 375 px: 0) | 0 |
| Font families | 1 (system-ui) | 2 (system-ui, Georgia) |
| Icons or images (`svg` and `img` elements) | 4 | 0 |

**The file**

| Check | A (vague) | B (Prescription) |
|---|---|---|
| File size | 60,077 bytes | 39,513 bytes |
| Requests to other hosts during the whole run | 0 | 0 |
| `innerHTML` writes in the source | 0 | 0 |
| Inline event handlers (home screen) | 0 | 0 |

### How to read the rows

- **The three answers.** The form filler chooses the first help topic ("Housing or eviction") and types the first name "Maya" and the phone number "555-0199". "Still on the screen" means that all three show while the failure message shows.
- **Retry.** After each failure, the harness switches the outcome to success and presses the build's own retry control once ("Try again" in A, "Try sending again" in B). This is the only press it makes on a failure screen.
- **Pressed a second time.** The harness runs the slow flow twice. In the second walk it presses the send control again one second into the wait, as an impatient visitor would. The row says "yes" when three things hold: the confirmation shows; it shows no later than after a single press (so the second press did not start the wait again); and the page does not change in the four seconds that follow (so no second request finishes later). In A the control then reads "Sending…" and is marked as switched off; in B it keeps its label. Both builds ignored the second press.
- **axe** (axe-core 4.14.0) is a program that scans a page for known kinds of accessibility error. "0" means that axe found none on that screen, and nothing more: axe cannot judge many things, such as whether a screen reader user can follow the flow. "Serious" is axe's own label.
  - `label-content-name-mismatch`: Build A's header button shows "Call 555-0142" at desktop width, but the name it gives to assistive technology is a different sentence. A person who operates the page by voice may fail to trigger it.
  - `definition-list`: on Build A's review screen, the summary list holds its "Change" links in a place where that kind of list allows only terms and descriptions. The same screen carries the failure message, which is why the finding appears in two rows.
- **Focus indicator**: the outline that shows which control the keyboard has reached.
- **`role="alert"` and `aria-invalid`**: markup that lets assistive technology announce an error and name the field at fault. Build A shows its error as text only. In both builds, keyboard focus moved to the error message.
- **Target**: anything a visitor can press or type into. The size is the smaller side of its box. The project's floor is 24 px and its default is 44 px (decision D7). The counts are plain size counts. They are not a pass or fail against WCAG 2.2, whose rule has exceptions (for example, a link inside a sentence).
  - Both targets under 24 px on the home screens are text links: the "Privacy" link in A's footer and the phone-number link in B's "Other ways to get help".
  - B's "Skip to main content" link is clipped out of sight until the keyboard reaches it. A pointer cannot hit it, yet the count includes it.
  - The Prescription's craft rule 8 asks for 44 px on every target. B's phone-number link (21 px tall, on every screen) misses it.

## What the re-run changed

| Item | First version of this file | First run's data | Re-run |
|---|---|---|---|
| Success flow reaches the confirmation, Build B | yes | **no** (`reachedSuccess: false`; the walker had started a second walk) | yes: 7 presses, and the walker stops on the confirmation |
| "Answers kept" after a failure | yes / yes, listed as measured | not measured | measured: yes / yes |
| "Slow response completes once" | yes / yes, listed as measured | Only "the slow flow reached the confirmation" was measured. In B the walker had pressed "Send my request" four times during the wait, by accident. | measured with one deliberate second press: yes / yes |
| axe at the "end of flow", Build B | 0 | 0, but scanned on the review screen of the second walk | 0 on the confirmation screen |
| axe on the screens between home and the end | not scanned | not scanned | scanned on every screen. New finding: 1 serious violation on A's review screen. B: 0 on every screen. |
| Targets under 24 px | no row | 1 / 1 recorded | row added, with the names of the controls; a row for the busiest screen added |
| Failure message, Build A | yes | yes, but recorded after eight unintended presses of "Try again" in each failure flow | yes, at the first failure |
| Presses per flow (`steps` in `metrics.json`; success, server error, offline, slow) | not in the table | A: 7, 14, 14, 7. B: 14, 9, 7, 10. | A: 6 in every flow. B: 7 in every flow. |
| File size | 60 KB / 40 KB | 60,077 / 39,513 bytes | the same bytes, now written exactly |
| Requests to other hosts | 0 / 0 | counted on the home screens only | 0 / 0, counted over the whole run |

No other number changed. Every value that both runs recorded for the home screens is identical in the two runs: the axe results, the style census, the target counts, the keyboard result, the 320 px result, and the reload result. Three more runs of each build, and one run of both builds together on a fully loaded machine, gave the same results as the re-run in every field except the times.

## Observed (judgment from the screenshots and from reading the source; not a measurement)

The first session made these observations. The builder of this version re-read both builds' source and the screenshots, and notes where a statement cannot be confirmed.

- **Build A is competent.** In this one sample, the vague prompt did not yield broken work. It also shows the familiar defaults: an invented logo, an ALL-CAPS eyebrow label, a two-color headline, a numbered "what you will do" card, card containers, and icons.
- **Build A invented content and features** that nobody asked for: a "What this site does / does not do" section, hints under topics, a third "I'm not sure" answer, dark mode, and a "clear my answers" control. Some of the added lines state what the clinic will do, for example "You can bring someone you trust with you" and "the clinic can look at it with you". The product facts say neither. For a legal-services product, invented content is a risk.
- **Build B follows the 23 Decisions,** as far as reading the source and the screenshots can tell: serif titles, teal action, no cards, no icons, no shadows, "Step 2 of 6", "Your answers so far" with Change links, outcome-named buttons. Decision 23 asks that the summary print cleanly on one page; nobody checked that. Build B added short connecting copy and a five-line privacy page. The first version of this file also said that Build B's builder "listed every deviation itself". That report is not in this folder, so this file cannot support the statement.
- **Build B is plainer.** It looks deliberate and calm, close to a government service. Whether that is "better" depends on the Decisions, which is the point: the look came from the Prescription, not from the model's defaults.

## Scorecard (judged by a model, not measured)

**What this is.** Your scorecard has eight dimensions whose weights add up to 100, and a list of release gates. The dimensions, weights, and evidence notes below are copied from your ClearPath brief (`inputs/clearpath-brief.md`, section 10; the gates are in section 9). Your living reference (`frontend-design-living-reference.md`, section 20.01) gives the same eight dimensions and weights. That file is not in this repository; the builder read it in the saved copy of your knowledge archive.

**What this is not.** These numbers are a model's judgment of the evidence in this file. They are not measurements. They are also not the evaluation that your brief describes: the brief asks for scores from tests with people and from a human-built reference, and it says not to fill its table with a model's estimates. This section leaves that table empty. Use it as a reading aid, and delete it if you want no model-judged numbers in this record.

**How the model judged.** The scorecard sets the weights but gives no rule for awarding points inside a dimension. The model used one rule: give no credit for anything that nobody checked, take points away for each defect that this file records, and give equal scores where the evidence shows no difference. Visual craft and originality are matters of taste; there the number is the model's reading of the screenshots and the source. Because so much went unchecked, no score comes near its weight. Read the gap between A and B, not the size of a number.

| Dimension (weight) | Evidence the brief names | A | B | The model's reasoning |
|---|---|---:|---:|---|
| Task outcomes (25) | Three top journeys and error recovery | 15 | 15 | Both builds pass every machine check of the flow: success, two failures with answers kept and a working retry, a slow send, a second press. Printing the checklist was not checked and no person has tried either build, so 10 points are withheld from each. |
| Accessibility (20) | Matrix in §7 of the brief | 6 | 9 | Machine checks cover about half of that matrix; the keyboard-only journey, screen reader, zoom, and disabled visitors are missing, so 10 points are withheld from each. A loses 4 more: two serious axe findings, an error with neither `role="alert"` nor `aria-invalid`, and up to 6 targets under 44 px on one screen. B loses 1: a 21 px link on every screen. |
| Interaction quality (15) | States, feedback, alternatives, interaction cost | 12 | 12 | Both show a sending state, a failure state with the other contact methods, error text, and a retry, and both ignore a second press. A needs 6 presses and B needs 7; B shows the earlier answers on each screen. "Back" and "Change" were not walked, so 3 points are withheld. No recorded defect separates the builds. |
| Visual craft (10) | Blinded expert comparison | 6 | 5 | A looks more finished (cards, icons, an accent color) but shows generic defaults. B is disciplined (4 text sizes against 7, 1 corner radius against 3) but plain. Your own blind judgment is better evidence than this line: you named the color scheme and look as the weakness (decision D12). |
| Responsive robustness (10) | Viewports, zoom, long content, print | 3 | 3 | Neither home screen scrolls sideways at 320 px, and both draw at 375, 768, and 1280 px. Zoom, long content, and print were not checked. No difference found. |
| Performance (10) | Lab then field measurement | not scored | not scored | M0 took no load-time measurement. Both builds are one small file and make no outside request. |
| Maintainability (5) | Token/component/test review | 2 | 3 | By reading the source: B writes its colors, sizes, and spaces as named tokens and builds each screen from small shared functions. A names its colors but writes most sizes as raw numbers. Neither has a test. |
| Originality and fit (5) | Brand substitution and content specificity review | 2 | 3 | Neither is original. B looks like a government service, which is the direction your brief selected ("calm civic field guide"), and adds almost no content. A shows the common defaults of LLM-built pages and adds content that nobody supplied. No brand-substitution review was done. |
| **Seven scored dimensions (90)** | | **46** | **50** | |

**Release gates** (brief, section 9). The scorecard says to report these beside the total, because points cannot average them away.

| Gate | A | B |
|---|---|---|
| No critical task failure | none found by the harness | none found by the harness |
| No duplicate request | none seen in the second-press check | none seen in the second-press check |
| No sensitive document collection | no upload control in the source | no upload control in the source |
| No claim of legal advice or representation | none found by reading; needs a legal-content reviewer | none found by reading; needs a legal-content reviewer |
| No fabricated clinic claim | **in question:** A states things about the clinic that the product facts do not contain (see "Observed") | none found by reading |
| No keyboard blockage | not tested beyond the home screen | not tested beyond the home screen |
| No severe accessibility barrier | a machine cannot decide this; axe reports two "serious" findings | a machine cannot decide this; axe reports none |

## What M0 does and does not show

- **Shown:** a Prescription gives control. The model obeyed nearly every Decision, craft rule, and floor that a machine or a reading could check. The measured exception is craft rule 8: one link is 21 px tall where the rule asks for 44 px. The result is measurably more disciplined: fewer distinct values; no axe violation on any of the 12 screen scans, against two serious ones in Build A; an error that carries `role="alert"` and `aria-invalid`; and, by reading, no invented content.
- **Not shown:** that the Prescription made the flow work better. On every flow check that a machine could run, the two builds did equally well, and Build A needs one press fewer.
- **Not shown:** that a Prescription makes a build more attractive by itself. Attractiveness comes from the quality of the Options that the Studio offers. A dull set of picks yields a faithful, dull build.
- **Consequence for the plan:** the Catalog's taste (the Options and the craft layer) carries the value; the Fitter guards fidelity. One build per arm is a single sample, not a statistic.

## Not checked

A person must still check these:

- Screen reader behavior, real users, print output, 200% zoom, and forced-colors mode.
- The whole flow by keyboard alone. The harness tested Tab stops on the home screen only, and it walks the flow with a pointer.
- "Back", the "Change" links, and every error other than "no topic chosen".
- Entering a date in Build A. The form filler leaves A's optional day, month, and year boxes empty; in Build B it enters a date.
- Whether a second press starts a second request that leaves no trace. The builds send nothing over a network, so the harness can only watch the screen and the clock.
- A double-click (two presses within a fraction of a second), and a press after "Back" or a reload.
- Build A's dark mode, reduced-motion behavior in either build, and any browser other than Chromium.
- Load-time performance (LCP, INP, CLS) and long content.
- Contrast and target sizes in hover, pressed, and error states. axe examines each screen as it stands at one moment.
