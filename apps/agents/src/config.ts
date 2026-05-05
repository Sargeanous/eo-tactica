import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(here, "../../../.env") });
loadDotenv({ path: resolve(here, "../.env") });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .default("postgres://eo:eo_dev_pw@localhost:5432/eo_tactica"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CORS_ORIGINS: z.string().default("http://localhost:8080"),
  ANTHROPIC_API_KEY: z.string().optional(),
  AGENT_MODEL_DEFAULT: z.string().default("claude-sonnet-4-6"),
  AGENT_MAX_STEPS: z.coerce.number().int().positive().default(8),
  AGENT_MAX_TOKENS: z.coerce.number().int().positive().default(2048),
});

export const env = EnvSchema.parse(process.env);
export const corsOrigins = env.CORS_ORIGINS.split(",").map((s) => s.trim());
