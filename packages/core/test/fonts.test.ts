import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DIRECTIONS, FONT_IDS, FONT_PACKAGE_VERSION, FONTS, STEPS, applyDirection, createProject, parseProject, type Project } from '../src/index.js';

/** A project as an earlier version stored it: both typefaces that the Studio no longer carries, in every place a file holds one. */
function withRetiredFonts(): Record<string, unknown> {
  const project = JSON.parse(JSON.stringify(applyDirection(createProject('Saved earlier'), 'paper-and-ink'))) as Project;
  const old = { fontHeading: 'playfair-display', fontBody: 'source-serif-4' };
  return { ...project, params: { ...project.params, ...old }, base: { ...project.base, ...old }, decisions: { typeface: { stepId: 'typeface', optionId: null, kind: 'tuned', rejected: [], values: old, at: '2026-11-13T12:00:00.000Z' } } };
}

describe('typefaces: no bundled typeface reserves its name (SPEC.md section 2.2)', () => {
  it('carries Playfair and Literata, and neither of the two typefaces that reserve their names', () => {
    expect(FONT_IDS).toContain('playfair');
    expect(FONT_IDS).toContain('literata');
    expect(FONT_IDS).not.toContain('playfair-display');
    expect(FONT_IDS).not.toContain('source-serif-4');
    expect(FONTS.playfair.stack).toContain('"Playfair Variable"');
    expect(FONTS.literata.stack).toContain('"Literata Variable"');
    const everyText = JSON.stringify([STEPS, DIRECTIONS, FONTS]);
    expect(everyText).not.toMatch(/Playfair Display|playfair-display|Source Serif|source-serif/);
  });

  it('ships no font whose own copyright notice declares a Reserved Font Name', () => {
    // The notices file is written from the copyright notice inside each shipped font file (scripts/make-notices.mjs); CI
    // fails when it is out of date. Each font's entry lists the names that its notice reserves.
    const notices = readFileSync(new URL('../../../apps/studio/src/notices.generated.ts', import.meta.url), 'utf8');
    const reserved = [...notices.matchAll(/reservedFontNames: \[(.*)\]/g)].map((match) => match[1]);
    expect(reserved.length).toBeGreaterThanOrEqual(13);
    expect(reserved.filter((names) => names !== '')).toEqual([]);
    // The licence's own text defines the words "Reserved Font Name"; no copyright notice may use them.
    const copyrights = [...notices.matchAll(/copyright: \[([^\]]*)\]/g)].map((match) => match[1]!);
    expect(copyrights.length).toBeGreaterThanOrEqual(13);
    expect(copyrights.filter((text) => /Reserved\s+Font\s+Name/i.test(text))).toEqual([]);
    expect(notices).toContain('@fontsource-variable/playfair)');
    expect(notices).toContain('@fontsource-variable/literata)');
  });

  it('opens a project that names a replaced typeface with the replacement, and says so once', () => {
    const opened = parseProject(withRetiredFonts());
    if (!opened.ok) throw new Error(opened.error);
    expect(opened.project.params).toMatchObject({ fontHeading: 'playfair', fontBody: 'literata' });
    expect(opened.project.base).toMatchObject({ fontHeading: 'playfair', fontBody: 'literata' });
    expect(opened.project.decisions['typeface']?.values).toEqual({ fontHeading: 'playfair', fontBody: 'literata' });
    expect(opened.notes).toEqual(['This project used the typefaces “Playfair Display” and “Source Serif 4”, which the Studio no longer carries. It now shows “Playfair” and “Literata” in their place; nothing else changed.']);
    // The project as opened holds only what the Studio carries: a second opening changes nothing and says nothing.
    const again = parseProject(JSON.parse(JSON.stringify(opened.project)));
    expect(again.ok && again.notes).toEqual([]);
    expect(again.ok && again.project).toEqual(opened.project);
  });

  it('names one typeface when the project used only one of the two', () => {
    const file = withRetiredFonts();
    const only = { ...file, params: { ...(file['params'] as object), fontBody: 'dm-sans' }, base: { ...(file['base'] as object), fontBody: 'dm-sans' }, decisions: {} };
    const opened = parseProject(only);
    expect(opened.ok && opened.notes).toEqual(['This project used the typeface “Playfair Display”, which the Studio no longer carries. It now shows “Playfair” in its place; nothing else changed.']);
  });

  it('still refuses a typeface that the Studio never carried', () => {
    const file = withRetiredFonts();
    expect(parseProject({ ...file, params: { ...(file['params'] as object), fontHeading: 'comic-sans' } }).ok).toBe(false);
  });
});

describe('The version of the font packages that FONTS.md names', () => {
  it('is the version that the Studio itself ships, for every font package in the lock file', () => {
    const lock = JSON.parse(readFileSync(new URL('../../../package-lock.json', import.meta.url), 'utf8')) as { packages: Record<string, { version?: string }> };
    const fonts = Object.entries(lock.packages).filter(([name]) => name.includes('node_modules/@fontsource-variable/'));
    expect(fonts.length).toBeGreaterThan(10);
    for (const [name, entry] of fonts) expect(entry.version, name).toBe(FONT_PACKAGE_VERSION);
  });
});
