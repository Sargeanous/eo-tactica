import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
import { createLogger } from "@eo-tactica/observability";

const log = createLogger({ name: "migrate" });

const TOLERATED_PG_CODES = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object
  "42701", // duplicate_column
  "42P06", // duplicate_schema
  "42723", // duplicate_function
  "55000", // object_not_in_prerequisite_state
  "428C9", // generated_always
]);

interface MigrationFile {
  filename: string;
  sql: string;
}

async function loadMigrationsDir(): Promise<MigrationFile[]> {
  const here = dirname(fileURLToPath(import.meta.url));
  const dir = resolve(here, "../../migrations");
  const entries = await readdir(dir);
  const sqlFiles = entries.filter((f) => f.endsWith(".sql")).sort();
  const out: MigrationFile[] = [];
  for (const filename of sqlFiles) {
    const sql = await readFile(resolve(dir, filename), "utf8");
    out.push({ filename, sql });
  }
  return out;
}

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function appliedSet(): Promise<Set<string>> {
  const res = await pool.query<{ filename: string }>(
    "SELECT filename FROM _migrations",
  );
  return new Set(res.rows.map((r) => r.filename));
}

/**
 * Idempotently applies every *.sql file in apps/backend/migrations/.
 * Tracks applied filenames in `_migrations`. Tolerates duplicate-object
 * errors so re-runs against an already-bootstrapped database succeed.
 */
export async function runPendingMigrations(): Promise<void> {
  await ensureMigrationsTable();
  const applied = await appliedSet();
  const files = await loadMigrationsDir();

  for (const file of files) {
    if (applied.has(file.filename)) continue;
    log.info({ filename: file.filename }, "applying migration");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      try {
        await client.query(file.sql);
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code && TOLERATED_PG_CODES.has(code)) {
          log.warn(
            { filename: file.filename, code },
            "tolerated duplicate-object error; continuing",
          );
        } else {
          throw err;
        }
      }
      await client.query(
        "INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
        [file.filename],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      log.error({ err, filename: file.filename }, "migration failed");
      throw err;
    } finally {
      client.release();
    }
  }
}
