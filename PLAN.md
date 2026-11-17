# Plan: "Frontend Focus" — your personal design studio and fitter for LLM-built frontends

**Version 3.8, 2026-11-17.** Versions 1 (2026-11-13) and 2 (2026-11-14) are in the repository's history. Section 10 lists what changed and why. The app is named "Frontend Focus" (your name for it, decision D75).

**How to read this plan.** Sections 1 to 3 say why the tool exists. Section 4 is the map of the forest: every part of the tool and its state today. Sections 5 to 7 say what it is built from. Section 8 holds the milestones. Section 9 lists what can go wrong. Each statement about the present says "built", "being built", or "not built".

## 1. Context

**Problem.** LLM coding tools produce generic UI for two reasons that your own files identify: nobody makes the design decisions ("a decision problem"), and the LLM never looks at what it rendered ("a feedback-loop problem").

**Your idea.** Divide frontend design into tiny steps, each with several concrete options to pick from, so that you and the LLM communicate apples to apples.

**What this plan builds.** Two halves that match the two causes:
- **The Studio** (a web app) fixes the decision problem. You pick; it writes the **Vision**.
- **The Fitter** (a Claude Code plugin) fixes the feedback-loop problem. It makes Claude build from the Vision, look at the rendered result, measure it, and repair it before reporting.

**Who it is for.** You alone. No licensing, accounts, payments, or marketing. The tool earns nothing by itself; it raises the quality of what you sell. Therefore the plan puts a real, sellable project through the tool as early as possible (milestone M8).

**Where it stands today, in one paragraph.** The Studio's choosing half is built: 38 starting looks (each in several Skins), 23 decisions, six Overlays, five research rules, a live preview, reliable saving, a project file, twelve craft rules, the screen "Your content", and the Vision (seven files and one archive file) with its Floors (56 requirements in five Floors, in `VISION.md` section 7). The Fitter is built as a Claude Code plugin: the Fit check measures a built page against the Vision at three window widths, checks a part of 33 Floor requirements, and the commands build, check, and repair in at most three rounds. Three helper agents built pages from the files (trials 001 to 003). Open: nobody has run the plugin's commands in Claude Code; your trial of the Studio (M4); the rest of M5. Section 13 gives the remaining work with time estimates.

**Your standing wish (2026-11-14).** Simple, effective, useful features; no giant heap of slop. Every part of this plan is held to that: each feature in its smallest useful form, and a plain statement of what was left out.

## 2. The metaphor: the eye exam and the fitting

| Eye care | Frontend Focus | State |
|---|---|---|
| You try on a few finished frames first | A **Direction**: a complete starting look | built (38) |
| The same frame in another color | A **Skin**: pre-built colors and color fades for a Direction | built (12 Skins; 33 of the 38 Directions offer 1 to 5, the other five paint their main color on small marks only) |
| "Which is clearer, 1 or 2?" | Each **Step** shows several **Options** | built (23 Steps) |
| Each comparison changes one lens only | Each Step changes one design variable; all else stays fixed | built |
| You read the same letter chart every time | Every Option renders on the same **Mockup** | built; it shows your own texts once you write them on the screen "Your content", and the sample's words until then |
| You need no knowledge of optics | Each Step teaches its concept in plain words | built |
| Coatings and extras: anti-glare, a case | An **Overlay**: a small helper over the page (a tooltip, an "Are you sure?" question) | built (first set of six) |
| No lens that harms you is offered | Contrast checks warn or repair, as you choose | built |
| The written vision | The **Vision**: a Markdown prompt plus token files | built: seven files and one archive, and the Floors in `VISION.md` (2026-11-16) |
| The optician fits the glasses and has you read the chart again | The **Fitter** renders the build, measures it, and repairs | built (M7, 2026-11-17): the Fit check, and the commands for building, checking, and repairing; nobody has run the commands in Claude Code yet |

In your forest terms: a Step is a tree, a design dimension is a species, section 4 maps the forest, and section 9 lists what can go wrong.

## 3. What the tool rests on

### 3.1 What the best human-built frontends do
The pattern across the published rule sets and design systems that were read (GOV.UK, Radix, Vercel, Emil Kowalski, Jakub Krehel) and the company posts seen only as search summaries (Linear, Stripe, Apple, and others):

1. **A few inputs generate the whole system.** → The Studio derives every color and size from a few picks, in a perceptual color space (OKLCH), with contrast measured on the colors as they are drawn.
2. **Every value has a job.** → Tokens are named for their role, never raw.
3. **Bespoke feel lives in details that nobody asks for** (even-width numerals, balanced headings, corner radii that nest, press feedback, short ease-out motion). → The **craft layer** writes such rules into every Vision automatically (M5).
4. **Restraint and one signature move.** → One Step for "one special touch"; warnings for looks that many AI-made pages share.
5. **The exemplars disagree** (dense versus generous; motion versus none). → Those disagreements are exactly the Steps.

