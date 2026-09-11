import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { loadCatalog, recommend } from "./catalog.js";
import type { Mission } from "../../../packages/configuration/entities/Mission.js";
import { deleteActivity, deleteDirectoryEntry, donationConfigFromEnv, findSession, geocodeDirectory, hasPermission, loadActivityDirectory, loadDirectory, loadParticipants, login, saveActivity, saveDirectoryEntry, updateProgressiveEntry, type Activity, type DirectoryEntry, type Permission, type Session } from "./stage-one.js";

const appDirectory = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(appDirectory, "../../../data/uav");
const frontendDirectory = join(appDirectory, "../../frontend");
const participantsDirectory = join(appDirectory, "../../../packages/domains/uas/participants/data/fixtures");
const directoryData = join(appDirectory, "../../../packages/domains/uas/ecosystem/data/nodes");
const activitiesData = join(appDirectory, "../../../data/activities");
const sessions = new Map<string, Session>();
const SESSION_COOKIE = "daa_session";
const SESSION_MAX_AGE = 8 * 60 * 60;

function send(response: ServerResponse, status: number, body?: unknown): void { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); response.end(status === 204 ? undefined : JSON.stringify(body)); }
async function readBody(request: IncomingMessage): Promise<string> { const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks).toString("utf8"); }
function tokenFromRequest(
  request: IncomingMessage
): string | undefined {
  const cookies = readCookies(request.headers.cookie ?? "");
  const authorization = request.headers.authorization;
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  return cookies[SESSION_COOKIE] ?? bearer;
}
function adminSession(request: IncomingMessage): Session | undefined { return findSession(sessions, tokenFromRequest(request)); }
function can(request: IncomingMessage, permission: Permission): boolean { const session = adminSession(request); return !!session && hasPermission(session.account.role, permission); }
function protectedRoute(request: IncomingMessage, response: ServerResponse, permission: Permission): boolean { if (can(request, permission)) return false; send(response, 403, { error: "Permisos insuficientes", required: permission }); return true; }
function setSessionCookie(
  response: ServerResponse,
  token: string
): void {
  response.setHeader(
    "set-cookie",
    buildSessionCookie(token, SESSION_MAX_AGE)
  );
}

function clearSessionCookie(
  response: ServerResponse
): void {
  response.setHeader(
    "set-cookie",
    buildSessionCookie("", 0)
  );
}
function parseJsonBody<T>(raw: string): T | undefined { try { return JSON.parse(raw) as T; } catch { return undefined; } }
function validActivity(value: Partial<Activity>): value is Activity { return !!value.id && !!value.title && !!value.type && !!value.startsAt && !!value.location && !!value.publicationStartsAt && !!value.publicationEndsAt; }
function readCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (name) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  }

  return cookies;
}

