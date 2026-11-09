import React, { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  SupplierCategoryManager,
  type SupplierAttribute,
  type SupplierCategory as Category,
  type SupplierCategoryInput,
} from "../../components/SupplierCategoryManager";
import { useAuth } from "../../context/AuthContext";
import { toDateTimeLocalInput } from "./supplierDateTime";
import "./AdminSuppliersPage.css";

type ProductStatus = "pending-review" | "active" | "archived";
type ProductImage = { url: string; alt: string };
type Product = {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  characteristics: Record<string, unknown>;
  images: ProductImage[];
  sources: { type: string; url: string }[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  currentPrice: PriceRecord | null;
};
type Quote = {
  id: string;
  supplierName: string;
  supplierId: string;
  sourceType: "web" | "manual" | "pool";
  supplierType: "dealer" | "manufacturer";
  unitPrice: number;
  currency: string;
  observedAt: string;
  sourceUrl?: string;
  sourceReference?: string;
  conditions: {
    includesVat: boolean;
    vatRatePercent?: number;
    includesFreight: boolean;
    freightAmount?: number;
    includesFinancing: boolean;
    financingAmount?: number;
    includesAccessories: boolean;
    accessoriesAmount?: number;
  };
};
type QuoteEvaluation = {
  quote: Quote;
  status: "selected" | "valid" | "rejected";
  normalizedUnitPrice?: number;
  reason?: string;
};
type PriceRecord = {
  id: string;
  productId: string;
  updatedAt: string;
  currency: string;
  price: number | null;
  equivalentCurrency?: string;
  equivalentPrice?: number;
  exchangeRateDetails?: {
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    effectiveDate: string;
    fetchedAt: string;
    source: string;
  };
  method: "active-pool" | "dealer-average" | "manufacturer-reference" | "unavailable";
  quoteIds: string[];
  quoteEvaluations: QuoteEvaluation[];
};
type ProductDetail = { product: Product; quotes: Quote[]; prices: PriceRecord[] };

type ProductFormState = {
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  images: string;
  sources: string;
  status: ProductStatus;
};

const EMPTY_FORM: ProductFormState = {
  category: "",
  subcategory: "",
  name: "",
  brand: "",
  model: "",
  description: "",
  images: "",
  sources: "",
  status: "pending-review",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  "pending-review": "Pendiente de revisión",
  active: "Activo",
  archived: "Archivado",
};

const METHOD_LABELS: Record<PriceRecord["method"], string> = {
  "active-pool": "Pool activo",
  "dealer-average": "Promedio de dealers",
  "manufacturer-reference": "Referencia de fabricante",
  unavailable: "Sin precio validado",
};

function priceLabel(price: PriceRecord | null): string {
  if (!price || price.price === null) return "Sin precio";
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 2,
    }).format(price.price);
  } catch {
    return `${price.price} ${price.currency}`;
  }
}

function toProductForm(product: Product): ProductFormState {
  return {
    category: product.category,
    subcategory: product.subcategory,
    name: product.name,
    brand: product.brand,
    model: product.model,
    description: product.description,
    images: product.images.filter((image) => !image.url.startsWith("data:image/"))
      .map((image) => `${image.url} | ${image.alt}`).join("\n"),
    sources: product.sources.map((source) => `${source.type} | ${source.url}`).join("\n"),
    status: product.status,
  };
}

function parseLines(value: string, separator: string): string[][] {
  return value.split("\n").map((line) => line.split(separator).map((part) => part.trim()))
    .filter((parts) => parts.some(Boolean));
}

