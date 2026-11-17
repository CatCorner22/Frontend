# Milestone M6 gate review, 2026-11-16: confused first-time user

The report of one helper agent, as it wrote it (hard rule 12; the owner approved the helpers with "Approved" on 2026-11-16). The helper had its own copy of commit `adcf06b`, and the running app and its downloads only, not the builder's conclusions. The text is the helper's, unedited; its claims are the helper's, and the builder's answers stand in `redteam/FINDINGS.md` (rows U8-nn).

---

# M6 gate: confused first-time user report (U8)

Reviewer role: a person who has never seen the app, is not a programmer, and wants a design for a small business website. I used only the running page and the files it let me download. I did not open source code, plans, or records.

All my working files are in `/tmp/claude-0/-home-user-Frontend/05f1e85c-2c2a-5e1e-823f-634a3377d480/scratchpad/m6/user-scratch/` (below: `user-scratch/`). Screenshots are in `user-scratch/shots/`, downloads in `user-scratch/dl/`.

## What I did, step by step

1. I opened `m6/app/refraction-studio.html` in Chromium at `file://`, 1280 × 900, deviceScaleFactor 1. Every curly quote, apostrophe, and tick on the screen came out as garbage (`â€œ`, `âœ“`). The browser read the page as windows-1252 and in quirks mode, because the file has no doctype and no `<meta charset>` (U8-01).
2. So that I could judge everything else, I made a copy with a three-line wrapper in front (`<!doctype html>`, `<meta charset="utf-8">`, viewport): `user-scratch/wrapped/studio-utf8.html`. A published artifact probably gets the same wrapper. I did the main walk on this copy, and I repeated a short walk on the file exactly as given so that I could compare its downloads.
3. I read the start screen and the cards of all 38 Directions, then picked **Sunlit Studio** (its card says it suits cafes and family businesses).
4. In **Your content** I described a made-up bakery, "Maple Lane Bakery": the three questions, the name, the button "Order a cake", no telephone number, the headline, a 348-character paragraph, two services (one named `Cakes <b>to order</b>`), two prices, the About heading, the address, and the hours. Then I tried ordinary mistakes:
   - I emptied the headline.
   - I reloaded the page.
   - I clicked into the middle of a field and typed.
   - I pressed Undo twice.
5. I walked through all 23 Steps:
   - picked a different Option on Steps 2, 7, 12 (Deep blue), 14 (Dark), 17, 20, and 23;
   - chose "Decide later" on Step 5;
   - kept the rest.
6. On **Overlays** I switched on "Error message beside a field" and "Main button that stays in view on a phone".
7. On the **Summary** I read every section. I opened several "fine detail" and research-rule explanations, added a reason to Step 12, tried "Keep this design as a Direction of my own" with an empty name, and used a "Change" link.
8. I downloaded everything the Summary offers: the project file, the seven Prescription files, and the archive. I unpacked the archive, compared it with the single files, and checked the fingerprint in each file. I read `PRESCRIPTION.md` in full, especially section 7, "Floors".
9. I opened the downloaded `mockup.html` at 1280 and 375 pixels and watched for network requests.
10. I switched Contrast checks through Off, "Fix for me", and back to "Warn me", downloaded the Prescription in each mode, and compared the three files.
11. I started a new project (a confirmation question appears), pressed Undo, cleared again, and opened my saved project file again. Then I downloaded everything once more and compared it with the first downloads. I also tried to open three wrong files: `tokens.json`, a plain text file, and `PRESCRIPTION.md`.
12. I typed a long project name with odd characters (`Café / Bäckerei: "<Maple>" xxx…`), downloaded, and pressed Undo.
13. I tried the switch that dresses the Studio itself in the design.
14. At 375 pixels I visited every screen, checked for sideways scrolling, and picked a card on a Step.
15. I logged every network request the page made. There were none.

## Findings

