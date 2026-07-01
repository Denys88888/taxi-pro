# Taxi Pro — Frontend

Pi Network ride-hailing PWA. React 18 + TypeScript + Vite + Tailwind, with a
Leaflet map, 20-language i18n, real-time WebSocket updates, and the Pi SDK
payment flow. Pairs with [`taxi-pro-server`](https://github.com/Denys88888/taxi-pro-server).

## Tech stack

- React 18.3, TypeScript 5.5 (strict), Vite 5.3
- Tailwind CSS 3.4, clsx + tailwind-merge
- react-i18next 14 / i18next 23 (+ browser language detector) — 20 languages
- Zustand 4.5 (global state + lightweight screen router)
- Axios 1.7 (REST), native WebSocket (real-time)
- Leaflet 1.9 + react-leaflet 4.2 (OpenStreetMap, Nominatim geocoding)
- DOMPurify (sanitizes all user text), date-fns
- vite-plugin-pwa (installable, offline-capable)

## Screens

Splash → Auth (Pi login) → Passenger Home (map + booking), Driver Home (online
toggle + ride queue), Ride Details (live tracking, cancel, pay, rate), Chat
(real-time + quick templates), History, Profile (language/theme/logout),
Driver Registration (4-step wizard), Earnings, Admin Dashboard (stats, users,
driver verification, fee slider).

## Local development

```bash
cp .env.example .env      # point VITE_API_URL / VITE_WS_URL at your backend
npm install
npm run dev               # http://localhost:5199/taxi-pro/
```

The Pi SDK (`window.Pi`) only exists inside the **Pi Browser**; elsewhere the
login button shows a clear "open in Pi Browser" message. All other UI works in
any browser for development.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build (`dist/`) |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest suite |

## Environment variables

| Variable | Notes |
| --- | --- |
| `VITE_API_URL` | Backend REST base URL (no trailing slash). |
| `VITE_WS_URL` | Backend WebSocket base URL (`wss://…`). |
| `VITE_PI_SANDBOX` | `true` = Pi Testnet (sandbox). |

`VITE_BASE` overrides the Vite base path (default `/taxi-pro/` for GitHub Pages).

## Internationalization

20 languages under `src/locales/<lang>/translation.json`, bundled at build time
(works offline). English is the source of truth; other languages fall back to it
per-key. The active language auto-detects from `localStorage`/browser and can be
changed in Profile. Arabic renders right-to-left.

## PWA

`vite-plugin-pwa` generates the manifest and a Workbox service worker that
precaches the app shell, so it installs to the home screen and loads offline.
Icons live in `public/icons/`.

## Security

- Every user-generated string is sanitized with DOMPurify before render.
- JWT is stored in `localStorage` and attached to all API/WS calls; a 401 clears
  it and returns to login.
- Chat input is length-capped (500) and control characters stripped.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds on push to `main` and publishes `dist/` to
the `gh-pages` branch (served at `https://denys88888.github.io/taxi-pro/`). The
production API/WS URLs are injected as build-time env vars in the workflow.
