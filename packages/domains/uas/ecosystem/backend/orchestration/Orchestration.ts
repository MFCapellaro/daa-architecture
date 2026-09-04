/**
 * DRONSAIR ecosystem orchestration.
 *
 * Responsibility:
 *
 *   Coordinate the progression of ecosystem records
 *   through the domain precedences.
 *
 * Flow:
 *
 *   RAW
 *     ↓
 *   NORMALIZE
 *     ↓
 *   IDENTITY
 *     ├── insufficient → HOLD
 *     │
 *     └── sufficient
 *           ↓
 *       DUPLICATE FILTER
 *           ↓
 *         REVIEW
 *           ↓
 *       PUBLICATION
 *           ↓
 *      MAP / DIRECTORY
 *
 * A duplicate may result in:
 *
 *   - merge;
 *   - no merge when the new record adds no information;
 *   - waiting when the relationship remains uncertain.
 *
 * Source records are always preserved.
 *
 * Orchestration does not:
 *
 *   - define identity;
 *   - perform normalization;
 *   - perform duplicate evaluation;
 *   - resolve review decisions;
 *   - perform merges;
 *   - perform publication;
 *   - modify source evidence;
 *   - define representation.
 */

import type { Reviewer } from "../review/Review.js"
import type {
  Publisher,
  PublicationInput,
  PublicationResult,
} from "../publication/Publication.js"

export type OrchestrationStatus =
  | "hold"
  | "waiting"
  | "programmed"
  | "published"
  | "archived"

export type IdentityOutcome =
  | "unknown"
  | "candidate"
  | "confirmed"

export interface OrchestrationContext {
  source?: string
  actor?: string
}

export interface OrchestrationInput<T> {
  value: T
  context?: OrchestrationContext
}

export interface OrchestrationResult<T> {
  value: T
  status: OrchestrationStatus
  context: OrchestrationContext
}

export interface Normalizer<T, R> {
  normalize(
    value: T,
    context: OrchestrationContext,
  ): Promise<R>
}

export interface IdentityResolver<T> {
  resolve(
    value: T,
    context: OrchestrationContext,
  ): Promise<IdentityOutcome>
}

export interface DuplicateEvaluator<T> {
  evaluate(
    value: T,
    context: OrchestrationContext,
  ): Promise<boolean>
}

export interface Merger<T> {
  merge(
    value: T,
    context: OrchestrationContext,
  ): Promise<T>
}

export class Orchestration<T, R> {
  constructor(
    private readonly normalizer: Normalizer<T, R>,
    private readonly identity: IdentityResolver<R>,
    private readonly duplicateEvaluator: DuplicateEvaluator<R>,
    private readonly reviewer: Reviewer<R>,
    private readonly merger: Merger<R>,
    private readonly publisher: Publisher<R>,
  ) {}

  async execute(
    input: OrchestrationInput<T>,
  ): Promise<OrchestrationResult<R>> {
    const context = input.context ?? {}

    const normalized =
      await this.normalizer.normalize(
        input.value,
        context,
      )

    const identity =
      await this.identity.resolve(
        normalized,
        context,
      )

    if (identity === "unknown") {
      return {
        value: normalized,
        status: "hold",
        context,
      }
    }

    const duplicate =
      await this.duplicateEvaluator.evaluate(
        normalized,
        context,
      )

    const review =
      await this.reviewer.review({
        value: normalized,
        duplicate,
        context,
      })

    if (
      review.decision === "hold" ||
      review.decision === "waiting"
    ) {
      return {
        value: review.value,
        status: review.decision,
        context,
      }
    }

    const value =
      review.decision === "merge"
        ? await this.merger.merge(
            review.value,
            context,
          )
        : review.value

    const publicationInput: PublicationInput<R> = {
      value,
    }

    const publication: PublicationResult<R> =
      await this.publisher.publish(
        publicationInput,
      )

    return {
      value: publication.value,
      status: publication.status,
      context,
    }
  }
}
