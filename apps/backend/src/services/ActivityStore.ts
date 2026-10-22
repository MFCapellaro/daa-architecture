import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { parse, stringify } from "yaml";

export type ActivityKind = "training" | "course" | "expo" | "field-application" | "event" | "other";
export type ActivityLocationKind = "in-person" | "virtual";
export type ActivitySourceRole = "participante" | "dealer" | "admin";

export interface ActivityInput {
  title: string;
  kind: ActivityKind;
  description: string;
  startsAt: string;
  endsAt: string;
  locationKind: ActivityLocationKind;
  location: string;
  onlineUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  registrationUrl: string;
  linkedEntities: string[];
  flyer: string;
  featured: boolean;
}

export interface ActivityRecord extends ActivityInput {
  id: string;
  visible: boolean;
  reviewed: boolean;
  source: {
    id: string;
    name: string;
    email: string;
    role: ActivitySourceRole;
  };
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_DIRECTORY = resolve(
  process.cwd(),
  "packages/domains/uas/ecosystem/backend/activities/submissions",
);
const LEGACY_DIRECTORY = resolve(
  process.cwd(),
  "packages/domains/uas/ecosystem/backend/activities/data",
);

export class ActivityStore {
  private readonly directory: string;
  private readonly legacyDirectory?: string;
  private legacyImport: Promise<void> | null = null;

  constructor(directory?: string, legacyDirectory?: string) {
    this.directory = directory ?? (process.env.ACTIVITY_SUBMISSIONS_DIRECTORY
      ? resolve(process.env.ACTIVITY_SUBMISSIONS_DIRECTORY)
      : DEFAULT_DIRECTORY);
    this.legacyDirectory = legacyDirectory ?? (directory ? undefined : LEGACY_DIRECTORY);
  }

  async list(): Promise<ActivityRecord[]> {
    await mkdir(this.directory, { recursive: true });
    await this.importLegacyActivities();
    const files = (await readdir(this.directory)).filter((file) => /\.ya?ml$/i.test(file));
    const activities = await Promise.all(files.map(async (file) =>
      parse(await readFile(join(this.directory, file), "utf8")) as ActivityRecord
    ));
    return activities.sort((left, right) =>
      Date.parse(left.startsAt) - Date.parse(right.startsAt) || left.title.localeCompare(right.title),
    );
  }

  private async importLegacyActivities(): Promise<void> {
    if (!this.legacyDirectory) return;
    if (!this.legacyImport) this.legacyImport = this.migrateLegacyActivities();
    await this.legacyImport;
  }

  private async migrateLegacyActivities(): Promise<void> {
    const legacyDirectory = this.legacyDirectory;
    if (!legacyDirectory) return;

    let legacyFiles: string[];
    try {
      legacyFiles = (await readdir(legacyDirectory)).filter((file) => /\.ya?ml$/i.test(file));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return;
      throw error;
    }

    const currentFiles = (await readdir(this.directory)).filter((file) => /\.ya?ml$/i.test(file));
    const existingIds = await Promise.all(currentFiles.map(async (file) => {
        const record = parse(await readFile(join(this.directory, file), "utf8")) as Partial<ActivityRecord>;
        return record.id;
    }));
    const importedIds = new Set(existingIds.filter((id): id is string => typeof id === "string"));
    const now = new Date();

    for (const file of legacyFiles) {
      const legacy = parse(await readFile(join(legacyDirectory, file), "utf8")) as Record<string, unknown>;
      const legacyId = typeof legacy.id === "string" ? legacy.id : file.replace(/\.ya?ml$/i, "");
      const id = `legacy-${legacyId}`;
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error(`Identificador de actividad heredada inválido en ${file}.`);
      }
      if (importedIds.has(id)) continue;

      const title = legacy.title;
      const startsAt = legacy.startsAt;
      const endsAt = legacy.endsAt ?? startsAt;
      if (typeof title !== "string" || typeof startsAt !== "string" || typeof endsAt !== "string"
        || !Number.isFinite(Date.parse(startsAt)) || !Number.isFinite(Date.parse(endsAt))) {
        throw new Error(`Fechas o título inválidos en la actividad heredada ${file}.`);
      }

      const publicationStartsAt = typeof legacy.publicationStartsAt === "string"
        ? Date.parse(legacy.publicationStartsAt)
        : Number.NaN;
      const publicationEndsAt = typeof legacy.publicationEndsAt === "string"
        ? Date.parse(legacy.publicationEndsAt)
        : Number.NaN;
      const kind = legacy.type === "training" || legacy.type === "course" || legacy.type === "expo"
        || legacy.type === "field-application" || legacy.type === "event" || legacy.type === "other"
        ? legacy.type
        : "event";
      const location = typeof legacy.location === "string" ? legacy.location : "";
      const timestamp = now.toISOString();
      const activity: ActivityRecord = {
        id,
        title,
        kind,
        description: typeof legacy.description === "string" ? legacy.description : "",
        startsAt,
        endsAt,
        locationKind: /online|virtual|remot/i.test(location) ? "virtual" : "in-person",
        location,
        onlineUrl: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        registrationUrl: "",
        linkedEntities: typeof legacy.organizer === "string" ? [legacy.organizer] : [],
        flyer: "",
        featured: legacy.featured === true,
        visible: publicationStartsAt <= now.getTime() && publicationEndsAt >= now.getTime(),
        reviewed: true,
        source: {
          id: "legacy-corpus",
          name: "Repositorio de actividades",
          email: "",
          role: "admin",
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await writeFile(join(this.directory, `${id}.yml`), stringify(activity), "utf8");
      importedIds.add(id);
    }
  }

  async create(
    input: ActivityInput,
    source: ActivityRecord["source"],
    now = new Date(),
  ): Promise<ActivityRecord> {
    const id = `activity-${now.getTime()}-${randomUUID()}`;
    const timestamp = now.toISOString();
    const activity: ActivityRecord = {
      ...input,
      id,
      visible: false,
      reviewed: false,
      source,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, `${id}.yml`), stringify(activity), "utf8");
    return activity;
  }

  async update(
    id: string,
    patch: Partial<ActivityInput> & { visible?: boolean; reviewed?: boolean },
  ): Promise<ActivityRecord | undefined> {
    const current = (await this.list()).find((activity) => activity.id === id);
    if (!current) return undefined;
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await writeFile(join(this.directory, `${id}.yml`), stringify(updated), "utf8");
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const current = (await this.list()).find((activity) => activity.id === id);
    if (!current) return false;
    await unlink(join(this.directory, `${id}.yml`));
    return true;
  }
}
