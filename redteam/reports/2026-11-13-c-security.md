# Third security review (narrow): kept copies, the Mockup's policy line, damaged-file messages

Reviewer: security attacker (red team). Date: 2026-11-13. Branch: claude/brave-mayer-sawqz9, at commit af209b6.
Scope: `git diff abb828d~3..HEAD` and the kept-copy code that it calls: `apps/studio/src/platform.ts` (`readBackups`, `keepBackup`, `removeBackup`, `storedBrowserText`, `saveBrowserNow`), `apps/studio/src/store.ts` (`keepReplaced`, `keepThisTab`, `canonical`, `changedOnOpening`, `openSaved`, and the start-again, new-project, and file-import paths), `apps/studio/src/App.tsx` (the Summary's kept-copy list, `keptCopyFile`), the Content-Security-Policy line in `packages/core/src/templates/smallBusiness.ts:461`, the guard in `apps/studio/src/theme.ts:41`, and `SECTION_WORDS` in `packages/core/src/engine.ts:613`.

Method: I ran `npm ci --ignore-scripts` and `npm run build:page`. Then I drove the built page `apps/studio/dist/artifact/local-test.html` over a file:// address with Playwright (Chromium), seeded and read browser storage, and filled the storage to its limit with a filler key. The harness scripts are in my scratchpad (`t1.cjs` to `t5.cjs`), not in the repository. I did not run `npm run check` or the e2e suite.

A word on "storage full" (a quota): a browser gives each site about 5 MB of storage. The kept copies, the saved project, and anything else on the same address share that one allowance. When it is full, a write is refused with an error.

## Findings

### S3-01 — blocker — "Start a new project" (and every other replace path) can destroy the saved project while the kept copy silently fails

- **Where:** `apps/studio/src/store.ts:184-187` (`keepReplaced` ignores the result of `keepBackup`); the same pattern at `store.ts:190-193` (`keepThisTab`). `keepBackup` itself returns `false` correctly (`platform.ts:172-181`), but no caller in these paths reads it.
- **What I did (reproduced, `t1.cjs`):** opened the Studio fresh, picked "Start from Paper and Ink" (the saved project was 3,299 characters, with a Direction). I filled storage with a filler key until only about 200 characters were free. That space is too small for a kept copy of the project, but large enough for the smaller, empty project that replaces it, because replacing a stored value only needs room for the difference. Then I went to the Summary, chose "Start a new project…", and confirmed "Yes, clear this project".
- **What happened:** `refraction.project.backup` was never written (no kept copy). The saved project was overwritten with the empty "My project". The status line said "Saved in this browser, on this computer". No notice said that the kept copy failed (the banner was empty when I read it 1.2 s later). After a reload, the text `paper-and-ink` was nowhere in storage: the replaced project was gone for good. Undo works only until the page closes.
- **Why it matters:** this is silent loss of saved work. The confirmation dialog does hedge ("where this browser allows it"), but once the person confirms, the Studio says "Saved" and never says that the copy was *not* kept. The same failure applies to "Start again from …" (`store.ts:494`, `:508`), "Open a project file" (`store.ts:553`), and "Keep this tab's copy" (`store.ts:192`). That last path overwrites another tab's work after a failed keep. I inferred those three paths from the code and did not reproduce them separately; they call the same function and ignore the same result. On the hosted page the page database is also overwritten by the next save, so neither store keeps the old project.
- **Related, inferred from code:** `store.ts:318-319`. When two saved copies differ and keeping the older one fails, the notice says only "The Studio opened the newer one." It does not say that the older one was not kept, and the next save replaces it in both stores.
- **Suggested fix:** make `keepReplaced` and `keepThisTab` return the result of `keepBackup`. When it is `false`, do not replace silently. Either stop and ask ("The Studio could not keep a copy of this project because this browser's storage is full. Download the project file first, or replace it anyway"), offering a download of the current project, or at minimum put a sticky, urgent notice that names the loss. Do the same at `store.ts:318`: when the older copy cannot be kept, hold saving (`saved: 'held'`) until the person decides. Add an e2e test that fills storage and then replaces a project.

### S3-02 — major — "Start a new project and discard the unreadable copy" does not discard it, and saving then fails forever without saying why

- **Where:** `apps/studio/src/store.ts:337-338` (the button label and its action); `apps/studio/src/platform.ts:213-216` (`saveBrowserNow` refuses to save when it cannot keep the unreadable text).
- **What I did (reproduced, `t2.cjs`, T2):** stored the text `garbage that is not a project yyyy…` (about 3 KB) under `refraction.project.v2`, filled storage to about 100 characters free, and reloaded. The Studio correctly held saving and offered "Start a new project and discard the unreadable copy" (the label is honest: it knew that the keep had failed). I clicked it and then "Start from Ember Noir".
- **What happened:** the status line said "Cannot save here. Download the project file before you close this page." The garbage was still stored. Every later save tries to keep the garbage first, fails, and returns `failed`. The button promised to discard the unreadable copy, but nothing discards it. Without the page database (the local file, or a browser with the page database absent), the person can never save again in this browser. Nothing tells them why, or that removing kept copies or the unreadable text would free the space. On the hosted page the page database still saves, so the status reads "Saved on this page" and the loss is limited to the browser copy (inferred from `platform.ts:243-253`, not reproduced).
- **Suggested fix:** when the person chooses "discard", record that choice (for example a flag that `saveBrowserNow` honours for that exact text) so that the next save replaces the unreadable text. When a save fails because a keep failed, say so in plain words: "This browser's storage is full. Remove kept copies from the Summary, or download your project."

### S3-03 — major — "Download this kept copy" can hand over only part of what was kept

- **Where:** `apps/studio/src/App.tsx:602-614` (`keptCopyFile`).
- **What I did (reproduced, `t2.cjs`, T5):** seeded two kept copies. Copy 1: `{"from":"another tool","n":12345678901234567890,"d":"first","d":"second","project":{"only":"this part"},"notes":"keep me"}`. Copy 2: `{"savedAt":"2026-01-01","project":"{\"x\":1}","history":"weeks of notes"}`. Then I clicked "Download this kept copy" on each and read the downloaded files.
- **What happened:** copy 1 downloaded as `refraction-kept-copy-1.json` holding only `{ "only": "this part" }`. Copy 2 downloaded as `{ "x": 1 }`. Every other field (`from`, `n`, `notes`, `savedAt`, `history`) was dropped. The function's own comment promises that "anything else downloads exactly as it was kept". Any JSON record that is not a project also loses duplicate keys and number precision, because it is parsed and written again rather than handed over as stored text (inferred: copy 1 lost those fields anyway, so I could not observe this separately).
- **When it bites:** an unreadable copy (for example, a file from a newer version whose format has a `project` section, a hand-edited copy, or an old single kept copy carried over by `readBackups:165`) is exactly the kind of copy someone downloads before choosing "Remove it for good". After that removal, the dropped parts are gone. The Studio itself only keeps project text and raw unreadable text, so the trigger needs a copy shaped like this. I rate it major rather than blocker for that reason.
- **Suggested fix:** download the kept text byte for byte, always. If a project-shaped convenience file is wanted, offer it as a second, separately named download, and only when `parseProject` accepts the content.

### S3-04 — minor — Adding a kept copy silently drops list members that the reader does not understand

- **Where:** `apps/studio/src/platform.ts:159` (`readBackups` filters out members), then `platform.ts:176` (`keepBackup` writes back only the filtered list).
- **What I did (reproduced, T3):** seeded `refraction.project.backup` with `[{"keptAt":…,"why":"object text","text":{"schemaVersion":2,"name":"my real work stored as object"}}, 42, "a bare string copy", {"keptAt":…,"why":"w","text":"real"}]`, plus a worked project, and chose "Start a new project…".
- **What happened:** the Summary listed only 1 kept copy before the action. Afterwards the store held 2 entries (the new copy and `real`). The object-text copy and the bare string were erased without a word. When every member is odd (for example `[1,2]`), `readBackups` returns an empty list. The Summary then shows nothing, and the next keep overwrites the whole stored text (inferred from code).
- **Suggested fix:** treat any member that is not a well-formed copy the way the whole-store fallback already does: wrap it as a copy whose text is `JSON.stringify(member)` and whose reason is "an earlier kept copy in a form this version does not know". Then nothing that was stored is dropped by a later write.

### S3-05 — minor — Removing one of two copies with the same time and text removes both

- **Where:** `apps/studio/src/platform.ts:186` (removal matches on `text` and `keptAt`, not on position).
- **What I did (reproduced, T4):** seeded two identical entries `{keptAt:"2026-01-01T00:00:00.000Z", why:"twin", text:"same"}`. The Summary listed 2. I removed the first.
- **What happened:** both disappeared; the store key was deleted. `keepBackup` removes duplicates by text, so the Studio itself does not create twins. They come only from hand-edited or foreign storage, or from two tabs (see S3-06), and the content of the two is identical. So little is lost, but the screen removed two copies after the person asked to remove one.
- **Suggested fix:** remove by index in the list as read, after checking that the entry at that index still matches. Or remove only the first match.

### S3-06 — note — Two tabs keeping copies at the same moment can lose one (inferred, not reproduced)

- **Where:** `platform.ts:174-176`. `keepBackup` reads the list, then writes `[new, ...list]`. Two tabs that each read before either writes end with only the last writer's copy. Inside one tab this cannot happen, because storage calls run in one task. Across tabs, Chromium does not promise a storage lock (the specification's "storage mutex" is not implemented), but a real race needs two keeps within milliseconds. I did not reproduce this.
- **Suggested fix:** after writing, read the list back and check that the new copy is present. Or store each kept copy under its own key (`refraction.project.backup.<time>`), so that no write rewrites another copy.

