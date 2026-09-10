import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it } from "vitest";
import {
  deleteDirectoryEntry,
  loadActivityDirectory,
  loadDirectory,
  loadNodes,
  loadParticipants,
  login,
  saveDirectoryEntry
} from "../src/stage-one.js";

beforeAll(async () => {
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("admin", 4);
});

describe("DAA stage one", () => {
  it("supports administrator login and rejects invalid accounts", async () => {
    const session = await login("admin", "admin");

    expect(session?.account.role).toBe("admin");
    expect(await login("participante@dronsair.ar", "participante")).toBeUndefined();
    expect(await login("dealer@dronsair.ar", "dealer")).toBeUndefined();
    expect(await login("unknown@example.com", "wrong")).toBeUndefined();
  });

  it("loads the public home sources", async () => {
    const participants = await loadParticipants(
      "packages/domains/uas/participants/data/fixtures"
    );
    const directory = await loadDirectory(
      "packages/domains/uas/ecosystem/data/nodes"
    );
    const activities = await loadActivityDirectory(
      "data/activities",
      new Date("2026-09-04T12:00:00-03:00")
    );

    expect(participants.length).toBeGreaterThan(0);
    expect(directory.length).toBeGreaterThan(0);
    expect(activities).toHaveLength(9);
    expect(
      activities.filter((activity) => activity.status === "published")
    ).toHaveLength(3);
    expect(
      activities.filter((activity) => activity.status === "scheduled")
    ).toHaveLength(3);
    expect(
      activities.filter((activity) => activity.status === "historical")
    ).toHaveLength(3);
    expect(participants[0]?.informationStatus).toBe("initial");
  });

  it("persists and deletes directory entries for administrative operations", async () => {
    const directory = await mkdtemp(join(tmpdir(), "daa-directory-"));
    const entry = {
      id: "actor-test",
      name: "Actor de prueba",
      type: "service",
      status: "partial",
      layers: ["service"],
      capabilities: ["field-support"],
      location: { country: "Argentina" }
    };

    await saveDirectoryEntry(directory, entry);
    expect((await loadDirectory(directory))[0]?.name).toBe("Actor de prueba");
    expect(
      await readFile(join(directory, "actor-test.yml"), "utf8")
    ).toContain("Actor de prueba");
    expect(await deleteDirectoryEntry(directory, "actor-test")).toBe(true);
    expect(await deleteDirectoryEntry(directory, "actor-test")).toBe(false);
  });

  it("loads canonical ecosystem nodes before building the directory view", async () => {
    const nodes = await loadNodes(
      "packages/domains/uas/ecosystem/data/nodes"
    );

    expect(nodes.length).toBeGreaterThan(0);

    const node = nodes.find((item) => item.id === "aereal-patagonia");
    expect(node).toBeDefined();
    expect(node?.name).toBe("Aereal Patagonia");
    expect(node?.location?.coordinates?.lat).toBeCloseTo(-39.0453024887735);
    expect(node?.location?.coordinates?.lng).toBeCloseTo(-67.56971749014761);

    const directory = await loadDirectory(
      "packages/domains/uas/ecosystem/data/nodes"
    );
    const entry = directory.find((item) => item.id === "aereal-patagonia");

    expect(entry?.name).toBe("Aereal Patagonia");
    expect(entry?.location?.coordinates).toEqual({
      lat: -39.0453024887735,
      lng: -67.56971749014761
    });
  });
});