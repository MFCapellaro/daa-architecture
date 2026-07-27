/**
 * DAA Kernel
 * ------------------------------
 * GuardianRegistry
 *
 * Maintains the collection of
 * available coherence guardians.
 */

import type { Guardian } from "./Guardian.js";


export class GuardianRegistry {

  private readonly guardians:
    Map<string, Guardian<unknown>>;


  constructor() {

    this.guardians = new Map();

  }


  register<T>(
    guardian: Guardian<T>
  ): void {

    this.guardians.set(
      guardian.name,
      guardian as Guardian<unknown>
    );

  }


  get(
    name: string
  ): Guardian<unknown> | undefined {

    return this.guardians.get(name);

  }


  list(): readonly string[] {

    return [
      ...this.guardians.keys()
    ];

  }

}