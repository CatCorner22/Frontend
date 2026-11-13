// The Studio's state. Every change to the design goes through the engine in @refraction/core.
import {
  STEPS, STEP_BY_ID, applyDirection, closerOptions, createProject, firstOpenStepId, nextStepId, parseProject, pick, pickValues, prevStepId,
  previewParams, skip, tune, type A11yProfile, type DesignParams, type Direction, type GeneratedOption, type MockupFocus, type Project, type Step,
} from '@refraction/core';
import { create } from 'zustand';
import { loadSaved, saveProject, type SaveOutcome } from './platform';

export type Device = 'phone' | 'tablet' | 'desktop';
export const DEVICE_WIDTH: Record<Device, number> = { phone: 375, tablet: 768, desktop: 1280 };
export type View = 'directions' | 'steps' | 'summary';

interface Closer {
  /** The Option the neighbors were generated from. */
  baseOptionId: string;
  baseValues: Partial<DesignParams>;
  round: number;
  options: GeneratedOption[];
}

export interface StudioState {
  ready: boolean;
  project: Project;
  view: View;
  stepId: string;
  /** The Option on show in the large preview. Looking is not deciding. */
  focusedId: string | null;
  closer: Closer | null;
  device: Device;
  region: MockupFocus | 'auto';
  /** Structure Steps preview in grayscale unless this is off. */
  wireframe: boolean;
  studioLook: 'studio' | 'project';
  saved: SaveOutcome | 'saving';
  notice: string | null;

