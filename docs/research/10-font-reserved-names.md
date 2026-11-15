# Reserved Font Names in the bundled fonts

> Research record, 2026-11-13, for audit finding L-03. It reports what the sources say; it is not legal advice. **[full]** marks a source read in full (licence files: header read, body compared by a program with this repository's copy). **[snippet]** marks search snippets only. Nothing here rests on memory.

## What the font files declare

A Reserved Font Name is a name that the copyright holder keeps for the original font. `THIRD_PARTY_NOTICES.md` quotes the copyright notice inside each of the 13 shipped font files **[full]**.

- **Playfair Display** declares one: `Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display".`
- **Source Serif 4** declares one: `© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.`
- **The other 11 declare none:** Bricolage Grotesque, DM Sans, Fraunces, Instrument Sans, Inter, JetBrains Mono, Manrope, Newsreader, Outfit, Public Sans, Space Grotesk.

Each shipped file is a Latin subset (part of the font's characters) in WOFF2, a compressed web format. The Studio's names for both fonts contain the reserved names (`packages/core/src/params.ts`).

## What the licence and its FAQ say

Condition 3 of the licence bars a "Modified Version" from using a Reserved Font Name without the copyright holder's written permission; the definition of that term includes "deleting" parts and "changing formats" (`THIRD_PARTY_NOTICES.md`) **[full]**.

SIL, which wrote the licence, answers common questions in the OFL FAQ, version 1.1-update7 (<https://raw.githubusercontent.com/silnrsi/font-gentium/master/OFL-FAQ.txt>) **[full]**:

- Entry 2.6: removing parts of a font for the web "is considered modification. This is permitted by the OFL but would not normally allow the use of RFNs."
- Entry 2.2.1, on WOFF and WOFF2: the name may stay "only if the original font data remains unchanged except for WOFF compression".
- Entry 2.7 advises a web font service to "sign a separate agreement with the author(s) that allows the use of RFNs for Modified Versions."

From the OFL FAQ (OFL-FAQ.txt), copyright (c) 2005-2023 SIL International. Used by permission. https://openfontlicense.org/OFL-FAQ

## What the upstream projects say

- **Adobe:** the licence file reserves ‘Source’ and calls it a trademark (<https://raw.githubusercontent.com/adobe-fonts/source-serif/main/LICENSE.md>) **[full]**. The README (<https://raw.githubusercontent.com/adobe-fonts/source-serif/release/README.md>) and the wiki readme (<https://raw.githubusercontent.com/wiki/adobe-fonts/source-serif/Source-Serif-Readme.md>) add no permission **[full]**. Google Fonts' copy of the licence file leaves the reservation out (<https://raw.githubusercontent.com/google/fonts/main/ofl/sourceserif4/OFL.txt>) **[full]**; the font file keeps it.
- **Playfair Display:** the source repository that Google Fonts names (<https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/METADATA.pb>) reserves the name (<https://raw.githubusercontent.com/aaronbell/Playfair-Display/master/OFL.txt>) **[full]**. The designer's newer family, Playfair, reserves none (<https://raw.githubusercontent.com/clauseggers/Playfair/master/OFL.txt>) **[full]**.
- **Google Fonts**, which both Fontsource packages name as their source (`metadata.json` in each package): "If you modify those fonts, please take care of this important detail." (<https://raw.githubusercontent.com/google/fonts/main/README.md>) **[full]**.
- **Fontsource** states no permission; its README tells readers to read each font's licence (<https://raw.githubusercontent.com/fontsource/fontsource/main/README.md>) **[full]**.

## Established, not established, options

**Established.** Two shipped font files declare Reserved Font Names. The FAQ treats subsetting as modification. No source read here gives Fontsource, the Studio or the public permission to use either name on a subset.

**Not established.**

- Whether Adobe or the Playfair Display authors made an agreement with Google, and whether it would cover files that Fontsource and the Studio pass on. Font Bakery, a checking tool with rules for Google Fonts, lists families allowed a reserved name; the list omits both fonts and says it "still needs to be more carefully reviewed" (<https://raw.githubusercontent.com/fonttools/fontbakery/main/Lib/fontbakery/data/googlefonts/reserved_font_name_exceptions.txt>) **[full]**. Four web searches found no statement of an agreement (search results only; no page opened) **[snippet]**.
- Whether a font inlined in the Studio's script counts as "embedded" in a document; FAQ entries 1.11 and 1.12 apply different rules to that case.
- What `openfontlicense.org` (the paper "Webfonts and Reserved Font Names"), the Google Fonts Guide and GitHub issue pages say. This machine could not open them.

**Options.**

1. Keep both fonts. The question stays open.
2. Replace the two typefaces with fonts that declare no reserved name. Playfair is a candidate; nobody has yet read its shipped font file.
3. Ask the copyright holders in writing: Adobe, and the Playfair Display authors.

FAQ entry 3.1 names one more route: rename the Modified Version, which means rebuilding both font files.

## The owner's decision of 2026-11-15, and what was read for it

**Decision (D55, D56).** Replace both typefaces: Playfair (the file with the size axis) for Playfair Display; Literata for Source Serif 4.

**What "reads the notice inside the font file" means.** A font file holds a table of labelled texts; text number 0 is the copyright notice. The builder read that text from each candidate's shipped file with the same steps that `scripts/make-notices.mjs` uses (unpack the WOFF2 file, find the `name` table, decode record 0). The same reader gave the known notices of the two typefaces of today, word for word, which shows that it reads correctly. **[full]** for each line below; packages `@fontsource-variable/<name>` at version 5.3.0, file `<name>-latin-wght-normal.woff2` unless stated.

| Typeface | Copyright notice inside the file | Reserves a name |
|---|---|---|
| Playfair Display (today) | `Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display".` | yes |
| Source Serif 4 (today) | `© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.` | yes |
| **Playfair** (chosen; also its file `playfair-latin-opsz-normal.woff2`, which is the one that ships) | `Copyright 2005 The Playfair Project Authors (https://github.com/clauseggers/Playfair)` | no |
| **Literata** (chosen) | `Copyright 2017 The Literata Project Authors (https://github.com/googlefonts/literata)` | no |
| Crimson Pro | `Copyright 2018 The Crimson Pro Project Authors (https://github.com/Fonthausen/CrimsonPro)` | no |
| Noto Serif | `Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)` | no |
| EB Garamond | `Copyright 2017 The EB Garamond Project Authors (https://github.com/octaviopardo/EBGaramond12)` | no |
| Bitter | `Copyright 2011 The Bitter Project Authors (https://github.com/solmatas/BitterPro)` | no |
| Roboto Serif | `Copyright 2020 The Roboto Serif Project Authors (https://github.com/googlefonts/RobotoSerif)` | no |
| Lora | `Copyright 2011 The Lora Project Authors (https://github.com/cyrealtype/Lora-Cyrillic), with Reserved Font Name "Lora".` | yes; ruled out |

The licence files of the two chosen packages name no Reserved Font Name either (first lines read; the words "Reserved Font Name" occur only in the licence's own definitions) **[full for the first lines; the licence body was searched, not read line by line]**.

**What this does not establish.** Whether a notice without the words "Reserved Font Name" could still be read as reserving a name by some other document of the copyright holder. The builder found none in the two packages and did not search the two source repositories. This record is not legal advice.

**How the owner chose.** From one rendered picture with the same words, sizes, and weights in every row. The file with the size axis is 110 KB (Playfair Display: 38 KB); Literata is 52 KB (Source Serif 4: 51 KB).
