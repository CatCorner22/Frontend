// The plain-words rule (decision D38), as data. The unit tests and the browser tests both read these lists,
// so that the rule has one home.
//
// The rule: a reader with no design vocabulary must understand every sentence the Studio shows.
// A trade word may appear only inside round brackets, as a word to learn: "how vivid the color is (designers call this chroma)".
//
// To use a new trade word in a text: explain it in plain words and put the word itself in round brackets. Do not remove a word
// from this list to make a test pass.

/** Trade words. Each may appear in text the Studio shows only inside round brackets. */
export const TRADE_WORDS: readonly string[] = [
  'accent', 'chroma', 'hue', 'hues', 'elevation', 'radius', 'concentric', 'serif', 'serifs', 'sans', 'sans-serif', 'grotesque', 'tracking',
  'hairline', 'hairlines', 'aurora', 'wash', 'washed', 'monospace', 'mono', 'tabular', 'numerals', 'masthead', 'bento', 'CTA', 'lede', 'hero',
  'AI-default', 'listed sign', 'listed signs', 'design system', 'design systems', '60-30-10', 'signature', 'density', 'hierarchy', 'neutrals',
  'viewport', 'wireframe', 'token', 'tokens', 'typeface', 'typefaces', 'editorial', 'body text', 'focus ring',
];

/**
 * Phrases that point at something the reader cannot see, or that give one thing a second name. They may not appear at all,
 * in any text the Studio shows, the source lines included.
 */
export const VAGUE_PHRASES: readonly string[] = ['research helper', 'reference files', 'your own checklist', 'the builder', 'builder’s', 'the tool'];

const escapeForPattern = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The trade words that `text` holds outside round brackets. Proper names (the names of fonts and of Directions, for example
 * "Public Sans" or "Cobalt Wash") are set aside first, because a name is not a description.
 */
export function tradeWordsOutsideBrackets(text: string, properNames: readonly string[] = []): string[] {
  let bare = text;
  // Longer names first, so that "Source Serif 4" goes before a shorter name inside it could be taken.
  for (const name of [...properNames].sort((a, b) => b.length - a.length)) if (name) bare = bare.split(name).join(' ');
  bare = bare.replace(/\([^()]*\)/g, ' ');
  return TRADE_WORDS.filter((word) => new RegExp(`(?<![A-Za-z-])${escapeForPattern(word)}(?![A-Za-z-])`, 'i').test(bare));
}

/** The vague phrases that `text` holds. */
export function vaguePhrasesIn(text: string): string[] {
  const lower = text.toLowerCase();
  return VAGUE_PHRASES.filter((phrase) => lower.includes(phrase.toLowerCase()));
}
