'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'

import { Input } from '@/components/atoms/input'
import { Button } from '@/components/atoms/button'
import settingsService from '@/core/services/settings.service'
import { WizardStep } from './WizardStep'

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

const PRESETS: Record<string, { label: string; values: NomenclatureState }> = {
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
} as const

const ENTITY_COLORS = {
  contact: '#4F46E5',
  company: '#0891B2',
  deal: '#059669',
  activity: '#D97706',
} as const

interface StepNomenclatureProps {
  readonly onNext: () => void
  readonly onBack: () => void
}

export function StepNomenclature({ onNext, onBack }: StepNomenclatureProps) {
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
    const preset = PRESETS[presetKey]
    if (preset) setNomen(preset.values)
  }, [])

  const handleSave = useCallback(() => save(), [save])

  return (
    <WizardStep
      badge="Step 3 of 6"
      title="What do you call your clients?"
      description="Customize entity names so the CRM speaks your language."
      onBack={onBack}
      onNext={handleSave}
      isPending={isPending}
      footerNote="You can change this anytime"
    >
      {/* Info banner */}
      <div className="mb-6 rounded-lg border border-primary/20 bg-accent p-3 text-xs text-foreground">
        For example, if you sell to companies you can call them "Accounts" instead of "Contacts", or
        "Opportunities" instead of "Deals".
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        <div />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Singular
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Plural
        </span>

        {(Object.keys(nomen) as Array<keyof NomenclatureState>).map((entity) => (
          <>
            <div key={`label-${entity}`} className="flex items-center gap-2">
              <div className="size-2 rounded-full" style={{ background: ENTITY_COLORS[entity] }} />
              <span className="text-xs font-semibold capitalize text-muted-foreground">
                {entity}
              </span>
            </div>
            <Input
              key={`singular-${entity}`}
              className="h-9 border-border text-sm"
              value={nomen[entity].singular}
              onChange={(e) => handleUpdate(entity, 'singular', e.target.value)}
            />
            <Input
              key={`plural-${entity}`}
              className="h-9 border-border text-sm"
              value={nomen[entity].plural}
              onChange={(e) => handleUpdate(entity, 'plural', e.target.value)}
            />
          </>
        ))}
      </div>

      {/* Presets */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handlePreset(key)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </WizardStep>
  )
}
