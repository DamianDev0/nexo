import { useState, useCallback } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import { useStepMutation } from './useStepMutation'

import type { EntityTerm, TenantNomenclature } from '@repo/shared-types'

const DEFAULT_NOMENCLATURE: TenantNomenclature = {
  contact: { singular: 'Contact', plural: 'Contacts' },
  company: { singular: 'Company', plural: 'Companies' },
  deal: { singular: 'Deal', plural: 'Deals' },
  activity: { singular: 'Activity', plural: 'Activities' },
}

export const NOMENCLATURE_PRESETS: Record<string, { label: string; values: TenantNomenclature }> = {
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

export function useStepNomenclature(onNext: () => void) {
  const [nomen, setNomen] = useState(DEFAULT_NOMENCLATURE)

  const { handleSave, isPending } = useStepMutation({
    mutationFn: () => settingsService.updateNomenclature(nomen),
    onNext,
  })

  const handleUpdate = useCallback(
    (entity: keyof TenantNomenclature, field: keyof EntityTerm, value: string) => {
      setNomen((prev) => ({ ...prev, [entity]: { ...prev[entity], [field]: value } }))
    },
    [],
  )

  const handlePreset = useCallback((presetKey: string) => {
    const preset = NOMENCLATURE_PRESETS[presetKey]
    if (preset) setNomen(preset.values)
  }, [])

  return { nomen, handleUpdate, handlePreset, handleSave, isPending }
}
