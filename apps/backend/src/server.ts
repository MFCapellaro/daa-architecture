import { createApp } from "./app.js";
import { fetchBnaUsdArsExchangeRate } from "./services/BnaExchangeRate.js";
import { PoolStore } from "./services/PoolStore.js";
import { SupplierPriceAutomation } from "./services/SupplierPriceAutomation.js";
import { SupplierStore } from "./services/SupplierStore.js";

const PORT = process.env.PORT || 3000;
const poolStore = new PoolStore();
const supplierStore = new SupplierStore();
const getExchangeRate = fetchBnaUsdArsExchangeRate;
const app = createApp(
  undefined,
  undefined,
  undefined,
  poolStore,
  undefined,
  undefined,
  supplierStore,
  getExchangeRate,
);
const supplierPriceAutomation = new SupplierPriceAutomation(supplierStore, poolStore, getExchangeRate);
const expirationTimer = setInterval(() => {
  void poolStore.list().catch((error: unknown) => {
    console.error("Failed to process expired pools.", error);
  });
}, 15_000);
expirationTimer.unref();
supplierPriceAutomation.start();
void poolStore.list().catch((error: unknown) => {
  console.error("Failed to process expired pools during startup.", error);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
