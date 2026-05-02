#!/usr/bin/env bash
# Deploy Calisthenic to Betmart server: rsync project → remote → docker compose up.
#
# From repo root:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# Optional env:
#   DEPLOY_HOST    default 206.189.193.239
#   DEPLOY_USER    default root
#   DEPLOY_PATH    default /opt/calisthenics
#   DEPLOY_SSH_KEY path to private key (e.g. ~/.ssh/id_ed25519)
#
# On the server, create /opt/calisthenics/.env with CADDY_EMAIL=... for Let's Encrypt
# (see .env.example). It is not rsync'd from your laptop (.env is excluded).
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

HOST="${DEPLOY_HOST:-206.189.193.239}"
USER="${DEPLOY_USER:-root}"
REMOTE="${USER}@${HOST}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/calisthenics}"

if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  RSYNC_RSH="ssh -i ${DEPLOY_SSH_KEY} -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
  SSH_CMD=(ssh -i "$DEPLOY_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
else
  RSYNC_RSH="ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
  SSH_CMD=(ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
fi

echo "==> Sync → ${REMOTE}:${REMOTE_DIR}/"
rsync -avz --delete \
  -e "$RSYNC_RSH" \
  --exclude node_modules \
  --exclude dist \
  --exclude .git \
  --exclude .env \
  --exclude '.env.*' \
  --exclude .DS_Store \
  --exclude '*.log' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo "==> Remote: mkdir + docker compose up --build -d"
"${SSH_CMD[@]}" "$REMOTE" \
  "set -euo pipefail
   mkdir -p '${REMOTE_DIR}'
   cd '${REMOTE_DIR}'
   docker compose up --build -d"

echo "==> Done. With Compose + Caddy: https://calisthenics.betmart.com.br (DNS → ${HOST}, ports 80/443 open)"