### 3.2 The research base
The repository holds a knowledge base (`docs/knowledge/`): 138 records on perception, attention, memory, typography, color, first impressions, trust, and satisfaction. Each record states a rule, its mechanism, how to check it, its sources, and an evidence grade from A (a law, a standard, or a replicated experiment) to D (folklore). Research helpers wrote the records; nobody has reviewed them, and many rest on abstracts or search summaries. On 2026-11-14 four more parts were commissioned: language and reading; the mathematics of proportion, scale, and color; eye-tracking and the science of visual preference; Japanese minimalism and design.

**What research can and cannot do.** It can rule out bad choices: text too small, lines too long, contrast too low, targets too small. It cannot prove that a look is beautiful; that stays your judgment. The tool therefore uses research in two ways only:
- as **research rules**: checks that a program can measure, each with its record and its grade, shown on the Summary as "holds" or "does not hold";
- as the plain-language teaching text of a Step.
A rule graded C or D is shown as opinion or folklore, never as science.

## 4. How the tool works (map of the forest)

### 4.1 The path through the Studio

| # | Screen | What you do there | State |
|---|---|---|---|
| 1 | Directions | Pick a complete starting look from four groups (light and calm; dark and dramatic; warm and nostalgic; bold and playful), or let the Studio compose six more at random, or start plain | built |
| 1b | Direction Creator | Keep the design on screen as a Direction of your own, name it, describe it; it then appears among the Directions, in a group "Your own"; rename, remove, download, and open them as one file (section 4.7) | built on 2026-11-15; not yet tried by you |
| 1a | Skin | On a Direction's card, pick one of its pre-built skins: other colors, with or without a color fade in the headline | built; a Skin is chosen when a project starts, and the project records its name |
| 2 | Steps | 23 Steps in two stages (6 for layout, in gray; 17 for look and feel). On each: compare cards, pick one, fine-tune with sliders, ask for small variations, write a reason, decide later, undo, or put the Step back | built |
| 3 | Overlays | Switch small helpers on or off; the preview draws each one open, in your design | built |
| 4 | Summary | Read every Decision back; see the contrast notes and the research rules; download or open a project file; manage kept copies | built |
| 5 | Export | Receive the Vision | built: the Summary hands over seven files, singly or as one archive, and `VISION.md` holds the Floors (2026-11-16) |

### 4.2 Rules that hold at every Step
1. One variable per Step. Apples to apples.
2. Structure before decoration: layout Steps show the page in gray.
3. Every Option carries plain-language text: what it is, when to pick it, and what to watch for. A source and an evidence grade stand behind every Step (hard rule 5). An exemplar is named only where a research record supports it.
4. Plain words (decision D38): a trade word appears only in round brackets, as a word to learn. One name per thing; a test refuses a second name.
5. A card's small picture shows the part of the page that the Step changes, at close range where needed. Where a difference stays small at card size, the Step says so.
6. Contrast checks are your choice per project (decision D13): Off, Warn me, or Fix for me. The Studio never calls its output "compliant" or "accessible"; it states what it checked and what a person must still check.
7. Warnings warn; they never forbid. "The brief always wins."
8. The Studio records each **Decision**: the Option, the rejected Options, your reason. It never changes a Decision silently; when it removes or changes something, it says so and offers the way back.
9. Every preview is a locked frame with no script (hard rule 6).

### 4.3 Stages and Steps

| Stage | Content | State |
|---|---|---|
| 1. Brief | your product, audience, primary job, and real content; brand tensions as either/or picks | built in part (2026-11-16, features F015 to F018): the screen "Your content" takes your three answers and every text of the page, with lists that grow and shrink within limits. Not built: either/or picks about the brand, your own pictures, texts taken from an existing site |
| 2. Structure | menu · first screen · list of services · page width · what stands out first · spacing | built |
| 3. Feel | letter style · heading style · text size · number style · tint of the grays · main color · amount of color · light or dark · text contrast · background of the first screen · corners · box edges and shadows · line thickness · button style · headline color · one special touch · motion | built |
| 4. Behavior | **Overlays** (first set of six: tooltip, "Are you sure?" question, notice after an action, error message beside a field, loading placeholder, main button that stays in view on a phone) | built |
|  | the rest of behavior: motion curves, focus style, empty and error states, voice and tone | not built (M5) |
| 5. Checks | contrast notes (built); **research rules** (built: five rules, each measured on your design and shown as "Holds" or "Does not hold"); the list of what no machine checked (built for contrast) | partly built |
| 6. Read-back and export | read-back on the Summary (built); export (M6) | built: the Vision's seven files, with the Floors |

