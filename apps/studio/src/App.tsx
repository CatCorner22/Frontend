import { DIRECTIONS, FONTS, STEPS, conflicts, deriveTokens, generateDirections, type A11yProfile, type DesignParams, type Direction, type MockupFocus, type Step, type TokenIssue } from '@refraction/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText, probePreviews, saveFile } from './platform';
import { LargePreview, Thumbnail, mockupHtml } from './preview';
import { DEVICE_WIDTH, currentOptionId, paramsForOption, stepOf, useStudio, type Device, type StudioState } from './store';
import { STUDIO_PARAMS, applyStudioTheme, installSpecimenFonts } from './theme';

const STAGE_LABEL: Record<Step['stage'], string> = { structure: 'Stage 2 · Structure', feel: 'Stage 3 · Feel' };
const EVIDENCE_LABEL: Record<Step['evidence'], string> = { measured: 'Measured in studies', convention: 'Long-standing convention', 'expert-opinion': 'Expert opinion' };
const REGIONS: { id: MockupFocus | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Where the change shows' },
  { id: 'top', label: 'Top of page' },
  { id: 'facts', label: 'Facts band' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact form' },
];
const DEVICES: { id: Device; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' },
];
const THUMB_RATIO: Record<Device, number> = { phone: 1.5, tablet: 1, desktop: 0.6 };
const SAVE_LABEL: Record<StudioState['saved'], string> = { saving: 'Saving…', cloud: 'Saved to this page', browser: 'Saved in this browser', none: 'Not saved yet' };

function decisionLabel(state: StudioState, step: Step): string {
  const decision = state.project.decisions[step.id];
  if (!decision) return '';
  const label = step.options.find((o) => o.id === decision.optionId)?.label ?? decision.optionId;
  if (decision.kind === 'tuned') return `${label}, adjusted`;
  if (decision.kind === 'defaulted') return `${label} (default)`;
  return label;
}

function describeIssue(issue: TokenIssue): string {
  return issue.outcome === 'repaired'
    ? `${issue.pair}: adjusted from ${issue.ratio}:1 to meet ${issue.required}:1.`
    : `${issue.pair}: ${issue.ratio}:1, below the usual ${issue.required}:1.`;
}

// ───────── Top bar ─────────

function TopBar(): React.JSX.Element {
  const s = useStudio();
  return (
    <header className="top">
      <a className="logo" href="#directions" aria-label="Refraction Studio, go to directions">
        <span className="logo-mark" aria-hidden="true" />
        Refraction
      </a>
      <input id="project-name" className="name" aria-label="Project name" value={s.project.name} onChange={(e) => s.rename(e.target.value)} spellCheck={false} autoComplete="off" />
      <nav className="top-nav" aria-label="Views">
        <a href="#directions" aria-current={s.view === 'directions' ? 'page' : undefined}>Directions</a>
        <a href={`#${s.stepId}`} aria-current={s.view === 'steps' ? 'page' : undefined}>Steps</a>
        <a href="#summary" aria-current={s.view === 'summary' ? 'page' : undefined}>Summary</a>
      </nav>
      <label className="profile" title="Off: no checks. Advise: warnings only. Enforce: failing colors are adjusted.">
        <span>Contrast checks</span>
        <select id="a11y-profile" value={s.project.a11y} onChange={(e) => s.setProfile(e.target.value as A11yProfile)}>
          <option value="off">Off</option>
          <option value="advise">Advise</option>
          <option value="enforce">Enforce</option>
        </select>
      </label>
      <span className="save-state" role="status">{SAVE_LABEL[s.saved]}</span>
    </header>
  );
}

// ───────── Directions ─────────

function DirectionCard({ direction, onUse }: { direction: Direction; onUse: (d: Direction) => void }): React.JSX.Element {
  const project = useStudio((s) => s.project);
  const html = useMemo(() => mockupHtml(project, direction.params, { wireframe: false, focus: 'top', still: true }).html, [project.content, project.a11y, direction]);
  return (
    <article className="direction">
      <Thumbnail html={html} width={1280} title={`Preview of ${direction.name}`} ratio={0.64} />
      <div className="direction-body">
        <h3>{direction.name}</h3>
        <p className="mood">{direction.mood}</p>
        <dl>
          <div><dt>Best for</dt><dd>{direction.bestFor}</dd></div>
          <div><dt>Watch for</dt><dd>{direction.risk}</dd></div>
          {direction.inTheSpiritOf && <div><dt>In the spirit of</dt><dd>{direction.inTheSpiritOf}</dd></div>}
        </dl>
        <button type="button" className="btn primary" onClick={() => onUse(direction)}>Start from {direction.name}</button>
      </div>
    </article>
  );
}

function DirectionsView(): React.JSX.Element {
  const s = useStudio();
  const [generated, setGenerated] = useState<Direction[]>([]);
  const [seed, setSeed] = useState(1);
  const more = (): void => {
    const avoid = [...DIRECTIONS, ...generated].map((d) => d.params);
    setGenerated((prev) => [...prev, ...generateDirections(seed * 7919 + 13, 6, avoid)]);
    setSeed((n) => n + 1);
  };
  const started = s.project.direction !== null || Object.keys(s.project.decisions).length > 0;
  return (
    <main className="directions" id="main" tabIndex={-1}>
      <div className="intro">
        <p className="eyebrow">Stage 1 · Direction</p>
        <h1>Pick a starting direction</h1>
        <p className="teach">
          A direction sets every design decision at once: layout, type, color, depth, and motion. It is a starting point, not a commitment. After you pick one, the Steps let you change one thing at a time, like an eye exam: “which is better, 1 or 2?”
        </p>
        {started && <p className="note">Starting from a new direction replaces your current design and clears the decisions you made in the Steps.</p>}
      </div>
      <div className="direction-grid">
        {[...DIRECTIONS, ...generated].map((d) => <DirectionCard key={d.id} direction={d} onUse={s.useDirection} />)}
      </div>
      <div className="more">
        <button type="button" className="btn" onClick={more}>Show me six more directions</button>
        <p className="hint">New directions are composed from the Catalog under harmony rules. Nobody has reviewed them; judge them by eye.</p>
        <a className="btn quiet" href={`#${STEPS[0]!.id}`}>Skip this and start the Steps from neutral defaults</a>
      </div>
    </main>
  );
}

// ───────── Steps ─────────

const COLOR_STEPS = new Set(['neutral', 'accent', 'color-strategy', 'theme', 'atmosphere']);
const SWATCH_KEYS = ['--bg', '--surface-2', '--text', '--action', '--accent', '--accent-2'];

/** The colors an Option produces, as chips. Thumbnails are too small to compare colors by eye. */
function Swatches({ params, profile }: { params: DesignParams; profile: A11yProfile }): React.JSX.Element {
  const hex = deriveTokens(params, profile).hex;
  const colors = [...new Set(SWATCH_KEYS.map((k) => hex[k]).filter((v): v is string => typeof v === 'string'))];
  return (
    <span className="swatches" aria-hidden="true">
      {colors.map((c) => <span key={c} style={{ background: c }} />)}
    </span>
  );
}

function Rail(): React.JSX.Element {
  const s = useStudio();
  return (
    <nav className="rail" aria-label="Steps">
      <a className="rail-direction" href="#directions">
        <span>Direction</span>
        <strong>{s.project.direction ?? 'Neutral defaults'}</strong>
      </a>
      {(['structure', 'feel'] as const).map((stage) => (
        <section key={stage}>
          <h2>{STAGE_LABEL[stage]}</h2>
          <ol>
            {STEPS.filter((st) => st.stage === stage).map((st) => {
              const decision = s.project.decisions[st.id];
              return (
                <li key={st.id}>
                  <a href={`#${st.id}`} aria-current={s.view === 'steps' && st.id === s.stepId ? 'step' : undefined}>
                    <span className="dot" data-state={decision ? decision.kind : 'open'} aria-hidden="true" />
                    <span className="rail-text">
                      <span>{st.name}</span>
                      {decision && <small>{decisionLabel(s, st)}</small>}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <a className="rail-summary" href="#summary" aria-current={s.view === 'summary' ? 'page' : undefined}>Summary and project file</a>
    </nav>
  );
}

interface Item {
  id: string;
  label: string;
  what: string;
  chooseWhen?: string;
  risk?: string;
  exemplar?: string;
  warn?: string;
}

function StepsView(): React.JSX.Element {
  const s = useStudio();
  const step = stepOf(s.stepId);
  const index = STEPS.indexOf(step);
  const wire = step.stage === 'structure' && s.wireframe;
  const focus: MockupFocus = s.region === 'auto' ? step.focus : s.region;
  const width = DEVICE_WIDTH[s.device];
  const current = currentOptionId(s.project, step);
  const decision = s.project.decisions[step.id];

  const items: Item[] = s.closer
    ? s.closer.options.map((o) => ({ id: o.id, label: o.label, what: 'A small move away from the option you were looking at.' }))
    : step.options.map((o) => ({ id: o.id, label: o.label, what: o.what, chooseWhen: o.chooseWhen, risk: o.risk, exemplar: o.exemplar, warn: o.warn }));
  const focused = items.find((i) => i.id === s.focusedId) ?? items[0];
  const focusedParams: DesignParams = focused ? paramsForOption(s, focused.id) : s.project.params;

  const stateKey = JSON.stringify([s.project.params, s.project.content, s.project.a11y, step.id, s.closer?.round ?? -1, s.closer?.baseValues ?? null, wire, focus]);
  const thumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const item of items) out[item.id] = mockupHtml(s.project, paramsForOption(s, item.id), { wireframe: wire, focus, still: true }).html;
    return out;
  }, [stateKey]);
  const large = useMemo(
    () => mockupHtml(s.project, focusedParams, { wireframe: wire, focus, still: false }),
    [stateKey, focused?.id],
  );
  const found = useMemo(() => conflicts({ ...s.project, params: focusedParams }), [JSON.stringify(focusedParams)]);

  // Number keys flip between Options, as an optometrist flips lenses.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'radio'));
      if (typing) return;
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= 9) {
        const item = itemsRef.current[n - 1];
        if (item) {
          event.preventDefault();
          useStudio.getState().focus(item.id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onTune = (key: keyof DesignParams, value: number): void => {
    const state = useStudio.getState();
    if (!state.closer && state.focusedId && state.focusedId !== current) state.pickFocused(false);
    useStudio.getState().tuneValue(key, value);
  };

  return (
    <div className="work">
      <Rail />
      <main className="stage" id="main" tabIndex={-1}>
        <div className="step-head">
          <p className="eyebrow">{STAGE_LABEL[step.stage]} · Step {index + 1} of {STEPS.length}</p>
          <h1>{step.title}</h1>
          <p className="teach">{step.teach}</p>
          <details className="source">
            <summary>What changes here, and where this guidance comes from</summary>
            <p><strong>The one thing that changes:</strong> {step.variable.toLowerCase()}. Everything else stays fixed.</p>
            <p><strong>Basis:</strong> {EVIDENCE_LABEL[step.evidence]}. <strong>Sources:</strong> {step.source}. Reviewed {step.reviewed}.</p>
          </details>
        </div>
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Preview width">
            {DEVICES.map((d) => (
              <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>
            ))}
          </div>
          <label className="inline-field">
            <span>Open at</span>
            <select id="preview-region" value={s.region} onChange={(e) => s.setRegion(e.target.value as MockupFocus | 'auto')}>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          {step.stage === 'structure' && (
            <label className="check">
              <input id="wireframe-toggle" type="checkbox" checked={s.wireframe} onChange={(e) => s.setWireframe(e.target.checked)} />
              <span>Grayscale wireframe</span>
            </label>
          )}
          <span className="showing" aria-live="polite">Showing: <strong>{focused?.label ?? 'current design'}</strong></span>
        </div>
        <button type="button" className="skip-preview" onClick={() => (document.querySelector('.options input[type="radio"]:checked') as HTMLElement | null)?.focus()}>
          Skip the preview and go to the Options
        </button>
        <LargePreview html={large.html} width={width} title={`Large preview: ${focused?.label ?? 'current design'}`} />
        {(focused?.warn || large.issues.length > 0 || found.length > 0) && (
          <div className="notes" role="status">
            {focused?.warn && <p className="note-warn"><strong>Common default.</strong> {focused.warn}</p>}
            {found.map((c) => <p key={c.id} className="note-conflict"><strong>These picks pull against each other.</strong> {c.message}</p>)}
            {large.issues.length > 0 && (
              <details>
                <summary>{large.issues.length} contrast {large.issues.length === 1 ? 'note' : 'notes'} ({s.project.a11y === 'enforce' ? 'adjusted' : 'advice only'})</summary>
                <ul>{large.issues.map((i) => <li key={i.id}>{describeIssue(i)}</li>)}</ul>
              </details>
            )}
          </div>
        )}
      </main>
      <aside className="options" aria-label="Options">
        <fieldset
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
              s.pickFocused(true);
            }
          }}
        >
          <legend>
            {s.closer ? `${step.name}: closer, round ${s.closer.round + 1}` : step.name}
            <small>{step.variable}. Press 1 to {Math.min(items.length, 9)} to compare; Enter picks.</small>
          </legend>
          {focused && (
            <section className="about" aria-live="polite">
              <h2>About “{focused.label}”</h2>
              <p>{focused.what}</p>
              {focused.chooseWhen && <p><strong>Choose it when:</strong> {focused.chooseWhen}</p>}
              {focused.risk && <p><strong>Watch for:</strong> {focused.risk}</p>}
              {focused.exemplar && <p><strong>Seen in:</strong> {focused.exemplar}</p>}
            </section>
          )}
          <div className="tiles" data-device={s.device}>
            {items.map((item, i) => {
              const isFocused = focused?.id === item.id;
              const shown = paramsForOption(s, item.id);
              return (
                <label key={item.id} className="option" data-focused={isFocused || undefined} onDoubleClick={() => s.pickFocused(true)}>
                  <input id={`option-${item.id}`} type="radio" name="option" value={item.id} checked={isFocused} onChange={() => s.focus(item.id)} />
                  <Thumbnail html={thumbs[item.id] ?? ''} width={width} title="" ratio={THUMB_RATIO[s.device]} />
                  <span className="option-title">
                    {i < 9 && <kbd>{i + 1}</kbd>}
                    <span>{item.label}</span>
                  </span>
                  {COLOR_STEPS.has(step.id) && <Swatches params={shown} profile={s.project.a11y} />}
                  {step.id === 'typeface' && (
                    <span className="specimen" aria-hidden="true">
                      <span style={{ fontFamily: FONTS[shown.fontHeading].stack, fontWeight: 650 }}>Aa</span>
                      <span style={{ fontFamily: FONTS[shown.fontBody].stack }}>Aa</span>
                    </span>
                  )}
                  <span className="badges">
                    {!s.closer && current === item.id && <em className="badge">{decision ? (decision.kind === 'defaulted' ? 'Default taken' : decision.kind === 'tuned' ? 'Picked, adjusted' : 'Picked') : 'Current'}</em>}
                    {!s.closer && item.warn && <em className="badge warn">Common default</em>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="actions sticky">
          <button type="button" className="btn primary" disabled={!focused} onClick={() => s.pickFocused(true)}>
            Pick “{focused?.label ?? ''}” and continue
          </button>
          {step.tunables && step.tunables.length > 0 && (
            <button type="button" className="btn" onClick={s.startCloser}>{s.closer ? 'Closer still' : 'Closer to this one'}</button>
          )}
          {s.closer ? (
            <button type="button" className="btn quiet" onClick={s.endCloser}>Back to the main options</button>
          ) : (
            <>
              <button type="button" className="btn quiet" onClick={s.skipStep}>Skip: take the default</button>
              <button type="button" className="btn quiet" onClick={s.back}>Back</button>
            </>
          )}
        </div>
        {!s.closer && step.tunables && step.tunables.length > 0 && (
          <details className="tune">
            <summary>Fine-tune by hand</summary>
            <p className="hint">Sliders change your design directly and mark this decision as adjusted.</p>
            {step.tunables.map((t) => {
              const value = s.project.params[t.key] as number;
              return (
                <label key={String(t.key)} className="slider">
                  <span>{t.label}</span>
                  <input id={`tune-${String(t.key)}`} type="range" min={t.min} max={t.max} step={t.step} value={Math.min(value, t.max)} onChange={(e) => onTune(t.key, Number(e.target.value))} />
                  <output>{Number(Math.min(value, t.max).toFixed(3))}{t.unit ?? ''}</output>
                </label>
              );
            })}
          </details>
        )}
      </aside>
    </div>
  );
}

// ───────── Summary ─────────

function SummaryView(): React.JSX.Element {
  const s = useStudio();
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const text = useMemo(() => JSON.stringify(s.project, null, 2), [s.project]);
  const html = useMemo(() => mockupHtml(s.project, s.project.params, { wireframe: false, focus: 'top', still: false }), [s.project]);
  const found = useMemo(() => conflicts(s.project), [s.project]);
  const decided = STEPS.filter((st) => s.project.decisions[st.id]).length;

  const save = async (): Promise<void> => {
    const outcome = await saveFile('refraction-project.json', text);
    if (outcome === 'saved') setMessage('The project file was offered for saving.');
    else if (outcome === 'declined') setMessage('The save was cancelled.');
    else {
      setShowText(true);
      setMessage('This page cannot save files here. Copy the project text below instead.');
    }
  };
  const copy = async (): Promise<void> => {
    const ok = await copyText(text);
    setShowText(!ok);
    setMessage(ok ? 'Project text copied.' : 'Copying is blocked here. Select the text below and copy it by hand.');
  };
  const load = (file: File | undefined): void => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const error = s.importProject(JSON.parse(String(reader.result)));
        setMessage(error ? `That file was not loaded: ${error}` : 'Project loaded.');
      } catch {
        setMessage('That file was not loaded: it is not a project file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="summary" id="main" tabIndex={-1}>
      <div className="summary-main">
        <p className="eyebrow">Read-back</p>
        <h1>Your decisions so far</h1>
        <p className="teach">
          You have decided {decided} of {STEPS.length} Steps. Undecided Steps keep the value from your direction. The export bundle (the prompt, the token files, and the reference page) arrives in a later milestone; today you can save the project file.
        </p>
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Preview width">
            {DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>)}
          </div>
        </div>
        <LargePreview html={html.html} width={DEVICE_WIDTH[s.device]} title="Preview of your current design" />
      </div>
      <aside className="summary-side">
        <section>
          <h2>Decisions</h2>
          <p className="direction-line">Direction: <strong>{s.project.direction ?? 'Neutral defaults'}</strong></p>
          <ol className="decision-list">
            {STEPS.map((st) => {
              const d = s.project.decisions[st.id];
              return (
                <li key={st.id}>
                  <a href={`#${st.id}`}>
                    <span className="dot" data-state={d ? d.kind : 'open'} aria-hidden="true" />
                    <span className="rail-text"><span>{st.name}</span><small>{d ? decisionLabel(s, st) : 'From your direction'}</small></span>
                    <span className="change">Change</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
        {(found.length > 0 || html.issues.length > 0) && (
          <section className="notes">
            <h2>Notes</h2>
            {found.map((c) => <p key={c.id} className="note-conflict">{c.message}</p>)}
            {html.issues.length > 0 && <ul>{html.issues.map((i) => <li key={i.id}>{describeIssue(i)}</li>)}</ul>}
          </section>
        )}
        <section>
          <h2>Project file</h2>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => void save()}>Save the project file</button>
            <button type="button" className="btn" onClick={() => void copy()}>Copy the project as text</button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Load a project file</button>
            <input ref={fileRef} id="project-file" type="file" accept=".json,application/json" hidden onChange={(e) => { load(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          {message && <p className="note" role="status">{message}</p>}
          {showText && <textarea id="project-text" className="project-text" readOnly value={text} aria-label="Project as text" onFocus={(e) => e.target.select()} />}
        </section>
        <section>
          <h2>The Studio’s own look</h2>
          <label className="check">
            <input id="studio-look" type="checkbox" checked={s.studioLook === 'project'} onChange={(e) => s.setStudioLook(e.target.checked ? 'project' : 'studio')} />
            <span>Dress the Studio in this design’s colors, type, and shapes</span>
          </label>
        </section>
        <section>
          <h2>Start over</h2>
          {confirming ? (
            <div className="actions">
              <p className="note">This clears every decision in this project.</p>
              <button type="button" className="btn danger" onClick={() => { setConfirming(false); s.startOver(); }}>Yes, clear this project</button>
              <button type="button" className="btn quiet" onClick={() => setConfirming(false)}>Keep it</button>
            </div>
          ) : (
            <button type="button" className="btn quiet" onClick={() => setConfirming(true)}>Start a new project…</button>
          )}
        </section>
      </aside>
    </main>
  );
}

// ───────── App ─────────

export function App(): React.JSX.Element {
  const ready = useStudio((s) => s.ready);
  const view = useStudio((s) => s.view);
  const look = useStudio((s) => s.studioLook);
  const params = useStudio((s) => s.project.params);
  const notice = useStudio((s) => s.notice);
  const [previewsWork, setPreviewsWork] = useState<boolean | null>(null);

  useEffect(() => {
    installSpecimenFonts();
    void useStudio.getState().init();
    void probePreviews().then(setPreviewsWork);
  }, []);
  useEffect(() => {
    if (look === 'project') applyStudioTheme(params, false);
    else applyStudioTheme(STUDIO_PARAMS, true);
  }, [look, params]);

  return (
    <div className="app">
      <button type="button" className="skip" onClick={() => document.getElementById('main')?.focus()}>Skip to the main content</button>
      <TopBar />
      {notice && (
        <p className="banner" role="status">
          {notice} <button type="button" className="btn quiet" onClick={() => useStudio.getState().dismissNotice()}>Dismiss</button>
        </p>
      )}
      {previewsWork === false && (
        <p className="banner" role="alert">This page is not allowed to show embedded previews, so the pictures will be blank. Tell Claude: “the previews are blocked.”</p>
      )}
      {!ready ? <main className="loading" id="main" tabIndex={-1}><p>Opening your project…</p></main> : view === 'directions' ? <DirectionsView /> : view === 'summary' ? <SummaryView /> : <StepsView />}
    </div>
  );
}
