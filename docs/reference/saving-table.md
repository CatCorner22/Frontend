# The saving table: what the Studio does with your work, in every situation

**What this is.** One table of everything that can happen to the work on screen: the five situations a tab can be in, the events that can occur, and what the Studio must do in each case. Each cell names the automatic test that checks it.

**Why it exists.** Six of the serious findings of the break-it campaign (F-1, F-2, F-10, F-12, F-16, F-18) came from this one area. Each was repaired as a single case. A table shows the missing cases at once; a case-by-case repair shows only the case in front of it. Writing this table on 2026-11-14 showed five cells without a test, and one of them was a real fault (the first row below).

**How to read it.** Find the row of the tab's situation, then the event. "Test" is the exact name of a test in `apps/studio/e2e/studio.e2e.ts`. "No automatic test" is stated where it is so, with the reason.

**What can go wrong with this file.** It can fall behind the code. The drift and truth auditor checks it at each review; the test names in it must exist word for word.

## The five situations of a tab

| Situation | What it means | What the status line says |
|---|---|---|
| Opening | The Studio is still looking for the saved project. The screen holds a placeholder. | "Opening your project…" |
| Saved | The screen shows exactly what is stored. | "Saved in this browser, on this computer", or "Saved on this page" on the private page; "Nothing to save yet" before the first change of a new project |
| Change pending | The owner changed something less than 0.3 seconds ago, or a save is under way. | "Saving…" |
| Save failed | The last save was refused: storage is full or blocked. The work is on screen only. (After an Undo back to exactly what is stored, the tab is "Saved" again, because the work on screen is the stored work; the owner decided this on 2026-11-15, decision D55, finding F-23.) | "Cannot save here: …", with the button "Try to save again" |
| Not saving | The Studio has stopped saving until the owner decides: another tab changed the project, the saved copy cannot be read, or a copy could not be kept. | "Not saving: see the notice at the top of the page" |

## Opening

| Event | What must happen | Test |
|---|---|---|
| The owner types or clicks | Nothing is recorded; the name field and the Contrast checks list are switched off | "saves nothing while the saved project is still opening: leaving, a tab switch, and typing change no copy (finding "saving 0")" |
| The tab goes to the background, or closes | Nothing is written and nothing is kept: the placeholder is nobody's work | the same test |
| Another tab saves | When this tab finishes opening, it must not show the older project under "Saved": it shows what storage holds, or it stops saving and says so | "opening, and another tab saves meanwhile: the tab does not say "Saved" over a project that storage no longer holds" (new on 2026-11-14; it failed before the repair) |
| The page's database answers late, with a newer copy | The copy is kept before any save can replace it; if it cannot be kept, saving stops | "keeps a copy that the page database hands over late, before any save can replace it (findings "saving 2" and "gaps 3")" |
| The saved copy cannot be read | It is kept, never overwritten, and offered as a download; saving stops until the owner decides | "never overwrites a saved project that it cannot read, and offers it as a download (findings SEC-03, P-05)" |
| Opening changes the saved copy (an older form, a detail that cannot stand) | The original is kept first; the project as opened is stored; the next opening says nothing | "stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing" |

## Saved

| Event | What must happen | Test |
|---|---|---|
| The owner changes something | The tab goes to "Change pending"; the change is saved 0.3 seconds later | "saves to both stores on the private page and says so" |
| The tab goes to the background, and its last save is more than 2 seconds old (or it has not saved at all) | Nothing is written and nothing is kept | "saved, and the tab goes to the background: nothing is written and nothing is kept" (new on 2026-11-14) |
| The tab goes to the background within 2 seconds after its own save | The saved project is not written again. The work goes into an entry of the page's own, because another tab's write may have replaced the save unseen (see "Why 2 seconds" below). Once the page lives on and storage still holds its work, the entry is removed | "saved a moment ago, and the tab goes to the background: the work goes into an entry of the page’s own, and the entry goes when the page lives on" (new on 2026-11-15, finding F-18) |
| The owner comes back to the tab | The Studio looks at storage; if another tab saved meanwhile, it stops saving and says so | "notices another tab’s save when the owner comes back to the tab, even if no storage event arrived (finding F-12)" |
| Another tab saves | The tab stops saving and says so, with two choices | "stops saving, and says so, when another tab changed the project (finding SEC-06)" |
| The tab closes or reloads, and its last save is more than 2 seconds old (or it has not saved at all) | Nothing is written: storage already holds the work | covered by the next opening in "stores the project as opened once the original is kept, so that the next opening changes nothing and says nothing" |
| The tab closes or reloads within 2 seconds after its own save | The saved project is not written again. The work goes into an entry of the page's own. The next opening removes the entry when the saved project holds the same work, and keeps it for good, and says so, when another tab's write replaced that work | "saved a moment ago, and the tab closes: the next opening removes the entry of its own when the saved project holds the same work"; "keeps for good, and reports, the saved work of a closing page that another page’s closing write replaced in the same moment (finding F-18)" (both new on 2026-11-15) |
| The owner replaces the project (another Direction, a file, a new project) | The Studio asks first, keeps a copy of the replaced project, and Undo brings it back within its stated reach | "keeps the project that "Start again" replaces, so that it survives a reload (finding U2-01)"; "asks before a file replaces work, and Undo brings the work back (findings FTU-25, SEC-06)" |

