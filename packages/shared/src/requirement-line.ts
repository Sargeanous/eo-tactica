import { z } from "zod";

/**
 * Shared schema used by every EO-TACTICA requirement line (R1..R5).
 * Each line module re-exports a thin alias so callers can refer to the
 * line by name while sharing one canonical shape.
 *
 * <DOMAIN_PLACEHOLDER>: tune the status enum + metric shape to match the
 * exact KPI tiles each requirement line tracks (e.g. scenes delivered,
 * SLA pct, contract value, etc.).
 */
export const RequirementLineStatusSchema = z.enum([
  "scope_tbd",
  "in_preparation",
  "in_progress",
  "partially_blocked",
  "delivered",
  "awaiting_acceptance",
  "invoiced",
  "cancelled",
]);
export type RequirementLineStatus = z.infer<typeof RequirementLineStatusSchema>;

export const RequirementLineWorkstreamSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: RequirementLineStatusSchema,
  /** Free-form metric values — keyed by metric id, value is the rendered string. */
  metrics: z.record(z.string()).default({}),
  notes: z.array(z.string()).default([]),
});
export type RequirementLineWorkstream = z.infer<
  typeof RequirementLineWorkstreamSchema
>;

export const RequirementLineSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  projectId: z.string().uuid(),
  /** "R1", "R2", ... — used as the human-readable code on the dashboard. */
  code: z.string(),
  name: z.string(),
  status: RequirementLineStatusSchema,
  /** Headline contract value in AED, ex-VAT. */
  contractValueAed: z.number().default(0),
  /** Next operational milestone (e.g. "WO Wed", "Quote Fri"). */
  nextMilestone: z.string().nullable(),
  /** ISO date — when the next milestone is due. */
  nextMilestoneDate: z.string().nullable(),
  workstreams: z.array(RequirementLineWorkstreamSchema).default([]),
  /** Predecessor codes (e.g. ["R1", "R2"]). Drives critical-path math. */
  predecessors: z.array(z.string()).default([]),
  baselineStart: z.string().nullable(),
  baselineEnd: z.string().nullable(),
  actualStart: z.string().nullable(),
  actualEnd: z.string().nullable(),
  forecastEnd: z.string().nullable(),
  progressPct: z.number().min(0).max(100).default(0),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RequirementLine = z.infer<typeof RequirementLineSchema>;
