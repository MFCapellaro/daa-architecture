import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import {
  normalizeEmail,
  ParticipantAccountStore,
} from "../services/ParticipantAccountStore.js";

export type UserRole = "admin" | "dealer" | "participante";

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_desarrollo";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function adminId(email: string): string {
  return `admin-${createHash("sha256").update(normalizeEmail(email)).digest("hex")}`;
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || (!password && !passwordHash)) return undefined;
  return { email: normalizeEmail(email), password, passwordHash };
}

async function matchesAdminPassword(
  candidate: string,
  credentials: NonNullable<ReturnType<typeof getAdminCredentials>>,
): Promise<boolean> {
  if (credentials.passwordHash) {
    try {
      return await bcrypt.compare(candidate, credentials.passwordHash);
    } catch {
      return false;
    }
  }
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const expectedDigest = createHash("sha256")
    .update(credentials.password ?? "")
    .digest();
  return timingSafeEqual(candidateDigest, expectedDigest);
}

export function signToken(user: { id: string; email: string; role: UserRole }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" });
}

export function createAuthController(store: ParticipantAccountStore) {
  const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body ?? {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Name, valid email, and password (at least 8 characters) are required",
      });
    }

    try {
      const normalizedEmail = normalizeEmail(email);
      const admin = getAdminCredentials();
      if (
        (admin && admin.email === normalizedEmail) ||
        (await store.findByEmail(normalizedEmail))
      ) {
        return res.status(409).json({ message: "Email is already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const account = await store.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      });
      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      };
      return res.status(201).json({
        token: signToken({ id: user.id, email: user.email, role: user.role }),
        user,
      });
    } catch (error) {
      console.error("Error registering participant:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (
      typeof email !== "string" ||
      !EMAIL_PATTERN.test(email.trim()) ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const admin = getAdminCredentials();
    if (admin && normalizedEmail === admin.email) {
      if (!(await matchesAdminPassword(password, admin))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const user = {
        id: adminId(admin.email),
        name: "Administrator",
        email: admin.email,
        role: "admin" as const,
      };
      return res.json({
        token: signToken({ id: user.id, email: user.email, role: user.role }),
        user,
      });
    }

    try {
      const account = await store.findByEmail(normalizedEmail);
      if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (account.status !== "active") {
        return res.status(403).json({ message: "Account is suspended" });
      }

      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      };
      return res.json({
        token: signToken({ id: user.id, email: user.email, role: user.role }),
        user,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const getMe = async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (req.user.role === "admin") {
      return res.json({
        user: {
          id: req.user.id,
          name: "Administrator",
          email: req.user.email,
          role: req.user.role,
        },
      });
    }

    const account = await store.findById(req.user.id);
    if (!account || account.status !== "active") {
      return res.status(401).json({ message: "Account is unavailable" });
    }
    return res.json({
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      },
    });
  };

  return { register, login, getMe };
}
