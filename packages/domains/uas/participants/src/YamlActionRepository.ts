/**
 * YAML Action Repository
 *
 * Responsibility:
 *
 *   Persist Action records as individual YAML files.
 *
 * Actions are historical facts:
 *
 *   - a new action can be recorded
 *   - an existing action cannot be overwritten
 *   - no delete operation is exposed
 */

import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";

import type { Action } from "./Action.js";
import type { ActionRepository } from "./ActionRepository.js";

export class YamlActionRepository
  implements ActionRepository
{
  constructor(
    private readonly directory: string,
  ) {}

  async save(action: Action): Promise<void> {
    await mkdir(this.directory, {
      recursive: true,
    });

    const path = join(
      this.directory,
      `${action.id}.yml`,
    );

    await writeFile(
      path,
      stringify({
        id: action.id,
        participantId: action.participantId,
        type: action.type,
        targetType: action.targetType,
        targetId: action.targetId,
        occurredAt: action.occurredAt.toISOString(),
      }),
      {
        encoding: "utf8",
        flag: "wx",
      },
    );
  }
}