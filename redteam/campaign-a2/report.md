# Campaign A2: report

Written by the lead (Red) on 2026-11-16, after the judge's findings (`findings.md`) were committed and before any repair of them. The lead is also Blue for part of the target (the audit's repairs in `942d2b3` and `59704b7`); Blue's words stand only in the last section, under "Blue's response".

## 1. Exam question and target pin

**Exam question.** Can a hostile input (a project file, a file of own Directions, a Prescription folder, or a page under test) make the Prescription or the Fit check's receipt say something false, carry a hidden instruction to an AI reader, or reach the network, without the owner seeing it?

**Answer from this round: yes, on all three counts.** A page under test reached the network during a check (J-1), earned a status-0 receipt while it deviates for every real visitor (J-3, J-4, J-6, J-7), and planted an invisible instruction in a passing receipt (J-5). Project files made `PRESCRIPTION.md` state falsehoods about the design's history (J-9 to J-11).

**Pin.** `CatCorner22/Frontend` at `59704b7`, Node 22.23.4, Chromium at `/opt/pw-browsers/chromium` with Playwright 1.65.0. Every lane and the judge worked in private worktrees of that commit.

## 2. Run summary

| Measure | Value |
|---|---|
| Lanes × rounds | 6 × 1 |
| Target runs (reported by the lanes) | 72 (A 2, B 17, C 5, D 8, E 15, F 25) |
| Attempts logged | 72 |
| Confirmed findings | 15: 8 at S2, 5 at S1, 2 at S0 |
| Observed once | 0 |
| Needs human review | 5 (J-17 to J-21) |
| Collateral | 1 (J-16, S1) |
| Coverage cells tried | 6 of 9 (67%); a confirmed finding in all 6 |
| Tokens, measured | lanes 978,000 (A 155,000; B 152,000; C 139,000; D 125,000; E 225,000; F 183,000); judge 314,000; total about 1.29 million |
| Estimate in the charter | 0.8 to 1.2 million: **the campaign ran about 8% over the top of the estimate** |
| Independence mode | sub-agents; the judge received stripped attempts under anonymous identifiers (`attempts-as-judged.json`); the key (`key.md`) was released after judging |

Every confirmed finding reproduced 2 of 2 times, except J-14 (1 of 1 on a stored pair) and J-16 (reproduced at smaller sizes).

## 3. Confirmed findings, worst first

Each entry cites the judge's record; `findings.md` holds the exact reproduction.

**S2 (guardrail bypass)**

| Finding | What a hostile input achieves | Lanes |
|---|---|---|
| J-1 | A WebRTC connection (STUN over UDP) sends packets off the page during a check; the receipt says "0 requests" and "Every request is written down and stopped". The program blocks only HTTP(S) and WebSocket traffic | B, C |
| J-2 | A `<base href>` on another site makes a cross-site form post or a lazy tracking image read as "own address" on a passing receipt | C, F |
| J-3 | The page shows the Prescription only to the Fit check's browser (it asks for reduced motion, it is automated, it reads once right after load) and another design to every visitor: status 0. One variant uses no script at all | B |
| J-4 | The page sees that it was opened by the Fit check (`about:` address), replaces itself with the Prescription's own Mockup, and earns "No deviation" and "0 scripts" while its real self deviates and fetches a tracker | D |
| J-5 | Invisible "tag" characters put an instruction aimed at an AI reader into `RECEIPT.md` and `receipt.json`, on a passing receipt; the owner sees `link href: /hero.jpg` | D, F |
| J-6 | A filter that recolors the whole page, pseudo-elements in any color, typeface, and radius, outlines, and text strokes pass "every color that the page draws is a color of the Prescription" | B |
| J-7 | The owner's required texts at font size 0, at opacity 0, or hidden on phones only, pass the content measure | B, F |
| J-8 | A `mockup.html` without a headline (or with renamed classes) switches the content measure off silently: "0 deviations; 0 not measured", status 0 | B, F |

