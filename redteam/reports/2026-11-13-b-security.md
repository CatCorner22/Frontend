# Red-team report: security attacker, second pass (2026-11-13-b)

Reviewer: security attacker (adversarial). Worktree branch `claude/brave-mayer-sawqz9`.
Method: I read the code, built the single-file page (`npm run build:page`), and drove `apps/studio/dist/artifact/local-test.html` in Chromium with Playwright. I also ran a scratch Vitest probe against `packages/core`; I deleted it afterwards. My scratch scripts sit outside the repository (session scratchpad `probe.mjs`, `probe2.mjs`). Every finding below says whether I reproduced it or inferred it from the code.

## Counts

| Severity | Count |
|---|---|
| Blocker | 1 |
| Major | 1 |
| Minor | 5 |
| Note | 7 |

## Findings

### S2-01 — Blocker — The one backup slot is overwritten without a word, which destroys a copy the Studio said it kept

**What I did (reproduced in the browser, twice).**
`keepBackup()` (`apps/studio/src/platform.ts:139-146`) writes to a single key, `refraction.project.backup`, and overwrites whatever is there. Three callers write to it: `store.ts:277` (the older of two copies that differ), `store.ts:285` (a copy that cannot be read), and `platform.ts:172` (non-envelope text in the browser key). None of them checks whether the slot already holds an earlier kept copy.

1. Path on the private claude.ai page (with a stand-in for the page database, as `studio.e2e.ts` uses):
   - I seeded `refraction.project.backup` = `{"why":"A saved copy that could not be read.","text":"{\"schemaVersion\":3,\"name\":\"work from a newer Studio\"}"}`. An earlier open of the Studio had kept this copy and told the owner: "The Studio kept it untouched; you can download it from the Summary."
   - I seeded the browser copy (`refraction.project.v2`) with project "older browser copy" saved at `2026-11-10`, and the page database with project "newer page copy" saved at `2026-11-12`. A second device or browser produces exactly this state in ordinary use.
   - I opened the Studio.
2. Path in a local copy (no page database): I seeded the backup slot with the older of two copies that differed (`why: "The older of two saved copies that differed."`), and `refraction.project.v2` = `{"savedAt":"x","project":{"schemaVersion":2}}` (unreadable). Then I opened the Studio.

**What happened (observed).**
1. The backup slot now held "The older of two saved copies that differed.", and the newer-Studio work was gone from storage. The notice read only: "The copy saved on this page and the copy saved in this browser differed. The Studio opened the newer one and kept the older one; you can download it from the Summary." It said nothing about the copy it had just destroyed.
2. The earlier kept copy was gone too; the slot held "A saved copy that could not be read." No notice mentioned the replacement.

The owner was told twice that a copy was safe, and the Studio then deleted it without saying so. That is silent loss of saved work.

**Suggested fix.** Keep several backups (for example a small list under one key, newest first, capped at 5, deduplicated by text). Never drop an entry the owner has not downloaded or dismissed. If the cap forces a drop, tell the owner which copy went. Add an e2e test that seeds a backup, causes a second backup, and asserts that both survive.

### S2-02 — Major — Opening a saved copy changes it, and the first save then overwrites the original with no kept copy (and one change is never announced)

**What I did (reproduced in the browser).** I seeded `refraction.project.v2` with a valid version-2 project that a newer Catalog could have written. It held one Decision for an unknown Step (`"future-step"`, with a reason, "my notes on a future step") and a 500-character reason on the `theme` Decision. The schema allows reasons of up to 600 characters (`engine.ts:572`). I opened the Studio and typed a new project name, which is one ordinary change.

**What happened (observed).**
- At opening, the notice said: "One Decision in the file belongs to a Step that this version of the Studio does not have. It was left out."
- After the rename, the stored copy had no `future-step` Decision, and the `theme` reason was 280 characters (it had been 500). The backup slot was empty.
- No notice said anything about the reason being cut. `normalize()` cuts it silently at `engine.ts:658` (`d.reason?.trim().slice(0, REASON_MAX)`).

The same path also drops, with no kept copy: unknown Step Decisions, relabelled `picked` Decisions, filtered `rejected` lists, and invalid `at` times, which become `1970-01-01` silently (`engine.ts:643-660`). In `store.ts:272-280` the chosen copy opens with notes, `lastSavedText` is set to the *normalized* text, and the next `commit` overwrites the stored original. The same happens on file import, where the original file still exists on disk, so the risk is lower there.

**Suggested fix.** In `openSaved`, compare the normalized project with the raw stored text. If they differ (that is, `notes.length > 0`, or a reason was cut), call `keepBackup(raw)` before the first save and say so in the notice. Add a note when `normalize` shortens a reason. Better still, do not truncate at all on load, because the schema already caps reasons at 600 characters.

### S2-03 — Minor — Work done while the Studio is "held" is lost on close or reload, with no leave-page warning

