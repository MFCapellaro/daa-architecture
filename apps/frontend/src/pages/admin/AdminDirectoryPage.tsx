import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CategoryManagerModal } from '../../components/CategoryManagerModal';
import { buildCategoryTree, DEFAULT_CATEGORIES, type Category } from '../../types/category';
import type { Actor as EcosystemActor, ActorType } from '../../../../../packages/domains/uas/ecosystem/src/Actor';

const ACTOR_TYPES = [
  'company',
  'person',
  'institution',
  'manufacturer',
  'supplier',
  'dealer',
  'service',
  'operator',
  'organization',
  'community',
  'training',
  'other',
] as const;
const DOMAIN_ACTOR_TYPES: readonly ActorType[] = [
  'manufacturer',
  'supplier',
  'dealer',
  'service',
  'operator',
  'organization',
  'institution',
  'community',
  'training',
  'other',
];

type RelationshipType = 'parent_of' | 'child_of' | 'represents';

interface ActorRelationship {
  targetId: string;
  type: RelationshipType;
  brand?: string;
  source?: string;
}

interface ActorYamlSchema {
  id: string;
  name: string;
  type?: string;
  kind?: string;
  layers?: string[];
  capabilities?: string[];
  isPublic?: boolean;
  relationships?: ActorRelationship[];
  identity?: {
    status?: string;
    [key: string]: unknown;
  };
  contact?: {
    address?: string | null;
    city?: string | null;
    province?: string | null;
    region?: string | null;
    country?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    [key: string]: unknown;
  };
  presence?: {
    website?: string | null;
    websiteMentioned?: boolean;
    websiteMentionsDrones?: boolean;
    websiteUnavailable?: boolean;
    [key: string]: unknown;
  };
  geolocation?: {
    latitude?: number | string | null;
    longitude?: number | string | null;
    precision?: string;
    status?: string;
    [key: string]: unknown;
  };
  source?: {
    file?: string;
    line?: number;
    section?: string;
    raw?: string;
    [key: string]: unknown;
  };
  status?: {
    verification?: string;
    imported?: boolean;
    reviewRequired?: boolean;
    [key: string]: unknown;
  } | string;
  [key: string]: unknown;
}

interface ActorRecord {
  raw: ActorYamlSchema;
  domain: EcosystemActor;
  id: string;
  name: string;
  type: string;
  layers: string[];
  isPublic: boolean;
  relationships: ActorRelationship[];
}

