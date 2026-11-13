# Red-team review C (third pass): the confused first-time user

Date: 2026-11-13. Reviewer: the "confused first-time user" red-team reviewer, third narrow pass.
Branch: `claude/brave-mayer-sawqz9` (my own worktree; nothing committed).
What I tested: the built page `apps/studio/dist/artifact/local-test.html` (from `npm run build:page`), opened with a file:// URL in Chromium and driven by my own Playwright scripts in `redteam/ux3/` (s1 to s7). I took screenshots at deviceScaleFactor 1 and looked at them.

## What I actually read

- **23 of 23 Steps**, starting from the Direction "Paper and Ink". For each Step I collected the line above the question, the question, the explanation, the opened fold "What changes on this Step, and where this guidance comes from", the line that counts the cards, the slider area, and the buttons.
- **122 cards**: I clicked every card on every Step, not just 3 per Step, and collected "Pick it when", "Watch for", "Where you can see it", and the "Overused look" note.
- The first screen (all 14 Directions), the Summary, and these notices: Undo after a pick, "Start again" from another Direction while I had a Decision, Undo after "Start again", opening a file that is not a project (a shopping list in a .txt file), the kept-copy section with download and the two-press removal, and the notice that appears when you leave a Step after only looking at a card.
- Sizes: 1440x900, 720x450 (the same as 200% zoom), and 375x800 (phone).
- I checked no other Direction's Steps in full. I did not test keyboard-only use beyond the sliders' arrow keys. I could not confirm the "contrast note under the large preview" that Step 15 promises (see U3-17).

## Counts by severity

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 6 |
| Minor | 13 |
| Note | 5 |

## Majors

### U3-01 (major): at 200% zoom and on a phone, the Undo notice appears off-screen, so Undo seems to do nothing
- Where: any Step, at 720x450 and at 375x800.
- What happens: I picked a card on Step 1 (which moved me to Step 2), then pressed Undo in the top bar. The notice "Undone: the Step “Menu (navigation)” is back to how it was." with "Go to “Menu (navigation)”" and "Dismiss" appears at the top of the page. The page shows the Step 2 cards, so the notice sits 717 px above the visible area at 720x450 and 1,337 px above it on the phone. Screenshots `720x450-12-undo.png` and `375x800-12-undo.png` show only the Step 2 cards and "Keep “Very large headline” and continue": nothing visible changed. At 1440x900 the notice is in view and works.
- Expected: after Undo, I see what was undone and can reach "Go to …".
- Fix: after Undo, scroll the notice into view and move focus to it, or show it as a fixed bar at the bottom of the screen at narrow sizes.

### U3-02 (major): the source fold on every Step points at documents, products, and people the person cannot see
- Where: every Step, in "What changes on this Step, and where this guidance comes from".
- Quoted examples: "Your Training Manual, layout archetypes. Your own source assessment grades it D ("onboarding only")" (Step 2); "Your Master Guide §12 gives 45 to 75 characters" (Step 4); "your Anti-Slop Checklist" (Steps 2, 5, 12, 21, 22); "Your plugin notes list monospace tags" (Step 10); "Your files list "broadsheet hairlines with zero radius" among five newer AI-default looks" (Step 17); "The knowledge base records it from a search snippet" (Steps 1, 4, 7); "The Impeccable rule set … as recorded in the research" (Step 7); "(see THIRD_PARTY_NOTICES.md)" (Step 7); "A helper program read the source files for this Studio" (Steps 16, 19, 20, 21); "Adrian Krebs’s ai-design-checker … names "centered hero plus Inter"" (Step 2); "Emil Kowalski’s design skill", "Jakub Krehel’s rules", "Anthropic’s frontend-design skill", "Refactoring UI", "Shopify Polaris and Linear", "Josh Comeau" (several Steps).
- Problem: a new person does not know what the Training Manual, the Master Guide, the Anti-Slop Checklist, the "source assessment", the "knowledge base", "the research", or the "helper program" is, or where to find them. Grades "C" and "D" are never explained. Quoted names carry design words ("hero", "Inter", "radius", "hairlines", "monospace tags").
- Fix: start the fold with one sentence that says what these are, for example "The names below are documents in your own research folder and outside sources. A grade runs from A (strong evidence) to D (opinion only)." Name each document once with where it lives. Put a plain gloss after quoted design words, or drop the quote.

