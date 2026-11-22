---
version: alpha
name: "Frontend Focus design 0fabf790"
description: "One design from Frontend Focus Studio. VISION.md is the instruction; tokens.css holds every value."
colors:
  primary: "#005729"
  on-primary: "#f9fdfa"
  secondary: "#005729"
  on-secondary: "#f9fdfa"
  background: "#f7faff"
  surface: "#ffffff"
  surface-muted: "#e9f1fb"
  card: "#ffffff"
  text: "#09111c"
  text-muted: "#4e5967"
  link: "#005729"
  button: "#005729"
  on-button: "#f9fdfa"
  border: "rgb(9 17 28 / 0.148)"
  border-strong: "#646e7c"
  focus: "#005729"
typography:
  display:
    fontFamily: "Fraunces Variable"
    fontSize: 3.2425rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.015em
  headline-md:
    fontFamily: "Fraunces Variable"
    fontSize: 2.0752rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: "Fraunces Variable"
    fontSize: 1.6602rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.015em
  body-lg:
    fontFamily: "Public Sans Variable"
    fontSize: 1.3281rem
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: "Public Sans Variable"
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: "Public Sans Variable"
    fontSize: 0.9456rem
    fontWeight: 400
    lineHeight: 1.55
  label-sm:
    fontFamily: "Public Sans Variable"
    fontSize: 0.8287rem
    fontWeight: 400
    lineHeight: 1.55
rounded:
  sm: "7px"
  md: "14px"
  lg: "21px"
spacing:
  space-1: 0.2875rem
  space-2: 0.575rem
  space-3: 0.8625rem
  space-4: 1.15rem
  space-6: 1.725rem
  space-8: 2.3rem
  space-12: 3.45rem
  space-16: 4.6rem
  page-max: 68rem
components:
  button-primary:
    backgroundColor: "{colors.button}"
    textColor: "{colors.on-button}"
    rounded: "{rounded.md}"
    height: 2.75rem
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: 2.75rem
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
  page-muted-text:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-muted}"
  link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.link}"
  band:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text}"
  badge-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
---

# The design, in the DESIGN.md format

## Overview

A light page with one main color and a plain background. This file is one file of a Vision from Frontend Focus Studio. `VISION.md` is the instruction and decides where two files differ; `tokens.css` holds every value of the design, also those that this format has no place for; `mockup.html` is the reference page.

Fingerprint of the design values: `0fabf790`. Every file of this Vision carries the same eight characters; where one differs, the files do not belong together.

## Colors

The page is light. The colors below are written as the reference page draws them.

- **Primary (#005729):** the one color that people remember. Use it where the Step “Amount of color” puts it: one color on buttons and highlights (Buttons and highlights use the main color; one band of the page carries a soft tint).
- **Background (#f7faff) and text (#09111c):** the page and its reading text. Muted text is #4e5967.
- **Button (#005729) with its label (#f9fdfa):** the main button. The Studio measured this pair.
- **Link (#005729):** links in running text, always underlined.
- **Borders:** rgb(9 17 28 / 0.148) for quiet lines; #646e7c for the edge of a form field.

## Typography

Headings are set in Fraunces Variable, reading text in Public Sans Variable. `FONTS.md` says how to ship them. The largest headline grows with the window; this file gives its largest size, and `tokens.css` holds the exact rule under `--text-display`.

## Layout

The page is at most 68rem wide. Spacing follows the named steps in `tokens.css` (`--space-1` to `--space-32`); use no spacing that is not one of them.

- Menu: name centered, links below (The name sits centered on its own line, like the title at the top of a newspaper, with the links centered beneath it).
- First screen: text and photo side by side (Text on the left, a large photograph on the right).
- List of services: rows separated by lines (Each service is a full-width row, separated by thin lines).

## Elevation & Depth

Boxes stand apart from the page like this: thin outlines (Thin outlines; no shadows). The exact shadows and edges are in `tokens.css` (`--card-shadow`, `--card-border`); this format has no place for a shadow.

## Shapes

Buttons and fields are rounded by 14px, boxes by 21px, small marks by 7px. A field of several lines inside a box is never rounder than the box.

## Components

- **Main button:** the button color with its label color, 2.75rem tall at least, rounded as above. On press and on focus it behaves as section 4 of `VISION.md` says.
- **Field:** the surface color, the strong border, the same rounding and least height as the button.
- **Card:** the card color, rounded as a box.

## Do's and Don'ts

- Do use the names in `tokens.css`; do not write a raw color, size, or spacing into a component.
- Do build to match `mockup.html`, and compare your page with it before you report.
- Don't load a font, a script, or a style sheet from another site.
- Don't mark anything by color alone: a link is underlined, and an error has a mark and words.
- Don't drift toward “Name left, links right” or “Links centered, button right” or “Links in a left column” on “Menu (navigation)”: the owner saw them and chose otherwise.
- Don't drift toward “Headline left” or “Everything centered” or “Very large headline” on “First screen”: the owner saw them and chose otherwise.
- Don't drift toward “Tight” or “Medium” or “Very roomy” on “Spacing”: the owner saw them and chose otherwise.
- Don't drift toward “The device’s own font” or “Plain and sturdy” or “Newspaper-style headings” or “Elegant thick-and-thin headings” or “Round, friendly headings” or “Engineered-looking headings” or “Lively, hand-cut headings” or “Letters with small feet throughout” or “Neutral and unnoticed (Inter)” on “Letter style (typeface)”: the owner saw them and chose otherwise.
- Don't drift toward “Deep blue” or “Bright blue” or “Blue-green (teal)” or “Bright green” or “Golden yellow” or “Orange” or “Red-orange” or “Deep red” or “Pink-red (magenta)” or “Dark purple” or “Blue-purple (violet)” or “Near-black (no color)” on “Main color”: the owner saw them and chose otherwise.
- Don't drift toward “Square corners” or “Barely rounded (3 px)” or “Slightly rounded (8 px)” or “Fully round (pill shape)” on “Corners”: the owner saw them and chose otherwise.
