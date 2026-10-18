import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ActivityStore, type ActivityInput, type ActivityKind, type ActivityLocationKind } from "../services/ActivityStore.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";

const ACTIVITY_KINDS: ActivityKind[] = ["training", "course", "expo", "field-application", "event", "other"];
const LOCATION_KINDS: ActivityLocationKind[] = ["in-person", "virtual"];
const IMAGE_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
const IMAGE_MAX_LENGTH = 1_500_000;
const TEXT_LIMITS: Record<keyof Omit<ActivityInput, "kind" | "locationKind" | "linkedEntities" | "featured">, number> = {
  title: 160,
  description: 3000,
  startsAt: 40,
  endsAt: 40,
  location: 240,
  onlineUrl: 500,
  contactName: 120,
  contactEmail: 254,
  contactPhone: 60,
  registrationUrl: 500,
  flyer: IMAGE_MAX_LENGTH,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateActivityInput = (value: unknown): ActivityInput | string => {
  if (!isRecord(value)) return "Los datos de la actividad deben ser un objeto.";
  for (const [field, maxLength] of Object.entries(TEXT_LIMITS)) {
    const input = value[field];
    if (typeof input !== "string" || (["title", "startsAt", "endsAt"].includes(field) && !input.trim())) {
      return `El campo ${field} es obligatorio.`;
    }
    if (input.length > maxLength) return `El campo ${field} supera el máximo permitido.`;
  }
  if (!ACTIVITY_KINDS.includes(value.kind as ActivityKind)) return "El tipo de actividad no es válido.";
  if (!LOCATION_KINDS.includes(value.locationKind as ActivityLocationKind)) return "El tipo de ubicación no es válido.";
  if (!Array.isArray(value.linkedEntities)
    || value.linkedEntities.length > 30
    || !value.linkedEntities.every((entity) => typeof entity === "string" && entity.trim().length <= 160)) {
    return "Las entidades vinculadas no son válidas.";
  }
  if (typeof value.featured !== "boolean") return "La importancia de la actividad no es válida.";

  const start = Date.parse(value.startsAt as string);
  const end = Date.parse(value.endsAt as string);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return "Las fechas de inicio y finalización no son válidas.";
  }
  if (value.locationKind === "in-person" && !(value.location as string).trim()) {
    return "Indica el lugar de la actividad presencial.";
  }
  if (value.locationKind === "virtual" && !(value.onlineUrl as string).trim()) {
    return "Indica el enlace de la actividad virtual.";
  }
  for (const field of ["onlineUrl", "registrationUrl"] as const) {
    const url = value[field];
    if (typeof url === "string" && url.trim()) {
      try {
        if (!["http:", "https:"].includes(new URL(url).protocol)) return `El campo ${field} debe ser un enlace HTTPS o HTTP.`;
      } catch {
        return `El campo ${field} debe ser un enlace válido.`;
      }
    }
  }
  if (typeof value.contactEmail === "string" && value.contactEmail
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail)) {
    return "El correo de contacto no es válido.";
  }
  if (!(value.flyer as string).startsWith("data:image/")
    || (value.flyer as string).length > IMAGE_MAX_LENGTH
    || !IMAGE_DATA_URL.test(value.flyer as string)) {
    return "Adjunta un folleto JPG, PNG o WebP válido de hasta 1 MB.";
  }

  return {
    title: (value.title as string).trim(),
    kind: value.kind as ActivityKind,
    description: (value.description as string).trim(),
    startsAt: value.startsAt as string,
    endsAt: value.endsAt as string,
    locationKind: value.locationKind as ActivityLocationKind,
    location: (value.location as string).trim(),
    onlineUrl: (value.onlineUrl as string).trim(),
    contactName: (value.contactName as string).trim(),
    contactEmail: (value.contactEmail as string).trim(),
    contactPhone: (value.contactPhone as string).trim(),
    registrationUrl: (value.registrationUrl as string).trim(),
    linkedEntities: (value.linkedEntities as string[]).map((entity) => entity.trim()).filter(Boolean),
    flyer: value.flyer as string,
    featured: value.featured,
  };
};

const publicActivity = (activity: Awaited<ReturnType<ActivityStore["list"]>>[number]) => ({
  id: activity.id,
  title: activity.title,
  kind: activity.kind,
  description: activity.description,
  startsAt: activity.startsAt,
  endsAt: activity.endsAt,
  locationKind: activity.locationKind,
  location: activity.location,
  onlineUrl: activity.onlineUrl,
  contactName: activity.contactName,
  contactEmail: activity.contactEmail,
  contactPhone: activity.contactPhone,
  registrationUrl: activity.registrationUrl,
  linkedEntities: activity.linkedEntities,
  flyer: activity.flyer,
  featured: activity.featured,
});

