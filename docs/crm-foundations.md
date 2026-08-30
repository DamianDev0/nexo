# NexoCRM — Fundamentos, Pilares y Reestructuración del Producto

> Versión 1.0 · 2026-08-30
> Documento de estrategia de producto. Complementa `PRD.md` (qué construimos) y `ROADMAP.md` (en qué orden).
> Implementación técnica: [`crm-implementation-guide.md`](crm-implementation-guide.md).
> Este documento responde: **¿qué es realmente un CRM, qué de eso ya tenemos, y qué nos hace distintos en Colombia?**

---

## 1. Diagnóstico: por qué reestructurar

Construimos backend antes que producto. Hoy tenemos 20 módulos de API, un motor de theming, presets por industria y campos custom — pero la pregunta "¿qué es un CRM?" nunca se contestó de forma canónica. El resultado: un roadmap ordenado por *módulos técnicos* (contacts, deals, activities) en vez de por *capacidades de negocio* (captar, calificar, cerrar, cobrar, retener).

Dos datos que enmarcan todo lo demás:

- Gartner/Forrester documentan tasas de fracaso de implementación de CRM entre **47% y 63%**; en pymes latinoamericanas se estima **~60% de abandono antes del primer año**.
- La causa dominante **no es el producto, es la implementación**: el CRM no refleja cómo la empresa vende, pide demasiados datos inútiles, no ahorra tiempo, y el equipo termina vendiendo por WhatsApp fuera del sistema.

Traducción para nosotros: **nuestro competidor real no es HubSpot. Es Excel + WhatsApp personal.** Y el riesgo #1 no es que falte una feature, es que el CRM no se use. Todo el diseño debe optimizar *time-to-first-value* y *fidelidad al proceso real del cliente*, no cantidad de módulos.

---

## 2. Los cuatro pilares y su traducción a producto

Flowlu (y la literatura clásica de CRM) define cuatro pilares: **Personas → Estrategia → Proceso → Tecnología**, en ese orden de importancia. La tecnología es el último, no el primero.

Nosotros vendemos tecnología. Por eso nuestro trabajo no es "hacer el pilar 4 muy bueno", sino **absorber los pilares 1–3 dentro del producto**, porque la pyme colombiana no tiene consultor de implementación.

| Pilar | Qué es | Cómo lo absorbe Nexo (no es opcional, es el producto) |
|---|---|---|
| **Personas** | Adopción, capacitación, cultura | Onboarding guiado que configura el CRM *por* el usuario. Cero manual. Métrica: usuario crea su primer negocio en < 10 min. UI en español colombiano. |
| **Estrategia** | Metas medibles | Onboarding pregunta 3 cosas (sector, cómo vendes, qué duele) y de ahí deriva pipeline, campos y dashboard. La estrategia se materializa como *configuración*, no como PDF. |
| **Proceso** | El método real de venta | **Presets por industria** (9 sectores ya en código) + pipelines y taxonomías editables. El CRM se adapta al proceso; nunca al revés. |
| **Tecnología** | La herramienta | Motor data-driven: metadata en backend, UI derivada. Ver §4. |

**Regla de producto derivada:** cualquier feature que exija que el cliente "primero defina su proceso" está mal diseñada. El producto debe traer un proceso por defecto, defendible, y dejarlo cambiar después.

---

## 3. La anatomía canónica de un CRM

HubSpot enseña el CRM como **objetos → registros → propiedades → asociaciones → eventos**. Salesforce y Twenty (open source) usan el mismo esqueleto. Este es el modelo canónico y es el que debe gobernar nuestro dominio:

```
OBJETO         (tipo de entidad: Contacto, Empresa, Negocio, Actividad, Producto, Factura)
 └─ REGISTRO   (una instancia concreta)
     ├─ PROPIEDADES  (campos: estándar + custom, tipados)
     ├─ ASOCIACIONES (relaciones tipadas entre registros)
     └─ EVENTOS      (timeline inmutable: qué pasó, cuándo, quién)
```

Encima de ese esqueleto van cuatro capas transversales:

