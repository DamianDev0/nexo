'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { FileDropzone } from '@/shared/ui/molecules/file-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog'

import { IMPORT_ACCEPT, IMPORT_MAX_SIZE_MB } from '../../../config/header-import.constants'
import { includedRows } from '../../../lib/header-import'

import { ImportReviewRow } from './ImportReviewRow'

import type { HeaderImporter } from '../../../model/useHeaderImport'

export function ImportColumnsDialog({ importer }: Readonly<{ importer: HeaderImporter }>) {
  const { t } = useTranslation()
  const count = includedRows(importer.rows).length

  return (
    <Dialog open={importer.open} onOpenChange={importer.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('settings.fields.import.title')}</DialogTitle>
        </DialogHeader>

        {importer.step === 'upload' ? (
          <FileDropzone
            accept={IMPORT_ACCEPT}
            maxSizeMb={IMPORT_MAX_SIZE_MB}
            isBusy={importer.isAnalyzing}
            labels={{
              cta: t('settings.fields.import.dropCta'),
              busy: t('settings.fields.import.dropBusy'),
              hint: t('settings.fields.import.dropHint'),
            }}
            onFile={importer.upload}
          />
        ) : (
          <>
            <Text as="p" variant="hint">
              {t('settings.fields.import.reviewHint', { rows: importer.totalRows })}
            </Text>

            {importer.rows.length === 0 ? (
              <Text as="p" variant="muted">
                {t('settings.fields.import.emptyReview')}
              </Text>
            ) : (
              <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto pr-1">
                {importer.rows.map((row) => (
                  <ImportReviewRow key={row.column} row={row} onUpdate={importer.onUpdateRow} />
                ))}
              </div>
            )}

            <DialogActions>
              <PillButton variant="ghost" size="sm" onClick={() => importer.onOpenChange(false)}>
                {t('common.cancel')}
              </PillButton>
              <PillButton
                size="sm"
                disabled={count === 0 || importer.fieldsPending}
                onClick={importer.confirm}
              >
                {t('settings.fields.import.confirm', { count })}
              </PillButton>
            </DialogActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
