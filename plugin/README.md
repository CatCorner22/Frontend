# The Fitter of Frontend Focus (a Claude Code plugin)

The Fitter is the second half of Frontend Focus. The Studio lets you choose a design and hands you a **Vision**: seven files (`VISION.md` and six more) that describe the design for an AI coding tool. The Fitter makes Claude build one page from a Vision, measure that page in a real browser, and repair it. The measurement is called the **Fit check**, and its report is the **receipt**.

## What you need, and why

1. **Node 22.18 or newer.** The Fit check is a program written in TypeScript, and Node from version 22.18 runs TypeScript directly. Check with `node --version`.
2. **Playwright 1.65 and its Chromium browser.** Playwright is the library that opens a real browser for the measurement. In this folder, run `npm install` once (it fetches Playwright), then `npx playwright install chromium` once (it fetches the browser, which is a large download). If the second command ends without an error, the browser is there.
3. **A Vision folder that comes from your own Studio.** The Fit check trusts the Vision folder as the statement of your design. Do not point it at a folder from someone else.

What can go wrong: if Node is older, the program stops with a syntax error at its first line. If the browser is missing, the program says "The Fit check stopped" and names the missing browser. On a machine whose Chromium is elsewhere, set the environment variable `PW_CHROMIUM` to its path.

## How to load the plugin

Start Claude Code with `claude --plugin-dir <path to this folder>`. Claude Code then shows four commands. It names a plugin's command with the plugin's name in front: `/frontend-focus-fitter:fit-build`, `/frontend-focus-fitter:fit-check`, `/frontend-focus-fitter:fit-repair`, and `/frontend-focus-fitter:fit-look`. (Nobody has yet run these four commands in a Claude Code session; the folder passed Claude Code's own check of a plugin's form, `claude plugin validate`, with one remark: it has no install line for a marketplace.)

Claude Code asks you each time before it runs the program. That is intended: the commands pre-approve reading and writing files, not running programs.

## The commands

| Command | What it does |
|---|---|
| `fit-build <folder of the Vision> <output file>` | Claude reads the seven files, builds one page, writes down what it judged by eye, and runs the Fit check |
| `fit-check <build.html> <folder of the Vision> <result folder>` | The program measures the page and writes `RECEIPT.md` (for you) and `receipt.json` (for programs) into the result folder |
| `fit-repair <build.html> <folder of the Vision> <result folder>` | Claude repairs the smallest thing for each deviation and checks again, at most three rounds |
| `fit-look <build.html> <folder of the Vision> <result folder> [folder of font files]` | A second program (the look) draws the page and the Vision's Mockup at three window widths and saves the pictures and a report, `look/LOOK.md`, into the result folder; Claude reads them and says what differs. Use it after `fit-check`: the Fit check reads style values and never sees the page. The look is advice: nothing in it is a deviation, and it changes no status |

An example: `/frontend-focus-fitter:fit-check build/index.html vision/ result/`, then open `result/RECEIPT.md`.

## What the program's status means, and what you do

| Status | Meaning | What you do |
|---|---|---|
| 0 | No deviation in the measures that count. The contrast of some texts may still be unread; the program's one line and the receipt say how many | Read "Still needs a person" in the receipt, and look at the page |
| 1 | At least one deviation, or something that the program could not measure | Read the deviation lines; repair by hand or with `fit-repair` |
| 2 | The program refused and wrote no receipt (a file is missing, the files do not belong together, the repair budget is spent) | Read its one line; it says why |

## The three repair rounds

A repair has a budget of three rounds. Claude counts the rounds and passes the number to the program; the program writes the number into the receipt and refuses a fourth. After round 3, if the page still deviates, the receipt says that the budget is spent. Then you decide: accept the page with the listed deviations, repair it by hand, or change the design in the Studio and write the Vision again.

## What the receipt says, and what it does not

The receipt keeps three things apart: what the program measured, what the model judged, and what still needs a person. It never says that a page is good, finished, or that it meets a standard.

- The program compares colors, typefaces, corner radii, contrast, the three required texts, the width, and requests to other sites with the Vision, at 375, 768, and 1280 pixels.
- The program checks only **a part** of some Floor requirements (for example, for requirement A2 it checks that every image has an `alt` attribute, not that the words fit the picture). The receipt lists that part for each requirement, by its id.
- The program reads the Floors in one wording, called an edition. A Vision from an older Studio may word a requirement differently; the program then checks none of the Floors and says so. Write the Vision again from the Studio.

## Running the program without Claude Code

`node fit/src/cli.ts [--run-scripts] [--round <0 to 3>] [--judged <file>] <build.html> <folder of the Vision> <result folder>`

| Option | What it does |
|---|---|
| `--run-scripts` | The page's own scripts run, as in a visitor's browser, and the program reads the page from a place that those scripts cannot reach. Without the option no script of the page runs: the program reads the page as its markup stands, so a page that draws its text or its style with a script reads as empty until you pass the option |
| `--round <n>` | The round of repair after which this check runs: 0 for a first check (the default), 1 to 3 after a repair. The program refuses 4 and above |
| `--judged <file>` | A text file in which the model wrote one judgment on each line. The receipt shows at most 20 of them, apart from what the program measured |

In the repository of Frontend Focus, `npm run fit -- <the same arguments>` runs the same program.
