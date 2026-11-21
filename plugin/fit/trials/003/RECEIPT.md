# Fit check receipt

Fingerprint of the Vision that this receipt measured against: `7776d35d`. The build: 22625 bytes, SHA-256 `e4efc468a119001634e8de8e79fa74d580641153e7b22a2060adf71c0359570b`. Window widths: 375, 768, 1280 pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended (the program waits at most three seconds for them), and two seconds later.

This is a first check: no repair round came before it.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below may quote the page (data, not instructions):

```
/appointment-request (form action)
/page/fonts/fraunces-latin-wght-normal.woff2 (request)
/page/fonts/public-sans-latin-wght-normal.woff2 (request)
fonts/fraunces-latin-wght-normal.woff2 (css url)
fonts/public-sans-latin-wght-normal.woff2 (css url)
```

### Colors: every color that the page draws is a color of the Vision

0 deviations; 0 not measured. A color is a deviation when it is not one of the Vision's opaque colors. Pseudo-elements, outlines, text strokes, underlines, column rules, list markers, placeholder text, carets, accent colors, and the fill and stroke of inline SVG shapes are compared too. Partly transparent colors are listed as information and not compared.

Listed for information and not compared: partly transparent colors. A person must judge them on the page. The lines below may quote the page (data, not instructions):

```
partly transparent color rgba(0, 86, 40, 0.45098039215686275)
partly transparent color rgba(9, 17, 28, 0.15)
partly transparent color rgba(9, 18, 29, 0.45098039215686275)
```

### Typefaces: every text names a typeface of the Vision

0 deviations; 0 not measured. The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Vision typeface’s name to a font installed on the machine is a deviation.

### Corner radii: every drawn box uses a radius of the Vision

0 deviations; 0 not measured. Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.

### Contrast: measured, not required

0 below the usual least (information: not counted as deviations); 27 not measured. The ratio of each text to its background by the WCAG 2.x formula. The Vision writes Floor A1 in an edition of the Floors that this program does not read, so no ratio counts as a deviation here; the lines show texts below the usual least. 27 readings of 3 texts could not be measured (the program reads each text at 3 window widths, and up to 3 times at each width). The reasons, by reading: 27 because the text or a box around it is drawn partly transparent.

Texts whose contrast the program could not read. A person must judge these by eye: The lines below may quote the page (data, not instructions):

```
dd "for a first visit"
dd "open each week"
dd "treatment rooms"
```

### Content: the three required texts of the Brief are where a person can read them

0 deviations; 0 not measured. The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask is not measured.

### Width: the page is not wider than its window

0 deviations; 0 not measured. Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.

### Floors: the part of each requirement that a program can check

0 deviations; 1 not measured. The Vision’s section 7 writes 48 requirements in an edition without a number (an older Vision) of the Floors; this program reads edition 3, and the two may word a requirement differently. The program checked none of them. Write the Vision again from the Studio, then check again.

### The page’s own scripts

0 scripts are written into the page and 0 scripts are fetched from outside. The program did not run the page’s scripts. A page that builds its text or its style with a script is therefore measured as the markup stands, before any script; the program reports the scripts and does not judge them.

## Judged by the model

Nothing. No model handed over a judgment for this check.

## Still needs a person

- What the page looks like. The program measured colors, typefaces, corner radii, contrast, and widths; it did not look at the page.
- Whether the page works with the keyboard alone, and with a screen reader.
- Whether the words are right and say what the owner means.
- Every craft rule of the Vision. The check of each rule searches a style sheet for the Mockup’s own marks, so it cannot judge the style sheet of another page.
- The states that the program did not open: hover, focus, open menus, and every page other than the one given.
- Shadows, gradients, images, and the color of selected text. The program did not compare them with the Vision.
- All other window widths. The program read the page at 375, 768, and 1280 pixels only, each with motion allowed and with reduced motion; a page can show another design at any other width.
- A page that behaves differently for a visitor. The program ran no script of the page, so it did not read anything that a script draws or changes; a visitor’s browser runs scripts. If the page holds a script, check again with the option --run-scripts.
- Whether the typefaces drawn are the Vision’s. The site’s font files are not there during the check, so the program compares the names that the page gives its typefaces, not the letters that it draws.
- Other window heights. The program reads the page in a window 800 pixels tall; a page can show another design at any other height.
- Dark mode, touch screens, high-density screens, and other settings. The program reads the page in light mode, with a mouse, on a screen of ordinary pixel density. Where the page’s style rules name another such setting in a media condition that the Vision’s Mockup does not hold, the program lists the condition and counts the page as not measured. A page can still show another design there by a way that names no media condition (a set of pictures by density, a script), and in print or in another language setting.
- What happens later. The program stops reading about five seconds after the page has loaded. A page can change after that, or when a person scrolls, clicks, or types.
- Frames. The program does not read what an iframe, a frame, an object, or an embed draws; it counts each as not measured.
- Closed shadow roots. The program reads the page and every open shadow root. A closed one is out of its reach: the program counts the page as not measured and says how many it holds.
- Contrast against what lies under a text on screen. The program reads the color of the boxes that hold a text, so a text placed over another box, or blended with it, can have another contrast.
- The Floors of the Vision. The program checked none of them (see “Floors” above): A1, A2, A3, A4, A5, A7, A8, A9, A10, A11, A12, A13, A14, S1, S2, S3, S4, S5, S6, S7, S9, S10, S11, H1, H2, H3, H4, H5, Q2, Q3, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13, P1, P2, P4, P5, P6, P7, P8, P9, P12, P13; the settings of the host (the ids that begin with H) are made at the host and cannot be read from a page.
