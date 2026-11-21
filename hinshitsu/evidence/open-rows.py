#!/usr/bin/env python3
"""List the rows of redteam/FINDINGS.md of grade blocker or major whose Status text says that some part is open.

Rule (repeatable): a row counts when its Severity cell is "blocker" or "major" and its Status cell
matches, without regard to letter case, 1 of these patterns:
  "in part", "still open", "open:", "not repaired", "not fixed", "stays open", "not changed", ": open.", "deferred",
  or the cell begins with "open". (The last 3 patterns were added after the re-audit of E-72, FINDING F-1.)
A row whose Status cell also holds "Closed on" or "closed:" is listed apart, as "says closed".
Usage: python3 hinshitsu/evidence/open-rows.py [--full]
"""
import re, sys
PAT = re.compile(r"in part|still open|open:|not repaired|not fixed|stays open|not changed|: open\.|deferred", re.I)
rows, closed, total = [], [], 0
for line in open("redteam/FINDINGS.md", encoding="utf-8"):
    if not line.startswith("| ") or line.startswith("| ID "):
        continue
    cells = [c.strip() for c in line.strip().strip("|").split(" | ")]
    if len(cells) < 7:
        continue
    total += 1
    sev, status = cells[3].lower(), cells[-1]
    if sev not in ("blocker", "major"):
        continue
    if PAT.search(status) or status.lower().startswith("open"):
        (closed if re.search(r"closed on|closed:", status, re.I) else rows).append((cells[0], sev, cells[4], status))
print("rows in the table: %d" % total)
print("open or part-open, blocker or major: %d (blocker %d, major %d)" % (
    len(rows), sum(r[1] == "blocker" for r in rows), sum(r[1] == "major" for r in rows)))
for r in rows:
    print("%s | %s | %s" % (r[0], r[1], (r[2] + " || " + r[3]) if "--full" in sys.argv else r[2][:110]))
print("says closed, yet matches a pattern: %d" % len(closed))
for r in closed:
    print("%s | %s | %s" % (r[0], r[1], r[2][:110]))
