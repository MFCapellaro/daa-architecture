import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";

import type { Participant } from "./src/Participant.js";
import { YamlParticipantRepository } from "./src/YamlParticipantRepository.js";

describe("YamlParticipantRepository", () => {
  const participant: Participant = {
    id: "participant-001",
    actorId: "actor-001",
    status: "active",
    joinedAt: new Date("2026-09-03T12:00:00.000Z"),
  };

  async function createDirectory(): Promise<string> {
    return mkdtemp(join(tmpdir(), "daa-participants-"));
  }

  it("persists a participant", async () => {
    const directory = await createDirectory();
    const repository = new YamlParticipantRepository(directory);

    await repository.save(participant);

    const path = join(directory, "participant-001.yml");
    const source = await readFile(path, "utf8");
    const data = parse(source);

    expect(data.id).toBe("participant-001");
    expect(data.actorId).toBe("actor-001");
    expect(data.status).toBe("active");
    expect(data.joinedAt).toBe("2026-09-03T12:00:00.000Z");
  });

  it("updates an existing participant", async () => {
    const directory = await createDirectory();
    const repository = new YamlParticipantRepository(directory);

    await repository.save(participant);

    const updated: Participant = {
      ...participant,
      status: "inactive",
    };

    await repository.save(updated);

    const path = join(directory, "participant-001.yml");
    const source = await readFile(path, "utf8");
    const data = parse(source);

    expect(data.status).toBe("inactive");
  });

  it("deletes a participant", async () => {
    const directory = await createDirectory();
    const repository = new YamlParticipantRepository(directory);

    await repository.save(participant);
    await repository.delete("participant-001");

    await expect(
      readFile(join(directory, "participant-001.yml"), "utf8"),
    ).rejects.toThrow();
  });

  it("does not fail when deleting a non-existent participant", async () => {
    const directory = await createDirectory();
    const repository = new YamlParticipantRepository(directory);

    await expect(
      repository.delete("participant-999"),
    ).resolves.toBeUndefined();
  });
});