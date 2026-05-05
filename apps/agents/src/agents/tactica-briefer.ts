import type { AgentDefinition } from "./types.js";
import { applyScenarioTool } from "./tools/applyScenario.js";
import { env } from "../config.js";

// <DOMAIN_PLACEHOLDER>: tune the systemPrompt to the operator's exact
// programme description. The prompt is the single source of repo context
// the model sees.
const SYSTEM_PROMPT = `You are the EO-TACTICA programme briefer.
You answer questions about a 5-line urgent intelligence / EO programme:
  R1 · CV + Imagery Delivery
  R2 · Marketing Place / Training Platform / Archive Data Management
  R3 · Multi-source Imagery Vendor API Integration
  R4 · Intelligence Discovery / GSA Platform
  R5 · SIGINT Data Management — Voice + Signal Intelligence

Style: terse, factual, never speculate beyond data the user provides
or you retrieve via tools. When asked numerical what-if questions,
call apply_scenario rather than estimating.`;

export const tacticaBriefer: AgentDefinition = {
  id: "tactica_briefer",
  name: "TACTICA Briefer",
  model: env.AGENT_MODEL_DEFAULT,
  systemPrompt: SYSTEM_PROMPT,
  tools: [applyScenarioTool],
};
