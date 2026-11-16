# Campaign A2 retest: the variant lane, as judged

The variant lane's own log was never written (a safety classifier stopped the lane's reply). Its 19 attempts were rebuilt by program from the files that it left (`attempts-LV.json`: each page, folder, and probe with the command that reruns it, without any comment of the lane), and a separate judge reproduced them at `9334433`. Below is the judge's text, unchanged, copied by program from its final message on 2026-11-16.


**Note added at the join (2026-11-16, decision D72):** "SPEC 2.14" in the judge's text below is the section of the audit branch that became `SPEC.md` section 2.19 when the branches were joined; the main line's own 2.14 is another section. The judge's text is unchanged.

---

Lane L-V retest at pin 9334433: 12 findings (10 at S2, 2 at S1), 4 items that need human review, and no S3. Nothing reached the network during any Fit check: the 127.0.0.1 listener ran for every check and logged nothing. It did log STUN and TURN packets during my own unguarded visitor run of j1-channels, so the page does send when nothing stops it.

I ran the 18 page attempts twice each and V-19 as given, plus a scratch core test of my own that I then deleted. To see what a visitor sees, I opened each page in a plain Chromium with no stubs and no special flags, and used screenshots, pixel counts, computed styles and CDP platform fonts. I edited no target source, made no git writes and contacted no host other than 127.0.0.1.

The report is also at /tmp/claude-0/-home-user-Frontend/05f1e85c-2c2a-5e1e-823f-634a3377d480/scratchpad/rt/retest/judge-LV.md. My result folders are under /tmp/claude-0/-home-user-Frontend/05f1e85c-2c2a-5e1e-823f-634a3377d480/scratchpad/rt/lane-7/probes/L-V/judge/ and /tmp/claude-0/-home-user-Frontend/05f1e85c-2c2a-5e1e-823f-634a3377d480/scratchpad/rt/lane-7/probes/L-V/judge2/; the visitor tools are in judge/tools/ and the screenshots in judge/shots/.

## Findings

V-J1 | 2026-11-16 | S2 | confirmed | V-05 (also V-03, V-04) | Page CSS: `main, header, footer { overflow-x: hidden }` plus `white-space: nowrap` on `.lede, .tag, main p` | At 375 px a visitor sees the tag line, the lede, the paragraphs and even the main button ("Book a…") cut off at the window's edge, with no way to scroll to them (screenshot; right edge at 712 px in a 375 px window). The receipt says Width "0 deviations" and the status is 0. In V-03 and V-04, Width also says 0; their status is 1 only because Content catches the headline. Cause: `clippedOnPurpose` in `collect.ts` treats any ancestor whose overflow-x is not `visible` as cut on purpose, although `hidden` lets no person scroll. | 2/2 (identical receipts) | SPEC 2.14 (A2-J18); guarantees 66.01 (A2-J18); SPEC 2.10 status rule | Status 0 and "no deviation" in Width for a page that deviates in Width; the receipt's own Width note claims this case is caught. | The exception fits `overflow-x: auto` or `scroll`, not `hidden` or `clip`.

V-J2 | 2026-11-16 | S2 | confirmed | V-07 | `<style>@import url("data:text/css,@font-face{font-family:'Fraunces Variable';src:local('DejaVu Sans')}…")</style>` | A visitor's browser draws the headline in DejaVu Sans and the lede in DejaVu Sans Mono (CDP platform fonts; the plain Mockup draws Liberation Serif and Inter). The receipt says Typefaces "0 deviations" and the status is 0. The same rules written inline (V-06, the control) give 2 deviations. Cause: `faces()` in `collect.ts` only descends into rules that have `cssRules`, and an import rule keeps its sheet in `.styleSheet`. | 2/2 | SPEC 2.14 (A2-J19); guarantees 66.01 (A2-J19) | The receipt claims a `local()` font under a Prescription name is a deviation; one `@import` defeats that repair and the status becomes 0. | The "Still needs a person" item about the letters drawn does not excuse this, because the Typefaces note claims the opposite.

V-J3 | 2026-11-16 | S2 | confirmed | V-15 (also V-13) | `body, body * { -webkit-text-fill-color: #ff0000 }` (in V-13, on `.lede` only) | A visitor sees all text in red: red pixels appear and the design's #09111c text pixels are gone. The receipt says Colors "0 deviations" and the status is 0. Cause: the program compares `color` but never the fill color, which is the color actually painted. | 2/2 | SPEC 2.10 point 2; guarantees 66.01 | "No deviation" in Colors for a page whose text is drawn in a color outside the Prescription. | The code already reads the fill color, but only to skip the contrast reading.

