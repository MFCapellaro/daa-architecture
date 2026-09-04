import { describe, expect, it, vi } from "vitest";

import type {
  Participant,
  ParticipantStatus,
} from "./src/Participant.js";
import { ParticipantList } from "./src/ParticipantList.js";
import type { ParticipantRepository } from "./src/ParticipantRepository.js";
import { ParticipantAdministration } from "./src/ParticipantAdministration.js";

describe("ParticipantAdministration", () => {
  const participants: Participant[] = [
    {
      id: "participant-001",
      actorId: "actor-001",
      status: "active",
      joinedAt: new Date("2026-09-01T12:00:00.000Z"),
    },
    {
      id: "participant-002",
      actorId: "actor-002",
      status: "inactive",
      joinedAt: new Date("2026-09-02T12:00:00.000Z"),
    },
  ];

  function createRepository(): ParticipantRepository {
    return {
      save: vi.fn(),
      delete: vi.fn(),
    };
  }

  it("changes the participant status and persists it", async () => {
    const list = new ParticipantList(participants);
    const repository = createRepository();
    const administration = new ParticipantAdministration(
      list,
      repository,
    );

    await administration.changeStatus(
      "participant-001",
      "inactive",
    );

    expect(list.get("participant-001")?.status).toBe("inactive");

    expect(repository.save).toHaveBeenCalledWith(
      list.get("participant-001"),
    );
  });

  it("does not persist a status change for a non-existent participant", async () => {
    const list = new ParticipantList(participants);
    const repository = createRepository();
    const administration = new ParticipantAdministration(
      list,
      repository,
    );

    await administration.changeStatus(
      "participant-999",
      "inactive",
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("deletes the participant and persists the deletion", async () => {
    const list = new ParticipantList(participants);
    const repository = createRepository();
    const administration = new ParticipantAdministration(
      list,
      repository,
    );

    await administration.delete("participant-001");

    expect(list.get("participant-001")).toBeUndefined();

    expect(repository.delete).toHaveBeenCalledWith(
      "participant-001",
    );
  });

  it("does not persist deletion of a non-existent participant", async () => {
    const list = new ParticipantList(participants);
    const repository = createRepository();
    const administration = new ParticipantAdministration(
      list,
      repository,
    );

    await administration.delete("participant-999");

    expect(repository.delete).not.toHaveBeenCalled();
  });
});