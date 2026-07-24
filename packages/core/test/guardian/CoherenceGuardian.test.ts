import { describe, expect, it } from "vitest"
import type { CoherenceGuardian } from "../../guardian/src/CoherenceGuardian.js"
import type { Possibility } from "../../src/triads/Possibility.js"
import type { Coherence } from "../../src/triads/Coherence.js"

describe("CoherenceGuardian", () => {
  it("aligns possibilities with coherence", () => {
    const possibility: Possibility = {
      potential: "system identity extension"
    }

    const coherence: Coherence = {
      identity: "system identity"
    }

    const guardian: CoherenceGuardian = {
      align: (possibility, coherence) =>
        possibility.potential.includes(coherence.identity)
    }

    expect(
      guardian.align(possibility, coherence)
    ).toBe(true)
  })

  it("rejects possibilities that break identity", () => {
    const possibility: Possibility = {
      potential: "replace existing identity"
    }

    const coherence: Coherence = {
      identity: "system identity"
    }

    const guardian: CoherenceGuardian = {
      align: (possibility, coherence) =>
        possibility.potential.includes(coherence.identity)
    }

    expect(
      guardian.align(possibility, coherence)
    ).toBe(false)
  })
})