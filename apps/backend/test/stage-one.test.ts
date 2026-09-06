import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { deleteDirectoryEntry, loadActivityDirectory, loadDirectory, loadParticipants, login, saveDirectoryEntry } from "../src/stage-one.js";

describe("DAA stage one", () => {
  it("supports the minimum participant and dealer login", () => {
    expect(login("admin@dronsair.ar", "admin")?.account.role).toBe("admin");
    expect(login("participante@dronsair.ar", "participante")).toBeUndefined();
    expect(login("dealer@dronsair.ar", "dealer")).toBeUndefined();
    expect(login("unknown@example.com", "wrong")).toBeUndefined();
  });

  it("loads the public home sources", async () => {
    const participants = await loadParticipants("packages/domains/uas/participants/data/fixtures");
    const directory = await loadDirectory("packages/domains/uas/ecosystem/data/nodes");
    const activities = await loadActivityDirectory("data/activities", new Date("2026-09-04T12:00:00-03:00"));
    expect(participants.length).toBeGreaterThan(0);
    expect(directory.length).toBeGreaterThan(0);
    expect(activities).toHaveLength(9);
    expect(activities.filter((activity) => activity.status === "published")).toHaveLength(3);
    expect(activities.filter((activity) => activity.status === "scheduled")).toHaveLength(3);
    expect(activities.filter((activity) => activity.status === "historical")).toHaveLength(3);
    expect(participants[0]?.informationStatus).toBe("initial");
  });

  it("persists and deletes directory entries for administrative operations", async () => {
    const directory = await mkdtemp(join(tmpdir(), "daa-directory-"));
    const entry = { id: "actor-test", name: "Actor de prueba", type: "service", status: "partial", layers: ["service"], capabilities: ["field-support"], location: { country: "Argentina" } };
    await saveDirectoryEntry(directory, entry);
    expect((await loadDirectory(directory))[0]?.name).toBe("Actor de prueba");
    expect((await readFile(join(directory, "actor-test.yml"), "utf8"))).toContain("Actor de prueba");
    expect(await deleteDirectoryEntry(directory, "actor-test")).toBe(true);
    expect(await deleteDirectoryEntry(directory, "actor-test")).toBe(false);
  });

});