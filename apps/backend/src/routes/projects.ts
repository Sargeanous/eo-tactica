import { Router } from "express";
import { pool } from "../lib/db.js";

export function projectsRouter(): Router {
  const r = Router();

  r.get("/", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const rows = await pool.query(
      `SELECT id, tenant_id, code, name, description, status, owner_id,
              start_date, end_date, metadata, created_at, updated_at
         FROM projects WHERE tenant_id = $1
         ORDER BY created_at DESC`,
      [tenantId],
    );
    res.json({
      items: rows.rows.map((r) => ({
        id: r.id,
        tenantId: r.tenant_id,
        code: r.code,
        name: r.name,
        description: r.description,
        status: r.status,
        ownerId: r.owner_id,
        startDate: r.start_date,
        endDate: r.end_date,
        metadata: r.metadata,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  });

  r.get("/kpis", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const result = await pool.query(
      `SELECT k.* FROM project_kpis k
       JOIN projects p ON p.id = k.project_id
       WHERE p.tenant_id = $1
       LIMIT 1`,
      [tenantId],
    );
    const row = result.rows[0];
    if (!row) {
      res.json({
        confirmedQuoteAed: 0,
        invoicedAed: 0,
        upcomingQuotesCount: 0,
        highPriorityAsks: 0,
        asOf: new Date().toISOString(),
      });
      return;
    }
    res.json({
      projectId: row.project_id,
      confirmedQuoteAed: Number(row.confirmed_quote_aed),
      invoicedAed: Number(row.invoiced_aed),
      upcomingQuotesCount: row.upcoming_quotes_count,
      highPriorityAsks: row.high_priority_asks,
      asOf: row.as_of,
    });
  });

  return r;
}
