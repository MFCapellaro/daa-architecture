import { Router } from "express";
import { createAuthController } from "../controllers/AuthController.js";
import { createAuthMiddleware } from "../middleware/authMiddleware.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";

export function createAuthRouter(store: ParticipantAccountStore) {
  const router = Router();
  const controller = createAuthController(store);
  const authenticate = createAuthMiddleware(store);

  router.post("/api/auth/register", controller.register);
  router.post("/api/auth/login", controller.login);
  router.get("/api/auth/me", authenticate, controller.getMe);

  return router;
}
