import { randomUUID } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "yaml";
import type { ProgressiveEntry } from "../../../packages/domains/uas/participants/src/ProgressiveEntry.js";
import { deriveParticipantInformationStatus } from "../../../packages/domains/uas/participants/src/ProgressiveEntry.js";

export type AccountRole = "admin";
export interface Account { id: string; email: string; role: AccountRole; participantId?: string; }
export interface Session { token: string; account: Account; }
export interface DirectoryEntry {
  id: string;
  name: string;
  type: string;
  status: string;
  layers: string[];
  capabilities: string[];
  location?: { address?: string; city?: string; province?: string; country?: string; coordinates?: { lat: number; lng: number }; geocoding?: { provider: string; status: "resolved" | "failed"; precision?: string; geocodedAt: string } };
}
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

const accounts: Array<Account & { password: string }> = [
  { id: "account-admin-001", email: "admin@dronsair.ar", password: "admin", role: "admin" }
];

export function login(email: string, password: string): Session | undefined {
  const account = accounts.find((candidate) => candidate.email === email && candidate.password === password);
  if (!account) return undefined;
  const { password: _password, ...publicAccount } = account;
  return { token: randomUUID(), account: publicAccount };
}

export function findSession(sessions: Map<string, Session>, token: string | undefined): Session | undefined {
  return token ? sessions.get(token) : undefined;
}

export async function loadParticipants(directory: string): Promise<ParticipantView[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
  return Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(join(directory, file), "utf8")) as { id: string; actorId: string; status: string; joinedAt: string; progressiveEntry: ProgressiveEntry };
    return { id: raw.id, actorId: raw.actorId, status: raw.status, joinedAt: new Date(raw.joinedAt).toISOString(), progressiveEntry: raw.progressiveEntry, informationStatus: deriveParticipantInformationStatus(raw.progressiveEntry) };
  }));
}

export async function updateProgressiveEntry(directory: string, participantId: string, patch: Partial<ProgressiveEntry>): Promise<ParticipantView | undefined> {
  const participants = await loadParticipants(directory);
  const participant = participants.find((item) => item.id === participantId);
  if (!participant) return undefined;
  const updated = { ...participant.progressiveEntry, ...patch, participantId };
  await writeFile(join(directory, `${participantId}.yml`), stringify({ id: participant.id, actorId: participant.actorId, status: participant.status, joinedAt: participant.joinedAt.slice(0, 10), progressiveEntry: updated }), "utf8");
  return { ...participant, progressiveEntry: updated, informationStatus: deriveParticipantInformationStatus(updated) };
}

export async function loadDirectory(directory: string): Promise<DirectoryEntry[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
  return Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(join(directory, file), "utf8")) as Record<string, unknown>;
    const identity = (raw.identity ?? {}) as Record<string, unknown>;
    const context = (raw.context ?? raw.geolocation ?? {}) as Record<string, unknown>;
    const contact = (raw.contact ?? {}) as Record<string, unknown>;
    const location = { address: String(context.address ?? raw.address ?? contact.address ?? "") || undefined, city: context.city as string | undefined, province: context.province as string | undefined, country: context.country as string | undefined };
    const latitude = context.latitude as number | undefined;
    const longitude = context.longitude as number | undefined;
    if (typeof latitude === "number" && Number.isFinite(latitude) && typeof longitude === "number" && Number.isFinite(longitude)) location.coordinates = { lat: latitude, lng: longitude };
    const geocoding = raw.geocoding as DirectoryEntry["location"]["geocoding"];
    return { id: String(raw.id ?? file.replace(/\.ya?ml$/, "")), name: String(raw.name ?? raw.id ?? file), type: String(raw.type ?? "other"), status: String(identity.status ?? "unknown"), layers: Array.isArray(raw.layers) ? raw.layers.map(String) : [], capabilities: Array.isArray(raw.capabilities) ? raw.capabilities.map(String) : [], location: { ...location, geocoding } };
  }));
}

export async function loadActivities(path: string, now = new Date()): Promise<Activity[]> {
  const raw = parse(await readFile(path, "utf8")) as { activities?: Activity[] };
  return (raw.activities ?? []).map((activity) => ({
    ...activity,
    status: new Date(activity.publicationEndsAt).getTime() < now.getTime()
      ? "historical"
      : new Date(activity.publicationStartsAt).getTime() > now.getTime()
        ? "scheduled"
        : "published"
  }));
}

export async function loadActivityDirectory(directory: string, now = new Date()): Promise<Activity[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
  const activities = await Promise.all(files.map(async (file) => {
    const raw = parse(await readFile(join(directory, file), "utf8")) as Activity;
    return raw;
  }));
  return activities.map((activity) => ({
    ...activity,
    status: new Date(activity.publicationEndsAt).getTime() < now.getTime()
      ? "historical"
      : new Date(activity.publicationStartsAt).getTime() > now.getTime()
        ? "scheduled"
        : "published"
  }));
}

export async function saveDirectoryEntry(directory: string, entry: DirectoryEntry): Promise<DirectoryEntry> {
  const fileName = `${entry.id.replace(/[^a-z0-9-]/gi, "-")}.yml`;
  await writeFile(join(directory, fileName), stringify({
    id: entry.id,
    name: entry.name,
    type: entry.type,
    identity: { status: entry.status },
    layers: entry.layers,
    capabilities: entry.capabilities,
    context: entry.location,
    geocoding: entry.location?.geocoding
  }), "utf8");
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
      const payload = await response.json() as { status?: string; results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } }; geometry?: { location_type?: string } }> };
      const location = payload.results?.[0]?.geometry?.location;
      if (payload.status !== "OK" || typeof location?.lat !== "number" || typeof location.lng !== "number") {
        results.push({ id: entry.id, name: entry.name, address, status: "failed", error: payload.status ?? "geocoding_failed" });
        continue;
      }
      const updated: DirectoryEntry = { ...entry, location: { ...entry.location, address, coordinates: { lat: location.lat, lng: location.lng }, geocoding: { provider: "google", status: "resolved", precision: payload.results?.[0]?.geometry?.location_type, geocodedAt: now.toISOString() } } };
      await saveDirectoryEntry(directory, updated);
      results.push({ id: entry.id, name: entry.name, address, status: "resolved", precision: updated.location?.geocoding?.precision, coordinates: updated.location?.coordinates });
    } catch (error) {
      results.push({ id: entry.id, name: entry.name, address, status: "failed", error: error instanceof Error ? error.message : "geocoding_failed" });
    }
  }
  return results;
}