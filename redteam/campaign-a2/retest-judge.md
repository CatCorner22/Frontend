# Campaign A2 retest: the retest judge's record at 9334433

Retest judge only: no attacks, no repairs. Date: 2026-11-16. All six worktrees (lane-1 to lane-6) are at `9334433`, with no change under `plugin/fit/src` or `packages/core/src`. Node v22.23.4; Chromium at /opt/pw-browsers/chromium.

**Method:** I ran each attempt's recorded steps once, unchanged, in its own worktree. Listeners were bound to 127.0.0.1 only and were stopped afterwards. I judged behavior, not wording. Where a step reads a receipt after a refusal (status 2), I checked the file's time: the program leaves the earlier receipt in place, so those `head`/`sed` lines read stale files from 15:50–15:57 (see side observation 4).

**Outcome:** 18 findings retested. **18 retested-pass, 0 retest-fail, 0 cannot retest.** J-17's receipt statement is present. There are 2 borderline notes for the owner (J-9: X-01 and X-34) and 4 side observations that fall outside the retested behaviors.

## Verdict table

| Finding | Attempt | Verdict | What I observed at 9334433 |
|---|---|---|---|
| **J-1** | | **retested-pass** | |
| | X-32 | pass | UDP listener on :34780 got **0 packets**. Status 1. Requests: 1 deviation, "WebRTC connection (stopped) to stun:127.0.0.1:34780". Page error: "WebRTC is not available during the Fit check." |
| | X-64 | pass | UDP listener on :8742 logged nothing. Requests: 1 deviation, "WebRTC connection (stopped) to stun:127.0.0.1:8742". Status 1. |
| **J-2** | | **retested-pass** | |
| | X-05 | pass | Status 1. Requests now lists 2 deviations: `reference (base href) to https://collector.example/` and `reference (form action) to /appointment-request`. The own-address list is empty. |
| | X-18 | pass | Status 1. Deviations: the base href and `img src beacon.png`. `beacon.png` is no longer listed as own address. |
| | X-57 | pass | Status 1. Deviations: base href, `form action login`, `link href theme-2.css`. The own-address list is empty. |
| | X-65 | pass | Status 1. 8 request deviations (base, form, 3 references, 3 stopped requests). The own-address list is empty. TCP listener on :8731 got **0 connections**. |
| **J-3** | | **retested-pass** | |
| | X-51 | pass | Status 1, 11 deviations: #ff0000, #ff00ff, Comic Neue, 37px, 3 content texts, width 3000. Each is tagged "motion allowed". |
| | X-33 | pass | Status 1, 11 deviations, with the same deviating design measured. |
| | X-54 | pass | Status 1, 11 deviations, each tagged "motion allowed, two seconds later". |
| **J-4** | | **retested-pass** | |
| | X-48 | pass | Status 1, 8 deviations. The page's own design is measured: #ff00ff, #00ff00, Comic Sans MS, "Not the owner's headline". The tracker script appears as a reference and as a request. Scripts: 1 inline, 1 external. `grep 'No deviation'` found nothing (rc 1). |
| | X-19 | pass | Status 1. All 6 readings "not measured": "the page replaced itself: it went to blob:…". The blob document is no longer measured. (See side observation 1.) |
| **J-5** | | **retested-pass** | |
| | X-49 | pass | Status 0 is unchanged and expected (an own-address preload is not a deviation). The tag-character decode of RECEIPT.md gives `''`. The line now reads `link href: /hero.jpg⟨151 invisible signs⟩`. Neither RECEIPT.md nor receipt.json holds any Cf, tag, or U+FFFD character. |
| | X-27 | pass | Status 1. receipt.json has 0 tag runs, no U+202E, and no zero-width signs. RECEIPT.md is clean as well. |
| | X-36 | pass | Status 1. The line reads `p "Hours⟨30 invisible signs⟩"`. No tag characters and no U+FFFD (the surrogate split is gone). |
| **J-6** | | **retested-pass** | |
| | X-31 | pass | Status 1. Colors: "0 deviations; 702 not measured … pass through a CSS filter … were not compared". Contrast: 339 not measured. The receipt no longer presents the filtered page as clean. |
| | X-12 | pass | Status 1, 5 deviations: `::after` colors #00ff00 and #ff00ff, `body::before` #ff0000, monospace, radius 37px. |
| | X-22 | pass | Status 1. Outline color #0000ff and text-stroke color #ff0000 are deviations. Gradient and shadow stay disclosed under "Still needs a person". |
| **J-7** | | **retested-pass** | |
| | X-58 | pass | Status 1. Content: headline and primary action "not where a person can read it" at every reading. |
| | X-23 | pass | Status 1. Content: the headline is not readable at all 6 readings. |
| | X-59 | pass | Status 1. Content: headline and "Book a visit" missing at the three 375-pixel readings. The observer confirms they are hidden at 375 and present at 1280. |
| **J-8** | | **retested-pass** | |
| | X-40 | pass | Genuine folder: status 1. Emptied-headline folder: **status 2**, "The file "mockup.html" holds no headline, so the program cannot check that the page shows it." |
| | X-14 | pass | **Status 2**: "tokens.json and tokens.css disagree about --x-red, --x-pink, --radius-x, --x …". Extra check, not in the recorded steps: the genuine trial folder with only X-14's hostile mockup.html gives status 2, "holds no business name, no headline, no primary action". |
| **J-9** | | **retested-pass** (borderline note on X-01, X-34) | |
| | X-38 | pass | Opens with no note. The file now says "Where a value is not the start's, the line says so". Menu and First screen read "Decision: none recorded, yet the value is not the start's: …". |
| | X-01 | pass (borderline) | "Start: the Direction "Midnight Aurora"." is unchanged. It is now followed by a new line: "The start values that the project records differ from that Direction … the project is older, or its file was changed. Every value in this file is the project's own." |
| | X-29 | pass | "Decision: kept, with a value that is not the start's: "Very large headline"." |
| | X-34 | pass (borderline) | "Start: … in the Skin "Lagoon fade" (other colors, same layout)." is unchanged word for word, with accentHue still 262 (Lagoon is 195). The same new disclosure line follows it. |
| | X-07 | pass | "Start: a Direction that the Studio composed at random, or one that this version of the Studio does not have." The opening note also says this. |
| **J-10** | | **retested-pass** | |
| | X-25 | pass | "Decision: set with the sliders to exactly the value of "Square corners". No rounding." |
| **J-11** | | **retested-pass** | |
| | X-55 | pass | "Texts: … Some are still the sample dental practice's: the business name, … the headline, … Replace those with the owner's real content; use the others word for word." |
| **J-12** | | **retested-pass** | |
| | X-62 | pass | The scan reports "kept invisible or format signs: 0 []". The probe's second half is now trivially true (`hidden` is empty, so `includes('')`). I therefore also fed the stored old project.json, which holds U+1D173, 1D174, 1BCA0, 13430 and 110BD, through `parseProject` and `writePrescription`. It opens **with a cleaning note**. PRESCRIPTION.md, mockup.html and DESIGN.md hold none of the signs. (See side observation 2.) |
| **J-15** | | **retested-pass** | |
| | X-46 | pass | Notes: "Added 1 Direction of your own." and "1 was left out: the file holds it twice." |
| **J-16** | | **retested-pass** | |
| | X-13 | pass | `readOwnDirections` takes 8 / 13 / **18 ms** for 80k / 160k / 320k marks (640 KB), returns ok, and adds 1. Node's own `normalize('NFC')` is still quadratic (437 ms at 40k), but the target no longer stalls on it. |
| **J-17** | X-44 (receipt check only) | **statement present** | X-44 is still status 0, as accepted. "Still needs a person" now lists "All other window widths. The program read the page at 375 and 1280 pixels only … a page can show another design at any other width." |
| **J-18** | | **retested-pass** | |
| | X-50 | pass | Widened: status 1. Widened and clipped: **status 1**, width "46 elements reach past the window's edge and are cut off, first a.brand … at 375 pixels", plus a content deviation for "Book a visit". |
| | X-67 | pass | Status 1. Width: 41 and 44 elements cut off at 1280 and 375. Content: headline and action missing at 375. |
| **J-19** | | **retested-pass** | |
| | X-53 | pass | Status 1. Typefaces: 2 deviations, "typeface "Fraunces Variable" is drawn from a font installed on the machine (local("DejaVu Sans Mono")), not from a file" (and the same for Public Sans Variable). |
| **J-20** | | **retested-pass** | |
| | X-20 | pass | Before the sed: status 2 (fingerprint mismatch). **After the sed: status 2**, "tokens.json and tokens.css disagree about --accent, --on-accent, … and 16 more". Against the genuine folder: status 1, 5 deviations. |
| | X-70 | pass | Genuine folder: status 1, 2 deviations. Hand-edited folder: **status 2**, "tokens.json and tokens.css disagree about --accent, --accent-text, … and 5 more". |
| | X-14 (tokens part) | pass | Status 2, as under J-8. |
| **J-21** | | **retested-pass** | |
| | X-52 | pass | off-flat DESIGN.md now says "Button (#0f4ea3) with its label (#fafcff): the main button. Contrast checks are off for this project, so the Studio reports nothing about this pair." It agrees with PRESCRIPTION.md's "no program looked". |