**What I did (reproduced).** I seeded `refraction.project.v2` with a project from a newer schema (`schemaVersion: 3`). The Studio correctly entered the `held` state. I then started from a Direction, renamed the project to "an hour of work", and reloaded the tab.

**What happened (observed).** The top bar said "Not saving: see the notice". No `beforeunload` prompt appeared. After the reload the name was back to "My first project", so all the work was gone. `persist()` and `flush()` return early when held (`store.ts:166`, `191`, `561`), and nothing registers `beforeunload`. The sticky notice does explain the state, so this loss is not silent. A person who ignores the banner still loses the session.

**Suggested fix.** While the state is `held` or `failed` and the project differs from `lastSavedText`, register a `beforeunload` handler so the browser asks before leaving. Consider disabling edits until the owner answers the held notice.

### S2-04 — Minor — "Keep this tab's copy" destroys the other tab's copy outright

**What I did (reproduced).** I opened two tabs on the same project. In tab A I renamed it "A edits"; tab B correctly showed the "changed in another tab" notice. In B I renamed it "B edits" and clicked "Keep this tab's copy".

**What happened (observed).** The stored copy became "B edits". A's copy was not kept anywhere (the backup slot was empty). The button label implies the replacement, so this is not silent. A slip of one click still loses the other tab's work, and the backup mechanism exists for exactly this case. (`store.ts:178`, `store.ts:351`.)

**Suggested fix.** Before adopting, `keepBackup(stored copy, 'The other tab's copy, replaced by your choice.')`. This depends on S2-01's fix to multiple slots.

### S2-05 — Minor — In the local file:// mode, any other local HTML file can read and overwrite the project

**What I did (reproduced).** I opened `local-test.html` from file:// and named the project "secret project". In the same browser profile I then opened an unrelated file, `file:///…/scratchpad/other.html`.

**What happened (observed).** `other.html` read `localStorage['refraction.project.v2']` in full, including the name "secret project". Chromium gives every file:// page one shared storage origin. Any downloaded HTML file the owner opens locally can therefore read the project, or write a hostile copy. The import checks would then handle a hostile copy; S2-01 and S2-02 show what that can still destroy. This applies only to the local-test copy; the claude.ai page has its own origin.

**Suggested fix.** In the README, state that the file:// copy is for testing and that its storage is shared with every local HTML file. Alternatively, serve it from `npx vite preview` (http://localhost) for real use.

### S2-06 — Minor — Dependabot has no cooldown, so it does not enforce the 7-day rule (D27)

**What I did (read `.github/dependabot.yml`; inferred, not run).** The file has no `cooldown:` block. Dependabot therefore proposes a version on the day it is published, and only human discipline enforces D27 ("a version is pinned only 7 days or more after its release").

**Suggested fix.** Add `cooldown: { default-days: 7 }` to both ecosystems.

### S2-07 — Minor — Reasons and Direction names in version-1 files are discarded without a note

**What I did (read `engine.ts:602-628`; inferred, not reproduced).** `migrateV1` drops any `reason` field (`const { reason: _reason, ...rest } = value`), on the assumption that version 1 "never wrote" one. It maps an unknown Direction *name* to `'generated-0-0'`, and because that identifier then matches `GENERATED_ID`, `normalize` adds no note. It also duplicates the v1 `theme` Decision into a `contrast` Decision the owner never made. None of these produces a note. Hand-edited or late v1 files lose text silently.

**Suggested fix.** Keep `reason` if present, since the schema already validates it. Add a note when a Direction name is not found, and a note that the old theme Decision now covers two Steps.

### S2-08 — Note — A `__proto__` key in `decisions` vanishes inside Zod, and the "left out" count is wrong

**What I did (reproduced with a Vitest probe).** I passed a project whose `decisions` held both `"__proto__"` and `"constructor"` keys, each with a valid Decision.

**What happened (observed).** The import succeeded with the note "One Decision … was left out". Two were left out: `z.record` assigned `__proto__` as the result object's prototype instead of keeping it as a key. `Object.prototype` was not polluted (I checked `'polluted' in {}`), and `normalize` rebuilds `decisions` with `Object.fromEntries`, so I found no exploit. `__proto__` in `params`, in `content`, at the top level, and in v1 `params`/`decisions` was also harmless.

**Suggested fix.** None needed for safety. Optionally, refuse `__proto__`/`constructor`/`prototype` keys in `decisions` before parsing, so the count is honest.

### S2-09 — Note — Neither the Studio page nor the Mockup `srcdoc` carries a Content Security Policy

**Observed.** The built page contains no `Content-Security-Policy`, and nothing sets one on the preview frames. Today `sandbox=""` blocks scripts and forms, and all CSS values come from enumerated parameters, so I could not cause a request (see below). A CSP meta tag in the Mockup (`default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:`) would block remote loads by CSS `url()` if a future token ever carried data from the file. That gives defense in depth for the "no network" rule. The Studio's own theme path (`theme.ts:36-42`) writes token values without the `UNSAFE_IN_CSS` check that `tokensToCss` applies. That path is safe today only because every value derives from enumerated or range-checked parameters.

