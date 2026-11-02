import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  SUPPLIER_CATEGORIES,
  SupplierStore,
  type SupplierCategoryId,
  type SupplierProductImage,
  type SupplierProductInput,
  type SupplierProductStatus,
} from "../services/SupplierStore.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";
import { PoolStore } from "../services/PoolStore.js";
import type {
  ManualPriceQuote,
  PriceQuoteConditions,
  WebPriceQuote,
} from "../../../../packages/domains/uas/product-identity/mixers/pricing/PriceUpdate.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function validHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validImageSource(value: string): boolean {
  return validHttpUrl(value) ||
    (value.length <= 550_000 && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(value));
}

function validateProduct(value: unknown): SupplierProductInput | string {
  if (!isRecord(value)) return "Los datos del producto no son válidos.";
  const category = SUPPLIER_CATEGORIES.find((entry) => entry.id === value.category);
  if (!category) return "Selecciona una categoría válida.";
  const subcategories: readonly string[] = category.subcategories;
  if (typeof value.subcategory !== "string"
    || (subcategories.length > 0 && !subcategories.includes(value.subcategory))
    || (category.subcategories.length === 0 && value.subcategory !== "")) {
    return "Selecciona una subcategoría válida.";
  }
  const { name, brand, model, description } = value;
  if (typeof name !== "string" || !name.trim() || name.length > 160) {
    return "El nombre del producto es obligatorio y no debe superar 160 caracteres.";
  }
  if (typeof brand !== "string" || brand.length > 120) return "La marca no debe superar 120 caracteres.";
  if (typeof model !== "string" || model.length > 160) return "El modelo no debe superar 160 caracteres.";
  if (typeof description !== "string" || description.length > 5000) return "La descripción no debe superar 5000 caracteres.";
  if (!isRecord(value.characteristics) || JSON.stringify(value.characteristics).length > 30000) {
    return "Las características del producto no son válidas.";
  }
  if (!Array.isArray(value.images) || value.images.length > 4
    || !value.images.every((image) =>
      isRecord(image) && typeof image.url === "string" && image.url.length <= 550_000
      && validImageSource(image.url) && typeof image.alt === "string" && image.alt.length <= 240)
    || value.images.reduce((total, image) =>
      total + (isRecord(image) && typeof image.url === "string" && image.url.startsWith("data:image/") ? image.url.length : 0), 0) > 2_000_000) {
    return "Indica hasta cuatro imágenes JPG, PNG o WebP de hasta 400 KB, o URL HTTP/HTTPS, con texto alternativo.";
  }
  if (!Array.isArray(value.sources) || value.sources.length > 20
    || !value.sources.every((source) =>
      isRecord(source) && typeof source.type === "string" && source.type.length <= 80
      && typeof source.url === "string" && source.url.length <= 1000 && validHttpUrl(source.url))) {
    return "Las referencias del producto deben ser enlaces HTTP/HTTPS válidos.";
  }
  const statuses: SupplierProductStatus[] = ["pending-review", "active", "archived"];
  if (!statuses.includes(value.status as SupplierProductStatus)) return "El estado del producto no es válido.";
  return {
    category: category.id as SupplierCategoryId,
    subcategory: value.subcategory,
    name: name.trim(),
    brand: brand.trim(),
    model: model.trim(),
    description: description.trim(),
    characteristics: value.characteristics,
    images: value.images as SupplierProductImage[],
    sources: value.sources as { type: string; url: string }[],
    status: value.status as SupplierProductStatus,
  };
}

