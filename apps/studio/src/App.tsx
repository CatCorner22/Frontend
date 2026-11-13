import {
  DIRECTIONS, FONTS, NOT_CHECKED, STEPS, conflicts, deriveTokens, findStep, matchingOptionId, resolvePatch,
  type A11yProfile, type DesignParams, type Direction, type MockupFocus, type Project, type SourceRef, type Step, type TokenIssue, type Tunable,
} from '@refraction/core';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { LICENSE_TEXTS, MIT_COPYRIGHT_PLACEHOLDER, NOTICES } from './notices.generated';
import { copyText, fileNameFor, probePreviews, readBackups, removeBackup, saveFile, type KeptCopy } from './platform';
import { LargePreview, Thumbnail, mockupHtml } from './preview';
import { CURRENT, DEVICE_WIDTH, appliedCardId, directionName, paramsForCard, stepOf, useStudio, type Device, type StudioState } from './store';
import { STUDIO_PARAMS, applyStudioTheme, installSpecimenFonts } from './theme';

// ───────── Words. One word for one thing, everywhere on screen. ─────────

const STAGE_NAME: Record<Step['stage'], string> = { structure: 'Layout', feel: 'Look and feel' };
const EVIDENCE_LABEL: Record<Step['evidence'], string> = { measured: 'measured in studies that were read', convention: 'long-standing convention', 'expert-opinion': 'expert opinion' };
const BASIS_LABEL: Record<SourceRef['basis'], string> = {
  read: 'read in full',
  abstract: 'only a summary of the study was read',
  snippet: 'seen only as a search snippet',
  'owner-file': 'from your own files; not checked against an original source',
  builder: 'the judgment of the assistant that wrote this Studio; no source consulted',
};
const REGIONS: { id: MockupFocus | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Where this Step’s change shows' },
  { id: 'top', label: 'Top of the page' },
  { id: 'facts', label: 'Facts band' },
  { id: 'services', label: 'List of services' },
  { id: 'fees', label: 'Price list' },
  { id: 'about', label: 'The “about” section' },
  { id: 'contact', label: 'Contact form' },
];
const DEVICES: { id: Device; label: string }[] = [
  { id: 'phone', label: 'Phone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' },
];
const THUMB_RATIO: Record<Device, number> = { phone: 1.5, tablet: 1, desktop: 0.6 };
const SAVE_LABEL: Record<StudioState['saved'], string> = {
  idle: 'Nothing to save yet',
  saving: 'Saving…',
  page: 'Saved on this page',
  browser: 'Saved in this browser, on this computer',
  failed: 'Cannot save here: this browser’s storage is full or blocked. Download the project file before you close this page.',
  held: 'Not saving: see the notice',
};
const PROFILE_MEANING: Record<A11yProfile, string> = {
  off: 'Off: no contrast notes are shown.',
  advise: 'Warn me: the Studio notes colors that are hard to tell apart, and changes nothing.',
  enforce: 'Fix for me: the Studio adjusts colors that are hard to tell apart, and lists each change.',
};
const HUE_NAMES: [number, string][] = [[25, 'red'], [55, 'orange'], [95, 'yellow'], [140, 'green'], [195, 'teal'], [258, 'blue'], [298, 'violet'], [345, 'pink']];
const hueName = (hue: number): string => HUE_NAMES.reduce((best, entry) => (Math.min(Math.abs(hue - entry[0]), 360 - Math.abs(hue - entry[0])) < Math.min(Math.abs(hue - best[0]), 360 - Math.abs(hue - best[0])) ? entry : best))[1];

/** The value of one slider, in words a person can picture. */
function sliderValue(t: Tunable, raw: number): string {
  if (String(t.key).toLowerCase().includes('hue')) return `${Math.round(raw)}° (${hueName(raw)})`;
  if (t.key === 'radius' && raw > t.max) return 'fully round';
  return `${Number(Math.min(raw, t.max).toFixed(3))}${t.unit ?? ''}`;
}

/** The standard Option whose values lie nearest to the design's values, for a Step with sliders. */
function nearestOption(params: DesignParams, step: Step): Step['options'][number] | null {
  let best: Step['options'][number] | null = null;
  let bestDistance = Infinity;
  for (const option of step.options) {
    const patch = resolvePatch(option, params) as Record<string, unknown>;
    let distance = 0;
    for (const key of step.owns) {
      const want = patch[key];
      const have = params[key];
      if (want === undefined) continue;
      const tunable = step.tunables?.find((t) => t.key === key);
      if (typeof want === 'number' && typeof have === 'number' && tunable) {
        const gap = Math.abs(want - have);
        // A hue is a position on a wheel: 350 degrees and 10 degrees are 20 apart.
        distance += String(key).toLowerCase().includes('hue') ? Math.min(gap, 360 - gap) / 180 : gap / (tunable.max - tunable.min);
      } else if (want !== have) distance += 1;
    }
    if (distance < bestDistance) {
      best = option;
      bestDistance = distance;
    }
  }
  return best;
}

