#!/usr/bin/env bash
# =============================================================================
# run-all.sh — Master runner: create all labels, milestones, issues & link project
#
# Usage:
#   bash scripts/github/run-all.sh           # full run
#   bash scripts/github/run-all.sh --dry-run # validate scripts exist, skip gh calls
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=false

for arg in "$@"; do
  [[ "${arg}" == "--dry-run" ]] && DRY_RUN=true
done

# ── helpers ──────────────────────────────────────────────────────────────────
log()  { echo "[run-all] $*"; }
fail() { echo "[run-all] ERROR: $*" >&2; exit 1; }

run_script() {
  local script="${SCRIPT_DIR}/$1"
  [[ -f "${script}" ]] || fail "Script not found: ${script}"
  log "--- Running: $1 ---"
  if [[ "${DRY_RUN}" == true ]]; then
    log "  [dry-run] Would execute: bash ${script}"
  else
    bash "${script}"
  fi
  log "--- Done: $1 ---"
  echo ""
}

# ── pre-flight checks ─────────────────────────────────────────────────────────
log "Pre-flight checks..."

command -v gh >/dev/null 2>&1 || fail "'gh' CLI not found. Install from https://cli.github.com"

if [[ "${DRY_RUN}" == false ]]; then
  gh auth status >/dev/null 2>&1 || fail "Not authenticated. Run: gh auth login"
  log "  gh auth: OK"
fi

log "Pre-flight checks passed."
echo ""

# ── execution order ───────────────────────────────────────────────────────────
# Order matters: labels and milestones must exist before issues reference them.

run_script "01-labels.sh"
run_script "02-milestones.sh"
run_script "03-issues-phase2-4.sh"
run_script "04-issues-phase5.sh"
run_script "05-issues-phase6.sh"
run_script "06-issues-phase7.sh"
run_script "07-issues-phase8.sh"
run_script "08-add-to-project.sh"

log "============================================================"
log "All scripts completed successfully."
log "View issues: https://github.com/hlucianojr1/road_trip_app/issues"
log "View project: https://github.com/users/hlucianojr1/projects/1"
log "============================================================"