- **Vistas** — filtros guardados, columnas, kanban/tabla/calendario. Los mismos datos, muchas perspectivas.
- **Pipelines** — máquinas de estado con etapas, probabilidad y pronóstico.
- **Automatización** — trigger → condición → acción sobre objetos y eventos.
- **Permisos** — qué rol ve/edita qué objeto, campo y registro.

### 3.1 Las 8 capacidades núcleo (checklist de paridad)

Destilado de Salesforce, HubSpot y Flowlu. Esto es lo que un comprador entiende por "CRM". Estado real hoy:

| # | Capacidad | Qué incluye | Estado Nexo |
|---|---|---|---|
| 1 | **Gestión de contactos y empresas** | ficha 360, dedup, jerarquía empresa↔contacto, historial | Backend ✅ · UI parcial |
| 2 | **Pipeline y oportunidades** | etapas, probabilidad, pronóstico, motivos de pérdida | Backend ✅ · UI ❌ |
| 3 | **Actividades y agenda** | tareas, llamadas, reuniones, recordatorios, calendario | Backend ✅ · UI ❌ |
| 4 | **Comunicación multicanal** | WhatsApp, email, formularios, inbox unificado | ❌ (0 código) |
| 5 | **Automatización de flujos** | trigger→condición→acción, secuencias, asignación | ❌ (0 código) |
| 6 | **Reportes y analítica** | dashboards, embudo, ciclo de venta, cohortes | Dashboard básico ✅ |
| 7 | **Personalización** | campos custom, objetos, nomenclatura, vistas, theming | ✅ **ventaja actual** |
| 8 | **Datos e integraciones** | import/export, API, webhooks, dedup, auditoría | Backend ✅ (import, webhooks, api-keys, audit-log) |

Lectura honesta: **somos fuertes donde el mercado no compra (7 y 8) y estamos en cero donde sí compra (4 y 5).** Eso lo corrige el roadmap de §7.

### 3.2 Gobernanza del modelo de datos (aprendizaje ajeno, gratis)

De las guías de arquitectura de HubSpot/Salesforce, tres reglas que debemos codificar como límites del producto:

1. **Property sprawl degrada el sistema.** Los equipos crean 200+ campos custom cuando 40 bastan. → Nexo debe *sugerir* campos por preset y advertir al pasar umbrales, no dar un lienzo infinito.
2. **Todo campo de texto libre es un problema de calidad de datos futuro.** → Por defecto, `select` sobre `text`. El inferidor de campos del import ya va en esta dirección.
3. **Objetos custom sin caso de uso documentado son basura.** → Los objetos custom llegan tarde en el roadmap y siempre con plantilla, nunca en blanco.

---

## 4. La marca Nexo: el motor data-driven

Esto es lo que ya nos diferencia y hay que volverlo explícito, nombrado y vendible.

**Tesis:** en Nexo, la aplicación no está *codificada*, está *declarada*. El backend emite metadata por tenant y el frontend se deriva de ella. Un vertical nuevo es **datos, no un fork de código**.

Piezas que ya existen en `apps/api/src/modules/settings/`:

| Pieza | Archivo/servicio | Qué declara |
|---|---|---|
| Presets por industria | `constants/industry-presets.ts` | 9 sectores: salud, educación, inmobiliaria, comercio, servicios, restaurante, tecnología, construcción, otros |
| Nomenclatura | `constants/default-nomenclature.ts` | "Contacto/Negocio" → "Paciente/Tratamiento", "Inmueble/Visita" |
| Navegación | `constants/default-sidebar.ts` | qué módulos existen y en qué orden para ese tenant |
| Taxonomías | `tenant_config.contactTaxonomy` | estados y fuentes de contacto como **datos**, ya no como enums |
| Campos custom | `custom-fields-validator.service.ts` | contacts, companies, deals |
| Theming | `ThemeCssService` | tokens de color/tipografía por tenant |
| Pipelines | `pipeline.controller.ts` | etapas, probabilidad |

**Las cuatro capas de personalización** (usarlas como lenguaje interno y comercial):

