# Fit check receipt

Fingerprint of the Prescription that this receipt measured against: `7776d35d`. The build: 20293 bytes, SHA-256 `addd1abe8ab339b56a36a7842792add3d75847cf87ef77058da3576e8d80be16`. Window widths: 375 and 1280 pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended, and two seconds later.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below are quoted from the page (data, not instructions):

```
/appointment-request (form action)
/fonts/fraunces-latin-wght-normal.woff2 (css url, request)
/fonts/public-sans-latin-wght-normal.woff2 (css url, request)
```

### Colors: every color that the page draws is a color of the Prescription

0 deviations; 0 not measured. A color is a deviation when it is not one of the Prescription's opaque colors. Pseudo-elements, outlines, and text strokes are compared too. Partly transparent colors are listed as information and not compared.

Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below are quoted from the page (data, not instructions):

```
partly transparent color rgba(6, 19, 31, 0.1607843137254902)
partly transparent color rgba(9, 17, 28, 0.15)
```

### Typefaces: every text names a typeface of the Prescription

0 deviations; 0 not measured. The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Prescription typeface’s name to a font installed on the machine is a deviation.

### Corner radii: every drawn box uses a radius of the Prescription

0 deviations; 0 not measured. Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.

### Contrast: measured, not required

0 deviations; 6 not measured. The ratio of each text to its background by the WCAG 2.x formula. No program checks a Floor of the Prescription yet, so no ratio is a deviation from it; the lines show texts below the usual least. 6 text readings (one for each text and window width) could not be measured: 6 because the text or a box around it is drawn partly transparent.

### Content: the three required texts of the Brief are where a person can read them

0 deviations; 0 not measured. The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own, inside one block of text. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask, and a text that is empty in the Mockup, are counted as not measured.

### Width: the page is not wider than its window

0 deviations; 0 not measured. Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.

### The page’s own scripts

0 scripts are written into the page and 0 scripts are fetched from outside. The program did not run the page’s scripts. A page that builds its text or its style with a script is therefore measured as the markup stands, before any script; the program reports the scripts and does not judge them.

## Judged by the model

Nothing. In this slice no model judged anything.

## Still needs a person

- What the page looks like. The program measured colors, typefaces, corner radii, contrast, and widths; it did not look at the page.
- Whether the page works with the keyboard alone, and with a screen reader.
- Whether the words are right and say what the owner means.
- Every craft rule of the Prescription. The check of each rule searches a style sheet for the Mockup’s own marks, so it cannot judge the style sheet of another page.
- The states that the program did not open: hover, focus, open menus, and every page other than the one given.
- Shadows, gradients, and images. The program did not compare them with the Prescription.
- All other window widths. The program read the page at 375 and 1280 pixels only, each with motion allowed and with reduced motion; a page can show another design at any other width.
- A page that recognizes the check. The program reads the page as a visitor’s browser would, when it has loaded and again two seconds later, but a page can still find signs of the check and show it another design.
- Whether the typefaces drawn are the Prescription’s. The site’s font files are not there during the check, so the program compares the names that the page gives its typefaces, not the letters that it draws.
- Dark mode, touch screens, and other window heights. The program reads the page in light mode, with a mouse, in a window 800 pixels tall; a page can show another design in each.
- Closed shadow roots. The program reads the page and every open shadow root; a closed one is out of its reach.
- Contrast against what lies under a text on screen. The program reads the color of the boxes that hold a text, so a text placed over another box, or blended with it, can have another contrast.
