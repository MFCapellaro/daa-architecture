import { describe, expect, it } from "vitest";
import type {
  PriceQuote,
  PriceUpdateOptions,
  WebPriceQuote
} from "./PriceUpdate.js";
import { updatePrice } from "./updatePrice.js";

const options: PriceUpdateOptions = {
  productId: "mixer-example",
  targetCurrency: "ARS",
  asOf: "2026-11-02T12:00:00.000Z",
  exchangeRates: { USD: 1000 }
};

function webQuote(
  id: string,
  supplierId: string,
  unitPrice: number,
  overrides: Partial<WebPriceQuote> = {}
): WebPriceQuote {
  return {
    id,
    productId: options.productId,
    sourceType: "web",
    supplierType: "dealer",
    supplierId,
    supplierName: supplierId,
    unitPrice,
    currency: "ARS",
    observedAt: "2026-11-01T12:00:00.000Z",
    sourceUrl: `https://example.com/${id}`,
    conditions: {
      includesVat: false,
      includesFreight: false,
      includesFinancing: false,
      includesAccessories: false
    },
    ...overrides
  };
}

function poolQuote(id: string, unitPrice: number, active: boolean): PriceQuote {
  const { supplierType: _supplierType, ...base } = webQuote(id, "supplier-a", unitPrice);
  return {
    ...base,
    sourceType: "pool",
    active,
    validUntil: "2026-11-03T00:00:00.000Z"
  };
}

describe("updatePrice", () => {
  it("averages no more than three independent, latest dealer quotes", () => {
    const quotes = [
      webQuote("a", "dealer-a", 100),
      webQuote("b", "dealer-b", 200),
      webQuote("c", "dealer-c", 300),
      webQuote("d", "dealer-d", 900),
      webQuote("a-old", "dealer-a", 10, { observedAt: "2026-10-30T12:00:00.000Z" })
    ];

    const result = updatePrice(quotes, options);

    expect(result.price).toBe(200);
    expect(result.method).toBe("dealer-average");
    expect(result.quoteIds).toEqual(["a", "b", "c"]);
    expect(result.quoteEvaluations.find(({ quote }) => quote.id === "a-old")?.status).toBe("valid");
  });

  it("uses the unit price of a currently active matching pool", () => {
    const activePoolQuote = poolQuote("pool-1", 80, true);

    const result = updatePrice([webQuote("dealer-1", "dealer-a", 100), activePoolQuote], options);

    expect(result.price).toBe(80);
    expect(result.method).toBe("active-pool");
    expect(result.quoteIds).toEqual(["pool-1"]);
  });

  it("normalizes exchange rate, VAT, freight, financing, and accessory conditions", () => {
    const quote = webQuote("usd-quote", "dealer-a", 1420, {
      currency: "USD",
      conditions: {
        includesVat: true,
        vatRatePercent: 21,
        includesFreight: true,
        freightAmount: 100,
        includesFinancing: true,
        financingAmount: 110,
        includesAccessories: true,
        accessoriesAmount: 0
      }
    });

    const result = updatePrice([quote], options);

    expect(result.price).toBe(1000000);
    expect(result.quoteEvaluations[0]).toMatchObject({
      status: "selected",
      normalizedUnitPrice: 1000000,
      exchangeRate: 1000
    });
  });

  it("uses a manufacturer reference only when no valid dealer quotes exist", () => {
    const manufacturer = webQuote("manufacturer-1", "maker", 150, {
      supplierType: "manufacturer"
    });

    const result = updatePrice([manufacturer], options);

    expect(result.price).toBe(150);
    expect(result.method).toBe("manufacturer-reference");
  });

  it("retains rejected quotes and returns an unavailable result if none qualify", () => {
    const inactivePool = poolQuote("pool-inactive", 80, false);

    const result = updatePrice([webQuote("wrong-product", "dealer-a", 100, {
      productId: "another-product"
    }), inactivePool], options);

    expect(result.price).toBeNull();
    expect(result.method).toBe("unavailable");
    expect(result.quoteEvaluations.map(({ reason }) => reason)).toEqual([
      "product-mismatch",
      "pool-not-active"
    ]);
  });

  it("rejects quotes when their conditions cannot be normalized", () => {
    const quote = webQuote("unknown-freight", "dealer-a", 100, {
      conditions: {
        includesVat: false,
        includesFreight: true,
        includesFinancing: false,
        includesAccessories: false
      }
    });

    const result = updatePrice([quote], options);

    expect(result.price).toBeNull();
    expect(result.quoteEvaluations[0].reason).toBe("missing-or-invalid-freight-amount");
  });
});
