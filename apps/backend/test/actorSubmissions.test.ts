import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { createApp } from "../src/app.js";
import { ActorSubmissionStore } from "../src/services/ActorSubmissionStore.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../src/services/SystemNotificationStore.js";

describe("actor submission and system notifications API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;

  const request = async <T,>(path: string, token?: string, init?: RequestInit): Promise<{ response: Response; body: T }> => {
    const headers = new Headers(init?.headers);
    if (token) headers.set("authorization", "Bearer " + token);
    if (init?.body) headers.set("content-type", "application/json");
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = response.status === 204 ? undefined : await response.json() as T;
    return { response, body: body as T };
  };

  beforeEach(async () => {
    directory = await mkdtemp(join(process.cwd(), "apps", "backend", "test", ".actor-submissions-"));
    originalAdminEmail = process.env.ADMIN_EMAIL;
    originalAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = "actor-admin@example.test";
    process.env.ADMIN_PASSWORD = "actor-admin-secret";
    const accountStore = new ParticipantAccountStore(join(directory, "accounts"));
    const notificationStore = new SystemNotificationStore(join(directory, "notifications"));
    const actorStore = new ActorSubmissionStore(join(directory, "submissions"), join(directory, "nodes"));
    const app = createApp(accountStore, undefined, undefined, undefined, notificationStore, actorStore);
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No test server address");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
    if (originalAdminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = originalAdminEmail;
    if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalAdminPassword;
  });

  it("keeps proposals private until approval and notifies both the reviewer and author", async () => {
    const registration = await request<{ token: string }>("/api/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({
        name: "Participante de prueba",
        email: "actor-author@example.test",
        password: "participant-secret",
      }),
    });
    expect(registration.response.status).toBe(201);

    const submitted = await request<{ submission: { id: string; status: string }; message: string }>(
      "/api/actors/submissions",
      registration.body.token,
      {
        method: "POST",
        body: JSON.stringify({
          name: "Organización de prueba",
          type: "organization",
          description: "Entidad del ecosistema para pruebas.",
          layers: ["organization"],
          contact: {
            email: "contact@example.test",
            phone: "",
            website: "https://example.test",
            address: "",
            city: "Rafaela",
            province: "Santa Fe",
            country: "Argentina",
          },
        }),
      },
    );
    expect(submitted.response.status).toBe(201);
    expect(submitted.body.submission.status).toBe("pending");

    const adminLogin = await request<{ token: string }>("/api/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ email: "actor-admin@example.test", password: "actor-admin-secret" }),
    });
    expect(adminLogin.response.status).toBe(200);
    const adminNotices = await request<Array<{ category: string; entityId: string }>>(
      "/api/notifications",
      adminLogin.body.token,
    );
    expect(adminNotices.body).toMatchObject([{
      category: "actor",
      entityId: submitted.body.submission.id,
    }]);

    const review = await request<{ status: string; actorId: string }>(
      `/api/admin/actors/submissions/${encodeURIComponent(submitted.body.submission.id)}`,
      adminLogin.body.token,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "approved", message: "Aprobado." }),
      },
    );
    expect(review.response.status).toBe(200);
    expect(review.body.status).toBe("approved");
    expect(parse(await readFile(join(directory, "nodes", `${review.body.actorId}.yml`), "utf8"))).toMatchObject({
      id: review.body.actorId,
      name: "Organización de prueba",
      isPublic: true,
    });

    const authorNotices = await request<Array<{ id: string; title: string; readAt?: string }>>(
      "/api/notifications",
      registration.body.token,
    );
    expect(authorNotices.body).toMatchObject([{ title: "Actor aprobado" }]);
    const markedRead = await request<{ readAt: string }>(
      `/api/notifications/${encodeURIComponent(authorNotices.body[0].id)}/read`,
      registration.body.token,
      { method: "PATCH" },
    );
    expect(markedRead.response.status).toBe(200);
    expect(markedRead.body.readAt).toBeTruthy();
  });
});
