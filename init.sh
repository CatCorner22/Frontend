#!/usr/bin/env bash
# Startup routine for each session: install the packages, then run a quick smoke check (the type check).
set -euo pipefail
cd "$(dirname "$0")"
echo "== install =="
npm ci --ignore-scripts
echo "== smoke check =="
npm run typecheck
echo "init.sh finished"
