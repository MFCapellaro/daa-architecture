import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { PoolStore, type PoolInput } from "../src/services/PoolStore.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";
import { SystemNotificationStore } from "../src/services/SystemNotificationStore.js";

describe("dealer agreement and pool lifecycle API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let accountStore: ParticipantAccountStore;
  let poolStore: PoolStore;
  let dealerToken: string;
  let dealerId: string;
  let adminToken: string;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;

  const request = async <T,>(path: string, token?: string, init?: RequestInit): Promise<{ response: Response; body: T }> => {
    const headers = new Headers(init?.headers);
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (init?.body) headers.set("content-type", "application/json");
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = response.status === 204 ? undefined : await response.json() as T;
    return { response, body: body as T };
  };

  const poolInput = (patch: Partial<PoolInput> = {}): PoolInput => ({
    product: "Dron agrícola",
    brand: "Aero",
    model: "A-10",
    description: "Equipo de demostración.",
    targetQuantity: 2,
    unitPrice: 100_000,
    discountedUnitPrice: 90_000,
    city: "Rafaela",
    province: "Santa Fe",
    paymentConditions: "Transferencia directa al Dealer.",
    warranty: "12 meses.",
    validUntil: new Date(Date.now() + 86_400_000).toISOString(),
    training: "Capacitación inicial.",
    afterSales: "Servicio técnico.",
    deliveryAvailability: "Entrega estimada en 30 días.",
    restrictions: "",
    images: ["data:image/jpeg;base64,AA=="],
    ...patch,
  });

  beforeEach(async () => {
    directory = await mkdtemp(join(process.cwd(), "apps", "backend", "test", ".pools-"));
    originalAdminEmail = process.env.ADMIN_EMAIL;
    originalAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = "pool-admin@example.test";
    process.env.ADMIN_PASSWORD = "pool-admin-secret";
    accountStore = new ParticipantAccountStore(join(directory, "accounts"));
    poolStore = new PoolStore(join(directory, "pools"));
    const app = createApp(
      accountStore,
      undefined,
      undefined,
      poolStore,
      new SystemNotificationStore(join(directory, "notifications")),
    );
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No test server address");
    baseUrl = `http://127.0.0.1:${address.port}`;

    const registration = await request<{ token: string; user: { id: string } }>("/api/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({ name: "Dealer Demo", email: "dealer-pools@example.test", password: "dealer-secret" }),
    });
    expect(registration.response.status).toBe(201);
    dealerId = registration.body.user.id;
    const role = await request<{ token: string }>("/api/participants/me/dealer", registration.body.token, { method: "POST" });
    expect(role.response.status).toBe(200);
    dealerToken = role.body.token;

    const admin = await request<{ token: string }>("/api/auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({ email: "pool-admin@example.test", password: "pool-admin-secret" }),
    });
    expect(admin.response.status).toBe(200);
    adminToken = admin.body.token;
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

  it("requires the current dealer agreement, moderates pools, and closes completed pools", async () => {
    const blocked = await request<{ message: string }>("/api/pools", dealerToken, {
      method: "POST",
      body: JSON.stringify(poolInput()),
    });
    expect(blocked.response.status).toBe(403);

    const acceptance = await request<{ dealerAgreement: { version: string; acceptanceId: string; taxId: string } }>(
      "/api/participants/me/dealer-agreement",
      dealerToken,
      {
        method: "POST",
        body: JSON.stringify({
          accepted: true,
          version: "1.1",
          legalName: "Dealer Demo S.A.",
          taxId: "30-12345678-9",
          representative: "Ada Dealer",
        }),
      },
    );
    expect(acceptance.response.status).toBe(200);
    expect(acceptance.body.dealerAgreement).toMatchObject({
      version: "1.1",
      taxId: "30-12345678-9",
    });
    expect(acceptance.body.dealerAgreement.acceptanceId).toBeTruthy();
    const profileUpdate = await request("/api/participants/me", dealerToken, {
      method: "PATCH",
      body: JSON.stringify({ profile: { city: "Rafaela" } }),
    });
    expect(profileUpdate.response.status).toBe(200);
    expect((await request<{ dealerAgreement: { acceptanceId: string } }>("/api/participants/me", dealerToken))
      .body.dealerAgreement.acceptanceId).toBe(acceptance.body.dealerAgreement.acceptanceId);

    const pool = await request<{ id: string; visible: boolean; status: string }>("/api/pools", dealerToken, {
      method: "POST",
      body: JSON.stringify(poolInput()),
    });
    expect(pool.response.status).toBe(201);
    expect(pool.body).toMatchObject({ visible: false, status: "active" });
    expect((await request<unknown[]>("/api/pools")).body).toEqual([]);

    const published = await request<{ visible: boolean }>(`/api/admin/pools/${pool.body.id}`, adminToken, {
      method: "PATCH",
      body: JSON.stringify({ visible: true }),
    });
    expect(published.response.status).toBe(200);
    expect(published.body.visible).toBe(true);

    const secondRegistration = await request<{ token: string }>("/api/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({ name: "Participante Dos", email: "participant-pools@example.test", password: "participant-secret" }),
    });
    expect(secondRegistration.response.status).toBe(201);
    const firstJoin = await request<{ pool: { status: string } }>(
      `/api/pools/${pool.body.id}/join`,
      secondRegistration.body.token,
      { method: "POST", body: JSON.stringify({ quantity: 1 }) },
    );
    expect(firstJoin.response.status).toBe(200);
    expect(firstJoin.body.pool.status).toBe("active");

    const thirdRegistration = await request<{ token: string }>("/api/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({ name: "Participante Tres", email: "participant-three@example.test", password: "participant-secret" }),
    });
    expect(thirdRegistration.response.status).toBe(201);
    const completed = await request<{ pool: { status: string; joinedQuantity: number } }>(
      `/api/pools/${pool.body.id}/join`,
      thirdRegistration.body.token,
      { method: "POST", body: JSON.stringify({ quantity: 1 }) },
    );
    expect(completed.response.status).toBe(200);
    expect(completed.body.pool).toMatchObject({ status: "complete", joinedQuantity: 2 });
    expect((await request<unknown[]>("/api/pools")).body).toEqual([]);
    expect((await request<Array<{ status: string }>>("/api/pools/me/notifications", dealerToken)).body)
      .toMatchObject([{ status: "complete" }]);
    const dealerPools = await request<Array<{ status: string; members: unknown[] }>>("/api/pools/mine", dealerToken);
    expect(dealerPools.body).toMatchObject([{
      status: "complete",
      members: expect.arrayContaining([expect.objectContaining({ name: "Participante Dos" })]),
    }]);

    const adminList = await request<Array<{ dealer: { id: string }; members: unknown[]; status: string }>>("/api/admin/pools", adminToken);
    expect(adminList.body).toMatchObject([{
      dealer: { id: dealerId },
      members: expect.arrayContaining([expect.objectContaining({ name: "Participante Dos" })]),
      status: "complete",
    }]);
    const protectedDelete = await request<{ message: string }>(`/api/admin/pools/${pool.body.id}`, adminToken, { method: "DELETE" });
    expect(protectedDelete.response.status).toBe(409);
  });

  it("expires pools once and suggests similar visible opportunities in the member's region", async () => {
    await request("/api/participants/me/dealer-agreement", dealerToken, {
      method: "POST",
      body: JSON.stringify({
        accepted: true,
        version: "1.1",
        legalName: "Dealer Demo S.A.",
        taxId: "30123456789",
      }),
    });
    const expiredAt = new Date(Date.now() + 60_000).toISOString();
    const expiredPool = await request<{ id: string }>("/api/pools", dealerToken, {
      method: "POST",
      body: JSON.stringify(poolInput({ validUntil: expiredAt })),
    });
    const alternative = await request<{ id: string }>("/api/pools", dealerToken, {
      method: "POST",
      body: JSON.stringify(poolInput({
        product: "Dron agrícola modelo nuevo",
        validUntil: new Date(Date.now() + 10 * 86_400_000).toISOString(),
      })),
    });
    await request(`/api/admin/pools/${expiredPool.body.id}`, adminToken, {
      method: "PATCH",
      body: JSON.stringify({ visible: true }),
    });
    await request(`/api/admin/pools/${alternative.body.id}`, adminToken, {
      method: "PATCH",
      body: JSON.stringify({ visible: true }),
    });

    const participant = await request<{ token: string }>("/api/auth/register", undefined, {
      method: "POST",
      body: JSON.stringify({ name: "Participante de Rafaela", email: "rafaela@example.test", password: "participant-secret" }),
    });
    await request("/api/participants/me", participant.body.token, {
      method: "PATCH",
      body: JSON.stringify({ profile: { city: "Rafaela", province: "Santa Fe" } }),
    });
    const joined = await request(`/api/pools/${expiredPool.body.id}/join`, participant.body.token, {
      method: "POST",
      body: JSON.stringify({ quantity: 1 }),
    });
    expect(joined.response.status).toBe(200);

    await poolStore.list(new Date(Date.now() + 2 * 60_000));
    const notifications = await request<Array<{ status: string; similarPools: Array<{ id: string }> }>>(
      "/api/pools/me/notifications",
      participant.body.token,
    );
    expect(notifications.body).toMatchObject([{
      status: "expired",
      similarPools: [{ id: alternative.body.id }],
    }]);
    expect((await poolStore.list()).filter((record) => record.id === expiredPool.body.id)).toMatchObject([
      { status: "expired" },
    ]);
  });
});
