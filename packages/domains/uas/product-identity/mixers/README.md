# DAA — Suppliers / Mixers

Paquete inicial de fichas YAML para la familia MIXERS.

## Ubicación prevista en el monorepo

`packages/domains/uas/product-identity/mixers/`

## Contenido

- `index.yml`: índice de marcas y modelos.
- `schema/mixer.schema.yml`: enums y reglas de validación.
- Un archivo `.yml` por modelo, agrupado por fabricante.
- `pricing/`: motor y tipos para generar registros independientes de actualización de precios.

## Convenciones

- `null` = dato no publicado o no verificado; nunca significa `No`.
- No se infieren potencias HP.
- Configuración Básica / Intermedia / Máxima queda pendiente de una matriz de equipamiento común.
- Precio promedio se calcula desde cotizaciones unitarias independientes y vigentes.
- Se conservan por separado cotizaciones de dealer y ofertas de Pool.
- El historial de precios no se agrega a las fichas técnicas; cada ejecución de `pricing/updatePrice.ts` produce un registro serializable que el consumidor debe persistir.
- Fotos se cargarán después de obtener imágenes de origen; máximo cuatro por ficha.
- El Tanque de Respaldo Alemor está clasificado como `tanque_auxiliar`, no como mixer.

## Estado de investigación

La información pública de Grupo Alemor, SprayTec y Aguará se incorporó cuando pudo verificarse.
Jotas Agroimplementos y parte de Industrias CAS quedan como fichas base con campos pendientes.
Las variantes de Aguará deben reconciliarse con su nomenclatura comercial vigente (Simple / Duplo).
Los precios históricos de catálogos no se cargaron como precios vigentes.

## Motor de actualización de precios

`pricing/updatePrice.ts` recibe cotizaciones recolectadas por las fuentes externas y las tasas de conversión (unidades de moneda de destino por unidad de moneda de origen). El motor es independiente de los proveedores de cambio. El backoffice consulta la cotización vendedor del dólar publicada por el Banco Nación, guarda la fuente, fecha de vigencia y fecha de consulta en el registro, y calcula el equivalente ARS/USD en ambos sentidos.

La normalización calcula el precio unitario sin IVA, flete, financiación ni accesorios. Si una cotización incluye alguno de esos componentes, debe declarar el monto incluido; si incluye IVA, debe declarar la alícuota. Las cotizaciones sin información suficiente, vencidas, futuras, de otro producto, sin conversión disponible o sin fuente verificable se conservan como rechazadas en la trazabilidad y no forman el precio.

Una oferta de Pool solo se considera si está activa, corresponde al producto y no venció; su precio unitario normalizado prevalece sobre fuentes web. Sin una oferta activa, se promedia la cotización más reciente de hasta tres dealers independientes. El precio publicado por el fabricante se usa como referencia únicamente si no hay cotizaciones de dealers válidas; no se mezcla en ese promedio.

Uso:

```ts
import { updatePrice } from "./pricing/index.js";

const update = updatePrice(quotes, {
  productId: "mixer-grupo-alemor-am-mixer-240",
  targetCurrency: "ARS",
  asOf: new Date().toISOString(),
  exchangeRates: { USD: 1000 }
});
```

El resultado incluye `updatedAt`, precio y moneda normalizados, método aplicado, IDs de cotizaciones elegidas y evaluación trazable de cada cotización aceptada o rechazada. Cuando se proporciona `exchangeRateDetails`, el resultado incluye también la tasa utilizada y el precio equivalente en la otra moneda. `price` es `null` y `method` es `unavailable` si no existe ninguna fuente elegible.

El backoffice `/admin/suppliers` inicializa los 29 mixers de este paquete como pendientes de revisión y permite mantener productos, imágenes y cotizaciones con referencias manuales o web. El backend guarda categorías, productos, cotizaciones y ejecuciones del motor por separado en `apps/backend/data/suppliers/`. Las categorías son administrables (ABM y orden) y cada una define sus propios atributos tipados; los mixers se normalizan desde los campos técnicos de sus YAML, excluyendo precio, imágenes y fuentes de la estructura de características. `null` representa una característica aún no verificada.

El build de producción copia el catálogo de mixers y los datos iniciales de Suppliers al artefacto `dist`. En el servidor, configura `SUPPLIER_DATA_DIRECTORY` con una ruta persistente para conservar altas, cambios, cotizaciones y precios administrados entre deployments.

La API de lectura `/api/suppliers/categories` y `/api/suppliers?category=<id>` expone categorías y productos activos para comparativas/configuraciones. `/api/suppliers/compare?category=<id>&ids=<id1>,<id2>` rechaza modelos fuera de la misma categoría y devuelve solo los atributos marcados como comparables para esa categoría. Las rutas administrativas de categorías y productos están bajo `/api/admin/suppliers` y requieren rol de administrador. Las ofertas de Pool visibles y activas se incorporan a la actualización solo si el modelo coincide y están declaradas su moneda y condiciones de precio; la ausencia de esa información no se convierte en un supuesto.