### 4.4 The Vision (export bundle), in three layers (M6)
1. **Your Decisions:** each pick with its rejected Options, your reason, the Skin, the Overlays, and exact token values.
2. **The craft layer (automatic):** invisible-detail rules, each set by your Decisions, in our own words, with sources and evidence grades.
3. **The Floors (automatic):** requirements on security, on being found by search, and on speed, which always apply, and requirements for people with disabilities, which you switch on per project (decision D13).

Files: `VISION.md`, `DESIGN.md`, `tokens.json`, `tokens.css`, a shadcn theme file, `mockup.html`, and `FONTS.md`.

### 4.5 The Fitter (Claude Code plugin) (M7)
- `/fit-build`: Claude reads the Vision and builds one screen at a time.
- `/fit-check`: a program opens the build in a real browser at 375, 768, and 1280 px and measures requests to other sites, colors, typefaces, corner radii, contrast, the three required texts, the width, and a part of 33 Floor requirements. Not measured, and said so in each receipt: craft rules, states (hover, focus, open menus), and the look of the page against `mockup.html` (the look, `/fit-look`, draws both and reads four things from the pixels as advice; it changes no status).
- `/fit-repair`: Claude receives the receipt's deviation lines (the look, `/fit-look`, draws pictures for the model; it is not yet part of the repair), repairs the smallest thing, and checks again. Budget: 3 rounds.
- *Honest receipt:* every report separates "measured", "judged by the model", and "still needs a person".
- `/fit-suggest`: Claude proposes new Options as Catalog records; the Studio imports them only if they pass the schema and the checks.

### 4.6 Protection against your own sameness (M12)
A **taste ledger** records the Decisions of every past project. When a new project repeats a past combination, the Studio says so and offers the nearest unused alternatives. The random Directions (built) and the Skins (built) already widen the range.

### 4.7 The Direction Creator (milestone M4D; you asked for it on 2026-11-15)

**What it is.** A way for you to add Directions yourself, without a chat with the builder. Today only the builder can add a Direction, as a record in the Catalog.

**Why it exists.** You want more Directions. Each one that the builder adds costs a session; each one that you make costs minutes, and it is yours.

**Its smallest useful form.**
1. A button on the Summary and on the Directions screen: "Keep this design as a Direction of my own".
2. You give it a name and three short texts (the mood, what it is best for, what to watch for). The Studio proposes the mood text from the design's values, as it does for the random Directions.
3. The Direction appears in a group "Your own" on the Directions screen, with its card picture, and starts a project exactly like a built-in Direction.
4. You can rename it, remove it (in two steps, as for a kept copy), and download or open all of your own Directions as one file.

**What is left out on purpose.** No sharing with other people. No Direction written by an AI inside the Studio. No Skins for your own Directions in the first version. No new Options: a Direction of your own is composed from the values that the Steps and sliders can already set.

**What can go wrong, and the answer.**
| Risk | Answer |
|---|---|
| A name or text of yours carries markup or script | Text renders as text; the same cleaning as for a project name; the break-it tests cover the new file |
| A Direction of your own starts with a contrast warning or with Decisions that pull against each other | The Studio says so on the card before you keep it; it does not forbid it ("the brief always wins") |
| Your own Directions are lost with the browser's storage | They are stored like kept copies, and one file holds them all; the Summary reminds you to download it |
| A later version of the Studio lacks an Option that your Direction uses | The same rule as for a project file: the value is brought to the nearest one the Studio can set, with a note |
| It reads as reviewed research | Its card says "Your own; no source, not reviewed", never an evidence grade |

**Exit test.** You make one Direction of your own on the private page; it survives a reload and a download-and-open; a project started from it draws pixel for pixel what you kept; hostile text in every field stays inert.

## 5. Templates (Mockup families) and their order

1. **Small-business website**: the home page is built; an inner page is M5.
2. **Guided intake flow** (M9).
3. **Dense operational app** (M10).
4. **Consumer or SaaS app** (M11). The Direction "Steady Steps" shows a look for such an app on the sample website only; the true app screens come with this Template.

## 6. Form, coding languages, and what the tool is built from

**Form.** One repository: `packages/core` (pure TypeScript: Catalog, engine, exporters), `apps/studio` (the web app), `plugin/` (the Fitter, later).

