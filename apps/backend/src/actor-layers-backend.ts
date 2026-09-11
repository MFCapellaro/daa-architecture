import { randomUUID } from "node:crypto";

export type LayerStatus = "active" | "inactive";

export interface ActorLayer {
  id: string;
  name: string;
  type: string;
  status: LayerStatus;
  metadata?: Record<string, unknown>;
}

export interface Actor {
  id: string;
  name: string;
  // El importer conserva y asigna este campo al crear el Actor.
  layerIds: string[];
  [key: string]: unknown;
}

export interface CorpusDocument {
  actors: Actor[];
  layers: ActorLayer[];
  [key: string]: unknown;
}

export interface ActorLayerRepository {
  listLayers(): Promise<ActorLayer[]>;
  getLayer(layerId: string): Promise<ActorLayer | undefined>;
  createLayer(input: CreateLayerInput): Promise<ActorLayer>;
  updateLayer(layerId: string, input: UpdateLayerInput): Promise<ActorLayer>;
  setLayerStatus(layerId: string, status: LayerStatus): Promise<ActorLayer>;
  getActor(actorId: string): Promise<Actor | undefined>;
  addLayerToActor(actorId: string, layerId: string): Promise<Actor>;
  removeLayerFromActor(actorId: string, layerId: string): Promise<Actor>;
}

export interface CreateLayerInput {
  name: string;
  type: string;
  status?: LayerStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateLayerInput {
  name?: string;
  type?: string;
  status?: LayerStatus;
  metadata?: Record<string, unknown>;
}

export class LayerHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "LayerHttpError";
  }
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new LayerHttpError(400, `${field} es obligatorio`);
  }

  return value.trim();
}

function validateStatus(value: unknown): LayerStatus {
  if (value !== "active" && value !== "inactive") {
    throw new LayerHttpError(400, "status debe ser active o inactive");
  }

  return value;
}

function cloneMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  return metadata === undefined
    ? undefined
    : JSON.parse(JSON.stringify(metadata));
}

function copyDocument(document: CorpusDocument): CorpusDocument {
  return JSON.parse(JSON.stringify(document)) as CorpusDocument;
}

/**
 * Adaptador YAML de referencia.
 *
 * El callback loadDocument debe devolver el documento actual y saveDocument
 * debe reemplazarlo de forma atómica. No se reconstruyen los Actors desde
 * cero: así se conservan contact, geolocation, presence, review y cualquier
 * campo futuro del corpus.
 */
export class YamlActorLayerRepository implements ActorLayerRepository {
  constructor(
    private readonly loadDocument: () => Promise<CorpusDocument>,
    private readonly saveDocument: (document: CorpusDocument) => Promise<void>,
  ) {}

  async listLayers(): Promise<ActorLayer[]> {
    const document = await this.loadDocument();
    return document.layers.map((layer) => ({
      ...layer,
      metadata: cloneMetadata(layer.metadata),
    }));
  }

  async getLayer(layerId: string): Promise<ActorLayer | undefined> {
    const document = await this.loadDocument();
    return document.layers.find((layer) => layer.id === layerId);
  }

  async createLayer(input: CreateLayerInput): Promise<ActorLayer> {
    const document = await this.loadDocument();
    const name = requireText(input.name, "name");
    const type = requireText(input.type, "type");
    const status = input.status ?? "active";

    if (document.layers.some((layer) => layer.name === name)) {
      throw new LayerHttpError(409, "Ya existe un layer con ese nombre");
    }

    if (status !== "active" && status !== "inactive") {
      throw new LayerHttpError(400, "status debe ser active o inactive");
    }

    const layer: ActorLayer = {
      id: randomUUID(),
      name,
      type,
      status,
      metadata: cloneMetadata(input.metadata),
    };

    const next = copyDocument(document);
    next.layers.push(layer);
    await this.saveDocument(next);
    return layer;
  }

  async updateLayer(
    layerId: string,
    input: UpdateLayerInput,
  ): Promise<ActorLayer> {
    const document = await this.loadDocument();
    const index = document.layers.findIndex((layer) => layer.id === layerId);

    if (index < 0) {
      throw new LayerHttpError(404, "Layer no encontrado");
    }

    const current = document.layers[index];
    const nextName = input.name === undefined
      ? current.name
      : requireText(input.name, "name");
    const nextType = input.type === undefined
      ? current.type
      : requireText(input.type, "type");
    const nextStatus = input.status === undefined
      ? current.status
      : validateStatus(input.status);

    const duplicate = document.layers.some(
      (layer) => layer.id !== layerId && layer.name === nextName,
    );

    if (duplicate) {
      throw new LayerHttpError(409, "Ya existe un layer con ese nombre");
    }

    const updated: ActorLayer = {
      ...current,
      name: nextName,
      type: nextType,
      status: nextStatus,
      metadata: input.metadata === undefined
        ? cloneMetadata(current.metadata)
        : cloneMetadata(input.metadata),
    };

    const next = copyDocument(document);
    next.layers[index] = updated;
    await this.saveDocument(next);
    return updated;
  }

