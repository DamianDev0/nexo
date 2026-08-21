import { DEFAULT_CONTACT_TAXONOMY, IndustrySector } from '@repo/shared-types'
import type {
  CustomFieldsConfig,
  FieldDef,
  SelectOption,
  TaxonomyOption,
  TenantNomenclature,
} from '@repo/shared-types'

export interface PipelineStagePreset {
  name: string
  order: number
  color: string
  probability: number
}

export interface PresetTag {
  name: string
  color: string
  description?: string
}

export interface IndustryPreset {
  sector: IndustrySector
  nomenclature: TenantNomenclature
  iconPack: string
  pipelineName: string
  pipelineStages: PipelineStagePreset[]
  lifecycleStages: TaxonomyOption[]
  customFields: CustomFieldsConfig
  tags: PresetTag[]
}

function stage(key: string, label: string, color: string, order: number): TaxonomyOption {
  return { key, label, description: null, color, order, isSystem: true, enabled: true }
}

function options(...values: Array<[string, string]>): SelectOption[] {
  return values.map(([value, label]) => ({ value, label }))
}

interface FieldExtras {
  options?: SelectOption[]
  filterable?: boolean
  min?: number
}

function field(
  key: string,
  label: string,
  type: FieldDef['type'],
  order: number,
  extras: FieldExtras = {},
): FieldDef {
  return {
    key,
    label,
    type,
    required: false,
    unique: false,
    order,
    isActive: true,
    ...extras,
  }
}

const NO_FIELDS: CustomFieldsConfig = { contacts: [], companies: [], deals: [] }

const DEFAULT_LIFECYCLE = DEFAULT_CONTACT_TAXONOMY.lifecycleStages

const COMMERCE_NOMENCLATURE: TenantNomenclature = {
  contact: { singular: 'Cliente', plural: 'Clientes' },
  company: { singular: 'Proveedor', plural: 'Proveedores' },
  deal: { singular: 'Pedido', plural: 'Pedidos' },
  activity: { singular: 'Actividad', plural: 'Actividades' },
}

const COMMERCE_LIFECYCLE: TaxonomyOption[] = [
  stage('prospecto', 'Prospecto', '#60A5FA', 1),
  stage('cliente_nuevo', 'Cliente nuevo', '#4ADE80', 2),
  stage('cliente_recurrente', 'Cliente recurrente', '#2DD4BF', 3),
  stage('cliente_vip', 'Cliente VIP', '#FBBF24', 4),
  stage('inactivo', 'Inactivo', '#94A3B8', 5),
]

const COMMERCE_STAGES: PipelineStagePreset[] = [
  { name: 'Prospecto', order: 1, color: '#6366f1', probability: 10 },
  { name: 'Contactado', order: 2, color: '#8b5cf6', probability: 25 },
  { name: 'Propuesta enviada', order: 3, color: '#f59e0b', probability: 50 },
  { name: 'Negociación', order: 4, color: '#f97316', probability: 75 },
  { name: 'Cerrado ganado', order: 5, color: '#059669', probability: 100 },
]

