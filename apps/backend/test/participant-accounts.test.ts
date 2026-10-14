import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";

describe("participant account API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;

  beforeEach(async () => {
    directory = await mkdtemp(
      join(process.cwd(), "apps", "backend", "test", ".participant-accounts-"),
    );
    originalAdminEmail = process.env.ADMIN_EMAIL;
    originalAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = "admin@example.test";
    process.env.ADMIN_PASSWORD = "admin-secret";

    const app = createApp(new ParticipantAccountStore(directory));
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

  it("registers accounts, manages profiles and enforces admin suspension/deletion", async () => {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Ada Participant",
        email: "Ada@example.test",
        password: "participant-secret",
      }),
    });
    expect(registerResponse.status).toBe(201);
    const registration = await registerResponse.json();
    expect(registration.user).toMatchObject({
      name: "Ada Participant",
      email: "ada@example.test",
      role: "participante",
    });
    expect(registration.user.passwordHash).toBeUndefined();
    const participantToken = registration.token as string;

    const duplicate = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate",
        email: "ADA@example.test",
        password: "participant-secret",
      }),
    });
    expect(duplicate.status).toBe(409);

    const profileResponse = await fetch(`${baseUrl}/api/participants/me`, {
      headers: { authorization: `Bearer ${participantToken}` },
    });
    expect(profileResponse.status).toBe(200);
    expect(await profileResponse.json()).toMatchObject({
      name: "Ada Participant",
      email: "ada@example.test",
      role: "participante",
      profile: {},
    });

    const profileUpdate = await fetch(`${baseUrl}/api/participants/me`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${participantToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Ada Updated",
        profile: {
          organization: "DAA",
          city: "Buenos Aires",
          capabilities: ["mapping"],
          interests: ["safety"],
        },
      }),
    });
    expect((await profileUpdate.json()).user).toMatchObject({
      name: "Ada Updated",
      profile: {
        organization: "DAA",
        city: "Buenos Aires",
        capabilities: ["mapping"],
        interests: ["safety"],
      },
    });

    const forbiddenSelfEdit = await fetch(`${baseUrl}/api/participants/me`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${participantToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ role: "admin" }),
    });
    expect(forbiddenSelfEdit.status).toBe(400);

    const dealerResponse = await fetch(`${baseUrl}/api/participants/me/dealer`, {
      method: "POST",
      headers: { authorization: `Bearer ${participantToken}` },
    });
    const dealerSession = await dealerResponse.json();
    expect(dealerSession.participant.role).toBe("dealer");
    expect(dealerSession.user.role).toBe("dealer");
    expect(typeof dealerSession.token).toBe("string");
    const staleProfile = await fetch(`${baseUrl}/api/participants/me`, {
      headers: { authorization: `Bearer ${participantToken}` },
    });
    expect(staleProfile.status).toBe(401);
    const renewedProfile = await fetch(`${baseUrl}/api/participants/me`, {
      headers: { authorization: `Bearer ${dealerSession.token}` },
    });
    expect(renewedProfile.status).toBe(200);
    const yamlAccount = await readFile(
      join(directory, `${registration.user.id}.yml`),
      "utf8",
    );
    expect(yamlAccount).toContain("approved: false");
    expect(yamlAccount).toContain("accepted: false");

    const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "ADMIN@example.test", password: "admin-secret" }),
    });
    expect(adminLogin.status).toBe(200);
    const adminSession = await adminLogin.json();
    expect(adminSession.user.role).toBe("admin");
    expect(adminSession.user.password).toBeUndefined();

    const listed = await fetch(`${baseUrl}/api/admin/participants`, {
      headers: { authorization: `Bearer ${adminSession.token}` },
    });
    const participants = await listed.json();
    expect(participants).toHaveLength(1);
    expect(participants[0].passwordHash).toBeUndefined();

    const suspended = await fetch(
      `${baseUrl}/api/admin/participants/${registration.user.id}`,
      {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${adminSession.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "suspended" }),
      },
    );
    expect((await suspended.json()).status).toBe("suspended");
    expect(
      (
        await fetch(`${baseUrl}/api/participants/me`, {
          headers: { authorization: `Bearer ${participantToken}` },
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "ada@example.test",
            password: "participant-secret",
          }),
        })
      ).status,
    ).toBe(403);

    const deleted = await fetch(
      `${baseUrl}/api/admin/participants/${registration.user.id}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${adminSession.token}` },
      },
    );
    expect(deleted.status).toBe(204);
    expect(
      (
        await fetch(`${baseUrl}/api/participants/me`, {
          headers: { authorization: `Bearer ${participantToken}` },
        })
      ).status,
    ).toBe(401);
  });
});
