import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "@eo-tactica/auth";
import { createLogger } from "@eo-tactica/observability";
import { corsOrigins, env } from "./config.js";
import { askRouter } from "./routes/ask.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

const log = createLogger({ name: "agents" });

function softAuth(req: Request, _res: Response, next: NextFunction) {
  // The agents service trusts the backend's JWT secret if available; in
  // dev with no JWT_SECRET set, requests are allowed through anonymously.
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token && process.env.JWT_SECRET) {
    try {
      req.user = verifyToken(token, process.env.JWT_SECRET);
    } catch {
      /* ignore — anonymous fallback */
    }
  }
  next();
}

async function main() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger: log }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
  app.use(softAuth);

  app.get("/api/agents/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!env.ANTHROPIC_API_KEY,
      model: env.AGENT_MODEL_DEFAULT,
    });
  });

  app.use("/api/agents", askRouter());

  app.listen(env.PORT, env.HOST, () => {
    log.info(
      { port: env.PORT, host: env.HOST, hasApiKey: !!env.ANTHROPIC_API_KEY },
      "agents listening",
    );
  });
}

main().catch((err) => {
  log.error({ err }, "fatal bootstrap error");
  process.exit(1);
});
