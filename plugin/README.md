# The Fitter of Frontend Focus (a Claude Code plugin)

The Fitter makes Claude build one page from a Vision, measure it in a real browser, and repair it. A Vision is the set of seven files that Frontend Focus Studio hands over (`VISION.md` and six more).

## What it needs

- Node 22.18 or newer (the program is TypeScript that Node runs directly).
- Playwright 1.65 and its Chromium browser, where Node can find them from this folder: run `npm install` and `npx playwright install chromium` in this folder once. On a machine whose Chromium is elsewhere, set `PW_CHROMIUM` to its path.

## How to load it

Start Claude Code with `claude --plugin-dir <path to this folder>`. The commands then show as `/frontend-focus-fitter:fit-build`, `/frontend-focus-fitter:fit-check`, and `/frontend-focus-fitter:fit-repair`.

## The commands

| Command | What it does |
|---|---|
| `fit-build <folder of the Vision> <output file>` | Claude reads the seven files, builds one page, writes what it judged, and runs the check |
| `fit-check <build.html> <folder of the Vision> <result folder>` | The program measures the page and writes `RECEIPT.md` and `receipt.json` |
| `fit-repair <build.html> <folder of the Vision> <result folder>` | Claude repairs the smallest thing for each deviation and checks again, at most three rounds |

## What the receipt says, and what it does not

The receipt keeps three things apart: what the program measured, what the model judged, and what still needs a person. It never says that a page is good, finished, or that it meets a standard. The program checks only a part of some Floor requirements, and it says which.

Without Claude Code, the program runs alone: `node fit/src/cli.ts [--no-scripts] [--round <n>] [--judged <file>] <build.html> <folder of the Vision> <result folder>`.
