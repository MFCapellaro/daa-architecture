import { describe, expect, it } from "vitest";

import { ParticipantList } from "./src/ParticipantList.js";
import type { Participant } from "./src/Participant.js";

describe("ParticipantList", () => {
  const participants: Participant[] = [
    {
      id: "participant-001",
      actorId: "actor-001",
      status: "active",
      joinedAt: new Date("2026-08-01T00:00:00.000Z"),
    },
    {
      id: "participant-002",
      actorId: "actor-002",
      status: "inactive",
      joinedAt: new Date("2026-08-02T00:00:00.000Z"),
    },
  ];

  it("finds a participant by id", () => {
  const list = new ParticipantList(participants);

  expect(list.get("participant-001")).toEqual(participants[0]);
});

it("returns undefined when the participant does not exist", () => {
  const list = new ParticipantList(participants);

  expect(list.get("participant-999")).toBeUndefined();
});

  it("contains the supplied participants", () => {
    const list = new ParticipantList(participants);

    expect(list.all()).toEqual(participants);
  });

  it("reports the number of participants", () => {
    const list = new ParticipantList(participants);

    expect(list.size).toBe(2);
  });

  it("returns a copy of the collection", () => {
    const list = new ParticipantList(participants);

    const result = list.all();
    result.pop();

    expect(list.size).toBe(2);
  });
  it("filters participants by status", () => {
  const list = new ParticipantList(participants);

  expect(list.filter({ status: "active" })).toEqual([
    participants[0],
  ]);

  expect(list.filter({ status: "inactive" })).toEqual([
    participants[1],
  ]);
});

it("filters participants by joinedAt range", () => {
  const list = new ParticipantList(participants);

  expect(
    list.filter({
      joinedFrom: new Date("2026-08-02T00:00:00.000Z"),
      joinedTo: new Date("2026-08-02T23:59:59.999Z"),
    }),
  ).toEqual([participants[1]]);
});

it("searches participants by id or actorId", () => {
  const list = new ParticipantList(participants);

  expect(list.filter({ search: "participant-001" })).toEqual([
    participants[0],
  ]);

  expect(list.filter({ search: "actor-002" })).toEqual([
    participants[1],
  ]);
});

it("combines filters", () => {
  const list = new ParticipantList(participants);

  expect(
    list.filter({
      status: "active",
      search: "actor-001",
    }),
  ).toEqual([participants[0]]);
});
it("changes the status of a participant", () => {
  const list = new ParticipantList(participants);

  list.changeStatus("participant-001", "inactive");

  expect(list.get("participant-001")?.status).toBe("inactive");
});

it("allows suspension of a participant", () => {
  const list = new ParticipantList(participants);

  list.changeStatus("participant-001", "suspended");

  expect(list.get("participant-001")?.status).toBe("suspended");
});

it("allows archiving of a participant", () => {
  const list = new ParticipantList(participants);

  list.changeStatus("participant-001", "archived");

  expect(list.get("participant-001")?.status).toBe("archived");
});

it("deletes a participant", () => {
  const list = new ParticipantList(participants);

  list.delete("participant-001");

  expect(list.get("participant-001")).toBeUndefined();
  expect(list.size).toBe(participants.length - 1);
});

it("does not fail when deleting a non-existent participant", () => {
  const list = new ParticipantList(participants);

  expect(() => list.delete("participant-999")).not.toThrow();
  expect(list.size).toBe(participants.length);
});
});