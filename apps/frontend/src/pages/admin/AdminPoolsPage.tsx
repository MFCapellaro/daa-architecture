import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PoolForm } from '../../components/PoolForm';
import { PoolImageCarousel } from '../../components/PoolImageCarousel';
import { useAuth } from '../../context/AuthContext';
import { EMPTY_POOL, type Pool, type PoolInput } from '../../types/pool';
import '../pools.css';

type PoolTab = 'active' | 'historical';
interface Filters {
  dealer: string;
  product: string;
  quantity: string;
  price: string;
  capacity: string;
  zone: string;
}

const EMPTY_FILTERS: Filters = { dealer: '', product: '', quantity: '', price: '', capacity: '', zone: '' };

const apiRequest = async <T,>(url: string, token: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const result = await response.json() as T | { message?: string };
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result ? result.message : undefined;
    throw new Error(typeof message === 'string' ? message : `La solicitud falló (${response.status}).`);
  }
  return result as T;
};

const toInput = (pool: Pool): PoolInput => ({
  product: pool.product,
  brand: pool.brand,
  model: pool.model,
  description: pool.description,
  targetQuantity: pool.targetQuantity,
  unitPrice: pool.unitPrice,
  discountedUnitPrice: pool.discountedUnitPrice,
  city: pool.city,
  province: pool.province,
  paymentConditions: pool.paymentConditions,
  warranty: pool.warranty,
  validUntil: pool.validUntil,
  training: pool.training,
  afterSales: pool.afterSales,
  deliveryAvailability: pool.deliveryAvailability,
  restrictions: pool.restrictions,
  images: pool.images,
});

