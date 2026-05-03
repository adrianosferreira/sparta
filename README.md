# Sparta

**Sparta** is a **mobile-first PWA** for tracking a **12-week beginner calisthenics program** (3 months), logging sets and reps on-device, with **XP, levels, streaks, and badges** to stay motivated. Dark UI tuned for people who love training.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## Features

- **Structured program** — Month 1 (full body, 3×/week), months 2–3 (upper / lower + core splits, skill blocks), weeks 1–12 encoded in the app.
- **Per-exercise logging** — Reps, time holds, or per-side reps where it matters; optional rest timer between sets.
- **Gamification** — XP per set and session bonus, level curve, streaks, unlockable badges.
- **Progress** — Charts (best set per completed session), totals, workout-day history.
- **PWA** — Installable, offline-friendly precache via Workbox (`vite-plugin-pwa`).
- **Languages** — English and **Português (Brasil)**; choice persisted with your data.

---

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| UI           | React 18, Tailwind CSS, Lucide icons        |
| Build        | Vite 5, TypeScript                          |
| Routing      | React Router 6                             |
| State        | Zustand + `persist` → `localStorage`        |
| Charts       | Recharts                                    |
| Production   | **`npm run build` on your machine** → static **nginx** image + **Caddy** (TLS) in Compose |

---

## Prerequisites

- **Node.js** 18+ (20+ or 22 recommended)
- **npm** 9+

---

## Local development

```bash
git clone <your-repo-url> sparta
cd sparta
npm install
npm run dev
```

