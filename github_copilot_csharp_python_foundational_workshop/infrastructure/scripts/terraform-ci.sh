#!/bin/bash
set -e  # Exit on any error

# =============================================================================
# Terraform CI/CD Script — Road Trip Planner
# =============================================================================
# Runs Terraform validate, plan, or apply for a given environment.
# Follows cicd.instructions.md: accepts env vars + CLI flags, validates inputs,
# supports --dry-run, outputs detailed logs, and is idempotent.
#
# Usage:
#   ./infrastructure/scripts/terraform-ci.sh --action plan --environment dev
#   ./infrastructure/scripts/terraform-ci.sh --action apply --environment prod --auto-approve
#   ./infrastructure/scripts/terraform-ci.sh --action validate --dry-run
# =============================================================================

# ─── Defaults from environment variables (overridable via CLI flags) ─────────
ACTION="${ACTION:-validate}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
WORKING_DIR="${WORKING_DIR:-infrastructure/terraform}"
PLAN_FILE="${PLAN_FILE:-tfplan-${ENVIRONMENT}.out}"
AUTO_APPROVE="${AUTO_APPROVE:-false}"
DRY_RUN="${DRY_RUN:-false}"

# ─── Parse CLI arguments ─────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --action)       ACTION="$2";       shift 2 ;;
    --environment)  ENVIRONMENT="$2";  shift 2 ;;
    --working-dir)  WORKING_DIR="$2";  shift 2 ;;
    --plan-file)    PLAN_FILE="$2";    shift 2 ;;
    --auto-approve) AUTO_APPROVE=true; shift   ;;
    --dry-run)      DRY_RUN=true;      shift   ;;
    *) echo "ERROR: Unknown option: $1"; exit 1 ;;
  esac
done

# ─── Validate required inputs ────────────────────────────────────────────────
VALID_ACTIONS=("validate" "plan" "apply" "destroy")
VALID_ENVS=("dev" "uat" "stage" "prod")

action_valid=false
for a in "${VALID_ACTIONS[@]}"; do
  [[ "$ACTION" == "$a" ]] && action_valid=true && break
done
if [[ "$action_valid" != "true" ]]; then
  echo "ERROR: Invalid action '$ACTION'. Must be one of: ${VALID_ACTIONS[*]}"
  exit 1
fi

env_valid=false
for e in "${VALID_ENVS[@]}"; do
  [[ "$ENVIRONMENT" == "$e" ]] && env_valid=true && break
done
if [[ "$env_valid" != "true" ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'. Must be one of: ${VALID_ENVS[*]}"
  exit 1
fi

TFVARS_FILE="${WORKING_DIR}/environments/${ENVIRONMENT}.tfvars.json"
if [[ ! -f "$TFVARS_FILE" ]]; then
  echo "ERROR: tfvars file not found: $TFVARS_FILE"
  exit 1
fi

# ─── Dry-run support ─────────────────────────────────────────────────────────
if [[ "$DRY_RUN" == "true" ]]; then
  echo "══════════════════════════════════════════════════════════"
  echo "DRY RUN — Terraform CI"
  echo "══════════════════════════════════════════════════════════"
  echo "  Action:       $ACTION"
  echo "  Environment:  $ENVIRONMENT"
  echo "  Working Dir:  $WORKING_DIR"
  echo "  Tfvars File:  $TFVARS_FILE"
  echo "  Plan File:    $PLAN_FILE"
  echo "  Auto-Approve: $AUTO_APPROVE"
  echo "══════════════════════════════════════════════════════════"
  echo "DRY RUN complete — no changes made."
  exit 0
fi

# ─── Execute Terraform ────────────────────────────────────────────────────────
echo "══════════════════════════════════════════════════════════"
echo "Terraform CI — $ACTION ($ENVIRONMENT)"
echo "══════════════════════════════════════════════════════════"
echo "  Working Dir:  $WORKING_DIR"
echo "  Tfvars File:  $TFVARS_FILE"
echo "  Plan File:    $PLAN_FILE"
echo "  Timestamp:    $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "══════════════════════════════════════════════════════════"

cd "$WORKING_DIR"

# Step 1: Format check (all actions)
echo ""
echo "── Step 1: terraform fmt -check ──"
if ! terraform fmt -check -recursive; then
  echo "WARNING: Terraform files are not properly formatted. Run 'terraform fmt -recursive' locally."
fi

# Step 2: Init (all actions)
echo ""
echo "── Step 2: terraform init ──"
terraform init \
  -backend-config="environments/${ENVIRONMENT}/backend.tfvars" \
  -input=false \
  -no-color

case "$ACTION" in
  validate)
    echo ""
    echo "── Step 3: terraform validate ──"
    terraform validate -no-color
    echo ""
    echo "✅ Terraform validate passed for $ENVIRONMENT"
    ;;

  plan)
    echo ""
    echo "── Step 3: terraform validate ──"
    terraform validate -no-color

    echo ""
    echo "── Step 4: terraform plan ──"
    terraform plan \
      -var-file="environments/${ENVIRONMENT}.tfvars.json" \
      -out="$PLAN_FILE" \
      -input=false \
      -no-color

    echo ""
    echo "✅ Terraform plan saved to $PLAN_FILE"
    ;;

  apply)
    if [[ "$AUTO_APPROVE" == "true" ]]; then
      echo ""
      echo "── Step 3: terraform apply (auto-approve) ──"
      terraform apply \
        -var-file="environments/${ENVIRONMENT}.tfvars.json" \
        -auto-approve \
        -input=false \
        -no-color
    else
      echo ""
      echo "── Step 3: terraform apply (from plan) ──"
      if [[ ! -f "$PLAN_FILE" ]]; then
        echo "ERROR: Plan file not found: $PLAN_FILE"
        echo "Run with --action plan first, or use --auto-approve."
        exit 1
      fi
      terraform apply \
        -input=false \
        -no-color \
        "$PLAN_FILE"
    fi
    echo ""
    echo "✅ Terraform apply completed for $ENVIRONMENT"
    ;;

  destroy)
    if [[ "$AUTO_APPROVE" != "true" ]]; then
      echo "ERROR: --auto-approve is required for destroy action."
      exit 1
    fi
    echo ""
    echo "── Step 3: terraform destroy ──"
    terraform destroy \
      -var-file="environments/${ENVIRONMENT}.tfvars.json" \
      -auto-approve \
      -input=false \
      -no-color
    echo ""
    echo "✅ Terraform destroy completed for $ENVIRONMENT"
    ;;
esac

echo ""
echo "══════════════════════════════════════════════════════════"
echo "Terraform CI — $ACTION ($ENVIRONMENT) — DONE"
echo "══════════════════════════════════════════════════════════"
