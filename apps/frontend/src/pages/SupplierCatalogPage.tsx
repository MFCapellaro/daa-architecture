import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Pool } from '../types/pool';
import type { SupplierAttribute, SupplierCategory } from '../components/SupplierCategoryManager';
import './SupplierCatalogPage.css';

type SupplierProduct = {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  characteristics: Record<string, unknown>;
  images: { url: string; alt: string }[];
  currentPrice: { currency: string; price: number | null; method: string } | null;
};

const requestJson = async <T,>(url: string, token?: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init?.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...init, headers });
  const result = await response.json() as T | { message?: string };
  if (!response.ok) {
    const message = result && typeof result === 'object' && 'message' in result
      ? result.message : undefined;
    throw new Error(typeof message === 'string' ? message : `La solicitud falló (${response.status}).`);
  }
  return result as T;
};

const normalize = (value: string): string => value.normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const readPath = (source: Record<string, unknown>, path: string): unknown => {
  let value: unknown = source;
  for (const part of path.split('.')) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
};

const formatPrice = (price: number | null | undefined, currency = 'ARS'): string => {
  if (price === null || price === undefined || !Number.isFinite(price)) return 'Consultar';
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${price.toLocaleString('es-AR')} ${currency}`;
  }
};

const matchesProduct = (pool: Pool, product: SupplierProduct): boolean => {
  const productNames = [product.name, product.model].map(normalize).filter(Boolean);
  const poolNames = [pool.product, pool.model].map(normalize).filter(Boolean);
  const sameBrand = normalize(pool.brand) === normalize(product.brand);
  return productNames.some((name) => poolNames.includes(name))
    || (sameBrand && productNames.some((name) => poolNames.some((poolName) =>
      name.length > 5 && poolName.length > 5 && (name.includes(poolName) || poolName.includes(name)))));
};

const displayValue = (value: unknown, unit?: string): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return `${value.toLocaleString('es-AR')}${unit ? ` ${unit}` : ''}`;
  if (typeof value === 'string') return value.replace(/_/g, ' ');
  return null;
};

export const SupplierCatalogPage: React.FC = () => {
  const { categoryId, productId } = useParams<{ categoryId?: string; productId?: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState('');
  const [configurationFilter, setConfigurationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [acceptedTerms, setAcceptedTerms] = useState<Record<string, boolean>>({});
  const [joining, setJoining] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState('');

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryResult, productResult, poolResult] = await Promise.all([
        requestJson<SupplierCategory[]>('/api/suppliers/categories'),
        requestJson<SupplierProduct[]>('/api/suppliers', token ?? undefined),
        requestJson<Pool[]>('/api/pools', token ?? undefined),
      ]);
      setCategories(categoryResult);
      setProducts(productResult);
      setPools(poolResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el catálogo de proveedores.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  const visibleCategories = useMemo(() => categories
    .filter((category) => products.some((product) => product.category === category.id))
    .sort((left, right) => left.order - right.order), [categories, products]);
  const selectedCategory = visibleCategories.find((category) => category.id === categoryId);
  const categoryProducts = useMemo(() => products.filter((product) => product.category === categoryId), [products, categoryId]);
  const selectedProduct = categoryProducts.find((product) => product.id === productId);
  const matchesFor = useCallback((product: SupplierProduct) => pools.filter((pool) => matchesProduct(pool, product)), [pools]);

  const capacityLabels = (product: SupplierProduct): string[] => {
    const category = categories.find((entry) => entry.id === product.category);
    const definedCapacities = category?.attributes
      .filter((attribute) => /capacidad|litros|kg/i.test(`${attribute.key} ${attribute.label}`))
      .flatMap((attribute) => {
        const value = displayValue(readPath(product.characteristics, attribute.key), attribute.unit);
        return value ? [`${attribute.label}: ${value}`] : [];
      }) ?? [];
    if (definedCapacities.length) return [...new Set(definedCapacities)];

    const flatten = (value: Record<string, unknown>, prefix = ''): [string, unknown][] =>
      Object.entries(value).flatMap(([key, child]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return child && typeof child === 'object' && !Array.isArray(child)
          ? flatten(child as Record<string, unknown>, path)
          : [[path, child]];
      });
    return flatten(product.characteristics)
      .filter(([key, value]) => /capacidad|litros|kg/i.test(key) && typeof value === 'number')
      .map(([key, value]) => {
        const unit = /kg/i.test(key) ? 'kg' : /litros/i.test(key) ? 'L' : '';
        const label = key.split('.').pop()?.replace(/_/g, ' ') ?? 'Capacidad';
        const formatted = displayValue(value, unit);
        return formatted ? `${label}: ${formatted}` : '';
      }).filter(Boolean);
  };

  const brands = [...new Set(categoryProducts.map((product) => product.brand).filter(Boolean))].sort();
  const configurations = [...new Set(categoryProducts.map((product) => {
    const value = readPath(product.characteristics, 'configuracion.nivel');
    return typeof value === 'string' ? value : '';
  }).filter(Boolean))].sort();
  const capacities = [...new Set(categoryProducts.flatMap(capacityLabels))].sort();
  const filteredProducts = categoryProducts.filter((product) => {
    const value = product.currentPrice?.price;
    const configuration = readPath(product.characteristics, 'configuracion.nivel');
    const min = minimumPrice === '' ? undefined : Number(minimumPrice);
    const max = maximumPrice === '' ? undefined : Number(maximumPrice);
    return (!brandFilter || product.brand === brandFilter)
      && (!configurationFilter || configuration === configurationFilter)
      && (!capacityFilter || capacityLabels(product).includes(capacityFilter))
      && (min === undefined || (value !== null && value !== undefined && value >= min))
      && (max === undefined || (value !== null && value !== undefined && value <= max));
  });

  const joinPool = async (pool: Pool) => {
    if (!token || user?.role !== 'participante') {
      setError('Inicia sesión con una cuenta de participante para sumarte a un pool.');
      return;
    }
    if (!acceptedTerms[pool.id]) return;
    const available = pool.remainingQuantity ?? pool.targetQuantity - (pool.joinedQuantity ?? 0);
    const selectedQuantity = quantity[pool.id] ?? 1;
    if (!Number.isSafeInteger(selectedQuantity) || selectedQuantity < 1 || selectedQuantity > available) {
      setError('La cantidad debe ser mayor a cero y no superar las unidades disponibles.');
      return;
    }
    setJoining(pool.id);
    setError(null);
    setNotice(null);
    try {
      const result = await requestJson<{ message: string }>(`/api/pools/${encodeURIComponent(pool.id)}/join`, token, {
        method: 'POST',
        body: JSON.stringify({ quantity: selectedQuantity }),
      });
      setNotice(result.message);
      await loadCatalog();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo registrar la participación.');
    } finally {
      setJoining(null);
    }
  };

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText('keep.me.flying');
      setCopyNotice('Alias copiado.');
    } catch {
      setCopyNotice('No se pudo copiar automáticamente. Seleccioná el alias: keep.me.flying');
    }
  };

  const clearFilters = () => {
    setBrandFilter('');
    setConfigurationFilter('');
    setCapacityFilter('');
    setMinimumPrice('');
    setMaximumPrice('');
  };

  return (
    <main className="supplier-catalog">
      <div className="supplier-catalog__inner">
        <nav className="supplier-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/suppliers">Proveedores</Link>
          {selectedCategory && <><span>/</span><Link to={`/suppliers/${selectedCategory.id}`}>{selectedCategory.label}</Link></>}
          {selectedProduct && <><span>/</span><span aria-current="page">{selectedProduct.name}</span></>}
        </nav>

        {error && <p className="supplier-message supplier-message--error" role="alert">{error}</p>}
        {notice && <p className="supplier-message supplier-message--success" role="status">{notice}</p>}
        {loading ? <p className="supplier-empty">Cargando catálogo…</p> : (
          <>
            {!categoryId && (
              <>
                <header className="supplier-hero">
                  <p className="supplier-eyebrow">DronsAir · Red de proveedores</p>
                  <h1>Encontrá lo que impulsa tu operación.</h1>
                  <p>Explorá productos, compará referencias y descubrí oportunidades de compra grupal.</p>
                  <span className="supplier-hero__note"><i /> Catálogo abierto · sin costo ni membresía</span>
                </header>
                <section aria-labelledby="supplier-categories-title">
                  <div className="supplier-section-heading">
                    <div><p className="supplier-eyebrow">Explorar</p><h2 id="supplier-categories-title">Categorías</h2></div>
                    <span>{visibleCategories.length} categorías disponibles</span>
                  </div>
                  {visibleCategories.length ? (
                    <div className="supplier-category-grid">
                      {visibleCategories.map((category) => {
                        const categoryItems = products.filter((product) => product.category === category.id);
                        const hasPool = categoryItems.some((product) => matchesFor(product).length > 0);
                        return (
                          <Link className="supplier-category-card" to={`/suppliers/${category.id}`} key={category.id}>
                            <span className="supplier-category-card__index">{String(category.order + 1).padStart(2, '0')}</span>
                            <div><h3>{category.label}</h3><p>{categoryItems.length} {categoryItems.length === 1 ? 'producto publicado' : 'productos publicados'}</p></div>
                            {hasPool && <span className="supplier-pool-indicator" title="Esta categoría tiene pools activos" aria-label="Hay pools activos en esta categoría"><i /> Pool activo</span>}
                            <span className="supplier-category-card__arrow" aria-hidden="true">↗</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : <p className="supplier-empty">No hay categorías con productos publicados por el momento.</p>}
                </section>
                <PlatformInformation onCopyAlias={copyAlias} copyNotice={copyNotice} />
              </>
            )}

            {categoryId && !selectedCategory && (
              <section className="supplier-empty" role="alert">No encontramos esa categoría del catálogo.</section>
            )}

            {selectedCategory && !productId && (
              <section>
                <header className="supplier-section-heading supplier-section-heading--category">
                  <div><p className="supplier-eyebrow">Catálogo de proveedores</p><h1>{selectedCategory.label}</h1><p>Productos publicados y referencias orientativas.</p></div>
                  <Link className="supplier-text-link" to="/suppliers">← Todas las categorías</Link>
                </header>
                <div className="supplier-filters" aria-label="Filtros de productos">
                  <label>Marca<select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}><option value="">Todas</option>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select></label>
                  <label>Configuración<select value={configurationFilter} onChange={(event) => setConfigurationFilter(event.target.value)}><option value="">Todas</option>{configurations.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}</select></label>
                  <label>Capacidad<select value={capacityFilter} onChange={(event) => setCapacityFilter(event.target.value)}><option value="">Todas</option>{capacities.map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label>Precio mínimo<input type="number" min="0" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} placeholder="Sin mínimo" /></label>
                  <label>Precio máximo<input type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} placeholder="Sin máximo" /></label>
                  <button type="button" className="supplier-filter-reset" onClick={clearFilters}>Limpiar</button>
                </div>
                {filteredProducts.length ? (
                  <div className="supplier-product-grid">
                    {filteredProducts.map((product) => {
                      const productPools = matchesFor(product);
                      const image = product.images[0];
                      return (
                        <article className="supplier-product-card" key={product.id}>
                          <Link className="supplier-product-card__image" to={`/suppliers/${selectedCategory.id}/${product.id}`}>
                            {image ? <img src={image.url} alt={image.alt || product.name} loading="lazy" /> : <span>{selectedCategory.label}</span>}
                          </Link>
                          <div className="supplier-product-card__body">
                            <p className="supplier-eyebrow">{product.brand || 'Proveedor'}{product.subcategory ? ` · ${product.subcategory}` : ''}</p>
                            <h2><Link to={`/suppliers/${selectedCategory.id}/${product.id}`}>{product.name}</Link></h2>
                            {product.model && <p className="supplier-product-card__model">{product.model}</p>}
                            <p className="supplier-product-card__spec"><span>Capacidad/es</span><strong>{capacityLabels(product).join(' · ') || 'No informada'}</strong></p>
                            <p className="supplier-product-card__price">{formatPrice(product.currentPrice?.price, product.currentPrice?.currency)}<small>Precio orientativo, sin impuestos</small></p>
                            {productPools.length > 0 && <Link className="supplier-pool-link" to={`/suppliers/${selectedCategory.id}/${product.id}`}><i />{productPools.length === 1 ? 'Pool de compra grupal activo' : `${productPools.length} pools activos`} · Ver ficha ↗</Link>}
                            <Link className="supplier-product-card__link" to={`/suppliers/${selectedCategory.id}/${product.id}`}>Ver ficha de producto <span>↗</span></Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : <p className="supplier-empty">No hay productos que coincidan con los filtros seleccionados.</p>}
              </section>
            )}

            {selectedCategory && productId && !selectedProduct && (
              <section className="supplier-empty" role="alert">No encontramos ese producto en esta categoría.</section>
            )}

            {selectedCategory && selectedProduct && (
              <ProductDetail
                category={selectedCategory}
                product={selectedProduct}
                pools={matchesFor(selectedProduct)}
                token={token}
                role={user?.role}
                quantity={quantity}
                setQuantity={setQuantity}
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                joining={joining}
                onJoin={joinPool}
                onBack={() => navigate(`/suppliers/${selectedCategory.id}`)}
                onCopyAlias={copyAlias}
                copyNotice={copyNotice}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

type ProductDetailProps = {
  category: SupplierCategory;
  product: SupplierProduct;
  pools: Pool[];
  token: string | null;
  role?: string;
  quantity: Record<string, number>;
  setQuantity: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  acceptedTerms: Record<string, boolean>;
  setAcceptedTerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  joining: string | null;
  onJoin: (pool: Pool) => Promise<void>;
  onBack: () => void;
  onCopyAlias: () => Promise<void>;
  copyNotice: string;
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  category, product, pools, token, role, quantity, setQuantity, acceptedTerms,
  setAcceptedTerms, joining, onJoin, onBack, onCopyAlias, copyNotice,
}) => (
  <>
    <button className="supplier-back-button" type="button" onClick={onBack}>← Volver a {category.label}</button>
    <article className="supplier-detail">
      <div className="supplier-detail__media">
        {product.images.length ? product.images.map((image, index) => <img src={image.url} alt={image.alt || product.name} key={`${image.url}-${index}`} />)
          : <div className="supplier-detail__placeholder">{category.label}</div>}
      </div>
      <div className="supplier-detail__content">
        <p className="supplier-eyebrow">{category.label}{product.subcategory ? ` · ${product.subcategory}` : ''}</p>
        <h1>{product.name}</h1>
        <p className="supplier-detail__brand">{product.brand}{product.model ? ` · ${product.model}` : ''}</p>
        <p className="supplier-detail__price">{formatPrice(product.currentPrice?.price, product.currentPrice?.currency)}<small>Precio orientativo, sin impuestos. Consultar condiciones, disponibilidad y precio final con el proveedor.</small></p>
        {product.description && <p className="supplier-detail__description">{product.description}</p>}
        <div className="supplier-detail__attributes">
          {category.attributes.map((attribute: SupplierAttribute) => {
            const label = displayValue(readPath(product.characteristics, attribute.key), attribute.unit);
            return label ? <div key={attribute.key}><span>{attribute.label}</span><strong>{label}</strong></div> : null;
          })}
          {!category.attributes.some((attribute) => readPath(product.characteristics, attribute.key) !== undefined)
            && <div><span>Capacidad</span><strong>{displayValue(readPath(product.characteristics, 'capacidad_litros'), 'L') ?? displayValue(readPath(product.characteristics, 'capacidad_kg'), 'kg') ?? 'Consultar proveedor'}</strong></div>}
        </div>
      </div>
    </article>

    <section className="supplier-pool-section" aria-labelledby="supplier-pool-title">
      <div className="supplier-section-heading"><div><p className="supplier-eyebrow">Compra colaborativa</p><h2 id="supplier-pool-title">Pools activos para este producto</h2></div></div>
      {pools.length ? (
        <div className="supplier-pool-grid">
          {pools.map((pool) => {
            const joined = pool.joinedQuantity ?? 0;
            const remaining = pool.remainingQuantity ?? Math.max(0, pool.targetQuantity - joined);
            const percent = pool.targetQuantity > 0 ? Math.min(100, Math.round(joined / pool.targetQuantity * 100)) : 0;
            const joinedByUser = Boolean(pool.joinedByCurrentUser);
            return (
              <article className="supplier-pool-card" key={pool.id}>
                <p className="supplier-pool-card__status"><i /> Pool activo · {pool.dealer.name}</p>
                <h3>{pool.brand} {pool.product} {pool.model}</h3>
                {pool.description && <p className="supplier-pool-card__description">{pool.description}</p>}
                <div className="supplier-pool-card__offer"><span>Oferta del pool</span><strong>{formatPrice(pool.discountedUnitPrice, pool.priceCurrency || 'ARS')}</strong><small>por unidad · condiciones finales a convenir con el proveedor</small></div>
                <p className="supplier-pool-card__validity">Válido hasta {new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(pool.validUntil))}</p>
                <div className="supplier-pool-progress" role="progressbar" aria-label="Completitud del pool" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${percent}%` }} />
                </div>
                <p className="supplier-pool-card__progress-label">{percent}% completado · {joined} de {pool.targetQuantity} unidades · {remaining} disponibles</p>
                {role === 'participante' ? (
                  <div className="supplier-join">
                    <label className="supplier-terms">
                      <input type="checkbox" checked={Boolean(acceptedTerms[pool.id])} onChange={(event) => setAcceptedTerms((current) => ({ ...current, [pool.id]: event.target.checked }))} />
                      <span>Acepto los términos simulados del pool. El texto y las condiciones están en revisión; sumarme no reemplaza el acuerdo de compra con el proveedor.</span>
                    </label>
                    <div className="supplier-join__actions">
                      <label>Unidades<input type="number" min="1" max={remaining} value={quantity[pool.id] ?? 1} disabled={joinedByUser || remaining < 1} onChange={(event) => setQuantity((current) => ({ ...current, [pool.id]: Number(event.target.value) }))} /></label>
                      <button type="button" disabled={!acceptedTerms[pool.id] || joinedByUser || remaining < 1 || joining === pool.id} onClick={() => void onJoin(pool)}>
                        {joinedByUser ? 'Ya participas' : joining === pool.id ? 'Registrando…' : 'Sumarme al pool'}
                      </button>
                    </div>
                  </div>
                ) : token ? <p className="supplier-login-hint">La participación en pools está disponible para cuentas de participante.</p>
                  : <p className="supplier-login-hint"><Link to="/login">Inicia sesión</Link> con una cuenta de participante para sumarte.</p>}
              </article>
            );
          })}
        </div>
      ) : <p className="supplier-empty supplier-empty--inline">Todavía no hay pools activos para este producto.</p>}
    </section>
    <PlatformInformation onCopyAlias={onCopyAlias} copyNotice={copyNotice} compact />
  </>
);

