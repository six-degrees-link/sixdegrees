#!/usr/bin/env bash
# Interactive prompts for Vercel → GitLab CI variables (Option A).
# Requires: glab authenticated (`glab auth login`), run from repo root or any directory.

set -euo pipefail

die() { echo "Error: $*" >&2; exit 1; }

repo_slug_from_remote() {
  local url
  url=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null) || return 1
  case "$url" in
    *gitlab.com/*)
      local path=${url#*gitlab.com/}
      path=${path#*:}
      path=${path%.git}
      path=${path%/}
      echo "$path"
      ;;
    *)
      return 1
      ;;
  esac
}

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || die "Not inside a git repository."
cd "$REPO_ROOT"

if ! command -v glab >/dev/null 2>&1; then
  die "glab not found. Install: https://gitlab.com/gitlab-org/cli#installation"
fi

if ! glab auth status >/dev/null 2>&1; then
  die "glab is not logged in. Run: glab auth login"
fi

REPO=$(repo_slug_from_remote) || die "Could not parse GitLab path from git remote origin."
GLAB_REPO=${GLAB_REPO:-$REPO}

echo ""
echo "GitLab CI variables for Vercel (Option A)"
echo "Target project: $GLAB_REPO"
echo ""
echo "Get values from:"
echo "  • VERCEL_TOKEN       → https://vercel.com/account/tokens"
echo "  • VERCEL_ORG_ID      → Vercel → Project → Settings → General"
echo "  • VERCEL_PROJECT_ID  → same"
echo ""
read -rp "Use this GitLab project path? [$GLAB_REPO] " ANS
if [[ -n "${ANS// }" ]]; then
  GLAB_REPO=$ANS
fi

echo ""
read -rp "Restrict variables to protected branches only? (preview on unprotected branches will NOT see them) [y/N] " PROT
PROTECT_ARGS=()
if [[ "${PROT:-}" =~ ^[yY] ]]; then
  PROTECT_ARGS=(--protected)
fi

echo ""
echo "— VERCEL_TOKEN (hidden; from Vercel account tokens) —"
read -rsp "Value: " V_VERCEL_TOKEN
echo ""
[[ -n "${V_VERCEL_TOKEN// }" ]] || die "VERCEL_TOKEN cannot be empty."

echo ""
echo "— VERCEL_ORG_ID (e.g. team_xxx or user id) —"
read -rp "Value: " V_VERCEL_ORG_ID
[[ -n "${V_VERCEL_ORG_ID// }" ]] || die "VERCEL_ORG_ID cannot be empty."

echo ""
echo "— VERCEL_PROJECT_ID (e.g. prj_xxx) —"
read -rp "Value: " V_VERCEL_PROJECT_ID
[[ -n "${V_VERCEL_PROJECT_ID// }" ]] || die "VERCEL_PROJECT_ID cannot be empty."

echo ""
echo "Uploading to GitLab (masked token)…"

glab variable set VERCEL_TOKEN -v "$V_VERCEL_TOKEN" -R "$GLAB_REPO" --masked "${PROTECT_ARGS[@]}" \
  -d "Vercel API token for CI deploy (Option A)"

glab variable set VERCEL_ORG_ID -v "$V_VERCEL_ORG_ID" -R "$GLAB_REPO" "${PROTECT_ARGS[@]}" \
  -d "Vercel team/org id (Settings → General)"

glab variable set VERCEL_PROJECT_ID -v "$V_VERCEL_PROJECT_ID" -R "$GLAB_REPO" "${PROTECT_ARGS[@]}" \
  -d "Vercel project id (Settings → General)"

unset V_VERCEL_TOKEN

echo ""
echo "Done. Open GitLab → Settings → CI/CD → Variables to verify."
echo "Push to main (or a branch) to run deploy jobs."
