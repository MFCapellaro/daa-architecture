import { Router } from "express";
import type { Response } from "express";
import { signToken } from "../controllers/AuthController.js";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  PROFILE_FIELDS,
  ParticipantAccountStore,
  toPublicParticipant,
} from "../services/ParticipantAccountStore.js";

function validProfile(value: unknown): value is Record<string, string | string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.every(
    ([key, field]) =>
      PROFILE_FIELDS.includes(key as (typeof PROFILE_FIELDS)[number]) &&
      (typeof field === "string" ||
        (Array.isArray(field) && field.every((item) => typeof item === "string"))),
  );
}

export function createParticipantsRouter(store: ParticipantAccountStore) {
  const router = Router();
  const authenticate = createAuthMiddleware(store);

  router.get(
    "/api/participants/me",
    authenticate,
    requireAuth(["participante", "dealer"]),
    async (req: AuthRequest, res: Response) => {
      const account = req.user && (await store.findById(req.user.id));
      if (!account || account.status !== "active") {
        return res.status(404).json({ message: "Participant account not found" });
      }
      const participant = toPublicParticipant(account);
      return res.json({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
        profile: participant.profile,
      });
    },
  );

  router.patch(
    "/api/participants/me",
    authenticate,
    requireAuth(["participante", "dealer"]),
    async (req: AuthRequest, res: Response) => {
      const body = req.body as Record<string, unknown> | undefined;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ message: "A JSON object is required" });
      }
      const keys = Object.keys(body);
      if (
        keys.length === 0 ||
        keys.some((key) => key !== "name" && key !== "profile") ||
        (body.name !== undefined &&
          (typeof body.name !== "string" || !body.name.trim())) ||
        (body.profile !== undefined && !validProfile(body.profile))
      ) {
        return res.status(400).json({ message: "Invalid participant profile update" });
      }

      const patch: { name?: string; profile?: Record<string, string | string[]> } = {};
      if (typeof body.name === "string") patch.name = body.name.trim();
      if (body.profile !== undefined) {
        patch.profile = body.profile as Record<string, string | string[]>;
      }
      const updated = req.user && (await store.update(req.user.id, patch));
      if (!updated || updated.status !== "active") {
        return res.status(404).json({ message: "Participant account not found" });
      }
      const participant = toPublicParticipant(updated);
      return res.json({
        user: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          role: participant.role,
          profile: participant.profile,
        },
      });
    },
  );

  router.post(
    "/api/participants/me/dealer",
    authenticate,
    requireAuth(["participante"]),
    async (req: AuthRequest, res: Response) => {
      const account = req.user && (await store.findById(req.user.id));
      if (!account || account.status !== "active") {
        return res.status(404).json({ message: "Participant account not found" });
      }
      const updated = await store.update(account.id, { role: "dealer" });
      if (!updated) return res.status(404).json({ message: "Participant not found" });
      const user = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      };
      return res.json({
        participant: {
          ...user,
          status: updated.status,
          joinedAt: updated.joinedAt,
          profile: updated.profile,
        },
        token: signToken({ id: user.id, email: user.email, role: user.role }),
        user,
      });
    },
  );

  return router;
}
