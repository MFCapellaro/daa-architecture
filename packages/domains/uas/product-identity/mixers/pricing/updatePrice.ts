import type {
  PoolPriceQuote,
  ManualPriceQuote,
  PriceQuote,
  PriceQuoteConditions,
  PriceQuoteEvaluation,
  PriceUpdate,
  PriceUpdateOptions,
  WebPriceQuote
} from "./PriceUpdate.js";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const MAX_DEALER_QUOTES = 3;

function isValidDate(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function isValidSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function reject(reason: string): { reason: string } {
  return { reason };
}

function normalizeQuote(
  quote: PriceQuote,
  options: PriceUpdateOptions,
  asOfMilliseconds: number,
  maxAgeDays: number
): { normalizedUnitPrice: number; exchangeRate: number } | { reason: string } {
  if (quote.productId !== options.productId) return reject("product-mismatch");
  if (!quote.id.trim() || !quote.supplierId.trim()) return reject("missing-quote-or-supplier-id");
  if (!quote.supplierName.trim()) return reject("missing-supplier-name");
  if (!Number.isFinite(quote.unitPrice) || quote.unitPrice <= 0) return reject("invalid-unit-price");
  if (!/^[A-Z]{3}$/i.test(quote.currency)) return reject("invalid-currency");
  if (!isValidDate(quote.observedAt)) return reject("invalid-observation-date");
  if (quote.sourceType === "manual") {
    if (!quote.sourceReference.trim()) return reject("missing-source-reference");
  } else if (quote.sourceType === "pool" && !quote.sourceUrl && quote.sourceReference?.trim()) {
    // The Pool ID is the traceable source when no public offer URL exists.
  } else if (!quote.sourceUrl || !isValidSourceUrl(quote.sourceUrl)) {
    return reject("invalid-source-url");
  }

  const observedAt = Date.parse(quote.observedAt);
  if (observedAt > asOfMilliseconds) return reject("quote-from-future");
  if (asOfMilliseconds - observedAt > maxAgeDays * DAY_IN_MILLISECONDS) {
    return reject("quote-expired");
  }

  if (quote.sourceType === "pool") {
    if (!quote.active) return reject("pool-not-active");
    if (quote.validUntil !== undefined) {
      if (!isValidDate(quote.validUntil)) return reject("invalid-pool-expiration-date");
      if (Date.parse(quote.validUntil) < asOfMilliseconds) return reject("pool-expired");
    }
  }

  const conditions = getConditionAdjustment(quote.conditions);
  if (typeof conditions.reason === "string") return reject(conditions.reason);

  const currency = quote.currency.toUpperCase();
  const exchangeRate = currency === options.targetCurrency
    ? 1
    : options.exchangeRates[currency];
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return reject("missing-exchange-rate");

  const amountWithoutExtras = quote.unitPrice - conditions.extrasAmount;
  if (amountWithoutExtras <= 0) return reject("invalid-condition-adjustment");

  const taxExclusiveAmount = conditions.vatRatePercent !== undefined
    ? amountWithoutExtras / (1 + conditions.vatRatePercent / 100)
    : amountWithoutExtras;
  const convertedAmount = taxExclusiveAmount * exchangeRate;

  return {
    normalizedUnitPrice: Math.round((convertedAmount + Number.EPSILON) * 100) / 100,
    exchangeRate
  };
}

function getConditionAdjustment(
  conditions: PriceQuoteConditions
): { extrasAmount: number; vatRatePercent?: number; reason?: never } |
  { extrasAmount: 0; reason: string } {
  let extrasAmount = 0;
  let vatRatePercent: number | undefined;
  const declaredAmounts: [boolean, number | undefined, string][] = [
    [conditions.includesFreight, conditions.freightAmount, "freight"],
    [conditions.includesFinancing, conditions.financingAmount, "financing"],
    [conditions.includesAccessories, conditions.accessoriesAmount, "accessories"]
  ];

  for (const [included, amount, name] of declaredAmounts) {
    if (!included && amount !== undefined) {
      return { extrasAmount: 0, reason: `unexpected-${name}-amount` };
    }
    if (included) {
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
        return { extrasAmount: 0, reason: `missing-or-invalid-${name}-amount` };
      }
      extrasAmount += amount;
    }
  }

  if (conditions.includesVat) {
    const vatRate = conditions.vatRatePercent;
    if (typeof vatRate !== "number" || !Number.isFinite(vatRate) ||
      vatRate < 0 || vatRate >= 100) {
      return { extrasAmount: 0, reason: "missing-or-invalid-vat-rate" };
    }
    vatRatePercent = vatRate;
  } else if (conditions.vatRatePercent !== undefined) {
    return { extrasAmount: 0, reason: "unexpected-vat-rate" };
  }

  return { extrasAmount, vatRatePercent };
}