function validateQuote(productId: string, value: unknown): WebPriceQuote | ManualPriceQuote | string {
  if (!isRecord(value)) return "Los datos de la cotización no son válidos.";
  const {
    id, sourceType, supplierType, supplierId, supplierName, unitPrice, currency, observedAt,
    sourceUrl, sourceReference, conditions,
  } = value;
  if (sourceType !== "web" && sourceType !== "manual") return "El origen debe ser web o investigación manual.";
  if (supplierType !== "dealer" && supplierType !== "manufacturer") return "Indica si el proveedor es dealer o fabricante.";
  if (typeof supplierId !== "string" || !supplierId.trim() || supplierId.length > 160
    || typeof supplierName !== "string" || !supplierName.trim() || supplierName.length > 160) {
    return "Identifica el proveedor de la cotización.";
  }
  if (typeof id === "string" && id.length > 160) return "El identificador de cotización es demasiado largo.";
  if (typeof unitPrice !== "number" || !Number.isFinite(unitPrice) || unitPrice <= 0) {
    return "El precio unitario debe ser mayor que cero.";
  }
  if (typeof currency !== "string" || !/^[A-Z]{3}$/i.test(currency)) {
    return "Indica la moneda con un código de tres letras.";
  }
  if (typeof observedAt !== "string" || !Number.isFinite(Date.parse(observedAt))) {
    return "Indica la fecha válida de la cotización.";
  }
  if (sourceType === "web" && (typeof sourceUrl !== "string" || sourceUrl.length > 1000 || !validHttpUrl(sourceUrl))) {
    return "La cotización web debe incluir su URL de origen.";
  }
  if (sourceType === "manual" && (typeof sourceReference !== "string"
    || !sourceReference.trim() || sourceReference.length > 1000)) {
    return "La investigación manual debe incluir una referencia del proveedor o contacto.";
  }
  if (!isRecord(conditions)
    || !["includesVat", "includesFreight", "includesFinancing", "includesAccessories"]
      .every((field) => typeof conditions[field] === "boolean")) {
    return "Declara si el precio incluye IVA, flete, financiación y accesorios.";
  }
  const normalizedConditions: PriceQuoteConditions = {
    includesVat: conditions.includesVat as boolean,
    includesFreight: conditions.includesFreight as boolean,
    includesFinancing: conditions.includesFinancing as boolean,
    includesAccessories: conditions.includesAccessories as boolean,
    ...(typeof conditions.vatRatePercent === "number" ? { vatRatePercent: conditions.vatRatePercent } : {}),
    ...(typeof conditions.freightAmount === "number" ? { freightAmount: conditions.freightAmount } : {}),
    ...(typeof conditions.financingAmount === "number" ? { financingAmount: conditions.financingAmount } : {}),
    ...(typeof conditions.accessoriesAmount === "number" ? { accessoriesAmount: conditions.accessoriesAmount } : {}),
  };
  const quoteId = typeof id === "string" && id.trim() ? id.trim() : `quote-${randomUUID()}`;
  const common = {
    id: quoteId,
    productId,
    supplierId: supplierId.trim(),
    supplierName: supplierName.trim(),
    unitPrice,
    currency: currency.toUpperCase(),
    observedAt,
    conditions: normalizedConditions,
  };
  return sourceType === "manual"
    ? {
      ...common,
      sourceType,
      supplierType,
      sourceReference: (sourceReference as string).trim(),
      ...(typeof sourceUrl === "string" && validHttpUrl(sourceUrl) ? { sourceUrl } : {}),
    }
    : { ...common, sourceType, supplierType, sourceUrl: sourceUrl as string };
}

