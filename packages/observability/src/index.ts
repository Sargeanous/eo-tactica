import { pino, type Logger, type LoggerOptions } from "pino";

export type { Logger };

export interface CreateLoggerOptions {
  name: string;
  level?: LoggerOptions["level"];
  pretty?: boolean;
}

export function createLogger(opts: CreateLoggerOptions): Logger {
  const { name, level = process.env.LOG_LEVEL ?? "info", pretty } = opts;
  return pino({
    name,
    level,
    ...(pretty
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss" },
          },
        }
      : {}),
  });
}
