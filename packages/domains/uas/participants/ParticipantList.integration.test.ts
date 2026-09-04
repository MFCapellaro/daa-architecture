import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { ParticipantLoader } from "./src/ParticipantLoader.js";
import { ParticipantList } from "./src/ParticipantList.js";

describe("ParticipantLoader → ParticipantList", () => {
  const fixturesDirectory = join(
    process.cwd(),
    "packages/domains/uas/participants/data/fixtures",
  );

  it("loads participants into an administrative list", async () => {
    const loader = new ParticipantLoader();

    const participants = await loader.load(fixturesDirectory);
    const list = new ParticipantList(participants);

    expect(list.size).toBe(9);
    expect(list.all()).toHaveLength(9);
  });

  it("preserves the domain objects loaded by the loader", async () => {
    const loader = new ParticipantLoader();

    const participants = await loader.load(fixturesDirectory);
    const list = new ParticipantList(participants);

    for (const participant of list.all()) {
      expect(participant.id).toEqual(expect.any(String));
      expect(participant.actorId).toEqual(expect.any(String));
      expect(participant.status).toEqual(expect.any(String));
      expect(participant.joinedAt).toEqual(expect.any(Date));
    }
  });
});