// Overlays: small helpers that appear over the page.
//
// An Overlay is the owner's term for an option that can be switched on for any Direction: a tooltip, an "Are you sure?"
// question, a notice after an action. An Overlay is not a look; it is a behavior, drawn in the look that the project has.
// The set is short on purpose. Each record says what the Overlay is, when it helps, and what can go wrong with it, and it
// names the research record behind it. No Overlay is graded "measured": the research helpers saw the studies behind these
// records only as summaries, and that grade needs a source that was read in full.
//
// The preview shows each Overlay open, as a picture: a Mockup carries no script (hard rule 6), so nothing opens or closes.

import type { Evidence, SourceRef } from './types.js';

export interface Overlay {
  id: string;
  name: string;
  /** What a visitor sees. */
  what: string;
  /** When to switch it on. */
  chooseWhen: string;
  /** What can go wrong with it. */
  risk: string;
  sources: SourceRef[];
  evidence: Evidence;
  /** The date of the last review, as YYYY-MM-DD. */
  reviewed: string;
}

const KB1 = 'docs/knowledge/kb-perception-cognition.json';
const KB2 = 'docs/knowledge/kb-aesthetics-satisfaction.json';
const REVIEWED = '2026-11-14';
/** A research helper wrote the record from search results and abstracts; nobody has reviewed it. */
const fromRecord = (text: string, record: string): SourceRef => ({ text, basis: 'snippet', record });

export const OVERLAYS: readonly Overlay[] = [
  {
    id: 'tooltip',
    name: 'Tooltip',
    what: 'A short explanation that appears beside a word or a small picture when a visitor points at it, taps it, or reaches it with the keyboard.',
    chooseWhen: 'A page uses a term or a small picture that some visitors will not know, and the explanation is too long to print beside it.',
    risk: 'A tooltip hides what it explains until someone asks. Anything a visitor needs in order to act belongs on the page itself. A tooltip that opens only when a mouse points at it does not work on a phone or with a keyboard.',
    sources: [
      fromRecord('The record “Put related information together (split attention)”: an explanation works best next to the thing it explains.', KB1),
      fromRecord('The record “Reflow, zoom, and no hover-only or gesture-only functions”: the published accessibility guideline asks that content shown on pointing can also be reached without a mouse, and can be dismissed.', KB1),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
  },
  {
    id: 'confirm',
    name: '“Are you sure?” question',
    what: 'A small window that asks once more before something is deleted, sent, or paid, with one button to go on and one to go back.',
    chooseWhen: 'An action cannot be taken back: deleting a record, sending a message, placing an order.',
    risk: 'A question before every action teaches visitors to press “Yes” without reading. Where an action can be taken back, offer “Undo” afterwards and do not ask.',
    sources: [
      fromRecord('The record “Make actions reversible; forgive mistakes”: undo is the stronger protection; a confirmation is for what cannot be undone.', KB2),
      fromRecord('The record “Errors: identify, explain, and allow recovery”.', KB1),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
  },
  {
    id: 'notice',
    name: 'Notice after an action',
    what: 'A short message that appears at the edge of the window after an action, for example “Your request was sent”, and can be closed.',
    chooseWhen: 'A visitor does something whose result is not visible on the page, such as sending a form.',
    risk: 'A notice that vanishes after a few seconds is missed by slow readers and by people who use a screen reader. It must stay long enough to read, or stay until it is closed.',
    sources: [fromRecord('The record “Always show what the system is doing and what just happened”.', KB2)],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
  },
  {
    id: 'field-error',
    name: 'Error message beside a field',
    what: 'A sentence under a form field that says what is wrong and how to put it right, with the field marked by more than color.',
    chooseWhen: 'A page has a form. This is the one Overlay that almost every form needs.',
    risk: 'A message that appears while the visitor is still typing scolds them for an answer they have not finished. Show it when they leave the field or send the form.',
    sources: [
      fromRecord('The record “Errors: identify, explain, and allow recovery”.', KB1),
      fromRecord('The record “Validate after the user finishes, not while they type”.', KB1),
    ],
    evidence: 'convention',
    reviewed: REVIEWED,
  },
  {
    id: 'loading',
    name: 'Loading placeholder',
    what: 'Gray shapes in the place of text and pictures while they load, so that the page does not jump when they arrive.',
    chooseWhen: 'A part of a page takes more than about a second to appear.',
    risk: 'A placeholder for something that loads at once only adds a flicker. A placeholder that never ends hides a failure: after about ten seconds, say what is wrong.',
    sources: [
      fromRecord('The record “Show progress during waits”.', KB1),
      fromRecord('The record “A wait feels shorter when it is explained, bounded and occupied”: it says not to count on a placeholder to make a wait feel shorter.', KB2),
      fromRecord('The record “Response-time limits: about 0.1, 1 and 10 seconds”: the source of “about a second” and “about ten seconds”.', KB1),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
  },
  {
    id: 'sticky-call',
    name: 'Main button that stays in view on a phone',
    what: 'On a phone, the page’s main button stays at the lower edge of the screen while the visitor scrolls.',
    chooseWhen: 'One action matters more than all others, and most visitors use a phone.',
    risk: 'The bar covers the lowest part of the page. The page needs room at its end so that the last lines can be read above the bar.',
    sources: [
      fromRecord('The record “Touch targets: 24 CSS pixels minimum, about 44 for comfort”.', KB1),
      fromRecord('The record “Fitts’s law and the steering law: size, distance and path width”. That a button which stays in view is reached fastest is this Studio’s own conclusion from it; the record adds that on a phone the reach of the thumb and the covering hand matter as much.', KB1),
    ],
    evidence: 'expert-opinion',
    reviewed: REVIEWED,
  },
];

const OVERLAY_TABLE = new Map<string, Overlay>(OVERLAYS.map((overlay) => [overlay.id, overlay]));
export const findOverlay = (id: string): Overlay | undefined => OVERLAY_TABLE.get(id);
