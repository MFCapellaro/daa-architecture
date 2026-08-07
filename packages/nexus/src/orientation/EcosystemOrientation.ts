/**
 * DAA Nexus
 * ------------------------------
 * Ecosystem Orientation
 *
 * Orientation relates recognized
 * trajectories to coherent horizons,
 * enabling movement toward possible futures.
 *
 * It does not impose direction.
 *
 * It reveals meaningful directions
 * already latent within the ecosystem.
 */

import type { KernelConcept } from "../../../kernel/KernelConcept.js";

export interface EcosystemOrientation {

  readonly horizon: KernelConcept;

  readonly purpose: KernelConcept;

  readonly coherent: boolean;

}