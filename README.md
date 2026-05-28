# SaaS Starter

![E2E Tests](https://github.com/Gianpi96/saas-starter/actions/workflows/e2e.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Production-ready SaaS boilerplate: **Next.js 16** frontend + **FastAPI** backend, with JWT authentication, dashboard, profile management, and a full Playwright E2E test suite (19/19 passing).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 · App Router · TypeScript strict · Tailwind CSS · shadcn/ui |
| Auth | NextAuth.js v5 · JWT (15 min access + 7 d refresh) · httpOnly cookie |
| Backend | FastAPI · async SQLAlchemy · Alembic · Pydantic v2 |
| Database | PostgreSQL 16 |
| Cache / Rate-limit | Redis 7 · slowapi |
| Testing | Playwright · Page Object Model · storageState · 3 workers |
| CI | GitHub Actions (E2E on every push) |
| Deploy | Vercel (frontend) · Render (backend) |

---

## Features

- **Register / Login / Logout** — credentials provider, JWT blacklist on logout
- **Route guard** — `proxy.ts` protects `/dashboard/*`, redirects unauthenticated users
- **Dashboard** — TanStack Query v5 with skeleton loader and Sonner toasts
- **Profile management** — update name/email, change password with validation
- **Security** — bcrypt hashing, rate limiting (configurable), refresh token rotation
- **19 E2E tests** — auth, dashboard, profile, registration — all green

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### 1. Clone & configure

```bash
git clone https://github.com/Gianpi96/saas-starter.git
cd saas-starter
cp .env.example .env          # edit as needed
```

### 2. Start infrastructure

```bash
docker compose up -d          # postgres:5432 · redis:6380 · backend:8000
```

### 3. Create a test user

```bash
python backend/scripts/create_test_user.py \
  --email test@example.com \
  --password testpassword123
```

### 4. Start frontend

```bash
cd frontend
cp .env.local.example .env.local   # or create it — see below
npm install
npm run dev                         # http://localhost:3000
```

Minimal `frontend/.env.local`:
```
NEXTAUTH_SECRET=dev_secret_replace_in_production
NEXTAUTH_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Tests

```bash
cd frontend
npx playwright install --with-deps chromium   # first time only
npx playwright test --workers=3
```

Expected output: **19 passed** in ~25 s.

---

## Project Structure

```
saas-starter/
├── backend/
│   ├── routers/
│   │   ├── auth.py          # /api/auth/{login,register,logout,refresh}
│   │   └── users.py         # /api/users/{me, me/change-password}
│   ├── security.py          # bcrypt + JWT helpers
│   ├── config.py            # Pydantic settings (env-driven)
│   └── scripts/
│       └── create_test_user.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # login · register
│   │   │   └── dashboard/   # dashboard · profile · settings
│   │   ├── components/
│   │   │   ├── dashboard/   # sidebar · welcome-card · profile-form · change-password-form
│   │   │   └── ui/          # shadcn/ui primitives
│   │   ├── lib/
│   │   │   ├── auth.ts      # NextAuth config
│   │   │   └── api.ts       # axios client + typed helpers
│   │   └── proxy.ts         # route guard (Next.js 16 middleware)
│   └── e2e/
│       ├── global-setup.ts  # login once, save storageState
│       ├── fixtures.ts      # inject auth cookies into page context
│       └── pages/           # Page Object Model
├── docker-compose.yml
├── render.yaml              # Render deploy config
└── frontend/vercel.json     # Vercel deploy config
```

---

## Deploy

### Backend → Render

1. Connect repo on [render.com](https://render.com) → **New Blueprint** → select this repo  
   Render reads `render.yaml` automatically.
2. Set environment variables manually:
   - `REDIS_URL` → your Redis provider URL (e.g. Upstash)
   - `CORS_ORIGINS` → `https://your-app.vercel.app`

### Frontend → Vercel

1. Import repo on [vercel.com](https://vercel.com), set **Root Directory** to `frontend`
2. Set environment variables:
   - `NEXTAUTH_SECRET` → random 32+ char string
   - `NEXTAUTH_URL` → `https://your-app.vercel.app`
   - `BACKEND_URL` → `https://your-api.onrender.com`
   - `NEXT_PUBLIC_API_URL` → `https://your-api.onrender.com`
3. Update `frontend/vercel.json` with your real Render URL, then `git push`

---

## License

MIT