  init(): Promise<void>;
  go(view: View, stepId?: string): void;
  focus(optionId: string): void;
  pickFocused(advance: boolean): void;
  skipStep(): void;
  back(): void;
  startCloser(): void;
  endCloser(): void;
  tuneValue(key: keyof DesignParams, value: number): void;
  useDirection(direction: Direction): void;
  setProfile(profile: A11yProfile): void;
  rename(name: string): void;
  setDevice(device: Device): void;
  setRegion(region: MockupFocus | 'auto'): void;
  setWireframe(on: boolean): void;
  setStudioLook(look: 'studio' | 'project'): void;
  importProject(data: unknown): string | null;
  startOver(): void;
  dismissNotice(): void;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function hashFor(view: View, stepId: string): string {
  return view === 'steps' ? `#${stepId}` : `#${view}`;
}

function readHash(): { view: View; stepId?: string } | null {
  const name = window.location.hash.replace(/^#/, '');
  if (name === 'directions' || name === 'summary') return { view: name };
  if (STEP_BY_ID[name]) return { view: 'steps', stepId: name };
  return null;
}

export const stepOf = (id: string): Step => STEP_BY_ID[id] ?? STEPS[0]!;

/** The parameters to show for an Option of the current Step. */
export function paramsForOption(state: Pick<StudioState, 'project' | 'stepId' | 'closer'>, optionId: string): DesignParams {
  const { project, closer } = state;
  if (closer) {
    const generated = closer.options.find((o) => o.id === optionId);
    return { ...project.params, ...closer.baseValues, ...(generated?.values ?? {}) };
  }
  const step = stepOf(state.stepId);
  const decision = project.decisions[step.id];
  // The decided Option shows the project as it stands, including hand-tuned values.
  if (decision && decision.optionId === optionId) return project.params;
  const option = step.options.find((o) => o.id === optionId);
  return option ? previewParams(project, option) : project.params;
}

/** Which Option of a Step matches the project's current values, if any. */
export function currentOptionId(project: Project, step: Step): string | null {
  const decision = project.decisions[step.id];
  if (decision) return decision.optionId;
  for (const option of step.options) {
    const values = previewParams(project, option);
    if ((Object.keys(values) as (keyof DesignParams)[]).every((k) => values[k] === project.params[k])) return option.id;
  }
  return null;
}

export const useStudio = create<StudioState>((set, get) => {
  const persist = (): void => {
    set({ saved: 'saving' });
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void saveProject(get().project).then((outcome) => set({ saved: outcome }));
    }, 700);
  };

  const enter = (view: View, stepId: string): void => {
    const step = stepOf(stepId);
    const project = get().project;
    set({ view, stepId: step.id, closer: null, region: 'auto', focusedId: currentOptionId(project, step) ?? step.defaultOptionId });
    const wanted = hashFor(view, step.id);
    if (window.location.hash !== wanted) window.history.replaceState(null, '', wanted);
  };

  const commit = (project: Project): void => {
    set({ project });
    persist();
  };

  return {
    ready: false,
    project: createProject('My first project'),
    view: 'directions',
    stepId: STEPS[0]!.id,
    focusedId: STEPS[0]!.defaultOptionId,
    closer: null,
    device: 'desktop',
    region: 'auto',
    wireframe: true,
    studioLook: 'studio',
    saved: 'none',
    notice: null,

    async init() {
      const loaded = await loadSaved();
      let project = get().project;
      let notice: string | null = null;
      if (loaded.data !== null) {
        const parsed = parseProject(loaded.data);
        if (parsed.ok) project = parsed.project;
        else notice = 'The saved project could not be read, so the Studio started a new one.';
      }
      set({ project, saved: loaded.from, notice, ready: true });
      const fromHash = readHash();
      const started = project.direction !== null || Object.keys(project.decisions).length > 0;
      if (fromHash) enter(fromHash.view, fromHash.stepId ?? firstOpenStepId(project));
      else enter(started ? 'steps' : 'directions', firstOpenStepId(project));
      window.addEventListener('hashchange', () => {
        const next = readHash();
        if (next) enter(next.view, next.stepId ?? get().stepId);
      });
    },

    go(view, stepId) {
      enter(view, stepId ?? get().stepId);
    },

    focus(optionId) {
      set({ focusedId: optionId });
    },

    pickFocused(advance) {
      const { project, stepId, focusedId, closer } = get();
      if (!focusedId) return;
      let next: Project;
      if (closer) {
        const generated = closer.options.find((o) => o.id === focusedId);
        if (!generated) return;
        next = pickValues(project, stepId, closer.baseOptionId, { ...closer.baseValues, ...generated.values });
      } else {
        next = pick(project, stepId, focusedId);
      }
      commit(next);
      set({ closer: null });
      if (advance) {
        const following = nextStepId(stepId);
        if (following) enter('steps', following);
        else enter('summary', stepId);
      }
    },

    skipStep() {
      const { project, stepId } = get();
      commit(skip(project, stepId));
      const following = nextStepId(stepId);
      if (following) enter('steps', following);
      else enter('summary', stepId);
    },

    back() {
      const { stepId, closer } = get();
      if (closer) {
        set({ closer: null });
        return;
      }
      const previous = prevStepId(stepId);
      if (previous) enter('steps', previous);
      else enter('directions', stepId);
    },

    startCloser() {
      const state = get();
      const step = stepOf(state.stepId);
      if (!step.tunables?.length || !state.focusedId) return;
      const baseValues: Partial<DesignParams> = {};
      const shown = paramsForOption(state, state.focusedId);
      const keys = new Set<keyof DesignParams>(step.options.flatMap((o) => Object.keys(previewParams(state.project, o)) as (keyof DesignParams)[]));
      for (const key of keys) (baseValues as Record<string, unknown>)[key] = shown[key];
      const baseOptionId = state.closer?.baseOptionId ?? state.focusedId;
      const round = state.closer ? state.closer.round + 1 : 0;
      const options = closerOptions({ ...state.project, params: { ...state.project.params, ...baseValues } }, step.id, round);
      set({ closer: { baseOptionId, baseValues, round, options }, focusedId: options[0]?.id ?? null });
    },

    endCloser() {
      const step = stepOf(get().stepId);
      set({ closer: null, focusedId: currentOptionId(get().project, step) ?? step.defaultOptionId });
    },

    tuneValue(key, value) {
      const { project, stepId } = get();
      const step = stepOf(stepId);
      commit(tune(project, stepId, key, value));
      set({ closer: null, focusedId: get().project.decisions[stepId]?.optionId ?? step.defaultOptionId });
    },

    useDirection(direction) {
      commit(applyDirection(get().project, direction));
      enter('steps', STEPS[0]!.id);
    },

    setProfile(profile) {
      commit({ ...get().project, a11y: profile });
    },

    rename(name) {
      commit({ ...get().project, name: name.slice(0, 120) });
    },

    setDevice(device) {
      set({ device });
    },
    setRegion(region) {
      set({ region });
    },
    setWireframe(on) {
      set({ wireframe: on });
    },
    setStudioLook(look) {
      set({ studioLook: look });
    },

    importProject(data) {
      const parsed = parseProject(data);
      if (!parsed.ok) return parsed.error;
      commit(parsed.project);
      enter('summary', firstOpenStepId(parsed.project));
      return null;
    },

    startOver() {
      commit(createProject('My project'));
      enter('directions', STEPS[0]!.id);
    },

    dismissNotice() {
      set({ notice: null });
    },
  };
});
