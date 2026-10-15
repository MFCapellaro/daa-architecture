import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

export type ParticipantRole = "participante" | "dealer";
export type AccountRole = ParticipantRole | "admin";
export type AccountStatus = "active" | "suspended";

export const PROFILE_FIELDS = [
  "organization",
  "phone",
  "address",
  "city",
  "province",
  "country",
  "latitude",
  "longitude",
  "website",
  "bio",
  "capabilities",
  "interests",
] as const;

export type ParticipantProfile = Partial<
  Record<(typeof PROFILE_FIELDS)[number], string | string[]>
>;

export interface ParticipantAccount {
  id: string;
  actorId: string;
  name: string;
  email: string;
  role: ParticipantRole;
  status: AccountStatus;
  joinedAt: string;
  passwordHash: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: string;
  profile: ParticipantProfile;
  progressiveEntry: Record<string, boolean>;
  accountType: "registered";
  dealerAgreement?: { approved: false; accepted: false };
}

export interface PublicParticipant {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  status: AccountStatus;
  joinedAt: string;
  profile: ParticipantProfile;
}

const DEFAULT_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../packages/domains/uas/participants/data/fixtures",
);

function isRegisteredAccount(value: unknown): value is ParticipantAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<ParticipantAccount>;
  return (
    account.accountType === "registered" &&
    typeof account.id === "string" &&
    typeof account.email === "string" &&
    typeof account.passwordHash === "string" &&
    (account.role === "participante" || account.role === "dealer") &&
    (account.status === "active" || account.status === "suspended")
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicParticipant(
  account: ParticipantAccount,
): PublicParticipant {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
    joinedAt: account.joinedAt,
    profile: account.profile,
  };
}

export class ParticipantAccountStore {
  constructor(private readonly directory = getDefaultParticipantAccountsDirectory()) {}

  private async loadFile(path: string): Promise<ParticipantAccount | undefined> {
    try {
      const data: unknown = parse(await readFile(path, "utf8"));
      return isRegisteredAccount(data) ? data : undefined;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async list(): Promise<ParticipantAccount[]> {
    let files: string[];
    try {
      files = await readdir(this.directory);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return [];
      }
      throw error;
    }

    const records = await Promise.all(
      files
        .filter((file) => /\.ya?ml$/i.test(file))
        .map((file) => this.loadFile(join(this.directory, file))),
    );
    return records.filter(
      (record): record is ParticipantAccount => record !== undefined,
    );
  }

  async findById(id: string): Promise<ParticipantAccount | undefined> {
    const accounts = await this.list();
    return accounts.find((account) => account.id === id);
  }

  async findByEmail(email: string): Promise<ParticipantAccount | undefined> {
    const normalized = normalizeEmail(email);
    const accounts = await this.list();
    return accounts.find((account) => normalizeEmail(account.email) === normalized);
  }

  async create(input: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<ParticipantAccount> {
    const id = randomUUID();
    const account: ParticipantAccount = {
      id,
      actorId: id,
      name: input.name,
      email: normalizeEmail(input.email),
      role: "participante",
      status: "active",
      joinedAt: new Date().toISOString(),
      passwordHash: input.passwordHash,
      accountType: "registered",
      profile: {},
      progressiveEntry: {
        identity: true,
        profile: false,
        capabilities: false,
        interests: false,
      },
    };
    await this.write(account);
    return account;
  }

  async update(
    id: string,
    patch: Partial<
      Pick<
        ParticipantAccount,
        "name" | "email" | "role" | "status" | "profile"
      >
    >,
  ): Promise<ParticipantAccount | undefined> {
    const account = await this.findById(id);
    if (!account) return undefined;
    const updated: ParticipantAccount = {
      ...account,
      ...patch,
      ...(patch.role === "dealer"
        ? { dealerAgreement: { approved: false, accepted: false } as const }
        : {}),
      email: patch.email ? normalizeEmail(patch.email) : account.email,
      profile: patch.profile ? { ...account.profile, ...patch.profile } : account.profile,
      progressiveEntry: patch.profile
        ? {
            ...account.progressiveEntry,
            profile: true,
            capabilities:
              account.progressiveEntry.capabilities ||
              Boolean(patch.profile.capabilities),
            interests:
              account.progressiveEntry.interests || Boolean(patch.profile.interests),
          }
        : account.progressiveEntry,
    };
    await this.write(updated);
    return updated;
  }

  async setPasswordResetToken(
    id: string,
    tokenHash: string,
    expiresAt: string,
  ): Promise<boolean> {
    const account = await this.findById(id);
    if (!account) return false;
    await this.write({
      ...account,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    });
    return true;
  }

  async resetPassword(
    tokenHash: string,
    passwordHash: string,
    now = new Date(),
  ): Promise<boolean> {
    const account = (await this.list()).find(
      (candidate) => candidate.passwordResetTokenHash === tokenHash,
    );
    if (
      !account ||
      !account.passwordResetExpiresAt ||
      new Date(account.passwordResetExpiresAt).getTime() <= now.getTime()
    ) {
      return false;
    }

    const {
      passwordResetTokenHash: _tokenHash,
      passwordResetExpiresAt: _expiresAt,
      ...accountWithoutResetToken
    } = account;
    await this.write({ ...accountWithoutResetToken, passwordHash });
    return true;
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    const account = await this.findById(id);
    if (!account) return;
    const {
      passwordResetTokenHash: _tokenHash,
      passwordResetExpiresAt: _expiresAt,
      ...accountWithoutResetToken
    } = account;
    await this.write(accountWithoutResetToken);
  }

  async delete(id: string): Promise<boolean> {
    const account = await this.findById(id);
    if (!account) return false;
    await unlink(join(this.directory, `${account.id}.yml`));
    return true;
  }

  private async write(account: ParticipantAccount): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(
      join(this.directory, `${account.id}.yml`),
      stringify(account),
      "utf8",
    );
  }
}

export function getDefaultParticipantAccountsDirectory(): string {
  return process.env.PARTICIPANT_ACCOUNTS_DIRECTORY
    ? resolve(process.env.PARTICIPANT_ACCOUNTS_DIRECTORY)
    : DEFAULT_DIRECTORY;
}