**Stack as decided.** TypeScript 6.0 (D16) · React 19.3 · Vite 8.3 · native HTML controls (D22) · Zustand 5 · Zod 4 · the Studio's own color math, about 250 lines (D17) · its own fluid-type formula (D30) · browser storage, plus the page database on the private page (D21, D29) · Vitest 5 · Playwright · axe-core 4.14 · Node 22. Versions are pinned exactly, and a version is pinned only 7 days or more after its release (D27). You merged six dependency updates on 2026-11-14 (among them Playwright 1.65.0 and Vite 8.3.7); the records of D27 and D28 must be brought in line with them.

**In use from others, licenses checked:** Fontsource fonts (MIT; fonts mostly OFL), axe-core (MPL-2.0, unmodified), Playwright, dependency-cruiser. **Planned for the export (M6):** the Design Tokens format, the `DESIGN.md` format and its lint tool, the shadcn theme format. **Decided against:** `apca-w3` (its license prohibits commercial use), `culori`, `utopia-core`, React Aria (unless a control needs it), IndexedDB.

**Where the Studio runs.** A private page on claude.ai, republished after each unit of work. At M8 you choose its permanent home.

## 7. Security and codebase quality of the tool itself

| Threat | Control | State |
|---|---|---|
| An opened file carries script or markup | A schema checks every file; text renders as text; a lint rule and a source scan forbid every way to turn text into markup | built; three break-it rounds ran no code and injected no markup |
| The Mockup frame attacks the Studio | A locked frame with no script | built |
| An opened file corrupts work or lies | Opening states only what is true, never adds to a Decision, brings no value the Studio cannot set, and keeps a copy of whatever it replaces | built |
| Work is lost between tabs, at closing, or when storage is full | The saving table (`docs/reference/saving-table.md`): every situation and event, with a test for each cell | built; no judge has retested the newest repairs |
| A compromised package | Few dependencies; exact pins; install scripts off; Dependabot | built |
| Third-party tracking | No CDN scripts, remote fonts, or analytics | built |
| Pasted content manipulates the LLM that reads the Vision | The exporter fences your content as quoted data | built for the project's name, each reason, and the name of a Direction of your own (the last after finding S6-01 of 2026-11-15); the Brief's texts follow with requirement 2.7 |

**Codebase rules.**
- Strict TypeScript; lint with zero warnings; the core imports no React and no browser API (a tool enforces it).
- The Catalog is data: a Step, Option, Direction, Skin, Overlay, craft rule, research rule, or floor is a record with plain text, a source, an evidence grade, and a review date.
- **Your verification rules (2026-11-14):** after any code change, `npm run check`; after a change to screens, the Mockup, or saving, `npm run e2e` as well; nothing is finished or committed until every check passes.
- **Design before code for risky areas.** Anything that stores data or spans several tabs is first written down as a table of situations and events, then tested cell by cell. (Six of the serious findings came from patching such an area case by case.)
- **Guarantees reference** (`docs/reference/guarantees.md`): each promise the Studio makes, with the test behind it.

## 8. Build governance: milestones, backstops, waypoints, reviews

**Milestones.** A milestone is complete only when its exit test passes.

