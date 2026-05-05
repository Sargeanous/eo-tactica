import { z } from "zod";
import { RequirementLineSchema } from "./requirement-line.js";

/**
 * R5 — <DOMAIN_PLACEHOLDER>: SIGINT Data Management · Voice + Signal
 * Intelligence. Two-branch solution (voice + signal) with a unified
 * knowledge graph.
 */
export const Line5Schema = RequirementLineSchema.extend({
  code: z.literal("R5"),
});
export type Line5 = z.infer<typeof Line5Schema>;

export const SigintBranchSchema = z.enum(["voice", "signal"]);
export type SigintBranch = z.infer<typeof SigintBranchSchema>;

export const SigintCapabilitySchema = z.object({
  id: z.string(),
  branch: SigintBranchSchema,
  name: z.string(),
  description: z.string().nullable(),
});
export type SigintCapability = z.infer<typeof SigintCapabilitySchema>;
