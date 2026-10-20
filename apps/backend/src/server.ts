import { createApp } from "./app.js";
import { PoolStore } from "./services/PoolStore.js";

const PORT = process.env.PORT || 3000;
const poolStore = new PoolStore();
const app = createApp(undefined, undefined, undefined, poolStore);
const expirationTimer = setInterval(() => {
  void poolStore.list().catch((error: unknown) => {
    console.error("Failed to process expired pools.", error);
  });
}, 15_000);
expirationTimer.unref();
void poolStore.list().catch((error: unknown) => {
  console.error("Failed to process expired pools during startup.", error);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