| # | Milestone | Exit test | State on 2026-11-16 (evening) |
|---|---|---|---|
| M0 | Proof experiment | You judged the result | met |
| M1 | Repository skeleton, CI, governance files | CI green | met |
| M2 | Core engine | Unit tests pass; the core imports no React | met (163 unit tests) |
| M3 | Preview and Template 1 Mockup | One change alters one variable (pixel test) | met; one part open: nobody has confirmed that the private page shows the pictures |
| M4 | Step screen; Directions; Skins | You use it on the private page; keyboard-only pass; you pick the Studio's own look | **open: waits for your trial** |
| M4D | **Direction Creator** (section 4.7) | The exit test in section 4.7 | built on 2026-11-15 (features F003 to F006); its exit test waits for you to make one Direction on the private page. You asked for it on 2026-11-15. You set its place on 2026-11-15: straight after M4 (decision D56) |
| M5 | Full Catalog for Template 1: your own content (Brief), Overlays, research rules, craft layer, floors, an inner page | A test walks every Step; axe finds no serious violation in any Option | Overlays and research rules were started early at your request (decision D52); the craft layer's first twelve craft rules are built (2026-11-15, decisions D58 and D60); the first slice of the Brief is built (2026-11-16, decisions D61 and D62); the Floors are built (M6); an inner page is not started |
| M6 | Export bundle (the Vision) | Snapshot tests; the token and design files pass their validators | all seven files are built, with stored copies, and `DESIGN.md` and `tokens.json` pass outside validators on GitHub (2026-11-16, features F019 to F023, decision D64). The Floors are built (2026-11-16, feature F032, decision D69): `VISION.md` carries 56 requirements in five Floors, each with its source (36 under “Off” and “Warn me”, because the 20 requirements for people with disabilities are written only under “Fix for me”, decision D13). Milestone M6 counts as complete only when GitHub's check passes on the commit that holds them (hard rule 3) and the M6 gate review (the three red-team reviewers, hard rule 12) finds no blocker; the review of 2026-11-16 found none, and its 43 findings are rows S8, U8, and T8 of `redteam/FINDINGS.md`. **Complete on 2026-11-17**: GitHub's check passed on `c6128c2` on 2026-11-17 (both runs: "check" and "Outside validators", finished 11:16 and 11:17 UTC) |
| M7 | Fitter: build, check, repair | On a deliberately flawed build, `/fit-check` finds every planted defect and no false blocker | built on 2026-11-17 (features F024 to F029 and F035 to F038; decisions D68, D71, D73, D76): the exit test plants 61 defects in a reference build and the program finds each, and it reports none on the reference build of the plain start and of all 38 Directions with every Floor written. The gate review of 2026-11-17 found 9 blockers: 7 are repaired (F038), one in part, and one is stated as a limit. The retest after the join found 3 more, all repaired. Open, and yours to judge: the test runs the program, not the command inside Claude Code, which nobody has run yet; a part of the comparison of pixels (step 13a) is built as the look, which is advice and changes no status |
| M8 | **Your first real project, end to end**; hardening | You judge the result; red-team blockers at zero | not started |
| M9–M11 | Templates 2, 3, 4 | Same tests as M5–M7 per Template | not started |
| M12 | Taste ledger; `/fit-suggest` | The repeat-combination warning works across two projects | not started |

**Progress on 2026-11-15.** You settled 24 open decisions (D55). Repaired, checks pending or passed as `PROGRESS.md` states: the status line after an Undo (F-23), a kept Decision stays "kept" (F-24), the "Control Room" sentence (U5-16), Dependabot's 7-day wait (S2-06). Built since (features F001 to F011, see `PROGRESS.md`, "Build log"): the repair for C4-F18; the typefaces Playfair and Literata; the Direction Creator; the hardening; twelve craft rules; a first slice of the Vision. The sixth red-team review (67 findings, 1 blocker) followed; its repairs are requirement 2.8 of `SPEC.md`.

**The verified build loop (your skill, loaded on 2026-11-15, decision D56).** From its set-up on, hooks (small programs that Claude Code runs by itself) stop the builder from ending a turn while `npm run check` fails, and run `npm run e2e` when a feature is marked as passing. `SPEC.md` states the requirements of the work in hand and points to this plan; `feature_list.json` lists the features, each marked as passing or not. This plan stays the one plan.

**Backstops against drift.** `PLAN.md` (this plan), `CLAUDE.md` (standing rules and defined terms), `DECISIONS.md` (every departure, with your approval), `PROGRESS.md` (where the work stands and what is unverified), `WAYPOINTS.md` (commits to return to). CI runs type check, lint, the boundary rule, unit tests, and browser tests on every push. No milestone is marked complete on a red run, and no test is skipped or weakened to get green.

**Reviews, as practiced.**
- *The three reviewers* (security attacker, confused first-time user, drift and truth auditor) at each unit of work and each milestone gate (hard rule 12). They receive the code and the running Studio, not conclusions.
- *Break-it campaigns* for the riskiest areas: a written charter, independent attackers with one kind of attack each, a separate judge who reproduces every claim and never sees who made it, findings filed unchanged before any reply.
- *Code review swarms* for code quality: reviewers per area, a second set that tries to refute each finding, repairs only for what survives.
- *What these cost:* rounds 1 and 2 of the campaign used about 1.0 and 0.7 million tokens (measured); round 3 about 0.75 million (0.33 million measured after a restart, the rest estimated); the nine-reviewer code review about 1.8 million (measured). Reviewers and judges are AI agents; their grades are judgments, not measurements.

**Waypoints.** After every unit of work: commit and push to the working branch that the session names (on 2026-11-16 and 2026-11-17: `claude/eloquent-curie-hnhykj`; decisions D72 and D73). At every milestone: a row in `WAYPOINTS.md`. You retired the Drive backup (D26) on 2026-11-15: GitHub is the only backup (decision D55).

## 9. What can go wrong, and the response