export function createSuppliersRouter(
  accountStore = new ParticipantAccountStore(),
  supplierStore = new SupplierStore(),
  poolStore = new PoolStore(),
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);
  const adminOnly = [authenticate, requireAuth(["admin"])] as const;

  router.get("/api/admin/suppliers/categories", ...adminOnly, (_req, res: Response) =>
    res.json(SUPPLIER_CATEGORIES));

  router.get("/api/admin/suppliers", ...adminOnly, async (_req, res: Response) =>
    res.json(await supplierStore.listWithPrices()));

  router.post("/api/admin/suppliers", ...adminOnly, async (req, res: Response) => {
    const input = validateProduct(req.body);
    if (typeof input === "string") return res.status(400).json({ message: input });
    return res.status(201).json(await supplierStore.create(input));
  });

  router.get("/api/admin/suppliers/:id", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de producto inválido." });
    const product = await supplierStore.get(req.params.id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    const [quotes, prices] = await Promise.all([
      supplierStore.listQuotes(product.id),
      supplierStore.listPrices(product.id),
    ]);
    return res.json({ product, quotes, prices });
  });

  router.patch("/api/admin/suppliers/:id", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de producto inválido." });
    const input = validateProduct(req.body);
    if (typeof input === "string") return res.status(400).json({ message: input });
    const product = await supplierStore.update(req.params.id, input);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    return res.json(product);
  });

  router.delete("/api/admin/suppliers/:id", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de producto inválido." });
    if (!await supplierStore.delete(req.params.id)) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    return res.status(204).end();
  });

  router.post("/api/admin/suppliers/:id/quotes", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de producto inválido." });
    const quote = validateQuote(req.params.id, req.body);
    if (typeof quote === "string") return res.status(400).json({ message: quote });
    try {
      return res.status(201).json(await supplierStore.addQuote(req.params.id, quote));
    } catch (error) {
      if (error instanceof Error && error.message === "Producto no encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof Error && error.message === "Ya existe una cotización con ese identificador.") {
        return res.status(409).json({ message: error.message });
      }
      throw error;
    }
  });

  router.post("/api/admin/suppliers/:id/prices/recalculate", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de producto inválido." });
    const body = req.body;
    if (!isRecord(body)
      || typeof body.targetCurrency !== "string" || !/^[A-Z]{3}$/i.test(body.targetCurrency)
      || typeof body.asOf !== "string" || !Number.isFinite(Date.parse(body.asOf))
      || !isRecord(body.exchangeRates)
      || (body.maxQuoteAgeDays !== undefined
        && (typeof body.maxQuoteAgeDays !== "number" || !Number.isFinite(body.maxQuoteAgeDays) || body.maxQuoteAgeDays < 0))
      || !Object.entries(body.exchangeRates).every(([currency, rate]) =>
        /^[A-Z]{3}$/i.test(currency) && typeof rate === "number" && Number.isFinite(rate) && rate > 0)) {
      return res.status(400).json({ message: "Indica moneda de destino, fecha y tasas de cambio válidas." });
    }
    try {
      const product = await supplierStore.get(req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado." });
      const normalizeMatch = (value: string) => value.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
      const pools = (await poolStore.list())
        .filter((pool) => pool.visible && pool.status === "active"
          && Date.parse(pool.validUntil) >= Date.parse(body.asOf as string)
          && normalizeMatch(pool.brand) === normalizeMatch(product.brand)
          && [product.name, product.model].some((model) =>
            normalizeMatch(model) === normalizeMatch(pool.model)
            || (!pool.model.trim() && normalizeMatch(model) === normalizeMatch(pool.product))))
        .filter((pool) => pool.priceConditions !== undefined);
      const poolQuotes = pools.map((pool) => ({
        id: pool.id,
        productId: product.id,
        sourceType: "pool" as const,
        supplierId: pool.dealer.id,
        supplierName: pool.dealer.name,
        unitPrice: pool.discountedUnitPrice > 0 ? pool.discountedUnitPrice : pool.unitPrice,
        currency: pool.priceCurrency ?? "ARS",
        observedAt: pool.updatedAt,
        sourceReference: `Pool activo ${pool.id}`,
        active: true,
        validUntil: pool.validUntil,
        conditions: pool.priceConditions!,
      }));
      const record = await supplierStore.recalculatePrice(req.params.id, {
        targetCurrency: body.targetCurrency,
        asOf: body.asOf,
        exchangeRates: body.exchangeRates as Record<string, number>,
        ...(typeof body.maxQuoteAgeDays === "number" ? { maxQuoteAgeDays: body.maxQuoteAgeDays } : {}),
      }, poolQuotes);
      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof Error && error.message === "Producto no encontrado.") {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof Error && error.message.includes("must ")) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  return router;
}
