import { describe, expect, it } from "vitest";
import { loadCatalog, recommend } from "../src/catalog.js";
import type { Mission } from "../../../packages/configuration/entities/Mission.js";

const mission: Mission = {
  id: "spraying-demo",
  name: "Aplicación de lote",
  type: "application",
  objective: "Aplicar fitosanitario con precisión",
  requirements: { requiredCapabilities: ["liquid_payload"] }
};

describe("UAS catalog", () => {
  it("loads normalized UAV systems from the repository data", async () => {
    const catalog = await loadCatalog("data/uav");
    expect(catalog).toHaveLength(3);
    expect(catalog.find((item) => item.identity.model === "AGRAS T50")?.payload?.liquid?.capacity).toBe(40);
  });

  it("explains recommendations for a mission", async () => {
    const recommendations = recommend(await loadCatalog("data/uav"), mission);
    expect(recommendations[0]?.score).toBeGreaterThan(0);
    expect(recommendations[0]?.reasons.join(" ")).toContain("capacidad líquida");
  });
});