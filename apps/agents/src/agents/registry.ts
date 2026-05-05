import type { AgentId } from "@eo-tactica/shared";
import type { AgentDefinition } from "./types.js";
import { tacticaBriefer } from "./tactica-briefer.js";

const REGISTRY: Record<AgentId, AgentDefinition> = {
  tactica_briefer: tacticaBriefer,
  tactica_planner: tacticaBriefer,
  tactica_analyst: tacticaBriefer,
};

export function getAgent(id: AgentId): AgentDefinition {
  return REGISTRY[id] ?? tacticaBriefer;
}
