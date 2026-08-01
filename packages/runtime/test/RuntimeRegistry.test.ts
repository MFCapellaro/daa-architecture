import { describe, expect, it } from "vitest";

import { RuntimeRegistry } from "../RuntimeRegistry.js";

import type { RuntimeBoundary } from "../RuntimeBoundary.js";
import type { RuntimeSignal } from "../RuntimeSignal.js";
import type { RuntimeObservation } from "../RuntimeObservation.js";

describe("RuntimeRegistry", () => {

  it("registers runtime boundaries", () => {

    const registry = new RuntimeRegistry();

    const boundary: RuntimeBoundary = {
      id: "boundary",
      name: "Navigation Boundary",
      description: "Optimizes trajectory while preserving coherence."
    };

    registry.registerBoundary(boundary);

    expect(
      registry.getBoundary("boundary")
    ).toBe(boundary);

  });

  it("registers runtime signals", () => {

    const registry = new RuntimeRegistry();

    const signal: RuntimeSignal = {
      id: "signal",
      name: "Navigation Signal",
      description: "Reveals contextual conditions."
    };

    registry.registerSignal(signal);

    expect(
      registry.getSignal("signal")
    ).toBe(signal);

  });

  it("registers runtime observations", () => {

    const registry = new RuntimeRegistry();

    const observation: RuntimeObservation = {
      id: "observation",
      name: "Runtime Observation",
      description: "Recognizes runtime signals."
    };

    registry.registerObservation(observation);

    expect(
      registry.getObservation("observation")
    ).toBe(observation);

  });

  it("counts registered boundaries", () => {

    const registry = new RuntimeRegistry();

    registry.registerBoundary({
      id: "boundary",
      name: "Navigation Boundary",
      description: "Optimizes trajectory while preserving coherence."
    });

    expect(
      registry.boundariesCount
    ).toBe(1);

  });

  it("counts registered signals", () => {

    const registry = new RuntimeRegistry();

    registry.registerSignal({
      id: "signal",
      name: "Navigation Signal",
      description: "Reveals contextual conditions."
    });

    expect(
      registry.signalsCount
    ).toBe(1);

  });

  it("counts registered observations", () => {

    const registry = new RuntimeRegistry();

    registry.registerObservation({
      id: "observation",
      name: "Runtime Observation",
      description: "Recognizes runtime signals."
    });

    expect(
      registry.observationsCount
    ).toBe(1);

  });

});