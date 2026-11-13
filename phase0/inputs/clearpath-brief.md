# Filled example: ClearPath Legal Clinic frontend brief

Status: fictional educational example, not a real organization, user study, legal service, or legal advice. Every persona and operational detail below is an assumption to validate before implementation. The example demonstrates how to direct an LLM without allowing it to invent legal rules, deadlines, outcomes, or client relationships.

Companion references: `frontend-design-living-reference.md` §17 and §21, `frontend-design-sop.md`, and `llm-frontend-brief-template.md`.

## 1. Restaurant and guests

### 1.1 One-sentence brief

Help a worried, first-time legal-aid visitor understand what to bring and how to request a clinic intake on a phone, without requiring legal vocabulary, an account, or disclosure of sensitive case documents online.

### 1.2 Deliverable

- Type: mobile-first guided intake and preparation website.
- Stage: stakeholder prototype leading to a small public beta after evaluation.
- Fictional owner: ClearPath Legal Clinic product owner.
- Prototype release approver: product owner plus accessibility and legal-content reviewers.
- Frontend route: responsive web application with a simulated intake backend for prototype testing.
- Visual direction: calm civic field guide, not a law-firm luxury aesthetic or a generic SaaS dashboard.

### 1.3 Non-goals

The prototype will not:

- provide legal advice, predict outcomes, interpret a notice, or calculate a legal deadline;
- create an attorney–client relationship;
- claim that using the site guarantees access to a lawyer;
- accept confidential case documents or detailed narratives in the prototype;
- include payments, case management, messaging, or lawyer performance ratings;
- replace emergency, urgent, or jurisdiction-specific assistance;
- use fictional testimonials, success rates, lawyer photographs, or client quotes.

### 1.4 Guests

| Guest | Top job | Context and device | Ability and access needs | Evidence source |
|---|---|---|---|---|
| Maya, 41, fictional retail worker | Understand what to do and bring after receiving an eviction notice | Android phone, unstable mobile data, 10 minutes between shifts | Anxiety, legal jargon unfamiliar, uses larger text; needs explicit next steps | Assumption based on the design exercise, not research |
| Darius, 52, fictional tenant advocate | Help a client prepare for a clinic call | Desktop and printed checklist | Uses keyboard only; needs predictable controls and printable content | Assumption based on the design exercise, not research |
| Elena, 34, fictional intake coordinator | Receive enough information to route a request without unnecessary sensitive detail | Clinic laptop and email queue | Needs structured, short requests and clear referral reasons | Assumption based on the design exercise, not research |

Questions requiring real research:

- Which terms do actual visitors use for notices, hearings, appointments, and legal aid?
- Which notices and service requests are most common in the clinic's actual jurisdiction?
- Which users cannot safely or conveniently submit an online request?
- Which assistive technologies and devices do actual visitors use?
- What can the clinic respond to operationally, and within what real service timeframe?

### 1.5 Top journeys

| Priority | Trigger | Desired outcome | Failure cost | Completion evidence |
|---|---|---|---|---|
| 1 | Visitor has a notice with a date | Identify an appropriate preparation and contact path without receiving an invented legal interpretation | Missed hearing, response, or filing opportunity; harmful delay | Visitor reaches review and confirms understanding of the non-advisory next step |
| 2 | Visitor wants to prepare for intake | Save or print a useful checklist without creating an account | Missing documents, repeated calls, frustration | Checklist downloads or prints with all content visible |
| 3 | Visitor wants to request an intake | Submit minimal contact and topic information and receive confirmation | Uncertainty, duplicate submissions, privacy exposure, no follow-up | Confirmation and fictional reference appear once; no duplicate request |
| 4 | Visitor cannot use the online form | Find a telephone and in-person alternative | Exclusion from the service | Alternative contact information is visible before form submission and after errors |

## 2. Evidence, content, and boundaries

### 2.1 Evidence supplied

- Research notes: none; all guest details are assumptions for this example.
- Analytics and support findings: none; do not invent them.
- Real copy and terminology: supplied below as fictional prototype copy.
- Brand guidelines: supplied in §5.
- Legal and policy constraints: no legal rules are supplied; the interface must not infer them.
- Privacy constraint: do not request notice uploads, opposing-party details, financial account details, Social Security numbers, addresses, or detailed case narratives in the prototype.

Unknowns the model must not invent:

- jurisdiction-specific deadlines, eligibility rules, forms, fees, and filing instructions;
- whether the clinic can take a case or offer representation;
- clinic response times, lawyer identities, outcomes, testimonials, and availability;
- legal interpretation of any notice or uploaded document.

### 2.2 Core prototype copy

Homepage:

> **Bring your notice. Leave with a preparation plan.**
>
> Answer a few general questions to prepare for a ClearPath intake request. You do not need an account, and you should not upload case documents here.
>
> **Start preparing**
>
> **Other ways to contact the clinic**

Notice step:

> **Does your paperwork show a hearing, response, or other date?**
>
> Select the date only if it is printed on your paperwork. We will show it in your preparation summary. We will not calculate a deadline or tell you what legal action to take.
>
> If a date is close or you fear losing housing, benefits, safety, or income, contact the clinic or another qualified local service directly rather than waiting for an online response.

Review step:

> **Check your preparation summary**
>
> This is not legal advice and is not a review of your case. It is a summary you can use when contacting the clinic.

Submission:

> **Request an intake**
>
> Submitting this form asks the clinic to contact you about availability. It does not create an attorney–client relationship or confirm representation.

Error:

> **Your request was not sent. Your answers are still on this device.**
>
> Try again, or use one of the alternative contact methods below.

Success:

> **Your preparation summary is ready.**
>
> Prototype reference: CP-1042. In a real service, the next message would explain the clinic's actual response process. Do not submit another request for the same issue.

### 2.3 Information architecture

Primary navigation:

1. Prepare for intake
2. What to bring
3. Other ways to get help
4. Privacy

Rules:

- Keep “Other ways to get help” visible on every step.
- Do not use vague labels such as “Solutions,” “Resources,” “Empower,” or “My case.”
- Keep the preparation summary, review answers, and contact alternatives in the same journey.
- Do not place a promotional hero, testimonial carousel, statistics band, or card grid before the primary task.

## 3. Interaction specification

### 3.1 Vertical slice

Choose help topic → indicate whether paperwork has a printed date → record topic and optional date → show document checklist → choose contact preference → review summary → simulate request → show success or recoverable failure.

No legal analysis occurs between these steps. The optional printed date is displayed as user-supplied information only.

### 3.2 State inventory

| Element or journey | Default | Focus/keyboard | Loading | Empty | Error | Success/recovery |
|---|---|---|---|---|---|---|
| Topic selection | Native radio group with visible legend | Arrow keys move; visible focus | Not applicable | Prompt to select before continuing | Inline linked message | Preserve selection |
| Printed-date field | Persistent label and optional hint | Tab reaches field; native input | Not applicable | Optional; may skip | Explain expected format without blaming | Preserve other answers |
| Checklist | Real headings and list | Tab reaches save/print buttons | Short honest generation state | General checklist remains | Download failure offers print view | Save or print summary |
| Contact preference | Native radio group and minimal contact field | Logical Tab order | Not applicable | No contact details required to view alternatives | Field-specific correction and summary | Preserve all answers |
| Request action | Native submit button | Enter/Space; no double submission | Disabled duplicate action plus text status | Not applicable | Summary links to fields; server failure preserves data | One confirmation and reference |
| Alternative contact | Visible link before and during journey | Normal link behavior | Not applicable | Always available | Remains after server failure | Offers phone and in-person route |

### 3.3 Recovery requirements

- Back returns to the previous step without clearing answers.
- Refresh restores non-sensitive answers locally; contact details are not persisted beyond the current tab in the prototype.
- Double-click creates only one simulated request.
- Offline shows a clear unsent state and the alternative contact methods.
- The simulated server can return success, validation failure, timeout, and offline failure on demand.
- The summary can be printed without any navigation or buttons.

## 4. Three design directions

### Direction A: Guided civic field guide — selected

- Structure: one primary question per step, persistent progress, visible previous answers, and a final preparation summary.
- Typography: system serif for page titles, system sans-serif for controls and body text.
- Color: warm paper, dark ink, deep teal action, restrained rust for attention and error.
- Imagery: none required; a small line illustration of a document folder may appear on the start screen.
- Rationale: minimizes recall, jargon, and visual competition for a worried first-time visitor.
- Tradeoff: more steps than a single-page form; progress and back behavior must be excellent.
- Accessibility risk: multi-step focus and status management; addressed by explicit step headings and focus placement.
- Anti-example: a full-screen photo of a courthouse with overlaid text and three floating feature cards.