| Risk | Response |
|---|---|
| The Vision does not improve Claude's output | M0 tested this before any app code; M8 repeats the comparison with a tool-made Vision |
| The tool grows into a heap of features | Each feature in its smallest useful form; the plan states what is left out; your trial decides what stays |
| Bugs gather in one area and are patched one by one | Design before code: a table of situations and events, a test per cell (section 7) |
| A test passes on one machine and fails on another | CI runs every push; a red run is read and repaired at its cause before anything else |
| Reviews find faults late | Tests first for risky work; the three reviewers at each unit, not only at the end |
| Research is thinner than it looks | Every record states how each source was seen; a rule shows its grade; weak rules are labeled opinion |
| A look honors a person or a brand without approval | No Direction or Skin carries the name of a person, a show, a book, or a brand |
| Too many choices | Groups for Directions; "Decide later"; a later "quick fit" path of about 8 Steps |
| All your products start to look alike | Random Directions, Skins, and (M12) the taste ledger |
| An upstream change breaks later Decisions | The engine re-checks dependents and flags each conflict; it never changes a Decision silently |
| Automated checks miss accessibility problems | The Studio names what no machine checked; the Fitter's honest receipt will do the same |
| The private page's host restricts something | Unknown until you confirm that the pictures appear there; fallback: a static host |
| I lose context between sessions | `PROGRESS.md`, `CLAUDE.md`, waypoints |
| This session's network blocks most websites | Research rests partly on search summaries, and says so; you can allow hosts in the environment's settings |

## 10. What changed from version 1, and why

| Change | Why | Decision |
|---|---|---|
| Directions come before the Steps | You asked for ways to close the gap in look; your own process calls for "genuinely different directions before code" | D23, D42, D51 |
| Contrast checks are a per-project choice, not a fixed floor | You build private-use apps where accessibility standards do not bind; sites for clients can choose "Warn me" or "Fix for me" | D13 |
| "Skip" keeps the current value; it does not apply a default | After a Direction was picked, the earlier skip silently replaced the Direction's values | D31 |
| The Studio's own color math and type formula; native controls; browser storage | Fewer dependencies; each replaced library was small to write and test | D17, D22, D29, D30 |
| TypeScript 6.0, not 7.0 | The lint tool supports TypeScript below 6.1 only | D16 |
| Plain words everywhere, enforced by tests | A reviewer with no design vocabulary could not follow the first texts | D38 |
| Saving became a designed area with a table | Six serious findings came from it | D40, D44, D46, D50, and section 7 |
| Break-it campaigns and code review swarms joined the three reviewers | You asked to test the Studio to break it | D43, D48 |
| Skins, Overlays, Japanese minimalism, and research rules enter the plan; Overlays and research rules start before M4's exit test | You asked for them on 2026-11-14 | D52 |
| Your verification rules | You stated them on 2026-11-14 | D52 |
| Version 3: the Direction Creator (section 4.7, milestone M4D); the verified build loop; the defined terms "Direction" and "Research rule"; the Drive backup retired | You asked for them on 2026-11-15 | D55, D56 |
| Version 3.2: the craft layer's first twelve craft rules and a first slice of the Vision (four files) are built before the rest of M5 | You chose this order on 2026-11-15, and approved requirements 2.5 and 2.6 of `SPEC.md` | D58, D60 |
| Version 3.3: the sixth red-team review and its repairs; the first slice of the Brief (the screen "Your content") | Hard rule 12 and your "Yes regarding the red team"; your four answers on the Brief | D61, D62 |
| Version 3.4: the Vision has seven files and one archive file; the Fit check's first slice (milestone M7 started) and two build trials; the seventh red-team round and its repairs; the Floors wait for checked research | Your deferrals of 2026-11-16 ("I defer to you"), your "yes" to the build trial and the comparison run, and your approval of helper agents without a limit and of five research hosts | D63 to D68 |
| Version 3.5: the audit and red-team campaign A2 and their repairs (on the audit branch); the two branches must be joined first; section 13 gives the remaining work with time estimates | Your request of 2026-11-16 ("Please redo the plan with timeline estimates for remaining work") and your deferral ("I defer to you") | D71 |
| Version 3.6: the audit branch and the main line are joined (pull requests 12 and 13); the Floors are built; the code review of pull request 13 | Your request of 2026-11-16 ("Please review the code and debug. Please also clean up all pending PRs") | D73 |
| Version 3.7: the app is "Frontend Focus" and the Prescription is the "Vision"; milestone M7 is built | Your request of 2026-11-17 ("Please rebrand this app is 'Frontend Focus,' and then change 'Prescription' to 'Vision.' Please do test M6. Finish M7.") | D75, D76 |
| Version 3.6, as the audit branch recorded it: the two branches joined, one building session at a time; step 12 ("the Fit check measures what the Floors require") moved from M6 to M7 (you approved the move on 2026-11-17, decision D78); the totals of 13.9 no longer count the finished join (2026-11-17) | Your approval of one building session at a time, and your choice of this session's join | D72, D73 |
| Version 3.8: the three lines of work are one (pull requests 14, 16, and 17); the Fit check runs no script of the page unless asked; the Floors are edition 3; the look is merged | Your answers of 2026-11-17 (decision D77) | this version's rows of sections 2, 8, and 13 |