## Change pending

| Event | What must happen | Test |
|---|---|---|
| 0.3 seconds pass and the save succeeds | "Saved" | "saves to both stores on the private page and says so" |
| The save is refused (storage full) | "Cannot save here", with the button "Try to save again" | "offers to try the save again after it failed, and saves once storage has room" |
| The save finds another tab's save in storage | The tab stops saving, also when both saves carry the same save time | "takes a save with the same save time but another mark for another tab’s save, and stops saving (finding F-12)" |
| The tab goes to the background | The work goes into an entry of the page's own, then into the saved project; once the save has succeeded and the page lives, the entry is removed | "saves at once when the page goes to the background (finding P-06)"; "removes the entry of its own when the page lives on and has saved" |
| The tab closes or reloads | The same two writes; the next opening removes the entry when the saved project holds the same work, and keeps it for good otherwise | "puts unsaved work into an entry of the page’s own before a closing page writes the saved project, and settles it at the next opening"; "keeps for good, and reports, the work of a closing page that another page’s save replaced in the same moment" |
| Undo brings the screen back to what is stored | The status line settles; it does not stay at "Saving…" | "settles the status line when a save has nothing to write, and after a failed save says “Saved” again once an Undo brings back the saved state (findings F-7 and F-23)" |

## Save failed

| Event | What must happen | Test |
|---|---|---|
| The owner changes something more | Each change tries again; the statement stays while storage is full | "settles the status line when a save has nothing to write, and after a failed save says “Saved” again once an Undo brings back the saved state (findings F-7 and F-23)" |
| The owner presses "Try to save again" | A real attempt | "offers to try the save again after it failed, and saves once storage has room" |
| An Undo brings back exactly what is stored | The line says "Saved" again without a press, and the button goes; the next change that cannot be saved brings both back | "says “Saved” without a press of "Try to save again" after an Undo back to the saved state, and really tries when a later save fails" |
| The tab goes to the background | The work stays on screen; the statement stays true | "a save failed, and the tab goes to the background or is asked to close: the work stays on screen, the status stays true, and the browser is asked to ask" (new on 2026-11-14) |
| The tab is asked to close | The work is neither saved nor kept, so the Studio asks the browser to put its own "leave this page?" question | the same test. No automatic test covers the browser's question itself: the test browser answers it by itself. |
| The owner replaces the project | No copy can be kept, so the Studio asks once more and says what is at stake | "asks once more before it replaces a project whose copy it cannot keep, because storage is full (finding S3-01)" |

## Not saving

| Event | What must happen | Test |
|---|---|---|
| The owner goes on working | Nothing is saved; the work stays on screen; the notice with its buttons stays | "keeps the notice of a stopped save through Undo and a change of screen: a second tab (finding F-1)" |
| The tab goes to the background | The unsaved work is kept as one running copy, which a newer one replaces | "keeps one running copy for a tab that is not saving, however often the tab goes to the background (finding "saving 7")" |
| The tab closes or reloads | The unsaved work is kept as a copy; the next opening says so | "keeps unsaved work as a copy when a tab that is not saving closes or reloads" |
| Two such tabs close in the same moment | Both copies are kept | "keeps both copies when two tabs that are not saving close in the same moment (finding F-10)" |
| The other tab saves a second time | The tab stays as it is; a later "Keep this tab’s copy" keeps the other tab's newest copy | "not saving, and the other tab saves a second time: "Keep this tab’s copy" keeps the other tab’s newest copy, not its first" (new on 2026-11-14) |
| The owner presses "Keep this tab’s copy" | The other copy is kept first; this tab's work is saved | "stops saving, and says so, when another tab changed the project (finding SEC-06)" |
| The owner presses "Reload to see the other copy" | This tab's copy is kept first; if it cannot be kept, the Studio asks | "keeps this tab’s copy before "Reload to see the other copy" reloads (finding F-2)"; "asks before "Reload to see the other copy" discards a tab’s copy that it cannot keep, because storage is full (finding F-2)" |
| The owner presses "Go on" or "Start a new project" | What another tab saved meanwhile is kept first; saving resumes at once | "saves at once after "Go on: let the Studio save over it", also when nothing changed on screen (finding F-15)"; "keeps what another tab saved before "Start a new project" in a stopped tab replaces it (finding "saving 4")" |
| The owner starts again from another Direction | The replaced project is kept for good, also when the tab's running copy held the same text | "keeps the replaced project for good when a stopped tab starts again, although the tab’s running copy held the same text" |

