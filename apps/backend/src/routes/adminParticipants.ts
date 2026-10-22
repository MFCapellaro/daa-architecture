import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  PROFILE_FIELDS,
  normalizeEmail,
  ParticipantAccountStore,
  toPublicParticipant,
} from "../services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../services/SystemNotificationStore.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDITABLE_FIELDS = new Set(["name", "email", "role", "status", "profile"]);

function validProfile(value: unknown): value is Record<string, string | string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const allowed = new Set<string>(PROFILE_FIELDS);
  return Object.entries(value).every(
    ([key, field]) =>
      allowed.has(key) &&
      (typeof field === "string" ||
        (Array.isArray(field) && field.every((item) => typeof item === "string"))),
  );
}

export function createAdminParticipantsRouter(
  store: ParticipantAccountStore,
  notifications = new SystemNotificationStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(store);
  const adminOnly = [authenticate, requireAuth(["admin"])] as const;

  router.get(
    "/api/admin/participants",
    ...adminOnly,
    async (_req, res: Response) => {
      const accounts = await store.list();
      return res.json(accounts.map(toPublicParticipant));
    },
  );

  router.patch(
    "/api/admin/participants/:id",
    ...adminOnly,
    async (req: AuthRequest, res: Response) => {
      const body = req.body as Record<string, unknown> | undefined;
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        Object.keys(body).length === 0 ||
        Object.keys(body).some((key) => !EDITABLE_FIELDS.has(key)) ||
        (body.name !== undefined &&
          (typeof body.name !== "string" || !body.name.trim())) ||
        (body.email !== undefined &&
          (typeof body.email !== "string" ||
            !EMAIL_PATTERN.test(body.email.trim()))) ||
        (body.role !== undefined &&
          body.role !== "participante" &&
          body.role !== "dealer") ||
        (body.status !== undefined &&
          body.status !== "active" &&
          body.status !== "suspended") ||
        (body.profile !== undefined && !validProfile(body.profile))
      ) {
        return res.status(400).json({ message: "Invalid participant update" });
      }

      if (typeof req.params.id !== "string") {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const current = await store.findById(req.params.id);
      if (!current) return res.status(404).json({ message: "Participant not found" });

      if (
        typeof body.email === "string" &&
        normalizeEmail(body.email) !== normalizeEmail(current.email)
      ) {
        const normalizedEmail = normalizeEmail(body.email as string);
        const adminEmail = process.env.ADMIN_EMAIL;
        const existingEmail = await store.findByEmail(normalizedEmail);
        if (
          (adminEmail && normalizeEmail(adminEmail) === normalizedEmail) ||
          (existingEmail !== undefined && existingEmail.id !== current.id)
        ) {
          return res.status(409).json({ message: "Email is already registered" });
        }
      }

      const patch: Parameters<typeof store.update>[1] = {
        ...(typeof body.name === "string" ? { name: body.name.trim() } : {}),
        ...(typeof body.email === "string"
          ? { email: normalizeEmail(body.email) }
          : {}),
        ...(body.role === "participante" || body.role === "dealer"
          ? { role: body.role as "participante" | "dealer" }
          : {}),
        ...(body.status === "active" || body.status === "suspended"
          ? { status: body.status as "active" | "suspended" }
          : {}),
        ...(body.profile !== undefined
          ? { profile: body.profile as Record<string, string | string[]> }
          : {}),
      };
      const updated = await store.update(current.id, patch);
      if (!updated) return res.status(404).json({ message: "Participant not found" });
      if (body.role !== undefined && updated.role !== current.role) {
        await notifications.create({
          recipientId: updated.id,
          category: "actor",
          title: "Cambio de rol realizado",
          message: `Tu rol cambió de ${current.role} a ${updated.role}.`,
          href: "/portal",
          entityId: updated.id,
        });
      }
      return res.json(toPublicParticipant(updated));
    },
  );

  router.delete(
    "/api/admin/participants/:id",
    ...adminOnly,
    async (req: AuthRequest, res: Response) => {
      if (typeof req.params.id !== "string") {
        return res.status(400).json({ message: "Invalid participant ID" });
      }
      const deleted = await store.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Participant not found" });
      return res.status(204).end();
    },
  );

  return router;
}
