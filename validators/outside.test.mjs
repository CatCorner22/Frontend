// Outside validators (SPEC.md section 2.9; decision D64).
//
// Two files of the Vision are read by programs, so each is checked here by a program that the builder did not write:
//   DESIGN.md    by the lint program of the DESIGN.md format (@google/design.md)
//   tokens.json  by a parser of the Design Tokens format (@terrazzo/parser)
//
// A check that the builder wrote from its own reading of a format can only find the mistakes that the builder already knows
// about. These two can find the others.
//
// This file runs on GitHub only, in the check "Outside validators". The owner decided so on 2026-11-16: the session in
// which the Studio is built may not run these programs.
import { lint } from '@google/design.md/linter';
import { defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import { DIRECTIONS, applyDirection, createProject, designMd, deriveTokens, tokensJson } from '../packages/core/src/index.ts';

const projects = [createProject('The plain start'), ...DIRECTIONS.map((d) => applyDirection(createProject(d.name), d.id))];
const config = defineConfig({}, { cwd: new URL(import.meta.url) });
const readTokens = (text) => parse([{ filename: new URL('file:///tokens.json'), src: text }], { config });

describe('DESIGN.md, read by the lint program of its format', () => {
  it('has no error for the plain start and for every built-in Direction', async () => {
    const notes = [];
    for (const project of projects) {
      const report = await lint(designMd(project));
      const errors = report.findings.filter((finding) => finding.severity === 'error');
      expect(errors, `${project.name}: ${JSON.stringify(errors)}`).toEqual([]);
      expect(report.summary.errors, project.name).toBe(0);
      for (const finding of report.findings.filter((each) => each.severity === 'warning')) notes.push(`${project.name}: ${finding.path ?? ''} ${finding.message}`);
    }
    // Warnings do not fail this check. They are printed, so that a person can read them in the run's log.
    console.log(`DESIGN.md: ${projects.length} files, 0 errors, ${notes.length} warnings`);
    for (const note of notes.slice(0, 60)) console.log(`  warning: ${note}`);
  });

  it('does report an error for a planted fault, so that its silence means something', async () => {
    const broken = designMd(projects[0]).replace('backgroundColor: "{colors.button}"', 'backgroundColor: "{colors.no-such-color}"');
    expect(broken).not.toBe(designMd(projects[0]));
    const report = await lint(broken);
    expect(report.summary.errors).toBeGreaterThan(0);
  });
});

describe('tokens.json, read by an outside parser of the Design Tokens format', () => {
  it('is read without an error for the plain start and for every built-in Direction', async () => {
    for (const project of projects) {
      const text = tokensJson(deriveTokens(project.params, project.a11y).css);
      const result = await readTokens(text).catch((error) => ({ failed: String(error).slice(0, 600) }));
      expect(result.failed, `${project.name}: ${result.failed}`).toBeUndefined();
      expect(Object.keys(result.tokens).length, project.name).toBeGreaterThan(50);
    }
  });

  it('is refused with a planted fault, so that a clean reading means something', async () => {
    const good = JSON.parse(tokensJson(deriveTokens(projects[0].params, projects[0].a11y).css));
    const name = Object.keys(good.color).find((key) => !key.startsWith('$'));
    good.color[name] = { $type: 'color', $value: 'not a color' };
    const result = await readTokens(JSON.stringify(good)).catch((error) => ({ failed: String(error) }));
    expect(result.failed).toBeDefined();
  });
});
