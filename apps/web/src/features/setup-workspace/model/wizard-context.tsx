'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { useOnboardingWizard } from './useOnboardingWizard'
import { useStepAppearance } from './useStepAppearance'
import { useStepCompany } from './useStepCompany'
import { useStepNavigation } from './useStepNavigation'
import { useStepNomenclature } from './useStepNomenclature'
import { useStepPipeline } from './useStepPipeline'
import { useStepTeam } from './useStepTeam'

interface SetupWizardContextValue {
  readonly wizard: ReturnType<typeof useOnboardingWizard>
  readonly company: ReturnType<typeof useStepCompany>
  readonly pipeline: ReturnType<typeof useStepPipeline>
  readonly nomenclature: ReturnType<typeof useStepNomenclature>
  readonly navigation: ReturnType<typeof useStepNavigation>
  readonly appearance: ReturnType<typeof useStepAppearance>
  readonly team: ReturnType<typeof useStepTeam>
}

const SetupWizardContext = createContext<SetupWizardContextValue | null>(null)

export function SetupWizardProvider({ children }: Readonly<{ children: ReactNode }>) {
  const wizard = useOnboardingWizard()
  const company = useStepCompany(wizard.nextStep)
  const pipeline = useStepPipeline(wizard.nextStep)
  const nomenclature = useStepNomenclature(wizard.nextStep)
  const navigation = useStepNavigation(wizard.nextStep)
  const appearance = useStepAppearance(wizard.nextStep)
  const team = useStepTeam(wizard.nextStep)

  const value = useMemo(
    () => ({ wizard, company, pipeline, nomenclature, navigation, appearance, team }),
    [wizard, company, pipeline, nomenclature, navigation, appearance, team],
  )

  return <SetupWizardContext.Provider value={value}>{children}</SetupWizardContext.Provider>
}

export function useSetupWizard(): SetupWizardContextValue {
  const ctx = useContext(SetupWizardContext)
  if (!ctx) throw new Error('useSetupWizard must be used within SetupWizardProvider')
  return ctx
}
