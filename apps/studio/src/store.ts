// The Studio's state. Every change to the design goes through the engine in @refraction/core.
import {
  DIRECTIONS, STEPS, activeTunables, applyDirection, closerOptions, createProject, findDirection, findStep, firstOpenStepId, generateDirections, keep, matchingOptionId,
  nextStepId, ownedValues, parseProject, pick, pickValues, prevStepId, previewParams, revert, setReason, startPlain, tune,
  type A11yProfile, type DesignParams, type Direction, type GeneratedOption, type MockupFocus, type Project, type Step,
} from '@refraction/core';
import { create } from 'zustand';
import {
  adoptStoredCopy, keepBackup, loadPrefs, storedProjectText, loadSaved, retryPageRead, saveBrowserNow, saveFile, savePrefs, saveProject, watchOtherTabs,
  type LoadResult, type RawCopy,
} from './platform';

export type Device = 'phone' | 'tablet' | 'desktop';
export const DEVICE_WIDTH: Record<Device, number> = { phone: 375, tablet: 768, desktop: 1280 };
export type View = 'directions' | 'steps' | 'summary' | 'licences';
const VIEWS: readonly View[] = ['directions', 'steps', 'summary', 'licences'];

/** The card that stands for the design as it is, when no Catalog Option matches it. */
export const CURRENT = 'current';

interface Variations {
  round: number;
  /** The values the variations were made from. The first card shows them, "as it was". */
  origin: Partial<DesignParams>;
  options: GeneratedOption[];
  /** The card that was on show when the variations opened; "Back to the standard Options" returns to it. */
  cameFrom: string;
}

/**
 * `idle`: nothing has changed since the page opened. `held`: the Studio is not saving, because a saved copy needs the owner's decision first.
 * `failed`: neither store accepted the save.
 */
export type SaveState = 'idle' | 'saving' | 'page' | 'browser' | 'failed' | 'held';

export interface NoticeAction {
  label: string;
  run(): void;
}
export interface Notice {
  text: string;
  /** A notice that reports a problem is announced at once; an ordinary one waits its turn. */
  urgent?: boolean;
  actions?: NoticeAction[];
  /** A notice that needs a decision cannot be dismissed without one. */
  sticky?: boolean;
}

export interface Confirmation {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  run(): void;
}

export interface StudioState {
  ready: boolean;
  project: Project;
  /** Earlier states of the project, newest last, for "Undo". */
  history: Project[];
  view: View;
  stepId: string;
  /** The card on show in the large preview. Looking is not deciding. */
  shownId: string;
  variations: Variations | null;
  /** Rises each time keyboard focus should move to the main thing on screen (the cards, or the page heading). */
  focusTick: number;
  device: Device;
  region: MockupFocus | 'auto';
  /** Structure Steps show the layout in gray unless this is off. */
  wireframe: boolean;
  studioLook: 'studio' | 'project';
  generated: Direction[];
  saved: SaveState;
  notice: Notice | null;
  confirmation: Confirmation | null;

  init(): Promise<void>;
  go(view: View, stepId?: string): void;
  show(cardId: string): void;
  /** The main button: pick the card on show, or keep the design as it is; then go to the next Step. */
  decideAndContinue(): void;
  decideLater(): void;
  previousStep(): void;
  putBack(): void;
  startVariations(): void;
  endVariations(): void;
  tuneValue(key: keyof DesignParams, value: number): void;
  setReason(reason: string): void;
  requestDirection(direction: Direction): void;
  requestPlainStart(): void;
  moreDirections(): void;
  setProfile(profile: A11yProfile): void;
  rename(name: string): void;
  setDevice(device: Device): void;
  setRegion(region: MockupFocus | 'auto'): void;
  setWireframe(on: boolean): void;
  setStudioLook(look: 'studio' | 'project'): void;
  /** Check a file's content and, after the owner confirms, open it. Returns a message for a file that was refused. */
  requestImport(data: unknown, fileName: string): string | null;
  requestStartOver(): void;
  undo(): void;
  dismissNotice(): void;
  answerConfirmation(yes: boolean): void;
  flush(): void;
}

export const stepOf = (id: string): Step => findStep(id) ?? STEPS[0]!;

/** The name to show for where a project started. */
export function directionName(project: Project, generated: Direction[] = []): string {
  if (project.direction === null) return 'the plain start';
  return findDirection(project.direction)?.name ?? generated.find((d) => d.id === project.direction)?.name ?? 'a generated Direction';
}

