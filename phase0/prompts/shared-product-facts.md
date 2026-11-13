## Product facts (identical for Build A and Build B)

**Product.** ClearPath Legal Clinic (fictional): a guided intake-preparation website. It helps a worried, first-time legal-aid visitor understand what to bring and how to request a clinic intake, on a phone, without legal vocabulary, without an account, and without uploading case documents.

**The site must not:** give legal advice, interpret a notice, calculate a deadline, promise a lawyer, collect case documents or detailed narratives, or show testimonials, statistics, lawyer photographs, or success rates.

**Journey (one flow):** choose a help topic → say whether the paperwork shows a printed date (optional date) → see a document checklist → choose a contact preference and give minimal contact details → review a preparation summary → send the request (simulated) → see success, or a failure that keeps the answers.

**Help topics:** Housing or eviction · Benefits · Work or wages · Family safety · Debt or collections · Something else.

**Document checklist (general):** the notice or letter you received, with its envelope if you have it · any other papers about the same issue · a photo ID if you have one · a list of dates and events in order · names of other people or organizations involved · your questions for the clinic.

**Contact preferences:** Phone call · Text message · Email. Ask only for a first name and the one contact detail that matches the preference.

**Other ways to contact the clinic (must stay available throughout):** Call 555-0142 (weekdays 9 to 5) · Visit 200 Example Street, Room 4 (walk-in Tuesdays and Thursdays, 1 to 4).

**Navigation labels:** Prepare for intake · What to bring · Other ways to get help · Privacy.

**Copy to use verbatim.**

Home: "Bring your notice. Leave with a preparation plan." / "Answer a few general questions to prepare for a ClearPath intake request. You do not need an account, and you should not upload case documents here." / button "Start preparing" / link "Other ways to contact the clinic".

Date step: "Does your paperwork show a hearing, response, or other date?" / "Select the date only if it is printed on your paperwork. We will show it in your preparation summary. We will not calculate a deadline or tell you what legal action to take." / "If a date is close or you fear losing housing, benefits, safety, or income, contact the clinic or another qualified local service directly rather than waiting for an online response."

Review step: "Check your preparation summary" / "This is not legal advice and is not a review of your case. It is a summary you can use when contacting the clinic."

Request: "Request an intake" / "Submitting this form asks the clinic to contact you about availability. It does not create an attorney–client relationship or confirm representation."

Failure: "Your request was not sent. Your answers are still on this device." / "Try again, or use one of the alternative contact methods below."

Success: "Your preparation summary is ready." / "Prototype reference: CP-1042. In a real service, the next message would explain the clinic's actual response process. Do not submit another request for the same issue."

**Simulated backend.** No network calls. Add a small "Prototype controls" section at the very bottom of the page with a select element whose id is `sim-outcome` and whose options have the values `success`, `server-error`, `slow`, and `offline`. The send action follows the selected value (`slow` waits about 3 seconds and then succeeds).

**Deliverable.** Exactly one self-contained file named `index.html` (HTML, CSS, and plain JavaScript inline; no external requests, no libraries, no images from the network).
