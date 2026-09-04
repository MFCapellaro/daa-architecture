import { describe, expect, it } from "vitest";
import {
  mkdtemp,
  readFile,
  writeFile,
  access,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";

import { ParticipantLoader } from "./src/ParticipantLoader.js";
import { ParticipantList } from "./src/ParticipantList.js";
import { ParticipantAdministration } from "./src/ParticipantAdministration.js";
import { YamlParticipantRepository } from "./src/YamlParticipantRepository.js";

describe("Participant administration integration", () => {
  async function createDirectory(): Promise<string> {
    return mkdtemp(join(tmpdir(), "daa-participants-integration-"));
  }

  async function createParticipantFile(
    directory: string,
  ): Promise<void> {
    await writeFile(
      join(directory, "participant-001.yml"),
      `
id: participant-001
actorId: actor-001
status: active
joinedAt: "2026-09-03T12:00:00.000Z"
`,
      "utf8",
    );
  }

  async function createAdministration(
    directory: string,
  ): Promise<ParticipantAdministration> {
    const loader = new ParticipantLoader();
    const participants = await loader.load(directory);
    const list = new ParticipantList(participants);
    const repository = new YamlParticipantRepository(directory);

    return new ParticipantAdministration(
      list,
      repository,
    );
  }

  it("changes status and persists it to YAML", async () => {
    const directory = await createDirectory();
    await createParticipantFile(directory);

    const administration =
      await createAdministration(directory);

    await administration.changeStatus(
      "participant-001",
      "inactive",
    );

    const source = await readFile(
      join(directory, "participant-001.yml"),
      "utf8",
    );

    const data = parse(source);

    expect(data.status).toBe("inactive");
  });

  it("deletes the participant from memory and persistence", async () => {
    const directory = await createDirectory();
    await createParticipantFile(directory);

    const administration =
      await createAdministration(directory);

    await administration.delete("participant-001");

    await expect(
      access(join(directory, "participant-001.yml")),
    ).rejects.toThrow();
  });
});