### S2-10 — Note — The bundle contains Vite's module-preload polyfill, which calls `fetch()`

**Observed.** One `fetch(e.href, …)` call is in the built HTML: Vite's `modulepreload` polyfill. It runs only on `<link rel=modulepreload>` elements, and the single-file page has none. No request occurred in any probe. Setting `build.modulePreload: { polyfill: false }` would remove the only network call site from the bundle.

### S2-11 — Note — The save time decides which copy opens, but nothing checks it

**Inferred from `store.ts:264` and `platform.ts:87, 103`; not reproduced.** `savedAt` is compared as a string and never checked to be an ISO time. A device with a wrong clock, or a hostile copy with `savedAt: "~"`, always wins the "newer copy" contest. The genuinely newer copy then becomes the "older" one and goes to the backup slot, where S2-01 can destroy it.

**Suggested fix.** Accept only `ISO_TIME`-shaped values and treat anything else as `null` (the oldest).

### S2-12 — Note — CI action pins not verified against upstream

`ci.yml` pins `actions/checkout` and `actions/setup-node` by commit hash, with `permissions: contents: read` and `persist-credentials: false`. That configuration is sound. I did not check that the two hashes really are the tagged releases named in the comments, because that needs an outside lookup.

### S2-13 — Note — Very small numbers reach CSS in exponent form

**Observed in the Vitest fuzz.** `radius = 5e-324` yields `--radius-control: 5e-324px`. CSS accepts exponent notation, so nothing broke; I record it only so nobody is surprised.

### S2-14 — Note — A 1.77 MB file holding 20,000 junk Decisions passes the 2 MB size check

**Observed.** It parses in about 150 ms, all 20,000 are dropped with a note, and nothing hangs. A file nested 500,000 levels deep parses and is refused cleanly. Nothing more needs doing.

## Probes the app withstood (one line each)

- Hostile import: a script/markup payload (`<img onerror>`, `</style>`, `</title>`, `</textarea>`, `<script>`, `<svg onload>`, `javascript:`) in the name, every content string, every list item, the headline and its emphasis, and every reason. No script ran, no dialog appeared, no element was injected into the Studio's DOM, and the preview `srcdoc` held no raw `<script>`.
- A hostile file *name* in the confirmation renders as text.
- Every preview frame has `sandbox=""`. Reading `top.location` from a frame throws `SecurityError`. The previews hold no `href`, no form `action`, and no `type=submit` (`links: 'inert'` works).
- No network request from the built page across load, import, a walk through every Step link, the Summary, the Studio dressed in the project's design, and every storage probe (Playwright context-level request log was empty).
- The "dress the Studio" CSS (`#studio-tokens`, about 96 KB) held no `url(` other than `data:` and no `@import`, even with the hostile project loaded.
- Source scan: no `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `new Function`, or `document.write` in `apps/studio/src` or `packages/core/src`. The bundle's matches are React/ReactDOM internals.
- Remote URLs in the bundle are licence or namespace strings only (github.com, w3.org, json-schema.org). None is fetched.
- Parameters: `NaN` as a string, `1e400` (which becomes Infinity), and out-of-range numbers are all refused, and the error names only the section.
- Fuzz: 1,500 random parameter sets plus every range edge, through `deriveTokens` (advise/enforce/off), `tokensToCss`, and `renderSmallBusiness`. Nothing threw, so no stored project can crash the Studio at start.
- Prototype pollution through `__proto__`/`constructor` at the top level, in `params`, `content`, `decisions`, and v1 data: `Object.prototype` stayed clean.
- `schemaVersion` 3 is refused, the stored copy is kept, and saving is held. Non-integer, negative, and string versions are refused.
- Hostile `refraction.prefs.v1` (`null`, `[]`, `"x"`, `{`, wrong types, `"__proto__"`): no error, no fault screen.
- Hostile `refraction.project.backup` (`why` and `keptAt` holding markup) renders as text.
- Storage quota exhausted: the top bar says "Cannot save here. Download the project file before you close this page."
- Two tabs: the second tab is warned and stops saving (but see S2-04).
- Supply chain: every dependency is pinned exactly. The lockfile resolves all 217 packages from registry.npmjs.org, each with an integrity hash. `.npmrc` sets `ignore-scripts=true` and `save-exact=true`. CI uses least-privilege `permissions`. No `apca-w3`.

## What I did not get to

- Hostile data in the page database itself (`window.claude` `db.get()` returning non-string `project`, huge strings, or a throwing `data()`). I only exercised it through the e2e-style stand-in.
- The `downloads` runtime path (`saveFile` on claude.ai) and its `declined` handling.
- Two tabs racing inside the 300 ms save delay, and a `pagehide` flush that arrives before the storage event.
- Checking the CI action hashes against upstream (S2-12).
- The Fitter plugin (`plugin/`), the `phase0/` experiment, and `scripts/`. They were outside the brief.
- A dedicated look at keyboard focus moving inside the preview iframe (a usability matter more than a security one).
