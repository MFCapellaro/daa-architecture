import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";
import type {
  ManualPriceQuote,
  PriceQuote,
  WebPriceQuote,
} from "../../../../packages/domains/uas/product-identity/mixers/pricing/PriceUpdate.js";
import type { BnaUsdArsExchangeRate } from "./BnaExchangeRate.js";
import type { PoolStore } from "./PoolStore.js";
import { SupplierStore } from "./SupplierStore.js";

export const SUPPLIER_PRICE_REFRESH_INTERVAL_MS = 15 * 24 * 60 * 60 * 1000;
const MAX_PAGE_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;

export interface ScrapedPrice {
  price: number;
  currency?: string;
}

function isPublicIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  const [first, second, third] = octets;
  return first !== 0 && first !== 10 && first !== 127 && first < 224
    && !(first === 100 && second >= 64 && second <= 127)
    && !(first === 169 && second === 254)
    && !(first === 172 && second >= 16 && second <= 31)
    && !(first === 192 && (second === 0 || second === 168))
    && !(first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100)))
    && !(first === 203 && second === 0 && third === 113);
}

function isPublicIp(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPublicIpv4(address);
  if (version !== 6) return false;
  const firstHextet = Number.parseInt(address.split(":")[0] || "0", 16);
  return (firstHextet & 0xe000) === 0x2000
    && !address.toLowerCase().startsWith("2001:db8:");
}

async function assertPublicHttpUrl(value: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("La fuente de precio no es una URL válida.");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password
    || (url.port && url.port !== "80" && url.port !== "443")
    || hostname.toLowerCase() === "localhost"
    || hostname.toLowerCase().endsWith(".localhost")
    || hostname.toLowerCase().endsWith(".local")) {
    throw new Error("La fuente de precio debe ser una URL HTTP/HTTPS pública.");
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new Error("La fuente de precio debe resolver únicamente a direcciones IP públicas.");
  }
  return url;
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : undefined;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/[^\d.,]/g, "");
  if (!normalized || !/\d/.test(normalized)) return undefined;
  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  let numeric = normalized;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    numeric = normalized.split(thousandsSeparator).join("").replace(decimalSeparator, ".");
  } else if (lastComma >= 0) {
    const decimals = normalized.length - lastComma - 1;
    numeric = decimals > 0 && decimals <= 2
      ? normalized.replace(",", ".")
      : normalized.replace(/,/g, "");
  } else if (lastDot >= 0) {
    const decimals = normalized.length - lastDot - 1;
    numeric = decimals > 0 && decimals <= 2
      ? normalized
      : normalized.replace(/\./g, "");
  }
  const price = Number(numeric);
  return Number.isFinite(price) && price > 0 ? price : undefined;
}

function findOfferPrice(value: unknown, inheritedCurrency?: string): ScrapedPrice | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findOfferPrice(entry, inheritedCurrency);
      if (found) return found;
    }
    return undefined;
  }
  if (value === null || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const ownCurrency = typeof record.priceCurrency === "string" ? record.priceCurrency : inheritedCurrency;
  const typeValue = record["@type"];
  const types = (Array.isArray(typeValue) ? typeValue : [typeValue])
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.toLowerCase());
  const isOffer = types.some((type) => type.includes("offer"));
  const price = parsePrice(record.price)
    ?? (isOffer ? parsePrice(record.lowPrice) : undefined);
  if (price && ownCurrency === undefined) return { price };
  if (price && ownCurrency && /^[A-Z]{3}$/i.test(ownCurrency)) {
    return { price, currency: ownCurrency.toUpperCase() };
  }
  for (const child of Object.values(record)) {
    const found = findOfferPrice(child, ownCurrency);
    if (found) return found;
  }
  return undefined;
}

export function extractSchemaOrgPrice(document: string, contentType = "text/html"): ScrapedPrice {
  const jsonDocuments: string[] = [];
  if (contentType.toLowerCase().includes("json")) jsonDocuments.push(document);
  const scriptPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
  for (const match of document.matchAll(scriptPattern)) jsonDocuments.push(match[1]);
  for (const jsonDocument of jsonDocuments) {
    try {
      const price = findOfferPrice(JSON.parse(jsonDocument));
      if (price) return price;
    } catch {
      continue;
    }
  }
  throw new Error("La página no publica un precio Product/Offer válido en Schema.org.");
}

async function readLimitedBody(response: Response): Promise<string> {
  const declaredSize = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > MAX_PAGE_BYTES) {
    throw new Error("La página de precio supera el tamaño máximo permitido.");
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PAGE_BYTES) {
      await reader.cancel();
      throw new Error("La página de precio supera el tamaño máximo permitido.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function scrapeSchemaOrgPrice(sourceUrl: string): Promise<ScrapedPrice> {
  let url = await assertPublicHttpUrl(sourceUrl);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html, application/ld+json, application/json",
        "User-Agent": "DAA-SupplierPriceBot/1.0",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error("La fuente de precio tiene demasiadas redirecciones o una ubicación inválida.");
      }
      url = await assertPublicHttpUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`La fuente de precio respondió HTTP ${response.status}.`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!/(?:text\/html|application\/(?:ld\+json|json))/i.test(contentType)) {
      throw new Error("La fuente de precio no devolvió HTML o JSON estructurado.");
    }
    return extractSchemaOrgPrice(await readLimitedBody(response), contentType);
  }
  throw new Error("No se pudo consultar la fuente de precio.");
}

function normalizeMatch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase();
}

