# Mercenary Monorepo

A full‑stack, gamified freelance platform.

- Production platform: [https://mercenary-dev.vercel.app](https://mercenary-dev.vercel.app)

## Repository Structure

- `backend/` — FastAPI service (PostgreSQL, Alembic, Docker). See `backend/README.md`.
- `web-app/` — Next.js 15 + TypeScript + Tailwind + Prisma + NextAuth. Tests with Vitest + Playwright. See `web-app/README.md`.
- `mobile-app/` — Flutter mobile app (Android, iOS, web, desktop). See `mobile-app/README.md`.
- `web-informative/` — Static marketing site (Netlify). See `web-informative/README.md`. Local testing server: `web-informative/server.py`.
- `Documentacion*/` — Central documentation sets for backend, frontend, web app, users, and DevOps. See:
  - `Documentacion/README.md`
  - `Documentacion_backend/README.md`
  - `Documentacion_frontend/README.md`
  - `Documentacion_webApp/README.md`
  - `Documentacion_web_usuarios/README.md`
  - `Documentacion_devOps/README.md`
- Tooling: `.github/` (CI/CD), `.windsurf/` (workflows), `.vscode/` (editor).

## Quick Start

- Backend API: follow `backend/README.md` (env, migrations, run, tests).
- Web Platform: follow `web-app/README.md` (env, dev, tests with Vitest/Playwright).
- Mobile App: follow `mobile-app/README.md` (Flutter setup, run, build).
- Informative Website: see `web-informative/README.md` (local run: `python web-informative/server.py`).

## Environments

- Environment variables are defined per module. Check each module's README for required `.env` keys and example files.
- Docker orchestration available via `docker-compose.yml` and `docker-compose.prod.yml` (also present under `backend/`).

## Security & Gamification

- Advanced security and gamification systems are documented under `Documentacion/` and related module docs.

## CI/CD

- GitHub Actions workflows live in `.github/`.

## Repo Hygiene

- This repo ignores OS/IDE artifacts, logs, build outputs, test reports, and local databases.
- Notably ignored in web platform: `/.next/`, `/playwright-report/`, `/test-results/`, `/prisma/dev.db`.

## Contributing

- See module READMEs and documentation sets for coding standards, testing, and contribution guidelines.
