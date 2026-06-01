# saas-starter

[![Build](https://img.shields.io/github/actions/workflow/status/Gianpi96/saas-starter/ci.yml?branch=main&label=build&style=flat-square)](https://github.com/Gianpi96/saas-starter/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/Gianpi96/saas-starter)

**Go from zero to a working SaaS product in one afternoon — auth, dashboard, and API included.**

---

## What you get

- **Auth that works end-to-end** — NextAuth.js v5 with JWT and httpOnly cookies. Registration, login, logout, and password change all tested and working. Route protection via Next.js middleware so unauthenticated users never reach the dashboard.
- **A dashboard you can ship** — Built with shadcn/ui and TanStack Query v5. Data fetches are cached and revalidated automatically. Mobile-first, accessible, dark mode ready.
- **A FastAPI backend with async database access** — SQLAlchemy async with PostgreSQL 16. Pydantic v2 for request validation. All endpoints documented at `/docs` automatically.
- **Redis rate limiting** — Brute-force protection on auth endpoints out of the box. Configurable per route.
- **19 E2E tests — all passing** — Playwright test suite with Page Object Model covers auth flows, dashboard access, and profile management. Runs in CI on every push.
- **CI/CD on push** — GitHub Actions pipeline runs tests and deploys automatically. Frontend to Vercel, backend to Render.
- **Docker Compose for local dev** — One command starts PostgreSQL, Redis, backend, and frontend together.

---

## Screenshots

> Aggiungi screenshot qui: `![Dashboard](docs/screenshot-dashboard.png)`

---

## Quick start

```bash
# 1. Clona e installa
git clone https://github.com/Gianpi96/saas-starter
cd saas-starter

# 2. Avvia database e servizi con Docker
docker-compose up -d

# 3. Configura le variabili d'ambiente e avvia
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cd frontend && npm install && npm run dev
```

Backend disponibile su `http://localhost:8000/docs`
Frontend disponibile su `http://localhost:3000`

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Example | Note |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql+asyncpg://user:pass@localhost/db` | PostgreSQL 16+ |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | Per rate limiting |
| `SECRET_KEY` | ✅ | `openssl rand -hex 32` | JWT signing key |
| `ALGORITHM` | ✅ | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | `30` | Durata token |

### Frontend (`frontend/.env.local`)

| Variable | Required | Example | Note |
|---|---|---|---|
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` | NextAuth secret |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` | URL del frontend |
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | URL del backend |

---

## Architettura

```
saas-starter/
├── backend/                  # FastAPI application
│   ├── routers/
│   │   ├── auth.py           # Register, login, logout, refresh
│   │   └── users.py          # Profile CRUD, password change
│   ├── models/               # SQLAlchemy async models
│   ├── schemas/              # Pydantic v2 request/response schemas
│   ├── middleware/           # Rate limiting, JWT blacklist
│   └── tests/                # Pytest unit tests
│
├── frontend/                 # Next.js 14 App Router
│   ├── app/
│   │   ├── (auth)/           # Login, register pages
│   │   └── dashboard/        # Protected dashboard + profile
│   ├── components/           # shadcn/ui components
│   ├── lib/                  # API client, WebSocket, auth helpers
│   └── tests/                # Playwright E2E (19 test, tutti passing)
│
├── .github/workflows/        # CI/CD GitHub Actions
├── docker-compose.yml        # PostgreSQL + Redis + backend + frontend
└── render.yaml               # Deploy config per Render
```

**Flusso di autenticazione:**

```
Client → POST /auth/login
  → Valida credenziali (bcrypt)
  → Genera JWT access token + refresh token
  → Imposta httpOnly cookies (non accessibili da JS)
  → Middleware Next.js verifica token su ogni route protetta
  → Logout → aggiunge token a blacklist Redis
```

---

## Why this stack

**FastAPI + SQLAlchemy async** — le query al database non bloccano il thread. Sotto carico, un'applicazione async gestisce molte più richieste concorrenti rispetto a un'app Flask/Django sincrona con lo stesso hardware.

**JWT con blacklist Redis invece di session store** — i JWT sono stateless per design, ma senza blacklist il logout non invalida davvero il token. Redis permette di invalidare token specifici in O(1) senza appesantire il database.

**shadcn/ui invece di una component library completa** — shadcn/ui copia i componenti nel tuo codice invece di installarli come dipendenza. Puoi modificare ogni componente senza override CSS o fork. Zero lock-in.

**TanStack Query v5** — gestisce caching, refetch, e stati di loading/error in modo dichiarativo. Elimina decine di righe di `useEffect` e `useState` per ogni chiamata API.

**Playwright con Page Object Model** — i test E2E sono mantenibili perché ogni pagina ha la sua classe con i selettori. Se cambia un selettore, lo cambi in un posto solo e tutti i test si aggiornano.

---

## License

MIT