1. **Léxico** — cómo se llaman las cosas (nomenclatura, iconos, idioma).
2. **Estructura** — qué campos, objetos y etapas existen (campos custom, pipelines, taxonomías).
3. **Comportamiento** — qué pasa solo (automatizaciones, validaciones, scoring). ← **hueco actual**
4. **Apariencia** — marca visual (theming, logo, dominio).

Tenemos 1, 2 y 4. **La capa 3 es la que se cobra.** Un CRM que se ve como tu empresa es bonito; uno que *trabaja* como tu empresa es el que no se cancela.

**Trampa a evitar (regla dura):** personalizable ≠ constructor de software. El PRD ya lo dice ("personalizable dentro de estándares"). Concretamente: no construimos objetos arbitrarios en blanco, ni un lenguaje de fórmulas, ni un builder de UI drag&drop. Todo preset debe ser una **opinión**, no un lienzo.

---

## 5. Adaptabilidad multi-industria sin fragmentar el producto

Modelo mental: **un núcleo, N paquetes verticales.**

```
NÚCLEO (idéntico para todos)           PAQUETE VERTICAL (100% datos)
─────────────────────────────          ────────────────────────────────
Objetos y asociaciones                 Nomenclatura
Timeline y auditoría                   Pipeline + etapas + probabilidades
Motor de vistas y filtros              Campos custom sugeridos
Motor de automatización                Taxonomías (estados, fuentes)
Permisos                               Plantillas de mensajes
Multitenancy                           Dashboard por defecto
DIAN / Wompi / WhatsApp                Automatizaciones precargadas
                                       Tags e iconos
```

Un preset vertical debe contestar cinco preguntas, siempre las mismas:

1. ¿Cómo llamas a tus clientes y a tus ventas? *(léxico)*
2. ¿Cuáles son tus etapas hasta el cierre? *(pipeline)*
3. ¿Qué 5–8 datos necesitas de cada cliente que otros no necesitan? *(campos)*
4. ¿Qué mensaje mandas y cuándo? *(plantillas + automatizaciones)*
5. ¿Qué número miras cada mañana? *(dashboard)*

Los presets actuales cubren 1, 2 y 3. **Faltan 4 y 5 en los nueve sectores** — es trabajo de datos, barato, y multiplica el valor percibido en el minuto uno del onboarding.

---

## 6. Colombia: quejas reales del mercado y cómo Nexo las responde

### 6.1 Quejas documentadas

| # | Queja | Fuente / evidencia |
|---|---|---|
| Q1 | "El CRM no refleja cómo vendemos; pide datos inútiles" | causa #1 de abandono en pymes LATAM |
| Q2 | "Vendemos por WhatsApp y el CRM vive aparte" | WhatsApp es el sistema de ventas de facto de 2.5M de micro/pymes colombianas |
| Q3 | "Precios en USD que escalan rápido" | crítica recurrente a HubSpot; el costo crece al crecer |
| Q4 | "Soporte en español limitado fuera de partners locales" | HubSpot; soporte cae en picos de temporada en Siigo/Alegra (esperas > 2 h en cierres de IVA y exógena) |
| Q5 | "Configurarlo requiere consultor" | Zoho/Bitrix24: alta curva de configuración y adaptación inicial |
| Q6 | "Los contables no son CRM y los CRM no facturan" | Alegra/Siigo cumplen DIAN pero no gestionan pipeline; errores y rechazos DIAN son fricción documentada |
| Q7 | "Actualizaciones constantes confunden al usuario" | reseñas de DataCRM (competidor colombiano directo) |
| Q8 | "Faltan módulos: marketing, servicios" | reseñas de DataCRM |
| Q9 | "Datos sucios" tras importar de Excel | causa clásica de fracaso de CRM |

### 6.2 Respuesta de producto (esto es el roadmap, no el marketing)

