import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

export type PoolStatus = "active" | "complete" | "expired";

export interface PoolInput {
  product: string;
  brand: string;
  model: string;
  description: string;
  targetQuantity: number;
  unitPrice: number;
  discountedUnitPrice: number;
  city: string;
  province: string;
  paymentConditions: string;
  warranty: string;
  validUntil: string;
  training: string;
  afterSales: string;
  deliveryAvailability: string;
  restrictions: string;
  images: string[];
}

export interface PoolMember {
  participantId: string;
  name: string;
  email: string;
  quantity: number;
  joinedAt: string;
}

export interface PoolRecord extends PoolInput {
  id: string;
  dealer: { id: string; name: string; email: string };
  visible: boolean;
  status: PoolStatus;
  members: PoolMember[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

const DEFAULT_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../packages/domains/uas/ecosystem/backend/pools/submissions",
);

export class PoolStore {
  private mutationQueue: Promise<void> = Promise.resolve();
  private readonly directory: string;

  constructor(directory?: string) {
    this.directory = directory ?? (process.env.POOL_SUBMISSIONS_DIRECTORY
      ? resolve(process.env.POOL_SUBMISSIONS_DIRECTORY)
      : DEFAULT_DIRECTORY);
  }

  async list(now = new Date()): Promise<PoolRecord[]> {
    let files: string[];
    try {
      files = (await readdir(this.directory)).filter((file) => /\.ya?ml$/i.test(file));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
      throw error;
    }

    const pools = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.directory, file), "utf8")) as PoolRecord
    ));
    for (const pool of pools) {
      if (pool.status === "active" && Date.parse(pool.validUntil) <= now.getTime()) {
        pool.status = "expired";
        pool.closedAt = now.toISOString();
        pool.updatedAt = now.toISOString();
        await this.write(pool);
      }
    }
    return pools.sort((left, right) => Date.parse(left.validUntil) - Date.parse(right.validUntil));
  }

  async create(input: PoolInput, dealer: PoolRecord["dealer"], now = new Date()): Promise<PoolRecord> {
    const timestamp = now.toISOString();
    const pool: PoolRecord = {
      ...input,
      id: `pool-${now.getTime()}-${randomUUID()}`,
      dealer,
      visible: false,
      status: Date.parse(input.validUntil) <= now.getTime() ? "expired" : "active",
      members: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(Date.parse(input.validUntil) <= now.getTime() ? { closedAt: timestamp } : {}),
    };
    await this.write(pool);
    return pool;
  }

  async update(id: string, patch: Partial<PoolInput> & { visible?: boolean }): Promise<PoolRecord | "capacity" | undefined> {
    return this.withMutation(async () => {
      const current = (await this.list()).find((pool) => pool.id === id);
      if (!current) return undefined;
      const targetQuantity = patch.targetQuantity ?? current.targetQuantity;
      const joinedQuantity = current.members.reduce((total, member) => total + member.quantity, 0);
      if (targetQuantity < joinedQuantity) return "capacity";
      const updated: PoolRecord = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      if (updated.status === "active" && Date.parse(updated.validUntil) <= Date.now()) {
        updated.status = "expired";
        updated.closedAt = updated.updatedAt;
      }
      if (updated.status === "active"
        && updated.members.reduce((total, member) => total + member.quantity, 0) >= updated.targetQuantity) {
        updated.status = "complete";
        updated.closedAt = updated.updatedAt;
      }
      await this.write(updated);
      return updated;
    });
  }

  async join(id: string, member: Omit<PoolMember, "joinedAt">): Promise<
    { pool: PoolRecord } | { error: "not-found" | "not-joinable" | "already-joined" | "capacity" }
  > {
    return this.withMutation(async () => {
      const current = (await this.list()).find((pool) => pool.id === id);
      if (!current) return { error: "not-found" };
      if (!current.visible || current.status !== "active") return { error: "not-joinable" };
      if (current.members.some((entry) => entry.participantId === member.participantId)) {
        return { error: "already-joined" };
      }
      const joinedQuantity = current.members.reduce((total, entry) => total + entry.quantity, 0);
      if (joinedQuantity + member.quantity > current.targetQuantity) return { error: "capacity" };

      const updated: PoolRecord = {
        ...current,
        members: [...current.members, { ...member, joinedAt: new Date().toISOString() }],
        updatedAt: new Date().toISOString(),
      };
      if (updated.members.reduce((total, entry) => total + entry.quantity, 0) >= updated.targetQuantity) {
        updated.status = "complete";
        updated.closedAt = updated.updatedAt;
      }
      await this.write(updated);
      return { pool: updated };
    });
  }

  async delete(id: string): Promise<"deleted" | "not-found" | "protected"> {
    return this.withMutation(async () => {
      const pool = (await this.list()).find((record) => record.id === id);
      if (!pool) return "not-found";
      if (pool.status !== "active" || pool.members.length > 0) return "protected";
      await unlink(join(this.directory, `${id}.yml`));
      return "deleted";
    });
  }

  private async withMutation<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.mutationQueue;
    let release!: () => void;
    this.mutationQueue = new Promise<void>((resolveQueue) => { release = resolveQueue; });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  private async write(pool: PoolRecord): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, `${pool.id}.yml`), stringify(pool), "utf8");
  }
}
