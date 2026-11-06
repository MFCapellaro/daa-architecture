import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { ParticipantAccountStore } from "../src/services/ParticipantAccountStore.js";
import { PoolStore, type PoolInput } from "../src/services/PoolStore.js";
import {
  extractSchemaOrgPrice,
  scrapeSchemaOrgPrice,
  SupplierPriceAutomation,
  SUPPLIER_PRICE_REFRESH_INTERVAL_MS,
} from "../src/services/SupplierPriceAutomation.js";
import { SupplierStore } from "../src/services/SupplierStore.js";
import type { BnaUsdArsExchangeRate } from "../src/services/BnaExchangeRate.js";

describe("admin Suppliers API", () => {
  let directory: string;
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl: string;
  let adminToken: string;
  let poolStore: PoolStore;
  let supplierStore: SupplierStore;
  let supplierDirectory: string;
  let originalAdminEmail: string | undefined;
  let originalAdminPassword: string | undefined;
  const bnaExchangeRate: BnaUsdArsExchangeRate = {
    baseCurrency: "USD",
    quoteCurrency: "ARS",
    rate: 1570,
    effectiveDate: "2026-11-04",
    fetchedAt: "2026-11-04T18:20:00.000Z",
    source: "https://www.bna.com.ar/Personas",
  };

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
    supplierDirectory = join(directory, "supplier-data");
    supplierStore = new SupplierStore({ directory: supplierDirectory, seedMixers: false });
    const app = createApp(
      new ParticipantAccountStore(join(directory, "accounts")),
      undefined,
      undefined,
      poolStore,
      undefined,
      undefined,
      supplierStore,
      async () => bnaExchangeRate,
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

    const { response, body } = await request<Array<{
      label: string;
      attributes: Array<{ key: string; label: string; type: string; unit?: string; options?: string[]; comparable: boolean }>;
    }>>("/api/admin/suppliers/categories");
    expect(response.status).toBe(200);
    expect(body.map(({ label }) => label)).toContain("Mixers");
    expect(body.map(({ label }) => label)).toContain("Kits de armado de Mezcladores");
    expect(body).toHaveLength(15);
    const mixers = body.find((category) => category.label === "Mixers");
    expect(mixers).toBeDefined();
    expect(mixers?.attributes).toContainEqual({ key: "capacidad_litros", label: "Capacidad", type: "number", unit: "L", comparable: true });

    const trailers = body.find((category) => category.label === "Trailers");
    expect(trailers?.attributes).toEqual([
      { key: "homologacion", label: "Homologación", type: "boolean", comparable: true },
      { key: "configuracion.nivel", label: "Configuración", type: "select", options: ["Básica", "Intermedia", "Máxima"], comparable: true },
      { key: "ejes", label: "Ejes", type: "select", options: ["1", "2"], comparable: true },
      { key: "tipo_lanza", label: "Lanza / Cuello de Cisne", type: "select", options: ["Lanza", "Cuello de Cisne"], comparable: true },
      { key: "capacidad_kg", label: "Capacidad", type: "number", unit: "kg", comparable: true },
      { key: "energia", label: "Energía", type: "select", options: ["Panel Eléctrico", "Iluminación"], comparable: true },
      { key: "largo_metros", label: "Largo", type: "number", unit: "m", comparable: true },
      { key: "ancho_metros", label: "Ancho", type: "number", unit: "m", comparable: true },
      { key: "alto_metros", label: "Alto", type: "number", unit: "m", comparable: true },
      { key: "equipamiento", label: "Equipamiento", type: "boolean", comparable: true },
      { key: "tanque.presente", label: "Tanque", type: "boolean", comparable: true },
      { key: "tanque.capacidad_litros", label: "Capacidad del tanque", type: "number", unit: "L", comparable: true },
      { key: "mixer", label: "Mixer", type: "boolean", comparable: true },
      { key: "generador", label: "Generador", type: "boolean", comparable: true },
      { key: "monitoreo_control_distancia", label: "Sistemas de monitoreo y control a distancia", type: "boolean", comparable: true },
    ]);
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

    const recalculate = await request<{
      price: number;
      method: string;
      quoteIds: string[];
      equivalentPrice: number;
      equivalentCurrency: string;
      exchangeRateDetails: BnaUsdArsExchangeRate;
    }>(
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
      equivalentPrice: 955.41,
      equivalentCurrency: "USD",
      exchangeRateDetails: bnaExchangeRate,
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

  it("converts USD quotes to ARS and supports recalculating the same price in USD", async () => {
    const product = await supplierStore.create({
      category: "mixers",
      subcategory: "",
      name: "Mixer USD",
      brand: "Marca Demo",
      model: "USD-1",
      description: "",
      characteristics: {},
      images: [],
      sources: [],
      status: "pending-review",
    });
    await request(`/api/admin/suppliers/${product.id}/quotes`, {
      method: "POST",
      body: JSON.stringify({
        sourceType: "manual",
        supplierType: "dealer",
        supplierId: "dealer-usd",
        supplierName: "Dealer USD",
        unitPrice: 1000,
        currency: "USD",
        observedAt: new Date().toISOString(),
        sourceReference: "Lista vigente en dólares",
        conditions: {
          includesVat: false,
          includesFreight: false,
          includesFinancing: false,
          includesAccessories: false,
        },
      }),
    });
    await request(`/api/admin/suppliers/${product.id}/quotes`, {
      method: "POST",
      body: JSON.stringify({
        sourceType: "manual",
        supplierType: "dealer",
        supplierId: "dealer-ars",
        supplierName: "Dealer ARS",
        unitPrice: 1_570_000,
        currency: "ARS",
        observedAt: new Date().toISOString(),
        sourceReference: "Lista vigente en pesos",
        conditions: {
          includesVat: false,
          includesFreight: false,
          includesFinancing: false,
          includesAccessories: false,
        },
      }),
    });

    const ars = await request<{ price: number; equivalentPrice: number; currency: string }>(
      `/api/admin/suppliers/${product.id}/prices/recalculate`,
      {
        method: "POST",
        body: JSON.stringify({ targetCurrency: "ARS", asOf: new Date().toISOString() }),
      },
    );
    expect(ars.body).toMatchObject({ price: 1_570_000, equivalentPrice: 1000, currency: "ARS" });

    const usd = await request<{ price: number; equivalentPrice: number; currency: string }>(
      `/api/admin/suppliers/${product.id}/prices/recalculate`,
      {
        method: "POST",
        body: JSON.stringify({ targetCurrency: "USD", asOf: new Date().toISOString() }),
      },
    );
    expect(usd.body).toMatchObject({ price: 1000, equivalentPrice: 1_570_000, currency: "USD" });
  });

  it("keeps the public retail price as a reference and prefers the active pool offer", async () => {
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

    const { response, body } = await request<{
      price: number;
      method: string;
      quoteIds: string[];
      quoteEvaluations: Array<{ quote: { id: string; unitPrice: number }; status: string }>;
    }>(
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
    expect(body.quoteEvaluations).toContainEqual(expect.objectContaining({
      quote: expect.objectContaining({ id: `${pool.id}-retail`, unitPrice: 1_700_000 }),
      status: "valid",
    }));
  });

  it("extracts structured web prices and refreshes trailer prices only when due", async () => {
    expect(extractSchemaOrgPrice(`<script type="application/ld+json">
      {"@type":"Product","offers":{"@type":"Offer","price":"2.500.000","priceCurrency":"ARS"}}
    </script>`)).toEqual({ price: 2_500_000, currency: "ARS" });
    expect(extractSchemaOrgPrice(`<script type="application/ld+json">
      {"@type":"Offer","price":1500}
    </script>`)).toEqual({ price: 1500 });
    await expect(scrapeSchemaOrgPrice("http://127.0.0.1/")).rejects.toThrow("direcciones IP públicas");

    const sourceUrl = "https://dealer.example/trailers/td-1";
    const product = await supplierStore.create({
      category: "trailers",
      subcategory: "",
      name: "Trailer de prueba",
      brand: "Marca Demo",
      model: "TD-1",
      description: "",
      characteristics: {},
      images: [],
      sources: [{ type: "precio", url: sourceUrl }],
      status: "active",
    });
    const observedAt = new Date(Date.now() - SUPPLIER_PRICE_REFRESH_INTERVAL_MS - 1).toISOString();
    await supplierStore.addQuote(product.id, {
      id: "initial-manual-price",
      productId: product.id,
      sourceType: "manual",
      supplierType: "dealer",
      supplierId: "dealer-1",
      supplierName: "Dealer de prueba",
      unitPrice: 2_000_000,
      currency: "ARS",
      observedAt,
      sourceUrl,
      sourceReference: "Precio inicial cargado manualmente",
      conditions: {
        includesVat: true,
        vatRatePercent: 21,
        includesFreight: false,
        includesFinancing: false,
        includesAccessories: false,
      },
    });
    const fetchedUrls: string[] = [];
    const automation = new SupplierPriceAutomation(
      supplierStore,
      poolStore,
      async () => bnaExchangeRate,
      async (url) => {
        fetchedUrls.push(url);
        return { price: 2_500_000 };
      },
      { error: () => undefined, warn: () => undefined },
    );
    const now = new Date();

    await automation.refreshDue(now);
    await automation.refreshDue(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000));

    expect(fetchedUrls).toEqual([sourceUrl]);
    const quotes = await supplierStore.listQuotes(product.id);
    expect(quotes).toContainEqual(expect.objectContaining({
      sourceType: "web",
      sourceUrl,
      unitPrice: 2_500_000,
      currency: "ARS",
      conditions: expect.objectContaining({ includesVat: true, vatRatePercent: 21 }),
    }));
    expect((await supplierStore.listPrices(product.id)).at(-1)).toMatchObject({
      price: 2_066_115.7,
      method: "dealer-average",
    });

    const failingAutomation = new SupplierPriceAutomation(
      supplierStore,
      poolStore,
      async () => bnaExchangeRate,
      async () => { throw new Error("No hay precio Schema.org."); },
      { error: () => undefined, warn: () => undefined },
    );
    await failingAutomation.refreshDue(new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000));
    expect(await supplierStore.listQuotes(product.id)).toHaveLength(quotes.length);
    expect((await supplierStore.listPrices(product.id)).at(-1)?.price).toBe(2_066_115.7);
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
    expect(researchedMixer?.characteristics).not.toHaveProperty("precio");
    expect(researchedMixer?.characteristics).not.toHaveProperty("fotos");
    expect(researchedMixer?.characteristics).toHaveProperty("bomba.potencia_hp", null);
  });

  it("allows administrators to create, edit, order, and delete unused categories", async () => {
    const categoryInput = {
      label: "Instrumentos de prueba",
      subcategories: ["Medición"],
      attributes: [{
        key: "precision",
        label: "Precisión",
        type: "number",
        unit: "m",
        comparable: true,
      }],
    };
    const created = await request<{ id: string; order: number }>("/api/admin/suppliers/categories", {
      method: "POST",
      body: JSON.stringify(categoryInput),
    });
    expect(created.response.status).toBe(201);
    expect(created.body).toMatchObject({ id: "instrumentos-de-prueba", order: 15 });

    const assignedProduct = await request<{ id: string }>("/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify({
        category: created.body.id,
        subcategory: "Medición",
        name: "Instrumento asignado",
        brand: "",
        model: "",
        description: "",
        characteristics: { precision: 2 },
        images: [],
        sources: [],
        status: "pending-review",
      }),
    });
    expect(assignedProduct.response.status).toBe(201);

    const updated = await request<{ label: string }>("/api/admin/suppliers/categories/instrumentos-de-prueba", {
      method: "PUT",
      body: JSON.stringify({ ...categoryInput, label: "Instrumentos de medición" }),
    });
    expect(updated.response.status).toBe(200);
    expect(updated.body.label).toBe("Instrumentos de medición");

    const invalidSubcategoryUpdate = await request("/api/admin/suppliers/categories/instrumentos-de-prueba", {
      method: "PUT",
      body: JSON.stringify({ ...categoryInput, label: "Instrumentos de medición", subcategories: [] }),
    });
    expect(invalidSubcategoryUpdate.response.status).toBe(409);

    const categories = await request<Array<{ id: string }>>("/api/admin/suppliers/categories");
    const order = [...categories.body].reverse().map(({ id }) => id);
    const reordered = await request<Array<{ id: string; order: number }>>("/api/admin/suppliers/categories/order", {
      method: "PUT",
      body: JSON.stringify({ categoryIds: order }),
    });
    expect(reordered.response.status).toBe(200);
    expect(reordered.body[0]).toMatchObject({ id: order[0], order: 0 });
    const persistedCategories = await new SupplierStore({
      directory: supplierDirectory,
      seedMixers: false,
    }).listCategories();
    expect(persistedCategories.map(({ id }) => id)).toEqual(order);

    const deleted = await request<void>("/api/admin/suppliers/categories/instrumentos-de-prueba", {
      method: "DELETE",
    });
    expect(deleted.response.status).toBe(409);
    await request(`/api/admin/suppliers/${assignedProduct.body.id}`, { method: "DELETE" });
    const deletedUnusedCategory = await request<void>("/api/admin/suppliers/categories/instrumentos-de-prueba", {
      method: "DELETE",
    });
    expect(deletedUnusedCategory.response.status).toBe(204);
  });

  it("allows comparisons only between active products in the same category", async () => {
    const mixerInput = {
      category: "mixers",
      subcategory: "",
      name: "Mixer comparable",
      brand: "Marca Demo",
      model: "M-2",
      description: "",
      characteristics: { capacidad_litros: 240, bomba: { potencia_hp: null } },
      images: [],
      sources: [],
      status: "active",
    };
    const first = await request<{ id: string }>("/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify(mixerInput),
    });
    const second = await request<{ id: string }>("/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify({ ...mixerInput, name: "Mixer comparable 2", model: "M-3" }),
    });
    const drone = await request<{ id: string }>("/api/admin/suppliers", {
      method: "POST",
      body: JSON.stringify({
        ...mixerInput,
        category: "drones",
        name: "Drone comparable",
        characteristics: {},
      }),
    });

    const mixedCategories = await fetch(
      `${baseUrl}/api/suppliers/compare?category=mixers&ids=${first.body.id},${drone.body.id}`,
    );
    expect(mixedCategories.status).toBe(400);

    const comparison = await fetch(
      `${baseUrl}/api/suppliers/compare?category=mixers&ids=${first.body.id},${second.body.id}`,
    );
    expect(comparison.status).toBe(200);
    expect(await comparison.json()).toMatchObject({
      category: { id: "mixers" },
      products: [{ category: "mixers" }, { category: "mixers" }],
      comparableAttributes: expect.arrayContaining([expect.objectContaining({ key: "capacidad_litros" })]),
    });
  });
});