/** The current value of a Step, in words: the matching Option's name, or the hand-set values. */
function valueLabel(project: Project, step: Step): string {
  const match = matchingOptionId(project.params, step);
  if (match) return step.options.find((o) => o.id === match)!.label;
  if (step.tunables?.length) {
    // Words first, numbers second: a hand-set value is named by the standard Option it lies nearest to (finding U2-04).
    const exact = step.tunables.map((t) => `${t.label.toLowerCase()} ${sliderValue(t, project.params[t.key] as number)}`).join(', ');
    const near = nearestOption(project.params, step);
    return near ? `close to “${near.label}” (${exact})` : exact;
  }
  return step.owns
    .map((key) => {
      const value = project.params[key];
      return key === 'fontHeading' || key === 'fontBody' ? FONTS[value as keyof typeof FONTS].label : String(value);
    })
    .filter((v, i, all) => all.indexOf(v) === i)
    .join(' with ');
}

/** One line that says where a Step stands: decided how, and with what value. */
function stepStatus(state: Pick<StudioState, 'project' | 'generated'>, step: Step): { state: 'open' | 'picked' | 'kept' | 'tuned'; text: string } {
  const decision = state.project.decisions[step.id];
  const value = valueLabel(state.project, step);
  if (!decision) return { state: 'open', text: `Not decided yet. Now: ${value}` };
  if (decision.kind === 'picked') return { state: 'picked', text: `Picked: ${value}` };
  if (decision.kind === 'kept') return { state: 'kept', text: `Kept: ${value}` };
  return { state: 'tuned', text: `Set by hand: ${value}` };
}

function describeIssue(issue: TokenIssue): string {
  return issue.outcome === 'repaired'
    ? `${issue.pair}: adjusted from ${issue.ratio} to 1 up to ${issue.after} to 1 (the guideline asks for ${issue.required} to 1).`
    : `${issue.pair}: ${issue.ratio} to 1, below the guideline of ${issue.required} to 1.`;
}

const isTyping = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return true;
  return el.tagName === 'INPUT' && !['radio', 'checkbox', 'range', 'button', 'file'].includes((el as HTMLInputElement).type);
};

// ───────── Shared pieces ─────────

function TopBar(): React.JSX.Element {
  const s = useStudio();
  return (
    <header className="top">
      <a className="logo" href="#directions" aria-label="Refraction Studio: go to the Directions">
        <span className="logo-mark" aria-hidden="true" />
        Refraction Studio
      </a>
      <label className="name-field">
        <span className="visually-hidden">Project name</span>
        <input id="project-name" className="name" value={s.project.name} placeholder="Name this project" onChange={(e) => s.rename(e.target.value)} spellCheck={false} autoComplete="off" maxLength={120} />
      </label>
      <nav className="top-nav" aria-label="Parts of the Studio">
        <a href="#directions" aria-current={s.view === 'directions' ? 'page' : undefined}>1. Directions</a>
        <a href={`#${s.stepId}`} aria-current={s.view === 'steps' ? 'page' : undefined}>2. Steps</a>
        <a href="#summary" aria-current={s.view === 'summary' ? 'page' : undefined}>3. Summary</a>
      </nav>
      <div className="profile">
        <label htmlFor="a11y-profile">Contrast checks</label>
        <select id="a11y-profile" value={s.project.a11y} aria-describedby="a11y-meaning" onChange={(e) => s.setProfile(e.target.value as A11yProfile)}>
          <option value="off">Off</option>
          <option value="advise">Warn me</option>
          <option value="enforce">Fix for me</option>
        </select>
        <span id="a11y-meaning" className="profile-meaning">{PROFILE_MEANING[s.project.a11y]}</span>
      </div>
      <button type="button" className="btn small" disabled={s.history.length === 0} onClick={s.undo}>Undo</button>
      <span className="save-state" role="status">{SAVE_LABEL[s.saved]}</span>
    </header>
  );
}

function NoticeBar(): React.JSX.Element | null {
  const notice = useStudio((s) => s.notice);
  const dismiss = useStudio((s) => s.dismissNotice);
  if (!notice) return null;
  return (
    <div className="banner" role={notice.urgent ? 'alert' : 'status'}>
      <p>{notice.text}</p>
      <div className="banner-actions">
        {notice.actions?.map((action) => <button key={action.label} type="button" className="btn small" onClick={action.run}>{action.label}</button>)}
        {!notice.sticky && <button type="button" className="btn small quiet" onClick={dismiss}>Dismiss</button>}
      </div>
    </div>
  );
}

/** A question the owner must answer before work is replaced. The browser's own dialog element keeps keyboard focus inside it and closes on Escape. */
function ConfirmDialog(): React.JSX.Element | null {
  const confirmation = useStudio((s) => s.confirmation);
  const answer = useStudio((s) => s.answerConfirmation);
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (confirmation && dialog && !dialog.open) dialog.showModal();
  }, [confirmation]);
  if (!confirmation) return null;
  return (
    <dialog ref={ref} className="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-body" onCancel={(e) => { e.preventDefault(); answer(false); }}>
      <h2 id="confirm-title">{confirmation.title}</h2>
      <p id="confirm-body">{confirmation.body}</p>
      <div className="actions">
        <button type="button" className="btn" autoFocus onClick={() => answer(false)}>{confirmation.cancelLabel}</button>
        <button type="button" className={confirmation.danger ? 'btn danger' : 'btn primary'} onClick={() => answer(true)}>{confirmation.confirmLabel}</button>
      </div>
    </dialog>
  );
}

