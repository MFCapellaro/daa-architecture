import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PoolImageCarousel } from '../components/PoolImageCarousel';
import { useAuth } from '../context/AuthContext';
import type { Pool, PoolNotification } from '../types/pool';
import './pools.css';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const requestJson = async <T,>(url: string, token?: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init?.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers });
  const result = await response.json() as T | { message?: string };
  if (!response.ok) {
    const message = !Array.isArray(result) && result && typeof result === 'object' && 'message' in result
      ? result.message : undefined;
    throw new Error(typeof message === 'string' ? message : `La solicitud falló (${response.status}).`);
  }
  return result as T;
};

export const PoolsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [notifications, setNotifications] = useState<PoolNotification[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const publicPools = requestJson<Pool[]>('/api/pools');
      const userNotifications = token && user?.role !== 'admin'
        ? requestJson<PoolNotification[]>('/api/pools/me/notifications', token)
        : Promise.resolve([]);
      const [poolResult, notificationResult] = await Promise.all([publicPools, userNotifications]);
      setPools(poolResult);
      setNotifications(notificationResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los pools.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => { void load(); }, [load]);

  const joinPool = async (pool: Pool) => {
    if (!token) {
      setError('Inicia sesión con una cuenta de participante para sumarte a un pool.');
      return;
    }
    const quantity = quantities[pool.id] ?? 1;
    setJoining(pool.id);
    setError(null);
    setNotice(null);
    try {
      const result = await requestJson<{ message: string }>(`/api/pools/${encodeURIComponent(pool.id)}/join`, token, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      });
      setNotice(result.message);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar la participación.');
    } finally {
      setJoining(null);
    }
  };

  return (
    <main className="pools-page">
      <div className="pools-page__inner">
        <header className="pools-page__header">
          <div>
            <h1>Pools de compra</h1>
            <p>Oportunidades vigentes publicadas por Dealers. Las operaciones se acuerdan directamente con cada Dealer.</p>
          </div>
          {user?.role === 'dealer' && <Link className="pool-button pool-button--primary" to="/portal/pools">Mis pools</Link>}
          {!token && <Link className="pool-button pool-button--secondary" to="/login">Iniciar sesión</Link>}
        </header>

        {error && <p className="pool-message pool-message--error" role="alert">{error}</p>}
        {notice && <p className="pool-message pool-message--success" role="status">{notice}</p>}
        {notifications.map((notification) => (
          <section className="pool-notice" key={notification.id} aria-label="Notificación del pool">
            <p>{notification.message}</p>
            {notification.similarPools.length > 0 && (
              <>
                <p>Oportunidades similares vigentes en tu zona:</p>
                <ul>
                  {notification.similarPools.map((similar) => (
                    <li key={similar.id}>
                      <a href={`#${similar.id}`}>{similar.brand} {similar.product} — {similar.city}, {similar.province}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        ))}
        {loading ? <p className="pool-empty">Cargando pools…</p> : pools.length ? (
          <div className="pool-list">
            {pools.map((pool) => {
              const joined = pool.joinedQuantity ?? 0;
              const remaining = pool.remainingQuantity ?? pool.targetQuantity - joined;
              const ownMembership = pool.joinedByCurrentUser;
              const percent = Math.min(100, Math.round(joined / pool.targetQuantity * 100));
              return (
                <article className="pool-card" id={pool.id} key={pool.id}>
                  <div className="pool-card__heading">
                    <div>
                      <h2>{pool.brand} {pool.product} {pool.model}</h2>
                      <p className="pool-card__meta">Publicado por {pool.dealer.name} · {pool.city}, {pool.province}</p>
                    </div>
                  </div>
                  <PoolImageCarousel images={pool.images} label={`${pool.brand} ${pool.product}`} />
                  {pool.description && <p className="pool-card__description">{pool.description}</p>}
                  <p className="pool-card__price">
                    <del>{currency.format(pool.unitPrice)}</del>{' '}
                    <strong>{currency.format(pool.discountedUnitPrice)}</strong> por unidad con el pool
                  </p>
                  <div className="pool-card__details">
                    <span>Objetivo: {pool.targetQuantity} unidades</span>
                    <span>Disponibles: {remaining}</span>
                    <span>Vigente hasta: {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pool.validUntil))}</span>
                  </div>
                  <div className="pool-card__progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <div className="pool-card__details">
                    <span>Condiciones de pago: {pool.paymentConditions || 'A convenir con el Dealer'}</span>
                    {pool.warranty && <span>Garantía: {pool.warranty}</span>}
                    {pool.training && <span>Capacitación: {pool.training}</span>}
                    {pool.afterSales && <span>Post venta: {pool.afterSales}</span>}
                    {pool.deliveryAvailability && <span>Entrega: {pool.deliveryAvailability}</span>}
                    {pool.restrictions && <span>Requisitos: {pool.restrictions}</span>}
                  </div>
                  {user?.role === 'participante' && (
                    <div className="pool-join">
                      <label htmlFor={`pool-quantity-${pool.id}`}>Unidades</label>
                      <input id={`pool-quantity-${pool.id}`} className="pool-join__quantity" type="number" min="1"
                        max={remaining} value={quantities[pool.id] ?? 1} disabled={Boolean(ownMembership) || remaining < 1}
                        onChange={(event) => setQuantities((current) => ({ ...current, [pool.id]: Number(event.target.value) }))} />
                      <button className="pool-button pool-button--primary" type="button"
                        disabled={Boolean(ownMembership) || remaining < 1 || joining === pool.id}
                        onClick={() => void joinPool(pool)}>
                        {ownMembership ? 'Ya participas' : joining === pool.id ? 'Registrando…' : 'Sumarme al pool'}
                      </button>
                    </div>
                  )}
                  {!token && <p className="pool-card__description"><Link to="/login">Inicia sesión</Link> como participante para sumarte.</p>}
                  {user?.role === 'dealer' && <p className="pool-card__description">La participación se registra desde una cuenta de participante.</p>}
                </article>
              );
            })}
          </div>
        ) : (
          !loading && <p className="pool-empty">No hay pools visibles y vigentes por el momento.</p>
        )}
      </div>
    </main>
  );
};
