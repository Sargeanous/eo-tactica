import { Router } from "express";
import { TicketCreateSchema, TicketUpdateSchema } from "@eo-tactica/shared";
import { pool } from "../lib/db.js";

interface TicketRow {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
  description: string | null;
  status: string;
  criticality: string;
  category_id: string | null;
  team_id: string | null;
  assignee_id: string | null;
  tags: string[];
  source_kind: string | null;
  source_id: string | null;
  closed_at: string | null;
  closed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

function mapTicket(r: TicketRow) {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    code: r.code,
    title: r.title,
    description: r.description,
    status: r.status,
    criticality: r.criticality,
    categoryId: r.category_id,
    teamId: r.team_id,
    assigneeId: r.assignee_id,
    tags: r.tags,
    sourceKind: r.source_kind,
    sourceId: r.source_id,
    closedAt: r.closed_at,
    closedBy: r.closed_by,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function nextTicketCode(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM tickets WHERE tenant_id = $1`,
    [tenantId],
  );
  const seq = String(Number(result.rows[0]!.count) + 1).padStart(4, "0");
  return `TKT-${year}-${seq}`;
}

export function ticketsRouter(): Router {
  const r = Router();

  r.get("/", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const rows = await pool.query<TicketRow>(
      `SELECT * FROM tickets WHERE tenant_id = $1
       ORDER BY created_at DESC LIMIT 200`,
      [tenantId],
    );
    res.json({ items: rows.rows.map(mapTicket) });
  });

  r.get("/by-source/:kind", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const rows = await pool.query<TicketRow>(
      `SELECT * FROM tickets
        WHERE tenant_id = $1 AND source_kind = $2 AND status <> 'cancelled'
        ORDER BY created_at DESC`,
      [tenantId, req.params.kind],
    );
    const map: Record<string, ReturnType<typeof mapTicket>> = {};
    for (const row of rows.rows) {
      if (row.source_id) map[row.source_id] = mapTicket(row);
    }
    res.json({ bySource: map });
  });

  r.post("/", async (req, res) => {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const parsed = TicketCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
      return;
    }
    const code = await nextTicketCode(tenantId);
    const t = parsed.data;
    const inserted = await pool.query<TicketRow>(
      `INSERT INTO tickets (
         tenant_id, code, title, description, criticality, category_id,
         team_id, assignee_id, tags, source_kind, source_id, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        tenantId,
        code,
        t.title,
        t.description ?? null,
        t.criticality,
        t.categoryId ?? null,
        t.teamId ?? null,
        t.assigneeId ?? null,
        t.tags,
        t.sourceKind ?? null,
        t.sourceId ?? null,
        userId ?? null,
      ],
    );
    res.status(201).json(mapTicket(inserted.rows[0]!));
  });

  r.patch("/:id", async (req, res) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    const parsed = TicketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    const u = parsed.data;
    const existing = await pool.query<TicketRow>(
      `SELECT * FROM tickets WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, tenantId],
    );
    if (!existing.rows[0]) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const merged = { ...existing.rows[0], ...{
      title: u.title ?? existing.rows[0].title,
      description: u.description ?? existing.rows[0].description,
      status: u.status ?? existing.rows[0].status,
      criticality: u.criticality ?? existing.rows[0].criticality,
      category_id: u.categoryId ?? existing.rows[0].category_id,
      team_id: u.teamId ?? existing.rows[0].team_id,
      assignee_id: u.assigneeId ?? existing.rows[0].assignee_id,
      tags: u.tags ?? existing.rows[0].tags,
    } };
    const updated = await pool.query<TicketRow>(
      `UPDATE tickets SET
         title = $1, description = $2, status = $3, criticality = $4,
         category_id = $5, team_id = $6, assignee_id = $7, tags = $8,
         updated_at = now()
       WHERE id = $9 RETURNING *`,
      [
        merged.title,
        merged.description,
        merged.status,
        merged.criticality,
        merged.category_id,
        merged.team_id,
        merged.assignee_id,
        merged.tags,
        req.params.id,
      ],
    );
    res.json(mapTicket(updated.rows[0]!));
  });

  return r;
}
