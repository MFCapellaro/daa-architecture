/**
 * Function
 *
 * Represents a stable operational meaning discerned from evidence
 * within an operational context.
 *
 * Function is the semantic identity of an operational role.
 *
 * Functional Discernment establishes the interpretation.
 * Function preserves the resulting operational meaning.
 */

export interface Function {
  /**
   * Unique function identifier.
   */
  readonly id: string;

  /**
   * Stable semantic name of the function.
   */
  readonly name: string;

  /**
   * Definition of the operational role.
   */
  readonly definition: string;

  /**
   * Operational context in which the function applies.
   */
  readonly context: string;

  /**
   * Functional discernment from which the function emerged.
   */
  readonly discernmentId: string;
}

/**
 * Creates a Function from a functional discernment.
 *
 * The function preserves the discernment as its immediate origin.
 */
export function createFunction(
  id: string,
  name: string,
  definition: string,
  context: string,
  discernmentId: string,
): Function {
  if (!id.trim()) {
    throw new Error("Function id cannot be empty.");
  }

  if (!name.trim()) {
    throw new Error("Function name cannot be empty.");
  }

  if (!definition.trim()) {
    throw new Error("Function definition cannot be empty.");
  }

  if (!context.trim()) {
    throw new Error("Function context cannot be empty.");
  }

  if (!discernmentId.trim()) {
    throw new Error("Function discernmentId cannot be empty.");
  }

  return {
    id,
    name,
    definition,
    context,
    discernmentId,
  };
}