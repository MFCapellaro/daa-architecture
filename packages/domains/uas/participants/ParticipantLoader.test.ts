import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { ParticipantLoader } from "./src/ParticipantLoader.js";

const fixturesDirectory = join(
  process.cwd(),
  "packages/domains/uas/participants/data/fixtures",
);

describe("ParticipantLoader", () => {
  const loader = new ParticipantLoader();

  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map((directory) =>
        rm(directory, {
          recursive: true,
          force: true,
        }),
      ),
    );

    temporaryDirectories.length = 0;
  });

  it("loads all participant fixtures", async () => {
    const participants = await loader.load(fixturesDirectory);

    expect(participants).toHaveLength(9);
  });

  it("loads participants with the required domain fields", async () => {
    const participants = await loader.load(fixturesDirectory);

    for (const participant of participants) {
      expect(participant.id).toEqual(expect.any(String));
      expect(participant.actorId).toEqual(expect.any(String));
      expect(participant.status).toEqual(expect.any(String));
      expect(participant.joinedAt).toEqual(expect.any(Date));
    }
  });

  it("loads files in deterministic filename order", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeParticipantFixture(
      temporaryDirectory,
      "participant-003.yml",
      "participant-003",
    );

    await writeParticipantFixture(
      temporaryDirectory,
      "participant-001.yml",
      "participant-001",
    );

    await writeParticipantFixture(
      temporaryDirectory,
      "participant-002.yml",
      "participant-002",
    );

    const participants = await loader.load(temporaryDirectory);

    expect(participants.map((participant) => participant.id)).toEqual([
      "participant-001",
      "participant-002",
      "participant-003",
    ]);
  });

  it("ignores non-YAML files", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeParticipantFixture(
      temporaryDirectory,
      "participant-001.yml",
      "participant-001",
    );

    await writeFile(
      join(temporaryDirectory, "README.md"),
      "# Not a participant",
      "utf8",
    );

    const participants = await loader.load(temporaryDirectory);

    expect(participants).toHaveLength(1);
    expect(participants[0].id).toBe("participant-001");
  });

  it("rejects a participant without an id", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeFile(
      join(temporaryDirectory, "invalid.yml"),
      `
actorId: actor-001
status: active
joinedAt: 2026-09-03
`,
      "utf8",
    );

    await expect(loader.load(temporaryDirectory)).rejects.toThrow(
      "Participant id is required",
    );
  });

  it("rejects a participant without an actorId", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeFile(
      join(temporaryDirectory, "invalid.yml"),
      `
id: participant-001
status: active
joinedAt: 2026-09-03
`,
      "utf8",
    );

    await expect(loader.load(temporaryDirectory)).rejects.toThrow(
      "Participant actorId is required",
    );
  });

  it("rejects a participant without a status", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeFile(
      join(temporaryDirectory, "invalid.yml"),
      `
id: participant-001
actorId: actor-001
joinedAt: 2026-09-03
`,
      "utf8",
    );

    await expect(loader.load(temporaryDirectory)).rejects.toThrow(
      "Participant status is required",
    );
  });

  it("converts joinedAt from YAML string to Date", async () => {
    const participants = await loader.load(fixturesDirectory);

    for (const participant of participants) {
    expect(participant.joinedAt).toBeInstanceOf(Date);
    expect(Number.isNaN(participant.joinedAt.getTime())).toBe(false);
  }
});

  it("rejects a participant without joinedAt", async () => {
    const temporaryDirectory = await createTemporaryDirectory(
      temporaryDirectories,
    );

    await writeFile(
      join(temporaryDirectory, "invalid.yml"),
      `
id: participant-001
actorId: actor-001
status: active
`,
      "utf8",
    );

    await expect(loader.load(temporaryDirectory)).rejects.toThrow(
      "Participant joinedAt is required",
    );
  });
});

async function createTemporaryDirectory(
  temporaryDirectories: string[],
): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "participants-"));

  temporaryDirectories.push(directory);

  return directory;
}

async function writeParticipantFixture(
  directory: string,
  filename: string,
  id: string,
): Promise<void> {
  await mkdir(directory, {
    recursive: true,
  });

  await writeFile(
    join(directory, filename),
    `
id: ${id}
actorId: actor-${id}
status: active
joinedAt: 2026-09-03
`,
    "utf8",
  );
}
