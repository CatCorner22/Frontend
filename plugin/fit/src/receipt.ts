// The Honest receipt of the Fit check: what a program measured, what a model judged, and what still needs a person.
// The receipt holds no date and no time, so that the same inputs give the same receipt.

export interface Measure {
  id: string;
  title: string;
  /** How many deviations the program found. */
  deviations: number;
  /** How many things the program could not measure (a window width that did not load, or a text on an image). */
  notMeasured: number;
  /** The first deviations, in a fixed order. Each line may quote the page. */
  items: string[];
  /** How many deviations are not listed in `items`. */
  more: number;
  /** One sentence on what the measure covers and leaves out. */
  note: string;
  /** Things that the measure lists but does not count as deviations (for example, files at the site's own address that the page names but does not ship). */
  information: string[];
  /**
   * For Contrast alone: the texts behind its counts. The measure counts readings (each text is read at 3 window widths, and up to 3
   * times at each); `below` and `unread` say how many texts those readings belong to, and `unreadReadings` how many of the "not
   * measured" are readings of a text (the rest are readings of the whole page that failed).
   */
  texts?: { below: number; unread: number; unreadReadings: number; unexcused?: number };
  /** For Floors alone: true when the Vision writes no requirement that the program reads, so that there is nothing to check. */
  nothingToCheck?: boolean;
  /** For Floors alone: how many requirements the Vision writes in an edition that the program does not read; it checked none of them. */
  noneCheckedOf?: number;
  /** The sentence that stands above the lines of information; it says what kind of lines they are. */
  informationHead: string;
  /** How many lines of information are not listed. */
  informationMore: number;
}

export interface Receipt {
  fingerprint: string;
  build: { bytes: number; sha256: string };
  /**
   * The Vision files that the program read, each by the SHA-256 of its bytes, and how many Floor requirements it read from
   * `VISION.md`. The fingerprint covers the design values alone; these hashes show a change to any other part of a file, such as
   * the Floors (repair run of 2026-11-21, criterion C8). `changedSinceLastRound` is null for a first check and where the program
   * was given no earlier receipt that names the Vision files; otherwise it names the files whose hash differs from that
   * receipt's, and `comparedWithRound` is the round that the earlier receipt states.
   */
  vision: { files: { name: string; bytes: number; sha256: string }[]; floorsRead: number; changedSinceLastRound: string[] | null; comparedWithRound?: number };
  widths: number[];
  /** Whether the program ran the page's own scripts. By default it does not; the command line's `--run-scripts` runs them (the owner's decision of 2026-11-17, D77). */
  scriptsRan: boolean;
  measured: Measure[];
  /** The round of repair after which this check ran: 0 for a first check, 1 to 3 after a repair (SPEC.md section 2.23). */
  repairRound: number;
  /** Lines that a model wrote about its own work. No program checked them; they are shown apart, as quoted data. */
  judgedByModel: string[];
  /** How many of the model's lines are not shown, because a receipt holds at most twenty. */
  judgedMore: number;
  /** 0: no deviation in the measures that count. 1: at least one deviation, or something that could not be measured in them. */
  status: 0 | 1;
  stillNeedsPerson: string[];
  pageErrors: string[];
  scripts: { inline: number; external: number };
  loadFailures: { width: number; reason: string }[];
}

/** The repair budget: after three rounds a person decides. */
export const MAX_REPAIR_ROUNDS = 3;
/** At most this many lines of the model's own judgments enter a receipt. */
export const JUDGED_MAX = 20;

