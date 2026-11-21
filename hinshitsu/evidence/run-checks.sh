#!/usr/bin/env bash
# Runs the 3 checks that C5 requires before a commit and saves the last lines of each output.
# Usage: bash hinshitsu/evidence/run-checks.sh <n>   (writes hinshitsu/evidence/commit-<n>-checks.txt)
set -u
cd "$(dirname "$0")/../.."
export PW_CHROMIUM="${PW_CHROMIUM:-/opt/pw-browsers/chromium}"
out="hinshitsu/evidence/commit-$1-checks.txt"
tmp="$(mktemp -d)"
{
  echo "Checks before commit $1 of hinshitsu/PLAN.md. Started $(date -u +%Y-%m-%dT%H:%M:%SZ). Parent commit: $(git rev-parse --short HEAD)."
  echo "Tree checked (files changed against the parent, with the SHA-256 of each):"
  git status --porcelain | grep -v 'hinshitsu/evidence/commit-' | while read -r _ f; do [ -f "$f" ] && echo "  $(sha256sum "$f" | cut -c1-16)  $f"; done
  echo; echo "== npm run check =="
  npm run check > "$tmp/1" 2>&1; echo "exit $?"; tail -6 "$tmp/1"
  echo; echo "== npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e =="
  npx vitest run --config vitest.e2e.config.ts plugin/fit/e2e > "$tmp/2" 2>&1; echo "exit $?"; grep -E '^ *(Test Files|Tests|Duration| FAIL|×)' "$tmp/2" | tail -30
  echo; echo "== npm run build:page, then npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts =="
  npm run build:page > "$tmp/3" 2>&1; echo "build exit $?"
  npx vitest run --config vitest.e2e.config.ts apps/studio/e2e/deliverable.e2e.ts > "$tmp/4" 2>&1; echo "exit $?"; grep -E '^ *(Test Files|Tests|Duration| FAIL|×)' "$tmp/4" | tail -10
  echo; echo "Finished $(date -u +%Y-%m-%dT%H:%M:%SZ)."
} > "$out" 2>&1
cp "$tmp/2" hinshitsu/evidence/.last-fit-e2e.log 2>/dev/null
echo "written $out"
