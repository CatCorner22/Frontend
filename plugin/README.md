# The Fitter of Frontend Focus (a Claude Code plugin)

The Fitter is the second half of Frontend Focus. A **plugin** is a folder of commands that Claude Code loads beside its own; this folder is one. The Studio lets you choose a design and hands you a **Vision**: seven files (`VISION.md` and six more) that describe the design for an AI coding tool. The Fitter makes Claude build one page from a Vision, measure that page in a real browser, and repair it.

Two programs do the measuring and the drawing:

- **The Fit check** measures the page and writes the **receipt** (in the project’s records: the Honest receipt), a report that keeps apart what a program measured, what a model judged, and what still needs a person.
- **The look** draws the page and saves pictures. It measures nothing and judges nothing.

## Words that this guide uses

| Word | Meaning |
|---|---|
| Node | The program that runs the Fit check and the look on your machine. You start it with the word `node` |
| TypeScript | The language in which the two programs are written. Node from version 22.18 runs it directly |
| Chromium | The open browser that Chrome is built from. The two programs open your page in it |
| Environment variable | A named value that you set in the terminal before you start a program, so that the program can read it |
| Mockup | The sample page of your design, the file `mockup.html` in the Vision folder. The Studio's screen calls it "Sample website" |
| Markup | The HTML text of a page, as it stands in the file before any script runs |
| Deviation | One thing on the page that differs from the Vision: a color, a typeface, a corner radius, a missing text, and so on |
| Status | The number with which a program ends: it tells you, and Claude, how the run went |
| Floor | A requirement that the Studio writes into the Vision, in section 7 of `VISION.md`: use by people with disabilities, the page's security, the host's settings, search, and speed |
| Edition | The wording of the Floors that a Vision was written in. The Fit check reads one edition |
| The three required texts | The business name, the headline, and the primary action, as the Mockup shows them |
| Marketplace | A list from which Claude Code can install a plugin by name. This plugin is in none; you load it from its folder |

## What you need, and why

1. **Node 22.18 or newer.** Check with `node --version`.
2. **Playwright 1.65 and its Chromium browser.** Playwright is the library that opens a real browser for the measurement. In this folder, run `npm install` once (it fetches Playwright), then `npx playwright install chromium` once (it fetches the browser, which is a large download). If the second command ends without an error, the browser is there.
3. **The Vision folder, unpacked, from your own Studio.** The Studio hands you the Vision as one archive (a `.zip` file) or as seven single files. Unpack the archive first: the two programs read a folder, not an archive. The Vision folder must hold the 7 files under their own names (`VISION.md`, `DESIGN.md`, `tokens.json`, `tokens.css`, `theme.css`, `mockup.html`, `FONTS.md`); a browser that saved a second download as `tokens (1).css` has given the file another name, and the programs will not find it.

The Fit check takes the Vision folder as the statement of your design and measures the page against the files as they are. Do not point it at a folder from someone else. The repair command lets Claude write files, so Claude can write to the Vision folder too; the command forbids it, and the receipt names each file that the Fit check read by a checksum (SHA-256), so that a change shows.

What can go wrong: if Node is older, a program stops with a syntax error at its first line. If the browser is missing, the program says that it stopped and names the environment variable `PW_CHROMIUM`: set it to the path of a Chromium that is on your machine. If a browser is there and does not start, the program says so and quotes the browser's own first error line. If you give the archive in place of the unpacked folder, the program says that it got a file and asks you to unpack it.

## How to load the plugin

Start Claude Code with `claude --plugin-dir <path to this folder>`. Claude Code then shows four commands. It names a plugin's command with the plugin's name in front: `/frontend-focus-fitter:fit-build`, `/frontend-focus-fitter:fit-check`, `/frontend-focus-fitter:fit-repair`, and `/frontend-focus-fitter:fit-look`. (Nobody has yet run these four commands in a Claude Code session. The folder passes Claude Code's own check of a plugin's form, `claude plugin validate`, with warnings and no error. The warnings change with the version of that check, so this guide gives no count: run the command to read them. On 2026-11-22 they concerned things that matter only where a plugin is offered to others through a plugin directory: an author, a licence, an icon, and an install line. You load this plugin from its folder, so none of them stops you.)

