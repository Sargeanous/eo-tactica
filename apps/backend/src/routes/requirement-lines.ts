import { Router } from "express";
import { pool } from "../lib/db.js";

interface RequirementLineRow {
  id: string;
  tenant_id: string;
  project_id: string;
  code: string;
  name: string;
  status: string;
  contract_value_aed: string;
  next_milestone: string | null;
  next_milestone_date: string | null;
  predecessors: string[];
  baseline_start: string | null;
  baseline_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  forecast_end: string | null;
  progress_pct: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

function mapRow(r: RequirementLineRow) {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    projectId: r.project_id,
    code: r.code,
    name: r.name,
    status: r.status,
    contractValueAed: Number(r.contract_value_aed),
    nextMilestone: r.next_milestone,
    nextMilestoneDate: r.next_milestone_date,
    predecessors: r.predecessors,
    baselineStart: r.baseline_start,
    baselineEnd: r.baseline_end,
    actualStart: r.actual_start,
    actualEnd: r.actual_end,
    forecastEnd: r.forecast_end,
    progressPct: Number(r.progress_pct),
    metadata: r.metadata,
    workstreams: [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function requirementLinesRouter(): Router {
  const r = Router();

  r.get("/", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const rows = await pool.query<RequirementLineRow>(
      `SELECT * FROM requirement_lines
       WHERE tenant_id = $1
       ORDER BY code ASC`,
      [tenantId],
    );
    res.json({ items: rows.rows.map(mapRow) });
  });

  r.get("/:code", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const result = await pool.query<RequirementLineRow>(
      `SELECT * FROM requirement_lines
       WHERE tenant_id = $1 AND code = $2 LIMIT 1`,
      [tenantId, req.params.code],
    );
    const row = result.rows[0];
    if (!row) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json(mapRow(row));
  });

  return r;
}
