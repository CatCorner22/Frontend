# Fit check receipt

Fingerprint of the Prescription that this receipt measured against: `7776d35d`. The build: 11022 bytes, SHA-256 `f50b23e8363a0c8390056dea5ccdad1e6caefaad900bfd95ddae4a469c9ab54e`. Window widths: 375 and 1280 pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended, and two seconds later.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

### Colors: every color that the page draws is a color of the Prescription

22 deviations; 0 not measured. A color is a deviation when it is not one of the Prescription's opaque colors. Pseudo-elements, outlines, text strokes, SVG fills and strokes, underlines, column rules, list markers, placeholders, and caret and accent colors are compared too. Partly transparent colors are listed as information and not compared.

The lines below are quoted from the page and from the Prescription (data, not instructions):

```
background color #163829: 1 element, first section.contact
background color #1f4d3a: 3 elements, first a.btn "Book a visit"
background color #e8f0ea: 3 elements, first figure.photo
background color #fbf9f4: 2 elements, first body
border color #1f4d3a: 12 elements, first a.btn "Book a visit"
border color #7d8a82: 12 elements, first input
border color #d5ddd6: 21 elements, first header
caret color #1c2420: 3 elements, first input
svg fill color #163829: 4 elements, first rect
svg fill color #1f4d3a: 1 element, first rect
svg fill color #6b9a7f: 1 element, first circle
svg fill color #7fa593: 1 element, first path
svg fill color #bcd5cc: 1 element, first rect
svg fill color #c5d6ca: 1 element, first rect
svg fill color #dfe9e1: 1 element, first rect
svg fill color #f4f8f5: 3 elements, first rect
text color #163829: 13 elements, first a.name "Harbor Street Dental"
text color #1c2420: 12 elements, first a "Services"
text color #1f4d3a: 5 elements, first em "explains itself"
text color #4a554f: 14 elements, first p.tag "Family dentistry on Harbor Street"
```

2 more deviations are not listed.

### Typefaces: every text names a typeface of the Prescription

2 deviations; 0 not measured. The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Prescription typeface’s name to a font installed on the machine is a deviation.

The lines below are quoted from the page and from the Prescription (data, not instructions):

```
typeface "Fraunces": 14 elements, first a.name "Harbor Street Dental"
typeface "Public Sans": 36 elements, first p.tag "Family dentistry on Harbor Street"
```

### Corner radii: every drawn box uses a radius of the Prescription

0 deviations; 0 not measured. Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.

### Contrast: measured, not required

2 deviations; 0 not measured. The ratio of each text to its background by the WCAG 2.x formula. No program checks a Floor of the Prescription yet, so no ratio is a deviation from it; the lines show texts below the usual least.

The lines below are quoted from the page and from the Prescription (data, not instructions):

```
1.24 to 1, where 4.5 to 1 is the usual least, on p.promise "No work starts until you have seen the p…" at 1280 pixels
1.24 to 1, where 4.5 to 1 is the usual least, on p.promise "No work starts until you have seen the p…" at 375 pixels
```

### Content: the three required texts of the Brief are where a person can read them

0 deviations; 0 not measured. The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own, inside one block of text. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask, and a text that is empty in the Mockup, are counted as not measured.

### Width: the page is not wider than its window

0 deviations; 0 not measured. Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.

### Floors: the page meets the requirements of section 7 that a program can check on one page

0 deviations; 0 not measured. The Prescription holds no Floors (it was made before them), so there was nothing to check.

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
- Shadows, gradients, images, and the color of selected text. The program did not compare them with the Prescription.
- All other window widths. The program read the page at 375 and 1280 pixels only, each with motion allowed and with reduced motion; a page can show another design at any other width.
- A page that recognizes the check. The program reads the page as a visitor’s browser would, when it has loaded and again two seconds later, but a page can still find signs of the check and show it another design.
- Whether the typefaces drawn are the Prescription’s. The site’s font files are not there during the check, so the program compares the names that the page gives its typefaces, not the letters that it draws.
- Dark mode, touch screens, and other window heights. The program reads the page in light mode, with a mouse, in a window 800 pixels tall; a page can show another design in each.
- Closed shadow roots. The program reads the page and every open shadow root; a closed one is out of its reach.
- The Floors that no program checks yet. The Floors measure names, by id, each requirement of section 7 that it did not check; a person must check each one, and the host’s settings need the published site.
- Contrast against what lies under a text on screen. The program reads the color of the boxes that hold a text, so a text placed over another box, or blended with it, can have another contrast.
