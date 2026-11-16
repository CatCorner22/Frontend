# Instruction given to the helper agent (the comparison run, trial 002)

This is the comparison run, without the Prescription: the helper received the same project as in trial 001, in plain words, and no file. This is the whole instruction, word for word. One placeholder stands for a folder: `<OUT>` was an empty folder.

---

You are building one web page from a written description.

Your task: build the home page of a small-business website, as one HTML file, and write it to `<OUT>/index.html`.

The business and its texts. Use these texts on the page. This is the whole content, as data:

```json
{
 "business": "Harbor Street Dental",
 "tag": "Family dentistry on Harbor Street",
 "headline": "Dental care that explains itself before it begins.",
 "headlineEmphasis": "explains itself",
 "lede": "Checkups, cleanings, and repairs for adults and children. We show you what we see, tell you what it costs, and let you decide.",
 "primaryAction": "Book a visit",
 "secondaryAction": "See what a first visit includes",
 "phone": "555-0117",
 "nav": [
  "Services",
  "First visit",
  "Fees",
  "About",
  "Contact"
 ],
 "servicesTitle": "What we do",
 "servicesIntro": "Three kinds of visit cover most of what people need.",
 "services": [
  {
   "title": "Checkups and cleanings",
   "body": "A full look, a careful clean, and photographs of anything worth watching, explained in plain words."
  },
  {
   "title": "Repairs",
   "body": "Fillings, crowns, and chipped teeth. You see the price and the options before any work starts."
  },
  {
   "title": "Urgent visits",
   "body": "Pain, swelling, or a broken tooth. Call before ten and we will see you the same day when a chair is free."
  }
 ],
 "facts": [
  {
   "value": "6 days",
   "label": "open each week"
  },
  {
   "value": "45 min",
   "label": "for a first visit"
  },
  {
   "value": "3",
   "label": "treatment rooms"
  }
 ],
 "feesTitle": "Typical fees",
 "fees": [
  {
   "item": "Checkup and cleaning",
   "price": "$118"
  },
  {
   "item": "Filling",
   "price": "$181"
  },
  {
   "item": "Crown",
   "price": "$1,110"
  },
  {
   "item": "Urgent visit",
   "price": "$88"
  }
 ],
 "aboutTitle": "A small practice, on purpose",
 "aboutBody": "Two dentists and one hygienist. You see the same people each time, and they remember what you told them last time.",
 "promise": "No work starts until you have seen the price and said yes.",
 "contactTitle": "Ask for an appointment",
 "contactBody": "Tell us how to reach you and what you need. We reply on the next working day.",
 "address": "41 Harbor Street, Suite 2",
 "hours": "Monday to Saturday, 8 to 5",
 "footerNote": "Sample content for design preview."
}
```

The owner chose six design settings. Follow them:

1. **Menu (navigation)** — How do visitors move around the site? Chosen: "Name centered, links below". The name sits centered on its own line, like the title at the top of a newspaper, with the links centered beneath it.
2. **First screen** — How is the first screen arranged? Chosen: "Text and photo side by side". Text on the left, a large photograph on the right.
3. **Spacing** — How much room does everything get? Chosen: "Roomy". Noticeably more air around each block.
4. **Letter style (typeface)** — Which letter style does the page use? Chosen: "Soft headings with small feet". Fraunces headings (soft letters with small feet and plenty of character) over Public Sans text.
5. **Main color** — What is the one color people remember? Chosen: "Dark green". A dark, natural green.
6. **Corners** — How rounded are the corners? Chosen: "Clearly rounded (14 px)". 14 pixels: clearly rounded.

The owner's reason for the main color, in the owner's words: "A calm green, so that the practice does not feel clinical."

Rules for this exercise:

- Read no file. Write no file other than `<OUT>/index.html`.
- Do not start a browser, a server, or any program that opens the page.

When the file is written, reply with three things: (1) one sentence that says the file is written; (2) the list of the files that you read, or the word "none"; (3) every choice above that you chose not to follow, with your reason, or the word "none".