function buildSessionCookie(token: string, maxAge: number): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}${secure}`
  ].join("; ");
}

export async function createApp() {
  const catalog = await loadCatalog(dataDirectory);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { status: "ok" });
      if (request.method === "GET" && url.pathname === "/api/maps-config") return send(response, 200, { googleMapsApiKey: process.env.GOOGLE_MAPS_BROWSER_KEY ?? "" });
      if (request.method === "GET" && url.pathname === "/api/donations") return send(response, 200, donationConfigFromEnv());
      if (request.method === "GET" && url.pathname === "/api/uavs") return send(response, 200, catalog);

      if (request.method === "GET" && url.pathname === "/api/home") {
        const [participants, directory, allActivities] = await Promise.all([loadParticipants(participantsDirectory), loadDirectory(directoryData), loadActivityDirectory(activitiesData)]);
        const activities = allActivities.filter((activity) => activity.status !== "historical");
        return send(response, 200, { participants, directory, activities, donations: donationConfigFromEnv(), stats: { participants: participants.length, directory: directory.length, activities: activities.length, historicalActivities: allActivities.length - activities.length } });
      }
      if (request.method === "GET" && url.pathname === "/api/participants") return send(response, 200, await loadParticipants(participantsDirectory));
      if (request.method === "GET" && url.pathname === "/api/directory") return send(response, 200, await loadDirectory(directoryData));
      if (request.method === "GET" && url.pathname === "/api/activities") return send(response, 200, (await loadActivityDirectory(activitiesData)).filter((activity) => activity.status !== "historical"));
      if (request.method === "GET" && url.pathname === "/api/activities/history") return send(response, 200, (await loadActivityDirectory(activitiesData)).filter((activity) => activity.status === "historical"));

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = parseJsonBody<{ username?: string; password?: string }>(await readBody(request));
        if (!body?.username || !body.password) return send(response, 422, { error: "username y password son obligatorios" });
        const session = await login(body.username, body.password);
        if (!session) return send(response, 401, { error: "Credenciales inválidas" });
        sessions.set(session.token, session); setSessionCookie(response, session.token); return send(response, 200, session.account);
      }
      if (request.method === "POST" && url.pathname === "/api/auth/logout") { const token = tokenFromRequest(request); if (token) sessions.delete(token); clearSessionCookie(response); return send(response, 204); }
      if (request.method === "GET" && url.pathname === "/api/auth/me") { const session = adminSession(request); return session ? send(response, 200, { ...session.account, permissions: session.account.role === "admin" ? ["*"] : undefined }) : send(response, 401, { error: "Sesión administrativa requerida" }); }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/participants/")) {
        if (protectedRoute(request, response, "manage_participants")) return;
        const participantId = url.pathname.split("/").pop() ?? ""; const patch = parseJsonBody<Record<string, unknown>>(await readBody(request));
        if (!patch) return send(response, 400, { error: "JSON inválido" });
        const updated = await updateProgressiveEntry(participantsDirectory, participantId, patch);
        return updated ? send(response, 200, updated) : send(response, 404, { error: "Participante no encontrado" });
      }

      if (request.method === "POST" && url.pathname === "/api/directory/geocode-batch") {
        if (protectedRoute(request, response, "manage_directory")) return;
        const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY; if (!apiKey) return send(response, 503, { error: "GOOGLE_MAPS_SERVER_KEY no está configurada" });
        return send(response, 200, { results: await geocodeDirectory(directoryData, apiKey) });
      }
      if (["POST", "PUT", "DELETE"].includes(request.method ?? "") && (url.pathname === "/api/directory" || url.pathname.startsWith("/api/directory/"))) {
        if (protectedRoute(request, response, "manage_directory")) return;
        const id = url.pathname.split("/").pop() ?? "";
        if (request.method === "DELETE") return send(response, (await deleteDirectoryEntry(directoryData, id)) ? 200 : 404, { id, deleted: true });
        const entry = parseJsonBody<DirectoryEntry>(await readBody(request)); if (!entry) return send(response, 400, { error: "JSON inválido" });
        if (!entry.id || !entry.name || !entry.type) return send(response, 422, { error: "id, name y type son obligatorios" });
        return send(response, request.method === "POST" ? 201 : 200, await saveDirectoryEntry(directoryData, entry));
      }

      if (["POST", "PUT", "DELETE"].includes(request.method ?? "") && (url.pathname === "/api/activities" || url.pathname.startsWith("/api/activities/"))) {
        if (protectedRoute(request, response, "manage_activities")) return;
        const id = url.pathname.split("/").pop() ?? "";
        if (request.method === "DELETE") return send(response, (await deleteActivity(activitiesData, id)) ? 200 : 404, { id, deleted: true });
        const activity = parseJsonBody<Partial<Activity>>(await readBody(request)); if (!activity || !validActivity(activity)) return send(response, 422, { error: "actividad incompleta" });
        return send(response, request.method === "POST" ? 201 : 200, await saveActivity(activitiesData, activity));
      }

      if (request.method === "POST" && url.pathname === "/api/recommendations") { const mission = parseJsonBody<Mission>(await readBody(request)); if (!mission) return send(response, 400, { error: "JSON inválido" }); return send(response, 200, recommend(catalog, mission)); }
      if (request.method === "GET") {
        const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname; const filePath = join(frontendDirectory, requestedPath);
        if (!filePath.startsWith(frontendDirectory)) return send(response, 403, { error: "Acceso denegado" });
        try { const content = await readFile(filePath); const contentTypes: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" }; response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" }); return response.end(content); } catch { return send(response, 404, { error: "Recurso no encontrado" }); }
      }
      return send(response, 404, { error: "Ruta no encontrada" });
    } catch (error) { return send(response, 400, { error: error instanceof Error ? error.message : "Solicitud inválida" }); }
  });
}

async function startServer(): Promise<void> { const port = Number(process.env.PORT ?? 8787); const server = await createApp(); server.on("error", (error) => { console.error("DAA UAS API failed to listen", error); process.exitCode = 1; }); server.listen(port, "0.0.0.0", () => console.log(`DAA UAS API listening on port ${port}`)); }
if (process.env.NODE_ENV !== "test") void startServer();