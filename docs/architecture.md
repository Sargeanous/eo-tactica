# EO-TACTICA Architecture

This is the scaffolded baseline for the EO-TACTICA programme management
platform. The structure follows a known-good pattern from a sibling
project; replace anything tagged `<DOMAIN_PLACEHOLDER>` with the
authoritative EO-TACTICA content.

## Workspaces

| Path                       | Package                       | Role                                          |
| -------------------------- | ----------------------------- | --------------------------------------------- |
| `apps/frontend`            | `@eo-tactica/frontend`        | Vite + React + Tailwind UI (port 8080)        |
| `apps/backend`             | `@eo-tactica/backend`         | Express + Postgres REST + WS (port 3001)      |
| `apps/agents`              | `@eo-tactica/agents`          | Anthropic-SDK powered agents (port 3002)      |
| `apps/ingest`              | `@eo-tactica/ingest`          | Telemetry simulator stub                      |
| `packages/shared`          | `@eo-tactica/shared`          | Cross-app types + zod schemas                 |
| `packages/auth`            | `@eo-tactica/auth`            | Password hashing + JWT helpers                |
| `packages/observability`   | `@eo-tactica/observability`   | Pino logger factory                           |

## Data flow

1. **Frontend** posts user prompts to `/api/agents/ask` or
   `/api/agents/ask/stream` (proxied by Vite to `:3002`).
2. **Backend** owns the database (Postgres) and exposes REST routes under
   `/api/*`. WebSocket upgrade is at `/ws`.
3. **Agents** holds the Anthropic API key and instantiates a singleton
   `Anthropic` client on first use. The frontend never sees the key.

## Boot order

`apps/backend` runs `bootstrap()` once on startup:

1. Apply pending migrations (`apps/backend/migrations/*.sql`).
2. Generate / load JWT signing secret.
3. Create / refresh super-admin user.
4. Idempotently seed dictionary tables (categories, teams).
5. Idempotently seed demo project + users.

Seeded requirement-line content is applied by `npm run seed`.

## Replacing for a new domain

See the top-level scaffold spec (Section 10) for the full replacement
checklist. The TL;DR is: search for `<DOMAIN_PLACEHOLDER>` and replace
each occurrence with EO-TACTICA-specific content.
