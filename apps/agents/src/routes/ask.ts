import { Router } from "express";
import { AgentAskRequestSchema, type StreamEvent } from "@eo-tactica/shared";
import { getAgent } from "../agents/registry.js";
import { runAgentStreaming } from "../runtime/runAgent.js";

export function askRouter(): Router {
  const r = Router();

  r.post("/ask", async (req, res) => {
    const parsed = AgentAskRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    const agent = getAgent(parsed.data.agentId);
    let textBuffer = "";
    let lastError: { code: string; message: string } | null = null;
    await runAgentStreaming(
      agent,
      parsed.data.prompt,
      {
        tenantId: req.user?.tenantId ?? "anonymous",
        userId: req.user?.sub ?? null,
        locale: parsed.data.locale,
      },
      (event) => {
        if (event.type === "text_delta") textBuffer += event.text;
        else if (event.type === "error")
          lastError = { code: event.code, message: event.message };
      },
    );
    res.json({ text: textBuffer, error: lastError });
  });

  r.post("/ask/stream", async (req, res) => {
    const parsed = AgentAskRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: StreamEvent) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const agent = getAgent(parsed.data.agentId);
    try {
      await runAgentStreaming(
        agent,
        parsed.data.prompt,
        {
          tenantId: req.user?.tenantId ?? "anonymous",
          userId: req.user?.sub ?? null,
          locale: parsed.data.locale,
        },
        send,
      );
    } catch (err) {
      send({
        type: "error",
        code: "runtime",
        message: (err as Error).message,
      });
    } finally {
      res.end();
    }
  });

  return r;
}
