import { describe, expect, it } from "vitest";
import {
  BNA_EXCHANGE_RATE_URL,
  parseBnaUsdArsExchangeRate,
} from "../src/services/BnaExchangeRate.js";

describe("BNA exchange rate", () => {
  it("extracts the USD selling rate and effective date from the official table", () => {
    const html = `
      <table>
        <tr><th>4/11/2026</th><th>Compra</th><th>Venta</th></tr>
        <tr><td>Dolar U.S.A</td><td>1.520,00</td><td>1.570,00</td></tr>
      </table>
    `;

    expect(parseBnaUsdArsExchangeRate(html, new Date("2026-11-04T18:20:00.000Z"))).toEqual({
      baseCurrency: "USD",
      quoteCurrency: "ARS",
      rate: 1570,
      effectiveDate: "2026-11-04",
      fetchedAt: "2026-11-04T18:20:00.000Z",
      source: BNA_EXCHANGE_RATE_URL,
    });
  });

  it("fails explicitly when the BNA page has no USD sell quote", () => {
    expect(() => parseBnaUsdArsExchangeRate("<table><tr><td>Euro</td><td>1800</td></tr></table>"))
      .toThrow("No se encontró la cotización del dólar estadounidense");
  });
});
