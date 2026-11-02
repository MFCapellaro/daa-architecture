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

`pricing/updatePrice.ts` recibe cotizaciones recolectadas por las fuentes externas; no realiza scraping ni consulta servicios de cambio. El consumidor entrega la fecha de cálculo, moneda de destino y las tasas de cambio (unidades de moneda de destino por unidad de moneda origen).

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

El resultado incluye `updatedAt`, precio y moneda normalizados, método aplicado, IDs de cotizaciones elegidas y evaluación trazable de cada cotización aceptada o rechazada. `price` es `null` y `method` es `unavailable` si no existe ninguna fuente elegible.

El backoffice `/admin/suppliers` inicializa los 29 mixers de este paquete como pendientes de revisión y permite mantener productos, imágenes y cotizaciones con referencias manuales o web. El backend guarda los productos, cotizaciones y ejecuciones del motor por separado en `apps/backend/data/suppliers/{products,quotes,prices}`. Las ofertas de Pool visibles y activas se incorporan a la actualización solo si el modelo coincide y están declaradas su moneda y condiciones de precio; la ausencia de esa información no se convierte en un supuesto. Las categorías y subcategorías del backoffice se exponen para consumo futuro de comparativas/configuraciones mediante los endpoints protegidos `/api/admin/suppliers`.