export const AdminPoolsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [editing, setEditing] = useState<Pool | 'new' | null>(null);
  const [tab, setTab] = useState<PoolTab>('active');
  const [visibility, setVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const records = await apiRequest<Pool[]>('/api/admin/pools', token ?? '');
      setPools(records);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudieron cargar los pools.';
      setError(message);
      if (message.toLowerCase().includes('sesión') || message.toLowerCase().includes('token')) logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => { void load(); }, [load]);

  const filteredPools = useMemo(() => pools.filter((pool) => {
    if (tab === 'active' ? pool.status !== 'active' : pool.status === 'active') return false;
    if (visibility === 'visible' && !pool.visible) return false;
    if (visibility === 'hidden' && pool.visible) return false;
    const joined = pool.members?.reduce((total, member) => total + member.quantity, 0) ?? 0;
    const matches = (value: string, target: string) =>
      !value.trim() || target.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase());
    if (!matches(filters.dealer, pool.dealer.name)) return false;
    if (!matches(filters.product, `${pool.product} ${pool.brand} ${pool.model}`)) return false;
    if (!matches(filters.zone, `${pool.city} ${pool.province}`)) return false;
    if (filters.quantity && pool.targetQuantity < Number(filters.quantity)) return false;
    if (filters.price && pool.discountedUnitPrice > Number(filters.price)) return false;
    if (filters.capacity && joined < Number(filters.capacity)) return false;
    return true;
  }), [pools, tab, visibility, filters]);

  const save = async (input: PoolInput) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const isNew = editing === 'new';
      const poolId = editing !== null && editing !== 'new' ? editing.id : '';
      await apiRequest<Pool>(
        isNew ? '/api/admin/pools' : `/api/admin/pools/${encodeURIComponent(poolId)}`,
        token ?? '',
        { method: isNew ? 'POST' : 'PATCH', body: JSON.stringify(input) },
      );
      await load();
      setEditing(null);
      setNotice(isNew
        ? 'Pool creado. Quedó oculto hasta su revisión y publicación.'
        : 'Pool actualizado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el pool.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (pool: Pool) => {
    setError(null);
    setNotice(null);
    try {
      await apiRequest<Pool>(`/api/admin/pools/${encodeURIComponent(pool.id)}`, token ?? '', {
        method: 'PATCH',
        body: JSON.stringify({ visible: !pool.visible }),
      });
      await load();
      setNotice(pool.visible ? 'Pool ocultado.' : 'Pool visible en la página pública.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar la visibilidad.');
    }
  };

  const deletePool = async (pool: Pool) => {
    setError(null);
    try {
      await apiRequest<void>(`/api/admin/pools/${encodeURIComponent(pool.id)}`, token ?? '', { method: 'DELETE' });
      await load();
      setNotice('Pool eliminado.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el pool.');
    }
  };

  const updateFilter = (key: keyof Filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className="pools-page">
      <div className="pools-page__inner">
        <header className="pools-page__header">
          <div>
            <h1>BackOffice · Pools</h1>
            <p>Revisa oportunidades, gestiona visibilidad y consulta los Dealers y participantes asociados.</p>
          </div>
          <button className="pool-button pool-button--primary" type="button" onClick={() => setEditing('new')}>
            Crear pool
          </button>
        </header>
        {error && <p className="pool-message pool-message--error" role="alert">{error}</p>}
        {notice && <p className="pool-message pool-message--success" role="status">{notice}</p>}
        <div className="pool-tabs" role="tablist" aria-label="Estado de los pools">
          <button type="button" className={tab === 'active' ? 'is-active' : ''} onClick={() => setTab('active')}>
            Activos ({pools.filter((pool) => pool.status === 'active').length})
          </button>
          <button type="button" className={tab === 'historical' ? 'is-active' : ''} onClick={() => setTab('historical')}>
            Históricos ({pools.filter((pool) => pool.status !== 'active').length})
          </button>
        </div>
        <div className="pool-filter-grid" aria-label="Filtros de pools">
          <input aria-label="Filtrar por Dealer" placeholder="Dealer" value={filters.dealer} onChange={(event) => updateFilter('dealer', event.target.value)} />
          <input aria-label="Filtrar por producto" placeholder="Producto / marca" value={filters.product} onChange={(event) => updateFilter('product', event.target.value)} />
          <input aria-label="Cantidad objetivo mínima" type="number" min="0" placeholder="Cantidad mínima" value={filters.quantity} onChange={(event) => updateFilter('quantity', event.target.value)} />
          <input aria-label="Precio por unidad máximo" type="number" min="0" placeholder="Precio máximo" value={filters.price} onChange={(event) => updateFilter('price', event.target.value)} />
          <input aria-label="Unidades comprometidas mínimas" type="number" min="0" placeholder="Capacidad comprometida" value={filters.capacity} onChange={(event) => updateFilter('capacity', event.target.value)} />
          <input aria-label="Filtrar por zona" placeholder="Ciudad / provincia" value={filters.zone} onChange={(event) => updateFilter('zone', event.target.value)} />
          <select aria-label="Filtrar por visibilidad" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}>
            <option value="all">Visibles y ocultos</option>
            <option value="visible">Visibles</option>
            <option value="hidden">Ocultos</option>
          </select>
        </div>
        {editing && (
          <section className="pool-panel">
            <h2>{editing === 'new' ? 'Nuevo pool' : 'Editar pool'}</h2>
            <PoolForm
              initial={editing === 'new' ? EMPTY_POOL : toInput(editing)}
              saving={saving}
              onCancel={() => setEditing(null)}
              onSave={save}
            />
          </section>
        )}
        {loading ? <p className="pool-empty">Cargando pools…</p> : filteredPools.length ? (
          <div className="pool-list" style={{ marginTop: 14 }}>
            {filteredPools.map((pool) => (
              <article className="pool-card" key={pool.id}>
                <div className="pool-card__heading">
                  <div>
                    <h2>{pool.brand} {pool.product} {pool.model}</h2>
                    <p className="pool-card__meta">Dealer: {pool.dealer.name} · {pool.city}, {pool.province}</p>
                  </div>
                  <span className="pool-card__meta">
                    {pool.status === 'active' ? 'Activo' : pool.status === 'complete' ? 'Completo' : 'Incompleto'}
                    {' · '}{pool.visible ? 'Visible' : 'Oculto'}
                  </span>
                </div>
                <p className="pool-card__details">
                  <span>Objetivo: {pool.targetQuantity}</span>
                  <span>Comprometido: {pool.members?.reduce((total, member) => total + member.quantity, 0) ?? 0}</span>
                  <span>Precio: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(pool.discountedUnitPrice)}</span>
                  <span>Vigencia: {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(pool.validUntil))}</span>
                </p>
                <PoolImageCarousel images={pool.images} label={`${pool.brand} ${pool.product}`} />
                <details>
                  <summary>Integrantes ({pool.members?.length ?? 0})</summary>
                  {pool.members?.length ? (
                    <ul className="pool-member-list">
                      {pool.members.map((member) => (
                        <li key={member.participantId}>{member.name} · {member.email} · {member.quantity} unidad(es)</li>
                      ))}
                    </ul>
                  ) : <p className="pool-card__description">No hay participantes asociados.</p>}
                </details>
                <div className="pool-card__actions">
                  <button className="pool-button pool-button--secondary" type="button" onClick={() => void toggleVisibility(pool)}>
                    {pool.visible ? 'Ocultar' : 'Aprobar y hacer visible'}
                  </button>
                  <button className="pool-button pool-button--secondary" type="button" onClick={() => setEditing(pool)}>Editar</button>
                  {pool.status === 'active' && !pool.members?.length && (
                    <button className="pool-button pool-button--secondary" type="button" onClick={() => void deletePool(pool)}>Eliminar</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : !loading ? <p className="pool-empty">No hay pools que coincidan con los filtros.</p> : null}
      </div>
    </main>
  );
};
