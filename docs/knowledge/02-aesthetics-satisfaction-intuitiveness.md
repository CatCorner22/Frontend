# Aesthetics, satisfaction and intuitiveness: what the evidence supports

Part 2 of the design knowledge base, generated 2026-11-13. The 68 records behind this chapter are in `kb-aesthetics-satisfaction.json`; each topic below ends with the ids of its records.

**How to read the grades.** A = law or formal standard. A- = peer-reviewed research. B = large practitioner research, such as that of the usability research firms Nielsen Norman Group (NN/g) and Baymard Institute. C = vendor or individual expert opinion. D = folklore. A meta-analysis is a study that pools many experiments; it outranks any single experiment.

**How the research checked the sources.** Search results or abstracts confirm most sources; the research opened no full paper. It read the accessibility standards and the vendor documents hosted on GitHub directly. Each record states its own verification level, and carries design moves for a Prescription and checks for a Fit check. Records marked `from-memory-unverified` need a second look before anyone quotes their details. Legal points are summaries, not advice.

## 1. First impressions

**Mechanism.** The eye takes in layout, color and density before it reads. People form a stable rating of visual appeal within half a second, and that rating spreads to early judgments of trust and usability. The spread is a halo effect: one impression coloring unrelated qualities. Two properties predict a good rating: low visual complexity, and high prototypicality, meaning the page looks like what people expect for its type.

**Moves.** Make the first screen complete and orderly in the first frame the browser draws. Keep the layout skeleton typical. Limit the number of text styles, colors and box treatments.

**If ignored.** A cluttered or half-loaded first view starts every later judgment at a deficit.

**Evidence: A-.** Replicated experiments, all with screenshots and ratings, none with behavior on live sites.

Records: `first-impression-speed-and-halo`, `low-complexity-high-prototypicality`.

## 2. Beauty and usability

**Mechanism.** Before use, people infer ease from looks (the aesthetic-usability effect). After use, experience replaces inference: usability drives the ratings, and frustration makes the same design look worse.

**Moves.** Give first-run screens (what a new user sees first) full visual care. Fix blocking problems before polish. Record task success beside ratings.

**If ignored.** A polished mock-up earns high ratings that hide real problems, or a beautiful flow fails at one step and loses the goodwill.

**Evidence: A-.** Looks mask minor friction, not serious faults. Two meta-analyses find that better looks improve measured performance slightly (standardized effects of 0.12 in 2019 and 0.29 in 2026; by convention 0.2 is small).

Records: `aesthetic-usability-effect`, `beauty-masks-only-minor-problems`, `aesthetics-performance-small-effect`.

## 3. Fluency: why "clean" feels good

**Mechanism.** Processing fluency is the felt ease of taking something in. The mind registers ease as pleasant and credits the object. Symmetry, clear contrast, repetition and familiar forms raise fluency. A second route to liking exists: a small difficulty that resolves creates interest, while total predictability bores.

**Moves.** Use few spacing values, consistent alignment and repeated components. Add one element that rewards a second look, away from any task.

**If ignored.** Irregular pages feel effortful. Perfectly regular pages with nothing of their own feel flat.

**Evidence: A-.** Strong for liking of simple stimuli; a meta-analysis shows that repetition raises liking and later lowers it. The transfer to interfaces is partly an assumption.

Records: `processing-fluency-liking`, `mere-exposure-inverted-u`, `pleasure-interest-balance`.

## 4. Familiarity and intuition

