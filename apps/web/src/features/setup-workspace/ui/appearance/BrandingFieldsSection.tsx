import { useTranslation } from 'react-i18next'

import { Input } from '@/shared/ui/shadcn/input'
import { Label } from '@/shared/ui/shadcn/label'

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
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label className="text-xs text-muted-foreground">{t(`${s}.crmName`)}</Label>
        <Input
          className="mt-1.5 h-9 border-border text-sm"
          placeholder="Nexo Acme Corp"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">{t(`${s}.loginTagline`)}</Label>
        <Input
          className="mt-1.5 h-9 border-border text-sm"
          placeholder="Build. Grow. Scale."
          value={tagline}
          onChange={(e) => onTaglineChange(e.target.value)}
        />
      </div>
    </div>
  )
}
