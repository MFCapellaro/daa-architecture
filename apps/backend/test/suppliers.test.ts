import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";
import { PoolStore, type PoolInput } from "../src/services/PoolStore.js";
import { SupplierStore } from "../src/services/SupplierStore.js";

describe("admin Suppliers API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let adminToken: string;
  let poolStore: PoolStore;
  let supplierStore: SupplierStore;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;

  const request = async <T,>(path: string, init?: RequestInit): Promise<{ response: Response; body: T }> => {
    const headers = new Headers(init?.headers);
    if (adminToken) headers.set("authorization", `Bearer ${adminToken}`);
    if (init?.body) headers.set("content-type", "application/json");
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = response.status === 204 ? undefined : await response.json() as T;
    return { response, body: body as T };
  };

  beforeEach(async () => {
    directory = await mkdtemp(join(process.cwd(), "apps", "backend", "test", ".suppliers-"));
    originalAdminEmail = process.env.ADMIN_EMAIL;
    originalAdminPassword = process.env.ADMIN_PASSWORD;
    process.env.ADMIN_EMAIL = "suppliers-admin@example.test";
    process.env.ADMIN_PASSWORD = "suppliers-admin-secret";
    poolStore = new PoolStore(join(directory, "pools"));
    supplierStore = new SupplierStore({ directory: join(directory, "supplier-data"), seedMixers: false });
    const app = createApp(
      new ParticipantAccountStore(join(directory, "accounts")),
      undefined,
      undefined,
      poolStore,
      undefined,
      undefined,
      supplierStore,
    );
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No test server address");
    baseUrl = `http://127.0.0.1:${address.port}`;
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "suppliers-admin@example.test", password: "suppliers-admin-secret" }),
    });
    expect(login.status).toBe(200);
    adminToken = (await login.json() as { token: string }).token;
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

  it("restricts access to admins and provides the complete supplier category list", async () => {
    const publicResponse = await fetch(`${baseUrl}/api/admin/suppliers/categories`);
    expect(publicResponse.status).toBe(401);

    const { response, body } = await request<Array<{ label: string }>>("/api/admin/suppliers/categories");
    expect(response.status).toBe(200);
    expect(body.map(({ label }) => label)).toContain("Mixers");
    expect(body.map(({ label }) => label)).toContain("Kits de armado de Mezcladores");
    expect(body).toHaveLength(15);
  });

  it("creates products, records manual quote evidence, recalculates and persists price history separately", async () => {
    const created = await request<{ id: string }>("/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify({
        category: "mixers",
        subcategory: "",
        name: "Mixer de prueba",
        brand: "Marca Demo",
        model: "M-1",
        description: "",
        characteristics: {},
        images: [{ url: "data:image/jpeg;base64,AA==", alt: "Producto de prueba" }],
        sources: [],
        status: "pending-review",
      }),
    });
    expect(created.response.status).toBe(201);
    const productId = created.body.id;

    const emptyRecalculation = await request<{ price: number | null; method: string }>(
      `/api/admin/suppliers/${productId}/prices/recalculate`,
      {
        method: "POST",
        body: JSON.stringify({ targetCurrency: "ARS", asOf: new Date().toISOString(), exchangeRates: {} }),
      },
    );
    expect(emptyRecalculation.response.status).toBe(201);
    expect(emptyRecalculation.body).toMatchObject({ price: null, method: "unavailable" });

    const quote = await request<Array<{ id: string }>>(`/api/admin/suppliers/${productId}/quotes`, {
      method: "POST",
      body: JSON.stringify({
        sourceType: "manual",
        supplierType: "dealer",
        supplierId: "dealer-demo",
        supplierName: "Dealer Demo",
        unitPrice: 1_500_000,
        currency: "ARS",
        observedAt: new Date().toISOString(),
        sourceReference: "Cotización recibida por teléfono; referencia interna INV-12",
        conditions: {
          includesVat: false,
          includesFreight: false,
          includesFinancing: false,
          includesAccessories: false,
        },
      }),
    });
    expect(quote.response.status).toBe(201);

    const recalculate = await request<{ price: number; method: string; quoteIds: string[] }>(
      `/api/admin/suppliers/${productId}/prices/recalculate`,
      {
        method: "POST",
        body: JSON.stringify({ targetCurrency: "ARS", asOf: new Date().toISOString(), exchangeRates: {} }),
      },
    );
    expect(recalculate.response.status).toBe(201);
    expect(recalculate.body).toMatchObject({
      price: 1_500_000,
      method: "dealer-average",
      quoteIds: [quote.body[0].id],
    });

    const detail = await request<{
      product: { images: Array<{ alt: string }> };
      quotes: Array<{ sourceReference: string }>;
      prices: Array<{
        price: number | null;
        quoteEvaluations: Array<{ quote: { sourceReference?: string } }>;
      }>;
    }>(`/api/admin/suppliers/${productId}`);
    expect(detail.body.product.images).toEqual([{ url: "data:image/jpeg;base64,AA==", alt: "Producto de prueba" }]);
    expect(detail.body.quotes[0].sourceReference).toContain("INV-12");
    expect(detail.body.prices.map(({ price }) => price)).toEqual([null, 1_500_000]);
    expect(detail.body.prices[1].quoteEvaluations[0].quote.sourceReference).toContain("INV-12");
  });

  it("uses a visible, active and fully described matching Pool unit price before web quotes", async () => {
    const product = await supplierStore.create({
      category: "mixers",
      subcategory: "",
      name: "AM Mixer 240",
      brand: "Grupo Alemor",
      model: "AM Mixer 240",
      description: "",
      characteristics: {},
      images: [],
      sources: [],
      status: "pending-review",
    });
    const poolInput: PoolInput = {
      product: "Mixer",
      brand: "Grupo Alemor",
      model: "AM Mixer 240",
      description: "Oferta vigente para el modelo.",
      targetQuantity: 3,
      unitPrice: 1_700_000,
      discountedUnitPrice: 1_500_000,
      priceCurrency: "ARS",
      priceConditions: {
        includesVat: false,
        includesFreight: false,
        includesFinancing: false,
        includesAccessories: false,
      },
      city: "Rafaela",
      province: "Santa Fe",
      paymentConditions: "A convenir.",
      warranty: "",
      validUntil: new Date(Date.now() + 86_400_000).toISOString(),
      training: "",
      afterSales: "",
      deliveryAvailability: "",
      restrictions: "",
      images: ["data:image/jpeg;base64,AA=="],
    };
    const pool = await poolStore.create(poolInput, {
      id: "dealer-pool-1",
      name: "Dealer del Pool",
      email: "dealer@example.test",
    });
    await poolStore.update(pool.id, { visible: true });

    const { response, body } = await request<{ price: number; method: string; quoteIds: string[] }>(
      `/api/admin/suppliers/${product.id}/prices/recalculate`,
      {
        method: "POST",
        body: JSON.stringify({ targetCurrency: "ARS", asOf: new Date().toISOString(), exchangeRates: {} }),
      },
    );
    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      price: 1_500_000,
      method: "active-pool",
      quoteIds: [pool.id],
    });
  });

  it("imports the researched mixer sheets without inventing image or price data", async () => {
    const catalogStore = new SupplierStore({ directory: join(directory, "seeded-suppliers") });
    const products = await catalogStore.listWithPrices();
    expect(products).toHaveLength(29);
    const researchedMixer = products.find((product) => product.id === "mixer-grupo-alemor-am-mixer-240");
    expect(researchedMixer).toMatchObject({
      name: "AM MIXER 240",
      brand: "Grupo Alemor",
      currentPrice: null,
      images: [],
      status: "pending-review",
    });
    expect(researchedMixer?.characteristics).toHaveProperty("capacidad_litros", 240);
  });
});
