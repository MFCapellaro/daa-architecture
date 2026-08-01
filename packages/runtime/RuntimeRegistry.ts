/**
 * DAA Runtime
 * ------------------------------
 * Runtime Registry
 *
 * Runtime Registry preserves the coherent
 * navigation elements available during execution.
 */

import type { RuntimeBoundary } from "./RuntimeBoundary.js";
import type { RuntimeSignal } from "./RuntimeSignal.js";
import type { RuntimeObservation } from "./RuntimeObservation.js";

export class RuntimeRegistry {

  private readonly boundaries = new Map<string, RuntimeBoundary>();

  private readonly signals = new Map<string, RuntimeSignal>();

  private readonly observations = new Map<string, RuntimeObservation>();

  registerBoundary(boundary: RuntimeBoundary): void {
    this.boundaries.set(boundary.id, boundary);
  }

  registerSignal(signal: RuntimeSignal): void {
    this.signals.set(signal.id, signal);
  }

  registerObservation(observation: RuntimeObservation): void {
    this.observations.set(observation.id, observation);
  }

  getBoundary(id: string): RuntimeBoundary | undefined {
    return this.boundaries.get(id);
  }

  getSignal(id: string): RuntimeSignal | undefined {
    return this.signals.get(id);
  }

  getObservation(id: string): RuntimeObservation | undefined {
    return this.observations.get(id);
  }

  get boundariesCount(): number {
    return this.boundaries.size;
  }

  get signalsCount(): number {
    return this.signals.size;
  }

  get observationsCount(): number {
    return this.observations.size;
  }

}