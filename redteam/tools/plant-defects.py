"""Plant one defect at a time into a copy of packages/core and run the unit tests against the copy."""
import os, shutil, subprocess, sys, json
REPO=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK=os.path.join(__import__('tempfile').gettempdir(), 'refraction-planted-defects')
T='packages/core/src/tokens.ts'; C='packages/core/src/color.ts'; E='packages/core/src/engine.ts'; M='packages/core/src/templates/smallBusiness.ts'; S='packages/core/src/catalog/steps.ts'
MUTANTS=[
 ('M01 Enforce repairs nothing except link text', T, "        if (measure(pal, s) >= s.required) continue;\n        if (s.alpha", "        if (measure(pal, s) >= s.required || !s.id.startsWith('link')) continue;\n        if (s.alpha"),
 ('M02 wrong luminance weights', C, "  return 0.2126 * clamp01(lin.r) + 0.7152 * clamp01(lin.g) + 0.0722 * clamp01(lin.b);", "  return 0.3 * clamp01(lin.r) + 0.6 * clamp01(lin.g) + 0.1 * clamp01(lin.b);"),
 ('M03 gamut mapping removed', C, "  if (inGamut(oklchToLinearRgb(color))) return color;\n  let lo = 0;", "  if (color.c >= 0) return color;\n  let lo = 0;"),
 ('M04 escaping removed from the lede', M, '<p class="lede">${e(c.lede)}</p>', '<p class="lede">${c.lede}</p>'),
 ('M05 escaping removed from the promise', M, '<figure class="promise card"><p>${e(c.promise)}</p>', '<figure class="promise card"><p>${c.promise}</p>'),
 ('M06 escaping removed from the facts', M, "`<div><dt>${e(f.value)}</dt><dd>${e(f.label)}</dd></div>`", "`<div><dt>${f.value}</dt><dd>${f.label}</dd></div>`"),
 ('M07 escaping removed from the contact block', M, "<h2>${e(c.contactTitle)}</h2>\n        <p>${e(c.contactBody)}</p>", "<h2>${c.contactTitle}</h2>\n        <p>${c.contactBody}</p>"),
 ('M08 schema drops footerNote', E, "address: shortText, hours: shortText, footerNote: shortText,\n});", "address: shortText, hours: shortText,\n});"),
 ('M09 schema drops the reason', E, "  reason: z.string().max(600).optional(),\n", ""),
 ('M10 all conflict rules but one deleted', E, "  ['marker-gray', (p) =>", "  ['marker-gray', () => false],\n  ['marker-gray-old', (p) =>"),
 ('M11 one Option sets fewer parameters than its siblings', S, "patch: { headingWeight: 700, headingTracking: 0.05, headingCase: 'upper' } }", "patch: { headingWeight: 700, headingTracking: 0.05 } }"),
 ('M12 harmony rules removed', E, "  for (const rule of HARMONY_RULES) HARMONY_FIXES.get(rule.id)?.(out);\n", ""),
 ('M13 wireframe keeps colour strategy, theme and elevation', E, "  colorStrategy: 'quiet',\n  theme: 'light',\n  contrast: 0.75,\n  radius: 4,\n  elevation: 'borders',", "  contrast: 0.75,\n  radius: 4,"),
 ('M14 variations never narrow', E, "  const shrink = 1 / (1 + round * 0.6);", "  const shrink = 1 + round * 0;"),
 ('M15 a variation records the Decision but does not change the design', E, "  return withDecision(project, step, { ...project.params, ...values }, { kind: 'tuned', rejected: previous?.rejected ?? [], at: now, ...(previous?.reason ? { reason: previous.reason } : {}) });\n}\n\n/** Fine-tune", "  return withDecision(project, step, { ...project.params }, { kind: 'tuned', rejected: previous?.rejected ?? [], at: now, ...(previous?.reason ? { reason: previous.reason } : {}) });\n}\n\n/** Fine-tune"),
 ('M16 inline script in the Mockup when motion is expressive', M, "<footer class=\"site-footer\">", "${p.motion === 'expressive' ? '<script>document.body.dataset.x=1</script>' : ''}<footer class=\"site-footer\">"),
 ('M17 focus-ring token equals the background', T, "  css['--border'] = toCssAlpha(pal.text, pal.hairlineAlpha);", "  css['--focus'] = css['--bg']!; hex['--focus'] = hex['--bg']!;\n  css['--border'] = toCssAlpha(pal.text, pal.hairlineAlpha);"),
 ('M18 target-size token cut to 10 px', T, "    '--target-min': '2.75rem',", "    '--target-min': '0.625rem',"),
 ('M19 Enforce repairs never reach the tokens', T, "  const issues = applyProfile(p, pal, profile);\n  const css", "  const issues = applyProfile(p, basePalette(p), profile);\n  const css"),
 ('M20 text colour equals the background', T, "  const text = dark ? n(lerp(0.87, 0.97, k), 1.2) : n(lerp(0.33, 0.15, k), 2.2);", "  const text = bg;"),
 ('M21 fine-tune does not clamp', E, "  const clamped = Math.min(tunable.max, Math.max(tunable.min, value));", "  const clamped = value;"),
 ('M22 keep is recorded as picked', E, "  return withDecision(project, step, project.params, { kind: 'kept', rejected: [], at: now });", "  return withDecision(project, step, project.params, { kind: 'picked', rejected: [], at: now });"),
 ('M23 reduced-motion rule removed', M, "@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }\n", ""),
 ('M24 skip link removed', M, "<a class=\"skip\" ${link('#main')}>Skip to content</a>\n", ""),
 ('M25 form label detached', M, '<label for="m-name">Your name</label>', '<label>Your name</label>'),
 ('M26 no rejected Options recorded', E, "{ kind: 'picked', rejected: step.options.filter((o) => o.id !== option.id).map((o) => o.id), at: now }", "{ kind: 'picked', rejected: [], at: now }"),
 ('M27 any schema version accepted', E, "  if (version > SCHEMA_VERSION) return { ok: false, error: NEWER_VERSION };\n", ""),
 ('M28 generator ignores the designs it should differ from', E, "  const reference = [...avoid];", "  const reference: DesignParams[] = avoid.slice(0, 0);"),
 # further defects of the kinds that this round's findings were about
 ('N01 keep applies the default Option (the old Skip)', E, "  return withDecision(project, step, project.params, { kind: 'kept', rejected: [], at: now });", "  return withDecision(project, step, { ...project.params, ...resolvePatch(step.options.find((o) => o.id === step.defaultOptionId)!, project.params) }, { kind: 'kept', rejected: [], at: now });"),
 ('N02 derived hue is not recomputed', E, "    const value = hueTurn(params[derive.from], derive.turn);\n    if (same(params[derive.key], value)) continue;", "    const value = hueTurn(params[derive.from], derive.turn);\n    if (value >= 0) continue;"),
 ('N03 the focus ring on a painted first screen is the accent', T, "  const focusHero = heroPainted ? heroText : focus;", "  const focusHero = heroPainted ? accent : focus;"),
 ('N04 Enforce reports repaired without measuring again', T, "    const repaired = profile === 'enforce' && now >= s.required;\n    issues.push({ id: s.id,", "    const repaired = profile === 'enforce';\n    issues.push({ id: s.id,"),
 ('N05 Step lookup uses a plain object', S, "  return STEP_TABLE.get(id);", "  return (Object.fromEntries(STEP_TABLE) as Record<string, Step>)[id];"),
 ('N06 the import check keeps the file\'s Option name', E, "    const optionId = matchingOptionId(params, step);\n    let kind: DecisionKind = d.kind;", "    const optionId = d.optionId ?? matchingOptionId(params, step);\n    let kind: DecisionKind = d.kind;"),
 ('N07 the renderer does not check its parameters', M, "  assertKnownParams(p);\n  if (input.focus", "  if (input.focus"),
 ('N08 the error message repeats a key from the file', E, "    return { ok: false, error: section ? `The file does not match the project format. The problem is in its \"${section}\" part.` : NOT_A_PROJECT };", "    return { ok: false, error: `The file does not match the project format: ${result.error.issues[0]?.path.join('.')} ${result.error.issues[0]?.message}` };"),
 ('N09 an outline button is checked against the painted first screen', T, "  const btnFill = filledButton(p) ? action : p.buttonFinish === 'soft' ? accentSoft : bg;", "  const btnFill = filledButton(p) ? action : p.buttonFinish === 'soft' ? accentSoft : bg;\n  if (p.buttonFinish === 'outline' && heroPainted) return basePaletteBroken(p);"),
 ('N10 a tuned slider resets the other sliders to the Step default', E, "  return withDecision(project, step, { ...project.params, [key]: clamped }, { kind: 'tuned',", "  return withDecision(project, step, { ...project.params, ...resolvePatch(step.options.find((o) => o.id === step.defaultOptionId)!, project.params), [key]: clamped }, { kind: 'tuned',"),
 ('N11 a source cites a record that does not exist', S, "const R09 = 'docs/research/09-sleek-finish-recipes.md';", "const R09 = 'docs/research/09-not-written-yet.md';"),
 ('N12 an exemplar names an unread company', S, "exemplar: { text: 'GOV.UK (generous spacing)', record: R04 }", "exemplar: { text: 'Linear, Apple', record: R04 }"),
]
only=sys.argv[1:] 
results=[]
MUTANTS=[('BASELINE no change', T, '// Token derivation:', '// Token derivation:')]+MUTANTS
for name,path,old,new in MUTANTS:
    if only and not any(name.startswith(o) for o in only): continue
    if name.startswith('N09'): continue  # not expressible as a one-line change; covered by the P-02 test
    if os.path.exists(WORK): shutil.rmtree(WORK)
    os.makedirs(WORK+'/packages')
    shutil.copytree(REPO+'/packages/core', WORK+'/packages/core')
    for link in ['docs','node_modules','THIRD_PARTY_NOTICES.md']:
        os.symlink(REPO+'/'+link, WORK+'/'+link)
    shutil.copy(REPO+'/vitest.config.ts', WORK+'/vitest.config.ts')
    shutil.copy(REPO+'/tsconfig.base.json', WORK+'/tsconfig.base.json')
    f=WORK+'/'+path; s=open(f,encoding='utf8').read()
    if s.count(old)<1:
        results.append((name,'NOT APPLIED (%d matches)'%s.count(old),'')); continue
    open(f,'w',encoding='utf8').write(s.replace(old,new,1))
    r=subprocess.run(['npx','vitest','run','--root',WORK],capture_output=True,text=True,cwd=WORK,timeout=300)
    out=r.stdout+r.stderr
    failed=[l.strip() for l in out.split('\n') if l.strip().startswith('×')]
    tests=[l for l in out.split('\n') if 'Tests ' in l]
    ran=[l for l in out.split('\n') if 'Tests ' in l and 'no tests' not in l]
    status='HARNESS ERROR (tests did not run)' if not ran else ('caught' if r.returncode!=0 and failed else 'SURVIVED')
    results.append((name,status,(failed[0][:110] if failed else (tests[0].strip() if tests else out[-200:].replace('\n',' ')))))
    print(name,'=>',status, '|', results[-1][2], flush=True)
print(json.dumps({'caught':sum(1 for r in results if r[1]=='caught'),'survived':[r[0] for r in results if r[1]=='SURVIVED'],'other':[(r[0],r[1]) for r in results if r[1] not in ('caught','SURVIVED')]}, indent=1))
