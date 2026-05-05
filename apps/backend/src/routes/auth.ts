import { Router } from "express";
import { LoginRequestSchema, type LoginResponse } from "@eo-tactica/shared";
import { signToken, verifyPassword } from "@eo-tactica/auth";
import { pool } from "../lib/db.js";
import { env } from "../config.js";

export function authRouter(jwtSecret: string): Router {
  const r = Router();

  r.post("/login", async (req, res) => {
    const parsed = LoginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
    const { email, password } = parsed.data;
    const result = await pool.query<{
      id: string;
      tenant_id: string;
      email: string;
      display_name: string;
      role: "super_admin" | "admin" | "operator" | "viewer";
      locale: "en" | "ar";
      password_hash: string;
    }>(
      `SELECT id, tenant_id, email, display_name, role, locale, password_hash
         FROM users WHERE email = $1 LIMIT 1`,
      [email],
    );
    const row = result.rows[0];
    if (!row) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    const ok = await verifyPassword(password, row.password_hash);
    if (!ok) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    const token = signToken(
      { sub: row.id, tenantId: row.tenant_id, role: row.role },
      jwtSecret,
      env.JWT_TTL_SECONDS,
    );
    const body: LoginResponse = {
      token,
      user: {
        id: row.id,
        tenantId: row.tenant_id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        locale: row.locale,
      },
    };
    res.json(body);
  });

  return r;
}
