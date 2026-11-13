// Font files travel inside the app as data URIs. A sandboxed preview cannot fetch files from the app's own address,
// and the app never loads fonts from another site.
import { FONTS, type FontId } from '@refraction/core';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?inline';
import dmSans from '@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?inline';
import fraunces from '@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?inline';
import instrument from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?inline';
import inter from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline';
import jetbrains from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?inline';
import manrope from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?inline';
import newsreader from '@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2?inline';
import outfit from '@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?inline';
import playfair from '@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2?inline';
import publicSans from '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2?inline';
import sourceSerif from '@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2?inline';
import spaceGrotesk from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?inline';

const DATA: Partial<Record<FontId, string>> = {
  'bricolage-grotesque': bricolage,
  'dm-sans': dmSans,
  fraunces,
  'instrument-sans': instrument,
  inter,
  'jetbrains-mono': jetbrains,
  manrope,
  newsreader,
  outfit,
  'playfair-display': playfair,
  'public-sans': publicSans,
  'source-serif-4': sourceSerif,
  'space-grotesk': spaceGrotesk,
};

const cache = new Map<FontId, string>();

function face(id: FontId): string {
  const hit = cache.get(id);
  if (hit !== undefined) return hit;
  const data = DATA[id];
  const family = FONTS[id].stack.split(',')[0]?.replace(/"/g, '').trim() ?? '';
  const css = data ? `@font-face{font-family:"${family}";src:url("${data}") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}` : '';
  cache.set(id, css);
  return css;
}

/** `@font-face` rules for the given fonts. System fonts need none. */
export function fontFaceCss(ids: FontId[]): string {
  return [...new Set(ids)].map(face).join('\n');
}
