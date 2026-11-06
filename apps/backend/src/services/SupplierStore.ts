import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import {
  updatePrice,
  type PriceQuote,
  type PriceUpdate,
  type PriceUpdateOptions,
} from "../../../../packages/domains/uas/product-identity/mixers/pricing/index.js";

export type SupplierAttributeType = "text" | "number" | "boolean" | "select";

export interface SupplierAttributeDefinition {
  key: string;
  label: string;
  type: SupplierAttributeType;
  unit?: string;
  options?: string[];
  comparable: boolean;
}

export interface SupplierCategory {
  id: string;
  label: string;
  order: number;
  subcategories: string[];
  attributes: SupplierAttributeDefinition[];
}

export const DEFAULT_SUPPLIER_CATEGORIES: SupplierCategory[] = [
  { id: "drones", label: "Drones", order: 0, subcategories: [], attributes: [] },
  { id: "repuestos", label: "Repuestos", order: 1, subcategories: ["Baterías", "Cargadores", "Controles", "RTK"], attributes: [] },
  { id: "meteorologia", label: "Meteorología", order: 2, subcategories: [], attributes: [] },
  { id: "starlink", label: "Starlink", order: 3, subcategories: [], attributes: [] },
  {
    id: "mixers",
    label: "Mixers",
    order: 4,
    subcategories: [],
    attributes: [
      { key: "configuracion.nivel", label: "Configuración", type: "select", options: ["basica", "intermedia", "maxima"], comparable: true },
      { key: "configuracion.criterio", label: "Criterio de configuración", type: "text", comparable: false },
      { key: "capacidad_litros", label: "Capacidad", type: "number", unit: "L", comparable: true },
      { key: "energia.tipo", label: "Tipo de energía", type: "select", options: ["naftera", "electrica", "hibrida", "no_aplica"], comparable: true },
      { key: "energia.detalle_publicado", label: "Detalle de energía", type: "text", comparable: false },
      { key: "bomba.potencia_hp", label: "Potencia de bomba", type: "number", unit: "HP", comparable: true },
      { key: "bomba.detalle", label: "Detalle de bomba", type: "text", comparable: false },
      { key: "motobomba.potencia_hp", label: "Potencia de motobomba", type: "number", unit: "HP", comparable: true },
      { key: "motobomba.detalle", label: "Detalle de motobomba", type: "text", comparable: false },
      { key: "motor_agitacion.presente", label: "Motor de agitación", type: "boolean", comparable: true },
      { key: "motor_agitacion.potencia_hp", label: "Potencia de motor de agitación", type: "number", unit: "HP", comparable: true },
      { key: "motor_agitacion.detalle", label: "Detalle de agitación", type: "text", comparable: false },
      { key: "mangueras.longitud_metros", label: "Longitud de mangueras", type: "number", unit: "m", comparable: true },
      { key: "mangueras.detalle", label: "Detalle de mangueras", type: "text", comparable: false },
      { key: "caudalimetro.tipo", label: "Caudalímetro", type: "select", options: ["mecanico", "digital", "no_aplica"], comparable: true },
      { key: "monitoreo_control_remoto", label: "Monitoreo / control remoto", type: "boolean", comparable: true },
    ],
  },
  {
    id: "kits-mezcladores",
    label: "Kits de armado de Mezcladores",
    order: 5,
    subcategories: [
      "Mangueras", "Surtidores", "Válvulas", "Caudalímetro", "Bomba eléctrica",
      "Agitador", "Tanque de mezcla", "Filtros", "Acoples",
    ],
    attributes: [],
  },
  {
    id: "trailers",
    label: "Trailers",
    order: 6,
    subcategories: [],
    attributes: [
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
    ],
  },
  { id: "generadores", label: "Generadores", order: 7, subcategories: [], attributes: [] },
  {
    id: "kit-mediciones",
    label: "Kit Mediciones",
    order: 8,
    subcategories: ["PH", "Tarjetas hidrosensibles", "Recipientes graduados", "Bandejas", "Veletas"],
    attributes: [],
  },
  { id: "software", label: "Software", order: 9, subcategories: [], attributes: [] },
  { id: "panel-electrico", label: "Panel Eléctrico", order: 10, subcategories: [], attributes: [] },
  {
    id: "accesorios",
    label: "Accesorios",
    order: 11,
    subcategories: ["3D", "Carros de transporte", "Estructura para caja 4 x 4"],
    attributes: [],
  },
  { id: "tanques-agua", label: "Tanques de agua", order: 12, subcategories: [], attributes: [] },
  { id: "luces-tripodes", label: "Luces y Trípodes", order: 13, subcategories: [], attributes: [] },
  { id: "gazebo-sillas", label: "Gazebo y sillas", order: 14, subcategories: [], attributes: [] },
] as const;

