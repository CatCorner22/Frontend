import {
  DIRECTION_GROUPS, DIRECTIONS, FONTS, NOT_CHECKED, OVERLAYS, OWN_NAME_MAX, OWN_TEXT_MAX, PRESCRIPTION_FILES, STEPS, activeTunables, isSampleContent, plainName, sampleTextsLeft, zipFiles, BRIEF_KEYS, BRIEF_MAX, ITEM_LIMITS, LIST_LIMITS, NAV_WORD_MAX, REQUIRED_TEXTS, SAMPLE_CONTENT, TEXT_LIMITS, canAddContentItem, canRemoveContentItem, emphasisIsInHeadline, asDirection, conflicts, craftReport, findDirection, writePrescription, ownDirectionsFile, findOverlay, findSkin, findStep, heldOptionId, matchingOptionId, nearestSliderValue, nextSliderValue, overlaysOf, researchReport, resolvePatch, startDeparture, skinParams, skinsOf, toCss,
  type A11yProfile, type BriefKey, type ContentList, type ContentTextKey, type DesignParams, type Direction, type FontId, type MockupFocus, type PrescriptionFile, type Project, type SourceRef, type Step, type TokenIssue, type Tunable,
} from '@refraction/core';
import { Component, Fragment, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { LICENSE_TEXTS, MIT_COPYRIGHT_PLACEHOLDER, NOTICES } from './notices.generated';
import { fontFaceCss } from './fonts';
import { copyText, fileNameFor, loadOwnDirections, probePreviews, readBackups, removeBackup, saveFile, storedProjectText, type KeptCopy } from './platform';
import { LargePreview, Thumbnail, mockupHtml, tokensFor } from './preview';
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
  held: 'Not saving: see the notice at the top of the page',
};
const PROFILE_MEANING: Record<A11yProfile, string> = {
  off: 'Off: no contrast notes are shown.',
  advise: 'Warn me: the Studio notes colors that are hard to tell apart, and changes nothing.',
  enforce: 'Fix for me: the Studio adjusts colors that are hard to tell apart, and lists each change.',
};
const HUE_NAMES: [number, string][] = [[25, 'red'], [55, 'orange'], [95, 'yellow'], [140, 'green'], [195, 'teal'], [258, 'blue'], [298, 'violet'], [345, 'pink']];
const hueName = (hue: number): string => HUE_NAMES.reduce((best, entry) => (Math.min(Math.abs(hue - entry[0]), 360 - Math.abs(hue - entry[0])) < Math.min(Math.abs(hue - best[0]), 360 - Math.abs(hue - best[0])) ? entry : best))[1];

/** The value of one slider, in words a person can picture. */
/** The colors that a slider meets on its way around the color wheel, in order. */
const WHEEL = [0, 60, 120, 180, 240, 300].map(hueName).filter((name, i, all) => name !== all[i - 1]);

function sliderValue(t: Tunable, raw: number): string {
  if (String(t.key).toLowerCase().includes('hue')) return `${Math.round(raw)}° (${hueName(raw)})`;
  if (t.key === 'radius' && raw > t.max) return 'fully round';
  // The text states the value that the design holds. Where the slider's range is narrowed to the part that changes the
  // picture, a value beyond its end is drawn like the end, and the text says so (it used to state the end as the value).
  const stated = `${Number(raw.toFixed(3))}${t.unit ?? ''}`;
  if (raw > t.max || raw < t.min) return `${stated} (drawn like ${Number((raw > t.max ? t.max : t.min).toFixed(3))}${t.unit ?? ''} on this page)`;
  return stated;
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

/**
 * How one slider's hand-set value differs from the value of the nearest standard Option, in words, with the figure in brackets.
 * Null when the slider stands where that Option puts it.
 */
function movedFrom(t: Tunable, value: number, optionValue: unknown): string | null {
  const name = t.label.toLowerCase().replace(/ \([^)]*\)/, '');
  if (String(t.key).toLowerCase().includes('hue')) {
    if (typeof optionValue === 'number' && Math.min(Math.abs(value - optionValue), 360 - Math.abs(value - optionValue)) < 0.5) return null;
    return `${name} moved toward ${hueName(value)} (${Math.round(value)}° on the color wheel)`;
  }
  const figure = `${Number(Math.min(value, t.max).toFixed(3))}${t.unit ?? ''}`;
  if (typeof optionValue !== 'number') return `${name} ${figure}`;
  const gap = value - optionValue;
  if (Math.abs(gap) < t.step / 2) return null;
  const words = t.directions ?? ['less', 'more'];
  return `${name} ${Math.abs(gap) / (t.max - t.min) < 0.12 ? 'a little' : 'clearly'} ${gap < 0 ? words[0] : words[1]} (${figure})`;
}

/** The current value of a Step, in words: the matching Option's name, or the hand-set values. */
function valueLabel(project: Project, step: Step): string {
  const held = heldOptionId(project, step);
  if (held) return step.options.find((o) => o.id === held)!.label;
  // The design matches an Option whose second color follows the main color, and does not hold it: its own second color is a
  // fixed one, and the match ends at the next change of the main color. The words say what stays, and do not name the design
  // by that Option (campaign 4, finding F-24; the owner's decision D55).
  const chance = step.options.find((o) => o.id === matchingOptionId(project.params, step));
  const fixed = chance?.derive ? step.tunables?.find((t) => t.key === chance.derive!.key) : undefined;
  if (chance && fixed) {
    const value = project.params[fixed.key] as number;
    return `close to “${chance.label}”: ${fixed.label.toLowerCase()} stays ${hueName(value)} (${Math.round(value)}° on the color wheel) and does not follow the main color`;
  }
  if (step.tunables?.length) {
    // Words first, figures second: a hand-set design is named by the standard Option it lies nearest to, and each slider
    // that differs says in which direction and how far (findings U2-04, U3-03, U3-04).
    const near = nearestOption(project.params, step);
    const nearValues = near ? (resolvePatch(near, project.params) as Record<string, unknown>) : {};
    const moved = activeTunables(step, project.params)
      .map((t) => movedFrom(t, project.params[t.key] as number, nearValues[t.key]))
      .filter((words): words is string => words !== null);
    if (near) return moved.length > 0 ? `close to “${near.label}”: ${moved.join('; ')}` : `close to “${near.label}”`;
    return moved.join('; ');
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
  return { state: 'tuned', text: `Set by hand, ${value}` };
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
        {/* Until the saved project is open, the field shows a placeholder project; typing into it then would be typing into nothing. */}
        <input id="project-name" className="name" value={s.project.name} placeholder="Name this project" disabled={!s.ready} onChange={(e) => s.rename(e.target.value)} spellCheck={false} autoComplete="off" maxLength={120} />
      </label>
      <nav className="top-nav" aria-label="Parts of the Studio">
        <a href="#directions" aria-current={s.view === 'directions' ? 'page' : undefined}>1. Directions</a>
        <a href={`#${s.stepId}`} aria-current={s.view === 'steps' ? 'page' : undefined}>2. Steps</a>
        <a href="#overlays" aria-current={s.view === 'overlays' ? 'page' : undefined}>3. Overlays</a>
        <a href="#summary" aria-current={s.view === 'summary' ? 'page' : undefined}>4. Summary</a>
        <a href="#content" aria-current={s.view === 'content' ? 'page' : undefined}>Your content</a>
      </nav>
      <div className="profile">
        <label htmlFor="a11y-profile">Contrast checks</label>
        <select id="a11y-profile" value={s.project.a11y} aria-describedby="a11y-meaning" disabled={!s.ready} onChange={(e) => s.setProfile(e.target.value as A11yProfile)}>
          <option value="off">Off</option>
          <option value="advise">Warn me</option>
          <option value="enforce">Fix for me</option>
        </select>
        <span id="a11y-meaning" className="profile-meaning">{PROFILE_MEANING[s.project.a11y]}</span>
      </div>
      {/* The button and the line that says what the next Undo takes back stay together, also when the bar wraps (finding U6-23). */}
      <div className="undo-group">
        <button type="button" className="btn small" disabled={s.history.length === 0} aria-describedby="undo-says" onClick={s.undo}>Undo</button>
        <span id="undo-says" className="undo-says">{s.undoPreview()}</span>
      </div>
      <span className="save-state" role="status">{SAVE_LABEL[s.saved]}</span>
      {/* After a failed save the Studio tries again at the next change. This button lets the owner try at once, for example after making room. */}
      {s.saved === 'failed' && <button type="button" className="btn small" onClick={s.saveAgain}>Try to save again</button>}
    </header>
  );
}

