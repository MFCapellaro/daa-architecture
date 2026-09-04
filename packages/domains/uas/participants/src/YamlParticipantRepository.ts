/**
 * YAML Participant Repository
 *
 * Responsibility:
 *
 *   Persist Participant records as YAML files.
 *
 * The repository is responsible only for persistence.
 * It does not apply participant lifecycle rules.
 */

import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";

import type { Participant } from "./Participant.js";
import type { ParticipantRepository } from "./ParticipantRepository.js";

export class YamlParticipantRepository
  implements ParticipantRepository
{
  constructor(
    private readonly directory: string,
  ) {}

  async save(participant: Participant): Promise<void> {
    await mkdir(this.directory, {
      recursive: true,
    });

    const path = join(
      this.directory,
      `${participant.id}.yml`,
    );

    const data = {
      id: participant.id,
      actorId: participant.actorId,
      status: participant.status,
      joinedAt: participant.joinedAt.toISOString(),
    };

    await writeFile(
      path,
      stringify(data),
      "utf8",
    );
  }

  async delete(id: string): Promise<void> {
    const path = join(
      this.directory,
      `${id}.yml`,
    );

    try {
      await unlink(path);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return;
      }

      throw error;
    }
  }
}