#!/usr/bin/env bash
set -euo pipefail
: "${REPOSITORY:?Set REPOSITORY as owner/name}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"

# Private vulnerability reporting
gh api --method PUT "repos/${REPOSITORY}/private-vulnerability-reporting"

# Dependabot alerts and security updates
gh api --method PUT "repos/${REPOSITORY}/vulnerability-alerts"
gh api --method PUT "repos/${REPOSITORY}/automated-security-fixes"

# Secret scanning and push protection; availability depends on repository plan/visibility.
gh api --method PATCH "repos/${REPOSITORY}"   -F security_and_analysis[secret_scanning][status]=enabled   -F security_and_analysis[secret_scanning_push_protection][status]=enabled

# Create or update an organization/repository ruleset manually from the included JSON.
echo "Baseline API controls requested. Apply .github/rulesets/main.json through the rulesets API after reviewing status-check names."
