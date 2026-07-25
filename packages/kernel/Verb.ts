/**
 * DAA Kernel
 * ------------------------------
 * Verbs define the semantic nature
 * of relationships between concepts.
 */

export const Verbs = {
  Gives: "gives",

  Guides: "guides",

  Creates: "creates",

  Defines: "defines",

  Enables: "enables",

  Organizes: "organizes",

  Generates: "generates",

  Reveals: "reveals",

  Preserves: "preserves",

  Emerges: "emerges"
} as const;

export type Verb =
  typeof Verbs[keyof typeof Verbs];