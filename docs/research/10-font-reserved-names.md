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
