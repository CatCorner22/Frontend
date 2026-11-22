#!/usr/bin/env bash
# Builds the Studio page at 2 commits in separate checkouts and prints the SHA-256 of each (criterion C3, the Summary's comparison).
# Usage: bash hinshitsu/evidence/compare-builds.sh <final commit> > hinshitsu/evidence/compare-builds.txt 2>&1
set -u
MAIN="$(cd "$(dirname "$0")/../.." && pwd)"; T="$(mktemp -d)"
for c in "$1" 523ae8e; do
  git -C "$MAIN" worktree add -q --detach "$T/$c" "$c"
  echo "== commit $c: npm ci --ignore-scripts =="; (cd "$T/$c" && npm ci --ignore-scripts 2>&1 | tail -4; echo "exit ${PIPESTATUS[0]}")
  echo "== commit $c: npm run build:page =="; (cd "$T/$c" && npm run build:page 2>&1 | tail -6; echo "exit ${PIPESTATUS[0]}")
  echo "== commit $c: sha256sum =="; (cd "$T/$c" && sha256sum apps/studio/dist/artifact/refraction-studio.html && wc -c apps/studio/dist/artifact/refraction-studio.html)
  git -C "$MAIN" worktree remove --force "$T/$c"
done
