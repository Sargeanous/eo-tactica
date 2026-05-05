import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "@eo-tactica/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    try {
      req.user = verifyToken(token, secret);
      next();
    } catch {
      res.status(401).json({ error: "invalid_token" });
    }
  };
}
