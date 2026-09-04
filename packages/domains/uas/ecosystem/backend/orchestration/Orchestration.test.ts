import { describe, expect, it, vi } from "vitest"

import {
  Orchestration,
  type Normalizer,
  type IdentityResolver,
  type DuplicateEvaluator,
  type Merger,
} from "./Orchestration.js"

import type { Reviewer } from "../review/Review.js"
import type { Publisher } from "../publication/Publication.js"

describe("Orchestration", () => {
  it("holds a record when identity is unknown", async () => {
    const normalized = {
      id: "example",
      name: "Example",
    }

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("unknown"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn(),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn(),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn(),
    }

    const publisher: Publisher<typeof normalized> = {
      publish: vi.fn(),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher,
    )

    const result = await orchestration.execute({
      value: "raw record",
    })

    expect(result.status).toBe("hold")
    expect(result.value).toEqual(normalized)

    expect(normalizer.normalize).toHaveBeenCalledOnce()
    expect(identity.resolve).toHaveBeenCalledOnce()

    expect(
      duplicateEvaluator.evaluate,
    ).not.toHaveBeenCalled()

    expect(reviewer.review).not.toHaveBeenCalled()
    expect(merger.merge).not.toHaveBeenCalled()
    expect(publisher.publish).not.toHaveBeenCalled()
  })

  it("waits when review remains uncertain", async () => {
    const normalized = {
      id: "example",
      name: "Example",
    }

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("candidate"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn().mockResolvedValue(true),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn().mockResolvedValue({
        value: normalized,
        decision: "waiting",
        context: {},
      }),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn(),
    }

    const publisher: Publisher<typeof normalized> = {
      publish: vi.fn(),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher,
    )

    const result = await orchestration.execute({
      value: "raw record",
    })

    expect(result.status).toBe("waiting")
    expect(result.value).toEqual(normalized)

    expect(normalizer.normalize).toHaveBeenCalledOnce()
    expect(identity.resolve).toHaveBeenCalledOnce()

    expect(
      duplicateEvaluator.evaluate,
    ).toHaveBeenCalledOnce()

    expect(reviewer.review).toHaveBeenCalledOnce()
    expect(reviewer.review).toHaveBeenCalledWith({
      value: normalized,
      duplicate: true,
      context: {},
    })

    expect(merger.merge).not.toHaveBeenCalled()
    expect(publisher.publish).not.toHaveBeenCalled()
  })

  it("publishes a candidate when no duplicate is found", async () => {
    const normalized = {
      id: "example",
      name: "Example",
    }

    const published = {
      ...normalized,
      published: true,
    }

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("candidate"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn().mockResolvedValue(false),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn().mockResolvedValue({
        value: normalized,
        decision: "approved",
        context: {},
      }),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn(),
    }

    const publisher: Publisher<typeof normalized> = {
      publish: vi.fn().mockResolvedValue({
        value: published,
        status: "published",
        published: true,
      }),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher,
    )

    const result = await orchestration.execute({
      value: "raw record",
    })

    expect(result.status).toBe("published")
    expect(result.value).toEqual(published)

    expect(normalizer.normalize).toHaveBeenCalledOnce()
    expect(identity.resolve).toHaveBeenCalledOnce()
    expect(
      duplicateEvaluator.evaluate,
    ).toHaveBeenCalledOnce()

    expect(reviewer.review).toHaveBeenCalledOnce()
    expect(reviewer.review).toHaveBeenCalledWith({
      value: normalized,
      duplicate: false,
      context: {},
    })

    expect(merger.merge).not.toHaveBeenCalled()

    expect(publisher.publish).toHaveBeenCalledOnce()
    expect(publisher.publish).toHaveBeenCalledWith({
      value: normalized,
    })
  })

  it("merges and publishes when review confirms a duplicate", async () => {
    const normalized = {
      id: "example",
      name: "Example",
    }

    const merged = {
      id: "example",
      name: "Example",
      layers: [
        "drones",
        "technology",
      ],
    }

    const published = {
      ...merged,
      published: true,
    }

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("candidate"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn().mockResolvedValue(true),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn().mockResolvedValue({
        value: normalized,
        decision: "merge",
        context: {},
      }),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn().mockResolvedValue(merged),
    }

    const publisher: Publisher<typeof merged> = {
      publish: vi.fn().mockResolvedValue({
        value: published,
        status: "published",
        published: true,
      }),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher,
    )

    const result = await orchestration.execute({
      value: "raw record",
    })

    expect(result.status).toBe("published")
    expect(result.value).toEqual(published)

    expect(
      duplicateEvaluator.evaluate,
    ).toHaveBeenCalledOnce()

    expect(reviewer.review).toHaveBeenCalledOnce()
    expect(reviewer.review).toHaveBeenCalledWith({
      value: normalized,
      duplicate: true,
      context: {},
    })

    expect(merger.merge).toHaveBeenCalledOnce()
    expect(merger.merge).toHaveBeenCalledWith(
      normalized,
      {},
    )

    expect(publisher.publish).toHaveBeenCalledOnce()
    expect(publisher.publish).toHaveBeenCalledWith({
      value: merged,
    })
  })

  it("returns programmed when publication schedules an approved record", async () => {
    const normalized = {
      id: "example",
      name: "Example",
    }

    const publicationDate = new Date(
      "2026-09-15T00:00:00.000Z",
    )

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("candidate"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn().mockResolvedValue(false),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn().mockResolvedValue({
        value: normalized,
        decision: "approved",
        context: {},
      }),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn(),
    }

    const publisher: Publisher<typeof normalized> = {
      publish: vi.fn().mockResolvedValue({
        value: normalized,
        status: "programmed",
        published: false,
       publicationDate,
      }),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher,
    )

    const result = await orchestration.execute({
      value: "raw record",
      })

      expect(result.status).toBe("programmed")
      expect(result.value).toEqual(normalized)

      expect(publisher.publish).toHaveBeenCalledOnce()

      expect(publisher.publish).toHaveBeenCalledWith({
        value: normalized,
      })

      expect(merger.merge).not.toHaveBeenCalled()
    })

  it("holds a record when review requires confirmation", async () => {
    const normalized = {
      id: "example",
      name: "Example",
      }

    const normalizer: Normalizer<
      string,
      typeof normalized
    > = {
      normalize: vi.fn().mockResolvedValue(normalized),
    }

    const identity: IdentityResolver<
      typeof normalized
    > = {
      resolve: vi.fn().mockResolvedValue("candidate"),
    }

    const duplicateEvaluator: DuplicateEvaluator<
      typeof normalized
    > = {
      evaluate: vi.fn().mockResolvedValue(false),
    }

    const reviewer: Reviewer<typeof normalized> = {
      review: vi.fn().mockResolvedValue({
        value: normalized,
        decision: "hold",
        context: {},
      }),
    }

    const merger: Merger<typeof normalized> = {
      merge: vi.fn(),
    }

    const publisher: Publisher<typeof normalized> = {
      publish: vi.fn(),
    }

    const orchestration = new Orchestration(
      normalizer,
      identity,
      duplicateEvaluator,
      reviewer,
      merger,
      publisher
    )

    const result = await orchestration.execute({
      value: "raw record",
    })

    expect(result.status).toBe("hold")
    expect(result.value).toEqual(normalized)

    expect(normalizer.normalize).toHaveBeenCalledOnce()
    expect(identity.resolve).toHaveBeenCalledOnce()
    expect(
      duplicateEvaluator.evaluate,
    ).toHaveBeenCalledOnce()

    expect(reviewer.review).toHaveBeenCalledOnce()
    expect(reviewer.review).toHaveBeenCalledWith({
      value: normalized,
      duplicate: false,
      context: {},
    })

    expect(merger.merge).not.toHaveBeenCalled()
    expect(publisher.publish).not.toHaveBeenCalled()
  })

})
