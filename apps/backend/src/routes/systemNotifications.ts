import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware, type AuthRequest } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";
import { PoolStore } from "../services/PoolStore.js";
import { SystemNotificationStore } from "../services/SystemNotificationStore.js";
import { syncPoolLifecycleNotifications } from "../services/PoolLifecycleNotifications.js";

export function createSystemNotificationsRouter(
  accountStore = new ParticipantAccountStore(),
  notificationStore = new SystemNotificationStore(),
  poolStore = new PoolStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);

  router.get("/api/notifications", authenticate, requireAuth(), async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Se requiere una sesión activa." });
    const pools = await poolStore.list();
    await syncPoolLifecycleNotifications(pools, accountStore, notificationStore);
    if (req.user.role === "admin") return res.json(await notificationStore.list("admin"));
    const account = await accountStore.findById(req.user.id);
    if (!account) return res.status(401).json({ message: "La cuenta no está disponible." });
    return res.json(await notificationStore.list(account.id));
  });

  router.patch("/api/notifications/:id/read", authenticate, requireAuth(), async (req: AuthRequest, res: Response) => {
    if (!req.user || typeof req.params.id !== "string") {
      return res.status(400).json({ message: "Notificación no válida." });
    }
    const notification = await notificationStore.markRead(
      req.user.role === "admin" ? "admin" : req.user.id,
      req.params.id,
    );
    if (!notification) return res.status(404).json({ message: "Notificación no encontrada." });
    return res.json(notification);
  });

  return router;
}