interface ActorForm {
  raw: ActorYamlSchema;
  id: string;
  name: string;
  type: string;
  identityStatus: string;
  layers: string[];
  capabilities: string;
  isPublic: boolean;
  relationships: ActorRelationship[];
  contact: {
    address: string;
    city: string;
    province: string;
    country: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
  presence: {
    website: string;
    websiteMentioned: boolean;
    websiteMentionsDrones: boolean;
    websiteUnavailable: boolean;
  };
  geolocation: {
    latitude: string;
    longitude: string;
    precision: string;
    status: string;
  };
  source: {
    file: string;
    line: string;
    section: string;
    raw: string;
  };
  status: {
    verification: string;
    imported: boolean;
    reviewRequired: boolean;
  };
}

const asObject = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const toActorRecord = (value: unknown): ActorRecord | null => {
  const raw = asObject(value) as ActorYamlSchema;
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const identity = raw.identity ?? {};
  const contact = raw.contact ?? {};
  const geolocation = raw.geolocation ?? {};
  const declaredType = raw.type ?? (typeof identity.type === 'string' ? identity.type : undefined);
  const domainType = DOMAIN_ACTOR_TYPES.find((type) => type === declaredType) ?? 'other';
  const coordinate = (value: number | string | null | undefined): number | undefined => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    if (typeof value !== 'string' || !value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  return {
    raw,
    domain: {
      identity: {
        id: raw.id,
        name: raw.name,
        type: domainType,
      },
      context: {
        country: contact.country ?? undefined,
        region: contact.province ?? contact.region ?? undefined,
        locality: contact.city ?? undefined,
        address: contact.address ?? undefined,
        latitude: coordinate(geolocation.latitude),
        longitude: coordinate(geolocation.longitude),
      },
      notes: typeof raw.description === 'string' ? raw.description : undefined,
    },
    id: raw.id,
    name: identity.name && typeof identity.name === 'string' ? identity.name : raw.name,
    type: raw.type ?? (typeof raw.identity?.type === 'string' ? raw.identity.type : raw.kind ?? 'company'),
    layers: Array.isArray(raw.layers) ? raw.layers.filter((layer): layer is string => typeof layer === 'string') : [],
    isPublic: typeof raw.isPublic === 'boolean' ? raw.isPublic : true,
    relationships: Array.isArray(raw.relationships)
      ? raw.relationships.filter(isActorRelationship).filter((relationship) => relationship.source !== 'ecosystem')
      : [],
  };
};

const isActorRelationship = (value: unknown): value is ActorRelationship => {
  const relationship = asObject(value);
  return typeof relationship.targetId === 'string'
    && ['parent_of', 'child_of', 'represents'].includes(String(relationship.type));
};

const toForm = (actor: ActorRecord): ActorForm => {
  const raw = actor.raw;
  const contact = raw.contact ?? {};
  const presence = raw.presence ?? {};
  const geolocation = raw.geolocation ?? {};
  const source = raw.source ?? {};
  const status = typeof raw.status === 'string' ? { verification: raw.status } : raw.status ?? {};

  return {
    raw,
    id: actor.id,
    name: actor.name,
    type: actor.type,
    identityStatus: toStringValue(actor.raw.identity?.status),
    layers: [...actor.layers],
    capabilities: Array.isArray(raw.capabilities)
      && raw.capabilities.every((capability) => typeof capability === 'string')
      ? raw.capabilities.join(', ')
      : typeof raw.capabilities === 'string' ? raw.capabilities : '',
    isPublic: actor.isPublic,
    relationships: actor.relationships.map((relationship) => ({ ...relationship })),
    contact: {
      address: toStringValue(contact.address),
      city: toStringValue(contact.city),
      province: toStringValue(contact.province ?? contact.region),
      country: toStringValue(contact.country),
      phone: toStringValue(contact.phone),
      whatsapp: toStringValue(contact.whatsapp),
      email: toStringValue(contact.email),
    },
    presence: {
      website: toStringValue(presence.website),
      websiteMentioned: presence.websiteMentioned === true,
      websiteMentionsDrones: presence.websiteMentionsDrones === true,
      websiteUnavailable: presence.websiteUnavailable === true,
    },
    geolocation: {
      latitude: toStringValue(geolocation.latitude),
      longitude: toStringValue(geolocation.longitude),
      precision: toStringValue(geolocation.precision),
      status: toStringValue(geolocation.status),
    },
    source: {
      file: toStringValue(source.file),
      line: toStringValue(source.line),
      section: toStringValue(source.section),
      raw: toStringValue(source.raw),
    },
    status: {
      verification: toStringValue(status.verification),
      imported: status.imported === true,
      reviewRequired: status.reviewRequired === true,
    },
  };
};

const buildActorPayload = (form: ActorForm): ActorYamlSchema => {
  const numberOrUndefined = (value: string) => value.trim() ? Number(value) : undefined;
  const originalStatus = typeof form.raw.status === 'object' && form.raw.status
    ? form.raw.status
    : {};
  const statusPayload = typeof form.raw.status === 'string'
    && form.raw.status === form.status.verification
    && !form.status.imported
    && !form.status.reviewRequired
    ? form.raw.status
    : {
      ...originalStatus,
      verification: form.status.verification || undefined,
      imported: form.status.imported,
      reviewRequired: form.status.reviewRequired,
    };
  const preservedRelationships = Array.isArray(form.raw.relationships)
    ? form.raw.relationships.filter((relationship) =>
      !isActorRelationship(relationship) && asObject(relationship).source !== 'ecosystem')
    : [];
  const capabilities = Array.isArray(form.raw.capabilities)
    && form.raw.capabilities.some((capability) => typeof capability !== 'string')
    ? form.raw.capabilities
    : form.capabilities.split(',').map((value) => value.trim()).filter(Boolean);

  return {
    ...form.raw,
    id: form.id,
    name: form.name.trim(),
    type: form.type,
    identity: {
      ...form.raw.identity,
      status: form.identityStatus || undefined,
    },
    layers: form.layers,
    capabilities,
    isPublic: form.isPublic,
    relationships: [...preservedRelationships, ...form.relationships],
    contact: {
      ...form.raw.contact,
      address: form.contact.address || null,
      city: form.contact.city || null,
      province: form.contact.province || null,
      country: form.contact.country || null,
      phone: form.contact.phone || null,
      whatsapp: form.contact.whatsapp || null,
      email: form.contact.email || null,
    },
    presence: {
      ...form.raw.presence,
      website: form.presence.website || null,
      websiteMentioned: form.presence.websiteMentioned,
      websiteMentionsDrones: form.presence.websiteMentionsDrones,
      websiteUnavailable: form.presence.websiteUnavailable,
    },
    geolocation: {
      ...form.raw.geolocation,
      latitude: numberOrUndefined(form.geolocation.latitude),
      longitude: numberOrUndefined(form.geolocation.longitude),
      precision: form.geolocation.precision || undefined,
      status: form.geolocation.status || undefined,
    },
    source: {
      ...form.raw.source,
      file: form.source.file || undefined,
      line: numberOrUndefined(form.source.line),
      section: form.source.section || undefined,
      raw: form.source.raw || undefined,
    },
    status: statusPayload,
  };
};

const request = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const content = await response.text();
  const payload = content ? JSON.parse(content) as Record<string, unknown> : undefined;
  if (!response.ok) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : `Error HTTP ${response.status}`);
  }
  return payload as T;
};

