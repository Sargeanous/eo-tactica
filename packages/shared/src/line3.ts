import { z } from "zod";
import { RequirementLineSchema } from "./requirement-line.js";

/**
 * R3 — <DOMAIN_PLACEHOLDER>: Marketplace · Multi-source Imagery Vendor API
 * Integration. Tracks vendor pipeline state (live, in-dev, expanding,
 * pending western API).
 */
export const Line3Schema = RequirementLineSchema.extend({
  code: z.literal("R3"),
});
export type Line3 = z.infer<typeof Line3Schema>;

export const VendorPipelineStateSchema = z.enum([
  "live_online",
  "in_dev",
  "pipeline_expanding",
  "pending_customer_api",
]);
export type VendorPipelineState = z.infer<typeof VendorPipelineStateSchema>;

export const VendorIntegrationSchema = z.object({
  id: z.string(),
  vendorName: z.string(),
  sensor: z.enum(["optical", "sar", "mixed"]),
  state: VendorPipelineStateSchema,
});
export type VendorIntegration = z.infer<typeof VendorIntegrationSchema>;
