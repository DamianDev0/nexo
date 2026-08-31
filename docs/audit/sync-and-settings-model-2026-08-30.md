# Sincronía backend↔frontend + modelo de Settings estilo HubSpot

> 2026-08-30. Tercera parte de la serie: [`crm-foundations.md`](../crm-foundations.md) (qué) → [`crm-implementation-guide.md`](../crm-implementation-guide.md) (cómo) → [`discrepancies-2026-08-30.md`](discrepancies-2026-08-30.md) (deuda) → **este** (sincronía + arquitectura de Settings).

---

## 1. Estado real de sincronía

Consumo del frontend por módulo del API (`grep` de rutas reales, no de menciones):

| Módulo API | Endpoints | Consumo real en web | Estado |
|---|---|---|---|
| `auth` | sí | 7 archivos (DAL + service + proxy) | ✅ sincronizado |
| `settings` | 13 controllers | 6 archivos, 9 páginas | ✅ sincronizado (ver §3) |
| `contacts` | sí | 4 archivos, 2 páginas | ✅ sincronizado |
| `tags` | sí | 2 archivos | ✅ |
| `notifications` | sí | 2 archivos | ✅ |
| `geo` | sí | 1 archivo | ✅ |
| `dashboard` | sí | 2 archivos, 1 página | ⚠️ parcial |
| `users` | sí | 1 archivo | ⚠️ solo invitación |
| `companies` | sí | **0 llamadas** — solo la ruta en `routes.ts` | ❌ backend huérfano |
| `deals` | sí | **0 llamadas** | ❌ backend huérfano |
| `activities` | sí | **0 llamadas** | ❌ backend huérfano |
| `products` | sí | **0 llamadas** | ❌ backend huérfano |
| `timeline` | sí | 0 | ❌ |
| `saved-filters` | sí | 0 | ❌ |
| `message-templates` | sí | 0 | ❌ |
| `webhooks` | sí | 0 | ❌ |
| `api-keys` | sí | 0 | ❌ |
| `bulk-actions` | sí | 0 | ❌ |
| `audit-log` | sí | 0 | ❌ |
| `tenants` | sí | 0 (interno) | — |

**11 módulos del backend no tienen ni una llamada desde el frontend.** No es sorpresa (Fase 2 apenas arranca), pero sí lo es la consecuencia del punto siguiente.

---

## 2. La navegación: dos fuentes de verdad y dos módulos fantasma

**Lo que NO pasa** (corrección a una lectura apresurada del código): los módulos sin página **no producen 404**. `apps/web/src/widgets/app-shell/ui/NavMain.tsx:36` los renderiza como botón deshabilitado, atenuado, con tooltip *"próximamente"*. El manejo es correcto.

**Lo que sí pasa** son tres cosas.

### 2.1 Dos fuentes de verdad para "qué está construido"

```
apps/web/src/widgets/app-shell/lib/nav-items.ts:6
  const BUILT_ROUTES = new Set([dashboard, contacts, settings.company])   ← front, hardcodeado

apps/api/src/modules/settings/constants/default-sidebar.ts
  9 módulos, todos enabled: true                                          ← back
```

El backend dice "estos 9 módulos están encendidos". El frontend, por su cuenta, decide cuáles son clicables. Ninguno de los dos consulta al otro. Cada módulo que entreguemos exige tocar **los dos** archivos, y olvidar uno produce un ítem clicable hacia una página que no existe (ahí sí, 404) o un ítem muerto hacia una página que ya funciona.

**Arreglo.** El backend es quien sabe qué existe. Añadir `status: 'available' | 'coming_soon'` a `SidebarModule` en `packages/shared-types`, emitirlo desde `default-sidebar.ts`, y que `nav-items.ts` lo lea en vez de mantener `BUILT_ROUTES`. Una sola fuente, un solo lugar que tocar al entregar un módulo.

### 2.2 `invoices` y `reports` son módulos fantasma

