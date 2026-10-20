import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PoolForm } from '../../components/PoolForm';
import { PoolImageCarousel } from '../../components/PoolImageCarousel';
import { useAuth } from '../../context/AuthContext';
import { EMPTY_POOL, type Pool, type PoolInput, type PoolNotification } from '../../types/pool';
import '../pools.css';

type PoolTab = 'active' | 'historical';

async function apiRequest<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers });
  const result = await response.json() as T | { message?: string };
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result ? result.message : undefined;
    throw new Error(typeof message === 'string' ? message : `La solicitud falló (${response.status}).`);
  }
  return result as T;
}

const isPoolInput = (pool: Pool): PoolInput => ({
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

export const DealerPoolsPage: React.FC = () => {
  const { token } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [notifications, setNotifications] = useState<PoolNotification[]>([]);
  const [editing, setEditing] = useState<Pool | 'new' | null>(null);
  const [tab, setTab] = useState<PoolTab>('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agreementRequired, setAgreementRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [records, alerts] = await Promise.all([
        apiRequest<Pool[]>('/api/pools/mine', token ?? ''),
        apiRequest<PoolNotification[]>('/api/pools/me/notifications', token ?? ''),
      ]);
      setPools(records);
      setNotifications(alerts);
      setAgreementRequired(false);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudieron cargar tus pools.';
      if (message.toLocaleLowerCase().includes('acepta la versión vigente')) {
        setAgreementRequired(true);
        setPools([]);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const save = async (input: PoolInput) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const isNew = editing === 'new';
      const poolId = editing !== null && editing !== 'new' ? editing.id : '';
      const saved = await apiRequest<Pool>(
        isNew ? '/api/pools' : `/api/pools/${encodeURIComponent(poolId)}`,
        token ?? '',
        { method: isNew ? 'POST' : 'PATCH', body: JSON.stringify(input) },
      );
      await load();
      setEditing(null);
      setNotice(isNew
        ? 'Pool registrado. Quedó oculto hasta su revisión y publicación desde BackOffice.'
        : `Se actualizaron los datos del pool. Estado: ${saved.visible ? 'visible' : 'oculto'} hasta completar la revisión.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el pool.');
    } finally {
      setSaving(false);
    }
  };

  const visiblePools = pools.filter((pool) =>
    tab === 'active' ? pool.status === 'active' : pool.status !== 'active'
  );

  return (
    <main className="pools-page">
      <div className="pools-page__inner">
        <header className="pools-page__header">
          <div>
            <h1>Mis Pools</h1>
            <p>Publica oportunidades de compra colectiva y consulta sus participantes e historial.</p>
          </div>
          <Link className="pool-button pool-button--secondary" to="/portal/acuerdos">Acuerdo Dealer</Link>
        </header>

        {error && <p className="pool-message pool-message--error" role="alert">{error}</p>}
        {notice && <p className="pool-message pool-message--success" role="status">{notice}</p>}
        {agreementRequired && (
          <section className="pool-notice">
            <h2>La publicación está deshabilitada</h2>
            <p>Lee y acepta el acuerdo Dealer vigente para habilitar la página de gestión de Pools.</p>
            <Link to="/portal/acuerdos">Consultar y aceptar el acuerdo</Link>
          </section>
        )}
        {notifications.map((notification) => (
          <section className="pool-notice" key={notification.id}>
            <p>{notification.message}</p>
            {notification.status === 'expired' && notification.similarPools.length > 0 && (
              <>
                <p>Oportunidades similares vigentes en la zona de tus integrantes:</p>
                <ul>
                  {notification.similarPools.map((pool) => (
                    <li key={pool.id}><Link to="/pools">{pool.brand} {pool.product} — {pool.city}, {pool.province}</Link></li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}
        <div className="pool-tabs" role="tablist" aria-label="Historial de Pools">
          <button type="button" className={tab === 'active' ? 'is-active' : ''} onClick={() => setTab('active')}>Activos</button>
          <button type="button" className={tab === 'historical' ? 'is-active' : ''} onClick={() => setTab('historical')}>Históricos</button>
        </div>
        {!editing && !agreementRequired && (
          <button className="pool-button pool-button--primary" type="button" onClick={() => setEditing('new')}>
            Publicar un nuevo pool
          </button>
        )}
        {editing && (
          <section className="pool-panel">
            <h2>{editing === 'new' ? 'Nuevo pool' : 'Editar pool'}</h2>
            <PoolForm
              initial={editing === 'new' ? EMPTY_POOL : isPoolInput(editing)}
              saving={saving}
              onCancel={() => setEditing(null)}
              onSave={save}
            />
          </section>
        )}
        {loading ? <p className="pool-empty">Cargando pools…</p> : visiblePools.length ? (
          <div className="pool-list" style={{ marginTop: 14 }}>
            {visiblePools.map((pool) => {
              const joined = pool.members?.reduce((total, member) => total + member.quantity, 0) ?? 0;
              return (
                <article className="pool-card" key={pool.id}>
                  <div className="pool-card__heading">
                    <div>
                      <h2>{pool.brand} {pool.product} {pool.model}</h2>
                      <p className="pool-card__meta">{pool.city}, {pool.province} · {pool.visible ? 'Visible' : 'Oculto para revisión'}</p>
                    </div>
                    <PoolImageCarousel images={pool.images} label={`${pool.brand} ${pool.product}`} />
                    <span className="pool-card__meta">{pool.status === 'active' ? 'Activo' : pool.status === 'complete' ? 'Completo' : 'Incompleto'}</span>
                  </div>
                  <p className="pool-card__details">
                    <span>{joined}/{pool.targetQuantity} unidades comprometidas</span>
                    <span>Vigencia: {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(pool.validUntil))}</span>
                  </p>
                  {pool.status !== 'active' && (
                    <p className="pool-card__description">Cierre: {pool.closedAt
                      ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pool.closedAt))
                      : pool.status === 'complete' ? 'Objetivo completado' : 'Vigencia finalizada'}</p>
                  )}
                  {pool.members && pool.members.length > 0 && (
                    <details>
                      <summary>Integrantes del pool ({pool.members.length})</summary>
                      <ul className="pool-member-list">
                        {pool.members.map((member) => (
                          <li key={member.participantId}>{member.name} · {member.email} · {member.quantity} unidad(es)</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {pool.status === 'active' && (
                    <div className="pool-card__actions">
                      <button className="pool-button pool-button--secondary" type="button" onClick={() => setEditing(pool)}>Editar</button>
                      <Link className="pool-button pool-button--secondary" to="/pools">Ver pools visibles</Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          !loading && <p className="pool-empty">{tab === 'active' ? 'Todavía no publicaste pools activos.' : 'Todavía no hay pools históricos.'}</p>
        )}
      </div>
    </main>
  );
};
