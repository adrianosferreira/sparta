# Calisthenic

**Mobile-first PWA** for tracking a **12-week beginner calisthenics program** (3 months), logging sets and reps on-device, with **XP, levels, streaks, and badges** to stay motivated. Dark UI tuned for people who love training.

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
| Production   | Static build + **nginx** (Docker image)     |

---

## Prerequisites

- **Node.js** 18+ (20+ or 22 recommended for tooling parity with Docker build)
- **npm** 9+

---

## Local development

```bash
git clone <your-repo-url> calisthenic
cd calisthenic
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

The image is **multi-stage**: Node builds the app, then **nginx:alpine** serves static files with SPA routing, sensible cache headers for hashed assets, and short cache for `index.html` / service worker.

### Build and run (Docker only)

```bash
docker build -t calisthenic .
docker run --rm -p 8080:80 calisthenic
```

App: **http://localhost:8080**

### Docker Compose (recommended)

```bash
docker compose up --build -d
```

Default host port is **8080**. Override with the `PORT` variable:

```bash
PORT=3000 docker compose up --build -d
```

Stop:

```bash
docker compose down
```

### Deploying elsewhere

- Push the image to your registry, or build on the host from this repo.
- Put the container behind **HTTPS** in production (reverse proxy or platform TLS). PWAs and service workers expect a secure context in real deployments.
- If the app is hosted under a **subpath**, set Vite [`base`](https://vitejs.dev/config/shared-options.html#base) and rebuild before baking the image.

---

## Data & privacy

- **No backend** in this version: workouts, XP, badges, and language live in **`localStorage`** (key `calisthenic:v1`).
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
  nginx.conf      # Used by the Docker image
Dockerfile
docker-compose.yml
```

---

## License

Specify your license here (e.g. MIT) once you choose one.
