#!/usr/bin/env bash
# Deploy Sparta: build on this machine (Node/Vite) → rsync → server runs nginx-only Docker (512 MiB safe).
#
# From repo root:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# Requires: Node.js + npm on this machine (not on the droplet).
#
# Optional env:
#   DEPLOY_HOST    default 206.189.193.239
#   DEPLOY_USER    default root
#   DEPLOY_PATH    default /opt/calisthenics
#   DEPLOY_SSH_KEY path to private key (e.g. ~/.ssh/id_ed25519)
#
# On the server: create .env with CADDY_EMAIL and JWT_SECRET (see .env.example). .env is not rsync'd.
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

HOST="${DEPLOY_HOST:-206.189.193.239}"
USER="${DEPLOY_USER:-root}"
REMOTE="${USER}@${HOST}"
REMOTE_DIR="${DEPLOY_PATH:-/opt/calisthenics}"

if ! command -v npm >/dev/null 2>&1; then
  echo "error: npm not found. Install Node.js on this machine, then run again." >&2
  echo "       (The droplet only needs Docker; Vite runs here before rsync.)" >&2
  exit 1
fi

echo "==> Local: install deps (if needed) + production build"
if [[ ! -d node_modules ]]; then
  npm ci --no-audit --no-fund
fi
npm run build

if [[ ! -d dist ]] || [[ ! -f dist/index.html ]]; then
  echo "error: dist/ missing after build." >&2
  exit 1
fi

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
   docker-compose up --build -d"

echo "==> Done. https://sparta.betmart.com.br (DNS → ${HOST}, ports 80/443; /api → api container)"
