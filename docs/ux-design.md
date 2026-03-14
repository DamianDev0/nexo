# NexoCRM — UX Design Document

**BMad Enterprise Track | Agente: UX Designer Sally**

> Versión: 1.0 | Marzo 2026  
> Estado: Draft  
> Prerrequisito completado: PRD.md ✅  
> Siguiente: architecture.md

---

## Índice

1. [Principios de Diseño](#1-principios-de-diseño)
2. [Design System](#2-design-system)
3. [Arquitectura de Información](#3-arquitectura-de-información)
4. [Flujos de Usuario Críticos](#4-flujos-de-usuario-críticos)
5. [Wireframes — Pantallas Principales](#5-wireframes--pantallas-principales)
6. [Onboarding Wizard](#6-onboarding-wizard)
7. [Experiencia Móvil](#7-experiencia-móvil)
8. [Estados y Feedback del Sistema](#8-estados-y-feedback-del-sistema)
9. [Accesibilidad](#9-accesibilidad)
10. [Handoff para Desarrollo](#10-handoff-para-desarrollo)

---

## 1. Principios de Diseño

### 1.1 Filosofía central

NexoCRM se usa en un contexto de trabajo intenso: un vendedor atendiendo clientes, una dueña revisando cartera entre reunión y reunión, un contador cerrando el mes. El diseño debe respetar ese contexto.

**Los 6 principios:**

| # | Principio | Qué significa en práctica |
|---|-----------|--------------------------|
| 1 | **Velocidad sobre completitud** | La acción más común toma máximo 3 clicks. Los campos opcionales no bloquean. |
| 2 | **Colombia en cada detalle** | Validación de NIT, listas de municipios, pesos colombianos, fechas en formato DD/MM/AAAA. Nunca MM/DD/YYYY. |
| 3 | **El celular es el dispositivo principal** | Mobile-first. Cada pantalla se diseña para 390px de ancho antes de escalar a escritorio. |
| 4 | **Cero ambigüedad en dinero y facturas** | Los montos en COP siempre visibles con separador de miles (ej: $1.250.000). El estado de la DIAN siempre explícito. |
| 5 | **Confianza visual** | Una pyme le va a dar acceso a su data de clientes y dinero. El diseño debe transmitir seriedad, no startup juvenil. |
| 6 | **La IA sugiere, el humano decide** | Los scores, resúmenes y sugerencias de IA son visibles pero nunca bloquean el flujo. |

### 1.2 Anti-patrones prohibidos

- ❌ Formularios con más de 5 campos visibles sin progressive disclosure
- ❌ Modales encima de modales
- ❌ Precios o montos en USD en la UI (siempre COP)
- ❌ Fechas en formato americano MM/DD/YYYY
- ❌ Mensajes de error técnicos ("Error 422 Unprocessable Entity") — siempre en lenguaje humano
- ❌ Acciones destructivas sin confirmación con descripción del impacto
- ❌ Animaciones de más de 300ms en flujos de trabajo

---

## 2. Design System

### 2.1 Paleta de colores

```
PRIMARIOS
─────────────────────────────────────────────────────
Azul NexoCRM      #1B4FD8   → Acciones primarias, links, estados activos
Azul claro        #EEF2FF   → Fondos de elementos seleccionados, highlights
Azul hover        #1640B0   → Estado hover de botones primarios

SEMÁNTICOS
─────────────────────────────────────────────────────
Verde éxito       #16A34A   → Pago recibido, DIAN aprobada, deal ganado
Verde claro       #DCFCE7   → Fondos de estados de éxito
Rojo error        #DC2626   → DIAN rechazada, pago fallido, errores de validación
Rojo claro        #FEE2E2   → Fondos de estados de error
Ámbar advertencia #D97706   → Factura vencida, lead sin respuesta, stock bajo
Ámbar claro       #FEF3C7   → Fondos de estados de advertencia

NEUTRALES
─────────────────────────────────────────────────────
Gris 900          #111827   → Textos principales, headings
Gris 700          #374151   → Textos secundarios, labels
Gris 500          #6B7280   → Placeholders, hints, texto deshabilitado
Gris 300          #D1D5DB   → Bordes de inputs, separadores
Gris 100          #F3F4F6   → Fondos de cards, hover states
Gris 50           #F9FAFB   → Fondo de página
Blanco            #FFFFFF   → Superficies de cards, modales

ESTADOS DE NEGOCIO (tags y badges)
─────────────────────────────────────────────────────
Nuevo lead        #3B82F6 (azul)       bg: #EFF6FF
Contactado        #8B5CF6 (violeta)    bg: #F5F3FF
Calificado        #F59E0B (ámbar)      bg: #FFFBEB
Cliente           #10B981 (verde)      bg: #ECFDF5
Inactivo          #6B7280 (gris)       bg: #F9FAFB
Perdido           #EF4444 (rojo)       bg: #FEF2F2
```

### 2.2 Tipografía

```
FAMILIA
─────────────────────────────────────────────────────
Principal   Inter (Google Fonts) — excelente legibilidad en pantalla
Monospace   JetBrains Mono — para números de factura, NITs, CUFEs

ESCALA TIPOGRÁFICA
─────────────────────────────────────────────────────
H1   32px / 700 / line-height 1.2   → Título de página (solo en landing)
H2   24px / 700 / line-height 1.3   → Sección principal en dashboard
H3   18px / 600 / line-height 1.4   → Card titles, panel headers
H4   16px / 600 / line-height 1.5   → Subtítulos, labels de sección
Body 14px / 400 / line-height 1.6   → Texto corriente en la app
Small 12px / 400 / line-height 1.5  → Metadata, timestamps, hints
Mono  13px / 400 / line-height 1.4  → NITs, números de factura, CUFEs

FORMATO NUMÉRICO (regla crítica para Colombia)
─────────────────────────────────────────────────────
Moneda:    $1.250.000      (punto como separador de miles, sin decimales)
Grandes:   $125.000.000   (siempre con prefijo $)
Porcentaje: 19%           (sin espacio antes del %)
Fechas:    15/03/2026     (DD/MM/AAAA — nunca MM/DD)
Hora:      3:45 p.m.      (formato 12h con espacio antes de am/pm)
NIT:       900.123.456-7  (con puntos y guion antes del dígito de verificación)
```

### 2.3 Espaciado y grid

```
SISTEMA DE ESPACIADO (múltiplos de 4px)
─────────────────────────────────────────────────────
2xs:  4px   → Espacio entre icon y label
xs:   8px   → Padding interno de badges y chips
sm:   12px  → Espacio entre elementos de un formulario
md:   16px  → Padding de cards (móvil)
lg:   24px  → Padding de cards (desktop), separación entre secciones
xl:   32px  → Margen entre grupos de contenido
2xl:  48px  → Separación entre módulos de página
3xl:  64px  → Padding de páginas completas (desktop)

GRID DE LAYOUT
─────────────────────────────────────────────────────
Móvil (< 768px):     1 columna, padding 16px lateral
Tablet (768-1024px): 2 columnas, gutter 24px
Desktop (> 1024px):  Sidebar fijo 240px + área de contenido
Wide (> 1440px):     Sidebar 280px + contenido centrado max 1200px
```

### 2.4 Componentes base

#### Botones

```
JERARQUÍA DE BOTONES
─────────────────────────────────────────────────────

Primario (1 por pantalla máximo):
  bg: #1B4FD8  |  text: white  |  radius: 8px  |  height: 40px
  padding: 0 16px  |  font: 14px/600
  hover: #1640B0  |  disabled: opacity 50%
  Uso: "Crear factura", "Guardar contacto", "Enviar por WhatsApp"

Secundario:
  bg: white  |  border: 1.5px #D1D5DB  |  text: #374151
  hover: bg #F3F4F6
  Uso: "Cancelar", "Ver historial", "Exportar"

Destructivo:
  bg: white  |  border: 1.5px #DC2626  |  text: #DC2626
  hover: bg #FEE2E2
  Uso: "Anular factura", "Eliminar contacto"

Ghost / Link:
  bg: transparent  |  text: #1B4FD8  |  sin borde
  Uso: Acciones secundarias dentro de tablas, links internos

Tamaños:
  sm: height 32px, font 12px, padding 0 12px
  md: height 40px, font 14px, padding 0 16px  (default)
  lg: height 48px, font 16px, padding 0 24px
```

#### Inputs y formularios

```
INPUT ESTÁNDAR
─────────────────────────────────────────────────────
height: 40px  |  border: 1.5px #D1D5DB  |  radius: 8px
font: 14px  |  color: #111827  |  padding: 0 12px
placeholder: #6B7280

Estados:
  focus:    border: 2px #1B4FD8  |  outline: none  |  ring: 0 0 0 3px #EEF2FF
  error:    border: 2px #DC2626  |  mensaje de error en rojo debajo
  success:  border: 2px #16A34A  |  checkmark al final del input
  disabled: bg: #F3F4F6  |  cursor: not-allowed  |  opacity 60%

Componentes de input Colombia-específicos:
  InputNIT:     formato automático 000.000.000-0, calcula DV automáticamente
  InputMoneda:  acepta números, muestra $1.250.000 en tiempo real
  SelectMunicipio: searchable con los 1.122 municipios de Colombia
  SelectDpto:   32 departamentos con auto-selección de municipio
  InputTelefono: +57 prefijado, formato (300) 123-4567

LABEL POSITION
─────────────────────────────────────────────────────
Labels siempre ENCIMA del input, nunca como placeholder que desaparece.
El placeholder es solo un ejemplo del formato esperado.
Campos requeridos: asterisco (*) rojo al lado del label.
```

#### Cards

```
CARD ESTÁNDAR
─────────────────────────────────────────────────────
bg: white  |  border: 1px #E5E7EB  |  radius: 12px
shadow: 0 1px 3px rgba(0,0,0,0.08)  |  padding: 16px (móvil) / 24px (desktop)

CARD DE CONTACTO (en lista)
─────────────────────────────────────────────────────
┌─────────────────────────────────────────────────┐
│  [Avatar iniciales] Nombre completo    [Status] │
│                     empresa@email.com           │
│                     Empresa · 300-123-4567      │
│  Score: ████░░ 67  Última act: hace 2 días     │
└─────────────────────────────────────────────────┘

CARD DE DEAL (kanban)
─────────────────────────────────────────────────────
┌──────────────────────────────────────┐
│  Titulo del negocio              ⋮  │
│  $2.500.000 · 75%               │
│  [Avatar] Carlos · 15 mar 2026      │
│  ○ Distribuidora ABC                │
└──────────────────────────────────────┘

CARD DE FACTURA
─────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────┐
│  FE-0042          [APROBADA DIAN ✓]     15/03/2026 │
│  Distribuidora ABC                                   │
│  Subtotal: $2.100.840   IVA 19%: $399.160           │
│  Total: $2.500.000                    Vence: 30 días│
│  [Enviar por WhatsApp]  [Link de pago]  [Ver PDF]   │
└─────────────────────────────────────────────────────┘
```

#### Badges y estados

```
BADGE DE ESTADO (pill compacto)
─────────────────────────────────────────────────────
height: 22px  |  radius: 11px (full)  |  font: 11px/600
padding: 0 8px  |  uppercase: false

Uso en deal stages (personalizables por tenant):
  "Nuevo"      → bg #EFF6FF, text #1D4ED8
  "En contacto"→ bg #F5F3FF, text #6D28D9
  "Propuesta"  → bg #FFFBEB, text #B45309
  "Negociación"→ bg #FFF7ED, text #C2410C
  "Ganado"     → bg #ECFDF5, text #065F46
  "Perdido"    → bg #FEF2F2, text #991B1B

Uso en estado de factura:
  "Borrador"        → bg #F3F4F6, text #374151
  "Pendiente DIAN"  → bg #FEF3C7, text #92400E  (con spinner)
  "Aprobada"        → bg #DCFCE7, text #14532D
  "Rechazada"       → bg #FEE2E2, text #7F1D1D
  "Pagada"          → bg #ECFDF5, text #065F46  (con checkmark)
  "Vencida"         → bg #FFF7ED, text #7C2D12
  "Anulada"         → bg #F3F4F6, text #9CA3AF  (texto tachado)
```

### 2.5 Iconografía

Usar **Lucide Icons** (ya incluido en shadcn/ui, que es el stack UI seleccionado).

```
ÍCONOS CLAVE Y SU USO
─────────────────────────────────────────────────────
Users          → Contactos
Building2      → Empresas
TrendingUp     → Pipeline / Deals
FileText       → Facturas
CreditCard     → Pagos
MessageCircle  → WhatsApp / Mensajes
Zap            → Automatizaciones
Brain          → IA
Bell           → Notificaciones
Settings       → Configuración
BarChart3      → Reportes / Dashboard
Package        → Inventario / Productos
Plus           → Crear nuevo
Search         → Búsqueda
Filter         → Filtros
Download       → Exportar
Upload         → Importar
Send           → Enviar (mensaje, factura)
Link           → Link de pago
CheckCircle2   → Aprobado / Completado
XCircle        → Rechazado / Error
AlertTriangle  → Advertencia
Clock          → Pendiente / Recordatorio
```

---

## 3. Arquitectura de Información

### 3.1 Mapa del sitio — App principal

```
NexoCRM App (miempresa.nexocrm.co)
│
├── /                    → Redirige a /dashboard
├── /login               → Pantalla de login
├── /register            → Registro de cuenta (tenant)
├── /onboarding          → Wizard de onboarding (4 pasos)
│
├── /dashboard           → Vista general del negocio
│   ├── Métricas del día
│   ├── Actividades pendientes
│   ├── Cartera vencida (widget)
│   └── Deals en riesgo (widget IA)
│
├── /contacts            → Lista de contactos
│   ├── /contacts/new    → Crear contacto
│   ├── /contacts/:id    → Perfil del contacto
│   │   ├── Timeline
│   │   ├── Deals asociados
│   │   ├── Facturas
│   │   ├── Actividades
│   │   └── Conversaciones WhatsApp
│   └── /contacts/import → Importar CSV
│
├── /companies           → Lista de empresas
│   ├── /companies/new
│   └── /companies/:id
│
├── /deals               → Pipeline de ventas
│   ├── Vista Kanban (default)
│   ├── Vista Tabla
│   ├── Vista Forecast
│   ├── /deals/new
│   └── /deals/:id
│
├── /invoices            → Facturas electrónicas
│   ├── Todas / Por cobrar / Vencidas / Pagadas
│   ├── /invoices/new
│   └── /invoices/:id
│       ├── Detalle de factura
│       ├── Estado DIAN
│       ├── Pagos asociados
│       └── Historial de acciones
│
├── /payments            → Dashboard de pagos
│   ├── Por cobrar
│   ├── Recibidos
│   └── Vencidos
│
├── /whatsapp            → Inbox de WhatsApp
│   ├── Conversaciones (lista)
│   └── /whatsapp/:conversation_id
│
├── /activities          → Calendario y actividades
│
├── /automations         → Motor de automatización
│   ├── Lista de workflows
│   ├── /automations/new
│   └── /automations/:id → Builder visual
│
├── /products            → Catálogo de productos
│
├── /reports             → Reportes y analytics
│
└── /settings            → Configuración del tenant
    ├── /settings/general     → Datos del negocio
    ├── /settings/users       → Equipo y roles
    ├── /settings/billing     → Plan y facturación
    ├── /settings/dian        → Resoluciones DIAN
    ├── /settings/whatsapp    → Configuración WhatsApp
    ├── /settings/integrations → Integraciones externas
    └── /settings/custom-fields → Campos personalizados
```

### 3.2 Navegación principal — Sidebar

```
SIDEBAR DESKTOP (240px fijo)
─────────────────────────────────────────────────────

[Logo NexoCRM]          [miempresa ▾]

PRINCIPAL
─────────
[📊] Dashboard
[👥] Contactos
[🏢] Empresas
[📈] Pipeline

VENTAS
─────────
[📄] Facturas
[💳] Pagos
[💬] WhatsApp         [3]  ← badge de no leídos

AUTOMATIZACIÓN
─────────
[⚡] Automatizaciones
[📦] Productos

ANÁLISIS
─────────
[📊] Reportes

─────────────────────────────────────────────────────
[⚙️] Configuración
[?] Ayuda

[Avatar] Nombre usuario ▾
```

```
NAVBAR MÓVIL (bottom tab bar — 5 items)
─────────────────────────────────────────────────────
[🏠 Inicio] [👥 Contactos] [📄 Facturas] [💬 WA] [⋯ Más]
```

### 3.3 Header de página

```
HEADER ESTÁNDAR (desktop)
─────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────┐
│  Contactos                          [🔍] [+ Nuevo] [⋯] │
│  1.247 contactos                                        │
└─────────────────────────────────────────────────────────┘

Elementos del header:
- Título de la sección (H2)
- Subtítulo con conteo o descripción breve
- Buscador global (se expande al hacer click)
- CTA principal "+ Nuevo" (botón primario)
- Menú overflow "⋯" para acciones secundarias (importar, exportar, filtros avanzados)
```

---

## 4. Flujos de Usuario Críticos

### Flujo 1: Registro y primer uso (Onboarding)

```
HAPPY PATH — Usuario nuevo
─────────────────────────────────────────────────────

[Landing nexocrm.co]
    ↓
"Empezar gratis" → [/register]
    ↓
Paso 1: ¿Cómo te llamas y cuál es tu empresa?
  - Nombre completo
  - Nombre del negocio
  - Subdominio sugerido (autogenerado, editable)
  "Continuar con Google" (recomendado) | o email/password
    ↓
Paso 2: Cuéntanos de tu negocio
  - Sector (lista desplegable con íconos: Distribución, Consultoría, Salud, Construcción, Otro)
  - ¿Tienes RUT/NIT? (sí/no) → si sí, campo NIT con validación DV
  - ¿Cuántas personas en tu equipo? (Solo yo / 2-5 / 6-20 / Más de 20)
    ↓
Paso 3: Configura tu primer pipeline
  - Nombre del pipeline (sugerido: "Ventas")
  - Stages preconfigurados según sector elegido (editables)
  "Usar estos stages" | "Personalizarlos"
    ↓
Paso 4: Tu primer contacto
  - ¿Quieres agregar tu primer cliente ahora?
  - Si sí → form simplificado (nombre + teléfono, lo demás opcional)
  - Si no → "Empezar sin contactos"
    ↓
[Dashboard — estado vacío con guía contextual]

TIEMPO OBJETIVO: < 4 minutos del paso 1 al dashboard
```

```
PUNTOS DE ABANDONO Y MITIGACIÓN
─────────────────────────────────────────────────────
Paso 1 → Abandono si piden demasiados datos:
  Mitigación: Solo nombre + email en el paso 1. El resto en onboarding.

Paso 2 → Abandono si no saben el NIT:
  Mitigación: NIT es opcional en el registro. Se puede agregar en Settings.

Paso 4 → Abandono si no tienen datos del cliente a mano:
  Mitigación: "Saltar por ahora" siempre visible.
```

### Flujo 2: Crear contacto y primer deal (Flujo vendedor — 3 minutos)

```
[/contacts] → "+ Nuevo contacto"
    ↓
MODAL "Nuevo contacto" (campos mínimos primero):
  - Nombre *
  - Teléfono (WhatsApp) *
  - Email
  "Crear contacto" | "Crear y agregar más datos"
    ↓
[Perfil del contacto — recién creado]
  Banner: "¿Quieres crear un deal para este contacto?"
    ↓
"Sí, crear deal" →
  MODAL "Nuevo deal":
  - Título del deal *
  - Valor estimado (COP)
  - Fecha estimada de cierre
  "Crear deal"
    ↓
[Deal creado — aparece en pipeline kanban]
  Sugerencia contextual: "¿Agregar productos al deal?"

TIEMPO OBJETIVO TOTAL: < 2 minutos
```

### Flujo 3: Emitir factura DIAN y cobrar (Flujo crítico)

```
DESDE DEAL GANADO:
─────────────────────────────────────────────────────

[Deal en stage "Ganado"]
  Banner: "¡Felicitaciones! ¿Crear factura para este deal?"
    ↓
"Crear factura" →
  [/invoices/new] — pre-cargado con datos del deal:
  - Cliente (del deal) ← pre-cargado
  - Items (del deal) ← pre-cargados
  - Resolución DIAN activa ← auto-seleccionada
    ↓
  SECCIÓN DATOS FISCALES:
  - ¿El cliente tiene RUT/NIT? → si sí, muestra régimen tributario
  - IVA por ítem (sugerido según el producto del catálogo)
  - ¿Aplica retención en la fuente? (checkbox)
    ↓
  RESUMEN DE FACTURA:
  ┌─────────────────────────────────────────────┐
  │ Subtotal:          $2.100.840              │
  │ IVA 19%:            $399.160              │
  │ Ret. en la fuente:  -$42.017              │
  │ ─────────────────────────────────────────── │
  │ TOTAL A PAGAR:     $2.458.000             │
  │                    (en letras si se incluye)│
  └─────────────────────────────────────────────┘
  "Emitir factura DIAN"
    ↓
  [Estado: Enviando a DIAN...]
  Spinner + mensaje: "Estamos validando tu factura con la DIAN. Esto tarda menos de 30 segundos."
    ↓
  CASO 1 — APROBADA:
  [✅ Factura aprobada por la DIAN]
  CUFE: A3B4C5D6...
  [📤 Enviar al cliente]
    → "Por WhatsApp" | "Por Email" | "Descargar PDF"
    ↓
  Si WhatsApp:
  Modal "Enviar por WhatsApp":
    Para: [número del cliente pre-cargado]
    Mensaje: "Hola [nombre], adjunto encontrarás la factura FE-0042 por $2.458.000.
              Para pagar ahora: [link de pago]"
    [Vista previa del mensaje]
    "Enviar ahora"
    ↓
  [Timeline del deal actualizado:
   ✅ Factura FE-0042 emitida
   📤 Enviada por WhatsApp a 300-123-4567
   🔗 Link de pago activo - expira en 72h]

  CASO 2 — RECHAZADA:
  [❌ La DIAN rechazó la factura]
  Motivo: "El NIT del cliente no está registrado como responsable de IVA"
  [¿Cómo corrijo esto?] → Guía paso a paso
  [Corregir y reintentar]
```

### Flujo 4: Cobro de cartera por WhatsApp (Flujo de retención)

```
[/payments] → Tab "Vencidas"
  Lista de facturas vencidas ordenadas por días de mora
    ↓
[Seleccionar factura vencida]
  Card con:
  - Cliente: Distribuidora ABC
  - Factura: FE-0038
  - Valor: $3.750.000
  - Vencida hace: 12 días
  - Intentos anteriores de cobro: 1 (ver historial)
    ↓
  [Enviar recordatorio]
  Modal con templates pre-aprobados:
  
  Template "Recordatorio amable" (día 1-7):
  "Hola [Nombre], esperamos que estés bien. 
   Te recordamos que tienes una factura pendiente por $3.750.000 
   con vencimiento el 03/03/2026. 
   Puedes pagar fácilmente aquí: [link]"
  
  Template "Recordatorio firme" (día 8-15):
  "Estimado [Nombre], la factura FE-0038 por $3.750.000 
   lleva 12 días vencida. Por favor realiza el pago a la brevedad 
   para evitar inconvenientes. Link de pago: [link]"
    ↓
  [Vista previa del mensaje en burbuja de WhatsApp]
  "Enviar ahora" | "Programar para mañana 9am"
    ↓
  [Actividad registrada en timeline del contacto:
   📤 Recordatorio de cobro enviado por WhatsApp - 15/03/2026 3:20pm]
```

### Flujo 5: Recibir mensaje de WhatsApp y calificar lead

```
[Notificación in-app: "Nuevo mensaje de WhatsApp de un número desconocido"]
    ↓
[/whatsapp] → Conversación nueva
  [Banner IA]: "Esta persona parece interesada en comprar. Score: 78/100"
  Razón: "Preguntó por precios y disponibilidad de 2 productos"
    ↓
  Mensaje del cliente: "Hola, ¿cuánto vale el mantenimiento preventivo para 5 computadores?"
    ↓
  [Bot responde automáticamente si está activado]:
  "Hola! El servicio de mantenimiento preventivo para 5 equipos cuesta $450.000.
   Incluye limpieza, actualización de software y diagnóstico. 
   ¿Quieres que te envíe una cotización formal?"
    ↓
  Opciones para el agente humano:
  [📋 Crear contacto] → abre form pre-llenado con el número
  [💼 Crear deal]
  [📄 Enviar cotización]
  [↗️ Asignar a vendedor]
    ↓
  [Contacto creado: "Número 314-xxx-xxxx"]
  Sugerencia: "Completa los datos de este contacto cuando lo tengas"
```

---

## 5. Wireframes — Pantallas Principales

### 5.1 Dashboard Principal

```
DESKTOP (1280px)
═══════════════════════════════════════════════════════════════
SIDEBAR │ CONTENIDO PRINCIPAL
(240px) │
        │ Buenos días, Carolina ☀️               [15 mar 2026]
        │ ─────────────────────────────────────────────────────
        │
        │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ │ Por cobrar│ │  Vencido │ │ Deals    │ │ Facturado│
        │ │$12.450.000│ │$3.750.000│ │  activos │ │  este mes│
        │ │           │ │          │ │    24    │ │$28.900.000│
        │ │ 8 facturas│ │ 2 facturas│ │ $45.2M   │ │           │
        │ └──────────┘ └──────────┘ └──────────┘ └──────────┘
        │     ↑ verde       ↑ rojo       ↑ azul       ↑ verde
        │
        │ ┌─────────────────────────┐ ┌──────────────────────┐
        │ │ Pipeline de hoy          │ │ Facturas por cobrar  │
        │ │                          │ │                      │
        │ │ Nuevo      5  $8.5M     │ │ ABC Corp  $2.4M  3d  │
        │ │ Propuesta  3  $12.1M    │ │ XYZ Ltda  $1.8M  15d │
        │ │ Negociando 4  $18.6M    │ │ 123 SAS   $3.1M  22d │
        │ │ Cierre     2  $6.0M     │ │                 ↑rojo │
        │ │                          │ │ [Ver todas vencidas]  │
        │ │ [Ver pipeline completo]  │ └──────────────────────┘
        │ └─────────────────────────┘
        │
        │ ┌─────────────────────────┐ ┌──────────────────────┐
        │ │ Actividades hoy          │ │ Sugerencias IA       │
        │ │                          │ │                      │
        │ │ ○ Llamar a Carlos M.     │ │ 💡 Juan P. lleva 5   │
        │ │   Deal: Software ERP     │ │    días sin respuesta│
        │ │                          │ │    Score bajó a 45.  │
        │ │ ○ Reunión 3pm con ABC    │ │    Sugerencia: llamar│
        │ │   [Preparar con IA]      │ │    hoy.              │
        │ │                          │ │                      │
        │ │ ✓ Enviada FE-0042        │ │ 💡 Distribuidora XYZ │
        │ │   $2.458.000 Aprobada    │ │    sin actividad 60d │
        │ │                          │ │    [Enviar oferta]   │
        │ └─────────────────────────┘ └──────────────────────┘
```

### 5.2 Lista de Contactos

```
DESKTOP
═══════════════════════════════════════════════════════════════

Contactos                                   [🔍 Buscar] [+ Nuevo]
1.247 contactos   [Todos ▾] [Etiquetas ▾] [Fuente ▾] [Más filtros]
─────────────────────────────────────────────────────────────────
☐  NOMBRE ↕          EMPRESA          TELÉFONO      ESTADO   SCORE  ASIGNADO
─────────────────────────────────────────────────────────────────
☐  [CC] Carlos M.    Dist. ABC        300-123-4567  Cliente   82    [Av] Ana
☐  [XY] Xochitl V.  Independiente    313-456-7890  Nuevo     45    [yo]
☐  [JR] Juan R.      Tech SAS         315-789-0123  Califica  67    [Av] Ana
   ...

[Cargando más... scroll infinito]

VISTAS: [☰ Lista] [▦ Tabla] [⊞ Kanban]
```

### 5.3 Perfil de Contacto

```
DESKTOP — 2 columnas
═══════════════════════════════════════════════════════════════

← Contactos     [📤 Acciones ▾]  [+ Actividad]  [💬 WhatsApp]  [📄 Factura]

COLUMNA IZQUIERDA (320px)          COLUMNA DERECHA (flex)
──────────────────                 ─────────────────────────────────────────
[CC]  Carlos Martínez              TIMELINE
      Distribuidora ABC             ─────────────────────────────────────────
      carlos@abc.co                 HOY
      📱 300-123-4567               ● Factura FE-0042 aprobada ($2.458.000) ✓
      📅 Cliente desde mar 2025      ↳ Enviada por WhatsApp
                                     ↳ Link de pago activo
[CLIENTE]  Score: ██████░ 82       
                                   15 MAR 2026
─────────────────────────────       ● WhatsApp: "Perfecto, ya pago"
DEALS ACTIVOS (2)                   ↳ Lead score ↑ 82
  • Renovación 2026  $8.5M Prop.   
  • Upsell módulo    $2.1M Neg.    10 MAR 2026
[+ Crear deal]                      ● Llamada - 25 min
                                     "Interesado en renovación anual"
─────────────────────────────       ↳ Nota: "Necesita aprobación de gerencia"
EMPRESAS
  [ABC] Distribuidora ABC ↗        05 MAR 2026
                                     ● Deal creado: "Renovación 2026"
─────────────────────────────       ● Factura FE-0038 enviada ($3.750.000)
INFORMACIÓN                          ↳ [VENCIDA hace 12 días] [Cobrar ahora]
  CC: 71.234.567
  Medellín, Antioquia              [Cargar más]
  Responsable de IVA
  Sector: Distribución

─────────────────────────────
[✏️ Editar]  [🗑️ Archivar]
```

### 5.4 Pipeline Kanban

```
DESKTOP
═══════════════════════════════════════════════════════════════

Pipeline: Ventas ▾    [+ Pipeline]  [Vista: ⊞ Kanban ▾]  [Filtros]  [Forecast]

$45.2M en pipeline  •  24 deals activos  •  Cierre promedio: 32 días
─────────────────────────────────────────────────────────────────
NUEVO (5)      EN CONTACTO (7)   PROPUESTA (6)  NEGOCIANDO (4)   GANADO
$8.5M          $14.2M           $12.1M          $10.4M
─────────────  ───────────────  ─────────────  ───────────────  ────────
┌────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐  deal1
│ Software   │ │ Mantenim.   │ │ Dist. ABC  │ │ Upsell XYZ  │  deal2
│ Licencias  │ │ Anual       │ │ Renovación │ │ Módulo HR   │
│ $3.2M 30%  │ │ $1.8M 45%  │ │ $8.5M 75% │ │ $4.2M 85%  │
│ [MG] Mar   │ │ [yo] 14mar │ │ [AV] 20mar│ │ [yo] 15mar │
└────────────┘ └─────────────┘ └────────────┘ └─────────────┘
┌────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐
│ ...        │ │ ...         │ │ ...        │ │ ...         │
└────────────┘ └─────────────┘ └────────────┘ └─────────────┘

[+ Agregar deal]  [+ Agregar deal]  [+ Agregar deal]  [+ Agregar deal]

         ← Arrastrar cards entre columnas con drag & drop →
```

### 5.5 Crear/Editar Factura

```
DESKTOP
═══════════════════════════════════════════════════════════════

← Facturas    Nueva factura electrónica DIAN        [Guardar borrador]

┌──────────────────────────────────────────────────────────────┐
│ RESOLUCIÓN ACTIVA                                             │
│ SETP 000001 del 15/01/2026 | Rango: 1-1000 | Consecutivo: 43│
│ Próxima factura: FE-0043              Vence: 15/01/2027 ✓    │
└──────────────────────────────────────────────────────────────┘

DATOS DEL CLIENTE
─────────────────────────────────────────────────────────────
🔍 Buscar cliente...                    [+ Crear nuevo cliente]
   ↓ autocomplete
   ┌─────────────────────────────────────┐
   │ ✓ Distribuidora ABC Ltda.          │
   │   NIT: 900.123.456-7               │
   │   Responsable de IVA               │
   └─────────────────────────────────────┘

ITEMS DE LA FACTURA
─────────────────────────────────────────────────────────────
DESCRIPCIÓN              CANT   PRECIO UNIT.    IVA    TOTAL
─────────────────────────────────────────────────────────────
🔍 Agregar producto...
[+ Catálogo] o [+ Línea libre]

Ej. una vez agregado:
──────────────────────────────────────────────────────
Servicio mantenimiento   10     $210.084        19%  $2.500.000
×

[+ Agregar ítem]

TOTALES
─────────────────────────────────────────────────────────────
                              Subtotal:    $2.100.840
                              IVA 19%:      $399.160
                              Descuento:         $0
                              ─────────────────────
                              TOTAL:       $2.500.000
                              (Dos millones quinientos mil pesos 00/100)

CONDICIONES DE PAGO
─────────────────────────────────────────────────────────────
Fecha de emisión: [15/03/2026]    Vence: [Contado ▾] → 15/03/2026
Método de pago: [Transferencia ▾]
Notas: [campo libre opcional]

─────────────────────────────────────────────────────────────
[Guardar borrador]                          [Emitir factura DIAN →]
```

### 5.6 Dashboard de Cartera

```
DESKTOP
═══════════════════════════════════════════════════════════════

Cartera                          [Período: Este mes ▾]  [Exportar]

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  POR COBRAR  │ │   VENCIDO    │ │  PAGADO HOY  │ │  PAGADO MES  │
│  $24.750.000 │ │  $8.450.000  │ │   $3.200.000 │ │  $42.100.000 │
│  18 facturas │ │  5 facturas  │ │   2 pagos    │ │  31 pagos    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

FACTURAS VENCIDAS (urgente)
──────────────────────────────────────────────────────────────────────
CLIENTE              FACTURA   VALOR        VENCIDA HACE   ACCIONES
──────────────────────────────────────────────────────────────────────
Dist. ABC Ltda.      FE-0038   $3.750.000   22 días  🔴    [Cobrar] [Ver]
Tech SAS             FE-0035   $2.100.000   15 días  🟠    [Cobrar] [Ver]
Comercial XYZ        FE-0041   $1.800.000    8 días  🟡    [Cobrar] [Ver]
...

[Cobrar todo por WhatsApp]  ← acción masiva sobre seleccionadas

FACTURAS POR COBRAR (próximas)
──────────────────────────────────────────────────────────────────────
CLIENTE              FACTURA   VALOR        VENCE EN       ACCIONES
──────────────────────────────────────────────────────────────────────
Inversiones MG       FE-0043   $5.200.000    5 días        [Recordar]
Logística Sur        FE-0042   $2.458.000   12 días        [Recordar]
```

---

## 6. Onboarding Wizard

### 6.1 Estructura detallada del wizard

```
PASO 1 DE 4: Tu información
═══════════════════════════════════════════════════════════════

    ●●●○  Paso 1 de 4

    ¡Bienvenido a NexoCRM!
    Vamos a tener tu cuenta lista en menos de 4 minutos.

    ┌─────────────────────────────────────────────────────┐
    │  Nombre completo *                                   │
    │  [Carolina Martínez                              ]   │
    │                                                      │
    │  Nombre de tu negocio *                              │
    │  [Distribuidora ABC                              ]   │
    │                                                      │
    │  Tu acceso será: miempresa.nexocrm.co                │
    │  [distribuidora-abc                   ].nexocrm.co   │
    │  ✓ Disponible                                        │
    └─────────────────────────────────────────────────────┘

    [Continuar con Google ▶]     más rápido, recomendado

    o continúa con email:
    [Email]  [Contraseña]  [Registrarme]

    Al registrarte aceptas los Términos de servicio
    y la Política de privacidad (Ley 1581 de 2012).
```

```
PASO 2 DE 4: Tu negocio
═══════════════════════════════════════════════════════════════

    ●●●○  Paso 2 de 4

    Cuéntanos de tu negocio
    Esto nos ayuda a personalizar NexoCRM para ti.

    ¿En qué sector estás?
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │🏪 Comercio│ │⚙️ Servicios│ │🏥 Salud  │
    │y distrib.│ │profesion.│ │ y bienes.│
    └──────────┘ └──────────┘ └──────────┘
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │🏗️ Construc│ │📢 Marketing│ │⋯ Otro   │
    │  ción    │ │ y agencia│ │         │
    └──────────┘ └──────────┘ └──────────┘

    ¿Cuántas personas en tu equipo?
    ○ Solo yo    ○ 2-5    ○ 6-20    ○ Más de 20

    ¿Tienes RUT/NIT de empresa?
    ○ Sí, tengo NIT  [900.123.456-7] ✓ DV válido
    ○ No, soy persona natural
    ○ Todavía no lo tengo

    [← Atrás]                           [Continuar →]
```

```
PASO 3 DE 4: Tu pipeline de ventas
═══════════════════════════════════════════════════════════════

    ●●●○  Paso 3 de 4

    Así se verá tu proceso de ventas
    Puedes cambiarlo cuando quieras.

    Basado en negocios de distribución como el tuyo,
    te sugerimos este pipeline:

    [Nuevo lead] → [En contacto] → [Propuesta] → [Negociando] → [Ganado]

    Cada etapa se ve así en el kanban:
    ┌──────────────────────────────────────────────────────┐
    │  NUEVO LEAD   |  EN CONTACTO  |  PROPUESTA  |  ...  │
    │  ────────────   ─────────────   ──────────          │
    │  Card de deal   Card de deal    Card de deal         │
    └──────────────────────────────────────────────────────┘

    ○ Usar este pipeline  (recomendado)
    ○ Quiero personalizarlo ahora
    ○ Lo configuro después

    [← Atrás]                           [Continuar →]
```

```
PASO 4 DE 4: Tu primer cliente
═══════════════════════════════════════════════════════════════

    ●●●●  Paso 4 de 4 — ¡Casi listo!

    Agrega tu primer cliente
    O puedes hacerlo después — tu decides.

    ┌─────────────────────────────────────────────────────┐
    │  Nombre del cliente *                                │
    │  [                                              ]   │
    │                                                      │
    │  Teléfono / WhatsApp *                               │
    │  +57 [                                          ]   │
    │                                                      │
    │  Email (opcional)                                    │
    │  [                                              ]   │
    └─────────────────────────────────────────────────────┘

    [Agregar cliente y entrar al CRM →]
    [Entrar sin agregar cliente ahora]


    ═══════════════════════════════════════════════════════
    TRAS COMPLETAR EL ONBOARDING → DASHBOARD CON GUÍA:

    🎉 ¡Listo, [Carolina]! Tu NexoCRM está configurado.

    ¿Qué quieres hacer primero?

    [📄 Crear mi primera factura DIAN]
    [👥 Agregar más contactos]
    [📈 Configurar mi pipeline]
    [💳 Conectar pagos con Wompi]

    ○ No mostrar esta guía de nuevo
```

### 6.2 Empty states — guías contextuales

Cada módulo vacío muestra orientación clara:

```
EMPTY STATE — Lista de contactos vacía
═══════════════════════════════════════════════════════════════

        [Ilustración simple: dos personas con un chat]

        Aún no tienes contactos

        Empieza agregando a tus clientes y leads
        para gestionar tus ventas desde aquí.

        [+ Agregar primer contacto]
        [↑ Importar desde Excel/CSV]

        ¿Tienes contactos en WhatsApp?
        Aprende a pasarlos aquí →


EMPTY STATE — Pipeline sin deals
═══════════════════════════════════════════════════════════════

NUEVO LEAD         EN CONTACTO        PROPUESTA
────────────       ─────────────      ──────────────
┌──────────┐       ┌────────────┐     ┌────────────┐
│          │       │            │     │            │
│  + Deal  │       │  Arrastra  │     │   aquí     │
│          │       │   deals    │     │            │
└──────────┘       └────────────┘     └────────────┘

[+ Crear tu primer deal]
```

---

## 7. Experiencia Móvil

### 7.1 Principios mobile-first

```
BREAKPOINTS
─────────────────────────────────────────────────────
< 390px    → Diseño mínimo (teléfonos muy pequeños)
390-768px  → Móvil estándar (iPhone 14, Android estándar)
768-1024px → Tablet
> 1024px   → Desktop

REGLAS PARA MÓVIL:
- Tap targets mínimo 44x44px (accesibilidad táctil)
- Menú bottom tab bar (no sidebar)
- Cards de lista: swipe left → acciones rápidas
- Formularios: 1 campo visible por pantalla en el wizard de onboarding
- Cámara: acceso para capturar tarjetas de presentación (fase futura)
- FAB (Floating Action Button) para acción principal por pantalla
```

### 7.2 Wireframe móvil — pantallas clave

```
DASHBOARD MÓVIL (390px)
═══════════════════════════════════

┌─────────────────────────────────┐
│  ≡  NexoCRM          🔔 [AV]   │
│─────────────────────────────────│
│  Buenos días, Carolina          │
│                                 │
│  ┌─────────┐  ┌─────────┐     │
│  │Por cobrar│  │ Vencido  │     │
│  │$12.4M   │  │ $3.7M   │     │
│  │8 facturas│  │ 2 fact. │     │
│  └─────────┘  └─────────┘     │
│                                 │
│  Actividades de hoy             │
│  ────────────────────────────  │
│  ○ Llamar a Carlos M. 10am     │
│  ○ Reunión ABC 3pm             │
│                                 │
│  Facturas vencidas              │
│  ────────────────────────────  │
│  ⚠️ FE-0038 · Dist. ABC        │
│    $3.750.000 · 22 días        │
│    [Cobrar ahora]               │
│                                 │
│─────────────────────────────────│
│ 🏠      👥      📄      💬  ⋯  │
│ Inicio Contac. Fact.  WA  Más  │
└─────────────────────────────────┘


LISTA DE CONTACTOS MÓVIL
═══════════════════════════════════

┌─────────────────────────────────┐
│  ← Contactos          [+] [🔍]  │
│─────────────────────────────────│
│  [CC] Carlos Martínez           │
│       Dist. ABC · 300-123-4567  │
│       [Cliente] Score: 82       │
│─────────────────────────────────│
│  [XY] Xochitl V.                │
│       · 313-456-7890            │
│       [Nuevo] Score: 45         │
│─────────────────────────────────│
│  Swipe ← sobre contacto:        │
│  [💬 WA] [📄 Factura] [⋯ Más]  │
│─────────────────────────────────│
│              [+ FAB]            │
└─────────────────────────────────┘


CREAR CONTACTO MÓVIL (modal bottom sheet)
═══════════════════════════════════

┌─────────────────────────────────┐
│  ━━━━━━━━━                      │  ← drag indicator
│  Nuevo contacto         [✕]     │
│─────────────────────────────────│
│  Nombre *                       │
│  [                          ]   │
│                                 │
│  WhatsApp *                     │
│  +57 [                      ]   │
│                                 │
│  Email                          │
│  [                          ]   │
│                                 │
│  [Crear contacto]               │
│  [Crear y agregar más datos]    │
└─────────────────────────────────┘
```

---

## 8. Estados y Feedback del Sistema

### 8.1 Mensajes de éxito

```
TOAST (notificación flotante — aparece 3 segundos, esquina superior derecha)
─────────────────────────────────────────────────────────────────────────
✅ Contacto creado exitosamente
✅ Factura FE-0043 aprobada por la DIAN
✅ Mensaje enviado por WhatsApp a Carlos M.
✅ Pago de $2.458.000 registrado
✅ Deal movido a "Ganado"
```

### 8.2 Mensajes de error — en lenguaje humano

```
REGLA: Nunca mostrar códigos de error técnicos. Siempre explicar qué pasó y qué hacer.

ERRORES COMUNES Y SU MENSAJE EN LA UI:
─────────────────────────────────────────────────────────────────────────

Error DIAN (validación):
  ❌ "La DIAN rechazó la factura porque el NIT del cliente no está activo
      en el registro tributario. Por favor verifica el NIT con tu cliente
      y corrígelo antes de reintentar."
  [Cómo verificar un NIT]  [Corregir y reintentar]

Error DIAN (conexión):
  ⚠️ "No pudimos conectar con la DIAN en este momento.
      Tu factura está guardada como borrador.
      Reintentaremos automáticamente en 5 minutos."
  [Reintentar ahora]  [Ver borrador]

Error Wompi (pago declinado):
  ❌ "El pago fue declinado por la entidad financiera.
      Puedes intentar con otro método de pago o pedirle al cliente
      que contacte a su banco."
  [Intentar otro método]  [Copiar link de pago]

Error de validación NIT:
  ❌ "El dígito de verificación del NIT no coincide.
      NIT ingresado: 900.123.456-8
      Dígito correcto: 7
      ¿Deseas corregirlo?"
  [Sí, corregir a -7]  [Dejar así]

Error de duplicado:
  ⚠️ "Ya existe un contacto con este número de WhatsApp:
      Carlos Martínez (carlos@email.co)
      ¿Quieres abrir ese contacto o crear uno nuevo de todas formas?"
  [Ver contacto existente]  [Crear de todas formas]
```

### 8.3 Estados de carga

```
ESTADOS DE LOADING — guías para el frontend
─────────────────────────────────────────────────────────────────────────

Carga de lista (skeleton):
  Mostrar 5-8 filas de skeleton con la misma estructura que el contenido real.
  No mostrar spinner centrado — el skeleton reduce el efecto de "parpadeo".

Carga de operación DIAN (> 5 segundos posibles):
  [spinner pequeño] "Validando con la DIAN... esto tarda menos de 30 segundos"
  Si pasa de 30 segundos:
  "La DIAN está tardando más de lo normal. Puedes esperar o volver más tarde —
   tu factura está guardada y seguiremos intentando automáticamente."

Carga de IA (chat asistente, resumen):
  Dots animados + "NexoCRM está pensando..."
  El texto aparece progresivamente (streaming), no de golpe.

Envío de WhatsApp:
  [spinner] "Enviando..." → [✓] "Enviado" (el check verde aparece cuando Meta confirma)
```

### 8.4 Confirmaciones de acciones destructivas

```
MODAL DE CONFIRMACIÓN — Anular factura
─────────────────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️  Anular factura FE-0042                                         │
│                                                                      │
│  Estás a punto de anular la factura por $2.458.000 emitida          │
│  a Distribuidora ABC el 15/03/2026.                                  │
│                                                                      │
│  Esto implica:                                                       │
│  • Se generará automáticamente una Nota Crédito ante la DIAN        │
│  • La factura no podrá reactivarse — solo anularse                  │
│  • Si ya se pagó, el pago quedará como crédito a favor del cliente  │
│                                                                      │
│  Motivo de anulación *                                               │
│  [Seleccionar motivo ▾]                                              │
│  • Error en los datos del cliente                                    │
│  • Error en los valores                                              │
│  • Devolución de mercancía                                           │
│  • Acuerdo comercial                                                 │
│  • Otro                                                              │
│                                                                      │
│  [Cancelar]                        [Anular factura y crear NC →]    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Accesibilidad

### 9.1 Estándar objetivo: WCAG 2.1 nivel AA

| Criterio | Implementación |
|----------|---------------|
| Contraste de color | Mínimo 4.5:1 para texto normal, 3:1 para texto grande. Verificar con herramientas en diseño antes de implementar. |
| Navegación por teclado | Todos los elementos interactivos son accesibles con Tab. Orden lógico de focus. |
| Labels en formularios | Todos los inputs tienen `<label>` asociado. Nunca solo placeholder. |
| Mensajes de error | Los errores se asocian al input con `aria-describedby`. No solo por color. |
| Imágenes e íconos | Todos los íconos funcionales tienen `aria-label`. Los decorativos tienen `aria-hidden`. |
| Anuncios de estado | Las acciones asíncronas (DIAN, pagos) usan `aria-live` para anunciar el resultado. |

### 9.2 Consideraciones Colombia-específicas

- Soporte para lectores de pantalla en español (NVDA + Chrome, VoiceOver en iOS)
- Formato de moneda legible por voz: "$2.458.000" se lee "dos millones cuatrocientos cincuenta y ocho mil pesos"
- Contraste especialmente importante en el estado de facturas (verde/rojo) — nunca solo por color, siempre con ícono o texto

---

## 10. Handoff para Desarrollo

### 10.1 Stack UI acordado

```
DECISIONES TOMADAS
─────────────────────────────────────────────────────────────────────────
Framework UI:  shadcn/ui (sobre Radix UI) + Tailwind CSS
Iconos:        Lucide Icons (incluido en shadcn/ui)
Fuentes:       Inter (body) + JetBrains Mono (código/números)
               Cargar desde Google Fonts con display: swap
Temas:         Solo modo claro en el MVP. Dark mode en backlog.
Animaciones:   Framer Motion para transiciones de página y modales
Drag & Drop:   @dnd-kit/core para el kanban del pipeline
Fechas:        date-fns con locale es-CO para formateo
Moneda:        Intl.NumberFormat con locale es-CO, currency COP
```

### 10.2 Convenciones de componentes

```typescript
// Nomenclatura de componentes
// PascalCase para componentes React
ContactCard.tsx
InvoiceStatusBadge.tsx
PipelineKanban.tsx

// Estructura de carpeta por feature
/src/features/
  contacts/
    components/
      ContactCard.tsx
      ContactTimeline.tsx
      ContactForm.tsx
    hooks/
      useContacts.ts
      useContactSearch.ts
    types.ts
    
  invoices/
    components/
      InvoiceForm.tsx
      DIANStatusBanner.tsx
      ...
```

### 10.3 Componentes prioritarios para el MVP

Los siguientes componentes deben construirse primero (en este orden):

1. `AuthLayout` — wrapper para login/registro
2. `AppShell` — sidebar + header + content area
3. `ContactCard` + `ContactList` — lista de contactos
4. `PipelineKanban` — el core del CRM visual
5. `InvoiceForm` — el flujo más crítico del producto
6. `DIANStatusBanner` — feedback del estado DIAN
7. `PaymentMethodSelector` — selector de método Wompi
8. `WhatsAppMessagePreview` — preview del mensaje antes de enviar
9. `NotificationBell` — bell con badge en tiempo real (WebSocket)
10. `EmptyState` — reutilizable con ilustración, título, CTA

### 10.4 Responsividad y pruebas

```
DISPOSITIVOS DE PRUEBA OBLIGATORIOS
─────────────────────────────────────────────────────────────────────────
Móvil:    iPhone 14 (390px), Samsung Galaxy S23 (360px)
Tablet:   iPad Air (820px), Samsung Tab (768px)
Desktop:  1280px, 1440px, 1920px

NAVEGADORES OBJETIVO (Colombia 2026, según StatCounter CO)
─────────────────────────────────────────────────────────────────────────
Chrome Android  →  58% del tráfico móvil
Chrome Desktop  →  62% del tráfico desktop
Safari iOS      →  18%
Firefox         →  5%
Samsung Internet→  8%

IE 11 y navegadores legacy: no soportados.
```

---

**Próximo documento:** `architecture.md`  
**Agente:** Architect Winston (`bmad-architect`)

---

*Documento generado por UX Designer Sally — BMad Enterprise Track | NexoCRM v1.0*
