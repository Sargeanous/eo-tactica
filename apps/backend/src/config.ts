import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(here, "../../../.env") });
loadDotenv({ path: resolve(here, "../.env") });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .default("postgres://eo:eo_dev_pw@localhost:5432/eo_tactica"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CORS_ORIGINS: z.string().default("http://localhost:8080"),
  JWT_SECRET: z.string().optional(),
  JWT_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  SUPER_ADMIN_EMAIL: z.string().email().default("admin@eo-tactica.local"),
  SUPER_ADMIN_PASSWORD: z.string().default("ChangeMe123!"),
  SUPER_ADMIN_TENANT_SLUG: z.string().default("tactica"),
});

export const env = EnvSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",").map((s) => s.trim());