Aparecen en tres lugares —`DEFAULT_SIDEBAR_MODULE_KEYS` (shared-types:129), `default-sidebar.ts` con `enabled: true`, y `NAV_CRM`— y **no existen en ninguna capa**: no hay módulo de API (los 20 no los incluyen) ni página web. No son "todavía no construidos": no están ni empezados. El ROADMAP los ubica en Fase 3 y en una fase de reportes que aún no está escrita.

**Impacto.** Ocupan dos de nueve ranuras del sidebar de forma permanente y atenuada. El cliente ve "Facturas" gris desde el día uno, que es exactamente la funcionalidad por la que le vamos a cobrar más. Prometer y no entregar en el menú principal es peor que no prometer.

**Arreglo.** Sacarlos del default hasta que exista al menos el backend. El tenant los enciende desde Settings → Navegación cuando lleguen.

### 2.3 Settings → Navegación deja encender lo que nunca va a renderizar

El panel de navegación opera sobre la lista del backend, donde los 9 módulos son togglables. Un usuario puede "activar" Reportes y obtener un ítem gris permanente. El toggle miente sobre lo que controla.

**Arreglo.** Con `status` (§2.1), el panel oculta o marca como no disponibles los `coming_soon` en vez de ofrecer un interruptor sin efecto.

---

## 3. Settings: cómo lo hace HubSpot y por qué el nuestro no escala

### 3.1 El modelo de HubSpot

HubSpot organiza la configuración **por objeto**. Se elige un objeto (Contactos, Empresas, Negocios, Tickets, objetos custom) y todo lo de ese objeto vive bajo pestañas:

```
Objetos  →  [ Seleccionar un objeto: Tickets ▾ ]

  Configuración │ Asociaciones │ Pipelines │ Personalización de registros │ Más
  ─────────────────────────────────────────────────────────────────────────────
  Propiedades           → Gestionar propiedades de Ticket
  Asociaciones          → Gestionar relaciones entre Tickets y otros objetos
  Creando Tickets       → Personalizar el formulario "Crear Ticket"
  Automatización        → reglas por defecto del objeto
```

Y **Personalización de registros** controla, por objeto y por equipo: columna izquierda (tarjeta de información), columna media (hasta 5 pestañas; la de Actividades no se puede editar), columna derecha (registros asociados). Hasta 50 tarjetas por columna, con permisos por tarjeta.

Tres ideas que valen más que la UI:

1. **El objeto es la unidad de configuración.** Todo lo que se puede configurar de Contactos está en Contactos.
2. **Existir ≠ mostrarse.** HubSpot tiene 140+ propiedades por defecto en Contacto, pero el formulario "Crear contacto" muestra ~5. La curaduría es una capa aparte, configurable.
3. **La vista es del objeto, no de la app.** Las tarjetas, pestañas y columnas se configuran por objeto y se pueden diferenciar por equipo.

### 3.2 El nuestro

`apps/web/src/features/manage-settings/config/settings-nav.constants.ts` organiza por **capacidad transversal**:

```
workspace
 ├ appearance  (brand / theme / typography)
 ├ navigation
 ├ nomenclature
 ├ fields          ← campos de TODAS las entidades
 ├ pipelines       ← pipelines de negocios
 ├ activities      ← tipos de actividad
 └ contacts        ← status / lifecycle / sources / types / tags
```

### 3.3 El problema, con números

Nuestro eje es **capacidad**; el de HubSpot es **objeto**. La diferencia solo se nota al escalar:

| | Hoy (1 objeto configurado) | Con 4 objetos (contactos, empresas, negocios, productos) |
|---|---|---|
| **Modelo actual** (capacidad × objeto) | 7 secciones | `contacts/{status,lifecycle,sources,types,tags}` + `companies/{…}` + `deals/{…}` + `products/{…}` → **~20 hojas de menú**, más `fields` y `pipelines` que ya mezclan objetos |
| **Modelo HubSpot** (objeto → pestañas) | 1 selector + 5 pestañas | 1 selector + 5 pestañas. **Crece en el dropdown, no en el árbol** |

Nuestro crecimiento es O(objetos × capacidades). El de HubSpot es O(objetos), y las capacidades son pestañas fijas.

