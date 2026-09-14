'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { CheckIcon } from '@/shared/ui/icons'

import type { MergeRow } from '../lib/merge-fields'

type MergeFieldRowProps = {
  readonly row: MergeRow
  readonly takesLoser: boolean
  readonly onToggle: () => void
}

const CELL =
  'h-auto min-w-0 flex-1 justify-between gap-2 rounded-lg border px-3 py-2 text-left font-normal'
const PICKED = 'border-primary bg-primary-pale text-foreground'
const IDLE = 'border-border bg-card text-muted-foreground hover:border-border-strong'

export function MergeFieldRow({ row, takesLoser, onToggle }: Readonly<MergeFieldRowProps>) {
  const { t } = useTranslation()
  const empty = t('contacts.merge.emptyValue')

  return (
    <div className="flex flex-col gap-1.5">
      <Text variant="kicker">{t(`contacts.merge.fields.${row.field}`)}</Text>
      <div className="flex items-stretch gap-2">
        <PillButton
          variant="ghost"
          size="sm"
          aria-pressed={!takesLoser}
          onClick={onToggle}
          className={cn(CELL, takesLoser ? IDLE : PICKED)}
        >
          <span className="min-w-0 flex-1 truncate">{row.winner ?? empty}</span>
          {takesLoser ? null : <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />}
        </PillButton>
        <PillButton
          variant="ghost"
          size="sm"
          aria-pressed={takesLoser}
          onClick={onToggle}
          className={cn(CELL, takesLoser ? PICKED : IDLE)}
        >
          <span className="min-w-0 flex-1 truncate">{row.loser ?? empty}</span>
          {takesLoser ? <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" /> : null}
        </PillButton>
      </div>
    </div>
  )
}