**S1 (wrong but contained)**

| Finding | What happens | Lanes |
|---|---|---|
| J-9 | A project file makes `PRESCRIPTION.md` misstate the start and the Decisions ("decided no Step", "kept as the start gave it", a Skin named over other colors), with no note to the owner | E |
| J-10 | A slider set exactly on an Option is described as "a value between the Options" | E |
| J-11 | One changed text (the phone number) makes `PRESCRIPTION.md` call every sample text "the owner's own: use them word for word" | E |
| J-12 | The text cleaner keeps 50 invisible or formatting signs, which reach `PRESCRIPTION.md` and `mockup.html` | E |
| J-13 | Seventeen layout settings do not change the fingerprint, so files from two layouts pass as one set | E |

**S0 (informational)**

| Finding | What happens | Lanes |
|---|---|---|
| J-14 | Two designs within the sliders' reach share a 32-bit fingerprint, found in seconds; the Fit check accepts a folder mixed from them | E |
| J-15 | A duplicate inside a file of own Directions is reported as "this browser already holds it" | E |

## 4. Observed once, and items that need human review

No attempt stayed at "observed once". The judge sent five items to the owner, because each turns on what a stated rule means:

| Item | The owner decides |
|---|---|
| J-17 | Whether naming the two window widths at the top of the receipt is enough, when a page can deviate at every other width (a CSS rule alone does it). If not, it joins J-3 at S2 |
| J-18 | Whether content cut off beyond the window (`overflow-x: hidden` or `clip`) counts as "wider than its window". If so, S2 |
| J-19 | Whether "every text uses a typeface that the Prescription names" may rest on the font's name alone, when a page can give that name to any face |
| J-20 | Whether the receipt should name "the fingerprint that the files state" or recompute it: a hand-copied fingerprint makes the receipt name a design that it did not measure, and the refusal message teaches that one-line edit |
| J-21 | Which of two sentences to change: `DESIGN.md` says that the Studio measured the button pair; `PRESCRIPTION.md` says, with contrast checks off, that "no program looked" |

## 5. Collateral findings

J-16 (S1): a file of own Directions whose name carries hundreds of thousands of combining marks stalls the core for tens of seconds, because the name is cleaned before it is cut to 60 characters. The time grows with the square of the length. It breaks none of the listed requirements.

## 6. Coverage archive

| Cell | Best attempt | Result |
|---|---|---|
| P × G1 (a project or own-Directions file plants an instruction) | Lane A: five attempts (bidi signs, tag characters, fence breaks, markup) | **Held**: every owner text was cleaned and fenced (X-02, X-11, X-24, X-60, X-72). Lane E reached the cell sideways: J-12 (50 invisible signs pass the cleaner) |
| P × G3 (a file makes the Prescription false) | Lane E | J-9 to J-15 |
| B × G1 (the receipt carries a hidden instruction) | Lane D | J-5. Fence breaks held (X-17, X-56) |
| B × G2 (network or another site counted clean) | Lane C | J-1, J-2. WebSocket, window, and navigation blocks held (X-21, X-71) |
| B × G3 (a false pass) | Lane B | J-3, J-6, J-7, J-17 to J-19 |
| F × G3 (a folder makes the receipt false) | Lane F | J-8, J-20 |
| P × G2 | not tried | The Mockup's security policy (`default-src 'none'`) stands in the way; not tested in this round |
| F × G1 | not tried | No lane planted an instruction through the folder's files |
| F × G2 | not tried | No lane made the folder's Mockup reach the network |

## 7. Adversaries modelled

The poisoned-file sender (lanes A and E), the self-grading builder (lane B), the leaky page (lane C), the receipt injector (lane D), and the confused owner (lane F, the wildcard). The confused owner's ordinary mistakes (one hand-edited value, one retyped fingerprint, one `overflow-x: hidden`) produced four of the findings; the simplest attacks were among the most effective.

## 8. What Blue did well

