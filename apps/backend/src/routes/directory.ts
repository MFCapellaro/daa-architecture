import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dump, load } from 'js-yaml';

export const directoryRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const findActorsDirectory = (): string => {
  const candidates = [
    path.resolve(process.cwd(), 'packages/domains/uas/ecosystem/data/nodes'),
    path.resolve(process.cwd(), '../packages/domains/uas/ecosystem/data/nodes'),
    path.resolve(process.cwd(), '../../packages/domains/uas/ecosystem/data/nodes'),
    path.resolve(__dirname, '../../../../packages/domains/uas/ecosystem/data/nodes'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory())
    ?? candidates[candidates.length - 1];
};

const ACTORS_DIR = findActorsDirectory();
const LAYERS_FILE = path.join(path.dirname(ACTORS_DIR), 'layers.yml');
const RELATIONSHIPS_FILE = path.join(path.dirname(ACTORS_DIR), 'relationships.yml');
const TAXONOMY_TRANSLATIONS: Record<string, string> = {
  company: 'Empresas',
  institution: 'Instituciones',
  government: 'Gobierno y Organismos',
  academic: 'Universidades y Ciencia',
  association: 'Asociaciones y Cámaras',
  drones: 'Drones y Hardware',
  dealers: 'Distribuidores y Dealers',
  dealer: 'Distribuidores y Dealers',
  applicators: 'Aplicadores y Pulverización',
  software: 'Software y Analytics',
  services: 'Servicios Profesionales',
  regulatory: 'Regulación y Normativa',
  training: 'Capacitación y Cursos',
  maintenance: 'Mantenimiento y Repuestos',
  insurance: 'Aseguradoras',
};

interface ActorNode extends Record<string, unknown> {
  id: string;
  name: string;
  layers?: string[];
}

interface CategoryRecord extends Record<string, unknown> {
  id: string;
  label: string;
  color: string;
  visibleByDefault: boolean;
  parentId?: string;
}

interface CategoryDocument extends Record<string, unknown> {
  layers: CategoryRecord[];
}

const yamlFiles = (): string[] => fs.existsSync(ACTORS_DIR)
  ? fs.readdirSync(ACTORS_DIR).filter((file) => /\.ya?ml$/i.test(file))
  : [];

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const readActor = (file: string): ActorNode | undefined => {
  const filePath = path.join(ACTORS_DIR, file);
  const parsed = asRecord(load(fs.readFileSync(filePath, 'utf8')));
  const id = parsed.id ?? parsed.slug ?? file.replace(/\.ya?ml$/i, '');
  const name = parsed.name ?? asRecord(parsed.identity).name ?? parsed.title
    ?? asRecord(parsed.metadata).title ?? asRecord(parsed.metadata).name ?? id;
  if (typeof id !== 'string' || typeof name !== 'string') return undefined;

  const rawLayers = Array.isArray(parsed.layers)
    ? parsed.layers.filter((layer): layer is string => typeof layer === 'string')
    : typeof parsed.category === 'string' ? [parsed.category] : [];
  const primaryCategory = rawLayers[0] ?? String(parsed.type ?? 'company');
  const realStatus = asRecord(parsed.identity).status
    ?? (typeof parsed.status === 'string' ? parsed.status : asRecord(parsed.status).verification)
    ?? 'active';
  const contact = asRecord(parsed.contact);
  const geolocation = asRecord(parsed.geolocation);
  const location = asRecord(parsed.location);

  return {
    ...parsed,
    id,
    name,
    type: parsed.type ?? asRecord(parsed.identity).type ?? parsed.kind ?? 'company',
    typeLabel: TAXONOMY_TRANSLATIONS[String(parsed.type ?? '').toLowerCase()] ?? parsed.type ?? 'Empresa',
    primaryCategory,
    categoryLabel: TAXONOMY_TRANSLATIONS[primaryCategory.toLowerCase()] ?? primaryCategory,
    layers: rawLayers,
    translatedLayers: rawLayers.map((layer) => TAXONOMY_TRANSLATIONS[layer.toLowerCase()] ?? layer),
    description: parsed.description ?? parsed.summary ?? asRecord(parsed.metadata).description ?? asRecord(parsed.source).raw ?? '',
    isPublic: typeof parsed.isPublic === 'boolean' ? parsed.isPublic : true,
    status: String(realStatus).toUpperCase(),
    contact: {
      ...contact,
      email: contact.email ?? parsed.email ?? null,
      phone: contact.phone ?? parsed.phone ?? parsed.whatsapp ?? null,
      address: contact.address ?? parsed.address ?? null,
      city: contact.city ?? parsed.city ?? null,
      province: contact.province ?? parsed.province ?? null,
      country: contact.country ?? parsed.country ?? null,
      whatsapp: contact.whatsapp ?? parsed.whatsapp ?? null,
    },
    location: {
      ...location,
      address: contact.address ?? parsed.address ?? null,
      city: contact.city ?? parsed.city ?? null,
      province: contact.province ?? parsed.province ?? null,
      country: contact.country ?? parsed.country ?? null,
      coordinates: geolocation.latitude != null || geolocation.longitude != null
        ? { latitude: geolocation.latitude, longitude: geolocation.longitude }
        : asRecord(location.coordinates),
    },
    presence: asRecord(parsed.presence),
    geolocation: Object.keys(geolocation).length ? geolocation : {
      latitude: parsed.latitude ?? asRecord(asRecord(location).coordinates).latitude,
      longitude: parsed.longitude ?? asRecord(asRecord(location).coordinates).longitude,
    },
    relationships: Array.isArray(parsed.relationships) ? parsed.relationships : [],
  };
};

const readGlobalRelationships = (): Array<Record<string, unknown>> => {
  if (!fs.existsSync(RELATIONSHIPS_FILE)) return [];
  const document = asRecord(load(fs.readFileSync(RELATIONSHIPS_FILE, 'utf8')));
  return Array.isArray(document.relationships)
    ? document.relationships.map(asRecord)
    : [];
};

const readAllActors = (): ActorNode[] => {
  const actors = yamlFiles().flatMap((file) => {
    try {
      const actor = readActor(file);
      return actor ? [actor] : [];
    } catch (error) {
      console.error(`Error procesando archivo ${path.join(ACTORS_DIR, file)}:`, error);
      return [];
    }
  });
  const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

  for (const relationship of readGlobalRelationships()) {
    const sourceId = relationship.source;
    const targetId = relationship.target;
    if (typeof sourceId !== 'string' || typeof targetId !== 'string') continue;

    const relationshipType = String(relationship.type ?? '').toLowerCase();
    const type: string | undefined = ['represented_by', 'represents'].includes(relationshipType)
      ? 'represents'
      : ['parent', 'parent_of', 'branch'].includes(relationshipType)
        ? 'parent_of'
        : relationshipType === 'child_of' ? 'child_of' : undefined;
    const source = actorsById.get(sourceId);
    if (!type || !source) continue;

    const edge = {
      targetId,
      type,
      source: 'ecosystem',
      brand: asRecord(relationship.context).brand,
    };
    const current = Array.isArray(source.relationships) ? source.relationships : [];
    if (!current.some((item) => {
      const existing = asRecord(item);
      return existing.targetId === targetId && existing.type === type;
    })) {
      source.relationships = [...current, edge];
    }
  }

  return actors;
};

const findActorFile = (actorId: string): string | undefined => {
  if (!actorId || actorId !== path.basename(actorId)) return undefined;
  for (const file of yamlFiles()) {
    const parsed = asRecord(load(fs.readFileSync(path.join(ACTORS_DIR, file), 'utf8')));
    if (parsed.id === actorId || parsed.slug === actorId || file.replace(/\.ya?ml$/i, '') === actorId) {
      return path.join(ACTORS_DIR, file);
    }
  }
};

const readCategoryDocument = (): CategoryDocument => {
  if (!fs.existsSync(LAYERS_FILE)) return { layers: [] };
  const parsed = asRecord(load(fs.readFileSync(LAYERS_FILE, 'utf8')));
  if (!Array.isArray(parsed.layers)) throw new Error(`Formato de categorías inválido en ${LAYERS_FILE}`);
  return parsed as CategoryDocument;
};

const writeCategoryDocument = (document: CategoryDocument) => {
  fs.writeFileSync(LAYERS_FILE, dump(document, { noRefs: true, lineWidth: 120 }), 'utf8');
};

const getCategories = (): CategoryRecord[] => {
  const categories = new Map<string, CategoryRecord>();
  for (const item of readCategoryDocument().layers) {
    if (item && typeof item.id === 'string' && typeof item.label === 'string') {
      categories.set(item.id, {
        ...item,
        color: typeof item.color === 'string' ? item.color : '#64748b',
        visibleByDefault: item.visibleByDefault !== false,
      });
    }
  }

  for (const actor of readAllActors()) {
    for (const id of actor.layers ?? []) {
      if (categories.has(id)) continue;
      categories.set(id, {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        color: '#64748b',
        visibleByDefault: true,
      });
    }
  }
  return [...categories.values()];
};

const assertAcyclicActorHierarchy = (actorId: string, relationships: unknown) => {
  const graph = new Map<string, string[]>();
  const addRelationship = (sourceId: string, relationship: Record<string, unknown>) => {
    const targetId = relationship.targetId;
    if (typeof targetId !== 'string') return;
    let parentId: string | undefined;
    let childId: string | undefined;
    if (relationship.type === 'parent_of') {
      parentId = sourceId;
      childId = targetId;
    } else if (relationship.type === 'child_of') {
      parentId = targetId;
      childId = sourceId;
    }
    if (!parentId || !childId) return;
    const children = graph.get(parentId) ?? [];
    children.push(childId);
    graph.set(parentId, children);
    if (!graph.has(childId)) graph.set(childId, []);
  };

  for (const actor of readAllActors()) {
    const actorRelationships = actor.id === actorId
      ? relationships
      : actor.relationships;
    if (Array.isArray(actorRelationships)) {
      actorRelationships.forEach((relationship) => addRelationship(actor.id, asRecord(relationship)));
    }
  }
  if (!graph.has(actorId) && Array.isArray(relationships)) {
    relationships.forEach((relationship) => addRelationship(actorId, asRecord(relationship)));
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return false;
    if (visited.has(nodeId)) return true;
    visiting.add(nodeId);
    for (const childId of graph.get(nodeId) ?? []) {
      if (!visit(childId)) return false;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return true;
  };

  for (const nodeId of graph.keys()) {
    if (!visit(nodeId)) throw new Error('Las relaciones de sucursales no pueden formar ciclos.');
  }
};

const serializeCategory = (category: CategoryRecord) => ({
  ...category,
  name: category.label,
});

const saveActor = (actorId: string, value: unknown): string => {
  if (!/^[a-zA-Z0-9_-]+$/.test(actorId)) throw new Error('El identificador del actor contiene caracteres inválidos.');
  const incoming = asRecord(value);
  if (!Object.keys(incoming).length) throw new Error('El actor debe ser un objeto.');
  if (!fs.existsSync(ACTORS_DIR)) throw new Error('La carpeta ecosystem/data/nodes no existe.');

  const targetPath = findActorFile(actorId) ?? path.join(ACTORS_DIR, `${actorId}.yml`);
  const existing = fs.existsSync(targetPath) ? asRecord(load(fs.readFileSync(targetPath, 'utf8'))) : {};
  const merged: Record<string, unknown> = { ...existing, ...incoming, id: actorId };

  for (const key of ['identity', 'contact', 'presence', 'geolocation', 'source', 'status']) {
    const oldValue = existing[key];
    const newValue = incoming[key];
    if (oldValue && typeof oldValue === 'object' && !Array.isArray(oldValue)
      && newValue && typeof newValue === 'object' && !Array.isArray(newValue)) {
      merged[key] = { ...oldValue, ...newValue };
    }
  }

  assertAcyclicActorHierarchy(actorId, merged.relationships);
  fs.writeFileSync(targetPath, dump(merged, { noRefs: true, lineWidth: 120 }), 'utf8');
  return targetPath;
};

directoryRouter.get('/api/actors', (req: Request, res: Response) => {
  try {
    let actors = readAllActors();
    if (req.query.publicOnly === 'true') actors = actors.filter((actor) => actor.isPublic !== false);
    return res.json(actors);
  } catch (error) {
    console.error('Error al cargar el directorio:', error);
    return res.status(500).json({ error: 'Error al cargar los actores.' });
  }
});

directoryRouter.get('/api/categories', (_req: Request, res: Response) => {
  try {
    return res.json(getCategories().map(serializeCategory));
  } catch (error) {
    console.error('Error al cargar las categorías:', error);
    return res.status(500).json({ error: 'No se pudieron cargar las categorías.' });
  }
});

const saveCategory = (categoryId: string | undefined, req: Request, res: Response) => {
  try {
    const name = req.body?.name;
    const color = req.body?.color;
    const parentId: unknown = req.body?.parentId;
    if (typeof name !== 'string' || !name.trim() || typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Nombre y color válido son obligatorios.' });
    }

    const document = readCategoryDocument();
    const knownCategories = getCategories();
    const knownIds = new Set(knownCategories.map((category) => category.id));
    if (categoryId && !knownIds.has(categoryId)) return res.status(404).json({ error: 'Categoría no encontrada.' });

    const id = categoryId ?? name.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!id) return res.status(400).json({ error: 'El nombre no produce un identificador válido.' });
    if (!categoryId && knownIds.has(id)) return res.status(409).json({ error: 'Ya existe una categoría con ese identificador.' });
    if (parentId !== undefined && (typeof parentId !== 'string' || parentId === id || !knownIds.has(parentId))) {
      return res.status(400).json({ error: 'La categoría padre seleccionada no es válida.' });
    }

    const current = document.layers.find((category) => category.id === id);
    const parents = new Map(document.layers.map((category) => [category.id, category.parentId]));
    let ancestor = parentId as string | undefined;
    const visited = new Set([id]);
    while (ancestor) {
      if (visited.has(ancestor)) return res.status(400).json({ error: 'La jerarquía no puede contener ciclos.' });
      visited.add(ancestor);
      ancestor = parents.get(ancestor);
    }

    const next: CategoryRecord = {
      ...current,
      id,
      label: name.trim(),
      color,
      visibleByDefault: current?.visibleByDefault ?? true,
    };
    if (parentId) next.parentId = parentId as string;
    else delete next.parentId;

    document.layers = current
      ? document.layers.map((category) => category.id === id ? next : category)
      : [...document.layers, next];
    writeCategoryDocument(document);
    return res.status(categoryId ? 200 : 201).json(serializeCategory(next));
  } catch (error) {
    console.error('Error al guardar categoría:', error);
    return res.status(500).json({ error: 'No se pudo guardar la categoría.' });
  }
};

directoryRouter.post('/api/categories', (req, res) => saveCategory(undefined, req, res));
directoryRouter.put('/api/categories/:id', (req, res) => saveCategory(req.params.id, req, res));

directoryRouter.delete('/api/categories/:id', (req, res) => {
  try {
    const document = readCategoryDocument();
    const category = getCategories().find((entry) => entry.id === req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada.' });
    if (document.layers.some((entry) => entry.parentId === category.id)) {
      return res.status(409).json({ error: 'Mueve o elimina primero las categorías hijas.' });
    }
    if (readAllActors().some((actor) => actor.layers?.includes(category.id))) {
      return res.status(409).json({ error: 'La categoría está asignada a uno o más actores.' });
    }
    document.layers = document.layers.filter((entry) => entry.id !== category.id);
    writeCategoryDocument(document);
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return res.status(500).json({ error: 'No se pudo eliminar la categoría.' });
  }
});

directoryRouter.put('/api/actors/:id', (req: Request, res: Response) => {
  try {
    const actorId = req.params.id;
    if (typeof actorId !== 'string') return res.status(400).json({ error: 'Identificador de actor inválido.' });
    const file = saveActor(actorId, req.body);
    return res.status(200).json({ success: true, id: actorId, file: path.basename(file) });
  } catch (error) {
    console.error(`Error al guardar el actor ${req.params.id}:`, error);
    return res.status(400).json({ error: error instanceof Error ? error.message : 'No se pudo guardar el actor.' });
  }
});

directoryRouter.patch('/api/actors/:id', (req: Request, res: Response) => {
  try {
    const actorId = req.params.id;
    if (typeof actorId !== 'string') return res.status(400).json({ error: 'Identificador de actor inválido.' });
    if (typeof req.body?.isPublic !== 'boolean') {
      return res.status(400).json({ error: 'isPublic debe ser un valor booleano.' });
    }
    const file = findActorFile(actorId);
    if (!file) return res.status(404).json({ error: 'Actor no encontrado.' });
    const actor = load(fs.readFileSync(file, 'utf8'));
    saveActor(actorId, { ...asRecord(actor), isPublic: req.body.isPublic });
    return res.json({ success: true, id: actorId, isPublic: req.body.isPublic });
  } catch (error) {
    console.error(`Error al cambiar la visibilidad del actor ${req.params.id}:`, error);
    return res.status(500).json({ error: 'No se pudo cambiar la visibilidad del actor.' });
  }
});

directoryRouter.delete('/api/actors/:id', (req: Request, res: Response) => {
  try {
    const actorId = req.params.id;
    if (typeof actorId !== 'string') return res.status(400).json({ error: 'Identificador de actor inválido.' });
    const file = findActorFile(actorId);
    if (!file) return res.status(404).json({ error: 'Actor no encontrado.' });
    for (const otherFile of yamlFiles()) {
      const otherPath = path.join(ACTORS_DIR, otherFile);
      if (otherPath === file) continue;
      const actor = asRecord(load(fs.readFileSync(otherPath, 'utf8')));
      if (!Array.isArray(actor.relationships)) continue;
      const relationships = actor.relationships.filter((relationship) =>
        asRecord(relationship).targetId !== actorId);
      if (relationships.length !== actor.relationships.length) {
        fs.writeFileSync(otherPath, dump({ ...actor, relationships }, { noRefs: true, lineWidth: 120 }), 'utf8');
      }
    }
    fs.unlinkSync(file);
    return res.status(204).end();
  } catch (error) {
    console.error(`Error al eliminar el actor ${req.params.id}:`, error);
    return res.status(500).json({ error: 'No se pudo eliminar el actor.' });
  }
});