| Queja | Respuesta Nexo | Estado |
|---|---|---|
| Q1 | Presets por industria + nomenclatura + taxonomías editables; onboarding que configura por ti | ✅ base construida |
| Q2 | WhatsApp como objeto de primera clase: inbox bidireccional, conversación en el timeline del contacto, cobro y factura por WhatsApp | ❌ **prioridad máxima** |
| Q3 | Precio en COP, por tenant, sin cargo por campo custom ni por objeto | ✅ decidido |
| Q4 | Producto colombiano, soporte local, español colombiano; documentación y estados de error en español | ✅ por diseño |
| Q5 | Time-to-value < 10 min; el consultor es el preset | ✅ base construida |
| Q6 | **El puente**: CRM + DIAN + Wompi en un solo registro. Negocio ganado → factura → link de pago → conciliación → cartera | ❌ Fase 3 |
| Q7 | Changelog in-app, cambios de UI con opt-in, sin mover la navegación sin avisar | ⬜ política a adoptar |
| Q8 | Servicio/postventa como pipeline configurable (mismo motor, otro preset), no como módulo nuevo | ⬜ diseño |
| Q9 | Import con inferencia de tipos, dedup y preview antes de escribir | ✅ parcial (`shared/imports`) |

### 6.3 El foso regulatorio: lo que ningún CRM global va a construir

Esto es lo defendible. Ninguna de estas cuatro cosas la hace HubSpot, y son obligatorias en Colombia.

**a) Ley 2300 de 2023 ("Dejen de Fregar") — compliance de contacto por diseño.**
Regula canales, horario y periodicidad con que se puede contactar a un consumidor en gestiones de cobranza. Horarios permitidos: **lunes a viernes 7:00–19:00, sábados 8:00–15:00; prohibido domingos y festivos** salvo autorización expresa. Solo por los canales que el consumidor autorizó. Sanciona SIC/Superfinanciera.

→ **Feature Nexo:** el motor de automatización de cobranza es *consciente de la Ley 2300*. Calendario de festivos colombianos integrado; encolado que retiene mensajes fuera de ventana y los libera al abrir; registro por contacto de canales autorizados; tope de frecuencia; log auditable de "a quién contactamos, cuándo, por qué canal, con qué autorización".
→ **Argumento comercial:** "Nexo no te deja incumplir la Ley 2300." Un CRM global te deja mandar el WhatsApp de cobro un domingo a las 9 pm y la multa es tuya. Este es probablemente **el diferenciador más vendible que tenemos** y cuesta poco: es lógica de calendario + política, no IA.

**b) Habeas Data (Ley 1581 de 2012) — el CRM *es* una base de datos personales.**
Exige autorización previa, expresa e informada; finalidad declarada; canales para ejercer derechos; y el titular puede revocar y pedir supresión.

→ **Feature Nexo:** campo de origen y prueba de autorización en cada contacto; finalidad por contacto; export y borrado del titular en un clic (ya está en Fase 5 del roadmap — **debe subir de prioridad**, es requisito legal, no hardening); política de privacidad por tenant generada desde la configuración.

**c) DIAN 2026 — Resolución 000227 de 2025.**
Compila ~70 resoluciones; endurece las reglas: **transmisión el mismo día** (ya no 10), documento electrónico para POS, RADIAN como título valor (factoring), más escenarios de documento soporte, cruces automáticos con exógena y nómina.

→ **Feature Nexo:** emisión el mismo día no negociable en el diseño de colas; eventos RADIAN para clientes que hacen factoring (dolor real de flujo de caja en pymes); estados de error DIAN traducidos a español accionable en vez de códigos crudos.

**d) Economía de WhatsApp — el costo es una feature.**
Desde julio 2025 Meta cobra **por mensaje de plantilla**, no por conversación. Tarifas Colombia: marketing ≈ **USD 0.0125**, utility y authentication ≈ **USD 0.0008** — marketing cuesta ~15× más que utility. Facturación en COP disponible desde octubre 2025.

→ **Feature Nexo:** clasificador de plantillas que empuja al usuario a la categoría correcta; **estimador de costo antes de enviar una campaña, en pesos**; preferencia por ventana de servicio (gratis) cuando el cliente ya escribió; dashboard de costo por mensaje/negocio ganado. Nadie en el mercado local le muestra al tendero cuánto cuesta su blast.

