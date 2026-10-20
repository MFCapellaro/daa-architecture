import cors from "cors";
import express from "express";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDirectoryRouter } from "./routes/directory.js";
import { createAdminParticipantsRouter } from "./routes/adminParticipants.js";
import { createAuthRouter } from "./routes/auth.js";
import { createParticipantsRouter } from "./routes/participants.js";
import { createActivitiesRouter } from "./routes/activities.js";
import type { PasswordResetMailer } from "./services/PasswordResetMailer.js";
import { ParticipantAccountStore } from "./services/ParticipantAccountStore.js";
import { ActivityStore } from "./services/ActivityStore.js";
import { PoolStore } from "./services/PoolStore.js";
import { createPoolsRouter } from "./routes/pools.js";

const frontendDirectory = fileURLToPath(new URL("../../frontend", import.meta.url));

export function createApp(
  accountStore = new ParticipantAccountStore(),
  passwordResetMailer?: PasswordResetMailer,
  activityStore = new ActivityStore(),
  poolStore = new PoolStore(),
) {
  const app = express();
  const directoryRouter = createDirectoryRouter(accountStore);
  app.use(cors());
  app.use(express.json({ limit: "3mb" }));

  app.use(createAuthRouter(accountStore, passwordResetMailer));
  app.use(createParticipantsRouter(accountStore));
  app.use(createActivitiesRouter(accountStore, activityStore));
  app.use(createPoolsRouter(accountStore, poolStore));
  app.use(createAdminParticipantsRouter(accountStore));

  // Keep existing directory APIs mounted as before.
  app.use(directoryRouter);
  app.use("/api/operators", directoryRouter);
  app.use(express.static(frontendDirectory, { index: false }));
  app.use((req, res, next) => {
    if (
      req.method !== "GET"
      || req.path === "/api"
      || req.path.startsWith("/api/")
      || extname(req.path)
    ) {
      return next();
    }
    return res.sendFile(join(frontendDirectory, "index.html"), (error) => {
      if (error) next(error);
    });
  });

  return app;
}