**Mechanism.** "Intuitive" means "usable with what the person already knows". People arrive with a mental model: an internal picture of how such sites work and where things are. They built it on other sites, so they expect a new site to work the same way (Jakob's law). An affordance is a possible action; a signifier is the visible cue that announces it, and signifiers work because they are familiar. Preference follows the MAYA principle, "most advanced, yet acceptable": people like novelty that leaves the design typical, meaning still recognizable as a good example of its kind.

**Moves.** Put common objects where the genre puts them. Use standard controls with unmistakable signifiers. Spend novelty in one place that no task depends on.

**If ignored.** Novel navigation and weak cues make people search and hesitate. One NN/g study measured 22% more time on pages with weak signifiers.

**Evidence: A- to B.** Experiments support typicality with novelty for physical products, and shared location expectations on websites. Jakob's law itself is a practitioner summary.

Records: `intuitive-equals-familiar`, `jakobs-law-mental-models`, `signifiers-over-affordances`, `maya-typicality-novelty`.

## 5. Trust and credibility

**Mechanism.** People judge what they notice first, and that is the look. A site that visibly took investment signals a capable organization. People read a noticed flaw as a sample of the organization's care.

**Moves.** Keep every landing page coherent. Remove typos, dead links and placeholders. Use real images of the real subject. State prices, terms and identity before commitment.

**If ignored.** Visitors reject the site before they read it. Late fees and surprises make them re-examine everything.

**Evidence: A- to B.** In a 2002 study of 2,684 people, 46.1% of credibility comments mentioned visual design. An experiment with 272 participants linked presentation flaws to lower trust. Disclosure guidance rests on NN/g and Baymard research.

Records: `design-look-top-credibility-cue`, `errors-and-flaws-erode-trust`, `real-content-over-stock`, `upfront-disclosure`.

## 6. Emotion and memory

**Mechanism.** People perceive pragmatic quality (the product gets the task done) and hedonic quality (it stimulates, and it says something about its user) separately. Memory keeps the most intense moment and the end of an experience (the peak-end rule). Effort rises near a goal (the goal-gradient effect), and a head start raises completion (the endowed progress effect). Delight works only on top of function.

**Moves.** Soften the worst moment of each flow. Design the ending. Show honest progress. Place small pleasures at pauses.

**If ignored.** People remember a flow that ends on an upsell (an offer to buy more) by the upsell.

**Evidence: A- with limits.** A meta-analysis of 174 effects supports the peak-end rule in general; interface studies are mixed. Norman's visceral, behavioral and reflective levels are a vocabulary (C), not a tested model.

Records: `three-levels-emotional-design`, `hedonic-and-pragmatic-quality`, `peak-end-rule`, `progress-motivation`, `delight-rests-on-basics`.

## 7. Measuring satisfaction

**Mechanism.** Ratings and performance are different quantities. Their correlation was about .44 in one review (1 would be perfect agreement) and weaker across the wider literature.

**Moves.** Pair a behavioral measure with a standard questionnaire: the System Usability Scale (SUS; average score 68) or the User Experience Questionnaire (UEQ), which separates pragmatic from hedonic scores. Do not steer design by Net Promoter Score (NPS), a single "would you recommend" question.

**If ignored.** A design wins a vote and loses in use.

**Evidence: A-.** One review of 57 studies and one meta-analysis of 73.

Records: `standard-questionnaires-sus-ueq`, `nps-limits`, `preference-performance-gap`.

## 8. Frustration and recovery

**Mechanism.** Frustration comes from blocked goals. In a 2023 study people lost 11% to 20% of an hour to it, and 84% of the episodes were repeats. Lost work, unexplained waits and interruptions are the sharpest forms. Deceptive patterns (designs that steer people into choices they would not otherwise make) raise sign-ups and, when noticed, turn people against the brand.

**Moves.** Offer undo. Keep typed data through errors, reloads and timeouts. Explain waits. Hold sign-up and survey requests until a task ends. Make declining as easy as accepting.

**If ignored.** One lost form outweighs many good screens.

**Evidence: A to A-.** Accessibility standards require reversible or confirmed submissions and adjustable time limits. In experiments, mild deceptive patterns more than doubled acceptance without backlash, which is why regulators act.

Records: `frustration-common-and-recurring`, `undo-and-forgiveness`, `never-lose-user-work`, `waiting-feedback-and-certainty`, `interruptions-cost-stress`, `deceptive-patterns-work-then-backfire`.

## 9. Choice and control

**Mechanism.** More options hurt only when the options are hard to compare, the task is hard, preferences are unclear and the person wants a quick decision. A default (the pre-selected option) wins because keeping it is easy, it reads as a recommendation, and giving it up feels like a loss.

**Moves.** Make options comparable. Mark a recommendation. Set defaults in the user's interest. Let users set the pace.

**If ignored.** People stall on unsorted lists, or discover a self-serving default and stop trusting the product.

**Evidence: A-.** Meta-analyses: the average choice-overload effect is near zero; the default effect is large and variable.

Records: `choice-overload-is-conditional`, `defaults-are-powerful`, `autonomy-and-customization`.

## 10. Consistency, feedback and predictability

**Mechanism.** Consistency lets people reuse what the first screen taught. Feedback closes the loop between action and result. Unprompted movement or navigation voids the user's plan.

**Moves.** Define each component once. Show every state (loading, empty, error, success). Reserve space so that nothing shifts. Never navigate or submit on focus or selection.

**If ignored.** People re-check everything and stop trusting their own hands.

**Evidence: A to B.** The Web Content Accessibility Guidelines (WCAG) make consistent navigation, consistent identification and "no change of context on focus or input" formal success criteria. Feedback and layout stability rest on expert heuristics and a vendor metric. Consistency still serves tasks, not the reverse.

Records: `consistency-internal-and-external`, `visibility-of-system-status`, `predictability-no-surprises`.

## 11. Novelty and expressiveness

**Mechanism.** Appeal has a classical side (order) and an expressive side (originality). Novelty fades with use; usefulness stays. Regular users resent sudden change because it destroys what they learned.

**Moves.** Secure order first. Judge expressive choices by the hundredth use. Change familiar products in steps.

**If ignored.** Launch-day effects become daily irritants.

**Evidence: A- to C.** Google's claim that its Material 3 Expressive designs make key elements up to four times faster to spot is unpublished vendor research. Apple's translucent Liquid Glass style drew legibility criticism, and Apple added controls to reduce it.

Records: `classical-vs-expressive-aesthetics`, `novelty-fades-usefulness-stays`, `change-aversion-redesign-backlash`, `vendor-expressiveness-claims`.

## 12. Color and shape

**Mechanism.** Color-emotion associations are widely shared (similarity .88 across 30 nations) yet local, and an association is not an effect on behavior. Lightness (how light or dark) and saturation (how vivid) shape feeling more than hue (which color). People prefer curves moderately, depending on context.

**Moves.** Set saturation and lightness before hue. Test fit with the audience. Treat corner radius as a choice of personality, applied consistently.

**If ignored.** A palette chosen from a chart of color meanings misfires with the real audience.

**Evidence: A-.** One 30-nation study and, for curves, a meta-analysis of 61 studies. None tested interfaces.

Records: `color-emotion-partly-universal`, `lightness-saturation-over-hue`, `color-fit-and-brand-personality`, `curvature-preference`.

## 13. Sameness in AI-built interfaces

**Mechanism.** A large language model (LLM) produces the most probable output, so results converge. Experiments on writing show better individual work and less variety across people. Seeing a polished example also narrows a designer's ideas (design fixation).

**Moves.** Decide typeface, palette, shape and one signature element (a single memorable feature) before generation. Check for unchosen defaults instead of using a fixed blacklist: one vendor's list of "tells" (features that reveal a generated page) changed almost entirely between 2025 and 2026.

**If ignored.** The page is competent and interchangeable.

**Evidence: A- for text, C for interfaces.** The search found no peer-reviewed measurement of interface convergence.

Records: `llm-output-homogenization`, `ai-ui-default-cluster-drifts`, `examples-cause-fixation`, `bespoke-signals`.

## 14. Audience differences

**Mechanism.** Taste follows exposure. A study of 2.4 million ratings found that preferred colorfulness and complexity differ by age, gender, education and country. Each genre of site has its own prototype.

**Moves.** Name the audience and the genre before choosing density (how much sits on one screen) and color.

**If ignored.** The design suits its maker and not its users.

**Evidence: A-.** Snap ratings of screenshots by self-selected volunteers.

Records: `preferences-vary-by-audience`, `genre-conventions-set-expectations`.

## 15. Accessibility as quality

**Mechanism.** Accessibility guidelines encode good general practice. In experiments, non-disabled users performed better on sites that followed the guidelines more closely, and rated them more usable and more attractive.

**Moves.** Treat WCAG Level AA (the middle of three levels) as a quality floor. Honor the reduce-motion setting, because motion can sicken people with vestibular (balance) disorders. Report what the checks covered and what a person must still check.

**If ignored.** The product excludes some people and serves the rest worse.

**Evidence: A to A-.** About 96% of top home pages still fail automated checks, most often on text contrast.

Records: `accessible-design-helps-everyone`, `accessibility-baseline-law-and-reality`, `reduced-motion-floor`.

## What makes an interface feel premium, according to evidence versus according to practitioners

**Supported by research (A-).**

- *Space.* White space raised perceived prestige in advertising and retail studies. The meaning is learned and cultural. In the one web experiment, usability ratings fell once white space passed half of the page.
- *Low complexity with typicality.* Both raise first-impression ratings.
- *Perceived craftsmanship.* Viewers rate "skillfully made" as a separate facet of appeal.
- *Visible effort.* People value what visibly took effort, and services that show their work.
- *Absence of flaws.* One noticed error lowers perceived quality and trust.
- *A counterweight.* In side-by-side comparison, people assume that a simpler design cost less to make, and they will pay less for it. Restraint needs visible precision.

**Supported by standards or practitioner research (A to B).** Immediate response, stable layout, consistent components, complete states.

**Held by practitioners, untested (C).** Short, purposeful motion (one design system specifies 70 to 700 ms). Fine typographic detail. Tabular numerals (digits of equal width). Loading indicators that wait briefly before they appear. State kept in the URL. Nested corners that share a center. These rules are plausible applications of the craftsmanship and effort findings, and they are cheap to specify and to check. No study isolates their effect.

**Not supported.** "Dark mode looks premium": the search found no interface study. Dark treatments raised the perceived luxury of logos and luxury advertisements, and light themes read better for most people.

Records: `whitespace-prestige-with-limits`, `simplicity-can-read-as-cheap`, `craftsmanship-facet`, `visible-effort-raises-value`, `responsiveness-as-quality`, `motion-purposeful-brief`, `typography-mood-and-impression`, `invisible-details-craft-layer`, `folklore-dark-mode-premium`.

## Famous claims that are weaker than they sound

| Claim | What the evidence supports |
|---|---|
| "You have 50 ms to win the visitor" | An appeal rating formed in 50 ms matches later ratings. The studies measured no behavior. |
| "94% of first impressions are design-related" | Fifteen women judged health sites; the figure described reasons for rejecting sites. |
| "75% judge credibility by design" | No primary source. The Stanford study reported 46.1%. |
| "Color increases brand recognition by 80%" | The search found no primary study. |
| "62-90% of judgments rest on color" | A 2006 review article states it; the search found no data behind it. |
| "Each color has a universal meaning" | Associations are shared but vary, and they are not effects. |
| "The golden ratio is the most beautiful proportion" | Controlled studies find no reliable preference. |
| "Fewer choices are always better" | The average effect is near zero; four conditions decide. |
| "Unfinished tasks stick in memory" (the Zeigarnik effect) | A 2025 meta-analysis found no memory advantage, only a tendency to resume. |
| "NPS is the best predictor of growth" | Independent replication failed. |
| "88% never return", "8-second attention span", "53% leave after 3 seconds" | Vendor surveys or untraceable figures. |

Records: `folklore-50ms-rule`, `folklore-design-credibility-percentages`, `folklore-brand-color-statistics`, `folklore-golden-ratio`, `zeigarnik-caveat`, `nps-limits`, `folklore-ux-business-statistics`.
