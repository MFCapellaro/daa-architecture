export type ReviewDecision =
  | "hold"
  | "waiting"
  | "merge"
  | "no_merge"
  | "approved"

export interface ReviewContext {
  source?: string
  actor?: string
}

export interface ReviewInput<T> {
  value: T
  duplicate: boolean
  context?: ReviewContext
}

export interface ReviewResult<T> {
  value: T
  decision: ReviewDecision
  context: ReviewContext
}

export interface Reviewer<T> {
  review(
    input: ReviewInput<T>,
  ): Promise<ReviewResult<T>>
}