export function createActivitiesRouter(
  accountStore = new ParticipantAccountStore(),
  activityStore = new ActivityStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);

  router.get("/api/activities", async (_req, res: Response) => {
    const activities = (await activityStore.list())
      .filter((activity) => activity.visible)
      .map(publicActivity);
    return res.json(activities);
  });

  router.post(
    "/api/activities",
    authenticate,
    requireAuth(["participante", "dealer"]),
    async (req: AuthRequest, res: Response) => {
      const input = validateActivityInput(req.body);
      if (typeof input === "string") return res.status(400).json({ message: input });
      if (!req.user) return res.status(401).json({ message: "Se requiere una sesión activa." });
      const account = await accountStore.findById(req.user.id);
      if (!account) return res.status(401).json({ message: "La cuenta de origen no está disponible." });

      const activity = await activityStore.create(input, {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
      });
      return res.status(201).json({
        activity: { id: activity.id, title: activity.title, visible: activity.visible },
        message: "Actividad enviada. Se publicará después de la revisión, en un plazo de 24 a 48 horas.",
      });
    },
  );

  router.get(
    "/api/admin/activities/notifications",
    authenticate,
    requireAuth(["admin"]),
    async (_req, res: Response) => {
      const pending = (await activityStore.list())
        .filter((activity) => !activity.reviewed)
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .map(({ id, title, startsAt, createdAt }) => ({ id, title, startsAt, createdAt }));
      return res.json(pending);
    },
  );

  router.get(
    "/api/admin/activities",
    authenticate,
    requireAuth(["admin"]),
    async (_req, res: Response) => res.json(await activityStore.list()),
  );

  router.post(
    "/api/admin/activities",
    authenticate,
    requireAuth(["admin"]),
    async (req: AuthRequest, res: Response) => {
      const input = validateActivityInput(req.body);
      if (typeof input === "string") return res.status(400).json({ message: input });
      if (!req.user) return res.status(401).json({ message: "Se requiere una sesión activa." });
      const activity = await activityStore.create(input, {
        id: req.user.id,
        name: "Administración",
        email: req.user.email,
        role: "admin",
      });
      return res.status(201).json(activity);
    },
  );

  router.patch(
    "/api/admin/activities/:id",
    authenticate,
    requireAuth(["admin"]),
    async (req, res: Response) => {
      if (typeof req.params.id !== "string") {
        return res.status(400).json({ message: "Identificador de actividad inválido." });
      }
      const body = req.body;
      if (!isRecord(body) || !Object.keys(body).length) {
        return res.status(400).json({ message: "Indica los campos de actividad que quieres cambiar." });
      }
      const current = (await activityStore.list()).find((activity) => activity.id === req.params.id);
      if (!current) return res.status(404).json({ message: "Actividad no encontrada." });
      if (body.visible !== undefined && typeof body.visible !== "boolean") {
        return res.status(400).json({ message: "El campo visible debe ser booleano." });
      }
      const visible = body.visible === undefined ? current.visible : body.visible;
      if (Object.keys(body).every((field) => field === "visible")) {
        const updated = await activityStore.update(req.params.id, {
          visible,
          ...(body.visible !== undefined ? { reviewed: true } : {}),
        });
        if (!updated) return res.status(404).json({ message: "Actividad no encontrada." });
        return res.json(updated);
      }
      const input = validateActivityInput({
        ...current,
        ...body,
        featured: body.featured ?? current.featured,
        linkedEntities: body.linkedEntities ?? current.linkedEntities,
        visible,
      });
      if (typeof input === "string") return res.status(400).json({ message: input });
      const updated = await activityStore.update(req.params.id, {
        ...input,
        visible,
        ...(body.visible !== undefined ? { reviewed: true } : {}),
      });
      if (!updated) return res.status(404).json({ message: "Actividad no encontrada." });
      return res.json(updated);
    },
  );

  router.delete(
    "/api/admin/activities/:id",
    authenticate,
    requireAuth(["admin"]),
    async (req, res: Response) => {
      if (typeof req.params.id !== "string") {
        return res.status(400).json({ message: "Identificador de actividad inválido." });
      }
      const deleted = await activityStore.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Actividad no encontrada." });
      return res.status(204).end();
    },
  );

  return router;
}
