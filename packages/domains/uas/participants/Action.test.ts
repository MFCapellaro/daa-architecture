import { describe, expect, it } from "vitest";

import type {
  Action,
  ActionTargetType,
  ActionType,
} from "./src/Action.js";

describe("Action", () => {
  it("records the participant who performed the action", () => {
    const action: Action = {
      id: "action-001",
      participantId: "participant-001",
      type: "submit_actor",
      targetType: "actor",
      targetId: "actor-001",
      occurredAt: new Date("2026-09-03T12:00:00.000Z"),
    };

    expect(action.participantId).toBe("participant-001");
  });

  it("records the action type", () => {
    const type: ActionType = "submit_problem";

    expect(type).toBe("submit_problem");
  });

  it("records the target type", () => {
    const targetType: ActionTargetType = "problem";

    expect(targetType).toBe("problem");
  });

  it("records the target identifier", () => {
    const action: Action = {
      id: "action-002",
      participantId: "participant-001",
      type: "submit_solution",
      targetType: "solution",
      targetId: "solution-001",
      occurredAt: new Date("2026-09-03T12:00:00.000Z"),
    };

    expect(action.targetId).toBe("solution-001");
  });

  it("records when the action occurred", () => {
    const occurredAt = new Date("2026-09-03T12:00:00.000Z");

    const action: Action = {
      id: "action-003",
      participantId: "participant-001",
      type: "request_pool",
      targetType: "pool",
      targetId: "pool-001",
      occurredAt,
    };

    expect(action.occurredAt).toBe(occurredAt);
  });
});