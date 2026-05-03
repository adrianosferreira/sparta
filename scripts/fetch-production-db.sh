#!/usr/bin/env bash
# Copy production SQLite from the API container → ./data/production-sparta.db (gitignored).
#
# From repo root:
#   ./scripts/fetch-production-db.sh
#
# Uses the same env as scripts/deploy.sh:
#   DEPLOY_HOST    default 206.189.193.239
#   DEPLOY_USER    default root
#   DEPLOY_PATH    default /opt/sparta
#   DEPLOY_SSH_KEY path to private key (optional)
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

HOST="${DEPLOY_HOST:-206.189.193.239}"
USER="${DEPLOY_USER:-root}"
REMOTE="${USER}@${HOST}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/sparta}"

if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_CMD=(ssh -i "$DEPLOY_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
  SCP_CMD=(scp -i "$DEPLOY_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
else
  SSH_CMD=(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
  SCP_CMD=(scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
fi

REMOTE_TMP="/tmp/sparta-production-db.$$"
LOCAL_DIR="$REPO_ROOT/data"
LOCAL_FILE="$LOCAL_DIR/production-sparta.db"

echo "==> Remote: docker cp api container /app/data/sparta.db → ${REMOTE_TMP}"
"${SSH_CMD[@]}" "$REMOTE" \
  "set -euo pipefail
   cd '${REMOTE_DIR}'
   cid=\$(docker-compose ps -q api)
   if [[ -z \"\$cid\" ]]; then
     echo 'error: api container not running (docker-compose ps -q api empty).' >&2
     exit 1
   fi
   docker cp \"\$cid\":/app/data/sparta.db '${REMOTE_TMP}'"

mkdir -p "$LOCAL_DIR"
echo "==> scp → ${LOCAL_FILE}"
"${SCP_CMD[@]}" "${REMOTE}:${REMOTE_TMP}" "$LOCAL_FILE"

echo "==> Remote: rm ${REMOTE_TMP}"
"${SSH_CMD[@]}" "$REMOTE" "rm -f '${REMOTE_TMP}'"

echo "==> Done. Inspect: sqlite3 '${LOCAL_FILE}' 'SELECT COUNT(*) FROM users;'"
