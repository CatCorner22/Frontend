#!/usr/bin/env bash
# Writes the stored receipts of the 3 trials again with the program, after a change of the receipt's wording.
set -eu
cd "$(dirname "$0")/../.."
export PW_CHROMIUM="${PW_CHROMIUM:-/opt/pw-browsers/chromium}"
for id in 001 002 003; do
  out="$(mktemp -d)"
  node plugin/fit/src/cli.ts "plugin/fit/trials/$id/index.html" "plugin/fit/trials/$id/files" "$out" | tail -1 || true
  cp "$out/receipt.json" "$out/RECEIPT.md" "plugin/fit/trials/$id/"
done
git diff --stat -- plugin/fit/trials | tail -8