### Direction B: Plain-language help library — rejected for this slice

- Structure: searchable library organized around “I received a notice,” “I need to prepare,” and “I need another way to get help.”
- Typography: compact editorial reading view with strong content headings.
- Color: white background, navy links, minimal accent.
- Rationale: supports visitors who want to browse before acting.
- Tradeoff: requires high-quality content and search; does not directly produce a preparation summary.
- Accessibility risk: search filtering and excessive result choices.
- Anti-example: dozens of topic cards with identical icons and vague titles.

### Direction C: Advocate workbench — rejected for the primary guest

- Structure: dense table of preparation items, client notes, and routing controls.
- Typography: compact sans-serif and tabular numbers.
- Color: neutral gray work surface with blue actions.
- Rationale: efficient for repeat advocates and staff.
- Tradeoff: high learning and density cost for Maya; belongs in a separate staff product.
- Accessibility risk: table navigation, small targets, and dense interactive rows.
- Anti-example: a generic admin dashboard with KPI cards, charts, and a collapsible sidebar.

### 4.1 Selection record

- Selected: Direction A.
- Preserved: one-question-per-step approach, warm paper and ink palette, visible alternatives, real prototype copy, native controls, and document-checklist outcome.
- Rejected: promotional homepage, advocate-first dashboard, searchable content library for the first release.
- Further exploration after launch: Direction B for visitors who prefer browsing.

## 5. Recipe book

### 5.1 Design tokens

```css
:root {
  --color-bg: #F7F4EE;
  --color-surface: #FFFFFF;
  --color-text: #172033;
  --color-text-muted: #526174;
  --color-action: #0B5D5E;
  --color-action-text: #FFFFFF;
  --color-focus: #B45309;
  --color-error: #9F1239;
  --color-link: #1D4ED8;

  --font-title: Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, "Segoe UI", sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --radius-control: 0.375rem;
  --content-measure: 65ch;
}
```

Contrast checks performed for this example:

| Combination | Ratio | Intended use |
|---|---:|---|
| `#172033` on `#F7F4EE` | 14.82:1 | Main text |
| `#526174` on `#F7F4EE` | 5.76:1 | Secondary text |
| `#FFFFFF` on `#0B5D5E` | 7.66:1 | Primary action text |
| `#B45309` on `#F7F4EE` | 4.57:1 | Focus indicator candidate; area and adjacent contrast still require testing |
| `#9F1239` on `#F7F4EE` | 7.30:1 | Error text |
| `#1D4ED8` on `#F7F4EE` | 6.10:1 | Links |

These ratios are computed values, not a complete accessibility audit. Hover, active, disabled, surface, forced-color, and focus-area combinations still require checks.

### 5.2 Component constraints

- Use native HTML for headings, landmarks, links, buttons, radio groups, checkboxes, inputs, lists, and print output.
- Use React Aria or Radix only if a custom dialog, combobox, or other complex control becomes necessary.
- Do not build a custom date picker for the prototype; use a native date input with a persistent label and text alternative if browser support requires it.
- Do not introduce a carousel, accordion-only critical instructions, tooltip-only labels, toast-only errors, or icon-only navigation.
- Use a tested dialog primitive if a later design requires a dialog; the selected journey should remain inline.

## 6. Technical and delivery constraints

- Framework: React + TypeScript + Vite for the prototype.
- Rendering: client-side interaction for the guided slice; printable summary must remain meaningful without animation.
- Styling: plain CSS with the supplied tokens; no utility-class duplication of token values.
- Supported environments: current stable Chrome, Edge, Firefox, and Safari; Android and iPhone-sized touchscreens; keyboard-only desktop.
- Backend: simulated adapter with success, validation failure, timeout, offline, and duplicate-submission scenarios.
- Privacy: no analytics, third-party fonts, session recording, advertising tags, or external document storage in the prototype.
- Dependencies: no date-picker, carousel, animation, or icon library required.
- Model permissions: edit only the designated prototype folder and run the declared test commands; no deployment or external submission.
- Human approval required: legal content, privacy, dependency additions, external network calls, and release.

## 7. Accessibility acceptance matrix

