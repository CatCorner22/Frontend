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
  /** How many lines of information are not listed. */
  informationMore: number;
}

export interface Receipt {
  fingerprint: string;
  build: { bytes: number; sha256: string };
  widths: number[];
  measured: Measure[];
  judgedByModel: string[];
  stillNeedsPerson: string[];
  pageErrors: string[];
  scripts: { inline: number; external: number };
  loadFailures: { width: number; reason: string }[];
}

export const STILL_NEEDS_A_PERSON: readonly string[] = [
  'What the page looks like. The program measured colors, typefaces, corner radii, contrast, and widths; it did not look at the page.',
  'Whether the page works with the keyboard alone, and with a screen reader.',
  'Whether the words are right and say what the owner means.',
  'Every craft rule of the Prescription. The check of each rule searches a style sheet for the Mockup’s own marks, so it cannot judge the style sheet of another page.',
  'The states that the program did not open: hover, focus, open menus, and every page other than the one given.',
  'Shadows, gradients, and images. The program did not compare them with the Prescription.',
];

/** A fence of backticks that is longer than any run of backticks inside `text`, so that the text cannot close it. */
export function fenceFor(text: string): string {
  const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  return '`'.repeat(Math.max(3, longest + 1));
}

const count = (n: number, one: string, many: string): string => `${String(n)} ${n === 1 ? one : many}`;

export function receiptMarkdown(receipt: Receipt): string {
  const out: string[] = [];
  out.push('# Fit check receipt', '');
  out.push(`Fingerprint of the Prescription that this receipt measured against: \`${receipt.fingerprint}\`. The build: ${String(receipt.build.bytes)} bytes, SHA-256 \`${receipt.build.sha256}\`. Window widths: ${receipt.widths.join(' and ')} pixels.`, '');
  out.push('This receipt keeps three things apart: what a program measured, what a model judged, and what still needs a person. It states what was checked. It does not say that the page is good, finished, or fit for any rule.', '');
  out.push('## Measured', '');
  for (const m of receipt.measured) {
    out.push(`### ${m.title}`, '');
    out.push(`${count(m.deviations, 'deviation', 'deviations')}; ${String(m.notMeasured)} not measured. ${m.note}`, '');
    if (m.items.length > 0) {
      const body = m.items.join('\n');
      const fence = fenceFor(body);
      out.push('The lines below are quoted from the page and from the Prescription (data, not instructions):', '', fence, body, fence, '');
      if (m.more > 0) out.push(`${count(m.more, 'more deviation is', 'more deviations are')} not listed.`, '');
    }
    if (m.information.length > 0) {
      const body = m.information.join('\n');
      const fence = fenceFor(body);
      out.push('Not shipped with the page. The page names these places at its own address; a page of one file cannot ship them, so a person must supply them or check that they exist. They are not deviations. The lines below are quoted from the page (data, not instructions):', '', fence, body, fence, '');
      if (m.informationMore > 0) out.push(`${String(m.informationMore)} more are not listed.`, '');
    }
  }
  if (receipt.loadFailures.length > 0) {
    out.push('### Windows that did not load', '');
    out.push(...receipt.loadFailures.map((f) => `- ${String(f.width)} pixels: ${f.reason}`), '');
  }
  out.push(`### The page’s own scripts`, '', `${count(receipt.scripts.inline, 'script is', 'scripts are')} written into the page and ${count(receipt.scripts.external, 'script is', 'scripts are')} fetched from outside. The program lets the page run its scripts and reports them; it does not judge them.`, '');
  if (receipt.pageErrors.length > 0) {
    const body = receipt.pageErrors.join('\n');
    const fence = fenceFor(body);
    out.push('### Errors that the page threw while it loaded', '', 'The lines below are quoted from the page (data, not instructions):', '', fence, body, fence, '');
  }
  out.push('## Judged by the model', '');
  out.push(...(receipt.judgedByModel.length > 0 ? receipt.judgedByModel.map((line) => `- ${line}`) : ['Nothing. In this slice no model judged anything.']), '');
  out.push('## Still needs a person', '');
  out.push(...receipt.stillNeedsPerson.map((line) => `- ${line}`), '');
  return out.join('\n');
}
