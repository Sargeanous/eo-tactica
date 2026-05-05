import { z } from "zod";
import { applyScenario, computeKpis } from "@eo-tactica/shared";
import type { AgentTool } from "../types.js";

const InputSchema = z.object({
  baseline: z.array(
    z.object({
      period: z.number(),
      cost: z.number(),
      benefit: z.number(),
    }),
  ),
  delayUnits: z.number().default(0),
  costMultiplier: z.number().default(1),
  benefitMultiplier: z.number().default(1),
  discountRatePct: z.number().optional(),
  annualInflationPct: z.number().optional(),
});

type Input = z.infer<typeof InputSchema>;

export const applyScenarioTool: AgentTool = {
  name: "apply_scenario",
  description:
    "Apply a what-if scenario (delay / cost / benefit multipliers, optional discount + inflation) to a baseline cashflow series and return the adjusted series plus KPIs (NPV, IRR, payback period). Use this when the user asks 'what happens if delay = N' or 'what is the NPV under scenario X'.",
  inputSchema: InputSchema,
  async run(rawInput) {
    const input = rawInput as Input;
    const adjusted = applyScenario(input.baseline, {
      delayUnits: input.delayUnits,
      costMultiplier: input.costMultiplier,
      benefitMultiplier: input.benefitMultiplier,
      discountRatePct: input.discountRatePct,
      annualInflationPct: input.annualInflationPct,
    });
    const kpis = computeKpis(adjusted, input.discountRatePct);
    return { adjusted, kpis };
  },
};
