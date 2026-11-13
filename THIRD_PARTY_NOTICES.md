# Third-party notices

**What this file is.** The Studio's page carries work that other people made: 13 font files and 5 code packages. This file names each one, gives its copyright notice (the line that says who holds the rights to the work) in full, and ends with the complete text of each licence (the terms on which the copyright holder lets others use the work).

**Why it exists.** The two licences, the SIL Open Font License 1.1 and the MIT License, allow the Studio to carry this work and pass it on. Both set one condition: the copyright notice and the licence text travel with every copy. The build shrinks the Studio's code into one script, and nobody can rely on comments surviving that step. So the notices live in two generated files: this one, for the repository, and `apps/studio/src/notices.generated.ts`, which holds the same notices and licence texts as data for the Studio to show on its page.

**How it is made.** `node scripts/make-notices.mjs` writes both files; do not edit either by hand. `node scripts/make-notices.mjs --check` writes nothing: it reports whether each file still matches what the script would write, and exits with an error code if one does not. An automated check can run it to catch a stale file.

**Where each fact comes from.** The script reads files in this repository and in `node_modules` (the folder of installed packages; an npm package is a published bundle of files with a name and a version). It reads nothing from the network.

- *Which fonts ship:* the import lines of `apps/studio/src/fonts.ts`. Each line names one font file.
- *Which code packages ship:* a list in the script (`react`, `react-dom`, `scheduler`, `zod` and `zustand`). The script also follows the Studio's dependencies (the packages that the Studio needs in order to run, and the packages that those need). It stops with an error if it finds a package that neither list covers.
- *The copyright notice of a font:* the font file itself. A font file holds labelled texts called name records: record 0 is the copyright notice, record 13 describes the licence, and record 14 gives the licence's web address. The script also reads the copyright notice at the top of the package's licence file (the file named `LICENSE`, or similar, inside the package), and this file says whether the two agree.
- *The copyright notice of a code package:* the package's licence file.
- *Version, licence name and source repository:* each package's `package.json`, the file in which a package describes itself. The script also checks that each licence file carries the heading of the named licence, and that all packages under one licence carry the same licence text (the copyright notice aside).

**What the script does not check.** It does not inspect the built page. It copies each notice as written; it cannot judge whether a notice is correct, or whether the Studio meets every condition of a licence. It covers the font files and code packages listed here and nothing else. Anything else that the repository takes from other people (text, recipes or formulas copied by hand, for example) needs its own record, because this script cannot see it.

## Fonts

The Studio ships 13 font files in the WOFF2 format (a compressed font format for the web). Each comes from the npm package named in its section. Every one is under the SIL Open Font License 1.1; the full text stands at the end of this file.

Each section quotes what the font file says about itself. The heading of a section is the family name that the package's `metadata.json` gives. Name record 1 inside a font file does not always match that name (`Bricolage Grotesque 96pt ExtraBold` under Bricolage Grotesque, for example); the section quotes the record as it stands.

**Reserved Font Names.** A copyright holder may reserve a font's name. Condition 3 of the licence then limits who may use that name. It reads: `3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.` The licence defines the term that the condition rests on: `"Modified Version" refers to any derivative made by adding to, deleting, or substituting -- in part or in whole -- any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.`

Of the 13 fonts below, 2 declare a Reserved Font Name. The declaring notices, word for word:

- Playfair Display: `Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display".`
- Source Serif 4: `© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.`

This file records each declaration. It does not judge whether the Studio's use of a font meets condition 3. `docs/research/10-font-reserved-names.md` records what the project has established about that question, and what it has not.

### Bricolage Grotesque

- **Package:** `@fontsource-variable/bricolage-grotesque`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/bricolage-grotesque-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `Bricolage Grotesque 96pt ExtraBold`
  - Version (name record 5): `Version 1.001;gftools[0.9.33.dev8+g029e19f]`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)`
- **Do the two notices agree?** Yes.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/bricolage-grotesque` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### DM Sans