| Requirement | Acceptance evidence | Method | Result |
|---|---|---|---|
| Semantic structure | One main region, logical headings, fieldset/legend for grouped choices, native controls | Code inspection and screen reader | Not run |
| Keyboard operation | Complete every journey forward, backward, and after errors without a mouse | Manual keyboard test | Not run |
| Focus | Visible focus; focus moves to new step heading and error summary; restored after any overlay | Keyboard plus zoom | Not run |
| Labels and help | Every input has a persistent label; optional status and format are clear | Manual and accessible-name inspection | Not run |
| Contrast | Token combinations meet applicable thresholds in every state | Automated and manual checks | Token pairs only checked; other states not run |
| Errors and status | Error summary links to fields; dynamic status is announced once; answers persist | Screen reader and keyboard | Not run |
| Resize and reflow | No two-dimensional page scroll or lost function at required settings | 320–1920 pixels, zoom, text spacing | Not run |
| Motion | No essential animation; reduced-motion setting produces immediate transitions | OS/browser preference | Not run |
| Alternative access | Phone and in-person routes are available before, during, and after the form | Content and journey review | Not run |
| Disabled-user evidence | At least keyboard and screen-reader participants complete the three top tasks | Moderated research | Not run; required before public beta |

## 8. Responsive and performance requirements

### 8.1 Responsive behavior

- At 320 and 375 pixels, controls stack without shrinking labels or hiding alternatives.
- At 768 pixels and above, the preparation summary may use two columns only when related values remain visually associated.
- At 1920 pixels, line length remains capped by `--content-measure`; no stretched hero or excessive empty side panel.
- Long topic names and error messages wrap without covering actions.
- The printed-date control never depends on a tiny calendar popup.
- All primary controls have adequate target size and spacing against the applicable criteria.
- Print output contains the summary, alternatives, and non-advisory note without navigation or decorative background.

### 8.2 Performance and feedback

- LCP target: ≤ 2.5 seconds at the 75th percentile, segmented by mobile and desktop.
- INP target: ≤ 200 milliseconds at the 75th percentile.
- CLS target: ≤ 0.1 at the 75th percentile.
- No third-party font, image, analytics, or animation request should block the primary task.
- Simulated slow response displays “Sending your request” without a false progress percentage.
- Offline and timeout states say the request was not sent and preserve answers.
- Real-user monitoring is a public-beta requirement, not something the prototype may claim.

## 9. Test data and acceptance scenarios

| Scenario | Action | Expected result | How tested |
|---|---|---|---|
| Happy path | Select housing topic, optional printed date, checklist, contact preference, review, submit | One summary and one confirmation with reference CP-1042 | Browser test |
| No printed date | Skip optional date and continue | Summary says “No printed date supplied,” not “No deadline” | Browser test |
| Missing topic | Continue without selecting a topic | Linked error explains that a topic is required; other answers persist | Browser and screen reader |
| Long topic | Use a 90-character fictional topic name | Text wraps without overlapping actions | Browser at 320 pixels |
| Validation failure | Submit an invalid contact preference value | Summary and field message explain the correction; no duplicate request | Browser and screen reader |
| Server rejection | Return simulated 500 response | Unsent message, preserved answers, alternatives visible | Browser test |
| Slow response | Delay simulated response | Honest pending status; duplicate submission disabled | Browser test |
| Offline | Disable network before submit | Unsent state and alternative contact options | Browser test |
| Keyboard only | Complete all journeys and recovery | No trap, logical order, visible focus | Manual test |
| Screen reader | Complete topic, date, review, error, and success paths | Names, roles, states, and announcements are meaningful | NVDA + Chrome and VoiceOver + Safari |
| Narrow viewport | Repeat happy and error paths at 320 pixels | No loss of content or function | Browser test |
| Reduced motion | Enable reduced-motion preference | Nonessential transitions removed | Browser test |
| Duplicate action | Double-click submit and use back/refresh | Only one simulated request | Browser test |
| Print | Print preparation summary | All essential content and alternatives readable | Print preview |

Release gates: no critical task failure, no keyboard blockage, no duplicate request, no claim of legal advice or representation, no sensitive document collection, no severe accessibility barrier, and no fabricated clinic claim.

## 10. Evaluation plan

The scores remain empty because no implementation or participants have been evaluated. Do not fill them with model-generated estimates.