### U3-03 (major): the list of Steps and the Summary read back the design as bare numbers
- Where: the list of Steps (left column; below the cards on a phone), the Summary "Every Step and its value", and each "Your design now" card.
- Quoted: "close to “Thin and elegant” (thickness of the letters 500, letter spacing -0.022em)" (Step 8); "close to “Very large headings” (text size 18px, heading size jump 1.34)" (Step 9); "close to “Warm gray (a trace of yellow-brown)” (tint color 85° (yellow), tint strength 0.012)" (Step 11); "(color (hue) 30° (red), vividness 0.19, lightness 0.55)" (Step 12); "(text contrast 0.82)" (Step 15); "close to “Medium” (spacing 1.05)" (Step 6, Ember Noir); "(corner rounding 2px)" (Step 17).
- Problem: "500", "0.012", "0.19", "0.82", "1.05", and "em" mean nothing to me. I cannot tell from these numbers whether my design is a lot or a little different from the named card. The same numbers are what the sliders announce (see U3-11).
- Fix: read back in words with a scale, for example "tint strength: faint (12 of 40)", "vividness: medium", "text contrast: high (82 of 100)", "letter spacing: slightly tight". Explain "em" or replace it with "tighter than normal by 2%". Keep the exact numbers in a fold for people who want them.

### U3-04 (major): one hand-set color has two names in the same line
- Where: Step 12, after I moved the "Color (hue)" slider 20 notches; the "Your design now" card, the list of Steps, and the Summary.
- Quoted: "Set by hand: close to “Red-orange” (color (hue) 50° (orange), vividness 0.19, lightness 0.55)".
- Problem: the line calls the color "Red-orange" and "orange" at once. Paper and Ink's own color reads "close to “Red-orange” (color (hue) 30° (red) …)": red-orange and red. Step 11 says "Warm gray (a trace of yellow-brown)" next to "85° (yellow)". I cannot tell which name is true.
- Fix: use one color word list for both the card names and the slider names, and when the hand-set value has moved beyond the nearest card, say "between Red-orange and Orange" or name only the slider's color word.

### U3-05 (major): one thing goes by several names on screen
| Concept | Names seen | Where |
|---|---|---|
| Letter style | "letter style", "typeface", "font" ("The device’s own font", "In most fonts", "every bundled font"), "type" ("Plain, unless the type carries it", "You want the type to disappear", "Invisible on small or thin type"), "typography" ("typography and color carry the page", "Let typography and photographs carry the color") | Steps 2, 7, 10, 12, 21, 22 |
| Menu | "menu", "navigation" (Step 1), "navigation bar" (Step 18, "Frosted glass": "The navigation bar stays in view") | Steps 1, 18 |
| The card for my current values | "Your design now" (card), "Keep my design and continue" (button), "Continue to the next Step" (button after hand-setting), "Show small variations of “Your design now”", "As it was" (variations view), "Set by hand", "close to …" | Steps 8, 9, 11, 12, 15, 17 |
| First screen | "first screen", "hero" (Step 2), "Background at the top of the page" (Step 16 name in the list) while its question says "What sits behind the first screen?" and its fold says "the background of the first screen" | Steps 2, 16 |
| Main color | "main color", "accent" ("Fights with red or pink accents", Step 11) | Step 11 |
| Light or dark | "Light or dark" (Step 14 name), "themes" ("especially on dark themes", "Dark themes and instrument-panel styles", "Subtle on light themes") | Steps 16, 18, 20 |
| Box | "box", "tile" ("One large tile with a photo, and smaller tiles"), "card" in a source line ("identical cards everywhere") while "card" also means the Studio's own choice cards | Steps 3, 18 |
- Fix: pick one word per concept and replace the others: "letter style" everywhere (drop "type" and "typography"; keep "font" only for a named font file); "menu" everywhere; "your current values" for the special card, with the button "Keep your current values and continue"; rename Step 16 to "Background of the first screen"; "main color" for "accent"; "light pages / dark pages" for "themes"; "box" for "tile".

