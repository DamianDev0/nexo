# Cómo adaptan su CRM los líderes (y qué significa para Nexo)

> 2026-09-16 · Investigación con fuentes sobre HubSpot, GoHighLevel, Attio, Twenty, Salesforce, Pipedrive, Zoho, Kommo, Leadsales, DataCRM y Clientify.
> Pregunta: ¿el orden del plan Fase 2 (motor → Empresas → Negocios) es el mejor para un CRM cuya promesa es que cada empresa lo adapte a su negocio?

---

## 1. El esqueleto es el mismo en todos

Los CRM que ganan en adaptabilidad coinciden en seis piezas. Lo que cambia entre ellos es **quién puede usarlas y cuánto cuestan**.

| Pieza                                                                                                                     | HubSpot                                                                | GoHighLevel                                                                          | Attio / Twenty                                            | Nexo hoy                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Objetos propios del cliente                                                                                               | Solo Enterprise (+US$1.000/mes)                                        | Todos los planes desde oct-2025, 10 por cuenta                                       | Attio 3–12 según plan; Twenty ilimitados                  | ❌ tipos fijos `contact \| company \| deal`                                                                |
| Relaciones con etiqueta ("decisor", "comprador de")                                                                       | 50 etiquetas por par                                                   | 10 etiquetas, 1:1 / 1:N / N:N                                                        | Bidireccionales                                           | ❌ solo llaves fijas (`company_id`, `contact_id`)                                                          |
| Pipeline en cualquier objeto                                                                                              | Sí (custom objects en Enterprise)                                      | Sí                                                                                   | Listas + kanban en cualquier objeto                       | ❌ solo negocios                                                                                           |
| Vistas tabla/kanban por objeto                                                                                            | Todos los planes                                                       | Sí                                                                                   | Sí                                                        | ✅ motor genérico (tabla); kanban solo en negocios                                                         |
| Léxico, apariencia, navegación, taxonomías, etiquetas, tipos de actividad, campos (16 tipos, fórmula, permisos por campo) | Por plan                                                               | Parcial                                                                              | Parcial                                                   | ✅ **ya configurable en Ajustes** — ventaja actual (inventario en [`plans/README.md`](../plans/README.md)) |
| Página del registro configurable                                                                                          | Por equipo, tarjetas condicionales                                     | Limitada                                                                             | "Configure page" por objeto                               | ❌ fija por objeto                                                                                         |
| Plantilla de arranque                                                                                                     | Plantillas de modelo de datos por industria + IA "describe tu negocio" | **Snapshots**: paquete versionado con objetos, campos, pipelines, flujos, plantillas | Plantillas de registro; Attio sufre el "lienzo en blanco" | ⚠️ presets que **renombran**, no modelan                                                                   |

