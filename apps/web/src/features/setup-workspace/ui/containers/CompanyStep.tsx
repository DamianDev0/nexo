'use client'

import { useWatch } from 'react-hook-form'

import { useSetupWizard } from '../../model/wizard-context'
import { StepCompany } from '../StepCompany'

export function CompanyStep() {
  const { company } = useSetupWizard()
  const { control, bindField } = company
  const phone = useWatch({ control, name: 'phone' })
  const website = useWatch({ control, name: 'website' })
  const sector = useWatch({ control, name: 'sector' })

  return (
    <StepCompany
      data={{ phone, website, sector }}
      actions={{
        onPhoneChange: bindField('phone'),
        onWebsiteChange: bindField('website'),
        onSectorChange: bindField('sector'),
      }}
      nav={{ onNext: company.handleSave, isPending: company.isPending }}
    />
  )
}
