import { z } from "zod";
import { RequirementLineSchema } from "./requirement-line.js";

/**
 * R1 — <DOMAIN_PLACEHOLDER>: CV + Imagery Delivery.
 * Tile metrics seen on the dashboard:
 *   - scenes delivered (optical + SAR breakdown)
 *   - SLA percentage
 *   - contract value (ex-VAT)
 *   - AOI target count
 */
export const Line1Schema = RequirementLineSchema.extend({
  code: z.literal("R1"),
});
export type Line1 = z.infer<typeof Line1Schema>;

export const Line1ImageryDeliverySchema = z.object({
  scenesDelivered: z.number().int().nonnegative().default(0),
  opticalScenes: z.number().int().nonnegative().default(0),
  sarScenes: z.number().int().nonnegative().default(0),
  slaPct: z.number().min(0).max(100).default(0),
  aoiTargets: z.number().int().nonnegative().default(0),
});
export type Line1ImageryDelivery = z.infer<typeof Line1ImageryDeliverySchema>;

export const Line1AlgorithmSchema = z.object({
  totalAlgorithms: z.number().int().nonnegative().default(0),
  universalCount: z.number().int().nonnegative().default(0),
  opticalCount: z.number().int().nonnegative().default(0),
  sarCount: z.number().int().nonnegative().default(0),
  avgAccuracyKeyClasses: z.number().min(0).max(1).default(0),
});
export type Line1Algorithm = z.infer<typeof Line1AlgorithmSchema>;
