'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/shared/ui/shadcn/popover'

import type { BulkActionError } from '@repo/shared-types'

type BulkErrorsPopoverProps = {
  readonly errors: ReadonlyArray<BulkActionError>
  readonly failed: number
}

export function BulkErrorsPopover({ errors, failed }: Readonly<BulkErrorsPopoverProps>) {
  const { t } = useTranslation()
  if (failed === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <PillButton variant="outline" size="xs">
          {t('bulkActions.errors.open', { count: failed })}
        </PillButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader>
          <PopoverTitle>{t('bulkActions.errors.title', { count: failed })}</PopoverTitle>
          <PopoverDescription>
            {t('bulkActions.errors.description', { shown: errors.length, count: failed })}
          </PopoverDescription>
        </PopoverHeader>
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto px-4 pb-3">
          {errors.map((error) => (
            <li key={error.id} className="flex flex-col">
              <Text variant="body">{error.message}</Text>
              <Text variant="faint" className="truncate font-mono">
                {error.id}
              </Text>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
