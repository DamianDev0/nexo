'use client'

import { t } from 'i18next'
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { sileo } from 'sileo'

import {
  useStepAppearance,
  useStepCompany,
  useStepNavigation,
  useStepNomenclature,
} from '@/features/setup-workspace'

import { useContactTaxonomySection } from './useContactTaxonomySection'

export interface SettingsSectionController {
  readonly handleSave: () => void
  readonly handleReset: () => void
  readonly isDirty: boolean
  readonly isPending: boolean
}

interface ManageSettingsContextValue {
  readonly company: ReturnType<typeof useStepCompany>
  readonly nomenclature: ReturnType<typeof useStepNomenclature>
  readonly navigation: ReturnType<typeof useStepNavigation>
  readonly appearance: ReturnType<typeof useStepAppearance>
  readonly contacts: ReturnType<typeof useContactTaxonomySection>
}

const ManageSettingsContext = createContext<ManageSettingsContextValue | null>(null)

export function ManageSettingsProvider({ children }: Readonly<{ children: ReactNode }>) {
  const onSaved = useCallback(() => {
    sileo.success({ title: t('settings.saved') })
  }, [])

  const company = useStepCompany(onSaved)
  const nomenclature = useStepNomenclature(onSaved)
  const navigation = useStepNavigation(onSaved)
  const appearance = useStepAppearance(onSaved)
  const contacts = useContactTaxonomySection(onSaved)

  const value = useMemo(
    () => ({ company, nomenclature, navigation, appearance, contacts }),
    [company, nomenclature, navigation, appearance, contacts],
  )

  return <ManageSettingsContext.Provider value={value}>{children}</ManageSettingsContext.Provider>
}

export function useManageSettings(): ManageSettingsContextValue {
  const ctx = useContext(ManageSettingsContext)
  if (!ctx) throw new Error('useManageSettings must be used within ManageSettingsProvider')
  return ctx
}