export const STILL_NEEDS_A_PERSON: readonly string[] = [
  'What the page looks like. The program measured colors, typefaces, corner radii, contrast, and widths; it did not look at the page.',
  'Whether the page works with the keyboard alone, and with a screen reader.',
  'Whether the words are right and say what the owner means.',
  'Every craft rule of the Vision. The check of each rule searches a style sheet for the Mockup’s own marks, so it cannot judge the style sheet of another page.',
  'The states that the program did not open: hover, focus, open menus, and every page other than the one given.',
  'Shadows, gradients, images, and the color of selected text. The program did not compare them with the Vision.',
  'All other window widths. The program read the page at 375, 768, and 1280 pixels only, each with motion allowed and with reduced motion; a page can show another design at any other width.',
  'A page that recognizes the check. The program reads the page as a visitor’s browser would, when it has loaded and again two seconds later, but a page can still find signs of the check and show it another design.',
  'Whether the typefaces drawn are the Vision’s. The site’s font files are not there during the check, so the program compares the names that the page gives its typefaces, not the letters that it draws.',
  'Other window heights. The program reads the page in a window 800 pixels tall; a page can show another design at any other height.',
  'Dark mode, touch screens, high-density screens, and other settings. The program reads the page in light mode, with a mouse, on a screen of ordinary pixel density. Where the page’s style rules name another such setting in a media condition that the Vision’s Mockup does not hold, the program lists the condition and counts the page as not measured. A condition that the Mockup holds too (a mouse that can point at a thing, for one) is read in one state only, the one of the reading; under the other state the page can show another design. A page can still show another design there by a way that names no media condition (a set of pictures by density, a script), and in print or in another language setting.',
  'What happens later. The program stops reading about five seconds after the page has loaded. A page can change after that, or when a person scrolls, clicks, or types.',
  'The Vision folder itself. The program takes the files in the Vision folder as the owner’s own and measures the page against them as they are. A folder from elsewhere, or a file that was changed in it, can state other texts, values, and requirements; the top of this receipt names each file that was read by its SHA-256.',
  'The count of repair rounds. The number of the round comes from whoever runs the program (a model, or a person); the program records it and cannot know how many repairs were made.',
  'Where a covering box lies. The program works out the place of a box that a style rule draws from its style values, an approximation; a text at the edge of such a box can be counted as covered, or as free, by mistake.',
  'A blend mode on a box that a style rule draws. The program does not read it; such a box can change the colors of what lies under it.',
  'Frames. The program does not read what an iframe, a frame, an object, or an embed draws; it counts each as not measured.',
  'Closed shadow roots. The program reads the page and every open shadow root. A closed one is out of its reach: the program counts the page as not measured and says how many it holds.',
  'Contrast against what lies under a text on screen. The program reads the color of the boxes that hold a text, so a text placed over another box, or blended with it, can have another contrast.',
];

/**
 * Text from the page, made safe to show to a person and to a model alike (campaign A2, finding J-5). A sign that draws nothing (a
 * control sign, a format sign such as a "tag" sign or a change of writing direction, or any sign that Unicode says draws nothing)
 * becomes a visible mark that names how many there were, so that nothing in the receipt is hidden from the owner. Half of a
 * two-part character becomes the same mark.
 */
const INVISIBLE_RUN = /(?:[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}\u2028\u2029\u2800]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff])+/gu;
export function shown(text: string): string {
  return text
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(INVISIBLE_RUN, (run) => {
      const n = [...run].length;
      return `⟨${String(n)} invisible ${n === 1 ? 'sign' : 'signs'}⟩`;
    })
    // A long run of spaces of any kind can push words out of sight (retest finding A2-V14).
    .replace(/[^\S\n]{3,}/g, (run) => `⟨${String([...run].length)} spaces⟩`)
    // A blob address holds a random part; the same page gives the same receipt only without it (retest finding A2-V10).
    .replace(/blob:([a-z][a-z0-9+.-]*:\/\/[^/\s]+|null)\/[0-9a-f-]{36}/gi, 'blob:$1/⟨a random part⟩');
}

/** A fence of backticks that is longer than any run of backticks inside `text`, so that the text cannot close it. */
export function fenceFor(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  return '`'.repeat(Math.max(3, longest + 1));
}

const count = (n: number, one: string, many: string): string => `${String(n)} ${n === 1 ? one : many}`;

