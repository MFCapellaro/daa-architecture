import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { createApp } from "../src/app.js";
import { ActivityStore, type ActivityInput } from "../src/services/ActivityStore.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../src/services/SystemNotificationStore.js";

describe("activity publication API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let activityStore: ActivityStore;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;

  beforeEach(async () => {
    directory = await mkdtemp(join(process.cwd(), "apps", "backend", "test", ".activities-"));
    originalAdminEmail = process.env.ADMIN_EMAIL;
    originalAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = "activity-admin@example.test";
    process.env.ADMIN_PASSWORD = "admin-secret";
    activityStore = new ActivityStore(join(directory, "activities"));
    const app = createApp(
      new ParticipantAccountStore(join(directory, "accounts")),
      undefined,
      activityStore,
      undefined,
      new SystemNotificationStore(join(directory, "notifications")),
    );
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

  it("records participant attribution, keeps submissions hidden, and lets admins publish them", async () => {
    const registration = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Ada Participant",
        email: "ada-activities@example.test",
        password: "participant-secret",
      }),
    });
    expect(registration.status).toBe(201);
    const participant = await registration.json() as { token: string; user: { id: string } };

    const activityInput: ActivityInput = {
      title: "Capacitación de prueba",
      kind: "course",
      description: "Actividad de prueba.",
      startsAt: "2027-02-10T15:00:00.000Z",
      endsAt: "2027-02-10T17:00:00.000Z",
      locationKind: "virtual",
      location: "",
      onlineUrl: "https://example.test/curso",
      contactName: "Equipo DAA",
      contactEmail: "contact@example.test",
      contactPhone: "",
      registrationUrl: "https://example.test/inscripcion",
      linkedEntities: ["Entidad de prueba"],
      flyer: "data:image/jpeg;base64,AA==",
      featured: true,
    };
    const submission = await fetch(`${baseUrl}/api/activities`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${participant.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(activityInput),
    });
    expect(submission.status).toBe(201);
    const submitted = await submission.json() as { activity: { id: string; visible: boolean }; message: string };
    expect(submitted.activity.visible).toBe(false);
    expect(submitted.message).toContain("24 a 48 horas");

    const hiddenPublicList = await fetch(`${baseUrl}/api/activities`);
    expect(await hiddenPublicList.json()).toEqual([]);

    const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "activity-admin@example.test", password: "admin-secret" }),
    });
    expect(adminLogin.status).toBe(200);
    const admin = await adminLogin.json() as { token: string };
    const adminList = await fetch(`${baseUrl}/api/admin/activities`, {
      headers: { authorization: `Bearer ${admin.token}` },
    });
    const records = await adminList.json();
    expect(records).toMatchObject([{
      id: submitted.activity.id,
      visible: false,
      reviewed: false,
      source: {
        id: participant.user.id,
        name: "Ada Participant",
        email: "ada-activities@example.test",
        role: "participante",
      },
    }]);
    const notifications = await fetch(`${baseUrl}/api/admin/activities/notifications`, {
      headers: { authorization: `Bearer ${admin.token}` },
    });
    expect(await notifications.json()).toMatchObject([{
      id: submitted.activity.id,
      title: activityInput.title,
    }]);

    const publish = await fetch(`${baseUrl}/api/admin/activities/${submitted.activity.id}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${admin.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ visible: true }),
    });
    expect(publish.status).toBe(200);
    expect(await publish.json()).toMatchObject({ visible: true, reviewed: true });
    expect(await (await fetch(`${baseUrl}/api/admin/activities/notifications`, {
      headers: { authorization: `Bearer ${admin.token}` },
    })).json()).toEqual([]);

    const publishedList = await fetch(`${baseUrl}/api/activities`);
    const publicActivities = await publishedList.json();
    expect(publicActivities).toMatchObject([{
      id: submitted.activity.id,
      title: activityInput.title,
      flyer: activityInput.flyer,
    }]);
    expect(publicActivities[0]).not.toHaveProperty("source");
    expect(publicActivities[0]).not.toHaveProperty("reviewed");

    const deletion = await fetch(`${baseUrl}/api/admin/activities/${submitted.activity.id}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${admin.token}` },
    });
    expect(deletion.status).toBe(204);
    expect(await (await fetch(`${baseUrl}/api/activities`)).json()).toEqual([]);

    const legacyActivity = await activityStore.create({
      ...activityInput,
      title: "Actividad heredada sin folleto",
      flyer: "",
    }, {
      id: "legacy-corpus",
      name: "Repositorio de actividades",
      email: "",
      role: "admin",
    });
    const publishLegacy = await fetch(`${baseUrl}/api/admin/activities/${legacyActivity.id}`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${admin.token}`, "content-type": "application/json" },
      body: JSON.stringify({ visible: true }),
    });
    expect(publishLegacy.status).toBe(200);
    expect(await publishLegacy.json()).toMatchObject({ visible: true, flyer: "" });
    expect(await (await fetch(`${baseUrl}/api/activities`)).json()).toMatchObject([
      { id: legacyActivity.id, title: "Actividad heredada sin folleto", flyer: "" },
    ]);
  });
});

describe("legacy activity import", () => {
  it("imports legacy records once and applies their publication windows", async () => {
    const directory = await mkdtemp(join(process.cwd(), "apps", "backend", "test", ".activity-import-"));
    const legacyDirectory = join(directory, "legacy");
    const submissionsDirectory = join(directory, "submissions");
    const now = Date.now();
    const activeRecord = {
      id: "active-fixture",
      title: "Actividad vigente",
      type: "course",
      startsAt: new Date(now + 86_400_000).toISOString(),
      endsAt: new Date(now + 172_800_000).toISOString(),
      publicationStartsAt: new Date(now - 86_400_000).toISOString(),
      publicationEndsAt: new Date(now + 172_800_000).toISOString(),
      location: "Online",
      organizer: "Comunidad DAA",
    };
    const expiredRecord = {
      ...activeRecord,
      id: "expired-fixture",
      title: "Actividad vencida",
      publicationEndsAt: new Date(now - 1).toISOString(),
    };

    try {
      await mkdir(legacyDirectory, { recursive: true });
      await Promise.all([
        writeFile(join(legacyDirectory, "active.yml"), stringify(activeRecord)),
        writeFile(join(legacyDirectory, "expired.yml"), stringify(expiredRecord)),
      ]);
      const store = new ActivityStore(submissionsDirectory, legacyDirectory);
      const [firstRead, secondRead] = await Promise.all([store.list(), store.list()]);

      expect(firstRead).toHaveLength(2);
      expect(secondRead).toHaveLength(2);
      expect(firstRead.find((activity) => activity.id === "legacy-active-fixture")).toMatchObject({
        kind: "course",
        locationKind: "virtual",
        visible: true,
        reviewed: true,
        source: { id: "legacy-corpus", role: "admin" },
      });
      expect(firstRead.find((activity) => activity.id === "legacy-expired-fixture")).toMatchObject({
        visible: false,
        reviewed: true,
      });
      expect(await readdir(submissionsDirectory)).toHaveLength(2);
      expect(await readFile(join(legacyDirectory, "active.yml"), "utf8")).toContain("active-fixture");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