## The owner's own Directions (a list of its own, beside the project)

**What this is.** A Direction of the owner's own must outlive the project it came from, so it is not part of the saved project. The browser holds one entry with the whole list. The list is small and changes only when the owner keeps, renames, or removes a Direction, so it needs no status line: each action says at once whether it worked.

| Event | What must happen | Test |
|---|---|---|
| The owner keeps the design as a Direction | The stored list is read afresh, the new Direction is added, and the list is written. A notice says where to find it | "keeps the design on screen as a Direction of the owner’s own, shows it under “Your own” after a reload, and starts a project that holds exactly the kept design" |
| The page reloads, or the Studio opens | The list is read; the Directions screen shows the group "Your own" | the same test |
| A project that started from an own Direction is saved and opened again | It still names that Direction | the same test |
| Storage has no room | Nothing is kept, the stored list stays as it was, and words beside the button say so | "says so when storage has no room for an own Direction, and keeps none" |
| Another tab kept a Direction meanwhile | This tab's next keep adds to the other tab's list; it never writes its own older list over it. When the owner comes back to this tab, it reads the list again | "adds to the list that another tab stored, and shows the other tab’s Direction when the owner comes back" |
| The stored list cannot be read (damaged, or not a list at all) | The Studio shows none. Before a new Direction replaces the entry, the entry is kept among the kept copies; if it cannot be kept, nothing is written | "keeps a stored list of own Directions that it cannot read, before a new Direction replaces it" |
| The owner renames a Direction | The stored list is read afresh; the name is checked against every other name; the list is written. A project that started from the Direction shows the new name, because it holds the Direction's identifier, not its name | "renames an own Direction on its card; the card and a project that started from it show the new name, and a name in use is refused" |
| The owner removes a Direction | The Studio asks first. After "Yes, remove it for good" the stored list is read afresh and written without it. Undo does not bring it back, and the question says so. A project that started from it keeps its design and says that its start was removed | "asks before it removes an own Direction; afterwards the card is gone, and a project that started from it says so and keeps its design" |
| The owner downloads the list | The list as storage holds it now goes into one file; nothing in storage changes | "downloads every own Direction as one file, and opens that file in a browser that holds none; a second opening adds none twice" |
| The owner opens a file of own Directions | The stored list is read afresh; the Directions that it lacks are added; the list is written only if something was added. Words say how many were added, how many were left out, and why | the same test; "refuses a file that is not a set of own Directions, in plain words, and changes nothing" |
| An entry of the list cannot stand (a name in use, a value the Studio does not know) | That entry is not shown; the others are | unit test "leaves out, with the reason, an entry that cannot stand or whose name is in use; the rest is added" |

**What no test covers.** The private page's database: own Directions live in the browser's storage only, also on the private page, where that storage is a convenience and can be cleared. The download of the list (feature F005) is the safeguard.

## Why 2 seconds (finding F-18)

**What goes wrong without it.** A browser passes one tab's storage write on to the other tabs with a short delay (a few milliseconds). In that gap, tab A cannot see that tab B has just saved. If A closes in that gap, A's closing write replaces B's save. B counts its work as saved, so B used to write nothing when it closed, and B's work was then in no entry. A judge measured 2 such losses in 120 trials on 2026-11-14 (11 milliseconds lay between the two writes in the recorded loss).

**What the rule does.** A tab that closes, or goes to the background, within 2 seconds after its own save does not trust that save yet: it also writes its work into an entry of its own, which no other tab writes. The next opening settles the entry (the two cells above).

**Why 2 seconds and not less.** The gap is milliseconds long; 2 seconds is a wide margin. A longer window costs little: one more entry, which the next opening removes. After 2 seconds, a tab that is still open has heard of any other tab's write and has stopped saving (the row "Another tab saves").

**What can still go wrong.** Storage with no room for the entry; a browser that ends the tab without running the page's last code. Both are listed below.

## What no test covers (stated plainly)

- The browser's own "leave this page?" question. The Studio can only ask the browser to put it; the test browser answers it by itself.
- A browser that ends a tab without running the page's last code (a crash, a forced quit). Work from the last 0.3 seconds is then lost.
- A closing page when storage has no room for the entry of its own: it writes the saved project as before, and two pages that close in the same instant can then still lose one change. The same holds for a page that closes within 2 seconds after its own save.
- The race itself. Whether two real tabs lose a change depends on timing that a test cannot fix, so the tests above stage the order of the writes by hand. The builder's race trial of 2026-11-15 ran outside the automatic tests; its result is in `redteam/FINDINGS.md`, row C4-F18.
- Any browser other than Chromium, and the real private page with its real database.