function getPath(source: Record<string, unknown>, path: string): unknown {
  let current: unknown = source;
  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object" || Array.isArray(current)
      || !(segment in current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const result = structuredClone(target);
  const segments = path.split(".");
  let current = result;
  for (const segment of segments.slice(0, -1)) {
    const child = current[segment];
    if (child === null || typeof child !== "object" || Array.isArray(child)) current[segment] = {};
    current = current[segment] as Record<string, unknown>;
  }
  current[segments[segments.length - 1]] = value;
  return result;
}

function characteristicValue(
  attribute: SupplierAttribute,
  value: unknown,
  onChange: (value: unknown) => void,
): React.ReactNode {
  if (attribute.type === "boolean") {
    return <select value={typeof value === "boolean" ? String(value) : ""} onChange={(event) =>
      onChange(event.target.value === "" ? null : event.target.value === "true")}>
      <option value="">Pendiente / no informado</option><option value="true">Sí</option><option value="false">No</option>
    </select>;
  }
  if (attribute.type === "select") {
    return <select value={typeof value === "string" ? value : ""} onChange={(event) =>
      onChange(event.target.value || null)}>
      <option value="">Pendiente / no informado</option>
      {(attribute.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
    </select>;
  }
  return <input
    type={attribute.type === "number" ? "number" : "text"}
    step={attribute.type === "number" ? "any" : undefined}
    value={typeof value === "string" || typeof value === "number" ? value : ""}
    placeholder="Pendiente / no informado"
    onChange={(event) => {
      if (event.target.value === "") onChange(null);
      else if (attribute.type === "number") {
        const numeric = Number(event.target.value);
        onChange(Number.isFinite(numeric) ? numeric : null);
      } else onChange(event.target.value);
    }}
  />;
}

async function compressSupplierImage(file: File): Promise<ProductImage> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Las imágenes deben ser JPG, PNG o WebP.");
  }
  if (file.size > 12 * 1024 * 1024) throw new Error("Cada imagen original debe pesar menos de 12 MB.");

  const source = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
      image.src = source;
    });
  } finally {
    URL.revokeObjectURL(source);
  }

  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudieron optimizar las imágenes.");
  let quality = 0.78;
  const render = () => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  };
  let url = render();
  while (url.length > 500_000) {
    if (quality > 0.48) quality = Math.max(0.45, quality - 0.08);
    else {
      const nextSize = Math.round(Math.max(canvas.width, canvas.height) * 0.8);
      if (nextSize < 240) throw new Error(`No se pudo optimizar ${file.name} lo suficiente.`);
      const resize = nextSize / Math.max(canvas.width, canvas.height);
      canvas.width = Math.max(1, Math.round(canvas.width * resize));
      canvas.height = Math.max(1, Math.round(canvas.height * resize));
      quality = 0.78;
    }
    url = render();
  }
  return { url, alt: file.name.slice(0, 240) };
}