Open the URL printed in the terminal (default **http://localhost:5173**).

### Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm run dev`  | Vite dev server with HMR             |
| `npm run build`| Typecheck + production bundle to `dist/` |
| `npm run preview` | Serve `dist/` locally (Vite preview) |

---

## Production build (without Docker)

```bash
npm run build
```

Output is in **`dist/`**. Serve it with any static file server; the app uses the HTML5 history API, so the server must **fallback to `index.html`** for unknown paths (same as the nginx config used in Docker).

---

## Docker deployment

**The droplet never runs Node or Vite.** The **`web`** image is **nginx only**: it copies a pre-built **`dist/`** (SPA routing, cache headers, PWA assets already compiled).

**Why:** a **512 MiB** VPS often cannot finish **`vite build`** without the OOM killer (**SIGKILL**). **Build where you have RAM** (laptop, CI), then ship **`dist/`** to the server.

**Docker Compose** runs **`caddy`** in front: **HTTPS** / **Let’s Encrypt**, proxy to `web:80`, certs in **`caddy_data`**.

### Build locally, then Docker (manual)

```bash
npm ci
npm run build
docker build -t sparta .
docker run --rm -p 8080:80 sparta
```

Open **http://localhost:8080** (no TLS).

### Docker Compose (HTTPS for `calisthenics.betmart.com.br`)

1. **Where you have Node:** `npm ci && npm run build` so **`dist/`** exists (or use [`scripts/deploy.sh`](scripts/deploy.sh), which builds on your laptop then rsyncs).
2. On the server: copy **[`.env.example`](.env.example)** → **`.env`** with **`CADDY_EMAIL`**.
3. **DNS:** `calisthenics.betmart.com.br` → server IP.
4. **Firewall:** **80/tcp**, **443/tcp**, **443/udp**.
5. On the server:

```bash
docker compose up --build -d
```

Then open **https://calisthenics.betmart.com.br** (first request may take a few seconds while Caddy obtains the certificate).

Stop:

```bash
docker compose down
```

Override the ACME email:

```bash
CADDY_EMAIL=you@betmart.com.br docker compose up --build -d
```

### 512 MiB droplets

The server **`docker build`** only copies static files into nginx — **no Vite**. Optional **swap** still helps the OS + Docker:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### One-command deploy (build laptop → rsync → compose)

[`scripts/deploy.sh`](scripts/deploy.sh) runs **`npm ci`** (if needed) and **`npm run build`** on **your machine**, rsyncs the repo **including `dist/`** to the server, then **`docker compose up --build -d`** over SSH.

```bash
chmod +x scripts/deploy.sh   # once
./scripts/deploy.sh
```

Requires **Node + npm on the laptop** (not on the droplet). Defaults: **206.189.193.239**, **root**, **`/opt/calisthenics`**. Env: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`.

### Deploying elsewhere

- Build **`dist/`** on CI or locally, then **`docker build`** with that tree in context (or push a pre-built image from CI).
- If the app is hosted under a **subpath**, set Vite [`base`](https://vitejs.dev/config/shared-options.html#base) and rebuild before baking the image.

### Betmart production — `calisthenics.betmart.com.br`

This build is intended to live at **`https://calisthenics.betmart.com.br`** and **not appear in Google Search**.

| Layer | What we ship |
| ----- | ------------- |
| **TLS** | **[`deploy/Caddyfile`](deploy/Caddyfile)** + **`caddy:2-alpine`** in Compose — Let’s Encrypt, HTTP→HTTPS, proxy to `web`. |
| **HTML** | [`index.html`](index.html) — `<meta name="robots" content="noindex, nofollow">`, same for `googlebot`, plus `<link rel="canonical" href="https://calisthenics.betmart.com.br/">`. |
| **Static** | [`public/robots.txt`](public/robots.txt) — `Disallow: /` so well-behaved crawlers skip the site (this is *not* a substitute for `noindex`; it mainly saves crawl budget). |
| **nginx** | Inside **`web`**: [`deploy/nginx.conf`](deploy/nginx.conf) — `X-Robots-Tag: noindex, nofollow` on responses. |

**On your Betmart server**

1. **DNS** — `calisthenics.betmart.com.br` → server public IP (same host that runs Docker).
2. **`.env`** — set `CADDY_EMAIL` (see [`.env.example`](.env.example)); keep `.env` only on the server (not committed).
3. **Deploy** — from a machine with Node, run [`scripts/deploy.sh`](scripts/deploy.sh) (build + rsync + compose), or ensure **`dist/`** exists on the server and run **`docker compose up --build -d`**. Caddy listens on **80/443**; do not put another service on those ports on the same machine.
4. If something else already owns **80/443**, either free those ports or run this stack on another host / use an external proxy that forwards to a published `web` port (advanced).

**If URLs were ever indexed by mistake**, use [Google Search Console](https://search.google.com/search-console) URL removal and keep `noindex` in place until Google drops them.

---

## Data & privacy

- **No backend** in this version: workouts, XP, badges, and language live in **`localStorage`** (key **`sparta:v1`**; older installs are migrated once from `calisthenic:v1`).
- **Profile → Export backup (JSON)** downloads your data; **Reset all progress** clears it on this device.
- Clearing site data in the browser removes progress.

---

## Internationalization

- Strings live under **`src/i18n/`** (`en.ts`, `pt-BR.ts`, `catalog.ts`, workout day labels).
- Switch language under **Profile**; preference is persisted with the store.

---

## Project layout (high level)

```
src/
  components/     # UI pieces (nav, cards, timers, XP bar, …)
  data/           # Exercise catalog + 12-week program seed
  i18n/           # Locales + `useTranslation()`
  layouts/        # Shell + bottom navigation
  lib/            # Gamification, stats, prescription formatting
  pages/          # Today, Program, Progress, Profile, Workout session
  store/          # Zustand app store + persistence
deploy/
  nginx.conf      # Inside the `web` image
  Caddyfile       # TLS + reverse proxy in Compose
Dockerfile        # nginx + COPY dist/ (build dist locally first)
docker-compose.yml
.env.example      # CADDY_EMAIL for Let’s Encrypt
```

---

## License

Specify your license here (e.g. MIT) once you choose one.