export const INDUSTRY_PRESETS: Record<IndustrySector, IndustryPreset> = {
  salud: {
    sector: IndustrySector.SALUD,
    nomenclature: {
      contact: { singular: 'Paciente', plural: 'Pacientes' },
      company: { singular: 'Clínica', plural: 'Clínicas' },
      deal: { singular: 'Cita', plural: 'Citas' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'health',
    pipelineName: 'Atención de pacientes',
    pipelineStages: [
      { name: 'Solicitud', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Consulta agendada', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'En atención', order: 3, color: '#f59e0b', probability: 60 },
      { name: 'Seguimiento', order: 4, color: '#10b981', probability: 80 },
      { name: 'Cerrado', order: 5, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('interesado', 'Interesado', '#60A5FA', 1),
      stage('paciente_nuevo', 'Paciente nuevo', '#4ADE80', 2),
      stage('en_tratamiento', 'En tratamiento', '#FBBF24', 3),
      stage('paciente_recurrente', 'Paciente recurrente', '#2DD4BF', 4),
      stage('alta', 'De alta', '#A78BFA', 5),
      stage('inactivo', 'Inactivo', '#94A3B8', 6),
    ],
    customFields: {
      contacts: [
        field('eps', 'EPS', 'text', 1, { filterable: true }),
        field('tipo_sangre', 'Tipo de sangre', 'select', 2, {
          options: options(
            ['o_positivo', 'O+'],
            ['o_negativo', 'O-'],
            ['a_positivo', 'A+'],
            ['a_negativo', 'A-'],
            ['b_positivo', 'B+'],
            ['b_negativo', 'B-'],
            ['ab_positivo', 'AB+'],
            ['ab_negativo', 'AB-'],
          ),
        }),
        field('alergias', 'Alergias', 'textarea', 3),
        field('contacto_emergencia', 'Contacto de emergencia', 'phone', 4),
      ],
      companies: [field('convenio_activo', 'Convenio activo', 'boolean', 1, { filterable: true })],
      deals: [
        field('especialidad', 'Especialidad', 'select', 1, {
          filterable: true,
          options: options(
            ['medicina_general', 'Medicina general'],
            ['odontologia', 'Odontología'],
            ['pediatria', 'Pediatría'],
            ['dermatologia', 'Dermatología'],
            ['otra', 'Otra'],
          ),
        }),
        field('copago', 'Copago', 'currency', 2, { min: 0 }),
      ],
    },
    tags: [
      { name: 'Primera vez', color: '#60A5FA' },
      { name: 'Control', color: '#4ADE80' },
      { name: 'Urgencia', color: '#F87171' },
      { name: 'Convenio EPS', color: '#A78BFA' },
    ],
  },
  educacion: {
    sector: IndustrySector.EDUCACION,
    nomenclature: {
      contact: { singular: 'Alumno', plural: 'Alumnos' },
      company: { singular: 'Institución', plural: 'Instituciones' },
      deal: { singular: 'Matrícula', plural: 'Matrículas' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'education',
    pipelineName: 'Admisiones',
    pipelineStages: [
      { name: 'Interesado', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Inscripción', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Documentos', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Pago pendiente', order: 4, color: '#ef4444', probability: 70 },
      { name: 'Matriculado', order: 5, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('interesado', 'Interesado', '#60A5FA', 1),
      stage('aspirante', 'Aspirante', '#818CF8', 2),
      stage('matriculado', 'Matriculado', '#4ADE80', 3),
      stage('egresado', 'Egresado', '#A78BFA', 4),
      stage('inactivo', 'Inactivo', '#94A3B8', 5),
    ],
    customFields: {
      contacts: [
        field('programa_interes', 'Programa de interés', 'text', 1, { filterable: true }),
        field('jornada', 'Jornada', 'select', 2, {
          filterable: true,
          options: options(
            ['diurna', 'Diurna'],
            ['nocturna', 'Nocturna'],
            ['virtual', 'Virtual'],
            ['fines_semana', 'Fines de semana'],
          ),
        }),
        field('acudiente', 'Acudiente', 'text', 3),
      ],
      companies: [],
      deals: [
        field('periodo_academico', 'Período académico', 'text', 1),
        field('beca', 'Beca', 'boolean', 2, { filterable: true }),
      ],
    },
    tags: [
      { name: 'Aspirante', color: '#60A5FA' },
      { name: 'Becado', color: '#FBBF24' },
      { name: 'Referido egresado', color: '#A78BFA' },
    ],
  },
  inmobiliaria: {
    sector: IndustrySector.INMOBILIARIA,
    nomenclature: {
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Inmobiliaria', plural: 'Inmobiliarias' },
      deal: { singular: 'Propiedad', plural: 'Propiedades' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'real_estate',
    pipelineName: 'Ventas de propiedades',
    pipelineStages: [
      { name: 'Prospecto', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Visita agendada', order: 2, color: '#8b5cf6', probability: 25 },
      { name: 'Oferta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Negociación', order: 4, color: '#f97316', probability: 70 },
      { name: 'Escrituras', order: 5, color: '#10b981', probability: 90 },
      { name: 'Cerrado', order: 6, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('prospecto', 'Prospecto', '#60A5FA', 1),
      stage('comprador_activo', 'Comprador activo', '#FBBF24', 2),
      stage('propietario', 'Propietario', '#4ADE80', 3),
      stage('inversionista', 'Inversionista', '#A78BFA', 4),
      stage('inactivo', 'Inactivo', '#94A3B8', 5),
    ],
    customFields: {
      contacts: [
        field('presupuesto', 'Presupuesto', 'currency', 1, { filterable: true, min: 0 }),
        field('tipo_inmueble', 'Tipo de inmueble', 'select', 2, {
          filterable: true,
          options: options(
            ['apartamento', 'Apartamento'],
            ['casa', 'Casa'],
            ['local', 'Local'],
            ['oficina', 'Oficina'],
            ['lote', 'Lote'],
          ),
        }),
        field('zonas_interes', 'Zonas de interés', 'text', 3),
        field('credito_aprobado', 'Crédito aprobado', 'boolean', 4, { filterable: true }),
      ],
      companies: [],
      deals: [
        field('metros_cuadrados', 'Metros cuadrados', 'number', 1, { min: 0 }),
        field('estrato', 'Estrato', 'number', 2, { min: 1 }),
        field('matricula_inmobiliaria', 'Matrícula inmobiliaria', 'text', 3),
      ],
    },
    tags: [
      { name: 'Comprador', color: '#60A5FA' },
      { name: 'Arrendatario', color: '#2DD4BF' },
      { name: 'Inversionista', color: '#FBBF24' },
      { name: 'Vendedor', color: '#A78BFA' },
    ],
  },
  comercio: {
    sector: IndustrySector.COMERCIO,
    nomenclature: COMMERCE_NOMENCLATURE,
    iconPack: 'commerce',
    pipelineName: 'Ventas',
    pipelineStages: COMMERCE_STAGES.map((s) => ({ ...s })),
    lifecycleStages: COMMERCE_LIFECYCLE.map((s) => ({ ...s })),
    customFields: {
      contacts: [
        field('frecuencia_compra', 'Frecuencia de compra', 'select', 1, {
          filterable: true,
          options: options(
            ['semanal', 'Semanal'],
            ['quincenal', 'Quincenal'],
            ['mensual', 'Mensual'],
            ['ocasional', 'Ocasional'],
          ),
        }),
        field('canal_preferido', 'Canal preferido', 'select', 2, {
          filterable: true,
          options: options(
            ['tienda', 'Tienda'],
            ['whatsapp', 'WhatsApp'],
            ['domicilio', 'Domicilio'],
          ),
        }),
        field('cupo_credito', 'Cupo de crédito', 'currency', 3, { min: 0 }),
      ],
      companies: [
        field('dias_credito', 'Días de crédito', 'number', 1, { min: 0 }),
        field('categoria_productos', 'Categoría de productos', 'text', 2),
      ],
      deals: [
        field('metodo_pago', 'Método de pago', 'select', 1, {
          filterable: true,
          options: options(
            ['efectivo', 'Efectivo'],
            ['tarjeta', 'Tarjeta'],
            ['transferencia', 'Transferencia'],
            ['credito', 'Crédito'],
          ),
        }),
      ],
    },
    tags: [
      { name: 'Mayorista', color: '#60A5FA' },
      { name: 'Minorista', color: '#2DD4BF' },
      { name: 'Cliente crédito', color: '#FBBF24' },
      { name: 'Domicilios', color: '#A78BFA' },
      { name: 'Frecuente', color: '#4ADE80' },
    ],
  },
  servicios: {
    sector: IndustrySector.SERVICIOS,
    nomenclature: {
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Empresa', plural: 'Empresas' },
      deal: { singular: 'Proyecto', plural: 'Proyectos' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'services',
    pipelineName: 'Proyectos',
    pipelineStages: [
      { name: 'Lead', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Diagnóstico', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Propuesta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Aprobación', order: 4, color: '#f97316', probability: 75 },
      { name: 'En ejecución', order: 5, color: '#10b981', probability: 90 },
      { name: 'Entregado', order: 6, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('prospecto', 'Prospecto', '#60A5FA', 1),
      stage('cliente_activo', 'Cliente activo', '#4ADE80', 2),
      stage('cliente_recurrente', 'Cliente recurrente', '#2DD4BF', 3),
      stage('inactivo', 'Inactivo', '#94A3B8', 4),
    ],
    customFields: {
      contacts: [
        field('servicio_interes', 'Servicio de interés', 'text', 1, { filterable: true }),
        field('presupuesto', 'Presupuesto', 'currency', 2, { min: 0 }),
      ],
      companies: [],
      deals: [
        field('horas_estimadas', 'Horas estimadas', 'number', 1, { min: 0 }),
        field('retainer', 'Retainer mensual', 'boolean', 2, { filterable: true }),
      ],
    },
    tags: [
      { name: 'Retainer', color: '#4ADE80' },
      { name: 'Proyecto único', color: '#60A5FA' },
      { name: 'Referido', color: '#A78BFA' },
    ],
  },
  restaurante: {
    sector: IndustrySector.RESTAURANTE,
    nomenclature: {
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Proveedor', plural: 'Proveedores' },
      deal: { singular: 'Reserva', plural: 'Reservas' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'restaurant',
    pipelineName: 'Reservas y eventos',
    pipelineStages: [
      { name: 'Solicitud', order: 1, color: '#6366f1', probability: 20 },
      { name: 'Confirmada', order: 2, color: '#10b981', probability: 80 },
      { name: 'Completada', order: 3, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('cliente_nuevo', 'Cliente nuevo', '#60A5FA', 1),
      stage('cliente_frecuente', 'Cliente frecuente', '#4ADE80', 2),
      stage('cliente_vip', 'Cliente VIP', '#FBBF24', 3),
      stage('inactivo', 'Inactivo', '#94A3B8', 4),
    ],
    customFields: {
      contacts: [
        field('preferencias_alimentarias', 'Preferencias alimentarias', 'textarea', 1),
        field('fecha_especial', 'Fecha especial', 'date', 2),
        field('personas_habitual', 'Personas por visita', 'number', 3, { min: 1 }),
      ],
      companies: [],
      deals: [
        field('numero_personas', 'Número de personas', 'number', 1, { min: 1 }),
        field('ocasion', 'Ocasión', 'select', 2, {
          options: options(
            ['cumpleanos', 'Cumpleaños'],
            ['negocios', 'Negocios'],
            ['familiar', 'Familiar'],
            ['evento', 'Evento privado'],
          ),
        }),
      ],
    },
    tags: [
      { name: 'VIP', color: '#FBBF24' },
      { name: 'Frecuente', color: '#4ADE80' },
      { name: 'Eventos', color: '#A78BFA' },
      { name: 'Alergias', color: '#F87171' },
    ],
  },
  tecnologia: {
    sector: IndustrySector.TECNOLOGIA,
    nomenclature: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Empresa', plural: 'Empresas' },
      deal: { singular: 'Oportunidad', plural: 'Oportunidades' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'tech',
    pipelineName: 'Ventas B2B',
    pipelineStages: [
      { name: 'MQL', order: 1, color: '#6366f1', probability: 10 },
      { name: 'SQL', order: 2, color: '#8b5cf6', probability: 25 },
      { name: 'Demo agendada', order: 3, color: '#f59e0b', probability: 40 },
      { name: 'Propuesta', order: 4, color: '#f97316', probability: 60 },
      { name: 'Negociación', order: 5, color: '#ef4444', probability: 80 },
      { name: 'Cerrado', order: 6, color: '#059669', probability: 100 },
    ],
    lifecycleStages: DEFAULT_LIFECYCLE.map((s) => ({ ...s })),
    customFields: {
      contacts: [
        field('rol_decision', 'Rol en la decisión', 'select', 1, {
          filterable: true,
          options: options(
            ['decisor', 'Decisor'],
            ['influenciador', 'Influenciador'],
            ['usuario', 'Usuario final'],
            ['comprador', 'Comprador'],
          ),
        }),
        field('tamano_equipo', 'Tamaño del equipo', 'number', 2, { min: 1 }),
      ],
      companies: [field('stack_tecnologico', 'Stack tecnológico', 'text', 1)],
      deals: [
        field('mrr', 'MRR', 'currency', 1, { filterable: true, min: 0 }),
        field('plan', 'Plan', 'select', 2, {
          filterable: true,
          options: options(['starter', 'Starter'], ['pro', 'Pro'], ['enterprise', 'Enterprise']),
        }),
        field('ciclo_facturacion', 'Ciclo de facturación', 'select', 3, {
          options: options(['mensual', 'Mensual'], ['anual', 'Anual']),
        }),
      ],
    },
    tags: [
      { name: 'Demo agendada', color: '#60A5FA' },
      { name: 'Trial activo', color: '#FBBF24' },
      { name: 'Cliente activo', color: '#4ADE80' },
      { name: 'Riesgo de churn', color: '#F87171' },
      { name: 'Partner', color: '#A78BFA' },
    ],
  },
  construccion: {
    sector: IndustrySector.CONSTRUCCION,
    nomenclature: {
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Contratista', plural: 'Contratistas' },
      deal: { singular: 'Obra', plural: 'Obras' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'construction',
    pipelineName: 'Obras',
    pipelineStages: [
      { name: 'Cotización', order: 1, color: '#6366f1', probability: 15 },
      { name: 'Visita técnica', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Propuesta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Contrato', order: 4, color: '#f97316', probability: 75 },
      { name: 'En obra', order: 5, color: '#10b981', probability: 90 },
      { name: 'Entregado', order: 6, color: '#059669', probability: 100 },
    ],
    lifecycleStages: [
      stage('prospecto', 'Prospecto', '#60A5FA', 1),
      stage('cliente_contratado', 'Cliente contratado', '#FBBF24', 2),
      stage('obra_entregada', 'Obra entregada', '#4ADE80', 3),
      stage('recurrente', 'Recurrente', '#2DD4BF', 4),
      stage('inactivo', 'Inactivo', '#94A3B8', 5),
    ],
    customFields: {
      contacts: [
        field('presupuesto_obra', 'Presupuesto de obra', 'currency', 1, {
          filterable: true,
          min: 0,
        }),
        field('ciudad_obra', 'Ciudad de la obra', 'text', 2),
      ],
      companies: [],
      deals: [
        field('tipo_obra', 'Tipo de obra', 'select', 1, {
          filterable: true,
          options: options(
            ['construccion_nueva', 'Construcción nueva'],
            ['remodelacion', 'Remodelación'],
            ['mantenimiento', 'Mantenimiento'],
            ['acabados', 'Acabados'],
          ),
        }),
        field('area_m2', 'Área (m²)', 'number', 2, { min: 0 }),
        field('licencia_aprobada', 'Licencia aprobada', 'boolean', 3),
      ],
    },
    tags: [
      { name: 'Contratista aliado', color: '#A78BFA' },
      { name: 'Obra activa', color: '#FBBF24' },
      { name: 'Garantía', color: '#60A5FA' },
    ],
  },
  otros: {
    sector: IndustrySector.OTROS,
    nomenclature: {
      contact: { singular: 'Cliente', plural: 'Clientes' },
      company: { singular: 'Empresa', plural: 'Empresas' },
      deal: { singular: 'Negocio', plural: 'Negocios' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
    iconPack: 'commerce',
    pipelineName: 'Ventas',
    pipelineStages: COMMERCE_STAGES.map((s) => ({ ...s })),
    lifecycleStages: DEFAULT_LIFECYCLE.map((s) => ({ ...s })),
    customFields: NO_FIELDS,
    tags: [
      { name: 'VIP', color: '#FBBF24' },
      { name: 'Frecuente', color: '#4ADE80' },
    ],
  },
}

export const SECTOR_KEYS = Object.values(IndustrySector)