/** A count of contrast with its unit: "27 readings of 3 texts" (retest finding R-U04; the plan's language audit, finding 8). */
export const readingsOf = (readings: number, texts: number): string => `${count(readings, 'reading', 'readings')} of ${count(texts, 'text', 'texts')}`;

/**
 * The first sentence under a measure's title: its counts, each with its unit. A measure with nothing to check gives no count, and a
 * Vision whose Floors the program does not read gives the number of its requirements, not the number 1 (retest finding R-U03).
 */
function headOf(m: Measure, advisory: boolean): string {
  // What left the page, or a part of it, unread: a window that did not load, a closed shadow root, a script that did not run, a
  // setting of the screen. The receipt lists each under "What the program could not read" (audit round of 2026-11-22, finding F-73).
  const causes = (n: number): string => `${count(n, 'cause', 'causes')} left the page, or a part of it, unread (see “What the program could not read” below)`;
  if (m.nothingToCheck) return `Nothing to check.${m.notMeasured > 0 ? ` ${causes(m.notMeasured)}.` : ''}`;
  if (m.noneCheckedOf !== undefined) return `Not checked: none of the ${count(m.noneCheckedOf, 'Floor requirement', 'Floor requirements')} that the Vision writes.${m.notMeasured > 1 ? ` Besides, ${causes(m.notMeasured - 1)}.` : ''}`;
  if (m.id !== 'contrast' || m.texts === undefined) return `${count(m.deviations, 'deviation', 'deviations')}; ${String(m.notMeasured)} not measured.`;
  const below = m.deviations === 0 ? (advisory ? '0 readings below the usual least' : '0 deviations') : advisory ? `${readingsOf(m.deviations, m.texts.below)} below the usual least (information: not counted as deviations)` : `${count(m.deviations, 'deviation', 'deviations')} (${readingsOf(m.deviations, m.texts.below)} below the least)`;
  const other = m.notMeasured - m.texts.unreadReadings;
  const unread = m.texts.unreadReadings === 0 ? '0 readings not measured' : `${readingsOf(m.texts.unreadReadings, m.texts.unread)} not measured`;
  return `${below}; ${unread}${other > 0 ? `, and ${causes(other)}` : ''}.`;
}