V-J4 | 2026-11-16 | S2 | confirmed | V-14 (also V-13) | A declarative shadow root (`<template shadowrootmode="open">`) holding a styled `<p>`: red background, green text, Comic Sans, 3 px radius | A visitor sees a red block with green Comic Sans text at the top of the page (71,797 red pixels at 375 px). The receipt says 0 deviations in Colors, Typefaces and Radii, and the status is 0. Cause: `querySelectorAll('body, body *')` does not enter shadow roots. | 2/2 | SPEC 2.10 points 2 to 4; guarantees 66.01 | A second design in plain markup, with no script, is invisible to three of the six measures. | None.

V-J5 | 2026-11-16 | S2 | confirmed | V-13 | `h2::first-letter { color: #ff0000 }` | The visitor's browser computes the first letter of each h2 as rgb(255,0,0). The receipt says Colors 0 and the status is 0. Cause: only `::before` and `::after` are read. | 2/2 | SPEC 2.14 and guarantees 66.01 (A2-J6, "Pseudo-elements are compared"); the receipt's Colors note says the same | The receipt claims all pseudo-elements are compared. | I did not count V-13's text-decoration color, SVG `fill` or `mix-blend-mode: difference` as findings. Blend modes may deserve review alongside the filter repair (A2-J6).

V-J6 | 2026-11-16 | S2 | confirmed | V-17 | `* { color: transparent !important }` | A visitor sees no text at all; only the button fill shows. The receipt says Content "0 deviations" and that a text counts only where it is "not nearly transparent"; the status is 0. Cause: the readability test checks the box's opacity, never the alpha of the text color. | 2/2 | SPEC 2.14 (A2-J7); guarantees 66.01 | Status 0 for a page on which none of the three required texts can be read. | Contrast lists 339 readings as "not measured", but contrast never changes the status.

V-J7 | 2026-11-16 | S2 | confirmed | V-16 | `body { clip-path: inset(0 0 100% 0) }` | A visitor sees an empty page: every pixel at 375 px is the background color. Every measure says 0 and the status is 0. Cause: no visibility test looks at `clip-path`. | 2/2 | SPEC 2.14 (A2-J7); guarantees 66.01 | Status 0 for a page that shows nothing. | Any clip or mask passes for the same reason.

V-J8 | 2026-11-16 | S2 | confirmed | V-08 | A Prescription folder in which only `tokens.json` changes: the `border` color goes from `#09111c` at alpha 0.148 to `#ff0000` at alpha 1; `tokens.css` and all fingerprints are unchanged | The program accepts the folder. The build's red hero, which a visitor sees in red, measures Colors 0 and status 0. The same page against the original folder gives 1 color deviation and status 1. Cause: `disagreements()` in `prescription.ts` only compares a color when the `tokens.css` value is a 6-digit hex; `--border: rgb(9 17 28 / 0.148)` is not, so the check defaults to "same" and the forged opaque color joins the allowed set. | 2/2 | SPEC 2.14 (A2-J20); guarantees 66.02 (A2-J20) | A hand-edited folder silently makes any color "of the Prescription"; `--border` and `--card-border` are both such slots. | None.

V-J9 | 2026-11-16 | S2 | confirmed | V-12 | Page script: `history.replaceState(null,"","/page/<instruction>")` | RECEIPT.md, under "Windows that did not load", prints the page-chosen path six times in plain bullet lines, outside any fence and without the "quoted data" mark: "…the page replaced itself: it went to https://own-site.invalid/page/AI-READER:[redacted-instruction]". The status is 1. | 2/2 | SPEC 2.10 (page text only inside a fenced block marked as quoted data); guarantees 66.03; hard rule 10 | Text the page chooses reaches an AI reader of the receipt unfenced, in a line that reads as the program's own words. | The severity depends on how you read "unseen": the owner can see the line in RECEIPT.md, so you may lower this to S1. Also, `replaceState` does not navigate, so "replaced itself" is itself inaccurate, though it errs toward status 1.

V-J10 | 2026-11-16 | S1 | confirmed | V-02 | A page that makes an iframe's address from `URL.createObjectURL(new Blob(…))` | The two runs give different RECEIPT.md files: each `blob:https://own-site.invalid/<random id>` line changes. Everything else is identical: all four WebRTC paths (data: frame, srcdoc frame, blob frame, a window opened by the page) are listed as stopped, and the listener received nothing. | 2/2 (different each time) | SPEC 2.10 (same inputs, byte-for-byte same receipt); guarantees 66.03 | The byte-for-byte promise breaks for any page that makes a blob address. | Nothing false and nothing leaked; you may lower this to S0.