---

## 7. Roadmap reestructurado

**Cambio de eje:** de "módulos técnicos" a "el ciclo de vida del cliente". Cada fase debe cerrar un ciclo completo y demostrable, no entregar la mitad de tres módulos.

```
CAPTAR → CALIFICAR → CERRAR → COBRAR → RETENER
```

| Fase | Nombre | Cierra el ciclo | Criterio de salida (uno solo, medible) |
|---|---|---|---|
| **1** | Hardening (en curso) | — | Gate de aislamiento verde en CI, cobertura ≥ 70% |
| **2** | **Núcleo visible** — contactos, empresas, negocios, actividades con UI | CALIFICAR → CERRAR | Un vendedor gestiona su semana completa sin salir de Nexo |
| **3** | **Conversación** — WhatsApp bidireccional en el timeline | CAPTAR | Un lead entra por WhatsApp y queda como contacto con conversación, sin digitar |
| **4** | **Dinero** — DIAN + Wompi + cartera | COBRAR | Negocio ganado → factura DIAN → link de pago → conciliado, en un flujo |
| **5** | **Automatización con freno legal** — motor de flujos + cobranza Ley 2300 | RETENER | 5 flujos precargados corriendo con log de auditoría y ventana horaria respetada |
| **6** | **Verticalización profunda** — presets completos (plantillas + dashboards) para 9 sectores | transversal | Onboarding de cualquier sector con valor en < 10 min |
| **7** | Inteligencia — scoring, resúmenes, siguiente mejor acción | transversal | — |

**Movimiento clave frente al roadmap actual:** WhatsApp sube de Fase 4 a Fase 3, **antes** que el módulo de dinero. Razón: WhatsApp es donde ya vive el cliente (Q2). Facturar sin capturar la conversación es construir la mitad de abajo del embudo sobre un embudo vacío. Además la conversación genera el dato con el que después se cobra.

**Compliance de habeas data sube de Fase 5 a Fase 2** — es requisito legal desde el primer contacto guardado, no hardening previo al lanzamiento.

---

## 8. Métricas y anti-metas

**Métricas del producto (no de features):**

| Métrica | Meta | Por qué |
|---|---|---|
| Time to first value | < 10 min (primer negocio creado) | contra Q5 y el 60% de abandono |
| Adopción semanal por asiento | > 4 días/semana con actividad | si no lo abren, no importa qué tenga |
| % de conversaciones dentro del CRM | > 80% | contra Q2 — el indicador de si ganamos a WhatsApp personal |
| Campos custom por tenant | **< 40** (alerta a los 60) | contra property sprawl |
| Contactos sin fuente/autorización | 0% | requisito Ley 1581 |
| Mensajes bloqueados por ventana legal | reportado, no oculto | prueba de valor de Ley 2300 |

**Anti-metas (decir que no):**

- No somos software contable. Facturamos DIAN; no llevamos contabilidad ni nómina.
- No somos un builder de aplicaciones. La personalización es profunda pero opinada.
- No somos multipaís. Colombia-first es la ventaja; diluirla la mata.
- No construimos POS/retail hasta terminar B2B (ya congelado en ROADMAP).

---

## 9. Acciones inmediatas derivadas de este documento

1. Completar los 9 presets con **plantillas de mensaje y dashboard por defecto** (§5) — trabajo de datos, alto retorno.
2. Diseñar el **motor de automatización con la Ley 2300 como restricción de primera clase**, no como filtro añadido después (§6.3a).
3. Subir **habeas data (export/borrado/autorización) a Fase 2** (§7).
4. Adoptar los **límites de gobernanza del modelo de datos** como validaciones reales: umbral de campos custom, `select` por defecto sobre texto libre (§3.2).
5. Reordenar el ROADMAP: WhatsApp antes que el módulo de dinero (§7).
6. Nombrar internamente **las cuatro capas de personalización** (léxico/estructura/comportamiento/apariencia) y usarlas como taxonomía de features y de pricing (§4).