### S3-07 — note — The Mockup's policy line does not restrict form targets or the base address

- **Where:** `packages/core/src/templates/smallBusiness.ts:461`: `default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:`.
- **What I did (reproduced, `t3.cjs`):** took a real Mockup from a preview frame and added by hand: a remote `<img>`, `srcset`, `<video poster>`, `<object>`, `<iframe src>`, `<link rel=stylesheet>`, `preload`, `prefetch`, `dns-prefetch`, `@import`, a remote `@font-face`, a remote `background-image`, `<body background>`, an SVG `<image href>`, a `<script>`, and a `<form action="https://form.example.test/">`. I loaded it top-level (no sandbox) and logged every request leaving file/data/about/blob.
- **What happened:** no outside request was made on load, and the script did not run. When I clicked the form's button, the browser sent `https://form.example.test/?`. `default-src` does not cover `form-action`, and `base-uri` is also open. The Mockup does contain a form (`smallBusiness.ts:520`, with `action="#contact" method="post"` when links are not inert), but the content text is escaped, so no one can inject an outside target through project data. Inside the Studio, the preview frames use `sandbox=""`, which blocks form submission. This matters only for a Mockup opened as a standalone file, or one edited by hand or by a build tool.
- **Suggested fix:** add `form-action 'none'; base-uri 'none'` to the line. They cost nothing and close the last gap that the policy itself can close.

