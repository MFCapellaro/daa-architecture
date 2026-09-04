/**
 * Participant Loader
 *
 * Responsibility:
 *
 *   Load Participant records from YAML files.
 *
 * The loader is intentionally unaware of:
 *
 *   - fixtures
 *   - publication
 *   - simulation
 *   - deletion
 *   - list presentation
 *
 * It transforms the persisted representation
 * into Participant domain objects.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

import type { Participant, ParticipantStatus } from "./Participant.js";

const PARTICIPANT_STATUSES: ParticipantStatus[] = [
  "active",
  "inactive",
  "suspended",
  "archived",
];

export class ParticipantLoader {
  async load(directory: string): Promise<Participant[]> {
    const entries = await readdir(directory, {
      withFileTypes: true,
    });

    const files = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml")),
      )
      .map((entry) => entry.name)
      .sort();

    const participants: Participant[] = [];

    for (const file of files) {
      participants.push(
        await this.loadFile(join(directory, file)),
      );
    }

    return participants;
  }

  async loadFile(path: string): Promise<Participant> {
    const source = await readFile(path, "utf8");
    const data: unknown = parse(source);

    return this.validate(data, path);
  }

  private validate(data: unknown, path: string): Participant {
    if (!data || typeof data !== "object") {
      throw new Error(`Invalid participant in ${path}`);
    }

    const participant = data as Record<string, unknown>;

    if (
      typeof participant.id !== "string" ||
      participant.id.length === 0
    ) {
      throw new Error(`Participant id is required in ${path}`);
    }

    if (
      typeof participant.actorId !== "string" ||
      participant.actorId.length === 0
    ) {
      throw new Error(`Participant actorId is required in ${path}`);
    }

    if (participant.status === undefined) {
  throw new Error(`Participant status is required in ${path}`);
}

    if (
      typeof participant.status !== "string" ||
      !PARTICIPANT_STATUSES.includes(
        participant.status as ParticipantStatus,
      )
    ) {
  throw new Error(`Invalid participant status in ${path}`);
}

    if (
      typeof participant.joinedAt !== "string" ||
      participant.joinedAt.length === 0
    ) {
      throw new Error(`Participant joinedAt is required in ${path}`);
    }

    const joinedAt = new Date(participant.joinedAt);

    if (Number.isNaN(joinedAt.getTime())) {
      throw new Error(`Invalid participant joinedAt in ${path}`);
    }

    return {
      id: participant.id,
      actorId: participant.actorId,
      status: participant.status as ParticipantStatus,
      joinedAt,
    };
  }
}