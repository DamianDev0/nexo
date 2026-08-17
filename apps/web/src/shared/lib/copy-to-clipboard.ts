import { t } from 'i18next'
import { sileo } from 'sileo'

export async function copyToClipboard(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    sileo.success({ title: t('common.copied') })
  } catch {
    sileo.error({ title: t('common.copyFailed') })
  }
}
