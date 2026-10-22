import { Router } from "express";
import type { Response } from "express";
import { signToken } from "../controllers/AuthController.js";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  DEALER_AGREEMENT_VERSION,
  PROFILE_FIELDS,
  ParticipantAccountStore,
  toPublicParticipant,
} from "../services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../services/SystemNotificationStore.js";

function validProfile(value: unknown): value is Record<string, string | string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.every(
    ([key, field]) =>
      PROFILE_FIELDS.includes(key as (typeof PROFILE_FIELDS)[number]) &&
      (typeof field === "string" ||
        (Array.isArray(field) && field.every((item) => typeof item === "string"))) &&
      (key !== "avatar" ||
        field === "" ||
        (typeof field === "string" &&
          field.length <= 80_000 &&
          /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(field))),
  );
}

export function createParticipantsRouter(
  store: ParticipantAccountStore,
  notifications = new SystemNotificationStore(),
) {
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
        dealerAgreement: account.dealerAgreement ?? null,
      });
    },
  );

  router.get(
    "/api/participants/map",
    (req, res, next) => req.headers.authorization
      ? authenticate(req, res, next)
      : next(),
    async (req: AuthRequest, res: Response) => {
      const participants = (await store.list()).flatMap((account) => {
        if (account.status !== "active") return [];

        const rawLatitude = account.profile.latitude;
        const rawLongitude = account.profile.longitude;
        if (
          typeof rawLatitude !== "string" ||
          !rawLatitude.trim() ||
          typeof rawLongitude !== "string" ||
          !rawLongitude.trim()
        ) {
          return [];
        }
        const latitude = Number(rawLatitude);
        const longitude = Number(rawLongitude);
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 ||
          Math.abs(longitude) > 180
        ) {
          return [];
        }

        const contact = {
          address: account.profile.address ?? null,
          city: account.profile.city ?? null,
          province: account.profile.province ?? null,
          country: account.profile.country ?? null,
          ...(req.user ? {
            email: account.email,
            phone: account.profile.phone ?? null,
          } : {}),
        };

        return [{
          id: `participant-${account.id}`,
          name: account.name,
          categoryLabel: "Participantes",
          layers: ["participantes"],
          isPublic: true,
          contact,
          ...(req.user ? { presence: { website: account.profile.website ?? null } } : {}),
          location: {
            address: contact.address,
            city: contact.city,
            province: contact.province,
            country: contact.country,
            coordinates: { latitude, longitude },
          },
          geolocation: { latitude, longitude },
        }];
      });

      return res.json(participants);
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
      await Promise.all([
        notifications.create({
          recipientId: "admin",
          category: "actor",
          title: "Cambio de rol para revisar",
          message: `${account.name} solicitó ampliar su cuenta al rol Dealer.`,
          href: "/admin/participants",
          entityId: account.id,
        }),
        notifications.create({
          recipientId: account.id,
          category: "actor",
          title: "Rol Dealer activado",
          message: "Tu cuenta ya tiene el rol Dealer. Acepta el acuerdo vigente para habilitar la publicación de Pools.",
          href: "/portal",
          entityId: account.id,
        }),
      ]);
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

  router.post(
    "/api/participants/me/dealer-agreement",
    authenticate,
    requireAuth(["dealer"]),
    async (req: AuthRequest, res: Response) => {
      const body = req.body as Record<string, unknown> | undefined;
      if (!body || typeof body !== "object" || Array.isArray(body)
        || body.accepted !== true
        || body.version !== DEALER_AGREEMENT_VERSION
        || typeof body.legalName !== "string"
        || !body.legalName.trim()
        || body.legalName.length > 160
        || typeof body.taxId !== "string"
        || !/^\d{2}-?\d{8}-?\d$/.test(body.taxId.trim())
        || (body.representative !== undefined
          && (typeof body.representative !== "string" || body.representative.length > 160))) {
        return res.status(400).json({ message: "Completa una razón social, CUIT válido y la aceptación expresa de la versión vigente." });
      }
      const account = req.user && await store.acceptDealerAgreement(req.user.id, {
        legalName: body.legalName.trim(),
        taxId: body.taxId.trim(),
        representative: typeof body.representative === "string" ? body.representative.trim() : "",
      });
      if (!account) return res.status(404).json({ message: "La cuenta Dealer no está disponible." });
      return res.json({ dealerAgreement: account.dealerAgreement });
    },
  );

  return router;
}