| ID | Severity | What I saw | Where | What I did | Evidence |
|---|---|---|---|---|---|
| U8-01 | major (a blocker if the owner ever uses the bare file) | The page as delivered has no doctype and no character set. At `file://` the browser reads it as windows-1252 in quirks mode, so every curly quote, apostrophe, and tick on screen is garbage. The **downloads are damaged too**: `PRESCRIPTION.md` has 72 garbled spots (including around the "quoted data" marker that tells the AI coding tool what is data), `FONTS.md` has 3, and `DESIGN.md` has 1. The wrapped copy shows none of this. A published page may get the wrapper; the bare file does not. | Whole Studio; downloaded `PRESCRIPTION.md`, `FONTS.md`, `DESIGN.md` | Opened the file as given; downloaded the files; searched them for `â€` | `shots/01-first.png` ("exam: â€œwhich is better, 1 or 2?â€"), `shots/02-after-start.png` ("In use âœ“", "Keep â€œName left, links rightâ€ and continue"); `dl/raw/PRESCRIPTION.md` line 9: "Everything outside a block marked â€œquoted dataâ€ is an instruction to you."; `document.characterSet` = windows-1252, `compatMode` = BackCompat |
| U8-02 | major | The Overlay card and `PRESCRIPTION.md` section 3 name the main button "Book a visit". My button says "Order a cake", and `mockup.html` draws "Order a cake". The instruction file contradicts its own reference page and my content, so the AI coding tool may build the wrong label. | Overlays screen (right column); `PRESCRIPTION.md` §3 line 202 | Set the button words to "Order a cake", switched the Overlay on, downloaded | `PRESCRIPTION.md`: "On a phone, the main button (“Book a visit”) stays at the lower edge of the screen"; `shots/mock-warn-phone-top.png` shows "Order a cake" |
| U8-03 | major | The requirements for people with disabilities (Floor 7.1) are written **only** when "Contrast checks" is set to "Fix for me", and the default is "Warn me". The help line under the switch speaks only of colors ("Warn me: the Studio notes colors that are hard to tell apart, and changes nothing"; "Off: no contrast notes are shown"). Nothing at the switch says it also decides whether the disability requirements go into the Prescription. One sentence deep in the Summary says it. I left the default and got a Prescription without them. The file explains the gap with "(decision D13)", which means nothing to me. | Top bar "Contrast checks"; Summary paragraph under the files; `PRESCRIPTION.md` §7.1 | Left the default, read §7.1; switched to "Fix for me" and compared | `dl/warn/PRESCRIPTION.md` §7.1: "Not written for this project: Contrast checks is “Warn me”, and this Floor is written only when it is “Fix for me” (decision D13)." With "Fix for me", `dl/enforce/PRESCRIPTION.md` §7.1 holds A1–A20 |
| U8-04 | major | Section 7 hands the owner programmer's work and never says who does it or how. The tasks for "a person" are: read the browser console for mixed-content warnings; look at "the order of requests in the browser's network panel"; set HSTS, `X-Frame-Options`, and `Permissions-Policy` "at the host"; "create the address that the form posts to, because a page of files cannot receive data"; use Google's "URL Inspection"; judge figures "at the 75th percentile of page loads". "A person" could be me or the AI coding tool. The screen never warned me that the contact form will not send anything until someone builds a receiving address. | `PRESCRIPTION.md` §7.2 S1, S6; §7.3 H1–H5; §7.4 Q6; §7.5 P1, P2, P6 | Read §7 as the bakery owner | S6: "every `<form action>` is an address on the page's own site that the owner must still create"; §7.3: "Write them down for the owner, as a list of settings to make at the host." |
| U8-05 | major | My 348-character paragraph was cut at 300 characters in the middle of a sentence. The field is one line wide and shows no counter and no notice. The cut sentence then goes into `mockup.html`, and `PRESCRIPTION.md` tells the AI coding tool to use my texts "word for word". (The own-Direction form does say "a field stops at its limit"; Your content does not.) | Your content: "The paragraph under the headline" | Typed a long paragraph | Script log "lede length typed 348 kept 300"; `shots/05-headline-empty.png` (the preview ends "…wheat in the"); `mockup.html` text ends "milk, and wheat in the" |
| U8-06 | minor | S6 says "When the owner named one endpoint…", but the Studio has no place to name a form endpoint. | `PRESCRIPTION.md` §7.2 S6 | Looked through Your content and the Summary for such a field | No such field exists in the field list (`input`/`textarea` dump, step 4) |
| U8-07 | minor | Wrong cross-reference: section 3 says that how an Overlay opens and closes "is not specified in this first part (section 7)". Section 7 is now "Floors"; the list of what is left out is section 8. | `PRESCRIPTION.md` §3 | Followed the reference | "How each Overlay opens, closes, and behaves with a keyboard is not specified in this first part (section 7)" |
| U8-08 | minor | The Floor numbers have gaps: search starts at Q2 and skips Q4 and Q5; speed skips P3, P10, and P11. As a reader I wonder whether something was dropped. | `PRESCRIPTION.md` §7.4, §7.5 | Read the lists | Q2, Q3, Q6, Q7 …; P1, P2, P4 … P9, P12, P13 |
| U8-09 | minor | The Summary tells a non-programmer about a command "in the repository (`npm run fit`)". I do not know what a repository or npm is, or whether I am meant to do something. | Summary, first paragraph | Read it | "A program that measures a built page against the Prescription exists as a command in the repository (`npm run fit`); it is not part of this Studio yet." |
| U8-10 | minor | The plain-language Step values carry bare numbers that mean nothing to me. | Steps list (left), Summary list, Step 12 card text | Read the values | "spacing a little looser (1.18)"; "letter spacing a little tighter (-0.025em)"; "tint color moved toward yellow (85° on the color wheel); tint strength a little weaker (0.01)"; "lightness a little lighter (0.82)" |
| U8-11 | minor | The Undo hint uses an undefined phrase, "the plain start". | Top bar after picking a Direction or opening a file | Picked Sunlit Studio | "Undo takes back: the whole project goes back to the earlier one, which started from the plain start." |
| U8-12 | minor | "Open a project file" exists only on the Summary. A returning person lands on "Pick a Direction" and sees no way to open the file they saved. | Directions screen | Cleared the project and looked for an open button | Script: "open buttons visible: 0" on the Directions screen |
| U8-13 | minor | At 375 pixels, tapping a card "to see it large" leaves the screen at the cards (scroll position 1,212 px). The large preview is far above and out of sight, and the hint "Keys 1 to 3 do the same" means nothing on a phone. | Any Step, phone width | Tapped card 2 on Step 5 | `shots/ph-after-card.png` |
| U8-14 | minor | The Summary line "Every detail in this list is expert opinion" overstates three of the twelve details. Opened, they say: "here the opinion of the assistant that wrote this Studio: no outside source was read." The opened text is honest; the summary line is not quite. | Summary, "Fine details the Studio adds by itself" | Opened "The line under a link…" | Quoted text in this row; `PRESCRIPTION.md` §4.9, §4.11, §4.12: "the judgment of the assistant that wrote the Studio; no outside source was read" |
| U8-15 | note | Broken sentences in the "does not check" list: a full stop followed by a small letter. | Summary, "Notes on this design" | Read it | "the fine grain texture. it lies over the whole page…"; "a two-color gradient. both ends of the fill stand at 3 to 1…" |
| U8-16 | note | `PRESCRIPTION.md` uses terms that the screen never explains: "Fit check" (§8), "Honest receipt" (Q12), and, in "Fix for me" mode, "the ACT rule for this is proposed" (A5, A8). | `PRESCRIPTION.md` | Read it | "a 'judged by the model' item on the Honest receipt"; "The Fit check measures colors…" |
| U8-17 | note | "Deep blue" on a dark page becomes a middle blue (`#4885df`) with dark button text. The preview shows this honestly, but the name "A deep, serious blue" does not match what I got. | Step 12 + Step 14; `DESIGN.md` | Picked Deep blue, then Dark | `DESIGN.md`: `primary: "#4885df"`, `on-button: "#0a1018"` |
| U8-18 | note | Explanations quote sample texts, not mine: the touch-target research rule says "for example “About repairs”", although my services are Bread and Cakes. | Summary, research rule "Buttons, menu links, and form fields…" | Opened the rule | "Text links inside the page (for example “About repairs”) are 24 pixels tall" |
| U8-19 | note | The project-file name splits a word with an umlaut: "Café / Bäckerei" becomes `cafe-ba-ckerei-…`. | Download the project file | Typed an odd project name | Suggested name `cafe-ba-ckerei-maple-xxxxxxxxxxxxxxxxxxx.refraction.json` |
| U8-20 | note | "Open that folder with your AI coding tool" names no tool and gives no next step. A non-programmer does not learn which tool to use or how the result reaches the internet. | Summary, "The Prescription" | Read it | "Put the seven files into one folder, open that folder with your AI coding tool, and ask it to build the home page from PRESCRIPTION.md." |

