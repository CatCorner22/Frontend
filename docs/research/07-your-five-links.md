# The owner's five links: what each says and what the project adopts

Read on 2026-11-13.

## 1. Netguru, "Frontend Development Process" — read in full

Five stages: planning and requirements; design and prototyping; component-driven build; testing and QA; deployment and maintenance.

Adopted:
- **Planning names the states, the browser matrix, the performance budget, and the accessibility target before any component exists.** The Studio's Brief and Behavior Stages do this; the Prescription carries the budget and the WCAG 2.2 AA target as acceptance checks.
- **Three handoff gates per component: token coverage, state coverage (hover, focus, disabled, error, empty), responsive behavior.** These are the Fitter's token fit, state, and viewport checks.
- **Feature folders, not type folders.** The repository follows this.
- **Merge gates: unit tests green, end-to-end tests green, visual-regression differences reviewed, performance budget held.** CI enforces these (decision D8 adds visual regression).
- **"Where AI still fails is judgment: performance tradeoffs, accessibility semantics, and reading the intent behind a design."** This is why the Studio keeps the owner as the one who picks, and why the Fitter's receipt separates measurement from model judgment.

## 2. dev.to, "Frontend SEO Best Practices" — read in full

Fifteen practices. Adopted into the Prescription's search floor: semantic HTML; a title of 50–60 characters and a meta description of 150–160 characters; one `h1`; descriptive `alt` text, compressed and responsive images; lazy loading; structured data (Article, Product, Event, FAQ, Breadcrumb as applicable); content present in server-delivered HTML; lowercase hyphenated URLs; descriptive internal links; canonical tags; no intrusive interstitials.

Corrected: the article lists First Input Delay. Google replaced it with Interaction to Next Paint; the floor uses INP (decision D11).

## 3. GitLab, "Frontend Development Guidelines" — index page read in full

Three values: stability, speed, maintainability. "Even the smallest [change] must be stable, tested, and with a good architecture."

Adopted:
- **Package boundaries enforced in CI** ("which packages may import which is enforced in CI"). The repository does this with dependency-cruiser.
- **Feature-name folders** with components, utilities, and constants inside.
- **Loosely coupled components that can be added or removed easily.** The Catalog-as-data rule serves this.
- **A visual testing framework** (a stated GitLab goal). See D8.

Not read: the linked sub-guides (security, accessibility, testing, dependencies). Read them before M1's security work if the host stays reachable.

## 4. GitHub, `champi-dev/front-end-best-practices` — read in full

Adopted: a single source of truth for every value (the token rule); relative units; media queries beside the rule they affect; separation of concerns by responsibility; state management only for truly shared data; per-field validation with a specific message. Not adopted: Vue- and Sass-specific advice, and the `html { font-size: 10px }` technique (it overrides the user's browser font-size setting, which harms accessibility).

## 5. SitePoint, "20 Docs and Guides for Front-end Developers" — not read

The site refused automated access (HTTP 403). The article is the first of a series by Louis Lazaris. If the list matters, the owner can paste it.
