import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse, stringify } from "yaml";

export type SubmittedActorType =
  | "company" | "person" | "institution" | "manufacturer" | "supplier" | "dealer"
  | "service" | "operator" | "organization" | "community" | "training" | "other";

export interface ActorSubmissionInput {
  name: string;
  type: SubmittedActorType;
  description: string;
  layers: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    province: string;
    country: string;
  };
}

export interface ActorSubmission extends ActorSubmissionInput {
  id: string;
  status: "pending" | "approved" | "rejected";
  source: { id: string; name: string; email: string; role: "participante" | "dealer" };
  actorId?: string;
  reviewMessage?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SUBMISSIONS = resolve(
  process.cwd(),
  "packages/domains/uas/ecosystem/backend/actors/submissions",
);
const DEFAULT_NODES = resolve(
  process.cwd(),
  "packages/domains/uas/ecosystem/data/nodes",
);

export class ActorSubmissionStore {
  private readonly submissionsDirectory: string;
  private readonly nodesDirectory: string;

  constructor(submissionsDirectory?: string, nodesDirectory?: string) {
    this.submissionsDirectory = submissionsDirectory ?? (process.env.ACTOR_SUBMISSIONS_DIRECTORY
      ? resolve(process.env.ACTOR_SUBMISSIONS_DIRECTORY) : DEFAULT_SUBMISSIONS);
    this.nodesDirectory = nodesDirectory ?? (process.env.ECOSYSTEM_NODES_DIRECTORY
      ? resolve(process.env.ECOSYSTEM_NODES_DIRECTORY) : DEFAULT_NODES);
  }

  async list(): Promise<ActorSubmission[]> {
    let files: string[];
    try {
      files = (await readdir(this.submissionsDirectory)).filter((file) => /\.ya?ml$/i.test(file));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
      throw error;
    }
    const records = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.submissionsDirectory, file), "utf8")) as ActorSubmission
    ));
    return records.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }

  async findById(id: string): Promise<ActorSubmission | undefined> {
    return (await this.list()).find((submission) => submission.id === id);
  }

  async create(
    input: ActorSubmissionInput,
    source: ActorSubmission["source"],
  ): Promise<ActorSubmission> {
    const now = new Date().toISOString();
    const submission: ActorSubmission = {
      ...input,
      id: `actor-submission-${randomUUID()}`,
      status: "pending",
      source,
      createdAt: now,
      updatedAt: now,
    };
    await mkdir(this.submissionsDirectory, { recursive: true });
    await writeFile(join(this.submissionsDirectory, `${submission.id}.yml`), stringify(submission), "utf8");
    return submission;
  }

  async review(id: string, decision: "approved" | "rejected", message = ""): Promise<ActorSubmission | undefined> {
    const current = await this.findById(id);
    if (!current || current.status !== "pending") return undefined;
    let actorId: string | undefined;
    if (decision === "approved") {
      actorId = `${current.name.trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomUUID().slice(0, 8)}`;
      const actor = {
        id: actorId,
        name: current.name,
        type: current.type,
        description: current.description,
        layers: current.layers,
        isPublic: true,
        identity: { status: "active" },
        contact: {
          email: current.contact.email || null,
          phone: current.contact.phone || null,
          address: current.contact.address || null,
          city: current.contact.city || null,
          province: current.contact.province || null,
          country: current.contact.country || null,
        },
        presence: { website: current.contact.website || null },
        status: { verification: "declared", imported: false, reviewRequired: false },
        source: { file: "actor-submission", raw: current.description || current.name },
      };
      await mkdir(this.nodesDirectory, { recursive: true });
      await writeFile(join(this.nodesDirectory, `${actorId}.yml`), stringify(actor), "utf8");
    }
    const updated: ActorSubmission = {
      ...current,
      status: decision,
      ...(actorId ? { actorId } : {}),
      ...(message.trim() ? { reviewMessage: message.trim().slice(0, 600) } : {}),
      updatedAt: new Date().toISOString(),
    };
    await writeFile(join(this.submissionsDirectory, `${id}.yml`), stringify(updated), "utf8");
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const current = await this.findById(id);
    if (!current) return false;
    await unlink(join(this.submissionsDirectory, `${id}.yml`));
    return true;
  }
}
