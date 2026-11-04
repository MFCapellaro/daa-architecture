import { describe, expect, it } from "vitest";
import { toDateTimeLocalInput } from "./supplierDateTime";

describe("toDateTimeLocalInput", () => {
  it("round-trips the current instant through a datetime-local field", () => {
    const instant = new Date("2026-11-04T18:59:00.000Z");
    expect(new Date(toDateTimeLocalInput(instant)).getTime()).toBe(instant.getTime());
  });
});