/** The card that shows the design as it stands: the matching Catalog Option, or the "current" card. */
export function appliedCardId(project: Project, step: Step): string {
  return matchingOptionId(project.params, step) ?? CURRENT;
}

/** The parameters that a card of the current Step shows. */
export function paramsForCard(state: Pick<StudioState, 'project' | 'stepId' | 'variations'>, cardId: string): DesignParams {
  const { project, variations } = state;
  if (variations) {
    const generated = variations.options.find((o) => o.id === cardId);
    return { ...project.params, ...variations.origin, ...(generated?.values ?? {}) };
  }
  if (cardId === CURRENT) return project.params;
  const option = stepOf(state.stepId).options.find((o) => o.id === cardId);
  return option ? previewParams(project, option) : project.params;
}

/** The same data with every object's keys in one fixed order, so that two copies compare by content and not by the order of their fields. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]));
}

/** True when the project the Studio opened differs in content from the text that was stored. */
function changedOnOpening(storedText: string, opened: Project): boolean {
  try {
    return JSON.stringify(canonical(JSON.parse(storedText))) !== JSON.stringify(canonical(JSON.parse(JSON.stringify(opened))));
  } catch {
    return true;
  }
}

function readHash(): { view: View; stepId?: string } | null {
  const name = window.location.hash.replace(/^#/, '');
  if (name !== 'steps' && (VIEWS as readonly string[]).includes(name)) return { view: name as View };
  if (findStep(name)) return { view: 'steps', stepId: name };
  return null;
}

const hashFor = (view: View, stepId: string): string => (view === 'steps' ? `#${stepId}` : `#${view}`);
const hasWork = (project: Project): boolean => project.direction !== null || Object.keys(project.decisions).length > 0;
const plural = (n: number, one: string, many: string): string => (n === 1 ? `1 ${one}` : `${n} ${many}`);

/** Turn one saved copy into a checked project, or say why it cannot be read. */
function readCopy(copy: RawCopy): { ok: true; project: Project; notes: string[] } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(copy.text);
  } catch {
    return { ok: false, error: 'The saved copy is cut off or damaged.' };
  }
  const parsed = parseProject(data);
  return parsed.ok ? { ok: true, project: parsed.project, notes: parsed.notes } : { ok: false, error: parsed.error };
}

const HISTORY_MAX = 40;
const SAVE_DELAY_MS = 300;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastSavedText: string | null = null;

