import { Router } from "express";
import { createAuthController } from "../controllers/AuthController.js";
import { createAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  createSmtpPasswordResetMailer,
  type PasswordResetMailer,
} from "../services/PasswordResetMailer.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";

export function createAuthRouter(
  store: ParticipantAccountStore,
  passwordResetMailer: PasswordResetMailer = createSmtpPasswordResetMailer(),
) {
  const router = Router();
  const controller = createAuthController(store, passwordResetMailer);
  const authenticate = createAuthMiddleware(store);

  router.post("/api/auth/register", controller.register);
  router.post("/api/auth/login", controller.login);
  router.post("/api/auth/password-reset/request", controller.requestPasswordReset);
  router.post("/api/auth/password-reset/confirm", controller.resetPassword);
  router.get("/api/auth/me", authenticate, controller.getMe);

  return router;
}