Y ya tenemos la prueba dentro del código: `fields` es una sección global que por dentro pide elegir entidad — o sea, **ya estamos haciendo el patrón "elegir objeto", pero solo en una sección y de forma inconsistente con el resto**.

### 3.4 Propuesta

Reestructurar Settings en tres grupos, con un grupo nuevo **Objetos** que absorbe todo lo que es por-entidad:

```
Tus preferencias
 ├ Perfil
 └ Notificaciones

Cuenta
 ├ Empresa (datos fiscales, NIT, régimen)
 ├ Equipo y permisos
 ├ Privacidad y consentimiento     ← nuevo: Ley 1581 + Ley 2300
 ├ Registro de auditoría
 └ Facturación del plan

Personalización
 ├ Marca (logo, colores, tipografía)
 ├ Navegación
 ├ Nomenclatura
 └ ▸ OBJETOS   [ Contactos ▾ ]
        Configuración          → propiedades del objeto (campos)
        Taxonomías             → estados, etapas, fuentes, tipos, etiquetas
        Asociaciones           → con qué otros objetos se relaciona y con qué rol
        Pipelines              → solo para objetos con pipeline
        Vista del registro     → qué se ve en ficha, tabla y formulario de creación
        Automatización         → reglas por defecto del objeto
```

**Ventajas concretas para nosotros, no solo copia:**

- El árbol deja de crecer al añadir objetos. Empresas y Negocios entran en el dropdown, sin tocar el menú.
- `settings/fields`, `settings/pipelines`, `settings/activities` y `settings/contacts/*` colapsan en un solo layout parametrizado por objeto → menos código, menos tests, menos i18n.
- Encaja exacto con el **Field Registry** (P1 de la guía de implementación): la pestaña "Configuración" es la UI del registro de campos, y "Vista del registro" es la curaduría (§4).
- Le da un hogar natural a Privacidad y consentimiento, que hoy no tiene dónde vivir.

**Costo.** No es reescribir: los paneles que ya existen (`FieldsPane`, `OptionRowActions`, `usePipelinesPane`, `useTagsPane`) se mueven bajo un layout de objeto y se les pasa `entity` como parámetro. La lógica se conserva; cambia el enrutado y el shell.

**Momento correcto: ahora.** Cada objeto nuevo que reciba UI bajo el esquema actual multiplica el costo de la migración. Es el mismo argumento que `entity_views` (B2 de la auditoría de deuda) — y de hecho es el mismo problema visto desde la UI.

---

## 4. Contactos: la base es demasiado ancha y el formulario está mal curado

### 4.1 Lo que hay

**Tabla `contacts`** (`modules/tenants/constants/tenant-schema.sql.ts:63` + migraciones 0014, 0024, 0027, 0028): **38 columnas**.

**Formulario de creación** (`features/create-contact/lib/contact-form-mapping.ts`): **14 campos** — firstName, lastName, email, phone, whatsapp (+ *igual que teléfono*), address, city, municipioCode, status, avatarUrl, source, type, typeLabel, lifecycleStage, más los campos custom.

### 4.2 Las tres discrepancias

**a) 24 columnas no se usan en ninguna parte de la UI.**
`documentType`, `documentNumber`, `jobTitle`, `linkedinUrl`, `birthday`, `department`, `country`, `leadScore`, `dataConsent`, `consentDate`, `consentSource`, `optOutEmail`, `optOutSms`, `optOutWhatsapp`, `lastContactedAt`, `tags`, `companyId`, `assignedToId`, `statusChangedAt`…

**b) Faltan en el formulario los dos campos más importantes de cualquier CRM.**
`companyId` (a qué empresa pertenece) y `assignedToId` (de quién es este contacto) **existen en la base y no están en el formulario**. En HubSpot, "Empresa" y "Propietario" están en el formulario de creación. Sin propietario no hay responsabilidad; sin empresa no hay B2B. Es la omisión más grave de la ficha.

