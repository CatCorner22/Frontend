/**
 * A name from a file or from the owner, made fit to stand inside quotation marks in one of the Studio's own sentences.
 * A name may hold a closing quotation mark and a sentence of its own; a dialog then read as if the Studio had said that
 * sentence ("…holds the project “X”. It is the same as the open project, so nothing will change."; campaign 4, round 3).
 * Every quotation mark in the name, and every sign that looks like one, becomes a single mark, and a run of such marks
 * becomes one mark, so that the name cannot end the quotation (two single marks side by side draw like a double one: campaign
 * 4, retest of finding F-19). Line breaks go. So do the invisible signs that change the direction of writing or hide between
 * letters: one of them turned the Studio's own sentence into mirror writing (review of 2026-11-14, finding S5-02).
 */
const INVISIBLE_SIGNS = /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff9-\ufffb]/g;
const QUOTATION_SIGNS = /["'`´“”„‟‘’‚‛«»‹›＂＇″‴‶′‵ʺʹˮ˝❛❜❝❞〝〞〟]+/g;
export function plainName(name: string, limit = 60): string {
  return name.replace(INVISIBLE_SIGNS, ' ').replace(QUOTATION_SIGNS, '’').replace(/\s+/g, ' ').trim().slice(0, limit);
}
