export const BNA_EXCHANGE_RATE_URL = "https://www.bna.com.ar/Personas";

export interface BnaUsdArsExchangeRate {
  baseCurrency: "USD";
  quoteCurrency: "ARS";
  rate: number;
  effectiveDate: string;
  fetchedAt: string;
  source: typeof BNA_EXCHANGE_RATE_URL;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'");
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^\d.,-]/g, "");
  const commaIndex = cleaned.lastIndexOf(",");
  const dotIndex = cleaned.lastIndexOf(".");
  const normalized = commaIndex >= 0 && dotIndex >= 0
    ? commaIndex > dotIndex
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "")
    : commaIndex >= 0
      ? cleaned.replace(",", ".")
      : cleaned;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function parseBnaUsdArsExchangeRate(html: string, fetchedAt = new Date()): BnaUsdArsExchangeRate {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const dollarRow = rows.find(([, row]) => {
    const text = decodeHtml(row.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
    return /d[oó]lar\s+u\.?s\.?a\.?/i.test(text);
  });
  if (!dollarRow || dollarRow.index === undefined) {
    throw new Error("No se encontró la cotización del dólar estadounidense en el sitio del BNA.");
  }

  const cells = [...dollarRow[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
    .map(([, cell]) => decodeHtml(cell.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim());
  const sellRate = parseAmount(cells[cells.length - 1] ?? "");
  if (sellRate === null) {
    throw new Error("El sitio del BNA no publicó un valor de venta válido para el dólar.");
  }

  const precedingHtml = html.slice(0, dollarRow.index);
  const dates = [...precedingHtml.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)];
  const date = dates.at(-1);
  if (!date) {
    throw new Error("No se pudo determinar la fecha de vigencia de la cotización publicada por el BNA.");
  }
  const [, day, month, year] = date;
  const effectiveDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsedDate = new Date(`${effectiveDate}T00:00:00-03:00`);
  if (!Number.isFinite(parsedDate.getTime())) {
    throw new Error("El sitio del BNA publicó una fecha de cotización inválida.");
  }

  return {
    baseCurrency: "USD",
    quoteCurrency: "ARS",
    rate: sellRate,
    effectiveDate,
    fetchedAt: fetchedAt.toISOString(),
    source: BNA_EXCHANGE_RATE_URL,
  };
}

export async function fetchBnaUsdArsExchangeRate(): Promise<BnaUsdArsExchangeRate> {
  const response = await fetch(BNA_EXCHANGE_RATE_URL, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`El sitio del BNA respondió ${response.status} al consultar la cotización.`);
  }
  return parseBnaUsdArsExchangeRate(await response.text());
}