const newActorForm = (): ActorForm => toForm({
  raw: { id: '', name: '' },
  domain: {
    identity: { id: '', name: '', type: 'other' },
    context: {},
  },
  id: '',
  name: '',
  type: 'company',
  layers: [],
  isPublic: true,
  relationships: [],
});

const categoryDepth = (category: Category, categories: Category[]): number => {
  let depth = 0;
  let parentId = category.parentId;
  const visited = new Set([category.id]);
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = categories.find((candidate) => candidate.id === parentId);
    if (!parent) break;
    depth += 1;
    parentId = parent.parentId;
  }
  return depth;
};

const textInputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #cbd5e1',
  borderRadius: 5,
  padding: '8px 9px',
};

export const AdminDirectoryPage: React.FC = () => {
  const [actors, setActors] = useState<ActorRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ActorForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [relationshipSearch, setRelationshipSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawActors, loadedCategories] = await Promise.all([
        request<unknown[]>('/api/actors'),
        request<Category[]>('/api/categories'),
      ]);
      const normalized = rawActors.map(toActorRecord).filter((actor): actor is ActorRecord => actor !== null);
      setActors(normalized);
      setCategories(loadedCategories.length ? loadedCategories : DEFAULT_CATEGORIES);
      setForm((current) => {
        if (!current) return normalized[0] ? toForm(normalized[0]) : null;
        const refreshed = normalized.find((actor) => actor.id === current.id);
        return refreshed ? toForm(refreshed) : null;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el directorio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredActors = useMemo(() => actors.filter((actor) => {
    const matchesCategory = !filterCategory || actor.layers.includes(filterCategory);
    const query = search.toLowerCase();
    return matchesCategory && (
      actor.name.toLowerCase().includes(query)
      || actor.id.toLowerCase().includes(query)
      || toStringValue(actor.raw.contact && asObject(actor.raw.contact).city).toLowerCase().includes(query)
    );
  }), [actors, filterCategory, search]);

  const categoriesForActors = useMemo(() => buildCategoryTree(categories), [categories]);

  const updateForm = (updates: Partial<ActorForm>) => {
    setForm((current) => current ? { ...current, ...updates } : current);
  };

  const startNewActor = () => {
    setForm(newActorForm());
    setEditing(true);
    setError(null);
  };

  const saveActor = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !form.name.trim()) return;

    const id = form.id || `${form.name.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
    const payload = buildActorPayload({ ...form, id });
    setSaving(true);
    setError(null);
    try {
      await request(`/api/actors/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const actor = toActorRecord(payload);
      if (!actor) throw new Error('El servidor guardó un actor con formato inválido.');
      setActors((current) => current.some((item) => item.id === id)
        ? current.map((item) => item.id === id ? actor : item)
        : [actor, ...current]);
      setForm(toForm(actor));
      setEditing(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el actor.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublic = async (actor: ActorRecord) => {
    const isPublic = !actor.isPublic;
    setError(null);
    try {
      await request(`/api/actors/${encodeURIComponent(actor.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      });
      setActors((current) => current.map((item) => item.id === actor.id ? { ...item, isPublic } : item));
      setForm((current) => current?.id === actor.id ? { ...current, isPublic } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la visibilidad.');
    }
  };

  const deleteActor = async (actor: ActorRecord) => {
    if (!window.confirm(`¿Eliminar permanentemente a "${actor.name}"?`)) return;
    setError(null);
    try {
      await request(`/api/actors/${encodeURIComponent(actor.id)}`, { method: 'DELETE' });
      setActors((current) => current.filter((item) => item.id !== actor.id));
      setForm((current) => current?.id === actor.id ? null : current);
      setEditing(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el actor.');
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm((current) => {
      if (!current?.id) return null;
      const savedActor = actors.find((actor) => actor.id === current.id);
      return savedActor ? toForm(savedActor) : null;
    });
  };

  const saveCategory = async (
    categoryId: string | null,
    category: { name: string; color: string; parentId?: string },
  ) => {
    await request(`/api/categories${categoryId ? `/${encodeURIComponent(categoryId)}` : ''}`, {
      method: categoryId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    setCategories(await request<Category[]>('/api/categories'));
  };

  const deleteCategory = async (category: Category) => {
    await request(`/api/categories/${encodeURIComponent(category.id)}`, { method: 'DELETE' });
    setCategories(await request<Category[]>('/api/categories'));
  };

  const setRelationship = (
    targetId: string,
    type: RelationshipType,
    checked: boolean,
  ) => {
    if (!form) return;
    const current = form.relationships.filter((relationship) =>
      !(relationship.targetId === targetId && relationship.type === type));
    if (checked) current.push({ targetId, type });
    updateForm({ relationships: current });
  };

  const geocode = () => {
    if (!form) return;
    const query = [
      form.contact.address,
      form.contact.city,
      form.contact.province,
      form.contact.country,
    ].filter(Boolean).join(', ');
    if (!query) {
      setError('Completa dirección, ciudad, provincia o país antes de geocodificar.');
      return;
    }
    if (!window.google?.maps?.Geocoder) {
      setError('El geocodificador de Google Maps no está disponible.');
      return;
    }

    setGeocoding(true);
    new window.google.maps.Geocoder().geocode({ address: query }, (results, status) => {
      setGeocoding(false);
      if (status !== 'OK' || !results?.[0]) {
        setError(`No se pudieron obtener coordenadas (${status}).`);
        return;
      }
      const location = results[0].geometry.location;
      setForm((current) => current ? {
        ...current,
        geolocation: {
          ...current.geolocation,
          latitude: location.lat().toFixed(6),
          longitude: location.lng().toFixed(6),
        },
      } : current);
    });
  };

  return (
    <main style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.2fr)', gap: 20, padding: 20, height: 'calc(100vh - 64px)', boxSizing: 'border-box', background: '#f1f5f9' }}>
      <section style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20 }}>Directorio de actores</h1>
            <span style={{ color: '#64748b', fontSize: 13 }}>{filteredActors.length} registros</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setCategoryModalOpen(true)}>Categorías</button>
            <button type="button" onClick={startNewActor}>+ Nuevo actor</button>
          </div>
        </header>

        {error && <div role="alert" style={{ color: '#991b1b', background: '#fee2e2', padding: 10, borderRadius: 5 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar actor"
            aria-label="Buscar actor"
            style={textInputStyle}
          />
          <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="">Todas las categorías</option>
            {categoriesForActors.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7 }}>
          {loading ? <p style={{ padding: 16 }}>Cargando directorio…</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 9 }}>Actor</th>
                  <th style={{ textAlign: 'left', padding: 9 }}>Categorías</th>
                  <th style={{ padding: 9 }}>Public (mapa)</th>
                  <th style={{ padding: 9 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredActors.map((actor) => (
                  <tr key={actor.id} style={{ background: form?.id === actor.id ? '#eff6ff' : '#fff', borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: 9 }}>
                      <button type="button" onClick={() => { setForm(toForm(actor)); setEditing(false); }} style={{ border: 0, background: '#c9e86b', textAlign: 'left', cursor: 'pointer' }}>
                        <strong>{actor.name}</strong><br /><small>{actor.id}</small>
                      </button>
                    </td>
                    <td style={{ padding: 9 }}>{actor.layers.map((id) => categories.find((category) => category.id === id)?.name ?? id).join(', ') || '—'}</td>
                    <td style={{ padding: 9, textAlign: 'center' }}>
                      <button type="button" aria-pressed={actor.isPublic} onClick={() => void togglePublic(actor)}>
                        {actor.isPublic ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td style={{ padding: 9, textAlign: 'center' }}>
                      <button type="button" onClick={() => void deleteActor(actor)} aria-label={`Eliminar ${actor.name}`}>Borrar</button>
                    </td>
                  </tr>
                ))}
                {!filteredActors.length && <tr><td colSpan={4} style={{ padding: 16 }}>No hay actores para mostrar.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section style={{ minWidth: 0, overflow: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, padding: 18 }}>
        <h2 style={{ marginTop: 0 }}>{editing ? (form?.id ? 'Editar ficha' : 'Nuevo actor') : form ? form.name : 'Selecciona un actor'}</h2>
        {form && (editing ? (
          <form onSubmit={(event) => void saveActor(event)} style={{ display: 'grid', gap: 12 }}>
            <fieldset style={fieldsetStyle}>
              <legend>Identidad y categorías</legend>
              <label>Nombre<input required value={form.name} onChange={(event) => updateForm({ name: event.target.value })} style={textInputStyle} /></label>
              <label>Tipo
                <select value={form.type} onChange={(event) => updateForm({ type: event.target.value })} style={textInputStyle}>
                  {ACTOR_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label>Estado de identidad<input value={form.identityStatus} onChange={(event) => updateForm({ identityStatus: event.target.value })} style={textInputStyle} /></label>
              <fieldset style={fieldsetStyle}>
                <legend>Categorías (selección múltiple)</legend>
                {categoriesForActors.map((category) => (
                  <label key={category.id} style={{ display: 'block', marginLeft: categoryDepth(category, categoriesForActors) * 16 }}>
                    <input
                      type="checkbox"
                      checked={form.layers.includes(category.id)}
                      onChange={(event) => updateForm({
                        layers: event.target.checked
                          ? [...form.layers, category.id]
                          : form.layers.filter((id) => id !== category.id),
                      })}
                    />
                    {category.name}
                  </label>
                ))}
              </fieldset>
              <label>Capacidades (separadas por coma)<input value={form.capabilities} onChange={(event) => updateForm({ capabilities: event.target.value })} style={textInputStyle} /></label>
              <label style={checkboxStyle}><input type="checkbox" checked={form.isPublic} onChange={(event) => updateForm({ isPublic: event.target.checked })} /> Publicar en mapa</label>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend>Relaciones con otros nodos</legend>
                <input
                  value={relationshipSearch}
                  onChange={(event) => setRelationshipSearch(event.target.value)}
                  placeholder="Buscar actor, sucursal o marca"
                  aria-label="Buscar actor para relacionar"
                  style={textInputStyle}
                />
                {actors.filter((actor) => actor.id !== form.id && actor.name.toLowerCase().includes(relationshipSearch.toLowerCase())).map((actor) => (
                <div key={actor.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 1fr) repeat(3, minmax(85px, auto))', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>{actor.name}</span>
                  {([
                    ['child_of', 'Es sucursal de'],
                    ['parent_of', 'Es sucursal'],
                    ['represents', 'Representa marca'],
                  ] as const).map(([type, label]) => (
                    <label key={type} style={{ fontSize: 11 }}>
                      <input
                        type="checkbox"
                        checked={form.relationships.some((relationship) => relationship.targetId === actor.id && relationship.type === type)}
                        onChange={(event) => setRelationship(actor.id, type, event.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              ))}
              {!actors.some((actor) => actor.id !== form.id) && <p>Guarda otros actores antes de crear relaciones.</p>}
              <p style={{ color: '#64748b', fontSize: 12 }}>Un actor puede tener varias sucursales y representar varias marcas. Los vínculos se muestran en el mapa cuando ambos nodos tienen coordenadas y visibilidad activa.</p>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend>Contacto</legend>
              {([
                ['address', 'Dirección'],
                ['city', 'Ciudad / localidad'],
                ['province', 'Provincia / región'],
                ['country', 'País'],
                ['phone', 'Teléfono'],
                ['whatsapp', 'WhatsApp'],
                ['email', 'Email'],
              ] as const).map(([key, label]) => (
                <label key={key}>{label}<input value={form.contact[key]} onChange={(event) => updateForm({ contact: { ...form.contact, [key]: event.target.value } })} style={textInputStyle} /></label>
              ))}
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend>Presencia digital</legend>
              <label>Sitio web<input type="url" value={form.presence.website} onChange={(event) => updateForm({ presence: { ...form.presence, website: event.target.value } })} style={textInputStyle} /></label>
              {([
                ['websiteMentioned', 'Sitio mencionado en la fuente'],
                ['websiteMentionsDrones', 'El sitio menciona drones'],
                ['websiteUnavailable', 'Sitio no disponible'],
              ] as const).map(([key, label]) => (
                <label key={key} style={checkboxStyle}><input type="checkbox" checked={form.presence[key]} onChange={(event) => updateForm({ presence: { ...form.presence, [key]: event.target.checked } })} /> {label}</label>
              ))}
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend>Geolocalización</legend>
              <div style={twoColumnStyle}>
                <label>Latitud<input type="number" step="any" value={form.geolocation.latitude} onChange={(event) => updateForm({ geolocation: { ...form.geolocation, latitude: event.target.value } })} style={textInputStyle} /></label>
                <label>Longitud<input type="number" step="any" value={form.geolocation.longitude} onChange={(event) => updateForm({ geolocation: { ...form.geolocation, longitude: event.target.value } })} style={textInputStyle} /></label>
              </div>
              <label>Precisión<input value={form.geolocation.precision} onChange={(event) => updateForm({ geolocation: { ...form.geolocation, precision: event.target.value } })} style={textInputStyle} /></label>
              <label>Estado de geolocalización<input value={form.geolocation.status} onChange={(event) => updateForm({ geolocation: { ...form.geolocation, status: event.target.value } })} style={textInputStyle} /></label>
              <button type="button" disabled={geocoding} onClick={geocode}>{geocoding ? 'Buscando…' : 'Obtener coordenadas'}</button>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend>Origen y verificación</legend>
              <div style={twoColumnStyle}>
                <label>Archivo fuente<input value={form.source.file} onChange={(event) => updateForm({ source: { ...form.source, file: event.target.value } })} style={textInputStyle} /></label>
                <label>Línea<input type="number" value={form.source.line} onChange={(event) => updateForm({ source: { ...form.source, line: event.target.value } })} style={textInputStyle} /></label>
                <label>Sección<input value={form.source.section} onChange={(event) => updateForm({ source: { ...form.source, section: event.target.value } })} style={textInputStyle} /></label>
                <label>Verificación<input value={form.status.verification} onChange={(event) => updateForm({ status: { ...form.status, verification: event.target.value } })} style={textInputStyle} /></label>
              </div>
              <label style={checkboxStyle}><input type="checkbox" checked={form.status.imported} onChange={(event) => updateForm({ status: { ...form.status, imported: event.target.checked } })} /> Importado</label>
              <label style={checkboxStyle}><input type="checkbox" checked={form.status.reviewRequired} onChange={(event) => updateForm({ status: { ...form.status, reviewRequired: event.target.checked } })} /> Requiere revisión</label>
            </fieldset>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar actor'}</button>
              <button type="button" onClick={cancelEditing}>Cancelar</button>
            </div>
          </form>
        ) : form ? (
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div><strong>Tipo:</strong> {form.type}</div>
            <div><strong>Categorías:</strong> {form.layers.map((id) => categories.find((category) => category.id === id)?.name ?? id).join(', ') || '—'}</div>
            <div><strong>Contacto:</strong> {[form.contact.email, form.contact.phone, form.contact.whatsapp].filter(Boolean).join(' · ') || '—'}</div>
            <div><strong>Ubicación:</strong> {[form.contact.address, form.contact.city, form.contact.province, form.contact.country].filter(Boolean).join(', ') || '—'}</div>
            <div><strong>Web:</strong> {form.presence.website || '—'}</div>
            <div><strong>Coordenadas:</strong> {[form.geolocation.latitude, form.geolocation.longitude].filter(Boolean).join(', ') || '—'}</div>
            <div><strong>Publicar en mapa:</strong> {form.isPublic ? 'Sí' : 'No'}</div>
            <div><strong>Relaciones:</strong> {form.relationships.length}</div>
            <button type="button" onClick={() => setEditing(true)}>Editar ficha completa</button>
          </div>
        ) : (
          <p>Selecciona un actor de la lista o crea uno nuevo.</p>
        ))}
      </section>

      {categoryModalOpen && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setCategoryModalOpen(false)}
          onSave={saveCategory}
          onDelete={deleteCategory}
        />
      )}
    </main>
  );
};

const fieldsetStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  padding: 12,
};

const checkboxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
};
