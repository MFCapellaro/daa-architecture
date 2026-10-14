import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AccountRole } from "../services/ParticipantAccountStore.js";
import {
  normalizeEmail,
  ParticipantAccountStore,
} from "../services/ParticipantAccountStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_desarrollo";

function expectedAdminId(email: string): string {
  return `admin-${createHash("sha256").update(normalizeEmail(email)).digest("hex")}`;
}

export function createAuthMiddleware(store: ParticipantAccountStore) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bearer token required" });
    }

    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET);
      if (
        !decoded ||
        typeof decoded !== "object" ||
        typeof decoded.id !== "string" ||
        typeof decoded.email !== "string" ||
        !["admin", "dealer", "participante"].includes(decoded.role as string)
      ) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const role = decoded.role as AccountRole;
      if (role === "admin") {
        const email = process.env.ADMIN_EMAIL;
        const hasPassword = Boolean(
          process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH,
        );
        if (
          !email ||
          !hasPassword ||
          normalizeEmail(decoded.email) !== normalizeEmail(email) ||
          decoded.id !== expectedAdminId(email)
        ) {
          return res.status(401).json({ message: "Admin account is unavailable" });
        }
        req.user = { id: decoded.id, email: normalizeEmail(email), role };
        return next();
      }

      const account = await store.findById(decoded.id);
      if (
        !account ||
        account.status !== "active" ||
        account.role !== role ||
        normalizeEmail(account.email) !== normalizeEmail(decoded.email)
      ) {
        return res.status(401).json({ message: "Account is unavailable" });
      }
      req.user = { id: account.id, email: account.email, role: account.role };
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: AccountRole;
  };
}
