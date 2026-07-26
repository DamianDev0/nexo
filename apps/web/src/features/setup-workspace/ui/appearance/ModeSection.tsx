import { THEME_MODE_OPTIONS } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { OptionTile } from '@/shared/ui/molecules/option-tile'
import { Label } from '@/shared/ui/shadcn/label'

import type { ThemeMode } from '../../model/appearance.types'

interface ModeSectionProps {
  readonly darkMode: ThemeMode
  readonly onDarkModeChange: (v: ThemeMode) => void
}

export function ModeSection({ darkMode, onDarkModeChange }: ModeSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-6">
      <Label className="text-xs text-muted-foreground">
        {t('onboarding.steps.appearance.colorMode')}
      </Label>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {THEME_MODE_OPTIONS.map((mode) => (
          <OptionTile
            key={mode}
            selected={darkMode === mode}
            onSelect={() => onDarkModeChange(mode)}
            className="p-2.5 text-center text-xs font-semibold capitalize"
          >
            {mode}
          </OptionTile>
        ))}
      </div>
    </div>
  )
}
