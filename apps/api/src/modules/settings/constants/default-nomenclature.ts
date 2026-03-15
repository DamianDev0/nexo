import type { TenantNomenclature } from '../interfaces/nomenclature.interface'

export const DEFAULT_NOMENCLATURE: TenantNomenclature = {
  contact: { singular: 'Contacto', plural: 'Contactos' },
  company: { singular: 'Empresa', plural: 'Empresas' },
  deal: { singular: 'Negocio', plural: 'Negocios' },
  activity: { singular: 'Actividad', plural: 'Actividades' },
}