const PlatformInformation: React.FC<{ onCopyAlias: () => Promise<void>; copyNotice: string; compact?: boolean }> = ({ onCopyAlias, copyNotice, compact }) => (
  <section className={`supplier-platform-info${compact ? ' supplier-platform-info--compact' : ''}`} aria-labelledby="supplier-platform-title">
    <div className="supplier-platform-info__intro"><p className="supplier-eyebrow">Un ecosistema que genera valor</p><h2 id="supplier-platform-title">DronsAir optimiza relaciones y conecta las partes generando trayectoria.</h2></div>
    <div className="supplier-platform-info__grid">
      <article><span>01</span><h3>Relación transparente</h3><p>DronsAir conecta compradores y proveedores; cada parte conserva sus derechos y responsabilidades. El proveedor responde por el producto, sus condiciones, garantía y servicio. Quien compra decide y acuerda directamente con el proveedor; la plataforma facilita información y contacto, no sustituye ese acuerdo.</p></article>
      <article><span>02</span><h3>Beneficio compartido</h3><p>La compra grupal reúne demanda para habilitar mejores condiciones para compradores y una oportunidad de venta consolidada para proveedores y dealers. Las ofertas, cantidades, vigencias y condiciones publicadas deben confirmarse con el proveedor.</p></article>
      <article><span>03</span><h3>Trayectoria y datos útiles</h3><p>La plataforma puede registrar uso, mantenimiento, servicios y prestaciones, creando una base de conocimiento y análisis para el mercado. La trayectoria del grupo del pool contribuye a la reputación y ayuda a mejorar ventas, calidad de servicio y decisiones de compra.</p></article>
    </div>
    <div className="supplier-platform-info__footer">
      <p><strong>Términos y condiciones</strong> · Texto de aceptación simulado, actualmente en revisión. La plataforma puede utilizarse sin membresía ni costo alguno.</p>
      <div><span>Si DronsAir te es útil, ayudanos a mantenernos en vuelo.</span><code>keep.me.flying</code><button type="button" onClick={() => void onCopyAlias()}>Copiar alias</button>{copyNotice && <small role="status">{copyNotice}</small>}</div>
    </div>
  </section>
);