## 11. File and research status

- **Your source files:** all 15 Drive files and every text file in both archives were read in full for version 1.
- **Knowledge base:** 138 records, written by research helpers, not reviewed; four more parts in progress. Three records of search summaries stand behind three Directions.
- **Not reachable from this session:** most websites (the network allows few hosts), your PC's Downloads folder.
- **Absent from your folder:** `blueprint-v1.md`, `hugging-face-llm-review.md`, and the research folders that your files cite.

## 12. Verification

1. `npm run check`: type check, lint, the boundary rule, and the unit tests (color math, token derivation, the engine, project files, the Catalog's rules).
2. `npm run e2e`: the browser tests (the Studio's screens, saving in every cell of the saving table, the Mockup at four widths, stored pictures of every Direction).
3. axe on the Studio's screens (serious and critical findings).
4. A keyboard-only walk of the Studio (automated).
5. Hostile files and hostile text render as inert text; the Mockup frame cannot reach the Studio.
6. At M7: on a build with planted defects, `/fit-check` reports each one.
7. Your own trial at M4 and your blind comparison at M8.
8. `redteam/FINDINGS.md` shows no open blocker at a milestone.

**What no check covers today:** any browser but Chromium; a screen reader; the real private page with its database; whether a look is good for your customers.

## 13. Remaining work, with time estimates

**What the estimates rest on.** They are the builder's estimates, not measurements. They rest on the pace measured in this repository on 2026-11-15 and 2026-11-16: 30 features in about 25 hours of building (about 50 minutes each, tests and records included); a full browser run of about 29 minutes, which every finished feature pays at least once; and one red-team round of 6 lanes and a judge in about 2 hours (about 1.3 million tokens, measured for campaign A2, 8% above its estimate). "Builder hours" are hours of a building session at that pace. "Your time" is time that only you can give. Each range is wide where the work depends on something not yet known (your trial's answers, the research, a new Template).

**The order.** It follows your decisions D63 and D65 (first the Floors, then the Fitter, then the rest of M5), and adds the joining of the two branches in front, because nothing can be built on two disagreeing copies.

### 13.1 Now: close today's work and join the two branches (builder: 4 to 8 hours left; your time: 5 minutes)

| Step | What | Who | Estimate | Depends on |
|---|---|---|---|---|
| 1 | Close campaign A2: read the retest judge and the variant lane, repair what fails its retest, record each finding as "retested-pass" or reopened. **Done on 2026-11-16:** all 18 findings retested-pass; the variant lane found 12 more ways around the repairs, all repaired or stated (rows A2-V1 to A2-V14) | builder | done |
| 2 | **Your decision:** how sessions work from now on. **Decided on 2026-11-16: one building session at a time (D72)** | you | done | nothing |
| 3 | Join the audit branch (`claude/eloquent-curie-hnhykj`, pull request 12) with the main line, by this session while the other session stops building (D72). The main line's own design for the Fit check (the page's scripts off by default, the window offline) stays, and the audit's repairs that need no script, its tests, and its defences for `--run-scripts` are carried over | builder | 4 to 8 hours; **done on 2026-11-16** with the main line at `8de8153` (D73: the owner kept this join; the main line's session began a second join, which nobody merges) | step 2 |

### 13.2 Your part of milestones M4 and M4D (your time: about 45 minutes; can happen at any time)

| Step | What | Estimate |
|---|---|---|
| 4 | The trial of the Studio on the private page (`docs/trial-guide.md`, ten questions) | 25 minutes |
| 5 | Make one Direction of your own on the private page (the exit test of M4D) | 10 minutes |
| 6 | Pick the Studio's own look (part of M4's exit test) | 10 minutes |
| 7 | Builder: repair what your trial names | 2 to 8 hours (depends on your answers) |

### 13.3 Open findings (builder: 8 to 15 hours)

| Step | What | Estimate |
|---|---|---|
| 8 | 88 rows of `redteam/FINDINGS.md` are open on the main line, most of them minor. Repair every blocker and major one; repair or state each minor one | 8 to 15 hours |

