import { z } from "zod";

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "on_hold",
  "closed",
  "cancelled",
] as const;
export const TICKET_CRITICALITIES = [
  "tier_1",
  "tier_2",
  "tier_3",
  "tier_4",
] as const;
// <DOMAIN_PLACEHOLDER>: extend with EO-TACTICA-specific source kinds.
export const TICKET_SOURCE_KINDS = [
  "blocker",
  "manual",
  "requirement_line",
  "delivery_milestone",
  "commercial_action",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketCriticality = (typeof TICKET_CRITICALITIES)[number];
export type TicketSourceKind = (typeof TICKET_SOURCE_KINDS)[number];

export const TicketSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(TICKET_STATUSES),
  criticality: z.enum(TICKET_CRITICALITIES),
  categoryId: z.string().nullable(),
  teamId: z.string().nullable(),
  assigneeId: z.string().uuid().nullable(),
  tags: z.array(z.string()).default([]),
  sourceKind: z.enum(TICKET_SOURCE_KINDS).nullable(),
  sourceId: z.string().nullable(),
  closedAt: z.string().nullable(),
  closedBy: z.string().uuid().nullable(),
  createdAt: z.string(),
  createdBy: z.string().uuid().nullable(),
  updatedAt: z.string(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const TicketCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().nullable(),
});
export type TicketCategory = z.infer<typeof TicketCategorySchema>;

export const TicketTeamSchema = z.object({
  id: z.string(),
  label: z.string(),
});
export type TicketTeam = z.infer<typeof TicketTeamSchema>;

export const TicketCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  criticality: z.enum(TICKET_CRITICALITIES).default("tier_3"),
  categoryId: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).default([]),
  sourceKind: z.enum(TICKET_SOURCE_KINDS).nullable().optional(),
  sourceId: z.string().nullable().optional(),
});
export type TicketCreate = z.infer<typeof TicketCreateSchema>;

export const TicketUpdateSchema = TicketCreateSchema.partial().extend({
  status: z.enum(TICKET_STATUSES).optional(),
});
export type TicketUpdate = z.infer<typeof TicketUpdateSchema>;
