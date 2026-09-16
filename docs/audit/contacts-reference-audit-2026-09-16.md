# Auditoría de Contactos como objeto de referencia

> 2026-09-16 · Rama `develop` @ `4fdf430`.
> Objetivo: que Contactos quede como la guía que copian Empresas y Negocios (`docs/plan-phase-2.md` §2.0).
> Método: 4 revisiones independientes (backend, arquitectura web, bugs de punta a punta, preparación para el motor de objetos). Los hallazgos graves se verificaron contra el código.

## Línea base

| Chequeo                                  | Resultado                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm check:arch` (api)                  | ✅ 4 excepciones heredadas, ninguna en `contacts` (sí en `saved-filters` y `timeline`, que Contactos usa) |
| `pnpm --filter web check:arch` (11 cops) | ✅ en Contactos solo quedan 2 excepciones de tipografía (asterisco de obligatorio)                        |
| Tipos api + web                          | ✅                                                                                                        |
| Tests api                                | ✅ 841/841 (89 archivos)                                                                                  |
| Tests web                                | ✅ 1953/1953 (362 archivos)                                                                               |
| Aislamiento entre tenants                | ✅ sin fugas; 6 specs e2e de aislamiento para Contactos                                                   |
| Inyección SQL                            | ✅ columnas por listas permitidas, valores con `$n`                                                       |

La base es sólida. Lo que sigue son los defectos que los gates no ven.

---

## 1. Bugs

Leyenda: ✔ verificado a mano contra el código en esta sesión.

### P0 — pérdida o corrupción de datos

| #         | Bug                                                                                                                                                                                         | Dónde                                                                                                                                                                                   | Escenario                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **C1** ✔ | **Restaurar un contacto fusionado lo resucita vacío.** Restore solo mira `is_active = false`, no `merged_into_id`. La papelera muestra los perdedores de una fusión junto a los archivados. | `contacts.repository.ts:144` (`restoreById`), `bulk-targets.repository.ts:106` (`restore`), `contact-filter-sql.ts:63`, `manage-settings/.../trash/ArchivedContactsList.tsx`            | Fusionar B en A → Papelera → Restaurar B → B reaparece sin actividades, negocios ni consentimientos: un duplicado de A. Los consentimientos de B se borraron en la fusión (`dropRemainingConsents`) y no vuelven. |
| **C2** ✔ | **Campo custom de moneda: la edición en línea guarda pesos y la vista lee centavos.** Se ve 100× más chico.                                                                                 | `entities/contact/lib/custom-field-edit.ts:24` (`parseCustomValue`) vs `custom-field-display.ts:61`; la versión correcta está en `features/create-contact/lib/custom-field-input.ts:25` | Escribir `500000` en la celda → se muestra `$5.000` y así queda guardado. Viola ADR-0002.                                                                                                                         |

### P1 — resultado incorrecto

| #     | Bug                                                                                                                                                                                                                                                                 | Dónde                                                                                                                                          | Escenario                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| C3    | **El número de documento no se normaliza.** La validación limpia puntos y guiones solo para validar; se guarda tal cual. El índice único y la detección de duplicados comparan el texto crudo. El import sí limpia.                                                 | `shared-utils/document-validator.ts:18`, `preview-contact/lib/contact-details-form.schema.ts:14`, `contact-duplicates.repository.ts:15`        | `900.123.456-7` en la ficha y `9001234567` por import → dos contactos con el mismo NIT.                                                  |
| C4 ✔ | **El layout de columnas custom se pierde al recargar.** El sanitizador solo conserva llaves del catálogo fijo y descarta `custom:<key>` de orden, ocultas, anchos y fijadas.                                                                                        | `contacts/mappers/contact-table-state.mapper.ts:12,27,34`                                                                                      | Fijar o redimensionar una columna custom → recargar → vuelve al estado por defecto.                                                      |
| C5 ✔ | **La búsqueda no ignora tildes.** No se usa `unaccent` en ningún lado.                                                                                                                                                                                              | `shared/database/search-sql.ts`, columnas generadas en `tenant-migrations.ts:798`                                                              | Buscar "Jose Garcia" no encuentra "José García".                                                                                         |
| C6    | **La búsqueda no normaliza teléfonos.**                                                                                                                                                                                                                             | `contact-filter-sql.ts:27`, `filter-contacts/query/contacts-query.ts:56`                                                                       | Buscar `+57 300 123 4567` no encuentra el guardado `3001234567`.                                                                         |
| C7    | **Los filtros sobre campos custom siempre comparan como texto** (número, moneda, fecha).                                                                                                                                                                            | `shared/database/advanced-filter-sql.ts` (`conditionClause`), `filter-contacts/config/advanced-filter-fields.constants.ts` (`CUSTOM_TYPE_MAP`) | "Presupuesto > 1000000" compara cadenas: `9` > `10000000`.                                                                               |
| C8    | **El import no valida `status` ni `source` contra la taxonomía del tenant** (`lifecycleStage` sí).                                                                                                                                                                  | `contact-import-row.mapper.ts:165`                                                                                                             | `estado=Interesado VIP` entra como llave inexistente: no aparece en filtros y un PATCH posterior falla en `assertKeys`.                  |
| C9    | **El import solo detecta duplicados por email o documento.** Una fila solo con teléfono siempre se inserta.                                                                                                                                                         | `contact-import.service.ts:140,181`                                                                                                            | Re-subir el mismo CSV de leads con solo teléfono duplica todo.                                                                           |
| C10   | **`lifecycleStage ?? 'subscriber'` hardcodeado.** Los presets usan otras llaves (`prospecto`…).                                                                                                                                                                     | `contacts/mappers/contact.mapper.ts`                                                                                                           | Tenant de salud recibe una etapa que su taxonomía no tiene. **Rompe la filosofía de adaptabilidad.**                                     |
| C11   | **La edición masiva se salta lo que hace la edición individual:** sin historial de etapa, sin eventos `CONTACT_UPDATED`/`LIFECYCLE_CHANGED` (webhooks y timeline no se enteran), sin invalidar el caché de conteos y sin validar el tipo de valor de campos custom. | `bulk-actions/handlers/update-field.handler.ts`, `bulk-actions.service.ts` (`validateFieldUpdate`) vs `contacts.service.ts` (`update`)         | Cambiar etapa a 200 contactos → ningún webhook y conteos viejos 30 s.                                                                    |
| C12   | **`valueCents` de negocios en el timeline del contacto llega como string.** BIGINT sin `toCents`.                                                                                                                                                                   | `contacts/mappers/contact.mapper.ts:67`, `interfaces/contact-row.interfaces.ts:55`                                                             | `total + valueCents` concatena texto.                                                                                                    |
| C13   | **La ficha y el drawer no muestran los campos custom del tenant**, solo `role` y `address` hardcodeados.                                                                                                                                                            | `entities/contact/lib/contact-preview.ts`                                                                                                      | Una clínica crea "EPS" y "Tipo de sangre": salen en la tabla y el formulario, pero no en la ficha. **Golpe directo a la adaptabilidad.** |

### P2

| #   | Bug                                                                                                                                                                              | Dónde                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| C14 | El prefetch del servidor arma la query sin `viewerId` y sin filtros avanzados → "Mis contactos" pre-carga todos y el cliente vuelve a pedir.                                     | `filter-contacts/query/contacts-query.ts` (`contactListQueryFromParams`), `model/useContactsTable.ts` (`prefetchPage`) |
| C15 | Solo el import llama `revalidateContacts()`; crear, editar, archivar, fusionar y las acciones masivas solo invalidan TanStack → la primera carga SSR puede mostrar datos viejos. | `entities/contact/api/revalidate-contacts.ts` y sus consumidores                                                       |
| C16 | El evento `contact.merged` no lleva `loserId` → un webhook externo no sabe qué ID murió.                                                                                         | `contact-merge.service.ts:76`                                                                                          |
| C17 | El conflicto de fusión muestra el texto crudo `contact_already_merged`, y también sale cuando el perdedor solo está archivado.                                                   | `contact-merge.service.ts:86`, `shared/lib/notify-save-failed.ts:9`                                                    |
| C18 | En la ficha, un 404 cae en `isError`: nunca se ve el estado "no encontrado".                                                                                                     | `views/contact-detail/ui/ContactDetailView.tsx`                                                                        |

### Adyacentes (fuera de Contactos, bloquean la 2.2)

| #     | Bug                                                                                                                                                      | Dónde                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| D1 ✔ | **La búsqueda de negocios falla siempre que llega `q`:** `DEAL_SEARCH` usa `c.` y `co.`, pero `DEAL_LIST_FROM` no hace esos joins. El test mockea la DB. | `deals/constants/deal.constants.ts:59,73`         |
| D2    | Las acciones masivas permiten etiquetas en negocios, pero `deals` no tiene columna `tags`.                                                               | `bulk-actions/constants/bulk-action.constants.ts` |

---

## 2. Rendimiento

| #   | Hallazgo                                                                                                                             | Dónde                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| R1  | Faltan índices en `contacts(status)` y `GIN(tags)`. Hoy pasa el presupuesto de 50k filas por scan secuencial; se degrada al crecer.  | `tenant-migrations.ts` (~814-854)                                                                       |
| R2  | El import con estrategia "update" hace un UPDATE por fila dentro de una sola transacción larga (el insert sí va en lotes de 500).    | `contact-import.service.ts:152`                                                                         |
| R3  | `getCustomFields` es el único getter de configuración sin caché; se llama en cada escritura.                                         | `settings/services/tenant-config.service.ts:158`                                                        |
| R4  | Cada guardado de una celda crea un `Set` nuevo de pendientes → se reconstruyen todas las columnas y se re-renderiza la tabla entera. | `widgets/contacts-board/model/useBoardColumns.ts:39`, `entities/contact/model/contact-pending.store.ts` |

---

## 3. Adaptabilidad: código que decide lo que debería decidir la configuración

Test: _¿funciona igual para una clínica y una constructora sin un `if (industry)`?_

| #   | Hallazgo                                                                                                                                                               | Dónde                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A1  | **Rama por sector en el API:** `contactSystemFieldsFor(sector)` con `SOCIAL_URL_SECTORS` y `ROLE_LABEL_BY_SECTOR`. Tiene que ser dato del preset.                      | `settings/constants/contact-system-fields.ts`                                                                           |
| A2  | Campos de completitud (`email`, `phone`, `documentNumber`), días de "estancado" (30) y "sin asignar reciente" fijos en código.                                         | `entities/contact/config/contact-columns.constants.ts`, shared-types                                                    |
| A3  | Filtros rápidos fijos a `lifecycleStage` y `source`; IDs masivos `status`/`lifecycle` fijos.                                                                           | `filter-contacts/config/quick-filters.constants.ts`, `bulk-action-registry.constants.ts`                                |
| A4  | Textos de ayuda por llave de taxonomía solo existen para las llaves por defecto; las de los presets quedan sin texto.                                                  | `filter-contacts/lib/contact-lists.ts`, `lib/quick-filters.ts`, `entities/contact-taxonomy/query/useContactTaxonomy.ts` |
| A5  | Notificación del API en español con "contacto" literal (no respeta la nomenclatura ni el idioma). Etiquetas del import en inglés.                                      | `contacts.service.ts`, `contact-import.mapper.ts`                                                                       |
| A6  | Unos 45 textos con "contacto" en `es.ts` que no pasan por la nomenclatura. Íconos fijos en vez de `moduleIcon('contacts')`; el `iconPack` del preset no se usa en web. | `shared/i18n/locales/es.ts`                                                                                             |
| —   | Ver también C10 y C13.                                                                                                                                                 |                                                                                                                         |

---

## 4. Arquitectura: patrones que no se deben copiar

| #   | Hallazgo                                                                                                                                                                       | Dónde                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X1  | **Imports laterales feature → feature** (ADR-0003 los prohíbe). Ningún cop los detecta porque pasan por `index.ts` y boundaries solo tipa por capa.                            | `preview-contact/ui/ContactRecordSections.tsx:5` → `manage-contact-consents`; `compose-contact-actions/lib/message-channel.ts:1` → `compose-message`; también `manage-settings → setup-workspace`, `schedule-meeting → log-contact-activity` |
| X2  | Regla de negocio en `ui/`: `isRequired` duplica la lista de `contact-completeness.ts`.                                                                                         | `preview-contact/ui/ContactDetailsForm.tsx:27`                                                                                                                                                                                               |
| X3  | **Transporte de mutaciones indefinido:** la doc pide Server Actions; Contactos usa TanStack + axios en todo. Requiere una ADR antes de extraer el motor.                       | `docs/frontend-architecture.md` §3.2 vs `shared/api/services/contacts.service.ts`                                                                                                                                                            |
| X4  | Cuatro formas de mutar: parche optimista, `useMutation` + invalidación, lista manual de `invalidateQueries`, `setQueryData` con debounce.                                      | `useOptimisticContactListPatch`, `useArchiveContact`, `useLinkContactCompany`, `useSaveContactTableState`                                                                                                                                    |
| X5  | Dos formas de mostrar errores: `notifySaveFailed(error)` y `sileo.error({title})`; los toasts de éxito viven a veces en el hook genérico y a veces en la feature.              | varios                                                                                                                                                                                                                                       |
| X6  | Seis tipos de "opción" (`key`/`value`/`id`) y tres constructores de opciones de miembros del equipo. Varios pickers distintos para el mismo problema.                          | `TaxonomyChoice`, `ChoiceOption`, `SelectOption`, `FilterFieldOption`, `BulkChoiceOption`, `AssigneeOption`                                                                                                                                  |
| X7  | Taxonomía leída de dos formas en web y dos en API (una con cast desde `ctx.config`).                                                                                           | `useContactTaxonomy` vs `useContactTaxonomySection`; `bulk-actions.service.ts:320`                                                                                                                                                           |
| X8  | Prefijo de campo custom `custom:` (columnas, bulk, import) vs `custom.` (filtros).                                                                                             | `shared-types/contact-views.ts`, `advanced-filter-sql.ts`                                                                                                                                                                                    |
| X9  | Estado de filtros partido en tres (`status` legado, params de filtros rápidos, `af`); las vistas guardadas pierden filtros rápidos y lista, e ignoran el orden.                | `manage-contact-views/lib/view-snapshot.ts`                                                                                                                                                                                                  |
| X10 | Tres fuentes del orden permitido (`CONTACT_SORT_FIELDS`, `SORTABLE_COLUMNS`, catálogo); las columnas custom no se pueden ordenar. Filtrables declarados distinto en api y web. | shared-types, `contacts/constants`, `filter-contacts`                                                                                                                                                                                        |
| X11 | Tres helpers de fecha paralelos y sufijos `T00:00:00-05:00` a mano.                                                                                                            | `contact-display.ts`, `export-file-name.ts`, `custom-field-display.ts`, `ContactDateFieldCell.tsx`, `ActivityTimeline.tsx`                                                                                                                   |
| X12 | Vocabulario de entidad `'contact'` vs `'contacts'` según el subsistema.                                                                                                        | `entities/nomenclature/model/module-entity.ts`                                                                                                                                                                                               |
| X13 | El módulo `saved-filters` duplica `contact_views` y no tiene ningún consumidor web.                                                                                            | `apps/api/src/modules/saved-filters`                                                                                                                                                                                                         |
| X14 | Fusionar pide `SALES_REP`; borrar e importar piden `MANAGER`. La fusión reasigna facturas y conversaciones (ADR-0007).                                                         | `contacts.controller.ts:278`                                                                                                                                                                                                                 |

---

## 5. Lo que está bien y se vuelve plantilla

- SQL dinámico solo por listas permitidas; valores siempre con `$n`.
- Transacción de fusión (ADR-0007): `FOR UPDATE` en orden fijo, re-chequeo después del lock y test e2e de fusiones cruzadas.
- Caché de conteos con invalidación por versión.
- Vistas con propiedad validada en servicio y en SQL, más advisory lock y test de concurrencia.
- DTOs colombianos: `IsCOPhone`, `IsDocumentNumberFor` con DV, `IsBoundedObject`.
- Suite de rendimiento de 50k filas con p95 por endpoint.
- Parche optimista con rollback por llave (`useOptimisticContactListPatch`).
- Registro de renderers de celda por tipo de campo.
- RSC prefetch + DAL con tags, separado del cliente interactivo.
- `ui/containers/` como único punto con fetching en UI.
- Tests espejo en `tests/` para `lib/` y `model/`. Falta el patrón de round-trip **parse → guardar → mostrar** por tipo de campo, que habría atrapado C2.

---

## 6. Plan de remediación

Cada sprint sale con tests de regresión por bug, gates verdes y la suite de 50k filas en presupuesto.

### S1 — Integridad de datos

C1, C2, C3, C8, C9, C10, C12 · D1, D2.

- C1: restore excluye `merged_into_id IS NOT NULL`; la papelera no lista fusionados (o los muestra como "fusionado en X", sin restaurar).
- C2: una sola función parse/format de moneda en `entities`, usada por el formulario y la celda; test de round-trip por tipo de campo.
- C3: normalizar en el decorador DTO y en el schema zod; migración que limpia datos existentes y resuelve colisiones.
- C10: la etapa por defecto sale de la taxonomía del tenant.

### S2 — Búsqueda y filtros

C4, C5, C6, C7, C14 · R1.

- C5: extensión `unaccent` (función `IMMUTABLE` envolvente) en las columnas generadas + re-index; test "Jose" ↔ "José".
- C7: cláusulas tipadas por `fieldType` (cast numérico y de fecha).

### S3 — Escrituras consistentes

C11, C15, C16, C17, C18 · R2, R3.

- C11: la edición masiva pasa por el mismo camino de dominio (eventos, historial, validación, caché).
- C15: un único `afterContactMutation()` que invalida TanStack y el tag RSC.

### S4 — Adaptabilidad

C13 · A1–A6.

- La ficha renderiza los campos custom del tenant (mismo registro de renderers que la tabla).
- Umbrales, filtros rápidos y campos de completitud salen de la configuración del tenant o del preset.
- Quitar la rama por sector del API y moverla a datos del preset.
- Probar en al menos 2 presets (salud e inmobiliaria).

### S5 — Unificación antes del motor

X1–X13 · R4.

- ADR-0009: transporte de mutaciones (X3), forma única de hook de mutación (X4) y política de toasts (X5).
- Un tipo `ChoiceOption{value,label,color}`, un acceso a taxonomía, un prefijo custom, un vocabulario `ObjectType`, un helper de fechas.
- Cop nuevo que bloquee imports laterales entre slices del mismo layer (X1).
- Retirar `saved-filters` (X13).

Después de S5 empieza la extracción del motor (`plan-phase-2.md` §2.0).

---

## 7. Decisiones pendientes del producto

1. **X3 — Transporte de mutaciones.** Recomendación: mantener TanStack para la grilla optimista y que el `mutationFn` llame una Server Action (zod + `revalidateTag`). Así se cumple la doc y no se pierde el optimismo.
2. **X14 — Rol mínimo para fusionar.** Recomendación: `MANAGER`, igual que borrar e importar.
3. **X13 — Módulo `saved-filters`.** Recomendación: retirarlo; `object_views` lo reemplaza.