/** Move keyboard focus to the page heading when the view changes, so that a keyboard user is never left nowhere. */
function useHeadingFocus(): React.RefObject<HTMLHeadingElement | null> {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const tick = useStudio((s) => s.focusTick);
  useEffect(() => {
    if (tick > 0) ref.current?.focus();
  }, [tick]);
  return ref;
}

// ───────── Directions ─────────

function DirectionCard({ direction }: { direction: Direction }): React.JSX.Element {
  const project = useStudio((s) => s.project);
  const request = useStudio((s) => s.requestDirection);
  const html = useMemo(() => mockupHtml(project, direction.params, { wireframe: false, focus: 'top', still: true }).html, [project.content, project.a11y, direction]);
  return (
    <article className="direction" aria-labelledby={`direction-${direction.id}`}>
      <div className="direction-body">
        <h3 id={`direction-${direction.id}`}>{direction.name}</h3>
        <p className="mood">{direction.mood}</p>
      </div>
      <Thumbnail html={html} width={1280} ratio={0.64} />
      <div className="direction-body">
        <dl>
          <div><dt>Best for</dt><dd>{direction.bestFor}</dd></div>
          <div><dt>Watch for</dt><dd>{direction.risk}</dd></div>
        </dl>
        <button type="button" className="btn primary" onClick={() => request(direction)}>Start from {direction.name}</button>
      </div>
    </article>
  );
}

function DirectionsView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  const started = s.project.direction !== null || Object.keys(s.project.decisions).length > 0;
  return (
    <main className="directions" id="main" tabIndex={-1}>
      <div className="intro">
        <p className="eyebrow">Start here</p>
        <h1 ref={heading} tabIndex={-1}>Pick a Direction: a complete starting look</h1>
        <p className="teach">
          The Studio helps you decide how a website looks and feels, one small decision at a time. Today you leave with a project file that holds your Decisions. A later version will turn them into exact instructions for an AI coding tool.
        </p>
        <p className="teach">
          First pick a Direction below. Then {STEPS.length} short Steps let you change one thing at a time, like an eye exam: “which is better, 1 or 2?” You can stop at any point; the Studio saves your work as you go.
        </p>
        <p className="teach">Every picture shows the same made-up dental practice, so that only the design differs. It is a sample; it is not your content.</p>
        {started && <p className="note">You already have a project, started from {directionName(s.project, s.generated)}. If you start from another Direction, the Studio asks first, and you can undo it.</p>}
      </div>
      <div className="direction-grid">
        {[...DIRECTIONS, ...s.generated].map((d) => <DirectionCard key={d.id} direction={d} />)}
      </div>
      <div className="more">
        <button type="button" className="btn" onClick={s.moreDirections}>Show me six more Directions</button>
        <p className="hint">The Studio composes each new Direction at random from its own choices and then removes combinations that clash. No person has looked at them, so judge them by eye.</p>
        <button type="button" className="btn quiet" onClick={s.requestPlainStart}>Start plain, without a Direction</button>
        {started && <a className="btn quiet" href={`#${s.stepId}`}>Go on with my project</a>}
      </div>
    </main>
  );
}

// ───────── Steps ─────────

const COLOR_STEPS = new Set(['neutral', 'accent', 'color-strategy', 'theme', 'contrast', 'atmosphere']);
const SWATCH_KEYS = ['--bg', '--surface-2', '--text', '--action', '--accent', '--accent-2'];

/** The colors a card produces, as chips. A small picture is too small to compare colors by eye. */
function Swatches({ params, profile }: { params: DesignParams; profile: A11yProfile }): React.JSX.Element {
  const hex = deriveTokens(params, profile).hex;
  const colors = [...new Set(SWATCH_KEYS.map((k) => hex[k]).filter((v): v is string => typeof v === 'string'))];
  return (
    <span className="swatches" aria-hidden="true">
      {colors.map((c) => <span key={c} style={{ background: c }} />)}
    </span>
  );
}