/** True while a slider key is down together with Alt, Ctrl, or the command key. */
let modifiedSliderKey = false;
/** How many grid points each key moves a slider. Home and End go to the ends. */
const SLIDER_KEYS: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10, Home: -Infinity, End: Infinity };

let noticesShown = 0;
/**
 * Run a notice's action. If the pressed button is gone afterwards (most actions take their notice away), keyboard focus would
 * rest on nothing; it goes to the main part of the page instead (code review of 2026-11-13, finding "screen 5").
 */
function pressed(run: () => void): void {
  run();
  window.setTimeout(() => {
    if (!document.activeElement || document.activeElement === document.body) document.getElementById('main')?.focus();
  }, 0);
}

function NoticeBar(): React.JSX.Element | null {
  const notice = useStudio((s) => s.notice);
  const hold = useStudio((s) => s.hold);
  const dismiss = useStudio((s) => s.dismissNotice);
  // Each new notice gets a number, also when its words equal those of the notice before (two Undo steps on one Step say the
  // same sentence). The paragraph is then put on the page afresh, so that a screen reader announces it again ("screen 8").
  const number = useMemo(() => ++noticesShown, [notice]);
  // On a small window the notices have a strip of limited height that scrolls by itself. A new notice below a long standing
  // one was then cut through the middle, with its buttons out of sight (campaign 4, round 3). The strip brings each new
  // notice into view, and it is a keyboard stop with a name, so that its scrolling can be found and used.
  const strip = useRef<HTMLDivElement | null>(null);
  const newest = useRef<HTMLDivElement | null>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const bring = (): void => {
      const overflows = el.scrollHeight > el.clientHeight + 1;
      setScrolls(overflows);
      if (overflows && newest.current) el.scrollTop = Math.max(0, newest.current.offsetTop + newest.current.offsetHeight - el.clientHeight);
    };
    bring();
    // The strip's own look changes once it is known to scroll (a scrollbar and a border take room), and the window can
    // change size: the text then wraps anew, and the newest notice is brought into view again. Without this, its last
    // button could end a few pixels below the visible part (seen on the CI machine, 2026-11-14).
    const observer = new ResizeObserver(bring);
    observer.observe(el);
    for (const row of Array.from(el.children)) observer.observe(row);
    return () => observer.disconnect();
  }, [number, hold, notice, scrolls]);
  if (!notice && !hold) return null;
  return (
    <div className="banners" ref={strip} data-scrolls={scrolls || undefined} {...(scrolls ? { tabIndex: 0, role: 'group', 'aria-label': 'Notices (this strip scrolls)' } : {})}>
      {/* A notice that needs a decision has its own row. It has no "Dismiss", and no other notice replaces it. */}
      {hold && (
        <div className="banner hold" role={hold.urgent ? 'alert' : 'status'}>
          <p>{hold.text}</p>
          <div className="banner-actions">
            {hold.actions?.map((action) => <button key={action.label} type="button" className="btn small" onClick={() => pressed(action.run)}>{action.label}</button>)}
          </div>
        </div>
      )}
      {notice && (
        <div className="banner" ref={newest} role={notice.urgent ? 'alert' : 'status'}>
          <p key={number}>{notice.text}</p>
          <div className="banner-actions">
            {notice.actions?.map((action) => <button key={action.label} type="button" className="btn small" onClick={() => pressed(action.run)}>{action.label}</button>)}
            <button type="button" className="btn small quiet" onClick={() => pressed(dismiss)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog(): React.JSX.Element | null {
  const confirmation = useStudio((s) => s.confirmation);
  const answer = useStudio((s) => s.answerConfirmation);
  const ref = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (confirmation && dialog && !dialog.open) dialog.showModal();
  }, [confirmation]);
  if (!confirmation) return null;
  // The dialog is closed before the answer takes it off the page. A browser returns keyboard focus to the button that opened
  // a dialog only when the dialog is closed; taken off the page while open, it left focus on nothing (code review, "screen 5").
  const reply = (yes: boolean): void => {
    ref.current?.close();
    answer(yes);
  };
  return (
    <dialog ref={ref} className="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-body" onCancel={(e) => { e.preventDefault(); reply(false); }}>
      <h2 id="confirm-title">{confirmation.title}</h2>
      <p id="confirm-body">{confirmation.body}</p>
      <div className="actions">
        <button type="button" className="btn" autoFocus onClick={() => reply(false)}>{confirmation.cancelLabel}</button>
        <button type="button" className={confirmation.danger ? 'btn danger' : 'btn primary'} onClick={() => reply(true)}>{confirmation.confirmLabel}</button>
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

/** The two colors of a skin's chip: the main color as the Direction would draw it in that skin, and the far end of its fade or its second color. */
function chipColors(direction: Direction, skinId: string | null): [string, string] {
  const skin = skinId === null ? undefined : findSkin(skinId);
  const p = skin ? skinParams(direction, skin) : direction.params;
  const main = toCss({ l: p.accentLightness, c: p.accentChroma, h: p.accentHue });
  const second = p.colorStrategy === 'duo' ? toCss({ l: p.accentLightness, c: p.accentChroma, h: p.accent2Hue }) : main;
  return [main, second];
}

/** Rename and remove, on the card of a Direction of the owner's own. */
function OwnCardActions({ id, name }: { id: string; name: string }): React.JSX.Element {
  const rename = useStudio((s) => s.renameOwnDirection);
  const remove = useStudio((s) => s.requestRemoveOwnDirection);
  // `null`: the name is not being changed.
  const [draft, setDraft] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const fieldId = `rename-${id}`;
  if (draft === null) {
    return (
      <div className="button-row">
        <button type="button" className="btn small quiet" onClick={() => { setDraft(name); setRefusal(null); }}>Rename</button>
        <button type="button" className="btn small quiet" onClick={() => remove(id)}>Remove</button>
      </div>
    );
  }
  const save = (event: React.FormEvent): void => {
    event.preventDefault();
    const error = rename(id, draft);
    setRefusal(error);
    if (error === null) setDraft(null);
  };
  return (
    <form className="own-form" onSubmit={save}>
      <label htmlFor={fieldId}>New name for “{name}”</label>
      <input id={fieldId} className="name" maxLength={OWN_NAME_MAX} value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
      {refusal && <p className="note" role="alert">{refusal}</p>}
      <div className="button-row">
        <button type="submit" className="btn small">Save the name</button>
        <button type="button" className="btn small quiet" onClick={() => setDraft(null)}>Cancel</button>
      </div>
    </form>
  );
}

function DirectionCard({ direction, own = false }: { direction: Direction; own?: boolean }): React.JSX.Element {
  const project = useStudio((s) => s.project);
  const request = useStudio((s) => s.requestDirection);
  const skins = skinsOf(direction);
  // `null`: the Direction's own colors. A skin changes colors only; the Direction's layout, letters, and shapes stay.
  const [skinId, setSkinId] = useState<string | null>(null);
  const skin = skinId === null ? undefined : findSkin(skinId);
  const params = useMemo(() => (skin ? skinParams(direction, skin) : direction.params), [direction, skin]);
  // A card keeps the sample practice whatever the owner's own texts are: from card to card only the design may differ.
  const html = useMemo(() => mockupHtml({ ...project, content: SAMPLE_CONTENT }, params, { wireframe: false, focus: 'top', still: true }).html, [project.a11y, params]);
  const twoColors = direction.params.colorStrategy === 'duo';
  // What the contrast checks would note on this start under "Warn me", whatever the open project's own setting.
  const notes = useMemo(() => tokensFor(params, 'advise').issues, [params]);
  return (
    <article className="direction" aria-labelledby={`direction-${direction.id}`}>
      <div className="direction-body">
        <h3 id={`direction-${direction.id}`}>{direction.name}</h3>
        <p className="mood">{direction.mood}</p>
      </div>
      <Thumbnail html={html} width={1280} ratio={0.64} />
      <div className="direction-body">
        {skins.length > 0 && (
          <fieldset className="skins">
            <legend>Skin (the same look in other colors)</legend>
            <div className="skin-row">
              {[null, ...skins.map((s) => s.id)].map((id) => {
                const [main, second] = chipColors(direction, id);
                const name = id === null ? 'As designed' : findSkin(id)!.name;
                return (
                  <label key={id ?? 'own'} className="skin" data-picked={skinId === id || undefined}>
                    <input type="radio" name={`skin-${direction.id}`} checked={skinId === id} onChange={() => setSkinId(id)} />
                    <span className="skin-chip" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${main} 50%, ${second} 50%)` }} />
                    <span>{name}</span>
                  </label>
                );
              })}
            </div>
            <p className="hint">{skin ? skin.what : 'The colors this Direction was composed with.'}</p>
            <p className="hint">A Skin sets which color. How light and how vivid the color is stays as this Direction has it, and the color shows most in buttons, links, and bands.{twoColors ? ' A chip with two colors: this Direction has a second color, and it moves around the color wheel together with the first.' : ''} You choose a Skin here, at the start; later you change colors on the color Steps.</p>
          </fieldset>
        )}
        <dl>
          {direction.bestFor && <div><dt>Best for</dt><dd>{direction.bestFor}</dd></div>}
          {direction.risk && <div><dt>Watch for</dt><dd>{direction.risk}</dd></div>}
        </dl>
        {notes.length > 0 && (
          <p className="hint starts-noted">
            Starts with {notes.length === 1 ? '1 contrast note' : `${notes.length} contrast notes`} under “Warn me”: {notes.map((issue) => issue.pair).join('; ')}. “Fix for me” adjusts these colors; “Warn me” and “Off” leave the look as it is.
          </p>
        )}
        {own && <p className="hint">Your own; no source, not reviewed.</p>}
        {own && <OwnCardActions id={direction.id} name={direction.name} />}
        <button type="button" className="btn primary" onClick={() => request(skin ? { ...direction, params } : direction, skin)}>Start from {direction.name}</button>
      </div>
    </article>
  );
}

function DirectionsView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  const started = s.project.direction !== null || Object.keys(s.project.decisions).length > 0;
  // Decided once, when the screen opens: a later change of the window's width does not close a group that the person opened.
  const [wide] = useState(() => window.innerWidth >= 700);
  const openGroup = (id: string): void => {
    const group = document.getElementById(`group-${id}`) as HTMLDetailsElement | null;
    if (!group) return;
    group.open = true;
    group.scrollIntoView({ block: 'start' });
    group.querySelector<HTMLElement>('summary')?.focus();
  };
  return (
    <main className="directions" id="main" tabIndex={-1}>
      <div className="intro">
        <p className="eyebrow">Start here</p>
        <h1 ref={heading} tabIndex={-1}>Pick a Direction: a complete starting look</h1>
        <p className="teach">
          The Studio helps you decide how a website looks and feels, one small decision at a time. Today you leave with a project file that holds your Decisions, and with the Prescription: seven files that an AI coding tool builds your page from. You find both on the Summary.
        </p>
        <p className="teach">
          First pick a Direction below. Then {STEPS.length} short Steps let you change one thing at a time, like an eye exam: “which is better, 1 or 2?” You can stop at any point; the line under the top bar says whether your work is saved.
        </p>
        <p className="teach">Every picture shows the same made-up dental practice, so that only the design differs. It is a sample; it is not your content. To put in your own words, open <a href="#content">Your content</a> at any time. The cards below keep the sample, so that only the design differs from card to card; every other preview then shows your words.</p>
        {started && <p className="note">You already have a project, started from {directionName(s.project, s)}. If you start from another Direction, the Studio asks first, and you can undo it.</p>}
      </div>
      {/* The Directions stand in groups, each under a plain heading. On a wide window every group is open; on a narrow one
          only the first is, so that the person meets four headings and not thirty-five cards in a row. */}
      <nav className="group-links" aria-label="Groups of Directions">
        {DIRECTION_GROUPS.map((g) => <a key={g.id} href={`#group-${g.id}`} onClick={(e) => { e.preventDefault(); openGroup(g.id); }}>{g.label} ({DIRECTIONS.filter((d) => d.group === g.id).length})</a>)}
        {s.own.length > 0 && <a href="#group-own" onClick={(e) => { e.preventDefault(); openGroup('own'); }}>Your own ({s.own.length})</a>}
      </nav>
      {DIRECTION_GROUPS.map((g, i) => (
        <details key={g.id} id={`group-${g.id}`} className="direction-group" open={wide || i === 0 || undefined}>
          <summary><h2>{g.label}</h2><span>{DIRECTIONS.filter((d) => d.group === g.id).length} Directions</span></summary>
          <div className="direction-grid">
            {DIRECTIONS.filter((d) => d.group === g.id).map((d) => <DirectionCard key={d.id} direction={d} />)}
          </div>
        </details>
      ))}
      {s.own.length > 0 && (
        <details id="group-own" className="direction-group" open>
          <summary><h2>Your own</h2><span>{s.own.length === 1 ? '1 Direction' : `${s.own.length} Directions`}</span></summary>
          <div className="direction-grid">
            {s.own.map((d) => <DirectionCard key={d.id} direction={asDirection(d)} own />)}
          </div>
        </details>
      )}
      {s.generated.length > 0 && (
        <details id="group-generated" className="direction-group" open>
          <summary><h2>Composed at random</h2><span>{s.generated.length} Directions</span></summary>
          <div className="direction-grid">
            {s.generated.map((d) => <DirectionCard key={d.id} direction={d} />)}
          </div>
        </details>
      )}
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
  const hex = tokensFor(params, profile).hex;
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
      {/* One link of the list takes the Tab key: the current Step, the Overlays link on the Overlays screen, or else this one. */}
      <a className="rail-direction" href="#directions" tabIndex={tab(s.view !== 'steps' && s.view !== 'overlays')}>
        <span>Started from</span>
        <strong>{directionName(s.project, s)}</strong>
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
      <a className="rail-summary" href="#overlays" aria-current={s.view === 'overlays' ? 'page' : undefined} tabIndex={tab(s.view === 'overlays')}>Overlays: small helpers over the page</a>
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

/** The field for one Decision's reason. On the Summary, `fieldId` gives each Step's field its own id and `brief` leaves out the long note. */
/** What the screens say about the page's texts: all the sample's, all the owner's, or a mix (finding U7-01). */
function contentStatus(content: Project['content'], page: boolean): string {
  if (isSampleContent(content)) return page ? 'The page still shows the sample dental practice.' : 'The previews still show the sample dental practice.';
  const { names, total } = sampleTextsLeft(content);
  if (names.length === 0) return page ? 'The page shows your own texts.' : 'The previews show your own texts.';
  return `${page ? 'The page shows your texts' : 'The previews show your texts'}, but ${String(names.length)} of ${String(total)} texts are still the sample dental practice’s words${page ? `: ${names.join(', ')}` : ''}.`;
}

function ReasonField({ stepId, fieldId = 'decision-reason', brief = false }: { stepId: string; fieldId?: string; brief?: boolean }): React.JSX.Element | null {
  const decision = useStudio((s) => s.project.decisions[stepId]);
  const save = useStudio((s) => s.setReason);
  const stored = decision?.reason ?? '';
  const [text, setText] = useState(stored);
  const typed = useRef(text);
  typed.current = text;
  // The stored reason changed from elsewhere (Undo, an opened file): show it. While the owner types, the stored reason is
  // the typed text without its outer spaces, and the field keeps what was typed.
  useEffect(() => {
    if (stored !== typed.current.trim()) setText(stored);
  }, [stored]);
  if (!decision) return null;
  return (
    <label className="reason">
      <span>Why this choice? (optional)</span>
      {/* Each typed letter is stored at once, on the Step it was typed for. The field used to store its text only when it
          lost keyboard focus: Enter, a reload, or the browser's Back button then lost the text, and Back could even store it
          on another Step (code review of 2026-11-13, findings "screen 4" and "gaps 0"). */}
      <input id={fieldId} type="text" value={text} maxLength={280} placeholder="For example: most of our visitors come to book" onChange={(e) => { setText(e.target.value); save(stepId, e.target.value); }} />
      {brief
        ? <small>Saved with the project, and written word for word into PRESCRIPTION.md.</small>
        : <small>Your reason belongs to this choice. If you later pick another Option on this Step, the Studio removes the reason, tells you, and offers to put it back. The reason is saved with the project and goes, word for word, into PRESCRIPTION.md, the file that an AI coding tool reads. Write nothing here that you want to keep to yourself.</small>}
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
        { id: 'as-it-was', label: 'Starting point', what: 'The values these small variations start from.' },
        ...s.variations.options.map((o) => ({ id: o.id, label: o.label, what: 'One small step away from the starting point.' })),
      ];
    }
    const out: Card[] = step.options.map((o) => ({ id: o.id, label: o.label, what: o.what, chooseWhen: o.chooseWhen, risk: o.risk, exemplar: o.exemplar?.text, warn: o.warn?.text, focus: o.focus }));
    if (applied === CURRENT) {
      const origin = decision ? 'You set these values by hand.' : `These values come from ${directionName(s.project, s)}.`;
      out.unshift({ id: CURRENT, label: 'Your design now', what: `${valueLabel(s.project, step)}. ${origin} They match none of the standard Options, so they have a card of their own.` });
    }
    return out;
  }, [s.variations, step, applied, decision, s.project, s.generated]);

  const shown = cards.find((c) => c.id === s.shownId) ?? cards[0]!;
  const shownParams = paramsForCard(s, shown.id);
  const focus: MockupFocus = s.region === 'auto' ? (shown.focus ?? step.focus) : s.region;
  const width = DEVICE_WIDTH[s.device];
  // A change of the preview width makes every picture lay its page out again. The large preview and the pressed button answer
  // at once; the cards' pictures follow at lower priority. Together, in one go, they held the page for 70 to 110 milliseconds
  // on a Step with 14 cards, and the person saw nothing change for that time (measured 2026-11-14).
  const cardsDevice = useDeferredValue(s.device);
  const thumbWidth = step.thumb?.width ?? DEVICE_WIDTH[cardsDevice];
  const thumbRatio = step.thumb?.focus ? 0.7 : step.thumb?.width ? (step.thumb.width < 600 ? 0.9 : 0.6) : THUMB_RATIO[cardsDevice];
  const lookingAtApplied = !s.variations && shown.id === applied;
  const sliders = activeTunables(step, s.project.params);

  const stateKey = JSON.stringify([s.project.params, s.project.content, s.project.a11y, step.id, s.variations?.round ?? -1, s.variations?.origin ?? null, wire, s.region]);
  const thumbs = useMemo(() => {
    const out: Record<string, string> = {};
    // A Step may give its small pictures a close-up of their own (the buttons, one box), so that the change can be seen at card size.
    for (const card of cards) out[card.id] = mockupHtml(s.project, paramsForCard(s, card.id), { wireframe: wire, focus: s.region === 'auto' ? (step.thumb?.focus ?? card.focus ?? step.focus) : s.region, still: true }).html;
    return out;
  }, [stateKey, cards.length]);
  // Only the Motion Step plays the entrance; on every other Step the page stands still, so that a comparison is not blurred by a fade.
  const large = useMemo(() => mockupHtml(s.project, shownParams, { wireframe: wire, focus, still: step.id !== 'motion' }), [stateKey, shown.id, focus]);
  // The pictures follow at lower priority. A slider step first moves the knob and its number; the browser then draws the
  // pictures when it is free, and skips the steps in between while a key is held or the knob is dragged.
  const shownThumbs = useDeferredValue(thumbs);
  const shownLarge = useDeferredValue(large.html);
  const readingPair = large.pairs.find((pair) => pair.id === 'text-on-page');
  const clashes = useMemo(() => conflicts({ ...s.project, params: shownParams }).filter((c) => c.stepIds.includes(step.id)), [JSON.stringify(shownParams), step.id]);

  // Number keys flip between cards, as an optometrist flips lenses. Enter picks the card on show.
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      // A list of choices (the "Show this part of the page" list) takes letters, not digits, so the digits keep flipping cards while it has focus.
      const inList = target?.tagName === 'SELECT' && /^[1-9]$/.test(event.key);
      if (event.metaKey || event.ctrlKey || event.altKey || (isTyping(event.target) && !inList) || useStudio.getState().confirmation) return;
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
        // A key held down repeats about thirty times a second. Only the first press counts; a held Enter used to run through
        // the Steps and record a Decision on each (code review of 2026-11-13, finding "screen 2").
        if (event.repeat) return;
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
    ? shown.id === 'as-it-was' ? 'Keep the starting point and continue' : `Pick “${shown.label}” and continue`
    : lookingAtApplied
      ? decision ? 'Continue to the next Step' : applied === CURRENT ? 'Keep “Your design now” and continue' : `Keep “${shown.label}” and continue`
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
            <p>The lines below name the documents behind this guidance and say how each one is known. A name that begins with “Your” is one of your own files.</p>
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
          <LargePreview html={shownLarge} width={width} replay={replay} title={`Large preview of the sample website: ${shown.label}`} />
        </div>
        {step.id === 'contrast' && readingPair && (
          <p className="measure" role="status">Reading text on the page background, on the card you are looking at: {readingPair.ratio} to 1. The guideline asks for at least {readingPair.required} to 1.</p>
        )}
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
              if (e.repeat) return;
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
          {step.thumb?.narrowNote && s.device === 'phone' && <p className="hint">{step.thumb.narrowNote}</p>}
          <div className="tiles" data-device={step.thumb?.width ? 'detail' : cardsDevice}>
            {cards.map((card, i) => {
              const isShown = shown.id === card.id;
              const params = paramsForCard(s, card.id);
              const inUse = !s.variations && card.id === applied;
              return (
                <label key={card.id} className="option" data-shown={isShown || undefined} data-in-use={inUse || undefined}>
                  <input id={`option-${card.id}`} type="radio" name="option" value={card.id} checked={isShown} onChange={() => s.show(card.id)} />
                  <Thumbnail html={shownThumbs[card.id] ?? thumbs[card.id] ?? ''} width={thumbWidth} ratio={thumbRatio} />
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
        {/* Only the main button stays in view while the cards scroll. The whole row of buttons used to stay, three rows high
            on a narrow column, and lay over the cards and their names (finding U2-06). */}
        <div className="actions sticky">
          {/* The second click of a double click does nothing: this button stands in the same place on every Step, so that second click would record the next Step's default (finding U7-02). */}
          <button type="button" className="btn primary" onClick={(event) => { if (event.detail > 1) return; s.decideAndContinue(); }}>{mainLabel}</button>
        </div>
        <div className="actions">
          {s.variations ? (
            <>
              <button type="button" className="btn" onClick={s.startVariations}>Show finer variations of “{shown.label}”</button>
              <button type="button" className="btn quiet" onClick={s.endVariations}>Back to the standard Options</button>
            </>
          ) : (
            <>
              {sliders.length > 0 && <button type="button" className="btn" onClick={s.startVariations}>Show small variations of “{shown.label}”</button>}
              {!decision && <button type="button" className="btn quiet" onClick={s.decideLater}>Decide later</button>}
              <button type="button" className="btn quiet" onClick={s.previousStep}>{index === 0 ? 'Back to the Directions' : 'Previous Step'}</button>
              {canPutBack && <button type="button" className="btn quiet" onClick={s.putBack}>Put this Step back to how the project started</button>}
            </>
          )}
        </div>
        {!s.variations && <ReasonField key={step.id} stepId={step.id} />}
        {!s.variations && sliders.length > 0 && (
          <details className="tune">
            <summary>Adjust with sliders</summary>
            <p className="hint">Each slider changes your design as it stands, one value at a time. The large preview follows. To go back, press Undo in the top bar.</p>
            {sliders.map((t) => {
              const value = s.project.params[t.key] as number;
              const aroundTheWheel = String(t.key).toLowerCase().includes('hue');
              const ends = t.directions ?? ['less', 'more'];
              return (
                <label key={String(t.key)} className="slider">
                  <span className="slider-name">{t.label}</span>
                  <output htmlFor={`tune-${String(t.key)}`}>{sliderValue(t, value)}</output>
                  <input id={`tune-${String(t.key)}`} type="range" aria-label={t.label} aria-valuetext={sliderValue(t, value)} min={t.min} max={t.max} step="any" value={Math.min(t.max, Math.max(t.min, value))} onChange={(e) => { if (!modifiedSliderKey) s.tuneValue(t.key, nearestSliderValue(t, Number(e.target.value))); }} onKeyUp={() => { modifiedSliderKey = false; }} onBlur={() => { modifiedSliderKey = false; }} onKeyDown={(e) => {
                    // The slider is drawn without a grid, so that its knob stands exactly on the value; the keys walk the grid here.
                    const steps = SLIDER_KEYS[e.key];
                    if (steps === undefined) return;
                    // With Alt, Ctrl, or the command key held, the key belongs to the browser (Alt+Left is "back"). The Studio
                    // leaves the key alone, and it ignores the move that the browser's own slider makes for that key.
                    if (e.altKey || e.ctrlKey || e.metaKey) {
                      modifiedSliderKey = true;
                      return;
                    }
                    e.preventDefault();
                    const next = steps === -Infinity ? t.min : steps === Infinity ? Math.max(value, t.max) : nextSliderValue(t, value, steps);
                    // A key that cannot move the value does nothing: no hand-set Decision, no Undo step.
                    if (next !== value) s.tuneValue(t.key, next);
                  }} />
                  {aroundTheWheel ? (
                    <span className="slider-ends" aria-hidden="true"><span>Goes around the color wheel: {WHEEL.join(', ')}, and back to {WHEEL[0]}.</span></span>
                  ) : (
                    <span className="slider-ends" aria-hidden="true"><span>{ends[0]}</span><span>{ends[1]}</span></span>
                  )}
                </label>
              );
            })}
          </details>
        )}
      </aside>
    </div>
  );
}

/** The Step on which the owner changes the value that a research rule measures; a rule that the Template fixes has none. */
const stepThatOwns = (key: keyof DesignParams): Step | undefined => STEPS.find((step) => step.owns.includes(key));
const RESEARCH_STEP: Record<string, Step | undefined> = {
  'reading-size': stepThatOwns('baseSize'),
  'size-step': stepThatOwns('scaleRatio'),
  'strong-colors': stepThatOwns('colorStrategy'),
};

// ───────── Overlays ─────────

/**
 * The Overlays screen: one switch per Overlay. An Overlay is a small helper that appears over the page (a tooltip, an
 * "Are you sure?" question); it is a behavior, not a look, so it works with any Direction. The preview draws each
 * switched-on Overlay open, as a picture: a Mockup has no script, so nothing in it opens or closes.
 */
function OverlaysView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  const on = useMemo(() => overlaysOf(s.project), [s.project]);
  const html = useMemo(() => mockupHtml(s.project, s.project.params, { wireframe: false, focus: 'overlays', still: true, overlays: on }), [s.project, on]);
  return (
    <div className="work">
      <Rail />
      <main className="stage" id="main" tabIndex={-1}>
        <div className="step-head">
          <p className="eyebrow">After the Steps · Overlays</p>
          <h1 id="overlays-title" ref={heading} tabIndex={-1}>Which small helpers does the website need?</h1>
          <p className="teach">An Overlay is a small helper that appears over the page when a visitor needs it: an explanation beside a word, a question before something is deleted, a message after a form is sent. An Overlay takes the colors and shapes of your design. Switch on only what the website needs: each one is one more thing to build and to test.</p>
        </div>
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Width of the large preview">
            {DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>)}
          </div>
          <span className="showing" aria-live="polite">{on.length === 0 ? 'No Overlay is switched on.' : on.length === 1 ? '1 Overlay is switched on. The preview shows it open.' : `${on.length} Overlays are switched on. The preview shows each one open.`}</span>
        </div>
        <div className="preview-wrap">
          <button type="button" className="skip-preview" onClick={() => document.querySelector<HTMLElement>('.overlay-list input')?.focus()}>
            Jump past the preview to the Overlays
          </button>
          <LargePreview html={html.html} width={DEVICE_WIDTH[s.device]} title="Large preview: each switched-on Overlay, shown open, in your design" />
        </div>
        <p className="hint">The preview is a picture. Nothing in it opens, closes, or moves; the built website does that.</p>
      </main>
      <aside className="options" aria-label="The Overlays">
        <fieldset className="overlay-list">
          <legend>Overlays</legend>
          <p className="hint">Tick an Overlay to switch it on. Undo in the top bar takes a change back.</p>
          {OVERLAYS.map((overlay) => (
            <div key={overlay.id} className="overlay" data-on={on.includes(overlay.id) || undefined}>
              <label className="check">
                <input id={`overlay-${overlay.id}`} type="checkbox" checked={on.includes(overlay.id)} onChange={(e) => s.toggleOverlay(overlay.id, e.target.checked)} />
                <span>{overlay.name}</span>
              </label>
              <p>{overlay.what}</p>
              <p><strong>Switch it on when:</strong> {overlay.chooseWhen}</p>
              <p><strong>What can go wrong:</strong> {overlay.risk}</p>
              <details className="source">
                <summary>Where this guidance comes from</summary>
                <p><strong>How strong the guidance is:</strong> {EVIDENCE_LABEL[overlay.evidence]}. Written on {overlay.reviewed}; no person has reviewed it yet.</p>
                <ul>
                  {overlay.sources.map((source) => <li key={source.text}>{source.text} <em>({BASIS_LABEL[source.basis]})</em></li>)}
                </ul>
              </details>
            </div>
          ))}
        </fieldset>
        <div className="actions sticky">
          <a className="btn primary" href="#summary">Continue to the Summary</a>
        </div>
      </aside>
    </div>
  );
}

// ───────── Your content (the Brief) ─────────

const BRIEF_QUESTIONS: Record<BriefKey, string> = {
  offer: 'What do you offer?',
  audience: 'Who is it for?',
  job: 'What is the one thing that a visitor should do on this page?',
};
const LIST_WORDS: Record<ContentList, { one: string; many: string; region: MockupFocus; fields: { field: string; label: string }[] }> = {
  facts: { one: 'fact', many: 'facts', region: 'facts', fields: [{ field: 'value', label: 'The figure or short word' }, { field: 'label', label: 'What it counts' }] },
  services: { one: 'service', many: 'services', region: 'services', fields: [{ field: 'title', label: 'Its name' }, { field: 'body', label: 'One or two sentences about it' }] },
  fees: { one: 'price', many: 'prices', region: 'fees', fields: [{ field: 'item', label: 'What it is for' }, { field: 'price', label: 'The price, as you write it' }] },
};

/**
 * One line of the owner's words. The field shows what is typed; the project holds the cleaned text (one line, no invisible
 * signs, cut at the limit). When the owner leaves the field, or when the project changes from elsewhere (Undo, an opened
 * file, "Put the sample text back"), the field shows what the project holds.
 */
function ContentField({ id, label, value, max, required = false, onSave, onFocus }: { id: string; label: string; value: string; max: number; required?: boolean; onSave: (text: string) => void; onFocus?: () => void }): React.JSX.Element {
  const [text, setText] = useState(value);
  const field = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (document.activeElement !== field.current) setText(value);
  }, [value]);
  return (
    <div className="content-field">
      <label htmlFor={id}>{label}</label>
      <input ref={field} id={id} className="name" type="text" value={text} maxLength={max} autoComplete="off" onFocus={onFocus} onChange={(e) => { setText(e.target.value); onSave(e.target.value); }} onBlur={() => setText(value)} />
      {required && text.trim() === '' && <p className="note" role="status">The page needs this text. The last one stays in place until you type a new one.</p>}
      {text.length >= max && <p className="note field-full" role="status">This field is full: it holds {max} characters, and anything beyond that was left out.</p>}
    </div>
  );
}

/**
 * The screen "Your content": the Brief (CLAUDE.md, defined terms; SPEC.md section 2.7). The owner answers three questions
 * about the project and replaces the sample dental practice's texts with the page's real ones. Every text is drawn as text.
 */
function ContentView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  // The preview shows the part of the page that the field in use belongs to.
  const [region, setRegion] = useState<MockupFocus>('top');
  const c = s.project.content;
  const html = useMemo(() => mockupHtml(s.project, s.project.params, { wireframe: false, focus: region, still: true }), [s.project, region]);
  const sample = isSampleContent(c);
  const text = (key: ContentTextKey, label: string, where: MockupFocus): React.JSX.Element => (
    <ContentField key={key} id={`content-${key}`} label={label} value={c[key]} max={TEXT_LIMITS[key]} required={REQUIRED_TEXTS.includes(key)} onSave={(typed) => s.setContentText(key, typed)} onFocus={() => setRegion(where)} />
  );
  const list = (name: ContentList): React.JSX.Element => {
    const words = LIST_WORDS[name];
    const limits = LIST_LIMITS[name];
    const items = c[name] as unknown as Record<string, string>[];
    return (
      <div id={`content-list-${name}`} className="content-list">
        {items.map((item, index) => (
          <fieldset key={index} className="content-item">
            <legend>{words.one.charAt(0).toUpperCase() + words.one.slice(1)} {index + 1}</legend>
            {words.fields.map(({ field, label }) => (
              <ContentField key={field} id={`content-${name}-${index}-${field}`} label={label} value={item[field] ?? ''} max={(ITEM_LIMITS[name] as Record<string, number>)[field] ?? 0} onSave={(typed) => s.setContentItem(name, index, field, typed)} onFocus={() => setRegion(words.region)} />
            ))}
            <button type="button" className="btn small" disabled={!canRemoveContentItem(s.project, name)} onClick={() => { setRegion(words.region); s.removeContentItem(name, index); }}>Remove {words.one} {index + 1}</button>
          </fieldset>
        ))}
        <button type="button" className="btn small" disabled={!canAddContentItem(s.project, name)} onClick={() => { setRegion(words.region); s.addContentItem(name); }}>Add a {words.one}</button>
        {!canAddContentItem(s.project, name) && <p className="hint">This list is full: a page holds at most {limits.max} {words.many}.</p>}
        {!canRemoveContentItem(s.project, name) && limits.min > 0 && <p className="hint">A page needs at least {limits.min} {words.one}.</p>}
        <p className="hint">The page draws a {words.one} once it holds words.</p>
      </div>
    );
  };
  return (
    <div className="work">
      <Rail />
      <main className="stage" id="main" tabIndex={-1}>
        <div className="step-head">
          <p className="eyebrow">At any time · Your content</p>
          <h1 ref={heading} tabIndex={-1}>Your content</h1>
          <p className="teach">A design is judged best on the words that it will really carry. Here you replace the sample dental practice with your own words, and you answer three questions about the project. You can do this before, during, or after the Steps; nothing here changes a Decision. <strong>{contentStatus(c, true)}</strong></p>
        </div>
        <div className="preview-bar">
          <div className="segmented" role="group" aria-label="Width of the large preview">
            {DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={s.device === d.id} onClick={() => s.setDevice(d.id)}>{d.label}</button>)}
          </div>
          <span className="showing" aria-live="polite">The preview shows the part of the page that the field in use belongs to.</span>
        </div>
        <div className="preview-wrap">
          <button type="button" className="skip-preview" onClick={() => document.getElementById('brief-offer')?.focus()}>Jump past the preview to the fields</button>
          <LargePreview html={html.html} width={DEVICE_WIDTH[s.device]} title="Large preview of the sample website with your content" />
        </div>
        <p className="hint">Every text is drawn as text: a sign such as “&lt;” appears as that sign and does nothing. The Studio saves each letter as you type; Undo in the top bar takes a change back.</p>
      </main>
      <aside className="options content-form" aria-label="Your content">
        <fieldset>
          <legend>Three questions about the project</legend>
          <p className="hint">The page does not show these answers. They go, word for word, into PRESCRIPTION.md, so that the AI coding tool that builds your page knows what the page is for. Write nothing here that you want to keep to yourself.</p>
          {BRIEF_KEYS.map((key) => <ContentField key={key} id={`brief-${key}`} label={BRIEF_QUESTIONS[key]} value={s.project.brief?.[key] ?? ''} max={BRIEF_MAX} onSave={(typed) => s.setBriefAnswer(key, typed)} />)}
        </fieldset>
        <fieldset>
          <legend>Name, menu, and main button</legend>
          {text('business', 'The name of the business or project', 'top')}
          {text('primaryAction', 'The words on the main button', 'top')}
          {text('phone', 'Telephone number (leave it empty and the page shows none)', 'top')}
          <p className="hint">The menu keeps its five links, because each leads to a fixed part of the page. You change their words.</p>
          {c.nav.map((word, index) => <ContentField key={index} id={`content-nav-${index}`} label={`Menu link ${index + 1}`} value={word} max={NAV_WORD_MAX} onSave={(typed) => s.setNavWord(index, typed)} onFocus={() => setRegion('top')} />)}
        </fieldset>
        <fieldset>
          <legend>First screen</legend>
          {text('tag', 'A short line above the headline', 'top')}
          {text('headline', 'The headline', 'top')}
          {text('headlineEmphasis', 'Words of the headline to mark, where the design marks some', 'top')}
          {!emphasisIsInHeadline(c) && <p className="note" role="status">These words are not part of the headline, so the page marks nothing. Type them exactly as the headline has them.</p>}
          {text('lede', 'The paragraph under the headline', 'top')}
          {text('secondaryAction', 'The words of the second link', 'top')}
        </fieldset>
        <fieldset>
          <legend>Facts at a glance</legend>
          {list('facts')}
        </fieldset>
        <fieldset>
          <legend>Services</legend>
          {text('servicesTitle', 'The heading', 'services')}
          {text('servicesIntro', 'A sentence under the heading', 'services')}
          {list('services')}
        </fieldset>
        <fieldset>
          <legend>Prices</legend>
          {text('feesTitle', 'The heading of the price list', 'fees')}
          {list('fees')}
        </fieldset>
        <fieldset>
          <legend>About</legend>
          {text('aboutTitle', 'The heading', 'about')}
          {text('aboutBody', 'The paragraph', 'about')}
          {text('promise', 'One promise, drawn in a box of its own', 'about')}
        </fieldset>
        <fieldset>
          <legend>Contact and foot of the page</legend>
          {text('contactTitle', 'The heading', 'contact')}
          {text('contactBody', 'The paragraph', 'contact')}
          {text('address', 'Address', 'contact')}
          {text('hours', 'Opening hours', 'contact')}
          {text('footerNote', 'A note at the foot of the page', 'contact')}
          <p className="hint">The words of the contact form itself (“Your name”, “Send my request”) are fixed in this version.</p>
        </fieldset>
        <div className="button-row">
          <button type="button" className="btn" disabled={sample} onClick={s.requestSampleContent}>Put the sample text back</button>
        </div>
        <div className="actions sticky">
          <a className="btn primary" href="#summary">Go to the Summary</a>
        </div>
      </aside>
    </div>
  );
}

// ───────── Summary ─────────

/** The time at which a copy was kept, on the reader's own clock, or an empty text when the time is unknown. */
const KEPT_TIME = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
function keptWhen(keptAt: string): string {
  const time = new Date(keptAt);
  return keptAt && !Number.isNaN(time.getTime()) ? KEPT_TIME.format(time) : '';
}

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

const PRESCRIPTION_WORDS: Record<PrescriptionFile, string> = {
  'PRESCRIPTION.md': 'The instruction: every Decision with what you rejected and why, the fine details, the Floors, and what a person must still check.',
  'DESIGN.md': 'The same design in a second form that AI coding tools read (the DESIGN.md format).',
  'tokens.css': 'Every design value under a name, in the form that a web page uses.',
  'tokens.json': 'The same values in a form that design tools read (the Design Tokens format).',
  'theme.css': 'The colors and the corner rounding under the names that a widely used set of ready-made parts reads (the shadcn library).',
  'mockup.html': 'The reference page: this design as one page without script, with its letter styles inside. The AI coding tool builds toward it.',
  'FONTS.md': 'Which letter styles the design uses, and how the built website carries them without asking another website.',
};

/** The Prescription: seven files, written from the open project, singly or as one archive (PLAN.md section 4.4; SPEC.md sections 2.6 and 2.9). */
function PrescriptionSection(): React.JSX.Element {
  const s = useStudio();
  // The message names the file that it is about, so that it can stand in that file's entry (finding U6-21).
  const [said, setSaidOf] = useState<{ name: PrescriptionFile | 'all'; text: string } | null>(null);
  const untouched = s.project.direction === null && Object.keys(s.project.decisions).length === 0;
  const sample = isSampleContent(s.project.content);
  const write = (): Record<PrescriptionFile, string> => {
    const { project } = s;
    // The core knows the built-in Directions; only the Studio knows the name of one of the owner's own or of a random one.
    const startName = project.direction === null || findDirection(project.direction) ? undefined : [...s.own, ...s.generated].find((d) => d.id === project.direction)?.name;
    const fonts: FontId[] = [project.params.fontHeading, project.params.fontBody, ...(project.params.numerals === 'mono' ? (['jetbrains-mono'] as FontId[]) : [])];
    return writePrescription(project, { ...(startName ? { startName } : {}), fontFaceCss: fontFaceCss(fonts) });
  };
  const download = async (name: PrescriptionFile): Promise<void> => {
    const outcome = await saveFile(name, write()[name]);
    const setSaid = (text: string): void => setSaidOf({ name, text });
    setSaid(outcome === 'saved' ? `The file “${name}” was handed to your browser to save, usually into your Downloads folder. Give all seven files to the AI coding tool that builds your page.`
      : outcome === 'renamed' ? `This page may not hand over a file whose name ends as “${name}” does, so it was saved as “${name}.txt”. Take “.txt” off its name, or use the one download for all files below, which keeps every name.`
      : outcome === 'declined' ? 'The download was cancelled. Nothing was saved to a file.'
        : `This page cannot hand over files here. Use “Copy ${name}” and paste the text into a file of that name.`);
  };
  const downloadAll = async (): Promise<void> => {
    const files = write();
    // The archive's name carries the fingerprint of the design values, so that two archives can be told apart.
    const mark = /Fingerprint: ([0-9a-f]{8})\./.exec(files['tokens.css'])?.[1] ?? 'design';
    const archive = `refraction-prescription-${mark}.zip`;
    const outcome = await saveFile(archive, zipFiles(files));
    setSaidOf({ name: 'all', text: outcome === 'saved' || outcome === 'renamed' ? `The file “${archive}” was handed to your browser to save, usually into your Downloads folder. It is one archive file with all seven files inside; open it (on most computers by a double click) and give the seven files to the AI coding tool that builds your page.`
      : outcome === 'declined' ? 'The download was cancelled. Nothing was saved to a file.'
        : 'This page cannot hand over files here. Use the “Copy” button of each file and paste the text into a file of that name.' });
  };
  const copy = async (name: PrescriptionFile): Promise<void> => {
    setSaidOf({ name, text: (await copyText(write()[name])) ? `The text of “${name}” was copied. Paste it into a file of that name.` : 'Copying is blocked here. Use the download button.' });
  };
  return (
    <section id="prescription" aria-labelledby="prescription-heading">
      <h2 id="prescription-heading">The Prescription: files that an AI coding tool builds from</h2>
      <p className="hint">These seven files carry your design out of the Studio. Each is written afresh from the project as it stands when you press its button, so download them again after you change a Decision. To use them: Put the seven files into one folder, open that folder with your AI coding tool, and ask it to build the home page from PRESCRIPTION.md.</p>
      {untouched && <p className="note">You have not picked a Direction or decided a Step yet, so these files describe the plain start.</p>}
      <ul className="prescription-files">
        {PRESCRIPTION_FILES.map((name) => (
          <li key={name}>
            <p><strong>{name}</strong>. {PRESCRIPTION_WORDS[name]}</p>
            <div className="button-row">
              <button type="button" className="btn small" onClick={() => void download(name)}>Download {name}</button>
              <button type="button" className="btn small quiet" onClick={() => void copy(name)}>Copy {name}</button>
            </div>
            {said?.name === name && <p className="note" role="status">{said.text}</p>}
          </li>
        ))}
      </ul>
      <div className="button-row">
        <button type="button" className="btn" onClick={() => void downloadAll()}>Download all seven files as one file</button>
      </div>
      {said?.name === 'all' && <p className="note" role="status">{said.text}</p>}
      <p className="hint">The Prescription has all seven of its files, and PRESCRIPTION.md carries the Floors in its section 7: requirements on security, on being found by search, and on speed, each with its source, and, when Contrast checks is “Fix for me”, requirements for people with disabilities. No program checks a Floor yet. The Prescription still leaves out: structured data for your business, how an Overlay opens and closes, {sample && 'your own content (the page shows a sample dental practice), '}and every page but the home page. PRESCRIPTION.md lists the same in its section 8, and lists in its section 6 what no program checked and a person must still check.</p>
    </section>
  );
}

const OWN_FIELDS = [
  { key: 'mood', id: 'own-mood', short: 'The mood', label: 'The mood, in a sentence (leave it empty and the Studio writes it from the design)' },
  { key: 'bestFor', id: 'own-best', short: 'What it is best for', label: 'What it is best for' },
  { key: 'risk', id: 'own-risk', short: 'What to watch for', label: 'What to watch for' },
] as const;
const NO_TEXTS = { name: '', mood: '', bestFor: '', risk: '' };
const OWN_FILE_NAME = 'refraction-own-directions.json';

/** Keep the design on screen as a Direction of the owner's own (PLAN.md section 4.7). */
function OwnDirectionForm({ notes, clashes }: { notes: number; clashes: number }): React.JSX.Element {
  const keepOwn = useStudio((s) => s.keepOwnDirection);
  const openOwn = useStudio((s) => s.openOwnDirections);
  const held = useStudio((s) => s.own.length);
  const ownNote = useStudio((s) => s.ownNote);
  const [said, setSaid] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [texts, setTexts] = useState(NO_TEXTS);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  // A field stops at its limit without a sound; the form says which field is full (finding U6-19).
  const full = [{ label: 'Name', length: texts.name.length, max: OWN_NAME_MAX }, ...OWN_FIELDS.map((field) => ({ label: field.short, length: texts[field.key].length, max: OWN_TEXT_MAX }))].filter((field) => field.length >= field.max);
  const startsWith = notes + clashes === 0
    ? 'This design starts with no contrast note and no Decisions that pull against each other.'
    : `This design starts with ${notes === 0 ? 'no contrast note' : notes === 1 ? '1 contrast note' : `${notes} contrast notes`} and ${clashes === 0 ? 'no pair' : clashes === 1 ? '1 pair' : `${clashes} pairs`} of Decisions that pull against each other. You may keep it all the same.`;
  const submit = (event: React.FormEvent): void => {
    event.preventDefault();
    const error = keepOwn(texts);
    setRefusal(error);
    // What the owner typed stays after a refusal; after a success the form is empty, so that a second press keeps nothing twice.
    if (error === null) setTexts(NO_TEXTS);
  };
  const download = async (): Promise<void> => {
    // The list as storage holds it now: another tab may have changed it.
    const stored = loadOwnDirections();
    if (stored.list.length === 0) {
      setSaid('There is no Direction of your own to download: this browser shows none now.');
      return;
    }
    const shown = stored.list.length;
    const missing = stored.unshown ? ` The file holds the ${shown === 1 ? '1 Direction' : `${shown} Directions`} that this version of the Studio can show; ${stored.unshown === 1 ? '1 stored Direction is' : `${stored.unshown} stored Directions are`} not in it.` : '';
    const outcome = await saveFile(OWN_FILE_NAME, JSON.stringify(ownDirectionsFile(stored.list), null, 2));
    setSaid(outcome === 'saved' ? `The file “${OWN_FILE_NAME}” was handed to your browser to save, usually into your Downloads folder. To bring your own Directions back later, open it here with “Open a file of own Directions”.${missing}`
      : outcome === 'declined' ? 'The download was cancelled. Nothing was saved to a file.'
        : 'This page cannot hand over files here, so your own Directions could not be downloaded.');
  };
  const open = (file: File | undefined): void => {
    if (!file) return;
    setChosen(plainName(file.name));
    if (file.size > 2_000_000) {
      setSaid('That file was not opened: it is far larger than any file of own Directions. Your own Directions are unchanged.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(String(reader.result));
      } catch {
        // Not JSON at all: `openOwnDirections` refuses it in the same words as any other file that is not a list.
      }
      setSaid(openOwn(data));
    };
    reader.onerror = () => setSaid('That file could not be read. Your own Directions are unchanged.');
    reader.readAsText(file);
  };
  return (
    <section id="own-direction" aria-labelledby="own-heading">
      <h2 id="own-heading">Keep this design as a Direction of your own</h2>
      <p className="hint">A Direction of your own is this design under a name. It then stands on the Directions screen, under “Your own”, and you can start later projects from it. It stays in this browser; it is not part of this project’s file.</p>
      <p className="hint starts-with">{startsWith}</p>
      <form className="own-form" onSubmit={submit}>
        <label htmlFor="own-name">Name</label>
        <input id="own-name" className="name" maxLength={OWN_NAME_MAX} value={texts.name} onChange={(e) => setTexts({ ...texts, name: e.target.value })} />
        {OWN_FIELDS.map((field) => (
          <Fragment key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input id={field.id} className="name" maxLength={OWN_TEXT_MAX} value={texts[field.key]} onChange={(e) => setTexts({ ...texts, [field.key]: e.target.value })} />
          </Fragment>
        ))}
        <p className="hint">A name holds up to {OWN_NAME_MAX} characters, each text up to {OWN_TEXT_MAX}; a field stops at its limit.</p>
        {full.map((field) => <p key={field.label} className="note field-full" role="status">“{field.label}” is full: it holds {field.max} characters, and anything beyond that was left out.</p>)}
        {refusal && <p className="note" role="alert">{refusal}</p>}
        <div><button type="submit" className="btn">Keep this design as a Direction of my own</button></div>
      </form>
      <h3>Your own Directions as a file</h3>
      <p className="hint">Your own Directions stay in this browser only, and a browser can clear what it stores. One file holds them all: download it after you keep, rename, or remove one, and open it in any browser to bring them back.</p>
      <div className="button-row">
        {held > 0 && <button type="button" className="btn" onClick={() => void download()}>Download my own Directions ({held})</button>}
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Open a file of own Directions</button>
        <input ref={fileRef} id="own-file" type="file" accept=".json,application/json" hidden onChange={(e) => { open(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {chosen !== null && <p className="hint own-file-name">The file you chose last: “{chosen}”.</p>}
      {said && <p className="note" role="status">{said}</p>}
      {ownNote && <p className="note own-note">{ownNote}</p>}
    </section>
  );
}

function SummaryView(): React.JSX.Element {
  const s = useStudio();
  const heading = useHeadingFocus();
  const [message, setMessage] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const text = useMemo(() => JSON.stringify(s.project, null, 2), [s.project]);
  const overlaysOn = useMemo(() => overlaysOf(s.project), [s.project]);
  const html = useMemo(() => mockupHtml(s.project, s.project.params, { wireframe: false, focus: 'top', still: true, overlays: overlaysOn }), [s.project, overlaysOn]);
  const clashes = useMemo(() => conflicts(s.project), [s.project]);
  const research = useMemo(() => researchReport(s.project.params, tokensFor(s.project.params, s.project.a11y).css), [s.project.params, s.project.a11y]);
  const craft = useMemo(() => craftReport(s.project.params, tokensFor(s.project.params, s.project.a11y).css), [s.project.params, s.project.a11y]);
  const decided = STEPS.filter((st) => s.project.decisions[st.id]).length;
  const [keptTick, setKeptTick] = useState(0);
  // The kept copy that the owner is about to remove, by a name that stays the same when the list is read again. Holding the
  // list member itself made the question "Yes, remove it for good / No, keep it" vanish whenever the list was read again
  // (code review, finding "screen 7").
  const [removing, setRemoving] = useState<string | null>(null);
  // The list is read again after a notice (every action that keeps a copy posts one), after a removal, and when the owner
  // comes back to this tab (another tab may have kept a copy). It is not read on every change of the save status: that read
  // and redrew the whole list twice for each typed letter (code review, finding "saving 8").
  // A copy that a closing page left, and that holds exactly the saved project, is not listed: the next opening removes it.
  const keptCopies = useMemo(() => {
    const saved = storedProjectText();
    return readBackups().filter((copy) => !(copy.state === 'leaving' && copy.text === saved));
  }, [s.notice, s.hold, keptTick]);
  useEffect(() => {
    const again = (): void => setKeptTick((n) => n + 1);
    window.addEventListener('focus', again);
    return () => window.removeEventListener('focus', again);
  }, []);
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
          You have decided {decided} of {STEPS.length} Steps. This project started from {directionName(s.project, s)}; a Step you have not decided keeps the value it started with.
        </p>
        <p className="teach">
          <strong>What works today:</strong> you can download the project file and open it here later, and you can download the Prescription: seven files that an AI coding tool builds your page from. <strong>What does not exist yet:</strong> the parts that the section “The Prescription” lists as left out. A program that measures a built page against the Prescription exists as a command in the repository (`npm run fit`); it is not part of this Studio yet.
        </p>
        <p><button type="button" className="btn small" onClick={() => document.getElementById('prescription')?.scrollIntoView({ block: 'start' })}>Show me the Prescription</button></p>
        <p className="teach">{contentStatus(s.project.content, false)} To change the texts and your three answers about the project, open <a href="#content">Your content</a>.</p>
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
                {keptCopies.map((copy, index) => {
                  const id = copy.key ?? `listed|${copy.keptAt}|${copy.text.length}|${index}`;
                  const when = keptWhen(copy.keptAt);
                  return (
                  <li key={id}>
                    <span>{copy.why}{when && <> Kept on <span className="nowrap">{when}</span>.</>}</span>
                    <span className="button-row">
                      <button type="button" className="btn quiet" onClick={() => { const file = keptCopyFile(copy, index); void saveFile(file.name, file.text); }}>Download this kept copy</button>
                      {removing === id ? (
                        <>
                          <button type="button" className="btn quiet" onClick={() => { setMessage(removeBackup(copy) ? 'The kept copy was removed.' : 'This browser did not let the Studio remove the kept copy.'); setRemoving(null); setKeptTick((n) => n + 1); s.saveAgain(); }}>Yes, remove it for good</button>
                          <button type="button" className="btn quiet" onClick={() => setRemoving(null)}>No, keep it</button>
                        </>
                      ) : (
                        <button type="button" className="btn quiet" onClick={() => setRemoving(id)}>Remove this kept copy…</button>
                      )}
                    </span>
                  </li>
                  );
                })}
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
                  {/* The Summary promises "what you rejected and why", so the reason can be written here as well (finding U6-11). */}
                  {s.project.decisions[st.id] && (
                    <details className="reason-edit">
                      {/* The details opens and the field takes focus in the same moment as the click, so that the first typing is not lost (finding U7-05). The browser's own toggle event comes a moment later. */}
                      <summary onClick={(event) => { const box = event.currentTarget.parentElement; if (box instanceof HTMLDetailsElement && !box.open) { event.preventDefault(); box.open = true; box.querySelector('input')?.focus(); } }}>{reason ? 'Change the reason' : 'Add a reason'}</summary>
                      <ReasonField stepId={st.id} fieldId={`decision-reason-${st.id}`} brief />
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
        <section aria-labelledby="overlays-heading">
          <h2 id="overlays-heading">Overlays</h2>
          {overlaysOn.length === 0 ? (
            <p>No Overlay is switched on. <a href="#overlays">Choose Overlays</a></p>
          ) : (
            <>
              <ul className="overlay-summary">
                {overlaysOn.map((id) => <li key={id}>{findOverlay(id)?.name}</li>)}
              </ul>
              <p><a href="#overlays">Change the Overlays</a></p>
            </>
          )}
        </section>
        <section id="craft" aria-labelledby="craft-heading">
          <h2 id="craft-heading">Fine details the Studio adds by itself</h2>
          <p className="hint">A page made with care differs from an ordinary one in small things that nobody asks for. You do not choose these: every design has them, except where one of your Steps sets a detail aside (the list then says so). The preview already draws them, and the Prescription asks the AI coding tool that builds your page for each one. Open a detail to read what it is and how strong the guidance behind it is. The Studio knows three strengths, from strong to weak: measured in studies that were read; long-standing convention; expert opinion. Every detail in this list is expert opinion.</p>
          <ul className="craft-list">
            {craft.map(({ rule, now, aside, ownJudgment }) => (
              <li key={rule.id}>
                <details className="source">
                  <summary><strong>{rule.name}</strong>{now && <> <span className="found">{aside && 'Set aside in your design: '}{now}</span></>}</summary>
                  <p>{rule.what}</p>
                  <p><strong>How strong the guidance is:</strong> {EVIDENCE_LABEL[rule.evidence]}{ownJudgment ? ', and here the opinion of the assistant that wrote this Studio: no outside source was read' : ': rule sets that people who build websites have published, not a measurement'}. Written on {rule.reviewed}; no person has reviewed it yet.</p>
                  <ul>
                    {rule.sources.map((source) => <li key={source.text}>{source.text} <em>({BASIS_LABEL[source.basis]})</em></li>)}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </section>
        <PrescriptionSection />
        <OwnDirectionForm notes={html.issues.length} clashes={clashes.length} />
        <section aria-labelledby="research-heading">
          <h2 id="research-heading">Research rules</h2>
          <p className="hint">A research rule turns a finding from research into a number that the Studio measures on your design. “Holds” means that your design meets the rule. Each rule is advice, with its strength stated; none of them changes your design. Open a rule to read why it exists and what you must still check yourself.</p>
          <ul className="research-list">
            {research.map((result) => {
              const step = RESEARCH_STEP[result.rule.id];
              const onPurpose = result.holds ? null : startDeparture(s.project, result.rule.id, step);
              return (
                <li key={result.rule.id} data-holds={result.holds}>
                  <details className="source">
                    <summary><strong>{result.holds ? 'Holds' : 'Does not hold'}:</strong> {result.rule.name}. <span className="found">{result.found}</span></summary>
                    <p><strong>Why the rule exists:</strong> {result.rule.why}</p>
                    <p><strong>What the Studio does not check:</strong> {result.rule.notChecked}</p>
                    {step && <p>You change this on the Step <a href={`#${step.id}`}>“{step.name}”</a>.</p>}
                    {result.rule.setBy === 'template' && <p><strong>Set by the sample website:</strong> no Step changes this value yet, so your choices cannot break this rule today.</p>}
                    <p><strong>How strong the guidance is:</strong> {EVIDENCE_LABEL[result.rule.evidence]}. Written on {result.rule.reviewed}; no person has reviewed it yet.</p>
                    <ul>
                      {result.rule.sources.map((source) => <li key={source.text}>{source.text} <em>({BASIS_LABEL[source.basis]})</em></li>)}
                    </ul>
                  </details>
                  {onPurpose && <p className="hint on-purpose">This project’s start, {directionName(s.project, s)}, is made this way on purpose. {onPurpose}</p>}
                </li>
              );
            })}
          </ul>
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
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z' && !isTyping(event.target) && !useStudio.getState().confirmation) {
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
        {!ready ? <main className="loading" id="main" tabIndex={-1}><p>Opening your project…</p></main> : view === 'directions' ? <DirectionsView /> : view === 'overlays' ? <OverlaysView /> : view === 'summary' ? <SummaryView /> : view === 'content' ? <ContentView /> : view === 'licences' ? <LicencesView /> : <StepsView />}
      </ScreenBoundary>
      <ConfirmDialog />
    </div>
  );
}
