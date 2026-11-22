# Fonts for this design

This file belongs to a Vision from Frontend Focus Studio. It tells an AI coding tool, and the owner, which typefaces the design uses and how the built site ships them.

Fingerprint of the design values: `0059c6f8`. Every file of this Vision carries the same eight characters; where one differs, the files do not belong together.

## Rules

1. Ship every font file from the site’s own address. Load no font from another site: no font service, no content delivery network.
2. Use the variable file of a typeface: one file holds every weight.
3. Write `font-display: swap`, so that text shows at once in a fallback and changes when the file has arrived.
4. Keep each typeface’s licence text with its files. The packages below hold it.
5. The files named here hold the Latin letters. A site in another script needs that script’s file from the same package.

## The typefaces

### Public Sans (headings and reading text)

- CSS family: `Public Sans Variable`
- Fallbacks, in order: `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif`
- Licence: OFL-1.1 (the SIL Open Font License: free to use, to ship, and to change; the licence text stays with the files).
- Package: `@fontsource-variable/public-sans`, version 5.3.0. This is the version that the Studio itself ships, so its files are the ones that the preview drew.
- File in the package: `files/public-sans-latin-wght-normal.woff2`

```css
@font-face {
  font-family: "Public Sans Variable";
  src: url("/fonts/public-sans-latin-wght-normal.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

The address `/fonts/` is an example: put the files where the site keeps its own files, and write that address.
