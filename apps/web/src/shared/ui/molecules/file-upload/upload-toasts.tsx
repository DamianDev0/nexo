import { t } from 'i18next'
import { sileo } from 'sileo'

import { CheckIcon, CloudArrowUpIcon } from '@/shared/ui/icons'

import { formatFileSize } from './constants'
import { UploadToastContent } from './upload-toast-content'

export function uploadErrorMessage(err: unknown): string {
  if (typeof err === 'string' && err) return err
  if (typeof err === 'object' && err !== null) {
    const { message } = err as { message?: unknown }
    if (typeof message === 'string' && message) return message
  }
  return t('common.upload.failedUnknown')
}

export function notifyFileTooLarge(maxSizeMb: number, fileBytes: number): void {
  sileo.error({
    title: t('common.upload.fileTooLarge'),
    description: t('common.upload.fileTooLargeDesc', {
      max: maxSizeMb,
      size: formatFileSize(fileBytes),
    }),
  })
}

export async function notifyUploadProgress(
  uploadPromise: Promise<unknown>,
  file: File,
): Promise<void> {
  const fileSize = formatFileSize(file.size)

  try {
    await sileo.promise(uploadPromise, {
      loading: {
        title: t('common.upload.uploading'),
        icon: <CloudArrowUpIcon className="size-3.5" />,
        description: (
          <UploadToastContent fileName={file.name} fileSize={fileSize} status="loading" />
        ),
      },
      success: {
        title: t('common.upload.uploaded'),
        icon: <CheckIcon className="size-3.5" />,
        description: (
          <UploadToastContent fileName={file.name} fileSize={fileSize} status="success" />
        ),
      },
      error: (err) => ({
        title: t('common.upload.failed'),
        description: uploadErrorMessage(err),
      }),
    })
  } catch {
    return
  }
}
