'use client'

import { useTranslation } from 'react-i18next'

import { downloadCsv } from '@/shared/lib/download-csv'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { FileDropzone } from '@/shared/ui/molecules/file-dropzone'

import { IMPORT_ACCEPT, IMPORT_MAX_SIZE_MB } from '../../config/import.constants'
import { buildCsvTemplate, templateEntitiesSlug } from '../../lib/import-template'
import { useImportDescriptor } from '../../model/useImportDescriptor'

interface UploadStepProps {
  readonly onFile: (file: File) => Promise<unknown>
  readonly isBusy: boolean
}

export function UploadStep({ onFile, isBusy }: Readonly<UploadStepProps>) {
  const { t } = useTranslation()
  const { config, terms } = useImportDescriptor()

  return (
    <div className="flex flex-col gap-4">
      <FileDropzone
        accept={IMPORT_ACCEPT}
        maxSizeMb={IMPORT_MAX_SIZE_MB}
        labels={{
          cta: t('imports.upload.cta'),
          busy: t('imports.upload.reading'),
          hint: t('imports.upload.hint', { size: IMPORT_MAX_SIZE_MB }),
        }}
        onFile={onFile}
        isBusy={isBusy}
      />

      <Text variant="hint" className="flex items-center justify-center gap-1.5">
        {t('imports.upload.templateHint')}
        <PillButton
          variant="ghost"
          size="xs"
          className="h-auto p-0 text-xs font-medium text-primary-deep underline-offset-4 hover:bg-transparent hover:underline dark:text-primary"
          onClick={() =>
            downloadCsv(
              buildCsvTemplate(config.template),
              t('imports.upload.templateName', {
                entities: templateEntitiesSlug(terms.lowerPlural),
              }),
            )
          }
        >
          {t('imports.upload.templateCta')}
        </PillButton>
      </Text>
    </div>
  )
}
