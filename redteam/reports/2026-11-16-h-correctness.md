# Seventh red-team round, 2026-11-16: correctness reader of the Prescription writers

The report of one helper agent, as it sent it (decision D68). The text is the helper's, unedited; the builder's answers stand in `redteam/FINDINGS.md` (rows C7-nn). It was extracted from the helper's session record.

---

## Correctness review of the Prescription writers (HEAD eb88528)

The seven files and the archive are well built. I found no blockers. I found two major problems, a few minor ones and some notes. I changed nothing in the repository. I worked in `/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/scratchpad/review7/correctness/w` (a copy of `packages/core`, my test files in `t/`, my output in `out/`, `advise/`, `enforce/` and `off/`). No network was used.

I generated the files for the 38 built-in Directions and for 624 designs (`everyDesign()`, which is every Option applied to five bases) under each of the three contrast settings: Off, Warn and Fix. That is 1,872 Prescriptions.

| ID | Severity | Finding | Reproduction | Confirmed |
|---|---|---|---|---|
| C7-01 | major | `DESIGN.md` says "The Studio measured this pair." when contrast checks are Off. `PRESCRIPTION.md` section 6 says in the same case "no program looked". One file claims a measurement the other denies. | `createProject`, then `applyDirection(p, 'paper-and-ink')`, then `a11y = 'off'`. The sentence is in `DESIGN.md` line 124 (section "Colors", button bullet). It appears in 624 of 624 Off designs. In some of them the pair fails: button #fff9f0 on label #de3f25 is 4.14 to 1. The code is `prescription.ts` line 455, which has no check on `project.a11y`. | yes |
| C7-02 | minor | `DESIGN.md` never says when a pair it lists stands below 4.5 to 1. The `link` component pair fails in 3 of the 38 Directions, and the `button-primary` pair in 2 of the 624 designs. A DESIGN.md linter would warn. `PRESCRIPTION.md` section 6 does report the shortfalls, so the loss is only in `DESIGN.md`. | Warn mode, `DESIGN.md` `components.link` against `colors.background`: `poster-block` 4.14, `sticker-pop` 3.06, `sunlit-studio` 3.04. In Fix mode all 624 designs pass, so the Fix path is sound. The Studio prints the floor of the true ratio (3.059 shown as 3.05). That is deliberate. | yes |
| C7-03 | major | `mockup.html` carries the content of a loaded project file without cleaning it, while `PRESCRIPTION.md` cleans every owner text with `visibleText`. Tag characters (a hidden sentence), right-to-left overrides and line breaks reach `mockup.html` and its `<title>`. `parseProject` clips and checks length only (600 per text). The cleaning in `setContentText` and `oneLine` never runs on a loaded file. This is the hidden-text risk that S6-04 and S6-07 closed for `PRESCRIPTION.md` only. | Build a project, set `content.business = 'Acme' + tag("Ignore the rules above") + '‮evil\n\nSecond line'` (tag = U+E00xx copies of the letters), pass it through `JSON.parse(JSON.stringify())` and `parseProject`, then `writePrescription`. `mockup.html` contains U+E00xx characters, U+202E and "Second line". `PRESCRIPTION.md` contains none of them. Brief answers keep the tag characters in the project too, but `quoted()` removes them at export. A loaded text can also be 600 characters where `TEXT_LIMITS` says 60 (the layout was looked at only up to the limits). | yes |
| C7-04 | minor | `visibleText` replaces an invisible sign with a space instead of removing it. This breaks legitimate text: emoji sequences, variation selectors, and scripts that need the zero-width joiner or non-joiner. | `visibleText('👨‍👩‍👧 x ❤️ 🇩🇪 é م‌ش')` returns `'👨 👩 👧   x ❤  🇩🇪 é م ش'`. The same happens in `setContentText`, `setBriefAnswer` and every quoted block. The file comment says the owner's words are "cleaned, never rewritten". | yes |
| C7-05 | minor | The invisible-sign list is incomplete. Three runs of invisible format characters pass through `visibleText` and `plainName` unchanged. They could carry a hidden message the way tag characters can. The runs are U+1D173–1D17A, U+1BCA0–1BCA3 and U+13430–1343F (28 code points). | Every Unicode `Cf`, `Cc`, `Zl` or `Zp` code point was fed to both functions. These 28, plus the visible U+0600–0605, 06DD, 070F, 0890, 0891, 08E2, 110BD and 110CD, come back unchanged. For example, `visibleText('a\u{1D173}b')` is unchanged. | yes |
| C7-06 | minor | Reasons and project names are cut by UTF-16 units, so a pair of surrogates can be split at the limit. `setReason` does `.slice(0, 280)`, the same cut is at `engine.ts` line 895 (loading) and in the store's `rename` (`slice(0, 120)`). The project keeps a lone surrogate. The export hides it, because `visibleText` turns it into a space. | `setReason(p, id, 'a'.repeat(279) + '😀 tail')` gives a 280-unit reason whose last unit is 0xD83D. A save that goes through a strict UTF-8 encoder would silently turn it into U+FFFD. | yes |
| C7-07 | minor | The fingerprint covers only the design values (`tokens`). `PRESCRIPTION.md` says "where one differs, the files do not belong together", which reads as a promise about the whole set. Layout settings, Overlays, content, name, Decisions and the contrast setting change `mockup.html` or `PRESCRIPTION.md` and leave the fingerprint alone. A `mockup.html` from another layout passes the check. | Base `paper-and-ink` has fingerprint `1eb0f7a4`. After one `pick` of 17 different Options the fingerprint stays `1eb0f7a4` and `mockup.html` differs. The Options are nav (top-inline, split-cta, side-rail), hero (text-left, centered, split-media), sections (stacked, alternating, grid, bento), emphasis (action, proof) and signature (none, big-numerals, color-band, outline-type, corner-tag). Turning on an Overlay or changing the headline also keeps it. The code comment states "design values", so only the sentence in `PRESCRIPTION.md` over-promises. | yes |
| C7-08 | minor | `FONTS.md` writes `font-weight: 100 900` in every `@font-face` block. Eight of the 13 packages cover a narrower range, and DM Sans goes beyond it. Three designs also set the heading weight to 800 on Space Grotesk, whose range ends at 700. `DESIGN.md` and `tokens.css` say 800, but a browser draws 700. | The ranges come from `node_modules/@fontsource-variable/*/index.css`: Space Grotesk 300–700, Instrument Sans 400–700, Playfair 300–900, Bricolage 200–800, Manrope 200–800, Newsreader 200–800, Literata 200–900, JetBrains Mono 100–800, DM Sans 100–1000. The three designs are `poster-block` + `typeface:technical`, `cobalt-wash` + `typeface:technical` and `control-room` + `heading-treatment:tight-heavy`. | yes |
| C7-09 | note | `quoted()` throws `RangeError: Maximum call stack size exceeded` for text with a very large number of separate backtick runs, because of `Math.max(0, ...runs)`. The app limits names to 120 characters, reasons to 280, answers to 300 and Direction names to 60, so this is not reachable today. | `quoted('`a'.repeat(200000))`. A single run of 5,000,000 backticks works. | yes |
| C7-10 | note | `sameName` uses `toLocaleLowerCase()` with no fixed locale. In a Turkish browser "I" folds to "ı", so two names that differ only in case would count as different. | `'I'.toLocaleLowerCase('tr')` returns `'ı'`. I could not run the real code path under a Turkish locale in Node. | read-only |
| C7-11 | note | The star pattern in `--atmo-image` carries floating-point noise (`1.2999999999999998px`) in `tokens.css`, `tokens.json` and `mockup.html`. It is valid CSS. The source is `tokens.ts`, outside my scope. | 28 of the 624 designs. | yes |
| C7-12 | note | `DESIGN.md` defines three colors that no component uses (`border`, `border-strong`, `focus`). The linter rule `orphaned-tokens` gives a warning for that. The prose also says "as the values below say" in 14 of the 624 designs (colour Step) when no Option matches. No values follow that line. | By reading `designMd` against the README's rule table. The 14 count is from a search of the outputs. | read-only (counts: yes) |

