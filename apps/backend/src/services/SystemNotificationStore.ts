import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse, stringify } from "yaml";

export type SystemNotificationCategory = "actor" | "pool" | "activity";

export interface SystemNotification {
  id: string;
  recipientId: string;
  category: SystemNotificationCategory;
  title: string;
  message: string;
  href: string;
  entityId: string;
  createdAt: string;
  readAt?: string;
}

const DEFAULT_DIRECTORY = resolve(
  process.cwd(),
  "packages/domains/uas/ecosystem/backend/notifications",
);

export class SystemNotificationStore {
  private readonly directory: string;

  constructor(directory?: string) {
    this.directory = directory ?? (process.env.SYSTEM_NOTIFICATIONS_DIRECTORY
      ? resolve(process.env.SYSTEM_NOTIFICATIONS_DIRECTORY)
      : DEFAULT_DIRECTORY);
  }

  async create(input: Omit<SystemNotification, "id" | "createdAt" | "readAt">): Promise<SystemNotification> {
    const existing = (await this.list(input.recipientId)).find((notification) =>
      notification.category === input.category
      && notification.entityId === input.entityId
      && notification.title === input.title);
    if (existing) return existing;
    const notification: SystemNotification = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, `${notification.id}.yml`), stringify(notification), "utf8");
    return notification;
  }

  async list(recipientId: string): Promise<SystemNotification[]> {
    let files: string[];
    try {
      files = (await readdir(this.directory)).filter((file) => /\.ya?ml$/i.test(file));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
      throw error;
    }
    const notifications = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.directory, file), "utf8")) as SystemNotification
    ));
    return notifications
      .filter((notification) => notification.recipientId === recipientId)
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }

  async markRead(recipientId: string, id: string): Promise<SystemNotification | undefined> {
    const current = (await this.list(recipientId)).find((notification) => notification.id === id);
    if (!current) return undefined;
    const updated = { ...current, readAt: new Date().toISOString() };
    await writeFile(join(this.directory, `${id}.yml`), stringify(updated), "utf8");
    return updated;
  }
}