**c) Falta el documento colombiano.**
`documentType` / `documentNumber` (CC, NIT, CE, PP, TI) están en la base, sin UI. Es dato obligatorio para facturar por DIAN. Cuando llegue la Fase de dinero, ningún contacto existente lo tendrá y habrá que pedirlo a mano, uno por uno.

**d) Los campos de consentimiento están en el lugar equivocado.**
`data_consent`, `consent_date`, `consent_source`, `opt_out_email/sms/whatsapp` son columnas booleanas en `contacts`. La Ley 1581 exige evidencia y trazabilidad de la autorización, y la Ley 2300 exige canales autorizados con historial. Un booleano no guarda cuándo se revocó ni por qué. **Estos seis campos deben migrar a las tablas `data_consents` y `contact_channels` (P3 de la guía de implementación)** y salir de `contacts`.

### 4.3 El default mínimo propuesto

Criterio: **un campo entra al default solo si (1) casi todos los negocios lo necesitan y (2) el vendedor lo puede llenar en la primera llamada.** Todo lo demás nace como campo opcional del preset de industria o como campo custom.

**Núcleo — visibles en el formulario de creación (8):**

| Campo | Por qué |
|---|---|
| `firstName` | obligatorio |
| `lastName` | |
| `phone` | en Colombia el teléfono importa más que el email |
| `whatsapp` (con "igual que teléfono") | canal #1 del mercado |
| `email` | |
| `companyId` | **falta hoy** — la asociación que hace B2B |
| `assignedToId` (propietario) | **falta hoy** — sin dueño, el contacto se muere |
| `status` | el pipeline de contacto |

**Segundo nivel — en la ficha, no en el formulario (5):**
`documentType` + `documentNumber` (obligatorio para DIAN), `source`, `lifecycleStage`, `city`/`municipioCode`.

**Sale del núcleo → preset de industria o campo custom (11):**
`jobTitle`, `linkedinUrl`, `birthday`, `address`, `department`, `country`, `leadScore`, `type`, `typeLabel`, `avatarUrl`, `tags`.

**Sale de la tabla → tablas propias (6):**
`dataConsent`, `consentDate`, `consentSource`, `optOutEmail`, `optOutSms`, `optOutWhatsapp` → `data_consents` + `contact_channels`.

**Resultado:** de 38 columnas a **~17 en el núcleo**, con 8 visibles al crear. Lo demás no se pierde: se convierte en metadata (Field Registry) que cada industria enciende. Que es justo el modelo HubSpot — *muchas propiedades disponibles, pocas visibles* — pero con nuestro motor de presets haciendo la curaduría automáticamente en vez de dejársela al usuario.

### 4.4 Nota sobre `type` y `typeLabel`

`type_label VARCHAR(50)` existe solo para guardar el texto libre cuando el usuario elige "Otro". Es un patrón que ensucia: un campo cuyo significado depende del valor de otro campo. Con taxonomías editables (que ya tenemos en `tenant_config.contactTaxonomy`) la opción "Otro" sobra — el usuario agrega el tipo que falta y queda disponible para todos. Recomendación: eliminar `type_label` y el caso especial en el formulario.

---

## 5. Orden sugerido

| # | Acción | Esfuerzo | Por qué ahora |
|---|---|---|---|
| 1 | `SidebarModule.status` en shared-types; backend lo emite; `BUILT_ROUTES` desaparece del front | bajo | Una sola fuente de verdad de "qué existe" |
| 2 | Sacar `invoices` y `reports` del sidebar por defecto | minutos | Dos ranuras muertas en el menú principal desde el día uno |
| 3 | Añadir `companyId` y `assignedToId` al formulario de contacto | bajo | Son los dos campos que hacen que un CRM sea un CRM |
| 4 | Reestructurar Settings al modelo por objeto (§3.4) | medio | Cada objeto nuevo multiplica el costo de no hacerlo |
| 5 | Podar el núcleo de `contacts` a ~17 columnas; el resto a presets/custom | medio | Depende del Field Registry (P1) |
| 6 | Mover consentimiento a `data_consents` + `contact_channels` | medio | Requisito legal, y desbloquea cobranza automatizada |
