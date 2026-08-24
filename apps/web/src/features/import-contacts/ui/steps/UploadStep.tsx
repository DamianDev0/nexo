'use client'

import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { downloadCsv } from '@/shared/lib/download-csv'
import { FileDropzone } from '@/shared/ui/molecules/file-dropzone'
import { Button } from '@/shared/ui/shadcn/button'

import { IMPORT_ACCEPT, IMPORT_MAX_SIZE_MB } from '../../config/import-contacts.constants'
import { buildCsvTemplate, templateEntitiesSlug } from '../../lib/import-template'

interface UploadStepProps {
  readonly onFile: (file: File) => Promise<unknown>
  readonly isBusy: boolean
}

export function UploadStep({ onFile, isBusy }: Readonly<UploadStepProps>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')

  return (
    <div className="flex flex-col gap-4">
      <FileDropzone
        accept={IMPORT_ACCEPT}
        maxSizeMb={IMPORT_MAX_SIZE_MB}
        labels={{
          cta: t('contacts.import.upload.cta'),
          busy: t('contacts.import.upload.reading'),
          hint: t('contacts.import.upload.hint', { size: IMPORT_MAX_SIZE_MB }),
        }}
        onFile={onFile}
        isBusy={isBusy}
      />

      <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {t('contacts.import.upload.templateHint')}
        <Button
          variant="link"
          size="xs"
          className="h-auto p-0 text-xs"
          onClick={() =>
            downloadCsv(
              buildCsvTemplate(),
              t('contacts.import.upload.templateName', {
                entities: templateEntitiesSlug(terms.lowerPlural),
              }),
            )
          }
        >
          {t('contacts.import.upload.templateCta')}
        </Button>
      </span>
    </div>
  )
}