function byNewestQuote(left: PriceQuote, right: PriceQuote): number {
  return Date.parse(right.observedAt) - Date.parse(left.observedAt) ||
    left.id.localeCompare(right.id);
}

function selectQuotes(evaluations: PriceQuoteEvaluation[]): {
  selected: PriceQuoteEvaluation[];
  method: PriceUpdate["method"];
} {
  const valid = evaluations.filter((evaluation) => evaluation.status === "valid");
  const activePoolQuotes = valid
    .filter((evaluation): evaluation is PriceQuoteEvaluation & { quote: PoolPriceQuote } =>
      evaluation.quote.sourceType === "pool")
    .sort((left, right) => byNewestQuote(left.quote, right.quote));

  if (activePoolQuotes.length > 0) {
    return { selected: [activePoolQuotes[0]], method: "active-pool" };
  }

  const latestPerDealer = new Map<string, PriceQuoteEvaluation>();
  const dealers = valid
    .filter((evaluation): evaluation is PriceQuoteEvaluation & {
      quote: WebPriceQuote | ManualPriceQuote;
    } =>
      evaluation.quote.sourceType !== "pool" && evaluation.quote.supplierType === "dealer")
    .sort((left, right) => byNewestQuote(left.quote, right.quote));

  for (const evaluation of dealers) {
    if (!latestPerDealer.has(evaluation.quote.supplierId)) {
      latestPerDealer.set(evaluation.quote.supplierId, evaluation);
    }
  }

  const selectedDealers = [...latestPerDealer.values()].slice(0, MAX_DEALER_QUOTES);
  if (selectedDealers.length > 0) {
    return { selected: selectedDealers, method: "dealer-average" };
  }

  const manufacturer = valid
    .filter((evaluation): evaluation is PriceQuoteEvaluation & {
      quote: WebPriceQuote | ManualPriceQuote;
    } =>
      evaluation.quote.sourceType !== "pool" && evaluation.quote.supplierType === "manufacturer")
    .sort((left, right) => byNewestQuote(left.quote, right.quote))[0];

  return manufacturer
    ? { selected: [manufacturer], method: "manufacturer-reference" }
    : { selected: [], method: "unavailable" };
}

export function updatePrice(
  quotes: PriceQuote[],
  options: PriceUpdateOptions
): PriceUpdate {
  if (!options.productId.trim()) throw new Error("productId must not be empty");
  if (!/^[A-Z]{3}$/i.test(options.targetCurrency)) {
    throw new Error("targetCurrency must be a three-letter currency code");
  }
  if (!isValidDate(options.asOf)) throw new Error("asOf must be a valid date");

  const targetCurrency = options.targetCurrency.toUpperCase();
  const exchangeRates = Object.fromEntries(
    Object.entries(options.exchangeRates).map(([currency, rate]) => [currency.toUpperCase(), rate]),
  );
  const normalizedOptions = { ...options, targetCurrency, exchangeRates };
  const asOfMilliseconds = Date.parse(options.asOf);
  const maxAgeDays = options.maxQuoteAgeDays ?? 30;
  if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) {
    throw new Error("maxQuoteAgeDays must be a non-negative number");
  }

  const evaluations: PriceQuoteEvaluation[] = quotes.map((quote) => {
    const result = normalizeQuote(quote, normalizedOptions, asOfMilliseconds, maxAgeDays);
    return "reason" in result
      ? { quote, status: "rejected", reason: result.reason }
      : {
          quote,
          status: "valid",
          normalizedUnitPrice: result.normalizedUnitPrice,
          exchangeRate: result.exchangeRate
        };
  });

  const { selected, method } = selectQuotes(evaluations);
  for (const evaluation of selected) evaluation.status = "selected";

  const average = selected.length === 0
    ? null
    : selected.reduce((total, evaluation) => total + (evaluation.normalizedUnitPrice ?? 0), 0) /
      selected.length;

  return {
    productId: options.productId,
    updatedAt: options.asOf,
    currency: targetCurrency,
    price: average === null ? null : Math.round((average + Number.EPSILON) * 100) / 100,
    method,
    quoteIds: selected.map((evaluation) => evaluation.quote.id),
    quoteEvaluations: evaluations
  };
}