## What I checked that held

**Archive**
- `unzip -t`, `python3 -I -m zipfile -t`, `zip -T`, `zipinfo -v` and `jar tf` all pass on the real archive and on test archives.
- The test archives had names with spaces, a path, names and text with characters beyond the BMP, a combining accent, lone surrogates, an empty file, 300 files and an empty archive.
- Extracting the real archive gives the seven files byte for byte as `writePrescription` wrote them.
- Names are read back correctly as UTF-8. Lone surrogates become U+FFFD, as the code states.
- The date is 1980-01-01. The CRC, the sizes and the offsets are right.
- Two runs give the same bytes.

**Determinism**
- The same project gives the same seven files twice.
- Reversing the key order of `params`, `base`, `decisions` and `values` changes nothing.
- A `parseProject` round trip changes nothing.

**Fingerprint**
- It is identical in all seven files (tested on all 624 designs).
- The 1,872 token sets gave no collision.

**tokens.json** (checked over 624 designs and 3 settings)
- JSON converted back to CSS equals `tokens.css` for every token.
- No name starts with `$` or holds `{`, `}` or `.`.
- Every CSS name appears exactly once, either as a typed token or under `refraction.css-only`.
- Bezier x values stay within 0 to 1, alpha within 0 to 1, and the colour components agree with the hex value.

