import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { Response } from "express";
import { createAuthMiddleware } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  SupplierStore,
  getPath,
  type SupplierCategoryId,
  type SupplierAttributeDefinition,
  type SupplierAttributeType,
  type SupplierCategory,
  type SupplierProductImage,
  type SupplierProductInput,
  type SupplierProductStatus,
} from "../services/SupplierStore.js";
import { ParticipantAccountStore } from "../services/ParticipantAccountStore.js";
import { PoolStore } from "../services/PoolStore.js";
import {
  fetchBnaUsdArsExchangeRate,
  type BnaUsdArsExchangeRate,
} from "../services/BnaExchangeRate.js";
import { recalculateSupplierPrice } from "../services/SupplierPriceAutomation.js";
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

function validateProduct(value: unknown, categories: SupplierCategory[]): SupplierProductInput | string {
  if (!isRecord(value)) return "Los datos del producto no son válidos.";
  const category = categories.find((entry) => entry.id === value.category);
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
  for (const attribute of category.attributes) {
    const attributeValue = getPath(value.characteristics, attribute.key);
    if (attributeValue === undefined || attributeValue === null) continue;
    if (attribute.type === "text" && typeof attributeValue !== "string") {
      return `La característica ${attribute.label} debe ser texto o quedar pendiente.`;
    }
    if (attribute.type === "number" && (typeof attributeValue !== "number" || !Number.isFinite(attributeValue))) {
      return `La característica ${attribute.label} debe ser numérica o quedar pendiente.`;
    }
    if (attribute.type === "boolean" && typeof attributeValue !== "boolean") {
      return `La característica ${attribute.label} debe ser sí, no o quedar pendiente.`;
    }
    if (attribute.type === "select" && (typeof attributeValue !== "string" || !attribute.options?.includes(attributeValue))) {
      return `Selecciona una opción válida para ${attribute.label}.`;
    }
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

function validateCategory(value: unknown): Omit<SupplierCategory, "id" | "order"> | string {
  if (!isRecord(value) || typeof value.label !== "string" || !value.label.trim() || value.label.length > 120) {
    return "El nombre de la categoría es obligatorio y no debe superar 120 caracteres.";
  }
  if (!Array.isArray(value.subcategories) || value.subcategories.length > 100
    || !value.subcategories.every((subcategory) =>
      typeof subcategory === "string" && Boolean(subcategory.trim()) && subcategory.length <= 100)
    || new Set(value.subcategories.map((subcategory) => String(subcategory).trim().toLocaleLowerCase())).size !== value.subcategories.length) {
    return "Las subcategorías deben ser nombres únicos de hasta 100 caracteres.";
  }
  if (!Array.isArray(value.attributes) || value.attributes.length > 100) {
    return "Define hasta 100 atributos para la comparación de esta categoría.";
  }
  const attributes: SupplierAttributeDefinition[] = [];
  const keys = new Set<string>();
  for (const rawAttribute of value.attributes) {
    if (!isRecord(rawAttribute)
      || typeof rawAttribute.key !== "string"
      || !/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/.test(rawAttribute.key)
      || typeof rawAttribute.label !== "string" || !rawAttribute.label.trim() || rawAttribute.label.length > 120
      || !["text", "number", "boolean", "select"].includes(rawAttribute.type as string)
      || typeof rawAttribute.comparable !== "boolean"
      || (rawAttribute.unit !== undefined && (typeof rawAttribute.unit !== "string" || rawAttribute.unit.length > 30))) {
      return "Hay una definición de atributo inválida.";
    }
    const key = rawAttribute.key as string;
    if ([...keys].some((existingKey) => existingKey === key
      || existingKey.startsWith(`${key}.`)
      || key.startsWith(`${existingKey}.`))) {
      return `La clave del atributo "${key}" se repite o entra en conflicto con otra ruta.`;
    }
    keys.add(key);
    const type = rawAttribute.type as SupplierAttributeType;
    if (type === "select" && (!Array.isArray(rawAttribute.options) || rawAttribute.options.length === 0
      || rawAttribute.options.length > 50
      || !rawAttribute.options.every((option) => typeof option === "string" && Boolean(option.trim()) && option.length <= 100))) {
      return `El atributo "${rawAttribute.label}" requiere opciones válidas.`;
    }
    if (type !== "select" && rawAttribute.options !== undefined) {
      return `Solo los atributos de tipo selección pueden declarar opciones.`;
    }
    attributes.push({
      key: rawAttribute.key,
      label: rawAttribute.label.trim(),
      type,
      comparable: rawAttribute.comparable,
      ...(typeof rawAttribute.unit === "string" && rawAttribute.unit.trim() ? { unit: rawAttribute.unit.trim() } : {}),
      ...(type === "select" ? { options: (rawAttribute.options as string[]).map((option) => option.trim()) } : {}),
    });
  }
  return {
    label: value.label.trim(),
    subcategories: (value.subcategories as string[]).map((subcategory) => subcategory.trim()),
    attributes,
  };
}

function publicProduct(product: Awaited<ReturnType<SupplierStore["listPublicProducts"]>>[number]) {
  const { currentPrice, ...publicProductRecord } = product;
  return {
    ...publicProductRecord,
    currentPrice: currentPrice ? {
      id: currentPrice.id,
      productId: currentPrice.productId,
      updatedAt: currentPrice.updatedAt,
      currency: currentPrice.currency,
      price: currentPrice.price,
      method: currentPrice.method,
    } : null,
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
  getExchangeRate: () => Promise<BnaUsdArsExchangeRate> = fetchBnaUsdArsExchangeRate,
) {
  const router = Router();
  const authenticate = createAuthMiddleware(accountStore);
  const adminOnly = [authenticate, requireAuth(["admin"])] as const;

  router.get("/api/suppliers/categories", async (_req, res: Response) =>
    res.json(await supplierStore.listCategories()));

  router.get("/api/suppliers", async (req, res: Response) => {
    const categoryId = typeof req.query.category === "string" ? req.query.category : undefined;
    if (categoryId && !await supplierStore.getCategory(categoryId)) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    return res.json((await supplierStore.listPublicProducts(categoryId)).map(publicProduct));
  });

  router.get("/api/suppliers/compare", async (req, res: Response) => {
    const categoryId = typeof req.query.category === "string" ? req.query.category : "";
    const ids = typeof req.query.ids === "string"
      ? [...new Set(req.query.ids.split(",").filter(Boolean))]
      : [];
    if (!categoryId || ids.length < 2 || ids.length > 4) {
      return res.status(400).json({ message: "Selecciona una categoría y entre dos y cuatro productos para comparar." });
    }
    const category = await supplierStore.getCategory(categoryId);
    if (!category) return res.status(404).json({ message: "Categoría no encontrada." });
    const products = await supplierStore.listPublicProducts(categoryId);
    const selected = ids.map((id) => products.find((product) => product.id === id));
    if (selected.some((product) => product === undefined)) {
      return res.status(400).json({ message: "Todos los productos comparados deben estar activos y pertenecer a la misma categoría." });
    }
    const selectedProducts = selected.filter((product) => product !== undefined);
    return res.json({
      category,
      products: selectedProducts.map(publicProduct),
      comparableAttributes: category.attributes.filter((attribute) => attribute.comparable),
    });
  });

  router.get("/api/admin/suppliers/categories", ...adminOnly, (_req, res: Response) =>
    supplierStore.listCategories().then((categories) => res.json(categories)));

  router.put("/api/admin/suppliers/categories/order", ...adminOnly, async (req, res: Response) => {
    const categoryIds = isRecord(req.body) ? req.body.categoryIds : undefined;
    if (!Array.isArray(categoryIds) || !categoryIds.every((id) => typeof id === "string")) {
      return res.status(400).json({ message: "El orden debe incluir identificadores de categorías." });
    }
    try {
      return res.json(await supplierStore.reorderCategories(categoryIds));
    } catch (error) {
      if (error instanceof Error && error.message.includes("orden debe")) {
        return res.status(400).json({ message: error.message });
      }
      throw error;
    }
  });

  router.post("/api/admin/suppliers/categories", ...adminOnly, async (req, res: Response) => {
    const input = validateCategory(req.body);
    if (typeof input === "string") return res.status(400).json({ message: input });
    try {
      return res.status(201).json(await supplierStore.saveCategory(input));
    } catch (error) {
      if (error instanceof Error && error.message.includes("categoría")) {
        return res.status(error.message.includes("Ya existe") ? 409 : 400).json({ message: error.message });
      }
      throw error;
    }
  });

  router.put("/api/admin/suppliers/categories/:id", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de categoría inválido." });
    const input = validateCategory(req.body);
    if (typeof input === "string") return res.status(400).json({ message: input });
    try {
      return res.json(await supplierStore.saveCategory(input, req.params.id));
    } catch (error) {
      if (error instanceof Error && error.message === "Categoría no encontrada.") {
        return res.status(404).json({ message: error.message });
      }
      if (error instanceof Error && error.message.includes("subcategoría")) {
        return res.status(409).json({ message: error.message });
      }
      throw error;
    }
  });

  router.delete("/api/admin/suppliers/categories/:id", ...adminOnly, async (req, res: Response) => {
    if (typeof req.params.id !== "string") return res.status(400).json({ message: "ID de categoría inválido." });
    const result = await supplierStore.deleteCategory(req.params.id);
    if (result === "not-found") return res.status(404).json({ message: "Categoría no encontrada." });
    if (result === "in-use") return res.status(409).json({ message: "La categoría tiene productos asignados; reasígnalos o elimínalos antes." });
    return res.status(204).end();
  });

  router.get("/api/admin/suppliers", ...adminOnly, async (_req, res: Response) =>
    res.json(await supplierStore.listWithPrices()));

  router.post("/api/admin/suppliers", ...adminOnly, async (req, res: Response) => {
    const input = validateProduct(req.body, await supplierStore.listCategories());
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
    const input = validateProduct(req.body, await supplierStore.listCategories());
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
      || typeof body.targetCurrency !== "string" || !["ARS", "USD"].includes(body.targetCurrency.toUpperCase())
      || typeof body.asOf !== "string" || !Number.isFinite(Date.parse(body.asOf))
      || (body.maxQuoteAgeDays !== undefined
        && (typeof body.maxQuoteAgeDays !== "number" || !Number.isFinite(body.maxQuoteAgeDays) || body.maxQuoteAgeDays < 0))) {
      return res.status(400).json({ message: "Indica ARS o USD como moneda de destino y una fecha válida." });
    }
    try {
      const product = await supplierStore.get(req.params.id);
      if (!product) return res.status(404).json({ message: "Producto no encontrado." });
      let exchangeRate: BnaUsdArsExchangeRate;
      try {
        exchangeRate = await getExchangeRate();
      } catch (error) {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        return res.status(502).json({ message: `No se pudo consultar la cotización vendedor del BNA.${detail}` });
      }
      const record = await recalculateSupplierPrice(
        supplierStore,
        poolStore,
        req.params.id,
        body.targetCurrency.toUpperCase(),
        body.asOf,
        exchangeRate,
        typeof body.maxQuoteAgeDays === "number" ? body.maxQuoteAgeDays : undefined,
      );
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