export const useStudio = create<StudioState>((set, get) => {
  /**
   * Replace the open project, and keep a copy of it first. Undo brings the old project back only until the page closes or
   * reloads; the kept copy stays until the owner removes it (finding U2-01).
   * If the copy cannot be kept, because this browser's storage is full or blocked, the Studio does not replace the project
   * silently: it asks once more and says what is at stake (finding S3-01).
   */
  const replaceKeepingCopy = (replace: () => void, event: string): void => {
    const current = get().project;
    if (!hasWork(current) || keepBackup(JSON.stringify(current), `The project “${current.name.slice(0, 60)}”, as it was before ${event}.`)) {
      replace();
      return;
    }
    set({
      confirmation: {
        title: 'The Studio could not keep a copy of your project',
        body: 'This browser’s storage is full, or it does not let the Studio store anything, so the Studio cannot keep a copy of your current project. If you go on, your current project is replaced; Undo brings it back only until you close or reload this page. To be safe, choose “Keep my project”, download the project file from the Summary, and then try again.',
        confirmLabel: 'Replace it without a kept copy',
        cancelLabel: 'Keep my project',
        danger: true,
        run: replace,
      },
    });
  };

  /**
   * The owner chose this tab's copy over another tab's copy. The other copy is kept first, so that the choice destroys nothing
   * (finding S2-04). If it cannot be kept, the Studio asks once more before it replaces the other copy (finding S3-01).
   */
  const keepThisTab = (forgetLastSave: boolean): void => {
    const adopt = (): void => {
      adoptStoredCopy();
      if (forgetLastSave) lastSavedText = null;
      set({ saved: 'saving', notice: null });
      void saveNow();
    };
    const stored = storedProjectText();
    if (stored === null || keepBackup(stored, 'The copy from another tab or window, replaced when you chose to keep this one.')) {
      adopt();
      return;
    }
    set({
      confirmation: {
        title: 'The Studio could not keep the other copy',
        body: 'This browser’s storage is full, or it does not let the Studio store anything, so the Studio cannot keep the copy from the other tab or window. If you go on, this tab’s project replaces that copy for good.',
        confirmLabel: 'Replace the other copy',
        cancelLabel: 'Do not replace it',
        danger: true,
        run: adopt,
      },
    });
  };

  const saveNow = async (): Promise<void> => {
    clearTimeout(saveTimer);
    if (get().saved === 'held') return;
    const text = JSON.stringify(get().project);
    if (text === lastSavedText) return;
    const outcome = await saveProject(text);
    if (outcome === 'conflict') {
      set({
        saved: 'held',
        notice: {
          text: 'This project was changed in another tab or window after this one opened it. The Studio has stopped saving here, so that neither copy replaces the other without your say.',
          urgent: true,
          sticky: true,
          actions: [
            { label: 'Keep this tab’s copy', run: () => keepThisTab(false) },
            { label: 'Reload to see the other copy', run: () => window.location.reload() },
          ],
        },
      });
      return;
    }
    if (outcome !== 'failed') lastSavedText = text;
    // Only report the outcome if nothing changed while the save ran.
    if (JSON.stringify(get().project) === text) set({ saved: outcome });
  };

  const persist = (): void => {
    if (get().saved === 'held') return;
    set({ saved: 'saving' });
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void saveNow(), SAVE_DELAY_MS);
  };

  /** Apply a change to the project, remember the earlier state for Undo, and save. */
  const commit = (project: Project): void => {
    const before = get().project;
    if (project === before) return;
    set({ project, history: [...get().history, before].slice(-HISTORY_MAX) });
    persist();
  };

  /** Go to a view. `push` adds a browser history entry, so that the browser's Back button returns here. */
  const enter = (view: View, stepId: string, push = true): void => {
    const state = get();
    const step = stepOf(stepId);
    const leaving = state.view === 'steps' && (view !== 'steps' || step.id !== state.stepId) ? stepOf(state.stepId) : null;
    // The Studio sets the address when it moves, and the browser then reports that change back, which enters the same place
    // a second time. That second entry must keep the notice of the action that caused the move (finding U3-08: "Started again
    // from …" with its Undo button vanished at once).
    const samePlace = state.view === view && state.stepId === step.id;
    let notice = state.notice?.sticky || samePlace ? state.notice : null;
    if (leaving && !state.variations && state.shownId !== appliedCardId(state.project, leaving)) {
      // A card that was looked at and not picked would otherwise vanish without a word (finding FTU-30).
      const looked = leaving.options.find((o) => o.id === state.shownId)?.label;
      if (looked && !notice) {
        const from = leaving.id;
        notice = { text: `On the Step “${leaving.name}” you looked at “${looked}” but did not pick it. Your design did not change.`, actions: [{ label: `Go back to “${leaving.name}”`, run: () => { get().go('steps', from); get().show(leaving.options.find((o) => o.label === looked)!.id); } }] };
      }
    }
    set({ view, stepId: step.id, variations: null, region: 'auto', shownId: appliedCardId(state.project, step), notice, focusTick: state.focusTick + 1 });
    const wanted = hashFor(view, step.id);
    if (window.location.hash !== wanted) {
      if (push) window.location.hash = wanted;
      else window.history.replaceState(null, '', wanted);
    }
    window.scrollTo(0, 0);
  };

  const advance = (): void => {
    const following = nextStepId(get().stepId);
    if (following) enter('steps', following);
    else enter('summary', get().stepId);
  };

  const refocus = (): void => set({ focusTick: get().focusTick + 1 });

  /** Open a project that replaces the one on screen. The replaced project can be brought back with Undo. */
  const replaceProject = (project: Project, message: string): void => {
    commit(project);
    set({ notice: { text: message, actions: [{ label: 'Undo', run: () => get().undo() }] } });
  };

  const applyPrefs = (): void => {
    const prefs = loadPrefs();
    set({
      device: prefs.device === 'phone' || prefs.device === 'tablet' || prefs.device === 'desktop' ? prefs.device : window.innerWidth < 600 ? 'phone' : 'desktop',
      wireframe: typeof prefs.wireframe === 'boolean' ? prefs.wireframe : true,
      studioLook: prefs.studioLook === 'project' ? 'project' : 'studio',
    });
  };
  const storePrefs = (): void => {
    const { device, wireframe, studioLook } = get();
    savePrefs({ device, wireframe, studioLook });
  };

  /** Decide which saved copy to open. Neither store wins by default (finding SEC-02). */
  const openSaved = (loaded: LoadResult): void => {
    const copies: { where: 'page' | 'browser'; copy: RawCopy }[] = [];
    if (typeof loaded.page === 'object') copies.push({ where: 'page', copy: loaded.page });
    if (typeof loaded.browser === 'object') copies.push({ where: 'browser', copy: loaded.browser });
    const read = copies.map((c) => ({ ...c, result: readCopy(c.copy) }));
    const good = read.filter((c): c is typeof c & { result: { ok: true; project: Project; notes: string[] } } => c.result.ok);
    const bad = read.filter((c) => !c.result.ok);
    // The newer valid copy opens. A copy with no save time (from version 1) counts as the oldest.
    good.sort((a, b) => (b.copy.savedAt ?? '').localeCompare(a.copy.savedAt ?? ''));
    const chosen = good[0];
    const other = good[1];
    const notes: string[] = [];
    let saved: SaveState = 'idle';
    let sticky = false;
    const actions: NoticeAction[] = [];
    /** Copies that the Studio wanted to keep before any save could replace them, and could not (this browser's storage is full or blocked). */
    const unkept: { label: string; fileName: string; text: string }[] = [];

    if (chosen) {
      lastSavedText = JSON.stringify(chosen.result.project);
      saved = chosen.where;
      notes.push(...chosen.result.notes);
      // Opening can change a saved copy (an older version, a Step this Catalog lacks, a detail it cannot keep). The next save would then
      // replace the original, so the Studio keeps the original first and says so (finding S2-02).
      if (changedOnOpening(chosen.copy.text, chosen.result.project)) {
        if (keepBackup(chosen.copy.text, 'Your saved copy as it was, before the Studio changed details on opening it.')) {
          notes.push('Opening changed some details of your saved project. The Studio kept the copy as it was; you can download it from the Summary.');
        } else {
          notes.push('Opening changed some details of your saved project.');
          unkept.push({ label: 'Download your saved copy as it was', fileName: 'refraction-saved-copy-as-it-was.json', text: chosen.copy.text });
        }
      }
      if (other && JSON.stringify(other.result.project) !== lastSavedText) {
        if (keepBackup(other.copy.text, 'The older of two saved copies that differed.')) {
          notes.push('The copy saved on this page and the copy saved in this browser differed. The Studio opened the newer one and kept the older one; you can download it from the Summary.');
        } else {
          notes.push('The copy saved on this page and the copy saved in this browser differed. The Studio opened the newer one.');
          unkept.push({ label: 'Download the older copy', fileName: 'refraction-older-copy.json', text: other.copy.text });
        }
      }
      set({ project: chosen.result.project });
    }
    if (bad.length > 0) {
      const first = bad[0]!;
      const reason = first.result.ok ? '' : first.result.error;
      const kept = keepBackup(first.copy.text, 'A saved copy that could not be read.');
      if (chosen) {
        if (kept) notes.push(`One saved copy could not be read (${reason}) The Studio kept it untouched; you can download it from the Summary.`);
        else {
          notes.push(`One saved copy could not be read (${reason})`);
          unkept.push({ label: 'Download the copy that could not be read', fileName: 'unreadable-refraction-project.txt', text: first.copy.text });
        }
      } else {
        // No readable copy at all. Nothing is saved until the owner decides, so that the unreadable copy cannot be overwritten (finding SEC-03).
        saved = 'held';
        sticky = true;
        notes.push(`Your saved project could not be read. ${reason} The Studio has not changed it and is not saving over it.`);
        actions.push(
          { label: 'Download the unreadable copy', run: () => void saveFile('unreadable-refraction-project.txt', first.copy.text) },
          {
            label: kept ? 'Start a new project (the unreadable copy stays in a backup)' : 'Start a new project and discard the unreadable copy',
            run: () => { adoptStoredCopy(); set({ saved: 'idle', notice: null }); },
          },
        );
      }
    }
    if (unkept.length > 0) {
      // The Studio does not save over a copy that it could not keep, until the owner decides (finding S3-01).
      saved = 'held';
      sticky = true;
      notes.push(`This browser’s storage is full or blocked, so the Studio could not keep ${unkept.length === 1 ? 'that copy' : 'those copies'}. It has stopped saving, so that nothing is replaced before you decide.`);
      actions.push(
        ...unkept.map((copy) => ({ label: copy.label, run: () => void saveFile(copy.fileName, copy.text) })),
        { label: `Go on: let the Studio save over ${unkept.length === 1 ? 'it' : 'them'}`, run: () => { adoptStoredCopy(); set({ saved: 'idle', notice: null }); } },
      );
    }
    if (loaded.browser === 'blocked' && loaded.page === 'absent') notes.push('This browser does not let the Studio store anything, so your work cannot be saved here. Download the project file from the Summary before you close this page.');
    set({ saved, notice: notes.length > 0 ? { text: notes.join(' '), urgent: bad.length > 0 || unkept.length > 0, sticky, ...(actions.length > 0 ? { actions } : {}) } : null });

    if (loaded.page === 'timeout') {
      // The page database did not answer. Nothing is written there until a read succeeds (finding SEC-02, case d).
      void retryPageRead().then((later) => {
        if (typeof later !== 'object') return;
        const result = readCopy(later);
        const current = JSON.stringify(get().project);
        if (!result.ok || JSON.stringify(result.project) === current) return;
        const pageIsNewer = (later.savedAt ?? '') > (chosen?.copy.savedAt ?? '');
        if (!pageIsNewer) return;
        const laterProject = result.project;
        set({ notice: { text: 'A newer copy of this project was found saved on this page.', sticky: true, actions: [{ label: 'Open the newer copy', run: () => replaceProject(laterProject, 'Opened the newer copy.') }, { label: 'Keep what I have', run: () => set({ notice: null }) }] } });
      });
    }
  };

  return {
    ready: false,
    project: createProject('My first project'),
    history: [],
    view: 'directions',
    stepId: STEPS[0]!.id,
    shownId: STEPS[0]!.defaultOptionId,
    variations: null,
    focusTick: 0,
    device: 'desktop',
    region: 'auto',
    wireframe: true,
    studioLook: 'studio',
    generated: [],
    saved: 'idle',
    notice: null,
    confirmation: null,

    async init() {
      applyPrefs();
      // The listeners come first, so that a fault further down cannot leave the Studio's links dead (finding SEC-04).
      window.addEventListener('hashchange', () => {
        const next = readHash();
        if (next) enter(next.view, next.stepId ?? get().stepId, false);
      });
      window.addEventListener('pagehide', () => get().flush());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') get().flush();
      });
      watchOtherTabs(() => {
        if (get().saved === 'held') return;
        set({ saved: 'held', notice: { text: 'This project was just changed in another tab or window. The Studio has stopped saving here, so that neither copy replaces the other without your say.', urgent: true, sticky: true, actions: [{ label: 'Keep this tab’s copy', run: () => keepThisTab(true) }, { label: 'Reload to see the other copy', run: () => window.location.reload() }] } });
      });
      try {
        openSaved(await loadSaved());
      } catch {
        set({ notice: { text: 'The Studio could not look for a saved project. It started a new one.', urgent: true } });
      }
      set({ ready: true });
      const project = get().project;
      const fromHash = readHash();
      const kept = get().notice;
      if (fromHash) enter(fromHash.view, fromHash.stepId ?? firstOpenStepId(project), false);
      else enter(hasWork(project) ? 'steps' : 'directions', firstOpenStepId(project), false);
      // Entering a view clears ordinary notices; the one about saved copies must survive the first screen.
      if (kept) set({ notice: kept });
      set({ focusTick: 0 });
    },

    go(view, stepId) {
      enter(view, stepId ?? get().stepId);
    },

    show(cardId) {
      set({ shownId: cardId });
    },

    decideAndContinue() {
      const { project, stepId, shownId, variations } = get();
      const step = stepOf(stepId);
      if (variations) {
        // The values on show: "as it was" (the values the variations started from), or one small step away from them.
        const values = { ...variations.origin, ...(variations.options.find((o) => o.id === shownId)?.values ?? {}) };
        const target = { ...project.params, ...values };
        const unchanged = step.owns.every((key) => target[key] === project.params[key]);
        const option = matchingOptionId(target, step);
        if (unchanged) commit(keep(project, stepId));
        else if (option) commit(pick(project, stepId, option));
        else commit(pickValues(project, stepId, values));
      } else if (shownId === appliedCardId(project, step)) {
        // The design as it stands is on show: keep it. This records that the owner looked, and changes nothing.
        commit(keep(project, stepId));
      } else {
        commit(pick(project, stepId, shownId));
      }
      advance();
    },

    decideLater() {
      advance();
    },

    previousStep() {
      const previous = prevStepId(get().stepId);
      if (previous) enter('steps', previous);
      else enter('directions', get().stepId);
    },

    putBack() {
      const { project, stepId } = get();
      const step = stepOf(stepId);
      commit(revert(project, stepId));
      set({ variations: null, shownId: appliedCardId(get().project, step), notice: { text: `“${step.name}” is back to the value this project started with.`, actions: [{ label: 'Undo', run: () => get().undo() }] } });
      refocus();
    },

    startVariations() {
      const state = get();
      const step = stepOf(state.stepId);
      if (activeTunables(step, get().project.params).length === 0) return;
      // Variations start from what is on show: a card the owner is looking at, or the design as it stands.
      const origin = ownedValues(step, paramsForCard(state, state.shownId));
      const round = state.variations ? state.variations.round + 1 : 0;
      const options = closerOptions({ ...state.project, params: { ...state.project.params, ...origin } }, step.id, round);
      set({ variations: { round, origin, options, cameFrom: state.variations?.cameFrom ?? state.shownId }, shownId: 'as-it-was' });
      refocus();
    },

    endVariations() {
      const step = stepOf(get().stepId);
      const back = get().variations?.cameFrom;
      const exists = back === CURRENT ? appliedCardId(get().project, step) === CURRENT : step.options.some((o) => o.id === back);
      set({ variations: null, shownId: back && exists ? back : appliedCardId(get().project, step) });
      refocus();
    },

    tuneValue(key, value) {
      // A slider always moves the design as it stands, and only the value that moved (findings FTU-05, FTU-06).
      const { project, stepId } = get();
      commit(tune(project, stepId, key, value));
      set({ variations: null, shownId: appliedCardId(get().project, stepOf(stepId)) });
    },

    setReason(reason) {
      const { project, stepId } = get();
      if (!project.decisions[stepId]) return;
      commit(setReason(project, stepId, reason));
    },

    requestDirection(direction) {
      const { project } = get();
      const replace = (): void => {
        const hadWork = hasWork(project);
        commit(applyDirection(get().project, direction));
        enter('steps', STEPS[0]!.id);
        if (hadWork) set({ notice: { text: `Started again from “${direction.name}”.`, actions: [{ label: 'Undo', run: () => get().undo() }] } });
      };
      const start = (): void => replaceKeepingCopy(replace, `you started again from “${direction.name}”`);
      const decided = Object.keys(project.decisions).length;
      if (decided === 0) start();
      else set({ confirmation: { title: `Start again from “${direction.name}”?`, body: `This replaces your current design and clears your ${plural(decided, 'Decision', 'Decisions')}. You can undo it until you close or reload this page. The Studio also keeps a copy of the replaced project where this browser allows it; the Summary lists every kept copy.`, confirmLabel: 'Start again', cancelLabel: 'Keep my project', run: start } });
    },

    requestPlainStart() {
      const { project } = get();
      const replace = (): void => {
        const hadWork = hasWork(project);
        commit(startPlain(get().project));
        enter('steps', STEPS[0]!.id);
        if (hadWork) set({ notice: { text: 'Started again from the plain start.', actions: [{ label: 'Undo', run: () => get().undo() }] } });
      };
      const start = (): void => replaceKeepingCopy(replace, 'you started again from the plain start');
      if (!hasWork(project)) start();
      else set({ confirmation: { title: 'Start again from the plain start?', body: `This replaces your current design (started from ${directionName(project, get().generated)}) and clears your ${plural(Object.keys(project.decisions).length, 'Decision', 'Decisions')}. You can undo it until you close or reload this page. The Studio also keeps a copy of the replaced project where this browser allows it; the Summary lists every kept copy.`, confirmLabel: 'Start again', cancelLabel: 'Keep my project', run: start } });
    },

    moreDirections() {
      const { generated } = get();
      const avoid = [...DIRECTIONS, ...generated].map((d) => d.params);
      const seed = (generated.length / 6 + 1) * 7919 + 13;
      set({ generated: [...generated, ...generateDirections(seed, 6, avoid)] });
    },

    setProfile(profile) {
      commit({ ...get().project, a11y: profile });
    },

    rename(name) {
      commit({ ...get().project, name: name.slice(0, 120) });
    },

    setDevice(device) {
      set({ device });
      storePrefs();
    },
    setRegion(region) {
      set({ region });
      refocus();
    },
    setWireframe(on) {
      set({ wireframe: on });
      storePrefs();
    },
    setStudioLook(look) {
      set({ studioLook: look });
      storePrefs();
    },

    requestImport(data, fileName) {
      const parsed = parseProject(data);
      if (!parsed.ok) return parsed.error;
      const replace = (): void => {
        replaceProject(parsed.project, [`Opened the project “${parsed.project.name}”.`, parsed.migratedFrom !== null ? 'An earlier version of the Studio made this file; it was brought up to date.' : '', ...parsed.notes].filter(Boolean).join(' '));
        const kept = get().notice;
        enter('summary', firstOpenStepId(parsed.project));
        set({ notice: kept });
      };
      const open = (): void => replaceKeepingCopy(replace, `you opened the file “${fileName.slice(0, 60)}”`);
      if (!hasWork(get().project)) open();
      else set({ confirmation: { title: 'Replace the open project with this file?', body: `The file ${fileName.slice(0, 80)} holds the project “${parsed.project.name}”. Opening it replaces the project on screen. You can undo it until you close or reload this page. The Studio also keeps a copy of the replaced project where this browser allows it; the Summary lists every kept copy.`, confirmLabel: 'Open the file', cancelLabel: 'Keep my project', run: open } });
      return null;
    },

    requestStartOver() {
      const { project } = get();
      set({
        confirmation: {
          title: 'Start a new project?',
          body: `This clears the Direction, ${plural(Object.keys(project.decisions).length, 'Decision', 'Decisions')}, the project name, and the Contrast checks setting. You can undo it until you close or reload this page. The Studio also keeps a copy of the replaced project where this browser allows it; the Summary lists every kept copy.`,
          confirmLabel: 'Yes, clear this project',
          cancelLabel: 'Keep it',
          danger: true,
          run: () =>
            replaceKeepingCopy(() => {
              replaceProject(createProject('My project'), 'Started a new project.');
              const kept = get().notice;
              enter('directions', STEPS[0]!.id);
              set({ notice: kept });
            }, 'you started a new project'),
        },
      });
    },

    undo() {
      const { history, stepId } = get();
      const previous = history[history.length - 1];
      if (!previous) return;
      // Say what came back and where, so that an Undo of an earlier Step is not invisible (finding U2-07).
      const now = get().project;
      const differs = (a: unknown, b: unknown): boolean => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
      const touched = STEPS.filter((st) => differs(now.decisions[st.id], previous.decisions[st.id]) || differs(ownedValues(st, now.params), ownedValues(st, previous.params)));
      const wholeProject = now.direction !== previous.direction || touched.length > 3;
      const first = touched[0];
      const text = wholeProject || !first
        ? `Undone: your earlier project is back, the one that started from ${directionName(previous, get().generated)}.`
        : touched.length === 1
          ? `Undone: the Step “${first.name}” is back to how it was.`
          : `Undone: the Steps ${touched.map((st) => `“${st.name}”`).join(' and ')} are back to how they were.`;
      const elsewhere = !wholeProject && first && first.id !== stepId ? first : null;
      set({
        project: previous, history: history.slice(0, -1), variations: null, shownId: appliedCardId(previous, stepOf(stepId)),
        notice: { text, ...(elsewhere ? { actions: [{ label: `Go to “${elsewhere.name}”`, run: () => get().go('steps', elsewhere.id) }] } : {}) },
      });
      persist();
      refocus();
    },

    dismissNotice() {
      if (!get().notice?.sticky) set({ notice: null });
    },

    answerConfirmation(yes) {
      const pending = get().confirmation;
      set({ confirmation: null });
      if (yes) pending?.run();
    },

    flush() {
      // The page is closing or going to the background: write the browser copy at once (finding P-06).
      clearTimeout(saveTimer);
      if (get().saved === 'held') return;
      const text = JSON.stringify(get().project);
      if (text === lastSavedText) return;
      // The browser copy is written first, in this same instant; the page database follows if the page lives long enough.
      saveBrowserNow(text, new Date().toISOString());
      void saveNow();
    },
  };
});
