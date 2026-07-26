import { useSetupWizard } from '../../model/wizard-context'
import { StepCompany } from '../StepCompany'

export function CompanyStep() {
  const { company } = useSetupWizard()

  return (
    <StepCompany
      data={{ phone: company.phone, website: company.website, sector: company.sector }}
      actions={{
        onPhoneChange: company.setPhone,
        onWebsiteChange: company.setWebsite,
        onSectorChange: company.setSector,
      }}
      nav={{ onNext: company.handleSave, isPending: company.isPending }}
    />
  )
}
