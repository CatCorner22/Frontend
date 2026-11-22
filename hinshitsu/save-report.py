#!/usr/bin/env python3
"""Save a SUB-AGENT's report whole (rule 1.6). Reads the runtime's transcript of the run, takes the text of the
report that the SUB-AGENT handed back, and writes it to the report file with the runtime's identifier on line 1.
The ORCHESTRATOR does not retype a report: this script copies it, so that no word changes.
Usage: save-report.py <identifier> <report path>"""
import json, sys, pathlib
ident, out = sys.argv[1], pathlib.Path(sys.argv[2])
src = pathlib.Path(f'/tmp/claude-0/-home-user-Frontend/17dfb966-ca7f-5cb4-afe4-76b8ac81e8d9/tasks/{ident}.output')
report = None
for line in src.read_text(encoding='utf8').splitlines():
    try: rec = json.loads(line)
    except Exception: continue
    msg = rec.get('message') or {}
    for part in (msg.get('content') or []) if isinstance(msg.get('content'), list) else []:
        if part.get('type') == 'tool_use' and 'Handback' in str(part.get('name', '')):
            inp = part.get('input') or {}
            text = max((v for v in inp.values() if isinstance(v, str)), key=len, default=None)
            if text: report = text
if report is None:
    sys.exit('no handed-back report found in the transcript')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(f'{ident}\n\n{report.rstrip()}\n', encoding='utf8')
print(f'{out}: {len(report)} characters, {len(report.splitlines())} lines')
