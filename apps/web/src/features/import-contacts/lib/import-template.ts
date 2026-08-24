import { normalizeText } from '@repo/shared-utils'

const TEMPLATE_HEADERS = [
  'Nombre',
  'Apellido',
  'Correo',
  'Celular',
  'WhatsApp',
  'Tipo documento',
  'Documento',
  'Cargo',
  'Ciudad',
  'Departamento',
  'Puntaje',
  'Etiquetas',
]

const TEMPLATE_SAMPLE = [
  'Valentina',
  'Restrepo',
  'valentina@empresa.co',
  '3004128890',
  '3004128890',
  'CC',
  '1020458731',
  'Directora Comercial',
  'Medellín',
  'Antioquia',
  '80',
  'VIP;Referido',
]

export function buildCsvTemplate(): string {
  return `${TEMPLATE_HEADERS.join(',')}\n${TEMPLATE_SAMPLE.join(',')}\n`
}

export function templateEntitiesSlug(entities: string): string {
  const slug = normalizeText(entities).replaceAll(/[^a-z0-9]+/g, '-')
  return slug.replaceAll(/^-|-$/g, '')
}
