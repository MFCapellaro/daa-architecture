import { describe, expect, it } from "vitest"

import type {
  Reviewer,
  ReviewResult,
} from "./Review.js"

describe("Review", () => {
  it("preserves a record when review decides waiting", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const reviewer: Reviewer<typeof value> = {
      review: async ({
        value,
        duplicate,
      }): Promise<ReviewResult<typeof value>> => ({
        value,
        decision: duplicate ? "waiting" : "approved",
        context: {},
      }),
    }

    const result = await reviewer.review({
      value,
      duplicate: true,
    })

    expect(result.decision).toBe("waiting")
    expect(result.value).toEqual(value)
  })

  it("approves a merge when review confirms duplicate records", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const reviewer: Reviewer<typeof value> = {
      review: async () => ({
        value,
        decision: "merge",
        context: {},
      }),
    }

    const result = await reviewer.review({
      value,
      duplicate: true,
    })

    expect(result.decision).toBe("merge")
    expect(result.value).toEqual(value)
  })

  it("rejects a merge when the duplicate adds no new information", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const reviewer: Reviewer<typeof value> = {
      review: async () => ({
        value,
        decision: "no_merge",
        context: {},
      }),
    }

    const result = await reviewer.review({
      value,
      duplicate: true,
    })

    expect(result.decision).toBe("no_merge")
    expect(result.value).toEqual(value)
  })

  it("holds a record when required information is missing", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const reviewer: Reviewer<typeof value> = {
      review: async () => ({
        value,
        decision: "hold",
        context: {},
      }),
    }

    const result = await reviewer.review({
      value,
      duplicate: false,
    })

    expect(result.decision).toBe("hold")
    expect(result.value).toEqual(value)
  })

  it("approves a record when review is complete", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const reviewer: Reviewer<typeof value> = {
      review: async () => ({
        value,
        decision: "approved",
        context: {},
      }),
    }

    const result = await reviewer.review({
      value,
      duplicate: false,
    })

    expect(result.decision).toBe("approved")
    expect(result.value).toEqual(value)
  })
})