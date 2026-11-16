// What one Undo takes back, in words (finding U6-23). A pure function of the open project and the one before it, so that every branch has a unit test.
import { STEPS, overlaysOf, ownedValues, plainName, type Project, type Step } from '@refraction/core';

/**
 * What one Undo takes back, found by comparing the open project with the one before it. The same finding gives the words that
 * stand beside the Undo button before the press and the words of the notice after it (finding U6-23).
 */
export function undoWords(now: Project, previous: Project, startName: string): { preview: string; done: string; steps: Step[]; whole: boolean } {
  const differs = (a: unknown, b: unknown): boolean => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
  const touched = STEPS.filter((st) => differs(now.decisions[st.id], previous.decisions[st.id]) || differs(ownedValues(st, now.params), ownedValues(st, previous.params)));
  const whole = now.direction !== previous.direction || touched.length > 3;
  const first = touched[0];
  const quoted = (list: Step[]): string => list.map((st) => `“${st.name}”`).join(' and ');
  const start = startName;
  // A change that touched no Step: the name, the Contrast checks setting, the Overlays, the texts of the page, or the three answers.
  // Saying "your earlier project is back" for one of them would overstate what Undo does.
  if (!whole && first) {
    return touched.length === 1
      ? { preview: `Undo takes back: the Step “${first.name}” goes back to how it was.`, done: `Undone: the Step “${first.name}” is back to how it was.`, steps: touched, whole }
      : { preview: `Undo takes back: the Steps ${quoted(touched)} go back to how they were.`, done: `Undone: the Steps ${quoted(touched)} are back to how they were.`, steps: touched, whole };
  }
  if (!whole) {
    const small = now.name !== previous.name ? { preview: `Undo takes back: the project’s name goes back to “${plainName(previous.name)}”.`, done: `Undone: the project’s name is “${plainName(previous.name)}” again.` }
      : now.a11y !== previous.a11y ? { preview: 'Undo takes back: the Contrast checks setting goes back to how it was.', done: 'Undone: the Contrast checks setting is back to how it was.' }
        : differs(overlaysOf(now), overlaysOf(previous)) ? { preview: 'Undo takes back: the Overlays go back to how they were.', done: 'Undone: the Overlays are back to how they were.' }
          : differs(now.content, previous.content) ? { preview: 'Undo takes back: the texts of the page go back to how they were.', done: 'Undone: the texts of the page are back to how they were.' }
            : differs(now.brief, previous.brief) ? { preview: 'Undo takes back: your three answers about the project go back to how they were.', done: 'Undone: your three answers about the project are back to how they were.' }
              : null;
    if (small) return { ...small, steps: [], whole };
  }
  return { preview: `Undo takes back: the whole project goes back to the earlier one, which started from ${start}.`, done: `Undone: your earlier project is back, the one that started from ${start}.`, steps: touched, whole: true };
}
