import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import settingsService from '@/core/services/settings.service'

interface EntityLabels {
  singular: string
  plural: string
}

interface NomenclatureState {
  contact: EntityLabels
  company: EntityLabels
  deal: EntityLabels
  activity: EntityLabels
}

const DEFAULT_NOMENCLATURE: NomenclatureState = {
  contact: { singular: 'Contact', plural: 'Contacts' },
  company: { singular: 'Company', plural: 'Companies' },
  deal: { singular: 'Deal', plural: 'Deals' },
  activity: { singular: 'Activity', plural: 'Activities' },
}

export type { NomenclatureState }

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

export function useStepNomenclature(onNext: () => void) {
  const [nomen, setNomen] = useState(DEFAULT_NOMENCLATURE)

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => settingsService.updateNomenclature(nomen),
    onSuccess: () => onNext(),
    onError: (err) => sileo.error({ title: 'Failed to save', description: err.message }),
  })

  const handleUpdate = useCallback(
    (entity: keyof NomenclatureState, field: 'singular' | 'plural', value: string) => {
      setNomen((prev) => ({ ...prev, [entity]: { ...prev[entity], [field]: value } }))
    },
    [],
  )

  const handlePreset = useCallback((presetKey: string) => {
    const preset = NOMENCLATURE_PRESETS[presetKey]
    if (preset) setNomen(preset.values)
  }, [])

  const handleSave = useCallback(() => save(), [save])

  return { nomen, handleUpdate, handlePreset, handleSave, isPending }
}