| Dimension | Weight | Human/reference score | One-shot AI | Directed AI | Evidence |
|---|---:|---:|---:|---:|---|
| Task outcomes | 25 | Not run | Not run | Not run | Three top journeys and error recovery |
| Accessibility | 20 | Not run | Not run | Not run | Matrix in §7 |
| Interaction quality | 15 | Not run | Not run | Not run | States, feedback, alternatives, interaction cost |
| Visual craft | 10 | Not run | Not run | Not run | Blinded expert comparison |
| Responsive robustness | 10 | Not run | Not run | Not run | Viewports, zoom, long content, print |
| Performance | 10 | Not run | Not run | Not run | Lab then field measurement |
| Maintainability | 5 | Not run | Not run | Not run | Token/component/test review |
| Originality and fit | 5 | Not run | Not run | Not run | Brand substitution and content specificity review |

Decision log:

| Decision | Evidence | Alternatives rejected | Owner | Preservation rule |
|---|---|---|---|---|
| Use a guided field guide | Fits assumed novice guest and preparation task | Help library and advocate workbench | Design lead | Do not convert to a card dashboard |
| Do not calculate deadlines | No jurisdiction-specific legal rules or legal review | Automated date interpretation | Legal-content owner | Display only the user-supplied printed date |
| Ask for minimal information | Privacy and completion risk | Document upload and detailed narrative | Product and privacy owners | No sensitive case documents in prototype |
| Keep alternative contact visible | Online form cannot serve every guest | Form-only journey | Product owner | Alternatives remain in every state |

## 11. Customized master prompt for this example

```text
You are helping build a fictional prototype for ClearPath Legal Clinic, a nonprofit intake-preparation service. This is an educational design exercise, not a real legal service.

PRIMARY GUEST
Maya is a fictional 41-year-old retail worker using an Android phone with unstable mobile data. She has received an eviction notice, has little time, and does not understand legal vocabulary. All persona details are assumptions, not research.

OUTCOME
Help her understand what to bring and how to request an intake without an account or sensitive document upload. The prototype must not provide legal advice, interpret a notice, calculate a legal deadline, promise representation, or create an attorney–client relationship.

NON-GOALS
No document uploads, detailed case narratives, payments, case management, testimonials, outcome claims, lawyer ratings, or jurisdiction-specific rules.

SELECTED DIRECTION
Use a calm civic field-guide direction: one primary question per step, persistent progress, visible previous answers, real plain-language copy, and a final preparation summary. Do not use a promotional hero, testimonial carousel, statistics band, feature-card grid, or SaaS dashboard.

VERTICAL SLICE
Choose help topic → indicate whether paperwork has a printed date → record topic and optional date → show document checklist → choose contact preference → review summary → simulate request → show success or recoverable failure.
The optional printed date is displayed only as user-supplied information. It is never used to calculate or imply a legal deadline.

RECIPE BOOK
Use the supplied CSS tokens for warm paper, dark ink, deep teal action, rust focus/error, system serif titles, and system sans-serif body text.
Use native HTML for all controls. Do not introduce a custom date picker, carousel, tooltip-only labels, icon-only navigation, or animation dependency.

REQUIRED RECOVERY
Back preserves answers. Refresh restores non-sensitive answers only in the current tab. Double-click creates one request. Offline and server failure state that the request was not sent, preserve answers, and expose phone and in-person alternatives.

ACCESSIBILITY
Use logical headings and landmarks, fieldset/legend, persistent labels, visible focus, native controls, linked error summaries, meaningful status announcements, and reduced-motion behavior. Test keyboard, screen reader, 320–1920 pixel layouts, long content, text zoom, and print output. Do not claim accessibility conformance from an automated scan.

TEST ADAPTER
Support simulated success CP-1042, validation failure, server failure, timeout, offline, and duplicate-submission prevention. Do not deploy or send real data anywhere.

FIRST RESPONSE
1. Restate the guest, journey, constraints, and unknowns.
2. Identify any conflict or missing decision that would materially change the slice.
3. Produce the token and component plan plus the functional and accessibility test plan.
4. Wait for confirmation before writing the React + TypeScript + Vite implementation.
```

## 12. Review questions for the eventual implementation

- Does every sentence avoid implying legal advice, representation, or a guaranteed response?
- Does the printed-date explanation distinguish a supplied date from a calculated legal deadline?
- Can Maya finish without reading a long legal article or creating an account?
- Can all actions be completed with keyboard, screen reader, zoom, and reduced motion?
- Are alternative contact routes visible before they are needed?
- Are all errors specific, recoverable, and announced once?
- Does the design still feel specific if the clinic name is removed? The intended answer is yes because the content and preparation journey are distinctive.
- Are any components, copy, or visual effects present only because an LLM commonly generates them?
- Which claims remain unverified, and who owns each one?
