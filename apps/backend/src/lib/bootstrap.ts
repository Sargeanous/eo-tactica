import crypto from "node:crypto";
import { hashPassword } from "@eo-tactica/auth";
import { createLogger } from "@eo-tactica/observability";
import { env } from "../config.js";
import { pool } from "./db.js";
import { runPendingMigrations } from "./migrate.js";

const log = createLogger({ name: "bootstrap" });

interface BootstrapState {
  jwtSecret: string;
  superAdminId: string;
  superAdminTenantId: string;
}

let cached: BootstrapState | null = null;

export async function bootstrap(): Promise<BootstrapState> {
  if (cached) return cached;

  await runPendingMigrations();
  const jwtSecret = await ensureJwtSecret();
  const tenantId = await ensureTenant();
  const superAdminId = await ensureSuperAdmin(tenantId);
  await seedTicketDictionaries();
  await seedDemoUsers(tenantId);
  await seedDemoProject(tenantId, superAdminId);

  cached = { jwtSecret, superAdminId, superAdminTenantId: tenantId };
  return cached;
}

async function ensureJwtSecret(): Promise<string> {
  if (env.JWT_SECRET && env.JWT_SECRET.length >= 32) return env.JWT_SECRET;

  const existing = await pool.query<{ value: string }>(
    "SELECT value FROM app_secrets WHERE key = 'jwt_secret'",
  );
  if (existing.rows[0]?.value) return existing.rows[0].value;

  const generated = crypto.randomBytes(48).toString("hex");
  await pool.query(
    `INSERT INTO app_secrets (key, value) VALUES ('jwt_secret', $1)
     ON CONFLICT (key) DO NOTHING`,
    [generated],
  );
  log.info("generated new JWT signing secret");
  return generated;
}

async function ensureTenant(): Promise<string> {
  const slug = env.SUPER_ADMIN_TENANT_SLUG;
  const existing = await pool.query<{ id: string }>(
    "SELECT id FROM tenants WHERE slug = $1",
    [slug],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO tenants (slug, name) VALUES ($1, $2) RETURNING id`,
    [slug, "EO-TACTICA"],
  );
  log.info({ slug }, "created tenant");
  return inserted.rows[0]!.id;
}

async function ensureSuperAdmin(tenantId: string): Promise<string> {
  const existing = await pool.query<{ id: string }>(
    "SELECT id FROM users WHERE tenant_id = $1 AND email = $2",
    [tenantId, env.SUPER_ADMIN_EMAIL],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);
  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO users (tenant_id, email, display_name, password_hash, role)
     VALUES ($1, $2, $3, $4, 'super_admin')
     RETURNING id`,
    [tenantId, env.SUPER_ADMIN_EMAIL, "Super Admin", passwordHash],
  );
  log.info({ email: env.SUPER_ADMIN_EMAIL }, "created super-admin user");
  return inserted.rows[0]!.id;
}

async function seedTicketDictionaries(): Promise<void> {
  // <DOMAIN_PLACEHOLDER>: replace with EO-TACTICA's organisational vocabulary.
  const categories: Array<[string, string]> = [
    ["delivery_blocker", "Delivery Blocker"],
    ["commercial_action", "Commercial Action"],
    ["customer_input", "Customer Input"],
    ["technical_debt", "Technical Debt"],
  ];
  const teams: Array<[string, string]> = [
    ["program_office", "Program Office"],
    ["delivery", "Delivery"],
    ["engineering", "Engineering"],
    ["commercial", "Commercial"],
  ];

  for (const [id, label] of categories) {
    await pool.query(
      `INSERT INTO ticket_categories (id, label) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label`,
      [id, label],
    );
  }
  for (const [id, label] of teams) {
    await pool.query(
      `INSERT INTO ticket_teams (id, label) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label`,
      [id, label],
    );
  }
}

async function seedDemoUsers(tenantId: string): Promise<void> {
  const demoUsers: Array<{ email: string; name: string; role: string }> = [
    { email: "ops@eo-tactica.local", name: "Ops Lead", role: "operator" },
    { email: "viewer@eo-tactica.local", name: "Viewer", role: "viewer" },
  ];
  for (const u of demoUsers) {
    const existing = await pool.query<{ id: string }>(
      "SELECT id FROM users WHERE tenant_id = $1 AND email = $2",
      [tenantId, u.email],
    );
    if (existing.rows[0]) continue;
    const hash = await hashPassword("ChangeMe123!");
    await pool.query(
      `INSERT INTO users (tenant_id, email, display_name, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, u.email, u.name, hash, u.role],
    );
  }
}

async function seedDemoProject(
  tenantId: string,
  ownerId: string,
): Promise<void> {
  const existing = await pool.query<{ id: string }>(
    "SELECT id FROM projects WHERE tenant_id = $1 AND code = 'TACTICA'",
    [tenantId],
  );
  if (existing.rows[0]) return;

  await pool.query(
    `INSERT INTO projects (tenant_id, code, name, description, status, owner_id)
     VALUES ($1, 'TACTICA', 'TACTICA Programme', $2, 'in_progress', $3)`,
    [
      tenantId,
      // <DOMAIN_PLACEHOLDER>: Programme description.
      "Urgent MOD Project · 5 Workstreams Status Overview",
      ownerId,
    ],
  );
}