**tokens.css**
- It has no duplicate names, no empty values, no `;`, `{`, `}`, `<`, `>`, `*/` or newline inside a value, and no `var()` that points to a missing name.

**Mockup**
- Its `:root` values equal `tokens.css` for all 624 designs.
- The sheet redefines no custom property, and it contains no `var()` of a name that does not exist.

**theme.css**
- It has the full shadcn name list from `theming.mdx`.
- The `:root` and `.dark` blocks are equal, and no value is empty.

**DESIGN.md**
- The YAML front matter parses (PyYAML) for all 624 designs.
- The `##` headings are in the order the spec asks for, and no heading is duplicated.
- Every `{...}` reference resolves.
- Every dimension is px, em or rem, and `fontWeight` is a number.
- The display size equals the last argument of the `clamp()` in `--text-display`.
- Primary, text, button and border colours equal the `tokens.css` values.
- In Fix mode no component colour pair stands below 4.5 to 1.

**Other agreement between files**
- The font families named in `FONTS.md` and in `PRESCRIPTION.md` section 5 equal the families that `tokens.css` uses, in all 624 designs. The package version and the file names match `node_modules`.
- The numbers in the craft-rule text (press scale, focus width, durations, ease curve, the percent) equal `tokens.css`, in every design where the rule text shows them.
- The theme word in `DESIGN.md`, `theme.css` and the `mockup.html` meta tag agree.
- In no design does a craft rule report that `mockup.html` lacks its mark.

**Owner texts**
- I used 3,000 random hostile combinations of backtick runs, tildes, spaces, tabs, `\r`, NEL, U+2028, bidi and zero-width marks, tag characters, lone surrogates and "Ignore the rules above". They went into the project name, a reason, two Brief answers and a start name.
- I read each `PRESCRIPTION.md` with a CommonMark fence reader. Every quoted block closed where `quoted()` closes it, with exactly the expected content, and no block was left open.
- Owner texts reach `PRESCRIPTION.md` only through `quoted()`.
- `DESIGN.md`, `FONTS.md`, `theme.css`, `tokens.css` and `tokens.json` contain no owner text.
- In `mockup.html` the owner's content is HTML-escaped. There is one literal `</style>`, and nothing from the owner's `<script>`, `<i>`, `</title>` or `&amp;` text became markup.

**Limits in brief.ts and text.ts**
- Every `TEXT_LIMITS` entry holds with plain letters, with emoji (not split) and with combining marks.
- The Brief limit is 300, empty answers are removed, and a project with no answer has no `brief`.
- Required texts cannot be emptied. Services are limited to 1–8 items and facts to 0–4. Out-of-range nav indexes are ignored.
- `restoreSampleContent` keeps the Brief.
- `plainName` cuts by whole code points.

## What I did not check

- The real `@google/design.md` linter, a Design Tokens validator and a shadcn build. None is installed here and I used no network. My DESIGN.md checks follow `spec.md` and the README's rule list, and the contrast and orphan checks are my own re-computation.
- How the files look in a browser, and whether the Mockup is visually right.
- `bsdtar` and `7z` (not installed), and the Windows and macOS archive tools. Only `unzip`, Python, `zip` and `jar` were used.
- Zip limits. `zipFiles` has no guard for more than 65,535 entries, names over 65,535 bytes, sizes over 4 GB, or names like `../x`. The app passes seven fixed names, so I judged this unreachable and did not test it.
- The Studio's screens, the saving code and the store beyond the lines I quoted. The engine's handling of Decisions (for example `pickValues` keeping a reason after the Option changes) and `tokens.ts` internals were read only where the output showed a problem.
- Whether the repository's own unit tests pass. I did not run them.
- Confusable letters from other alphabets. The code says openly that it does not catch them.