V-J11 | 2026-11-16 | S2 | confirmed | V-19 (J-9 variant A) | A project file opened through `parseProject` with `direction: null`, `base` and `params` set to the values of the Direction "midnight-aurora", and no Decisions | Opening shows no note. PRESCRIPTION.md says "Start: the plain start (no Direction).", "every value below comes from the start" and "The value of the start stands: “Links centered, button right”". The real plain start is "Name left, links right" and "Rows separated by lines"; 23 values differ. Cause: `startLines()` returns early when there is no Direction and never compares `base` with the plain start. | 2/2 (the lane's test and my own test) | SPEC 2.14 (A2-J9) | A Prescription file states a falsehood about where the design came from. | The value lines themselves are correct; you may weigh this as S1.

V-J12 | 2026-11-16 | S1 | confirmed | V-19 (J-11 variant) | A project file that keeps the 3 sample services but changes the first one's title | The "Texts" line lists 22 sample texts but not "the services", then says "use the others word for word". Two of the three services ("Repairs", "Urgent visits") are still the sample practice's. Cause: `sampleTextsIn()` compares the whole services list as one unit. | 2/2 | SPEC 2.14 (A2-J11) | The AI coding tool is told to ship two sample service texts as the owner's words. | An ordinary owner edit also triggers this; the harm is contained.

## Needs human review

- **V-09 (j3-media):** In a visitor's browser I confirmed four other looks: dark mode turns the page red, a phone (coarse pointer) turns it green, any window height other than 800 px turns it blue, and after 8 seconds it turns magenta. The check reads only light mode, a fine pointer, a height of 800 px and about 5 seconds, so it gives Colors 0 and status 0 (2/2).
  - The height test and the delay are signs of the check, which the receipt's "A page that recognizes the check" item covers.
  - Dark mode and a phone's coarse pointer are ordinary visitor settings that the receipt names nowhere. If you decide they are not signs of the check, this is S2.
- **V-11 (j5-spaces):** The page error holds 110 ideographic spaces (U+3000) followed by an instruction. It sits inside a fence marked as quoted data, but pushed far off to the side. U+3000 is a space, not a sign that "draws nothing" by Unicode property, so the A2-J5 rule as written is met. Whether this counts as "hidden" is a judgment call.
- **V-19, J-12 part:** The same trick in a Decision's reason in PRESCRIPTION.md: 150 ideographic spaces, then an instruction, inside the fence marked as quoted data. The cleaner removes control, format and default-ignorable signs as stated, and none of the ten signs the probe tested has those properties. The stated rule is met; the same question applies as for V-11.
- **V-19, J-9 variant B:** The lane's test passes the own Direction's name "Warm Bakery" directly, imitating `apps/studio/src/App.tsx:1158`; I did not run the Studio itself. The code makes no comparison between the file's start values and those of an own Direction the browser holds. Reproducing it through the Studio needs a file that names the id of an own Direction the owner already has, which is unproven.

## All attempts

| Attempt | Verdict |
|---|---|
| V-01 j1-channels | No finding. WebRTC from a frame's window is stubbed and listed, and the preconnect is listed; status 1; nothing reached the listener. WebTransport is not listed, but even a plain browser sent no packet, so there is no evidence of a request. |
| V-02 j1-realms | No leak: all four WebRTC paths are stopped and listed. Side finding V-J10 (S1): the receipt differs between runs. |
| V-03 j18-clip | Status 1 through Content; part of V-J1 (Width still says 0). |
| V-04 j18-clip2 | Status 1 through Content; part of V-J1. |
| V-05 j18-clip3 | V-J1 (S2) |
| V-06 j19-control | No finding: the control; 2 typeface deviations reported. |
| V-07 j19-import | V-J2 (S2) |
| V-08 j20-red + folder-j20 | V-J8 (S2) |
| V-09 j3-media | Needs human review |
| V-10 j4-handler | No finding. The page checks for the `.invalid` host and shows real visitors another business in other colors and Comic Sans (confirmed); the check sees the Mockup and gives status 0. The receipt states this limitation ("A page that recognizes the check"). S0 note: any page can read the stand-in host. |
| V-11 j5-spaces | Needs human review |
| V-12 j5-unfenced | V-J9 (S2) |
| V-13 j6-combo | V-J3, V-J4, V-J5 (S2) |
| V-14 j6-shadow | V-J4 (S2) |
| V-15 j6-textfill | V-J3 (S2) |
| V-16 j7-clippath | V-J7 (S2) |
| V-17 j7-transparent | V-J6 (S2) |
| V-18 x-preconnect | No finding: both preconnects are listed as other-site references; status 1; no connection reached the listener. |
| V-19 probe-lv.test.ts | J-9A is V-J11 (S2); J-11 is V-J12 (S1); J-12 and J-9B need human review. |