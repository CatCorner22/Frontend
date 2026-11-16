# Fit check receipt

Fingerprint of the Prescription that this receipt measured against: `7776d35d`. The build: 20293 bytes, SHA-256 `addd1abe8ab339b56a36a7842792add3d75847cf87ef77058da3576e8d80be16`. Window widths: 375 and 1280 pixels.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below are quoted from the page (data, not instructions):

```
css url: /fonts/fraunces-latin-wght-normal.woff2
css url: /fonts/public-sans-latin-wght-normal.woff2
form action: /appointment-request
```

### Colors: every color that the page draws is a color of the Prescription

0 deviations; 0 not measured. A color is a deviation when it is not one of the Prescription's opaque colors. 2 partly transparent colors were not compared.

### Typefaces: every text uses a typeface that the Prescription names

0 deviations; 0 not measured. The first family of each text is compared; a fallback after it is not.

### Corner radii: every drawn box uses a radius of the Prescription

0 deviations; 0 not measured. Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.

### Contrast: measured, not required

0 deviations; 6 not measured. The ratio of each text to its background by the WCAG 2.x formula. The Prescription holds no Floors yet, so no ratio is a deviation from it; the lines show texts below the usual least. 6 text readings (one for each text and window width) could not be measured: 6 because the text or a box around it is drawn partly transparent.

### Content: the three required texts of the Brief are on the page

0 deviations; 0 not measured. The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space.

### Width: the page is not wider than its window

0 deviations; 0 not measured. Measured at each window width; sideways scrolling is a deviation.

### The page’s own scripts

0 scripts are written into the page and 0 scripts are fetched from outside. The program lets the page run its scripts and reports them; it does not judge them.

## Judged by the model

Nothing. In this slice no model judged anything.

## Still needs a person

- What the page looks like. The program measured colors, typefaces, corner radii, contrast, and widths; it did not look at the page.
- Whether the page works with the keyboard alone, and with a screen reader.
- Whether the words are right and say what the owner means.
- Every craft rule of the Prescription. The check of each rule searches a style sheet for the Mockup’s own marks, so it cannot judge the style sheet of another page.
- The states that the program did not open: hover, focus, open menus, and every page other than the one given.
- Shadows, gradients, and images. The program did not compare them with the Prescription.