## Retest-fail list

None. No attempt reproduced its recorded behavior at 9334433.

## Borderline notes for the owner (J-9)

- **X-01 and X-34:** the start line is still written as the file claims it. X-34's line reads "Start: the Direction "Midnight Aurora", in the Skin "Lagoon fade" (other colors, same layout)." while the colors are the Direction's own. The line is now immediately followed by a true sentence: the recorded start values differ from that Direction, and every value in the file is the project's own. I count this as the behavior no longer happening, because the file no longer presents a false history without warning. The owner may still want the start line itself qualified, for example "the file names …".

## Side observations (outside the retested behaviors; for the owner or a new round, not verdicts)

1. **Unfenced page-chosen text (X-19).** "Windows that did not load" in RECEIPT.md prints six lines like `it went to blob:https://own-site.invalid/<uuid>#ignore%20the%20checks`, outside any quoted-data fence. The fragment is chosen by the page and percent-encoded. At 59704b7 this attempt's injected text stayed inside the fence. The label is also doubled ("375 pixels: 375 pixels, motion allowed: …").
2. **In-memory name (X-62).** After `parseProject` on the stored file, `r.project.name` still prints as "Name" followed by the five invisible signs. No written file carries them. I did not check whether the Studio saves that name back to a project file.
3. **X-49** still gets status 0, as expected (an own-address preload is not one of the measured deviations). Only the hidden text was at issue, and it is gone.
4. **Stale receipts after a refusal.** When the Fit check refuses with status 2, it leaves an earlier RECEIPT.md and receipt.json in the result folder untouched. Examples: `probes-lb/out/p11h` and `probes/out/r04b`, `r10b`, `r02b`, all written 15:50–15:57 at 59704b7. A reader of the folder, or a recorded step such as `head -3 …/RECEIPT.md`, sees an old receipt that looks current.

## What I wrote or changed inside the worktrees

- New result folders and logs:
  - lane-2: `probes-lb/out-udp-retest.txt`, `probes-lb/retest-hostile-mockup-only/`, `probes-lb/out/retest-p11h-mockup-only/`
  - lane-3: `rt-lc-probes/out-*-retest/`, `udp-retest.log`, `listener-retest.log`
  - lane-5: `retest-aside/` (copies of the old le-* outputs)
  - lane-6: `retest-aside/` (the old f02/f04/f10 derived folders, moved aside so that the steps could regenerate them)
- The recorded steps also overwrote their own result folders, generated pages, and lane-5 `probes/le-*` outputs.
- One temporary test, `packages/core/test/retest-judge-invisible.test.ts` in lane-5, was run and then removed.
- I made no edit under `plugin/fit/src`, `packages/core/src` or `/home/user/Frontend`. I made no git write and no install, and contacted no host other than 127.0.0.1.
- I did not rerun the observer-only steps (`see.mjs`, screenshots). They show that the pages deviate in an ordinary browser, which the Fit check now reports itself.