- **Package:** `@fontsource-variable/dm-sans`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/dm-sans-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2014 The DM Sans Project Authors (https://github.com/googlefonts/dm-fonts)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `DM Sans 9pt`
  - Version (name record 5): `Version 4.004;gftools[0.9.30]`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2014 The DM Sans Project Authors (https://github.com/googlefonts/dm-fonts) DMSans-Italic[opsz,wght].ttf: Copyright 2014 The DM Sans Project Authors (https://github.com/googlefonts/dm-fonts)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `DMSans-Italic[opsz,wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/dm-sans` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Fraunces

- **Package:** `@fontsource-variable/fraunces`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/fraunces-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `Fraunces`
  - Version (name record 5): `Version 1.000;[b76b70a41]`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces) Fraunces-Italic[SOFT,WONK,opsz,wght].ttf: Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `Fraunces-Italic[SOFT,WONK,opsz,wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/fraunces` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Instrument Sans

- **Package:** `@fontsource-variable/instrument-sans`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/instrument-sans-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2022 The Instrument Sans Project Authors (https://github.com/Instrument/instrument-sans)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `Instrument Sans`
  - Version (name record 5): `Version 1.000;gftools[0.9.28]`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2022 The Instrument Sans Project Authors (https://github.com/Instrument/instrument-sans) InstrumentSans-Italic[wdth,wght].ttf: Copyright 2022 The Instrument Sans Project Authors (https://github.com/Instrument/instrument-sans)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `InstrumentSans-Italic[wdth,wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/instrument-sans` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Inter

- **Package:** `@fontsource-variable/inter`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/inter-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://openfontlicense.org`
  - Family name (name record 1): `Inter`
  - Version (name record 5): `Version 4.001;git-66647c0bb`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter) Inter-Italic[opsz,wght].ttf: Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `Inter-Italic[opsz,wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/inter` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### JetBrains Mono

- **Package:** `@fontsource-variable/jetbrains-mono`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/jetbrains-mono-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `JetBrains Mono`
  - Version (name record 5): `Version 2.211`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) JetBrainsMono-Italic[wght].ttf: Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `JetBrainsMono-Italic[wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/jetbrains-mono` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Manrope

- **Package:** `@fontsource-variable/manrope`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/manrope-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `http://scripts.sil.org/OFL`
  - Family name (name record 1): `Manrope ExtraLight`
  - Version (name record 5): `Version 4.504`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)`
- **Do the two notices agree?** Yes.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/manrope` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Newsreader

