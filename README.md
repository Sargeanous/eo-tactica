# EO-TACTICA

Programme management platform for the **TACTICA** programme — an urgent
intelligence / EO programme tracking 5 requirement lines (R1..R5).

> Scaffolded against a known-good monorepo pattern. Anywhere domain
> content has not been finalised, you'll see `<DOMAIN_PLACEHOLDER>` —
> the operator fills these in.

## Stack

- **Node** ≥ 20, **npm** ≥ 10
- **Frontend**: Vite + React 18 + Tailwind v3 + TanStack Query + shadcn/ui
- **Backend**: Express + Postgres (`pg`) + Redis + WebSocket
- **Agents**: Anthropic SDK (Sonnet 4.6 default, configurable) with tool use
- **Shared types**: zod-first schemas re-exported by `@eo-tactica/shared`

## Quick start

```bash
# 1. Bring up Postgres + Redis
npm run compose:dev:up

# 2. Install workspace dependencies
npm install

# 3. Copy the env sample and fill in ANTHROPIC_API_KEY when ready
cp .env.example .env

# 4. Boot all services in parallel (backend, agents, ingest, frontend)
npm run dev:all

# 5. Seed demo data once Postgres is up + backend has applied migrations
npm run seed
```

The frontend runs at `http://localhost:8080`. Default super-admin
credentials are configured via `.env` (`SUPER_ADMIN_EMAIL` /
`SUPER_ADMIN_PASSWORD`).

## Scripts

| Command                       | Effect                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| `npm run dev`                 | Frontend only                                               |
| `npm run dev:all`             | Backend (3001) + agents (3002) + ingest + frontend (8080)   |
| `npm run dev:backend`         | Backend only                                                |
| `npm run dev:agents`          | Agents service only                                         |
| `npm run build`               | All workspaces                                              |
| `npm run typecheck`           | Strict typecheck across all workspaces                      |
| `npm run lint`                | ESLint (frontend uses flat config)                          |
| `npm run test`                | Vitest across all workspaces                                |
| `npm run seed`                | Seed demo requirement lines                                 |
| `npm run compose:dev:up/down` | Start / stop the local Postgres + Redis stack               |

## Replacing the placeholders

See `docs/architecture.md` and the inline `<DOMAIN_PLACEHOLDER>` markers
across:

- `packages/shared/src/line{1..5}.ts` — per-line schema specifics
- `apps/frontend/src/lib/i18n/{en,ar}.ts` — copy
- `apps/frontend/src/index.css` — brand HSL ramp
- `apps/backend/scripts/seed/index.ts` — authoritative seed values
- `apps/agents/src/agents/tactica-briefer.ts` — agent system prompt