### U3-06 (major): the "Second color" slider shows on a card that has no second color, and its end labels read as broken text
- Where: Step 13 "Amount of color", "Adjust with sliders", 1440x900 (`1440x900-33-step13-slider.png`).
- Quoted: the card in use is "Color in small details only" ("the main color appears only in links and small details"); the slider below reads "Second color 60° (orange)", with "around the" under the left end and "color wheel" under the right end. The same split appears on Step 11 "Tint color" and Step 12 "Color (hue)".
- Problem: I move "Second color" and expect a second color to appear; this card has none, so I conclude the slider is broken. "around the … color wheel" reads as two broken half-sentences, not as "this slider goes around the color wheel".
- Fix: hide or disable "Second color" while the card in use has no second color, and say why ("This card uses no second color"). Put one caption under the whole slider: "Moves around the color wheel: red, yellow, green, blue, purple, back to red."

## Minors

| ID | Where (view, Step, size) | Quoted on-screen text | Problem | Fix |
|---|---|---|---|---|
| U3-07 | Phone 375x800, Steps 2, 3, 22 | card names "Everything centered", "Alternating photo and text", "Numbered list beside a fixed title", "Highlighter stroke on a phrase" | The word breaks in the middle: "Everythin / g" (`375x800-12-undo.png`). The "Overused look" badge also wraps to two lines. | Let card names wrap only between words (`overflow-wrap: normal`, `hyphens: auto` with `lang`), or let the title span the full card width under the number. |
| U3-08 | Directions, after "Start again" | (no notice) | The confirm promises "You can undo it until you close or reload this page", but after "Start again" no notice says it happened or offers Undo. Undo in the top bar does work, and then says "Undone: your project is back to how it was before the last change." That does not say which change. | After "Start again", show "Started again from Ember Noir. Your old project is in the Summary under kept copies. [Undo]". Make the Undo notice name the change: "Undone: you are back on your project from Paper and Ink." |
| U3-09 | Summary, "Copies the Studio kept for you", all sizes | "as it was when you replaced it or started again. Kept on 2026-11-13 at 18:09 (UTC)." | "replaced it or started again" makes me guess which one happened. "UTC" is a technical term and is not my clock's time. On the phone the date breaks as "2026- / 11-13". | Say which event: "as it was before you started again from Ember Noir". Show local time ("today at 7:09 pm"). Keep the date on one line. |
| U3-10 | Summary, kept copy removal | after "Yes, remove it for good": the section disappears | Nothing confirms the removal; the heading simply vanishes. | Show "Kept copy removed." in a status line for a few seconds. |
| U3-11 | Steps 6, 8, 9, 11, 12, 15, 17, 19, sliders | accessible names "Spacing", "Thickness of the letters", "Letter spacing", "Text size", "Heading size jump", "Tint color", "Tint strength", "Color (hue)", "Vividness", "Lightness", "Text contrast", "Corner rounding", "Line thickness"; values "1.15", "500", "-0.022em", "0.012", "0.19", "0.82" | The names are clear. The values are bare numbers (see U3-03). The visible end labels ("tighter / looser", "softer / crisper") are not linked to the slider, so a screen reader hears only "0.82". The slider's real value and its announced value differ: Text contrast value 0.8 announced "0.82"; Letter spacing value -0.02 announced "-0.022em"; Heading size jump value 1.342 announced "1.34". The first arrow press therefore jumps from a value the slider cannot hold. | Announce words with a scale ("crisp, 82 of 100"); link the end labels with `aria-describedby`; keep the slider value and the announced value the same. |
| U3-12 | Open a project file, Summary | "That file was not opened. It is not a Refraction project file. Your open project is unchanged." | Clear and honest. It does not say what a project file looks like or where I would have one. | Add: "A project file is the .json file that “Download the project file” saves." |
| U3-13 | Step 17 "Corners", explanation | "It rounds a box one and a half times as much as the buttons inside it, so that the two curves run nearly side by side. The exact rule adds the gap between box and button to the button’s rounding; the Studio comes close to that rule and does not follow it exactly." | Too long and too technical for the question "How rounded are the corners?" I cannot see this in the preview. | Move the last two sentences into the fold. Keep: "Boxes are rounded a little more than the buttons inside them, so the curves look parallel." |
| U3-14 | Step 18 "Box edges and shadows", explanation | "a shadow is a stack of faint layers that starts with a one-pixel ring" | I cannot see "layers" or a "ring" in the cards. | "Good shadows are made of several very faint shadows, plus a thin outline you barely notice." |
| U3-15 | Directions, "Sunlit Studio"; Step 12 "Golden yellow" | "darkens yellow links to 3 to 1 against the page … text reads best at 4.5 to 1" | "3 to 1" and "4.5 to 1" are contrast ratios, explained nowhere on the first screen. Step 15 explains contrast later. | "darkens yellow links until they stand out from the page; “Fix for me” darkens them further, to the level recommended for reading text." |
| U3-16 | Step banner after leaving a Step without picking | "You looked at “No motion” on “Motion” and did not pick it, so your design did not change." | "on “Motion”" reads oddly. | "On the Step “Motion” you looked at “No motion” but did not pick it. Your design did not change." |
| U3-17 | Step 15 "Text contrast" | "When a pair of colors falls below that guideline, a contrast note under the large preview gives the measured figure." | With "Low contrast (soft)" on show I saw no note under the large preview (`1440x900-32-step15-low.png`). Either no pair fell below the guideline (so the sentence promises something I may never see), or the note is missing. I could not tell which. | Always show one line under the preview on this Step, for example "Lowest text contrast here: 6.1 to 1 (guideline: 4.5 to 1)". |
| U3-18 | Summary, 375x800 | the "Dress the Studio itself …" checkbox measures 14x20 px | It is squeezed narrower than on the other sizes (20x20) and is under 24 px. Its label probably widens the tap area, but the box itself looks squashed. | Give the checkbox `flex: none` and at least 20x20, with the label as the tap area. |
| U3-19 | Summary footer | "Licences of the fonts and code inside the Studio" | British "Licences"; elsewhere the text says "SIL Open Font License". The link is 16 px tall. | Use one spelling. Give the link more padding (24 px). |

