import { t } from 'i18next'
import { sileo } from 'sileo'

import { CheckIcon, CloudArrowUpIcon } from '@/shared/ui/icons'

import { formatFileSize } from './constants'
import { UploadToastContent } from './upload-toast-content'

export function notifyFileTooLarge(maxSizeMb: number, fileBytes: number): void {
  sileo.error({
    title: t('common.upload.fileTooLarge'),
    description: t('common.upload.fileTooLargeDesc', {
      max: maxSizeMb,
      size: formatFileSize(fileBytes),
    }),
  })
}

export function notifyUploadProgress(uploadPromise: Promise<unknown>, file: File): void {
  const fileSize = formatFileSize(file.size)

  sileo.promise(uploadPromise, {
    loading: {
      title: t('common.upload.uploading'),
      icon: <CloudArrowUpIcon className="size-3.5" />,
      description: <UploadToastContent fileName={file.name} fileSize={fileSize} status="loading" />,
    },
    success: {
      title: t('common.upload.uploaded'),
      icon: <CheckIcon className="size-3.5" />,
      description: <UploadToastContent fileName={file.name} fileSize={fileSize} status="success" />,
    },
    error: { title: t('common.upload.failed') },
  })
}
