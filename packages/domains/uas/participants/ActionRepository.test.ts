import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import type { Action } from "./src/Action.js";
import { YamlActionRepository } from "./src/YamlActionRepository.js";

async function createRepository() {
  const directory = await mkdtemp(
    join(tmpdir(), "daa-actions-"),
  );

  return {
    directory,
    repository: new YamlActionRepository(directory),
  };
}

function createAction(): Action {
  return {
    id: "action-001",
    participantId: "participant-001",
    type: "submit_actor",
    targetType: "actor",
    targetId: "actor-001",
    occurredAt: new Date(
      "2026-09-03T18:00:00.000Z",
    ),
  };
}

describe("YamlActionRepository", () => {
  it("persists a new action", async () => {
    const { directory, repository } =
      await createRepository();

    const action = createAction();

    await repository.save(action);

    const source = await readFile(
      join(directory, "action-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data).toEqual({
      id: "action-001",
      participantId: "participant-001",
      type: "submit_actor",
      targetType: "actor",
      targetId: "actor-001",
      occurredAt: "2026-09-03T18:00:00.000Z",
    });
  });

  it("preserves the participant reference", async () => {
    const { directory, repository } =
      await createRepository();

    const action = createAction();

    await repository.save(action);

    const source = await readFile(
      join(directory, "action-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data.participantId).toBe(
      "participant-001",
    );
  });

  it("serializes occurredAt as ISO", async () => {
    const { directory, repository } =
      await createRepository();

    const action = createAction();

    await repository.save(action);

    const source = await readFile(
      join(directory, "action-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data.occurredAt).toBe(
      "2026-09-03T18:00:00.000Z",
    );
  });

  it("does not overwrite an existing action", async () => {
    const { directory, repository } =
      await createRepository();

    const action = createAction();

    await repository.save(action);

    const modified: Action = {
      ...action,
      participantId: "participant-999",
      targetId: "actor-999",
    };

    await expect(
      repository.save(modified),
    ).rejects.toThrow(
      "EEXIST",
    );

    const source = await readFile(
      join(directory, "action-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data.participantId).toBe(
      "participant-001",
    );

    expect(data.targetId).toBe(
      "actor-001",
    );
  });
});