## Section 7, "Floors", read as this person

I understand its purpose: it is a list of rules for safety, for being found on Google, for speed, and, only in "Fix for me" mode, for disabled visitors. The opening paragraph says plainly that no program checks any of it and that it promises no standard. The file never claims that my site is "accessible" or "compliant". I searched every download for "accessible", "compliant", "WCAG compliant", and "ADA" and found no such claim; WCAG appears only as the name of the contrast formula and as a source.

I do not understand **what it asks of me**. Most lines are addressed to the AI coding tool, in code words (`Content-Security-Policy`, `noopener`, `fetchpriority`). Every line also has "A person must still check: …", and that person is never named. Several of those checks are programmer tasks: read the browser console, read the network panel, set response headers at "the host", create a receiving address for the form. Section 7.3 says these host settings go "to the owner", so they land on me, with no explanation of what a host is or where to make the settings. I also learn only here that my contact form cannot send anything until someone builds a receiving address. Finally, the disability section is missing from my file because of a color switch that I never connected with it (U8-03).

## What worked well

- **Nothing reached the network.** No request left the Studio or the downloaded `mockup.html` in any run.
- **No sideways scrolling.** No screen scrolled sideways at 375 pixels, and the mockup worked at phone width. Its sticky button showed my words, "Order a cake".
- **The Direction cards help.** "Best for" and "Watch for" made choosing easy. Cards that start with contrast notes say so in advance.
- **Empty fields are handled kindly.** The empty headline gave a clear message ("The page needs this text. The last one stays in place until you type a new one."), and a reload kept the previous headline.
- **Odd text stays text.** `Cakes <b>to order</b>` appeared as text everywhere: on screen, in `mockup.html`, and in `PRESCRIPTION.md`.
- **Your content shows what is still sample.** It lists exactly which 12 of 23 texts are still the dental sample, and `PRESCRIPTION.md` tells the AI coding tool to treat those as placeholders.
- **Undo works.** It goes back one field or one Step at a time and names what it will take back. It also brought back a whole cleared project.
- **Starting over is safe.** "Start a new project" asks first, lists what it will clear, offers Undo, and keeps a copy on the Summary.
- **Work survives a reload.** Reloading kept the Direction, the Decisions, the content, and the project name.
- **Saved files come back exactly.** Reopening the project file produced downloads byte-identical to the first ones.
- **Wrong files are refused clearly.** Each was turned away with "That file was not opened. It is not a Refraction project file. Your open project is unchanged."
- **The archive is consistent.** Its seven files are identical to the single downloads, and every file carries the same fingerprint (`0668db0c`).
- **The contrast reporting is honest.**
  - "Warn me" lists the one weak pair (3.88 to 1).
  - "Fix for me" adjusts it and reports the new figure (5.17 to 1).
  - "Off" says: "That is no statement that every pair meets a requirement: no program looked."
- **Explanations state their sources and strength honestly.** Research rules and fine details give a source, a strength, a review date, and "seen only as a search snippet" where that applies.
- **The questions are plain.** Every Step asks one plain question and explains its term in brackets at first use ("designers call it the hero").
- **Other inputs behave well.** "Decide later" works, and the Summary and `PRESCRIPTION.md` both say "22 of 23". A reason I added went word for word into `PRESCRIPTION.md`. The own-Direction form refused an empty name with "Give the Direction a name."
