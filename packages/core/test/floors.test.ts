// The Floors (SPEC.md section 2.18; decisions D13 and D69): every record is complete and honest, and the Vision writes them as the
// requirement says, in each of the three contrast settings.
import { describe, expect, it } from 'vitest';
import { FLOORS, FLOOR_RULES, applyDirection, createProject, floorRules, visionMd, setOverlay, writeVision, type FloorId, type Project } from '../src/index.js';

const HOSTS = new Set(['www.w3.org', 'developer.mozilla.org', 'web.dev', 'developers.google.com', 'cheatsheetseries.owasp.org']);
const withSetting = (a11y: 'off' | 'advise' | 'enforce'): Project => ({ ...applyDirection(createProject('Floors'), 'paper-and-ink'), a11y });
const section7 = (md: string): string => md.slice(md.indexOf('## 7. Floors'), md.indexOf('## 8. '));

describe('the Floor records', () => {
  it('has five Floors, in order, with plain text, and 56 requirements', () => {
    expect(FLOORS.map((f) => f.id)).toEqual(['people', 'page', 'host', 'search', 'speed']);
    for (const floor of FLOORS) { expect(floor.name.length).toBeGreaterThanOrEqual(5); expect(floor.what.length).toBeGreaterThan(30); }
    expect(FLOOR_RULES).toHaveLength(56);
    expect(Object.fromEntries(FLOORS.map((f) => [f.id, floorRules(f.id).length]))).toEqual({ people: 20, page: 11, host: 5, search: 10, speed: 10 });
  });

  it('gives every requirement an id, a text, what a person must still check, a source on an approved host with a short quotation, a grade, and a review date', () => {
    const ids = new Set<string>();
    for (const rule of FLOOR_RULES) {
      expect(ids.has(rule.id), rule.id).toBe(false);
      ids.add(rule.id);
      expect(rule.id).toMatch(/^[ASHQP]\d+$/);
      expect(rule.text.trim().length, rule.id).toBeGreaterThan(30);
      expect(rule.person.trim().length, rule.id).toBeGreaterThan(20);
      const url = new URL(rule.source.url);
      expect(url.protocol, rule.id).toBe('https:');
      expect(HOSTS.has(url.hostname), `${rule.id}: ${url.hostname}`).toBe(true);
      expect(rule.source.text.split(/\s+/).length, rule.id).toBeLessThanOrEqual(25);
      expect(['convention', 'expert-opinion'], rule.id).toContain(rule.evidence);
      expect(rule.reviewed, rule.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // Each Floor's ids start with its own letter.
    const letter: Record<FloorId, string> = { people: 'A', page: 'S', host: 'H', search: 'Q', speed: 'P' };
    for (const rule of FLOOR_RULES) expect(rule.id.startsWith(letter[rule.floor]), rule.id).toBe(true);
  });

  it('claims for no page that it is accessible, compliant, secure, fast, or ranked (hard rule 8)', () => {
    const all = FLOOR_RULES.map((r) => `${r.text} ${r.person}`).join('\n');
    expect(all).not.toMatch(/\baccessible\b|\bcompliant\b|WCAG[- ]compliant|ADA[- ]compliant|\bwill rank\b|\bis secure\b|\bis fast\b/i);
    expect(JSON.stringify(FLOORS)).not.toMatch(/\baccessible\b|\bcompliant\b/i);
  });
});

describe('the Floor records: truth of each record (the seventh review, findings F7-04 to F7-16)', () => {
  const STANDARD = new Set(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17', 'A18', 'A19', 'A20']);

  it('marks a requirement as stated by a published standard only where one states it (a guide or a recommendation is not a standard)', () => {
    expect(FLOOR_RULES.filter((r) => r.standard).map((r) => r.id).sort()).toEqual([...STANDARD].sort());
    // A reference page about a standard is not the standard (M6 gate review, finding T8-10): S7 and S10 cite MDN.
    for (const rule of FLOOR_RULES.filter((r) => r.standard)) expect(rule.source.url, rule.id).toMatch(/^https:\/\/www\.w3\.org\/TR\//);
  });

  it('gives each requirement of the people Floor the success criterion where the standard states it, and no other requirement a place', () => {
    for (const rule of FLOOR_RULES) {
      if (rule.floor === 'people') expect(rule.where, rule.id).toMatch(/^\d\.\d\.\d+ .+, A{1,3}( \(.+\))?$/);
      else expect(rule.where, rule.id).toBeUndefined();
    }
  });

  it('keeps notes of the research out of the requirement texts: no word "helper", no quotation that ends in an equals sign, no text that cuts off a source quotation', () => {
    for (const rule of FLOOR_RULES) {
      expect(`${rule.text} ${rule.person}`, rule.id).not.toMatch(/\bhelper\b/i);
      expect(rule.source.text.trimEnd().endsWith('='), rule.id).toBe(false);
      expect(rule.source.text.length, rule.id).toBeGreaterThan(25);
    }
  });

  it('records for each requirement how a program could check it, and prints none of it in the Vision (the Fit check holds its own list of what it checks)', () => {
    for (const rule of FLOOR_RULES) expect(rule.program.trim().length, rule.id).toBeGreaterThan(10);
    const part = section7(visionMd(withSetting('enforce')));
    for (const rule of FLOOR_RULES) expect(part, rule.id).not.toContain(rule.program);
  });

  it('writes a row-specific note of what a person must still check for each speed requirement, not one sentence for all ten', () => {
    const notes = floorRules('speed').map((r) => r.person);
    expect(new Set(notes).size).toBeGreaterThanOrEqual(9);
  });

  it('says in S5 that the page’s own policy decides, not the one of mockup.html, and places the policy after the character set and before every element that loads something', () => {
    const s5 = FLOOR_RULES.find((r) => r.id === 'S5')?.text ?? '';
    expect(s5).toContain('mockup.html');
    expect(s5).toContain('this requirement decides');
    expect(s5).toContain('after `<meta charset="utf-8">`');
    expect(s5).toContain('before every element that loads a resource');
  });

  it('says in S6 what the form does when the owner named no endpoint', () => {
    const s6 = FLOOR_RULES.find((r) => r.id === 'S6')?.text ?? '';
    expect(s6).toContain("form-action 'self'");
    expect(s6).toContain('named no form endpoint');
  });

  it('keeps the five requirements of the host out of the page: each says where to set it, and the Floor tells the builder not to send them in the page', () => {
    const part = section7(visionMd(withSetting('enforce')));
    expect(part).toContain('Do not try to send these in the page.');
    expect(part.match(/Where to set it: at the host/g)).toHaveLength(5);
    expect(part).toContain('`mockup.html` is a reference for the design only.');
    expect(part).toContain('the requirement decides');
  });

  it('says in the search Floor that some of its requirements also serve people with disabilities and stand whatever the contrast setting is', () => {
    const what = FLOORS.find((f) => f.id === 'search')?.what ?? '';
    expect(what).toContain('whatever the contrast setting is');
    for (const setting of ['off', 'advise'] as const) expect(visionMd(withSetting(setting))).toContain('whatever the contrast setting is');
    expect(visionMd(withSetting('off'))).toContain('inside its inline pictures');
  });

  it('writes the criterion in the source line of a requirement for people with disabilities', () => {
    const part = section7(visionMd(withSetting('enforce')));
    expect(part).toContain('where the standard states it: 1.4.11 Non-text Contrast, AA');
  });
});

describe('VISION.md: section 7, Floors', () => {
  it('writes every Floor but the one for people with disabilities, and says why that one is not written, with "Warn me" and with "Off"', () => {
    for (const setting of ['advise', 'off'] as const) {
      const part = section7(visionMd(withSetting(setting)));
      expect(part).toContain('### 7.1 Use by people with disabilities');
      expect(part).toContain(`Not written for this project: Contrast checks is ${setting === 'off' ? '“Off”' : '“Warn me”'}`);
      expect(part).not.toContain('- **A1.**');
      for (const rule of FLOOR_RULES.filter((r) => r.floor !== 'people')) expect(part, rule.id).toContain(`- **${rule.id}.** ${rule.text}`);
    }
  });

  it('writes the requirements for people with disabilities too, with "Fix for me"', () => {
    const part = section7(visionMd(withSetting('enforce')));
    expect(part).not.toContain('Not written for this project');
    for (const rule of FLOOR_RULES) expect(part, rule.id).toContain(`- **${rule.id}.** ${rule.text}`);
  });

  it('writes, for each requirement, what a person must still check and its source, and says that a program checks only a part of some of them and that the file carries no date', () => {
    const part = section7(visionMd(withSetting('enforce')));
    for (const rule of FLOOR_RULES) {
      expect(part, rule.id).toContain(`  - A person must still check: ${rule.person}`);
      expect(part, rule.id).toContain(`  - Source: ${rule.source.url} (“${rule.source.text}”;`);
    }
    expect(part).toContain('The Fit check of Frontend Focus checks a part of some of these requirements on a built page, and its receipt says which part. No program checks the rest.');
    expect(part).not.toContain('No program checks any requirement of this section yet.');
    expect(part).toContain('this file carries no date');
    expect(part).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
    expect(part).not.toMatch(/\baccessible\b|\bcompliant\b/i);
  });

  it('leaves the other six files and the fingerprint as they were: the Floors live in VISION.md only', () => {
    const files = writeVision(withSetting('enforce'));
    for (const name of ['DESIGN.md', 'tokens.css', 'tokens.json', 'theme.css', 'mockup.html', 'FONTS.md'] as const) expect(files[name], name).not.toContain('## 7. Floors');
    expect(files['VISION.md']).toContain('## 8. What this file leaves out');
  });
});

describe('section 7 after the M6 gate review (findings U8-04, U8-06 to U8-08, T8-11, T8-12, T8-19)', () => {
  const md = visionMd(withSetting('advise'));
  const seven = section7(md);

  it('says who does what: the AI coding tool builds, and a person (the owner, or someone the owner asks) checks', () => {
    expect(seven).toContain('Who does what.');
    expect(seven).toMatch(/the owner, or someone the owner asks/);
    expect(seven).toMatch(/say in your report, in plain words, which checks the owner will need help with/);
  });

  it('explains the gaps in the numbers of the requirements', () => {
    expect(seven).toMatch(/A gap in the numbers is a requirement of the research records that this file leaves out on purpose/);
  });

  it('names no form endpoint field that the Studio does not have', () => {
    expect(seven).not.toContain('When the owner named one endpoint');
    expect(seven).toContain('the Studio has no field for one');
  });

  it('says where a requirement goes beyond its source (S4, H1), and carries no research commentary (S10, S11)', () => {
    expect(seven).toMatch(/S4\.\*\*[^\n]*\n  - A person must still check:[^\n]*The source names only `innerHTML`/);
    expect(seven).toMatch(/H1\.\*\*[\s\S]*?The source names status 301; accepting 308 as well is this file’s choice\./);
    expect(seven).not.toContain('(This row is about correct form markup');
    expect(seven).not.toContain('The Vision also states, in words');
  });

  it('points to the section that lists what is left out, and states no owner decision that was already taken', () => {
    // The sentence stands only where an Overlay is on.
    const withOverlay = visionMd(setOverlay(withSetting('advise'), 'sticky-call', true));
    expect(withOverlay).not.toContain('is not specified in this first part (section 7)');
    expect(withOverlay).toContain('is not specified in this first part (section 8)');
    expect(md).not.toMatch(/JSON-LD\)[^\n]*The owner decides\./);
  });
});

