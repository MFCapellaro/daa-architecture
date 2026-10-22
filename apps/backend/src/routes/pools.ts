import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  DEALER_AGREEMENT_VERSION,
  ParticipantAccountStore,
} from "../services/ParticipantAccountStore.js";
import { PoolStore, type PoolInput, type PoolRecord } from "../services/PoolStore.js";
import { SystemNotificationStore } from "../services/SystemNotificationStore.js";
import { notifyPoolLifecycle } from "../services/PoolLifecycleNotifications.js";

const IMAGE_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/;
const IMAGE_LIMIT = 450_000;
const IMAGE_COUNT = 5;
const STRING_LIMITS: Record<keyof Omit<PoolInput, "targetQuantity" | "unitPrice" | "discountedUnitPrice" | "images">, number> = {
  product: 160,
  brand: 100,
  model: 160,
  description: 3000,
  city: 120,
  province: 120,
  paymentConditions: 1200,
  warranty: 1200,
  validUntil: 40,
  training: 1200,
  afterSales: 1200,
  deliveryAvailability: 500,
  restrictions: 1200,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function validatePoolInput(value: unknown): PoolInput | string {
  if (!isRecord(value)) return "Los datos del pool deben ser un objeto.";
  for (const [field, maxLength] of Object.entries(STRING_LIMITS)) {
    const input = value[field];
    if (typeof input !== "string" || (["product", "brand", "city", "province", "validUntil"].includes(field) && !input.trim())) {
      return `El campo ${field} es obligatorio.`;
    }
    if (input.length > maxLength) return `El campo ${field} supera el máximo permitido.`;
  }
  if (!Number.isSafeInteger(value.targetQuantity) || (value.targetQuantity as number) < 1 || (value.targetQuantity as number) > 100_000) {
    return "La cantidad objetivo debe ser un número entero positivo.";
  }
  if (typeof value.unitPrice !== "number" || !Number.isFinite(value.unitPrice) || value.unitPrice < 0
    || typeof value.discountedUnitPrice !== "number" || !Number.isFinite(value.discountedUnitPrice)
    || value.discountedUnitPrice < 0 || value.discountedUnitPrice > value.unitPrice) {
    return "Los precios deben ser válidos y el precio por pool no puede superar el precio unitario.";
  }
  if (!Number.isFinite(Date.parse(value.validUntil as string))) return "La fecha de vigencia no es válida.";
  if (!Array.isArray(value.images) || value.images.length < 1 || value.images.length > IMAGE_COUNT
    || !value.images.every((image) =>
      typeof image === "string" && image.length <= IMAGE_LIMIT && IMAGE_DATA_URL.test(image))
    || value.images.reduce((sum, image) => sum + (typeof image === "string" ? image.length : 0), 0) > 2_000_000) {
    return "Adjunta entre 1 y 5 imágenes JPG optimizadas, de hasta 450 KB cada una.";
  }

  const input = Object.fromEntries(
    Object.keys(STRING_LIMITS).map((field) => [field, (value[field] as string).trim()]),
  );
  return {
    ...input,
    targetQuantity: value.targetQuantity as number,
    unitPrice: value.unitPrice as number,
    discountedUnitPrice: value.discountedUnitPrice as number,
    images: value.images as string[],
  } as PoolInput;
}

const poolSummary = (pool: PoolRecord, participantId?: string) => {
  const joinedQuantity = pool.members.reduce((total, member) => total + member.quantity, 0);
  const { members, dealer, ...publicPool } = pool;
  return {
    ...publicPool,
    dealer: { id: dealer.id, name: dealer.name },
    joinedQuantity,
    remainingQuantity: Math.max(0, pool.targetQuantity - joinedQuantity),
    participantCount: members.length,
    ...(participantId ? {
      joinedByCurrentUser: members.some((member) => member.participantId === participantId),
    } : {}),
  };
};

function similarPools(pool: PoolRecord, pools: PoolRecord[], profile: Record<string, unknown>) {
  const province = typeof profile.province === "string" && profile.province.trim()
    ? profile.province.trim().toLocaleLowerCase()
    : pool.province.trim().toLocaleLowerCase();
  const city = typeof profile.city === "string" && profile.city.trim()
    ? profile.city.trim().toLocaleLowerCase()
    : pool.city.trim().toLocaleLowerCase();
  const productWords = `${pool.brand} ${pool.product}`.toLocaleLowerCase().split(/\W+/).filter((word) => word.length > 3);
  return pools.filter((candidate) => {
    if (candidate.id === pool.id || !candidate.visible || candidate.status !== "active") return false;
    const sameZone = province
      ? candidate.province.trim().toLocaleLowerCase() === province
      : city && candidate.city.trim().toLocaleLowerCase() === city;
    const candidateTerms = `${candidate.brand} ${candidate.product}`.toLocaleLowerCase();
    const sameProduct = candidate.brand.trim().toLocaleLowerCase() === pool.brand.trim().toLocaleLowerCase()
      || productWords.some((word) => candidateTerms.includes(word));
    return Boolean(sameZone && sameProduct);
  }).map((candidate) => ({
    id: candidate.id,
    product: candidate.product,
    brand: candidate.brand,
    city: candidate.city,
    province: candidate.province,
    validUntil: candidate.validUntil,
  }));
}

export function createPoolsRouter(
  accountStore = new ParticipantAccountStore(),
  poolStore = new PoolStore(),
  notifications = new SystemNotificationStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);

  const requireAcceptedDealer = async (req: AuthRequest, res: Response): Promise<boolean> => {
    const account = req.user && await accountStore.findById(req.user.id);
    if (!account || account.role !== "dealer") {
      res.status(401).json({ message: "La cuenta Dealer no está disponible." });
      return false;
    }
    if (account.dealerAgreement?.version !== DEALER_AGREEMENT_VERSION) {
      res.status(403).json({ message: "Acepta la versión vigente del acuerdo Dealer antes de gestionar pools." });
      return false;
    }
    return true;
  };

  router.get("/api/pools", (req, res, next) => req.headers.authorization
    ? authenticate(req, res, next)
    : next(), async (req: AuthRequest, res: Response) => {
    const pools = (await poolStore.list()).filter((pool) => pool.visible && pool.status === "active");
    return res.json(pools.map((pool) => poolSummary(pool, req.user?.id)));
  });

  router.get(
    "/api/pools/mine",
    authenticate,
    requireAuth(["dealer"]),
    async (req: AuthRequest, res: Response) => {
      if (!await requireAcceptedDealer(req, res)) return;
      const pools = (await poolStore.list()).filter((pool) => pool.dealer.id === req.user?.id);
      return res.json(pools);
    },
  );

  router.post(
    "/api/pools",
    authenticate,
    requireAuth(["dealer"]),
    async (req: AuthRequest, res: Response) => {
      if (!await requireAcceptedDealer(req, res)) return;
      const input = validatePoolInput(req.body);
      if (typeof input === "string") return res.status(400).json({ message: input });
      if (Date.parse(input.validUntil) <= Date.now()) {
        return res.status(400).json({ message: "La vigencia debe finalizar en una fecha futura." });
      }
      const account = req.user && await accountStore.findById(req.user.id);
      if (!account) return res.status(401).json({ message: "La cuenta Dealer no está disponible." });
      const pool = await poolStore.create(input, { id: account.id, name: account.name, email: account.email });
      await notifications.create({
        recipientId: "admin",
        category: "pool",
        title: "Nuevo Pool para revisar",
        message: `${account.name} publicó el Pool "${pool.brand} ${pool.product}".`,
        href: "/admin/pools",
        entityId: pool.id,
      });
      return res.status(201).json(pool);
    },
  );

  router.patch(
    "/api/pools/:id",
    authenticate,
    requireAuth(["dealer"]),
    async (req: AuthRequest, res: Response) => {
      if (!await requireAcceptedDealer(req, res)) return;
      if (typeof req.params.id !== "string" || !isRecord(req.body) || !Object.keys(req.body).length) {
        return res.status(400).json({ message: "Indica un pool y campos válidos para actualizar." });
      }
      const current = (await poolStore.list()).find((pool) => pool.id === req.params.id);
      if (!current || current.dealer.id !== req.user?.id) {
        return res.status(404).json({ message: "Pool no encontrado." });
      }
      if (current.status !== "active") {
        return res.status(409).json({ message: "Un pool cerrado o vencido se conserva como histórico y ya no puede editarse." });
      }
      const input = validatePoolInput({ ...current, ...req.body });
      if (typeof input === "string") return res.status(400).json({ message: input });
      const committedQuantity = current.members.reduce((total, member) => total + member.quantity, 0);
      if (input.targetQuantity < committedQuantity) {
        return res.status(409).json({ message: "La cantidad objetivo no puede ser menor a las unidades comprometidas." });
      }
      const updated = await poolStore.update(current.id, input);
      if (updated === "capacity") {
        return res.status(409).json({ message: "La cantidad objetivo no puede ser menor a las unidades comprometidas." });
      }
      if (!updated) return res.status(404).json({ message: "Pool no encontrado." });
      return res.json(updated);
    },
  );

  router.post(
    "/api/pools/:id/join",
    authenticate,
    requireAuth(["participante"]),
    async (req: AuthRequest, res: Response) => {
      const account = req.user && await accountStore.findById(req.user.id);
      if (!account || account.status !== "active") {
        return res.status(401).json({ message: "La cuenta de participante no está disponible." });
      }
      if (typeof req.params.id !== "string") return res.status(400).json({ message: "Identificador de pool inválido." });
      const quantity = isRecord(req.body) ? req.body.quantity : undefined;
      if (!Number.isSafeInteger(quantity) || (quantity as number) < 1) {
        return res.status(400).json({ message: "Indica una cantidad positiva de unidades." });
      }
      const result = await poolStore.join(req.params.id, {
        participantId: account.id,
        name: account.name,
        email: account.email,
        quantity: quantity as number,
      });
      if ("error" in result) {
        const errors = {
          "not-found": [404, "Pool no encontrado."],
          "not-joinable": [409, "El pool ya no admite participantes."],
          "already-joined": [409, "Ya formas parte de este pool."],
          capacity: [409, "La cantidad solicitada supera las unidades disponibles."],
        } as const;
        const [status, message] = errors[result.error];
        return res.status(status).json({ message });
      }
      if (result.pool.status === "complete") {
        const pools = await poolStore.list();
        await notifyPoolLifecycle(result.pool, pools, accountStore, notifications);
      }
      return res.json({
        pool: poolSummary(result.pool),
        message: result.pool.status === "complete"
          ? "Se completó la cantidad objetivo. El pool se cerró y se notificó a sus integrantes."
          : "Tu participación quedó registrada.",
      });
    },
  );

  router.get(
    "/api/pools/me/notifications",
    authenticate,
    requireAuth(["dealer", "participante"]),
    async (req: AuthRequest, res: Response) => {
      const account = req.user && await accountStore.findById(req.user.id);
      if (!account) return res.status(401).json({ message: "La cuenta no está disponible." });
      const pools = await poolStore.list();
      const poolNotifications = pools.flatMap((pool) => {
        const isDealer = pool.dealer.id === account.id;
        const member = pool.members.find((entry) => entry.participantId === account.id);
        if (!isDealer && !member) return [];
        if (pool.status !== "complete" && pool.status !== "expired") return [];
        return [{
          id: `${pool.id}-${pool.status}`,
          poolId: pool.id,
          product: pool.product,
          status: pool.status,
          closedAt: pool.closedAt,
          message: pool.status === "complete"
            ? `El pool ${pool.product} alcanzó su cantidad objetivo y se cerró.`
            : `El pool ${pool.product} venció sin alcanzar su cantidad objetivo y quedó incompleto en el histórico.`,
          similarPools: pool.status === "expired" && !isDealer ? similarPools(pool, pools, account.profile) : [],
        }];
      });
      return res.json(poolNotifications);
    },
  );

  router.get(
    "/api/admin/pools",
    authenticate,
    requireAuth(["admin"]),
    async (_req, res: Response) => res.json(await poolStore.list()),
  );

  router.post(
    "/api/admin/pools",
    authenticate,
    requireAuth(["admin"]),
    async (req: AuthRequest, res: Response) => {
      const input = validatePoolInput(req.body);
      if (typeof input === "string") return res.status(400).json({ message: input });
      if (!req.user) return res.status(401).json({ message: "Se requiere una sesión administrativa." });
      const pool = await poolStore.create(input, {
        id: req.user.id,
        name: "Administración",
        email: req.user.email,
      });
      await notifications.create({
        recipientId: "admin",
        category: "pool",
        title: "Nuevo Pool administrativo",
        message: `Se creó el Pool "${pool.brand} ${pool.product}".`,
        href: "/admin/pools",
        entityId: pool.id,
      });
      return res.status(201).json(pool);
    },
  );

  router.patch(
    "/api/admin/pools/:id",
    authenticate,
    requireAuth(["admin"]),
    async (req, res: Response) => {
      if (typeof req.params.id !== "string" || !isRecord(req.body) || !Object.keys(req.body).length) {
        return res.status(400).json({ message: "Indica un pool y campos válidos para actualizar." });
      }
      const current = (await poolStore.list()).find((pool) => pool.id === req.params.id);
      if (!current) return res.status(404).json({ message: "Pool no encontrado." });
      if (req.body.visible !== undefined && typeof req.body.visible !== "boolean") {
        return res.status(400).json({ message: "El campo visible debe ser booleano." });
      }
      if (Object.keys(req.body).every((field) => field === "visible")) {
        const updated = await poolStore.update(req.params.id, { visible: req.body.visible as boolean });
        if (updated === "capacity") {
          return res.status(409).json({ message: "La cantidad objetivo no puede ser menor a las unidades comprometidas." });
        }
        if (!updated) return res.status(404).json({ message: "Pool no encontrado." });
        if (req.body.visible === true && !current.visible) {
          await notifications.create({
            recipientId: current.dealer.id,
            category: "pool",
            title: "Pool aprobado",
            message: `El Pool "${current.brand} ${current.product}" fue aprobado y ya está visible.`,
            href: "/portal/pools",
            entityId: current.id,
          });
        }
        return res.json(updated);
      }
      const input = validatePoolInput({ ...current, ...req.body });
      if (typeof input === "string") return res.status(400).json({ message: input });
      const joinedQuantity = current.members.reduce((total, member) => total + member.quantity, 0);
      if (input.targetQuantity < joinedQuantity) {
        return res.status(409).json({ message: "La cantidad objetivo no puede ser menor a las unidades comprometidas." });
      }
      const updated = await poolStore.update(req.params.id, { ...input, visible: current.visible });
      if (updated === "capacity") {
        return res.status(409).json({ message: "La cantidad objetivo no puede ser menor a las unidades comprometidas." });
      }
      if (!updated) return res.status(404).json({ message: "Pool no encontrado." });
      return res.json(updated);
    },
  );

  router.delete(
    "/api/admin/pools/:id",
    authenticate,
    requireAuth(["admin"]),
    async (req, res: Response) => {
      if (typeof req.params.id !== "string") return res.status(400).json({ message: "Identificador de pool inválido." });
      const result = await poolStore.delete(req.params.id);
      if (result === "not-found") return res.status(404).json({ message: "Pool no encontrado." });
      if (result === "protected") {
        return res.status(409).json({ message: "Los pools con participantes o cerrados se conservan como histórico. Puedes ocultarlos." });
      }
      return res.status(204).end();
    },
  );

  return router;
}
