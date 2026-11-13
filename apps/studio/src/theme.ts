// The Studio's own look. It derives from the same engine as every Mockup: the tool obeys what it teaches.
import { DEFAULT_PARAMS, FONTS, deriveTokens, type DesignParams, type FontId } from '@refraction/core';
import { fontFaceCss } from './fonts';

/** The default Studio look: quiet graphite, crisp ring edges, one calm accent. */
export const STUDIO_PARAMS: DesignParams = {
  ...DEFAULT_PARAMS,
  fontHeading: 'instrument-sans',
  fontBody: 'instrument-sans',
  headingWeight: 650,
  headingTracking: -0.02,
  neutralHue: 255,
  neutralChroma: 0.006,
  accentHue: 258,
  accentChroma: 0.16,
  accentLightness: 0.5,
  colorStrategy: 'single-accent',
  contrast: 0.86,
  radius: 9,
  elevation: 'ring',
  borderWeight: 1,
  buttonFinish: 'gloss',
  motion: 'subtle',
};

// Only colors, fonts, shape, depth, and motion pass to the Studio. Sizes and spacing stay fixed so that the tool stays usable.
const PASS = /^--(bg|surface|surface-2|border|border-strong|text|text-muted|accent|on-accent|accent-text|accent-soft|accent-2|on-accent-2|action|on-action|focus|selection|card-|control-shadow|btn-|radius-|border-w|control-border-w|font-|heading-weight|heading-tracking|dur|ease|press-scale|inset-highlight|recess)/;

function block(params: DesignParams): string {
  const tokens = deriveTokens(params, 'enforce').css;
  return Object.entries(tokens)
    .filter(([key]) => PASS.test(key))
    .map(([key, value]) => `${key}:${value};`)
    .join('');
}

/** CSS for the Studio's tokens. With no fixed theme it follows the viewer's light or dark setting. */
export function studioTokenCss(params: DesignParams, followViewerTheme: boolean): string {
  const fonts: FontId[] = [params.fontHeading, params.fontBody, 'jetbrains-mono'];
  if (!followViewerTheme) {
    return `${fontFaceCss(fonts)}\n:root{${block(params)}color-scheme:${params.theme};}`;
  }
  const light = block({ ...params, theme: 'light' });
  const dark = block({ ...params, theme: 'dark' });
  return [
    fontFaceCss(fonts),
    `:root{${light}}`,
    `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}color-scheme:dark;}}`,
    `:root[data-theme="dark"]{${dark}color-scheme:dark;}`,
  ].join('\n');
}

/** Write the Studio's tokens into the page. Text is set as text. */
export function applyStudioTheme(params: DesignParams, followViewerTheme: boolean): void {
  let style = document.getElementById('studio-tokens');
  if (!style) {
    style = document.createElement('style');
    style.id = 'studio-tokens';
    document.head.append(style);
  }
  style.textContent = studioTokenCss(params, followViewerTheme);
}

/** Make every Catalog font available to the Studio's own page, for the type specimens on the Option tiles. */
export function installSpecimenFonts(): void {
  if (document.getElementById('specimen-fonts')) return;
  const style = document.createElement('style');
  style.id = 'specimen-fonts';
  style.textContent = fontFaceCss(Object.keys(FONTS) as FontId[]);
  document.head.append(style);
}
