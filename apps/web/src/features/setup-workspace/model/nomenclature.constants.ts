export interface EntityLabels {
  singular: string
  plural: string
}

export interface NomenclatureState {
  contact: EntityLabels
  company: EntityLabels
  deal: EntityLabels
  activity: EntityLabels
}

export const DEFAULT_NOMENCLATURE: NomenclatureState = {
  contact: { singular: 'Contact', plural: 'Contacts' },
  company: { singular: 'Company', plural: 'Companies' },
  deal: { singular: 'Deal', plural: 'Deals' },
  activity: { singular: 'Activity', plural: 'Activities' },
}

const SEED_NOMENCLATURES: ReadonlyArray<NomenclatureState> = [
  DEFAULT_NOMENCLATURE,
  {
    contact: { singular: 'Contacto', plural: 'Contactos' },
    company: { singular: 'Empresa', plural: 'Empresas' },
    deal: { singular: 'Negocio', plural: 'Negocios' },
    activity: { singular: 'Actividad', plural: 'Actividades' },
  },
]

export function isSeedNomenclature(config: NomenclatureState): boolean {
  return SEED_NOMENCLATURES.some((seed) => JSON.stringify(seed) === JSON.stringify(config))
}

type TranslateFn = (key: string) => string | undefined

export function buildDefaultNomenclature(t: TranslateFn): NomenclatureState {
  const s = 'onboarding.steps.nomenclature.defaults'
  const tr = (key: string, fallback: string) => {
    const value = t(`${s}.${key}`)
    return value && value !== `${s}.${key}` ? value : fallback
  }
  return {
    contact: {
      singular: tr('contact', DEFAULT_NOMENCLATURE.contact.singular),
      plural: tr('contacts', DEFAULT_NOMENCLATURE.contact.plural),
    },
    company: {
      singular: tr('company', DEFAULT_NOMENCLATURE.company.singular),
      plural: tr('companies', DEFAULT_NOMENCLATURE.company.plural),
    },
    deal: {
      singular: tr('deal', DEFAULT_NOMENCLATURE.deal.singular),
      plural: tr('deals', DEFAULT_NOMENCLATURE.deal.plural),
    },
    activity: {
      singular: tr('activity', DEFAULT_NOMENCLATURE.activity.singular),
      plural: tr('activities', DEFAULT_NOMENCLATURE.activity.plural),
    },
  }
}

export const NOMENCLATURE_PRESETS: Record<
  string,
  { label: string; icon: string; values: NomenclatureState }
> = {
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
