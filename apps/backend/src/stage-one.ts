import { randomUUID } from "node:crypto";
import * as bcrypt from "bcryptjs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import type { ProgressiveEntry } from "../../../packages/domains/uas/participants/src/ProgressiveEntry.js";
import { deriveParticipantInformationStatus } from "../../../packages/domains/uas/participants/src/ProgressiveEntry.js";
import type { EcosystemNode } from "../../../packages/domains/uas/ecosystem/foundation/EcosystemNode.js";

export type AccountRole = "admin" | "editor" | "reviewer";

export interface Account {
  id: string;
  username: string;
  role: AccountRole;
  participantId?: string;
}

export interface Session {
  token: string;
  account: Account;
  expiresAt: number;
}

type StoredAccount = Account & { passwordHash: string };

function getAccounts(): StoredAccount[] {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";

  return [
    {
      id: "account-admin-001",
      username,
      passwordHash,
      role: "admin"
    }
  ];
}

export async function login(
  username: string,
  password: string
): Promise<Session | undefined> {
  const account = getAccounts().find(
    (candidate) => candidate.username === username
  );

  if (!account || !account.passwordHash) return undefined;
  if (!(await bcrypt.compare(password, account.passwordHash))) return undefined;

  const { passwordHash: _passwordHash, ...publicAccount } = account;

  return {
    token: randomUUID(),
    account: publicAccount,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  };
}

export function findSession(
  sessions: Map<string, Session>,
  token: string | undefined
): Session | undefined {
  if (!token) return undefined;

  const session = sessions.get(token);
  if (!session) return undefined;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return undefined;
  }

  return session;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  type: string;
  status: string;
  layers: string[];
  capabilities: string[];
  location?: {
    address?: string;
    city?: string;
    province?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    geocoding?: {
      provider: string;
      status: "resolved" | "failed";
      precision?: string;
      geocodedAt: string;
    };
  };
}

type DirectoryLocation = NonNullable<DirectoryEntry["location"]>;

export interface Activity {
  id: string;
  title: string;
  type: "event" | "expo" | "course" | "meeting";
  startsAt: string;
  endsAt?: string;
  location: string;
  description: string;
  status: "published" | "scheduled" | "historical";
  publicationStartsAt: string;
  publicationEndsAt: string;
  organizer?: string;
}

export interface ParticipantView {
  id: string;
  actorId: string;
  status: string;
  joinedAt: string;
  informationStatus: string;
  progressiveEntry: ProgressiveEntry;
}

export async function loadParticipants(directory: string): Promise<ParticipantView[]> {
  const files = (await readdir(directory)).filter((file) => /\.ya?ml$/.test(file));
  return Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(join(directory, file), "utf8")) as {
      id: string; actorId: string; status: string; joinedAt: string;
      progressiveEntry: ProgressiveEntry;
    };
    return {
      id: raw.id,
      actorId: raw.actorId,
      status: raw.status,
      joinedAt: new Date(raw.joinedAt).toISOString(),
      progressiveEntry: raw.progressiveEntry,
      informationStatus: deriveParticipantInformationStatus(raw.progressiveEntry)
    };
  }));
}

export async function updateProgressiveEntry(
  directory: string,
  participantId: string,
  patch: Partial<ProgressiveEntry>
): Promise<ParticipantView | undefined> {
  const participant = (await loadParticipants(directory)).find((item) => item.id === participantId);
  if (!participant) return undefined;

  const updated = { ...participant.progressiveEntry, ...patch, participantId };
  await writeFile(join(directory, `${participantId}.yml`), stringify({
    id: participant.id,
    actorId: participant.actorId,
    status: participant.status,
    joinedAt: participant.joinedAt.slice(0, 10),
    progressiveEntry: updated
  }), "utf8");

  return {
    ...participant,
    progressiveEntry: updated,
    informationStatus: deriveParticipantInformationStatus(updated)
  };
}