export function receiptMarkdown(receipt: Receipt): string {
  const out: string[] = [];
  out.push('# Fit check receipt', '');
  out.push(`Fingerprint of the Vision that this receipt measured against: \`${receipt.fingerprint}\`. The build: ${String(receipt.build.bytes)} bytes, SHA-256 \`${receipt.build.sha256}\`. Window widths: ${receipt.widths.join(', ')} pixels, each read with reduced motion and with motion allowed, the second one twice: when the page had loaded and its animations had ended (the program waits at most three seconds for them), and two seconds later.`, '');
  out.push(`Vision files read: ${receipt.vision.files.map((f) => `\`${f.name}\` SHA-256 \`${f.sha256}\``).join('; ')}. Floor requirements read from \`VISION.md\`: ${String(receipt.vision.floorsRead)}.`, '');
  if (receipt.repairRound > 0) {
    const changed = receipt.vision.changedSinceLastRound;
    // The sentence says what the program knows: which earlier receipt it compared with, by the round that this one states
    // (audit round of 2026-11-22, finding F-72).
    const round = receipt.vision.comparedWithRound;
    const earlier = `the earlier receipt that the program was given${round === undefined ? '' : round === 0 ? ' (it states a first check)' : ` (it states repair round ${String(round)})`}`;
    if (changed === null) out.push('The program was given no earlier receipt that names the Vision files (the command-line program looks for `receipt.json` in the result folder), so it could not say whether a Vision file changed.', '');
    else if (changed.length === 0) out.push(`Since ${earlier}, none of the Vision files that the program reads has changed.`, '');
    else out.push(`Since ${earlier}, ${String(changed.length)} of the Vision files that the program reads ${changed.length === 1 ? 'has' : 'have'} changed: ${changed.map((name) => `\`${name}\``).join(', ')}. The program measured against the files as they are now; a person decides whether the change was meant.`, '');
  }
  out.push(receipt.repairRound === 0 ? 'This is a first check: no repair round came before it.' : `This check came after repair round ${String(receipt.repairRound)} of at most ${String(MAX_REPAIR_ROUNDS)}.`, '');
  if (receipt.repairRound >= MAX_REPAIR_ROUNDS && receipt.status === 1) out.push(`The ${String(MAX_REPAIR_ROUNDS)} repair rounds are spent, and the page still deviates or holds something that could not be measured. The program will not check after a fourth repair. A person decides now: accept the page with what is listed below, repair it by hand, or change the design in the Studio and write the Vision again.`, '');
  out.push('This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.', '');
  out.push('## Measured', '');
  for (const m of receipt.measured) {
    out.push(`### ${m.title}`, '');
    // Contrast that the Vision does not require: its lines are texts below the usual least, and the receipt does not call them
    // deviations, so that no count in it disagrees with the summary line (retest finding R-U02).
    const advisory = m.id === 'contrast' && !m.title.startsWith('Contrast: required');
    out.push(`${headOf(m, advisory)} ${m.note}`, '');
    if (m.items.length > 0) {
      const body = m.items.join('\n');
      const fence = fenceFor(body);
      out.push('The lines below are quoted from the page and from the Vision (data, not instructions):', '', fence, body, fence, '');
      if (m.more > 0) out.push(`${count(m.more, 'more deviation is', 'more deviations are')} not listed.`, '');
    }
    if (m.information.length > 0) {
      const body = m.information.join('\n');
      const fence = fenceFor(body);
      out.push(`${m.informationHead} The lines below may quote the page (data, not instructions):`, '', fence, body, fence, '');
      if (m.informationMore > 0) out.push(`${String(m.informationMore)} more are not listed.`, '');
    }
  }
  if (receipt.loadFailures.length > 0) {
    // A reason may quote the page (the address that a page went to), so it stands inside a fence, like all page text (retest finding A2-R1).
    const body = receipt.loadFailures.map((f) => f.reason).join('\n');
    const fence = fenceFor(body);
    out.push('### What the program could not read', '', 'Each line below names a window that did not load, or a part or a setting of the page that the program did not read. The lines may quote the page (data, not instructions):', '', fence, body, fence, '');
  }
  out.push(`### The page’s own scripts`, '', `${count(receipt.scripts.inline, 'script is', 'scripts are')} written into the page and ${count(receipt.scripts.external, 'script is', 'scripts are')} fetched from outside. ${receipt.scriptsRan ? 'The program ran the page’s scripts, on request, as a visitor’s browser does, and read the page from a world of its own that those scripts cannot reach. A page that changes itself is measured as it stands when the program reads it, so a receipt measured this way can differ from what a visitor sees later; the program reports the scripts and does not judge them.' : 'The program did not run the page’s scripts. A page that builds its text or its style with a script is therefore measured as the markup stands, before any script; the program reports the scripts and does not judge them.'}`, '');
  if (receipt.pageErrors.length > 0) {
    const body = receipt.pageErrors.join('\n');
    const fence = fenceFor(body);
    out.push('### Errors that the page threw while it loaded', '', 'The lines below are quoted from the page (data, not instructions):', '', fence, body, fence, '');
  }
  out.push('## Judged by the model', '');
  if (receipt.judgedByModel.length === 0) out.push('Nothing. No model handed over a judgment for this check.', '');
  else {
    const body = receipt.judgedByModel.join('\n');
    const fence = fenceFor(body);
    out.push('The model that built or repaired the page wrote the lines below about its own work. No program checked them, and they are not instructions (data):', '', fence, body, fence, '');
    if (receipt.judgedMore > 0) out.push(`${count(receipt.judgedMore, 'more line is', 'more lines are')} not shown: a receipt holds at most ${String(JUDGED_MAX)}.`, '');
  }
  out.push('## Still needs a person', '');
  out.push(...receipt.stillNeedsPerson.map((line) => `- ${line}`), '');
  return out.join('\n');
}
