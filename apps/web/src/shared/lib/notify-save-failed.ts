import { t } from 'i18next'
import { sileo } from 'sileo'

export function notifySaveFailed(error?: { message?: string }): void {
  sileo.error({ title: t('common.saveFailed'), description: error?.message })
}
