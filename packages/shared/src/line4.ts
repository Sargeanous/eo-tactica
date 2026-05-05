import { z } from "zod";
import { RequirementLineSchema } from "./requirement-line.js";

/**
 * R4 — <DOMAIN_PLACEHOLDER>: Intelligence Discovery / GSA Platform.
 * 28 functional modules across 3 sub-system tiers.
 */
export const Line4Schema = RequirementLineSchema.extend({
  code: z.literal("R4"),
});
export type Line4 = z.infer<typeof Line4Schema>;

export const GsaTierSchema = z.enum(["tier_1", "tier_2", "tier_3"]);
export type GsaTier = z.infer<typeof GsaTierSchema>;

export const GsaModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: GsaTierSchema,
  description: z.string().nullable(),
});
export type GsaModule = z.infer<typeof GsaModuleSchema>;
