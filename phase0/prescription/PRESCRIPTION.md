# Prescription: ClearPath Legal Clinic intake preparation (hand-assembled for M0)

You are building a web frontend from a completed design prescription. Every design decision below is already made. Do not propose alternative directions. Do not add anything decorative that this document does not name. Where this document is silent, choose the plainest option that serves a worried first-time visitor on a phone.

{{shared-product-facts}}

---

## Layer 1 — Decisions (each one was picked; the rejected options are listed so that you do not drift toward them)

| # | Decision | Picked | Rejected (do not use) |
|---|---|---|---|
| 1 | Page type | Guided flow: one question per screen | Marketing homepage with hero and feature cards; dashboard; searchable library |
| 2 | Navigation | One plain top bar with the four text links; on narrow screens the links wrap onto a second line and stay visible | Hamburger menu; sidebar; icon-only navigation |
| 3 | Layout skeleton | Single centered column | Split screen; card grid; multi-column forms |
| 4 | Content width | 65 characters maximum for text; the column never stretches on wide screens | Full-bleed; fixed 960 px |
| 5 | What the eye finds first | The step question (the page's `h1`), then the answer controls, then one primary button | Any hero image, illustration, badge, or statistic above the question |
| 6 | Progress | Text "Step 2 of 6" above the question, plus a compact "Your answers so far" list with a "Change" link per answer | Decorative progress bar alone; numbered circles; no progress |
| 7 | Density | Comfortable: generous vertical space, one idea per block | Compact; airy with oversized whitespace |
| 8 | Typeface personality | Serif titles (system serif), sans-serif body and controls (system sans). No web fonts | Inter, Roboto, or any downloaded font; all-sans; monospace accents |
| 9 | Heading treatment | Moderate size contrast, tight line height, sentence case | Giant display headings; ALL-CAPS labels; letter-spaced eyebrows above headings |
| 10 | Base size and scale | 18 px base; scale ratio 1.25 | 14–16 px base; dramatic 1.5 scale |
| 11 | Color strategy | Warm paper background, dark ink text, one deep-teal action color, rust reserved for focus, crimson reserved for errors | Gradients of any kind; purple or indigo; more than one accent; tinted icon squares |
| 12 | Theme | Light only | Dark mode; automatic dark mode |
| 13 | Shape | Subtle radius, 6 px, on controls only | Pills; large rounded cards; mixed radii |
| 14 | Elevation | Borders only. No shadows anywhere | Soft card shadows; glow; glass or blur |
| 15 | Containers | Flat sections separated by space and hairline rules. At most one bordered box per screen (the summary or the alert) | Cards around every block; nested cards |
| 16 | Icons and images | None. Text labels only | Emoji; icon-only buttons; stock imagery; illustrations |
| 17 | Motion budget | None, apart from the browser's native control feedback | Fade-ins, slide-ups, hover lifts, animated progress |
| 18 | Mutation style | Inline: answers save as the visitor goes; "Back" never clears anything | Confirm dialogs; toasts |
| 19 | Validation | On "Continue" only; an error summary at the top that links to each field, plus a message beside the field | Errors while typing; disabled Continue button; toast errors |
| 20 | Loading style | Text status "Sending your request…" beside the button; the button keeps its label and ignores second presses | Spinner alone; percentage bar; skeleton |
| 21 | Focus style | 3 px solid rust outline with 2 px offset on every interactive element | Browser default only; removed outlines; glow |
| 22 | Voice | Plain, calm, specific. Sentence case. Buttons name the outcome ("Continue to checklist", "Send my request") | "Submit", "Next", "Get started", exclamation marks, marketing phrases |
| 23 | Signature element | The printable preparation summary: a bordered document-like block with a serif title that prints cleanly on one page | Any decorative signature (illustration, pattern, animation) |

## Tokens (use these values only; never write a raw color, size, or radius that is not here)

```css
:root {
  --color-bg: #F7F4EE;
  --color-surface: #FFFFFF;
  --color-text: #172033;
  --color-text-muted: #526174;
  --color-action: #0B5D5E;
  --color-action-hover: #084748;
  --color-action-text: #FFFFFF;
  --color-border-control: #526174;
  --color-rule: #DED8CB;
  --color-focus: #B45309;
  --color-error: #9F1239;
  --color-error-surface: #FDF2F4;
  --color-link: #1D4ED8;

  --font-title: Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --text-sm: 0.9375rem;   /* 15px: hints only, never body */
  --text-base: 1.125rem;  /* 18px */
  --text-lg: 1.40625rem;  /* 22.5px */
  --text-xl: 1.75rem;     /* 28px */
  --text-2xl: 2.1875rem;  /* 35px: h1 on wide screens */
  --leading-body: 1.55;
  --leading-heading: 1.2;

  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;

  --radius-control: 0.375rem;
  --border-control: 2px;
  --border-rule: 1px;
  --focus-width: 3px;
  --focus-offset: 2px;
  --target-min: 2.75rem;  /* 44px */
  --content-measure: 65ch;
}
```

## Layer 2 — Craft rules (details that separate careful work from generic work; apply all of them)

**Structure and semantics**
1. One `main`, one `h1` per screen (the step question), a logical heading order, a skip link as the first focusable element.
2. Use native elements: `button` for actions, `a` for navigation, `fieldset` + `legend` for each radio group, `label` bound to every input. No `div` or `span` with a click handler.
3. When a new step appears, move focus to its `h1` (give it `tabindex="-1"`) and update `document.title` to "Step name — ClearPath Legal Clinic".
4. Keep the step in the URL hash so that Back and Forward move between steps and a refresh restores the step.

**Typography**
5. Body text 18 px, line height 1.55, maximum width 65ch. Headings: line height 1.2, `text-wrap: balance`. Paragraphs: `text-wrap: pretty`.
6. Use real punctuation: curly quotes, the "…" character, the en dash in ranges ("9 to 5" stays words here), and a non-breaking space inside "555-0142" style numbers so that they never split across lines.
7. `-webkit-font-smoothing: antialiased` on the root. `font-variant-numeric: tabular-nums` on the date and the reference number.

**Controls**
8. Every interactive target is at least 44 px tall. A radio option's whole row (the label) is the target, with a 2 px border in `--color-border-control`, and the selected row shows a visible state that does not rely on color alone (a thicker border plus the native checked radio).
9. Inputs: 2 px border, 18 px text (never below 16 px, to prevent mobile zoom), the correct `type`, `autocomplete`, and `inputmode` for name, phone, and email. Never block paste.
10. The date uses the native `input type="date"`, with a persistent label and the hint "Leave this blank if no date is printed."
11. One primary button per screen (solid `--color-action`). "Back" is a plain secondary button (transparent with a border). Order in the DOM and visually: primary first on narrow screens, both full-width below 480 px.
12. Hover styles sit inside `@media (hover: hover)`. The focus outline uses `:focus-visible` and is never removed.

**Feedback and recovery**
13. Errors: a summary box at the top with `role="alert"`, a heading "There is a problem", and links that move focus to each field; the field's message connects through `aria-describedby`; set `aria-invalid="true"`. Each message says what to do ("Choose a topic to continue").
14. The send status uses `aria-live="polite"`. While sending, ignore repeat presses rather than disabling the button, and keep the button's label.
15. After a failure, show the exact failure copy, keep every answer, show "Try sending again", and show the other contact methods directly below.
16. Persist the topic, the date, and the step in `sessionStorage`. Never persist the name or the contact detail.
17. The summary states "No printed date supplied" when the date is blank. Never write "No deadline".

**Layout**
18. "Other ways to get help" appears on every screen as a quiet block below the step, separated by a hairline rule; it is not hidden behind a toggle.
19. At 320 px there is no horizontal scroll, no clipped text, and no overlapping elements. Long topic text wraps.
20. Spacing encodes grouping: tight inside a group (`--space-2` to `--space-3`), `--space-6` between groups, `--space-12` between the step and the secondary blocks. Do not apply one uniform gap everywhere.
21. `@media print`: print only the summary, the other contact methods, and the non-advice note; hide navigation, buttons, and the prototype controls; white background.
22. Respect `prefers-reduced-motion` (there should be no motion to remove) and `forced-colors` (borders and focus must survive; do not convey state by background color alone).

**Anti-defaults (each with its replacement)**
23. No hero section → the home screen is the first step of the flow, with the home copy and the "Start preparing" button.
24. No cards, shadows, gradients, icons, or emoji → hierarchy comes from type size, weight, space, and hairline rules.
25. No centered body text → left-aligned text; only the column itself is centered.
26. No invented content → use only the supplied copy and facts; write short, plain connecting labels where a control needs one.

## Layer 3 — Floors (not negotiable)

**Accessibility (target: WCAG 2.2 level AA; these are checks, not a conformance claim).** Text contrast at least 4.5:1; control boundaries and focus indicators at least 3:1; every function works by keyboard alone in a logical order; no keyboard trap; nothing depends on hover; page usable at 200% zoom and at 320 px width; `lang="en"`; status changes announced once.

**Security.** No `innerHTML` with visitor input; insert visitor text with `textContent`. No `eval`. No inline event-handler attributes; attach listeners in script. No external requests.

**Performance.** No web fonts, images, or libraries. No layout shift when a step changes or an error appears above the form (reserve nothing by moving focus instead of animating).

## Build order

1. Tokens and base styles.
2. The step engine (state, hash routing, focus management, session persistence).
3. Each step in order, with its error state.
4. The summary, print styles, and the simulated send with all four outcomes.
5. Self-check before you finish, by reading your own file against this list:
   - Does every color, size, and radius come from a token?
   - Are there any shadows, gradients, icons, emoji, cards, or animations? Remove them.
   - Does each screen have exactly one `h1` and one primary button?
   - Can you reach and operate everything with Tab, arrow keys, Space, and Enter?
   - Do the failure, slow, and offline outcomes keep the answers and show the other contact methods?

Report honestly at the end: list anything in this Prescription that you did not implement.