export async function recalculateSupplierPrice(
  supplierStore: SupplierStore,
  poolStore: PoolStore,
  productId: string,
  targetCurrency: string,
  asOf: string,
  exchangeRate: BnaUsdArsExchangeRate,
  maxQuoteAgeDays?: number,
) {
  const product = await supplierStore.get(productId);
  if (!product) throw new Error("Producto no encontrado.");
  const exchangeRates: Record<string, number> = targetCurrency === "ARS"
    ? { USD: exchangeRate.rate }
    : { ARS: 1 / exchangeRate.rate };
  const matchingPools = (await poolStore.list())
    .filter((pool) => pool.visible
      && normalizeMatch(pool.brand) === normalizeMatch(product.brand)
      && [product.name, product.model].some((model) =>
        normalizeMatch(model) === normalizeMatch(pool.model)
        || (!pool.model.trim() && normalizeMatch(model) === normalizeMatch(pool.product))))
    .filter((pool) => pool.priceConditions !== undefined);
  const poolQuotes: PriceQuote[] = matchingPools.flatMap((pool): PriceQuote[] => [
    ...(pool.unitPrice > 0 ? [{
      id: `${pool.id}-retail`,
      productId: product.id,
      sourceType: "manual" as const,
      supplierType: "dealer" as const,
      supplierId: pool.dealer.id,
      supplierName: pool.dealer.name,
      unitPrice: pool.unitPrice,
      currency: pool.priceCurrency ?? "ARS",
      observedAt: pool.updatedAt,
      sourceReference: `Precio de venta al público del pool ${pool.id}`,
      conditions: pool.priceConditions!,
    }] : []),
    ...(pool.visible && pool.status === "active" && Date.parse(pool.validUntil) >= Date.parse(asOf) ? [{
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
    }] : []),
  ]);
  return supplierStore.recalculatePrice(productId, {
    targetCurrency,
    asOf,
    exchangeRates,
    exchangeRateDetails: exchangeRate,
    ...(maxQuoteAgeDays !== undefined ? { maxQuoteAgeDays } : {}),
  }, poolQuotes);
}

export class SupplierPriceAutomation {
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly supplierStore: SupplierStore,
    private readonly poolStore: PoolStore,
    private readonly getExchangeRate: () => Promise<BnaUsdArsExchangeRate>,
    private readonly fetchPrice: (url: string) => Promise<ScrapedPrice> = scrapeSchemaOrgPrice,
    private readonly log: Pick<Console, "error" | "warn"> = console,
  ) {}

  start(): void {
    if (this.timer) return;
    void this.refreshDue().catch((error: unknown) => {
      this.log.error("Failed to refresh supplier web prices.", error);
    });
    this.timer = setInterval(() => {
      void this.refreshDue().catch((error: unknown) => {
        this.log.error("Failed to refresh supplier web prices.", error);
      });
    }, SUPPLIER_PRICE_REFRESH_INTERVAL_MS);
    this.timer.unref();
  }

  async refreshDue(now = new Date()): Promise<void> {
    const products = (await this.supplierStore.list()).filter((product) => product.category === "trailers");
    for (const product of products) {
      const priceSources = product.sources.filter((source) => source.type.trim().toLocaleLowerCase() === "precio");
      if (!priceSources.length) continue;
      const quotes = await this.supplierStore.listQuotes(product.id);
      for (const source of priceSources) {
        const sourceQuotes = quotes.filter((quote): quote is ManualPriceQuote | WebPriceQuote =>
          quote.sourceType !== "pool" && quote.sourceUrl === source.url);
        const baseline = sourceQuotes.slice().sort((left, right) =>
          Date.parse(right.observedAt) - Date.parse(left.observedAt))[0];
        if (!baseline) {
          this.log.warn(`No initial price quote with matching URL exists for trailer ${product.id}.`);
          continue;
        }
        const prices = await this.supplierStore.listPrices(product.id);
        const latestPrice = prices.at(-1);
        if (Date.parse(baseline.observedAt) > Date.parse(latestPrice?.updatedAt ?? "")) {
          try {
            const exchangeRate = await this.getExchangeRate();
            await recalculateSupplierPrice(
              this.supplierStore,
              this.poolStore,
              product.id,
              latestPrice?.currency ?? baseline.currency,
              now.toISOString(),
              exchangeRate,
            );
          } catch (error) {
            this.log.error(`Failed to recalculate the current price for trailer ${product.id}.`, error);
          }
        }
        if (now.getTime() - Date.parse(baseline.observedAt) < SUPPLIER_PRICE_REFRESH_INTERVAL_MS) continue;
        try {
          const scraped = await this.fetchPrice(source.url);
          if (!Number.isFinite(scraped.price) || scraped.price <= 0
            || (scraped.currency !== undefined && !/^[A-Z]{3}$/i.test(scraped.currency))) {
            throw new Error("La página devolvió un precio o una moneda inválidos.");
          }
          const quote: WebPriceQuote = {
            id: `scraped-${randomUUID()}`,
            productId: product.id,
            sourceType: "web",
            supplierType: baseline.supplierType,
            supplierId: baseline.supplierId,
            supplierName: baseline.supplierName,
            unitPrice: scraped.price,
            currency: scraped.currency ?? baseline.currency,
            observedAt: now.toISOString(),
            sourceUrl: source.url,
            conditions: baseline.conditions,
          };
          await this.supplierStore.addQuote(product.id, quote);
          const exchangeRate = await this.getExchangeRate();
          await recalculateSupplierPrice(
            this.supplierStore,
            this.poolStore,
            product.id,
            latestPrice?.currency ?? quote.currency,
            now.toISOString(),
            exchangeRate,
          );
        } catch (error) {
          this.log.error(`Failed to update price for trailer ${product.id} from ${source.url}.`, error);
        }
      }
    }
  }
}
