import { t } from 'i18next'
import { Check, CloudUpload } from 'lucide-react'
import { sileo } from 'sileo'

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
      icon: <CloudUpload className="size-3.5" />,
      description: <UploadToastContent fileName={file.name} fileSize={fileSize} status="loading" />,
    },
    success: {
      title: t('common.upload.uploaded'),
      icon: <Check className="size-3.5" />,
      description: <UploadToastContent fileName={file.name} fileSize={fileSize} status="success" />,
    },
    error: { title: t('common.upload.failed') },
  })
}
