import { createLogger } from "@eo-tactica/observability";

const log = createLogger({ name: "ingest" });

/**
 * <DOMAIN_PLACEHOLDER>: telemetry simulator / MQTT bridge stub.
 *
 * The original sibling project shipped an MQTT bridge that fed depot
 * telemetry into the backend. EO-TACTICA may not need this — the file
 * exists so `npm run dev:all` doesn't fail. Either:
 *   1. Replace this body with the EO-TACTICA-specific ingest pipeline, or
 *   2. Drop apps/ingest entirely (and remove the dev:ingest script + the
 *      mosquitto entry from docker-compose.dev.yml).
 */
async function main() {
  log.info("ingest stub running — no domain integration configured");
  setInterval(() => {
    /* keep alive */
  }, 60_000);
}

void main();