Claude Code asks you each time before it runs a program. That is intended: the commands pre-approve reading and writing files, not running programs.

## The commands

| Command | What it does |
|---|---|
| `fit-build <Vision folder> <output file>` | Claude reads the seven files, builds one page, writes down what it judged by eye, and runs the Fit check |
| `fit-check <build.html> <Vision folder> <result folder>` | The Fit check measures the page and writes `RECEIPT.md` (for you) and `receipt.json` (for programs) into the result folder |
| `fit-repair <build.html> <Vision folder> <result folder>` | Claude repairs the smallest thing for each deviation and checks again, at most three rounds |
| `fit-look <build.html> <Vision folder> <result folder> [folder of font files]` | The look draws the page and the Mockup at three window widths and saves the pictures and a report, `look/LOOK.md`, into the result folder; Claude reads them and says what differs. Use it after `fit-check`: the Fit check reads style values and never sees the page. The look is advice: nothing in it is a deviation, and it changes no status of the Fit check |

An example: `/frontend-focus-fitter:fit-check build/index.html vision/ result/`, then open `result/RECEIPT.md`.

## What the Fit check’s status means, and what you do

| Status | Meaning | What you do |
|---|---|---|
| 0 | No deviation in the measures that count, and nothing "not measured" in them. One thing is left out of that: a text whose contrast the Fit check could not read changes the status only where the Vision requires contrast and the Vision's Mockup shows that same text readably (the one line says so); an unread text that is unread in the Mockup too never changes the status; the Fit check's one line and the receipt say how many readings of how many texts | Read "Still needs a person" in the receipt; where the one line names unread contrast, read the list of those texts under "Contrast" in the receipt and judge each by eye; and look at the page |
| 1 | At least one deviation, or something that the Fit check could not measure or did not check. There are three cases; see below | Deviation lines: repair by hand or with `fit-repair`. "Not measured" and no deviation line: do not repair; read below. None of the Floor requirements checked: write the Vision again from the Studio |
| 2 | The Fit check refused and wrote no receipt (a file is missing, a file was given in place of the Vision folder, the files do not belong together, the repair budget is spent, the command was not written in its form, or no browser started) | Read its one line; it says why |

**The measures that count** for the status are Requests, Colors, Typefaces, Corner radii, Content, Width, and Floors, and Contrast only where the Vision writes Floor A1 (the least contrast of text) in the edition that the Fit check reads. Where Contrast counts, a text whose contrast the Fit check cannot read makes the page "not measured" (status 1), unless the Mockup leaves a text with the same words unread too: the Mockup itself holds a few such texts (text on a partly see-through box), and a page that copies them faithfully is not marked for it. Where Contrast does not count, an unread contrast never changes the status.

**The Mockup is not a built page.** It is a still sample: its links lead nowhere and its form sends nothing. Checked against its own Vision it shows no deviation in the design, and it shows deviation lines under Floors. Do not repair the Mockup; build your page and check that.

**The three cases of status 1.** More than one can hold at once.

- *Deviation lines.* The receipt lists what differs. Repair each by hand, or let `fit-repair` do it.
- *"Not measured" and no deviation line.* The Fit check could not read a part of the page, and it does not call an unread page good. The receipt names the part under "What the program could not read" or under its measure, for example: a frame, a closed shadow root, a script that did not run, an animation that never ends, a blend effect, a color under a filter, a shape that a picture takes from another file, a required text under a mask, a window that did not load, or a setting of the screen that the page's style rules name and the Mockup does not (a sharp phone screen, a touch screen, dark mode). No repair round helps here, because nothing deviates. Take the part out of the page, or judge it by eye and accept the page; the receipt will keep saying what it could not read.
- *None of the Floor requirements was checked.* The Vision comes from an older Studio, which words the Floors in another edition; the Fit check's one line says how many requirements it left unchecked. No repair round helps. Write the Vision again from the Studio, then check again.

