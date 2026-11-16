// The fixed project of the first build trial (SPEC.md section 2.11): the plain start, six Decisions that each differ from the start,
// one reason in the owner's words, and the sample content. A fixed project and a fixed time make the same seven files every day.
import { createProject, pick, setReason, type Project } from '@refraction/core';

const WHEN = '2026-11-16T09:00:00.000Z';

/** The six Decisions: Step, then Option. Each Option differs from the Step's start, so that a builder cannot pass by ignoring the files. */
export const TRIAL_DECISIONS: readonly (readonly [string, string])[] = [
  ['nav', 'top-centered'],
  ['hero', 'split-media'],
  ['density', 'comfortable'],
  ['typeface', 'warm-editorial'],
  ['accent', 'forest'],
  ['radius', 'soft'],
];

export function trialProject(): Project {
  let project = createProject('Harbor Street Dental trial');
  for (const [step, option] of TRIAL_DECISIONS) project = pick(project, step, option, WHEN);
  return setReason(project, 'accent', 'A calm green, so that the practice does not feel clinical.');
}