## Wording table (plain-language failures on the Steps)

A technical word in round brackets after a plain explanation is acceptable, so I do not list "(designers call it the navigation)", "(hue)", "(chroma)", "(serif)", "(tabular numerals)" and similar here. The fold findings are under U3-02.

| Step | Quoted text | Problem | Suggested plain wording |
|---|---|---|---|
| 2 First screen | "Watch for: Plain, unless the type carries it." | "type" is unexplained | "Plain, unless the letter style is striking." |
| 2 First screen | "with the paragraph and buttons in a row beneath a rule" | "rule" here means a line, which is not ordinary use | "beneath a thin line" |
| 2 First screen | "(designers call it the hero)" | Acceptable, but "hero" then appears unexplained in the fold quote "centered hero plus Inter" | Drop the quote or gloss it. |
| 7 Letter style | "Public Sans", "Fraunces", "Newsreader", "Instrument Sans", "Playfair Display", "DM Sans", "Outfit", "Space Grotesk", "Manrope", "Bricolage Grotesque", "Source Serif 4", "Inter" | Nothing says these are the names of fonts | Start each description with "Uses the fonts named …" or add one line: "Names such as Public Sans are font names." |
| 7 Letter style | "Neutral and unnoticed (Inter)" | The only card name with a font name in it | "Neutral and unnoticed" |
| 7 Letter style | "Reading text in letters with small feet feels unusual in an application." | "application" means app here | "…feels unusual in an app or tool." |
| 8 Heading style | "letter spacing -0.022em" | "em" is unexplained | See U3-03. |
| 9 Text size | "15 px text", "17 px text", "19 px text" | "px" is never spelled out on this Step (Step 4 says "pixels") | "15-pixel text (small)" |
| 9 Text size | "heading size jump 1.34" | The number is explained only in the intro, as a multiple | "headings grow by about a third at each size" |
| 11 Tint of the grays | "Pick it when: Warmth with more energy than sand." | "sand" is the name of another product's gray family, shown only in the fold | "Warmth with more energy than the warm gray." |
| 11 Tint of the grays | "Fights with red or pink accents." | "accents" | "Clashes with a red or pink main color." |
| 12 Main color | "Reads as error color in forms; keep error states distinct." | "error states" | "Red also signals mistakes in forms; make the mistake messages look different." |
| 12 Main color | "Close to error red." | Same | "Close to the red used for mistakes." |
| 12 Main color | "Let typography and photographs carry the color." | "typography" | "Let the letters and photographs do the work." |
| 14 Light or dark | "Near-black with one acid-bright color" | "acid-bright" | "near-black with one harsh neon color" |
| 16 Background | "Pick it when: Focus and drama, especially on dark themes." / "On light themes it must stay faint." | "themes" | "on dark pages" / "on light pages" |
| 16 Background | "costs a little rendering speed" | "rendering" | "makes the page draw a little more slowly" |
| 17 Corners | "Large radii on small elements look bubbly." | "radii", "elements" | "Very round corners on small buttons look bubbly." |
| 18 Box edges | "a crisp edge that looks machined" | Unclear image | "a crisp, exact edge" |
| 18 Box edges | "Translucent boxes that blur what is behind them" | "translucent" | "See-through boxes that blur what is behind them" |
| 18 Box edges | "The navigation bar stays in view and frosts over the page." | "navigation bar" (Step 1 calls it the menu) | "The menu stays at the top and looks frosted over the page." |
| 18 Box edges | "coss ui, the design rules of Cal.com, on dark pages (boxes get lighter as they rise)" | "rise" is unclear | "(boxes that sit higher on screen get lighter)" or drop |
| 18 Box edges | "(the style called neo-brutalism)" | Acceptable (plain first), noted only | n/a |
| 19 Line thickness | "Page dividers vanish; inputs keep a thin outline." | "inputs" | "…form fields keep a thin outline." |
| 21 Headline color | "Full ink at the top fading slightly toward the bottom." | "ink" | "Full color at the top, fading slightly toward the bottom." |
| 21 Headline color | "Invisible on small or thin type." | "type" | "You will not see it on small or thin letters." |
| 22 Special touch | "No decoration; typography and color carry the page." | "typography" | "No decoration; the letters and colors carry the page." |
| 22 Special touch | "Very large headlines in thick letters." / "Hard to read … in thin letters" | Fine | n/a |
| 23 Motion | "colors ease on hover", "boxes lift on hover", "move the pointer over a button" | "hover" is unexplained (the last phrase explains it, two lines later) | "colors change gently when the pointer is over them" |
| 23 Motion | "Every Option stops moving for a visitor whose device asks for less motion." | Plain enough; a person may not know a device can ask this | "…for a visitor who has turned on “reduce motion” in their device settings." |
| Summary | "the instructions for an AI coding tool, the files of exact design values, and the reference page" | "reference page" and "files of exact design values" are unexplained | "…a sample page that shows your design, and files that list every color and size." |
| Every Step with a "Your design now" card | "Show small variations of “Your design now”" | Odd phrase (see U3-05) | "Show small variations of your current values" |

