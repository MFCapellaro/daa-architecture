/**
 * DAA Runtime
 * ------------------------------
 * Runtime is the coherent execution environment
 * where architectural capabilities become
 * observable through system behavior.
 */

export interface Runtime {

  readonly id: string;

  readonly name: string;

  readonly capabilities: readonly string[];

}