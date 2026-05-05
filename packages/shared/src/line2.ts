import { z } from "zod";
import { RequirementLineSchema } from "./requirement-line.js";

/**
 * R2 — <DOMAIN_PLACEHOLDER>: Marketing Place / Training Platform / Archive
 * Data Management. Tracks 3 platform modules with per-module status.
 */
export const Line2Schema = RequirementLineSchema.extend({
  code: z.literal("R2"),
});
export type Line2 = z.infer<typeof Line2Schema>;

export const Line2ModuleStatusSchema = z.enum([
  "delivered",
  "partially_delivered",
  "starting_this_week",
  "blocked",
]);
export type Line2ModuleStatus = z.infer<typeof Line2ModuleStatusSchema>;