## Notes

- **U3-20 (note).** Directions, Step 1 "Back to the Directions", and "Go on with my project" all work at every size. The line "You already have a project, started from Paper and Ink. If you start from another Direction, the Studio asks first, and you can undo it." is clear.
- **U3-21 (note).** The line above each question, now with the Step's name, never got cut off. It fits on one line at 1440 and 720. On the phone, "LOOK AND FEEL · STEP 16 OF 23 · BACKGROUND AT THE TOP OF THE PAGE" wraps to two lines (36 px) and stays readable. No sideways page scroll at any size on the first screen, Step 1, or the Summary.
- **U3-22 (note).** The line that counts the cards is clear: "This Step has 4 cards; scroll down if you do not see them all." On a phone it switches to "Tap a card to see it large. Then tap the main button to pick it." On Steps 7 and 12, cards 10 to 14 have no number key; the hint says "Keys 1 to 9 do the same; the arrow keys reach every card", which explains this.
- **U3-23 (note).** The "Start again" confirmation is clear and readable at 720x450 (`720x450-15-confirm.png`). The kept-copy download works at all three sizes and saves `refraction-kept-copy-1.json` (4,420 bytes). The two-press removal works ("Remove this kept copy…" → "Yes, remove it for good" / "No, keep it").
- **U3-24 (note).** On Step 13 the thumbnail of card 7 ("First screen painted in solid color") was blank white for a moment after I jumped to the Step. It filled in within 3 seconds; it loads only when needed. A person who scrolls fast may briefly see an empty card.

## Functional checks that passed

- No page errors or console errors in any run.
- The Undo notice with "Go to “Menu (navigation)”" returned me to Step 1 at 1440x900.
- A hand-set slider value reads back as "Set by hand: …" in the list of Steps and in the Summary, and counts as a Decision ("You have decided 2 of 23 Steps").
- Opening a non-project file leaves the project unchanged and says so.
- No control under 24x24 px on the first screen. On Step 1 and the Summary, the only small controls are 20x20 checkboxes with labels and the 16-px-tall licence link (U3-18, U3-19).
