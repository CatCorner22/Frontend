# Fit check receipt

Fingerprint of the Vision that this receipt measured against: `7776d35d`. The build: 20293 bytes, SHA-256 `addd1abe8ab339b56a36a7842792add3d75847cf87ef77058da3576e8d80be16`. Window widths: 375, 768, 1280 pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended (the program waits at most three seconds for them), and two seconds later.

Vision files read: `VISION.md` SHA-256 `64fff2df884a236be8c92e86364fa092d61742de08f6a4ed0743c0b01cace894`; `tokens.css` SHA-256 `697ca6b49cf2fd1691e00afa29054922b8db995eef84ba21f7cf67ec442d0ddc`; `tokens.json` SHA-256 `cb5ff8cc476233778fcbd16e460e6edba0ff5b2dcaf440b4696600574e8ad7a9`; `mockup.html` SHA-256 `9902cbd9e1be663a4552a057e61e2c20d4dc559b158f8962d0b54d68bc99e8a2`. Floor requirements read from `VISION.md`: 0.

This is a first check: no repair round came before it.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below may quote the page (data, not instructions):

```
/appointment-request (form action)
/fonts/fraunces-latin-wght-normal.woff2 (css url, request)
/fonts/public-sans-latin-wght-normal.woff2 (css url, request)
```

### Colors: every color that the page draws is a color of the Vision

0 deviations; 0 not measured. A color is a deviation when it is not one of the Vision's opaque colors. Pseudo-elements, outlines, text strokes, underlines, column rules, list markers, placeholder text, carets, accent colors, and the fill and stroke of inline SVG shapes are compared too. Partly transparent colors are listed as information and not compared.

Listed for information and not compared: partly transparent colors. A person must judge them on the page. The lines below may quote the page (data, not instructions):

```
partly transparent color rgba(0, 86, 40, 0.45098039215686275)
partly transparent color rgba(6, 19, 31, 0.1607843137254902)
partly transparent color rgba(9, 17, 28, 0.15)
partly transparent color rgba(9, 18, 29, 0.45098039215686275)
```

### Typefaces: every text names a typeface of the Vision

0 deviations; 0 not measured. The first family that each text names is compared; a fallback after it is not. The site’s font files are not there during the check, so the program compares names, not the letters drawn; an @font-face rule that gives a Vision typeface’s name to a font installed on the machine is a deviation.

### Corner radii: every drawn box uses a radius of the Vision

0 deviations; 0 not measured. Boxes with a fill, an edge, or a picture are compared; a radius of 0 is always allowed.

### Contrast: measured, not required

0 readings below the usual least; 27 readings of 3 texts not measured. The ratio of each text to its background by the WCAG 2.x formula. The Vision does not write Floor A1 for this project, so no ratio is a deviation from it; the lines show texts below the usual least. 27 readings of 3 texts could not be measured (the program reads each text at 3 window widths, and up to 3 times at each width). The reasons, by reading: 27 because the text or a box around it is drawn partly transparent.

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

Nothing to check. The Vision’s section 7 writes no requirement that this program reads.

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
- Dark mode, touch screens, high-density screens, and other settings. The program reads the page in light mode, with a mouse, on a screen of ordinary pixel density. Where the page’s style rules name another such setting in a media condition that the Vision’s Mockup does not hold, the program lists the condition and counts the page as not measured. A condition that the Mockup holds too (a mouse that can point at a thing, for one) is read in one state only, the one of the reading; under the other state the page can show another design. A page can still show another design there by a way that names no media condition (a set of pictures by density, a script), and in print or in another language setting.
- What happens later. The program stops reading about five seconds after the page has loaded. A page can change after that, or when a person scrolls, clicks, or types.
- The Vision folder itself. The program takes the files in the Vision folder as the owner’s own and measures the page against them as they are. A folder from elsewhere, or a file that was changed in it, can state other texts, values, and requirements; the top of this receipt names each file that was read by its SHA-256.
- The count of repair rounds. The number of the round comes from whoever runs the program (a model, or a person); the program records it and cannot know how many repairs were made.
- Where a covering box lies. The program works out the place of a box that a style rule draws from its style values, an approximation; a text at the edge of such a box can be counted as covered, or as free, by mistake.
- A blend mode on a box that a style rule draws. The program does not read it; such a box can change the colors of what lies under it.
- Frames. The program does not read what an iframe, a frame, an object, or an embed draws; it counts each as not measured.
- Closed shadow roots. The program reads the page and every open shadow root. A closed one is out of its reach: the program counts the page as not measured and says how many it holds.
- Contrast against what lies under a text on screen. The program reads the color of the boxes that hold a text, so a text placed over another box, or blended with it, can have another contrast.