## What the look’s status means, and what you do

| Status | Meaning | What you do |
|---|---|---|
| 0 | Every window width was pictured | Open `look/LOOK.md` and the pictures beside it |
| 1 | At least one window width was not pictured (the page did not load or did not answer in time) | Read "Not pictured" in `look/LOOK.md`; it names the width and the reason |
| 2 | The look refused and wrote nothing (a file is missing or is no ordinary file, a file was given in place of the Vision folder, the files do not belong together, the command was not written in its form, or no browser started) | Read its one line; it says why |

## The three repair rounds

A repair has a budget of three rounds. Claude counts the rounds and passes the number to the Fit check; the Fit check writes the number into the receipt and refuses a fourth. After round 3, if the page still deviates, the receipt says that the budget is spent. Then you decide: accept the page with the listed deviations, repair it by hand, or change the design in the Studio and write the Vision again.

After a repair round the receipt also says whether a file of the Vision folder changed since the earlier receipt in the result folder, and which round that earlier receipt states.

## What the receipt says, and what it does not

The receipt keeps three things apart: what the Fit check measured, what the model judged, and what still needs a person. It never says that a page is good, finished, or that it meets a standard.

- The Fit check compares colors, typefaces, corner radii, contrast, the three required texts, the width, and requests to other sites with the Vision, at 375, 768, and 1280 pixels.
- The Fit check checks only **a part** of some Floor requirements (for example, for requirement A2 it checks that every image has an `alt` attribute, not that the words fit the picture). The receipt lists that part for each requirement, by its id.
- The Fit check reads the Floors in one edition. A Vision from an older Studio may word a requirement differently; the Fit check then checks none of the Floors, says how many requirements it left unchecked, and ends with status 1. Write the Vision again from the Studio.
- Under "Still needs a person" every receipt lists what no program checked, and the limits of the Fit check itself: other window widths and heights, a page that changes later, the Vision folder that it takes as yours.

## Running the Fit check without Claude Code

In this folder (the folder that holds this guide), run:

`node fit/src/cli.ts [--run-scripts] [--round <0 to 3>] [--judged <file>] <build.html> <Vision folder> <result folder>`

From another folder, Node does not find the program and stops with "Cannot find module"; that is no status of the Fit check.

| Option | What it does |
|---|---|
| `--run-scripts` | The page's own scripts run, as in a visitor's browser, and the Fit check reads the page from a place that those scripts cannot reach. Without the option no script of the page runs: the Fit check reads the page as its markup stands, so a page that draws its text or its style with a script reads as empty until you pass the option |
| `--round <n>` | The round of repair after which this check runs: 0 for a first check (the default), 1 to 3 after a repair. The Fit check refuses 4 and above |
| `--judged <file>` | A text file in which the model wrote one judgment on each line. The receipt shows at most 20 of them, in a part of its own, separate from what the Fit check measured |

In the repository of Frontend Focus, `npm run fit -- <the same arguments>` runs the same program.

## Running the look without Claude Code

In this folder, run:

`node fit/src/look-cli.ts [--run-scripts] [--fonts <folder>] <build.html> <Vision folder> <result folder>`

| Option | What it does |
|---|---|
| `--run-scripts` | The page's own scripts run before the look draws the page. Without the option no script of the page runs |
| `--fonts <folder>` | A folder that holds the font files which `FONTS.md` names. With it the look draws the letters that your visitors will see; without it a typeface that the page loads from the site's own address is not drawn |

The look writes its pictures, `LOOK.md`, and `look.json` into the folder `look` inside the result folder, beside the receipt.
