import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import {
  ParticipantActionRecorder,
} from "./src/ParticipantActionRecorder.js";
import {
  YamlActionRepository,
} from "./src/YamlActionRepository.js";

describe("ParticipantActionRecorder integration", () => {
  it("records a participant action in YAML", async () => {
    const directory = await mkdtemp(
      join(tmpdir(), "daa-participant-actions-"),
    );

    const repository = new YamlActionRepository(
      directory,
    );

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

    const source = await readFile(
      join(directory, "action-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data).toEqual({
      id: action.id,
      participantId: "participant-001",
      type: "submit_actor",
      targetType: "actor",
      targetId: "actor-001",
      occurredAt: "2026-09-03T18:00:00.000Z",
    });
  });
});