export async function loadNodes(directory: string): Promise<EcosystemNode[]> {
  const files = (await readdir(directory)).filter((file) => /\.ya?ml$/.test(file));

  return Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(join(directory, file), "utf8")) as Record<string, unknown>;
    const identity = (raw.identity ?? {}) as Record<string, unknown>;
    const contact = (raw.contact ?? {}) as Record<string, unknown>;
    const geolocation = (raw.geolocation ?? {}) as Record<string, unknown>;
    const presence = (raw.presence ?? {}) as Record<string, unknown>;
    const rawStatus = (raw.status ?? {}) as Record<string, unknown>;
    const latitude = geolocation.latitude;
    const longitude = geolocation.longitude;
    const hasCoordinates = typeof latitude === "number" && Number.isFinite(latitude) && typeof longitude === "number" && Number.isFinite(longitude);

    const location = typeof contact.country === "string" || hasCoordinates ? {
      city: typeof contact.city === "string" ? contact.city : undefined,
      province: typeof contact.province === "string" ? contact.province : undefined,
      country: typeof contact.country === "string" ? contact.country : "",
      ...(hasCoordinates ? { coordinates: { lat: latitude as number, lng: longitude as number } } : {})
    } : undefined;

    const verification = rawStatus.verification === "verified" || rawStatus.verification === "partial" || rawStatus.verification === "unverified" ? rawStatus.verification : "unverified";
    const type = raw.type === "company" || raw.type === "institution" || raw.type === "organization" || raw.type === "professional" || raw.type === "event" || raw.type === "media" || raw.type === "research" ? raw.type : "organization";

    return {
      id: String(raw.id ?? file.replace(/\.ya?ml$/, "")),
      name: String(raw.name ?? raw.id ?? file.replace(/\.ya?ml$/, "")),
      type,
      identity: {
        description: typeof identity.description === "string" ? identity.description : undefined,
        status: identity.status === "active" || identity.status === "inactive" || identity.status === "unknown" ? identity.status : undefined
      },
      location,
      layers: Array.isArray(raw.layers) ? raw.layers.map(String) : [],
      capabilities: Array.isArray(raw.capabilities) ? raw.capabilities.map(String) : [],
      brands: Array.isArray(raw.brands) ? raw.brands.map(String) : undefined,
      presence: Object.keys(presence).length > 0 ? {
        website: typeof presence.website === "string" ? presence.website : undefined,
        websiteMentionsDrones: typeof presence.websiteMentionsDrones === "boolean" ? presence.websiteMentionsDrones : typeof presence.websiteMentioned === "boolean" ? presence.websiteMentioned : undefined,
        socialMedia: typeof presence.socialMedia === "boolean" ? presence.socialMedia : undefined
      } : undefined,
      evidence: Array.isArray(raw.evidence) ? raw.evidence as EcosystemNode["evidence"] : [],
      status: {
        verification,
        lastChecked: typeof rawStatus.lastChecked === "string" ? rawStatus.lastChecked : undefined
      }
    };
  }));
}

export async function loadDirectory(directory: string): Promise<DirectoryEntry[]> {
  const nodes = await loadNodes(directory);
  return nodes.map((node) => {
    const location: DirectoryLocation = {
      city: node.location?.city,
      province: node.location?.province,
      country: node.location?.country
    };
    if (node.location?.coordinates) location.coordinates = node.location.coordinates;
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.identity.status ?? "unknown",
      layers: node.layers,
      capabilities: node.capabilities,
      location
    };
  });
}

export async function loadActivities(path: string, now = new Date()): Promise<Activity[]> {
  const raw = parse(await readFile(path, "utf8")) as { activities?: Activity[] };
  return (raw.activities ?? []).map((activity) => ({
    ...activity,
    status: new Date(activity.publicationEndsAt).getTime() < now.getTime() ? "historical" : new Date(activity.publicationStartsAt).getTime() > now.getTime() ? "scheduled" : "published"
  }));
}

