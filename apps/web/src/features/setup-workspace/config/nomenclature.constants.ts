import { BuildingsIcon, CalendarCheckIcon, HandshakeIcon, UserIcon } from '@/shared/ui/icons'

import type { NomenclatureEntity, NomenclaturePreset, NomenclatureState } from '../model/types'

export const DEFAULT_NOMENCLATURE: NomenclatureState = {
  contact: { singular: 'Contact', plural: 'Contacts' },
  company: { singular: 'Company', plural: 'Companies' },
  deal: { singular: 'Deal', plural: 'Deals' },
  activity: { singular: 'Activity', plural: 'Activities' },
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
    contact: { singular: 'Contacto', plural: 'Contactos' },
    company: { singular: 'Empresa', plural: 'Empresas' },
    deal: { singular: 'Negocio', plural: 'Negocios' },
    activity: { singular: 'Actividad', plural: 'Actividades' },
  },
]

export const NOMENCLATURE_PRESETS: Record<string, NomenclaturePreset> = {
  b2b: {
    label: 'B2B (Accounts / Opportunities)',
    icon: '/icons/3d/target.png',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Account', plural: 'Accounts' },
      deal: { singular: 'Opportunity', plural: 'Opportunities' },
      activity: { singular: 'Activity', plural: 'Activities' },
    },
  },
  realestate: {
    label: 'Real Estate (Owners / Properties)',
    icon: '/icons/3d/key.png',
    values: {
      contact: { singular: 'Owner', plural: 'Owners' },
      company: { singular: 'Property', plural: 'Properties' },
      deal: { singular: 'Listing', plural: 'Listings' },
      activity: { singular: 'Showing', plural: 'Showings' },
    },
  },
  saas: {
    label: 'SaaS (Leads / Deals)',
    icon: '/icons/3d/bulb.png',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Company', plural: 'Companies' },
      deal: { singular: 'Deal', plural: 'Deals' },
      activity: { singular: 'Task', plural: 'Tasks' },
    },
  },
}
