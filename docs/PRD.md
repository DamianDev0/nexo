# NexoCRM — Product Requirements Document (PRD)

**BMad Enterprise Track | Agente: PM John**

> Versión: 1.0  
> Fecha: Marzo 2026  
> Estado: Draft — pendiente revisión de stakeholders  
> Basado en: nexo-crm-requirements.md v1.0  

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Declaración del Problema](#2-declaración-del-problema)
3. [Visión del Producto](#3-visión-del-producto)
4. [Usuarios Objetivo y Personas](#4-usuarios-objetivo-y-personas)
5. [Requisitos Funcionales por Módulo](#5-requisitos-funcionales-por-módulo)
6. [Requisitos No Funcionales](#6-requisitos-no-funcionales)
7. [Restricciones Regulatorias y Compliance](#7-restricciones-regulatorias-y-compliance)
8. [Definición de MVP](#8-definición-de-mvp)
9. [Épicas de Alto Nivel](#9-épicas-de-alto-nivel)
10. [Métricas de Éxito](#10-métricas-de-éxito)
11. [Pricing y Planes](#11-pricing-y-planes)
12. [Fuera de Alcance](#12-fuera-de-alcance)
13. [Supuestos y Dependencias](#13-supuestos-y-dependencias)
14. [Riesgos Identificados](#14-riesgos-identificados)
15. [Glosario](#15-glosario)

---

## 1. Resumen Ejecutivo

NexoCRM es una plataforma SaaS de gestión de relaciones con clientes (CRM) multitenant diseñada exclusivamente para el ecosistema empresarial colombiano. A diferencia de los CRMs internacionales (HubSpot, Salesforce, Zoho) que no contemplan la realidad operativa de Colombia, y del software contable local (Alegra, Siigo) que no gestiona relaciones con clientes, NexoCRM ocupa el espacio intermedio: un CRM de clase mundial con integraciones 100% colombianas.

**Diferenciadores únicos:**

- Facturación electrónica DIAN obligatoria integrada nativamente (XML UBL 2.1, CUFE, Resolución 000202/2025)
- Pagos colombianos completos vía Wompi: Nequi, PSE, Daviplata, Bancolombia, Apple Pay
- WhatsApp Business como canal nativo de ventas y cobros (canal #1 en Colombia)
- Motor de automatización con IA para cobro de cartera, lead nurturing y gestión comercial
- Multitenancy real con aislamiento de datos (schema-per-tenant en PostgreSQL)
- Diseñado para pymes colombianas: interfaz en español colombiano, precios en COP

**Track BMad:** Enterprise (compliance regulatorio, multitenant, 30+ stories, pagos con responsabilidad financiera)

---

## 2. Declaración del Problema

### 2.1 El problema central

Las pequeñas y medianas empresas colombianas (pymes) enfrentan tres problemas simultáneos que ninguna herramienta actual resuelve de forma integrada:

**Problema 1: Facturación electrónica DIAN como obstáculo operativo**
Desde 2023, la facturación electrónica es obligatoria para la mayoría de contribuyentes en Colombia. Las pymes usan herramientas contables separadas (Alegra, Siigo) que no están conectadas con su gestión de clientes, lo que genera doble digitación, errores y facturas no cobradas.

**Problema 2: Cartera vencida sin sistema de cobro automatizado**
El 67% de las pymes colombianas reporta problemas de cartera vencida (Confecámaras 2024). El cobro se hace manualmente por WhatsApp personal, sin trazabilidad, sin recordatorios automáticos y sin integración con el historial del cliente.

**Problema 3: WhatsApp como canal comercial sin CRM**
WhatsApp es el canal #1 de comunicación comercial en Colombia, pero se usa desde celulares personales sin ningún sistema que capture los leads, registre las conversaciones o automatice el seguimiento.

### 2.2 Soluciones actuales y sus limitaciones

| Herramienta | Qué hace bien | Qué no resuelve |
|-------------|--------------|-----------------|
| HubSpot | CRM completo, pipeline visual | Sin DIAN, sin Nequi/PSE, sin WhatsApp nativo, precios en USD (inaccesible para pymes) |
| Salesforce | CRM enterprise | Sin integraciones CO, complejísimo para pymes, caro |
| Alegra / Siigo | Facturación DIAN, contabilidad | No es CRM — no gestiona pipeline, leads ni automatización |
| WhatsApp Business App | Canal de comunicación | Sin CRM, sin automatización, sin cobros, sin analytics |
| Excel / Google Sheets | Flexible, gratis | Sin automatización, sin tiempo real, sin integración DIAN/pagos |

### 2.3 La oportunidad

Hay aproximadamente 2.5 millones de pymes en Colombia (DANE 2024). El mercado de software de gestión para pymes crece al 18% anual en LATAM. Ninguna herramienta actual integra las tres necesidades críticas: CRM + DIAN + pagos colombianos. Esta es la oportunidad de NexoCRM.

---

## 3. Visión del Producto

### 3.1 Declaración de visión

> "NexoCRM es el sistema operativo comercial de la pyme colombiana: gestiona clientes, factura electrónicamente, cobra por WhatsApp y automatiza el seguimiento — todo en una sola plataforma diseñada para Colombia."

### 3.2 Principios de diseño del producto

1. **Colombia-first, no Colombia-after:** cada feature se diseña pensando en la realidad colombiana, no adaptada de un producto global.
2. **Simple para el usuario, poderoso por dentro:** la pyme no lee manuales. El producto debe ser usable sin capacitación.
3. **Automatización que cuida el dinero:** el dinero en cartera es el dolor más grande. Los workflows de cobro son el feature más crítico.
4. **WhatsApp como primer ciudadano:** no es una integración — es un canal core de la plataforma.
5. **Personalizable dentro de estándares:** campos custom, pipelines configurables, workflows flexibles — pero sin convertirse en un constructor de software.

### 3.3 Posicionamiento

```
                    GESTIÓN DE CLIENTES
                           ↑
              NexoCRM ← aquí está el gap
                    ↙           ↘
         HubSpot/Salesforce    Alegra/Siigo
         (CRM sin CO)          (CO sin CRM)
                           ↓
                    CONTABILIDAD / FACTURACIÓN
```

---

## 4. Usuarios Objetivo y Personas

### 4.1 Segmento primario: pymes colombianas B2B y B2C

**Criterios de segmentación:**
- Tamaño: micro (1-10 empleados), pequeña (11-50 empleados)
- Ubicación: principales ciudades colombianas (Medellín, Bogotá, Cali, Barranquilla)
- Facturación: entre $50M y $5.000M COP anuales
- Obligados a facturación electrónica DIAN
- Usan WhatsApp como canal comercial principal
- No tienen departamento de TI dedicado

**Sectores prioritarios:**
- Distribuidoras y mayoristas
- Consultoría y servicios profesionales
- Salud (clínicas estéticas, consultorios, laboratorios)
- Construcción y remodelaciones
- Agencias de marketing y publicidad
- Transporte y logística
- Comercio minorista con ventas B2B

### 4.2 Personas de usuario

---

**Persona 1: Carolina — La Dueña del Negocio**

- **Rol:** Propietaria de distribuidora de productos de belleza en Medellín
- **Edad:** 38 años
- **Equipo:** 5 vendedores, 1 contadora externa
- **Problemas actuales:**
  - Maneja 200+ clientes en Excel y WhatsApp personal
  - La contadora le envía las facturas 3 días después de la venta
  - Tiene $80M en cartera vencida que persigue manualmente por WhatsApp
  - No sabe cuáles clientes están activos o inactivos
- **Lo que necesita de NexoCRM:**
  - Ver en tiempo real cuánto le deben y quién
  - Que el sistema le mande los recordatorios de cobro automáticamente
  - Facturar desde el celular en el momento de la venta
  - Saber cuáles vendedores están generando resultados
- **Frustración con herramientas actuales:** "El HubSpot está en inglés y no hace facturas DIAN. El Alegra hace facturas pero no me dice quién no me ha pagado."
- **Canal de comunicación preferido:** WhatsApp, reuniones presenciales
- **Decisión de compra:** ella sola, busca referencias, prueba gratis antes de pagar

---

**Persona 2: Andrés — El Vendedor**

- **Rol:** Sales Rep en empresa de consultoría de RRHH en Bogotá
- **Edad:** 27 años
- **Dispositivo principal:** celular Android
- **Problemas actuales:**
  - Registra los contactos en una libreta y en WhatsApp
  - Olvida hacer seguimiento a los leads
  - No sabe cuándo fue la última vez que habló con un cliente
  - El jefe le pide reportes que tarda horas en armar en Excel
- **Lo que necesita de NexoCRM:**
  - Agregar contactos rápido desde el celular
  - Ver el pipeline de sus deals de un vistazo
  - Que el sistema le recuerde a quién debe llamar hoy
  - Enviar una cotización profesional por WhatsApp en minutos
- **Frustración:** "No me voy a poner a llenar 20 campos para agregar un contacto."
- **Adopción:** solo usará la herramienta si es más rápida que lo que hace hoy

---

**Persona 3: Luis Felipe — El Contador / Administrador**

- **Rol:** Contador y administrador en empresa de transporte en Cali
- **Edad:** 45 años
- **Problemas actuales:**
  - Genera las facturas electrónicas en Alegra por separado del CRM
  - Reconcilia manualmente los pagos recibidos con las facturas emitidas
  - No tiene visibilidad de qué está vendiendo comercial vs. lo que él factura
- **Lo que necesita de NexoCRM:**
  - Que cuando comercial cierra un deal, la factura DIAN se genere automáticamente
  - Dashboard claro de cartera: pagado, pendiente, vencido por cliente
  - Exportar información para la declaración de renta
  - Que los pagos de Wompi se reconcilien solos con las facturas
- **Preocupación principal:** "¿La factura que genera el sistema cumple con todos los requisitos de la DIAN?"

---

**Persona 4: Valentina — La Emprendedora Digital**

- **Rol:** Dueña de agencia de marketing digital en Barranquilla, 2 empleados
- **Edad:** 31 años
- **Perfil técnico:** alta — usa herramientas digitales con facilidad
- **Problemas actuales:**
  - Usa HubSpot free (sin integraciones CO) + Siigo (facturación) + WhatsApp Business
  - Paga 3 suscripciones separadas que no se hablan entre sí
  - Pierde leads que llegan por Instagram o WhatsApp fuera de horario
- **Lo que necesita de NexoCRM:**
  - Una sola herramienta que reemplace las 3
  - Bot de WhatsApp que responda consultas fuera de horario
  - Captura de leads desde formulario en su web y desde Instagram
  - Workflows de onboarding automáticos cuando cierra un cliente nuevo
- **Diferenciador para ella:** el bot de IA en WhatsApp y los workflows de automatización

---

### 4.3 Usuarios secundarios

- **Inversionistas / Socios:** necesitan ver métricas de negocio, no operatividad
- **Asistentes administrativos:** ejecutan procesos definidos por el dueño
- **Clientes finales del tenant:** reciben facturas, links de pago, mensajes de WhatsApp — no usan la plataforma directamente pero son afectados por ella

---

## 5. Requisitos Funcionales por Módulo

### RF-01: Autenticación y Gestión de Usuarios

**Prioridad: P0 — Fundación del sistema**

#### RF-01.1 Gestión de tenants y registro

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-01.1.1 | Registro de nueva cuenta (tenant) con wizard de onboarding de 4 pasos | P0 | El usuario completa el registro y tiene acceso al dashboard en menos de 5 minutos |
| RF-01.1.2 | Resolución de tenant por subdominio: `miempresa.nexocrm.co` | P0 | El sistema identifica el tenant correcto en cada request y aísla sus datos |
| RF-01.1.3 | Onboarding wizard: tipo de negocio → equipo → primer contacto → primera acción | P0 | Al finalizar el wizard, el tenant tiene al menos 1 contacto en el sistema |
| RF-01.1.4 | Selección de plan durante el registro (Free por defecto) | P0 | El tenant queda en plan Free con límites aplicados correctamente |

#### RF-01.2 Autenticación

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-01.2.1 | Login con email/password usando bcrypt + JWT con refresh tokens | P0 | El token expira en 1h, el refresh token en 30 días |
| RF-01.2.2 | Login social con Google OAuth 2.0 | P0 | El usuario puede autenticarse con su cuenta Google sin crear password |
| RF-01.2.3 | MFA opcional con TOTP (Google Authenticator compatible) | P1 | El usuario puede activar/desactivar MFA desde configuración |
| RF-01.2.4 | Password reset con token temporal (expira en 30 minutos) | P0 | El usuario recibe email con link de reset que funciona una sola vez |
| RF-01.2.5 | Rate limiting: máximo 10 intentos de login fallidos por IP en 15 minutos | P0 | Los intentos excedidos resultan en bloqueo temporal con mensaje claro |
| RF-01.2.6 | Sesiones concurrentes con device tracking (dispositivo, IP, navegador) | P1 | El usuario puede ver y cerrar sesiones activas desde otros dispositivos |

#### RF-01.3 Roles y permisos

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-01.3.1 | Roles predefinidos: Owner, Admin, Manager, Sales Rep, Viewer | P0 | Cada rol tiene acceso diferenciado a módulos y acciones |
| RF-01.3.2 | Permisos granulares por recurso: contacts, deals, invoices, reports, settings | P0 | Un Sales Rep no puede eliminar contactos de otro vendedor; un Viewer no puede crear nada |
| RF-01.3.3 | Invitación de miembros del equipo por email | P0 | El Owner puede invitar usuarios que reciben un email con link de activación |
| RF-01.3.4 | El Owner puede cambiar roles y desactivar usuarios | P0 | Un usuario desactivado no puede iniciar sesión pero sus datos persisten |

**Límites por plan:**
- Free: 1 usuario
- Starter: 3 usuarios
- Pro: 10 usuarios
- Business: ilimitados

---

### RF-02: CRM — Contactos y Empresas

**Prioridad: P0 — Core del sistema**

#### RF-02.1 Contactos

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-02.1.1 | CRUD completo de contactos con campos estándar | P0 | Crear, ver, editar y archivar contactos sin restricciones técnicas |
| RF-02.1.2 | Campos específicos Colombia: tipo de documento (CC, NIT, CE, PP, TI), número de documento, ciudad/departamento (lista completa de municipios), régimen tributario | P0 | La validación del NIT incluye dígito de verificación automático |
| RF-02.1.3 | Campos custom ilimitados con tipos: texto, número, fecha, booleano, lista, archivo | P1 | El tenant puede crear campos custom desde configuración sin código |
| RF-02.1.4 | Búsqueda full-text en español: nombre, email, teléfono, empresa, tags, campos custom | P0 | Resultados en menos de 300ms con hasta 10.000 contactos |
| RF-02.1.5 | Segmentación por etiquetas (tags) múltiples | P0 | El usuario puede filtrar por una o varias etiquetas combinadas con AND/OR |
| RF-02.1.6 | Deduplicación inteligente por email, teléfono o número de documento al crear | P0 | El sistema sugiere contacto duplicado existente antes de crear uno nuevo |
| RF-02.1.7 | Importación masiva desde CSV/Excel con mapeo de columnas | P1 | Importar 1.000 contactos en menos de 60 segundos con reporte de errores |
| RF-02.1.8 | Timeline de interacciones completo: actividades, emails, WhatsApp, facturas, pagos | P0 | El timeline muestra todos los eventos del contacto en orden cronológico inverso |
| RF-02.1.9 | Estados del contacto: Nuevo, Contactado, Calificado, Cliente, Inactivo, Perdido | P0 | El estado se puede cambiar manualmente o por workflow |
| RF-02.1.10 | Vistas: lista, tabla con columnas configurables, kanban por estado | P1 | El usuario puede cambiar entre vistas y guardar la configuración preferida |

#### RF-02.2 Empresas

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-02.2.1 | CRUD de empresas con NIT + dígito de verificación (validación automática por módulo 11) | P0 | El sistema valida el NIT y muestra error si el dígito de verificación no coincide |
| RF-02.2.2 | Clasificación por tamaño: microempresa, pequeña, mediana, grande (según Ley 590/2000) | P0 | La clasificación es seleccionable desde lista predefinida |
| RF-02.2.3 | Sector CIIU colombiano (lista completa de códigos CIIU Rev. 4 A.C.) | P1 | El usuario puede buscar por nombre o código CIIU |
| RF-02.2.4 | Régimen tributario: Responsable de IVA, No responsable, Gran contribuyente, Régimen simple | P0 | El régimen afecta las retenciones calculadas automáticamente en facturas |
| RF-02.2.5 | Relación 1:N empresa → contactos (múltiples contactos por empresa) | P0 | Desde la empresa se ven todos sus contactos asociados |
| RF-02.2.6 | Información consolidada de empresa: total ventas, deuda vigente, último contacto | P0 | Los totales se calculan en tiempo real desde facturas y pagos |

---

### RF-03: Pipeline de Ventas (Deals)

**Prioridad: P0 — Diferenciador principal**

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-03.1 | Pipeline kanban visual con drag & drop entre stages | P0 | El usuario arrastra deals entre columnas y el cambio se guarda inmediatamente |
| RF-03.2 | Múltiples pipelines por tenant (ventas nuevas, renovaciones, upsell) | P1 | El tenant puede crear hasta 10 pipelines con stages independientes |
| RF-03.3 | Stages configurables: nombre, color, probabilidad de cierre (0-100%), orden | P0 | El tenant puede agregar, renombrar, reordenar y eliminar stages |
| RF-03.4 | Deal con: título, contacto, empresa, valor en COP, fecha estimada de cierre, vendedor asignado | P0 | Todos los campos son opcionales excepto el título |
| RF-03.5 | Valor estimado siempre en COP (centavos enteros — sin decimales flotantes) | P0 | Los cálculos de forecast usan aritmética de enteros para evitar errores de punto flotante |
| RF-03.6 | Conversión de deal a factura DIAN con un click | P0 | Los items del deal se pre-cargan en la factura; el usuario solo confirma y envía |
| RF-03.7 | Motivo de pérdida requerido al cerrar deal como "perdido" | P0 | El sistema no permite cerrar como perdido sin seleccionar o escribir el motivo |
| RF-03.8 | Vista forecast: valor ponderado por probabilidad, agrupado por mes/trimestre | P1 | El forecast muestra pipeline × probabilidad para los próximos 3 meses |
| RF-03.9 | Métricas por stage: cantidad de deals, valor total, tiempo promedio en stage, conversion rate | P1 | Las métricas se actualizan en tiempo real |
| RF-03.10 | Productos/servicios asociados al deal (de catálogo o texto libre) | P0 | Los items del deal son la base para generar la factura |

---

### RF-04: Actividades y Calendario

**Prioridad: P0**

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-04.1 | Tipos de actividad: llamada, reunión, email, tarea, nota, WhatsApp | P0 | Cada tipo tiene campos relevantes (duración para llamada, lugar para reunión) |
| RF-04.2 | Asociación polimórfica: actividad puede ligarse a contacto, empresa o deal | P0 | Una actividad aparece en el timeline de todos los registros asociados |
| RF-04.3 | Recordatorios configurables: X minutos/horas/días antes con notificación in-app, email o WhatsApp | P0 | El recordatorio llega al canal elegido en el tiempo configurado |
| RF-04.4 | Registro automático de actividad al enviar un WhatsApp desde el CRM | P0 | No requiere acción del usuario — se registra solo |
| RF-04.5 | Vista de calendario: diaria, semanal, mensual | P1 | Muestra todas las actividades con fecha de vencimiento del usuario logueado |
| RF-04.6 | Filtros de actividades: por tipo, por assignee, por entidad asociada, por estado (pendiente/completada) | P1 | Los filtros son combinables con AND |

---

### RF-05: Facturación Electrónica DIAN

**Prioridad: P0 — Obligatorio por ley colombiana**

#### RF-05.1 Cumplimiento normativo

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-05.1.1 | Cumplir con Resolución 000202 de 2025 (DIAN) | P0 — legal | Todas las facturas deben pasar la validación previa de la DIAN antes de entregarse al cliente |
| RF-05.1.2 | Generación de CUFE (Código Único de Factura Electrónica) con SHA-384 | P0 — legal | El CUFE debe ser único, verificable y almacenado permanentemente |
| RF-05.1.3 | Código QR en representación gráfica (PDF) | P0 — legal | El QR apunta al validador público de la DIAN |
| RF-05.1.4 | Numeración autorizada por resolución DIAN (prefijo + consecutivo dentro del rango) | P0 — legal | El sistema valida que el consecutivo esté dentro del rango de la resolución activa |
| RF-05.1.5 | Soporte a retenciones: renta, IVA, ICA (por municipio) | P0 — legal | Las retenciones se calculan automáticamente según el régimen del cliente |

#### RF-05.2 Tipos de documentos

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-05.2.1 | Factura electrónica de venta | P0 |
| RF-05.2.2 | Nota crédito electrónica (anulación total o parcial, corrección de datos) | P0 |
| RF-05.2.3 | Nota débito electrónica (ajuste de valor hacia arriba) | P1 |
| RF-05.2.4 | Documento soporte (compras a no obligados a facturar electrónicamente) | P2 |

#### RF-05.3 Flujo de facturación

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-05.3.1 | Integración con MATIAS API (proveedor tecnológico habilitado DIAN) para MVP | P0 | El sistema envía JSON → recibe CUFE + PDF en menos de 30 segundos |
| RF-05.3.2 | Manejo de estados: Borrador → Pendiente DIAN → Aprobada → Pagada / Rechazada → Anulada | P0 | Las transiciones de estado son consistentes y auditables |
| RF-05.3.3 | Envío automático al cliente por email cuando la DIAN aprueba | P0 | El cliente recibe el PDF dentro de los 5 minutos de aprobación DIAN |
| RF-05.3.4 | Envío por WhatsApp del link de pago + PDF de factura | P0 | Con un click el vendedor envía la factura + link de pago al WhatsApp del cliente |
| RF-05.3.5 | Manejo de errores DIAN con mensaje descriptivo al usuario | P0 | El usuario ve exactamente qué dato está incorrecto, no un código de error técnico |

#### RF-05.4 Tributación colombiana

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-05.4.1 | IVA: 19% (estándar), 5% (medicina, etc.), 0% (exentos) por línea de item | P0 | La tarifa de IVA es configurable por producto/servicio en el catálogo |
| RF-05.4.2 | Impuesto al consumo: 8% para servicios de restaurante, 4% para otros | P1 | Aplicable solo cuando el tipo de impuesto del producto lo requiere |
| RF-05.4.3 | ICA: variable por municipio (Bogotá, Medellín, Cali, etc.) | P1 | Configurable por municipio en la configuración del tenant |
| RF-05.4.4 | Retención en la fuente: aplicable según el monto y el concepto | P0 | El sistema calcula la retención automáticamente según las tablas vigentes |
| RF-05.4.5 | Descuentos comerciales por línea y descuento global sobre subtotal | P0 | Los descuentos se reflejan correctamente en la base gravable |

---

### RF-06: Pagos — Ecosistema Colombiano Completo

**Prioridad: P0**

#### RF-06.1 Métodos de pago via Wompi

| ID | Método | Prioridad | Criterio de aceptación |
|----|--------|-----------|------------------------|
| RF-06.1.1 | Tarjeta crédito/débito (Visa, Mastercard, Amex) | P0 | Tokenización para cobro recurrente sin volver a ingresar datos |
| RF-06.1.2 | PSE — transferencia bancaria desde todos los bancos colombianos | P0 | El cliente selecciona su banco y es redirigido al portal bancario |
| RF-06.1.3 | Nequi — push notification al celular del cliente | P0 | El cobro llega al celular del cliente sin que tenga que abrir una URL |
| RF-06.1.4 | Daviplata — push notification similar a Nequi | P0 | Mismo flujo que Nequi pero para usuarios Davivienda |
| RF-06.1.5 | Bancolombia Transfer — botón de transferencia Bancolombia | P1 | Redirect al portal Bancolombia para confirmar el pago |
| RF-06.1.6 | Corresponsal bancario Bancolombia — pago en efectivo en puntos físicos | P1 | El sistema genera referencia de pago para presentar en el corresponsal |
| RF-06.1.7 | Apple Pay — vía Web Payment Request API | P2 | Disponible en Safari/iOS en Colombia con tarjetas de bancos locales |

#### RF-06.2 Funcionalidades de gestión de pagos

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-06.2.1 | Generación de link de pago por factura | P0 | El link se genera en menos de 2 segundos y expira en 72 horas (configurable) |
| RF-06.2.2 | Envío de link de pago por WhatsApp y email con un click | P0 | El mensaje incluye el monto, nombre del cliente y link con botón de pago |
| RF-06.2.3 | Dashboard de cartera: pagado, pendiente, vencido — filtrable por período y cliente | P0 | El dashboard refleja el estado real en tiempo real con WebSocket |
| RF-06.2.4 | Conciliación automática: cuando Wompi confirma pago, la factura se marca como pagada | P0 | La conciliación ocurre en menos de 5 minutos de recibido el webhook de Wompi |
| RF-06.2.5 | Webhook handler para eventos Wompi: APPROVED, DECLINED, VOIDED, REFUNDED | P0 | Idempotencia garantizada — procesar el mismo webhook dos veces no duplica registros |
| RF-06.2.6 | Historial de pagos por contacto y por factura | P0 | El historial incluye método, fecha, referencia del proveedor y estado |
| RF-06.2.7 | Registro manual de pago en efectivo o transferencia no automatizada | P0 | El usuario puede marcar una factura como pagada manualmente con nota y referencia |

---

### RF-07: WhatsApp Business Integration

**Prioridad: P0 — Diferenciador clave para el mercado colombiano**

#### RF-07.1 Mensajería bidireccional

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-07.1.1 | Recepción de mensajes inbound en la bandeja del CRM | P0 | El mensaje entrante aparece en el CRM en menos de 5 segundos |
| RF-07.1.2 | Envío de mensajes de texto, imágenes, documentos y templates | P0 | El usuario puede adjuntar PDFs de facturas directamente desde el CRM |
| RF-07.1.3 | Templates de mensajes pre-aprobados por Meta: cobros, recordatorios, facturas, bienvenida | P0 | Los templates son editables por el tenant (sujeto a aprobación de Meta) |
| RF-07.1.4 | Historial completo de conversación asociado al contacto en el timeline | P0 | El vendedor ve toda la conversación histórica en el perfil del contacto |
| RF-07.1.5 | Asignación de conversaciones a agentes (incluyendo reasignación) | P0 | Una conversación solo puede tener un agente asignado a la vez |
| RF-07.1.6 | Auto-respuesta fuera de horario laboral (configurable por tenant) | P1 | El tenant configura horario de atención y mensaje de auto-respuesta |
| RF-07.1.7 | Mensajes con botones interactivos y listas para guiar al cliente | P1 | El cliente puede seleccionar opciones sin escribir texto libre |

#### RF-07.2 Bot de IA en WhatsApp (Plan Pro+)

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-07.2.1 | El bot responde preguntas sobre productos/precios usando el catálogo del tenant | P1 | Las respuestas son precisas basadas en el catálogo, no halladas por internet |
| RF-07.2.2 | Clasificación automática de intención del mensaje: consulta, queja, pedido, soporte | P1 | La clasificación alimenta el lead score del contacto |
| RF-07.2.3 | Calificación de leads inbound por WhatsApp | P1 | Si el mensaje indica intención de compra, el lead score sube y se notifica al vendedor |
| RF-07.2.4 | Creación automática de contacto si el remitente no existe en el CRM | P0 | El número de WhatsApp se asocia al contacto existente o crea uno nuevo |
| RF-07.2.5 | Escalamiento al agente humano cuando el bot no puede resolver | P1 | El bot dice "te conecto con un asesor" y la conversación pasa al agente |

#### RF-07.3 Modelo de número compartido vs. dedicado

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-07.3.1 | Plan Starter: número compartido NexoCRM (para notificaciones transaccionales) | P0 |
| RF-07.3.2 | Plan Pro+: número dedicado del negocio conectado vía OAuth con 360dialog | P1 |
| RF-07.3.3 | Soporte para múltiples WABAs en el mismo webhook endpoint (routing por phone_number_id) | P0 |

---

### RF-08: Motor de Automatización (Automation Engine)

**Prioridad: P1 — Feature estrella post-MVP**

#### RF-08.1 Workflow builder

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-08.1.1 | Interfaz visual de construcción de workflows: drag & drop de nodos | P1 | El usuario puede crear un workflow sin conocimientos técnicos |
| RF-08.1.2 | Nodo Trigger: entidad creada/actualizada, campo cambia de valor, cron programado, webhook recibido, pago recibido/fallido, factura vencida, inactividad | P1 | Solo un trigger por workflow |
| RF-08.1.3 | Nodo Condición: comparadores ==, !=, >, <, contains, in, is_empty; AND/OR lógico | P1 | Las condiciones evalúan campos estándar y custom del tenant |
| RF-08.1.4 | Nodo Acción: enviar WhatsApp (template/libre), enviar email, crear/actualizar registro, asignar usuario, cambiar stage, esperar X días, llamar webhook, ejecutar IA, notificación in-app | P1 | Las acciones son configurables con variables dinámicas del registro que disparó el trigger |
| RF-08.1.5 | Nodo Bifurcación (if/else) | P1 | El flujo se divide según la evaluación de la condición |
| RF-08.1.6 | Historial de ejecuciones por workflow con log de cada nodo | P1 | El usuario puede ver qué pasó en cada ejecución para depurar |
| RF-08.1.7 | Pausa y reactivación de workflows sin perder el estado de ejecuciones en curso | P1 | Desactivar un workflow no cancela las ejecuciones que ya están en progreso |

#### RF-08.2 Workflows pre-armados (templates)

Los siguientes 5 workflows vienen pre-instalados en cada tenant nuevo:

| ID | Nombre | Trigger | Descripción |
|----|--------|---------|-------------|
| WF-01 | Lead nurturing | Contacto creado con status "nuevo" | WhatsApp de bienvenida → esperar 3 días → si sin respuesta → segundo mensaje → esperar 4 días → sin respuesta → notificar vendedor |
| WF-02 | Cobro de cartera | Factura vencida (due_date + 1 día) | Recordatorio amable día 1 → recordatorio firme día 7 → recordatorio urgente día 15 → notificar al Owner |
| WF-03 | Post-venta | Deal cambia a stage "ganado" | Crear factura DIAN → enviar por WhatsApp → esperar 7 días → pedir reseña/referido |
| WF-04 | Reactivación de inactivos | Contacto sin interacción en 60 días | WhatsApp con oferta especial personalizada |
| WF-05 | Onboarding de cliente nuevo | Contacto cambia a status "cliente" | Secuencia de 3 mensajes de bienvenida en 7 días |

---

### RF-09: Módulo de IA

**Prioridad: P1 (algunas features P2)**

| ID | Feature | Descripción | Prioridad |
|----|---------|-------------|-----------|
| RF-09.1 | Lead scoring automático | Score 0-100 basado en actividad, fuente, interacciones, tiempo de respuesta | P1 |
| RF-09.2 | Chat asistente con RAG | "¿Cuánto vendí esta semana?", "¿Quiénes son mis clientes más rentables?" — responde con datos reales del tenant | P1 |
| RF-09.3 | Resumen de contacto antes de llamada | Genera un resumen de 5 puntos del historial del contacto en 2 segundos | P1 |
| RF-09.4 | Clasificación de mensajes WhatsApp | Detecta intención: consulta, queja, pedido, soporte — con confianza > 0.85 | P1 |
| RF-09.5 | Generación de cotizaciones desde conversación | IA genera borrador de cotización basado en el chat de WhatsApp | P2 |
| RF-09.6 | Predicción de cierre de deal | Probabilidad de cierre basada en patrones históricos del tenant | P2 |
| RF-09.7 | Copywriting de mensajes | Genera borradores personalizados de WhatsApp/email en el estilo del tenant | P2 |
| RF-09.8 | Forecasting de ventas | Predicción de ventas del próximo mes/trimestre basada en pipeline + historial | P2 |

---

### RF-10: Inventario y Catálogo de Productos

**Prioridad: P1**

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-10.1 | Catálogo de productos y servicios con SKU, precio, costo, IVA, unidad de medida | P1 | Los productos del catálogo se pueden agregar a deals y facturas |
| RF-10.2 | Control de stock: entradas, salidas, ajustes, devoluciones | P1 | El stock se actualiza automáticamente al emitir una factura aprobada por la DIAN |
| RF-10.3 | Alerta de stock mínimo configurable por producto | P1 | El Owner/Admin recibe notificación cuando el stock baja del umbral |
| RF-10.4 | Historial de movimientos de inventario auditable | P1 | Cada movimiento tiene usuario, fecha, motivo y referencia |
| RF-10.5 | Variantes de productos (talla, color, etc.) | P2 | Una variante tiene su propio SKU, precio y stock |

---

### RF-11: Notificaciones

**Prioridad: P0**

| ID | Requisito | Prioridad | Criterio de aceptación |
|----|-----------|-----------|------------------------|
| RF-11.1 | Notificaciones in-app en tiempo real vía WebSocket con badge de contador | P0 | El badge se actualiza sin recargar la página |
| RF-11.2 | Notificaciones por email transaccional (Resend o AWS SES) | P0 | El email llega en menos de 2 minutos |
| RF-11.3 | Notificaciones por WhatsApp para alertas del equipo (plan Pro+) | P1 | Solo para notificaciones críticas — no spam |
| RF-11.4 | Preferencias de notificación configurables por usuario y canal | P1 | El usuario puede desactivar tipos específicos por canal |
| RF-11.5 | Horario de no molestar configurable con timezone America/Bogota | P1 | Las notificaciones en horario de silencio se acumulan y se entregan al retomar |
| RF-11.6 | Tipos de notificación: lead asignado, deal cambió stage, pago recibido, factura aprobada/rechazada, recordatorio de actividad, workflow fallido, cartera vencida | P0 | Cada tipo tiene configuración independiente de canal |

---

### RF-12: Integraciones Externas

| ID | Integración | API/Método | Prioridad | Propósito |
|----|-------------|-----------|-----------|-----------|
| RF-12.1 | DIAN vía MATIAS API | REST/JSON → XML UBL 2.1 | P0 | Facturación electrónica |
| RF-12.2 | Wompi | REST API v1 + Webhooks | P0 | Pagos colombianos |
| RF-12.3 | WhatsApp Business Cloud API | Meta Graph API + Webhooks | P0 | Comunicación comercial |
| RF-12.4 | 360dialog (BSP) | REST API + OAuth | P0 | Intermediario WhatsApp |
| RF-12.5 | Google OAuth 2.0 | OpenID Connect | P0 | Login social |
| RF-12.6 | Resend / AWS SES | REST API | P1 | Email transaccional |
| RF-12.7 | Claude API / OpenAI API | REST API | P1 | Motor de IA |
| RF-12.8 | Apple Pay | Web Payment Request API | P2 | Pago desde iPhone |
| RF-12.9 | Meta Ads / Instagram | Graph API + Webhooks | P2 | Captura de leads |
| RF-12.10 | Google Calendar | REST API | P2 | Sincronización de actividades |
| RF-12.11 | Zapier (webhooks outgoing) | HTTP Webhooks | P2 | Integraciones custom |

#### RF-12.13 API pública y webhooks outgoing del tenant

```
Eventos disponibles vía webhook:
- contact.created / contact.updated / contact.deleted
- deal.created / deal.stage_changed / deal.won / deal.lost
- invoice.created / invoice.approved_dian / invoice.paid / invoice.rejected_dian
- payment.received / payment.failed / payment.refunded
- lead.scored / lead.qualified
- whatsapp.message_received / whatsapp.message_sent
```

---

## 6. Requisitos No Funcionales

### RNF-01: Disponibilidad y Confiabilidad

| Requisito | Target | Justificación |
|-----------|--------|---------------|
| Uptime | 99.9% (< 8.7 horas de downtime/año) | La facturación DIAN es crítica para operación del negocio |
| RTO (Recovery Time Objective) | < 4 horas | Tiempo máximo aceptable de restauración ante falla |
| RPO (Recovery Point Objective) | < 1 hora | Máxima pérdida de datos aceptable |
| Webhook DIAN processing | 99.95% éxito | Los webhooks de DIAN no tienen reenvío automático |

### RNF-02: Rendimiento

| Requisito | Target |
|-----------|--------|
| Latencia API estándar (p95) | < 200ms |
| Latencia API con IA | < 2.000ms |
| Tiempo de carga dashboard inicial | < 1.5s (First Contentful Paint) |
| Búsqueda full-text (10.000 contactos) | < 300ms |
| Concurrencia por tenant | Hasta 50 usuarios simultáneos |
| Throughput plataforma | 1.000 tenants con 10 usuarios c/u simultáneos |

### RNF-03: Seguridad

| Requisito | Especificación |
|-----------|---------------|
| Transporte | HTTPS/TLS 1.3 en todos los endpoints |
| Encriptación en reposo | AES-256 para datos sensibles (tokens, credenciales) |
| Autenticación | JWT con rotación de refresh tokens |
| Aislamiento de datos | Schema-per-tenant: un tenant nunca puede acceder a datos de otro |
| Protección contra OWASP Top 10 | XSS, CSRF, SQL Injection, IDOR — todos mitigados en code review |
| Rate limiting | Por tenant y por endpoint según el plan |
| Auditoría | Log inmutable de todas las acciones sobre datos sensibles (facturas, pagos) |

### RNF-04: Compliance Colombiano

| Regulación | Requisito |
|-----------|-----------|
| Ley 1581 de 2012 (Habeas Data) | Consentimiento de tratamiento de datos, política de privacidad, derecho a eliminación |
| Decreto 1377 de 2013 | Registro de bases de datos en el Registro Nacional |
| Resolución 000202/2025 DIAN | Formato UBL 2.1, CUFE SHA-384, validación previa, numeración autorizada |
| Circular 042 SFC (si aplica) | Estándares de seguridad para manejo de información financiera |

### RNF-05: Escalabilidad

| Dimensión | Objetivo MVP | Objetivo Año 1 |
|-----------|--------------|----------------|
| Tenants | 50 | 500 |
| Contactos por tenant | 10.000 | 100.000 |
| Facturas mensuales por tenant | 500 | 5.000 |
| Mensajes WhatsApp/día (plataforma total) | 10.000 | 500.000 |

### RNF-06: Observabilidad

- Logging estructurado en JSON con correlation IDs por request
- Métricas de negocio y técnicas en Prometheus (Railway/Render out-of-box)
- Distributed tracing con OpenTelemetry para operaciones críticas (facturación, pagos)
- Alertas automáticas para: errores DIAN > 1%, latencia > 500ms p99, webhook failures > 0.1%

### RNF-07: Experiencia de usuario

- Idioma: español colombiano (no español neutro, no inglés)
- Timezone: America/Bogota como default
- Moneda: COP — siempre en pesos, nunca en USD en la UI
- Mobile-first: el vendedor usa el celular, no el laptop
- Offline básico: ver contactos y deals sin conexión (PWA con Service Worker)
- Accesibilidad: WCAG 2.1 nivel AA para componentes críticos

---

## 7. Restricciones Regulatorias y Compliance

### 7.1 Facturación Electrónica DIAN

Esta es la restricción regulatoria más crítica del producto. NexoCRM no puede emitir facturas que no cumplan con la resolución vigente de la DIAN. Las consecuencias para el tenant van desde multas hasta cierre del establecimiento.

**Restricciones no negociables:**

1. Ninguna factura se entrega al cliente antes de ser validada por la DIAN
2. El CUFE debe generarse con SHA-384 exactamente como especifica la resolución
3. La numeración debe respetar estrictamente el rango autorizado por la resolución
4. El XML debe ser UBL 2.1 válido y firmado digitalmente (delegado a MATIAS API en el MVP)
5. Las facturas aprobadas no pueden eliminarse — solo anularse con nota crédito

**Cambios regulatorios:** La DIAN actualiza las resoluciones periódicamente. NexoCRM debe tener un proceso de actualización de la integración con MATIAS en menos de 30 días calendario desde la publicación de una nueva resolución.

### 7.2 Protección de Datos Personales — Ley 1581 de 2012

**Obligaciones de NexoCRM como responsable del tratamiento:**

- Registrar la base de datos de tenants ante la SIC (Superintendencia de Industria y Comercio)
- Tener política de privacidad publicada y aceptada por los tenants en el registro
- Permitir que el titular de datos (el contacto del tenant) ejerza sus derechos: acceso, corrección, eliminación, portabilidad
- Los datos de los clientes del tenant son responsabilidad del tenant (NexoCRM es encargado del tratamiento)
- Notificación de brechas de seguridad a la SIC en menos de 24 horas

**Implementación técnica:**

- Campo `gdpr_consent` con fecha de aceptación en el registro de contactos
- Funcionalidad de "exportar mis datos" para el tenant
- Funcionalidad de "eliminar mi cuenta" con eliminación de datos sensibles (anonimización de los requeridos para auditoría)
- Retención de logs de seguridad por mínimo 2 años

### 7.3 Pagos — Restricciones Wompi y PCI DSS

- NexoCRM nunca almacena números de tarjeta, CVV ni datos bancarios completos — solo tokens de Wompi
- Los tokens de fuentes de pago se encriptan con AES-256 antes de almacenar en la base de datos
- Las transacciones de pago tienen log inmutable para conciliación y auditoría
- La integración con Wompi debe cumplir con los términos de servicio vigentes (no sublicenciar la API a terceros no autorizados)

---

## 8. Definición de MVP

### 8.1 Principio rector del MVP

> El MVP de NexoCRM resuelve el problema #1 de la pyme colombiana: **cobrar lo que le deben, de forma legal y sin fricción**. Contacto → Deal → Factura DIAN → Link de pago Wompi → WhatsApp.

### 8.2 Alcance del MVP (8 semanas)

#### Incluido en el MVP

| Módulo | Features MVP |
|--------|-------------|
| Auth | Registro con Google OAuth, login, roles básicos (Owner + Sales Rep), invitación de 1 usuario adicional |
| Multitenancy | Schema-per-tenant, resolución por subdominio, onboarding wizard 4 pasos |
| Contactos | CRUD completo, campos Colombia, búsqueda, deduplicación básica, timeline |
| Empresas | CRUD con validación NIT |
| Pipeline | 1 pipeline configurable, kanban, deals con valor COP, conversión a factura |
| Facturación DIAN | Factura de venta + nota crédito vía MATIAS API, envío por email |
| Pagos Wompi | Nequi, PSE, tarjeta crédito/débito, link de pago, conciliación automática |
| WhatsApp básico | Envío de link de pago + PDF factura por WhatsApp (número compartido NexoCRM) |
| Notificaciones | In-app + email para eventos críticos (factura DIAN, pago recibido) |
| Dashboard | Métricas básicas: contactos, deals abiertos, facturado del mes, por cobrar |

#### Excluido del MVP (backlog priorizado)

| Feature | Fase post-MVP |
|---------|--------------|
| WhatsApp bidireccional completo + bot IA | Fase 4 |
| Motor de automatización visual | Fase 5 |
| IA (chat asistente, lead scoring, copywriting) | Fase 5 |
| Inventario y control de stock | Fase 3+ |
| Múltiples pipelines | Fase 2 |
| Import CSV masivo | Fase 2 |
| Campos custom del tenant | Fase 2 |
| Apple Pay | Fase 6 |
| Integraciones Meta (Instagram/Facebook) | Fase 6 |
| API pública con webhooks outgoing | Fase 6 |
| MFA TOTP | Fase 2 |

### 8.3 Criterio de éxito del MVP

El MVP es exitoso cuando:
1. Al menos **10 tenants** completan el onboarding sin ayuda
2. Al menos **5 facturas DIAN** son aprobadas en ambiente de producción
3. Al menos **3 pagos** son recibidos vía Wompi y reconciliados automáticamente
4. **0 incidentes de seguridad** relacionados con aislamiento de datos entre tenants
5. Al menos **1 tenant paga** por un plan de pago (no Free)

---

## 9. Épicas de Alto Nivel

Las épicas se detallarán en el documento `epics/` después de completar el `architecture.md`. Las siguientes son las épicas de alto nivel identificadas:

| Epic ID | Nombre | Módulo | Fase MVP | Prioridad |
|---------|--------|--------|----------|-----------|
| E-01 | Fundación Multitenant | Infra + Auth | MVP | P0 |
| E-02 | Autenticación y Autorización | Auth | MVP | P0 |
| E-03 | Onboarding Wizard | Auth + UX | MVP | P0 |
| E-04 | Gestión de Contactos | CRM | MVP | P0 |
| E-05 | Gestión de Empresas | CRM | MVP | P0 |
| E-06 | Pipeline de Ventas | CRM | MVP | P0 |
| E-07 | Actividades y Calendario | CRM | MVP | P1 |
| E-08 | Facturación Electrónica DIAN | Billing | MVP | P0 |
| E-09 | Resoluciones y Numeración DIAN | Billing | MVP | P0 |
| E-10 | Pagos Wompi | Payments | MVP | P0 |
| E-11 | Links de Pago y Cobro | Payments | MVP | P0 |
| E-12 | WhatsApp Básico (notificaciones salientes) | WhatsApp | MVP | P0 |
| E-13 | Notificaciones y Alertas | Notifications | MVP | P1 |
| E-14 | Dashboard y Reportes Básicos | Analytics | MVP | P0 |
| E-15 | Catálogo de Productos | Inventory | Post-MVP | P1 |
| E-16 | WhatsApp Bidireccional + Inbox | WhatsApp | Post-MVP | P1 |
| E-17 | Bot IA en WhatsApp | AI + WhatsApp | Post-MVP | P1 |
| E-18 | Motor de Automatización | Automation | Post-MVP | P1 |
| E-19 | Workflows Pre-armados | Automation | Post-MVP | P1 |
| E-20 | Chat Asistente IA con RAG | AI | Post-MVP | P1 |
| E-21 | Lead Scoring e Insights IA | AI | Post-MVP | P2 |
| E-22 | Inventario y Control de Stock | Inventory | Post-MVP | P1 |
| E-23 | Import Masivo CSV/Excel | CRM | Post-MVP | P1 |
| E-24 | Campos Custom del Tenant | CRM | Post-MVP | P1 |
| E-25 | API Pública + Webhooks Outgoing | Integrations | Post-MVP | P2 |
| E-26 | Integraciones Meta (Instagram/Facebook) | Integrations | Post-MVP | P2 |
| E-27 | Apple Pay | Payments | Post-MVP | P2 |
| E-28 | Landing Page y Marketing Site | Marketing | Post-MVP | P1 |

---

## 10. Métricas de Éxito

### 10.1 Métricas de adopción (primeros 6 meses)

| Métrica | Meta conservadora | Meta realista |
|---------|------------------|---------------|
| Tenants registrados | 50 | 150 |
| Tasa de activación (completaron onboarding) | 60% | 75% |
| Tenants con al menos 1 factura DIAN | 30% | 50% |
| Tenants que pasan a plan de pago | 15% | 25% |
| Churn mensual | < 10% | < 5% |

### 10.2 Métricas de retención (indicadores de valor)

| Métrica | Target |
|---------|--------|
| DAU/MAU ratio (stickiness) | > 40% |
| Facturas emitidas por tenant activo/mes | > 20 |
| Pagos procesados por Wompi/mes | > $10M COP por tenant activo |
| NPS (Net Promoter Score) | > 40 |

### 10.3 Métricas de negocio NexoCRM

| Métrica | Meta Año 1 |
|---------|-----------|
| MRR (Monthly Recurring Revenue) | $10M COP |
| ARR (Annual Recurring Revenue) | $120M COP |
| Comisiones Wompi (0.8% sobre volumen) | $5M COP/mes |
| CAC (Costo de Adquisición de Cliente) | < $120.000 COP |
| LTV/CAC ratio | > 5x |

---

## 11. Pricing y Planes

### 11.1 Estructura de planes

| Plan | Precio COP/mes | Usuarios | Contactos | Facturas/mes | WhatsApp | Workflows |
|------|----------------|----------|-----------|--------------|----------|-----------|
| **Free** | $0 | 1 | 100 | 10 | Solo envío manual | 1 |
| **Starter** | $79.900 | 3 | 1.000 | 100 | Número compartido (notificaciones) | 5 |
| **Pro** | $199.900 | 10 | 10.000 | 500 | Número dedicado + bot IA | Ilimitados |
| **Business** | $399.900 | Ilimitados | Ilimitados | Ilimitados | Todo + API acceso | Todo + API |

### 11.2 Modelo de comisión por transacción

- 0.8% sobre el volumen de pagos procesados vía Wompi a través de NexoCRM
- La comisión se cobra además del precio del plan mensual
- La comisión de Wompi hacia el tenant es separada (la paga el tenant a Wompi directamente)

### 11.3 Principios de pricing

1. El plan Free debe ser funcional pero mostrar el valor de los planes de pago (no freemium vacío)
2. La facturación DIAN está incluida desde Starter — es el gancho de retención más fuerte
3. El bot de IA en WhatsApp es exclusivo de Pro+ — protege el margen de los planes premium
4. La comisión de transacción crea alineación de intereses: NexoCRM gana cuando el tenant cobra más

---

## 12. Fuera de Alcance

Los siguientes elementos **no serán parte de NexoCRM** en el corto plazo:

1. **Contabilidad completa y libro mayor** — NexoCRM no reemplaza a Alegra o Siigo, se integra con ellos
2. **Nómina electrónica DIAN** — es un módulo separado de alta complejidad; puede integrarse como add-on en el futuro
3. **E-commerce o tienda online** — NexoCRM no es una plataforma de venta directa al consumidor
4. **App móvil nativa** — el frontend es PWA mobile-first; una app nativa es evaluable post-lanzamiento con tracción
5. **Soporte a múltiples monedas** — NexoCRM es COP-only; la expansión LATAM es una fase futura
6. **ERP completo** — producción, manufactura, MRP — no es el foco de NexoCRM
7. **Chat de soporte al cliente del tenant hacia sus clientes** — NexoCRM es para el equipo comercial interno, no un chat en el sitio web del tenant

---

## 13. Supuestos y Dependencias

### 13.1 Supuestos de producto

1. Las pymes colombianas del segmento objetivo tienen acceso a internet estable para usar una aplicación web
2. Los dueños de negocio son el decisor de compra — no TI
3. WhatsApp Business Cloud API de Meta seguirá siendo accesible con los costos actuales
4. MATIAS API mantendrá compatibilidad con las actualizaciones de la DIAN en menos de 30 días

### 13.2 Supuestos de mercado

1. La DIAN no extiende obligatoriedad de factura electrónica a segmentos que hoy están exentos de forma que beneficie a NexoCRM (creando más demanda)
2. Wompi continúa siendo la pasarela más completa del ecosistema colombiano
3. El mercado de pymes está dispuesto a pagar entre $79.900 y $199.900 COP/mes por una herramienta integrada

### 13.3 Dependencias técnicas críticas

| Dependencia | Riesgo si falla | Mitigación |
|-------------|----------------|------------|
| MATIAS API (DIAN) | Facturación DIAN bloqueada | Tener cuenta sandbox desde semana 1; identificar proveedor alternativo (Carvajal, Gosocket) |
| Wompi API | Pagos bloqueados | La integración directa con Nequi/PSE es plan B si Wompi tiene problemas de disponibilidad |
| Meta WhatsApp Cloud API | Canal WhatsApp bloqueado | Número compartido con 360dialog mitiga el riesgo de bloqueo por spam de un tenant específico |
| Railway/Render (infra MVP) | Disponibilidad de la plataforma | Configurar alertas de uptime; plan de migración a AWS documentado desde el inicio |

---

## 14. Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|----|--------|-------------|---------|------------|
| R-01 | DIAN cambia la resolución y MATIAS API tarda en actualizar | Media | Alto | Monitorear boletines DIAN; tener contacto directo con MATIAS |
| R-02 | Meta bloquea número compartido de WhatsApp por spam | Media | Alto | Rate limiting estricto por tenant; políticas de uso aceptable; migrar a dedicado si hay señales |
| R-03 | Complejidad del MVP subestimada — no se puede lanzar en 8 semanas | Alta | Alto | Reducir MVP a 4 features críticos: contactos + factura DIAN + link de pago + WhatsApp básico |
| R-04 | Wompi cambia su modelo de precios o términos de servicio | Baja | Medio | Mantener abstracción en el módulo de pagos para poder cambiar de proveedor |
| R-05 | Migraciones de BD con schema-per-tenant son complejas a > 100 tenants | Media | Medio | Escribir migration runner desde el día 1; evaluar RLS de PostgreSQL como alternativa |
| R-06 | Alegra o Siigo lanza módulo CRM nativo | Media | Medio | La integración con Alegra/Siigo como complemento es la mejor respuesta; ser partner, no enemigo |
| R-07 | Incidente de seguridad — fuga de datos entre tenants | Baja | Crítico | Pruebas de penetración antes del lanzamiento; revisión de aislamiento en code review |
| R-08 | No se consiguen 10 betas comprometidos antes de lanzar | Media | Alto | Iniciar conversaciones con pymes en semana 1, antes de escribir código |

---

## 15. Glosario

| Término | Definición |
|---------|-----------|
| **DIAN** | Dirección de Impuestos y Aduanas Nacionales — entidad colombiana que regula la facturación electrónica |
| **CUFE** | Código Único de Factura Electrónica — hash SHA-384 que identifica unívocamente una factura ante la DIAN |
| **UBL 2.1** | Universal Business Language 2.1 — formato XML estándar para facturas electrónicas en Colombia |
| **MATIAS API** | Proveedor tecnológico habilitado por la DIAN para intermediar la facturación electrónica |
| **Wompi** | Pasarela de pagos de Bancolombia — agrega Nequi, PSE, tarjetas, Daviplata, Bancolombia |
| **Nequi** | Billetera digital de Bancolombia, con 16M+ usuarios en Colombia |
| **PSE** | Pagos Seguros en Línea — sistema de pagos interbancarios de ACH Colombia |
| **WABA** | WhatsApp Business Account — cuenta de negocio verificada por Meta para usar la Cloud API |
| **BSP** | Business Solution Provider — intermediario autorizado por Meta para la API de WhatsApp (ej: 360dialog, Twilio) |
| **Tenant** | Empresa o negocio que tiene su propia instancia de NexoCRM en un subdominio dedicado |
| **Schema-per-tenant** | Estrategia de multitenancy donde cada tenant tiene su propio schema en PostgreSQL |
| **COP** | Peso colombiano — moneda base de NexoCRM; todos los montos se almacenan en centavos (enteros) |
| **IVA** | Impuesto al Valor Agregado — 19% estándar en Colombia |
| **ICA** | Impuesto de Industria y Comercio — impuesto municipal variable por ciudad |
| **NIT** | Número de Identificación Tributaria — identificador fiscal de personas jurídicas en Colombia |
| **CC** | Cédula de Ciudadanía — documento de identidad colombiano de personas naturales |
| **RAG** | Retrieval-Augmented Generation — técnica de IA que combina búsqueda vectorial con generación de texto |
| **pgvector** | Extensión de PostgreSQL para almacenamiento y búsqueda de embeddings vectoriales |
| **BullMQ** | Librería de colas de trabajo sobre Redis, usada para jobs asíncronos |
| **tRPC** | TypeScript Remote Procedure Call — framework para APIs tipadas entre Next.js y NestJS |
| **PWA** | Progressive Web App — aplicación web con capacidades offline y instalable en móvil |
| **WCAG** | Web Content Accessibility Guidelines — estándar de accesibilidad web |
| **RTO** | Recovery Time Objective — tiempo máximo de restauración ante falla |
| **RPO** | Recovery Point Objective — máxima pérdida de datos aceptable |
| **CIIU** | Clasificación Industrial Internacional Uniforme — código estándar de actividad económica |
| **SIC** | Superintendencia de Industria y Comercio — entidad que regula protección de datos en Colombia |
| **MRR** | Monthly Recurring Revenue — ingresos recurrentes mensuales de suscripciones |
| **CAC** | Customer Acquisition Cost — costo promedio de adquirir un cliente nuevo |
| **LTV** | Lifetime Value — valor total que un cliente genera durante su relación con el producto |
| **NPS** | Net Promoter Score — métrica de satisfacción y lealtad del cliente |

---

**Próximo documento:** `ux-design.md` — Flujos de usuario, onboarding wizard, design system y wireframes  
**Agente:** UX Designer Sally (`bmad-ux-designer`)

---

*Documento generado por el agente PM John — BMad Enterprise Track | NexoCRM v1.0*  
*Revisión requerida por: Owner del producto, Architect (Winston), UX Designer (Sally)*
