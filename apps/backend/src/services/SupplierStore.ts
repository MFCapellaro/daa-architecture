import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { parse, stringify } from "yaml";
import {
  updatePrice,
  type PriceQuote,
  type PriceUpdate,
  type PriceUpdateOptions,
} from "../../../../packages/domains/uas/product-identity/mixers/pricing/index.js";

export const SUPPLIER_CATEGORIES = [
  { id: "drones", label: "Drones", subcategories: [] },
  { id: "repuestos", label: "Repuestos", subcategories: ["Baterías", "Cargadores", "Controles", "RTK"] },
  { id: "meteorologia", label: "Meteorología", subcategories: [] },
  { id: "starlink", label: "Starlink", subcategories: [] },
  { id: "mixers", label: "Mixers", subcategories: [] },
  {
    id: "kits-mezcladores",
    label: "Kits de armado de Mezcladores",
    subcategories: [
      "Mangueras", "Surtidores", "Válvulas", "Caudalímetro", "Bomba eléctrica",
      "Agitador", "Tanque de mezcla", "Filtros", "Acoples",
    ],
  },
  { id: "trailers", label: "Trailers", subcategories: [] },
  { id: "generadores", label: "Generadores", subcategories: [] },
  {
    id: "kit-mediciones",
    label: "Kit Mediciones",
    subcategories: ["PH", "Tarjetas hidrosensibles", "Recipientes graduados", "Bandejas", "Veletas"],
  },
  { id: "software", label: "Software", subcategories: [] },
  { id: "panel-electrico", label: "Panel Eléctrico", subcategories: [] },
  {
    id: "accesorios",
    label: "Accesorios",
    subcategories: ["3D", "Carros de transporte", "Estructura para caja 4 x 4"],
  },
  { id: "tanques-agua", label: "Tanques de agua", subcategories: [] },
  { id: "luces-tripodes", label: "Luces y Trípodes", subcategories: [] },
  { id: "gazebo-sillas", label: "Gazebo y sillas", subcategories: [] },
] as const;

export type SupplierCategoryId = typeof SUPPLIER_CATEGORIES[number]["id"];
export type SupplierProductStatus = "pending-review" | "active" | "archived";

export interface SupplierProductImage {
  url: string;
  alt: string;
}

export interface SupplierProductInput {
  category: SupplierCategoryId;
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

const DEFAULT_DIRECTORY = resolve(process.cwd(), "apps/backend/data/suppliers");
const DEFAULT_MIXERS_DIRECTORY = resolve(
  process.cwd(),
  "packages/domains/uas/product-identity/mixers",
);

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

export class SupplierStore {
  private mutationQueue: Promise<void> = Promise.resolve();
  private readonly productsDirectory: string;
  private readonly quotesDirectory: string;
  private readonly pricesDirectory: string;
  private readonly deletedDirectory: string;
  private readonly mixersDirectory?: string;

  constructor(options: { directory?: string; mixersDirectory?: string; seedMixers?: boolean } = {}) {
    const directory = resolve(options.directory ?? process.env.SUPPLIER_DATA_DIRECTORY ?? DEFAULT_DIRECTORY);
    this.productsDirectory = join(directory, "products");
    this.quotesDirectory = join(directory, "quotes");
    this.pricesDirectory = join(directory, "prices");
    this.deletedDirectory = join(directory, "deleted");
    this.mixersDirectory = options.seedMixers === false
      ? undefined
      : resolve(options.mixersDirectory ?? DEFAULT_MIXERS_DIRECTORY);
  }

  async list(): Promise<SupplierProduct[]> {
    await this.ensureDirectories();
    await this.importMixers();
    const files = await this.yamlFiles(this.productsDirectory);
    const products = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.productsDirectory, file), "utf8")) as SupplierProduct
    ));
    return products.sort((left, right) =>
      left.category.localeCompare(right.category) || left.name.localeCompare(right.name),
    );
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
          await readFile(path, "utf8");
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
        const product: SupplierProduct = {
          id: mixer.id,
          category,
          subcategory: "",
          name: typeof mixer.modelo === "string" ? mixer.modelo : mixer.id,
          brand: typeof group.marca === "string" ? group.marca : groupId,
          model: typeof mixer.modelo === "string" ? mixer.modelo : "",
          description: typeof source.descripcion === "string" ? source.descripcion : "",
          characteristics: source,
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
    await Promise.all([
      this.productsDirectory,
      this.quotesDirectory,
      this.pricesDirectory,
      this.deletedDirectory,
    ].map((directory) => mkdir(directory, { recursive: true })));
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
