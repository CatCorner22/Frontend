# Instruction given to the helper agent (the first build trial)

This is the whole instruction, word for word. Two placeholders stand for folders: `<IN>` is a folder that held the seven files and nothing else, and `<OUT>` was an empty folder.

---

You are building one web page from a written design specification.

The folder `<IN>` holds seven files: `PRESCRIPTION.md`, `DESIGN.md`, `tokens.css`, `tokens.json`, `theme.css`, `mockup.html`, and `FONTS.md`. Read all seven.

Your task: build the home page of the website that `PRESCRIPTION.md` describes, as one HTML file, and write it to `<OUT>/index.html`. The seven files are your only source of rules.

Rules for this exercise:

- Read no file other than the seven files. Write no file other than `<OUT>/index.html`.
- Do not start a browser, a server, or any program that opens the page.

When the file is written, reply with three things: (1) one sentence that says the file is written; (2) the list of the files that you read; (3) every rule of the Prescription that you chose not to follow, with your reason, or the word "none".
