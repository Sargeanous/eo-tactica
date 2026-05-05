import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "../lib/jsonSchema.js";
import { env } from "../config.js";
import {
  MissingApiKey,
  type AgentContext,
  type AgentDefinition,
  type AgentRunResult,
  type Emit,
} from "../agents/types.js";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) throw new MissingApiKey();
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

function buildSystemSuffix(locale: "en" | "ar", _agentId: string): string {
  if (locale === "ar") {
    return "\n\nاللغة المفضلة للرد: العربية. حافظ على دقة الأرقام كما هي.";
  }
  return "\n\nReply in concise English. Preserve numerical precision exactly.";
}

export async function runAgentStreaming(
  agent: AgentDefinition,
  prompt: string,
  ctx: AgentContext,
  emit: Emit,
): Promise<AgentRunResult> {
  let result: AgentRunResult = {
    stopReason: null,
    tokensIn: 0,
    tokensOut: 0,
  };

  let anthropic: Anthropic;
  try {
    anthropic = getClient();
  } catch (err) {
    if (err instanceof MissingApiKey) {
      emit({
        type: "error",
        code: "missing_api_key",
        message: err.message,
      });
      emit({ type: "done", result });
      return result;
    }
    throw err;
  }

  // Tool-cache: tag the *last* tool with cache_control: ephemeral to
  // cache the entire tool list across requests in this conversation.
  const tools = agent.tools.map((t, i) => {
    const at = {
      name: t.name,
      description: t.description,
      input_schema: zodToJsonSchema(t.inputSchema),
    };
    return i === agent.tools.length - 1
      ? { ...at, cache_control: { type: "ephemeral" as const } }
      : at;
  }) as unknown as Anthropic.Tool[];

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  for (let step = 0; step < env.AGENT_MAX_STEPS; step++) {
    let stopReason: string | null = null;
    let assistantContent: Anthropic.ContentBlockParam[] = [];
    const toolUses: Array<{ id: string; name: string; input: unknown }> = [];

    try {
      const stream = anthropic.messages.stream({
        model: agent.model,
        max_tokens: env.AGENT_MAX_TOKENS,
        system: [
          {
            type: "text",
            text: agent.systemPrompt + buildSystemSuffix(ctx.locale, agent.id),
            cache_control: { type: "ephemeral" },
          },
        ],
        messages,
        tools,
      });

      for await (const ev of stream) {
        if (
          ev.type === "content_block_delta" &&
          ev.delta.type === "text_delta"
        ) {
          emit({ type: "text_delta", text: ev.delta.text });
        }
      }

      const finalMessage = await stream.finalMessage();
      stopReason = finalMessage.stop_reason;
      assistantContent = finalMessage.content as Anthropic.ContentBlockParam[];
      result.tokensIn += finalMessage.usage.input_tokens ?? 0;
      result.tokensOut += finalMessage.usage.output_tokens ?? 0;

      for (const block of finalMessage.content) {
        if (block.type === "tool_use") {
          toolUses.push({
            id: block.id,
            name: block.name,
            input: block.input,
          });
          emit({ type: "tool_use", name: block.name, input: block.input });
        }
      }
    } catch (err) {
      const status = (err as { status?: number }).status;
      const code = status ? `anthropic_${status}` : "anthropic_error";
      const message =
        (err as { error?: { error?: { message?: string } } }).error?.error
          ?.message ?? (err as Error).message;
      emit({ type: "error", code, message });
      emit({ type: "done", result });
      return result;
    }

    if (toolUses.length === 0) {
      emit({
        type: "done",
        result: { ...result, stopReason: stopReason ?? "end_turn" },
      });
      return { ...result, stopReason: stopReason ?? "end_turn" };
    }

    messages.push({ role: "assistant", content: assistantContent });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const tool = agent.tools.find((t) => t.name === use.name);
      let output: unknown;
      try {
        if (!tool) throw new Error(`unknown tool: ${use.name}`);
        const parsed = tool.inputSchema.parse(use.input);
        output = await tool.run(parsed, ctx);
        emit({ type: "tool_result", name: use.name, output });
      } catch (err) {
        output = { error: (err as Error).message };
        emit({ type: "tool_result", name: use.name, output });
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify(output),
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  emit({ type: "done", result });
  return result;
}
