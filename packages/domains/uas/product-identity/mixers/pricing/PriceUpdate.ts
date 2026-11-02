export type PriceQuoteConditions = {
  includesVat: boolean;
  vatRatePercent?: number;
  includesFreight: boolean;
  freightAmount?: number;
  includesFinancing: boolean;
  financingAmount?: number;
  includesAccessories: boolean;
  accessoriesAmount?: number;
};

type QuoteBase = {
  id: string;
  productId: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  currency: string;
  observedAt: string;
  sourceUrl?: string;
  sourceReference?: string;
  conditions: PriceQuoteConditions;
};

export type WebPriceQuote = QuoteBase & {
  sourceType: "web";
  supplierType: "dealer" | "manufacturer";
};

export type ManualPriceQuote = QuoteBase & {
  sourceType: "manual";
  supplierType: "dealer" | "manufacturer";
  sourceReference: string;
};

export type PoolPriceQuote = QuoteBase & {
  sourceType: "pool";
  active: boolean;
  validUntil?: string;
};

export type PriceQuote = WebPriceQuote | ManualPriceQuote | PoolPriceQuote;

export type PriceQuoteEvaluation = {
  quote: PriceQuote;
  status: "selected" | "valid" | "rejected";
  normalizedUnitPrice?: number;
  exchangeRate?: number;
  reason?: string;
};

export type PriceUpdate = {
  productId: string;
  updatedAt: string;
  currency: string;
  price: number | null;
  method: "active-pool" | "dealer-average" | "manufacturer-reference" | "unavailable";
  quoteIds: string[];
  quoteEvaluations: PriceQuoteEvaluation[];
};

export type PriceUpdateOptions = {
  productId: string;
  targetCurrency: string;
  asOf: string;
  exchangeRates: Record<string, number>;
  maxQuoteAgeDays?: number;
};
