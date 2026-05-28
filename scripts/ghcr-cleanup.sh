#!/usr/bin/env bash
# Delete ghcr.io package versions older than 7 days via the GitHub API.
#
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./scripts/ghcr-cleanup.sh [options]
#
# Options:
#   -o, --owner <owner>      GitHub user or org owning the package (required)
#   -p, --package <name>     Package name as it appears in ghcr.io (required)
#   -t, --type user|org      Owner type: "user" (default) or "org"
#   -d, --days <n>           Delete versions older than n days (default: 7)
#   --keep-tagged            Skip versions that have at least one tag
#   --dry-run                Print what would be deleted without deleting
#   -h, --help               Show this message

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────────────────────
OWNER=""
PACKAGE=""
OWNER_TYPE="user"
DAYS=7
KEEP_TAGGED=false
DRY_RUN=false

# ── Argument parsing ─────────────────────────────────────────────────────────
usage() {
  grep '^#' "$0" | sed 's/^# \{0,1\}//' | tail -n +2
  exit 0
}

while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--owner)   OWNER="$2";      shift 2 ;;
    -p|--package) PACKAGE="$2";    shift 2 ;;
    -t|--type)    OWNER_TYPE="$2"; shift 2 ;;
    -d|--days)    DAYS="$2";       shift 2 ;;
    --keep-tagged) KEEP_TAGGED=true; shift ;;
    --dry-run)    DRY_RUN=true;    shift ;;
    -h|--help)    usage ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ── Validation ───────────────────────────────────────────────────────────────
[[ -z "${GITHUB_TOKEN:-}" ]] && { echo "Error: GITHUB_TOKEN is not set." >&2; exit 1; }
[[ -z "$OWNER" ]]            && { echo "Error: --owner is required." >&2; exit 1; }
[[ -z "$PACKAGE" ]]          && { echo "Error: --package is required." >&2; exit 1; }
[[ "$OWNER_TYPE" != "user" && "$OWNER_TYPE" != "org" ]] && {
  echo "Error: --type must be 'user' or 'org'." >&2; exit 1
}

command -v jq  >/dev/null 2>&1 || { echo "Error: jq is required but not installed." >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "Error: curl is required but not installed." >&2; exit 1; }

# ── Helpers ──────────────────────────────────────────────────────────────────
api() {
  local method="$1" path="$2"
  curl -fsSL \
    -X "$method" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com${path}"
}

cutoff_epoch=$(date -d "-${DAYS} days" +%s 2>/dev/null \
  || date -v "-${DAYS}d" +%s)  # macOS fallback

base_path() {
  if [[ "$OWNER_TYPE" == "org" ]]; then
    echo "/orgs/${OWNER}/packages/container/${PACKAGE}"
  else
    echo "/user/packages/container/${PACKAGE}"
  fi
}

# ── Collect all versions (paginated) ─────────────────────────────────────────
echo "Fetching versions for ${OWNER}/${PACKAGE} (${OWNER_TYPE}) ..."

versions="[]"
page=1
while true; do
  chunk=$(api GET "$(base_path)/versions?per_page=100&page=${page}")
  count=$(echo "$chunk" | jq 'length')
  [[ "$count" -eq 0 ]] && break
  versions=$(echo "$versions $chunk" | jq -s 'add')
  (( page++ ))
done

total=$(echo "$versions" | jq 'length')
echo "Found ${total} version(s) total."

# ── Filter: older than DAYS, optionally skip tagged ───────────────────────────
to_delete=$(echo "$versions" | jq --argjson cutoff "$cutoff_epoch" --argjson keep_tagged "$KEEP_TAGGED" '
  [.[] |
    . as $v |
    ($v.created_at | sub("\\.[0-9]+Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $ts |
    select($ts < $cutoff) |
    select(
      if $keep_tagged
      then ($v.metadata.container.tags | length) == 0
      else true
      end
    )
  ]
')

delete_count=$(echo "$to_delete" | jq 'length')

if [[ "$delete_count" -eq 0 ]]; then
  echo "No versions to delete."
  exit 0
fi

echo ""
echo "Versions to delete (${delete_count}):"
echo "$to_delete" | jq -r '.[] | "  id=\(.id)  created=\(.created_at)  tags=[\(.metadata.container.tags | join(", "))]"'

if $DRY_RUN; then
  echo ""
  echo "[dry-run] No deletions performed."
  exit 0
fi

# ── Delete ───────────────────────────────────────────────────────────────────
echo ""
deleted=0
failed=0

while IFS= read -r version_id; do
  if curl -fsSL \
      -X DELETE \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com$(base_path)/versions/${version_id}" \
      -o /dev/null; then
    echo "  Deleted version ${version_id}"
    (( ++deleted ))
  else
    echo "  Failed to delete version ${version_id}" >&2
    (( ++failed ))
  fi
done < <(echo "$to_delete" | jq -r '.[].id')

echo ""
echo "Done. Deleted: ${deleted}, Failed: ${failed}."