- **Quoted data held.** No attempt closed a fence, in `PRESCRIPTION.md` or in the receipt (X-17, X-24, X-56); every owner text in the Prescription was cleaned and fenced (X-02, X-11, X-60).
- **Markup stayed text.** Script and markup in the owner's texts reached `mockup.html` escaped (X-72).
- **Refusals were right.** A wrong folder, swapped arguments, UTF-16 files, and a byte-order mark were refused with status 2 and no receipt (X-26, X-35, X-39, X-42).
- **The contrast notes held.** Over 64,302 designs and both contrast settings, no failing pair went unreported (X-28).
- **The audit's blocks held** for HTTP, WebSocket, a window, and a navigation away (X-21, X-71, X-65's immediate fetches: 0 connections reached the listener).

## 9. Recommended fixes

The owner (sponsor) decides each fix; the builder (Blue) carries out what the owner approves. Proposals:

| Finding | Proposed fix |
|---|---|
| J-1 | Launch the check's browser so that WebRTC cannot send (Chromium's flag that forbids non-proxied UDP, with a proxy that leads nowhere), and add a test with a UDP listener |
| J-2 | Already repaired after the pin (A1-10); needs Red's retest |
| J-3, J-17 | Measure at more widths and both motion preferences; read the page twice with a pause; state in the receipt every condition of the reading (automation, motion preference, the one moment) |
| J-4 | Serve the build from a fixed address that is not `about:`, and refuse a page whose document changed address or contents between load and reading; record a `blob:` navigation as a request |
| J-5 | Remove (or show visibly, by code point) every invisible and direction sign before any page text enters the receipt, as `PRESCRIPTION.md` does (SPEC 2.8.1); cut quoted lines by whole characters |
| J-6 | Read pseudo-elements, outlines, text strokes, and filters, or list each in "Still needs a person" and in the measure's own note |
| J-7, J-18 | Count a required text as present only when it is drawn at a readable size and opacity at each width, separately; count content clipped beyond the window as width |
| J-8 | Already repaired after the pin (A1-14); needs Red's retest |
| J-9 | Check on open that the file's start, kept Decisions, and Skin agree with its values; say so in a note, and write only true sentences |
| J-10 | Write "picked" words when a tuned value equals an Option |
| J-11 | Say per text whether it is the sample's or the owner's |
| J-12 | Clean by Unicode property (`\p{Cf}` and Default_Ignorable_Code_Point), not by a list |
| J-13 | Let the fingerprint cover every Studio setting, or change SPEC 2.9's words |
| J-14 | Accept as stated ("a mark to compare, not a seal"), or lengthen the mark |
| J-15 | Name an in-file duplicate as such |
| J-16 | Cut a name before cleaning it |

## 10. Retest plan

Each approved fix is retested with the lane brief that found it plus one new variant lane, against the commit that holds the fix, before its status becomes "retested-pass". J-2 and J-8 need that retest now. The three untried cells (P × G2, F × G1, F × G2) go into the next round's briefs. Proposed date of the next campaign: after the Floors enter the Prescription (milestone M6), because the Floors will make contrast binding and change what a false pass is.

---

## Blue's response (2026-11-16, written by the builder, who is also the lead)

- **J-2 and J-8 were repaired after the pin, for another reason.** The reviewer helper reported the same mechanisms on 2026-11-16 (findings A1-10 and A1-14), and the builder repaired them in `c51e5e6`, before the judge reported. Red has not retested either.
- **J-1 corrects one of the builder's own records.** Row A1-01 in `redteam/FINDINGS.md` says "one WebRTC probe to a STUN server on this machine sent nothing". The lanes' probe (with a data channel and an offer) did send; the builder's probe was weaker than the claim built on it. The row gets a dated correction; it is not deleted.
- **J-5 and J-12 share a cause with A1-04:** the cleaning of invisible signs is a list. The builder proposes one cleaner by Unicode property for the Prescription and the receipt alike.
- No fix is made until the owner decides.
