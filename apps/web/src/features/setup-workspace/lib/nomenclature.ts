import { DEFAULT_NOMENCLATURE, SEED_NOMENCLATURES } from '../config/nomenclature.constants'

import type { NomenclatureState } from '../model/types'

type TranslateFn = (key: string) => string | undefined

export function isSeedNomenclature(config: NomenclatureState): boolean {
  return SEED_NOMENCLATURES.some((seed) => JSON.stringify(seed) === JSON.stringify(config))
}

export function buildDefaultNomenclature(t: TranslateFn): NomenclatureState {
  const scope = 'onboarding.steps.nomenclature.defaults'
  const tr = (key: string, fallback: string) => {
    const value = t(`${scope}.${key}`)
    return value && value !== `${scope}.${key}` ? value : fallback
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