  async setLayerStatus(
    layerId: string,
    status: LayerStatus,
  ): Promise<ActorLayer> {
    return this.updateLayer(layerId, { status });
  }

  async getActor(actorId: string): Promise<Actor | undefined> {
    const document = await this.loadDocument();
    return document.actors.find((actor) => actor.id === actorId);
  }

  async addLayerToActor(actorId: string, layerId: string): Promise<Actor> {
    const document = await this.loadDocument();
    const actorIndex = document.actors.findIndex((actor) => actor.id === actorId);
    const layerExists = document.layers.some((layer) => layer.id === layerId);

    if (actorIndex < 0) {
      throw new LayerHttpError(404, "Actor no encontrado");
    }

    if (!layerExists) {
      throw new LayerHttpError(404, "Layer no encontrado");
    }

    const actor = document.actors[actorIndex];
    const layerIds = Array.isArray(actor.layerIds) ? [...actor.layerIds] : [];

    if (!layerIds.includes(layerId)) {
      layerIds.push(layerId);
    }

    const next = copyDocument(document);
    next.actors[actorIndex] = { ...actor, layerIds };
    await this.saveDocument(next);
    return next.actors[actorIndex];
  }

  async removeLayerFromActor(actorId: string, layerId: string): Promise<Actor> {
    const document = await this.loadDocument();
    const actorIndex = document.actors.findIndex((actor) => actor.id === actorId);

    if (actorIndex < 0) {
      throw new LayerHttpError(404, "Actor no encontrado");
    }

    const actor = document.actors[actorIndex];
    const layerIds = Array.isArray(actor.layerIds) ? [...actor.layerIds] : [];

    if (!layerIds.includes(layerId)) {
      throw new LayerHttpError(404, "El layer no está asignado a este Actor");
    }

    if (layerIds.length <= 1) {
      throw new LayerHttpError(
        409,
        "Un Actor debe conservar al menos un layer",
      );
    }

    const next = copyDocument(document);
    next.actors[actorIndex] = {
      ...actor,
      layerIds: layerIds.filter((id) => id !== layerId),
    };
    await this.saveDocument(next);
    return next.actors[actorIndex];
  }
}

export class ActorLayerService {
  constructor(private readonly repository: ActorLayerRepository) {}

  listCatalog() {
    return this.repository.listLayers();
  }

  createCatalogLayer(input: CreateLayerInput) {
    return this.repository.createLayer(input);
  }

  updateCatalogLayer(layerId: string, input: UpdateLayerInput) {
    return this.repository.updateLayer(layerId, input);
  }

  getActorLayers(actorId: string) {
    return this.repository.getActor(actorId).then(async (actor) => {
      if (!actor) throw new LayerHttpError(404, "Actor no encontrado");
      const catalog = await this.repository.listLayers();
      const byId = new Map(catalog.map((layer) => [layer.id, layer]));
      return (actor.layerIds ?? [])
        .map((layerId) => byId.get(layerId))
        .filter((layer): layer is ActorLayer => layer !== undefined);
    });
  }

  addLayerToActor(actorId: string, layerId: string) {
    return this.repository.addLayerToActor(actorId, layerId);
  }

  removeLayerFromActor(actorId: string, layerId: string) {
    return this.repository.removeLayerFromActor(actorId, layerId);
  }
}

/**
 * Contrato de rutas para conectarlo al router actual de server.ts.
 * Todas deben quedar detrás del middleware de autenticación administrativa.
 */
export const actorLayerRoutes = {
  catalog: {
    list: "GET /api/admin/layers",
    create: "POST /api/admin/layers",
    update: "PATCH /api/admin/layers/:layerId",
  },
  actorAssignments: {
    list: "GET /api/admin/actors/:actorId/layers",
    add: "POST /api/admin/actors/:actorId/layers/:layerId",
    remove: "DELETE /api/admin/actors/:actorId/layers/:layerId",
  },
};