export type SupplierCategoryId = string;
export type SupplierProductStatus = "pending-review" | "active" | "archived";

export interface SupplierProductImage {
  url: string;
  alt: string;
}

export interface SupplierProductInput {
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  characteristics: Record<string, unknown>;
  images: SupplierProductImage[];
  sources: { type: string; url: string }[];
  status: SupplierProductStatus;
}

export interface SupplierProduct extends SupplierProductInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProductWithPrice extends SupplierProduct {
  currentPrice: SupplierPriceRecord | null;
}

export interface SupplierPriceRecord extends PriceUpdate {
  id: string;
}

interface MixerCatalogIndex {
  grupos?: Record<string, {
    marca?: string;
    modelos?: { id?: string; archivo?: string; modelo?: string }[];
  }>;
}

const BACKEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_ROOT = resolve(BACKEND_ROOT, "../..");
const DEFAULT_DIRECTORY = resolve(BACKEND_ROOT, "data/suppliers");
const LEGACY_DIRECTORY = resolve(REPOSITORY_ROOT, "apps/backend/apps/backend/data/suppliers");
const DEFAULT_MIXERS_DIRECTORY = resolve(
  REPOSITORY_ROOT,
  "packages/domains/uas/product-identity/mixers",
);
const CATEGORIES_FILE_NAME = "categories.json";

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function slug(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getPath(value: Record<string, unknown>, path: string): unknown {
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!isRecord(current) || !(segment in current)) return undefined;
    current = current[segment];
  }
  return current;
}

export function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split(".");
  let current = target;
  for (const segment of segments.slice(0, -1)) {
    const child = current[segment];
    if (!isRecord(child)) current[segment] = {};
    const next = current[segment];
    if (!isRecord(next)) throw new Error(`No se pudo construir la característica ${path}.`);
    current = next;
  }
  current[segments[segments.length - 1]] = value;
}

export class SupplierStore {
  private mutationQueue: Promise<void> = Promise.resolve();
  private readonly productsDirectory: string;
  private readonly quotesDirectory: string;
  private readonly pricesDirectory: string;
  private readonly deletedDirectory: string;
  private readonly categoriesPath: string;
  private readonly mixersDirectory?: string;
  private readonly legacyDirectory?: string;
  private legacyMigration: Promise<void> | null = null;

  constructor(options: { directory?: string; mixersDirectory?: string; seedMixers?: boolean } = {}) {
    const configuredDirectory = options.directory ?? process.env.SUPPLIER_DATA_DIRECTORY;
    const directory = resolve(configuredDirectory ?? DEFAULT_DIRECTORY);
    this.productsDirectory = join(directory, "products");
    this.quotesDirectory = join(directory, "quotes");
    this.pricesDirectory = join(directory, "prices");
    this.deletedDirectory = join(directory, "deleted");
    this.categoriesPath = join(directory, CATEGORIES_FILE_NAME);
    this.mixersDirectory = options.seedMixers === false
      ? undefined
      : resolve(options.mixersDirectory ?? DEFAULT_MIXERS_DIRECTORY);
    this.legacyDirectory = configuredDirectory ? undefined : LEGACY_DIRECTORY;
  }

