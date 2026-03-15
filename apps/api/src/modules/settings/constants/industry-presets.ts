export interface PipelineStagePreset {
  name: string
  order: number
  color: string
  probability: number
}

export interface IndustryPreset {
  sector: string
  nomenclature: {
    contacts: string
    companies: string
    deals: string
  }
  iconPack: string
  pipelineStages: PipelineStagePreset[]
}

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  salud: {
    sector: 'salud',
    nomenclature: { contacts: 'Pacientes', companies: 'Clínicas', deals: 'Citas' },
    iconPack: 'health',
    pipelineStages: [
      { name: 'Solicitud', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Consulta agendada', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'En atención', order: 3, color: '#f59e0b', probability: 60 },
      { name: 'Seguimiento', order: 4, color: '#10b981', probability: 80 },
      { name: 'Cerrado', order: 5, color: '#059669', probability: 100 },
    ],
  },
  educacion: {
    sector: 'educacion',
    nomenclature: { contacts: 'Alumnos', companies: 'Instituciones', deals: 'Matrículas' },
    iconPack: 'education',
    pipelineStages: [
      { name: 'Interesado', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Inscripción', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Documentos', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Pago pendiente', order: 4, color: '#ef4444', probability: 70 },
      { name: 'Matriculado', order: 5, color: '#059669', probability: 100 },
    ],
  },
  inmobiliaria: {
    sector: 'inmobiliaria',
    nomenclature: { contacts: 'Clientes', companies: 'Inmobiliarias', deals: 'Propiedades' },
    iconPack: 'real_estate',
    pipelineStages: [
      { name: 'Prospecto', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Visita agendada', order: 2, color: '#8b5cf6', probability: 25 },
      { name: 'Oferta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Negociación', order: 4, color: '#f97316', probability: 70 },
      { name: 'Escrituras', order: 5, color: '#10b981', probability: 90 },
      { name: 'Cerrado', order: 6, color: '#059669', probability: 100 },
    ],
  },
  comercio: {
    sector: 'comercio',
    nomenclature: { contacts: 'Clientes', companies: 'Empresas', deals: 'Negocios' },
    iconPack: 'commerce',
    pipelineStages: [
      { name: 'Prospecto', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Contactado', order: 2, color: '#8b5cf6', probability: 25 },
      { name: 'Propuesta enviada', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Negociación', order: 4, color: '#f97316', probability: 75 },
      { name: 'Cerrado ganado', order: 5, color: '#059669', probability: 100 },
    ],
  },
  servicios: {
    sector: 'servicios',
    nomenclature: { contacts: 'Clientes', companies: 'Empresas', deals: 'Proyectos' },
    iconPack: 'services',
    pipelineStages: [
      { name: 'Lead', order: 1, color: '#6366f1', probability: 10 },
      { name: 'Diagnóstico', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Propuesta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Aprobación', order: 4, color: '#f97316', probability: 75 },
      { name: 'En ejecución', order: 5, color: '#10b981', probability: 90 },
      { name: 'Entregado', order: 6, color: '#059669', probability: 100 },
    ],
  },
  restaurante: {
    sector: 'restaurante',
    nomenclature: { contacts: 'Clientes', companies: 'Proveedores', deals: 'Reservas' },
    iconPack: 'restaurant',
    pipelineStages: [
      { name: 'Solicitud', order: 1, color: '#6366f1', probability: 20 },
      { name: 'Confirmada', order: 2, color: '#10b981', probability: 80 },
      { name: 'Completada', order: 3, color: '#059669', probability: 100 },
    ],
  },
  tecnologia: {
    sector: 'tecnologia',
    nomenclature: { contacts: 'Leads', companies: 'Empresas', deals: 'Oportunidades' },
    iconPack: 'tech',
    pipelineStages: [
      { name: 'MQL', order: 1, color: '#6366f1', probability: 10 },
      { name: 'SQL', order: 2, color: '#8b5cf6', probability: 25 },
      { name: 'Demo agendada', order: 3, color: '#f59e0b', probability: 40 },
      { name: 'Propuesta', order: 4, color: '#f97316', probability: 60 },
      { name: 'Negociación', order: 5, color: '#ef4444', probability: 80 },
      { name: 'Cerrado', order: 6, color: '#059669', probability: 100 },
    ],
  },
  construccion: {
    sector: 'construccion',
    nomenclature: { contacts: 'Clientes', companies: 'Contratistas', deals: 'Obras' },
    iconPack: 'construction',
    pipelineStages: [
      { name: 'Cotización', order: 1, color: '#6366f1', probability: 15 },
      { name: 'Visita técnica', order: 2, color: '#8b5cf6', probability: 30 },
      { name: 'Propuesta', order: 3, color: '#f59e0b', probability: 50 },
      { name: 'Contrato', order: 4, color: '#f97316', probability: 75 },
      { name: 'En obra', order: 5, color: '#10b981', probability: 90 },
      { name: 'Entregado', order: 6, color: '#059669', probability: 100 },
    ],
  },
}

export const SECTOR_KEYS = Object.keys(INDUSTRY_PRESETS) as Array<keyof typeof INDUSTRY_PRESETS>
