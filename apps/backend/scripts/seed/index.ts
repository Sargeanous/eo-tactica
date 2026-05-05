import { createLogger } from "@eo-tactica/observability";
import { bootstrap } from "../../src/lib/bootstrap.js";
import { pool } from "../../src/lib/db.js";

const log = createLogger({ name: "seed" });

interface SeedLine {
  code: string;
  name: string;
  status: string;
  contractValueAed: number;
  nextMilestone: string | null;
  predecessors: string[];
  progressPct: number;
}

// <DOMAIN_PLACEHOLDER>: replace with EO-TACTICA's authoritative seed values.
// The shape mirrors the dashboard tiles (R1..R5).
const SEED_LINES: SeedLine[] = [
  {
    code: "R1",
    name: "CV + Imagery Delivery",
    status: "delivered",
    contractValueAed: 3_810_000,
    nextMilestone: "Awaiting Customer Payment",
    predecessors: [],
    progressPct: 100,
  },
  {
    code: "R2",
    name: "Marketing Place / Training Platform / Archive Data Management",
    status: "in_progress",
    contractValueAed: 0,
    nextMilestone: "WO Wed",
    predecessors: ["R1"],
    progressPct: 33,
  },
  {
    code: "R3",
    name: "Marketplace · Multi-source Imagery Vendor API Integration",
    status: "in_progress",
    contractValueAed: 0,
    nextMilestone: "Quote Fri",
    predecessors: ["R1"],
    progressPct: 50,
  },
  {
    code: "R4",
    name: "Intelligence Discovery / GSA Platform",
    status: "in_preparation",
    contractValueAed: 0,
    nextMilestone: "Demo",
    predecessors: ["R1", "R2"],
    progressPct: 30,
  },
  {
    code: "R5",
    name: "SIGINT Data Management · Voice + Signal Intelligence",
    status: "scope_tbd",
    contractValueAed: 0,
    nextMilestone: "Awaiting customer feedback",
    predecessors: [],
    progressPct: 10,
  },
];

async function main() {
  const { superAdminTenantId } = await bootstrap();
  const project = await pool.query<{ id: string }>(
    `SELECT id FROM projects WHERE tenant_id = $1 AND code = 'TACTICA' LIMIT 1`,
    [superAdminTenantId],
  );
  const projectId = project.rows[0]?.id;
  if (!projectId) {
    log.error("demo project not seeded; aborting");
    return;
  }

  for (const line of SEED_LINES) {
    await pool.query(
      `INSERT INTO requirement_lines (
         tenant_id, project_id, code, name, status, contract_value_aed,
         next_milestone, predecessors, progress_pct
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (project_id, code) DO UPDATE
         SET name = EXCLUDED.name,
             status = EXCLUDED.status,
             contract_value_aed = EXCLUDED.contract_value_aed,
             next_milestone = EXCLUDED.next_milestone,
             predecessors = EXCLUDED.predecessors,
             progress_pct = EXCLUDED.progress_pct,
             updated_at = now()`,
      [
        superAdminTenantId,
        projectId,
        line.code,
        line.name,
        line.status,
        line.contractValueAed,
        line.nextMilestone,
        line.predecessors,
        line.progressPct,
      ],
    );
  }

  await pool.query(
    `INSERT INTO project_kpis (
       project_id, confirmed_quote_aed, invoiced_aed,
       upcoming_quotes_count, high_priority_asks
     ) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_id) DO UPDATE
       SET confirmed_quote_aed = EXCLUDED.confirmed_quote_aed,
           invoiced_aed = EXCLUDED.invoiced_aed,
           upcoming_quotes_count = EXCLUDED.upcoming_quotes_count,
           high_priority_asks = EXCLUDED.high_priority_asks,
           as_of = now()`,
    [projectId, 3_810_000, 1_450_000, 3, 5],
  );

  log.info({ count: SEED_LINES.length }, "seeded requirement lines");
  await pool.end();
}

main().catch((err) => {
  log.error({ err }, "seed failed");
  process.exit(1);
});