  async list(): Promise<SupplierProduct[]> {
    await this.ensureDirectories();
    await this.importMixers();
    const files = await this.yamlFiles(this.productsDirectory);
    const products = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.productsDirectory, file), "utf8")) as SupplierProduct
    ));
    const categoryOrder = new Map((await this.listCategories()).map((category) => [category.id, category.order]));
    return products.sort((left, right) =>
      (categoryOrder.get(left.category) ?? Number.MAX_SAFE_INTEGER)
        - (categoryOrder.get(right.category) ?? Number.MAX_SAFE_INTEGER)
        || left.name.localeCompare(right.name),
    );
  }

  async listCategories(): Promise<SupplierCategory[]> {
    await this.ensureDirectories();
    try {
      const categories = JSON.parse(await readFile(this.categoriesPath, "utf8")) as SupplierCategory[];
      if (!Array.isArray(categories) || !categories.every((category) =>
        isRecord(category) && typeof category.id === "string" && typeof category.label === "string")) {
        throw new Error("El archivo de categorías Suppliers no tiene un formato válido.");
      }
      return categories.slice().sort((left, right) => left.order - right.order);
    } catch (error) {
      if (!isMissingFile(error)) throw error;
      const defaults = DEFAULT_SUPPLIER_CATEGORIES.map((category) => ({
        ...category,
        subcategories: [...category.subcategories],
        attributes: category.attributes.map((attribute) => ({
          ...attribute,
          ...(attribute.options ? { options: [...attribute.options] } : {}),
        })),
      }));
      await this.writeCategories(defaults);
      return defaults;
    }
  }

  async saveCategory(
    input: Omit<SupplierCategory, "id" | "order">,
    id?: string,
  ): Promise<SupplierCategory> {
    return this.withMutation(async () => {
      const categories = await this.listCategories();
      const current = id ? categories.find((category) => category.id === id) : undefined;
      if (id && !current) throw new Error("Categoría no encontrada.");
      const categoryId = current?.id ?? slug(input.label);
      if (!categoryId) throw new Error("El nombre no produce un identificador de categoría válido.");
      if (!current && categories.some((category) => category.id === categoryId)) {
        throw new Error("Ya existe una categoría con ese nombre.");
      }
      if (current) {
        const validSubcategories = new Set(input.subcategories);
        const hasInvalidSubcategory = (await this.list()).some((product) =>
          product.category === categoryId
          && product.subcategory !== ""
          && !validSubcategories.has(product.subcategory));
        if (hasInvalidSubcategory) {
          throw new Error("No puedes quitar una subcategoría asignada a productos existentes.");
        }
      }
      const category: SupplierCategory = {
        ...input,
        id: categoryId,
        order: current?.order ?? categories.length,
      };
      const next = current
        ? categories.map((existing) => existing.id === categoryId ? category : existing)
        : [...categories, category];
      await this.writeCategories(next);
      return category;
    });
  }

  async deleteCategory(id: string): Promise<"deleted" | "not-found" | "in-use"> {
    return this.withMutation(async () => {
      const categories = await this.listCategories();
      if (!categories.some((category) => category.id === id)) return "not-found";
      if ((await this.list()).some((product) => product.category === id)) return "in-use";
      const next = categories.filter((category) => category.id !== id)
        .map((category, order) => ({ ...category, order }));
      await this.writeCategories(next);
      return "deleted";
    });
  }

  async reorderCategories(ids: string[]): Promise<SupplierCategory[]> {
    return this.withMutation(async () => {
      const categories = await this.listCategories();
      if (ids.length !== categories.length || new Set(ids).size !== ids.length
        || categories.some((category) => !ids.includes(category.id))) {
        throw new Error("El orden debe incluir cada categoría una sola vez.");
      }
      const byId = new Map(categories.map((category) => [category.id, category]));
      const reordered = ids.map((id, order) => ({ ...byId.get(id)!, order }));
      await this.writeCategories(reordered);
      return reordered;
    });
  }

  async getCategory(id: string): Promise<SupplierCategory | undefined> {
    return (await this.listCategories()).find((category) => category.id === id);
  }

  async get(id: string): Promise<SupplierProduct | undefined> {
    return (await this.list()).find((product) => product.id === id);
  }

  async listQuotes(productId: string): Promise<PriceQuote[]> {
    await this.requireProduct(productId);
    return this.readJsonArray<PriceQuote>(join(this.quotesDirectory, `${productId}.json`));
  }

  async listPrices(productId: string): Promise<SupplierPriceRecord[]> {
    await this.requireProduct(productId);
    return this.readJsonArray<SupplierPriceRecord>(join(this.pricesDirectory, `${productId}.json`));
  }

  async listWithPrices(): Promise<SupplierProductWithPrice[]> {
    const products = await this.list();
    return Promise.all(products.map(async (product) => {
      const prices = await this.readJsonArray<SupplierPriceRecord>(
        join(this.pricesDirectory, `${product.id}.json`),
      );
      return { ...product, currentPrice: prices.at(-1) ?? null };
    }));
  }

  async listPublicProducts(categoryId?: string): Promise<SupplierProductWithPrice[]> {
    const products = (await this.list()).filter((product) =>
      product.status === "active" && (!categoryId || product.category === categoryId));
    return Promise.all(products.map(async (product) => {
      const prices = await this.readJsonArray<SupplierPriceRecord>(
        join(this.pricesDirectory, `${product.id}.json`),
      );
      return { ...product, currentPrice: prices.at(-1) ?? null };
    }));
  }

  async create(input: SupplierProductInput, now = new Date()): Promise<SupplierProduct> {
    return this.withMutation(async () => {
      const id = `supplier-product-${slug(input.name)}-${randomUUID().slice(0, 8)}`;
      const timestamp = now.toISOString();
      const product: SupplierProduct = { ...input, id, createdAt: timestamp, updatedAt: timestamp };
      await this.writeProduct(product);
      return product;
    });
  }

  async update(id: string, input: SupplierProductInput): Promise<SupplierProduct | undefined> {
    return this.withMutation(async () => {
      const current = await this.get(id);
      if (!current) return undefined;
      const product: SupplierProduct = { ...input, id, createdAt: current.createdAt, updatedAt: new Date().toISOString() };
      await this.writeProduct(product);
      return product;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.withMutation(async () => {
      const current = await this.get(id);
      if (!current) return false;
      await writeFile(join(this.deletedDirectory, `${id}.json`), JSON.stringify({ deletedAt: new Date().toISOString() }), "utf8");
      await unlink(join(this.productsDirectory, `${id}.yml`));
      await this.removeIfPresent(join(this.quotesDirectory, `${id}.json`));
      await this.removeIfPresent(join(this.pricesDirectory, `${id}.json`));
      return true;
    });
  }

  async addQuote(productId: string, quote: PriceQuote): Promise<PriceQuote[]> {
    return this.withMutation(async () => {
      await this.requireProduct(productId);
      const quotes = await this.readJsonArray<PriceQuote>(join(this.quotesDirectory, `${productId}.json`));
      if (quotes.some((existing) => existing.id === quote.id)) {
        throw new Error("Ya existe una cotización con ese identificador.");
      }
      const updated = [...quotes, quote];
      await this.writeJson(join(this.quotesDirectory, `${productId}.json`), updated);
      return updated;
    });
  }

  async recalculatePrice(
    productId: string,
    options: Omit<PriceUpdateOptions, "productId">,
    additionalQuotes: PriceQuote[] = [],
  ): Promise<SupplierPriceRecord> {
    return this.withMutation(async () => {
      await this.requireProduct(productId);
      const quotes = await this.readJsonArray<PriceQuote>(join(this.quotesDirectory, `${productId}.json`));
      const result = updatePrice([...quotes, ...additionalQuotes], { ...options, productId });
      const record: SupplierPriceRecord = { ...result, id: `price-update-${randomUUID()}` };
      const history = await this.readJsonArray<SupplierPriceRecord>(
        join(this.pricesDirectory, `${productId}.json`),
      );
      await this.writeJson(join(this.pricesDirectory, `${productId}.json`), [...history, record]);
      return record;
    });
  }

  private async importMixers(): Promise<void> {
    if (!this.mixersDirectory) return;
    const indexPath = join(this.mixersDirectory, "index.yml");
    let index: MixerCatalogIndex;
    try {
      index = parse(await readFile(indexPath, "utf8")) as MixerCatalogIndex;
    } catch (error) {
      if (isMissingFile(error)) return;
      throw error;
    }

    for (const [groupId, group] of Object.entries(index.grupos ?? {})) {
      for (const mixer of group.modelos ?? []) {
        if (!mixer.id || !mixer.archivo) continue;
        if (await this.isDeleted(mixer.id)) continue;
        const path = join(this.productsDirectory, `${mixer.id}.yml`);
        try {
          const existing = parse(await readFile(path, "utf8")) as SupplierProduct;
          if (existing.category === "mixers" && isRecord(existing.characteristics)
            && ("precio" in existing.characteristics || "fotos" in existing.characteristics
              || existing.characteristics.tipo === "mixer")) {
            const categorySchema = await this.getCategory("mixers");
            const normalized: Record<string, unknown> = {};
            for (const attribute of categorySchema?.attributes ?? []) {
              const value = getPath(existing.characteristics, attribute.key);
              if (value !== undefined) setPath(normalized, attribute.key, value);
            }
            await this.writeProduct({
              ...existing,
              characteristics: normalized,
              updatedAt: new Date().toISOString(),
            });
          }
          continue;
        } catch (error) {
          if (!isMissingFile(error)) throw error;
        }

        const source = parse(await readFile(join(this.mixersDirectory, mixer.archivo), "utf8"));
        if (!isRecord(source)) throw new Error(`La ficha de mixer ${mixer.archivo} no es válida.`);
        const category: SupplierCategoryId = source.tipo === "tanque_auxiliar"
          || mixer.id.includes("tanque-respaldo")
          ? "tanques-agua"
          : "mixers";
        const timestamp = new Date().toISOString();
        const images = Array.isArray(source.fotos)
          ? source.fotos.flatMap((image): SupplierProductImage[] => {
            if (typeof image === "string") return [{ url: image, alt: mixer.modelo ?? "" }];
            if (isRecord(image) && typeof image.url === "string") {
              return [{ url: image.url, alt: typeof image.alt === "string" ? image.alt : mixer.modelo ?? "" }];
            }
            return [];
          })
          : [];
        const sources = Array.isArray(source.fuentes)
          ? source.fuentes.flatMap((entry): { type: string; url: string }[] =>
            isRecord(entry) && typeof entry.url === "string"
              ? [{ type: typeof entry.tipo === "string" ? entry.tipo : "fuente", url: entry.url }]
              : [])
          : [];
        const categorySchema = await this.getCategory(category);
        const characteristics: Record<string, unknown> = {};
        for (const attribute of categorySchema?.attributes ?? []) {
          const value = getPath(source, attribute.key);
          if (value !== undefined) setPath(characteristics, attribute.key, value);
        }
        const product: SupplierProduct = {
          id: mixer.id,
          category,
          subcategory: "",
          name: typeof mixer.modelo === "string" ? mixer.modelo : mixer.id,
          brand: typeof group.marca === "string" ? group.marca : groupId,
          model: typeof mixer.modelo === "string" ? mixer.modelo : "",
          description: typeof source.descripcion === "string" ? source.descripcion : "",
          characteristics,
          images,
          sources,
          status: "pending-review",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        await this.writeProduct(product);
      }
    }
  }

  private async ensureDirectories(): Promise<void> {
    if (this.legacyDirectory) {
      if (!this.legacyMigration) this.legacyMigration = this.copyLegacyData(this.legacyDirectory);
      await this.legacyMigration;
    }
    await Promise.all([
      this.productsDirectory,
      this.quotesDirectory,
      this.pricesDirectory,
      this.deletedDirectory,
    ].map((directory) => mkdir(directory, { recursive: true })));
  }

  private async copyLegacyData(sourceDirectory: string): Promise<void> {
    const copyMissing = async (source: string, destination: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(source, { withFileTypes: true });
      } catch (error) {
        if (isMissingFile(error)) return;
        throw error;
      }
      await mkdir(destination, { recursive: true });
      for (const entry of entries) {
        const sourcePath = join(source, entry.name);
        const destinationPath = join(destination, entry.name);
        if (entry.isDirectory()) {
          await copyMissing(sourcePath, destinationPath);
          continue;
        }
        try {
          await readFile(destinationPath);
        } catch (error) {
          if (!isMissingFile(error)) throw error;
          await copyFile(sourcePath, destinationPath);
        }
      }
    };
    await copyMissing(sourceDirectory, this.directoryFor(this.categoriesPath));
  }

  private async writeCategories(categories: SupplierCategory[]): Promise<void> {
    await mkdir(dirname(this.categoriesPath), { recursive: true });
    await writeFile(this.categoriesPath, JSON.stringify(categories, null, 2), "utf8");
  }

  private async yamlFiles(directory: string): Promise<string[]> {
    try {
      return (await readdir(directory)).filter((file) => /\.ya?ml$/i.test(file));
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw error;
    }
  }

  private async isDeleted(id: string): Promise<boolean> {
    try {
      await readFile(join(this.deletedDirectory, `${id}.json`), "utf8");
      return true;
    } catch (error) {
      if (isMissingFile(error)) return false;
      throw error;
    }
  }

  private async requireProduct(id: string): Promise<SupplierProduct> {
    const product = await this.get(id);
    if (!product) throw new Error("Producto no encontrado.");
    return product;
  }

  private async writeProduct(product: SupplierProduct): Promise<void> {
    await this.ensureDirectories();
    await writeFile(join(this.productsDirectory, `${product.id}.yml`), stringify(product), "utf8");
  }

  private async readJsonArray<T>(path: string): Promise<T[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
      if (!Array.isArray(parsed)) throw new Error(`El archivo de datos ${path} no contiene una lista.`);
      return parsed as T[];
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw error;
    }
  }

  private async writeJson(path: string, value: unknown): Promise<void> {
    await mkdir(this.directoryFor(path), { recursive: true });
    await writeFile(path, JSON.stringify(value, null, 2), "utf8");
  }

  private directoryFor(path: string): string {
    return dirname(path);
  }

  private async removeIfPresent(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch (error) {
      if (!isMissingFile(error)) throw error;
    }
  }

  private async withMutation<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.mutationQueue;
    let release!: () => void;
    this.mutationQueue = new Promise<void>((resolveQueue) => { release = resolveQueue; });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
