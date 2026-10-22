import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ActorSubmissionStore, type ActorSubmissionInput, type SubmittedActorType } from "../services/ActorSubmissionStore.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../services/SystemNotificationStore.js";

const ACTOR_TYPES: SubmittedActorType[] = [
  "company", "person", "institution", "manufacturer", "supplier", "dealer",
  "service", "operator", "organization", "community", "training", "other",
];
const MAX_LAYERS = 12;
const MAX_NAME_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 3000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function validateInput(value: unknown): ActorSubmissionInput | string {
  if (!isRecord(value)) return "Los datos del actor deben ser un objeto.";
  if (typeof value.name !== "string" || !value.name.trim() || value.name.length > MAX_NAME_LENGTH) {
    return "El nombre es obligatorio y no puede superar 160 caracteres.";
  }
  if (!ACTOR_TYPES.includes(value.type as SubmittedActorType)) return "Selecciona un tipo de actor válido.";
  if (typeof value.description !== "string" || value.description.length > MAX_DESCRIPTION_LENGTH) {
    return "La descripción no puede superar 3000 caracteres.";
  }
  if (!Array.isArray(value.layers) || value.layers.length > MAX_LAYERS
    || !value.layers.every((layer) => typeof layer === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(layer))) {
    return "Selecciona categorías válidas para el actor.";
  }
  if (!isRecord(value.contact)) return "Completa los datos de contacto del actor.";
  const limits = { email: 254, phone: 80, website: 500, address: 300, city: 120, province: 120, country: 120 };
  for (const [field, limit] of Object.entries(limits)) {
    const input = value.contact[field];
    if (typeof input !== "string" || input.length > limit) return `El campo de contacto ${field} no es válido.`;
  }
  if (value.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contact.email as string)) {
    return "El correo del actor no es válido.";
  }
  const website = value.contact.website as string;
  if (website) {
    try {
      if (!["http:", "https:"].includes(new URL(website).protocol)) return "El sitio web debe comenzar con HTTP o HTTPS.";
    } catch {
      return "El sitio web no es válido.";
    }
  }
  return {
    name: value.name.trim(),
    type: value.type as SubmittedActorType,
    description: (value.description as string).trim(),
    layers: [...new Set(value.layers as string[])],
    contact: Object.fromEntries(Object.entries(limits).map(([field]) =>
      [field, (value.contact as Record<string, string>)[field].trim()],
    )) as ActorSubmissionInput["contact"],
  };
}

export function createActorSubmissionsRouter(
  accountStore = new ParticipantAccountStore(),
  submissionStore = new ActorSubmissionStore(),
  notifications = new SystemNotificationStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);

  router.get("/api/actors/submissions/mine", authenticate, requireAuth(["participante", "dealer"]), async (req: AuthRequest, res: Response) => {
    const submissions = (await submissionStore.list()).filter((item) => item.source.id === req.user?.id);
    return res.json(submissions);
  });

  router.post("/api/actors/submissions", authenticate, requireAuth(["participante", "dealer"]), async (req: AuthRequest, res: Response) => {
    const input = validateInput(req.body);
    if (typeof input === "string") return res.status(400).json({ message: input });
    const account = req.user && await accountStore.findById(req.user.id);
    if (!account || account.status !== "active") return res.status(401).json({ message: "Tu cuenta no está disponible." });
    const submission = await submissionStore.create(input, {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    });
    await notifications.create({
      recipientId: "admin",
      category: "actor",
      title: "Nuevo actor para revisar",
      message: `${account.name} propuso incorporar "${submission.name}" al directorio.`,
      href: "/admin/directory",
      entityId: submission.id,
    });
    return res.status(201).json({
      submission: { id: submission.id, name: submission.name, status: submission.status },
      message: "El actor se envió al BackOffice para revisión y aprobación.",
    });
  });

  router.get("/api/admin/actors/submissions", authenticate, requireAuth(["admin"]), async (_req, res: Response) => {
    return res.json(await submissionStore.list());
  });

  router.patch("/api/admin/actors/submissions/:id", authenticate, requireAuth(["admin"]), async (req, res: Response) => {
    if (typeof req.params.id !== "string" || !isRecord(req.body)
      || !["approved", "rejected"].includes(String(req.body.status))
      || (req.body.message !== undefined && typeof req.body.message !== "string")) {
      return res.status(400).json({ message: "Indica una aprobación o rechazo válido y, si corresponde, un mensaje." });
    }
    const current = await submissionStore.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "La propuesta de actor no existe." });
    if (current.status !== "pending") return res.status(409).json({ message: "La propuesta ya fue revisada." });
    const updated = await submissionStore.review(
      current.id,
      req.body.status as "approved" | "rejected",
      typeof req.body.message === "string" ? req.body.message : "",
    );
    if (!updated) return res.status(409).json({ message: "La propuesta ya fue revisada." });
    await notifications.create({
      recipientId: current.source.id,
      category: "actor",
      title: updated.status === "approved" ? "Actor aprobado" : "Actor requiere cambios",
      message: updated.status === "approved"
        ? `La propuesta "${updated.name}" fue aprobada y agregada al directorio.${updated.reviewMessage ? ` ${updated.reviewMessage}` : ""}`
        : `La propuesta "${updated.name}" no fue aprobada.${updated.reviewMessage ? ` ${updated.reviewMessage}` : ""}`,
      href: "/portal/actores",
      entityId: updated.id,
    });
    return res.json(updated);
  });

  return router;
}
