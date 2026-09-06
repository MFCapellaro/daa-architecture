import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { loadCatalog, recommend } from "./catalog.js";
import type { Mission } from "../../../packages/configuration/entities/Mission.js";
import { deleteDirectoryEntry, findSession, geocodeDirectory, loadActivityDirectory, loadDirectory, loadParticipants, login, saveDirectoryEntry, updateProgressiveEntry, type DirectoryEntry, type Session } from "./stage-one.js";

const appDirectory = dirname(fileURLToPath(import.meta.url));
const dataDirectory = join(appDirectory, "../../../data/uav");
const frontendDirectory = join(appDirectory, "../../frontend");
const participantsDirectory = join(appDirectory, "../../../packages/domains/uas/participants/data/fixtures");
const directoryData = join(appDirectory, "../../../packages/domains/uas/ecosystem/data/nodes");
const activitiesData = join(appDirectory, "../../../data/activities");
const sessions = new Map<string, Session>();

function send(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
  response.end(JSON.stringify(body));
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

export async function createApp() {
  const catalog = await loadCatalog(dataDirectory);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (request.method === "GET" && url.pathname === "/api/health") return send(response, 200, { status: "ok" });
      if (request.method === "GET" && url.pathname === "/api/maps-config") return send(response, 200, { googleMapsApiKey: process.env.GOOGLE_MAPS_BROWSER_KEY ?? "" });
      if (request.method === "GET" && url.pathname === "/api/uavs") return send(response, 200, catalog);
      if (request.method === "GET" && url.pathname === "/api/home") {
        const [participants, directory, allActivities] = await Promise.all([loadParticipants(participantsDirectory), loadDirectory(directoryData), loadActivityDirectory(activitiesData)]);
        const activities = allActivities.filter((activity) => activity.status !== "historical");
        return send(response, 200, { participants, directory, activities, stats: { participants: participants.length, directory: directory.length, activities: activities.length, historicalActivities: allActivities.length - activities.length } });
      }
      if (request.method === "GET" && url.pathname === "/api/participants") return send(response, 200, await loadParticipants(participantsDirectory));
      if (request.method === "GET" && url.pathname === "/api/directory") return send(response, 200, await loadDirectory(directoryData));
      if (request.method === "GET" && url.pathname === "/api/activities") return send(response, 200, (await loadActivityDirectory(activitiesData)).filter((activity) => activity.status !== "historical"));
      if (request.method === "GET" && url.pathname === "/api/activities/history") return send(response, 200, (await loadActivityDirectory(activitiesData)).filter((activity) => activity.status === "historical"));
      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = JSON.parse(await readBody(request)) as { email?: string; password?: string };
        const session = login(body.email ?? "", body.password ?? "");
        if (!session) return send(response, 401, { error: "Credenciales inválidas" });
        sessions.set(session.token, session);
        return send(response, 200, session);
      }
      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const session = adminSession(request);
        return session ? send(response, 200, session.account) : send(response, 401, { error: "Sesión administrativa requerida" });
      }
      if (request.method === "PATCH" && url.pathname.startsWith("/api/participants/")) {
        if (!adminSession(request)) return send(response, 403, { error: "Sólo el administrador puede modificar participantes" });
        const participantId = url.pathname.split("/").pop() ?? "";
        const updated = await updateProgressiveEntry(participantsDirectory, participantId, JSON.parse(await readBody(request)));
        return updated ? send(response, 200, updated) : send(response, 404, { error: "Participante no encontrado" });
      }
      if (request.method === "POST" && url.pathname === "/api/directory/geocode-batch") {
        if (!adminSession(request)) return send(response, 403, { error: "Sólo el administrador puede geocodificar el directorio" });
        const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
        if (!apiKey) return send(response, 503, { error: "GOOGLE_MAPS_SERVER_KEY no está configurada" });
        return send(response, 200, { results: await geocodeDirectory(directoryData, apiKey) });
      }
      if (["POST", "PUT", "DELETE"].includes(request.method ?? "") && (url.pathname === "/api/directory" || url.pathname.startsWith("/api/directory/"))) {
        if (!adminSession(request)) return send(response, 403, { error: "Sólo el administrador puede operar el directorio" });
        const id = url.pathname.split("/").pop() ?? "";
        if (request.method === "DELETE") return send(response, (await deleteDirectoryEntry(directoryData, id)) ? 200 : 404, { id, deleted: true });
        const entry = JSON.parse(await readBody(request)) as DirectoryEntry;
        if (!entry.id || !entry.name || !entry.type) return send(response, 422, { error: "id, name y type son obligatorios" });
        return send(response, 200, await saveDirectoryEntry(directoryData, entry));
      }
      if (request.method === "POST" && url.pathname === "/api/recommendations") {
        const mission = JSON.parse(await readBody(request)) as Mission;
        return send(response, 200, recommend(catalog, mission));
      }
      if (request.method === "GET") {
        const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
        const filePath = join(frontendDirectory, requestedPath);
        if (!filePath.startsWith(frontendDirectory)) return send(response, 403, { error: "Acceso denegado" });
        try {
          const content = await readFile(filePath);
          const contentTypes: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
          response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
          return response.end(content);
        } catch {
          return send(response, 404, { error: "Recurso no encontrado" });
        }
      }
      return send(response, 404, { error: "Ruta no encontrada" });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Solicitud inválida" });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8787);
  const server = await createApp();
  server.listen(port, () => console.log(`DAA UAS API listening on http://localhost:${port}`));
}

function adminSession(request: IncomingMessage): Session | undefined {
  return findSession(sessions, request.headers.authorization?.replace(/^Bearer\s+/i, ""));
}