/** The list of Steps. It is one stop for the Tab key; the arrow keys move inside it. */
function Rail(): React.JSX.Element {
  const s = useStudio();
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('a')];
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const to = event.key === 'ArrowDown' ? at + 1 : event.key === 'ArrowUp' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : -1;
    if (at < 0 || to < 0 || to >= links.length) return;
    event.preventDefault();
    links[to]!.focus();
  };
  const tab = (active: boolean): number => (active ? 0 : -1);
  const decided = STEPS.filter((st) => s.project.decisions[st.id]).length;
  return (
    <nav className="rail" aria-label="All Steps (use the arrow keys to move through this list)" onKeyDown={onKeyDown}>
      <a className="rail-direction" href="#directions" tabIndex={tab(s.view !== 'steps')}>
        <span>Started from</span>
        <strong>{directionName(s.project, s.generated)}</strong>
      </a>
      <p className="rail-count">{decided} of {STEPS.length} Steps decided</p>
      {(['structure', 'feel'] as const).map((stage) => (
        <section key={stage}>
          <h2>{STAGE_NAME[stage]}</h2>
          <ol>
            {STEPS.filter((st) => st.stage === stage).map((st) => {
              const status = stepStatus(s, st);
              const here = s.view === 'steps' && st.id === s.stepId;
              return (
                <li key={st.id}>
                  <a href={`#${st.id}`} aria-current={here ? 'step' : undefined} tabIndex={tab(here)}>
                    <span className="dot" data-state={status.state} aria-hidden="true" />
                    <span className="rail-text">
                      <span>{STEPS.indexOf(st) + 1}. {st.name}</span>
                      <small>{status.text}</small>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <a className="rail-summary" href="#summary" tabIndex={-1}>Summary and project file</a>
    </nav>
  );
}

interface Card {
  id: string;
  label: string;
  what: string;
  chooseWhen?: string;
  risk?: string;
  exemplar?: string;
  warn?: string;
  focus?: MockupFocus;
}

function ReasonField({ stepId }: { stepId: string }): React.JSX.Element | null {
  const decision = useStudio((s) => s.project.decisions[stepId]);
  const save = useStudio((s) => s.setReason);
  const [text, setText] = useState(decision?.reason ?? '');
  useEffect(() => setText(decision?.reason ?? ''), [stepId, decision?.reason]);
  if (!decision) return null;
  return (
    <label className="reason">
      <span>Why this choice? (optional)</span>
      <input id="decision-reason" type="text" value={text} maxLength={280} placeholder="For example: most of our visitors come to book" onChange={(e) => setText(e.target.value)} onBlur={() => { if (text.trim() !== (decision.reason ?? '')) save(text); }} />
      <small>Your reason is saved in the project file. A later version of the Studio will pass it to the AI coding tool that builds your site.</small>
    </label>
  );
}

function StepsView(): React.JSX.Element {
  const s = useStudio();
  const step = stepOf(s.stepId);
  const index = STEPS.indexOf(step);
  const firstFeel = STEPS.findIndex((st) => st.stage === 'feel') + 1;
  const wire = step.stage === 'structure' && s.wireframe;
  const applied = appliedCardId(s.project, step);
  const decision = s.project.decisions[step.id];
  const [replay, setReplay] = useState(0);

  const cards: Card[] = useMemo(() => {
    if (s.variations) {
      return [
        { id: 'as-it-was', label: 'As it was', what: 'The values these variations start from.' },
        ...s.variations.options.map((o) => ({ id: o.id, label: o.label, what: 'One small step away from “As it was”.' })),
      ];
    }
    const out: Card[] = step.options.map((o) => ({ id: o.id, label: o.label, what: o.what, chooseWhen: o.chooseWhen, risk: o.risk, exemplar: o.exemplar?.text, warn: o.warn?.text, focus: o.focus }));
    if (applied === CURRENT) {
      const origin = decision ? 'You set these values by hand.' : `These values come from ${directionName(s.project, s.generated)}.`;
      out.unshift({ id: CURRENT, label: 'Your design now', what: `${valueLabel(s.project, step)}. ${origin} They match none of the standard Options, so they have a card of their own.` });
    }
    return out;
  }, [s.variations, step, applied, decision, s.project, s.generated]);

  const shown = cards.find((c) => c.id === s.shownId) ?? cards[0]!;
  const shownParams = paramsForCard(s, shown.id);
  const focus: MockupFocus = s.region === 'auto' ? (shown.focus ?? step.focus) : s.region;
  const width = DEVICE_WIDTH[s.device];
  const thumbWidth = step.thumb?.width ?? width;
  const thumbRatio = step.thumb?.width ? (step.thumb.width < 600 ? 0.9 : 0.6) : THUMB_RATIO[s.device];
  const lookingAtApplied = !s.variations && shown.id === applied;

  const stateKey = JSON.stringify([s.project.params, s.project.content, s.project.a11y, step.id, s.variations?.round ?? -1, s.variations?.origin ?? null, wire, s.region]);
  const thumbs = useMemo(() => {
    const out: Record<string, string> = {};
    for (const card of cards) out[card.id] = mockupHtml(s.project, paramsForCard(s, card.id), { wireframe: wire, focus: s.region === 'auto' ? (card.focus ?? step.focus) : s.region, still: true }).html;
    return out;
  }, [stateKey, cards.length]);
  // Only the Motion Step plays the entrance; on every other Step the page stands still, so that a comparison is not blurred by a fade.
  const large = useMemo(() => mockupHtml(s.project, shownParams, { wireframe: wire, focus, still: step.id !== 'motion' }), [stateKey, shown.id, focus]);
  const clashes = useMemo(() => conflicts({ ...s.project, params: shownParams }).filter((c) => c.stepIds.includes(step.id)), [JSON.stringify(shownParams), step.id]);

  // Number keys flip between cards, as an optometrist flips lenses. Enter picks the card on show.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target) || useStudio.getState().confirmation) return;
      const target = event.target as HTMLElement | null;
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= 9) {
        const card = cardsRef.current[n - 1];
        if (!card) return;
        event.preventDefault();
        useStudio.getState().show(card.id);
        // Keyboard focus follows the card on show, so that only one card is marked.
        document.getElementById(`option-${card.id}`)?.focus();
      } else if (event.key === 'Enter' && (!target || target === document.body || target.id === 'main' || target.tagName === 'H1')) {
        event.preventDefault();
        useStudio.getState().decideAndContinue();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // When a Step opens, keyboard focus goes to the card on show. Tab then reaches the main button in one press.
  useEffect(() => {
    if (s.focusTick > 0) document.querySelector<HTMLElement>('.cards input[type="radio"]:checked')?.focus();
  }, [s.focusTick, step.id]);
  useEffect(() => {
    document.getElementById(`option-${s.shownId}`)?.closest('.option')?.scrollIntoView({ block: 'nearest' });
  }, [s.shownId]);

  const mainLabel = s.variations
    ? shown.id === 'as-it-was' ? 'Use it as it was and continue' : `Pick “${shown.label}” and continue`
    : lookingAtApplied
      ? decision ? 'Continue to the next Step' : applied === CURRENT ? 'Keep my design and continue' : `Keep “${shown.label}” and continue`
      : `Pick “${shown.label}” and continue`;
  const canPutBack = Boolean(decision) || step.owns.some((key) => s.project.params[key] !== s.project.base[key]);

  return (
    <div className="work">
      <Rail />
      <main className="stage" id="main" tabIndex={-1}>
        <div className="step-head">
          <p className="eyebrow">{STAGE_NAME[step.stage]} · Step {index + 1} of {STEPS.length} · {step.name}</p>
          <h1 id="step-title">{step.title}</h1>
          <p className="teach">{step.teach}</p>
          <details className="source">
            <summary>What changes on this Step, and where this guidance comes from</summary>
            <p><strong>The one thing that changes:</strong> {step.variable.toLowerCase()}. Everything else stays as it is.</p>
            <p><strong>How strong the guidance is:</strong> {EVIDENCE_LABEL[step.evidence]}. Reviewed on {step.reviewed}.</p>
            <ul>
              {step.sources.map((source) => <li key={source.text}>{source.text} <em>({BASIS_LABEL[source.basis]})</em></li>)}
            </ul>
          </details>
          {step.stage === 'structure' && s.wireframe && <p className="hint">Layout Steps show the page in gray, so that color does not distract you. Your colors return at Step {firstFeel}.</p>}
        </div>
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Width of the large preview">
            {DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>)}
          </div>
          <label className="inline-field">
            <span>Show this part of the page</span>
            <select id="preview-region" value={s.region} onChange={(e) => s.setRegion(e.target.value as MockupFocus | 'auto')}>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          {step.stage === 'structure' && (
            <label className="check">
              <input id="wireframe-toggle" type="checkbox" checked={s.wireframe} onChange={(e) => s.setWireframe(e.target.checked)} />
              <span>Show the layout only, in gray</span>
            </label>
          )}
          {step.id === 'motion' && <button type="button" className="btn small" onClick={() => setReplay((n) => n + 1)}>Play the entrance again</button>}
          <span className="showing" aria-live="polite">Large preview shows: <strong>{shown.label}</strong>{lookingAtApplied ? ' (in use)' : ' (not picked yet)'}</span>
        </div>
        <div className="preview-wrap">
          <button type="button" className="skip-preview" onClick={() => document.querySelector<HTMLElement>('.cards input[type="radio"]:checked')?.focus()}>
            Jump past the preview to the cards
          </button>
          <LargePreview html={large.html} width={width} replay={replay} title={`Large preview of the sample website: ${shown.label}`} />
        </div>
        {(shown.warn || large.issues.length > 0 || clashes.length > 0) && (
          <div className="notes" role="status">
            {shown.warn && <p className="note-warn"><strong>Overused look.</strong> {shown.warn}{lookingAtApplied && !decision && s.project.direction !== null ? ' Your Direction starts with this Option; you can keep it or pick another one here.' : ''}</p>}
            {clashes.map((c) => (
              <p key={c.id} className="note-conflict">
                <strong>These Decisions pull against each other.</strong> {c.message}{' '}
                {c.stepIds.filter((id) => id !== step.id).map((id) => <a key={id} href={`#${id}`}>Go to “{findStep(id)?.name}”</a>)}
              </p>
            ))}
            {large.issues.length > 0 && (
              <details>
                <summary>{large.issues.length === 1 ? '1 contrast note' : `${large.issues.length} contrast notes`} ({s.project.a11y === 'enforce' ? 'adjusted for you' : 'advice; nothing was changed'})</summary>
                <p>Contrast is how far apart two colors are in lightness, as a ratio. 1 to 1 means no difference; 21 to 1 is black on white. Reading text is usually easy to read from 4.5 to 1 upward.</p>
                <ul>{large.issues.map((i) => <li key={i.id}>{describeIssue(i)}</li>)}</ul>
                {s.project.a11y === 'advise' && <p>To fix a note, pick a darker or lighter color on the Step that sets it, or set “Contrast checks” to “Fix for me”.</p>}
                <p>The Studio does not check: {NOT_CHECKED.map((line) => line.replace(/\.$/, '')).join('; ').toLowerCase()}.</p>
              </details>
            )}
          </div>
        )}
      </main>
      <aside className="options" aria-label="Cards for this Step">
        <fieldset
          className="cards"
          aria-describedby="cards-hint"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
              e.preventDefault();
              s.decideAndContinue();
            }
          }}
        >
          <legend>
            {s.variations ? `${step.name}: small variations${s.variations.round > 0 ? `, finer (round ${s.variations.round + 1})` : ''}` : step.name}
          </legend>
          <p id="cards-hint" className="hint">
            <span className="hint-count">This Step has {cards.length} cards; scroll down if you do not see them all. </span>
            <span className="hint-keys">Click a card to see it large. Keys 1 to {Math.min(cards.length, 9)} do the same{cards.length > 9 ? '; the arrow keys reach every card' : ''}. Enter picks the card on show.</span>
            <span className="hint-touch">Tap a card to see it large. Then tap the main button to pick it.</span>
          </p>
          <section className="about" aria-live="polite">
            <h2>{shown.label}</h2>
            <p>{shown.what}</p>
            {shown.chooseWhen && <p><strong>Pick it when:</strong> {shown.chooseWhen}</p>}
            {shown.risk && shown.risk !== 'None in particular.' && <p><strong>Watch for:</strong> {shown.risk}</p>}
            {shown.exemplar && <p><strong>Where you can see it:</strong> {shown.exemplar}</p>}
          </section>
          {step.thumb?.note && <p className="hint">{step.thumb.note}</p>}
          <div className="tiles" data-device={step.thumb?.width ? 'detail' : s.device}>
            {cards.map((card, i) => {
              const isShown = shown.id === card.id;
              const params = paramsForCard(s, card.id);
              const inUse = !s.variations && card.id === applied;
              return (
                <label key={card.id} className="option" data-shown={isShown || undefined} data-in-use={inUse || undefined}>
                  <input id={`option-${card.id}`} type="radio" name="option" value={card.id} checked={isShown} onChange={() => s.show(card.id)} />
                  <Thumbnail html={thumbs[card.id] ?? ''} width={thumbWidth} ratio={thumbRatio} />
                  <span className="option-title">
                    {i < 9 && <kbd aria-hidden="true">{i + 1}</kbd>}
                    <span>{card.label}</span>
                  </span>
                  {COLOR_STEPS.has(step.id) && <Swatches params={params} profile={s.project.a11y} />}
                  {step.id === 'typeface' && (
                    <span className="specimen" aria-hidden="true">
                      <span style={{ fontFamily: FONTS[params.fontHeading].stack, fontWeight: 650 }}>Heading</span>
                      <span style={{ fontFamily: FONTS[params.fontBody].stack }}>and reading text</span>
                    </span>
                  )}
                  <span className="badges">
                    {inUse && <em className="badge in-use">In use ✓</em>}
                    {!s.variations && card.warn && <em className="badge warn">Overused look</em>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="actions sticky">
          <button type="button" className="btn primary" onClick={s.decideAndContinue}>{mainLabel}</button>
          {s.variations ? (
            <>
              <button type="button" className="btn" onClick={s.startVariations}>Show finer variations of “{shown.label}”</button>
              <button type="button" className="btn quiet" onClick={s.endVariations}>Back to the standard Options</button>
            </>
          ) : (
            <>
              {step.tunables && step.tunables.length > 0 && <button type="button" className="btn" onClick={s.startVariations}>Show small variations of “{shown.label}”</button>}
              {!decision && <button type="button" className="btn quiet" onClick={s.decideLater}>Decide later</button>}
              <button type="button" className="btn quiet" onClick={s.previousStep}>{index === 0 ? 'Back to the Directions' : 'Previous Step'}</button>
              {canPutBack && <button type="button" className="btn quiet" onClick={s.putBack}>Put this Step back to how the project started</button>}
            </>
          )}
        </div>
        {!s.variations && <ReasonField stepId={step.id} />}
        {!s.variations && step.tunables && step.tunables.length > 0 && (
          <details className="tune">
            <summary>Adjust with sliders</summary>
            <p className="hint">Each slider changes your design as it stands, one value at a time. The large preview follows. To go back, press Undo in the top bar.</p>
            {step.tunables.map((t) => {
              const value = s.project.params[t.key] as number;
              const ends = t.directions ?? (String(t.key).toLowerCase().includes('hue') ? ['around the', 'color wheel'] : ['less', 'more']);
              return (
                <label key={String(t.key)} className="slider">
                  <span className="slider-name">{t.label}</span>
                  <output htmlFor={`tune-${String(t.key)}`}>{sliderValue(t, value)}</output>
                  <input id={`tune-${String(t.key)}`} type="range" aria-label={t.label} aria-valuetext={sliderValue(t, value)} min={t.min} max={t.max} step={t.step} value={Math.min(value, t.max)} onChange={(e) => s.tuneValue(t.key, Number(e.target.value))} />
                  <span className="slider-ends" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></span>
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

/**
 * The file a kept copy downloads as: the kept text, character for character (finding S3-03). Only the file's name depends on
 * the content: ".json" when the text is a record (the Studio keeps projects in that form, and "Open a project file" accepts
 * such a file), ".txt" otherwise.
 */
function keptCopyFile(copy: KeptCopy, index: number): { name: string; text: string } {
  let record = false;
  try {
    const parsed: unknown = JSON.parse(copy.text);
    record = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
  } catch {
    // Not a record.
  }
  return { name: `refraction-kept-copy-${index + 1}.${record ? 'json' : 'txt'}`, text: copy.text };
}

function SummaryView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  const [message, setMessage] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const text = useMemo(() => JSON.stringify(s.project, null, 2), [s.project]);
  const html = useMemo(() => mockupHtml(s.project, s.project.params, { wireframe: false, focus: 'top', still: true }), [s.project]);
  const clashes = useMemo(() => conflicts(s.project), [s.project]);
  const decided = STEPS.filter((st) => s.project.decisions[st.id]).length;
  const [keptTick, setKeptTick] = useState(0);
  const [removing, setRemoving] = useState<KeptCopy | null>(null);
  // The list is read again after a notice, a save, or a removal.
  const keptCopies = useMemo(() => readBackups(), [s.notice, s.saved, keptTick]);
  const fileName = fileNameFor(s.project.name);

  const download = async (): Promise<void> => {
    const outcome = await saveFile(fileName, text);
    if (outcome === 'saved') setMessage(`The project file “${fileName}” was handed to your browser to save, usually into your Downloads folder. To continue later, open it here with “Open a project file”.`);
    else if (outcome === 'declined') setMessage('The download was cancelled. Nothing was saved to a file.');
    else {
      setShowText(true);
      setMessage('This page cannot hand over files here. Copy the project text below and keep it in a text file instead.');
    }
  };
  const copy = async (): Promise<void> => {
    const ok = await copyText(text);
    setShowText(!ok);
    setMessage(ok ? 'The project was copied as text. Paste it into a text file to keep it; it is the same content as the project file.' : 'Copying is blocked here. Select the text below and copy it by hand.');
  };
  const open = (file: File | undefined): void => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setMessage('That file was not opened: it is far larger than any project file. Your open project is unchanged.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let data: unknown;
      try {
        data = JSON.parse(String(reader.result));
      } catch {
        setMessage('That file was not opened. It is not a Refraction project file. Your open project is unchanged.');
        return;
      }
      const error = s.requestImport(data, file.name);
      setMessage(error ? `That file was not opened. ${error} Your open project is unchanged.` : null);
    };
    reader.readAsText(file);
  };

  return (
    <main className="summary" id="main" tabIndex={-1}>
      <div className="summary-main">
        <p className="eyebrow">Summary</p>
        <h1 ref={heading} tabIndex={-1}>Your Decisions, read back</h1>
        <p className="teach">
          You have decided {decided} of {STEPS.length} Steps. This project started from {directionName(s.project, s.generated)}; a Step you have not decided keeps the value it started with.
        </p>
        <p className="teach">
          <strong>What works today:</strong> you can download the project file and open it here later. <strong>What does not exist yet:</strong> the instructions for an AI coding tool, the files of exact design values, and the reference page. They arrive in a later version of the Studio.
        </p>
        <section aria-labelledby="file-heading">
          <h2 id="file-heading">Project file</h2>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => void download()}>Download the project file</button>
            <button type="button" className="btn" onClick={() => void copy()}>Copy the project as text</button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Open a project file</button>
            <input ref={fileRef} id="project-file" type="file" accept=".json,application/json" hidden onChange={(e) => { open(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          {message && <p className="note" role="status">{message}</p>}
          {keptCopies.length > 0 && (
            <div className="kept-copies">
              <h3>Copies the Studio kept for you</h3>
              <p className="note">The Studio keeps a copy whenever it is about to replace saved work, or cannot read it. A kept copy stays here until you remove it.</p>
              <ul>
                {keptCopies.map((copy, index) => (
                  <li key={`${copy.keptAt}-${index}`}>
                    <span>{copy.why}{copy.keptAt ? ` Kept on ${copy.keptAt.slice(0, 10)} at ${copy.keptAt.slice(11, 16)} (UTC).` : ''}</span>
                    <span className="button-row">
                      <button type="button" className="btn quiet" onClick={() => { const file = keptCopyFile(copy, index); void saveFile(file.name, file.text); }}>Download this kept copy</button>
                      {removing === copy ? (
                        <>
                          <button type="button" className="btn quiet" onClick={() => { removeBackup(copy); setRemoving(null); setKeptTick((n) => n + 1); }}>Yes, remove it for good</button>
                          <button type="button" className="btn quiet" onClick={() => setRemoving(null)}>No, keep it</button>
                        </>
                      ) : (
                        <button type="button" className="btn quiet" onClick={() => setRemoving(copy)}>Remove this kept copy…</button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showText && <textarea id="project-text" className="project-text" readOnly value={text} aria-label="The project as text" onFocus={(e) => e.target.select()} />}
        </section>
        <section aria-labelledby="decisions-heading">
          <h2 id="decisions-heading">Every Step and its value</h2>
          <ol className="decision-list">
            {STEPS.map((st, i) => {
              const status = stepStatus(s, st);
              const reason = s.project.decisions[st.id]?.reason;
              return (
                <li key={st.id}>
                  <a href={`#${st.id}`}>
                    <span className="dot" data-state={status.state} aria-hidden="true" />
                    <span className="rail-text"><span>{i + 1}. {st.name}</span><small>{status.text}{reason ? ` Why: ${reason}` : ''}</small></span>
                    <span className="change">Change</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
        {(clashes.length > 0 || html.issues.length > 0) && (
          <section className="notes" aria-labelledby="notes-heading">
            <h2 id="notes-heading">Notes on this design</h2>
            {clashes.map((c) => (
              <p key={c.id} className="note-conflict">{c.message} {c.stepIds.map((id) => <a key={id} href={`#${id}`}>Go to “{findStep(id)?.name}” </a>)}</p>
            ))}
            {html.issues.length > 0 && (
              <>
                <p>Contrast notes ({s.project.a11y === 'enforce' ? 'adjusted for you' : 'advice; nothing was changed'}). Contrast is how far apart two colors are in lightness, as a ratio; reading text is usually easy to read from 4.5 to 1 upward.</p>
                <ul>{html.issues.map((i) => <li key={i.id}>{describeIssue(i)}</li>)}</ul>
                <p>The Studio does not check: {NOT_CHECKED.map((line) => line.replace(/\.$/, '')).join('; ').toLowerCase()}.</p>
              </>
            )}
          </section>
        )}
        <section aria-labelledby="look-heading">
          <h2 id="look-heading">The Studio’s own look</h2>
          <label className="check">
            <input id="studio-look" type="checkbox" checked={s.studioLook === 'project'} onChange={(e) => s.setStudioLook(e.target.checked ? 'project' : 'studio')} />
            <span>Dress the Studio itself in this design’s colors, letter styles, and corner shapes</span>
          </label>
        </section>
        <section aria-labelledby="over-heading">
          <h2 id="over-heading">Start over</h2>
          <button type="button" className="btn quiet" onClick={s.requestStartOver}>Start a new project…</button>
        </section>
        <p className="hint"><a href="#licences">Licences of the fonts and code inside the Studio</a></p>
      </div>
      <aside className="summary-side" aria-label="Your design as a picture">
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Width of the large preview">
            {DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>)}
          </div>
        </div>
        <LargePreview html={html.html} width={DEVICE_WIDTH[s.device]} title="Large preview of the sample website in your design" />
      </aside>
    </main>
  );
}

// ───────── Licences ─────────

function LicencesView(): React.JSX.Element {
  const heading = useHeadingFocus();
  return (
    <main className="licences" id="main" tabIndex={-1}>
      <p className="eyebrow">Licences</p>
      <h1 ref={heading} tabIndex={-1}>The work of other people inside the Studio</h1>
      <p className="teach">The Studio’s page carries {NOTICES.filter((n) => n.kind === 'font').length} font files and {NOTICES.filter((n) => n.kind === 'code').length} code packages that other people made. Their licences ask that the copyright notice and the licence text travel with every copy, so both are shown here in full.</p>
      <p><a href="#summary">Back to the Summary</a></p>
      <ul className="notice-list">
        {NOTICES.map((n) => (
          <li key={n.name}>
            <h3>{n.name}, version {n.version}</h3>
            <p>Licence: {n.license}. Source: {n.repository}</p>
            {n.copyright.map((line) => <p key={line}>{line}</p>)}
            {n.reservedFontNames.length > 0 && <p>This font reserves the name {n.reservedFontNames.join(', ')}.</p>}
          </li>
        ))}
      </ul>
      {Object.entries(LICENSE_TEXTS).map(([id, body]) => (
        <section key={id} aria-labelledby={`licence-${id}`}>
          <h2 id={`licence-${id}`}>Full text: {id}</h2>
          {id === 'MIT' && <p className="hint">The line “{MIT_COPYRIGHT_PLACEHOLDER}” stands where each package’s own copyright notice goes; the list above gives each notice.</p>}
          <pre className="licence-text" tabIndex={0}>{body}</pre>
        </section>
      ))}
    </main>
  );
}

// ───────── App ─────────

/** If a screen fails, the owner still gets a way to keep the project (finding SEC-14). */
class ScreenBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  override render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    const project = useStudio.getState().project;
    return (
      <main className="directions" id="main" tabIndex={-1}>
        <h1>This screen ran into a fault</h1>
        <p className="teach">Your project is still held by the page. Download it first; then reload the Studio.</p>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => void saveFile(fileNameFor(project.name), JSON.stringify(project, null, 2))}>Download the project file</button>
          <button type="button" className="btn" onClick={() => window.location.reload()}>Reload the Studio</button>
        </div>
      </main>
    );
  }
}

export function App(): React.JSX.Element {
  const ready = useStudio((s) => s.ready);
  const view = useStudio((s) => s.view);
  const look = useStudio((s) => s.studioLook);
  const params = useStudio((s) => s.project.params);
  const [previewsWork, setPreviewsWork] = useState<boolean | null>(null);

  useEffect(() => {
    installSpecimenFonts();
    void useStudio.getState().init();
    void probePreviews().then(setPreviewsWork);
    const onKey = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z' && !isTyping(event.target)) {
        event.preventDefault();
        useStudio.getState().undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (look === 'project') applyStudioTheme(params, false);
    else applyStudioTheme(STUDIO_PARAMS, true);
  }, [look, params]);

  return (
    <div className="app">
      <button type="button" className="skip" onClick={() => document.getElementById('main')?.focus()}>Go to the main content</button>
      <TopBar />
      <NoticeBar />
      {previewsWork === false && (
        <div className="banner" role="alert"><p>This page is not allowed to show the embedded pictures of the sample website, so they will be blank. Tell Claude: “the previews are blocked.”</p></div>
      )}
      <ScreenBoundary key={view}>
        {!ready ? <main className="loading" id="main" tabIndex={-1}><p>Opening your project…</p></main> : view === 'directions' ? <DirectionsView /> : view === 'summary' ? <SummaryView /> : view === 'licences' ? <LicencesView /> : <StepsView />}
      </ScreenBoundary>
      <ConfirmDialog />
    </div>
  );
}
