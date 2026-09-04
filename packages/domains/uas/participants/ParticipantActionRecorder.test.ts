import { describe, expect, it, vi } from "vitest";

import type { Action } from "./src/Action.js";
import {
  ParticipantActionRecorder,
} from "./src/ParticipantActionRecorder.js";

describe("ParticipantActionRecorder", () => {
  it("records who performed the action", async () => {
    const save = vi.fn<
      (action: Action) => Promise<void>
    >().mockResolvedValue(undefined);

    const repository = {
      save,
    };

    const recorder = new ParticipantActionRecorder(
      repository,
      () => "action-001",
      () => new Date("2026-09-03T18:00:00.000Z"),
    );

    const action = await recorder.record(
      "participant-001",
      {
        type: "submit_actor",
        targetType: "actor",
        targetId: "actor-001",
      },
    );

    expect(action.participantId).toBe(
      "participant-001",
    );
  });

  it("creates an action with the supplied target", async () => {
    const save = vi.fn<
      (action: Action) => Promise<void>
    >().mockResolvedValue(undefined);

    const recorder = new ParticipantActionRecorder(
      { save },
      () => "action-002",
      () => new Date("2026-09-03T18:00:00.000Z"),
    );

    const action = await recorder.record(
      "participant-001",
      {
        type: "submit_problem",
        targetType: "problem",
        targetId: "problem-001",
      },
    );

    expect(action.type).toBe("submit_problem");
    expect(action.targetType).toBe("problem");
    expect(action.targetId).toBe("problem-001");
  });

  it("generates the action timestamp", async () => {
    const save = vi.fn<
      (action: Action) => Promise<void>
    >().mockResolvedValue(undefined);

    const occurredAt = new Date(
      "2026-09-03T18:00:00.000Z",
    );

    const recorder = new ParticipantActionRecorder(
      { save },
      () => "action-003",
      () => occurredAt,
    );

    const action = await recorder.record(
      "participant-001",
      {
        type: "submit_solution",
        targetType: "solution",
        targetId: "solution-001",
      },
    );

    expect(action.occurredAt).toBe(occurredAt);
  });

  it("persists the generated action", async () => {
    const save = vi.fn<
      (action: Action) => Promise<void>
    >().mockResolvedValue(undefined);

    const recorder = new ParticipantActionRecorder(
      { save },
      () => "action-004",
      () => new Date("2026-09-03T18:00:00.000Z"),
    );

    const action = await recorder.record(
      "participant-001",
      {
        type: "submit_activity",
        targetType: "activity",
        targetId: "activity-001",
      },
    );

    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(action);
  });

  it("returns the recorded action", async () => {
    const save = vi.fn<
      (action: Action) => Promise<void>
    >().mockResolvedValue(undefined);

    const recorder = new ParticipantActionRecorder(
      { save },
      () => "action-005",
      () => new Date("2026-09-03T18:00:00.000Z"),
    );

    const action = await recorder.record(
      "participant-001",
      {
        type: "submit_query",
        targetType: "query",
        targetId: "query-001",
      },
    );

    expect(action.id).toBe("action-005");
  });
});