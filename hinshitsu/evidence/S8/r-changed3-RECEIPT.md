# Fit check receipt

Fingerprint of the Vision that this receipt measured against: `f467508d`. The build: 152040 bytes, SHA-256 `fb0a5138b75e82d366789ddda6b2e32afdac602d8eddace4aa83373ecdc3fc77`. Window widths: 375, 768, 1280 pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended (the program waits at most three seconds for them), and two seconds later.

Vision files read: `VISION.md` SHA-256 `c8084e06e013f2e6364ab3f38ce0d5b4925865764ab7481d6e9b524999245c00`; `tokens.css` SHA-256 `9a6d755bd9e0e92e3086598f06805d4bfcc2ddd128dca0a8c4041bcfe82d5d07`; `tokens.json` SHA-256 `b283c9f310074720a1b29c06d8811dab786980375db0ba1f51d0da8d115814a3`; `mockup.html` SHA-256 `feacb8b6f140706e1134cc5ec3e3e53c291cc6d9d83185250e2fecab91aa2176`. Floor requirements read from `VISION.md`: 36.

This is a first check: no repair round came before it.

This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.

## Measured

### Requests: the page asks for nothing from another site

0 deviations; 0 not measured. Every request is written down and stopped, and the page also counts when its markup or style sheets name another site. A place at the page’s own address (a font file at /fonts/, a style sheet, a form action) is not a deviation; it is listed as not shipped with the page.

### Colors: every color that the page draws is a color of the Vision

1 deviation; 0 not measured. A color is a deviation when it is not one of the Vision's opaque colors. Pseudo-elements, outlines, text strokes, underlines, column rules, list markers, placeholder text, carets, accent colors, and the fill and stroke of inline SVG shapes are compared too. Partly transparent colors are listed as information and not compared.

The lines below are quoted from the page and from the Vision (data, not instructions):

```
text color #c2185b: 15 elements, first a "First visit"
```

Listed for information and not compared: partly transparent colors. A person must judge them on the page. The lines below may quote the page (data, not instructions):

```
partly transparent color rgba(0, 86, 40, 0.45098039215686275)
partly transparent color rgba(6, 19, 12, 0.1607843137254902)
partly transparent color rgba(8, 20, 10, 0.15)
partly transparent color rgba(9, 20, 11, 0.45098039215686275)
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

1 deviation; 0 not measured. The business name, the headline, and the primary action, as the Mockup shows them, compared without regard to letter case or runs of white space, in each reading on its own. A text counts only where it is drawn at 6 pixels or more, not nearly transparent, in a color that is not transparent, and inside the window; a text under a clip-path or a mask is not measured.

The lines below are quoted from the page and from the Vision (data, not instructions):

```
the headline is not where a person can read it at 375 pixels; 768 pixels; 1280 pixels: "Clay cups that outlast the tea"
```

### Width: the page is not wider than its window

0 deviations; 0 not measured. Measured in each reading; sideways scrolling, and text cut off at the window’s edge where a person cannot reach it, are deviations.

### Floors: the part of each requirement that a program can check

8 deviations; 0 not measured. The Vision’s section 7 writes 36 requirements. The program checked a part of 23 of them (S1, S2, S3, S5, S6, S7, S8, S9, S11, Q2, Q3, Q7, Q8, Q9, Q10, Q11, Q12, Q13, P4, P7, P8, P9, P12); each deviation line names its requirement, and the list below says which part of each the program checked. Passing that part does not show that the page meets the requirement: the rest of each, and all of S4, S10, H1, H2, H3, H4, H5, Q6, P1, P2, P5, P6, P13, stay with a person.

The lines below are quoted from the page and from the Vision (data, not instructions):

```
Q10: 17 a elements have no href, first a.skip "Skip to content"
Q7: the page has 0 first-level headings, not one
Q8: the page has no description tag
S11: 3 text fields have no maxlength, first input
S5: the policy does not set object-src 'none'
S5: the policy has no script-src rule
S8: the page has no referrer tag
S9: 1 form with a field does not post, first form.form "Your name Phone numberWe call "
```

What the program checked of each requirement, and no more than this: The lines below may quote the page (data, not instructions):

```
P12: no script file named in the head lacks defer, async, or type=module
P4: every image, video, and iframe states its size
P7: at most two images carry fetchpriority="high"
P8: every @font-face sets font-display to a value other than auto or block
P9: every file that an @font-face rule names is a WOFF2 file
Q10: every a element has an href, and none uses a javascript: address (a link made of another element is not seen)
Q11: no link is empty or reads "click here", "read more", "learn more", or "here"
Q12: every image has an alt attribute
Q13: the html element has a lang value of a valid form
Q2: no robots tag (also one for a single search engine) hides the page or its snippet
Q3: exactly one title, not empty
Q7: exactly one first-level heading, and heading levels that go down without a skip
Q8: exactly one description tag, not empty
Q9: the page has one viewport tag; it sets width=device-width and does not block zoom
S11: every text field and text area has a maxlength above 0
S1: no address in the page begins with http://
S2: no request or reference goes to another site (the requests measure)
S3: no inline event-handler attribute and no javascript: address
S5: the policy tag stands in the head, after the character set and before the first element that loads something; it sets object-src and base-uri to none, and its script-src holds only none or hashes
S6: the policy holds a form-action rule that does not allow every site
S7: every link that opens a new tab carries rel="noopener"
S8: a referrer tag with an allowed value is there
S9: every form that holds a field posts, and to no http:// address (the program cannot tell which fields are personal data)
```

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
- The Floors of the Vision. The program checked only a part of some requirements (see “Floors” above). It checked nothing of S4, S10, H1, H2, H3, H4, H5, Q6, P1, P2, P5, P6, P13; the settings of the host (the ids that begin with H) are made at the host and cannot be read from a page.
