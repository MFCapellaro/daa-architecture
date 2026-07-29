import { describe, expect, it } from "vitest";
import type { UAV } from "../src/UAV.js";

describe("UAV Domain", () => {

  it("represents an operational system", () => {

    const uav: UAV = {
      system: {
        id: "agrass-t50",
        identity: {
          manufacturer: "DJI",
          model: "AGRAS T50",
          category: "agricultural"
        }
      },

      operational: true
    };

    expect(uav.operational).toBe(true);
    expect(uav.system.identity.model)
      .toBe("AGRAS T50");

  });

});