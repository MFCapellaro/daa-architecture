import { describe, expect, it } from "vitest"

import type {
  Publisher,
  PublicationResult,
} from "./Publication.js"

describe("Publication", () => {
  it("publishes an approved record immediately", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const publisher: Publisher<typeof value> = {
      publish: async ({
        value,
      }): Promise<PublicationResult<typeof value>> => ({
        value,
        status: "published",
        published: true,
      }),
    }

    const result = await publisher.publish({
      value,
    })

    expect(result.status).toBe("published")
    expect(result.published).toBe(true)
    expect(result.value).toEqual(value)
  })

  it("programs an approved record for a selected publication date", async () => {
    const value = {
      id: "example",
      name: "Example",
    }

    const publicationDate = new Date(
      "2026-09-15T00:00:00.000Z",
    )

    const publisher: Publisher<typeof value> = {
      publish: async ({
        value,
      }): Promise<PublicationResult<typeof value>> => ({
        value,
        status: "programmed",
        published: false,
        publicationDate,
      }),
    }

    const result = await publisher.publish({
      value,
    })

    expect(result.status).toBe("programmed")
    expect(result.published).toBe(false)
    expect(result.publicationDate).toEqual(
      publicationDate,
    )
    expect(result.value).toEqual(value)
  })
})
