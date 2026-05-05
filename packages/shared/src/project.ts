import { z } from "zod";

export const ProjectStatusSchema = z.enum([
  "planning",
  "in_progress",
  "delivered",
  "blocked",
  "cancelled",
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: ProjectStatusSchema,
  ownerId: z.string().uuid().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectKpiSchema = z.object({
  projectId: z.string().uuid(),
  confirmedQuoteAed: z.number().default(0),
  invoicedAed: z.number().default(0),
  upcomingQuotesCount: z.number().int().default(0),
  highPriorityAsks: z.number().int().default(0),
  asOf: z.string(),
});
export type ProjectKpi = z.infer<typeof ProjectKpiSchema>;