- **Package:** `@fontsource-variable/newsreader`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/newsreader-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2020 The Newsreader Project Authors (http://github.com/productiontype/Newsreader)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `http://scripts.sil.org/OFL`
  - Family name (name record 1): `Newsreader 16pt 16pt`
  - Version (name record 5): `Version 1.003`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2020 The Newsreader Project Authors (http://github.com/productiontype/Newsreader) Newsreader-Italic[opsz,wght].ttf: Copyright 2020 The Newsreader Project Authors (http://github.com/productiontype/Newsreader)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `Newsreader-Italic[opsz,wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/newsreader` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Outfit

- **Package:** `@fontsource-variable/outfit`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/outfit-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `Outfit Thin`
  - Version (name record 5): `Version 1.100;gftools[0.9.27]`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts)`
- **Do the two notices agree?** Yes.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/outfit` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Playfair Display

- **Package:** `@fontsource-variable/playfair-display`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/playfair-display-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display".`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `http://scripts.sil.org/OFL`
  - Family name (name record 1): `Playfair Display`
  - Version (name record 5): `Version 1.203`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display". PlayfairDisplay-Italic[wght].ttf: Copyright 2017 The Playfair Display Project Authors (https://github.com/clauseggers/Playfair-Display), with Reserved Font Name "Playfair Display".`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `PlayfairDisplay-Italic[wght].ttf:`.
- **Reserved Font Name:** `Playfair Display` (the font file and the `LICENSE` file both declare it)
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/playfair-display` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Public Sans

- **Package:** `@fontsource-variable/public-sans`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/public-sans-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2015 The Public Sans Project Authors (https://github.com/uswds/public-sans)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `SIL Open Font License, Version 1.1: https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL_web; USWDS Modified Version: https://github.com/uswds/public-sans/blob/master/LICENSE.md`
  - Family name (name record 1): `Public Sans Thin`
  - Version (name record 5): `Version 2.001`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2015 The Public Sans Project Authors (https://github.com/uswds/public-sans) PublicSans-Italic[wght].ttf: Copyright 2015 The Public Sans Project Authors (https://github.com/uswds/public-sans)`
- **Do the two notices agree?** Yes. The `LICENSE` file repeats the notice after the label `PublicSans-Italic[wght].ttf:`.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/public-sans` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Source Serif 4

- **Package:** `@fontsource-variable/source-serif-4`, version `5.3.1`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/source-serif-4-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `http://scripts.sil.org/OFL`
  - Family name (name record 1): `Source Serif 4`
  - Version (name record 5): `Version 4.004;hotconv 1.0.116;makeotfexe 2.5.65601`
- **Copyright notice in the package's `LICENSE` file:** `Google Inc.`
- **Do the two notices agree?** No. This file records both.
  - Only the font file gives: `© 2014 - 2021 Adobe Systems Incorporated (http://www.adobe.com/), with Reserved Font Name ‘Source’.`
  - Only the `LICENSE` file gives: `Google Inc.`
- **Reserved Font Name:** `Source` (the font file declares it; the `LICENSE` file does not)
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/source-serif-4` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

### Space Grotesk

- **Package:** `@fontsource-variable/space-grotesk`, version `5.3.0`
- **Licence:** SIL Open Font License 1.1 (`OFL-1.1`), as the package's `package.json` and `LICENSE` file state
- **Font file that ships:** `files/space-grotesk-latin-wght-normal.woff2`
  - Copyright notice (name record 0): `Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk)`
  - Licence description (name record 13): the file has none
  - Licence address (name record 14): `https://scripts.sil.org/OFL`
  - Family name (name record 1): `Space Grotesk Light`
  - Version (name record 5): `Version 2.000`
- **Copyright notice in the package's `LICENSE` file:** `Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk)`
- **Do the two notices agree?** Yes.
- **Reserved Font Name:** none declared in the font file or in the `LICENSE` file
- **Source repository:** <https://github.com/fontsource/font-files>, directory `fonts/variable/space-grotesk` (from the package's `package.json`). The package's `metadata.json` names <https://github.com/google/fonts> as the source of the font.

## Code packages

The Studio needs 5 code packages in order to run: its own dependencies, and theirs. A build tool copies such code into the page's script, so this file treats all 5 as shipped. Every one is under the MIT License; the full text stands at the end of this file.

### react

- **Package:** `react`, version `19.3.1`
- **Licence:** MIT License (`MIT`), as the package's `package.json` and `LICENSE` file state
- **Copyright notice** (from the package's `LICENSE` file): `Copyright (c) Meta Platforms, Inc. and affiliates.`
- **Source repository:** <https://github.com/react/react>, directory `packages/react` (from the package's `package.json`).

### react-dom

- **Package:** `react-dom`, version `19.3.1`
- **Licence:** MIT License (`MIT`), as the package's `package.json` and `LICENSE` file state
- **Copyright notice** (from the package's `LICENSE` file): `Copyright (c) Meta Platforms, Inc. and affiliates.`
- **Source repository:** <https://github.com/react/react>, directory `packages/react-dom` (from the package's `package.json`).

### scheduler

- **Package:** `scheduler`, version `0.28.0`
- **Licence:** MIT License (`MIT`), as the package's `package.json` and `LICENSE` file state
- **Copyright notice** (from the package's `LICENSE` file): `Copyright (c) Meta Platforms, Inc. and affiliates.`
- **Source repository:** <https://github.com/react/react>, directory `packages/scheduler` (from the package's `package.json`).

### zod

- **Package:** `zod`, version `4.6.7`
- **Licence:** MIT License (`MIT`), as the package's `package.json` and `LICENSE` file state
- **Copyright notice** (from the package's `LICENSE` file): `Copyright (c) 2025 Colin McDonnell`
- **Source repository:** <https://github.com/colinhacks/zod> (from the package's `package.json`).

### zustand

- **Package:** `zustand`, version `5.1.0`
- **Licence:** MIT License (`MIT`), as the package's `package.json` and `LICENSE` file state
- **Copyright notice** (from the package's `LICENSE` file): `Copyright (c) 2019 Paul Henschel`
- **Source repository:** <https://github.com/pmndrs/zustand> (from the package's `package.json`).

## Full licence texts

### SIL Open Font License 1.1 (`OFL-1.1`)

This licence covers Bricolage Grotesque, DM Sans, Fraunces, Instrument Sans, Inter, JetBrains Mono, Manrope, Newsreader, Outfit, Playfair Display, Public Sans, Source Serif 4 and Space Grotesk.

Each font package carries the text below in its licence file, after its own copyright notice. The script compared the 13 copies and found them identical. The copyright notice of each font stands in its section above.

```text
This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

### MIT License (`MIT`)

This licence covers `react`, `react-dom`, `scheduler`, `zod` and `zustand`.

Each code package carries the text below in its licence file. The script compared the 5 copies: they are identical except for the copyright notice. In the text below, the line in square brackets stands where that notice goes. The copyright notice of each package:

- `react`, `react-dom` and `scheduler`: `Copyright (c) Meta Platforms, Inc. and affiliates.`
- `zod`: `Copyright (c) 2025 Colin McDonnell`
- `zustand`: `Copyright (c) 2019 Paul Henschel`

```text
MIT License

[The copyright notice of each package stands here. The entry of each package gives its notice.]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