Fuentes: HubSpot [custom objects](https://knowledge.hubspot.com/object-settings/create-custom-objects), [association labels](https://knowledge.hubspot.com/object-settings/create-and-use-association-labels), [pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines), [data model templates](https://knowledge.hubspot.com/data-management/data-model-templates) · GoHighLevel [snapshots](https://help.gohighlevel.com/support/solutions/articles/48000982511-snapshots-overview), [custom objects all plans](https://help.gohighlevel.com/support/solutions/articles/155000006631-custom-objects-in-all-plans-higher-limit), [association limits](https://help.gohighlevel.com/support/solutions/articles/155000005346-association-limits) · Attio [data model](https://attio.com/help/reference/attio-101/attios-data-model/define-your-data-model-objects-lists-and-views), [pricing](https://attio.com/pricing) · Twenty [custom objects](https://docs.twenty.com/developers/contribute/capabilities/backend-development/custom-objects).

---

## 2. Lo que cada uno enseña

**HubSpot:** todo objeto es de primera clase (propiedades, relaciones, pipeline, tablero, vistas, página, automatización). Las reglas (validación, únicos, dependencias, campos obligatorios por etapa) viven en el modelo de datos. Arranque con plantillas por industria e IA que propone el modelo. **Debilidad:** cobra caro lo que adapta (objetos propios solo en Enterprise) y la queja #1 es costo + curva de aprendizaje.

**GoHighLevel:** la adaptación es un **paquete versionado** ("snapshot dental", "snapshot roofing") que se instala en muchas cuentas y se actualiza con "push updates". Separa configuración de datos. Entra por la conversación (bandeja unificada, "llamada perdida → WhatsApp") y da valor el día uno. **Debilidad:** depende de agencias; 60–90 días para sentirse cómodo; flujos que fallan en silencio; no hay rollback.

**Attio:** separa **objetos** (sustantivos nuevos del negocio) de **listas** (un proceso sobre registros que ya existen, con atributos propios del proceso). La mayoría de lo que pide una pyme es proceso, no objeto nuevo. **Debilidad:** lienzo en blanco ("los usuarios se pierden sin plantilla") y reportes flojos.

**Twenty:** arquitectura que encaja con la nuestra: **metadata central** (`objectMetadata`, `fieldMetadata`) + **un schema PostgreSQL por workspace** donde la metadata se convierte en tablas y columnas reales; API generada desde la metadata. **Debilidad:** migraciones por tenant delicadas, reportes básicos.

**Salesforce:** muestra el límite: tipos de registro × layouts × perfiles × páginas Lightning explotan en combinaciones y obligan a contratar consultor (US$10k–60k).

**Pipedrive / Kommo / LATAM (Leadsales, DataCRM, Clientify):** objetos fijos + campos custom con tope. Útiles el día uno, techo rápido. Kommo adapta por **etapa** (bots y disparadores por etapa), no por modelo de datos.

---

## 3. Qué confirma y qué corrige esto en Nexo

**Confirma:**

- El motor genérico (vistas, columnas, filtros, edición, archivo, import, tablero) era el paso correcto: todos los líderes tienen "cualquier objeto se comporta igual".
- Colombia-first + WhatsApp + DIAN siguen siendo el foso (nadie global lo cubre).

**Corrige:**

1. **Renombrar no es adaptar.** El preset de salud llama "Cita" a un Negocio y "Clínica" a una Empresa. Una cita tiene fecha, profesional y consultorio; no tiene monto ni probabilidad. Una inmobiliaria necesita "Inmuebles" (no es una empresa ni un negocio). Con tipos fijos, cada vertical termina forzado a campos custom en el objeto equivocado — el mismo techo de Pipedrive.
2. **"Objetos propios llegan tarde" (foundations §3.2) queda desactualizado.** HubSpot los cobra caros y GoHighLevel los liberó a todos los planes en 2025: son la diferencia vendible para pymes. Lo que sí se mantiene: **nunca en blanco, siempre desde plantilla, con límites** (anti-sprawl).
3. **El preset debe ser un paquete versionado**, no un `if (!config.nomenclature)` que se aplica una vez: objetos + campos + pipelines + vistas + plantillas de mensaje + automatizaciones, instalable, actualizable y con rollback (lo que a GoHighLevel le falta).
4. **Pipeline en cualquier objeto**, con campos obligatorios por etapa (Zoho Blueprint, HubSpot stage properties). Es lo que un no-técnico configura de verdad.
5. **Relaciones con etiqueta** resuelven muchos casos sin crear objetos ("Paciente ↔ Acudiente", "Inmueble ↔ Propietario / Arrendatario").

---

## 4. Recomendación de arquitectura

**Modelo Twenty adaptado a nuestras reglas** (schema-per-tenant, repositorios con SQL parametrizado, límites por plan):

- `object_definitions` y `field_definitions` por tenant (metadata versionada, cacheada en Redis). Los objetos estándar (contacto, empresa, negocio, actividad) pasan a ser definiciones `isSystem`.
- **Objetos propios:** tabla genérica por tenant `records (id, object_key, name, owner, stage_id, properties JSONB, …)` con índices GIN y columnas comunes reales. Descartamos DDL por objeto en esta etapa: evita migraciones por tenant en cada cambio y aguanta volúmenes pyme (GoHighLevel limita a 300k registros por objeto). Si un objeto crece, se promueve a tabla propia.
- `record_associations (from_type, from_id, to_type, to_id, label_key)` con límites por par.
- `pipelines` con `object_key` (no solo deals) y `stage_required_fields`.
- El motor web ya usa `ObjectDescriptor`: pasa a construirse **desde la metadata** (un descriptor genérico para objetos propios; los estándar mantienen sus slices específicos).
- **Paquetes de industria v2** (snapshot propio): JSON versionado que declara objetos, campos, relaciones, pipelines, vistas, taxonomías, plantillas y automatizaciones. Instalar = aplicar diff con merge por campo; nunca toca datos.
- Límites iniciales: 10 objetos propios, 60 campos por objeto con alerta en 40, 10 etiquetas de relación por par.

**No hacer:** constructor visual de páginas estilo Salesforce, CSS/JS inyectado, objetos desde cero sin plantilla, fórmulas arbitrarias.

---

## 5. Orden propuesto (reemplaza 2.1–2.4 del plan)

| #       | Épica                                                                                                                    | Por qué                                                                               | Tamaño |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------ |
| **2.1** | **Metadata de objetos** — definiciones, objetos propios en `records`, relaciones con etiqueta, API y descriptor genérico | Sin esto cada vertical choca con el techo de "renombrar"; es la base de todo lo demás | L      |
| **2.2** | **Empresas** sobre el motor + **primer objeto propio real** desde plantilla (Inmuebles o Citas)                          | Prueba el motor con un estándar y un propio a la vez                                  | M      |
| **2.3** | **Pipelines en cualquier objeto** — kanban, etapas con campos obligatorios, pronóstico en Negocios                       | Aquí vive el reto de Negocios, pero generalizado                                      | L      |
| **2.4** | **Paquetes de industria v2** — 3 verticales completos (salud, inmobiliaria, servicios), versionados, instalables         | Time-to-value < 10 min sin consultor ni agencia                                       | M      |
| **2.5** | Actividades + agenda (con "sin próximo paso")                                                                            | Cierra la semana del vendedor                                                         | M/L    |
| 2.6+    | Habeas Data · cierre Fase 1 (sin cambios)                                                                                |                                                                                       |        |

Después: WhatsApp (Fase 3) y automatización con freno legal (Fase 5) se diseñan **sobre objetos y etapas genéricas**, igual que Kommo/GoHighLevel.