export async function loadActivityDirectory(directory: string, now = new Date()): Promise<Activity[]> {
  const files = (await readdir(directory)).filter((file) => /\.ya?ml$/.test(file));
  const activities = await Promise.all(files.map(async (file) => parse(await readFile(join(directory, file), "utf8")) as Activity));
  return activities.map((activity) => ({
    ...activity,
    status: new Date(activity.publicationEndsAt).getTime() < now.getTime() ? "historical" : new Date(activity.publicationStartsAt).getTime() > now.getTime() ? "scheduled" : "published"
  }));
}

export async function saveDirectoryEntry(directory: string, entry: DirectoryEntry): Promise<DirectoryEntry> {
  const fileName = `${entry.id}.yml`;
  const filePath = join(directory, fileName);
  const current = parse(await readFile(filePath, "utf8").catch(() => "{}")) as Record<string, any>;
  const previousIdentity = (current.identity ?? {}) as Record<string, unknown>;
  const previousContact = (current.contact ?? {}) as Record<string, unknown>;
  const previousGeolocation = (current.geolocation ?? {}) as Record<string, unknown>;
  const coordinates = entry.location?.coordinates;

  const updatedEntry = {
    ...current,
    id: entry.id,
    name: entry.name,
    type: entry.type,
    identity: { ...previousIdentity, status: entry.status },
    layers: entry.layers,
    capabilities: entry.capabilities,
    contact: {
      ...previousContact,
      address: entry.location?.address,
      city: entry.location?.city,
      province: entry.location?.province,
      country: entry.location?.country
    },
    geolocation: coordinates ? { ...previousGeolocation, latitude: coordinates.lat, longitude: coordinates.lng } : previousGeolocation
  };

  await writeFile(filePath, stringify(updatedEntry), "utf8");
  return entry;
}

export async function deleteDirectoryEntry(directory: string, id: string): Promise<boolean> {
  const files = (await readdir(directory)).filter((file) => file.replace(/\.ya?ml$/, "") === id);
  if (!files.length) return false;
  const { unlink } = await import("node:fs/promises");
  await unlink(join(directory, files[0]));
  return true;
}

export interface GeocodingResult {
  id: string;
  name: string;
  address?: string;
  status: "resolved" | "failed" | "skipped";
  precision?: string;
  coordinates?: { lat: number; lng: number };
  error?: string;
}

export async function geocodeDirectory(directory: string, apiKey: string, now = new Date()): Promise<GeocodingResult[]> {
  const entries = await loadDirectory(directory);
  const results: GeocodingResult[] = [];

  for (const entry of entries) {
    const address = entry.location?.address || [entry.location?.city, entry.location?.province, entry.location?.country].filter(Boolean).join(", ");
    if (!address || entry.location?.coordinates) {
      results.push({ id: entry.id, name: entry.name, address, status: entry.location?.coordinates ? "skipped" : "failed", error: entry.location?.coordinates ? "already_geocoded" : "missing_address" });
      continue;
    }

    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=ar&language=es&key=${encodeURIComponent(apiKey)}`);
      const payload = await response.json() as { status?: string; results?: Array<{ geometry?: { location?: { lat?: number; lng?: number }; location_type?: string } }> };
      const location = payload.results?.[0]?.geometry?.location;
      if (payload.status !== "OK" || typeof location?.lat !== "number" || typeof location.lng !== "number") {
        results.push({ id: entry.id, name: entry.name, address, status: "failed", error: payload.status ?? "geocoding_failed" });
        continue;
      }

      const updated: DirectoryEntry = {
        ...entry,
        location: {
          ...entry.location,
          address,
          coordinates: { lat: location.lat, lng: location.lng },
          geocoding: { provider: "google", status: "resolved", precision: payload.results?.[0]?.geometry?.location_type, geocodedAt: now.toISOString() }
        }
      };
      await saveDirectoryEntry(directory, updated);
      results.push({ id: entry.id, name: entry.name, address, status: "resolved", precision: updated.location?.geocoding?.precision, coordinates: updated.location?.coordinates });
    } catch (error) {
      results.push({ id: entry.id, name: entry.name, address, status: "failed", error: error instanceof Error ? error.message : "geocoding_failed" });
    }
  }
  return results;
}