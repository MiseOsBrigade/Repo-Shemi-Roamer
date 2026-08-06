#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${MISEOS_BASE_URL:-http://localhost:8787}"
curl --fail-with-body -sS \
  -X POST "$BASE_URL/v1/execute/miseos.analytics-engine" \
  -H 'content-type: application/json' \
  -d '{"values":[4,8,15,16,23,42]}'
