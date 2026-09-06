import { t } from 'i18next'
import { sileo } from 'sileo'

type SaveError = {
  readonly message?: string
  readonly errors?: ReadonlyArray<{ readonly message: string }>
}

function errorDetails(error?: SaveError): string | undefined {
  if (!error?.errors?.length) return error?.message
  return error.errors.map((entry) => entry.message).join('\n')
}

export function notifySaveFailed(error?: SaveError): void {
  sileo.error({ title: t('common.saveFailed'), description: errorDetails(error) })
}
