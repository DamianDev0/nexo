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

export const NOMENCLATURE_PRESETS: Record<string, { label: string; values: NomenclatureState }> = {
  b2b: {
    label: '🏢 B2B (Accounts / Opportunities)',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Account', plural: 'Accounts' },
      deal: { singular: 'Opportunity', plural: 'Opportunities' },
      activity: { singular: 'Activity', plural: 'Activities' },
    },
  },
  realestate: {
    label: '🏠 Real Estate (Owners / Properties)',
    values: {
      contact: { singular: 'Owner', plural: 'Owners' },
      company: { singular: 'Property', plural: 'Properties' },
      deal: { singular: 'Listing', plural: 'Listings' },
      activity: { singular: 'Showing', plural: 'Showings' },
    },
  },
  saas: {
    label: '💡 SaaS (Leads / Deals)',
    values: {
      contact: { singular: 'Lead', plural: 'Leads' },
      company: { singular: 'Company', plural: 'Companies' },
      deal: { singular: 'Deal', plural: 'Deals' },
      activity: { singular: 'Task', plural: 'Tasks' },
    },
  },
}
