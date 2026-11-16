/**
 * A name from a file or from the owner, made fit to stand inside quotation marks in one of the Studio's own sentences.
 * A name may hold a closing quotation mark and a sentence of its own; a dialog then read as if the Studio had said that
 * sentence ("…holds the project “X”. It is the same as the open project, so nothing will change."; campaign 4, round 3).
 * Every quotation mark in the name, and every sign that looks like one, becomes a single mark, and a run of such marks
 * becomes one mark, so that the name cannot end the quotation (two single marks side by side draw like a double one: campaign
 * 4, retest of finding F-19). Line breaks go. So do the invisible signs that change the direction of writing or hide between
 * letters: one of them turned the Studio's own sentence into mirror writing (review of 2026-11-14, finding S5-02).
 *
 * After the review of 2026-11-15 (findings S6-04 and S6-05): the invisible signs also cover variation selectors, fillers,
 * the blank braille sign, and the "tag" signs, in which a whole hidden sentence can travel; letters are brought to one form
 * (an "e" with a separate accent becomes "é"); and the cut never leaves half a character at the end.
 *
 * What this does not catch: a letter of another alphabet that looks like a Latin letter. No list of such letters is
 * complete, so a name can still look like another name; the Studio compares names, it does not judge their looks.
 */
// After red-team campaign A2 (finding J-12): the signs are matched by Unicode property, not by a list. A list missed 50 signs
// (among them U+1D173, U+13430, U+1BCA0); every control sign (Cc), every format sign (Cf), and every sign that Unicode says draws
// nothing (Default_Ignorable_Code_Point) now goes, and so do the line and paragraph separators and the blank braille sign.
const INVISIBLE_SIGNS = /[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}\u2028\u2029\u2800]/gu;
/** Half of a two-part character with its other half missing. */
const HALF_CHARACTERS = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g;
const QUOTATION_SIGNS = /["'`´“”„‟‘’‚‛«»‹›＂＇″‴‶′‵ʺʹˮ˝❛❜❝❞〝〞〟ʻ-ʽˊˋ˵˶׳״〃Ꞌꞌ]+/g;

export function plainName(name: string, limit = 60): string {
  // Cut first, with a wide margin, then clean: bringing letters to one form (NFC) takes time that grows with the square of a long
  // run of accents, and a file could hold a name of a million signs (campaign A2, finding J-16). Clean text is never longer than
  // what goes in, so a name of `limit` visible characters always fits in the margin unless it holds hundreds of invisible signs.
  const clean = [...name].slice(0, Math.max(limit, 60) * 16).join('').normalize('NFC').replace(HALF_CHARACTERS, ' ').replace(INVISIBLE_SIGNS, ' ').replace(QUOTATION_SIGNS, '’').replace(/\s+/g, ' ').trim();
  // The limit counts whole characters, so the cut never leaves half a character. A cut may still end on a space: the
  // Studio's sentences show a cut name as it is, and a caller that stores a name trims it (see `makeOwnDirection`).
  return [...clean].slice(0, limit).join('');
}

/** Two names are one name when they differ only in upper and lower case or in the form of their letters (full-width, composed). */
export function sameName(a: string, b: string): boolean {
  const fold = (name: string): string => name.normalize('NFKC').toLocaleLowerCase();
  return fold(a) === fold(b);
}

/**
 * The owner's own words for a file that an AI coding tool reads: the same text without invisible signs and without signs
 * that change the direction of writing, so that a person who reviews the file sees what the tool reads (finding S6-07).
 * Line breaks stay; every kind of line break becomes one kind.
 */
export function visibleText(text: string): string {
  return text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(HALF_CHARACTERS, ' ').replace(INVISIBLE_SIGNS, ' ').trimEnd()).join('\n');
}
