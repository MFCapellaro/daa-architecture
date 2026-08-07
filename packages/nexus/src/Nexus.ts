import type { NexusIdentity } from "./NexusIdentity.js";
import type { NexusResponsibility } from "./NexusResponsibility.js";

export interface Nexus {
  readonly identity: NexusIdentity;
  readonly responsibility: NexusResponsibility;
}