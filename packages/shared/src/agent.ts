import { z } from "zod";

// <DOMAIN_PLACEHOLDER>: replace these codenames with the EO-TACTICA-specific
// agent personas. Keep the shape — id is the routing key, name is the
// friendly label shown in the command palette.
export const AGENT_IDS = [
  "tactica_briefer",
  "tactica_planner",
  "tactica_analyst",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export const AgentDescriptorSchema = z.object({
  id: z.enum(AGENT_IDS),
  name: z.string(),
  description: z.string(),
  model: z.string(),
});
export type AgentDescriptor = z.infer<typeof AgentDescriptorSchema>;

export const AgentAskRequestSchema = z.object({
  agentId: z.enum(AGENT_IDS).default("tactica_briefer"),
  prompt: z.string().min(1),
  locale: z.enum(["en", "ar"]).default("en"),
});
export type AgentAskRequest = z.infer<typeof AgentAskRequestSchema>;

export const StreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text_delta"), text: z.string() }),
  z.object({
    type: z.literal("tool_use"),
    name: z.string(),
    input: z.unknown(),
  }),
  z.object({
    type: z.literal("tool_result"),
    name: z.string(),
    output: z.unknown(),
  }),
  z.object({
    type: z.literal("error"),
    code: z.string(),
    message: z.string(),
  }),
  z.object({
    type: z.literal("done"),
    result: z.object({
      stopReason: z.string().nullable(),
      tokensIn: z.number().int().nonnegative(),
      tokensOut: z.number().int().nonnegative(),
    }),
  }),
]);
export type StreamEvent = z.infer<typeof StreamEventSchema>;