### 13.4 Milestone M6: the Floors (complete on 2026-11-17)

The Floors are written (feature F032, decisions D69 and D70): `VISION.md` carries 56 requirements in five Floors, each with its source (36 under “Off” and “Warn me”, because the 20 requirements for people with disabilities are written only under “Fix for me”, decision D13). Steps 9 to 11 of version 3.5 (check the research, your decisions, write the Floors) are done; you deferred the questions to the builder (D70), and the host waits until you name one.

| Step | What | Who | Estimate |
|---|---|---|---|
| 9 | GitHub's check passes on the commit that holds the Floors, and the M6 gate review (the three red-team reviewers, hard rule 12) finds no blocker | builder | **done on 2026-11-17** (`c6128c2`) |

### 13.5 Milestone M7: the rest of the Fitter (builder: 21 to 36 hours)

| Step | What | Estimate |
|---|---|---|
| 12 | The Fit check measures what the Floors require; contrast becomes binding (moved here from M6) | 2 to 4 hours |
| 13 | The third window width (768 pixels) and the exit test: a build with planted defects, every one found and no false blocker | 3 to 5 hours |
| 13a | **Read what is drawn, not only what the styles say.** Campaign A2 showed that a check that reads computed styles can always be led around by one more route (a shadow root, a clip, a fill color, an import); each round closed the routes it found. The lasting answer: compare the pixels of a screenshot with the Vision's colors, and find the three required texts in the drawn page, beside the style reading. | 6 to 10 hours |
| 14 | `/fit-build` and `/fit-repair` as commands of a Claude Code plugin: packaging, at most three rounds of repair, and the receipt's part "Judged by the model" | 8 to 14 hours |
| 15 | One red-team round on the whole Fitter, and its retest | 2 to 3 hours |

### 13.6 The rest of milestone M5 (builder: 19 to 33 hours)

| Step | What | Estimate |
|---|---|---|
| 16 | An inner page for Template 1 | 6 to 10 hours |
| 17 | The behavior Steps: motion curves, focus style, empty and error states, voice and tone | 8 to 14 hours |
| 18 | The rest of the Brief: either/or picks about the brand | 3 to 5 hours |
| 19 | M5's exit test: a test walks every Step, and axe finds no serious problem in any Option | 2 to 4 hours |

### 13.7 Milestone M8: your first real project, end to end (builder: 7 to 14 hours; your time: 1 to 3 hours)

| Step | What | Who | Estimate |
|---|---|---|---|
| 20 | **Your choices:** the project, and the Studio's permanent home | you | 15 minutes |
| 21 | You make the design in the Studio; the Fitter builds and checks it; you judge the result | you and builder | you 1 to 3 hours; builder 4 to 8 hours |
| 22 | Hardening until no red-team blocker is open | builder | 3 to 6 hours |

### 13.8 After M8 (builder: 83 to 149 hours)

| Step | What | Estimate |
|---|---|---|
| 23 | Templates 2, 3, and 4 (M9 to M11): a guided intake flow, a dense operational app, a consumer or SaaS app; each needs its own Mockup, Steps, Vision, and Fit check | 25 to 45 hours each; 75 to 135 hours in all |
| 24 | M12: the taste ledger and `/fit-suggest` | 8 to 14 hours |

### 13.9 Totals, and what they mean in days

| Point reached | Builder hours | Your time | At about 10 building hours a day | At about 20 a day (two building sessions; not used since D72) |
|---|---|---|---|---|
| Today's work closed and the branches joined (13.1) | done on 2026-11-16 | done | done | done |
| **M8: the tool does its job on a real project** (13.2 to 13.7; 13.1 done) | **59 to 109** | about 2 to 4 hours, in three short sittings (the trial, choosing the first project, judging its result) | **6 to 11 working days** (the column that decision D72 sets) | (not used: D72) |
| Everything in this plan (to M12) | 142 to 258 | about 2.5 to 4.5 hours | 15 to 26 working days | (not used: D72) |

**What these totals do not hold.** Your steps set the pace as much as the builder's: the trial, the Floors, and the real project each wait for you, and each can stop the line while it waits. Red-team rounds beyond those named cost about 2 hours and 1.3 million tokens each. Any new request of yours adds its own estimate. "Completing the app today" is not within reach: today closes step 1, and possibly steps 2 and 3.

**What you have already, without waiting for any of this.** The Studio does its main job now: you pick a Direction and the Steps, and download the seven files of the Vision for an AI coding tool. The Fit check can measure a page built from them. What is missing is the proof on a real project, and the parts of the Fitter that decision D76 left for later.
