import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SessionUser } from "@eo-tactica/shared";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: SessionUser["role"];
}

export function signToken(
  payload: JwtPayload,
  secret: string,
  ttlSeconds: number,
): string {
  return jwt.sign(payload, secret, { expiresIn: ttlSeconds });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