## Attacks the app withstood

- The policy line blocks every hand-added remote load listed in S3-07, top-level and inside a sandboxed frame (0 outside requests).
- The policy does not break the Mockup: the inline `<style>` applies (computed background `oklch(0.985 0 0)`), a `data:` PNG image loads (naturalWidth 1), and a `data:` woff2 font face (one of the Catalog's bundled fonts, injected into a Mockup by hand) reaches status `loaded`. No console errors. Note: none of the Mockups I sampled carried an `@font-face`, because the frames I grabbed used system fonts, so I injected one to test.
- `theme.ts:41`: token values come from `deriveTokens` over params that the project format restricts to fixed enumerations (`engine.ts:565`); the `[<>{};]` filter is a second wall. I found no path from stored text into the Studio's own style.
- A stored project with an unknown key keeps exactly one copy, not one per open: 3 reloads produced 1 kept copy (removal of duplicates by text works).
- An unreadable stored copy plus full storage: the Studio holds saving and labels its button "…discard…" honestly; it does not claim to have kept a copy (but see S3-02).
- `canonical` / `changedOnOpening` (`store.ts:136-148`): deep nesting raises a RangeError inside a `try` and is treated as "changed" (one kept copy). `__proto__` keys become own data properties through `Object.fromEntries` and `JSON.parse`, with no prototype change (reasoned from the language rules, not run against the page).
- `readBackups` on stored text that is not JSON, a JSON `null`, a primitive, or an object without `text`: wraps the whole stored text as one copy and keeps it on the next write (by code reading; the not-JSON case is covered by the existing e2e test).
- Kept-copy reasons and times reach the page only as React text (`App.tsx:695`); copy text is never rendered.
- `SECTION_WORDS` (`engine.ts:613-622`, `:713-715`): the message is chosen from fixed words by an exact match on a known section name; nothing from the file reaches the message.
- `keptCopyFile` on deeply nested or huge JSON: a stringify failure falls into the `catch` and the raw text downloads; no throw reaches the click handler (by code reading).
- A 4.9 MB hostile kept copy did not stop the Studio from opening, saving, or adding another copy (T6).

## Not done

- The two-tab race (S3-06) was not reproduced.
- The page-database variants of S3-01 and S3-02 (the hosted page) were inferred from code, not run with the `pageDb` stand-in.
- "Start again from …", "Open a project file", and "Keep this tab's copy" under full storage were not run separately (same function, same ignored result as the reproduced path).
- I did not run `npm run check` or the e2e suite.
- I did not review the plain-language rewrite of Catalog text (`steps.ts`, `rules.ts`, `words.ts`) for anything beyond whether it reaches the page as text.
