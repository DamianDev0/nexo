import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

interface BrandingFieldsSectionProps {
  readonly productName: string
  readonly tagline: string
  readonly onProductNameChange: (v: string) => void
  readonly onTaglineChange: (v: string) => void
}

export function BrandingFieldsSection({
  productName,
  tagline,
  onProductNameChange,
  onTaglineChange,
}: Readonly<BrandingFieldsSectionProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.appearance'

  return (
    <div className="grid grid-cols-2 gap-4 px-4 py-4">
      <div>
        <FieldLabel variant="section">{t(`${s}.crmName`)}</FieldLabel>
        <Input
          className="mt-1.5 h-9 text-sm"
          placeholder="Nexo Acme Corp"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel variant="section">{t(`${s}.loginTagline`)}</FieldLabel>
        <Input
          className="mt-1.5 h-9 text-sm"
          placeholder="Build. Grow. Scale."
          value={tagline}
          onChange={(e) => onTaglineChange(e.target.value)}
        />
      </div>
    </div>
  )
}
