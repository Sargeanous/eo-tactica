import type { z } from "zod";
import type { AgentId, StreamEvent } from "@eo-tactica/shared";

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  /** Input is parsed via `inputSchema.parse(rawInput)` before this runs;
   *  the per-tool implementation casts to its known shape. */
  run: (input: unknown, ctx: AgentContext) => Promise<unknown>;
}

export interface AgentDefinition {
  id: AgentId;
  name: string;
  model: string;
  systemPrompt: string;
  tools: AgentTool[];
}

export interface AgentContext {
  tenantId: string;
  userId: string | null;
  locale: "en" | "ar";
}

export interface AgentRunResult {
  stopReason: string | null;
  tokensIn: number;
  tokensOut: number;
}

export type Emit = (event: StreamEvent) => void;

export class MissingApiKey extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY not set");
  }
}
