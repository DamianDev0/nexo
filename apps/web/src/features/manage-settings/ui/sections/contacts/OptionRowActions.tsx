'use client'

import { useTranslation } from 'react-i18next'

import { CountHint } from '@/shared/ui/atoms/count-hint'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { LockIcon, PencilSimpleIcon, TrashIcon } from '@/shared/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/shadcn/tooltip'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

interface RemoveAction {
  readonly label: string
  readonly onRemove: (() => void) | null
  readonly lockedHint?: string
}

interface OptionRowActionsProps {
  readonly count: number
  readonly enabled: boolean
  readonly onToggle: (enabled: boolean) => void
  readonly onEdit: () => void
  readonly remove: RemoveAction
}

export function OptionRowActions({
  count,
  enabled,
  onToggle,
  onEdit,
  remove,
}: Readonly<OptionRowActionsProps>) {
  const { t } = useTranslation()

  return (
    <>
      <AnimatedToggle
        size="sm"
        checked={enabled}
        label={t('settings.taxonomy.toggle')}
        onChange={onToggle}
      />
      <CountHint count={count} label={t('settings.taxonomy.inUse', { count })} />
      <PillButton
        variant="ghost"
        size="xs"
        className="w-8 px-0 text-muted-foreground hover:text-primary"
        aria-label={t('common.edit')}
        onClick={onEdit}
      >
        <PencilSimpleIcon className="size-3.5" />
      </PillButton>
      {remove.onRemove ? (
        <PillButton
          variant="ghostDanger"
          size="xs"
          aria-label={remove.label}
          onClick={remove.onRemove}
        >
          <TrashIcon className="size-3.5" />
        </PillButton>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex size-8 items-center justify-center text-muted-foreground">
              <LockIcon className="size-3.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent>{remove.lockedHint}</TooltipContent>
        </Tooltip>
      )}
    </>
  )
}
