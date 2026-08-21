import { BuildingsIcon, CalendarCheckIcon, HandshakeIcon, UserIcon } from '@/shared/ui/icons'

import type { NomenclatureEntity, NomenclaturePreset, NomenclatureState } from '../model/types'

export const DEFAULT_NOMENCLATURE: NomenclatureState = {
  contact: { singular: 'Contacto', plural: 'Contactos' },
  company: { singular: 'Empresa', plural: 'Empresas' },
  deal: { singular: 'Negocio', plural: 'Negocios' },
  activity: { singular: 'Actividad', plural: 'Actividades' },
}

export const NOMENCLATURE_ENTITIES: ReadonlyArray<NomenclatureEntity> = [
  { key: 'contact', icon: UserIcon },
  { key: 'company', icon: BuildingsIcon },
  { key: 'deal', icon: HandshakeIcon },
  { key: 'activity', icon: CalendarCheckIcon },
]

export const SEED_NOMENCLATURES: ReadonlyArray<NomenclatureState> = [
  DEFAULT_NOMENCLATURE,
  {
    contact: { singular: 'Contact', plural: 'Contacts' },
    company: { singular: 'Company', plural: 'Companies' },
    deal: { singular: 'Deal', plural: 'Deals' },
    activity: { singular: 'Activity', plural: 'Activities' },
  },
]

export const NOMENCLATURE_PRESETS: Record<string, NomenclaturePreset> = {
  b2b: {
    label: 'B2B (Cuentas / Oportunidades)',
    icon: '/icons/3d/target.png',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Cuenta', plural: 'Cuentas' },
      deal: { singular: 'Oportunidad', plural: 'Oportunidades' },
      activity: { singular: 'Actividad', plural: 'Actividades' },
    },
  },
  realestate: {
    label: 'Inmobiliaria (Propietarios / Propiedades)',
    icon: '/icons/3d/key.png',
    values: {
      contact: { singular: 'Propietario', plural: 'Propietarios' },
      company: { singular: 'Inmobiliaria', plural: 'Inmobiliarias' },
      deal: { singular: 'Propiedad', plural: 'Propiedades' },
      activity: { singular: 'Visita', plural: 'Visitas' },
    },
  },
  saas: {
    label: 'SaaS (Leads / Negocios)',
    icon: '/icons/3d/bulb.png',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Empresa', plural: 'Empresas' },
      deal: { singular: 'Negocio', plural: 'Negocios' },
      activity: { singular: 'Tarea', plural: 'Tareas' },
    },
  },
}
