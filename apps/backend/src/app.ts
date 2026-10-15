import cors from "cors";
import express from "express";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDirectoryRouter } from "./routes/directory.js";
import { createAdminParticipantsRouter } from "./routes/adminParticipants.js";
import { createAuthRouter } from "./routes/auth.js";
import { createParticipantsRouter } from "./routes/participants.js";
import { ParticipantAccountStore } from "./services/ParticipantAccountStore.js";

const frontendDirectory = fileURLToPath(new URL("../../frontend", import.meta.url));

export function createApp(accountStore = new ParticipantAccountStore()) {
  const app = express();
  const directoryRouter = createDirectoryRouter(accountStore);
  app.use(cors());
  app.use(express.json());

  app.use(createAuthRouter(accountStore));
  app.use(createParticipantsRouter(accountStore));
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
