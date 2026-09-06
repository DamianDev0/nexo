'use client'

import { Trans, useTranslation } from 'react-i18next'

import { BULK_CHOICE_PARAM_KEY } from '../config/bulk-choice.constants'
import { useBulkChoiceOptions } from '../model/useBulkChoiceOptions'

import { BulkChoiceDialog } from './BulkChoiceDialog'

import type { BulkChoiceKind } from '../model/types/bulk-actions.types'

type BulkChoiceDialogsProps = {
  readonly kind: BulkChoiceKind
  readonly count: number
  readonly onSubmit: (kind: BulkChoiceKind, params: Record<string, unknown>) => void
  readonly onClose: () => void
}

export function BulkChoiceDialogs({
  kind,
  count,
  onSubmit,
  onClose,
}: Readonly<BulkChoiceDialogsProps>) {
  const { t } = useTranslation()
  const options = useBulkChoiceOptions(kind)
  const base = `contacts.bulk.dialogs.${kind}`

  return (
    <BulkChoiceDialog
      copy={{
        title: t(`${base}.title`),
        description: (
          <Trans i18nKey={`${base}.description`} count={count} components={{ b: <strong /> }} />
        ),
        field: t(`${base}.field`),
        placeholder: t(`${base}.placeholder`),
        searchPlaceholder: t(`${base}.search`),
        empty: t('common.noResults'),
        confirm: t(`${base}.confirm`),
      }}
      options={options}
      onConfirm={(value) => onSubmit(kind, { [BULK_CHOICE_PARAM_KEY[kind]]: value })}
      onClose={onClose}
    />
  )
}
