import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { WebSocketServer } from "ws";
import http from "node:http";
import { createLogger } from "@eo-tactica/observability";
import { corsOrigins, env } from "./config.js";
import { bootstrap } from "./lib/bootstrap.js";
import { requireAuth } from "./lib/auth-middleware.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";
import { requirementLinesRouter } from "./routes/requirement-lines.js";
import { ticketsRouter } from "./routes/tickets.js";

const log = createLogger({ name: "backend" });

async function main() {
  const { jwtSecret } = await bootstrap();

  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger: log }));
  app.use(rateLimit({ windowMs: 60_000, max: 600 }));

  app.use("/api/health", healthRouter());
  app.use("/api/auth", authRouter(jwtSecret));

  const auth = requireAuth(jwtSecret);
  app.use("/api/projects", auth, projectsRouter());
  app.use("/api/requirement-lines", auth, requirementLinesRouter());
  app.use("/api/tickets", auth, ticketsRouter());

  const server = http.createServer(app);

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/ws")) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "hello", at: new Date().toISOString() }));
  });

  server.listen(env.PORT, env.HOST, () => {
    log.info({ port: env.PORT, host: env.HOST }, "backend listening");
  });
}

main().catch((err) => {
  log.error({ err }, "fatal bootstrap error");
  process.exit(1);
});
