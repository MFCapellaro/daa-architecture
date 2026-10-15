import cors from "cors";
import express from "express";
import { createDirectoryRouter } from "./routes/directory.js";
import { createAdminParticipantsRouter } from "./routes/adminParticipants.js";
import { createAuthRouter } from "./routes/auth.js";
import { createParticipantsRouter } from "./routes/participants.js";
import { ParticipantAccountStore } from "./services/ParticipantAccountStore.js";

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

  return app;
}