---

## 10. Fuentes

**Marco conceptual de CRM**
- Flowlu — Los pilares del CRM: https://www.flowlu.com/es/crm-guide/pillars-of-crm/
- HubSpot Academy — Anatomía de tu CRM: https://academy.hubspot.com/es/lessons/anatomy-of-your-crm
- HubSpot — Qué es un modelo de datos CRM: https://blog.hubspot.com/marketing/crm-data-model
- HubSpot — Data model builder: https://knowledge.hubspot.com/data-management/use-the-data-model-builder
- Salesforce — Funcionalidades CRM: https://www.salesforce.com/es/crm/features/
- MakeWebBetter — HubSpot CRM features and benefits: https://makewebbetter.com/blog/hubspot-crm-features-and-benefits/
- Twenty (CRM open source) — Data model: https://docs.twenty.com/user-guide/data-model/overview
- Salesforce data model (guía): https://www.syscloud.com/saas-data-protection-center/salesforce/data-model-in-salesforce/
- Arquitectura CRM empresarial (best practices): https://www.campaigncreators.com/blog/enterprise-hubspot-crm-architecture-best-practices

**Fracaso de CRM y adopción**
- Forrester — CRM pitfalls: https://www.forrester.com/blogs/dont-let-crm-pitfalls-trip-you-up
- Gerencia y Negocios — 60% de fracaso en pymes LATAM: https://gerenciaynegocios.com/por-que-el-60-de-las-implementaciones-de-crm-en-pymes-latinoamericanas-fracasan-antes-del-primer-ano/
- Cloud Solutions LATAM — Por qué fracasan los CRM: https://www.cloudsolutionslatam.com/novedades/por-que-los-crm-fracasan-en-la-implementacion
- Ropofy — Errores al elegir un CRM para pymes: https://ropofy.com/blog/gestion-comercial/errores-elegir-crm-para-pymes-argentina/

**Mercado y competencia en Colombia**
- DataCRM (competidor colombiano) — opiniones: https://www.getapp.com.co/reviews/2057151/datacrm · https://www.softwareadvice.es/reviews/245324/datacrm
- Chately — CRM + WhatsApp en Colombia: https://chately.co/blog/crm-whatsapp-colombia
- ComparaSoftware — CRM para pymes en Colombia: https://www.comparasoftware.co/software-crm-pequenas-empresas
- Capterra Colombia — directorio CRM: https://www.capterra.co/directory/2/customer-relationship-management/pricing/free/software
- Salesdorado — Opiniones HubSpot CRM: https://salesdorado.com/es/crm/herramientas-crm/opiniones-hubspot-crm/
- Alegra vs Siigo (opiniones y soporte): https://www.guiadesoftware.com/comparar/alegra-vs-siigo
- Alegra — errores frecuentes documento soporte: https://ayuda.alegra.com/col/errores-frecuentes-del-documentos-soporte-electronicos

**Marco regulatorio colombiano**
- Ley 2300 de 2023 (texto oficial): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=213990
- Ley 2300 — análisis "Dejen de Fregar": https://www.tusdatos.co/blog/ley-2300-dejen-de-fregar
- Ley 1581 de 2012 (habeas data, texto oficial): http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html
- SIC — preguntas frecuentes protección de datos: https://sic.gov.co/preguntas-frecuentes-pdp
- DIAN — Resolución 000227 de 2025 y cambios 2026: https://www.sai-open.com/nueva/facturacion-electronica-colombia-2026-resolucion-000227/ · https://klyoo.net/noticias/dian-factura-electronica-2026-transmision-mismo-dia-dee-pos-radian
- DIAN — instructivo RADIAN: https://www.dian.gov.co/impuestos/factura-electronica/Documents/Instructivo-RADIAN.pdf

**Economía de WhatsApp**
- Meta — Pricing WhatsApp Business Platform: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Tarifas por país (Colombia): https://www.plivo.com/whatsapp/pricing/co/ · https://formbeep.com/whatsapp-api-pricing/