export const AdminSuppliersPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [characteristics, setCharacteristics] = useState<Record<string, unknown>>({});
  const [imageData, setImageData] = useState<ProductImage[]>([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceCurrencyFilter, setPriceCurrencyFilter] = useState("ARS");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    sourceType: "manual" as "manual" | "web",
    supplierType: "dealer" as "dealer" | "manufacturer",
    supplierName: "",
    supplierId: "",
    unitPrice: "",
    currency: "ARS",
    observedAt: toDateTimeLocalInput(),
    sourceUrl: "",
    sourceReference: "",
    includesVat: false,
    vatRatePercent: "",
    includesFreight: false,
    freightAmount: "",
    includesFinancing: false,
    financingAmount: "",
    includesAccessories: false,
    accessoriesAmount: "",
  });
  const [targetCurrency, setTargetCurrency] = useState("ARS");
  const [maxQuoteAgeDays, setMaxQuoteAgeDays] = useState("30");

  const authorizedFetch = async (url: string, init?: RequestInit): Promise<Response> => {
    if (!token) throw new Error("La sesión administrativa expiró. Inicia sesión nuevamente.");
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init?.body) headers.set("Content-Type", "application/json");
    const response = await fetch(url, { ...init, headers });
    if (response.status === 401) {
      logout();
      throw new Error("La sesión administrativa expiró. Inicia sesión nuevamente.");
    }
    return response;
  };

  const loadProducts = async (preferredId?: string | null) => {
    const [categoryResponse, productResponse] = await Promise.all([
      authorizedFetch("/api/admin/suppliers/categories"),
      authorizedFetch("/api/admin/suppliers"),
    ]);
    const categoryResult = await categoryResponse.json() as Category[] | { message?: string };
    const productResult = await productResponse.json() as Product[] | { message?: string };
    if (!categoryResponse.ok || !Array.isArray(categoryResult)) {
      throw new Error(!Array.isArray(categoryResult)
        ? categoryResult.message || "No se pudieron cargar las categorías."
        : "La respuesta de categorías no es válida.");
    }
    if (!productResponse.ok || !Array.isArray(productResult)) {
      throw new Error(!Array.isArray(productResult)
        ? productResult.message || "No se pudieron cargar los productos."
        : "La respuesta de productos no es válida.");
    }
    setCategories(categoryResult);
    setProducts(productResult);
    const nextId = preferredId ?? selectedId;
    const nextProduct = productResult.find((product) => product.id === nextId);
    setSelectedId(nextProduct?.id ?? productResult[0]?.id ?? null);
  };

  const loadDetail = async (productId: string) => {
    const response = await authorizedFetch(`/api/admin/suppliers/${encodeURIComponent(productId)}`);
    const result = await response.json() as ProductDetail | { message?: string };
    if (!response.ok || !("product" in result)) {
      throw new Error("message" in result
        ? result.message || "No se pudo cargar el detalle del producto."
        : "La respuesta del producto no es válida.");
    }
    setDetail(result);
    setImageData(result.product.images.filter((image) => image.url.startsWith("data:image/")));
    setCharacteristics(result.product.characteristics);
    if (!editing) setForm(toProductForm(result.product));
  };

  useEffect(() => {
    setLoading(true);
    void loadProducts().catch((cause) => setError(
      cause instanceof Error ? cause.message : "No se pudieron cargar los Suppliers.",
    )).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId || creating) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId).catch((cause) => setError(
      cause instanceof Error ? cause.message : "No se pudo cargar el producto.",
    ));
  }, [selectedId, creating]);

  const filteredProducts = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const minPrice = minimumPrice === "" ? undefined : Number(minimumPrice);
    const maxPrice = maximumPrice === "" ? undefined : Number(maximumPrice);
    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
    return products.filter((product) => {
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      if (hasPriceFilter) {
        const price = product.currentPrice;
        if (!price || price.price === null || price.currency !== priceCurrencyFilter) return false;
        if (minPrice !== undefined && price.price < minPrice) return false;
        if (maxPrice !== undefined && price.price > maxPrice) return false;
      }
      const text = [product.name, product.brand, product.model, product.subcategory]
        .join(" ").toLocaleLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [categoryFilter, maximumPrice, minimumPrice, priceCurrencyFilter, products, search]);

  const selectedProduct = products.find((product) => product.id === selectedId) ?? null;
  const currentCategory = categories.find((category) => category.id === form.category);
  const latestPrice = detail?.prices.at(-1) ?? null;

  const beginCreate = () => {
    setCreating(true);
    setEditing(true);
    setSelectedId(null);
    setDetail(null);
    setForm(EMPTY_FORM);
    setCharacteristics({});
    setImageData([]);
    setNotice(null);
    setError(null);
  };

  const beginEdit = () => {
    if (!detail) return;
    setForm(toProductForm(detail.product));
    setEditing(true);
    setCreating(false);
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const images = [
        ...parseLines(form.images, "|").map(([url, alt]) => ({ url, alt: alt ?? "" })),
        ...imageData,
      ];
      const sources = parseLines(form.sources, "|").map(([type, url]) => ({ type, url }));
      const payload = {
        category: form.category,
        subcategory: form.subcategory,
        name: form.name,
        brand: form.brand,
        model: form.model,
        description: form.description,
        characteristics,
        images,
        sources,
        status: form.status,
      };
      const isNew = creating;
      const response = await authorizedFetch(
        isNew ? "/api/admin/suppliers" : `/api/admin/suppliers/${encodeURIComponent(selectedId ?? "")}`,
        { method: isNew ? "POST" : "PATCH", body: JSON.stringify(payload) },
      );
      const result = await response.json() as Product | { message?: string };
      if (!response.ok || !("id" in result)) {
        throw new Error("message" in result
          ? result.message || `No se pudo guardar el producto (${response.status}).`
          : `No se pudo guardar el producto (${response.status}).`);
      }
      setCreating(false);
      setEditing(false);
      setSelectedId(result.id);
      await loadProducts(result.id);
      await loadDetail(result.id);
      setNotice(isNew ? "Producto creado." : "Producto actualizado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct || !window.confirm(`¿Eliminar "${selectedProduct.name}" y su historial de precios?`)) return;
    setError(null);
    try {
      const response = await authorizedFetch(`/api/admin/suppliers/${encodeURIComponent(selectedProduct.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json() as { message?: string };
        throw new Error(result.message || `No se pudo eliminar el producto (${response.status}).`);
      }
      setDetail(null);
      setSelectedId(null);
      await loadProducts(null);
      setNotice("Producto eliminado.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el producto.");
    }
  };

  const submitQuote = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const amount = (value: string): number | undefined => value.trim() ? Number(value) : undefined;
      const response = await authorizedFetch(
        `/api/admin/suppliers/${encodeURIComponent(detail.product.id)}/quotes`,
        {
          method: "POST",
          body: JSON.stringify({
            sourceType: quoteForm.sourceType,
            supplierType: quoteForm.supplierType,
            supplierId: quoteForm.supplierId || quoteForm.supplierName,
            supplierName: quoteForm.supplierName,
            unitPrice: Number(quoteForm.unitPrice),
            currency: quoteForm.currency,
            observedAt: new Date(quoteForm.observedAt).toISOString(),
            sourceUrl: quoteForm.sourceUrl || undefined,
            sourceReference: quoteForm.sourceReference || undefined,
            conditions: {
              includesVat: quoteForm.includesVat,
              ...(quoteForm.includesVat ? { vatRatePercent: amount(quoteForm.vatRatePercent) } : {}),
              includesFreight: quoteForm.includesFreight,
              ...(quoteForm.includesFreight ? { freightAmount: amount(quoteForm.freightAmount) } : {}),
              includesFinancing: quoteForm.includesFinancing,
              ...(quoteForm.includesFinancing ? { financingAmount: amount(quoteForm.financingAmount) } : {}),
              includesAccessories: quoteForm.includesAccessories,
              ...(quoteForm.includesAccessories ? { accessoriesAmount: amount(quoteForm.accessoriesAmount) } : {}),
            },
          }),
        },
      );
      const result = await response.json() as Quote[] | { message?: string };
      if (!response.ok || !Array.isArray(result)) {
        throw new Error(!Array.isArray(result)
          ? result.message || `No se pudo guardar la cotización (${response.status}).`
          : `No se pudo guardar la cotización (${response.status}).`);
      }
      await loadDetail(detail.product.id);
      setNotice("Cotización guardada con su referencia y condiciones.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la cotización.");
    } finally {
      setSaving(false);
    }
  };

  const recalculatePrice = async () => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const response = await authorizedFetch(
        `/api/admin/suppliers/${encodeURIComponent(detail.product.id)}/prices/recalculate`,
        {
          method: "POST",
          body: JSON.stringify({
            targetCurrency,
            asOf: new Date().toISOString(),
            maxQuoteAgeDays: Number(maxQuoteAgeDays),
          }),
        },
      );
      const result = await response.json() as PriceRecord | { message?: string };
      if (!response.ok || !("method" in result)) {
        throw new Error("message" in result
          ? result.message || `No se pudo recalcular el precio (${response.status}).`
          : `No se pudo recalcular el precio (${response.status}).`);
      }
      await loadProducts(detail.product.id);
      await loadDetail(detail.product.id);
      const rejectedFutureQuotes = result.quoteEvaluations
        .filter((evaluation) => evaluation.reason === "quote-from-future");
      setNotice(result.price === null
        ? rejectedFutureQuotes.length > 0
          ? "Sin precio: la fecha u hora de la cotización queda en el futuro. Revisa la hora local y vuelve a registrar la cotización."
          : "Actualización registrada sin precio: no hay cotizaciones válidas. Revisa el historial para ver el motivo de rechazo."
        : "Actualización de precio registrada con trazabilidad.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo recalcular el precio.");
    } finally {
      setSaving(false);
    }
  };

  const updateForm = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const saveCategory = async (id: string | null, input: SupplierCategoryInput) => {
    const response = await authorizedFetch(
      id ? `/api/admin/suppliers/categories/${encodeURIComponent(id)}` : "/api/admin/suppliers/categories",
      { method: id ? "PUT" : "POST", body: JSON.stringify(input) },
    );
    const result = await response.json() as Category | { message?: string };
    if (!response.ok || !("id" in result)) {
      throw new Error("message" in result ? result.message || "No se pudo guardar la categoría."
        : "No se pudo guardar la categoría.");
    }
    await loadProducts();
  };

  const deleteCategory = async (category: Category) => {
    const response = await authorizedFetch(
      `/api/admin/suppliers/categories/${encodeURIComponent(category.id)}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const result = await response.json() as { message?: string };
      throw new Error(result.message || "No se pudo eliminar la categoría.");
    }
    await loadProducts();
    if (categoryFilter === category.id) setCategoryFilter("all");
  };

  const reorderCategories = async (ids: string[]) => {
    const response = await authorizedFetch("/api/admin/suppliers/categories/order", {
      method: "PUT",
      body: JSON.stringify({ categoryIds: ids }),
    });
    const result = await response.json() as Category[] | { message?: string };
    if (!response.ok || !Array.isArray(result)) {
      throw new Error(!Array.isArray(result) ? result.message || "No se pudo guardar el orden."
        : "La respuesta del orden no es válida.");
    }
    setCategories(result);
    await loadProducts();
  };

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    const urlCount = parseLines(form.images, "|").length;
    if (urlCount + imageData.length + files.length > 4) {
      setError("Puedes cargar hasta cuatro imágenes por producto.");
      return;
    }
    setError(null);
    setProcessingImages(true);
    try {
      const compressedImages = await Promise.all(files.map(compressSupplierImage));
      setImageData((current) => [...current, ...compressedImages]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron procesar las imágenes.");
    } finally {
      setProcessingImages(false);
    }
  };

  return (
    <main className="admin-suppliers">
      <header className="suppliers-header">
        <div>
          <h1>Suppliers</h1>
          <p>Catálogo de productos, imágenes y referencias de precios para comparativas y configuraciones.</p>
        </div>
        <button className="suppliers-button suppliers-button--primary" type="button" onClick={beginCreate}>
          + Nuevo producto
        </button>
        <button className="suppliers-button" type="button" onClick={() => setCategoryManagerOpen(true)}>
          Administrar categorías
        </button>
      </header>

      <p className="suppliers-guidance">
        Los mixers investigados se cargan como pendientes de revisión. Precio e imágenes desconocidos permanecen vacíos;
        una cotización manual debe guardar proveedor, fecha, condiciones y referencia.
      </p>
      {error && <p className="suppliers-message suppliers-message--error" role="alert">{error}</p>}
      {notice && <p className="suppliers-message suppliers-message--notice" role="status">{notice}</p>}

      <div className="suppliers-layout">
        <section className="suppliers-list">
          <div className="suppliers-toolbar">
            <label>
              <span className="visually-hidden">Buscar producto</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar marca, modelo o producto" />
            </label>
            <label>
              <span className="visually-hidden">Filtrar categoría</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">Todas las categorías</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </label>
            <label>
              <span className="visually-hidden">Moneda para filtrar precios</span>
              <select value={priceCurrencyFilter} onChange={(event) => setPriceCurrencyFilter(event.target.value)}>
                <option value="ARS">Precios en ARS</option>
                <option value="USD">Precios en USD</option>
              </select>
            </label>
            <label>
              <span className="visually-hidden">Precio mínimo</span>
              <input aria-label="Precio mínimo" type="number" min="0" step="any" value={minimumPrice}
                onChange={(event) => setMinimumPrice(event.target.value)} placeholder="Precio desde" />
            </label>
            <label>
              <span className="visually-hidden">Precio máximo</span>
              <input aria-label="Precio máximo" type="number" min="0" step="any" value={maximumPrice}
                onChange={(event) => setMaximumPrice(event.target.value)} placeholder="Precio hasta" />
            </label>
          </div>
          <div className="suppliers-table-wrap">
            {loading ? <p className="suppliers-empty">Cargando catálogo…</p> : (
              <table className="suppliers-table">
                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio actualizado</th><th>Estado</th><th>Fotos</th></tr></thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className={selectedId === product.id ? "is-selected" : ""}>
                      <td>
                        <button className="suppliers-product-link" type="button" onClick={() => {
                          setSelectedId(product.id);
                          setCreating(false);
                          setEditing(false);
                          setError(null);
                        }}>
                          <strong>{product.name}</strong>
                          <small>{[product.brand, product.model].filter(Boolean).join(" · ")}</small>
                        </button>
                      </td>
                      <td>{categories.find((category) => category.id === product.category)?.label ?? product.category}
                        {product.subcategory && <small className="suppliers-secondary">{product.subcategory}</small>}
                      </td>
                      <td>{priceLabel(product.currentPrice)}</td>
                      <td><span className={`suppliers-status suppliers-status--${product.status}`}>{STATUS_LABELS[product.status]}</span></td>
                      <td>{product.images.length}</td>
                    </tr>
                  ))}
                  {!filteredProducts.length && <tr><td className="suppliers-empty" colSpan={5}>No hay productos para este filtro.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
          <p className="suppliers-count">{filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}</p>
        </section>

        <aside className="suppliers-detail">
          {editing ? (
            <form className="suppliers-form" onSubmit={(event) => void saveProduct(event)}>
              <h2>{creating ? "Nuevo producto" : "Editar producto"}</h2>
              <label>Categoría
                <select value={form.category} onChange={(event) => {
                  updateForm("category", event.target.value);
                  updateForm("subcategory", "");
                  setCharacteristics({});
                }} required>
                  <option value="" disabled>Selecciona una categoría para cargar su estructura</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </label>
              {currentCategory?.subcategories.length ? <label>Subcategoría
                <select value={form.subcategory} onChange={(event) => updateForm("subcategory", event.target.value)} required>
                  <option value="">Seleccionar</option>
                  {currentCategory.subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
                </select>
              </label> : null}
              {currentCategory && <fieldset className="suppliers-characteristics">
                <legend>Estructura y características de {currentCategory.label}</legend>
                <p>Estos campos definen la estructura de comparación de esta categoría. Un valor pendiente no se interpreta como “No”.</p>
                {currentCategory.attributes
                  .filter((attribute) => attribute.key !== "tanque.capacidad_litros"
                    || getPath(characteristics, "tanque.presente") === true)
                  .map((attribute) => (
                  <label key={attribute.key}>
                    {attribute.label}{attribute.unit ? ` (${attribute.unit})` : ""}
                    {characteristicValue(attribute, getPath(characteristics, attribute.key), (value) =>
                      setCharacteristics((current) => {
                        const next = setPath(current, attribute.key, value);
                        return attribute.key === "tanque.presente" && value === false
                          ? setPath(next, "tanque.capacidad_litros", null)
                          : next;
                      }))}
                  </label>
                ))}
                {!currentCategory.attributes.length && <div>
                  <span>Esta categoría aún no tiene campos de estructura.</span>{" "}
                  <button className="suppliers-button" type="button" onClick={() => setCategoryManagerOpen(true)}>
                    Definir estructura
                  </button>
                </div>}
              </fieldset>}
              <label>Nombre del producto<input value={form.name} onChange={(event) => updateForm("name", event.target.value)} required maxLength={160} /></label>
              <div className="suppliers-form-grid">
                <label>Marca<input value={form.brand} onChange={(event) => updateForm("brand", event.target.value)} maxLength={120} /></label>
                <label>Modelo<input value={form.model} onChange={(event) => updateForm("model", event.target.value)} maxLength={160} /></label>
              </div>
              <label>Descripción<textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} rows={3} maxLength={5000} /></label>
              <label>Imágenes (una por línea: URL | texto alternativo)<textarea value={form.images} onChange={(event) => updateForm("images", event.target.value)} rows={3} placeholder="https://... | Vista del producto" /></label>
              <section className="suppliers-image-upload">
                <label className="suppliers-button">
                  Cargar imágenes
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                    onChange={(event) => void addImages(event)}
                    disabled={saving || processingImages || imageData.length + parseLines(form.images, "|").length >= 4} />
                </label>
                <small>JPG, PNG o WebP; se optimizan a JPG de hasta 1200 px. Máximo cuatro fotos.</small>
                {processingImages && <small role="status">Optimizando imágenes…</small>}
                <div className="suppliers-image-previews">
                  {imageData.map((image, index) => (
                    <figure key={`${image.alt}-${index}`}>
                      <img src={image.url} alt={image.alt} />
                      <figcaption>{image.alt}</figcaption>
                      <button type="button" onClick={() => setImageData((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Quitar</button>
                    </figure>
                  ))}
                </div>
              </section>
              <label>Fuentes del producto (una por línea: tipo | URL)<textarea value={form.sources} onChange={(event) => updateForm("sources", event.target.value)} rows={2} placeholder="precio | https://dealer.com/modelo" /></label>
              <small>Para actualizar precios web de trailers cada 15 días, carga primero una cotización con la misma URL y agrega aquí una fuente de tipo “precio”.</small>
              <label>Estado
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value as ProductStatus)}>
                  <option value="pending-review">Pendiente de revisión</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </label>
              <div className="suppliers-form-actions">
                <button className="suppliers-button suppliers-button--primary" disabled={saving} type="submit">{saving ? "Guardando…" : "Guardar producto"}</button>
                <button className="suppliers-button" type="button" onClick={() => {
                  setEditing(false);
                  setCreating(false);
                  setError(null);
                  if (selectedId) void loadDetail(selectedId);
                }}>Cancelar</button>
              </div>
            </form>
          ) : detail ? (
            <>
              <div className="suppliers-detail-header">
                <div><h2>{detail.product.name}</h2><p>{[detail.product.brand, detail.product.model].filter(Boolean).join(" · ")}</p></div>
                <div className="suppliers-form-actions">
                  <button className="suppliers-button" type="button" onClick={beginEdit}>Editar</button>
                  <button className="suppliers-button suppliers-button--danger" type="button" onClick={() => void deleteProduct()}>Eliminar</button>
                </div>
              </div>
              <p className="suppliers-detail-copy">{detail.product.description || "Sin descripción cargada."}</p>
              {detail.product.images.length > 0 && <div className="suppliers-image-previews">
                {detail.product.images.map((image, index) => <figure key={`${image.url.slice(0, 24)}-${index}`}>
                  <img src={image.url} alt={image.alt} /><figcaption>{image.alt}</figcaption>
                </figure>)}
              </div>}
              <p><strong>Estado:</strong> {STATUS_LABELS[detail.product.status]}</p>
              <section className="suppliers-pricing">
                <h3>Precio actual</h3>
                <p className="suppliers-current-price">
                  {priceLabel(latestPrice)}
                  {latestPrice?.equivalentPrice !== undefined && latestPrice.equivalentCurrency
                    ? ` · ${new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: latestPrice.equivalentCurrency,
                      }).format(latestPrice.equivalentPrice)}`
                    : ""}
                </p>
                {latestPrice && <small>
                  {METHOD_LABELS[latestPrice.method]} · {new Date(latestPrice.updatedAt).toLocaleString("es-AR")}
                  {latestPrice.exchangeRateDetails && ` · Dólar vendedor BNA: ${new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  }).format(latestPrice.exchangeRateDetails.rate)} por USD, vigente ${new Date(`${latestPrice.exchangeRateDetails.effectiveDate}T00:00:00`).toLocaleDateString("es-AR")}`}
                  {latestPrice.exchangeRateDetails && <> · <a href={latestPrice.exchangeRateDetails.source} target="_blank" rel="noreferrer">fuente BNA</a></>}
                </small>}
              </section>

              <section className="suppliers-pricing">
                <h3>Registrar cotización</h3>
                <form className="suppliers-form suppliers-quote-form" onSubmit={(event) => void submitQuote(event)}>
                  <div className="suppliers-form-grid">
                    <label>Origen
                      <select value={quoteForm.sourceType} onChange={(event) => setQuoteForm((current) => ({ ...current, sourceType: event.target.value as "manual" | "web" }))}>
                        <option value="manual">Investigación manual</option><option value="web">Web</option>
                      </select>
                    </label>
                    <label>Proveedor
                      <select value={quoteForm.supplierType} onChange={(event) => setQuoteForm((current) => ({ ...current, supplierType: event.target.value as "dealer" | "manufacturer" }))}>
                        <option value="dealer">Dealer</option><option value="manufacturer">Fabricante</option>
                      </select>
                    </label>
                  </div>
                  <label>Nombre del proveedor<input value={quoteForm.supplierName} onChange={(event) => setQuoteForm((current) => ({ ...current, supplierName: event.target.value, supplierId: current.supplierId || event.target.value }))} required /></label>
                  <div className="suppliers-form-grid">
                    <label>Precio unitario<input type="number" min="0.01" step="0.01" value={quoteForm.unitPrice} onChange={(event) => setQuoteForm((current) => ({ ...current, unitPrice: event.target.value }))} required /></label>
                    <label>Moneda
                      <select value={quoteForm.currency} onChange={(event) => setQuoteForm((current) => ({ ...current, currency: event.target.value }))}>
                        <option value="ARS">Pesos argentinos (ARS)</option>
                        <option value="USD">Dólares estadounidenses (USD)</option>
                      </select>
                    </label>
                  </div>
                  <label>Fecha de cotización<input type="datetime-local" value={quoteForm.observedAt} onChange={(event) => setQuoteForm((current) => ({ ...current, observedAt: event.target.value }))} required /></label>
                  {quoteForm.sourceType === "web" ? <label>URL de origen<input type="url" value={quoteForm.sourceUrl} onChange={(event) => setQuoteForm((current) => ({ ...current, sourceUrl: event.target.value }))} required /></label>
                    : <>
                      <label>Referencia (contacto, mensaje o investigación)<textarea value={quoteForm.sourceReference} onChange={(event) => setQuoteForm((current) => ({ ...current, sourceReference: event.target.value }))} required rows={2} /></label>
                      <label>URL de la fuente para actualización automática (opcional)<input type="url" value={quoteForm.sourceUrl} onChange={(event) => setQuoteForm((current) => ({ ...current, sourceUrl: event.target.value }))} /></label>
                    </>}
                  <fieldset>
                    <legend>Condiciones del precio</legend>
                    {([
                      ["includesVat", "Incluye IVA", "vatRatePercent", "Alícuota IVA (%)"],
                      ["includesFreight", "Incluye flete", "freightAmount", "Monto del flete"],
                      ["includesFinancing", "Incluye financiación", "financingAmount", "Monto de financiación"],
                      ["includesAccessories", "Incluye accesorios", "accessoriesAmount", "Monto de accesorios"],
                    ] as const).map(([flag, label, amountKey, amountLabel]) => (
                      <div className="suppliers-condition" key={flag}>
                        <label className="suppliers-checkbox"><input type="checkbox" checked={quoteForm[flag]} onChange={(event) => setQuoteForm((current) => ({ ...current, [flag]: event.target.checked }))} />{label}</label>
                        {quoteForm[flag] && <label>{amountLabel}<input type="number" min="0" step="0.01" value={quoteForm[amountKey]} onChange={(event) => setQuoteForm((current) => ({ ...current, [amountKey]: event.target.value }))} required /></label>}
                      </div>
                    ))}
                  </fieldset>
                  <button className="suppliers-button suppliers-button--primary" type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cotización"}</button>
                </form>
              </section>

              <section className="suppliers-pricing">
                <h3>Recalcular precio</h3>
                <p className="suppliers-detail-copy">Se consulta la cotización vendedor del Banco Nación del día, se normaliza la moneda y se muestra el equivalente en ARS y USD.</p>
                <div className="suppliers-form-grid">
                  <label>Moneda principal
                    <select value={targetCurrency} onChange={(event) => setTargetCurrency(event.target.value)}>
                      <option value="ARS">Pesos argentinos (ARS)</option>
                      <option value="USD">Dólares estadounidenses (USD)</option>
                    </select>
                  </label>
                  <label>Vigencia máx. (días)<input type="number" min="0" value={maxQuoteAgeDays} onChange={(event) => setMaxQuoteAgeDays(event.target.value)} /></label>
                </div>
                <button className="suppliers-button suppliers-button--primary" type="button" disabled={saving} onClick={() => void recalculatePrice()}>{saving ? "Consultando BNA y actualizando…" : "Consultar tasa BNA y actualizar precio"}</button>
              </section>

              <section className="suppliers-pricing">
                <h3>Historial de precios ({detail.prices.length})</h3>
                {detail.prices.length ? detail.prices.slice().reverse().map((price) => (
                  <details className="suppliers-history" key={price.id}>
                    <summary>{priceLabel(price)}{price.equivalentPrice !== undefined && price.equivalentCurrency ? ` · ${new Intl.NumberFormat("es-AR", { style: "currency", currency: price.equivalentCurrency }).format(price.equivalentPrice)}` : ""} · {METHOD_LABELS[price.method]} · {new Date(price.updatedAt).toLocaleDateString("es-AR")}</summary>
                    {price.exchangeRateDetails && <p className="suppliers-detail-copy">
                      Dólar vendedor BNA: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(price.exchangeRateDetails.rate)} por USD · vigente {new Date(`${price.exchangeRateDetails.effectiveDate}T00:00:00`).toLocaleDateString("es-AR")} · consultado {new Date(price.exchangeRateDetails.fetchedAt).toLocaleString("es-AR")} · <a href={price.exchangeRateDetails.source} target="_blank" rel="noreferrer">fuente BNA</a>
                    </p>}
                    <ul>{price.quoteEvaluations.map((evaluation) => (
                      <li key={evaluation.quote.id}>
                        <strong>{evaluation.quote.supplierName}</strong> — {evaluation.status}
                        {evaluation.normalizedUnitPrice !== undefined && ` · ${evaluation.normalizedUnitPrice} ${price.currency}`}
                        {evaluation.reason && ` · ${evaluation.reason}`}
                        <small>{evaluation.quote.sourceReference || evaluation.quote.sourceUrl}</small>
                      </li>
                    ))}</ul>
                  </details>
                )) : <p className="suppliers-detail-copy">Todavía no hay actualizaciones guardadas.</p>}
              </section>

              <section className="suppliers-pricing">
                <h3>Referencias de precio ({detail.quotes.length})</h3>
                {detail.quotes.map((quote) => <p className="suppliers-quote-reference" key={quote.id}>
                  {quote.supplierName} · {quote.unitPrice} {quote.currency} · {quote.sourceType === "manual" ? "Investigación manual" : "Web"}
                  <small>{quote.sourceReference || quote.sourceUrl}</small>
                </p>)}
                {!detail.quotes.length && <p className="suppliers-detail-copy">Sin cotizaciones. No se asignará un precio ficticio.</p>}
              </section>
            </>
          ) : creating ? null : (
            <div className="suppliers-detail-placeholder">
              <h2>{selectedProduct?.name ?? "Selecciona un producto"}</h2>
              <p>Elige un producto del catálogo o crea uno nuevo.</p>
            </div>
          )}
        </aside>
      </div>
      {categoryManagerOpen && <SupplierCategoryManager
        categories={categories}
        onClose={() => setCategoryManagerOpen(false)}
        onSave={saveCategory}
        onDelete={deleteCategory}
        onReorder={reorderCategories}
      />}
    </main>
  );
};
